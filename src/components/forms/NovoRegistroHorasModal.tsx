// src/components/forms/NovoRegistroHorasModal.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button, Input } from '@/components/common';
import { X, Clock, User, MapPin, Calendar, Activity } from 'lucide-react';
import type { RegistroHorasProfessor, RegistroHorasFormData, ModalProps } from '@/types';

interface NovoRegistroHorasModalProps extends ModalProps {
  editingRegistro?: RegistroHorasProfessor | null;
  isEditing?: boolean;
}

interface FormErrors {
  data?: string;
  professorId?: string;
  horasTrabalhadas?: string;
  tipoAtividade?: string;
  unidade?: string;
}

const generateId = () => Math.floor(Math.random() * 1000000);

export const NovoRegistroHorasModal: React.FC<NovoRegistroHorasModalProps> = ({ 
  isOpen, 
  onClose, 
  editingRegistro,
  isEditing = false 
}) => {
  const { dadosMockados, userLogado, unidadeSelecionada, setRegistrosHorasProfessores } = useAppState();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<RegistroHorasFormData>({
    data: new Date().toISOString().split('T')[0], // Data atual
    professorId: 0,
    unidade: unidadeSelecionada,
    horasTrabalhadas: 1,
    tipoAtividade: 'aula-regular',
    observacoes: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados para edição
  useEffect(() => {
    if (editingRegistro && isEditing) {
      setFormData({
        data: editingRegistro.data,
        professorId: editingRegistro.professorId,
        unidade: editingRegistro.unidade,
        horasTrabalhadas: editingRegistro.horasTrabalhadas,
        tipoAtividade: editingRegistro.tipoAtividade,
        observacoes: editingRegistro.observacoes || ''
      });
    } else {
      setFormData({
        data: new Date().toISOString().split('T')[0],
        professorId: 0,
        unidade: unidadeSelecionada,
        horasTrabalhadas: 1,
        tipoAtividade: 'aula-regular',
        observacoes: ''
      });
    }
    setErrors({});
  }, [editingRegistro, isEditing, unidadeSelecionada]);

  // Professores disponíveis baseado no perfil
  const professoresDisponiveis = useMemo(() => {
    let professores = dadosMockados.professores.filter(p => p.ativo);
    
    // Se for gestor, mostrar apenas professores que já tiveram registros na unidade
    // ou todos os professores (para permitir novos registros)
    if (userLogado?.perfil === 'gestor') {
      // Para simplicidade, mostrar todos os professores ativos
      // Em uma implementação real, poderia filtrar por unidade de atuação
      return professores;
    }
    
    return professores;
  }, [dadosMockados.professores, userLogado]);

  // Unidades disponíveis baseado no perfil
  const unidadesDisponiveis = useMemo(() => {
    if (userLogado?.perfil === 'admin') {
      return dadosMockados.unidades.filter(u => u.ativa);
    } else if (userLogado?.perfil === 'gestor') {
      return dadosMockados.unidades.filter(u => u.ativa && u.nome === unidadeSelecionada);
    }
    return [];
  }, [dadosMockados.unidades, userLogado, unidadeSelecionada]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    } else {
      const dataRegistro = new Date(formData.data);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Final do dia de hoje
      
      if (dataRegistro > hoje) {
        newErrors.data = 'Não é possível registrar horas para datas futuras';
      }
    }

    if (!formData.professorId || formData.professorId === 0) {
      newErrors.professorId = 'Professor é obrigatório';
    }

    if (!formData.horasTrabalhadas || formData.horasTrabalhadas <= 0) {
      newErrors.horasTrabalhadas = 'Horas trabalhadas deve ser maior que zero';
    } else if (formData.horasTrabalhadas > 24) {
      newErrors.horasTrabalhadas = 'Horas trabalhadas não pode ser maior que 24';
    }

    if (!formData.tipoAtividade) {
      newErrors.tipoAtividade = 'Tipo de atividade é obrigatório';
    }

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    // Verificar duplicação (mesmo professor, mesma data, mesmo tipo)
    if (!isEditing || (isEditing && editingRegistro)) {
      const registroExistente = dadosMockados.registrosHorasProfessores.find(r => 
        r.data === formData.data &&
        r.professorId === formData.professorId &&
        r.tipoAtividade === formData.tipoAtividade &&
        r.unidade === formData.unidade &&
        (!isEditing || r.id !== editingRegistro?.id)
      );

      if (registroExistente) {
        newErrors.data = 'Já existe um registro para este professor nesta data e tipo de atividade';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler para mudanças nos campos
  const handleInputChange = useCallback((field: keyof RegistroHorasFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo quando ele for alterado
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  // Calcular valor estimado
 // Calcular valor estimado
const valorEstimado = useMemo(() => {
  if (!formData.professorId) return 0;

  const professor = dadosMockados.professores.find(p => p.id === formData.professorId);
  if (!professor) return 0;

  // Para aulão, usar valor específico se disponível (prioridade)
  if (formData.tipoAtividade === 'aulao' && professor.valorAulao) {
    return professor.valorAulao;
  }

  if (professor.tipoPagamento === 'fixo') {
    // CORREÇÃO: Salário fixo não mostra valor estimado por sessão
    return 0;
  } else if (professor.tipoPagamento === 'hora-fixa') {
    // CORREÇÃO: Adicionar cálculo para hora fixa
    return formData.horasTrabalhadas * (professor.valorHoraFixa || 0);
  } else if (professor.tipoPagamento === 'horas-variaveis' && professor.valoresHoras) {
    const horas = formData.horasTrabalhadas;
    
    if (horas <= 1) {
      return professor.valoresHoras.umaHora || 0;
    } else if (horas <= 2) {
      return professor.valoresHoras.duasHoras || 0;
    } else {
      return professor.valoresHoras.tresOuMaisHoras || 0;
    }
  }

  return 0;
}, [formData.professorId, formData.horasTrabalhadas, formData.tipoAtividade, dadosMockados.professores]);

  // Submissão do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!userLogado) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Usuário não está logado'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const professorSelecionado = dadosMockados.professores.find(p => p.id === formData.professorId);
      
      const registroData: RegistroHorasProfessor = {
        id: editingRegistro?.id || generateId(),
        data: formData.data,
        professorId: formData.professorId,
        professorNome: professorSelecionado?.nome || 'Professor não encontrado',
        unidade: formData.unidade,
        horasTrabalhadas: formData.horasTrabalhadas,
        tipoAtividade: formData.tipoAtividade,
        observacoes: formData.observacoes,
        registradoPor: userLogado.id,
        registradoEm: editingRegistro?.registradoEm || new Date().toISOString(),
        editadoPor: isEditing ? userLogado.id : undefined,
        editadoEm: isEditing ? new Date().toISOString() : undefined
      };

      if (isEditing && editingRegistro) {
        // Atualizar registro existente
        setRegistrosHorasProfessores(prev => 
          prev.map(r => r.id === editingRegistro.id ? registroData : r)
        );
        addNotification({
          type: 'success',
          title: 'Registro atualizado',
          message: 'As horas do professor foram atualizadas com sucesso!'
        });
      } else {
        // Adicionar novo registro
        setRegistrosHorasProfessores(prev => [...prev, registroData]);
        addNotification({
          type: 'success',
          title: 'Horas registradas',
          message: 'As horas do professor foram registradas com sucesso!'
        });
      }

      onClose();
      
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar o registro. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, userLogado, isEditing, editingRegistro, dadosMockados.professores, setRegistrosHorasProfessores, addNotification, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Editar Registro de Horas' : 'Registrar Horas do Professor'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditing ? 'Atualize as informações do registro' : 'Registre as horas trabalhadas pelo professor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Data e Professor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Data do Trabalho"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              error={errors.data}
              required
              max={new Date().toISOString().split('T')[0]} // Não permitir datas futuras
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professor *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.professorId}
                  onChange={(e) => handleInputChange('professorId', parseInt(e.target.value))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.professorId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value={0}>Selecione um professor</option>
                  {professoresDisponiveis.map(professor => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.professorId && <p className="text-red-500 text-xs mt-1">{errors.professorId}</p>}
            </div>
          </div>

          {/* Unidade e Horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidade *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.unidade}
                  onChange={(e) => handleInputChange('unidade', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.unidade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Selecione uma unidade</option>
                  {unidadesDisponiveis.map(unidade => (
                    <option key={unidade.id} value={unidade.nome}>
                      {unidade.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.unidade && <p className="text-red-500 text-xs mt-1">{errors.unidade}</p>}
            </div>

            <Input
              label="Horas Trabalhadas"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={formData.horasTrabalhadas}
              onChange={(e) => handleInputChange('horasTrabalhadas', parseFloat(e.target.value) || 0)}
              error={errors.horasTrabalhadas}
              required
              placeholder="Ex: 4.5"
            />
          </div>

          {/* Tipo de Atividade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Atividade *
            </label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.tipoAtividade}
                onChange={(e) => handleInputChange('tipoAtividade', e.target.value as any)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.tipoAtividade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value="aula-regular">Aula Regular</option>
                <option value="aulao">Aulão</option>
                <option value="administrativo">Atividade Administrativa</option>
                <option value="substituicao">Substituição</option>
              </select>
            </div>
            {errors.tipoAtividade && <p className="text-red-500 text-xs mt-1">{errors.tipoAtividade}</p>}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="Informações adicionais sobre o trabalho realizado..."
            />
          </div>

          {/* Preview do Valor */}
          {valorEstimado > 0 && formData.professorId > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Valor Estimado
                  </h4>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Baseado no tipo de pagamento do professor
                  </p>
                </div>
                <span className="text-xl font-bold text-green-800 dark:text-green-300">
                  R$ {valorEstimado.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? (isEditing ? 'Atualizando...' : 'Registrando...') 
                : (isEditing ? 'Atualizar Registro' : 'Registrar Horas')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};