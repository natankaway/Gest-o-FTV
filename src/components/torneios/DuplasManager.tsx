import React, { useState, useCallback, useMemo } from 'react';
import { useAppState } from '@/contexts';
import { Plus, Edit2, Trash2, Users, User, UserCheck } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { Torneio, Dupla, Jogador, Aluno } from '@/types';

interface DuplasManagerProps {
  torneio: Torneio;
  onUpdateTorneio: (torneio: Torneio) => void;
  selectedCategoria: string | null;
  onSelectCategoria: (categoriaId: string | null) => void;
  canEdit: boolean;
}

interface DuplaFormData {
  nome: string;
  jogador1: {
    tipo: 'aluno' | 'convidado';
    id?: string;
    nome: string;
  };
  jogador2: {
    tipo: 'aluno' | 'convidado';
    id?: string;
    nome: string;
  };
}

export const DuplasManager: React.FC<DuplasManagerProps> = ({
  torneio,
  onUpdateTorneio,
  selectedCategoria,
  onSelectCategoria,
  canEdit
}) => {
  const { dadosMockados } = useAppState();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DuplaFormData>({
    nome: '',
    jogador1: { tipo: 'aluno', nome: '' },
    jogador2: { tipo: 'aluno', nome: '' }
  });

  const alunos = dadosMockados.alunos;
  const categoriaAtual = selectedCategoria ? torneio.categorias.find(c => c.id === selectedCategoria) : null;

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      jogador1: { tipo: 'aluno', nome: '' },
      jogador2: { tipo: 'aluno', nome: '' }
    });
    setIsAdding(false);
    setEditingId(null);
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedCategoria) return;
    setIsAdding(true);
    resetForm();
  }, [selectedCategoria, resetForm]);

  const handleEdit = useCallback((dupla: Dupla) => {
    setFormData({
      nome: dupla.nome || '',
      jogador1: dupla.jogadores[0],
      jogador2: dupla.jogadores[1]
    });
    setEditingId(dupla.id);
    setIsAdding(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoria || !formData.jogador1.nome.trim() || !formData.jogador2.nome.trim()) {
      return;
    }

    const newDupla: Dupla = {
      id: editingId || `dupla_${nanoid()}`,
      nome: formData.nome.trim() || undefined,
      jogadores: [
        {
          tipo: formData.jogador1.tipo,
          ...(formData.jogador1.tipo === 'aluno' && formData.jogador1.id && { id: formData.jogador1.id }),
          nome: formData.jogador1.nome.trim()
        },
        {
          tipo: formData.jogador2.tipo,
          ...(formData.jogador2.tipo === 'aluno' && formData.jogador2.id && { id: formData.jogador2.id }),
          nome: formData.jogador2.nome.trim()
        }
      ] as [Jogador, Jogador],
      inscritoEm: new Date().toISOString()
    };

    const updatedTorneio = {
      ...torneio,
      categorias: torneio.categorias.map(categoria => {
        if (categoria.id === selectedCategoria) {
          const duplas = editingId
            ? categoria.duplas.map(d => d.id === editingId ? newDupla : d)
            : [...categoria.duplas, newDupla];
          
          return { ...categoria, duplas };
        }
        return categoria;
      })
    };

    onUpdateTorneio(updatedTorneio);
    resetForm();
  }, [formData, editingId, selectedCategoria, torneio, onUpdateTorneio, resetForm]);

  const handleDelete = useCallback((duplaId: string) => {
    if (!selectedCategoria) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta dupla?')) {
      const updatedTorneio = {
        ...torneio,
        categorias: torneio.categorias.map(categoria => {
          if (categoria.id === selectedCategoria) {
            return {
              ...categoria,
              duplas: categoria.duplas.filter(d => d.id !== duplaId)
            };
          }
          return categoria;
        })
      };

      onUpdateTorneio(updatedTorneio);
    }
  }, [selectedCategoria, torneio, onUpdateTorneio]);

  const handleJogadorChange = useCallback((jogadorIndex: 1 | 2, field: string, value: string) => {
    const jogadorKey = `jogador${jogadorIndex}` as 'jogador1' | 'jogador2';
    
    setFormData(prev => {
      const newFormData = { ...prev };
      
      if (field === 'tipo') {
        newFormData[jogadorKey] = {
          tipo: value as 'aluno' | 'convidado',
          nome: '',
          ...(value === 'aluno' && { id: undefined })
        };
      } else if (field === 'alunoId' && value) {
        const aluno = alunos.find(a => a.id.toString() === value);
        if (aluno) {
          newFormData[jogadorKey] = {
            tipo: 'aluno',
            id: value,
            nome: aluno.nome
          };
        }
      } else {
        newFormData[jogadorKey] = {
          ...newFormData[jogadorKey],
          [field]: value
        };
      }
      
      return newFormData;
    });
  }, [alunos]);

  const canAddMore = useMemo(() => {
    if (!categoriaAtual) return false;
    return !categoriaAtual.limiteDuplas || categoriaAtual.duplas.length < categoriaAtual.limiteDuplas;
  }, [categoriaAtual]);

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
              {categoria.nome} ({categoria.duplas.length} duplas
              {categoria.limiteDuplas && ` / ${categoria.limiteDuplas}`})
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
                Duplas - {categoriaAtual.nome}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {canEdit ? 'Gerencie as duplas desta categoria' : 'Visualize as duplas desta categoria'}
              </p>
            </div>
            {canEdit && !isAdding && !editingId && canAddMore && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Dupla
              </button>
            )}
          </div>

          {!canAddMore && canEdit && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Limite de duplas atingido para esta categoria ({categoriaAtual.limiteDuplas} duplas).
              </p>
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                {editingId ? 'Editar Dupla' : 'Nova Dupla'}
              </h3>
              
              <div className="space-y-4">
                {/* Nome da Dupla */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Dupla (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ex: Dupla Relâmpago"
                  />
                </div>

                {/* Jogadores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((jogadorIndex) => {
                    const jogadorKey = `jogador${jogadorIndex}` as 'jogador1' | 'jogador2';
                    const jogador = formData[jogadorKey];
                    
                    return (
                      <div key={jogadorIndex} className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Jogador {jogadorIndex} *
                        </h4>
                        
                        {/* Tipo */}
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Tipo
                          </label>
                          <select
                            value={jogador.tipo}
                            onChange={(e) => handleJogadorChange(jogadorIndex as 1 | 2, 'tipo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          >
                            <option value="aluno">Aluno</option>
                            <option value="convidado">Convidado</option>
                          </select>
                        </div>

                        {/* Aluno Selector ou Nome */}
                        {jogador.tipo === 'aluno' ? (
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Selecionar Aluno
                            </label>
                            <select
                              value={jogador.id || ''}
                              onChange={(e) => handleJogadorChange(jogadorIndex as 1 | 2, 'alunoId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              required
                            >
                              <option value="">Escolha um aluno...</option>
                              {alunos.map(aluno => (
                                <option key={aluno.id} value={aluno.id}>
                                  {aluno.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Nome do Convidado
                            </label>
                            <input
                              type="text"
                              value={jogador.nome}
                              onChange={(e) => handleJogadorChange(jogadorIndex as 1 | 2, 'nome', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              placeholder="Digite o nome"
                              required
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          )}

          {/* Duplas List */}
          {categoriaAtual.duplas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma dupla cadastrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {canEdit ? 'Adicione duplas para esta categoria' : 'Aguarde as duplas serem cadastradas'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriaAtual.duplas.map((dupla) => (
                <div
                  key={dupla.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {dupla.nome && (
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {dupla.nome}
                        </h3>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(dupla)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(dupla.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {dupla.jogadores.map((jogador, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {jogador.tipo === 'aluno' ? (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <User className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-gray-900 dark:text-white">
                          {jogador.nome}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {jogador.tipo === 'aluno' ? '(Aluno)' : '(Convidado)'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                    Inscrito em: {new Date(dupla.inscritoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedCategoria && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Selecione uma categoria
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha uma categoria acima para gerenciar suas duplas
          </p>
        </div>
      )}
    </div>
  );
};