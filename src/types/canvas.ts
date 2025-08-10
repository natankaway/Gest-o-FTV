// Tipos para a Prancheta Tática

export type ToolType =
  | 'select'
  | 'player-blue'
  | 'player-red'
  | 'ball'
  | 'text'
  | 'block'
  | 'arrow';

export interface Point {
  x: number;
  y: number;
}

// Interface base para todos os itens no canvas
export interface CanvasItem {
  id: string;
  type: ToolType;
  position: Point;
  color: string;
  width?: number;  // Para redimensionamento
  height?: number; // Para redimensionamento
}

// Tipos específicos que estendem a base
export interface PlayerItem extends CanvasItem {
  type: 'player-blue' | 'player-red';
  number?: number;
}

export interface BallItem extends CanvasItem {
  type: 'ball';
}

export interface BlockItem extends CanvasItem {
    type: 'block';
}

export interface TextItem extends CanvasItem {
  type: 'text';
  text: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  opacity?: number;
}

export interface ArrowItem extends CanvasItem {
    type: 'arrow';
    endPosition: Point;
}

// União de todos os tipos de itens possíveis
export type CanvasItemUnion = PlayerItem | BallItem | BlockItem | TextItem | ArrowItem;

// Estrutura principal que será salva no estado do treino
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
