/**
 * Goldfish reveal cinematic
 *
 * Triggered on the user's first completed Timer session.
 * ~16 seconds total. Per docs/05-onboarding.md §5.4.
 *
 *   0.0–1.5s   fade-out: Mouse Cage fades to black
 *   1.5–3.0s   silhouette: Fish Tank silhouette appears in black
 *   3.0–5.5s   goldfish-enter: Goldfish swims in from edge to center
 *   5.5–7.0s   goldfish-pause: Goldfish stops, turns to break 4th wall
 *   7.0–8.0s   card-rise: Sign pops out above Goldfish
 *   8.0–11.0s  card-display: Sign reads "*blub*"
 *  11.0–13.5s  scene-fill: Fish Tank fills with color (radial)
 *  13.5–15.0s  hold: brief pause to take it in
 *  15.0–16.0s  return: cut back to Mouse Cage
 */

export type RevealPhase =
  | 'fade-out'
  | 'silhouette'
  | 'goldfish-enter'
  | 'goldfish-pause'
  | 'card-rise'
  | 'card-display'
  | 'scene-fill'
  | 'hold'
  | 'return';

const TIMELINE: { phase: RevealPhase; duration: number }[] = [
  { phase: 'fade-out', duration: 1500 },
  { phase: 'silhouette', duration: 1500 },
  { phase: 'goldfish-enter', duration: 2500 },
  { phase: 'goldfish-pause', duration: 1500 },
  { phase: 'card-rise', duration: 1000 },
  { phase: 'card-display', duration: 3000 },
  { phase: 'scene-fill', duration: 2500 },
  { phase: 'hold', duration: 1500 },
  { phase: 'return', duration: 1000 },
];

export const REVEAL_TOTAL_MS = TIMELINE.reduce((sum, t) => sum + t.duration, 0);

export function getRevealPhase(elapsedMs: number): {
  phase: RevealPhase;
  progress: number;
} {
  let acc = 0;
  for (const item of TIMELINE) {
    if (elapsedMs < acc + item.duration) {
      return {
        phase: item.phase,
        progress: (elapsedMs - acc) / item.duration,
      };
    }
    acc += item.duration;
  }
  return { phase: 'return', progress: 1 };
}
