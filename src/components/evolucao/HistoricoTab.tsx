// src/components/evolucao/HistoricoTab.tsx
import React, { useState } from 'react';
import { Star, Filter, Download, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/common';

export const HistoricoTab: React.FC = () => {
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todos');
  const [periodoFilter, setPeriodoFilter] = useState<string>('30');

  // Mock data - em produção viria do backend
  const treinos = [
    {
      id: 1,
      data: '02/07/2025',
      nome: 'Treino Técnico Avançado',
      tipo: 'tecnico',
      professor: 'Lucas Ferreira',
      duracao: 60,
      nota: 5,
      foco: 'Saque e recepção',
      observacoes: 'Excelente evolução no saque em suspensão',
      pontosFracos: ['Recepção de bola forte'],
      pontosFortes: ['Saque', 'Posicionamento']
    },
    {
      id: 2,
      data: '28/06/2025',
      nome: 'Treino Tático',
      tipo: 'tatico',
      professor: 'Carlos Mendes',
      duracao: 90,
      nota: 4,
      foco: 'Posicionamento em dupla',
      observacoes: 'Boa comunicação com parceiro',
      pontosFracos: ['Cobertura de área'],
      pontosFortes: ['Comunicação', 'Leitura de jogo'],
      temPrancheta: true
    },
    {
      id: 3,
      data: '25/06/2025',
      nome: 'Jogo Livre',
      tipo: 'jogo',
      professor: null,
      duracao: 45,
      nota: 3,
      foco: 'Prática geral',
      observacoes: 'Preciso melhorar bloqueio',
      pontosFracos: ['Bloqueio', 'Timing'],
      pontosFortes: ['Ataque']
    },
    {
      id: 4,
      data: '23/06/2025',
      nome: 'Condicionamento Físico',
      tipo: 'fisico',
      professor: 'Ana Paula Costa',
      duracao: 60,
      nota: 5,
      foco: 'Resistência e agilidade',
      observacoes: 'Ótimo desempenho nos exercícios',
      pontosFracos: [],
      pontosFortes: ['Resistência', 'Força']
    },
    {
      id: 5,
      data: '20/06/2025',
      nome: 'Fundamentos Técnicos',
      tipo: 'tecnico',
      professor: 'Lucas Ferreira',
      duracao: 75,
      nota: 4,
      foco: 'Manchete e toque',
      observacoes: 'Melhorou muito a manchete',
      pontosFracos: ['Toque de costas'],
      pontosFortes: ['Manchete', 'Deslocamento']
    }
  ];

  const getTipoColor = (tipo: string) => {
    const colors = {
      tecnico: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      tatico: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      fisico: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      jogo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[tipo as keyof typeof colors] || colors.tecnico;
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      tecnico: 'Técnico',
      tatico: 'Tático',
      fisico: 'Físico',
      jogo: 'Jogo'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const renderStars = (nota: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= nota 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const treinosFiltrados = treinos.filter((treino) => {
    if (categoriaFilter !== 'todos' && treino.tipo !== categoriaFilter) return false;
    // Filtro de período seria implementado com datas reais
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filtros e Exportar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="tecnico">Técnico</option>
              <option value="tatico">Tático</option>
              <option value="fisico">Físico</option>
              <option value="jogo">Jogo</option>
            </select>
          </div>

          <select
            value={periodoFilter}
            onChange={(e) => setPeriodoFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 3 meses</option>
            <option value="365">Último ano</option>
            <option value="all">Todo período</option>
          </select>
        </div>

        <Button variant="secondary" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">Total de Treinos</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {treinosFiltrados.length}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-800 dark:text-purple-300 mb-1">Avaliação Média</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {(treinosFiltrados.reduce((acc, t) => acc + t.nota, 0) / treinosFiltrados.length).toFixed(1)}
            </p>
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-300 mb-1">Horas Totais</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {Math.floor(treinosFiltrados.reduce((acc, t) => acc + t.duracao, 0) / 60)}h
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-1">Última Avaliação</p>
          <div className="flex items-center gap-1">
            {renderStars(treinosFiltrados[0]?.nota || 0)}
          </div>
        </div>
      </div>

      {/* Lista de Treinos */}
      <div className="space-y-4">
        {treinosFiltrados.map((treino) => (
          <div
            key={treino.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {treino.nome}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTipoColor(treino.tipo)}`}>
                    {getTipoLabel(treino.tipo)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {treino.data}
                  </span>
                  {treino.professor && (
                    <span>Prof. {treino.professor}</span>
                  )}
                  <span>{treino.duracao}min</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {renderStars(treino.nota)}
                <span className="text-xs text-gray-500">
                  {treino.nota === 5 ? 'Excelente' : treino.nota === 4 ? 'Muito bom' : treino.nota === 3 ? 'Regular' : 'Abaixo do esperado'}
                </span>
              </div>
            </div>

            {/* Foco */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Foco:</strong> {treino.foco}
              </p>
            </div>

            {/* Pontos Fortes e Fracos */}
            {(treino.pontosFortes.length > 0 || treino.pontosFracos.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {treino.pontosFortes.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                      ✅ Pontos Fortes
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      {treino.pontosFortes.map((ponto, index) => (
                        <li key={index}>• {ponto}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {treino.pontosFracos.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">
                      ⚠️ Pontos a Melhorar
                    </p>
                    <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                      {treino.pontosFracos.map((ponto, index) => (
                        <li key={index}>• {ponto}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Observações */}
            {treino.observacoes && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Observações:</strong> {treino.observacoes}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <Eye className="h-4 w-4" />
                Ver Detalhes
              </button>
              {treino.temPrancheta && (
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                  📋 Ver Prancheta Tática
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Carregar Mais */}
      <div className="text-center">
        <Button variant="secondary" className="w-full sm:w-auto">
          Carregar Mais Treinos
        </Button>
      </div>
    </div>
  );
};