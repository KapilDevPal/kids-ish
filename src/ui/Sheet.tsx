import { useRef, type ReactNode } from 'react';

/**
 * Expandable bottom sheet for mobile tool panels.
 * Collapsed shows a compact "peek" row; expanded reveals the full panel.
 * Swipe the grip up/down, or tap it.
 */
export function Sheet({
  open, onToggle, peek, children, label,
}: { open: boolean; onToggle: (open: boolean) => void; peek: ReactNode; children: ReactNode; label: string }) {
  const startY = useRef<number | null>(null);
  return (
    <section
      className="sheet"
      aria-label={label}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('.sheet__grip')) startY.current = e.clientY;
      }}
      onPointerUp={(e) => {
        if (startY.current == null) return;
        const dy = e.clientY - startY.current;
        startY.current = null;
        if (dy < -24) onToggle(true);
        else if (dy > 24) onToggle(false);
      }}
    >
      <button className="sheet__grip" aria-expanded={open} aria-label={open ? `Hide ${label}` : `Show more ${label}`} onClick={() => onToggle(!open)} />
      {peek}
      {open && <div className="sheet__body">{children}</div>}
    </section>
  );
}
