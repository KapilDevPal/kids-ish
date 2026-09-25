/** The child's mission patch: their chosen colour, a rocket and their call-sign initials. */
export function Patch({ colour, callSign, size = 56 }: { colour: string; callSign: string; size?: number }) {
  const initials = callSign.split(' ').slice(0, 2).map((w) => w[0]).join('');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill={colour} />
      <circle cx="32" cy="32" r="25" fill="#161C4C" />
      <path d="M32 12c5 4 7 9 7 15v9H25v-9c0-6 2-11 7-15Z" fill="#fff" />
      <path d="M32 12c2.6 2 4.4 4.6 5.4 7.6H26.6c1-3 2.8-5.6 5.4-7.6Z" fill={colour} />
      <path d="M28 37c0 5 4 8 4 8s4-3 4-8z" fill="#FFC93C" />
      <text x="32" y="56" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="inherit">{initials}</text>
    </svg>
  );
}
