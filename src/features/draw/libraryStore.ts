import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/persistence/safeStorage';

/** Favourite and recently opened colouring pages, kept on this device only. */
interface LibraryState {
  favs: string[];
  recent: string[];
  toggleFav: (id: string) => void;
  opened: (id: string) => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      favs: [],
      recent: [],
      toggleFav: (id) => set((s) => ({ favs: s.favs.includes(id) ? s.favs.filter((f) => f !== id) : [id, ...s.favs] })),
      opened: (id) => set((s) => ({ recent: [id, ...s.recent.filter((r) => r !== id)].slice(0, 12) })),
    }),
    { name: 'ish-colouring-v1', storage: createJSONStorage(() => safeStorage), version: 1 },
  ),
);
