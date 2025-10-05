# Script de Seed do Banco de Dados

Este documento contém instruções para popular o banco de dados Supabase com dados iniciais.

## Passo 1: Criar Usuário Admin

Execute no SQL Editor do Supabase:

\`\`\`sql
-- Criar usuário admin no auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@ct.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Inserir na tabela usuarios (substitua o UUID pelo retornado acima)
INSERT INTO usuarios (auth_user_id, nome, telefone, email, perfil, ativo)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@ct.com'),
  'Administrador',
  '(11) 99999-9999',
  'admin@ct.com',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;
\`\`\`

## Passo 2: Criar Unidades

\`\`\`sql
INSERT INTO unidades (nome, endereco, telefone, email, ativa) VALUES
('Centro', 'Av. Paulista, 1000 - São Paulo, SP', '(11) 3333-1000', 'centro@ct.com', true),
('Zona Sul', 'Av. Brigadeiro Luis Antonio, 500 - São Paulo, SP', '(11) 3333-2000', 'zonasul@ct.com', true),
('Zona Oeste', 'Av. Rebouças, 800 - São Paulo, SP', '(11) 3333-3000', 'zonaoeste@ct.com', true);
\`\`\`

## Passo 3: Criar Planos

\`\`\`sql
INSERT INTO planos (nome, preco, unidade, descricao, beneficios) VALUES
('Básico', 150.00, 'Centro', 'Plano básico com 2x por semana', ARRAY['Acesso 2x por semana', 'Aulas em grupo']),
('Intermediário', 250.00, 'Centro', 'Plano intermediário com 3x por semana', ARRAY['Acesso 3x por semana', 'Aulas em grupo', '1 aula individual/mês']),
('Premium', 400.00, 'Centro', 'Plano premium ilimitado', ARRAY['Acesso ilimitado', 'Aulas em grupo', '4 aulas individuais/mês', 'Desconto em produtos']),
('Básico', 150.00, 'Zona Sul', 'Plano básico com 2x por semana', ARRAY['Acesso 2x por semana', 'Aulas em grupo']),
('Intermediário', 250.00, 'Zona Sul', 'Plano intermediário com 3x por semana', ARRAY['Acesso 3x por semana', 'Aulas em grupo', '1 aula individual/mês']);
\`\`\`

## Passo 4: Criar Produtos

\`\`\`sql
INSERT INTO produtos (nome, preco, preco_custo, categoria, estoque, estoque_minimo, unidade, ativo) VALUES
('Camiseta CT', 49.90, 25.00, 'Vestuário', 50, 10, 'Centro', true),
('Boné CT', 39.90, 20.00, 'Vestuário', 30, 5, 'Centro', true),
('Garrafa de Água', 29.90, 15.00, 'Acessórios', 100, 20, 'Centro', true),
('Raquete Beach Tennis', 299.90, 180.00, 'Equipamentos', 15, 3, 'Centro', true);
\`\`\`

## Passo 5: Criar Configuração do CT

\`\`\`sql
INSERT INTO config_ct (
  nome_ct,
  contato,
  horario_funcionamento_padrao,
  configuracao_presenca
) VALUES (
  'CT Futevôlei',
  '{"email": "contato@ct.com", "telefone": "(11) 99999-9999"}',
  '{"inicio": "06:00", "fim": "22:00"}',
  '{"permiteCheckinSemLimite": true, "lembreteAutomatico": true, "horarioLembreteMinutos": 60}'
);
\`\`\`

## Notas Importantes

- Para criar outros usuários (professores, alunos, gestores), você precisará usar o Supabase Auth API
- As senhas devem ser criptografadas usando bcrypt
- Recomenda-se usar a interface do sistema para cadastrar novos usuários após o setup inicial
- O usuário admin criado pode ser usado para acessar o sistema e gerenciar outros usuários
