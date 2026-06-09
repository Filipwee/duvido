/**
 * Sound effects via the Web Audio API — no binary assets needed.
 *
 * All cues (confirmation click, the clock's tic-tac, and the final alarm) are
 * synthesized on demand from oscillators, so the bundle ships no audio files.
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

interface ToneOptions {
  frequency: number;
  durationMs: number;
  type?: OscillatorType;
  volume?: number;
}

/** Plays a single short tone. Silently no-ops if Web Audio is unavailable. */
function tone({ frequency, durationMs, type = "sine", volume = 0.15 }: ToneOptions): void {
  const ctx = getAudioContext();
  if (ctx === null) {
    return;
  }
  const now = ctx.currentTime;
  const seconds = durationMs / 1000;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + seconds);
}

/** Short confirmation tick (e.g. when drawing a category). */
export function playClick(): void {
  tone({ frequency: 660, durationMs: 80, type: "triangle" });
}

interface TickOptions {
  /** Last 15 seconds: louder, higher, more tense. */
  urgent: boolean;
  /** Alternates the pitch between "tic" (high) and "tac" (low). */
  high: boolean;
}

/** A single clock tick — call once per second while the timer runs. */
export function playTick({ urgent, high }: TickOptions): void {
  const frequency = urgent ? (high ? 1500 : 1150) : high ? 1040 : 820;
  tone({
    frequency,
    durationMs: urgent ? 90 : 60,
    type: "square",
    volume: urgent ? 0.22 : 0.11,
  });
}

/** The big "triiimm" — a ringing alarm bell played when the timer hits zero. */
export function playAlarm(): void {
  const ctx = getAudioContext();
  if (ctx === null) {
    return;
  }
  const now = ctx.currentTime;
  const duration = 1.6;

  const oscillator = ctx.createOscillator();
  oscillator.type = "triangle";

  // Two alternating bell tones (C6 / E6) hammered rapidly for a mechanical ring.
  const step = 0.04;
  for (let elapsed = 0; elapsed < duration; elapsed += step) {
    const frequency = Math.round(elapsed / step) % 2 === 0 ? 1047 : 1319;
    oscillator.frequency.setValueAtTime(frequency, now + elapsed);
  }

  // Loud attack, sustained ring, then a tail that decays out.
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.32, now + 0.02);
  gain.gain.setValueAtTime(0.32, now + duration - 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Tremolo (~32Hz) modulating the gain gives the bell its "rrring" warble.
  const tremolo = ctx.createOscillator();
  tremolo.type = "sine";
  tremolo.frequency.value = 32;
  const tremoloDepth = ctx.createGain();
  tremoloDepth.gain.value = 0.12;
  tremolo.connect(tremoloDepth);
  tremoloDepth.connect(gain.gain);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
  tremolo.start(now);
  tremolo.stop(now + duration);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
