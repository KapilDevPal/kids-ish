import { useEffect, useMemo, type DependencyList } from 'react';

/**
 * useMemo for imperatively created GPU resources (textures, geometries, materials).
 * Disposes the previous instance whenever deps change and on unmount, so mobile GPUs don't leak.
 */
export function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}
