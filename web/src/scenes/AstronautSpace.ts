/**
 * Astronaut Space Scene · Placeholder
 *
 * Dark navy cabin interior with a circular porthole showing starfield
 * and an Earth curve in the lower portion. Used during the Astronaut
 * reveal cinematic and as the standalone scene once unlocked.
 */

import { COLORS } from '../core/colors';
import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../core/canvas';
import { getCurrentPalette } from '../core/theme';

const PORTHOLE_CX = 240;
const PORTHOLE_CY = 130;
const PORTHOLE_R = 70;

/** Deterministic-feeling star positions (precomputed). */
const STARS: { x: number; y: number; bright: boolean }[] = [
  { x: 195, y: 80, bright: true },
  { x: 260, y: 70, bright: false },
  { x: 280, y: 95, bright: true },
  { x: 215, y: 105, bright: false },
  { x: 250, y: 115, bright: false },
  { x: 290, y: 130, bright: true },
  { x: 195, y: 140, bright: false },
  { x: 270, y: 155, bright: false },
  { x: 230, y: 90, bright: false },
  { x: 200, y: 125, bright: true },
];

/** Pure silhouette mode for the reveal. */
export function drawAstronautSpaceSilhouette(
  ctx: CanvasRenderingContext2D,
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Cabin background — solid dark
  ctx.fillStyle = '#15161E';
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

  // Porthole outline (thick ring)
  ctx.fillStyle = COLORS.black;
  drawRingOutline(ctx, PORTHOLE_CX, PORTHOLE_CY, PORTHOLE_R, 3);

  // Cabin floor line
  ctx.fillRect(0, 230, NATIVE_WIDTH, 2);

  // Small floating object silhouettes
  ctx.fillRect(120, 180, 8, 4); // mug
  ctx.fillRect(360, 200, 10, 3); // wrench

  ctx.restore();
}

/** Full colored Astronaut Space scene. */
export function drawAstronautSpace(
  ctx: CanvasRenderingContext2D,
  timeMs: number
) {
  const palette = getCurrentPalette();

  // Cabin interior
  ctx.fillStyle = palette.spaceCabin;
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

  // Cabin floor / wall divider
  ctx.fillStyle = palette.spaceFloor;
  ctx.fillRect(0, 230, NATIVE_WIDTH, NATIVE_HEIGHT - 230);
  ctx.fillStyle = palette.spaceFloorShadow;
  ctx.fillRect(0, 230, NATIVE_WIDTH, 1);

  // Floor panel lines
  ctx.fillStyle = 'rgba(244, 239, 230, 0.06)';
  for (let x = 60; x < NATIVE_WIDTH; x += 80) {
    ctx.fillRect(x, 232, 1, NATIVE_HEIGHT - 232);
  }

  // ---- Porthole contents ----
  ctx.save();
  ctx.beginPath();
  ctx.arc(PORTHOLE_CX, PORTHOLE_CY, PORTHOLE_R - 2, 0, Math.PI * 2);
  ctx.clip();

  // Deep space backdrop inside porthole
  ctx.fillStyle = '#0A0E18';
  ctx.fillRect(
    PORTHOLE_CX - PORTHOLE_R,
    PORTHOLE_CY - PORTHOLE_R,
    PORTHOLE_R * 2,
    PORTHOLE_R * 2
  );

  // Stars (twinkle)
  for (const star of STARS) {
    const tw = Math.sin((timeMs + star.x * 17) / 900);
    const visible = tw > -0.3 || star.bright;
    if (!visible) continue;
    ctx.fillStyle = star.bright ? '#F4EFE6' : 'rgba(244, 239, 230, 0.6)';
    ctx.fillRect(star.x, star.y, 1, 1);
    if (star.bright && tw > 0.7) {
      ctx.fillRect(star.x - 1, star.y, 1, 1);
      ctx.fillRect(star.x + 1, star.y, 1, 1);
      ctx.fillRect(star.x, star.y - 1, 1, 1);
      ctx.fillRect(star.x, star.y + 1, 1, 1);
    }
  }

  // Earth curve (lower portion)
  // A blue arc with green continents
  const earthCenterY = PORTHOLE_CY + PORTHOLE_R + 30;
  const earthR = PORTHOLE_R + 30;
  ctx.fillStyle = '#3B6BAA';
  fillCircle(ctx, PORTHOLE_CX, earthCenterY, earthR);
  // Atmosphere glow
  ctx.fillStyle = 'rgba(122, 175, 191, 0.4)';
  ctx.fillRect(
    PORTHOLE_CX - PORTHOLE_R,
    PORTHOLE_CY + PORTHOLE_R - 20,
    PORTHOLE_R * 2,
    8
  );
  // Continents (very abstract)
  ctx.fillStyle = '#7B9268';
  ctx.fillRect(PORTHOLE_CX - 20, PORTHOLE_CY + 35, 12, 4);
  ctx.fillRect(PORTHOLE_CX - 10, PORTHOLE_CY + 40, 8, 3);
  ctx.fillRect(PORTHOLE_CX + 5, PORTHOLE_CY + 38, 10, 5);
  ctx.fillRect(PORTHOLE_CX + 18, PORTHOLE_CY + 45, 6, 3);
  // Cloud wisps
  ctx.fillStyle = 'rgba(244, 239, 230, 0.4)';
  ctx.fillRect(PORTHOLE_CX - 25, PORTHOLE_CY + 50, 6, 1);
  ctx.fillRect(PORTHOLE_CX + 10, PORTHOLE_CY + 52, 5, 1);

  ctx.restore();
  // ---- End porthole contents ----

  // Porthole frame ring (thick metallic)
  ctx.fillStyle = '#5A6878';
  drawRingOutline(ctx, PORTHOLE_CX, PORTHOLE_CY, PORTHOLE_R, 3);
  ctx.fillStyle = '#3F4856';
  drawRingOutline(ctx, PORTHOLE_CX, PORTHOLE_CY, PORTHOLE_R + 1, 1);
  // Highlight on upper-left of frame
  ctx.fillStyle = '#8590A0';
  ctx.fillRect(PORTHOLE_CX - PORTHOLE_R + 15, PORTHOLE_CY - PORTHOLE_R + 6, 14, 1);

  // Bolts around porthole
  ctx.fillStyle = '#2A2128';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bx = Math.round(PORTHOLE_CX + Math.cos(a) * (PORTHOLE_R + 4));
    const by = Math.round(PORTHOLE_CY + Math.sin(a) * (PORTHOLE_R + 4));
    ctx.fillRect(bx, by, 2, 2);
  }

  // Plant sprout in container (the world's "breathing color")
  const plantX = 60;
  const plantY = 225;
  ctx.fillStyle = '#3F4856';
  ctx.fillRect(plantX - 4, plantY, 8, 6);
  ctx.fillStyle = COLORS.green;
  const sway = Math.sin(timeMs / 1100) * 1;
  ctx.fillRect(plantX, plantY - 4, 1, 4);
  ctx.fillRect(Math.round(plantX + sway) - 2, plantY - 6, 1, 2);
  ctx.fillRect(Math.round(plantX + sway) + 2, plantY - 6, 1, 2);
  ctx.fillRect(Math.round(plantX - sway), plantY - 8, 1, 2);

  // Floating mug (drifts)
  const mugY = 180 + Math.round(Math.sin(timeMs / 1400) * 3);
  ctx.fillStyle = '#A89478';
  ctx.fillRect(110, mugY, 10, 6);
  ctx.fillStyle = '#7D5A3D';
  ctx.fillRect(110, mugY, 10, 1);
  // Handle
  ctx.fillStyle = '#A89478';
  ctx.fillRect(120, mugY + 1, 2, 3);

  // Floating wrench (drifts)
  const wrenchY = 200 + Math.round(Math.sin(timeMs / 1700 + 1) * 3);
  ctx.fillStyle = '#7A8290';
  ctx.fillRect(350, wrenchY, 12, 2);
  ctx.fillRect(348, wrenchY - 1, 4, 4);
  ctx.fillRect(360, wrenchY - 1, 4, 4);

  // Micro-gravity particles (very subtle)
  ctx.fillStyle = 'rgba(244, 239, 230, 0.25)';
  const particleSeed = [
    { x: 80, y: 100, period: 1900 },
    { x: 400, y: 180, period: 2300 },
    { x: 320, y: 220, period: 2700 },
  ];
  for (const p of particleSeed) {
    const t = (timeMs % p.period) / p.period;
    const y = Math.round(p.y - t * 30);
    ctx.fillRect(p.x, y, 1, 1);
  }
}

/** Draws a tardigrade companion — tiny water bear floating in the cabin.
 *  Spec: docs/02-characters-companions.md §2.2.1.
 *  Translucent grey-white with green bioluminescent dot. ~4×4 px.
 */
export function drawTardigrade(
  ctx: CanvasRenderingContext2D,
  timeMs: number
) {
  // Slow curving drift path
  const t = (timeMs % 14000) / 14000; // 14-second loop
  const x = Math.round(60 + (NATIVE_WIDTH - 120) * t);
  const y = Math.round(180 + Math.sin(t * Math.PI * 4) * 25);

  // Body (rounded blob, 4×4)
  ctx.fillStyle = 'rgba(236, 238, 242, 0.7)';
  ctx.fillRect(x, y, 4, 4);
  ctx.fillRect(x + 1, y - 1, 2, 1);
  ctx.fillRect(x + 1, y + 4, 2, 1);

  // Bioluminescent dot
  ctx.fillStyle = '#7B9268';
  ctx.fillRect(x + 1, y + 1, 1, 1);
  // Body outline (subtle)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.5)';
  ctx.fillRect(x, y + 1, 1, 2);
  ctx.fillRect(x + 3, y + 1, 1, 2);

  // 8 tiny legs (left/right alternating with slow shuffle)
  const legFrame = Math.floor(timeMs / 200) % 2;
  ctx.fillStyle = 'rgba(122, 116, 128, 0.6)';
  if (legFrame === 0) {
    ctx.fillRect(x - 1, y + 1, 1, 1);
    ctx.fillRect(x + 4, y + 2, 1, 1);
  } else {
    ctx.fillRect(x - 1, y + 2, 1, 1);
    ctx.fillRect(x + 4, y + 1, 1, 1);
  }
}

/** Radial fill reveal — silhouette + colored circle expanding from center. */
export function drawAstronautSpaceRevealFill(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
  progress: number
) {
  drawAstronautSpaceSilhouette(ctx, 1);
  if (progress <= 0) return;

  const cx = NATIVE_WIDTH / 2;
  const cy = NATIVE_HEIGHT / 2;
  const maxR = Math.hypot(NATIVE_WIDTH, NATIVE_HEIGHT) / 2 + 20;
  const r = maxR * progress;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  drawAstronautSpace(ctx, timeMs);
  ctx.restore();
}

function fillCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawRingOutline(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  thickness: number
) {
  const prevLineWidth = ctx.lineWidth;
  ctx.lineWidth = thickness;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = prevLineWidth;
}
