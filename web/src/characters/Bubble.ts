/**
 * Speech / hint bubble
 *
 * Used for:
 *   - "Tap me" onboarding hint above Mouse
 *   - Companion dialog bubbles (squeak, blub, etc.)
 *   - Hint above Card ("Scroll / ↑↓")
 */

import { COLORS } from '../core/colors';
import { drawPixelText, measurePixelText } from '../core/pixelFont';

export interface BubbleOpts {
  /** anchor point (the tip of the speech triangle points to this) */
  anchorX: number;
  anchorY: number;
  /** direction the bubble extends from the anchor */
  side: 'above' | 'below' | 'right';
  /** pixel scale for the inner text */
  scale?: number;
  /** alpha 0..1 */
  alpha?: number;
}

export function drawBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: BubbleOpts
) {
  const scale = opts.scale ?? 1;
  const alpha = opts.alpha ?? 1;
  const { w: textW, h: textH } = measurePixelText(text, scale);
  const padX = 4;
  const padY = 3;
  const bubbleW = textW + padX * 2;
  const bubbleH = textH + padY * 2;

  let bx = 0;
  let by = 0;
  if (opts.side === 'above') {
    bx = Math.round(opts.anchorX - bubbleW / 2);
    by = Math.round(opts.anchorY - bubbleH - 4);
  } else if (opts.side === 'below') {
    bx = Math.round(opts.anchorX - bubbleW / 2);
    by = Math.round(opts.anchorY + 4);
  } else {
    bx = Math.round(opts.anchorX + 4);
    by = Math.round(opts.anchorY - bubbleH / 2);
  }

  ctx.globalAlpha = alpha;

  // Background
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(bx, by, bubbleW, bubbleH);
  // 1px border
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bx, by, bubbleW, 1);
  ctx.fillRect(bx, by + bubbleH - 1, bubbleW, 1);
  ctx.fillRect(bx, by, 1, bubbleH);
  ctx.fillRect(bx + bubbleW - 1, by, 1, bubbleH);

  // Triangle pointer
  if (opts.side === 'above') {
    // Pointer down
    const tipX = opts.anchorX;
    const baseY = by + bubbleH - 1;
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(tipX - 2, baseY, 4, 1);
    ctx.fillRect(tipX - 1, baseY + 1, 2, 1);
    ctx.fillRect(tipX, baseY + 2, 1, 1);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(tipX - 2, baseY, 1, 1);
    ctx.fillRect(tipX + 1, baseY, 1, 1);
    ctx.fillRect(tipX - 1, baseY + 1, 1, 1);
    ctx.fillRect(tipX, baseY + 1, 1, 1);
    ctx.fillRect(tipX, baseY + 2, 1, 1);
  } else if (opts.side === 'below') {
    const tipX = opts.anchorX;
    const baseY = by;
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(tipX - 2, baseY - 1, 4, 1);
    ctx.fillRect(tipX - 1, baseY - 2, 2, 1);
    ctx.fillRect(tipX, baseY - 3, 1, 1);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(tipX, baseY - 3, 1, 1);
    ctx.fillRect(tipX - 1, baseY - 2, 1, 1);
    ctx.fillRect(tipX, baseY - 2, 1, 1);
    ctx.fillRect(tipX - 2, baseY - 1, 1, 1);
    ctx.fillRect(tipX + 1, baseY - 1, 1, 1);
  }

  // Text
  drawPixelText(ctx, text, bx + padX, by + padY, COLORS.black, scale);

  ctx.globalAlpha = 1;
}
