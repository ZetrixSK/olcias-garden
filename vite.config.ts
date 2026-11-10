import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/** Whether a chunk holds the papers' test pages' own code (which never goes on her phone). */
const isTestPage = (ids: readonly string[]) => ids.some((m) => m.split('\\').join('/').includes('/src/papertest/'));

export default defineConfig({
  build: {
    rollupOptions: {
      input: { main: 'index.html', admin: 'admin.html', 'test-prewritten': 'test-prewritten.html', 'test-gemini': 'test-gemini.html' },
      output: {
        // the papers' test pages' own script gets a name her offline cache skips
        entryFileNames: (chunk) => (isTestPage(chunk.moduleIds) ? 'assets/test-[hash].js' : 'assets/[name]-[hash].js'),
        chunkFileNames: (chunk) => (isTestPage(chunk.moduleIds) ? 'assets/test-[hash].js' : 'assets/[name]-[hash].js'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      // a new version waits, and the page switches to it only while she isn't looking (see main.tsx)
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon-192.png'],
      manifest: {
        name: "Olcia's Garden",
        short_name: "Olcia's garden",
        description: 'A little window garden: pansies, two dogs and the weather outside.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ecdfc9',
        theme_color: '#ecdfc9',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // everything the garden needs is bundled, so it opens fully offline after the first visit
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        navigateFallback: '/index.html',
        // the gardener's page (and the papers' test pages) are never part of her app: not cached on her phone, never answered with the garden
        navigateFallbackDenylist: [/^\/admin/, /^\/test-/],
        globIgnores: ['admin.html', 'assets/admin-*', 'test-*.html', 'assets/test-*'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
