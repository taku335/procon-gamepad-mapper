import type { ActionState, ActionTransition } from "../types";

export function getActionTransitions<Action extends string>(
  previous: ActionState<Action>,
  current: ActionState<Action>,
): ActionTransition<Action>[] {
  const transitions: ActionTransition<Action>[] = [];
  const actions = new Set<Action>([
    ...(Object.keys(previous) as Action[]),
    ...(Object.keys(current) as Action[]),
  ]);

  for (const action of actions) {
    const wasPressed = Boolean(previous[action]);
    const isPressed = Boolean(current[action]);

    if (!wasPressed && isPressed) {
      transitions.push({ action, type: "actiondown" });
    } else if (wasPressed && !isPressed) {
      transitions.push({ action, type: "actionup" });
    }
  }

  return transitions;
}
