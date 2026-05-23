/**
 * Mouse Character · Placeholder
 *
 * A simple pixel-shape Mouse that idles with breathing motion.
 * Synced 800ms breathing cycle (spec: docs/01-visual-system.md §1.3).
 *
 * Real sprite art will replace this in Phase 2.
 */

import { COLORS } from '../core/colors';

const IDLE_CYCLE_MS = 800; // All characters share this breathing rhythm

export interface MouseState {
  x: number; // Center x in native pixels
  y: number; // Center y in native pixels (feet at this y)
}

/**
 * Returns a breathing offset between -1 and 1 based on time.
 */
function breathingPhase(timeMs: number): number {
  return Math.sin((timeMs / IDLE_CYCLE_MS) * Math.PI * 2);
}

export function drawMouse(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  timeMs: number
) {
  const phase = breathingPhase(timeMs);
  // Use a smoother breath — 0 to 1px subtle vertical squash, not flickery
  const breathOffset = phase > 0 ? 1 : 0;

  // Mouse body — 14px wide, 11px tall base (a bit chunkier so it reads as a mouse)
  const bodyW = 14;
  const bodyH = 11 - breathOffset; // squashes slightly on inhale
  const bodyX = Math.round(state.x - bodyW / 2);
  const bodyY = Math.round(state.y - bodyH);

  // Soft drop shadow under the mouse (grounds it visually)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.35)';
  ctx.fillRect(bodyX - 1, state.y, bodyW + 2, 1);

  // Body (fill)
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

  // Round corners by clearing 1px corners
  ctx.fillStyle = COLORS.wood; // matches scene floor near feet
  // (We only need to clear the bottom corners since top is rounded by ears later)

  // Outline (warm black, soft)
  ctx.fillStyle = COLORS.black;
  // top — leave gaps for ear bases
  ctx.fillRect(bodyX + 4, bodyY, bodyW - 8, 1);
  ctx.fillRect(bodyX, bodyY + bodyH - 1, bodyW, 1); // bottom
  ctx.fillRect(bodyX, bodyY + 1, 1, bodyH - 2); // left
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 1, 1, bodyH - 2); // right

  // Two rounded ears (top)
  // Left ear
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX + 2, bodyY - 3, 3, 3);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 2, bodyY - 3, 3, 1); // top of left ear
  ctx.fillRect(bodyX + 2, bodyY - 3, 1, 3); // left of left ear
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + 3, bodyY - 2, 2, 1); // inner pink
  // Right ear
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 3, 3, 3);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 3, 3, 1);
  ctx.fillRect(bodyX + bodyW - 2, bodyY - 3, 1, 3);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW - 4, bodyY - 2, 2, 1);

  // Eye — a black dot, positioned on right side (facing right)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + bodyW - 5, bodyY + 3, 1, 1);

  // Pink nose tip
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 4, 1, 1);

  // Tiny curling tail to the right
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW, bodyY + bodyH - 4, 1, 1);
  ctx.fillRect(bodyX + bodyW + 1, bodyY + bodyH - 5, 1, 1);
  ctx.fillRect(bodyX + bodyW + 2, bodyY + bodyH - 4, 1, 1);
  ctx.fillRect(bodyX + bodyW + 3, bodyY + bodyH - 3, 1, 1);
}

/**
 * Subtle halo that breathes very softly — almost invisible.
 * Uses a radial gradient for soft edges, not arc() (which causes hard flicker).
 */
export function drawHalo(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  timeMs: number
) {
  const phase = breathingPhase(timeMs);
  const alpha = 0.06 + 0.04 * ((phase + 1) / 2); // 0.06 to 0.10 — very subtle

  const cx = state.x;
  const cy = state.y - 5;
  const radius = 20;

  const gradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
  gradient.addColorStop(0, `rgba(244, 239, 230, ${alpha})`);
  gradient.addColorStop(1, 'rgba(244, 239, 230, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}
