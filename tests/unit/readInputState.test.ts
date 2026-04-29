import { describe, expect, it } from "vitest";
import { clampDeadZone, readInputState } from "../../src/gamepad/readInputState";
import { createMockGamepad, setButton } from "./testUtils";

describe("readInputState", () => {
  it("maps button indexes to physical inputs", () => {
    const gamepad = createMockGamepad();
    setButton(gamepad, 1, true);

    const state = readInputState(gamepad);

    expect(state.buttonA).toBe(true);
    expect(state.buttonB).toBe(false);
  });

  it("maps axes with dead zone", () => {
    const gamepad = createMockGamepad({ axes: [-0.4, 0.2, 0, 0] });

    const state = readInputState(gamepad, 0.3);

    expect(state.leftStickLeft).toBe(true);
    expect(state.leftStickRight).toBe(false);
    expect(state.leftStickDown).toBe(false);
  });

  it("clamps invalid dead zone values", () => {
    expect(clampDeadZone(-1)).toBe(0);
    expect(clampDeadZone(2)).toBe(1);
    expect(clampDeadZone(Number.NaN)).toBe(0.3);
  });
});
