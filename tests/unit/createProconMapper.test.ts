import { describe, expect, it, vi } from "vitest";
import { createProconMapper } from "../../src";
import { createMockGamepad, setButton, setNavigatorGamepads } from "./testUtils";

describe("createProconMapper", () => {
  it("returns mapped pressed actions from selected gamepad", () => {
    const gamepad = createMockGamepad();
    setButton(gamepad, 14, true);
    setNavigatorGamepads([gamepad]);

    const mapper = createProconMapper({
      mapping: {
        moveLeft: "dpadLeft",
        rotateCW: "buttonA",
      },
    });

    expect(mapper.getPressedActions()).toEqual({
      moveLeft: true,
      rotateCW: false,
    });
  });

  it("emits action transition events during update", () => {
    const gamepad = createMockGamepad();
    setNavigatorGamepads([gamepad]);

    const mapper = createProconMapper({
      mapping: {
        pause: "buttonPlus",
      },
    });
    const onDown = vi.fn();
    const onUp = vi.fn();
    mapper.on("actiondown", onDown);
    mapper.on("actionup", onUp);

    mapper.update();
    setButton(gamepad, 9, true);
    mapper.update();
    setButton(gamepad, 9, false);
    mapper.update();

    expect(onDown).toHaveBeenCalledOnce();
    expect(onUp).toHaveBeenCalledOnce();
  });
});
