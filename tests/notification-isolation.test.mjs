/* Notification isolation (22 Oct, after Ina's live check): the pilot scheduler runs only against the pilot's own test
   database; counters say what the push service did, never "sent"; lock screens show only fixed generic text.
   Run: node --experimental-sqlite tests/notification-isolation.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {runNotificationTick} from '../workers/accounts/notifications.mjs';

// Off or missing keys: nothing attempted, and the result names each outcome (no "sent").
const none=await runNotificationTick({NOTIFICATIONS_ENABLED:'0'});
assert.deepEqual(none,{attempted:0,accepted:0,failed:0,expired:0,uncertain:0});
const src=fs.readFileSync('workers/accounts/notifications.mjs','utf8');assert.doesNotMatch(src,/\bsent\+\+|return \{sent\}/);
assert.match(src,/counts\.uncertain\+\+/);
// Founder test 22 Oct: every alert was uncertain because Workers reject redirect:'error' before sending anything.
assert.doesNotMatch(src,/redirect:'error'/);assert.match(src,/redirect:'manual'/);assert.ok(src.includes("note('prepare',e)"),'a failure before sending is failed, not uncertain');assert.match(src,/counts\.expired\+\+/);

// The pilot entry: its scheduler needs the pilot's explicit setting naming its own test database.
const entry=fs.readFileSync('workers/pilot/index.mjs','utf8');
assert.match(entry,/export const PILOT_ACCOUNTS_DB='8cd85061-ce42-4fa7-8dd7-a4b01f36800a';/);
assert.match(entry,/if\(env\.NOTIFICATION_SCHEDULER!=='pilot'\|\|env\.ACCOUNTS_DB_EXPECTED!==PILOT_ACCOUNTS_DB\)return;/);
const cfg=fs.readFileSync('workers/pilot/wrangler.jsonc','utf8');
// The accounts database itself is bound on the live pilot only; the deploy script refuses unless it is this test database
// AND equals ACCOUNTS_DB_EXPECTED.
assert.match(cfg,/"ACCOUNTS_DB_EXPECTED": "8cd85061-ce42-4fa7-8dd7-a4b01f36800a"/);
assert.doesNotMatch(cfg,/3ebd10d5-01e5-4a01-b846-977f1bb2d5b3/,'never production’s accounts database');
// Production keeps device push off and has no scheduler of its own.
const prod=fs.readFileSync('workers/orivia-production.mjs','utf8');assert.match(prod,/async scheduled\(event,env,ctx\)\{\/\* Push is off in production: nothing to deliver\. \*\/\}/);
assert.match(prod,/PUSH_PUBLIC_KEY:'',PUSH_PRIVATE_KEY:''/);

// The app worker shows only fixed generic text on the lock screen, whatever a push contains.
const sw=fs.readFileSync('workers/trial-ui/app-sw.js','utf8').replace('__VERSION__','test');
const shown=[];const listeners={};
const self={registration:{scope:'https://pilot.example/',showNotification:(t,o)=>{shown.push(o.body);return Promise.resolve()}},location:{origin:'https://pilot.example'},clients:{matchAll:async()=>[],openWindow:async()=>{}},
 addEventListener:(k,f)=>{listeners[k]=f},skipWaiting(){}};
vm.createContext({self,caches:{},fetch,URL,Response,Request,Promise});vm.runInContext(sw,vm.createContext({self,caches:{open:async()=>({addAll:async()=>{}}),keys:async()=>[],match:async()=>null},fetch,URL,Response,Request,Promise,console}));
const push=body=>new Promise(res=>listeners.push({data:{json:()=>({body})},waitUntil:p=>p.then(res)}));
await push('Your visa appointment at 10:00 with passport number X1234567');await push('Vous avez un rappel ou une actualité dans Orivia.');
assert.deepEqual(shown,['You have a reminder or update in Orivia.','Vous avez un rappel ou une actualité dans Orivia.']);
// Opening a notification (ORI-NOTIFY-005), however old and whatever it carries, only opens the app's home: the app then
// checks sign-in, account and membership itself, so after logout or leaving a university nothing protected is shown.
{const opened=[];self.clients.openWindow=async u=>{opened.push(u)};
 for(const data of [{url:'/space/riverside'},{url:'https://evil.example/'},{url:'/app/space/x?item=g1'},null]){let closed=false;
  await new Promise(res=>listeners.notificationclick({notification:{data,close(){closed=true}},waitUntil:p=>p.then(res)}));assert.ok(closed)}
 assert.deepEqual(opened,['/','/','/','/'],'always the app home, never a deep link from the notification');}
console.log('Notification isolation: pilot scheduler bound to the pilot database, honest counters, generic lock-screen text only.');
// The bell shows a red dot while anything is unread; opening the inbox marks it read and clears the dot.
{const nj=fs.readFileSync('workers/trial-ui/notifications.js','utf8'),pg=fs.readFileSync('workers/trial-ui/page.html','utf8');
 assert.ok(nj.includes("bell.classList.toggle('has-unread',n>0)")&&nj.includes("list.filter(x=>x&&!x.read_at)"),'dot from unread notifications');
 assert.ok(nj.includes(".then(()=>{if(owner()===id)unreadDot([])})"),'cleared after the inbox marks them read');
 assert.ok(pg.includes('#open-notifications.has-unread::after{'),'the dot is drawn on the bell');}
