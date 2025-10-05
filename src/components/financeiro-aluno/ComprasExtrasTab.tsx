// src/components/financeiro-aluno/ComprasExtrasTab.tsx
import React from 'react';
import { Button } from '@/components/common';
import { ShoppingBag, Package, Calendar } from 'lucide-react';

interface CompraExtra {
  id: number;
  data: string;
  descricao: string;
  tipo: 'produto' | 'pacote-aulas' | 'aulao';
  valor: number;
  quantidade?: number;
  metodoPagamento: string;
  status: 'concluido' | 'processando';
}

export const ComprasExtrasTab: React.FC = () => {
  const compras: CompraExtra[] = [
    {
      id: 1,
      data: '2025-07-05',
      descricao: 'Água 500ml',
      tipo: 'produto',
      valor: 6.00,
      quantidade: 2,
      metodoPagamento: 'Dinheiro',
      status: 'concluido'
    },
    {
      id: 2,
      data: '2025-06-28',
      descricao: 'Pacote 5 Aulas Extras',
      tipo: 'pacote-aulas',
      valor: 120.00,
      metodoPagamento: 'PIX',
      status: 'concluido'
    },
    {
      id: 3,
      data: '2025-06-15',
      descricao: 'Aulão Especial - Técnicas de Bloqueio',
      tipo: 'aulao',
      valor: 40.00,
      metodoPagamento: 'Cartão de Crédito',
      status: 'concluido'
    },
    {
      id: 4,
      data: '2025-05-20',
      descricao: 'Camiseta BoraProCT + Toalha',
      tipo: 'produto',
      valor: 70.00,
      quantidade: 1,
      metodoPagamento: 'Cartão de Débito',
      status: 'concluido'
    }
  ];

  const totalGasto = compras.reduce((acc, c) => acc + c.valor, 0);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'produto':
        return <ShoppingBag className="h-5 w-5 text-blue-600" />;
      case 'pacote-aulas':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'aulao':
        return <Calendar className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'produto': 'Produto',
      'pacote-aulas': 'Pacote de Aulas',
      'aulao': 'Aulão'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
              Total Gasto em Extras
            </p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              R$ {totalGasto.toFixed(2)}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              {compras.length} compras realizadas
            </p>
          </div>
          <ShoppingBag className="h-12 w-12 text-purple-600 opacity-50" />
        </div>
      </div>

      {/* Lista de Compras */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Histórico de Compras ({compras.length})
        </h3>

        {compras.map((compra) => (
          <div
            key={compra.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              {getTipoIcon(compra.tipo)}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {compra.descricao}
                  </h4>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                    {getTipoLabel(compra.tipo)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    {new Date(compra.data).toLocaleDateString('pt-BR')} • 
                    Pago via {compra.metodoPagamento}
                  </p>
                  {compra.quantidade && (
                    <p>Quantidade: {compra.quantidade}x</p>
                  )}
                  {compra.tipo === 'pacote-aulas' && (
                    <p className="text-green-600 dark:text-green-400">
                      Validade: até {new Date(new Date(compra.data).setMonth(new Date(compra.data).getMonth() + 2)).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  R$ {compra.valor.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Ver Loja */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Quer comprar mais?
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Confira produtos, pacotes de aulas e aulões disponíveis
            </p>
          </div>
          <Button>
            Ir para Loja
          </Button>
        </div>
      </div>
    </div>
  );
};