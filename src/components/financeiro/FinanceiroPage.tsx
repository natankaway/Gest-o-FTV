import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovaTransacaoModal } from '@/components/forms';
import { 
  DollarSign, Plus, Search, Download, TrendingUp, TrendingDown, Calendar, Building2, 
  Filter, AlertTriangle, Eye, EyeOff, PieChart, BarChart3, Activity, Target,
  Clock, AlertCircle, Bell, CreditCard, FileText, Wallet, History,
  ChevronUp, ChevronDown, Send, Check, X, ArrowUpRight, ArrowDownRight,
  Edit2, Save, FileSpreadsheet
} from 'lucide-react';
import type { RegistroFinanceiro, Unidade, User } from '@/types';

// ===== INTERFACES ADICIONAIS =====

interface SaldoUnidade {
  unidadeId: string;
  unidadeName: string;
  saldo: number;
  ultimaAtualizacao: string;
  historicoAlteracoes: {
    data: string;
    usuario: string;
    valorAnterior: number;
    valorNovo: number;
    motivo?: string;
  }[];
}

interface Parcela {
  id: string;
  transacaoOrigemId: number;
  descricao: string;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'paga' | 'quitada-antecipadamente';
  dataPagamento?: string;
  unidade: string;
}

// ===== COMPONENTES AUXILIARES =====

// Componente de Saldo por Unidade
interface SaldoUnidadeCardProps {
  saldo: SaldoUnidade;
  onEdit: (unidadeId: string, novoSaldo: number, motivo: string) => void;
  canEdit: boolean;
  showValues: boolean;
}

const SaldoUnidadeCard: React.FC<SaldoUnidadeCardProps> = ({ saldo, onEdit, canEdit, showValues }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [novoSaldo, setNovoSaldo] = useState(saldo.saldo.toString());
  const [motivo, setMotivo] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const formatCurrency = (value: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSave = () => {
    const valor = parseFloat(novoSaldo.replace(',', '.'));
    if (!isNaN(valor) && valor >= 0) {
      onEdit(saldo.unidadeId, valor, motivo);
      setIsEditing(false);
      setMotivo('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{saldo.unidadeName}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Atualizado: {new Date(saldo.ultimaAtualizacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Novo Saldo</label>
            <input
              type="text"
              value={novoSaldo}
              onChange={(e) => setNovoSaldo(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Motivo da Alteração</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              placeholder="Ex: Depósito, Sangria, Ajuste..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNovoSaldo(saldo.saldo.toString());
                setMotivo('');
              }}
              className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(saldo.saldo)}
        </div>
      )}

      {showHistory && saldo.historicoAlteracoes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Histórico</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {saldo.historicoAlteracoes.slice(-3).reverse().map((alt, idx) => (
              <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>{new Date(alt.data).toLocaleDateString('pt-BR')}</span>
                  <span className="font-medium">
                    {formatCurrency(alt.valorAnterior)} → {formatCurrency(alt.valorNovo)}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-500">
                  {alt.usuario} {alt.motivo && `- ${alt.motivo}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Parcelas
interface ParcelasManagerProps {
  parcelas: Parcela[];
  onQuitarParcela: (parcelaId: string) => void;
  showValues: boolean;
}

const ParcelasManager: React.FC<ParcelasManagerProps> = ({ parcelas, onQuitarParcela, showValues }) => {
  const formatCurrency = (value: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const parcelasPendentes = parcelas.filter(p => p.status === 'pendente');
  const totalPendente = parcelasPendentes.reduce((acc, p) => acc + p.valor, 0);

  if (parcelasPendentes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-600" />
          Parcelas Pendentes
          <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-full">
            {parcelasPendentes.length} parcelas
          </span>
        </h3>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total: {formatCurrency(totalPendente)}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {parcelasPendentes.map((parcela) => (
          <div key={parcela.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {parcela.descricao}
                </span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded">
                  {parcela.numeroParcela}/{parcela.totalParcelas}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Vencimento: {new Date(parcela.vencimento).toLocaleDateString('pt-BR')} • {parcela.unidade}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(parcela.valor)}
              </span>
              <button
                onClick={() => onQuitarParcela(parcela.id)}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de Acesso Negado
const AccessDenied: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Acesso Negado
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Você não tem permissão para acessar o módulo financeiro. 
        Apenas administradores e gestores podem visualizar essas informações.
      </p>
    </div>
  </div>
);

// Componente de Card KPI Aprimorado
interface EnhancedKPICardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  color: string;
  subtitle?: string;
  comparison?: number;
  showValues: boolean;
}

const EnhancedKPICard: React.FC<EnhancedKPICardProps> = ({ 
  title, value, icon: Icon, trend, color, subtitle, comparison, showValues 
}) => {
  const formatCurrency = (val: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            {trend !== undefined && (
              <span className={`flex items-center text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
          <p className={`text-2xl font-bold mt-2 ${color}`}>
            {formatCurrency(value)}
          </p>
          {comparison !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Mês anterior: {formatCurrency(comparison)}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('600', '100')} dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      
      {/* Mini gráfico sparkline */}
      <div className="mt-4 h-8 flex items-end gap-1">
        {[40, 60, 45, 70, 65, 80, 75, 90, 85, 95, 100, value/500].map((height, i) => (
          <div
            key={i}
            className={`flex-1 ${color.replace('text', 'bg')} opacity-20 rounded-t`}
            style={{ height: `${Math.min(height, 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
};

// Componente de Cards de Resumo com Saldo
interface SummaryCardsProps {
  receitas: number;
  despesas: number;
  saldo: number;
  pendentes: number;
  saldoUnidade?: number;
  showValues: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  receitas, despesas, saldo, pendentes, saldoUnidade, showValues 
}) => {
  const formatCurrency = (value: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Receitas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(receitas)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center">
          <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Despesas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(despesas)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center">
          <DollarSign className={`h-8 w-8 ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resultado</p>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(pendentes)}</p>
          </div>
        </div>
      </div>

      {saldoUnidade !== undefined && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo em Caixa</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(saldoUnidade)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Tabela Financeira
interface FinancialTableProps {
  registros: RegistroFinanceiro[];
  onEdit: (registro: RegistroFinanceiro) => void;
  showValues: boolean;
}

const FinancialTable: React.FC<FinancialTableProps> = ({ registros, onEdit, showValues }) => {
  const formatCurrency = (value: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (registros.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum registro encontrado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Nenhum lançamento corresponde aos filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Unidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {registros.map((registro) => {
            const isParcela = (registro as any).isParcela;
            const parcelaId = (registro as any).parcelaId;
            
            return (
              <tr key={registro.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isParcela ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(registro.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {isParcela && <CreditCard className="w-4 h-4 text-purple-600" />}
                    <div>
                      {registro.descricao}
                      {registro.aluno && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {registro.aluno}
                        </div>
                      )}
                      {isParcela && (
                        <div className="text-xs text-purple-600 dark:text-purple-400">
                          Vencimento da parcela
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {registro.categoria}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    registro.tipo === 'receita' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : isParcela
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {isParcela ? 'Parcela' : (registro.tipo === 'receita' ? 'Receita' : 'Despesa')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {registro.unidade}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={
                    registro.tipo === 'receita' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }>
                    {registro.tipo === 'receita' ? '+' : '-'} {formatCurrency(registro.valor)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {isParcela ? (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          // Aqui você pode chamar a função handleQuitarParcela
                          if (window.confirm('Confirma o pagamento desta parcela?')) {
                            // handleQuitarParcela(parcelaId);
                            console.log('Quitar parcela:', parcelaId);
                          }
                        }}
                      >
                        Quitar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(registro)}
                      >
                        Detalhes
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====

export const FinanceiroPage: React.FC = memo(() => {
  const { dadosMockados, userLogado, setFinanceiro } = useAppState();
  const { financeiro, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  // Inicializar filtro de unidade baseado no perfil do usuário
  const [unidadeFilter, setUnidadeFilter] = useState(() => {
    if (userLogado?.perfil === 'admin') {
      return 'todas';
    } else if (userLogado?.perfil === 'gestor' && (userLogado as any).unidades) {
      // Para gestor, iniciar com a primeira unidade permitida
      const unidadesPermitidas = (userLogado as any).unidades as string[];
      return unidadesPermitidas.length === 1 ? unidadesPermitidas[0] : 'todas';
    }
    return 'todas';
  });
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroFinanceiro | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'table' | 'analytics'>('dashboard');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  
  // Estado para saldos das unidades (mock - seria do backend)
  const [saldosUnidades, setSaldosUnidades] = useState<SaldoUnidade[]>(() => {
    // Dados mock completos - apenas para demonstração
    const todosSaldos = [
      {
        unidadeId: '1',
        unidadeName: 'Centro',
        saldo: 15000,
        ultimaAtualizacao: new Date().toISOString(),
        historicoAlteracoes: [
          {
            data: new Date(Date.now() - 86400000).toISOString(),
            usuario: 'Admin',
            valorAnterior: 12000,
            valorNovo: 15000,
            motivo: 'Depósito diário'
          }
        ]
      },
      {
        unidadeId: '2',
        unidadeName: 'Zona Sul',
        saldo: 8500,
        ultimaAtualizacao: new Date().toISOString(),
        historicoAlteracoes: []
      },
      {
        unidadeId: '3',
        unidadeName: 'Barra',
        saldo: 5200,
        ultimaAtualizacao: new Date().toISOString(),
        historicoAlteracoes: []
      }
    ];
    
    // Filtrar baseado nas permissões do usuário
    if (userLogado?.perfil === 'admin') {
      return todosSaldos;
    } else if (userLogado?.perfil === 'gestor' && (userLogado as any).unidades) {
      const unidadesPermitidas = (userLogado as any).unidades as string[];
      return todosSaldos.filter(saldo => unidadesPermitidas.includes(saldo.unidadeName));
    }
    
    return [];
  });

  // Estado para parcelas (mock - seria do backend)
  const [parcelas, setParcelas] = useState<Parcela[]>([
    {
      id: '1',
      transacaoOrigemId: 1,
      descricao: 'Material Esportivo',
      numeroParcela: 2,
      totalParcelas: 6,
      valor: 500,
      vencimento: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'pendente',
      unidade: 'Centro'
    },
    {
      id: '2',
      transacaoOrigemId: 2,
      descricao: 'Equipamento de Treino',
      numeroParcela: 3,
      totalParcelas: 12,
      valor: 800,
      vencimento: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: 'pendente',
      unidade: 'Zona Sul'
    }
  ]);

  // Verificação de acesso
  if (!userLogado || (userLogado.perfil !== 'admin' && userLogado.perfil !== 'gestor')) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Módulo Financeiro
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Controle financeiro completo do centro de treinamento
            </p>
          </div>
        </div>
        <AccessDenied />
      </div>
    );
  }

  // Unidades permitidas - Corrigido
  const allowedUnits = useMemo(() => {
    if (userLogado.perfil === 'admin') {
      return unidades.map(u => u.nome);
    } else if (userLogado.perfil === 'gestor' && (userLogado as any).unidades) {
      return (userLogado as any).unidades as string[];
    }
    return [];
  }, [userLogado, unidades]);

  // Filtros e cálculos
  const scopedFinanceiro = useMemo(() => {
    return financeiro.filter(registro => {
      if (!allowedUnits.includes(registro.unidade || '')) {
        return false;
      }
      return true;
    });
  }, [financeiro, allowedUnits]);

  const filteredRegistros = useMemo(() => {
    // Combinar registros financeiros regulares com parcelas pendentes
    const registrosRegulares = scopedFinanceiro.filter(registro => {
      const matchesSearch = registro.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (registro.aluno && registro.aluno.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (registro.categoria && registro.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTipo = tipoFilter === 'todos' || registro.tipo === tipoFilter;
      const matchesStatus = statusFilter === 'todos' || registro.status === statusFilter;
      const matchesCategoria = categoriaFilter === 'todos' || registro.categoria === categoriaFilter;
      const matchesUnidade = unidadeFilter === 'todas' || registro.unidade === unidadeFilter;
      
      const dataRegistro = new Date(registro.data);
      const matchesDataInicial = !dataInicial || dataRegistro >= new Date(dataInicial);
      const matchesDataFinal = !dataFinal || dataRegistro <= new Date(dataFinal);
      
      return matchesSearch && matchesTipo && matchesStatus && matchesCategoria && 
             matchesUnidade && matchesDataInicial && matchesDataFinal;
    });

    // Converter parcelas pendentes em formato de registro financeiro para exibição
    const parcelasComoRegistros = parcelas
      .filter(parcela => {
        // Filtrar parcelas baseado nos mesmos critérios
        const matchesSearch = parcela.descricao.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = tipoFilter === 'todos' || tipoFilter === 'despesa'; // Parcelas são sempre despesas
        const matchesStatus = statusFilter === 'todos' || statusFilter === 'pendente'; // Parcelas pendentes
        const matchesCategoria = categoriaFilter === 'todos' || categoriaFilter === 'Material'; // Categoria padrão
        const matchesUnidade = unidadeFilter === 'todas' || parcela.unidade === unidadeFilter;
        
        const dataVencimento = new Date(parcela.vencimento);
        const matchesDataInicial = !dataInicial || dataVencimento >= new Date(dataInicial);
        const matchesDataFinal = !dataFinal || dataVencimento <= new Date(dataFinal);
        
        return parcela.status === 'pendente' && matchesSearch && matchesTipo && matchesStatus && 
               matchesCategoria && matchesUnidade && matchesDataInicial && matchesDataFinal;
      })
      .map(parcela => ({
        id: `parcela-${parcela.id}`,
        data: parcela.vencimento,
        descricao: `${parcela.descricao} (${parcela.numeroParcela}/${parcela.totalParcelas})`,
        categoria: 'Material/Equipamento',
        tipo: 'despesa' as const,
        valor: parcela.valor,
        status: 'pendente' as const,
        metodo: 'Parcelado',
        unidade: parcela.unidade,
        isParcela: true, // Flag para identificar que é uma parcela
        parcelaId: parcela.id
      } as RegistroFinanceiro & { isParcela: boolean; parcelaId: string }));

    // Combinar e ordenar por data (mais recente primeiro)
    return [...registrosRegulares, ...parcelasComoRegistros].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [scopedFinanceiro, parcelas, searchTerm, tipoFilter, statusFilter, categoriaFilter, unidadeFilter, dataInicial, dataFinal]);

  // Estatísticas incluindo parcelas futuras
  const stats = useMemo(() => {
    const receitas = filteredRegistros
      .filter(r => r.tipo === 'receita' && !(r as any).isParcela)
      .reduce((acc, r) => acc + r.valor, 0);
    
    const despesasRegulares = filteredRegistros
      .filter(r => r.tipo === 'despesa' && !(r as any).isParcela)
      .reduce((acc, r) => acc + r.valor, 0);
    
    // Parcelas pendentes (já incluídas em filteredRegistros, mas vamos calculá-las separadamente também)
    const parcelasPendentesFiltered = parcelas.filter(p => 
      p.status === 'pendente' && 
      (unidadeFilter === 'todas' || p.unidade === unidadeFilter) &&
      allowedUnits.includes(p.unidade)
    );
    const despesasFuturas = parcelasPendentesFiltered.reduce((acc, p) => acc + p.valor, 0);
    
    // Total de despesas incluindo as regulares já pagas
    const despesas = despesasRegulares;
    
    const saldo = receitas - despesas;
    const pendentes = filteredRegistros
      .filter(r => r.status === 'pendente' && r.tipo === 'receita' && !(r as any).isParcela)
      .reduce((acc, r) => acc + r.valor, 0);
    const vencidos = filteredRegistros
      .filter(r => r.status === 'vencido' && !(r as any).isParcela)
      .reduce((acc, r) => acc + r.valor, 0);
    
    return { 
      receitas, 
      despesas,
      despesasFuturas,
      saldo, 
      pendentes,
      vencidos,
      inadimplencia: pendentes + vencidos
    };
  }, [filteredRegistros, parcelas, unidadeFilter, allowedUnits]);

  // Saldo da unidade selecionada - Corrigido para respeitar permissões
  const saldoUnidadeAtual = useMemo(() => {
    // Filtrar saldos apenas das unidades permitidas para o usuário
    const saldosPermitidos = saldosUnidades.filter(s => allowedUnits.includes(s.unidadeName));
    
    if (unidadeFilter === 'todas') {
      // Se for admin, mostra total de todas as unidades
      // Se for gestor, mostra total apenas das suas unidades
      return saldosPermitidos.reduce((acc, s) => acc + s.saldo, 0);
    }
    
    // Buscar saldo da unidade específica, mas apenas se o usuário tem acesso
    const saldo = saldosPermitidos.find(s => s.unidadeName === unidadeFilter);
    return saldo ? saldo.saldo : 0;
  }, [saldosUnidades, unidadeFilter, allowedUnits]);

  // Categorias únicas
  const categorias = useMemo(() => {
    return [...new Set(scopedFinanceiro.map(r => r.categoria))].filter(Boolean);
  }, [scopedFinanceiro]);

  // Handlers
  const handleEdit = useCallback((registro: RegistroFinanceiro) => {
    setEditingRegistro(registro);
    setShowModal(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingRegistro(null);
    setShowModal(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setTipoFilter('todos');
    setStatusFilter('todos');
    setCategoriaFilter('todos');
    setUnidadeFilter('todas');
    setDataInicial('');
    setDataFinal('');
  }, []);

  // Handler para editar saldo de unidade
  const handleEditSaldo = useCallback((unidadeId: string, novoSaldo: number, motivo: string) => {
    setSaldosUnidades(prev => prev.map(saldo => {
      if (saldo.unidadeId === unidadeId) {
        return {
          ...saldo,
          saldo: novoSaldo,
          ultimaAtualizacao: new Date().toISOString(),
          historicoAlteracoes: [
            ...saldo.historicoAlteracoes,
            {
              data: new Date().toISOString(),
              usuario: userLogado?.nome || 'Usuário',
              valorAnterior: saldo.saldo,
              valorNovo: novoSaldo,
              motivo
            }
          ]
        };
      }
      return saldo;
    }));
    
    addNotification({
      type: 'success',
      title: 'Saldo atualizado',
      message: `Saldo da unidade atualizado com sucesso`
    });
  }, [userLogado, addNotification]);

  // Handler para quitar parcela
  const handleQuitarParcela = useCallback((parcelaId: string) => {
    const parcela = parcelas.find(p => p.id === parcelaId);
    if (!parcela) return;

    // Quitar a parcela atual
    setParcelas(prev => prev.map(p => 
      p.id === parcelaId 
        ? { ...p, status: 'paga' as const, dataPagamento: new Date().toISOString() }
        : p
    ));

    // Quitar parcelas futuras da mesma transação
    if (window.confirm('Deseja quitar todas as parcelas restantes desta compra?')) {
      setParcelas(prev => prev.map(p => 
        p.transacaoOrigemId === parcela.transacaoOrigemId && p.status === 'pendente'
          ? { ...p, status: 'quitada-antecipadamente' as const, dataPagamento: new Date().toISOString() }
          : p
      ));
      
      addNotification({
        type: 'success',
        title: 'Parcelas quitadas',
        message: 'Todas as parcelas foram quitadas com sucesso'
      });
    } else {
      addNotification({
        type: 'success',
        title: 'Parcela quitada',
        message: 'Parcela quitada com sucesso'
      });
    }
  }, [parcelas, addNotification]);

  // Exportação melhorada
  const handleExport = useCallback(() => {
    try {
      if (filteredRegistros.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há registros financeiros para exportar'
        });
        return;
      }

      // Agrupar por unidade
      const registrosPorUnidade: Record<string, typeof filteredRegistros> = {};
      filteredRegistros.forEach(registro => {
        const unidade = registro.unidade || 'Sem Unidade';
        if (!registrosPorUnidade[unidade]) {
          registrosPorUnidade[unidade] = [];
        }
        registrosPorUnidade[unidade].push(registro);
      });

      if (exportFormat === 'csv') {
        // Exportar CSV com quebra por unidade
        let csv = 'RELATÓRIO FINANCEIRO\n';
        csv += `Período: ${dataInicial || 'Início'} até ${dataFinal || 'Hoje'}\n\n`;

        Object.entries(registrosPorUnidade).forEach(([unidade, registros]) => {
          const saldoUnidade = saldosUnidades.find(s => s.unidadeName === unidade);
          const receitasUnidade = registros.filter(r => r.tipo === 'receita').reduce((acc, r) => acc + r.valor, 0);
          const despesasUnidade = registros.filter(r => r.tipo === 'despesa').reduce((acc, r) => acc + r.valor, 0);
          
          csv += `\nUNIDADE: ${unidade}\n`;
          csv += `Saldo em Caixa: R$ ${saldoUnidade?.saldo.toFixed(2) || '0,00'}\n`;
          csv += `Total Receitas: R$ ${receitasUnidade.toFixed(2)}\n`;
          csv += `Total Despesas: R$ ${despesasUnidade.toFixed(2)}\n`;
          csv += `Resultado: R$ ${(receitasUnidade - despesasUnidade).toFixed(2)}\n\n`;
          
          csv += 'Data,Descrição,Categoria,Tipo,Valor,Status,Método\n';
          registros.forEach(registro => {
            csv += `${registro.data},${registro.descricao},${registro.categoria},${registro.tipo},${registro.valor},${registro.status},${registro.metodo}\n`;
          });
        });

        // Adicionar resumo geral
        csv += '\n\nRESUMO GERAL\n';
        csv += `Total Receitas: R$ ${stats.receitas.toFixed(2)}\n`;
        csv += `Total Despesas: R$ ${stats.despesas.toFixed(2)}\n`;
        csv += `Resultado Geral: R$ ${stats.saldo.toFixed(2)}\n`;
        csv += `Saldo Total em Caixa: R$ ${saldosUnidades.reduce((acc, s) => acc + s.saldo, 0).toFixed(2)}\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

      } else {
        // Para Excel, usar formato CSV com separador de tabulação (abre melhor no Excel)
        let excel = 'RELATÓRIO FINANCEIRO\t\t\t\t\t\t\n';
        excel += `Período:\t${dataInicial || 'Início'}\taté\t${dataFinal || 'Hoje'}\t\t\t\n\n`;

        Object.entries(registrosPorUnidade).forEach(([unidade, registros]) => {
          const saldoUnidade = saldosUnidades.find(s => s.unidadeName === unidade);
          const receitasUnidade = registros.filter(r => r.tipo === 'receita').reduce((acc, r) => acc + r.valor, 0);
          const despesasUnidade = registros.filter(r => r.tipo === 'despesa').reduce((acc, r) => acc + r.valor, 0);
          
          excel += `\nUNIDADE:\t${unidade}\t\t\t\t\t\n`;
          excel += `Saldo em Caixa:\tR$ ${saldoUnidade?.saldo.toFixed(2) || '0,00'}\t\t\t\t\t\n`;
          excel += `Total Receitas:\tR$ ${receitasUnidade.toFixed(2)}\t\t\t\t\t\n`;
          excel += `Total Despesas:\tR$ ${despesasUnidade.toFixed(2)}\t\t\t\t\t\n`;
          excel += `Resultado:\tR$ ${(receitasUnidade - despesasUnidade).toFixed(2)}\t\t\t\t\t\n\n`;
          
          excel += 'Data\tDescrição\tCategoria\tTipo\tValor\tStatus\tMétodo\n';
          registros.forEach(registro => {
            excel += `${registro.data}\t${registro.descricao}\t${registro.categoria}\t${registro.tipo}\t${registro.valor}\t${registro.status}\t${registro.metodo}\n`;
          });
        });

        const blob = new Blob([excel], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financeiro_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: `Dados exportados em formato ${exportFormat.toUpperCase()} com sucesso!`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredRegistros, saldosUnidades, stats, dataInicial, dataFinal, exportFormat, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Módulo Financeiro
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {userLogado.perfil === 'admin' 
              ? 'Controle financeiro completo de todas as unidades'
              : `Controle financeiro das suas unidades: ${allowedUnits.join(', ')}`
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            title={showValues ? "Ocultar valores" : "Mostrar valores"}
          >
            {showValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          
          {/* Seletor de formato de exportação */}
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </select>
            <Button
              variant="secondary"
              onClick={handleExport}
              leftIcon={exportFormat === 'excel' ? <FileSpreadsheet className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            >
              Exportar
            </Button>
          </div>
          
          <Button
            onClick={handleAddNew}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Seletor de Visualização */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
        <button
          onClick={() => setSelectedView('dashboard')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedView === 'dashboard' 
              ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setSelectedView('table')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedView === 'table' 
              ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          Lançamentos
        </button>
        <button
          onClick={() => setSelectedView('analytics')}
          className={`px-4 py-2 rounded transition-colors ${
            selectedView === 'analytics' 
              ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          Análises
        </button>
      </div>

      {/* View: Dashboard */}
      {selectedView === 'dashboard' && (
        <>
          {/* Saldos por Unidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {saldosUnidades
              .filter(saldo => 
                userLogado.perfil === 'admin' || 
                ((userLogado as any).unidades && (userLogado as any).unidades.includes(saldo.unidadeName))
              )
              .map(saldo => (
                <SaldoUnidadeCard
                  key={saldo.unidadeId}
                  saldo={saldo}
                  onEdit={handleEditSaldo}
                  canEdit={
                    userLogado.perfil === 'admin' || 
                    ((userLogado as any).unidades && (userLogado as any).unidades.includes(saldo.unidadeName))
                  }
                  showValues={showValues}
                />
              ))}
          </div>

          {/* KPIs Aprimorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EnhancedKPICard
              title="Receita Total"
              value={stats.receitas}
              icon={TrendingUp}
              trend={12.5}
              color="text-green-600"
              comparison={stats.receitas * 0.85}
              subtitle="Meta: R$ 50.000,00"
              showValues={showValues}
            />
            <EnhancedKPICard
              title="Despesas"
              value={stats.despesas}
              icon={TrendingDown}
              trend={-5.2}
              color="text-red-600"
              comparison={stats.despesas * 1.1}
              subtitle={`Futuras: R$ ${stats.despesasFuturas.toFixed(2)}`}
              showValues={showValues}
            />
            <EnhancedKPICard
              title="Lucro Líquido"
              value={stats.saldo}
              icon={DollarSign}
              trend={18.3}
              color="text-blue-600"
              comparison={stats.saldo * 0.82}
              subtitle="Margem: 58%"
              showValues={showValues}
            />
            <EnhancedKPICard
              title="Inadimplência"
              value={stats.inadimplencia}
              icon={AlertCircle}
              color="text-yellow-600"
              subtitle={`Pendentes: ${stats.pendentes} | Vencidos: ${stats.vencidos}`}
              showValues={showValues}
            />
          </div>

          {/* Parcelas Pendentes */}
          <ParcelasManager
            parcelas={parcelas}
            onQuitarParcela={handleQuitarParcela}
            showValues={showValues}
          />

          {/* Centro de Inadimplência */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Centro de Inadimplência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Vence Hoje</p>
                <p className="text-xl font-bold text-yellow-600">2 alunos</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Vencidos (1-30 dias)</p>
                <p className="text-xl font-bold text-orange-600">3 alunos</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Vencidos (+30 dias)</p>
                <p className="text-xl font-bold text-red-600">1 aluno</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View: Tabela (Lançamentos) */}
      {selectedView === 'table' && (
        <>
          {/* Summary Cards com Saldo */}
          <SummaryCards 
            receitas={stats.receitas}
            despesas={stats.despesas}
            saldo={stats.saldo}
            pendentes={stats.pendentes}
            saldoUnidade={saldoUnidadeAtual}
            showValues={showValues}
          />

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="xl:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Filtro de Unidade - Diferentes opções para Admin vs Gestor */}
              {(userLogado.perfil === 'admin' || 
                (userLogado.perfil === 'gestor' && (userLogado as any).unidades && (userLogado as any).unidades.length > 1)
              ) && (
                <div>
                  <select
                    value={unidadeFilter}
                    onChange={(e) => setUnidadeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {userLogado.perfil === 'admin' && <option value="todas">Todas unidades</option>}
                    {(userLogado.perfil === 'gestor' && (userLogado as any).unidades?.length > 1) && 
                      <option value="todas">Minhas unidades</option>
                    }
                    {(userLogado.perfil === 'admin' ? unidades : 
                      unidades.filter(u => allowedUnits.includes(u.nome))
                    ).map(unidade => (
                      <option key={unidade.id} value={unidade.nome}>{unidade.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <input
                  type="date"
                  placeholder="Data inicial"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <input
                  type="date"
                  placeholder="Data final"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>

              <div>
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="todos">Todas as categorias</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredRegistros.length} de {scopedFinanceiro.length} registros financeiros
            </p>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visão Geral - Lançamentos Consolidados
              </h2>
            </div>
            <div className="p-6">
              <FinancialTable registros={filteredRegistros} onEdit={handleEdit} showValues={showValues} />
            </div>
          </div>
        </>
      )}

      {/* View: Analytics */}
      {selectedView === 'analytics' && (
        <>
          {/* Gráfico de Evolução */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Evolução Mensal
            </h3>
            
            {/* Simulação de gráfico de barras */}
            <div className="flex items-end gap-2 h-48">
              {[
                { mes: 'Jan', receita: 35000, despesa: 18000 },
                { mes: 'Fev', receita: 38000, despesa: 19000 },
                { mes: 'Mar', receita: 42000, despesa: 17500 },
                { mes: 'Abr', receita: 41000, despesa: 18500 },
                { mes: 'Mai', receita: 44000, despesa: 19200 },
                { mes: 'Jun', receita: 45280, despesa: 18960 }
              ].map((mes, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end h-40">
                    <div 
                      className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                      style={{ height: `${(mes.receita / 50000) * 100}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {showValues ? `R$ ${mes.receita.toFixed(0)}` : '••••'}
                        </span>
                      </div>
                    </div>
                    <div 
                      className="flex-1 bg-red-500 rounded-t hover:bg-red-600 transition-colors relative group"
                      style={{ height: `${(mes.despesa / 50000) * 100}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {showValues ? `R$ ${mes.despesa.toFixed(0)}` : '••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{mes.mes}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Despesas</span>
              </div>
            </div>
          </div>

          {/* DRE Simplificado */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              DRE - Demonstrativo de Resultados
            </h3>
            
            <div className="space-y-3">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="flex justify-between items-center font-semibold text-green-600">
                  <span>RECEITAS OPERACIONAIS</span>
                  <span>{showValues ? `R$ ${stats.receitas.toFixed(2)}` : '••••••'}</span>
                </div>
                <div className="ml-4 mt-2 space-y-1">
                  {filteredRegistros
                    .filter(r => r.tipo === 'receita')
                    .reduce((acc: Record<string, number>, r) => {
                      acc[r.categoria] = (acc[r.categoria] || 0) + r.valor;
                      return acc;
                    }, {}) &&
                    Object.entries(
                      filteredRegistros
                        .filter(r => r.tipo === 'receita')
                        .reduce((acc: Record<string, number>, r) => {
                          acc[r.categoria] = (acc[r.categoria] || 0) + r.valor;
                          return acc;
                        }, {})
                    ).map(([categoria, valor]) => (
                      <div key={categoria} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{categoria}</span>
                        <span>{showValues ? `R$ ${valor.toFixed(2)}` : '••••'}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="flex justify-between items-center font-semibold text-red-600">
                  <span>(-) DESPESAS OPERACIONAIS</span>
                  <span>{showValues ? `R$ ${stats.despesas.toFixed(2)}` : '••••••'}</span>
                </div>
                <div className="ml-4 mt-2 space-y-1">
                  {filteredRegistros
                    .filter(r => r.tipo === 'despesa')
                    .reduce((acc: Record<string, number>, r) => {
                      acc[r.categoria] = (acc[r.categoria] || 0) + r.valor;
                      return acc;
                    }, {}) &&
                    Object.entries(
                      filteredRegistros
                        .filter(r => r.tipo === 'despesa')
                        .reduce((acc: Record<string, number>, r) => {
                          acc[r.categoria] = (acc[r.categoria] || 0) + r.valor;
                          return acc;
                        }, {})
                    ).map(([categoria, valor]) => (
                      <div key={categoria} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{categoria}</span>
                        <span>{showValues ? `R$ ${valor.toFixed(2)}` : '••••'}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-lg pt-2">
                  <span>LUCRO OPERACIONAL</span>
                  <span className={stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {showValues ? `R$ ${stats.saldo.toFixed(2)}` : '••••••'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Margem Líquida</span>
                  <span>{stats.receitas > 0 ? `${((stats.saldo / stats.receitas) * 100).toFixed(1)}%` : '0%'}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-orange-600 dark:text-orange-400">
                  <span>Despesas Futuras (Parcelas)</span>
                  <span>{showValues ? `R$ ${stats.despesasFuturas.toFixed(2)}` : '••••••'}</span>
                </div>
              </div>
            </div>

            {/* Análise de Rentabilidade */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.receitas > 0 ? `${((stats.saldo / stats.receitas) * 100).toFixed(1)}%` : '0%'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Retorno sobre receita</p>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Médio</p>
                <p className="text-xl font-bold text-indigo-600">
                  {showValues ? 'R$ 380,00' : '••••••'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Por aluno/mês</p>
              </div>
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Total</p>
                <p className="text-xl font-bold text-pink-600">
                  {showValues ? `R$ ${saldoUnidadeAtual.toFixed(2)}` : '••••••'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Em caixa</p>
              </div>
            </div>
          </div>

          {/* Fluxo de Caixa */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Fluxo de Caixa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Inicial</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {showValues ? `R$ ${saldoUnidadeAtual.toFixed(2)}` : '••••••'}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Entradas</p>
                <p className="text-xl font-bold text-green-600">
                  {showValues ? `R$ ${stats.receitas.toFixed(2)}` : '••••••'}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Saídas</p>
                <p className="text-xl font-bold text-red-600">
                  {showValues ? `R$ ${stats.despesas.toFixed(2)}` : '••••••'}
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Final</p>
                <p className="text-xl font-bold text-blue-600">
                  {showValues ? `R$ ${(saldoUnidadeAtual + stats.saldo).toFixed(2)}` : '••••••'}
                </p>
              </div>
            </div>
            
            {/* Projeção */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Projeção Próximos 30 dias</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receitas Previstas</p>
                  <p className="text-lg font-bold text-green-600">
                    {showValues ? `R$ ${(stats.receitas * 1.1).toFixed(2)}` : '••••••'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Despesas Previstas</p>
                  <p className="text-lg font-bold text-red-600">
                    {showValues ? `R$ ${(stats.despesas + stats.despesasFuturas).toFixed(2)}` : '••••••'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Projetado</p>
                  <p className="text-lg font-bold text-blue-600">
                    {showValues ? `R$ ${(saldoUnidadeAtual + stats.receitas * 1.1 - stats.despesas - stats.despesasFuturas).toFixed(2)}` : '••••••'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas e Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              Alertas e Insights Automáticos
            </h3>
            
            <div className="space-y-3">
              {stats.saldo > 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Resultado positivo</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lucro de {showValues ? `R$ ${stats.saldo.toFixed(2)}` : '••••'} no período
                    </p>
                  </div>
                </div>
              )}
              
              {stats.inadimplencia > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Atenção à inadimplência</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total de {showValues ? `R$ ${stats.inadimplencia.toFixed(2)}` : '••••'} em atraso
                    </p>
                  </div>
                </div>
              )}
              
              {stats.despesasFuturas > 0 && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Parcelas futuras</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {showValues ? `R$ ${stats.despesasFuturas.toFixed(2)}` : '••••'} em parcelas pendentes
                    </p>
                  </div>
                </div>
              )}
              
              {saldoUnidadeAtual < 5000 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Saldo baixo em caixa</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Considere revisar o fluxo de caixa das unidades
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de Nova Transação */}
      <NovaTransacaoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingTransacao={editingRegistro}
      />
    </div>
  );
});