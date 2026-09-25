import { createStore, get, set, del } from 'idb-keyval';
import type { DrawDoc } from './types';

/** The picture in progress survives closing the app. Separate database so it never touches the archive. */
let store: ReturnType<typeof createStore> | null | undefined;
const db = () => {
  if (store !== undefined) return store;
  try {
    store = createStore('indian-space-hub-draft', 'draft');
  } catch {
    store = null;
  }
  return store;
};

let timer: ReturnType<typeof setTimeout> | undefined;
export function saveDraftSoon(doc: DrawDoc) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const s = db();
    if (s) set('current', doc, s).catch(() => undefined);
  }, 700);
}

export async function loadDraft(): Promise<DrawDoc | null> {
  const s = db();
  if (!s) return null;
  try {
    return ((await get('current', s)) as DrawDoc | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function clearDraft() {
  clearTimeout(timer);
  const s = db();
  if (s) await del('current', s).catch(() => undefined);
}
