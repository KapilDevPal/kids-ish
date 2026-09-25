import { useEffect, useRef } from 'react';

export function Confirm({
  title, body, confirmLabel, onConfirm, onCancel, danger,
}: { title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onClick={onCancel}>
      <div className="card confirm__card" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-title">{title}</h3>
        <p>{body}</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button ref={cancel} className="btn btn--ghost" onClick={onCancel}>Keep it</button>
          <button className={danger ? 'btn btn--danger' : 'btn'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
