import { useEffect, useMemo, useRef, useState } from 'react';
import './archive.css';
import { useGallery } from '@/state/galleryStore';
import { useProgress } from '@/state/progressStore';
import { useUi } from '@/state/uiStore';
import type { Creation, CreationKind } from '@/state/types';
import { BADGES } from '@/content/badges';
import { MISSIONS } from '@/content/missions';
import { PLANETS, SUN, MOON_INFO, EXPLORABLE_IDS } from '@/content/planets';
import { MODELS } from '@/engine3d/registry';
import { STAMPS } from '@/drawing/stamps';
import { BACKGROUNDS } from '@/drawing/backgrounds';
import { isUnlocked, unlockSource } from '@/content/unlocks';
import { saveImageToDevice } from '@/persistence/exportImage';
import { go } from '@/app/router';
import { Glyph } from '@/ui/Glyph';
import { Icon } from '@/ui/Icon';
import { Confirm } from '@/ui/Confirm';

type Tab = 'creations' | 'badges' | 'collection';

export default function ArchiveScreen({ params }: { params: string[] }) {
  const tab: Tab = params[0] === 'badges' || params[0] === 'collection' ? params[0] : 'creations';
  const openId = tab === 'creations' ? params[0] : undefined;
  const items = useGallery((s) => s.items);
  const badges = useProgress((s) => s.badges);
  return (
    <div className="screen archive">
      <div className="page">
        <header className="archive__head">
          <p className="archive__kicker">Mission Archive</p>
          <h1>Your space museum</h1>
          <div className="archive__tabs" role="tablist" aria-label="Archive sections">
            <a role="tab" className="chip" href="#/archive" aria-selected={tab === 'creations'}>Creations <b>{items.length}</b></a>
            <a role="tab" className="chip" href="#/archive/badges" aria-selected={tab === 'badges'}>Badges <b>{badges.length}/{BADGES.length}</b></a>
            <a role="tab" className="chip" href="#/archive/collection" aria-selected={tab === 'collection'}>Collection</a>
          </div>
        </header>
        {tab === 'creations' && <Creations />}
        {tab === 'badges' && <Badges />}
        {tab === 'collection' && <Collection />}
      </div>
      {openId && <Viewer id={openId} />}
    </div>
  );
}

const FILTERS: { id: 'all' | CreationKind; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'craft', label: 'Spacecraft' },
  { id: 'planet', label: 'Planets' },
  { id: 'drawing', label: 'Drawings' },
];

const dateFmt = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
const missionNo = (n: number) => `Mission #${String(n).padStart(3, '0')}`;

function Creations() {
  const items = useGallery((s) => s.items);
  const ready = useGallery((s) => s.ready);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const shown = useMemo(() => (filter === 'all' ? items : items.filter((c) => c.kind === filter)), [items, filter]);
  if (!ready) return <div className="archive__grid" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="archive__card is-skeleton" />)}</div>;
  if (items.length === 0) {
    return (
      <div className="card archive__empty">
        <Glyph name="archive" size={96} accent="#FFC93C" />
        <h2>Your archive is waiting</h2>
        <p className="muted">Everything you save becomes a numbered mission here, like exhibits in a space museum.</p>
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="btn" href="#/hangar/pslv"><Icon name="rocket" /> Paint a rocket</a>
          <a className="btn btn--sky" href="#/draw"><Icon name="brush" /> Draw a scene</a>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="scroll-x archive__filters" role="radiogroup" aria-label="Filter">
        {FILTERS.map((f) => (
          <button key={f.id} role="radio" aria-checked={filter === f.id} aria-pressed={filter === f.id} className="chip" onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="muted">Nothing in this shelf yet.</p>
      ) : (
        <ul className="archive__grid">
          {shown.map((c, i) => (
            <li key={c.id} style={{ ['--tilt' as string]: `${((i * 37) % 5) - 2}deg` }}>
              <a className="archive__card" href={`#/archive/${c.id}`} aria-label={`${c.title}, ${missionNo(c.number)}`}>
                <span className="archive__frame"><img src={c.image} alt="" loading="lazy" /></span>
                <span className="archive__label">
                  <span className="archive__no">{missionNo(c.number)}</span>
                  <strong>{c.title}</strong>
                  <span className="muted">{dateFmt.format(c.createdAt)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Viewer({ id }: { id: string }) {
  const items = useGallery((s) => s.items);
  const ready = useGallery((s) => s.ready);
  const rename = useGallery((s) => s.rename);
  const remove = useGallery((s) => s.remove);
  const toast = useUi((s) => s.toast);
  const idx = items.findIndex((c) => c.id === id);
  const c: Creation | undefined = items[idx];
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [confirm, setConfirm] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (ready && !c) go('#/archive'); }, [ready, c]);
  useEffect(() => { closeRef.current?.focus(); setEditing(false); }, [id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing || confirm) return;
      if (e.key === 'Escape') go('#/archive');
      if (e.key === 'ArrowRight' && items[idx + 1]) go(`#/archive/${items[idx + 1].id}`);
      if (e.key === 'ArrowLeft' && items[idx - 1]) go(`#/archive/${items[idx - 1].id}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, idx, editing, confirm]);

  if (!c) return null;
  const remixHref = c.kind === 'drawing' ? `#/draw/remix/${c.id}` : c.recipe ? `#/hangar/${c.recipe.modelId}/remix/${c.id}` : null;
  const commitTitle = () => {
    const t = title.trim().slice(0, 40);
    if (t && t !== c.title) void rename(c.id, t);
    setEditing(false);
  };
  const prev = items[idx - 1], next = items[idx + 1];

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
      <div className="viewer__top">
        <button ref={closeRef} className="icon-btn icon-btn--round" aria-label="Close" onClick={() => go('#/archive')}><Icon name="close" /></button>
        <span className="archive__no">{missionNo(c.number)}</span>
      </div>
      <div className="viewer__stage">
        {prev && <a className="icon-btn icon-btn--round viewer__nav viewer__nav--prev" href={`#/archive/${prev.id}`} aria-label="Newer creation"><Icon name="back" /></a>}
        <img src={c.image} alt={c.title} />
        {next && <a className="icon-btn icon-btn--round viewer__nav viewer__nav--next" href={`#/archive/${next.id}`} aria-label="Older creation"><Icon name="back" style={{ transform: 'scaleX(-1)' }} /></a>}
      </div>
      <div className="viewer__info">
        {editing ? (
          <form className="row viewer__rename" onSubmit={(e) => { e.preventDefault(); commitTitle(); }}>
            <label className="sr-only" htmlFor="rename">Name</label>
            <input id="rename" autoFocus maxLength={40} value={title} onChange={(e) => setTitle(e.target.value)} onBlur={commitTitle} />
            <button className="icon-btn" aria-label="Done"><Icon name="check" /></button>
          </form>
        ) : (
          <button className="viewer__title" onClick={() => { setTitle(c.title); setEditing(true); }}>
            <h2 id="viewer-title">{c.title}</h2><Icon name="pencil" size={20} /><span className="sr-only">Rename</span>
          </button>
        )}
        <p className="muted">{dateFmt.format(c.createdAt)}</p>
        <div className="viewer__actions">
          {remixHref && <a className="btn" href={remixHref}><Icon name="sparkle" /> Remix</a>}
          <button className="btn btn--sky" onClick={async () => {
            const r = await saveImageToDevice(c.image, c.title);
            if (r === 'saved') toast('Saved to your device');
            else if (r === 'failed') toast('Could not save this time');
          }}><Icon name="share" /> Save to device</button>
          <button className="btn btn--ghost" onClick={() => setConfirm(true)}><Icon name="trash" /> Delete</button>
        </div>
      </div>
      {confirm && (
        <Confirm danger title="Delete this creation?" body={`“${c.title}” will leave your archive for good.`} confirmLabel="Delete"
          onCancel={() => setConfirm(false)}
          onConfirm={async () => { setConfirm(false); await remove(c.id); go('#/archive'); }} />
      )}
    </div>
  );
}

function Badges() {
  const earned = useProgress((s) => s.badges);
  return (
    <ul className="badges">
      {BADGES.map((b) => {
        const got = earned.includes(b.id);
        return (
          <li key={b.id} className={got ? 'badge is-earned' : 'badge'} style={{ ['--acc' as string]: b.accent }}>
            <span className="badge__patch"><Glyph name={b.glyph} size={60} accent={got ? b.accent : '#5a5f93'} />{!got && <span className="badge__lock"><Icon name="lock" size={16} /></span>}</span>
            <strong>{b.name}</strong>
            <span className="muted">{b.how}</span>
            <span className="sr-only">{got ? 'Earned' : 'Not yet earned'}</span>
          </li>
        );
      })}
    </ul>
  );
}

function Collection() {
  const discovered = useProgress((s) => s.discovered);
  const bodies = [
    { id: 'sun', name: SUN.name.replace('The ', ''), colour: '#FFC93C' },
    ...PLANETS.map((p) => ({ id: p.id, name: p.name, colour: p.colors[0] })),
    { id: 'moon', name: MOON_INFO.name.replace('The ', ''), colour: '#A7A9B4' },
  ];
  const seenBodies = discovered.filter((d) => EXPLORABLE_IDS.includes(d)).length;
  const seenMissions = MISSIONS.filter((m) => discovered.includes(m.id));
  const models = MODELS.filter((m) => isUnlocked('model', m.id, discovered));
  const stamps = STAMPS.filter((s) => isUnlocked('stamp', s.id, discovered));
  const bgs = BACKGROUNDS.filter((b) => isUnlocked('background', b.id, discovered));
  return (
    <div className="collection">
      <section className="card">
        <Header title="Worlds visited" n={seenBodies} of={EXPLORABLE_IDS.length} href="#/explore" />
        <ul className="collection__worlds">
          {bodies.map((b) => {
            const seen = discovered.includes(b.id);
            return (
              <li key={b.id} className={seen ? 'is-seen' : ''}>
                <i style={{ background: seen ? b.colour : undefined }} />
                <span>{seen ? b.name : '???'}</span>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="card">
        <Header title="India’s missions" n={seenMissions.length} of={MISSIONS.length} href="#/explore/missions" />
        <ul className="collection__missions">
          {MISSIONS.map((m) => {
            const seen = discovered.includes(m.id);
            return (
              <li key={m.id} className={seen ? 'is-seen' : ''} title={seen ? m.name : 'Not discovered yet'}>
                <Glyph name={m.glyph} size={40} accent={seen ? m.accent : '#3a3f78'} />
                <span>{seen ? m.name : m.year}</span>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="card">
        <Header title="Hangar models" n={models.length} of={MODELS.length} href="#/hangar" />
        <Unlockables items={MODELS.map((m) => ({ id: m.id, name: m.name, open: models.includes(m), glyph: m.glyph, accent: m.accent, src: unlockSource('model', m.id)?.name }))} />
      </section>
      <section className="card">
        <Header title="Drawing stamps and backgrounds" n={stamps.length + bgs.length} of={STAMPS.length + BACKGROUNDS.length} href="#/draw" />
        <Unlockables items={[
          ...STAMPS.map((s) => ({ id: `s-${s.id}`, name: s.name, open: stamps.includes(s), glyph: 'star', accent: '#FF6FB1', src: unlockSource('stamp', s.id)?.name })),
          ...BACKGROUNDS.map((b) => ({ id: `b-${b.id}`, name: b.name, open: bgs.includes(b), glyph: 'planet', accent: '#6FD3FF', src: unlockSource('background', b.id)?.name })),
        ]} />
      </section>
    </div>
  );
}

function Header({ title, n, of, href }: { title: string; n: number; of: number; href: string }) {
  return (
    <div className="collection__head">
      <h3>{title}</h3>
      <span className="spacer" />
      <a className="chip" href={href}>{n} / {of}</a>
      <div className="meter" aria-hidden="true"><i style={{ width: `${(n / of) * 100}%` }} /></div>
    </div>
  );
}

function Unlockables({ items }: { items: { id: string; name: string; open: boolean; glyph: string; accent: string; src?: string }[] }) {
  return (
    <ul className="collection__unlocks">
      {items.map((it) => (
        <li key={it.id} className={it.open ? 'is-open' : ''}>
          <span className="collection__icon">{it.open ? <Glyph name={it.glyph} size={32} accent={it.accent} /> : <Icon name="lock" size={20} />}</span>
          <span>
            <strong>{it.name}</strong>
            {!it.open && it.src && <span className="muted">Discover {it.src}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
