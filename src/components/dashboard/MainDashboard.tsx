import React, { memo, useMemo } from 'react';
import { useAppState, useTheme } from '@/contexts';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

interface DashboardStats {
  totalAlunos: number;
  alunosAtivos: number;
  novosAlunosMes: number;
  receitaTotal: number;
  lucroLiquido: number;
  alunosPendentes: any[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, onClick }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' && title.includes('R$') ? 
              `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
              value
            }
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {trend.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const MainDashboard: React.FC = memo(() => {
  const { dadosMockados, navigateToTab } = useAppState();
  const { alunos, financeiro } = dadosMockados;

  const stats: DashboardStats = useMemo(() => {
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

  const proximosVencimentos = useMemo(() => {
    const agora = new Date();
    return alunos.filter(aluno => {
      if (aluno.tipoPlano === 'plataforma') return false;
      const vencimento = new Date(aluno.vencimento);
      const diffDias = Math.ceil((vencimento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
      return diffDias > 0 && diffDias <= 7;
    });
  }, [alunos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visão geral do seu centro de treinamento
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Alunos"
          value={stats.totalAlunos}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          onClick={() => navigateToTab('alunos')}
        />
        
        <StatCard
          title="Alunos Ativos"
          value={stats.alunosAtivos}
          icon={<Users className="h-6 w-6 text-green-600" />}
          onClick={() => navigateToTab('alunos')}
        />
        
        <StatCard
          title="Receita do Mês"
          value={stats.receitaTotal}
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          onClick={() => navigateToTab('financeiro')}
        />
        
        <StatCard
          title="Lucro Líquido"
          value={stats.lucroLiquido}
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          trend={{
            value: 12.5,
            isPositive: stats.lucroLiquido > 0
          }}
          onClick={() => navigateToTab('financeiro')}
        />
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagamentos Pendentes */}
        {stats.alunosPendentes.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Pagamentos Pendentes
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {stats.alunosPendentes.length} aluno(s) com pagamento em atraso
            </p>
            <button
              onClick={() => navigateToTab('alunos', 'pendente')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Ver Pendências
            </button>
          </div>
        )}

        {/* Próximos Vencimentos */}
        {proximosVencimentos.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Vencimentos Próximos
              </h3>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {proximosVencimentos.length} mensalidade(s) vencem em até 7 dias
            </p>
            <button
              onClick={() => navigateToTab('financeiro')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Ver Vencimentos
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Atividade Recente
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.novosAlunosMes} novos alunos este mês
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Crescimento da base de clientes
              </p>
            </div>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              +{stats.novosAlunosMes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});