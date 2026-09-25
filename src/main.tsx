import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App.tsx';
import './styles/theme.css';
import './styles/global.css';

// iOS игнорирует user-scalable=no: без этого щипок масштабирует всю страницу, а не видео.
document.addEventListener('gesturestart', (e) => e.preventDefault());

// Новая версия с сервера подхватывается сразу: страница перезагружается, когда новый service worker готов.
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
