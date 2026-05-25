/**
 * Mouse Cage Scene · Placeholder
 *
 * Includes a hamster wheel (left) and a food bowl (right) that companions
 * may occasionally stop at and use.
 */

import { COLORS } from '../core/colors';
import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../core/canvas';
import { getCurrentPalette } from '../core/theme';

const FLOOR_Y = 232;

/** Wheel screen position (center of wheel hub). */
export const WHEEL_X = 130;
export const WHEEL_HUB_Y = 210;
export const WHEEL_RADIUS = 20;

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
  const palette = getCurrentPalette();

  // Wall
  ctx.fillStyle = palette.cageWall;
  ctx.fillRect(0, 0, NATIVE_WIDTH, FLOOR_Y - 52);

  // Floor
  ctx.fillStyle = palette.cageFloor;
  ctx.fillRect(0, FLOOR_Y - 52, NATIVE_WIDTH, NATIVE_HEIGHT - (FLOOR_Y - 52));

  // Wall/floor seam
  ctx.fillStyle = palette.cageWallShadow;
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

  // Cardboard hideout (left) — bigger
  const boxX = 20;
  const boxY = FLOOR_Y - 42;
  const boxW = 70;
  const boxH = 42;
  ctx.fillStyle = palette.cageBox;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  // Top edge highlight
  ctx.fillStyle = palette.cageBoxTop;
  ctx.fillRect(boxX, boxY, boxW, 3);
  // Side seam suggesting cardboard fold
  ctx.fillStyle = palette.cageBoxSeam;
  ctx.fillRect(boxX + boxW - 1, boxY, 1, boxH);
  // Doorway (centered, taller)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(boxX + 25, boxY + 14, 20, boxH - 14);
  // Doorway top arch (round corners)
  ctx.fillRect(boxX + 27, boxY + 12, 16, 2);
  // Subtle outline
  ctx.fillStyle = 'rgba(42, 33, 40, 0.4)';
  ctx.fillRect(boxX, boxY, boxW, 1);
  ctx.fillRect(boxX, boxY, 1, boxH);

  // Window on the back wall (upper center-right area)
  drawCageWindow(ctx);

  // Light highlight
  const highlightGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, NATIVE_WIDTH * 0.6);
  highlightGrad.addColorStop(0, 'rgba(244, 239, 230, 0.08)');
  highlightGrad.addColorStop(1, 'rgba(244, 239, 230, 0)');
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
}

/**
 * Window on the back wall — shows a sky view outside the cage.
 * The current tint system already affects the whole scene including the
 * window pane, so the "weather" feel comes naturally.
 */
function drawCageWindow(ctx: CanvasRenderingContext2D) {
  const wx = 270;
  const wy = 50;
  const ww = 70;
  const wh = 60;

  // Wood frame
  ctx.fillStyle = '#7D5A3D';
  ctx.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
  ctx.fillStyle = '#5A3920';
  ctx.fillRect(wx - 4, wy - 4, ww + 8, 2);
  ctx.fillRect(wx - 4, wy + wh + 2, ww + 8, 2);

  // Sky background inside the window — soft blue gradient
  const skyGrad = ctx.createLinearGradient(wx, wy, wx, wy + wh);
  skyGrad.addColorStop(0, '#A8C8DC');
  skyGrad.addColorStop(0.5, '#C8DDE8');
  skyGrad.addColorStop(1, '#E0E8DC');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(wx, wy, ww, wh);

  // Distant tree silhouettes (faint hills + tree tops)
  ctx.fillStyle = 'rgba(91, 110, 80, 0.5)';
  ctx.fillRect(wx, wy + wh - 18, ww, 18);
  ctx.fillStyle = 'rgba(91, 110, 80, 0.8)';
  // Tree tops (jagged)
  const treeTops = [
    [10, 14], [16, 8], [22, 12], [28, 6], [36, 10],
    [44, 8], [52, 13], [60, 7],
  ];
  for (const [tx, th] of treeTops) {
    ctx.fillRect(wx + tx, wy + wh - 18 - th, 4, th);
  }

  // A small cloud or two (off-center)
  ctx.fillStyle = 'rgba(244, 239, 230, 0.85)';
  ctx.fillRect(wx + 12, wy + 12, 12, 3);
  ctx.fillRect(wx + 14, wy + 10, 8, 2);
  ctx.fillStyle = 'rgba(244, 239, 230, 0.7)';
  ctx.fillRect(wx + 45, wy + 22, 15, 3);
  ctx.fillRect(wx + 47, wy + 20, 10, 2);

  // Tiny bird silhouette (flying)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.5)';
  ctx.fillRect(wx + 35, wy + 18, 2, 1);
  ctx.fillRect(wx + 36, wy + 17, 1, 1);
  ctx.fillRect(wx + 34, wy + 17, 1, 1);

  // Cross-bar (window divider)
  ctx.fillStyle = '#7D5A3D';
  ctx.fillRect(wx + Math.floor(ww / 2) - 1, wy, 2, wh);
  ctx.fillRect(wx, wy + Math.floor(wh / 2) - 1, ww, 2);

  // Frame inner shadow
  ctx.fillStyle = 'rgba(42, 33, 40, 0.3)';
  ctx.fillRect(wx, wy, ww, 1);
  ctx.fillRect(wx, wy, 1, wh);
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
