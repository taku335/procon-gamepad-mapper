import { allProconPhysicalInputs, proconChromeProfile } from "../profiles/proconChrome";
import type { PhysicalInputState, ProconProfile } from "../types";

export const DEFAULT_DEAD_ZONE = 0.3;

export function createEmptyPhysicalInputState(): PhysicalInputState {
  return Object.fromEntries(allProconPhysicalInputs.map((input) => [input, false])) as PhysicalInputState;
}

export function readInputState(
  gamepad: Gamepad | null,
  deadZone = DEFAULT_DEAD_ZONE,
  profile: ProconProfile = proconChromeProfile,
): PhysicalInputState {
  const state = createEmptyPhysicalInputState();

  if (!gamepad) {
    return state;
  }

  for (const input of allProconPhysicalInputs) {
    const binding = profile.inputs[input];

    if (binding.kind === "button") {
      state[input] = Boolean(gamepad.buttons[binding.index]?.pressed);
      continue;
    }

    const axisValue = gamepad.axes[binding.index] ?? 0;
    state[input] = binding.direction < 0 ? axisValue <= -deadZone : axisValue >= deadZone;
  }

  return state;
}

export function clampDeadZone(deadZone: number): number {
  if (!Number.isFinite(deadZone)) {
    return DEFAULT_DEAD_ZONE;
  }

  return Math.max(0, Math.min(1, deadZone));
}
