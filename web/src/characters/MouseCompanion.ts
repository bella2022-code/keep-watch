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
import { WHEEL_X, WHEEL_HUB_Y, WHEEL_RADIUS, BOWL_X } from '../scenes/MouseCage';

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

type Activity = 'walking' | 'wheeling' | 'eating' | 'approaching';

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
  approachedThisPass: boolean;
  /** Stable seed used for body patterns (e.g. calico spots).
   * Set once at spawn so patches don't shift as the mouse moves. */
  patternSeed: number;
  /** Position where approach started, so we draw at consistent x */
  approachX: number;
  /** If non-zero, the x at which this NPC will pause to approach the camera.
   * Pre-rolled at spawn so the trigger is once-per-pass, not per-frame. */
  willApproachAt: number;
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

  // 30% of NPCs will approach the camera once during their pass.
  // Pre-roll the target x within the safe zone (away from main mouse + props).
  const willApproach = Math.random() < 0.3;
  const approachZone =
    dir === 1
      ? 170 + Math.random() * 30 // x in [170, 200]
      : 280 + Math.random() * 30; // x in [280, 310]

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
    approachedThisPass: false,
    patternSeed: randInt(7),
    approachX: 0,
    willApproachAt: willApproach ? approachZone : 0,
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
        c.usedWheel = true;
        if (Math.random() < 0.6) {
          c.activity = 'wheeling';
          c.activityStartedAt = nowMs;
          c.x = WHEEL_X;
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
      // Camera approach — pre-rolled at spawn, fires when mouse reaches
      // its target x.
      if (
        !c.approachedThisPass &&
        c.willApproachAt > 0 &&
        ((c.dir === 1 && c.x >= c.willApproachAt) ||
          (c.dir === -1 && c.x <= c.willApproachAt))
      ) {
        c.approachedThisPass = true;
        c.activity = 'approaching';
        c.activityStartedAt = nowMs;
        c.approachX = c.willApproachAt;
      }
    } else if (c.activity === 'wheeling') {
      if (nowMs - c.activityStartedAt > 3500) {
        c.activity = 'walking';
      }
    } else if (c.activity === 'eating') {
      if (nowMs - c.activityStartedAt > 2500) {
        c.activity = 'walking';
      }
    } else if (c.activity === 'approaching') {
      if (nowMs - c.activityStartedAt > APPROACH_TOTAL_MS) {
        c.activity = 'walking';
        c.x = c.approachX;
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

/** Approach sub-phases with INTEGER scales (no sub-pixel blur).
 *  Forward walk: scale 1 → 2 → 3 → 4, each step held STEP_MS with walking bob.
 *  Hold at 4 for HOLD_MS.
 *  Back walk: 3 → 2 → 1.
 *  Total = 4*STEP + HOLD + 3*STEP = ~7.5s.
 */
const STEP_MS = 900;
const HOLD_MS = 1800;
const FWD_STEPS = [1, 2, 3, 4];
const BACK_STEPS = [3, 2, 1];
const APPROACH_TOTAL_MS =
  STEP_MS * FWD_STEPS.length + HOLD_MS + STEP_MS * BACK_STEPS.length;

function bobInStep(stepElapsed: number): number {
  const frame = Math.floor((stepElapsed / STEP_MS) * 4) % 4;
  return frame === 1 || frame === 3 ? -2 : 0;
}

function getApproachPhase(elapsedMs: number): {
  scale: number;
  yShift: number;
  bobY: number;
  isWalking: boolean;
  isClose: boolean;
} {
  const FWD_TOTAL = STEP_MS * FWD_STEPS.length;
  const HOLD_END = FWD_TOTAL + HOLD_MS;
  const BACK_TOTAL = STEP_MS * BACK_STEPS.length;

  if (elapsedMs < FWD_TOTAL) {
    const stepIdx = Math.min(
      FWD_STEPS.length - 1,
      Math.floor(elapsedMs / STEP_MS)
    );
    return {
      scale: FWD_STEPS[stepIdx],
      yShift: stepIdx * 6,
      bobY: bobInStep(elapsedMs % STEP_MS),
      isWalking: true,
      isClose: false,
    };
  } else if (elapsedMs < HOLD_END) {
    return {
      scale: 4,
      yShift: (FWD_STEPS.length - 1) * 6,
      bobY: 0,
      isWalking: false,
      isClose: true,
    };
  } else if (elapsedMs < HOLD_END + BACK_TOTAL) {
    const t = elapsedMs - HOLD_END;
    const stepIdx = Math.min(BACK_STEPS.length - 1, Math.floor(t / STEP_MS));
    return {
      scale: BACK_STEPS[stepIdx],
      yShift: (BACK_STEPS.length - stepIdx - 1) * 6,
      bobY: bobInStep(t % STEP_MS),
      isWalking: true,
      isClose: false,
    };
  }
  return {
    scale: 1,
    yShift: 0,
    bobY: 0,
    isWalking: false,
    isClose: false,
  };
}

/**
 * Draws the mouse from the front — eyes in the middle, both ears visible.
 * Used during the "approaching the camera" animation.
 */
function drawCompanionFront(
  ctx: CanvasRenderingContext2D,
  c: Companion,
  cx: number,
  feetY: number,
  walkPhase: number
) {
  const bodyW = 18;
  const bodyH = 13;
  const bodyX = Math.round(cx - bodyW / 2);
  const bodyY = Math.round(feetY - bodyH);
  const baseColor = c.variant.kind === 'solid' ? c.variant.color : c.variant.base;

  // Drop shadow
  ctx.fillStyle = 'rgba(42, 33, 40, 0.4)';
  ctx.fillRect(bodyX - 1, feetY, bodyW + 2, 1);

  // Body — slightly rounded by clipping corners
  ctx.fillStyle = baseColor;
  ctx.fillRect(bodyX + 1, bodyY, bodyW - 2, bodyH);
  ctx.fillRect(bodyX, bodyY + 2, bodyW, bodyH - 4);

  // Calico patches (symmetric for front view)
  if (c.variant.kind === 'calico') {
    ctx.fillStyle = c.variant.patch;
    const s = c.patternSeed % 3;
    ctx.fillRect(bodyX + 3 + s, bodyY + 9, 2, 2);
    ctx.fillRect(bodyX + bodyW - 5 - s, bodyY + 9, 2, 2);
  }

  // Outline
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 6, bodyY, bodyW - 12, 1); // top center (between ears)
  ctx.fillRect(bodyX + 1, bodyY + bodyH - 1, bodyW - 2, 1); // bottom
  ctx.fillRect(bodyX, bodyY + 2, 1, bodyH - 4); // left
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 2, 1, bodyH - 4); // right
  // Corner softening
  ctx.fillRect(bodyX + 1, bodyY + 1, 1, 1);
  ctx.fillRect(bodyX + bodyW - 2, bodyY + 1, 1, 1);

  // Left ear
  ctx.fillStyle = baseColor;
  ctx.fillRect(bodyX + 1, bodyY - 3, 4, 3);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 1, bodyY - 3, 4, 1);
  ctx.fillRect(bodyX + 1, bodyY - 3, 1, 3);
  ctx.fillRect(bodyX + 4, bodyY - 3, 1, 3);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + 2, bodyY - 2, 2, 2);

  // Right ear
  ctx.fillStyle = baseColor;
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 3, 4, 3);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 3, 4, 1);
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 3, 1, 3);
  ctx.fillRect(bodyX + bodyW - 2, bodyY - 3, 1, 3);
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW - 4, bodyY - 2, 2, 2);

  // Two eyes — centered, looking at camera (3x4 each, prominent)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(bodyX + 3, bodyY + 3, 3, 4);
  ctx.fillRect(bodyX + bodyW - 6, bodyY + 3, 3, 4);
  // Sparkle highlights (top-left of each eye, 1px so 11 black pixels remain visible)
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(bodyX + 3, bodyY + 3, 1, 1);
  ctx.fillRect(bodyX + bodyW - 6, bodyY + 3, 1, 1);

  // Pink nose (centered)
  ctx.fillStyle = COLORS.pink;
  ctx.fillRect(bodyX + bodyW / 2 - 1, bodyY + 8, 2, 1);

  // Whiskers (subtle)
  ctx.fillStyle = 'rgba(42, 33, 40, 0.4)';
  ctx.fillRect(bodyX - 2, bodyY + 8, 2, 1);
  ctx.fillRect(bodyX + bodyW, bodyY + 8, 2, 1);

  // Two front paws — alternate vertically for walking bob
  ctx.fillStyle = COLORS.pink;
  if (walkPhase > 0) {
    ctx.fillRect(bodyX + 2, feetY - 1, 3, 1);
    ctx.fillRect(bodyX + bodyW - 5, feetY - 2, 3, 1);
  } else {
    ctx.fillRect(bodyX + 2, feetY - 2, 3, 1);
    ctx.fillRect(bodyX + bodyW - 5, feetY - 1, 3, 1);
  }
}

export function drawCompanions(ctx: CanvasRenderingContext2D) {
  for (const c of companions) {
    if (c.activity === 'walking') {
      drawCompanionAt(ctx, c);
    } else if (c.activity === 'approaching') {
      // Mouse turns to face camera and walks forward.
      // Integer scale steps (1, 2, 3, 4) keep pixels crisp.
      // Walking bob = clean alternating 0/-2 per footstep.
      const elapsedApproach = performance.now() - c.activityStartedAt;
      const { scale, yShift, bobY, isWalking, isClose } =
        getApproachPhase(elapsedApproach);

      // Blink occasionally when close
      const blinking = isClose && Math.floor(elapsedApproach / 400) % 7 === 6;

      // Integer walk phase for paw alternation
      const walkPhase = isWalking
        ? Math.floor((elapsedApproach % STEP_MS) / (STEP_MS / 4)) % 2 === 0
          ? 1
          : -1
        : 0;

      ctx.save();
      const anchorY = FLOOR_Y + yShift;
      // Pure integer transform: anchor to feet, scale, undo translate.
      ctx.translate(c.approachX, anchorY);
      ctx.scale(scale, scale);
      ctx.translate(-c.approachX, -anchorY);

      drawCompanionFront(
        ctx,
        c,
        c.approachX,
        anchorY + bobY,
        walkPhase
      );

      // Override eyes to "closed" if blinking
      if (blinking) {
        const bodyX = Math.round(c.approachX - 9);
        const bodyY = Math.round(anchorY + bobY - 13);
        ctx.fillStyle = (c.variant.kind === 'solid'
          ? c.variant.color
          : c.variant.base) as string;
        ctx.fillRect(bodyX + 3, bodyY + 3, 3, 4);
        ctx.fillRect(bodyX + 12, bodyY + 3, 3, 4);
        ctx.fillStyle = COLORS.black;
        ctx.fillRect(bodyX + 3, bodyY + 5, 3, 1);
        ctx.fillRect(bodyX + 12, bodyY + 5, 3, 1);
      }

      ctx.restore();
    } else if (c.activity === 'wheeling') {
      // Mouse positioned inside the wheel, legs animated fast
      const wheelBodyY = WHEEL_HUB_Y - BODY_H / 2;
      // Override draw position with wheel hub
      const wheelMouseY = Math.round(WHEEL_HUB_Y + BODY_H / 2 - 1);
      // Draw mouse compressed inside the wheel ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(WHEEL_X, WHEEL_HUB_Y, WHEEL_RADIUS - 1, 0, Math.PI * 2);
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
