// src/components/dashboard/GestorDashboard.tsx
import React, { memo, useMemo } from 'react';
import { useAppState } from '@/contexts';
import { 
  Users, DollarSign, TrendingUp, AlertTriangle, 
  Calendar, Target, Clock, GraduationCap,
  ArrowUpRight, ArrowDownLeft, Eye, CheckCircle
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

export const GestorDashboard: React.FC = memo(() => {
  const { dadosMockados, userLogado, unidadeSelecionada, navigateToTab } = useAppState();
  const { alunos, financeiro, professores, aulasExperimentais, presencas, metas } = dadosMockados;

  const stats = useMemo(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Filtrar dados pela unidade do gestor
    const alunosUnidade = alunos.filter(a => a.unidade === unidadeSelecionada);
    const financeiroUnidade = financeiro.filter(f => f.unidade === unidadeSelecionada);
    const experimentaisUnidade = aulasExperimentais.filter(a => a.unidade === unidadeSelecionada);
    const presencasUnidade = presencas.filter(p => {
      const aluno = alunos.find(a => a.id === p.alunoId);
      return aluno?.unidade === unidadeSelecionada;
    });

    // Estatísticas de alunos
    const alunosAtivos = alunosUnidade.filter(a => a.status === 'ativo').length;
    const novosAlunosMes = alunosUnidade.filter(a => new Date(a.dataMatricula) >= inicioMes).length;
    const alunosInadimplentes = alunosUnidade.filter(a => 
      a.tipoPlano === 'mensalidade' && new Date(a.vencimento) < hoje
    ).length;

    // Estatísticas financeiras
    const transacoesMes = financeiroUnidade.filter(t => new Date(t.data) >= inicioMes);
    const receitaTotal = transacoesMes
      .filter(t => t.tipo === 'receita' && t.status === 'pago')
      .reduce((acc, t) => acc + t.valor, 0);
    const despesaTotal = transacoesMes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => acc + t.valor, 0);

    // Aulas experimentais
    const experimentaisAgendadas = experimentaisUnidade.filter(a => a.status === 'agendada').length;
    const experimentaisRealizadas = experimentaisUnidade.filter(a => a.status === 'realizada').length;
    const experimentaisConvertidas = experimentaisUnidade.filter(a => a.status === 'convertido').length;
    const taxaConversao = experimentaisRealizadas > 0 ? 
      Math.round((experimentaisConvertidas / experimentaisRealizadas) * 100) : 0;

    // Presenças da semana
    const inicioSemana = new Date();
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const presencasSemana = presencasUnidade.filter(p => new Date(p.data) >= inicioSemana).length;

    // Meta da unidade
    const metaUnidade = metas.find(m => m.unidade === unidadeSelecionada && m.mes === hoje.getMonth() + 1);
    const progressoMeta = metaUnidade ? Math.round((receitaTotal / metaUnidade.valorMeta) * 100) : 0;

    return {
      totalAlunos: alunosUnidade.length,
      alunosAtivos,
      novosAlunosMes,
      alunosInadimplentes,
      receitaTotal,
      lucroLiquido: receitaTotal - despesaTotal,
      experimentaisAgendadas,
      taxaConversao,
      presencasSemana,
      metaUnidade,
      progressoMeta
    };
  }, [alunos, financeiro, aulasExperimentais, presencas, metas, unidadeSelecionada]);

  // Próximas aulas experimentais
  const proximasExperimentais = useMemo(() => {
    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 7);

    return aulasExperimentais
      .filter(a => 
        a.unidade === unidadeSelecionada && 
        a.status === 'agendada' &&
        new Date(a.dataAgendamento) >= hoje &&
        new Date(a.dataAgendamento) <= proximosDias
      )
      .sort((a, b) => new Date(a.dataAgendamento).getTime() - new Date(b.dataAgendamento).getTime())
      .slice(0, 5);
  }, [aulasExperimentais, unidadeSelecionada]);

  // Professores da unidade
  const professoresUnidade = useMemo(() => {
    // Buscar professores que têm atividade na unidade
    const professoresAtivos = new Set(
      presencas
        .filter(p => {
          const aluno = alunos.find(a => a.id === p.alunoId);
          return aluno?.unidade === unidadeSelecionada;
        })
        .map(p => p.professorId)
    );

    return professores.filter(p => professoresAtivos.has(p.id) && p.ativo);
  }, [professores, presencas, alunos, unidadeSelecionada]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard - {unidadeSelecionada}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gestão operacional da sua unidade
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Alunos Ativos"
          value={stats.alunosAtivos}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          onClick={() => navigateToTab('alunos')}
        />
        
        <StatCard
          title="Receita do Mês"
          value={stats.receitaTotal}
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          onClick={() => navigateToTab('financeiro')}
        />
        
        <StatCard
          title="Taxa Conversão"
          value={`${stats.taxaConversao}%`}
          icon={<Target className="h-6 w-6 text-orange-600" />}
          onClick={() => navigateToTab('aulas-experimentais')}
        />
        
        <StatCard
          title="Presenças/Semana"
          value={stats.presencasSemana}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          onClick={() => navigateToTab('presencas')}
        />
      </div>

      {/* Meta da Unidade */}
      {stats.metaUnidade && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Meta do Mês
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats.progressoMeta >= 100 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : stats.progressoMeta >= 75
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {stats.progressoMeta}% atingido
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                R$ {stats.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                R$ {stats.metaUnidade.valorMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  stats.progressoMeta >= 100 ? 'bg-green-500' :
                  stats.progressoMeta >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.progressoMeta, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Realizado</span>
              <span>Meta</span>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Alunos"
          value={stats.totalAlunos}
          icon={<Users className="h-5 w-5 text-gray-600" />}
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
          title="Exp. Agendadas"
          value={stats.experimentaisAgendadas}
          icon={<GraduationCap className="h-5 w-5 text-purple-600" />}
          onClick={() => navigateToTab('aulas-experimentais')}
        />
      </div>

      {/* Próximas Aulas Experimentais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Próximas Aulas Experimentais
          </h3>
          <button
            onClick={() => navigateToTab('aulas-experimentais')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center"
          >
            Ver Todas <Eye className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        {proximasExperimentais.length > 0 ? (
          <div className="space-y-3">
            {proximasExperimentais.map((aula) => (
              <div key={aula.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{aula.aluno}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(aula.dataAgendamento).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(aula.dataAgendamento).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{aula.professor}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Agendada
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Nenhuma aula experimental agendada para os próximos 7 dias
          </p>
        )}
      </div>

      {/* Equipe da Unidade */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Equipe da Unidade
          </h3>
          <button
            onClick={() => navigateToTab('professores')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center"
          >
            Ver Detalhes <Eye className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        {professoresUnidade.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professoresUnidade.slice(0, 4).map((professor) => (
              <div key={professor.id} className="flex items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {professor.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{professor.nome}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {professor.especialidades.join(', ')}
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Ativo
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Nenhum professor com atividade recente nesta unidade
          </p>
        )}
      </div>

      {/* Alertas */}
      {stats.alunosInadimplentes > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Atenção: {stats.alunosInadimplentes} aluno(s) inadimplente(s) na sua unidade
              </h3>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigateToTab('financeiro')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Gerenciar Cobrança
            </button>
          </div>
        </div>
      )}
    </div>
  );
});