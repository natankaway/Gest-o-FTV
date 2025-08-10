import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovaTransacaoModal } from '@/components/forms';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Download, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Filter,
  AlertTriangle
} from 'lucide-react';
import type { RegistroFinanceiro } from '@/types';

// Access Denied Component
const AccessDenied: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Acesso Negado
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Você não tem permissão para acessar o módulo financeiro. 
        Apenas administradores e gestores podem visualizar essas informações.
      </p>
    </div>
  </div>
);

// Summary Cards Component
interface SummaryCardsProps {
  receitas: number;
  despesas: number;
  saldo: number;
  pendentes: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ receitas, despesas, saldo, pendentes }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center">
        <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Receitas</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {receitas.toFixed(2)}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center">
        <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Despesas</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {despesas.toFixed(2)}</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center">
        <DollarSign className={`h-8 w-8 ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            R$ {saldo.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center">
        <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {pendentes.toFixed(2)}</p>
        </div>
      </div>
    </div>
  </div>
);

// Financial Record Table Component
interface FinancialTableProps {
  registros: RegistroFinanceiro[];
  onEdit: (registro: RegistroFinanceiro) => void;
}

const FinancialTable: React.FC<FinancialTableProps> = ({ registros, onEdit }) => {
  if (registros.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum registro encontrado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Nenhum lançamento corresponde aos filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Unidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {registros.map((registro) => (
            <tr key={registro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {new Date(registro.data).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {registro.descricao}
                {registro.aluno && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {registro.aluno}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {registro.categoria}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  registro.tipo === 'receita' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {registro.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {registro.unidade}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span className={registro.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {registro.tipo === 'receita' ? '+' : '-'} R$ {registro.valor.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit(registro)}
                >
                  Detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Per Unit Summary Component with Profit Distribution  
interface UnitSummaryProps {
  unidade: string;
  registros: RegistroFinanceiro[];
  onEdit: (registro: RegistroFinanceiro) => void;
}

const UnitSummary: React.FC<UnitSummaryProps> = ({ unidade, registros, onEdit }) => {
  const { dadosMockados } = useAppState();
  
  const stats = useMemo(() => {
    const receitas = registros.filter(r => r.tipo === 'receita').reduce((acc, r) => acc + r.valor, 0);
    const despesas = registros.filter(r => r.tipo === 'despesa').reduce((acc, r) => acc + r.valor, 0);
    const saldo = receitas - despesas;
    
    return { receitas, despesas, saldo };
  }, [registros]);

  // Get unit's society configuration
  const unidadeData = dadosMockados.unidades.find(u => u.nome === unidade);
  const socios = unidadeData?.socios?.filter(s => s.ativo) || [];

  // Calculate profit distribution (only positive profits)
  const profitDistribution = useMemo(() => {
    const lucro = Math.max(0, stats.saldo); // Lock negative profits at 0
    
    return socios.map(socio => ({
      ...socio,
      valorDistribuido: Math.round(lucro * (socio.percentual / 100) * 100) / 100 // Round to nearest cent
    }));
  }, [stats.saldo, socios]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{unidade}</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {registros.length} lançamentos
        </div>
      </div>
      
      {/* Unit Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            R$ {stats.receitas.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Despesas</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            R$ {stats.despesas.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
          <p className={`text-lg font-bold ${stats.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            R$ {stats.saldo.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Profit Distribution */}
      {socios.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Distribuição de Lucros
          </h4>
          <div className="space-y-2">
            {profitDistribution.map((distribucao) => (
              <div key={distribucao.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {distribucao.nome} ({distribucao.percentual}%)
                </span>
                <span className={`text-sm font-medium ${
                  distribucao.valorDistribuido > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  R$ {distribucao.valorDistribuido.toFixed(2)}
                </span>
              </div>
            ))}
            {stats.saldo < 0 && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                * Lucro negativo: distribuição travada em R$ 0,00
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Lançamentos Recentes</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {registros.slice(0, 5).map((registro) => (
            <div key={registro.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {registro.descricao}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(registro.data).toLocaleDateString('pt-BR')} • {registro.categoria}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${registro.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {registro.tipo === 'receita' ? '+' : '-'} R$ {registro.valor.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit(registro)}
                  className="text-xs px-2 py-1"
                >
                  Ver
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FinanceiroPage: React.FC = memo(() => {
  const { dadosMockados, userLogado } = useAppState();
  const { financeiro, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [unidadeFilter, setUnidadeFilter] = useState('todas');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroFinanceiro | null>(null);

  // Check access control
  if (!userLogado || (userLogado.perfil !== 'admin' && userLogado.perfil !== 'gestor')) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Módulo Financeiro
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Controle financeiro completo do centro de treinamento
            </p>
          </div>
        </div>
        <AccessDenied />
      </div>
    );
  }

  // Get user's allowed units
  const allowedUnits = useMemo(() => {
    if (userLogado.perfil === 'admin') {
      return unidades.map(u => u.nome);
    } else if (userLogado.perfil === 'gestor' && userLogado.unidades) {
      return userLogado.unidades;
    }
    return [];
  }, [userLogado, unidades]);

  // Filter financial records based on user access and filters
  const scopedFinanceiro = useMemo(() => {
    return financeiro.filter(registro => {
      // Unit access control
      if (!allowedUnits.includes(registro.unidade || '')) {
        return false;
      }
      
      return true;
    });
  }, [financeiro, allowedUnits]);

  // Apply filters to scoped data
  const filteredRegistros = useMemo(() => {
    return scopedFinanceiro.filter(registro => {
      const matchesSearch = registro.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (registro.aluno && registro.aluno.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (registro.categoria && registro.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTipo = tipoFilter === 'todos' || registro.tipo === tipoFilter;
      const matchesStatus = statusFilter === 'todos' || registro.status === statusFilter;
      const matchesCategoria = categoriaFilter === 'todos' || registro.categoria === categoriaFilter;
      const matchesUnidade = unidadeFilter === 'todas' || registro.unidade === unidadeFilter;
      
      const dataRegistro = new Date(registro.data);
      const matchesDataInicial = !dataInicial || dataRegistro >= new Date(dataInicial);
      const matchesDataFinal = !dataFinal || dataRegistro <= new Date(dataFinal);
      
      return matchesSearch && matchesTipo && matchesStatus && matchesCategoria && 
             matchesUnidade && matchesDataInicial && matchesDataFinal;
    });
  }, [scopedFinanceiro, searchTerm, tipoFilter, statusFilter, categoriaFilter, unidadeFilter, dataInicial, dataFinal]);

  // Summary statistics for filtered data
  const stats = useMemo(() => {
    const receitas = filteredRegistros.filter(r => r.tipo === 'receita').reduce((acc, r) => acc + r.valor, 0);
    const despesas = filteredRegistros.filter(r => r.tipo === 'despesa').reduce((acc, r) => acc + r.valor, 0);
    const saldo = receitas - despesas;
    const pendentes = filteredRegistros.filter(r => r.status === 'pendente' && r.tipo === 'receita').reduce((acc, r) => acc + r.valor, 0);
    
    return { receitas, despesas, saldo, pendentes };
  }, [filteredRegistros]);

  // Get unique categories for filter
  const categorias = useMemo(() => {
    return [...new Set(scopedFinanceiro.map(r => r.categoria))].filter(Boolean);
  }, [scopedFinanceiro]);

  // Group by unit for per-unit view
  const registrosPorUnidade = useMemo(() => {
    const grupos: Record<string, RegistroFinanceiro[]> = {};
    filteredRegistros.forEach(registro => {
      const unidade = registro.unidade || 'Sem Unidade';
      if (!grupos[unidade]) {
        grupos[unidade] = [];
      }
      grupos[unidade].push(registro);
    });
    return grupos;
  }, [filteredRegistros]);

  const handleEdit = useCallback((registro: RegistroFinanceiro) => {
    setEditingRegistro(registro);
    setShowModal(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingRegistro(null);
    setShowModal(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setTipoFilter('todos');
    setStatusFilter('todos');
    setCategoriaFilter('todos');
    setUnidadeFilter('todas');
    setDataInicial('');
    setDataFinal('');
  }, []);

  const exportToCSV = useCallback(() => {
    try {
      if (filteredRegistros.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há registros financeiros para exportar'
        });
        return;
      }

      const csvData = filteredRegistros.map(registro => ({
        Data: registro.data,
        Descricao: registro.descricao,
        Categoria: registro.categoria,
        Tipo: registro.tipo,
        Unidade: registro.unidade || '',
        Cliente: registro.aluno || '',
        Valor: registro.valor,
        Status: registro.status,
        Metodo: registro.metodo
      }));

      const headers = Object.keys(csvData[0]!).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Dados financeiros exportados com sucesso!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredRegistros, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Módulo Financeiro
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {userLogado.perfil === 'admin' 
              ? 'Controle financeiro completo de todas as unidades'
              : `Controle financeiro das suas unidades: ${allowedUnits.join(', ')}`
            }
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
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        receitas={stats.receitas}
        despesas={stats.despesas}
        saldo={stats.saldo}
        pendentes={stats.pendentes}
      />

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={clearFilters}
          >
            Limpar Filtros
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="xl:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição, cliente ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Unit Filter (for admin and gestors with multiple units) */}
          {(userLogado.perfil === 'admin' || allowedUnits.length > 1) && (
            <div>
              <select
                value={unidadeFilter}
                onChange={(e) => setUnidadeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todas">Todas as unidades</option>
                {allowedUnits.map(unidade => (
                  <option key={unidade} value={unidade}>{unidade}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div>
            <input
              type="date"
              placeholder="Data inicial"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <input
              type="date"
              placeholder="Data final"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todas as categorias</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredRegistros.length} de {scopedFinanceiro.length} registros financeiros
        </p>
      </div>

      {/* Visão Geral Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Visão Geral - Lançamentos Consolidados
          </h2>
        </div>
        <div className="p-6">
          <FinancialTable registros={filteredRegistros} onEdit={handleEdit} />
        </div>
      </div>

      {/* Por Unidade Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Por Unidade
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Object.keys(registrosPorUnidade).length} unidade(s) com atividade
          </span>
        </div>
        
        {Object.keys(registrosPorUnidade).length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma unidade encontrada</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nenhuma unidade possui registros que correspondam aos filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(registrosPorUnidade).map(([unidade, registros]) => (
              <UnitSummary
                key={unidade}
                unidade={unidade}
                registros={registros}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nova Transação Modal */}
      <NovaTransacaoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingTransacao={editingRegistro}
      />
    </div>
  );
});