/**
 * Keep Watch · Pixel Canvas Core
 *
 * Native canvas: 480x270 (web 16:9). Auto-fit uses integer-only scaling
 * to preserve pixel perfection. User-overridden manual scale supports
 * 0.5 increments for finer control; the displayed CSS pixel size is
 * rounded to integer pixels to avoid sub-pixel artifacts.
 */

export const NATIVE_WIDTH = 480;
export const NATIVE_HEIGHT = 270;

export interface PixelCanvas {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

/** Largest integer scale that fits the viewport. */
export function calcIntegerScale(viewportW: number, viewportH: number): number {
  const scaleX = Math.floor(viewportW / NATIVE_WIDTH);
  const scaleY = Math.floor(viewportH / NATIVE_HEIGHT);
  return Math.max(1, Math.min(scaleX, scaleY));
}

export function setupPixelCanvas(canvas: HTMLCanvasElement): PixelCanvas {
  canvas.width = NATIVE_WIDTH;
  canvas.height = NATIVE_HEIGHT;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Failed to get 2D context');
  ctx.imageSmoothingEnabled = false;
  return { ctx, width: NATIVE_WIDTH, height: NATIVE_HEIGHT };
}

/**
 * Resize the displayed canvas. If manualScale is provided, allow half-step
 * fractional scaling for finer control. Otherwise auto-fit to integer.
 * Returns the actual scale applied.
 */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  manualScale?: number
): number {
  let scale: number;
  if (manualScale && manualScale > 0) {
    const maxAuto = calcIntegerScale(window.innerWidth, window.innerHeight);
    // Allow up to 3x the auto-fit max for users who want to zoom in hard.
    scale = Math.max(0.25, Math.min(manualScale, maxAuto * 3));
  } else {
    scale = calcIntegerScale(window.innerWidth, window.innerHeight);
  }
  // Round CSS pixel dimensions to integers so the canvas doesn't render
  // at sub-pixel boundaries (which causes blurring).
  canvas.style.width = `${Math.round(NATIVE_WIDTH * scale)}px`;
  canvas.style.height = `${Math.round(NATIVE_HEIGHT * scale)}px`;
  return scale;
}
