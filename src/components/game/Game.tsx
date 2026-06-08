"use client";

import { useGameStore } from "@/lib/store/game-store";

import { ErrorBoundary } from "./ErrorBoundary";
import { GabaritoScreen } from "./GabaritoScreen";
import { HomeScreen } from "./HomeScreen";
import { RevealScreen } from "./RevealScreen";
import { TimerScreen } from "./TimerScreen";

/** Renders the active screen for the current game state. */
function CurrentScreen() {
  const screen = useGameStore((state) => state.screen);
  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "reveal":
      return <RevealScreen />;
    case "timer":
      return <TimerScreen />;
    case "gabarito":
      return <GabaritoScreen />;
  }
}

/** Root game shell: gates render on store hydration to avoid SSR mismatch. */
export function Game() {
  const hasHydrated = useGameStore((state) => state.hasHydrated);

  // Until the persisted preferences rehydrate, render nothing to keep the
  // server and first client paint identical.
  if (!hasHydrated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <main className="bg-background flex min-h-dvh flex-col">
        <CurrentScreen />
      </main>
    </ErrorBoundary>
  );
}
