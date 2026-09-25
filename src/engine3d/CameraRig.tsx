import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { actionClock } from './actionClock';

interface CameraRigProps {
  position: [number, number, number];
  target: [number, number, number];
  min: number;
  max: number;
  /** Changing this number animates the camera back to its home view. */
  resetKey: number;
  autoRotate: boolean;
  /** Optional: a world position the camera should glide to focus on (explorer). */
  focus?: THREE.Vector3 | null;
  focusDistance?: number;
}

/**
 * Touch-first orbit camera: one finger rotates, two fingers pinch to zoom, no panning
 * (panning confuses young children). Idle auto-rotate kicks in after a few seconds untouched.
 */
export function CameraRig({ position, target, min, max, resetKey, autoRotate, focus, focusDistance = 4 }: CameraRigProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  // Tall phone screens need the camera a little further back so tall rockets fit, with room for the tool sheet.
  const aspect = size.width / Math.max(1, size.height);
  const fit = aspect < 0.75 ? 1.38 : aspect < 1 ? 1.15 : 1;
  const home = (): [number, number, number] => [
    target[0] + (position[0] - target[0]) * fit,
    target[1] + (position[1] - target[1]) * fit,
    target[2] + (position[2] - target[2]) * fit,
  ];
  const homePos = useRef(new THREE.Vector3(...home()));
  const homeTarget = useRef(new THREE.Vector3(...target));
  const flying = useRef(0);
  const lastTouch = useRef(performance.now());
  const tmp = useRef(new THREE.Vector3());

  useEffect(() => {
    homePos.current.set(...home());
    homeTarget.current.set(...target);
    flying.current = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, target, resetKey, fit]);

  useEffect(() => {
    camera.position.set(...home());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    const k = 1 - Math.pow(0.02, dt);
    if (focus) {
      tmp.current.copy(camera.position).sub(c.target).setLength(focusDistance);
      c.target.lerp(focus, k);
      camera.position.lerp(tmp.current.add(focus), k * 0.6);
    } else if (flying.current > 0) {
      c.target.lerp(homeTarget.current, k);
      camera.position.lerp(homePos.current, k);
      if (camera.position.distanceTo(homePos.current) < 0.02) flying.current = 0;
    }
    // Follow animated action (e.g. a rocket climbing) and pull out for wide shots.
    if (actionClock.followY > 0 || actionClock.zoomOut > 0) {
      const ty = homeTarget.current.y + actionClock.followY * 0.85;
      c.target.y += (ty - c.target.y) * k;
      const want = homePos.current.clone().sub(homeTarget.current).multiplyScalar(1 + actionClock.zoomOut);
      want.y += actionClock.followY * 0.85 + homeTarget.current.y;
      want.x += homeTarget.current.x;
      want.z += homeTarget.current.z;
      camera.position.lerp(want, k * 0.8);
    }
    if (actionClock.shake > 0) {
      camera.position.x += (Math.random() - 0.5) * actionClock.shake * 0.03;
      camera.position.y += (Math.random() - 0.5) * actionClock.shake * 0.03;
    }
    c.autoRotate = autoRotate && !focus && performance.now() - lastTouch.current > 5000;
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.12}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      minDistance={min}
      maxDistance={max}
      autoRotateSpeed={0.8}
      target={target}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
      onStart={() => {
        lastTouch.current = performance.now();
        flying.current = 0;
      }}
      onEnd={() => (lastTouch.current = performance.now())}
    />
  );
}
