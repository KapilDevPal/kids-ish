/**
 * The colouring library: every page as data, grouped into categories.
 * Add a page by adding an object to one of the files in ./pages. Nothing else needs to change.
 */
import type { CategoryId, ColouringPage } from './types';
import { CATEGORIES } from './categories';
import { companyById } from './companies';
import { ROCKET_PAGES } from './pages/rockets';
import { ISRO_PAGES } from './pages/isro';
import { PRIVATE_PAGES } from './pages/private';
import { MOON_PAGES } from './pages/moon';
import { PLANET_PAGES } from './pages/planets';
import { ASTRONAUT_PAGES } from './pages/astronauts';
import { DEEP_PAGES } from './pages/deep';
import { SIMPLE_PAGES } from './pages/simple';
import { LEARN_PAGES } from './pages/learn';

export type { ColouringPage, CategoryId } from './types';
export { CATEGORIES, categoryById } from './categories';
export { COMPANIES, companyById } from './companies';

/** The first four pages, kept with their original ids so older drafts still open. */
const CLASSIC_PAGES: ColouringPage[] = [
  { id: 'rocket', title: 'Rocket on the pad', cat: 'simple', level: 2, about: 'A rocket waits on the launch pad, ready for the countdown.' },
  { id: 'lander', title: 'Moon landing', cat: 'moon', level: 2, about: 'A lander has touched down and its little rover is rolling out to explore.', model: { id: 'vikram' }, mission: 'chandrayaan-3' },
  { id: 'astronaut', title: 'Spacewalk', cat: 'astronauts', level: 2, about: 'An astronaut floats outside, held safely by a tether.' },
  { id: 'solar', title: 'Solar System', cat: 'planets', level: 1, about: 'Planets travel around the Sun, each on its own path.' },
];

export const COLOURING_PAGES: ColouringPage[] = [
  ...ROCKET_PAGES,
  ...ISRO_PAGES,
  ...PRIVATE_PAGES,
  ...MOON_PAGES,
  ...PLANET_PAGES,
  ...ASTRONAUT_PAGES,
  ...DEEP_PAGES,
  ...SIMPLE_PAGES,
  ...LEARN_PAGES,
  ...CLASSIC_PAGES,
];

const byId = new Map(COLOURING_PAGES.map((p) => [p.id, p]));

export const getPage = (id: string | undefined) => (id ? byId.get(id) : undefined);

export function pagesIn(cat: CategoryId) {
  return COLOURING_PAGES.filter((p) => p.cat === cat);
}

export type PageFilter =
  | { kind: 'cat'; id: CategoryId }
  | { kind: 'mission' | 'model' | 'body' | 'company'; id: string };

export function filterPages(f: PageFilter): ColouringPage[] {
  switch (f.kind) {
    case 'cat': return pagesIn(f.id);
    case 'mission': return COLOURING_PAGES.filter((p) => p.mission === f.id);
    case 'model': return COLOURING_PAGES.filter((p) => p.model?.id === f.id);
    case 'body': return COLOURING_PAGES.filter((p) => p.body === f.id);
    case 'company': return COLOURING_PAGES.filter((p) => p.company === f.id);
  }
}

/** Forgiving search over titles, tags, companies and categories. */
export function searchPages(q: string): ColouringPage[] {
  const words = q.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  if (!words.length) return COLOURING_PAGES;
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  return COLOURING_PAGES.filter((p) => {
    const hay = norm([p.title, p.about, ...(p.tags ?? []), companyById(p.company)?.name ?? '', CATEGORIES.find((c) => c.id === p.cat)?.name ?? ''].join(' '));
    return words.every((w) => hay.includes(norm(w)));
  });
}

/** The caption printed on the page: its title, plus the company for private-sector pages. */
export function pageCaption(p: ColouringPage): string | undefined {
  if (p.caption === false || !p.art) return undefined;
  if (p.caption) return p.caption;
  const co = companyById(p.company);
  return co ? `${p.title} · ${co.name}` : p.title;
}

export function pageColours(p: ColouringPage): string[] {
  return p.colours ?? CATEGORIES.find((c) => c.id === p.cat)?.colours ?? [];
}
