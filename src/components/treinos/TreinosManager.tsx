import React, { useState, useCallback, memo, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { Canvas } from './Canvas';
import { CanvasToolbar } from './CanvasToolbar';
import { TreinoForm } from './TreinoForm';
import { TextEditor } from './TextEditor';
import { ZoomPanControls, useZoomPan } from './ZoomPan';
import { 
  Plus, 
  Edit, 
  Trash, 
  Clock,
  Target,
  Users,
  BookOpen,
  Search,
  Filter,
  Save,
  ArrowLeft,
  Maximize2
} from 'lucide-react';
import type { Treino, TreinoFormData } from '@/types';
import type { PranchetaData, ToolType, TextEditorState, TextItem } from '@/types/canvas';

type ViewMode = 'list' | 'edit';

interface TreinosManagerState {
  viewMode: ViewMode;
  selectedTreino: (Treino & { pranchetaData?: PranchetaData }) | null;
  editingTreino: (TreinoFormData & { id?: number; pranchetaData?: PranchetaData }) | null;
  pranchetaData: PranchetaData | null;
  selectedTool: ToolType;
  selectedColor: string;
  searchTerm: string;
  filterType: string;
  filterNivel: string;
  isFullscreenCanvas: boolean;
  textEditor: {
    isOpen: boolean;
    initialState?: Partial<TextEditorState>;
  };
}

export const TreinosManager: React.FC = memo(() => {
  const { dadosMockados, setTreinos, userLogado, unidadeSelecionada } = useAppState();
  const { addNotification } = useNotifications();

  const [state, setState] = useState<TreinosManagerState>({
    viewMode: 'list',
    selectedTreino: null,
    editingTreino: null,
    pranchetaData: null,
    selectedTool: 'select',
    selectedColor: '#EF4444',
    searchTerm: '',
    filterType: '',
    filterNivel: '',
    isFullscreenCanvas: false,
    textEditor: {
      isOpen: false,
    },
  });

  // Zoom/pan functionality
  const {
    zoom,
    handleZoomChange,
    handlePanReset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    getTransformStyle,
  } = useZoomPan();

  // Filter and search treinos (same as before)
  const filteredTreinos = useMemo(() => {
    let filtered = dadosMockados.treinos;

    if (userLogado?.perfil !== 'admin') {
      filtered = filtered.filter(treino => 
        treino.professorId === userLogado?.id || 
        treino.unidade === unidadeSelecionada
      );
    }

    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(treino =>
        treino.nome.toLowerCase().includes(term) ||
        treino.objetivo.toLowerCase().includes(term) ||
        treino.professor?.toLowerCase().includes(term)
      );
    }

    if (state.filterType) {
      filtered = filtered.filter(treino => treino.tipo === state.filterType);
    }

    if (state.filterNivel) {
      filtered = filtered.filter(treino => treino.nivel === state.filterNivel);
    }

    return filtered.sort((a, b) => new Date(b.data || '').getTime() - new Date(a.data || '').getTime());
  }, [dadosMockados.treinos, userLogado, unidadeSelecionada, state.searchTerm, state.filterType, state.filterNivel]);

  // Handle new training
  const handleNewTreino = useCallback(() => {
    setState(prev => ({
      ...prev,
      viewMode: 'edit',
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
      pranchetaData: null,
    }));
  }, []);

  // Handle edit training
  const handleEditTreino = useCallback((treino: Treino) => {
    const treinoComPrancheta = treino as Treino & { pranchetaData?: PranchetaData };
    setState(prev => ({
      ...prev,
      viewMode: 'edit',
      editingTreino: { ...treino },
      selectedTreino: treinoComPrancheta,
      pranchetaData: treinoComPrancheta.pranchetaData || null,
    }));
  }, []);

  // Handle delete training
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

  // Handle save training
  const handleSaveTreino = useCallback((data: TreinoFormData & { pranchetaData?: PranchetaData }) => {
    try {
      const professor = dadosMockados.professores.find(p => p.id === data.professorId);
      
      const treinoData = {
        ...data,
        professor: professor?.nome,
        pranchetaData: state.pranchetaData || data.pranchetaData
      };

      if (state.editingTreino?.id) {
        // Update existing training
        setTreinos(prev => prev.map(t => 
          t.id === state.editingTreino?.id 
            ? { ...t, ...treinoData } as Treino & { pranchetaData?: PranchetaData }
            : t
        ));
      } else {
        // Create new training
        const newTreino: any = {
          id: Math.max(...dadosMockados.treinos.map(t => t.id)) + 1,
          ...treinoData,
        };
        setTreinos(prev => [...prev, newTreino]);
      }

      addNotification({
        type: 'success',
        title: 'Treino salvo',
        message: 'O treino foi salvo com sucesso'
      });

      setState(prev => ({
        ...prev,
        viewMode: 'list',
        editingTreino: null,
        selectedTreino: null,
        pranchetaData: null,
      }));
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar o treino'
      });
    }
  }, [state.editingTreino, state.pranchetaData, dadosMockados.professores, setTreinos, addNotification]);

  // Handle cancel editing
  const handleBackToList = useCallback(() => {
    setState(prev => ({
      ...prev,
      viewMode: 'list',
      editingTreino: null,
      selectedTreino: null,
      pranchetaData: null,
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
    setState(prev => ({ 
      ...prev, 
      selectedTool: tool,
      // Clear text editor when switching tools
      textEditor: {
        isOpen: false,
        initialState: {}
      }
    }));

    // Do NOT auto-open text editor when text tool is selected
    // Text editor will open when user clicks on canvas with text tool active
  }, []);

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    setState(prev => ({ ...prev, selectedColor: color }));
  }, []);

  // Handle text editor
  const handleTextEditorSave = useCallback((textState: TextEditorState) => {
    // Create a new text item and add it to the canvas
    if (textState.position) {
      const newTextItem: TextItem = {
        id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        position: textState.position,
        color: textState.color,
        text: textState.text,
        fontSize: textState.fontSize,
        fontFamily: textState.fontFamily,
        selected: false,
      };

      setState(prev => ({
        ...prev,
        pranchetaData: prev.pranchetaData ? {
          ...prev.pranchetaData,
          items: [...prev.pranchetaData.items, newTextItem],
          updatedAt: new Date().toISOString(),
        } : {
          id: `prancheta_${Date.now()}`,
          items: [newTextItem],
          fieldDimensions: { width: 500, height: 1000 },
          backgroundColor: '#F4A460',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        textEditor: { isOpen: false }
      }));
    } else {
      setState(prev => ({
        ...prev,
        textEditor: { isOpen: false }
      }));
    }
  }, []);

  const handleTextEditorCancel = useCallback(() => {
    setState(prev => ({
      ...prev,
      textEditor: { isOpen: false }
    }));
  }, []);

  // Handle canvas click for text tool
  const handleCanvasClickForText = useCallback((position: { x: number; y: number }) => {
    if (state.selectedTool === 'text') {
      setState(prev => ({
        ...prev,
        textEditor: {
          isOpen: true,
          initialState: {
            // Initialize with position data for later use in canvas
            position: position
          }
        }
      }));
    }
  }, [state.selectedTool]);

  // Handle fullscreen canvas
  const handleToggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreenCanvas: !prev.isFullscreenCanvas }));
  }, []);

  // Handle fit to screen
  const handleFitToScreen = useCallback(() => {
    handleZoomChange(1);
    handlePanReset();
  }, [handleZoomChange, handlePanReset]);

  // Handle clear drawing
  const handleClearDrawing = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar o desenho?')) {
      setState(prev => ({
        ...prev,
        pranchetaData: prev.pranchetaData ? {
          ...prev.pranchetaData,
          items: []
        } : null
      }));
    }
  }, []);

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

  // LIST VIEW
  if (state.viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen size={24} />
              Treinamentos
            </h1>
            
            <Button onClick={handleNewTreino}>
              <Plus size={16} />
              Novo Treino
            </Button>
          </div>

          {/* Filters */}
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

        {/* Training Cards */}
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
    );
  }

  // EDIT VIEW - Proper Responsive Layout
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleBackToList}>
              <ArrowLeft size={16} />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {state.editingTreino?.id ? `Editar: ${state.editingTreino.nome}` : 'Novo Treino'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <ZoomPanControls
              zoom={zoom}
              onZoomChange={handleZoomChange}
              onPanReset={handlePanReset}
              onFitToScreen={handleFitToScreen}
            />
            
            <Button variant="secondary" onClick={handleToggleFullscreen}>
              <Maximize2 size={16} />
              {state.isFullscreenCanvas ? 'Minimizar' : 'Tela Cheia'}
            </Button>
            
            <Button onClick={() => state.editingTreino && handleSaveTreino(state.editingTreino)}>
              <Save size={16} />
              Salvar Treino
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Form (Desktop: Fixed sidebar, Mobile: Stacked above) */}
        {!state.isFullscreenCanvas && state.editingTreino && (
          <div className="w-full lg:w-[400px] lg:flex-shrink-0 bg-white dark:bg-gray-800 border-b lg:border-r lg:border-b-0 border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <TreinoForm
                treino={state.editingTreino}
                onSave={handleSaveTreino}
                onCancel={handleBackToList}
                pranchetaData={state.pranchetaData || undefined}
                isEmbedded={true}
              />
            </div>
          </div>
        )}

        {/* Right Side - Tactical Board (Desktop: Expandable, Mobile: Full width) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
          {/* Toolbar */}
          <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <CanvasToolbar
              selectedTool={state.selectedTool}
              selectedColor={state.selectedColor}
              onToolChange={handleToolChange}
              onColorChange={handleColorChange}
              onClearDrawing={handleClearDrawing}
              isMobile={window.innerWidth < 768}
            />
          </div>

          {/* Canvas Container with Scroll */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div 
                className="relative overflow-hidden rounded-lg"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                style={{ 
                  minHeight: state.isFullscreenCanvas ? '100vh' : '120vh', // Force vertical scroll
                  cursor: state.selectedTool === 'select' ? 'default' : 'crosshair'
                }}
              >
                <div style={getTransformStyle()}>
                  <Canvas
                    data={state.pranchetaData || undefined}
                    selectedTool={state.selectedTool}
                    selectedColor={state.selectedColor}
                    onDataChange={handlePranchetaDataChange}
                    onCanvasClickForText={handleCanvasClickForText}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Editor Modal */}
      <TextEditor
        isOpen={state.textEditor.isOpen}
        initialState={state.textEditor.initialState || {}}
        onSave={handleTextEditorSave}
        onCancel={handleTextEditorCancel}
      />
    </div>
  );
});

TreinosManager.displayName = 'TreinosManager';