/*
  # Criação das Tabelas de Torneios e Configurações

  1. Novas Tabelas
    - `torneios` - Torneios do CT
    - `categorias_torneio` - Categorias de cada torneio
    - `duplas_torneio` - Duplas inscritas
    - `partidas_torneio` - Partidas do chaveamento
    - `horarios` - Horários de aulas/treinos
    - `niveis_aula` - Níveis de aula configurados
    - `horarios_fixos` - Horários fixos semanais
    - `aulaoes` - Configuração de aulões
    - `config_ct` - Configurações gerais do CT

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em perfil
*/

-- Tabela de Torneios
CREATE TABLE IF NOT EXISTS torneios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  local TEXT,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('Inscrições', 'Sorteio', 'Em andamento', 'Finalizado')) DEFAULT 'Inscrições',
  criado_por TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Categorias de Torneio
CREATE TABLE IF NOT EXISTS categorias_torneio (
  id TEXT PRIMARY KEY,
  torneio_id TEXT REFERENCES torneios(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  limite_duplas INTEGER,
  formato TEXT NOT NULL CHECK (formato IN ('single', 'double')),
  best_of_sf INTEGER CHECK (best_of_sf IN (1, 3)) DEFAULT 1,
  best_of_final INTEGER CHECK (best_of_final IN (1, 3)) DEFAULT 1,
  chaveamento_status TEXT NOT NULL CHECK (chaveamento_status IN ('nao-gerado', 'gerado', 'em-andamento', 'finalizado')) DEFAULT 'nao-gerado',
  chaveamento_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Duplas de Torneio
CREATE TABLE IF NOT EXISTS duplas_torneio (
  id TEXT PRIMARY KEY,
  categoria_id TEXT REFERENCES categorias_torneio(id) ON DELETE CASCADE NOT NULL,
  nome TEXT,
  jogador1_tipo TEXT NOT NULL CHECK (jogador1_tipo IN ('aluno', 'convidado')),
  jogador1_id TEXT,
  jogador1_nome TEXT NOT NULL,
  jogador2_tipo TEXT NOT NULL CHECK (jogador2_tipo IN ('aluno', 'convidado')),
  jogador2_id TEXT,
  jogador2_nome TEXT NOT NULL,
  unidade_id TEXT,
  inscrito_em TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Partidas de Torneio
CREATE TABLE IF NOT EXISTS partidas_torneio (
  id TEXT PRIMARY KEY,
  categoria_id TEXT REFERENCES categorias_torneio(id) ON DELETE CASCADE NOT NULL,
  fase TEXT NOT NULL CHECK (fase IN ('WB', 'LB', 'SF', 'F', '3P')),
  round INTEGER NOT NULL,
  dupla_a TEXT,
  dupla_b TEXT,
  horario TIMESTAMPTZ,
  scores JSONB DEFAULT '[]'::jsonb,
  placar JSONB,
  best_of INTEGER CHECK (best_of IN (1, 3)) DEFAULT 1,
  wins_to_advance INTEGER,
  vencedor TEXT,
  perdedor TEXT,
  proximo_vencedor_match_id TEXT,
  proximo_perdedor_match_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'andamento', 'finalizado')) DEFAULT 'pendente',
  next_match_id TEXT,
  next_match_slot INTEGER CHECK (next_match_slot IN (1, 2)),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Horários
CREATE TABLE IF NOT EXISTS horarios (
  id BIGSERIAL PRIMARY KEY,
  dia TEXT NOT NULL,
  inicio TEXT NOT NULL,
  fim TEXT NOT NULL,
  professor_id BIGINT REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
  unidade TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('aula', 'treino')),
  capacidade INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Níveis de Aula
CREATE TABLE IF NOT EXISTS niveis_aula (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Horários Fixos
CREATE TABLE IF NOT EXISTS horarios_fixos (
  id BIGSERIAL PRIMARY KEY,
  unidade TEXT NOT NULL,
  dia_semana TEXT NOT NULL CHECK (dia_semana IN ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')),
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  capacidade INTEGER,
  nivel_id BIGINT REFERENCES niveis_aula(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Aulões
CREATE TABLE IF NOT EXISTS aulaoes (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  capacidade INTEGER,
  nivel_id BIGINT REFERENCES niveis_aula(id) ON DELETE SET NULL,
  valor_especial NUMERIC(10, 2),
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  tipo TEXT NOT NULL CHECK (tipo IN ('fixo-recorrente', 'extra-pontual')),
  dia_semana TEXT CHECK (dia_semana IN ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')),
  data_inicio TEXT,
  data_fim TEXT,
  data_especifica TEXT,
  configuracao JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Configurações do CT
CREATE TABLE IF NOT EXISTS config_ct (
  id BIGSERIAL PRIMARY KEY,
  nome_ct TEXT NOT NULL,
  contato JSONB,
  horario_funcionamento_padrao JSONB,
  branding JSONB,
  configuracao_presenca JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE torneios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_torneio ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplas_torneio ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas_torneio ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveis_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_fixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulaoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_ct ENABLE ROW LEVEL SECURITY;

-- Políticas para Torneios
CREATE POLICY "Todos autenticados podem ver torneios"
  ON torneios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e gestores podem modificar torneios"
  ON torneios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Categorias de Torneio
CREATE POLICY "Todos autenticados podem ver categorias"
  ON categorias_torneio FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e gestores podem modificar categorias"
  ON categorias_torneio FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Duplas de Torneio
CREATE POLICY "Todos autenticados podem ver duplas"
  ON duplas_torneio FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos autenticados podem se inscrever"
  ON duplas_torneio FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins e gestores podem modificar duplas"
  ON duplas_torneio FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Partidas de Torneio
CREATE POLICY "Todos autenticados podem ver partidas"
  ON partidas_torneio FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e gestores podem modificar partidas"
  ON partidas_torneio FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Horários
CREATE POLICY "Todos autenticados podem ver horários"
  ON horarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e gestores podem modificar horários"
  ON horarios FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Níveis de Aula
CREATE POLICY "Todos autenticados podem ver níveis"
  ON niveis_aula FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem modificar níveis"
  ON niveis_aula FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Políticas para Horários Fixos
CREATE POLICY "Todos autenticados podem ver horários fixos"
  ON horarios_fixos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem modificar horários fixos"
  ON horarios_fixos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Políticas para Aulões
CREATE POLICY "Todos autenticados podem ver aulões"
  ON aulaoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem modificar aulões"
  ON aulaoes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Políticas para Configurações
CREATE POLICY "Todos autenticados podem ver configurações"
  ON config_ct FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem modificar configurações"
  ON config_ct FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_torneios_status ON torneios(status);
CREATE INDEX IF NOT EXISTS idx_categorias_torneio_id ON categorias_torneio(torneio_id);
CREATE INDEX IF NOT EXISTS idx_duplas_categoria_id ON duplas_torneio(categoria_id);
CREATE INDEX IF NOT EXISTS idx_partidas_categoria_id ON partidas_torneio(categoria_id);
CREATE INDEX IF NOT EXISTS idx_horarios_professor_id ON horarios(professor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_unidade ON horarios(unidade);