// src/components/forms/NovoProfessorModal.tsx - VERSÃO ATUALIZADA
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Modal, Button, Input } from '@/components/common';
import { 
  X, Eye, EyeOff, Plus, Save, User, Mail, Phone, Lock, 
  DollarSign, Clock, Briefcase, FileText, Building2, MapPin
} from 'lucide-react';
import type { Professor, ProfessorFormData } from '@/types';

interface NovoProfessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfessor?: Professor | null;
}

interface FormErrors {
  nome?: string;
  telefone?: string;
  email?: string;
  senha?: string;
  especialidades?: string;
  valorFixo?: string;
  valorUmaHora?: string;
  valorDuasHoras?: string;
  valorTresHoras?: string;
  valorAulao?: string;
  unidades?: string;
}

export const NovoProfessorModal: React.FC<NovoProfessorModalProps> = ({
  isOpen,
  onClose,
  editingProfessor
}) => {
  const { dadosMockados, setProfessores, userLogado } = useAppState();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState<ProfessorFormData>({
    nome: '',
    telefone: '',
    email: '',
    senha: '',
    tipoPagamento: 'fixo',
    valorFixo: 0,
    valoresHoras: {
      umaHora: 0,
      duasHoras: 0,
      tresOuMaisHoras: 0
    },
    valorAulao: 0,
    especialidades: [],
    experiencia: '1-3',
    observacoes: '',
    ativo: true,
    unidades: [], // 🆕 NOVO CAMPO
    unidadePrincipal: '' // 🆕 NOVO CAMPO
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');

  // Especialidades disponíveis
  const especialidadesDisponiveis = [
    'Futevôlei', 'Beach Tennis', 'Vôlei de Praia', 'Futebol', 
    'Educação Física', 'Preparação Física', 'Técnica Individual'
  ];

  // Unidades disponíveis baseadas no perfil do usuário
  const unidadesDisponiveis = useMemo(() => {
    const unidades = dadosMockados.unidades.filter(u => u.ativa);
    
    if (userLogado?.perfil === 'admin') {
      return unidades;
    } else if (userLogado?.perfil === 'gestor') {
      // Gestor só pode cadastrar professor nas unidades que gerencia
      return unidades.filter(u => 
        userLogado.unidades?.includes(u.nome) || userLogado.unidade === u.nome
      );
    }
    
    return [];
  }, [dadosMockados.unidades, userLogado]);

  // Carregar dados quando editando
  useEffect(() => {
    if (editingProfessor) {
      setFormData({
        nome: editingProfessor.nome,
        telefone: editingProfessor.telefone,
        email: editingProfessor.email,
        senha: editingProfessor.senha,
        tipoPagamento: editingProfessor.tipoPagamento,
        valorFixo: editingProfessor.valorFixo || 0,
        valoresHoras: editingProfessor.valoresHoras || {
          umaHora: 0,
          duasHoras: 0,
          tresOuMaisHoras: 0
        },
        valorAulao: editingProfessor.valorAulao || 0,
        especialidades: editingProfessor.especialidades,
        experiencia: editingProfessor.experiencia,
        observacoes: editingProfessor.observacoes || '',
        ativo: editingProfessor.ativo ?? true,
        unidades: editingProfessor.unidades || [], // 🆕 CARREGAR UNIDADES
        unidadePrincipal: editingProfessor.unidadePrincipal || '' // 🆕 CARREGAR UNIDADE PRINCIPAL
      });
    } else {
      // Resetar formulário para novo professor
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        senha: '',
        tipoPagamento: 'fixo',
        valorFixo: 0,
        valoresHoras: {
          umaHora: 0,
          duasHoras: 0,
          tresOuMaisHoras: 0
        },
        valorAulao: 0,
        especialidades: [],
        experiencia: '1-3',
        observacoes: '',
        ativo: true,
        unidades: [], // 🆕 RESETAR UNIDADES
        unidadePrincipal: '' // 🆕 RESETAR UNIDADE PRINCIPAL
      });
    }
    setErrors({});
    setShowPassword(false);
    setNovaEspecialidade('');
  }, [editingProfessor, isOpen]);

  const generateId = () => Math.floor(Math.random() * 1000000);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.especialidades.length === 0) {
      newErrors.especialidades = 'Selecione pelo menos uma especialidade';
    }

    // 🆕 VALIDAÇÃO DE UNIDADES
    if (formData.unidades.length === 0) {
      newErrors.unidades = 'Selecione pelo menos uma unidade';
    }

    // Validações de valores conforme tipo de pagamento
    if (formData.tipoPagamento === 'fixo') {
      if (!formData.valorFixo || formData.valorFixo <= 0) {
        newErrors.valorFixo = 'Valor fixo deve ser maior que zero';
      }
    } else if (formData.tipoPagamento === 'horas-variaveis') {
      if (!formData.valoresHoras.umaHora || formData.valoresHoras.umaHora <= 0) {
        newErrors.valorUmaHora = 'Valor para 1 hora deve ser maior que zero';
      }
      if (!formData.valoresHoras.duasHoras || formData.valoresHoras.duasHoras <= 0) {
        newErrors.valorDuasHoras = 'Valor para 2 horas deve ser maior que zero';
      }
      if (!formData.valoresHoras.tresOuMaisHoras || formData.valoresHoras.tresOuMaisHoras <= 0) {
        newErrors.valorTresHoras = 'Valor para 3+ horas deve ser maior que zero';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const handleValoresHorasChange = useCallback((tipo: 'umaHora' | 'duasHoras' | 'tresOuMaisHoras', valor: string) => {
    setFormData(prev => ({
      ...prev,
      valoresHoras: {
        ...prev.valoresHoras,
        [tipo]: parseFloat(valor) || 0
      }
    }));

    const errorKey = tipo === 'umaHora' ? 'valorUmaHora' : 
                     tipo === 'duasHoras' ? 'valorDuasHoras' : 'valorTresHoras';
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  }, [errors]);

  // 🆕 HANDLERS PARA UNIDADES
  const handleUnidadeToggle = useCallback((unidadeNome: string) => {
    setFormData(prev => {
      const unidades = prev.unidades.includes(unidadeNome)
        ? prev.unidades.filter(u => u !== unidadeNome)
        : [...prev.unidades, unidadeNome];
      
      // Se removeu a unidade principal, limpar
      let unidadePrincipal = prev.unidadePrincipal;
      if (!unidades.includes(unidadePrincipal)) {
        unidadePrincipal = '';
      }
      
      return {
        ...prev,
        unidades,
        unidadePrincipal
      };
    });

    // Limpar erro de unidades
    if (errors.unidades) {
      setErrors(prev => ({
        ...prev,
        unidades: ''
      }));
    }
  }, [errors.unidades]);

  const adicionarEspecialidade = useCallback((especialidade: string) => {
    if (!formData.especialidades.includes(especialidade)) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, especialidade]
      }));
      
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
        valorAulao: formData.valorAulao,
        especialidades: formData.especialidades,
        experiencia: formData.experiencia,
        observacoes: formData.observacoes,
        ativo: formData.ativo ?? true,
        unidades: formData.unidades, // 🆕 SALVAR UNIDADES
        unidadePrincipal: formData.unidadePrincipal // 🆕 SALVAR UNIDADE PRINCIPAL
      };

      if (editingProfessor) {
        setProfessores(prev => prev.map(p => p.id === editingProfessor.id ? professorData : p));
        addNotification({
          type: 'success',
          title: 'Professor atualizado',
          message: 'Os dados do professor foram atualizados com sucesso!'
        });
      } else {
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProfessor ? 'Editar Professor' : 'Novo Professor'}
      size="xl"
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
              leftIcon={<User className="h-4 w-4" />}
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              error={errors.telefone}
              required
              leftIcon={<Phone className="h-4 w-4" />}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.senha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Senha do professor"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.senha}</p>
              )}
            </div>
          </div>
        </div>

        {/* 🆕 SEÇÃO DE UNIDADES */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Unidades de Atuação
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selecione as unidades onde o professor irá atuar *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unidadesDisponiveis.map((unidade) => (
                <label key={unidade.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.unidades.includes(unidade.nome)}
                    onChange={() => handleUnidadeToggle(unidade.nome)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                    {unidade.nome}
                  </span>
                </label>
              ))}
            </div>
            {errors.unidades && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unidades}</p>
            )}
          </div>

          {/* Unidade Principal */}
          {formData.unidades.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Unidade Principal (opcional)
              </label>
              <select
                value={formData.unidadePrincipal}
                onChange={(e) => handleInputChange('unidadePrincipal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione a unidade principal</option>
                {formData.unidades.map((unidadeNome) => (
                  <option key={unidadeNome} value={unidadeNome}>
                    {unidadeNome}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                A unidade principal será usada como padrão em relatórios e agendamentos
              </p>
            </div>
          )}
        </div>

        {/* Especialidades */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Especialidades
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Especialidades disponíveis
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {especialidadesDisponiveis.map((esp) => (
                <button
                  key={esp}
                  type="button"
                  onClick={() => adicionarEspecialidade(esp)}
                  disabled={formData.especialidades.includes(esp)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.especialidades.includes(esp)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900'
                  }`}
                >
                  {esp}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={novaEspecialidade}
                onChange={(e) => setNovaEspecialidade(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarNovaEspecialidade())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Digite uma nova especialidade"
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
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Especialidades selecionadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.especialidades.map((esp) => (
                    <span
                      key={esp}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {esp}
                      <button
                        type="button"
                        onClick={() => removerEspecialidade(esp)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {errors.especialidades && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.especialidades}</p>
            )}
          </div>
        </div>

        {/* Informações Profissionais */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Informações Profissionais
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experiência
            </label>
            <select
              value={formData.experiencia}
              onChange={(e) => handleInputChange('experiencia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="1-3">1 a 3 anos</option>
              <option value="3-5">3 a 5 anos</option>
              <option value="5-10">5 a 10 anos</option>
              <option value="10+">Mais de 10 anos</option>
            </select>
          </div>
        </div>

        {/* Pagamento */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Configuração de Pagamento
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Pagamento
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipoPagamento"
                  value="fixo"
                  checked={formData.tipoPagamento === 'fixo'}
                  onChange={(e) => handleInputChange('tipoPagamento', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                  Valor Fixo Mensal
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipoPagamento"
                  value="horas-variaveis"
                  checked={formData.tipoPagamento === 'horas-variaveis'}
                  onChange={(e) => handleInputChange('tipoPagamento', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                  Por Horas Variáveis
                </span>
              </label>
            </div>
          </div>

          {formData.tipoPagamento === 'fixo' && (
            <Input
              label="Valor Fixo Mensal (R$)"
              type="number"
              min="0"
              step="0.01"
              value={formData.valorFixo}
              onChange={(e) => handleInputChange('valorFixo', parseFloat(e.target.value) || 0)}
              error={errors.valorFixo}
              leftIcon={<DollarSign className="h-4 w-4" />}
            />
          )}

          {formData.tipoPagamento === 'horas-variaveis' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  1 Hora (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valoresHoras.umaHora}
                    onChange={(e) => handleValoresHorasChange('umaHora', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.valorUmaHora ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0,00"
                  />
                </div>
                {errors.valorUmaHora && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valorUmaHora}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  2 Horas (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valoresHoras.duasHoras}
                    onChange={(e) => handleValoresHorasChange('duasHoras', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.valorDuasHoras ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0,00"
                  />
                </div>
                {errors.valorDuasHoras && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valorDuasHoras}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  3+ Horas (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valoresHoras.tresOuMaisHoras}
                    onChange={(e) => handleValoresHorasChange('tresOuMaisHoras', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.valorTresHoras ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0,00"
                  />
                </div>
                {errors.valorTresHoras && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valorTresHoras}</p>
                )}
              </div>
            </div>
          )}

          <Input
            label="Valor para Aulão (R$)"
            type="number"
            min="0"
            step="0.01"
            value={formData.valorAulao}
            onChange={(e) => handleInputChange('valorAulao', parseFloat(e.target.value) || 0)}
            error={errors.valorAulao}
            leftIcon={<DollarSign className="h-4 w-4" />}
            placeholder="Valor especial para aulões"
          />
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Informações adicionais sobre o professor..."
          />
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="ativo"
            checked={formData.ativo}
            onChange={(e) => handleInputChange('ativo', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="ativo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Professor ativo
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {editingProfessor ? 'Atualizar' : 'Cadastrar'} Professor
          </Button>
        </div>
      </form>
    </Modal>
  );
};