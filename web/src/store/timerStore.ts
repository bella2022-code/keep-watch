/**
 * Timer state store · Zustand
 *
 * Two modes:
 *   - Timer:    single session of N minutes → completing → idle
 *   - Pomodoro: N cycles of (work → rest), final completion at end of last work
 *
 * Mode is toggled by tapping the card's fold corner ("flipping" it).
 */

import { create } from 'zustand';
import { useUserStateStore } from './userStateStore';
import { playClack } from '../core/sound';

export type Phase = 'idle' | 'focusing' | 'completing' | 'revealing';
export type Mode = 'timer' | 'pomodoro';
export type Segment = 'work' | 'rest';
export type RevealCharacter = 'goldfish' | 'astronaut' | 'officer';

interface TimerState {
  mode: Mode;
  phase: Phase;
  flipProgress: number; // 0..1 during card flip animation; 0 otherwise
  flipDirection: 'to-pomodoro' | 'to-timer' | null;

  // Timer mode
  setMinutes: number;

  // Pomodoro mode
  workMinutes: number;
  restMinutes: number;
  totalCycles: number;
  currentCycle: number; // 1..totalCycles
  currentSegment: Segment;

  // Active session
  sessionTotalMs: number; // length of the current segment / Timer session
  remainingMs: number;
  startedAt: number;
  /** Accumulated focused (work) time across the Pomodoro round, for recording. */
  accumulatedWorkMs: number;

  // Completion / Reveal
  completionStartedAt: number;
  revealStartedAt: number;
  revealCharacter: RevealCharacter | null;

  // Actions
  adjustMinutes: (delta: number) => void;
  flipMode: () => void;
  start: () => void;
  startDebug: (seconds: number) => void;
  tick: (now: number) => void;
  complete: () => void;
  cancel: () => void;
  startReveal: (character: RevealCharacter) => void;
  finishReveal: () => void;
}

const MIN_MINUTES = 5;
const MAX_MINUTES = 180;
const STEP_MINUTES = 5;
const FLIP_DURATION_MS = 350;

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'timer',
  phase: 'idle',
  flipProgress: 0,
  flipDirection: null,

  setMinutes: 25,

  workMinutes: 25,
  restMinutes: 5,
  totalCycles: 4,
  currentCycle: 1,
  currentSegment: 'work',

  sessionTotalMs: 0,
  remainingMs: 0,
  startedAt: 0,
  accumulatedWorkMs: 0,

  completionStartedAt: 0,
  revealStartedAt: 0,
  revealCharacter: null,

  adjustMinutes: (delta) => {
    if (get().phase !== 'idle') return;
    if (get().mode === 'timer') {
      const next = get().setMinutes + delta * STEP_MINUTES;
      set({
        setMinutes: Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, next)),
      });
    } else {
      // Pomodoro: adjust cycle count by 1
      const next = get().totalCycles + delta;
      set({ totalCycles: Math.max(1, Math.min(8, next)) });
    }
  },

  flipMode: () => {
    const { phase, mode } = get();
    if (phase !== 'idle') return;
    if (get().flipProgress > 0) return; // already flipping
    set({
      flipProgress: 0.001, // signal start; render loop will animate
      flipDirection: mode === 'timer' ? 'to-pomodoro' : 'to-timer',
    });
    const startMs = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startMs;
      const p = Math.min(1, elapsed / FLIP_DURATION_MS);
      set({ flipProgress: p });
      if (p < 0.5) {
        // approach edge-on (no content swap yet)
      } else if (get().mode === (get().flipDirection === 'to-pomodoro' ? 'timer' : 'pomodoro')) {
        // Swap mode at midpoint (back face revealed)
        set({ mode: get().flipDirection === 'to-pomodoro' ? 'pomodoro' : 'timer' });
      }
      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        set({ flipProgress: 0, flipDirection: null });
      }
    };
    requestAnimationFrame(animate);
  },

  start: () => {
    if (get().phase !== 'idle') return;
    const s = get();
    if (s.mode === 'timer') {
      const ms = s.setMinutes * 60 * 1000;
      set({
        phase: 'focusing',
        sessionTotalMs: ms,
        remainingMs: ms,
        startedAt: performance.now(),
        accumulatedWorkMs: 0,
        currentCycle: 1,
        currentSegment: 'work',
      });
    } else {
      // Pomodoro: start first work segment
      const ms = s.workMinutes * 60 * 1000;
      set({
        phase: 'focusing',
        sessionTotalMs: ms,
        remainingMs: ms,
        startedAt: performance.now(),
        accumulatedWorkMs: 0,
        currentCycle: 1,
        currentSegment: 'work',
      });
    }
  },

  startDebug: (seconds) => {
    if (get().phase !== 'idle') return;
    const ms = seconds * 1000;
    set({
      phase: 'focusing',
      sessionTotalMs: ms,
      remainingMs: ms,
      startedAt: performance.now(),
      accumulatedWorkMs: 0,
      currentCycle: 1,
      currentSegment: 'work',
    });
  },

  tick: (now) => {
    const s = get();
    if (s.phase !== 'focusing') return;
    const elapsed = now - s.startedAt;
    const remaining = Math.max(0, s.sessionTotalMs - elapsed);
    set({ remainingMs: remaining });
    if (remaining > 0) return;

    // Segment / session ended
    if (s.mode === 'timer') {
      const durationSec = s.sessionTotalMs / 1000;
      useUserStateStore.getState().recordSession(durationSec, true, 'timer');
      set({ phase: 'completing', completionStartedAt: now });
      return;
    }

    // Pomodoro mode
    if (s.currentSegment === 'work') {
      const workMs = s.sessionTotalMs;
      const newAccumulated = s.accumulatedWorkMs + workMs;

      if (s.currentCycle >= s.totalCycles) {
        // Final work segment done — record and complete
        useUserStateStore.getState().recordSession(
          newAccumulated / 1000,
          true,
          'pomodoro'
        );
        set({
          phase: 'completing',
          completionStartedAt: now,
          accumulatedWorkMs: newAccumulated,
        });
      } else {
        // Switch to rest segment — segment-end clack only
        playClack();
        const restMs = s.restMinutes * 60 * 1000;
        set({
          currentSegment: 'rest',
          sessionTotalMs: restMs,
          remainingMs: restMs,
          startedAt: now,
          accumulatedWorkMs: newAccumulated,
        });
      }
    } else {
      // Rest segment ended — next cycle, work segment. Clack only.
      playClack();
      const workMs = s.workMinutes * 60 * 1000;
      set({
        currentSegment: 'work',
        currentCycle: s.currentCycle + 1,
        sessionTotalMs: workMs,
        remainingMs: workMs,
        startedAt: now,
      });
    }
  },

  complete: () => {
    const userState = useUserStateStore.getState();
    if (
      userState.completions.timer_count >= 1 &&
      !userState.unlocks.goldfish.unlocked
    ) {
      set({
        phase: 'revealing',
        revealStartedAt: performance.now(),
        revealCharacter: 'goldfish',
        remainingMs: 0,
        completionStartedAt: 0,
        sessionTotalMs: 0,
      });
      return;
    }
    if (
      userState.completions.pomodoro_count >= 1 &&
      !userState.unlocks.astronaut.unlocked
    ) {
      set({
        phase: 'revealing',
        revealStartedAt: performance.now(),
        revealCharacter: 'astronaut',
        remainingMs: 0,
        completionStartedAt: 0,
        sessionTotalMs: 0,
      });
      return;
    }
    set({
      phase: 'idle',
      remainingMs: 0,
      completionStartedAt: 0,
      sessionTotalMs: 0,
    });
  },

  cancel: () => {
    const s = get();
    if (s.phase === 'focusing') {
      let elapsedSec: number;
      if (s.mode === 'timer') {
        elapsedSec = (performance.now() - s.startedAt) / 1000;
      } else {
        // For Pomodoro: count accumulated + current segment if it's work
        let totalMs = s.accumulatedWorkMs;
        if (s.currentSegment === 'work') {
          totalMs += performance.now() - s.startedAt;
        }
        elapsedSec = totalMs / 1000;
      }
      useUserStateStore
        .getState()
        .recordSession(elapsedSec, false, s.mode);
    }
    set({
      phase: 'idle',
      remainingMs: 0,
      completionStartedAt: 0,
      sessionTotalMs: 0,
      revealStartedAt: 0,
      revealCharacter: null,
      accumulatedWorkMs: 0,
      currentCycle: 1,
      currentSegment: 'work',
    });
  },

  startReveal: (character) => {
    set({
      phase: 'revealing',
      revealStartedAt: performance.now(),
      revealCharacter: character,
      remainingMs: 0,
      completionStartedAt: 0,
      sessionTotalMs: 0,
    });
  },

  finishReveal: () => {
    const { revealCharacter } = get();
    if (revealCharacter) {
      useUserStateStore.getState().unlockCharacter(revealCharacter);
    }
    set({
      phase: 'idle',
      revealStartedAt: 0,
      revealCharacter: null,
    });
  },
}));
