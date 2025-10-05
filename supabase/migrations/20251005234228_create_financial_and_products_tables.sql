/*
  # Criação das Tabelas Financeiras e Produtos

  1. Novas Tabelas
    - `registros_financeiros` - Registros de receitas e despesas
    - `produtos` - Produtos vendidos no CT
    - `alugueis` - Aluguéis de quadra

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em perfil
*/

-- Tabela de Registros Financeiros
CREATE TABLE IF NOT EXISTS registros_financeiros (
  id BIGSERIAL PRIMARY KEY,
  aluno_id BIGINT REFERENCES alunos(id) ON DELETE SET NULL,
  professor_id BIGINT REFERENCES professores(id) ON DELETE SET NULL,
  valor NUMERIC(10, 2) NOT NULL,
  data TEXT NOT NULL,
  vencimento TEXT,
  status TEXT NOT NULL CHECK (status IN ('pago', 'pendente', 'vencido')) DEFAULT 'pendente',
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('dinheiro', 'pix', 'cartao-credito', 'cartao-debito', 'transferencia', 'mensalidade', 'diaria-dinheiro', 'diaria-plataforma', 'aluguel', 'produto')),
  descricao TEXT NOT NULL,
  unidade TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  preco_custo NUMERIC(10, 2),
  categoria TEXT NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  estoque_minimo INTEGER,
  descricao TEXT,
  marca TEXT,
  fornecedor TEXT,
  codigo_barras TEXT,
  unidade TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  imagem TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Aluguéis
CREATE TABLE IF NOT EXISTS alugueis (
  id BIGSERIAL PRIMARY KEY,
  cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data TEXT NOT NULL,
  horario TEXT NOT NULL,
  duracao INTEGER NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmado', 'pendente', 'cancelado')) DEFAULT 'pendente',
  unidade TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE registros_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alugueis ENABLE ROW LEVEL SECURITY;

-- Políticas para Registros Financeiros
CREATE POLICY "Alunos podem ver seus próprios registros financeiros"
  ON registros_financeiros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.id = registros_financeiros.aluno_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins e gestores podem ver todos registros financeiros"
  ON registros_financeiros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Admins e gestores podem modificar registros financeiros"
  ON registros_financeiros FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Produtos
CREATE POLICY "Todos autenticados podem visualizar produtos"
  ON produtos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins e gestores podem modificar produtos"
  ON produtos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Políticas para Aluguéis
CREATE POLICY "Admins e gestores podem ver todos aluguéis"
  ON alugueis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Admins e gestores podem modificar aluguéis"
  ON alugueis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_user_id = auth.uid()
      AND usuarios.perfil IN ('admin', 'gestor')
    )
  );

-- Indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_registros_financeiros_aluno_id ON registros_financeiros(aluno_id);
CREATE INDEX IF NOT EXISTS idx_registros_financeiros_professor_id ON registros_financeiros(professor_id);
CREATE INDEX IF NOT EXISTS idx_registros_financeiros_data ON registros_financeiros(data);
CREATE INDEX IF NOT EXISTS idx_registros_financeiros_status ON registros_financeiros(status);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_unidade ON produtos(unidade);
CREATE INDEX IF NOT EXISTS idx_alugueis_data ON alugueis(data);
CREATE INDEX IF NOT EXISTS idx_alugueis_unidade ON alugueis(unidade);