// src/components/dashboard/AdminDashboard.tsx
import React, { memo, useMemo } from 'react';
import { useAppState } from '@/contexts';
import { 
  Users, DollarSign, TrendingUp, AlertTriangle, 
  Building2, UserCheck, Calendar, Target,
  ArrowUpRight, ArrowDownLeft, Eye
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, onClick, className = "" }) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' && title.includes('R$') 
              ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : value
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
        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = memo(() => {
  const { dadosMockados, navigateToTab } = useAppState();
  const { alunos, financeiro, professores, gestores, aulasExperimentais, unidades } = dadosMockados;

  const stats = useMemo(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

    // Receitas e despesas do mês atual
    const transacoesMes = financeiro.filter(t => new Date(t.data) >= inicioMes);
    const transacoesMesPassado = financeiro.filter(t => 
      new Date(t.data) >= mesPassado && new Date(t.data) <= fimMesPassado
    );

    const receitaTotal = transacoesMes
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + t.valor, 0);

    const receitaMesPassado = transacoesMesPassado
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + t.valor, 0);

    const despesaTotal = transacoesMes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0);

    const lucroLiquido = receitaTotal - despesaTotal;

    // Alunos
    const alunosAtivos = alunos.filter(a => a.status === 'ativo').length;
    const novosAlunosMes = alunos.filter(a => new Date(a.dataMatricula) >= inicioMes).length;
    const alunosInadimplentes = alunos.filter(a => 
      a.tipoPlano === 'mensalidade' && new Date(a.vencimento) < hoje
    ).length;

    // Professores ativos
    const professoresAtivos = professores.filter(p => p.ativo).length;

    // Gestores ativos
    const gestoresAtivos = gestores.filter(g => g.ativo).length;

    // Aulas experimentais
    const experimentaisRealizadas = aulasExperimentais.filter(a => a.status === 'realizada').length;
    const experimentaisConvertidas = aulasExperimentais.filter(a => a.status === 'convertido').length;
    const taxaConversao = experimentaisRealizadas > 0 ? 
      Math.round((experimentaisConvertidas / experimentaisRealizadas) * 100) : 0;

    // Calcular trends
    const trendReceita = receitaMesPassado > 0 ? 
      ((receitaTotal - receitaMesPassado) / receitaMesPassado) * 100 : 0;

    return {
      totalAlunos: alunos.length,
      alunosAtivos,
      novosAlunosMes,
      alunosInadimplentes,
      receitaTotal,
      lucroLiquido,
      professoresAtivos,
      gestoresAtivos,
      totalUnidades: unidades.length,
      taxaConversao,
      trendReceita
    };
  }, [alunos, financeiro, professores, gestores, aulasExperimentais, unidades]);

  // Performance por unidade
  const performanceUnidades = useMemo(() => {
    return unidades.map(unidade => {
      const alunosUnidade = alunos.filter(a => a.unidade === unidade.nome && a.status === 'ativo');
      const receitaUnidade = financeiro
        .filter(f => f.unidade === unidade.nome && f.tipo === 'receita' && f.status === 'pago')
        .reduce((acc, f) => acc + f.valor, 0);
      
      return {
        nome: unidade.nome,
        alunos: alunosUnidade.length,
        receita: receitaUnidade
      };
    }).sort((a, b) => b.receita - a.receita);
  }, [unidades, alunos, financeiro]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Visão completa de todas as operações do CT
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Alunos"
          value={stats.totalAlunos}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          onClick={() => navigateToTab('alunos')}
        />
        
        <StatCard
          title="Receita do Mês"
          value={stats.receitaTotal}
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          trend={{
            value: stats.trendReceita,
            isPositive: stats.trendReceita > 0
          }}
          onClick={() => navigateToTab('financeiro')}
        />
        
        <StatCard
          title="Lucro Líquido"
          value={stats.lucroLiquido}
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          onClick={() => navigateToTab('financeiro')}
        />
        
        <StatCard
          title="Taxa Conversão"
          value={`${stats.taxaConversao}%`}
          icon={<Target className="h-6 w-6 text-orange-600" />}
          onClick={() => navigateToTab('aulas-experimentais')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Alunos Ativos"
          value={stats.alunosAtivos}
          icon={<UserCheck className="h-5 w-5 text-green-600" />}
          onClick={() => navigateToTab('alunos')}
        />
        
        <StatCard
          title="Novos Alunos"
          value={stats.novosAlunosMes}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          onClick={() => navigateToTab('alunos')}
        />
        
        <StatCard
          title="Inadimplentes"
          value={stats.alunosInadimplentes}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          className={stats.alunosInadimplentes > 0 ? "border-l-4 border-red-500" : ""}
          onClick={() => navigateToTab('financeiro')}
        />
        
        <StatCard
          title="Professores"
          value={stats.professoresAtivos}
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          onClick={() => navigateToTab('professores')}
        />
        
        <StatCard
          title="Unidades"
          value={stats.totalUnidades}
          icon={<Building2 className="h-5 w-5 text-gray-600" />}
          onClick={() => navigateToTab('configuracoes')}
        />
      </div>

      {/* Performance por Unidade */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance por Unidade
          </h3>
          <button
            onClick={() => navigateToTab('financeiro')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center"
          >
            Ver Detalhes <Eye className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {performanceUnidades.map((unidade, index) => (
            <div key={unidade.nome} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{unidade.nome}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{unidade.alunos} alunos ativos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  R$ {unidade.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">receita total</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas e Ações Rápidas */}
      {stats.alunosInadimplentes > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Atenção: {stats.alunosInadimplentes} aluno(s) inadimplente(s)
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigateToTab('financeiro')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Gerenciar Inadimplência
            </button>
          </div>
        </div>
      )}
    </div>
  );
});