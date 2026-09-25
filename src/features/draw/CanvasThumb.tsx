import { useEffect, useRef } from 'react';

/** Small preview canvas for stamps, backgrounds and pages, drawn once at device resolution. */
export function CanvasThumb({ w, h, draw, deps }: { w: number; h: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; deps: unknown[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return <canvas ref={ref} style={{ width: w, height: h, display: 'block' }} aria-hidden="true" />;
}
