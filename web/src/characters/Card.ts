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

export interface CardContent {
  mode: 'timer' | 'pomodoro';
  /** Timer-mode minutes value */
  minutes?: number;
  /** Pomodoro work minutes */
  workMinutes?: number;
  /** Pomodoro rest minutes */
  restMinutes?: number;
  /** Pomodoro total cycles */
  totalCycles?: number;
  /** During flip animation: 0..1 progress (0 or undefined = no flip). */
  flipProgress?: number;
}

/** Returns the fold-corner rect (8×8 px in canvas coords). */
export function getFoldCornerRect(state: CardState) {
  const r = getCardRect(state);
  return { x: r.x + r.w - 7, y: r.y + r.h - 7, w: 7, h: 7 };
}

/** Internal: draws the front (Timer) face. */
function drawCardFront(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  minutes: number
) {
  // Wood body
  ctx.fillStyle = '#A89478';
  ctx.fillRect(x, y, w, h);
  // Grain
  ctx.fillStyle = '#8B7858';
  ctx.fillRect(x, y + 6, w, 1);
  ctx.fillRect(x, y + 14, w, 1);

  // Time text
  const mm = minutes.toString().padStart(2, '0');
  const text = `${mm}:00`;
  const { w: textW, h: textH } = measurePixelText(text, 1);
  const textX = x + Math.floor((w - textW) / 2);
  const textY = y + Math.floor((h - textH) / 2);
  drawPixelText(ctx, text, textX, textY, COLORS.black, 1);
}

/** Internal: draws the back (Pomodoro) face. */
function drawCardBack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  workMin: number,
  restMin: number,
  cycles: number
) {
  // Slightly darker wood for the back, with reverse grain direction
  ctx.fillStyle = '#9B8568';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#806A4F';
  ctx.fillRect(x + 4, y, 1, h);
  ctx.fillRect(x + w - 5, y, 1, h);

  // Row 1: tomato icons (small 4×4 red squares) — one per cycle
  const tomatoY = y + 4;
  const totalIconWidth = cycles * 5 - 1;
  const iconStartX = x + Math.floor((w - totalIconWidth) / 2);
  ctx.fillStyle = '#C44536';
  for (let i = 0; i < cycles; i++) {
    ctx.fillRect(iconStartX + i * 5, tomatoY, 4, 4);
    // tiny stem
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(iconStartX + i * 5 + 1, tomatoY - 1, 2, 1);
    ctx.fillStyle = '#C44536';
  }

  // Row 2: "WORK / REST" small text
  const label = `${workMin}/${restMin}`;
  const { w: lw } = measurePixelText(label, 1);
  drawPixelText(
    ctx,
    label,
    x + Math.floor((w - lw) / 2),
    y + 12,
    COLORS.black,
    1
  );
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  state: CardState,
  content: CardContent
) {
  const { x, y, w, h } = getCardRect(state);
  const flipP = content.flipProgress ?? 0;

  // Hanging holes + strings (always visible — they're behind the card)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.6)';
  ctx.fillRect(x + 8, y - 4, 1, 4);
  ctx.fillRect(x + w - 9, y - 4, 1, 4);

  // During flip: compute squashed width based on cosine
  // flipP 0..1, width factor = abs(cos(p*PI))
  const widthFactor = flipP > 0 ? Math.abs(Math.cos(flipP * Math.PI)) : 1;
  const drawnW = Math.max(2, Math.round(w * widthFactor));
  const drawnX = Math.round(state.centerX - drawnW / 2);

  // Determine which face to show based on flip progress + mode
  // When flipP < 0.5: showing departing side; >= 0.5: showing arriving side
  // The mode in state has already swapped at midpoint, so we use it directly.
  const showFace: 'front' | 'back' =
    flipP > 0 && flipP < 0.5
      ? content.mode === 'timer'
        ? 'back'
        : 'front'
      : content.mode === 'timer'
      ? 'front'
      : 'back';

  if (showFace === 'front') {
    drawCardFront(ctx, drawnX, y, drawnW, h, content.minutes ?? 25);
  } else {
    drawCardBack(
      ctx,
      drawnX,
      y,
      drawnW,
      h,
      content.workMinutes ?? 25,
      content.restMinutes ?? 5,
      content.totalCycles ?? 4
    );
  }

  // Border around the (possibly squashed) card
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(drawnX, y, drawnW, 1);
  ctx.fillRect(drawnX, y + h - 1, drawnW, 1);
  ctx.fillRect(drawnX, y, 1, h);
  ctx.fillRect(drawnX + drawnW - 1, y, 1, h);

  // Hanging holes (only when not deep in flip)
  if (widthFactor > 0.6) {
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(drawnX + 8, y + 2, 1, 1);
    ctx.fillRect(drawnX + drawnW - 9, y + 2, 1, 1);
  }

  // Fold corner indicator (only on front face, not during flip)
  if (showFace === 'front' && flipP === 0) {
    ctx.fillStyle = 'rgba(42, 33, 40, 0.35)';
    ctx.fillRect(x + w - 5, y + h - 5, 4, 4);
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(x + w - 5, y + h - 5, 4, 1);
    ctx.fillRect(x + w - 5, y + h - 5, 1, 4);
  }
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
