import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Part, PartMesh } from '../Part';
import { Exhaust } from '../Exhaust';
import { useHangar } from '@/state/hangarStore';
import { actionClock } from '../actionClock';
import { useDisposable } from '../useDisposable';
import { makePlanetCanvas, toTexture } from '../textures';
import type { ModelProps } from '../types';

/**
 * Mangalyaan (Mars Orbiter Mission): a gold box, one big high-gain dish and a solar wing.
 * The action flies it around Mars on an elliptical orbit, like the real mission.
 */
export default function MangalyaanModel(_: ModelProps) {
  const craft = useRef<THREE.Group>(null);
  const mars = useRef<THREE.Group>(null);
  const phase = useHangar((s) => s.phase);
  const marsTex = useDisposable(() => toTexture(makePlanetCanvas('#C9532C', 'rocky', 21, 512)), []);
  const dish = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
      const r = (i / 10) * 0.75;
      pts.push(new THREE.Vector2(r, r * r * 0.45));
    }
    return pts;
  }, []);

  useFrame((_, dt) => {
    const s = useHangar.getState();
    const c = craft.current;
    const m = mars.current;
    if (!c || !m) return;
    const running = s.phase === 'running';
    const ms = m.scale.x + ((running ? 1 : 0.001) - m.scale.x) * Math.min(1, dt * 3);
    m.scale.setScalar(ms);
    m.visible = ms > 0.01;
    m.rotation.y += dt * 0.2;
    if (!running) {
      c.position.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, dt * 4));
      c.rotation.y += (0 - c.rotation.y) * Math.min(1, dt * 4);
      c.scale.setScalar(c.scale.x + (1 - c.scale.x) * Math.min(1, dt * 4));
      if (s.phase === 'idle') actionClock.zoomOut = 0;
      return;
    }
    const t = (performance.now() - s.phaseStart) / 1000;
    actionClock.zoomOut = 1.4;
    const a = t * 1.35;
    const rx = 4.2;
    const rz = 2.6;
    c.scale.setScalar(c.scale.x + (0.55 - c.scale.x) * Math.min(1, dt * 3));
    c.position.set(Math.cos(a) * rx - 1.2, Math.sin(a * 0.5) * 0.4, Math.sin(a) * rz);
    c.rotation.y = -a;
    if (t > 9.4) useHangar.getState().setPhase('done');
  });

  return (
    <group>
      <group ref={mars} position={[-1.2, 0, 0]} scale={0.001}>
        <mesh>
          <sphereGeometry args={[1.8, 48, 48]} />
          <meshStandardMaterial map={marsTex} roughness={1} />
        </mesh>
      </group>
      <group ref={craft}>
        <Part id="bus" explode={[0, 0, 0]}>
          <PartMesh>
            <boxGeometry args={[1, 1, 1]} />
          </PartMesh>
          <PartMesh position={[0, 0.52, 0]}>
            <boxGeometry args={[0.8, 0.04, 0.8]} />
          </PartMesh>
        </Part>
        <Part id="dish" explode={[0, 0.9, 0]}>
          <PartMesh position={[0, 0.58, 0]}>
            <latheGeometry args={[dish, 28]} />
          </PartMesh>
          <PartMesh position={[0, 0.78, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          </PartMesh>
        </Part>
        <Part id="solar" explode={[1, 0, 0]}>
          <PartMesh position={[0.7, 0, 0]}>
            <boxGeometry args={[0.4, 0.04, 0.06]} />
          </PartMesh>
          {[0, 1, 2].map((i) => (
            <PartMesh key={i} position={[1.2 + i * 0.72, 0, 0]}>
              <boxGeometry args={[0.68, 0.03, 0.9]} />
            </PartMesh>
          ))}
        </Part>
        <Part id="thruster" explode={[0, -0.7, 0]}>
          <PartMesh position={[0, -0.62, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 0.26, 16]} />
          </PartMesh>
          <PartMesh position={[0.3, -0.36, 0.3]}>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
          </PartMesh>
        </Part>
        <Exhaust active={phase === 'running'} kind="thruster" position={[0, -0.78, 0]} scale={1.2} />
      </group>
    </group>
  );
}
