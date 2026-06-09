"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { pickRevealPhrase } from "@/lib/game";
import { useGameStore } from "@/lib/store/game-store";
import type { Category } from "@/types/game";

import { GameButton } from "./GameButton";

/** Delay before the category name appears, in milliseconds. */
const SUSPENSE_MS = 1500;

interface RevealContentProps {
  category: Category;
  onStart: () => void;
}

/** Runs the suspense → reveal sequence for a single category (remounted per draw). */
function RevealContent({ category, onStart }: RevealContentProps) {
  const startButtonRef = React.useRef<HTMLButtonElement>(null);
  const phrase = React.useMemo(() => pickRevealPhrase(), []);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setRevealed(true), SUSPENSE_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  React.useEffect(() => {
    if (revealed) {
      startButtonRef.current?.focus();
    }
  }, [revealed]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 p-6 text-center">
      <motion.p
        aria-live="polite"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: revealed ? 0 : Infinity }}
        className="font-heading text-party-muted text-2xl font-medium"
      >
        {phrase}
      </motion.p>

      <div className="flex min-h-44 w-full max-w-md items-center justify-center">
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -8, y: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: -2, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              className="from-party-pink to-party-purple w-full rounded-3xl bg-gradient-to-br p-8 shadow-[0_10px_0_rgba(0,0,0,0.25)] ring-4 ring-white/20"
            >
              <span className="mb-2 block text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
                A categoria é
              </span>
              <h2
                aria-live="assertive"
                className="font-heading line-clamp-3 text-[clamp(2rem,8vw,3.25rem)] leading-tight font-bold text-white"
              >
                {category.name}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {revealed && (
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <GameButton ref={startButtonRef} variant="cyan" size="lg" onClick={onStart}>
            Iniciar timer
          </GameButton>
        </motion.div>
      )}
    </div>
  );
}

/** Suspense screen: shows a teaser phrase, then reveals the drawn category. */
export function RevealScreen() {
  const category = useGameStore((state) => state.category);
  const startTimer = useGameStore((state) => state.startTimer);

  if (category === null) {
    return null;
  }

  // Keyed by name so each draw restarts the suspense from scratch.
  return <RevealContent key={category.name} category={category} onStart={startTimer} />;
}
