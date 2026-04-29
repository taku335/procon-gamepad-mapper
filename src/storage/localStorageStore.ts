import { proconChromeProfile } from "../profiles/proconChrome";
import type { ActionMapping, StoredProconMapperConfig } from "../types";

export const DEFAULT_STORAGE_KEY = "procon-gamepad-mapper:v1:config";

export class LocalStorageStore<Action extends string> {
  constructor(private readonly key = DEFAULT_STORAGE_KEY) {}

  save(mapping: ActionMapping<Action>, deadZone: number): void {
    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    const value: StoredProconMapperConfig<Action> = {
      schemaVersion: 1,
      profileId: proconChromeProfile.id,
      mapping,
      deadZone,
    };

    storage.setItem(this.key, JSON.stringify(value));
  }

  load(): StoredProconMapperConfig<Action> | null {
    const storage = getLocalStorage();

    if (!storage) {
      return null;
    }

    const rawValue = storage.getItem(this.key);

    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as StoredProconMapperConfig<Action>;
      return parsed.schemaVersion === 1 ? parsed : null;
    } catch {
      return null;
    }
  }

  reset(): void {
    getLocalStorage()?.removeItem(this.key);
  }
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}
