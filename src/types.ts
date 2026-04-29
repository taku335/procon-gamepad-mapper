export type ProconPhysicalInput =
  | "buttonA"
  | "buttonB"
  | "buttonX"
  | "buttonY"
  | "buttonL"
  | "buttonR"
  | "buttonZL"
  | "buttonZR"
  | "buttonMinus"
  | "buttonPlus"
  | "buttonHome"
  | "buttonCapture"
  | "buttonLeftStick"
  | "buttonRightStick"
  | "dpadUp"
  | "dpadDown"
  | "dpadLeft"
  | "dpadRight"
  | "leftStickUp"
  | "leftStickDown"
  | "leftStickLeft"
  | "leftStickRight"
  | "rightStickUp"
  | "rightStickDown"
  | "rightStickLeft"
  | "rightStickRight";

export type PhysicalInputState = Record<ProconPhysicalInput, boolean>;

export type ActionMapping<Action extends string = string> = Record<
  Action,
  ProconPhysicalInput | ProconPhysicalInput[]
>;

export type ActionState<Action extends string = string> = Record<Action, boolean>;

export interface DetectedGamepad {
  index: number;
  id: string;
  connected: boolean;
  mapping: GamepadMappingType;
  isLikelyProController: boolean;
  confidence: "high" | "medium" | "low";
}

export interface ActionTransition<Action extends string = string> {
  action: Action;
  type: "actiondown" | "actionup";
}

export interface ActionEvent<Action extends string = string> {
  action: Action;
  gamepad: DetectedGamepad | null;
  actions: ActionState<Action>;
}

export type ActionEventHandler<Action extends string = string> = (
  event: ActionEvent<Action>,
) => void;

export interface MapperSnapshot<Action extends string = string> {
  gamepad: DetectedGamepad | null;
  inputs: PhysicalInputState;
  actions: ActionState<Action>;
  changed: ActionTransition<Action>[];
}

export interface ProconMapperOptions<Action extends string = string> {
  mapping: ActionMapping<Action>;
  deadZone?: number;
  storageKey?: string;
  autoLoad?: boolean;
  gamepadIndex?: number;
}

export interface ProconMapper<Action extends string = string> {
  getConnectedGamepads(): DetectedGamepad[];
  getSelectedGamepad(): DetectedGamepad | null;
  selectGamepad(index: number): void;
  getPressedActions(): ActionState<Action>;
  getInputState(): PhysicalInputState;
  update(): MapperSnapshot<Action>;
  setMapping(mapping: ActionMapping<Action>): void;
  getMapping(): ActionMapping<Action>;
  resetMapping(): void;
  setDeadZone(deadZone: number): void;
  getDeadZone(): number;
  save(): void;
  load(): boolean;
  resetSavedConfig(): void;
  on(type: "actiondown" | "actionup", handler: ActionEventHandler<Action>): () => void;
  destroy(): void;
}

export interface StoredProconMapperConfig<Action extends string = string> {
  schemaVersion: 1;
  profileId: string;
  mapping: ActionMapping<Action>;
  deadZone: number;
}

export type ButtonBinding = {
  kind: "button";
  index: number;
};

export type AxisBinding = {
  kind: "axis";
  index: number;
  direction: -1 | 1;
};

export type InputBinding = ButtonBinding | AxisBinding;

export interface ProconProfile {
  id: string;
  name: string;
  inputs: Record<ProconPhysicalInput, InputBinding>;
}
