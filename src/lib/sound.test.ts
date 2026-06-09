import { describe, expect, it } from "vitest";

import { playAlarm, playClick, playTick } from "./sound";

// jsdom has no Web Audio API, so every cue must degrade to a silent no-op
// instead of throwing — this is also the server-side guarantee.
describe("sound cues without Web Audio", () => {
  it("playClick does not throw", () => {
    expect(() => playClick()).not.toThrow();
  });

  it("playTick does not throw in either tempo", () => {
    expect(() => playTick({ urgent: false, high: true })).not.toThrow();
    expect(() => playTick({ urgent: true, high: false })).not.toThrow();
  });

  it("playAlarm does not throw", () => {
    expect(() => playAlarm()).not.toThrow();
  });
});
