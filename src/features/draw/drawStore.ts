import { create } from 'zustand';
import { useSyncExternalStore } from 'react';
import type { ToolId } from '@/drawing/types';
import { getEngine } from '@/drawing/DrawingEngine';

export const BRUSH_SIZES = [8, 16, 30, 56];
export const STAMP_SCALES = [0.6, 1, 1.5, 2.2];

interface DrawUi {
  tool: ToolId;
  color: string;
  sizeIdx: number;
  stampId: string;
  setTool: (t: ToolId) => void;
  setColor: (c: string) => void;
  setSize: (i: number) => void;
  setStamp: (id: string) => void;
}

export const useDrawUi = create<DrawUi>()((set) => ({
  tool: 'marker',
  color: '#FF9933',
  sizeIdx: 1,
  stampId: 'rocket',
  setTool: (tool) => {
    if (tool !== 'stamp') getEngine().commitPending();
    set({ tool });
  },
  setColor: (color) => {
    const e = getEngine();
    if (e.pending) e.setPending({ ...e.pending, color });
    set({ color });
  },
  setSize: (sizeIdx) => {
    const e = getEngine();
    if (e.pending) e.setPending({ ...e.pending, scale: stampScale(sizeIdx, e.W, e.H) });
    set({ sizeIdx });
  },
  setStamp: (stampId) => {
    const e = getEngine();
    if (e.pending) e.setPending({ ...e.pending, id: stampId });
    set({ stampId, tool: 'stamp' });
  },
}));

export const stampScale = (idx: number, w: number, h: number) => ((Math.min(w, h) * 0.2) / 100) * STAMP_SCALES[idx];

/** Re-render when the engine document changes. */
export function useEngineVersion() {
  const e = getEngine();
  return useSyncExternalStore((cb) => e.subscribe(cb), () => e.version);
}
