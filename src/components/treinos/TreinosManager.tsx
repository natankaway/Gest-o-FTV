import React, { useState, useCallback, memo, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { Canvas } from './Canvas';
import { CanvasToolbar } from './CanvasToolbar';
import { TreinoForm } from './TreinoForm';
import { 
  List, 
  Plus, 
  Edit, 
  Trash, 
  Eye, 
  Clock,
  Target,
  Users,
  Layers,
  Palette,
  BookOpen,
  Search,
  Filter,
  Save
} from 'lucide-react';
import type { Treino, TreinoFormData } from '@/types';
import type { PranchetaData, ToolType } from '@/types/canvas';

type TabType = 'lista' | 'form' | 'prancheta';

interface TreinosManagerState {
  activeTab: TabType;
  selectedTreino: (Treino & { pranchetaData?: PranchetaData }) | null;
  editingTreino: (TreinoFormData & { id?: number; pranchetaData?: PranchetaData }) | null;
  pranchetaData: PranchetaData | null;
  selectedTool: ToolType;
  selectedColor: string;
  searchTerm: string;
  filterType: string;
  filterNivel: string;
}

export const TreinosManager: React.FC = memo(() => {
  const { dadosMockados, setTreinos, userLogado, unidadeSelecionada } = useAppState();
  const { addNotification } = useNotifications();

  const [state, setState] = useState<TreinosManagerState>({
    activeTab: 'lista',
    selectedTreino: null,
    editingTreino: null,
    pranchetaData: null,
    selectedTool: 'select',
    selectedColor: '#EF4444',
    searchTerm: '',
    filterType: '',
    filterNivel: '',
  });

  // Filter and search treinos
  const filteredTreinos = useMemo(() => {
    let filtered = dadosMockados.treinos;

    // Filter by user's access (if not admin)
    if (userLogado?.perfil !== 'admin') {
      filtered = filtered.filter(treino => 
        treino.professorId === userLogado?.id || 
        treino.unidade === unidadeSelecionada
      );
    }

    // Search filter
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(treino =>
        treino.nome.toLowerCase().includes(term) ||
        treino.objetivo.toLowerCase().includes(term) ||
        treino.professor?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (state.filterType) {
      filtered = filtered.filter(treino => treino.tipo === state.filterType);
    }

    // Level filter
    if (state.filterNivel) {
      filtered = filtered.filter(treino => treino.nivel === state.filterNivel);
    }

    return filtered.sort((a, b) => new Date(b.data || '').getTime() - new Date(a.data || '').getTime());
  }, [dadosMockados.treinos, userLogado, unidadeSelecionada, state.searchTerm, state.filterType, state.filterNivel]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setState(prev => ({ 
      ...prev, 
      activeTab: tab,
      editingTreino: tab === 'form' && !prev.editingTreino ? {
        nome: '',
        tipo: 'tecnico',
        nivel: 'iniciante',
        duracao: 60,
        objetivo: '',
        equipamentos: [],
        exercicios: [],
        professorId: 0,
        unidade: '',
      } as TreinoFormData : prev.editingTreino
    }));
  }, []);

  // Handle new treino
  const handleNewTreino = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTab: 'form',
      editingTreino: {
        nome: '',
        tipo: 'tecnico',
        nivel: 'iniciante',
        duracao: 60,
        objetivo: '',
        equipamentos: [],
        exercicios: [],
        professorId: 0,
        unidade: '',
      } as TreinoFormData,
      selectedTreino: null,
    }));
  }, []);

  // Handle edit treino
  const handleEditTreino = useCallback((treino: Treino) => {
    setState(prev => ({
      ...prev,
      activeTab: 'form',
      editingTreino: { ...treino },
      selectedTreino: treino,
    }));
  }, []);

  // Handle view prancheta
  const handleViewPrancheta = useCallback((treino: Treino) => {
    const treinoComPrancheta = treino as Treino & { pranchetaData?: PranchetaData };
    setState(prev => ({
      ...prev,
      activeTab: 'prancheta',
      selectedTreino: treinoComPrancheta,
      pranchetaData: treinoComPrancheta.pranchetaData || null,
    }));
  }, []);

  // Handle delete treino
  const handleDeleteTreino = useCallback((treinoId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      setTreinos(prev => prev.filter(t => t.id !== treinoId));
      addNotification({
        type: 'success',
        title: 'Treino excluído',
        message: 'O treino foi removido com sucesso'
      });
    }
  }, [setTreinos, addNotification]);

  // Handle save treino
  const handleSaveTreino = useCallback((data: TreinoFormData & { pranchetaData?: PranchetaData }) => {
    try {
      const professor = dadosMockados.professores.find(p => p.id === data.professorId);
      
      if (state.editingTreino?.id) {
        // Update existing treino
        setTreinos(prev => prev.map(t => 
          t.id === state.editingTreino?.id 
            ? {
                ...t,
                ...data,
                professor: professor?.nome,
                pranchetaData: data.pranchetaData
              } as Treino & { pranchetaData?: PranchetaData }
            : t
        ));
      } else {
        // Create new treino
        const newTreino: any = {
          id: Math.max(...dadosMockados.treinos.map(t => t.id)) + 1,
          ...data,
          professor: professor?.nome || '',
        };
        setTreinos(prev => [...prev, newTreino]);
      }

      setState(prev => ({
        ...prev,
        activeTab: 'lista',
        editingTreino: null,
        selectedTreino: null,
      }));
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar o treino'
      });
    }
  }, [state.editingTreino, dadosMockados.professores, setTreinos, addNotification]);

  // Handle cancel form
  const handleCancelForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTab: 'lista',
      editingTreino: null,
      selectedTreino: null,
    }));
  }, []);

  // Handle prancheta data change
  const handlePranchetaDataChange = useCallback((data: PranchetaData) => {
    setState(prev => ({
      ...prev,
      pranchetaData: data,
    }));
  }, []);

  // Handle tool change
  const handleToolChange = useCallback((tool: ToolType) => {
    setState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    setState(prev => ({ ...prev, selectedColor: color }));
  }, []);

  // Save prancheta to treino
  const handleSavePrancheta = useCallback(() => {
    if (!state.selectedTreino || !state.pranchetaData) return;

    setTreinos(prev => prev.map(t => 
      t.id === state.selectedTreino?.id 
        ? { ...t, pranchetaData: state.pranchetaData } as Treino & { pranchetaData?: PranchetaData }
        : t
    ));

    addNotification({
      type: 'success',
      title: 'Prancheta salva',
      message: 'Os dados da prancheta foram salvos no treino'
    });
  }, [state.selectedTreino, state.pranchetaData, setTreinos, addNotification]);

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'em-andamento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'concluido':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  // Get type color
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'tecnico':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'fisico':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'tatico':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'jogo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen size={24} />
            Treinamentos
          </h1>
          
          {state.activeTab === 'lista' && (
            <Button onClick={handleNewTreino}>
              <Plus size={16} />
              Novo Treino
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('lista')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              state.activeTab === 'lista'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <List size={16} className="inline mr-2" />
            Lista de Treinos
          </button>
          
          <button
            onClick={() => handleTabChange('form')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              state.activeTab === 'form'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Plus size={16} className="inline mr-2" />
            {state.editingTreino?.id ? 'Editar Treino' : 'Novo Treino'}
          </button>
          
          {state.selectedTreino && (
            <button
              onClick={() => handleTabChange('prancheta')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                state.activeTab === 'prancheta'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Palette size={16} className="inline mr-2" />
              Prancheta Tática
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      {state.activeTab === 'lista' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Search size={16} className="inline mr-1" />
                  Buscar
                </label>
                <input
                  type="text"
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  placeholder="Nome, objetivo ou professor..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Filter size={16} className="inline mr-1" />
                  Tipo
                </label>
                <select
                  value={state.filterType}
                  onChange={(e) => setState(prev => ({ ...prev, filterType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos os tipos</option>
                  <option value="tecnico">Técnico</option>
                  <option value="fisico">Físico</option>
                  <option value="tatico">Tático</option>
                  <option value="jogo">Jogo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Target size={16} className="inline mr-1" />
                  Nível
                </label>
                <select
                  value={state.filterNivel}
                  onChange={(e) => setState(prev => ({ ...prev, filterNivel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos os níveis</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    searchTerm: '', 
                    filterType: '', 
                    filterNivel: '' 
                  }))}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Treinos list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTreinos.map(treino => (
              <div
                key={treino.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {treino.nome}
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditTreino(treino)}
                      title="Editar"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewPrancheta(treino)}
                      title="Ver prancheta"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteTreino(treino.id)}
                      title="Excluir"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Layers size={14} />
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(treino.tipo)}`}>
                      {treino.tipo}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(treino.status)}`}>
                      {treino.status || 'planejado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    <span>{treino.duracao} min</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users size={14} />
                    <span>{treino.professor || 'Professor não definido'}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {treino.objetivo}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {treino.data ? new Date(treino.data).toLocaleDateString('pt-BR') : 'Sem data'}
                  </span>
                  
                  {(treino as any).pranchetaData && (
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
                      Com Prancheta
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTreinos.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhum treino encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {state.searchTerm || state.filterType || state.filterNivel
                  ? 'Tente ajustar os filtros ou'
                  : 'Comece criando seu primeiro treino'
                }
              </p>
              <Button onClick={handleNewTreino}>
                <Plus size={16} />
                Novo Treino
              </Button>
            </div>
          )}
        </div>
      )}

      {state.activeTab === 'form' && state.editingTreino && (
        <TreinoForm
          treino={state.editingTreino}
          onSave={handleSaveTreino}
          onCancel={handleCancelForm}
          {...(state.pranchetaData && { pranchetaData: state.pranchetaData })}
        />
      )}

      {state.activeTab === 'prancheta' && state.selectedTreino && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Prancheta Tática - {state.selectedTreino.nome}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleTabChange('lista')}
                >
                  Voltar
                </Button>
                <Button onClick={handleSavePrancheta}>
                  <Save size={16} />
                  Salvar Prancheta
                </Button>
              </div>
            </div>

            <CanvasToolbar
              selectedTool={state.selectedTool}
              selectedColor={state.selectedColor}
              onToolChange={handleToolChange}
              onColorChange={handleColorChange}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <Canvas
              {...(state.pranchetaData && { data: state.pranchetaData })}
              selectedTool={state.selectedTool}
              selectedColor={state.selectedColor}
              onDataChange={handlePranchetaDataChange}
            />
          </div>
        </div>
      )}
    </div>
  );
});

TreinosManager.displayName = 'TreinosManager';