/**
 * The line-art pen used by every colouring page.
 * Page space: origin at the centre, 1080 units across the short side, y grows downwards.
 * Portrait gives x ±540, y ±720; landscape gives x ±720, y ±540. Keep key art inside ±480.
 * Line widths stay constant however much an element is scaled, so every page reads as one set.
 */
export const LINE = '#1B1B2F';

export type Anchors = Record<string, [number, number]>;

export class Pen {
  readonly anchors: Anchors = {};
  private k: number[] = [1];

  constructor(readonly ctx: CanvasRenderingContext2D, readonly lw: number, readonly hw: number, readonly hh: number) {
    ctx.strokeStyle = LINE;
    ctx.fillStyle = LINE;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }

  private get s() { return this.k[this.k.length - 1]; }

  /** Draw inside a local frame: moved to (x, y), turned by rot radians and scaled by s. */
  at(x: number, y: number, s: number, rot: number, fn: () => void, flip = false) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    if (rot) c.rotate(rot);
    c.scale(flip ? -s : s, s);
    this.k.push(this.s * s);
    fn();
    this.k.pop();
    c.restore();
  }

  /** Mark where a part sits, so its colour can be read back later (in canvas pixels). */
  anchor(id: string | undefined, x: number, y: number) {
    if (!id || this.anchors[id]) return;
    const p = this.ctx.getTransform().transformPoint(new DOMPoint(x, y));
    this.anchors[id] = [p.x, p.y];
  }

  stroke(w = 1) {
    this.ctx.lineWidth = (this.lw * w) / this.s;
    this.ctx.stroke();
  }

  /**
   * When on, closed shapes first erase whatever line art is behind them, so drawing order
   * gives real front-to-back layering. Pages render on their own transparent layer, so this is safe.
   */
  cover = true;

  /** Begin a path, let fn build it, optionally close, then stroke. */
  path(fn: (c: CanvasRenderingContext2D) => void, close = true, w = 1) {
    const c = this.ctx;
    c.beginPath();
    fn(c);
    if (close) {
      c.closePath();
      if (this.cover) this.erase();
    }
    this.stroke(w);
  }

  /** Build a path without drawing it (to erase behind it, for example). */
  trace(fn: (c: CanvasRenderingContext2D) => void) {
    this.ctx.beginPath();
    fn(this.ctx);
  }

  /** Clear the inside of the current path. */
  erase() {
    const c = this.ctx;
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.fill();
    c.restore();
  }

  /** Draw with covering switched off (orbits and guides that pass over other art). */
  see(fn: () => void) {
    const was = this.cover;
    this.cover = false;
    fn();
    this.cover = was;
  }

  poly(pts: number[], close = true, w = 1) {
    this.path((c) => {
      c.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    }, close, w);
  }

  line(x0: number, y0: number, x1: number, y1: number, w = 1) {
    this.poly([x0, y0, x1, y1], false, w);
  }

  circle(x: number, y: number, r: number, w = 1) {
    this.path((c) => c.arc(x, y, r, 0, Math.PI * 2), true, w);
  }

  ellipse(x: number, y: number, rx: number, ry: number, rot = 0, w = 1) {
    this.path((c) => c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2), true, w);
  }

  arc(x: number, y: number, r: number, a0: number, a1: number, w = 1) {
    this.path((c) => c.arc(x, y, r, a0, a1), false, w);
  }

  /** Rectangle by centre. */
  box(cx: number, cy: number, w: number, h: number, r = 0, lw = 1) {
    this.path((c) => {
      if (r > 0) c.roundRect(cx - w / 2, cy - h / 2, w, h, r);
      else c.rect(cx - w / 2, cy - h / 2, w, h);
    }, true, lw);
  }

  /** Solid dot: eyes, rivets, tiny stars. Solid ink is a wall for the fill tool. */
  dot(x: number, y: number, r: number) {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }

  star(x: number, y: number, r: number, n = 5, inner = 0.45, rot = 0) {
    this.path((c) => {
      for (let i = 0; i < n * 2; i++) {
        const a = rot + (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 === 0 ? r : r * inner;
        c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
    });
  }

  /** Four-point twinkle. */
  sparkle(x: number, y: number, r: number) {
    this.path((c) => {
      c.moveTo(x, y - r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.quadraticCurveTo(x, y, x, y + r);
      c.quadraticCurveTo(x, y, x - r, y);
      c.quadraticCurveTo(x, y, x, y - r);
    });
  }

  /** Stroke an SVG path string, drawn in the current local frame. */
  svg(d: string, w = 1) {
    const p = new Path2D(d);
    const c = this.ctx;
    if (this.cover && /z\s*$/i.test(d.trim())) {
      c.save();
      c.globalCompositeOperation = 'destination-out';
      c.fill(p);
      c.restore();
    }
    c.lineWidth = (this.lw * w) / this.s;
    c.stroke(p);
  }

  text(t: string, x: number, y: number, size: number, o: { align?: CanvasTextAlign; outline?: boolean; weight?: number; rot?: number } = {}) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    if (o.rot) c.rotate(o.rot);
    c.font = `${o.weight ?? 800} ${size}px 'Baloo 2', 'Nunito', ui-rounded, system-ui, sans-serif`;
    c.textAlign = o.align ?? 'center';
    c.textBaseline = 'middle';
    if (o.outline) {
      // Hollow bubble letters that children can colour in.
      c.lineWidth = (this.lw * 0.8) / this.s;
      c.strokeText(t, 0, 0);
    } else c.fillText(t, 0, 0);
    c.restore();
  }

  /** Draw fn clipped to the inside of a shape. */
  clipIn(shape: (c: CanvasRenderingContext2D) => void, fn: () => void) {
    const c = this.ctx;
    c.save();
    c.beginPath();
    shape(c);
    c.clip();
    fn();
    c.restore();
  }

  /** Draw fn everywhere except inside a shape (used for rings passing behind planets). */
  clipOut(shape: (c: CanvasRenderingContext2D) => void, fn: () => void) {
    const c = this.ctx;
    c.save();
    c.beginPath();
    c.rect(-5000, -5000, 10000, 10000);
    shape(c);
    c.clip('evenodd');
    fn();
    c.restore();
  }

  /** Scalloped outline: clouds, smoke and nebula puffs. */
  puff(x: number, y: number, rx: number, ry: number, n = 9, bulge = 1.32, w = 1) {
    const pt = (i: number) => {
      const a = (i / n) * Math.PI * 2;
      return [x + Math.cos(a) * rx, y + Math.sin(a) * ry];
    };
    this.path((c) => {
      const [x0, y0] = pt(0);
      c.moveTo(x0, y0);
      for (let i = 0; i < n; i++) {
        const am = ((i + 0.5) / n) * Math.PI * 2;
        const [x1, y1] = pt(i + 1);
        c.quadraticCurveTo(x + Math.cos(am) * rx * bulge, y + Math.sin(am) * ry * bulge, x1, y1);
      }
    }, true, w);
  }
}

/** Small deterministic random source for pages that scatter craters or rocks. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
