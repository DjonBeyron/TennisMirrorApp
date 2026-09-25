import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles/theme.css';
import './styles/global.css';

// iOS игнорирует user-scalable=no: без этого щипок масштабирует всю страницу, а не видео.
document.addEventListener('gesturestart', (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
