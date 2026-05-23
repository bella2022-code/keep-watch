/**
 * Mouse Cage Scene · Placeholder
 *
 * Soft pixel mock of the cage interior — flat colors with subtle texture.
 * Real pixel art will replace this in Phase 2.
 */

import { COLORS } from '../core/colors';
import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../core/canvas';

const FLOOR_Y = 180; // y where floor begins

export function drawMouseCage(ctx: CanvasRenderingContext2D) {
  // Sky / wall — soft warm wood tone (upper section)
  ctx.fillStyle = '#6B4528';
  ctx.fillRect(0, 0, NATIVE_WIDTH, FLOOR_Y);

  // Soft horizontal gradient at wall→floor seam (subtle shadow)
  ctx.fillStyle = '#5A3920';
  ctx.fillRect(0, FLOOR_Y - 2, NATIVE_WIDTH, 2);

  // Floor — warm wood
  ctx.fillStyle = COLORS.wood;
  ctx.fillRect(0, FLOOR_Y, NATIVE_WIDTH, NATIVE_HEIGHT - FLOOR_Y);

  // Subtle floor plank lines (faint, every 32px, only every other one)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.18)';
  for (let y = FLOOR_Y + 16; y < NATIVE_HEIGHT; y += 32) {
    ctx.fillRect(0, y, NATIVE_WIDTH, 1);
  }

  // Cage bars — sparse, thin, only across upper area, faint
  ctx.fillStyle = 'rgba(42, 33, 40, 0.5)';
  for (let x = 24; x < NATIVE_WIDTH; x += 48) {
    ctx.fillRect(x, 0, 1, FLOOR_Y);
  }
  // Top horizontal bar
  ctx.fillStyle = 'rgba(42, 33, 40, 0.6)';
  ctx.fillRect(0, 6, NATIVE_WIDTH, 1);

  // Hay pile in right corner (soft green tuft)
  const hayX = 380;
  const hayY = FLOOR_Y + 30;
  ctx.fillStyle = COLORS.green;
  ctx.fillRect(hayX, hayY + 8, 60, 12);
  ctx.fillStyle = '#8FA572';
  ctx.fillRect(hayX + 8, hayY + 4, 44, 6);
  ctx.fillRect(hayX + 18, hayY, 24, 4);

  // Cardboard hideout (left side)
  const boxX = 30;
  const boxY = FLOOR_Y - 10;
  ctx.fillStyle = '#A07853';
  ctx.fillRect(boxX, boxY, 50, 30);
  ctx.fillStyle = '#7D5A3D';
  ctx.fillRect(boxX, boxY, 50, 2); // top edge shadow
  ctx.fillStyle = COLORS.black;
  // doorway
  ctx.fillRect(boxX + 18, boxY + 12, 14, 18);

  // Soft top-left warm light highlight (suggesting upper-left light source)
  const highlightGrad = ctx.createRadialGradient(
    0,
    0,
    20,
    0,
    0,
    NATIVE_WIDTH * 0.6
  );
  highlightGrad.addColorStop(0, 'rgba(244, 239, 230, 0.08)');
  highlightGrad.addColorStop(1, 'rgba(244, 239, 230, 0)');
  ctx.fillStyle = highlightGrad;
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
}
