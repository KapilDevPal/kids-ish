import type { ColouringPage } from '../types';
import type { El } from '@/drawing/kit/types';
import { ROCKET_SKY, padScene, sky, smoke, sriharikota } from './common';

const earthBelow: El = { k: 'earth', x: 0, y: 1080, r: 720 };

export const PRIVATE_PAGES: ColouringPage[] = [
  {
    id: 'skyroot-vikram-s', title: 'Vikram-S on the launch pad', cat: 'private', level: 2, company: 'skyroot',
    about: 'In November 2022 Vikram-S became the first rocket built by an Indian private company to fly to space.',
    facts: ['Its mission was called Prarambh, which means the beginning.', 'Some of its small thrusters were 3D printed.'],
    tags: ['skyroot', 'vikram-s', 'prarambh'],
    art: [sky(ROCKET_SKY), ...sriharikota(), ...padScene(0, 180), { k: 'rocket', v: 'vikram-s', x: 0, y: 342, s: 1.4 }],
  },
  {
    id: 'skyroot-vikram-s-launch', title: 'Vikram-S blasts off', cat: 'private', level: 1, company: 'skyroot',
    about: 'Vikram-S flew up to space and splashed down in the sea, all in about five minutes.',
    facts: ['It flew higher than 80 kilometres.', 'The rocket is named after Dr Vikram Sarabhai.'],
    tags: ['skyroot', 'vikram-s', 'launch'],
    art: [sky(ROCKET_SKY), { k: 'rocket', v: 'vikram-s', x: 0, y: 120, s: 1.25, flame: 'big' }, ...smoke(430)],
  },
  {
    id: 'skyroot-vikram-1', title: 'Vikram-1, a rocket for orbit', cat: 'private', level: 2, company: 'skyroot',
    about: 'Vikram-1 is Skyroot’s bigger rocket, designed to carry small satellites all the way into orbit.',
    facts: ['Its body is made of light, strong carbon fibre.', 'Its solid-fuel engines are named Kalam, after Dr A P J Abdul Kalam.'],
    tags: ['skyroot', 'vikram-1'],
    art: [sky(ROCKET_SKY), ...sriharikota(), ...padScene(0, 200), { k: 'rocket', v: 'vikram-1', x: 0, y: 348, s: 1.1 }],
  },
  {
    id: 'agnikul-sorted', title: 'Agnibaan SOrTeD on its own launch pad', cat: 'private', level: 2, company: 'agnikul',
    about: 'In 2024 Agnikul flew Agnibaan SOrTeD from Dhanush, India’s first private launch pad, at Sriharikota.',
    facts: ['SOrTeD means Sub-Orbital Technological Demonstrator.', 'Its engine was 3D printed as a single piece.'],
    tags: ['agnikul', 'agnibaan', 'dhanush'],
    art: [sky(ROCKET_SKY), ...sriharikota(), ...padScene(0, 170), { k: 'rocket', v: 'agnibaan-sorted', x: 0, y: 344, s: 1.45 }],
  },
  {
    id: 'agnikul-agnibaan', title: 'Agnibaan rocket', cat: 'private', level: 2, company: 'agnikul',
    about: 'Agnibaan is a two-stage rocket for small satellites. Its first stage can use a cluster of engines.',
    facts: ['Agnibaan means arrow of fire.', 'It can be launched from a mobile launch pad.'],
    tags: ['agnikul', 'agnibaan'],
    art: [sky(ROCKET_SKY), { k: 'rocket', v: 'agnibaan', x: 0, y: 170, s: 1.2, flame: true }, ...smoke(440)],
  },
  {
    id: 'agnikul-agnilet', title: 'Agnilet, a 3D-printed engine', cat: 'private', level: 2, company: 'agnikul',
    about: 'Agnilet is a rocket engine made in one single piece by a 3D printer, with no joints to leak.',
    facts: ['A 3D printer builds things layer by layer.', 'Printing an engine can take days instead of months.'],
    tags: ['agnikul', 'engine', '3d printing'],
    art: [sky([[-400, -420, 36], [400, -420, 30], [-420, 200, 26], [430, 180, 28], [-300, 440, 22], [300, 440, 24]]), { k: 'engine', x: 0, y: -20, s: 1.35 }],
  },
  {
    id: 'pixxel-firefly', title: 'Pixxel satellite sees hidden colours', cat: 'private', level: 2, company: 'pixxel',
    about: 'Pixxel’s Firefly satellites use hyperspectral cameras that see hundreds of colours, many more than our eyes can.',
    facts: ['Those hidden colours show if crops are healthy or if water is dirty.', 'Pixxel launched its first three Firefly satellites in 2025.'],
    tags: ['pixxel', 'firefly', 'hyperspectral', 'rainbow'],
    art: [sky([[-420, -440, 30], [420, -440, 28], [-440, -160, 22], [440, -170, 22]]), earthBelow, { k: 'beam', x: 0, y: -120, dir: Math.PI / 2, n: 7, r: 520 }, { k: 'satellite', v: 'pixxel', x: 0, y: -250, s: 0.95 }],
  },
  {
    id: 'digantara-tracker', title: 'Digantara tracks space junk', cat: 'private', level: 2, company: 'digantara',
    about: 'Digantara’s space camera satellite watches other objects in orbit so spacecraft can steer clear of junk.',
    facts: ['Old rocket parts and broken satellites are called space debris.', 'Knowing where debris is keeps astronauts and satellites safe.'],
    tags: ['digantara', 'debris', 'space junk'],
    art: [
      sky([[-420, -450, 26], [420, -450, 26]]),
      earthBelow,
      { k: 'debris', at: [[-380, -300, 30], [-250, -420, 24], [330, -330, 28], [420, -100, 22], [-420, -60, 26], [240, -470, 20], [120, 180, 22], [-160, 200, 24]] },
      { k: 'satellite', v: 'scot', x: 0, y: -130, s: 1.05, rot: -0.2 },
    ],
  },
  {
    id: 'bellatrix-taxi', title: 'Bellatrix space taxi', cat: 'private', level: 2, company: 'bellatrix',
    about: 'Bellatrix builds thrusters and an orbital transfer vehicle: a space taxi that carries satellites to the orbit they need.',
    facts: ['Some of their thrusters push using electricity and a gas, not fire.', 'Tiny pushes, over a long time, can move a satellite a long way.'],
    tags: ['bellatrix', 'thruster', 'space taxi'],
    art: [
      sky([[-420, -440, 30], [400, -440, 26], [-440, 300, 22], [420, 380, 24]]),
      { k: 'cloud', x: -330, y: 60, w: 180, h: 90, n: 7 },
      { k: 'cloud', x: -450, y: 50, w: 120, h: 70, n: 6 },
      { k: 'satellite', v: 'otv', x: 60, y: 50, s: 1.2 },
      { k: 'satellite', v: 'cubesat1u', x: 330, y: -250, s: 0.55 },
    ],
  },
  {
    id: 'dhruva-cubesat', title: 'Dhruva Space small satellite', cat: 'private', level: 2, company: 'dhruva',
    about: 'Dhruva Space builds small satellites and the frames that hold them. Its Thybolt satellites flew on PSLV in 2022.',
    facts: ['Small satellites can be as tiny as a shoebox.', 'Many small satellites can work together as a team.'],
    tags: ['dhruva', 'cubesat', 'thybolt'],
    art: [sky([[-420, -450, 30], [-440, -180, 22], [420, -440, 28], [440, -180, 24]]), earthBelow, { k: 'satellite', v: 'cubesat', x: 0, y: -150, s: 1.25, rot: 0.2 }],
  },
  {
    id: 'galaxeye-drishti', title: 'GalaxEye sees through clouds', cat: 'private', level: 2, company: 'galaxeye',
    about: 'GalaxEye’s Drishti satellite combines radar and a camera, so it can see the ground through clouds, day or night.',
    facts: ['Radar sends out radio waves and listens for them to bounce back.', 'Seeing through clouds helps during floods and storms.'],
    tags: ['galaxeye', 'drishti', 'radar'],
    art: [
      sky([[-420, -450, 30], [420, -450, 28]]),
      earthBelow,
      { k: 'beam', x: 0, y: -100, dir: Math.PI / 2, n: 3, r: 480 },
      { k: 'cloud', x: -200, y: 250, w: 260, h: 110 },
      { k: 'cloud', x: 200, y: 230, w: 240, h: 100 },
      { k: 'satellite', v: 'drishti', x: 0, y: -300, s: 0.95 },
    ],
  },
  {
    id: 'azaadisat', title: 'AzaadiSAT, built by schoolgirls', cat: 'private', level: 1, company: 'spacekidz',
    about: 'Girls from government schools all over India helped build AzaadiSAT, a tiny satellite that flew on SSLV.',
    facts: ['About 750 students worked on it.', 'Its second version, AzaadiSAT-2, flew on SSLV in 2023.'],
    tags: ['azaadisat', 'students', 'cubesat'],
    art: [sky([[-400, -420, 40], [-420, -120, 28], [400, -430, 36], [420, -140, 26], [-380, 200, 26], [390, 230, 30]]), { k: 'satellite', v: 'cubesat1u', x: -60, y: 0, s: 1.9 }, { k: 'flag', x: 330, y: 180, s: 0.7 }],
  },
  {
    id: 'private-rockets', title: 'India’s private rockets', cat: 'private', level: 2,
    about: 'Indian start-ups are building their own rockets: Vikram by Skyroot Aerospace and Agnibaan by Agnikul Cosmos.',
    facts: ['IN-SPACe helps private companies use ISRO’s launch sites and labs.', 'More rockets means more ways to get satellites to space.'],
    caption: 'Vikram-S by Skyroot Aerospace · Agnibaan by Agnikul Cosmos', tags: ['skyroot', 'agnikul', 'vikram', 'agnibaan'],
    art: [
      sky([[-400, -440, 34], [0, -460, 24], [400, -440, 30], [0, -200, 26]]),
      { k: 'ground', y: 360, style: 'flat' },
      { k: 'rocket', v: 'vikram-s', x: -220, y: 330, s: 1.15 },
      { k: 'rocket', v: 'agnibaan', x: 220, y: 330, s: 1.02 },
      { k: 'tag', t: 'Vikram-S', x: -220, y: 430, size: 32 },
      { k: 'tag', t: 'Agnibaan', x: 220, y: 430, size: 32 },
    ],
  },
];
