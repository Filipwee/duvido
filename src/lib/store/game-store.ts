import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { pickCategory } from "@/lib/game";
import type { Category, Preferences, Screen, TimerDuration } from "@/types/game";

const DEFAULT_PREFERENCES: Preferences = {
  duration: 60,
  soundEnabled: true,
};

/** Threshold (in seconds) below which the timer turns dramatic (visual + sound). */
export const URGENT_THRESHOLD_SECONDS = 15;

interface GameState {
  /** Currently rendered screen. */
  screen: Screen;
  /** Category drawn for the current round, or null before the first draw. */
  category: Category | null;
  /** User preferences (persisted to localStorage). */
  preferences: Preferences;
  /** Remaining seconds on the countdown. */
  timeLeft: number;
  /** Whether the countdown is actively decrementing. */
  isRunning: boolean;
  /** True once the persisted store has rehydrated on the client. */
  hasHydrated: boolean;

  /** Draws a new category (avoiding an immediate repeat) and shows the reveal. */
  drawCategory: () => void;
  /** Starts the countdown from the configured duration and shows the timer. */
  startTimer: () => void;
  /** Pauses or resumes the running countdown. */
  toggleRunning: () => void;
  /** Decrements the countdown by one second, stopping at zero. */
  tick: () => void;
  /** Reveals the answer key for the current category. */
  revealGabarito: () => void;
  /** Returns to the home screen, keeping preferences. */
  goHome: () => void;
  /** Updates the timer duration preference. */
  setDuration: (duration: TimerDuration) => void;
  /** Toggles sound effects on/off. */
  toggleSound: () => void;
  /** Marks the store as rehydrated. */
  setHasHydrated: (value: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "home",
      category: null,
      preferences: DEFAULT_PREFERENCES,
      timeLeft: DEFAULT_PREFERENCES.duration,
      isRunning: false,
      hasHydrated: false,

      drawCategory: () => {
        const current = get().category;
        const category = pickCategory({ excludeName: current?.name });
        set({ screen: "reveal", category });
      },

      startTimer: () => {
        set({
          screen: "timer",
          timeLeft: get().preferences.duration,
          isRunning: true,
        });
      },

      toggleRunning: () => {
        if (get().timeLeft <= 0) {
          return;
        }
        set((state) => ({ isRunning: !state.isRunning }));
      },

      tick: () => {
        const { timeLeft } = get();
        if (timeLeft <= 0) {
          return;
        }
        const next = timeLeft - 1;
        set({
          timeLeft: next,
          isRunning: next > 0,
        });
      },

      revealGabarito: () => {
        set({ screen: "gabarito", isRunning: false });
      },

      goHome: () => {
        set({ screen: "home", isRunning: false });
      },

      setDuration: (duration) => {
        set((state) => ({
          preferences: { ...state.preferences, duration },
          // Reflect the new duration immediately while idle on home.
          timeLeft: state.screen === "home" ? duration : state.timeLeft,
        }));
      },

      toggleSound: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            soundEnabled: !state.preferences.soundEnabled,
          },
        }));
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "duvido-preferences",
      storage: createJSONStorage(() => localStorage),
      // Only preferences are persisted; round/timer state is volatile.
      partialize: (state) => ({ preferences: state.preferences }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
