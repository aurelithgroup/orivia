/* Installable app (21 Oct): manifest, icons, one versioned app worker that keeps app pages available offline and never
 * caches API calls, honest offline text, install guidance, push still off. Run: node --experimental-sqlite tests/installable.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createProduction,isAppPath} from '../workers/orivia-production.mjs';
import {isAppPath as doorPath} from '../workers/front-door/index.mjs';

const origin='https://myorivia.app',noDb={prepare(){throw Error('no DB in these checks')}};
const env={PUBLIC_RELEASE:'1',PUBLIC_BETA:'1',PUBLIC_HOST:'myorivia.app',OPENAI_PILOT:'1',OPENAI_API_KEY:'scripted-only',BUDGET_DB:noDb,ACCOUNTS_DB:noDb,TURNSTILE_SITE_KEY:'s',TURNSTILE_SECRET:'s',SESSION_SECRET:'s'.repeat(40),ACCOUNTS_SECRET:'a'.repeat(40),ACCOUNTS_ORIGIN:origin,ACCOUNTS_ENABLED:'1',PILOT_OPENAI_DAY_USD:'5',PILOT_OPENAI_MONTH_USD:'20',OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',ACCOUNTS_EMAIL_DAY_CAP:'10',ACCOUNTS_EMAIL_MONTH_CAP:'100'};
const worker=createProduction(),get=p=>worker.fetch(new Request(origin+p),env,{});

// Manifest: Orivia's name and icons, starts in the app, covers the site so university links and dashboards stay in the app.
const m=await (await get('/manifest.webmanifest')).json();
assert.equal(m.name,'Orivia');assert.equal(m.start_url,'/app');assert.equal(m.id,'/app');assert.equal(m.scope,'/');assert.equal(m.display,'standalone');
assert.equal(m.handle_links,'preferred');assert.deepEqual(m.icons.map(i=>i.sizes+(i.purpose?' '+i.purpose:'')),['192x192','512x512','512x512 maskable']);
for(const i of m.icons){const r=await get(i.src);assert.equal(r.status,200,i.src);assert.equal(r.headers.get('Content-Type'),'image/png');const b=new Uint8Array(await r.arrayBuffer());assert.deepEqual([...b.slice(1,4)],[80,78,71],'a real PNG')}
assert.equal((await get('/app-icons/apple-touch-icon.png')).status,200);assert.equal((await get('/app-icons/nope.png')).status,404);
for(const p of ['/manifest.webmanifest','/orivia-sw.js','/app-icons/icon-192.png'])assert.ok(isAppPath(p)&&doorPath(p),p);

// Page: manifest and icons linked, allowed by the page policy.
const page=await get('/app'),html=await page.text(),csp=page.headers.get('Content-Security-Policy');
assert.match(html,/<link rel="manifest" href="\/manifest\.webmanifest">/);assert.match(html,/<link rel="apple-touch-icon" href="\/app-icons\/apple-touch-icon\.png">/);
assert.match(csp,/manifest-src 'self'/);assert.match(csp,/img-src 'self'/);assert.match(csp,/worker-src 'self'/);
const trial=fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8');assert.match(trial,/script-src 'self'; worker-src 'self'; manifest-src 'self'; style-src 'unsafe-inline'; img-src 'self' data:/,'the pilot page allows them too');

// The worker: versioned per release.
const swRes=await get('/orivia-sw.js'),sw=await swRes.text();assert.equal(swRes.status,200);assert.doesNotMatch(sw,/__VERSION__/);assert.match(sw,/const VERSION='orivia-app-[0-9a-f]{12}'/);

// Its behaviour, run with fake browser parts.
function run(scope,{online=true}={}){
 const handlers={},stored=new Map(),log=[];
 const caches={async open(){return {add:async r=>{stored.set(new URL(r.url||r,origin).pathname,'shell:'+new URL(r.url||r,origin).pathname)},put:async(k,v)=>{stored.set(typeof k==='string'?k:new URL(k.url).pathname,'fresh')}}},async match(k){return stored.has(k)?{cached:stored.get(k)}:undefined},async keys(){return ['orivia-app-old','orivia-public-x']},async delete(k){log.push('deleted '+k)}};
 const self={registration:{scope:origin+scope,showNotification(){}},location:{origin},clients:{claim(){},matchAll:async()=>[]},skipWaiting(){},addEventListener:(t,f)=>handlers[t]=f};
 const ctx={self,caches,URL,Request:class{constructor(u,o){this.url=new URL(u,origin).href;Object.assign(this,o)}},fetch:async()=>{if(!online)throw Error('offline');return {ok:true,type:'basic',clone(){return this},body:'network'}},Promise};
 vm.createContext(ctx);vm.runInContext(sw,ctx);
 const fire=(path,mode='cors',method='GET')=>{let responded=null;handlers.fetch({request:{method,mode,url:origin+path},respondWith:p=>responded=p});return responded};
 return {handlers,stored,log,fire,install:async()=>{let w;handlers.install({waitUntil:p=>w=p});await w},activate:async()=>{let w;handlers.activate({waitUntil:p=>w=p});await w}};
}
let s=run('/app');await s.install();assert.ok(s.stored.has('/app')&&s.stored.has('/chat.js'),'app page and script saved for offline');
for(const p of ['/v1/chat','/api/account/session','/api/me/memberships','/v1/config'])assert.equal(s.fire(p),null,p+' is never touched');
assert.equal(s.fire('/platform','navigate'),null,'dashboards always load from the network');assert.equal(s.fire('/','navigate'),null,'the website is not the app');
assert.equal(s.fire('/v1/chat','cors','POST'),null);assert.notEqual(s.fire('/app','navigate'),null);assert.notEqual(s.fire('/app/space/north-1','navigate'),null,'university spaces open offline too');
s=run('/app',{online:false});await s.install().catch(()=>{});s.stored.set('/app','shell:/app');
assert.deepEqual({...await s.fire('/app/space/north-1','navigate')},{cached:'shell:/app'},'offline: the saved app page');
await s.activate();assert.deepEqual(s.log,['deleted orivia-app-old'],'old app copies removed; other caches left alone');
s=run('/');assert.notEqual(s.fire('/space/north-1','navigate'),null,'pilot spaces');assert.equal(s.fire('/platform','navigate'),null);
assert.doesNotMatch(sw,/localStorage|indexedDB|\/api\/account\/vault/,'nothing personal is cached by the worker');

// Page code: one worker for offline and alerts; honest offline text; install guidance; push still off in production.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),notif=fs.readFileSync('workers/trial-ui/notifications.js','utf8');
assert.match(chat,/navigator\.serviceWorker\.register\('\/orivia-sw\.js',\{scope:APP_SCOPE\}\)/);
assert.ok(chat.includes("if(document.readyState==='complete')setTimeout(registerAppWorker,0);else{window.addEventListener('load',registerAppWorker);setTimeout(registerAppWorker,4000)}"),'registers even if the page already loaded or load is slow');assert.match(notif,/serviceWorker\.register\('\/orivia-sw\.js'/);
assert.match(html,/You’re offline\. Chat and research need a connection; your saved chats, plans and calendar are still here\./);
assert.match(chat,/if\(navigator\.onLine===false\)\{showOffline\(\);\$\('status'\)\.textContent=uiText\('You’re offline\. Your message is still here/);
assert.match(chat,/Add to Home Screen/);assert.match(chat,/beforeinstallprompt/);
assert.equal((await worker.fetch(new Request(origin+'/api/account/notifications/subscription',{method:'POST',headers:{Origin:origin}}),env,{})).status,503,'device push stays off');
console.log('Installable: manifest and icons, versioned app worker (offline app pages, never API calls), honest offline text, install guidance, push off.');
