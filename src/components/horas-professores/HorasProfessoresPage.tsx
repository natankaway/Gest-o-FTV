// src/components/horas-professores/HorasProfessoresPage.tsx
import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovoRegistroHorasModal } from '@/components/forms/NovoRegistroHorasModal';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Download, 
  Edit, 
  Trash,
  User,
  Calendar,
  MapPin,
  Calculator,
  Eye,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import type { RegistroHorasProfessor, Professor } from '@/types';

interface RegistroCardProps {
  registro: RegistroHorasProfessor;
  professor?: Professor;
  onEdit: (registro: RegistroHorasProfessor) => void;
  onDelete: (id: number) => void;
  canEdit: boolean;
}

const RegistroCard: React.FC<RegistroCardProps> = ({ 
  registro, 
  professor, 
  onEdit, 
  onDelete, 
  canEdit 
}) => {
  const getTipoInfo = () => {
    const tipos = {
      'aula-regular': { label: 'Aula Regular', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' },
      'aulao': { label: 'Aulão', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' },
      'administrativo': { label: 'Administrativo', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20' },
      'substituicao': { label: 'Substituição', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' }
    };
    return tipos[registro.tipoAtividade] || tipos['aula-regular'];
  };

  const calcularValor = () => {
    if (!professor) return 0;

    if (professor.tipoPagamento === 'fixo') {
      // Para pagamento fixo, só mostra o valor base
      return professor.valorFixo || 0;
    } else if (professor.tipoPagamento === 'horas-variaveis' && professor.valoresHoras) {
      const horas = registro.horasTrabalhadas;
      
      // Aplicar lógica de faixas de horas
      if (horas <= 1) {
        return professor.valoresHoras.umaHora || 0;
      } else if (horas <= 2) {
        return professor.valoresHoras.duasHoras || 0;
      } else {
        return professor.valoresHoras.tresOuMaisHoras || 0;
      }
    }

    // Para aulão, usar valor específico se disponível
    if (registro.tipoAtividade === 'aulao' && professor.valorAulao) {
      return professor.valorAulao;
    }

    return 0;
  };

  const tipoInfo = getTipoInfo();
  const valorEstimado = calcularValor();
  const dataFormatada = new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {registro.professorNome}
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {dataFormatada}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${tipoInfo.bg} ${tipoInfo.color}`}>
          {tipoInfo.label}
        </span>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Unidade</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{registro.unidade}</p>
        </div>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Horas</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{registro.horasTrabalhadas}h</p>
        </div>
      </div>

      {/* Valor estimado */}
      {valorEstimado > 0 && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Valor Estimado
              </span>
            </div>
            <span className="text-lg font-bold text-green-800 dark:text-green-300">
              R$ {valorEstimado.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Observações */}
      {registro.observacoes && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Observações:</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{registro.observacoes}</p>
        </div>
      )}

      {/* Ações */}
      {canEdit && (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(registro)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(registro.id)}
            leftIcon={<Trash className="h-4 w-4" />}
          >
            Excluir
          </Button>
        </div>
      )}

      {/* Info de registro */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Registrado em {new Date(registro.registradoEm).toLocaleDateString('pt-BR')} às {new Date(registro.registradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export const HorasProfessoresPage: React.FC = memo(() => {
  const { dadosMockados, userLogado, unidadeSelecionada, setRegistrosHorasProfessores } = useAppState();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [professorFilter, setProfessorFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [unidadeFilter, setUnidadeFilter] = useState<string>('todas');
  const [periodoFilter, setPeriodoFilter] = useState<string>('mes-atual');
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroHorasProfessor | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Verificar permissões
  const canManage = userLogado?.perfil === 'admin' || userLogado?.perfil === 'gestor';
  const canView = canManage || userLogado?.perfil === 'professor';

  // Filtrar registros
  const filteredRegistros = useMemo(() => {
    let registros = dadosMockados.registrosHorasProfessores || [];

    // Filtro por perfil/unidade
    if (userLogado?.perfil === 'gestor') {
      registros = registros.filter(r => r.unidade === unidadeSelecionada);
    } else if (userLogado?.perfil === 'professor') {
      registros = registros.filter(r => r.professorId === userLogado.id);
    }

    // Filtros de pesquisa
    if (searchTerm) {
      registros = registros.filter(r => 
        r.professorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (professorFilter !== 'todos') {
      registros = registros.filter(r => r.professorId === parseInt(professorFilter));
    }

    if (tipoFilter !== 'todos') {
      registros = registros.filter(r => r.tipoAtividade === tipoFilter);
    }

    if (unidadeFilter !== 'todas') {
      registros = registros.filter(r => r.unidade === unidadeFilter);
    }

    // Filtro por período
    if (periodoFilter !== 'todos') {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      
      switch (periodoFilter) {
        case 'mes-atual':
          registros = registros.filter(r => {
            const dataRegistro = new Date(r.data + 'T00:00:00');
            return dataRegistro >= inicioMes && dataRegistro <= fimMes;
          });
          break;
        case 'ultimos-7-dias':
          const seteDiasAtras = new Date();
          seteDiasAtras.setDate(hoje.getDate() - 7);
          registros = registros.filter(r => {
            const dataRegistro = new Date(r.data + 'T00:00:00');
            return dataRegistro >= seteDiasAtras;
          });
          break;
        case 'ultimos-30-dias':
          const trintaDiasAtras = new Date();
          trintaDiasAtras.setDate(hoje.getDate() - 30);
          registros = registros.filter(r => {
            const dataRegistro = new Date(r.data + 'T00:00:00');
            return dataRegistro >= trintaDiasAtras;
          });
          break;
      }
    }

    return registros.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [dadosMockados.registrosHorasProfessores, userLogado, unidadeSelecionada, searchTerm, professorFilter, tipoFilter, unidadeFilter, periodoFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const registros = filteredRegistros;
    const totalRegistros = registros.length;
    const totalHoras = registros.reduce((sum, r) => sum + r.horasTrabalhadas, 0);
    const professoresAtivos = new Set(registros.map(r => r.professorId)).size;
    
    // Calcular valor total estimado
    const valorTotal = registros.reduce((sum, registro) => {
      const professor = dadosMockados.professores.find(p => p.id === registro.professorId);
      if (!professor) return sum;

      if (professor.tipoPagamento === 'fixo') {
        return sum + (professor.valorFixo || 0);
      } else if (professor.tipoPagamento === 'horas-variaveis' && professor.valoresHoras) {
        const horas = registro.horasTrabalhadas;
        if (horas <= 1) {
          return sum + (professor.valoresHoras.umaHora || 0);
        } else if (horas <= 2) {
          return sum + (professor.valoresHoras.duasHoras || 0);
        } else {
          return sum + (professor.valoresHoras.tresOuMaisHoras || 0);
        }
      }

      if (registro.tipoAtividade === 'aulao' && professor.valorAulao) {
        return sum + professor.valorAulao;
      }

      return sum;
    }, 0);

    return { totalRegistros, totalHoras, professoresAtivos, valorTotal };
  }, [filteredRegistros, dadosMockados.professores]);

  // Professores disponíveis para filtro
  const professoresDisponiveis = useMemo(() => {
    let professores = dadosMockados.professores.filter(p => p.ativo);
    
    if (userLogado?.perfil === 'gestor') {
      // Buscar registros da unidade para ver quais professores têm registro
      const professoresComRegistro = new Set(
        dadosMockados.registrosHorasProfessores
          .filter(r => r.unidade === unidadeSelecionada)
          .map(r => r.professorId)
      );
      professores = professores.filter(p => professoresComRegistro.has(p.id));
    }
    
    return professores;
  }, [dadosMockados.professores, dadosMockados.registrosHorasProfessores, userLogado, unidadeSelecionada]);

  // Handlers
  const handleNovoRegistro = useCallback(() => {
    if (!canManage) {
      addNotification({
        type: 'warning',
        title: 'Acesso Negado',
        message: 'Apenas administradores e gestores podem registrar horas.'
      });
      return;
    }
    
    setSelectedRegistro(null);
    setIsEditing(false);
    setShowModal(true);
  }, [canManage, addNotification]);

  const handleEditRegistro = useCallback((registro: RegistroHorasProfessor) => {
    if (!canManage) {
      addNotification({
        type: 'warning',
        title: 'Acesso Negado',
        message: 'Apenas administradores e gestores podem editar registros.'
      });
      return;
    }
    
    setSelectedRegistro(registro);
    setIsEditing(true);
    setShowModal(true);
  }, [canManage, addNotification]);

  const handleDeleteRegistro = useCallback((id: number) => {
    if (!canManage) {
      addNotification({
        type: 'warning',
        title: 'Acesso Negado',
        message: 'Apenas administradores e gestores podem excluir registros.'
      });
      return;
    }

    if (confirm('Tem certeza que deseja excluir este registro de horas?')) {
      setRegistrosHorasProfessores(prev => prev.filter(r => r.id !== id));
      addNotification({
        type: 'success',
        title: 'Registro excluído',
        message: 'O registro de horas foi removido com sucesso.'
      });
    }
  }, [canManage, setRegistrosHorasProfessores, addNotification]);

  const exportToCSV = useCallback(() => {
    try {
      const csvData = filteredRegistros.map(registro => ({
        'Data': new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        'Professor': registro.professorNome,
        'Unidade': registro.unidade,
        'Horas': registro.horasTrabalhadas,
        'Tipo': registro.tipoAtividade,
        'Observações': registro.observacoes || '',
        'Registrado em': new Date(registro.registradoEm).toLocaleDateString('pt-BR')
      }));

      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `horas_professores_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Dados das horas exportados com sucesso!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredRegistros, addNotification]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Acesso Restrito
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar o controle de horas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {userLogado?.perfil === 'professor' ? 'Minhas Horas Trabalhadas' : 'Controle de Horas dos Professores'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {userLogado?.perfil === 'professor' 
              ? 'Acompanhe suas horas registradas e valores'
              : 'Gerencie e controle as horas trabalhadas pelos professores'
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
          {canManage && (
            <Button
              onClick={handleNovoRegistro}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Registrar Horas
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registros</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRegistros}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Horas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalHoras}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Professores</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.professoresAtivos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.valorTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por professor, unidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filtro Professor */}
          {canManage && (
            <div>
              <select
                value={professorFilter}
                onChange={(e) => setProfessorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todos">Todos os professores</option>
                {professoresDisponiveis.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro Tipo */}
          <div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os tipos</option>
              <option value="aula-regular">Aula Regular</option>
              <option value="aulao">Aulão</option>
              <option value="administrativo">Administrativo</option>
              <option value="substituicao">Substituição</option>
            </select>
          </div>

          {/* Filtro Unidade */}
          {userLogado?.perfil === 'admin' && (
            <div>
              <select
                value={unidadeFilter}
                onChange={(e) => setUnidadeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todas">Todas as unidades</option>
                {dadosMockados.unidades.map(unidade => (
                  <option key={unidade.id} value={unidade.nome}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro Período */}
          <div>
            <select
              value={periodoFilter}
              onChange={(e) => setPeriodoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os períodos</option>
              <option value="mes-atual">Mês atual</option>
              <option value="ultimos-7-dias">Últimos 7 dias</option>
              <option value="ultimos-30-dias">Últimos 30 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRegistros.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {canManage 
                ? 'Nenhum registro de horas foi encontrado com os filtros atuais.'
                : 'Você ainda não tem registros de horas para o período selecionado.'
              }
            </p>
            {canManage && (
              <Button onClick={handleNovoRegistro} leftIcon={<Plus className="h-4 w-4" />}>
                Registrar Primeira Hora
              </Button>
            )}
          </div>
        ) : (
          filteredRegistros.map(registro => {
            const professor = dadosMockados.professores.find(p => p.id === registro.professorId);
            return (
              <RegistroCard
                key={registro.id}
                registro={registro}
                professor={professor}
                onEdit={handleEditRegistro}
                onDelete={handleDeleteRegistro}
                canEdit={canManage}
              />
            );
          })
        )}
      </div>

      {/* Modal de Registro */}
      {showModal && (
        <NovoRegistroHorasModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRegistro(null);
            setIsEditing(false);
          }}
          editingRegistro={selectedRegistro}
          isEditing={isEditing}
        />
      )}
    </div>
  );
});