import React, { useState, useCallback, useEffect } from 'react';
import { useAppState } from '@/contexts';
import { X, Calendar, MapPin } from 'lucide-react';
import type { Torneio, ModalProps } from '@/types';

interface TorneioFormModalProps extends ModalProps {
  torneio?: Torneio | null;
}

export const TorneioFormModal: React.FC<TorneioFormModalProps> = ({
  isOpen,
  onClose,
  torneio
}) => {
  const { setTorneios, userLogado } = useAppState();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    local: '',
    dataInicio: '',
    dataFim: '',
    status: 'Inscrições' as Torneio['status']
  });

  const isEditing = !!torneio;

  useEffect(() => {
    if (torneio) {
      setFormData({
        nome: torneio.nome,
        descricao: torneio.descricao ?? '',
        local: torneio.local ?? '',
        dataInicio: torneio.dataInicio ? torneio.dataInicio.split('T')[0] : '',
        dataFim: torneio.dataFim ? torneio.dataFim.split('T')[0] : '',
        status: torneio.status
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        local: '',
        dataInicio: '',
        dataFim: '',
        status: 'Inscrições'
      });
    }
  }, [torneio]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      return;
    }

    const newTorneio: Torneio = {
      id: torneio?.id || `torneio_${Date.now()}`,
      nome: formData.nome.trim(),
      status: formData.status,
      criadoPor: userLogado?.nome || 'Sistema',
      categorias: torneio?.categorias || [],
      ...(formData.descricao.trim() && { descricao: formData.descricao.trim() }),
      ...(formData.local.trim() && { local: formData.local.trim() }),
      ...(formData.dataInicio && { dataInicio: new Date(formData.dataInicio).toISOString() }),
      ...(formData.dataFim && { dataFim: new Date(formData.dataFim).toISOString() })
    };

    if (isEditing) {
      setTorneios(prev => prev.map(t => t.id === torneio.id ? newTorneio : t));
    } else {
      setTorneios(prev => [...prev, newTorneio]);
    }

    onClose();
  }, [formData, torneio, userLogado, setTorneios, onClose, isEditing]);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              value={formData.nome}
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
              value={formData.descricao}
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
              value={formData.local}
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
                value={formData.dataInicio}
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
                value={formData.dataFim}
                onChange={(e) => handleInputChange('dataFim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as Torneio['status'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Inscrições">Inscrições</option>
              <option value="Sorteio">Sorteio</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Finalizado">Finalizado</option>
            </select>
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