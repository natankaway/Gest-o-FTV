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
  FreeDrawItem,
  DrawingPath,
} from '@/types/canvas';
import { DEFAULT_CANVAS_CONFIG } from '@/types/canvas';

interface CanvasProps {
  data?: PranchetaData | undefined;
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
    currentDrawingPath: null,
    arrowStartPosition: null,
  });

  // State for text editing
  const [textEditor, setTextEditor] = useState({
    isEditing: false,
    selectedTextId: null as string | null,
    inputPosition: { x: 0, y: 0 },
    inputValue: '',
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

  // Draw futevolei court background and lines
  const drawField = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height, sandColor, courtLineColor, netColor, lineWidth, netHeight, netWidth } = config;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw sand background
    ctx.fillStyle = sandColor;
    ctx.fillRect(0, 0, width, height);

    // Set court line style
    ctx.strokeStyle = courtLineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    // Draw court borders (blue lines)
    ctx.strokeRect(lineWidth / 2, lineWidth / 2, width - lineWidth, height - lineWidth);

    // Draw center line (dividing the court)
    ctx.beginPath();
    ctx.moveTo(lineWidth, height / 2);
    ctx.lineTo(width - lineWidth, height / 2);
    ctx.stroke();

    // Draw net in the center
    ctx.strokeStyle = netColor;
    ctx.lineWidth = netWidth;
    
    // Vertical net post on the left
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - netHeight / 2);
    ctx.lineTo(0, height / 2 + netHeight / 2);
    ctx.stroke();
    
    // Vertical net post on the right
    ctx.beginPath();
    ctx.moveTo(width, height / 2 - netHeight / 2);
    ctx.lineTo(width, height / 2 + netHeight / 2);
    ctx.stroke();
    
    // Net mesh (simplified pattern)
    ctx.strokeStyle = netColor;
    ctx.lineWidth = 1;
    const meshSpacing = 10;
    
    // Horizontal net lines
    for (let y = height / 2 - netHeight / 2; y <= height / 2 + netHeight / 2; y += meshSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical net lines
    for (let x = 0; x <= width; x += meshSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, height / 2 - netHeight / 2);
      ctx.lineTo(x, height / 2 + netHeight / 2);
      ctx.stroke();
    }

    // Draw service areas (optional - small marks)
    ctx.strokeStyle = courtLineColor;
    ctx.lineWidth = 2;
    
    // Service line marks (small lines at 1/4 and 3/4 of court height)
    const serviceLineLength = 20;
    
    // Top court service area
    ctx.beginPath();
    ctx.moveTo(width / 2 - serviceLineLength / 2, height / 4);
    ctx.lineTo(width / 2 + serviceLineLength / 2, height / 4);
    ctx.stroke();
    
    // Bottom court service area
    ctx.beginPath();
    ctx.moveTo(width / 2 - serviceLineLength / 2, (3 * height) / 4);
    ctx.lineTo(width / 2 + serviceLineLength / 2, (3 * height) / 4);
    ctx.stroke();
  }, [config]);

  // Draw a single canvas item with comprehensive validation
  const drawItem = useCallback((ctx: CanvasRenderingContext2D, item: CanvasItemUnion) => {
    // Comprehensive validation to prevent rendering bugs
    if (!item || typeof item !== 'object') {
      console.warn('Invalid item passed to drawItem:', item);
      return;
    }

    // Validate required properties
    if (!item.id || !item.type || !item.position) {
      console.warn('Item missing required properties:', item);
      return;
    }

    // Validate position coordinates
    if (typeof item.position.x !== 'number' || typeof item.position.y !== 'number') {
      console.warn('Invalid position coordinates:', item.position);
      return;
    }

    // Validate color
    const itemColor = item.color || '#000000';

    ctx.save();

    try {
      // Apply selection highlight
      if (item.selected) {
        ctx.shadowColor = '#3B82F6';
        ctx.shadowBlur = 8;
      }

      switch (item.type) {
        case 'player': {
          const playerItem = item as PlayerItem;
          
          // Set colors based on team with fallback
          const teamColors = {
            red: { bg: '#EF4444', border: '#DC2626', text: '#FFFFFF' },
            blue: { bg: '#3B82F6', border: '#2563EB', text: '#FFFFFF' },
          };
          
          const teamColor = playerItem.teamColor || 'red';
          const colors = teamColors[teamColor] || teamColors.red;
          
          ctx.fillStyle = colors.bg;
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 3;

          // Draw player circle
          ctx.beginPath();
          ctx.arc(playerItem.position.x, playerItem.position.y, 18, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Draw player number if available
          if (playerItem.number && typeof playerItem.number === 'number') {
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 14px Arial';
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
          ctx.fillStyle = itemColor;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;

          // Draw ball
          ctx.beginPath();
          ctx.arc(ballItem.position.x, ballItem.position.y, 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Draw ball pattern (volleyball stripes)
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Vertical line
          ctx.moveTo(ballItem.position.x, ballItem.position.y - 8);
          ctx.lineTo(ballItem.position.x, ballItem.position.y + 8);
          // Horizontal line
          ctx.moveTo(ballItem.position.x - 8, ballItem.position.y);
          ctx.lineTo(ballItem.position.x + 8, ballItem.position.y);
          ctx.stroke();
          break;
        }

        case 'arrow':
        case 'curved-arrow': {
          const arrowItem = item as ArrowItem;
          
          // Validate arrow has end position
          if (!arrowItem.endPosition || 
              typeof arrowItem.endPosition.x !== 'number' || 
              typeof arrowItem.endPosition.y !== 'number') {
            console.warn('Arrow item missing valid endPosition:', arrowItem);
            break;
          }

          ctx.strokeStyle = itemColor;
          ctx.fillStyle = itemColor;
          ctx.lineWidth = arrowItem.thickness || 3;

          const start = arrowItem.position;
          const end = arrowItem.endPosition;

          if (item.type === 'curved-arrow') {
            // Draw curved arrow
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const curveAmount = arrowItem.curveAmount || 50;
            
            // Calculate perpendicular offset for curve
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
              const unitX = dx / length;
              const unitY = dy / length;
              const perpX = -unitY * curveAmount;
              const perpY = unitX * curveAmount;
              
              const controlX = midX + perpX;
              const controlY = midY + perpY;

              ctx.beginPath();
              ctx.moveTo(start.x, start.y);
              ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
              ctx.stroke();
            }
          } else {
            // Draw straight arrow line
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }

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
          
          // Validate text properties
          const text = textItem.text || 'Texto';
          const fontSize = textItem.fontSize || 16;
          const fontFamily = textItem.fontFamily || 'Arial';
          
          ctx.fillStyle = itemColor;
          ctx.font = `${fontSize}px ${fontFamily}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(text, textItem.position.x, textItem.position.y);
          break;
        }

        case 'block':
        case 'circle':
        case 'triangle': {
          const blockItem = item as BlockItem;
          
          // Validate block dimensions
          const width = blockItem.width || 40;
          const height = blockItem.height || 40;
          
          ctx.fillStyle = itemColor;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;

          if (item.type === 'circle' || blockItem.shape === 'circle') {
            const radius = Math.min(width, height) / 2;
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
          } else if (item.type === 'triangle' || blockItem.shape === 'triangle') {
            const centerX = blockItem.position.x + width / 2;
            const topY = blockItem.position.y;
            const bottomY = blockItem.position.y + height;
            const leftX = blockItem.position.x;
            const rightX = blockItem.position.x + width;
            
            ctx.beginPath();
            ctx.moveTo(centerX, topY);
            ctx.lineTo(leftX, bottomY);
            ctx.lineTo(rightX, bottomY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // Rectangle
            ctx.fillRect(
              blockItem.position.x,
              blockItem.position.y,
              width,
              height
            );
            ctx.strokeRect(
              blockItem.position.x,
              blockItem.position.y,
              width,
              height
            );
          }
          break;
        }

        case 'free-draw': {
          const freeDrawItem = item as FreeDrawItem;
          
          // Validate free draw paths
          if (!freeDrawItem.paths || !Array.isArray(freeDrawItem.paths)) {
            console.warn('Free draw item missing valid paths:', freeDrawItem);
            break;
          }

          freeDrawItem.paths.forEach((path: DrawingPath) => {
            if (!path || !Array.isArray(path.points) || path.points.length < 2) {
              return;
            }

            ctx.strokeStyle = path.color || itemColor;
            ctx.lineWidth = path.thickness || 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            const firstPoint = path.points[0];
            if (firstPoint) {
              ctx.moveTo(firstPoint.x, firstPoint.y);
              
              for (let i = 1; i < path.points.length; i++) {
                const point = path.points[i];
                if (point && typeof point.x === 'number' && typeof point.y === 'number') {
                  ctx.lineTo(point.x, point.y);
                }
              }
              
              ctx.stroke();
            }
          });
          break;
        }

        default:
          console.warn('Unknown item type:', (item as any).type);
      }
    } catch (error) {
      console.error('Error rendering canvas item:', error, item);
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

  // Get position from mouse or touch event with precise calculation
  const getMousePosition = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      // Touch event
      if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0]?.clientX || 0;
        clientY = event.touches[0]?.clientY || 0;
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0]?.clientX || 0;
        clientY = event.changedTouches[0]?.clientY || 0;
      } else {
        return { x: 0, y: 0 };
      }
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
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
      case 'player': {
        // Find next player number
        const playerNumbers = canvasState.items
          .filter(item => item.type === 'player')
          .map(item => (item as PlayerItem).number || 0);
        const nextNumber = playerNumbers.length > 0 ? Math.max(...playerNumbers) + 1 : 1;
        
        // Alternate team colors
        const teamColor = playerNumbers.length % 2 === 0 ? 'red' : 'blue';
        
        return {
          ...baseItem,
          type: 'player',
          number: nextNumber,
          teamColor: teamColor,
        } as PlayerItem;
      }

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

      case 'circle':
        return {
          ...baseItem,
          type: 'circle',
          width: 40,
          height: 40,
          shape: 'circle',
        } as BlockItem;

      case 'triangle':
        return {
          ...baseItem,
          type: 'triangle',
          width: 40,
          height: 40,
          shape: 'triangle',
        } as BlockItem;

      default:
        return null;
    }
  }, [readonly, generateId, selectedColor, selectedTool, canvasState.items]);

  // Handle mouse/touch down with improved tool flow
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    event.preventDefault(); // Prevent default touch behaviors
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
    } else if (selectedTool === 'free-draw') {
      // Start free drawing
      const newPath: DrawingPath = {
        id: generateId(),
        points: [position],
        color: selectedColor,
        thickness: 3,
        timestamp: Date.now(),
      };

      setCanvasState(prev => ({
        ...prev,
        isDrawing: true,
        currentDrawingPath: newPath,
      }));
    } else if (selectedTool === 'arrow' || selectedTool === 'curved-arrow') {
      // Start drawing arrow
      setCanvasState(prev => ({
        ...prev,
        isDrawing: true,
        arrowStartPosition: position,
      }));
    } else if (selectedTool === 'text') {
      // For text tool, create text item immediately at click position
      const newTextItem: TextItem = {
        id: generateId(),
        type: 'text',
        position,
        color: selectedColor,
        text: 'Texto',
        fontSize: 16,
        fontFamily: 'Arial',
        selected: false,
      };

      setCanvasState(prev => ({
        ...prev,
        items: [...prev.items, newTextItem],
      }));

      // Immediately enable text editing
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        
        setTextEditor({
          isEditing: true,
          selectedTextId: newTextItem.id,
          inputPosition: {
            x: rect.left + (position.x * rect.width) / config.width,
            y: rect.top + (position.y * rect.height) / config.height,
          },
          inputValue: 'Texto',
        });
      }
    } else {
      // Create other types of items
      const newItem = createItem(position);
      if (newItem) {
        setCanvasState(prev => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
      }
    }
  }, [readonly, selectedTool, getMousePosition, findItemAtPosition, generateId, selectedColor, config.width, config.height, createItem]);

  // Handle mouse/touch move with free drawing support
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    event.preventDefault(); // Prevent default touch behaviors
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
    } else if (selectedTool === 'free-draw' && canvasState.isDrawing && canvasState.currentDrawingPath) {
      // Add point to current drawing path
      const updatedPath = {
        ...canvasState.currentDrawingPath,
        points: [...canvasState.currentDrawingPath.points, position],
      };

      setCanvasState(prev => ({
        ...prev,
        currentDrawingPath: updatedPath,
      }));

      // Real-time drawing update
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && canvasState.currentDrawingPath.points.length > 1) {
          const path = updatedPath;
          const prevPoint = path.points[path.points.length - 2];
          
          if (prevPoint) {
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.thickness;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(position.x, position.y);
            ctx.stroke();
          }
        }
      }
    }
  }, [readonly, getMousePosition, canvasState.dragState, canvasState.isDrawing, canvasState.currentDrawingPath, selectedTool]);

  // Handle mouse/touch up with complete tool support
  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    event.preventDefault(); // Prevent default touch behaviors
    const position = getMousePosition(event);

    if (selectedTool === 'free-draw' && canvasState.isDrawing && canvasState.currentDrawingPath) {
      // Finish free drawing - create free draw item
      if (canvasState.currentDrawingPath.points.length > 1) {
        const firstPoint = canvasState.currentDrawingPath.points[0];
        if (firstPoint) {
          const newFreeDrawItem: FreeDrawItem = {
            id: generateId(),
            type: 'free-draw',
            position: firstPoint, // First point as position
            color: canvasState.currentDrawingPath.color,
            thickness: canvasState.currentDrawingPath.thickness,
            paths: [canvasState.currentDrawingPath],
            selected: false,
          };

          setCanvasState(prev => ({
            ...prev,
            items: [...prev.items, newFreeDrawItem],
            isDrawing: false,
            currentDrawingPath: null,
          }));
        } else {
          // Not enough valid points, just stop drawing
          setCanvasState(prev => ({
            ...prev,
            isDrawing: false,
            currentDrawingPath: null,
          }));
        }
      } else {
        // Not enough points, just stop drawing
        setCanvasState(prev => ({
          ...prev,
          isDrawing: false,
          currentDrawingPath: null,
        }));
      }
    } else if (selectedTool === 'arrow' && canvasState.isDrawing && canvasState.arrowStartPosition) {
      // Finish drawing straight arrow
      const newArrow: ArrowItem = {
        id: generateId(),
        type: 'arrow',
        position: canvasState.arrowStartPosition,
        endPosition: position,
        color: selectedColor,
        thickness: 3,
        selected: false,
      };

      setCanvasState(prev => ({
        ...prev,
        items: [...prev.items, newArrow],
        isDrawing: false,
        arrowStartPosition: null,
      }));
    } else if (selectedTool === 'curved-arrow' && canvasState.isDrawing && canvasState.arrowStartPosition) {
      // Finish drawing curved arrow
      const newArrow: ArrowItem = {
        id: generateId(),
        type: 'curved-arrow',
        position: canvasState.arrowStartPosition,
        endPosition: position,
        color: selectedColor,
        thickness: 3,
        curveAmount: 30, // Default curve amount
        selected: false,
      };

      setCanvasState(prev => ({
        ...prev,
        items: [...prev.items, newArrow],
        isDrawing: false,
        arrowStartPosition: null,
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
  }, [readonly, selectedTool, canvasState.isDrawing, canvasState.currentDrawingPath, canvasState.arrowStartPosition, getMousePosition, generateId, selectedColor]);

  // Handle double click for text editing
  const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readonly) return;

    const position = getMousePosition(event);
    const clickedItem = findItemAtPosition(position);

    if (clickedItem && clickedItem.type === 'text') {
      const textItem = clickedItem as TextItem;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      
      setTextEditor({
        isEditing: true,
        selectedTextId: textItem.id,
        inputPosition: {
          x: rect.left + (textItem.position.x * rect.width) / config.width,
          y: rect.top + (textItem.position.y * rect.height) / config.height,
        },
        inputValue: textItem.text,
      });
    }
  }, [readonly, getMousePosition, findItemAtPosition, config.width, config.height]);

  // Handle text input change
  const handleTextInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTextEditor(prev => ({
      ...prev,
      inputValue: event.target.value,
    }));
  }, []);

  // Handle text input submit
  const handleTextInputSubmit = useCallback(() => {
    if (!textEditor.selectedTextId || !textEditor.isEditing) return;

    setCanvasState(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === textEditor.selectedTextId && item.type === 'text') {
          return {
            ...item,
            text: textEditor.inputValue || 'Texto',
          } as TextItem;
        }
        return item;
      }),
    }));

    setTextEditor({
      isEditing: false,
      selectedTextId: null,
      inputPosition: { x: 0, y: 0 },
      inputValue: '',
    });
  }, [textEditor]);

  // Handle text input key press
  const handleTextInputKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTextInputSubmit();
    } else if (event.key === 'Escape') {
      setTextEditor({
        isEditing: false,
        selectedTextId: null,
        inputPosition: { x: 0, y: 0 },
        inputValue: '',
      });
    }
  }, [handleTextInputSubmit]);

  // Update parent component when data changes
  useEffect(() => {
    if (!onDataChange || readonly || !canvasState.items) return;

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

    // Only call onDataChange if the items actually changed
    const itemsChanged = !data?.items || 
      JSON.stringify(data.items) !== JSON.stringify(canvasState.items);
    
    if (itemsChanged) {
      onDataChange(newData);
    }
  }, [canvasState.items]); // Only depend on items to avoid infinite loops

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
        className="block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          aspectRatio: `${config.width}/${config.height}`, // Maintain correct aspect ratio
          cursor: selectedTool === 'select' ? 'default' : 
                  selectedTool === 'text' ? 'text' : 
                  selectedTool === 'free-draw' ? 'crosshair' : 'crosshair',
          touchAction: 'none', // Prevent scrolling during touch drawing
        }}
      />
      
      {/* Text editing input */}
      {textEditor.isEditing && (
        <input
          type="text"
          value={textEditor.inputValue}
          onChange={handleTextInputChange}
          onKeyDown={handleTextInputKeyPress}
          onBlur={handleTextInputSubmit}
          autoFocus
          className="absolute z-10 px-2 py-1 text-sm border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg"
          style={{
            left: textEditor.inputPosition.x,
            top: textEditor.inputPosition.y,
            minWidth: '100px',
          }}
        />
      )}
      
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