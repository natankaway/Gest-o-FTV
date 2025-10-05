// src/components/perfil/InformacoesTreinoTab.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { Target, Trophy, Clock, Calendar } from 'lucide-react';

interface TreinoPreferencias {
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  objetivo: string;
  posicaoPreferida: ('defesa' | 'ataque' | 'ambas')[];
  disponibilidade: {
    periodos: ('manha' | 'tarde' | 'noite')[];
    dias: ('segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo')[];
  };
}

export const InformacoesTreinoTab: React.FC = () => {
  const { userLogado, dadosMockados, setAlunos } = useAppState();
  const { addNotification } = useNotifications();

  const alunoAtual = useMemo(() => {
    if (!userLogado || userLogado.perfil !== 'aluno') return null;
    return dadosMockados.alunos.find(a => a.id === userLogado.id);
  }, [userLogado, dadosMockados.alunos]);

  const [preferencias, setPreferencias] = useState<TreinoPreferencias>({
    nivel: alunoAtual?.nivel || 'iniciante',
    objetivo: alunoAtual?.objetivo || 'Lazer',
    posicaoPreferida: ['ataque'],
    disponibilidade: {
      periodos: ['manha', 'tarde', 'noite'],
      dias: ['segunda', 'terca', 'quinta']
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = useCallback(() => {
    if (!alunoAtual) return;

    setAlunos(prev => prev.map(aluno => 
      aluno.id === alunoAtual.id
        ? {
            ...aluno,
            nivel: preferencias.nivel,
            objetivo: preferencias.objetivo
          }
        : aluno
    ));

    setIsEditing(false);

    addNotification({
      type: 'success',
      title: 'Preferências salvas',
      message: 'Suas preferências de treino foram atualizadas!'
    });
  }, [alunoAtual, preferencias, setAlunos, addNotification]);

  const handleCancel = useCallback(() => {
    if (!alunoAtual) return;

    setPreferencias({
      nivel: alunoAtual.nivel,
      objetivo: alunoAtual.objetivo,
      posicaoPreferida: ['ataque'],
      disponibilidade: {
        periodos: ['manha', 'tarde', 'noite'],
        dias: ['segunda', 'terca', 'quinta']
      }
    });

    setIsEditing(false);
  }, [alunoAtual]);

  const togglePosicao = useCallback((posicao: 'defesa' | 'ataque' | 'ambas') => {
    setPreferencias(prev => ({
      ...prev,
      posicaoPreferida: prev.posicaoPreferida.includes(posicao)
        ? prev.posicaoPreferida.filter(p => p !== posicao)
        : [...prev.posicaoPreferida, posicao]
    }));
  }, []);

  const togglePeriodo = useCallback((periodo: 'manha' | 'tarde' | 'noite') => {
    setPreferencias(prev => ({
      ...prev,
      disponibilidade: {
        ...prev.disponibilidade,
        periodos: prev.disponibilidade.periodos.includes(periodo)
          ? prev.disponibilidade.periodos.filter(p => p !== periodo)
          : [...prev.disponibilidade.periodos, periodo]
      }
    }));
  }, []);

  const toggleDia = useCallback((dia: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo') => {
    setPreferencias(prev => ({
      ...prev,
      disponibilidade: {
        ...prev.disponibilidade,
        dias: prev.disponibilidade.dias.includes(dia)
          ? prev.disponibilidade.dias.filter(d => d !== dia)
          : [...prev.disponibilidade.dias, dia]
      }
    }));
  }, []);

  if (!alunoAtual) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Erro ao carregar preferências
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Preferências de Treino
        </h3>
        {!isEditing && (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </div>

      {/* Nível Atual */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nível Atual
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['iniciante', 'intermediario', 'avancado'] as const).map((nivel) => (
            <button
              key={nivel}
              onClick={() => isEditing && setPreferencias(prev => ({ ...prev, nivel }))}
              disabled={!isEditing}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                preferencias.nivel === nivel
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${!isEditing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            >
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {nivel === 'iniciante' ? '⭐ Iniciante' : nivel === 'intermediario' ? '⭐⭐ Intermediário' : '⭐⭐⭐ Avançado'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Objetivo Principal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Objetivo Principal
          </label>
        </div>

        <select
          value={preferencias.objetivo}
          onChange={(e) => setPreferencias(prev => ({ ...prev, objetivo: e.target.value }))}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-75"
        >
          <option value="Lazer">🏖️ Lazer e Diversão</option>
          <option value="Fitness">💪 Condicionamento Físico</option>
          <option value="Competição">🏆 Competições</option>
          <option value="Profissional">🌟 Profissionalização</option>
        </select>
      </div>

      {/* Posição Preferida */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Posição Preferida
        </label>

        <div className="flex gap-3">
          {(['defesa', 'ataque', 'ambas'] as const).map((posicao) => (
            <label
              key={posicao}
              className={`flex-1 cursor-pointer ${!isEditing ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={preferencias.posicaoPreferida.includes(posicao)}
                onChange={() => isEditing && togglePosicao(posicao)}
                disabled={!isEditing}
                className="sr-only"
              />
              <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                preferencias.posicaoPreferida.includes(posicao)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {posicao === 'defesa' ? '🛡️ Defesa' : posicao === 'ataque' ? '⚡ Ataque' : '🔄 Ambas'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Disponibilidade de Horários */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Disponibilidade de Horários
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {([
            { id: 'manha', label: '🌅 Manhã', desc: '6h-12h' },
            { id: 'tarde', label: '☀️ Tarde', desc: '12h-18h' },
            { id: 'noite', label: '🌙 Noite', desc: '18h-22h' }
          ] as const).map((periodo) => (
            <label
              key={periodo.id}
              className={`cursor-pointer ${!isEditing ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={preferencias.disponibilidade.periodos.includes(periodo.id)}
                onChange={() => isEditing && togglePeriodo(periodo.id)}
                disabled={!isEditing}
                className="sr-only"
              />
              <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                preferencias.disponibilidade.periodos.includes(periodo.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{periodo.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{periodo.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Dias Preferidos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Dias Preferidos
          </label>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {([
            { id: 'segunda', label: 'Seg' },
            { id: 'terca', label: 'Ter' },
            { id: 'quarta', label: 'Qua' },
            { id: 'quinta', label: 'Qui' },
            { id: 'sexta', label: 'Sex' },
            { id: 'sabado', label: 'Sáb' },
            { id: 'domingo', label: 'Dom' }
          ] as const).map((dia) => (
            <label
              key={dia.id}
              className={`cursor-pointer ${!isEditing ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={preferencias.disponibilidade.dias.includes(dia.id)}
                onChange={() => isEditing && toggleDia(dia.id)}
                disabled={!isEditing}
                className="sr-only"
              />
              <div className={`p-2 rounded-lg border-2 text-center transition-all ${
                preferencias.disponibilidade.dias.includes(dia.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{dia.label}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Botões de Ação */}
      {isEditing && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Preferências
          </Button>
        </div>
      )}
    </div>
  );
};