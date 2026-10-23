/* Listen startup (Ina priority 4): no duplicate generation, account-isolated session reuse, reliable Stop, immediate
   feedback and click-to-first-audio timing. Runs the shipped cache code from chat.js with a counting fetch.
   Browser evidence: tools/browser-checks/jobs-listen.json (HARNESS_VOICE=600). Run: node tests/listen-startup.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const block=chat.slice(chat.indexOf('const voiceCache=new Map()'),chat.indexOf('function voiceFetch('));
assert.ok(block.length>300,'cache block found');
const make=()=>{const g={OriviaAccounts:{epoch:'acct-A'}},calls=[],aborted=[];let pending=[];
 const api=new Function('globalThis','listenTiming','voiceRequests','voiceFetch','window','$','uiText','speechSynthesis','canSpeak',block+';return {voicePiece,voiceCache,get bytes(){return voiceCacheBytes}}')(g,{cached:0},{[Symbol.iterator]:function*(){},clear(){}},(text,lang)=>{calls.push(text);return new Promise(r=>pending.push(()=>r(new Blob([text.padEnd(10,'.')]))))},{},()=>null,s=>s,{cancel(){}},true);
 return {g,calls,api,flush:async()=>{const p=pending;pending=[];p.forEach(f=>f());await new Promise(r=>setTimeout(r,0))}}};
// In-flight sharing: two requests for the same piece while it is generating → one generation.
let t=make();const a=t.api.voicePiece('Hello there.','en'),b=t.api.voicePiece('Hello there.','en');
assert.equal(t.calls.length,1,'same piece in flight is shared');await t.flush();assert.equal(await a,await b);
// Replay reuses the finished audio: no new generation.
await t.api.voicePiece('Hello there.','en');assert.equal(t.calls.length,1,'replay reuses');
// Different language or text is a different piece.
t.api.voicePiece('Hello there.','fr');assert.equal(t.calls.length,2);await t.flush();
// Another account never gets account A's audio, and the cache is emptied on the switch.
t.g.OriviaAccounts.epoch='acct-B';t.api.voicePiece('Hello there.','en');assert.equal(t.calls.length,3,'account B generates its own');
assert.equal(t.api.voiceCache.size,0,'account A audio dropped on switch');await t.flush();
// A late response from the previous account is not kept.
t=make();const late=t.api.voicePiece('Late','en');t.g.OriviaAccounts.epoch='acct-B';await t.flush();await late;
assert.ok(![...t.api.voiceCache.keys()].some(k=>k.startsWith('acct-A|')),'late audio from another account not cached');
// Bounded memory: at most 24 pieces.
t=make();for(let i=0;i<30;i++){t.api.voicePiece('Piece '+i,'en');await t.flush()}assert.ok(t.api.voiceCache.size<=24);
// Wiring in chat.js: immediate feedback, short first piece, Stop doesn't throw away work in progress, timing recorded.
assert.ok(chat.includes("$('status').textContent=uiText('Preparing the voice…');$('status').dataset.preparing='1';"),'immediate preparing message');
assert.ok(chat.includes("if(parts.length&&parts[0].length>220){const head=chunk(parts[0],200);"),'first piece about one sentence');
const stop=chat.slice(chat.indexOf('function stopSpeaking(){'),chat.indexOf('\n',chat.indexOf('function stopSpeaking(){')));
assert.ok(!/abort\(\)/.test(stop)&&stop.includes('speakRun++')&&stop.includes("voicePlayer.pause()"),'Stop silences now without discarding a piece being generated');
assert.ok(chat.includes("if(first)a.addEventListener('playing',()=>{if(run===speakRun)listenStarted(first)},{once:true})")&&chat.includes("u.onstart=()=>{if(run===speakRun)listenStarted('device')}"),'first audio timed for natural and device voices');
assert.ok(chat.includes("const rec={event:'orivia-listen',source:")&&!/orivia-listen[^\n]*(clean|text\b)/.test(chat.slice(chat.indexOf('function listenStarted('),chat.indexOf('function listenStarted(')+600)),'timing is numbers only');
// Limits unchanged: the server enforces voice $1/day and $5/month; nothing here changes it.
const pilot=fs.readFileSync('workers/pilot/wrangler.jsonc','utf8'),prod=fs.readFileSync('workers/production/wrangler.jsonc','utf8');
for(const c of [pilot,prod])assert.ok(c.includes('"VOICE_DAY_USD": "1", "VOICE_MONTH_USD": "5"'),'voice limits unchanged');
console.log('Listen startup: shared in-flight pieces, account-isolated reuse, bounded cache, immediate feedback, short first piece, timing, limits unchanged: pass.');
