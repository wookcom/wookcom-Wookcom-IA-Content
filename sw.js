const CACHE_NAME = 'wookcom-ia-cache-v5';
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

const cacheFirst = async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error("Failed to fetch from network and not in cache:", request.url);
    }
};

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    if (event.request.url.includes('generativelanguage.googleapis.com')) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // For navigation requests, try network, but if it fails for any reason (offline, 404), serve index.html.
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(event.request);
                // If the server responds with an error (like 404), don't use it. Fallback to index.html.
                if (!networkResponse.ok) {
                    throw new Error('Response not OK');
                }
                // If the response is good, cache it.
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                // Network failed or returned an error, serve the main app page from the cache.
                const cache = await caches.open(CACHE_NAME);
                return await cache.match('/index.html');
            }
        })());
        return;
    }

    // For all other requests (assets like scripts, styles, images), use a cache-first strategy.
    event.respondWith(cacheFirst(event.request));
});