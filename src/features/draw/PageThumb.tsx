import { useEffect, useRef, useState } from 'react';
import { drawPage } from '@/drawing/pages';
import type { Orientation } from '@/drawing/types';

/**
 * Colouring page previews that scale to hundreds of pages:
 * each one renders only when it scrolls into view, a few per frame, and is cached as a small PNG
 * so reopening the library is instant and memory stays low on phones.
 */
const cache = new Map<string, string>();
const queue: (() => void)[] = [];
let pumping = false;

function pump() {
  pumping = true;
  const t0 = performance.now();
  while (queue.length && performance.now() - t0 < 10) queue.shift()!();
  if (queue.length) requestAnimationFrame(pump);
  else pumping = false;
}

function render(id: string, orient: Orientation, w: number, h: number): string {
  const key = `${id}:${orient}:${w}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
  // Line art first on its own transparent layer (pages erase behind shapes), then onto paper.
  const art = document.createElement('canvas');
  art.width = pw;
  art.height = ph;
  drawPage(art.getContext('2d')!, id, pw, ph);
  const out = document.createElement('canvas');
  out.width = pw;
  out.height = ph;
  const x = out.getContext('2d')!;
  x.fillStyle = '#FFF8EC';
  x.fillRect(0, 0, pw, ph);
  x.drawImage(art, 0, 0);
  const url = out.toDataURL('image/png');
  cache.set(key, url);
  return url;
}

export function PageThumb({ id, orient, w, className }: { id: string; orient: Orientation; w: number; className?: string }) {
  const h = Math.round(orient === 'portrait' ? (w * 4) / 3 : (w * 3) / 4);
  const key = `${id}:${orient}:${w}`;
  const [src, setSrc] = useState(() => cache.get(key) ?? null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const done = cache.get(key);
    if (done) return setSrc(done);
    setSrc(null);
    const el = ref.current;
    if (!el) return;
    let live = true;
    const job = () => live && setSrc(render(id, orient, w, h));
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      queue.push(job);
      if (!pumping) requestAnimationFrame(pump);
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
    };
  }, [key, id, orient, w, h]);

  return (
    <span ref={ref} className={`page-thumb ${className ?? ''}`} style={{ aspectRatio: `${w} / ${h}` }}>
      {src && <img src={src} alt="" draggable={false} />}
    </span>
  );
}
