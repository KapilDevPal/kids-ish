import type { Pen } from './pen';

/**
 * Spacecraft line art. Each drawer works in a local frame centred on the craft, about 300 units across at s = 1,
 * and draws back to front so the pen's covering gives clean overlaps.
 */

// ---------- Satellites (data-driven like rockets) ----------

interface SatSpec {
  bus: [w: number, h: number];
  /** Solar wings: n panels per wing, each w x h, on an arm. */
  panels?: { n: number; w: number; h: number; arm: number; side?: 'lr' | 'r' | 'l'; up?: boolean };
  dish?: { r: number; at: 'top' | 'left' | 'right' | 'bottom' };
  mast?: number;
  tubes?: number;
  reflector?: number;
  radar?: [w: number, h: number];
  lens?: number;
  cube?: number;
  foil?: boolean;
  nozzle?: boolean;
  ring?: 'left' | 'right';
  facets?: boolean;
}

export const SATS = {
  generic: { bus: [110, 100], panels: { n: 2, w: 70, h: 90, arm: 24 }, dish: { r: 34, at: 'top' }, foil: true },
  aryabhata: { bus: [150, 150], facets: true, mast: 60 },
  insat: { bus: [120, 120], panels: { n: 3, w: 70, h: 100, arm: 30, side: 'r' }, dish: { r: 56, at: 'left' }, foil: true },
  gsat: { bus: [120, 120], panels: { n: 2, w: 70, h: 100, arm: 26 }, dish: { r: 44, at: 'top' }, foil: true },
  navic: { bus: [110, 110], panels: { n: 2, w: 66, h: 96, arm: 24 }, dish: { r: 30, at: 'bottom' }, mast: 40, foil: true },
  cartosat: { bus: [100, 150], panels: { n: 2, w: 60, h: 100, arm: 22 }, lens: 30 },
  risat: { bus: [110, 100], radar: [300, 90], panels: { n: 1, w: 70, h: 80, arm: 20, up: true } },
  astrosat: { bus: [130, 120], tubes: 3, panels: { n: 1, w: 70, h: 110, arm: 22 } },
  xposat: { bus: [110, 110], tubes: 1, panels: { n: 2, w: 60, h: 90, arm: 22 } },
  nisar: { bus: [120, 110], reflector: 150, panels: { n: 2, w: 60, h: 90, arm: 24, side: 'l' } },
  spadex: { bus: [90, 90], panels: { n: 2, w: 55, h: 80, arm: 18 }, ring: 'right' },
  'spadex-target': { bus: [90, 90], panels: { n: 2, w: 55, h: 80, arm: 18 }, ring: 'left' },
  cubesat: { bus: [70, 190], cube: 3, panels: { n: 1, w: 60, h: 180, arm: 6 } },
  cubesat1u: { bus: [110, 110], cube: 1, mast: 50 },
  pixxel: { bus: [100, 110], panels: { n: 2, w: 60, h: 100, arm: 18 }, lens: 32 },
  scot: { bus: [100, 100], panels: { n: 2, w: 55, h: 90, arm: 18 }, lens: 26, tubes: 1 },
  drishti: { bus: [110, 110], radar: [260, 80], lens: 26 },
  otv: { bus: [140, 110], panels: { n: 2, w: 60, h: 90, arm: 22 }, nozzle: true, foil: true },
  aditya: { bus: [130, 130], panels: { n: 2, w: 70, h: 110, arm: 24, side: 'r' }, tubes: 1, foil: true },
  ch2orbiter: { bus: [130, 130], panels: { n: 2, w: 70, h: 110, arm: 24, side: 'r' }, dish: { r: 36, at: 'top' }, foil: true },
} satisfies Record<string, SatSpec>;

export type SatId = keyof typeof SATS;

function wing(p: Pen, side: 1 | -1, bw: number, spec: NonNullable<SatSpec['panels']>) {
  const x0 = side * (bw / 2);
  const x1 = x0 + side * spec.arm;
  p.box((x0 + x1) / 2, 0, Math.abs(x1 - x0), 10);
  for (let i = 0; i < spec.n; i++) {
    const cx = x1 + side * (spec.w * i + spec.w / 2 + i * 6);
    p.box(cx, 0, spec.w, spec.h, 4);
    p.line(cx, -spec.h / 2, cx, spec.h / 2, 0.6);
    if (i === 0) p.anchor('solar', cx + side * spec.w * 0.25, spec.h * 0.25);
  }
}

export function drawSatellite(p: Pen, spec: SatSpec, parts?: boolean) {
  const [bw, bh] = spec.bus;
  const a = (id: string, x: number, y: number) => parts && p.anchor(id, x, y);

  if (spec.reflector) {
    // A huge umbrella antenna on a long boom (like NISAR's).
    const R = spec.reflector;
    p.poly([bw / 2, -bh * 0.2, bw / 2 + 170, -bh * 0.2 - 120], false);
    p.poly([bw / 2, -bh * 0.05, bw / 2 + 170, -bh * 0.2 - 120], false);
    p.at(bw / 2 + 170 + R * 0.35, -bh * 0.2 - 120 - R * 0.35, 1, -0.6, () => {
      p.ellipse(0, 0, R, R * 0.45);
      for (let i = 0; i < 8; i++) {
        const t = (i / 8) * Math.PI * 2;
        p.line(0, 0, Math.cos(t) * R, Math.sin(t) * R * 0.45, 0.6);
      }
      p.ellipse(0, 0, R * 0.55, R * 0.25, 0, 0.6);
    });
  }
  if (spec.radar) {
    const [rw, rh] = spec.radar;
    p.box(0, bh / 2 + rh / 2 + 16, rw, rh, 6);
    for (let i = 1; i < 6; i++) p.line(-rw / 2 + (rw * i) / 6, bh / 2 + 16, -rw / 2 + (rw * i) / 6, bh / 2 + 16 + rh, 0.6);
    p.box(0, bh / 2 + 8, 30, 16);
  }
  if (spec.panels) {
    const side = spec.panels.side ?? 'lr';
    const up = spec.panels.up;
    if (side !== 'l') p.at(0, up ? -bh / 2 - spec.panels.h / 2 - 10 : 0, 1, 0, () => wing(p, 1, up ? 20 : bw, spec.panels!));
    if (side !== 'r') p.at(0, up ? -bh / 2 - spec.panels.h / 2 - 10 : 0, 1, 0, () => wing(p, -1, up ? 20 : bw, spec.panels!));
  }
  if (spec.mast) {
    p.box(0, -bh / 2 - spec.mast / 2, 8, spec.mast);
    p.circle(0, -bh / 2 - spec.mast - 8, 10);
  }
  if (spec.tubes) {
    const n = spec.tubes, tw = Math.min(40, (bw - 20) / n);
    for (let i = 0; i < n; i++) {
      const x = -((n - 1) * (tw + 6)) / 2 + i * (tw + 6);
      p.box(x, -bh / 2 - 45, tw, 90, 4);
      p.ellipse(x, -bh / 2 - 90, tw / 2, 6);
    }
  }
  if (spec.dish) {
    const { r, at } = spec.dish;
    const pos = { top: [0, -bh / 2 - r * 0.6, 0], bottom: [0, bh / 2 + r * 0.6, Math.PI], left: [-bw / 2 - r * 0.6, 0, -Math.PI / 2], right: [bw / 2 + r * 0.6, 0, Math.PI / 2] }[at];
    p.at(pos[0], pos[1], 1, pos[2], () => {
      p.box(0, r * 0.45, 10, r * 0.4);
      p.path((c) => {
        c.moveTo(-r, 0);
        c.quadraticCurveTo(0, r * 0.7, r, 0);
        c.quadraticCurveTo(0, -r * 0.25, -r, 0);
      });
      p.line(0, 0, 0, -r * 0.55, 0.7);
      p.dot(0, -r * 0.6, 5);
    });
    a('dish', pos[0], pos[1]);
  }
  if (spec.nozzle) {
    p.poly([-bw / 2, -20, -bw / 2 - 50, -40, -bw / 2 - 50, 40, -bw / 2, 20]);
    p.line(-bw / 2 - 30, -34, -bw / 2 - 30, 34, 0.6);
  }
  if (spec.ring) {
    const x = spec.ring === 'right' ? bw / 2 : -bw / 2;
    const s = spec.ring === 'right' ? 1 : -1;
    p.box(x + s * 12, 0, 24, 50, 4);
    p.box(x + s * 30, 0, 12, 34, 3);
  }

  // The bus sits in front of everything attached to it.
  if (spec.facets) {
    const r = bw / 2;
    const pts: number[] = [];
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2 + Math.PI / 8;
      pts.push(Math.cos(t) * r, Math.sin(t) * r);
    }
    p.poly(pts);
    p.box(0, 0, r * 0.9, r * 0.9);
    p.line(-r * 0.45, 0, r * 0.45, 0, 0.7);
    p.line(0, -r * 0.45, 0, r * 0.45, 0.7);
  } else if (spec.cube) {
    const n = spec.cube;
    const uh = bh / n;
    for (let i = 0; i < n; i++) {
      const cy = -bh / 2 + uh * i + uh / 2;
      p.box(0, cy, bw, uh - 4, 6);
      p.box(0, cy, bw * 0.62, uh * 0.55, 2);
      p.line(0, cy - uh * 0.27, 0, cy + uh * 0.27, 0.6);
    }
  } else {
    p.box(0, 0, bw, bh, 8);
    if (spec.foil) {
      p.path((c) => {
        c.moveTo(-bw / 2, -bh * 0.1);
        c.bezierCurveTo(-bw * 0.2, -bh * 0.25, bw * 0.1, bh * 0.05, bw / 2, -bh * 0.12);
      }, false, 0.7);
    }
    p.box(0, bh * 0.22, bw * 0.5, bh * 0.22, 4);
  }
  if (spec.lens) {
    p.circle(0, -bh * 0.12, spec.lens);
    p.circle(0, -bh * 0.12, spec.lens * 0.55, 0.7);
  }
  a('bus', bw * 0.3, -bh * 0.3);
}

// ---------- Vikram lander ----------

function strut(p: Pen, x0: number, y0: number, x1: number, y1: number, w: number) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2), ny = (dx / L) * (w / 2);
  p.poly([x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny]);
}

export function drawLander(p: Pen, parts?: boolean, ramp?: boolean) {
  const a = (id: string, x: number, y: number) => parts && p.anchor(id, x, y);
  // Back legs, then front legs with footpads.
  strut(p, -60, 40, -80, 185, 12);
  strut(p, 60, 40, 80, 185, 12);
  p.ellipse(-80, 192, 24, 9);
  p.ellipse(80, 192, 24, 9);
  strut(p, -100, 40, -175, 180, 14);
  strut(p, 100, 40, 175, 180, 14);
  p.ellipse(-178, 190, 30, 11);
  p.ellipse(178, 190, 30, 11);
  a('legs', -140, 112);
  // Engine
  p.poly([-26, 60, 26, 60, 38, 100, -38, 100]);
  // Solar panel on the side
  p.poly([110, -50, 215, -95, 215, -5, 110, 30]);
  p.line(162, -72, 162, 12, 0.6);
  a('solar', 190, -40);
  // Body in gold foil
  p.box(0, 0, 220, 120, 10);
  p.path((c) => { c.moveTo(-110, -10); c.bezierCurveTo(-60, -30, -20, 20, 40, -5); }, false, 0.6);
  p.circle(-60, 25, 14);
  a('body', 40, 30);
  // Top deck, antenna box and dish
  p.box(0, -75, 190, 30, 6);
  a('deck', 60, -75);
  p.box(-40, -108, 60, 36, 6);
  p.box(45, -104, 10, 28);
  p.path((c) => { c.moveTo(20, -125); c.quadraticCurveTo(45, -100, 70, -125); c.quadraticCurveTo(45, -135, 20, -125); });
  if (ramp) {
    p.poly([-110, 44, -125, 52, -265, 190, -240, 190]);
  }
}

// ---------- Pragyan rover ----------

export function drawRover(p: Pen, parts?: boolean) {
  const a = (id: string, x: number, y: number) => parts && p.anchor(id, x, y);
  // Rocker bogie
  p.poly([-70, 25, -40, 42, 0, 42, 30, 25], false);
  p.poly([30, 25, 60, 42], false);
  // Wheels
  for (const x of [-70, 0, 70]) {
    p.circle(x, 60, 26);
    p.circle(x, 60, 9);
  }
  a('wheels', -70 + 17, 60);
  // Mast and camera head
  p.box(60, -70, 12, 80);
  p.box(60, -120, 64, 28, 6);
  p.circle(46, -120, 7, 0.7);
  p.circle(74, -120, 7, 0.7);
  // Solar panel, then the body
  p.poly([-95, -40, 50, -40, 30, -85, -75, -85]);
  p.line(-40, -40, -30, -85, 0.6);
  p.line(0, -40, 0, -85, 0.6);
  a('solar', -55, -55);
  p.box(-10, 0, 170, 56, 8);
  p.box(-10, 0, 60, 24, 4);
  a('rover', -65, 0);
}

// ---------- Mangalyaan (Mars Orbiter) ----------

export function drawOrbiter(p: Pen, parts?: boolean) {
  const a = (id: string, x: number, y: number) => parts && p.anchor(id, x, y);
  // Solar wing
  p.box(100, 0, 40, 10);
  p.box(185, 0, 130, 90, 6);
  p.line(142, -45, 142, 45, 0.6);
  p.line(185, -45, 185, 45, 0.6);
  p.line(228, -45, 228, 45, 0.6);
  a('solar', 205, 20);
  // Thruster
  p.poly([-20, 60, 20, 60, 34, 100, -34, 100]);
  a('thruster', 0, 85);
  // Dish on a stalk
  p.box(0, -80, 12, 30);
  p.path((c) => {
    c.moveTo(-90, -95);
    c.quadraticCurveTo(0, -45, 90, -95);
    c.quadraticCurveTo(0, -125, -90, -95);
  });
  p.line(0, -95, 0, -150, 0.7);
  p.dot(0, -154, 6);
  a('dish', 45, -88);
  // Box body with a top and side face
  p.poly([-60, -60, -30, -80, 90, -80, 60, -60]);
  p.poly([60, -60, 90, -80, 90, 40, 60, 60]);
  p.box(0, 0, 120, 120, 4);
  p.box(0, 20, 60, 30, 4);
  a('bus', -35, -30);
}

// ---------- Gaganyaan crew module ----------

export function drawCapsule(p: Pen, tower?: boolean, service?: boolean) {
  if (service) {
    p.box(0, 145, 190, 110, 6);
    p.line(-95, 120, 95, 120, 0.6);
    p.line(-95, 170, 95, 170, 0.6);
    p.poly([-40, 200, 40, 200, 55, 235, -55, 235]);
  }
  if (tower) {
    p.box(0, -170, 26, 110);
    for (const s of [-1, 1]) p.poly([s * 13, -150, s * 40, -130, s * 13, -125]);
    p.poly([-13, -225, 0, -265, 13, -225]);
    p.poly([-40, -90, 40, -90, 13, -115, -13, -115]);
  }
  // Heat shield, then the cone-shaped crew cabin
  p.path((c) => { c.moveTo(-100, 80); c.quadraticCurveTo(0, 115, 100, 80); c.lineTo(95, 70); c.lineTo(-95, 70); });
  p.path((c) => {
    c.moveTo(-95, 72);
    c.lineTo(-40, -80);
    c.quadraticCurveTo(0, -100, 40, -80);
    c.lineTo(95, 72);
  });
  p.circle(-30, 0, 16);
  p.circle(30, 0, 16);
  p.line(-70, 40, 70, 40, 0.6);
  p.box(0, -30, 30, 18, 4);
}

export function drawParachutes(p: Pen, n = 3) {
  // Canopies above an attach point at (0, 0).
  const spots = n === 1 ? [[0, -330]] : [[-170, -300], [0, -360], [170, -300]].slice(0, n);
  for (const [x, y] of spots) {
    p.line(0, 0, x - 90, y + 30, 0.6);
    p.line(0, 0, x + 90, y + 30, 0.6);
  }
  for (const [x, y] of spots) {
    p.path((c) => {
      c.moveTo(x - 110, y + 30);
      c.bezierCurveTo(x - 110, y - 90, x + 110, y - 90, x + 110, y + 30);
      c.quadraticCurveTo(x + 55, y + 10, x, y + 30);
      c.quadraticCurveTo(x - 55, y + 10, x - 110, y + 30);
    });
    p.path((c) => { c.moveTo(x, y + 30); c.quadraticCurveTo(x - 10, y - 40, x, y - 59); }, false, 0.7);
    p.path((c) => { c.moveTo(x - 55, y + 20); c.quadraticCurveTo(x - 60, y - 40, x - 30, y - 52); }, false, 0.7);
    p.path((c) => { c.moveTo(x + 55, y + 20); c.quadraticCurveTo(x + 60, y - 40, x + 30, y - 52); }, false, 0.7);
  }
}

// ---------- Space station ----------

export function drawStation(p: Pen, modules = 3) {
  // Solar wings on both ends of the truss
  for (const x of [-250, -170, 170, 250]) {
    for (const s of [-1, 1]) {
      p.box(x, s * 110, 64, 170, 3);
      p.line(x, s * 110 - 85, x, s * 110 + 85, 0.6);
    }
  }
  p.box(0, 0, 600, 22, 4);
  for (let i = -5; i <= 5; i++) p.line(i * 50, -11, i * 50 + 25, 11, 0.5);
  // Modules along the middle
  const h = 70;
  for (let i = 0; i < modules; i++) {
    const y = 40 + i * (h + 8);
    p.box(0, y + h / 2, 90, h, 18);
    p.circle(0, y + h / 2, 12, 0.7);
  }
  p.box(0, -50, 110, 60, 20);
  p.box(-80, -50, 50, 26, 8);
  p.box(80, -50, 50, 26, 8);
}

// ---------- Astronaut ----------

/** A limb as a rounded capsule from (x0, y0) to (x1, y1). */
function limb(p: Pen, x0: number, y0: number, x1: number, y1: number, w: number) {
  const L = Math.hypot(x1 - x0, y1 - y0);
  const t = Math.atan2(y1 - y0, x1 - x0);
  p.at(x0, y0, 1, t, () => p.box(L / 2, 0, L + w * 0.3, w, w / 2));
}

type Pose = 'float' | 'wave' | 'stand' | 'yoga';

export function drawAstronaut(p: Pen, pose: Pose = 'stand', face = false) {
  // Backpack, then legs, torso, arms, helmet: back to front.
  p.box(0, -15, 150, 140, 22);
  if (pose === 'yoga') {
    limb(p, 40, 70, -85, 100, 48);
    limb(p, -40, 70, 85, 100, 48);
    p.box(-100, 104, 44, 36, 14);
    p.box(100, 104, 44, 36, 14);
  } else {
    const spread = pose === 'float' ? 30 : 8;
    limb(p, -30, 50, -30 - spread, 160, 48);
    limb(p, 30, 50, 30 + spread, 160, 48);
    p.box(-36 - spread, 176, 58, 34, 14);
    p.box(36 + spread, 176, 58, 34, 14);
  }
  p.box(0, 0, 124, 140, 34);
  p.box(0, 10, 58, 40, 8);
  p.circle(-12, 10, 6, 0.6);
  p.circle(12, 10, 6, 0.6);
  // Tricolour shoulder patch
  p.box(-40, -40, 28, 20, 3);
  p.line(-54, -43, -26, -43, 0.5);
  p.line(-54, -37, -26, -37, 0.5);
  const arms: Record<Pose, [number, number, number, number]> = {
    stand: [-100, 70, 100, 70],
    wave: [-100, 70, 110, -120],
    float: [-130, -60, 130, 30],
    yoga: [-80, 80, 80, 80],
  };
  const [lx, ly, rx, ry] = arms[pose];
  limb(p, -58, -40, lx, ly, 40);
  limb(p, 58, -40, rx, ry, 40);
  p.circle(lx, ly, 22);
  p.circle(rx, ry, 22);
  // Helmet and visor
  p.circle(0, -120, 64);
  if (face) {
    p.ellipse(0, -118, 44, 38);
    p.dot(-15, -124, 6);
    p.dot(15, -124, 6);
    p.arc(0, -112, 16, 0.2 * Math.PI, 0.8 * Math.PI, 0.8);
  } else {
    p.ellipse(0, -118, 46, 34);
    p.path((c) => { c.moveTo(-26, -132); c.quadraticCurveTo(-14, -146, 4, -144); }, false, 0.7);
  }
}

/** Vyommitra, the humanoid robot that will test Gaganyaan before people fly. Half figure, no legs. */
export function drawRobot(p: Pen) {
  p.box(0, 60, 180, 170, 30);
  p.box(0, 40, 90, 50, 8);
  p.line(-30, 100, 30, 100, 0.7);
  limb(p, -90, 10, -150, 120, 40);
  limb(p, 90, 10, 150, 120, 40);
  p.circle(-150, 125, 22);
  p.circle(150, 125, 22);
  p.box(0, -40, 36, 30, 6);
  // Head with a friendly face
  p.path((c) => { c.roundRect(-70, -190, 140, 140, 50); });
  p.ellipse(0, -118, 52, 34);
  p.dot(-18, -124, 7);
  p.dot(18, -124, 7);
  p.arc(0, -110, 14, 0.2 * Math.PI, 0.8 * Math.PI, 0.8);
  p.box(-75, -118, 14, 36, 6);
  p.box(75, -118, 14, 36, 6);
}

// ---------- Engines ----------

/** A rocket engine up close. Agnilet is Agnikul's single-piece 3D-printed engine. */
export function drawEngine(p: Pen) {
  // Nozzle bell
  p.path((c) => {
    c.moveTo(-40, -20);
    c.bezierCurveTo(-60, 60, -150, 160, -170, 240);
    c.lineTo(170, 240);
    c.bezierCurveTo(150, 160, 60, 60, 40, -20);
  });
  p.path((c) => { c.moveTo(-100, 150); c.quadraticCurveTo(0, 175, 100, 150); }, false, 0.7);
  p.path((c) => { c.moveTo(-145, 210); c.quadraticCurveTo(0, 240, 145, 210); }, false, 0.7);
  // Chamber, injector and pipes
  p.box(0, -80, 110, 130, 30);
  p.box(0, -170, 150, 50, 10);
  p.path((c) => { c.moveTo(55, -110); c.bezierCurveTo(120, -110, 120, -20, 60, 10); }, false, 1.4);
  p.path((c) => { c.moveTo(-55, -110); c.bezierCurveTo(-120, -110, -120, -20, -60, 10); }, false, 1.4);
  p.box(0, -80, 50, 50, 8);
}

// ---------- Props ----------

export function drawBicycle(p: Pen) {
  // Thumba, 1963: rocket parts were carried to the launch pad on a bicycle.
  for (const x of [-120, 120]) {
    p.circle(x, 60, 70);
    p.circle(x, 60, 10);
  }
  p.poly([-120, 60, -30, 60, 30, -40, -60, -40], true, 1);
  p.line(-30, 60, -70, -60);
  p.line(30, -40, 120, 60);
  p.line(30, -40, 40, -90);
  p.poly([20, -95, 70, -95], false, 1.4);
  p.box(-80, -68, 60, 14, 6);
  // Carrier with a nose cone strapped on
  p.box(-150, -30, 110, 14, 4);
  p.path((c) => {
    c.moveTo(-220, -38);
    c.lineTo(-100, -38);
    c.quadraticCurveTo(-40, -64, -100, -90);
    c.lineTo(-220, -90);
  });
  p.line(-190, -38, -190, -90, 0.7);
}

export function drawBoat(p: Pen) {
  p.path((c) => { c.moveTo(-220, 0); c.lineTo(220, 0); c.lineTo(170, 70); c.lineTo(-180, 70); });
  p.box(-40, -45, 180, 90, 8);
  p.box(-40, -120, 90, 60, 8);
  for (const x of [-100, -40, 20]) p.box(x, -40, 30, 26, 4);
  p.box(120, -60, 14, 120);
  p.line(120, -120, 200, -20, 0.7);
}
