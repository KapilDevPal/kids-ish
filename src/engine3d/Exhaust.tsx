import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Q } from './quality';
import { getSoftDot } from './textures';
import { useDisposable } from './useDisposable';

interface ExhaustProps {
  active: boolean;
  /** 'flame' shoots down fast and hot; 'smoke' billows outward slowly. */
  kind?: 'flame' | 'smoke' | 'thruster';
  position?: [number, number, number];
  scale?: number;
  count?: number;
  /** Optional per-frame gate, for emitters that switch on and off mid-animation. */
  gate?: { current: boolean };
}

/** CPU-updated point particles. Small counts, one draw call, additive blending for flames. */
export function Exhaust({ active, kind = 'flame', position, scale = 1, count, gate }: ExhaustProps) {
  const n = count ?? (kind === 'smoke' ? Math.round(Q.particles * 0.6) : Q.particles);
  const state = useRef<{ life: Float32Array; vel: Float32Array } | null>(null);
  const geo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    state.current = { life: new Float32Array(n).fill(0), vel: new Float32Array(n * 3) };
    return g;
  }, [n]);
  const mat = useDisposable(
    () =>
      new THREE.PointsMaterial({
        size: (kind === 'smoke' ? 0.9 : kind === 'thruster' ? 0.22 : 0.42) * scale,
        map: getSoftDot(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: kind === 'smoke' ? THREE.NormalBlending : THREE.AdditiveBlending,
        opacity: kind === 'smoke' ? 0.55 : 1,
      }),
    [kind, scale],
  );
  const hot = new THREE.Color('#FFF3B0');
  const warm = new THREE.Color('#FF8A1F');
  const smoke = new THREE.Color('#C9CCE0');
  const tmp = new THREE.Color();

  useFrame((_, rawDt) => {
    const st = state.current;
    if (!st) return;
    const dt = Math.min(rawDt, 1 / 30);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = geo.attributes.color as THREE.BufferAttribute;
    const maxLife = kind === 'smoke' ? 2.4 : kind === 'thruster' ? 0.35 : 0.55;
    let alive = 0;
    const on = active && (gate ? gate.current : true);
    for (let i = 0; i < n; i++) {
      let life = st.life[i];
      if (life <= 0) {
        if (!on || Math.random() > (kind === 'smoke' ? 0.08 : 0.5)) {
          pos.setXYZ(i, 0, -999, 0);
          continue;
        }
        life = maxLife * (0.6 + Math.random() * 0.4);
        const a = Math.random() * Math.PI * 2;
        if (kind === 'smoke') {
          pos.setXYZ(i, (Math.random() - 0.5) * 0.4 * scale, 0, (Math.random() - 0.5) * 0.4 * scale);
          const sp = (1.2 + Math.random()) * scale;
          st.vel.set([Math.cos(a) * sp, 0.25 * scale * Math.random(), Math.sin(a) * sp], i * 3);
        } else {
          const r = Math.random() * 0.08 * scale;
          pos.setXYZ(i, Math.cos(a) * r, 0, Math.sin(a) * r);
          const sp = (kind === 'thruster' ? 1.6 : 4.5 + Math.random() * 2) * scale;
          st.vel.set([Math.cos(a) * 0.3 * scale, -sp, Math.sin(a) * 0.3 * scale], i * 3);
        }
      }
      life -= dt;
      st.life[i] = life;
      alive++;
      const t = 1 - life / maxLife;
      pos.setXYZ(i, pos.getX(i) + st.vel[i * 3] * dt, pos.getY(i) + st.vel[i * 3 + 1] * dt, pos.getZ(i) + st.vel[i * 3 + 2] * dt);
      if (kind === 'smoke') {
        st.vel[i * 3] *= 0.97;
        st.vel[i * 3 + 2] *= 0.97;
        tmp.copy(smoke).multiplyScalar(1 - t * 0.5);
      } else {
        tmp.copy(hot).lerp(warm, Math.min(1, t * 1.6)).multiplyScalar(1 - t);
      }
      col.setXYZ(i, tmp.r, tmp.g, tmp.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.setDrawRange(0, alive || n);
    if (!alive) geo.setDrawRange(0, n);
  });

  return <points geometry={geo} material={mat} position={position} frustumCulled={false} />;
}
