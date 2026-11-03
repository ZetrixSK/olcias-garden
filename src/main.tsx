import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// only the Latin subsets (Polish letters live in latin-ext), so offline caching stays small
import '@fontsource/kalam/latin-400.css';
import '@fontsource/kalam/latin-ext-400.css';
import '@fontsource/kalam/latin-700.css';
import '@fontsource/kalam/latin-ext-700.css';
import '@fontsource/grenze-gotisch/latin-600.css';
import '@fontsource/grenze-gotisch/latin-ext-600.css';
import './styles.css';
import { App } from './App';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { BouquetGallery, Gallery, IconArt, MarketGallery, PressedGallery, VisitorGallery } from './Gallery';
import { paletteVars } from './theme/palettes';

// the page's safety net (index.html) stands down: the garden has started
(window as Window & { __gardenStarted?: boolean }).__gardenStarted = true;
document.getElementById('boot-note')?.remove();
try {
  sessionStorage.removeItem('garden-boot-retried');
} catch {
  // private browsing: nothing to clear
}

if (import.meta.env.PROD) {
  // The app is kept for offline use. A new version is fetched quietly in the background and takes
  // over only while the app is out of sight (she switched away, or locked the phone), so nothing
  // she is doing is ever interrupted; when she comes back, it is simply the new version.
  void import('virtual:pwa-register').then(({ registerSW }) => {
    let ready = false;
    let switching = false;
    // once the new version has taken over (only ever because it was asked to, out of sight), the
    // page loads it; the plugin itself only does this for some kinds of update
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (switching) window.location.reload();
    });
    const switchNow = () => {
      if (!ready || switching) return;
      switching = true;
      void askToSwitch(true);
    };
    const askToSwitch = registerSW({
      immediate: true,
      onNeedRefresh() {
        ready = true;
        if (document.visibilityState === 'hidden') switchNow();
      },
      onRegisteredSW(_url, registration) {
        let lastLook = Date.now();
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            switchNow();
            return;
          }
          // coming back to it: a look for a new version, at most every half hour
          if (registration && Date.now() - lastLook > 30 * 60_000) {
            lastLook = Date.now();
            void registration.update().catch(() => {});
          }
        });
      },
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {import.meta.env.DEV && location.search.includes('icon') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <IconArt pad={Number(new URLSearchParams(location.search).get('pad') ?? 0.14)} />
      </div>
    ) : import.meta.env.DEV && location.search.includes('marketart') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <MarketGallery />
      </div>
    ) : import.meta.env.DEV && location.search.includes('visitors') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <VisitorGallery />
      </div>
    ) : import.meta.env.DEV && location.search.includes('pressed') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <PressedGallery />
      </div>
    ) : import.meta.env.DEV && location.search.includes('bouquets') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <BouquetGallery />
      </div>
    ) : import.meta.env.DEV && location.search.includes('gallery') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <Gallery />
      </div>
    ) : (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )}
  </StrictMode>,
);
