import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Modal, Button, Input } from '@/components/common';
import { Plus, X } from 'lucide-react';
import type { Plano } from '@/types';

interface NovoPlanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlano?: Plano | null;
}

interface NovoPlanoFormData {
  nome: string;
  preco: number;
  unidade: string;
  descricao: string;
  beneficios: string[];
}

const INITIAL_FORM_DATA: NovoPlanoFormData = {
  nome: '',
  preco: 0,
  unidade: 'Centro',
  descricao: '',
  beneficios: []
};

const BENEFICIOS_SUGERIDOS = [
  'Acesso ilimitado à unidade',
  'Aulas em grupo',
  'Acompanhamento personalizado',
  'Treinos técnicos especializados',
  'Preparação física',
  'Análise de performance',
  'Acesso a equipamentos premium',
  'Flexibilidade de horários',
  'Suporte nutricional',
  'Participação em torneios internos',
  'Desconto em produtos',
  'Convidados permitidos'
];

export const NovoPlanoModal: React.FC<NovoPlanoModalProps> = ({
  isOpen,
  onClose,
  editingPlano
}) => {
  const { dadosMockados, setPlanos } = useAppState();
  const { unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<NovoPlanoFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [novoBeneficio, setNovoBeneficio] = useState('');

  // Initialize form when editing
  useEffect(() => {
    if (editingPlano) {
      setFormData({
        nome: editingPlano.nome,
        preco: editingPlano.preco,
        unidade: editingPlano.unidade,
        descricao: editingPlano.descricao || '',
        beneficios: editingPlano.beneficios || []
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
  }, [editingPlano, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do plano é obrigatório';
    }

    if (!formData.preco || formData.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (formData.beneficios.length === 0) {
      newErrors.beneficios = 'Adicione pelo menos um benefício';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((field: keyof NovoPlanoFormData, value: any) => {
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

  const adicionarBeneficio = useCallback((beneficio: string) => {
    if (!formData.beneficios.includes(beneficio)) {
      setFormData(prev => ({
        ...prev,
        beneficios: [...prev.beneficios, beneficio]
      }));
      
      // Clear error when adding benefit
      if (errors.beneficios) {
        setErrors(prev => ({
          ...prev,
          beneficios: ''
        }));
      }
    }
  }, [formData.beneficios, errors.beneficios]);

  const removerBeneficio = useCallback((beneficio: string) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter(b => b !== beneficio)
    }));
  }, []);

  const adicionarNovoBeneficio = useCallback(() => {
    if (novoBeneficio.trim() && !formData.beneficios.includes(novoBeneficio.trim())) {
      adicionarBeneficio(novoBeneficio.trim());
      setNovoBeneficio('');
    }
  }, [novoBeneficio, formData.beneficios, adicionarBeneficio]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const planoData: Plano = {
        id: editingPlano ? editingPlano.id : Date.now(),
        nome: formData.nome,
        preco: formData.preco,
        unidade: formData.unidade,
        descricao: formData.descricao,
        beneficios: formData.beneficios
      };

      if (editingPlano) {
        // Update existing plan
        setPlanos(prev => prev.map(p => p.id === editingPlano.id ? planoData : p));
        addNotification({
          type: 'success',
          title: 'Plano atualizado',
          message: 'Os dados do plano foram atualizados com sucesso!'
        });
      } else {
        // Add new plan
        setPlanos(prev => [...prev, planoData]);
        addNotification({
          type: 'success',
          title: 'Plano criado',
          message: 'Novo plano adicionado com sucesso!'
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro ao salvar os dados do plano'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingPlano, validateForm, setPlanos, addNotification, onClose]);

  const getPlanoPreview = () => {
    const { preco } = formData;
    return {
      monthly: preco,
      weekly: preco / 4,
      daily: preco / 30
    };
  };

  const planoPreview = getPlanoPreview();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPlano ? 'Editar Plano' : 'Novo Plano'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Informações Básicas
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Plano"
              placeholder="Ex: Plano Básico, Plano Premium..."
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              error={errors.nome}
              required
            />
            
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Preço Mensal (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.preco}
                onChange={(e) => handleInputChange('preco', parseFloat(e.target.value) || 0)}
                error={errors.preco}
                required
              />
              
              {formData.preco > 0 && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>Semanal: R$ {planoPreview.weekly.toFixed(2)}</div>
                  <div>Diário: R$ {planoPreview.daily.toFixed(2)}</div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={3}
                placeholder="Descreva os principais diferenciais deste plano..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                  errors.descricao ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.descricao}</p>
              )}
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Benefícios do Plano
          </h4>
          
          {errors.beneficios && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.beneficios}</p>
          )}
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {BENEFICIOS_SUGERIDOS.map((beneficio) => (
                <button
                  key={beneficio}
                  type="button"
                  onClick={() => adicionarBeneficio(beneficio)}
                  disabled={formData.beneficios.includes(beneficio)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.beneficios.includes(beneficio)
                      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {beneficio}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar benefício personalizado"
                value={novoBeneficio}
                onChange={(e) => setNovoBeneficio(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarNovoBeneficio())}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={adicionarNovoBeneficio}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Adicionar
              </Button>
            </div>
            
            {formData.beneficios.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Benefícios inclusos:</p>
                <div className="space-y-1">
                  {formData.beneficios.map((beneficio, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <span className="text-sm text-green-800 dark:text-green-300">
                        ✓ {beneficio}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerBeneficio(beneficio)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {formData.nome && formData.preco > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Preview do Plano
            </h5>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <div className="font-medium">{formData.nome}</div>
              <div>R$ {formData.preco.toFixed(2)}/mês</div>
              <div className="text-xs opacity-75">{formData.beneficios.length} benefícios inclusos</div>
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
            {editingPlano ? 'Atualizar Plano' : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};