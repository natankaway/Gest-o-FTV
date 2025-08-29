import React, { useState, useCallback, useMemo, useLayoutEffect, useRef, Fragment } from 'react';
import { useAppState } from '@/contexts';
import { Target, Shuffle, Play, Edit } from 'lucide-react';
import { torneioStateUtils } from '@/utils/torneioStateUtils';
import toast from 'react-hot-toast';
import type { Torneio, Match, BracketState, Dupla } from '@/types';


interface ChaveamentoViewProps {
  torneio: Torneio;
  onUpdateTorneio: (torneio: Torneio) => void;
  selectedCategoria: string | null;
  onSelectCategoria: (categoriaId: string | null) => void;
  canEdit: boolean;
}

interface MatchResultFormData {
  sets: Array<{placarA: string, placarB: string}>;
  currentSetIndex: number;
}

// =================================================================
// Componente para renderizar um card de partida individual
// =================================================================
const MatchCard = React.forwardRef<HTMLDivElement, { 
    match: Match; 
    allMatches: Match[];
    getDupla: (id: string) => Dupla | undefined; 
    onEdit: (match: Match) => void; 
    canEdit: boolean 
}>(
  ({ match, allMatches, getDupla, onEdit, canEdit }, ref) => {

    // --- NOVA LÓGICA PARA RENDERIZAR NOMES E PLACEHOLDERS ---
   const renderParticipant = (participantId?: string | null) => {
  if (!participantId) return 'A definir';

  if (participantId.includes('_loser')) {
    const sourceMatchId = participantId.replace('_loser', '');
    const sourceMatch = allMatches.find(m => m.id === sourceMatchId);
    
    if (sourceMatch && sourceMatch.perdedor) {
      // Buscar a dupla perdedora e mostrar o nome
      const dupla = getDupla(sourceMatch.perdedor);
      if (dupla) {
        return <span className="text-sm text-gray-600 dark:text-gray-400">{dupla.nome || `${dupla.jogadores[0].nome} / ${dupla.jogadores[1].nome}`}</span>;
      }
      return <span className="text-sm text-gray-400">Perdedor P. {sourceMatch.matchNumber}</span>;
    }
    
    return <span className="text-sm text-gray-400 italic">Perdedor P. {sourceMatch?.matchNumber}</span>;
  }

  if (participantId.startsWith('match_')) {
    const sourceMatch = allMatches.find(m => m.id === participantId);
    
    if (sourceMatch && sourceMatch.vencedor) {
      // Buscar a dupla vencedora e mostrar o nome
      const dupla = getDupla(sourceMatch.vencedor);
      if (dupla) {
        return <span className="text-sm text-gray-600 dark:text-gray-400">{dupla.nome || `${dupla.jogadores[0].nome} / ${dupla.jogadores[1].nome}`}</span>;
      }
      return <span className="text-sm text-gray-400">Vencedor P. {sourceMatch.matchNumber}</span>;
    }
    
    return <span className="text-sm text-gray-400 italic">Vencedor P. {sourceMatch?.matchNumber}</span>;
  }

  const dupla = getDupla(participantId);
  if (!dupla) return 'Dupla não encontrada';
  
  return <span className="truncate" title={dupla.nome || `${dupla.jogadores[0].nome} / ${dupla.jogadores[1].nome}`}>{dupla.nome || `${dupla.jogadores[0].nome} / ${dupla.jogadores[1].nome}`}</span>;
};
 const isParticipantReady = (participantId?: string | null) => {
      if (!participantId) return false;
      
      // Se é um ID direto de dupla
      if (!participantId.startsWith('match_') && !participantId.includes('_loser')) {
        return getDupla(participantId) !== undefined;
      }
      
      // Se é um perdedor de partida anterior
      if (participantId.includes('_loser')) {
        const sourceMatchId = participantId.replace('_loser', '');
        const sourceMatch = allMatches.find(m => m.id === sourceMatchId);
        return sourceMatch && sourceMatch.perdedor; // Só está pronto se já tem perdedor definido
      }
      
      // Se é um vencedor de partida anterior
      if (participantId.startsWith('match_')) {
        const sourceMatch = allMatches.find(m => m.id === participantId);
        return sourceMatch && sourceMatch.vencedor; // Só está pronto se já tem vencedor definido
      }
      
      return false;
    };
	
	

 const duplaA = match.a ? getDupla(match.a) : null;
    const duplaB = match.b ? getDupla(match.b) : null;
    
    const vencedorA = match.vencedor && match.vencedor === match.a;
    const vencedorB = match.vencedor && match.vencedor === match.b;

    return (
      <div ref={ref} id={`match-card-${match.id}`} className="bg-white dark:bg-gray-800 rounded-md shadow border border-gray-200 dark:border-gray-700 w-72 flex flex-col">
        <div className="bracket-match-content flex items-stretch flex-grow">
          {/* --- NOVO: NÚMERO DA PARTIDA --- */}
          <div className="flex flex-col items-center justify-center p-2 border-r border-gray-200 dark:border-gray-600">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">{match.matchNumber}</span>
          </div>

          <div className="flex-1 p-2 space-y-2">
            <div className={`flex justify-between text-sm ${vencedorA ? 'font-bold text-green-500' : 'text-gray-900 dark:text-white'}`}>
              {renderParticipant(match.a)}
            </div>
            <div className={`flex justify-between text-sm ${vencedorB ? 'font-bold text-green-500' : 'text-gray-900 dark:text-white'}`}>
              {renderParticipant(match.b)}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700/50 p-2 w-16 border-l border-gray-200 dark:border-gray-600">
            <div className={`font-bold text-lg ${vencedorA ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'}`}>
              {match.placar ? match.placar.a : '-'}
            </div>
            <div className={`font-bold text-lg ${vencedorB ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'}`}>
              {match.placar ? match.placar.b : '-'}
            </div>
          </div>
        </div>
      {canEdit && isParticipantReady(match.a) && isParticipantReady(match.b) && (
            <button 
                onClick={() => onEdit(match)}
                className="w-full text-center py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
            >
                {match.placar ? 'Editar Resultado' : 'Registrar Placar'}
            </button>
        )}
      </div>
    );
  }
);
MatchCard.displayName = 'MatchCard';


// =================================================================
// Componente para desenhar as linhas de conexão do chaveamento
// =================================================================
const BracketConnectors = ({ matches, containerRef }) => {
    const [lines, setLines] = useState<string[]>([]);
  
    useLayoutEffect(() => {
        const calculateLines = () => {
            if (!containerRef.current || matches.length === 0) {
                setLines([]);
                return;
            };

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLines: string[] = [];
    
            matches.forEach(match => {
                const sourceCard = document.getElementById(`match-card-${match.id}`);
                if (!sourceCard) return;

                // MUDANÇA: Procura pela área de conteúdo específica para medição
                const sourceContentArea = sourceCard.querySelector('.bracket-match-content') || sourceCard;
                const sourceRect = sourceContentArea.getBoundingClientRect();
                
                const sourceX = sourceRect.right - containerRect.left;
                const sourceY = sourceRect.top + sourceRect.height / 2 - containerRect.top;

                const drawLineTo = (targetId) => {
                    const targetCard = document.getElementById(`match-card-${targetId}`);
                    if (!targetCard) return;

                    // MUDANÇA: Procura pela área de conteúdo específica para medição
                    const targetContentArea = targetCard.querySelector('.bracket-match-content') || targetCard;
                    const targetRect = targetContentArea.getBoundingClientRect();
                    
                    const targetX = targetRect.left - containerRect.left;
                    const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;
                    
                    const midPointX = sourceX + (targetX - sourceX) / 2;

                    const path = `M ${sourceX} ${sourceY} H ${midPointX} V ${targetY} H ${targetX}`;
                    newLines.push(path);
                };
        
                if (match.nextMatchId) {
                    drawLineTo(match.nextMatchId);
                }
                if (match.nextMatchIdLoser) {
                    drawLineTo(match.nextMatchIdLoser);
                }
            });
    
            setLines(newLines);
        };
      
        const resizeObserver = new ResizeObserver(() => {
            calculateLines();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        calculateLines();
        
        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, [matches, containerRef]);
  
    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: containerRef.current?.scrollWidth, minHeight: containerRef.current?.scrollHeight }}>
        <g stroke="rgb(107 114 128 / 0.7)" strokeWidth="1.5" fill="none">
          {lines.map((path, index) => (
            <path key={index} d={path} />
          ))}
        </g>
      </svg>
    );
};
export const ChaveamentoView: React.FC<ChaveamentoViewProps> = ({
  torneio,
  onUpdateTorneio: _onUpdateTorneio,
  selectedCategoria,
  onSelectCategoria,
  canEdit
}) => {
  const { dadosMockados, setTorneios } = useAppState();
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [resultForm, setResultForm] = useState<MatchResultFormData>({
    sets: [{placarA: '', placarB: ''}],
    currentSetIndex: 0
  });

  const bracketContainerRef = useRef<HTMLDivElement>(null);

  const currentTorneio = dadosMockados.torneios.find(t => t.id === torneio.id) || torneio;
  const categoriaAtual = selectedCategoria ? currentTorneio.categorias.find(c => c.id === selectedCategoria) : null;
  
  const canGenerateBracket = useMemo(() => {
    return categoriaAtual && categoriaAtual.duplas.length >= 4 && 
           categoriaAtual.chaveamento.status === 'nao-gerado';
  }, [categoriaAtual]);

  const canReshuffle = useMemo(() => {
    if (!categoriaAtual) return false;
    const hasResults = categoriaAtual.chaveamento.matches.some(match => match.placar);
    return categoriaAtual.chaveamento.status === 'gerado' && !hasResults;
  }, [categoriaAtual]);

// ... (SUAS FUNÇÕES DE GERAR CHAVEAMENTO PERMANECEM AQUI, SEM ALTERAÇÕES)
const generateBracket = useCallback(() => {
    if (!categoriaAtual || !selectedCategoria) return;
    
    const duplas = [...categoriaAtual.duplas];
    if (duplas.length < 4) {
      toast.error("São necessárias pelo menos 4 duplas.");
      return;
    }

    // Embaralha as duplas
    for (let i = duplas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplas[i], duplas[j]] = [duplas[j], duplas[i]];
    }

    // VERIFICAÇÃO DO FORMATO SELECIONADO
   const formato = categoriaAtual.formato;
    
    if (formato === 'single') {
      generateSingleEliminationBracket(duplas);
      return;
    } else if (formato === 'double') {
      generateDoubleEliminationBracket(duplas);
      return;
    }
    
    toast.error("Formato de torneio não reconhecido.");
    
}, [categoriaAtual, selectedCategoria, currentTorneio.id, setTorneios]);

// Função para eliminação simples
// No seu arquivo ChaveamentoView.tsx
const generateSingleEliminationBracket = useCallback((duplas) => {
    const allMatches = new Map();
    let matchIdCounter = 1;

    const createMatch = (fase, round, bestOf = 1, matchNumber: number) => ({
      id: `match_${matchNumber}`,
      matchNumber,
      fase,
      round,
      status: 'pendente',
      categoriaId: selectedCategoria,
      bestOf,
      winsToAdvance: Math.ceil(bestOf / 2)
    });

   const numTeams = duplas.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const firstRoundSize = nextPowerOf2 / 2;
    const playInMatchesCount = numTeams - firstRoundSize;
    const teamsGoingDirectly = firstRoundSize - playInMatchesCount;

    let teamsAfterPlayIn = [];

    if (playInMatchesCount > 0) {
      const playInMatches = [];
      for (let i = 0; i < playInMatchesCount; i++) {
        const playInMatch = createMatch('Play In', 0, 1, matchIdCounter++);
        const teamAIndex = teamsGoingDirectly + i;
        const teamBIndex = teamsGoingDirectly + playInMatchesCount + i;
        
        playInMatch.a = duplas[teamAIndex]?.id;
        playInMatch.b = duplas[teamBIndex]?.id || 'BYE';
        
        playInMatches.push(playInMatch);
        allMatches.set(playInMatch.id, playInMatch);
      }
      
      for (let i = 0; i < teamsGoingDirectly; i++) {
        teamsAfterPlayIn.push(duplas[i].id);
      }
      
      playInMatches.forEach(match => {
        teamsAfterPlayIn.push(match.id);
      });
    } else {
      teamsAfterPlayIn = duplas.map(dupla => dupla.id);
    }

    const round1 = [];
    for (let i = 0; i < Math.floor(teamsAfterPlayIn.length / 2); i++) {
      const match = createMatch('Winners Round 1', 1, 1, matchIdCounter++);
      
      const teamA = teamsAfterPlayIn[i * 2];
      const teamB = teamsAfterPlayIn[i * 2 + 1];
      
      if (teamA.startsWith('match_')) {
        const playInMatch = allMatches.get(teamA);
        if (playInMatch) {
          playInMatch.nextMatchId = match.id;
          playInMatch.nextMatchSlot = 1;
        }
      }
      if (teamB.startsWith('match_')) {
        const playInMatch = allMatches.get(teamB);
        if (playInMatch) {
          playInMatch.nextMatchId = match.id;
          playInMatch.nextMatchSlot = 2;
        }
      }
      
      match.a = teamA;
      match.b = teamB;
      round1.push(match);
      allMatches.set(match.id, match);
    }

    let currentRound = round1;
    let roundNum = 2;
    
    while (currentRound.length > 1) {
      const nextRound = [];
      let faseName = `Winners Round ${roundNum}`;
      if (currentRound.length === 4) faseName = 'Winners Quarter Finals';
      if (currentRound.length === 2) faseName = 'Winners Semi Finals';
      
      for (let i = 0; i < Math.floor(currentRound.length / 2); i++) {
        const match = createMatch(faseName, roundNum, 1, matchIdCounter++);
        
        const prevMatch1 = currentRound[i * 2];
        const prevMatch2 = currentRound[i * 2 + 1];
        
        prevMatch1.nextMatchId = match.id;
        prevMatch1.nextMatchSlot = 1;
        prevMatch2.nextMatchId = match.id;
        prevMatch2.nextMatchSlot = 2;
        
        match.a = prevMatch1.id;
        match.b = prevMatch2.id;
        
        nextRound.push(match);
        allMatches.set(match.id, match);
      }
      currentRound = nextRound;
      roundNum++;
    }

    const finalMatch = createMatch('Finals', roundNum, categoriaAtual.bestOfFinal || 1, matchIdCounter++);
    if (currentRound.length === 1) {
      const semiMatch = currentRound[0];
      semiMatch.nextMatchId = finalMatch.id;
      semiMatch.nextMatchSlot = 1;
      finalMatch.a = semiMatch.id;
      finalMatch.b = semiMatch.id; 
    }
    allMatches.set(finalMatch.id, finalMatch);

    const newBracket = {
      status: 'gerado',
      matches: Array.from(allMatches.values()),
      roundAtual: 0,
      configuracao: { }
    };
    setTorneios(prev => torneioStateUtils.updateChaveamento(prev, currentTorneio.id, selectedCategoria, () => newBracket));
    toast.success(`Chaveamento gerado com ${allMatches.size} partidas!`);
}, [categoriaAtual, selectedCategoria, currentTorneio.id, setTorneios]);
// Função para dupla eliminação (corrigida)
// No seu arquivo ChaveamentoView.tsx
const generateDoubleEliminationBracket = useCallback((duplas) => {
    const allMatches = new Map();
    let matchIdCounter = 1;

    const createMatch = (fase, round, bestOf = 1, matchNumber) => ({
      id: `match_${matchNumber}`,
      matchNumber,
      fase,
      round,
      status: 'pendente',
      categoriaId: selectedCategoria,
      bestOf,
      winsToAdvance: Math.ceil(bestOf / 2)
    });

    console.log(`🎯 Iniciando bracket híbrido para ${duplas.length} duplas`);

    const numTeams = duplas.length;
    
    if (numTeams < 4) {
      toast.error('Mínimo de 4 duplas necessário para formato híbrido');
      return;
    }

    let currentRoundNumber = 0;
    
    // ============================================
    // FASE 1: CALCULAR E CRIAR PLAY-IN
    // ============================================
    
    // Calcular próxima potência de 2
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    // Tamanho ideal da primeira rodada do Winners
    const targetWBRound1Size = nextPowerOf2 / 2;
    
    let playInMatches = [];
    let teamsForWB = [];
    
    if (numTeams > targetWBRound1Size) {
      // Precisamos de play-in para reduzir ao tamanho ideal
      const excessTeams = numTeams - targetWBRound1Size;
      const playInPairs = excessTeams;
      const directToWB = numTeams - (playInPairs * 2);
      
      console.log(`📊 Play-in: ${playInPairs} partidas, ${directToWB} times direto para WB`);
      
      currentRoundNumber = 1;
      
      // Criar partidas do play-in
      for (let i = 0; i < playInPairs; i++) {
        const match = createMatch('Play In', currentRoundNumber, 1, matchIdCounter++);
        const teamAIndex = directToWB + (i * 2);
        const teamBIndex = directToWB + (i * 2) + 1;
        
        match.a = duplas[teamAIndex]?.id || null;
        match.b = duplas[teamBIndex]?.id || null;
        
        playInMatches.push(match);
        allMatches.set(match.id, match);
      }
      
      // Times que vão direto para WB
      for (let i = 0; i < directToWB; i++) {
        teamsForWB.push(duplas[i].id);
      }
      
      // Slots dos vencedores do play-in
      playInMatches.forEach(match => {
        teamsForWB.push(match.id);
      });
      
      currentRoundNumber++;
    } else {
      // Todos entram direto no Winners
      teamsForWB = duplas.map(d => d.id);
      currentRoundNumber = 1;
    }
    
    // ============================================
    // FASE 2: WINNERS BRACKET (ATÉ 4 FINALISTAS)
    // ============================================
    
    const winnersBracket = [];
    let currentWBTeams = teamsForWB.slice();
    let wbRoundNum = 1;
    
    // Continuar até ter exatamente 4 times
    while (currentWBTeams.length > 4) {
      const roundMatches = [];
      const numMatches = Math.floor(currentWBTeams.length / 2);
      const hasbye = currentWBTeams.length % 2 === 1;
      
      for (let i = 0; i < numMatches; i++) {
        const match = createMatch(
          `Winners Round ${wbRoundNum}`,
          currentRoundNumber,
          1,
          matchIdCounter++
        );
        
        const teamA = currentWBTeams[i];
        const teamB = currentWBTeams[currentWBTeams.length - 1 - i];
        
        // Conectar play-ins se necessário
        if (typeof teamA === 'string' && teamA.startsWith('match_')) {
          const prevMatch = allMatches.get(teamA);
          if (prevMatch) {
            prevMatch.nextMatchId = match.id;
            prevMatch.nextMatchSlot = 1;
          }
        }
        
        if (typeof teamB === 'string' && teamB.startsWith('match_')) {
          const prevMatch = allMatches.get(teamB);
          if (prevMatch) {
            prevMatch.nextMatchId = match.id;
            prevMatch.nextMatchSlot = 2;
          }
        }
        
        match.a = teamA;
        match.b = teamB;
        roundMatches.push(match);
        allMatches.set(match.id, match);
      }
      
      winnersBracket.push(roundMatches);
      
      // Preparar próxima rodada
      currentWBTeams = [];
      roundMatches.forEach(match => {
        currentWBTeams.push(match.id);
      });
      
      // Se tiver bye, adicionar o time do meio
      if (hasbye) {
        const byeTeam = teamsForWB[Math.floor(teamsForWB.length / 2)];
        currentWBTeams.push(byeTeam);
      }
      
      wbRoundNum++;
      currentRoundNumber++;
    }
    
    // Guardar os 4 finalistas do Winners
    const winnersBracketFinalists = currentWBTeams;
    
    // ============================================
    // FASE 3: LOSERS BRACKET (ATÉ AS QUARTAS)
    // ============================================
    
    const losersBracket = [];
    let lbCurrentTeams = [];
    let lbRoundNum = 1;
    
    // LB Round 1: Perdedores do Play-in vs Perdedores WB Round 1
    if (playInMatches.length > 0 && winnersBracket.length > 0) {
      const lbRound1Matches = [];
      const playInLosers = playInMatches.map(m => `${m.id}_loser`);
      const wbR1Losers = winnersBracket[0] ? winnersBracket[0].map(m => `${m.id}_loser`) : [];
      
      // Combinar perdedores
      let allLosersR1 = [...playInLosers, ...wbR1Losers];
      
      // Criar partidas LB Round 1
      const numLBR1Matches = Math.floor(allLosersR1.length / 2);
      
      for (let i = 0; i < numLBR1Matches; i++) {
        const match = createMatch(
          `Losers Round ${lbRoundNum}`,
          currentRoundNumber,
          1,
          matchIdCounter++
        );
        
        const teamA = allLosersR1[i];
        const teamB = allLosersR1[allLosersR1.length - 1 - i];
        
        // Conectar perdedores às partidas
        if (teamA) {
          const sourceId = teamA.replace('_loser', '');
          const sourceMatch = allMatches.get(sourceId);
          if (sourceMatch) {
            sourceMatch.nextMatchIdLoser = match.id;
            sourceMatch.nextMatchSlotLoser = 1;
          }
        }
        
        if (teamB) {
          const sourceId = teamB.replace('_loser', '');
          const sourceMatch = allMatches.get(sourceId);
          if (sourceMatch) {
            sourceMatch.nextMatchIdLoser = match.id;
            sourceMatch.nextMatchSlotLoser = 2;
          }
        }
        
        match.a = teamA;
        match.b = teamB;
        lbRound1Matches.push(match);
        allMatches.set(match.id, match);
      }
      
      if (lbRound1Matches.length > 0) {
        losersBracket.push(lbRound1Matches);
        lbCurrentTeams = lbRound1Matches.map(m => m.id);
        
        // Se tiver número ímpar de perdedores, adicionar bye
        if (allLosersR1.length % 2 === 1) {
          lbCurrentTeams.push(allLosersR1[Math.floor(allLosersR1.length / 2)]);
        }
        
        lbRoundNum++;
        currentRoundNumber++;
      }
    } else if (winnersBracket.length > 0) {
      // Apenas perdedores do WB Round 1
      const wbR1Losers = winnersBracket[0].map(m => `${m.id}_loser`);
      lbCurrentTeams = wbR1Losers;
    }
    
    // Continuar LB com perdedores das próximas rodadas do WB
    for (let wbRoundIdx = 1; wbRoundIdx < winnersBracket.length; wbRoundIdx++) {
      const wbRound = winnersBracket[wbRoundIdx];
      const wbRoundLosers = wbRound.map(m => `${m.id}_loser`);
      
      if (wbRoundLosers.length === 0) continue;
      
      // Combinar vencedores LB anteriores com novos perdedores WB
      const lbRoundMatches = [];
      
      // Intercalar para melhor distribuição
      let combinedTeams = [];
      const maxLen = Math.max(lbCurrentTeams.length, wbRoundLosers.length);
      
      for (let i = 0; i < maxLen; i++) {
        if (i < lbCurrentTeams.length) {
          combinedTeams.push(lbCurrentTeams[i]);
        }
        if (i < wbRoundLosers.length) {
          combinedTeams.push(wbRoundLosers[i]);
        }
      }
      
      // Criar partidas
      const numMatches = Math.floor(combinedTeams.length / 2);
      
      for (let i = 0; i < numMatches; i++) {
        const match = createMatch(
          `Losers Round ${lbRoundNum}`,
          currentRoundNumber,
          1,
          matchIdCounter++
        );
        
        const teamA = combinedTeams[i];
        const teamB = combinedTeams[combinedTeams.length - 1 - i];
        
        // Conectar partidas anteriores
        if (teamA && teamA.startsWith('match_') && !teamA.includes('_loser')) {
          const prevMatch = allMatches.get(teamA);
          if (prevMatch) {
            prevMatch.nextMatchId = match.id;
            prevMatch.nextMatchSlot = 1;
          }
        } else if (teamA && teamA.includes('_loser')) {
          const sourceId = teamA.replace('_loser', '');
          const sourceMatch = allMatches.get(sourceId);
          if (sourceMatch) {
            sourceMatch.nextMatchIdLoser = match.id;
            sourceMatch.nextMatchSlotLoser = 1;
          }
        }
        
        if (teamB && teamB.startsWith('match_') && !teamB.includes('_loser')) {
          const prevMatch = allMatches.get(teamB);
          if (prevMatch) {
            prevMatch.nextMatchId = match.id;
            prevMatch.nextMatchSlot = 2;
          }
        } else if (teamB && teamB.includes('_loser')) {
          const sourceId = teamB.replace('_loser', '');
          const sourceMatch = allMatches.get(sourceId);
          if (sourceMatch) {
            sourceMatch.nextMatchIdLoser = match.id;
            sourceMatch.nextMatchSlotLoser = 2;
          }
        }
        
        match.a = teamA;
        match.b = teamB;
        lbRoundMatches.push(match);
        allMatches.set(match.id, match);
      }
      
      if (lbRoundMatches.length > 0) {
        losersBracket.push(lbRoundMatches);
        lbCurrentTeams = lbRoundMatches.map(m => m.id);
        
        // Se tiver número ímpar, adicionar bye
        if (combinedTeams.length % 2 === 1) {
          lbCurrentTeams.push(combinedTeams[Math.floor(combinedTeams.length / 2)]);
        }
        
        lbRoundNum++;
        currentRoundNumber++;
      }
    }
    
    // Continuar reduzindo LB até ter 2 finalistas para as quartas
    while (lbCurrentTeams.length > 2) {
      const lbRoundMatches = [];
      const numMatches = Math.floor(lbCurrentTeams.length / 2);
      
      for (let i = 0; i < numMatches; i++) {
        const match = createMatch(
          `Losers Round ${lbRoundNum}`,
          currentRoundNumber,
          1,
          matchIdCounter++
        );
        
        const teamA = lbCurrentTeams[i];
        const teamB = lbCurrentTeams[lbCurrentTeams.length - 1 - i];
        
        // Conectar partidas anteriores
        if (teamA && teamA.startsWith('match_')) {
          const prevMatch = allMatches.get(teamA);
          if (prevMatch) {
            prevMatch.nextMatchId = match.id;
            prevMatch.nextMatchSlot = 1;
          }
        }
        
        if (teamB && teamB.startsWith('match_')) {
          const prevMatch = allMatches.get(teamB);
          if (prevMatch) {
            prevMatch.nextMatchId = match.id;
            prevMatch.nextMatchSlot = 2;
          }
        }
        
        match.a = teamA;
        match.b = teamB;
        lbRoundMatches.push(match);
        allMatches.set(match.id, match);
      }
      
      losersBracket.push(lbRoundMatches);
      lbCurrentTeams = lbRoundMatches.map(m => m.id);
      
      // Se tiver número ímpar, adicionar bye
      if (lbCurrentTeams.length % 2 === 1) {
        lbCurrentTeams.push(lbCurrentTeams[Math.floor(lbCurrentTeams.length / 2)]);
      }
      
      lbRoundNum++;
      currentRoundNumber++;
    }
    
    // Guardar os 2 finalistas do Losers
    const losersBracketFinalists = lbCurrentTeams;
    
    // ============================================
    // FASE 4: QUARTAS DE FINAL (DUPLAS)
    // ============================================
    
    const quarterFinalsWinners = [];
    const quarterFinalsLosers = [];
    
    // Quartas Winners: 2 partidas com os 4 finalistas do WB
    for (let i = 0; i < 2; i++) {
      const match = createMatch('Quarter Finals', currentRoundNumber, 1, matchIdCounter++);
      
      const teamA = winnersBracketFinalists[i * 2];
      const teamB = winnersBracketFinalists[i * 2 + 1];
      
      // Conectar com rodadas anteriores do WB
      if (teamA && teamA.startsWith('match_')) {
        const prevMatch = allMatches.get(teamA);
        if (prevMatch) {
          prevMatch.nextMatchId = match.id;
          prevMatch.nextMatchSlot = 1;
        }
      }
      
      if (teamB && teamB.startsWith('match_')) {
        const prevMatch = allMatches.get(teamB);
        if (prevMatch) {
          prevMatch.nextMatchId = match.id;
          prevMatch.nextMatchSlot = 2;
        }
      }
      
      match.a = teamA || null;
      match.b = teamB || null;
      quarterFinalsWinners.push(match);
      allMatches.set(match.id, match);
    }
    
    // Quartas Losers: 2 partidas (vencedores LB vs perdedores Quartas Winners)
    for (let i = 0; i < 2; i++) {
      const match = createMatch('Quarter Finals', currentRoundNumber, 1, matchIdCounter++);
      
      // Vencedor do LB
      const lbFinalista = losersBracketFinalists[i];
      if (lbFinalista) {
        if (lbFinalista.startsWith('match_')) {
          const prevMatch = allMatches.get(lbFinalista);
          if (prevMatch) {
            prevMatch.nextMatchId = match.id;
            prevMatch.nextMatchSlot = 1;
          }
        }
        match.a = lbFinalista;
      } else {
        match.a = null;
      }
      
      // Perdedor das Quartas Winners
      const qfWinner = quarterFinalsWinners[i];
      if (qfWinner) {
        qfWinner.nextMatchIdLoser = match.id;
        qfWinner.nextMatchSlotLoser = 2;
        match.b = `${qfWinner.id}_loser`;
      } else {
        match.b = null;
      }
      
      quarterFinalsLosers.push(match);
      allMatches.set(match.id, match);
    }
    
    currentRoundNumber++;
    
    // ============================================
    // FASE 5: SEMIFINAIS (CRUZADAS)
    // ============================================
    
    const semiFinals = [];
    
    // Semi 1: Vencedor QF Winners 1 vs Vencedor QF Losers 1
    const semi1 = createMatch('Semi Final', currentRoundNumber, 1, matchIdCounter++);
    quarterFinalsWinners[0].nextMatchId = semi1.id;
    quarterFinalsWinners[0].nextMatchSlot = 1;
    quarterFinalsLosers[0].nextMatchId = semi1.id;
    quarterFinalsLosers[0].nextMatchSlot = 2;
    semi1.a = quarterFinalsWinners[0].id;
    semi1.b = quarterFinalsLosers[0].id;
    semiFinals.push(semi1);
    allMatches.set(semi1.id, semi1);
    
    // Semi 2: Vencedor QF Winners 2 vs Vencedor QF Losers 2
    const semi2 = createMatch('Semi Final', currentRoundNumber, 1, matchIdCounter++);
    quarterFinalsWinners[1].nextMatchId = semi2.id;
    quarterFinalsWinners[1].nextMatchSlot = 1;
    quarterFinalsLosers[1].nextMatchId = semi2.id;
    quarterFinalsLosers[1].nextMatchSlot = 2;
    semi2.a = quarterFinalsWinners[1].id;
    semi2.b = quarterFinalsLosers[1].id;
    semiFinals.push(semi2);
    allMatches.set(semi2.id, semi2);
    
    currentRoundNumber++;
    
    // ============================================
    // FASE 6: FINAIS (3º LUGAR + FINAL)
    // ============================================
    
// 3º Lugar (rodada atual)
const thirdPlace = createMatch('3rd Place', currentRoundNumber, 1, matchIdCounter++);
semi1.nextMatchIdLoser = thirdPlace.id;
semi1.nextMatchSlotLoser = 1;
semi2.nextMatchIdLoser = thirdPlace.id;
semi2.nextMatchSlotLoser = 2;
thirdPlace.a = `${semi1.id}_loser`;
thirdPlace.b = `${semi2.id}_loser`;
allMatches.set(thirdPlace.id, thirdPlace);

// Incrementar rodada para a final
currentRoundNumber++;

// Final (nova rodada)
const grandFinal = createMatch('Final', currentRoundNumber, categoriaAtual?.bestOfFinal || 1, matchIdCounter++);
semi1.nextMatchId = grandFinal.id;
semi1.nextMatchSlot = 1;
semi2.nextMatchId = grandFinal.id;
semi2.nextMatchSlot = 2;
grandFinal.a = semi1.id;
grandFinal.b = semi2.id;
allMatches.set(grandFinal.id, grandFinal);
    
    // ============================================
    // ESTATÍSTICAS E FINALIZAÇÃO
    // ============================================
    
    const stats = {
      playIn: playInMatches.length,
      winnersRounds: winnersBracket.length,
      winnersMatches: winnersBracket.reduce((acc, round) => acc + round.length, 0),
      losersRounds: losersBracket.length,
      losersMatches: losersBracket.reduce((acc, round) => acc + round.length, 0),
      quarterFinals: quarterFinalsWinners.length + quarterFinalsLosers.length,
      semiFinals: semiFinals.length,
      finals: 2, // 3º lugar + final
      totalMatches: allMatches.size
    };
    
    console.log(`✅ Bracket híbrido gerado com sucesso!`);
    console.log(`📊 Estatísticas:`, stats);
    console.log(`🎯 ${numTeams} duplas → ${stats.totalMatches} partidas totais`);
    console.log(`⚡ Play-in: ${stats.playIn} | WB: ${stats.winnersMatches} | LB: ${stats.losersMatches}`);
    console.log(`🏆 Quartas: ${stats.quarterFinals} | Semis: ${stats.semiFinals} | Finais: ${stats.finals}`);

    const newBracket = {
      status: 'gerado',
      matches: Array.from(allMatches.values()),
      roundAtual: 0,
      configuracao: { 
        type: 'hybrid',
        description: `Formato híbrido: ${numTeams} duplas → ${stats.totalMatches} partidas`,
        details: `Play-in: ${stats.playIn} | WB até quartas: ${stats.winnersMatches} | LB até quartas: ${stats.losersMatches} | Fase final: ${stats.quarterFinals + stats.semiFinals + stats.finals} partidas`,
        stats
      }
    };

    setTorneios(prev => torneioStateUtils.updateChaveamento(
      prev, currentTorneio.id, selectedCategoria, () => newBracket
    ));
    
    toast.success(`Chaveamento híbrido gerado: ${stats.totalMatches} partidas para ${numTeams} duplas!`);
}, [categoriaAtual, selectedCategoria, currentTorneio.id, setTorneios]); 
 
 
 // Função para propagar o perdedor para a próxima partida do losers bracket
const propagateLoser = useCallback((match, allMatches) => {
  if (match.nextMatchIdLoser && match.perdedor) {
    const nextMatchIndex = allMatches.findIndex(m => m.id === match.nextMatchIdLoser);
    if (nextMatchIndex !== -1) {
      const nextMatch = allMatches[nextMatchIndex];
      if (match.nextMatchSlotLoser === 1) {
        nextMatch.a = match.perdedor;
      } else if (match.nextMatchSlotLoser === 2) {
        nextMatch.b = match.perdedor;
      }
    }
  }
}, []);

// Função para propagar o vencedor para a próxima partida do winners bracket
const propagateWinner = useCallback((match, allMatches) => {
  if (match.nextMatchId && match.vencedor) {
    const nextMatchIndex = allMatches.findIndex(m => m.id === match.nextMatchId);
    if (nextMatchIndex !== -1) {
      const nextMatch = allMatches[nextMatchIndex];
      if (match.nextMatchSlot === 1) {
        nextMatch.a = match.vencedor;
      } else if (match.nextMatchSlot === 2) {
        nextMatch.b = match.vencedor;
      }
    }
  }
}, []);
 const handleEditResult = useCallback((match: Match) => {
    const bestOf = match.bestOf || 1;
    setEditingMatch(match);
    
    const existingSets = match.scores || [];
    const initSets = existingSets.length > 0 
      ? existingSets.map(s => ({ placarA: s.a.toString(), placarB: s.b.toString() }))
      : Array.from({ length: 1 }, () => ({ placarA: '', placarB: '' }));
    
    setResultForm({
      sets: initSets,
      currentSetIndex: 0
    });
  }, []);

const handleSaveResult = useCallback(() => {
  if (!editingMatch || !categoriaAtual || !selectedCategoria) return;

  const bestOf = editingMatch.bestOf || 1;
  const winsToAdvance = Math.ceil(bestOf / 2);

  const validSets: Array<{a: number, b: number}> = [];
  for (const set of resultForm.sets) {
    const placarA = parseInt(set.placarA);
    const placarB = parseInt(set.placarB);
    if (isNaN(placarA) || isNaN(placarB) || placarA < 0 || placarB < 0) {
      toast.error('Insira placares válidos para todos os sets'); return;
    }
    if (placarA === placarB) {
      toast.error('O placar de um set não pode ser empate'); return;
    }
    validSets.push({ a: placarA, b: placarB });
  }

  let winsA = validSets.filter(s => s.a > s.b).length;
  let winsB = validSets.filter(s => s.b > s.a).length;

  if (Math.max(winsA, winsB) < winsToAdvance) {
    toast.error(`Uma equipe precisa vencer ${winsToAdvance} set(s) para finalizar.`); return;
  }

  const totalA = validSets.reduce((sum, set) => sum + set.a, 0);
  const totalB = validSets.reduce((sum, set) => sum + set.b, 0);

  // DETERMINAR VENCEDOR E PERDEDOR
  const vencedor = winsA > winsB ? editingMatch.a : editingMatch.b;
  const perdedor = winsA > winsB ? editingMatch.b : editingMatch.a;

  setTorneios(prev => {
    return torneioStateUtils.updateChaveamento(
      prev, 
      currentTorneio.id, 
      selectedCategoria, 
      (bracket) => {
        const matches = [...bracket.matches];
        const matchIndex = matches.findIndex(m => m.id === editingMatch.id);
        
        if (matchIndex === -1) return bracket;
        
        // Atualizar a partida com resultado completo
        const updatedMatch = {
          ...matches[matchIndex],
          placar: { a: totalA, b: totalB },
          scores: validSets,
          vencedor: vencedor,
          perdedor: perdedor, // IMPORTANTE: definir o perdedor
          status: 'finalizada'
        };
        
        matches[matchIndex] = updatedMatch;
        
        // PROPAGAR VENCEDOR E PERDEDOR
        propagateWinner(updatedMatch, matches);
        propagateLoser(updatedMatch, matches); // ESTA É A LINHA MAIS IMPORTANTE
        
        return {
          ...bracket,
          matches: matches
        };
      }
    );
  });

  setEditingMatch(null);
  toast.success('Resultado salvo e participantes propagados!');
}, [editingMatch, categoriaAtual, selectedCategoria, currentTorneio.id, setTorneios, resultForm, propagateWinner, propagateLoser]);
  const addSet = useCallback(() => {
    setResultForm(prev => ({...prev, sets: [...prev.sets, { placarA: '', placarB: '' }] }));
  }, []);

  const removeSet = useCallback((setIndex: number) => {
    setResultForm(prev => ({...prev, sets: prev.sets.filter((_, i) => i !== setIndex)}));
  }, []);

  const updateSetScore = useCallback((setIndex: number, field: 'placarA' | 'placarB', value: string) => {
    setResultForm(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => i === setIndex ? { ...set, [field]: value } : set)
    }));
  }, []);

  const getDupla = useCallback((duplaId?: string) => {
    return categoriaAtual?.duplas.find(d => d.id === duplaId);
  }, [categoriaAtual]);

  const getStatusColor = (status: BracketState['status']) => {
    //...
  };
  const getStatusText = (status: BracketState['status']) => {
    //...
  };

  // Agrupa partidas por rodada para renderização
const bracketData = useMemo(() => {
    if (!categoriaAtual || !categoriaAtual.chaveamento.matches) {
      return { winners: [], losers: [] };
    }
    
    // Objeto para agrupar as partidas
    const grouped = categoriaAtual.chaveamento.matches.reduce((acc, match) => {
      // Determina se a partida é da chave de perdedores pela fase (fase)
      const isLoserBracket = match.fase.toLowerCase().includes('loser') || match.fase.toLowerCase().includes('perdedor');
      const bracketType = isLoserBracket ? 'losers' : 'winners';
      
      const round = match.round;
      if (!acc[bracketType][round]) {
        acc[bracketType][round] = [];
      }
      acc[bracketType][round].push(match);
      return acc;
    }, { winners: {}, losers: {} } as { winners: Record<number, Match[]>, losers: Record<number, Match[]> });
    
    // Função para converter o objeto de rodadas em um array ordenado
    const formatAndSort = (bracketGroup: Record<number, Match[]>) => {
      return Object.entries(bracketGroup)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, matches]) => ({
          round: Number(round),
          label: matches[0]?.fase || `Rodada ${Number(round) + 1}`,
          matches
        }));
    };

    return {
      winners: formatAndSort(grouped.winners),
      losers: formatAndSort(grouped.losers),
    };
  }, [categoriaAtual]);
  return (
    <div className="space-y-6">
      {/* Seletor de Categoria (sem alteração) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selecione uma categoria
        </label>
        <select
          value={selectedCategoria || ''}
          onChange={(e) => onSelectCategoria(e.target.value || null)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Escolha uma categoria...</option>
          {currentTorneio.categorias.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome} ({categoria.duplas.length} duplas)
            </option>
          ))}
        </select>
      </div>

      {selectedCategoria && categoriaAtual && (
        <>
          {/* Header (sem alteração) */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chaveamento - {categoriaAtual.nome}
              </h2>
              <p className={`text-sm ${getStatusColor(categoriaAtual.chaveamento.status)}`}>
                Status: {getStatusText(categoriaAtual.chaveamento.status)}
              </p>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                {canGenerateBracket && (
                  <button onClick={generateBracket} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Shuffle className="h-4 w-4" />Sortear</button>
                )}
                {canReshuffle && (
                  <button onClick={generateBracket} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"><Shuffle className="h-4 w-4" />Re-sortear</button>
                )}
              </div>
            )}
          </div>
          
          {/* Conteúdo do Chaveamento (NOVA ESTRUTURA) */}
{categoriaAtual.chaveamento.status !== 'nao-gerado' ? (
    <div ref={bracketContainerRef} className="relative bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg overflow-x-auto">
        <div className="flex flex-col gap-y-16"> {/* Container principal que empilha as chaves */}
            
            {/* Chave de Vencedores (Winners Bracket) */}
            {bracketData.winners.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Chave Principal</h3>
                    <div className="flex gap-x-16">
                        {bracketData.winners.map(roundData => (
                            <div key={`w-${roundData.round}`} className="flex flex-col items-center flex-shrink-0">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 whitespace-nowrap">
                                    {roundData.label}
                                </h4>
                                <div className="flex flex-col justify-around h-full gap-y-6">
                                    {roundData.matches.map(match => (
                                        <MatchCard 
                                            key={match.id}
                                            match={match}
											allMatches={categoriaAtual.chaveamento.matches}
                                            getDupla={getDupla}
                                            onEdit={handleEditResult}
                                            canEdit={canEdit}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chave de Perdedores (Losers Bracket) */}
            {bracketData.losers.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Repescagem</h3>
                    <div className="flex gap-x-16">
                        {bracketData.losers.map(roundData => (
                            <div key={`l-${roundData.round}`} className="flex flex-col items-center flex-shrink-0">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6 whitespace-nowrap">
                                    {roundData.label}
                                </h4>
                                <div className="flex flex-col justify-around h-full gap-y-6">
                                    {roundData.matches.map(match => (
                                        <MatchCard 
                                            key={match.id}
                                            match={match}
											allMatches={categoriaAtual.chaveamento.matches}
                                            getDupla={getDupla}
                                            onEdit={handleEditResult}
                                            canEdit={canEdit}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

       
    </div>
) : (
   <div className="text-center py-12">
     <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {categoriaAtual.duplas.length < 4 ? 'Duplas insuficientes' : 'Chaveamento não gerado'}
     </h3>
     <p className="text-gray-600 dark:text-gray-400">
      {categoriaAtual.duplas.length < 4 
          ? `São necessárias pelo menos 4 duplas. (${categoriaAtual.duplas.length} cadastradas)`
          : (canEdit ? 'Clique em "Sortear" para gerar as partidas.' : 'Aguarde o chaveamento ser gerado')
      }
     </p>
   </div>
)}     
	  </>
      )}

      {!selectedCategoria && (
        <div className="text-center py-12">
          {/* ... Mensagem para selecionar categoria ... */}
        </div>
      )}

      {/* MODAL de Edição de Resultado */}
      {editingMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Registrar Resultado</h3>
              <p className="text-sm text-gray-500">{editingMatch.fase}</p>
            </div>
            <div className="p-6 space-y-4">
                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                    {editingMatch.bestOf && editingMatch.bestOf > 1 
                    ? `Melhor de ${editingMatch.bestOf} (vence quem ganhar ${Math.ceil(editingMatch.bestOf / 2)} set(s))`
                    : 'Jogo único'}
                </div>
              {resultForm.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-2">
                  <span className="font-medium w-12">Set {setIndex + 1}</span>
                  <input type="number" min="0" value={set.placarA} onChange={e => updateSetScore(setIndex, 'placarA', e.target.value)} className="w-full px-2 py-1 border dark:border-gray-600 rounded text-center dark:bg-gray-700"/>
                  <span>x</span>
                  <input type="number" min="0" value={set.placarB} onChange={e => updateSetScore(setIndex, 'placarB', e.target.value)} className="w-full px-2 py-1 border dark:border-gray-600 rounded text-center dark:bg-gray-700"/>
                  {resultForm.sets.length > 1 && <button onClick={() => removeSet(setIndex)} className="text-red-500 p-1">✕</button>}
                </div>
              ))}
              {editingMatch.bestOf && editingMatch.bestOf > 1 && resultForm.sets.length < editingMatch.bestOf && (
                <button onClick={addSet} className="text-sm text-blue-600 hover:underline">+ Adicionar set</button>
              )}
            </div>
            <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
                <button onClick={() => setEditingMatch(null)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-600">Cancelar</button>
                <button onClick={handleSaveResult} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};