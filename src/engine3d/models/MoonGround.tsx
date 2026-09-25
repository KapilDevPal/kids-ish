import * as THREE from 'three';
import { useDisposable } from '../useDisposable';
import { makePlanetCanvas, toTexture } from '../textures';

/** A patch of lunar surface with craters, plus Earth hanging in the sky. */
export function MoonGround() {
  const tex = useDisposable(() => {
    const t = toTexture(makePlanetCanvas('#9A9BA6', 'rocky', 3, 512));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 4);
    return t;
  }, []);
  const earth = useDisposable(() => toTexture(makePlanetCanvas('#2B6FD6', 'ocean', 11, 256)), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      <mesh position={[-6, 6, -14]}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial map={earth} emissive="#1c3a7a" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}
