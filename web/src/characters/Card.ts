/**
 * Card · The "no UI is the UI" time picker
 *
 * A wooden signboard floating above the Mouse showing the timer value.
 * Scroll wheel on the card adjusts time.
 *
 * Spec: docs/03-ui-layout.md §3.1.3, §3.4
 *   Card position: 16px above character head
 *   Size: 96×56 px (3× pixel scale of base)
 *   Front: Timer (e.g. "25:00")
 */

import { COLORS } from '../core/colors';
import { drawPixelText, measurePixelText } from '../core/pixelFont';

export interface CardState {
  centerX: number; // Pixel coords on the native 480x270 canvas
  centerY: number; // Card vertical center
}

const CARD_W = 56;
const CARD_H = 22;

export function getCardRect(state: CardState) {
  return {
    x: Math.round(state.centerX - CARD_W / 2),
    y: Math.round(state.centerY - CARD_H / 2),
    w: CARD_W,
    h: CARD_H,
  };
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  state: CardState,
  minutes: number
) {
  const { x, y, w, h } = getCardRect(state);

  // Card body — warm wood
  ctx.fillStyle = '#A89478';
  ctx.fillRect(x, y, w, h);

  // Wood grain lines
  ctx.fillStyle = '#8B7858';
  ctx.fillRect(x, y + 6, w, 1);
  ctx.fillRect(x, y + 14, w, 1);

  // Border
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(x, y, w, 1); // top
  ctx.fillRect(x, y + h - 1, w, 1); // bottom
  ctx.fillRect(x, y, 1, h); // left
  ctx.fillRect(x + w - 1, y, 1, h); // right

  // Two hanging holes (top)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(x + 8, y + 2, 1, 1);
  ctx.fillRect(x + w - 9, y + 2, 1, 1);

  // String above (visual: card is hanging)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.6)';
  ctx.fillRect(x + 8, y - 4, 1, 4);
  ctx.fillRect(x + w - 9, y - 4, 1, 4);

  // Format time as MM:SS (always show :00 for setup)
  const mm = minutes.toString().padStart(2, '0');
  const text = `${mm}:00`;

  // Center the text
  const { w: textW, h: textH } = measurePixelText(text, 1);
  const textX = x + Math.floor((w - textW) / 2);
  const textY = y + Math.floor((h - textH) / 2);

  drawPixelText(ctx, text, textX, textY, COLORS.black, 1);

  // Fold corner indicator (lower right, 4×4 px)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.35)';
  ctx.fillRect(x + w - 5, y + h - 5, 4, 4);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(x + w - 5, y + h - 5, 4, 1);
  ctx.fillRect(x + w - 5, y + h - 5, 1, 4);
}

/**
 * Draws a completion card with arbitrary text instead of a time value.
 * Used during the completion sequence — the Mouse holds this card up
 * with an encouragement message on it.
 *
 * `scale` lets the card grow during the "rising" animation.
 * `alpha` lets it fade in/out.
 */
export function drawCompletionCard(
  ctx: CanvasRenderingContext2D,
  state: CardState,
  text: string,
  opts: { scale?: number; alpha?: number } = {}
) {
  const scale = opts.scale ?? 1;
  const alpha = opts.alpha ?? 1;

  // Card dimensions sized to fit the text
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '8px monospace';
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(text);
  const padX = 8;
  const padY = 6;
  const w = Math.max(60, Math.ceil(metrics.width) + padX * 2);
  const h = 18;

  const drawnW = Math.round(w * scale);
  const drawnH = Math.round(h * scale);
  const x = Math.round(state.centerX - drawnW / 2);
  const y = Math.round(state.centerY - drawnH / 2);

  // Card body — warm wood
  ctx.fillStyle = '#A89478';
  ctx.fillRect(x, y, drawnW, drawnH);
  // Wood grain
  ctx.fillStyle = '#8B7858';
  ctx.fillRect(x, y + Math.round(5 * scale), drawnW, 1);
  ctx.fillRect(x, y + drawnH - Math.round(5 * scale), drawnW, 1);

  // Border
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(x, y, drawnW, 1);
  ctx.fillRect(x, y + drawnH - 1, drawnW, 1);
  ctx.fillRect(x, y, 1, drawnH);
  ctx.fillRect(x + drawnW - 1, y, 1, drawnH);

  // Hanging strings (visible only when scale >= 1)
  if (scale >= 0.95) {
    ctx.fillStyle = 'rgba(42, 33, 40, 0.6)';
    ctx.fillRect(x + 8, y - 4, 1, 4);
    ctx.fillRect(x + drawnW - 9, y - 4, 1, 4);
  }

  // Text (only when card has popped out enough to be readable)
  if (scale >= 0.5) {
    ctx.fillStyle = COLORS.black;
    ctx.textAlign = 'center';
    ctx.fillText(text, x + drawnW / 2, y + drawnH / 2 + 1);
  }
  ctx.restore();
}

/**
 * Draws the running time during Focus Mode as a remaining MM:SS clock
 * in the bottom-left corner of the canvas, with a soft progress bar
 * underneath. See spec docs/03-ui-layout.md §3.5
 */
export function drawFocusModeClock(
  ctx: CanvasRenderingContext2D,
  remainingMs: number,
  totalMs: number
) {
  const remainingSec = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(remainingSec / 60).toString().padStart(2, '0');
  const ss = (remainingSec % 60).toString().padStart(2, '0');
  const text = `${mm}:${ss}`;

  // Lower-left, 16px margin
  const baseX = 16;
  const baseY = 270 - 16 - 7; // canvas height - margin - text height

  // 50% opacity warm white
  ctx.globalAlpha = 0.5;
  drawPixelText(ctx, text, baseX, baseY, COLORS.white, 1);
  ctx.globalAlpha = 1;

  // Progress bar — 60px wide, 2px tall, below the text
  const barW = 60;
  const barH = 2;
  const barX = baseX;
  const barY = baseY + 9;

  // Empty bar background
  ctx.fillStyle = 'rgba(122, 116, 128, 0.5)';
  ctx.fillRect(barX, barY, barW, barH);

  // Filled portion (depletes as time passes)
  const progress = totalMs > 0 ? remainingMs / totalMs : 0;
  const fillW = Math.round(barW * progress);
  ctx.fillStyle = 'rgba(244, 239, 230, 0.5)';
  ctx.fillRect(barX, barY, fillW, barH);
}
