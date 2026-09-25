import type { ColouringPage } from '../types';
import type { El } from '@/drawing/kit/types';
import { PLANETS, SUN } from '@/content/planets';
import { sky } from './common';

/**
 * One page per planet, generated from the Explore content so facts live in one place.
 * Each world gets its own look; everything else comes from PLANETS.
 */
const LOOK: Record<string, { art: El[]; level: 1 | 2 | 3 }> = {
  mercury: { level: 1, art: [{ k: 'sun', x: -520, y: -420, r: 160, rays: 12 }, { k: 'planet', x: 60, y: 60, r: 230, craters: 7, seed: 2 }] },
  venus: { level: 1, art: [{ k: 'planet', x: 0, y: 20, r: 290, bands: 4, seed: 4 }, { k: 'cloud', x: -330, y: 360, w: 200, h: 80 }] },
  earth: { level: 2, art: [{ k: 'earth', x: 0, y: 30, r: 300 }, { k: 'moon', x: 340, y: -330, r: 70, craters: 3 }, { k: 'satellite', v: 'generic', x: -330, y: -330, s: 0.4 }] },
  mars: {
    level: 2,
    art: [
      { k: 'planet', x: 0, y: -80, r: 250, craters: 5, seed: 12 },
      { k: 'ground', y: 330, style: 'mars', seed: 3 },
      { k: 'svg', d: 'M-300 330 L-200 230 L-160 245 L-60 330 Z', x: 0, y: 0 },
    ],
  },
  jupiter: { level: 2, art: [{ k: 'planet', x: 0, y: 0, r: 320, bands: 6, spot: true }, { k: 'moon', x: -400, y: -380, r: 40 }, { k: 'moon', x: 400, y: 360, r: 34 }, { k: 'moon', x: 430, y: -300, r: 28 }] },
  saturn: { level: 2, art: [{ k: 'planet', x: 0, y: 0, r: 210, ring: 2.1, bands: 3, tilt: -0.25 }, { k: 'moon', x: -380, y: 360, r: 40 }] },
  uranus: { level: 1, art: [{ k: 'planet', x: 0, y: 0, r: 240, ring: 1.6, tilt: -1.35 }] },
  neptune: { level: 1, art: [{ k: 'planet', x: 0, y: 0, r: 270, bands: 3, spot: true }, { k: 'moon', x: 370, y: -360, r: 44, craters: 2 }] },
};

const STARS = sky([[-420, -440, 34], [420, -440, 30], [-440, 400, 26], [430, 420, 28], [-160, -470, 20], [200, 470, 22]]);

const planetPages: ColouringPage[] = PLANETS.map((p) => ({
  id: `planet-${p.id}`,
  title: p.name,
  cat: 'planets',
  level: LOOK[p.id].level,
  about: p.fact,
  facts: [p.wow, ...(p.india ? [p.india] : [])],
  body: p.id,
  model: { id: 'planet' },
  colours: p.colors,
  tags: ['planet', p.id],
  art: [STARS, ...LOOK[p.id].art.map((e) => (e.k === 'planet' && !('id' in e && e.id) ? { ...e, id: 'surface' } : e))],
}));

export const PLANET_PAGES: ColouringPage[] = [
  {
    id: 'the-sun', title: 'The Sun, our star', cat: 'planets', level: 1, body: 'sun',
    about: SUN.fact, facts: [SUN.wow, SUN.india], colours: ['#FFC93C', '#FF9933', '#E4572E', '#FFFFFF'], tags: ['sun', 'star'],
    art: [STARS, { k: 'sun', x: 0, y: 0, r: 230, rays: 16, face: true }],
  },
  ...planetPages,
  {
    id: 'pluto', title: 'Pluto, a dwarf planet', cat: 'planets', level: 1,
    about: 'Pluto is a small, icy world far beyond Neptune. It is called a dwarf planet.',
    facts: ['Pluto has a big heart-shaped patch of ice.', 'Pluto’s biggest moon, Charon, is about half its size.'],
    tags: ['pluto', 'dwarf planet'],
    art: [STARS, { k: 'planet', x: -40, y: 40, r: 240, craters: 3, seed: 9 }, { k: 'svg', d: 'M-40 110 C-120 40 -110 -30 -60 -20 C-40 -15 -40 5 -40 5 C-40 5 -40 -15 -20 -20 C30 -30 40 40 -40 110 Z', x: 0, y: 0 }, { k: 'moon', x: 330, y: -330, r: 110, craters: 3 }],
  },
  {
    id: 'shukrayaan', title: 'A mission to Venus', cat: 'planets', level: 2, body: 'venus',
    about: 'ISRO is planning an orbiter to study Venus and its thick, cloudy air. It is called Shukrayaan.',
    facts: ['Shukra is the Sanskrit name for Venus.', 'Venus is the hottest planet, hotter than an oven.'],
    tags: ['venus', 'shukrayaan', 'future'],
    art: [STARS, { k: 'orbit', x: -140, y: 170, rx: 450, ry: 160, rot: -0.35 }, { k: 'planet', x: -140, y: 170, r: 290, bands: 4 }, { k: 'satellite', v: 'ch2orbiter', x: 230, y: -270, s: 0.85 }],
  },
  {
    id: 'planet-lineup', title: 'All eight planets', cat: 'planets', level: 3,
    about: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune: eight planets travel around our Sun.',
    facts: ['The four closest planets are small and rocky.', 'The four furthest planets are giants made mostly of gas and ice.'],
    tags: ['planets', 'solar system'],
    art: [
      { k: 'sun', x: -700, y: 0, r: 280, rays: 16 },
      { k: 'planet', x: -330, y: -40, r: 22, craters: 1 },
      { k: 'planet', x: -250, y: 60, r: 36, bands: 2 },
      { k: 'earth', x: -160, y: -60, r: 38 },
      { k: 'planet', x: -80, y: 50, r: 28, craters: 1 },
      { k: 'planet', x: 60, y: -40, r: 100, bands: 4, spot: true },
      { k: 'planet', x: 250, y: 90, r: 80, ring: 1.9, bands: 2 },
      { k: 'planet', x: 380, y: -100, r: 55, ring: 1.5, tilt: -1.3 },
      { k: 'planet', x: 470, y: 110, r: 52, bands: 2 },
      { k: 'stars', at: [[-200, -400, 30], [100, -420, 26], [380, -400, 24], [-120, 400, 26], [250, 420, 28], [460, -330, 20]] },
    ],
  },
];
