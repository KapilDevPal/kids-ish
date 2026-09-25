import { useEffect, useRef } from 'react';
import { useUi } from '@/state/uiStore';
import { Glyph } from './Glyph';
import { Icon } from './Icon';
import { go } from '@/app/router';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const BURST_COLOURS = ['#FF9933', '#FFFFFF', '#2FBF71', '#FFC93C', '#6FD3FF', '#FF6FB1'];

export function CelebrationLayer() {
  const current = useUi((s) => s.celebrations[0]);
  const dismiss = useUi((s) => s.dismissCelebration);
  const reduced = useReducedMotion();
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!current) return;
    btn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, dismiss]);

  if (!current) return null;
  const heading = current.kind === 'badge' ? 'New badge!' : current.kind === 'unlock' ? 'Something new!' : current.kind === 'rank' ? 'Promotion!' : 'Well done!';
  return (
    <div className="celebrate" role="dialog" aria-modal="true" aria-labelledby="celebrate-title" onClick={dismiss}>
      <div className="celebrate__card" onClick={(e) => e.stopPropagation()} style={{ color: current.accent }}>
        {!reduced && (
          <div className="celebrate__burst" aria-hidden="true">
            {Array.from({ length: 22 }, (_, i) => {
              const a = (i / 22) * Math.PI * 2;
              const d = 120 + (i % 4) * 30;
              return (
                <i key={i} style={{ background: BURST_COLOURS[i % BURST_COLOURS.length], ['--x' as string]: `${Math.cos(a) * d}px`, ['--y' as string]: `${Math.sin(a) * d}px` }} />
              );
            })}
          </div>
        )}
        <div className="celebrate__patch" style={{ background: `radial-gradient(circle at 35% 30%, ${current.accent}55, #1a2058 70%)` }}>
          <Glyph name={current.glyph} size={84} accent={current.accent} />
        </div>
        <div className="muted" style={{ fontWeight: 700 }}>{heading}</div>
        <h2 id="celebrate-title" style={{ color: 'var(--ink)' }}>{current.title}</h2>
        <p>{current.subtitle}</p>
        {current.stars ? (
          <div style={{ marginBottom: 18 }}>
            <span className="stars-pill" style={{ fontSize: 'var(--fs-l)' }}>
              <Icon name="star" size={22} />+{current.stars} stars
            </span>
          </div>
        ) : null}
        <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          {current.action && (
            <button className="btn btn--green" onClick={() => { const h = current.action!.href; dismiss(); go(h); }}>
              {current.action.label}
            </button>
          )}
          <button ref={btn} className={current.action ? 'btn btn--ghost' : 'btn'} onClick={dismiss}>
            {current.action ? 'Later' : 'Awesome!'}
          </button>
        </div>
      </div>
    </div>
  );
}
