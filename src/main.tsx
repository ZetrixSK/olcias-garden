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
import { Gallery, IconArt } from './Gallery';
import { paletteVars } from './theme/palettes';

if (import.meta.env.PROD) {
  // caches the app for offline use and quietly picks up new versions on the next open
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {import.meta.env.DEV && location.search.includes('icon') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <IconArt pad={Number(new URLSearchParams(location.search).get('pad') ?? 0.14)} />
      </div>
    ) : import.meta.env.DEV && location.search.includes('gallery') ? (
      <div className="garden" style={paletteVars('cozy', { sky: 'clear', night: false })}>
        <Gallery />
      </div>
    ) : (
      <App />
    )}
  </StrictMode>,
);
