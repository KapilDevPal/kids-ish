import { Suspense, useEffect, type MutableRefObject, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Q } from './quality';
import { StarField } from './StarField';
import { encodeCanvas } from '@/persistence/exportImage';

export type CaptureFn = () => string;

/** Generates a soft studio environment locally (no network) so metal and gloss finishes shine. */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Capturer({ captureRef }: { captureRef: MutableRefObject<CaptureFn | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    captureRef.current = () => {
      gl.render(scene, camera);
      return encodeCanvas(gl.domElement, 1200, '#0F1438');
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, scene, camera, captureRef]);
  return null;
}

function AdaptiveDpr() {
  const setDpr = useThree((s) => s.setDpr);
  return (
    <PerformanceMonitor
      onDecline={() => setDpr(Q.dpr[0])}
      onIncline={() => setDpr(Q.dpr[1])}
      flipflops={3}
    />
  );
}

interface SpaceCanvasProps {
  children: ReactNode;
  camera: { position: [number, number, number]; fov?: number };
  captureRef?: MutableRefObject<CaptureFn | null>;
  background?: string;
  label: string;
}

/**
 * The shared 3D stage: renderer settings tuned for phones, starfield, lights, studio reflections,
 * adaptive resolution and optional screenshot capture.
 */
export function SpaceCanvas({ children, camera, captureRef, background = '#0F1438', label }: SpaceCanvasProps) {
  return (
    <Canvas
      aria-label={label}
      role="img"
      dpr={Q.dpr}
      gl={{ antialias: Q.antialias, powerPreference: 'high-performance', alpha: false }}
      camera={{ position: camera.position, fov: camera.fov ?? 40, near: 0.1, far: 400 }}
      style={{ touchAction: 'none' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[background, 60, 140]} />
      <hemisphereLight args={['#c9d6ff', '#2a1a4a', 0.65]} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} color="#fff4e0" />
      <directionalLight position={[-6, 3, -5]} intensity={0.7} color="#7aa8ff" />
      <StarField />
      <StudioEnvironment />
      <AdaptiveDpr />
      {captureRef && <Capturer captureRef={captureRef} />}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
