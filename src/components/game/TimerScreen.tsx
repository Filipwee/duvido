"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGameStore, URGENT_THRESHOLD_SECONDS } from "@/lib/store/game-store";
import { playTimeUp } from "@/lib/sound";
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-8 p-6">
      <p className="text-muted-foreground max-w-md pt-4 text-center text-base font-medium">
        {category?.name}
      </p>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <motion.span
          aria-live="off"
          animate={reachedZero ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={reachedZero ? { repeat: Infinity, duration: 0.8 } : { duration: 0.2 }}
          className={cn(
            "font-mono text-[clamp(5rem,28vw,9rem)] leading-none font-bold tabular-nums",
            urgent ? "text-destructive" : "text-foreground",
          )}
        >
          {formatTime(timeLeft)}
        </motion.span>
        {!isRunning && timeLeft > 0 && (
          <span className="text-muted-foreground text-lg font-medium">Pausado</span>
        )}
        {/* Announced once for screen readers when the countdown ends. */}
        <span aria-live="assertive" className="sr-only">
          {reachedZero ? "Tempo esgotado" : ""}
        </span>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={toggleRunning}
          disabled={timeLeft === 0}
          aria-label={isRunning ? "Pausar contagem" : "Retomar contagem"}
          className="min-h-14 gap-2"
        >
          {isRunning ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {isRunning ? "Pausar" : "Retomar"}
        </Button>
        <Button
          size="lg"
          onClick={revealGabarito}
          className={cn("min-h-14 text-lg font-semibold", reachedZero && "animate-pulse")}
        >
          Revelar gabarito
        </Button>
      </div>
    </div>
  );
}
