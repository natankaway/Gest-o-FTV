import React, { memo } from 'react';
import { Palette } from 'lucide-react';
import type { CourtTheme } from '@/types/canvas';
import { COURT_THEMES } from '@/types/canvas';

interface ThemeSelectorProps {
  selectedTheme: CourtTheme | undefined;
  onThemeChange: (theme: CourtTheme) => void;
  disabled?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = memo(({
  selectedTheme,
  onThemeChange,
  disabled = false
}) => {
  const getThemePreview = (theme: CourtTheme) => {
    const overrides = theme.overrides || {};
    return {
      backgroundColor: overrides.sandColor || '#F4A460',
      borderColor: overrides.courtLineColor || '#1E40AF',
    };
  };

  const getThemeButtonClass = (theme: CourtTheme) => {
    const baseClass = "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 hover:scale-105";
    const isSelected = selectedTheme?.key === theme.key;
    
    if (disabled) {
      return `${baseClass} border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed`;
    }
    
    if (isSelected) {
      return `${baseClass} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md ring-2 ring-blue-300 ring-offset-2 ring-offset-white dark:ring-offset-gray-900`;
    }
    
    return `${baseClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700`;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Palette size={16} />
        Temas da Quadra
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {COURT_THEMES.map((theme) => {
          const preview = getThemePreview(theme);
          return (
            <button
              key={theme.key}
              onClick={() => !disabled && onThemeChange(theme)}
              disabled={disabled}
              className={getThemeButtonClass(theme)}
              title={`Tema: ${theme.name}`}
              aria-label={`Selecionar tema ${theme.name}`}
            >
              {/* Theme preview */}
              <div 
                className="w-12 h-6 rounded border-2 shadow-sm"
                style={{
                  backgroundColor: preview.backgroundColor,
                  borderColor: preview.borderColor,
                }}
              >
                {/* Net representation */}
                <div 
                  className="w-full h-0.5 mt-2.5"
                  style={{ backgroundColor: preview.borderColor }}
                />
              </div>
              <span className="text-xs font-medium">{theme.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Selected theme indicator */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Tema:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {selectedTheme?.name || 'Praia'}
          </span>
        </div>
      </div>
    </div>
  );
});

ThemeSelector.displayName = 'ThemeSelector';