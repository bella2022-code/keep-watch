/**
 * Completion sequence orchestrator
 *
 * When the timer reaches 0, plays the per-scene completion cinematic.
 * For the Mouse Cage scene the sequence is (spec: docs/05-onboarding.md §5.9):
 *
 *   1. Focus UI fades out (0.5s)
 *   2. Mouse walks in from random side (1.5s)
 *   3. Pauses briefly (0.3s)
 *   4. Pulls out card with text (0.5s pop in)
 *   5. Card displays encouragement text (2.5s)
 *   6. Mouse waves (0.8s)
 *   7. Walks out the other side (1.5s)
 *   8. Empty scene (0.5s)
 *   9. Return to idle phase (handled by timer store)
 *
 * Total: ~8 seconds.
 */

export type CompletionPhase =
  | 'fadeout'
  | 'walking-in'
  | 'pause-before-card'
  | 'card-rising'
  | 'card-displayed'
  | 'card-lowering-wave'
  | 'walking-out'
  | 'empty';

interface PhaseInfo {
  phase: CompletionPhase;
  /** Progress within the phase, 0..1 */
  progress: number;
}

const TIMELINE: { phase: CompletionPhase; duration: number }[] = [
  { phase: 'fadeout', duration: 500 },
  { phase: 'walking-in', duration: 1500 },
  { phase: 'pause-before-card', duration: 300 },
  { phase: 'card-rising', duration: 500 },
  { phase: 'card-displayed', duration: 4000 },
  { phase: 'card-lowering-wave', duration: 800 },
  { phase: 'walking-out', duration: 1500 },
  { phase: 'empty', duration: 500 },
];

export const COMPLETION_TOTAL_MS = TIMELINE.reduce(
  (sum, t) => sum + t.duration,
  0
);

export function getCompletionPhase(elapsedMs: number): PhaseInfo {
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
  return { phase: 'empty', progress: 1 };
}

/**
 * Returns Mouse x position during completion.
 * Walks in from a random side, stops at center, walks out the other side.
 *
 * direction = 1 means entered from left moving right (will exit right)
 * direction = -1 means entered from right moving left (will exit left)
 */
export function getMouseX(
  centerX: number,
  direction: 1 | -1,
  phase: CompletionPhase,
  progress: number
): number {
  const offscreen = direction === 1 ? -20 : 500;
  const exitX = direction === 1 ? 500 : -20;

  if (phase === 'fadeout') {
    // Mouse is not yet on screen
    return offscreen;
  }
  if (phase === 'walking-in') {
    return Math.round(offscreen + (centerX - offscreen) * progress);
  }
  if (phase === 'walking-out') {
    return Math.round(centerX + (exitX - centerX) * progress);
  }
  if (phase === 'empty') {
    return exitX;
  }
  return centerX;
}

/**
 * Returns Mouse "walk" frame index (0..3) for the walk loop.
 * Used to animate steps. Static for non-walking phases.
 */
export function getMouseWalkFrame(phase: CompletionPhase, elapsedMs: number): number {
  if (phase === 'walking-in' || phase === 'walking-out') {
    return Math.floor(elapsedMs / 100) % 4;
  }
  return 0;
}
