/**
 * Illustrated glyphs: chunky, friendly pictures used on cards, badges and patches.
 * Drawn in a consistent style so the whole product feels like one sticker set.
 */
export type GlyphName =
  | 'rocket' | 'satellite' | 'lander' | 'orbiter' | 'sun' | 'astronaut' | 'capsule'
  | 'planet' | 'moon' | 'star' | 'flag' | 'brush' | 'archive' | 'sparkle';

export function Glyph({ name, size = 64, accent = '#FF9933' }: { name: GlyphName | string; size?: number; accent?: string }) {
  const ink = '#16193F';
  const common = { stroke: ink, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  let body: JSX.Element;
  switch (name) {
    case 'rocket':
      body = (
        <g {...common}>
          <path d="M32 6c9 7 11 18 11 28v10H21V34c0-10 2-21 11-28Z" fill="#fff" />
          <path d="M32 6c4 3 7 7 8.4 12H23.6C25 13 28 9 32 6Z" fill={accent} />
          <path d="M21 36l-8 10v6l8-4zM43 36l8 10v6l-8-4z" fill={accent} />
          <circle cx="32" cy="28" r="5" fill="#6FD3FF" />
          <path d="M26 44h12l-2 6h-8z" fill="#A7A9B4" />
          <path d="M28 51c0 5 4 8 4 8s4-3 4-8" fill="#FFC93C" />
        </g>
      );
      break;
    case 'satellite':
      body = (
        <g {...common}>
          <rect x="4" y="24" width="18" height="16" rx="2" fill="#1F3FA8" />
          <rect x="42" y="24" width="18" height="16" rx="2" fill="#1F3FA8" />
          <path d="M13 24v16M51 24v16" stroke="#6FD3FF" />
          <rect x="22" y="20" width="20" height="24" rx="4" fill={accent} />
          <path d="M32 20v-8M26 10a6 6 0 0 1 12 0" fill="none" />
          <circle cx="32" cy="32" r="4" fill="#fff" />
        </g>
      );
      break;
    case 'lander':
      body = (
        <g {...common}>
          <path d="M18 40 10 54M46 40l8 14M24 42l-4 12M40 42l4 12" fill="none" />
          <path d="M6 54h12M46 54h12" />
          <rect x="16" y="22" width="32" height="20" rx="3" fill="#FFC93C" />
          <path d="M22 22l4-10h12l4 10" fill="#A7A9B4" />
          <rect x="26" y="28" width="12" height="8" rx="2" fill="#1F3FA8" />
          <path d="M32 12V5" />
          <circle cx="32" cy="5" r="2.5" fill={accent} />
        </g>
      );
      break;
    case 'orbiter':
      body = (
        <g {...common}>
          <rect x="22" y="24" width="20" height="20" rx="3" fill="#FFC93C" />
          <path d="M42 30h6M48 20h12v20H48z" fill="#1F3FA8" />
          <path d="M16 18c0 8 6 14 14 14" fill="none" />
          <path d="M8 22a14 14 0 0 0 20 12" fill="#fff" />
          <circle cx="12" cy="10" r="5" fill={accent} />
        </g>
      );
      break;
    case 'sun':
      body = (
        <g {...common}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M32 4v8" transform={`rotate(${a} 32 32)`} />
          ))}
          <circle cx="32" cy="32" r="15" fill="#FFC93C" />
          <path d="M25 34c3 4 11 4 14 0" fill="none" />
          <circle cx="27" cy="29" r="1.6" fill={ink} />
          <circle cx="37" cy="29" r="1.6" fill={ink} />
        </g>
      );
      break;
    case 'astronaut':
      body = (
        <g {...common}>
          <rect x="18" y="32" width="28" height="24" rx="8" fill="#fff" />
          <circle cx="32" cy="22" r="15" fill="#fff" />
          <rect x="22" y="15" width="20" height="14" rx="7" fill="#1F3FA8" />
          <path d="M26 19c2-2 5-2 7-1" stroke="#6FD3FF" fill="none" />
          <rect x="26" y="40" width="12" height="8" rx="2" fill={accent} />
        </g>
      );
      break;
    case 'capsule':
      body = (
        <g {...common}>
          <path d="M20 50 26 18h12l6 32Z" fill="#fff" />
          <path d="M18 50h28l-2 6H20z" fill={accent} />
          <circle cx="32" cy="32" r="4.5" fill="#6FD3FF" />
          <path d="M28 18l2-8h4l2 8" fill="#A7A9B4" />
        </g>
      );
      break;
    case 'planet':
      body = (
        <g {...common}>
          <circle cx="32" cy="32" r="16" fill={accent} />
          <path d="M20 26c6 2 16 2 24-2M18 36c8 3 20 3 28-2" fill="none" strokeWidth="2.4" />
          <ellipse cx="32" cy="34" rx="28" ry="8" fill="none" transform="rotate(-14 32 34)" />
        </g>
      );
      break;
    case 'moon':
      body = (
        <g {...common}>
          <circle cx="32" cy="32" r="20" fill="#D8D9E2" />
          <circle cx="25" cy="26" r="5" fill="#A7A9B4" />
          <circle cx="39" cy="38" r="4" fill="#A7A9B4" />
          <circle cx="36" cy="22" r="2.5" fill="#A7A9B4" />
        </g>
      );
      break;
    case 'flag':
      body = (
        <g {...common}>
          <path d="M14 8v50" />
          <rect x="14" y="10" width="36" height="8" fill="#FF9933" />
          <rect x="14" y="18" width="36" height="8" fill="#fff" />
          <rect x="14" y="26" width="36" height="8" fill="#138808" />
          <circle cx="32" cy="22" r="2.6" fill="none" stroke="#1F3FA8" strokeWidth="1.6" />
        </g>
      );
      break;
    case 'brush':
      body = (
        <g {...common}>
          <path d="M50 8 30 34l6 6L56 14z" fill="#FFC93C" />
          <path d="M28 36c-8-1-14 4-14 12 0 3-2 6-6 8 14 2 26-2 26-14z" fill={accent} />
        </g>
      );
      break;
    case 'archive':
      body = (
        <g {...common}>
          <rect x="8" y="14" width="48" height="36" rx="5" fill="#fff" />
          <path d="M14 44l11-14 8 9 6-6 11 11z" fill={accent} />
          <circle cx="42" cy="24" r="4" fill="#FFC93C" />
        </g>
      );
      break;
    case 'sparkle':
      body = (
        <g {...common}>
          <path d="M32 6l5 17 17 5-17 5-5 17-5-17-17-5 17-5z" fill={accent} />
          <path d="M50 42l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff" />
        </g>
      );
      break;
    default:
      body = (
        <g {...common}>
          <path d="M32 8l6.5 14 15.5 1.5-11.7 10.4 3.4 15.1L32 41.3 18.3 49l3.4-15.1L10 23.5 25.5 22Z" fill={accent} />
        </g>
      );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}
