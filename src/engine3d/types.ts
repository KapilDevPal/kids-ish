import type { ComponentType, LazyExoticComponent } from 'react';
import type { Finish, OptionValue } from '@/state/types';
import type { GlyphName } from '@/ui/Glyph';

export interface PartDef {
  id: string;
  label: string;
  fact: string;
  color: string;
  finish?: Finish;
}

export type OptionDef =
  | { id: string; label: string; type: 'choice'; choices: { value: string | number; label: string; hint?: string }[]; default: string | number }
  | { id: string; label: string; type: 'toggle'; default: boolean }
  | { id: string; label: string; type: 'stepper'; min: number; max: number; default: number };

export type ActionKind = 'launch' | 'land' | 'orbit' | 'spin';

export interface ModelProps {
  options: Record<string, OptionValue>;
}

export interface ModelDefinition {
  id: string;
  name: string;
  tagline: string;
  family: 'rocket' | 'lander' | 'orbiter' | 'planet';
  glyph: GlyphName;
  accent: string;
  parts: PartDef[];
  options?: OptionDef[];
  action: { kind: ActionKind; label: string; duration: number; success: string };
  camera: { position: [number, number, number]; target: [number, number, number]; min: number; max: number };
  Component: LazyExoticComponent<ComponentType<ModelProps>>;
}
