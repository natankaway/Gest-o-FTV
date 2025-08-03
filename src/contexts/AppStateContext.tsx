import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks';
import { mockData } from '@/data/mockData';
import type { 
  AppState, 
  User, 
  Aluno, 
  Professor, 
  Gestor, 
  RegistroFinanceiro, 
  Unidade, 
  Plano, 
  Produto, 
  Plataforma, 
  Presenca, 
  Horario, 
  Meta, 
  Aluguel, 
  Agendamento,
  Treino,
  Exercicio,
  CartItem,
  TabKeys
} from '@/types';

interface AppStateContextType extends AppState {
  // Setters for all data
  setAlunos: React.Dispatch<React.SetStateAction<Aluno[]>>;
  setProfessores: React.Dispatch<React.SetStateAction<Professor[]>>;
  setGestores: React.Dispatch<React.SetStateAction<Gestor[]>>;
  setFinanceiro: React.Dispatch<React.SetStateAction<RegistroFinanceiro[]>>;
  setUnidades: React.Dispatch<React.SetStateAction<Unidade[]>>;
  setPlanos: React.Dispatch<React.SetStateAction<Plano[]>>;
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  setPlataformas: React.Dispatch<React.SetStateAction<Plataforma[]>>;
  setPresencas: React.Dispatch<React.SetStateAction<Presenca[]>>;
  setHorarios: React.Dispatch<React.SetStateAction<Horario[]>>;
  setMetas: React.Dispatch<React.SetStateAction<Meta[]>>;
  setAlugueis: React.Dispatch<React.SetStateAction<Aluguel[]>>;
  setAgendamentos: React.Dispatch<React.SetStateAction<Agendamento[]>>;
  setTreinos: React.Dispatch<React.SetStateAction<Treino[]>>;
  setExercicios: React.Dispatch<React.SetStateAction<Exercicio[]>>;
  
  // Session state
  setUserLogado: React.Dispatch<React.SetStateAction<User | null>>;
  setUnidadeSelecionada: React.Dispatch<React.SetStateAction<string>>;
  activeTab: TabKeys;
  setActiveTab: React.Dispatch<React.SetStateAction<TabKeys>>;
  activeTabFilter: string | null;
  setActiveTabFilter: React.Dispatch<React.SetStateAction<string | null>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  
  // Helper functions
  addToCart: (produto: Produto) => void;
  removeFromCart: (produtoId: number) => void;
  updateCartQuantity: (produtoId: number, quantidade: number) => void;
  clearCart: () => void;
  getTotalCart: () => number;
  navigateToTab: (tab: TabKeys, filter?: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

interface AppStateProviderProps {
  children: React.ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  // Persistent state with localStorage
  const [alunos, setAlunos] = useLocalStorage<Aluno[]>('alunos', mockData.alunos);
  const [professores, setProfessores] = useLocalStorage<Professor[]>('professores', mockData.professores);
  const [gestores, setGestores] = useLocalStorage<Gestor[]>('gestores', mockData.gestores);
  const [financeiro, setFinanceiro] = useLocalStorage<RegistroFinanceiro[]>('financeiro', mockData.financeiro);
  const [unidades, setUnidades] = useLocalStorage<Unidade[]>('unidades', mockData.unidades);
  const [planos, setPlanos] = useLocalStorage<Plano[]>('planos', mockData.planos);
  const [produtos, setProdutos] = useLocalStorage<Produto[]>('produtos', mockData.produtos);
  const [plataformas, setPlataformas] = useLocalStorage<Plataforma[]>('plataformas', mockData.plataformas);
  const [presencas, setPresencas] = useLocalStorage<Presenca[]>('presencas', mockData.presencas);
  const [horarios, setHorarios] = useLocalStorage<Horario[]>('horarios', mockData.horarios);
  const [metas, setMetas] = useLocalStorage<Meta[]>('metas', mockData.metas);
  const [alugueis, setAlugueis] = useLocalStorage<Aluguel[]>('alugueis', mockData.alugueis);
  const [agendamentos, setAgendamentos] = useLocalStorage<Agendamento[]>('agendamentos', mockData.agendamentos);
  const [treinos, setTreinos] = useLocalStorage<Treino[]>('treinos', mockData.treinos);
  const [exercicios, setExercicios] = useLocalStorage<Exercicio[]>('exercicios', mockData.exercicios);

  // Session state (not persisted)
  const [userLogado, setUserLogado] = useState<User | null>(null);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>('Centro');
  const [activeTab, setActiveTab] = useState<TabKeys>('dashboard');
  const [activeTabFilter, setActiveTabFilter] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cart helper functions
  const addToCart = useCallback((produto: Produto) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.produto.id === produto.id);
      if (existingItem) {
        return prev.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((produtoId: number) => {
    setCart(prev => prev.filter(item => item.produto.id !== produtoId));
  }, []);

  const updateCartQuantity = useCallback((produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeFromCart(produtoId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.produto.id === produtoId
          ? { ...item, quantidade }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotalCart = useCallback(() => {
    return cart.reduce((total, item) => total + (item.produto.preco * item.quantidade), 0);
  }, [cart]);

  const navigateToTab = useCallback((tab: TabKeys, filter?: string) => {
    setActiveTab(tab);
    setActiveTabFilter(filter || null);
  }, []);

  const dadosMockados = useMemo(() => ({
    planos,
    alunos,
    professores,
    unidades,
    presencas,
    financeiro,
    produtos,
    plataformas,
    horarios,
    gestores,
    metas,
    alugueis,
    agendamentos,
    treinos,
    exercicios
  }), [
    planos, alunos, professores, unidades, presencas,
    financeiro, produtos, plataformas, horarios, gestores, metas, alugueis,
    agendamentos, treinos, exercicios
  ]);

  const value = useMemo(() => ({
    // Data
    dadosMockados,
    userLogado,
    unidadeSelecionada,
    
    // Setters
    setAlunos,
    setProfessores,
    setGestores,
    setFinanceiro,
    setUnidades,
    setPlanos,
    setProdutos,
    setPlataformas,
    setPresencas,
    setHorarios,
    setMetas,
    setAlugueis,
    setAgendamentos,
    setTreinos,
    setExercicios,
    setUserLogado,
    setUnidadeSelecionada,
    
    // Session state
    activeTab,
    setActiveTab,
    activeTabFilter,
    setActiveTabFilter,
    cart,
    setCart,
    
    // Cart helpers
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getTotalCart,
    navigateToTab
  }), [
    dadosMockados,
    userLogado,
    unidadeSelecionada,
    setAlunos,
    setProfessores,
    setGestores,
    setFinanceiro,
    setUnidades,
    setPlanos,
    setProdutos,
    setPlataformas,
    setPresencas,
    setHorarios,
    setMetas,
    setAlugueis,
    setAgendamentos,
    setTreinos,
    setExercicios,
    activeTab,
    activeTabFilter,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getTotalCart,
    navigateToTab
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};