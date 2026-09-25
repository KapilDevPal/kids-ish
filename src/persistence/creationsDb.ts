import { createStore, get, set, del, values, clear } from 'idb-keyval';
import type { Creation } from '@/state/types';

/**
 * Creations (with their images) live in IndexedDB on the child's own device.
 * Nothing is uploaded anywhere: a deliberate privacy choice for a children's product.
 */
let store: ReturnType<typeof createStore> | null = null;
const fallback = new Map<string, Creation>();

function db() {
  if (store) return store;
  try {
    store = createStore('indian-space-hub', 'creations');
  } catch {
    store = null;
  }
  return store;
}

export async function loadCreations(): Promise<Creation[]> {
  const s = db();
  try {
    const list = s ? ((await values(s)) as Creation[]) : [...fallback.values()];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [...fallback.values()].sort((a, b) => b.createdAt - a.createdAt);
  }
}

export async function putCreation(c: Creation): Promise<void> {
  fallback.set(c.id, c);
  const s = db();
  if (!s) return;
  try {
    await set(c.id, c, s);
  } catch {
    /* stays in memory for this session */
  }
}

export async function getCreation(id: string): Promise<Creation | undefined> {
  const s = db();
  try {
    return s ? ((await get(id, s)) as Creation | undefined) : fallback.get(id);
  } catch {
    return fallback.get(id);
  }
}

export async function deleteCreation(id: string): Promise<void> {
  fallback.delete(id);
  const s = db();
  if (!s) return;
  try {
    await del(id, s);
  } catch {
    /* ignore */
  }
}

export async function clearCreations(): Promise<void> {
  fallback.clear();
  const s = db();
  if (!s) return;
  try {
    await clear(s);
  } catch {
    /* ignore */
  }
}
