import React, { useState, useCallback, useEffect } from 'react';
import { useAppState } from '@/contexts';
import { X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { torneioStateUtils } from '@/utils/torneioStateUtils';
import toast from 'react-hot-toast';
import type { Dupla, Jogador, ModalProps } from '@/types';

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

interface DuplaFormModalProps extends ModalProps {
  dupla?: Dupla | null;
  onSubmit: (dupla: Dupla) => void;
}

export const DuplaFormModal: React.FC<DuplaFormModalProps> = ({
  isOpen,
  onClose,
  dupla,
  onSubmit
}) => {
  const { dadosMockados } = useAppState();
  const [formData, setFormData] = useState<DuplaFormData>({
    nome: '',
    jogador1: { tipo: 'aluno', nome: '' },
    jogador2: { tipo: 'aluno', nome: '' }
  });

  const alunos = dadosMockados.alunos;
  const isEditing = !!dupla;

  useEffect(() => {
    if (dupla) {
      setFormData({
        nome: dupla.nome || '',
        jogador1: dupla.jogadores[0],
        jogador2: dupla.jogadores[1]
      });
    } else {
      setFormData({
        nome: '',
        jogador1: { tipo: 'aluno', nome: '' },
        jogador2: { tipo: 'aluno', nome: '' }
      });
    }
  }, [dupla]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jogador1.nome.trim() || !formData.jogador2.nome.trim()) {
      toast.error('Todos os jogadores devem ter nome');
      return;
    }

    const newDupla: Dupla = {
      id: dupla?.id || `dupla_${nanoid()}`,
      ...(formData.nome.trim() && { nome: formData.nome.trim() }),
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
      inscritoEm: dupla?.inscritoEm || new Date().toISOString()
    };

    // Validate duplicate players before submitting
    if (!torneioStateUtils.validateDuplaPlayers(newDupla)) {
      toast.error('Não é possível criar uma dupla com o mesmo jogador nas duas posições');
      return;
    }

    onSubmit(newDupla);
    onClose();
  }, [formData, dupla, onSubmit, onClose]);

  const handleJogadorChange = useCallback((jogadorIndex: 1 | 2, field: string, value: string) => {
    const jogadorKey = `jogador${jogadorIndex}` as 'jogador1' | 'jogador2';
    
    setFormData(prev => {
      const newFormData = { ...prev };
      
      if (field === 'tipo') {
        newFormData[jogadorKey] = {
          tipo: value as 'aluno' | 'convidado',
          nome: ''
        };
        if (value === 'aluno') {
          delete newFormData[jogadorKey].id;
        }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Dupla' : 'Nova Dupla'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome da Dupla */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Dupla (opcional)
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Digite o nome"
                        required
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};