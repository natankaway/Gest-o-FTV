import React, { useState, useCallback, useMemo } from 'react';
import { useAppState } from '@/contexts';
import { Target, Shuffle, Play } from 'lucide-react';
import { nanoid } from 'nanoid';
import { torneioStateUtils } from '@/utils/torneioStateUtils';
import toast from 'react-hot-toast';
import type { Torneio, Match, BracketState } from '@/types';

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

export const ChaveamentoView: React.FC<ChaveamentoViewProps> = ({
  torneio,
  onUpdateTorneio: _onUpdateTorneio, // Keep for interface compatibility
  selectedCategoria,
  onSelectCategoria,
  canEdit
}) => {
  const { dadosMockados, setTorneios } = useAppState();
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState<MatchResultFormData>({
    sets: [{placarA: '', placarB: ''}],
    currentSetIndex: 0
  });

  // Get current tournament from latest state
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

  const getDuplaName = useCallback((duplaId?: string) => {
    if (!duplaId || !categoriaAtual) return 'TBD';
    const dupla = categoriaAtual.duplas.find(d => d.id === duplaId);
    if (!dupla) return 'TBD';
    return dupla.nome || `${dupla.jogadores[0].nome} / ${dupla.jogadores[1].nome}`;
  }, [categoriaAtual]);

  const addSet = useCallback(() => {
    setResultForm(prev => ({
      ...prev,
      sets: [...prev.sets, { placarA: '', placarB: '' }],
      currentSetIndex: prev.sets.length
    }));
  }, []);

  const removeSet = useCallback((setIndex: number) => {
    setResultForm(prev => ({
      ...prev,
      sets: prev.sets.filter((_, index) => index !== setIndex),
      currentSetIndex: Math.min(prev.currentSetIndex, prev.sets.length - 2)
    }));
  }, []);

  const updateSetScore = useCallback((setIndex: number, field: 'placarA' | 'placarB', value: string) => {
    setResultForm(prev => ({
      ...prev,
      sets: prev.sets.map((set, index) => 
        index === setIndex ? { ...set, [field]: value } : set
      )
    }));
  }, []);

  const handleEditResult = useCallback((match: Match) => {
    setEditingMatch(match.id);
    
    // Initialize sets based on existing scores or empty sets
    const existingSets = match.scores || [];
    const initSets = existingSets.length > 0 
      ? existingSets.map(s => ({ placarA: s.a.toString(), placarB: s.b.toString() }))
      : [{ placarA: '', placarB: '' }];
    
    setResultForm({
      sets: initSets,
      currentSetIndex: 0
    });
  }, []);

  const handleSaveResult = useCallback(() => {
    if (!editingMatch || !categoriaAtual || !selectedCategoria) return;

    const currentMatch = categoriaAtual.chaveamento.matches.find(m => m.id === editingMatch);
    if (!currentMatch) return;

    const bestOf = currentMatch.bestOf || 1;
    const winsToAdvance = Math.ceil(bestOf / 2);

    // Validate all sets
    const validSets: Array<{a: number, b: number}> = [];
    for (const set of resultForm.sets) {
      const placarA = parseInt(set.placarA);
      const placarB = parseInt(set.placarB);

      if (isNaN(placarA) || isNaN(placarB) || placarA < 0 || placarB < 0) {
        toast.error('Por favor, insira placares válidos para todos os sets');
        return;
      }

      if (placarA === placarB) {
        toast.error('O placar não pode ser empate em nenhum set');
        return;
      }

      validSets.push({ a: placarA, b: placarB });
    }

    // Count wins for each team
    let winsA = 0;
    let winsB = 0;
    for (const set of validSets) {
      if (set.a > set.b) winsA++;
      else winsB++;
    }

    // Check if match is complete (someone reached winsToAdvance)
    if (Math.max(winsA, winsB) < winsToAdvance) {
      toast.error(`É necessário que uma equipe vença pelo menos ${winsToAdvance} set(s) para finalizar a partida`);
      return;
    }

    // Calculate final scores (total points across all sets)
    const totalA = validSets.reduce((sum, set) => sum + set.a, 0);
    const totalB = validSets.reduce((sum, set) => sum + set.b, 0);

    // Use the enhanced updateMatchResult that handles propagation
    setTorneios(prev => torneioStateUtils.updateMatchResult(
      prev,
      currentTorneio.id,
      selectedCategoria,
      editingMatch,
      { placarA: totalA, placarB: totalB, scores: validSets }
    ));

    setEditingMatch(null);
    setResultForm({ sets: [{placarA: '', placarB: ''}], currentSetIndex: 0 });
    toast.success('Resultado registrado com sucesso!');
  }, [editingMatch, categoriaAtual, selectedCategoria, currentTorneio.id, setTorneios, resultForm]);

  // Single elimination generation function (original logic)
  const generateSingleEliminationBracket = (duplas: any[], matches: Match[], selectedCategoria: string, categoriaAtual: any) => {
    const numDuplas = duplas.length;
    const totalRounds = Math.ceil(Math.log2(numDuplas));
    
    // Generate first round matches
    const firstRoundMatches = Math.floor(numDuplas / 2);
    const firstRoundMatchIds: string[] = [];
    
    for (let i = 0; i < firstRoundMatches; i++) {
      const duplaA = duplas[i * 2];
      const duplaB = duplas[i * 2 + 1];
      if (duplaA && duplaB) {
        const matchId = `match_${nanoid()}`;
        firstRoundMatchIds.push(matchId);
        matches.push({
          id: matchId,
          categoriaId: selectedCategoria,
          fase: 'WB',
          round: 1,
          a: duplaA.id,
          b: duplaB.id,
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
          bestOf = (categoriaAtual.bestOfFinal as 1 | 3) || 1;
        } else if (fase === 'SF') {
          bestOf = (categoriaAtual.bestOfSF as 1 | 3) || 1;
        }
        
        const newMatch: Match = {
          id: matchId,
          categoriaId: selectedCategoria,
          fase,
          round,
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
            const currentMatch = matches[match1Index];
            if (currentMatch) {
              matches[match1Index] = {
                ...currentMatch,
                nextMatchId,
                nextMatchSlot: 1
              };
            }
          }
        }
        
        if (match2Id && nextMatchId) {
          const match2Index = matches.findIndex(m => m.id === match2Id);
          if (match2Index !== -1) {
            const currentMatch = matches[match2Index];
            if (currentMatch) {
              matches[match2Index] = {
                ...currentMatch,
                nextMatchId,
                nextMatchSlot: 2
              };
            }
          }
        }
      }
      
      currentRoundMatchIds = nextRoundMatchIds;
    }
  };

  // Double elimination generation function
  const generateDoubleEliminationBracket = (duplas: any[], matches: Match[], selectedCategoria: string, categoriaAtual: any) => {
    const numDuplas = duplas.length;
    
    // Handle play-in matches for non-power-of-2 numbers
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numDuplas)));
    const playInMatches = numDuplas - (nextPowerOf2 / 2);
    
    let qualifiedTeams: string[] = [];
    let wbRound = 1;
    
    // Play-in matches if needed
    if (playInMatches > 0) {
      for (let i = 0; i < playInMatches; i++) {
        const duplaA = duplas[i * 2];
        const duplaB = duplas[i * 2 + 1];
        if (duplaA && duplaB) {
          const matchId = `playin_${nanoid()}`;
          matches.push({
            id: matchId,
            categoriaId: selectedCategoria,
            fase: 'WB',
            round: wbRound,
            a: duplaA.id,
            b: duplaB.id,
            bestOf: 1,
            winsToAdvance: 1,
            status: 'pendente',
            proximoVencedorMatchId: `wb_r${wbRound + 1}_${Math.floor(i / 2)}`,
            proximoPerdedorMatchId: `lb_r1_${i}`
          });
        }
      }
      
      // Teams that advance directly to main bracket
      for (let i = playInMatches * 2; i < duplas.length; i++) {
        qualifiedTeams.push(duplas[i].id);
      }
      
      wbRound++;
    } else {
      // All teams start in first round
      qualifiedTeams = duplas.map(d => d.id);
    }
    
    // Generate Winner Bracket
    const wbTeamCount = nextPowerOf2 / 2;
    const wbRounds = Math.log2(wbTeamCount);
    
    // WB Round 1 (or 2 if there were play-ins)
    let currentWBTeams = wbTeamCount;
    for (let round = wbRound; round <= wbRound + wbRounds - 1; round++) {
      const matchesInRound = currentWBTeams / 2;
      
      for (let i = 0; i < matchesInRound; i++) {
        const matchId = `wb_r${round}_${i}`;
        const isWBFinal = round === wbRound + wbRounds - 1;
        
        matches.push({
          id: matchId,
          categoriaId: selectedCategoria,
          fase: 'WB',
          round: round,
          bestOf: 1,
          winsToAdvance: 1,
          status: 'pendente',
          proximoVencedorMatchId: isWBFinal ? 'semifinal_1' : `wb_r${round + 1}_${Math.floor(i / 2)}`,
          proximoPerdedorMatchId: `lb_r${calculateLBRound(round, wbRound)}_${i}`
        });
      }
      
      currentWBTeams /= 2;
    }
    
    // Generate Loser Bracket
    generateLoserBracket(matches, selectedCategoria, wbTeamCount);
    
    // Generate Semifinals (Games 21 and 22)
    matches.push({
      id: 'semifinal_1',
      categoriaId: selectedCategoria,
      fase: 'SF',
      round: 100, // Use high numbers to separate from WB/LB rounds
      bestOf: categoriaAtual.bestOfSF || 1,
      winsToAdvance: Math.ceil((categoriaAtual.bestOfSF || 1) / 2),
      status: 'pendente',
      proximoVencedorMatchId: 'grand_final',
      proximoPerdedorMatchId: '3rd_place'
    });
    
    matches.push({
      id: 'semifinal_2',
      categoriaId: selectedCategoria,
      fase: 'SF',
      round: 100,
      bestOf: categoriaAtual.bestOfSF || 1,
      winsToAdvance: Math.ceil((categoriaAtual.bestOfSF || 1) / 2),
      status: 'pendente',
      proximoVencedorMatchId: 'grand_final',
      proximoPerdedorMatchId: '3rd_place'
    });
    
    // 3rd Place Playoff
    matches.push({
      id: '3rd_place',
      categoriaId: selectedCategoria,
      fase: '3P',
      round: 101,
      bestOf: 1,
      winsToAdvance: 1,
      status: 'pendente'
    });
    
    // Grand Final
    matches.push({
      id: 'grand_final',
      categoriaId: selectedCategoria,
      fase: 'F',
      round: 102,
      bestOf: categoriaAtual.bestOfFinal || 1,
      winsToAdvance: Math.ceil((categoriaAtual.bestOfFinal || 1) / 2),
      status: 'pendente'
    });
  };
  
  // Helper function to generate loser bracket
  const generateLoserBracket = (matches: Match[], selectedCategoria: string, wbTeamCount: number) => {
    let lbTeamsInRound = wbTeamCount / 2; // Losers from WB Round 1
    
    // LB has alternating rounds: losers from WB + elimination matches
    const lbRounds = (Math.log2(wbTeamCount) * 2) - 1;
    
    for (let round = 1; round <= lbRounds; round++) {
      const isEliminationRound = round % 2 === 0;
      const matchesInRound = isEliminationRound ? lbTeamsInRound / 2 : lbTeamsInRound;
      
      for (let i = 0; i < matchesInRound; i++) {
        const matchId = `lb_r${round}_${i}`;
        const isLBFinal = round === lbRounds;
        
        matches.push({
          id: matchId,
          categoriaId: selectedCategoria,
          fase: 'LB',
          round: round,
          bestOf: 1,
          winsToAdvance: 1,
          status: 'pendente',
          proximoVencedorMatchId: isLBFinal ? 'semifinal_2' : `lb_r${round + 1}_${isEliminationRound ? i : Math.floor(i / 2)}`
        });
      }
      
      if (isEliminationRound) {
        lbTeamsInRound /= 2;
      }
    }
  };
  
  // Helper function to calculate which LB round losers from WB should enter
  const calculateLBRound = (wbRound: number, wbStartRound: number) => {
    return (wbRound - wbStartRound) * 2 + 1;
  };

  // Helper function to render a single match
  const renderMatch = useCallback((match: Match) => (
    <div
      key={match.id}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 ${
        match.status === 'finalizado' 
          ? 'border-green-200 dark:border-green-800' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {match.fase}
            </div>
            {match.bestOf && match.bestOf > 1 && (
              <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                MD{match.bestOf}
              </div>
            )}
            {match.status === 'finalizado' && (
              <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                Finalizada
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className={`text-sm ${match.vencedor === match.a ? 'font-bold text-green-600' : 'text-gray-900 dark:text-white'}`}>
                {getDuplaName(match.a)}
              </div>
              <div className={`text-sm ${match.vencedor === match.b ? 'font-bold text-green-600' : 'text-gray-900 dark:text-white'}`}>
                {getDuplaName(match.b)}
              </div>
            </div>
            
            <div className="text-right">
              {match.placar ? (
                <div className="space-y-1">
                  {/* Total Score */}
                  <div className={`font-bold text-lg ${match.vencedor === match.a ? 'text-green-600' : 'text-gray-600'}`}>
                    {match.placar.a}
                  </div>
                  <div className={`font-bold text-lg ${match.vencedor === match.b ? 'text-green-600' : 'text-gray-600'}`}>
                    {match.placar.b}
                  </div>
                  
                  {/* Sets breakdown if available */}
                  {match.scores && match.scores.length > 1 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {match.scores.map((set, idx) => (
                        <div key={idx}>
                          Set {idx + 1}: {set.a}-{set.b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-lg">
                  -<br />-
                </div>
              )}
            </div>
          </div>
        </div>
        
        {canEdit && match.a && match.b && (
          <div className="ml-4">
            {editingMatch === match.id ? (
              <div className="space-y-2">
                {/* Match Configuration Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {match.bestOf && match.bestOf > 1 
                    ? `Melhor de ${match.bestOf} (vence quem ganhar ${Math.ceil(match.bestOf / 2)} set${Math.ceil(match.bestOf / 2) > 1 ? 's' : ''})`
                    : 'Jogo único'
                  }
                </div>
                
                {/* Sets Input */}
                <div className="space-y-2">
                  {resultForm.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">Set {setIndex + 1}:</span>
                      <input
                        type="number"
                        min="0"
                        value={set.placarA}
                        onChange={(e) => updateSetScore(setIndex, 'placarA', e.target.value)}
                        className="w-12 px-1 py-1 border rounded text-center text-xs transition-colors"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--input-text)',
                          borderColor: 'var(--input-border)',
                        }}
                        placeholder="0"
                      />
                      <span className="text-gray-400 text-xs">x</span>
                      <input
                        type="number"
                        min="0"
                        value={set.placarB}
                        onChange={(e) => updateSetScore(setIndex, 'placarB', e.target.value)}
                        className="w-12 px-1 py-1 border rounded text-center text-xs transition-colors"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          color: 'var(--input-text)',
                          borderColor: 'var(--input-border)',
                        }}
                        placeholder="0"
                      />
                      {resultForm.sets.length > 1 && (
                        <button
                          onClick={() => removeSet(setIndex)}
                          className="px-1 py-1 text-red-600 hover:text-red-700 text-xs"
                          title="Remover set"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Add Set Button (only for best-of matches) */}
                {match.bestOf && match.bestOf > 1 && resultForm.sets.length < match.bestOf && (
                  <button
                    onClick={addSet}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    + Adicionar set
                  </button>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveResult}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditingMatch(null);
                      setResultForm({ sets: [{placarA: '', placarB: ''}], currentSetIndex: 0 });
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleEditResult(match)}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Play className="h-3 w-3" />
                {match.placar ? 'Editar' : 'Registrar'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  ), [canEdit, editingMatch, resultForm, handleEditResult, handleSaveResult, getDuplaName, addSet, removeSet, updateSetScore]);

  // Helper function to render bracket matches organized by rounds
  const renderBracketMatches = useCallback((matches: Match[]) => {
    if (matches.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          Nenhuma partida
        </div>
      );
    }

    // Group matches by round
    const matchesByRound = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round]!.push(match);
      return acc;
    }, {} as Record<number, Match[]>);

    return (
      <div className="space-y-4">
        {Object.entries(matchesByRound)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([round, roundMatches]) => (
            <div key={round} className="space-y-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Rodada {round} ({roundMatches.filter(m => m.status === 'finalizado').length}/{roundMatches.length})
              </div>
              <div className="space-y-2">
                {roundMatches.map(match => renderMatch(match))}
              </div>
            </div>
          ))}
      </div>
    );
  }, [renderMatch]);

  const getStatusColor = (status: BracketState['status']) => {
    switch (status) {
      case 'nao-gerado':
        return 'text-gray-500';
      case 'gerado':
        return 'text-yellow-600';
      case 'em-andamento':
        return 'text-blue-600';
      case 'finalizado':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: BracketState['status']) => {
    switch (status) {
      case 'nao-gerado':
        return 'Não gerado';
      case 'gerado':
        return 'Pronto para começar';
      case 'em-andamento':
        return 'Em andamento';
      case 'finalizado':
        return 'Finalizado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
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
          {/* Header */}
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
                  <button
                    onClick={generateBracket}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Shuffle className="h-4 w-4" />
                    Sortear 1ª Rodada
                  </button>
                )}
                
                {canReshuffle && (
                  <button
                    onClick={generateBracket}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Shuffle className="h-4 w-4" />
                    Re-sortear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {categoriaAtual.duplas.length < 4 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Duplas insuficientes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                São necessárias pelo menos 4 duplas para gerar o chaveamento.
                <br />
                Duplas cadastradas: {categoriaAtual.duplas.length}
              </p>
            </div>
          ) : categoriaAtual.chaveamento.status === 'nao-gerado' ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chaveamento não gerado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {canEdit 
                  ? 'Clique em "Sortear 1ª Rodada" para gerar o chaveamento'
                  : 'Aguarde o chaveamento ser gerado'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tournament Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {categoriaAtual.duplas.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Duplas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {categoriaAtual.chaveamento.matches.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Partidas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {categoriaAtual.chaveamento.matches.filter(m => m.placar).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Finalizadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {categoriaAtual.chaveamento.roundAtual || 1}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rodada Atual</div>
                  </div>
                </div>
              </div>

              {/* Matches Display */}
              <div>
                {categoriaAtual.chaveamento.matches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Nenhuma partida gerada ainda
                    </p>
                  </div>
                ) : categoriaAtual.formato === 'double' ? (
                  // Double Elimination Layout
                  <div className="space-y-8">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Chaveamento Dupla Eliminação
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Winner Bracket */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
                          🏆 Chave dos Vencedores
                        </h4>
                        {renderBracketMatches(categoriaAtual.chaveamento.matches.filter(m => m.fase === 'WB'))}
                      </div>
                      
                      {/* Loser Bracket */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
                          🥈 Chave dos Perdedores
                        </h4>
                        {renderBracketMatches(categoriaAtual.chaveamento.matches.filter(m => m.fase === 'LB'))}
                      </div>
                      
                      {/* Finals and Special Matches */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white border-b pb-2">
                          🎯 Fases Finais
                        </h4>
                        <div className="space-y-3">
                          {/* Semifinals */}
                          {categoriaAtual.chaveamento.matches.filter(m => m.fase === 'SF').map(match => (
                            <div key={match.id}>
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Semifinal {match.id.includes('_1') ? '1' : '2'}
                              </div>
                              {renderMatch(match)}
                            </div>
                          ))}
                          
                          {/* 3rd Place */}
                          {categoriaAtual.chaveamento.matches.filter(m => m.fase === '3P').map(match => (
                            <div key={match.id}>
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                🥉 Disputa 3º Lugar
                              </div>
                              {renderMatch(match)}
                            </div>
                          ))}
                          
                          {/* Grand Final */}
                          {categoriaAtual.chaveamento.matches.filter(m => m.fase === 'F').map(match => (
                            <div key={match.id}>
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                🏅 Grande Final
                              </div>
                              {renderMatch(match)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Single Elimination Layout (existing logic)
                  <div className="space-y-6">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Partidas por Rodada
                    </h3>
                    
                    {Object.entries(
                      categoriaAtual.chaveamento.matches.reduce((acc, match) => {
                        if (!acc[match.round]) {
                          acc[match.round] = [];
                        }
                        acc[match.round]!.push(match);
                        return acc;
                      }, {} as Record<number, Match[]>)
                    )
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([round, matches]) => {
                        const roundNum = Number(round);
                        const getRoundLabel = (round: number) => {
                          const totalRounds = Math.max(...categoriaAtual.chaveamento.matches.map(m => m.round));
                          if (round === totalRounds) return 'Final';
                          if (round === totalRounds - 1) return 'Semifinal';
                          return `Rodada ${round}`;
                        };
                        
                        return (
                          <div key={round} className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                {getRoundLabel(roundNum)}
                              </h4>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ({matches.filter(m => m.status === 'finalizado').length}/{matches.length} finalizadas)
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {matches.map((match) => renderMatch(match))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!selectedCategoria && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Selecione uma categoria
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha uma categoria acima para gerenciar o chaveamento
          </p>
        </div>
      )}
    </div>
  );
};