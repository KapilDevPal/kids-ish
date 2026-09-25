import type { ColouringPage } from '../types';
import { sky } from './common';

const PHASES = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];

export const MOON_PAGES: ColouringPage[] = [
  {
    id: 'full-moon', title: 'Full Moon night', cat: 'moon', level: 1, body: 'moon',
    about: 'On a full Moon night, the whole side of the Moon facing us is lit up by the Sun.',
    facts: ['The Moon does not make its own light. It shines with sunlight.', 'A full Moon comes about once a month.'],
    tags: ['full moon', 'night'],
    art: [
      sky([[-400, -440, 34], [400, -120, 30], [-420, -60, 26], [420, 110, 24], [-120, -470, 22]]),
      { k: 'moon', x: 60, y: -170, r: 250, craters: 6, seed: 3, id: 'surface' },
      { k: 'cloud', x: -260, y: 60, w: 260, h: 110 },
      { k: 'ground', y: 360, style: 'hills' },
      { k: 'palm', x: 380, y: 170, s: 0.9 },
    ],
  },
  {
    id: 'crescent-moon', title: 'Crescent Moon and stars', cat: 'moon', level: 1, body: 'moon',
    about: 'A crescent Moon is when we can see only a thin slice of the Moon lit by the Sun.',
    facts: ['The lit part grows a little each night, then shrinks again.', 'Waxing means growing, waning means shrinking.'],
    tags: ['crescent', 'phase'],
    art: [sky([[300, -330, 60], [380, 60, 44], [-380, 380, 40], [200, 380, 36], [-420, -420, 30]], 'star'), { k: 'moon', x: -60, y: -40, r: 300, phase: 0.14 }],
  },
  {
    id: 'moon-phases', title: 'The Moon’s changing shape', cat: 'moon', level: 2, body: 'moon',
    about: 'As the Moon travels around Earth, we see different amounts of its sunny side. These are its phases.',
    facts: ['One full set of phases takes about 29 and a half days.', 'Many festivals in India follow the phases of the Moon.'],
    tags: ['phases', 'calendar'],
    art: [
      { k: 'earth', x: 0, y: 0, r: 110 },
      ...PHASES.map((ph, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 2;
        return { k: 'moon' as const, x: Math.cos(a) * 340, y: Math.sin(a) * 340, r: 70, phase: ph };
      }),
    ],
  },
  {
    id: 'moon-craters', title: 'Craters up close', cat: 'moon', level: 2, body: 'moon',
    about: 'Craters are bowls made when space rocks crashed into the Moon long ago.',
    facts: ['The Moon has no wind or rain, so craters stay for billions of years.', 'Some craters are bigger than a whole city.'],
    tags: ['craters', 'surface'],
    art: [
      sky([[-420, -440, 30], [-200, -380, 22], [100, -460, 26], [420, -420, 24]]),
      { k: 'earth', x: 330, y: -300, r: 90 },
      { k: 'ground', y: -60, style: 'moon', seed: 31 },
      { k: 'crater', x: -220, y: 130, r: 190 },
      { k: 'crater', x: 250, y: 230, r: 150 },
      { k: 'crater', x: -60, y: 400, r: 120 },
      { k: 'crater', x: 330, y: 470, r: 70 },
      { k: 'rover', x: 60, y: 90, s: 0.6 },
    ],
  },
  {
    id: 'earthrise', title: 'Earthrise from the Moon', cat: 'moon', level: 2, body: 'moon',
    about: 'From the Moon, our Earth looks like a big blue marble rising over the grey horizon.',
    facts: ['Earth looks about four times bigger from the Moon than the Moon looks from Earth.', 'The Moon’s sky is always black, even in the daytime.'],
    tags: ['earth', 'horizon'],
    art: [
      sky([[-420, -440, 30], [-240, -330, 22], [420, -440, 26], [420, -150, 22]]),
      { k: 'earth', x: 0, y: -170, r: 230 },
      { k: 'ground', y: 180, style: 'moon', seed: 6 },
      { k: 'lander', x: -300, y: 230, s: 0.6 },
    ],
  },
  {
    id: 'lunar-eclipse', title: 'A lunar eclipse', cat: 'moon', level: 2, body: 'moon',
    about: 'In a lunar eclipse, Earth sits between the Sun and the Moon, and Earth’s shadow covers the Moon.',
    facts: ['During an eclipse the Moon can turn a coppery red.', 'It is safe to look at a lunar eclipse with your eyes.'],
    tags: ['eclipse', 'shadow'],
    art: [
      sky([[-420, -440, 26], [0, -460, 22], [420, -440, 26], [-420, 430, 22], [420, 430, 24]]),
      { k: 'svg', d: 'M-40 -110 L380 -60 L380 60 L-40 110', x: 0, y: 0 },
      { k: 'sun', x: -400, y: 0, r: 110, rays: 10 },
      { k: 'earth', x: -40, y: 0, r: 120 },
      { k: 'moon', x: 380, y: 0, r: 60, craters: 2 },
    ],
  },
  {
    id: 'moon-base', title: 'An Indian on the Moon', cat: 'moon', level: 2, body: 'moon',
    about: 'India hopes to send its own astronaut to the Moon by 2040. Who do you think will go?',
    facts: ['Gaganyaan is the first step: flying astronauts around Earth.', 'On the Moon you weigh only about one sixth of what you weigh on Earth.'],
    tags: ['future', 'astronaut', 'flag'],
    art: [
      sky([[-420, -440, 30], [-200, -470, 22], [120, -460, 20]]),
      { k: 'earth', x: 330, y: -330, r: 90 },
      { k: 'ground', y: 360, style: 'moon', seed: 17 },
      { k: 'lander', x: -300, y: 180, s: 0.7 },
      { k: 'astronaut', x: 80, y: 160, s: 0.95, pose: 'wave' },
      { k: 'flag', x: 360, y: 90, s: 0.62 },
    ],
  },
  {
    id: 'moon-south-pole', title: 'Ice at the Moon’s south pole', cat: 'moon', level: 2, body: 'moon',
    about: 'Some craters near the Moon’s south pole are always in shadow. Scientists think ice may hide inside them.',
    facts: ['Ice could give future astronauts water to drink.', 'Water can also be split to make rocket fuel.'],
    tags: ['south pole', 'ice', 'water'],
    art: [
      sky([[-420, -440, 30], [-160, -460, 22], [200, -440, 24], [420, -300, 22]]),
      { k: 'sun', x: -380, y: -260, r: 70, rays: 10 },
      { k: 'ground', y: -40, style: 'moon', seed: 44 },
      { k: 'crater', x: 60, y: 220, r: 300 },
      { k: 'svg', d: 'M-60 220 l30 -40 l30 40 l30 -30 l30 30 Z M80 250 l25 -30 l25 30 Z', x: 0, y: 0 },
      { k: 'rover', x: -320, y: 110, s: 0.55 },
    ],
  },
];
