import React, { useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { Torneio, Categoria } from '@/types';

interface CategoriaFormProps {
  torneio: Torneio;
  onAddCategoria: (categoria: Categoria) => void;
  onUpdateCategoria: (categoriaId: string, categoria: Categoria) => void;
  onRemoveCategoria: (categoriaId: string) => void;
  canEdit: boolean;
}

interface CategoriaFormData {
  nome: string;
  limiteDuplas: string;
  bestOfSF: 1 | 3;
  bestOfFinal: 1 | 3;
}

export const CategoriaForm: React.FC<CategoriaFormProps> = ({
  torneio,
  onAddCategoria,
  onUpdateCategoria,
  onRemoveCategoria,
  canEdit
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoriaFormData>({
    nome: '',
    limiteDuplas: '',
    bestOfSF: 1,
    bestOfFinal: 1
  });

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      limiteDuplas: '',
      bestOfSF: 1,
      bestOfFinal: 1
    });
    setIsAdding(false);
    setEditingId(null);
  }, []);

  const handleAdd = useCallback(() => {
    setFormData({
      nome: '',
      limiteDuplas: '',
      bestOfSF: 1,
      bestOfFinal: 1
    });
    setEditingId(null);
    setIsAdding(true);
  }, []);

  const handleEdit = useCallback((categoria: Categoria) => {
    setFormData({
      nome: categoria.nome,
      limiteDuplas: categoria.limiteDuplas?.toString() || '',
      bestOfSF: categoria.bestOfSF || 1,
      bestOfFinal: categoria.bestOfFinal || 1
    });
    setEditingId(categoria.id);
    setIsAdding(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      return;
    }

    const categoriaData: Categoria = {
      id: editingId || `categoria_${nanoid()}`,
      nome: formData.nome.trim(),
      formato: 'double-elim-semi-3p',
      duplas: [],
      chaveamento: {
        status: 'nao-gerado',
        matches: [],
        configuracao: {}
      },
      ...(formData.limiteDuplas && { limiteDuplas: parseInt(formData.limiteDuplas) }),
      ...(formData.bestOfSF !== 1 && { bestOfSF: formData.bestOfSF }),
      ...(formData.bestOfFinal !== 1 && { bestOfFinal: formData.bestOfFinal })
    };

    if (editingId) {
      onUpdateCategoria(editingId, categoriaData);
    } else {
      onAddCategoria(categoriaData);
    }

    resetForm();
  }, [formData, editingId, onAddCategoria, onUpdateCategoria, resetForm]);

  const handleDelete = useCallback((categoriaId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Todas as duplas e resultados serão perdidos.')) {
      onRemoveCategoria(categoriaId);
    }
  }, [onRemoveCategoria]);

  const handleInputChange = useCallback((field: keyof CategoriaFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categorias do Torneio
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {canEdit ? 'Gerencie as categorias da competição' : 'Visualize as categorias da competição'}
          </p>
        </div>
        {canEdit && !isAdding && !editingId && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar Categoria
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Categoria *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Ex: Masculino, Feminino, Misto"
                required
              />
            </div>

            {/* Limite de Duplas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Limite de Duplas
              </label>
              <input
                type="number"
                min="4"
                max="64"
                value={formData.limiteDuplas}
                onChange={(e) => handleInputChange('limiteDuplas', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Opcional"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mínimo 4 duplas para gerar chave
              </p>
            </div>

            {/* Best of Semifinal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semifinal (Melhor de)
              </label>
              <select
                value={formData.bestOfSF}
                onChange={(e) => handleInputChange('bestOfSF', parseInt(e.target.value) as 1 | 3)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value={1}>Jogo único</option>
                <option value={3}>Melhor de 3</option>
              </select>
            </div>

            {/* Best of Final */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Final (Melhor de)
              </label>
              <select
                value={formData.bestOfFinal}
                onChange={(e) => handleInputChange('bestOfFinal', parseInt(e.target.value) as 1 | 3)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value={1}>Jogo único</option>
                <option value={3}>Melhor de 3</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      {torneio.categorias.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma categoria criada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {canEdit ? 'Adicione categorias para organizar o torneio' : 'Aguarde as categorias serem criadas'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {torneio.categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {categoria.nome}
                </h3>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(categoria)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(categoria.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duplas:</span>
                  <span className="text-gray-900 dark:text-white">
                    {categoria.duplas.length}
                    {categoria.limiteDuplas && ` / ${categoria.limiteDuplas}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Semifinal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {categoria.bestOfSF === 3 ? 'Melhor de 3' : 'Jogo único'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Final:</span>
                  <span className="text-gray-900 dark:text-white">
                    {categoria.bestOfFinal === 3 ? 'Melhor de 3' : 'Jogo único'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Chaveamento:</span>
                  <span className={`text-sm font-medium ${
                    categoria.chaveamento.status === 'nao-gerado' ? 'text-gray-500' :
                    categoria.chaveamento.status === 'gerado' ? 'text-yellow-600' :
                    categoria.chaveamento.status === 'em-andamento' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {categoria.chaveamento.status === 'nao-gerado' ? 'Não gerado' :
                     categoria.chaveamento.status === 'gerado' ? 'Gerado' :
                     categoria.chaveamento.status === 'em-andamento' ? 'Em andamento' :
                     'Finalizado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};