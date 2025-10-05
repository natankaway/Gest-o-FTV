/*
  # Criação das Tabelas Operacionais

  1. Novas Tabelas
    - `presencas` - Registro de presenças
    - `agendamentos` - Agendamentos de aulas
    - `aulas_experimentais` - Controle de aulas experimentais
    - `registros_horas_professores` - Horas trabalhadas pelos professores
    - `listas_presenca` - Listas de presença geradas
    - `pre_checkins` - Pré check-ins dos alunos
    - `presencas_confirmadas` - Presenças confirmadas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em perfil e ownership
*/

-- Tabela de Presenças
CREATE TABLE IF NOT EXISTS presencas (
  id BIGSERIAL PRIMARY KEY,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  professor_id BIGINT REFERENCES professores(id) ON DELETE SET NULL,
  data TEXT NOT NULL,
  hora TEXT NOT NULL,
  unidade TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('treino', 'aula', 'individual')),
  status TEXT NOT NULL CHECK (status IN ('presente', 'falta')) DEFAULT 'presente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id BIGSERIAL PRIMARY KEY,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE,
  professor_id BIGINT REFERENCES professores(id) ON DELETE SET NULL NOT NULL,
  data TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('aula', 'treino', 'avaliacao', 'individual')),
  unidade TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmado', 'pendente', 'cancelado')) DEFAULT 'pendente',
  observacoes TEXT,
  recorrencia JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Aulas Experimentais
CREATE TABLE IF NOT EXISTS aulas_experimentais (
  id BIGSERIAL PRIMARY KEY,
  aluno_id BIGINT NOT NULL,
  aluno_nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  data_agendamento TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('agendada', 'realizada', 'nao-compareceu', 'convertido', 'inativo')) DEFAULT 'agendada',
  professor_id BIGINT REFERENCES professores(id) ON DELETE SET NULL,
  unidade TEXT NOT NULL,
  observacoes TEXT,
  data_realizacao TIMESTAMPTZ,
  data_conversao TIMESTAMPTZ,
  plano_convertido JSONB,
  historico JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Registro de Horas dos Professores
CREATE TABLE IF NOT EXISTS registros_horas_professores (
  id BIGSERIAL PRIMARY KEY,
  data TEXT NOT NULL,
  professor_id BIGINT REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
  unidade TEXT NOT NULL,
  horas_trabalhadas NUMERIC(5, 2) NOT NULL,
  tipo_atividade TEXT NOT NULL CHECK (tipo_atividade IN ('aula-regular', 'aulao', 'administrativo', 'substituicao')),
  observacoes TEXT,
  registrado_por BIGINT REFERENCES usuarios(id) NOT NULL,
  registrado_em TIMESTAMPTZ DEFAULT now(),
  editado_por BIGINT REFERENCES usuarios(id),
  editado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Listas de Presença
CREATE TABLE IF NOT EXISTS listas_presenca (
  id BIGSERIAL PRIMARY KEY,
  data TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  unidade TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('aula-regular', 'aulao')),
  nivel_id BIGINT,
  capacidade INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('aberta', 'confirmada', 'finalizada')) DEFAULT 'aberta',
  horario_fixo_id BIGINT,
  aulao_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Pré Check-ins
CREATE TABLE IF NOT EXISTS pre_checkins (
  id BIGSERIAL PRIMARY KEY,
  lista_presenca_id BIGINT REFERENCES listas_presenca(id) ON DELETE CASCADE NOT NULL,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  horario_checkin TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelado BOOLEAN DEFAULT false,
  motivo_cancelamento TEXT,
  horario_cancelamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Presenças Confirmadas
CREATE TABLE IF NOT EXISTS presencas_confirmadas (
  id BIGSERIAL PRIMARY KEY,
  lista_presenca_id BIGINT REFERENCES listas_presenca(id) ON DELETE CASCADE NOT NULL,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pre-checkin-confirmado', 'adicionado-pelo-professor')),
  status TEXT NOT NULL CHECK (status IN ('presente', 'falta')) DEFAULT 'presente',
  professor_id BIGINT REFERENCES professores(id) ON DELETE SET NULL,
  horario_confirmacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas_experimentais ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_horas_professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE listas_presenca ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas_confirmadas ENABLE ROW LEVEL SECURITY;

-- Políticas para Presenças
CREATE POLICY "Alunos podem ver suas próprias presenças"
  ON presencas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = presencas.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins, gestores e professores podem ver todas presenças"
  ON presencas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

CREATE POLICY "Admins, gestores e professores podem modificar presenças"
  ON presencas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

-- Políticas para Agendamentos
CREATE POLICY "Alunos podem ver seus próprios agendamentos"
  ON agendamentos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = agendamentos.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Professores, gestores e admins podem ver todos agendamentos"
  ON agendamentos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

CREATE POLICY "Admins e gestores podem modificar agendamentos"
  ON agendamentos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Aulas Experimentais
CREATE POLICY "Admins e gestores podem ver todas aulas experimentais"
  ON aulas_experimentais FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Admins e gestores podem modificar aulas experimentais"
  ON aulas_experimentais FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Registros de Horas
CREATE POLICY "Professores podem ver suas próprias horas"
  ON registros_horas_professores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professores p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.id = registros_horas_professores.professor_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins e gestores podem ver todos registros de horas"
  ON registros_horas_professores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Admins e gestores podem modificar registros de horas"
  ON registros_horas_professores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Listas de Presença
CREATE POLICY "Todos autenticados podem ver listas de presença"
  ON listas_presenca FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins, gestores e professores podem modificar listas"
  ON listas_presenca FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

-- Políticas para Pré Check-ins
CREATE POLICY "Alunos podem ver seus próprios check-ins"
  ON pre_checkins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = pre_checkins.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Todos autenticados podem ver check-ins"
  ON pre_checkins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Alunos podem criar seus check-ins"
  ON pre_checkins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = pre_checkins.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins, gestores e professores podem modificar check-ins"
  ON pre_checkins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

-- Políticas para Presenças Confirmadas
CREATE POLICY "Todos autenticados podem ver presenças confirmadas"
  ON presencas_confirmadas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins, gestores e professores podem modificar presenças confirmadas"
  ON presencas_confirmadas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

-- Indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_professor_id ON presencas(professor_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno_id ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_professor_id ON agendamentos(professor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_aulas_experimentais_status ON aulas_experimentais(status);
CREATE INDEX IF NOT EXISTS idx_registros_horas_professor_id ON registros_horas_professores(professor_id);
CREATE INDEX IF NOT EXISTS idx_listas_presenca_data ON listas_presenca(data);
CREATE INDEX IF NOT EXISTS idx_pre_checkins_lista_id ON pre_checkins(lista_presenca_id);
CREATE INDEX IF NOT EXISTS idx_pre_checkins_aluno_id ON pre_checkins(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_confirmadas_lista_id ON presencas_confirmadas(lista_presenca_id);