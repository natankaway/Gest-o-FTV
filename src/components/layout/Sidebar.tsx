import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { 
  BarChart3, 
  Users, 
  User, 
  Settings, 
  Calendar, 
  BookOpen, 
  Target, 
  DollarSign, 
  ShoppingCart, 
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';
import type { TabKeys } from '@/types';

interface MenuItem {
  id: TabKeys;
  label: string;
  icon: React.ComponentType<any>;
  roles: string[];
  badge?: {
    count: number;
    color: string;
  };
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
}

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = memo(({ 
  isMobileOpen, 
  setMobileOpen, 
  isCollapsed 
}) => {
  const { activeTab, setActiveTab, userLogado, setUserLogado } = useAppState();
  const { addNotification } = useNotifications();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'visao-geral': true,
    'pessoas': true,
    'operacional': true,
    'treinamento': true,
    'financeiro': true,
    'extras': true
  });

  const userRole = userLogado?.perfil || 'admin';

  const handleLogout = useCallback(() => {
    setUserLogado(null);
    setActiveTab('dashboard');
    addNotification({
      type: 'success',
      title: 'Logout realizado',
      message: 'Até a próxima!'
    });
  }, [setUserLogado, setActiveTab, addNotification]);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const menuSections: MenuSection[] = useMemo(() => {
    const sections: MenuSection[] = [];
    
    // Dashboard section (always visible)
    sections.push({
      id: 'visao-geral',
      title: "📊 Visão Geral",
      icon: BarChart3,
      items: [
        { 
          id: 'dashboard', 
          label: userRole === 'aluno' ? 'Meu Painel' : 'Dashboard', 
          icon: BarChart3,
          roles: ['admin', 'professor', 'aluno', 'gestor']
        }
      ]
    });

    // People management section (admin and gestor)
    if (userRole === 'admin' || userRole === 'gestor') {
      const pessoasItems: MenuItem[] = [
        { id: 'alunos', label: 'Alunos', icon: Users, roles: ['admin', 'gestor'] },
        { id: 'professores', label: 'Professores', icon: User, roles: ['admin', 'gestor'] }
      ];
      
      if (userRole === 'admin') {
        pessoasItems.push({ id: 'gestores' as TabKeys, label: 'Gestores', icon: Settings, roles: ['admin'] });
      }
      
      sections.push({
        id: 'pessoas',
        title: "👥 Gestão de Pessoas",
        icon: Users,
        items: pessoasItems
      });
    }

    // Operational section
    if (userRole === 'admin' || userRole === 'gestor' || userRole === 'professor') {
      sections.push({
        id: 'operacional',
        title: "⚡ Operacional",
        icon: Calendar,
        items: [
          { id: 'presencas', label: 'Presenças', icon: Calendar, roles: ['admin', 'gestor', 'professor'] },
          { id: 'agendamentos' as TabKeys, label: 'Agendamentos', icon: Calendar, roles: ['admin', 'gestor'] }
        ]
      });
    }

    // Training section
    if (userRole === 'admin' || userRole === 'professor') {
      sections.push({
        id: 'treinamento',
        title: "🏃‍♂️ Treinamento",
        icon: Target,
        items: [
          { id: 'treinos', label: 'Treinos', icon: Target, roles: ['admin', 'professor'] },
          { id: 'planos', label: 'Planos', icon: BookOpen, roles: ['admin'] }
        ]
      });
    }

    // Financial section
    if (userRole === 'admin' || userRole === 'gestor') {
      sections.push({
        id: 'financeiro',
        title: "💰 Financeiro",
        icon: DollarSign,
        items: [
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign, roles: ['admin', 'gestor'] },
          { id: 'produtos', label: 'Produtos', icon: ShoppingCart, roles: ['admin', 'gestor'] }
        ]
      });
    }

    // Configuration section (admin only)
    if (userRole === 'admin') {
      sections.push({
        id: 'configuracoes',
        title: "⚙️ Sistema",
        icon: Settings,
        items: [
          { id: 'configuracoes', label: 'Configurações do CT', icon: Settings, roles: ['admin'] }
        ]
      });
    }

    return sections;
  }, [userRole]);

  const handleMenuClick = useCallback((tabId: TabKeys) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      setMobileOpen(false);
    }
  }, [setActiveTab, isMobileOpen, setMobileOpen]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              FTV
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Gestão FTV
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sistema de Gestão
                </p>
              </div>
            )}
          </div>
          {isMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && userLogado && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userLogado.nome}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {userLogado.perfil}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto menu-barra-bonita">
        <div className="space-y-2">
          {menuSections.map((section) => (
            <div key={section.id}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronDown 
                    className={`h-4 w-4 transform transition-transform ${
                      openSections[section.id] ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
              
              {(isCollapsed || openSections[section.id]) && (
                <div className={`space-y-1 ${!isCollapsed ? 'ml-2' : ''}`}>
                  {section.items
                    .filter(item => item.roles.includes(userRole))
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full flex items-center ${
                          isCollapsed ? 'justify-center p-3' : 'px-3 py-2'
                        } rounded-lg text-sm transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="ml-3 flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-${item.badge.color}-500 text-white`}>
                                {item.badge.count}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-3' : 'px-3 py-2'
          } rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3">Sair</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-50 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>
    </>
  );
});