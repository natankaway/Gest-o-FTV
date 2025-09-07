// src/components/dashboard/MainDashboard.tsx
import React, { memo } from 'react';
import { useAppState } from '@/contexts';
import { AdminDashboard } from './AdminDashboard';
import { GestorDashboard } from './GestorDashboard';
import { ProfessorDashboard } from './ProfessorDashboard';
import { AlunoDashboard } from './AlunoDashboard';

export const MainDashboard: React.FC = memo(() => {
  const { userLogado } = useAppState();

  // Renderizar dashboard específico baseado no perfil do usuário
  const renderDashboard = () => {
    if (!userLogado) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">
            Faça login para acessar o dashboard
          </p>
        </div>
      );
    }

    switch (userLogado.perfil) {
      case 'admin':
        return <AdminDashboard />;
      
      case 'gestor':
        return <GestorDashboard />;
      
      case 'professor':
        return <ProfessorDashboard />;
      
      case 'aluno':
        return <AlunoDashboard />;
      
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              Perfil de usuário não reconhecido
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
});