import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/kalam/latin-400.css';
import '@fontsource/kalam/latin-ext-400.css';
import '@fontsource/kalam/latin-700.css';
import '@fontsource/kalam/latin-ext-700.css';
import '@fontsource/grenze-gotisch/latin-600.css';
import '@fontsource/grenze-gotisch/latin-ext-600.css';
import '../styles.css';
import './admin.css';
import { AdminApp } from './AdminApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
