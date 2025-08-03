import React from 'react';
import { useAppState, useTheme } from '@/contexts';
import { Button, LoadingSpinner } from '@/components/common';
import { LoginModal } from '@/components/forms/LoginModal';
import { Sun, Moon, LogOut } from 'lucide-react';

export const MainApp: React.FC = () => {
  const { userLogado, setUserLogado } = useAppState();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    setUserLogado(null);
  };

  if (!userLogado) {
    return <LoginModal />;
  }

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

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Status:</strong> TypeScript setup funcionando ✅</p>
            <p><strong>Tema:</strong> {isDarkMode ? 'Escuro' : 'Claro'}</p>
            <p><strong>Usuário:</strong> {userLogado.nome} ({userLogado.perfil})</p>
            {userLogado.unidade && <p><strong>Unidade:</strong> {userLogado.unidade}</p>}
            {userLogado.unidades && (
              <p><strong>Unidades:</strong> {userLogado.unidades.join(', ')}</p>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <LoadingSpinner size="sm" text="Migração em progresso..." />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut size={16} />}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};