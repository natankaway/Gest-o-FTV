// src/components/financeiro-aluno/StatusPlanoTab.tsx
import React, { useMemo } from 'react';
import { useAppState } from '@/contexts';
import { Button } from '@/components/common';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package
} from 'lucide-react';

export const StatusPlanoTab: React.FC = () => {
  const { userLogado, dadosMockados } = useAppState();

  const alunoAtual = useMemo(() => {
    if (!userLogado || userLogado.perfil !== 'aluno') return null;
    return dadosMockados.alunos.find(a => a.id === userLogado.id);
  }, [userLogado, dadosMockados.alunos]);

  const planoAtual = useMemo(() => {
    if (!alunoAtual || alunoAtual.tipoPlano !== 'mensalidade' || !alunoAtual.planoId) return null;
    return dadosMockados.planos.find(p => p.id === alunoAtual.planoId);
  }, [alunoAtual, dadosMockados.planos]);

  const getStatusVencimento = () => {
    if (!alunoAtual) return null;
    
    const hoje = new Date();
    const vencimento = new Date(alunoAtual.vencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'vencido',
        cor: 'red',
        icone: AlertCircle,
        mensagem: `Vencido há ${Math.abs(diffDays)} dias`,
        diasRestantes: diffDays
      };
    } else if (diffDays <= 3) {
      return {
        status: 'proximo',
        cor: 'yellow',
        icone: AlertCircle,
        mensagem: `Vence em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
        diasRestantes: diffDays
      };
    } else {
      return {
        status: 'ativo',
        cor: 'green',
        icone: CheckCircle,
        mensagem: `Vence em ${diffDays} dias`,
        diasRestantes: diffDays
      };
    }
  };

  const statusVencimento = getStatusVencimento();

  if (!alunoAtual) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Erro ao carregar dados financeiros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Principal - Status do Plano */}
      <div className={`relative overflow-hidden rounded-xl border-2 ${
        statusVencimento?.status === 'vencido' 
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
          : statusVencimento?.status === 'proximo'
          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
          : 'border-green-500 bg-green-50 dark:bg-green-900/20'
      }`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {statusVencimento && (
                <statusVencimento.icone className={`h-8 w-8 text-${statusVencimento.cor}-600`} />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {alunoAtual.tipoPlano === 'mensalidade' ? 'Plano Mensalidade' : 
                   alunoAtual.tipoPlano === 'plataforma' ? 'Plataforma Parceira' : 
                   'Plano Experimental'}
                </h3>
                <p className={`text-sm font-medium text-${statusVencimento?.cor}-600 dark:text-${statusVencimento?.cor}-400`}>
                  {statusVencimento?.mensagem}
                </p>
              </div>
            </div>

            {statusVencimento?.status === 'vencido' && (
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Pagar Agora
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Valor */}
            {planoAtual && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Valor Mensal</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {planoAtual.preco.toFixed(2)}
                </p>
              </div>
            )}

            {/* Vencimento */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Próximo Vencimento</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Date(alunoAtual.vencimento).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* Unidade */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Unidade</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alunoAtual.unidade}
              </p>
            </div>
          </div>

          {/* Detalhes do Plano */}
          {planoAtual && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Detalhes do Plano
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Nome do Plano:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{planoAtual.nome}</span>
                </div>
                {planoAtual.descricao && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Descrição:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{planoAtual.descricao}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plataforma Parceira */}
          {alunoAtual.tipoPlano === 'plataforma' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Plataforma Parceira
              </h4>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {alunoAtual.plataformaParceira}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pagamento gerenciado pela plataforma
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors text-left group">
          <CreditCard className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Pagar Mensalidade
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Efetue o pagamento do mês
          </p>
        </button>

        <button className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left group">
          <TrendingUp className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Alterar Plano
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Faça upgrade ou downgrade
          </p>
        </button>

        <button className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-left group">
          <Package className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Comprar Pacote Extra
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adicione aulas extras
          </p>
        </button>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Benefícios do seu plano
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>✓ Acesso ilimitado aos treinos da sua unidade</li>
              <li>✓ Acompanhamento personalizado com professores</li>
              <li>✓ Participação em torneios e eventos</li>
              <li>✓ Desconto em produtos da loja</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};