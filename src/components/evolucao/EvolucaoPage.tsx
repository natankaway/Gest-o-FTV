// src/components/evolucao/EvolucaoPage.tsx
import React, { useState } from 'react';
import { TrendingUp, Award, Target, BarChart3, History, Users } from 'lucide-react';
import { ProgressoGeralTab } from './ProgressoGeralTab';
import { EstatisticasTab } from './EstatisticasTab';
import { ConquistasTab } from './ConquistasTab';
import { ObjetivosTab } from './ObjetivosTab';
import { HistoricoTab } from './HistoricoTab';
import { ComparacaoTab } from './ComparacaoTab';

type TabType = 'progresso' | 'estatisticas' | 'conquistas' | 'objetivos' | 'historico' | 'comparacao';

export const EvolucaoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('progresso');

  const tabs = [
    { id: 'progresso' as TabType, label: 'Progresso', icon: TrendingUp },
    { id: 'estatisticas' as TabType, label: 'Estatísticas', icon: BarChart3 },
    { id: 'conquistas' as TabType, label: 'Conquistas', icon: Award },
    { id: 'objetivos' as TabType, label: 'Objetivos', icon: Target },
    { id: 'historico' as TabType, label: 'Histórico', icon: History },
    { id: 'comparacao' as TabType, label: 'Comparação', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'progresso':
        return <ProgressoGeralTab />;
      case 'estatisticas':
        return <EstatisticasTab />;
      case 'conquistas':
        return <ConquistasTab />;
      case 'objetivos':
        return <ObjetivosTab />;
      case 'historico':
        return <HistoricoTab />;
      case 'comparacao':
        return <ComparacaoTab />;
      default:
        return <ProgressoGeralTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">📊 Minha Evolução</h1>
        <p className="text-blue-100">Acompanhe seu progresso e conquistas no futevôlei</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};