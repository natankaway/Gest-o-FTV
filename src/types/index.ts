/// <reference types="vite/client" />

// Core entity types
export interface Usuario {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  ativo?: boolean;
}

export interface Aluno extends Usuario {
  tipoPlano: 'mensalidade' | 'plataforma';
  planoId?: number;
  plataformaParceira?: string;
  unidade: string;
  status: 'ativo' | 'pendente' | 'inativo';
  vencimento: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  dataMatricula: string;
  objetivo: string;
}

export interface Professor extends Usuario {
  tipoPagamento: 'fixo' | 'variavel';
  valorFixo?: number;
  valoresVariaveis?: {
    uma: number;
    duas: number;
    tres: number;
  };
  especialidades: string[];
  experiencia: '1-3' | '3-5' | '5-10' | '10+';
  observacoes?: string;
}

export interface Gestor extends Usuario {
  cargo: string;
  unidades: string[];
  permissoes: string[];
}

export interface Unidade {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  gestorId: number;
  ativa: boolean;
  configuracoes?: {
    horarioFuncionamento: {
      inicio: string;
      fim: string;
    };
    capacidadeMaxima: number;
  };
}

export interface Plano {
  id: number;
  nome: string;
  preco: number;
  unidade: string;
  descricao?: string;
  beneficios?: string[];
}

export interface Presenca {
  id: number;
  alunoId: number;
  aluno: string;
  professorId: number;
  professor: string;
  data: string;
  hora: string;
  unidade: string;
  tipo: 'treino' | 'aula' | 'individual';
  status: 'presente' | 'falta';
}

export interface RegistroFinanceiro {
  id: number;
  alunoId?: number;
  aluno?: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente' | 'vencido';
  tipo: 'receita' | 'despesa';
  metodo: 'mensalidade' | 'diaria-dinheiro' | 'diaria-plataforma' | 'aluguel' | 'produto';
  descricao: string;
  unidade?: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  descricao?: string;
  unidade: string;
}

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

export interface Plataforma {
  id: number;
  nome: string;
  taxa: number;
  unidade: string;
  ativa: boolean;
  configuracoes?: {
    limiteCredito?: number;
    diasVencimento?: number;
  };
}

export interface Horario {
  id: number;
  dia: string;
  inicio: string;
  fim: string;
  professorId: number;
  professor: string;
  unidade: string;
  tipo: 'aula' | 'treino';
  capacidade: number;
}

export interface Meta {
  id: number;
  tipo: string;
  meta: number;
  atual: number;
  periodo: string;
  unidade: string;
}

export interface Aluguel {
  id: number;
  cliente: string;
  telefone: string;
  data: string;
  horario: string;
  duracao: number;
  valor: number;
  status: 'confirmado' | 'pendente' | 'cancelado';
  unidade: string;
  observacoes?: string;
}

// UI and state types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'gestor' | 'professor' | 'aluno';
  unidade?: string;
  unidades?: string[];
}

export interface AppState {
  userLogado: User | null;
  unidadeSelecionada: string;
  dadosMockados: MockData;
}

export interface MockData {
  planos: Plano[];
  alunos: Aluno[];
  professores: Professor[];
  unidades: Unidade[];
  presencas: Presenca[];
  financeiro: RegistroFinanceiro[];
  produtos: Produto[];
  plataformas: Plataforma[];
  horarios: Horario[];
  gestores: Gestor[];
  metas: Meta[];
  alugueis: Aluguel[];
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  read?: boolean;
}

// Form types
export interface AlunoFormData extends Omit<Aluno, 'id'> {}
export interface ProfessorFormData extends Omit<Professor, 'id'> {}
export interface UnidadeFormData extends Omit<Unidade, 'id'> {}
export interface PlanoFormData extends Omit<Plano, 'id'> {}
export interface ProdutoFormData extends Omit<Produto, 'id'> {}

// Filter and search types
export interface FilterOptions {
  status?: string;
  unidade?: string;
  periodo?: string;
  tipo?: string;
}

export interface SearchState {
  term: string;
  filters: FilterOptions;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Export utility types
export type TabKeys = 'dashboard' | 'alunos' | 'professores' | 'gestores' | 'presencas' | 'agendamentos' | 'treinos' | 'planos' | 'unidades' | 'financeiro' | 'produtos' | 'alugueis';

export interface Tab {
  key: TabKeys;
  label: string;
  icon: React.ComponentType;
  requiredRole?: User['perfil'][];
}