/**
 * Shared, mutable per-frame values written by animated models and read by the camera rig.
 * Kept outside React state on purpose: these change every frame and must not cause re-renders.
 */
export const actionClock = {
  followY: 0,
  zoomOut: 0,
  shake: 0,
};

export function resetActionClock() {
  actionClock.followY = 0;
  actionClock.zoomOut = 0;
  actionClock.shake = 0;
}
