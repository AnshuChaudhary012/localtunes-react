// LocalTunes Production Service Worker
// Enables offline App Shell loading, background asset caching, and offline IndexedDB playback

const CACHE_NAME = 'localtunes-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon/favicon.svg',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png'
];

// Install: Cache essential app shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use individual puts or allSettled to ensure installation succeeds even if an optional icon fails
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (err) {
        console.warn('Non-critical pre-cache issue:', err);
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy dispatcher
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignore non-HTTP/HTTPS schemes (e.g. blob:, chrome-extension:, etc.)
  if (!url.protocol.startsWith('http')) return;

  // 2. EXCLUDE user audio files: local audio is 100% stored & loaded from IndexedDB
  // Never store heavy audio streams in the service worker cache
  if (
    request.destination === 'audio' ||
    url.pathname.match(/\.(mp3|wav|ogg|flac|m4a|aac)$/i)
  ) {
    return;
  }

  // 3. SPA Navigation Requests: Network-first with App Shell fallback
  // Enables direct offline entry to any route (/library, /favorites, /playlists, /settings)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline or network error, serve matching cached route or App Shell
          const cachedRoute = await caches.match(request);
          if (cachedRoute) return cachedRoute;
          return (await caches.match('/index.html')) || (await caches.match('/'));
        })
    );
    return;
  }

  // 4. Same-origin static assets: Stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 5. Google Fonts caching (stale-while-revalidate for offline typography)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
