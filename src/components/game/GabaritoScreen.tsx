"use client";

import { motion } from "framer-motion";

import { useGameStore } from "@/lib/store/game-store";

import { Confetti } from "./Confetti";
import { GameButton } from "./GameButton";

/** Accent colors cycled across the answer chips for a playful look. */
const CHIP_ACCENTS = [
  "bg-party-pink/20 ring-party-pink/40",
  "bg-party-cyan/20 ring-party-cyan/40",
  "bg-party-amber/20 ring-party-amber/40",
  "bg-party-purple/25 ring-party-purple/50",
];

/** Answer-key screen: lists the official answers and offers what to do next. */
export function GabaritoScreen() {
  const category = useGameStore((state) => state.category);
  const drawCategory = useGameStore((state) => state.drawCategory);
  const goHome = useGameStore((state) => state.goHome);

  if (category === null) {
    return null;
  }

  const hasAnswers = category.answers.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      {hasAnswers && <Confetti />}

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-40">
        <header className="mb-6 text-center">
          <span className="text-party-amber text-xs font-bold tracking-[0.2em] uppercase">
            Gabarito oficial
          </span>
          <h2 className="font-heading mt-1 text-4xl font-bold text-white">{category.name}</h2>
        </header>

        {hasAnswers ? (
          <ul aria-live="polite" className="mx-auto flex max-w-md flex-col gap-2.5">
            {category.answers.map((answer, index) => (
              <motion.li
                key={answer}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.5) }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-lg font-medium text-white ring-2 backdrop-blur ${CHIP_ACCENTS[index % CHIP_ACCENTS.length]}`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold tabular-nums">
                  {index + 1}
                </span>
                {answer}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p aria-live="polite" className="text-party-muted mx-auto max-w-md text-center">
            Nenhuma resposta cadastrada para esta categoria.
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center border-t border-white/10 bg-purple-950/70 p-4 backdrop-blur-md">
        <div className="flex w-full max-w-sm flex-col gap-3">
          <GameButton variant="amber" size="lg" onClick={drawCategory}>
            Nova categoria
          </GameButton>
          <GameButton variant="ghost" size="md" onClick={goHome}>
            Início
          </GameButton>
        </div>
      </div>
    </div>
  );
}
