import type { ColouringPage } from '../types';
import { sky } from './common';

export const DEEP_PAGES: ColouringPage[] = [
  {
    id: 'milky-way', title: 'Our galaxy, the Milky Way', cat: 'deep', level: 2,
    about: 'Our Sun is one of hundreds of billions of stars in a giant spinning galaxy called the Milky Way.',
    facts: ['In Hindi the Milky Way is called Akashganga, the river of the sky.', 'Light takes about 100,000 years to cross it.'],
    tags: ['galaxy', 'akashganga'],
    art: [sky([[-420, -430, 30], [420, -430, 26], [-430, 380, 24], [430, 400, 28], [0, -470, 20], [0, 470, 22]]), { k: 'galaxy', x: 0, y: 0, r: 420, arms: 4, tilt: -0.3 }],
  },
  {
    id: 'nebula', title: 'A star nursery nebula', cat: 'deep', level: 2,
    about: 'A nebula is a huge cloud of gas and dust. New stars are born inside some of them.',
    facts: ['Nebulas can be many light years across.', 'Telescopes see them glowing in pink, blue and green.'],
    tags: ['nebula', 'stars'],
    art: [sky([[-420, -440, 26], [420, -420, 24], [-440, 420, 22], [430, 430, 24]]), { k: 'nebula', x: 0, y: 0, w: 900, h: 700, seed: 21 }, { k: 'stars', at: [[-120, -60, 40], [150, 60, 34], [30, -220, 28], [-60, 220, 30]] }],
  },
  {
    id: 'black-hole', title: 'A black hole', cat: 'deep', level: 2,
    about: 'A black hole pulls so strongly that not even light can escape. Glowing gas swirls around it.',
    facts: ['There is a giant black hole in the middle of our galaxy.', 'The swirling disc of gas can be hotter than the Sun.'],
    tags: ['black hole', 'gravity'],
    art: [sky([[-420, -430, 30], [420, -430, 26], [-430, 380, 24], [430, 400, 28], [-200, -330, 22], [220, 330, 22]]), { k: 'blackhole', x: 0, y: 0, r: 150 }],
  },
  {
    id: 'comet', title: 'A comet with a glowing tail', cat: 'deep', level: 1,
    about: 'Comets are giant dirty snowballs. Near the Sun they warm up and grow long glowing tails.',
    facts: ['A comet’s tail always points away from the Sun.', 'Some comets come back every 76 years, like Halley’s Comet.'],
    tags: ['comet', 'tail'],
    art: [sky([[-420, 380, 30], [420, -420, 26], [-420, -420, 34], [300, 380, 28], [0, 440, 22]]), { k: 'comet', x: 220, y: -170, r: 90, dir: Math.PI * 0.82, len: 620 }],
  },
  {
    id: 'asteroid-belt', title: 'The asteroid belt', cat: 'deep', level: 2,
    about: 'Between Mars and Jupiter, millions of rocky asteroids travel around the Sun.',
    facts: ['The biggest one, Ceres, is a dwarf planet.', 'Some asteroids have their own tiny moons.'],
    tags: ['asteroid', 'rocks'],
    art: [
      sky([[-420, -440, 26], [420, -440, 24], [0, 460, 22]]),
      { k: 'asteroid', x: -200, y: -150, r: 170, seed: 3 },
      { k: 'asteroid', x: 230, y: 130, r: 140, seed: 8 },
      { k: 'asteroid', x: -260, y: 290, r: 80, seed: 12 },
      { k: 'asteroid', x: 290, y: -310, r: 70, seed: 15 },
      { k: 'asteroid', x: 40, y: 380, r: 50, seed: 18 },
    ],
  },
  {
    id: 'saptarishi', title: 'Saptarishi, the seven sages', cat: 'deep', level: 1,
    about: 'Saptarishi is seven bright stars shaped like a big ladle. It is also called the Big Dipper.',
    facts: ['Two of its stars point towards Dhruva Tara, the Pole Star.', 'Each star is named after a sage in Indian tradition.'],
    tags: ['constellation', 'big dipper', 'dhruva'],
    art: [
      { k: 'constellation', pts: [[-420, -40], [-240, -10], [-80, 40], [60, 90], [120, 280], [360, 290], [330, 80]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]], r: 44 },
      { k: 'constellation', pts: [[300, -380]], links: [], r: 60 },
      { k: 'tag', t: 'Dhruva Tara', x: 300, y: -270, size: 30 },
      { k: 'moon', x: -330, y: -330, r: 90, phase: 0.2 },
    ],
  },
  {
    id: 'orion', title: 'Orion the hunter', cat: 'deep', level: 1,
    about: 'Orion is one of the easiest star pictures to find, with three stars in a row for his belt.',
    facts: ['In India it is often called Mriga, the deer.', 'The red star Betelgeuse marks one of its shoulders.'],
    tags: ['constellation', 'orion', 'mriga'],
    art: [
      { k: 'constellation', pts: [[-170, -330], [190, -300], [-60, -20], [20, 0], [100, 20], [-210, 330], [230, 310]], links: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]], r: 46 },
      { k: 'stars', at: [[-420, -430, 24], [420, 420, 24], [-420, 430, 22], [420, -120, 20]], style: 'sparkle' },
    ],
  },
  {
    id: 'shooting-stars', title: 'Shooting stars', cat: 'deep', level: 1,
    about: 'Shooting stars are tiny space pebbles burning up high in our air. They are called meteors.',
    facts: ['Most meteors are smaller than a grain of rice.', 'On some nights you can see dozens every hour.'],
    tags: ['meteor', 'night'],
    art: [
      sky([[-420, -440, 26], [420, 60, 22], [-380, 120, 24]], 'sparkle'),
      { k: 'comet', x: 180, y: -280, r: 42, dir: Math.PI * 0.8, len: 300 },
      { k: 'comet', x: -120, y: -60, r: 34, dir: Math.PI * 0.8, len: 240 },
      { k: 'comet', x: 330, y: 140, r: 30, dir: Math.PI * 0.8, len: 200 },
      { k: 'ground', y: 360, style: 'hills' },
      { k: 'telescope', x: -250, y: 180, s: 0.7 },
    ],
  },
  {
    id: 'supernova', title: 'A star goes supernova', cat: 'deep', level: 1,
    about: 'When a giant star runs out of fuel it can explode in a supernova, one of the brightest things in space.',
    facts: ['A supernova can outshine a whole galaxy for a few weeks.', 'Many of the atoms in your body were made inside stars long ago.'],
    tags: ['supernova', 'star'],
    art: [sky([[-420, -430, 30], [420, -430, 26], [-430, 400, 24], [430, 400, 28]]), { k: 'sun', x: 0, y: 0, r: 150, rays: 18, corona: true }, { k: 'stars', at: [[-300, -250, 50], [300, 260, 44], [310, -270, 36], [-300, 280, 40]] }],
  },
  {
    id: 'stargazing', title: 'Stargazing with a telescope', cat: 'deep', level: 2,
    about: 'Telescopes collect lots of light, so we can see faint stars, planets and galaxies.',
    facts: ['India has big telescopes in Ladakh, where the sky is very dark.', 'You can see Jupiter’s moons with a small telescope.'],
    tags: ['telescope', 'ladakh'],
    art: [
      sky([[-420, -440, 26], [-200, -300, 22], [60, -470, 20]]),
      { k: 'planet', x: 320, y: -330, r: 90, ring: 1.9 },
      { k: 'ground', y: 320, style: 'hills' },
      { k: 'svg', d: 'M-540 320 L-380 140 L-240 250 L-100 110 L60 300 Z', x: 0, y: 0 },
      { k: 'telescope', x: 170, y: 120, s: 1.05 },
    ],
  },
];
