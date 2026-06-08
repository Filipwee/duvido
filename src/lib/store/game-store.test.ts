import { beforeEach, describe, expect, it } from "vitest";

import { useGameStore } from "./game-store";

/** Resets the store to a known starting point before each test. */
function resetStore(): void {
  useGameStore.setState({
    screen: "home",
    category: null,
    preferences: { duration: 60, soundEnabled: true },
    timeLeft: 60,
    isRunning: false,
    hasHydrated: true,
  });
}

describe("game store", () => {
  beforeEach(resetStore);

  it("drawCategory moves to the reveal screen with a category", () => {
    useGameStore.getState().drawCategory();
    const { screen, category } = useGameStore.getState();
    expect(screen).toBe("reveal");
    expect(category).not.toBeNull();
  });

  it("startTimer resets timeLeft to the configured duration and runs", () => {
    useGameStore.setState({ preferences: { duration: 45, soundEnabled: true } });
    useGameStore.getState().startTimer();
    const { screen, timeLeft, isRunning } = useGameStore.getState();
    expect(screen).toBe("timer");
    expect(timeLeft).toBe(45);
    expect(isRunning).toBe(true);
  });

  it("tick decrements the countdown by one second", () => {
    useGameStore.setState({ timeLeft: 3, isRunning: true });
    useGameStore.getState().tick();
    expect(useGameStore.getState().timeLeft).toBe(2);
    expect(useGameStore.getState().isRunning).toBe(true);
  });

  it("tick stops running when it reaches zero", () => {
    useGameStore.setState({ timeLeft: 1, isRunning: true });
    useGameStore.getState().tick();
    expect(useGameStore.getState().timeLeft).toBe(0);
    expect(useGameStore.getState().isRunning).toBe(false);
  });

  it("tick does not go below zero", () => {
    useGameStore.setState({ timeLeft: 0, isRunning: false });
    useGameStore.getState().tick();
    expect(useGameStore.getState().timeLeft).toBe(0);
  });

  it("toggleRunning flips the running flag while time remains", () => {
    useGameStore.setState({ timeLeft: 10, isRunning: true });
    useGameStore.getState().toggleRunning();
    expect(useGameStore.getState().isRunning).toBe(false);
    useGameStore.getState().toggleRunning();
    expect(useGameStore.getState().isRunning).toBe(true);
  });

  it("toggleRunning is a no-op at zero", () => {
    useGameStore.setState({ timeLeft: 0, isRunning: false });
    useGameStore.getState().toggleRunning();
    expect(useGameStore.getState().isRunning).toBe(false);
  });

  it("revealGabarito navigates to the answer key and stops the timer", () => {
    useGameStore.setState({ isRunning: true });
    useGameStore.getState().revealGabarito();
    expect(useGameStore.getState().screen).toBe("gabarito");
    expect(useGameStore.getState().isRunning).toBe(false);
  });

  it("goHome returns to home and stops the timer", () => {
    useGameStore.setState({ screen: "timer", isRunning: true });
    useGameStore.getState().goHome();
    expect(useGameStore.getState().screen).toBe("home");
    expect(useGameStore.getState().isRunning).toBe(false);
  });

  it("setDuration updates the preference and idle timeLeft on home", () => {
    useGameStore.setState({ screen: "home" });
    useGameStore.getState().setDuration(90);
    expect(useGameStore.getState().preferences.duration).toBe(90);
    expect(useGameStore.getState().timeLeft).toBe(90);
  });

  it("setDuration does not disturb a running countdown", () => {
    useGameStore.setState({ screen: "timer", timeLeft: 12 });
    useGameStore.getState().setDuration(120);
    expect(useGameStore.getState().preferences.duration).toBe(120);
    expect(useGameStore.getState().timeLeft).toBe(12);
  });

  it("toggleSound flips the sound preference", () => {
    expect(useGameStore.getState().preferences.soundEnabled).toBe(true);
    useGameStore.getState().toggleSound();
    expect(useGameStore.getState().preferences.soundEnabled).toBe(false);
  });
});
