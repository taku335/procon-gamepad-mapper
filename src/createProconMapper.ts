import { ActionEmitter } from "./events/emitter";
import { getConnectedGamepads, toDetectedGamepad } from "./gamepad/detectGamepads";
import { clampDeadZone, createEmptyPhysicalInputState, DEFAULT_DEAD_ZONE, readInputState } from "./gamepad/readInputState";
import { resolveActions } from "./mapping/resolveActions";
import { getActionTransitions } from "./mapping/transitions";
import { LocalStorageStore } from "./storage/localStorageStore";
import type {
  ActionEventHandler,
  ActionMapping,
  ActionState,
  DetectedGamepad,
  MapperSnapshot,
  PhysicalInputState,
  ProconMapper,
  ProconMapperOptions,
} from "./types";

export function createProconMapper<Action extends string>(
  options: ProconMapperOptions<Action>,
): ProconMapper<Action> {
  return new BrowserProconMapper(options);
}

class BrowserProconMapper<Action extends string> implements ProconMapper<Action> {
  private readonly defaultMapping: ActionMapping<Action>;
  private readonly storage: LocalStorageStore<Action>;
  private readonly emitter = new ActionEmitter<Action>();
  private mapping: ActionMapping<Action>;
  private deadZone: number;
  private selectedGamepadIndex: number | null;
  private previousActions = {} as ActionState<Action>;
  private latestInputs: PhysicalInputState = createEmptyPhysicalInputState();
  private latestActions = {} as ActionState<Action>;
  private destroyed = false;

  constructor(options: ProconMapperOptions<Action>) {
    this.defaultMapping = cloneMapping(options.mapping);
    this.mapping = cloneMapping(options.mapping);
    this.deadZone = clampDeadZone(options.deadZone ?? DEFAULT_DEAD_ZONE);
    this.selectedGamepadIndex = options.gamepadIndex ?? null;
    this.storage = new LocalStorageStore<Action>(options.storageKey);

    if (options.autoLoad) {
      this.load();
    }
  }

  getConnectedGamepads(): DetectedGamepad[] {
    return getConnectedGamepads();
  }

  getSelectedGamepad(): DetectedGamepad | null {
    const gamepad = this.findSelectedGamepad();
    return gamepad ? toDetectedGamepad(gamepad) : null;
  }

  selectGamepad(index: number): void {
    this.selectedGamepadIndex = index;
  }

  getPressedActions(): ActionState<Action> {
    return this.update().actions;
  }

  getInputState(): PhysicalInputState {
    this.update();
    return { ...this.latestInputs };
  }

  update(): MapperSnapshot<Action> {
    if (this.destroyed) {
      return {
        gamepad: null,
        inputs: createEmptyPhysicalInputState(),
        actions: {} as ActionState<Action>,
        changed: [],
      };
    }

    const gamepad = this.findSelectedGamepad();
    const detectedGamepad = gamepad ? toDetectedGamepad(gamepad) : null;
    const inputs = readInputState(gamepad, this.deadZone);
    const actions = resolveActions(inputs, this.mapping);
    const changed = getActionTransitions(this.previousActions, actions);

    this.latestInputs = inputs;
    this.latestActions = actions;
    this.previousActions = { ...actions };

    for (const transition of changed) {
      this.emitter.emit(transition.type, {
        action: transition.action,
        gamepad: detectedGamepad,
        actions,
      });
    }

    return {
      gamepad: detectedGamepad,
      inputs: { ...inputs },
      actions: { ...actions },
      changed,
    };
  }

  setMapping(mapping: ActionMapping<Action>): void {
    this.mapping = cloneMapping(mapping);
  }

  getMapping(): ActionMapping<Action> {
    return cloneMapping(this.mapping);
  }

  resetMapping(): void {
    this.mapping = cloneMapping(this.defaultMapping);
  }

  setDeadZone(deadZone: number): void {
    this.deadZone = clampDeadZone(deadZone);
  }

  getDeadZone(): number {
    return this.deadZone;
  }

  save(): void {
    this.storage.save(this.mapping, this.deadZone);
  }

  load(): boolean {
    const storedConfig = this.storage.load();

    if (!storedConfig) {
      return false;
    }

    this.mapping = cloneMapping(storedConfig.mapping);
    this.deadZone = clampDeadZone(storedConfig.deadZone);
    return true;
  }

  resetSavedConfig(): void {
    this.storage.reset();
  }

  on(type: "actiondown" | "actionup", handler: ActionEventHandler<Action>): () => void {
    return this.emitter.on(type, handler);
  }

  destroy(): void {
    this.destroyed = true;
    this.emitter.clear();
  }

  private findSelectedGamepad(): Gamepad | null {
    const gamepads = getRawGamepads();

    if (this.selectedGamepadIndex !== null) {
      return gamepads.find((gamepad) => gamepad?.index === this.selectedGamepadIndex) ?? null;
    }

    return (
      gamepads.find((gamepad) => gamepad && toDetectedGamepad(gamepad).isLikelyProController) ??
      gamepads.find((gamepad) => gamepad !== null) ??
      null
    );
  }
}

function getRawGamepads(): Gamepad[] {
  if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") {
    return [];
  }

  return Array.from(navigator.getGamepads()).filter(
    (gamepad): gamepad is Gamepad => gamepad !== null && gamepad.connected,
  );
}

function cloneMapping<Action extends string>(mapping: ActionMapping<Action>): ActionMapping<Action> {
  return Object.fromEntries(
    (Object.keys(mapping) as Action[]).map((action) => {
      const input = mapping[action];
      return [action, Array.isArray(input) ? [...input] : input];
    }),
  ) as ActionMapping<Action>;
}
