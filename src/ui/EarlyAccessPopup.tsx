import { useEffect, useState } from 'react';
import { safeStorage } from '@/persistence/safeStorage';

// Google Form that collects parents' emails for the upcoming kids' space app (short link: https://forms.gle/o6hnwxeMywEzXYxo8).
const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc0lygG3_OHt6BA0_G0oTvsvMHf5iuSTG44CDGfB_Qco05r_w/viewform';
// Google Play opt-in page for Android testers.
const PLAY_URL = 'https://play.google.com/apps/testing/kids.littleorbit';
const EMBED_URL = `${FORM_URL}?embedded=true`;

const KEY = 'ish-early-access';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1200;

/** 'done' = they told us they signed up; a number = when they last chose "Maybe later". */
function shouldShow(): boolean {
  const saved = safeStorage.getItem(KEY);
  if (!saved) return true;
  if (saved === 'done') return false;
  return Date.now() - Number(saved) > SNOOZE_MS;
}

export function EarlyAccessPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldShow()) return;
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const later = () => { safeStorage.setItem(KEY, String(Date.now())); setOpen(false); };
  const done = () => { safeStorage.setItem(KEY, 'done'); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && later();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div className="early" role="dialog" aria-modal="true" aria-labelledby="early-title" onClick={later}>
      <div className="card early__card" onClick={(e) => e.stopPropagation()}>
        <button className="early__close" aria-label="Close" onClick={later}>×</button>
        <h3 id="early-title">🚀 Get early access!</h3>
        <p className="muted">
          We're building a dedicated space app for children. Share your email below and be among the first to try it.
        </p>
        <iframe className="early__form" src={EMBED_URL} title="Early access sign-up form" loading="lazy">Loading…</iframe>
        <div className="row early__actions">
          <a className="early__link" href={FORM_URL} target="_blank" rel="noopener noreferrer">Open form in a new tab</a>
          <a className="early__link" href={PLAY_URL} target="_blank" rel="noopener noreferrer">Android? Join the Play testing</a>
          <span className="spacer" />
          <button className="btn btn--ghost" onClick={later}>Maybe later</button>
          <button className="btn" onClick={done}>I've signed up</button>
        </div>
      </div>
    </div>
  );
}
