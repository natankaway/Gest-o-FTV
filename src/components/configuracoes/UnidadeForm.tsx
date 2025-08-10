import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Save, X, ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import { formatPhone, validateEmail, generateId } from '@/utils';
import type { Unidade, UnidadeFormData, Gestor, Socio } from '@/types';

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
  const { userLogado } = useAppState();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<UnidadeFormData>({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    gestorId: 0,
    ativa: true,
    socios: [],
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
        socios: unidade.socios || [],
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

    // Validate socios if any exist
    if (formData.socios && formData.socios.length > 0) {
      const totalPercentual = formData.socios.reduce((sum, socio) => sum + socio.percentual, 0);
      if (Math.abs(totalPercentual - 100) > 0.01) {
        newErrors.socios = 'A soma dos percentuais dos sócios deve ser 100%';
      }

      formData.socios.forEach((socio, index) => {
        if (!socio.nome.trim()) {
          newErrors[`socio-${index}-nome`] = 'Nome do sócio é obrigatório';
        }
        if (socio.percentual <= 0 || socio.percentual > 100) {
          newErrors[`socio-${index}-percentual`] = 'Percentual deve estar entre 0% e 100%';
        }
      });
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

  // Socios management functions
  const addSocio = useCallback(() => {
    const newSocio: Socio = {
      id: generateId(),
      nome: '',
      percentual: 0,
      ativo: true
    };
    setFormData(prev => ({
      ...prev,
      socios: [...(prev.socios || []), newSocio]
    }));
  }, []);

  const updateSocio = useCallback((index: number, field: keyof Socio, value: any) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios?.map((socio, i) => 
        i === index ? { ...socio, [field]: value } : socio
      ) || []
    }));
  }, []);

  const removeSocio = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios?.filter((_, i) => i !== index) || []
    }));
  }, []);

  // Check if user can edit societies (only admin)
  const canEditSocieties = userLogado?.perfil === 'admin';

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

        {/* Society Configuration */}
        {canEditSocieties && (
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Configuração de Sociedade
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure os sócios e percentuais para distribuição de lucros
                </p>
              </div>
              <button
                type="button"
                onClick={addSocio}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Sócio
              </button>
            </div>

            {formData.socios && formData.socios.length > 0 ? (
              <div className="space-y-3">
                {formData.socios.map((socio, index) => (
                  <div key={socio.id} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={socio.nome}
                        onChange={(e) => updateSocio(index, 'nome', e.target.value)}
                        placeholder="Nome do sócio"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white ${
                          errors[`socio-${index}-nome`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                        }`}
                      />
                      {errors[`socio-${index}-nome`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`socio-${index}-nome`]}</p>
                      )}
                    </div>
                    
                    <div className="w-32">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={socio.percentual}
                          onChange={(e) => updateSocio(index, 'percentual', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white ${
                            errors[`socio-${index}-percentual`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                          }`}
                          placeholder="0"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                      </div>
                      {errors[`socio-${index}-percentual`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`socio-${index}-percentual`]}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={socio.ativo}
                        onChange={(e) => updateSocio(index, 'ativo', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Ativo
                      </label>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeSocio(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remover sócio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {errors.socios && (
                  <p className="text-red-500 text-sm">{errors.socios}</p>
                )}
                
                {formData.socios.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {formData.socios.reduce((sum, socio) => sum + socio.percentual, 0).toFixed(2)}%
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>Nenhum sócio configurado</p>
                <p className="text-sm">Clique em "Adicionar Sócio" para configurar a sociedade</p>
              </div>
            )}
          </div>
        )}

        {!canEditSocieties && formData.socios && formData.socios.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Sociedade (Visualização)
            </h3>
            <div className="space-y-2">
              {formData.socios.map((socio) => (
                <div key={socio.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">{socio.nome}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400">{socio.percentual}%</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      socio.ativo 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {socio.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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