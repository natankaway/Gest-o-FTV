/// <reference types="vite/client" />

// Base interface for all canvas items
export interface CanvasItem {
  id: string;
  type: 'player1' | 'player2' | 'ball' | 'arrow' | 'text' | 'block';
  x: number;
  y: number;
  color?: string;
  selected?: boolean;
  createdAt?: string;
}

// Player item interface
export interface PlayerItem extends CanvasItem {
  type: 'player1' | 'player2';
  number?: number;
  size?: number;
}

// Ball item interface
export interface BallItem extends CanvasItem {
  type: 'ball';
  size?: number;
}

// Arrow item interface
export interface ArrowItem extends CanvasItem {
  type: 'arrow';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  thickness?: number;
  style?: 'solid' | 'dashed';
}

// Text item interface
export interface TextItem extends CanvasItem {
  type: 'text';
  text: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontFamily?: string;
}

// Block/Obstacle item interface
export interface BlockItem extends CanvasItem {
  type: 'block';
  width: number;
  height: number;
  shape?: 'rectangle' | 'circle' | 'triangle';
}

// Union type for all possible canvas items
export type CanvasItemUnion = PlayerItem | BallItem | ArrowItem | TextItem | BlockItem;

// Canvas tool types
export type CanvasTool = 'select' | 'player1' | 'player2' | 'ball' | 'arrow' | 'text' | 'block' | 'erase';

// Canvas state interface
export interface CanvasState {
  items: CanvasItemUnion[];
  selectedItems: string[];
  currentTool: CanvasTool;
  currentColor: string;
  isDrawing: boolean;
  dragState: {
    isDragging: boolean;
    itemId: string | null;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  };
  arrowState: {
    isDrawingArrow: boolean;
    startX: number;
    startY: number;
  };
}

// Canvas configuration interface
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  fieldColor: string;
  lineColor: string;
  showGrid: boolean;
  gridSize: number;
  enableSnapping: boolean;
  snapTolerance: number;
}

// Prancheta (Canvas board) data interface
export interface PranchetaData {
  id?: string;
  name?: string;
  description?: string;
  items: CanvasItemUnion[];
  config?: Partial<CanvasConfig>;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

// Training with canvas data interface
export interface TreinoComPrancheta {
  id: number;
  nome: string;
  tipo: 'tecnico' | 'fisico' | 'tatico' | 'jogo';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao: number;
  objetivo: string;
  equipamentos: string[];
  exercicios: {
    id: string;
    nome: string;
    duracao: number;
    descricao: string;
    ordem: number;
    pranchetaData?: PranchetaData; // Canvas data for this exercise
  }[];
  observacoes?: string;
  professorId: number;
  professor?: string;
  unidade: string;
  data?: string;
  status?: 'planejado' | 'em-andamento' | 'concluido';
  pranchetaData?: PranchetaData; // Main canvas data for the training
}

// Exercise with canvas data interface
export interface ExercicioComPrancheta {
  id: number;
  nome: string;
  duracao: number;
  descricao: string;
  categoria: 'aquecimento' | 'tecnica' | 'tatica' | 'fisico' | 'finalizacao';
  equipamentos: string[];
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  pranchetaData?: PranchetaData; // Canvas data for this exercise
  instrucoes?: string[];
  variacoes?: string[];
}

// Canvas event interfaces
export interface CanvasMouseEvent {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  type: 'mousedown' | 'mousemove' | 'mouseup' | 'click' | 'dblclick';
}

export interface CanvasKeyboardEvent {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  preventDefault: () => void;
}

// Canvas history interface for undo/redo functionality
export interface CanvasHistory {
  states: CanvasItemUnion[][];
  currentIndex: number;
  maxStates: number;
}

// Canvas colors palette
export interface ColorPalette {
  primary: string[];
  secondary: string[];
  team1: string[];
  team2: string[];
  neutral: string[];
}

// Default color palette
export const DEFAULT_COLORS: ColorPalette = {
  primary: [
    '#ef4444', // red-500
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
  ],
  secondary: [
    '#64748b', // slate-500
    '#6b7280', // gray-500
    '#78716c', // stone-500
    '#dc2626', // red-600
    '#2563eb', // blue-600
    '#059669', // emerald-600
  ],
  team1: [
    '#1e40af', // blue-800
    '#2563eb', // blue-600
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
  ],
  team2: [
    '#dc2626', // red-600
    '#ef4444', // red-500
    '#f87171', // red-400
    '#fca5a5', // red-300
  ],
  neutral: [
    '#000000', // black
    '#374151', // gray-700
    '#6b7280', // gray-500
    '#9ca3af', // gray-400
    '#ffffff', // white
  ],
};

// Canvas field dimensions (futevôlei court)
export const FIELD_DIMENSIONS = {
  width: 800,
  height: 600,
  centerLineY: 300,
  centerCircleRadius: 60,
  courtWidth: 18, // meters
  courtHeight: 9, // meters
  netHeight: 2.2, // meters
} as const;

// Default canvas configuration
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: FIELD_DIMENSIONS.width,
  height: FIELD_DIMENSIONS.height,
  backgroundColor: '#f8fafc', // slate-50
  fieldColor: '#22c55e', // green-500
  lineColor: '#ffffff',
  showGrid: false,
  gridSize: 20,
  enableSnapping: true,
  snapTolerance: 10,
};

// Tool configurations
export interface ToolConfig {
  cursor: string;
  icon: string;
  label: string;
  shortcut?: string;
  color?: string;
}

export const TOOL_CONFIGS: Record<CanvasTool, ToolConfig> = {
  select: {
    cursor: 'default',
    icon: 'MousePointer',
    label: 'Selecionar',
    shortcut: 'V',
  },
  player1: {
    cursor: 'crosshair',
    icon: 'User',
    label: 'Jogador Time 1',
    shortcut: '1',
    color: '#3b82f6',
  },
  player2: {
    cursor: 'crosshair',
    icon: 'User',
    label: 'Jogador Time 2',
    shortcut: '2',
    color: '#ef4444',
  },
  ball: {
    cursor: 'crosshair',
    icon: 'Circle',
    label: 'Bola',
    shortcut: 'B',
    color: '#f59e0b',
  },
  arrow: {
    cursor: 'crosshair',
    icon: 'ArrowRight',
    label: 'Seta',
    shortcut: 'A',
    color: '#6b7280',
  },
  text: {
    cursor: 'text',
    icon: 'Type',
    label: 'Texto',
    shortcut: 'T',
    color: '#000000',
  },
  block: {
    cursor: 'crosshair',
    icon: 'Square',
    label: 'Bloqueio',
    shortcut: 'R',
    color: '#8b5cf6',
  },
  erase: {
    cursor: 'crosshair',
    icon: 'Eraser',
    label: 'Apagar',
    shortcut: 'E',
  },
};