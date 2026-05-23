/**
 * Mouse Cage Scene · Placeholder
 *
 * Includes a hamster wheel (left) and a food bowl (right) that companions
 * may occasionally stop at and use.
 */

import { COLORS } from '../core/colors';
import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../core/canvas';

const FLOOR_Y = 232;

/** Wheel screen position (center of wheel hub). */
export const WHEEL_X = 130;
export const WHEEL_HUB_Y = 218;
export const WHEEL_RADIUS = 14;

/** Food bowl screen position (center of bowl). */
export const BOWL_X = 360;
export const BOWL_Y = 230;

/** Returns a wheel angle for the running animation. */
function getWheelAngle(timeMs: number, spinning: boolean): number {
  if (!spinning) return 0;
  // Full rotation every 600ms when spinning
  return ((timeMs % 600) / 600) * Math.PI * 2;
}

export function drawMouseCage(ctx: CanvasRenderingContext2D) {
  // Wall
  ctx.fillStyle = '#6B4528';
  ctx.fillRect(0, 0, NATIVE_WIDTH, FLOOR_Y - 52);

  // Floor
  ctx.fillStyle = COLORS.wood;
  ctx.fillRect(0, FLOOR_Y - 52, NATIVE_WIDTH, NATIVE_HEIGHT - (FLOOR_Y - 52));

  // Wall/floor seam
  ctx.fillStyle = '#5A3920';
  ctx.fillRect(0, FLOOR_Y - 54, NATIVE_WIDTH, 2);

  // Subtle plank lines
  ctx.fillStyle = 'rgba(42, 33, 40, 0.18)';
  for (let y = FLOOR_Y - 36; y < NATIVE_HEIGHT; y += 32) {
    ctx.fillRect(0, y, NATIVE_WIDTH, 1);
  }

  // Sparse cage bars
  ctx.fillStyle = 'rgba(42, 33, 40, 0.5)';
  for (let x = 24; x < NATIVE_WIDTH; x += 48) {
    ctx.fillRect(x, 0, 1, FLOOR_Y - 54);
  }
  ctx.fillStyle = 'rgba(42, 33, 40, 0.6)';
  ctx.fillRect(0, 6, NATIVE_WIDTH, 1);

  // Hay pile in right corner
  const hayX = 410;
  const hayY = FLOOR_Y - 20;
  ctx.fillStyle = COLORS.green;
  ctx.fillRect(hayX, hayY + 8, 50, 12);
  ctx.fillStyle = '#8FA572';
  ctx.fillRect(hayX + 6, hayY + 4, 38, 6);
  ctx.fillRect(hayX + 14, hayY, 22, 4);

  // Cardboard hideout (left)
  const boxX = 30;
  const boxY = FLOOR_Y - 30;
  ctx.fillStyle = '#A07853';
  ctx.fillRect(boxX, boxY, 50, 30);
  ctx.fillStyle = '#7D5A3D';
  ctx.fillRect(boxX, boxY, 50, 2);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(boxX + 18, boxY + 12, 14, 18);

  // Light highlight
  const highlightGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, NATIVE_WIDTH * 0.6);
  highlightGrad.addColorStop(0, 'rgba(244, 239, 230, 0.08)');
  highlightGrad.addColorStop(1, 'rgba(244, 239, 230, 0)');
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
}

/**
 * Draws the wheel — base/stand + the spinning ring.
 * Optionally spins when a companion is using it.
 */
export function drawWheel(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
  spinning: boolean
) {
  const cx = WHEEL_X;
  const cy = WHEEL_HUB_Y;

  // Stand legs
  ctx.fillStyle = '#5A3920';
  ctx.fillRect(cx - 12, cy + 6, 1, FLOOR_Y - (cy + 6));
  ctx.fillRect(cx + 12, cy + 6, 1, FLOOR_Y - (cy + 6));
  // Foot pads
  ctx.fillRect(cx - 14, FLOOR_Y - 1, 5, 1);
  ctx.fillRect(cx + 10, FLOOR_Y - 1, 5, 1);

  // Outer ring of wheel
  const r = WHEEL_RADIUS;
  ctx.strokeStyle = COLORS.black;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring (track)
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(42, 33, 40, 0.5)';
  ctx.stroke();

  // Spokes
  const angle = getWheelAngle(timeMs, spinning);
  ctx.strokeStyle = COLORS.black;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a = angle + (i * Math.PI) / 2;
    const x1 = cx + Math.cos(a) * 2;
    const y1 = cy + Math.sin(a) * 2;
    const x2 = cx + Math.cos(a) * (r - 1);
    const y2 = cy + Math.sin(a) * (r - 1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Hub
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(cx - 1, cy - 1, 2, 2);

  ctx.lineWidth = 1; // reset
}

/** Draws the food bowl with a few kibble pellets. */
export function drawBowl(ctx: CanvasRenderingContext2D) {
  const cx = BOWL_X;
  const cy = BOWL_Y;

  // Bowl outer ellipse (drawn as a half-shape)
  ctx.fillStyle = '#5A4030';
  ctx.fillRect(cx - 10, cy - 3, 20, 4);
  ctx.fillRect(cx - 9, cy + 1, 18, 1);
  ctx.fillRect(cx - 8, cy + 2, 16, 1);

  // Inner rim highlight
  ctx.fillStyle = '#7D5A3D';
  ctx.fillRect(cx - 9, cy - 2, 18, 1);

  // Kibble pellets inside
  ctx.fillStyle = '#C19B5C';
  ctx.fillRect(cx - 6, cy - 1, 2, 1);
  ctx.fillRect(cx - 2, cy - 1, 2, 1);
  ctx.fillRect(cx + 2, cy - 1, 2, 1);
  ctx.fillRect(cx + 4, cy, 2, 1);
}
