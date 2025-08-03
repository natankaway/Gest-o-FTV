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
  User,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import type { RegistroFinanceiro } from '@/types';

interface FinanceiroCardProps {
  registro: RegistroFinanceiro;
  onEdit: (registro: RegistroFinanceiro) => void;
}

const FinanceiroCard: React.FC<FinanceiroCardProps> = ({ registro, onEdit }) => {
  const getTipoInfo = () => {
    if (registro.tipo === 'receita') {
      return {
        icon: <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />,
        text: 'Receita',
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      };
    } else {
      return {
        icon: <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />,
        text: 'Despesa',
        color: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      };
    }
  };

  const getStatusInfo = () => {
    if (registro.status === 'pago') {
      return {
        text: 'Pago',
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      };
    } else if (registro.status === 'pendente') {
      return {
        text: 'Pendente',
        color: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      };
    } else {
      return {
        text: 'Vencido',
        color: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      };
    }
  };

  const tipoInfo = getTipoInfo();
  const statusInfo = getStatusInfo();
  const dataFormatada = new Date(registro.data).toLocaleDateString('pt-BR');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            {tipoInfo.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {registro.descricao}
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {dataFormatada}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${tipoInfo.badge}`}>
          {tipoInfo.text}
        </span>
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-1">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Valor</span>
        </div>
        <div className={`text-2xl font-bold ${tipoInfo.color}`}>
          {registro.tipo === 'receita' ? '+' : '-'} R$ {registro.valor.toFixed(2)}
        </div>
      </div>

      {/* Student Info (if applicable) */}
      {registro.aluno && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Cliente</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {registro.aluno}
          </div>
        </div>
      )}

      {/* Payment Method & Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Método</span>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.badge}`}>
            {statusInfo.text}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
          {registro.metodo.replace('-', ' ')}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(registro)}
          className="flex-1"
        >
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export const FinanceiroPage: React.FC = memo(() => {
  const { dadosMockados } = useAppState();
  const { financeiro } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [metodoFilter, setMetodoFilter] = useState('todos');
  const [dataFilter, setDataFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroFinanceiro | null>(null);

  // Dados filtrados
  const filteredRegistros = useMemo(() => {
    return financeiro.filter(registro => {
      const matchesSearch = registro.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (registro.aluno && registro.aluno.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTipo = tipoFilter === 'todos' || registro.tipo === tipoFilter;
      const matchesStatus = statusFilter === 'todos' || registro.status === statusFilter;
      const matchesMetodo = metodoFilter === 'todos' || registro.metodo === metodoFilter;
      const matchesData = !dataFilter || registro.data === dataFilter;
      
      return matchesSearch && matchesTipo && matchesStatus && matchesMetodo && matchesData;
    });
  }, [financeiro, searchTerm, tipoFilter, statusFilter, metodoFilter, dataFilter]);

  // Opções para filtros
  const metodosDisponiveis = useMemo(() => {
    return [...new Set(financeiro.map(r => r.metodo))].filter(Boolean);
  }, [financeiro]);

  // Estatísticas
  const stats = useMemo(() => {
    const receitas = financeiro.filter(r => r.tipo === 'receita');
    const despesas = financeiro.filter(r => r.tipo === 'despesa');
    
    const totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0);
    const totalDespesas = despesas.reduce((acc, r) => acc + r.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    
    const receitasPendentes = receitas.filter(r => r.status === 'pendente').reduce((acc, r) => acc + r.valor, 0);
    
    return {
      totalReceitas: totalReceitas.toFixed(2),
      totalDespesas: totalDespesas.toFixed(2),
      saldo: saldo.toFixed(2),
      receitasPendentes: receitasPendentes.toFixed(2),
      saldoPositivo: saldo >= 0
    };
  }, [financeiro]);

  const handleEdit = useCallback((registro: RegistroFinanceiro) => {
    setEditingRegistro(registro);
    setShowModal(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingRegistro(null);
    setShowModal(true);
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
        Tipo: registro.tipo,
        Valor: registro.valor,
        Descricao: registro.descricao,
        Cliente: registro.aluno || '',
        Metodo: registro.metodo,
        Status: registro.status
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
            Controle financeiro completo do centro de treinamento
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Receitas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.totalReceitas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Despesas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.totalDespesas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <DollarSign className={`h-8 w-8 ${stats.saldoPositivo ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
              <p className={`text-2xl font-bold ${stats.saldoPositivo ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                R$ {stats.saldo}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.receitasPendentes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dataFilter}
              onChange={(e) => setDataFilter(e.target.value)}
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os status</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select
              value={metodoFilter}
              onChange={(e) => setMetodoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os métodos</option>
              {metodosDisponiveis.map(metodo => (
                <option key={metodo} value={metodo}>{metodo.replace('-', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredRegistros.length} de {financeiro.length} registros financeiros
        </p>
        {(searchTerm || dataFilter) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setDataFilter('');
            }}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Financial Records Grid */}
      {filteredRegistros.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum registro encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || dataFilter ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando uma nova transação.'}
          </p>
          {!searchTerm && !dataFilter && (
            <div className="mt-6">
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Adicionar Primeira Transação
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistros.map((registro) => (
            <FinanceiroCard
              key={registro.id}
              registro={registro}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Nova Transação Modal */}
      <NovaTransacaoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingTransacao={editingRegistro}
      />
    </div>
  );
});