export interface PlanetInfo {
  id: string;
  name: string;
  /** Base colours used to paint a procedural texture. */
  colors: string[];
  bands: boolean;
  radius: number;
  orbit: number;
  /** Relative orbital speed for the playful (not to scale) orrery. */
  speed: number;
  rings?: string;
  fact: string;
  wow: string;
  india?: string;
}

export const SUN = {
  id: 'sun',
  name: 'The Sun',
  fact: 'The Sun is a star. It is so big that about 1.3 million Earths could fit inside it.',
  wow: 'Sunlight takes about 8 minutes to reach you.',
  india: 'Aditya‑L1 watches the Sun for India.',
};

export const PLANETS: PlanetInfo[] = [
  { id: 'mercury', name: 'Mercury', colors: ['#9C8F86', '#6F655E'], bands: false, radius: 0.28, orbit: 3.2, speed: 1.6,
    fact: 'Mercury is the smallest planet and the closest to the Sun.', wow: 'A year on Mercury is only 88 Earth days.' },
  { id: 'venus', name: 'Venus', colors: ['#E8C07A', '#C9954A'], bands: true, radius: 0.45, orbit: 4.4, speed: 1.2,
    fact: 'Venus is the hottest planet, even hotter than Mercury.', wow: 'On Venus the Sun rises in the west!' },
  { id: 'earth', name: 'Earth', colors: ['#2B6FD6', '#2FA35A'], bands: false, radius: 0.5, orbit: 5.8, speed: 1,
    fact: 'Earth is the only planet we know of with life.', wow: 'About 70% of Earth is covered by water.', india: 'Home of ISRO and hundreds of Indian satellites.' },
  { id: 'mars', name: 'Mars', colors: ['#D2552E', '#8E3217'], bands: false, radius: 0.36, orbit: 7.2, speed: 0.8,
    fact: 'Mars looks red because its soil is full of rusty iron.', wow: 'Mars has the tallest volcano in the Solar System, Olympus Mons.', india: 'Mangalyaan orbited Mars on its first try.' },
  { id: 'jupiter', name: 'Jupiter', colors: ['#D9B38C', '#A8764E', '#F1E1C6'], bands: true, radius: 1.05, orbit: 9.4, speed: 0.45,
    fact: 'Jupiter is the biggest planet. All the other planets could fit inside it.', wow: 'Its Great Red Spot is a storm bigger than Earth.' },
  { id: 'saturn', name: 'Saturn', colors: ['#E8D3A2', '#C7A865'], bands: true, radius: 0.9, orbit: 11.8, speed: 0.34, rings: '#DCC89A',
    fact: 'Saturn’s rings are made of ice and rock, some as small as sand.', wow: 'Saturn is so light it could float in a giant bathtub.' },
  { id: 'uranus', name: 'Uranus', colors: ['#9FE3E8', '#7ACBD3'], bands: true, radius: 0.65, orbit: 13.8, speed: 0.24,
    fact: 'Uranus spins on its side, like a rolling ball.', wow: 'One season on Uranus lasts about 21 years.' },
  { id: 'neptune', name: 'Neptune', colors: ['#3F63E0', '#2A3FA8'], bands: true, radius: 0.62, orbit: 15.6, speed: 0.18,
    fact: 'Neptune is the windiest planet, with super fast storms.', wow: 'It takes Neptune 165 Earth years to go around the Sun once.' },
];

export const MOON_INFO = {
  id: 'moon',
  name: 'The Moon',
  fact: 'The Moon is Earth’s closest neighbour in space.',
  wow: 'The Moon always shows us the same face.',
  india: 'Chandrayaan‑3 landed near its south pole in 2023.',
};

/** Every explorable body, used for discovery progress. */
export const EXPLORABLE_IDS = ['sun', ...PLANETS.map((p) => p.id), 'moon'];
