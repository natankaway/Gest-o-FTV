// src/components/forms/NovaAulaExperimentalModal.tsx
import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button, Modal } from '@/components/common';
import { 
  User, Calendar, Clock, MapPin, Phone, Mail, 
  GraduationCap, AlertTriangle, CheckCircle, X 
} from 'lucide-react';
import type { AulaExperimental, AulaExperimentalFormData, ModalProps } from '@/types';

interface NovaAulaExperimentalModalProps extends ModalProps {
  editingAula?: AulaExperimental | null;
  onSave: (data: AulaExperimentalFormData) => void;
}

const INITIAL_FORM_DATA: AulaExperimentalFormData = {
  alunoId: 0,
  telefone: '',
  email: '',
  dataAgendamento: '',
  status: 'agendada',
  unidade: '',
  observacoes: ''
};

export const NovaAulaExperimentalModal: React.FC<NovaAulaExperimentalModalProps> = memo(({
  isOpen,
  onClose,
  editingAula,
  onSave
}) => {
  const { dadosMockados, userLogado, unidadeSelecionada } = useAppState();
  const { addNotification } = useNotifications();
  const { professores, unidades, alunos } = dadosMockados;

  const [formData, setFormData] = useState<AulaExperimentalFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isNewStudent, setIsNewStudent] = useState(true);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
  if (isOpen) {
    if (editingAula) {
      setFormData({
        alunoId: editingAula.alunoId,
        telefone: editingAula.telefone,
        email: editingAula.email,
        dataAgendamento: editingAula.dataAgendamento,
        status: editingAula.status,
        professorId: editingAula.professorId || 0,
        unidade: editingAula.unidade,
        observacoes: editingAula.observacoes || ''
      });
      setIsNewStudent(false);
    } else {
      // Para nova aula, sempre usar a unidade selecionada
      const unidadeInicial = unidadeSelecionada || '';
      setFormData({
        ...INITIAL_FORM_DATA,
        unidade: unidadeInicial
      });
      setIsNewStudent(true);
      
      // Debug log
      console.log('Nova aula - Unidade inicial:', unidadeInicial);
    }
    setErrors({});
  }
}, [isOpen, editingAula, unidadeSelecionada]);

  // Filter available students (only those without experimental class)
 // Filter available students (only those without experimental class and from correct unit)
useEffect(() => {
  const experimentalAlunos = dadosMockados.aulasExperimentais?.map(a => a.alunoId) || [];
  
  const disponiveisParaExperimental = alunos.filter(aluno => {
    // 1. NÃO pode ter plano ativo (só experimentais ou sem plano)
    const temPlanoAtivo = aluno.tipoPlano === 'mensalidade' || aluno.tipoPlano === 'plataforma';
    
    // 2. NÃO pode ter feito experimental já
    const jaFezExperimental = experimentalAlunos.includes(aluno.id);
    
    // 3. DEVE ser da unidade selecionada no formulário
    const unidadeDoFormulario = formData.unidade;
    const unidadePermitida = unidadeDoFormulario ? aluno.unidade === unidadeDoFormulario : false;
    
    // Log para debug (pode remover depois)
    console.log('Filtro aluno:', {
      nome: aluno.nome,
      unidadeAluno: aluno.unidade,
      unidadeFormulario: unidadeDoFormulario,
      temPlanoAtivo,
      jaFezExperimental,
      unidadePermitida,
      incluir: !temPlanoAtivo && !jaFezExperimental && unidadePermitida
    });
    
    return !temPlanoAtivo && !jaFezExperimental && unidadePermitida;
  });
  
  setAvailableStudents(disponiveisParaExperimental);
}, [alunos, dadosMockados.aulasExperimentais, formData.unidade]);

  // Filter professors and units based on user permissions
  const availableProfessors = professores.filter(prof => {
    if (userLogado?.perfil === 'admin') return true;
    return prof.unidades?.includes(unidadeSelecionada) || prof.unidade === unidadeSelecionada;
  });

  const availableUnits = unidades.filter(unidade => {
    if (userLogado?.perfil === 'admin') return true;
    if (userLogado?.perfil === 'gestor') {
      return userLogado.unidades?.includes(unidade.nome) || userLogado.unidade === unidade.nome;
    }
    return unidade.nome === unidadeSelecionada;
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-fill student data when selecting existing student
    if (field === 'alunoId' && !isNewStudent && value) {
      const selectedStudent = availableStudents.find(s => s.id === parseInt(value));
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          telefone: selectedStudent.telefone,
          email: selectedStudent.email
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Student validation
    if (isNewStudent) {
      if (!formData.telefone.trim()) {
        newErrors.telefone = 'Telefone é obrigatório';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    } else {
      if (!formData.alunoId) {
        newErrors.alunoId = 'Selecione um aluno';
      }
    }

    // Date validation
    if (!formData.dataAgendamento) {
      newErrors.dataAgendamento = 'Data e hora são obrigatórias';
    } else {
      const agendamento = new Date(formData.dataAgendamento);
      const now = new Date();
      if (agendamento <= now && formData.status === 'agendada') {
        newErrors.dataAgendamento = 'Data deve ser futura para aulas agendadas';
      }
    }

  
    // Unit validation
    if (!formData.unidade) {
      newErrors.unidade = 'Selecione uma unidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Formulário inválido',
        message: 'Por favor, corrija os erros antes de continuar.'
      });
      return;
    }

    // Check if student already has experimental class (only for new students)
    if (!editingAula && !isNewStudent) {
      const existingExperimental = dadosMockados.aulasExperimentais?.find(
        aula => aula.alunoId === formData.alunoId
      );
      
      if (existingExperimental) {
        addNotification({
          type: 'error',
          title: 'Aluno já possui aula experimental',
          message: 'Este aluno já fez ou tem uma aula experimental agendada.'
        });
        return;
      }
    }

    onSave(formData);
    addNotification({
      type: 'success',
      title: editingAula ? 'Aula experimental atualizada' : 'Aula experimental agendada',
      message: editingAula ? 'As informações foram atualizadas com sucesso.' : 'A aula experimental foi agendada com sucesso.'
    });
    onClose();
  }, [formData, validateForm, onSave, onClose, addNotification, editingAula, isNewStudent, dadosMockados.aulasExperimentais]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'agendada': 'text-blue-600 bg-blue-100',
      'realizada': 'text-green-600 bg-green-100',
      'nao-compareceu': 'text-red-600 bg-red-100',
      'convertido': 'text-purple-600 bg-purple-100',
      'inativo': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || colors['agendada'];
  };

  const canEditStatus = userLogado?.perfil !== 'professor';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          {editingAula ? 'Editar Aula Experimental' : 'Nova Aula Experimental'}
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informação sobre regra de negócio */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Regra da Aula Experimental
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Cada aluno pode fazer apenas <strong>uma aula experimental gratuita</strong>. 
                Após a aula, o aluno deve ser convertido para um plano pago ou inativado.
              </p>
            </div>
          </div>
        </div>

        {/* Seleção do tipo de aluno */}
        {!editingAula && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Dados do Aluno
            </h4>
            
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="new"
                  checked={isNewStudent}
                  onChange={() => {
                    setIsNewStudent(true);
                    setFormData(prev => ({ ...prev, alunoId: 0, telefone: '', email: '' }));
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Novo Aluno</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="existing"
                  checked={!isNewStudent}
                  onChange={() => {
                    setIsNewStudent(false);
                    setFormData(prev => ({ ...prev, alunoId: 0, telefone: '', email: '' }));
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Aluno Existente</span>
              </label>
            </div>
          </div>
        )}

        {/* Dados do aluno */}
        <div className="grid grid-cols-1 gap-4">
          {isNewStudent ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Selecionar Aluno *
              </label>
              <select
                value={formData.alunoId}
                onChange={(e) => handleInputChange('alunoId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.alunoId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Escolha um aluno...</option>
                {availableStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.nome} - {student.telefone}
                  </option>
                ))}
              </select>
              {availableStudents.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">
                  Todos os alunos cadastrados já possuem aula experimental
                </p>
              )}
              {errors.alunoId && <p className="text-red-500 text-xs mt-1">{errors.alunoId}</p>}
              
              {/* Mostrar dados do aluno selecionado */}
              {formData.alunoId && !isNewStudent && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {formData.telefone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {formData.email}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agendamento */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Agendamento
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.dataAgendamento ? new Date(formData.dataAgendamento).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('dataAgendamento', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.dataAgendamento ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.dataAgendamento && <p className="text-red-500 text-xs mt-1">{errors.dataAgendamento}</p>}
            </div>

            {canEditStatus && editingAula && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="nao-compareceu">Não Compareceu</option>
                  <option value="convertido">Convertido</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Unidade */}
        
       <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    <MapPin className="inline h-4 w-4 mr-1" />
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
    {availableUnits.map(unidade => (
      <option key={unidade.id} value={unidade.nome}>
        {unidade.nome}
      </option>
    ))}
  </select>
  {errors.unidade && <p className="text-red-500 text-xs mt-1">{errors.unidade}</p>}
  
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    ℹ️ O professor será definido posteriormente pela recepção
  </p>
</div>
        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={3}
            placeholder="Observações sobre a aula experimental..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            leftIcon={<X className="h-4 w-4" />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            {editingAula ? 'Atualizar' : 'Agendar'} Aula
          </Button>
        </div>
      </form>
    </Modal>
  );
});