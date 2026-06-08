/**
 * Core domain types for "Jogo do Duvido".
 *
 * The app is a facilitator for an in-person party game: it draws a category,
 * runs a timer, then reveals the answer key ("gabarito"). All social play
 * (saying answers out loud, doubting / "DUVIDO") happens off-screen.
 */

/** A topic the players must name items for, plus its official accepted answers. */
export interface Category {
  /** Human-readable topic, e.g. "Jogadores de futebol famosos". */
  readonly name: string;
  /** Officially accepted answers, used as the reveal "gabarito". */
  readonly answers: readonly string[];
}

/** The four screens of the game flow: home → reveal → timer → gabarito. */
export type Screen = "home" | "reveal" | "timer" | "gabarito";

/** Selectable countdown durations, in seconds. */
export type TimerDuration = 30 | 45 | 60 | 90 | 120;

/** Serializable user preferences persisted to localStorage. */
export interface Preferences {
  /** Chosen countdown duration in seconds. */
  duration: TimerDuration;
  /** Whether sound effects (clicks + timer ticks) are enabled. */
  soundEnabled: boolean;
}
