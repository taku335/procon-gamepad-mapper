# procon-gamepad-mapper

Nintendo Switch Pro Controller input mapper for browser games and web apps.

Nintendo Switch Pro Controller の入力を、ブラウザゲームや Web アプリで扱いやすい抽象アクションへ変換する TypeScript ライブラリです。

This package reads Chrome's Gamepad API and converts Pro Controller physical inputs into application-defined actions. Game code does not need to read `gamepad.buttons[0]` or axis indexes directly.

このパッケージは Chrome の Gamepad API を読み取り、Pro Controller の物理入力をアプリケーション定義のアクションへ変換します。ゲーム側のコードは `gamepad.buttons[0]` や axis index を直接扱う必要がありません。

## Install / インストール

```sh
npm install procon-gamepad-mapper
```

GitHub install is also supported before npm publication.

npm 公開前は GitHub 参照でのインストールにも対応します。

```sh
npm install github:YOUR_ORG_OR_USER/procon-gamepad-mapper
```

## Usage / 使い方

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

## Events / イベント

`getPressedActions()` is intended for game loops. For edge-triggered behavior, subscribe to action transitions.

`getPressedActions()` はゲームループ内での利用を想定しています。押下開始や押下終了のような edge-triggered な処理には action transition event を購読します。

```ts
const unsubscribe = mapper.on("actiondown", (event) => {
  if (event.action === "pause") {
    pause();
  }
});

unsubscribe();
```

## Configuration / 設定

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

デフォルトの storage key は `procon-gamepad-mapper:v1:config` です。同一 origin 上での衝突を避けるため、利用アプリ側では独自の `storageKey` を指定してください。

## Public API / 公開 API

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

## Demo / デモ

The demo app is built with Vite and is intended for GitHub Pages.

デモアプリは Vite で構成され、GitHub Pages での公開を想定しています。

```sh
npm install
npm run dev
```

The page shows connected gamepads, Pro Controller detection confidence, physical input state, mapped actions, axes, dead zone, storage controls, and transition events.

公開ページでは、接続中の gamepad、Pro Controller 判定 confidence、物理入力状態、マッピング済み action、axis、dead zone、保存操作、transition event を確認できます。

## Browser Notes / ブラウザ利用時の注意

- Chrome on Windows and macOS is the primary target.
- Windows / macOS の Chrome を主な対象にしています。
- Gamepad API data can differ by OS, Bluetooth/USB connection, browser version, and controller firmware.
- Gamepad API の値は OS、Bluetooth/USB 接続、ブラウザバージョン、コントローラーファームウェアによって変わる可能性があります。
- Pro Controller detection is best-effort. If automatic selection is wrong, select the controller manually in the demo or through `selectGamepad(index)`.
- Pro Controller の検出は best-effort です。自動選択が誤る場合は、デモ画面または `selectGamepad(index)` で手動選択してください。
- Gamepads may not appear until the user presses a controller button.
- コントローラーのボタンを押すまで gamepad が列挙されない場合があります。
- Secure contexts may be required depending on browser and deployment.
- ブラウザや公開環境によっては secure context が必要になる場合があります。

## Out of Scope / 対象外

This library only handles input exposed through the browser Gamepad API.

このライブラリは、ブラウザの Gamepad API で取得できる入力のみを扱います。

- HD rumble / HD 振動
- gyro / ジャイロ
- NFC
- firmware updates / ファームウェア更新
- native driver setup / ネイティブドライバー設定
- external APIs / 外部 API

## Development / 開発

```sh
npm install
npm run typecheck
npm test
npm run build
npm run build:demo
```
