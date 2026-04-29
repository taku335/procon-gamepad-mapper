import { describe, expect, it } from "vitest";
import { createEmptyPhysicalInputState } from "../../src/gamepad/readInputState";
import { resolveActions } from "../../src/mapping/resolveActions";

describe("resolveActions", () => {
  it("resolves single and multiple input mappings", () => {
    const inputs = createEmptyPhysicalInputState();
    inputs.buttonZL = true;
    inputs.dpadLeft = true;

    const actions = resolveActions(inputs, {
      hold: ["buttonL", "buttonZL"],
      moveLeft: "dpadLeft",
      rotateCW: "buttonA",
    });

    expect(actions).toEqual({
      hold: true,
      moveLeft: true,
      rotateCW: false,
    });
  });
});
