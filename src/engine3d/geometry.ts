import * as THREE from 'three';

/** Profile helpers for LatheGeometry: smooth, low-poly-friendly rocket shapes. */
export function ogivePoints(radius: number, height: number, steps = 14, tip = 0.02): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = Math.max(tip, radius * Math.sqrt(1 - t * t));
    pts.push(new THREE.Vector2(r, t * height));
  }
  pts.push(new THREE.Vector2(0, height + tip));
  return pts;
}

/** A bulbous payload fairing: straight section, then an ogive nose. */
export function fairingPoints(radius: number, straight: number, nose: number, baseRadius: number): THREE.Vector2[] {
  const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(baseRadius, 0), new THREE.Vector2(radius, straight * 0.25), new THREE.Vector2(radius, straight)];
  ogivePoints(radius, nose, 14).forEach((p) => pts.push(new THREE.Vector2(p.x, p.y + straight)));
  return pts;
}

export function bellPoints(top: number, bottom: number, height: number, steps = 8): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = top + (bottom - top) * Math.pow(t, 0.7);
    pts.push(new THREE.Vector2(r, height * (1 - t)));
  }
  return pts;
}

export function capsulePoints(bottom: number, top: number, height: number): THREE.Vector2[] {
  return [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(bottom, 0.02),
    new THREE.Vector2(bottom * 0.98, height * 0.12),
    new THREE.Vector2(top, height),
    new THREE.Vector2(0.001, height + 0.02),
  ];
}

export function radial(count: number, radius: number, phase = 0): [number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  });
}
