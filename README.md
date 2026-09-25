# Indian Space Hub

A mobile-first, touch-first space creativity platform for children, built around India's space programme.
Explore the Solar System and ISRO missions, paint and launch 3D spacecraft, invent planets, draw space scenes,
and keep everything in a personal Mission Archive.

## Run it

```bash
npm install
npm run dev            # local development
npm run build          # production build in dist/ (code-split: three.js loads only when a 3D screen opens)
npm run build:single   # one self-contained HTML file in dist-single/ (used for the hosted version)
npm run typecheck
```

## The loop

Explore → Create → Play → Learn → Save → Return. The colouring library (over 100 Indian space pages in nine categories)
adds its own loop: Colour → Explore in 3D → Learn. Discovering a mission in Explore unlocks new Hangar models,
drawing stamps or backgrounds. Creating and launching earns stars, badges and ranks. A fresh daily challenge
gives a reason to come back. There are no timers, no failure states and no penalties.

## Privacy

There are no accounts, ads, chat or uploads. Children choose a generated call sign rather than typing their name.
Progress is kept in localStorage and creations in IndexedDB, both on the device only. Settings → Start over wipes everything.

## Architecture

```
src/
  app/           App shell (lazy screens, onboarding gate, nav rules) and a tiny hash router
  content/       All kid-facing content as data: missions, planets, badges, challenges, unlocks, palette
  state/         Zustand stores. gameplay.ts is the single place game rules live (track(event))
  persistence/   IndexedDB archive, safe localStorage, image export and save to device
  engine3d/      Reusable R3F engine: Part (paintable mesh), camera rig, particles, quality tiers
    models/      One component per 3D model
    registry.ts  Model definitions: parts, options, action, camera
  drawing/       Framework-free 2D engine: command-list document, brushes, stamps, backgrounds,
                 flood fill, undo by checkpointed replay, draft autosave
    kit/         Line-art kit for colouring pages: a pen with front-to-back covering, parametric
                 rockets and satellites (as data), spacecraft, sky, props and labels
  content/colouring/  The colouring library as data: categories, companies and pages/*.ts
  features/      Screens: home, explore, hangar, draw, archive, onboarding
  ui/            Shared components: Icon, Glyph, Nav, Sheet, Confirm, Toasts, celebrations
```

Key decisions:

- **Game rules are centralised.** Features only call `track({ type: 'launch', ... })`. `state/gameplay.ts`
  turns events into stars, badges, challenge completions and celebrations.
- **Drawings are data, not pixels.** A drawing is a list of commands (stroke, stamp, fill, background, clear) replayed onto
  layered canvases (background, ink, line art, overlay). This gives cheap undo/redo, tiny drafts and deterministic replay.
  Checkpoints every 8 commands keep undo fast.
- **Performance on mid-range Android.** Quality tiers (`engine3d/quality.ts`) lower pixel ratio, particle counts and geometry
  detail on weaker devices. Adaptive DPR responds to frame drops. Heavy screens are lazy-loaded.
- **Colouring pages are data too.** A page is a list of kit elements (`{ k: 'rocket', v: 'pslv', x, y }`), so the
  library can grow to hundreds of pages without new drawing code. Thumbnails render lazily, a few per frame, and are
  cached as small PNGs. Kit elements drop part anchors whose ids match Hangar model parts, which powers
  Colour → Explore in 3D → Learn: the colours a child fills are read back at those anchors and loaded onto the 3D model.
- **Accessibility.** Tap targets are at least 52px. Radio groups have labels, and the viewer and stamps work by keyboard. Calm motion follows the
  device setting or an in-app override.

## Extending

**Add a 3D model:** create `engine3d/models/MyModel.tsx` using `<Part id="..." />` for each paintable piece, then add
an entry to `MODELS` in `engine3d/registry.ts` with its parts, options, camera and action. To gate it behind a mission,
set `unlocks: { model: 'my-model' }` on that mission in `content/missions.ts`.

**Add a stamp:** add a drawer to `STAMPS` in `drawing/stamps.ts` (100 x 100 box, centred on the origin). Unlockable
stamps just need a mission with `unlocks.stamp`, and base stamps are listed in `content/unlocks.ts`.

**Add a mission, badge or challenge:** each is a plain object in `content/`.

**Add a colouring page:** add an object to the right file in `content/colouring/pages/`. Give it an `id`, `title`,
`cat`, `level` (1 Easy, 2 Medium, 3 Tricky), a one-line `about` and a few `facts`, then describe the art with kit
elements (see `drawing/kit/types.ts`). Page space is centred, 1080 units across the short side; keep key art within
±480 so it fits both tall and wide canvases. Optional links: `mission` (a mission id), `model` (a Hangar model, with
`parts: true` on the matching element so colours carry over), `body` (a world in Explore) and `company` (for Indian
private-sector pages, see `companies.ts`). Check it with `npm run dev` and `/tools/page-preview/?id=your-page`,
which paints every fillable region so leaks stand out.

**Add a rocket or satellite design:** add a spec to `ROCKETS` in `drawing/kit/rockets.ts` (stages, nose, boosters,
fins, nozzles) or `SATS` in `drawing/kit/craft.ts`. Every page can then use it by name.

**Deep links:** `#/draw/page/:id` opens a page; `#/draw/library`, `#/draw/library/:category` and
`#/draw/library/(mission|model|body|company)/:id` open the library filtered; `#/explore/body/:id` flies to a world;
`#/hangar/:model/colours` opens a model with the colours from the page just coloured.
# kids-ish
