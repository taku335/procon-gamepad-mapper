import type { ActionMapping, ActionState, PhysicalInputState, ProconPhysicalInput } from "../types";

export function resolveActions<Action extends string>(
  inputs: PhysicalInputState,
  mapping: ActionMapping<Action>,
): ActionState<Action> {
  const actions = {} as ActionState<Action>;

  for (const action of Object.keys(mapping) as Action[]) {
    const mappedInput = mapping[action];
    const assignedInputs: ProconPhysicalInput[] = Array.isArray(mappedInput)
      ? mappedInput
      : [mappedInput];
    actions[action] = assignedInputs.some((input) => inputs[input]);
  }

  return actions;
}
