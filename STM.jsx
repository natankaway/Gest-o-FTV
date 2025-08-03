// Na linha dos imports no topo do arquivo, onde estão todos os ícones do lucide-react:
import React, { useState, useEffect, useRef, useCallback, createContext,  useContext, memo, useMemo, lazy, Suspense } from 'react';
import { Users, Calendar, DollarSign, BarChart3, Plus, Copy, ToggleLeft, Key, ToggleRight, Search, Filter, Bell, Menu, X, User, Zap, BookOpen, BarChart, Undo, Redo, Share2, Clock, CheckCircle, AlertCircle , ArrowRight, Edit3, Type, Eraser, Save, Trash, Minimize, Maximize, CreditCard, BookOpen, Target, Award, Settings, LogOut, ChevronRight, Star, TrendingUp, Activity, Phone, Mail, Moon, Sun, ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownLeft, ShoppingCart, MinusCircle, PlusCircle, ChevronDown, Edit, Package, MapPin, Circle, Building, Download, Upload, FileSpreadsheet, Eye, EyeOff } from 'lucide-react';

// 🎨 Barras adaptativas - VERSÃO MAIS VISÍVEL
const criarBarraRolagemBonita = () => {
  if (typeof document !== 'undefined') {
    
    const estiloAntigo = document.getElementById('barras-bonitas-sistema');
    if (estiloAntigo) {
      estiloAntigo.remove();
    }
    
    const estilosCSS = `
      /* 🎯 BARRA DO MENU (mantém perfeita) */
      .menu-barra-bonita::-webkit-scrollbar {
        width: 6px;
      }
      
      .menu-barra-bonita::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
        margin: 8px 0;
      }
      
      .menu-barra-bonita::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.25);
        border-radius: 3px;
        transition: all 0.2s ease;
      }
      
      .menu-barra-bonita::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
      }
      
      /* 🌟 SISTEMA - MUITO MAIS VISÍVEL */
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      /* 🌞 MODO CLARO - OPACIDADE ALTA PARA SER VISÍVEL */
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.08);  /* ✅ Track mais visível */
        border-radius: 3px;
        margin: 8px 0;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.4);   /* ✅ 40% bem visível */
        border-radius: 3px;
        transition: all 0.2s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.6);   /* ✅ 60% no hover */
      }
      
      /* 🌙 MODO ESCURO - Mantém perfeito */
      .dark ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.08);
      }
      
      .dark ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.25);
      }
      
      .dark ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
      }
      
      /* 🦊 FIREFOX - Opacidades altas */
      /* Modo claro - bem visível */
      html:not(.dark) * {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.08);
      }
      
      /* Modo escuro - mantém perfeito */
      .dark * {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.25) rgba(255, 255, 255, 0.08);
      }
      
      /* Menu no Firefox */
      .menu-barra-bonita {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.25) rgba(255, 255, 255, 0.08);
      }
    `;

    const novoEstilo = document.createElement("style");
    novoEstilo.type = "text/css";
    novoEstilo.id = "barras-bonitas-sistema";
    novoEstilo.innerText = estilosCSS;
    document.head.appendChild(novoEstilo);
  }
};

if (typeof window !== 'undefined') {
  criarBarraRolagemBonita();
}
// Simulando react-hot-toast para o exemplo
const toast = {
  success: (message) => console.log('✅ SUCCESS:', message),
  error: (message) => console.log('❌ ERROR:', message),
  warn: (message) => console.log('⚠️ WARNING:', message),
  promise: (promise, options) => promise
};

const Toaster = () => null; // Placeholder

// ===============================
// LAZY LOADING DE COMPONENTES
// ===============================


// ===============================
// UTILITÁRIOS E HELPERS
// ===============================
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

const exportToCSV = (data, filename) => {
  try {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar:', error);
    toast.error('Erro ao exportar dados');
  }
};

// 🔧 HOOK CORRIGIDO - SUBSTITUA O ANTIGO
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      
      // 🔧 CORREÇÃO: Verificar se item existe e não é null/undefined
      if (item === null || item === undefined || item === 'undefined') {
        return initialValue;
      }
      
      // Tentar fazer parse apenas se item é uma string válida
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao carregar do localStorage:`, error);
      // 🔧 CORREÇÃO: Limpar item corrompido do localStorage
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Erro ao limpar localStorage:`, removeError);
      }
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      
      if (typeof window !== 'undefined') {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar no localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// ===============================
// CONTEXTS
// ===============================
const ThemeContext = createContext();
const AppStateContext = createContext();
const NotificationContext = createContext();

// Theme Provider com localStorage
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-dark-mode', false);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
    toast.success(`Tema ${!isDarkMode ? 'escuro' : 'claro'} ativado`);
  }, [isDarkMode, setIsDarkMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(isDarkMode ? 'light' : 'dark');
    root.classList.add(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Dados mockados expandidos
const mockData = {
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
alunos: [
  { 
    id: 1, 
    nome: 'João Silva', 
    telefone: '(11) 99999-9999', 
    email: 'joao@email.com', 
    tipoPlano: 'plataforma', // 🆕 Usar plataforma
    plataformaParceira: 'Wellhub', // 🆕 Plataforma utilizada
    unidade: 'Centro', // 🆕 Unidade do aluno
    status: 'ativo', 
    vencimento: '2025-07-15', 
    senha: '123456', 
    nivel: 'intermediario', 
    dataMatricula: '2024-01-15', 
    objetivo: 'Competição' 
  },
  { 
    id: 2, 
    nome: 'Maria Santos', 
    telefone: '(11) 88888-8888', 
    email: 'maria@email.com', 
    tipoPlano: 'mensalidade', // 🆕 Mensalidade normal
    planoId: 1, 
    unidade: 'Zona Sul', // 🆕 Unidade do aluno
    status: 'ativo', 
    vencimento: '2025-07-20', 
    senha: '123456', 
    nivel: 'iniciante', 
    dataMatricula: '2024-03-20', 
    objetivo: 'Lazer' 
  },
  { 
    id: 3, 
    nome: 'Pedro Costa', 
    telefone: '(11) 77777-7777', 
    email: 'pedro@email.com', 
    tipoPlano: 'mensalidade', // 🆕 Mensalidade normal
    planoId: 3, 
    unidade: 'Zona Norte', // 🆕 Unidade do aluno
    status: 'pendente', 
    vencimento: '2025-07-10', 
    senha: '123456', 
    nivel: 'avancado', 
    dataMatricula: '2023-11-10', 
    objetivo: 'Fitness' 
  },
  { 
    id: 4, 
    nome: 'Ana Oliveira', 
    telefone: '(11) 66666-6666', 
    email: 'ana@email.com', 
    tipoPlano: 'plataforma', // 🆕 Usar plataforma
    plataformaParceira: 'TotalPass', // 🆕 Plataforma utilizada
    unidade: 'Barra', // 🆕 Unidade do aluno
    status: 'ativo', 
    vencimento: '2025-08-01', 
    senha: '123456', 
    nivel: 'intermediario', 
    dataMatricula: '2024-02-05', 
    objetivo: 'Competição' 
  }
],
 professores: [
    { 
      id: 1, 
      nome: 'Carlos Mendes', 
      telefone: '(11) 91111-1111', 
      email: 'carlos@email.com', 
      senha: '123456',
      tipoPagamento: 'variavel', // 🆕 Novo campo
      valoresVariaveis: { // 🆕 Novo campo
        uma: 25,
        duas: 22,
        tres: 20
      },
      especialidades: ['Futevôlei de Praia', 'Técnicas de Defesa', 'Treinamento Avançado'], // 🆕
      experiencia: '5-10', // 🆕
      observacoes: 'Professor experiente, especialista em defesa', // 🆕
      ativo: true
    },
    { 
      id: 2, 
      nome: 'Lucas Ferreira', 
      telefone: '(11) 92222-2222', 
      email: 'lucas@email.com', 
      senha: '123456',
      tipoPagamento: 'fixo', // 🆕 Novo campo
      valorFixo: 45, // 🆕 Novo campo
      especialidades: ['Fundamentos Básicos', 'Treinamento Iniciantes'], // 🆕
      experiencia: '1-3', // 🆕
      observacoes: 'Ótimo com iniciantes, muito didático', // 🆕
      ativo: true
    },
    { 
      id: 3, 
      nome: 'Ana Paula Costa', 
      telefone: '(11) 93333-3333', 
      email: 'anapaula@email.com', 
      senha: '123456',
      tipoPagamento: 'variavel', // 🆕 Novo campo
      valoresVariaveis: { // 🆕 Novo campo
        uma: 30,
        duas: 25,
        tres: 22
      },
      especialidades: ['Técnicas de Ataque', 'Competições', 'Condicionamento Físico'], // 🆕
      experiencia: '10+', // 🆕
      observacoes: 'Ex-atleta profissional, especialista em alto rendimento', // 🆕
      ativo: true
    }
  ],
  financeiro: [
    { id: 1, alunoId: 1, aluno: 'João Silva', valor: 150, data: '2025-07-05', status: 'pago', tipo: 'receita', metodo: 'mensalidade', descricao: 'Mensalidade Julho' },
    { id: 2, alunoId: 2, aluno: 'Maria Santos', valor: 120, data: '2025-07-03', status: 'pago', tipo: 'receita', metodo: 'mensalidade', descricao: 'Mensalidade Julho' },
    { id: 3, alunoId: 3, aluno: 'Pedro Costa', valor: 180, data: '2025-07-01', status: 'pendente', tipo: 'receita', metodo: 'mensalidade', descricao: 'Mensalidade Julho' },
    { id: 4, alunoId: 4, aluno: 'Ana Oliveira', valor: 50, data: '2025-07-06', status: 'pago', tipo: 'receita', metodo: 'diaria-dinheiro', descricao: 'Diária avulsa' },
    { id: 5, valor: 500, data: '2025-07-01', status: 'pago', tipo: 'despesa', metodo: 'aluguel', descricao: 'Aluguel Quadra' },
    { id: 6, valor: 45.50, data: '2025-07-02', status: 'pago', tipo: 'receita', metodo: 'diaria-plataforma', descricao: 'Wellhub (Gympass)' },
  ],
  treinos: [
    { 
      id: 1, 
      titulo: 'Treino de Defesa 2x2', 
      professorId: 1, 
      professor: 'Carlos Mendes', 
      data: '2025-07-01', 
      descricao: 'Foco em recepção de saque e posicionamento defensivo.', 
      duracao: 60, 
      nivel: 'intermediario',
      // NOVO CAMPO: Guarda o estado da prancheta para este treino
      pranchetaData: {
        items: [
          { id: 101, type: 'player1', x: 150, y: 200 },
          { id: 102, type: 'player1', x: 350, y: 200 },
          { id: 103, type: 'player2', x: 250, y: 500 },
          { id: 104, type: 'ball', x: 250, y: 450 },
        ]
      }
    },
    { 
      id: 2, 
      titulo: 'Ataque e Finalização', 
      professorId: 1, 
      professor: 'Carlos Mendes', 
      data: '2025-07-02', 
      descricao: 'Técnicas de ataque, cortadas e pingo.', 
      duracao: 90, 
      nivel: 'avancado',
      pranchetaData: {
        items: [
          { id: 201, type: 'player1', x: 150, y: 200 },
          { id: 202, type: 'ball', x: 160, y: 250 },
          { id: 203, type: 'arrow', fromX: 160, fromY: 250, toX: 250, toY: 100, color: '#ef4444' },
        ]
      }
    },
    { 
      id: 3, 
      titulo: 'Fundamentos Básicos', 
      professorId: 2, 
      professor: 'Lucas Ferreira', 
      data: '2025-07-03', 
      descricao: 'Manchete, toque e saque para iniciantes.', 
      duracao: 45, 
      nivel: 'iniciante',
      pranchetaData: {
        items: [
          { id: 301, type: 'player1', x: 250, y: 200 },
          { id: 302, type: 'text', text: 'Posição Base', x: 250, y: 150, color: '#000000', fontSize: 16, style: 'bold' }
        ]
      }
    }
  ],
  unidades: [
    { id: 1, nome: 'CT Copacabana', endereco: 'Praia de Copacabana, Rio de Janeiro - RJ', telefone: '(21) 99999-9999', email: 'copacabana@boraporct.com', responsavel: 'Carlos Mendes', ativo: true },
    { id: 2, nome: 'CT Ipanema', endereco: 'Praia de Ipanema, Rio de Janeiro - RJ', telefone: '(21) 88888-8888', email: 'ipanema@boraporct.com', responsavel: 'Ana Paula Costa', ativo: true }
  ],
  produtos: [
    { id: 1, nome: 'Camisa Oficial BoraProCT', preco: 89.90, imagem: 'https://placehold.co/400x400/004AAD/FFFFFF?text=Camisa' },
    { id: 2, nome: 'Boné Exclusivo', preco: 49.90, imagem: 'https://placehold.co/400x400/333333/FFFFFF?text=Boné' },
    { id: 3, nome: 'Viseira Futevôlei', preco: 39.90, imagem: 'https://placehold.co/400x400/FF5733/FFFFFF?text=Viseira' },
    { id: 4, nome: 'Bola Mikasa FT-5', preco: 299.90, imagem: 'https://placehold.co/400x400/FFC300/000000?text=Bola' },
  ],
  // 🆕 Gestores das unidades
  gestores: [
    { 
      id: 1, 
      nome: 'Roberto Silva', 
      telefone: '(21) 97777-7777', 
      email: 'roberto.centro@boraporct.com', 
      senha: '123456',
      unidadeResponsavel: 'Centro',
      dataAdmissao: '2024-01-10',
      ativo: true
    },
    { 
      id: 2, 
      nome: 'Marina Costa', 
      telefone: '(21) 96666-6666', 
      email: 'marina.zonasul@boraporct.com', 
      senha: '123456',
      unidadeResponsavel: 'Zona Sul',
      dataAdmissao: '2024-02-15',
      ativo: true
    },
    { 
      id: 3, 
      nome: 'Fernando Santos', 
      telefone: '(21) 95555-5555', 
      email: 'fernando.zonanorte@boraporct.com', 
      senha: '123456',
      unidadeResponsavel: 'Zona Norte',
      dataAdmissao: '2024-03-20',
      ativo: true
    },
    { 
      id: 4, 
      nome: 'Luciana Oliveira', 
      telefone: '(21) 94444-4444', 
      email: 'luciana.barra@boraporct.com', 
      senha: '123456',
      unidadeResponsavel: 'Barra',
      dataAdmissao: '2024-04-01',
      ativo: true
    }
  ],
  plataformas: [
    { id: 1, nome: 'Wellhub (Gympass)', valorPorAluno: 45.50, ativo: true },
    { id: 2, nome: 'TotalPass', valorPorAluno: 42.00, ativo: true },
    { id: 3, nome: 'Plataforma X', valorPorAluno: 50.00, ativo: false },
  ],
  presencas: [
    // Professor Carlos (ID: 1) - Sistema variável
    { id: 1, alunoId: 1, professorId: 1, data: '2025-07-05', horario: '18:00', status: 'presente' },
    { id: 2, alunoId: 2, professorId: 1, data: '2025-07-05', horario: '19:00', status: 'presente' },
    { id: 3, alunoId: 3, professorId: 1, data: '2025-07-05', horario: '20:00', status: 'presente' }, // 3 aulas = R$ 20 cada
    
    // Professor Lucas (ID: 2) - Sistema fixo
    { id: 4, alunoId: 1, professorId: 2, data: '2025-07-06', horario: '17:00', status: 'presente' }, // R$ 45
    { id: 5, alunoId: 4, professorId: 2, data: '2025-07-06', horario: '18:00', status: 'presente' }, // R$ 45
    
    // Professor Ana Paula (ID: 3) - Sistema variável
    { id: 6, alunoId: 2, professorId: 3, data: '2025-07-07', horario: '19:00', status: 'presente' }, // 1 aula = R$ 30
    { id: 7, alunoId: 3, professorId: 3, data: '2025-07-08', horario: '17:00', status: 'presente' },
    { id: 8, alunoId: 1, professorId: 3, data: '2025-07-08', horario: '18:00', status: 'presente' }, // 2 aulas = R$ 25 cada
  ],
  horariosConfiguracao: {
    1: { // Unidade 1 - CT Copacabana
      segunda: [
        { id: 1, horario: '17:00', professorId: 1, maxAlunos: 8, ativo: true },
        { id: 2, horario: '18:00', professorId: 1, maxAlunos: 8, ativo: true },
        { id: 3, horario: '19:00', professorId: 2, maxAlunos: 6, ativo: true }
      ],
      terca: [
        { id: 4, horario: '17:00', professorId: 3, maxAlunos: 8, ativo: true },
        { id: 5, horario: '18:00', professorId: 3, maxAlunos: 8, ativo: true }
      ],
      // ... outros dias
    }
  }
};

// App State Provider
const AppStateProvider = ({ children }) => {
  // Estados principais com localStorage
  const [alunos, setAlunos] = useLocalStorage('alunos', mockData.alunos);
  const [alugueis, setAlugueis] = useLocalStorage('alugueis-ct', []); // NOVO ESTADO
  const [professores, setProfessores] = useLocalStorage('professores', mockData.professores);
  const [gestores, setGestores] = useLocalStorage('gestores', mockData.gestores); // 🆕 NOVO ESTADO
  const [financeiro, setFinanceiro] = useLocalStorage('financeiro', mockData.financeiro);
  const [treinos, setTreinos] = useLocalStorage('treinos', mockData.treinos);
  const [unidades, setUnidades] = useLocalStorage('unidades', mockData.unidades);
  const [planos, setPlanos] = useLocalStorage('planos', mockData.planos);
  const [produtos, setProdutos] = useLocalStorage('produtos', mockData.produtos);
  const [plataformas, setPlataformas] = useLocalStorage('plataformas', mockData.plataformas);
  const [presencas, setPresencas] = useLocalStorage('presencas', mockData.presencas);
  const [horariosConfiguracao, setHorariosConfiguracao] = useLocalStorage('horariosConfiguracao', mockData.horariosConfiguracao);

  // Estados de sessão
  const [userLogado, setUserLogado] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState('admin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cart, setCart] = useState([]);

  const value = useMemo(() => ({
    alunos, setAlunos,
    professores, setProfessores,
    gestores, setGestores, // 🆕 NOVO ESTADO
    financeiro, setFinanceiro,
    treinos, setTreinos,
    unidades, setUnidades,
    planos, setPlanos,
    produtos, setProdutos,
    plataformas, setPlataformas,
    presencas, setPresencas,
    horariosConfiguracao, setHorariosConfiguracao,
    userLogado, setUserLogado,
    tipoUsuario, setTipoUsuario,
    activeTab, setActiveTab,
    alugueis, setAlugueis, 
    cart, setCart
  }), [
    alunos, setAlunos,
    professores, setProfessores,
    gestores, setGestores, // 🆕 NOVO ESTADO
    financeiro, setFinanceiro,
    treinos, setTreinos,
    unidades, setUnidades,
    planos, setPlanos,
    produtos, setProdutos,
    plataformas, setPlataformas,
    presencas, setPresencas,
    horariosConfiguracao, setHorariosConfiguracao,
    userLogado, setUserLogado,
    tipoUsuario, setTipoUsuario,
    activeTab, setActiveTab,
    alugueis, setAlugueis, 
    cart, setCart
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// Notification Provider
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useLocalStorage('notifications', []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    
    switch (notification.type) {
      case 'success':
        toast.success(notification.message);
        break;
      case 'error':
        toast.error(notification.message);
        break;
      case 'warning':
        toast.warn(notification.message);
        break;
      default:
        console.log(notification.message);
    }
  }, [setNotifications]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, [setNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    toast.success('Notificações limpas');
  }, [setNotifications]);

  const value = useMemo(() => ({
    notifications,
    addNotification,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  }), [notifications, addNotification, markAsRead, clearNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
// ===============================
// HOOKS CUSTOMIZADOS
// ===============================
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState deve ser usado dentro de um AppStateProvider');
  }
  return context;
};

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

// 🆕 Hook para controle de acesso baseado em unidade
const useUnitAccess = () => {
  const { userLogado, tipoUsuario } = useAppState();
  
  return useMemo(() => {
    // Admin tem acesso a todas as unidades
    if (tipoUsuario === 'admin') {
      return {
        hasFullAccess: true,
        allowedUnits: ['Centro', 'Zona Sul', 'Zona Norte', 'Barra'],
        currentUnit: null,
        isGestor: false
      };
    }
    
    // Gestor só tem acesso à sua unidade
    if (tipoUsuario === 'gestor' && userLogado?.unidadeResponsavel) {
      return {
        hasFullAccess: false,
        allowedUnits: [userLogado.unidadeResponsavel],
        currentUnit: userLogado.unidadeResponsavel,
        isGestor: true
      };
    }
    
    // Outros usuários (professor, aluno) têm acesso limitado
    return {
      hasFullAccess: false,
      allowedUnits: userLogado?.unidade ? [userLogado.unidade] : [],
      currentUnit: userLogado?.unidade || null,
      isGestor: false
    };
  }, [userLogado, tipoUsuario]);
};

// 🆕 Hook para filtrar dados por unidade automaticamente
const useUnitFilteredData = (data, dataType = 'default') => {
  const { hasFullAccess, currentUnit } = useUnitAccess();
  
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    // Admin vê todos os dados
    if (hasFullAccess) {
      return data;
    }
    
    // Gestor e outros veem apenas dados da sua unidade
    if (currentUnit) {
      return data.filter(item => {
        // Para diferentes tipos de dados, verificar o campo correto
        switch (dataType) {
          case 'alunos':
            return item.unidade === currentUnit;
          case 'professores':
            return item.unidade === currentUnit || !item.unidade; // Professores podem não ter unidade específica
          case 'planos':
            return item.unidade === currentUnit;
          case 'financeiro':
            return item.unidade === currentUnit || !item.unidade; // Transações podem ser gerais
          case 'presencas':
            // Para presenças, verificar se o aluno pertence à unidade
            return true; // Por enquanto, deixar passar - será refinado quando integrar com dados de alunos
          default:
            return item.unidade === currentUnit || !item.unidade;
        }
      });
    }
    
    return data;
  }, [data, hasFullAccess, currentUnit, dataType]);
};

// Hook para filtros avançados
// Hook para filtros avançados - VERSÃO MELHORADA
const useAdvancedFilter = (data, filters) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.filter(item => {
      // Filtro por texto (nome/email)
      if (filters.nome && !item.nome.toLowerCase().includes(filters.nome.toLowerCase()) && 
          !item.email.toLowerCase().includes(filters.nome.toLowerCase())) {
        return false;
      }

      // Filtro por status
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Filtro por tipo de plano
      if (filters.tipoPlano && item.tipoPlano !== filters.tipoPlano) {
        return false;
      }

      // Filtro por unidade
      if (filters.unidade && item.unidade !== filters.unidade) {
        return false;
      }

      // Filtro por nível
      if (filters.nivel && item.nivel !== filters.nivel) {
        return false;
      }

      // 🆕 Filtro por situação de vencimento
      if (filters.vencimento) {
        const hoje = new Date();
        
        if (filters.vencimento === 'vencido') {
          if (item.tipoPlano === 'plataforma') return false;
          const vencimento = new Date(item.vencimento);
          if (vencimento >= hoje) return false;
        }
        
        if (filters.vencimento === 'vencendo') {
          if (item.tipoPlano === 'plataforma') return false;
          const vencimento = new Date(item.vencimento);
          const diffDias = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
          if (diffDias > 7 || diffDias < 0) return false;
        }
        
        if (filters.vencimento === 'ok') {
          if (item.tipoPlano === 'plataforma') return false;
          const vencimento = new Date(item.vencimento);
          const diffDias = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
          if (diffDias <= 7) return false;
        }
        
        if (filters.vencimento === 'sem-vencimento') {
          if (item.tipoPlano !== 'plataforma') return false;
        }
      }

      return true;
    });
  }, [data, filters]);
};

// Hook para busca com debounce
const useDebouncedSearch = (searchTerm, delay = 300) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedTerm;
};

// Hook para paginação
const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

// ===============================
// ERROR BOUNDARY
// ===============================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado pelo Error Boundary:', error, errorInfo);
    toast.error('Ocorreu um erro inesperado. A página será recarregada.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Ops! Algo deu errado
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===============================
// COMPONENTES DE UI MELHORADOS
// ===============================

// Loading Spinner melhorado
const LoadingSpinner = memo(({ size = 'md', text = 'Carregando...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8" role="status" aria-label={text}>
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</span>
    </div>
  );
});

// Modal melhorado com acessibilidade
const Modal = memo(({ isOpen, onClose, title, children, size = 'md' }) => {
  const { isDarkMode } = useTheme();
  const modalRef = useRef(null);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 sm:p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h3 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-3 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
});

// Input melhorado com acessibilidade
const Input = memo(({ 
  label, 
  error, 
  required = false, 
  type = 'text',
  id,
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props 
}) => {
  const { isDarkMode } = useTheme();
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : ariaDescribedBy}
        className={`w-full px-3 py-3 sm:py-4 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors touch-manipulation ${
          error 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 dark:border-gray-600'
        } ${
          isDarkMode 
            ? 'bg-gray-700 text-white placeholder-gray-400' 
            : 'bg-white text-gray-900 placeholder-gray-500'
        } ${className}`}
        style={{ minHeight: '44px' }}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

// Button melhorado com loading e acessibilidade
const Button = memo(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  'aria-label': ariaLabel,
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base', 
    lg: 'px-6 py-4 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-colors touch-manipulation
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      style={{ minHeight: '44px', minWidth: '44px' }}
      disabled={isDisabled}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      
      {children}
      
      {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

// Filtros Avançados Component
// Filtros Avançados Component - VERSÃO SUPER ORGANIZADA
// Filtros Avançados Component - VERSÃO CORRIGIDA
const AdvancedFilters = memo(({ onFiltersChange, filters, clearFilters, exportData, alunos = [] }) => {
  const { isDarkMode } = useTheme();
  const { unidades = [] } = useAppState(); // ✅ Fallback para array vazio
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  }, [filters, onFiltersChange]);

  // 🆕 Calcular estatísticas para os filtros - COM VERIFICAÇÃO DE SEGURANÇA
  const estatisticasFiltros = useMemo(() => {
    // ✅ Verificar se alunos existe e é array
    if (!alunos || !Array.isArray(alunos)) {
      return {
        vencidos: 0,
        vencendoEm7Dias: 0,
        mensalistas: 0,
        plataformas: 0,
        porUnidade: {}
      };
    }

    const hoje = new Date();
    
    const vencidos = alunos.filter(aluno => {
      if (!aluno || aluno.tipoPlano === 'plataforma') return false;
      const vencimento = new Date(aluno.vencimento);
      return vencimento < hoje;
    }).length;

    const vencendoEm7Dias = alunos.filter(aluno => {
      if (!aluno || aluno.tipoPlano === 'plataforma') return false;
      const vencimento = new Date(aluno.vencimento);
      const diffDias = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
      return diffDias <= 7 && diffDias >= 0;
    }).length;

    const porUnidade = unidades.reduce((acc, unidade) => {
      if (unidade && unidade.nome) {
        acc[unidade.nome] = alunos.filter(a => a && a.unidade === unidade.nome).length;
      }
      return acc;
    }, {});

    return {
      vencidos,
      vencendoEm7Dias,
      mensalistas: alunos.filter(a => a && a.tipoPlano === 'mensalidade').length,
      plataformas: alunos.filter(a => a && a.tipoPlano === 'plataforma').length,
      porUnidade
    };
  }, [alunos, unidades]);

  const activeFiltersCount = Object.values(filters || {}).filter(Boolean).length;

  // ✅ Se não tiver alunos, mostrar loading
  if (!alunos || !Array.isArray(alunos) || alunos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4 mx-auto mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
          <p className="text-gray-500 mt-4">Carregando filtros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 🆕 Filtros Rápidos - Sempre Visíveis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
          <Filter size={16} className="mr-2" />
          Filtros Rápidos
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Todos */}
          <button
            onClick={() => clearFilters()}
            className={`p-3 rounded-lg text-center transition-all ${
              activeFiltersCount === 0
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-lg font-bold">{alunos.length}</div>
            <div className="text-xs">Todos</div>
          </button>

          {/* Ativos */}
          <button
            onClick={() => onFiltersChange({ status: 'ativo' })}
            className={`p-3 rounded-lg text-center transition-all ${
              filters.status === 'ativo'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-lg font-bold text-green-600">{alunos.filter(a => a && a.status === 'ativo').length}</div>
            <div className="text-xs">✅ Ativos</div>
          </button>

          {/* Mensalistas */}
          <button
            onClick={() => onFiltersChange({ tipoPlano: 'mensalidade' })}
            className={`p-3 rounded-lg text-center transition-all ${
              filters.tipoPlano === 'mensalidade'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-lg font-bold text-blue-600">{estatisticasFiltros.mensalistas}</div>
            <div className="text-xs">💰 Mensalistas</div>
          </button>

          {/* Plataformas */}
          <button
            onClick={() => onFiltersChange({ tipoPlano: 'plataforma' })}
            className={`p-3 rounded-lg text-center transition-all ${
              filters.tipoPlano === 'plataforma'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-lg font-bold text-purple-600">{estatisticasFiltros.plataformas}</div>
            <div className="text-xs">🤝 Plataformas</div>
          </button>

          {/* Vencidos */}
          <button
            onClick={() => onFiltersChange({ vencimento: 'vencido' })}
            className={`p-3 rounded-lg text-center transition-all ${
              filters.vencimento === 'vencido'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-lg font-bold text-red-600">{estatisticasFiltros.vencidos}</div>
            <div className="text-xs">🚨 Vencidos</div>
          </button>

          {/* Vencendo */}
          <button
            onClick={() => onFiltersChange({ vencimento: 'vencendo' })}
            className={`p-3 rounded-lg text-center transition-all ${
              filters.vencimento === 'vencendo'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-lg font-bold text-orange-600">{estatisticasFiltros.vencendoEm7Dias}</div>
            <div className="text-xs">⚠️ Vencendo</div>
          </button>
        </div>
      </div>

      {/* 🆕 Filtros por Unidade */}
      {unidades.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
            <Building size={16} className="mr-2" />
            Filtrar por Unidade
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {unidades.map(unidade => (
              <button
                key={unidade.id}
                onClick={() => handleFilterChange('unidade', filters.unidade === unidade.nome ? '' : unidade.nome)}
                className={`p-3 rounded-lg text-center transition-all ${
                  filters.unidade === unidade.nome
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="text-lg font-bold text-indigo-600">{estatisticasFiltros.porUnidade[unidade.nome] || 0}</div>
                <div className="text-xs">{unidade.nome}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🆕 Filtros Avançados (Expansível) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl transition-colors"
        >
          <div className="flex items-center">
            <Settings size={16} className="mr-2" />
            <span className="font-semibold">Filtros Avançados</span>
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <ChevronDown 
            size={20} 
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Status do Aluno
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os status</option>
                  <option value="ativo">✅ Ativo</option>
                  <option value="pendente">⏳ Pendente</option>
                  <option value="inativo">❌ Inativo</option>
                </select>
              </div>

              {/* Tipo de Plano */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tipo de Plano
                </label>
                <select
                  value={filters.tipoPlano || ''}
                  onChange={(e) => handleFilterChange('tipoPlano', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os tipos</option>
                  <option value="mensalidade">💰 Mensalidade</option>
                  <option value="plataforma">🤝 Plataforma Parceira</option>
                </select>
              </div>

              {/* Nível */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nível do Aluno
                </label>
                <select
                  value={filters.nivel || ''}
                  onChange={(e) => handleFilterChange('nivel', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os níveis</option>
                  <option value="iniciante">🟢 Iniciante</option>
                  <option value="intermediario">🟡 Intermediário</option>
                  <option value="avancado">🔴 Avançado</option>
                </select>
              </div>
            </div>

            {/* 🆕 Filtros de Data de Vencimento */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                📅 Situação de Vencimento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleFilterChange('vencimento', filters.vencimento === 'vencido' ? '' : 'vencido')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    filters.vencimento === 'vencido'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                  }`}
                >
                  <div className="font-bold">🚨 Vencidos</div>
                  <div className="text-xs">Pagamento em atraso</div>
                </button>

                <button
                  onClick={() => handleFilterChange('vencimento', filters.vencimento === 'vencendo' ? '' : 'vencendo')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    filters.vencimento === 'vencendo'
                      ? 'bg-orange-600 text-white'
                      : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                  }`}
                >
                  <div className="font-bold">⚠️ Vencendo</div>
                  <div className="text-xs">Próximos 7 dias</div>
                </button>

                <button
                  onClick={() => handleFilterChange('vencimento', filters.vencimento === 'ok' ? '' : 'ok')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    filters.vencimento === 'ok'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                  }`}
                >
                  <div className="font-bold">✅ Em dia</div>
                  <div className="text-xs">Vencimento OK</div>
                </button>

                <button
                  onClick={() => handleFilterChange('vencimento', filters.vencimento === 'sem-vencimento' ? '' : 'sem-vencimento')}
                  className={`p-3 rounded-lg text-center transition-all ${
                    filters.vencimento === 'sem-vencimento'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                  }`}
                >
                  <div className="font-bold">🤝 Plataformas</div>
                  <div className="text-xs">Sem vencimento</div>
                </button>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                🗑️ Limpar todos os filtros
              </button>
              
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Exportar Filtrados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Componente de Busca Melhorado
// Componente de Busca Melhorado - VERSÃO CORRIGIDA
const SearchBar = memo(({ searchTerm, onSearchChange, placeholder = "Buscar...", filters = {}, onFiltersChange, clearFilters, exportData, alunos = [] }) => {
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      onSearchChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchTerm, onSearchChange]);

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label={placeholder}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={clearFilters}
            leftIcon={<X size={16} />}
          >
            Limpar
          </Button>
          <Button
            variant="success"
            onClick={exportData}
            leftIcon={<Download size={16} />}
          >
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Filtros Avançados */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        clearFilters={clearFilters}
        exportData={exportData}
        alunos={alunos}
      />
    </div>
  );
});

// Tabela melhorada com paginação e acessibilidade
const DataTable = memo(({ 
  data, 
  columns, 
  loading = false,
  emptyMessage = "Nenhum dado encontrado",
  pagination = true,
  itemsPerPage = 10 
}) => {
  const { isDarkMode } = useTheme();
  const {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev
  } = usePagination(data, itemsPerPage);

  if (loading) {
    return <LoadingSpinner text="Carregando dados..." />;
  }

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full" role="table" aria-label="Tabela de dados">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td key={column.key || colIndex} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} até {Math.min(currentPage * itemsPerPage, data.length)} de {data.length} resultados
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={prevPage}
              disabled={!hasPrev}
              aria-label="Página anterior"
            >
              Anterior
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Ir para página ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={nextPage}
              disabled={!hasNext}
              aria-label="Próxima página"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});
// ===============================
// COMPONENTES PRINCIPAIS MELHORADOS
// ===============================

// Login melhorado
const LoginModal = memo(() => {
  const { isDarkMode } = useTheme();
  const { setUserLogado, setTipoUsuario, alunos, professores, gestores } = useAppState(); // 🆕 Adicionado gestores
  const { addNotification } = useNotifications();
  
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!loginData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!loginData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [loginData]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const { email, senha } = loginData;

      if (email === 'admin@ct.com' && senha === 'admin123') {
        setUserLogado({ id: 0, nome: 'Administrador', tipo: 'admin', email });
        setTipoUsuario('admin');
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: 'Bem-vindo, Administrador!'
        });
        return;
      }

      const professor = professores.find(p => p.email === email && p.senha === senha);
      if (professor) {
        setUserLogado(professor);
        setTipoUsuario('professor');
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: `Bem-vindo, Prof. ${professor.nome}!`
        });
        return;
      }

      // 🆕 Verificar se é um gestor
      const gestor = gestores.find(g => g.email === email && g.senha === senha && g.ativo);
      if (gestor) {
        setUserLogado(gestor);
        setTipoUsuario('gestor');
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: `Bem-vindo, ${gestor.nome}! Gestor da unidade ${gestor.unidadeResponsavel}`
        });
        return;
      }

      const aluno = alunos.find(a => a.email === email && a.senha === senha);
      if (aluno) {
        setUserLogado(aluno);
        setTipoUsuario('aluno');
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: `Bem-vindo, ${aluno.nome}!`
        });
        return;
      }

      setErrors({ email: 'Email ou senha incorretos' });
      addNotification({
        type: 'error',
        title: 'Erro no login',
        message: 'Credenciais inválidas'
      });
    } catch (error) {
      console.error('Erro no login:', error);
      addNotification({
        type: 'error',
        title: 'Erro no login',
        message: 'Ocorreu um erro inesperado'
      });
    } finally {
      setLoading(false);
    }
  }, [validateForm, loginData, setUserLogado, setTipoUsuario, professores, gestores, alunos, addNotification]); // 🆕 Adicionado gestores

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }, [handleLogin]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl p-8 w-full max-w-md`}>
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            BoraProCT
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
            Faça login para continuar
          </p>
        </div>
        
        <div className="space-y-4" onKeyPress={handleKeyPress}>
          <Input
            label="Email"
            type="email"
            value={loginData.email}
            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            error={errors.email}
            required
            autoComplete="email"
            aria-describedby="email-help"
          />
          
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={loginData.senha}
              onChange={(e) => setLoginData({...loginData, senha: e.target.value})}
              error={errors.senha}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <Button
            onClick={handleLogin}
            loading={loading}
            className="w-full"
            aria-describedby="login-help"
          >
            Entrar
          </Button>
        </div>
        
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
            Dados para teste:
          </p>
          <div className="space-y-1 text-xs">
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
              <strong>Admin:</strong> admin@ct.com / admin123
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
              <strong>Professor:</strong> carlos@email.com / 123456
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
              <strong>Aluno:</strong> joao@email.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Sidebar melhorada com acessibilidade
const MenuSidebar = memo(({ isMobileOpen, setMobileOpen, isCollapsed }) => {
 
  
  const { isDarkMode } = useTheme();
  const { activeTab, setActiveTab, tipoUsuario, userLogado, setUserLogado, setTipoUsuario } = useAppState();
  const { addNotification } = useNotifications();
  // 🆕 ADICIONAR: Hook para acessar as metas
  const [configs] = useLocalStorage('configuracoes-ct-usuario', {
      modeloNegocio: { tipo: 'proprio_nao_aluga' }, // Valor padrão para evitar erros
      nomeEmpresa: 'BoraProCT',
      logoUrl: ''
  });
  const [metas] = useLocalStorage('metas-ct', []);
   // 🆕 ADICIONAR: Calcular metas pendentes
  const metasPendentes = useMemo(() => {
    if (!metas || metas.length === 0) return 0;
    const agora = new Date();
    return metas.filter(meta => {
      if (meta.concluida) return false;
      const diasRestantes = Math.ceil((new Date(meta.prazo) - agora) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 7; // Metas que vencem em 7 dias ou menos
    }).length;
  }, [metas]);
  // 🆕 Estado para controlar seções abertas/fechadas
  const [openSections, setOpenSections] = useState({
    'visao-geral': true,  // Dashboard sempre aberto
    'pessoas': true,
    'operacional': true,
    'treinamento': true,
    'financeiro': true,
    'extras': true
  });
  
  const handleLogout = useCallback(() => {
    setUserLogado(null);
    setTipoUsuario('admin');
    setActiveTab('dashboard');
    addNotification({
      type: 'success',
      title: 'Logout realizado',
      message: 'Até a próxima!'
    });
  }, [setUserLogado, setTipoUsuario, setActiveTab, addNotification]);

  // 🆕 Função para toggle das seções
  const toggleSection = useCallback((sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Menu organizado por seções
  const menuSections = useMemo(() => {
    const sections = [];
    
    // Seção Dashboard (sempre visível)
    sections.push({
      id: 'visao-geral',
      title: "📊 Visão Geral",
      icon: BarChart3,
      items: [
        { 
          id: 'dashboard', 
          label: tipoUsuario === 'aluno' ? 'Meu Painel' : 'Dashboard', 
          icon: BarChart3,
          roles: ['admin', 'professor', 'aluno', 'gestor'] // 🆕 Adicionado gestor
        }
      ]
    });

    // Seção Gestão de Pessoas (admin e gestor)
    if (tipoUsuario === 'admin' || tipoUsuario === 'gestor') { // 🆕 Adicionado gestor
      const pessoasItems = [
        { id: 'alunos', label: 'Alunos', icon: Users, roles: ['admin', 'gestor'], badge: { count: 120, color: 'blue' } }, // 🆕 Adicionado gestor
        { id: 'professores', label: 'Professores', icon: User, roles: ['admin', 'gestor'] } // 🆕 Adicionado gestor
      ];
      
      // 🆕 Apenas admin pode gerenciar gestores
      if (tipoUsuario === 'admin') {
        pessoasItems.push(
          { id: 'gestores', label: 'Gestores', icon: Settings, roles: ['admin'] }
        );
      }
      
      sections.push({
        id: 'pessoas',
        title: "👥 Pessoas",
        icon: Users,
        items: pessoasItems
      });
    }

    // Seção Operacional
    // Seção Operacional - VERSÃO CORRIGIDA
const operacionalItems = [];

// Para ADMIN e GESTOR - itens específicos de administração
if (tipoUsuario === 'admin' || tipoUsuario === 'gestor') { // 🆕 Adicionado gestor
  operacionalItems.push(
    { 
      id: 'presenca', 
      label: '📋 Controle de Presença', 
      icon: CheckCircle, 
      roles: ['admin', 'gestor'], // 🆕 Adicionado gestor
      badge: { count: 8, color: 'orange' } 
    },
    { 
      id: 'agendamentos', 
      label: '📅 Gerenciar Agendamentos', 
      icon: Calendar, 
      roles: ['admin', 'gestor'] // 🆕 Adicionado gestor
    }
  );

 // NOVO: Adiciona o item de aluguel de quadras apenas se a opção estiver ativa (só admin)
  if (tipoUsuario === 'admin' && configs.modeloNegocio?.tipo === 'proprio_aluga') { // 🆕 Só admin pode ver aluguel
    operacionalItems.push({
      id: 'aluguel_quadras',
      label: '🎾 Aluguel de Quadras',
      icon: Key, // Importe o ícone 'Key' do lucide-react
      roles: ['admin']
    });
    }
}

// Para PROFESSORES, GESTORES E ALUNOS - aulas do dia
if (tipoUsuario === 'professor' || tipoUsuario === 'aluno' || tipoUsuario === 'gestor') { // 🆕 Adicionado gestor
  operacionalItems.push({
    id: 'aulas', 
    label: tipoUsuario === 'aluno' ? '🎯 Minhas Aulas' : '📚 Aulas do Dia', 
    icon: Calendar,
    roles: ['professor', 'aluno', 'gestor'] // 🆕 Adicionado gestor
  });
}

    if (operacionalItems.length > 0) {
      sections.push({
        id: 'operacional',
        title: "⚙️ Operacional",
        icon: Settings,
        items: operacionalItems
      });
    }

    // Seção Treinamento
    sections.push({
      id: 'treinamento',
      title: "🎯 Treinamento",
      icon: Target,
      items: [
        { 
          id: 'treinos', 
          label: tipoUsuario === 'professor' ? 'Meus Treinos' : 'Treinos', 
          icon: Edit3,
          roles: ['admin', 'professor', 'aluno', 'gestor'] // 🆕 Adicionado gestor
        }
      ]
    });
// No MenuSidebar, adicione após a seção de treinos:
if (tipoUsuario === 'admin' || tipoUsuario === 'professor' || tipoUsuario === 'gestor') { // 🆕 Adicionado gestor
    sections.push({
      id: 'metas-secao',
      title: "🎯 GESTÃO DE METAS",
      icon: Target,
      items: [
        { 
          id: 'metas', 
          label: 'Metas do CT', 
          icon: Target, 
          roles: ['admin', 'gestor'], // 🆕 Gestor pode ver metas da sua unidade
          badge: metasPendentes > 0 ? { count: metasPendentes, color: 'orange' } : undefined
        }
      ]
    });
  }
    // Seção Financeiro
    const financeiroItems = [
      { 
        id: 'financeiro', 
        label: tipoUsuario === 'professor' ? 'Pagamentos' : 'Financeiro', 
        icon: DollarSign,
        roles: ['admin', 'professor', 'aluno', 'gestor'], // 🆕 Adicionado gestor
        badge: tipoUsuario === 'admin' || tipoUsuario === 'gestor' ? { count: 3, color: 'red' } : null // 🆕 Gestor também vê badge
      }
    ];

    if (tipoUsuario === 'admin') {
      financeiroItems.push(
        
        
      );
    }

    sections.push({
      id: 'financeiro',
      title: "💰 Financeiro",
      icon: DollarSign,
      items: financeiroItems
    });

    // Seção Extras
    const extrasItems = [];
    if (tipoUsuario === 'aluno') {
      extrasItems.push(
        { id: 'loja', label: 'Loja', icon: ShoppingCart, roles: ['aluno'] },
        { id: 'evolucao', label: 'Evolução', icon: TrendingUp, roles: ['aluno'] },
        { id: 'perfil', label: 'Perfil', icon: Settings, roles: ['aluno'] }
      );
    } else if (tipoUsuario === 'admin') {
      extrasItems.push(
        { id: 'loja', label: 'Gestão Loja', icon: ShoppingCart, roles: ['admin'] }
      );
    }
  // Seção Configurações (só admin)
if (tipoUsuario === 'admin') {
  sections.push({
    id: 'configuracoes-sistema',
    title: "⚙️ Configurações",
    icon: Settings,
    items: [
      { 
        id: 'configuracoes', 
        label: 'Configurações do CT', 
        icon: Settings, 
        roles: ['admin'],
        badge: { count: 4, color: 'blue' } // Indica as 4 seções principais
      }
    ]
  });
}

    if (extrasItems.length > 0) {
      sections.push({
        id: 'extras',
        title: tipoUsuario === 'aluno' ? "🛍️ Minha Área" : "🛍️ Loja",
        icon: ShoppingCart,
        items: extrasItems
      });
    }

    return sections.filter(section => 
      section.items.some(item => item.roles.includes(tipoUsuario))
    );
  }, [tipoUsuario]);

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <nav
        className={`fixed inset-y-0 left-0 z-30 ${isCollapsed ? 'w-20' : 'w-64'} 
          ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-900 to-blue-800'}
          transform transition-all duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col h-screen`}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <div className={`flex items-center p-4 border-b ${isCollapsed ? 'justify-center' : 'justify-between'} border-white/10`}>
            <div className="flex items-center">
    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
      {configs.logoUrl ? (
        <img src={configs.logoUrl} alt="Logo" className="w-full h-full object-contain rounded" />
      ) : (
        <span className="text-white font-bold text-lg">🏐</span>
      )}
    </div>
    {!isCollapsed && (
      <div>
        <h1 className="text-xl font-bold text-white">{configs.nomeEmpresa}</h1>
        <p className="text-xs text-blue-200 capitalize">{tipoUsuario}</p>
      </div>
    )}
  </div>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="lg:hidden p-3 rounded-lg hover:bg-white/10 text-white touch-manipulation"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* 🆕 Menu Accordion */}
        <div className="flex-1 overflow-y-auto menu-barra-bonita">
          <div className="p-2">
            {menuSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon;
              const isOpen = openSections[section.id];
              const hasVisibleItems = section.items.some(item => item.roles.includes(tipoUsuario));
              
              if (!hasVisibleItems) return null;
              
              return (
                <div key={section.id} className={sectionIndex > 0 ? 'mt-2' : 'mt-2'}>
                  {/* 🆕 Cabeçalho da Seção (Clicável) */}
                  <button
                    onClick={() => !isCollapsed && toggleSection(section.id)}
                    className={`w-full flex items-center px-3 py-3 sm:py-2.5 rounded-lg transition-all duration-200 touch-manipulation ${
                      isCollapsed ? 'justify-center' : 'justify-between'
                    } text-blue-100 hover:bg-white/10 hover:text-white group`}
                    style={{ minHeight: '44px' }}
                    disabled={isCollapsed}
                  >
                    <div className="flex items-center">
                      <SectionIcon size={18} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-semibold uppercase tracking-wider">
                          {section.title}
                        </span>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <ChevronDown 
                        size={16} 
                        className={`transform transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        }`} 
                      />
                    )}
                  </button>
                  
                  {/* 🆕 Itens da Seção (Collapsible) */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isOpen || isCollapsed ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className={`${isCollapsed ? 'mt-1' : 'mt-2 ml-4'} space-y-1`}>
                      {section.items
                        .filter(item => item.roles.includes(tipoUsuario))
                        .map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => { 
                                setActiveTab(item.id); 
                                setMobileOpen(false); 
                              }}
                              className={`group w-full flex items-center px-3 py-3 sm:py-2 rounded-lg transition-all duration-200 touch-manipulation ${
                                isCollapsed ? 'justify-center' : 'justify-between'
                              } ${
                                isActive 
                                  ? 'bg-white/20 text-white shadow-lg border-l-2 border-white/40' 
                                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
                              }`}
                              style={{ minHeight: '44px' }}
                              aria-current={isActive ? 'page' : undefined}
                              title={isCollapsed ? item.label : undefined}
                            >
                              <div className="flex items-center">
                                <Icon size={18} className="flex-shrink-0" />
                                {!isCollapsed && (
                                  <span className="ml-3 font-medium">{item.label}</span>
                                )}
                              </div>
                              
                              {/* 🆕 Badge */}
                              {item.badge && !isCollapsed && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  item.badge.color === 'red' ? 'bg-red-500/20 text-red-200' :
                                  item.badge.color === 'orange' ? 'bg-orange-500/20 text-orange-200' :
                                  item.badge.color === 'blue' ? 'bg-blue-500/20 text-blue-200' :
                                  'bg-gray-500/20 text-gray-200'
                                }`}>
                                  {item.badge.count > 99 ? '99+' : item.badge.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* User Info + Logout */}
        <div className="flex-shrink-0 p-3 border-t border-white/10">
          {!isCollapsed && userLogado && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {userLogado.nome?.split(' ')[0] || 'Usuário'}
                  </p>
                  <p className="text-xs text-blue-200 capitalize">{tipoUsuario}</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-3 sm:py-2.5 rounded-lg transition-colors touch-manipulation ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } text-blue-100 hover:bg-red-500/20 hover:text-red-200`}
            style={{ minHeight: '44px' }}
            aria-label="Sair do sistema"
            title={isCollapsed ? 'Sair' : undefined}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Sair</span>}
          </button>
        </div>
      </nav>
    </>
  );
});

// Header melhorado com notificações
const Header = memo(({ toggleMobileSidebar, toggleSidebarCollapse }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeTab, userLogado, tipoUsuario, cart } = useAppState();
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);
 const [configs] = useLocalStorage('configuracoes-ct', { nomeEmpresa: 'BoraProCT' });
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = useCallback(() => {
    const titles = {
      dashboard: tipoUsuario === 'aluno' ? 'Meu Painel' : 'Dashboard',
      loja: tipoUsuario === 'admin' ? 'Gestão da Loja' : 'Loja',
      alunos: 'Alunos',
      professores: 'Professores',
      unidades: 'Unidades',
      horarios: 'Horários',
      presenca: 'Presença',
      aulas: tipoUsuario === 'aluno' ? 'Minhas Aulas' : 'Aulas',
      treinos: 'Treinos',
      financeiro: 'Financeiro',
      planos: 'Planos',
      plataformas: 'Plataformas',
      evolucao: 'Minha Evolução',
      configuracoes: 'Configurações do CT',
      perfil: 'Meu Perfil'
    };
    return titles[activeTab] || activeTab;
  }, [activeTab, tipoUsuario]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className={`${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } shadow-sm border-b`}>
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={toggleSidebarCollapse}
            className={`hidden lg:block mr-2 sm:mr-4 p-3 rounded-md transition-colors touch-manipulation ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Alternar sidebar"
          >
            <Menu size={20} />
          </button>
          
          <button
            onClick={toggleMobileSidebar}
            className={`lg:hidden mr-2 sm:mr-4 p-3 rounded-md transition-colors touch-manipulation ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          
          <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold capitalize truncate ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {getPageTitle()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-lg transition-colors touch-manipulation ${
              isDarkMode 
                ? 'text-yellow-400 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart (só para alunos) */}
          {tipoUsuario === 'aluno' && (
            <button 
              className={`relative p-3 rounded-lg transition-colors touch-manipulation ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3 rounded-lg transition-colors touch-manipulation ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
              aria-expanded={showNotifications}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className={`absolute top-full right-0 mt-2 w-80 sm:w-96 max-h-96 overflow-y-auto rounded-lg shadow-lg border z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base">Notificações</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-sm text-blue-600 hover:text-blue-800 p-2 rounded touch-manipulation"
                        style={{ minHeight: '44px' }}
                      >
                        Limpar todas
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer touch-manipulation ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        style={{ minHeight: '44px' }}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              tipoUsuario === 'admin' ? 'bg-blue-600' : 
              tipoUsuario === 'professor' ? 'bg-green-600' : 
              tipoUsuario === 'gestor' ? 'bg-orange-600' : // 🆕 Cor para gestor
              'bg-purple-600'
            }`}>
              <User className="text-white" size={16} />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className={`text-sm font-medium truncate ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {userLogado ? userLogado.nome : 'Usuário'}
              </p>
              <p className={`text-xs capitalize truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {tipoUsuario}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});
// SUBSTITUA O COMPONENTE StatsCard POR ESTE:

const StatsCard = memo(({ title, value, icon: Icon, color, subtitle, trend, onClick }) => {
  const { isDarkMode } = useTheme();
  
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <ArrowDownLeft className="w-4 h-4 text-red-500" />;
  };

  const cardClasses = `
    ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
    rounded-xl shadow-sm p-4 sm:p-6 border transition-all duration-300 touch-manipulation
    ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 active:scale-95' : ''}
  `;

  return (
    <div className={cardClasses} onClick={onClick} style={onClick ? { minHeight: '44px' } : {}}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className={`text-xl sm:text-2xl font-bold ${color} truncate`}>{value}</p>
            {getTrendIcon()}
          </div>
          {subtitle && (
            <p className={`text-xs mt-1 truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2 ${
          color.includes('green') ? 'bg-green-100 dark:bg-green-900/20' :
          color.includes('blue') ? 'bg-blue-100 dark:bg-blue-900/20' :
          color.includes('purple') ? 'bg-purple-100 dark:bg-purple-900/20' :
          color.includes('yellow') ? 'bg-yellow-100 dark:bg-yellow-900/20' :
          color.includes('red') ? 'bg-red-100 dark:bg-red-900/20' :
          'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Icon className={color} size={20} />
        </div>
      </div>
    </div>
  );
});

// Dashboard Melhorado
// SUBSTITUA O COMPONENTE Dashboard INTEIRO POR ESTE:

// SUBSTITUA O COMPONENTE Dashboard QUE VOCÊ TEM ATUALMENTE POR ESTE CÓDIGO CORRIGIDO:

const Dashboard = memo(() => {
  // 1. OBTEMOS O TIPO DE USUÁRIO PARA DECIDIR O QUE RENDERIZAR
  const { alunos, professores, financeiro, treinos, setActiveTab, tipoUsuario } = useAppState();
  const [metas] = useLocalStorage('metas-ct', []);
  const { isDarkMode } = useTheme();

  // 2. LÓGICA DE ROTEAMENTO RESTAURADA
  // Se o usuário for um professor, renderiza o dashboard dele
  if (tipoUsuario === 'professor') {
    return <DashboardProfessor />;
  }
  
  // 🆕 Se o usuário for um gestor, renderiza o dashboard dele
  if (tipoUsuario === 'gestor') {
    return <DashboardGestor />;
  }

  // Se o usuário for um aluno, renderiza o dashboard dele
  if (tipoUsuario === 'aluno') {
    return <DashboardAluno />;
  }
  
  // 3. SE NÃO FOR NENHUM DOS ANTERIORES, É O ADMIN. O CÓDIGO ABAIXO É O DASHBOARD DO ADMIN.
  // Estatísticas calculadas dinamicamente
  const stats = useMemo(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const transacoesMes = financeiro.filter(t => new Date(t.data) >= inicioMes);
    
    const receitaTotal = transacoesMes
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesaTotal = transacoesMes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0);

    const alunosComPagamentoPendente = alunos.filter(aluno => 
      aluno.tipoPlano === 'mensalidade' && new Date(aluno.vencimento) < hoje
    );
    
    const novosAlunosMes = alunos.filter(a => new Date(a.dataMatricula) >= inicioMes).length;

    return {
      totalAlunos: alunos.length,
      alunosAtivos: alunos.filter(a => a.status === 'ativo').length,
      novosAlunosMes,
      receitaTotal,
      lucroLiquido: receitaTotal - despesaTotal,
      alunosPendentes: alunosComPagamentoPendente,
    };
  }, [alunos, financeiro]);

  // Ações rápidas
  const acoesRapidas = useMemo(() => {
    const agora = new Date();
    const proximosVencimentos = alunos.filter(aluno => {
      if (aluno.tipoPlano === 'plataforma') return false;
      const vencimento = new Date(aluno.vencimento);
      const diffDias = Math.ceil((vencimento - agora) / (1000 * 60 * 60 * 24));
      return diffDias > 0 && diffDias <= 7;
    });

    return {
      pendentes: stats.alunosPendentes,
      proximosVencimentos
    };
  }, [alunos, stats.alunosPendentes]);

  // Progresso das metas
  const metasAtivas = useMemo(() => {
    return metas
      .filter(m => !m.concluida)
      .map(meta => ({
        ...meta,
        progresso: meta.valorMeta ? Math.min(Math.round((meta.valorAtual / meta.valorMeta) * 100), 100) : 0
      }))
      .slice(0, 3);
  }, [metas]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Dashboard Administrativo
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          Visão geral do seu negócio em tempo real.
        </p>
      </div>

      {/* Cards de estatísticas interativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Receita do Mês"
          value={`R$ ${stats.receitaTotal.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          color="text-green-600"
          subtitle="Total recebido até agora"
          trend="up"
          onClick={() => setActiveTab('financeiro')}
        />
        <StatsCard
          title="Alunos Ativos"
          value={stats.alunosAtivos}
          icon={Users}
          color="text-blue-600"
          subtitle={`${stats.novosAlunosMes} novos este mês`}
          onClick={() => setActiveTab('alunos')}
        />
        <StatsCard
          title="Pagamentos Pendentes"
          value={stats.alunosPendentes.length}
          icon={AlertCircle}
          color="text-red-600"
          subtitle="Alunos com mensalidade vencida"
          onClick={() => setActiveTab('alunos')}
        />
        <StatsCard
          title="Lucro Líquido (Mês)"
          value={`R$ ${stats.lucroLiquido.toLocaleString('pt-BR')}`}
          icon={TrendingUp}
          color={stats.lucroLiquido >= 0 ? "text-purple-600" : "text-red-600"}
          subtitle="Receita - Despesas"
          trend={stats.lucroLiquido >= 0 ? "up" : "down"}
          onClick={() => setActiveTab('financeiro')}
        />
      </div>

      {/* Ações Rápidas e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Ações Rápidas */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
            ⚡ Ações Rápidas
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {acoesRapidas.pendentes.length === 0 && acoesRapidas.proximosVencimentos.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={28}/>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Nenhuma ação imediata necessária. Tudo em dia!</p>
                </div>
            ) : (
                <>
                    {acoesRapidas.pendentes.map(aluno => (
                        <div key={aluno.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-red-800 dark:text-red-300 truncate">{aluno.nome}</p>
                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 truncate">Vencido em: {new Date(aluno.vencimento).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <Button size="sm" variant="danger" leftIcon={<Phone size={14}/>} className="flex-shrink-0">
                              <span className="hidden sm:inline">Contatar</span>
                              <span className="sm:hidden">📞</span>
                            </Button>
                        </div>
                    ))}
                    {acoesRapidas.proximosVencimentos.map(aluno => (
                        <div key={aluno.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-yellow-800 dark:text-yellow-300 truncate">{aluno.nome}</p>
                                <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 truncate">Vence em: {new Date(aluno.vencimento).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <Button size="sm" variant="secondary" className="flex-shrink-0">
                              <span className="hidden sm:inline">Lembrar</span>
                              <span className="sm:hidden">🔔</span>
                            </Button>
                        </div>
                    ))}
                </>
            )}
          </div>
        </div>
        
        {/* Metas Ativas */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">🎯 Metas Ativas</h3>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('metas')} className="self-end sm:self-auto">Ver Todas</Button>
          </div>
           {metasAtivas.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                     <Target className="mx-auto text-gray-400 mb-2" size={28}/>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Nenhuma meta ativa no momento.</p>
                </div>
           ) : (
            <div className="space-y-3 sm:space-y-4">
                {metasAtivas.map(meta => (
                  <div key={meta.id}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400 truncate pr-2">{meta.titulo}</span>
                      <span className="font-medium">{meta.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${meta.progresso}%` }} />
                    </div>
                  </div>
                ))}
            </div>
           )}
        </div>
      </div>
    </div>
  );
});

// Dashboard específico para Professor
// SUBSTITUA O COMPONENTE DashboardProfessor INTEIRO POR ESTE:

const DashboardProfessor = memo(() => {
  const { userLogado, presencas, horariosConfiguracao } = useAppState();

  const professorStats = useMemo(() => {
    if (!userLogado) return {};
    
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    
    // Calcula as presenças do professor no mês atual
    const presencasMes = presencas.filter(p => {
      const dataPresenca = new Date(p.data);
      return p.professorId === userLogado.id && dataPresenca >= inicioMes;
    });

    // Agrupa por dia para calcular o pagamento corretamente
    const aulasPorDia = presencasMes.reduce((acc, presenca) => {
        acc[presenca.data] = (acc[presenca.data] || 0) + 1;
        return acc;
    }, {});

    let totalPagamento = 0;
    Object.values(aulasPorDia).forEach(quantidadeAulas => {
        if (userLogado.tipoPagamento === 'fixo') {
          totalPagamento += quantidadeAulas * (userLogado.valorFixo || 0);
        } else {
          const v = userLogado.valoresVariaveis || {};
          if (quantidadeAulas === 1) totalPagamento += (v.uma || 0);
          else if (quantidadeAulas === 2) totalPagamento += (v.duas || 0) * 2;
          else if (quantidadeAulas >= 3) totalPagamento += (v.tres || 0) * quantidadeAulas;
        }
    });

    // Calcula a agenda de hoje
    const diaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][agora.getDay()];
    const agendaHoje = [];
    Object.values(horariosConfiguracao).forEach(unidade => {
        if(unidade[diaSemana]) {
            unidade[diaSemana].forEach(h => {
                if(h.professorId === userLogado.id && h.ativo) {
                    agendaHoje.push(h);
                }
            })
        }
    });

    return {
      aulasEsteMes: presencasMes.length,
      valorAReceber: totalPagamento,
      agendaHoje: agendaHoje.sort((a,b) => a.horario.localeCompare(b.horario)),
      avaliacaoMedia: 4.8 // Placeholder
    };
  }, [userLogado, presencas, horariosConfiguracao]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Olá, Prof. {userLogado?.nome?.split(' ')[0]}! 👨‍🏫
        </h1>
        <p className="text-green-100">
          Acompanhe suas aulas e pagamentos aqui!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Aulas Este Mês"
          value={professorStats.aulasEsteMes}
          icon={Calendar}
          color="text-blue-600"
          subtitle="Aulas confirmadas"
        />
        <StatsCard
          title="A Receber (Mês)"
          value={`R$ ${professorStats.valorAReceber?.toLocaleString('pt-BR')}`}
          icon={DollarSign}
          color="text-green-600"
          subtitle="Cálculo parcial"
        />
        <StatsCard
          title="Avaliação Média"
          value={professorStats.avaliacaoMedia}
          icon={Star}
          color="text-yellow-600"
          subtitle="Dos alunos (em breve)"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Sua Agenda de Hoje
        </h3>
        {professorStats.agendaHoje?.length === 0 ? (
            <div className="text-center py-8">
                <Calendar className="mx-auto text-gray-400 mb-2" size={32}/>
                <p className="text-gray-500 dark:text-gray-400">Você não tem aulas agendadas para hoje.</p>
            </div>
        ) : (
            <div className="space-y-3">
            {professorStats.agendaHoje?.map((aula, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="text-white" size={16} />
                    </div>
                    <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{aula.horario}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Máx: {aula.maxAlunos} alunos</p>
                    </div>
                </div>
                <Button size="sm" variant="secondary">Ver Presenças</Button>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
});

// Dashboard específico para Aluno
// SUBSTITUA O COMPONENTE DashboardAluno INTEIRO POR ESTE:

const DashboardAluno = memo(() => {
  const { userLogado, planos, presencas } = useAppState();

  const minhasPresencas = useMemo(() => {
    return presencas.filter(p => p.alunoId === userLogado?.id);
  }, [presencas, userLogado]);

  const alunoStats = useMemo(() => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    
    const aulasEsteMes = minhasPresencas.filter(p => new Date(p.data) >= inicioMes).length;

    // Lógica simples de sequência
    let sequenciaAtual = 0;
    if(minhasPresencas.length > 0) {
        const datasOrdenadas = minhasPresencas.map(p => new Date(p.data).setHours(0,0,0,0)).sort((a, b) => b - a);
        const datasUnicas = [...new Set(datasOrdenadas)];
        
        let diaAnterior = new Date(new Date().setHours(0,0,0,0));
        diaAnterior.setDate(diaAnterior.getDate() + 1);

        for (const data of datasUnicas) {
            const diaAtual = new Date(data);
            const diff = (diaAnterior - diaAtual) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
                sequenciaAtual++;
                diaAnterior = diaAtual;
            } else {
                break;
            }
        }
    }
    
    return {
      aulasEsteMes,
      progressoMensal: Math.min((aulasEsteMes / 8) * 100, 100), // Meta de 8 aulas/mês
      sequenciaAtual,
      totalAulas: minhasPresencas.length
    };
  }, [minhasPresencas]);

  const planoDoAluno = planos.find(p => p.id === userLogado?.planoId);
  
  const diasParaVencimento = useMemo(() => {
      if(!userLogado?.vencimento || userLogado.tipoPlano === 'plataforma') return null;
      const agora = new Date();
      const vencimento = new Date(userLogado.vencimento);
      return Math.ceil((vencimento - agora) / (1000 * 60 * 60 * 24));
  }, [userLogado]);

  // Sistema de Conquistas (exemplo)
  const conquistas = [
    { id: 1, nome: 'Primeira Aula', icone: '🎉', concluida: alunoStats.totalAulas >= 1 },
    { id: 2, nome: '5 Aulas no Mês', icone: '🔥', concluida: alunoStats.aulasEsteMes >= 5 },
    { id: 3, nome: 'Sequência de 3 dias', icone: '🎯', concluida: alunoStats.sequenciaAtual >= 3 },
    { id: 4, nome: 'Aluno de Aço (20 aulas)', icone: '🏆', concluida: alunoStats.totalAulas >= 20 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Olá, {userLogado?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="text-purple-100">
          Bem-vindo ao seu portal. Continue assim e alcance seus objetivos!
        </p>
      </div>

      {/* Alertas Importantes */}
      {diasParaVencimento !== null && diasParaVencimento <= 7 && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${diasParaVencimento < 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
              <AlertCircle className={diasParaVencimento < 0 ? 'text-red-600' : 'text-yellow-600'} />
              <p className={`text-sm font-medium ${diasParaVencimento < 0 ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                {diasParaVencimento < 0 
                    ? `Sua mensalidade venceu há ${Math.abs(diasParaVencimento)} dias.`
                    : `Atenção! Sua mensalidade vence em ${diasParaVencimento} dias.`
                }
              </p>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Aulas Este Mês"
          value={alunoStats.aulasEsteMes}
          icon={Activity}
          color="text-blue-600"
        />
        <StatsCard
          title="Progresso Mensal"
          value={`${Math.round(alunoStats.progressoMensal)}%`}
          icon={TrendingUp}
          color="text-purple-600"
          subtitle="Meta: 8 aulas"
        />
         <StatsCard
          title="Sequência de Aulas"
          value={`${alunoStats.sequenciaAtual} dias`}
          icon={Award}
          color="text-yellow-600"
          subtitle="Presença consecutiva"
        />
        <StatsCard
          title="Total de Aulas"
          value={alunoStats.totalAulas}
          icon={BarChart3}
          color="text-green-600"
          subtitle="Desde o início"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do plano */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Meu Plano
          </h3>
           {userLogado.tipoPlano === 'plataforma' ? (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">
                        Plano de Plataforma
                    </h4>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {userLogado.plataformaParceira}
                    </p>
                </div>
           ) : planoDoAluno && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                {planoDoAluno.nome}
                </h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                R$ {planoDoAluno.preco.toFixed(2)}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Próximo vencimento: {new Date(userLogado.vencimento).toLocaleDateString('pt-BR')}
                </p>
            </div>
          )}
        </div>

        {/* Conquistas */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            🏆 Minhas Conquistas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {conquistas.map(conquista => (
              <div key={conquista.id} className={`text-center p-3 rounded-lg border-2 ${conquista.concluida ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700 opacity-60'}`}>
                <div className={`text-3xl transition-transform duration-500 ${conquista.concluida ? 'scale-110' : ''}`}>{conquista.icone}</div>
                <p className="text-xs font-medium mt-2">{conquista.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// 🆕 Dashboard específico para Gestor
const DashboardGestor = memo(() => {
  const { userLogado, alunos, professores, financeiro, treinos, presencas, setActiveTab } = useAppState(); // 🆕 Adicionado setActiveTab
  const { hasFullAccess, currentUnit, isGestor } = useUnitAccess();
  const unitFilteredAlunos = useUnitFilteredData(alunos, 'alunos');
  const unitFilteredProfessores = useUnitFilteredData(professores, 'professores');
  const unitFilteredFinanceiro = useUnitFilteredData(financeiro, 'financeiro');
  const [metas] = useLocalStorage('metas-ct', []);

  // Estatísticas da unidade do gestor
  const gestorStats = useMemo(() => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    
    // Estatísticas de alunos da unidade
    const totalAlunos = unitFilteredAlunos.length;
    const alunosAtivos = unitFilteredAlunos.filter(a => a.status === 'ativo').length;
    const alunosPendentes = unitFilteredAlunos.filter(a => a.status === 'pendente').length;
    const alunosVencidos = unitFilteredAlunos.filter(a => {
      const vencimento = new Date(a.vencimento);
      return vencimento < agora;
    }).length;

    // Estatísticas de professores da unidade
    const totalProfessores = unitFilteredProfessores.length;
    const professoresAtivos = unitFilteredProfessores.filter(p => p.ativo).length;

    // Estatísticas financeiras da unidade (este mês)
    const receitasMes = unitFilteredFinanceiro
      .filter(f => f.tipo === 'receita' && new Date(f.data) >= inicioMes)
      .reduce((acc, f) => acc + f.valor, 0);
    
    const despesasMes = unitFilteredFinanceiro
      .filter(f => f.tipo === 'despesa' && new Date(f.data) >= inicioMes)
      .reduce((acc, f) => acc + f.valor, 0);

    const lucroMes = receitasMes - despesasMes;

    // Presenças este mês (estimativa baseada nos alunos)
    const presencasMes = presencas.filter(p => {
      const dataPresenca = new Date(p.data);
      return dataPresenca >= inicioMes && dataPresenca <= agora;
    }).length;

    return {
      totalAlunos,
      alunosAtivos,
      alunosPendentes,
      alunosVencidos,
      totalProfessores,
      professoresAtivos,
      receitasMes,
      despesasMes,
      lucroMes,
      presencasMes
    };
  }, [unitFilteredAlunos, unitFilteredProfessores, unitFilteredFinanceiro, presencas]);

  // Metas específicas da unidade
  const metasUnidade = useMemo(() => {
    return metas.filter(meta => 
      meta.escopo === 'unidade' && meta.unidadeSelecionada === currentUnit ||
      meta.escopo === 'geral'
    );
  }, [metas, currentUnit]);

  return (
    <div className="p-6 space-y-6">
      {/* Header personalizado para gestor */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Olá, {userLogado?.nome?.split(' ')[0]}! 👨‍💼
            </h1>
            <p className="text-orange-100">
              Bem-vindo ao painel de gestão da unidade {currentUnit}
            </p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/20">
              <Building size={14} className="mr-1" />
              Gestor da Unidade {currentUnit}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {gestorStats.alunosAtivos}
            </div>
            <div className="text-orange-100 text-sm">
              Alunos Ativos
            </div>
          </div>        
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Alunos
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gestorStats.totalAlunos}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {gestorStats.alunosAtivos} ativos • {gestorStats.alunosPendentes} pendentes
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Professores
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {gestorStats.totalProfessores}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {gestorStats.professoresAtivos} ativos
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <User className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Receita do Mês
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                R$ {gestorStats.receitasMes.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lucro: R$ {gestorStats.lucroMes.toFixed(0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Presenças do Mês
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {gestorStats.presencasMes}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Aulas realizadas
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Calendar className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas importantes */}
      {gestorStats.alunosVencidos > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-600 dark:text-red-400 mr-3" size={20} />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Atenção! {gestorStats.alunosVencidos} aluno(s) com mensalidade vencida
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Acesse a seção de Alunos para gerenciar os vencimentos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de ações rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações rápidas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            🚀 Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('alunos')}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
            >
              <Users size={20} className="mb-2" />
              <div className="text-sm font-medium">Gerenciar Alunos</div>
              <div className="text-xs opacity-75">{gestorStats.totalAlunos} alunos</div>
            </button>
            
            <button
              onClick={() => setActiveTab('professores')}
              className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
            >
              <User size={20} className="mb-2" />
              <div className="text-sm font-medium">Professores</div>
              <div className="text-xs opacity-75">{gestorStats.totalProfessores} professores</div>
            </button>
            
            <button
              onClick={() => setActiveTab('financeiro')}
              className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
            >
              <DollarSign size={20} className="mb-2" />
              <div className="text-sm font-medium">Financeiro</div>
              <div className="text-xs opacity-75">R$ {gestorStats.receitasMes.toFixed(0)} receita</div>
            </button>
            
            <button
              onClick={() => setActiveTab('presenca')}
              className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
            >
              <CheckCircle size={20} className="mb-2" />
              <div className="text-sm font-medium">Presença</div>
              <div className="text-xs opacity-75">{gestorStats.presencasMes} este mês</div>
            </button>
          </div>
        </div>

        {/* Metas da unidade */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            🎯 Metas da Unidade
          </h3>
          {metasUnidade.length === 0 ? (
            <div className="text-center py-6">
              <Target className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma meta definida para sua unidade
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {metasUnidade.slice(0, 3).map(meta => (
                <div key={meta.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {meta.titulo}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {meta.valorAtual}/{meta.valorMeta} • {meta.tipo}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {Math.round((meta.valorAtual / meta.valorMeta) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {metasUnidade.length > 3 && (
                <button
                  onClick={() => setActiveTab('metas')}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2"
                >
                  Ver todas as {metasUnidade.length} metas →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Modal de Aluno Melhorado
const AlunoModal = memo(({ isOpen, onClose, onSave, aluno, planos, loading }) => {
 const [formData, setFormData] = useState({
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  unidade: '',
  nomesCheckin: [], // ✅ Array vazio - só aparece quando adicionar
  tipoPlano: 'mensalidade',
  plataformaParceira: '',
  planoId: planos.length > 0 ? planos[0].id : '',
  objetivo: 'Lazer',
  nivel: 'iniciante'
});
  const [errors, setErrors] = useState({});

  useEffect(() => {
  if (aluno) {
    setFormData({
      nome: aluno.nome || '',
      email: aluno.email || '',
      telefone: aluno.telefone || '',
      senha: aluno.senha || '',
      unidade: aluno.unidade || '',
      nomesCheckin: aluno.nomesCheckin || [], // ✅ Array vazio se não tiver
      tipoPlano: aluno.tipoPlano || 'mensalidade',
      plataformaParceira: aluno.plataformaParceira || '',
      planoId: aluno.planoId || (planos.length > 0 ? planos[0].id : ''),
      objetivo: aluno.objetivo || 'Lazer',
      nivel: aluno.nivel || 'iniciante'
    });
  } else {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      unidade: '',
      nomesCheckin: [], // ✅ Array vazio
      tipoPlano: 'mensalidade',
      plataformaParceira: '',
      planoId: planos.length > 0 ? planos[0].id : '',
      objetivo: 'Lazer',
      nivel: 'iniciante'
    });
  }
  setErrors({});
}, [aluno, planos, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato: (11) 99999-9999';
    }
    
    if (!formData.senha.trim()) {
    newErrors.senha = 'Senha é obrigatória';
  }
  
  if (!formData.unidade.trim()) {
    newErrors.unidade = 'Unidade é obrigatória';
  }
    if (formData.tipoPlano === 'mensalidade' && !formData.planoId) {
    newErrors.planoId = 'Plano é obrigatório para mensalidade';
  }
  
  if (!formData.planoId) {
    newErrors.planoId = 'Plano é obrigatório';
  }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

 const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  if (validateForm()) {
    // 🆕 Limpar planoId se for plataforma
    const dadosParaSalvar = { ...formData };
    if (formData.tipoPlano === 'plataforma') {
      dadosParaSalvar.planoId = null; // Não precisa de plano
    }
    
    await onSave(dadosParaSalvar);
  }
}, [formData, validateForm, onSave]);

  const formatPhone = useCallback((value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }, []);

  const handlePhoneChange = useCallback((e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  }, [formatPhone]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={aluno ? 'Editar Aluno' : 'Novo Aluno'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            required
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            error={errors.nome}
            placeholder="Digite o nome completo"
          />
          
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            placeholder="email@exemplo.com"
          />
        </div>

        {/* 🆕 NOVA VERSÃO - Grid com Telefone e Senha */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input
    label="Telefone"
    required
    value={formData.telefone}
    onChange={handlePhoneChange}
    error={errors.telefone}
    placeholder="(11) 99999-9999"
    maxLength={15}
  />
  
  {/* 🆕 NOVO CAMPO - Senha */}
  <Input
    label="🔐 Senha"
    type="password"
    required
    value={formData.senha}
    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
    error={errors.senha}
    placeholder="Senha para login do aluno"
  />
</div>

{/* 🆕 NOVO CAMPO - Unidade */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
    🏢 Unidade <span className="text-red-500">*</span>
  </label>
  <select
    required
    value={formData.unidade}
    onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors.unidade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
  >
    <option value="">Selecione a unidade</option>
    <option value="Centro">Unidade Centro</option>
    <option value="Zona Sul">Unidade Zona Sul</option>
    <option value="Zona Norte">Unidade Zona Norte</option>
    <option value="Barra">Unidade Barra</option>
  </select>
  {errors.unidade && (
    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.unidade}</p>
  )}
</div>

{/* 🆕 NOVO - Nomes para Check-in (opcional) */}
<div>
  <div className="flex justify-between items-center mb-3">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
      📝 Nomes para Check-in (Opcional)
    </label>
    <button
      type="button"
      onClick={() => setFormData(prev => ({
        ...prev,
        nomesCheckin: [...(prev.nomesCheckin || []), '']
      }))}
      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus size={16} />
      <span className="text-sm">Adicionar Nome</span>
    </button>
  </div>
  
  {/* Só mostra os campos se houver nomes adicionados */}
  {formData.nomesCheckin && formData.nomesCheckin.length > 0 && (
    <div className="space-y-3">
      {formData.nomesCheckin.map((nome, index) => (
        <div key={index} className="flex gap-3">
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              const newNomes = [...(formData.nomesCheckin || [])];
              newNomes[index] = e.target.value;
              setFormData(prev => ({ ...prev, nomesCheckin: newNomes }));
            }}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={`Nome adicional ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              nomesCheckin: (prev.nomesCheckin || []).filter((_, i) => i !== index)
            }))}
            className="px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )}
  
  <p className="text-xs text-gray-500 mt-2">
    💡 Adicione nomes de terceiros que podem fazer check-in por este aluno (opcional).
  </p>
</div>

{/* 🆕 NOVO CAMPO - Tipo de Plano */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
    💳 Tipo de Plano
  </label>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
      <input
        type="radio"
        name="tipoPlano"
        value="mensalidade"
        checked={formData.tipoPlano === 'mensalidade'}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          tipoPlano: e.target.value, 
          plataformaParceira: '' 
        }))}
        className="mr-3"
      />
      <div>
        <div className="font-medium">💰 Mensalidade</div>
        <div className="text-sm text-gray-500">Pagamento direto na academia</div>
      </div>
    </label>
    
    <label className="flex items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
      <input
        type="radio"
        name="tipoPlano"
        value="plataforma"
        checked={formData.tipoPlano === 'plataforma'}
        onChange={(e) => setFormData(prev => ({ ...prev, tipoPlano: e.target.value }))}
        className="mr-3"
      />
      <div>
        <div className="font-medium">🤝 Plataforma Parceira</div>
        <div className="text-sm text-gray-500">Wellhub, TotalPass, etc.</div>
      </div>
    </label>
  </div>
</div>

{/* 🆕 CAMPO CONDICIONAL - Plataforma Parceira */}
{formData.tipoPlano === 'plataforma' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
      🤝 Plataforma Parceira
    </label>
    <select
      value={formData.plataformaParceira || ''}
      onChange={(e) => setFormData(prev => ({ ...prev, plataformaParceira: e.target.value }))}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    >
      <option value="">Selecione a plataforma</option>
      <option value="Wellhub">Wellhub</option>
      <option value="TotalPass">TotalPass</option>
      <option value="Gympass">Gympass</option>
      <option value="Vivo Melon">Vivo Melon</option>
    </select>
  </div>
)}

{/* 🆕 CAMPO ORIGINAL - Plano (movido para cá) */}
{/* 🆕 CAMPO PLANO - Só aparece se for mensalidade */}
{formData.tipoPlano === 'mensalidade' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      Plano <span className="text-red-500">*</span>
    </label>
    <select
      required
      value={formData.planoId}
      onChange={(e) => setFormData(prev => ({ ...prev, planoId: parseInt(e.target.value) }))}
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        errors.planoId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
    >
      <option value="">Selecione um plano</option>
      {planos
        .filter(plano => plano.unidade === formData.unidade || !formData.unidade)
        .map(plano => (
          <option key={plano.id} value={plano.id}>
            {plano.nome} - R$ {plano.preco.toFixed(2)} ({plano.unidade})
          </option>
        ))}
    </select>
    {errors.planoId && (
      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.planoId}</p>
    )}
  </div>
)}

{/* 🆕 INFORMAÇÃO QUANDO FOR PLATAFORMA */}
{formData.tipoPlano === 'plataforma' && (
  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
    <div className="flex items-center">
      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
        <CheckCircle className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <h4 className="font-semibold text-green-800 dark:text-green-300">Plataforma Parceira</h4>
        <p className="text-green-700 dark:text-green-400 text-sm">
          O aluno usará {formData.plataformaParceira || 'uma plataforma parceira'}. 
          Não é necessário selecionar plano de mensalidade.
        </p>
      </div>
    </div>
  </div>
)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Objetivo
            </label>
            <select
              value={formData.objetivo}
              onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Lazer">Lazer</option>
              <option value="Fitness">Fitness</option>
              <option value="Competição">Competição</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Nível
            </label>
            <select
              value={formData.nivel}
              onChange={(e) => setFormData(prev => ({ ...prev, nivel: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {aluno ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

// Componente de Lista de Alunos Melhorado
const AlunosPage = memo(() => {
  const { alunos, setAlunos, planos } = useAppState();
  const { addNotification } = useNotifications();
  
  // 🆕 Controle de acesso por unidade
  const { hasFullAccess, currentUnit, isGestor } = useUnitAccess();
  const unitFilteredAlunos = useUnitFilteredData(alunos, 'alunos');
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingAluno, setEditingAluno] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dados filtrados (primeiro por unidade, depois por filtros)
  const filteredAlunos = useAdvancedFilter(unitFilteredAlunos, { // 🆕 Usar dados filtrados por unidade
    ...filters,
    nome: searchTerm,
    email: searchTerm 
  });

  // Colunas da tabela
 // Colunas da tabela - VERSÃO MELHORADA
const columns = useMemo(() => [
  {
    key: 'nome',
    label: 'Aluno',
    render: (aluno) => (
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {aluno.nome}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {aluno.email}
        </div>
        {/* 🆕 Mostrar unidade do aluno */}
        <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
          <Building size={12} className="mr-1" />
          {aluno.unidade || 'Unidade não definida'}
        </div>
      </div>
    )
  },
  {
    key: 'plano',
    label: 'Plano/Plataforma',
    render: (aluno) => {
      // 🆕 Verificar se é plataforma ou mensalidade
      if (aluno.tipoPlano === 'plataforma') {
        return (
          <div>
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
              🤝 {aluno.plataformaParceira}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Plataforma Parceira
            </div>
            <div className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 px-2 py-1 rounded-full inline-block mt-1">
              Parceiro
            </div>
          </div>
        );
      } else {
        // Aluno com mensalidade
        const plano = planos.find(p => p.id === aluno.planoId);
        return (
          <div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              💰 {plano?.nome || 'Plano não encontrado'}
            </div>
            {plano && (
              <>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  R$ {plano.preco.toFixed(2)}/mês
                </div>
                <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full inline-block mt-1">
                  Mensalidade
                </div>
              </>
            )}
          </div>
        );
      }
    }
  },
  {
    key: 'status',
    label: 'Status',
    render: (aluno) => (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        aluno.status === 'ativo' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`}>
        {aluno.status}
      </span>
    )
  },
  {
    key: 'vencimento',
    label: 'Vencimento',
    render: (aluno) => {
      // 🆕 Só mostrar vencimento para alunos de mensalidade
      if (aluno.tipoPlano === 'plataforma') {
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div>Sem vencimento</div>
            <div className="text-xs">(Plataforma)</div>
          </div>
        );
      } else {
        const vencimento = new Date(aluno.vencimento);
        const hoje = new Date();
        const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              {vencimento.toLocaleDateString('pt-BR')}
            </div>
            <div className={`text-xs ${
              diasRestantes <= 3 ? 'text-red-600' : 
              diasRestantes <= 7 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido'}
            </div>
          </div>
        );
      }
    }
  },
  {
    key: 'actions',
    label: 'Ações',
    render: (aluno) => (
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleEdit(aluno)}
          leftIcon={<Edit size={14} />}
          aria-label={`Editar ${aluno.nome}`}
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDelete(aluno.id)}
          leftIcon={<Trash size={14} />}
          aria-label={`Excluir ${aluno.nome}`}
        >
          Excluir
        </Button>
      </div>
    )
  }
], [planos]);

  // Handlers
  const handleEdit = useCallback((aluno) => {
    setEditingAluno(aluno);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((alunoId) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      setAlunos(prev => prev.filter(a => a.id !== alunoId));
      addNotification({
        type: 'success',
        title: 'Aluno excluído',
        message: 'Aluno removido com sucesso'
      });
    }
  }, [setAlunos, addNotification]);

  const handleSave = useCallback(async (alunoData) => {
    setLoading(true);
    try {
      if (editingAluno) {
        // Editar - gestor só pode editar alunos da sua unidade
        const dadosAtualizados = { ...alunoData };
        
        // 🆕 Gestor não pode alterar a unidade do aluno
        if (isGestor) {
          dadosAtualizados.unidade = editingAluno.unidade;
        }
        
        setAlunos(prev => prev.map(a => 
          a.id === editingAluno.id ? { ...a, ...dadosAtualizados } : a
        ));
        addNotification({
          type: 'success',
          title: 'Aluno atualizado',
          message: 'Dados do aluno atualizados com sucesso'
        });
      } else {
        // Criar novo
        const novoAluno = {
          id: Date.now(),
          ...alunoData,
          // 🆕 Gestor cria alunos automaticamente na sua unidade
          unidade: isGestor ? currentUnit : (alunoData.unidade || 'Centro'),
          status: 'ativo',
          vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          senha: '123456',
          dataMatricula: new Date().toISOString().split('T')[0]
        };
        setAlunos(prev => [...prev, novoAluno]);
        addNotification({
          type: 'success',
          title: 'Aluno cadastrado',
          message: `Novo aluno adicionado${isGestor ? ` na unidade ${currentUnit}` : ''} com sucesso`
        });
      }
      setShowModal(false);
      setEditingAluno(null);
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar dados do aluno'
      });
    } finally {
      setLoading(false);
    }
  }, [editingAluno, setAlunos, addNotification, isGestor, currentUnit]); // 🆕 Adicionado dependências do controle de acesso

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const exportData = useCallback(() => {
    const exportData = filteredAlunos.map(aluno => ({
      Nome: aluno.nome,
      Email: aluno.email,
      Telefone: aluno.telefone,
      Status: aluno.status,
      Plano: planos.find(p => p.id === aluno.planoId)?.nome || '',
      Vencimento: aluno.vencimento,
      'Data Matrícula': aluno.dataMatricula
    }));
    exportToCSV(exportData, 'alunos');
  }, [filteredAlunos, planos]);

  return (
    <div className="p-6 space-y-6">
      {/* 🆕 Header com título e informação da unidade */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              👥 Gerenciamento de Alunos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isGestor 
                ? `Gerencie os alunos da unidade ${currentUnit}`
                : hasFullAccess 
                  ? 'Gerencie todos os alunos do sistema'
                  : 'Visualize os alunos'
              }
            </p>
            {isGestor && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                <Building size={14} className="mr-1" />
                Unidade: {currentUnit}
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              setEditingAluno(null);
              setShowModal(true);
            }}
            leftIcon={<Plus size={20} />}
            aria-label="Adicionar novo aluno"
          >
            Novo Aluno
          </Button>
        </div>
      </div>

      {/* Header com busca e ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
       <SearchBar
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  placeholder="Buscar alunos por nome ou email..."
  filters={filters}
  onFiltersChange={setFilters}
  clearFilters={clearFilters}
  exportData={exportData}
  alunos={unitFilteredAlunos} // 🆕 Passar alunos filtrados por unidade
/>
      </div>

      {/* Estatísticas rápidas - baseadas nos dados filtrados por unidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{unitFilteredAlunos.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isGestor ? `Alunos na ${currentUnit}` : 'Total de Alunos'}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {unitFilteredAlunos.filter(a => a.status === 'ativo').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Ativos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {unitFilteredAlunos.filter(a => a.status === 'pendente').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pendentes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {filteredAlunos.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Resultados</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <DataTable
          data={filteredAlunos}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum aluno encontrado"
          itemsPerPage={10}
        />
      </div>

      {/* Modal de Edição/Criação */}
      <AlunoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAluno(null);
        }}
        onSave={handleSave}
        aluno={editingAluno}
        planos={planos}
        loading={loading}
      />
    </div>
  );
});

// Página de Professores
// Página de Professores - VERSÃO MELHORADA COM SISTEMA DE PAGAMENTO
const ProfessoresPage = memo(() => {
  const { professores, setProfessores, presencas } = useAppState();
  const { addNotification } = useNotifications();
  
  // 🆕 Controle de acesso por unidade
  const { hasFullAccess, currentUnit, isGestor } = useUnitAccess();
  const unitFilteredProfessores = useUnitFilteredData(professores, 'professores');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);

  // 🆕 Calcular estatísticas de pagamento dos professores (filtrado por unidade)
  const estatisticasPagamento = useMemo(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    return unitFilteredProfessores.map(professor => { // 🆕 Usar dados filtrados por unidade
      // Buscar presenças do professor neste mês
      const presencasMes = presencas.filter(p => {
        const dataPresenca = new Date(p.data);
        return p.professorId === professor.id && 
               dataPresenca >= inicioMes && 
               dataPresenca <= hoje;
      });

      // Agrupar por dia
      const aulasPorDia = presencasMes.reduce((acc, presenca) => {
        const dia = presenca.data;
        acc[dia] = (acc[dia] || 0) + 1;
        return acc;
      }, {});

      // Calcular pagamento total
      let totalPagamento = 0;
      let totalAulas = 0;

      Object.entries(aulasPorDia).forEach(([dia, quantidadeAulas]) => {
        totalAulas += quantidadeAulas;
        
        if (professor.tipoPagamento === 'fixo') {
          totalPagamento += quantidadeAulas * (professor.valorFixo || 45);
        } else {
          const valores = professor.valoresVariaveis || { uma: 20, duas: 18, tres: 15 };
          let valorDia = 0;
          
          if (quantidadeAulas === 1) {
            valorDia = valores.uma * 1;
          } else if (quantidadeAulas === 2) {
            valorDia = valores.duas * 2;
          } else if (quantidadeAulas >= 3) {
            valorDia = valores.tres * quantidadeAulas;
          }
          
          totalPagamento += valorDia;
        }
      });

      return {
        ...professor,
        totalAulasMes: totalAulas,
        totalPagamentoMes: totalPagamento,
        diasTrabalhados: Object.keys(aulasPorDia).length,
        mediaDiariaAulas: Object.keys(aulasPorDia).length > 0 ? 
          totalAulas / Object.keys(aulasPorDia).length : 0
      };
    });
  }, [unitFilteredProfessores, presencas]); // 🆕 Usar dados filtrados por unidade

  const filteredProfessores = useAdvancedFilter(estatisticasPagamento, { 
    ...filters,
    nome: searchTerm,
    email: searchTerm 
  });

  // 🆕 Colunas melhoradas para a tabela
  const columns = useMemo(() => [
    {
      key: 'professor',
      label: 'Professor',
      render: (professor) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {professor.nome?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {professor.nome}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {professor.email}
            </div>
            <div className="flex gap-1 mt-1">
              {professor.especialidades?.slice(0, 2).map(esp => (
                <span key={esp} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-1 py-0.5 rounded">
                  {esp.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'pagamento',
      label: 'Sistema de Pagamento',
      render: (professor) => (
        <div>
          <div className={`text-sm font-medium ${
            professor.tipoPagamento === 'fixo' ? 'text-blue-600' : 'text-green-600'
          }`}>
            {professor.tipoPagamento === 'fixo' ? '💰 Valor Fixo' : '📊 Valor Variável'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {professor.tipoPagamento === 'fixo' 
              ? `R$ ${professor.valorFixo || 45}/aula`
              : `R$ ${professor.valoresVariaveis?.uma || 20} - R$ ${professor.valoresVariaveis?.tres || 15}/aula`
            }
          </div>
        </div>
      )
    },
    {
      key: 'performance',
      label: 'Performance do Mês',
      render: (professor) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {professor.totalAulasMes} aulas
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {professor.diasTrabalhados} dias trabalhados
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            Média: {professor.mediaDiariaAulas.toFixed(1)} aulas/dia
          </div>
        </div>
      )
    },
    {
      key: 'pagamentoMes',
      label: 'A Receber (Mês)',
      render: (professor) => (
        <div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            R$ {professor.totalPagamentoMes.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {professor.totalAulasMes > 0 ? 
              `Média: R$ ${(professor.totalPagamentoMes / professor.totalAulasMes).toFixed(2)}/aula` 
              : 'Sem aulas'
            }
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (professor) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          professor.ativo 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {professor.ativo ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (professor) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedProfessor(professor);
              setShowPagamentoModal(true);
            }}
            leftIcon={<DollarSign size={14} />}
            title="Ver detalhes de pagamento"
          >
            Pagamento
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(professor)}
            leftIcon={<Edit size={14} />}
            title="Editar professor"
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(professor.id)}
            leftIcon={<Trash size={14} />}
            title="Excluir professor"
          >
            Excluir
          </Button>
        </div>
      )
    }
  ], []);

  const handleEdit = useCallback((professor) => {
    setEditingProfessor(professor);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((professorId) => {
    const professor = professores.find(p => p.id === professorId);
    if (window.confirm(`Tem certeza que deseja excluir o professor ${professor.nome}?`)) {
      setProfessores(prev => prev.filter(p => p.id !== professorId));
      addNotification({
        type: 'success',
        title: 'Professor excluído',
        message: 'Professor removido com sucesso'
      });
    }
  }, [professores, setProfessores, addNotification]);

  const handleSave = useCallback(async (professorData) => {
    setLoading(true);
    try {
      if (editingProfessor) {
        setProfessores(prev => prev.map(p => 
          p.id === editingProfessor.id ? { ...p, ...professorData } : p
        ));
        addNotification({
          type: 'success',
          title: 'Professor atualizado',
          message: 'Dados atualizados com sucesso'
        });
      } else {
        const novoProfessor = {
          id: Date.now(),
          ...professorData,
          status: 'ativo'
        };
        setProfessores(prev => [...prev, novoProfessor]);
        addNotification({
          type: 'success',
          title: 'Professor cadastrado',
          message: 'Novo professor adicionado com sucesso'
        });
      }
      setShowModal(false);
      setEditingProfessor(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar dados'
      });
    } finally {
      setLoading(false);
    }
  }, [editingProfessor, setProfessores, addNotification]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const exportData = useCallback(() => {
    const exportData = filteredProfessores.map(prof => ({
      Nome: prof.nome,
      Email: prof.email,
      Telefone: prof.telefone,
      'Tipo Pagamento': prof.tipoPagamento === 'fixo' ? 'Fixo' : 'Variável',
      'Valor/Sistema': prof.tipoPagamento === 'fixo' 
        ? `R$ ${prof.valorFixo}/aula`
        : `R$ ${prof.valoresVariaveis?.uma}-${prof.valoresVariaveis?.tres}/aula`,
      'Aulas Mês': prof.totalAulasMes,
      'Pagamento Mês': `R$ ${prof.totalPagamentoMes.toFixed(2)}`,
      'Especialidades': prof.especialidades?.join(', ') || '',
      Status: prof.ativo ? 'Ativo' : 'Inativo'
    }));
    exportToCSV(exportData, 'professores-pagamentos');
  }, [filteredProfessores]);

  // 🆕 Estatísticas totais (baseadas nos dados filtrados por unidade)
  const estatisticasTotais = useMemo(() => {
    const totalProfessores = unitFilteredProfessores.length; // 🆕 Usar dados filtrados por unidade
    const professoresAtivos = unitFilteredProfessores.filter(p => p.ativo).length; // 🆕 Usar dados filtrados por unidade
    const totalPagamentoMes = estatisticasPagamento.reduce((acc, p) => acc + p.totalPagamentoMes, 0);
    const totalAulasMes = estatisticasPagamento.reduce((acc, p) => acc + p.totalAulasMes, 0);
    const professoresFixos = unitFilteredProfessores.filter(p => p.tipoPagamento === 'fixo').length; // 🆕 Usar dados filtrados por unidade
    const professoresVariaveis = unitFilteredProfessores.filter(p => p.tipoPagamento === 'variavel').length; // 🆕 Usar dados filtrados por unidade

    return {
      totalProfessores,
      professoresAtivos,
      totalPagamentoMes,
      totalAulasMes,
      professoresFixos,
      professoresVariaveis,
      ticketMedio: totalAulasMes > 0 ? totalPagamentoMes / totalAulasMes : 0
    };
  }, [unitFilteredProfessores, estatisticasPagamento]); // 🆕 Usar dados filtrados por unidade

  return (
    <div className="p-6 space-y-6">
      {/* Header melhorado */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">👨‍🏫 Gestão de Professores</h2>
            <p className="text-green-100">
              {isGestor 
                ? `Gerencie os professores da unidade ${currentUnit}`
                : hasFullAccess 
                  ? 'Sistema completo de controle de professores e pagamentos'
                  : 'Visualize os professores'
              }
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                📊 {unitFilteredProfessores.length} {isGestor ? `Professores na ${currentUnit}` : 'Professores'}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                💰 R$ {estatisticasTotais.totalPagamentoMes.toFixed(0)} este mês
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                🎯 {estatisticasTotais.totalAulasMes} aulas
              </span>
            </div>
          </div>
          
          <Button
            onClick={() => {
              setEditingProfessor(null);
              setShowModal(true);
            }}
            leftIcon={<Plus size={20} />}
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            Novo Professor
          </Button>
        </div>
      </div>

      {/* Estatísticas em cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{estatisticasTotais.totalProfessores}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{estatisticasTotais.professoresAtivos}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Ativos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">R$ {estatisticasTotais.totalPagamentoMes.toFixed(0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">A Pagar (Mês)</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{estatisticasTotais.totalAulasMes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Aulas (Mês)</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-indigo-600">{estatisticasTotais.professoresFixos}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Valor Fixo</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-pink-600">{estatisticasTotais.professoresVariaveis}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Valor Variável</div>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar professores..."
          filters={filters}
          onFiltersChange={setFilters}
          clearFilters={clearFilters}
          exportData={exportData}
          alunos={[]} // Não precisa para professores
        />
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode('cards')}
            variant={viewMode === 'cards' ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<Package size={16} />}
          >
            Cards
          </Button>
          <Button
            onClick={() => setViewMode('table')}
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<BarChart size={16} />}
          >
            Tabela
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      {viewMode === 'cards' ? (
        /* Visualização em Cards Melhorada */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessores.map(professor => (
            <div key={professor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
              {/* Header do card */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {professor.nome?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {professor.nome}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {professor.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        professor.ativo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {professor.ativo ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        professor.tipoPagamento === 'fixo'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {professor.tipoPagamento === 'fixo' ? '💰 Fixo' : '📊 Variável'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sistema de Pagamento */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    💳 Sistema de Pagamento
                  </div>
                  {professor.tipoPagamento === 'fixo' ? (
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      R$ {professor.valorFixo || 45}/aula
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>1 aula:</span>
                        <span className="font-medium">R$ {professor.valoresVariaveis?.uma || 20}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2 aulas:</span>
                        <span className="font-medium">R$ {professor.valoresVariaveis?.duas || 18}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3+ aulas:</span>
                        <span className="font-medium">R$ {professor.valoresVariaveis?.tres || 15}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance do Mês */}
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    📊 Performance Este Mês
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{professor.totalAulasMes}</div>
                      <div className="text-xs text-green-700 dark:text-green-400">Aulas</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{professor.diasTrabalhados}</div>
                      <div className="text-xs text-green-700 dark:text-green-400">Dias</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{professor.mediaDiariaAulas.toFixed(1)}</div>
                      <div className="text-xs text-green-700 dark:text-green-400">Média/dia</div>
                    </div>
                  </div>
                </div>

                {/* Valor a Receber */}
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                    💰 A Receber Este Mês
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    R$ {professor.totalPagamentoMes.toFixed(2)}
                  </div>
                  {professor.totalAulasMes > 0 && (
                    <div className="text-xs text-purple-700 dark:text-purple-400">
                      Média: R$ {(professor.totalPagamentoMes / professor.totalAulasMes).toFixed(2)}/aula
                    </div>
                  )}
                </div>

                {/* Especialidades */}
                {professor.especialidades && professor.especialidades.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🎯 Especialidades
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {professor.especialidades.slice(0, 3).map(esp => (
                        <span key={esp} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full">
                          {esp}
                        </span>
                      ))}
                      {professor.especialidades.length > 3 && (
                        <span className="text-xs text-gray-500">+{professor.especialidades.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer com ações */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedProfessor(professor);
                      setShowPagamentoModal(true);
                    }}
                    leftIcon={<DollarSign size={14} />}
                    className="flex-1"
                  >
                    Pagamento
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(professor)}
                    leftIcon={<Edit size={14} />}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Visualização em Tabela */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <DataTable
            data={filteredProfessores}
            columns={columns}
            loading={loading}
            emptyMessage="Nenhum professor encontrado"
            itemsPerPage={10}
          />
        </div>
      )}

      {/* Modais */}
      <ProfessorModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProfessor(null);
        }}
        onSave={handleSave}
        professor={editingProfessor}
        loading={loading}
      />

      {/* 🆕 Modal de Detalhes de Pagamento */}
      <PagamentoProfessorModal
        isOpen={showPagamentoModal}
        onClose={() => {
          setShowPagamentoModal(false);
          setSelectedProfessor(null);
        }}
        professor={selectedProfessor}
        presencas={presencas}
      />
    </div>
  );
});

// 🆕 Página de Gestores - Nova funcionalidade para gerenciar gestores das unidades
const GestoresPage = memo(() => {
  const { gestores, setGestores, unidades } = useAppState();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingGestor, setEditingGestor] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dados filtrados
  const filteredGestores = useMemo(() => {
    return gestores.filter(gestor => {
      const searchMatch = !searchTerm || 
        gestor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gestor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gestor.unidadeResponsavel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const unidadeMatch = !filters.unidade || gestor.unidadeResponsavel === filters.unidade;
      const statusMatch = filters.status === undefined || 
        (filters.status === 'ativo' ? gestor.ativo : !gestor.ativo);
      
      return searchMatch && unidadeMatch && statusMatch;
    });
  }, [gestores, searchTerm, filters]);

  // Colunas da tabela
  const columns = useMemo(() => [
    {
      key: 'nome',
      label: 'Gestor',
      render: (gestor) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {gestor.nome}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {gestor.email}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
            <Building size={12} className="mr-1" />
            Gestor da {gestor.unidadeResponsavel}
          </div>
        </div>
      )
    },
    {
      key: 'unidade',
      label: 'Unidade Responsável',
      render: (gestor) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
          <Building size={12} className="mr-1" />
          {gestor.unidadeResponsavel}
        </span>
      )
    },
    {
      key: 'contato',
      label: 'Contato',
      render: (gestor) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            📞 {gestor.telefone}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Admissão: {new Date(gestor.dataAdmissao).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (gestor) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          gestor.ativo 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {gestor.ativo ? '✅ Ativo' : '❌ Inativo'}
        </span>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (gestor) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(gestor)}
            leftIcon={<Edit size={16} />}
          >
            Editar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleToggleStatus(gestor)}
            className={gestor.ativo ? 'text-red-600' : 'text-green-600'}
          >
            {gestor.ativo ? '❌ Desativar' : '✅ Ativar'}
          </Button>
        </div>
      )
    }
  ], []);

  const handleEdit = useCallback((gestor) => {
    setEditingGestor(gestor);
    setShowModal(true);
  }, []);

  const handleToggleStatus = useCallback((gestor) => {
    const action = gestor.ativo ? 'desativar' : 'ativar';
    if (window.confirm(`Tem certeza que deseja ${action} o gestor ${gestor.nome}?`)) {
      setGestores(prev => prev.map(g => 
        g.id === gestor.id ? { ...g, ativo: !g.ativo } : g
      ));
      addNotification({
        type: 'success',
        title: 'Status alterado',
        message: `Gestor ${gestor.ativo ? 'desativado' : 'ativado'} com sucesso`
      });
    }
  }, [setGestores, addNotification]);

  const handleSave = useCallback(async (gestorData) => {
    setLoading(true);
    try {
      if (editingGestor) {
        // Editar
        setGestores(prev => prev.map(g => 
          g.id === editingGestor.id ? { ...g, ...gestorData } : g
        ));
        addNotification({
          type: 'success',
          title: 'Gestor atualizado',
          message: 'Dados do gestor atualizados com sucesso'
        });
      } else {
        // Criar novo
        const novoGestor = {
          id: Date.now(),
          ...gestorData,
          ativo: true,
          dataAdmissao: new Date().toISOString().split('T')[0]
        };
        setGestores(prev => [...prev, novoGestor]);
        addNotification({
          type: 'success',
          title: 'Gestor cadastrado',
          message: 'Novo gestor adicionado com sucesso'
        });
      }
      setShowModal(false);
      setEditingGestor(null);
    } catch (error) {
      console.error('Erro ao salvar gestor:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar dados do gestor'
      });
    } finally {
      setLoading(false);
    }
  }, [editingGestor, setGestores, addNotification]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const exportData = useCallback(() => {
    const exportData = filteredGestores.map(gestor => ({
      Nome: gestor.nome,
      Email: gestor.email,
      Telefone: gestor.telefone,
      'Unidade Responsável': gestor.unidadeResponsavel,
      'Data Admissão': new Date(gestor.dataAdmissao).toLocaleDateString('pt-BR'),
      Status: gestor.ativo ? 'Ativo' : 'Inativo'
    }));
    
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gestores.csv';
    link.click();
  }, [filteredGestores]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👨‍💼 Gestores das Unidades
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os gestores responsáveis por cada unidade
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingGestor(null);
            setShowModal(true);
          }}
          leftIcon={<Plus size={20} />}
        >
          Novo Gestor
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar por nome, email ou unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <select
              value={filters.unidade || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, unidade: e.target.value || undefined }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as unidades</option>
              <option value="Centro">Centro</option>
              <option value="Zona Sul">Zona Sul</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Barra">Barra</option>
            </select>
          </div>
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Apenas Ativos</option>
              <option value="inativo">Apenas Inativos</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={clearFilters} className="flex-1">
              Limpar
            </Button>
            <Button variant="secondary" onClick={exportData} className="flex-1">
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {gestores.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total de Gestores
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {gestores.filter(g => g.ativo).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Gestores Ativos
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {gestores.filter(g => !g.ativo).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Gestores Inativos
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {new Set(gestores.map(g => g.unidadeResponsavel)).size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Unidades com Gestor
          </div>
        </div>
      </div>

      {/* Tabela de Gestores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <EnhancedTable
          data={filteredGestores}
          columns={columns}
          loading={false}
          emptyMessage="Nenhum gestor encontrado"
        />
      </div>

      {/* Modal de Gestor */}
      <GestorModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGestor(null);
        }}
        onSave={handleSave}
        gestor={editingGestor}
        loading={loading}
        unidades={['Centro', 'Zona Sul', 'Zona Norte', 'Barra']}
      />
    </div>
  );
});

// 🆕 Modal de Gestor - Formulário para criar/editar gestores
const GestorModal = memo(({ isOpen, onClose, onSave, gestor, loading, unidades }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    unidadeResponsavel: '',
    senha: '123456' // Senha padrão
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (gestor) {
      setFormData({
        nome: gestor.nome || '',
        email: gestor.email || '',
        telefone: gestor.telefone || '',
        unidadeResponsavel: gestor.unidadeResponsavel || '',
        senha: gestor.senha || '123456'
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        unidadeResponsavel: '',
        senha: '123456'
      });
    }
    setErrors({});
  }, [gestor]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    if (!formData.unidadeResponsavel) {
      newErrors.unidadeResponsavel = 'Selecione uma unidade';
    }
    
    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  }, [formData, validateForm, onSave]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {gestor ? '✏️ Editar Gestor' : '➕ Novo Gestor'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.nome 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Digite o nome completo"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.email 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="gestor@boraporct.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Telefone *
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.telefone 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="(21) 99999-9999"
            />
            {errors.telefone && (
              <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Unidade Responsável *
            </label>
            <select
              value={formData.unidadeResponsavel}
              onChange={(e) => handleChange('unidadeResponsavel', e.target.value)}
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.unidadeResponsavel 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Selecione uma unidade</option>
              {unidades.map(unidade => (
                <option key={unidade} value={unidade}>
                  {unidade}
                </option>
              ))}
            </select>
            {errors.unidadeResponsavel && (
              <p className="text-red-500 text-sm mt-1">{errors.unidadeResponsavel}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Senha *
          </label>
          <input
            type="password"
            value={formData.senha}
            onChange={(e) => handleChange('senha', e.target.value)}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.senha 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Digite a senha"
          />
          {errors.senha && (
            <p className="text-red-500 text-sm mt-1">{errors.senha}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            A senha padrão é "123456", mas pode ser alterada aqui
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {gestor ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

// Modal de Professor
// Modal de Professor - VERSÃO MELHORADA COM SISTEMA DE PAGAMENTO
const ProfessorModal = memo(({ isOpen, onClose, onSave, professor, loading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    tipoPagamento: 'fixo', // 🆕 'fixo' ou 'variavel'
    valorFixo: 45, // 🆕 Valor fixo por aula
    valoresVariaveis: { // 🆕 Valores escalonados
      uma: 20,
      duas: 18,
      tres: 15
    },
    especialidades: [], // 🆕 Especialidades do professor
    experiencia: '', // 🆕 Anos de experiência
    observacoes: '', // 🆕 Observações adicionais
    ativo: true
  });
  const [errors, setErrors] = useState({});

  // Especialidades disponíveis
  const especialidadesDisponiveis = [
    'Futevôlei de Praia',
    'Técnicas de Defesa',
    'Técnicas de Ataque',
    'Condicionamento Físico',
    'Treinamento Iniciantes',
    'Treinamento Avançado',
    'Competições',
    'Fundamentos Básicos'
  ];

  useEffect(() => {
    if (professor) {
      setFormData({
        nome: professor.nome || '',
        email: professor.email || '',
        telefone: professor.telefone || '',
        senha: professor.senha || '',
        tipoPagamento: professor.tipoPagamento || 'fixo',
        valorFixo: professor.valorFixo || 45,
        valoresVariaveis: professor.valoresVariaveis || { uma: 20, duas: 18, tres: 15 },
        especialidades: professor.especialidades || [],
        experiencia: professor.experiencia || '',
        observacoes: professor.observacoes || '',
        ativo: professor.ativo !== undefined ? professor.ativo : true
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        tipoPagamento: 'fixo',
        valorFixo: 45,
        valoresVariaveis: { uma: 20, duas: 18, tres: 15 },
        especialidades: [],
        experiencia: '',
        observacoes: '',
        ativo: true
      });
    }
    setErrors({});
  }, [professor, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    if (!formData.senha.trim() && !professor) {
      newErrors.senha = 'Senha é obrigatória';
    }

    // 🆕 Validação do sistema de pagamento
    if (formData.tipoPagamento === 'fixo') {
      if (!formData.valorFixo || formData.valorFixo <= 0) {
        newErrors.valorFixo = 'Valor fixo deve ser maior que zero';
      }
    } else {
      if (!formData.valoresVariaveis.uma || formData.valoresVariaveis.uma <= 0) {
        newErrors.valorUma = 'Valor para 1 aula é obrigatório';
      }
      if (!formData.valoresVariaveis.duas || formData.valoresVariaveis.duas <= 0) {
        newErrors.valorDuas = 'Valor para 2 aulas é obrigatório';
      }
      if (!formData.valoresVariaveis.tres || formData.valoresVariaveis.tres <= 0) {
        newErrors.valorTres = 'Valor para 3+ aulas é obrigatório';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, professor]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
    }
  }, [formData, validateForm, onSave]);

  const toggleEspecialidade = useCallback((especialidade) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(especialidade)
        ? prev.especialidades.filter(e => e !== especialidade)
        : [...prev.especialidades, especialidade]
    }));
  }, []);

  // 🆕 Calcular exemplo de ganho
  const calcularExemploGanho = useCallback(() => {
    if (formData.tipoPagamento === 'fixo') {
      return {
        uma: formData.valorFixo * 1,
        duas: formData.valorFixo * 2,
        tres: formData.valorFixo * 3,
        quatro: formData.valorFixo * 4
      };
    } else {
      return {
        uma: formData.valoresVariaveis.uma * 1,
        duas: formData.valoresVariaveis.duas * 2,
        tres: formData.valoresVariaveis.tres * 3,
        quatro: formData.valoresVariaveis.tres * 4
      };
    }
  }, [formData]);

  const exemploGanho = calcularExemploGanho();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={professor ? 'Editar Professor' : 'Novo Professor'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🆕 Header com preview do professor */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.nome ? formData.nome.charAt(0).toUpperCase() : '👨‍🏫'}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {formData.nome || 'Novo Professor'}
              </h3>
              <p className="text-green-600 dark:text-green-400">
                {formData.tipoPagamento === 'fixo' 
                  ? `💰 Valor Fixo: R$ ${formData.valorFixo}/aula`
                  : `📊 Valor Variável: R$ ${formData.valoresVariaveis.uma} - R$ ${formData.valoresVariaveis.tres}/aula`
                }
              </p>
              {formData.especialidades.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.especialidades.slice(0, 3).map(esp => (
                    <span key={esp} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full">
                      {esp}
                    </span>
                  ))}
                  {formData.especialidades.length > 3 && (
                    <span className="text-xs text-gray-500">+{formData.especialidades.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações básicas */}
        <div>
          <h4 className="text-lg font-semibold mb-4">👤 Informações Pessoais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              required
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              error={errors.nome}
              placeholder="Digite o nome completo"
            />
            
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              error={errors.email}
              placeholder="email@exemplo.com"
            />

            <Input
              label="Telefone"
              required
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              error={errors.telefone}
              placeholder="(11) 99999-9999"
            />
            
            <Input
              label={professor ? "Nova Senha (deixe em branco para manter)" : "Senha"}
              type="password"
              required={!professor}
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              error={errors.senha}
              placeholder="Senha para login"
            />
          </div>
        </div>

        {/* 🆕 Sistema de Pagamento */}
        <div>
          <h4 className="text-lg font-semibold mb-4">💰 Sistema de Pagamento</h4>
          
          {/* Toggle Fixo/Variável */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.tipoPagamento === 'fixo'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="tipoPagamento"
                value="fixo"
                checked={formData.tipoPagamento === 'fixo'}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoPagamento: e.target.value }))}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400">💰 Valor Fixo</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mesmo valor por aula, independente da quantidade
                </div>
              </div>
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.tipoPagamento === 'variavel'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                name="tipoPagamento"
                value="variavel"
                checked={formData.tipoPagamento === 'variavel'}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoPagamento: e.target.value }))}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-green-600 dark:text-green-400">📊 Valor Variável</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Valor muda conforme quantidade de aulas por dia
                </div>
              </div>
            </label>
          </div>

          {/* Configuração de Valores */}
          {formData.tipoPagamento === 'fixo' ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">💰 Configuração Valor Fixo</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Valor por Aula (R$)"
                  type="number"
                  required
                  value={formData.valorFixo}
                  onChange={(e) => setFormData(prev => ({ ...prev, valorFixo: parseFloat(e.target.value) }))}
                  error={errors.valorFixo}
                  placeholder="45.00"
                  step="0.01"
                  min="0"
                />
                <div className="self-end">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">💡 Ganho por dia:</div>
                    <div className="space-y-1 text-sm">
                      <div>1 aula: <span className="font-medium text-blue-600">R$ {exemploGanho.uma.toFixed(2)}</span></div>
                      <div>2 aulas: <span className="font-medium text-blue-600">R$ {exemploGanho.duas.toFixed(2)}</span></div>
                      <div>3 aulas: <span className="font-medium text-blue-600">R$ {exemploGanho.tres.toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-4">📊 Configuração Valor Variável</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Valor para 1 aula/dia (R$)"
                    type="number"
                    required
                    value={formData.valoresVariaveis.uma}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valoresVariaveis: { ...prev.valoresVariaveis, uma: parseFloat(e.target.value) }
                    }))}
                    error={errors.valorUma}
                    placeholder="20.00"
                    step="0.01"
                    min="0"
                  />
                  
                  <Input
                    label="Valor para 2 aulas/dia (R$)"
                    type="number"
                    required
                    value={formData.valoresVariaveis.duas}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valoresVariaveis: { ...prev.valoresVariaveis, duas: parseFloat(e.target.value) }
                    }))}
                    error={errors.valorDuas}
                    placeholder="18.00"
                    step="0.01"
                    min="0"
                  />
                  
                  <Input
                    label="Valor para 3+ aulas/dia (R$)"
                    type="number"
                    required
                    value={formData.valoresVariaveis.tres}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valoresVariaveis: { ...prev.valoresVariaveis, tres: parseFloat(e.target.value) }
                    }))}
                    error={errors.valorTres}
                    placeholder="15.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">💡 Simulação de Ganhos:</div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">1 aula:</span>
                        <span className="font-medium text-green-600">R$ {exemploGanho.uma.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">2 aulas:</span>
                        <span className="font-medium text-green-600">R$ {exemploGanho.duas.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">3 aulas:</span>
                        <span className="font-medium text-green-600">R$ {exemploGanho.tres.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm">4 aulas:</span>
                        <span className="font-medium text-green-600">R$ {exemploGanho.quatro.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300">
                      💰 Incentivo: Mais aulas = maior ganho total!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🆕 Especialidades */}
        <div>
          <h4 className="text-lg font-semibold mb-4">🎯 Especialidades</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {especialidadesDisponiveis.map(especialidade => (
              <label
                key={especialidade}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${
                  formData.especialidades.includes(especialidade)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.especialidades.includes(especialidade)}
                  onChange={() => toggleEspecialidade(especialidade)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">{especialidade}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              📚 Experiência (anos)
            </label>
            <select
              value={formData.experiencia}
              onChange={(e) => setFormData(prev => ({ ...prev, experiencia: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione...</option>
              <option value="0-1">Menos de 1 ano</option>
              <option value="1-3">1 a 3 anos</option>
              <option value="3-5">3 a 5 anos</option>
              <option value="5-10">5 a 10 anos</option>
              <option value="10+">Mais de 10 anos</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm font-medium">✅ Professor ativo</span>
            </label>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            📝 Observações
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Observações sobre o professor, disponibilidade, etc..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {professor ? 'Atualizar' : 'Salvar'} Professor
          </Button>
        </div>
      </form>
    </Modal>
  );
});
// 🆕 Modal de Detalhes de Pagamento do Professor
const PagamentoProfessorModal = memo(({ isOpen, onClose, professor, presencas }) => {
  const [mesAno, setMesAno] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calcular dados de pagamento detalhados
  const dadosPagamento = useMemo(() => {
    if (!professor || !presencas) return null;

    const [ano, mes] = mesAno.split('-');
    const inicioMes = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    const fimMes = new Date(parseInt(ano), parseInt(mes), 0);

    // Filtrar presenças do professor no mês selecionado
    const presencasMes = presencas.filter(p => {
      const dataPresenca = new Date(p.data);
      return p.professorId === professor.id && 
             dataPresenca >= inicioMes && 
             dataPresenca <= fimMes;
    });

    // Agrupar por dia
    const aulasPorDia = presencasMes.reduce((acc, presenca) => {
      const dia = presenca.data;
      if (!acc[dia]) {
        acc[dia] = [];
      }
      acc[dia].push(presenca);
      return acc;
    }, {});

    // Calcular pagamento por dia
    const detalhamentoDaily = Object.entries(aulasPorDia).map(([dia, aulas]) => {
      const quantidadeAulas = aulas.length;
      let valorDia = 0;

      if (professor.tipoPagamento === 'fixo') {
        valorDia = quantidadeAulas * (professor.valorFixo || 45);
      } else {
        const valores = professor.valoresVariaveis || { uma: 20, duas: 18, tres: 15 };
        
        if (quantidadeAulas === 1) {
          valorDia = valores.uma * 1;
        } else if (quantidadeAulas === 2) {
          valorDia = valores.duas * 2;
        } else if (quantidadeAulas >= 3) {
          valorDia = valores.tres * quantidadeAulas;
        }
      }

      return {
        dia,
        quantidadeAulas,
        valorDia,
        aulas,
        valorPorAula: quantidadeAulas > 0 ? valorDia / quantidadeAulas : 0
      };
    }).sort((a, b) => new Date(a.dia) - new Date(b.dia));

    const totalAulas = detalhamentoDaily.reduce((acc, d) => acc + d.quantidadeAulas, 0);
    const totalPagamento = detalhamentoDaily.reduce((acc, d) => acc + d.valorDia, 0);
    const diasTrabalhados = detalhamentoDaily.length;
    const mediaDiariaAulas = diasTrabalhados > 0 ? totalAulas / diasTrabalhados : 0;
    const valorMedioPorAula = totalAulas > 0 ? totalPagamento / totalAulas : 0;

    return {
      detalhamentoDaily,
      totalAulas,
      totalPagamento,
      diasTrabalhados,
      mediaDiariaAulas,
      valorMedioPorAula
    };
  }, [professor, presencas, mesAno]);

  if (!professor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`💰 Pagamento - ${professor.nome}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header com informações do professor */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {professor.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {professor.nome}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{professor.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  professor.tipoPagamento === 'fixo'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                  {professor.tipoPagamento === 'fixo' ? '💰 Valor Fixo' : '📊 Valor Variável'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seletor de mês */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            📅 Selecionar Mês:
          </label>
          <input
            type="month"
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {dadosPagamento && (
          <>
            {/* Resumo do mês */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-600">{dadosPagamento.totalAulas}</div>
                <div className="text-sm text-blue-800 dark:text-blue-300">Total de Aulas</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600">{dadosPagamento.diasTrabalhados}</div>
                <div className="text-sm text-green-800 dark:text-green-300">Dias Trabalhados</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600">R$ {dadosPagamento.totalPagamento.toFixed(2)}</div>
                <div className="text-sm text-purple-800 dark:text-purple-300">Total a Receber</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="text-2xl font-bold text-orange-600">R$ {dadosPagamento.valorMedioPorAula.toFixed(2)}</div>
                <div className="text-sm text-orange-800 dark:text-orange-300">Valor Médio/Aula</div>
              </div>
            </div>

            {/* Sistema de pagamento detalhado */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h4 className="text-lg font-semibold mb-4">🔧 Sistema de Pagamento Configurado</h4>
              {professor.tipoPagamento === 'fixo' ? (
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      R$ {professor.valorFixo || 45}
                    </div>
                    <div className="text-blue-800 dark:text-blue-300">por aula (valor fixo)</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">R$ {professor.valoresVariaveis?.uma || 20}</div>
                    <div className="text-red-800 dark:text-red-300 text-sm">1 aula por dia</div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">R$ {professor.valoresVariaveis?.duas || 18}</div>
                    <div className="text-yellow-800 dark:text-yellow-300 text-sm">2 aulas por dia</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">R$ {professor.valoresVariaveis?.tres || 15}</div>
                    <div className="text-green-800 dark:text-green-300 text-sm">3+ aulas por dia</div>
                  </div>
                </div>
              )}
            </div>

            {/* Detalhamento por dia */}
            <div>
              <h4 className="text-lg font-semibold mb-4">📊 Detalhamento por Dia</h4>
              {dadosPagamento.detalhamentoDaily.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhuma aula ministrada neste mês
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {dadosPagamento.detalhamentoDaily.map(dia => (
                    <div key={dia.dia} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-100">
                            {new Date(dia.dia + 'T00:00:00').toLocaleDateString('pt-BR', { 
                              weekday: 'long', 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {dia.quantidadeAulas} aula{dia.quantidadeAulas > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            R$ {dia.valorDia.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            R$ {dia.valorPorAula.toFixed(2)}/aula
                          </div>
                        </div>
                      </div>
                      
                      {/* Lista de aulas do dia */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
                        {dia.aulas.map((aula, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded text-xs text-center">
                            {aula.horario}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="secondary"
                leftIcon={<Download size={16} />}
                onClick={() => {
                  // Implementar export do relatório
                  const exportData = dadosPagamento.detalhamentoDaily.map(dia => ({
                    Data: new Date(dia.dia + 'T00:00:00').toLocaleDateString('pt-BR'),
                    'Aulas': dia.quantidadeAulas,
                    'Valor do Dia': `R$ ${dia.valorDia.toFixed(2)}`,
                    'Valor por Aula': `R$ ${dia.valorPorAula.toFixed(2)}`
                  }));
                  exportToCSV(exportData, `pagamento-${professor.nome}-${mesAno}`);
                }}
              >
                Exportar Relatório
              </Button>
              
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
});
// Modal de Unidade
const UnidadeModal = memo(({ isOpen, onClose, onSave, unidade, loading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    responsavel: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (unidade) {
      setFormData({
        nome: unidade.nome || '',
        endereco: unidade.endereco || '',
        telefone: unidade.telefone || '',
        email: unidade.email || '',
        responsavel: unidade.responsavel || ''
      });
    } else {
      setFormData({
        nome: '',
        endereco: '',
        telefone: '',
        email: '',
        responsavel: ''
      });
    }
    setErrors({});
  }, [unidade, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
    }
  }, [formData, validateForm, onSave]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={unidade ? 'Editar Unidade' : 'Nova Unidade'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome da Unidade"
          required
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          error={errors.nome}
          placeholder="Ex: CT Copacabana"
        />

        <Input
          label="Endereço"
          required
          value={formData.endereco}
          onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
          error={errors.endereco}
          placeholder="Endereço completo"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Telefone"
            value={formData.telefone}
            onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
            placeholder="(21) 99999-9999"
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            placeholder="contato@unidade.com"
          />
        </div>

        <Input
          label="Responsável"
          value={formData.responsavel}
          onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
          placeholder="Nome do responsável"
        />

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {unidade ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

// Página de Unidades
const UnidadesPage = memo(() => {
  const { unidades, setUnidades } = useAppState();
  const { addNotification } = useNotifications();
  
  const [showModal, setShowModal] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = useCallback((unidade) => {
    setEditingUnidade(unidade);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((unidadeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      setUnidades(prev => prev.filter(u => u.id !== unidadeId));
      addNotification({
        type: 'success',
        title: 'Unidade excluída',
        message: 'Unidade removida com sucesso'
      });
    }
  }, [setUnidades, addNotification]);

  const handleSave = useCallback(async (unidadeData) => {
    setLoading(true);
    try {
      if (editingUnidade) {
        setUnidades(prev => prev.map(u => 
          u.id === editingUnidade.id ? { ...u, ...unidadeData } : u
        ));
        addNotification({
          type: 'success',
          title: 'Unidade atualizada',
          message: 'Dados atualizados com sucesso'
        });
      } else {
        const novaUnidade = {
          id: Date.now(),
          ...unidadeData,
          ativo: true
        };
        setUnidades(prev => [...prev, novaUnidade]);
        addNotification({
          type: 'success',
          title: 'Unidade cadastrada',
          message: 'Nova unidade adicionada com sucesso'
        });
      }
      setShowModal(false);
      setEditingUnidade(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar dados da unidade'
      });
    } finally {
      setLoading(false);
    }
  }, [editingUnidade, setUnidades, addNotification]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Unidades</h2>
        <Button
          onClick={() => {
            setEditingUnidade(null);
            setShowModal(true);
          }}
          leftIcon={<Plus size={20} />}
        >
          Nova Unidade
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unidades.map(unidade => (
          <div key={unidade.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{unidade.nome}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(unidade)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(unidade.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="mr-2" size={16} />
                {unidade.endereco}
              </p>
              {unidade.telefone && (
                <p className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="mr-2" size={16} />
                  {unidade.telefone}
                </p>
              )}
              {unidade.email && (
                <p className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="mr-2" size={16} />
                  {unidade.email}
                </p>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  unidade.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {unidade.ativo ? 'Ativa' : 'Inativa'}
                </span>
                <span className="text-xs text-gray-500">
                  Resp: {unidade.responsavel || 'Não definido'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <UnidadeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUnidade(null);
        }}
        onSave={handleSave}
        unidade={editingUnidade}
        loading={loading}
      />
    </div>
  );
});

// Página de Configuração de Horários
const HorariosPage = memo(() => {
  const { unidades, horariosConfiguracao, setHorariosConfiguracao, professores } = useAppState();
  const { addNotification } = useNotifications();
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades.length > 0 ? unidades[0].id : 1);

  const diasDaSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const diasNomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const adicionarHorario = useCallback((dia) => {
    const novoHorario = {
      id: Date.now(),
      horario: '17:00',
      professorId: professores[0]?.id || 1,
      professor: professores[0]?.nome || '',
      maxAlunos: 8,
      ativo: true
    };
    
    setHorariosConfiguracao(prev => ({
      ...prev,
      [unidadeSelecionada]: {
        ...prev[unidadeSelecionada],
        [dia]: [...(prev[unidadeSelecionada]?.[dia] || []), novoHorario]
      }
    }));

    addNotification({
      type: 'success',
      title: 'Horário adicionado',
      message: 'Novo horário configurado com sucesso'
    });
  }, [setHorariosConfiguracao, unidadeSelecionada, professores, addNotification]);

  const removerHorario = useCallback((dia, horarioId) => {
    setHorariosConfiguracao(prev => ({
      ...prev,
      [unidadeSelecionada]: {
        ...prev[unidadeSelecionada],
        [dia]: prev[unidadeSelecionada]?.[dia]?.filter(h => h.id !== horarioId) || []
      }
    }));

    addNotification({
      type: 'success',
      title: 'Horário removido',
      message: 'Horário excluído com sucesso'
    });
  }, [setHorariosConfiguracao, unidadeSelecionada, addNotification]);

  const atualizarHorario = useCallback((dia, horarioId, campo, valor) => {
    setHorariosConfiguracao(prev => ({
      ...prev,
      [unidadeSelecionada]: {
        ...prev[unidadeSelecionada],
        [dia]: prev[unidadeSelecionada]?.[dia]?.map(h => 
          h.id === horarioId ? { ...h, [campo]: valor } : h
        ) || []
      }
    }));
  }, [setHorariosConfiguracao, unidadeSelecionada]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Configuração de Horários</h2>
        <div className="flex flex-wrap gap-2">
          {unidades.map(unidade => (
            <button
              key={unidade.id}
              onClick={() => setUnidadeSelecionada(unidade.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                unidadeSelecionada === unidade.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {unidade.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {diasDaSemana.map((dia, index) => (
          <div key={dia} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{diasNomes[index]}</h3>
              <Button
                size="sm"
                onClick={() => adicionarHorario(dia)}
                leftIcon={<Plus size={16} />}
              >
                Horário
              </Button>
            </div>

            <div className="space-y-3">
              {(horariosConfiguracao[unidadeSelecionada]?.[dia] || []).map(horario => (
                <div key={horario.id} className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/50">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      type="time"
                      value={horario.horario}
                      onChange={(e) => atualizarHorario(dia, horario.id, 'horario', e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      value={horario.maxAlunos}
                      onChange={(e) => atualizarHorario(dia, horario.id, 'maxAlunos', parseInt(e.target.value))}
                      placeholder="Max alunos"
                      className="text-sm"
                      min="1"
                      max="20"
                    />
                  </div>
                  
                  <select
                    value={horario.professorId}
                    onChange={(e) => {
                      const profId = parseInt(e.target.value);
                      const prof = professores.find(p => p.id === profId);
                      atualizarHorario(dia, horario.id, 'professorId', profId);
                      atualizarHorario(dia, horario.id, 'professor', prof?.nome || '');
                    }}
                    className="w-full p-2 border rounded text-sm mb-2 bg-white dark:bg-gray-600 dark:border-gray-500"
                  >
                    {professores.map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.nome}</option>
                    ))}
                  </select>

                  <div className="flex justify-between items-center">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={horario.ativo}
                        onChange={(e) => atualizarHorario(dia, horario.id, 'ativo', e.target.checked)}
                        className="mr-2"
                      />
                      Ativo
                    </label>
                    <button
                      onClick={() => removerHorario(dia, horario.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Página de Controle de Presença
const PresencaPage = memo(() => {
  const { alunos, unidades, horariosConfiguracao, presencas, setPresencas } = useAppState();
  const { addNotification } = useNotifications();
  
  const [dataAtual, setDataAtual] = useState(new Date().toISOString().split('T')[0]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades.length > 0 ? unidades[0].id : 1);
  const [presencasDiarias, setPresencasDiarias] = useState({});

  const getDiaDaSemana = useCallback((data) => {
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dataObj = new Date(data + 'T00:00:00');
    return diasSemana[dataObj.getDay()];
  }, []);

  const horariosDisponiveis = useMemo(() => {
    const diaSemana = getDiaDaSemana(dataAtual);
    const horariosConfig = horariosConfiguracao[unidadeSelecionada]?.[diaSemana] || [];
    return horariosConfig.filter(h => h.ativo);
  }, [dataAtual, unidadeSelecionada, horariosConfiguracao, getDiaDaSemana]);

  const marcarPresenca = useCallback((horarioId, alunoId, presente) => {
    const chave = `${dataAtual}_${horarioId}_${alunoId}`;
    setPresencasDiarias(prev => ({
      ...prev,
      [chave]: presente
    }));

    if (presente) {
      const novaPresenca = {
        id: Date.now(),
        alunoId,
        data: dataAtual,
        horario: horariosDisponiveis.find(h => h.id === horarioId)?.horario,
        professor: horariosDisponiveis.find(h => h.id === horarioId)?.professor,
        status: 'presente'
      };
      setPresencas(prev => [...prev, novaPresenca]);
    }

    addNotification({
      type: 'success',
      title: presente ? 'Presença confirmada' : 'Presença removida',
      message: `Presença ${presente ? 'marcada' : 'desmarcada'} com sucesso`
    });
  }, [dataAtual, horariosDisponiveis, setPresencas, setPresencasDiarias, addNotification]);

  const getPresencasHorario = useCallback((horarioId) => {
    return alunos.map(aluno => {
      const chave = `${dataAtual}_${horarioId}_${aluno.id}`;
      return {
        ...aluno,
        presente: presencasDiarias[chave] || false
      };
    });
  }, [alunos, dataAtual, presencasDiarias]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Lista de Presença</h2>
          <div className="flex gap-4">
            <Input
              type="date"
              value={dataAtual}
              onChange={(e) => setDataAtual(e.target.value)}
              className="w-auto"
            />
            <select
              value={unidadeSelecionada}
              onChange={(e) => setUnidadeSelecionada(parseInt(e.target.value))}
              className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            📅 {new Date(dataAtual + 'T00:00:00').toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {horariosDisponiveis.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Nenhum horário configurado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Não há horários configurados para este dia nesta unidade.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {horariosDisponiveis.map(horario => {
            const alunosPresenca = getPresencasHorario(horario.id);
           const isSemLimitePresenca = horario.maxAlunos === null || horario.semLimite === true;
const totalPresentes = alunosPresenca.filter(a => a.presente).length;
            
            return (
              <div key={horario.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Clock className="mr-2" size={20} />
                      {horario.horario}
                    </h3>
             <p className="text-sm text-gray-600 dark:text-gray-300">
  {isSemLimitePresenca ? '🚀 Aula sem limite de alunos' : `Máximo: ${horario.maxAlunos} alunos`}
</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
  {totalPresentes}/{isSemLimitePresenca ? '∞' : horario.maxAlunos}
</div>
<div className="text-sm text-gray-500">
  {isSemLimitePresenca ? '🚀 Aula sem limite' : 'Presentes'}
</div>
                    
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alunosPresenca.map(aluno => (
                    <div 
                      key={aluno.id} 
                      className={`p-3 rounded-lg border-2 transition-all ${
                        aluno.presente 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{aluno.nome}</p>
                          <p className="text-xs text-gray-500">{aluno.email}</p>
                        </div>
                        <button
                          onClick={() => marcarPresenca(horario.id, aluno.id, !aluno.presente)}
                          className={`p-2 rounded-full transition-colors ${
                            aluno.presente
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                        >
                          {aluno.presente ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

               {(!isSemLimitePresenca && totalPresentes >= horario.maxAlunos) && (
  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
    <p className="text-orange-800 dark:text-orange-200 text-sm font-medium">
      ⚠️ Horário lotado! Capacidade máxima atingida.
    </p>
  </div>
)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// Página de Aulas (Check-in para Alunos)
const AulasPage = memo(() => {
  const { tipoUsuario, userLogado, alunos, unidades, horariosConfiguracao } = useAppState();
  const { addNotification } = useNotifications();
  
  const [dataAtual] = useState(new Date().toISOString().split('T')[0]);
  const [checkinAlunos, setCheckinAlunos] = useState({});

  const getDiaDaSemana = useCallback((data) => {
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dataObj = new Date(data + 'T00:00:00');
    return diasSemana[dataObj.getDay()];
  }, []);

  const horariosHoje = useMemo(() => {
    const diaSemana = getDiaDaSemana(dataAtual);
    const todosHorarios = [];
    
    unidades.forEach(unidade => {
      const horariosUnidade = horariosConfiguracao[unidade.id]?.[diaSemana] || [];
      horariosUnidade.forEach(horario => {
        if (horario.ativo) {
          todosHorarios.push({
            ...horario,
            unidade: unidade.nome,
            unidadeId: unidade.id
          });
        }
      });
    });
    
    return todosHorarios.sort((a, b) => a.horario.localeCompare(b.horario));
  }, [dataAtual, unidades, horariosConfiguracao, getDiaDaSemana]);

  const fazerCheckIn = useCallback((horarioId, unidadeId) => {
    const chave = `${dataAtual}_${horarioId}`;
    const jaFezCheckIn = checkinAlunos[chave];
    
    if (jaFezCheckIn) {
      setCheckinAlunos(prev => {
        const newState = { ...prev };
        delete newState[chave];
        return newState;
      });
      addNotification({
        type: 'success',
        title: 'Check-in cancelado',
        message: 'Presença cancelada com sucesso'
      });
    } else {
      setCheckinAlunos(prev => ({
        ...prev,
        [chave]: {
          horarioId,
          unidadeId,
          timestamp: new Date().toISOString()
        }
      }));
      addNotification({
        type: 'success',
        title: 'Check-in realizado',
        message: 'Presença confirmada com sucesso'
      });
    }
  }, [dataAtual, checkinAlunos, setCheckinAlunos, addNotification]);

  const getStatusHorario = useCallback((horarioId) => {
    const chave = `${dataAtual}_${horarioId}`;
    return checkinAlunos[chave] ? 'confirmado' : 'disponivel';
  }, [dataAtual, checkinAlunos]);

  const isHorarioPassado = useCallback((horario) => {
    const agora = new Date();
    const [hora, minuto] = horario.split(':');
    const horarioData = new Date();
    horarioData.setHours(parseInt(hora), parseInt(minuto), 0, 0);
    
    return agora > horarioData;
  }, []);

  if (tipoUsuario !== 'aluno') {
    return <PresencaPage />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Check-in para Aulas</h2>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            📅 Hoje - {new Date(dataAtual + 'T00:00:00').toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {horariosHoje.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Nenhuma aula hoje
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Não há aulas programadas para hoje. Volte amanhã!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {horariosHoje.map(horario => {
            const status = getStatusHorario(horario.id);
            const passou = isHorarioPassado(horario.horario);
            
            return (
              <div 
                key={`${horario.unidadeId}_${horario.id}`}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 transition-all ${
                  status === 'confirmado' ? 'ring-2 ring-green-500' : ''
                } ${passou ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                 <div className="text-2xl font-bold text-blue-600">
  {horario.horario}
  {/* 🆕 Badge para aulas sem limite */}
  {(horario.maxAlunos === null || horario.semLimite === true) && (
    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
      🚀 Sem Limite
    </span>
  )}
</div>
                  {status === 'confirmado' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle size={20} className="mr-1" />
                      <span className="text-sm font-medium">Confirmado</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="mr-2" size={16} />
                    {horario.unidade}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <User className="mr-2" size={16} />
                    Prof. {horario.professor}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
  <Users className="mr-2" size={16} />
  {/* 🔧 CORREÇÃO: Verificar se é sem limite */}
  {(horario.maxAlunos === null || horario.semLimite === true) 
    ? '🚀 Aula sem limite de alunos' 
    : `Máximo ${horario.maxAlunos} alunos`
  }
</div>
                </div>
{/* 🆕 NOVA: Status de disponibilidade */}
<div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
  <Circle className="mr-2" size={16} />
  <span className={`font-medium ${
    (horario.maxAlunos === null || horario.semLimite === true) ? 'text-blue-600' : 'text-green-600'
  }`}>
    {(horario.maxAlunos === null || horario.semLimite === true) 
      ? 'Sempre disponível' 
      : 'Disponível para agendamento'
    }
  </span>
</div>
                <Button
                  onClick={() => fazerCheckIn(horario.id, horario.unidadeId)}
                  disabled={passou}
                  variant={passou ? 'secondary' : status === 'confirmado' ? 'danger' : 'success'}
                  className="w-full"
                >
                  {passou 
                    ? 'Horário passou'
                    : status === 'confirmado' 
                      ? 'Cancelar Presença' 
                      : 'Confirmar Presença'
                  }
                </Button>

                {status === 'confirmado' && (
  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
    <p className="text-xs text-green-700 dark:text-green-300">
      ✅ Você confirmou presença para este horário
      {/* 🆕 Informação extra para aulas sem limite */}
      {(horario.maxAlunos === null || horario.semLimite === true) && (
        <span className="block mt-1 text-blue-600">
          🚀 Esta é uma aula sem limite de participantes
        </span>
      )}
    </p>
  </div>
)}
              </div>
            );
          })}
        </div>
      )}

      {/* Resumo dos check-ins */}
      {Object.keys(checkinAlunos).length > 0 && (
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
            📋 Suas Confirmações de Hoje
          </h3>
          <div className="space-y-2">
            {Object.entries(checkinAlunos).map(([chave, checkin]) => {
              const horarioInfo = horariosHoje.find(h => h.id === checkin.horarioId);
              return (
                <div key={chave} className="flex items-center justify-between text-sm">
                  <span className="text-green-700 dark:text-green-300">
                    {horarioInfo?.horario} - {horarioInfo?.unidade}
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Confirmado
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
// 🆕 NOVA PÁGINA: Agendamentos para Admin
const AgendamentosPage = memo(() => {
  const { alunos, unidades, horariosConfiguracao, presencas } = useAppState();
  const { addNotification } = useNotifications();
  
  const [dataAtual, setDataAtual] = useState(new Date().toISOString().split('T')[0]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades.length > 0 ? unidades[0].id : 1);

  const getDiaDaSemana = useCallback((data) => {
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dataObj = new Date(data + 'T00:00:00');
    return diasSemana[dataObj.getDay()];
  }, []);

  const horariosDisponiveis = useMemo(() => {
    const diaSemana = getDiaDaSemana(dataAtual);
    const horariosConfig = horariosConfiguracao[unidadeSelecionada]?.[diaSemana] || [];
    return horariosConfig.filter(h => h.ativo);
  }, [dataAtual, unidadeSelecionada, horariosConfiguracao, getDiaDaSemana]);

  const getAgendamentosHorario = useCallback((horarioId) => {
    return presencas.filter(p => 
      p.data === dataAtual && 
      p.horario === horariosDisponiveis.find(h => h.id === horarioId)?.horario
    );
  }, [presencas, dataAtual, horariosDisponiveis]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold">📅 Gerenciar Agendamentos</h2>
          <div className="flex gap-4">
            <Input
              type="date"
              value={dataAtual}
              onChange={(e) => setDataAtual(e.target.value)}
              className="w-auto"
            />
            <select
              value={unidadeSelecionada}
              onChange={(e) => setUnidadeSelecionada(parseInt(e.target.value))}
              className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            📅 Visualizando agendamentos para {new Date(dataAtual + 'T00:00:00').toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Lista de Horários */}
      {horariosDisponiveis.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Nenhum horário configurado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Não há horários configurados para este dia nesta unidade.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {horariosDisponiveis.map(horario => {
            const agendamentos = getAgendamentosHorario(horario.id);
          const isSemLimite = horario.maxAlunos === null || horario.semLimite === true;
const vagas = isSemLimite ? Infinity : (horario.maxAlunos - agendamentos.length);
            
            return (
              <div key={horario.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
                {/* Header do horário */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Clock className="mr-2" size={20} />
                      {horario.horario}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Professor: {horario.professor || 'A definir'}
                    </p>
                  </div>
                  <div className="text-right">
                   <div className={`text-2xl font-bold ${isSemLimite ? 'text-blue-600' : vagas > 0 ? 'text-green-600' : 'text-red-600'}`}>
  {agendamentos.length}/{isSemLimite ? '∞' : horario.maxAlunos}
</div>
<div className="text-sm text-gray-500">
  {isSemLimite ? '🚀 Sem limite de alunos' : vagas > 0 ? `${vagas} vagas disponíveis` : 'Lotado'}
</div>
                  </div>
                </div>

                {/* Lista de agendamentos */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    👥 Alunos Agendados ({agendamentos.length})
                  </h4>
                  
                  {agendamentos.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">
                        Nenhum aluno agendado para este horário
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {agendamentos.map((agendamento, index) => {
                        const aluno = alunos.find(a => a.id === agendamento.alunoId);
                        return (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
                          >
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-300">
                                {aluno?.nome || 'Aluno não encontrado'}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {agendamento.status === 'agendada' ? '📅 Agendado' : '✅ Presente'}
                              </p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <User className="text-green-600 dark:text-green-400" size={16} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Estatísticas do horário */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-3 gap-4 text-center">
  <div>
    <div className="text-lg font-bold text-blue-600">{agendamentos.length}</div>
    <div className="text-xs text-gray-500">Agendados</div>
  </div>
  <div>
    <div className="text-lg font-bold text-green-600">
      {isSemLimite ? '∞' : vagas}
    </div>
    <div className="text-xs text-gray-500">
      {isSemLimite ? 'Ilimitado' : 'Vagas Livres'}
    </div>
  </div>
  <div>
    <div className="text-lg font-bold text-purple-600">
      {isSemLimite ? '∞' : Math.round((agendamentos.length / horario.maxAlunos) * 100)}%
    </div>
    <div className="text-xs text-gray-500">
      {isSemLimite ? 'Sem limite' : 'Ocupação'}
    </div>
  </div>
</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
// Página de Financeiro
const FinanceiroPage = memo(() => {
  const { financeiro, setFinanceiro, tipoUsuario, userLogado, planos } = useAppState();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrar dados baseado no tipo de usuário
  const dadosFinanceiros = useMemo(() => {
    if (tipoUsuario === 'aluno') {
      return financeiro.filter(f => f.alunoId === userLogado?.id);
    }
    if (tipoUsuario === 'professor') {
      return financeiro.filter(f => f.professorId === userLogado?.id);
    }
    return financeiro;
  }, [financeiro, tipoUsuario, userLogado]);

  const filteredTransacoes = useAdvancedFilter(dadosFinanceiros, { 
    ...filters,
    descricao: searchTerm,
    aluno: searchTerm 
  });

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const transacoesDoMes = filteredTransacoes.filter(t => {
      const transacaoDate = new Date(t.data);
      return transacaoDate.getMonth() === currentMonth && transacaoDate.getFullYear() === currentYear;
    });

    const receitaTotal = transacoesDoMes
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesaTotal = transacoesDoMes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0);
      
    const pendentes = transacoesDoMes
      .filter(t => t.status === 'pendente')
      .reduce((acc, t) => acc + t.valor, 0);

    const lucroLiquido = receitaTotal - despesaTotal;

    return { receitaTotal, despesaTotal, pendentes, lucroLiquido };
  }, [filteredTransacoes]);

  const colunas = useMemo(() => [
    {
      key: 'data',
      label: 'Data',
      render: (transacao) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {new Date(transacao.data).toLocaleDateString('pt-BR')}
        </div>
      )
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (transacao) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {transacao.descricao}
          </div>
          {transacao.aluno && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {transacao.aluno}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (transacao) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          transacao.tipo === 'receita' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {transacao.tipo}
        </span>
      )
    },
    {
      key: 'valor',
      label: 'Valor',
      render: (transacao) => (
        <div className={`text-sm font-semibold ${
          transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transacao.tipo === 'despesa' && '- '}R$ {transacao.valor.toFixed(2)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (transacao) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          transacao.status === 'pago' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {transacao.status}
        </span>
      )
    }
  ], []);

  const handleSave = useCallback(async (transacaoData) => {
    setLoading(true);
    try {
      if (editingTransacao) {
        setFinanceiro(prev => prev.map(t => 
          t.id === editingTransacao.id ? { ...t, ...transacaoData } : t
        ));
        addNotification({
          type: 'success',
          title: 'Transação atualizada',
          message: 'Dados atualizados com sucesso'
        });
      } else {
        const novaTransacao = {
          id: Date.now(),
          ...transacaoData,
          data: new Date().toISOString().split('T')[0]
        };
        setFinanceiro(prev => [...prev, novaTransacao]);
        addNotification({
          type: 'success',
          title: 'Transação criada',
          message: 'Nova transação adicionada com sucesso'
        });
      }
      setShowModal(false);
      setEditingTransacao(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar transação'
      });
    } finally {
      setLoading(false);
    }
  }, [editingTransacao, setFinanceiro, addNotification]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const exportData = useCallback(() => {
    const exportData = filteredTransacoes.map(transacao => ({
      Data: transacao.data,
      Descrição: transacao.descricao,
      Tipo: transacao.tipo,
      Valor: transacao.valor,
      Status: transacao.status,
      Método: transacao.metodo || '',
      Aluno: transacao.aluno || ''
    }));
    exportToCSV(exportData, 'transacoes-financeiras');
  }, [filteredTransacoes]);

  // Interface específica para aluno
  if (tipoUsuario === 'aluno') {
    const planoDoAluno = planos.find(p => p.id === userLogado.planoId);
    const meusPagamentos = filteredTransacoes;
    const valorPago = meusPagamentos.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0);
    const valorPendente = meusPagamentos.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.valor, 0);
    const proximoVencimento = meusPagamentos.find(p => p.status === 'pendente');

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard 
            title="Total Pago" 
            value={`R$ ${valorPago.toFixed(2)}`} 
            icon={CheckCircle} 
            color="text-green-600" 
            subtitle="Histórico"
          />
          <StatsCard 
            title="Valor Pendente" 
            value={`R$ ${valorPendente.toFixed(2)}`} 
            icon={Clock} 
            color="text-red-600" 
            subtitle={proximoVencimento ? `Vence: ${proximoVencimento.data}` : 'Nenhum pendente'}
          />
          <StatsCard 
            title="Mensalidade" 
            value={`R$ ${planoDoAluno?.preco.toFixed(2)}`} 
            icon={CreditCard} 
            color="text-blue-600" 
            subtitle={planoDoAluno?.nome}
          />
        </div>

        {proximoVencimento && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-3" size={24} />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300">Mensalidade Pendente</h4>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  A sua mensalidade de R$ {proximoVencimento.valor.toFixed(2)} vence em {proximoVencimento.data}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <DataTable
            data={meusPagamentos}
            columns={colunas}
            loading={loading}
            emptyMessage="Nenhuma transação encontrada"
            itemsPerPage={10}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar transações..."
          filters={filters}
          onFiltersChange={setFilters}
          clearFilters={clearFilters}
          exportData={exportData}
        />
        
        {tipoUsuario === 'admin' && (
          <Button
            onClick={() => {
              setEditingTransacao(null);
              setShowModal(true);
            }}
            leftIcon={<Plus size={20} />}
          >
            Nova Transação
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Receita Total" 
          value={`R$ ${stats.receitaTotal.toFixed(2)}`} 
          icon={ArrowUpRight} 
          color="text-green-600" 
        />
        <StatsCard 
          title="Despesas" 
          value={`R$ ${stats.despesaTotal.toFixed(2)}`} 
          icon={ArrowDownLeft} 
          color="text-red-600" 
        />
        <StatsCard 
          title="Pendentes" 
          value={`R$ ${stats.pendentes.toFixed(2)}`} 
          icon={Clock} 
          color="text-yellow-600" 
        />
        <StatsCard 
          title="Lucro Líquido" 
          value={`R$ ${stats.lucroLiquido.toFixed(2)}`} 
          icon={DollarSign} 
          color={stats.lucroLiquido >= 0 ? "text-blue-600" : "text-red-600"} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <DataTable
          data={filteredTransacoes}
          columns={colunas}
          loading={loading}
          emptyMessage="Nenhuma transação encontrada"
          itemsPerPage={15}
        />
      </div>
    </div>
  );
});


// Prancheta Tática - VERSÃO INTEGRADA E CONTROLADA
const PranchetaTaticaAvancada = memo(({ pranchetaItems, onPranchetaChange, onSavePlay }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#2563eb');
  const [brushSize, setBrushSize] = useState(3);
  const [selectedTheme, setSelectedTheme] = useState('beach');
  
  // Estados para ferramenta de texto
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(16);
  const [textStyle, setTextStyle] = useState('normal');

  // Estados para movimentação de itens
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // O estado dos itens (pranchetaItems) agora é controlado pelo componente pai (TreinosPage)
  // e recebido via props. A função onPranchetaChange notifica o pai sobre as mudanças.

  const courtThemes = {
    beach: { sand: '#E8B563', lines: '#1e40af', net: '#F5DEB3', name: '🏖️ Praia' },
    night: { sand: '#8B7355', lines: '#FFD700', net: '#FFFFFF', name: '🌙 Noturno' },
    sunset: { sand: '#D2691E', lines: '#FF4500', net: '#FFA500', name: '🌅 Pôr do Sol' },
    professional: { sand: '#F4E4BC', lines: '#000080', net: '#E6E6FA', name: '🏆 Profissional' }
  };

  const tools = [
    { id: 'select', icon: Users, name: 'Selecionar', desc: '🔄 Mover itens existentes' },
    { id: 'pen', icon: Edit3, name: 'Desenho Livre', desc: 'Desenhe livremente' },
    { id: 'arrow', icon: TrendingUp, name: 'Seta', desc: 'Setas de movimento' },
    { id: 'player1', icon: User, name: 'Time Azul', desc: 'Jogadores do time azul' },
    { id: 'player2', icon: Users, name: 'Time Vermelho', desc: 'Jogadores do time vermelho' },
    { id: 'ball', icon: Circle, name: 'Bola', desc: 'Bola de futevôlei' },
    { id: 'text', icon: Edit, name: 'Texto', desc: 'Adicionar texto personalizado' },
    { id: 'block', icon: Plus, name: 'Bloqueio', desc: 'Marcação de bloqueio' }
  ];

  // Função para desenhar a quadra base
  const drawCourt = useCallback((ctx) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const theme = courtThemes[selectedTheme];
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.sand;
    ctx.fillRect(0, 0, width, height);
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.lines;
    const courtMargin = 50;
    const courtWidth = width - (courtMargin * 2);
    const courtHeight = height - (courtMargin * 2);
    
    ctx.strokeRect(courtMargin, courtMargin, courtWidth, courtHeight);
    const centerY = courtMargin + (courtHeight / 2);
    ctx.beginPath();
    ctx.moveTo(courtMargin, centerY);
    ctx.lineTo(courtMargin + courtWidth, centerY);
    ctx.stroke();
  }, [selectedTheme]);

  // Função para desenhar um item individual (jogador, bola, etc.)
  const drawItemOnCanvas = useCallback((ctx, item) => {
    // As implementações de drawPlayer, drawBall, etc. permanecem as mesmas
    // ... (vamos assumir que elas existem aqui para economizar espaço)
    const drawPlayer = (ctx, x, y, playerColor, number) => {
      ctx.fillStyle = playerColor;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(number, x, y + 6);
    };

    const drawBall = (ctx, x, y) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    const drawArrow = (ctx, fromX, fromY, toX, toY, arrowColor) => {
        const headlen = 15;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        ctx.strokeStyle = arrowColor;
        ctx.lineWidth = brushSize;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

     const drawText = (ctx, text, x, y, color, size, style) => {
        let fontWeight = 'normal';
        let fontStyle = 'normal';
        if (style === 'bold') fontWeight = 'bold';
        if (style === 'italic') fontStyle = 'italic';

        ctx.font = `${fontStyle} ${fontWeight} ${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    };

    const drawBlock = (ctx, x, y) => {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 15);
        ctx.lineTo(x + 15, y + 15);
        ctx.moveTo(x + 15, y - 15);
        ctx.lineTo(x - 15, y + 15);
        ctx.stroke();
    };

    switch (item.type) {
      case 'player1': drawPlayer(ctx, item.x, item.y, '#3b82f6', '1'); break;
      case 'player2': drawPlayer(ctx, item.x, item.y, '#ef4444', '2'); break;
      case 'ball': drawBall(ctx, item.x, item.y); break;
      case 'block': drawBlock(ctx, item.x, item.y); break;
      case 'text': drawText(ctx, item.text, item.x, item.y, item.color, item.fontSize, item.style); break;
      case 'arrow': drawArrow(ctx, item.fromX, item.fromY, item.toX, item.toY, item.color); break;
      // Adicionar caso para 'pen' se necessário (desenho livre salvo)
    }
  }, [brushSize]);
  
  // Redesenha a quadra e todos os itens recebidos via props
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    drawCourt(ctx);
    
    (pranchetaItems || []).forEach(item => {
      drawItemOnCanvas(ctx, item);
      if (selectedItem && selectedItem.id === item.id) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        if(item.type === 'text') {
            const textMetrics = ctx.measureText(item.text);
            ctx.strokeRect(item.x - textMetrics.width / 2 - 5, item.y - item.fontSize / 2 - 5, textMetrics.width + 10, item.fontSize + 10);
        } else {
            ctx.strokeRect(item.x - 25, item.y - 25, 50, 50);
        }
        ctx.setLineDash([]);
      }
    });
  }, [drawCourt, drawItemOnCanvas, pranchetaItems, selectedItem]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    setIsSelectMode(tool === 'select');
    if (tool !== 'select') {
      setSelectedItem(null);
    }
  }, [tool]);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const findItemAtPosition = useCallback((x, y) => {
    if (!pranchetaItems) return null;
    for (let i = pranchetaItems.length - 1; i >= 0; i--) {
      const item = pranchetaItems[i];
      const distance = Math.sqrt((item.x - x) ** 2 + (item.y - y) ** 2);
      if (distance < 25) { // Raio de clique
        return item;
      }
    }
    return null;
  }, [pranchetaItems]);

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    
    if (isSelectMode) {
      const clickedItem = findItemAtPosition(pos.x, pos.y);
      if (clickedItem) {
        setSelectedItem(clickedItem);
        setIsDragging(true);
        setDragOffset({ x: pos.x - clickedItem.x, y: pos.y - clickedItem.y });
      } else {
        setSelectedItem(null);
      }
      return;
    }
    
    if (tool === 'text') {
      setTextPosition(pos);
      setShowTextModal(true);
      return;
    }

    if (tool === 'pen') {
        setIsDrawing(true);
        // Lógica de desenho livre...
    } else {
        const newItem = {
          id: Date.now() + Math.random(),
          x: pos.x,
          y: pos.y,
          type: tool,
          color: color
        };
        // Notifica o pai sobre a adição do novo item
        onPranchetaChange([...(pranchetaItems || []), newItem]);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedItem) {
      const pos = getMousePos(e);
      const newX = pos.x - dragOffset.x;
      const newY = pos.y - dragOffset.y;

      const updatedItems = (pranchetaItems || []).map(item =>
        item.id === selectedItem.id ? { ...item, x: newX, y: newY } : item
      );
      // Notifica o pai sobre a movimentação
      onPranchetaChange(updatedItems);
      // Atualiza o item selecionado localmente para o feedback visual
      setSelectedItem(prev => ({...prev, x: newX, y: newY}));
      return;
    }
    
    if (!isDrawing || tool !== 'pen') return;
    // Lógica de desenho livre...
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const newItem = {
      id: Date.now() + Math.random(),
      type: 'text',
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      color: color,
      fontSize: fontSize,
      style: textStyle
    };
    onPranchetaChange([...(pranchetaItems || []), newItem]);
    setTextInput('');
    setShowTextModal(false);
  };

  const removeSelectedItem = () => {
    if (selectedItem) {
      const updatedItems = (pranchetaItems || []).filter(item => item.id !== selectedItem.id);
      onPranchetaChange(updatedItems);
      setSelectedItem(null);
    }
  };

  const clearCanvas = () => {
    onPranchetaChange([]); // Limpa os itens notificando o pai
    setSelectedItem(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          🏐 Prancheta Tática
        </h3>
        <button 
            onClick={onSavePlay} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Save size={16} />
            Salvar Treino
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
        {tools.map(toolData => (
          <button
            key={toolData.id}
            onClick={() => setTool(toolData.id)}
            className={`p-4 rounded-lg transition-colors border-2 ${
              tool === toolData.id 
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'
            }`}
            title={toolData.desc}
          >
            <div className="flex flex-col items-center gap-2">
              <toolData.icon size={20} />
              <span className="text-xs font-medium">{toolData.name}</span>
            </div>
          </button>
        ))}
      </div>
      
      {selectedItem && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex justify-between items-center">
          <p className="text-sm text-green-800 dark:text-green-300">
            <strong>Item selecionado:</strong> {selectedItem.type}
          </p>
          <button onClick={removeSelectedItem} className="p-1 text-red-500 hover:text-red-700"><Trash size={16} /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        {/* Controles de cor, espessura e tema... */}
      </div>

      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          width={500}
          height={700}
          className={`w-full h-auto block ${isSelectMode ? 'cursor-move' : 'cursor-crosshair'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      
      <div className="mt-4 flex justify-between">
        <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
            <Eraser size={16} /> Limpar Desenho
        </button>
      </div>

      {/* O Modal de Texto continua o mesmo */}
       {showTextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Adicionar Texto</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            {/* Controles de tamanho e estilo do texto... */}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowTextModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
              <button onClick={addText} className="px-4 py-2 bg-blue-600 text-white rounded">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
// ADICIONE ESTE NOVO COMPONENTE ANTES DA PÁGINA DE TREINOS

const TreinoForm = memo(({ treinoData, onDataChange, onSave, onCancel }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onDataChange({ ...treinoData, [name]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        {treinoData.id ? 'Editando Treino' : 'Novo Treino'}
      </h3>
      
      <Input
        label="Título do Treino"
        name="titulo"
        value={treinoData.titulo || ''}
        onChange={handleInputChange}
        placeholder="Ex: Treino de Defesa"
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Descrição
        </label>
        <textarea
          name="descricao"
          value={treinoData.descricao || ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Descreva o foco e os exercícios do treino."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Duração (minutos)"
          name="duracao"
          type="number"
          value={treinoData.duracao || 60}
          onChange={handleInputChange}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Nível
          </label>
          <select
            name="nivel"
            value={treinoData.nivel || 'intermediario'}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onCancel}>
            Cancelar
        </Button>
        <Button onClick={onSave} leftIcon={<Save size={16} />}>
            Salvar Treino
        </Button>
      </div>
    </div>
  );
});
// SUBSTITUA A 'TreinosPage' INTEIRA POR ESTA VERSÃO INTEGRADA

const TreinosPage = memo(() => {
  const { treinos, setTreinos, tipoUsuario, userLogado } = useAppState();
  const { addNotification } = useNotifications();
  
  // NOVO: Estado para o treino sendo editado (inclui dados do form e da prancheta)
  const [activeTreino, setActiveTreino] = useState(null);

  const filteredTreinos = useMemo(() => {
    if (tipoUsuario === 'professor') {
      return treinos.filter(t => t.professorId === userLogado?.id);
    }
    return treinos;
  }, [treinos, tipoUsuario, userLogado]);

  // NOVO: Inicia um novo treino ou cancela a edição
  const handleNewOrCancel = () => {
    setActiveTreino(null);
  };

  // NOVO: Seleciona um treino da lista para edição
  const handleSelectTreino = (treino) => {
    setActiveTreino(treino);
  };

  // NOVO: Atualiza os dados do treino ativo (seja do form ou da prancheta)
  const handleActiveTreinoChange = (newData) => {
    setActiveTreino(prev => ({ ...prev, ...newData }));
  };

  // NOVO: Atualiza apenas os itens da prancheta no treino ativo
  const handlePranchetaChange = (newItems) => {
    setActiveTreino(prev => ({
      ...prev,
      pranchetaData: { ...prev.pranchetaData, items: newItems }
    }));
  };
  
  const handleSave = () => {
    if (!activeTreino || !activeTreino.titulo) {
      addNotification({ type: 'error', title: 'Erro', message: 'O título do treino é obrigatório.' });
      return;
    }

    if (activeTreino.id) {
      // Editar treino existente
      setTreinos(prev => prev.map(t => t.id === activeTreino.id ? activeTreino : t));
      addNotification({ type: 'success', title: 'Treino atualizado!' });
    } else {
      // Criar novo treino
      const novoTreino = {
        ...activeTreino,
        id: Date.now(),
        professorId: userLogado?.id || 1,
        professor: userLogado?.nome || 'Professor',
        data: new Date().toISOString().split('T')[0]
      };
      setTreinos(prev => [...prev, novoTreino]);
      addNotification({ type: 'success', title: 'Treino criado com sucesso!' });
    }
    setActiveTreino(null); // Limpa a seleção para voltar à lista
  };

  const handleDelete = (treinoId) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      setTreinos(prev => prev.filter(t => t.id !== treinoId));
      if(activeTreino && activeTreino.id === treinoId) {
          setActiveTreino(null);
      }
      addNotification({ type: 'success', title: 'Treino excluído' });
    }
  };

  // Se um treino está ativo, mostra a tela de edição. Senão, mostra a lista.
  if (activeTreino) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TreinoForm 
            treinoData={activeTreino}
            onDataChange={handleActiveTreinoChange}
            onSave={handleSave}
            onCancel={handleNewOrCancel}
          />
        </div>
        <div className="lg:col-span-2">
          <PranchetaTaticaAvancada
            pranchetaItems={activeTreino.pranchetaData?.items || []}
            onPranchetaChange={handlePranchetaChange}
            onSavePlay={handleSave}
          />
        </div>
      </div>
    );
  }

  // Tela principal (lista de treinos)
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Meus Treinos</h2>
        <Button
          onClick={() => setActiveTreino({ titulo: '', descricao: '', duracao: 60, nivel: 'intermediario', pranchetaData: { items: [] } })}
          leftIcon={<Plus size={20} />}
        >
          Novo Treino
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreinos.map(treino => (
          <div key={treino.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="p-2" onClick={() => handleSelectTreino(treino)}>
                <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">{treino.titulo}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 h-10 overflow-hidden">{treino.descricao}</p>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                treino.nivel === 'iniciante' ? 'bg-green-100 text-green-800' :
                treino.nivel === 'intermediario' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {treino.nivel}
              </span>
              <div className="flex gap-2">
                <button onClick={() => handleSelectTreino(treino)} className="text-gray-500 hover:text-blue-600"><Edit size={16} /></button>
                <button onClick={() => handleDelete(treino.id)} className="text-gray-500 hover:text-red-600"><Trash size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Modal de Treino


// Página de Loja
const LojaPage = memo(() => {
  const { produtos, setProdutos, tipoUsuario, cart, setCart } = useAppState();
  const { addNotification } = useNotifications();
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((produto) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === produto.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === produto.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...produto, quantity: 1 }];
    });
    
    addNotification({
      type: 'success',
      title: 'Produto adicionado',
      message: `${produto.nome} foi adicionado ao carrinho`
    });
  }, [setCart, addNotification]);

  const removeFromCart = useCallback((produtoId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== produtoId));
    addNotification({
      type: 'success',
      title: 'Produto removido',
      message: 'Item removido do carrinho'
    });
  }, [setCart, addNotification]);

  const updateQuantity = useCallback((produtoId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(produtoId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === produtoId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  }, [setCart, removeFromCart]);

  const handleSaveProduto = useCallback(async (produtoData) => {
    setLoading(true);
    try {
      if (editingProduto) {
        setProdutos(prev => prev.map(p => 
          p.id === editingProduto.id ? { ...p, ...produtoData } : p
        ));
        addNotification({
          type: 'success',
          title: 'Produto atualizado',
          message: 'Produto atualizado com sucesso'
        });
      } else {
        const novoProduto = {
          id: Date.now(),
          ...produtoData
        };
        setProdutos(prev => [...prev, novoProduto]);
        addNotification({
          type: 'success',
          title: 'Produto criado',
          message: 'Novo produto adicionado com sucesso'
        });
      }
      setShowModal(false);
      setEditingProduto(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar produto'
      });
    } finally {
      setLoading(false);
    }
  }, [editingProduto, setProdutos, addNotification]);

  const handleDeleteProduto = useCallback((produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProdutos(prev => prev.filter(p => p.id !== produtoId));
      addNotification({
        type: 'success',
        title: 'Produto excluído',
        message: 'Produto removido com sucesso'
      });
    }
  }, [setProdutos, addNotification]);

  // Interface para Admin (gestão da loja)
  if (tipoUsuario === 'admin') {
    return (
      <div className="p-6">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => {
              setEditingProduto(null);
              setShowModal(true);
            }}
            leftIcon={<Plus size={20} />}
          >
            Adicionar Produto
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {produtos.map(produto => (
                  <tr key={produto.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-md object-cover" src={produto.imagem} alt={produto.nome} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{produto.nome}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      R$ {produto.preco.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                      <button 
                        onClick={() => {
                          setEditingProduto(produto);
                          setShowModal(true);
                        }} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={20}/>
                      </button>
                      <button 
                        onClick={() => handleDeleteProduto(produto.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash size={20}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ProdutoModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingProduto(null);
          }}
          onSave={handleSaveProduto}
          produto={editingProduto}
          loading={loading}
        />
      </div>
    );
  }

  // Interface para Aluno (loja de compras)
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Loja BoraProCT</h2>
        <Button
          onClick={() => setIsCartOpen(true)}
          variant="secondary"
          leftIcon={<ShoppingCart size={20} />}
          className="relative"
        >
          Carrinho
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {produtos.map(produto => (
          <div key={produto.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <img src={produto.imagem} alt={produto.nome} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{produto.nome}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">R$ {produto.preco.toFixed(2)}</p>
              <Button
                onClick={() => addToCart(produto)}
                className="mt-auto w-full"
                leftIcon={<ShoppingCart size={16} />}
              >
                Adicionar ao carrinho
              </Button>
            </div>
          </div>
        ))}
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
      />
    </div>
  );
});

// Modal de Produto
const ProdutoModal = memo(({ isOpen, onClose, onSave, produto, loading }) => {
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    imagem: ''
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem
      });
    } else {
      setFormData({ nome: '', preco: '', imagem: '' });
    }
  }, [produto, isOpen]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave({ ...produto, ...formData, preco: parseFloat(formData.preco) });
  }, [formData, produto, onSave]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={produto ? 'Editar Produto' : 'Adicionar Produto'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Produto"
          required
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Nome do produto"
        />
        
        <Input
          label="Preço"
          type="number"
          required
          value={formData.preco}
          onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        
        <Input
          label="URL da Imagem"
          type="url"
          required
          value={formData.imagem}
          onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
          placeholder="https://exemplo.com/imagem.jpg"
        />

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
});

// Modal do Carrinho
const CartModal = memo(({ isOpen, onClose, cart, onUpdateQuantity, onRemoveFromCart }) => {
  const { isDarkMode } = useTheme();
  const { addNotification } = useNotifications();
  const total = cart.reduce((sum, item) => sum + item.preco * item.quantity, 0);

  const handleCheckout = useCallback(() => {
    addNotification({
      type: 'success',
      title: 'Pedido realizado',
      message: 'Seu pedido foi enviado com sucesso!'
    });
    onClose();
  }, [addNotification, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-end z-[150]">
      <div className={`w-full max-w-md h-full flex flex-col ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Carrinho de Compras</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
              <ShoppingCart size={48} className="mx-auto mb-4" />
              <p>O seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <img src={item.imagem} alt={item.nome} className="w-16 h-16 rounded-md object-cover" />
                  <div className="flex-grow">
                    <p className="font-semibold">{item.nome}</p>
                    <p className="text-sm text-blue-600">R$ {item.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <MinusCircle size={20} />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                  <button 
                    onClick={() => onRemoveFromCart(item.id)} 
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold">R$ {total.toFixed(2)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full">
              Finalizar Compra
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
// Página de Planos
// Página de Planos - VERSÃO CORRIGIDA COM SEPARAÇÃO POR UNIDADE
const PlanosPage = memo(() => {
  const { planos, setPlanos } = useAppState();
  const { addNotification } = useNotifications();
  
  const [showModal, setShowModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('Centro');

  // 🆕 Filtrar planos pela unidade selecionada
  const planosExibidos = useMemo(() => {
    return planos.filter(plano => plano.unidade === unidadeSelecionada);
  }, [planos, unidadeSelecionada]);

  // 🆕 Modificar handleSave para incluir a unidade
  const handleSave = useCallback(async (planoData) => {
    setLoading(true);
    try {
      if (editingPlano) {
        setPlanos(prev => prev.map(p => 
          p.id === editingPlano.id ? { ...p, ...planoData, unidade: unidadeSelecionada } : p
        ));
        addNotification({
          type: 'success',
          title: 'Plano atualizado',
          message: `Plano da unidade ${unidadeSelecionada} atualizado com sucesso`
        });
      } else {
        const novoPlano = {
          id: Date.now(),
          ...planoData,
          unidade: unidadeSelecionada // 🆕 Adicionar unidade ao criar
        };
        setPlanos(prev => [...prev, novoPlano]);
        addNotification({
          type: 'success',
          title: 'Plano criado',
          message: `Novo plano adicionado para a unidade ${unidadeSelecionada}`
        });
      }
      setShowModal(false);
      setEditingPlano(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar plano'
      });
    } finally {
      setLoading(false);
    }
  }, [editingPlano, setPlanos, addNotification, unidadeSelecionada]);

  const handleDelete = useCallback((planoId) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      setPlanos(prev => prev.filter(p => p.id !== planoId));
      addNotification({
        type: 'success',
        title: 'Plano excluído',
        message: 'Plano removido com sucesso'
      });
    }
  }, [setPlanos, addNotification]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Planos por Unidade</h2>
        <Button
          onClick={() => {
            setEditingPlano(null);
            setShowModal(true);
          }}
          leftIcon={<Plus size={20} />}
        >
          Novo Plano
        </Button>
      </div>

      {/* 🆕 Seletor de Unidade */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <label className="block text-sm font-medium mb-2">🏢 Selecione a Unidade</label>
        <select
          value={unidadeSelecionada}
          onChange={(e) => setUnidadeSelecionada(e.target.value)}
          className="w-full md:w-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="Centro">Centro</option>
          <option value="Zona Sul">Zona Sul</option>
          <option value="Zona Norte">Zona Norte</option>
          <option value="Barra">Barra</option>
        </select>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
          💡 Cada unidade possui valores diferentes. Alterações afetam apenas a unidade selecionada.
        </p>
      </div>

      {/* Estatísticas da unidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{planosExibidos.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Planos em {unidadeSelecionada}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            R$ {planosExibidos.length > 0 ? Math.min(...planosExibidos.map(p => p.preco)).toFixed(2) : '0,00'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Menor valor</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            R$ {planosExibidos.length > 0 ? Math.max(...planosExibidos.map(p => p.preco)).toFixed(2) : '0,00'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Maior valor</div>
        </div>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planosExibidos.map(plano => (
          <div key={plano.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{plano.nome}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                  {plano.unidade}
                </span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setEditingPlano(plano);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar plano"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(plano.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Excluir plano"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                R$ {plano.preco.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                por mês
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem se não houver planos */}
      {planosExibidos.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Nenhum plano encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            A unidade {unidadeSelecionada} ainda não possui planos cadastrados.
          </p>
          <Button
            onClick={() => {
              setEditingPlano(null);
              setShowModal(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Criar Primeiro Plano
          </Button>
        </div>
      )}

      {/* Modal */}
      <PlanoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlano(null);
        }}
        onSave={handleSave}
        plano={editingPlano}
        loading={loading}
        unidade={unidadeSelecionada}
      />
    </div>
  );
});

// Modal de Plano
const PlanoModal = memo(({ isOpen, onClose, onSave, plano, loading, unidade }) => {
  const [formData, setFormData] = useState({
    nome: '',
    preco: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plano) {
      setFormData({
        nome: plano.nome || '',
        preco: plano.preco || ''
      });
    } else {
      setFormData({
        nome: '',
        preco: ''
      });
    }
    setErrors({});
  }, [plano, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.preco || formData.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave({ ...formData, preco: parseFloat(formData.preco) });
    }
  }, [formData, validateForm, onSave]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plano ? `Editar Plano - ${unidade || plano?.unidade}` : `Novo Plano - ${unidade}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome do Plano"
          required
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          error={errors.nome}
          placeholder="Ex: Plano Básico (2x/semana)"
        />
        
        <Input
          label="Preço Mensal"
          type="number"
          required
          value={formData.preco}
          onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
          error={errors.preco}
          placeholder="0.00"
          step="0.01"
          min="0"
        />

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {plano ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

// Página de Plataformas
// Página de Plataformas - VERSÃO COM SEPARAÇÃO POR UNIDADE
const PlataformasPage = memo(() => {
  const { plataformas, setPlataformas, unidades } = useAppState();
  const { addNotification } = useNotifications();
  
  const [showModal, setShowModal] = useState(false);
  const [editingPlataforma, setEditingPlataforma] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades.length > 0 ? unidades[0].nome : 'Centro');

  // 🆕 Filtrar plataformas pela unidade selecionada
  const plataformasExibidas = useMemo(() => {
    return plataformas.filter(plataforma => plataforma.unidade === unidadeSelecionada);
  }, [plataformas, unidadeSelecionada]);

  // 🆕 Estatísticas por unidade
  const estatisticasUnidade = useMemo(() => {
    const plataformasAtivas = plataformasExibidas.filter(p => p.ativo);
    const totalPlataformas = plataformasExibidas.length;
    const menorValor = plataformasExibidas.length > 0 ? Math.min(...plataformasExibidas.map(p => p.valorPorAluno)) : 0;
    const maiorValor = plataformasExibidas.length > 0 ? Math.max(...plataformasExibidas.map(p => p.valorPorAluno)) : 0;

    return {
      totalPlataformas,
      plataformasAtivas: plataformasAtivas.length,
      menorValor,
      maiorValor
    };
  }, [plataformasExibidas]);

  const handleSave = useCallback(async (plataformaData) => {
    setLoading(true);
    try {
      if (editingPlataforma) {
        setPlataformas(prev => prev.map(p => 
          p.id === editingPlataforma.id ? { ...p, ...plataformaData, unidade: unidadeSelecionada } : p
        ));
        addNotification({
          type: 'success',
          title: 'Plataforma atualizada',
          message: `Plataforma da unidade ${unidadeSelecionada} atualizada com sucesso`
        });
      } else {
        const novaPlataforma = {
          id: Date.now(),
          ...plataformaData,
          unidade: unidadeSelecionada // 🆕 Adicionar unidade ao criar
        };
        setPlataformas(prev => [...prev, novaPlataforma]);
        addNotification({
          type: 'success',
          title: 'Plataforma criada',
          message: `Nova plataforma adicionada para a unidade ${unidadeSelecionada}`
        });
      }
      setShowModal(false);
      setEditingPlataforma(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar plataforma'
      });
    } finally {
      setLoading(false);
    }
  }, [editingPlataforma, setPlataformas, addNotification, unidadeSelecionada]);

  const toggleStatus = useCallback((plataformaId) => {
    setPlataformas(prev => prev.map(p => 
      p.id === plataformaId ? { ...p, ativo: !p.ativo } : p
    ));
    addNotification({
      type: 'success',
      title: 'Status atualizado',
      message: 'Status da plataforma alterado'
    });
  }, [setPlataformas, addNotification]);

  const handleDelete = useCallback((plataformaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta plataforma?')) {
      setPlataformas(prev => prev.filter(p => p.id !== plataformaId));
      addNotification({
        type: 'success',
        title: 'Plataforma excluída',
        message: 'Plataforma removida com sucesso'
      });
    }
  }, [setPlataformas, addNotification]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Plataformas Parceiras por Unidade</h2>
        <Button
          onClick={() => {
            setEditingPlataforma(null);
            setShowModal(true);
          }}
          leftIcon={<Plus size={20} />}
        >
          Nova Plataforma
        </Button>
      </div>

      {/* 🆕 Seletor de Unidade */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <label className="block text-sm font-medium mb-2">🏢 Selecione a Unidade</label>
        <div className="flex flex-wrap gap-3">
          {unidades.map(unidade => (
            <button
              key={unidade.id}
              onClick={() => setUnidadeSelecionada(unidade.nome)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                unidadeSelecionada === unidade.nome
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {unidade.nome}
            </button>
          ))}
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
          💡 Cada unidade pode ter valores diferentes para as mesmas plataformas. Selecione a unidade para gerenciar.
        </p>
      </div>

      {/* Estatísticas da unidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{estatisticasUnidade.totalPlataformas}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total em {unidadeSelecionada}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{estatisticasUnidade.plataformasAtivas}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Ativas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            R$ {estatisticasUnidade.menorValor.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Menor valor</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            R$ {estatisticasUnidade.maiorValor.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Maior valor</div>
        </div>
      </div>

      {/* Grid de Plataformas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plataformasExibidas.map(plataforma => (
          <div key={plataforma.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{plataforma.nome}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                  {plataforma.unidade}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleStatus(plataforma.id)}
                  className={`p-1 rounded-full ${plataforma.ativo ? 'text-green-600' : 'text-gray-400'}`}
                  title={plataforma.ativo ? 'Desativar' : 'Ativar'}
                >
                  {plataforma.ativo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                <button 
                  onClick={() => {
                    setEditingPlataforma(plataforma);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar plataforma"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(plataforma.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Excluir plataforma"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                R$ {plataforma.valorPorAluno.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                por aluno/aula
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                plataforma.ativo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {plataforma.ativo ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem se não houver plataformas */}
      {plataformasExibidas.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Nenhuma plataforma encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            A unidade {unidadeSelecionada} ainda não possui plataformas cadastradas.
          </p>
          <Button
            onClick={() => {
              setEditingPlataforma(null);
              setShowModal(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Criar Primeira Plataforma
          </Button>
        </div>
      )}

      {/* Tabela Comparativa das Unidades */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Comparativo entre Unidades</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plataforma</th>
                {unidades.map(unidade => (
                  <th key={unidade.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {unidade.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {['Wellhub', 'TotalPass', 'Gympass', 'Vivo Melon'].map(nomePlataforma => (
                <tr key={nomePlataforma}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {nomePlataforma}
                  </td>
                  {unidades.map(unidade => {
                    const plataformaUnidade = plataformas.find(p => 
                      p.nome === nomePlataforma && p.unidade === unidade.nome
                    );
                    return (
                      <td key={unidade.id} className="px-4 py-3 text-center">
                        {plataformaUnidade ? (
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-blue-600">
                              R$ {plataformaUnidade.valorPorAluno.toFixed(2)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              plataformaUnidade.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {plataformaUnidade.ativo ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Não configurada</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <PlataformaModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlataforma(null);
        }}
        onSave={handleSave}
        plataforma={editingPlataforma}
        loading={loading}
        unidade={unidadeSelecionada}
      />
    </div>
  );
});

// Modal de Plataforma
// Modal de Plataforma - VERSÃO ATUALIZADA
const PlataformaModal = memo(({ isOpen, onClose, onSave, plataforma, loading, unidade }) => {
  const [formData, setFormData] = useState({
    nome: '',
    valorPorAluno: '',
    ativo: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plataforma) {
      setFormData({
        nome: plataforma.nome || '',
        valorPorAluno: plataforma.valorPorAluno || '',
        ativo: plataforma.ativo !== undefined ? plataforma.ativo : true
      });
    } else {
      setFormData({
        nome: '',
        valorPorAluno: '',
        ativo: true
      });
    }
    setErrors({});
  }, [plataforma, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da plataforma é obrigatório';
    }
    
    if (!formData.valorPorAluno || formData.valorPorAluno <= 0) {
      newErrors.valorPorAluno = 'Valor deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({ ...formData, valorPorAluno: parseFloat(formData.valorPorAluno) });
    }
  }, [formData, validateForm, onSave]);

  // 🆕 Sugestões de plataformas comuns
  const plataformasComuns = [
    'Wellhub (Gympass)',
    'TotalPass', 
    'Gympass',
    'Vivo Melon',
    'Sesc',
    'Ticket Flex'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plataforma ? `Editar Plataforma - ${unidade || plataforma?.unidade}` : `Nova Plataforma - ${unidade}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 🆕 Seletor rápido de plataformas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            🚀 Plataformas Comuns (clique para selecionar)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {plataformasComuns.map(plataformaNome => (
              <button
                key={plataformaNome}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, nome: plataformaNome }))}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                {plataformaNome}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Nome da Plataforma"
          required
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          error={errors.nome}
          placeholder="Ex: Wellhub (Gympass)"
        />
        
        <Input
          label={`Valor por Aluno/Aula - ${unidade}`}
          type="number"
          required
          value={formData.valorPorAluno}
          onChange={(e) => setFormData(prev => ({ ...prev, valorPorAluno: e.target.value }))}
          error={errors.valorPorAluno}
          placeholder="0.00"
          step="0.01"
          min="0"
        />

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="mr-2"
            />
            Plataforma ativa nesta unidade
          </label>
        </div>

        {/* 🆕 Informação sobre a unidade */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📍 <strong>Unidade:</strong> {unidade}
            <br />
            💡 Este valor será aplicado apenas para a unidade selecionada.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {plataforma ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

// Página de Evolução do Aluno
const EvolucaoPage = memo(() => {
  const { userLogado, presencas } = useAppState();
  
  const minhasPresencas = useMemo(() => {
    return presencas.filter(p => p.alunoId === userLogado?.id);
  }, [presencas, userLogado]);

  const estatisticas = useMemo(() => {
    const totalAulas = minhasPresencas.length;
    const aulasEsteMes = minhasPresencas.filter(p => {
      const dataPresenca = new Date(p.data);
      const agora = new Date();
      return dataPresenca.getMonth() === agora.getMonth() && 
             dataPresenca.getFullYear() === agora.getFullYear();
    }).length;

    // Sequência atual
    let sequenciaAtual = 0;
    const presencasOrdenadas = [...minhasPresencas].sort((a, b) => new Date(b.data) - new Date(a.data));
    for (let i = 0; i < presencasOrdenadas.length; i++) {
      const dataPresenca = new Date(presencasOrdenadas[i].data);
      const hoje = new Date();
      const diffDias = Math.floor((hoje - dataPresenca) / (1000 * 60 * 60 * 24));
      
      if (diffDias <= i + 1) {
        sequenciaAtual++;
      } else {
        break;
      }
    }

    return {
      totalAulas,
      aulasEsteMes,
      sequenciaAtual,
      progressoMensal: Math.min((aulasEsteMes / 8) * 100, 100) // Meta de 8 aulas por mês
    };
  }, [minhasPresencas]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Minha Evolução</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe seu progresso e conquistas no futevôlei
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total de Aulas" 
          value={estatisticas.totalAulas} 
          icon={Activity} 
          color="text-blue-600" 
          subtitle="Desde o início"
        />
        <StatsCard 
          title="Este Mês" 
          value={estatisticas.aulasEsteMes} 
          icon={Calendar} 
          color="text-green-600" 
          subtitle="Aulas frequentadas"
        />
        <StatsCard 
          title="Sequência" 
          value={`${estatisticas.sequenciaAtual} dias`} 
          icon={Award} 
          color="text-yellow-600" 
          subtitle="Consecutivos"
        />
        <StatsCard 
          title="Progresso Mensal" 
          value={`${Math.round(estatisticas.progressoMensal)}%`} 
          icon={TrendingUp} 
          color="text-purple-600" 
          subtitle="Meta: 8 aulas/mês"
        />
      </div>

      {/* Progresso Visual */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Progresso da Meta Mensal</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(estatisticas.progressoMensal, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{estatisticas.aulasEsteMes} de 8 aulas</span>
          <span>{Math.round(estatisticas.progressoMensal)}%</span>
        </div>
      </div>

      {/* Histórico Recente */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico Recente</h3>
        {minhasPresencas.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma aula registrada ainda. Que tal começar hoje?
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {minhasPresencas
              .sort((a, b) => new Date(b.data) - new Date(a.data))
              .slice(0, 10)
              .map((presenca, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(presenca.data).toLocaleDateString('pt-BR')} às {presenca.horario}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Prof. {presenca.professor}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Presente
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Página de Perfil do Aluno
// Página de Perfil do Aluno - VERSÃO MELHORADA
const PerfilPage = memo(() => {
  const { userLogado, setAlunos, planos } = useAppState();
  const { addNotification } = useNotifications();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [fotoProfile, setFotoProfile] = useState('');
  const [previewFoto, setPreviewFoto] = useState('');

  useEffect(() => {
    if (userLogado) {
      setFormData({
        nome: userLogado.nome || '',
        email: userLogado.email || '',
        telefone: userLogado.telefone || '',
        objetivo: userLogado.objetivo || '',
        nivel: userLogado.nivel || ''
      });
      setFotoProfile(userLogado.fotoProfile || '');
      setPreviewFoto(userLogado.fotoProfile || '');
    }
  }, [userLogado]);

  const planoAtual = planos.find(p => p.id === userLogado?.planoId);

  const handleSave = useCallback(() => {
    const dadosAtualizados = { 
      ...formData, 
      fotoProfile: fotoProfile || userLogado.fotoProfile 
    };
    
    setAlunos(prev => prev.map(aluno => 
      aluno.id === userLogado.id ? { ...aluno, ...dadosAtualizados } : aluno
    ));
    setEditMode(false);
    addNotification({
      type: 'success',
      title: 'Perfil atualizado',
      message: 'Seus dados foram atualizados com sucesso'
    });
  }, [formData, fotoProfile, userLogado, setAlunos, addNotification]);

  const handlePasswordChange = useCallback(() => {
    // Validações
    if (passwordData.senhaAtual !== userLogado.senha) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Senha atual incorreta'
      });
      return;
    }

    if (passwordData.novaSenha.length < 6) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Nova senha deve ter pelo menos 6 caracteres'
      });
      return;
    }

    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Confirmação de senha não confere'
      });
      return;
    }

    // Atualizar senha
    setAlunos(prev => prev.map(aluno => 
      aluno.id === userLogado.id ? { ...aluno, senha: passwordData.novaSenha } : aluno
    ));

    setShowPasswordChange(false);
    setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    
    addNotification({
      type: 'success',
      title: 'Senha alterada',
      message: 'Sua senha foi alterada com sucesso'
    });
  }, [passwordData, userLogado, setAlunos, addNotification]);

  const handleFotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Arquivo inválido',
          message: 'Por favor, selecione apenas imagens'
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: 'Arquivo muito grande',
          message: 'A imagem deve ter no máximo 5MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        setPreviewFoto(result);
        setFotoProfile(result);
      };
      reader.readAsDataURL(file);
    }
  }, [addNotification]);

  const handleFotoUrl = useCallback((url) => {
    setPreviewFoto(url);
    setFotoProfile(url);
  }, []);

  const removerFoto = useCallback(() => {
    setPreviewFoto('');
    setFotoProfile('');
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Meu Perfil</h2>
            {!editMode ? (
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowPasswordChange(true)}
                  leftIcon={<Edit size={16} />}
                  variant="secondary"
                >
                  Alterar Senha
                </Button>
                <Button
                  onClick={() => setEditMode(true)}
                  leftIcon={<Edit size={16} />}
                  variant="secondary"
                >
                  Editar Perfil
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setPreviewFoto(userLogado.fotoProfile || '');
                    setFotoProfile(userLogado.fotoProfile || '');
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  leftIcon={<Save size={16} />}
                  size="sm"
                >
                  Salvar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da Foto de Perfil */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">📸 Foto de Perfil</h3>
                
                {/* Preview da Foto */}
                <div className="relative mb-4">
                  {previewFoto ? (
                    <div className="relative">
                      <img
                        src={previewFoto}
                        alt="Foto de perfil"
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-200 dark:border-blue-800"
                        onError={() => setPreviewFoto('')}
                      />
                      {editMode && (
                        <button
                          onClick={removerFoto}
                          className="absolute top-0 right-1/2 transform translate-x-16 -translate-y-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Remover foto"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {userLogado?.nome?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>

                {editMode && (
                  <div className="space-y-4">
                    {/* Upload de arquivo */}
                    <div>
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          className="hidden"
                        />
                        <Button
                          variant="secondary"
                          className="w-full cursor-pointer"
                          leftIcon={<Upload size={16} />}
                        >
                          Enviar Foto
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Máximo 5MB • JPG, PNG, GIF
                      </p>
                    </div>

                    {/* URL da foto */}
                    <div>
                      <Input
                        label="Ou cole uma URL"
                        type="url"
                        value={fotoProfile}
                        onChange={(e) => handleFotoUrl(e.target.value)}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colunas das Informações */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Pessoais */}
              <div>
                <h3 className="text-lg font-semibold mb-4">👤 Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    disabled={!editMode}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editMode}
                  />
                  <Input
                    label="Telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    disabled={!editMode}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Objetivo
                    </label>
                    <select
                      value={formData.objetivo}
                      onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
                      disabled={!editMode}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    >
                      <option value="Lazer">Lazer</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Competição">Competição</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Plano Atual */}
              <div>
                <h3 className="text-lg font-semibold mb-4">💳 Plano Atual</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                        {planoAtual?.nome}
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400">
                        R$ {planoAtual?.preco.toFixed(2)}/mês
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Próximo vencimento
                      </p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        {new Date(userLogado?.vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do Treino */}
              <div>
                <h3 className="text-lg font-semibold mb-4">🏐 Informações do Treino</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campo Nível - BLOQUEADO para alunos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Nível Atual
                      <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                        🔒 Apenas professores podem alterar
                      </span>
                    </label>
                    <select
                      value={formData.nivel}
                      disabled={true} // ✅ SEMPRE BLOQUEADO para alunos
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                    >
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Data de Matrícula
                    </label>
                    <input
                      type="text"
                      value={new Date(userLogado?.dataMatricula).toLocaleDateString('pt-BR')}
                      disabled
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Senha */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">🔒 Alterar Senha</h3>
              <button
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Senha Atual"
                type="password"
                value={passwordData.senhaAtual}
                onChange={(e) => setPasswordData(prev => ({ ...prev, senhaAtual: e.target.value }))}
                placeholder="Digite sua senha atual"
                required
              />
              
              <Input
                label="Nova Senha"
                type="password"
                value={passwordData.novaSenha}
                onChange={(e) => setPasswordData(prev => ({ ...prev, novaSenha: e.target.value }))}
                placeholder="Digite a nova senha (mín. 6 caracteres)"
                required
              />
              
              <Input
                label="Confirmar Nova Senha"
                type="password"
                value={passwordData.confirmarSenha}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                placeholder="Digite novamente a nova senha"
                required
              />
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Dica de segurança:</strong> Use uma senha forte com pelo menos 6 caracteres, incluindo números e letras.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={!passwordData.senhaAtual || !passwordData.novaSenha || !passwordData.confirmarSenha}
                  className="flex-1"
                  leftIcon={<Save size={16} />}
                >
                  Alterar Senha
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
// Componente de Configuração de Horários Completo
const HorariosCompletos = memo(({ 
  horariosConfiguracao, 
  setHorariosConfiguracao, 
  unidades, 
  addNotification 
}) => {
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades.length > 0 ? unidades[0].id : 1);
  const [diaExpandido, setDiaExpandido] = useState('segunda');
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState('segunda');

  const diasDaSemana = [
    { id: 'segunda', nome: 'Segunda-feira', emoji: '🌟' },
    { id: 'terca', nome: 'Terça-feira', emoji: '💪' },
    { id: 'quarta', nome: 'Quarta-feira', emoji: '🔥' },
    { id: 'quinta', nome: 'Quinta-feira', emoji: '⚡' },
    { id: 'sexta', nome: 'Sexta-feira', emoji: '🎯' },
    { id: 'sabado', nome: 'Sábado', emoji: '🏆' },
    { id: 'domingo', nome: 'Domingo', emoji: '🌅' }
  ];

  const unidadeAtual = unidades.find(u => u.id === unidadeSelecionada);
  const horariosUnidade = horariosConfiguracao[unidadeSelecionada] || {};

  // Estatísticas da unidade
  const estatisticas = useMemo(() => {
    const todosHorarios = Object.values(horariosUnidade).flat();
    const horariosAtivos = todosHorarios.filter(h => h.ativo);
    const totalCapacidade = horariosAtivos.reduce((acc, h) => acc + h.maxAlunos, 0);
    const diasComHorarios = Object.keys(horariosUnidade).filter(dia => 
      horariosUnidade[dia] && horariosUnidade[dia].length > 0
    ).length;

    return {
      totalHorarios: todosHorarios.length,
      horariosAtivos: horariosAtivos.length,
      totalCapacidade,
      diasComHorarios
    };
  }, [horariosUnidade]);

  const adicionarHorario = useCallback((dia) => {
    setEditingHorario(null);
    setDiaSelecionado(dia);
    setShowHorarioModal(true);
  }, []);

  const editarHorario = useCallback((dia, horario) => {
    setEditingHorario(horario);
    setDiaSelecionado(dia);
    setShowHorarioModal(true);
  }, []);

  const removerHorario = useCallback((dia, horarioId) => {
    if (window.confirm('Tem certeza que deseja remover este horário?')) {
      setHorariosConfiguracao(prev => ({
        ...prev,
        [unidadeSelecionada]: {
          ...prev[unidadeSelecionada],
          [dia]: (prev[unidadeSelecionada]?.[dia] || []).filter(h => h.id !== horarioId)
        }
      }));

      addNotification({
        type: 'success',
        title: 'Horário removido',
        message: 'Horário excluído com sucesso'
      });
    }
  }, [unidadeSelecionada, setHorariosConfiguracao, addNotification]);

  const salvarHorario = useCallback((horarioData) => {
    if (editingHorario) {
      // Editar horário existente
      setHorariosConfiguracao(prev => ({
        ...prev,
        [unidadeSelecionada]: {
          ...prev[unidadeSelecionada],
          [diaSelecionado]: (prev[unidadeSelecionada]?.[diaSelecionado] || []).map(h => 
            h.id === editingHorario.id ? { ...h, ...horarioData } : h
          )
        }
      }));

      addNotification({
        type: 'success',
        title: 'Horário atualizado',
        message: 'Horário editado com sucesso'
      });
    } else {
      // Adicionar novo horário
      const novoHorario = {
        id: Date.now() + Math.random(),
        ...horarioData,
        ativo: true
      };

      setHorariosConfiguracao(prev => ({
        ...prev,
        [unidadeSelecionada]: {
          ...prev[unidadeSelecionada],
          [diaSelecionado]: [...(prev[unidadeSelecionada]?.[diaSelecionado] || []), novoHorario]
        }
      }));

      addNotification({
        type: 'success',
        title: 'Horário adicionado',
        message: 'Novo horário configurado com sucesso'
      });
    }

    setShowHorarioModal(false);
    setEditingHorario(null);
  }, [editingHorario, diaSelecionado, unidadeSelecionada, setHorariosConfiguracao, addNotification]);

  const toggleHorarioStatus = useCallback((dia, horarioId) => {
    setHorariosConfiguracao(prev => ({
      ...prev,
      [unidadeSelecionada]: {
        ...prev[unidadeSelecionada],
        [dia]: (prev[unidadeSelecionada]?.[dia] || []).map(h => 
          h.id === horarioId ? { ...h, ativo: !h.ativo } : h
        )
      }
    }));

    addNotification({
      type: 'success',
      title: 'Status atualizado',
      message: 'Status do horário alterado'
    });
  }, [unidadeSelecionada, setHorariosConfiguracao, addNotification]);

  const duplicarDia = useCallback((diaOrigem) => {
    const horariosOrigem = horariosUnidade[diaOrigem] || [];
    if (horariosOrigem.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Nenhum horário',
        message: 'Este dia não possui horários para duplicar'
      });
      return;
    }

    const diasDisponiveis = diasDaSemana.filter(d => d.id !== diaOrigem);
    const diaDestino = prompt(
      `Duplicar horários de ${diaOrigem} para qual dia?\n\n` +
      diasDisponiveis.map((d, i) => `${i + 1}. ${d.nome}`).join('\n') +
      '\n\nDigite o número:'
    );

    const diaIndex = parseInt(diaDestino) - 1;
    if (diaIndex >= 0 && diaIndex < diasDisponiveis.length) {
      const diaEscolhido = diasDisponiveis[diaIndex].id;
      
      const horariosCopiados = horariosOrigem.map(h => ({
        ...h,
        id: Date.now() + Math.random()
      }));

      setHorariosConfiguracao(prev => ({
        ...prev,
        [unidadeSelecionada]: {
          ...prev[unidadeSelecionada],
          [diaEscolhido]: horariosCopiados
        }
      }));

      addNotification({
        type: 'success',
        title: 'Horários duplicados',
        message: `Horários copiados para ${diasDisponiveis[diaIndex].nome}`
      });
    }
  }, [horariosUnidade, unidadeSelecionada, setHorariosConfiguracao, addNotification, diasDaSemana]);

  return (
    <div className="space-y-6">
      {/* Header com seletor de unidade */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">⏰ Configuração de Horários</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure os horários de funcionamento para cada unidade e dia da semana
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">🏢 Unidade:</label>
          <select
            value={unidadeSelecionada}
            onChange={(e) => setUnidadeSelecionada(parseInt(e.target.value))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {unidades.map(unidade => (
              <option key={unidade.id} value={unidade.id}>{unidade.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estatísticas da unidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.totalHorarios}</div>
          <div className="text-sm text-blue-800 dark:text-blue-300">Total de Horários</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{estatisticas.horariosAtivos}</div>
          <div className="text-sm text-green-800 dark:text-green-300">Horários Ativos</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{estatisticas.totalCapacidade}</div>
          <div className="text-sm text-purple-800 dark:text-purple-300">Capacidade Total</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{estatisticas.diasComHorarios}</div>
          <div className="text-sm text-orange-800 dark:text-orange-300">Dias Configurados</div>
        </div>
      </div>

      {/* Grid de dias da semana */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {diasDaSemana.map(dia => {
          const horariosDay = horariosUnidade[dia.id] || [];
          const horariosAtivos = horariosDay.filter(h => h.ativo);
          const capacidadeDay = horariosAtivos.reduce((acc, h) => acc + h.maxAlunos, 0);

          return (
            <div key={dia.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              {/* Header do dia */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                      <span className="text-lg mr-2">{dia.emoji}</span>
                      {dia.nome}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {horariosDay.length} horários • {capacidadeDay} vagas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {horariosDay.length > 0 && (
                      <button
                        onClick={() => duplicarDia(dia.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Duplicar horários"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => adicionarHorario(dia.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Adicionar horário"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de horários */}
              <div className="p-4">
                {horariosDay.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Nenhum horário configurado
                    </p>
                    <Button
                      size="sm"
                      onClick={() => adicionarHorario(dia.id)}
                      leftIcon={<Plus size={14} />}
                    >
                      Adicionar Primeiro Horário
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {horariosDay
                      .sort((a, b) => a.horario.localeCompare(b.horario))
                      .map((horario, index) => (
                        <div 
                          key={horario.id} 
                          className={`p-3 rounded-lg border transition-all ${
                            horario.ativo 
                              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600' 
                              : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                                  {horario.horario}
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  horario.ativo 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {horario.ativo ? 'Ativo' : 'Inativo'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
  {horario.semLimite ? (
    <span className="text-green-600 dark:text-green-400 font-medium">
      🚀 SEM LIMITE DE ALUNOS
    </span>
  ) : (
    <span>Máx: {horario.maxAlunos} alunos</span>
  )}
  {horario.observacoes && (
    <>
      <span className="mx-2">•</span>
      <span className="italic">"{horario.observacoes}"</span>
    </>
  )}
</div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleHorarioStatus(dia.id, horario.id)}
                                className={`p-1.5 rounded-full transition-colors ${
                                  horario.ativo 
                                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                                title={horario.ativo ? 'Desativar' : 'Ativar'}
                              >
                                {horario.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                              </button>
                              <button
                                onClick={() => editarHorario(dia.id, horario)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                title="Editar horário"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => removerHorario(dia.id, horario.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Remover horário"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo geral */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
          📊 Resumo da Unidade {unidadeAtual?.nome}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-900 dark:text-blue-200">Horários por Dia:</div>
            <div className="space-y-1 mt-2">
              {diasDaSemana.map(dia => {
                const count = (horariosUnidade[dia.id] || []).length;
                return (
                  <div key={dia.id} className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{dia.nome}:</span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">{count} horários</span>
                  </div>
                );
              })}
            </div>
          </div>
          
       
<div>
  <div className="font-medium text-blue-900 dark:text-blue-200">Flexibilidade:</div>
  <div className="space-y-1 mt-2 text-blue-700 dark:text-blue-300">
    <div>• Professores definidos por aula</div>
    <div>• Escala flexível de trabalho</div>
    <div>• Substituições facilitadas</div>
  </div>
</div>
          
          <div>
            <div className="font-medium text-blue-900 dark:text-blue-200">Capacidade Semanal:</div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {estatisticas.totalCapacidade * 4}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                vagas por mês (aproximado)
              </div>
            </div>
          </div>
        </div>
      </div>

      
<HorarioModal
  isOpen={showHorarioModal}
  onClose={() => {
    setShowHorarioModal(false);
    setEditingHorario(null);
  }}
  onSave={salvarHorario}
  horario={editingHorario}
  dia={diaSelecionado}
  unidade={unidadeAtual?.nome}
/>
    </div>
  );
});
// Modal de Configuração de Horário - VERSÃO COM OPÇÃO SEM LIMITE
const HorarioModal = memo(({ isOpen, onClose, onSave, horario, dia, unidade }) => {
  const [formData, setFormData] = useState({
    horario: '17:00',
    maxAlunos: 8,
    semLimite: false, // 🆕 Nova opção
    observacoes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (horario) {
      setFormData({
        horario: horario.horario || '17:00',
        maxAlunos: horario.maxAlunos || 8,
        semLimite: horario.semLimite || false, // 🆕 Carregar opção salva
        observacoes: horario.observacoes || ''
      });
    } else {
      setFormData({
        horario: '17:00',
        maxAlunos: 8,
        semLimite: false, // 🆕 Padrão é com limite
        observacoes: ''
      });
    }
    setErrors({});
  }, [horario, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.horario) {
      newErrors.horario = 'Horário é obrigatório';
    }
    
    // 🆕 Só valida maxAlunos se NÃO for sem limite
    if (!formData.semLimite && (formData.maxAlunos < 1 || formData.maxAlunos > 50)) {
      newErrors.maxAlunos = 'Máximo de alunos deve estar entre 1 e 50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      // 🆕 Se for sem limite, enviar maxAlunos como null
      const dadosParaSalvar = {
        ...formData,
        maxAlunos: formData.semLimite ? null : formData.maxAlunos
      };
      onSave(dadosParaSalvar);
    }
  }, [formData, validateForm, onSave]);

  // 🆕 Handler para toggle da opção sem limite
  const handleSemLimiteChange = useCallback((checked) => {
    setFormData(prev => ({
      ...prev,
      semLimite: checked,
      // Se marcou sem limite, setar um valor padrão para maxAlunos (caso desmarcque depois)
      maxAlunos: checked ? 8 : prev.maxAlunos
    }));
  }, []);

  const diasNomes = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${horario ? 'Editar' : 'Novo'} Horário - ${diasNomes[dia]}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📍 <strong>Unidade:</strong> {unidade} • <strong>Dia:</strong> {diasNomes[dia]}
          </p>
        </div>

        {/* 🆕 Grid responsivo que se adapta baseado na opção sem limite */}
        <div className={`grid gap-4 ${formData.semLimite ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          <Input
            label="⏰ Horário"
            type="time"
            required
            value={formData.horario}
            onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
            error={errors.horario}
          />
          
          {/* 🆕 Campo de máximo só aparece se NÃO for sem limite */}
          {!formData.semLimite && (
            <Input
              label="👥 Máximo de Alunos"
              type="number"
              required
              value={formData.maxAlunos}
              onChange={(e) => setFormData(prev => ({ ...prev, maxAlunos: parseInt(e.target.value) }))}
              error={errors.maxAlunos}
              min="1"
              max="50"
            />
          )}
        </div>

        {/* 🆕 Checkbox para aulas sem limite */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.semLimite}
              onChange={(e) => handleSemLimiteChange(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-green-800 dark:text-green-300">
                🚀 Aula sem limite de alunos
              </div>
              <div className="text-xs text-green-700 dark:text-green-400">
                Marque esta opção para aulas abertas, como eventos especiais ou treinos livres
              </div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            📝 Observações (Opcional)
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            placeholder={formData.semLimite 
              ? "Ex: Treino livre, evento especial, aula experimental..." 
              : "Ex: Aula focada em iniciantes, treino avançado, equipamentos específicos..."
            }
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* 🆕 Preview do horário atualizado */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            👁️ Preview do Horário:
          </h4>
          <div className="bg-white dark:bg-gray-800 p-3 rounded border">
            <div className="font-semibold text-blue-600 text-lg">
              {formData.horario} - {diasNomes[dia]}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formData.semLimite ? (
                <span className="flex items-center">
                  <span className="text-green-600 font-medium">🚀 SEM LIMITE DE ALUNOS</span>
                  <span className="ml-2">• Professor definido na hora da aula</span>
                </span>
              ) : (
                <span>Capacidade: {formData.maxAlunos} alunos • Professor definido na hora da aula</span>
              )}
            </div>
            {formData.observacoes && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                "{formData.observacoes}"
              </div>
            )}
          </div>
        </div>

        {/* 🆕 Dica contextual baseada na opção escolhida */}
        <div className={`p-3 rounded-lg ${
          formData.semLimite 
            ? 'bg-orange-50 dark:bg-orange-900/20' 
            : 'bg-blue-50 dark:bg-blue-900/20'
        }`}>
          <p className={`text-sm ${
            formData.semLimite 
              ? 'text-orange-800 dark:text-orange-300' 
              : 'text-blue-800 dark:text-blue-300'
          }`}>
            {formData.semLimite ? (
              <>
                🎯 <strong>Aula Ilimitada:</strong> Ideal para eventos especiais, treinos livres ou workshops. 
                Monitore a presença para garantir a qualidade do treino.
              </>
            ) : (
              <>
                💡 <strong>Aula com Limite:</strong> Garante atenção personalizada e melhor controle da qualidade do ensino.
              </>
            )}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            leftIcon={<Save size={16} />}
          >
            {horario ? 'Atualizar' : 'Adicionar'} Horário
          </Button>
        </div>
      </form>
    </Modal>
  );
});
// Componente de Gestão de Planos - VERSÃO PROFISSIONAL E ORGANIZADA
const PlanosOrganizados = memo(({ planos, setPlanos, unidades, addNotification }) => {
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades.length > 0 ? unidades[0].nome : 'Centro');
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [editingPlano, setEditingPlano] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'

  // Filtrar planos pela unidade selecionada
  const planosExibidos = useMemo(() => {
    return planos.filter(plano => plano.unidade === unidadeSelecionada);
  }, [planos, unidadeSelecionada]);

  // Estatísticas por unidade
  const estatisticasUnidade = useMemo(() => {
    const totalPlanos = planosExibidos.length;
    const menorValor = planosExibidos.length > 0 ? Math.min(...planosExibidos.map(p => p.preco)) : 0;
    const maiorValor = planosExibidos.length > 0 ? Math.max(...planosExibidos.map(p => p.preco)) : 0;
    const valorMedio = planosExibidos.length > 0 ? 
      planosExibidos.reduce((acc, p) => acc + p.preco, 0) / planosExibidos.length : 0;

    return {
      totalPlanos,
      menorValor,
      maiorValor,
      valorMedio
    };
  }, [planosExibidos]);

  // Comparativo entre unidades
  const comparativoUnidades = useMemo(() => {
    return unidades.map(unidade => {
      const planosUnidade = planos.filter(p => p.unidade === unidade.nome);
      return {
        unidade: unidade.nome,
        totalPlanos: planosUnidade.length,
        menorValor: planosUnidade.length > 0 ? Math.min(...planosUnidade.map(p => p.preco)) : 0,
        maiorValor: planosUnidade.length > 0 ? Math.max(...planosUnidade.map(p => p.preco)) : 0
      };
    });
  }, [planos, unidades]);

  const handleSave = useCallback(async (planoData) => {
    setLoading(true);
    try {
      if (editingPlano) {
        setPlanos(prev => prev.map(p => 
          p.id === editingPlano.id ? { ...p, ...planoData, unidade: unidadeSelecionada } : p
        ));
        addNotification({
          type: 'success',
          title: 'Plano atualizado',
          message: `Plano da unidade ${unidadeSelecionada} atualizado com sucesso`
        });
      } else {
        const novoPlano = {
          id: Date.now(),
          ...planoData,
          unidade: unidadeSelecionada,
          criadoEm: new Date().toISOString(),
          ativo: true
        };
        setPlanos(prev => [...prev, novoPlano]);
        addNotification({
          type: 'success',
          title: 'Plano criado',
          message: `Novo plano adicionado para a unidade ${unidadeSelecionada}`
        });
      }
      setShowPlanoModal(false);
      setEditingPlano(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar plano'
      });
    } finally {
      setLoading(false);
    }
  }, [editingPlano, setPlanos, addNotification, unidadeSelecionada]);

  const handleDelete = useCallback((planoId) => {
    const plano = planos.find(p => p.id === planoId);
    if (window.confirm(`Tem certeza que deseja excluir o plano "${plano.nome}"?`)) {
      setPlanos(prev => prev.filter(p => p.id !== planoId));
      addNotification({
        type: 'success',
        title: 'Plano excluído',
        message: 'Plano removido com sucesso'
      });
    }
  }, [setPlanos, addNotification, planos]);

  const duplicarPlano = useCallback((planoOriginal) => {
    const novoPlano = {
      ...planoOriginal,
      id: Date.now(),
      nome: `${planoOriginal.nome} (Cópia)`,
      criadoEm: new Date().toISOString()
    };
    setPlanos(prev => [...prev, novoPlano]);
    addNotification({
      type: 'success',
      title: 'Plano duplicado',
      message: 'Plano copiado com sucesso'
    });
  }, [setPlanos, addNotification]);

  const exportarPlanos = useCallback(() => {
    const dadosExport = planosExibidos.map(plano => ({
      Nome: plano.nome,
      Preço: `R$ ${plano.preco.toFixed(2)}`,
      Unidade: plano.unidade,
      'Criado em': new Date(plano.criadoEm || Date.now()).toLocaleDateString('pt-BR')
    }));

    const csv = [
      Object.keys(dadosExport[0]).join(','),
      ...dadosExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planos-${unidadeSelecionada}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    addNotification({
      type: 'success',
      title: 'Dados exportados',
      message: 'Planilha baixada com sucesso'
    });
  }, [planosExibidos, unidadeSelecionada, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">💰 Gerenciar Planos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure os planos e preços para cada unidade
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de unidade */}
          <select
            value={unidadeSelecionada}
            onChange={(e) => setUnidadeSelecionada(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {unidades.map(unidade => (
              <option key={unidade.id} value={unidade.nome}>{unidade.nome}</option>
            ))}
          </select>

          {/* Toggle de visualização */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <Package size={16} className="inline mr-1" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <BarChart size={16} className="inline mr-1" />
              Tabela
            </button>
          </div>

          {/* Botões de ação */}
          <Button
            onClick={exportarPlanos}
            variant="secondary"
            size="sm"
            leftIcon={<Download size={16} />}
            disabled={planosExibidos.length === 0}
          >
            Exportar
          </Button>

          <Button
            onClick={() => {
              setEditingPlano(null);
              setShowPlanoModal(true);
            }}
            leftIcon={<Plus size={16} />}
            size="sm"
          >
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Estatísticas da unidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600">{estatisticasUnidade.totalPlanos}</div>
          <div className="text-sm text-blue-800 dark:text-blue-300">Planos em {unidadeSelecionada}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600">
            R$ {estatisticasUnidade.menorValor.toFixed(2)}
          </div>
          <div className="text-sm text-green-800 dark:text-green-300">Menor Valor</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600">
            R$ {estatisticasUnidade.maiorValor.toFixed(2)}
          </div>
          <div className="text-sm text-purple-800 dark:text-purple-300">Maior Valor</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600">
            R$ {estatisticasUnidade.valorMedio.toFixed(2)}
          </div>
          <div className="text-sm text-orange-800 dark:text-orange-300">Valor Médio</div>
        </div>
      </div>

      {/* Conteúdo principal */}
      {planosExibidos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Nenhum plano encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            A unidade {unidadeSelecionada} ainda não possui planos cadastrados.
          </p>
          <Button
            onClick={() => {
              setEditingPlano(null);
              setShowPlanoModal(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Criar Primeiro Plano
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visualização em Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planosExibidos.map(plano => (
            <div key={plano.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              {/* Header do card */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {plano.nome}
                    </h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {plano.unidade}
                    </span>
                  </div>
                  
                  {/* Menu de ações */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicarPlano(plano)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Duplicar plano"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPlano(plano);
                        setShowPlanoModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Editar plano"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(plano.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir plano"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Preço destacado */}
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    R$ {plano.preco.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">por mês</div>
                </div>
              </div>

              {/* Footer do card */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Criado em:</span>
                  <span>{new Date(plano.criadoEm || Date.now()).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Visualização em Tabela */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {planosExibidos.map(plano => (
                  <tr key={plano.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {plano.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        R$ {plano.preco.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                        {plano.unidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(plano.criadoEm || Date.now()).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => duplicarPlano(plano)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Duplicar"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPlano(plano);
                            setShowPlanoModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(plano.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Excluir"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparativo entre unidades */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          📊 Comparativo entre Unidades
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparativoUnidades.map(comp => (
            <div key={comp.unidade} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {comp.unidade}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Planos:</span>
                  <span className="font-medium">{comp.totalPlanos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Menor:</span>
                  <span className="font-medium text-green-600">R$ {comp.menorValor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Maior:</span>
                  <span className="font-medium text-purple-600">R$ {comp.maiorValor.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <PlanoModalMelhorado
        isOpen={showPlanoModal}
        onClose={() => {
          setShowPlanoModal(false);
          setEditingPlano(null);
        }}
        onSave={handleSave}
        plano={editingPlano}
        loading={loading}
        unidade={unidadeSelecionada}
      />
    </div>
  );
});
// Modal de Plano Melhorado
const PlanoModalMelhorado = memo(({ isOpen, onClose, onSave, plano, loading, unidade }) => {
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    descricao: '',
    frequencia: '2x/semana',
    beneficios: [],
    cor: '#3b82f6'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plano) {
      setFormData({
        nome: plano.nome || '',
        preco: plano.preco || '',
        descricao: plano.descricao || '',
        frequencia: plano.frequencia || '2x/semana',
        beneficios: plano.beneficios || [],
        cor: plano.cor || '#3b82f6'
      });
    } else {
      setFormData({
        nome: '',
        preco: '',
        descricao: '',
        frequencia: '2x/semana',
        beneficios: [],
        cor: '#3b82f6'
      });
    }
    setErrors({});
  }, [plano, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.preco || formData.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave({ ...formData, preco: parseFloat(formData.preco) });
    }
  }, [formData, validateForm, onSave]);

  const adicionarBeneficio = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      beneficios: [...prev.beneficios, '']
    }));
  }, []);

  const removerBeneficio = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  }, []);

  const atualizarBeneficio = useCallback((index, valor) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.map((b, i) => i === index ? valor : b)
    }));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${plano ? 'Editar' : 'Novo'} Plano - ${unidade}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📍 <strong>Unidade:</strong> {unidade}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Plano"
            required
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            error={errors.nome}
            placeholder="Ex: Plano Básico, Premium..."
          />
          
          <Input
            label="Preço Mensal (R$)"
            type="number"
            required
            value={formData.preco}
            onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
            error={errors.preco}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Frequência
            </label>
            <select
              value={formData.frequencia}
              onChange={(e) => setFormData(prev => ({ ...prev, frequencia: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="1x/semana">1x por semana</option>
              <option value="2x/semana">2x por semana</option>
              <option value="3x/semana">3x por semana</option>
              <option value="Livre">Acesso livre</option>
              <option value="Personalizado">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Cor do Plano
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                className="w-12 h-12 rounded border border-gray-300"
              />
              <Input
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            placeholder="Descreva os detalhes do plano..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* Benefícios */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Benefícios do Plano
            </label>
            <button
              type="button"
              onClick={adicionarBeneficio}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {formData.beneficios.map((beneficio, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={beneficio}
                  onChange={(e) => atualizarBeneficio(index, e.target.value)}
                  placeholder={`Benefício ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removerBeneficio(index)}
                  className="px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview do plano */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            👁️ Preview do Plano:
          </h4>
          <div 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4"
            style={{ borderLeftColor: formData.cor }}
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-semibold text-lg" style={{ color: formData.cor }}>
                {formData.nome || 'Nome do Plano'}
              </h5>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  R$ {formData.preco || '0,00'}
                </div>
                <div className="text-sm text-gray-500">/mês</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {formData.frequencia} • {unidade}
            </div>
            {formData.descricao && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {formData.descricao}
              </p>
            )}
            {formData.beneficios.length > 0 && (
              <ul className="text-sm space-y-1">
                {formData.beneficios.filter(b => b.trim()).map((beneficio, index) => (
                  <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mr-2">✓</span>
                    {beneficio}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {plano ? 'Atualizar' : 'Criar'} Plano
          </Button>
        </div>
      </form>
    </Modal>
  );
});
// Componente de Gestão de Plataformas - VERSÃO PROFISSIONAL E ORGANIZADA
const PlataformasOrganizadas = memo(({ plataformas, setPlataformas, unidades, addNotification }) => {
  const [unidadeSelecionada, setUnidadeSelecionada] = useState(unidades.length > 0 ? unidades[0].nome : 'Centro');
  const [showPlataformaModal, setShowPlataformaModal] = useState(false);
  const [editingPlataforma, setEditingPlataforma] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'

  // Filtrar plataformas pela unidade selecionada
  const plataformasExibidas = useMemo(() => {
    return plataformas.filter(plataforma => plataforma.unidade === unidadeSelecionada);
  }, [plataformas, unidadeSelecionada]);

  // Estatísticas por unidade
  const estatisticasUnidade = useMemo(() => {
    const totalPlataformas = plataformasExibidas.length;
    const plataformasAtivas = plataformasExibidas.filter(p => p.ativo);
    const menorValor = plataformasExibidas.length > 0 ? Math.min(...plataformasExibidas.map(p => p.valorPorAluno)) : 0;
    const maiorValor = plataformasExibidas.length > 0 ? Math.max(...plataformasExibidas.map(p => p.valorPorAluno)) : 0;
    const valorMedio = plataformasExibidas.length > 0 ? 
      plataformasExibidas.reduce((acc, p) => acc + p.valorPorAluno, 0) / plataformasExibidas.length : 0;

    return {
      totalPlataformas,
      plataformasAtivas: plataformasAtivas.length,
      menorValor,
      maiorValor,
      valorMedio
    };
  }, [plataformasExibidas]);

  // Comparativo entre unidades
  const comparativoUnidades = useMemo(() => {
    return unidades.map(unidade => {
      const plataformasUnidade = plataformas.filter(p => p.unidade === unidade.nome);
      const plataformasAtivasUnidade = plataformasUnidade.filter(p => p.ativo);
      return {
        unidade: unidade.nome,
        totalPlataformas: plataformasUnidade.length,
        plataformasAtivas: plataformasAtivasUnidade.length,
        menorValor: plataformasUnidade.length > 0 ? Math.min(...plataformasUnidade.map(p => p.valorPorAluno)) : 0,
        maiorValor: plataformasUnidade.length > 0 ? Math.max(...plataformasUnidade.map(p => p.valorPorAluno)) : 0
      };
    });
  }, [plataformas, unidades]);

  // Plataformas mais comuns (para sugestões)
  const plataformasComuns = [
    { nome: 'Wellhub (Gympass)', icon: '🏋️', cor: '#00D4AA' },
    { nome: 'TotalPass', icon: '🎯', cor: '#FF6B35' },
    { nome: 'Gympass', icon: '💪', cor: '#6C5CE7' },
    { nome: 'Vivo Melon', icon: '🍈', cor: '#A29BFE' },
    { nome: 'Sesc', icon: '🏛️', cor: '#00B894' },
    { nome: 'Ticket Flex', icon: '🎫', cor: '#FDCB6E' }
  ];

  const handleSave = useCallback(async (plataformaData) => {
    setLoading(true);
    try {
      if (editingPlataforma) {
        setPlataformas(prev => prev.map(p => 
          p.id === editingPlataforma.id ? { ...p, ...plataformaData, unidade: unidadeSelecionada } : p
        ));
        addNotification({
          type: 'success',
          title: 'Plataforma atualizada',
          message: `Plataforma da unidade ${unidadeSelecionada} atualizada com sucesso`
        });
      } else {
        const novaPlataforma = {
          id: Date.now(),
          ...plataformaData,
          unidade: unidadeSelecionada,
          criadaEm: new Date().toISOString(),
          ativo: true
        };
        setPlataformas(prev => [...prev, novaPlataforma]);
        addNotification({
          type: 'success',
          title: 'Plataforma criada',
          message: `Nova plataforma adicionada para a unidade ${unidadeSelecionada}`
        });
      }
      setShowPlataformaModal(false);
      setEditingPlataforma(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar plataforma'
      });
    } finally {
      setLoading(false);
    }
  }, [editingPlataforma, setPlataformas, addNotification, unidadeSelecionada]);

  const handleDelete = useCallback((plataformaId) => {
    const plataforma = plataformas.find(p => p.id === plataformaId);
    if (window.confirm(`Tem certeza que deseja excluir "${plataforma.nome}" da unidade ${unidadeSelecionada}?`)) {
      setPlataformas(prev => prev.filter(p => p.id !== plataformaId));
      addNotification({
        type: 'success',
        title: 'Plataforma excluída',
        message: 'Plataforma removida com sucesso'
      });
    }
  }, [setPlataformas, addNotification, plataformas, unidadeSelecionada]);

  const toggleStatus = useCallback((plataformaId) => {
    setPlataformas(prev => prev.map(p => 
      p.id === plataformaId ? { ...p, ativo: !p.ativo } : p
    ));
    addNotification({
      type: 'success',
      title: 'Status atualizado',
      message: 'Status da plataforma alterado'
    });
  }, [setPlataformas, addNotification]);

  const duplicarPlataforma = useCallback((plataformaOriginal) => {
    const novaPlataforma = {
      ...plataformaOriginal,
      id: Date.now(),
      nome: `${plataformaOriginal.nome} (Cópia)`,
      criadaEm: new Date().toISOString()
    };
    setPlataformas(prev => [...prev, novaPlataforma]);
    addNotification({
      type: 'success',
      title: 'Plataforma duplicada',
      message: 'Plataforma copiada com sucesso'
    });
  }, [setPlataformas, addNotification]);

  const adicionarPlataformaComum = useCallback((plataformaComum) => {
    const jaExiste = plataformasExibidas.find(p => p.nome === plataformaComum.nome);
    if (jaExiste) {
      addNotification({
        type: 'warning',
        title: 'Plataforma já existe',
        message: `${plataformaComum.nome} já está cadastrada nesta unidade`
      });
      return;
    }

    const novaPlataforma = {
      id: Date.now(),
      nome: plataformaComum.nome,
      valorPorAluno: 45.00, // Valor padrão
      unidade: unidadeSelecionada,
      cor: plataformaComum.cor,
      icon: plataformaComum.icon,
      criadaEm: new Date().toISOString(),
      ativo: true
    };

    setPlataformas(prev => [...prev, novaPlataforma]);
    addNotification({
      type: 'success',
      title: 'Plataforma adicionada',
      message: `${plataformaComum.nome} foi adicionada. Configure o valor.`
    });
  }, [plataformasExibidas, setPlataformas, addNotification, unidadeSelecionada]);

  const exportarPlataformas = useCallback(() => {
    const dadosExport = plataformasExibidas.map(plataforma => ({
      Nome: plataforma.nome,
      'Valor por Aluno': `R$ ${plataforma.valorPorAluno.toFixed(2)}`,
      Unidade: plataforma.unidade,
      Status: plataforma.ativo ? 'Ativa' : 'Inativa',
      'Criada em': new Date(plataforma.criadaEm || Date.now()).toLocaleDateString('pt-BR')
    }));

    const csv = [
      Object.keys(dadosExport[0]).join(','),
      ...dadosExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plataformas-${unidadeSelecionada}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    addNotification({
      type: 'success',
      title: 'Dados exportados',
      message: 'Planilha baixada com sucesso'
    });
  }, [plataformasExibidas, unidadeSelecionada, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">🤝 Plataformas Parceiras</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure as plataformas parceiras e valores por unidade
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de unidade */}
          <select
            value={unidadeSelecionada}
            onChange={(e) => setUnidadeSelecionada(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {unidades.map(unidade => (
              <option key={unidade.id} value={unidade.nome}>{unidade.nome}</option>
            ))}
          </select>

          {/* Toggle de visualização */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <Settings size={16} className="inline mr-1" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'table' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <BarChart size={16} className="inline mr-1" />
              Tabela
            </button>
          </div>

          {/* Botões de ação */}
          <Button
            onClick={exportarPlataformas}
            variant="secondary"
            size="sm"
            leftIcon={<Download size={16} />}
            disabled={plataformasExibidas.length === 0}
          >
            Exportar
          </Button>

          <Button
            onClick={() => {
              setEditingPlataforma(null);
              setShowPlataformaModal(true);
            }}
            leftIcon={<Plus size={16} />}
            size="sm"
          >
            Nova Plataforma
          </Button>
        </div>
      </div>

      {/* Estatísticas da unidade */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600">{estatisticasUnidade.totalPlataformas}</div>
          <div className="text-sm text-purple-800 dark:text-purple-300">Plataformas em {unidadeSelecionada}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600">{estatisticasUnidade.plataformasAtivas}</div>
          <div className="text-sm text-green-800 dark:text-green-300">Ativas</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600">
            R$ {estatisticasUnidade.menorValor.toFixed(2)}
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-300">Menor Valor</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600">
            R$ {estatisticasUnidade.valorMedio.toFixed(2)}
          </div>
          <div className="text-sm text-orange-800 dark:text-orange-300">Valor Médio</div>
        </div>
      </div>

      {/* Plataformas comuns para adicionar rapidamente */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
        <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
          🚀 Adicionar Plataformas Comuns
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {plataformasComuns.map(plataforma => {
            const jaExiste = plataformasExibidas.find(p => p.nome === plataforma.nome);
            return (
              <button
                key={plataforma.nome}
                onClick={() => adicionarPlataformaComum(plataforma)}
                disabled={jaExiste}
                className={`p-3 rounded-lg border transition-all text-center ${
                  jaExiste 
                    ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md'
                }`}
                style={{ 
                  borderColor: jaExiste ? undefined : plataforma.cor + '40',
                  backgroundColor: jaExiste ? undefined : plataforma.cor + '08'
                }}
              >
                <div className="text-2xl mb-1">{plataforma.icon}</div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {plataforma.nome}
                </div>
                {jaExiste && (
                  <div className="text-xs text-gray-500 mt-1">✓ Já existe</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo principal */}
      {plataformasExibidas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Settings className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Nenhuma plataforma encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            A unidade {unidadeSelecionada} ainda não possui plataformas cadastradas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setEditingPlataforma(null);
                setShowPlataformaModal(true);
              }}
              leftIcon={<Plus size={16} />}
            >
              Criar Plataforma Personalizada
            </Button>
            <Button
              onClick={() => adicionarPlataformaComum(plataformasComuns[0])}
              variant="secondary"
              leftIcon={<Zap size={16} />}
            >
              Adicionar Wellhub
            </Button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visualização em Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plataformasExibidas.map(plataforma => (
            <div 
              key={plataforma.id} 
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                plataforma.ativo 
                  ? 'border-purple-200 dark:border-purple-700' 
                  : 'border-gray-200 dark:border-gray-600 opacity-75'
              }`}
            >
              {/* Header do card */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: plataforma.cor + '20', color: plataforma.cor }}
                      >
                        {plataforma.icon || '🤝'}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                          {plataforma.nome}
                        </h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          {plataforma.unidade}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu de ações */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStatus(plataforma.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        plataforma.ativo 
                          ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                          : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      title={plataforma.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {plataforma.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => duplicarPlataforma(plataforma)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Duplicar plataforma"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPlataforma(plataforma);
                        setShowPlataformaModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Editar plataforma"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(plataforma.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir plataforma"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Valor destacado */}
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    R$ {plataforma.valorPorAluno.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">por aluno/aula</div>
                </div>

                {/* Status badge */}
                <div className="text-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    plataforma.ativo 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {plataforma.ativo ? '✓ Ativa' : '○ Inativa'}
                  </span>
                </div>
              </div>

              {/* Footer do card */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Criada em:</span>
                  <span>{new Date(plataforma.criadaEm || Date.now()).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Visualização em Tabela */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plataforma
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor/Aluno
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Criada em
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {plataformasExibidas.map(plataforma => (
                  <tr key={plataforma.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3"
                          style={{ backgroundColor: plataforma.cor + '20', color: plataforma.cor }}
                        >
                          {plataforma.icon || '🤝'}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {plataforma.nome}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        R$ {plataforma.valorPorAluno.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        plataforma.ativo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {plataforma.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 rounded-full">
                        {plataforma.unidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(plataforma.criadaEm || Date.now()).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(plataforma.id)}
                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                          title={plataforma.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {plataforma.ativo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => duplicarPlataforma(plataforma)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Duplicar"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPlataforma(plataforma);
                            setShowPlataformaModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(plataforma.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Excluir"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparativo entre unidades */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          📊 Comparativo entre Unidades
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparativoUnidades.map(comp => (
            <div key={comp.unidade} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {comp.unidade}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-medium">{comp.totalPlataformas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ativas:</span>
                  <span className="font-medium text-green-600">{comp.plataformasAtivas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Menor:</span>
                  <span className="font-medium text-blue-600">R$ {comp.menorValor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Maior:</span>
                  <span className="font-medium text-purple-600">R$ {comp.maiorValor.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <PlataformaModalMelhorada
        isOpen={showPlataformaModal}
        onClose={() => {
          setShowPlataformaModal(false);
          setEditingPlataforma(null);
        }}
        onSave={handleSave}
        plataforma={editingPlataforma}
        loading={loading}
        unidade={unidadeSelecionada}
        plataformasComuns={plataformasComuns}
      />
    </div>
  );
});
// Modal de Plataforma Melhorado
const PlataformaModalMelhorada = memo(({ isOpen, onClose, onSave, plataforma, loading, unidade, plataformasComuns }) => {
  const [formData, setFormData] = useState({
    nome: '',
    valorPorAluno: '',
    descricao: '',
    cor: '#8b5cf6',
    icon: '🤝',
    ativo: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plataforma) {
      setFormData({
        nome: plataforma.nome || '',
        valorPorAluno: plataforma.valorPorAluno || '',
        descricao: plataforma.descricao || '',
        cor: plataforma.cor || '#8b5cf6',
        icon: plataforma.icon || '🤝',
        ativo: plataforma.ativo !== undefined ? plataforma.ativo : true
      });
    } else {
      setFormData({
        nome: '',
        valorPorAluno: '',
        descricao: '',
        cor: '#8b5cf6',
        icon: '🤝',
        ativo: true
      });
    }
    setErrors({});
  }, [plataforma, isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da plataforma é obrigatório';
    }
    
    if (!formData.valorPorAluno || formData.valorPorAluno <= 0) {
      newErrors.valorPorAluno = 'Valor deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave({ ...formData, valorPorAluno: parseFloat(formData.valorPorAluno) });
    }
  }, [formData, validateForm, onSave]);

  const selecionarPlataformaComum = useCallback((plataformaComum) => {
    setFormData(prev => ({
      ...prev,
      nome: plataformaComum.nome,
      cor: plataformaComum.cor,
      icon: plataformaComum.icon
    }));
  }, []);

  const icones = ['🤝', '🏋️', '🎯', '💪', '🍈', '🏛️', '🎫', '⚡', '🌟', '🚀', '💎', '🏆'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${plataforma ? 'Editar' : 'Nova'} Plataforma - ${unidade}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            📍 <strong>Unidade:</strong> {unidade}
          </p>
        </div>

        {/* Seleção rápida de plataformas comuns */}
        {!plataforma && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              🚀 Plataformas Comuns (clique para selecionar)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {plataformasComuns.map(plataformaNome => (
                <button
                  key={plataformaNome.nome}
                  type="button"
                  onClick={() => selecionarPlataformaComum(plataformaNome)}
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors text-center"
                  style={{ 
                    borderColor: formData.nome === plataformaNome.nome ? plataformaNome.cor : undefined,
                    backgroundColor: formData.nome === plataformaNome.nome ? plataformaNome.cor + '10' : undefined
                  }}
                >
                  <div className="text-xl mb-1">{plataformaNome.icon}</div>
                  <div className="text-xs font-medium">{plataformaNome.nome}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome da Plataforma"
            required
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            error={errors.nome}
            placeholder="Ex: Wellhub, TotalPass..."
          />
          
          <Input
            label={`Valor por Aluno/Aula - ${unidade} (R$)`}
            type="number"
            required
            value={formData.valorPorAluno}
            onChange={(e) => setFormData(prev => ({ ...prev, valorPorAluno: e.target.value }))}
            error={errors.valorPorAluno}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ícone da Plataforma
            </label>
            <div className="grid grid-cols-6 gap-2">
              {icones.map(icone => (
                <button
                  key={icone}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: icone }))}
                  className={`p-2 rounded border-2 transition-colors ${
                    formData.icon === icone 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                  }`}
                >
                  <span className="text-xl">{icone}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Cor da Plataforma
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                className="w-12 h-12 rounded border border-gray-300"
              />
              <Input
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                placeholder="#8b5cf6"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            placeholder="Descreva detalhes da parceria, condições especiais..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="mr-3"
            />
            <span className="text-sm font-medium">Plataforma ativa nesta unidade</span>
          </label>
        </div>

        {/* Preview da plataforma */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            👁️ Preview da Plataforma:
          </h4>
          <div 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 flex items-center gap-4"
            style={{ borderLeftColor: formData.cor }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: formData.cor + '20', color: formData.cor }}
            >
              {formData.icon}
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-lg" style={{ color: formData.cor }}>
                {formData.nome || 'Nome da Plataforma'}
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                R$ {formData.valorPorAluno || '0,00'} por aluno/aula • {unidade}
              </div>
              {formData.descricao && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.descricao}
                </p>
              )}
            </div>
            <div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                formData.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {formData.ativo ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {plataforma ? 'Atualizar' : 'Criar'} Plataforma
          </Button>
        </div>
      </form>
    </Modal>
  );
});
// Página de Configurações do CT - VERSÃO COMPLETA E ORGANIZADA
const ConfiguracoesPage = memo(() => {
  const { addNotification } = useNotifications();
  const { 
    unidades, setUnidades, 
    planos, setPlanos, 
    plataformas, setPlataformas, 
    horariosConfiguracao, setHorariosConfiguracao,
    professores 
  } = useAppState();
  
  const [configs, setConfigs] = useLocalStorage('configuracoes-ct-usuario', {
    nomeCT: 'Meu CT de Futevôlei',
    logoCT: '',
    slogan: 'Venha treinar conosco!',
    
    cores: {
      primaria: '#3b82f6',
      secundaria: '#8b5cf6'
    },
    contato: {
      telefone: '(21) 99999-9999',
      email: 'contato@meuct.com',
      site: 'www.meuct.com',
      endereco: 'Praia de Copacabana, Rio de Janeiro - RJ'
    },
    social: {
      instagram: '@meuct',
      facebook: 'MeuCT',
      whatsapp: '5521999999999'
    },
    funcionamento: {
      horarioInicio: '06:00',
      horarioFim: '20:00',
      diasFuncionamento: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
    }, 
    modeloNegocio: {
      tipo: 'proprio_aluga', // pode ser 'paga_aluguel', 'proprio_aluga', 'proprio_nao_aluga'
      valorAluguelPago: 5000,
      valorAluguelQuadraHora: 100,
      quantidadeQuadras: 3
    }
    
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(configs);
  const [previewLogo, setPreviewLogo] = useState('');
  const [activeTab, setActiveTab] = useState('geral');
  
  // Estados para modais das seções
  const [showUnidadeModal, setShowUnidadeModal] = useState(false);
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [showPlataformaModal, setShowPlataformaModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(configs);
    setPreviewLogo(configs.logoCT);
  }, [configs]);

  const handleSave = useCallback(() => {
    setConfigs(formData);
    setEditMode(false);
    addNotification({
      type: 'success',
      title: 'Configurações salvas',
      message: 'As configurações do seu CT foram atualizadas com sucesso!'
    });
  }, [formData, setConfigs, addNotification]);

  const handleCancel = useCallback(() => {
    setFormData(configs);
    setPreviewLogo(configs.logoCT);
    setEditMode(false);
  }, [configs]);

  const handleLogoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: 'error',
          title: 'Arquivo inválido',
          message: 'Por favor, selecione apenas imagens'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: 'error',
          title: 'Arquivo muito grande',
          message: 'A imagem deve ter no máximo 5MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        setPreviewLogo(result);
        setFormData(prev => ({ ...prev, logoCT: result }));
      };
      reader.readAsDataURL(file);
    }
  }, [addNotification]);

  const handleLogoUrl = useCallback((url) => {
    setPreviewLogo(url);
    setFormData(prev => ({ ...prev, logoCT: url }));
  }, []);

  // 🆕 Handlers para as seções integradas
  const handleSaveUnidade = useCallback(async (unidadeData) => {
    setLoading(true);
    try {
      if (editingItem) {
        setUnidades(prev => prev.map(u => 
          u.id === editingItem.id ? { ...u, ...unidadeData } : u
        ));
        addNotification({
          type: 'success',
          title: 'Unidade atualizada',
          message: 'Dados atualizados com sucesso'
        });
      } else {
        const novaUnidade = {
          id: Date.now(),
          ...unidadeData,
          ativo: true
        };
        setUnidades(prev => [...prev, novaUnidade]);
        addNotification({
          type: 'success',
          title: 'Unidade criada',
          message: 'Nova unidade adicionada com sucesso'
        });
      }
      setShowUnidadeModal(false);
      setEditingItem(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar unidade'
      });
    } finally {
      setLoading(false);
    }
  }, [editingItem, setUnidades, addNotification]);

  const handleSavePlano = useCallback(async (planoData) => {
    setLoading(true);
    try {
      if (editingItem) {
        setPlanos(prev => prev.map(p => 
          p.id === editingItem.id ? { ...p, ...planoData } : p
        ));
        addNotification({
          type: 'success',
          title: 'Plano atualizado',
          message: 'Plano atualizado com sucesso'
        });
      } else {
        const novoPlano = {
          id: Date.now(),
          ...planoData
        };
        setPlanos(prev => [...prev, novoPlano]);
        addNotification({
          type: 'success',
          title: 'Plano criado',
          message: 'Novo plano adicionado com sucesso'
        });
      }
      setShowPlanoModal(false);
      setEditingItem(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar plano'
      });
    } finally {
      setLoading(false);
    }
  }, [editingItem, setPlanos, addNotification]);

  const handleSavePlataforma = useCallback(async (plataformaData) => {
    setLoading(true);
    try {
      if (editingItem) {
        setPlataformas(prev => prev.map(p => 
          p.id === editingItem.id ? { ...p, ...plataformaData } : p
        ));
        addNotification({
          type: 'success',
          title: 'Plataforma atualizada',
          message: 'Plataforma atualizada com sucesso'
        });
      } else {
        const novaPlataforma = {
          id: Date.now(),
          ...plataformaData,
          ativo: true
        };
        setPlataformas(prev => [...prev, novaPlataforma]);
        addNotification({
          type: 'success',
          title: 'Plataforma criada',
          message: 'Nova plataforma adicionada com sucesso'
        });
      }
      setShowPlataformaModal(false);
      setEditingItem(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar plataforma'
      });
    } finally {
      setLoading(false);
    }
  }, [editingItem, setPlataformas, addNotification]);

  // 🆕 Definição das abas reorganizadas
  const tabs = [
    { id: 'geral', label: '🏢 Informações Gerais', icon: Building },
    { id: 'modelo', label: '📈 Modelo de Negócio', icon: DollarSign },
    { id: 'unidades', label: '🏪 Unidades', icon: MapPin },
    { id: 'horarios', label: '⏰ Horários', icon: Clock },
    { id: 'planos', label: '💰 Planos', icon: Package },
    { id: 'plataformas', label: '🤝 Plataformas', icon: Settings },
    { id: 'visual', label: '🎨 Visual', icon: Edit3 }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                ⚙️ Configurações do CT
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie todas as configurações do seu centro de treinamento em um só lugar
              </p>
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Central de Controle:</strong> Aqui você configura unidades, horários, planos, plataformas e muito mais.
                </p>
              </div>
            </div>
            
            {!editMode && activeTab === 'geral' ? (
              <Button
                onClick={() => setEditMode(true)}
                leftIcon={<Edit size={16} />}
                variant="secondary"
              >
                Editar Informações
              </Button>
            ) : activeTab === 'geral' && editMode ? (
              <div className="flex space-x-2">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  leftIcon={<Save size={16} />}
                  size="sm"
                >
                  Salvar Alterações
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Aba Informações Gerais */}
            {activeTab === 'geral' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Logo do CT */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">🖼️ Logo do CT</h3>
                    
                    <div className="text-center">
                      {previewLogo ? (
                        <div className="relative mb-4">
                          <img
                            src={previewLogo}
                            alt="Logo do CT"
                            className="w-32 h-32 mx-auto object-contain border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                            onError={() => setPreviewLogo('')}
                          />
                          {editMode && (
                            <button
                              onClick={() => {
                                setPreviewLogo('');
                                setFormData(prev => ({ ...prev, logoCT: '' }));
                              }}
                              className="absolute top-0 right-1/2 transform translate-x-16 -translate-y-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              title="Remover logo"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                          🏐
                        </div>
                      )}

                      {editMode && (
                        <div className="space-y-3">
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                            />
                            <Button
                              variant="secondary"
                              className="w-full cursor-pointer"
                              leftIcon={<Upload size={16} />}
                            >
                              Enviar Logo
                            </Button>
                          </label>
                          
                          <Input
                            label="Ou cole uma URL"
                            type="url"
                            value={formData.logoCT}
                            onChange={(e) => handleLogoUrl(e.target.value)}
                            placeholder="https://exemplo.com/logo.png"
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do CT */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold">📝 Informações Básicas</h3>
                    
                    <Input
                      label="Nome do CT"
                      value={formData.nomeCT}
                      onChange={(e) => setFormData(prev => ({ ...prev, nomeCT: e.target.value }))}
                      disabled={!editMode}
                      placeholder="Ex: CT Praia Dourada"
                    />

                    <Input
                      label="Slogan"
                      value={formData.slogan}
                      onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                      disabled={!editMode}
                      placeholder="Ex: O futevôlei que transforma vidas!"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Telefone Principal"
                        value={formData.contato.telefone}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contato: { ...prev.contato, telefone: e.target.value }
                        }))}
                        disabled={!editMode}
                        placeholder="(21) 99999-9999"
                      />

                      <Input
                        label="Email"
                        type="email"
                        value={formData.contato.email}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          contato: { ...prev.contato, email: e.target.value }
                        }))}
                        disabled={!editMode}
                        placeholder="contato@meuct.com"
                      />
                    </div>

                    {/* Preview Card do CT */}
                    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        📱 Preview do CT
                      </h4>
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg text-white">
                        <div className="flex items-center space-x-3">
                          {previewLogo ? (
                            <img src={previewLogo} alt="Logo CT" className="w-12 h-12 object-contain bg-white/20 rounded-lg p-1" />
                          ) : (
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-lg">🏐</div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold">{formData.nomeCT || 'Nome do CT'}</h3>
                            {formData.slogan && (
                              <p className="text-sm text-blue-100">{formData.slogan}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
             {activeTab === 'modelo' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">📈 Modelo de Negócio e Estrutura</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                  
                  {/* Opções de Modelo de Negócio */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.modeloNegocio?.tipo === 'paga_aluguel' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                      <input type="radio" name="modeloNegocio" value="paga_aluguel" checked={formData.modeloNegocio?.tipo === 'paga_aluguel'} onChange={(e) => setFormData(prev => ({...prev, modeloNegocio: {...prev.modeloNegocio, tipo: e.target.value}}))} className="mt-1"/>
                      <div className="ml-3">
                        <div className="font-medium">Pago Aluguel</div>
                        <p className="text-xs text-gray-500">Meu CT funciona em um espaço alugado.</p>
                      </div>
                    </label>
                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.modeloNegocio?.tipo === 'proprio_aluga' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                      <input type="radio" name="modeloNegocio" value="proprio_aluga" checked={formData.modeloNegocio?.tipo === 'proprio_aluga'} onChange={(e) => setFormData(prev => ({...prev, modeloNegocio: {...prev.modeloNegocio, tipo: e.target.value}}))} className="mt-1"/>
                      <div className="ml-3">
                        <div className="font-medium">Próprio e Alugo Quadras</div>
                        <p className="text-xs text-gray-500">Tenho espaço próprio e alugo quadras para gerar receita extra.</p>
                      </div>
                    </label>
                    <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.modeloNegocio?.tipo === 'proprio_nao_aluga' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                      <input type="radio" name="modeloNegocio" value="proprio_nao_aluga" checked={formData.modeloNegocio?.tipo === 'proprio_nao_aluga'} onChange={(e) => setFormData(prev => ({...prev, modeloNegocio: {...prev.modeloNegocio, tipo: e.target.value}}))} className="mt-1"/>
                      <div className="ml-3">
                        <div className="font-medium">Próprio (Não alugo)</div>
                        <p className="text-xs text-gray-500">Tenho espaço próprio, mas não alugo para terceiros.</p>
                      </div>
                    </label>
                  </div>

                  {/* Inputs Condicionais */}
                  {formData.modeloNegocio?.tipo === 'paga_aluguel' && (
                    <div className="pt-4 border-t">
                      <Input label="Valor Mensal do Aluguel (R$)" type="number" value={formData.modeloNegocio.valorAluguelPago || ''} onChange={(e) => setFormData(prev => ({...prev, modeloNegocio: {...prev.modeloNegocio, valorAluguelPago: parseFloat(e.target.value)}}))} />
                    </div>
                  )}

                  {formData.modeloNegocio?.tipo === 'proprio_aluga' && (
                    <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input label="Valor do Aluguel da Quadra (por hora)" type="number" value={formData.modeloNegocio.valorAluguelQuadraHora || ''} onChange={(e) => setFormData(prev => ({...prev, modeloNegocio: {...prev.modeloNegocio, valorAluguelQuadraHora: parseFloat(e.target.value)}}))} />
                       <Input label="Quantidade de Quadras para Aluguel" type="number" value={formData.modeloNegocio.quantidadeQuadras || ''} onChange={(e) => setFormData(prev => ({...prev, modeloNegocio: {...prev.modeloNegocio, quantidadeQuadras: parseInt(e.target.value)}}))} />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                    <Button onClick={() => {
                        setConfigs(formData);
                        addNotification({type: 'success', title: 'Configurações Salvas!'});
                    }} leftIcon={<Save size={16}/>}>Salvar Modelo de Negócio</Button>
                </div>
              </div>
            )}

            {/* 🆕 Aba Unidades */}
            {activeTab === 'unidades' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">🏪 Gerenciar Unidades</h3>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setShowUnidadeModal(true);
                    }}
                    leftIcon={<Plus size={16} />}
                  >
                    Nova Unidade
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unidades.map(unidade => (
                    <div key={unidade.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold">{unidade.nome}</h4>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setEditingItem(unidade);
                              setShowUnidadeModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
                                setUnidades(prev => prev.filter(u => u.id !== unidade.id));
                                addNotification({
                                  type: 'success',
                                  title: 'Unidade excluída',
                                  message: 'Unidade removida com sucesso'
                                });
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center text-gray-600 dark:text-gray-300">
                          <MapPin className="mr-2" size={16} />
                          {unidade.endereco}
                        </p>
                        {unidade.telefone && (
                          <p className="flex items-center text-gray-600 dark:text-gray-300">
                            <Phone className="mr-2" size={16} />
                            {unidade.telefone}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            unidade.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {unidade.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {/* 🆕 Aba Horários - VERSÃO COMPLETA */}
{activeTab === 'horarios' && (
  <HorariosCompletos 
    horariosConfiguracao={horariosConfiguracao}
    setHorariosConfiguracao={setHorariosConfiguracao}
    unidades={unidades}
    addNotification={addNotification}
  />
)}

            {/* 🆕 Aba Planos - VERSÃO ORGANIZADA E PROFISSIONAL */}
{activeTab === 'planos' && (
  <PlanosOrganizados 
    planos={planos}
    setPlanos={setPlanos}
    unidades={unidades}
    addNotification={addNotification}
  />
)}

            {/* 🆕 Aba Plataformas - VERSÃO ORGANIZADA E PROFISSIONAL */}
{activeTab === 'plataformas' && (
  <PlataformasOrganizadas 
    plataformas={plataformas}
    setPlataformas={setPlataformas}
    unidades={unidades}
    addNotification={addNotification}
  />
)}

            {/* Aba Visual */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">🎨 Personalização Visual</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                      Cor Principal
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.cores.primaria}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cores: { ...prev.cores, primaria: e.target.value }
                        }))}
                        className="w-16 h-16 rounded border border-gray-300"
                      />
                      <div>
                        <Input
                          value={formData.cores.primaria}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            cores: { ...prev.cores, primaria: e.target.value }
                          }))}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                      Cor Secundária
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.cores.secundaria}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cores: { ...prev.cores, secundaria: e.target.value }
                        }))}
                        className="w-16 h-16 rounded border border-gray-300"
                      />
                      <div>
                        <Input
                          value={formData.cores.secundaria}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            cores: { ...prev.cores, secundaria: e.target.value }
                          }))}
                          placeholder="#8b5cf6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    🎨 Preview das Cores
                  </h4>
                  <div className="space-y-3">
                    <div 
                      className="p-4 rounded-lg text-white font-medium"
                      style={{ backgroundColor: formData.cores.primaria }}
                    >
                      Cor Principal - Elementos principais
                    </div>
                    <div 
                      className="p-4 rounded-lg text-white font-medium"
                      style={{ backgroundColor: formData.cores.secundaria }}
                    >
                      Cor Secundária - Elementos secundários
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setConfigs(prev => ({ ...prev, cores: formData.cores }));
                      addNotification({
                        type: 'success',
                        title: 'Cores atualizadas',
                        message: 'Personalização visual salva com sucesso'
                      });
                    }}
                    leftIcon={<Save size={16} />}
                  >
                    Salvar Cores
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <UnidadeModal
          isOpen={showUnidadeModal}
          onClose={() => {
            setShowUnidadeModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveUnidade}
          unidade={editingItem}
          loading={loading}
        />

        <PlanoModal
          isOpen={showPlanoModal}
          onClose={() => {
            setShowPlanoModal(false);
            setEditingItem(null);
          }}
          onSave={handleSavePlano}
          plano={editingItem}
          loading={loading}
          unidade="Centro"
        />

        <PlataformaModal
          isOpen={showPlataformaModal}
          onClose={() => {
            setShowPlataformaModal(false);
            setEditingItem(null);
          }}
          onSave={handleSavePlataforma}
          plataforma={editingItem}
          loading={loading}
          unidade="Centro"
        />
      </div>
    </div>
  );
});
// Página de Metas do CT - VERSÃO CORRIGIDA
const MetasPage = memo(() => {
  const { addNotification } = useNotifications();
  const [metas, setMetas] = useLocalStorage('metas-ct', []);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [filtroPrazo, setFiltroPrazo] = useState('todos');
  const [viewMode, setViewMode] = useState('cards');

  // Estatísticas das metas
  const estatisticas = useMemo(() => {
    const agora = new Date();
    const metasAtivas = metas.filter(m => !m.concluida);
    const metasConcluidas = metas.filter(m => m.concluida);
    const metasVencidas = metas.filter(m => !m.concluida && new Date(m.prazo) < agora);
    const metasProximasVencer = metas.filter(m => {
      if (m.concluida) return false;
      const diasRestantes = Math.ceil((new Date(m.prazo) - agora) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 7 && diasRestantes > 0;
    });

    const taxaSucesso = metas.length > 0 ? Math.round((metasConcluidas.length / metas.length) * 100) : 0;
    
    return {
      total: metas.length,
      ativas: metasAtivas.length,
      concluidas: metasConcluidas.length,
      vencidas: metasVencidas.length,
      proximasVencer: metasProximasVencer.length,
      taxaSucesso
    };
  }, [metas]);

  // Filtrar metas
  const metasFiltradas = useMemo(() => {
    let metasFiltro = [...metas];

    // Filtro por status
    switch (filtroStatus) {
      case 'pendentes':
        metasFiltro = metasFiltro.filter(m => !m.concluida);
        break;
      case 'concluidas':
        metasFiltro = metasFiltro.filter(m => m.concluida);
        break;
      case 'vencidas':
        metasFiltro = metasFiltro.filter(m => {
          const agora = new Date();
          return !m.concluida && new Date(m.prazo) < agora;
        });
        break;
    }

    // Filtro por prazo
    if (filtroPrazo !== 'todos') {
      const agora = new Date();
      switch (filtroPrazo) {
        case 'este-mes':
          metasFiltro = metasFiltro.filter(m => {
            const prazo = new Date(m.prazo);
            return prazo.getMonth() === agora.getMonth() && prazo.getFullYear() === agora.getFullYear();
          });
          break;
        case 'proximos-30':
          metasFiltro = metasFiltro.filter(m => {
            const diasRestantes = Math.ceil((new Date(m.prazo) - agora) / (1000 * 60 * 60 * 24));
            return diasRestantes <= 30 && diasRestantes >= 0;
          });
          break;
      }
    }

    return metasFiltro.sort((a, b) => new Date(a.prazo) - new Date(b.prazo));
  }, [metas, filtroStatus, filtroPrazo]);

  // Tipos de meta pré-definidos
  const tiposMeta = [
    { id: 'alunos', nome: 'Crescimento de Alunos', icon: '👥', cor: '#3b82f6' },
    { id: 'receita', nome: 'Meta de Receita', icon: '💰', cor: '#10b981' },
    { id: 'retencao', nome: 'Retenção de Alunos', icon: '🎯', cor: '#8b5cf6' },
    { id: 'expansao', nome: 'Expansão/Unidades', icon: '🏢', cor: '#f59e0b' },
    { id: 'qualidade', nome: 'Melhoria de Qualidade', icon: '⭐', cor: '#ef4444' },
    { id: 'eventos', nome: 'Eventos/Competições', icon: '🏆', cor: '#06b6d4' },
    { id: 'marketing', nome: 'Marketing/Divulgação', icon: '📢', cor: '#84cc16' },
    { id: 'pessoal', nome: 'Meta Pessoal', icon: '🚀', cor: '#ec4899' }
  ];

  // Função para calcular progresso
  const calcularProgresso = useCallback((meta) => {
    if (meta.concluida) return 100;
    if (!meta.valorAtual || !meta.valorMeta) return 0;
    return Math.min(Math.round((meta.valorAtual / meta.valorMeta) * 100), 100);
  }, []);

  // Função para calcular dias restantes
  const calcularDiasRestantes = useCallback((prazo) => {
    const agora = new Date();
    const dataprazo = new Date(prazo);
    const diferenca = Math.ceil((dataprazo - agora) / (1000 * 60 * 60 * 24));
    return diferenca;
  }, []);

  // Handlers
  const handleSave = useCallback((metaData) => {
    if (editingMeta) {
      setMetas(prev => prev.map(m => 
        m.id === editingMeta.id ? { ...m, ...metaData } : m
      ));
      addNotification({
        type: 'success',
        title: 'Meta atualizada',
        message: 'Meta editada com sucesso'
      });
    } else {
      const novaMeta = {
        id: Date.now(),
        ...metaData,
        criadaEm: new Date().toISOString(),
        concluida: false,
        concluidaEm: null
      };
      setMetas(prev => [...prev, novaMeta]);
      addNotification({
        type: 'success',
        title: 'Meta criada',
        message: 'Nova meta adicionada com sucesso'
      });
    }
    setShowMetaModal(false);
    setEditingMeta(null);
  }, [editingMeta, setMetas, addNotification]);

  const handleConcluir = useCallback((metaId) => {
    setMetas(prev => prev.map(m => 
      m.id === metaId 
        ? { ...m, concluida: true, concluidaEm: new Date().toISOString() }
        : m
    ));
    addNotification({
      type: 'success',
      title: '🎉 Meta concluída!',
      message: 'Parabéns por alcançar sua meta!'
    });
  }, [setMetas, addNotification]);

  const handleDelete = useCallback((metaId) => {
    const meta = metas.find(m => m.id === metaId);
    if (window.confirm(`Tem certeza que deseja excluir a meta "${meta.titulo}"?`)) {
      setMetas(prev => prev.filter(m => m.id !== metaId));
      addNotification({
        type: 'success',
        title: 'Meta excluída',
        message: 'Meta removida com sucesso'
      });
    }
  }, [metas, setMetas, addNotification]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                🎯 Metas do CT
                <span className="text-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                  {estatisticas.ativas} ativas
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Defina e acompanhe as metas de crescimento do seu centro de treinamento
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setEditingMeta(null);
                  setShowMetaModal(true);
                }}
                leftIcon={<Plus size={16} />}
              >
                Nova Meta
              </Button>
              
              <Button
                variant="secondary"
                leftIcon={<BarChart size={16} />}
              >
                Relatórios
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Total de Metas</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.ativas}</div>
            <div className="text-sm text-orange-800 dark:text-orange-300">Ativas</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Concluídas</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600">{estatisticas.vencidas}</div>
            <div className="text-sm text-red-800 dark:text-red-300">Vencidas</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.proximasVencer}</div>
            <div className="text-sm text-yellow-800 dark:text-yellow-300">Próx. Vencer</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.taxaSucesso}%</div>
            <div className="text-sm text-purple-800 dark:text-purple-300">Taxa Sucesso</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Status:</span>
              {[
                { id: 'todas', label: 'Todas', count: estatisticas.total },
                { id: 'pendentes', label: 'Pendentes', count: estatisticas.ativas },
                { id: 'concluidas', label: 'Concluídas', count: estatisticas.concluidas },
                { id: 'vencidas', label: 'Vencidas', count: estatisticas.vencidas }
              ].map(filtro => (
                <button
                  key={filtro.id}
                  onClick={() => setFiltroStatus(filtro.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filtroStatus === filtro.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filtro.label} ({filtro.count})
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Prazo:</span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'este-mes', label: 'Este Mês' },
                { id: 'proximos-30', label: 'Próximos 30 dias' }
              ].map(filtro => (
                <button
                  key={filtro.id}
                  onClick={() => setFiltroPrazo(filtro.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filtroPrazo === filtro.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Metas */}
        {metasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Target className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {filtroStatus === 'todas' 
                ? 'Nenhuma meta encontrada' 
                : `Nenhuma meta ${filtroStatus}`
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filtroStatus === 'todas'
                ? 'Comece definindo suas primeiras metas para o CT'
                : 'Altere os filtros para ver outras metas'
              }
            </p>
            {filtroStatus === 'todas' && (
              <Button
                onClick={() => {
                  setEditingMeta(null);
                  setShowMetaModal(true);
                }}
                leftIcon={<Plus size={16} />}
              >
                Criar Primeira Meta
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metasFiltradas.map(meta => {
              const tipoMeta = tiposMeta.find(t => t.id === meta.tipo) || tiposMeta[0];
              const progresso = calcularProgresso(meta);
              const diasRestantes = calcularDiasRestantes(meta.prazo);
              
              return (
                <div 
                  key={meta.id} 
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                    meta.concluida 
                      ? 'border-green-200 dark:border-green-700' 
                      : diasRestantes < 0 
                        ? 'border-red-200 dark:border-red-700'
                        : diasRestantes <= 7
                          ? 'border-yellow-200 dark:border-yellow-700'
                          : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Header do card */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: tipoMeta.cor + '20', color: tipoMeta.cor }}
                        >
                          {tipoMeta.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                            {meta.titulo}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {tipoMeta.nome}
                            </span>
                            {/* Badge de escopo */}
                            {meta.escopo && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                meta.escopo === 'geral' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                              }`}>
                                {meta.escopo === 'geral' 
                                  ? '🌐 Geral' 
                                  : `🏢 ${meta.unidadeSelecionada || 'Unidade'}`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {meta.concluida && (
                        <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                          ✅ Concluída
                        </div>
                      )}
                    </div>

                    {/* Descrição */}
                    {meta.descricao && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {meta.descricao}
                      </p>
                    )}

                    {/* Progresso */}
                    {meta.valorMeta && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                          <span className="font-medium" style={{ color: tipoMeta.cor }}>
                            {progresso}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${progresso}%`, 
                              backgroundColor: tipoMeta.cor 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Atual: {meta.valorAtual || 0}</span>
                          <span>Meta: {meta.valorMeta}</span>
                        </div>
                      </div>
                    )}

                    {/* Prazo */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} />
                        <span className="text-gray-600 dark:text-gray-400">
                          Prazo: {new Date(meta.prazo).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {!meta.concluida && (
                        <div className={`text-xs mt-1 ${
                          diasRestantes < 0 
                            ? 'text-red-600 dark:text-red-400'
                            : diasRestantes <= 7
                              ? 'text-yellow-600 dark:text-yellow-400' 
                              : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {diasRestantes < 0 
                            ? `Venceu há ${Math.abs(diasRestantes)} dias`
                            : diasRestantes === 0
                              ? 'Vence hoje!'
                              : `${diasRestantes} dias restantes`
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer com ações */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingMeta(meta);
                            setShowMetaModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Editar meta"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(meta.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Excluir meta"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      
                      {!meta.concluida && (
                        <Button
                          size="sm"
                          onClick={() => handleConcluir(meta.id)}
                          leftIcon={<CheckCircle size={14} />} // 🔧 CORREÇÃO: Check → CheckCircle
                          style={{ backgroundColor: tipoMeta.cor }}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Meta */}
        <MetaModal
          isOpen={showMetaModal}
          onClose={() => {
            setShowMetaModal(false);
            setEditingMeta(null);
          }}
          onSave={handleSave}
          meta={editingMeta}
          tiposMeta={tiposMeta}
        />
      </div>
    </div>
  );
});
// Modal de Meta - VERSÃO ATUALIZADA COM UNIDADES
const MetaModal = memo(({ isOpen, onClose, onSave, meta, tiposMeta }) => {
  const { unidades } = useAppState(); // 🆕 Acessar unidades
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'alunos',
    prazo: '',
    valorMeta: '',
    valorAtual: '',
    escopo: 'geral', // 🆕 Novo campo: 'geral' ou 'unidade'
    unidadeSelecionada: '', // 🆕 Unidade específica
    prioridade: 'media',
    notificarEm: 7
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Obter data mínima (hoje)
  const dataMinima = useMemo(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }, []);

  // 🆕 Sugestões de metas atualizadas com contexto de unidade
  const sugestoesMetas = {
    alunos: [
      { titulo: 'Aumentar número de alunos em 20%', valorSugerido: 200, geralTitulo: 'Aumentar alunos em 20% (todas unidades)' },
      { titulo: 'Alcançar 100 novos alunos', valorSugerido: 100, geralTitulo: 'Alcançar 300 novos alunos (rede)' },
      { titulo: 'Atingir 500 alunos ativos', valorSugerido: 500, geralTitulo: 'Atingir 1500 alunos ativos (rede)' }
    ],
    receita: [
      { titulo: 'Aumentar receita mensal em 30%', valorSugerido: 50000, geralTitulo: 'Aumentar receita da rede em 30%' },
      { titulo: 'Atingir R$ 100.000 de faturamento', valorSugerido: 100000, geralTitulo: 'Atingir R$ 400.000 (todas unidades)' },
      { titulo: 'Crescer receita em R$ 20.000', valorSugerido: 20000, geralTitulo: 'Crescer receita da rede em R$ 80.000' }
    ],
    retencao: [
      { titulo: 'Atingir 90% de retenção de alunos', valorSugerido: 90, geralTitulo: 'Atingir 90% retenção (todas unidades)' },
      { titulo: 'Reduzir cancelamentos para 5%', valorSugerido: 5, geralTitulo: 'Reduzir cancelamentos da rede para 5%' },
      { titulo: 'Manter 95% de frequência mensal', valorSugerido: 95, geralTitulo: 'Manter 95% frequência (rede)' }
    ],
    expansao: [
      { titulo: 'Aumentar capacidade em 50%', valorSugerido: 50, geralTitulo: 'Abrir 2 novas unidades' },
      { titulo: 'Reformar instalações', valorSugerido: 1, geralTitulo: 'Expandir para nova cidade' },
      { titulo: 'Adicionar nova quadra', valorSugerido: 1, geralTitulo: 'Aumentar capacidade da rede em 50%' }
    ],
    qualidade: [
      { titulo: 'Atingir nota 4.8 de satisfação', valorSugerido: 4.8, geralTitulo: 'Atingir nota 4.8 (todas unidades)' },
      { titulo: 'Certificar todos os professores', valorSugerido: 100, geralTitulo: 'Certificar 100% dos professores (rede)' },
      { titulo: 'Implementar 5 melhorias', valorSugerido: 5, geralTitulo: 'Implementar 20 melhorias (rede)' }
    ],
    eventos: [
      { titulo: 'Organizar 2 campeonatos', valorSugerido: 2, geralTitulo: 'Organizar 8 campeonatos (rede)' },
      { titulo: 'Participar de 5 eventos', valorSugerido: 5, geralTitulo: 'Participar de 20 eventos (rede)' },
      { titulo: 'Realizar 6 workshops', valorSugerido: 6, geralTitulo: 'Realizar 24 workshops (rede)' }
    ],
    marketing: [
      { titulo: 'Atingir 5.000 seguidores locais', valorSugerido: 5000, geralTitulo: 'Atingir 50.000 seguidores (marca)' },
      { titulo: 'Conseguir 200 novos leads', valorSugerido: 200, geralTitulo: 'Conseguir 1.000 novos leads (rede)' },
      { titulo: 'Realizar 10 ações de marketing', valorSugerido: 10, geralTitulo: 'Realizar 40 ações (rede)' }
    ],
    pessoal: [
      { titulo: 'Melhorar gestão da unidade', valorSugerido: 100, geralTitulo: 'Melhorar gestão da rede' },
      { titulo: 'Fazer 2 cursos de capacitação', valorSugerido: 2, geralTitulo: 'Capacitar toda equipe' },
      { titulo: 'Ler 6 livros sobre gestão', valorSugerido: 6, geralTitulo: 'Ler 12 livros sobre franchising' }
    ]
  };

  useEffect(() => {
    if (meta) {
      setFormData({
        titulo: meta.titulo || '',
        descricao: meta.descricao || '',
        tipo: meta.tipo || 'alunos',
        prazo: meta.prazo ? meta.prazo.split('T')[0] : '',
        valorMeta: meta.valorMeta || '',
        valorAtual: meta.valorAtual || '',
        escopo: meta.escopo || 'geral', // 🆕 Carregar escopo
        unidadeSelecionada: meta.unidadeSelecionada || '', // 🆕 Carregar unidade
        prioridade: meta.prioridade || 'media',
        notificarEm: meta.notificarEm || 7
      });
    } else {
      // Definir prazo padrão para 30 dias
      const prazoDefault = new Date();
      prazoDefault.setDate(prazoDefault.getDate() + 30);
      
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'alunos',
        prazo: prazoDefault.toISOString().split('T')[0],
        valorMeta: '',
        valorAtual: '',
        escopo: 'geral', // 🆕 Padrão: meta geral
        unidadeSelecionada: unidades.length > 0 ? unidades[0].nome : '', // 🆕 Primeira unidade como padrão
        prioridade: 'media',
        notificarEm: 7
      });
    }
    setErrors({});
  }, [meta, isOpen, unidades]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título da meta é obrigatório';
    }
    
    if (!formData.prazo) {
      newErrors.prazo = 'Prazo é obrigatório';
    } else {
      const hoje = new Date();
      const prazoData = new Date(formData.prazo);
      if (prazoData <= hoje) {
        newErrors.prazo = 'Prazo deve ser uma data futura';
      }
    }
    
    // 🆕 Validar unidade se escopo for específico
    if (formData.escopo === 'unidade' && !formData.unidadeSelecionada) {
      newErrors.unidadeSelecionada = 'Selecione uma unidade';
    }
    
    if (formData.valorMeta && parseFloat(formData.valorMeta) <= 0) {
      newErrors.valorMeta = 'Valor da meta deve ser maior que zero';
    }
    
    if (formData.valorAtual && parseFloat(formData.valorAtual) < 0) {
      newErrors.valorAtual = 'Valor atual não pode ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await onSave({
          ...formData,
          valorMeta: formData.valorMeta ? parseFloat(formData.valorMeta) : null,
          valorAtual: formData.valorAtual ? parseFloat(formData.valorAtual) : 0
        });
      } finally {
        setLoading(false);
      }
    }
  }, [formData, validateForm, onSave]);

  // 🆕 Função para aplicar sugestão adaptada ao escopo
  const aplicarSugestao = useCallback((sugestao) => {
    const titulo = formData.escopo === 'geral' && sugestao.geralTitulo 
      ? sugestao.geralTitulo 
      : sugestao.titulo;
    
    const valor = formData.escopo === 'geral' && sugestao.geralTitulo
      ? sugestao.valorSugerido * 3 // Multiplicador para metas gerais
      : sugestao.valorSugerido;
    
    setFormData(prev => ({
      ...prev,
      titulo: titulo,
      valorMeta: valor
    }));
  }, [formData.escopo]);

  // 🆕 Handler para mudança de escopo
  const handleEscopoChange = useCallback((novoEscopo) => {
    setFormData(prev => ({
      ...prev,
      escopo: novoEscopo,
      // Limpar unidade se for geral
      unidadeSelecionada: novoEscopo === 'geral' ? '' : (unidades.length > 0 ? unidades[0].nome : '')
    }));
  }, [unidades]);

  const calcularDiasRestantes = useCallback(() => {
    if (!formData.prazo) return 0;
    const hoje = new Date();
    const prazo = new Date(formData.prazo);
    return Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
  }, [formData.prazo]);

  const calcularProgresso = useCallback(() => {
    if (!formData.valorMeta || !formData.valorAtual) return 0;
    return Math.min(Math.round((parseFloat(formData.valorAtual) / parseFloat(formData.valorMeta)) * 100), 100);
  }, [formData.valorMeta, formData.valorAtual]);

  const tipoSelecionado = tiposMeta.find(t => t.id === formData.tipo) || tiposMeta[0];
  const sugestoesDisponiveis = sugestoesMetas[formData.tipo] || [];
  const diasRestantes = calcularDiasRestantes();
  const progresso = calcularProgresso();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${meta ? 'Editar' : 'Nova'} Meta`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header com tipo da meta */}
        <div 
          className="p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: tipoSelecionado.cor + '10', 
            borderLeftColor: tipoSelecionado.cor 
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: tipoSelecionado.cor + '20', color: tipoSelecionado.cor }}
            >
              {tipoSelecionado.icon}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: tipoSelecionado.cor }}>
                {tipoSelecionado.nome}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure os detalhes da sua meta
                {/* 🆕 Indicador de escopo */}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  formData.escopo === 'geral' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                }`}>
                  {formData.escopo === 'geral' ? '🌐 Meta Geral' : `🏢 ${formData.unidadeSelecionada}`}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 🆕 NOVA SEÇÃO: Escopo da Meta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            🎯 Escopo da Meta
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.escopo === 'geral'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="escopo"
                value="geral"
                checked={formData.escopo === 'geral'}
                onChange={(e) => handleEscopoChange(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-blue-600 dark:text-blue-400 flex items-center">
                  🌐 Meta Geral
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Abrange todas as unidades do CT
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  📊 Dados consolidados da rede
                </div>
              </div>
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.escopo === 'unidade'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="escopo"
                value="unidade"
                checked={formData.escopo === 'unidade'}
                onChange={(e) => handleEscopoChange(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-purple-600 dark:text-purple-400 flex items-center">
                  🏢 Unidade Específica
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Foca em uma unidade individual
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  🎯 Dados específicos da unidade
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 🆕 Seletor de Unidade (só aparece se escopo for unidade) */}
        {formData.escopo === 'unidade' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              🏢 Selecionar Unidade
            </label>
            <select
              value={formData.unidadeSelecionada}
              onChange={(e) => setFormData(prev => ({ ...prev, unidadeSelecionada: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.unidadeSelecionada ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            >
              <option value="">Selecione uma unidade</option>
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.nome}>
                  {unidade.nome}
                </option>
              ))}
            </select>
            {errors.unidadeSelecionada && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.unidadeSelecionada}</p>
            )}
          </div>
        )}

        {/* Tipo da meta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            📋 Tipo da Meta
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiposMeta.map(tipo => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.id }))}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  formData.tipo === tipo.id
                    ? 'border-current bg-current bg-opacity-10'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                style={formData.tipo === tipo.id ? { 
                  borderColor: tipo.cor, 
                  backgroundColor: tipo.cor + '10',
                  color: tipo.cor 
                } : {}}
              >
                <div className="text-xl mb-1">{tipo.icon}</div>
                <div className="text-xs font-medium">{tipo.nome}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 🆕 Sugestões atualizadas com contexto */}
        {!meta && sugestoesDisponiveis.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              💡 Sugestões para {formData.escopo === 'geral' ? 'Meta Geral' : 'Unidade Específica'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sugestoesDisponiveis.map((sugestao, index) => {
                const titulo = formData.escopo === 'geral' && sugestao.geralTitulo 
                  ? sugestao.geralTitulo 
                  : sugestao.titulo;
                const valor = formData.escopo === 'geral' && sugestao.geralTitulo
                  ? sugestao.valorSugerido * 3 
                  : sugestao.valorSugerido;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => aplicarSugestao(sugestao)}
                    className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                      {titulo}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Meta: {valor}
                    </div>
                    <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                      formData.escopo === 'geral' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {formData.escopo === 'geral' ? '🌐 Rede' : '🏢 Unidade'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Resto do formulário continua igual... */}
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="📝 Título da Meta"
              required
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              error={errors.titulo}
              placeholder={formData.escopo === 'geral' 
                ? "Ex: Aumentar receita da rede em 30%" 
                : `Ex: Crescer ${formData.unidadeSelecionada || 'unidade'} em 20%`
              }
            />
          </div>

          <Input
            label="🎯 Valor da Meta"
            type="number"
            value={formData.valorMeta}
            onChange={(e) => setFormData(prev => ({ ...prev, valorMeta: e.target.value }))}
            error={errors.valorMeta}
            placeholder={formData.escopo === 'geral' ? "600" : "200"}
            step="0.01"
            min="0"
          />

          <Input
            label="📊 Valor Atual"
            type="number"
            value={formData.valorAtual}
            onChange={(e) => setFormData(prev => ({ ...prev, valorAtual: e.target.value }))}
            error={errors.valorAtual}
            placeholder={formData.escopo === 'geral' ? "480" : "160"}
            step="0.01"
            min="0"
          />
        </div>

        {/* Prazo e configurações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="📅 Prazo"
            type="date"
            required
            value={formData.prazo}
            onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
            error={errors.prazo}
            min={dataMinima}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              ⚡ Prioridade
            </label>
            <select
              value={formData.prioridade}
              onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="baixa">🟢 Baixa</option>
              <option value="media">🟡 Média</option>
              <option value="alta">🟠 Alta</option>
              <option value="critica">🔴 Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              🔔 Notificar (dias antes)
            </label>
            <select
              value={formData.notificarEm}
              onChange={(e) => setFormData(prev => ({ ...prev, notificarEm: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={1}>1 dia antes</option>
              <option value={3}>3 dias antes</option>
              <option value={7}>7 dias antes</option>
              <option value={15}>15 dias antes</option>
              <option value={30}>30 dias antes</option>
            </select>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            📄 Descrição (Opcional)
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            placeholder={formData.escopo === 'geral' 
              ? "Descreva como essa meta impactará toda a rede..."
              : "Descreva os detalhes específicos para esta unidade..."
            }
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* 🆕 Preview da meta atualizado */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            👁️ Preview da Meta:
          </h4>
          <div 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4"
            style={{ borderLeftColor: tipoSelecionado.cor }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: tipoSelecionado.cor + '20', color: tipoSelecionado.cor }}
                >
                  {tipoSelecionado.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                    {formData.titulo || 'Título da meta'}
                  </h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {tipoSelecionado.nome}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      formData.escopo === 'geral' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                    }`}>
                      {formData.escopo === 'geral' 
                        ? '🌐 Meta Geral' 
                        : `🏢 ${formData.unidadeSelecionada || 'Unidade'}`
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.prioridade === 'critica' ? 'bg-red-100 text-red-800' :
                formData.prioridade === 'alta' ? 'bg-orange-100 text-orange-800' :
                formData.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {formData.prioridade === 'critica' ? '🔴 Crítica' :
                 formData.prioridade === 'alta' ? '🟠 Alta' :
                 formData.prioridade === 'media' ? '🟡 Média' : '🟢 Baixa'}
              </div>
            </div>

            {formData.descricao && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {formData.descricao}
              </p>
            )}

            {formData.valorMeta && (
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                  <span className="font-medium" style={{ color: tipoSelecionado.cor }}>
                    {progresso}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progresso}%`, 
                      backgroundColor: tipoSelecionado.cor 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Atual: {formData.valorAtual || 0}</span>
                  <span>Meta: {formData.valorMeta}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar size={14} />
                <span>
                  {formData.prazo 
                    ? `Prazo: ${new Date(formData.prazo).toLocaleDateString('pt-BR')}`
                    : 'Prazo não definido'
                  }
                </span>
              </div>
              {formData.prazo && (
                <div className={`text-xs ${
                  diasRestantes < 0 ? 'text-red-600' :
                  diasRestantes <= 7 ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {diasRestantes < 0 
                    ? `Venceu há ${Math.abs(diasRestantes)} dias`
                    : diasRestantes === 0
                      ? 'Vence hoje!'
                      : `${diasRestantes} dias restantes`
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
            style={{ backgroundColor: tipoSelecionado.cor }}
          >
            {meta ? 'Atualizar' : 'Criar'} Meta
          </Button>
        </div>
      </form>
    </Modal>
  );
});
// ADICIONE ESTES DOIS NOVOS COMPONENTES

// Modal para agendar um aluguel
const AluguelModal = memo(({ isOpen, onClose, onSave, aluguel, dataSelecionada, configs }) => {
  const [formData, setFormData] = useState({});
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    const inicio = aluguel?.horaInicio ? parseInt(aluguel.horaInicio.split(':')[0]) : 9;
    const fim = aluguel?.horaFim ? parseInt(aluguel.horaFim.split(':')[0]) : 10;

    setFormData({
      clienteNome: aluguel?.clienteNome || '',
      data: aluguel?.data || dataSelecionada,
      quadraId: aluguel?.quadraId || 1,
      horaInicio: `${String(inicio).padStart(2,'0')}:00`,
      horaFim: `${String(fim).padStart(2,'0')}:00`,
      status: aluguel?.status || 'agendado'
    });
  }, [aluguel, isOpen, dataSelecionada]);
  
  useEffect(() => {
      const inicio = parseInt(formData.horaInicio?.split(':')[0] || 0);
      const fim = parseInt(formData.horaFim?.split(':')[0] || 0);
      const duracao = fim - inicio;
      if (duracao > 0) {
          setValorTotal(duracao * (configs.modeloNegocio?.valorAluguelQuadraHora || 100));
      } else {
          setValorTotal(0);
      }
  }, [formData.horaInicio, formData.horaFim, configs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, valorTotal, id: aluguel?.id || Date.now() });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={aluguel ? 'Editar Aluguel' : 'Novo Aluguel de Quadra'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome do Cliente" required value={formData.clienteNome} onChange={e => setFormData(p => ({...p, clienteNome: e.target.value}))}/>
        <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" value={formData.data} onChange={e => setFormData(p => ({...p, data: e.target.value}))} />
            <Input label="Quadra" type="number" min="1" max={configs.modeloNegocio?.quantidadeQuadras} value={formData.quadraId} onChange={e => setFormData(p => ({...p, quadraId: parseInt(e.target.value)}))} />
        </div>
         <div className="grid grid-cols-2 gap-4">
            <Input label="Hora Início" type="time" step="3600" value={formData.horaInicio} onChange={e => setFormData(p => ({...p, horaInicio: e.target.value}))} />
            <Input label="Hora Fim" type="time" step="3600" value={formData.horaFim} onChange={e => setFormData(p => ({...p, horaFim: e.target.value}))} />
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-sm text-blue-800 dark:text-blue-300">Valor Total</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">R$ {valorTotal.toFixed(2)}</p>
        </div>
         <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" leftIcon={<Save size={16} />}>{aluguel ? 'Atualizar' : 'Agendar'}</Button>
        </div>
      </form>
    </Modal>
  );
});

// Página de Gestão de Aluguel de Quadras
const AluguelQuadrasPage = memo(() => {
  const { addNotification } = useNotifications();
const { alugueis, setAlugueis } = useAppState(); // Pegando 'alugueis' do lugar certo
  const [configs] = useLocalStorage('configuracoes-ct-usuario', {});
  
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingAluguel, setEditingAluguel] = useState(null);

  const horariosFuncionamento = Array.from({length: 24}, (_, i) => `${String(i).padStart(2,'0')}:00`);
  const { quantidadeQuadras = 1 } = configs.modeloNegocio || {};
  
  const alugueisDoDia = useMemo(() => {
    return alugueis.filter(a => a.data === dataSelecionada);
  }, [alugueis, dataSelecionada]);
  
  const handleSaveAluguel = (aluguelData) => {
    const isEditing = alugueis.some(a => a.id === aluguelData.id);
    if(isEditing) {
        setAlugueis(prev => prev.map(a => a.id === aluguelData.id ? aluguelData : a));
        addNotification({type: 'success', title: 'Aluguel atualizado!'});
    } else {
        setAlugueis(prev => [...prev, aluguelData]);
        addNotification({type: 'success', title: 'Aluguel agendado!'});
    }
    setShowModal(false);
    setEditingAluguel(null);
  };
  
  const handleOpenModal = (aluguel = null) => {
    setEditingAluguel(aluguel);
    setShowModal(true);
  };
  
  const renderSlot = (quadraId, horario) => {
    const aluguel = alugueisDoDia.find(a => a.quadraId === quadraId && horario >= a.horaInicio && horario < a.horaFim);
    if(aluguel) {
      return (
        <div onClick={() => handleOpenModal(aluguel)} className="bg-blue-200 dark:bg-blue-800 p-2 h-full rounded-md text-xs cursor-pointer hover:bg-blue-300">
          <p className="font-bold">{aluguel.clienteNome}</p>
          <p>R$ {aluguel.valorTotal.toFixed(2)}</p>
        </div>
      );
    }
    return <div onClick={() => handleOpenModal(null)} className="h-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"></div>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">🎾 Aluguel de Quadras</h2>
          <p className="text-gray-500">Gerencie os horários e agendamentos das suas quadras.</p>
        </div>
        <div className="flex gap-4 items-center">
            <Input type="date" value={dataSelecionada} onChange={e => setDataSelecionada(e.target.value)} />
            <Button onClick={() => handleOpenModal(null)} leftIcon={<Plus size={16}/>}>Novo Aluguel</Button>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
        <div className="grid gap-2" style={{gridTemplateColumns: `60px repeat(${quantidadeQuadras}, 1fr)`}}>
            <div className="text-xs font-bold text-center self-end pb-2">Hora</div>
            {Array.from({length: quantidadeQuadras}, (_, i) => (
                <div key={i} className="text-sm font-bold text-center pb-2 border-b-2">Quadra {i + 1}</div>
            ))}

            {horariosFuncionamento.map(horario => (
              <React.Fragment key={horario}>
                <div className="text-xs text-center font-mono h-16 flex items-center justify-center border-r-2">{horario}</div>
                 {Array.from({length: quantidadeQuadras}, (_, i) => (
                    <div key={i} className="h-16 border-b border-r p-1">
                        {renderSlot(i + 1, horario)}
                    </div>
                ))}
              </React.Fragment>
            ))}
        </div>
      </div>
      
      <AluguelModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSaveAluguel}
        aluguel={editingAluguel}
        dataSelecionada={dataSelecionada}
        configs={configs}
       />
    </div>
  );
});

// Componente principal do sistema
const CTFutevoleiSystem = memo(() => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { userLogado, activeTab } = useAppState();

const renderContent = useCallback(() => {
  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'alunos':
      return <AlunosPage />;
    case 'professores':
      return <ProfessoresPage />;
    case 'gestores': // 🆕 Nova página de gestores
      return <GestoresPage />;
    case 'presenca':
      return <PresencaPage />; // ← Admin vê controle de presença
    case 'agendamentos':
      return <AgendamentosPage />; // ← Admin vê gerenciamento de agendamentos
    case 'aulas':
      return <AulasPage />; // ← Só alunos e professores veem esta tela
    case 'treinos':
      return <TreinosPage />;
    case 'metas':
      return <MetasPage />;
    case 'financeiro':
      return <FinanceiroPage />;       
    case 'loja':
      return <LojaPage />;
    case 'evolucao':
      return <EvolucaoPage />;
    case 'perfil':
      return <PerfilPage />;
       case 'aluguel_quadras':
      return <AluguelQuadrasPage />;
    case 'configuracoes':
      return <ConfiguracoesPage />;
    default:
      return <Dashboard />;
  }
}, [activeTab]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Toaster />
        
        {!userLogado ? (
          <LoginModal />
        ) : (
          <>
            <MenuSidebar 
              isMobileOpen={isMobileSidebarOpen} 
              setMobileOpen={setIsMobileSidebarOpen} 
              isCollapsed={isSidebarCollapsed} 
            />
            
            <div className={`transition-all duration-300 ${
              isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            } min-h-screen flex flex-col`}>
              <Header 
                toggleMobileSidebar={() => setIsMobileSidebarOpen(true)} 
                toggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              />
              
              <main className="flex-grow p-3 sm:p-4 lg:p-6">
                {renderContent()}
              </main>
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
});

// Componente principal exportado
const App = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppStateProvider>
          <CTFutevoleiSystem />
        </AppStateProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;