// src/components/agendamentos/AgendamentosPresencaPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus, 
  UserCheck, 
  UserX, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Target,
  RefreshCw,
  Star
} from 'lucide-react';
import type { ListaPresenca, PreCheckin, PresencaConfirmada, HorarioFixo, AulaoConfig } from '@/types';

// Helper function to get aulao info
const getAulaoInfo = (lista: ListaPresenca) => {
  // This function should be implemented based on your data structure
  // For now, returning a mock object
  return {
    nome: 'Aulão Especial',
    tipo: 'extra' as 'fixo-recorrente' | 'extra',
    valorEspecial: 50,
    descricao: 'Aula especial com foco em técnicas avançadas'
  };
};

export const AgendamentosPresencaPage: React.FC = () => {
  const { dadosMockados, userLogado, setConfigCT } = useAppState();
  const { addNotification } = useNotifications();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedLista, setSelectedLista] = useState<ListaPresenca | null>(null);
  const [showAddAluno, setShowAddAluno] = useState(false);

  // Gerar listas automáticas baseadas nos horários configurados
  const listasPresencaAutomaticas = useMemo(() => {
    const listas: ListaPresenca[] = [];
    const configCT = dadosMockados.configCT;
    const horariosFixos = configCT.horariosFixos || [];
    const aulaoes = configCT.aulaoes || [];

    // Função para gerar lista para uma data específica
    const gerarListasParaData = (data: Date) => {
      const diaSemanaMap = {
        0: 'domingo',
        1: 'segunda', 
        2: 'terca',
        3: 'quarta',
        4: 'quinta',
        5: 'sexta',
        6: 'sabado'
      };
      
      const diaSemana = diaSemanaMap[data.getDay() as keyof typeof diaSemanaMap];
      const dataStr = data.toISOString().split('T')[0];

      // Horários fixos da semana
      horariosFixos
        .filter(h => h.ativo && h.diaSemana === diaSemana)
        .forEach(horario => {
          const listaId = `${horario.id}-${dataStr}`;
          listas.push({
            id: parseInt(listaId.replace(/\D/g, '')),
            data: dataStr,
            horaInicio: horario.horaInicio,
            horaFim: horario.horaFim,
            unidade: horario.unidade,
            tipo: 'aula-regular',
            nivelId: horario.nivelId,
            capacidade: horario.capacidade,
            status: 'aberta',
            preCheckins: [],
            presencasConfirmadas: [],
            horarioFixoId: horario.id,
            criadaEm: new Date().toISOString(),
            atualizadaEm: new Date().toISOString()
          });
        });

      // Aulões programados para esta data
      aulaoes
        .filter(a => a.ativo && a.data === dataStr)
        .forEach(aulao => {
          listas.push({
            id: aulao.id + 10000, // Evitar conflito de IDs
            data: aulao.data,
            horaInicio: aulao.horaInicio,
            horaFim: aulao.horaFim,
            unidade: aulao.unidade,
            tipo: 'aulao',
            nivelId: aulao.nivelId,
            capacidade: aulao.capacidade,
            status: 'aberta',
            preCheckins: [],
            presencasConfirmadas: [],
            aulaoId: aulao.id,
            criadaEm: new Date().toISOString(),
            atualizadaEm: new Date().toISOString()
          });
        });
    };

    // Gerar listas para os próximos 30 dias
    for (let i = 0; i < 30; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);
      gerarListasParaData(data);
    }

    return listas;
  }, [dadosMockados.configCT]);

  // Filtrar listas por data selecionada
  const listasDoDia = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return listasPresencaAutomaticas.filter(lista => lista.data === dateStr);
  }, [listasPresencaAutomaticas, selectedDate]);

  // Informações dos níveis
  const niveisAula = dadosMockados.configCT.niveisAula || [];

  const handlePreCheckin = useCallback((listaId: number, alunoId: number) => {
    // Em implementação real, salvaria no backend
    addNotification({
      type: 'success',
      title: 'Check-in realizado',
      message: 'Você foi adicionado à lista de presença'
    });
  }, [addNotification]);

  const handleCancelarCheckin = useCallback((listaId: number, checkinId: number) => {
    // Em implementação real, removeria do backend
    addNotification({
      type: 'info',
      title: 'Check-in cancelado',
      message: 'Sua presença foi removida da lista'
    });
  }, [addNotification]);

  const handleConfirmarPresenca = useCallback((listaId: number, alunoId: number, presente: boolean) => {
    // Em implementação real, confirmaria no backend
    addNotification({
      type: 'success',
      title: presente ? 'Presença confirmada' : 'Falta marcada',
      message: `Status de presença atualizado`
    });
  }, [addNotification]);

  const canManagePresencas = userLogado?.perfil !== 'aluno';

  // Navegação de datas
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  }, [selectedDate]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Lista de Presença
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {userLogado?.perfil === 'aluno' 
              ? 'Faça seu check-in para as aulas'
              : 'Gerencie presenças e confirme participações'
            }
          </p>
        </div>
      </div>

      {/* Navegação de Data */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
            </div>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={goToToday}
              size="sm"
            >
              Hoje
            </Button>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Lista de Horários do Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {listasDoDia.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Nenhuma aula programada
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Não há horários configurados para este dia.
            </p>
          </div>
        ) : (
          listasDoDia.map(lista => {
            const aulaoInfo = getAulaoInfo(lista);
            const nivel = lista.nivelId ? 
              dadosMockados.configCT.niveisAula?.find(n => n.id === lista.nivelId) : null;
            
            const isPassado = new Date(`${lista.data}T${lista.horaFim}`) < new Date();
            const vagasOcupadas = lista.preCheckins.filter(p => !p.cancelado).length;
            const temCapacidadeLimitada = lista.capacidade && lista.capacidade > 0;
            const vagasDisponiveis = temCapacidadeLimitada ? lista.capacidade - vagasOcupadas : Infinity;
            
            return (
              <div 
                key={lista.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border-l-4 p-4 shadow hover:shadow-md transition-all cursor-pointer ${
                  isPassado ? 'opacity-75' : ''
                } ${
                  lista.tipo === 'aulao' 
                    ? aulaoInfo?.tipo === 'fixo-recorrente'
                      ? 'border-l-blue-500'
                      : 'border-l-orange-500'
                    : 'border-l-green-500'
                }`}
                onClick={() => setSelectedLista(lista)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {lista.tipo === 'aulao' ? (
                      aulaoInfo?.tipo === 'fixo-recorrente' ? (
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Star className="w-4 h-4 text-orange-600" />
                      )
                    ) : (
                      <Calendar className="w-4 w-4 text-green-600" />
                    )}
                    
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {lista.tipo === 'aulao' && aulaoInfo ? aulaoInfo.nome : 'Aula Regular'}
                    </h4>
                    
                    {lista.tipo === 'aulao' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        aulaoInfo?.tipo === 'fixo-recorrente'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}>
                        {aulaoInfo?.tipo === 'fixo-recorrente' ? 'Fixo' : 'Extra'}
                      </span>
                    )}
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lista.status === 'aberta' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : lista.status === 'confirmada'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {lista.status.charAt(0).toUpperCase() + lista.status.slice(1)}
                  </div>
                </div>

                {/* Informações principais */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {lista.horaInicio} às {lista.horaFim}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{lista.unidade}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {temCapacidadeLimitada 
                        ? `${vagasOcupadas}/${lista.capacidade} alunos`
                        : `${vagasOcupadas} alunos (ilimitado)`
                      }
                    </span>
                    
                    {/* Barra de capacidade - só mostra se tiver limite */}
                    {temCapacidadeLimitada && (
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              (vagasOcupadas / lista.capacidade) * 100 >= 90 ? 'bg-red-500' :
                              (vagasOcupadas / lista.capacidade) * 100 >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((vagasOcupadas / lista.capacidade) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {nivel && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: nivel.cor }}
                      >
                        {nivel.nome}
                      </span>
                    </div>
                  )}

                  {/* Informações específicas do aulão */}
                  {lista.tipo === 'aulao' && aulaoInfo && (
                    <>
                      {aulaoInfo.valorEspecial && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            R$ {aulaoInfo.valorEspecial.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {aulaoInfo.descricao && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {aulaoInfo.descricao}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Status e disponibilidade */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        temCapacidadeLimitada && vagasDisponiveis <= 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {temCapacidadeLimitada 
                          ? (vagasDisponiveis > 0 ? `${vagasDisponiveis} vagas` : 'Lotado')
                          : 'Vagas ilimitadas'
                        }
                      </div>
                      {isPassado && (
                        <span className="text-xs text-gray-500">Aula finalizada</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {lista.preCheckins.length} pré-checkins
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-3 flex space-x-3">
                  {userLogado?.perfil === 'aluno' ? (
                    // Ações para alunos
                    !isPassado && (
                      <Button
                        onClick={() => handlePreCheckin(lista.id, userLogado.id)}
                        disabled={temCapacidadeLimitada && vagasDisponiveis <= 0}
                        className="flex-1"
                      >
                        {temCapacidadeLimitada && vagasDisponiveis <= 0 ? 'Lista Cheia' : 'Fazer Check-in'}
                      </Button>
                    )
                  ) : (
                    // Ações para professores/gestores/admins
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedLista(lista)}
                        leftIcon={<Eye className="h-4 w-4" />}
                        className="flex-1"
                      >
                        Ver Lista Completa
                      </Button>
                      
                      {!isPassado && (
                        <Button
                          onClick={() => {
                            setSelectedLista(lista);
                            setShowAddAluno(true);
                          }}
                          leftIcon={<Plus className="h-4 w-4" />}
                          className="flex-1"
                        >
                          Adicionar Aluno
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Status da Lista */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lista.status === 'aberta' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : lista.status === 'confirmada'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {lista.status === 'aberta' ? 'Aberta para Check-in' : 
                       lista.status === 'confirmada' ? 'Presenças Confirmadas' : 'Finalizada'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalhes da Lista */}
      {selectedLista && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Lista de Presença - {selectedLista.horaInicio} às {selectedLista.horaFim}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(selectedLista.data).toLocaleDateString('pt-BR')} - {selectedLista.unidade}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedLista(null);
                  setShowAddAluno(false);
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedLista.preCheckins.filter(p => !p.cancelado).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pré-Check-ins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedLista.presencasConfirmadas.filter(p => p.status === 'presente').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Confirmados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {selectedLista.presencasConfirmadas.filter(p => p.status === 'falta').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Faltas</div>
                </div>
              </div>

              {/* Lista de Alunos */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Alunos na Lista
                </h4>
                
                {/* Pré-check-ins */}
                {selectedLista.preCheckins.filter(p => !p.cancelado).map(checkin => {
                  const presencaConfirmada = selectedLista.presencasConfirmadas.find(
                    p => p.alunoId === checkin.alunoId
                  );
                  
                  return (
                    <div key={checkin.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {checkin.aluno}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Check-in: {new Date(checkin.horarioCheckin).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {canManagePresencas && (
                        <div className="flex space-x-2">
                          {!presencaConfirmada ? (
                            <>
                              <button
                                onClick={() => handleConfirmarPresenca(selectedLista.id, checkin.alunoId, true)}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                                title="Confirmar presença"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleConfirmarPresenca(selectedLista.id, checkin.alunoId, false)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                                title="Marcar falta"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              presencaConfirmada.status === 'presente'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {presencaConfirmada.status === 'presente' ? 'Presente' : 'Falta'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Formulário para adicionar aluno sem pré-check-in */}
                {showAddAluno && canManagePresencas && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h5 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Adicionar Aluno (sem pré-check-in)
                    </h5>
                    <div className="flex space-x-3">
                      <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Selecione um aluno...</option>
                        {dadosMockados.alunos
                          .filter(aluno => aluno.status === 'ativo')
                          .map(aluno => (
                            <option key={aluno.id} value={aluno.id}>
                              {aluno.nome}
                            </option>
                          ))}
                      </select>
                      <Button>
                        Adicionar
                      </Button>
                    </div>
                  </div>
                )}

                {selectedLista.preCheckins.filter(p => !p.cancelado).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Nenhum aluno na lista
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Aguardando check-ins dos alunos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};