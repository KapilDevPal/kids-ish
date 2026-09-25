import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Q } from './quality';
import { getSoftDot, rng } from './textures';
import { useDisposable } from './useDisposable';

/** A deep, slowly drifting star sphere. One draw call. */
export function StarField({ drift = true, radius = 80 }: { drift?: boolean; radius?: number }) {
  const geo = useDisposable(() => {
    const r = rng(7);
    const n = Q.stars;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const tints = ['#ffffff', '#ffe7c2', '#c9e6ff', '#ffd1ea'].map((h) => new THREE.Color(h));
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const rad = radius * (0.7 + r() * 0.3);
      const s = Math.sqrt(1 - u * u);
      pos.set([rad * s * Math.cos(th), rad * u, rad * s * Math.sin(th)], i * 3);
      const c = tints[Math.floor(r() * tints.length)].clone().multiplyScalar(0.55 + r() * 0.45);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [radius]);
  const mat = useDisposable(
    () => new THREE.PointsMaterial({ size: 1.1, sizeAttenuation: true, vertexColors: true, map: getSoftDot(), transparent: true, depthWrite: false }),
    [],
  );
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    if (drift && ref.current) ref.current.rotation.y += dt * 0.006;
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}
