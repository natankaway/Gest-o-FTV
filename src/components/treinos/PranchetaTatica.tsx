import React, { useRef, useState, useCallback, useEffect, memo } from 'react';
import type { CanvasItemUnion, ToolType, Point, TextItem, PlayerItem, ArrowItem } from '@/types/canvas';
import { Button } from '@/components/common';
import { 
  Trash, Users, User, Circle, MousePointer2 as Select, Type as TextTool, Square as Block, Eraser,
  ArrowRight, Undo2, Redo2, Bold, Italic, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

// --- MODAL DE EDIÇÃO DE TEXTO AVANÇADO ---
const TextEditorModal = ({ item, onSave, onCancel }: { item: TextItem, onSave: (newItem: TextItem) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<TextItem>>({
        text: item.text,
        color: item.color || '#000000',
        fontSize: item.fontSize || 16,
        bold: item.bold || false,
        italic: item.italic || false,
        fontFamily: item.fontFamily || 'Arial',
        alignment: item.alignment || 'center',
        backgroundColor: item.backgroundColor || undefined,
        opacity: item.opacity === undefined ? 1 : item.opacity,
    });

    const handleSave = () => {
        onSave({ ...item, ...formData } as TextItem);
    };

    const fontFamilies = ['Arial', 'Verdana', 'Impact', 'Georgia', 'Courier New'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Editor de Texto Avançado</h3>
                <div className="space-y-4">
                    <textarea
                        value={formData.text}
                        onChange={(e) => setFormData(p => ({ ...p, text: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <select value={formData.fontFamily} onChange={e => setFormData(p => ({...p, fontFamily: e.target.value}))} className="w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                            {fontFamilies.map(font => <option key={font} value={font}>{font}</option>)}
                        </select>
                        <input type="number" value={formData.fontSize} onChange={e => setFormData(p => ({...p, fontSize: parseInt(e.target.value, 10)}))} className="w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600" />
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <button onClick={() => setFormData(p => ({...p, bold: !p.bold}))} className={`p-2 rounded ${formData.bold ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><Bold size={16}/></button>
                           <button onClick={() => setFormData(p => ({...p, italic: !p.italic}))} className={`p-2 rounded ${formData.italic ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><Italic size={16}/></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setFormData(p => ({...p, alignment: 'left'}))} className={`p-2 rounded ${formData.alignment === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><AlignLeft size={16}/></button>
                            <button onClick={() => setFormData(p => ({...p, alignment: 'center'}))} className={`p-2 rounded ${formData.alignment === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><AlignCenter size={16}/></button>
                            <button onClick={() => setFormData(p => ({...p, alignment: 'right'}))} className={`p-2 rounded ${formData.alignment === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><AlignRight size={16}/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm">Cor do Texto</label>
                            <input type="color" value={formData.color} onChange={e => setFormData(p => ({...p, color: e.target.value}))} className="w-full h-10 p-1 border rounded-lg bg-white dark:bg-gray-700"/>
                        </div>
                         <div>
                            <label className="text-sm">Cor do Fundo</label>
                            <input type="color" value={formData.backgroundColor} onChange={e => setFormData(p => ({...p, backgroundColor: e.target.value}))} className="w-full h-10 p-1 border rounded-lg bg-white dark:bg-gray-700"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm">Opacidade ({Math.round((formData.opacity || 1) * 100)}%)</label>
                        <input type="range" min="0.1" max="1" step="0.1" value={formData.opacity} onChange={e => setFormData(p => ({...p, opacity: parseFloat(e.target.value)}))} className="w-full"/>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DA PRANCHETA ---
interface PranchetaTaticaProps {
  pranchetaItems: CanvasItemUnion[];
  onPranchetaChange: (items: CanvasItemUnion[]) => void;
}

export const PranchetaTatica: React.FC<PranchetaTaticaProps> = memo(({ pranchetaItems, onPranchetaChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<ToolType>('select');
  const [selectedItem, setSelectedItem] = useState<CanvasItemUnion | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingTextItem, setEditingTextItem] = useState<TextItem | null>(null);
  const [arrowStartPoint, setArrowStartPoint] = useState<Point | null>(null);
  const [history, setHistory] = useState<CanvasItemUnion[][]>([pranchetaItems]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const tools: { id: ToolType; icon: React.ElementType; name: string }[] = [
    { id: 'select', icon: Select, name: 'Mover' }, { id: 'arrow', icon: ArrowRight, name: 'Seta' },
    { id: 'player-blue', icon: User, name: 'Time Azul' }, { id: 'player-red', icon: Users, name: 'Time Vermelho' },
    { id: 'ball', icon: Circle, name: 'Bola' }, { id: 'block', icon: Block, name: 'Cone' },
    { id: 'text', icon: TextTool, name: 'Texto' },
  ];
  
  const updateItems = useCallback((newItems: CanvasItemUnion[], fromHistory = false) => {
    onPranchetaChange(newItems);
    if (!fromHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newItems]);
      setHistoryIndex(newHistory.length);
    }
  }, [history, historyIndex, onPranchetaChange]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onPranchetaChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onPranchetaChange(history[newIndex]);
    }
  };

  const drawCourt = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    ctx.fillStyle = '#E8B563';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1e40af';
    const margin = 50;
    ctx.strokeRect(margin, margin, canvas.width - (margin * 2), canvas.height - (margin * 2));
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height / 2);
    ctx.lineTo(canvas.width - margin, canvas.height / 2);
    ctx.stroke();
  }, []);
  
  const drawItemOnCanvas = useCallback((ctx: CanvasRenderingContext2D, item: CanvasItemUnion) => {
    const drawPlayer = (item: PlayerItem, color: string) => {
        const radius = (item.width || 36) / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(item.position.x, item.position.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        if (item.number) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${radius * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(item.number), item.position.x, item.position.y);
        }
    };
    const drawBall = (item: BallItem) => {
        const radius = (item.width || 20) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(item.position.x, item.position.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    };
    const drawBlock = (item: BlockItem) => {
        const width = item.width || 30;
        const height = item.height || 30;
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(item.position.x - width / 2, item.position.y + height / 2);
        ctx.lineTo(item.position.x + width / 2, item.position.y + height / 2);
        ctx.lineTo(item.position.x, item.position.y - height / 2);
        ctx.closePath();
        ctx.fill();
    };
    const drawText = (item: TextItem) => {
        const { position, text, color, fontSize, bold, italic, fontFamily, alignment, backgroundColor, opacity } = item;
        ctx.save();
        ctx.globalAlpha = opacity || 1;
        
        const style = italic ? 'italic' : 'normal';
        const weight = bold ? 'bold' : 'normal';
        const size = fontSize || item.height || 16;
        const font = `${style} ${weight} ${size}px ${fontFamily || 'Arial'}`;
        ctx.font = font;
        
        const textWidth = ctx.measureText(text).width;
        
        if (backgroundColor && backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(position.x - (textWidth / 2) - 4, position.y - (size / 2) - 4, textWidth + 8, size + 8);
        }

        ctx.textAlign = alignment || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color || '#000000';
        ctx.fillText(text, position.x, position.y);
        ctx.restore();
    };
    const drawArrow = (item: ArrowItem) => {
        const { position, endPosition, color } = item;
        ctx.strokeStyle = color || '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        ctx.lineTo(endPosition.x, endPosition.y);
        ctx.stroke();
        
        const angle = Math.atan2(endPosition.y - position.y, endPosition.x - position.x);
        const headlen = 15;
        ctx.beginPath();
        ctx.moveTo(endPosition.x, endPosition.y);
        ctx.lineTo(endPosition.x - headlen * Math.cos(angle - Math.PI / 6), endPosition.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(endPosition.x, endPosition.y);
        ctx.lineTo(endPosition.x - headlen * Math.cos(angle + Math.PI / 6), endPosition.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

    switch (item.type) {
        case 'player-blue': drawPlayer(item, '#3b82f6'); break;
        case 'player-red': drawPlayer(item, '#ef4444'); break;
        case 'ball': drawBall(item); break;
        case 'block': drawBlock(item); break;
        case 'text': drawText(item); break;
        case 'arrow': drawArrow(item); break;
    }
  }, []);

  const getResizeHandles = (item: CanvasItemUnion) => {
      const width = item.width || 40;
      const height = item.height || 40;
      const x = item.position.x;
      const y = item.position.y;
      
      const handleSize = 8;
      const halfSize = handleSize / 2;

      return {
          nw: { x: x - width / 2 - halfSize, y: y - height / 2 - halfSize, width: handleSize, height: handleSize },
          ne: { x: x + width / 2 - halfSize, y: y - height / 2 - halfSize, width: handleSize, height: handleSize },
          sw: { x: x - width / 2 - halfSize, y: y + height / 2 - halfSize, width: handleSize, height: handleSize },
          se: { x: x + width / 2 - halfSize, y: y + height / 2 - halfSize, width: handleSize, height: handleSize },
      };
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawCourt(ctx);
    
    pranchetaItems.forEach(item => {
      drawItemOnCanvas(ctx, item);
      if (selectedItem && selectedItem.id === item.id) {
        const width = item.width || 40;
        const height = item.height || 40;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(item.position.x - width / 2, item.position.y - height / 2, width, height);
        ctx.setLineDash([]);
        
        const handles = getResizeHandles(item);
        ctx.fillStyle = '#10b981';
        Object.values(handles).forEach(handle => {
            ctx.fillRect(handle.x, handle.y, handle.width, handle.height);
        });
      }
    });
  }, [drawCourt, drawItemOnCanvas, pranchetaItems, selectedItem]);

  useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const findItemAtPosition = (x: number, y: number): CanvasItemUnion | null => {
    for (let i = pranchetaItems.length - 1; i >= 0; i--) {
        const item = pranchetaItems[i];
        if(!item) continue;
        const width = item.width || 40;
        const height = item.height || 40;
        if(x >= item.position.x - width/2 && x <= item.position.x + width/2 &&
           y >= item.position.y - height/2 && y <= item.position.y + height/2) {
            return item;
        }
    }
    return null;
  };
  
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e);
      const clickedItem = findItemAtPosition(pos.x, pos.y);
      if (clickedItem?.type === 'text') {
          setEditingTextItem(clickedItem as TextItem);
      } else if (clickedItem?.type === 'player-blue' || clickedItem?.type === 'player-red') {
          const newNumber = prompt("Número do jogador:", String((clickedItem as PlayerItem).number || ''));
          if (newNumber !== null) {
              const updatedItems = pranchetaItems.map(item => 
                  item.id === clickedItem.id ? { ...item, number: parseInt(newNumber, 10) || undefined } : item
              );
              updateItems(updatedItems);
          }
      }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (tool === 'select' && selectedItem) {
        const handles = getResizeHandles(selectedItem);
        for (const [key, handle] of Object.entries(handles)) {
            if (pos.x >= handle.x && pos.x <= handle.x + handle.width &&
                pos.y >= handle.y && pos.y <= handle.y + handle.height) {
                setIsResizing(true);
                setResizeHandle(key);
                return;
            }
        }
    }

    const clickedItem = findItemAtPosition(pos.x, pos.y);
    if (tool === 'text' && clickedItem?.type === 'text') {
        setEditingTextItem(clickedItem);
        return;
    }
    
    if (tool === 'select' && clickedItem) {
        setSelectedItem(clickedItem);
        setIsDragging(true);
        setDragOffset({ x: pos.x - clickedItem.position.x, y: pos.y - clickedItem.position.y });
        return;
    }
    if(tool === 'select') {
        setSelectedItem(null);
        return;
    }

    // Lógica para criar novos itens
    let newItem: CanvasItemUnion | null = null;
    const baseItem = { id: String(Date.now()), position: pos, color: '' };
    
    switch (tool) {
        case 'player-blue': case 'player-red':
            newItem = { ...baseItem, type: tool, width: 36, height: 36 }; break;
        case 'ball':
            newItem = { ...baseItem, type: tool, width: 20, height: 20 }; break;
        case 'block':
            newItem = { ...baseItem, type: tool, width: 30, height: 30 }; break;
        case 'text':
            newItem = { ...baseItem, type: 'text', text: "Novo Texto", fontSize: 16, width: 80, height: 20 } as TextItem;
            setEditingTextItem(newItem);
            break;
        case 'arrow':
            setArrowStartPoint(pos); return;
    }
    
    if (newItem) updateItems([...pranchetaItems, newItem]);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (isResizing && selectedItem) {
        const { x, y } = selectedItem.position;
        let newWidth = selectedItem.width || 40;
        let newHeight = selectedItem.height || 40;
        
        if (resizeHandle?.includes('e')) newWidth = Math.max(10, Math.abs(pos.x - x) * 2);
        if (resizeHandle?.includes('w')) newWidth = Math.max(10, Math.abs(x - pos.x) * 2);
        if (resizeHandle?.includes('s')) newHeight = Math.max(10, Math.abs(pos.y - y) * 2);
        if (resizeHandle?.includes('n')) newHeight = Math.max(10, Math.abs(y - pos.y) * 2);

        const updatedItems = pranchetaItems.map(item =>
            item.id === selectedItem.id ? { ...item, width: newWidth, height: newHeight, fontSize: selectedItem.type === 'text' ? newHeight : item.fontSize } : item
        );
        onPranchetaChange(updatedItems);
        setSelectedItem(prev => prev ? { ...prev, width: newWidth, height: newHeight } as CanvasItemUnion : null);
        return;
    }

    if (isDragging && selectedItem) {
        const newX = pos.x - dragOffset.x;
        const newY = pos.y - dragOffset.y;
        const updatedItems = pranchetaItems.map(item =>
            item.id === selectedItem.id ? { ...item, position: { x: newX, y: newY } } : item
        );
        onPranchetaChange(updatedItems);
        setSelectedItem(prev => prev ? { ...prev, position: { x: newX, y: newY } } : null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging || isResizing) {
        updateItems(pranchetaItems);
    }
    if (tool === 'arrow' && arrowStartPoint) {
        const pos = getMousePos(e);
        const newItem: ArrowItem = { id: String(Date.now()), type: 'arrow', position: arrowStartPoint, endPosition: pos, color: '#ef4444' };
        updateItems([...pranchetaItems, newItem]);
        setArrowStartPoint(null);
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const removeSelectedItem = () => {
    if (selectedItem) {
        updateItems(pranchetaItems.filter(item => item.id !== selectedItem.id));
        setSelectedItem(null);
    }
  };

  const clearCanvas = () => {
    if (window.confirm("Limpar todo o desenho?")) {
        updateItems([]);
        setSelectedItem(null);
    }
  };
  
  const handleSaveText = (updatedItem: TextItem) => {
      updateItems(pranchetaItems.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditingTextItem(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Prancheta Tática</h3>
        <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleUndo} disabled={historyIndex === 0}><Undo2 size={16}/></Button>
            <Button variant="secondary" size="sm" onClick={handleRedo} disabled={historyIndex === history.length - 1}><Redo2 size={16}/></Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {tools.map(toolData => (
          <button
            key={toolData.id}
            onClick={() => setTool(toolData.id)}
            className={`p-3 rounded-lg transition-colors border-2 ${tool === toolData.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-blue-400'}`}
            title={toolData.name}
          >
            <div className="flex flex-col items-center gap-1"><toolData.icon size={20} /><span className="text-xs font-medium">{toolData.name}</span></div>
          </button>
        ))}
      </div>
      
      {selectedItem && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-800/30 rounded-lg border border-green-200 dark:border-green-700 flex justify-between items-center">
            <p className="text-sm text-green-800 dark:text-green-300">Item selecionado: <strong>{selectedItem.type}</strong></p>
            <button onClick={removeSelectedItem} className="p-1 text-red-500 hover:text-red-700"><Trash size={16} /></button>
        </div>
      )}
      
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={500}
          height={700}
          className={`w-full h-auto block ${tool === 'select' ? 'cursor-move' : 'cursor-crosshair'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        />
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button onClick={clearCanvas} variant="danger" leftIcon={<Eraser size={16} />}>Limpar</Button>
      </div>

      {editingTextItem && (
          <TextEditorModal 
              item={editingTextItem}
              onSave={handleSaveText}
              onCancel={() => setEditingTextItem(null)}
          />
      )}
    </div>
  );
});

PranchetaTatica.displayName = 'PranchetaTatica';