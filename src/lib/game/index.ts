import type { Category, TimerDuration } from "@/types/game";
import { CATEGORIES } from "./categories";

export { CATEGORIES } from "./categories";

/** Opening phrases shown during the suspense before a category is revealed. */
export const REVEAL_PHRASES: readonly string[] = [
  "A categoria é...",
  "Preparem-se...",
  "O desafio de hoje...",
  "Atenção jogadores...",
  "O sorteio foi feito...",
];

/** Countdown durations offered to the player, in seconds. */
export const TIMER_DURATIONS: readonly TimerDuration[] = [30, 45, 60, 90, 120];

/** A source of randomness in the half-open interval [0, 1). Injectable for tests. */
export type Rng = () => number;

/** Picks an element from a non-empty list using `rng`, clamped to a valid index. */
function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) {
    throw new Error("pick: cannot choose from an empty list");
  }
  const index = Math.min(Math.floor(rng() * items.length), items.length - 1);
  // Safe: index is in [0, items.length - 1] and the list is non-empty.
  return items[index] as T;
}

export interface PickCategoryOptions {
  /** Name of the current category to avoid drawing twice in a row. */
  excludeName?: string;
  /** Randomness source; defaults to Math.random. */
  rng?: Rng;
}

/**
 * Draws a random category, avoiding an immediate repeat of `excludeName`.
 * Mirrors the original prototype's behaviour. Never returns `undefined`.
 */
export function pickCategory(options: PickCategoryOptions = {}): Category {
  const { excludeName, rng = Math.random } = options;
  const pool =
    excludeName === undefined
      ? CATEGORIES
      : CATEGORIES.filter((category) => category.name !== excludeName);
  // If excluding leaves nothing (dataset of size 1), fall back to the full list.
  return pick(pool.length > 0 ? pool : CATEGORIES, rng);
}

/** Picks a random reveal phrase. */
export function pickRevealPhrase(rng: Rng = Math.random): string {
  return pick(REVEAL_PHRASES, rng);
}

/** Total number of categories in the dataset. */
export function categoryCount(): number {
  return CATEGORIES.length;
}
