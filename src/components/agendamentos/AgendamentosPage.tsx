import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  Users,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash
} from 'lucide-react';

interface Agendamento {
  id: number;
  professorId: number;
  professorNome: string;
  alunoId?: number;
  alunoNome?: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: 'aula-individual' | 'aula-grupo' | 'treino';
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes?: string;
  unidade: string;
}

const DAYS_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Mock data for agendamentos
const mockAgendamentos: Agendamento[] = [
  {
    id: 1,
    professorId: 1,
    professorNome: 'Prof. João Silva',
    alunoId: 1,
    alunoNome: 'Maria Santos',
    data: '2024-01-15',
    horaInicio: '09:00',
    horaFim: '10:00',
    tipo: 'aula-individual',
    status: 'confirmado',
    unidade: 'Centro'
  },
  {
    id: 2,
    professorId: 2,
    professorNome: 'Prof. Ana Costa',
    data: '2024-01-15',
    horaInicio: '14:00',
    horaFim: '15:30',
    tipo: 'treino',
    status: 'confirmado',
    unidade: 'Centro'
  },
  {
    id: 3,
    professorId: 1,
    professorNome: 'Prof. João Silva',
    alunoId: 2,
    alunoNome: 'Carlos Oliveira',
    data: '2024-01-16',
    horaInicio: '10:00',
    horaFim: '11:00',
    tipo: 'aula-individual',
    status: 'pendente',
    unidade: 'Centro'
  }
];

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (id: number) => void;
}

const AgendamentoCard: React.FC<AgendamentoCardProps> = ({ agendamento, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'aula-individual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'aula-grupo':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'treino':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {agendamento.horaInicio} - {agendamento.horaFim}
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {agendamento.professorNome}
            </span>
          </div>
          {agendamento.alunoNome && (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {agendamento.alunoNome}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agendamento.status)}`}>
            {agendamento.status}
          </span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(agendamento.tipo)}`}>
            {agendamento.tipo}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(agendamento)}
          leftIcon={<Edit className="h-3 w-3" />}
          className="flex-1 text-xs"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(agendamento.id)}
          leftIcon={<Trash className="h-3 w-3" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export const AgendamentosPage: React.FC = memo(() => {
  const { dadosMockados } = useAppState();
  const { professores } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [filterProfessor, setFilterProfessor] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const handleEdit = useCallback((agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      setAgendamentos(prev => prev.filter(a => a.id !== id));
      addNotification({
        type: 'success',
        title: 'Agendamento excluído',
        message: 'Agendamento removido com sucesso'
      });
    }
  }, [addNotification]);

  const handleAddNew = useCallback(() => {
    setEditingAgendamento(null);
    setShowModal(true);
  }, []);

  // Get week dates
  const getWeekDates = useCallback((date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      weekDates.push(currentDay);
    }
    return weekDates;
  }, []);

  const weekDates = getWeekDates(currentDate);

  // Filter agendamentos for current week
  const weekAgendamentos = useMemo(() => {
    if (weekDates.length === 0) return [];
    
    const startDate = weekDates[0]!;
    const endDate = weekDates[6]!;
    
    return agendamentos.filter(ag => {
      const agendamentoDate = new Date(ag.data);
      const matchesDateRange = agendamentoDate >= startDate && agendamentoDate <= endDate;
      const matchesProfessor = filterProfessor === 'todos' || ag.professorId.toString() === filterProfessor;
      const matchesStatus = filterStatus === 'todos' || ag.status === filterStatus;
      
      return matchesDateRange && matchesProfessor && matchesStatus;
    });
  }, [agendamentos, weekDates, filterProfessor, filterStatus]);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  }, [currentDate]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Agendamentos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie aulas e treinos agendados
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={handleAddNew}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{agendamentos.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agendamentos.filter(a => a.status === 'confirmado').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agendamentos.filter(a => a.status === 'pendente').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Professor
            </label>
            <select
              value={filterProfessor}
              onChange={(e) => setFilterProfessor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os professores</option>
              {professores.map(professor => (
                <option key={professor.id} value={professor.id.toString()}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os status</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="secondary" onClick={goToToday} className="w-full">
              Hoje
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {weekDates[0]?.getDate()} - {weekDates[6]?.getDate()} de {MONTHS[weekDates[0]?.getMonth() ?? 0]} {weekDates[0]?.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayAgendamentos = weekAgendamentos.filter(ag => ag.data === dateStr);
            const isToday = new Date().toDateString() === date.toDateString();
            
            return (
              <div key={index} className="min-h-[200px]">
                <div className={`text-center p-2 rounded-lg mb-2 ${
                  isToday 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div className="font-semibold">{DAYS_WEEK[index]}</div>
                  <div className="text-sm">{date.getDate()}</div>
                </div>
                
                <div className="space-y-2">
                  {dayAgendamentos.map(agendamento => (
                    <AgendamentoCard
                      key={agendamento.id}
                      agendamento={agendamento}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Formulário de agendamento será implementado em breve.
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