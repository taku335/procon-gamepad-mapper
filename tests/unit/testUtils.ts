export function createMockGamepad(overrides: Partial<Gamepad> = {}): Gamepad {
  const buttons = Array.from({ length: 18 }, () => ({
    pressed: false,
    touched: false,
    value: 0,
  })) as GamepadButton[];

  return {
    axes: [0, 0, 0, 0],
    buttons,
    connected: true,
    hapticActuators: [],
    id: "Nintendo Switch Pro Controller",
    index: 0,
    mapping: "standard",
    timestamp: 0,
    vibrationActuator: null,
    ...overrides,
  } as Gamepad;
}

export function setNavigatorGamepads(gamepads: Array<Gamepad | null>): void {
  Object.defineProperty(navigator, "getGamepads", {
    configurable: true,
    value: () => gamepads,
  });
}

export function setButton(gamepad: Gamepad, index: number, pressed: boolean): void {
  (gamepad.buttons as GamepadButton[])[index] = {
    pressed,
    touched: pressed,
    value: pressed ? 1 : 0,
  };
}
