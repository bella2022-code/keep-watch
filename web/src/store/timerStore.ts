/**
 * Timer state store · Zustand
 *
 * idle → focusing → completing → (revealing) → idle
 *
 * On every transition out of focusing (either via timeout or cancel),
 * records the elapsed focus time to userStateStore.
 *
 * When a completion would unlock a character for the first time,
 * the orchestrator transitions into 'revealing' instead of 'idle'.
 */

import { create } from 'zustand';
import { useUserStateStore } from './userStateStore';

export type Phase = 'idle' | 'focusing' | 'completing' | 'revealing';
export type RevealCharacter = 'goldfish' | 'astronaut' | 'officer';

interface TimerState {
  phase: Phase;
  setMinutes: number;
  sessionTotalMs: number;
  remainingMs: number;
  startedAt: number;
  completionStartedAt: number;
  revealStartedAt: number;
  revealCharacter: RevealCharacter | null;

  adjustMinutes: (delta: number) => void;
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

export const useTimerStore = create<TimerState>((set, get) => ({
  phase: 'idle',
  setMinutes: 25,
  sessionTotalMs: 0,
  remainingMs: 0,
  startedAt: 0,
  completionStartedAt: 0,
  revealStartedAt: 0,
  revealCharacter: null,

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
      const durationSec = sessionTotalMs / 1000;
      useUserStateStore.getState().recordSession(durationSec, true, 'timer');
      set({ phase: 'completing', completionStartedAt: now });
    }
  },

  complete: () => {
    // Check if this completion just unlocked Goldfish
    const userState = useUserStateStore.getState();
    if (
      userState.completions.timer_count >= 1 &&
      !userState.unlocks.goldfish.unlocked
    ) {
      // Transition straight into the Goldfish reveal cinematic
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
    set({ phase: 'idle', remainingMs: 0, completionStartedAt: 0, sessionTotalMs: 0 });
  },

  cancel: () => {
    const { phase, startedAt } = get();
    if (phase === 'focusing') {
      const elapsedSec = (performance.now() - startedAt) / 1000;
      useUserStateStore.getState().recordSession(elapsedSec, false, 'timer');
    }
    set({
      phase: 'idle',
      remainingMs: 0,
      completionStartedAt: 0,
      sessionTotalMs: 0,
      revealStartedAt: 0,
      revealCharacter: null,
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
