import type { El, Star } from '@/drawing/kit/types';

/**
 * Reusable scenery for pages. Stars placed at |x| or |y| beyond 540 only show in the
 * orientation that has room for them, so pages fill both tall and wide screens.
 */
export const EDGE_STARS: Star[] = [[-620, -380, 30], [640, -200, 26], [-640, 220, 22], [-260, -640, 30], [220, -620, 24], [30, -690, 18]];

export const sky = (at: Star[], style?: 'star' | 'sparkle' | 'mix'): El => ({ k: 'stars', at: [...at, ...EDGE_STARS], style });

/** Stars that leave the middle column free for a tall rocket and a tower on the right. */
export const ROCKET_SKY: Star[] = [[-380, -420, 40], [-250, -320, 24], [-430, -220, 28], [-300, -110, 18], [420, -470, 30], [450, -340, 20], [-190, -470, 18]];

/** Sriharikota: Satish Dhawan Space Centre, on an island by the sea, with palm trees. */
export const sriharikota = (groundY = 440): El[] => [
  { k: 'ground', y: groundY, style: 'flat' },
  { k: 'palm', x: -430, y: groundY - 170, s: 0.8 },
  { k: 'palm', x: -330, y: groundY - 140, s: 0.65, flip: true },
];

export const padScene = (x = 0, towerX = 250): El[] => [
  { k: 'tower', x: towerX, top: -360, base: 380, w: 80, arms: [-120, 80], side: -1 },
  { k: 'pad', x, y: 380, w: 300 },
];

export const smoke = (y = 420): El[] => [
  { k: 'cloud', x: -300, y: y + 20, w: 300, h: 150 },
  { k: 'cloud', x: 300, y: y + 20, w: 300, h: 150 },
  { k: 'cloud', x: -140, y, w: 280, h: 170 },
  { k: 'cloud', x: 140, y, w: 280, h: 170 },
  { k: 'cloud', x: 0, y: y + 30, w: 260, h: 150 },
];
