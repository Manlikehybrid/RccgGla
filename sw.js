// ── RCCG Gospel Light Assembly — Service Worker ──
const CACHE_NAME = 'gla-v1';
const ASSETS = [
  '/', '/index.html', '/about.html', '/sermons.html',
  '/ministries.html', '/units.html', '/events.html',
  '/gallery.html', '/give.html', '/contact.html',
  '/pastor.html', '/history.html', '/youth.html',
  '/stewardship.html', '/bulletin.html', '/404.html',
  '/style.css', '/main.js', '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(ASSETS.map(url => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
