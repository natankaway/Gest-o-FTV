// src/components/evolucao/ObjetivosTab.tsx
import React, { useState } from 'react';
import { Plus, Target, CheckCircle, Clock, Edit2, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/common';

export const ObjetivosTab: React.FC = () => {
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false);

  // Mock data - em produção viria do backend
  const objetivos = {
    ativos: [
      {
        id: 1,
        titulo: 'Treinar 3x por semana',
        tipo: 'frequencia',
        progressoSemanal: 2,
        metaSemanal: 3,
        progressoMensal: 12,
        metaMensal: 12,
        status: 'concluido_mes' as const,
        criadoEm: '01/06/2025',
        observacoes: 'Meta mensal concluída! Continue assim.'
      },
      {
        id: 2,
        titulo: 'Participar de 1 torneio',
        tipo: 'torneio',
        progresso: 0,
        meta: 1,
        prazo: '31/08/2025',
        status: 'em_andamento' as const,
        criadoEm: '15/05/2025',
        observacoes: 'Torneio Verão inscrito! Jogo: 15/07'
      },
      {
        id: 3,
        titulo: 'Alcançar nível Avançado',
        tipo: 'nivel',
        progresso: 16,
        meta: 20,
        prazo: '31/07/2025',
        status: 'em_andamento' as const,
        criadoEm: '01/03/2025',
        estimativa: '2 semanas para concluir'
      }
    ],
    concluidos: [
      {
        id: 4,
        titulo: 'Fazer 10 check-ins',
        tipo: 'presenca',
        concluidoEm: '20/06/2025'
      },
      {
        id: 5,
        titulo: 'Melhorar frequência para 80%',
        tipo: 'frequencia',
        concluidoEm: '15/05/2025'
      },
      {
        id: 6,
        titulo: 'Completar nível Iniciante',
        tipo: 'nivel',
        concluidoEm: '28/02/2024'
      },
      {
        id: 7,
        titulo: 'Treinar com 5 parceiros diferentes',
        tipo: 'social',
        concluidoEm: '10/04/2025'
      },
      {
        id: 8,
        titulo: 'Participar de torneio Primavera',
        tipo: 'torneio',
        concluidoEm: '30/04/2025'
      }
    ]
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      frequencia: '📅',
      torneio: '🏆',
      nivel: '⭐',
      treinos: '💪',
      presenca: '✅',
      social: '👥',
      personalizado: '🎯'
    };
    return icons[tipo as keyof typeof icons] || '🎯';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      em_andamento: 'border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800',
      concluido_mes: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
    };
    return colors[status as keyof typeof colors] || colors.em_andamento;
  };

  const calcularDiasRestantes = (prazo: string) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo.split('/').reverse().join('-'));
    const diff = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Botão Criar Novo */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Meus Objetivos</h3>
        <Button className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Criar Novo Objetivo
        </Button>
      </div>

      {/* Objetivos Ativos */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Ativos ({objetivos.ativos.length})
        </h4>

        {objetivos.ativos.map((objetivo) => (
          <div
            key={objetivo.id}
            className={`rounded-xl p-5 shadow-sm border-2 ${getStatusColor(objetivo.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{getTipoIcon(objetivo.tipo)}</span>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white text-lg">
                    {objetivo.titulo}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Criado em: {objetivo.criadoEm}
                  </p>
                </div>
              </div>
              {objetivo.status === 'concluido_mes' && (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              )}
            </div>

            {/* Progresso Semanal (para objetivos de frequência) */}
            {objetivo.tipo === 'frequencia' && objetivo.progressoSemanal !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Esta semana:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {objetivo.progressoSemanal}/{objetivo.metaSemanal}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${(objetivo.progressoSemanal / objetivo.metaSemanal) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Progresso Mensal */}
            {objetivo.progressoMensal !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Meta mensal:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {objetivo.progressoMensal}/{objetivo.metaMensal}
                    </span>
                    {objetivo.status === 'concluido_mes' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${(objetivo.progressoMensal / objetivo.metaMensal) * 100}%` }}
                  />
                </div>
                {objetivo.status === 'concluido_mes' && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                    ✅ Concluído! Continue assim.
                  </p>
                )}
              </div>
            )}

            {/* Progresso Normal */}
            {objetivo.progresso !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progresso:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {objetivo.progresso}/{objetivo.meta}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${(objetivo.progresso / objetivo.meta) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Prazo e Estimativa */}
            {objetivo.prazo && (
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Prazo: {objetivo.prazo}
                  {(() => {
                    const dias = calcularDiasRestantes(objetivo.prazo);
                    return (
                      <span className={`font-medium ${
                        dias < 7 ? 'text-red-600' : dias < 30 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        ({dias} dias restantes)
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}

            {objetivo.estimativa && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                ⏱️ Estimativa: {objetivo.estimativa}
              </p>
            )}

            {/* Observações */}
            {objetivo.observacoes && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💬 {objetivo.observacoes}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <Edit2 className="h-4 w-4" />
                Editar
              </button>
              {objetivo.status !== 'concluido_mes' && (
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                  <CheckCircle className="h-4 w-4" />
                  Concluir
                </button>
              )}
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Objetivos Concluídos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Concluídos ({objetivos.concluidos.length})
          </h4>
          <button
            onClick={() => setMostrarConcluidos(!mostrarConcluidos)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {mostrarConcluidos ? 'Ocultar' : 'Ver Todos'}
          </button>
        </div>

        {mostrarConcluidos && (
          <div className="space-y-2">
            {objetivos.concluidos.map((objetivo) => (
              <div
                key={objetivo.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTipoIcon(objetivo.tipo)}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {objetivo.titulo}
                    </p>
                    <p className="text-sm text-gray-500">
                      Concluído em: {objetivo.concluidoEm}
                    </p>
                  </div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dica */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Dica:</strong> Defina objetivos SMART (Específicos, Mensuráveis, Atingíveis, Relevantes e Temporais) 
          para maximizar suas chances de sucesso!
        </p>
      </div>
    </div>
  );
};