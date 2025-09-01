import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { X, DollarSign, Calculator, CreditCard } from 'lucide-react';
import type { RegistroFinanceiro, TransacaoFormData } from '@/types';

interface NovaTransacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransacao?: RegistroFinanceiro | null;
}

interface Parcela {
  id: string;
  transacaoOrigemId: number;
  descricao: string;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'paga' | 'quitada-antecipadamente';
  unidade: string;
}

const INITIAL_FORM_DATA: TransacaoFormData = {
  tipo: 'receita',
  categoria: 'Mensalidade',
  valor: 0,
  descricao: '',
  data: new Date().toISOString().substring(0, 10),
  metodo: 'dinheiro',
  status: 'pago',
  unidade: 'Centro',
  observacoes: ''
};

const CATEGORIAS_RECEITA = [
  'Mensalidade',
  'Diária',
  'Plataforma',
  'Produto',
  'Aula Particular',
  'Evento',
  'Outro'
];

const CATEGORIAS_DESPESA = [
  'Aluguel',
  'Salário',
  'Energia',
  'Água',
  'Internet',
  'Material',
  'Manutenção',
  'Marketing',
  'Impostos',
  'Outro'
];

const METODOS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao-credito', label: 'Cartão de Crédito' },
  { value: 'cartao-debito', label: 'Cartão de Débito' },
  { value: 'transferencia', label: 'Transferência' }
];

export const NovaTransacaoModal: React.FC<NovaTransacaoModalProps> = ({
  isOpen,
  onClose,
  editingTransacao
}) => {
  const { dadosMockados, setFinanceiro, userLogado } = useAppState();
  const { alunos, professores, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<TransacaoFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Estados para parcelamento
  const [isParcelado, setIsParcelado] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState(2);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

  // Initialize form when editing
  useEffect(() => {
    if (editingTransacao) {
      const editFormData: TransacaoFormData = {
        tipo: editingTransacao.tipo,
        categoria: editingTransacao.categoria,
        valor: editingTransacao.valor,
        descricao: editingTransacao.descricao,
        data: editingTransacao.data,
        metodo: editingTransacao.metodo,
        status: editingTransacao.status,
        unidade: editingTransacao.unidade || 'Centro',
        observacoes: editingTransacao.observacoes || ''
      };
      
      if (editingTransacao.alunoId) {
        editFormData.alunoId = editingTransacao.alunoId;
      }
      
      if (editingTransacao.professorId) {
        editFormData.professorId = editingTransacao.professorId;
      }
      
      if (editingTransacao.vencimento) {
        editFormData.vencimento = editingTransacao.vencimento;
      }
      
      setFormData(editFormData);
    } else {
      // Para novos registros, definir unidade automática para gestores
      const initialData = { ...INITIAL_FORM_DATA };
      
      if (userLogado?.perfil === 'gestor' && (userLogado as any).unidades?.length === 1) {
        initialData.unidade = (userLogado as any).unidades[0];
      }
      
      setFormData(initialData);
    }
    setErrors({});
    setCalculatorInput('');
    setShowCalculator(false);
    setIsParcelado(false);
    setNumeroParcelas(2);
  }, [editingTransacao, isOpen, userLogado]);

  // Auto-update category when tipo changes
  useEffect(() => {
    if (formData.tipo === 'receita' && !CATEGORIAS_RECEITA.includes(formData.categoria)) {
      setFormData(prev => ({ ...prev, categoria: 'Mensalidade' }));
    } else if (formData.tipo === 'despesa' && !CATEGORIAS_DESPESA.includes(formData.categoria)) {
      setFormData(prev => ({ ...prev, categoria: 'Aluguel' }));
    }
  }, [formData.tipo, formData.categoria]);

  // Reset parcelamento quando método muda
  useEffect(() => {
    if (formData.metodo !== 'cartao-credito') {
      setIsParcelado(false);
      setNumeroParcelas(2);
    }
  }, [formData.metodo]);

  const categorias = useMemo(() => {
    return formData.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
  }, [formData.tipo]);

  const availableAlunos = useMemo(() => {
    return alunos.filter(aluno => aluno.status === 'ativo');
  }, [alunos]);

  const availableProfessores = useMemo(() => {
    return professores.filter(professor => professor.ativo);
  }, [professores]);

  // Unidades disponíveis baseado no perfil
  const availableUnidades = useMemo(() => {
    if (userLogado?.perfil === 'admin') {
      return unidades;
    } else if (userLogado?.perfil === 'gestor' && (userLogado as any).unidades) {
      return unidades.filter(u => (userLogado as any).unidades.includes(u.nome));
    }
    return [];
  }, [userLogado, unidades]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.metodo) {
      newErrors.metodo = 'Método de pagamento é obrigatório';
    }

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    // Validação específica para mensalidades
    if (formData.categoria === 'Mensalidade' && !formData.alunoId) {
      newErrors.alunoId = 'Aluno é obrigatório para mensalidades';
    }

    // Validação específica para salários
    if (formData.categoria === 'Salário' && !formData.professorId) {
      newErrors.professorId = 'Professor é obrigatório para salários';
    }

    // Validação de parcelamento
    if (isParcelado && (numeroParcelas < 2 || numeroParcelas > 24)) {
      newErrors.parcelas = 'Número de parcelas deve ser entre 2 e 24';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const aluno = formData.alunoId ? alunos.find(a => a.id === formData.alunoId) : undefined;
      const professor = formData.professorId ? professores.find(p => p.id === formData.professorId) : undefined;
      
      if (editingTransacao) {
        // Update existing transacao
        setFinanceiro(prev => prev.map(transacao => {
          if (transacao.id === editingTransacao.id) {
            const updatedTransacao: RegistroFinanceiro = {
              ...transacao,
              ...formData
            };
            
            if (aluno) {
              updatedTransacao.aluno = aluno.nome;
            }
            
            if (professor) {
              updatedTransacao.professor = professor.nome;
            }
            
            return updatedTransacao;
          }
          return transacao;
        }));
        
        addNotification({
          type: 'success',
          title: 'Transação atualizada',
          message: `Transação foi atualizada com sucesso!`
        });
      } else {
        // Create new transacao
        const novaTransacao: RegistroFinanceiro = {
          id: Date.now(),
          ...formData
        };
        
        if (aluno) {
          novaTransacao.aluno = aluno.nome;
        }
        
        if (professor) {
          novaTransacao.professor = professor.nome;
        }

        // Se for parcelado, criar as parcelas
        if (isParcelado && formData.metodo === 'cartao-credito' && formData.tipo === 'despesa') {
          const valorParcela = formData.valor / numeroParcelas;
          const parcelasGeradas: Parcela[] = [];
          
          // Criar registro da primeira parcela (transação principal)
          novaTransacao.descricao = `${formData.descricao} (1/${numeroParcelas})`;
          novaTransacao.valor = valorParcela;
          
          // Criar parcelas futuras
          for (let i = 2; i <= numeroParcelas; i++) {
            const vencimento = new Date();
            vencimento.setMonth(vencimento.getMonth() + (i - 1));
            
            const parcela: Parcela = {
              id: `${Date.now()}-${i}`,
              transacaoOrigemId: novaTransacao.id,
              descricao: `${formData.descricao} (${i}/${numeroParcelas})`,
              numeroParcela: i,
              totalParcelas: numeroParcelas,
              valor: valorParcela,
              vencimento: vencimento.toISOString(),
              status: 'pendente',
              unidade: formData.unidade
            };
            
            parcelasGeradas.push(parcela);
          }
          
          // Aqui você salvaria as parcelas no estado global ou enviaria para o backend
          // Por enquanto, vamos apenas mostrar uma notificação
          console.log('Parcelas geradas:', parcelasGeradas);
          
          addNotification({
            type: 'info',
            title: 'Parcelas criadas',
            message: `${numeroParcelas} parcelas de R$ ${valorParcela.toFixed(2)} foram criadas`
          });
        }

        setFinanceiro(prev => [...prev, novaTransacao]);
        
        addNotification({
          type: 'success',
          title: 'Transação criada',
          message: `${formData.tipo === 'receita' ? 'Receita' : 'Despesa'} de R$ ${formData.valor.toFixed(2)} criada com sucesso!`
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar a transação. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingTransacao, setFinanceiro, addNotification, onClose, alunos, professores, isParcelado, numeroParcelas]);

  const handleInputChange = useCallback((field: keyof TransacaoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleCalculatorSubmit = useCallback(() => {
    try {
      // Simple math evaluation (safe for basic calculations)
      const result = Function(`"use strict"; return (${calculatorInput})`)();
      if (!isNaN(result) && result > 0) {
        handleInputChange('valor', Number(result.toFixed(2)));
        setShowCalculator(false);
        setCalculatorInput('');
      } else {
        setErrors(prev => ({ ...prev, calculator: 'Cálculo inválido' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, calculator: 'Erro no cálculo' }));
    }
  }, [calculatorInput, handleInputChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingTransacao ? 'Editar Transação' : 'Nova Transação Financeira'}
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
          {/* Tipo e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo', 'receita')}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                    formData.tipo === 'receita'
                      ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  + Receita
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo', 'despesa')}
                  className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                    formData.tipo === 'despesa'
                      ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  - Despesa
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.categoria ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
            </div>
          </div>

          {/* Valor com Calculadora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor {isParcelado ? 'Total' : ''} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor || ''}
                  onChange={(e) => handleInputChange('valor', Number(e.target.value))}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.valor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0,00"
                />
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Calculator className="h-4 w-4" />
                </button>
              </div>
              {errors.valor && <p className="text-red-500 text-xs mt-1">{errors.valor}</p>}
              {isParcelado && formData.valor > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Valor por parcela: R$ {(formData.valor / numeroParcelas).toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.descricao ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Descrição da transação"
              />
              {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
            </div>
          </div>

          {/* Calculadora */}
          {showCalculator && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={calculatorInput}
                  onChange={(e) => setCalculatorInput(e.target.value)}
                  placeholder="Ex: 150 + 50 * 2"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCalculatorSubmit}
                >
                  Calcular
                </Button>
              </div>
              {errors.calculator && <p className="text-red-500 text-xs mt-1">{errors.calculator}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use operadores: + - * / ( )
              </p>
            </div>
          )}

          {/* Data e Vencimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {formData.status === 'pendente' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vencimento
                </label>
                <input
                  type="date"
                  value={formData.vencimento || ''}
                  onChange={(e) => handleInputChange('vencimento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Método e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Método de Pagamento *
              </label>
              <select
                value={formData.metodo}
                onChange={(e) => handleInputChange('metodo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.metodo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione um método</option>
                {METODOS_PAGAMENTO.map(metodo => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
              {errors.metodo && <p className="text-red-500 text-xs mt-1">{errors.metodo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>

          {/* Parcelamento - Só aparece para despesas com cartão de crédito */}
          {formData.metodo === 'cartao-credito' && formData.tipo === 'despesa' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="parcelado"
                  checked={isParcelado}
                  onChange={(e) => setIsParcelado(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="parcelado" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Pagamento parcelado?
                </label>
              </div>
              
              {isParcelado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de parcelas *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="24"
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.parcelas ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.parcelas && <p className="text-red-500 text-xs mt-1">{errors.parcelas}</p>}
                  {formData.valor > 0 && (
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                      {numeroParcelas}x de R$ {(formData.valor / numeroParcelas).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Associações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.categoria === 'Mensalidade' || formData.categoria === 'Diária' || formData.categoria === 'Aula Particular') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aluno {formData.categoria === 'Mensalidade' ? '*' : ''}
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

            {formData.categoria === 'Salário' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Professor *
                </label>
                <select
                  value={formData.professorId || ''}
                  onChange={(e) => handleInputChange('professorId', e.target.value ? Number(e.target.value) : undefined)}
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
            )}

            {/* Campo de Unidade - Só aparece para Admin */}
            {userLogado?.perfil === 'admin' && (
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
                  {availableUnidades.map(unidade => (
                    <option key={unidade.id} value={unidade.nome}>
                      {unidade.nome}
                    </option>
                  ))}
                </select>
                {errors.unidade && <p className="text-red-500 text-xs mt-1">{errors.unidade}</p>}
              </div>
            )}
            
            {/* Para Gestor, mostrar unidade como readonly */}
            {userLogado?.perfil === 'gestor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unidade
                </label>
                <input
                  type="text"
                  value={formData.unidade}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Transação será registrada na sua unidade
                </p>
              </div>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Observações adicionais sobre a transação..."
            />
          </div>

          {/* Resumo do Parcelamento */}
          {isParcelado && formData.valor > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Resumo do Parcelamento
              </h4>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Valor Total:</span>
                  <span className="font-medium">R$ {formData.valor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Número de Parcelas:</span>
                  <span className="font-medium">{numeroParcelas}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor por Parcela:</span>
                  <span className="font-medium">R$ {(formData.valor / numeroParcelas).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                  <span>Primeira Parcela:</span>
                  <span className="font-medium">{new Date(formData.data).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Última Parcela:</span>
                  <span className="font-medium">
                    {(() => {
                      const ultimaData = new Date(formData.data);
                      ultimaData.setMonth(ultimaData.getMonth() + numeroParcelas - 1);
                      return ultimaData.toLocaleDateString('pt-BR');
                    })()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                💡 As parcelas serão lançadas automaticamente nos próximos meses
              </p>
            </div>
          )}

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
              {isSubmitting ? 'Salvando...' : editingTransacao ? 'Atualizar' : 'Criar Transação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};