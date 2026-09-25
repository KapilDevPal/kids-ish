import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useHangar } from '@/state/hangarStore';
import type { PartPaint } from '@/state/types';
import { track } from '@/state/gameplay';

/**
 * <Part> is the building block of every paintable model.
 * It owns one material driven by the part's paint (colour + finish), handles tap-to-paint,
 * hover and selection highlight, a squash-and-stretch "boing" when painted, and exploded-view offsets.
 * Model authors just place <PartMesh> children inside it.
 */
const PartMaterialCtx = createContext<THREE.MeshStandardMaterial | null>(null);

export function applyFinish(m: THREE.MeshStandardMaterial, p: PartPaint) {
  m.color.set(p.color);
  switch (p.finish) {
    case 'metal':
      m.metalness = 0.85;
      m.roughness = 0.28;
      m.emissive.set('#000000');
      m.emissiveIntensity = 0;
      break;
    case 'matte':
      m.metalness = 0;
      m.roughness = 0.92;
      m.emissive.set('#000000');
      m.emissiveIntensity = 0;
      break;
    case 'glow':
      m.metalness = 0;
      m.roughness = 0.4;
      m.emissive.set(p.color);
      m.emissiveIntensity = 1.1;
      break;
    default:
      m.metalness = 0.08;
      m.roughness = 0.3;
      m.emissive.set('#000000');
      m.emissiveIntensity = 0;
  }
  m.needsUpdate = true;
}

interface PartProps {
  id: string;
  children: ReactNode;
  /** Offset applied in exploded view. */
  explode?: [number, number, number];
  map?: THREE.Texture | null;
  transparent?: boolean;
  side?: THREE.Side;
  /** When true, children manage their own materials; Part only handles interaction. */
  ownMaterial?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const TAP_MOVE = 8;
const TAP_MS = 450;

export function Part({ id, children, explode, map, transparent, side, ownMaterial, position, rotation }: PartProps) {
  const paint = useHangar((s) => s.paint[id]);
  const material = useMemo(() => new THREE.MeshStandardMaterial(), []);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    if (paint) applyFinish(material, paint);
  }, [material, paint]);
  useEffect(() => {
    material.map = map ?? null;
    material.transparent = !!transparent;
    material.depthWrite = !transparent;
    material.side = side ?? THREE.FrontSide;
    material.needsUpdate = true;
  }, [material, map, transparent, side]);

  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const down = useRef<{ x: number; y: number; t: number } | null>(null);
  const base = useMemo(() => new THREE.Vector3(...(position ?? [0, 0, 0])), [position]);
  const offset = useMemo(() => new THREE.Vector3(...(explode ?? [0, 0, 0])), [explode]);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const s = useHangar.getState();
    const g = outer.current;
    const k = inner.current;
    if (!g || !k) return;
    target.copy(base);
    if (s.explode) target.add(offset);
    g.position.lerp(target, 1 - Math.pow(0.001, dt));

    // Boing after painting
    const since = (performance.now() - (s.paintedAt[id] ?? -1e9)) / 1000;
    const boing = since < 0.6 ? Math.sin(since * 22) * Math.exp(-since * 7) * 0.09 : 0;
    k.scale.set(1 + boing, 1 - boing, 1 + boing);

    // Highlight: gentle pulse when selected, soft lift on hover
    if (!ownMaterial && paint) {
      const sel = s.selected === id && performance.now() - s.selectedAt < 4000;
      const glow = paint.finish === 'glow' ? 1.1 : 0;
      const pulse = sel ? 0.18 + Math.sin(performance.now() / 180) * 0.1 : hovered.current ? 0.12 : 0;
      if (pulse > 0 && paint.finish !== 'glow') {
        material.emissive.set(paint.color);
        material.emissiveIntensity = pulse;
      } else if (paint.finish !== 'glow' && material.emissiveIntensity !== 0) {
        material.emissive.set('#000000');
        material.emissiveIntensity = 0;
      } else if (paint.finish === 'glow') {
        material.emissiveIntensity = glow + pulse;
      }
    }
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY, t: performance.now() };
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const d = down.current;
    down.current = null;
    if (!d) return;
    const moved = Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y);
    if (moved > TAP_MOVE || performance.now() - d.t > TAP_MS) return;
    const s = useHangar.getState();
    if (s.phase === 'running' || s.phase === 'countdown') return;
    s.paintPart(id, [e.point.x, e.point.y, e.point.z]);
    if (s.modelId) track({ type: 'paint', modelId: s.modelId, finish: s.brush.finish });
  };

  return (
    <PartMaterialCtx.Provider value={ownMaterial ? null : material}>
      <group
        ref={outer}
        position={position}
        rotation={rotation}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = '';
        }}
      >
        <group ref={inner}>{children}</group>
      </group>
    </PartMaterialCtx.Provider>
  );
}

/** A mesh that uses its enclosing Part's material. Accepts any normal <mesh> props. */
export function PartMesh(props: JSX.IntrinsicElements['mesh']) {
  const material = useContext(PartMaterialCtx);
  return <mesh castShadow={false} receiveShadow={false} material={material ?? undefined} {...props} />;
}
