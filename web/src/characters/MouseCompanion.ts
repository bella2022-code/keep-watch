/**
 * Mouse Companion System
 *
 * Spec: docs/02-characters-companions.md §2.2
 *   - 1 companion at a time, max
 *   - Random color from {grey, brown, light pink, black}
 *   - Random left/right entry, walks across, exits
 *   - 30% chance of *squeak* bubble during pass-by
 *
 * For the placeholder we run this much more frequently (~10–15s)
 * than spec (5–8 min) so you can see it during development.
 * Once real production starts we'll respect the slower spec timing.
 */

import { COLORS } from '../core/colors';
import { drawBubble } from './Bubble';

type Color = '#9B9590' | '#8B6F4E' | '#E8C5BC' | '#3A3438';
const COMPANION_COLORS: Color[] = ['#9B9590', '#8B6F4E', '#E8C5BC', '#3A3438'];
const SQUEAK_LINES = ['squeak', 'nibble', 'eek~'];

const SPEED_PX_PER_S = 24; // companion crosses 480px in ~20s
const FLOOR_Y = 232; // y of feet (must match Mouse main character)
const BODY_W = 12;
const BODY_H = 9;

interface CompanionState {
  color: Color;
  /** direction of travel: +1 means moving right, -1 means moving left */
  dir: 1 | -1;
  /** current x (feet center) */
  x: number;
  /** time companion was spawned */
  spawnedAt: number;
  /** speak text or null */
  speak: string | null;
  /** time when speak should disappear */
  speakUntil: number;
}

let current: CompanionState | null = null;
let nextSpawnAt = 0;

/** Random integer 0..n-1 */
function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

function scheduleNext(now: number) {
  // For demo: 8–14 seconds between companions
  const delayMs = 8000 + Math.random() * 6000;
  nextSpawnAt = now + delayMs;
}

function spawn(now: number) {
  const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const color = COMPANION_COLORS[randInt(COMPANION_COLORS.length)];
  const x = dir === 1 ? -BODY_W : 480 + BODY_W;

  // 30% chance to squeak
  let speak: string | null = null;
  let speakUntil = 0;
  if (Math.random() < 0.3) {
    speak = SQUEAK_LINES[randInt(SQUEAK_LINES.length)];
    speakUntil = now + 1500; // 1.5s bubble
  }

  current = { color, dir, x, spawnedAt: now, speak, speakUntil };
}

export function tickCompanions(nowMs: number) {
  // Initial scheduling
  if (nextSpawnAt === 0) {
    scheduleNext(nowMs);
  }

  // Spawn if it's time and no companion is currently visible
  if (current === null && nowMs >= nextSpawnAt) {
    spawn(nowMs);
  }

  if (current) {
    // Advance position
    const dtSec = 1 / 60; // approximate per frame; real dt could be tracked
    current.x += current.dir * SPEED_PX_PER_S * dtSec;

    // Despawn when off screen
    const offScreen =
      (current.dir === 1 && current.x > 480 + BODY_W) ||
      (current.dir === -1 && current.x < -BODY_W);
    if (offScreen) {
      current = null;
      scheduleNext(nowMs);
    } else if (current.speak && nowMs > current.speakUntil) {
      current.speak = null;
    }
  }
}

export function drawCompanions(ctx: CanvasRenderingContext2D) {
  if (!current) return;
  const x = Math.round(current.x);
  const bodyX = x - BODY_W / 2;
  const bodyY = FLOOR_Y - BODY_H;

  // Drop shadow
  ctx.fillStyle = 'rgba(42, 33, 40, 0.35)';
  ctx.fillRect(bodyX - 1, FLOOR_Y, BODY_W + 2, 1);

  // Body
  ctx.fillStyle = current.color;
  ctx.fillRect(bodyX, bodyY, BODY_W, BODY_H);

  // Outline
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 3, bodyY, BODY_W - 6, 1);
  ctx.fillRect(bodyX, bodyY + BODY_H - 1, BODY_W, 1);
  ctx.fillRect(bodyX, bodyY + 1, 1, BODY_H - 2);
  ctx.fillRect(bodyX + BODY_W - 1, bodyY + 1, 1, BODY_H - 2);

  // Ears
  ctx.fillStyle = current.color;
  ctx.fillRect(bodyX + 2, bodyY - 2, 2, 2);
  ctx.fillRect(bodyX + BODY_W - 4, bodyY - 2, 2, 2);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 2, bodyY - 2, 2, 1);
  ctx.fillRect(bodyX + BODY_W - 4, bodyY - 2, 2, 1);

  // Eye (facing the direction of travel)
  ctx.fillStyle = COLORS.black;
  const eyeX = current.dir === 1 ? bodyX + BODY_W - 4 : bodyX + 3;
  ctx.fillRect(eyeX, bodyY + 3, 1, 1);

  // Tail (opposite of travel direction)
  ctx.fillStyle = current.color;
  if (current.dir === 1) {
    ctx.fillRect(bodyX - 2, bodyY + BODY_H - 3, 2, 1);
  } else {
    ctx.fillRect(bodyX + BODY_W, bodyY + BODY_H - 3, 2, 1);
  }

  // Speak bubble
  if (current.speak) {
    drawBubble(ctx, current.speak, {
      anchorX: x,
      anchorY: bodyY - 2,
      side: 'above',
    });
  }
}
