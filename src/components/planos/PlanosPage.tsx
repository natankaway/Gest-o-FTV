import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Download, 
  Edit,
  Trash,
  Building,
  DollarSign,
  Target,
  TrendingUp
} from 'lucide-react';
import type { Plano } from '@/types';

interface PlanoCardProps {
  plano: Plano;
  onEdit: (plano: Plano) => void;
  onDelete: (id: number) => void;
}

const PlanoCard: React.FC<PlanoCardProps> = ({ plano, onEdit, onDelete }) => {
  const getPlanoTier = () => {
    if (plano.nome.includes('Básico')) {
      return { 
        tier: 'Básico', 
        color: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      };
    } else if (plano.nome.includes('Intermediário')) {
      return { 
        tier: 'Intermediário', 
        color: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      };
    } else {
      return { 
        tier: 'Avançado', 
        color: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      };
    }
  };

  const tierInfo = getPlanoTier();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {plano.nome}
            </h3>
            <div className="flex items-center space-x-2">
              <Building className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {plano.unidade}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${tierInfo.badge}`}>
          {tierInfo.tier}
        </span>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Valor</span>
        </div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          R$ {plano.preco.toFixed(2)}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
            /mês
          </span>
        </div>
      </div>

      {/* Benefits (derived from plan type) */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Benefícios</span>
        </div>
        <div className="space-y-1">
          {plano.nome.includes('Básico') && (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-300">• 2 treinos por semana</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Acesso aos equipamentos</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Suporte básico</div>
            </>
          )}
          {plano.nome.includes('Intermediário') && (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-300">• 3 treinos por semana</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Acesso aos equipamentos</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Acompanhamento nutricional</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Suporte prioritário</div>
            </>
          )}
          {plano.nome.includes('Avançado') && (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Treinos ilimitados</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Acesso total aos equipamentos</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Personal trainer incluso</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Acompanhamento nutricional</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">• Suporte 24/7</div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(plano)}
          leftIcon={<Edit className="h-4 w-4" />}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(plano.id)}
          leftIcon={<Trash className="h-4 w-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export const PlanosPage: React.FC = memo(() => {
  const { dadosMockados, setPlanos } = useAppState();
  const { planos } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [unidadeFilter, setUnidadeFilter] = useState('todas');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [precoFilter, setPrecoFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);

  // Dados filtrados
  const filteredPlanos = useMemo(() => {
    return planos.filter(plano => {
      const matchesSearch = plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plano.unidade.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUnidade = unidadeFilter === 'todas' || plano.unidade === unidadeFilter;
      
      const matchesTipo = tipoFilter === 'todos' || 
                         (tipoFilter === 'basico' && plano.nome.includes('Básico')) ||
                         (tipoFilter === 'intermediario' && plano.nome.includes('Intermediário')) ||
                         (tipoFilter === 'avancado' && plano.nome.includes('Avançado'));
      
      const matchesPreco = precoFilter === 'todos' ||
                          (precoFilter === 'baixo' && plano.preco <= 120) ||
                          (precoFilter === 'medio' && plano.preco > 120 && plano.preco <= 180) ||
                          (precoFilter === 'alto' && plano.preco > 180);
      
      return matchesSearch && matchesUnidade && matchesTipo && matchesPreco;
    });
  }, [planos, searchTerm, unidadeFilter, tipoFilter, precoFilter]);

  // Opções para filtros
  const unidadesDisponiveis = useMemo(() => {
    return [...new Set(planos.map(p => p.unidade))].filter(Boolean);
  }, [planos]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalPlanos = planos.length;
    const precoMedio = planos.reduce((acc, p) => acc + p.preco, 0) / planos.length;
    const planoMaisCaro = Math.max(...planos.map(p => p.preco));
    const planoMaisBarato = Math.min(...planos.map(p => p.preco));
    
    return {
      total: totalPlanos,
      precoMedio: precoMedio.toFixed(2),
      maisCaro: planoMaisCaro.toFixed(2),
      maisBarato: planoMaisBarato.toFixed(2)
    };
  }, [planos]);

  const handleEdit = useCallback((plano: Plano) => {
    setEditingPlano(plano);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      setPlanos(prev => prev.filter(p => p.id !== id));
      addNotification({
        type: 'success',
        title: 'Plano excluído',
        message: 'Plano removido com sucesso'
      });
    }
  }, [setPlanos, addNotification]);

  const handleAddNew = useCallback(() => {
    setEditingPlano(null);
    setShowModal(true);
  }, []);

  const exportToCSV = useCallback(() => {
    try {
      if (filteredPlanos.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há planos para exportar'
        });
        return;
      }

      const csvData = filteredPlanos.map(plano => ({
        Nome: plano.nome,
        Preco: plano.preco,
        Unidade: plano.unidade,
        Tipo: plano.nome.includes('Básico') ? 'Básico' : 
              plano.nome.includes('Intermediário') ? 'Intermediário' : 'Avançado'
      }));

      const headers = Object.keys(csvData[0]!).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `planos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Dados dos planos exportados com sucesso!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredPlanos, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Planos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie os planos de assinatura do centro de treinamento
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="secondary"
            onClick={exportToCSV}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exportar CSV
          </Button>
          <Button
            onClick={handleAddNew}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Planos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Preço Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.precoMedio}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mais Caro</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.maisCaro}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mais Barato</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.maisBarato}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou unidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Unit Filter */}
          <div>
            <select
              value={unidadeFilter}
              onChange={(e) => setUnidadeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas as unidades</option>
              {unidadesDisponiveis.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os tipos</option>
              <option value="basico">Básico</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <select
              value={precoFilter}
              onChange={(e) => setPrecoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todas as faixas</option>
              <option value="baixo">Até R$ 120</option>
              <option value="medio">R$ 121 - R$ 180</option>
              <option value="alto">Acima de R$ 180</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredPlanos.length} de {planos.length} planos
        </p>
        {searchTerm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearchTerm('')}
          >
            Limpar busca
          </Button>
        )}
      </div>

      {/* Plans Grid */}
      {filteredPlanos.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum plano encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando um novo plano.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Adicionar Primeiro Plano
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlanos.map((plano) => (
            <PlanoCard
              key={plano.id}
              plano={plano}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal for creating/editing plans */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingPlano ? 'Editar Plano' : 'Novo Plano'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Funcionalidade de {editingPlano ? 'edição' : 'criação'} será implementada na próxima fase.
            </p>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});