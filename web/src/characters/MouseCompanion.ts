/**
 * Mouse Companion System · v2
 *
 * Multiple companions (up to 2 simultaneously). 7 color variants
 * including solids and a calico (orange + white patches) pattern.
 *
 * Companions occasionally stop at the wheel or food bowl to interact:
 *   - 30% chance to use the wheel for 3.5s
 *   - 30% chance to eat for 2.5s
 * After their activity, they continue toward the other side.
 *
 * Demo timing: spawn every 6–11s (faster than spec for visibility).
 */

import { COLORS } from '../core/colors';
import { drawBubble } from './Bubble';
import { WHEEL_X, WHEEL_HUB_Y, BOWL_X } from '../scenes/MouseCage';

type SolidVariant = {
  kind: 'solid';
  color: string;
};
type CalicoVariant = {
  kind: 'calico';
  base: string;
  patch: string;
};
type Variant = SolidVariant | CalicoVariant;

const VARIANTS: Variant[] = [
  { kind: 'solid', color: '#9B9590' }, // grey
  { kind: 'solid', color: '#8B6F4E' }, // brown
  { kind: 'solid', color: '#E8C5BC' }, // light pink
  { kind: 'solid', color: '#3A3438' }, // black
  { kind: 'solid', color: '#D08050' }, // orange
  { kind: 'solid', color: '#F4EFE6' }, // white
  { kind: 'calico', base: '#F4EFE6', patch: '#D08050' }, // calico
];

const SQUEAK_LINES = ['squeak', 'nibble', 'eek~'];

const SPEED_PX_PER_S = 28;
const FLOOR_Y = 232;
const BODY_W = 18;
const BODY_H = 13;
const MAX_COMPANIONS = 2;

type Activity = 'walking' | 'wheeling' | 'eating';

interface Companion {
  variant: Variant;
  dir: 1 | -1;
  x: number;
  activity: Activity;
  activityStartedAt: number;
  /** Used so each companion has a unique speak bubble cycle */
  speak: string | null;
  speakUntil: number;
  /** Track interactions used this pass so we don't double-engage */
  usedWheel: boolean;
  usedBowl: boolean;
  /** Stable seed used for body patterns (e.g. calico spots).
   * Set once at spawn so patches don't shift as the mouse moves. */
  patternSeed: number;
}

let companions: Companion[] = [];
let nextSpawnAt = 0;
let lastTickMs = 0;

function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

function scheduleNext(now: number) {
  // 6–11 seconds between spawns
  const delayMs = 6000 + Math.random() * 5000;
  nextSpawnAt = now + delayMs;
}

function spawn(now: number) {
  const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const variant = VARIANTS[randInt(VARIANTS.length)];
  const x = dir === 1 ? -BODY_W : 480 + BODY_W;

  let speak: string | null = null;
  let speakUntil = 0;
  if (Math.random() < 0.3) {
    speak = SQUEAK_LINES[randInt(SQUEAK_LINES.length)];
    speakUntil = now + 1500;
  }

  companions.push({
    variant,
    dir,
    x,
    activity: 'walking',
    activityStartedAt: now,
    speak,
    speakUntil,
    usedWheel: false,
    usedBowl: false,
    patternSeed: randInt(7),
  });
}

export function tickCompanions(nowMs: number) {
  const dtMs = lastTickMs === 0 ? 16 : nowMs - lastTickMs;
  lastTickMs = nowMs;
  const dtSec = dtMs / 1000;

  if (nextSpawnAt === 0) {
    scheduleNext(nowMs);
  }

  // Spawn if room and time
  if (companions.length < MAX_COMPANIONS && nowMs >= nextSpawnAt) {
    spawn(nowMs);
    scheduleNext(nowMs);
  }

  // Update each companion
  for (const c of companions) {
    if (c.activity === 'walking') {
      c.x += c.dir * SPEED_PX_PER_S * dtSec;

      // Check if reached the wheel (within tolerance)
      if (!c.usedWheel && Math.abs(c.x - WHEEL_X) < 2 && Math.random() < 0.5) {
        // 50% chance per pass: engage wheel (but capped at 30% effective
        // because the previous pass may have already used it; this check
        // only happens once per pass).
        c.usedWheel = true;
        if (Math.random() < 0.6) {
          c.activity = 'wheeling';
          c.activityStartedAt = nowMs;
          c.x = WHEEL_X; // snap to wheel center
        }
      }
      // Check if reached the bowl
      if (!c.usedBowl && Math.abs(c.x - BOWL_X) < 2 && Math.random() < 0.5) {
        c.usedBowl = true;
        if (Math.random() < 0.6) {
          c.activity = 'eating';
          c.activityStartedAt = nowMs;
          c.x = BOWL_X;
        }
      }
    } else if (c.activity === 'wheeling') {
      if (nowMs - c.activityStartedAt > 3500) {
        c.activity = 'walking';
      }
    } else if (c.activity === 'eating') {
      if (nowMs - c.activityStartedAt > 2500) {
        c.activity = 'walking';
      }
    }

    if (c.speak && nowMs > c.speakUntil) {
      c.speak = null;
    }
  }

  // Despawn off-screen
  companions = companions.filter(
    (c) =>
      (c.dir === 1 && c.x <= 480 + BODY_W) ||
      (c.dir === -1 && c.x >= -BODY_W)
  );
}

/** Returns true if any companion is currently using the wheel. */
export function isWheelInUse(): boolean {
  return companions.some((c) => c.activity === 'wheeling');
}

function drawCompanionAt(
  ctx: CanvasRenderingContext2D,
  c: Companion,
  bodyXOverride?: number,
  bodyYOverride?: number,
  walkBobActive = true
) {
  const x = bodyXOverride !== undefined ? bodyXOverride : Math.round(c.x);
  const bodyX = bodyXOverride !== undefined ? Math.round(x - BODY_W / 2) : x - BODY_W / 2;
  const bodyYBase = bodyYOverride !== undefined ? bodyYOverride : FLOOR_Y - BODY_H;
  const facingRight = c.dir === 1;

  // Walking bob
  const bob =
    walkBobActive && Math.floor(performance.now() / 100) % 2 !== 0 ? -1 : 0;
  const bY = bodyYBase + bob;

  const baseColor = c.variant.kind === 'solid' ? c.variant.color : c.variant.base;

  // Drop shadow (only when on floor)
  if (bodyYOverride === undefined) {
    ctx.fillStyle = 'rgba(42, 33, 40, 0.35)';
    ctx.fillRect(bodyX - 1, FLOOR_Y, BODY_W + 2, 1);
  }

  // Body
  ctx.fillStyle = baseColor;
  ctx.fillRect(bodyX, bY, BODY_W, BODY_H);

  // Calico patches — positioned using the companion's stable seed so they
  // stay anchored to the body as the mouse moves.
  if (c.variant.kind === 'calico') {
    ctx.fillStyle = c.variant.patch;
    const seed = c.patternSeed;
    ctx.fillRect(bodyX + 2 + (seed % 3), bY + 2, 3, 3);
    ctx.fillRect(bodyX + 9 - ((seed * 2) % 3), bY + 7, 4, 2);
    ctx.fillRect(bodyX + 13, bY + 3, 2, 3);
  }

  // Outline (with ear gaps)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 6, bY, BODY_W - 12, 1);
  ctx.fillRect(bodyX, bY + BODY_H - 1, BODY_W, 1);
  ctx.fillRect(bodyX, bY + 1, 1, BODY_H - 2);
  ctx.fillRect(bodyX + BODY_W - 1, bY + 1, 1, BODY_H - 2);

  // Left ear
  ctx.fillStyle = baseColor;
  ctx.fillRect(bodyX + 2, bY - 3, 4, 3);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 2, bY - 3, 4, 1);
  ctx.fillRect(bodyX + 2, bY - 3, 1, 3);
  // Right ear
  ctx.fillStyle = baseColor;
  ctx.fillRect(bodyX + BODY_W - 6, bY - 3, 4, 3);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + BODY_W - 6, bY - 3, 4, 1);
  ctx.fillRect(bodyX + BODY_W - 3, bY - 3, 1, 3);

  // Eye
  ctx.fillStyle = COLORS.black;
  if (facingRight) {
    ctx.fillRect(bodyX + BODY_W - 5, bY + 4, 1, 2);
  } else {
    ctx.fillRect(bodyX + 4, bY + 4, 1, 2);
  }

  // Tail
  ctx.fillStyle = baseColor;
  if (facingRight) {
    ctx.fillRect(bodyX - 1, bY + BODY_H - 4, 1, 1);
    ctx.fillRect(bodyX - 2, bY + BODY_H - 3, 1, 1);
    ctx.fillRect(bodyX - 3, bY + BODY_H - 2, 1, 1);
  } else {
    ctx.fillRect(bodyX + BODY_W, bY + BODY_H - 4, 1, 1);
    ctx.fillRect(bodyX + BODY_W + 1, bY + BODY_H - 3, 1, 1);
    ctx.fillRect(bodyX + BODY_W + 2, bY + BODY_H - 2, 1, 1);
  }

  // Legs (only when walking)
  if (walkBobActive) {
    ctx.fillStyle = COLORS.black;
    const legPhase = Math.floor(performance.now() / 100) % 2;
    if (legPhase === 0) {
      ctx.fillRect(bodyX + 4, FLOOR_Y - 1, 2, 1);
      ctx.fillRect(bodyX + BODY_W - 6, FLOOR_Y - 1, 2, 1);
    } else {
      ctx.fillRect(bodyX + 6, FLOOR_Y - 1, 2, 1);
      ctx.fillRect(bodyX + BODY_W - 8, FLOOR_Y - 1, 2, 1);
    }
  }
}

export function drawCompanions(ctx: CanvasRenderingContext2D) {
  for (const c of companions) {
    if (c.activity === 'walking') {
      drawCompanionAt(ctx, c);
    } else if (c.activity === 'wheeling') {
      // Mouse positioned inside the wheel, legs animated fast
      const wheelBodyY = WHEEL_HUB_Y - BODY_H / 2;
      // Override draw position with wheel hub
      const wheelMouseY = Math.round(WHEEL_HUB_Y + BODY_H / 2 - 1);
      // Draw mouse compressed inside the wheel ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(WHEEL_X, WHEEL_HUB_Y, 13, 0, Math.PI * 2);
      ctx.clip();
      drawCompanionAt(ctx, c, WHEEL_X, wheelBodyY, false);
      ctx.restore();

      // Animate "running" legs as fast little dashes
      const fastPhase = Math.floor(performance.now() / 50) % 2;
      ctx.fillStyle = COLORS.black;
      if (fastPhase === 0) {
        ctx.fillRect(WHEEL_X - 4, wheelMouseY, 2, 1);
        ctx.fillRect(WHEEL_X + 2, wheelMouseY, 2, 1);
      } else {
        ctx.fillRect(WHEEL_X - 2, wheelMouseY, 2, 1);
        ctx.fillRect(WHEEL_X + 4, wheelMouseY, 2, 1);
      }
    } else if (c.activity === 'eating') {
      // Mouse standing at the bowl, head bobs down
      const eatBob = Math.sin((performance.now() / 200) * Math.PI * 2);
      const headDown = eatBob > 0 ? 1 : 0;
      const eatY = FLOOR_Y - BODY_H + headDown;
      drawCompanionAt(ctx, c, BOWL_X - 12, eatY, false);
    }

    // Speak bubble (above their current position)
    if (c.speak) {
      const x = c.activity === 'wheeling' ? WHEEL_X : c.activity === 'eating' ? BOWL_X - 12 : Math.round(c.x);
      const bY = c.activity === 'wheeling' ? WHEEL_HUB_Y - BODY_H / 2 - 4 : FLOOR_Y - BODY_H - 4;
      drawBubble(ctx, c.speak, {
        anchorX: x,
        anchorY: bY,
        side: 'above',
      });
    }
  }
}
