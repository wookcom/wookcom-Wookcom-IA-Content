const CACHE_NAME = 'wookcom-ia-cache-v1';
const APP_SHELL_URLS = [
  '/',
  'index.html',
  'logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Don't cache API calls to Google
  if (request.url.includes('generativelanguage.googleapis.com')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // For other requests, use a cache-first strategy.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return from cache if found
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise, fetch from network, cache, and return
      return fetch(request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // We only cache successful responses
          if(responseToCache.status === 200) {
            cache.put(request, responseToCache);
          }
        });
        return networkResponse;
      });
    })
  );
});
