import React, { useState, useCallback, useMemo } from 'react';
import { Target, Shuffle, Play } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { Torneio, Match, BracketState } from '@/types';

interface ChaveamentoViewProps {
  torneio: Torneio;
  onUpdateTorneio: (torneio: Torneio) => void;
  selectedCategoria: string | null;
  onSelectCategoria: (categoriaId: string | null) => void;
  canEdit: boolean;
}

interface MatchResultFormData {
  placarA: string;
  placarB: string;
}

export const ChaveamentoView: React.FC<ChaveamentoViewProps> = ({
  torneio,
  onUpdateTorneio,
  selectedCategoria,
  onSelectCategoria,
  canEdit
}) => {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState<MatchResultFormData>({
    placarA: '',
    placarB: ''
  });

  const categoriaAtual = selectedCategoria ? torneio.categorias.find(c => c.id === selectedCategoria) : null;
  
  const canGenerateBracket = useMemo(() => {
    return categoriaAtual && categoriaAtual.duplas.length >= 4 && 
           categoriaAtual.chaveamento.status === 'nao-gerado';
  }, [categoriaAtual]);

  const canReshuffle = useMemo(() => {
    if (!categoriaAtual) return false;
    const hasResults = categoriaAtual.chaveamento.matches.some(match => match.placar);
    return categoriaAtual.chaveamento.status === 'gerado' && !hasResults;
  }, [categoriaAtual]);

  const generateBracket = useCallback(() => {
    if (!categoriaAtual || !selectedCategoria) return;

    // Simple bracket generation - this is a basic implementation
    // In a real tournament system, this would be much more complex
    const duplas = [...categoriaAtual.duplas];
    const numDuplas = duplas.length;
    
    // Shuffle duplas for random seeding
    for (let i = duplas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = duplas[i];
      duplas[i] = duplas[j];
      duplas[j] = temp;
    }

    const matches: Match[] = [];
    
    // Generate first round matches (Winner Bracket)
    const firstRoundMatches = Math.floor(numDuplas / 2);
    for (let i = 0; i < firstRoundMatches; i++) {
      const duplaA = duplas[i * 2];
      const duplaB = duplas[i * 2 + 1];
      if (duplaA && duplaB) {
        matches.push({
          id: `match_${nanoid()}`,
          categoriaId: selectedCategoria,
          fase: 'WB',
          round: 1,
          a: duplaA.id,
          b: duplaB.id,
          bestOf: 1
        });
      }
    }

    const newBracket: BracketState = {
      status: 'gerado',
      matches,
      roundAtual: 1,
      configuracao: {
        sorteioInicialSeed: Date.now()
      }
    };

    const updatedTorneio = {
      ...torneio,
      categorias: torneio.categorias.map(categoria => 
        categoria.id === selectedCategoria 
          ? { ...categoria, chaveamento: newBracket }
          : categoria
      )
    };

    onUpdateTorneio(updatedTorneio);
  }, [categoriaAtual, selectedCategoria, torneio, onUpdateTorneio]);

  const handleEditResult = useCallback((match: Match) => {
    setEditingMatch(match.id);
    setResultForm({
      placarA: match.placar?.a.toString() || '',
      placarB: match.placar?.b.toString() || ''
    });
  }, []);

  const handleSaveResult = useCallback(() => {
    if (!editingMatch || !categoriaAtual || !selectedCategoria) return;

    const placarA = parseInt(resultForm.placarA);
    const placarB = parseInt(resultForm.placarB);

    if (isNaN(placarA) || isNaN(placarB) || placarA < 0 || placarB < 0) {
      alert('Por favor, insira placares válidos');
      return;
    }

    if (placarA === placarB) {
      alert('O placar não pode ser empate');
      return;
    }

    const updatedMatches = categoriaAtual.chaveamento.matches.map(match => {
      if (match.id === editingMatch) {
        const vencedor = placarA > placarB ? match.a : match.b;
        const perdedor = placarA > placarB ? match.b : match.a;
        
        return {
          ...match,
          placar: { a: placarA, b: placarB },
          ...(vencedor && { vencedor }),
          ...(perdedor && { perdedor })
        };
      }
      return match;
    });

    const hasAnyResult = updatedMatches.some(match => match.placar);
    const newStatus = hasAnyResult ? 'em-andamento' : 'gerado';

    const updatedBracket: BracketState = {
      ...categoriaAtual.chaveamento,
      matches: updatedMatches,
      status: newStatus
    };

    const updatedTorneio = {
      ...torneio,
      categorias: torneio.categorias.map(categoria => 
        categoria.id === selectedCategoria 
          ? { ...categoria, chaveamento: updatedBracket }
          : categoria
      )
    };

    onUpdateTorneio(updatedTorneio);
    setEditingMatch(null);
    setResultForm({ placarA: '', placarB: '' });
  }, [editingMatch, categoriaAtual, selectedCategoria, torneio, onUpdateTorneio, resultForm]);

  const getDuplaName = useCallback((duplaId?: string) => {
    if (!duplaId || !categoriaAtual) return 'TBD';
    const dupla = categoriaAtual.duplas.find(d => d.id === duplaId);
    if (!dupla) return 'TBD';
    return dupla.nome || `${dupla.jogadores[0].nome} / ${dupla.jogadores[1].nome}`;
  }, [categoriaAtual]);

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
          {torneio.categorias.map(categoria => (
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

              {/* Matches */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                  Partidas
                </h3>
                
                {categoriaAtual.chaveamento.matches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Nenhuma partida gerada ainda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoriaAtual.chaveamento.matches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {match.fase} R{match.round}
                              </div>
                              {match.bestOf && match.bestOf > 1 && (
                                <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                                  MD{match.bestOf}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 flex items-center gap-4">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {getDuplaName(match.a)}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {getDuplaName(match.b)}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {match.placar ? (
                                  <div className="space-y-1">
                                    <div className={`font-bold ${match.vencedor === match.a ? 'text-green-600' : 'text-gray-600'}`}>
                                      {match.placar.a}
                                    </div>
                                    <div className={`font-bold ${match.vencedor === match.b ? 'text-green-600' : 'text-gray-600'}`}>
                                      {match.placar.b}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400">
                                    -<br />-
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {canEdit && match.a && match.b && (
                            <div className="ml-4">
                              {editingMatch === match.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={resultForm.placarA}
                                    onChange={(e) => setResultForm(prev => ({ ...prev, placarA: e.target.value }))}
                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-sm"
                                    placeholder="0"
                                  />
                                  <span className="text-gray-400">x</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={resultForm.placarB}
                                    onChange={(e) => setResultForm(prev => ({ ...prev, placarB: e.target.value }))}
                                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-sm"
                                    placeholder="0"
                                  />
                                  <button
                                    onClick={handleSaveResult}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingMatch(null)}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                  >
                                    Cancelar
                                  </button>
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
                    ))}
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