import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { Part, PartMesh } from '../Part';
import { Exhaust } from '../Exhaust';
import { LaunchPad, FlagDecal } from './LaunchPad';
import { bellPoints, fairingPoints, ogivePoints, radial } from '../geometry';
import { Q } from '../quality';
import { useHangar } from '@/state/hangarStore';
import { useRocketLaunch } from './useRocketLaunch';
import type { ModelProps } from '../types';

/**
 * PSLV: four stages plus 0, 2, 4 or 6 strap-on boosters (CA, DL, QL and XL variants).
 * Stylised a little chunkier than the real 44 m rocket so small fingers can tap each part.
 */
export default function PslvModel({ options }: ModelProps) {
  const count = Number(options.boosters ?? 6);
  const seg = Q.seg;
  const R = 0.36;
  const boosterBase = useMemo(() => radial(count, R + 0.17, Math.PI / 6), [count]);
  const vehicle = useRef<THREE.Group>(null);
  const boosters = useRef<(THREE.Group | null)[]>([]);
  const phase = useHangar((s) => s.phase);
  useRocketLaunch({ vehicle, boosters, boosterBase, separateAt: 2.6, duration: 7.5 });

  const fairing = useMemo(() => fairingPoints(0.42, 0.55, 0.85, 0.25), []);
  const bell = useMemo(() => bellPoints(0.14, 0.26, 0.38), []);
  const bNose = useMemo(() => ogivePoints(0.16, 0.42, 10), []);
  const bBell = useMemo(() => bellPoints(0.07, 0.12, 0.18, 6), []);
  const running = phase === 'running';

  return (
    <group>
      <LaunchPad height={5.4} />
      <Exhaust active={running} kind="smoke" position={[0, 0.1, 0]} scale={1.2} />
      <group ref={vehicle}>
        <Part id="engine" position={[0, 0, 0]} explode={[0, -0.6, 0]}>
          <PartMesh position={[0, 0, 0]}>
            <latheGeometry args={[bell, seg]} />
          </PartMesh>
        </Part>
        <Part id="core" explode={[0, -0.2, 0]}>
          <PartMesh position={[0, 0.38 + 0.95, 0]}>
            <cylinderGeometry args={[R, R, 1.9, seg]} />
          </PartMesh>
          <FlagDecal radius={R} y={1.6} angle={0.5} />
        </Part>
        <Part id="stage2" explode={[0, 0.3, 0]}>
          <PartMesh position={[0, 2.28 + 0.65, 0]}>
            <cylinderGeometry args={[R, R, 1.3, seg]} />
          </PartMesh>
          <PartMesh position={[0, 2.28, 0]}>
            <cylinderGeometry args={[R + 0.02, R + 0.02, 0.06, seg]} />
          </PartMesh>
        </Part>
        <Part id="stage3" explode={[0, 0.75, 0]}>
          <PartMesh position={[0, 3.58 + 0.12, 0]}>
            <cylinderGeometry args={[0.29, R, 0.24, seg]} />
          </PartMesh>
          <PartMesh position={[0, 3.82 + 0.3, 0]}>
            <cylinderGeometry args={[0.29, 0.29, 0.6, seg]} />
          </PartMesh>
        </Part>
        <Part id="stage4" explode={[0, 1.15, 0]}>
          <PartMesh position={[0, 4.42 + 0.14, 0]}>
            <cylinderGeometry args={[0.25, 0.29, 0.28, seg]} />
          </PartMesh>
        </Part>
        <Part id="fairing" explode={[0, 1.65, 0]}>
          <PartMesh position={[0, 4.7, 0]}>
            <latheGeometry args={[fairing, seg]} />
          </PartMesh>
        </Part>
        {boosterBase.map(([x, z], i) => {
          const len = i % 2 === 0 || count < 6 ? 1.7 : 1.5; // XL mixes ground-lit and air-lit boosters
          return (
            <group key={`${count}-${i}`} ref={(el) => (boosters.current[i] = el)} position={[x, 0, z]}>
              <Part id="boosters" explode={[x * 1.6, 0, z * 1.6]}>
                <PartMesh position={[0, 0.2, 0]}>
                  <latheGeometry args={[bBell, 16]} />
                </PartMesh>
                <PartMesh position={[0, 0.38 + len / 2, 0]}>
                  <cylinderGeometry args={[0.16, 0.16, len, 20]} />
                </PartMesh>
                <PartMesh position={[0, 0.38 + len, 0]}>
                  <latheGeometry args={[bNose, 20]} />
                </PartMesh>
              </Part>
            </group>
          );
        })}
        <Exhaust active={running} kind="flame" position={[0, 0.02, 0]} scale={1.1} />
      </group>
    </group>
  );
}
