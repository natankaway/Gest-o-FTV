// src/components/evolucao/ComparacaoTab.tsx
import React from 'react';
import { Users, TrendingUp, Clock, Award, Trophy } from 'lucide-react';

export const ComparacaoTab: React.FC = () => {
  // Mock data - em produção viria do backend
  const comparacao = {
    nivelAtual: 'Intermediário',
    totalAlunosNivel: 45,
    frequencia: {
      voce: 85,
      media: 72,
      top10: 90
    },
    horasMes: {
      voce: 24,
      media: 18,
      top10: 28
    },
    evolucaoNivel: {
      voce: 4, // meses
      media: 6
    },
    posicaoRanking: 8,
    totalAlunos: 45
  };

  const getPercentilPosition = () => {
    const percentil = ((comparacao.totalAlunos - comparacao.posicaoRanking) / comparacao.totalAlunos) * 100;
    return Math.round(percentil);
  };

  const MetricCard = ({ 
    titulo, 
    icon: Icon, 
    voce, 
    media, 
    top10, 
    unidade,
    melhor = true 
  }: { 
    titulo: string;
    icon: any;
    voce: number;
    media: number;
    top10: number;
    unidade: string;
    melhor?: boolean;
  }) => {
    const acimaDaMedia = melhor ? voce > media : voce < media;
    const noTop = melhor ? voce >= top10 : voce <= top10;
    const diffMedia = Math.abs(voce - media);
    const percentualMedia = Math.round((diffMedia / media) * 100);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{titulo}</h3>
        </div>

        {/* Barras de Comparação */}
        <div className="space-y-4 mb-6">
          {/* Você */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Você</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {voce}{unidade}
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(voce / top10) * 100}%` }}
              />
            </div>
          </div>

          {/* Média */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Média do nível</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {media}{unidade}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 rounded-full transition-all duration-500"
                style={{ width: `${(media / top10) * 100}%` }}
              />
            </div>
          </div>

          {/* Top 10% */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Top 10%</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {top10}{unidade}+
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={`rounded-lg p-4 ${
          noTop 
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            : acimaDaMedia
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <p className={`text-sm font-medium ${
            noTop 
              ? 'text-yellow-800 dark:text-yellow-300'
              : acimaDaMedia
              ? 'text-green-800 dark:text-green-300'
              : 'text-blue-800 dark:text-blue-300'
          }`}>
            {noTop && '🔥 Você está no top 10%!'}
            {!noTop && acimaDaMedia && `🎉 Você está ${percentualMedia}% acima da média!`}
            {!noTop && !acimaDaMedia && `💪 Continue treinando para alcançar a média!`}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Informativo */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Users className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">Como Você se Compara</h2>
            <p className="text-blue-100">
              Comparação com {comparacao.totalAlunosNivel} alunos do nível {comparacao.nivelAtual}
            </p>
          </div>
        </div>
      </div>

      {/* Ranking Geral */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-300 dark:border-yellow-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-400 dark:bg-yellow-600 rounded-full">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-1">Sua Posição no Ranking</p>
              <p className="text-4xl font-bold text-yellow-900 dark:text-yellow-100">
                #{comparacao.posicaoRanking}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                de {comparacao.totalAlunos} alunos
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-1">Percentil</p>
            <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
              Top {100 - getPercentilPosition()}%
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Melhor que {getPercentilPosition()}% dos alunos
            </p>
          </div>
        </div>
      </div>

      {/* Métricas de Comparação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard
          titulo="Frequência"
          icon={TrendingUp}
          voce={comparacao.frequencia.voce}
          media={comparacao.frequencia.media}
          top10={comparacao.frequencia.top10}
          unidade="%"
        />

        <MetricCard
          titulo="Horas de Treino (mês)"
          icon={Clock}
          voce={comparacao.horasMes.voce}
          media={comparacao.horasMes.media}
          top10={comparacao.horasMes.top10}
          unidade="h"
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evolução de Nível</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tempo no nível atual</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {comparacao.evolucaoNivel.voce}
                </span>
                <span className="text-lg text-gray-600 dark:text-gray-400">meses</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Média do CT</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-gray-400">
                  {comparacao.evolucaoNivel.media}
                </span>
                <span className="text-lg text-gray-600 dark:text-gray-400">meses</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              ⚡ Você está progredindo {comparacao.evolucaoNivel.media - comparacao.evolucaoNivel.voce} meses mais rápido que a média!
            </p>
          </div>
        </div>
      </div>

      {/* Dicas para Melhorar */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Como Alcançar o Top 10%
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <li>• Aumente sua frequência para {comparacao.frequencia.top10}% ou mais</li>
          <li>• Treine pelo menos {comparacao.horasMes.top10}h por mês</li>
          <li>• Participe de torneios regularmente</li>
          <li>• Faça auto-avaliação após cada treino</li>
          <li>• Mantenha consistência e evite faltas</li>
        </ul>
      </div>
    </div>
  );
};