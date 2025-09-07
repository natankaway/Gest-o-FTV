// src/components/dashboard/ProfessorDashboard.tsx
import React, { memo, useMemo } from 'react';
import { useAppState } from '@/contexts';
import { 
  Users, Clock, Calendar, Trophy, 
  GraduationCap, CheckCircle, Target, DollarSign,
  ArrowUpRight, Eye, BookOpen
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

export const ProfessorDashboard: React.FC = memo(() => {
  const { dadosMockados, userLogado, navigateToTab } = useAppState();
  const { alunos, presencas, aulasExperimentais, torneios, treinos, registrosHorasProfessores } = dadosMockados;

  const professorData = useMemo(() => {
    return dadosMockados.professores.find(p => p.id === userLogado?.id);
  }, [dadosMockados.professores, userLogado?.id]);

  const stats = useMemo(() => {
    if (!professorData) return null;

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioSemana = new Date();
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    // Presenças do professor
    const presencasProfessor = presencas.filter(p => p.professorId === professorData.id);
    const presencasMes = presencasProfessor.filter(p => new Date(p.data) >= inicioMes);
    const presencasSemana = presencasProfessor.filter(p => new Date(p.data) >= inicioSemana);

    // Alunos únicos que o professor atende
    const alunosUnicos = new Set(presencasProfessor.map(p => p.alunoId));
    const meusAlunos = alunos.filter(a => alunosUnicos.has(a.id));

    // Aulas experimentais do professor
    const experimentaisProfessor = aulasExperimentais.filter(a => a.professorId === professorData.id);
    const experimentaisAgendadas = experimentaisProfessor.filter(a => a.status === 'agendada').length;
    const experimentaisRealizadas = experimentaisProfessor.filter(a => a.status === 'realizada').length;
    const experimentaisConvertidas = experimentaisProfessor.filter(a => a.status === 'convertido').length;
    const taxaConversao = experimentaisRealizadas > 0 ? 
      Math.round((experimentaisConvertidas / experimentaisRealizadas) * 100) : 0;

    // Horas trabalhadas no mês
    const horasMes = registrosHorasProfessores
      .filter(r => r.professorId === professorData.id && new Date(r.data) >= inicioMes)
      .reduce((total, r) => total + r.horasTrabalhadas, 0);

    // Estimativa de valor baseado no tipo de pagamento
    let valorEstimadoMes = 0;
    if (professorData.tipoPagamento === 'fixo') {
      valorEstimadoMes = professorData.valorFixo || 0;
    } else if (professorData.tipoPagamento === 'horas-variaveis' && professorData.valoresHoras) {
      // Calcular baseado nas horas trabalhadas
      const registrosMes = registrosHorasProfessores.filter(r => 
        r.professorId === professorData.id && new Date(r.data) >= inicioMes
      );
      
      valorEstimadoMes = registrosMes.reduce((total, registro) => {
        const horas = registro.horasTrabalhadas;
        if (horas <= 1) {
          return total + (professorData.valoresHoras?.umaHora || 0);
        } else if (horas <= 2) {
          return total + (professorData.valoresHoras?.duasHoras || 0);
        } else {
          return total + (professorData.valoresHoras?.tresOuMaisHoras || 0);
        }
      }, 0);
    }

    // Torneios ativos que o professor pode gerenciar
    const torneiosAtivos = torneios.filter(t => t.status === 'ativo').length;

    return {
      totalAlunos: meusAlunos.length,
      presencasMes: presencasMes.length,
      presencasSemana: presencasSemana.length,
      experimentaisAgendadas,
      taxaConversao,
      horasMes,
      valorEstimadoMes,
      torneiosAtivos
    };
  }, [professorData, presencas, alunos, aulasExperimentais, registrosHorasProfessores, torneios]);

  // Próximas aulas experimentais
  const proximasExperimentais = useMemo(() => {
    if (!professorData) return [];

    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 7);

    return aulasExperimentais
      .filter(a => 
        a.professorId === professorData.id && 
        a.status === 'agendada' &&
        new Date(a.dataAgendamento) >= hoje &&
        new Date(a.dataAgendamento) <= proximosDias
      )
      .sort((a, b) => new Date(a.dataAgendamento).getTime() - new Date(b.dataAgendamento).getTime())
      .slice(0, 5);
  }, [aulasExperimentais, professorData]);

  // Treinos do professor
  const meusTreinos = useMemo(() => {
    if (!professorData) return [];

    return treinos
      .filter(t => t.professorId === professorData.id)
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, 3);
  }, [treinos, professorData]);

  if (!professorData || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Carregando dados do professor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Meu Painel
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Bem-vindo, Prof. {professorData.nome}!
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Meus Alunos"
          value={stats.totalAlunos}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          onClick={() => navigateToTab('presencas')}
        />
        
        <StatCard
          title="Presenças/Mês"
          value={stats.presencasMes}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          onClick={() => navigateToTab('presencas')}
        />
        
        <StatCard
          title="Horas/Mês"
          value={`${stats.horasMes}h`}
          icon={<Clock className="h-6 w-6 text-purple-600" />}
          onClick={() => navigateToTab('horas-professores')}
        />
        
        <StatCard
          title="Taxa Conversão"
          value={`${stats.taxaConversao}%`}
          icon={<Target className="h-6 w-6 text-orange-600" />}
          onClick={() => navigateToTab('aulas-experimentais')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Presenças/Semana"
          value={stats.presencasSemana}
          icon={<Calendar className="h-5 w-5 text-blue-600" />}
          onClick={() => navigateToTab('presencas')}
        />
        
        <StatCard
          title="Exp. Agendadas"
          value={stats.experimentaisAgendadas}
          icon={<GraduationCap className="h-5 w-5 text-indigo-600" />}
          onClick={() => navigateToTab('aulas-experimentais')}
        />
        
        <StatCard
          title="Valor Estimado"
          value={stats.valorEstimadoMes}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          onClick={() => navigateToTab('horas-professores')}
        />
        
        <StatCard
          title="Torneios Ativos"
          value={stats.torneiosAtivos}
          icon={<Trophy className="h-5 w-5 text-yellow-600" />}
          onClick={() => navigateToTab('torneios')}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{aula.unidade}</p>
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

      {/* Meus Treinos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Meus Treinos Recentes
          </h3>
          <button
            onClick={() => navigateToTab('treinos')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center"
          >
            Ver Todos <Eye className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        {meusTreinos.length > 0 ? (
          <div className="space-y-3">
            {meusTreinos.map((treino) => (
              <div key={treino.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{treino.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {treino.exercicios.length} exercício(s) • {treino.categoria}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    treino.status === 'ativo' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {treino.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Você ainda não criou nenhum treino
            </p>
            <button
              onClick={() => navigateToTab('treinos')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Criar Primeiro Treino
            </button>
          </div>
        )}
      </div>

      {/* Informações Profissionais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Minhas Informações
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Especialidades</h4>
            <div className="flex flex-wrap gap-2">
              {professorData.especialidades.map((esp, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {esp}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tipo de Pagamento</h4>
            <p className="text-sm text-gray-900 dark:text-white">
              {professorData.tipoPagamento === 'fixo' ? 'Valor Fixo' : 
               professorData.tipoPagamento === 'horas-variaveis' ? 'Por Horas Variáveis' : 
               'Por Aula'}
            </p>
            {professorData.tipoPagamento === 'fixo' && professorData.valorFixo && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                R$ {professorData.valorFixo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});