// Canvas and Prancheta Types for Tactical Training Board

export type ToolType = 'select' | 'free-draw' | 'arrow' | 'player-blue' | 'player-red' | 'ball' | 'text' | 'block' | 'player' | 'curved-arrow' | 'circle' | 'triangle';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasItem {
  id: string;
  type: ToolType;
  position: Point;
  color: string;
  selected?: boolean;
}

export interface PlayerItem extends CanvasItem {
  type: 'player';
  number?: number;
  teamColor?: 'red' | 'blue';
}

export interface BallItem extends CanvasItem {
  type: 'ball';
}

export interface ArrowItem extends CanvasItem {
  type: 'arrow' | 'curved-arrow';
  endPosition: Point;
  thickness?: number;
  curveAmount?: number; // For curved arrows
}

export interface TextItem extends CanvasItem {
  type: 'text';
  text: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface BlockItem extends CanvasItem {
  type: 'block' | 'circle' | 'triangle';
  width: number;
  height: number;
  shape?: 'rectangle' | 'circle' | 'triangle';
}

export type CanvasItemUnion = PlayerItem | BallItem | ArrowItem | TextItem | BlockItem | FreeDrawItem;

export interface PranchetaData {
  id: string;
  items: CanvasItemUnion[];
  fieldDimensions: {
    width: number;
    height: number;
  };
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
}

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
    pranchetaData?: PranchetaData;
  }[];
  observacoes?: string;
  professorId: number;
  professor?: string;
  unidade: string;
  data?: string;
  status?: 'planejado' | 'em-andamento' | 'concluido';
  pranchetaData?: PranchetaData;
}

export interface ExercicioComPrancheta {
  id: number;
  nome: string;
  duracao: number;
  descricao: string;
  categoria: 'aquecimento' | 'tecnica' | 'tatica' | 'fisico' | 'finalizacao';
  equipamentos: string[];
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  pranchetaData?: PranchetaData;
}

export interface CanvasState {
  items: CanvasItemUnion[];
  selectedTool: ToolType;
  selectedColor: string;
  selectedItems: string[];
  isDrawing: boolean;
  dragState: {
    isDragging: boolean;
    draggedItemId: string | null;
    startPosition: Point | null;
    offset: Point | null;
  };
}

export interface FutevoleiField {
  width: number;
  height: number;
  aspectRatio: number; // 1:2 para futevôlei
  sandColor: string;
  lineColor: string;
  netHeight: number;
  netWidth: number;
}

export interface TextEditor {
  isEditing: boolean;
  selectedTextId: string | null;
  fontSize: number;
  fontFamily: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  thickness: number;
  timestamp: number;
}

export interface FreeDrawItem extends CanvasItem {
  type: 'free-draw';
  paths: DrawingPath[];
  thickness: number;
}

export interface DrawingSettings {
  thickness: number;
  opacity: number;
  smoothing: boolean;
}

export interface TextEditorState {
  text: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
  color: string;
  backgroundColor?: string | undefined;
  transparency: number;
}

export interface CanvasSettings {
  zoom: number;
  pan: { x: number; y: number };
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;
}

export interface AdvancedTools {
  shapeType: 'circle' | 'rectangle' | 'triangle';
  lineStyle: 'solid' | 'dashed' | 'dotted';
  arrowType: 'straight' | 'curved';
  thickness: number;
}

export type CourtTheme = 'beach' | 'night' | 'sunset' | 'professional';

export interface CanvasConfig {
  width: number;
  height: number;
  fieldColor: string;
  lineColor: string;
  lineWidth: number;
  // Futevolei-specific properties
  sandColor: string;
  courtLineColor: string;
  netColor: string;
  netHeight: number;
  netWidth: number;
  theme: CourtTheme;
}

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 500,  // Adjusted for futevolei proportions (9m equivalent)
  height: 1000, // Adjusted for futevolei proportions (18m equivalent, 1:2 ratio)
  fieldColor: '#F4A460', // Sand color for futevolei
  sandColor: '#F4A460',  // Sand color
  lineColor: '#FFFFFF',  // White lines
  courtLineColor: '#1E40AF', // Blue court boundaries
  netColor: '#374151',   // Dark gray net
  lineWidth: 3,
  netHeight: 100,  // Net height in the middle
  netWidth: 4,     // Net thickness
  theme: 'beach',
};

export const COURT_THEMES: Record<CourtTheme, CanvasConfig> = {
  beach: {
    ...DEFAULT_CANVAS_CONFIG,
    theme: 'beach',
    fieldColor: '#F4A460',  // Sand
    sandColor: '#F4A460',
    lineColor: '#FFFFFF',   // White lines
    courtLineColor: '#1E40AF', // Blue boundaries
    netColor: '#374151',    // Dark gray net
  },
  professional: {
    ...DEFAULT_CANVAS_CONFIG,
    theme: 'professional',
    fieldColor: '#10B981',  // Professional green
    sandColor: '#10B981',
    lineColor: '#FFFFFF',   // White lines
    courtLineColor: '#FFFFFF', // White boundaries
    netColor: '#1F2937',    // Darker net
  },
  night: {
    ...DEFAULT_CANVAS_CONFIG,
    theme: 'night',
    fieldColor: '#1F2937',  // Dark background
    sandColor: '#1F2937',
    lineColor: '#F59E0B',   // Yellow lines for visibility
    courtLineColor: '#F59E0B', // Yellow boundaries
    netColor: '#6B7280',    // Light gray net
  },
  sunset: {
    ...DEFAULT_CANVAS_CONFIG,
    theme: 'sunset',
    fieldColor: '#F97316',  // Orange sunset
    sandColor: '#F97316',
    lineColor: '#FEF3C7',   // Light yellow lines
    courtLineColor: '#FEF3C7', // Light yellow boundaries
    netColor: '#92400E',    // Dark orange net
  },
};

export const DEFAULT_COLORS = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#000000', // Black
  '#FFFFFF', // White
];