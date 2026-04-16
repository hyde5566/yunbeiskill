interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPersistedFilters<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
) {
  const storage = getStorage();
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function savePersistedFilters<T>(key: string, value: T, isDefaultValue: (value: T) => boolean) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    if (isDefaultValue(value)) {
      storage.removeItem(key);
      return;
    }

    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore persistence failures and keep the page usable.
  }
}

export function clearPersistedFilters(key: string) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch {
    // Ignore persistence failures and keep the page usable.
  }
}
