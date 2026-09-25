import * as THREE from 'three';

/** Deterministic PRNG so procedural textures look the same every time for the same inputs. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

let softDot: THREE.Texture | null = null;
/** A soft round sprite shared by every particle system (never disposed: tiny and reused). */
export function getSoftDot(): THREE.Texture {
  if (softDot) return softDot;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  softDot = new THREE.CanvasTexture(c);
  return softDot;
}

function shade(hex: string, amt: number): string {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + amt)));
  return `#${c.getHexString()}`;
}

export type SurfaceStyle = 'rocky' | 'gas' | 'ice' | 'lava' | 'ocean';

/** Paints an equirectangular planet texture from a base colour and a style. */
export function makePlanetCanvas(base: string, style: SurfaceStyle, seed: number, size = 512): HTMLCanvasElement {
  const w = size;
  const h = size / 2;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const r = rng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);

  if (style === 'gas') {
    let y = 0;
    while (y < h) {
      const bh = 6 + r() * 26;
      g.fillStyle = shade(base, (r() - 0.5) * 0.36);
      g.globalAlpha = 0.85;
      g.fillRect(0, y, w, bh);
      y += bh;
    }
    g.globalAlpha = 0.5;
    for (let i = 0; i < 3; i++) {
      g.fillStyle = shade(base, 0.2);
      g.beginPath();
      g.ellipse(r() * w, h * 0.3 + r() * h * 0.4, 18 + r() * 20, 8 + r() * 6, 0, 0, Math.PI * 2);
      g.fill();
    }
  } else if (style === 'ocean') {
    g.fillStyle = shade(base, -0.1);
    g.fillRect(0, 0, w, h);
    const land = shade(base, 0.08);
    const green = '#3FA35C';
    for (let i = 0; i < 9; i++) {
      const cx = r() * w;
      const cy = h * 0.2 + r() * h * 0.6;
      g.fillStyle = i % 2 ? green : land;
      for (let k = 0; k < 7; k++) {
        g.beginPath();
        g.arc(cx + (r() - 0.5) * 60, cy + (r() - 0.5) * 30, 10 + r() * 22, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.fillStyle = '#ffffff';
    g.globalAlpha = 0.85;
    g.fillRect(0, 0, w, h * 0.06);
    g.fillRect(0, h * 0.94, w, h * 0.06);
  } else {
    // rocky, ice, lava share craters/cracks with different treatments
    const craters = style === 'rocky' ? 70 : style === 'ice' ? 25 : 40;
    for (let i = 0; i < craters; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 3 + r() * (style === 'rocky' ? 18 : 10);
      g.globalAlpha = 0.5;
      g.fillStyle = shade(base, style === 'ice' ? 0.15 : -0.16);
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.35;
      g.fillStyle = shade(base, 0.14);
      g.beginPath();
      g.arc(x - rad * 0.2, y - rad * 0.2, rad * 0.6, 0, Math.PI * 2);
      g.fill();
    }
    if (style === 'lava' || style === 'ice') {
      g.globalAlpha = 0.9;
      g.strokeStyle = style === 'lava' ? '#FFB23C' : '#FFFFFF';
      g.lineWidth = style === 'lava' ? 3 : 1.5;
      for (let i = 0; i < 26; i++) {
        let x = r() * w;
        let y = r() * h;
        g.beginPath();
        g.moveTo(x, y);
        for (let k = 0; k < 6; k++) {
          x += (r() - 0.5) * 50;
          y += (r() - 0.5) * 24;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    }
  }
  g.globalAlpha = 1;
  return c;
}

export function makeRingCanvas(seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 8;
  const g = c.getContext('2d')!;
  const r = rng(seed);
  for (let x = 0; x < 256; x++) {
    const a = 0.25 + r() * 0.75 * (x > 30 && x < 240 ? 1 : 0.3);
    const l = 180 + Math.floor(r() * 75);
    g.fillStyle = `rgba(${l},${l},${l},${a})`;
    g.fillRect(x, 0, 1, 8);
  }
  return c;
}

export function makeCloudCanvas(seed: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d')!;
  const r = rng(seed);
  for (let i = 0; i < 60; i++) {
    const x = r() * 512;
    const y = 30 + r() * 196;
    g.fillStyle = `rgba(255,255,255,${0.12 + r() * 0.25})`;
    g.beginPath();
    g.ellipse(x, y, 20 + r() * 50, 6 + r() * 10, 0, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

export function toTexture(c: HTMLCanvasElement, repeatX = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeatX) t.wrapS = THREE.RepeatWrapping;
  return t;
}
