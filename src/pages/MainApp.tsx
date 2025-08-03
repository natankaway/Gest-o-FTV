import React from 'react';
import { useAppState, useTheme } from '@/contexts';
import { Button, LoadingSpinner } from '@/components/common';
import { Sun, Moon } from 'lucide-react';

export const MainApp: React.FC = () => {
  const { userLogado } = useAppState();
  const { isDarkMode, toggleTheme } = useTheme();

  // For now, just show a basic UI to test our setup
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Sistema de Gestão FTV</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Refatoração para TypeScript em andamento...
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span>Tema:</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              leftIcon={isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            >
              {isDarkMode ? 'Claro' : 'Escuro'}
            </Button>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Status: TypeScript setup funcionando</p>
            <p>Tema: {isDarkMode ? 'Escuro' : 'Claro'}</p>
            <p>Usuário: {userLogado ? userLogado.nome : 'Não logado'}</p>
          </div>

          <LoadingSpinner size="sm" text="Migração em progresso..." />
        </div>
      </div>
    </div>
  );
};