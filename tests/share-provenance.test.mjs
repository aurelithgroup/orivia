/* Share provenance end to end (ORI-CHAT-009; Ina f99c2b3 and 1f797f2). Runs the real sendChat from chat.js with Ina's
   reply-origin.js loaded, then the shipped share-select.js and chat-versions.js over the resulting chat.
   Run: node tests/share-provenance.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const load=(...files)=>{const box={};for(const f of files)vm.runInNewContext(fs.readFileSync(f,'utf8'),{window:box});return box};
const W=load('workers/trial-ui/reply-origin.js','workers/trial-ui/share-select.js','workers/trial-ui/chat-versions.js');
const S=W.OriviaShare,V=W.OriviaVersions,O=W.OriviaReplyOrigin;
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const send=chat.slice(chat.indexOf('async function sendChat('),chat.indexOf("$('form').onsubmit=e=>sendChat(e);"));
// Real sendChat with a scripted reply; context switches say what this request itself carries.
async function ask(history,question,{documents=false,university=false}={}){
 const els=new Map(),el=id=>{if(!els.has(id))els.set(id,{value:id==='msg'?question:'',textContent:'',disabled:false,remove(){},classList:{toggle(){}},setAttribute(){}});return els.get(id)};
 const turns=history.map(t=>JSON.parse(JSON.stringify(t))),store={active:'c',chats:[{id:'c',title:'T',turns}]};let sent=null;
 const s={newId:()=>'r'+Math.random(),console,AbortController,Date,JSON,Number,Object,Error,String,window:{OriviaReplyOrigin:O},navigator:{onLine:true},
  document:{visibilityState:'visible',addEventListener(){},removeEventListener(){},querySelectorAll:()=>[]},$:el,turns,store,busy:false,coolUntil:0,pendingAttachment:null,pilotOffer:false,mode:'public',VOICE_LOC:{},activeChatRequest:null,stoppedByPerson:false,
  agreed:()=>true,stopDictation(){},stopSpeaking(){},grow(){},renderAttachmentPreview(){},save(){return true},draw(){},sendMode(){},working(){},pilotConsent:()=>true,uiText:x=>x,
  chatDocuments:()=>documents?[{id:'d'}]:[],documentsForMessage:()=>[],documentContext:()=>null,currentOrgContext:()=>university?{org:'o',content:'c'}:null,currentResearchContext:()=>null,localNow:()=>'',uiLanguage:()=>'en',readSettings:()=>({}),profileForAI:()=>null,guidesForAI:()=>[],
  chatMessages:x=>x.slice(-12).map(({role,content})=>({role,content})),fetch:async(u,o)=>{sent=JSON.parse(o.body);return {}},readReply:async()=>({r:{ok:true},d:{reply:'Answer to: '+question}}),
  safeCalendarChange:()=>null,safeSources:()=>[],safeDraft:()=>null,safeShowMessage:()=>null,safeDestinations:()=>[],saveChatReminder(){return null},resources(){},guideCard(){},rememberCard(){},placementCard(){},renderChats(){},persist(){},resendWhenBack:()=>false,cooldown(){},showOffline(){}};
 vm.createContext(s);vm.runInContext(send+';this.invoke=sendChat',s);await s.invoke({preventDefault(){}});return {turns:s.turns,sent}}
const src=l=>(Array.isArray(l)?l:[]).map(x=>({...x}));
// 1. A members-only answer, then the university context is cleared and the person asks for a summary (Ina's case).
let a=await ask([],'What does the members-only guide say?',{university:true});
assert.deepEqual(JSON.parse(JSON.stringify(a.turns.at(-1).meta.origin)),{v:2,documents:false,university:true,unknown:false});
let b=await ask(a.turns,'Summarise that for me');
assert.equal(b.turns.at(-1).meta.origin.university,true,'the follow-up inherits university origin through the sent history');
assert.ok(b.sent.messages.some(m=>m.content.startsWith('Answer to: What does the members-only guide')),'that history really went to the model');
assert.deepEqual(S.candidates({turns:b.turns},src).map(x=>x.excluded),[null,'university',null,'university']);
// 2. A document-based answer, then the document is detached (no current documents) and the person asks again.
let d=await ask([],'Read my lease',{documents:true});assert.equal(d.turns.at(-1).meta.origin.documents,true);
let e=await ask(d.turns,'What was the rent again?');assert.equal(e.turns.at(-1).meta.origin.documents,true,'detaching doesn’t clean the follow-up');
assert.equal(S.candidates({turns:e.turns},src).at(-1).excluded,'document');
// 3. Older replies (v1 or no stamp) in history: the new reply can't be shown clean.
let f=await ask([{role:'user',content:'old'},{role:'assistant',content:'old reply',meta:{origin:{v:1,documents:false,university:false}}}],'And now?');
assert.equal(f.turns.at(-1).meta.origin.unknown,true);assert.equal(S.candidates({turns:f.turns},src).at(-1).excluded,'unverified');
assert.equal(S.candidates({turns:f.turns},src)[1].excluded,'unverified','the v1 reply itself stays unverified; not rewritten');
// 4. A fresh, clean conversation can be shared.
let g=await ask([],'Where do I renew my Emirates ID?');assert.deepEqual(S.candidates({turns:g.turns},src).map(x=>x.excluded),[null,null]);
// 5. Once private history scrolls beyond the 12 messages actually sent, it no longer taints new replies (same boundary as chatMessages).
let long=b.turns.slice();for(let i=0;i<12;i++)long.push({role:'user',content:'public '+i});let h=await ask(long,'New public question');
assert.equal(h.turns.at(-1).meta.origin.university,false);
// 6. Versions and reload: switching back and forth and a JSON reload keep every stamp.
const c={turns:b.turns};V.fork(c,2,'Edited follow-up');c.turns.push({role:'assistant',content:'x',meta:{origin:{v:2,documents:false,university:false,unknown:false}}});V.select(c,0);
const reloaded=JSON.parse(JSON.stringify(c));assert.deepEqual(S.candidates(reloaded,src).map(x=>x.excluded),[null,'university',null,'university']);
// 7. Excluded replies never reach the payload, even if selected.
const p=S.payload(S.candidates(reloaded,src),new Set([0,1,2,3]),'t',7);assert.ok(!JSON.stringify(p).includes('Answer to: What does the members-only'));
// Without the helper, sending fails closed and sharing treats replies as unverified.
const bare={};vm.runInNewContext(fs.readFileSync('workers/trial-ui/share-select.js','utf8'),{window:bare});
assert.equal(bare.OriviaShare.candidates({turns:g.turns},src)[1].excluded,'unverified');
assert.ok(chat.includes("{v:2,documents:false,university:false,unknown:true}"),'stamp fails closed without the helper');
console.log('Share provenance (send path): follow-ups after detaching a guide or document inherit its origin; older history stays unverified; clean requests shareable; versions and reload keep stamps: pass.');
