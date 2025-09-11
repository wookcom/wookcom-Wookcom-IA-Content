const CACHE_NAME = 'wookcom-ia-cache-v3';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/hooks/useTrainingData.ts',
  '/services/geminiService.ts',
  '/components/ActionCard.tsx',
  '/components/AppHeader.tsx',
  '/components/ConfirmDeleteModal.tsx',
  '/components/ContentGenerator.tsx',
  '/components/CopyAdsGenerator.tsx',
  '/components/Dashboard.tsx',
  '/components/HookCard.tsx',
  '/components/Modal.tsx',
  '/components/SavedHooksView.tsx',
  '/components/SavedScriptsView.tsx',
  '/components/ScriptModal.tsx',
  '/components/TrainingWizard.tsx',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and adding app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => console.error("Cache addAll failed: ", err))
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
        // We don't cache chrome-extension:// requests
        if (request.url.startsWith('chrome-extension://')) {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // We only cache successful responses and non-opaque responses
          if(responseToCache.status === 200 && responseToCache.type !== 'opaque') {
            cache.put(request, responseToCache);
          }
        });
        return networkResponse;
      });
    })
  );
});