import { Suspense, lazy, useEffect } from 'react';
import { useRoute } from './router';
import { useProgress } from '@/state/progressStore';
import { useGallery } from '@/state/galleryStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsWide } from '@/hooks/useMediaQuery';
import { Nav, BrandMark } from '@/ui/Nav';
import { Toasts } from '@/ui/Toasts';
import { CelebrationLayer } from '@/ui/CelebrationLayer';
import Onboarding from '@/features/onboarding/Onboarding';
import HomeScreen from '@/features/home/HomeScreen';

// Heavy screens (three.js, drawing engine) load only when first opened.
const ExploreScreen = lazy(() => import('@/features/explore/ExploreScreen'));
const HangarScreen = lazy(() => import('@/features/hangar/HangarScreen'));
const DrawScreen = lazy(() => import('@/features/draw/DrawScreen'));
const ArchiveScreen = lazy(() => import('@/features/archive/ArchiveScreen'));

const HOME_TITLE = 'Indian Space Hub: Space Games & ISRO Missions for Kids';

export function App() {
  const route = useRoute();
  const profile = useProgress((s) => s.profile);
  const reduced = useReducedMotion();
  const wide = useIsWide();
  const loadGallery = useGallery((s) => s.load);

  useEffect(() => { void loadGallery(); }, [loadGallery]);
  useEffect(() => { document.documentElement.classList.toggle('reduce-motion', reduced); }, [reduced]);
  useEffect(() => {
    const titles = { explore: 'Explore', hangar: 'Hangar', draw: 'Draw', archive: 'Mission Archive' } as const;
    // The home title matches the one in index.html, so crawlers that run scripts see the same title as those that don't.
    document.title = route.screen === 'home' ? HOME_TITLE : `${titles[route.screen]} · Indian Space Hub`;
  }, [route.screen]);

  if (!profile) {
    return (
      <div className="shell">
        <main className="shell__main"><Onboarding /></main>
        <Toasts />
      </div>
    );
  }

  // Creative screens go edge to edge on phones and tablets; the desktop rail stays.
  const immersive = (route.screen === 'hangar' || route.screen === 'draw') && !wide;
  const { screen, params } = route;
  return (
    <div className="shell">
      <main className="shell__main" key={screen}>
        <Suspense fallback={<Loader />}>
          {screen === 'home' && <HomeScreen />}
          {screen === 'explore' && <ExploreScreen params={params} />}
          {screen === 'hangar' && <HangarScreen params={params} />}
          {screen === 'draw' && <DrawScreen params={params} />}
          {screen === 'archive' && <ArchiveScreen params={params} />}
        </Suspense>
      </main>
      {!immersive && <Nav current={screen} />}
      <Toasts />
      <CelebrationLayer />
    </div>
  );
}

function Loader() {
  return (
    <div className="loader" role="status">
      <div className="loader__mark"><BrandMark size={72} /></div>
      <span>Getting ready for launch…</span>
    </div>
  );
}
