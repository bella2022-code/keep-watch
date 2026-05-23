/**
 * Goldfish Character · Placeholder
 *
 * Side-view orange-red goldfish with a flowing tail fin.
 * Cold/aloof personality per the design spec — minimal expression.
 *
 * Draw modes:
 *   - drawGoldfishSwimming: animated tail, used for entering/exiting
 *   - drawGoldfishIdle:     gentle vertical bob (hovering in water)
 *   - drawGoldfishHoldingSign: facing camera, sign rendered above
 */

const BODY = '#E89060';
const FIN = '#C44536';
const BELLY = '#F4EFE6';
const OUTLINE = '#2A2128';

export interface GoldfishState {
  x: number;
  /** Vertical center of the fish */
  y: number;
}

/** Draws the goldfish swimming (with tail animation). */
export function drawGoldfishSwimming(
  ctx: CanvasRenderingContext2D,
  state: GoldfishState,
  timeMs: number,
  facingRight: boolean
) {
  const bobY = Math.round(Math.sin(timeMs / 400) * 1);
  const tailFrame = Math.floor(timeMs / 150) % 3;
  drawGoldfishCore(ctx, state.x, state.y + bobY, facingRight, tailFrame);
}

/** Static idle goldfish with subtle vertical bob. */
export function drawGoldfishIdle(
  ctx: CanvasRenderingContext2D,
  state: GoldfishState,
  timeMs: number,
  facingRight: boolean
) {
  const bobY = Math.round(Math.sin(timeMs / 600) * 1);
  // Slow tail flicker
  const tailFrame = Math.floor(timeMs / 400) % 3;
  drawGoldfishCore(ctx, state.x, state.y + bobY, facingRight, tailFrame);
}

/** Goldfish facing the camera (used during 4th-wall pause). */
export function drawGoldfishFacingCamera(
  ctx: CanvasRenderingContext2D,
  state: GoldfishState,
  timeMs: number
) {
  const bobY = Math.round(Math.sin(timeMs / 600) * 1);
  drawGoldfishFront(ctx, state.x, state.y + bobY);
}

/**
 * Core side-view sprite. Body 18x10, tail extends 6px on the opposite side
 * of `facingRight`. tailFrame 0/1/2 oscillates the tail shape.
 */
function drawGoldfishCore(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facingRight: boolean,
  tailFrame: number
) {
  const bodyW = 18;
  const bodyH = 10;
  const bodyX = Math.round(cx - bodyW / 2);
  const bodyY = Math.round(cy - bodyH / 2);

  // Tail (behind body, opposite of facing)
  const tailOffsetY = [-1, 0, 1][tailFrame];
  ctx.fillStyle = FIN;
  if (facingRight) {
    // Tail on the left
    ctx.fillRect(bodyX - 6, bodyY + 2 + tailOffsetY, 6, 6);
    ctx.fillRect(bodyX - 5, bodyY + 1 + tailOffsetY, 5, 1);
    ctx.fillRect(bodyX - 5, bodyY + 8 - tailOffsetY, 5, 1);
  } else {
    ctx.fillRect(bodyX + bodyW, bodyY + 2 + tailOffsetY, 6, 6);
    ctx.fillRect(bodyX + bodyW, bodyY + 1 + tailOffsetY, 5, 1);
    ctx.fillRect(bodyX + bodyW, bodyY + 8 - tailOffsetY, 5, 1);
  }

  // Body
  ctx.fillStyle = BODY;
  ctx.fillRect(bodyX + 2, bodyY, bodyW - 4, bodyH);
  ctx.fillRect(bodyX, bodyY + 2, bodyW, bodyH - 4);
  ctx.fillRect(bodyX + 1, bodyY + 1, bodyW - 2, bodyH - 2);

  // Belly (lighter)
  ctx.fillStyle = BELLY;
  ctx.fillRect(bodyX + 4, bodyY + bodyH - 2, bodyW - 8, 2);
  ctx.fillRect(bodyX + 3, bodyY + bodyH - 3, bodyW - 6, 1);

  // Top fin
  ctx.fillStyle = FIN;
  ctx.fillRect(bodyX + 6, bodyY - 2, bodyW - 12, 2);

  // Outline (rough)
  ctx.fillStyle = OUTLINE;
  // Top
  ctx.fillRect(bodyX + 2, bodyY, bodyW - 4, 1);
  // Bottom
  ctx.fillRect(bodyX + 2, bodyY + bodyH - 1, bodyW - 4, 1);
  // Front (facing side)
  if (facingRight) {
    ctx.fillRect(bodyX + bodyW - 1, bodyY + 2, 1, bodyH - 4);
  } else {
    ctx.fillRect(bodyX, bodyY + 2, 1, bodyH - 4);
  }

  // Eye on the facing side
  ctx.fillStyle = OUTLINE;
  if (facingRight) {
    ctx.fillRect(bodyX + bodyW - 4, bodyY + 3, 1, 2);
  } else {
    ctx.fillRect(bodyX + 3, bodyY + 3, 1, 2);
  }
}

/** Front view (facing camera) — eyes in center, body roughly oval. */
function drawGoldfishFront(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  const bodyW = 14;
  const bodyH = 12;
  const bodyX = Math.round(cx - bodyW / 2);
  const bodyY = Math.round(cy - bodyH / 2);

  // Body
  ctx.fillStyle = BODY;
  ctx.fillRect(bodyX + 1, bodyY, bodyW - 2, bodyH);
  ctx.fillRect(bodyX, bodyY + 2, bodyW, bodyH - 4);

  // Belly highlight (center bottom)
  ctx.fillStyle = BELLY;
  ctx.fillRect(bodyX + 4, bodyY + bodyH - 3, bodyW - 8, 2);

  // Side fins peeking out
  ctx.fillStyle = FIN;
  ctx.fillRect(bodyX - 2, bodyY + 5, 2, 3);
  ctx.fillRect(bodyX + bodyW, bodyY + 5, 2, 3);

  // Outline
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + 1, bodyY, bodyW - 2, 1);
  ctx.fillRect(bodyX + 1, bodyY + bodyH - 1, bodyW - 2, 1);
  ctx.fillRect(bodyX, bodyY + 2, 1, bodyH - 4);
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 2, 1, bodyH - 4);

  // Two eyes, centered
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + 3, bodyY + 4, 2, 3);
  ctx.fillRect(bodyX + bodyW - 5, bodyY + 4, 2, 3);
  // Sparkle
  ctx.fillStyle = '#F4EFE6';
  ctx.fillRect(bodyX + 3, bodyY + 4, 1, 1);
  ctx.fillRect(bodyX + bodyW - 5, bodyY + 4, 1, 1);

  // Small mouth
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + bodyW / 2 - 1, bodyY + 9, 2, 1);
}
