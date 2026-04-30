/// <reference lib="webworker" />
// @ts-check
/**
 * CivicLens India Service Worker
 * Strategy:
 *  - App shell (HTML, JS, CSS): cache-first with background update
 *  - Data JSON: stale-while-revalidate (fast + fresh)
 *  - Assistant API: network-only (always live)
 */

/** @type {ServiceWorkerGlobalScope} */
const sw = /** @type {any} */ (self);

const CACHE_NAME = 'civiclens-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/tailwind.css',
  '/styles.css',
  '/app.js',
  '/og-image.svg',
  '/modules/journey.js',
  '/modules/simulator.js',
  '/modules/security.js',
  '/modules/quiz.js',
  '/modules/assistant.js',
  '/modules/assistant-utils.js',
  '/modules/security-utils.js',
  '/modules/analytics.js',
  '/modules/config.js',
  '/modules/countdown.js',
  '/modules/firebase-config.js',
  '/modules/quiz-scoring.js',
  '/modules/i18n.js',
  '/data/journey.json',
  '/data/security.json',
  '/data/quiz.json',
];

sw.addEventListener('install', (event) => {
  const e = /** @type {ExtendableEvent} */ (event);
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event) => {
  const e = /** @type {ExtendableEvent} */ (event);
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => sw.clients.claim())
  );
});

sw.addEventListener('fetch', (event) => {
  const e = /** @type {FetchEvent} */ (event);
  const { request } = e;
  const url = new URL(request.url);

  // Never cache the assistant endpoint — always live
  if (
    url.pathname.startsWith('/ask') ||
    url.pathname.startsWith('/csp-report') ||
    url.hostname.includes('cloudfunctions.net')
  ) {
    return;
  }

  // External Firebase SDK requests: network-first with cache fallback
  if (url.hostname === 'www.gstatic.com') {
    e.respondWith(
      fetch(request)
        .then((resp) => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(request).then((r) => r || fetch(request)))
    );
    return;
  }

  // Data files: stale-while-revalidate
  if (url.pathname.endsWith('.json')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((resp) => {
            if (resp.ok) cache.put(request, resp.clone());
            return resp;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // App shell: cache-first
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        if (resp.ok && request.method === 'GET') {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
        }
        return resp;
      });
    })
  );
});
