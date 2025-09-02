// src/components/forms/ConversaoPlanoModal.tsx
import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button, Modal } from '@/components/common';
import { 
  TrendingUp, User, Calendar, CreditCard, Building2, DollarSign,
  CheckCircle, AlertTriangle, Star, ArrowRight, Clock, Gift
} from 'lucide-react';
import type { AulaExperimental, ModalProps, Plano } from '@/types';

interface ConversaoPlanoModalProps extends ModalProps {
  aula: AulaExperimental | null;
  onConvert: (aulaId: number, planoData: ConversaoData) => void;
}

interface ConversaoData {
  tipoPlano: 'mensalidade' | 'plataforma';
  planoId?: number;
  plataformaParceira?: string;
  dataVencimento?: string;
  observacoes?: string;
}

export const ConversaoPlanoModal: React.FC<ConversaoPlanoModalProps> = memo(({
  isOpen,
  onClose,
  aula,
  onConvert
}) => {
  const { dadosMockados } = useAppState();
  const { addNotification } = useNotifications();
  const { planos } = dadosMockados;

  const [conversaoData, setConversaoData] = useState<ConversaoData>({
    tipoPlano: 'mensalidade',
    observacoes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form quando modal abre
  useEffect(() => {
    if (isOpen && aula) {
      const dataVencimento = new Date();
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      
      setConversaoData({
        tipoPlano: 'mensalidade',
        dataVencimento: dataVencimento.toISOString().substring(0, 10),
        observacoes: `Conversão da aula experimental realizada em ${new Date(aula.dataRealizacao || aula.dataAgendamento).toLocaleDateString('pt-BR')}`
      });
      setErrors({});
    }
  }, [isOpen, aula]);

  // Filtrar planos da unidade da aula
  const planosDisponiveis = useMemo(() => {
    if (!aula) return [];
    return planos.filter(plano => plano.unidade === aula.unidade);
  }, [planos, aula]);

  const handleInputChange = (field: string, value: any) => {
    setConversaoData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset dependent fields when changing plan type
    if (field === 'tipoPlano') {
      setConversaoData(prev => ({
        ...prev,
        planoId: undefined,
        plataformaParceira: '',
        dataVencimento: value === 'mensalidade' ? prev.dataVencimento : undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (conversaoData.tipoPlano === 'mensalidade') {
      if (!conversaoData.planoId) {
        newErrors.planoId = 'Selecione um plano';
      }
      if (!conversaoData.dataVencimento) {
        newErrors.dataVencimento = 'Data de vencimento é obrigatória';
      }
    } else if (conversaoData.tipoPlano === 'plataforma') {
      if (!conversaoData.plataformaParceira) {
        newErrors.plataformaParceira = 'Selecione uma plataforma parceira';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aula) return;
    
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Formulário inválido',
        message: 'Por favor, corrija os erros antes de continuar.'
      });
      return;
    }

    onConvert(aula.id, conversaoData);
    onClose();
  }, [aula, conversaoData, validateForm, onConvert, onClose, addNotification]);

  const getPlanoSelecionado = () => {
    if (conversaoData.tipoPlano === 'mensalidade' && conversaoData.planoId) {
      return planosDisponiveis.find(p => p.id === conversaoData.planoId);
    }
    return null;
  };

  const planoSelecionado = getPlanoSelecionado();

  if (!aula) return null;

  const canConvert = aula.status === 'realizada';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <span>Converter para Plano Pago</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Alerta se não pode converter */}
        {!canConvert && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900 dark:text-red-300">
                  Conversão não disponível
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Só é possível converter aulas experimentais que foram <strong>realizadas</strong>. 
                  Status atual: <strong>{aula.status}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações da aula experimental */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-600" />
            Aula Experimental
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Aluno</label>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{aula.aluno}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data Realizada</label>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                {aula.dataRealizacao ? 
                  new Date(aula.dataRealizacao).toLocaleDateString('pt-BR') :
                  'Não realizada'
                }
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Unidade</label>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Building2 className="h-3 w-3 text-gray-500" />
                {aula.unidade}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Professor</label>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <User className="h-3 w-3 text-gray-500" />
                {aula.professor || 'Não definido'}
              </p>
            </div>
          </div>
        </div>

        {canConvert && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do tipo de plano */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-purple-600" />
                Converter para Plano
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Plano *
                </label>
                <select
                  value={conversaoData.tipoPlano}
                  onChange={(e) => handleInputChange('tipoPlano', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="mensalidade">Mensalidade</option>
                  <option value="plataforma">Plataforma Parceira</option>
                </select>
              </div>
            </div>

            {/* Campos específicos do tipo de plano */}
            <div className="space-y-4">
              {conversaoData.tipoPlano === 'mensalidade' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plano *
                    </label>
                    <select
                      value={conversaoData.planoId || ''}
                      onChange={(e) => handleInputChange('planoId', e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.planoId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Selecione um plano</option>
                      {planosDisponiveis.map(plano => (
                        <option key={plano.id} value={plano.id}>
                          {plano.nome} - R$ {plano.preco.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {errors.planoId && <p className="text-red-500 text-xs mt-1">{errors.planoId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      value={conversaoData.dataVencimento || ''}
                      onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.dataVencimento ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.dataVencimento && <p className="text-red-500 text-xs mt-1">{errors.dataVencimento}</p>}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plataforma Parceira *
                  </label>
                  <select
                    value={conversaoData.plataformaParceira || ''}
                    onChange={(e) => handleInputChange('plataformaParceira', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.plataformaParceira ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Selecione uma plataforma</option>
                    <option value="Wellhub">Wellhub</option>
                    <option value="TotalPass">TotalPass</option>
                    <option value="Gympass">Gympass</option>
                  </select>
                  {errors.plataformaParceira && <p className="text-red-500 text-xs mt-1">{errors.plataformaParceira}</p>}
                </div>
              )}
            </div>

            {/* Preview do plano selecionado */}
            {planoSelecionado && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Resumo do Plano Selecionado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Nome:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{planoSelecionado.nome}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Preço:</span>
                    <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                      R$ {planoSelecionado.preco.toFixed(2)}/mês
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Unidade:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{planoSelecionado.unidade}</span>
                  </div>
                  {conversaoData.dataVencimento && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Vencimento:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(conversaoData.dataVencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações da Conversão
              </label>
              <textarea
                value={conversaoData.observacoes || ''}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
                placeholder="Observações sobre a conversão do aluno..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Benefícios da conversão */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                O que acontece após a conversão:
              </h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Aluno será automaticamente cadastrado no sistema</li>
                <li>• Status da aula experimental mudará para "Convertido"</li>
                <li>• Novo registro de aluno será criado com o plano selecionado</li>
                <li>• Aluno poderá começar a frequentar as aulas normalmente</li>
                {conversaoData.tipoPlano === 'mensalidade' && (
                  <li>• Primeira mensalidade vencerá na data selecionada</li>
                )}
              </ul>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                leftIcon={<TrendingUp className="h-4 w-4" />}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Converter para Plano
              </Button>
            </div>
          </form>
        )}

        {/* Se não pode converter, só mostrar botão de fechar */}
        {!canConvert && (
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
});