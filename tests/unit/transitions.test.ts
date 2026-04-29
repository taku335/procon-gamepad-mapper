import { describe, expect, it } from "vitest";
import { getActionTransitions } from "../../src/mapping/transitions";

describe("getActionTransitions", () => {
  it("reports actiondown and actionup edges", () => {
    expect(
      getActionTransitions(
        { moveLeft: false, pause: true },
        { moveLeft: true, pause: false },
      ),
    ).toEqual([
      { action: "moveLeft", type: "actiondown" },
      { action: "pause", type: "actionup" },
    ]);
  });
});
