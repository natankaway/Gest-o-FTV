import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Modal, Button, Input } from '@/components/common';
import { X, Plus } from 'lucide-react';
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
  valoresVariaveis: {
    uma: 0,
    duas: 0,
    tres: 0
  },
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
        valoresVariaveis: editingProfessor.valoresVariaveis || { uma: 0, duas: 0, tres: 0 },
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

    if (formData.tipoPagamento === 'fixo' && (!formData.valorFixo || formData.valorFixo <= 0)) {
      newErrors.valorFixo = 'Valor fixo deve ser maior que zero';
    }

    if (formData.tipoPagamento === 'variavel') {
      if (!formData.valoresVariaveis?.uma || formData.valoresVariaveis.uma <= 0) {
        newErrors.valorUma = 'Valor para 1 pessoa deve ser maior que zero';
      }
      if (!formData.valoresVariaveis?.duas || formData.valoresVariaveis.duas <= 0) {
        newErrors.valorDuas = 'Valor para 2 pessoas deve ser maior que zero';
      }
      if (!formData.valoresVariaveis?.tres || formData.valoresVariaveis.tres <= 0) {
        newErrors.valorTres = 'Valor para 3+ pessoas deve ser maior que zero';
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

  const handleValorVariavelChange = useCallback((tipo: 'uma' | 'duas' | 'tres', value: number) => {
    setFormData(prev => ({
      ...prev,
      valoresVariaveis: {
        ...prev.valoresVariaveis!,
        [tipo]: value
      }
    }));
    
    // Clear error when user starts typing
    const errorKey = `valor${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
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
        id: editingProfessor ? editingProfessor.id : Date.now(),
        ...formData
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
              <option value="variavel">Valor Variável por Número de Alunos</option>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="1 pessoa (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formData.valoresVariaveis?.uma || 0}
                onChange={(e) => handleValorVariavelChange('uma', parseFloat(e.target.value) || 0)}
                error={errors.valorUma}
                required
              />
              <Input
                label="2 pessoas (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formData.valoresVariaveis?.duas || 0}
                onChange={(e) => handleValorVariavelChange('duas', parseFloat(e.target.value) || 0)}
                error={errors.valorDuas}
                required
              />
              <Input
                label="3+ pessoas (R$)"
                type="number"
                step="0.01"
                min="0"
                value={formData.valoresVariaveis?.tres || 0}
                onChange={(e) => handleValorVariavelChange('tres', parseFloat(e.target.value) || 0)}
                error={errors.valorTres}
                required
              />
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