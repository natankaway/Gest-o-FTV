// src/components/dashboard/AlunoDashboard.tsx
import React, { memo, useMemo } from 'react';
import { useAppState } from '@/contexts';
import { 
  Calendar, CheckCircle, Trophy, DollarSign, 
  Clock, Target, AlertTriangle, CreditCard,
  ArrowUpRight, ArrowDownLeft, Eye, MapPin, User
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

export const AlunoDashboard: React.FC = memo(() => {
  const { dadosMockados, userLogado, navigateToTab } = useAppState();
  const { alunos, presencas, torneios, planos } = dadosMockados;

  const alunoData = useMemo(() => {
    return alunos.find(a => a.id === userLogado?.id);
  }, [alunos, userLogado?.id]);

  const stats = useMemo(() => {
    if (!alunoData) return null;

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Presenças do aluno
    const minhasPresencas = presencas.filter(p => p.alunoId === alunoData.id);
    const presencasMes = minhasPresencas.filter(p => new Date(p.data) >= inicioMes);
    
    // Calcular frequência do mês (assumindo 4 semanas = 16 aulas possíveis)
    const aulasEsperadas = Math.floor((hoje.getDate() / 30) * 16); // Aproximação
    const frequenciaMes = aulasEsperadas > 0 ? Math.round((presencasMes.length / aulasEsperadas) * 100) : 0;

    // Informações do plano
    const planoAtual = planos.find(p => p.id === alunoData.planoId);
    
    // Status do pagamento
    const vencimento = new Date(alunoData.vencimento);
    const diasParaVencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const statusPagamento = diasParaVencimento < 0 ? 'vencido' : diasParaVencimento <= 7 ? 'proximo' : 'em_dia';

    // Torneios disponíveis
    const torneiosDisponiveis = torneios.filter(t => t.status === 'ativo').length;

    return {
      totalPresencas: minhasPresencas.length,
      presencasMes: presencasMes.length,
      frequenciaMes,
      planoAtual,
      diasParaVencimento,
      statusPagamento,
      torneiosDisponiveis,
      valorMensalidade: alunoData.tipoPlano === 'mensalidade' ? alunoData.valorMensalidade : 0
    };
  }, [alunoData, presencas, planos, torneios]);

  // Presenças recentes
  const presencasRecentes = useMemo(() => {
    if (!alunoData) return [];

    return presencas
      .filter(p => p.alunoId === alunoData.id)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [presencas, alunoData]);

  // Torneios que o aluno pode participar
  const torneiosParticipacao = useMemo(() => {
    return torneios
      .filter(t => t.status === 'ativo')
      .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
      .slice(0, 3);
  }, [torneios]);

  if (!alunoData || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Carregando seus dados...</p>
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
          Bem-vindo, {alunoData.nome}!
        </p>
      </div>

      {/* Status do Plano */}
      <div className={`rounded-xl shadow-lg p-6 ${
        stats.statusPagamento === 'vencido' ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' :
        stats.statusPagamento === 'proximo' ? 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
        'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${
              stats.statusPagamento === 'vencido' ? 'bg-red-100 dark:bg-red-800' :
              stats.statusPagamento === 'proximo' ? 'bg-yellow-100 dark:bg-yellow-800' :
              'bg-green-100 dark:bg-green-800'
            }`}>
              <CreditCard className={`h-6 w-6 ${
                stats.statusPagamento === 'vencido' ? 'text-red-600 dark:text-red-400' :
                stats.statusPagamento === 'proximo' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <div className="ml-4">
              <h3 className={`text-lg font-semibold ${
                stats.statusPagamento === 'vencido' ? 'text-red-800 dark:text-red-200' :
                stats.statusPagamento === 'proximo' ? 'text-yellow-800 dark:text-yellow-200' :
                'text-green-800 dark:text-green-200'
              }`}>
                {stats.planoAtual?.nome || 'Plano Ativo'}
              </h3>
              <p className={`text-sm ${
                stats.statusPagamento === 'vencido' ? 'text-red-600 dark:text-red-400' :
                stats.statusPagamento === 'proximo' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {stats.statusPagamento === 'vencido' ? 
                  `Vencido há ${Math.abs(stats.diasParaVencimento)} dia(s)` :
                  stats.statusPagamento === 'proximo' ?
                  `Vence em ${stats.diasParaVencimento} dia(s)` :
                  `Próximo vencimento em ${stats.diasParaVencimento} dia(s)`
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${
              stats.statusPagamento === 'vencido' ? 'text-red-800 dark:text-red-200' :
              stats.statusPagamento === 'proximo' ? 'text-yellow-800 dark:text-yellow-200' :
              'text-green-800 dark:text-green-200'
            }`}>
              R$ {stats.valorMensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-sm ${
              stats.statusPagamento === 'vencido' ? 'text-red-600 dark:text-red-400' :
              stats.statusPagamento === 'proximo' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              Vencimento: {new Date(alunoData.vencimento).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Presenças/Mês"
          value={stats.presencasMes}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          onClick={() => navigateToTab('presencas')}
        />
        
        <StatCard
          title="Frequência"
          value={`${stats.frequenciaMes}%`}
          icon={<Target className="h-6 w-6 text-blue-600" />}
          trend={{
            value: stats.frequenciaMes - 75, // Comparação com meta de 75%
            isPositive: stats.frequenciaMes >= 75
          }}
          onClick={() => navigateToTab('presencas')}
        />
        
        <StatCard
          title="Total Presenças"
          value={stats.totalPresencas}
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          onClick={() => navigateToTab('presencas')}
        />
        
        <StatCard
          title="Torneios Disponíveis"
          value={stats.torneiosDisponiveis}
          icon={<Trophy className="h-6 w-6 text-yellow-600" />}
          onClick={() => navigateToTab('torneios')}
        />
      </div>

      {/* Informações Pessoais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Minhas Informações
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome Completo</p>
                <p className="text-sm text-gray-900 dark:text-white">{alunoData.nome}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unidade</p>
                <p className="text-sm text-gray-900 dark:text-white">{alunoData.unidade}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Data de Matrícula</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(alunoData.dataMatricula).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                alunoData.status === 'ativo' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-sm text-gray-900 dark:text-white capitalize">{alunoData.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Presenças Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Presenças Recentes
          </h3>
          <button
            onClick={() => navigateToTab('presencas')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center"
          >
            Ver Histórico <Eye className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        {presencasRecentes.length > 0 ? (
          <div className="space-y-3">
            {presencasRecentes.map((presenca) => {
              const professor = dadosMockados.professores.find(p => p.id === presenca.professorId);
              return (
                <div key={presenca.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(presenca.data).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Prof. {professor?.nome || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Presente
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Nenhuma presença registrada ainda
          </p>
        )}
      </div>

      {/* Torneios Disponíveis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Torneios Disponíveis
          </h3>
          <button
            onClick={() => navigateToTab('torneios')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center"
          >
            Ver Todos <Eye className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        {torneiosParticipacao.length > 0 ? (
          <div className="space-y-3">
            {torneiosParticipacao.map((torneio) => (
              <div key={torneio.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{torneio.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Início: {new Date(torneio.dataInicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{torneio.categoria}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    torneio.status === 'ativo' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {torneio.status === 'ativo' ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nenhum torneio disponível no momento
            </p>
          </div>
        )}
      </div>

      {/* Alerta de Pagamento */}
      {(stats.statusPagamento === 'vencido' || stats.statusPagamento === 'proximo') && (
        <div className={`rounded-xl shadow-lg p-6 ${
          stats.statusPagamento === 'vencido' ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' :
          'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`h-6 w-6 ${
              stats.statusPagamento === 'vencido' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`} />
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                stats.statusPagamento === 'vencido' ? 'text-red-800 dark:text-red-200' :
                'text-yellow-800 dark:text-yellow-200'
              }`}>
                {stats.statusPagamento === 'vencido' ? 
                  'Pagamento em Atraso!' : 
                  'Vencimento Próximo!'
                }
              </h3>
              <p className={`text-sm mt-1 ${
                stats.statusPagamento === 'vencido' ? 'text-red-600 dark:text-red-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {stats.statusPagamento === 'vencido' ? 
                  'Regularize seu pagamento para continuar com as aulas.' :
                  'Lembre-se de realizar o pagamento antes do vencimento.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});