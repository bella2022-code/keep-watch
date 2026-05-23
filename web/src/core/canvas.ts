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

/** The effective auto scale (integer fit × AUTO_BOOST). */
export function getAutoScale(): number {
  return calcIntegerScale(window.innerWidth, window.innerHeight) * 1.5;
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
 * Default "auto" scale multiplier. The naive max-integer-fit feels
 * cinematically small; 1.5x of that fills the viewport more naturally.
 * User can press − to shrink toward the strict integer fit if they want.
 */
const AUTO_BOOST = 1.5;

/**
 * Resize the displayed canvas. If manualScale is provided, allow fractional
 * scaling for finer control. Otherwise auto-fit applies AUTO_BOOST.
 * Returns the actual scale applied.
 */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  manualScale?: number
): number {
  let scale: number;
  if (manualScale && manualScale > 0) {
    const maxAuto = calcIntegerScale(window.innerWidth, window.innerHeight);
    scale = Math.max(0.25, Math.min(manualScale, maxAuto * 3));
  } else {
    scale = calcIntegerScale(window.innerWidth, window.innerHeight) * AUTO_BOOST;
  }
  canvas.style.width = `${Math.round(NATIVE_WIDTH * scale)}px`;
  canvas.style.height = `${Math.round(NATIVE_HEIGHT * scale)}px`;
  return scale;
}
