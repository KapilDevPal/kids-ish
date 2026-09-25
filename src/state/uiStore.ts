import { create } from 'zustand';
import type { Celebration } from './types';

export interface Toast {
  id: string;
  text: string;
  stars?: number;
}

interface UiState {
  celebrations: Celebration[];
  toasts: Toast[];
  celebrate: (c: Celebration) => void;
  dismissCelebration: () => void;
  toast: (text: string, stars?: number) => void;
  dropToast: (id: string) => void;
}

let seq = 0;
export const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const useUi = create<UiState>()((set) => ({
  celebrations: [],
  toasts: [],
  celebrate: (c) => set((s) => (s.celebrations.some((x) => x.id === c.id) ? s : { celebrations: [...s.celebrations, c] })),
  dismissCelebration: () => set((s) => ({ celebrations: s.celebrations.slice(1) })),
  toast: (text, stars) => {
    const id = uid('toast');
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, stars }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600);
  },
  dropToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
