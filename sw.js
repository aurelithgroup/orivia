/* Orivia service worker: keeps the app and its journeys available offline.
   Bump VERSION whenever you publish changes so phones pick up the new files. */
const VERSION = 'orivia-v26';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/content.js', 'js/content-edinburgh.js', 'js/analytics.js', 'js/partners.js', 'js/places.js', 'js/expiry.js', 'js/ask.js', 'js/context.js', 'js/app.js', 'js/i18n/fr.js', 'js/i18n/fil.js', 'js/i18n/hi.js', 'js/i18n/ur.js', 'manifest.webmanifest', 'icons/favicon.svg', 'icons/favicon-32.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/qr-dubai.png', 'icons/logo-mark.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  // Our own files: network first so updates arrive, cache as fallback when offline.
  if(url.origin === location.origin){
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match('index.html'))));
    return;
  }
  // Fonts: cache after first use.
  if(url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    })));
  }
});
