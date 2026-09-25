import type { GlyphName } from '@/ui/Glyph';

export interface BadgeDef {
  id: string;
  name: string;
  how: string;
  glyph: GlyphName;
  accent: string;
  test: (f: Record<string, number>) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-paint', name: 'Colour Cadet', how: 'Paint any part of a spacecraft', glyph: 'brush', accent: '#FF6FB1', test: (f) => (f.paint ?? 0) >= 1 },
  { id: 'liftoff', name: 'Liftoff!', how: 'Launch your first rocket', glyph: 'rocket', accent: '#FF9933', test: (f) => (f.launch ?? 0) >= 1 },
  { id: 'launch-director', name: 'Launch Director', how: 'Launch 5 rockets', glyph: 'rocket', accent: '#FFC93C', test: (f) => (f.launch ?? 0) >= 5 },
  { id: 'tiranga', name: 'Tiranga Rocket', how: 'Save a rocket painted saffron, white and green', glyph: 'flag', accent: '#138808', test: (f) => (f.tricolour ?? 0) >= 1 },
  { id: 'soft-lander', name: 'Soft Lander', how: 'Land Vikram on the Moon', glyph: 'lander', accent: '#A7A9B4', test: (f) => (f.land ?? 0) >= 1 },
  { id: 'mars-orbit', name: 'Mars Orbit', how: 'Fly Mangalyaan around Mars', glyph: 'orbiter', accent: '#E4572E', test: (f) => (f.orbit ?? 0) >= 1 },
  { id: 'world-builder', name: 'World Builder', how: 'Save a planet you designed', glyph: 'planet', accent: '#35D0BA', test: (f) => (f.savePlanet ?? 0) >= 1 },
  { id: 'colouring-champ', name: 'Colouring Champion', how: 'Save 5 pages from the colouring library', glyph: 'sparkle', accent: '#FFC93C', test: (f) => (f.colourPage ?? 0) >= 5 },
  { id: 'space-artist', name: 'Space Artist', how: 'Save 3 drawings', glyph: 'brush', accent: '#8A5CF6', test: (f) => (f.saveDrawing ?? 0) >= 3 },
  { id: 'surveyor', name: 'Solar Surveyor', how: 'Visit the Sun, all 8 planets and the Moon', glyph: 'sun', accent: '#FFC93C', test: (f) => (f.bodies ?? 0) >= 10 },
  { id: 'historian', name: 'Mission Historian', how: 'Discover every Indian space mission', glyph: 'satellite', accent: '#6FD3FF', test: (f) => (f.missions ?? 0) >= 11 },
  { id: 'bright-spark', name: 'Bright Spark', how: 'Answer 5 mission questions correctly', glyph: 'star', accent: '#FFC93C', test: (f) => (f.quizCorrect ?? 0) >= 5 },
  { id: 'curator', name: 'Museum Curator', how: 'Keep 10 creations in your archive', glyph: 'archive', accent: '#FF6FB1', test: (f) => (f.saves ?? 0) >= 10 },
];

export interface Rank {
  name: string;
  min: number;
}

export const RANKS: Rank[] = [
  { name: 'Space Cadet', min: 0 },
  { name: 'Star Explorer', min: 30 },
  { name: 'Rocket Pilot', min: 90 },
  { name: 'Mission Commander', min: 180 },
  { name: 'Mission Director', min: 320 },
];

export function rankFor(stars: number): { rank: Rank; next?: Rank; progress: number } {
  let i = 0;
  RANKS.forEach((r, idx) => {
    if (stars >= r.min) i = idx;
  });
  const rank = RANKS[i];
  const next = RANKS[i + 1];
  const progress = next ? (stars - rank.min) / (next.min - rank.min) : 1;
  return { rank, next, progress };
}
