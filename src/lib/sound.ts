/**
 * Minimal sound effects via the Web Audio API — no binary assets needed.
 *
 * The game only needs short feedback cues (a click on draw, a final buzz when
 * the timer ends), so we synthesize them with an oscillator on demand.
 */

let audioContext: AudioContext | null = null;

/** Lazily creates (or resumes) a shared AudioContext, or null if unsupported. */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (audioContext === null) {
    audioContext = new Ctor();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

interface BeepOptions {
  frequency: number;
  durationMs: number;
}

/** Plays a single short tone. Silently no-ops if Web Audio is unavailable. */
function beep({ frequency, durationMs }: BeepOptions): void {
  const ctx = getAudioContext();
  if (ctx === null) {
    return;
  }
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

/** Short confirmation tick (e.g. when drawing a category). */
export function playClick(): void {
  beep({ frequency: 660, durationMs: 80 });
}

/** Final buzz played when the countdown reaches zero. */
export function playTimeUp(): void {
  beep({ frequency: 220, durationMs: 500 });
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
