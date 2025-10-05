// src/components/evolucao/EstatisticasTab.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Clock, Award } from 'lucide-react';

export const EstatisticasTab: React.FC = () => {
  // Mock data - em produção viria do backend
  const estatisticas = {
    frequencia6Meses: [
      { mes: 'Jan', valor: 65, media: 72 },
      { mes: 'Fev', valor: 78, media: 72 },
      { mes: 'Mar', valor: 85, media: 72 },
      { mes: 'Abr', valor: 92, media: 72 },
      { mes: 'Mai', valor: 88, media: 72 },
      { mes: 'Jun', valor: 95, media: 72 },
    ],
    frequenciaAtual: 85,
    mediaFrequenciaCT: 72,
    treinosPorCategoria: [
      { categoria: 'Técnico', total: 12, porcentagem: 60, cor: '#3B82F6' },
      { categoria: 'Tático', total: 5, porcentagem: 25, cor: '#8B5CF6' },
      { categoria: 'Físico', total: 2, porcentagem: 10, cor: '#10B981' },
      { categoria: 'Jogo', total: 1, porcentagem: 5, cor: '#F59E0B' },
    ],
    horas: {
      mes: 24,
      ano: 156,
      total: 298
    }
  };

  return (
    <div className="space-y-6">
      {/* Frequência */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Frequência (Últimos 6 meses)
        </h3>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={estatisticas.frequencia6Meses}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="mes" 
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                className="text-xs text-gray-600 dark:text-gray-400"
                label={{ value: '%', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Sua frequência"
                dot={{ r: 6, fill: '#3B82F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="media" 
                stroke="#9CA3AF" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Média do CT"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Sua média: </span>
            <span className="font-bold text-blue-600">{estatisticas.frequenciaAtual}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-gray-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Média do CT: </span>
            <span className="font-bold text-gray-600">{estatisticas.mediaFrequenciaCT}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold">
              +{estatisticas.frequenciaAtual - estatisticas.mediaFrequenciaCT}% 🔥
            </span>
          </div>
        </div>
      </div>

      {/* Treinos por Categoria */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Award className="h-6 w-6 text-purple-600" />
          Treinos por Categoria (Este Mês)
        </h3>

        <div className="space-y-4">
          {estatisticas.treinosPorCategoria.map((cat) => (
            <div key={cat.categoria}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {cat.categoria}:
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {cat.total} treinos
                  </span>
                  <span className="font-bold" style={{ color: cat.cor }}>
                    {cat.porcentagem}%
                  </span>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${cat.porcentagem}%`,
                    backgroundColor: cat.cor
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Dica:</strong> Para uma evolução equilibrada, recomendamos 50% técnico, 30% tático, 15% físico e 5% jogo.
          </p>
        </div>
      </div>

      {/* Total de Horas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300">Este Mês</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {estatisticas.horas.mes}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-300">Este Ano</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {estatisticas.horas.ano}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-300">Total</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {estatisticas.horas.total}h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};