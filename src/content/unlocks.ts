import { MISSIONS } from './missions';

export const BASE_MODELS = ['pslv', 'planet'];
export const BASE_STAMPS = ['rocket', 'planet', 'star', 'moon', 'comet', 'alien', 'flag', 'earth', 'sunny', 'rover', 'galaxy', 'ufo', 'meteor'];
export const BASE_BACKGROUNDS = ['deep', 'nebula', 'paper'];

type Kind = 'model' | 'stamp' | 'background';

/** Which mission unlocks a given item (if any). */
export function unlockSource(kind: Kind, id: string) {
  return MISSIONS.find((m) => m.unlocks?.[kind] === id);
}

export function isUnlocked(kind: Kind, id: string, discovered: string[]): boolean {
  const base = kind === 'model' ? BASE_MODELS : kind === 'stamp' ? BASE_STAMPS : BASE_BACKGROUNDS;
  if (base.includes(id)) return true;
  const src = unlockSource(kind, id);
  return !src || discovered.includes(src.id);
}
