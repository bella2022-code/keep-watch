/**
 * Settings Store · Persistent UI preferences
 *
 * Volume, theme, language. All persisted to localStorage so settings
 * follow the user across sessions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setMasterVolume } from '../core/sound';
import type { Period } from '../core/tint';

export type Theme = 'classic' | 'cheese_sky' | 'mint_choco' | 'sakura';
export type Language = 'zh' | 'en';
export type BackgroundMode = 'auto' | Period;

interface SettingsState {
  /** 0..100 */
  volume: number;
  muted: boolean;
  /** Previous non-zero volume — used to restore from mute */
  previousVolume: number;
  theme: Theme;
  language: Language;
  /** Time-of-day tint mode. 'auto' follows the system clock; otherwise locked. */
  backgroundMode: BackgroundMode;

  setVolume: (v: number) => void;
  toggleMute: () => void;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setBackgroundMode: (m: BackgroundMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      volume: 60,
      muted: false,
      previousVolume: 60,
      theme: 'classic',
      language: 'zh',
      backgroundMode: 'auto',

      setVolume: (v) => {
        const clamped = Math.max(0, Math.min(100, v));
        set({ volume: clamped, muted: clamped === 0 });
        setMasterVolume(clamped / 100);
      },

      toggleMute: () => {
        const s = get();
        if (s.muted || s.volume === 0) {
          const restore = s.previousVolume > 0 ? s.previousVolume : 60;
          set({ volume: restore, muted: false });
          setMasterVolume(restore / 100);
        } else {
          set({ previousVolume: s.volume, volume: 0, muted: true });
          setMasterVolume(0);
        }
      },

      setTheme: (t) => set({ theme: t }),
      setLanguage: (l) => set({ language: l }),
      setBackgroundMode: (m) => set({ backgroundMode: m }),
    }),
    {
      name: 'keep-watch-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          setMasterVolume(state.muted ? 0 : state.volume / 100);
          // Migrate old theme values that no longer exist
          const validThemes: Theme[] = [
            'classic',
            'cheese_sky',
            'mint_choco',
            'sakura',
          ];
          if (!validThemes.includes(state.theme)) {
            state.theme = 'classic';
          }
        }
      },
    }
  )
);
