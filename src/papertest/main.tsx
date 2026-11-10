import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/kalam/latin-400.css';
import '@fontsource/kalam/latin-ext-400.css';
import '../styles.css';
import './papertest.css';
import { paletteVars } from '../theme/palettes';
import { TestGemini, TestPrewritten } from './PaperTest';

/** The papers' test pages, kept out of her app: /test-prewritten and /test-gemini. */
const gemini = location.pathname.includes('test-gemini');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="garden papertest-root" style={paletteVars('cozy', { sky: 'clear', night: false })}>
      {gemini ? <TestGemini /> : <TestPrewritten />}
    </div>
  </StrictMode>,
);
