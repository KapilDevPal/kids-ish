import { Icon, type IconName } from './Icon';
import type { Route } from '@/app/router';

const ITEMS: { screen: Route['screen']; label: string; icon: IconName; href: string }[] = [
  { screen: 'home', label: 'Home', icon: 'home', href: '#/home' },
  { screen: 'explore', label: 'Explore', icon: 'explore', href: '#/explore' },
  { screen: 'hangar', label: 'Hangar', icon: 'rocket', href: '#/hangar' },
  { screen: 'draw', label: 'Draw', icon: 'brush', href: '#/draw' },
  { screen: 'archive', label: 'Archive', icon: 'archive', href: '#/archive' },
];

export function Nav({ current }: { current: Route['screen'] }) {
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav__brand" aria-hidden="true">
        <BrandMark size={56} />
      </div>
      {ITEMS.map((it) => (
        <a key={it.screen} className="nav__item" href={it.href} aria-current={current === it.screen ? 'page' : undefined}>
          <Icon name={it.icon} size={26} />
          <span>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}

/** The Indian Space Hub mark: a saffron‑to‑green orbit ring around a small rocket. */
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="ish-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF9933" />
          <stop offset="0.5" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#2FBF71" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="#1F2766" />
      <ellipse cx="24" cy="26" rx="19" ry="8" fill="none" stroke="url(#ish-ring)" strokeWidth="3.5" transform="rotate(-22 24 26)" />
      <path d="M24 9c4 3 5.5 7.5 5.5 12.5V29h-11v-7.5C18.5 16.5 20 12 24 9Z" fill="#fff" />
      <path d="M24 9c2 1.5 3.5 3.5 4.3 6h-8.6c.8-2.5 2.3-4.5 4.3-6Z" fill="#FF9933" />
      <circle cx="24" cy="20" r="2.4" fill="#6FD3FF" />
      <path d="M21 30c0 4 3 7 3 7s3-3 3-7z" fill="#FFC93C" />
    </svg>
  );
}
