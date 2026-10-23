/* Orivia website service worker. Keeps the previous version (legacy.html) working offline, as it did before the new
   app, and fetches pages fresh when online. Saved progress lives in localStorage and is never touched here. */
const VERSION='orivia-public-20261020b';
const LEGACY=['legacy.html','index.html','css/app.css','manifest.webmanifest','icons/favicon.svg','icons/favicon-32.png','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','icons/qr-dubai.png','icons/logo-mark.svg','img/gate-please-wait.jpg','img/gate-card-not-valid.jpg','img/station-sign.jpg',
 'js/content.js','js/content-edinburgh.js','js/content-uae-eid.js','js/photos.js','js/staff-phrases.js','js/i18n/fr.js','js/i18n/fil.js','js/i18n/hi.js','js/i18n/ur.js','js/i18n/zh.js','js/i18n/ru.js','js/i18n/bn.js','js/i18n/ml.js',
 'js/analytics.js','js/partners.js','js/places.js','js/expiry.js','js/ask.js','js/navigation.js','js/shell.js','js/voice.js','js/simple.js','js/smart.js','js/journey-student.js','js/qa.js','js/context.js','js/app.js'];
// Each file is cached on its own, so one missing file can't stop the worker installing.
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>Promise.all(LEGACY.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('orivia-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Same-origin files: network first so updates arrive; the cached copy when offline. Other sites (the new app, fonts) are untouched.
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();e.waitUntil(caches.open(VERSION).then(cache=>cache.put(e.request,c)))}return r})
  .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||(e.request.mode==='navigate'?caches.match('legacy.html').then(l=>l||Response.error()):Response.error()))));
});
