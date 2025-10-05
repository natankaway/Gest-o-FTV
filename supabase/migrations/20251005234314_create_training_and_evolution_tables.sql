/*
  # Criação das Tabelas de Treinos e Evolução

  1. Novas Tabelas
    - `exercicios` - Biblioteca de exercícios
    - `treinos` - Treinos planejados
    - `conquistas` - Conquistas dos alunos
    - `objetivos_pessoais` - Objetivos pessoais dos alunos
    - `auto_avaliacoes` - Auto avaliações de treinos
    - `estatisticas_alunos` - Estatísticas e métricas dos alunos
    - `metas` - Metas do CT
    - `metas_gerais` - Metas gerais do negócio

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em perfil e ownership
*/

-- Tabela de Exercícios
CREATE TABLE IF NOT EXISTS exercicios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  duracao INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('aquecimento', 'tecnica', 'tatica', 'fisico', 'finalizacao')),
  equipamentos TEXT[] DEFAULT '{}',
  nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Treinos
CREATE TABLE IF NOT EXISTS treinos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('tecnico', 'fisico', 'tatico', 'jogo')),
  nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  duracao INTEGER NOT NULL,
  objetivo TEXT NOT NULL,
  equipamentos TEXT[] DEFAULT '{}',
  exercicios JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  professor_id BIGINT REFERENCES professores(id) ON DELETE SET NULL NOT NULL,
  unidade TEXT NOT NULL,
  data TEXT,
  status TEXT CHECK (status IN ('planejado', 'em-andamento', 'concluido')) DEFAULT 'planejado',
  prancheta_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Conquistas
CREATE TABLE IF NOT EXISTS conquistas (
  id TEXT PRIMARY KEY,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('sequencia', 'frequencia', 'treinos', 'torneios', 'social', 'especial')),
  criterio JSONB NOT NULL,
  desbloqueada_em TIMESTAMPTZ,
  vezes INTEGER DEFAULT 0,
  dificuldade TEXT NOT NULL CHECK (dificuldade IN ('facil', 'medio', 'dificil', 'lendario')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Objetivos Pessoais
CREATE TABLE IF NOT EXISTS objetivos_pessoais (
  id BIGSERIAL PRIMARY KEY,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('frequencia', 'torneio', 'nivel', 'treinos', 'personalizado')),
  meta INTEGER NOT NULL,
  progresso INTEGER DEFAULT 0,
  unidade TEXT,
  prazo TEXT,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'concluido', 'cancelado')) DEFAULT 'ativo',
  concluido_em TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Auto Avaliações
CREATE TABLE IF NOT EXISTS auto_avaliacoes (
  id BIGSERIAL PRIMARY KEY,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  treino_id BIGINT REFERENCES treinos(id) ON DELETE CASCADE NOT NULL,
  professor_id BIGINT REFERENCES professores(id) ON DELETE SET NULL NOT NULL,
  data TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  observacoes TEXT,
  pontos_fracos TEXT[] DEFAULT '{}',
  pontos_fortes TEXT[] DEFAULT '{}',
  foco TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Estatísticas dos Alunos
CREATE TABLE IF NOT EXISTS estatisticas_alunos (
  id BIGSERIAL PRIMARY KEY,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nivel_atual TEXT NOT NULL CHECK (nivel_atual IN ('iniciante', 'intermediario', 'avancado')),
  progresso_nivel INTEGER DEFAULT 0,
  treinos_para_proximo_nivel INTEGER DEFAULT 0,
  tempo_nivel_atual INTEGER DEFAULT 0,
  inicio_nivel_atual TEXT NOT NULL,
  frequencia_mes INTEGER DEFAULT 0,
  frequencia_ano INTEGER DEFAULT 0,
  frequencia_6_meses INTEGER[] DEFAULT '{}',
  media_frequencia_ct INTEGER DEFAULT 0,
  horas_mes INTEGER DEFAULT 0,
  horas_ano INTEGER DEFAULT 0,
  horas_total INTEGER DEFAULT 0,
  treinos_por_categoria JSONB DEFAULT '{"tecnico": 0, "tatico": 0, "fisico": 0, "jogo": 0}'::jsonb,
  sequencia_atual INTEGER DEFAULT 0,
  melhor_sequencia INTEGER DEFAULT 0,
  historico_niveis JSONB DEFAULT '[]'::jsonb,
  comparacao JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Metas
CREATE TABLE IF NOT EXISTS metas (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  meta INTEGER NOT NULL,
  atual INTEGER DEFAULT 0,
  periodo TEXT NOT NULL,
  unidade TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Metas Gerais
CREATE TABLE IF NOT EXISTS metas_gerais (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  escopo TEXT NOT NULL CHECK (escopo IN ('CT', 'Unidade')),
  unidade_id TEXT,
  valor_alvo INTEGER NOT NULL,
  valor_atual INTEGER DEFAULT 0,
  prazo TEXT,
  responsavel TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos_pessoais ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estatisticas_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_gerais ENABLE ROW LEVEL SECURITY;

-- Políticas para Exercícios
CREATE POLICY "Todos autenticados podem ver exercícios"
  ON exercicios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e professores podem modificar exercícios"
  ON exercicios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'professor')
    )
  );

-- Políticas para Treinos
CREATE POLICY "Todos autenticados podem ver treinos"
  ON treinos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e professores podem modificar treinos"
  ON treinos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'professor')
    )
  );

-- Políticas para Conquistas
CREATE POLICY "Alunos podem ver suas próprias conquistas"
  ON conquistas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = conquistas.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins, gestores e professores podem ver todas conquistas"
  ON conquistas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

CREATE POLICY "Sistema pode modificar conquistas"
  ON conquistas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'professor')
    )
  );

-- Políticas para Objetivos Pessoais
CREATE POLICY "Alunos podem ver seus próprios objetivos"
  ON objetivos_pessoais FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = objetivos_pessoais.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins e professores podem ver todos objetivos"
  ON objetivos_pessoais FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'professor')
    )
  );

CREATE POLICY "Alunos podem gerenciar seus próprios objetivos"
  ON objetivos_pessoais FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = objetivos_pessoais.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- Políticas para Auto Avaliações
CREATE POLICY "Alunos podem ver suas próprias avaliações"
  ON auto_avaliacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = auto_avaliacoes.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem ver avaliações de seus alunos"
  ON auto_avaliacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'professor'
    )
  );

CREATE POLICY "Alunos podem criar suas próprias avaliações"
  ON auto_avaliacoes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = auto_avaliacoes.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- Políticas para Estatísticas
CREATE POLICY "Alunos podem ver suas próprias estatísticas"
  ON estatisticas_alunos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = estatisticas_alunos.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins e professores podem ver todas estatísticas"
  ON estatisticas_alunos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'professor')
    )
  );

CREATE POLICY "Sistema pode atualizar estatísticas"
  ON estatisticas_alunos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'professor')
    )
  );

-- Políticas para Metas
CREATE POLICY "Todos autenticados podem ver metas"
  ON metas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e gestores podem modificar metas"
  ON metas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Metas Gerais
CREATE POLICY "Todos autenticados podem ver metas gerais"
  ON metas_gerais FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e gestores podem modificar metas gerais"
  ON metas_gerais FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_exercicios_categoria ON exercicios(categoria);
CREATE INDEX IF NOT EXISTS idx_exercicios_nivel ON exercicios(nivel);
CREATE INDEX IF NOT EXISTS idx_treinos_professor_id ON treinos(professor_id);
CREATE INDEX IF NOT EXISTS idx_treinos_unidade ON treinos(unidade);
CREATE INDEX IF NOT EXISTS idx_conquistas_aluno_id ON conquistas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_objetivos_aluno_id ON objetivos_pessoais(aluno_id);
CREATE INDEX IF NOT EXISTS idx_auto_avaliacoes_aluno_id ON auto_avaliacoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_estatisticas_aluno_id ON estatisticas_alunos(aluno_id);