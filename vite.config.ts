import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

// Туннель cloudflared отдаёт dev-сервер с домена *.trycloudflare.com.
const tunnelHosts = ['.trycloudflare.com'];

const pwa = VitePWA({
  registerType: 'autoUpdate',
  // Иконки и probe.html лежат в public/ и попадают в кэш оболочки через globPatterns.
  workbox: { globPatterns: ['**/*.{js,css,html,png,webmanifest}'] },
  manifest: {
    id: '/',
    name: 'TennisMirror',
    short_name: 'TennisMirror',
    description: 'Тренировка техники настольного тенниса: камера и эталон на одном экране',
    lang: 'ru',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
});

export default defineConfig(({ mode }) => ({
  // `npm run dev:https` — самоподписанный HTTPS: камера на телефоне работает только по HTTPS.
  plugins: [react(), pwa, ...(mode === 'https' ? [basicSsl()] : [])],
  // PORT задаёт панель предпросмотра; если 5173 занят, Vite сам возьмёт следующий свободный.
  server: { port: Number(process.env.PORT) || 5173, allowedHosts: tunnelHosts },
  preview: { allowedHosts: tunnelHosts },
}));
