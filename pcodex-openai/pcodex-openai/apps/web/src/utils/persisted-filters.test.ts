import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPersistedFilters,
  loadPersistedFilters,
  savePersistedFilters,
} from "./persisted-filters";

const storageKey = "yunbei:test:filters";

function createStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

describe("persisted filters", () => {
  const localStorage = createStorage();

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("window", { localStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("loads persisted filters when the payload is valid", () => {
    localStorage.setItem(storageKey, JSON.stringify({ filter: "UNREAD" }));

    const result = loadPersistedFilters(
      storageKey,
      { filter: "ALL" },
      (value): value is { filter: string } =>
        typeof value === "object" &&
        value !== null &&
        typeof (value as { filter?: unknown }).filter === "string",
    );

    expect(result).toEqual({ filter: "UNREAD" });
  });

  it("falls back when the persisted payload is malformed", () => {
    localStorage.setItem(storageKey, "{broken");

    const result = loadPersistedFilters(
      storageKey,
      { filter: "ALL" },
      (value): value is { filter: string } =>
        typeof value === "object" &&
        value !== null &&
        typeof (value as { filter?: unknown }).filter === "string",
    );

    expect(result).toEqual({ filter: "ALL" });
  });

  it("removes the storage item when saving a default value", () => {
    localStorage.setItem(storageKey, JSON.stringify({ filter: "READ" }));

    savePersistedFilters(storageKey, { filter: "ALL" }, (value) => value.filter === "ALL");

    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it("clears persisted filters explicitly", () => {
    localStorage.setItem(storageKey, JSON.stringify({ filter: "READ" }));

    clearPersistedFilters(storageKey);

    expect(localStorage.getItem(storageKey)).toBeNull();
  });
});
