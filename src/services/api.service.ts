import { supabase } from '@/lib/supabase';
import type {
  Aluno, Professor, Gestor, Plano, Produto,
  Presenca, Agendamento, AulaExperimental,
  Treino, Exercicio, RegistroFinanceiro,
  Unidade, Plataforma, Aluguel, Meta, MetaGeral,
  Torneio, Horario, HorarioFixo, AulaoConfigMelhorado,
  RegistroHorasProfessor, NivelAula
} from '@/types';

export const alunosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('alunos')
      .select(`
        *,
        usuario:usuarios!alunos_usuario_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(aluno => ({
      id: aluno.id,
      nome: aluno.usuario.nome,
      telefone: aluno.usuario.telefone,
      email: aluno.usuario.email,
      senha: '',
      ativo: aluno.usuario.ativo,
      profileImage: aluno.usuario.profile_image,
      tipoPlano: aluno.tipo_plano,
      planoId: aluno.plano_id,
      plataformaParceira: aluno.plataforma_parceira,
      unidade: aluno.unidade,
      status: aluno.status,
      vencimento: aluno.vencimento || '',
      nivel: aluno.nivel,
      dataMatricula: aluno.data_matricula,
      objetivo: aluno.objetivo || '',
      nomesCheckIn: aluno.nomes_checkin,
    })) as Aluno[];
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('alunos')
      .select(`
        *,
        usuario:usuarios!alunos_usuario_id_fkey(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      nome: data.usuario.nome,
      telefone: data.usuario.telefone,
      email: data.usuario.email,
      senha: '',
      ativo: data.usuario.ativo,
      profileImage: data.usuario.profile_image,
      tipoPlano: data.tipo_plano,
      planoId: data.plano_id,
      plataformaParceira: data.plataforma_parceira,
      unidade: data.unidade,
      status: data.status,
      vencimento: data.vencimento || '',
      nivel: data.nivel,
      dataMatricula: data.data_matricula,
      objetivo: data.objetivo || '',
      nomesCheckIn: data.nomes_checkin,
    } as Aluno;
  },

  async create(aluno: Omit<Aluno, 'id'>) {
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        nome: aluno.nome,
        telefone: aluno.telefone,
        email: aluno.email,
        perfil: 'aluno',
        ativo: aluno.ativo ?? true,
        profile_image: aluno.profileImage,
      })
      .select()
      .single();

    if (usuarioError) throw usuarioError;

    const { data, error } = await supabase
      .from('alunos')
      .insert({
        usuario_id: usuario.id,
        tipo_plano: aluno.tipoPlano,
        plano_id: aluno.planoId,
        plataforma_parceira: aluno.plataformaParceira,
        unidade: aluno.unidade,
        status: aluno.status,
        vencimento: aluno.vencimento,
        nivel: aluno.nivel,
        data_matricula: aluno.dataMatricula,
        objetivo: aluno.objetivo,
        nomes_checkin: aluno.nomesCheckIn || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, aluno: Partial<Aluno>) {
    const alunoAtual = await this.getById(id);
    if (!alunoAtual) throw new Error('Aluno não encontrado');

    const { data: alunoData } = await supabase
      .from('alunos')
      .select('usuario_id')
      .eq('id', id)
      .single();

    if (alunoData) {
      await supabase
        .from('usuarios')
        .update({
          nome: aluno.nome,
          telefone: aluno.telefone,
          email: aluno.email,
          ativo: aluno.ativo,
          profile_image: aluno.profileImage,
        })
        .eq('id', alunoData.usuario_id);
    }

    const { data, error } = await supabase
      .from('alunos')
      .update({
        tipo_plano: aluno.tipoPlano,
        plano_id: aluno.planoId,
        plataforma_parceira: aluno.plataformaParceira,
        unidade: aluno.unidade,
        status: aluno.status,
        vencimento: aluno.vencimento,
        nivel: aluno.nivel,
        data_matricula: aluno.dataMatricula,
        objetivo: aluno.objetivo,
        nomes_checkin: aluno.nomesCheckIn,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { data: alunoData } = await supabase
      .from('alunos')
      .select('usuario_id')
      .eq('id', id)
      .single();

    if (alunoData) {
      await supabase
        .from('usuarios')
        .delete()
        .eq('id', alunoData.usuario_id);
    }
  },
};

export const professoresService = {
  async getAll() {
    const { data, error } = await supabase
      .from('professores')
      .select(`
        *,
        usuario:usuarios!professores_usuario_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(professor => ({
      id: professor.id,
      nome: professor.usuario.nome,
      telefone: professor.usuario.telefone,
      email: professor.usuario.email,
      senha: '',
      ativo: professor.usuario.ativo,
      tipoPagamento: professor.tipo_pagamento,
      valorFixo: professor.valor_fixo,
      valorHoraFixa: professor.valor_hora_fixa,
      valoresHoras: professor.valores_horas as any,
      valorAulao: professor.valor_aulao,
      especialidades: professor.especialidades,
      experiencia: professor.experiencia,
      unidades: professor.unidades,
      unidadePrincipal: professor.unidade_principal,
      observacoes: professor.observacoes,
    })) as Professor[];
  },

  async create(professor: Omit<Professor, 'id'>) {
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        nome: professor.nome,
        telefone: professor.telefone,
        email: professor.email,
        perfil: 'professor',
        ativo: professor.ativo ?? true,
      })
      .select()
      .single();

    if (usuarioError) throw usuarioError;

    const { data, error } = await supabase
      .from('professores')
      .insert({
        usuario_id: usuario.id,
        tipo_pagamento: professor.tipoPagamento,
        valor_fixo: professor.valorFixo,
        valor_hora_fixa: professor.valorHoraFixa,
        valores_horas: professor.valoresHoras as any,
        valor_aulao: professor.valorAulao,
        especialidades: professor.especialidades,
        experiencia: professor.experiencia,
        unidades: professor.unidades,
        unidade_principal: professor.unidadePrincipal,
        observacoes: professor.observacoes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, professor: Partial<Professor>) {
    const { data: professorData } = await supabase
      .from('professores')
      .select('usuario_id')
      .eq('id', id)
      .single();

    if (professorData) {
      await supabase
        .from('usuarios')
        .update({
          nome: professor.nome,
          telefone: professor.telefone,
          email: professor.email,
          ativo: professor.ativo,
        })
        .eq('id', professorData.usuario_id);
    }

    const { data, error } = await supabase
      .from('professores')
      .update({
        tipo_pagamento: professor.tipoPagamento,
        valor_fixo: professor.valorFixo,
        valor_hora_fixa: professor.valorHoraFixa,
        valores_horas: professor.valoresHoras as any,
        valor_aulao: professor.valorAulao,
        especialidades: professor.especialidades,
        experiencia: professor.experiencia,
        unidades: professor.unidades,
        unidade_principal: professor.unidadePrincipal,
        observacoes: professor.observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { data: professorData } = await supabase
      .from('professores')
      .select('usuario_id')
      .eq('id', id)
      .single();

    if (professorData) {
      await supabase
        .from('usuarios')
        .delete()
        .eq('id', professorData.usuario_id);
    }
  },
};

export const planosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(plano => ({
      id: plano.id,
      nome: plano.nome,
      preco: plano.preco,
      unidade: plano.unidade,
      descricao: plano.descricao,
      beneficios: plano.beneficios,
    })) as Plano[];
  },

  async create(plano: Omit<Plano, 'id'>) {
    const { data, error } = await supabase
      .from('planos')
      .insert({
        nome: plano.nome,
        preco: plano.preco,
        unidade: plano.unidade,
        descricao: plano.descricao,
        beneficios: plano.beneficios || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, plano: Partial<Plano>) {
    const { data, error } = await supabase
      .from('planos')
      .update({
        nome: plano.nome,
        preco: plano.preco,
        unidade: plano.unidade,
        descricao: plano.descricao,
        beneficios: plano.beneficios,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('planos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const unidadesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(unidade => ({
      id: unidade.id,
      nome: unidade.nome,
      endereco: unidade.endereco,
      telefone: unidade.telefone,
      email: unidade.email,
      gestorId: unidade.gestor_id,
      ativa: unidade.ativa,
      socios: unidade.socios as any,
      configuracoes: unidade.configuracoes as any,
    })) as Unidade[];
  },

  async create(unidade: Omit<Unidade, 'id'>) {
    const { data, error } = await supabase
      .from('unidades')
      .insert({
        nome: unidade.nome,
        endereco: unidade.endereco,
        telefone: unidade.telefone,
        email: unidade.email,
        gestor_id: unidade.gestorId,
        ativa: unidade.ativa,
        socios: unidade.socios as any,
        configuracoes: unidade.configuracoes as any,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, unidade: Partial<Unidade>) {
    const { data, error } = await supabase
      .from('unidades')
      .update({
        nome: unidade.nome,
        endereco: unidade.endereco,
        telefone: unidade.telefone,
        email: unidade.email,
        gestor_id: unidade.gestorId,
        ativa: unidade.ativa,
        socios: unidade.socios as any,
        configuracoes: unidade.configuracoes as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('unidades')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const produtosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(produto => ({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      precoCusto: produto.preco_custo,
      categoria: produto.categoria,
      estoque: produto.estoque,
      estoqueMinimo: produto.estoque_minimo,
      descricao: produto.descricao,
      marca: produto.marca,
      fornecedor: produto.fornecedor,
      codigoBarras: produto.codigo_barras,
      unidade: produto.unidade,
      ativo: produto.ativo,
      imagem: produto.imagem,
    })) as Produto[];
  },

  async create(produto: Omit<Produto, 'id'>) {
    const { data, error } = await supabase
      .from('produtos')
      .insert({
        nome: produto.nome,
        preco: produto.preco,
        preco_custo: produto.precoCusto,
        categoria: produto.categoria,
        estoque: produto.estoque,
        estoque_minimo: produto.estoqueMinimo,
        descricao: produto.descricao,
        marca: produto.marca,
        fornecedor: produto.fornecedor,
        codigo_barras: produto.codigoBarras,
        unidade: produto.unidade,
        ativo: produto.ativo ?? true,
        imagem: produto.imagem,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, produto: Partial<Produto>) {
    const { data, error } = await supabase
      .from('produtos')
      .update({
        nome: produto.nome,
        preco: produto.preco,
        preco_custo: produto.precoCusto,
        categoria: produto.categoria,
        estoque: produto.estoque,
        estoque_minimo: produto.estoqueMinimo,
        descricao: produto.descricao,
        marca: produto.marca,
        fornecedor: produto.fornecedor,
        codigo_barras: produto.codigoBarras,
        unidade: produto.unidade,
        ativo: produto.ativo,
        imagem: produto.imagem,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
