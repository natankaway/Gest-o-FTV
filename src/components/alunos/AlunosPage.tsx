import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovoAlunoModal } from '@/components/forms';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash,
  Building,
  User,
  Mail,
  Phone
} from 'lucide-react';
import type { Aluno } from '@/types';

interface StudentCardProps {
  aluno: Aluno;
  onEdit: (aluno: Aluno) => void;
  onDelete: (id: number) => void;
  planos: any[];
}

const StudentCard: React.FC<StudentCardProps> = ({ aluno, onEdit, onDelete, planos }) => {
  const getVencimentoInfo = () => {
    if (aluno.tipoPlano === 'plataforma') {
      return {
        text: 'Sem vencimento',
        subtext: '(Plataforma)',
        color: 'text-gray-500 dark:text-gray-400'
      };
    }
    
    const vencimento = new Date(aluno.vencimento);
    const hoje = new Date();
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      text: vencimento.toLocaleDateString('pt-BR'),
      subtext: diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido',
      color: diasRestantes <= 3 ? 'text-red-600 dark:text-red-400' : 
             diasRestantes <= 7 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-green-600 dark:text-green-400'
    };
  };

  const getPlanoInfo = () => {
    if (aluno.tipoPlano === 'plataforma') {
      return {
        nome: aluno.plataformaParceira || 'Plataforma',
        preco: null,
        badge: { text: 'Parceiro', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
        textColor: 'text-purple-600 dark:text-purple-400'
      };
    }
    
    const plano = planos.find(p => p.id === aluno.planoId);
    return {
      nome: plano?.nome || 'Plano não encontrado',
      preco: plano?.preco,
      badge: { text: 'Mensalidade', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
      textColor: 'text-blue-600 dark:text-blue-400'
    };
  };

  const vencimento = getVencimentoInfo();
  const planoInfo = getPlanoInfo();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {aluno.nome}
            </h3>
            <div className="flex items-center space-x-2">
              <Building className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {aluno.unidade}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          aluno.status === 'ativo' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {aluno.status}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{aluno.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{aluno.telefone}</span>
        </div>
      </div>

      {/* Plan Info */}
      <div className="mb-4">
        <div className={`text-sm font-medium ${planoInfo.textColor}`}>
          {planoInfo.nome}
        </div>
        {planoInfo.preco && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            R$ {planoInfo.preco.toFixed(2)}/mês
          </div>
        )}
        <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${planoInfo.badge.color}`}>
          {planoInfo.badge.text}
        </span>
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {vencimento.text}
        </div>
        <div className={`text-xs ${vencimento.color}`}>
          {vencimento.subtext}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(aluno)}
          leftIcon={<Edit className="h-4 w-4" />}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(aluno.id)}
          leftIcon={<Trash className="h-4 w-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export const AlunosPage: React.FC = memo(() => {
  const { dadosMockados, setAlunos } = useAppState();
  const { alunos, planos } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [unidadeFilter, setUnidadeFilter] = useState('todas');
  const [tipoPlanoFilter, setTipoPlanoFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  // Dados filtrados
  const filteredAlunos = useMemo(() => {
    return alunos.filter(aluno => {
      const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           aluno.telefone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'todos' || aluno.status === statusFilter;
      const matchesUnidade = unidadeFilter === 'todas' || aluno.unidade === unidadeFilter;
      const matchesTipoPlano = tipoPlanoFilter === 'todos' || aluno.tipoPlano === tipoPlanoFilter;
      
      return matchesSearch && matchesStatus && matchesUnidade && matchesTipoPlano;
    });
  }, [alunos, searchTerm, statusFilter, unidadeFilter, tipoPlanoFilter]);

  // Opções para filtros
  const unidades = useMemo(() => {
    const uniqueUnidades = [...new Set(alunos.map(a => a.unidade))];
    return uniqueUnidades.filter(Boolean);
  }, [alunos]);

  const handleEdit = useCallback((aluno: Aluno) => {
    setEditingAluno(aluno);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      setAlunos(prev => prev.filter(a => a.id !== id));
      addNotification({
        type: 'success',
        title: 'Aluno excluído',
        message: 'Aluno removido com sucesso'
      });
    }
  }, [setAlunos, addNotification]);

  const handleAddNew = useCallback(() => {
    setEditingAluno(null);
    setShowModal(true);
  }, []);

  const exportToCSV = useCallback(() => {
    try {
      if (filteredAlunos.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há alunos para exportar'
        });
        return;
      }

      const csvData = filteredAlunos.map(aluno => ({
        Nome: aluno.nome,
        Email: aluno.email,
        Telefone: aluno.telefone,
        Unidade: aluno.unidade,
        Status: aluno.status,
        TipoPlano: aluno.tipoPlano,
        Vencimento: aluno.vencimento,
        DataMatricula: aluno.dataMatricula
      }));

      const headers = Object.keys(csvData[0]!).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `alunos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Dados dos alunos exportados com sucesso!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredAlunos, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Alunos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie todos os alunos do centro de treinamento
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
            Novo Aluno
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alunos.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alunos.filter(a => a.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plataformas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alunos.filter(a => a.tipoPlano === 'plataforma').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mensalistas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alunos.filter(a => a.tipoPlano === 'mensalidade').length}
              </p>
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
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
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
              {unidades.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>

          {/* Plan Type Filter */}
          <div>
            <select
              value={tipoPlanoFilter}
              onChange={(e) => setTipoPlanoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os tipos</option>
              <option value="mensalidade">Mensalidade</option>
              <option value="plataforma">Plataforma</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredAlunos.length} de {alunos.length} alunos
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

      {/* Students Grid */}
      {filteredAlunos.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum aluno encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando um novo aluno.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Adicionar Primeiro Aluno
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlunos.map((aluno) => (
            <StudentCard
              key={aluno.id}
              aluno={aluno}
              onEdit={handleEdit}
              onDelete={handleDelete}
              planos={planos}
            />
          ))}
        </div>
      )}

      {/* Novo Aluno Modal */}
      <NovoAlunoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingAluno={editingAluno}
      />
    </div>
  );
});