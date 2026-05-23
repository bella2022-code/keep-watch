/**
 * Mouse Character · Placeholder
 *
 * Larger placeholder body (28x20) for visibility while no real sprite art exists.
 * 800ms breathing rhythm. Soft halo to indicate interactivity.
 */

import { COLORS } from '../core/colors';

const IDLE_CYCLE_MS = 800;

const BODY_W = 28;
const BODY_H = 20;
const EAR_W = 6;
const EAR_H = 5;

export interface MouseState {
  x: number;
  y: number; // feet at this y
}

function breathingPhase(timeMs: number): number {
  return Math.sin((timeMs / IDLE_CYCLE_MS) * Math.PI * 2);
}

/** Helper to draw the mouse body (used by idle, walking, waving). */
function drawBody(
  ctx: CanvasRenderingContext2D,
  bodyX: number,
  bodyY: number,
  bodyH: number,
  facingRight: boolean
) {
  // Drop shadow
  ctx.fillStyle = 'rgba(42, 33, 40, 0.4)';
  ctx.fillRect(bodyX - 1, bodyY + bodyH, BODY_W + 2, 1);

  // Body fill
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX, bodyY, BODY_W, bodyH);

  // Outline with gap on top for ears
  ctx.fillStyle = COLORS.black;
  // Top edge, skipping ear bases (ear bases at bodyX+3 and bodyX+19)
  ctx.fillRect(bodyX + 9, bodyY, 10, 1);
  // Bottom edge
  ctx.fillRect(bodyX, bodyY + bodyH - 1, BODY_W, 1);
  // Left edge
  ctx.fillRect(bodyX, bodyY + 1, 1, bodyH - 2);
  // Right edge
  ctx.fillRect(bodyX + BODY_W - 1, bodyY + 1, 1, bodyH - 2);

  // Left ear
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX + 3, bodyY - EAR_H, EAR_W, EAR_H);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 3, bodyY - EAR_H, EAR_W, 1);
  ctx.fillRect(bodyX + 3, bodyY - EAR_H, 1, EAR_H);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + 4, bodyY - EAR_H + 1, EAR_W - 2, EAR_H - 2);

  // Right ear
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX + BODY_W - 3 - EAR_W, bodyY - EAR_H, EAR_W, EAR_H);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + BODY_W - 3 - EAR_W, bodyY - EAR_H, EAR_W, 1);
  ctx.fillRect(bodyX + BODY_W - 4, bodyY - EAR_H, 1, EAR_H);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + BODY_W - 2 - EAR_W, bodyY - EAR_H + 1, EAR_W - 2, EAR_H - 2);

  // Eyes — two black dots, on the side the mouse is facing
  ctx.fillStyle = COLORS.black;
  if (facingRight) {
    ctx.fillRect(bodyX + BODY_W - 9, bodyY + 6, 2, 3);
    ctx.fillRect(bodyX + BODY_W - 5, bodyY + 6, 2, 3);
    // Nose tip on right
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(bodyX + BODY_W - 1, bodyY + 8, 1, 2);
    // Cheek blush
    ctx.fillStyle = 'rgba(232, 155, 170, 0.7)';
    ctx.fillRect(bodyX + BODY_W - 7, bodyY + 11, 3, 1);
  } else {
    ctx.fillRect(bodyX + 3, bodyY + 6, 2, 3);
    ctx.fillRect(bodyX + 7, bodyY + 6, 2, 3);
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(bodyX, bodyY + 8, 1, 2);
    ctx.fillStyle = 'rgba(232, 155, 170, 0.7)';
    ctx.fillRect(bodyX + 4, bodyY + 11, 3, 1);
  }

  // Tail extending from the side opposite to facing
  ctx.fillStyle = COLORS.pink;
  if (facingRight) {
    ctx.fillRect(bodyX - 1, bodyY + bodyH - 4, 1, 1);
    ctx.fillRect(bodyX - 2, bodyY + bodyH - 5, 1, 1);
    ctx.fillRect(bodyX - 3, bodyY + bodyH - 4, 1, 1);
    ctx.fillRect(bodyX - 4, bodyY + bodyH - 3, 1, 1);
    ctx.fillRect(bodyX - 5, bodyY + bodyH - 2, 1, 1);
  } else {
    ctx.fillRect(bodyX + BODY_W, bodyY + bodyH - 4, 1, 1);
    ctx.fillRect(bodyX + BODY_W + 1, bodyY + bodyH - 5, 1, 1);
    ctx.fillRect(bodyX + BODY_W + 2, bodyY + bodyH - 4, 1, 1);
    ctx.fillRect(bodyX + BODY_W + 3, bodyY + bodyH - 3, 1, 1);
    ctx.fillRect(bodyX + BODY_W + 4, bodyY + bodyH - 2, 1, 1);
  }
}

export function drawMouse(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  timeMs: number
) {
  const phase = breathingPhase(timeMs);
  const breathOffset = phase > 0 ? 1 : 0;
  const bodyH = BODY_H - breathOffset;
  const bodyX = Math.round(state.x - BODY_W / 2);
  const bodyY = Math.round(state.y - bodyH);

  drawBody(ctx, bodyX, bodyY, bodyH, true);
}

export function drawMouseWalking(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  walkFrame: number,
  facingRight: boolean
) {
  // Bob: odd frames -1px (lifted)
  const bob = walkFrame === 1 || walkFrame === 3 ? -1 : 0;
  const bodyH = BODY_H;
  const bodyX = Math.round(state.x - BODY_W / 2);
  const bodyY = Math.round(state.y - bodyH + bob);

  drawBody(ctx, bodyX, bodyY, bodyH, facingRight);

  // Legs (visible just below the body baseline). Two thin lines that
  // swap each frame for the gait.
  ctx.fillStyle = COLORS.black;
  if (walkFrame === 0 || walkFrame === 2) {
    ctx.fillRect(bodyX + 7, state.y - 1, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 9, state.y - 1, 2, 1);
  } else {
    ctx.fillRect(bodyX + 10, state.y - 1, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 12, state.y - 1, 2, 1);
  }
}

export function drawMouseWaving(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  wavePhase: number
) {
  drawMouse(ctx, state, 0);

  const handCycle = Math.sin((wavePhase / 200) * Math.PI * 2);
  const handDy = Math.round(handCycle * 3);
  const bodyX = Math.round(state.x - BODY_W / 2);
  const bodyY = state.y - BODY_H;

  // Arm
  ctx.fillStyle = COLORS.mouseBody;
  ctx.fillRect(bodyX + BODY_W - 2, bodyY + 3 + handDy, 4, 3);
  // Hand
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + BODY_W + 2, bodyY + 2 + handDy, 3, 3);
  // Hand outline
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + BODY_W + 2, bodyY + 2 + handDy, 3, 1);
  ctx.fillRect(bodyX + BODY_W + 4, bodyY + 2 + handDy, 1, 3);
}

export function drawHalo(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  timeMs: number
) {
  const phase = breathingPhase(timeMs);
  const alpha = 0.08 + 0.05 * ((phase + 1) / 2);

  const cx = state.x;
  const cy = state.y - 12;
  const radius = 32;

  const gradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
  gradient.addColorStop(0, `rgba(244, 239, 230, ${alpha})`);
  gradient.addColorStop(1, 'rgba(244, 239, 230, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}
