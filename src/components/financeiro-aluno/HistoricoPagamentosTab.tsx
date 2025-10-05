// src/components/financeiro-aluno/HistoricoPagamentosTab.tsx
import React, { useMemo, useState } from 'react';
import { useAppState } from '@/contexts';
import { Button } from '@/components/common';
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Filter
} from 'lucide-react';

export const HistoricoPagamentosTab: React.FC = () => {
  const { userLogado, dadosMockados } = useAppState();
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pago' | 'pendente' | 'vencido'>('todos');
  const [anoSelecionado, setAnoSelecionado] = useState('2025');

  const alunoAtual = useMemo(() => {
    if (!userLogado || userLogado.perfil !== 'aluno') return null;
    return dadosMockados.alunos.find(a => a.id === userLogado.id);
  }, [userLogado, dadosMockados.alunos]);

  // Mock de histórico de pagamentos
  const pagamentos = useMemo(() => {
    if (!alunoAtual) return [];

    return [
      {
        id: 1,
        data: '2025-06-05',
        descricao: 'Mensalidade Junho/2025',
        valor: 150.00,
        status: 'pago' as const,
        metodoPagamento: 'Cartão de Crédito',
        referencia: '#001234',
        comprovante: true
      },
      {
        id: 2,
        data: '2025-05-03',
        descricao: 'Mensalidade Maio/2025',
        valor: 150.00,
        status: 'pago' as const,
        metodoPagamento: 'PIX',
        referencia: '#001189',
        comprovante: true
      },
      {
        id: 3,
        data: '2025-07-14',
        descricao: 'Mensalidade Julho/2025',
        valor: 150.00,
        status: 'pendente' as const,
        metodoPagamento: '-',
        referencia: '#001456',
        comprovante: false
      },
      {
        id: 4,
        data: '2025-04-14',
        descricao: 'Mensalidade Abril/2025',
        valor: 150.00,
        status: 'vencido' as const,
        metodoPagamento: '-',
        referencia: '#001045',
        comprovante: false,
        multa: 15.00
      },
      {
        id: 5,
        data: '2025-03-01',
        descricao: 'Mensalidade Março/2025',
        valor: 150.00,
        status: 'pago' as const,
        metodoPagamento: 'Cartão de Débito',
        referencia: '#000891',
        comprovante: true
      }
    ];
  }, [alunoAtual]);

  const pagamentosFiltrados = useMemo(() => {
    return pagamentos.filter(pag => {
      const matchStatus = filtroStatus === 'todos' || pag.status === filtroStatus;
      const matchAno = pag.data.startsWith(anoSelecionado);
      return matchStatus && matchAno;
    });
  }, [pagamentos, filtroStatus, anoSelecionado]);

  const totais = useMemo(() => {
    return pagamentos.reduce((acc, pag) => {
      if (pag.status === 'pago') {
        acc.pago += pag.valor;
      } else if (pag.status === 'pendente') {
        acc.pendente += pag.valor;
      } else if (pag.status === 'vencido') {
        acc.vencido += pag.valor + (pag.multa || 0);
      }
      return acc;
    }, { pago: 0, pendente: 0, vencido: 0 });
  }, [pagamentos]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'vencido':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pago: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      vencido: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!alunoAtual) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Erro ao carregar histórico
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Pago</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                R$ {totais.pago.toFixed(2)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pendente</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                R$ {totais.pendente.toFixed(2)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Vencido</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                R$ {totais.vencido.toFixed(2)}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="todos">Todos</option>
            <option value="pago">Pagos</option>
            <option value="pendente">Pendentes</option>
            <option value="vencido">Vencidos</option>
          </select>

          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Histórico de Pagamentos ({pagamentosFiltrados.length})
        </h3>

        {pagamentosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum pagamento encontrado
            </p>
          </div>
        ) : (
          pagamentosFiltrados.map((pagamento) => (
            <div
              key={pagamento.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(pagamento.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {pagamento.descricao}
                      </h4>
                      {getStatusBadge(pagamento.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        <span className="font-medium">Data:</span>{' '}
                        {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                      </p>
                      {pagamento.status === 'pago' && (
                        <p>
                          <span className="font-medium">Pago via:</span>{' '}
                          {pagamento.metodoPagamento}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Referência:</span>{' '}
                        {pagamento.referencia}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      R$ {pagamento.valor.toFixed(2)}
                    </p>
                    {pagamento.multa && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        + R$ {pagamento.multa.toFixed(2)} (multa)
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {pagamento.comprovante && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<FileText className="h-4 w-4" />}
                      >
                        Ver Comprovante
                      </Button>
                    )}
                    {pagamento.status === 'pendente' && (
                      <Button size="sm">
                        Pagar Agora
                      </Button>
                    )}
                    {pagamento.status === 'vencido' && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Regularizar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};