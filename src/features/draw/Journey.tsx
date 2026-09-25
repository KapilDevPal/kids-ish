import { useEffect, useRef } from 'react';
import { categoryById, companyById, getPage, type ColouringPage } from '@/content/colouring';
import { MISSIONS } from '@/content/missions';
import { PLANETS, SUN, MOON_INFO } from '@/content/planets';
import { isUnlocked, unlockSource } from '@/content/unlocks';
import { getModel } from '@/engine3d/registry';
import { getEngine } from '@/drawing/DrawingEngine';
import type { PartPaint } from '@/state/types';
import { setHandoff } from '@/state/handoff';
import { useProgress } from '@/state/progressStore';
import { useUi } from '@/state/uiStore';
import { go } from '@/app/router';
import { Icon } from '@/ui/Icon';
import { useEngineVersion } from './drawStore';
import { LEVELS } from './Library';

/**
 * Colour → Explore in 3D → Learn.
 * A page can link to a Hangar model (its colours travel with it), a world in Explore, and a mission story.
 */

const bodyName = (id: string) => (id === 'sun' ? SUN.name : id === 'moon' ? MOON_INFO.name : PLANETS.find((p) => p.id === id)?.name ?? id);

export function use3D(page: ColouringPage | undefined) {
  const discovered = useProgress((s) => s.discovered);
  const toast = useUi((s) => s.toast);
  if (!page || (!page.model && !page.body)) return null;
  const def = page.model ? getModel(page.model.id) : undefined;
  if (def) {
    const open = isUnlocked('model', def.id, discovered);
    return {
      label: def.family === 'planet' ? 'Make it in 3D' : 'See it in 3D',
      locked: !open,
      run: () => {
        if (!open) {
          const m = unlockSource('model', def.id);
          toast(m ? `Discover ${m.name} in Explore to unlock the 3D ${def.name}` : 'Keep exploring to unlock this');
          return;
        }
        // Read the colour the child painted inside each part of the page.
        const e = getEngine();
        const paint: Record<string, PartPaint> = {};
        for (const part of def.parts) {
          const at = e.pageAnchors[part.id];
          const color = at && e.sampleInk(at[0], at[1]);
          if (color) paint[part.id] = { color, finish: part.finish ?? 'gloss' };
        }
        setHandoff({ modelId: def.id, paint, options: { ...(page.model?.options ?? {}) } });
        toast(Object.keys(paint).length ? `Your colours are on the 3D ${def.name}!` : `Here is ${def.name} in 3D. Colour the page and it will match!`);
        go(`#/hangar/${def.id}/colours`);
      },
    };
  }
  return {
    label: `Fly to ${bodyName(page.body!)}`,
    locked: false,
    run: () => go(`#/explore/body/${page.body}`),
  };
}

/** The line under the picture when a page is open: which page, explore it in 3D, and learn about it. */
export function PageBar({ onLibrary, onLearn, hint }: { onLibrary: () => void; onLearn: () => void; hint: React.ReactNode }) {
  useEngineVersion();
  const page = getPage(getEngine().doc.page);
  const three = use3D(page);
  if (!page) {
    return (
      <div className="draw__context draw__pagebar">
        <button className="chip draw-pagechip" onClick={onLibrary}><Icon name="book" size={20} /> Colouring pages</button>
        <span className="draw-pagebar__hint">{hint}</span>
      </div>
    );
  }
  return (
    <div className="draw__context draw__pagebar">
      <button className="chip draw-pagechip" onClick={onLibrary} aria-label={`${page.title}. Choose another colouring page`}>
        <Icon name="book" size={20} /><span className="draw-pagechip__t">{page.title}</span>
      </button>
      {three && (
        <button className="btn btn--sky draw-3d" onClick={three.run} aria-label={three.locked ? `${three.label}, locked` : three.label}>
          <Icon name={three.locked ? 'lock' : 'cube'} size={20} /><span className="draw-3d__long">{three.label}</span><span className="draw-3d__short" aria-hidden="true">3D</span>
        </button>
      )}
      <button className="icon-btn draw-learn" onClick={onLearn} aria-label={`Learn about ${page.title}`}><Icon name="info" /></button>
    </div>
  );
}

export function LearnCard({ onClose, onLibrary }: { onClose: () => void; onLibrary: (f: { kind: 'mission' | 'company'; id: string }) => void }) {
  const page = getPage(getEngine().doc.page);
  const closeRef = useRef<HTMLButtonElement>(null);
  const three = use3D(page);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!page) return null;
  const cat = categoryById(page.cat);
  const co = companyById(page.company);
  const mission = MISSIONS.find((m) => m.id === page.mission);
  return (
    <div className="confirm learn" role="dialog" aria-modal="true" aria-labelledby="learn-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card learn__card" style={{ ['--acc' as string]: cat?.accent }}>
        <button ref={closeRef} className="icon-btn icon-btn--round learn__close" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
        <p className="learn__kicker">{cat && <><span aria-hidden="true">{cat.emoji}</span> {cat.name}</>} · {LEVELS[page.level]}</p>
        <h2 id="learn-title">{page.title}</h2>
        {co && (
          <p className="learn__company"><strong>{co.name}</strong>, {co.city}. {co.what}</p>
        )}
        <p className="learn__about">{page.about}</p>
        {page.facts && page.facts.length > 0 && (
          <ul className="learn__facts">{page.facts.map((f) => <li key={f}><Icon name="sparkle" size={18} /> {f}</li>)}</ul>
        )}
        {mission && (
          <div className="learn__mission">
            <p className="learn__kicker">Mission · {mission.year}</p>
            <strong>{mission.name}</strong>
            <p className="muted">{mission.tagline}</p>
          </div>
        )}
        <div className="learn__actions">
          {three && (
            <button className="btn btn--sky" onClick={() => { onClose(); three.run(); }}>
              <Icon name={three.locked ? 'lock' : 'cube'} /> {three.label}
            </button>
          )}
          {mission && <a className="btn btn--ghost" href="#/explore/missions"><Icon name="rocket" /> Mission story</a>}
          {mission && <button className="btn btn--ghost" onClick={() => onLibrary({ kind: 'mission', id: mission.id })}><Icon name="book" /> More pages</button>}
          {!mission && co && <button className="btn btn--ghost" onClick={() => onLibrary({ kind: 'company', id: co.id })}><Icon name="book" /> More from {co.name}</button>}
        </div>
      </div>
    </div>
  );
}
