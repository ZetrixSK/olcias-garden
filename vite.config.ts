import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      input: { main: 'index.html', admin: 'admin.html' },
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
        // the gardener's page is never part of her app: not cached on her phone, never answered with the garden
        navigateFallbackDenylist: [/^\/admin/],
        globIgnores: ['admin.html', 'assets/admin-*'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
