import { rng } from './types';
import { sparkle } from './brushes';

export interface BackgroundDef {
  id: string;
  name: string;
  /** Solid colour used under the artwork when exporting. */
  base: string;
}

export const BACKGROUNDS: BackgroundDef[] = [
  { id: 'deep', name: 'Deep space', base: '#0F1438' },
  { id: 'nebula', name: 'Nebula', base: '#241453' },
  { id: 'paper', name: 'Paper', base: '#FFF8EC' },
  { id: 'launchpad', name: 'Sriharikota', base: '#101a45' },
  { id: 'moon', name: 'Moon surface', base: '#07091f' },
  { id: 'mars', name: 'Mars', base: '#3a1410' },
];

function stars(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, count: number, maxY = 1) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * h * maxY;
    const s = r();
    ctx.fillStyle = `rgba(255,255,255,${0.35 + s * 0.6})`;
    if (s > 0.96) sparkle(ctx, x, y, 6 + s * 6);
    else {
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + s * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function drawBackground(ctx: CanvasRenderingContext2D, id: string, w: number, h: number) {
  const m = Math.min(w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const lg = (stops: [number, string][]) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  switch (id) {
    case 'paper':
      ctx.fillStyle = '#FFF8EC';
      ctx.fillRect(0, 0, w, h);
      break;
    case 'nebula':
      lg([[0, '#1a0f45'], [1, '#2c0f4f']]);
      blob(ctx, w * 0.25, h * 0.3, m * 0.6, 'rgba(255,111,177,0.45)');
      blob(ctx, w * 0.8, h * 0.55, m * 0.55, 'rgba(111,211,255,0.35)');
      blob(ctx, w * 0.45, h * 0.85, m * 0.5, 'rgba(138,92,246,0.5)');
      stars(ctx, w, h, 7, 260);
      break;
    case 'launchpad': {
      lg([[0, '#0b1240'], [0.7, '#2b2f8a'], [1, '#ff9a5a']]);
      stars(ctx, w, h, 11, 180, 0.6);
      const gy = h * 0.86;
      ctx.fillStyle = '#16193F';
      ctx.fillRect(0, gy, w, h - gy);
      // tower silhouette
      const tx = w * 0.72, tw = m * 0.07, th = h * 0.42;
      ctx.fillRect(tx, gy - th, tw, th);
      ctx.strokeStyle = '#2a2f6b';
      ctx.lineWidth = 3;
      for (let y = gy - th; y < gy; y += tw) {
        ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + tw, y + tw); ctx.moveTo(tx + tw, y); ctx.lineTo(tx, y + tw); ctx.stroke();
      }
      ctx.fillStyle = '#16193F';
      ctx.fillRect(tx - m * 0.12, gy - th * 0.72, m * 0.12, m * 0.012);
      ctx.fillRect(w * 0.25, gy - m * 0.03, w * 0.5, m * 0.03);
      // sea on the horizon
      ctx.fillStyle = 'rgba(111,211,255,0.25)';
      ctx.fillRect(0, gy - m * 0.012, w, m * 0.012);
      break;
    }
    case 'moon': {
      lg([[0, '#05061a'], [1, '#12163d']]);
      stars(ctx, w, h, 23, 240, 0.7);
      // Earth
      const ex = w * 0.78, ey = h * 0.2, er = m * 0.1;
      ctx.fillStyle = '#2d7fd6';
      ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2fbf71';
      ctx.beginPath(); ctx.ellipse(ex - er * 0.3, ey - er * 0.1, er * 0.35, er * 0.5, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.arc(ex + er * 0.35, ey, er, -Math.PI / 2, Math.PI / 2); ctx.fill();
      // ground
      const gy = h * 0.72;
      const g = ctx.createLinearGradient(0, gy, 0, h);
      g.addColorStop(0, '#b8bac6'); g.addColorStop(1, '#6d7082');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      for (let x = 0; x <= w; x += w / 8) ctx.lineTo(x, gy + Math.sin(x * 0.01) * m * 0.02);
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
      const r = rng(5);
      for (let i = 0; i < 14; i++) {
        const cx = r() * w, cy = gy + m * 0.05 + r() * (h - gy - m * 0.05), cr = m * (0.015 + r() * 0.05);
        ctx.fillStyle = 'rgba(60,62,80,0.35)';
        ctx.beginPath(); ctx.ellipse(cx, cy, cr, cr * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'mars': {
      lg([[0, '#3a1a2a'], [0.6, '#a3462a'], [1, '#e08a4f']]);
      stars(ctx, w, h, 31, 90, 0.35);
      ctx.fillStyle = 'rgba(255,220,180,0.7)';
      ctx.beginPath(); ctx.arc(w * 0.2, h * 0.22, m * 0.035, 0, Math.PI * 2); ctx.fill();
      const layers: [number, string][] = [[0.66, '#8c3a22'], [0.76, '#b24a2a'], [0.86, '#c75b33']];
      layers.forEach(([y0, c], i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += w / 10) ctx.lineTo(x, h * y0 + Math.sin(x * 0.006 + i * 2) * m * 0.04);
        ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      });
      break;
    }
    default:
      lg([[0, '#0b1033'], [1, '#1d2266']]);
      blob(ctx, w * 0.85, h * 0.1, m * 0.4, 'rgba(111,211,255,0.18)');
      stars(ctx, w, h, 3, 320);
  }
  ctx.restore();
}
