// src/components/financeiro-aluno/FormasPagamentoTab.tsx
import React, { useState, useCallback } from 'react';
import { useNotifications } from '@/contexts';
import { Button, Input } from '@/components/common';
import { CreditCard, Plus, Trash2, Star, Smartphone } from 'lucide-react';

interface CartaoCredito {
  id: number;
  numero: string;
  nome: string;
  validade: string;
  bandeira: 'Visa' | 'Mastercard' | 'Elo' | 'Amex';
  principal: boolean;
}

export const FormasPagamentoTab: React.FC = () => {
  const { addNotification } = useNotifications();

  const [cartoes, setCartoes] = useState<CartaoCredito[]>([
    {
      id: 1,
      numero: '•••• 1234',
      nome: 'João Silva',
      validade: '12/2026',
      bandeira: 'Visa',
      principal: true
    },
    {
      id: 2,
      numero: '•••• 5678',
      nome: 'João Silva',
      validade: '08/2025',
      bandeira: 'Mastercard',
      principal: false
    }
  ]);

  const [pixCadastrado, setPixCadastrado] = useState('joao@email.com');
  const [debitoAutomatico, setDebitoAutomatico] = useState(true);

  const handleSetPrincipal = useCallback((id: number) => {
    setCartoes(prev => prev.map(c => ({
      ...c,
      principal: c.id === id
    })));

    addNotification({
      type: 'success',
      title: 'Cartão principal atualizado',
      message: 'Este cartão agora é o método de pagamento principal'
    });
  }, [addNotification]);

  const handleRemoverCartao = useCallback((id: number) => {
    const cartao = cartoes.find(c => c.id === id);
    if (cartao?.principal && cartoes.length > 1) {
      addNotification({
        type: 'warning',
        title: 'Não é possível remover',
        message: 'Defina outro cartão como principal antes de remover este'
      });
      return;
    }

    setCartoes(prev => prev.filter(c => c.id !== id));
    addNotification({
      type: 'info',
      title: 'Cartão removido',
      message: 'O cartão foi removido com sucesso'
    });
  }, [cartoes, addNotification]);

  const handleToggleDebitoAutomatico = useCallback(() => {
    setDebitoAutomatico(!debitoAutomatico);
    addNotification({
      type: debitoAutomatico ? 'info' : 'success',
      title: debitoAutomatico ? 'Débito automático desativado' : 'Débito automático ativado',
      message: debitoAutomatico 
        ? 'Você receberá lembretes de pagamento'
        : 'Seus pagamentos serão processados automaticamente'
    });
  }, [debitoAutomatico, addNotification]);

  return (
    <div className="space-y-6">
      {/* Cartões de Crédito */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cartões de Crédito/Débito
          </h3>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Adicionar Cartão
          </Button>
        </div>

        <div className="space-y-3">
          {cartoes.map((cartao) => (
            <div
              key={cartao.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                cartao.principal
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <CreditCard className={`h-6 w-6 mt-1 ${
                    cartao.principal ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {cartao.bandeira} {cartao.numero}
                      </h4>
                      {cartao.principal && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                          <Star className="h-3 w-3 fill-current" />
                          Principal
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{cartao.nome}</p>
                      <p>Válido até: {cartao.validade}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!cartao.principal && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetPrincipal(cartao.id)}
                    >
                      Tornar Principal
                    </Button>
                  )}
                  <button
                    onClick={() => handleRemoverCartao(cartao.id)}
                    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outras Formas de Pagamento */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Outras Opções de Pagamento
        </h3>

        {/* PIX */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900 dark:text-white">PIX</h4>
            </div>
          </div>

          <Input
            label="Chave PIX cadastrada"
            value={pixCadastrado}
            onChange={(e) => setPixCadastrado(e.target.value)}
          />
          
          <Button variant="secondary" size="sm" className="mt-3">
            Atualizar Chave PIX
          </Button>
        </div>

        {/* Débito Automático */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Débito Automático
                </h4>
                {debitoAutomatico && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {debitoAutomatico 
                  ? 'Mensalidade cobrada automaticamente todo dia 5'
                  : 'Ative para não se preocupar com vencimentos'
                }
              </p>
            </div>

            <button
              onClick={handleToggleDebitoAutomatico}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                debitoAutomatico ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  debitoAutomatico ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// src/components/financeiro-aluno/ComprasExtrasTab.tsx
// =============================================================================

import { ShoppingBag, Package, Calendar as CalendarIcon } from 'lucide-react';

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
        return <CalendarIcon className="h-5 w-5 text-green-600" />;
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
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
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
        <div className="flex items-center justify-between">
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