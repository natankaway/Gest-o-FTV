import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useAppState, useTheme, useNotifications } from '@/contexts';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  ShoppingCart, 
  User
} from 'lucide-react';
import type { TabKeys } from '@/types';

interface HeaderProps {
  toggleMobileSidebar: () => void;
  toggleSidebarCollapse: () => void;
}

export const Header: React.FC<HeaderProps> = memo(({ 
  toggleMobileSidebar, 
  toggleSidebarCollapse 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeTab, userLogado, cart } = useAppState();
  const { notifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

const getPageTitle = useCallback(() => {
  const titles: Partial<Record<TabKeys, string>> = {
    dashboard: userLogado?.perfil === 'aluno' ? 'Meu Painel' : 'Dashboard',
    alunos: 'Alunos',
    professores: 'Professores',
    presencas: 'Presenças',
    treinos: 'Treinos',
    planos: 'Planos',
    produtos: 'Produtos',
    financeiro: 'Financeiro',
    unidades: 'Unidades',
    'horas-professores': userLogado?.perfil === 'professor' ? 'Minhas Horas' : 'Horas Professores' // ← ADICIONAR ESTA LINHA
  };
  return titles[activeTab] || activeTab;
}, [activeTab, userLogado?.perfil]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantidade, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Left Section */}
        <div className="flex items-center min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden mr-2 p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:block mr-2 sm:mr-4 p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page Title */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {getPageTitle()}
            </h1>
            {userLogado?.unidade && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {userLogado.unidade}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            style={{ minHeight: '44px', minWidth: '44px' }}
            title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Shopping Cart (if applicable) */}
          {(userLogado?.perfil === 'admin' || userLogado?.perfil === 'gestor') && cartItemCount > 0 && (
            <button
              className="relative p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              style={{ minHeight: '44px', minWidth: '44px' }}
              title="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              style={{ minHeight: '44px', minWidth: '44px' }}
              title="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notificações
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {}}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Limpar todas
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                            )}
                          </div>
                          <div className={`ml-2 w-2 h-2 rounded-full ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'error' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userLogado?.nome}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {userLogado?.perfil}
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});