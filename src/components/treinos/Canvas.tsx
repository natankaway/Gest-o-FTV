import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import type { 
  CanvasItemUnion, 
  CanvasState, 
  CanvasConfig, 
  Point, 
  ToolType,
  PranchetaData,
  PlayerItem,
  BallItem,
  ArrowItem,
  TextItem,
  BlockItem,
} from '@/types/canvas';
import { DEFAULT_CANVAS_CONFIG } from '@/types/canvas';

interface CanvasProps {
  data?: PranchetaData;
  selectedTool: ToolType;
  selectedColor: string;
  onDataChange?: (data: PranchetaData) => void;
  readonly?: boolean;
  config?: Partial<CanvasConfig>;
}

export const Canvas: React.FC<CanvasProps> = memo(({
  data,
  selectedTool,
  selectedColor,
  onDataChange,
  readonly = false,
  config: configOverride = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    items: data?.items || [],
    selectedTool,
    selectedColor,
    selectedItems: [],
    isDrawing: false,
    dragState: {
      isDragging: false,
      draggedItemId: null,
      startPosition: null,
      offset: null,
    },
  });

  const config: CanvasConfig = { ...DEFAULT_CANVAS_CONFIG, ...configOverride };

  // Update canvas state when props change
  useEffect(() => {
    setCanvasState(prev => ({
      ...prev,
      selectedTool,
      selectedColor,
      items: data?.items || prev.items,
    }));
  }, [selectedTool, selectedColor, data]);

  // Generate unique ID for new items
  const generateId = useCallback(() => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Draw field background and lines
  const drawField = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height, fieldColor, lineColor, lineWidth, centerCircleRadius } = config;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw field background
    ctx.fillStyle = fieldColor;
    ctx.fillRect(0, 0, width, height);

    // Set line style
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    // Draw field borders
    ctx.strokeRect(lineWidth / 2, lineWidth / 2, width - lineWidth, height - lineWidth);

    // Draw center line
    ctx.beginPath();
    ctx.moveTo(width / 2, lineWidth);
    ctx.lineTo(width / 2, height - lineWidth);
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, centerCircleRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw goal areas (simplified for futevôlei)
    const goalWidth = config.goalWidth;
    const goalHeight = config.goalHeight;
    
    // Left goal area
    ctx.strokeRect(lineWidth, (height - goalHeight) / 2, goalWidth, goalHeight);
    
    // Right goal area
    ctx.strokeRect(width - goalWidth - lineWidth, (height - goalHeight) / 2, goalWidth, goalHeight);
  }, [config]);

  // Draw a single canvas item
  const drawItem = useCallback((ctx: CanvasRenderingContext2D, item: CanvasItemUnion) => {
    ctx.save();

    // Apply selection highlight
    if (item.selected) {
      ctx.shadowColor = '#3B82F6';
      ctx.shadowBlur = 8;
    }

    switch (item.type) {
      case 'player': {
        const playerItem = item as PlayerItem;
        ctx.fillStyle = playerItem.color;
        ctx.strokeStyle = playerItem.teamColor || '#000000';
        ctx.lineWidth = 2;

        // Draw player circle
        ctx.beginPath();
        ctx.arc(playerItem.position.x, playerItem.position.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw player number
        if (playerItem.number) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            playerItem.number.toString(),
            playerItem.position.x,
            playerItem.position.y
          );
        }
        break;
      }

      case 'ball': {
        const ballItem = item as BallItem;
        ctx.fillStyle = ballItem.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // Draw ball
        ctx.beginPath();
        ctx.arc(ballItem.position.x, ballItem.position.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw ball pattern
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ballItem.position.x, ballItem.position.y, 5, 0, Math.PI);
        ctx.stroke();
        break;
      }

      case 'arrow': {
        const arrowItem = item as ArrowItem;
        ctx.strokeStyle = arrowItem.color;
        ctx.fillStyle = arrowItem.color;
        ctx.lineWidth = arrowItem.thickness || 3;

        const start = arrowItem.position;
        const end = arrowItem.endPosition;

        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = 15;

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'text': {
        const textItem = item as TextItem;
        ctx.fillStyle = textItem.color;
        ctx.font = `${textItem.fontSize || 16}px ${textItem.fontFamily || 'Arial'}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(textItem.text, textItem.position.x, textItem.position.y);
        break;
      }

      case 'block': {
        const blockItem = item as BlockItem;
        ctx.fillStyle = blockItem.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        if (blockItem.shape === 'circle') {
          const radius = Math.min(blockItem.width, blockItem.height) / 2;
          ctx.beginPath();
          ctx.arc(
            blockItem.position.x + radius,
            blockItem.position.y + radius,
            radius,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(
            blockItem.position.x,
            blockItem.position.y,
            blockItem.width,
            blockItem.height
          );
          ctx.strokeRect(
            blockItem.position.x,
            blockItem.position.y,
            blockItem.width,
            blockItem.height
          );
        }
        break;
      }
    }

    ctx.restore();
  }, []);

  // Render the canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw field
    drawField(ctx);

    // Draw all items
    canvasState.items.forEach(item => {
      drawItem(ctx, item);
    });
  }, [canvasState.items, drawField, drawItem]);

  // Render when state changes
  useEffect(() => {
    render();
  }, [render]);

  // Get mouse position relative to canvas
  const getMousePosition = useCallback((event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  // Find item at position
  const findItemAtPosition = useCallback((position: Point): CanvasItemUnion | null => {
    // Search in reverse order (top items first)
    for (let i = canvasState.items.length - 1; i >= 0; i--) {
      const item = canvasState.items[i];
      if (!item) continue;
      
      switch (item.type) {
        case 'player': {
          const distance = Math.sqrt(
            Math.pow(position.x - item.position.x, 2) +
            Math.pow(position.y - item.position.y, 2)
          );
          if (distance <= 15) return item;
          break;
        }
        case 'ball': {
          const distance = Math.sqrt(
            Math.pow(position.x - item.position.x, 2) +
            Math.pow(position.y - item.position.y, 2)
          );
          if (distance <= 8) return item;
          break;
        }
        case 'text': {
          const textItem = item as TextItem;
          const fontSize = textItem.fontSize || 16;
          const textWidth = textItem.text.length * fontSize * 0.6; // Approximate text width
          
          if (
            position.x >= textItem.position.x &&
            position.x <= textItem.position.x + textWidth &&
            position.y >= textItem.position.y &&
            position.y <= textItem.position.y + fontSize
          ) {
            return item;
          }
          break;
        }
        case 'block': {
          const blockItem = item as BlockItem;
          if (blockItem.shape === 'circle') {
            const centerX = blockItem.position.x + blockItem.width / 2;
            const centerY = blockItem.position.y + blockItem.height / 2;
            const radius = Math.min(blockItem.width, blockItem.height) / 2;
            const distance = Math.sqrt(
              Math.pow(position.x - centerX, 2) +
              Math.pow(position.y - centerY, 2)
            );
            if (distance <= radius) return item;
          } else {
            if (
              position.x >= blockItem.position.x &&
              position.x <= blockItem.position.x + blockItem.width &&
              position.y >= blockItem.position.y &&
              position.y <= blockItem.position.y + blockItem.height
            ) {
              return item;
            }
          }
          break;
        }
        case 'arrow': {
          // Simplified arrow hit detection - check if near the line
          const arrowItem = item as ArrowItem;
          const start = arrowItem.position;
          const end = arrowItem.endPosition;
          
          // Use point-to-line distance formula
          const A = position.x - start.x;
          const B = position.y - start.y;
          const C = end.x - start.x;
          const D = end.y - start.y;
          
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          
          if (lenSq === 0) {
            // Start and end are the same point
            const distance = Math.sqrt(A * A + B * B);
            if (distance <= 5) return item;
          } else {
            const param = dot / lenSq;
            let nearestX, nearestY;
            
            if (param < 0) {
              nearestX = start.x;
              nearestY = start.y;
            } else if (param > 1) {
              nearestX = end.x;
              nearestY = end.y;
            } else {
              nearestX = start.x + param * C;
              nearestY = start.y + param * D;
            }
            
            const distance = Math.sqrt(
              Math.pow(position.x - nearestX, 2) +
              Math.pow(position.y - nearestY, 2)
            );
            
            if (distance <= 5) return item;
          }
          break;
        }
      }
    }
    return null;
  }, [canvasState.items]);

  // Create new item based on selected tool
  const createItem = useCallback((position: Point): CanvasItemUnion | null => {
    if (readonly) return null;

    const baseItem = {
      id: generateId(),
      position,
      color: selectedColor,
      selected: false,
    };

    switch (selectedTool) {
      case 'player':
        // Find next player number
        const playerNumbers = canvasState.items
          .filter(item => item.type === 'player')
          .map(item => (item as PlayerItem).number || 0);
        const nextNumber = playerNumbers.length > 0 ? Math.max(...playerNumbers) + 1 : 1;
        
        return {
          ...baseItem,
          type: 'player',
          number: nextNumber,
          teamColor: '#000000',
        } as PlayerItem;

      case 'ball':
        return {
          ...baseItem,
          type: 'ball',
        } as BallItem;

      case 'text':
        return {
          ...baseItem,
          type: 'text',
          text: 'Texto',
          fontSize: 16,
          fontFamily: 'Arial',
        } as TextItem;

      case 'block':
        return {
          ...baseItem,
          type: 'block',
          width: 40,
          height: 40,
          shape: 'rectangle',
        } as BlockItem;

      default:
        return null;
    }
  }, [readonly, generateId, selectedColor, selectedTool, canvasState.items]);

  // Handle mouse down
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    const position = getMousePosition(event);
    const clickedItem = findItemAtPosition(position);

    if (selectedTool === 'select') {
      if (clickedItem) {
        // Start dragging
        setCanvasState(prev => ({
          ...prev,
          dragState: {
            isDragging: true,
            draggedItemId: clickedItem.id,
            startPosition: position,
            offset: {
              x: position.x - clickedItem.position.x,
              y: position.y - clickedItem.position.y,
            },
          },
          selectedItems: [clickedItem.id],
          items: prev.items.map(item => ({
            ...item,
            selected: item.id === clickedItem.id,
          })),
        }));
      } else {
        // Deselect all
        setCanvasState(prev => ({
          ...prev,
          selectedItems: [],
          items: prev.items.map(item => ({ ...item, selected: false })),
        }));
      }
    } else if (selectedTool === 'arrow') {
      // Start drawing arrow
      setCanvasState(prev => ({
        ...prev,
        isDrawing: true,
      }));
    } else {
      // Create new item
      const newItem = createItem(position);
      if (newItem) {
        setCanvasState(prev => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
      }
    }
  }, [readonly, selectedTool, getMousePosition, findItemAtPosition, createItem]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    const position = getMousePosition(event);

    if (canvasState.dragState.isDragging && canvasState.dragState.draggedItemId) {
      // Update dragged item position
      const { draggedItemId, offset } = canvasState.dragState;
      if (!offset) return;

      setCanvasState(prev => ({
        ...prev,
        items: prev.items.map(item => {
          if (item.id === draggedItemId) {
            return {
              ...item,
              position: {
                x: position.x - offset.x,
                y: position.y - offset.y,
              },
            };
          }
          return item;
        }),
      }));
    }
  }, [readonly, getMousePosition, canvasState.dragState]);

  // Handle mouse up
  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    const position = getMousePosition(event);

    if (selectedTool === 'arrow' && canvasState.isDrawing) {
      // Finish drawing arrow - for simplicity, create a basic arrow
      const newArrow: ArrowItem = {
        id: generateId(),
        type: 'arrow',
        position: { x: position.x - 50, y: position.y },
        endPosition: position,
        color: selectedColor,
        thickness: 3,
        selected: false,
      };

      setCanvasState(prev => ({
        ...prev,
        items: [...prev.items, newArrow],
        isDrawing: false,
      }));
    }

    // Stop dragging
    setCanvasState(prev => ({
      ...prev,
      dragState: {
        isDragging: false,
        draggedItemId: null,
        startPosition: null,
        offset: null,
      },
    }));
  }, [readonly, selectedTool, canvasState.isDrawing, getMousePosition, generateId, selectedColor]);

  // Update parent component when data changes
  useEffect(() => {
    if (!onDataChange || readonly) return;

    const newData: PranchetaData = {
      id: data?.id || generateId(),
      items: canvasState.items,
      fieldDimensions: {
        width: config.width,
        height: config.height,
      },
      backgroundColor: config.fieldColor,
      createdAt: data?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onDataChange(newData);
  }, [canvasState.items, onDataChange, readonly, data, generateId, config]);

  // Delete selected items
  const deleteSelectedItems = useCallback(() => {
    if (readonly) return;

    setCanvasState(prev => ({
      ...prev,
      items: prev.items.filter(item => !item.selected),
      selectedItems: [],
    }));
  }, [readonly]);

  // Clear all items
  const clearCanvas = useCallback(() => {
    if (readonly) return;

    setCanvasState(prev => ({
      ...prev,
      items: [],
      selectedItems: [],
    }));
  }, [readonly]);

  // Expose methods via a ref callback approach
  const canvasMethodsRef = useRef({
    deleteSelected: deleteSelectedItems,
    clearAll: clearCanvas,
  });

  // Update ref when methods change
  useEffect(() => {
    canvasMethodsRef.current = {
      deleteSelected: deleteSelectedItems,
      clearAll: clearCanvas,
    };
  }, [deleteSelectedItems, clearCanvas]);

  return (
    <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        className="block cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: `${config.width}px`,
          maxHeight: `${config.height}px`,
        }}
      />
      
      {!readonly && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={deleteSelectedItems}
            disabled={canvasState.selectedItems.length === 0}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
            title="Deletar selecionados"
          >
            Del
          </button>
          <button
            onClick={clearCanvas}
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
            title="Limpar tudo"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';