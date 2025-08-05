import React, { memo } from 'react';
import { 
  MousePointer2, 
  Users, 
  Circle, 
  ArrowRight, 
  Type, 
  Square,
  Palette,
  Brush,
  Trash2,
  Image
} from 'lucide-react';
import type { ToolType, CourtTheme } from '@/types/canvas';
import { DEFAULT_COLORS } from '@/types/canvas';

interface CanvasToolbarProps {
  selectedTool: ToolType;
  selectedColor: string;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onClearDrawing?: () => void;
  disabled?: boolean;
  isMobile?: boolean;
  theme?: CourtTheme;
  onThemeChange?: (theme: CourtTheme) => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = memo(({
  selectedTool,
  selectedColor,
  onToolChange,
  onColorChange,
  onClearDrawing,
  disabled = false,
  isMobile = false,
  theme = 'beach',
  onThemeChange
}) => {
  const tools = [
    {
      type: 'select' as ToolType,
      icon: MousePointer2,
      label: 'Selecionar',
      description: 'Selecionar e mover itens'
    },
    {
      type: 'free-draw' as ToolType,
      icon: Brush,
      label: 'Desenho Livre',
      description: 'Desenhar livremente com pincel',
      highlighted: true // Special highlighting for free draw tool
    },
    {
      type: 'arrow' as ToolType,
      icon: ArrowRight,
      label: 'Seta',
      description: 'Desenhar seta reta'
    },
    {
      type: 'player-blue' as ToolType,
      icon: Users,
      label: 'Time Azul',
      description: 'Adicionar jogador do time azul',
      color: '#3B82F6'
    },
    {
      type: 'player-red' as ToolType,
      icon: Users,
      label: 'Time Vermelho',
      description: 'Adicionar jogador do time vermelho',
      color: '#EF4444'
    },
    {
      type: 'ball' as ToolType,
      icon: Circle,
      label: 'Bola',
      description: 'Adicionar bola'
    },
    {
      type: 'text' as ToolType,
      icon: Type,
      label: 'Texto',
      description: 'Adicionar texto'
    },
    {
      type: 'block' as ToolType,
      icon: Square,
      label: 'Bloqueio',
      description: 'Adicionar bloqueio/obstáculo'
    },
  ];

  const getToolButtonClass = (tool: any) => {
    const baseClass = "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200 hover:scale-105";
    const isSelected = selectedTool === tool.type;
    
    if (disabled) {
      return `${baseClass} border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed`;
    }

    // Special styling for free-draw tool (highlighted in blue)
    if (tool.highlighted) {
      if (isSelected) {
        return `${baseClass} border-blue-500 bg-blue-500 text-white shadow-lg ring-2 ring-blue-300 ring-offset-2 ring-offset-white dark:ring-offset-gray-900`;
      }
      return `${baseClass} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30`;
    }

    // Team color styling
    if (tool.color) {
      if (isSelected) {
        return `${baseClass} border-2 shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900`
          + (tool.color === '#3B82F6' ? ' border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-blue-300'
                                       : ' border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-red-300');
      }
      return `${baseClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600`
        + (tool.color === '#3B82F6' ? ' text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                     : ' text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10');
    }
    
    if (isSelected) {
      return `${baseClass} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md`;
    }
    
    return `${baseClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700`;
  };

  const getColorButtonClass = (color: string) => {
    const baseClass = "w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110";
    const isSelected = selectedColor === color;
    
    if (disabled) {
      return `${baseClass} border-gray-300 cursor-not-allowed opacity-50`;
    }
    
    if (isSelected) {
      return `${baseClass} border-gray-800 dark:border-gray-200 shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900`;
    }
    
    return `${baseClass} border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`;
  };

  const getToolIcon = (tool: any) => {
    const Icon = tool.icon;
    return <Icon size={20} style={tool.color ? { color: tool.color } : {}} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="space-y-6">
        {/* Tools Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Brush size={16} />
            Ferramentas
          </h3>
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8'}`}>
            {tools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => !disabled && onToolChange(tool.type)}
                disabled={disabled}
                className={getToolButtonClass(tool)}
                title={tool.description}
                aria-label={tool.label}
              >
                {getToolIcon(tool)}
                <span className="text-xs font-medium">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Palette size={16} />
            Cores
          </h3>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => !disabled && onColorChange(color)}
                disabled={disabled}
                className={getColorButtonClass(color)}
                style={{ backgroundColor: color }}
                title={`Cor: ${color}`}
                aria-label={`Selecionar cor ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Theme Section */}
        {onThemeChange && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Image size={16} />
              Tema da Quadra
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'beach', label: 'Praia', color: '#F4A460', description: 'Areia tradicional' },
                { value: 'professional', label: 'Profissional', color: '#10B981', description: 'Verde profissional' },
                { value: 'night', label: 'Noturno', color: '#1F2937', description: 'Modo noturno' },
                { value: 'sunset', label: 'Pôr do Sol', color: '#F97316', description: 'Tons de pôr do sol' }
              ].map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => !disabled && onThemeChange(themeOption.value as CourtTheme)}
                  disabled={disabled}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                    theme === themeOption.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  title={themeOption.description}
                >
                  <div 
                    className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: themeOption.color }}
                  />
                  <span>{themeOption.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Clear Button */}
        {isMobile && onClearDrawing && (
          <div>
            <button
              onClick={onClearDrawing}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              title="Limpar desenho"
            >
              <Trash2 size={16} />
              Limpar Desenho
            </button>
          </div>
        )}

        {/* Selected Tool & Color Indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Ferramenta:</span>
            <span className={`font-medium capitalize ${
              selectedTool === 'free-draw' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
            }`}>
              {tools.find(t => t.type === selectedTool)?.label || selectedTool}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Cor:</span>
            <div 
              className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono text-xs">
              {selectedColor.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

CanvasToolbar.displayName = 'CanvasToolbar';