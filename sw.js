// Offline support: core files are pre-cached; flags are cached as they're used
// (and the app warms the flag cache in the background on first launch).
const CORE = 'flagomat-core-v1';
const FLAGS = 'flagomat-flags-v1';
const CORE_FILES = [
  './', 'index.html', 'css/style.css', 'js/app.js',
  'js/data/countries.js', 'js/data/cities.js', 'js/data/memes.js', 'js/data/facts.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CORE).then((c) => c.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![CORE, FLAGS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/flags/')) {
    // Flags never change: cache first.
    e.respondWith(caches.open(FLAGS).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((res) => { c.put(e.request, res.clone()); return res; }))));
    return;
  }
  // App files: network first so updates show up, cache as fallback for offline.
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CORE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html')))
  );
});
