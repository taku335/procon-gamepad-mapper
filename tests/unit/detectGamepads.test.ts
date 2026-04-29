import { describe, expect, it } from "vitest";
import { getConnectedGamepads, getProControllerConfidence } from "../../src/gamepad/detectGamepads";
import { createMockGamepad } from "./testUtils";

describe("detectGamepads", () => {
  it("detects Nintendo Switch Pro Controller with high confidence", () => {
    const gamepad = createMockGamepad();

    expect(getProControllerConfidence(gamepad)).toBe("high");
  });

  it("lists connected gamepads and filters null or disconnected entries", () => {
    const connected = createMockGamepad({ index: 1 });
    const disconnected = createMockGamepad({ connected: false, index: 2 });

    const result = getConnectedGamepads(() => [null, connected, disconnected]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      index: 1,
      isLikelyProController: true,
      confidence: "high",
    });
  });
});
