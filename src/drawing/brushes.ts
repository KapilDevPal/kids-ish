import { rng, type BrushId, type StrokeCmd } from './types';

export interface BrushDef {
  id: BrushId;
  name: string;
  hint: string;
}

export const BRUSHES: BrushDef[] = [
  { id: 'pencil', name: 'Pencil', hint: 'Thin lines for details' },
  { id: 'marker', name: 'Marker', hint: 'Bold, chunky colour' },
  { id: 'crayon', name: 'Crayon', hint: 'Soft, waxy colouring' },
  { id: 'neon', name: 'Neon', hint: 'Glows like a rocket flame' },
  { id: 'stars', name: 'Star spray', hint: 'Sprinkle a galaxy' },
  { id: 'rainbow', name: 'Rainbow', hint: 'Changes colour as you draw' },
  { id: 'eraser', name: 'Eraser', hint: 'Rub out your lines' },
];

/** Running state for one stroke, so live drawing and replay produce identical pixels. */
export interface StrokeState {
  dist: number;
  sprayAcc: number;
  rand: () => number;
}

export const newStrokeState = (cmd: StrokeCmd): StrokeState => ({ dist: 0, sprayAcc: 0, rand: rng(cmd.seed) });

const width = (c: StrokeCmd) => {
  switch (c.brush) {
    case 'pencil': return Math.max(3, c.size * 0.4);
    case 'eraser': return c.size * 1.5;
    case 'neon': return c.size * 0.55;
    default: return c.size;
  }
};

type P = [number, number];

function segment(ctx: CanvasRenderingContext2D, c: StrokeCmd, st: StrokeState, a: P, ctrl: P | null, b: P) {
  const len = ctrl ? Math.hypot(ctrl[0] - a[0], ctrl[1] - a[1]) + Math.hypot(b[0] - ctrl[0], b[1] - ctrl[1]) : Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (c.brush === 'stars') {
    spray(ctx, c, st, a, ctrl, b, len);
    st.dist += len;
    return;
  }
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    if (ctrl) ctx.quadraticCurveTo(ctrl[0], ctrl[1], b[0], b[1]);
    else ctx.lineTo(b[0] + 0.01, b[1]);
  };
  const w = width(c);
  if (c.brush === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = w;
    path();
    ctx.stroke();
  } else if (c.brush === 'neon') {
    ctx.shadowColor = c.color;
    ctx.shadowBlur = c.size * 0.9;
    ctx.strokeStyle = c.color;
    ctx.lineWidth = w;
    path();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, w * 0.35);
    path();
    ctx.stroke();
  } else if (c.brush === 'crayon') {
    // A few thin, jittered passes give a waxy crayon grain. The seeded random keeps replay identical.
    ctx.strokeStyle = c.color;
    ctx.globalAlpha = 0.6;
    for (let k = 0; k < 4; k++) {
      const ox = (st.rand() - 0.5) * w * 0.35, oy = (st.rand() - 0.5) * w * 0.35;
      ctx.lineWidth = w * (0.3 + st.rand() * 0.25);
      ctx.beginPath();
      ctx.moveTo(a[0] + ox, a[1] + oy);
      if (ctrl) ctx.quadraticCurveTo(ctrl[0] + ox, ctrl[1] + oy, b[0] + ox, b[1] + oy);
      else ctx.lineTo(b[0] + ox + 0.01, b[1] + oy);
      ctx.stroke();
    }
  } else if (c.brush === 'rainbow') {
    // Split into short pieces so the hue flows smoothly along the line.
    const steps = Math.max(1, Math.ceil(len / 6));
    ctx.lineWidth = w;
    let prev = a;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const p = ctrl ? quad(a, ctrl, b, t) : lerp(a, b, t);
      ctx.strokeStyle = `hsl(${(st.dist + len * t) * 0.45 % 360} 95% 60%)`;
      ctx.beginPath();
      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(p[0] + 0.01, p[1]);
      ctx.stroke();
      prev = p;
    }
  } else {
    ctx.strokeStyle = c.color;
    ctx.lineWidth = w;
    path();
    ctx.stroke();
  }
  ctx.restore();
  st.dist += len;
}

function spray(ctx: CanvasRenderingContext2D, c: StrokeCmd, st: StrokeState, a: P, ctrl: P | null, b: P, len: number) {
  const gap = Math.max(6, c.size * 0.45);
  st.sprayAcc += len;
  const radius = c.size * 1.3;
  ctx.save();
  while (st.sprayAcc >= gap) {
    st.sprayAcc -= gap;
    const t = len > 0 ? 1 - st.sprayAcc / Math.max(len, 1) : 1;
    const p = ctrl ? quad(a, ctrl, b, Math.min(1, Math.max(0, t))) : lerp(a, b, Math.min(1, Math.max(0, t)));
    for (let k = 0; k < 2; k++) {
      const ang = st.rand() * Math.PI * 2;
      const r = Math.sqrt(st.rand()) * radius;
      const x = p[0] + Math.cos(ang) * r;
      const y = p[1] + Math.sin(ang) * r;
      const s = 2 + st.rand() * (c.size * 0.22 + 3);
      const white = st.rand() < 0.35;
      ctx.fillStyle = white ? '#ffffff' : c.color;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = s * 1.6;
      if (st.rand() < 0.45) sparkle(ctx, x, y, s * 1.6);
      else {
        ctx.beginPath();
        ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

export function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.28;
    ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const quad = (a: P, c: P, b: P, t: number): P => {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
};
const pt = (c: StrokeCmd, i: number): P => [c.pts[i * 2], c.pts[i * 2 + 1]];
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** Draw whatever became drawable after point i was added (smoothed with midpoint quadratics). */
export function strokeStep(ctx: CanvasRenderingContext2D, c: StrokeCmd, st: StrokeState, i: number) {
  if (i === 0) {
    const p = pt(c, 0);
    if (c.brush === 'stars') {
      st.sprayAcc = Math.max(6, c.size * 0.45) * 3;
      spray(ctx, c, st, p, null, p, 0);
    } else segment(ctx, c, st, p, null, p);
    return;
  }
  if (i === 1) segment(ctx, c, st, pt(c, 0), null, mid(pt(c, 0), pt(c, 1)));
  else segment(ctx, c, st, mid(pt(c, i - 2), pt(c, i - 1)), pt(c, i - 1), mid(pt(c, i - 1), pt(c, i)));
}

export function strokeEnd(ctx: CanvasRenderingContext2D, c: StrokeCmd, st: StrokeState) {
  const n = c.pts.length / 2;
  if (n < 2) return;
  segment(ctx, c, st, mid(pt(c, n - 2), pt(c, n - 1)), null, pt(c, n - 1));
}

export function drawStroke(ctx: CanvasRenderingContext2D, c: StrokeCmd) {
  const st = newStrokeState(c);
  const n = c.pts.length / 2;
  for (let i = 0; i < n; i++) strokeStep(ctx, c, st, i);
  strokeEnd(ctx, c, st);
}
