export type CreationKind = 'craft' | 'planet' | 'drawing';

export type Finish = 'gloss' | 'metal' | 'matte' | 'glow';

export interface PartPaint {
  color: string;
  finish: Finish;
}

/** Everything needed to rebuild a 3D creation so it can be remixed later. */
export interface CraftRecipe {
  modelId: string;
  paint: Record<string, PartPaint>;
  options: Record<string, OptionValue>;
}

export type OptionValue = string | number | boolean;

export interface Creation {
  id: string;
  kind: CreationKind;
  title: string;
  createdAt: number;
  /** Chronological mission number shown in the archive. */
  number: number;
  image: string;
  recipe?: CraftRecipe;
  modelId?: string;
}

export type GameEvent =
  | { type: 'paint'; modelId: string; finish: Finish }
  | { type: 'launch'; modelId: string; boosters: number }
  | { type: 'land' }
  | { type: 'orbit' }
  | { type: 'spin' }
  | { type: 'save'; kind: CreationKind; modelId?: string; meta?: SaveMeta }
  | { type: 'discover'; id: string; group: 'mission' | 'body' }
  | { type: 'quiz'; id: string; correct: boolean }
  | { type: 'explode' };

export interface SaveMeta {
  tricolour?: boolean;
  glow?: boolean;
  rings?: boolean;
  moons?: number;
  stamps?: number;
  brushes?: string[];
  background?: string;
  page?: string;
  /** Colouring library category of the page, if the drawing started from one. */
  pageCategory?: string;
}

export interface Celebration {
  id: string;
  kind: 'badge' | 'unlock' | 'challenge' | 'rank';
  title: string;
  subtitle: string;
  glyph: string;
  accent: string;
  stars?: number;
  action?: { label: string; href: string };
}
