import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/persistence/safeStorage';

export interface Profile {
  callSign: string;
  patch: string;
}

interface ProgressState {
  profile: Profile | null;
  stars: number;
  flags: Record<string, number>;
  discovered: string[];
  quizzed: string[];
  badges: string[];
  challengeDoneOn: Record<string, string>;
  reducedMotion: boolean | null;
  creationCounter: number;
  setProfile: (p: Profile) => void;
  setReducedMotion: (v: boolean | null) => void;
  resetAll: () => void;
}

const initial = {
  profile: null,
  stars: 0,
  flags: {},
  discovered: [],
  quizzed: [],
  badges: [],
  challengeDoneOn: {},
  reducedMotion: null,
  creationCounter: 0,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initial,
      setProfile: (profile) => set({ profile }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      resetAll: () => set({ ...initial }),
    }),
    { name: 'ish-progress-v1', storage: createJSONStorage(() => safeStorage), version: 1 },
  ),
);
