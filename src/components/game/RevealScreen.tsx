"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { pickRevealPhrase } from "@/lib/game";
import { useGameStore } from "@/lib/store/game-store";
import type { Category } from "@/types/game";

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
    <div className="flex flex-1 flex-col items-center justify-center gap-12 p-6 text-center">
      <p aria-live="polite" className="text-muted-foreground text-2xl font-medium">
        {phrase}
      </p>

      <div className="flex min-h-32 items-center justify-center">
        <AnimatePresence>
          {revealed && (
            <motion.h2
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              aria-live="assertive"
              className="text-foreground line-clamp-2 max-w-md text-[clamp(2rem,9vw,3.5rem)] leading-tight font-extrabold"
            >
              {category.name}
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      {revealed && (
        <Button
          ref={startButtonRef}
          size="lg"
          onClick={onStart}
          className="min-h-14 w-full max-w-sm text-lg font-semibold"
        >
          Iniciar timer
        </Button>
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
