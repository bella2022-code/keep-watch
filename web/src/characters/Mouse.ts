/**
 * Mouse Character · Polished Placeholder
 *
 * Upgrades over the basic placeholder:
 *   - Belly highlight (2-tone shading)
 *   - 3-frame animated tail (curls and flicks)
 *   - 3x4 sparkly eyes (like Goldfish front view)
 *   - Subtle whiskers
 *   - Visible front paws
 *   - Soft drop shadow + halo
 *
 * Synced 800ms breathing rhythm.
 */

import { COLORS } from '../core/colors';
import { getCurrentPalette } from '../core/theme';

const IDLE_CYCLE_MS = 800;
const TAIL_CYCLE_MS = 700;

const BODY_W = 28;
const BODY_H = 20;
const EAR_W = 6;
const EAR_H = 5;

export interface MouseState {
  x: number;
  y: number;
}

function breathingPhase(timeMs: number): number {
  return Math.sin((timeMs / IDLE_CYCLE_MS) * Math.PI * 2);
}

function tailFrame(timeMs: number): number {
  return Math.floor((timeMs / TAIL_CYCLE_MS) * 3) % 3;
}

/** Tail rendering. `attachX` is where the tail joins the body
 *  (left side of body if facingRight, right side if facingLeft).
 *  `attachY` is roughly the y of the tail attachment point.
 *  `frame`: 0 neutral, 1 curl up, 2 curl down. */
function drawTail(
  ctx: CanvasRenderingContext2D,
  attachX: number,
  attachY: number,
  facingRight: boolean,
  frame: number
) {
  ctx.fillStyle = COLORS.pink;
  const dir = facingRight ? -1 : 1; // tail extends opposite of face

  // Define waypoints relative to attach point: offsets [dx, dy]
  let path: [number, number][];
  if (frame === 0) {
    path = [
      [0, 0],
      [1, -1],
      [2, -1],
      [3, 0],
      [4, 0],
    ];
  } else if (frame === 1) {
    path = [
      [0, 0],
      [1, -1],
      [2, -2],
      [3, -2],
      [4, -1],
    ];
  } else {
    path = [
      [0, 0],
      [1, 0],
      [2, 1],
      [3, 1],
      [4, 2],
    ];
  }

  for (const [dx, dy] of path) {
    ctx.fillRect(attachX + dx * dir, attachY + dy, 1, 1);
  }
}

/** Render the mouse body with all features.
 *  `walkFrame`: -1 = idle, 0..3 = walking frame. */
function drawBody(
  ctx: CanvasRenderingContext2D,
  bodyX: number,
  bodyY: number,
  bodyH: number,
  facingRight: boolean,
  tailF: number,
  walkFrame: number,
  feetY: number
) {
  const palette = getCurrentPalette();
  const BODY_LIGHT = palette.mouseBody;
  const BODY_BELLY = palette.mouseBelly;
  const BODY_SHADOW = palette.mouseBack;

  // Drop shadow
  ctx.fillStyle = 'rgba(42, 33, 40, 0.4)';
  ctx.fillRect(bodyX - 1, feetY, BODY_W + 2, 1);

  // Main body
  ctx.fillStyle = BODY_LIGHT;
  ctx.fillRect(bodyX, bodyY, BODY_W, bodyH);

  // Belly (warmer cream, lower half)
  ctx.fillStyle = BODY_BELLY;
  ctx.fillRect(bodyX + 2, bodyY + bodyH - 7, BODY_W - 4, 6);

  // Subtle back shading
  ctx.fillStyle = BODY_SHADOW;
  if (facingRight) {
    ctx.fillRect(bodyX + 1, bodyY + 1, 7, 3);
  } else {
    ctx.fillRect(bodyX + BODY_W - 8, bodyY + 1, 7, 3);
  }

  // Outline (gap on top center for ear bases)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 5, bodyY, BODY_W - 10, 1);
  ctx.fillRect(bodyX, bodyY + bodyH - 1, BODY_W, 1);
  ctx.fillRect(bodyX, bodyY + 1, 1, bodyH - 2);
  ctx.fillRect(bodyX + BODY_W - 1, bodyY + 1, 1, bodyH - 2);

  // Left ear
  ctx.fillStyle = BODY_LIGHT;
  ctx.fillRect(bodyX + 3, bodyY - EAR_H, EAR_W, EAR_H);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 3, bodyY - EAR_H, EAR_W, 1);
  ctx.fillRect(bodyX + 3, bodyY - EAR_H, 1, EAR_H);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + 4, bodyY - EAR_H + 1, EAR_W - 2, EAR_H - 2);

  // Right ear
  ctx.fillStyle = BODY_LIGHT;
  ctx.fillRect(bodyX + BODY_W - 3 - EAR_W, bodyY - EAR_H, EAR_W, EAR_H);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + BODY_W - 3 - EAR_W, bodyY - EAR_H, EAR_W, 1);
  ctx.fillRect(bodyX + BODY_W - 4, bodyY - EAR_H, 1, EAR_H);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + BODY_W - 2 - EAR_W, bodyY - EAR_H + 1, EAR_W - 2, EAR_H - 2);

  // Eyes — 3x4 sparkly (matches Goldfish quality)
  if (facingRight) {
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(bodyX + BODY_W - 11, bodyY + 5, 3, 4);
    ctx.fillRect(bodyX + BODY_W - 6, bodyY + 5, 3, 4);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(bodyX + BODY_W - 11, bodyY + 5, 1, 1);
    ctx.fillRect(bodyX + BODY_W - 6, bodyY + 5, 1, 1);
    // Nose
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(bodyX + BODY_W - 1, bodyY + 8, 1, 2);
    ctx.fillRect(bodyX + BODY_W - 2, bodyY + 9, 1, 1);
    // Cheek blush
    ctx.fillStyle = 'rgba(232, 155, 170, 0.7)';
    ctx.fillRect(bodyX + BODY_W - 7, bodyY + 11, 3, 1);
    // Whiskers
    ctx.fillStyle = 'rgba(42, 33, 40, 0.35)';
    ctx.fillRect(bodyX + BODY_W, bodyY + 9, 2, 1);
    ctx.fillRect(bodyX + BODY_W + 1, bodyY + 11, 2, 1);
    ctx.fillRect(bodyX + BODY_W, bodyY + 12, 2, 1);
  } else {
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(bodyX + 3, bodyY + 5, 3, 4);
    ctx.fillRect(bodyX + 8, bodyY + 5, 3, 4);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(bodyX + 3, bodyY + 5, 1, 1);
    ctx.fillRect(bodyX + 8, bodyY + 5, 1, 1);
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(bodyX, bodyY + 8, 1, 2);
    ctx.fillRect(bodyX + 1, bodyY + 9, 1, 1);
    ctx.fillStyle = 'rgba(232, 155, 170, 0.7)';
    ctx.fillRect(bodyX + 4, bodyY + 11, 3, 1);
    ctx.fillStyle = 'rgba(42, 33, 40, 0.35)';
    ctx.fillRect(bodyX - 2, bodyY + 9, 2, 1);
    ctx.fillRect(bodyX - 2, bodyY + 11, 2, 1);
    ctx.fillRect(bodyX - 2, bodyY + 12, 2, 1);
  }

  // Animated tail
  if (facingRight) {
    drawTail(ctx, bodyX, bodyY + bodyH - 5, true, tailF);
  } else {
    drawTail(ctx, bodyX + BODY_W - 1, bodyY + bodyH - 5, false, tailF);
  }

  // Front paws — pink with black base for grounding (not "transparent" looking)
  if (walkFrame === -1) {
    // idle: 2×2 paws, pink top + black bottom row
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(bodyX + 8, feetY - 2, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 10, feetY - 2, 2, 1);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(bodyX + 8, feetY - 1, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 10, feetY - 1, 2, 1);
  } else if (walkFrame === 0 || walkFrame === 2) {
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(bodyX + 7, feetY - 2, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 9, feetY - 2, 2, 1);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(bodyX + 7, feetY - 1, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 9, feetY - 1, 2, 1);
  } else {
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(bodyX + 10, feetY - 2, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 12, feetY - 2, 2, 1);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(bodyX + 10, feetY - 1, 2, 1);
    ctx.fillRect(bodyX + BODY_W - 12, feetY - 1, 2, 1);
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
  drawBody(ctx, bodyX, bodyY, bodyH, true, tailFrame(timeMs), -1, state.y);
}

export function drawMouseWalking(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  walkFrame: number,
  facingRight: boolean
) {
  const bob = walkFrame === 1 || walkFrame === 3 ? -1 : 0;
  const bodyH = BODY_H;
  const bodyX = Math.round(state.x - BODY_W / 2);
  const bodyY = Math.round(state.y - bodyH + bob);
  const tailF = walkFrame % 3;
  drawBody(ctx, bodyX, bodyY, bodyH, facingRight, tailF, walkFrame, state.y);
}

export function drawMouseWaving(
  ctx: CanvasRenderingContext2D,
  state: MouseState,
  wavePhase: number
) {
  drawMouse(ctx, state, 0);

  const palette = getCurrentPalette();
  const handCycle = Math.sin((wavePhase / 200) * Math.PI * 2);
  const handDy = Math.round(handCycle * 3);
  const bodyX = Math.round(state.x - BODY_W / 2);
  const bodyY = state.y - BODY_H;

  // Arm
  ctx.fillStyle = palette.mouseBody;
  ctx.fillRect(bodyX + BODY_W - 2, bodyY + 3 + handDy, 4, 3);
  // Hand
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + BODY_W + 2, bodyY + 2 + handDy, 3, 3);
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
