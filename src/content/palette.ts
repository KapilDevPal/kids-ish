/** Kid-friendly swatches, each named after something in space so colour picking teaches a little too. */
export interface Swatch {
  hex: string;
  name: string;
}

export const PAINT_SWATCHES: Swatch[] = [
  { hex: '#FF9933', name: 'Saffron' },
  { hex: '#FFFFFF', name: 'Comet white' },
  { hex: '#138808', name: 'India green' },
  { hex: '#1F3FA8', name: 'Chakra blue' },
  { hex: '#E4572E', name: 'Mars red' },
  { hex: '#FFC93C', name: 'Sun gold' },
  { hex: '#FF6FB1', name: 'Nebula pink' },
  { hex: '#8A5CF6', name: 'Galaxy purple' },
  { hex: '#35D0BA', name: 'Aurora teal' },
  { hex: '#6FD3FF', name: 'Neptune blue' },
  { hex: '#A7A9B4', name: 'Moon grey' },
  { hex: '#23263A', name: 'Deep space' },
];

export const TRICOLOUR = { saffron: '#FF9933', white: '#FFFFFF', green: '#138808' };

export function swatchName(hex: string): string {
  return PAINT_SWATCHES.find((s) => s.hex.toLowerCase() === hex.toLowerCase())?.name ?? 'Custom colour';
}
