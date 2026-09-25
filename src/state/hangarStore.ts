import { create } from 'zustand';
import type { Finish, OptionValue, PartPaint, CraftRecipe } from './types';
import type { ModelDefinition } from '@/engine3d/types';
import { PAINT_SWATCHES, TRICOLOUR } from '@/content/palette';
import { uid } from './uiStore';

interface Snapshot {
  paint: Record<string, PartPaint>;
  options: Record<string, OptionValue>;
}

export type Phase = 'idle' | 'countdown' | 'running' | 'done';

export interface Burst {
  id: string;
  point: [number, number, number];
  color: string;
}

interface HangarState {
  modelId: string | null;
  paint: Record<string, PartPaint>;
  options: Record<string, OptionValue>;
  defaults: Snapshot | null;
  past: Snapshot[];
  future: Snapshot[];
  brush: PartPaint;
  selected: string | null;
  selectedAt: number;
  paintedAt: Record<string, number>;
  phase: Phase;
  phaseStart: number;
  explode: boolean;
  cameraResetAt: number;
  bursts: Burst[];
  load: (def: ModelDefinition, recipe?: CraftRecipe) => void;
  paintPart: (partId: string, point?: [number, number, number]) => void;
  setBrushColor: (color: string) => void;
  setBrushFinish: (finish: Finish) => void;
  setOption: (id: string, v: OptionValue) => void;
  undo: () => void;
  redo: () => void;
  resetPaint: () => void;
  surprise: (partIds: string[]) => void;
  tricolour: (partIds: string[]) => void;
  select: (partId: string | null) => void;
  setPhase: (p: Phase) => void;
  toggleExplode: () => void;
  resetCamera: () => void;
  dropBurst: (id: string) => void;
}

const HISTORY_LIMIT = 60;

function snap(s: { paint: Record<string, PartPaint>; options: Record<string, OptionValue> }): Snapshot {
  return { paint: { ...s.paint }, options: { ...s.options } };
}

export const useHangar = create<HangarState>()((set, get) => {
  /** Record the current state before a change, so it can be undone. */
  const commit = (next: Partial<Snapshot>) => {
    const s = get();
    set({
      past: [...s.past, snap(s)].slice(-HISTORY_LIMIT),
      future: [],
      ...next,
    });
  };

  return {
    modelId: null,
    paint: {},
    options: {},
    defaults: null,
    past: [],
    future: [],
    brush: { color: PAINT_SWATCHES[0].hex, finish: 'gloss' },
    selected: null,
    selectedAt: 0,
    paintedAt: {},
    phase: 'idle',
    phaseStart: 0,
    explode: false,
    cameraResetAt: 0,
    bursts: [],

    load: (def, recipe) => {
      const paint: Record<string, PartPaint> = {};
      def.parts.forEach((p) => (paint[p.id] = { color: p.color, finish: p.finish ?? 'gloss' }));
      const options: Record<string, OptionValue> = {};
      def.options?.forEach((o) => (options[o.id] = o.default));
      const defaults = { paint: { ...paint }, options: { ...options } };
      if (recipe && recipe.modelId === def.id) {
        Object.assign(paint, recipe.paint);
        Object.assign(options, recipe.options);
      }
      set({
        modelId: def.id, paint, options, defaults, past: [], future: [], selected: null,
        phase: 'idle', explode: false, bursts: [], paintedAt: {}, cameraResetAt: performance.now(),
      });
    },

    paintPart: (partId, point) => {
      const s = get();
      if (s.phase === 'running' || s.phase === 'countdown') return;
      const cur = s.paint[partId];
      const now = performance.now();
      const bursts = point ? [...s.bursts.slice(-5), { id: uid('b'), point, color: s.brush.color }] : s.bursts;
      if (cur && cur.color === s.brush.color && cur.finish === s.brush.finish) {
        set({ selected: partId, selectedAt: now, bursts, paintedAt: { ...s.paintedAt, [partId]: now } });
        return;
      }
      commit({ paint: { ...s.paint, [partId]: { ...s.brush } } });
      set({ selected: partId, selectedAt: now, bursts, paintedAt: { ...get().paintedAt, [partId]: now } });
    },

    setBrushColor: (color) => set((s) => ({ brush: { ...s.brush, color } })),
    setBrushFinish: (finish) => set((s) => ({ brush: { ...s.brush, finish } })),

    setOption: (id, v) => {
      if (get().options[id] === v) return;
      commit({ options: { ...get().options, [id]: v } });
    },

    undo: () => {
      const s = get();
      const prev = s.past[s.past.length - 1];
      if (!prev) return;
      set({ past: s.past.slice(0, -1), future: [snap(s), ...s.future], ...prev });
    },
    redo: () => {
      const s = get();
      const next = s.future[0];
      if (!next) return;
      set({ future: s.future.slice(1), past: [...s.past, snap(s)], ...next });
    },
    resetPaint: () => {
      const d = get().defaults;
      if (d) commit({ paint: { ...d.paint }, options: { ...get().options } });
    },
    surprise: (ids) => {
      const paint = { ...get().paint };
      const finishes: Finish[] = ['gloss', 'gloss', 'metal', 'matte', 'glow'];
      ids.forEach((id) => {
        const c = PAINT_SWATCHES[Math.floor(Math.random() * PAINT_SWATCHES.length)].hex;
        paint[id] = { color: c, finish: finishes[Math.floor(Math.random() * finishes.length)] };
      });
      commit({ paint });
      const now = performance.now();
      set({ paintedAt: Object.fromEntries(ids.map((id) => [id, now])) });
    },
    tricolour: (ids) => {
      // Top third saffron, middle white, bottom green, following the part order (nose → base).
      const paint = { ...get().paint };
      const n = ids.length;
      ids.forEach((id, i) => {
        const t = i / Math.max(1, n - 1);
        const color = t < 0.34 ? TRICOLOUR.saffron : t < 0.67 ? TRICOLOUR.white : TRICOLOUR.green;
        paint[id] = { color, finish: 'gloss' };
      });
      commit({ paint });
      const now = performance.now();
      set({ paintedAt: Object.fromEntries(ids.map((id) => [id, now])) });
    },
    select: (selected) => set({ selected, selectedAt: performance.now() }),
    setPhase: (phase) => set({ phase, phaseStart: performance.now() }),
    toggleExplode: () => set((s) => ({ explode: !s.explode })),
    resetCamera: () => set({ cameraResetAt: performance.now(), explode: false }),
    dropBurst: (id) => set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) })),
  };
});

export function currentRecipe(): CraftRecipe | null {
  const s = useHangar.getState();
  if (!s.modelId) return null;
  return { modelId: s.modelId, paint: { ...s.paint }, options: { ...s.options } };
}
