import type { Pen } from './pen';

/**
 * Rockets are described as data: a stack of stages (bottom to top), a nose, optional boosters and fins.
 * The builder draws each piece as its own closed shape so every stage can be filled separately,
 * and marks part anchors whose ids match the 3D Hangar model where one exists.
 * Local frame: x = 0 is the centre line, y = 0 is the bottom of the first stage, up is negative.
 */
type Deco = 'bands' | 'stripe' | 'flag' | 'isro' | 'window' | 'grid';

export interface RocketSpec {
  stages: { h: number; w: number; id?: string; deco?: Deco[] }[];
  nose: { w: number; cyl?: number; h: number; shape: 'ogive' | 'cone' | 'round' | 'crew'; id?: string };
  boosters?: { per: 1 | 2; w: number; h: number; nose: number; id?: string; bands?: boolean };
  fins?: { w: number; h: number; mid?: boolean };
  nozzles?: { n: number; w: number; h: number; id?: string };
}


export const ROCKETS = {
  pslv: {
    stages: [
      { h: 300, w: 94, id: 'core', deco: ['bands'] },
      { h: 190, w: 94, id: 'stage2', deco: ['isro'] },
      { h: 90, w: 73, id: 'stage3' },
      { h: 50, w: 73, id: 'stage4' },
    ],
    nose: { w: 109, cyl: 90, h: 110, shape: 'ogive', id: 'fairing' },
    boosters: { per: 2, w: 39, h: 190, nose: 42, id: 'boosters' },
    nozzles: { n: 1, w: 60, h: 34, id: 'engine' },
  },
  'pslv-ql': {
    stages: [
      { h: 300, w: 94, id: 'core', deco: ['bands'] },
      { h: 190, w: 94, id: 'stage2', deco: ['isro'] },
      { h: 90, w: 73, id: 'stage3' },
      { h: 50, w: 73, id: 'stage4' },
    ],
    nose: { w: 109, cyl: 90, h: 110, shape: 'ogive', id: 'fairing' },
    boosters: { per: 1, w: 39, h: 190, nose: 42, id: 'boosters' },
    nozzles: { n: 1, w: 60, h: 34, id: 'engine' },
  },
  'pslv-ca': {
    stages: [
      { h: 300, w: 94, id: 'core', deco: ['bands'] },
      { h: 190, w: 94, id: 'stage2', deco: ['isro'] },
      { h: 90, w: 73, id: 'stage3' },
      { h: 50, w: 73, id: 'stage4' },
    ],
    nose: { w: 109, cyl: 90, h: 110, shape: 'ogive', id: 'fairing' },
    nozzles: { n: 1, w: 60, h: 34, id: 'engine' },
  },
  gslv: {
    stages: [
      { h: 290, w: 91, id: 'core', deco: ['bands'] },
      { h: 170, w: 91, id: 'stage2', deco: ['isro'] },
      { h: 120, w: 91, id: 'upper', deco: ['stripe'] },
    ],
    nose: { w: 130, cyl: 100, h: 115, shape: 'ogive', id: 'fairing' },
    boosters: { per: 1, w: 44, h: 270, nose: 56, id: 'boosters', bands: true },
    nozzles: { n: 1, w: 57, h: 32, id: 'engine' },
  },
  lvm3: {
    stages: [
      { h: 320, w: 107, id: 'core', deco: ['bands'] },
      { h: 120, w: 107, id: 'upper', deco: ['flag'] },
    ],
    nose: { w: 153, cyl: 120, h: 110, shape: 'ogive', id: 'nose' },
    boosters: { per: 1, w: 83, h: 400, nose: 74, id: 'boosters', bands: true },
    nozzles: { n: 2, w: 39, h: 30, id: 'engine' },
  },
  'lvm3-crew': {
    stages: [
      { h: 320, w: 107, id: 'core', deco: ['bands'] },
      { h: 120, w: 107, id: 'upper', deco: ['flag'] },
    ],
    nose: { w: 135, cyl: 40, h: 150, shape: 'crew', id: 'nose' },
    boosters: { per: 1, w: 83, h: 400, nose: 74, id: 'boosters', bands: true },
    nozzles: { n: 2, w: 39, h: 30, id: 'engine' },
  },
  sslv: {
    stages: [
      { h: 250, w: 65, deco: ['bands'] },
      { h: 120, w: 65, deco: ['isro'] },
      { h: 70, w: 65 },
      { h: 34, w: 65 },
    ],
    nose: { w: 78, cyl: 60, h: 90, shape: 'ogive' },
    nozzles: { n: 1, w: 47, h: 26 },
  },
  slv3: {
    stages: [{ h: 200, w: 52 }, { h: 150, w: 52 }, { h: 90, w: 44 }, { h: 60, w: 44 }],
    nose: { w: 44, h: 80, shape: 'cone' },
    fins: { w: 52, h: 80 },
    nozzles: { n: 1, w: 39, h: 22 },
  },
  aslv: {
    stages: [{ h: 200, w: 52 }, { h: 150, w: 52 }, { h: 90, w: 44 }, { h: 60, w: 44 }],
    nose: { w: 52, cyl: 30, h: 80, shape: 'ogive' },
    boosters: { per: 1, w: 44, h: 200, nose: 50 },
    fins: { w: 39, h: 60 },
    nozzles: { n: 1, w: 39, h: 22 },
  },
  rohini: {
    stages: [{ h: 360, w: 39, deco: ['bands'] }],
    nose: { w: 39, h: 90, shape: 'ogive' },
    fins: { w: 52, h: 70 },
    nozzles: { n: 1, w: 29, h: 18 },
  },
  'nike-apache': {
    stages: [{ h: 170, w: 39 }, { h: 170, w: 29 }],
    nose: { w: 29, h: 70, shape: 'cone' },
    fins: { w: 52, h: 60 },
    nozzles: { n: 1, w: 26, h: 16 },
  },
  'vikram-s': {
    stages: [{ h: 330, w: 75, deco: ['bands', 'flag'] }],
    nose: { w: 75, h: 130, shape: 'ogive' },
    fins: { w: 68, h: 90, mid: true },
    nozzles: { n: 1, w: 52, h: 30 },
  },
  'vikram-1': {
    stages: [
      { h: 240, w: 78, deco: ['bands'] },
      { h: 160, w: 78 },
      { h: 90, w: 68 },
      { h: 40, w: 68 },
    ],
    nose: { w: 91, cyl: 70, h: 95, shape: 'ogive' },
    nozzles: { n: 1, w: 55, h: 30 },
  },
  agnibaan: {
    stages: [
      { h: 250, w: 81, deco: ['bands'] },
      { h: 120, w: 81, deco: ['flag'] },
    ],
    nose: { w: 86, cyl: 50, h: 95, shape: 'ogive' },
    nozzles: { n: 3, w: 26, h: 26 },
  },
  'agnibaan-sorted': {
    stages: [{ h: 300, w: 78, deco: ['bands', 'flag'] }],
    nose: { w: 78, h: 110, shape: 'ogive' },
    fins: { w: 44, h: 60 },
    nozzles: { n: 1, w: 47, h: 28 },
  },
  toy: {
    stages: [{ h: 230, w: 169, deco: ['window'] }],
    nose: { w: 169, h: 150, shape: 'ogive' },
    fins: { w: 91, h: 120, mid: true },
    nozzles: { n: 1, w: 91, h: 36 },
  },
  ngl: {
    stages: [
      { h: 330, w: 117, deco: ['bands'] },
      { h: 150, w: 117, deco: ['isro'] },
    ],
    nose: { w: 143, cyl: 110, h: 110, shape: 'ogive' },
    boosters: { per: 1, w: 78, h: 330, nose: 70 },
    nozzles: { n: 3, w: 34, h: 26 },
    fins: { w: 34, h: 50 },
  },
} satisfies Record<string, RocketSpec>;

export type RocketId = keyof typeof ROCKETS;

export function rocketHeight(spec: RocketSpec) {
  let h = 0, w = spec.stages[0].w;
  for (const st of spec.stages) {
    if (st.w !== w) h += Math.abs(st.w - w) * 0.6;
    h += st.h;
    w = st.w;
  }
  if (spec.nose.w !== w) h += Math.abs(spec.nose.w - w) * 0.6;
  return h + (spec.nose.cyl ?? 0) + spec.nose.h;
}

function nosePath(c: CanvasRenderingContext2D, y: number, w: number, h: number, shape: RocketSpec['nose']['shape']) {
  const hw = w / 2;
  c.moveTo(-hw, y);
  if (shape === 'cone') {
    c.lineTo(0, y - h);
    c.lineTo(hw, y);
  } else if (shape === 'round') {
    c.quadraticCurveTo(-hw, y - h, 0, y - h);
    c.quadraticCurveTo(hw, y - h, hw, y);
  } else {
    c.bezierCurveTo(-hw, y - h * 0.6, -w * 0.2, y - h, 0, y - h);
    c.bezierCurveTo(w * 0.2, y - h, hw, y - h * 0.6, hw, y);
  }
}

function flame(p: Pen, x: number, y: number, w: number, big: boolean) {
  const L = big ? w * 4.2 : w * 2.4;
  p.path((c) => {
    c.moveTo(x - w * 0.55, y);
    c.bezierCurveTo(x - w * 0.8, y + L * 0.45, x - w * 0.2, y + L * 0.8, x, y + L);
    c.bezierCurveTo(x + w * 0.2, y + L * 0.8, x + w * 0.8, y + L * 0.45, x + w * 0.55, y);
  });
  p.path((c) => {
    c.moveTo(x - w * 0.28, y);
    c.bezierCurveTo(x - w * 0.4, y + L * 0.3, x - w * 0.1, y + L * 0.5, x, y + L * 0.62);
    c.bezierCurveTo(x + w * 0.1, y + L * 0.5, x + w * 0.4, y + L * 0.3, x + w * 0.28, y);
  });
}

function nozzle(p: Pen, x: number, y: number, w: number, h: number) {
  p.poly([x - w * 0.3, y, x + w * 0.3, y, x + w * 0.5, y + h, x - w * 0.5, y + h]);
}

function stageDeco(p: Pen, deco: Deco[] | undefined, w: number, y0: number, h: number) {
  if (!deco) return;
  const hw = w / 2;
  for (const d of deco) {
    if (d === 'bands') {
      p.line(-hw, y0 - h * 0.18, hw, y0 - h * 0.18);
      p.line(-hw, y0 - h * 0.82, hw, y0 - h * 0.82);
    } else if (d === 'stripe') {
      p.line(-hw, y0 - h * 0.4, hw, y0 - h * 0.4);
      p.line(-hw, y0 - h * 0.6, hw, y0 - h * 0.6);
    } else if (d === 'flag') {
      const fw = Math.min(w * 0.5, 40), fh = fw * 0.66, fy = y0 - h * 0.5 - fh / 2;
      p.box(0, fy + fh / 2, fw, fh);
      p.line(-fw / 2, fy + fh / 3, fw / 2, fy + fh / 3, 0.6);
      p.line(-fw / 2, fy + (fh * 2) / 3, fw / 2, fy + (fh * 2) / 3, 0.6);
    } else if (d === 'isro' && w >= 44) {
      p.text('ISRO', 0, y0 - h / 2, Math.min(w * 0.42, 30), { rot: -Math.PI / 2 });
    } else if (d === 'window') {
      p.circle(0, y0 - h * 0.62, w * 0.24);
      p.circle(0, y0 - h * 0.62, w * 0.16, 0.7);
    } else if (d === 'grid') {
      for (let i = 1; i < 4; i++) p.line(-hw, y0 - (h * i) / 4, hw, y0 - (h * i) / 4, 0.7);
    }
  }
}

export function drawRocket(p: Pen, spec: RocketSpec, opts: { flame?: boolean | 'big'; parts?: boolean }) {
  const id = (s?: string) => (opts.parts ? s : undefined);
  const core = spec.stages[0];
  const nz = spec.nozzles;

  // Flames first, so nozzles and boosters sit on top of them.
  if (opts.flame && nz) {
    const big = opts.flame === 'big';
    nozzleXs(nz.n, core.w).forEach((x) => flame(p, x, nz.h, nz.w, big));
    if (spec.boosters) boosterXs(spec).forEach((x) => flame(p, x, spec.boosters!.w * 0.5, spec.boosters!.w * 0.7, big));
  }

  // Boosters beside the core stage.
  const b = spec.boosters;
  if (b) {
    boosterXs(spec).forEach((cx, i) => {
      p.box(cx, -b.h / 2, b.w, b.h);
      if (b.bands) p.line(cx - b.w / 2, -b.h * 0.2, cx + b.w / 2, -b.h * 0.2);
      p.path((c) => nosePath(c, -b.h, b.w, b.nose, 'ogive'));
      nozzle(p, cx, 0, b.w * 0.8, b.w * 0.45);
      if (i === 0) p.anchor(id(b.id), cx, -b.h * 0.55);
    });
  }

  // Fins at the base.
  if (spec.fins) {
    const { w: fw, h: fh } = spec.fins;
    for (const s of [-1, 1]) {
      const x = s * (core.w / 2);
      p.poly([x, -fh, x + s * fw, -fh * 0.2, x + s * fw, fh * 0.25, x, 0]);
    }
  }

  // Nozzles under the core.
  if (nz) {
    nozzleXs(nz.n, core.w).forEach((x, i) => {
      nozzle(p, x, 0, nz.w, nz.h);
      if (i === 0) p.anchor(id(nz.id), x, nz.h * 0.55);
    });
  }

  // The stack.
  let y = 0, w = core.w;
  for (const st of spec.stages) {
    if (st.w !== w) {
      const ah = Math.abs(st.w - w) * 0.6;
      p.poly([-w / 2, y, w / 2, y, st.w / 2, y - ah, -st.w / 2, y - ah]);
      y -= ah;
      w = st.w;
    }
    p.box(0, y - st.h / 2, st.w, st.h);
    stageDeco(p, st.deco, st.w, y, st.h);
    if (y === 0 && spec.fins?.mid) {
      // A fin pointing at us sits in front of the first stage.
      const fh = spec.fins.h, fw = core.w * 0.09;
      p.poly([-fw, -fh * 0.75, fw, -fh * 0.75, fw, fh * 0.22, -fw, fh * 0.22]);
    }
    // Off-centre so the sample lands in paint, not on a flag or label.
    p.anchor(id(st.id), st.w * 0.36, y - st.h * 0.5);
    y -= st.h;
  }

  // Nose: adapter, then a cylinder, then the tip.
  const n = spec.nose;
  if (n.w !== w) {
    const ah = Math.abs(n.w - w) * 0.6;
    p.poly([-w / 2, y, w / 2, y, n.w / 2, y - ah, -n.w / 2, y - ah]);
    y -= ah;
  }
  if (n.shape === 'crew') {
    crewTop(p, y, n.w, n.cyl ?? 40, n.h);
    p.anchor(id(n.id), n.w * 0.2, y - (n.cyl ?? 40) / 2);
    return;
  }
  if (n.cyl) {
    p.box(0, y - n.cyl / 2, n.w, n.cyl);
    p.anchor(id(n.id), n.w * 0.25, y - n.cyl / 2);
    y -= n.cyl;
  } else p.anchor(id(n.id), 0, y - n.h * 0.3);
  p.path((c) => nosePath(c, y, n.w, n.h, n.shape));
}

/** Human-rated top: crew module fairing and the crew escape tower. */
function crewTop(p: Pen, y: number, w: number, cyl: number, h: number) {
  p.box(0, y - cyl / 2, w, cyl);
  y -= cyl;
  const ch = h * 0.55;
  p.poly([-w / 2, y, w / 2, y, w * 0.18, y - ch, -w * 0.18, y - ch]);
  p.circle(0, y - ch * 0.45, w * 0.1);
  y -= ch;
  const tw = w * 0.18, th = h * 0.45;
  p.box(0, y - th / 2, tw, th);
  for (const s of [-1, 1]) p.poly([s * tw / 2, y - th * 0.35, s * (tw / 2 + w * 0.12), y - th * 0.1, s * tw / 2, y - th * 0.05]);
  p.path((c) => nosePath(c, y - th, tw, th * 0.45, 'cone'));
}

function nozzleXs(n: number, w: number) {
  if (n === 1) return [0];
  if (n === 2) return [-w / 4, w / 4];
  return [-w / 3, 0, w / 3];
}

function boosterXs(spec: RocketSpec) {
  const b = spec.boosters!;
  const xs: number[] = [];
  for (let j = 0; j < b.per; j++) {
    const off = spec.stages[0].w / 2 + b.w / 2 + j * b.w;
    xs.push(-off, off);
  }
  return xs;
}

/** RLV: India's winged, reusable spaceplane test vehicle. Local frame: nose up, centred. */
export function drawShuttle(p: Pen, flameOn?: boolean) {
  if (flameOn) flame(p, 0, 200, 50, false);
  // wings
  for (const s of [-1, 1]) p.poly([s * 40, -20, s * 150, 150, s * 150, 185, s * 40, 175]);
  // body
  p.path((c) => {
    c.moveTo(-45, 190);
    c.lineTo(-45, -120);
    c.bezierCurveTo(-45, -220, -12, -270, 0, -280);
    c.bezierCurveTo(12, -270, 45, -220, 45, -120);
    c.lineTo(45, 190);
  });
  // tail fin and cockpit
  p.poly([-12, 60, 12, 60, 8, 190, -8, 190]);
  p.path((c) => {
    c.moveTo(-26, -170);
    c.quadraticCurveTo(0, -215, 26, -170);
    c.quadraticCurveTo(0, -150, -26, -170);
  });
  p.line(-45, 40, 45, 40);
  p.poly([-24, 190, 24, 190, 32, 215, -32, 215]);
}
