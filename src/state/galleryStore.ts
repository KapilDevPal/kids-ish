import { create } from 'zustand';
import type { Creation } from './types';
import { loadCreations, putCreation, deleteCreation, clearCreations } from '@/persistence/creationsDb';

interface GalleryState {
  ready: boolean;
  items: Creation[];
  load: () => Promise<void>;
  add: (c: Creation) => Promise<void>;
  rename: (id: string, title: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useGallery = create<GalleryState>()((set, get) => ({
  ready: false,
  items: [],
  load: async () => {
    const items = await loadCreations();
    set({ items, ready: true });
  },
  add: async (c) => {
    set({ items: [c, ...get().items] });
    await putCreation(c);
  },
  rename: async (id, title) => {
    const items = get().items.map((c) => (c.id === id ? { ...c, title } : c));
    set({ items });
    const c = items.find((x) => x.id === id);
    if (c) await putCreation(c);
  },
  remove: async (id) => {
    set({ items: get().items.filter((c) => c.id !== id) });
    await deleteCreation(id);
  },
  clearAll: async () => {
    set({ items: [] });
    await clearCreations();
  },
}));
