import { MODELS } from '@/engine3d/registry';
import { useProgress } from '@/state/progressStore';
import { isUnlocked, unlockSource } from '@/content/unlocks';
import { Glyph } from '@/ui/Glyph';
import { Icon } from '@/ui/Icon';
import { go } from '@/app/router';
import { useEffect, useRef } from 'react';

export function ModelPicker({ current, onClose }: { current: string; onClose: () => void }) {
  const discovered = useProgress((s) => s.discovered);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <div className="picker__head">
        <h2 id="picker-title" style={{ flex: 1 }}>Choose a craft</h2>
        <button ref={closeRef} className="icon-btn icon-btn--round" aria-label="Close" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <div className="picker__grid">
        {MODELS.map((m) => {
          const open = isUnlocked('model', m.id, discovered);
          const src = unlockSource('model', m.id);
          return (
            <button
              key={m.id}
              className={`model-card${open ? '' : ' model-card--locked'}`}
              aria-current={m.id === current}
              onClick={() => {
                onClose();
                go(open ? `#/hangar/${m.id}` : '#/explore/missions');
              }}
            >
              <span className="model-card__art" style={{ background: `radial-gradient(circle at 35% 30%, ${m.accent}66, #1f2766 70%)` }}>
                <Glyph name={m.glyph} size={60} accent={m.accent} />
              </span>
              <span>
                <h3>{m.name}</h3>
                <p>{m.tagline}</p>
                {!open && src && (
                  <span className="model-card__lock">
                    <Icon name="lock" size={16} /> Discover {src.name} to unlock
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
