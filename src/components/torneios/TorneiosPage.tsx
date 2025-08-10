import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppState } from '@/contexts';
import { usePagination, useDebouncedSearch } from '@/hooks';
import { Plus, Trophy, Filter, Calendar, MapPin, Search, Trash2, MoreVertical, Edit2 } from 'lucide-react';
import { TorneioFormModal } from './TorneioFormModal';
import { TorneioDetalhePage } from './TorneioDetalhePage';
import type { Torneio } from '@/types';

export const TorneiosPage: React.FC = () => {
  const { dadosMockados, userLogado, setTorneios } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTorneio, setSelectedTorneio] = useState<Torneio | null>(null);
  const [viewingTorneio, setViewingTorneio] = useState<Torneio | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const debouncedSearch = useDebouncedSearch(searchTerm, 300);
  
  const userRole = userLogado?.perfil || 'aluno';
  const canEdit = userRole === 'admin' || userRole === 'gestor' || userRole === 'professor';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    
    return undefined;
  }, [openDropdown]);

  // Filter torneios based on search and filters
  const filteredTorneios = useMemo(() => {
    let filtered = dadosMockados.torneios;

    // Text search
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter(torneio =>
        torneio.nome.toLowerCase().includes(search) ||
        torneio.local?.toLowerCase().includes(search) ||
        torneio.descricao?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(torneio => torneio.status === statusFilter);
    }

    return filtered;
  }, [dadosMockados.torneios, debouncedSearch, statusFilter]);

  const { currentData, currentPage, totalPages, goToPage, hasNextPage, hasPreviousPage } = usePagination(filteredTorneios, 12);

  const handleCreateTorneio = useCallback(() => {
    setSelectedTorneio(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleEditTorneio = useCallback((torneio: Torneio) => {
    setSelectedTorneio(torneio);
    setIsCreateModalOpen(true);
  }, []);

  const handleViewTorneio = useCallback((torneio: Torneio) => {
    setViewingTorneio(torneio);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewingTorneio(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedTorneio(null);
  }, []);

  const handleDeleteTorneio = useCallback((torneio: Torneio) => {
    if (window.confirm(`Tem certeza que deseja excluir o torneio "${torneio.nome}"? Todas as categorias, duplas e resultados serão perdidos.`)) {
      setTorneios(prev => prev.filter(t => t.id !== torneio.id));
    }
  }, [setTorneios]);

  const getStatusColor = (status: Torneio['status']) => {
    switch (status) {
      case 'Inscrições':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Sorteio':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Em andamento':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Finalizado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // If viewing a specific tournament, show detail page
  if (viewingTorneio) {
    return (
      <TorneioDetalhePage
        torneio={viewingTorneio}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Torneios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {canEdit ? 'Gerencie torneios e competições' : 'Visualize torneios e competições'}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleCreateTorneio}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Criar Torneio
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar torneios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
            >
              <option value="">Todos os status</option>
              <option value="Inscrições">Inscrições</option>
              <option value="Sorteio">Sorteio</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Torneios Grid */}
      {currentData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filteredTorneios.length === 0 ? 'Nenhum torneio encontrado' : 'Nenhum torneio corresponde aos filtros'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {canEdit && filteredTorneios.length === 0
              ? 'Crie seu primeiro torneio clicando no botão "Criar Torneio"'
              : 'Tente ajustar os filtros de busca'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.map((torneio) => (
            <div
              key={torneio.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 
                  className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer flex-1 mr-2"
                  onClick={() => handleViewTorneio(torneio)}
                >
                  {torneio.nome}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(torneio.status)}`}>
                    {torneio.status}
                  </span>
                  {canEdit && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === torneio.id ? null : torneio.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openDropdown === torneio.id && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(null);
                              handleEditTorneio(torneio);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Edit2 className="h-3 w-3" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(null);
                              handleDeleteTorneio(torneio);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div onClick={() => handleViewTorneio(torneio)} className="cursor-pointer">
                {torneio.descricao && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {torneio.descricao}
                  </p>
                )}

                <div className="space-y-2">
                  {torneio.local && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {torneio.local}
                    </div>
                  )}

                  {torneio.dataInicio && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {formatDate(torneio.dataInicio)}
                      {torneio.dataFim && ` - ${formatDate(torneio.dataFim)}`}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {torneio.categorias.length} categoria{torneio.categorias.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {torneio.categorias.reduce((total, cat) => total + cat.duplas.length, 0)} dupla{torneio.categorias.reduce((total, cat) => total + cat.duplas.length, 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPreviousPage}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <TorneioFormModal
          torneio={selectedTorneio}
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};