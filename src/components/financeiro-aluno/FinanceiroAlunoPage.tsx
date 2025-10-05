// src/components/financeiro-aluno/FinanceiroAlunoPage.tsx
import React, { useState } from 'react';
import { useAppState } from '@/contexts';
import { 
  CreditCard, 
  FileText, 
  Wallet,
  ShoppingBag
} from 'lucide-react';
import { StatusPlanoTab } from './StatusPlanoTab';
import { HistoricoPagamentosTab } from './HistoricoPagamentosTab';
import { FormasPagamentoTab } from './FormasPagamentoTab';
import { ComprasExtrasTab } from './ComprasExtrasTab';

type TabType = 'status' | 'historico' | 'formas-pagamento' | 'compras';

export const FinanceiroAlunoPage: React.FC = () => {
  const { userLogado } = useAppState();
  const [activeTab, setActiveTab] = useState<TabType>('status');

  if (userLogado?.perfil !== 'aluno') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">
          Esta página é exclusiva para alunos
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'status' as TabType, label: 'Status do Plano', icon: CreditCard },
    { id: 'historico' as TabType, label: 'Histórico de Pagamentos', icon: FileText },
    { id: 'formas-pagamento' as TabType, label: 'Formas de Pagamento', icon: Wallet },
    { id: 'compras' as TabType, label: 'Compras Extras', icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meu Financeiro
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seus pagamentos e histórico financeiro
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Desktop Tabs */}
        <div className="hidden md:block border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seção
            </label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'status' && <StatusPlanoTab />}
          {activeTab === 'historico' && <HistoricoPagamentosTab />}
          {activeTab === 'formas-pagamento' && <FormasPagamentoTab />}
          {activeTab === 'compras' && <ComprasExtrasTab />}
        </div>
      </div>
    </div>
  );
};