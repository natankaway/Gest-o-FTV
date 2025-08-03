import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@/hooks';
import type { ThemeContextType } from '@/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-dark-mode', false);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
    toast.success(`Tema ${!isDarkMode ? 'escuro' : 'claro'} ativado`);
  }, [isDarkMode, setIsDarkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove(isDarkMode ? 'light' : 'dark');
      root.classList.add(isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};