/* Cleo's integration fixes to Ina's conversation versions (5bdfcf8), found by the browser check
   (tools/browser-checks/jobs-versions.json): a stopped or failed version restores the earlier conversation instead of
   emptying it; Edit/Regenerate/version buttons drawn during a reply are re-enabled when it ends; the version notice is
   shown under the reply, not written into it. Runs the real sendChat, as Ina's tests/chat-versions.test.mjs does.
   Run: node tests/chat-versions-integration.test.mjs */
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const send=chat.slice(chat.indexOf('async function sendChat('),chat.indexOf("$('form').onsubmit=e=>sendChat(e);"));
async function run({replay,reply,fail,throws}){
 const els=new Map(),el=id=>{if(!els.has(id))els.set(id,{value:'',textContent:'',disabled:false,remove(){},classList:{toggle(){}},setAttribute(){}});return els.get(id)};
 const locked=[{disabled:true,dataset:{busyLock:'1'}},{disabled:true,dataset:{busyLock:'1'}}];
 const turns=[{role:'user',content:'Question'}],store={active:'c',chats:[{id:'c',title:'T',turns}]};let rolledBack=null,requests=0;
 const s={newId:()=>'r1',console,AbortController,Date,JSON,Number,Object,Error,String,window:{},navigator:{onLine:true},
  document:{visibilityState:'visible',addEventListener(){},removeEventListener(){},querySelectorAll:q=>q==='#history [data-busy-lock]'?locked:[]},
  $:el,turns,store,busy:false,coolUntil:0,pendingAttachment:null,pilotOffer:false,mode:'public',VOICE_LOC:{},activeChatRequest:null,stoppedByPerson:false,
  agreed:()=>true,stopDictation(){},stopSpeaking(){},grow(){},renderAttachmentPreview(){},save(){return true},draw(){},sendMode(){},working(){},pilotConsent:()=>false,uiText:x=>x,
  chatDocuments:()=>[],currentOrgContext:()=>null,currentResearchContext:()=>null,localNow:()=>'',uiLanguage:()=>'en',readSettings:()=>({}),profileForAI:()=>null,guidesForAI:()=>[],chatMessages:x=>x.map(({role,content})=>({role,content})),
  fetch:async()=>{requests++;if(throws)throw new Error('network');return {}},
  readReply:async()=>fail?{r:{ok:false,status:500},d:{error:'temporarily_unavailable'}}:{r:{ok:true},d:{reply}},
  safeCalendarChange:()=>null,safeSources:()=>[],safeDraft:()=>null,safeShowMessage:()=>null,safeDestinations:()=>[],saveChatReminder(){return null},
  resources(){},guideCard(){},rememberCard(){},placementCard(){},renderChats(){},persist(){},resendWhenBack:()=>false,cooldown(){},showOffline(){}};
 vm.createContext(s);vm.runInContext(send+';this.invoke=sendChat',s);
 const r=replay?{kind:'regenerate',allowAutomaticActions:false,rollback:msg=>{rolledBack=msg}}:null;
 await s.invoke({preventDefault(){}},r);return {turns:s.turns,rolledBack,locked,msg:els.get('msg')?.value||'',status:els.get('status')?.textContent||'',requests};
}
// Failed version: rolled back, the question is not pulled out into the message box.
let r=await run({replay:true,fail:true});
assert.equal(r.rolledBack,'Couldn’t make a new version right now. Your earlier version is back.');assert.equal(r.msg,'');
assert.deepEqual(r.turns.map(t=>t.content),['Question'],'sendChat leaves the turns for the rollback to restore');
// Network error or Stop during a version: rolled back too.
r=await run({replay:true,throws:true});assert.equal(r.rolledBack,'Couldn’t make a new version right now. Your earlier version is back.');assert.equal(r.msg,'');
// A normal message that fails still goes back into the box as before.
r=await run({replay:false,fail:true});assert.equal(r.rolledBack,null);
// Successful version: the AI's reply is the content; the notice is a flag shown under it (not sent back, not read aloud).
r=await run({replay:true,reply:'Answer for this version'});
assert.equal(r.turns.at(-1).content,'Answer for this version');assert.equal(r.turns.at(-1).meta.versionNote,true);
assert.ok(!r.turns.at(-1).content.includes('new conversation version'));
assert.equal(JSON.stringify(r.turns.at(-1).meta.origin),JSON.stringify({v:1,documents:false,university:false}),'every reply is stamped with what its request carried (share provenance)');
// Controls disabled only because a reply was in progress are released when it ends.
assert.ok(r.locked.every(b=>b.disabled===false&&!b.dataset.busyLock),'Edit/Regenerate re-enabled');
// Wiring.
assert.ok(chat.includes("replay.rollback=msg=>{if(activeChat()!==c)return;"));
assert.ok(chat.includes("if(t.role==='assistant'&&t.meta?.versionNote)"));
console.log('Version integration fixes: stop/failure roll back, controls re-enabled after a reply, notice outside the reply text: pass.');
