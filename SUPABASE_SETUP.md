# Configuração do Supabase

Este documento descreve como o Supabase foi integrado ao sistema de gestão FTV.

## Estrutura do Banco de Dados

O banco de dados foi organizado em 5 migrations principais:

### 1. `create_core_tables` - Tabelas Principais
- **unidades** - Unidades do CT
- **usuarios** - Base de todos os usuários
- **professores** - Professores (extends usuarios)
- **gestores** - Gestores (extends usuarios)
- **alunos** - Alunos (extends usuarios)
- **planos** - Planos de mensalidade
- **plataformas** - Plataformas parceiras

### 2. `create_operational_tables` - Tabelas Operacionais
- **presencas** - Registro de presenças
- **agendamentos** - Agendamentos de aulas
- **aulas_experimentais** - Aulas experimentais
- **registros_horas_professores** - Horas trabalhadas
- **listas_presenca** - Listas de presença geradas
- **pre_checkins** - Pré check-ins dos alunos
- **presencas_confirmadas** - Presenças confirmadas

### 3. `create_financial_and_products_tables` - Financeiro e Produtos
- **registros_financeiros** - Receitas e despesas
- **produtos** - Produtos vendidos
- **alugueis** - Aluguéis de quadra

### 4. `create_training_and_evolution_tables` - Treinos e Evolução
- **exercicios** - Biblioteca de exercícios
- **treinos** - Treinos planejados
- **conquistas** - Conquistas dos alunos
- **objetivos_pessoais** - Objetivos dos alunos
- **auto_avaliacoes** - Auto avaliações
- **estatisticas_alunos** - Estatísticas e métricas
- **metas** - Metas do CT
- **metas_gerais** - Metas gerais do negócio

### 5. `create_tournaments_and_config_tables` - Torneios e Configurações
- **torneios** - Torneios do CT
- **categorias_torneio** - Categorias dos torneios
- **duplas_torneio** - Duplas inscritas
- **partidas_torneio** - Partidas do chaveamento
- **horarios** - Horários de aulas
- **niveis_aula** - Níveis configurados
- **horarios_fixos** - Horários fixos semanais
- **aulaoes** - Configuração de aulões
- **config_ct** - Configurações gerais

## Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas específicas:

- **Admin**: Acesso total a todas as tabelas
- **Gestor**: Acesso a dados de suas unidades
- **Professor**: Acesso a dados relevantes para suas aulas
- **Aluno**: Acesso apenas aos seus próprios dados

### Autenticação

O sistema usa Supabase Auth para autenticação:

- Email/Password authentication
- Sessões persistentes
- Refresh automático de tokens

## Serviços de API

### `authService`
- `signIn(credentials)` - Login
- `signUp(data)` - Cadastro
- `signOut()` - Logout
- `getCurrentUser()` - Usuário atual
- `onAuthStateChange(callback)` - Observar mudanças

### Serviços de Dados
- `alunosService` - CRUD de alunos
- `professoresService` - CRUD de professores
- `planosService` - CRUD de planos
- `unidadesService` - CRUD de unidades
- `produtosService` - CRUD de produtos

## Como Usar

### 1. Setup Inicial

Execute os scripts de seed em `scripts/seed.md` para popular o banco com dados iniciais.

### 2. Usar Serviços de API

```typescript
import { alunosService, authService } from '@/services';

// Login
const user = await authService.signIn({
  email: 'admin@ct.com',
  senha: 'admin123'
});

// Buscar alunos
const alunos = await alunosService.getAll();

// Criar aluno
const novoAluno = await alunosService.create({
  nome: 'João Silva',
  email: 'joao@email.com',
  telefone: '(11) 99999-9999',
  // ... outros campos
});
```

### 3. Hook useSupabaseData

Para componentes que precisam de dados do Supabase:

```typescript
import { useSupabaseData } from '@/hooks';

function MeuComponente() {
  const {
    alunos,
    professores,
    planos,
    loading,
    error,
    reload
  } = useSupabaseData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {alunos.map(aluno => (
        <AlunoCard key={aluno.id} aluno={aluno} />
      ))}
    </div>
  );
}
```

## Variáveis de Ambiente

O arquivo `.env` já está configurado com as variáveis necessárias:

```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## Próximos Passos

### Para Desenvolvimento
1. Execute os scripts de seed
2. Teste o login com admin@ct.com / admin123
3. Use a interface para criar outros usuários

### Para Produção
1. Configure variáveis de ambiente de produção
2. Execute migrations no banco de produção
3. Configure backup automático
4. Monitore logs e performance

## Suporte

Para dúvidas sobre o Supabase:
- [Documentação Oficial](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
