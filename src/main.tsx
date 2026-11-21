// A deployment may remove old hashed lazy chunks while an earlier app shell is open.
// Reload once to fetch the current HTML and chunk manifest; avoid reload loops.
window.addEventListener('vite:preloadError', (event) => {
  const marker = 'bilge-last-chunk-reload';
  const previous = Number(sessionStorage.getItem(marker) || 0);
  if (Date.now() - previous < 30_000) return;
  event.preventDefault();
  sessionStorage.setItem(marker, String(Date.now()));
  window.location.reload();
});

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
