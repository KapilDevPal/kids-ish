import type { ColouringPage } from '../types';
import type { El } from '@/drawing/kit/types';
import type { RocketSpec } from '@/drawing/kit/rockets';

/** Labelled diagrams: children colour the parts while reading their names. */

const TIRANGA: RocketSpec = {
  stages: [{ h: 130, w: 170 }, { h: 130, w: 170, deco: ['window'] }, { h: 130, w: 170 }],
  nose: { w: 170, h: 170, shape: 'ogive' },
  fins: { w: 80, h: 130 },
  nozzles: { n: 1, w: 90, h: 40 },
};

const BOOSTER: RocketSpec = { stages: [{ h: 190, w: 39 }], nose: { w: 39, h: 42, shape: 'ogive' }, nozzles: { n: 1, w: 30, h: 16 } };

const phase = (x: number, y: number, ph: number, t: string): El[] => [
  { k: 'moon', x, y, r: 88, phase: ph },
  { k: 'tag', t, x, y: y + 140, size: 26 },
];

export const LEARN_PAGES: ColouringPage[] = [
  {
    id: 'learn-rocket-parts', title: 'Parts of a rocket', cat: 'learn', level: 2,
    about: 'A rocket is built in stages. Each stage burns its fuel, then drops away to make the rocket lighter.',
    facts: ['The nose cone, or fairing, protects the satellite inside.', 'Boosters give extra push at the start.', 'The nozzle shapes the hot gas into a fast jet.'],
    mission: 'pslv', model: { id: 'pslv', options: { boosters: 6 } }, tags: ['parts', 'stages', 'pslv'],
    art: [
      { k: 'rocket', v: 'pslv', x: -150, y: 348, s: 0.95, parts: true },
      { k: 'tag', t: 'Nose cone', x: 130, y: -400, to: [-90, -400], align: 'left' },
      { k: 'tag', t: 'Stage 4', x: 130, y: -250, to: [-110, -240], align: 'left' },
      { k: 'tag', t: 'Stage 3', x: 130, y: -160, to: [-110, -170], align: 'left' },
      { k: 'tag', t: 'Stage 2', x: 130, y: -30, to: [-110, -30], align: 'left' },
      { k: 'tag', t: 'Stage 1', x: 130, y: 110, to: [-110, 110], align: 'left' },
      { k: 'tag', t: 'Boosters', x: 130, y: 250, to: [-50, 260], align: 'left' },
      { k: 'tag', t: 'Nozzle', x: 130, y: 390, to: [-150, 372], align: 'left' },
    ],
  },
  {
    id: 'learn-lander-parts', title: 'Parts of the Vikram lander', cat: 'learn', level: 2,
    about: 'Every part of a Moon lander has a job, from making power to landing softly.',
    facts: ['Solar panels turn sunlight into electricity.', 'The antenna sends messages back to Earth.', 'Bendy legs soak up the bump of landing.'],
    mission: 'chandrayaan-3', model: { id: 'vikram' }, tags: ['parts', 'vikram', 'lander'],
    art: [
      { k: 'ground', y: 330, style: 'moon', seed: 2 },
      { k: 'lander', x: 0, y: 60, s: 1.3, parts: true },
      { k: 'tag', t: 'Solar panel', x: 340, y: -250, to: [240, -40] },
      { k: 'tag', t: 'Antenna', x: 60, y: -330, to: [58, -110] },
      { k: 'tag', t: 'Body', x: -370, y: -160, to: [-100, 60] },
      { k: 'tag', t: 'Legs', x: -380, y: 440, to: [-190, 200] },
      { k: 'tag', t: 'Engine', x: 220, y: 440, to: [0, 180] },
    ],
  },
  {
    id: 'learn-planet-order', title: 'The planets in order', cat: 'learn', level: 2,
    about: 'Starting nearest the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.',
    facts: ['A trick to remember them: My Very Educated Mother Just Served Us Noodles.', 'Earth is number three.'],
    tags: ['planets', 'order', 'solar system'],
    art: [
      { k: 'planet', x: -390, y: -230, r: 50, craters: 2, id: 'surface' },
      { k: 'planet', x: -130, y: -230, r: 72, bands: 3 },
      { k: 'earth', x: 130, y: -230, r: 76 },
      { k: 'planet', x: 390, y: -230, r: 60, craters: 2 },
      { k: 'planet', x: -400, y: 200, r: 100, bands: 4, spot: true },
      { k: 'planet', x: -130, y: 200, r: 78, ring: 1.9, bands: 2 },
      { k: 'planet', x: 140, y: 200, r: 70, ring: 1.5, tilt: -1.3 },
      { k: 'planet', x: 390, y: 200, r: 70, bands: 2 },
      ...(['Mercury', 'Venus', 'Earth', 'Mars'] as const).map((t, i): El => ({ k: 'tag', t: `${i + 1} ${t}`, x: -390 + i * 260, y: -90, size: 26 })),
      ...(['Jupiter', 'Saturn', 'Uranus', 'Neptune'] as const).map((t, i): El => ({ k: 'tag', t: `${i + 5} ${t}`, x: -390 + i * 260, y: 360, size: 26 })),
    ],
  },
  {
    id: 'learn-moon-phases', title: 'Name the Moon’s phases', cat: 'learn', level: 2, body: 'moon',
    about: 'The Moon seems to grow (wax) for two weeks, then shrink (wane) for two weeks.',
    facts: ['Shade the dark part of each Moon, and colour the sunny part bright.', 'Full Moon is called Purnima and new Moon is Amavasya.'],
    tags: ['moon', 'phases'],
    art: [
      { k: 'text', t: 'Growing', x: 0, y: -420, size: 40 },
      ...phase(-390, -250, 0, 'New Moon'), ...phase(-130, -250, 0.125, 'Crescent'), ...phase(130, -250, 0.25, 'Half'), ...phase(390, -250, 0.375, 'Gibbous'),
      { k: 'text', t: 'Shrinking', x: 0, y: 30, size: 40 },
      ...phase(-390, 200, 0.5, 'Full Moon'), ...phase(-130, 200, 0.625, 'Gibbous'), ...phase(130, 200, 0.75, 'Half'), ...phase(390, 200, 0.875, 'Crescent'),
    ],
  },
  {
    id: 'learn-launch-steps', title: 'How a rocket reaches space', cat: 'learn', level: 3,
    about: 'Liftoff, the boosters drop away, then the nose cone opens and the satellite is set free.',
    facts: ['Dropping empty stages makes the rocket lighter, so it can go faster.', 'The whole trip to orbit takes about 20 minutes for PSLV.'],
    mission: 'pslv', tags: ['stages', 'launch', 'orbit'],
    art: [
      { k: 'rocket', v: 'pslv', x: -370, y: 260, s: 0.5, flame: true },
      { k: 'rocket', v: 'pslv-ca', x: 0, y: 120, s: 0.5, flame: true },
      { k: 'rocket', v: BOOSTER, x: -90, y: 330, s: 0.55, rot: -0.6 },
      { k: 'rocket', v: BOOSTER, x: 90, y: 340, s: 0.55, rot: 0.7 },
      { k: 'satellite', v: 'generic', x: 370, y: -170, s: 0.5 },
      { k: 'svg', d: 'M320 40 C300 0 300 -40 330 -70 L345 -60 C320 -30 325 10 340 40 Z M420 40 C440 0 440 -40 410 -70 L395 -60 C420 -30 415 10 400 40 Z', x: 0, y: 0 },
      { k: 'number', n: 1, x: -370, y: -300, r: 36 },
      { k: 'number', n: 2, x: 0, y: -380, r: 36 },
      { k: 'number', n: 3, x: 370, y: -380, r: 36 },
      { k: 'arrow', from: [-280, -140], to: [-120, -200] },
      { k: 'arrow', from: [110, -210], to: [270, -250] },
      { k: 'tag', t: 'Liftoff', x: -370, y: 440, size: 28 },
      { k: 'tag', t: 'Boosters drop', x: 0, y: 440, size: 28 },
      { k: 'tag', t: 'Satellite free', x: 370, y: 440, size: 28 },
    ],
  },
  {
    id: 'learn-satellite-parts', title: 'Parts of a satellite', cat: 'learn', level: 2,
    about: 'Most satellites have a body, solar panels for power and an antenna to talk to Earth.',
    facts: ['Gold-coloured foil keeps the satellite from getting too hot or too cold.', 'Satellites can work in space for 10 years or more.'],
    tags: ['satellite', 'parts'],
    art: [
      { k: 'satellite', v: 'generic', x: 0, y: 20, s: 1.2 },
      { k: 'tag', t: 'Antenna', x: -250, y: -300, to: [0, -140] },
      { k: 'tag', t: 'Solar panel', x: -330, y: 280, to: [-200, 60] },
      { k: 'tag', t: 'Solar panel', x: 330, y: 280, to: [200, 60] },
      { k: 'tag', t: 'Body', x: 260, y: -300, to: [40, -20] },
    ],
  },
  {
    id: 'learn-spacesuit', title: 'Parts of a spacesuit', cat: 'learn', level: 2,
    about: 'A spacesuit is like a tiny spacecraft you wear. It gives air, keeps you warm and protects you.',
    facts: ['The backpack carries air to breathe and water to keep cool.', 'Gloves have warm fingertips so hands do not get cold.'],
    tags: ['spacesuit', 'astronaut', 'parts'],
    art: [
      { k: 'astronaut', x: -120, y: 60, s: 1.45, pose: 'stand' },
      { k: 'tag', t: 'Helmet', x: 250, y: -370, to: [-60, -170], align: 'left' },
      { k: 'tag', t: 'Visor', x: 250, y: -250, to: [-110, -110], align: 'left' },
      { k: 'tag', t: 'Backpack', x: 250, y: -110, to: [-10, -60], align: 'left' },
      { k: 'tag', t: 'Flag patch', x: 250, y: 20, to: [-180, 0], align: 'left' },
      { k: 'tag', t: 'Gloves', x: 250, y: 150, to: [40, 160], align: 'left' },
      { k: 'tag', t: 'Boots', x: 250, y: 330, to: [-50, 320], align: 'left' },
    ],
  },
  {
    id: 'learn-where-space', title: 'Where does space begin?', cat: 'learn', level: 2,
    about: 'Space begins about 100 kilometres above our heads. Satellites and space stations fly much higher.',
    facts: ['That 100 km line is called the Kármán line.', 'This picture is not to scale: the Moon is far, far further away!'],
    tags: ['space', 'height', 'atmosphere'],
    art: [
      { k: 'ground', y: 430, style: 'hills' },
      { k: 'cloud', x: -300, y: 300, w: 220, h: 90 },
      { k: 'tag', t: 'Clouds: 10 km', x: 180, y: 300, size: 28 },
      { k: 'svg', d: 'M-560 140 L560 140', x: 0, y: 0 },
      { k: 'tag', t: 'Space begins: 100 km', x: 0, y: 140, size: 30 },
      { k: 'station', x: -250, y: -40, s: 0.32 },
      { k: 'tag', t: 'Space station: 400 km', x: 200, y: -40, size: 28 },
      { k: 'satellite', v: 'gsat', x: -250, y: -250, s: 0.45 },
      { k: 'tag', t: 'Weather satellite: 36,000 km', x: 180, y: -250, size: 26 },
      { k: 'moon', x: -250, y: -420, r: 60, craters: 2 },
      { k: 'tag', t: 'Moon: 3,84,400 km', x: 160, y: -420, size: 26 },
    ],
  },
  {
    id: 'learn-tiranga-rocket', title: 'Colour a Tiranga rocket', cat: 'learn', level: 1,
    about: 'Colour the top saffron, the middle white with a navy blue chakra, and the bottom green, like India’s flag.',
    facts: ['Saffron stands for courage, white for peace and green for growth.', 'The chakra has 24 spokes.'],
    colours: ['#FF9933', '#FFFFFF', '#138808', '#1F3FA8'], tags: ['tiranga', 'flag', 'tricolour'],
    art: [
      { k: 'rocket', v: TIRANGA, x: -120, y: 320, s: 1 },
      { k: 'tag', t: 'Saffron', x: 130, y: -140, to: [-60, -140], align: 'left' },
      { k: 'tag', t: 'White', x: 130, y: 0, to: [-60, 10], align: 'left' },
      { k: 'tag', t: 'Navy chakra', x: 130, y: 110, to: [-120, 70], align: 'left' },
      { k: 'tag', t: 'Green', x: 130, y: 250, to: [-60, 250], align: 'left' },
    ],
  },
  {
    id: 'learn-isro-timeline', title: 'India in space: a timeline', cat: 'learn', level: 3,
    about: 'From a small rocket at Thumba to landing on the Moon: sixty years of Indian space adventures.',
    facts: ['1963: first rocket launch from Thumba.', '1975: Aryabhata, first satellite.', '2008: Chandrayaan-1 goes to the Moon.', '2014: Mangalyaan reaches Mars.', '2023: Chandrayaan-3 lands on the Moon.'],
    tags: ['history', 'timeline'],
    art: [
      { k: 'rocket', v: 'rohini', x: -360, y: -60, s: 0.62 },
      { k: 'satellite', v: 'aryabhata', x: 0, y: -230, s: 0.7 },
      { k: 'moon', x: 360, y: -230, r: 90, craters: 3 },
      { k: 'planet', x: -200, y: 230, r: 90, craters: 3 },
      { k: 'lander', x: 220, y: 200, s: 0.55 },
      { k: 'tag', t: '1963 · Thumba', x: -360, y: 60, size: 26 },
      { k: 'tag', t: '1975 · Aryabhata', x: 0, y: -90, size: 26 },
      { k: 'tag', t: '2008 · Chandrayaan-1', x: 360, y: -90, size: 26 },
      { k: 'tag', t: '2014 · Mangalyaan', x: -200, y: 370, size: 26 },
      { k: 'tag', t: '2023 · Chandrayaan-3', x: 220, y: 370, size: 26 },
    ],
  },
];
