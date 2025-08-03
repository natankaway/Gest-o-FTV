import React, { memo } from 'react';
import {
  MousePointer,
  User,
  Circle,
  ArrowRight,
  Type,
  Square,
  Eraser,
  Trash,
  Download,
  RotateCcw,
  RotateCw,
  Copy,
  Save,
} from 'lucide-react';
import { CanvasTool, DEFAULT_COLORS, TOOL_CONFIGS } from '@/types/canvas';
import { Button } from '@/components/common';

interface CanvasToolbarProps {
  currentTool: CanvasTool;
  currentColor: string;
  onToolChange: (tool: CanvasTool) => void;
  onColorChange: (color: string) => void;
  onClearCanvas?: () => void;
  onExportImage?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  readOnly?: boolean;
  className?: string;
}

const ICON_MAP = {
  MousePointer,
  User,
  Circle,
  ArrowRight,
  Type,
  Square,
  Eraser,
};

interface ToolButtonProps {
  tool: CanvasTool;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, isActive, onClick, disabled = false }) => {
  const config = TOOL_CONFIGS[tool];
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center justify-center p-3 rounded-lg transition-all
        min-h-[64px] min-w-[64px] group
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border border-gray-200 dark:border-gray-600
      `}
      title={`${config.label}${config.shortcut ? ` (${config.shortcut})` : ''}`}
      aria-label={config.label}
    >
      {IconComponent && (
        <IconComponent 
          size={20} 
          className={`mb-1 ${isActive ? 'text-white' : ''}`}
        />
      )}
      <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
        {config.label}
      </span>
      
      {config.shortcut && (
        <span className={`
          absolute -top-1 -right-1 text-xs px-1 rounded
          ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}
          opacity-0 group-hover:opacity-100 transition-opacity
        `}>
          {config.shortcut}
        </span>
      )}
    </button>
  );
};

interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  title: string;
}

const ColorPaletteSection: React.FC<ColorPaletteProps> = ({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  title 
}) => (
  <div className="space-y-2">
    <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
      {title}
    </h4>
    <div className="grid grid-cols-6 gap-1">
      {colors.map((color, index) => (
        <button
          key={`${title}-${index}`}
          onClick={() => onColorSelect(color)}
          className={`
            w-8 h-8 rounded-lg border-2 transition-all hover:scale-110
            ${selectedColor === color 
              ? 'border-gray-800 dark:border-white shadow-lg transform scale-110' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
          style={{ backgroundColor: color }}
          title={color}
          aria-label={`Selecionar cor ${color}`}
        />
      ))}
    </div>
  </div>
);

export const CanvasToolbar: React.FC<CanvasToolbarProps> = memo(({
  currentTool,
  currentColor,
  onToolChange,
  onColorChange,
  onClearCanvas,
  onExportImage,
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  readOnly = false,
  className = '',
}) => {
  const tools: CanvasTool[] = [
    'select',
    'player1', 
    'player2',
    'ball',
    'arrow',
    'text',
    'block',
    'erase'
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-6 ${className}`}>
      {/* Tools Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
          <Square className="w-4 h-4 mr-2" />
          Ferramentas
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {tools.map(tool => (
            <ToolButton
              key={tool}
              tool={tool}
              isActive={currentTool === tool}
              onClick={() => onToolChange(tool)}
              disabled={readOnly && tool !== 'select'}
            />
          ))}
        </div>
      </div>

      {/* Color Palette Section */}
      {!readOnly && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
            <Circle className="w-4 h-4 mr-2" />
            Cores
          </h3>
          
          <div className="space-y-4">
            {/* Current Color Display */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                style={{ backgroundColor: currentColor }}
                title={`Cor atual: ${currentColor}`}
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Cor Selecionada</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{currentColor}</p>
              </div>
            </div>

            {/* Color Palettes */}
            <ColorPaletteSection
              title="Principais"
              colors={DEFAULT_COLORS.primary}
              selectedColor={currentColor}
              onColorSelect={onColorChange}
            />
            
            <ColorPaletteSection
              title="Time 1"
              colors={DEFAULT_COLORS.team1}
              selectedColor={currentColor}
              onColorSelect={onColorChange}
            />
            
            <ColorPaletteSection
              title="Time 2"
              colors={DEFAULT_COLORS.team2}
              selectedColor={currentColor}
              onColorSelect={onColorChange}
            />
            
            <ColorPaletteSection
              title="Neutras"
              colors={DEFAULT_COLORS.neutral}
              selectedColor={currentColor}
              onColorSelect={onColorChange}
            />
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
          <Copy className="w-4 h-4 mr-2" />
          Ações
        </h3>
        
        <div className="space-y-2">
          {/* Undo/Redo */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onUndo}
              disabled={!canUndo}
              leftIcon={<RotateCcw size={14} />}
              className="flex-1"
              title="Desfazer (Ctrl+Z)"
            >
              Desfazer
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onRedo}
              disabled={!canRedo}
              leftIcon={<RotateCw size={14} />}
              className="flex-1"
              title="Refazer (Ctrl+Y)"
            >
              Refazer
            </Button>
          </div>

          {/* Save */}
          {onSave && (
            <Button
              size="sm"
              variant="primary"
              onClick={onSave}
              leftIcon={<Save size={14} />}
              className="w-full"
              title="Salvar prancheta (Ctrl+S)"
            >
              Salvar
            </Button>
          )}

          {/* Export */}
          {onExportImage && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onExportImage}
              leftIcon={<Download size={14} />}
              className="w-full"
              title="Exportar como imagem"
            >
              Exportar
            </Button>
          )}

          {/* Clear Canvas */}
          {onClearCanvas && !readOnly && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja limpar toda a prancheta?')) {
                  onClearCanvas();
                }
              }}
              leftIcon={<Trash size={14} />}
              className="w-full"
              title="Limpar tudo"
            >
              Limpar Tudo
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-2 border-t border-gray-200 dark:border-gray-600">
        <p className="font-medium">Atalhos:</p>
        <div className="grid grid-cols-2 gap-1">
          <span>V - Selecionar</span>
          <span>1 - Time 1</span>
          <span>2 - Time 2</span>
          <span>B - Bola</span>
          <span>A - Seta</span>
          <span>T - Texto</span>
          <span>R - Bloqueio</span>
          <span>E - Apagar</span>
        </div>
        <div className="pt-1">
          <span>Del - Excluir selecionados</span>
        </div>
      </div>
    </div>
  );
});