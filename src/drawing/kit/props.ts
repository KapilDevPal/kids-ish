import { seeded, type Pen } from './pen';

/** Ground, launch site props and labels. */

export function drawGround(p: Pen, y: number, style: 'flat' | 'hills' | 'moon' | 'mars' | 'sea' | 'grass' = 'flat', seed = 2) {
  const L = -p.hw - 20, R = p.hw + 20;
  const wave = (amp: number, len: number, phase = 0) =>
    p.path((c) => {
      c.moveTo(L, y);
      for (let x = L; x <= R; x += 20) c.lineTo(x, y + Math.sin(x / len + phase) * amp);
    }, false);
  if (style === 'flat') p.line(L, y, R, y);
  else if (style === 'hills' || style === 'grass') {
    wave(24, 90);
    if (style === 'grass') {
      for (let x = L + 60; x < R; x += 140) p.poly([x - 16, y + 60, x - 8, y + 30, x, y + 60, x + 8, y + 26, x + 16, y + 60], false, 0.7);
    }
  } else if (style === 'sea') {
    wave(12, 50);
    p.path((c) => { for (let x = L; x <= R; x += 80) { c.moveTo(x, y + 60); c.quadraticCurveTo(x + 20, y + 44, x + 40, y + 60); } }, false, 0.7);
    p.path((c) => { for (let x = L + 40; x <= R; x += 80) { c.moveTo(x, y + 120); c.quadraticCurveTo(x + 20, y + 104, x + 40, y + 120); } }, false, 0.7);
  } else {
    // Moon or Mars: a gentle horizon with craters or rocks in front.
    p.path((c) => {
      c.moveTo(L, y);
      c.bezierCurveTo(L + (R - L) * 0.3, y - 40, L + (R - L) * 0.6, y + 30, R, y - 10);
    }, false);
    const rnd = seeded(seed);
    const n = Math.round((R - L) / 260);
    for (let i = 0; i < n; i++) {
      const cx = L + ((i + 0.5) / n) * (R - L) + (rnd() - 0.5) * 80;
      const cy = y + 80 + rnd() * 90;
      const cr = 40 + rnd() * 50;
      if (style === 'moon') {
        p.ellipse(cx, cy, cr, cr * 0.3);
        p.path((c) => c.ellipse(cx, cy + cr * 0.05, cr * 0.7, cr * 0.18, 0, Math.PI * 1.05, Math.PI * 1.95), false, 0.6);
      } else {
        p.path((c) => { c.moveTo(cx - cr, cy + cr * 0.3); c.quadraticCurveTo(cx - cr * 0.6, cy - cr * 0.5, cx, cy - cr * 0.4); c.quadraticCurveTo(cx + cr * 0.8, cy - cr * 0.3, cx + cr, cy + cr * 0.3); });
      }
    }
  }
}

export function drawPad(p: Pen, x: number, y: number, w: number) {
  p.poly([x - w / 2, y, x + w / 2, y, x + w / 2 + 40, y + 60, x - w / 2 - 40, y + 60]);
  p.box(x, y + 38, w * 0.3, 40, 6);
}

export function drawTower(p: Pen, x: number, top: number, base: number, w = 80, arms: number[] = [], side: 1 | -1 = -1) {
  const x0 = x - w / 2, x1 = x + w / 2;
  for (const ay of arms) {
    const ax = side < 0 ? x0 : x1;
    p.box(ax + side * 55, ay, 110, 20, 3);
  }
  p.box(x, (top + base) / 2, w, base - top);
  p.see(() => {
    for (let y = top; y < base - 1; y += w) {
      const y1 = Math.min(base, y + w);
      p.line(x0, y1, x1, y1, 0.6);
      p.line(x0, y, x1, y1, 0.6);
    }
  });
  p.box(x, top - 20, w + 30, 40, 4);
  p.line(x, top - 40, x, top - 110);
  p.dot(x, top - 114, 9);
}

export function drawCloud(p: Pen, x: number, y: number, w: number, h: number, n = 9) {
  p.puff(x, y, w / 2, h / 2, n, 1.3);
}

export function drawPalm(p: Pen) {
  p.path((c) => { c.moveTo(-14, 200); c.quadraticCurveTo(-20, 80, 10, 0); c.lineTo(26, 4); c.quadraticCurveTo(4, 80, 14, 200); });
  for (const [a, l] of [[-2.6, 130], [-2.0, 150], [-1.2, 150], [-0.5, 130], [0.1, 110]] as const) {
    p.at(18, 0, 1, a, () => p.path((c) => { c.moveTo(0, 0); c.quadraticCurveTo(l * 0.5, -l * 0.3, l, 10); c.quadraticCurveTo(l * 0.5, -l * 0.02, 0, 0); }));
  }
  p.circle(12, 10, 12);
  p.circle(30, 14, 12);
}

/** The Indian tricolour. The chakra is kept simple so children can colour it in navy blue. */
export function drawFlag(p: Pen, pole = true) {
  if (pole) {
    p.box(-110, 60, 12, 300, 4);
    p.circle(-110, -95, 12);
  }
  p.box(0, -60, 200, 40);
  p.box(0, -20, 200, 40);
  p.box(0, 20, 200, 40);
  p.circle(0, -20, 16, 0.8);
  p.dot(0, -20, 4);
}

export function drawDish(p: Pen) {
  // A deep-space ground antenna, like ISRO's big dish at Byalalu.
  p.poly([-70, 200, 70, 200, 40, 40, -40, 40]);
  p.box(0, 20, 60, 40, 6);
  p.at(0, -40, 1, -0.35, () => {
    p.path((c) => { c.moveTo(-190, -30); c.quadraticCurveTo(0, 150, 190, -30); c.quadraticCurveTo(0, 20, -190, -30); });
    p.line(-120, 10, 0, -160, 0.7);
    p.line(120, 10, 0, -160, 0.7);
    p.box(0, -170, 30, 30, 6);
  });
}

export function drawTelescope(p: Pen) {
  for (const [x0, x1] of [[0, -110], [0, 110], [0, 20]]) p.line(x0, 60, x1, 210);
  p.box(0, 55, 50, 40, 8);
  p.at(0, 20, 1, -0.6, () => {
    p.box(0, 0, 320, 70, 12);
    p.box(170, 0, 40, 96, 8);
    p.box(-170, 0, 30, 40, 6);
    p.line(-60, -35, -60, 35, 0.6);
  });
}

export function drawPlant(p: Pen) {
  // Sprouts in a little space garden pouch.
  p.box(0, 60, 140, 90, 18);
  p.line(-50, 40, 50, 40, 0.6);
  for (const [x, a] of [[-35, -0.4], [0, 0], [35, 0.4]] as const) {
    p.line(x, 15, x + a * 30, -70);
    p.at(x + a * 30, -70, 1, a, () => {
      p.path((c) => { c.moveTo(0, 0); c.quadraticCurveTo(-40, -10, -44, -40); c.quadraticCurveTo(-10, -36, 0, 0); });
      p.path((c) => { c.moveTo(0, 0); c.quadraticCurveTo(40, -10, 44, -40); c.quadraticCurveTo(10, -36, 0, 0); });
    });
  }
}

export function drawCrater(p: Pen, r: number) {
  p.ellipse(0, 0, r, r * 0.34);
  p.path((c) => c.ellipse(0, r * 0.05, r * 0.72, r * 0.2, 0, Math.PI * 1.05, Math.PI * 1.95), false, 0.7);
}

// ---------- Words ----------

export function drawTag(p: Pen, t: string, x: number, y: number, to?: [number, number], size = 34, align: CanvasTextAlign = 'center') {
  if (to) {
    p.see(() => p.line(x + (align === 'left' ? -12 : align === 'right' ? 12 : 0), y, to[0], to[1], 0.5));
    p.dot(to[0], to[1], 7);
  }
  const c = p.ctx;
  c.save();
  c.font = `800 ${size}px 'Baloo 2', 'Nunito', ui-rounded, system-ui, sans-serif`;
  const tw = c.measureText(t).width;
  c.restore();
  const bx = align === 'left' ? x + tw / 2 : align === 'right' ? x - tw / 2 : x;
  p.box(bx, y, tw + 28, size * 1.45, size * 0.7, 0.6);
  p.text(t, bx, y + size * 0.06, size);
}

export function drawNumber(p: Pen, n: number | string, x: number, y: number, r = 30) {
  p.circle(x, y, r, 0.8);
  p.text(String(n), x, y + r * 0.08, r * 1.2);
}

export function drawArrow(p: Pen, from: [number, number], to: [number, number]) {
  const [x0, y0] = from, [x1, y1] = to;
  const a = Math.atan2(y1 - y0, x1 - x0);
  p.see(() => p.line(x0, y0, x1 - Math.cos(a) * 20, y1 - Math.sin(a) * 20, 0.8));
  p.poly([x1, y1, x1 - Math.cos(a - 0.45) * 42, y1 - Math.sin(a - 0.45) * 42, x1 - Math.cos(a + 0.45) * 42, y1 - Math.sin(a + 0.45) * 42]);
}
