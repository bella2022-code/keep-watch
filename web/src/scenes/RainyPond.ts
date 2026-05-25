/**
 * Rainy Pond Scene · v2 (cleaner)
 *
 * Soft grey sky → distant misty hills → pond water with subtle ripples
 * A clear, prominent lily pad in the center where the frog sits.
 * Rain falls in soft slanted streaks. Reeds sway gently at the edges.
 */

import { COLORS } from '../core/colors';
import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../core/canvas';

const SKY_HIGH = '#6F7E8A';
const SKY_LOW = '#92A0AA';
const MIST = '#A8B2BA';
const HILL_BACK = '#4F5E4A';
const HILL_FRONT = '#3F4F3A';
const WATER = '#3A5A66';
const WATER_LIGHT = '#5A7E89';
const WATER_DARK = '#284048';
const PAD = '#6D8B58';
const PAD_DARK = '#4A6038';
const PAD_HIGHLIGHT = '#92AE7A';
const PAD_VEIN = '#3A4530';
const REED = '#5A6B4F';
const REED_TIP = '#7B9268';
const CATTAIL = '#7D5A3D';
const RAIN_BRIGHT = 'rgba(220, 230, 240, 0.55)';
const RAIN_FAINT = 'rgba(220, 230, 240, 0.30)';

const WATER_TOP = 165;
const PAD_CY = 188;

// Rain drop offsets (precomputed for variety, but consistent layout)
const NUM_DROPS = 70;
const dropOffsets = Array.from({ length: NUM_DROPS }, (_, i) => ({
  x: ((i * 37 + 13) % NATIVE_WIDTH) + (i % 7),
  yPhase: (i * 71) % 800,
  speed: 550 + ((i * 23) % 350),
  bright: i % 3 === 0,
}));

export function drawRainyPond(
  ctx: CanvasRenderingContext2D,
  timeMs: number
) {
  // ===== SKY (grey gradient) =====
  const skyGrad = ctx.createLinearGradient(0, 0, 0, WATER_TOP);
  skyGrad.addColorStop(0, SKY_HIGH);
  skyGrad.addColorStop(1, SKY_LOW);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, NATIVE_WIDTH, WATER_TOP);

  // ===== MIST BAND (above water, where sky meets hills) =====
  ctx.fillStyle = MIST;
  ctx.fillRect(0, WATER_TOP - 20, NATIVE_WIDTH, 8);
  ctx.fillStyle = 'rgba(168, 178, 186, 0.5)';
  ctx.fillRect(0, WATER_TOP - 12, NATIVE_WIDTH, 6);

  // ===== HILLS (two layers for depth) =====
  // Back hills
  ctx.fillStyle = HILL_BACK;
  drawHill(ctx, 70, WATER_TOP - 6, 140, 20);
  drawHill(ctx, 220, WATER_TOP - 4, 180, 24);
  drawHill(ctx, 380, WATER_TOP - 8, 160, 22);
  // Front hills
  ctx.fillStyle = HILL_FRONT;
  drawHill(ctx, 130, WATER_TOP, 200, 14);
  drawHill(ctx, 340, WATER_TOP, 220, 18);

  // ===== WATER =====
  const waterGrad = ctx.createLinearGradient(0, WATER_TOP, 0, NATIVE_HEIGHT);
  waterGrad.addColorStop(0, WATER);
  waterGrad.addColorStop(1, WATER_DARK);
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, WATER_TOP, NATIVE_WIDTH, NATIVE_HEIGHT - WATER_TOP);

  // Water surface highlight line
  ctx.fillStyle = WATER_LIGHT;
  ctx.fillRect(0, WATER_TOP, NATIVE_WIDTH, 1);

  // Subtle horizontal ripples
  ctx.fillStyle = 'rgba(168, 178, 186, 0.25)';
  for (let i = 0; i < 12; i++) {
    const baseX = ((i * 67) + Math.floor(timeMs / 80)) % NATIVE_WIDTH;
    const baseY = WATER_TOP + 4 + i * 8;
    const len = 6 + (i % 4) * 3;
    ctx.fillRect(Math.round(baseX), baseY, len, 1);
  }

  // ===== REEDS / CATTAILS (background) =====
  drawReeds(ctx, timeMs, 30, WATER_TOP - 2, 4, 30);
  drawReeds(ctx, timeMs, 410, WATER_TOP - 2, 4, 28);
  drawReeds(ctx, timeMs, 60, WATER_TOP + 8, 3, 22);

  // ===== LILY PAD (the frog's seat) =====
  drawLilyPad(ctx, 240, PAD_CY);

  // Small accent pad with flower
  drawSmallLilyPad(ctx, 370, WATER_TOP + 35);

  // ===== RAIN STREAKS =====
  for (const d of dropOffsets) {
    const t = ((timeMs + d.yPhase) % d.speed) / d.speed;
    const y = Math.round(t * (NATIVE_HEIGHT + 10) - 10);
    const x = Math.round(d.x - t * 5) % NATIVE_WIDTH;
    ctx.fillStyle = d.bright ? RAIN_BRIGHT : RAIN_FAINT;
    ctx.fillRect(x, y, 1, 4);
  }

  // Splash ripples on water (small expanding rings)
  for (let i = 0; i < 5; i++) {
    const cycle = 1800;
    const ripplePhase = (timeMs + i * 360) % cycle;
    if (ripplePhase > 900) continue;
    const rippleR = Math.round(ripplePhase / 220) + 1;
    const rx = (i * 91 + 70) % (NATIVE_WIDTH - 40);
    const ry = WATER_TOP + 24 + (i * 19) % 60;
    ctx.strokeStyle = `rgba(244, 239, 230, ${0.45 - ripplePhase / 2200})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(rx, ry, rippleR, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // ===== OCCASIONAL DISTANT LIGHTNING =====
  const flashCycle = timeMs % 18000;
  if (flashCycle < 90) {
    ctx.fillStyle = `rgba(244, 239, 230, ${0.18 * (1 - flashCycle / 90)})`;
    ctx.fillRect(0, 0, NATIVE_WIDTH, WATER_TOP);
  }
}

function drawHill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  width: number,
  height: number
) {
  for (let dy = 0; dy <= height; dy++) {
    const wf = Math.sqrt(1 - (dy * dy) / (height * height));
    const w = Math.round((width / 2) * wf);
    ctx.fillRect(cx - w, baseY - dy, w * 2 + 1, 1);
  }
}

function drawReeds(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
  baseX: number,
  baseY: number,
  count: number,
  maxHeight: number
) {
  for (let i = 0; i < count; i++) {
    const offset = i * 7;
    const height = maxHeight + ((i * 13) % 8) - 4;
    const sway = Math.sin((timeMs + offset * 200) / 950);
    const swayInt = Math.round(sway * 1);
    // Stem
    ctx.fillStyle = REED;
    for (let dy = 0; dy < height; dy++) {
      const wobbleX = Math.round((sway * dy) / 14);
      ctx.fillRect(baseX + offset + wobbleX + swayInt, baseY - dy, 1, 1);
    }
    // Tip
    ctx.fillStyle = REED_TIP;
    ctx.fillRect(
      baseX + offset + Math.round((sway * height) / 14) + swayInt,
      baseY - height,
      1,
      2
    );
    // Cattail head on every 2nd reed
    if (i % 2 === 0) {
      ctx.fillStyle = CATTAIL;
      const headX = baseX + offset + Math.round((sway * (height - 2)) / 14) + swayInt;
      ctx.fillRect(headX - 1, baseY - height + 2, 3, 6);
    }
  }
}

function drawLilyPad(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Big main pad — flat oval with notch
  // Bottom shadow
  ctx.fillStyle = PAD_DARK;
  fillOval(ctx, cx, cy + 2, 26, 5);
  // Main pad
  ctx.fillStyle = PAD;
  fillOval(ctx, cx, cy, 25, 4);
  // Highlight crescent
  ctx.fillStyle = PAD_HIGHLIGHT;
  ctx.fillRect(cx - 14, cy - 3, 12, 1);
  ctx.fillRect(cx - 17, cy - 2, 6, 1);
  ctx.fillRect(cx + 8, cy - 2, 6, 1);
  // Veins (subtle lines from center outward)
  ctx.fillStyle = PAD_VEIN;
  ctx.fillRect(cx - 24, cy, 4, 1);
  ctx.fillRect(cx + 20, cy, 4, 1);
  // Notch indicating leaf shape
  ctx.fillStyle = WATER;
  ctx.fillRect(cx - 25, cy, 2, 1);
}

function drawSmallLilyPad(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  ctx.fillStyle = PAD_DARK;
  fillOval(ctx, cx, cy + 1, 9, 3);
  ctx.fillStyle = PAD;
  fillOval(ctx, cx, cy, 8, 2);
  ctx.fillStyle = PAD_HIGHLIGHT;
  ctx.fillRect(cx - 5, cy - 1, 3, 1);
  // Pink lily flower
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(cx + 3, cy - 2, 1, 1);
  ctx.fillRect(cx + 2, cy - 3, 3, 1);
  ctx.fillRect(cx + 3, cy - 4, 1, 1);
  // Flower core
  ctx.fillStyle = '#F4D8C0';
  ctx.fillRect(cx + 3, cy - 3, 1, 1);
}

function fillOval(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  for (let dy = -ry; dy <= ry; dy++) {
    const wf = Math.sqrt(1 - (dy * dy) / (ry * ry));
    const w = Math.round(rx * wf);
    ctx.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}
