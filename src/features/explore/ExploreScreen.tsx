import { useCallback, useEffect, useRef, useState } from 'react';
import './explore.css';
import { SolarSystemScene } from './SolarSystemScene';
import { MissionLog } from './MissionLog';
import { PLANETS, SUN, MOON_INFO, EXPLORABLE_IDS } from '@/content/planets';
import { useProgress } from '@/state/progressStore';
import { track } from '@/state/gameplay';
import { Icon } from '@/ui/Icon';
import { go } from '@/app/router';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsWide } from '@/hooks/useMediaQuery';

type Tab = 'space' | 'missions';

export default function ExploreScreen({ params }: { params: string[] }) {
  const tab: Tab = params[0] === 'missions' ? 'missions' : 'space';
  return (
    <div className="explore">
      <div className="explore__tabs" role="tablist" aria-label="Explore">
        <button role="tab" className="chip" aria-selected={tab === 'space'} onClick={() => go('#/explore')}>
          <Icon name="explore" size={20} /> Solar System
        </button>
        <button role="tab" className="chip" aria-selected={tab === 'missions'} onClick={() => go('#/explore/missions')}>
          <Icon name="rocket" size={20} /> India’s missions
        </button>
      </div>
      <div className="explore__body">{tab === 'space' ? <SolarSystem initial={params[0] === 'body' ? params[1] : undefined} /> : <MissionLog />}</div>
    </div>
  );
}

function infoFor(id: string) {
  if (id === 'sun') return { name: SUN.name, fact: SUN.fact, wow: SUN.wow, india: SUN.india };
  if (id === 'moon') return { name: MOON_INFO.name, fact: MOON_INFO.fact, wow: MOON_INFO.wow, india: MOON_INFO.india };
  const p = PLANETS.find((x) => x.id === id)!;
  return { name: p.name, fact: p.fact, wow: p.wow, india: p.india };
}

function SolarSystem({ initial }: { initial?: string }) {
  // #/explore/body/:id flies straight to a world (from a colouring page, for example).
  const [focus, setFocus] = useState<string | null>(() => (initial && EXPLORABLE_IDS.includes(initial) ? initial : null));
  const [resetKey, setResetKey] = useState(0);
  const discovered = useProgress((s) => s.discovered);
  const reduced = useReducedMotion();
  const onFocus = useCallback((id: string) => {
    setFocus(id);
    track({ type: 'discover', id, group: 'body' });
  }, []);
  useEffect(() => {
    if (initial && EXPLORABLE_IDS.includes(initial)) onFocus(initial);
  }, [initial, onFocus]);
  const seen = EXPLORABLE_IDS.filter((id) => discovered.includes(id)).length;
  const info = focus ? infoFor(focus) : null;
  // On phones and tablets the info card sits over the bottom of the 3D view; tell the camera how much it covers.
  const wide = useIsWide();
  const cardRef = useRef<HTMLElement>(null);
  const [cardH, setCardH] = useState(0);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) { setCardH(0); return; }
    const measure = () => setCardH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [info?.name]);
  const inset = info && !wide ? cardH + 24 : 0;
  return (
    <>
      <SolarSystemScene focusId={focus} onFocus={onFocus} paused={false} resetKey={resetKey} reducedMotion={reduced} bottomInset={inset} />
      <div className="explore__meter">
        <div className="progress-dots" aria-label={`${seen} of ${EXPLORABLE_IDS.length} worlds visited`} role="img">
          {EXPLORABLE_IDS.map((id) => (
            <i key={id} className={discovered.includes(id) ? 'on' : ''} />
          ))}
        </div>
      </div>
      {!info && <div className="explore__hint">Tap a planet to fly there</div>}
      {info && (
        <section className="world-card" aria-live="polite" ref={cardRef}>
          <button className="icon-btn icon-btn--round world-card__close" aria-label="Back to the whole Solar System" onClick={() => { setFocus(null); setResetKey((k) => k + 1); }}>
            <Icon name="close" />
          </button>
          <h2>{info.name}</h2>
          <p>{info.fact}</p>
          <p className="wow">{info.wow}</p>
          {info.india && (
            <div className="world-card__india">
              <span aria-hidden="true" style={{ display: 'inline-flex', flexDirection: 'column', width: 20, height: 20, borderRadius: 5, overflow: 'hidden', flex: '0 0 auto' }}>
                <i style={{ flex: 1, background: '#FF9933' }} />
                <i style={{ flex: 1, background: '#fff' }} />
                <i style={{ flex: 1, background: '#138808' }} />
              </span>
              {info.india}
            </div>
          )}
          <div className="row" style={{ marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn btn--sky" onClick={() => go('#/hangar/planet')}>
              <Icon name="brush" /> Invent a world
            </button>
            <a className="btn btn--ghost" href={`#/draw/library/body/${focus}`}>
              <Icon name="book" /> Colour it
            </a>
          </div>
        </section>
      )}
    </>
  );
}
