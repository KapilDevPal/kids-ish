import { useProgress } from './progressStore';
import { useUi, uid } from './uiStore';
import { useGallery } from './galleryStore';
import type { Creation, CreationKind, GameEvent, CraftRecipe, SaveMeta } from './types';
import { BADGES, rankFor } from '@/content/badges';
import { todaysChallenge, todayKey } from '@/content/challenges';
import { MISSIONS } from '@/content/missions';
import { EXPLORABLE_IDS } from '@/content/planets';

/**
 * The single entry point for everything a child does that "counts".
 * Features call track(); this module decides stars, badges, unlocks and celebrations,
 * so game rules stay in one place and features stay simple.
 */
const STARS: Partial<Record<GameEvent['type'], number>> = {
  launch: 2, land: 4, orbit: 4, save: 5, discover: 3,
};

export function track(e: GameEvent) {
  const ps = useProgress.getState();
  const ui = useUi.getState();
  const flags = { ...ps.flags };
  const bump = (k: string, n = 1) => (flags[k] = (flags[k] ?? 0) + n);
  let stars = STARS[e.type] ?? 0;
  let discovered = ps.discovered;
  let quizzed = ps.quizzed;

  switch (e.type) {
    case 'paint':
      bump('paint');
      break;
    case 'launch':
      bump('launch');
      break;
    case 'land':
      bump('land');
      break;
    case 'orbit':
      bump('orbit');
      break;
    case 'spin':
    case 'explode':
      bump(e.type);
      break;
    case 'save':
      bump('saves');
      bump(e.kind === 'drawing' ? 'saveDrawing' : e.kind === 'planet' ? 'savePlanet' : 'saveCraft');
      if (e.meta?.tricolour) bump('tricolour');
      if (e.kind === 'drawing' && e.meta?.page && e.meta.page !== 'none') bump('colourPage');
      break;
    case 'discover': {
      if (discovered.includes(e.id)) return; // already known: nothing new to celebrate
      discovered = [...discovered, e.id];
      flags.bodies = discovered.filter((d) => EXPLORABLE_IDS.includes(d)).length;
      flags.missions = discovered.filter((d) => MISSIONS.some((m) => m.id === d)).length;
      const m = MISSIONS.find((x) => x.id === e.id);
      if (m?.unlocks) {
        ui.celebrate({
          id: `unlock-${m.id}`, kind: 'unlock', title: `Unlocked: ${m.unlocks.label}`,
          subtitle: `Discovering ${m.name} opened something new for you.`,
          glyph: m.glyph, accent: m.accent,
          action: m.unlocks.model ? { label: 'Try it now', href: `#/hangar/${m.unlocks.model}` } : { label: 'Use it in Draw', href: '#/draw' },
        });
      }
      break;
    }
    case 'quiz':
      if (!e.correct || quizzed.includes(e.id)) {
        stars = 0;
        break;
      }
      quizzed = [...quizzed, e.id];
      bump('quizCorrect');
      stars = 5;
      break;
  }

  // Daily challenge
  const ch = todaysChallenge();
  const today = todayKey();
  let challengeDoneOn = ps.challengeDoneOn;
  if (challengeDoneOn[ch.id] !== today && ch.done(e)) {
    challengeDoneOn = { ...challengeDoneOn, [ch.id]: today };
    stars += 15;
    ui.celebrate({
      id: `challenge-${ch.id}-${today}`, kind: 'challenge', title: 'Challenge complete!',
      subtitle: ch.title, glyph: ch.glyph, accent: ch.accent, stars: 15,
    });
  }

  // Badges
  const badges = [...ps.badges];
  for (const b of BADGES) {
    if (!badges.includes(b.id) && b.test(flags)) {
      badges.push(b.id);
      stars += 10;
      ui.celebrate({ id: `badge-${b.id}`, kind: 'badge', title: b.name, subtitle: b.how, glyph: b.glyph, accent: b.accent, stars: 10 });
    }
  }

  const before = rankFor(ps.stars).rank;
  const total = ps.stars + stars;
  const after = rankFor(total).rank;
  if (after.name !== before.name) {
    ui.celebrate({
      id: `rank-${after.name}`, kind: 'rank', title: `You are now a ${after.name}!`,
      subtitle: 'Keep creating and exploring to climb higher.', glyph: 'star', accent: '#FFC93C',
    });
  }
  if (stars > 0 && e.type !== 'save') ui.toast(toastText(e), stars);

  useProgress.setState({ flags, stars: total, discovered, quizzed, badges, challengeDoneOn });
}

function toastText(e: GameEvent): string {
  switch (e.type) {
    case 'launch': return 'Liftoff!';
    case 'land': return 'Touchdown on the Moon!';
    case 'orbit': return 'Orbit achieved!';
    case 'discover': return 'New discovery!';
    case 'quiz': return 'Correct!';
    default: return 'Nice!';
  }
}

const FUN_WORDS = ['Starlight', 'Cosmo', 'Nova', 'Comet', 'Orbit', 'Nebula', 'Rocket', 'Galaxy', 'Aurora', 'Meteor', 'Chanda', 'Tara'];
const FUN_NOUNS: Record<CreationKind, string[]> = {
  craft: ['Explorer', 'Voyager', 'Express', 'Flyer', 'Cruiser', 'Pathfinder'],
  planet: ['World', 'Prime', 'Minor', 'Major', 'Planet', 'Sphere'],
  drawing: ['Dream', 'Scene', 'Sky', 'Adventure', 'Story', 'Picture'],
};

export function funTitle(kind: CreationKind): string {
  const a = FUN_WORDS[Math.floor(Math.random() * FUN_WORDS.length)];
  const b = FUN_NOUNS[kind][Math.floor(Math.random() * FUN_NOUNS[kind].length)];
  return `${a} ${b}`;
}

export async function saveCreation(input: {
  kind: CreationKind;
  image: string;
  recipe?: CraftRecipe;
  modelId?: string;
  meta?: SaveMeta;
}): Promise<Creation> {
  const counter = useProgress.getState().creationCounter + 1;
  useProgress.setState({ creationCounter: counter });
  const c: Creation = {
    id: uid('c'), kind: input.kind, title: funTitle(input.kind), createdAt: Date.now(), number: counter,
    image: input.image, recipe: input.recipe, modelId: input.modelId,
  };
  await useGallery.getState().add(c);
  track({ type: 'save', kind: input.kind, modelId: input.modelId, meta: input.meta });
  useUi.getState().toast(`Saved to your archive as “${c.title}”`, 5);
  return c;
}
