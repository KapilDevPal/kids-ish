import { useMemo, useState } from 'react';
import './home.css';
import { useProgress } from '@/state/progressStore';
import { useGallery } from '@/state/galleryStore';
import { rankFor } from '@/content/badges';
import { todaysChallenge, todayKey } from '@/content/challenges';
import { MISSIONS } from '@/content/missions';
import { PLANETS } from '@/content/planets';
import { go } from '@/app/router';
import { Glyph, type GlyphName } from '@/ui/Glyph';
import { Icon } from '@/ui/Icon';
import { Patch } from '@/ui/Patch';
import { BrandMark } from '@/ui/Nav';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Settings } from './Settings';

const TILES: { href: string; title: string; sub: string; glyph: GlyphName; accent: string }[] = [
  { href: '#/explore', title: 'Explore', sub: 'Fly past planets and meet India’s missions', glyph: 'planet', accent: '#6FD3FF' },
  { href: '#/hangar/pslv', title: 'Hangar', sub: 'Paint, build and launch rockets', glyph: 'rocket', accent: '#FF9933' },
  { href: '#/draw', title: 'Draw', sub: 'Brushes, stamps and colouring pages', glyph: 'brush', accent: '#FF6FB1' },
  { href: '#/archive', title: 'Archive', sub: 'Your creations and badges', glyph: 'archive', accent: '#FFC93C' },
];

export default function HomeScreen() {
  const profile = useProgress((s) => s.profile);
  const stars = useProgress((s) => s.stars);
  const discovered = useProgress((s) => s.discovered);
  const doneOn = useProgress((s) => s.challengeDoneOn);
  const items = useGallery((s) => s.items);
  const [settings, setSettings] = useState(false);
  const { rank, next, progress } = rankFor(stars);
  const ch = todaysChallenge();
  const chDone = doneOn[ch.id] === todayKey();
  const nextUnlock = MISSIONS.find((m) => m.unlocks && !discovered.includes(m.id));
  const fact = useMemo(() => {
    const pool = [...MISSIONS.map((m) => m.wow), ...PLANETS.map((p) => p.wow)];
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  return (
    <div className="screen home">
      <div className="page">
        <header className="home__top">
          <div className="row home__brand"><BrandMark size={40} /><span>Indian Space Hub</span></div>
          <span className="spacer" />
          <span className="stars-pill" aria-label={`${stars} stars`}><Icon name="star" size={18} /> {stars}</span>
          <button className="icon-btn icon-btn--round" aria-label="Settings" onClick={() => setSettings(true)}><Icon name="settings" /></button>
        </header>

        <section className="home__hero">
          <div className="home__hello">
            {profile && <Patch colour={profile.patch} callSign={profile.callSign} size={64} />}
            <div>
              <p className="home__namaste">Namaste,</p>
              <h1>{profile?.callSign ?? 'Explorer'}</h1>
              <div className="home__rank">
                <strong>{rank.name}</strong>
                {next && (
                  <>
                    <div className="meter" role="progressbar" aria-label={`Progress to ${next.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
                      <i style={{ width: `${Math.max(4, progress * 100)}%` }} />
                    </div>
                    <span className="muted">{next.min - stars} ★ to {next.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <HeroRocket />
        </section>

        <section className={chDone ? 'home__challenge is-done' : 'home__challenge'} style={{ ['--acc' as string]: ch.accent }} aria-labelledby="ch-title">
          <div className="home__challenge-glyph"><Glyph name={ch.glyph} size={64} accent={ch.accent} /></div>
          <div className="home__challenge-text">
            <p className="home__kicker">{chDone ? 'Today’s challenge: done!' : 'Today’s challenge · +15 ★'}</p>
            <h2 id="ch-title">{ch.title}</h2>
            <p className="muted">{chDone ? 'Brilliant work. A new challenge lands tomorrow.' : ch.detail}</p>
          </div>
          {chDone ? <span className="home__tick" aria-hidden="true"><Icon name="check" size={32} /></span> : <a className="btn" href={ch.href}>{ch.cta}</a>}
        </section>

        <nav className="home__tiles" aria-label="Places to go">
          {TILES.map((t) => (
            <a key={t.href} href={t.href} className="home__tile" style={{ ['--acc' as string]: t.accent }}>
              <Glyph name={t.glyph} size={72} accent={t.accent} />
              <strong>{t.title}</strong>
              <span>{t.sub}</span>
            </a>
          ))}
        </nav>

        <div className="home__pair">
          {nextUnlock && (
            <a className="card home__unlock" href="#/explore/missions">
              <Glyph name={nextUnlock.glyph} size={56} accent={nextUnlock.accent} />
              <div>
                <p className="home__kicker"><Icon name="lock" size={14} /> Next unlock</p>
                <strong>{nextUnlock.unlocks!.label}</strong>
                <p className="muted">Discover {nextUnlock.name} ({nextUnlock.year}) in India’s missions.</p>
              </div>
            </a>
          )}
          <div className="card home__fact">
            <p className="home__kicker"><Icon name="sparkle" size={14} /> Space wow</p>
            <p>{fact}</p>
          </div>
        </div>

        <section className="home__recent" aria-labelledby="recent-h">
          <div className="row"><h2 id="recent-h">Your latest creations</h2><span className="spacer" />{items.length > 0 && <a className="chip" href="#/archive">See all</a>}</div>
          {items.length === 0 ? (
            <p className="muted" style={{ marginTop: 8 }}>Nothing here yet. Paint a rocket or draw a scene and it will appear here.</p>
          ) : (
            <div className="scroll-x home__strip">
              {items.slice(0, 8).map((c) => (
                <a key={c.id} className="home__thumb" href={`#/archive/${c.id}`} aria-label={`Open ${c.title}`}>
                  <img src={c.image} alt="" loading="lazy" />
                  <span>{c.title}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
      {settings && <Settings onClose={() => setSettings(false)} />}
    </div>
  );
}

/** A little PSLV on the pad. Tap it: countdown, flame, whoosh, and you're in the hangar. */
function HeroRocket() {
  const [phase, setPhase] = useState<'idle' | 'go'>('idle');
  const reduced = useReducedMotion();
  const launch = () => {
    if (reduced) return go('#/hangar/pslv');
    if (phase === 'go') return;
    setPhase('go');
    setTimeout(() => go('#/hangar/pslv'), 1500);
  };
  return (
    <button className={`hero-rocket ${phase === 'go' ? 'is-go' : ''}`} onClick={launch} aria-label="Launch a rocket and open the hangar">
      <svg viewBox="0 0 160 220" aria-hidden="true">
        <defs>
          <radialGradient id="hr-glow" cx="50%" cy="100%" r="60%">
            <stop offset="0" stopColor="#FF9933" stopOpacity=".6" />
            <stop offset="1" stopColor="#FF9933" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="80" cy="206" rx="70" ry="14" fill="url(#hr-glow)" />
        <rect x="18" y="196" width="124" height="10" rx="5" fill="#2a2f6b" />
        <g className="hero-rocket__body">
          <g className="hero-rocket__flame">
            <path d="M68 178c0 18 12 30 12 30s12-12 12-30z" fill="#FFC93C" />
            <path d="M74 178c0 10 6 18 6 18s6-8 6-18z" fill="#fff" />
          </g>
          <path d="M80 18c14 12 18 30 18 50v110H62V68c0-20 4-38 18-50Z" fill="#fff" stroke="#16193F" strokeWidth="4" strokeLinejoin="round" />
          <path d="M80 18c7 6 11.5 13.5 14 22H66c2.5-8.5 7-16 14-22Z" fill="#FF9933" stroke="#16193F" strokeWidth="4" strokeLinejoin="round" />
          <rect x="62" y="120" width="36" height="8" fill="#138808" />
          <circle cx="80" cy="76" r="9" fill="#6FD3FF" stroke="#16193F" strokeWidth="4" />
          {[44, 104].map((x) => (
            <path key={x} d={`M${x} 120h12v58H${x}z`} fill="#FF9933" stroke="#16193F" strokeWidth="4" strokeLinejoin="round" />
          ))}
          <text x="80" y="160" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1F3FA8" transform="rotate(-90 80 156)">ISRO</text>
        </g>
      </svg>
      <span className="hero-rocket__cta"><Icon name="play" size={16} /> Launch!</span>
    </button>
  );
}
