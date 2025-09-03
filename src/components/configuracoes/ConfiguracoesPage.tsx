import React, { useState } from 'react';
import { useAppState } from '@/contexts';
import { Settings, Building, Clock } from 'lucide-react';
import { GeralTab } from './GeralTab';
import { UnidadesTab } from './UnidadesTab';
import { HorariosTab } from './HorariosTab';

export const ConfiguracoesPage: React.FC = () => {
  const { userLogado } = useAppState();
  const [activeTab, setActiveTab] = useState<'geral' | 'unidades' | 'horarios'>('geral');

  // Check if user is admin
  if (userLogado?.perfil !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Apenas administradores podem acessar as configurações do CT.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configurações do CT
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie as configurações gerais e as unidades do centro de treinamento
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('geral')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'geral'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Geral</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('unidades')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unidades'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Unidades</span>
              </div>
            </button>
			
			<button
              onClick={() => setActiveTab('horarios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'horarios'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Horários & Aulas</span>
              </div>
            </button>
			
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'geral' && <GeralTab />}
          {activeTab === 'unidades' && <UnidadesTab />}
          {activeTab === 'horarios' && <HorariosTab />}
        </div>
      </div>
    </div>
  );
};