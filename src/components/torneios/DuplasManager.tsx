import React, { useState, useCallback, useMemo } from 'react';
import { useAppState } from '@/contexts';
import { Plus, Edit2, Trash2, Users, User, UserCheck } from 'lucide-react';
import { DuplaFormModal } from './DuplaFormModal';
import { torneioStateUtils } from '@/utils/torneioStateUtils';
import toast from 'react-hot-toast';
import type { Torneio, Dupla } from '@/types';

interface DuplasManagerProps {
  torneio: Torneio;
  onUpdateTorneio: (torneio: Torneio) => void;
  selectedCategoria: string | null;
  onSelectCategoria: (categoriaId: string | null) => void;
  canEdit: boolean;
}

export const DuplasManager: React.FC<DuplasManagerProps> = ({
  torneio,
  onUpdateTorneio: _onUpdateTorneio, // Keep for interface compatibility but not used
  selectedCategoria,
  onSelectCategoria,
  canEdit
}) => {
  const { dadosMockados, setTorneios } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDupla, setEditingDupla] = useState<Dupla | null>(null);
  
  // Get current tournament from latest state
  const currentTorneio = dadosMockados.torneios.find(t => t.id === torneio.id) || torneio;
  const categoriaAtual = selectedCategoria ? currentTorneio.categorias.find(c => c.id === selectedCategoria) : null;

  const handleAdd = useCallback(() => {
    if (!selectedCategoria) return;
    setEditingDupla(null);
    setIsModalOpen(true);
  }, [selectedCategoria]);

  const handleEdit = useCallback((dupla: Dupla) => {
    setEditingDupla(dupla);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingDupla(null);
  }, []);

  const handleSubmitDupla = useCallback((dupla: Dupla) => {
    if (!selectedCategoria || !categoriaAtual) {
      toast.error('Selecione uma categoria primeiro');
      return;
    }

    // Validate duplicate players within the dupla
    if (!torneioStateUtils.validateDuplaPlayers(dupla)) {
      toast.error('Não é possível criar uma dupla com o mesmo jogador nas duas posições');
      return;
    }

    // Validate uniqueness within category
    const uniquenessCheck = torneioStateUtils.validateDuplaUniquenessInCategory(
      dupla, 
      categoriaAtual, 
      editingDupla?.id
    );
    if (!uniquenessCheck.isValid) {
      toast.error(uniquenessCheck.message || 'Jogador já participa de outra dupla nesta categoria');
      return;
    }

    // Validate identical dupla
    const identicalCheck = torneioStateUtils.validateDuplaIdentical(
      dupla, 
      categoriaAtual, 
      editingDupla?.id
    );
    if (!identicalCheck.isValid) {
      toast.error(identicalCheck.message || 'Esta dupla já existe nesta categoria');
      return;
    }

    // Check category limit
    if (!editingDupla && !torneioStateUtils.canAddDupla(categoriaAtual)) {
      toast.error(`Limite de duplas atingido para esta categoria (${categoriaAtual.limiteDuplas})`);
      return;
    }

    if (editingDupla) {
      // Update existing dupla
      setTorneios(prev => torneioStateUtils.updateDupla(
        prev, 
        currentTorneio.id, 
        selectedCategoria, 
        editingDupla.id, 
        () => dupla
      ));
      toast.success('Dupla atualizada com sucesso!');
    } else {
      // Add new dupla
      setTorneios(prev => torneioStateUtils.pushDupla(
        prev, 
        currentTorneio.id, 
        selectedCategoria, 
        dupla
      ));
      toast.success('Dupla adicionada com sucesso!');
    }

    handleCloseModal();
  }, [selectedCategoria, categoriaAtual, editingDupla, currentTorneio.id, setTorneios]);

  const handleDelete = useCallback((duplaId: string) => {
    if (!selectedCategoria) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta dupla?')) {
      setTorneios(prev => torneioStateUtils.removeDupla(
        prev, 
        currentTorneio.id, 
        selectedCategoria, 
        duplaId
      ));
      toast.success('Dupla removida com sucesso!');
    }
  }, [selectedCategoria, currentTorneio.id, setTorneios]);

  const canAddMore = useMemo(() => {
    if (!categoriaAtual) return false;
    return !categoriaAtual.limiteDuplas || categoriaAtual.duplas.length < categoriaAtual.limiteDuplas;
  }, [categoriaAtual]);

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selecione uma categoria
        </label>
        <select
          value={selectedCategoria || ''}
          onChange={(e) => onSelectCategoria(e.target.value || null)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Escolha uma categoria...</option>
          {currentTorneio.categorias.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome} ({categoria.duplas.length} duplas
              {categoria.limiteDuplas && ` / ${categoria.limiteDuplas}`})
            </option>
          ))}
        </select>
      </div>

      {selectedCategoria && categoriaAtual && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Duplas - {categoriaAtual.nome}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {canEdit ? 'Gerencie as duplas desta categoria' : 'Visualize as duplas desta categoria'}
              </p>
            </div>
            {canEdit && canAddMore && (
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Dupla
              </button>
            )}
          </div>

          {!canAddMore && canEdit && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Limite de duplas atingido para esta categoria ({categoriaAtual.limiteDuplas} duplas).
              </p>
            </div>
          )}

          {/* Duplas List */}
          {categoriaAtual.duplas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma dupla cadastrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {canEdit ? 'Adicione duplas para esta categoria' : 'Aguarde as duplas serem cadastradas'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriaAtual.duplas.map((dupla) => (
                <div
                  key={dupla.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {dupla.nome && (
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {dupla.nome}
                        </h3>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(dupla)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(dupla.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {dupla.jogadores.map((jogador, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {jogador.tipo === 'aluno' ? (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <User className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-gray-900 dark:text-white">
                          {jogador.nome}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {jogador.tipo === 'aluno' ? '(Aluno)' : '(Convidado)'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                    Inscrito em: {new Date(dupla.inscritoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedCategoria && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Selecione uma categoria
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha uma categoria acima para gerenciar suas duplas
          </p>
        </div>
      )}

      {/* Dupla Form Modal */}
      <DuplaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        dupla={editingDupla}
        onSubmit={handleSubmitDupla}
      />
    </div>
  );
};