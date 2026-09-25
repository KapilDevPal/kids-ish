import { useEffect, useState } from 'react';

/** Tiny hash router: no server config needed, works inside hosted iframes and static hosting. */
export interface Route {
  screen: 'home' | 'explore' | 'hangar' | 'draw' | 'archive';
  params: string[];
}

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const screen = (['home', 'explore', 'hangar', 'draw', 'archive'] as const).find((s) => s === parts[0]) ?? 'home';
  return { screen, params: parts.slice(1) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(href: string) {
  if (window.location.hash === href) return;
  window.location.hash = href;
}
