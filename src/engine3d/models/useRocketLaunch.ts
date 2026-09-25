import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { useHangar } from '@/state/hangarStore';
import { actionClock } from '../actionClock';

/**
 * Drives a rocket launch: ignition rumble, a slow then accelerating climb,
 * strap-on boosters separating and tumbling away, camera follow, then a gentle reset.
 */
export function useRocketLaunch(opts: {
  vehicle: React.RefObject<THREE.Group>;
  boosters: React.MutableRefObject<(THREE.Group | null)[]>;
  boosterBase: [number, number][];
  separateAt: number;
  duration: number;
}) {
  const detachY = useRef(0);
  const flameOn = useRef(false);
  useFrame(() => {
    const s = useHangar.getState();
    const v = opts.vehicle.current;
    if (!v) return;
    if (s.phase !== 'running') {
      // settle back on the pad
      v.position.y += (0 - v.position.y) * 0.2;
      v.position.x = 0;
      v.rotation.z = 0;
      opts.boosters.current.forEach((b, i) => {
        if (!b) return;
        const [x, z] = opts.boosterBase[i] ?? [0, 0];
        b.position.set(x, 0, z);
        b.rotation.set(0, 0, 0);
      });
      flameOn.current = false;
      if (s.phase === 'idle') {
        actionClock.followY = 0;
        actionClock.shake = 0;
      }
      return;
    }
    const t = (performance.now() - s.phaseStart) / 1000;
    flameOn.current = true;
    const climb = Math.max(0, t - 0.9);
    const y = 0.35 * climb * climb + 0.2 * climb;
    v.position.y = y;
    v.position.x = t < 0.9 ? (Math.random() - 0.5) * 0.03 : 0;
    v.rotation.z = climb > 1.5 ? Math.min(0.12, (climb - 1.5) * 0.04) : 0; // gentle pitch-over
    actionClock.followY = Math.min(y, 22);
    actionClock.shake = t < 2 ? 1 - t / 2 : 0;

    if (t < opts.separateAt) detachY.current = y;
    opts.boosters.current.forEach((b, i) => {
      if (!b) return;
      const [x, z] = opts.boosterBase[i] ?? [0, 0];
      if (t < opts.separateAt) {
        b.position.set(x, 0, z);
        return;
      }
      const f = t - opts.separateAt;
      const out = 1 + f * 0.9;
      b.position.set(x * out, -(y - detachY.current) - f * f * 1.4, z * out);
      b.rotation.set(z * f * 0.8, 0, -x * f * 0.8);
    });

    if (t > opts.duration) useHangar.getState().setPhase('done');
  });
  return flameOn;
}
