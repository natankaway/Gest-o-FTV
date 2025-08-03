import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  CanvasItemUnion,
  CanvasState,
  CanvasConfig,
  CanvasTool,
  CanvasMouseEvent,
  PranchetaData,
  PlayerItem,
  BallItem,
  ArrowItem,
  TextItem,
  BlockItem,
  FIELD_DIMENSIONS,
  DEFAULT_CANVAS_CONFIG,
} from '@/types/canvas';

interface CanvasProps {
  pranchetaData?: PranchetaData;
  currentTool: CanvasTool;
  currentColor: string;
  config?: Partial<CanvasConfig>;
  onChange?: (data: PranchetaData) => void;
  readOnly?: boolean;
  className?: string;
}

interface CanvasRef {
  exportAsImage: () => string;
  clearCanvas: () => void;
  selectAll: () => void;
  deleteSelected: () => void;
  undo: () => void;
  redo: () => void;
}

const Canvas = React.forwardRef<CanvasRef, CanvasProps>(({
  pranchetaData,
  currentTool,
  currentColor,
  config: configProp,
  onChange,
  readOnly = false,
  className = '',
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    items: pranchetaData?.items || [],
    selectedItems: [],
    currentTool,
    currentColor,
    isDrawing: false,
    dragState: {
      isDragging: false,
      itemId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    },
    arrowState: {
      isDrawingArrow: false,
      startX: 0,
      startY: 0,
    },
  });

  const [history, setHistory] = useState<CanvasItemUnion[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Merge config with defaults
  const config = useMemo(() => ({
    ...DEFAULT_CANVAS_CONFIG,
    ...configProp,
  }), [configProp]);

  // Update canvas state when props change
  useEffect(() => {
    setCanvasState(prev => ({
      ...prev,
      items: pranchetaData?.items || [],
      currentTool,
      currentColor,
    }));
  }, [pranchetaData?.items, currentTool, currentColor]);

  // Add to history for undo/redo
  const addToHistory = useCallback((items: CanvasItemUnion[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...items]);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): CanvasMouseEvent => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, clientX: e.clientX, clientY: e.clientY, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, type: 'click' };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      clientX: e.clientX,
      clientY: e.clientY,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      type: 'click',
    };
  }, []);

  // Find item at coordinates
  const findItemAtPoint = useCallback((x: number, y: number): CanvasItemUnion | null => {
    for (let i = canvasState.items.length - 1; i >= 0; i--) {
      const item = canvasState.items[i];
      if (!item) continue;
      
      switch (item.type) {
        case 'player1':
        case 'player2': {
          const playerItem = item as PlayerItem;
          const size = playerItem.size || 20;
          const distance = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2));
          if (distance <= size / 2) return item;
          break;
        }
        case 'ball': {
          const ballItem = item as BallItem;
          const size = ballItem.size || 16;
          const distance = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2));
          if (distance <= size / 2) return item;
          break;
        }
        case 'arrow': {
          const arrowItem = item as ArrowItem;
          // Simple line hit detection
          const A = { x: arrowItem.fromX, y: arrowItem.fromY };
          const B = { x: arrowItem.toX, y: arrowItem.toY };
          const P = { x, y };
          
          const distance = Math.abs((B.y - A.y) * P.x - (B.x - A.x) * P.y + B.x * A.y - B.y * A.x) / 
                          Math.sqrt(Math.pow(B.y - A.y, 2) + Math.pow(B.x - A.x, 2));
          
          if (distance <= 5) return item;
          break;
        }
        case 'text': {
          const textItem = item as TextItem;
          const fontSize = textItem.fontSize || 16;
          const textWidth = textItem.text.length * fontSize * 0.6; // Approximate text width
          
          if (x >= item.x && x <= item.x + textWidth && 
              y >= item.y - fontSize && y <= item.y) {
            return item;
          }
          break;
        }
        case 'block': {
          const blockItem = item as BlockItem;
          if (x >= item.x && x <= item.x + blockItem.width &&
              y >= item.y && y <= item.y + blockItem.height) {
            return item;
          }
          break;
        }
      }
    }
    return null;
  }, [canvasState.items]);

  // Create new item
  const createItem = useCallback((type: CanvasTool, x: number, y: number): CanvasItemUnion | null => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    switch (type) {
      case 'player1':
      case 'player2':
        return {
          id,
          type,
          x,
          y,
          color: currentColor,
          number: canvasState.items.filter(item => item.type === type).length + 1,
          size: 20,
        } as PlayerItem;
      
      case 'ball':
        return {
          id,
          type: 'ball',
          x,
          y,
          color: currentColor,
          size: 16,
        } as BallItem;
      
      case 'text':
        return {
          id,
          type: 'text',
          x,
          y,
          color: currentColor,
          text: 'Texto',
          fontSize: 16,
          fontWeight: 'normal',
        } as TextItem;
      
      case 'block':
        return {
          id,
          type: 'block',
          x,
          y,
          color: currentColor,
          width: 40,
          height: 40,
          shape: 'rectangle',
        } as BlockItem;
      
      default:
        return null;
    }
  }, [currentColor, canvasState.items]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const coords = getCanvasCoordinates(e);
    const clickedItem = findItemAtPoint(coords.x, coords.y);

    switch (currentTool) {
      case 'select':
        if (clickedItem) {
          if (!coords.ctrlKey) {
            setCanvasState(prev => ({ ...prev, selectedItems: [clickedItem.id] }));
          } else {
            setCanvasState(prev => ({
              ...prev,
              selectedItems: prev.selectedItems.includes(clickedItem.id)
                ? prev.selectedItems.filter(id => id !== clickedItem.id)
                : [...prev.selectedItems, clickedItem.id]
            }));
          }
          
          // Start dragging
          setCanvasState(prev => ({
            ...prev,
            dragState: {
              isDragging: true,
              itemId: clickedItem.id,
              startX: coords.x,
              startY: coords.y,
              offsetX: coords.x - clickedItem.x,
              offsetY: coords.y - clickedItem.y,
            }
          }));
        } else if (!coords.ctrlKey) {
          setCanvasState(prev => ({ ...prev, selectedItems: [] }));
        }
        break;

      case 'arrow':
        setCanvasState(prev => ({
          ...prev,
          arrowState: {
            isDrawingArrow: true,
            startX: coords.x,
            startY: coords.y,
          }
        }));
        break;

      case 'erase':
        if (clickedItem) {
          addToHistory(canvasState.items);
          setCanvasState(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== clickedItem.id),
            selectedItems: prev.selectedItems.filter(id => id !== clickedItem.id),
          }));
          triggerChange();
        }
        break;

      case 'player1':
      case 'player2':
      case 'ball':
      case 'text':
      case 'block':
        if (!clickedItem) {
          const newItem = createItem(currentTool, coords.x, coords.y);
          if (newItem) {
            addToHistory(canvasState.items);
            setCanvasState(prev => ({
              ...prev,
              items: [...prev.items, newItem],
              selectedItems: [newItem.id],
            }));
            triggerChange();
          }
        }
        break;
    }
  }, [readOnly, currentTool, getCanvasCoordinates, findItemAtPoint, createItem, addToHistory, canvasState.items]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const coords = getCanvasCoordinates(e);

    // Handle dragging
    if (canvasState.dragState.isDragging && canvasState.dragState.itemId) {
      const newX = coords.x - canvasState.dragState.offsetX;
      const newY = coords.y - canvasState.dragState.offsetY;

      setCanvasState(prev => ({
        ...prev,
        items: prev.items.map(item => {
          if (prev.selectedItems.includes(item.id)) {
            const deltaX = newX - (item.id === prev.dragState.itemId ? item.x : item.x);
            const deltaY = newY - (item.id === prev.dragState.itemId ? item.y : item.y);
            
            return {
              ...item,
              x: item.id === prev.dragState.itemId ? newX : item.x + deltaX,
              y: item.id === prev.dragState.itemId ? newY : item.y + deltaY,
            };
          }
          return item;
        }),
      }));
    }
  }, [readOnly, getCanvasCoordinates, canvasState.dragState]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const coords = getCanvasCoordinates(e);

    // Handle arrow completion
    if (canvasState.arrowState.isDrawingArrow) {
      const arrowItem: ArrowItem = {
        id: `arrow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'arrow',
        x: canvasState.arrowState.startX,
        y: canvasState.arrowState.startY,
        fromX: canvasState.arrowState.startX,
        fromY: canvasState.arrowState.startY,
        toX: coords.x,
        toY: coords.y,
        color: currentColor,
        thickness: 3,
        style: 'solid',
      };

      addToHistory(canvasState.items);
      setCanvasState(prev => ({
        ...prev,
        items: [...prev.items, arrowItem],
        selectedItems: [arrowItem.id],
        arrowState: {
          isDrawingArrow: false,
          startX: 0,
          startY: 0,
        }
      }));
      triggerChange();
    }

    // End dragging
    if (canvasState.dragState.isDragging) {
      addToHistory(canvasState.items);
      setCanvasState(prev => ({
        ...prev,
        dragState: {
          isDragging: false,
          itemId: null,
          startX: 0,
          startY: 0,
          offsetX: 0,
          offsetY: 0,
        }
      }));
      triggerChange();
    }
  }, [readOnly, getCanvasCoordinates, canvasState.arrowState, canvasState.dragState, currentColor, addToHistory, canvasState.items]);

  // Trigger onChange callback
  const triggerChange = useCallback(() => {
    if (onChange) {
      const newData: PranchetaData = {
        ...pranchetaData,
        items: canvasState.items,
        updatedAt: new Date().toISOString(),
      };
      onChange(newData);
    }
  }, [onChange, pranchetaData, canvasState.items]);

  // Drawing functions
  const drawField = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height, centerLineY, centerCircleRadius } = FIELD_DIMENSIONS;
    
    // Field background
    ctx.fillStyle = config.fieldColor;
    ctx.fillRect(0, 0, width, height);

    // Field lines
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = 2;

    // Border
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Center line
    ctx.beginPath();
    ctx.moveTo(0, centerLineY);
    ctx.lineTo(width, centerLineY);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(width / 2, centerLineY, centerCircleRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Net posts (small rectangles at center line ends)
    ctx.fillStyle = config.lineColor;
    ctx.fillRect(0, centerLineY - 5, 10, 10);
    ctx.fillRect(width - 10, centerLineY - 5, 10, 10);
  }, [config.fieldColor, config.lineColor]);

  const drawItem = useCallback((ctx: CanvasRenderingContext2D, item: CanvasItemUnion) => {
    const isSelected = canvasState.selectedItems.includes(item.id);
    
    // Draw selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      
      switch (item.type) {
        case 'player1':
        case 'player2': {
          const playerItem = item as PlayerItem;
          const size = (playerItem.size || 20) + 6;
          ctx.beginPath();
          ctx.arc(item.x, item.y, size / 2, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        }
        case 'ball': {
          const ballItem = item as BallItem;
          const size = (ballItem.size || 16) + 6;
          ctx.beginPath();
          ctx.arc(item.x, item.y, size / 2, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        }
        case 'block': {
          const blockItem = item as BlockItem;
          ctx.strokeRect(item.x - 3, item.y - 3, blockItem.width + 6, blockItem.height + 6);
          break;
        }
        case 'text': {
          const textItem = item as TextItem;
          const fontSize = textItem.fontSize || 16;
          const textWidth = textItem.text.length * fontSize * 0.6;
          ctx.strokeRect(item.x - 3, item.y - fontSize - 3, textWidth + 6, fontSize + 6);
          break;
        }
      }
      ctx.setLineDash([]);
    }

    // Draw the item
    ctx.fillStyle = item.color || currentColor;
    ctx.strokeStyle = item.color || currentColor;
    ctx.lineWidth = 2;

    switch (item.type) {
      case 'player1':
      case 'player2': {
        const playerItem = item as PlayerItem;
        const size = playerItem.size || 20;
        
        // Player circle
        ctx.beginPath();
        ctx.arc(item.x, item.y, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Player number
        if (playerItem.number) {
          ctx.fillStyle = item.type === 'player1' ? '#ffffff' : '#000000';
          ctx.font = `bold ${size * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(playerItem.number.toString(), item.x, item.y);
        }
        break;
      }
      
      case 'ball': {
        const ballItem = item as BallItem;
        const size = ballItem.size || 16;
        
        ctx.beginPath();
        ctx.arc(item.x, item.y, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ball pattern
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(item.x, item.y, size / 3, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      }
      
      case 'arrow': {
        const arrowItem = item as ArrowItem;
        const thickness = arrowItem.thickness || 3;
        
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(arrowItem.fromX, arrowItem.fromY);
        ctx.lineTo(arrowItem.toX, arrowItem.toY);
        ctx.stroke();
        
        // Arrowhead
        const angle = Math.atan2(arrowItem.toY - arrowItem.fromY, arrowItem.toX - arrowItem.fromX);
        const headLength = 15;
        
        ctx.beginPath();
        ctx.moveTo(arrowItem.toX, arrowItem.toY);
        ctx.lineTo(
          arrowItem.toX - headLength * Math.cos(angle - Math.PI / 6),
          arrowItem.toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(arrowItem.toX, arrowItem.toY);
        ctx.lineTo(
          arrowItem.toX - headLength * Math.cos(angle + Math.PI / 6),
          arrowItem.toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
      }
      
      case 'text': {
        const textItem = item as TextItem;
        const fontSize = textItem.fontSize || 16;
        
        ctx.fillStyle = item.color || currentColor;
        ctx.font = `${textItem.fontWeight || 'normal'} ${fontSize}px ${textItem.fontFamily || 'Arial'}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(textItem.text, item.x, item.y);
        break;
      }
      
      case 'block': {
        const blockItem = item as BlockItem;
        
        if (blockItem.shape === 'circle') {
          const radius = Math.min(blockItem.width, blockItem.height) / 2;
          ctx.beginPath();
          ctx.arc(item.x + radius, item.y + radius, radius, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(item.x, item.y, blockItem.width, blockItem.height);
        }
        break;
      }
    }
  }, [canvasState.selectedItems, currentColor]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw field
    drawField(ctx);

    // Draw items
    canvasState.items.forEach(item => drawItem(ctx, item));

    // Draw arrow preview if drawing
    if (canvasState.arrowState.isDrawingArrow) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(canvasState.arrowState.startX, canvasState.arrowState.startY);
      ctx.lineTo(canvasState.arrowState.startX, canvasState.arrowState.startY); // Will be updated by mouse move
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [canvasState, currentColor, drawField, drawItem]);

  // Render on state changes
  useEffect(() => {
    render();
  }, [render]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    exportAsImage: () => {
      return canvasRef.current?.toDataURL() || '';
    },
    clearCanvas: () => {
      addToHistory(canvasState.items);
      setCanvasState(prev => ({ ...prev, items: [], selectedItems: [] }));
      triggerChange();
    },
    selectAll: () => {
      setCanvasState(prev => ({
        ...prev,
        selectedItems: prev.items.map(item => item.id)
      }));
    },
    deleteSelected: () => {
      if (canvasState.selectedItems.length > 0) {
        addToHistory(canvasState.items);
        setCanvasState(prev => ({
          ...prev,
          items: prev.items.filter(item => !prev.selectedItems.includes(item.id)),
          selectedItems: [],
        }));
        triggerChange();
      }
    },
    undo: () => {
      if (historyIndex > 0 && history.length > 0) {
        const newIndex = historyIndex - 1;
        const historicalState = history[newIndex];
        if (historicalState) {
          setCanvasState(prev => ({ ...prev, items: historicalState }));
          setHistoryIndex(newIndex);
          triggerChange();
        }
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1 && history.length > 0) {
        const newIndex = historyIndex + 1;
        const historicalState = history[newIndex];
        if (historicalState) {
          setCanvasState(prev => ({ ...prev, items: historicalState }));
          setHistoryIndex(newIndex);
          triggerChange();
        }
      }
    },
  }), [canvasState, history, historyIndex, addToHistory, triggerChange]);

  return (
    <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        className="block w-full h-auto cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          cursor: currentTool === 'select' ? 'default' : 'crosshair',
        }}
      />
    </div>
  );
});

Canvas.displayName = 'Canvas';

export type { CanvasRef };
export { Canvas };