"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";

import { useGameStore, URGENT_THRESHOLD_SECONDS } from "@/lib/store/game-store";
import { playTimeUp } from "@/lib/sound";
import { cn } from "@/lib/utils";

import { GameButton } from "./GameButton";

/** Formats seconds as M:SS for the countdown display. */
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Countdown screen with pause/resume and a path to the answer key. */
export function TimerScreen() {
  const category = useGameStore((state) => state.category);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const isRunning = useGameStore((state) => state.isRunning);
  const duration = useGameStore((state) => state.preferences.duration);
  const toggleRunning = useGameStore((state) => state.toggleRunning);
  const tick = useGameStore((state) => state.tick);
  const revealGabarito = useGameStore((state) => state.revealGabarito);
  const soundEnabled = useGameStore((state) => state.preferences.soundEnabled);

  // Drive the countdown while running.
  React.useEffect(() => {
    if (!isRunning) {
      return;
    }
    const interval = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(interval);
  }, [isRunning, tick]);

  // React to the timer hitting zero: buzz + vibrate.
  const reachedZero = timeLeft === 0;
  React.useEffect(() => {
    if (!reachedZero) {
      return;
    }
    if (soundEnabled) {
      playTimeUp();
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(400);
    }
  }, [reachedZero, soundEnabled]);

  const urgent = timeLeft <= URGENT_THRESHOLD_SECONDS;
  const progress = duration > 0 ? timeLeft / duration : 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-8 p-6">
      <span className="text-party-muted mt-4 max-w-md rounded-full bg-white/10 px-4 py-1.5 text-center text-sm font-semibold ring-1 ring-white/15">
        {category?.name}
      </span>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <motion.div
          animate={reachedZero ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={reachedZero ? { repeat: Infinity, duration: 0.8 } : { duration: 0.2 }}
          className={cn(
            "flex size-64 items-center justify-center rounded-full ring-8 transition-colors sm:size-72",
            urgent ? "bg-party-pink/15 ring-party-pink/60" : "bg-party-cyan/10 ring-party-cyan/50",
          )}
        >
          <span
            aria-live="off"
            className={cn(
              "font-mono text-[clamp(4rem,22vw,7rem)] leading-none font-bold tabular-nums",
              urgent ? "text-party-pink" : "text-white",
            )}
          >
            {formatTime(timeLeft)}
          </span>
        </motion.div>

        {/* Progress bar mirroring the remaining fraction. */}
        <div className="h-2.5 w-56 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className={cn("h-full rounded-full", urgent ? "bg-party-pink" : "bg-party-cyan")}
            animate={{ width: `${progress * 100}%` }}
            transition={{ ease: "linear", duration: 0.3 }}
          />
        </div>

        {!isRunning && timeLeft > 0 && (
          <span className="font-heading text-party-amber text-lg font-semibold">Pausado</span>
        )}
        {/* Announced once for screen readers when the countdown ends. */}
        <span aria-live="assertive" className="sr-only">
          {reachedZero ? "Tempo esgotado" : ""}
        </span>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <GameButton
          variant="ghost"
          size="md"
          onClick={toggleRunning}
          disabled={timeLeft === 0}
          aria-label={isRunning ? "Pausar contagem" : "Retomar contagem"}
        >
          {isRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {isRunning ? "Pausar" : "Retomar"}
        </GameButton>
        <GameButton
          variant="amber"
          size="lg"
          onClick={revealGabarito}
          className={cn(reachedZero && "animate-pulse")}
        >
          Revelar gabarito
        </GameButton>
      </div>
    </div>
  );
}
