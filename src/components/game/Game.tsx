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

/** Decorative blurred orbs that drift behind the game for a festive feel. */
function PartyBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <span className="party-blob animate-party-float bg-party-pink/40 top-10 -left-16 size-56" />
      <span className="party-blob animate-party-float bg-party-cyan/30 -right-12 bottom-24 size-64 [animation-delay:1.5s]" />
      <span className="party-blob animate-party-float bg-party-amber/20 top-1/2 left-1/3 size-48 [animation-delay:3s]" />
    </div>
  );
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
      <main className="relative flex min-h-dvh flex-col">
        <PartyBackdrop />
        <div className="relative z-10 flex flex-1 flex-col">
          <CurrentScreen />
        </div>
      </main>
    </ErrorBoundary>
  );
}
