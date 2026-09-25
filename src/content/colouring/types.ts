import type { El } from '@/drawing/kit/types';
import type { OptionValue } from '@/state/types';

export type CategoryId = 'rockets' | 'isro' | 'private' | 'moon' | 'planets' | 'astronauts' | 'deep' | 'simple' | 'learn';

export interface ColouringPage {
  id: string;
  title: string;
  cat: CategoryId;
  /** 1 Easy (chunky lines, big shapes), 2 Medium, 3 Tricky (more detail). */
  level: 1 | 2 | 3;
  /** One sentence a child can read in a breath. Shown on the Learn card. */
  about: string;
  facts?: string[];
  /** Indian private space company that built it (see companies.ts). */
  company?: string;
  /** Links that power Colour → Explore in 3D → Learn. */
  mission?: string;
  model?: { id: string; options?: Record<string, OptionValue> };
  body?: string;
  tags?: string[];
  /** Colours that suit this page, offered first in the palette. */
  colours?: string[];
  /** The line art. Classic pages from the first release draw themselves instead. */
  art?: El[];
  /** Caption printed on the page. Defaults to the title (and the company). false hides it. */
  caption?: string | false;
}
