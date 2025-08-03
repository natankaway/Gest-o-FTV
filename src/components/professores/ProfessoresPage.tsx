import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash,
  Mail,
  Phone,
  Star,
  DollarSign,
  Clock,
  BookOpen
} from 'lucide-react';
import type { Professor } from '@/types';

interface ProfessorCardProps {
  professor: Professor;
  onEdit: (professor: Professor) => void;
  onDelete: (id: number) => void;
}

const ProfessorCard: React.FC<ProfessorCardProps> = ({ professor, onEdit, onDelete }) => {
  const getPaymentInfo = () => {
    if (professor.tipoPagamento === 'fixo') {
      return {
        text: `R$ ${professor.valorFixo?.toFixed(2)}/aula`,
        type: 'Fixo',
        color: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      };
    } else {
      const valores = professor.valoresVariaveis;
      return {
        text: `R$ ${valores?.uma || 0} / ${valores?.duas || 0} / ${valores?.tres || 0}`,
        type: 'Variável (1/2/3+ pessoas)',
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      };
    }
  };

  const getExperienceInfo = () => {
    const exp = professor.experiencia;
    const colors = {
      '1-3': 'text-yellow-600 dark:text-yellow-400',
      '3-5': 'text-blue-600 dark:text-blue-400',
      '5-10': 'text-purple-600 dark:text-purple-400',
      '10+': 'text-red-600 dark:text-red-400'
    };
    return {
      text: exp === '10+' ? '10+ anos' : `${exp} anos`,
      color: colors[exp] || 'text-gray-600 dark:text-gray-400'
    };
  };

  const paymentInfo = getPaymentInfo();
  const experienceInfo = getExperienceInfo();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {professor.nome}
            </h3>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className={`text-sm ${experienceInfo.color}`}>
                {experienceInfo.text}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          professor.ativo 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {professor.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{professor.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{professor.telefone}</span>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          <Star className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Especialidades</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {professor.especialidades.slice(0, 2).map((especialidade, index) => (
            <span 
              key={index}
              className="inline-block text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
            >
              {especialidade}
            </span>
          ))}
          {professor.especialidades.length > 2 && (
            <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              +{professor.especialidades.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-1">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Pagamento</span>
        </div>
        <div className={`text-sm font-medium ${paymentInfo.color}`}>
          {paymentInfo.text}
        </div>
        <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${paymentInfo.badge}`}>
          {paymentInfo.type}
        </span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(professor)}
          leftIcon={<Edit className="h-4 w-4" />}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(professor.id)}
          leftIcon={<Trash className="h-4 w-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export const ProfessoresPage: React.FC = memo(() => {
  const { dadosMockados, setProfessores } = useAppState();
  const { professores } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [experienceFilter, setExperienceFilter] = useState('todas');
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);

  // Dados filtrados
  const filteredProfessores = useMemo(() => {
    return professores.filter(professor => {
      const matchesSearch = professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professor.telefone.includes(searchTerm) ||
                           professor.especialidades.some(esp => 
                             esp.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      
      const matchesStatus = statusFilter === 'todos' || 
                           (statusFilter === 'ativo' && professor.ativo) ||
                           (statusFilter === 'inativo' && !professor.ativo);
      const matchesExperience = experienceFilter === 'todas' || professor.experiencia === experienceFilter;
      const matchesPayment = paymentFilter === 'todos' || professor.tipoPagamento === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesExperience && matchesPayment;
    });
  }, [professores, searchTerm, statusFilter, experienceFilter, paymentFilter]);

  const handleEdit = useCallback((professor: Professor) => {
    setEditingProfessor(professor);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      setProfessores(prev => prev.filter(p => p.id !== id));
      addNotification({
        type: 'success',
        title: 'Professor excluído',
        message: 'Professor removido com sucesso'
      });
    }
  }, [setProfessores, addNotification]);

  const handleAddNew = useCallback(() => {
    setEditingProfessor(null);
    setShowModal(true);
  }, []);

  const exportToCSV = useCallback(() => {
    try {
      if (filteredProfessores.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há professores para exportar'
        });
        return;
      }

      const csvData = filteredProfessores.map(professor => ({
        Nome: professor.nome,
        Email: professor.email,
        Telefone: professor.telefone,
        TipoPagamento: professor.tipoPagamento,
        ValorFixo: professor.valorFixo || '',
        ValoresVariaveis: professor.valoresVariaveis ? 
          `${professor.valoresVariaveis.uma}/${professor.valoresVariaveis.duas}/${professor.valoresVariaveis.tres}` : '',
        Especialidades: professor.especialidades.join('; '),
        Experiencia: professor.experiencia,
        Status: professor.ativo ? 'Ativo' : 'Inativo'
      }));

      const headers = Object.keys(csvData[0]!).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `professores_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Dados dos professores exportados com sucesso!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredProfessores, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Professores
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie todos os professores do centro de treinamento
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
            Novo Professor
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{professores.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {professores.filter(p => p.ativo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagamento Fixo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {professores.filter(p => p.tipoPagamento === 'fixo').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Experientes (5+)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {professores.filter(p => p.experiencia === '5-10' || p.experiencia === '10+').length}
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
                placeholder="Buscar por nome, email, telefone ou especialidade..."
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
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todas">Toda experiência</option>
              <option value="1-3">1-3 anos</option>
              <option value="3-5">3-5 anos</option>
              <option value="5-10">5-10 anos</option>
              <option value="10+">10+ anos</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os tipos</option>
              <option value="fixo">Pagamento Fixo</option>
              <option value="variavel">Pagamento Variável</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredProfessores.length} de {professores.length} professores
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

      {/* Professores Grid */}
      {filteredProfessores.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum professor encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando um novo professor.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Adicionar Primeiro Professor
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessores.map((professor) => (
            <ProfessorCard
              key={professor.id}
              professor={professor}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal for creating/editing professors */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Funcionalidade de {editingProfessor ? 'edição' : 'criação'} será implementada na próxima fase.
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