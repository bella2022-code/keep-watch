/**
 * Fish Tank Scene · Placeholder
 *
 * Two render modes:
 *   - drawFishTankSilhouette: solid black outline shapes on dark background
 *     (used during the Goldfish reveal cinematic before color fills in)
 *   - drawFishTank: full colored scene
 */

import { COLORS } from '../core/colors';
import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../core/canvas';

const WATER_TOP = 30;
const SAND_Y = 240;

/** Draws the tank in pure silhouette (black on dark). */
export function drawFishTankSilhouette(
  ctx: CanvasRenderingContext2D,
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  // Background: pure black canvas (already filled by caller)
  ctx.fillStyle = '#15161E';
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

  // Tank rectangle outline
  ctx.fillStyle = COLORS.black;
  // Top edge (slightly recessed for "water level")
  ctx.fillRect(20, WATER_TOP - 2, NATIVE_WIDTH - 40, 2);
  // Sides
  ctx.fillRect(20, WATER_TOP - 2, 2, SAND_Y + 12 - WATER_TOP);
  ctx.fillRect(NATIVE_WIDTH - 22, WATER_TOP - 2, 2, SAND_Y + 12 - WATER_TOP);
  // Bottom
  ctx.fillRect(20, SAND_Y + 8, NATIVE_WIDTH - 40, 2);

  // Two plant silhouettes
  drawPlantSilhouette(ctx, 70, SAND_Y);
  drawPlantSilhouette(ctx, 390, SAND_Y);

  // Sand mound silhouette
  ctx.fillRect(30, SAND_Y, NATIVE_WIDTH - 60, 8);
  ctx.restore();
}

function drawPlantSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number
) {
  ctx.fillStyle = COLORS.black;
  // Vertical wavy strip
  for (let dy = 0; dy < 50; dy++) {
    const wobble = Math.sin(dy * 0.3) * 2;
    ctx.fillRect(Math.round(x + wobble), baseY - dy, 3, 1);
  }
}

/** Draws the full colored Fish Tank scene. */
export function drawFishTank(ctx: CanvasRenderingContext2D, timeMs: number) {
  // Water (gradient blue-green)
  const grad = ctx.createLinearGradient(0, WATER_TOP, 0, SAND_Y);
  grad.addColorStop(0, '#7AAFBF');
  grad.addColorStop(1, '#3F6C7A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, WATER_TOP, NATIVE_WIDTH, SAND_Y - WATER_TOP);

  // Above water — air
  ctx.fillStyle = '#2A2128';
  ctx.fillRect(0, 0, NATIVE_WIDTH, WATER_TOP);

  // Tank glass border
  ctx.fillStyle = '#3A3438';
  ctx.fillRect(20, WATER_TOP - 2, NATIVE_WIDTH - 40, 2);
  ctx.fillRect(20, WATER_TOP - 2, 2, SAND_Y + 12 - WATER_TOP);
  ctx.fillRect(NATIVE_WIDTH - 22, WATER_TOP - 2, 2, SAND_Y + 12 - WATER_TOP);
  ctx.fillRect(20, SAND_Y + 8, NATIVE_WIDTH - 40, 2);

  // Water surface line (2px ripple)
  ctx.fillStyle = 'rgba(244, 239, 230, 0.4)';
  ctx.fillRect(22, WATER_TOP, NATIVE_WIDTH - 44, 1);
  ctx.fillRect(22, WATER_TOP + 1, NATIVE_WIDTH - 44, 1);

  // Sand
  ctx.fillStyle = '#C7AC7F';
  ctx.fillRect(22, SAND_Y, NATIVE_WIDTH - 44, 8);
  ctx.fillStyle = '#A88B5C';
  ctx.fillRect(22, SAND_Y, NATIVE_WIDTH - 44, 1);

  // Pebbles
  ctx.fillStyle = '#7A6447';
  ctx.fillRect(100, SAND_Y + 4, 5, 3);
  ctx.fillRect(280, SAND_Y + 3, 4, 4);
  ctx.fillRect(350, SAND_Y + 5, 6, 2);

  // Plants (animated sway)
  drawPlant(ctx, 70, SAND_Y, timeMs, 0);
  drawPlant(ctx, 390, SAND_Y, timeMs, 200);

  // Bubbles rising
  drawBubbles(ctx, timeMs);

  // Light shaft from upper-left
  const lightGrad = ctx.createLinearGradient(0, WATER_TOP, 200, SAND_Y);
  lightGrad.addColorStop(0, 'rgba(244, 239, 230, 0.12)');
  lightGrad.addColorStop(1, 'rgba(244, 239, 230, 0)');
  ctx.fillStyle = lightGrad;
  ctx.beginPath();
  ctx.moveTo(0, WATER_TOP);
  ctx.lineTo(100, WATER_TOP);
  ctx.lineTo(250, SAND_Y);
  ctx.lineTo(0, SAND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawPlant(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  timeMs: number,
  phaseOffset: number
) {
  ctx.fillStyle = COLORS.green;
  for (let dy = 0; dy < 50; dy++) {
    const wave = Math.sin((timeMs + phaseOffset) / 800 + dy * 0.3);
    const wobble = Math.round(wave * 2);
    ctx.fillRect(x + wobble, baseY - dy, 3, 1);
  }
  // Bright tips
  ctx.fillStyle = '#9FB987';
  ctx.fillRect(x + Math.round(Math.sin((timeMs + phaseOffset) / 800 + 15) * 2), baseY - 49, 3, 1);
}

function drawBubbles(ctx: CanvasRenderingContext2D, timeMs: number) {
  ctx.fillStyle = 'rgba(244, 239, 230, 0.5)';
  const positions = [
    { x: 110, baseOffset: 0 },
    { x: 280, baseOffset: 800 },
    { x: 350, baseOffset: 1600 },
  ];
  for (const p of positions) {
    const lifeMs = 2500;
    const phase = ((timeMs + p.baseOffset) % lifeMs) / lifeMs;
    const y = SAND_Y - phase * (SAND_Y - WATER_TOP);
    const size = phase > 0.8 ? 1 : 2;
    if (y > WATER_TOP) {
      ctx.fillRect(p.x, Math.round(y), size, size);
    }
  }
}

/** Draws a radial reveal mask — used to "fill in" the colored scene
 *  from the center outward during scene-fill phase. progress 0..1.
 *  Returns true if any reveal area is visible. */
export function drawFishTankRevealFill(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
  progress: number
) {
  // First draw silhouette
  drawFishTankSilhouette(ctx, 1);

  if (progress <= 0) return;

  // Then draw colored scene clipped to a growing circle
  const cx = NATIVE_WIDTH / 2;
  const cy = NATIVE_HEIGHT / 2;
  const maxR = Math.hypot(NATIVE_WIDTH, NATIVE_HEIGHT) / 2 + 20;
  const r = maxR * progress;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  drawFishTank(ctx, timeMs);
  ctx.restore();
}
