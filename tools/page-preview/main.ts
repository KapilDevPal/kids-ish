// Dev-only page checker (npm run dev, then open /tools/page-preview/). Paints every enclosed region a random colour
// so leaks and fiddly tiny regions stand out. Query: ?cat=rockets | ?id=a,b | ?o=l (landscape) | ?r=0 (lines only) | ?s=0.5 (scale)
import { COLOURING_PAGES } from '@/content/colouring';
import { drawPage } from '@/drawing/pages';

const q = new URLSearchParams(location.search);
const cat = q.get('cat');
const only = q.get('id');
const orient = q.get('o') ?? 'p';
const regions = q.get('r') !== '0';
const W = orient === 'p' ? 540 : 720, H = orient === 'p' ? 720 : 540;
const scale = Number(q.get('s') ?? 0.5);

await document.fonts.ready;
const pages = COLOURING_PAGES.filter((p) => (only ? only.split(',').includes(p.id) : !cat || p.cat === cat));
for (const p of pages) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  const anchors = drawPage(x, p.id, W, H);
  const line = x.getImageData(0, 0, W, H);
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const o = out.getContext('2d')!;
  o.fillStyle = '#fff'; o.fillRect(0, 0, W, H);
  let count = 0, tiny = 0;
  if (regions) {
    const img = o.getImageData(0, 0, W, H);
    const lab = new Int32Array(W * H);
    const d = line.data;
    for (let i = 0; i < W * H; i++) {
      if (lab[i] || d[i * 4 + 3] > 100) continue;
      count++;
      const stack = [i]; lab[i] = count; const pix: number[] = [];
      while (stack.length) {
        const k = stack.pop()!; pix.push(k);
        const xx = k % W, yy = (k / W) | 0;
        for (const n of [xx > 0 ? k - 1 : -1, xx < W - 1 ? k + 1 : -1, yy > 0 ? k - W : -1, yy < H - 1 ? k + W : -1]) {
          if (n >= 0 && !lab[n] && d[n * 4 + 3] <= 100) { lab[n] = count; stack.push(n); }
        }
      }
      if (pix.length < 60) tiny++;
      const hue = (count * 137) % 360;
      const [r, g, b] = hsl(hue, 70, 78);
      for (const k of pix) { img.data[k * 4] = r; img.data[k * 4 + 1] = g; img.data[k * 4 + 2] = b; }
    }
    o.putImageData(img, 0, 0);
  }
  o.drawImage(c, 0, 0);
  o.fillStyle = 'red';
  for (const [id, [ax, ay]] of Object.entries(anchors)) { o.beginPath(); o.arc(ax, ay, 5, 0, 7); o.fill(); o.font = '11px sans-serif'; o.fillText(id, ax + 6, ay); }
  out.style.width = W * scale + 'px';
  const f = document.createElement('figure');
  const cap = document.createElement('figcaption');
  cap.textContent = `${p.id} (L${p.level}) regions:${count} tiny:${tiny}`;
  f.append(out, cap);
  document.getElementById('g')!.append(f);
}
document.title = 'done';
function hsl(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)].map(Math.round);
}
