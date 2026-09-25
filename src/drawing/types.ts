/**
 * A drawing is a list of commands replayed onto layered canvases.
 * Keeping the document as data (not pixels) gives cheap undo/redo, tiny drafts and remixing.
 */
export type BrushId = 'pencil' | 'marker' | 'crayon' | 'neon' | 'stars' | 'rainbow' | 'eraser';
export type ToolId = BrushId | 'fill' | 'stamp';

export interface StrokeCmd {
  t: 'stroke';
  brush: BrushId;
  color: string;
  size: number;
  seed: number;
  /** Flat [x0, y0, x1, y1, ...] in artboard pixels. */
  pts: number[];
}
export interface StampCmd {
  t: 'stamp';
  id: string;
  x: number;
  y: number;
  scale: number;
  rot: number;
  color: string;
}
export interface FillCmd { t: 'fill'; x: number; y: number; color: string }
export interface BgCmd { t: 'bg'; id: string }
export interface ClearCmd { t: 'clear' }
export type Cmd = StrokeCmd | StampCmd | FillCmd | BgCmd | ClearCmd;

export type Orientation = 'portrait' | 'landscape';

export interface DrawDoc {
  orient: Orientation;
  bg: string;
  page: string;
  /** A previous drawing used as the base layer when remixing. */
  baseImage?: string;
  remixOf?: string;
  cmds: Cmd[];
  redo: Cmd[];
}

export const ARTBOARD: Record<Orientation, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1440 },
  landscape: { w: 1440, h: 1080 },
};

export const INK = '#16193F';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
