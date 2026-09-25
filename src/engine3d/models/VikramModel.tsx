import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { Part, PartMesh } from '../Part';
import { Exhaust } from '../Exhaust';
import { MoonGround } from './MoonGround';
import { useHangar } from '@/state/hangarStore';
import { actionClock } from '../actionClock';
import type { ModelProps } from '../types';

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/**
 * Chandrayaan-3's Vikram lander and Pragyan rover.
 * The action replays the landing: a slow powered descent, a dust puff, the ramp unfolding
 * and Pragyan rolling out onto the Moon.
 */
export default function VikramModel(_: ModelProps) {
  const lander = useRef<THREE.Group>(null);
  const ramp = useRef<THREE.Group>(null);
  const rover = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  const thrust = useRef(false);
  const phase = useHangar((s) => s.phase);

  useFrame((_, dt) => {
    const s = useHangar.getState();
    const L = lander.current;
    const Rp = ramp.current;
    const Rv = rover.current;
    if (!L || !Rp || !Rv) return;
    if (s.phase !== 'running') {
      L.position.y += (0 - L.position.y) * 0.2;
      if (s.phase === 'idle') {
        Rp.rotation.x = 0;
        Rv.position.set(0, 1.02, 0.78);
        Rv.rotation.set(-Math.PI / 2, 0, 0);
        actionClock.zoomOut = 0;
      }
      return;
    }
    const t = (performance.now() - s.phaseStart) / 1000;
    actionClock.zoomOut = 0.35;
    // Descent: 0 → 3.4 s
    L.position.y = 5 * (1 - ease(t / 3.4));
    thrust.current = t < 3.4;
    // Ramp: 3.8 → 4.8 s
    Rp.rotation.x = ease((t - 3.8) / 1) * 1.1;
    // Rover: tucked vertically on the ramp, tips down and rolls out 4.8 → 8 s
    const tip = ease((t - 3.8) / 1);
    const roll = ease((t - 4.8) / 3.2);
    Rv.rotation.x = -Math.PI / 2 * (1 - tip);
    Rv.position.set(0, 1.02 - tip * 0.6 - roll * 0.3, 0.78 + tip * 0.3 + roll * 1.6);
    if (roll > 0 && wheels.current) wheels.current.children.forEach((w) => (w.rotation.x += dt * 6));
    if (t > 8.6) useHangar.getState().setPhase('done');
  });

  const running = phase === 'running';
  return (
    <group>
      <MoonGround />
      <Exhaust active={running} kind="smoke" position={[0, 0.05, 0]} scale={0.7} />
      <group ref={lander}>
        <Part id="body" explode={[0, 0.3, 0]}>
          <PartMesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.5, 0.9, 1.5]} />
          </PartMesh>
        </Part>
        <Part id="deck" explode={[0, 0.9, 0]}>
          <PartMesh position={[0, 1.5, 0]}>
            <boxGeometry args={[1.1, 0.22, 1.1]} />
          </PartMesh>
          <PartMesh position={[0.3, 1.85, -0.2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          </PartMesh>
          <PartMesh position={[0.3, 2.12, -0.2]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.02, 0.1, 16]} />
          </PartMesh>
          <PartMesh position={[-0.35, 1.72, 0.25]}>
            <boxGeometry args={[0.18, 0.2, 0.18]} />
          </PartMesh>
        </Part>
        <Part id="solar" explode={[-0.8, 0.2, 0]}>
          <PartMesh position={[-0.77, 0.95, 0]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.04, 0.85, 1.35]} />
          </PartMesh>
        </Part>
        <Part id="legs" explode={[0, -0.35, 0]}>
          {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, z]) => (
            <group key={`${x}${z}`}>
              <PartMesh position={[x * 0.88, 0.32, z * 0.88]} rotation={[z * 0.35, 0, -x * 0.35]}>
                <cylinderGeometry args={[0.045, 0.045, 0.8, 10]} />
              </PartMesh>
              <PartMesh position={[x * 1.02, 0.03, z * 1.02]}>
                <cylinderGeometry args={[0.16, 0.18, 0.05, 18]} />
              </PartMesh>
            </group>
          ))}
        </Part>
        <group ref={ramp} position={[0, 0.5, 0.76]}>
          <Part id="body" explode={[0, 0.3, 0.2]}>
            <PartMesh position={[0, 0.45, 0.01]}>
              <boxGeometry args={[0.7, 0.9, 0.03]} />
            </PartMesh>
          </Part>
        </group>
        <group ref={rover} position={[0, 1.02, 0.78]}>
          <Part id="rover" explode={[0, 0.2, 1]}>
            <PartMesh position={[0, 0.16, 0]}>
              <boxGeometry args={[0.5, 0.16, 0.4]} />
            </PartMesh>
            <PartMesh position={[0.18, 0.35, 0.08]}>
              <boxGeometry args={[0.06, 0.24, 0.06]} />
            </PartMesh>
          </Part>
          <Part id="solar" explode={[0, 0.4, 1]}>
            <PartMesh position={[-0.05, 0.27, -0.05]} rotation={[-0.25, 0, 0]}>
              <boxGeometry args={[0.46, 0.02, 0.36]} />
            </PartMesh>
          </Part>
          <group ref={wheels}>
            {[-0.16, 0, 0.16].map((z) => [-0.29, 0.29].map((x) => (
              <Part key={`${x}${z}`} id="wheels" explode={[x * 0.6, 0, 1]} position={[x, 0.07, z]}>
                <PartMesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.06, 14]} />
                </PartMesh>
              </Part>
            )))}
          </group>
        </group>
        <Exhaust active={running} gate={thrust} kind="thruster" position={[0, 0.42, 0]} scale={1.4} />
      </group>
    </group>
  );
}
