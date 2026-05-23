/**
 * Timer state store · Zustand
 *
 * Manages the focus session lifecycle:
 *   idle (setting time) → focusing → idle (after completion)
 *
 * Time is stored in minutes for the setup card,
 * and in seconds when actively counting down.
 */

import { create } from 'zustand';

export type Phase = 'idle' | 'focusing' | 'completing';

interface TimerState {
  phase: Phase;
  setMinutes: number; // What's shown on the card (5 to 180 in steps of 5)
  remainingMs: number; // Time remaining when focusing
  startedAt: number; // performance.now() when focus started

  // Actions
  adjustMinutes: (delta: number) => void;
  start: () => void;
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
  remainingMs: 0,
  startedAt: 0,

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
      remainingMs: ms,
      startedAt: performance.now(),
    });
  },

  tick: (now) => {
    const { phase, startedAt, setMinutes } = get();
    if (phase !== 'focusing') return;
    const totalMs = setMinutes * 60 * 1000;
    const elapsed = now - startedAt;
    const remaining = Math.max(0, totalMs - elapsed);
    set({ remainingMs: remaining });
    if (remaining === 0) {
      set({ phase: 'completing' });
    }
  },

  complete: () => {
    set({ phase: 'idle', remainingMs: 0 });
  },

  cancel: () => {
    set({ phase: 'idle', remainingMs: 0 });
  },
}));
