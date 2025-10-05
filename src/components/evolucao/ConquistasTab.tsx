// src/components/evolucao/ConquistasTab.tsx
import React, { useState } from 'react';
import { Award, Lock, Check, Trophy, Filter } from 'lucide-react';

export const ConquistasTab: React.FC = () => {
  const [filtro, setFiltro] = useState<'todas' | 'desbloqueadas' | 'bloqueadas'>('todas');

  // Mock data - em produção viria do backend
  const conquistas = {
    desbloqueadas: [
      {
        id: '1',
        nome: 'Primeiro Treino',
        descricao: 'Complete seu primeiro treino',
        icone: '🎯',
        desbloqueadaEm: '15/01/2024',
        dificuldade: 'facil' as const
      },
      {
        id: '2',
        nome: 'Sequência de 7 Dias',
        descricao: 'Treine por 7 dias consecutivos',
        icone: '🔥',
        desbloqueadaEm: '22/06/2025',
        sequenciaAtual: 12,
        recordePessoal: true,
        dificuldade: 'medio' as const
      },
      {
        id: '3',
        nome: 'Frequência de Ouro',
        descricao: '100% de presença no mês',
        icone: '🏅',
        desbloqueadaEm: '30/05/2025',
        vezes: 3,
        dificuldade: 'dificil' as const
      },
      {
        id: '4',
        nome: 'Iniciante Completo',
        descricao: 'Complete todos treinos do nível iniciante',
        icone: '⭐',
        desbloqueadaEm: '28/02/2024',
        dificuldade: 'facil' as const
      },
      {
        id: '5',
        nome: 'Primeira Vitória',
        descricao: 'Vença sua primeira partida em torneio',
        icone: '🏆',
        desbloqueadaEm: '10/04/2024',
        dificuldade: 'medio' as const
      },
      {
        id: '6',
        nome: 'Madrugador',
        descricao: 'Participe de 10 aulas antes das 8h',
        icone: '🌅',
        desbloqueadaEm: '15/05/2024',
        dificuldade: 'medio' as const
      },
      {
        id: '7',
        nome: 'Atleta Dedicado',
        descricao: 'Acumule 100 horas de treino',
        icone: '💪',
        desbloqueadaEm: '01/06/2025',
        dificuldade: 'dificil' as const
      },
      {
        id: '8',
        nome: 'Avaliador',
        descricao: 'Faça auto-avaliação em 20 treinos',
        icone: '📝',
        desbloqueadaEm: '12/06/2025',
        dificuldade: 'facil' as const
      }
    ],
    emProgresso: [
      {
        id: '9',
        nome: 'Mestre da Defesa',
        descricao: 'Complete 20 treinos técnicos',
        icone: '🛡️',
        progresso: 12,
        meta: 20,
        porcentagem: 60,
        dificuldade: 'medio' as const
      },
      {
        id: '10',
        nome: 'Competidor',
        descricao: 'Participe de 3 torneios',
        icone: '🏆',
        progresso: 1,
        meta: 3,
        porcentagem: 33,
        dificuldade: 'medio' as const
      },
      {
        id: '11',
        nome: 'Social',
        descricao: 'Treine com 10 parceiros diferentes',
        icone: '👥',
        progresso: 6,
        meta: 10,
        porcentagem: 60,
        dificuldade: 'facil' as const
      },
      {
        id: '12',
        nome: 'Campeão',
        descricao: 'Vença um torneio',
        icone: '👑',
        progresso: 0,
        meta: 1,
        porcentagem: 0,
        dificuldade: 'lendario' as const
      },
      {
        id: '13',
        nome: 'Maratonista',
        descricao: 'Sequência de 30 dias consecutivos',
        icone: '🏃',
        progresso: 12,
        meta: 30,
        porcentagem: 40,
        dificuldade: 'dificil' as const
      }
    ]
  };

  const totalConquistas = conquistas.desbloqueadas.length + conquistas.emProgresso.length;

  const getDificuldadeColor = (dificuldade: string) => {
    const colors = {
      facil: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      dificil: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      lendario: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[dificuldade as keyof typeof colors] || colors.facil;
  };

  const conquistasFiltradas = () => {
    if (filtro === 'desbloqueadas') return { desbloqueadas: conquistas.desbloqueadas, emProgresso: [] };
    if (filtro === 'bloqueadas') return { desbloqueadas: [], emProgresso: conquistas.emProgresso };
    return conquistas;
  };

  const dados = conquistasFiltradas();

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">Desbloqueadas</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {conquistas.desbloqueadas.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <Lock className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">Em Progresso</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {conquistas.emProgresso.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3">
            <Award className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-300">Progresso Total</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {Math.round((conquistas.desbloqueadas.length / totalConquistas) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <div className="flex gap-2">
          {(['todas', 'desbloqueadas', 'bloqueadas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Conquistas Desbloqueadas */}
      {dados.desbloqueadas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Desbloqueadas ({dados.desbloqueadas.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dados.desbloqueadas.map((conquista) => (
              <div
                key={conquista.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{conquista.icone}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {conquista.nome}
                      </h4>
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {conquista.descricao}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Desbloqueado em: {conquista.desbloqueadaEm}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDificuldadeColor(conquista.dificuldade)}`}>
                        {conquista.dificuldade}
                      </span>
                    </div>
                    {conquista.vezes && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                        🏆 Desbloqueado {conquista.vezes}x
                      </p>
                    )}
                    {conquista.recordePessoal && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
                        🔥 Atual: {conquista.sequenciaAtual} dias consecutivos! (Recorde pessoal)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conquistas em Progresso */}
      {dados.emProgresso.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-600" />
            Em Progresso ({dados.emProgresso.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dados.emProgresso.map((conquista) => (
              <div
                key={conquista.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl opacity-50">{conquista.icone}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {conquista.nome}
                      </h4>
                      <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {conquista.descricao}
                    </p>
                    
                    {/* Barra de Progresso */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {conquista.progresso}/{conquista.meta}
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {conquista.porcentagem}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${conquista.porcentagem}%` }}
                        />
                      </div>
                    </div>

                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDificuldadeColor(conquista.dificuldade)}`}>
                      {conquista.dificuldade}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivação */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
          🎯 <strong>Continue assim!</strong> Você já desbloqueou {conquistas.desbloqueadas.length} de {totalConquistas} conquistas. 
          Faltam apenas {conquistas.emProgresso.length} para completar todas!
        </p>
      </div>
    </div>
  );
}