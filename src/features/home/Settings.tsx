import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@/state/progressStore';
import { useGallery } from '@/state/galleryStore';
import { clearDraft } from '@/drawing/draft';
import { Confirm } from '@/ui/Confirm';
import { Icon } from '@/ui/Icon';
import { go } from '@/app/router';
import { useLibrary } from '@/features/draw/libraryStore';

export function Settings({ onClose }: { onClose: () => void }) {
  const reduced = useProgress((s) => s.reducedMotion);
  const setReduced = useProgress((s) => s.setReducedMotion);
  const resetAll = useProgress((s) => s.resetAll);
  const clearAll = useGallery((s) => s.clearAll);
  const [confirm, setConfirm] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !confirm && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, confirm]);
  const opts: { v: boolean | null; label: string }[] = [
    { v: null, label: 'Same as device' },
    { v: false, label: 'Full motion' },
    { v: true, label: 'Calm motion' },
  ];
  return (
    <>
    <div className="confirm" role="dialog" aria-modal="true" aria-labelledby="settings-h" onClick={onClose}>
      <div className="card settings" onClick={(e) => e.stopPropagation()}>
        <div className="row">
          <h3 id="settings-h">Settings</h3>
          <span className="spacer" />
          <button ref={closeBtn} className="icon-btn icon-btn--round" aria-label="Close settings" onClick={onClose}><Icon name="close" /></button>
        </div>
        <h4 className="settings__h">Animations</h4>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }} role="radiogroup" aria-label="Animations">
          {opts.map((o) => (
            <button key={String(o.v)} className="chip" role="radio" aria-checked={reduced === o.v} aria-pressed={reduced === o.v} onClick={() => setReduced(o.v)}>{o.label}</button>
          ))}
        </div>
        <h4 className="settings__h">Grown-ups</h4>
        <p className="muted" style={{ fontSize: 'var(--fs-s)' }}>
          Indian Space Hub keeps everything on this device. There are no accounts, ads or chats, and nothing is uploaded.
        </p>
        <button className="btn btn--danger" style={{ marginTop: 14 }} onClick={() => setConfirm(true)}><Icon name="trash" /> Start over</button>
      </div>
    </div>
      {confirm && (
        <Confirm
          danger
          title="Start over?"
          body="This removes your call sign, stars, badges and every creation in your archive. It cannot be undone."
          confirmLabel="Start over"
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            await clearAll();
            await clearDraft();
            // Loaded on demand so the drawing engine and page library stay out of the Home bundle.
            const { getEngine } = await import('@/drawing/DrawingEngine');
            getEngine().newDoc({ orient: window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape' });
            resetAll();
            useLibrary.setState({ favs: [], recent: [] });
            go('#/home');
            onClose();
          }}
        />
      )}
    </>
  );
}
