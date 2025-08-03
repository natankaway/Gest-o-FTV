import React, { memo } from 'react';
import { 
  MousePointer2, 
  Users, 
  Circle, 
  ArrowRight, 
  Type, 
  Square,
  Palette
} from 'lucide-react';
import type { ToolType } from '@/types/canvas';
import { DEFAULT_COLORS } from '@/types/canvas';

interface CanvasToolbarProps {
  selectedTool: ToolType;
  selectedColor: string;
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = memo(({
  selectedTool,
  selectedColor,
  onToolChange,
  onColorChange,
  disabled = false
}) => {
  const tools = [
    {
      type: 'select' as ToolType,
      icon: MousePointer2,
      label: 'Selecionar',
      description: 'Selecionar e mover itens'
    },
    {
      type: 'player' as ToolType,
      icon: Users,
      label: 'Jogador',
      description: 'Adicionar jogador'
    },
    {
      type: 'ball' as ToolType,
      icon: Circle,
      label: 'Bola',
      description: 'Adicionar bola'
    },
    {
      type: 'arrow' as ToolType,
      icon: ArrowRight,
      label: 'Seta',
      description: 'Desenhar seta'
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
      description: 'Adicionar obstáculo'
    },
  ];

  const getToolButtonClass = (toolType: ToolType) => {
    const baseClass = "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200 hover:scale-105";
    const isSelected = selectedTool === toolType;
    
    if (disabled) {
      return `${baseClass} border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed`;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="space-y-6">
        {/* Tools Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <MousePointer2 size={16} />
            Ferramentas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.type}
                  onClick={() => !disabled && onToolChange(tool.type)}
                  disabled={disabled}
                  className={getToolButtonClass(tool.type)}
                  title={tool.description}
                  aria-label={tool.label}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{tool.label}</span>
                </button>
              );
            })}
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

        {/* Selected Tool & Color Indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Ferramenta:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
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