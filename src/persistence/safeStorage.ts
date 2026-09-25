import type { StateStorage } from 'zustand/middleware';

/** localStorage wrapper that never throws (private mode, quota, sandboxed frames). */
const memory = new Map<string, string>();

export const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem: (key, value) => {
    memory.set(key, value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* keep in memory only */
    }
  },
  removeItem: (key) => {
    memory.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
