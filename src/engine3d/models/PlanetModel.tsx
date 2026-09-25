import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Part, PartMesh } from '../Part';
import { useHangar } from '@/state/hangarStore';
import { useDisposable } from '../useDisposable';
import { makeCloudCanvas, makePlanetCanvas, makeRingCanvas, toTexture, type SurfaceStyle } from '../textures';
import { Q } from '../quality';
import type { ModelProps } from '../types';

const SIZES: Record<string, number> = { small: 1.0, medium: 1.35, big: 1.7 };

/**
 * Planet maker. Surface texture is generated from the painted colour and the chosen world type.
 * Rings, clouds, atmosphere glow and up to three moons are all separate paintable parts.
 */
export default function PlanetModel({ options }: ModelProps) {
  const style = (options.style as SurfaceStyle) ?? 'rocky';
  const size = SIZES[String(options.size ?? 'medium')] ?? 1.35;
  const moons = Number(options.moons ?? 1);
  const rings = !!options.rings;
  const clouds = !!options.clouds;
  const surfaceColor = useHangar((s) => s.paint.surface?.color ?? '#35D0BA');
  const glowColor = useHangar((s) => s.paint.glow?.color ?? '#6FD3FF');
  const surfaceFinish = useHangar((s) => s.paint.surface?.finish ?? 'matte');
  const seed = style.length * 97 + 5;

  const surfaceTex = useDisposable(() => toTexture(makePlanetCanvas(surfaceColor, style, seed, Q.texture), true), [surfaceColor, style, seed]);
  const ringTex = useDisposable(() => toTexture(makeRingCanvas(9)), []);
  const cloudTex = useDisposable(() => toTexture(makeCloudCanvas(4), true), []);
  const moonTex = useDisposable(() => toTexture(makePlanetCanvas('#FFFFFF', 'rocky', 8, 256)), []);
  const surfaceMat = useDisposable(() => new THREE.MeshStandardMaterial({ roughness: 0.9 }), []);
  const glowMat = useDisposable(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.22, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  surfaceMat.map = surfaceTex;
  surfaceMat.roughness = surfaceFinish === 'metal' ? 0.35 : surfaceFinish === 'gloss' ? 0.5 : 0.95;
  surfaceMat.metalness = surfaceFinish === 'metal' ? 0.6 : 0;
  surfaceMat.emissive.set(surfaceFinish === 'glow' ? surfaceColor : '#000000');
  surfaceMat.emissiveMap = surfaceFinish === 'glow' ? surfaceTex : null;
  surfaceMat.emissiveIntensity = surfaceFinish === 'glow' ? 0.8 : 0;
  surfaceMat.needsUpdate = true;
  glowMat.color.set(glowColor);

  const spinner = useRef<THREE.Group>(null);
  const cloudRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((_, dt) => {
    const s = useHangar.getState();
    if (s.phase === 'running') {
      const t = (performance.now() - s.phaseStart) / 1000;
      spin.current = 14 * Math.exp(-t * 1.1);
      if (t > 3) s.setPhase('done');
    } else {
      spin.current += (0.25 - spin.current) * Math.min(1, dt * 2);
    }
    if (spinner.current) spinner.current.rotation.y += dt * spin.current;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * (spin.current * 1.3 + 0.05);
    if (moonRef.current) moonRef.current.rotation.y += dt * (0.4 + spin.current * 0.3);
  });

  return (
    <group rotation={[0.18, 0, 0.12]}>
      <group ref={spinner}>
        <Part id="surface" ownMaterial explode={[0, 0, 0]}>
          <mesh material={surfaceMat}>
            <sphereGeometry args={[size, Q.seg + 16, Q.seg]} />
          </mesh>
        </Part>
      </group>
      {clouds && (
        <group ref={cloudRef}>
          <Part id="clouds" map={cloudTex} transparent explode={[0, 0.4, 0]}>
            <PartMesh>
              <sphereGeometry args={[size * 1.03, Q.seg + 8, Q.seg]} />
            </PartMesh>
          </Part>
        </group>
      )}
      <Part id="glow" ownMaterial explode={[0, 0, 0]}>
        <mesh material={glowMat}>
          <sphereGeometry args={[size * 1.16, 32, 24]} />
        </mesh>
      </Part>
      {rings && (
        <Part id="rings" map={ringTex} transparent side={THREE.DoubleSide} explode={[0, -0.6, 0]} rotation={[-Math.PI / 2 + 0.2, 0, 0]}>
          <RingMesh inner={size * 1.35} outer={size * 2.1} />
        </Part>
      )}
      <group ref={moonRef}>
        {Array.from({ length: moons }, (_, i) => {
          const a = (i / Math.max(1, moons)) * Math.PI * 2 + 0.6;
          const d = size * (2.5 + i * 0.45);
          return (
            <Part key={i} id="moons" map={moonTex} explode={[Math.cos(a) * 0.8, 0.3, Math.sin(a) * 0.8]} position={[Math.cos(a) * d, (i - 1) * 0.25, Math.sin(a) * d]}>
              <PartMesh>
                <sphereGeometry args={[0.18 + (i % 2) * 0.08, 24, 16]} />
              </PartMesh>
            </Part>
          );
        })}
      </group>
    </group>
  );
}

/** RingGeometry with UVs remapped radially so a 1D stripe texture wraps as bands. */
function RingMesh({ inner, outer }: { inner: number; outer: number }) {
  const geo = useDisposable(() => {
    const g = new THREE.RingGeometry(inner, outer, 96, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    return g;
  }, [inner, outer]);
  return <PartMesh geometry={geo} />;
}
