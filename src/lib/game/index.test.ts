import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  categoryCount,
  pickCategory,
  pickRevealPhrase,
  REVEAL_PHRASES,
  TIMER_DURATIONS,
} from "./index";

describe("pickCategory", () => {
  it("returns a category from the dataset", () => {
    const category = pickCategory({ rng: () => 0 });
    expect(category).toBe(CATEGORIES[0]);
  });

  it("clamps an rng value of 1 to the last category", () => {
    const category = pickCategory({ rng: () => 1 });
    expect(category).toBe(CATEGORIES[CATEGORIES.length - 1]);
  });

  it("never returns the excluded category when alternatives exist", () => {
    const excluded = CATEGORIES[0];
    // rng=0 would normally select index 0 of the filtered pool, not the excluded one.
    const category = pickCategory({ excludeName: excluded.name, rng: () => 0 });
    expect(category.name).not.toBe(excluded.name);
  });

  it("falls back to the full list when excluding leaves nothing", () => {
    // Not reproducible with the real dataset (510 entries); guard the branch anyway.
    const category = pickCategory({ excludeName: "does-not-exist", rng: () => 0 });
    expect(category).toBe(CATEGORIES[0]);
  });
});

describe("pickRevealPhrase", () => {
  it("returns a phrase from the list", () => {
    expect(pickRevealPhrase(() => 0)).toBe(REVEAL_PHRASES[0]);
  });
});

describe("dataset", () => {
  it("exposes the expected duration options", () => {
    expect(TIMER_DURATIONS).toEqual([30, 45, 60, 90, 120]);
  });

  it("reports a non-empty category count", () => {
    expect(categoryCount()).toBe(CATEGORIES.length);
    expect(categoryCount()).toBeGreaterThan(0);
  });
});
