/**
 * Coarse device tiering so mid-range Android phones stay smooth.
 * 'low' trims pixel ratio, star counts, particle counts and geometry segments.
 */
export type Quality = 'low' | 'high';

function detect(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const small = Math.min(window.screen.width, window.screen.height) < 500;
  if (cores <= 4 || mem <= 3 || (small && cores <= 6)) return 'low';
  return 'high';
}

export const QUALITY: Quality = typeof window === 'undefined' ? 'high' : detect();

export const Q = {
  dpr: (QUALITY === 'low' ? [1, 1.3] : [1, 1.75]) as [number, number],
  stars: QUALITY === 'low' ? 700 : 1600,
  particles: QUALITY === 'low' ? 90 : 220,
  seg: QUALITY === 'low' ? 24 : 40,
  antialias: QUALITY !== 'low',
  texture: QUALITY === 'low' ? 512 : 1024,
};
