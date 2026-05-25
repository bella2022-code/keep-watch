/**
 * Time-of-day tint system
 *
 * Applies a translucent color overlay over the entire canvas based on
 * the system clock. The user can manually override which period is shown
 * via the sidebar (Auto / Morning / Day / Dusk / Night / Deep Night).
 *
 * Spec: docs/01-visual-system.md §1.6
 *
 * Periods:
 *   Morning    06:00–10:00   warm yellow tint
 *   Day        10:00–17:00   neutral
 *   Dusk       17:00–19:00   warm orange tint
 *   Night      19:00–22:00   cool blue + slight darken
 *   Deep Night 22:00–06:00   cool blue + strong darken
 */

import { NATIVE_WIDTH, NATIVE_HEIGHT } from './canvas';

export type Period =
  | 'morning'
  | 'day'
  | 'dusk'
  | 'night'
  | 'deep_night'
  // Mood overlays — fixed atmospheric tints, not tied to system clock
  | 'warm'
  | 'cool'
  | 'sepia';

interface TintConfig {
  /** Color overlay rgba */
  r: number;
  g: number;
  b: number;
  a: number;
}

const TINT_BY_PERIOD: Record<Period, TintConfig> = {
  morning:    { r: 244, g: 200, b: 130, a: 0.08 }, // warm yellow
  day:        { r:   0, g:   0, b:   0, a: 0.00 }, // neutral
  dusk:       { r: 232, g: 144, b:  96, a: 0.16 }, // warm orange
  night:      { r:  30, g:  50, b:  90, a: 0.32 }, // cool deep blue
  deep_night: { r:  18, g:  32, b:  72, a: 0.50 }, // navy
  // Mood overlays (fixed regardless of clock)
  warm:       { r: 244, g: 175, b: 100, a: 0.18 }, // warm amber
  cool:       { r: 130, g: 160, b: 200, a: 0.22 }, // cool blue-grey
  sepia:      { r: 165, g: 120, b:  75, a: 0.20 }, // sepia
};

/** Determine the period from the system clock. */
export function getCurrentPeriod(date: Date = new Date()): Period {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 6 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 19) return 'dusk';
  if (h >= 19 && h < 22) return 'night';
  return 'deep_night';
}

/**
 * Returns the tint config with crossfade across period boundaries.
 * Within `CROSSFADE_MIN` minutes of a boundary, the tint interpolates
 * between the two adjacent periods.
 */
const CROSSFADE_MIN = 30;

export function getTintForTime(date: Date = new Date()): TintConfig {
  const totalMin = date.getHours() * 60 + date.getMinutes();
  // Boundaries (in minutes since midnight)
  const boundaries: { time: number; from: Period; to: Period }[] = [
    { time: 6 * 60, from: 'deep_night', to: 'morning' },
    { time: 10 * 60, from: 'morning', to: 'day' },
    { time: 17 * 60, from: 'day', to: 'dusk' },
    { time: 19 * 60, from: 'dusk', to: 'night' },
    { time: 22 * 60, from: 'night', to: 'deep_night' },
  ];

  for (const b of boundaries) {
    const diff = totalMin - b.time;
    if (Math.abs(diff) <= CROSSFADE_MIN) {
      // Crossfade window: -CROSSFADE_MIN to +CROSSFADE_MIN around boundary
      const t = (diff + CROSSFADE_MIN) / (2 * CROSSFADE_MIN); // 0..1
      const a = TINT_BY_PERIOD[b.from];
      const b2 = TINT_BY_PERIOD[b.to];
      return {
        r: a.r * (1 - t) + b2.r * t,
        g: a.g * (1 - t) + b2.g * t,
        b: a.b * (1 - t) + b2.b * t,
        a: a.a * (1 - t) + b2.a * t,
      };
    }
  }

  return TINT_BY_PERIOD[getCurrentPeriod(date)];
}

/** Apply the tint as an overlay rectangle covering the whole canvas. */
export function applyTint(
  ctx: CanvasRenderingContext2D,
  tint: TintConfig
) {
  if (tint.a <= 0.001) return;
  ctx.fillStyle = `rgba(${Math.round(tint.r)},${Math.round(tint.g)},${Math.round(tint.b)},${tint.a})`;
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
}

/** Compute the effective tint considering user override. */
export function resolveTint(override: Period | 'auto', date: Date = new Date()): TintConfig {
  if (override === 'auto') {
    return getTintForTime(date);
  }
  return TINT_BY_PERIOD[override];
}
