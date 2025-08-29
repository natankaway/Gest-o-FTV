import React, { memo, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovoAlunoModal } from '@/components/forms';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash,
  Building,
  User,
  Mail,
  Phone,
  Settings,
  X,
  Filter,
  Save,
  Star,
  StarOff,
  Check,
  Zap,
  Calendar,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Archive,
  UserX,
  FileText,
  MessageSquare
} from 'lucide-react';
import type { Aluno } from '@/types';

// Interfaces para os novos recursos
interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
  isStarred: boolean;
  createdAt: string;
}

interface FilterState {
  searchTerm: string;
  status: string;
  unidade: string;
  tipoPlano: string;
  nivel: string;
  dateRange: {
    start: string;
    end: string;
    field: 'dataMatricula' | 'vencimento';
  };
  priceRange: {
    min: number;
    max: number;
  };
  daysToExpiration: number;
}

interface StudentCardProps {
  aluno: Aluno;
  onEdit: (aluno: Aluno) => void;
  onDelete: (id: number) => void;
  planos: any[];
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  aluno, 
  onEdit, 
  onDelete, 
  planos, 
  isSelected, 
  onSelect 
}) => {
  const getVencimentoInfo = () => {
    if (aluno.tipoPlano === 'plataforma') {
      return {
        text: 'Sem vencimento',
        subtext: '(Plataforma)',
        color: 'text-gray-500 dark:text-gray-400'
      };
    }
    
    const vencimento = new Date(aluno.vencimento);
    const hoje = new Date();
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      text: vencimento.toLocaleDateString('pt-BR'),
      subtext: diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido',
      color: diasRestantes <= 3 ? 'text-red-600 dark:text-red-400' : 
             diasRestantes <= 7 ? 'text-yellow-600 dark:text-yellow-400' : 
             'text-green-600 dark:text-green-400'
    };
  };

  const getPlanoInfo = () => {
    if (aluno.tipoPlano === 'plataforma') {
      return {
        nome: aluno.plataformaParceira || 'Plataforma',
        preco: null,
        badge: { text: 'Parceiro', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
        textColor: 'text-purple-600 dark:text-purple-400'
      };
    }
    
    const plano = planos.find(p => p.id === aluno.planoId);
    return {
      nome: plano?.nome || 'Plano não encontrado',
      preco: plano?.preco,
      badge: { text: 'Mensalidade', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
      textColor: 'text-blue-600 dark:text-blue-400'
    };
  };

  const vencimento = getVencimentoInfo();
  const planoInfo = getPlanoInfo();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/10' : ''
    }`}>
      {/* Header with selection checkbox and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Selection Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(aluno.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {aluno.nome}
            </h3>
            <div className="flex items-center space-x-2">
              <Building className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {aluno.unidade}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          aluno.status === 'ativo' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : aluno.status === 'pendente'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {aluno.status}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{aluno.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{aluno.telefone}</span>
        </div>
      </div>

      {/* Plan Info */}
      <div className="mb-4">
        <div className={`text-sm font-medium ${planoInfo.textColor}`}>
          {planoInfo.nome}
        </div>
        {planoInfo.preco && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            R$ {planoInfo.preco.toFixed(2)}/mês
          </div>
        )}
        <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${planoInfo.badge.color}`}>
          {planoInfo.badge.text}
        </span>
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {vencimento.text}
        </div>
        <div className={`text-xs ${vencimento.color}`}>
          {vencimento.subtext}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(aluno)}
          leftIcon={<Edit className="h-4 w-4" />}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(aluno.id)}
          leftIcon={<Trash className="h-4 w-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export const AlunosPage: React.FC = memo(() => {
  const { dadosMockados, setAlunos, activeTabFilter, setActiveTabFilter } = useAppState();
  const { alunos, planos } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados existentes
  const [showModal, setShowModal] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Novos estados para funcionalidades avançadas
  const [selectedAlunos, setSelectedAlunos] = useState<number[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Estado de filtros avançados
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'todos',
    unidade: 'todas',
    tipoPlano: 'todos',
    nivel: 'todos',
    dateRange: {
      start: '',
      end: '',
      field: 'dataMatricula'
    },
    priceRange: {
      min: 0,
      max: 1000
    },
    daysToExpiration: 0
  });

  // Configuração de exportação
  const [exportConfig, setExportConfig] = useState({
    includeFields: {
      nome: true,
      email: true,
      telefone: true,
      unidade: true,
      status: true,
      tipoPlano: true,
      plano: true,
      vencimento: true,
      dataMatricula: true,
      nivel: true,
      objetivo: true,
      nomesCheckIn: false,
      profileImage: false
    },
    format: 'csv' as 'csv' | 'excel',
    encoding: 'utf-8' as 'utf-8' | 'latin1',
    separator: ',' as ',' | ';' | '\t',
    includeHeader: true,
    dateFormat: 'dd/mm/yyyy' as 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'mm/dd/yyyy'
  });

  // Apply filter from navigation
  useEffect(() => {
    if (activeTabFilter === 'pendente') {
      setFilters(prev => ({ ...prev, status: 'pendente' }));
      setActiveTabFilter(null);
    }
  }, [activeTabFilter, setActiveTabFilter]);

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Busca inteligente com fuzzy matching
  const fuzzyMatch = (text: string, search: string): boolean => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match
    if (textLower.includes(searchLower)) return true;
    
    // Fuzzy match - permite alguns caracteres fora de ordem
    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === searchLower.length;
  };

  // Dados filtrados com busca inteligente
  const filteredAlunos = useMemo(() => {
    return alunos.filter(aluno => {
      // Busca inteligente
      if (filters.searchTerm) {
        const searchFields = [
          aluno.nome,
          aluno.email,
          aluno.telefone,
          aluno.unidade,
          aluno.objetivo || ''
        ];
        
        const matchesSearch = searchFields.some(field => 
          fuzzyMatch(field, filters.searchTerm)
        );
        
        if (!matchesSearch) return false;
      }
      
      // Filtros básicos
      if (filters.status !== 'todos' && aluno.status !== filters.status) return false;
      if (filters.unidade !== 'todas' && aluno.unidade !== filters.unidade) return false;
      if (filters.tipoPlano !== 'todos' && aluno.tipoPlano !== filters.tipoPlano) return false;
      if (filters.nivel !== 'todos' && aluno.nivel !== filters.nivel) return false;
      
      // Filtro de data
      if (filters.dateRange.start && filters.dateRange.end) {
        const targetDate = new Date(
          filters.dateRange.field === 'dataMatricula' ? aluno.dataMatricula : aluno.vencimento
        );
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (targetDate < startDate || targetDate > endDate) return false;
      }
      
      // Filtro de preço (apenas para mensalistas)
      if (aluno.tipoPlano === 'mensalidade' && aluno.planoId) {
        const plano = planos.find(p => p.id === aluno.planoId);
        if (plano) {
          if (plano.preco < filters.priceRange.min || plano.preco > filters.priceRange.max) {
            return false;
          }
        }
      }
      
      // Filtro de dias para vencimento
      if (filters.daysToExpiration > 0 && aluno.tipoPlano === 'mensalidade') {
        const vencimento = new Date(aluno.vencimento);
        const hoje = new Date();
        const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes > filters.daysToExpiration) return false;
      }
      
      return true;
    });
  }, [alunos, filters, planos]);

  // Unidades disponíveis
  const unidades = useMemo(() => {
    const uniqueUnidades = [...new Set(alunos.map(a => a.unidade))];
    return uniqueUnidades.filter(Boolean);
  }, [alunos]);

  // Sugestões de busca
  const searchSuggestions = useMemo(() => {
    if (!filters.searchTerm || filters.searchTerm.length < 2) return [];
    
    const suggestions = new Set<string>();
    alunos.forEach(aluno => {
      if (fuzzyMatch(aluno.nome, filters.searchTerm)) suggestions.add(aluno.nome);
      if (fuzzyMatch(aluno.email, filters.searchTerm)) suggestions.add(aluno.email);
      if (fuzzyMatch(aluno.unidade, filters.searchTerm)) suggestions.add(aluno.unidade);
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [alunos, filters.searchTerm]);

  // Atualizar histórico de busca
  const updateSearchHistory = useCallback((term: string) => {
    if (!term || term.length < 3) return;
    
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Handlers para filtros
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (key === 'searchTerm' && value) {
      setShowSearchSuggestions(true);
      updateSearchHistory(value);
    } else if (key === 'searchTerm' && !value) {
      setShowSearchSuggestions(false);
    }
  }, [updateSearchHistory]);

  // Salvar filtro
  const saveCurrentFilter = useCallback((name: string) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      isStarred: false,
      createdAt: new Date().toISOString()
    };
    
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('savedFilters', JSON.stringify(updated));
    
    addNotification({
      type: 'success',
      title: 'Filtro salvo',
      message: `Filtro "${name}" salvo com sucesso!`
    });
  }, [filters, savedFilters, addNotification]);

  // Aplicar filtro salvo
  const applySavedFilter = useCallback((savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    setShowSavedFilters(false);
    
    addNotification({
      type: 'info',
      title: 'Filtro aplicado',
      message: `Filtro "${savedFilter.name}" aplicado`
    });
  }, [addNotification]);

  // Toggle star em filtro salvo
  const toggleFilterStar = useCallback((filterId: string) => {
    const updated = savedFilters.map(filter =>
      filter.id === filterId ? { ...filter, isStarred: !filter.isStarred } : filter
    );
    setSavedFilters(updated);
    localStorage.setItem('savedFilters', JSON.stringify(updated));
  }, [savedFilters]);

  // Limpar todos os filtros
  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      status: 'todos',
      unidade: 'todas',
      tipoPlano: 'todos',
      nivel: 'todos',
      dateRange: { start: '', end: '', field: 'dataMatricula' },
      priceRange: { min: 0, max: 1000 },
      daysToExpiration: 0
    });
    setSelectedAlunos([]);
  }, []);

  // Seleção em massa
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedAlunos(filteredAlunos.map(aluno => aluno.id));
    } else {
      setSelectedAlunos([]);
    }
  }, [filteredAlunos]);

  const handleSelectAluno = useCallback((id: number, selected: boolean) => {
    setSelectedAlunos(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(alunoId => alunoId !== id)
    );
  }, []);

  // Ações em lote
  const bulkChangeStatus = useCallback(async (newStatus: 'ativo' | 'inativo' | 'pendente') => {
    if (selectedAlunos.length === 0) return;
    
    try {
      setAlunos(prev => prev.map(aluno => 
        selectedAlunos.includes(aluno.id) 
          ? { ...aluno, status: newStatus }
          : aluno
      ));
      
      addNotification({
        type: 'success',
        title: 'Status atualizado',
        message: `${selectedAlunos.length} alunos marcados como ${newStatus}`
      });
      
      setSelectedAlunos([]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível atualizar o status'
      });
    }
  }, [selectedAlunos, setAlunos, addNotification]);

  const bulkDelete = useCallback(async () => {
    if (selectedAlunos.length === 0) return;
    
    const confirmed = window.confirm(`Tem certeza que deseja excluir ${selectedAlunos.length} alunos?`);
    if (!confirmed) return;
    
    try {
      setAlunos(prev => prev.filter(aluno => !selectedAlunos.includes(aluno.id)));
      
      addNotification({
        type: 'success',
        title: 'Alunos excluídos',
        message: `${selectedAlunos.length} alunos removidos com sucesso`
      });
      
      setSelectedAlunos([]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível excluir os alunos'
      });
    }
  }, [selectedAlunos, setAlunos, addNotification]);

  const bulkExport = useCallback(() => {
    if (selectedAlunos.length === 0) return;
    
    const selectedAlunosData = alunos.filter(aluno => selectedAlunos.includes(aluno.id));
    // Usar a função de exportação existente com dados filtrados
    exportToCSV(); // Adaptar para usar selectedAlunosData
    
    addNotification({
      type: 'success',
      title: 'Exportação iniciada',
      message: `Exportando ${selectedAlunos.length} alunos selecionados`
    });
  }, [selectedAlunos, alunos, addNotification]);

  // Funções de exportação (mantidas do código anterior)
  const formatDateByConfig = (date: Date, format: string): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'dd/mm/yyyy': return `${day}/${month}/${year}`;
      case 'mm/dd/yyyy': return `${month}/${day}/${year}`;
      case 'yyyy-mm-dd': return `${year}-${month}-${day}`;
      default: return `${day}/${month}/${year}`;
    }
  };

  const capitalize = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).replace('_', ' ');
  };

  const exportToCSVFile = async (data: Record<string, any>[], config: typeof exportConfig) => {
    if (data.length === 0) return;

    let csvContent = '';
    
    if (config.includeHeader) {
      const headers = Object.keys(data[0]!);
      csvContent += headers.join(config.separator) + '\n';
    }
    
    data.forEach(row => {
      const values = Object.values(row).map(value => {
        const stringValue = String(value || '');
        if (stringValue.includes(config.separator) || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent += values.join(config.separator) + '\n';
    });

    const blob = new Blob([csvContent], { 
      type: `text/csv;charset=${config.encoding};` 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alunos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = async (data: Record<string, any>[], config: typeof exportConfig) => {
    try {
      let excelContent = '';
      
      if (config.includeHeader) {
        const headers = Object.keys(data[0]!);
        excelContent += headers.join('\t') + '\n';
      }
      
      data.forEach(row => {
        const values = Object.values(row).map(value => String(value || ''));
        excelContent += values.join('\t') + '\n';
      });

      const blob = new Blob([excelContent], { 
        type: 'application/vnd.ms-excel;charset=utf-8;' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alunos_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      await exportToCSVFile(data, config);
    }
  };

  const exportToCSV = useCallback(async (customConfig?: Partial<typeof exportConfig>) => {
    try {
      const dataToExport = selectedAlunos.length > 0 
        ? alunos.filter(aluno => selectedAlunos.includes(aluno.id))
        : filteredAlunos;

      if (dataToExport.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há alunos para exportar com os filtros atuais'
        });
        return;
      }

      const config = { ...exportConfig, ...customConfig };
      
      addNotification({
        type: 'info',
        title: 'Exportando dados',
        message: 'Preparando arquivo para download...',
        duration: 2000
      });

      const csvData = dataToExport.map(aluno => {
        const plano = planos.find(p => p.id === aluno.planoId);
        const row: Record<string, any> = {};

        if (config.includeFields.nome) row['Nome'] = aluno.nome;
        if (config.includeFields.email) row['Email'] = aluno.email;
        if (config.includeFields.telefone) row['Telefone'] = aluno.telefone;
        if (config.includeFields.unidade) row['Unidade'] = aluno.unidade;
        if (config.includeFields.status) row['Status'] = aluno.status.toUpperCase();
        if (config.includeFields.tipoPlano) row['Tipo de Plano'] = aluno.tipoPlano === 'mensalidade' ? 'Mensalidade' : 'Plataforma Parceira';
        
        if (config.includeFields.plano) {
          if (aluno.tipoPlano === 'mensalidade') {
            row['Plano'] = plano ? `${plano.nome} - R$ ${plano.preco.toFixed(2)}` : 'N/A';
          } else {
            row['Plano'] = aluno.plataformaParceira || 'N/A';
          }
        }
        
        if (config.includeFields.vencimento) {
          if (aluno.tipoPlano === 'plataforma') {
            row['Vencimento'] = 'Sem vencimento';
          } else {
            const vencimento = new Date(aluno.vencimento);
            row['Vencimento'] = formatDateByConfig(vencimento, config.dateFormat);
          }
        }
        
        if (config.includeFields.dataMatricula) {
          const matricula = new Date(aluno.dataMatricula);
          row['Data de Matrícula'] = formatDateByConfig(matricula, config.dateFormat);
        }
        
        if (config.includeFields.nivel) row['Nível'] = capitalize(aluno.nivel);
        if (config.includeFields.objetivo && aluno.objetivo) row['Objetivo'] = aluno.objetivo;
        
        if (config.includeFields.nomesCheckIn && aluno.nomesCheckIn?.length) {
          row['Nomes para Check-in'] = aluno.nomesCheckIn.join('; ');
        }
        
        if (config.includeFields.profileImage) {
          row['Possui Foto'] = aluno.profileImage ? 'Sim' : 'Não';
        }

        return row;
      });

      if (config.format === 'excel') {
        await exportToExcel(csvData, config);
      } else {
        await exportToCSVFile(csvData, config);
      }

      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: `${csvData.length} alunos exportados com sucesso!`
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados. Tente novamente.'
      });
    }
  }, [filteredAlunos, alunos, selectedAlunos, planos, addNotification, exportConfig]);

  const quickExport = useCallback(() => {
    exportToCSV();
  }, [exportToCSV]);

  const customExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      nome: 'Nome',
      email: 'Email',
      telefone: 'Telefone',
      unidade: 'Unidade',
      status: 'Status',
      tipoPlano: 'Tipo de Plano',
      plano: 'Plano/Plataforma',
      vencimento: 'Vencimento',
      dataMatricula: 'Data de Matrícula',
      nivel: 'Nível',
      objetivo: 'Objetivo',
      nomesCheckIn: 'Nomes Check-in',
      profileImage: 'Possui Foto'
    };
    return labels[field] || field;
  };

  // Handlers para ações básicas
  const handleEdit = useCallback((aluno: Aluno) => {
    setEditingAluno(aluno);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      setAlunos(prev => prev.filter(a => a.id !== id));
      addNotification({
        type: 'success',
        title: 'Aluno excluído',
        message: 'Aluno removido com sucesso'
      });
    }
  }, [setAlunos, addNotification]);

  const handleAddNew = useCallback(() => {
    setEditingAluno(null);
    setShowModal(true);
  }, []);

  // Componentes internos
  const BulkActionsBar = () => {
    if (selectedAlunos.length === 0) return null;

    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedAlunos.length} aluno(s) selecionado(s)
            </span>
            <button
              onClick={() => setSelectedAlunos([])}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Limpar seleção
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => bulkChangeStatus('ativo')}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Ativar
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => bulkChangeStatus('inativo')}
              leftIcon={<UserX className="h-4 w-4" />}
            >
              Desativar
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={bulkExport}
              leftIcon={<FileText className="h-4 w-4" />}
            >
              Exportar
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={bulkDelete}
              leftIcon={<Trash className="h-4 w-4" />}
              className="text-red-600 hover:text-red-700"
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const AdvancedFilters = () => {
    const [filterName, setFilterName] = useState('');
    const [showSaveModal, setShowSaveModal] = useState(false);

    if (!showAdvancedFilters) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros Avançados
          </h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              leftIcon={<Star className="h-4 w-4" />}
            >
              Filtros Salvos ({savedFilters.length})
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSaveModal(true)}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar Filtro
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={clearAllFilters}
              leftIcon={<X className="h-4 w-4" />}
            >
              Limpar Tudo
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Filtros de Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Filtro por Data
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.dateRange.field}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  field: e.target.value as 'dataMatricula' | 'vencimento'
                })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="dataMatricula">Data de Matrícula</option>
                <option value="vencimento">Data de Vencimento</option>
              </select>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value
                })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Data início"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value
                })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Data fim"
              />
              <button
                onClick={() => handleFilterChange('dateRange', { start: '', end: '', field: 'dataMatricula' })}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Limpar datas
              </button>
            </div>
          </div>

          {/* Filtro de Preço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Faixa de Preço (Mensalistas)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Máximo</label>
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="1000"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                R$ {filters.priceRange.min} - R$ {filters.priceRange.max}
              </div>
            </div>
          </div>

          {/* Filtro de Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Dias para Vencimento
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.daysToExpiration}
                onChange={(e) => handleFilterChange('daysToExpiration', Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={0}>Todos</option>
                <option value={7}>Próximos 7 dias</option>
                <option value={15}>Próximos 15 dias</option>
                <option value={30}>Próximos 30 dias</option>
              </select>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleFilterChange('daysToExpiration', 7)}
                leftIcon={<AlertTriangle className="h-4 w-4" />}
              >
                Vencendo
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleFilterChange('daysToExpiration', 0)}
                leftIcon={<Calendar className="h-4 w-4" />}
              >
                Todos os prazos
              </Button>
            </div>
          </div>

          {/* Filtro por Nível */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Nível do Aluno
            </label>
            <select
              value={filters.nivel}
              onChange={(e) => handleFilterChange('nivel', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os níveis</option>
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
        </div>

        {/* Modal para salvar filtro */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Salvar Filtro
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do filtro
                  </label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Ex: Alunos em risco, Novos membros..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSaveModal(false);
                      setFilterName('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (filterName.trim()) {
                        saveCurrentFilter(filterName.trim());
                        setShowSaveModal(false);
                        setFilterName('');
                      }
                    }}
                    disabled={!filterName.trim()}
                    className="flex-1"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SavedFiltersPanel = () => {
    if (!showSavedFilters || savedFilters.length === 0) return null;

    const starredFilters = savedFilters.filter(f => f.isStarred);
    const regularFilters = savedFilters.filter(f => !f.isStarred);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filtros Salvos
        </h3>
        
        <div className="space-y-4">
          {starredFilters.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                Favoritos
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {starredFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-3 border border-yellow-200 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/10"
                  >
                    <button
                      onClick={() => applySavedFilter(filter)}
                      className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => toggleFilterStar(filter.id)}
                      className="ml-2 text-yellow-500 hover:text-yellow-600"
                    >
                      <StarOff className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {regularFilters.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Outros Filtros
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {regularFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <button
                      onClick={() => applySavedFilter(filter)}
                      className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => toggleFilterStar(filter.id)}
                      className="ml-2 text-gray-400 hover:text-yellow-500"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Estado local para o campo de busca (evita re-renders)
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);

  // Debounce para aplicar o filtro apenas após parar de digitar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchTerm !== filters.searchTerm) {
        setFilters(prev => ({ ...prev, searchTerm: localSearchTerm }));
        if (localSearchTerm && localSearchTerm.length >= 2) {
          setShowSearchSuggestions(true);
          updateSearchHistory(localSearchTerm);
        } else {
          setShowSearchSuggestions(false);
        }
      }
    }, 300); // Aguarda 300ms após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, filters.searchTerm, updateSearchHistory]);

  // Sincronizar quando filters.searchTerm muda externamente (filtros salvos, etc.)
  useEffect(() => {
    if (filters.searchTerm !== localSearchTerm) {
      setLocalSearchTerm(filters.searchTerm);
    }
  }, [filters.searchTerm]);

  // Modal de exportação (simplificado para não repetir código)
  const ExportModal: React.FC = () => {
    const [localConfig, setLocalConfig] = useState(exportConfig);

    const handleFieldChange = (field: string, checked: boolean) => {
      setLocalConfig(prev => ({
        ...prev,
        includeFields: {
          ...prev.includeFields,
          [field]: checked
        }
      }));
    };

    const handleConfigChange = (field: string, value: any) => {
      setLocalConfig(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleExport = () => {
      setExportConfig(localConfig);
      exportToCSV(localConfig);
      setShowExportModal(false);
    };

    if (!showExportModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Configurar Exportação
            </h3>
            <button
              onClick={() => setShowExportModal(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Campos para incluir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Campos para incluir
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(localConfig.includeFields).map(([field, checked]) => (
                  <label key={field} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleFieldChange(field, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getFieldLabel(field)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Resumo:</strong> {selectedAlunos.length > 0 ? selectedAlunos.length : filteredAlunos.length} alunos serão exportados com {' '}
                {Object.values(localConfig.includeFields).filter(Boolean).length} campos selecionados
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              className="flex-1"
            >
              Exportar Dados
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Alunos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie todos os alunos do centro de treinamento
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            variant="secondary"
            onClick={quickExport}
            leftIcon={<Download className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Exportação Rápida
          </Button>
          
          <Button
            variant="secondary"
            onClick={customExport}
            leftIcon={<Settings className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Exportação Personalizada
          </Button>
          
          <Button
            onClick={handleAddNew}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Novo Aluno
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alunos.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alunos.filter(a => a.status === 'ativo').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plataformas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alunos.filter(a => a.tipoPlano === 'plataforma').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selecionados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedAlunos.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar />

      {/* Basic Filters with Advanced Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros e Busca
          </h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              leftIcon={showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            >
              Filtros Avançados
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
            >
              Salvos ({savedFilters.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Smart Search - Renderizado diretamente */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Busca inteligente: nome, email, telefone, unidade..."
              value={localSearchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setLocalSearchTerm(value);
                if (value && value.length >= 2) {
                  setShowSearchSuggestions(true);
                } else {
                  setShowSearchSuggestions(false);
                }
              }}
              onFocus={() => {
                if (localSearchTerm && localSearchTerm.length >= 2) {
                  setShowSearchSuggestions(true);
                }
              }}
              onBlur={(e) => {
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (!relatedTarget || !relatedTarget.closest('.suggestions-container')) {
                  setTimeout(() => setShowSearchSuggestions(false), 200);
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoComplete="off"
              spellCheck="false"
            />
            
            {/* Indicador de busca ativa */}
            {localSearchTerm && localSearchTerm !== filters.searchTerm && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
            
            {/* Sugestões de busca */}
            {showSearchSuggestions && (localSearchTerm && localSearchTerm.length >= 2) && (
              <div className="suggestions-container absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {/* Sugestões baseadas no termo local */}
                {(() => {
                  const localSuggestions = new Set<string>();
                  alunos.forEach(aluno => {
                    if (fuzzyMatch(aluno.nome, localSearchTerm)) localSuggestions.add(aluno.nome);
                    if (fuzzyMatch(aluno.email, localSearchTerm)) localSuggestions.add(aluno.email);
                    if (fuzzyMatch(aluno.unidade, localSearchTerm)) localSuggestions.add(aluno.unidade);
                  });
                  
                  const suggestions = Array.from(localSuggestions).slice(0, 5);
                  
                  return suggestions.length > 0 ? (
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sugestões</p>
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={`sug-${index}-${suggestion}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLocalSearchTerm(suggestion);
                            setFilters(prev => ({ ...prev, searchTerm: suggestion }));
                            setShowSearchSuggestions(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded cursor-pointer transition-colors"
                        >
                          <span className="font-medium">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
                
                {searchHistory.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Buscas recentes</p>
                    {searchHistory.slice(0, 5).map((term, index) => (
                      <div
                        key={`hist-${index}-${term}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLocalSearchTerm(term);
                          setFilters(prev => ({ ...prev, searchTerm: term }));
                          setShowSearchSuggestions(false);
                        }}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer transition-colors"
                      >
                        <Search className="w-3 h-3 mr-2 opacity-50" />
                        {term}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>

          {/* Unit Filter */}
          <div>
            <select
              value={filters.unidade}
              onChange={(e) => handleFilterChange('unidade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas as unidades</option>
              {unidades.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>

          {/* Plan Type Filter */}
          <div>
            <select
              value={filters.tipoPlano}
              onChange={(e) => handleFilterChange('tipoPlano', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os tipos</option>
              <option value="mensalidade">Mensalidade</option>
              <option value="plataforma">Plataforma</option>
            </select>
          </div>

          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedAlunos.length === filteredAlunos.length && filteredAlunos.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selecionar todos ({filteredAlunos.length})
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AdvancedFilters />

      {/* Saved Filters Panel */}
      <SavedFiltersPanel />

      {/* Results Summary with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span className="font-medium">{filteredAlunos.length}</span> de <span className="font-medium">{alunos.length}</span> alunos
          </p>
          {selectedAlunos.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              {selectedAlunos.length} selecionados
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {(filters.searchTerm || filters.status !== 'todos' || filters.unidade !== 'todas' || 
            filters.tipoPlano !== 'todos' || filters.nivel !== 'todos' || 
            filters.dateRange.start || filters.priceRange.min > 0 || filters.daysToExpiration > 0) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAllFilters}
              leftIcon={<X className="h-4 w-4" />}
            >
              Limpar filtros
            </Button>
          )}
          
          {filteredAlunos.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSelectAll(false)}
              leftIcon={<Archive className="h-4 w-4" />}
            >
              Limpar seleção
            </Button>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleFilterChange('status', 'ativo')}
          leftIcon={<Check className="h-4 w-4 text-green-600" />}
          className="text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          Ver Ativos ({alunos.filter(a => a.status === 'ativo').length})
        </Button>
        
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleFilterChange('status', 'pendente')}
          leftIcon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
          className="text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
        >
          Ver Pendentes ({alunos.filter(a => a.status === 'pendente').length})
        </Button>
        
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleFilterChange('daysToExpiration', 7)}
          leftIcon={<Calendar className="h-4 w-4 text-orange-600" />}
          className="text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        >
          Vencendo (7 dias)
        </Button>
        
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleFilterChange('tipoPlano', 'plataforma')}
          leftIcon={<Zap className="h-4 w-4 text-purple-600" />}
          className="text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          Plataformas ({alunos.filter(a => a.tipoPlano === 'plataforma').length})
        </Button>
      </div>

      {/* Students Grid or Empty State */}
      {filteredAlunos.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum aluno encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filters.searchTerm || filters.status !== 'todos' || filters.unidade !== 'todas' || filters.tipoPlano !== 'todos'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece adicionando um novo aluno.'
            }
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {(filters.searchTerm || filters.status !== 'todos' || filters.unidade !== 'todas' || filters.tipoPlano !== 'todos') && (
              <Button 
                variant="secondary" 
                onClick={clearAllFilters}
                leftIcon={<X className="h-4 w-4" />}
              >
                Limpar Filtros
              </Button>
            )}
            {!filters.searchTerm && filters.status === 'todos' && (
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Adicionar Primeiro Aluno
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlunos.map((aluno) => (
            <StudentCard
              key={aluno.id}
              aluno={aluno}
              onEdit={handleEdit}
              onDelete={handleDelete}
              planos={planos}
              isSelected={selectedAlunos.includes(aluno.id)}
              onSelect={handleSelectAluno}
            />
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {filteredAlunos.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {filteredAlunos.length} alunos
            {selectedAlunos.length > 0 && ` • ${selectedAlunos.length} selecionados`}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ativos: {filteredAlunos.filter(a => a.status === 'ativo').length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pendentes: {filteredAlunos.filter(a => a.status === 'pendente').length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Inativos: {filteredAlunos.filter(a => a.status === 'inativo').length}
            </span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExportModal />

      <NovoAlunoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingAluno={editingAluno}
      />
    </div>
  );
});