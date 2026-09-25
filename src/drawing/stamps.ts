import { INK } from './types';
import { sparkle } from './brushes';

/**
 * Vector stamps drawn in a 100 x 100 box centred on the origin.
 * Each takes the child's current colour as its accent, so the same stamp becomes theirs.
 */
export interface StampDef {
  id: string;
  name: string;
  draw: (ctx: CanvasRenderingContext2D, accent: string) => void;
}

const line = (ctx: CanvasRenderingContext2D, w = 4) => {
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
};
const fillStroke = (ctx: CanvasRenderingContext2D, fill: string) => {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
};
const circle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
};

function rocket(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  // flame
  ctx.beginPath();
  ctx.moveTo(-10, 28); ctx.quadraticCurveTo(0, 62, 10, 28); ctx.closePath();
  fillStroke(ctx, '#FFC93C');
  ctx.beginPath();
  ctx.moveTo(-5, 28); ctx.quadraticCurveTo(0, 46, 5, 28); ctx.closePath();
  ctx.fillStyle = '#FF9933'; ctx.fill();
  // fins
  ctx.beginPath(); ctx.moveTo(-14, 6); ctx.lineTo(-28, 30); ctx.lineTo(-12, 26); ctx.closePath(); fillStroke(ctx, a);
  ctx.beginPath(); ctx.moveTo(14, 6); ctx.lineTo(28, 30); ctx.lineTo(12, 26); ctx.closePath(); fillStroke(ctx, a);
  // body
  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.bezierCurveTo(20, -30, 16, 10, 14, 30);
  ctx.lineTo(-14, 30);
  ctx.bezierCurveTo(-16, 10, -20, -30, 0, -48);
  ctx.closePath();
  fillStroke(ctx, '#FFFFFF');
  // nose
  ctx.save(); ctx.clip();
  ctx.fillStyle = a; ctx.fillRect(-30, -60, 60, 30);
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(0, -48); ctx.bezierCurveTo(20, -30, 16, 10, 14, 30); ctx.lineTo(-14, 30); ctx.bezierCurveTo(-16, 10, -20, -30, 0, -48); ctx.closePath();
  ctx.stroke();
  circle(ctx, 0, -8, 8); fillStroke(ctx, '#6FD3FF');
}

function planet(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.save();
  ctx.rotate(-0.35);
  ctx.beginPath(); ctx.ellipse(0, 0, 48, 14, 0, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.restore();
  circle(ctx, 0, 0, 30); fillStroke(ctx, a);
  ctx.save(); circle(ctx, 0, 0, 30); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(-40, -12, 80, 7); ctx.fillRect(-40, 6, 80, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.16)'; circle(ctx, 12, 12, 30); ctx.fill();
  ctx.restore();
  circle(ctx, 0, 0, 30); ctx.stroke();
  ctx.save();
  ctx.rotate(-0.35);
  ctx.beginPath(); ctx.ellipse(0, 0, 48, 14, 0, 0, Math.PI);
  ctx.lineWidth = 9; ctx.strokeStyle = '#FFC93C'; ctx.stroke();
  line(ctx); ctx.stroke();
  ctx.restore();
}

function star(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 46 : 20;
    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
  }
  ctx.closePath();
  fillStroke(ctx, a);
  ctx.fillStyle = INK;
  circle(ctx, -8, -2, 3.5); ctx.fill();
  circle(ctx, 8, -2, 3.5); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 5, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 3; ctx.stroke();
}

function moon(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0.35 * Math.PI, 1.65 * Math.PI);
  ctx.bezierCurveTo(-6, -30, -6, 30, 18, 38);
  ctx.closePath();
  fillStroke(ctx, mix(a, '#FFFFFF', 0.45));
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  circle(ctx, -22, -10, 6); ctx.fill();
  circle(ctx, -14, 18, 4); ctx.fill();
}

function comet(ctx: CanvasRenderingContext2D, a: string) {
  const g = ctx.createLinearGradient(-48, 40, 20, -10);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(1, a);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-50, 44); ctx.lineTo(8, -24); ctx.lineTo(28, -4); ctx.closePath(); ctx.fill();
  line(ctx);
  circle(ctx, 20, -18, 16); fillStroke(ctx, '#FFFFFF');
  ctx.fillStyle = a; circle(ctx, 20, -18, 8); ctx.fill();
}

function alien(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.beginPath(); ctx.moveTo(-12, -30); ctx.lineTo(-20, -46); ctx.moveTo(12, -30); ctx.lineTo(20, -46); ctx.stroke();
  circle(ctx, -20, -46, 5); fillStroke(ctx, '#FFC93C');
  circle(ctx, 20, -46, 5); fillStroke(ctx, '#FFC93C');
  ctx.beginPath();
  ctx.moveTo(-30, 40); ctx.bezierCurveTo(-36, -40, 36, -40, 30, 40); ctx.closePath();
  fillStroke(ctx, a);
  circle(ctx, 0, -8, 14); fillStroke(ctx, '#FFFFFF');
  ctx.fillStyle = INK; circle(ctx, 2, -6, 6); ctx.fill();
  ctx.fillStyle = '#fff'; circle(ctx, 4, -9, 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 16, 9, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
}

function satellite(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.rect(s < 0 ? -50 : 20, -12, 30, 24); fillStroke(ctx, '#1F3FA8');
    ctx.beginPath(); ctx.moveTo(s < 0 ? -35 : 35, -12); ctx.lineTo(s < 0 ? -35 : 35, 12); ctx.lineWidth = 2.5; ctx.strokeStyle = '#6FD3FF'; ctx.stroke();
    line(ctx);
  }
  ctx.beginPath(); ctx.rect(-18, -18, 36, 36); fillStroke(ctx, a);
  ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -32); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -36, 10, 0.15 * Math.PI, 0.85 * Math.PI, true); ctx.closePath(); fillStroke(ctx, '#FFFFFF');
  ctx.fillStyle = '#FFC93C'; ctx.fillRect(-10, -6, 20, 12);
}

function astronaut(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.beginPath(); ctx.roundRect(-24, -4, 48, 44, 14); fillStroke(ctx, '#FFFFFF');
  ctx.beginPath(); ctx.roundRect(-38, 0, 16, 30, 8); fillStroke(ctx, '#FFFFFF');
  ctx.beginPath(); ctx.roundRect(22, 0, 16, 30, 8); fillStroke(ctx, '#FFFFFF');
  ctx.beginPath(); ctx.roundRect(-10, 8, 20, 12, 4); fillStroke(ctx, a);
  circle(ctx, 0, -22, 24); fillStroke(ctx, '#FFFFFF');
  ctx.beginPath(); ctx.roundRect(-16, -32, 32, 22, 11); fillStroke(ctx, '#23263A');
  ctx.fillStyle = a; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.roundRect(-10, -29, 10, 8, 4); ctx.fill(); ctx.globalAlpha = 1;
  // small tricolour patch
  ctx.fillStyle = '#FF9933'; ctx.fillRect(12, 24, 9, 3);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(12, 27, 9, 3);
  ctx.fillStyle = '#138808'; ctx.fillRect(12, 30, 9, 3);
}

function lander(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 18, 8); ctx.lineTo(s * 40, 38); ctx.moveTo(s * 32, 38); ctx.lineTo(s * 48, 38); ctx.stroke();
  }
  ctx.beginPath(); ctx.rect(-28, -22, 56, 34); fillStroke(ctx, '#FFC93C');
  ctx.beginPath(); ctx.rect(-28, -34, 56, 12); fillStroke(ctx, a);
  ctx.beginPath(); ctx.rect(-10, -48, 20, 14); fillStroke(ctx, '#1F3FA8');
  circle(ctx, -12, -6, 5); fillStroke(ctx, '#FFFFFF');
  ctx.beginPath(); ctx.moveTo(-12, 12); ctx.lineTo(12, 12); ctx.lineTo(0, 20); ctx.closePath(); fillStroke(ctx, '#A7A9B4');
}

function sunprobe(ctx: CanvasRenderingContext2D, a: string) {
  ctx.fillStyle = '#FFC93C';
  ctx.shadowColor = '#FF9933';
  ctx.shadowBlur = 14;
  circle(ctx, -26, -26, 18); ctx.fill();
  ctx.shadowBlur = 0;
  line(ctx);
  ctx.beginPath(); ctx.rect(4, 4, 30, 26); fillStroke(ctx, a);
  ctx.beginPath(); ctx.rect(-26, 10, 26, 14); fillStroke(ctx, '#1F3FA8');
  ctx.beginPath(); ctx.moveTo(4, 4); ctx.lineTo(-6, -6); ctx.stroke();
  circle(ctx, -8, -8, 5); fillStroke(ctx, '#FFFFFF');
  ctx.fillStyle = '#fff';
  sparkle(ctx, 38, -30, 8);
}

function flag(ctx: CanvasRenderingContext2D, _a: string) {
  line(ctx);
  ctx.beginPath(); ctx.rect(-38, -46, 7, 94); fillStroke(ctx, '#A7A9B4');
  ['#FF9933', '#FFFFFF', '#138808'].forEach((c, i) => {
    ctx.beginPath(); ctx.rect(-31, -42 + i * 17, 70, 17); fillStroke(ctx, c);
  });
  ctx.strokeStyle = '#1F3FA8'; ctx.lineWidth = 2.5;
  circle(ctx, 4, -16.5, 6); ctx.stroke();
  ctx.fillStyle = '#1F3FA8'; circle(ctx, 4, -16.5, 1.6); ctx.fill();
}

function earth(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.save(); ctx.rotate(-0.3);
  ctx.beginPath(); ctx.ellipse(0, 0, 48, 13, 0, Math.PI, Math.PI * 2); ctx.strokeStyle = a; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
  line(ctx);
  circle(ctx, 0, 0, 34); fillStroke(ctx, '#2D7FD6');
  ctx.save(); circle(ctx, 0, 0, 34); ctx.clip();
  ctx.fillStyle = '#2FBF71';
  ctx.beginPath(); ctx.ellipse(-12, -10, 12, 16, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, 12, 10, 14, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-40, 22, 80, 4);
  ctx.restore();
  circle(ctx, 0, 0, 34); ctx.stroke();
  ctx.save(); ctx.rotate(-0.3);
  ctx.beginPath(); ctx.ellipse(0, 0, 48, 13, 0, 0, Math.PI); ctx.strokeStyle = a; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

function sunny(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx, 3.5);
  for (let i = 0; i < 10; i++) {
    const t = (i / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(t - 0.16) * 30, Math.sin(t - 0.16) * 30);
    ctx.lineTo(Math.cos(t) * 48, Math.sin(t) * 48);
    ctx.lineTo(Math.cos(t + 0.16) * 30, Math.sin(t + 0.16) * 30);
    fillStroke(ctx, a);
  }
  circle(ctx, 0, 0, 30); fillStroke(ctx, '#FFC93C');
  ctx.fillStyle = INK;
  circle(ctx, -10, -5, 3.5); ctx.fill();
  circle(ctx, 10, -5, 3.5); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 3, 10, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 3; ctx.stroke();
}

function rover(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.beginPath(); ctx.rect(20, -40, 6, 28); fillStroke(ctx, '#A7A9B4');
  ctx.beginPath(); ctx.roundRect(8, -50, 32, 14, 4); fillStroke(ctx, '#FFFFFF');
  ctx.beginPath(); ctx.moveTo(-44, -14); ctx.lineTo(18, -14); ctx.lineTo(10, -34); ctx.lineTo(-36, -34); ctx.closePath(); fillStroke(ctx, '#1F3FA8');
  ctx.beginPath(); ctx.roundRect(-40, -14, 70, 26, 5); fillStroke(ctx, a);
  for (const x of [-32, -4, 24]) { circle(ctx, x, 22, 11); fillStroke(ctx, '#23263A'); ctx.fillStyle = '#A7A9B4'; circle(ctx, x, 22, 4); ctx.fill(); }
}

function capsule(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.beginPath(); ctx.moveTo(-40, 34); ctx.lineTo(-16, -38); ctx.quadraticCurveTo(0, -46, 16, -38); ctx.lineTo(40, 34); ctx.closePath(); fillStroke(ctx, '#FFFFFF');
  ctx.beginPath(); ctx.moveTo(-44, 34); ctx.quadraticCurveTo(0, 50, 44, 34); ctx.closePath(); fillStroke(ctx, a);
  circle(ctx, -12, 2, 7); fillStroke(ctx, '#6FD3FF');
  circle(ctx, 12, 2, 7); fillStroke(ctx, '#6FD3FF');
  ctx.fillStyle = '#FF9933'; ctx.fillRect(-20, 18, 40, 4);
  ctx.fillStyle = '#138808'; ctx.fillRect(-20, 22, 40, 4);
}

function station(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx, 3);
  for (const x of [-42, -26, 26, 42]) for (const s of [-1, 1]) { ctx.beginPath(); ctx.rect(x - 6, s > 0 ? 6 : -40, 12, 34); fillStroke(ctx, '#1F3FA8'); }
  ctx.beginPath(); ctx.rect(-50, -4, 100, 8); fillStroke(ctx, '#A7A9B4');
  ctx.beginPath(); ctx.roundRect(-14, -14, 28, 28, 7); fillStroke(ctx, a);
  ctx.beginPath(); ctx.roundRect(-8, 14, 16, 20, 5); fillStroke(ctx, '#FFFFFF');
  circle(ctx, 0, 0, 5); fillStroke(ctx, '#6FD3FF');
}

function spadex(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx, 3);
  for (const [x, c] of [[-24, a], [24, '#FFFFFF']] as const) {
    ctx.beginPath(); ctx.rect(x + 22 * Math.sign(x) - 10, -20, 20, 40); fillStroke(ctx, '#1F3FA8');
    ctx.beginPath(); ctx.roundRect(x - 11, -13, 22, 26, 4); fillStroke(ctx, c);
  }
  ctx.beginPath(); ctx.rect(-13, -6, 26, 12); fillStroke(ctx, '#FFC93C');
  ctx.fillStyle = '#fff'; sparkle(ctx, 0, -30, 9);
}

function galaxy(ctx: CanvasRenderingContext2D, a: string) {
  ctx.save();
  ctx.scale(1, 0.62);
  for (let arm = 0; arm < 2; arm++) {
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.04) {
      const ang = arm * Math.PI + t * 4;
      const r = 6 + t * 42;
      ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    ctx.strokeStyle = a; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = a; ctx.shadowBlur = 12;
  circle(ctx, 0, 0, 9); ctx.fill();
  ctx.shadowBlur = 0;
}

function ufo(ctx: CanvasRenderingContext2D, a: string) {
  line(ctx);
  ctx.beginPath(); ctx.moveTo(-18, -4); ctx.bezierCurveTo(-18, -36, 18, -36, 18, -4); ctx.closePath(); fillStroke(ctx, '#6FD3FF');
  ctx.beginPath(); ctx.ellipse(0, 4, 46, 14, 0, 0, Math.PI * 2); fillStroke(ctx, a);
  for (const x of [-26, 0, 26]) { circle(ctx, x, 6, 4.5); fillStroke(ctx, '#FFC93C'); }
  ctx.fillStyle = 'rgba(255,201,60,0.35)';
  ctx.beginPath(); ctx.moveTo(-14, 16); ctx.lineTo(-26, 46); ctx.lineTo(26, 46); ctx.lineTo(14, 16); ctx.closePath(); ctx.fill();
}

function meteor(ctx: CanvasRenderingContext2D, a: string) {
  ctx.fillStyle = a;
  ctx.beginPath(); ctx.moveTo(-46, 40); ctx.quadraticCurveTo(-10, 0, 6, -24); ctx.lineTo(22, -2); ctx.quadraticCurveTo(-8, 14, -46, 40); ctx.fill();
  ctx.fillStyle = '#FFC93C';
  ctx.beginPath(); ctx.moveTo(-26, 30); ctx.quadraticCurveTo(-4, 6, 8, -12); ctx.lineTo(16, 0); ctx.quadraticCurveTo(-4, 12, -26, 30); ctx.fill();
  line(ctx);
  ctx.beginPath(); ctx.moveTo(4, -30); ctx.lineTo(22, -34); ctx.lineTo(34, -18); ctx.lineTo(28, 2); ctx.lineTo(10, 4); ctx.lineTo(0, -12); ctx.closePath(); fillStroke(ctx, '#8C6A55');
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; circle(ctx, 18, -16, 5); ctx.fill();
}

export const STAMPS: StampDef[] = [
  { id: 'rocket', name: 'Rocket', draw: rocket },
  { id: 'planet', name: 'Ringed planet', draw: planet },
  { id: 'star', name: 'Happy star', draw: star },
  { id: 'moon', name: 'Moon', draw: moon },
  { id: 'comet', name: 'Comet', draw: comet },
  { id: 'alien', name: 'Friendly alien', draw: alien },
  { id: 'satellite', name: 'Satellite', draw: satellite },
  { id: 'astronaut', name: 'Astronaut', draw: astronaut },
  { id: 'lander', name: 'Moon lander', draw: lander },
  { id: 'sunprobe', name: 'Sun probe', draw: sunprobe },
  { id: 'flag', name: 'Tiranga flag', draw: flag },
  { id: 'earth', name: 'Earth', draw: earth },
  { id: 'sunny', name: 'Smiling Sun', draw: sunny },
  { id: 'rover', name: 'Pragyan rover', draw: rover },
  { id: 'galaxy', name: 'Galaxy', draw: galaxy },
  { id: 'ufo', name: 'Flying saucer', draw: ufo },
  { id: 'meteor', name: 'Meteor', draw: meteor },
  { id: 'capsule', name: 'Gaganyaan capsule', draw: capsule },
  { id: 'station', name: 'Space station', draw: station },
  { id: 'spadex', name: 'SpaDeX docking', draw: spadex },
];

export function drawStamp(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, scale: number, rot: number, color: string) {
  const def = STAMPS.find((s) => s.id === id);
  if (!def) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  def.draw(ctx, color);
  ctx.restore();
}

function mix(a: string, b: string, t: number) {
  const pa = hex(a), pb = hex(b);
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}
export function hex(h: string): [number, number, number] {
  const s = h.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
