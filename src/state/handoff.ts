import type { CraftRecipe } from './types';

/**
 * Colour → Explore in 3D: the Draw screen leaves the colours a child painted on a page here,
 * and the Hangar picks them up when it opens with #/hangar/:model/colours.
 * Kept in memory only: it is a hand-over between two screens, not saved data.
 */
let pending: CraftRecipe | null = null;

export function setHandoff(recipe: CraftRecipe) {
  pending = recipe;
}

export function peekHandoff(modelId: string): CraftRecipe | undefined {
  return pending?.modelId === modelId ? pending : undefined;
}
