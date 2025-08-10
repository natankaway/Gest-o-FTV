import React, { useState, useCallback, useEffect } from 'react';
import { useNotifications } from '@/contexts';
import { Save, X, ArrowLeft } from 'lucide-react';
import { formatPhone, validateEmail } from '@/utils';
import type { Unidade, UnidadeFormData, Gestor } from '@/types';

interface UnidadeFormProps {
  unidade?: Unidade | null;
  onSave: (data: UnidadeFormData) => void;
  onCancel: () => void;
  gestores: Gestor[];
}

export const UnidadeForm: React.FC<UnidadeFormProps> = ({
  unidade,
  onSave,
  onCancel,
  gestores
}) => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<UnidadeFormData>({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    gestorId: 0,
    ativa: true,
    configuracoes: {
      horarioFuncionamento: {
        inicio: '06:00',
        fim: '22:00'
      },
      capacidadeMaxima: 50
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (unidade) {
      setFormData({
        nome: unidade.nome,
        endereco: unidade.endereco,
        telefone: unidade.telefone,
        email: unidade.email,
        gestorId: unidade.gestorId,
        ativa: unidade.ativa,
        configuracoes: unidade.configuracoes || {
          horarioFuncionamento: {
            inicio: '06:00',
            fim: '22:00'
          },
          capacidadeMaxima: 50
        }
      });
    }
  }, [unidade]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.gestorId || formData.gestorId === 0) {
      newErrors.gestorId = 'Gestor é obrigatório';
    }

    if (formData.configuracoes) {
      const { horarioFuncionamento, capacidadeMaxima } = formData.configuracoes;
      
      if (!horarioFuncionamento.inicio) {
        newErrors.horarioInicio = 'Horário de início é obrigatório';
      }
      
      if (!horarioFuncionamento.fim) {
        newErrors.horarioFim = 'Horário de fim é obrigatório';
      }
      
      if (horarioFuncionamento.inicio && horarioFuncionamento.fim && 
          horarioFuncionamento.inicio >= horarioFuncionamento.fim) {
        newErrors.horario = 'Horário de início deve ser anterior ao horário de fim';
      }
      
      if (!capacidadeMaxima || capacidadeMaxima < 1) {
        newErrors.capacidadeMaxima = 'Capacidade máxima deve ser maior que 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Erro de validação',
        message: 'Por favor, corrija os erros no formulário'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(formData);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar a unidade'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onSave, addNotification]);

  const handlePhoneChange = useCallback((value: string) => {
    const formattedPhone = formatPhone(value);
    setFormData(prev => ({ ...prev, telefone: formattedPhone }));
  }, []);

  const updateConfiguracao = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes!,
        [field]: value
      }
    }));
  }, []);

  const updateHorario = useCallback((field: 'inicio' | 'fim', value: string) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes!,
        horarioFuncionamento: {
          ...prev.configuracoes!.horarioFuncionamento,
          [field]: value
        }
      }
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {unidade ? 'Editar Unidade' : 'Nova Unidade'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {unidade ? 'Atualize as informações da unidade' : 'Preencha os dados da nova unidade'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Unidade *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: Centro, Zona Sul, Barra"
              />
              {errors.nome && (
                <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gestor Responsável *
              </label>
              <select
                value={formData.gestorId}
                onChange={(e) => setFormData(prev => ({ ...prev, gestorId: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.gestorId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value={0}>Selecione um gestor</option>
                {gestores.map(gestor => (
                  <option key={gestor.id} value={gestor.id}>
                    {gestor.nome} - {gestor.cargo}
                  </option>
                ))}
              </select>
              {errors.gestorId && (
                <p className="text-red-500 text-xs mt-1">{errors.gestorId}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Endereço *
            </label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                errors.endereco ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Rua, número, bairro, cidade"
            />
            {errors.endereco && (
              <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="(11) 3000-0000"
              />
              {errors.telefone && (
                <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="unidade@futevolei.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativa"
              checked={formData.ativa}
              onChange={(e) => setFormData(prev => ({ ...prev, ativa: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="ativa" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Unidade ativa
            </label>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Configurações Operacionais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horário de Início *
              </label>
              <input
                type="time"
                value={formData.configuracoes?.horarioFuncionamento.inicio || ''}
                onChange={(e) => updateHorario('inicio', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.horarioInicio || errors.horario ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.horarioInicio && (
                <p className="text-red-500 text-xs mt-1">{errors.horarioInicio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horário de Fim *
              </label>
              <input
                type="time"
                value={formData.configuracoes?.horarioFuncionamento.fim || ''}
                onChange={(e) => updateHorario('fim', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.horarioFim || errors.horario ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.horarioFim && (
                <p className="text-red-500 text-xs mt-1">{errors.horarioFim}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capacidade Máxima *
              </label>
              <input
                type="number"
                min="1"
                value={formData.configuracoes?.capacidadeMaxima || ''}
                onChange={(e) => updateConfiguracao('capacidadeMaxima', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  errors.capacidadeMaxima ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="50"
              />
              {errors.capacidadeMaxima && (
                <p className="text-red-500 text-xs mt-1">{errors.capacidadeMaxima}</p>
              )}
            </div>
          </div>

          {errors.horario && (
            <p className="text-red-500 text-sm">{errors.horario}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 mr-2 inline" />
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {unidade ? 'Atualizar' : 'Criar'} Unidade
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};