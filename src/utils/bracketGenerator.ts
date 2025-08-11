import { nanoid } from 'nanoid';
import type { Dupla, Match, BracketState, Categoria } from '@/types';

/**
 * Bracket generation utilities for tournament management
 * Supports single elimination, double elimination, and consolation formats
 * Includes play-in support for non-power-of-2 team counts
 */

/**
 * Calculate if a number is a power of 2
 */
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Calculate play-in requirements for non-power-of-2 team counts
 */
function calculatePlayInRequirements(numDuplas: number) {
  if (isPowerOfTwo(numDuplas)) {
    return { needsPlayIn: false, playInMatches: 0, powerOfTwo: numDuplas };
  }
  
  const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(numDuplas)));
  const playInMatches = numDuplas - powerOfTwo / 2;
  
  return {
    needsPlayIn: true,
    playInMatches,
    powerOfTwo,
    teamsInPlayIn: playInMatches * 2,
    teamsWithBye: numDuplas - playInMatches * 2
  };
}

/**
 * Generate play-in matches for non-power-of-2 brackets
 */
function generatePlayInMatches(
  duplas: Dupla[],
  categoriaId: string,
  playInInfo: ReturnType<typeof calculatePlayInRequirements>
): { matches: Match[]; playInParticipants: string[]; byeTeams: string[] } {
  if (!playInInfo.needsPlayIn) {
    return { matches: [], playInParticipants: [], byeTeams: duplas.map(d => d.id) };
  }

  const shuffledDuplas = [...duplas];
  
  // Shuffle for random seeding
  for (let i = shuffledDuplas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDuplas[i], shuffledDuplas[j]] = [shuffledDuplas[j]!, shuffledDuplas[i]!];
  }

  // Lower seeds go to play-in, higher seeds get bye
  const playInParticipants = shuffledDuplas.slice(-playInInfo.teamsInPlayIn!);
  const byeTeams = shuffledDuplas.slice(0, playInInfo.teamsWithBye!);

  const matches: Match[] = [];
  
  for (let i = 0; i < playInInfo.playInMatches; i++) {
    const duplaA = playInParticipants[i * 2];
    const duplaB = playInParticipants[i * 2 + 1];
    
    if (duplaA && duplaB) {
      matches.push({
        id: `playin_${nanoid()}`,
        categoriaId,
        fase: 'PI',
        round: 0, // Play-in is round 0
        a: duplaA.id,
        b: duplaB.id,
        aSource: { type: 'direct' },
        bSource: { type: 'direct' },
        bestOf: 1,
        winsToAdvance: 1,
        status: 'pendente'
      });
    }
  }

  return {
    matches,
    playInParticipants: playInParticipants.map(d => d.id),
    byeTeams: byeTeams.map(d => d.id)
  };
}

/**
 * Generate single elimination bracket
 */
function generateSingleEliminationBracket(
  duplas: Dupla[],
  categoriaId: string,
  categoria: Categoria
): BracketState {
  const matches: Match[] = [];
  const playInInfo = calculatePlayInRequirements(duplas.length);
  
  // Generate play-in matches if needed
  const { matches: playInMatches, byeTeams } = generatePlayInMatches(duplas, categoriaId, playInInfo);
  matches.push(...playInMatches);

  // Calculate bracket structure
  const effectiveTeams = playInInfo.needsPlayIn ? playInInfo.powerOfTwo / 2 : duplas.length;
  const totalRounds = Math.ceil(Math.log2(effectiveTeams));
  
  // Generate first round matches (after play-in)
  const firstRoundMatches = Math.floor(effectiveTeams / 2);
  const firstRoundMatchIds: string[] = [];
  
  for (let i = 0; i < firstRoundMatches; i++) {
    const matchId = `match_${nanoid()}`;
    firstRoundMatchIds.push(matchId);
    
    let duplaA: string | undefined;
    let duplaB: string | undefined;
    let aSource: Match['aSource'];
    let bSource: Match['bSource'];
    
    if (playInInfo.needsPlayIn) {
      // Mix bye teams with play-in winners
      if (i < byeTeams.length / 2) {
        duplaA = byeTeams[i * 2];
        duplaB = byeTeams[i * 2 + 1];
        aSource = { type: 'direct' };
        bSource = { type: 'direct' };
      } else {
        // Reference play-in matches
        const playInIndex = i - Math.floor(byeTeams.length / 2);
        const playInMatch1 = playInMatches[playInIndex];
        const playInMatch2 = playInMatches[playInIndex + 1];
        if (playInMatch1) {
          aSource = { type: 'winner', matchId: playInMatch1.id };
        }
        if (playInMatch2) {
          bSource = { type: 'winner', matchId: playInMatch2.id };
        }
      }
    } else {
      // Direct assignment for power-of-2 brackets
      duplaA = duplas[i * 2]?.id;
      duplaB = duplas[i * 2 + 1]?.id;
      aSource = { type: 'direct' };
      bSource = { type: 'direct' };
    }
    
    if (duplaA && duplaB && aSource && bSource) {
      matches.push({
        id: matchId,
        categoriaId,
        fase: 'WB',
        round: 1,
        a: duplaA,
        b: duplaB,
        aSource,
        bSource,
        bestOf: 1,
        winsToAdvance: 1,
        status: 'pendente'
      });
    }
  }
  
  // Generate subsequent rounds
  let currentRoundMatchIds = firstRoundMatchIds;
  for (let round = 2; round <= totalRounds; round++) {
    const nextRoundMatchIds: string[] = [];
    const matchesInRound = Math.ceil(currentRoundMatchIds.length / 2);
    
    for (let i = 0; i < matchesInRound; i++) {
      const matchId = `match_${nanoid()}`;
      nextRoundMatchIds.push(matchId);
      
      // Determine fase based on round
      let fase: Match['fase'] = 'WB';
      if (round === totalRounds) fase = 'F'; // Final
      else if (round === totalRounds - 1) fase = 'SF'; // Semifinal
      
      // Determine bestOf based on fase and categoria settings
      let bestOf: 1 | 3 = 1;
      if (fase === 'F') {
        bestOf = (categoria.bestOfFinal as 1 | 3) || 1;
      } else if (fase === 'SF') {
        bestOf = (categoria.bestOfSF as 1 | 3) || 1;
      }
      
      const prevMatch1Id = currentRoundMatchIds[i * 2];
      const prevMatch2Id = currentRoundMatchIds[i * 2 + 1];
      
      const newMatch: Match = {
        id: matchId,
        categoriaId,
        fase,
        round,
        aSource: prevMatch1Id ? { type: 'winner', matchId: prevMatch1Id } : { type: 'direct' },
        bSource: prevMatch2Id ? { type: 'winner', matchId: prevMatch2Id } : { type: 'direct' },
        bestOf,
        winsToAdvance: Math.ceil(bestOf / 2),
        status: 'pendente'
      };
      
      matches.push(newMatch);
    }
    
    // Link previous round matches to next round
    for (let i = 0; i < currentRoundMatchIds.length; i += 2) {
      const match1Id = currentRoundMatchIds[i];
      const match2Id = currentRoundMatchIds[i + 1];
      const nextMatchId = nextRoundMatchIds[Math.floor(i / 2)];
      
      if (match1Id && nextMatchId) {
        const match1Index = matches.findIndex(m => m.id === match1Id);
        if (match1Index !== -1) {
          matches[match1Index] = {
            ...matches[match1Index],
            nextMatchId,
            nextMatchSlot: 1
          } as Match;
        }
      }
      
      if (match2Id && nextMatchId) {
        const match2Index = matches.findIndex(m => m.id === match2Id);
        if (match2Index !== -1) {
          matches[match2Index] = {
            ...matches[match2Index],
            nextMatchId,
            nextMatchSlot: 2
          } as Match;
        }
      }
    }
    
    currentRoundMatchIds = nextRoundMatchIds;
  }

  return {
    status: 'gerado',
    matches,
    roundAtual: playInInfo.needsPlayIn ? 0 : 1, // Start with play-in if needed
    configuracao: {
      sorteioInicialSeed: Date.now()
    }
  };
}

/**
 * Generate consolation bracket (V/P format)
 */
function generateConsolationBracket(
  duplas: Dupla[],
  categoriaId: string,
  categoria: Categoria
): BracketState {
  const matches: Match[] = [];
  const playInInfo = calculatePlayInRequirements(duplas.length);
  
  // Generate play-in matches if needed
  const { matches: playInMatches, byeTeams } = generatePlayInMatches(duplas, categoriaId, playInInfo);
  matches.push(...playInMatches);

  // For consolation format:
  // 1. WB (Winner Bracket) is single-elimination until Final (no reset)
  // 2. LB (Loser Bracket) receives losers from WB early stages (consolation only)
  // 3. 3rd place is always P(semifinal A) x P(semifinal B)

  // Generate WB (main bracket) - same as single elimination but track losers
  const effectiveTeams = playInInfo.needsPlayIn ? playInInfo.powerOfTwo / 2 : duplas.length;
  const wbRounds = Math.ceil(Math.log2(effectiveTeams));
  
  // Generate WB first round
  const wbFirstRoundMatches = Math.floor(effectiveTeams / 2);
  const wbFirstRoundMatchIds: string[] = [];
  
  for (let i = 0; i < wbFirstRoundMatches; i++) {
    const matchId = `wb_${nanoid()}`;
    wbFirstRoundMatchIds.push(matchId);
    
    let duplaA: string | undefined;
    let duplaB: string | undefined;
    let aSource: Match['aSource'];
    let bSource: Match['bSource'];
    
    if (playInInfo.needsPlayIn) {
      // Mix bye teams with play-in winners
      if (i < byeTeams.length / 2) {
        duplaA = byeTeams[i * 2];
        duplaB = byeTeams[i * 2 + 1];
        aSource = { type: 'direct' };
        bSource = { type: 'direct' };
      } else {
        const playInIndex = i - Math.floor(byeTeams.length / 2);
        const playInMatch1 = playInMatches[playInIndex];
        const playInMatch2 = playInMatches[playInIndex + 1];
        if (playInMatch1) {
          aSource = { type: 'winner', matchId: playInMatch1.id };
        }
        if (playInMatch2) {
          bSource = { type: 'winner', matchId: playInMatch2.id };
        }
      }
    } else {
      duplaA = duplas[i * 2]?.id;
      duplaB = duplas[i * 2 + 1]?.id;
      aSource = { type: 'direct' };
      bSource = { type: 'direct' };
    }
    
    if (duplaA && duplaB && aSource && bSource) {
      matches.push({
        id: matchId,
        categoriaId,
        fase: 'WB',
        round: 1,
        a: duplaA,
        b: duplaB,
        aSource,
        bSource,
        bestOf: 1,
        winsToAdvance: 1,
        status: 'pendente'
      });
    }
  }
  
  // Generate WB subsequent rounds
  let currentWBMatchIds = wbFirstRoundMatchIds;
  for (let round = 2; round <= wbRounds; round++) {
    const nextRoundMatchIds: string[] = [];
    const matchesInRound = Math.ceil(currentWBMatchIds.length / 2);
    
    for (let i = 0; i < matchesInRound; i++) {
      const matchId = `wb_${nanoid()}`;
      nextRoundMatchIds.push(matchId);
      
      let fase: Match['fase'] = 'WB';
      if (round === wbRounds) fase = 'F'; // Final
      else if (round === wbRounds - 1) fase = 'SF'; // Semifinal
      
      let bestOf: 1 | 3 = 1;
      if (fase === 'F') {
        bestOf = (categoria.bestOfFinal as 1 | 3) || 1;
      } else if (fase === 'SF') {
        bestOf = (categoria.bestOfSF as 1 | 3) || 1;
      }
      
      const prevMatch1Id = currentWBMatchIds[i * 2];
      const prevMatch2Id = currentWBMatchIds[i * 2 + 1];
      
      matches.push({
        id: matchId,
        categoriaId,
        fase,
        round,
        aSource: prevMatch1Id ? { type: 'winner', matchId: prevMatch1Id } : { type: 'direct' },
        bSource: prevMatch2Id ? { type: 'winner', matchId: prevMatch2Id } : { type: 'direct' },
        bestOf,
        winsToAdvance: Math.ceil(bestOf / 2),
        status: 'pendente'
      });
    }
    
    // Link WB matches
    for (let i = 0; i < currentWBMatchIds.length; i += 2) {
      const match1Id = currentWBMatchIds[i];
      const match2Id = currentWBMatchIds[i + 1];
      const nextMatchId = nextRoundMatchIds[Math.floor(i / 2)];
      
      if (match1Id && nextMatchId) {
        const match1Index = matches.findIndex(m => m.id === match1Id);
        if (match1Index !== -1) {
          matches[match1Index] = {
            ...matches[match1Index],
            nextMatchId,
            nextMatchSlot: 1
          } as Match;
        }
      }
      
      if (match2Id && nextMatchId) {
        const match2Index = matches.findIndex(m => m.id === match2Id);
        if (match2Index !== -1) {
          matches[match2Index] = {
            ...matches[match2Index],
            nextMatchId,
            nextMatchSlot: 2
          } as Match;
        }
      }
    }
    
    currentWBMatchIds = nextRoundMatchIds;
  }

  // Generate LB (Loser Bracket) - consolation matches
  // LB receives losers from WB first rounds only (not semifinals)
  const lbMatches: Match[] = [];
  const wbFirstRoundLosers = wbFirstRoundMatchIds;
  
  if (wbFirstRoundLosers.length > 1) {
    // Generate LB bracket for first round losers
    let lbCurrentMatches = wbFirstRoundLosers;
    let lbRound = 1;
    
    while (lbCurrentMatches.length > 1) {
      const nextLBMatches: string[] = [];
      const lbMatchesInRound = Math.floor(lbCurrentMatches.length / 2);
      
      for (let i = 0; i < lbMatchesInRound; i++) {
        const matchId = `lb_${nanoid()}`;
        nextLBMatches.push(matchId);
        
        const sourceMatch1 = lbCurrentMatches[i * 2];
        const sourceMatch2 = lbCurrentMatches[i * 2 + 1];
        
        if (sourceMatch1 && sourceMatch2) {
          lbMatches.push({
            id: matchId,
            categoriaId,
            fase: 'LB',
            round: lbRound,
            aSource: { type: 'loser', matchId: sourceMatch1 },
            bSource: { type: 'loser', matchId: sourceMatch2 },
            bestOf: 1,
            winsToAdvance: 1,
            status: 'pendente'
          });
        }
      }
      
      lbCurrentMatches = nextLBMatches;
      lbRound++;
    }
  }
  
  matches.push(...lbMatches);

  // Generate 3rd place match (P(semifinal A) x P(semifinal B))
  const semifinals = matches.filter(m => m.fase === 'SF');
  if (semifinals.length === 2 && semifinals[0] && semifinals[1]) {
    matches.push({
      id: `third_${nanoid()}`,
      categoriaId,
      fase: '3P',
      round: wbRounds, // Same round as final
      aSource: { type: 'loser', matchId: semifinals[0].id },
      bSource: { type: 'loser', matchId: semifinals[1].id },
      bestOf: (categoria.bestOfSF as 1 | 3) || 1,
      winsToAdvance: Math.ceil(((categoria.bestOfSF as 1 | 3) || 1) / 2),
      status: 'pendente'
    });
  }

  return {
    status: 'gerado',
    matches,
    roundAtual: playInInfo.needsPlayIn ? 0 : 1,
    configuracao: {
      sorteioInicialSeed: Date.now()
    }
  };
}

/**
 * Main bracket generation function
 */
export function generateBracket(
  duplas: Dupla[],
  categoriaId: string,
  categoria: Categoria
): BracketState {
  if (duplas.length < 4) {
    throw new Error('São necessárias pelo menos 4 duplas para gerar o chaveamento.');
  }

  switch (categoria.formato) {
    case 'single':
      return generateSingleEliminationBracket(duplas, categoriaId, categoria);
    
    case 'consolation':
      return generateConsolationBracket(duplas, categoriaId, categoria);
    
    case 'double':
      // For now, use single elimination as base - double elimination would be more complex
      // TODO: Implement full double elimination bracket
      return generateSingleEliminationBracket(duplas, categoriaId, categoria);
    
    default:
      throw new Error(`Formato de torneio não suportado: ${categoria.formato}`);
  }
}