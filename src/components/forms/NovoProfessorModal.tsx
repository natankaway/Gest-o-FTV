import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Modal, Button, Input } from '@/components/common';
import { X, Plus, Eye, EyeOff } from 'lucide-react';
import type { Professor, ProfessorFormData } from '@/types';

interface NovoProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfessor?: Professor | null;
}

const INITIAL_FORM_DATA: ProfessorFormData = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  tipoPagamento: 'fixo',
  valorFixo: 0,
  valoresHoras: {
    umaHora: 0,
    duasHoras: 0,
    tresOuMaisHoras: 0
  },
  valorAulao: undefined,
  especialidades: [],
  experiencia: '1-3',
  observacoes: '',
  ativo: true
};

const ESPECIALIDADES_OPTIONS = [
  'Futevôlei Técnico',
  'Futevôlei Físico',
  'Futevôlei Tático',
  'Treino Funcional',
  'Preparação Física',
  'Análise de Jogo',
  'Coaching Mental',
  'Recuperação e Lesões'
];

export const NovoProfessorModal: React.FC<NovoProfessorModalProps> = ({
  isOpen,
  onClose,
  editingProfessor
}) => {
  const { setProfessores } = useAppState();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<ProfessorFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (editingProfessor) {
      setFormData({
        nome: editingProfessor.nome,
        email: editingProfessor.email,
        telefone: editingProfessor.telefone,
        senha: editingProfessor.senha,
        tipoPagamento: editingProfessor.tipoPagamento,
        valorFixo: editingProfessor.valorFixo || 0,
        valoresHoras: editingProfessor.valoresHoras || { umaHora: 0, duasHoras: 0, tresOuMaisHoras: 0 },
		valorAulao: editingProfessor.valorAulao,
        especialidades: editingProfessor.especialidades,
        experiencia: editingProfessor.experiencia,
        observacoes: editingProfessor.observacoes || '',
        ativo: editingProfessor.ativo ?? true
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
  }, [editingProfessor, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 8) {
      newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (formData.tipoPagamento === 'fixo' && (!formData.valorFixo || formData.valorFixo <= 0)) {
      newErrors.valorFixo = 'Valor fixo deve ser maior que zero';
    }

    if (formData.tipoPagamento === 'horas-variaveis') {
      if (!formData.valoresHoras?.umaHora || formData.valoresHoras.umaHora <= 0) {
        newErrors.valorUmaHora = 'Valor para 1 hora deve ser maior que zero';
      }
      if (!formData.valoresHoras?.duasHoras || formData.valoresHoras.duasHoras <= 0) {
        newErrors.valorDuasHoras = 'Valor para 2 horas deve ser maior que zero';
      }
      if (!formData.valoresHoras?.tresOuMaisHoras || formData.valoresHoras.tresOuMaisHoras <= 0) {
        newErrors.valorTresHoras = 'Valor para 3+ horas deve ser maior que zero';
      }
    }

    if (formData.especialidades.length === 0) {
      newErrors.especialidades = 'Selecione pelo menos uma especialidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((field: keyof ProfessorFormData, value: any) => {
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

  const handleValorHorasChange = useCallback((tipo: 'umaHora' | 'duasHoras' | 'tresOuMaisHoras', value: number) => {
    setFormData(prev => ({
      ...prev,
      valoresHoras: {
        ...prev.valoresHoras!,
        [tipo]: value
      }
    }));
    
    // Clear error when user starts typing
    const errorKey = tipo === 'umaHora' ? 'valorUmaHora' : 
                     tipo === 'duasHoras' ? 'valorDuasHoras' : 'valorTresHoras';
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  }, [errors]);

  const adicionarEspecialidade = useCallback((especialidade: string) => {
    if (!formData.especialidades.includes(especialidade)) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, especialidade]
      }));
      
      // Clear error when adding especialidade
      if (errors.especialidades) {
        setErrors(prev => ({
          ...prev,
          especialidades: ''
        }));
      }
    }
  }, [formData.especialidades, errors.especialidades]);

  const removerEspecialidade = useCallback((especialidade: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter(e => e !== especialidade)
    }));
  }, []);

  const adicionarNovaEspecialidade = useCallback(() => {
    if (novaEspecialidade.trim() && !formData.especialidades.includes(novaEspecialidade.trim())) {
      adicionarEspecialidade(novaEspecialidade.trim());
      setNovaEspecialidade('');
    }
  }, [novaEspecialidade, formData.especialidades, adicionarEspecialidade]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const professorData: Professor = {
  id: editingProfessor?.id || generateId(),
  nome: formData.nome,
  telefone: formData.telefone,
  email: formData.email,
  senha: formData.senha,
  tipoPagamento: formData.tipoPagamento,
  valorFixo: formData.tipoPagamento === 'fixo' ? formData.valorFixo : undefined,
  valoresHoras: formData.tipoPagamento === 'horas-variaveis' ? formData.valoresHoras : undefined,
  valorAulao: formData.valorAulao, // ← ADICIONE ESTA LINHA
  especialidades: formData.especialidades,
  experiencia: formData.experiencia,
  observacoes: formData.observacoes,
  ativo: formData.ativo ?? true
};

      if (editingProfessor) {
        // Update existing professor
        setProfessores(prev => prev.map(p => p.id === editingProfessor.id ? professorData : p));
        addNotification({
          type: 'success',
          title: 'Professor atualizado',
          message: 'Os dados do professor foram atualizados com sucesso!'
        });
      } else {
        // Add new professor
        setProfessores(prev => [...prev, professorData]);
        addNotification({
          type: 'success',
          title: 'Professor cadastrado',
          message: 'Novo professor adicionado com sucesso!'
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro ao salvar os dados do professor'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingProfessor, validateForm, setProfessores, addNotification, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProfessor ? 'Editar Professor' : 'Novo Professor'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Dados Pessoais
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              error={errors.nome}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              error={errors.telefone}
              required
            />
            
            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.senha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experiência *
            </label>
            <select
              value={formData.experiencia}
              onChange={(e) => handleInputChange('experiencia', e.target.value as Professor['experiencia'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="1-3">1-3 anos</option>
              <option value="3-5">3-5 anos</option>
              <option value="5-10">5-10 anos</option>
              <option value="10+">10+ anos</option>
            </select>
          </div>
        </div>

        {/* Especialidades */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Especialidades
          </h4>
          
          {errors.especialidades && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.especialidades}</p>
          )}
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES_OPTIONS.map((especialidade) => (
                <button
                  key={especialidade}
                  type="button"
                  onClick={() => adicionarEspecialidade(especialidade)}
                  disabled={formData.especialidades.includes(especialidade)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.especialidades.includes(especialidade)
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {especialidade}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Nova especialidade"
                value={novaEspecialidade}
                onChange={(e) => setNovaEspecialidade(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarNovaEspecialidade())}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={adicionarNovaEspecialidade}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Adicionar
              </Button>
            </div>
            
            {formData.especialidades.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Especialidades selecionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.especialidades.map((especialidade) => (
                    <span
                      key={especialidade}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {especialidade}
                      <button
                        type="button"
                        onClick={() => removerEspecialidade(especialidade)}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagamento */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Configuração de Pagamento
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Pagamento *
            </label>
            <select
              value={formData.tipoPagamento}
              onChange={(e) => handleInputChange('tipoPagamento', e.target.value as Professor['tipoPagamento'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="fixo">Valor Fixo por Aula</option>
              <option value="horas-variaveis">Pagamento por Horas Variável</option>
            </select>
          </div>

          {formData.tipoPagamento === 'fixo' ? (
            <Input
              label="Valor por aula (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.valorFixo}
              onChange={(e) => handleInputChange('valorFixo', parseFloat(e.target.value) || 0)}
              error={errors.valorFixo}
              required
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Defina o valor total que o professor receberá por cada faixa de horas trabalhadas no dia:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    1 hora/dia (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valoresHoras?.umaHora || 0}
                    onChange={(e) => handleValorHorasChange('umaHora', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.valorUmaHora ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ex: 20.00"
                    required
                  />
                  {errors.valorUmaHora && <p className="text-red-500 text-xs mt-1">{errors.valorUmaHora}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    2 horas/dia (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valoresHoras?.duasHoras || 0}
                    onChange={(e) => handleValorHorasChange('duasHoras', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.valorDuasHoras ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ex: 30.00"
                    required
                  />
                  {errors.valorDuasHoras && <p className="text-red-500 text-xs mt-1">{errors.valorDuasHoras}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    3+ horas/dia (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valoresHoras?.tresOuMaisHoras || 0}
                    onChange={(e) => handleValorHorasChange('tresOuMaisHoras', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.valorTresHoras ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ex: 45.00"
                    required
                  />
                  {errors.valorTresHoras && <p className="text-red-500 text-xs mt-1">{errors.valorTresHoras}</p>}
                </div>
              </div>
              
              {/* Preview dos valores por hora */}
              {formData.valoresHoras && (formData.valoresHoras.umaHora > 0 || formData.valoresHoras.duasHoras > 0 || formData.valoresHoras.tresOuMaisHoras > 0) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview - Valor por hora:</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {formData.valoresHoras.umaHora > 0 && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">1h: </span>
                        <span className="font-medium">R$ {formData.valoresHoras.umaHora.toFixed(2)}/h</span>
                      </div>
                    )}
                    {formData.valoresHoras.duasHoras > 0 && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">2h: </span>
                        <span className="font-medium">R$ {(formData.valoresHoras.duasHoras / 2).toFixed(2)}/h</span>
                      </div>
                    )}
                    {formData.valoresHoras.tresOuMaisHoras > 0 && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">3h+: </span>
                        <span className="font-medium">R$ {(formData.valoresHoras.tresOuMaisHoras / 3).toFixed(2)}/h</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
		
		{/* ======= NOVA SEÇÃO - ADICIONE AQUI ======= */}
<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
  <div className="flex items-center space-x-2 mb-3">
    <span className="text-lg">🎯</span>
    <h5 className="text-md font-medium text-gray-900 dark:text-white">
      Pagamento Especial - Aulão
    </h5>
  </div>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
    Valor diferenciado que o professor recebe ao participar de aulões (eventos especiais).
  </p>
  
  <div className="max-w-xs">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Valor por Aulão (R$)
      <span className="text-gray-500 text-xs ml-1">(opcional)</span>
    </label>
    <input
      type="number"
      step="0.01"
      min="0"
      value={formData.valorAulao || ''}
      onChange={(e) => handleInputChange('valorAulao', e.target.value ? parseFloat(e.target.value) : undefined)}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
        errors.valorAulao ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
      placeholder="Ex: 80.00"
    />
    {errors.valorAulao && <p className="text-red-500 text-xs mt-1">{errors.valorAulao}</p>}
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      Deixe em branco se o professor não participará de aulões
    </p>
  </div>
</div>
{/* ======= FIM NOVA SEÇÃO ======= */}

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
            placeholder="Informações adicionais sobre o professor..."
          />
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativo"
            checked={formData.ativo}
            onChange={(e) => handleInputChange('ativo', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900 dark:text-white">
            Professor ativo
          </label>
        </div>

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
            {editingProfessor ? 'Atualizar Professor' : 'Cadastrar Professor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};