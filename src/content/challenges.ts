import type { GameEvent } from '@/state/types';
import type { GlyphName } from '@/ui/Glyph';

export interface Challenge {
  id: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  glyph: GlyphName;
  accent: string;
  done: (e: GameEvent) => boolean;
}

/** One featured challenge per day, rotating. No timers and no failure: just a fresh idea each visit. */
export const CHALLENGES: Challenge[] = [
  {
    id: 'tiranga', title: 'Paint a Tiranga rocket', detail: 'Use saffron, white and green on one rocket, then save it.',
    href: '#/hangar/pslv', cta: 'Open the hangar', glyph: 'flag', accent: '#FF9933',
    done: (e) => e.type === 'save' && !!e.meta?.tricolour,
  },
  {
    id: 'xl', title: 'Launch a PSLV‑XL', detail: 'Give PSLV all 6 strap‑on boosters and launch it.',
    href: '#/hangar/pslv', cta: 'Build it', glyph: 'rocket', accent: '#FFC93C',
    done: (e) => e.type === 'launch' && e.modelId === 'pslv' && e.boosters === 6,
  },
  {
    id: 'ringed', title: 'Invent a ringed world', detail: 'Design a planet with rings and at least 2 moons, then save it.',
    href: '#/hangar/planet', cta: 'Make a planet', glyph: 'planet', accent: '#35D0BA',
    done: (e) => e.type === 'save' && e.kind === 'planet' && !!e.meta?.rings && (e.meta?.moons ?? 0) >= 2,
  },
  {
    id: 'stamps', title: 'Fill a scene with friends', detail: 'Use 5 or more stamps in one drawing and save it.',
    href: '#/draw', cta: 'Start drawing', glyph: 'astronaut', accent: '#FF6FB1',
    done: (e) => e.type === 'save' && e.kind === 'drawing' && (e.meta?.stamps ?? 0) >= 5,
  },
  {
    id: 'glow', title: 'Make something glow', detail: 'Paint any part with the Glow finish and save your craft.',
    href: '#/hangar/pslv', cta: 'Get glowing', glyph: 'sparkle', accent: '#8A5CF6',
    done: (e) => e.type === 'save' && !!e.meta?.glow,
  },
  {
    id: 'starry', title: 'Draw a sky full of stars', detail: 'Use the Star spray brush and save your picture.',
    href: '#/draw', cta: 'Grab the brush', glyph: 'star', accent: '#6FD3FF',
    done: (e) => e.type === 'save' && e.kind === 'drawing' && !!e.meta?.brushes?.includes('stars'),
  },
  {
    id: 'isro-page', title: 'Colour an ISRO mission', detail: 'Pick a page from ISRO Missions in the colouring library, colour it and save it.',
    href: '#/draw/library/isro', cta: 'Open the library', glyph: 'lander', accent: '#138808',
    done: (e) => e.type === 'save' && e.kind === 'drawing' && e.meta?.pageCategory === 'isro',
  },
  {
    id: 'startup-page', title: 'Meet India’s space start-ups', detail: 'Colour a rocket or satellite from Indian Private Space and save it.',
    href: '#/draw/library/private', cta: 'See the pages', glyph: 'rocket', accent: '#8A5CF6',
    done: (e) => e.type === 'save' && e.kind === 'drawing' && e.meta?.pageCategory === 'private',
  },
  {
    id: 'giant', title: 'Visit the biggest planet', detail: 'Find Jupiter in the Solar System and tap it.',
    href: '#/explore', cta: 'Explore', glyph: 'planet', accent: '#D9B38C',
    done: (e) => e.type === 'discover' && e.id === 'jupiter',
  },
  {
    id: 'quiz', title: 'Answer a mission question', detail: 'Discover an Indian mission and get its question right.',
    href: '#/explore/missions', cta: 'See missions', glyph: 'satellite', accent: '#35D0BA',
    done: (e) => e.type === 'quiz' && e.correct,
  },
];

export function todaysChallenge(date = new Date()): Challenge {
  const day = Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);
  return CHALLENGES[day % CHALLENGES.length];
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
