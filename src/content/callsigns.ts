/**
 * Call signs instead of names: children get a fun astronaut identity and we never collect personal information.
 */
const FIRST = ['Brave', 'Swift', 'Bright', 'Cosmic', 'Lucky', 'Clever', 'Happy', 'Mighty', 'Zippy', 'Sunny', 'Starry', 'Bold'];
const SECOND = ['Comet', 'Falcon', 'Garuda', 'Tiger', 'Nova', 'Rocket', 'Peacock', 'Orbit', 'Meteor', 'Lotus', 'Pulsar', 'Mango'];

export function makeCallSigns(n = 4): string[] {
  const out = new Set<string>();
  while (out.size < n) {
    const a = FIRST[Math.floor(Math.random() * FIRST.length)];
    const b = SECOND[Math.floor(Math.random() * SECOND.length)];
    out.add(`${a} ${b} ${Math.floor(Math.random() * 9) + 1}`);
  }
  return [...out];
}

export const PATCH_COLOURS = ['#FF9933', '#2FBF71', '#6FD3FF', '#FF6FB1', '#8A5CF6', '#FFC93C'];
