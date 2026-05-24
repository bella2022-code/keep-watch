/**
 * User State Store · persistent focus history
 *
 * Tracks the user's cumulative focus progress per the design spec
 * (schemas/user_state.json). Stored in localStorage so it survives
 * page reloads, browser restarts, and device sleeps.
 *
 * Philosophy (docs/06-data-stats.md §6.2):
 *   "All numbers represent 'cumulative' and 'owned'.
 *    Never 'lost' or 'broken'."
 *
 * - total_focus_seconds never decreases
 * - total_focus_days never decreases
 * - No streaks. No daily reset penalty.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STATE_VERSION = '1.0.0';
const MIN_RECORDED_SECONDS = 5; // ignore trivial < 5s sessions

interface Today {
  /** YYYY-MM-DD in local time */
  date: string;
  seconds: number;
}

interface Completions {
  timer_count: number;
  pomodoro_count: number;
  longest_session_seconds: number;
}

interface Unlock {
  unlocked: boolean;
  unlocked_at: string | null;
}

interface Unlocks {
  mouse: Unlock;
  goldfish: Unlock;
  astronaut: Unlock;
  officer: Unlock;
}

export type SceneName = 'mouse_cage' | 'fish_tank' | 'astronaut_space';

interface UserState {
  version: string;
  first_used_at: string | null;
  total_focus_seconds: number;
  total_focus_days: number;
  today: Today;
  completions: Completions;
  unlocks: Unlocks;
  currentScene: SceneName;

  recordSession: (
    durationSec: number,
    completed: boolean,
    mode: 'timer' | 'pomodoro'
  ) => void;

  /** Mark a character as unlocked. Persisted to localStorage. */
  unlockCharacter: (name: keyof Unlocks) => void;

  /** Switch the active scene. */
  setCurrentScene: (scene: SceneName) => void;

  /** Debug-only: re-lock a character so the reveal cinematic can be replayed. */
  relockCharacter: (name: keyof Unlocks) => void;

  /** Debug-only: clear all data. */
  reset: () => void;
}

/** YYYY-MM-DD string for "today" in the user's local timezone. */
function todayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const useUserStateStore = create<UserState>()(
  persist(
    (set, get) => ({
      version: STATE_VERSION,
      first_used_at: null,
      total_focus_seconds: 0,
      total_focus_days: 0,
      today: { date: todayDateStr(), seconds: 0 },
      completions: {
        timer_count: 0,
        pomodoro_count: 0,
        longest_session_seconds: 0,
      },
      unlocks: {
        mouse: { unlocked: true, unlocked_at: null },
        goldfish: { unlocked: false, unlocked_at: null },
        astronaut: { unlocked: false, unlocked_at: null },
        officer: { unlocked: false, unlocked_at: null },
      },
      currentScene: 'mouse_cage',

      setCurrentScene: (scene) => set({ currentScene: scene }),

      unlockCharacter: (name) => {
        const s = get();
        if (s.unlocks[name].unlocked) return;
        set({
          unlocks: {
            ...s.unlocks,
            [name]: { unlocked: true, unlocked_at: new Date().toISOString() },
          },
        });
      },

      relockCharacter: (name) => {
        const s = get();
        set({
          unlocks: {
            ...s.unlocks,
            [name]: { unlocked: false, unlocked_at: null },
          },
        });
      },

      recordSession: (durationSec, completed, mode) => {
        if (durationSec < MIN_RECORDED_SECONDS) return;

        const s = get();
        const now = new Date().toISOString();
        const todayStr = todayDateStr();

        // Detect date change since last activity
        let newToday: Today;
        let totalDaysDelta = 0;

        if (s.today.date !== todayStr) {
          // New day — first focus today increments total days
          newToday = { date: todayStr, seconds: durationSec };
          totalDaysDelta = 1;
        } else {
          // Same day
          newToday = {
            date: s.today.date,
            seconds: s.today.seconds + durationSec,
          };
          // If this is the first focus of today (seconds was 0), increment
          if (s.today.seconds === 0) {
            totalDaysDelta = 1;
          }
        }

        const newCompletions = { ...s.completions };
        if (completed) {
          if (mode === 'timer') newCompletions.timer_count += 1;
          else newCompletions.pomodoro_count += 1;
        }
        if (durationSec > s.completions.longest_session_seconds) {
          newCompletions.longest_session_seconds = Math.round(durationSec);
        }

        set({
          first_used_at: s.first_used_at ?? now,
          total_focus_seconds: s.total_focus_seconds + durationSec,
          total_focus_days: s.total_focus_days + totalDaysDelta,
          today: newToday,
          completions: newCompletions,
        });
      },

      reset: () => {
        set({
          first_used_at: null,
          total_focus_seconds: 0,
          total_focus_days: 0,
          today: { date: todayDateStr(), seconds: 0 },
          completions: {
            timer_count: 0,
            pomodoro_count: 0,
            longest_session_seconds: 0,
          },
          unlocks: {
            mouse: { unlocked: true, unlocked_at: null },
            goldfish: { unlocked: false, unlocked_at: null },
            astronaut: { unlocked: false, unlocked_at: null },
            officer: { unlocked: false, unlocked_at: null },
          },
        });
      },
    }),
    {
      name: 'keep-watch-user-state',
      // On rehydrate, check if today's date in storage is stale; if so,
      // reset today.seconds to 0 (but keep date current). The total_focus_days
      // counter only advances when a real session is recorded, so we don't
      // touch it here.
      onRehydrateStorage: () => (state) => {
        if (state && state.today.date !== todayDateStr()) {
          state.today = { date: todayDateStr(), seconds: 0 };
        }
      },
    }
  )
);

/** Convenience helper: human-readable "Xh Ym" string. */
export function formatHM(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0 && m === 0 && seconds > 0) return `${seconds}s`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
