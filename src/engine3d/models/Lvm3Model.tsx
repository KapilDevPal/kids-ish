import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { Part, PartMesh } from '../Part';
import { Exhaust } from '../Exhaust';
import { LaunchPad, FlagDecal } from './LaunchPad';
import { bellPoints, capsulePoints, fairingPoints, ogivePoints } from '../geometry';
import { Q } from '../quality';
import { useHangar } from '@/state/hangarStore';
import { useRocketLaunch } from './useRocketLaunch';
import type { ModelProps } from '../types';

/**
 * LVM3: two S200 solid boosters, the L110 liquid core and the C25 cryogenic upper stage.
 * The "Crew capsule" option swaps the fairing for a Gaganyaan crew module with its escape tower.
 */
export default function Lvm3Model({ options }: ModelProps) {
  const crew = !!options.crew;
  const seg = Q.seg;
  const R = 0.42;
  const boosterBase = useMemo<[number, number][]>(() => [[0.8, 0], [-0.8, 0]], []);
  const vehicle = useRef<THREE.Group>(null);
  const boosters = useRef<(THREE.Group | null)[]>([]);
  const phase = useHangar((s) => s.phase);
  useRocketLaunch({ vehicle, boosters, boosterBase, separateAt: 2.4, duration: 7.5 });
  const fairing = useMemo(() => fairingPoints(0.54, 0.6, 0.9, 0.42), []);
  const capsule = useMemo(() => capsulePoints(0.42, 0.16, 0.5), []);
  const bNose = useMemo(() => ogivePoints(0.34, 0.6, 12), []);
  const bell = useMemo(() => bellPoints(0.1, 0.18, 0.3), []);
  const sBell = useMemo(() => bellPoints(0.16, 0.3, 0.36), []);
  const running = phase === 'running';

  return (
    <group>
      <LaunchPad height={6} />
      <Exhaust active={running} kind="smoke" position={[0, 0.1, 0]} scale={1.4} />
      <group ref={vehicle}>
        <Part id="engine" explode={[0, -0.55, 0]}>
          {[-0.17, 0.17].map((x) => (
            <PartMesh key={x} position={[x, 0.52, 0]}>
              <latheGeometry args={[bell, 18]} />
            </PartMesh>
          ))}
        </Part>
        <Part id="core" explode={[0, -0.1, 0]}>
          <PartMesh position={[0, 0.82 + 1.3, 0]}>
            <cylinderGeometry args={[R, R, 2.6, seg]} />
          </PartMesh>
          <FlagDecal radius={R} y={2.4} angle={1.2} />
        </Part>
        <Part id="upper" explode={[0, 0.55, 0]}>
          <PartMesh position={[0, 3.42 + 0.38, 0]}>
            <cylinderGeometry args={[R, R, 0.76, seg]} />
          </PartMesh>
        </Part>
        <Part id="nose" explode={[0, 1.2, 0]}>
          {crew ? (
            <>
              <PartMesh position={[0, 4.18, 0]}>
                <latheGeometry args={[capsule, seg]} />
              </PartMesh>
              <PartMesh position={[0, 4.68 + 0.5, 0]}>
                <cylinderGeometry args={[0.05, 0.08, 1, 12]} />
              </PartMesh>
              <PartMesh position={[0, 5.68, 0]}>
                <coneGeometry args={[0.1, 0.3, 12]} />
              </PartMesh>
              {[0, 1, 2, 3].map((i) => (
                <PartMesh key={i} position={[Math.cos(i * 1.57) * 0.1, 4.95, Math.sin(i * 1.57) * 0.1]} rotation={[0, 0, 0]}>
                  <coneGeometry args={[0.04, 0.16, 8]} />
                </PartMesh>
              ))}
            </>
          ) : (
            <PartMesh position={[0, 4.18, 0]}>
              <latheGeometry args={[fairing, seg]} />
            </PartMesh>
          )}
        </Part>
        {boosterBase.map(([x, z], i) => (
          <group key={i} ref={(el) => (boosters.current[i] = el)} position={[x, 0, z]}>
            <Part id="boosters" explode={[x * 1.2, 0, 0]}>
              <PartMesh position={[0, 0.02, 0]}>
                <latheGeometry args={[sBell, 22]} />
              </PartMesh>
              <PartMesh position={[0, 0.38 + 1.55, 0]}>
                <cylinderGeometry args={[0.34, 0.34, 3.1, seg]} />
              </PartMesh>
              <PartMesh position={[0, 3.48, 0]}>
                <latheGeometry args={[bNose, seg]} />
              </PartMesh>
            </Part>
          </group>
        ))}
        <Exhaust active={running} kind="flame" position={[0, 0.2, 0]} />
        <Exhaust active={running} kind="flame" position={[0.8, 0, 0]} scale={1.2} />
        <Exhaust active={running} kind="flame" position={[-0.8, 0, 0]} scale={1.2} />
      </group>
    </group>
  );
}
