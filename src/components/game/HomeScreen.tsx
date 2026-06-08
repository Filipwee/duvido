"use client";

import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store/game-store";
import { playClick } from "@/lib/sound";

import { PreferencesDialog } from "./PreferencesDialog";

/** Landing screen: app title and the primary "draw a category" action. */
export function HomeScreen() {
  const drawCategory = useGameStore((state) => state.drawCategory);
  const soundEnabled = useGameStore((state) => state.preferences.soundEnabled);

  const handleDraw = (): void => {
    if (soundEnabled) {
      playClick();
    }
    drawCategory();
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-foreground text-6xl font-extrabold tracking-tight">Duvido!</h1>
        <p className="text-muted-foreground max-w-xs text-lg">
          Passe o celular e desafie seus amigos
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <Button size="lg" onClick={handleDraw} className="min-h-14 w-full text-lg font-semibold">
          Sortear categoria
        </Button>
        <PreferencesDialog />
      </div>
    </div>
  );
}
