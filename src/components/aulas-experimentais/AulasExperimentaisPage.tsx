// src/components/aulas-experimentais/AulasExperimentaisPage.tsx
import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovaAulaExperimentalModal } from '@/components/forms/NovaAulaExperimentalModal';
import { DetalhesAulaExperimentalModal } from '@/components/forms/DetalhesAulaExperimentalModal';
import { ConversaoPlanoModal } from '@/components/forms/ConversaoPlanoModal';

import { 
  Plus, Search, Filter, Calendar, Clock, User, Phone, Mail,
  CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, Edit2,
  TrendingUp, Users, CalendarDays, Activity, MapPin
} from 'lucide-react';
import type { AulaExperimental, AulaExperimentalFormData, User as UserType } from '@/types';

// Componente principal
export const AulasExperimentaisPage: React.FC = memo(() => {
  const { dadosMockados, userLogado, unidadeSelecionada } = useAppState();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [unidadeFilter, setUnidadeFilter] = useState<string>('todas');
  const [showModal, setShowModal] = useState(false);
  const [selectedExperimental, setSelectedExperimental] = useState<AulaExperimental | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
const [showConversaoModal, setShowConversaoModal] = useState(false);
const [aulaDetalhes, setAulaDetalhes] = useState<AulaExperimental | null>(null);
const [aulaConversao, setAulaConversao] = useState<AulaExperimental | null>(null);

  // Filtrar dados baseado nas permissões do usuário
  const aulasExperimentais = useMemo(() => {
    let dados = dadosMockados.aulasExperimentais || [];
    
    // Filtrar por unidade baseado no perfil
    if (userLogado?.perfil === 'gestor' || userLogado?.perfil === 'professor') {
      dados = dados.filter(aula => aula.unidade === unidadeSelecionada);
    }
    
    // Aplicar filtros
   // Aplicar filtros
return dados.filter(aula => {
  const matchSearch = searchTerm === '' || 
    aula.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.telefone.includes(searchTerm) ||
    aula.email.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchStatus = statusFilter === 'todos' || aula.status === statusFilter;
  const matchUnidade = unidadeFilter === 'todas' || aula.unidade === unidadeFilter;
  
  return matchSearch && matchStatus && matchUnidade;
});
}, [dadosMockados.aulasExperimentais, userLogado, unidadeSelecionada, searchTerm, statusFilter, unidadeFilter]); // ← ADICIONAR unidadeFilter
  
const availableStudents = useMemo(() => {
  const experimentalAlunos = dadosMockados.aulasExperimentais?.map(a => a.alunoId) || [];
  
  return dadosMockados.alunos.filter(aluno => {
    // 1. NÃO pode ter plano ativo (mensalidade ou plataforma)
    const temPlanoAtivo = aluno.tipoPlano === 'mensalidade' || aluno.tipoPlano === 'plataforma';
    
    // 2. NÃO pode ter feito aula experimental já
    const jaFezExperimental = experimentalAlunos.includes(aluno.id);
    
    // 3. Filtrar por unidade baseado no perfil do usuário
    let unidadePermitida = true;
    if (userLogado?.perfil === 'gestor') {
      unidadePermitida = aluno.unidade === unidadeSelecionada;
    } else if (userLogado?.perfil === 'admin') {
      unidadePermitida = aluno.unidade === unidadeSelecionada;
    }
    
    // Só incluir alunos que NÃO têm plano ativo, NÃO fizeram experimental e são da unidade certa
    return !temPlanoAtivo && !jaFezExperimental && unidadePermitida;
  });
}, [dadosMockados.alunos, dadosMockados.aulasExperimentais, userLogado, unidadeSelecionada]);
  // Estatísticas para cards
  const stats = useMemo(() => {
    const total = aulasExperimentais.length;
    const agendadas = aulasExperimentais.filter(a => a.status === 'agendada').length;
    const realizadas = aulasExperimentais.filter(a => a.status === 'realizada').length;
    const convertidas = aulasExperimentais.filter(a => a.status === 'convertido').length;
    const taxaConversao = realizadas > 0 ? Math.round((convertidas / realizadas) * 100) : 0;
    
    return { total, agendadas, realizadas, convertidas, taxaConversao };
  }, [aulasExperimentais]);

  // Handlers
  const handleNovaAula = useCallback(() => {
    if (userLogado?.perfil === 'professor') {
      addNotification({
        type: 'warning',
        title: 'Acesso Negado',
        message: 'Professores podem apenas visualizar as aulas experimentais.'
      });
      return;
    }
    
    setSelectedExperimental(null);
    setIsEditing(false);
    setShowModal(true);
  }, [userLogado, addNotification]);

  const handleEditAula = useCallback((aula: AulaExperimental) => {
    if (userLogado?.perfil === 'professor') {
      addNotification({
        type: 'warning',
        title: 'Acesso Negado',
        message: 'Professores podem apenas visualizar as aulas experimentais.'
      });
      return;
    }
    
    setSelectedExperimental(aula);
    setIsEditing(true);
    setShowModal(true);
  }, [userLogado, addNotification]);

  const handleReagendar = useCallback((aula: AulaExperimental) => {
    if (aula.status !== 'nao-compareceu') {
      addNotification({
        type: 'error',
        title: 'Ação Inválida',
        message: 'Só é possível reagendar aulas com status "Não Compareceu".'
      });
      return;
    }
    
    // Abrir modal de reagendamento
    setSelectedExperimental({...aula, status: 'agendada'});
    setIsEditing(true);
    setShowModal(true);
  }, [addNotification]);

const handleVerDetalhes = useCallback((aula: AulaExperimental) => {
  setAulaDetalhes(aula);
  setShowDetalhesModal(true);
}, []);

const handleIniciarConversao = useCallback((aula: AulaExperimental) => {
  if (aula.status !== 'realizada') {
    addNotification({
      type: 'error',
      title: 'Conversão não disponível',
      message: 'Só é possível converter aulas que foram realizadas.'
    });
    return;
  }
  
  setAulaConversao(aula);
  setShowConversaoModal(true);
}, [addNotification]);

const handleConversao = useCallback((aulaId: number, planoData: any) => {
  console.log('Convertendo aula:', aulaId, 'para plano:', planoData);
  
  addNotification({
    type: 'success',
    title: 'Aluno convertido com sucesso!',
    message: `O aluno foi convertido para ${planoData.tipoPlano === 'mensalidade' ? 'mensalidade' : 'plataforma parceira'}.`
  });
  
  setShowConversaoModal(false);
  setAulaConversao(null);
}, [addNotification]);
const handleSaveAula = useCallback((data: AulaExperimentalFormData) => {
  if (isEditing && selectedExperimental) {
    // Editar aula existente
    console.log('Editando aula:', { ...selectedExperimental, ...data });
    addNotification({
      type: 'success',
      title: 'Aula experimental atualizada',
      message: 'As informações foram salvas com sucesso.'
    });
  } else {
    // Nova aula - SALVAR DE VERDADE
    const nomeAluno = data.alunoId ? 
      dadosMockados.alunos.find(s => s.id === data.alunoId)?.nome : null;
    
    const novaAula: AulaExperimental = {
      id: Math.max(...dadosMockados.aulasExperimentais?.map(a => a.id) || [0]) + 1,
      alunoId: data.alunoId || Math.floor(Math.random() * 90000) + 10000, // ID temporário para novos alunos
      aluno: nomeAluno || 'Novo Aluno',
      telefone: data.telefone,
      email: data.email,
      dataAgendamento: data.dataAgendamento,
      status: data.status,
      professorId: data.professorId,
      professor: data.professorId ? 
        dadosMockados.professores.find(p => p.id === data.professorId)?.nome : 
        'Não definido',
      unidade: data.unidade,
      observacoes: data.observacoes,
      historico: [{
        data: new Date().toISOString(),
        statusAnterior: '',
        statusNovo: data.status,
        observacao: 'Aula experimental criada',
        usuarioResponsavel: userLogado?.nome || 'Sistema'
      }],
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    
    // Adicionar aos dados mockados (simular salvamento)
    dadosMockados.aulasExperimentais = dadosMockados.aulasExperimentais || [];
    dadosMockados.aulasExperimentais.push(novaAula);
    
    console.log('Nova aula criada:', novaAula);
    addNotification({
      type: 'success',
      title: 'Aula experimental agendada',
      message: `Aula agendada para ${novaAula.aluno} em ${new Date(data.dataAgendamento).toLocaleDateString('pt-BR')}.`
    });
  }
}, [isEditing, selectedExperimental, dadosMockados, userLogado, addNotification]);


  const getStatusColor = (status: string) => {
    const colors = {
      'agendada': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      'realizada': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      'nao-compareceu': 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      'convertido': 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      'inativo': 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[status] || colors['agendada'];
  };

  const getStatusText = (status: string) => {
    const texts = {
      'agendada': 'Agendada',
      'realizada': 'Realizada',
      'nao-compareceu': 'Não Compareceu',
      'convertido': 'Convertido',
      'inativo': 'Inativo'
    };
    return texts[status] || status;
  };

  const canEdit = userLogado?.perfil !== 'professor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Aulas Experimentais
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie as aulas experimentais gratuitas oferecidas aos novos alunos
          </p>
        </div>
        
        {canEdit && (
          <Button 
            onClick={handleNovaAula}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Aula Experimental
          </Button>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agendadas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.agendadas}</p>
            </div>
            <CalendarDays className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Realizadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.realizadas}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Convertidas</p>
              <p className="text-2xl font-bold text-purple-600">{stats.convertidas}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa Conversão</p>
              <p className="text-2xl font-bold text-orange-600">{stats.taxaConversao}%</p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

    {/* Filtros */}
<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
    </div>
    
    {/* Mostrar filtro de unidade apenas para admin */}
    {userLogado?.perfil === 'admin' && (
      <div className="w-full sm:w-48">
        <select
          value={unidadeFilter}
          onChange={(e) => setUnidadeFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="todas">Todas as Unidades</option>
          {dadosMockados.unidades.map(unidade => (
            <option key={unidade.id} value={unidade.nome}>
              {unidade.nome}
            </option>
          ))}
        </select>
      </div>
    )}
    
    <div className="w-full sm:w-48">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="todos">Todos os Status</option>
        <option value="agendada">Agendadas</option>
        <option value="realizada">Realizadas</option>
        <option value="nao-compareceu">Não Compareceu</option>
        <option value="convertido">Convertidas</option>
        <option value="inativo">Inativas</option>
      </select>
    </div>
  </div>
</div>

      {/* Lista de Aulas Experimentais */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {aulasExperimentais.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma aula experimental encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'todos' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece agendando a primeira aula experimental.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Professor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {aulasExperimentais.map((aula) => (
                  <tr key={aula.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {aula.aluno}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {aula.telefone}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {aula.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(aula.dataAgendamento).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(aula.dataAgendamento).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(aula.status)}`}>
                        {getStatusText(aula.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {aula.professor || 'Não definido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {aula.unidade}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
  onClick={() => handleVerDetalhes(aula)}
  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
  title="Ver detalhes"
>
  <Eye className="h-4 w-4" />
</button>
                        
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleEditAula(aula)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            
                            {aula.status === 'nao-compareceu' && (
                              <button
                                onClick={() => handleReagendar(aula)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Reagendar"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            
                            {aula.status === 'realizada' && (
                              <button
  onClick={() => handleIniciarConversao(aula)}
  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
  title="Converter para plano"
>
  <TrendingUp className="h-4 w-4" />
</button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

     {showModal && (
  <NovaAulaExperimentalModal
    isOpen={showModal}
    onClose={() => {
      setShowModal(false);
      setSelectedExperimental(null);
      setIsEditing(false);
    }}
    editingAula={isEditing ? selectedExperimental : null}
    onSave={handleSaveAula}
  />
)}

{/* Modal de Detalhes da Aula */}
{showDetalhesModal && (
  <DetalhesAulaExperimentalModal
    isOpen={showDetalhesModal}
    onClose={() => {
      setShowDetalhesModal(false);
      setAulaDetalhes(null);
    }}
    aula={aulaDetalhes}
  />
)}

{/* Modal de Conversão de Plano */}
{showConversaoModal && (
  <ConversaoPlanoModal
    isOpen={showConversaoModal}
    onClose={() => {
      setShowConversaoModal(false);
      setAulaConversao(null);
    }}
    aula={aulaConversao}
    onConvert={handleConversao}
  />
)}
    </div>
  );
});