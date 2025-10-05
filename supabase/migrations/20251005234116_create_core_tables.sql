/*
  # Criação das Tabelas Principais do Sistema

  1. Novas Tabelas
    - `unidades` - Unidades do centro de treinamento
    - `usuarios` - Base de usuários do sistema
    - `professores` - Professores (extends usuarios)
    - `gestores` - Gestores (extends usuarios)
    - `alunos` - Alunos (extends usuarios)
    - `planos` - Planos de mensalidade
    - `plataformas` - Plataformas parceiras

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas em perfil de usuário
*/

-- Tabela de Unidades
CREATE TABLE IF NOT EXISTS unidades (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  gestor_id BIGINT,
  ativa BOOLEAN DEFAULT true,
  socios JSONB DEFAULT '[]'::jsonb,
  configuracoes JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela Base de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin', 'gestor', 'professor', 'aluno')),
  ativo BOOLEAN DEFAULT true,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Professores
CREATE TABLE IF NOT EXISTS professores (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tipo_pagamento TEXT NOT NULL CHECK (tipo_pagamento IN ('fixo', 'horas-variaveis', 'hora-fixa')),
  valor_fixo NUMERIC(10, 2),
  valor_hora_fixa NUMERIC(10, 2),
  valores_horas JSONB,
  valor_aulao NUMERIC(10, 2),
  especialidades TEXT[] DEFAULT '{}',
  experiencia TEXT CHECK (experiencia IN ('1-3', '3-5', '5-10', '10+')),
  unidades TEXT[] DEFAULT '{}',
  unidade_principal TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Gestores
CREATE TABLE IF NOT EXISTS gestores (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
  cargo TEXT NOT NULL,
  unidades TEXT[] DEFAULT '{}',
  permissoes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  unidade TEXT NOT NULL,
  descricao TEXT,
  beneficios TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Plataformas
CREATE TABLE IF NOT EXISTS plataformas (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  taxa NUMERIC(5, 2) NOT NULL,
  unidade TEXT NOT NULL,
  ativa BOOLEAN DEFAULT true,
  configuracoes JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Alunos
CREATE TABLE IF NOT EXISTS alunos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tipo_plano TEXT NOT NULL CHECK (tipo_plano IN ('mensalidade', 'plataforma', 'experimental')),
  plano_id BIGINT REFERENCES planos(id),
  plataforma_parceira TEXT,
  unidade TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'pendente', 'inativo')) DEFAULT 'ativo',
  vencimento TEXT,
  nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')) DEFAULT 'iniciante',
  data_matricula TEXT NOT NULL,
  objetivo TEXT,
  nomes_checkin TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar constraint de foreign key para gestor_id em unidades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unidades_gestor_id_fkey'
  ) THEN
    ALTER TABLE unidades ADD CONSTRAINT unidades_gestor_id_fkey 
      FOREIGN KEY (gestor_id) REFERENCES gestores(id);
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gestores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plataformas ENABLE ROW LEVEL SECURITY;

-- Políticas para Unidades
CREATE POLICY "Usuários autenticados podem visualizar unidades"
  ON unidades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins e gestores podem modificar unidades"
  ON unidades FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Usuários
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins e gestores podem ver todos os usuários"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.perfil IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Apenas admins podem criar usuários"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Políticas para Professores
CREATE POLICY "Todos autenticados podem visualizar professores"
  ON professores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem modificar professores"
  ON professores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Políticas para Gestores
CREATE POLICY "Admins podem visualizar todos gestores"
  ON gestores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem modificar gestores"
  ON gestores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Políticas para Alunos
CREATE POLICY "Alunos podem ver seu próprio perfil"
  ON alunos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = alunos.usuario_id
      AND usuarios.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins, gestores e professores podem ver todos alunos"
  ON alunos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor', 'professor')
    )
  );

CREATE POLICY "Admins e gestores podem modificar alunos"
  ON alunos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Planos
CREATE POLICY "Todos autenticados podem visualizar planos"
  ON planos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem modificar planos"
  ON planos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Políticas para Plataformas
CREATE POLICY "Todos autenticados podem visualizar plataformas"
  ON plataformas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem modificar plataformas"
  ON plataformas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil = 'admin'
    )
  );

-- Indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_professores_usuario_id ON professores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_gestores_usuario_id ON gestores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alunos_usuario_id ON alunos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alunos_unidade ON alunos(unidade);
CREATE INDEX IF NOT EXISTS idx_alunos_status ON alunos(status);