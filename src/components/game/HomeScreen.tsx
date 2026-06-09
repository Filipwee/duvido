"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { categoryCount } from "@/lib/game";
import { useGameStore } from "@/lib/store/game-store";
import { playClick } from "@/lib/sound";

import { GameButton } from "./GameButton";
import { PreferencesDialog } from "./PreferencesDialog";

const TOTAL_CATEGORIES = categoryCount();

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
    <div className="flex flex-1 flex-col items-center justify-center gap-12 p-6 text-center">
      <div className="absolute top-4 right-4">
        <PreferencesDialog />
      </div>

      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: -3 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        className="flex flex-col items-center gap-4"
      >
        <span className="bg-party-amber inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-semibold text-purple-950 shadow-lg">
          <Sparkles className="size-4" aria-hidden="true" />
          {TOTAL_CATEGORIES} categorias
        </span>
        <h1 className="font-heading text-7xl font-bold tracking-tight text-white drop-shadow-[0_4px_0_rgba(168,85,247,0.6)] sm:text-8xl">
          Duvido!
        </h1>
        <p className="text-party-muted max-w-xs text-lg font-medium">
          Passe o celular e desafie seus amigos
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex w-full max-w-sm flex-col items-center gap-5"
      >
        <GameButton variant="amber" size="lg" onClick={handleDraw}>
          Sortear categoria
        </GameButton>
        <p className="text-party-muted/80 text-sm">
          Sorteie · cronometre · grite <span className="text-party-pink font-bold">DUVIDO!</span>
        </p>
      </motion.div>
    </div>
  );
}
