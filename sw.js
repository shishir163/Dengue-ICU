// Offline shell. Content itself comes from Firestore's own offline cache.
const V = 'dengue-icu-v2';
const SHELL = ['./', 'index.html', 'app.js', 'style.css', 'firebase-config.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  'fonts/lato-latin-400-normal.woff2', 'fonts/lato-latin-700-normal.woff2', 'fonts/lato-latin-900-normal.woff2',
  'fonts/roboto-latin-400-normal.woff2', 'fonts/roboto-latin-700-normal.woff2',
  'fonts/poppins-latin-400-normal.woff2', 'fonts/poppins-latin-700-normal.woff2',
  'fonts/noto-sans-bengali-bengali-400-normal.woff2', 'fonts/noto-sans-bengali-bengali-700-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Firebase / Google calls go straight to the network
  const isStatic = /\/(fonts|icons)\//.test(url.pathname);
  if (isStatic) { e.respondWith(caches.match(req).then(h => h || fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); return r; }))); return; }
  // app files: network first (so updates arrive), cache as fallback (so it works offline)
  e.respondWith(fetch(req).then(r => { if (r && r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); } return r; })
    .catch(() => caches.match(req).then(h => h || (req.mode === 'navigate' ? caches.match('index.html') || caches.match('./') : Response.error()))));
});
