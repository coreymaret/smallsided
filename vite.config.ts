import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon-32x32.png',
        'favicon-16x16.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'Small Sided Soccer',
        short_name: 'SmallSided',
        description: 'Your go-to site for small-sided soccer enthusiasts',
        theme_color: '#15141a',
        background_color: '#15141a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^\/.*\.(?:js|css|html|json)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'local-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
              },
            },
          },
        ],
      },
    }),
  ],
});
