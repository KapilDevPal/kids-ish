import { useEffect, useMemo, useRef, useState } from 'react';
import './library.css';
import {
  CATEGORIES, COLOURING_PAGES, companyById, filterPages, getPage, searchPages,
  type CategoryId, type ColouringPage, type PageFilter,
} from '@/content/colouring';
import { MISSIONS } from '@/content/missions';
import { PLANETS, SUN, MOON_INFO } from '@/content/planets';
import { getModel } from '@/engine3d/registry';
import type { Orientation } from '@/drawing/types';
import { Icon } from '@/ui/Icon';
import { PageThumb } from './PageThumb';
import { useLibrary } from './libraryStore';

type Tab = 'all' | 'favs' | 'recent' | 'for' | CategoryId;

export const LEVELS = { 1: 'Easy', 2: 'Medium', 3: 'Tricky' } as const;

function filterLabel(f: PageFilter): string {
  switch (f.kind) {
    case 'cat': return CATEGORIES.find((c) => c.id === f.id)?.name ?? 'Pages';
    case 'mission': return MISSIONS.find((m) => m.id === f.id)?.name ?? 'This mission';
    case 'model': return getModel(f.id)?.name ?? 'This model';
    case 'company': return companyById(f.id)?.name ?? 'This company';
    case 'body': return f.id === 'sun' ? SUN.name : f.id === 'moon' ? MOON_INFO.name : PLANETS.find((p) => p.id === f.id)?.name ?? 'This world';
  }
}

/** Parse the tail of #/draw/library/... into a filter: a category id, or kind/id. */
export function parseFilter(a?: string, b?: string): PageFilter | undefined {
  if (!a) return undefined;
  if (CATEGORIES.some((c) => c.id === a)) return { kind: 'cat', id: a as CategoryId };
  if ((a === 'mission' || a === 'model' || a === 'body' || a === 'company') && b) return { kind: a, id: b };
  return undefined;
}

export function Library({ initial, orient, current, onPick, onClose }: {
  initial?: PageFilter;
  orient: Orientation;
  current: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>(initial ? (initial.kind === 'cat' ? initial.id : 'for') : 'all');
  const [q, setQ] = useState('');
  const [level, setLevel] = useState<0 | 1 | 2 | 3>(0);
  const favs = useLibrary((s) => s.favs);
  const recent = useLibrary((s) => s.recent);
  const toggleFav = useLibrary((s) => s.toggleFav);
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => { listRef.current?.scrollTo({ top: 0 }); }, [tab, level, q]);

  const byIds = (ids: string[]) => ids.map((id) => getPage(id)).filter((p): p is ColouringPage => !!p);
  const pages = useMemo(() => {
    let list: ColouringPage[];
    if (q.trim()) list = searchPages(q);
    else if (tab === 'all') list = COLOURING_PAGES;
    else if (tab === 'favs') list = byIds(favs);
    else if (tab === 'recent') list = byIds(recent);
    else if (tab === 'for') list = initial ? filterPages(initial) : [];
    else list = filterPages({ kind: 'cat', id: tab });
    return level ? list.filter((p) => p.level === level) : list;
  }, [q, tab, level, favs, recent, initial]);

  const cat = CATEGORIES.find((c) => c.id === tab);
  const thumbW = 150;
  const surprise = () => {
    const pool = pages.length ? pages : COLOURING_PAGES;
    const others = pool.filter((p) => p.id !== current);
    const pick = (others.length ? others : pool)[Math.floor(Math.random() * (others.length || pool.length))];
    if (pick) onPick(pick.id);
  };

  const chip = (id: Tab, label: React.ReactNode, count?: number) => (
    <button key={id} role="tab" className="chip lib__tab" aria-selected={!q && tab === id} onClick={() => { setQ(''); setTab(id); }}>
      {label}{count != null && <span className="lib__count">{count}</span>}
    </button>
  );

  return (
    <div className="lib" role="dialog" aria-modal="true" aria-labelledby="lib-title">
      <header className="lib__top">
        <button ref={closeRef} className="icon-btn icon-btn--round" aria-label="Close colouring pages" onClick={onClose}><Icon name="close" /></button>
        <h2 id="lib-title">Colouring pages</h2>
        <span className="spacer" />
        <button className="icon-btn lib__surprise" aria-label="Surprise me with a random page" onClick={surprise}>
          <Icon name="dice" /><span className="icon-btn__label">Surprise</span>
        </button>
      </header>

      <label className="lib__search">
        <Icon name="search" />
        <span className="sr-only">Search colouring pages</span>
        <input type="search" value={q} placeholder="Search: PSLV, Moon, Skyroot…" onChange={(e) => setQ(e.target.value)} enterKeyHint="search" />
        {q && <button className="lib__clear" aria-label="Clear search" onClick={() => setQ('')}><Icon name="close" size={18} /></button>}
      </label>

      <div className="scroll-x lib__tabs" role="tablist" aria-label="Page categories">
        {initial && initial.kind !== 'cat' && chip('for', <><Icon name="sparkle" size={18} /> {filterLabel(initial)}</>, filterPages(initial).length)}
        {chip('all', 'All', COLOURING_PAGES.length)}
        {favs.length > 0 && chip('favs', <><Icon name="heart" size={18} /> Favourites</>, favs.length)}
        {recent.length > 0 && chip('recent', 'Recent')}
        {CATEGORIES.map((c) => chip(c.id, <><span aria-hidden="true">{c.emoji}</span> {c.name}</>, filterPages({ kind: 'cat', id: c.id }).length))}
      </div>

      <div className="lib__levels" role="radiogroup" aria-label="How tricky">
        {([0, 1, 2, 3] as const).map((l) => (
          <button key={l} role="radio" aria-checked={level === l} className="chip chip--small" onClick={() => setLevel(l)}>
            {l === 0 ? 'Any' : <><Dots n={l} /> {LEVELS[l]}</>}
          </button>
        ))}
      </div>

      <div className="lib__body" ref={listRef}>
        {cat && !q && <p className="lib__blurb muted">{cat.blurb}</p>}
        {q && <p className="lib__blurb muted" role="status">{pages.length ? `${pages.length} page${pages.length === 1 ? '' : 's'} found` : ''}</p>}
        {pages.length === 0 ? (
          <div className="lib__empty">
            <p>{tab === 'favs' ? 'Tap the heart on a page to keep it here.' : 'No pages match. Try another word, or tap Surprise me!'}</p>
          </div>
        ) : (
          <ul className="lib__grid">
            {pages.map((p) => {
              const co = companyById(p.company);
              const fav = favs.includes(p.id);
              return (
                <li key={p.id} className="lib-card" data-current={p.id === current || undefined}>
                  <button className="lib-card__main" onClick={() => onPick(p.id)}>
                    <PageThumb id={p.id} orient={orient} w={thumbW} />
                    <span className="lib-card__title">{p.title}</span>
                    <span className="lib-card__meta">
                      <Dots n={p.level} /><span className="sr-only">{LEVELS[p.level]}</span>
                      {co && <span className="lib-card__co">{co.name}</span>}
                    </span>
                  </button>
                  {(p.model || p.body) && <span className="lib-card__badge" title="You can explore this in 3D"><Icon name="cube" size={14} /> 3D</span>}
                  <button className="lib-card__fav" aria-pressed={fav} aria-label={fav ? `Remove ${p.title} from favourites` : `Add ${p.title} to favourites`} onClick={() => toggleFav(p.id)}>
                    <Icon name="heart" size={20} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function Dots({ n }: { n: number }) {
  return (
    <span className="lvl-dots" aria-hidden="true">
      {[1, 2, 3].map((i) => <i key={i} className={i <= n ? 'on' : ''} />)}
    </span>
  );
}
