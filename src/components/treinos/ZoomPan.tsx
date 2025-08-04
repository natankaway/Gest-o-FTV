import React, { memo, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/common';

interface ZoomPanControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPanReset: () => void;
  onFitToScreen: () => void;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  disabled?: boolean;
}

export const ZoomPanControls: React.FC<ZoomPanControlsProps> = memo(({
  zoom,
  onZoomChange,
  onPanReset,
  onFitToScreen,
  minZoom = 0.1,
  maxZoom = 5,
  zoomStep = 0.1,
  disabled = false
}) => {
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + zoomStep, maxZoom);
    onZoomChange(newZoom);
  }, [zoom, zoomStep, maxZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - zoomStep, minZoom);
    onZoomChange(newZoom);
  }, [zoom, zoomStep, minZoom, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    onZoomChange(1);
    onPanReset();
  }, [onZoomChange, onPanReset]);

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
      {/* Zoom Out */}
      <Button
        size="sm"
        variant="secondary"
        onClick={handleZoomOut}
        disabled={disabled || zoom <= minZoom}
        title="Diminuir zoom"
      >
        <ZoomOut size={16} />
      </Button>

      {/* Zoom Level Display */}
      <div className="flex items-center justify-center min-w-[60px] px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded border">
        {zoomPercentage}%
      </div>

      {/* Zoom In */}
      <Button
        size="sm"
        variant="secondary"
        onClick={handleZoomIn}
        disabled={disabled || zoom >= maxZoom}
        title="Aumentar zoom"
      >
        <ZoomIn size={16} />
      </Button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

      {/* Fit to Screen */}
      <Button
        size="sm"
        variant="secondary"
        onClick={onFitToScreen}
        disabled={disabled}
        title="Ajustar à tela"
      >
        <Maximize size={16} />
      </Button>

      {/* Reset */}
      <Button
        size="sm"
        variant="secondary"
        onClick={handleZoomReset}
        disabled={disabled}
        title="Resetar visualização"
      >
        <RotateCcw size={16} />
      </Button>
    </div>
  );
});

ZoomPanControls.displayName = 'ZoomPanControls';

export interface ZoomPanState {
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
}

export const useZoomPan = (
  initialZoom: number = 1,
  initialPan: { x: number; y: number } = { x: 0, y: 0 }
) => {
  const [state, setState] = React.useState<ZoomPanState>({
    zoom: initialZoom,
    pan: initialPan,
    isDragging: false,
    dragStart: null,
  });

  const handleZoomChange = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom }));
  }, []);

  const handlePanChange = useCallback((pan: { x: number; y: number }) => {
    setState(prev => ({ ...prev, pan }));
  }, []);

  const handlePanReset = useCallback(() => {
    setState(prev => ({ ...prev, pan: { x: 0, y: 0 } }));
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      // Middle mouse button or Shift+Left click for panning
      event.preventDefault();
      setState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: { x: event.clientX, y: event.clientY },
      }));
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (state.isDragging && state.dragStart) {
      const deltaX = event.clientX - state.dragStart.x;
      const deltaY = event.clientY - state.dragStart.y;
      
      setState(prev => ({
        ...prev,
        pan: {
          x: prev.pan.x + deltaX,
          y: prev.pan.y + deltaY,
        },
        dragStart: { x: event.clientX, y: event.clientY },
      }));
    }
  }, [state.isDragging, state.dragStart]);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null,
    }));
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.ctrlKey) {
      // Zoom with Ctrl+Wheel
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5, state.zoom + delta));
      setState(prev => ({ ...prev, zoom: newZoom }));
    }
  }, [state.zoom]);

  const getTransformStyle = useCallback((): React.CSSProperties => {
    return {
      transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`,
      transformOrigin: 'center center',
      transition: state.isDragging ? 'none' : 'transform 0.1s ease-out',
    };
  }, [state.zoom, state.pan, state.isDragging]);

  return {
    zoom: state.zoom,
    pan: state.pan,
    isDragging: state.isDragging,
    handleZoomChange,
    handlePanChange,
    handlePanReset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    getTransformStyle,
  };
};