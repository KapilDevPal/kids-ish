import { hex } from './stamps';

/**
 * Scanline flood fill onto the ink layer.
 * Walls are colouring-page lines (opaque pixels on the line layer) and ink that differs from the tapped colour.
 * Filled area is grown by one pixel so it tucks neatly under anti-aliased edges.
 */
export function floodFill(ink: CanvasRenderingContext2D, lineLayer: CanvasRenderingContext2D | null, x0: number, y0: number, color: string): boolean {
  const { width: w, height: h } = ink.canvas;
  x0 = Math.floor(x0);
  y0 = Math.floor(y0);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return false;
  const img = ink.getImageData(0, 0, w, h);
  const d = img.data;
  const line = lineLayer ? lineLayer.getImageData(0, 0, w, h).data : null;
  let i0 = (y0 * w + x0) * 4;
  if (line && line[i0 + 3] > 100) {
    // Tapped right on a line: small fingers are forgiven by filling the nearest open space.
    const near = nearestOpen(line, w, h, x0, y0, 18);
    if (!near) return false;
    [x0, y0] = near;
    i0 = (y0 * w + x0) * 4;
  }
  const [fr, fg, fb] = hex(color);
  const sr = d[i0], sg = d[i0 + 1], sb = d[i0 + 2], sa = d[i0 + 3];
  if (sa > 250 && Math.abs(sr - fr) + Math.abs(sg - fg) + Math.abs(sb - fb) < 8) return false;

  const tol = 90;
  const mask = new Uint8Array(w * h);
  const match = (p: number) => {
    if (mask[p]) return false;
    const i = p * 4;
    if (line && line[i + 3] > 100) return false;
    const da = Math.abs(d[i + 3] - sa);
    if (sa < 30) return d[i + 3] < 60; // empty region: stop at any real ink
    return da + Math.abs(d[i] - sr) + Math.abs(d[i + 1] - sg) + Math.abs(d[i + 2] - sb) < tol;
  };

  const stack: number[] = [x0, y0];
  while (stack.length) {
    const y = stack.pop()!;
    let x = stack.pop()!;
    let p = y * w + x;
    while (x > 0 && match(p - 1)) { x--; p--; }
    let up = false, down = false;
    while (x < w && match(p)) {
      mask[p] = 1;
      if (y > 0) {
        const m = match(p - w);
        if (m && !up) { stack.push(x, y - 1); up = true; } else if (!m) up = false;
      }
      if (y < h - 1) {
        const m = match(p + w);
        if (m && !down) { stack.push(x, y + 1); down = true; } else if (!m) down = false;
      }
      x++; p++;
    }
  }

  // Paint mask plus a 1px halo.
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const p = row + x;
      const on = mask[p] || (x > 0 && mask[p - 1]) || (x < w - 1 && mask[p + 1]) || (y > 0 && mask[p - w]) || (y < h - 1 && mask[p + w]);
      if (!on) continue;
      const i = p * 4;
      d[i] = fr; d[i + 1] = fg; d[i + 2] = fb; d[i + 3] = 255;
    }
  }
  ink.putImageData(img, 0, 0);
  return true;
}

function nearestOpen(line: Uint8ClampedArray, w: number, h: number, x0: number, y0: number, maxR: number): [number, number] | null {
  for (let r = 1; r <= maxR; r++) {
    for (let k = 0; k < 8 * r; k++) {
      const a = (k / (8 * r)) * Math.PI * 2;
      const x = Math.round(x0 + Math.cos(a) * r), y = Math.round(y0 + Math.sin(a) * r);
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (line[(y * w + x) * 4 + 3] <= 100) return [x, y];
    }
  }
  return null;
}
