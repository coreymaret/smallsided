const CACHE_NAME = 'smallsided-cache-v1';
const OFFLINE_URL = '/offline.html';

// List all URLs to precache
const urlsToCache = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/assets/index-CBp0X1ej.js',  // update to your actual JS bundle
  '/assets/index-_TP5rWeT.css', // update to your actual CSS bundle
  '/favicon.ico',
  '/manifest.json',
];

// ===== Install: cache app shell + offline page =====
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page and shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ===== Activate: clean up old caches =====
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// ===== Fetch: network first for navigation, cache first for assets =====
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Ignore browser extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  if (event.request.mode === 'navigate') {
    // Navigation request (SPA route)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          console.log('[ServiceWorker] Serving cached shell');
          return cached;
        }
        return fetch(event.request)
          .catch(() => caches.match(OFFLINE_URL));
      })
    );
  } else {
    // Static assets (JS, CSS, images, etc.)
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
