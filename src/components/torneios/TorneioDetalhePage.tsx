import React, { useState, useCallback } from 'react';
import { useAppState } from '@/contexts';
import { ArrowLeft, Trophy, Users, Target, Settings } from 'lucide-react';
import { CategoriaForm } from './CategoriaForm';
import { DuplasManager } from './DuplasManager';
import { ChaveamentoView } from './ChaveamentoView';
import type { Torneio, Categoria } from '@/types';

interface TorneioDetalhePageProps {
  torneio: Torneio;
  onBack: () => void;
}

type TabType = 'categorias' | 'duplas' | 'chaveamento';

export const TorneioDetalhePage: React.FC<TorneioDetalhePageProps> = ({
  torneio,
  onBack
}) => {
  const { userLogado, setTorneios } = useAppState();
  const [activeTab, setActiveTab] = useState<TabType>('categorias');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  
  const userRole = userLogado?.perfil || 'aluno';
  const canEdit = userRole === 'admin' || userRole === 'gestor' || userRole === 'professor';

  const updateTorneio = useCallback((updatedTorneio: Torneio) => {
    setTorneios(prev => prev.map(t => t.id === updatedTorneio.id ? updatedTorneio : t));
  }, [setTorneios]);

  const addCategoria = useCallback((categoria: Categoria) => {
    const updatedTorneio = {
      ...torneio,
      categorias: [...torneio.categorias, categoria]
    };
    updateTorneio(updatedTorneio);
  }, [torneio, updateTorneio]);

  const updateCategoria = useCallback((categoriaId: string, updatedCategoria: Categoria) => {
    const updatedTorneio = {
      ...torneio,
      categorias: torneio.categorias.map(c => c.id === categoriaId ? updatedCategoria : c)
    };
    updateTorneio(updatedTorneio);
  }, [torneio, updateTorneio]);

  const removeCategoria = useCallback((categoriaId: string) => {
    const updatedTorneio = {
      ...torneio,
      categorias: torneio.categorias.filter(c => c.id !== categoriaId)
    };
    updateTorneio(updatedTorneio);
  }, [torneio, updateTorneio]);

  const tabs = [
    {
      id: 'categorias' as TabType,
      label: 'Categorias',
      icon: Trophy,
      count: torneio.categorias.length
    },
    {
      id: 'duplas' as TabType,
      label: 'Duplas',
      icon: Users,
      count: torneio.categorias.reduce((total, cat) => total + cat.duplas.length, 0)
    },
    {
      id: 'chaveamento' as TabType,
      label: 'Chaveamento',
      icon: Target,
      disabled: torneio.categorias.length === 0
    }
  ];

  const getStatusColor = (status: Torneio['status']) => {
    switch (status) {
      case 'Inscrições':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Sorteio':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Em andamento':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Finalizado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categorias':
        return (
          <CategoriaForm
            torneio={torneio}
            onAddCategoria={addCategoria}
            onUpdateCategoria={updateCategoria}
            onRemoveCategoria={removeCategoria}
            canEdit={canEdit}
          />
        );
      case 'duplas':
        return (
          <DuplasManager
            torneio={torneio}
            onUpdateTorneio={updateTorneio}
            selectedCategoria={selectedCategoria}
            onSelectCategoria={setSelectedCategoria}
            canEdit={canEdit}
          />
        );
      case 'chaveamento':
        return (
          <ChaveamentoView
            torneio={torneio}
            onUpdateTorneio={updateTorneio}
            selectedCategoria={selectedCategoria}
            onSelectCategoria={setSelectedCategoria}
            canEdit={canEdit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {torneio.nome}
            </h1>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(torneio.status)}`}>
              {torneio.status}
            </span>
          </div>
          {torneio.descricao && (
            <p className="text-gray-600 dark:text-gray-400">{torneio.descricao}</p>
          )}
        </div>
      </div>

      {/* Tournament Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {torneio.local && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Local</span>
              <p className="text-gray-900 dark:text-white">{torneio.local}</p>
            </div>
          )}
          {torneio.dataInicio && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</span>
              <p className="text-gray-900 dark:text-white">{formatDate(torneio.dataInicio)}</p>
            </div>
          )}
          {torneio.dataFim && (
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data de Fim</span>
              <p className="text-gray-900 dark:text-white">{formatDate(torneio.dataFim)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : isDisabled
                      ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {typeof tab.count !== 'undefined' && (
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${isActive
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};