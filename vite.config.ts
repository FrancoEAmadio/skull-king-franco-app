import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Se actualiza sola en segundo plano y funciona sin conexión (cartas y manual incluidos).
      registerType: 'autoUpdate',
      manifest: {
        name: 'Skull King — Anotador de Puntos',
        short_name: 'Skull King',
        description: 'Anotador de puntos y manual para Skull King.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#090d16',
        theme_color: '#090d16',
        icons: [
          { src: 'archivos/iconos/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'archivos/iconos/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'archivos/iconos/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-estilos' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-archivos',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
