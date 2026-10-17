/* Chat history (saved on this device) and "Where did you move from?".
   Runs the real chat-history functions from the app against a fake browser storage. Run: node tests/chat-history.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const js = fs.readFileSync('workers/trial-ui/chat.js', 'utf8'), html = fs.readFileSync('workers/trial-ui/page.html', 'utf8');
const block = js.slice(js.indexOf('/* ===== Chat history'), js.indexOf('let chatsReturnFocus'));
const mem = {}, store = k => ({ getItem: x => (k[x] ?? null), setItem: (x, v) => { k[x] = String(v); }, removeItem: x => { delete k[x]; } });
const local = {}, session = {};
const h = new Function('localStorage', 'sessionStorage', '$', 'renderChatsStub',
  'const key="orivia-ai-private-turns";let turns=[];const resources=()=>{},el=()=>({}),button=()=>({}),stopSpeaking=()=>{},stopDictation=()=>{},draw=()=>{},closeChats=()=>{},tab=()=>{};' +
  block.replace(/function renderChats\(\)\{[\s\S]*?\n\}\n/, 'function renderChats(){}\n') +
  ';return {get store(){return store},set turns(v){turns=v},get turns(){return turns},loadChats,save,activeChat,autoTitle,chatMessages:null,persist,newChat:()=>{store.active=null;turns=[];persist()}}')(
  store(local), store(session), () => ({ textContent: '', focus() {} }));

/* Migration: the old tab-only conversation becomes a saved chat */
session['orivia-ai-private-turns'] = JSON.stringify([{ role: 'user', content: 'How do I get to Heriot-Watt from JLT?' }, { role: 'assistant', content: 'What matters most?' }]);
h.loadChats();
assert.equal(h.store.chats.length, 1); assert.equal(h.store.chats[0].turns.length, 2);
assert.equal(h.store.active, h.store.chats[0].id); assert.equal(session['orivia-ai-private-turns'], undefined, 'migrated once');
assert.match(h.store.chats[0].title, /How do I get to Heriot-Watt/);
const saved = JSON.parse(local['orivia-private-chats-v1']); assert.equal(saved.chats.length, 1, 'saved on this device');
/* New chat keeps the old one */
const first = h.store.active;
h.newChat(); h.turns = [{ role: 'user', content: 'Second question about banks' }]; h.save();
assert.equal(h.store.chats.length, 2); assert.notEqual(h.store.active, first);
assert.ok(h.store.chats.find(c => c.id === first).turns.length === 2, 'previous chat untouched');
/* Survives a refresh */
h.loadChats(); assert.equal(h.store.chats.length, 2);
/* Empty new chats aren't saved as clutter; long titles are shortened */
h.newChat(); h.persist(); assert.equal(h.store.chats.length, 2);
assert.ok(h.autoTitle([{ role: 'user', content: 'x '.repeat(60) }]).length <= 48);

/* The app wiring */
for (const id of ['open-chats', 'chats-drawer', 'new-chat', 'chats-list', 'archived-list', 'archived-wrap']) assert.match(html, new RegExp('id="' + id + '"'), id);
for (const label of ["'Rename'", "'Pin'", "'Unpin'", "'Archive'", "'Unarchive'", "'Delete'", 'Tap again to delete this chat for good']) assert.ok(js.includes(label), label);
assert.doesNotMatch(js.slice(js.indexOf('function chatRow'), js.indexOf('function renderChats')), /Share|Report/, 'no non-working menu items');
assert.match(js, /function chatMessages\(turns\)\{return turns\.slice\(-12\)/, 'only the latest messages of the active chat go to the AI');
assert.match(js, /if\(store\.active!==chatId\)/, 'a reply that arrives after switching chats is filed in its own chat');
assert.match(js, /localStorage\.removeItem\(chatsKey\)/, 'Clear saved data includes chat history');
const end = js.slice(js.indexOf("$('end-session').onclick"), js.indexOf('/* ===== Listen'));
assert.doesNotMatch(end, /removeItem\(chatsKey\)/, 'End session keeps saved chats'); assert.match(end, /store\.active=null/);
assert.match(html, /doesn’t protect them/); assert.match(html, /Saved on this device only, not in an account/);
assert.doesNotMatch(html, /held in this browser tab|kept in this browser tab only/, 'old tab-only wording replaced');
assert.match(js, /meta:t\.meta/, 'citations and source cards are kept with each saved reply');

/* Where did you move from? one optional origin; never nationality or status */
assert.match(html, /id="origin-country"/); assert.match(html, /id="origin-town"/); assert.match(html, /doesn’t tell Orivia your nationality or visa status/);
assert.doesNotMatch(html, /id="loc-from"/, 'the old box is merged, not duplicated');
assert.match(js, /p\.from&&!p\.originCountry&&!p\.originTown/, 'old answers move into the new field');
assert.match(js, /\['city','movingTo','movedFrom','who','place'\]/, 'shared only through the About me toggle');
const worker = fs.readFileSync('workers/orivia-ai-private-trial.mjs', 'utf8');
assert.match(worker, /says nothing about nationality, citizenship or immigration status/);
console.log('Chat history and origin: migration, new chat, refresh, menus, active-only to AI, end session vs clear, origin field: passed');
