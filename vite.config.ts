import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Для GitHub Pages: /имя-репозитория/ (задаётся в workflow)
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Мой футбол',
        short_name: 'Мой футбол',
        description: 'Праздничная игра 1 на 1 — подарок на день рождения',
        theme_color: '#2d6a4f',
        background_color: '#1b4332',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: `${base}favicon.svg`,
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: `${base}favicon.svg`,
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
});
