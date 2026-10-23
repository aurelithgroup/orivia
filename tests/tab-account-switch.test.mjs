/* One active account across tabs (ORI-AUTH-005): a sign-in, switch or sign-out in one tab reloads the others, and an
   unsent draft is held under the account it was typed in, so account A's draft never becomes account B's message.
   Runs the shipped draft code from chat.js and the BroadcastChannel listener from nav.js. Run: node tests/tab-account-switch.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const draftCode=chat.slice(chat.indexOf("const draftKey=()=>"),chat.indexOf('window.OriviaUpdate={'));
const session=new Map(),sessionStorage={getItem:k=>session.has(k)?session.get(k):null,setItem:(k,v)=>session.set(k,String(v)),removeItem:k=>session.delete(k)};
function tabAs(account,{typed='',chats=['c1']}={}){
 const els={msg:{value:typed},status:{textContent:''}},x={$:id=>els[id],sessionStorage,Date,JSON,Number,uiText:s=>s,grow(){},tab(){},openChat(id){x.store.active=id},busy:false,pendingAttachment:null,
  store:{active:chats[0]||null,chats:chats.map(id=>({id}))},location:{reload(){x.reloaded=true}},globalThis:{OriviaAccounts:account?{epoch:account}:undefined}};
 vm.createContext(x);vm.runInContext(draftCode+';this.keepDraft=keepDraft;this.restore=restoreUpdateDraft',x);return {x,els}}
// Tab 1 is account A with an unsent message; another tab switches to B, so tab 1 keeps the draft under A and reloads.
let t=tabAs('user-a',{typed:'Please email my landlord about the deposit'});t.x.keepDraft('switch');
assert.deepEqual([...session.keys()],['orivia-update-draft:user-a'],'held under account A only');
// The reloaded tab is now B: nothing appears in B's composer, and A's draft stays put for A.
let b=tabAs('user-b');b.x.restore();assert.equal(b.els.msg.value,'','B never sees A’s draft');assert.ok(session.has('orivia-update-draft:user-a'));
let g=tabAs(null);g.x.restore();assert.equal(g.els.msg.value,'','nor does a guest');
// Back to A within ten minutes: the draft returns with a plain explanation, once.
let a=tabAs('user-a');a.x.restore();assert.equal(a.els.msg.value,'Please email my landlord about the deposit');assert.match(a.els.status.textContent,/before the account change/);assert.equal(session.size,0);
// An empty composer clears any older held draft rather than keeping stale text.
session.set('orivia-update-draft:user-a',JSON.stringify({text:'old',at:Date.now(),why:'switch'}));tabAs('user-a',{typed:'  '}).x.keepDraft('switch');assert.equal(session.size,0);
// Expired drafts (over ten minutes) are dropped.
session.set('orivia-update-draft:user-a',JSON.stringify({text:'stale',at:Date.now()-700000,why:'switch'}));a=tabAs('user-a');a.x.restore();assert.equal(a.els.msg.value,'');
// The listener in nav.js holds the draft before reloading, and only when the account actually changed.
const nav=fs.readFileSync('workers/trial-ui/nav.js','utf8').replace(/\r\n/g,'\n');
const listen=nav.slice(nav.indexOf("try{const c=new BroadcastChannel('orivia-account');c.onmessage="),nav.indexOf('catch(_){}',nav.indexOf("c.onmessage="))+10);
let kept=[],reloads=0,channel=null;
const y={user:{id:'user-a'},root:null,el:()=>({}),t:s=>s,setTimeout:f=>f(),location:{reload(){reloads++}},window:{OriviaUpdate:{keepDraft:w=>kept.push(w)}},BroadcastChannel:class{constructor(){channel=this}}};
vm.createContext(y);vm.runInContext(listen,y);
channel.onmessage({data:{user:'user-a'}});assert.deepEqual([kept,reloads],[[],0],'same account: nothing happens');
channel.onmessage({data:{user:'user-b'}});assert.deepEqual([kept,reloads],[['switch'],1],'switch: draft held, then reload');
channel.onmessage({data:{user:null}});assert.deepEqual([kept,reloads],[['switch','switch'],2],'sign-out elsewhere: draft held, then reload');
// Every request carries the account it was made for; the server refuses a mismatch (tests/device-accounts.test.mjs).
const handler=fs.readFileSync('workers/accounts/handler.mjs','utf8');assert.match(handler,/expected!==owner\)return json\(\{error:'account_changed'\},409\)/);
console.log('Tab account switch: other tabs reload on sign-in, switch or sign-out; an unsent draft is held under its own account, never shown to another account or a guest, and returns to its account with an explanation: pass.');
