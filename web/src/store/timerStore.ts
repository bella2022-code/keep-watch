/**
 * Timer state store · Zustand
 *
 * Manages the focus session lifecycle:
 *   idle (setting time) → focusing → completing → idle
 *
 * `setMinutes` is the picker value (shown on the card while idle).
 * `sessionTotalMs` is the actual session length used during focus
 *   (normally = setMinutes * 60 * 1000, but debug sessions override).
 */

import { create } from 'zustand';

export type Phase = 'idle' | 'focusing' | 'completing';

interface TimerState {
  phase: Phase;
  setMinutes: number;
  sessionTotalMs: number;
  remainingMs: number;
  startedAt: number;
  completionStartedAt: number;

  adjustMinutes: (delta: number) => void;
  start: () => void;
  startDebug: (seconds: number) => void;
  tick: (now: number) => void;
  complete: () => void;
  cancel: () => void;
}

const MIN_MINUTES = 5;
const MAX_MINUTES = 180;
const STEP_MINUTES = 5;

export const useTimerStore = create<TimerState>((set, get) => ({
  phase: 'idle',
  setMinutes: 25,
  sessionTotalMs: 0,
  remainingMs: 0,
  startedAt: 0,
  completionStartedAt: 0,

  adjustMinutes: (delta) => {
    if (get().phase !== 'idle') return;
    const next = get().setMinutes + delta * STEP_MINUTES;
    const clamped = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, next));
    set({ setMinutes: clamped });
  },

  start: () => {
    if (get().phase !== 'idle') return;
    const ms = get().setMinutes * 60 * 1000;
    set({
      phase: 'focusing',
      sessionTotalMs: ms,
      remainingMs: ms,
      startedAt: performance.now(),
    });
  },

  /** Debug-only: start a short test session bypassing the picker. */
  startDebug: (seconds) => {
    if (get().phase !== 'idle') return;
    const ms = seconds * 1000;
    set({
      phase: 'focusing',
      sessionTotalMs: ms,
      remainingMs: ms,
      startedAt: performance.now(),
    });
  },

  tick: (now) => {
    const { phase, startedAt, sessionTotalMs } = get();
    if (phase !== 'focusing') return;
    const elapsed = now - startedAt;
    const remaining = Math.max(0, sessionTotalMs - elapsed);
    set({ remainingMs: remaining });
    if (remaining === 0) {
      set({ phase: 'completing', completionStartedAt: now });
    }
  },

  complete: () => {
    set({ phase: 'idle', remainingMs: 0, completionStartedAt: 0, sessionTotalMs: 0 });
  },

  cancel: () => {
    set({ phase: 'idle', remainingMs: 0, completionStartedAt: 0, sessionTotalMs: 0 });
  },
}));
