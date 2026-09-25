import type { ColouringPage } from '../types';

/** Big shapes and very few regions, drawn with the chunkiest lines, for the youngest artists. */
const FEW: [number, number, number][] = [[-400, -420, 60], [400, -400, 54], [-420, 400, 50], [410, 410, 56]];

export const SIMPLE_PAGES: ColouringPage[] = [
  {
    id: 'simple-star', title: 'Happy star', cat: 'simple', level: 1, about: 'Stars are giant balls of glowing gas. Our Sun is a star too!',
    tags: ['star'],
    art: [{ k: 'star', x: 0, y: 30, r: 400, n: 5, inner: 0.5 }, { k: 'face', x: 0, y: 60, r: 150 }],
  },
  {
    id: 'simple-sun', title: 'Smiling Sun', cat: 'simple', level: 1, body: 'sun', about: 'The Sun gives us light and keeps us warm.',
    tags: ['sun'],
    art: [{ k: 'sun', x: 0, y: 0, r: 250, rays: 10, face: true }],
  },
  {
    id: 'simple-moon', title: 'Sleepy Moon', cat: 'simple', level: 1, body: 'moon', about: 'The Moon is Earth’s closest neighbour in space.',
    tags: ['moon'],
    art: [{ k: 'stars', at: FEW, style: 'star' }, { k: 'moon', x: 0, y: 0, r: 330, face: true }],
  },
  {
    id: 'simple-rocket', title: 'My first rocket', cat: 'simple', level: 1, about: 'Rockets push hot gas down so they can zoom up into space.',
    tags: ['rocket'],
    art: [{ k: 'stars', at: FEW, style: 'star' }, { k: 'rocket', v: 'toy', x: 0, y: 200, s: 1.55, flame: true }],
  },
  {
    id: 'simple-planet', title: 'Ringed planet', cat: 'simple', level: 1, about: 'Saturn’s rings are made of ice and rock.', model: { id: 'planet' },
    tags: ['planet', 'saturn', 'rings'],
    art: [{ k: 'stars', at: FEW, style: 'star' }, { k: 'planet', x: 0, y: 0, r: 230, ring: 1.9, face: true, id: 'surface' }],
  },
  {
    id: 'simple-earth', title: 'Our Earth', cat: 'simple', level: 1, body: 'earth', about: 'Earth is our home. It is the only planet we know with life.',
    tags: ['earth'],
    art: [{ k: 'stars', at: FEW, style: 'star' }, { k: 'earth', x: 0, y: 0, r: 330, face: true }],
  },
  {
    id: 'simple-astronaut', title: 'Little astronaut', cat: 'simple', level: 1, about: 'Astronauts wear spacesuits to stay safe in space.',
    tags: ['astronaut'],
    art: [{ k: 'stars', at: FEW, style: 'star' }, { k: 'astronaut', x: 0, y: 40, s: 2.1, pose: 'wave', face: true }],
  },
  {
    id: 'simple-satellite', title: 'Tiny satellite', cat: 'simple', level: 1, about: 'Satellites go round and round the Earth.',
    tags: ['satellite'],
    art: [{ k: 'stars', at: FEW, style: 'star' }, { k: 'satellite', v: 'cubesat1u', x: 0, y: 40, s: 2.4 }],
  },
  {
    id: 'simple-comet', title: 'Zooming comet', cat: 'simple', level: 1, about: 'Comets are icy snowballs with long, shiny tails.',
    tags: ['comet'],
    art: [{ k: 'stars', at: [[-400, 380, 60], [380, -400, 50]], style: 'star' }, { k: 'comet', x: 180, y: -150, r: 150, dir: Math.PI * 0.8, len: 520 }],
  },
  {
    id: 'simple-alien', title: 'Friendly alien', cat: 'simple', level: 1, about: 'Nobody has found life beyond Earth yet. Scientists keep looking!',
    tags: ['alien'],
    art: [
      { k: 'stars', at: FEW, style: 'star' },
      { k: 'svg', d: 'M-70 -190 L-130 -330 M70 -190 L130 -330', x: 0, y: 0 },
      { k: 'svg', d: 'M-100 -330 a30 30 0 1 0 -60 0 a30 30 0 1 0 60 0 Z M160 -330 a30 30 0 1 0 -60 0 a30 30 0 1 0 60 0 Z', x: 0, y: 0 },
      { k: 'svg', d: 'M-230 330 C-260 -60 -170 -220 0 -220 C170 -220 260 -60 230 330 Z', x: 0, y: 0 },
      { k: 'svg', d: 'M90 -40 a90 90 0 1 0 -180 0 a90 90 0 1 0 180 0 Z', x: 0, y: 0 },
      { k: 'dots', at: [[15, -35, 36]] },
      { k: 'svg', d: 'M-80 140 Q0 220 80 140', x: 0, y: 0 },
    ],
  },
  {
    id: 'simple-ufo', title: 'Flying saucer', cat: 'simple', level: 1, about: 'A flying saucer is a make-believe spaceship. What would yours look like?',
    tags: ['ufo', 'spaceship'],
    art: [
      { k: 'stars', at: FEW, style: 'star' },
      { k: 'svg', d: 'M-170 90 L-280 420 L280 420 L170 90 Z', x: 0, y: 0 },
      { k: 'svg', d: 'M-170 -20 C-170 -230 170 -230 170 -20 Z', x: 0, y: 0 },
      { k: 'svg', d: 'M-360 30 a360 100 0 1 0 720 0 a360 100 0 1 0 -720 0 Z', x: 0, y: 0 },
      { k: 'svg', d: 'M-180 40 a36 36 0 1 0 -72 0 a36 36 0 1 0 72 0 Z M36 60 a36 36 0 1 0 -72 0 a36 36 0 1 0 72 0 Z M252 40 a36 36 0 1 0 -72 0 a36 36 0 1 0 72 0 Z', x: 0, y: 0 },
    ],
  },
  {
    id: 'simple-space-cat', title: 'Space cat', cat: 'simple', level: 1, about: 'Real astronauts have taken tiny animals to space, like fish and fruit flies.',
    tags: ['cat', 'helmet'],
    art: [
      { k: 'stars', at: FEW, style: 'star' },
      { k: 'svg', d: 'M-300 330 C-300 200 300 200 300 330 L300 480 L-300 480 Z', x: 0, y: 0 },
      { k: 'svg', d: 'M280 -20 a280 280 0 1 0 -560 0 a280 280 0 1 0 560 0 Z', x: 0, y: 0 },
      { k: 'svg', d: 'M-170 -120 L-150 -250 L-60 -170 C-20 -180 20 -180 60 -170 L150 -250 L170 -120 C220 -40 190 120 0 130 C-190 120 -220 -40 -170 -120 Z', x: 0, y: 0 },
      { k: 'dots', at: [[-70, -50, 22], [70, -50, 22]] },
      { k: 'svg', d: 'M-20 10 L20 10 L0 32 Z M0 32 Q-30 70 -60 50 M0 32 Q30 70 60 50 M-100 20 L-220 0 M-100 40 L-220 60 M100 20 L220 0 M100 40 L220 60', x: 0, y: 0 },
    ],
  },
  {
    id: 'simple-rocket-moon', title: 'Off to the Moon!', cat: 'simple', level: 1, body: 'moon', about: 'It takes about three days for a spacecraft to fly from Earth to the Moon.',
    tags: ['rocket', 'moon'],
    art: [{ k: 'stars', at: [[-400, -420, 56], [420, 400, 50], [-380, 380, 44]], style: 'star' }, { k: 'moon', x: 260, y: -270, r: 200, face: true }, { k: 'rocket', v: 'toy', x: -150, y: 250, s: 1.05, rot: 0.55, flame: true }],
  },
];
