import toast from 'react-hot-toast';
import type { AulaoConfigMelhorado, ListaPresencaGerada } from '@/types';
// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
export class AulaoUtils {
  /**
   * Verifica se um aulão está ativo em uma data específica
   */
  static isAulaoAtivoNaData(aulao: AulaoConfigMelhorado, data: Date): boolean {
    if (!aulao.ativo) return false;

    if (aulao.tipo === 'extra-pontual') {
      if (!aulao.dataEspecifica) return false;
      const dataAulao = new Date(aulao.dataEspecifica);
      return dataAulao.toDateString() === data.toDateString();
    }

    if (aulao.tipo === 'fixo-recorrente') {
      if (!aulao.diaSemana) return false;
      
      const diasSemana = {
        'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3,
        'quinta': 4, 'sexta': 5, 'sabado': 6
      };
      
      if (data.getDay() !== diasSemana[aulao.diaSemana]) {
        return false;
      }

      // Verifica período de vigência
      const dataInicioAulao = aulao.dataInicio ? new Date(aulao.dataInicio) : new Date('2000-01-01');
      const dataFimAulao = aulao.dataFim ? new Date(aulao.dataFim) : new Date('2099-12-31');
      
      return data >= dataInicioAulao && data <= dataFimAulao;
    }

    return false;
  }

  /**
   * Gera lista de presença automática para um aulão em uma data
   */
  static gerarListaPresenca(aulao: AulaoConfigMelhorado, data: Date): any {
    if (!this.isAulaoAtivoNaData(aulao, data)) {
      return null;
    }

    const dataStr = data.toISOString().split('T')[0];
    
    return {
      data: dataStr,
      horaInicio: aulao.horaInicio,
      horaFim: aulao.horaFim,
      unidade: aulao.unidade,
      tipo: 'aulao' as const,
      nivelId: aulao.nivelId,
      capacidade: aulao.capacidade,
      status: 'aberta' as const,
      preCheckins: [],
      presencasConfirmadas: [],
      origemTipo: aulao.tipo === 'fixo-recorrente' ? 'aulao-fixo' : 'aulao-extra',
      origemConfigId: aulao.id,
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString()
    };
  }

  /**
   * Valida dados de um aulão antes de salvar
   */
  static validarAulao(aulao: any): string[] {
    const erros: string[] = [];

    if (!aulao.nome?.trim()) {
      erros.push('Nome do aulão é obrigatório');
    }

    if (!aulao.unidade) {
      erros.push('Unidade é obrigatória');
    }

    if (!aulao.horaInicio || !aulao.horaFim) {
      erros.push('Horários são obrigatórios');
    }

    if (aulao.horaInicio && aulao.horaFim && aulao.horaInicio >= aulao.horaFim) {
      erros.push('Hora de início deve ser anterior à hora de fim');
    }

    if (!aulao.capacidade || aulao.capacidade <= 0) {
      erros.push('Capacidade deve ser maior que zero');
    }

    // Validações específicas por tipo
    if (aulao.tipo === 'fixo-recorrente' && !aulao.diaSemana) {
      erros.push('Dia da semana é obrigatório para aulões fixos');
    }

    if (aulao.tipo === 'extra-pontual' && !aulao.dataEspecifica) {
      erros.push('Data específica é obrigatória para aulões extras');
    }

    return erros;
  }
}
// CSV conversion and export utilities
export const convertToCSV = (data: Record<string, any>[]): string => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]!).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

export const exportToCSV = (data: Record<string, any>[], filename: string): void => {
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

// Phone formatting utility
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Currency formatting utilities
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

// Date formatting utilities
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

// Generate unique ID
export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Status color utilities
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ativo: 'text-green-600 dark:text-green-400',
    pendente: 'text-yellow-600 dark:text-yellow-400',
    inativo: 'text-red-600 dark:text-red-400',
    pago: 'text-green-600 dark:text-green-400',
    vencido: 'text-red-600 dark:text-red-400',
    presente: 'text-green-600 dark:text-green-400',
    falta: 'text-red-600 dark:text-red-400'
  };
  
  return colors[status] || 'text-gray-600 dark:text-gray-400';
};

export const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    ativo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    inativo: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pago: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    vencido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    presente: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    falta: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };
  
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`;
};

// Local storage utilities with error handling
export const setLocalStorage = (key: string, value: any): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    
    const item = window.localStorage.getItem(key);
    
    if (item === null || item === undefined || item === 'undefined') {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Array utilities
export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterByTerm = <T>(array: T[], term: string, searchKeys: (keyof T)[]): T[] => {
  if (!term.trim()) return array;
  
  const lowerTerm = term.toLowerCase();
  return array.filter(item => 
    searchKeys.some(key => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase().includes(lowerTerm);
    })
  );
};