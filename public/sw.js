// Offline app shell only. Never cache API responses, authentication, or student records.
const CACHE = 'bilge-shell-v1';
const SHELL = ['/', '/icon.svg', '/manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/')));
    return;
  }
  if (url.pathname === '/icon.svg' || url.pathname === '/manifest.webmanifest') {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
  }
});