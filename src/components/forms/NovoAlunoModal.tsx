import React, { useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { X } from 'lucide-react';
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
  planoId: 1, // Default to first plan
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
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
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

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    if (formData.tipoPlano === 'mensalidade' && !formData.planoId) {
      newErrors.planoId = 'Plano é obrigatório para mensalistas';
    }

    if (formData.tipoPlano === 'plataforma' && !formData.plataformaParceira) {
      newErrors.plataformaParceira = 'Plataforma parceira é obrigatória';
    }

    if (!formData.dataMatricula) {
      newErrors.dataMatricula = 'Data de matrícula é obrigatória';
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
      if (editingAluno) {
        // Update existing aluno
        setAlunos(prev => prev.map(aluno => 
          aluno.id === editingAluno.id 
            ? { ...aluno, ...formData }
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
          ...formData,
          id: Date.now(), // Simple ID generation for demo
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
  }, [formData, editingAluno, setAlunos, addNotification, onClose, validateForm]);

  const handleInputChange = useCallback((field: keyof AlunoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const availablePlanos = planos.filter(plano => plano.unidade === formData.unidade);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                placeholder="(11) 99999-9999"
              />
              {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {isSubmitting ? 'Salvando...' : editingAluno ? 'Atualizar' : 'Criar Aluno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};