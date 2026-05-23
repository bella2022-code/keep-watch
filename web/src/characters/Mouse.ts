/**
 * Mouse Character · Placeholder
 *
 * Slightly enlarged for visibility while it's a placeholder.
 * 800ms breathing rhythm. Soft halo to indicate interactivity.
 */

import { COLORS } from '../core/colors';

const IDLE_CYCLE_MS = 800;

export interface MouseState {
  x: number;
  y: number; // feet at this y
}

function breathingPhase(timeMs: number): number {
  return Math.sin((timeMs / IDLE_CYCLE_MS) * Math.PI * 2);
}

export function drawMouse(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  timeMs: number
) {
  const phase = breathingPhase(timeMs);
  const breathOffset = phase > 0 ? 1 : 0;

  // Body — chunkier so it reads as a mouse at the user's viewport size
  const bodyW = 20;
  const bodyH = 15 - breathOffset;
  const bodyX = Math.round(state.x - bodyW / 2);
  const bodyY = Math.round(state.y - bodyH);

  // Drop shadow
  ctx.fillStyle = 'rgba(42, 33, 40, 0.4)';
  ctx.fillRect(bodyX - 1, state.y, bodyW + 2, 1);

  // Body fill
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

  // Outline (with gap for ears)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 5, bodyY, bodyW - 10, 1);
  ctx.fillRect(bodyX, bodyY + bodyH - 1, bodyW, 1);
  ctx.fillRect(bodyX, bodyY + 1, 1, bodyH - 2);
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 1, 1, bodyH - 2);

  // Left ear
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX + 2, bodyY - 4, 4, 4);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 2, bodyY - 4, 4, 1);
  ctx.fillRect(bodyX + 2, bodyY - 4, 1, 4);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + 3, bodyY - 3, 3, 2);

  // Right ear
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX + bodyW - 6, bodyY - 4, 4, 4);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + bodyW - 6, bodyY - 4, 4, 1);
  ctx.fillRect(bodyX + bodyW - 3, bodyY - 4, 1, 4);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 3, 3, 2);

  // Two black eyes — facing right
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + bodyW - 7, bodyY + 4, 1, 2);
  ctx.fillRect(bodyX + bodyW - 4, bodyY + 4, 1, 2);

  // Pink nose tip
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 5, 1, 2);

  // Cheek blush
  ctx.fillStyle = 'rgba(232, 155, 170, 0.6)';
  ctx.fillRect(bodyX + bodyW - 5, bodyY + 7, 2, 1);

  // Curling tail
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW, bodyY + bodyH - 4, 1, 1);
  ctx.fillRect(bodyX + bodyW + 1, bodyY + bodyH - 5, 1, 1);
  ctx.fillRect(bodyX + bodyW + 2, bodyY + bodyH - 4, 1, 1);
  ctx.fillRect(bodyX + bodyW + 3, bodyY + bodyH - 3, 1, 1);
  ctx.fillRect(bodyX + bodyW + 4, bodyY + bodyH - 2, 1, 1);
}

export function drawHalo(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  timeMs: number
) {
  const phase = breathingPhase(timeMs);
  const alpha = 0.08 + 0.05 * ((phase + 1) / 2);

  const cx = state.x;
  const cy = state.y - 8;
  const radius = 26;

  const gradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
  gradient.addColorStop(0, `rgba(244, 239, 230, ${alpha})`);
  gradient.addColorStop(1, 'rgba(244, 239, 230, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}
