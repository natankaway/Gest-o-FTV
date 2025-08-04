import { Point, DrawingPath, FreeDrawItem } from '@/types/canvas';

export class DrawingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentPath: Point[] = [];
  private currentColor = '#000000';
  private currentThickness = 3;
  private smoothingEnabled = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    this.setupCanvas();
  }

  private setupCanvas() {
    // Enable smooth drawing
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
  }

  setColor(color: string) {
    this.currentColor = color;
  }

  setThickness(thickness: number) {
    this.currentThickness = thickness;
  }

  setSmoothingEnabled(enabled: boolean) {
    this.smoothingEnabled = enabled;
  }

  startDrawing(point: Point) {
    this.isDrawing = true;
    this.currentPath = [point];
    
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentThickness;
  }

  continueDrawing(point: Point) {
    if (!this.isDrawing) return;

    this.currentPath.push(point);

    if (this.smoothingEnabled && this.currentPath.length >= 3) {
      // Use quadratic curves for smoother lines
      const lastPoint = this.currentPath[this.currentPath.length - 2];
      const currentPoint = point;
      
      if (lastPoint) {
        // Calculate control point (midpoint between last and current)
        const controlPoint = {
          x: (lastPoint.x + currentPoint.x) / 2,
          y: (lastPoint.y + currentPoint.y) / 2
        };

        this.ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, controlPoint.x, controlPoint.y);
      }
    } else {
      // Fall back to straight lines
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.stroke();
  }

  finishDrawing(): DrawingPath | null {
    if (!this.isDrawing || this.currentPath.length === 0) return null;

    this.isDrawing = false;
    
    const path: DrawingPath = {
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      points: [...this.currentPath],
      color: this.currentColor,
      thickness: this.currentThickness,
      timestamp: Date.now()
    };

    this.currentPath = [];
    return path;
  }

  drawPath(path: DrawingPath) {
    if (path.points.length === 0) return;

    this.ctx.save();
    this.ctx.strokeStyle = path.color;
    this.ctx.lineWidth = path.thickness;
    this.ctx.beginPath();

    const points = path.points;
    const firstPoint = points[0];
    if (!firstPoint) return;
    
    this.ctx.moveTo(firstPoint.x, firstPoint.y);

    if (this.smoothingEnabled && points.length >= 3) {
      for (let i = 1; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        
        if (currentPoint && nextPoint) {
          const controlPoint = {
            x: (currentPoint.x + nextPoint.x) / 2,
            y: (currentPoint.y + nextPoint.y) / 2
          };
          this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlPoint.x, controlPoint.y);
        }
      }
      // Draw the last point
      const lastPoint = points[points.length - 1];
      if (lastPoint) {
        this.ctx.lineTo(lastPoint.x, lastPoint.y);
      }
    } else {
      // Draw straight lines
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          this.ctx.lineTo(point.x, point.y);
        }
      }
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  drawFreeDrawItem(item: FreeDrawItem) {
    item.paths.forEach(path => {
      this.drawPath(path);
    });
  }

  // Helper method to convert mouse/touch events to canvas coordinates
  getCanvasPoint(event: MouseEvent | TouchEvent, rect: DOMRect): Point {
    let clientX: number, clientY: number;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0];
      if (touch) {
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        return { x: 0, y: 0 };
      }
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  // Pressure-sensitive drawing for devices that support it
  drawWithPressure(point: Point, pressure: number = 1) {
    if (!this.isDrawing) return;

    const adjustedThickness = this.currentThickness * pressure;
    const previousLineWidth = this.ctx.lineWidth;
    
    this.ctx.lineWidth = adjustedThickness;
    this.continueDrawing(point);
    this.ctx.lineWidth = previousLineWidth;
  }

  // Utility method to simplify paths (reduce points while maintaining shape)
  simplifyPath(points: Point[], tolerance: number = 2): Point[] {
    if (points.length <= 2) return points;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (!firstPoint || !lastPoint) return points;

    const simplified: Point[] = [firstPoint];
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      
      if (prev && current && next) {
        // Calculate distance from current point to line between prev and next
        const distance = this.pointToLineDistance(current, prev, next);
        
        if (distance > tolerance) {
          simplified.push(current);
        }
      }
    }
    
    simplified.push(lastPoint);
    return simplified;
  }

  private pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const nearestX = lineStart.x + param * C;
    const nearestY = lineStart.y + param * D;
    
    const dx = point.x - nearestX;
    const dy = point.y - nearestY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Clear the entire canvas
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Get image data for saving/exporting
  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  // Set image data for loading
  setImageData(imageData: ImageData) {
    this.ctx.putImageData(imageData, 0, 0);
  }
}

// Utility functions for path operations
export const PathUtils = {
  // Calculate path bounds
  getPathBounds(points: Point[]): { x: number; y: number; width: number; height: number } {
    if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    const firstPoint = points[0];
    if (!firstPoint) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = firstPoint.x;
    let maxX = firstPoint.x;
    let minY = firstPoint.y;
    let maxY = firstPoint.y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  },

  // Check if a point is near a path
  isPointNearPath(point: Point, path: DrawingPath, tolerance: number = 5): boolean {
    for (let i = 0; i < path.points.length - 1; i++) {
      const start = path.points[i];
      const end = path.points[i + 1];
      
      if (start && end) {
        const distance = this.pointToLineSegmentDistance(point, start, end);
        if (distance <= tolerance) return true;
      }
    }
    return false;
  },

  pointToLineSegmentDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const nearestX = lineStart.x + param * C;
    const nearestY = lineStart.y + param * D;
    
    const dx = point.x - nearestX;
    const dy = point.y - nearestY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
};