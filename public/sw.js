/**
 * CivicLens India Service Worker
 * Strategy:
 *  - App shell (HTML, JS, CSS): cache-first with background update
 *  - Data JSON: stale-while-revalidate (fast + fresh)
 *  - Assistant API: network-only (always live)
 */
const CACHE_NAME = 'civiclens-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/modules/journey.js',
  '/modules/simulator.js',
  '/modules/security.js',
  '/modules/quiz.js',
  '/modules/assistant.js',
  '/modules/security-utils.js',
  '/modules/analytics.js',
  '/data/journey.json',
  '/data/security.json',
  '/data/quiz.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache the assistant endpoint — always live
  if (url.pathname.startsWith('/ask') || url.hostname.includes('cloudfunctions.net')) {
    return;
  }

  // Data files: stale-while-revalidate
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request).then((resp) => {
          if (resp.ok) cache.put(request, resp.clone());
          return resp;
        }).catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
      if (resp.ok && request.method === 'GET') {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
      }
      return resp;
    }))
  );
});
