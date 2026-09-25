import { useEffect, useState } from 'react';
import { useProgress } from '@/state/progressStore';

/** System preference, overridable by the in-app setting (null = follow system). */
export function useReducedMotion(): boolean {
  const override = useProgress((s) => s.reducedMotion);
  const [system, setSystem] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setSystem(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return override ?? system;
}
