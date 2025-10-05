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
  tipoPlano: 'mensalidade' | 'plataforma' | 'experimental';
  planoId?: number;
  plataformaParceira?: string;
  unidade: string;
  status: 'ativo' | 'pendente' | 'inativo';
  vencimento: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  dataMatricula: string;
  objetivo: string;
   nomesCheckIn?: string[];
  profileImage?: string;
}

export interface Professor extends Usuario {
  tipoPagamento: 'fixo' | 'horas-variaveis' | 'hora-fixa';
  valorFixo?: number;
  valorHoraFixa?: number;
  valoresHoras?: {
    umaHora: number;
    duasHoras: number;
    tresOuMaisHoras: number;
  };
  valorAulao?: number;
  especialidades: string[];
  experiencia: '1-3' | '3-5' | '5-10' | '10+';
  observacoes?: string;
  // 🆕 NOVOS CAMPOS ADICIONADOS:
  unidades: string[]; // Array de unidades onde o professor atua
  unidadePrincipal?: string; // Unidade principal (opcional)
}

export interface RegistroHorasProfessor {
  id: number;
  data: string; // formato YYYY-MM-DD
  professorId: number;
  professorNome: string; // para histórico
  unidade: string;
  horasTrabalhadas: number;
  tipoAtividade: 'aula-regular' | 'aulao' | 'administrativo' | 'substituicao';
  observacoes?: string;
  registradoPor: number; // ID do usuário que fez o lançamento
  registradoEm: string; // timestamp ISO
  editadoPor?: number;
  editadoEm?: string;
}

export interface Gestor extends Usuario {
  cargo: string;
  unidades: string[];
  permissoes: string[];
}

export interface Socio {
  id: number;
  nome: string;
  percentual: number;
  ativo: boolean;
}

export interface Unidade {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  gestorId: number;
  ativa: boolean;
  socios?: Socio[];
  configuracoes?: {
    horarioFuncionamento: {
      inicio: string;
      fim: string;
    };
    capacidadeMaxima: number;
  };
}

export interface ConfigCT {
  nomeCT: string;
  contato?: {
    email?: string;
    telefone?: string;
  };
  horarioFuncionamentoPadrao?: {
    inicio: string;
    fim: string;
  };
  branding?: {
    logoUrl?: string;
  };
  niveisAula?: NivelAula[];
  horariosFixos?: HorarioFixo[];
  aulaoes?: AulaoConfig[];
  aulaoesMelhorados?: AulaoConfigMelhorado[]; // ADICIONA ESTA LINHA
  configuracaoPresenca?: {
    permiteCheckinSemLimite: boolean;
    lembreteAutomatico: boolean;
    horarioLembreteMinutos: number;
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
  professorId?: number;
  professor?: string;
  valor: number;
  data: string;
  vencimento?: string;
  status: 'pago' | 'pendente' | 'vencido';
  tipo: 'receita' | 'despesa';
  categoria: string;
  metodo: 'dinheiro' | 'pix' | 'cartao-credito' | 'cartao-debito' | 'transferencia' | 'mensalidade' | 'diaria-dinheiro' | 'diaria-plataforma' | 'aluguel' | 'produto';
  descricao: string;
  unidade?: string;
  observacoes?: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  precoCusto?: number;
  categoria: string;
  estoque: number;
  estoqueMinimo?: number;
  descricao?: string;
  marca?: string;
  fornecedor?: string;
  codigoBarras?: string;
  unidade: string;
  ativo?: boolean;
  imagem?: string;
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

export interface MetaGeral {
  id: string;
  titulo: string;
  descricao?: string;
  escopo: 'CT' | 'Unidade';
  unidadeId?: string;
  valorAlvo: number;
  valorAtual: number;
  prazo?: string;
  responsavel?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}
export interface AulaExperimental {
  id: number;
  alunoId: number;
  aluno: string; // Nome do aluno
  telefone: string;
  email: string;
  dataAgendamento: string; // Data/hora agendada
  status: 'agendada' | 'realizada' | 'nao-compareceu' | 'convertido' | 'inativo';
  professorId?: number;
  professor?: string;
  unidade: string;
  observacoes?: string;
  dataRealizacao?: string; // Quando status = 'realizada'
  dataConversao?: string; // Quando converteu para plano pago
  planoConvertido?: {
    tipo: 'mensalidade' | 'plataforma';
    planoId?: number;
    plataformaParceira?: string;
  };
  historico: {
    data: string;
    statusAnterior: string;
    statusNovo: string;
    observacao?: string;
    usuarioResponsavel: string;
  }[];
  criadoEm: string;
  atualizadoEm: string;
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

export interface Agendamento {
  id: number;
  alunoId?: number;
  aluno?: string;
  professorId: number;
  professor: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: 'aula' | 'treino' | 'avaliacao' | 'individual';
  unidade: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes?: string;
  recorrencia?: {
    tipo: 'nenhuma' | 'semanal' | 'quinzenal' | 'mensal';
    quantidade?: number;
  };
}

export interface Exercicio {
  id: number;
  nome: string;
  duracao: number;
  descricao: string;
  categoria: 'aquecimento' | 'tecnica' | 'tatica' | 'fisico' | 'finalizacao';
  equipamentos: string[];
  nivel: 'iniciante' | 'intermediario' | 'avancado';
}

export interface Treino {
  id: number;
  nome: string;
  tipo: 'tecnico' | 'fisico' | 'tatico' | 'jogo';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao: number;
  objetivo: string;
  equipamentos: string[];
  exercicios: {
    id: string;
    nome: string;
    duracao: number;
    descricao: string;
    ordem: number;
  }[];
  observacoes?: string;
  professorId: number;
  professor?: string;
  unidade: string;
  data?: string;
  status?: 'planejado' | 'em-andamento' | 'concluido';
  pranchetaData?: PranchetaData;
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
  metasGerais: MetaGeral[];
  alugueis: Aluguel[];
  agendamentos: Agendamento[];
  treinos: Treino[];
  exercicios: Exercicio[];
  torneios: Torneio[];
  aulasExperimentais: AulaExperimental[];
listasPresenca: ListaPresenca[];  // ← ADICIONAR ESTA LINHA
registrosHorasProfessores: RegistroHorasProfessor[];
  configCT: ConfigCT;
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
export interface AulaExperimentalFormData extends Omit<AulaExperimental, 'id' | 'aluno' | 'professor' | 'historico' | 'criadoEm' | 'atualizadoEm'> {
  professorId?: number; // Tornar opcional
}
export interface ProfessorFormData extends Omit<Professor, 'id'> {}
export interface RegistroHorasFormData extends Omit<RegistroHorasProfessor, 'id' | 'professorNome' | 'registradoPor' | 'registradoEm' | 'editadoPor' | 'editadoEm'> {}

export interface UnidadeFormData extends Omit<Unidade, 'id'> {}
export interface PlanoFormData extends Omit<Plano, 'id'> {}
export interface ProdutoFormData extends Omit<Produto, 'id'> {}
export interface AgendamentoFormData extends Omit<Agendamento, 'id' | 'professor' | 'aluno'> {}
export interface TreinoFormData extends Omit<Treino, 'id' | 'professor'> {}
export interface TransacaoFormData extends Omit<RegistroFinanceiro, 'id' | 'aluno' | 'professor'> {}

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

// Torneios types
export interface Jogador {
  tipo: 'aluno' | 'convidado';
  id?: string;
  nome: string;
}

export interface Dupla {
  id: string;
  nome?: string;
  jogadores: [Jogador, Jogador];
  unidadeId?: string;
  inscritoEm: string; // ISO string
}

export interface Match {
  id: string;
  categoriaId: string;
  fase: 'WB' | 'LB' | 'SF' | 'F' | '3P'; // Winner Bracket, Loser Bracket, Semifinal, Final, 3rd Place
  round: number;
  a?: string; // team id
  b?: string; // team id
  horario?: string; // ISO string
  scores?: Array<{a: number, b: number}>; // Multiple sets for best-of
  placar?: {
    a: number;
    b: number;
  };
  bestOf?: 1 | 3;
  winsToAdvance?: number; // Calculated as Math.ceil(bestOf / 2)
  vencedor?: string;
  perdedor?: string;
  proximoVencedorMatchId?: string;
  proximoPerdedorMatchId?: string;
  status: 'pendente' | 'andamento' | 'finalizado';
  nextMatchId?: string; // ID of the next match
  nextMatchSlot?: 1 | 2; // Which slot (1 or 2) in the next match
}

export interface BracketState {
  status: 'nao-gerado' | 'gerado' | 'em-andamento' | 'finalizado';
  matches: Match[];
  roundAtual?: number;
  configuracao: {
    sorteioInicialSeed?: number;
  };
}

export interface Categoria {
  id: string;
  nome: string;
  limiteDuplas?: number;
  formato: 'single' | 'double'; // single elimination or double elimination
  bestOfSF?: 1 | 3;
  bestOfFinal?: 1 | 3;
  duplas: Dupla[];
  chaveamento: BracketState;
}

export interface Torneio {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  dataInicio?: string; // ISO string
  dataFim?: string; // ISO string
  status: 'Inscrições' | 'Sorteio' | 'Em andamento' | 'Finalizado';
  criadoPor: string;
  categorias: Categoria[];
}

// Export utility types
export type TabKeys = 'dashboard' | 'alunos' | 'professores' | 'gestores' | 'presencas' | 'agendamentos' | 'aulas-experimentais' | 'treinos' | 'planos' | 'unidades' | 'financeiro' | 'produtos' | 'alugueis' | 'configuracoes' | 'metas' | 'torneios' | 'horas-professores' | 'meu-perfil' | 'financeiro-aluno' ;

export interface Tab {
  key: TabKeys;
  label: string;
  icon: React.ComponentType;
  requiredRole?: User['perfil'][];
}
export interface ConversaoData {
  tipoPlano: 'mensalidade' | 'plataforma';
  planoId?: number;
  plataformaParceira?: string;
  dataVencimento?: string;
  observacoes?: string;
}
export interface NivelAula {
  id: number;
  nome: string;
  descricao?: string;
  cor: string;
  ativo: boolean;
}

export interface HorarioFixo {
  id: number;
  unidade: string;
  diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  horaInicio: string;
  horaFim: string;
  capacidade?: number;
  nivelId?: number;
  ativo: boolean;
}

export interface AulaoConfig {
  id: number;
  nome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  unidade: string;
  capacidade?: number;
  nivelId?: number;
  valorEspecial?: number;
  descricao?: string;
  ativo: boolean;
}
export interface AulaoConfigMelhorado {
  id: number;
  nome: string;
  unidade: string;
  horaInicio: string;
  horaFim: string;
  capacidade?: number;
  nivelId?: number;
  valorEspecial?: number;
  descricao?: string;
  ativo: boolean;
  
  // NOVA FUNCIONALIDADE: Tipo de aulão
  tipo: 'fixo-recorrente' | 'extra-pontual';
  
  // Para aulões fixos (todo sábado, toda segunda, etc)
  diaSemana?: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  dataInicio?: string; // Quando começar a repetir
  dataFim?: string; // Quando parar (opcional)
  
  // Para aulões extras (data específica)
  dataEspecifica?: string; // ISO string
  
  // Configurações extras
  configuracao: {
    permiteReposicao?: boolean;
    observacoes?: string;
  };
}

export interface AulaoFormDataMelhorado extends Omit<AulaoConfigMelhorado, 'id'> {
  id?: number;
}
export interface ListaPresenca {
  id: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  unidade: string;
  tipo: 'aula-regular' | 'aulao';
  nivelId?: number;
  capacidade: number;
  status: 'aberta' | 'confirmada' | 'finalizada';
  preCheckins: PreCheckin[];
  presencasConfirmadas: PresencaConfirmada[];
  horarioFixoId?: number;
  aulaoId?: number;
  criadaEm: string;
  atualizadaEm: string;
}

export interface PreCheckin {
  id: number;
  alunoId: number;
  aluno: string;
  horarioCheckin: string;
  cancelado?: boolean;
  motivoCancelamento?: string;
  horarioCancelamento?: string;
}

export interface PresencaConfirmada {
  id: number;
  alunoId: number;
  aluno: string;
  tipo: 'pre-checkin-confirmado' | 'adicionado-pelo-professor';
  status: 'presente' | 'falta';
  professorId?: number;
  professor?: string;
  horarioConfirmacao: string;
  observacoes?: string;
}
// Export canvas types
export * from './canvas';
