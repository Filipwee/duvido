"use client";

import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store/game-store";

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
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        <header className="mb-6 text-center">
          <h2 className="text-foreground text-3xl font-extrabold">{category.name}</h2>
          <p className="text-muted-foreground text-sm">Gabarito oficial</p>
        </header>

        {hasAnswers ? (
          <ul aria-live="polite" className="mx-auto flex max-w-md flex-col gap-2">
            {category.answers.map((answer, index) => (
              <li
                key={answer}
                className="bg-card text-card-foreground ring-foreground/10 flex items-center gap-3 rounded-lg px-4 py-3 text-lg ring-1"
              >
                <span className="text-muted-foreground text-sm font-medium tabular-nums">
                  {index + 1}
                </span>
                {answer}
              </li>
            ))}
          </ul>
        ) : (
          <p aria-live="polite" className="text-muted-foreground mx-auto max-w-md text-center">
            Nenhuma resposta cadastrada para esta categoria.
          </p>
        )}
      </div>

      <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 flex justify-center border-t p-4 backdrop-blur">
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Button size="lg" onClick={drawCategory} className="min-h-14 text-lg font-semibold">
            Nova categoria
          </Button>
          <Button variant="outline" size="lg" onClick={goHome} className="min-h-14">
            Início
          </Button>
        </div>
      </div>
    </div>
  );
}
