import { useState, useEffect, useCallback } from 'react';
import {
  alunosService,
  professoresService,
  planosService,
  unidadesService,
  produtosService,
} from '@/services';
import type { Aluno, Professor, Plano, Unidade, Produto } from '@/types';

export const useSupabaseData = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        alunosData,
        professoresData,
        planosData,
        unidadesData,
        produtosData,
      ] = await Promise.all([
        alunosService.getAll().catch(() => []),
        professoresService.getAll().catch(() => []),
        planosService.getAll().catch(() => []),
        unidadesService.getAll().catch(() => []),
        produtosService.getAll().catch(() => []),
      ]);

      setAlunos(alunosData);
      setProfessores(professoresData);
      setPlanos(planosData);
      setUnidades(unidadesData);
      setProdutos(produtosData);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar dados do Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    alunos,
    professores,
    planos,
    unidades,
    produtos,
    loading,
    error,
    reload: loadData,
    setAlunos,
    setProfessores,
    setPlanos,
    setUnidades,
    setProdutos,
  };
};
