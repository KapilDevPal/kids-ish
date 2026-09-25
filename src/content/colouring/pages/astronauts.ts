import type { ColouringPage } from '../types';
import { sky } from './common';

const SPACE = sky([[-420, -440, 32], [420, -440, 28], [-440, -120, 24], [440, -100, 26], [-420, 330, 24], [420, 360, 28]]);

export const ASTRONAUT_PAGES: ColouringPage[] = [
  {
    id: 'gaganyatri-wave', title: 'A gaganyatri says namaste', cat: 'astronauts', level: 1,
    about: 'India’s astronauts are called gaganyatris, which means sky travellers.',
    facts: ['Gaganyatris train for years before they fly.', 'Their spacesuits keep them safe, warm and able to breathe.'],
    mission: 'gaganyaan', tags: ['gaganyatri', 'spacesuit'],
    art: [SPACE, { k: 'astronaut', x: 0, y: 20, s: 1.7, pose: 'wave' }],
  },
  {
    id: 'spacewalk-earth', title: 'Spacewalk above Earth', cat: 'astronauts', level: 2,
    about: 'On a spacewalk, astronauts float outside their spacecraft, safely clipped on with a tether.',
    facts: ['A spacewalk can last more than six hours.', 'Astronauts practise spacewalks underwater in giant pools.'],
    tags: ['spacewalk', 'tether'],
    art: [SPACE, { k: 'earth', x: 0, y: 1100, r: 740 }, { k: 'satellite', v: 'generic', x: -300, y: -260, s: 0.7 }, { k: 'astronaut', x: 170, y: -40, s: 1.05, pose: 'float', rot: 0.3, tether: [-300, -200] }],
  },
  {
    id: 'rakesh-sharma-yoga', title: 'Yoga in space', cat: 'astronauts', level: 2,
    about: 'In 1984 Rakesh Sharma became the first Indian in space. He even practised yoga while floating!',
    facts: ['He spent almost eight days in orbit.', 'Asked how India looked from space, he said “Saare Jahan Se Achha”.'],
    mission: 'rakesh-sharma', tags: ['rakesh sharma', 'yoga', 'history'],
    art: [SPACE, { k: 'earth', x: 340, y: -320, r: 110 }, { k: 'astronaut', x: -40, y: 60, s: 1.45, pose: 'yoga' }],
  },
  {
    id: 'shubhanshu-sprouts', title: 'Growing sprouts in orbit', cat: 'astronauts', level: 2,
    about: 'In 2025 Shubhanshu Shukla became the first Indian aboard the International Space Station, where he grew tiny sprouts.',
    facts: ['He did experiments on seeds such as moong and methi.', 'He is also training to fly on Gaganyaan.'],
    mission: 'shubhanshu', tags: ['shubhanshu shukla', 'iss', 'plants'],
    art: [SPACE, { k: 'astronaut', x: -140, y: 30, s: 1.25, pose: 'stand' }, { k: 'plant', x: 280, y: 110, s: 1.3 }],
  },
  {
    id: 'vyommitra', title: 'Vyommitra the robot', cat: 'astronauts', level: 1,
    about: 'Vyommitra is a humanoid robot that will fly on Gaganyaan’s test flights before the astronauts do.',
    facts: ['Vyom means space and mitra means friend.', 'She can talk and check the spacecraft’s controls.'],
    mission: 'gaganyaan', tags: ['vyommitra', 'robot'],
    art: [SPACE, { k: 'robot', x: 0, y: 30, s: 1.55 }],
  },
  {
    id: 'gaganyaan-crew', title: 'The Gaganyaan crew', cat: 'astronauts', level: 3,
    about: 'A Gaganyaan crew of up to three gaganyatris will orbit Earth in an Indian spacecraft.',
    facts: ['They train in India and around the world.', 'They learn to fly, swim, survive in forests and do science.'],
    mission: 'gaganyaan', tags: ['gaganyaan', 'crew', 'team'],
    art: [SPACE, { k: 'ground', y: 330, style: 'flat' }, { k: 'astronaut', x: -300, y: 120, s: 0.95, pose: 'stand' }, { k: 'astronaut', x: 300, y: 120, s: 0.95, pose: 'stand' }, { k: 'astronaut', x: 0, y: 90, s: 1.05, pose: 'wave' }],
  },
  {
    id: 'kalpana-chawla', title: 'Kalpana Chawla, space pioneer', cat: 'astronauts', level: 2,
    about: 'Kalpana Chawla grew up in Karnal, Haryana, and in 1997 became the first woman of Indian origin to go to space.',
    facts: ['She flew on NASA’s space shuttle.', 'She loved flying aeroplanes and studied aerospace engineering.'],
    tags: ['kalpana chawla', 'nasa', 'shuttle'],
    art: [SPACE, { k: 'shuttle', x: 300, y: -60, s: 0.9, rot: 0.5 }, { k: 'astronaut', x: -200, y: 60, s: 1.15, pose: 'stand' }],
  },
  {
    id: 'sunita-williams', title: 'Sunita Williams on a spacewalk', cat: 'astronauts', level: 2,
    about: 'Sunita Williams is a NASA astronaut with Indian roots. She has done many spacewalks outside the space station.',
    facts: ['She has spent more than a year of her life in space.', 'She once ran a marathon on a treadmill in orbit.'],
    tags: ['sunita williams', 'nasa', 'spacewalk'],
    art: [SPACE, { k: 'station', x: -180, y: -250, s: 0.55 }, { k: 'astronaut', x: 200, y: 160, s: 1.1, pose: 'float', rot: -0.35, tether: [-180, -170] }],
  },
  {
    id: 'astronaut-moon-hello', title: 'Hello from space!', cat: 'astronauts', level: 1,
    about: 'Astronauts wear helmets with golden visors that protect their eyes from bright sunlight.',
    facts: ['The visor is coated with a thin layer of real gold.', 'Space suits have their own air supply in the backpack.'],
    tags: ['helmet', 'visor'],
    art: [SPACE, { k: 'moon', x: 330, y: -320, r: 90, craters: 3 }, { k: 'astronaut', x: -40, y: 80, s: 1.6, pose: 'float', face: true, rot: -0.15 }],
  },
];
