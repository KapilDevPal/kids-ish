/**
 * A colouring page is a list of elements drawn by the kit.
 * Elements are plain data, so pages are cheap to write, easy to review and safe to store.
 * Positions are in page space (see pen.ts). `s` scales an element, `rot` turns it (radians).
 */
import type { RocketId, RocketSpec } from './rockets';
import type { SatId } from './craft';

interface Place { x: number; y: number; s?: number; rot?: number; flip?: boolean }

export type Star = [x: number, y: number, r: number];

export type El =
  // Vehicles
  | ({ k: 'rocket'; v: RocketId | RocketSpec; flame?: boolean | 'big'; parts?: boolean } & Place)
  | ({ k: 'shuttle'; flame?: boolean } & Place)
  | ({ k: 'satellite'; v: SatId; parts?: boolean } & Place)
  | ({ k: 'lander'; parts?: boolean; ramp?: boolean } & Place)
  | ({ k: 'rover'; parts?: boolean } & Place)
  | ({ k: 'orbiter'; parts?: boolean } & Place)
  | ({ k: 'capsule'; tower?: boolean; service?: boolean } & Place)
  | ({ k: 'parachutes'; n?: number } & Place)
  | ({ k: 'station'; modules?: number } & Place)
  | ({ k: 'astronaut'; pose?: 'float' | 'wave' | 'stand' | 'yoga'; tether?: [number, number]; face?: boolean } & Place)
  | ({ k: 'robot' } & Place)
  | ({ k: 'engine'; v?: 'agnilet' | 'vikas' } & Place)
  | ({ k: 'bicycle' } & Place)
  | ({ k: 'boat' } & Place)
  // Sky
  | { k: 'stars'; at: Star[]; style?: 'star' | 'sparkle' | 'mix' }
  | { k: 'dots'; at: Star[] }
  | { k: 'star'; x: number; y: number; r: number; n?: number; inner?: number }
  | { k: 'planet'; x: number; y: number; r: number; ring?: number; tilt?: number; bands?: number; spot?: boolean; craters?: number; face?: boolean; id?: string; seed?: number }
  | { k: 'moon'; x: number; y: number; r: number; craters?: number; phase?: number; face?: boolean; seed?: number; id?: string }
  | { k: 'sun'; x: number; y: number; r: number; rays?: number; face?: boolean; corona?: boolean }
  | { k: 'earth'; x: number; y: number; r: number; face?: boolean }
  | { k: 'galaxy'; x: number; y: number; r: number; arms?: number; tilt?: number }
  | { k: 'nebula'; x: number; y: number; w: number; h: number; seed?: number }
  | { k: 'comet'; x: number; y: number; r: number; dir?: number; len?: number }
  | { k: 'asteroid'; x: number; y: number; r: number; seed?: number }
  | { k: 'blackhole'; x: number; y: number; r: number }
  | { k: 'constellation'; pts: [number, number][]; links: [number, number][]; r?: number }
  | { k: 'orbit'; x: number; y: number; rx: number; ry: number; rot?: number }
  | { k: 'beam'; x: number; y: number; dir: number; n?: number; r?: number }
  | { k: 'debris'; at: Star[] }
  // Ground and props
  | { k: 'ground'; y: number; style?: 'flat' | 'hills' | 'moon' | 'mars' | 'sea' | 'grass'; seed?: number }
  | { k: 'pad'; x: number; y: number; w: number }
  | { k: 'tower'; x: number; top: number; base: number; w?: number; arms?: number[]; side?: 1 | -1 }
  | { k: 'cloud'; x: number; y: number; w: number; h: number; n?: number }
  | ({ k: 'palm' } & Place)
  | ({ k: 'flag'; pole?: boolean } & Place)
  | ({ k: 'dish' } & Place)
  | ({ k: 'telescope' } & Place)
  | ({ k: 'plant' } & Place)
  | ({ k: 'crater' } & Place & { r: number })
  | ({ k: 'face'; r: number } & Place)
  // Words
  | { k: 'tag'; t: string; x: number; y: number; to?: [number, number]; size?: number; align?: CanvasTextAlign }
  | { k: 'number'; n: number | string; x: number; y: number; r?: number }
  | { k: 'text'; t: string; x: number; y: number; size?: number; outline?: boolean; rot?: number }
  | { k: 'arrow'; from: [number, number]; to: [number, number] }
  // Anything else, as SVG path data in a local frame
  | ({ k: 'svg'; d: string } & Place);
