import type { GlyphName } from '@/ui/Glyph';

export interface MissionQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface Mission {
  id: string;
  year: number;
  name: string;
  /** One line a child can read in a breath. */
  tagline: string;
  /** Two or three short sentences, revealed on discovery. */
  story: string;
  wow: string;
  glyph: GlyphName;
  accent: string;
  question: MissionQuestion;
  unlocks?: { model?: string; stamp?: string; background?: string; label: string };
}

export const MISSIONS: Mission[] = [
  {
    id: 'aryabhata',
    year: 1975,
    name: 'Aryabhata',
    tagline: "India's very first satellite",
    story:
      'Named after a great Indian mathematician and astronomer, Aryabhata was built by ISRO scientists and sent into orbit to study X‑rays and the Sun.',
    wow: 'It was so special that it appeared on Indian two‑rupee notes!',
    glyph: 'satellite',
    accent: '#6FD3FF',
    question: {
      q: 'Who was the satellite Aryabhata named after?',
      options: ['A mathematician and astronomer', 'A cricket player', 'A river'],
      answer: 0,
    },
    unlocks: { stamp: 'satellite', label: 'Satellite stamp' },
  },
  {
    id: 'rakesh-sharma',
    year: 1984,
    name: 'Rakesh Sharma',
    tagline: 'The first Indian in space',
    story:
      'Wing Commander Rakesh Sharma flew to a space station and spent almost eight days orbiting Earth, doing experiments and yoga in zero gravity.',
    wow: 'When asked how India looked from space, he said "Saare Jahan Se Achha" (better than the whole world).',
    glyph: 'astronaut',
    accent: '#FFC93C',
    question: {
      q: 'What did Rakesh Sharma practise in zero gravity?',
      options: ['Swimming', 'Yoga', 'Football'],
      answer: 1,
    },
    unlocks: { stamp: 'astronaut', label: 'Astronaut stamp' },
  },
  {
    id: 'pslv',
    year: 1993,
    name: 'PSLV',
    tagline: 'The workhorse rocket of India',
    story:
      'The Polar Satellite Launch Vehicle has four stages and can wear 0, 2, 4 or 6 strap‑on boosters, like a rocket that changes outfits for each job.',
    wow: 'In 2017 a single PSLV carried 104 satellites into space at once, a world record back then!',
    glyph: 'rocket',
    accent: '#FF9933',
    question: {
      q: 'How many satellites did PSLV launch in one go in 2017?',
      options: ['4', '14', '104'],
      answer: 2,
    },
    unlocks: { background: 'launchpad', label: 'Sriharikota launch pad background' },
  },
  {
    id: 'chandrayaan-1',
    year: 2008,
    name: 'Chandrayaan‑1',
    tagline: "India's first trip to the Moon",
    story:
      "Chandrayaan‑1 orbited the Moon and carried an instrument that helped find signs of water on the Moon's surface.",
    wow: 'Chandra means Moon and yaan means vehicle, so Chandrayaan is a Moon vehicle!',
    glyph: 'orbiter',
    accent: '#A7A9B4',
    question: {
      q: 'What does "Chandrayaan" mean?',
      options: ['Moon vehicle', 'Star ship', 'Sun boat'],
      answer: 0,
    },
    unlocks: { background: 'moon', label: 'Moon surface background' },
  },
  {
    id: 'mangalyaan',
    year: 2013,
    name: 'Mangalyaan',
    tagline: 'India reached Mars on the first try',
    story:
      'The Mars Orbiter Mission travelled for about 300 days to reach Mars in 2014. India became the first country to get to Mars orbit on its very first attempt.',
    wow: 'It cost less to make than some Hollywood space movies!',
    glyph: 'orbiter',
    accent: '#E4572E',
    question: {
      q: 'Which planet did Mangalyaan visit?',
      options: ['Jupiter', 'Mars', 'Venus'],
      answer: 1,
    },
    unlocks: { model: 'mangalyaan', background: 'mars', label: 'Mangalyaan and Mars background' },
  },
  {
    id: 'lvm3',
    year: 2017,
    name: 'LVM3',
    tagline: "India's most powerful rocket",
    story:
      'LVM3 has two giant solid boosters and a super‑cold cryogenic engine on top. It lifted Chandrayaan‑3 towards the Moon.',
    wow: 'Its fuel on the top stage is kept colder than minus 250 degrees Celsius!',
    glyph: 'rocket',
    accent: '#35D0BA',
    question: {
      q: 'How many big side boosters does LVM3 have?',
      options: ['Two', 'Six', 'None'],
      answer: 0,
    },
    unlocks: { model: 'lvm3', label: 'LVM3 rocket' },
  },
  {
    id: 'chandrayaan-3',
    year: 2023,
    name: 'Chandrayaan‑3',
    tagline: 'Landing near the Moon’s south pole',
    story:
      'On 23 August 2023 the Vikram lander touched down near the Moon’s south pole, and the little Pragyan rover rolled out to explore. India now celebrates this day as National Space Day.',
    wow: 'India was the first country to land near the Moon’s south pole.',
    glyph: 'lander',
    accent: '#FF6FB1',
    question: {
      q: 'What was the name of the rover that rolled out of Vikram?',
      options: ['Pragyan', 'Curiosity', 'Chandra'],
      answer: 0,
    },
    unlocks: { model: 'vikram', stamp: 'lander', label: 'Vikram lander and lander stamp' },
  },
  {
    id: 'aditya-l1',
    year: 2023,
    name: 'Aditya‑L1',
    tagline: 'A spacecraft that watches the Sun',
    story:
      'Aditya‑L1 travelled 1.5 million kilometres to a special balancing spot called L1, where it can stare at the Sun all day without Earth getting in the way.',
    wow: 'Aditya is one of the Sanskrit names for the Sun.',
    glyph: 'sun',
    accent: '#FFC93C',
    question: {
      q: 'What does Aditya‑L1 study?',
      options: ['The Moon', 'The Sun', 'The oceans'],
      answer: 1,
    },
    unlocks: { stamp: 'sunprobe', label: 'Sun probe stamp' },
  },
  {
    id: 'spadex',
    year: 2025,
    name: 'SpaDeX',
    tagline: 'Two satellites shook hands in space',
    story:
      'In January 2025, two small ISRO satellites named Chaser and Target found each other in orbit and docked together, very gently, while zooming around Earth.',
    wow: 'India became the fourth country ever to dock spacecraft in space.',
    glyph: 'satellite',
    accent: '#8A5CF6',
    question: {
      q: 'What were the two SpaDeX satellites called?',
      options: ['Tom and Jerry', 'Chaser and Target', 'Sun and Moon'],
      answer: 1,
    },

    unlocks: { stamp: 'spadex', label: 'SpaDeX docking stamp' },
  },
  {
    id: 'shubhanshu',
    year: 2025,
    name: 'Shubhanshu Shukla',
    tagline: 'First Indian aboard the International Space Station',
    story:
      'Group Captain Shubhanshu Shukla flew to the International Space Station in 2025 and grew tiny plants and did science experiments while floating.',
    wow: 'He is also one of the astronauts training for Gaganyaan, India’s own human spaceflight.',
    glyph: 'astronaut',
    accent: '#6FD3FF',
    question: {
      q: 'Where did Shubhanshu Shukla stay in space?',
      options: ['On the Moon', 'The International Space Station', 'On Mars'],
      answer: 1,
    },

    unlocks: { stamp: 'station', label: 'Space station stamp' },
  },
  {
    id: 'gaganyaan',
    year: 2026,
    name: 'Gaganyaan',
    tagline: 'Indian astronauts on an Indian rocket',
    story:
      'Gaganyaan is India’s human spaceflight programme. Its astronauts are called gaganyatris, which means sky travellers, and they will ride in a crew capsule on top of a human‑rated LVM3.',
    wow: 'Before people fly, a humanoid robot named Vyommitra is set to test the ride first!',
    glyph: 'capsule',
    accent: '#35D0BA',
    question: {
      q: 'What are Gaganyaan astronauts called?',
      options: ['Gaganyatris', 'Moonwalkers', 'Starfish'],
      answer: 0,
    },

    unlocks: { stamp: 'capsule', label: 'Gaganyaan capsule stamp' },
  },
];
