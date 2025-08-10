import React, { useState, useCallback, useEffect } from 'react';
import { useAppState } from '@/contexts';
import { X, Calendar, MapPin, Plus, Trash2 } from 'lucide-react';
import type { Torneio, ModalProps, Categoria } from '@/types';
import { nanoid } from 'nanoid';

interface TorneioFormModalProps extends ModalProps {
  torneio?: Torneio | null;
}

export const TorneioFormModal: React.FC<TorneioFormModalProps> = ({
  isOpen,
  onClose,
  torneio
}) => {
  const { setTorneios, userLogado } = useAppState();
  
  // Form state with categories
  const [form, setForm] = useState<{
    nome: string;
    descricao: string;
    local: string;
    dataInicio: string;
    dataFim: string;
    status: Torneio['status'];
    categorias: Categoria[];
  }>({
    nome: '',
    descricao: '',
    local: '',
    dataInicio: '',
    dataFim: '',
    status: 'Inscrições',
    categorias: []
  });

  const isEditing = !!torneio;

  useEffect(() => {
    if (torneio) {
      setForm({
        nome: torneio.nome,
        descricao: torneio.descricao ?? '',
        local: torneio.local ?? '',
        dataInicio: (torneio.dataInicio ? torneio.dataInicio.split('T')[0] : '') as string,
        dataFim: (torneio.dataFim ? torneio.dataFim.split('T')[0] : '') as string,
        status: torneio.status,
        categorias: torneio.categorias || []
      });
    } else {
      setForm({
        nome: '',
        descricao: '',
        local: '',
        dataInicio: '',
        dataFim: '',
        status: 'Inscrições',
        categorias: []
      });
    }
  }, [torneio]);

  // Category management functions
  const addCategoria = useCallback(() => {
    const novaCategoria: Categoria = {
      id: nanoid(),
      nome: '',
      formato: 'double-elim-semi-3p',
      bestOfSF: 1,
      bestOfFinal: 1,
      duplas: [],
      chaveamento: {
        status: 'nao-gerado',
        matches: [],
        configuracao: {}
      }
    };

    setForm(prev => ({
      ...prev,
      categorias: [...(prev.categorias ?? []), novaCategoria]
    }));
  }, []);

  const updateCategoria = useCallback((categoriaId: string, field: keyof Categoria, value: any) => {
    setForm(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat =>
        cat.id === categoriaId ? { ...cat, [field]: value } : cat
      )
    }));
  }, []);

  const removeCategoria = useCallback((categoriaId: string) => {
    setForm(prev => ({
      ...prev,
      categorias: prev.categorias.filter(cat => cat.id !== categoriaId)
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      return;
    }

    const newTorneio: Torneio = {
      id: torneio?.id || `torneio_${Date.now()}`,
      nome: form.nome.trim(),
      // Force status to 'Inscrições' for new tournaments, keep existing for edits
      status: isEditing ? form.status : 'Inscrições',
      criadoPor: userLogado?.nome || 'Sistema',
      categorias: form.categorias || [],
      ...(form.descricao.trim() && { descricao: form.descricao.trim() }),
      ...(form.local.trim() && { local: form.local.trim() }),
      ...(form.dataInicio && { dataInicio: new Date(form.dataInicio).toISOString() }),
      ...(form.dataFim && { dataFim: new Date(form.dataFim).toISOString() })
    };

    if (isEditing) {
      setTorneios(prev => prev.map(t => t.id === torneio.id ? newTorneio : t));
    } else {
      setTorneios(prev => [...prev, newTorneio]);
    }

    onClose();
  }, [form, torneio, userLogado, setTorneios, onClose, isEditing]);

  const handleInputChange = useCallback((field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Torneio' : 'Criar Torneio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Torneio *
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Digite o nome do torneio"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descrição do torneio (opcional)"
            />
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Local
            </label>
            <input
              type="text"
              value={form.local}
              onChange={(e) => handleInputChange('local', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Local do torneio (opcional)"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data Início
              </label>
              <input
                type="date"
                value={form.dataInicio}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={form.dataFim}
                onChange={(e) => handleInputChange('dataFim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Status - Only show in edit mode */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => handleInputChange('status', e.target.value as Torneio['status'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Inscrições">Inscrições</option>
                <option value="Sorteio">Sorteio</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>
          )}

          {/* Categorias */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categorias
              </label>
              <button
                type="button"
                onClick={addCategoria}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Adicionar categoria
              </button>
            </div>

            {form.categorias.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                Nenhuma categoria adicionada. Clique em "Adicionar categoria" para começar.
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {form.categorias.map((categoria) => (
                  <div
                    key={categoria.id}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={categoria.nome}
                        onChange={(e) => updateCategoria(categoria.id, 'nome', e.target.value)}
                        placeholder="Nome da categoria"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeCategoria(categoria.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Remover categoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Limite Duplas
                        </label>
                        <input
                          type="number"
                          value={categoria.limiteDuplas || ''}
                          onChange={(e) => updateCategoria(categoria.id, 'limiteDuplas', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Ilimitado"
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Best of SF
                        </label>
                        <select
                          value={categoria.bestOfSF || 1}
                          onChange={(e) => updateCategoria(categoria.id, 'bestOfSF', parseInt(e.target.value) as 1 | 3)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value={1}>1</option>
                          <option value={3}>3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Best of Final
                        </label>
                        <select
                          value={categoria.bestOfFinal || 1}
                          onChange={(e) => updateCategoria(categoria.id, 'bestOfFinal', parseInt(e.target.value) as 1 | 3)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value={1}>1</option>
                          <option value={3}>3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
