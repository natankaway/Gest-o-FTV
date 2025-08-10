// Canvas coordinate conversion utilities
// Handles precise coordinate transformation considering DPR, zoom, and pan

import type { Point } from '@/types/canvas';

export interface ViewState {
  scale: number;
  pan: Point;
  dpr?: number;
}

export interface CanvasInfo {
  element: HTMLCanvasElement;
  rect: DOMRect;
  actualWidth: number;
  actualHeight: number;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
}

/**
 * Get comprehensive canvas information for coordinate conversion
 */
export function getCanvasInfo(canvas: HTMLCanvasElement): CanvasInfo {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  
  return {
    element: canvas,
    rect,
    actualWidth: canvas.width,
    actualHeight: canvas.height,
    cssWidth: rect.width,
    cssHeight: rect.height,
    dpr
  };
}

/**
 * Convert client coordinates (mouse/touch) to canvas coordinates
 * Accounts for:
 * - Canvas CSS vs actual dimensions
 * - Device pixel ratio (high DPI displays)
 * - Zoom/scale transformations
 * - Pan offset
 */
export function getCanvasPoint(
  event: MouseEvent | React.MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
  view: ViewState = { scale: 1, pan: { x: 0, y: 0 } }
): Point {
  const canvasInfo = getCanvasInfo(canvas);
  
  // Get client coordinates from event
  let clientX: number, clientY: number;
  
  if ('clientX' in event) {
    // Mouse event
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    // Touch event
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    if (!touch) return { x: 0, y: 0 };
    clientX = touch.clientX;
    clientY = touch.clientY;
  }
  
  // Convert client coordinates to canvas CSS coordinates
  const cssX = clientX - canvasInfo.rect.left;
  const cssY = clientY - canvasInfo.rect.top;
  
  // Convert CSS coordinates to actual canvas coordinates
  const scaleX = canvasInfo.actualWidth / canvasInfo.cssWidth;
  const scaleY = canvasInfo.actualHeight / canvasInfo.cssHeight;
  
  const canvasX = cssX * scaleX;
  const canvasY = cssY * scaleY;
  
  // Apply zoom/scale and pan transformations
  const worldX = (canvasX - view.pan.x) / view.scale;
  const worldY = (canvasY - view.pan.y) / view.scale;
  
  return {
    x: Math.round(worldX),
    y: Math.round(worldY)
  };
}

/**
 * Convert canvas coordinates back to screen coordinates
 * Useful for positioning UI elements relative to canvas items
 */
export function canvasToScreen(
  canvasPoint: Point,
  canvas: HTMLCanvasElement,
  view: ViewState = { scale: 1, pan: { x: 0, y: 0 } }
): Point {
  const canvasInfo = getCanvasInfo(canvas);
  
  // Apply zoom/scale and pan transformations
  const canvasX = canvasPoint.x * view.scale + view.pan.x;
  const canvasY = canvasPoint.y * view.scale + view.pan.y;
  
  // Convert actual canvas coordinates to CSS coordinates
  const scaleX = canvasInfo.cssWidth / canvasInfo.actualWidth;
  const scaleY = canvasInfo.cssHeight / canvasInfo.actualHeight;
  
  const cssX = canvasX * scaleX;
  const cssY = canvasY * scaleY;
  
  // Convert to screen coordinates
  const screenX = cssX + canvasInfo.rect.left;
  const screenY = cssY + canvasInfo.rect.top;
  
  return {
    x: Math.round(screenX),
    y: Math.round(screenY)
  };
}

/**
 * Check if a point is within canvas bounds
 */
export function isPointInCanvas(point: Point, canvas: HTMLCanvasElement): boolean {
  return point.x >= 0 && 
         point.y >= 0 && 
         point.x <= canvas.width && 
         point.y <= canvas.height;
}

/**
 * Clamp a point to canvas bounds
 */
export function clampToCanvas(point: Point, canvas: HTMLCanvasElement): Point {
  return {
    x: Math.max(0, Math.min(canvas.width, point.x)),
    y: Math.max(0, Math.min(canvas.height, point.y))
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is near a line segment within tolerance
 */
export function isPointNearLine(
  point: Point, 
  lineStart: Point, 
  lineEnd: Point, 
  tolerance: number = 5
): boolean {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    // Line start and end are the same point
    return distance(point, lineStart) <= tolerance;
  }
  
  const param = Math.max(0, Math.min(1, dot / lenSq));
  const nearestX = lineStart.x + param * C;
  const nearestY = lineStart.y + param * D;
  
  return distance(point, { x: nearestX, y: nearestY }) <= tolerance;
}

/**
 * Get optimal canvas size for device pixel ratio
 */
export function getOptimalCanvasSize(
  cssWidth: number, 
  cssHeight: number, 
  maxPixels: number = 2048
): { width: number; height: number; scale: number } {
  const dpr = window.devicePixelRatio || 1;
  
  let width = cssWidth * dpr;
  let height = cssHeight * dpr;
  
  // Limit total pixels to prevent performance issues
  const totalPixels = width * height;
  if (totalPixels > maxPixels * maxPixels) {
    const scale = Math.sqrt((maxPixels * maxPixels) / totalPixels);
    width *= scale;
    height *= scale;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
    scale: width / cssWidth
  };
}