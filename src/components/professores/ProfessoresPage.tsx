import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovoProfessorModal } from '@/components/forms';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash,
  Mail,
  Phone,
  Star,
  DollarSign,
  Clock,
  BookOpen,
  Check,
  UserX,
  FileText,
  Archive,
  Calculator,
  Settings,
  X,
  Building2,
  MapPin,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Professor } from '@/types';

interface ProfessorCardProps {
  professor: Professor;
  onEdit: (professor: Professor) => void;
  onDelete: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
}

interface ExportConfig {
  includeFields: {
    nome: boolean;
    email: boolean;
    telefone: boolean;
    experiencia: boolean;
    status: boolean;
    tipoPagamento: boolean;
    valorFixo: boolean;
    valoresVariaveis: boolean;
    valorAulao: boolean;
    especialidades: boolean;
    unidades: boolean;
  };
  format: 'csv' | 'excel';
  encoding: 'utf-8' | 'latin1';
  separator: ',' | ';' | '\t';
  includeHeader: boolean;
  dateFormat: 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'mm/dd/yyyy';
}

const ProfessorCard: React.FC<ProfessorCardProps> = ({ 
  professor, 
  onEdit, 
  onDelete, 
  isSelected, 
  onSelect 
}) => {
  const getPaymentInfo = () => {
    if (professor.tipoPagamento === 'fixo') {
      return {
        text: `R$ ${professor.valorFixo?.toFixed(2)}/mês`,
        type: 'Fixo',
        color: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        avgValue: professor.valorFixo || 0
      };
	  } else if (professor.tipoPagamento === 'hora-fixa') {
    // 🆕 NOVO: Suporte para hora fixa
    return {
      text: `R$ ${(professor.valorHoraFixa || 0).toFixed(2)}/hora`,
      type: 'Hora Fixa',
      color: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      avgValue: professor.valorHoraFixa || 0
    };
	  
    } else {
      const valores = professor.valoresHoras;
      
      if (valores) {
        const avgValue = (valores.umaHora + valores.duasHoras + valores.tresOuMaisHoras) / 3;
        
        return {
          text: `R$ ${valores.umaHora || 0} / ${valores.duasHoras || 0} / ${valores.tresOuMaisHoras || 0}`,
          type: 'Variável por Horas',
          color: 'text-green-600 dark:text-green-400',
          badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
          avgValue
        };
      }
      
      return {
        text: 'R$ 0 / 0 / 0',
        type: 'Variável por Horas',
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        avgValue: 0
      };
    }
  };

  const getExperienceInfo = () => {
    const exp = professor.experiencia;
    const colors = {
      '1-3': 'text-yellow-600 dark:text-yellow-400',
      '3-5': 'text-blue-600 dark:text-blue-400',
      '5-10': 'text-purple-600 dark:text-purple-400',
      '10+': 'text-red-600 dark:text-red-400'
    };
    return {
      text: exp === '10+' ? '10+ anos' : `${exp} anos`,
      color: colors[exp as keyof typeof colors] || 'text-gray-600 dark:text-gray-400'
    };
  };

  const paymentInfo = getPaymentInfo();
  const experienceInfo = getExperienceInfo();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/10' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(professor.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {professor.nome}
            </h3>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className={`text-sm ${experienceInfo.color}`}>
                {experienceInfo.text}
              </span>
            </div>
          </div>
        </div>
        
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          professor.ativo 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {professor.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{professor.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{professor.telefone}</span>
        </div>
      </div>

      {/* Seção de Unidades de Atuação */}
      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Unidades de Atuação</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {professor.unidades && professor.unidades.length > 0 ? (
            professor.unidades.map((unidade, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  professor.unidadePrincipal === unidade
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {professor.unidadePrincipal === unidade && (
                  <Star className="w-3 h-3 mr-1 fill-current" />
                )}
                {unidade}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              Nenhuma unidade definida
            </span>
          )}
        </div>
        {professor.unidadePrincipal && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <MapPin className="w-3 h-3 inline mr-1" />
            Principal: {professor.unidadePrincipal}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          <Star className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Especialidades</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {professor.especialidades.slice(0, 2).map((especialidade, index) => (
            <span 
              key={index}
              className="inline-block text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
              title={especialidade}
            >
              {especialidade.length > 15 ? `${especialidade.substring(0, 12)}...` : especialidade}
            </span>
          ))}
          {professor.especialidades.length > 2 && (
            <span 
              className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              title={professor.especialidades.slice(2).join(', ')}
            >
              +{professor.especialidades.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Pagamento</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calculator className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
  {professor.tipoPagamento === 'hora-fixa' ? 'Por hora' : 'Média'}: R$ {paymentInfo.avgValue.toFixed(0)}
</span>
          </div>
        </div>
        <div className={`text-sm font-medium ${paymentInfo.color} mb-1`}>
          {paymentInfo.text}
        </div>
        <span className={`inline-block text-xs px-2 py-1 rounded-full ${paymentInfo.badge}`}>
          {paymentInfo.type}
        </span>
      </div>

      {/* Seção de Valor Aulão */}
      {professor.valorAulao && professor.valorAulao > 0 && (
        <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-sm">🎯</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Aulão:
              </span>
            </div>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              R$ {professor.valorAulao.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(professor)}
          leftIcon={<Edit className="h-4 w-4" />}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(professor.id)}
          leftIcon={<Trash className="h-4 w-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

const ExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  exportConfig: ExportConfig;
  selectedCount: number;
  filteredCount: number;
  getFieldLabel: (field: string) => string;
}> = ({ isOpen, onClose, onExport, exportConfig, selectedCount, filteredCount, getFieldLabel }) => {
  const [localConfig, setLocalConfig] = useState<ExportConfig>(exportConfig);

  useEffect(() => {
    setLocalConfig(exportConfig);
  }, [exportConfig]);

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
    onExport(localConfig);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configurar Exportação
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
                    className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getFieldLabel(field)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formato do arquivo
              </label>
              <select
                value={localConfig.format}
                onChange={(e) => handleConfigChange('format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="csv">CSV (.csv)</option>
                <option value="excel">Excel (.xls)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Separador (CSV)
              </label>
              <select
                value={localConfig.separator}
                onChange={(e) => handleConfigChange('separator', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={localConfig.format === 'excel'}
              >
                <option value=",">Vírgula (,)</option>
                <option value=";">Ponto e vírgula (;)</option>
                <option value={"\t"}>Tabulação</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Codificação
              </label>
              <select
                value={localConfig.encoding}
                onChange={(e) => handleConfigChange('encoding', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="utf-8">UTF-8</option>
                <option value="latin1">Latin-1</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeHeader"
                checked={localConfig.includeHeader}
                onChange={(e) => handleConfigChange('includeHeader', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="includeHeader" className="text-sm text-gray-600 dark:text-gray-400">
                Incluir cabeçalho
              </label>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Resumo:</strong> {selectedCount > 0 ? selectedCount : filteredCount} professores serão exportados com {' '}
              {Object.values(localConfig.includeFields).filter(Boolean).length} campos selecionados
            </p>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
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

export const ProfessoresPage: React.FC = memo(() => {
  const { dadosMockados, setProfessores, userLogado } = useAppState();
  const { professores, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [showModal, setShowModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [selectedProfessores, setSelectedProfessores] = useState<number[]>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'todos',
    experiencia: 'todas',
    tipoPagamento: 'todos',
    unidade: 'todas'
  });

  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    includeFields: {
      nome: true,
      email: true,
      telefone: true,
      experiencia: true,
      status: true,
      tipoPagamento: true,
      valorFixo: true,
      valoresVariaveis: true,
      valorAulao: true,
      especialidades: true,
      unidades: true
    },
    format: 'csv',
    encoding: 'utf-8',
    separator: ',',
    includeHeader: true,
    dateFormat: 'dd/mm/yyyy'
  });

  // Unidades disponíveis baseadas no perfil do usuário
  const unidadesDisponiveis = useMemo(() => {
    const unidadesAtivas = unidades.filter(u => u.ativa);
    
    if (userLogado?.perfil === 'admin') {
      return unidadesAtivas;
    } else if (userLogado?.perfil === 'gestor') {
      return unidadesAtivas.filter(u => 
        userLogado.unidades?.includes(u.nome) || userLogado.unidade === u.nome
      );
    }
    
    return unidadesAtivas;
  }, [unidades, userLogado]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchTerm !== filters.searchTerm) {
        setFilters(prev => ({ ...prev, searchTerm: localSearchTerm }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, filters.searchTerm]);

  useEffect(() => {
    if (filters.searchTerm !== localSearchTerm) {
      setLocalSearchTerm(filters.searchTerm);
    }
  }, [filters.searchTerm]);

  const fuzzyMatch = (text: string, search: string): boolean => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    return textLower.includes(searchLower);
  };

  const filteredProfessores = useMemo(() => {
    let professoresFiltered = professores;

    // Filtrar por perfil do usuário
    if (userLogado?.perfil === 'gestor') {
      const unidadesGerenciadas = userLogado.unidades || [userLogado.unidade].filter(Boolean);
      professoresFiltered = professores.filter(professor => 
        professor.unidades?.some(unidade => unidadesGerenciadas.includes(unidade))
      );
    }

    return professoresFiltered.filter(professor => {
      if (filters.searchTerm) {
        const searchFields = [
          professor.nome,
          professor.email,
          professor.telefone,
          ...professor.especialidades,
          ...(professor.unidades || [])
        ];
        
        const matchesSearch = searchFields.some(field => 
          fuzzyMatch(field, filters.searchTerm)
        );
        
        if (!matchesSearch) return false;
      }
      
      const matchesStatus = filters.status === 'todos' || 
                           (filters.status === 'ativo' && professor.ativo) ||
                           (filters.status === 'inativo' && !professor.ativo);
      
      if (!matchesStatus) return false;
      
      if (filters.experiencia !== 'todas' && professor.experiencia !== filters.experiencia) return false;
      if (filters.tipoPagamento !== 'todos' && professor.tipoPagamento !== filters.tipoPagamento) return false;
      if (filters.unidade !== 'todas' && !professor.unidades?.includes(filters.unidade)) return false;
      
      return true;
    });
  }, [professores, filters, userLogado]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      status: 'todos',
      experiencia: 'todas',
      tipoPagamento: 'todos',
      unidade: 'todas'
    });
    setLocalSearchTerm('');
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedProfessores(filteredProfessores.map(professor => professor.id));
    } else {
      setSelectedProfessores([]);
    }
  }, [filteredProfessores]);

  const handleSelectProfessor = useCallback((id: number, selected: boolean) => {
    setSelectedProfessores(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(professorId => professorId !== id)
    );
  }, []);

  const bulkChangeStatus = useCallback(async (newStatus: boolean) => {
    if (selectedProfessores.length === 0) return;
    
    try {
      setProfessores(prev => prev.map(professor => 
        selectedProfessores.includes(professor.id) 
          ? { ...professor, ativo: newStatus }
          : professor
      ));
      
      addNotification({
        type: 'success',
        title: 'Status atualizado',
        message: `${selectedProfessores.length} professores ${newStatus ? 'ativados' : 'desativados'}`
      });
      
      setSelectedProfessores([]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível atualizar o status'
      });
    }
  }, [selectedProfessores, setProfessores, addNotification]);

  const bulkDelete = useCallback(async () => {
    if (selectedProfessores.length === 0) return;
    
    const confirmed = window.confirm(`Tem certeza que deseja excluir ${selectedProfessores.length} professores?`);
    if (!confirmed) return;
    
    try {
      setProfessores(prev => prev.filter(professor => !selectedProfessores.includes(professor.id)));
      
      addNotification({
        type: 'success',
        title: 'Professores excluídos',
        message: `${selectedProfessores.length} professores removidos`
      });
      
      setSelectedProfessores([]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível excluir os professores'
      });
    }
  }, [selectedProfessores, setProfessores, addNotification]);

  const exportToCSVFile = async (data: Record<string, any>[], config: ExportConfig) => {
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
    link.download = `professores_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = async (data: Record<string, any>[], config: ExportConfig) => {
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
      link.download = `professores_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      await exportToCSVFile(data, config);
    }
  };

  const exportToCSV = useCallback(async (customConfig?: Partial<ExportConfig>) => {
    try {
      const dataToExport = selectedProfessores.length > 0 
        ? professores.filter(professor => selectedProfessores.includes(professor.id))
        : filteredProfessores;

      if (dataToExport.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há professores para exportar com os filtros atuais'
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

      const csvData = dataToExport.map(professor => {
        const row: Record<string, any> = {};

        if (config.includeFields.nome) row['Nome'] = professor.nome;
        if (config.includeFields.email) row['Email'] = professor.email;
        if (config.includeFields.telefone) row['Telefone'] = professor.telefone;
        if (config.includeFields.experiencia) row['Experiência'] = professor.experiencia;
        if (config.includeFields.status) row['Status'] = professor.ativo ? 'Ativo' : 'Inativo';
        if (config.includeFields.tipoPagamento) row['Tipo de Pagamento'] = professor.tipoPagamento === 'fixo' ? 'Fixo' : 'Variável por Horas';
        
        if (config.includeFields.valorFixo && professor.tipoPagamento === 'fixo') {
          row['Valor Fixo'] = professor.valorFixo ? `R$ ${professor.valorFixo.toFixed(2)}` : '';
        }
        
        if (config.includeFields.valoresVariaveis && professor.tipoPagamento === 'horas-variaveis') { 
          const valores = professor.valoresHoras;
          
          if (valores) {
            row['Valores Variáveis'] = `1h: R$ ${valores.umaHora || 0} | 2h: R$ ${valores.duasHoras || 0} | 3h+: R$ ${valores.tresOuMaisHoras || 0}`;
          }
        }
        
        if (config.includeFields.valorAulao) {
          row['Valor Aulão'] = professor.valorAulao ? `R$ ${professor.valorAulao.toFixed(2)}` : 'Não definido';
        }

        if (config.includeFields.especialidades) {
          row['Especialidades'] = professor.especialidades.join('; ');
        }

        if (config.includeFields.unidades) {
          row['Unidades'] = professor.unidades ? professor.unidades.join('; ') : 'Nenhuma';
          if (professor.unidadePrincipal) {
            row['Unidade Principal'] = professor.unidadePrincipal;
          }
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
        message: `${csvData.length} professores exportados com sucesso!`
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados. Tente novamente.'
      });
    }
  }, [filteredProfessores, professores, selectedProfessores, addNotification, exportConfig]);

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
      experiencia: 'Experiência',
      status: 'Status',
      tipoPagamento: 'Tipo de Pagamento',
      valorFixo: 'Valor Fixo',
      valoresVariaveis: 'Valores Variáveis',
      valorAulao: 'Valor Aulão',
      especialidades: 'Especialidades',
      unidades: 'Unidades'
    };
    return labels[field] || field;
  };

  const handleEdit = useCallback((professor: Professor) => {
    setEditingProfessor(professor);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      setProfessores(prev => prev.filter(p => p.id !== id));
      addNotification({
        type: 'success',
        title: 'Professor excluído',
        message: 'Professor removido com sucesso'
      });
    }
  }, [setProfessores, addNotification]);

  const handleAddNew = useCallback(() => {
    setEditingProfessor(null);
    setShowModal(true);
  }, []);

  const bulkExport = useCallback(() => {
    if (selectedProfessores.length === 0) return;
    exportToCSV();
  }, [selectedProfessores, exportToCSV]);

  const BulkActionsBar = () => {
    if (selectedProfessores.length === 0) return null;

    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedProfessores.length} professor(es) selecionado(s)
            </span>
            <button
              onClick={() => setSelectedProfessores([])}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Limpar seleção
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => bulkChangeStatus(true)}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Ativar
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => bulkChangeStatus(false)}
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

  const hasActiveFilters = filters.status !== 'todos' || 
                          filters.experiencia !== 'todas' || 
                          filters.tipoPagamento !== 'todos' ||
                          filters.unidade !== 'todas' ||
                          filters.searchTerm !== '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Professores
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie todos os professores do centro de treinamento
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
            Novo Professor
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{professores.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {professores.filter(p => p.ativo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pag. Fixo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {professores.filter(p => p.tipoPagamento === 'fixo').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Por Horas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {professores.filter(p => p.tipoPagamento === 'horas-variaveis').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Experientes (5+)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {professores.filter(p => p.experiencia === '5-10' || p.experiencia === '10+').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Archive className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selecionados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProfessores.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <BulkActionsBar />

      {/* Seção de filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col space-y-4">
          {/* Barra de busca principal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone, especialidade ou unidade..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoComplete="off"
              spellCheck="false"
            />
            
            {localSearchTerm && localSearchTerm !== filters.searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Botão para mostrar/ocultar filtros */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="h-4 w-4" />}
              rightIcon={showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              className="text-sm"
            >
              Filtros Avançados {hasActiveFilters && '(*)'}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="secondary"
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="todos">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experiência</label>
                <select
                  value={filters.experiencia}
                  onChange={(e) => handleFilterChange('experiencia', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="todas">Toda experiência</option>
                  <option value="1-3">1-3 anos</option>
                  <option value="3-5">3-5 anos</option>
                  <option value="5-10">5-10 anos</option>
                  <option value="10+">10+ anos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Pagamento</label>
                <select
                  value={filters.tipoPagamento}
                  onChange={(e) => handleFilterChange('tipoPagamento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="fixo">Fixo</option>
				  <option value="hora-fixa">Hora Fixa</option>
                  <option value="horas-variaveis">Variável por Horas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade</label>
                <select
                  value={filters.unidade}
                  onChange={(e) => handleFilterChange('unidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="todas">Todas as unidades</option>
                  {unidadesDisponiveis.map(unidade => (
                    <option key={unidade.id} value={unidade.nome}>
                      {unidade.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Seleção em massa */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="selectAllProfessores"
                checked={selectedProfessores.length === filteredProfessores.length && filteredProfessores.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="selectAllProfessores" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selecionar todos ({filteredProfessores.length})
              </label>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredProfessores.length} de {professores.length} professores
            </p>
          </div>
        </div>
      </div>

      {/* Lista de professores */}
      {filteredProfessores.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum professor encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {localSearchTerm || hasActiveFilters ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando um novo professor.'}
          </p>
          {!localSearchTerm && !hasActiveFilters && (
            <div className="mt-6">
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Adicionar Primeiro Professor
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessores.map((professor) => (
            <ProfessorCard
              key={professor.id}
              professor={professor}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isSelected={selectedProfessores.includes(professor.id)}
              onSelect={handleSelectProfessor}
            />
          ))}
        </div>
      )}

      {filteredProfessores.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {filteredProfessores.length} professores
            {selectedProfessores.length > 0 && ` • ${selectedProfessores.length} selecionados`}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ativos: {filteredProfessores.filter(p => p.ativo).length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Fixo: {filteredProfessores.filter(p => p.tipoPagamento === 'fixo').length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Variável: {filteredProfessores.filter(p => p.tipoPagamento === 'horas-variaveis').length}
            </span>
          </div>
        </div>
      )}

      {/* Modais */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={(config) => {
          setExportConfig(config);
          exportToCSV(config);
          setShowExportModal(false);
        }}
        exportConfig={exportConfig}
        selectedCount={selectedProfessores.length}
        filteredCount={filteredProfessores.length}
        getFieldLabel={getFieldLabel}
      />

      <NovoProfessorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingProfessor={editingProfessor}
      />
    </div>
  );
});