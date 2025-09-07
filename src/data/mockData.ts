import type { MockData } from '@/types';

const aulasExperimentaisMock = [
  {
    id: 1,
    alunoId: 999, // ID fictício para novo aluno
    aluno: 'Maria Silva Santos',
    telefone: '(11) 99999-1234',
    email: 'maria.silva@email.com',
    dataAgendamento: '2025-09-05T09:00:00.000Z',
    status: 'agendada' as const,
    professorId: 1,
    professor: 'Carlos Mendes',
    unidade: 'Centro',
    observacoes: 'Primeira aula experimental, interessada em iniciante',
    historico: [
      {
        data: '2025-09-01T10:00:00.000Z',
        statusAnterior: '',
        statusNovo: 'agendada',
        observacao: 'Aula experimental agendada via WhatsApp',
        usuarioResponsavel: 'Recepcionista'
      }
    ],
    criadoEm: '2025-09-01T10:00:00.000Z',
    atualizadoEm: '2025-09-01T10:00:00.000Z'
  },
  {
    id: 2,
    alunoId: 998,
    aluno: 'Carlos Eduardo Oliveira',
    telefone: '(11) 98888-5678',
    email: 'carlos.eduardo@gmail.com',
    dataAgendamento: '2025-09-02T15:30:00.000Z',
    status: 'realizada' as const,
    professorId: 2,
    professor: 'Lucas Ferreira',
    unidade: 'Zona Sul',
    observacoes: 'Aula realizada com sucesso, demonstrou interesse',
    dataRealizacao: '2025-09-02T16:30:00.000Z',
    historico: [
      {
        data: '2025-08-30T14:00:00.000Z',
        statusAnterior: '',
        statusNovo: 'agendada',
        observacao: 'Agendada via telefone',
        usuarioResponsavel: 'Gestor Zona Sul'
      },
      {
        data: '2025-09-02T16:35:00.000Z',
        statusAnterior: 'agendada',
        statusNovo: 'realizada',
        observacao: 'Aula completada, aluno gostou muito',
        usuarioResponsavel: 'Prof. Lucas Ferreira'
      }
    ],
    criadoEm: '2025-08-30T14:00:00.000Z',
    atualizadoEm: '2025-09-02T16:35:00.000Z'
  },
  {
    id: 3,
    alunoId: 997,
    aluno: 'Ana Paula Costa',
    telefone: '(11) 97777-9012',
    email: 'anapaula.costa@hotmail.com',
    dataAgendamento: '2025-08-28T08:00:00.000Z',
    status: 'nao-compareceu' as const,
    professorId: 1,
    professor: 'Carlos Mendes',
    unidade: 'Centro',
    observacoes: 'Não compareceu na data agendada',
    historico: [
      {
        data: '2025-08-25T16:30:00.000Z',
        statusAnterior: '',
        statusNovo: 'agendada',
        observacao: 'Agendada via Instagram',
        usuarioResponsavel: 'Social Media'
      },
      {
        data: '2025-08-28T08:15:00.000Z',
        statusAnterior: 'agendada',
        statusNovo: 'nao-compareceu',
        observacao: 'Aluna não compareceu, sem justificativa',
        usuarioResponsavel: 'Prof. Carlos Mendes'
      }
    ],
    criadoEm: '2025-08-25T16:30:00.000Z',
    atualizadoEm: '2025-08-28T08:15:00.000Z'
  },
  {
    id: 4,
    alunoId: 996,
    aluno: 'Pedro Henrique Alves',
    telefone: '(11) 96666-3456',
    email: 'pedro.alves@empresa.com',
    dataAgendamento: '2025-08-20T18:00:00.000Z',
    status: 'convertido' as const,
    professorId: 2,
    professor: 'Lucas Ferreira',
    unidade: 'Zona Sul',
    observacoes: 'Convertido para Plano Básico',
    dataRealizacao: '2025-08-20T19:00:00.000Z',
    dataConversao: '2025-08-21T10:00:00.000Z',
    planoConvertido: {
      tipo: 'mensalidade' as const,
      planoId: 4
    },
    historico: [
      {
        data: '2025-08-18T11:00:00.000Z',
        statusAnterior: '',
        statusNovo: 'agendada',
        observacao: 'Indicação de amigo',
        usuarioResponsavel: 'Gestor Zona Sul'
      },
      {
        data: '2025-08-20T19:05:00.000Z',
        statusAnterior: 'agendada',
        statusNovo: 'realizada',
        observacao: 'Excelente aula, muito interessado',
        usuarioResponsavel: 'Prof. Lucas Ferreira'
      },
      {
        data: '2025-08-21T10:00:00.000Z',
        statusAnterior: 'realizada',
        statusNovo: 'convertido',
        observacao: 'Convertido para Plano Básico - R$ 150,00/mês',
        usuarioResponsavel: 'Gestor Zona Sul'
      }
    ],
    criadoEm: '2025-08-18T11:00:00.000Z',
    atualizadoEm: '2025-08-21T10:00:00.000Z'
  },
  {
    id: 5,
    alunoId: 995,
    aluno: 'Roberto Machado',
    telefone: '(11) 94444-2468',
    email: 'roberto.machado@gmail.com',
    dataAgendamento: '2025-09-03T16:00:00.000Z',
    status: 'agendada' as const,
    professorId: 3,
    professor: 'Ana Paula Costa',
    unidade: 'Zona Norte',
    observacoes: 'Interessado em aulas para iniciante',
    historico: [
      {
        data: '2025-09-02T14:45:00.000Z',
        statusAnterior: '',
        statusNovo: 'agendada',
        observacao: 'Agendamento via WhatsApp Business',
        usuarioResponsavel: 'Gestor Zona Norte'
      }
    ],
    criadoEm: '2025-09-02T14:45:00.000Z',
    atualizadoEm: '2025-09-02T14:45:00.000Z'
  },
  {
  id: 6,
  alunoId: 5, // Roberto Silva Experimental
  aluno: 'Roberto Silva Experimental',
  telefone: '(11) 95555-5555',
  email: 'roberto.experimental@email.com',
  dataAgendamento: '2025-09-01T09:00:00.000Z',
  status: 'realizada' as const, // STATUS REALIZADA para poder converter
  professorId: 1,
  professor: 'Carlos Mendes',
  unidade: 'Centro',
  observacoes: 'Aula experimental realizada com sucesso',
  dataRealizacao: '2025-09-01T10:00:00.000Z', // Data que foi realizada
  historico: [
    {
      data: '2025-08-30T10:00:00.000Z',
      statusAnterior: '',
      statusNovo: 'agendada',
      observacao: 'Aula experimental agendada',
      usuarioResponsavel: 'Sistema'
    },
    {
      data: '2025-09-01T10:00:00.000Z',
      statusAnterior: 'agendada',
      statusNovo: 'realizada',
      observacao: 'Aula realizada com sucesso, aluno demonstrou interesse',
      usuarioResponsavel: 'Prof. Carlos Mendes'
    }
  ],
  criadoEm: '2025-08-30T10:00:00.000Z',
  atualizadoEm: '2025-09-01T10:00:00.000Z'
}
];

const registrosHorasProfessoresMock: RegistroHorasProfessor[] = [
  {
    id: 1,
    data: '2024-12-01',
    professorId: 1,
    professorNome: 'Carlos Mendes',
    unidade: 'Centro',
    horasTrabalhadas: 4,
    tipoAtividade: 'aula-regular',
    observacoes: 'Aulas regulares da manhã',
    registradoPor: 2,
    registradoEm: '2024-12-01T18:00:00.000Z'
  },
  {
    id: 2,
    data: '2024-12-01',
    professorId: 2,
    professorNome: 'Ana Silva',
    unidade: 'Centro',
    horasTrabalhadas: 6,
    tipoAtividade: 'aula-regular',
    observacoes: 'Turno completo tarde/noite',
    registradoPor: 2,
    registradoEm: '2024-12-01T18:15:00.000Z'
  },
  {
    id: 3,
    data: '2024-12-02',
    professorId: 1,
    professorNome: 'Carlos Mendes',
    unidade: 'Centro',
    horasTrabalhadas: 2,
    tipoAtividade: 'aulao',
    observacoes: 'Aulão especial de sábado',
    registradoPor: 2,
    registradoEm: '2024-12-02T19:00:00.000Z'
  },
  {
    id: 4,
    data: '2024-12-03',
    professorId: 4,
    professorNome: 'Roberto Lima',
    unidade: 'Praia',
    horasTrabalhadas: 3,
    tipoAtividade: 'substituicao',
    observacoes: 'Substituição do professor titular',
    registradoPor: 3,
    registradoEm: '2024-12-03T17:30:00.000Z'
  },
  {
    id: 5,
    data: '2024-12-04',
    professorId: 2,
    professorNome: 'Ana Silva',
    unidade: 'Centro',
    horasTrabalhadas: 1,
    tipoAtividade: 'administrativo',
    observacoes: 'Reunião de planejamento mensal',
    registradoPor: 2,
    registradoEm: '2024-12-04T15:00:00.000Z'
  },
  {
    id: 6,
    data: '2024-12-05',
    professorId: 1,
    professorNome: 'Carlos Mendes',
    unidade: 'Centro',
    horasTrabalhadas: 5,
    tipoAtividade: 'aula-regular',
    observacoes: 'Aulas da quinta-feira',
    registradoPor: 2,
    registradoEm: '2024-12-05T18:30:00.000Z'
  }
];

export const mockData: MockData = {
  planos: [
    // Unidade Centro
    { id: 1, nome: 'Plano Básico (2x/semana)', preco: 120.00, unidade: 'Centro' },
    { id: 2, nome: 'Plano Intermediário (3x/semana)', preco: 150.00, unidade: 'Centro' },
    { id: 3, nome: 'Plano Avançado (Livre)', preco: 180.00, unidade: 'Centro' },
    
    // Unidade Zona Sul
    { id: 4, nome: 'Plano Básico (2x/semana)', preco: 150.00, unidade: 'Zona Sul' },
    { id: 5, nome: 'Plano Intermediário (3x/semana)', preco: 180.00, unidade: 'Zona Sul' },
    { id: 6, nome: 'Plano Avançado (Livre)', preco: 220.00, unidade: 'Zona Sul' },
    
    // Unidade Zona Norte
    { id: 7, nome: 'Plano Básico (2x/semana)', preco: 110.00, unidade: 'Zona Norte' },
    { id: 8, nome: 'Plano Intermediário (3x/semana)', preco: 140.00, unidade: 'Zona Norte' },
    { id: 9, nome: 'Plano Avançado (Livre)', preco: 170.00, unidade: 'Zona Norte' },
    
    // Unidade Barra
    { id: 10, nome: 'Plano Básico (2x/semana)', preco: 160.00, unidade: 'Barra' },
    { id: 11, nome: 'Plano Intermediário (3x/semana)', preco: 190.00, unidade: 'Barra' },
    { id: 12, nome: 'Plano Avançado (Livre)', preco: 230.00, unidade: 'Barra' },
  ],
  
  // Correção para o mockData.ts - apenas a seção de alunos

alunos: [
  { 
    id: 1, 
    nome: 'João Silva', 
    telefone: '(11) 99999-9999', 
    email: 'joao@email.com', 
    tipoPlano: 'plataforma',
    plataformaParceira: 'Wellhub',
    unidade: 'Centro',
    status: 'ativo', 
    vencimento: '2025-07-15', 
    senha: '123456', 
    nivel: 'intermediario', 
    dataMatricula: '2024-01-15', 
    objetivo: 'Competição',
    ativo: true 
  },
  { 
    id: 2, 
    nome: 'Maria Santos', 
    telefone: '(11) 88888-8888', 
    email: 'maria@email.com', 
    tipoPlano: 'mensalidade',
    planoId: 4, // CORRIGIDO: era 1, agora é 4 (Plano Básico Zona Sul - R$ 150,00)
    unidade: 'Zona Sul',
    status: 'ativo', 
    vencimento: '2025-07-20', 
    senha: '123456', 
    nivel: 'iniciante', 
    dataMatricula: '2024-03-20', 
    objetivo: 'Lazer',
    ativo: true 
  },
  { 
    id: 3, 
    nome: 'Pedro Costa', 
    telefone: '(11) 77777-7777', 
    email: 'pedro@email.com', 
    tipoPlano: 'mensalidade',
    planoId: 9, // CORRIGIDO: era 3, agora é 9 (Plano Avançado Zona Norte - R$ 170,00)
    unidade: 'Zona Norte',
    status: 'pendente', 
    vencimento: '2025-07-10', 
    senha: '123456', 
    nivel: 'avancado', 
    dataMatricula: '2023-11-10', 
    objetivo: 'Fitness',
    ativo: true 
  },
  { 
    id: 4, 
    nome: 'Ana Oliveira', 
    telefone: '(11) 66666-6666', 
    email: 'ana@email.com', 
    tipoPlano: 'plataforma',
    plataformaParceira: 'TotalPass',
    unidade: 'Barra',
    status: 'ativo', 
    vencimento: '2025-08-01', 
    senha: '123456', 
    nivel: 'intermediario', 
    dataMatricula: '2024-02-05', 
    objetivo: 'Competição',
    ativo: true 
  },
  // ADICIONAR ao final do array de alunos:
{ 
  id: 5, 
  nome: 'Roberto Silva Experimental', 
  telefone: '(11) 95555-5555', 
  email: 'roberto.experimental@email.com', 
  tipoPlano: 'experimental', // NÃO tem plano ativo
  unidade: 'Centro',
  status: 'pendente', 
  vencimento: '', 
  senha: '123456', 
  nivel: 'iniciante', 
  dataMatricula: '2024-09-01', 
  objetivo: 'Conhecer o esporte',
  ativo: true 
},
{ 
  id: 6, 
  nome: 'Marina Costa Teste', 
  telefone: '(11) 94444-4444', 
  email: 'marina.teste@email.com', 
  tipoPlano: 'experimental', // NÃO tem plano ativo
  unidade: 'Zona Sul',
  status: 'pendente', 
  vencimento: '', 
  senha: '123456', 
  nivel: 'iniciante', 
  dataMatricula: '2024-09-02', 
  objetivo: 'Experimentar',
  ativo: true 
},
{ 
  id: 7, 
  nome: 'Carlos Experimental Norte', 
  telefone: '(11) 93333-3333', 
  email: 'carlos.norte@email.com', 
  tipoPlano: 'experimental', // NÃO tem plano ativo
  unidade: 'Zona Norte',
  status: 'pendente', 
  vencimento: '', 
  senha: '123456', 
  nivel: 'iniciante', 
  dataMatricula: '2024-09-03', 
  objetivo: 'Testar aulas',
  ativo: true 
}
],



// REFERÊNCIA DOS PLANOS POR UNIDADE:
// Centro: IDs 1, 2, 3 (R$ 120, 150, 180)
// Zona Sul: IDs 4, 5, 6 (R$ 150, 180, 220) 
// Zona Norte: IDs 7, 8, 9 (R$ 110, 140, 170)
// Barra: IDs 10, 11, 12 (R$ 160, 190, 230)

  professores: [
    { 
      id: 1, 
      nome: 'Carlos Mendes', 
      telefone: '(11) 91111-1111', 
      email: 'carlos@email.com', 
      senha: '123456',
      tipoPagamento: 'variavel',
      valoresVariaveis: {
        uma: 25,
        duas: 22,
        tres: 20
      },
	  valorAulao: 120, // ← ADICIONE ESTA LINHA
      especialidades: ['Futevôlei de Praia', 'Técnicas de Defesa', 'Treinamento Avançado'],
      experiencia: '5-10',
      observacoes: 'Professor experiente, especialista em defesa',
      ativo: true
    },
    { 
      id: 2, 
      nome: 'Lucas Ferreira', 
      telefone: '(11) 92222-2222', 
      email: 'lucas@email.com', 
      senha: '123456',
      tipoPagamento: 'fixo',
      valorFixo: 45,
	  valorAulao: 80, // ← ADICIONE ESTA LINHA
      especialidades: ['Fundamentos Básicos', 'Treinamento Iniciantes'],
      experiencia: '1-3',
      observacoes: 'Ótimo com iniciantes, muito didático',
      ativo: true
    },
    { 
      id: 3, 
      nome: 'Ana Paula Costa', 
      telefone: '(11) 93333-3333', 
      email: 'anapaula@email.com', 
      senha: '123456',
      tipoPagamento: 'variavel',
      valoresVariaveis: {
        uma: 30,
        duas: 25,
        tres: 22
      },
	  valorAulao: 150, // ← ADICIONE ESTA LINHA
      especialidades: ['Técnicas de Ataque', 'Competições', 'Condicionamento Físico'],
      experiencia: '10+',
      observacoes: 'Ex-atleta profissional, especialista em alto rendimento',
      ativo: true
    }
  ],

  unidades: [
    { 
      id: 1, 
      nome: 'Centro', 
      endereco: 'Rua das Palmeiras, 123 - Centro', 
      telefone: '(11) 3000-1000', 
      email: 'centro@futevolei.com', 
      gestorId: 1, 
      ativa: true,
      socios: [
        { id: 1, nome: 'João Silva', percentual: 60, ativo: true },
        { id: 2, nome: 'Maria Santos', percentual: 40, ativo: true }
      ],
      configuracoes: {
        horarioFuncionamento: {
          inicio: '06:00',
          fim: '22:00'
        },
        capacidadeMaxima: 50
      }
    },
    { 
      id: 2, 
      nome: 'Zona Sul', 
      endereco: 'Av. Atlântica, 456 - Copacabana', 
      telefone: '(11) 3000-2000', 
      email: 'zonasul@futevolei.com', 
      gestorId: 2, 
      ativa: true,
      socios: [
        { id: 3, nome: 'Pedro Costa', percentual: 50, ativo: true },
        { id: 4, nome: 'Ana Oliveira', percentual: 30, ativo: true },
        { id: 5, nome: 'Carlos Mendes', percentual: 20, ativo: true }
      ],
      configuracoes: {
        horarioFuncionamento: {
          inicio: '07:00',
          fim: '23:00'
        },
        capacidadeMaxima: 80
      }
    },
    { 
      id: 3, 
      nome: 'Zona Norte', 
      endereco: 'Rua do Futevôlei, 789 - Tijuca', 
      telefone: '(11) 3000-3000', 
      email: 'zonanorte@futevolei.com', 
      gestorId: 3, 
      ativa: true,
      configuracoes: {
        horarioFuncionamento: {
          inicio: '06:30',
          fim: '21:30'
        },
        capacidadeMaxima: 40
      }
    },
    { 
      id: 4, 
      nome: 'Barra', 
      endereco: 'Av. das Américas, 1000 - Barra da Tijuca', 
      telefone: '(11) 3000-4000', 
      email: 'barra@futevolei.com', 
      gestorId: 4, 
      ativa: true,
      socios: [
        { id: 6, nome: 'Lucas Ferreira', percentual: 100, ativo: true }
      ],
      configuracoes: {
        horarioFuncionamento: {
          inicio: '06:00',
          fim: '22:30'
        },
        capacidadeMaxima: 60
      }
    }
  ],

  presencas: [
    { id: 1, alunoId: 1, aluno: 'João Silva', professorId: 1, professor: 'Carlos Mendes', data: '2025-07-01', hora: '08:00', unidade: 'Centro', tipo: 'treino', status: 'presente' },
    { id: 2, alunoId: 2, aluno: 'Maria Santos', professorId: 2, professor: 'Lucas Ferreira', data: '2025-07-01', hora: '09:00', unidade: 'Zona Sul', tipo: 'aula', status: 'presente' },
    { id: 3, alunoId: 3, aluno: 'Pedro Costa', professorId: 3, professor: 'Ana Paula Costa', data: '2025-07-02', hora: '10:00', unidade: 'Zona Norte', tipo: 'treino', status: 'falta' },
    { id: 4, alunoId: 4, aluno: 'Ana Oliveira', professorId: 1, professor: 'Carlos Mendes', data: '2025-07-02', hora: '11:00', unidade: 'Barra', tipo: 'individual', status: 'presente' },
    { id: 5, alunoId: 1, aluno: 'João Silva', professorId: 2, professor: 'Lucas Ferreira', data: '2025-07-03', hora: '08:00', unidade: 'Centro', tipo: 'aula', status: 'presente' }
  ],

  financeiro: [
    { id: 1, alunoId: 1, aluno: 'João Silva', valor: 150, data: '2025-07-05', status: 'pago', tipo: 'receita', categoria: 'Mensalidade', metodo: 'mensalidade', descricao: 'Mensalidade Julho', unidade: 'Centro' },
    { id: 2, alunoId: 2, aluno: 'Maria Santos', valor: 120, data: '2025-07-03', status: 'pago', tipo: 'receita', categoria: 'Mensalidade', metodo: 'mensalidade', descricao: 'Mensalidade Julho', unidade: 'Zona Sul' },
    { id: 3, alunoId: 3, aluno: 'Pedro Costa', valor: 180, data: '2025-07-01', status: 'pendente', tipo: 'receita', categoria: 'Mensalidade', metodo: 'mensalidade', descricao: 'Mensalidade Julho', unidade: 'Zona Norte' },
    { id: 4, alunoId: 4, aluno: 'Ana Oliveira', valor: 50, data: '2025-07-06', status: 'pago', tipo: 'receita', categoria: 'Diária', metodo: 'diaria-dinheiro', descricao: 'Diária avulsa', unidade: 'Barra' },
    { id: 5, valor: 500, data: '2025-07-01', status: 'pago', tipo: 'despesa', categoria: 'Aluguel', metodo: 'aluguel', descricao: 'Aluguel Quadra', unidade: 'Centro' },
    { id: 6, valor: 45.50, data: '2025-07-02', status: 'pago', tipo: 'receita', categoria: 'Plataforma', metodo: 'diaria-plataforma', descricao: 'Wellhub (Gympass)', unidade: 'Centro' },
    // Additional sample data for testing
    { id: 7, alunoId: 2, aluno: 'Maria Santos', valor: 30, data: '2025-07-07', status: 'pago', tipo: 'receita', categoria: 'Produto', metodo: 'dinheiro', descricao: 'Venda Isotônico', unidade: 'Zona Sul' },
    { id: 8, valor: 200, data: '2025-07-05', status: 'pago', tipo: 'despesa', categoria: 'Manutenção', metodo: 'transferencia', descricao: 'Manutenção rede', unidade: 'Zona Sul' },
    { id: 9, alunoId: 3, aluno: 'Pedro Costa', valor: 25, data: '2025-07-08', status: 'pendente', tipo: 'receita', categoria: 'Produto', metodo: 'pix', descricao: 'Protetor Solar', unidade: 'Zona Norte' },
    { id: 10, valor: 300, data: '2025-07-06', status: 'pago', tipo: 'despesa', categoria: 'Equipamento', metodo: 'cartao-credito', descricao: 'Bolas futevôlei', unidade: 'Barra' },
    { id: 11, alunoId: 1, aluno: 'João Silva', valor: 15, data: '2025-07-09', status: 'pago', tipo: 'receita', categoria: 'Produto', metodo: 'dinheiro', descricao: 'Água + Isotônico', unidade: 'Centro' },
    { id: 12, valor: 400, data: '2025-07-04', status: 'pendente', tipo: 'despesa', categoria: 'Aluguel', metodo: 'aluguel', descricao: 'Aluguel Quadra', unidade: 'Zona Norte' }
  ],

  produtos: [
    { id: 1, nome: 'Água 500ml', preco: 3.00, categoria: 'Bebidas', estoque: 50, unidade: 'Centro' },
    { id: 2, nome: 'Isotônico', preco: 5.00, categoria: 'Bebidas', estoque: 30, unidade: 'Centro' },
    { id: 3, nome: 'Toalha Personalizada', preco: 25.00, categoria: 'Acessórios', estoque: 15, unidade: 'Zona Sul' },
    { id: 4, nome: 'Protetor Solar', preco: 35.00, categoria: 'Cuidados', estoque: 10, unidade: 'Barra' }
  ],

  plataformas: [
    { id: 1, nome: 'Wellhub', taxa: 15, unidade: 'Centro', ativa: true },
    { id: 2, nome: 'TotalPass', taxa: 18, unidade: 'Zona Sul', ativa: true },
    { id: 3, nome: 'Gympass', taxa: 20, unidade: 'Zona Norte', ativa: false }
  ],

  horarios: [
    { id: 1, dia: 'Segunda', inicio: '08:00', fim: '09:00', professorId: 1, professor: 'Carlos Mendes', unidade: 'Centro', tipo: 'aula', capacidade: 8 },
    { id: 2, dia: 'Terça', inicio: '09:00', fim: '10:00', professorId: 2, professor: 'Lucas Ferreira', unidade: 'Zona Sul', tipo: 'treino', capacidade: 6 },
    { id: 3, dia: 'Quarta', inicio: '10:00', fim: '11:00', professorId: 3, professor: 'Ana Paula Costa', unidade: 'Zona Norte', tipo: 'aula', capacidade: 10 }
  ],

  gestores: [
    { id: 1, nome: 'Roberto Silva', telefone: '(11) 94444-4444', email: 'roberto@futevolei.com', senha: '123456', cargo: 'Gerente Geral', unidades: ['Centro'], permissoes: ['admin'], ativo: true },
    { id: 2, nome: 'Carla Mendes', telefone: '(11) 95555-5555', email: 'carla@futevolei.com', senha: '123456', cargo: 'Supervisora', unidades: ['Zona Sul'], permissoes: ['gestor'], ativo: true },
    { id: 3, nome: 'Paulo Santos', telefone: '(11) 96666-6666', email: 'paulo@futevolei.com', senha: '123456', cargo: 'Gestor Regional', unidades: ['Zona Norte', 'Barra'], permissoes: ['gestor'], ativo: true }
  ],

  metas: [
    { id: 1, tipo: 'Receita Mensal', meta: 50000, atual: 35000, periodo: '2025-07', unidade: 'Centro' },
    { id: 2, tipo: 'Novos Alunos', meta: 20, atual: 15, periodo: '2025-07', unidade: 'Zona Sul' }
  ],

  metasGerais: [
    {
      id: '1',
      titulo: 'Aumentar receita do CT',
      descricao: 'Meta para aumentar a receita total do centro de treinamento',
      escopo: 'CT' as const,
      valorAlvo: 100000,
      valorAtual: 65000,
      prazo: '2024-12-31',
      responsavel: 'Diretor Geral',
      criadoEm: '2024-01-01T00:00:00.000Z',
      atualizadoEm: '2024-07-15T10:30:00.000Z'
    },
    {
      id: '2',
      titulo: 'Captação de novos alunos - Centro',
      descricao: 'Aumentar número de alunos matriculados na unidade Centro',
      escopo: 'Unidade' as const,
      unidadeId: 'Centro',
      valorAlvo: 150,
      valorAtual: 120,
      prazo: '2024-08-31',
      responsavel: 'João Santos',
      criadoEm: '2024-06-01T00:00:00.000Z',
      atualizadoEm: '2024-07-15T14:20:00.000Z'
    },
    {
      id: '3',
      titulo: 'Melhoria de equipamentos - Zona Sul',
      descricao: 'Renovar e melhorar equipamentos da unidade',
      escopo: 'Unidade' as const,
      unidadeId: 'Zona Sul',
      valorAlvo: 50000,
      valorAtual: 30000,
      prazo: '2024-09-30',
      responsavel: 'Maria Silva',
      criadoEm: '2024-05-15T00:00:00.000Z',
      atualizadoEm: '2024-07-10T16:45:00.000Z'
    }
  ],

  alugueis: [
    { id: 1, cliente: 'Empresa XYZ', telefone: '(11) 3000-9000', data: '2025-07-15', horario: '14:00', duracao: 2, valor: 200, status: 'confirmado', unidade: 'Centro' },
    { id: 2, cliente: 'Grupo ABC', telefone: '(11) 3000-8000', data: '2025-07-20', horario: '16:00', duracao: 1, valor: 120, status: 'pendente', unidade: 'Barra' }
  ],

  agendamentos: [
    {
      id: 1,
      alunoId: 1,
      aluno: 'João Silva',
      professorId: 1,
      professor: 'Carlos Mendes',
      data: '2024-01-15',
      horaInicio: '09:00',
      horaFim: '10:00',
      tipo: 'aula',
      unidade: 'Centro',
      status: 'confirmado',
      observacoes: 'Aula particular de técnica'
    },
    {
      id: 2,
      professorId: 2,
      professor: 'Ana Paula Costa',
      data: '2024-01-15',
      horaInicio: '14:00',
      horaFim: '15:30',
      tipo: 'treino',
      unidade: 'Centro',
      status: 'confirmado'
    }
  ],

  exercicios: [
    {
      id: 1,
      nome: 'Aquecimento Articular',
      duracao: 10,
      descricao: 'Movimentação articular para preparar o corpo',
      categoria: 'aquecimento',
      equipamentos: [],
      nivel: 'iniciante'
    },
    {
      id: 2,
      nome: 'Controle de Bola',
      duracao: 15,
      descricao: 'Exercícios de domínio e controle da bola',
      categoria: 'tecnica',
      equipamentos: ['Bola', 'Cones'],
      nivel: 'intermediario'
    },
    {
      id: 3,
      nome: 'Movimentação em Dupla',
      duracao: 20,
      descricao: 'Trabalho de coordenação entre duplas',
      categoria: 'tatica',
      equipamentos: ['Bola', 'Rede'],
      nivel: 'intermediario'
    }
  ],

  treinos: [
    {
      id: 1,
      nome: 'Treino Técnico - Iniciantes',
      tipo: 'tecnico',
      nivel: 'iniciante',
      duracao: 60,
      objetivo: 'Desenvolver técnicas básicas de futevôlei',
      equipamentos: ['Bola', 'Cones', 'Rede'],
      exercicios: [
        { id: '1', nome: 'Aquecimento Articular', duracao: 10, descricao: 'Preparação do corpo', ordem: 1 },
        { id: '2', nome: 'Controle de Bola', duracao: 15, descricao: 'Domínio básico', ordem: 2 }
      ],
      observacoes: 'Treino focado em fundamentos',
      professorId: 1,
      professor: 'Carlos Mendes',
      unidade: 'Centro',
      data: '2024-01-15',
      status: 'concluido'
    }
  ],

  torneios: [],
  
  
  aulasExperimentais: aulasExperimentaisMock,
  registrosHorasProfessores: registrosHorasProfessoresMock, // ← ADICIONAR ESTA LINHA

  configCT: {
  nomeCT: 'Gestão FTV',
  contato: {
    email: 'contato@futevolei.com',
    telefone: '(11) 3000-0000'
  },
  horarioFuncionamentoPadrao: {
    inicio: '06:00',
    fim: '22:00'
  },
  branding: {
    logoUrl: ''
  },
  
  // ======= ADICIONAR ESTAS CONFIGURAÇÕES =======
  niveisAula: [
    {
      id: 1,
      nome: 'Iniciante',
      descricao: 'Para quem está começando no futevôlei',
      cor: '#10B981',
      ativo: true
    },
    {
      id: 2,
      nome: 'Intermediário', 
      descricao: 'Para praticantes com experiência básica',
      cor: '#F59E0B',
      ativo: true
    },
    {
      id: 3,
      nome: 'Avançado',
      descricao: 'Para jogadores experientes', 
      cor: '#EF4444',
      ativo: true
    }
  ],
  
  horariosFixos: [
    {
      id: 1,
      unidade: 'Centro',
      diaSemana: 'segunda',
      horaInicio: '08:00',
      horaFim: '09:00',
      capacidade: 8,
      nivelId: 1,
      ativo: true
    },
    {
      id: 2,
      unidade: 'Centro', 
      diaSemana: 'segunda',
      horaInicio: '18:00',
      horaFim: '19:00',
      capacidade: undefined,
      nivelId: 3,
      ativo: true
    },
    {
      id: 3,
      unidade: 'Zona Sul',
      diaSemana: 'terca',
      horaInicio: '19:00', 
      horaFim: '20:00',
      capacidade: 10,
      ativo: true
    }
  ],
  
  aulaoes: [
    {
      id: 1,
      nome: 'Aulão de Final de Semana',
      data: '2025-09-06',
      horaInicio: '10:00',
      horaFim: '12:00', 
      unidade: 'Centro',
      capacidade: 30,
      valorEspecial: 50.00,
      descricao: 'Aulão especial com técnicas avançadas',
      ativo: true
    }
  ],
  
  aulaoesMelhorados: [
    {
      id: 1,
      nome: "Aulão de Sábado",
      tipo: "fixo-recorrente",
      diaSemana: "sabado",
      dataInicio: "2024-01-01",
      unidade: "Centro",
      horaInicio: "08:00",
      horaFim: "10:00",
      capacidade: 30,
      valorEspecial: 50,
      descricao: "Aulão semanal para todos os níveis",
      ativo: true,
      configuracao: {
        permiteReposicao: true,
        observacoes: "Trazer água e toalha"
      }
    },
    {
      id: 2,
      nome: "Aulão Especial de Natal",
      tipo: "extra-pontual",
      dataEspecifica: "2024-12-25",
      unidade: "Centro",
      horaInicio: "09:00",
      horaFim: "12:00",
      capacidade: 50,
      valorEspecial: 80,
      descricao: "Aulão especial de Natal",
      ativo: true,
      configuracao: {
        permiteReposicao: false,
        observacoes: "Evento especial"
      }
    }
  ],
  
  configuracaoPresenca: {
    permiteCheckinSemLimite: true,
    lembreteAutomatico: true,
    horarioLembreteMinutos: 30
  }
},
listasPresenca: []
};