import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS, type PlanetInfo } from '@/content/planets';
import { SpaceCanvas } from '@/engine3d/SpaceCanvas';
import { CameraRig } from '@/engine3d/CameraRig';
import { useDisposable } from '@/engine3d/useDisposable';
import { getSoftDot, makePlanetCanvas, makeRingCanvas, toTexture } from '@/engine3d/textures';
import { Q } from '@/engine3d/quality';

/**
 * A playful orrery (not to scale): tap any world to fly to it.
 * Time pauses while a world is focused so small hands can keep it in view.
 */
interface Props {
  focusId: string | null;
  onFocus: (id: string) => void;
  paused: boolean;
  resetKey: number;
  reducedMotion: boolean;
  /** Height in px of the info card covering the bottom of the canvas (0 when none). */
  bottomInset?: number;
}

const focusVec = new THREE.Vector3();

export function SolarSystemScene({ focusId, onFocus, paused, resetKey, reducedMotion, bottomInset = 0 }: Props) {
  const positions = useRef<Record<string, THREE.Vector3>>({});
  const [, force] = useState(0);
  const focus = focusId ? positions.current[focusId] ?? null : null;
  // Opened already focused on a world (a deep link): wait until it has a real position, then fly there.
  useEffect(() => {
    if (!focusId) return;
    let raf = 0, tries = 0;
    const ready = () => {
      const p = positions.current[focusId];
      return !!p && (focusId === 'sun' || p.lengthSq() > 0);
    };
    const wait = () => {
      if (ready()) force((n) => n + 1);
      else if (tries++ < 120) raf = requestAnimationFrame(wait);
    };
    raf = requestAnimationFrame(wait);
    return () => cancelAnimationFrame(raf);
  }, [focusId]);
  return (
    <SpaceCanvas camera={{ position: [0, 14, 22], fov: 45 }} label="3D Solar System. Drag to look around, pinch to zoom, tap a planet to visit it.">
      <CameraRig
        position={[0, 14, 22]}
        target={[0, 0, 0]}
        min={2}
        max={46}
        resetKey={resetKey}
        autoRotate={!reducedMotion && !focusId}
        focus={focus ? focusVec.copy(focus) : null}
        bottomInset={bottomInset}
        focusDistance={focusId === 'sun' ? 7 : focusId === 'jupiter' || focusId === 'saturn' ? 4.5 : 2.8}
      />
      <Sun onTap={() => onFocus('sun')} positions={positions.current} />
      {PLANETS.map((p) => (
        <Planet key={p.id} info={p} paused={paused || !!focusId} positions={positions.current} onTap={() => { onFocus(p.id); force((n) => n + 1); }} onMoon={() => { onFocus('moon'); force((n) => n + 1); }} />
      ))}
    </SpaceCanvas>
  );
}

function tapHandlers(onTap: () => void) {
  let start: { x: number; y: number } | null = null;
  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      start = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
    },
    onPointerUp: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (start && Math.hypot(e.nativeEvent.clientX - start.x, e.nativeEvent.clientY - start.y) < 10) onTap();
      start = null;
    },
    onPointerOver: () => (document.body.style.cursor = 'pointer'),
    onPointerOut: () => (document.body.style.cursor = ''),
  };
}

function Sun({ onTap, positions }: { onTap: () => void; positions: Record<string, THREE.Vector3> }) {
  const glow = useDisposable(() => new THREE.SpriteMaterial({ map: getSoftDot(), color: '#FFB347', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const handlers = useMemo(() => tapHandlers(onTap), [onTap]);
  positions.sun = positions.sun ?? new THREE.Vector3(0, 0, 0);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * 0.05));
  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={60} distance={60} decay={1.4} color="#fff1d6" />
      <mesh ref={ref} {...handlers}>
        <sphereGeometry args={[1.7, 40, 40]} />
        <meshBasicMaterial color="#FFC93C" />
      </mesh>
      <sprite scale={[7, 7, 1]} material={glow} />
    </group>
  );
}

function Planet({
  info, paused, positions, onTap, onMoon,
}: { info: PlanetInfo; paused: boolean; positions: Record<string, THREE.Vector3>; onTap: () => void; onMoon: () => void }) {
  const tex = useDisposable(() => {
    const style = info.bands ? 'gas' : info.id === 'earth' ? 'ocean' : 'rocky';
    const c = makePlanetCanvas(info.colors[0], style, info.id.length * 31, Q.texture / 2);
    return toTexture(c, true);
  }, [info]);
  const ringTex = useDisposable(() => toTexture(makeRingCanvas(3)), []);
  const orbitGeo = useDisposable(() => {
    const pts = Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * info.orbit, 0, Math.sin(a) * info.orbit);
    });
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [info.orbit]);
  const orbitMat = useDisposable(() => new THREE.LineBasicMaterial({ color: '#6c74c9', transparent: true, opacity: 0.28 }), []);
  const orbitLine = useMemo(() => new THREE.LineLoop(orbitGeo, orbitMat), [orbitGeo, orbitMat]);

  const holder = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const moon = useRef<THREE.Group>(null);
  const angle = useRef(info.orbit * 1.7);
  positions[info.id] = positions[info.id] ?? new THREE.Vector3();
  if (info.id === 'earth') positions.moon = positions.moon ?? new THREE.Vector3();
  const handlers = useMemo(() => tapHandlers(onTap), [onTap]);
  const moonHandlers = useMemo(() => tapHandlers(onMoon), [onMoon]);

  useFrame((_, dt) => {
    if (!paused) angle.current += dt * info.speed * 0.25;
    const a = angle.current;
    holder.current?.position.set(Math.cos(a) * info.orbit, 0, Math.sin(a) * info.orbit);
    if (holder.current) positions[info.id].copy(holder.current.position);
    if (body.current) body.current.rotation.y += dt * 0.4;
    if (moon.current) {
      if (!paused) moon.current.rotation.y += dt * 0.9;
      const m = moon.current.children[0];
      if (m) m.getWorldPosition(positions.moon);
    }
  });

  // Invisible, larger hit sphere so small planets are easy to tap on phones.
  const hitR = Math.max(info.radius * 1.6, 0.7);
  return (
    <group>
      <primitive object={orbitLine} />
      <group ref={holder}>
        <mesh ref={body}>
          <sphereGeometry args={[info.radius, Q.seg, Q.seg - 8]} />
          <meshStandardMaterial map={tex} roughness={0.85} />
        </mesh>
        <mesh {...handlers}>
          <sphereGeometry args={[hitR, 12, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {info.rings && (
          <mesh rotation={[-Math.PI / 2 + 0.35, 0, 0]}>
            <ringGeometry args={[info.radius * 1.35, info.radius * 2.2, 64]} />
            <meshStandardMaterial map={ringTex} color={info.rings} transparent side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}
        {info.id === 'earth' && (
          <group ref={moon}>
            <group position={[1.05, 0.1, 0]}>
              <mesh>
                <sphereGeometry args={[0.14, 20, 14]} />
                <meshStandardMaterial color="#D8D9E2" roughness={1} />
              </mesh>
              <mesh {...moonHandlers}>
                <sphereGeometry args={[0.4, 10, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            </group>
          </group>
        )}
      </group>
    </group>
  );
}
