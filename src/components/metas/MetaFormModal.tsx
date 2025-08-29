import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { MetaGeral, User, Unidade, ModalProps } from '@/types';

interface MetaFormModalProps extends ModalProps {
  onSave: (meta: Omit<MetaGeral, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editingMeta: MetaGeral | null;
  userLogado: User | null;
  unidades: Unidade[];
}

export const MetaFormModal: React.FC<MetaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMeta,
  userLogado,
  unidades
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    escopo: 'CT' as 'CT' | 'Unidade',
    unidadeId: '',
    valorAlvo: '',
    valorAtual: '',
    prazo: '',
    responsavel: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrar unidades baseado no perfil do usuário
  const unidadesDisponiveis = React.useMemo(() => {
    if (userLogado?.perfil === 'admin') {
      return unidades;
    }
    if (userLogado?.perfil === 'gestor') {
      const unidadesGestor = userLogado.unidades || [];
      return unidades.filter(unidade => unidadesGestor.includes(unidade.nome));
    }
    return [];
  }, [unidades, userLogado]);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingMeta) {
      setFormData({
        titulo: editingMeta.titulo,
        descricao: editingMeta.descricao || '',
        escopo: editingMeta.escopo,
        unidadeId: editingMeta.unidadeId || '',
        valorAlvo: editingMeta.valorAlvo.toString(),
        valorAtual: editingMeta.valorAtual.toString(),
        prazo: editingMeta.prazo && editingMeta.prazo.includes('T') ? editingMeta.prazo.split('T')[0] : editingMeta.prazo || '',
        responsavel: editingMeta.responsavel || ''
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        escopo: 'CT',
        unidadeId: '',
        valorAlvo: '',
        valorAtual: '0',
        prazo: '',
        responsavel: ''
      });
    }
    setErrors({});
  }, [editingMeta, isOpen]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.valorAlvo || parseFloat(formData.valorAlvo) <= 0) {
      newErrors.valorAlvo = 'Valor alvo deve ser maior que 0';
    }

    if (!formData.valorAtual || parseFloat(formData.valorAtual) < 0) {
      newErrors.valorAtual = 'Valor atual deve ser maior ou igual a 0';
    }

    if (formData.escopo === 'Unidade' && !formData.unidadeId) {
      newErrors.unidadeId = 'Unidade é obrigatória quando escopo é "Unidade"';
    }

    // Validar data (se fornecida)
    if (formData.prazo) {
      const dataInformada = new Date(formData.prazo);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataInformada < hoje) {
        newErrors.prazo = 'Prazo não pode ser anterior a hoje';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const metaData: Omit<MetaGeral, 'id' | 'criadoEm' | 'atualizadoEm'> = {
      titulo: formData.titulo.trim(),
      escopo: formData.escopo,
      valorAlvo: parseFloat(formData.valorAlvo),
      valorAtual: parseFloat(formData.valorAtual)
    };

    // Only add optional fields if they have values
    if (formData.descricao.trim()) {
      metaData.descricao = formData.descricao.trim();
    }
    if (formData.escopo === 'Unidade' && formData.unidadeId) {
      metaData.unidadeId = formData.unidadeId;
    }
    if (formData.prazo) {
      metaData.prazo = formData.prazo;
    }
    if (formData.responsavel.trim()) {
      metaData.responsavel = formData.responsavel.trim();
    }

    onSave(metaData);
  }, [formData, validateForm, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingMeta ? 'Editar Meta' : 'Nova Meta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.titulo 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ex: Aumentar receita do CT"
            />
            {errors.titulo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Descreva os detalhes da meta..."
            />
          </div>

          {/* Escopo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Escopo *
            </label>
            <select
              value={formData.escopo}
              onChange={(e) => handleInputChange('escopo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="CT">CT (Global)</option>
              <option value="Unidade">Por Unidade</option>
            </select>
          </div>

          {/* Unidade (só aparece quando escopo é "Unidade") */}
          {formData.escopo === 'Unidade' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unidade *
              </label>
              <select
                value={formData.unidadeId}
                onChange={(e) => handleInputChange('unidadeId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.unidadeId 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione uma unidade</option>
                {unidadesDisponiveis.map(unidade => (
                  <option key={unidade.id} value={unidade.nome}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
              {errors.unidadeId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.unidadeId}
                </p>
              )}
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor Alvo *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valorAlvo}
                onChange={(e) => handleInputChange('valorAlvo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.valorAlvo 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: 100000"
              />
              {errors.valorAlvo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.valorAlvo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor Atual *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valorAtual}
                onChange={(e) => handleInputChange('valorAtual', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.valorAtual 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: 65000"
              />
              {errors.valorAtual && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.valorAtual}
                </p>
              )}
            </div>
          </div>

          {/* Prazo e Responsável */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prazo
              </label>
              <input
                type="date"
                value={formData.prazo}
                onChange={(e) => handleInputChange('prazo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.prazo 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.prazo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.prazo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsável
              </label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: João Santos"
              />
            </div>
          </div>

          {/* Progresso Preview */}
          {formData.valorAlvo && formData.valorAtual && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview do Progresso
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {parseFloat(formData.valorAtual || '0').toLocaleString()} / {parseFloat(formData.valorAlvo || '0').toLocaleString()}
                  </span>
                  <span className="font-medium">
                    {((parseFloat(formData.valorAtual || '0') / parseFloat(formData.valorAlvo || '1')) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ 
                      width: `${Math.min(100, (parseFloat(formData.valorAtual || '0') / parseFloat(formData.valorAlvo || '1')) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {editingMeta ? 'Atualizar' : 'Criar'} Meta
          </button>
        </div>
      </div>
    </div>
  );
};