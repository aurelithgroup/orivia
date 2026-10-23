/* ORI-SEC-007 offline integrity and ORI-SEC-008 updates. Runs the real app service worker (app-sw.js) against fake
   caches and network: private API/chat/account pages are never cached or served offline; only the app shell is; old
   versions' caches are removed on activation. Runs the shipped worker-competition filter and checks the update path keeps
   the draft. Browser check: tools/browser-checks/jobs-update.json. Run: node tests/offline-updates.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const code=fs.readFileSync('workers/trial-ui/app-sw.js','utf8').replace('__VERSION__','v2');
function world(scope='https://app.example/'){
 const listeners={},stores=new Map([['orivia-app-v1',new Map()],['other-cache',new Map()]]);let online=true;const fetched=[];
 const caches={async open(n){if(!stores.has(n))stores.set(n,new Map());const m=stores.get(n);return {put:async(k,r)=>m.set(typeof k==='string'?k:new URL(k.url).pathname,r),add:async r=>m.set(new URL(r.url).pathname,new Response('shell'))}},
  async keys(){return [...stores.keys()]},async delete(n){return stores.delete(n)},async match(k){for(const m of stores.values())if(m.has(k))return m.get(k).clone?m.get(k).clone():m.get(k)}};
 const self={registration:{scope,showNotification(){}},location:new URL(scope),addEventListener:(t,f)=>listeners[t]=f,skipWaiting:async()=>{},clients:{claim:async()=>{},matchAll:async()=>[]}};
 const fetchFn=async req=>{fetched.push(new URL(req.url||req).pathname);if(!online)throw new TypeError('offline');const res=new Response('fresh '+new URL(req.url).pathname);Object.defineProperty(res,'type',{value:'basic'});return res};
 const Req=class extends Request{constructor(u,o){super(typeof u==='string'?new URL(u,scope).href:u,o)}};new Function('self','caches','fetch','Request','URL','Response',code)(self,caches,fetchFn,Req,URL,Response);
 const fire=async(type,e)=>{let p;const ev={...e,waitUntil:x=>p=x,respondWith:x=>{ev.responded=true;p=x}};listeners[type](ev);return {responded:!!ev.responded,result:await p}};
 const get=(path,mode='no-cors')=>fire('fetch',{request:{method:'GET',url:new URL(path,scope).href,mode}});
 return {stores,fetched,fire,get,setOnline:v=>online=v};
}
const w=world();
await w.fire('install',{});await w.fire('activate',{});
assert.ok(!w.stores.has('orivia-app-v1'),'old app cache removed');assert.ok(w.stores.has('other-cache'),'unrelated caches kept');
assert.ok(w.stores.get('orivia-app-v2').has('/chat.js'),'shell cached on install');
// Private and account requests: not intercepted at all (browser network only), online or offline.
for(const p of ['/api/account/vault','/v1/chat','/v1/voice','/api/account/files/x','/platform','/manage','/join/abc','/cdn-cgi/x'])
 for(const online of [true,false]){w.setOnline(online);const r=await w.get(p,p.startsWith('/api')||p.startsWith('/v1')?'cors':'navigate');assert.equal(r.responded,false,p+' never served by the worker')}
// Other origins and non-GET: untouched.
assert.equal((await w.fire('fetch',{request:{method:'POST',url:'https://app.example/',mode:'navigate'}})).responded,false);
assert.equal((await w.fire('fetch',{request:{method:'GET',url:'https://cdn.example/chat.js',mode:'no-cors'}})).responded,false);
// The app page: fresh online (and refreshes the copy), saved copy offline.
w.setOnline(true);let r=await w.get('/','navigate');assert.equal(await r.result.text(),'fresh /');
w.setOnline(false);r=await w.get('/','navigate');assert.equal(await r.result.text(),'fresh /','offline: last copy of the shell');
r=await w.get('/space/northbay','navigate');assert.ok(r.responded,'space pages open offline as the app shell');
// Nothing personal ever entered the cache.
for(const m of w.stores.values())for(const k of m.keys())assert.ok(!/^\/(api|v1|platform|manage)/.test(k),'cached '+k);
// /app scope on myorivia.app.
const p=world('https://myorivia.app/app');w2:{await p.fire('install',{});p.setOnline(false);assert.equal((await p.get('/platform','navigate')).responded,false)}
// Worker competition (shipped filter): overlapping scopes with another script are removed; the app worker and other origins kept.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const competing=new Function(chat.slice(chat.indexOf('function competingWorkers('),chat.indexOf('let appWorkerAsked=false;'))+';return competingWorkers')();
const reg=(scope,script)=>({scope,active:{scriptURL:script}});
const regs=[reg('https://myorivia.app/app/','https://myorivia.app/orivia-sw.js'),reg('https://myorivia.app/','https://myorivia.app/orivia-notifications-sw.js'),reg('https://myorivia.app/app/old/','https://myorivia.app/legacy.js'),reg('https://myorivia.app/docs/','https://myorivia.app/docs-sw.js'),reg('https://other.example/','https://other.example/sw.js')];
assert.deepEqual(competing(regs,'https://myorivia.app','/app/').map(r=>r.active.scriptURL),['https://myorivia.app/orivia-notifications-sw.js','https://myorivia.app/legacy.js']);
// Update path: draft kept, reload refused while a file or a reply is pending.
assert.ok(chat.includes("b.onclick=()=>reloadKeepingDraft(n)")&&chat.includes(' restoreUpdateDraft();\n}'));
assert.ok(/if\(busy\)\{[^}]*return false\}/.test(chat)&&chat.includes("if(pendingAttachment){$('status').textContent=uiText('Send or remove your attached file first, then reload."));
console.log('Offline and updates: private requests never cached or served offline, shell only, old caches removed, competing workers removed, drafts kept through updates: pass.');
