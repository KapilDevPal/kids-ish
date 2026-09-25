import { seeded, type Pen } from './pen';
import type { Star } from './types';

/** Sky line art: worlds, stars and deep-space things. All sizes are in page units. */

export function drawStars(p: Pen, at: Star[], style: 'star' | 'sparkle' | 'mix' = 'mix') {
  at.forEach(([x, y, r], i) => {
    if (style === 'sparkle' || (style === 'mix' && i % 3 === 2)) p.sparkle(x, y, r);
    else p.star(x, y, r);
  });
}

export function drawFace(p: Pen, x: number, y: number, r: number) {
  p.dot(x - r * 0.32, y - r * 0.12, r * 0.09);
  p.dot(x + r * 0.32, y - r * 0.12, r * 0.09);
  p.arc(x, y + r * 0.08, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI, 0.9);
  p.circle(x - r * 0.52, y + r * 0.18, r * 0.1, 0.6);
  p.circle(x + r * 0.52, y + r * 0.18, r * 0.1, 0.6);
}

export function drawCraters(p: Pen, x: number, y: number, r: number, n: number, seed = 1, avoidFace = false) {
  const rnd = seeded(seed);
  const placed: [number, number, number][] = [];
  for (let tries = 0; placed.length < n && tries < n * 30; tries++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r * 0.72;
    const cr = r * (0.08 + rnd() * 0.12);
    const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d;
    if (Math.hypot(cx - x, cy - y) + cr > r * 0.9) continue;
    if (avoidFace && Math.abs(cy - y) < r * 0.45 && Math.abs(cx - x) < r * 0.7) continue;
    if (placed.some(([px, py, pr]) => Math.hypot(px - cx, py - cy) < pr + cr + r * 0.05)) continue;
    placed.push([cx, cy, cr]);
  }
  for (const [cx, cy, cr] of placed) {
    p.ellipse(cx, cy, cr, cr * 0.85, 0, 0.8);
    p.arc(cx + cr * 0.1, cy + cr * 0.1, cr * 0.6, 0.9 * Math.PI, 1.6 * Math.PI, 0.6);
  }
}

export function drawPlanet(p: Pen, o: { x: number; y: number; r: number; ring?: number; tilt?: number; bands?: number; spot?: boolean; craters?: number; face?: boolean; id?: string; seed?: number }) {
  const { x, y, r } = o;
  const tilt = o.tilt ?? -0.3;
  const R = r * (o.ring ?? 0);
  const ringPath = (c: CanvasRenderingContext2D, k: number, a0: number, a1: number, ccw = false) => c.ellipse(x, y, R * k, R * k * 0.3, tilt, a0, a1, ccw);
  if (R) {
    // Whole ring first (see-through), the planet then covers its back half.
    p.see(() => {
      p.path((c) => ringPath(c, 1, 0, Math.PI * 2));
      p.path((c) => ringPath(c, 0.78, 0, Math.PI * 2));
    });
  }
  p.circle(x, y, r);
  p.clipIn((c) => c.arc(x, y, r, 0, Math.PI * 2), () => {
    const n = o.bands ?? 0;
    for (let i = 1; i <= n; i++) {
      const by = y - r + (2 * r * i) / (n + 1);
      p.path((c) => {
        c.moveTo(x - r, by);
        c.bezierCurveTo(x - r * 0.3, by - r * 0.12, x + r * 0.3, by + r * 0.12, x + r, by);
      }, false, 0.8);
    }
    if (o.spot) p.ellipse(x + r * 0.3, y + r * 0.28, r * 0.24, r * 0.14, 0, 0.8);
  });
  if (o.craters) drawCraters(p, x, y, r, o.craters, o.seed ?? 3, o.face);
  if (o.face) drawFace(p, x, y, r);
  if (R) {
    // Front half of the ring passes over the planet.
    p.trace((c) => {
      ringPath(c, 1, 0, Math.PI);
      ringPath(c, 0.78, Math.PI, 0, true);
    });
    p.erase();
    p.path((c) => ringPath(c, 1, 0, Math.PI), false);
    p.path((c) => ringPath(c, 0.78, 0, Math.PI), false);
    p.anchor(o.id ? 'rings' : undefined, x + R * 0.89, y);
  }
  p.anchor(o.id, x - r * 0.35, y - r * 0.45);
}

export function drawMoon(p: Pen, o: { x: number; y: number; r: number; craters?: number; phase?: number; face?: boolean; seed?: number }) {
  const { x, y, r } = o;
  p.circle(x, y, r);
  if (o.phase != null) {
    // Terminator: the line between day and night. 0 new, 0.5 full, 1 new again.
    const t = o.phase;
    const k = Math.cos(t * Math.PI * 2);
    const waxing = t < 0.5;
    p.path((c) => {
      c.moveTo(x, y - r);
      c.ellipse(x, y, Math.abs(k) * r, r, 0, -Math.PI / 2, Math.PI / 2, (k > 0) !== waxing);
    }, false);
  }
  if (o.craters) drawCraters(p, x, y, r, o.craters, o.seed ?? 7, o.face);
  if (o.face) drawFace(p, x, y, r);
}

export function drawSun(p: Pen, o: { x: number; y: number; r: number; rays?: number; face?: boolean; corona?: boolean }) {
  const { x, y, r } = o;
  const n = o.rays ?? 12;
  if (o.corona) p.puff(x, y, r * 1.35, r * 1.35, 14, 1.18);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const a0 = a - Math.PI / n * 0.55, a1 = a + Math.PI / n * 0.55;
    p.poly([
      x + Math.cos(a0) * r * 1.08, y + Math.sin(a0) * r * 1.08,
      x + Math.cos(a) * r * 1.55, y + Math.sin(a) * r * 1.55,
      x + Math.cos(a1) * r * 1.08, y + Math.sin(a1) * r * 1.08,
    ]);
  }
  p.circle(x, y, r);
  if (o.face) drawFace(p, x, y, r);
  else {
    p.circle(x - r * 0.3, y - r * 0.2, r * 0.14, 0.7);
    p.circle(x + r * 0.35, y + r * 0.3, r * 0.1, 0.7);
  }
}

const CONTINENTS = [
  'M-0.55 -0.55 C-0.2 -0.75 0.05 -0.5 -0.1 -0.3 C-0.25 -0.1 -0.1 0.1 -0.3 0.25 C-0.5 0.35 -0.75 0.1 -0.7 -0.2 Z',
  'M0.15 -0.2 C0.35 -0.35 0.65 -0.25 0.7 0 C0.75 0.25 0.5 0.3 0.45 0.55 C0.35 0.7 0.15 0.5 0.2 0.3 C0.25 0.1 0.05 0 0.15 -0.2 Z',
  'M-0.35 0.55 C-0.2 0.5 -0.05 0.62 -0.12 0.75 C-0.25 0.85 -0.45 0.72 -0.35 0.55 Z',
];

export function drawEarth(p: Pen, o: { x: number; y: number; r: number; face?: boolean }) {
  const { x, y, r } = o;
  p.circle(x, y, r);
  p.clipIn((c) => c.arc(x, y, r * 0.98, 0, Math.PI * 2), () => {
    p.at(x, y, r, 0, () => CONTINENTS.forEach((d) => p.svg(d, 0.8)));
  });
  if (o.face) drawFace(p, x, y + r * 0.1, r * 0.8);
}

export function drawGalaxy(p: Pen, o: { x: number; y: number; r: number; arms?: number; tilt?: number }) {
  const { x, y, r } = o;
  const n = o.arms ?? 3;
  const flat = 0.62;
  p.at(x, y, 1, o.tilt ?? 0, () => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const pt = (t: number, w: number): [number, number] => {
        const ang = a + t * 2.6;
        const rr = r * (0.18 + t * 0.82);
        return [Math.cos(ang) * rr + Math.cos(ang + Math.PI / 2) * w, (Math.sin(ang) * rr + Math.sin(ang + Math.PI / 2) * w) * flat];
      };
      p.path((c) => {
        c.moveTo(...pt(0, 0));
        for (let t = 0.05; t <= 1.001; t += 0.05) c.lineTo(...pt(t, r * 0.3 * Math.sin(t * Math.PI)));
        for (let t = 1; t >= 0; t -= 0.05) c.lineTo(...pt(t, -r * 0.1 * Math.sin(t * Math.PI)));
      });
    }
    p.ellipse(0, 0, r * 0.26, r * 0.26 * flat);
  });
}

export function drawNebula(p: Pen, o: { x: number; y: number; w: number; h: number; seed?: number }) {
  const rnd = seeded(o.seed ?? 11);
  const puffs = 7;
  for (let i = 0; i < puffs; i++) {
    const px = o.x + (rnd() - 0.5) * o.w * 0.8;
    const py = o.y + (rnd() - 0.5) * o.h * 0.7;
    const rx = o.w * (0.16 + rnd() * 0.14), ry = rx * (0.6 + rnd() * 0.3);
    p.puff(px, py, rx, ry, 8 + (i % 3), 1.25);
  }
}

export function drawComet(p: Pen, o: { x: number; y: number; r: number; dir?: number; len?: number }) {
  const dir = o.dir ?? Math.PI * 0.8;
  const L = o.len ?? o.r * 6;
  p.at(o.x, o.y, 1, dir, () => {
    const r = o.r;
    // Tails stream away from the head along +x
    p.path((c) => { c.moveTo(0, -r); c.bezierCurveTo(L * 0.4, -r * 1.6, L * 0.8, -r * 1.1, L, -r * 1.4); c.bezierCurveTo(L * 0.7, -r * 0.2, L * 0.4, r * 0.2, 0, r); });
    p.path((c) => { c.moveTo(0, r * 0.2); c.bezierCurveTo(L * 0.3, r * 0.8, L * 0.6, r * 1.6, L * 0.85, r * 2); c.bezierCurveTo(L * 0.5, r * 0.8, L * 0.3, r * 0.4, 0, r); });
    p.circle(0, 0, r);
    p.circle(-r * 0.25, -r * 0.2, r * 0.3, 0.6);
  });
}

export function drawAsteroid(p: Pen, o: { x: number; y: number; r: number; seed?: number }) {
  const rnd = seeded(o.seed ?? 5);
  const n = 11;
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = o.r * (0.78 + rnd() * 0.3);
    pts.push(o.x + Math.cos(a) * rr, o.y + Math.sin(a) * rr * 0.8);
  }
  p.path((c) => {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const mx = (pts[i * 2] + pts[j * 2]) / 2, my = (pts[i * 2 + 1] + pts[j * 2 + 1]) / 2;
      if (i === 0) c.moveTo(mx, my);
      else c.quadraticCurveTo(pts[i * 2], pts[i * 2 + 1], mx, my);
    }
    c.quadraticCurveTo(pts[0], pts[1], (pts[0] + pts[2]) / 2, (pts[1] + pts[3]) / 2);
  });
  drawCraters(p, o.x, o.y, o.r * 0.8, Math.max(1, Math.round(o.r / 30)), o.seed ?? 5);
}

export function drawBlackHole(p: Pen, o: { x: number; y: number; r: number }) {
  const { x, y, r } = o;
  const disk = (c: CanvasRenderingContext2D, k: number, a0: number, a1: number, ccw = false) => c.ellipse(x, y, r * k, r * k * 0.28, -0.12, a0, a1, ccw);
  p.see(() => {
    p.path((c) => disk(c, 2.6, 0, Math.PI * 2));
    p.path((c) => disk(c, 1.9, 0, Math.PI * 2));
    p.path((c) => disk(c, 1.3, 0, Math.PI * 2));
  });
  p.circle(x, y, r * 1.12);
  const c = p.ctx;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
  p.trace((cc) => { disk(cc, 2.6, 0, Math.PI); disk(cc, 1.3, Math.PI, 0, true); });
  p.erase();
  for (const k of [2.6, 1.9, 1.3]) p.path((cc) => disk(cc, k, 0, Math.PI), false);
}

export function drawConstellation(p: Pen, pts: [number, number][], links: [number, number][], r = 26) {
  p.see(() => links.forEach(([a, b]) => p.line(pts[a][0], pts[a][1], pts[b][0], pts[b][1], 0.5)));
  pts.forEach(([x, y]) => p.star(x, y, r));
}

export function drawOrbit(p: Pen, o: { x: number; y: number; rx: number; ry: number; rot?: number }) {
  p.see(() => p.ellipse(o.x, o.y, o.rx, o.ry, o.rot ?? 0, 0.6));
}

/** A fan of wedges, like signals or a rainbow of colours a camera can see. */
export function drawBeam(p: Pen, o: { x: number; y: number; dir: number; n?: number; r?: number }) {
  const n = o.n ?? 5, R = o.r ?? 300;
  const spread = 0.5;
  for (let i = 0; i < n; i++) {
    const a0 = o.dir - spread / 2 + (spread * i) / n;
    const a1 = a0 + spread / n;
    p.poly([o.x, o.y, o.x + Math.cos(a0) * R, o.y + Math.sin(a0) * R, o.x + Math.cos(a1) * R, o.y + Math.sin(a1) * R]);
  }
}

export function drawDebris(p: Pen, at: Star[]) {
  at.forEach(([x, y, r], i) => {
    if (i % 3 === 0) p.poly([x - r, y - r * 0.4, x + r * 0.6, y - r, x + r, y + r * 0.5, x - r * 0.3, y + r]);
    else if (i % 3 === 1) p.box(x, y, r * 1.8, r * 0.9, 2);
    else p.poly([x - r, y, x, y - r * 0.8, x + r * 0.9, y + r * 0.2]);
  });
}
