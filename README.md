# procon-gamepad-mapper

Nintendo Switch Pro Controller input mapper for browser games and web apps.

This package reads Chrome's Gamepad API and converts Pro Controller physical inputs into application-defined actions. Game code does not need to read `gamepad.buttons[0]` or axis indexes directly.

## Install

```sh
npm install procon-gamepad-mapper
```

GitHub install is also supported before npm publication:

```sh
npm install github:YOUR_ORG_OR_USER/procon-gamepad-mapper
```

## Usage

```ts
import { createProconMapper } from "procon-gamepad-mapper";

const mapper = createProconMapper({
  mapping: {
    moveLeft: "dpadLeft",
    moveRight: "dpadRight",
    softDrop: "dpadDown",
    hardDrop: "dpadUp",
    rotateCW: "buttonA",
    rotateCCW: "buttonB",
    hold: ["buttonL", "buttonZL"],
    pause: "buttonPlus",
  },
});

function loop() {
  const actions = mapper.getPressedActions();

  if (actions.moveLeft) {
    moveLeft();
  }

  requestAnimationFrame(loop);
}

loop();
```

## Events

`getPressedActions()` is intended for game loops. For edge-triggered behavior, subscribe to action transitions:

```ts
const unsubscribe = mapper.on("actiondown", (event) => {
  if (event.action === "pause") {
    pause();
  }
});

unsubscribe();
```

## Configuration

```ts
const mapper = createProconMapper({
  storageKey: "my-game:procon:v1",
  deadZone: 0.35,
  autoLoad: true,
  mapping,
});

mapper.setDeadZone(0.25);
mapper.save();
mapper.load();
mapper.resetSavedConfig();
```

The default storage key is `procon-gamepad-mapper:v1:config`. Apps should set their own `storageKey` to avoid collisions on the same origin.

## Public API

- `getConnectedGamepads()`
- `getSelectedGamepad()`
- `selectGamepad(index)`
- `getPressedActions()`
- `getInputState()`
- `update()`
- `setMapping(mapping)`
- `getMapping()`
- `resetMapping()`
- `setDeadZone(deadZone)`
- `getDeadZone()`
- `save()`
- `load()`
- `resetSavedConfig()`
- `on("actiondown" | "actionup", handler)`
- `destroy()`

## Demo

The demo app is built with Vite and is intended for GitHub Pages.

```sh
npm install
npm run dev
```

The page shows connected gamepads, Pro Controller detection confidence, physical input state, mapped actions, axes, dead zone, storage controls, and transition events.

## Browser Notes

- Chrome on Windows and macOS is the primary target.
- Gamepad API data can differ by OS, Bluetooth/USB connection, browser version, and controller firmware.
- Pro Controller detection is best-effort. If automatic selection is wrong, select the controller manually in the demo or through `selectGamepad(index)`.
- Gamepads may not appear until the user presses a controller button.
- Secure contexts may be required depending on browser and deployment.

## Out of Scope

This library only handles input exposed through the browser Gamepad API.

- HD rumble
- gyro
- NFC
- firmware updates
- native driver setup
- external APIs

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
npm run build:demo
```
