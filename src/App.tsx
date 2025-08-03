import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, NotificationProvider, AppStateProvider } from '@/contexts';
import { ErrorBoundary } from '@/components/common';
import { MainApp } from '@/pages/MainApp';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AppStateProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg, #333)',
                    color: 'var(--toast-color, #fff)',
                  },
                }}
              />
              <MainApp />
            </div>
          </AppStateProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;