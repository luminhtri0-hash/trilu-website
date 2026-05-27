// Trí Lữ Nihongo Service Worker v1
const CACHE = 'trilu-v1';
const APP_SHELL = ['/icon-32.png','/icon-180.png','/icon-192.png','/icon-512.png','/manifest.json','/nav.js','/offline.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // skip cross-origin
  
  // HTML pages: network-first
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(() => caches.match(req).then(r => r || caches.match('/offline.html')))
    );
    return;
  }
  
  // Assets: cache-first
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      if (resp.ok) { const c = resp.clone(); caches.open(CACHE).then(ch => ch.put(req, c)); }
      return resp;
    }))
  );
});
