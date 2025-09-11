const CACHE_NAME = 'wookcom-ia-cache-v4';
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
  '/components/icons/BookmarkIcon.tsx',
  '/components/icons/CheckIcon.tsx',
  '/components/icons/ChevronLeftIcon.tsx',
  '/components/icons/ChevronRightIcon.tsx',
  '/components/icons/CopyIcon.tsx',
  '/components/icons/EditIcon.tsx',
  '/components/icons/MagicWandIcon.tsx',
  '/components/icons/PencilIcon.tsx',
  '/components/icons/SpinnerIcon.tsx',
  '/components/icons/TrashIcon.tsx',
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

  // Skip non-GET requests, API calls, and browser extensions, and let the browser handle them.
  if (request.method !== 'GET' || request.url.includes('generativelanguage.googleapis.com') || request.url.startsWith('chrome-extension://')) {
    event.respondWith(fetch(request));
    return;
  }

  // For all other GET requests, use a cache-first strategy with a fallback for navigation.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return from cache if found.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from the network.
      return fetch(request).then((networkResponse) => {
        // A response from the network was received.
        // Cache it for future offline use if it's a valid response.
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // This block executes when the network fetch fails (e.g., user is offline).
        // If the failed request was a navigation request (e.g., loading the app),
        // serve the main app page as a fallback to prevent a 404 error.
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // For other failed requests (like images or scripts not in cache), the request will fail,
        // which is expected when offline and the asset isn't cached.
      });
    })
  );
});