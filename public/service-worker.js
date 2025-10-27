// ============================================
// Smallsided.com Service Worker
// ============================================

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `smallsided-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `smallsided-dynamic-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to precache on install
const STATIC_ASSETS = [
  '/',
  '/about',
  '/services',
  '/work',
  '/contact',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json',
  '/favicon.ico',
];

// -----------------------------
// INSTALL
// -----------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// -----------------------------
// ACTIVATE
// -----------------------------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![STATIC_CACHE, DYNAMIC_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// -----------------------------
// FETCH HANDLER
// -----------------------------
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests (e.g., POST from forms)
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then(networkRes => {
        // If successful, clone & store dynamically
        const resClone = networkRes.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, resClone));
        return networkRes;
      })
      .catch(async () => {
        // Offline fallback to cache
        const cachedRes = await caches.match(request);
        if (cachedRes) return cachedRes;
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});

// -----------------------------
// OPTIONAL: Message listener (for updates)
// -----------------------------
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
