/**
 * Hints store · onboarding bubble dismissal
 *
 * Each hint is dismissed independently when the user performs the
 * corresponding action for the first time. Dismissed state is
 * persisted to localStorage so subsequent visits skip the hints.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HintsState {
  timeHintDismissed: boolean;
  startHintDismissed: boolean;
  dismissTimeHint: () => void;
  dismissStartHint: () => void;
  /** Debug-only: re-enable hints */
  resetAll: () => void;
}

export const useHintsStore = create<HintsState>()(
  persist(
    (set) => ({
      timeHintDismissed: false,
      startHintDismissed: false,
      dismissTimeHint: () => set({ timeHintDismissed: true }),
      dismissStartHint: () => set({ startHintDismissed: true }),
      resetAll: () =>
        set({ timeHintDismissed: false, startHintDismissed: false }),
    }),
    { name: 'keep-watch-hints' }
  )
);
