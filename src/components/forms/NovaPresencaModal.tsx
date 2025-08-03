import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Modal, Button, Input } from '@/components/common';
import type { Presenca } from '@/types';

interface NovaPresencaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPresenca?: Presenca | null;
}

interface NovaPresencaFormData {
  alunoId: number;
  professorId: number;
  data: string;
  hora: string;
  unidade: string;
  tipo: 'treino' | 'aula' | 'individual';
  status: 'presente' | 'falta';
}

const INITIAL_FORM_DATA: NovaPresencaFormData = {
  alunoId: 0,
  professorId: 0,
  data: new Date().toISOString().substring(0, 10),
  hora: '',
  unidade: 'Centro',
  tipo: 'aula',
  status: 'presente'
};

export const NovaPresencaModal: React.FC<NovaPresencaModalProps> = ({
  isOpen,
  onClose,
  editingPresenca
}) => {
  const { dadosMockados, setPresencas } = useAppState();
  const { alunos, professores, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<NovaPresencaFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get active students and professors only
  const activeAlunos = alunos.filter(aluno => aluno.status === 'ativo');
  const activeProfessores = professores.filter(professor => professor.ativo);

  // Initialize form when editing
  useEffect(() => {
    if (editingPresenca) {
      setFormData({
        alunoId: editingPresenca.alunoId,
        professorId: editingPresenca.professorId,
        data: editingPresenca.data,
        hora: editingPresenca.hora,
        unidade: editingPresenca.unidade,
        tipo: editingPresenca.tipo,
        status: editingPresenca.status
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
  }, [editingPresenca, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.alunoId || formData.alunoId === 0) {
      newErrors.alunoId = 'Selecione um aluno';
    }

    if (!formData.professorId || formData.professorId === 0) {
      newErrors.professorId = 'Selecione um professor';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.hora) {
      newErrors.hora = 'Hora é obrigatória';
    }

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((field: keyof NovaPresencaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const getAlunoName = (alunoId: number): string => {
    const aluno = activeAlunos.find(a => a.id === alunoId);
    return aluno?.nome || '';
  };

  const getProfessorName = (professorId: number): string => {
    const professor = activeProfessores.find(p => p.id === professorId);
    return professor?.nome || '';
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const presencaData: Presenca = {
        id: editingPresenca ? editingPresenca.id : Date.now(),
        alunoId: formData.alunoId,
        aluno: getAlunoName(formData.alunoId),
        professorId: formData.professorId,
        professor: getProfessorName(formData.professorId),
        data: formData.data,
        hora: formData.hora,
        unidade: formData.unidade,
        tipo: formData.tipo,
        status: formData.status
      };

      if (editingPresenca) {
        // Update existing presence
        setPresencas(prev => prev.map(p => p.id === editingPresenca.id ? presencaData : p));
        addNotification({
          type: 'success',
          title: 'Presença atualizada',
          message: 'Os dados da presença foram atualizados com sucesso!'
        });
      } else {
        // Add new presence
        setPresencas(prev => [...prev, presencaData]);
        addNotification({
          type: 'success',
          title: 'Presença registrada',
          message: 'Nova presença adicionada com sucesso!'
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro ao salvar os dados da presença'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingPresenca, validateForm, setPresencas, addNotification, onClose, activeAlunos, activeProfessores]);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const setCurrentTime = useCallback(() => {
    handleInputChange('hora', getCurrentTime());
  }, [handleInputChange]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPresenca ? 'Editar Presença' : 'Nova Presença'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Participantes */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Participantes
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aluno *
              </label>
              <select
                value={formData.alunoId}
                onChange={(e) => handleInputChange('alunoId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.alunoId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value={0}>Selecione um aluno</option>
                {activeAlunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} - {aluno.unidade}
                  </option>
                ))}
              </select>
              {errors.alunoId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.alunoId}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professor *
              </label>
              <select
                value={formData.professorId}
                onChange={(e) => handleInputChange('professorId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.professorId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value={0}>Selecione um professor</option>
                {activeProfessores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
              {errors.professorId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.professorId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Data e Hora */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Data e Hora
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              error={errors.data}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora *
              </label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => handleInputChange('hora', e.target.value)}
                  error={errors.hora}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={setCurrentTime}
                  className="px-3"
                >
                  Agora
                </Button>
              </div>
              {errors.hora && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.hora}</p>
              )}
            </div>
          </div>
        </div>

        {/* Detalhes da Atividade */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Detalhes da Atividade
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidade *
              </label>
              <select
                value={formData.unidade}
                onChange={(e) => handleInputChange('unidade', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.unidade ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.nome}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
              {errors.unidade && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unidade}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Atividade *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value as NovaPresencaFormData['tipo'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="aula">Aula</option>
                <option value="treino">Treino</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as NovaPresencaFormData['status'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="presente">Presente</option>
                <option value="falta">Falta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Actions for Current Time */}
        {!editingPresenca && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Ações Rápidas
            </h5>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  handleInputChange('data', new Date().toISOString().substring(0, 10));
                  setCurrentTime();
                }}
              >
                Data/Hora Atual
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleInputChange('status', 'presente')}
              >
                Marcar Presente
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleInputChange('status', 'falta')}
              >
                Marcar Falta
              </Button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full sm:w-auto"
          >
            {editingPresenca ? 'Atualizar Presença' : 'Registrar Presença'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};