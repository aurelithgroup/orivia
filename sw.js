/* Upgrade the old Orivia shell without touching saved user data. */
const VERSION='orivia-public-20261020';
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('orivia-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Network-first navigation. The new app manages its own storage on its own origin.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.mode!=='navigate')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();e.waitUntil(caches.open(VERSION).then(cache=>cache.put(e.request,c)))}return r}).catch(()=>caches.match(e.request)))});
