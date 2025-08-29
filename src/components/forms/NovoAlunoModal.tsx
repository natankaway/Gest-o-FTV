import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { X, Upload, Plus, Minus, Eye, EyeOff } from 'lucide-react';
import type { Aluno, AlunoFormData } from '@/types';

interface NovoAlunoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAluno?: Aluno | null;
}

const INITIAL_FORM_DATA: AlunoFormData = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  unidade: 'Centro',
  tipoPlano: 'mensalidade',
  planoId: 1,
  plataformaParceira: '',
  status: 'ativo',
  vencimento: new Date().toISOString().substring(0, 10),
  nivel: 'iniciante',
  dataMatricula: new Date().toISOString().substring(0, 10),
  objetivo: '',
  ativo: true
};

export const NovoAlunoModal: React.FC<NovoAlunoModalProps> = ({
  isOpen,
  onClose,
  editingAluno
}) => {
  const { dadosMockados, setAlunos } = useAppState();
  const { planos, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<AlunoFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCheckInNames, setShowCheckInNames] = useState(false);
  const [checkInNames, setCheckInNames] = useState<string[]>(['']);

  // Initialize form when editing
  useEffect(() => {
    if (editingAluno) {
      setFormData({
        nome: editingAluno.nome,
        email: editingAluno.email,
        telefone: editingAluno.telefone,
        senha: editingAluno.senha,
        unidade: editingAluno.unidade,
        tipoPlano: editingAluno.tipoPlano,
        planoId: editingAluno.planoId || 1,
        plataformaParceira: editingAluno.plataformaParceira || '',
        status: editingAluno.status,
        vencimento: editingAluno.vencimento,
        nivel: editingAluno.nivel,
        dataMatricula: editingAluno.dataMatricula,
        objetivo: editingAluno.objetivo,
        ativo: editingAluno.ativo ?? true
      });
      
      // Load existing check-in names if available
      if (editingAluno.nomesCheckIn && editingAluno.nomesCheckIn.length > 0) {
        setCheckInNames(editingAluno.nomesCheckIn);
        setShowCheckInNames(true);
      }
    } else {
      setFormData(INITIAL_FORM_DATA);
      setCheckInNames(['']);
      setShowCheckInNames(false);
    }
    setErrors({});
    setProfileImage(null);
    setImageFile(null);
  }, [editingAluno, isOpen]);

  // Update vencimento when plano changes
  useEffect(() => {
    if (formData.tipoPlano === 'mensalidade' && formData.planoId) {
      const dataVencimento = new Date();
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      setFormData(prev => ({
        ...prev,
        vencimento: dataVencimento.toISOString().substring(0, 10)
      }));
    }
  }, [formData.tipoPlano, formData.planoId]);

  // Reset check-in names when plan type changes
  useEffect(() => {
    if (formData.tipoPlano !== 'plataforma') {
      setShowCheckInNames(false);
      setCheckInNames(['']);
    }
  }, [formData.tipoPlano]);

  // Phone mask formatting
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const match = numbers.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Enhanced validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nome validation
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Phone validation
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else {
      const numbersOnly = formData.telefone.replace(/\D/g, '');
      if (numbersOnly.length !== 11) {
        newErrors.telefone = 'Telefone deve ter 11 dígitos';
      }
    }

    // Password validation
    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 8) {
      newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
    }

    // Unit validation
    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    // Plan validation
    if (formData.tipoPlano === 'mensalidade' && !formData.planoId) {
      newErrors.planoId = 'Plano é obrigatório para mensalistas';
    }

    if (formData.tipoPlano === 'plataforma' && !formData.plataformaParceira) {
      newErrors.plataformaParceira = 'Plataforma parceira é obrigatória';
    }

    // Date validation
    if (!formData.dataMatricula) {
      newErrors.dataMatricula = 'Data de matrícula é obrigatória';
    } else {
      const matriculaDate = new Date(formData.dataMatricula);
      const today = new Date();
      if (matriculaDate > today) {
        newErrors.dataMatricula = 'Data de matrícula não pode ser futura';
      }
    }

    // Check-in names validation (only if showing and platform type)
    if (showCheckInNames && formData.tipoPlano === 'plataforma') {
      const validNames = checkInNames.filter(name => name.trim());
      if (validNames.length === 0) {
        newErrors.checkInNames = 'Adicione pelo menos um nome para check-in';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Arquivo inválido',
          message: 'Por favor, selecione uma imagem válida'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: 'Arquivo muito grande',
          message: 'A imagem deve ter no máximo 5MB'
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCheckInName = () => {
    if (checkInNames.length < 3) {
      setCheckInNames([...checkInNames, '']);
    }
  };

  const removeCheckInName = (index: number) => {
    if (checkInNames.length > 1) {
      const newNames = checkInNames.filter((_, i) => i !== index);
      setCheckInNames(newNames);
    }
  };

  const updateCheckInName = (index: number, value: string) => {
    const newNames = [...checkInNames];
    newNames[index] = value;
    setCheckInNames(newNames);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalFormData = {
        ...formData,
        nomesCheckIn: showCheckInNames ? checkInNames.filter(name => name.trim()) : []
      };

      if (editingAluno) {
        // Update existing aluno
        setAlunos(prev => prev.map(aluno => 
          aluno.id === editingAluno.id 
            ? { ...aluno, ...finalFormData }
            : aluno
        ));
        
        addNotification({
          type: 'success',
          title: 'Aluno atualizado',
          message: `${formData.nome} foi atualizado com sucesso!`
        });
      } else {
        // Create new aluno
        const newAluno: Aluno = {
          ...finalFormData,
          id: Date.now(),
        };

        setAlunos(prev => [...prev, newAluno]);
        
        addNotification({
          type: 'success',
          title: 'Aluno criado',
          message: `${formData.nome} foi adicionado com sucesso!`
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar o aluno. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingAluno, setAlunos, addNotification, onClose, showCheckInNames, checkInNames]);

  const handleInputChange = useCallback((field: keyof AlunoFormData, value: any) => {
    if (field === 'telefone') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const availablePlanos = planos.filter(plano => plano.unidade === formData.unidade);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Foto do perfil (opcional, máx. 5MB)
            </p>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Digite o nome completo"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="exemplo@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="(21) 99999-9999"
                maxLength={15}
              />
              {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
            </div>

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
                {unidades.map(unidade => (
                  <option key={unidade.id} value={unidade.nome}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
              {errors.unidade && <p className="text-red-500 text-xs mt-1">{errors.unidade}</p>}
            </div>
          </div>

          {/* Plan Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Plano *
              </label>
              <select
                value={formData.tipoPlano}
                onChange={(e) => handleInputChange('tipoPlano', e.target.value as 'mensalidade' | 'plataforma')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="mensalidade">Mensalidade</option>
                <option value="plataforma">Plataforma Parceira</option>
              </select>
            </div>

            {formData.tipoPlano === 'mensalidade' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plano *
                </label>
                <select
                  value={formData.planoId || ''}
                  onChange={(e) => handleInputChange('planoId', e.target.value ? Number(e.target.value) : 1)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.planoId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Selecione um plano</option>
                  {availablePlanos.map(plano => (
                    <option key={plano.id} value={plano.id}>
                      {plano.nome} - R$ {plano.preco.toFixed(2)}
                    </option>
                  ))}
                </select>
                {errors.planoId && <p className="text-red-500 text-xs mt-1">{errors.planoId}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plataforma Parceira *
                </label>
                <select
                  value={formData.plataformaParceira}
                  onChange={(e) => handleInputChange('plataformaParceira', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.plataformaParceira ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Selecione uma plataforma</option>
                  <option value="Wellhub">Wellhub</option>
                  <option value="TotalPass">TotalPass</option>
                </select>
                {errors.plataformaParceira && <p className="text-red-500 text-xs mt-1">{errors.plataformaParceira}</p>}
              </div>
            )}
          </div>

          {/* Check-in Names Section (Only for Platform Plans) */}
          {formData.tipoPlano === 'plataforma' && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nomes para Check-in
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCheckInNames(!showCheckInNames)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  {showCheckInNames ? 'Ocultar' : 'Adicionar Nomes'}
                </Button>
              </div>
              
              {showCheckInNames && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nomes alternativos para check-in na plataforma parceira (máximo 3)
                  </p>
                  
                  {checkInNames.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => updateCheckInName(index, e.target.value)}
                        placeholder={`Nome alternativo ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      
                      {checkInNames.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => removeCheckInName(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {index === checkInNames.length - 1 && checkInNames.length < 3 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={addCheckInName}
                          leftIcon={<Plus className="h-4 w-4" />}
                        >
                          Adicionar
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {errors.checkInNames && <p className="text-red-500 text-xs mt-1">{errors.checkInNames}</p>}
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nível
              </label>
              <select
                value={formData.nivel}
                onChange={(e) => handleInputChange('nivel', e.target.value as 'iniciante' | 'intermediario' | 'avancado')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'ativo' | 'pendente' | 'inativo')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="ativo">Ativo</option>
                <option value="pendente">Pendente</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Matrícula *
              </label>
              <input
                type="date"
                value={formData.dataMatricula}
                onChange={(e) => handleInputChange('dataMatricula', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.dataMatricula ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.dataMatricula && <p className="text-red-500 text-xs mt-1">{errors.dataMatricula}</p>}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objetivo/Observações
            </label>
            <textarea
              value={formData.objetivo}
              onChange={(e) => handleInputChange('objetivo', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descreva os objetivos do aluno ou observações importantes..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
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
              {isSubmitting ? 'Salvando...' : editingAluno ? 'Atualizar' : 'Criar Aluno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};