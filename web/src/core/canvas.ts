/**
 * Keep Watch · Pixel Canvas Core
 *
 * Provides a fixed native-resolution pixel canvas that scales to the viewport
 * using integer-only scale factors for crisp pixel-perfect rendering.
 *
 * Native canvas: 480x270 (web 16:9) — see docs/01-visual-system.md
 */

export const NATIVE_WIDTH = 480;
export const NATIVE_HEIGHT = 270;

export interface PixelCanvas {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}

/**
 * Calculates the largest integer scale factor that fits the canvas
 * within the viewport while preserving the 16:9 aspect ratio.
 */
export function calcIntegerScale(viewportW: number, viewportH: number): number {
  const scaleX = Math.floor(viewportW / NATIVE_WIDTH);
  const scaleY = Math.floor(viewportH / NATIVE_HEIGHT);
  return Math.max(1, Math.min(scaleX, scaleY));
}

/**
 * Configures a canvas element to render at native resolution
 * but display at an integer-scaled size via CSS transforms.
 *
 * The drawing buffer is always 480x270; we never anti-alias.
 */
export function setupPixelCanvas(canvas: HTMLCanvasElement): PixelCanvas {
  canvas.width = NATIVE_WIDTH;
  canvas.height = NATIVE_HEIGHT;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Failed to get 2D context');

  // Critical for pixel art: disable smoothing
  ctx.imageSmoothingEnabled = false;

  return { ctx, width: NATIVE_WIDTH, height: NATIVE_HEIGHT };
}

/**
 * Updates the canvas CSS size based on viewport, using integer scaling.
 */
export function resizeCanvas(canvas: HTMLCanvasElement) {
  const scale = calcIntegerScale(window.innerWidth, window.innerHeight);
  canvas.style.width = `${NATIVE_WIDTH * scale}px`;
  canvas.style.height = `${NATIVE_HEIGHT * scale}px`;
}
