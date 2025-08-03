// Canvas and Prancheta Types for Tactical Training Board

export type ToolType = 'select' | 'player' | 'ball' | 'arrow' | 'text' | 'block' | 'curved-arrow' | 'circle' | 'triangle';

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

export type CanvasItemUnion = PlayerItem | BallItem | ArrowItem | TextItem | BlockItem;

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

export interface AdvancedTools {
  shapeType: 'circle' | 'rectangle' | 'triangle';
  lineStyle: 'solid' | 'dashed' | 'dotted';
  arrowType: 'straight' | 'curved';
  thickness: number;
}

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