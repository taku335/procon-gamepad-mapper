import { beforeEach, describe, expect, it } from "vitest";
import { LocalStorageStore } from "../../src/storage/localStorageStore";

describe("LocalStorageStore", () => {
  beforeEach(() => {
    const values = new Map<string, string>();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      },
    });
  });

  it("saves, loads, and resets mapper config", () => {
    const store = new LocalStorageStore<"pause">("test:procon");

    store.save({ pause: "buttonPlus" }, 0.4);

    expect(store.load()).toMatchObject({
      schemaVersion: 1,
      mapping: { pause: "buttonPlus" },
      deadZone: 0.4,
    });

    store.reset();

    expect(store.load()).toBeNull();
  });
});
