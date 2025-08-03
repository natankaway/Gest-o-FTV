import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { X, AlertCircle } from 'lucide-react';
import type { Agendamento, AgendamentoFormData } from '@/types';

interface NovoAgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAgendamento?: Agendamento | null;
}

const INITIAL_FORM_DATA: AgendamentoFormData = {
  professorId: 0,
  data: new Date().toISOString().substring(0, 10),
  horaInicio: '09:00',
  horaFim: '10:00',
  tipo: 'aula',
  unidade: 'Centro',
  status: 'confirmado',
  observacoes: '',
  recorrencia: {
    tipo: 'nenhuma',
    quantidade: 1
  }
};

export const NovoAgendamentoModal: React.FC<NovoAgendamentoModalProps> = ({
  isOpen,
  onClose,
  editingAgendamento
}) => {
  const { dadosMockados, setAgendamentos } = useAppState();
  const { alunos, professores, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<AgendamentoFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string>('');

  // Initialize form when editing
  useEffect(() => {
    if (editingAgendamento) {
      const editFormData: AgendamentoFormData = {
        professorId: editingAgendamento.professorId,
        data: editingAgendamento.data,
        horaInicio: editingAgendamento.horaInicio,
        horaFim: editingAgendamento.horaFim,
        tipo: editingAgendamento.tipo,
        unidade: editingAgendamento.unidade,
        status: editingAgendamento.status,
        observacoes: editingAgendamento.observacoes || '',
        recorrencia: editingAgendamento.recorrencia || { tipo: 'nenhuma', quantidade: 1 }
      };
      
      if (editingAgendamento.alunoId) {
        editFormData.alunoId = editingAgendamento.alunoId;
      }
      
      setFormData(editFormData);
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
    setConflictWarning('');
  }, [editingAgendamento, isOpen]);

  // Check for time conflicts
  useEffect(() => {
    if (formData.professorId && formData.data && formData.horaInicio && formData.horaFim) {
      const checkConflicts = () => {
        const existingAgendamentos = dadosMockados.agendamentos.filter(ag => 
          ag.professorId === formData.professorId &&
          ag.data === formData.data &&
          ag.status !== 'cancelado' &&
          (!editingAgendamento || ag.id !== editingAgendamento.id)
        );

        for (const ag of existingAgendamentos) {
          const existingStart = ag.horaInicio;
          const existingEnd = ag.horaFim;
          const newStart = formData.horaInicio;
          const newEnd = formData.horaFim;

          // Check for overlap
          if ((newStart >= existingStart && newStart < existingEnd) ||
              (newEnd > existingStart && newEnd <= existingEnd) ||
              (newStart <= existingStart && newEnd >= existingEnd)) {
            setConflictWarning(`Conflito de horário detectado com agendamento das ${existingStart} às ${existingEnd}`);
            return;
          }
        }
        setConflictWarning('');
      };

      checkConflicts();
    }
  }, [formData.professorId, formData.data, formData.horaInicio, formData.horaFim, dadosMockados.agendamentos, editingAgendamento]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.professorId) {
      newErrors.professorId = 'Professor é obrigatório';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.horaInicio) {
      newErrors.horaInicio = 'Hora de início é obrigatória';
    }

    if (!formData.horaFim) {
      newErrors.horaFim = 'Hora de fim é obrigatória';
    }

    if (formData.horaInicio && formData.horaFim && formData.horaInicio >= formData.horaFim) {
      newErrors.horaFim = 'Hora de fim deve ser posterior à hora de início';
    }

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    if (formData.tipo === 'aula' && !formData.alunoId) {
      newErrors.alunoId = 'Aluno é obrigatório para aulas individuais';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (conflictWarning && !window.confirm('Existe um conflito de horário. Deseja continuar mesmo assim?')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const professor = professores.find(p => p.id === formData.professorId);
      const aluno = formData.alunoId ? alunos.find(a => a.id === formData.alunoId) : undefined;
      
      if (editingAgendamento) {
        // Update existing agendamento
        setAgendamentos(prev => prev.map(agendamento => {
          if (agendamento.id === editingAgendamento.id) {
            const updatedAgendamento: Agendamento = {
              ...agendamento, 
              ...formData,
              professor: professor?.nome || '',
            };
            
            if (aluno?.nome) {
              updatedAgendamento.aluno = aluno.nome;
            }
            
            return updatedAgendamento;
          }
          return agendamento;
        }));
        
        addNotification({
          type: 'success',
          title: 'Agendamento atualizado',
          message: `Agendamento foi atualizado com sucesso!`
        });
      } else {
        // Create new agendamento(s)
        const newAgendamentos: Agendamento[] = [];
        
        const createAgendamento = (baseData: AgendamentoFormData, id: number, dataOverride?: string): Agendamento => {
          const agendamento: Agendamento = {
            id,
            ...baseData,
            data: dataOverride || baseData.data,
            professor: professor?.nome || ''
          };
          
          if (aluno?.nome) {
            agendamento.aluno = aluno.nome;
          }
          
          return agendamento;
        };

        if (formData.recorrencia?.tipo === 'nenhuma') {
          newAgendamentos.push(createAgendamento(formData, Date.now()));
        } else {
          // Handle recurrence
          const quantidade = formData.recorrencia?.quantidade || 1;
          const intervaloSemanas = formData.recorrencia?.tipo === 'semanal' ? 1 : 
                                   formData.recorrencia?.tipo === 'quinzenal' ? 2 : 4;
          
          for (let i = 0; i < quantidade; i++) {
            const dataAgendamento = new Date(formData.data);
            dataAgendamento.setDate(dataAgendamento.getDate() + (i * intervaloSemanas * 7));
            
            newAgendamentos.push(createAgendamento(
              formData,
              Date.now() + i,
              dataAgendamento.toISOString().substring(0, 10)
            ));
          }
        }

        setAgendamentos(prev => [...prev, ...newAgendamentos]);
        
        addNotification({
          type: 'success',
          title: 'Agendamento criado',
          message: `${newAgendamentos.length} agendamento(s) criado(s) com sucesso!`
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar o agendamento. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingAgendamento, conflictWarning, setAgendamentos, addNotification, onClose, professores, alunos]);

  const handleInputChange = useCallback((field: keyof AgendamentoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const availableProfessores = professores.filter(professor => professor.ativo);
  const availableAlunos = alunos.filter(aluno => aluno.status === 'ativo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Conflict Warning */}
          {conflictWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">{conflictWarning}</p>
              </div>
            </div>
          )}

          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professor *
              </label>
              <select
                value={formData.professorId || ''}
                onChange={(e) => handleInputChange('professorId', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.professorId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione um professor</option>
                {availableProfessores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
              {errors.professorId && <p className="text-red-500 text-xs mt-1">{errors.professorId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Agendamento *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="aula">Aula Individual</option>
                <option value="treino">Treino em Grupo</option>
                <option value="avaliacao">Avaliação</option>
                <option value="individual">Atendimento Individual</option>
              </select>
            </div>

            {formData.tipo === 'aula' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aluno *
                </label>
                <select
                  value={formData.alunoId || ''}
                  onChange={(e) => handleInputChange('alunoId', e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.alunoId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Selecione um aluno</option>
                  {availableAlunos.map(aluno => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </option>
                  ))}
                </select>
                {errors.alunoId && <p className="text-red-500 text-xs mt-1">{errors.alunoId}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidade *
              </label>
              <select
                value={formData.unidade}
                onChange={(e) => handleInputChange('unidade', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.unidade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map(unidade => (
                  <option key={unidade.id} value={unidade.nome}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
              {errors.unidade && <p className="text-red-500 text-xs mt-1">{errors.unidade}</p>}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data *
              </label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.data ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora Início *
              </label>
              <input
                type="time"
                value={formData.horaInicio}
                onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.horaInicio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.horaInicio && <p className="text-red-500 text-xs mt-1">{errors.horaInicio}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora Fim *
              </label>
              <input
                type="time"
                value={formData.horaFim}
                onChange={(e) => handleInputChange('horaFim', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.horaFim ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.horaFim && <p className="text-red-500 text-xs mt-1">{errors.horaFim}</p>}
            </div>
          </div>

          {/* Status and Recurrence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {!editingAgendamento && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recorrência
                </label>
                <select
                  value={formData.recorrencia?.tipo || 'nenhuma'}
                  onChange={(e) => handleInputChange('recorrencia', { 
                    ...formData.recorrencia, 
                    tipo: e.target.value as any 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="nenhuma">Não repetir</option>
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
            )}
          </div>

          {/* Recurrence quantity */}
          {!editingAgendamento && formData.recorrencia?.tipo !== 'nenhuma' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantidade de repetições
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={formData.recorrencia?.quantidade || 1}
                onChange={(e) => handleInputChange('recorrencia', { 
                  ...formData.recorrencia, 
                  quantidade: Number(e.target.value) 
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Observações adicionais sobre o agendamento..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : editingAgendamento ? 'Atualizar' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};