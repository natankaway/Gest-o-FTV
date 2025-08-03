import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovaPresencaModal } from '@/components/forms';
import { 
  Calendar, 
  Plus, 
  Search, 
  Download, 
  User,
  Building,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import type { Presenca } from '@/types';

interface PresencaCardProps {
  presenca: Presenca;
  onEdit: (presenca: Presenca) => void;
}

const PresencaCard: React.FC<PresencaCardProps> = ({ presenca, onEdit }) => {
  const getStatusInfo = () => {
    if (presenca.status === 'presente') {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
        text: 'Presente',
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      };
    } else {
      return {
        icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
        text: 'Falta',
        color: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      };
    }
  };

  const getTipoInfo = () => {
    const tipos = {
      'treino': { text: 'Treino', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
      'aula': { text: 'Aula', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
      'individual': { text: 'Individual', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' }
    };
    return tipos[presenca.tipo] || tipos['aula'];
  };

  const statusInfo = getStatusInfo();
  const tipoInfo = getTipoInfo();
  const dataFormatada = new Date(presenca.data).toLocaleDateString('pt-BR');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            {statusInfo.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {presenca.aluno}
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {dataFormatada} às {presenca.hora}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.badge}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Professor Info */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Professor</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {presenca.professor}
        </div>
      </div>

      {/* Location and Type */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Building className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Local e Tipo</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">{presenca.unidade}</span>
          <span className={`inline-block text-xs px-2 py-1 rounded-full ${tipoInfo.color}`}>
            {tipoInfo.text}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(presenca)}
          className="flex-1"
        >
          Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

export const PresencasPage: React.FC = memo(() => {
  const { dadosMockados } = useAppState();
  const { presencas } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [unidadeFilter, setUnidadeFilter] = useState('todas');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [dataFilter, setDataFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPresenca, setEditingPresenca] = useState<Presenca | null>(null);

  // Dados filtrados
  const filteredPresencas = useMemo(() => {
    return presencas.filter(presenca => {
      const matchesSearch = presenca.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           presenca.professor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || presenca.status === statusFilter;
      const matchesUnidade = unidadeFilter === 'todas' || presenca.unidade === unidadeFilter;
      const matchesTipo = tipoFilter === 'todos' || presenca.tipo === tipoFilter;
      const matchesData = !dataFilter || presenca.data === dataFilter;
      
      return matchesSearch && matchesStatus && matchesUnidade && matchesTipo && matchesData;
    });
  }, [presencas, searchTerm, statusFilter, unidadeFilter, tipoFilter, dataFilter]);

  // Opções para filtros
  const unidadesDisponiveis = useMemo(() => {
    return [...new Set(presencas.map(p => p.unidade))].filter(Boolean);
  }, [presencas]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalPresencas = presencas.length;
    const presentes = presencas.filter(p => p.status === 'presente').length;
    const faltas = presencas.filter(p => p.status === 'falta').length;
    const hoje = new Date().toISOString().split('T')[0];
    const presencasHoje = presencas.filter(p => p.data === hoje).length;
    
    return {
      total: totalPresencas,
      presentes,
      faltas,
      hoje: presencasHoje,
      percentualPresenca: totalPresencas > 0 ? ((presentes / totalPresencas) * 100).toFixed(1) : '0'
    };
  }, [presencas]);

  const handleEdit = useCallback((presenca: Presenca) => {
    setEditingPresenca(presenca);
    setShowModal(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingPresenca(null);
    setShowModal(true);
  }, []);

  const exportToCSV = useCallback(() => {
    try {
      if (filteredPresencas.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há presenças para exportar'
        });
        return;
      }

      const csvData = filteredPresencas.map(presenca => ({
        Data: presenca.data,
        Hora: presenca.hora,
        Aluno: presenca.aluno,
        Professor: presenca.professor,
        Unidade: presenca.unidade,
        Tipo: presenca.tipo,
        Status: presenca.status
      }));

      const headers = Object.keys(csvData[0]!).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `presencas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Dados das presenças exportados com sucesso!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredPresencas, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Sistema de Presenças
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Controle de presenças e frequência dos alunos
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
            Nova Presença
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registros</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presenças</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.presentes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faltas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.faltas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Presença</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.percentualPresenca}%</p>
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
                placeholder="Buscar por aluno ou professor..."
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os status</option>
              <option value="presente">Presente</option>
              <option value="falta">Falta</option>
            </select>
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
              <option value="treino">Treino</option>
              <option value="aula">Aula</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredPresencas.length} de {presencas.length} registros de presença
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

      {/* Attendance Grid */}
      {filteredPresencas.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma presença encontrada</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || dataFilter ? 'Tente ajustar os filtros de busca.' : 'Comece registrando uma nova presença.'}
          </p>
          {!searchTerm && !dataFilter && (
            <div className="mt-6">
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Registrar Primeira Presença
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresencas.map((presenca) => (
            <PresencaCard
              key={presenca.id}
              presenca={presenca}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal for creating/editing attendance */}
      <NovaPresencaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingPresenca={editingPresenca}
      />
    </div>
  );
});