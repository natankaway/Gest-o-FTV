import React, { useState, useCallback } from 'react';
import { useAppState } from '@/contexts';
import { LoginModal } from '@/components/forms/LoginModal';
import { Sidebar, Header } from '@/components/layout';
import { MainDashboard } from '@/components/dashboard';
import { AlunosPage } from '@/components/alunos';
import { ProfessoresPage } from '@/components/professores';
import { GestoresPage } from '@/components/gestores';
import { PresencasPage } from '@/components/presencas';
import { PlanosPage } from '@/components/planos';
import { ProdutosPage } from '@/components/produtos';
import { FinanceiroPage } from '@/components/financeiro';
import { AgendamentosPage } from '@/components/agendamentos';
import { TreinosPage } from '@/components/treinos';
import { ConfiguracoesPage } from '@/components/configuracoes';
import { MetasPage } from '@/components/metas';
import { ErrorBoundary } from '@/components/common';

export const MainApp: React.FC = () => {
  const { userLogado, activeTab } = useAppState();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboard />;
      case 'alunos':
        return <AlunosPage />;
      case 'professores':
        return <ProfessoresPage />;
      case 'gestores':
        return <GestoresPage />;
      case 'presencas':
        return <PresencasPage />;
      case 'agendamentos':
        return <AgendamentosPage />;
      case 'treinos':
        return <TreinosPage />;
      case 'planos':
        return <PlanosPage />;
      case 'produtos':
        return <ProdutosPage />;
      case 'financeiro':
        return <FinanceiroPage />;
      case 'metas':
        return <MetasPage />;
      case 'configuracoes':
        return <ConfiguracoesPage />;
      default:
        return <MainDashboard />;
    }
  }, [activeTab]);

  if (!userLogado) {
    return <LoginModal />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          setMobileOpen={setIsMobileSidebarOpen} 
          isCollapsed={isSidebarCollapsed} 
        />
        
        <div className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } min-h-screen flex flex-col`}>
          <Header 
            toggleMobileSidebar={toggleMobileSidebar} 
            toggleSidebarCollapse={toggleSidebarCollapse} 
          />
          
          <main className="flex-grow p-3 sm:p-4 lg:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};