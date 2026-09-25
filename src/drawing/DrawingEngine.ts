import { ARTBOARD, type Cmd, type DrawDoc, type Orientation, type StampCmd, type StrokeCmd, type BrushId } from './types';
import { drawStroke, newStrokeState, strokeEnd, strokeStep, type StrokeState } from './brushes';
import { drawStamp } from './stamps';
import { drawBackground, BACKGROUNDS } from './backgrounds';
import { drawPage } from './pages';
import { floodFill } from './floodFill';
import type { Anchors } from './kit/pen';

const CHECKPOINT_EVERY = 8;
const MAX_CHECKPOINTS = 4;
export const STAMP_BASE = 100;

/**
 * Framework-free drawing engine.
 * Layers (bottom to top): background, ink, colouring-page line art, overlay (stamp being placed).
 * The document is a command list; undo replays from the nearest cached checkpoint.
 * It is a singleton, so leaving the Draw screen and coming back keeps the picture instantly.
 */
export class DrawingEngine {
  doc: DrawDoc = { orient: 'portrait', bg: 'deep', page: 'none', cmds: [], redo: [] };
  readonly bgC = document.createElement('canvas');
  readonly inkC = document.createElement('canvas');
  readonly lineC = document.createElement('canvas');
  readonly overlayC = document.createElement('canvas');
  private bgX = this.bgC.getContext('2d')!;
  private inkX = this.inkC.getContext('2d')!;
  // Line art never changes after load and is read by the fill tool, so keep it CPU-side.
  private lineX = this.lineC.getContext('2d', { willReadFrequently: true })!;
  private ovX = this.overlayC.getContext('2d')!;
  private baseImg: HTMLImageElement | null = null;
  private checkpoints = new Map<number, HTMLCanvasElement>();
  private live: { cmd: StrokeCmd; st: StrokeState } | null = null;
  pending: StampCmd | null = null;
  /** Where each paintable part of the current page sits, so its colour can travel to the 3D model. */
  pageAnchors: Anchors = {};
  private listeners = new Set<() => void>();
  version = 0;

  constructor() {
    for (const c of [this.bgC, this.inkC, this.lineC, this.overlayC]) c.className = 'artboard__layer';
    this.load(this.doc);
  }

  get W() { return ARTBOARD[this.doc.orient].w; }
  get H() { return ARTBOARD[this.doc.orient].h; }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }
  private emit() {
    this.version++;
    this.listeners.forEach((f) => f());
  }

  mount(host: HTMLElement) {
    host.append(this.bgC, this.inkC, this.lineC, this.overlayC);
  }

  /** Load a whole document (new picture, remix or restored draft). */
  load(doc: DrawDoc) {
    this.doc = { ...doc, cmds: [...doc.cmds], redo: [...doc.redo] };
    this.live = null;
    this.pending = null;
    this.checkpoints.clear();
    const { w, h } = ARTBOARD[doc.orient];
    for (const c of [this.bgC, this.inkC, this.lineC, this.overlayC]) {
      c.width = w;
      c.height = h;
    }
    this.drawLines();
    // Page labels use the app font; redraw once it has arrived so they match.
    const fonts = document.fonts;
    if (fonts && fonts.status !== 'loaded') {
      const page = doc.page;
      void fonts.ready.then(() => {
        if (this.doc.page === page) {
          this.drawLines();
          this.emit();
        }
      });
    }
    this.baseImg = null;
    if (doc.baseImage) {
      const img = new Image();
      img.onload = () => {
        this.baseImg = img;
        this.renderBg();
        this.emit();
      };
      img.src = doc.baseImage;
    }
    this.renderBg();
    this.renderInk();
    this.drawOverlay();
    this.emit();
  }

  private drawLines() {
    const { w, h } = ARTBOARD[this.doc.orient];
    this.lineX.clearRect(0, 0, w, h);
    this.pageAnchors = drawPage(this.lineX, this.doc.page, w, h);
  }

  /** The colour painted at a point on the ink layer, or null if it is still blank there. */
  sampleInk(x: number, y: number): string | null {
    const d = this.inkX.getImageData(Math.round(x) - 1, Math.round(y) - 1, 3, 3).data;
    for (const i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) {
      if (d[i * 4 + 3] > 200) return '#' + [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    return null;
  }

  newDoc(opts: { orient: Orientation; bg?: string; page?: string; baseImage?: string; remixOf?: string }) {
    this.load({
      orient: opts.orient,
      bg: opts.baseImage ? 'image' : opts.bg ?? (opts.page && opts.page !== 'none' ? 'paper' : 'deep'),
      page: opts.page ?? 'none',
      baseImage: opts.baseImage,
      remixOf: opts.remixOf,
      cmds: [],
      redo: [],
    });
  }

  currentBg(): string {
    for (let i = this.doc.cmds.length - 1; i >= 0; i--) {
      const c = this.doc.cmds[i];
      if (c.t === 'bg') return c.id;
    }
    return this.doc.bg;
  }

  private renderBg() {
    const { W, H } = this;
    const id = this.currentBg();
    this.bgX.clearRect(0, 0, W, H);
    if (id === 'image') {
      this.bgX.fillStyle = '#0F1438';
      this.bgX.fillRect(0, 0, W, H);
      const img = this.baseImg;
      if (img) {
        const s = Math.max(W / img.width, H / img.height);
        const iw = img.width * s, ih = img.height * s;
        this.bgX.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      }
    } else drawBackground(this.bgX, id, W, H);
  }

  private apply(c: Cmd) {
    const x = this.inkX;
    switch (c.t) {
      case 'stroke': drawStroke(x, c); break;
      case 'stamp': drawStamp(x, c.id, c.x, c.y, c.scale, c.rot, c.color); break;
      case 'fill': floodFill(x, this.doc.page !== 'none' ? this.lineX : null, c.x, c.y, c.color); break;
      case 'clear': x.clearRect(0, 0, this.W, this.H); break;
      case 'bg': break;
    }
  }

  private renderInk(n = this.doc.cmds.length) {
    let k = 0;
    this.checkpoints.forEach((_, key) => { if (key <= n && key > k) k = key; });
    this.inkX.clearRect(0, 0, this.W, this.H);
    const cp = this.checkpoints.get(k);
    if (cp) this.inkX.drawImage(cp, 0, 0);
    for (let i = cp ? k : 0; i < n; i++) this.apply(this.doc.cmds[i]);
  }

  private commit(c: Cmd) {
    this.doc.cmds.push(c);
    this.doc.redo = [];
    const n = this.doc.cmds.length;
    if (c.t !== 'bg' && n % CHECKPOINT_EVERY === 0) {
      const copy = document.createElement('canvas');
      copy.width = this.W;
      copy.height = this.H;
      copy.getContext('2d')!.drawImage(this.inkC, 0, 0);
      this.checkpoints.set(n, copy);
      if (this.checkpoints.size > MAX_CHECKPOINTS) this.checkpoints.delete(Math.min(...this.checkpoints.keys()));
    }
    this.emit();
  }

  // ----- strokes -----
  beginStroke(brush: BrushId, color: string, size: number, x: number, y: number) {
    this.commitPending();
    const cmd: StrokeCmd = { t: 'stroke', brush, color, size, seed: (Math.random() * 1e9) | 0, pts: [Math.round(x), Math.round(y)] };
    this.live = { cmd, st: newStrokeState(cmd) };
    strokeStep(this.inkX, cmd, this.live.st, 0);
  }
  extendStroke(x: number, y: number) {
    const l = this.live;
    if (!l) return;
    const p = l.cmd.pts;
    const lx = p[p.length - 2], ly = p[p.length - 1];
    if (Math.hypot(x - lx, y - ly) < 2) return;
    p.push(Math.round(x), Math.round(y));
    strokeStep(this.inkX, l.cmd, l.st, p.length / 2 - 1);
  }
  endStroke() {
    const l = this.live;
    if (!l) return;
    strokeEnd(this.inkX, l.cmd, l.st);
    this.live = null;
    this.commit(l.cmd);
  }
  cancelStroke() {
    if (!this.live) return;
    this.live = null;
    this.renderInk();
  }
  get drawing() { return !!this.live; }
  get livePoints() { return this.live ? this.live.cmd.pts.length / 2 : 0; }

  fill(x: number, y: number, color: string) {
    this.commitPending();
    const c: Cmd = { t: 'fill', x: Math.round(x), y: Math.round(y), color };
    if (floodFill(this.inkX, this.doc.page !== 'none' ? this.lineX : null, c.x, c.y, color)) this.commit(c);
  }

  setBackground(id: string) {
    if (id === this.currentBg()) return;
    this.commit({ t: 'bg', id });
    this.renderBg();
  }

  clearInk() {
    this.pending = null;
    this.drawOverlay();
    if (!this.doc.cmds.some((c) => c.t !== 'bg')) return;
    this.commit({ t: 'clear' });
    this.inkX.clearRect(0, 0, this.W, this.H);
  }

  // ----- stamps -----
  setPending(s: StampCmd | null) {
    this.pending = s;
    this.drawOverlay();
    this.emit();
  }
  commitPending() {
    const p = this.pending;
    if (!p) return;
    this.pending = null;
    drawStamp(this.inkX, p.id, p.x, p.y, p.scale, p.rot, p.color);
    this.drawOverlay();
    this.commit(p);
  }
  private drawOverlay() {
    const x = this.ovX;
    x.clearRect(0, 0, this.W, this.H);
    const p = this.pending;
    if (!p) return;
    drawStamp(x, p.id, p.x, p.y, p.scale, p.rot, p.color);
    x.save();
    x.setLineDash([14, 12]);
    x.lineWidth = 5;
    x.strokeStyle = '#FFC93C';
    x.beginPath();
    x.arc(p.x, p.y, (STAMP_BASE / 2 + 12) * p.scale, 0, Math.PI * 2);
    x.stroke();
    x.restore();
  }

  // ----- history -----
  get canUndo() { return !!this.pending || this.doc.cmds.length > 0; }
  get canRedo() { return this.doc.redo.length > 0; }
  undo() {
    if (this.pending) return this.setPending(null);
    const c = this.doc.cmds.pop();
    if (!c) return;
    this.doc.redo.push(c);
    const n = this.doc.cmds.length;
    [...this.checkpoints.keys()].forEach((k) => k > n && this.checkpoints.delete(k));
    if (c.t === 'bg') this.renderBg();
    else this.renderInk();
    this.emit();
  }
  redo() {
    const c = this.doc.redo.pop();
    if (!c) return;
    this.doc.cmds.push(c);
    if (c.t === 'bg') this.renderBg();
    else this.apply(c);
    this.emit();
  }

  get isEmpty() { return this.doc.cmds.length === 0 && !this.pending && !this.doc.baseImage; }

  /** Flatten every layer into one canvas for saving. */
  compose(): HTMLCanvasElement {
    this.commitPending();
    const c = document.createElement('canvas');
    c.width = this.W;
    c.height = this.H;
    const x = c.getContext('2d')!;
    x.drawImage(this.bgC, 0, 0);
    x.drawImage(this.inkC, 0, 0);
    x.drawImage(this.lineC, 0, 0);
    return c;
  }

  baseColour() {
    return BACKGROUNDS.find((b) => b.id === this.currentBg())?.base ?? '#0F1438';
  }

  stats() {
    const brushes = new Set<string>();
    let stamps = 0;
    for (const c of this.doc.cmds) {
      if (c.t === 'stroke') brushes.add(c.brush);
      if (c.t === 'stamp') stamps++;
      if (c.t === 'fill') brushes.add('fill');
    }
    return { stamps, brushes: [...brushes], background: this.currentBg(), page: this.doc.page };
  }
}

let instance: DrawingEngine | null = null;
export const getEngine = () => (instance ??= new DrawingEngine());
