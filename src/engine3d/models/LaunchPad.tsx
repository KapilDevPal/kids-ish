import { useMemo } from 'react';
import * as THREE from 'three';
import { useDisposable } from '../useDisposable';

/** A stylised Sriharikota launch pad: platform, umbilical tower and a glowing ground ring. */
export function LaunchPad({ height = 5.2 }: { height?: number }) {
  const steel = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#3B4380', metalness: 0.5, roughness: 0.5 }), []);
  const deck = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#2A2F63', roughness: 0.8 }), []);
  const ring = useDisposable(() => new THREE.MeshBasicMaterial({ color: '#FF9933', transparent: true, opacity: 0.55 }), []);
  const rungs = useMemo(() => Array.from({ length: Math.floor(height / 0.5) }, (_, i) => 0.4 + i * 0.5), [height]);
  return (
    <group>
      <mesh position={[0, -0.12, 0]} material={deck}>
        <cylinderGeometry args={[2.6, 2.9, 0.24, 48]} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={ring}>
        <ringGeometry args={[1.35, 1.45, 64]} />
      </mesh>
      <group position={[-1.55, 0, -0.2]}>
        {[-0.18, 0.18].map((x) => [-0.18, 0.18].map((z) => (
          <mesh key={`${x}${z}`} position={[x, height / 2, z]} material={steel}>
            <boxGeometry args={[0.06, height, 0.06]} />
          </mesh>
        )))}
        {rungs.map((y) => (
          <mesh key={y} position={[0, y, 0]} material={steel}>
            <boxGeometry args={[0.42, 0.04, 0.42]} />
          </mesh>
        ))}
        <mesh position={[0.5, height * 0.72, 0]} material={steel}>
          <boxGeometry args={[0.7, 0.05, 0.08]} />
        </mesh>
        <mesh position={[0, height + 0.15, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#FF4D4D" />
        </mesh>
      </group>
    </group>
  );
}

/** A tiny tricolour flag decal for rocket bodies (not paintable, it is the flag). */
export function FlagDecal({ radius, y, angle = 0.4 }: { radius: number; y: number; angle?: number }) {
  const w = 0.22;
  const h = 0.05;
  return (
    <group rotation={[0, angle, 0]}>
      {['#FF9933', '#FFFFFF', '#138808'].map((c, i) => (
        <mesh key={c} position={[0, y + h - i * h, radius + 0.004]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
