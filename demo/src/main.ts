import {
  createProconMapper,
  type ActionMapping,
  type ProconPhysicalInput,
} from "../../src";
import "./style.css";

type DemoAction =
  | "moveLeft"
  | "moveRight"
  | "softDrop"
  | "hardDrop"
  | "rotateCW"
  | "rotateCCW"
  | "hold"
  | "pause";

const defaultMapping: ActionMapping<DemoAction> = {
  moveLeft: "dpadLeft",
  moveRight: "dpadRight",
  softDrop: "dpadDown",
  hardDrop: "dpadUp",
  rotateCW: "buttonA",
  rotateCCW: "buttonB",
  hold: ["buttonL", "buttonZL"],
  pause: "buttonPlus",
};

const physicalInputs: ProconPhysicalInput[] = [
  "buttonA",
  "buttonB",
  "buttonX",
  "buttonY",
  "buttonL",
  "buttonR",
  "buttonZL",
  "buttonZR",
  "buttonMinus",
  "buttonPlus",
  "buttonHome",
  "buttonCapture",
  "buttonLeftStick",
  "buttonRightStick",
  "dpadUp",
  "dpadDown",
  "dpadLeft",
  "dpadRight",
  "leftStickUp",
  "leftStickDown",
  "leftStickLeft",
  "leftStickRight",
  "rightStickUp",
  "rightStickDown",
  "rightStickLeft",
  "rightStickRight",
];

const mapper = createProconMapper<DemoAction>({
  mapping: defaultMapping,
  storageKey: "procon-gamepad-mapper:demo:v1",
  autoLoad: true,
});

const supportStatus = getElement("supportStatus");
const gamepadsElement = getElement("gamepads");
const actionsElement = getElement("actions");
const inputsElement = getElement("inputs");
const axesElement = getElement("axes");
const eventLogElement = getElement("eventLog");
const deadZoneElement = document.querySelector<HTMLInputElement>("#deadZone");
const deadZoneValueElement = getElement("deadZoneValue");

if (!("getGamepads" in navigator)) {
  supportStatus.textContent = "Gamepad API is not available / Gamepad API は利用できません";
} else {
  supportStatus.textContent = "Gamepad API available / Gamepad API 利用可能";
}

if (deadZoneElement) {
  deadZoneElement.value = String(mapper.getDeadZone());
  deadZoneValueElement.textContent = mapper.getDeadZone().toFixed(2);
  deadZoneElement.addEventListener("input", () => {
    mapper.setDeadZone(Number(deadZoneElement.value));
    deadZoneValueElement.textContent = mapper.getDeadZone().toFixed(2);
  });
}

document.querySelector("#saveButton")?.addEventListener("click", () => mapper.save());
document.querySelector("#loadButton")?.addEventListener("click", () => {
  mapper.load();
  if (deadZoneElement) {
    deadZoneElement.value = String(mapper.getDeadZone());
  }
  deadZoneValueElement.textContent = mapper.getDeadZone().toFixed(2);
});
document.querySelector("#resetButton")?.addEventListener("click", () => {
  mapper.resetMapping();
  mapper.setDeadZone(0.3);
  mapper.resetSavedConfig();
  if (deadZoneElement) {
    deadZoneElement.value = "0.3";
  }
  deadZoneValueElement.textContent = "0.30";
});

window.addEventListener("gamepadconnected", () => renderGamepads());
window.addEventListener("gamepaddisconnected", () => renderGamepads());

mapper.on("actiondown", (event) => appendEvent(`${event.action} down`));
mapper.on("actionup", (event) => appendEvent(`${event.action} up`));

renderGamepads();
requestAnimationFrame(loop);

function loop(): void {
  const snapshot = mapper.update();
  renderActions(snapshot.actions);
  renderInputs(snapshot.inputs);
  renderAxes();
  requestAnimationFrame(loop);
}

function renderGamepads(): void {
  const gamepads = mapper.getConnectedGamepads();

  if (gamepads.length === 0) {
    gamepadsElement.innerHTML =
      '<div class="muted">Press a button on a connected controller. / 接続済みコントローラーのボタンを押してください。</div>';
    return;
  }

  gamepadsElement.replaceChildren(
    ...gamepads.map((gamepad) => {
      const element = document.createElement("div");
      element.className = "gamepad";
      element.innerHTML = `
        <strong>#${gamepad.index} ${escapeHtml(gamepad.id)}</strong>
        <span class="muted">mapping / マッピング: ${gamepad.mapping || "none"} / confidence / 信頼度: ${gamepad.confidence}</span>
      `;

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Select / 選択";
      button.addEventListener("click", () => mapper.selectGamepad(gamepad.index));
      element.append(button);

      return element;
    }),
  );
}

function renderActions(actions: Record<string, boolean>): void {
  actionsElement.replaceChildren(
    ...Object.entries(actions).map(([name, active]) => createPill(name, active)),
  );
}

function renderInputs(inputs: Record<string, boolean>): void {
  inputsElement.replaceChildren(
    ...physicalInputs.map((input) => createPill(input, inputs[input] ?? false)),
  );
}

function renderAxes(): void {
  const gamepad = navigator.getGamepads?.()[mapper.getSelectedGamepad()?.index ?? -1];

  if (!gamepad) {
    axesElement.innerHTML = '<div class="muted">No selected gamepad. / 選択中の gamepad はありません。</div>';
    return;
  }

  axesElement.replaceChildren(
    ...gamepad.axes.map((axis, index) => {
      const element = document.createElement("div");
      element.className = "pill";
      element.textContent = `axis ${index}: ${axis.toFixed(3)}`;
      return element;
    }),
  );
}

function createPill(label: string, active: boolean): HTMLDivElement {
  const element = document.createElement("div");
  element.className = active ? "pill active" : "pill";
  element.textContent = label;
  return element;
}

function appendEvent(label: string): void {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()} ${label}`;
  eventLogElement.prepend(item);

  while (eventLogElement.children.length > 30) {
    eventLogElement.lastElementChild?.remove();
  }
}

function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing #${id}`);
  }

  return element;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
