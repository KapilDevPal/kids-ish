import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHangar, type Burst } from '@/state/hangarStore';
import { getSoftDot } from './textures';
import { useDisposable } from './useDisposable';

/** Paint splash: a quick ring of sparkles where the child tapped. */
function Splash({ burst }: { burst: Burst }) {
  const n = 18;
  const geo = useDisposable(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, []);
  const mat = useDisposable(
    () => new THREE.PointsMaterial({ size: 0.16, color: burst.color, map: getSoftDot(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    [burst.color],
  );
  const dirs = useRef(Array.from({ length: n }, () => new THREE.Vector3().randomDirection()));
  const start = useRef(performance.now());
  const drop = useHangar((s) => s.dropBurst);
  useEffect(() => {
    const t = setTimeout(() => drop(burst.id), 700);
    return () => clearTimeout(t);
  }, [burst.id, drop]);
  useFrame(() => {
    const t = (performance.now() - start.current) / 600;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const d = 0.08 + t * 0.55;
    dirs.current.forEach((v, i) => pos.setXYZ(i, v.x * d, v.y * d, v.z * d));
    pos.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - t);
  });
  return <points geometry={geo} material={mat} position={burst.point} />;
}

export function Bursts() {
  const bursts = useHangar((s) => s.bursts);
  return (
    <>
      {bursts.map((b) => (
        <Splash key={b.id} burst={b} />
      ))}
    </>
  );
}
