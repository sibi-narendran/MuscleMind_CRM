const CACHE_NAME = 'dental-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/fonts/main-font.woff2',
  '/assets/images/tooth-logo.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});
