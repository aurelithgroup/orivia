/* Orivia app service worker (scope: where the app lives: /app on myorivia.app, / on the pilot).
 * Offline, the app's own pages and scripts still open, so saved chats, plans and the calendar (kept in this browser) stay
 * readable. Chat, research, sign-in and every /api or /v1 request always go to the network and are never cached; nothing
 * personal is stored here. Push handlers stay inert unless device alerts are switched on (off in production). */
const VERSION='orivia-app-__VERSION__';
const HOME=new URL(self.registration.scope).pathname.replace(/\/$/,'')||'/';
const SHELL=[HOME,'/chat.js','/inline-calendar.js','/manifest.webmanifest','/app-icons/icon-192.png','/app-icons/icon-512.png','/app-icons/apple-touch-icon.png'];
const inApp=p=>p===HOME||p===HOME+'/'||(HOME==='/'?/^\/space\/[A-Za-z0-9-]{1,64}\/?$/:new RegExp('^'+HOME+'\\/space\\/[A-Za-z0-9-]{1,64}\\/?$')).test(p);
const network=p=>/^\/(api|v1)\//.test(p)||/^\/(platform|manage|join|account-test)/.test(p)||p.startsWith('/cdn-cgi/');

self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(VERSION);
 // Each file separately: one missing file can't stop the app installing.
 await Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload',credentials:'same-origin'})).catch(()=>{})));await self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('orivia-app-')&&k!==VERSION)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 const p=url.pathname;if(network(p))return; // the browser's normal network request: never cached, never faked
 const page=req.mode==='navigate'&&inApp(p),asset=SHELL.includes(p)&&!page;if(!page&&!asset)return;
 // Fresh first; the saved copy only when there's no connection. The page itself shows that it's offline.
 e.respondWith((async()=>{try{const res=await fetch(req);if(res.ok&&res.type==='basic'){const c=await caches.open(VERSION);c.put(page?HOME:p,res.clone())}return res}
  catch(err){const hit=await caches.match(page?HOME:p);if(hit)return hit;throw err}})());
});
// Device alerts (only when switched on): generic text, opening the app.
self.addEventListener('push',event=>{let d={};try{d=event.data.json()}catch(_){}event.waitUntil(self.registration.showNotification('Orivia',{body:typeof d.body==='string'?d.body.slice(0,180):'You have an update in Orivia.',tag:typeof d.tag==='string'?d.tag:'orivia',data:{url:HOME}}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const c=list.find(c=>new URL(c.url).origin===self.location.origin);return c?c.focus():self.clients.openWindow(HOME)}))});
