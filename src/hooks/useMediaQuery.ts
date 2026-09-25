import { useEffect, useState } from 'react';

export function useMediaQuery(q: string): boolean {
  const [m, setM] = useState(() => window.matchMedia?.(q).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(q);
    if (!mq) return;
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [q]);
  return m;
}

/** ≥1024px: tools move to side panels; below that, bottom docks and sheets. */
export const useIsWide = () => useMediaQuery('(min-width: 1024px)');
