import React, { memo } from 'react';
import { TreinosManager } from './TreinosManager';

export const TreinosPage: React.FC = memo(() => {
  return <TreinosManager />;
});

TreinosPage.displayName = 'TreinosPage';

interface ExercicioCardProps {
  exercicio: Exercicio;
  onSelect?: (exercicio: Exercicio) => void;
  selected?: boolean;
}

const ExercicioCard: React.FC<ExercicioCardProps> = ({ exercicio, onSelect, selected }) => {
  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'aquecimento':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'tecnica':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'tatica':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'fisico':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'finalizacao':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer ${
        selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
      }`}
      onClick={() => onSelect?.(exercicio)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {exercicio.nome}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {exercicio.descricao}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoriaColor(exercicio.categoria)}`}>
          {exercicio.categoria}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{exercicio.duracao}min</span>
          </div>
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-1" />
            <span>{exercicio.nivel}</span>
          </div>
        </div>
        {exercicio.equipamentos.length > 0 && (
          <div className="text-xs">
            {exercicio.equipamentos.slice(0, 2).join(', ')}
            {exercicio.equipamentos.length > 2 && '...'}
          </div>
        )}
      </div>
    </div>
  );
};

interface TreinoCardProps {
  treino: Treino;
  onEdit: (treino: Treino) => void;
  onDelete: (id: number) => void;
}

const TreinoCard: React.FC<TreinoCardProps> = ({ treino, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'em-andamento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'planejado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {treino.nome}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {treino.professor} • {treino.data ? new Date(treino.data).toLocaleDateString('pt-BR') : 'Data não definida'}
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(treino.status || 'planejado')}`}>
          {treino.status || 'planejado'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {treino.duracao} minutos
          </span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {treino.nivel}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Exercícios ({treino.exercicios.length}):
        </p>
        <div className="space-y-1">
          {treino.exercicios.slice(0, 3).map((ex, index) => (
            <div key={ex.id} className="text-sm text-gray-600 dark:text-gray-300">
              {index + 1}. {ex.nome} ({ex.duracao}min)
            </div>
          ))}
          {treino.exercicios.length > 3 && (
            <div className="text-sm text-gray-500">
              +{treino.exercicios.length - 3} mais exercícios...
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(treino)}
          leftIcon={<Edit className="h-3 w-3" />}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(treino.id)}
          leftIcon={<Trash className="h-3 w-3" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export const TreinosPage: React.FC = memo(() => {
  const { dadosMockados, setTreinos } = useAppState();
  const { treinos, exercicios } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'biblioteca' | 'treinos' | 'prancheta'>('biblioteca');
  const [selectedExercicios, setSelectedExercicios] = useState<Exercicio[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingTreino, setEditingTreino] = useState<Treino | null>(null);

  const handleSelectExercicio = useCallback((exercicio: Exercicio) => {
    setSelectedExercicios(prev => {
      const isSelected = prev.some(ex => ex.id === exercicio.id);
      if (isSelected) {
        return prev.filter(ex => ex.id !== exercicio.id);
      } else {
        return [...prev, exercicio];
      }
    });
  }, []);

  const handleEditTreino = useCallback((treino: Treino) => {
    setEditingTreino(treino);
    setShowModal(true);
  }, []);

  const handleDeleteTreino = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      setTreinos(prev => prev.filter(t => t.id !== id));
      addNotification({
        type: 'success',
        title: 'Treino excluído',
        message: 'Treino removido com sucesso'
      });
    }
  }, [addNotification]);

  const exerciciosFiltrados = exercicios.filter(ex => 
    filtroCategoria === 'todas' || ex.categoria === filtroCategoria
  );

  const renderBiblioteca = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Biblioteca de Exercícios
        </h2>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="todas">Todas as categorias</option>
            <option value="aquecimento">Aquecimento</option>
            <option value="tecnica">Técnica</option>
            <option value="tatica">Tática</option>
            <option value="fisico">Físico</option>
            <option value="finalizacao">Finalização</option>
          </select>
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Novo Exercício
          </Button>
        </div>
      </div>

      {selectedExercicios.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-200">
                {selectedExercicios.length} exercício(s) selecionado(s)
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Duração total: {selectedExercicios.reduce((acc, ex) => acc + ex.duracao, 0)} minutos
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setSelectedExercicios([])}
              >
                Limpar
              </Button>
              <Button size="sm" onClick={() => setShowModal(true)}>
                Criar Treino
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exerciciosFiltrados.map(exercicio => (
          <ExercicioCard
            key={exercicio.id}
            exercicio={exercicio}
            onSelect={handleSelectExercicio}
            selected={selectedExercicios.some(ex => ex.id === exercicio.id)}
          />
        ))}
      </div>
    </div>
  );

  const renderTreinos = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Treinos Planejados
        </h2>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>
          Novo Treino
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{treinos.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Play className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {treinos.filter(t => t.status === 'concluido').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <PauseCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Planejados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {treinos.filter(t => t.status === 'planejado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treinos.map(treino => (
          <TreinoCard
            key={treino.id}
            treino={treino}
            onEdit={handleEditTreino}
            onDelete={handleDeleteTreino}
          />
        ))}
      </div>
    </div>
  );

  const renderPrancheta = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Prancheta Tática
        </h2>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Nova Jogada
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Prancheta Tática Interativa
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Desenhe jogadas, posicionamentos e estratégias táticas
          </p>
          <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-8 mx-auto max-w-2xl">
            <div className="text-center text-green-700 dark:text-green-300">
              <Target className="mx-auto h-8 w-8 mb-2" />
              <p>Canvas para desenho tático será implementado aqui</p>
              <p className="text-sm mt-1">Funcionalidades: arrastar jogadores, desenhar linhas, salvar jogadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Treinos e Prancheta Tática
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie exercícios, crie treinos e planeje estratégias táticas
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { key: 'biblioteca', label: 'Biblioteca de Exercícios', icon: BookOpen },
            { key: 'treinos', label: 'Treinos', icon: Target },
            { key: 'prancheta', label: 'Prancheta Tática', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'biblioteca' && renderBiblioteca()}
        {activeTab === 'treinos' && renderTreinos()}
        {activeTab === 'prancheta' && renderPrancheta()}
      </div>

      {/* Novo Treino Modal */}
      <NovoTreinoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingTreino={editingTreino}
      />
    </div>
  );
});