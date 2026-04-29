import type { DetectedGamepad } from "../types";

export function getConnectedGamepads(
  getGamepads: () => readonly (Gamepad | null)[] = defaultGetGamepads,
): DetectedGamepad[] {
  return Array.from(getGamepads())
    .filter((gamepad): gamepad is Gamepad => gamepad !== null && gamepad.connected)
    .map(toDetectedGamepad);
}

export function toDetectedGamepad(gamepad: Gamepad): DetectedGamepad {
  const confidence = getProControllerConfidence(gamepad);

  return {
    index: gamepad.index,
    id: gamepad.id,
    connected: gamepad.connected,
    mapping: gamepad.mapping,
    isLikelyProController: confidence !== "low",
    confidence,
  };
}

export function getProControllerConfidence(gamepad: Gamepad): DetectedGamepad["confidence"] {
  const normalizedId = gamepad.id.toLowerCase();
  const mentionsNintendo = normalizedId.includes("nintendo");
  const mentionsProController =
    normalizedId.includes("pro controller") ||
    normalizedId.includes("pro-controller") ||
    normalizedId.includes("switch pro");

  if (mentionsNintendo && mentionsProController) {
    return "high";
  }

  if (mentionsProController || normalizedId.includes("057e") || normalizedId.includes("2009")) {
    return "medium";
  }

  return "low";
}

function defaultGetGamepads(): readonly (Gamepad | null)[] {
  if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") {
    return [];
  }

  return navigator.getGamepads();
}
