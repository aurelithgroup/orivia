/* Account exit clears voice audio at once (Ina, review of 8af0b96). Runs the shipped voice code from chat.js (cache,
   in-flight sharing, playback, Stop, resetVoiceSession) with a fetch that ignores aborts and answers when told, so a
   late account-A response can be resolved after the exit. Run: node tests/voice-account-exit.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const code=chat.slice(chat.indexOf('let speakingBtn=null,speakRun=0;'),chat.indexOf('async function listen('));
assert.ok(code.includes('function resetVoiceSession(')&&code.includes('function naturalSpeak(')&&code.includes('function stopSpeaking('));
function world(){
 const pending=[],fetches=[],plays=[],revoked=[],created=[];let urlN=0;
 const el=()=>({textContent:'',dataset:{},setAttribute(){},removeAttribute(){}});const status=el();
 class FakeAudio{constructor(){this.src='';this.paused=true;this.listeners={}}addEventListener(t,f){(this.listeners[t]||(this.listeners[t]=[])).push(f)}
  play(){if(this.src.startsWith('blob:')){plays.push(this.src);this.paused=false;queueMicrotask(()=>{for(const f of this.listeners.playing||[])f();this.listeners.playing=[]})}return Promise.resolve()}
  pause(){this.paused=true;this.onpause&&this.onpause()}removeAttribute(k){if(k==='src')this.src=''}load(){}end(){this.onended&&this.onended()}}
 const g={OriviaAccounts:{epoch:'acct-A'}};
 const win={OriviaListenTimings:[],OriviaVoiceText:{chunks:t=>[t]}};
 const env={window:win,globalThis:g,$:id=>id==='status'?status:el(),uiText:s=>s,canSpeak:true,speechSynthesis:{cancel(){}},readSettings:()=>({}),pilotConsent:()=>({openai:'x'}),
  Audio:FakeAudio,performance:{now:()=>Date.now()},console:{info(){}},
  URL:{createObjectURL:()=>{const u='blob:a/'+(++urlN);created.push(u);return u},revokeObjectURL:u=>revoked.push(u)},
  fetch:(path,opts)=>{fetches.push(JSON.parse(opts.body).text);return new Promise(res=>pending.push({text:JSON.parse(opts.body).text,signal:opts.signal,answer:()=>res(new Response(new Blob(['audio:'+JSON.parse(opts.body).text]),{headers:{'Content-Type':'audio/mpeg'}}))}))}};
 const names=Object.keys(env);
 const api=new Function(...names,'stopDictation','closeHandoff',code+`;return {naturalSpeak,stopSpeaking,resetVoiceSession,unlockPlayer,get run(){return speakRun},next(){return ++speakRun},get player(){return voicePlayer}}`)(...names.map(n=>env[n]),()=>{},()=>{});
 const settle=()=>new Promise(r=>setTimeout(r,0));
 const answer=async text=>{const p=pending.find(x=>x.text===text&&!x.done);assert.ok(p,'request for '+text);p.done=true;p.answer();for(let i=0;i<5;i++)await settle()};
 return {g,win,api,fetches,plays,revoked,created,pending,answer,settle};
}
const w=world(),{api,win}=w;const dbg=()=>win.OriviaVoiceDebug();
api.unlockPlayer();
// Account A: one reply played to the end (completed, cached), a second still being generated.
let run=api.next();const doneA=api.naturalSpeak('Reply one from A.','en',run);await w.answer('Reply one from A.');api.player.end();await doneA;
assert.equal(dbg().cached,1,'A audio cached for replay');
run=api.next();const playingA=api.naturalSpeak('Reply two from A.','en',run);await w.settle();
assert.equal(dbg().inflight,1);assert.equal(dbg().requests,1);
// Account exit: the actual hook calls resetVoiceSession, and cleanup is immediate (before B ever presses Listen).
const leave=chat.slice(chat.indexOf('  leave(){'),chat.indexOf('\n',chat.indexOf('  leave(){')));
assert.ok(leave.includes('resetVoiceSession()')&&!leave.includes('stopSpeaking()'),'leave() runs the full reset');
assert.ok(/reload\(\)\{resetVoiceSession\(\);/.test(chat),'account change (reload) resets');
assert.ok(chat.includes("try{cancelAttach()}catch(_){}resetVoiceSession();try{(globalThis.OriviaAccountStorage?.storage||localStorage).removeItem(profileKey)"),'Clear saved data resets');
const aborted=w.pending.filter(p=>!p.done).map(p=>p.signal.aborted);
api.resetVoiceSession();
assert.deepEqual(dbg(),{cached:0,bytes:0,inflight:0,requests:0,activeURL:false,session:1},'nothing of A left in memory');
assert.equal(w.pending.filter(p=>!p.done).every(p=>p.signal.aborted),true,'A requests aborted');assert.deepEqual(aborted,[false]);
assert.equal(api.player.src,'','player emptied');assert.ok(w.revoked.length>=1&&w.created.every(u=>w.revoked.includes(u)),'every audio URL released');
// Account B. A's late response arrives anyway (the network ignored the abort): never cached, never played.
w.g.OriviaAccounts.epoch='acct-B';const playsBefore=w.plays.length;
await w.answer('Reply two from A.');await playingA;
assert.equal(dbg().cached,0,'late A audio not cached');assert.equal(w.plays.length,playsBefore,'late A audio not played');
// B asks for the same text as A's completed reply: generated for B, not served from A.
const fetchesBefore=w.fetches.length;run=api.next();const b1=api.naturalSpeak('Reply one from A.','en',run);await w.settle();
assert.equal(w.fetches.length,fetchesBefore+1,'B generates its own audio');await w.answer('Reply one from A.');api.player.end();await b1;
assert.equal(dbg().cached,1);
// Ordinary Stop and replay still reuse within B (no new generation), as designed.
run=api.next();const b2=api.naturalSpeak('Reply one from A.','en',run);await w.settle();api.stopSpeaking();await b2;
run=api.next();const b3=api.naturalSpeak('Reply one from A.','en',run);await w.settle();api.player.end();await b3;
assert.equal(w.fetches.length,fetchesBefore+1,'Stop and replay reuse B audio');
// Stop during B generation keeps the piece for replay (ordinary Stop); exit does not.
run=api.next();const b4=api.naturalSpeak('Third.','en',run);await w.settle();api.stopSpeaking();await w.answer('Third.');await b4;
assert.equal(dbg().cached,2,'Stop: finished piece kept for replay');api.resetVoiceSession();assert.equal(dbg().cached,0,'exit: dropped');
// Clear saved data without changing account: a late response from before the reset is still not cached or played.
run=api.next();const c1=api.naturalSpeak('Cleared later.','en',run);await w.settle();api.resetVoiceSession();
const pc=w.plays.length;await w.answer('Cleared later.');await c1;
assert.equal(dbg().cached,0,'same account, pre-reset response not cached');assert.equal(w.plays.length,pc,'and not played');
console.log('Voice account exit: immediate cleanup (cache, in-flight, requests, URLs, player), late A response neither cached nor played, B generates its own, Stop/replay reuse kept: pass.');
