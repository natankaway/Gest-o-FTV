// src/components/evolucao/ProgressoGeralTab.tsx
import React from 'react';
import { Star, TrendingUp, Calendar } from 'lucide-react';
import { useAppState } from '@/contexts';

export const ProgressoGeralTab: React.FC = () => {
  const { userLogado } = useAppState();

  // Mock data - em produção viria do backend baseado no userLogado.id
  const progresso = {
    nivelAtual: 'intermediario' as const,
    progressoPorcentagem: 80,
    treinosRestantes: 4,
    proximoNivel: 'avancado' as const,
    tempoNivelAtual: 4, // meses
    inicioNivelAtual: '01/03/2024',
    historicoNiveis: [
      { nivel: 'iniciante', inicio: 'Jan/24', fim: 'Mar/24', duracaoMeses: 2 },
      { nivel: 'intermediario', inicio: 'Mar/24', fim: null, duracaoMeses: 4 },
      { nivel: 'avancado', inicio: 'Jul/24', fim: null, duracaoMeses: 0, projetado: true }
    ]
  };

  const getNivelStars = (nivel: string) => {
    const stars = {
      'iniciante': 1,
      'intermediario': 2,
      'avancado': 3
    };
    return stars[nivel as keyof typeof stars] || 1;
  };

  const getNivelColor = (nivel: string) => {
    const colors = {
      'iniciante': 'text-green-600',
      'intermediario': 'text-yellow-600',
      'avancado': 'text-red-600'
    };
    return colors[nivel as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Progresso Geral */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Progresso Geral
        </h2>

        {/* Nível Atual */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nível Atual</p>
              <div className="flex items-center gap-2">
                <h3 className={`text-2xl font-bold capitalize ${getNivelColor(progresso.nivelAtual)}`}>
                  {progresso.nivelAtual}
                </h3>
                <div className="flex gap-1">
                  {Array.from({ length: getNivelStars(progresso.nivelAtual) }).map((_, i) => (
                    <Star key={i} className={`h-6 w-6 fill-current ${getNivelColor(progresso.nivelAtual)}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tempo neste nível</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {progresso.tempoNivelAtual} meses
              </p>
              <p className="text-xs text-gray-500">Desde: {progresso.inicioNivelAtual}</p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progresso para {progresso.proximoNivel}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{progresso.progressoPorcentagem}%</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progresso.progressoPorcentagem}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Faltam <span className="font-bold text-gray-900 dark:text-white">{progresso.treinosRestantes} treinos</span> para {progresso.proximoNivel}
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: getNivelStars(progresso.proximoNivel) }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 fill-current ${getNivelColor(progresso.proximoNivel)}`} />
                ))}
              </div>
            </p>
          </div>
        </div>

        {/* Linha do Tempo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Linha do Tempo</h3>
          </div>

          <div className="relative">
            {/* Timeline */}
            <div className="flex items-center justify-between mb-8">
              {progresso.historicoNiveis.map((item, index) => (
                <div key={index} className="flex flex-col items-center relative flex-1">
                  {/* Connector Line */}
                  {index < progresso.historicoNiveis.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                      item.projetado ? 'border-t-2 border-dashed border-gray-300' : 'bg-blue-500'
                    }`} style={{ transform: 'translateY(-50%)' }} />
                  )}

                  {/* Icon */}
                  <div className={`z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                    item.projetado 
                      ? 'bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg'
                  }`}>
                    <div className="flex gap-0.5">
                      {Array.from({ length: getNivelStars(item.nivel) }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 fill-current ${
                            item.projetado ? 'text-gray-400' : 'text-white'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-xs font-medium mb-1 capitalize ${
                      item.projetado ? 'text-gray-500' : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.nivel}
                      {item.projetado && ' (projetado)'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.inicio}
                      {item.fim && ` → ${item.fim}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      ({item.duracaoMeses} {item.duracaoMeses === 1 ? 'mês' : 'meses'})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dicas para Evoluir */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center gap-2">
          💡 Dicas para Evoluir Mais Rápido
        </h4>
        <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
          <li>• Mantenha frequência de 80%+ nas aulas</li>
          <li>• Participe de pelo menos 1 torneio por mês</li>
          <li>• Treine com parceiros de nível superior</li>
          <li>• Assista aos vídeos técnicos disponíveis</li>
          <li>• Faça auto-avaliação após cada treino</li>
        </ul>
      </div>
    </div>
  );
};