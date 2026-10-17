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

/* ===== Failure paths: storage full, failed migration, long chats, many chats, unreadable data ===== */
function make(opts = {}) {
  const local = opts.local || {}, session = opts.session || {}, els = {};
  const ls = { full: false, silent: false, setCalls: 0,
    getItem: x => (local[x] ?? null),
    setItem(x, v) { this.setCalls++; if (this.full) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } if (!this.silent) local[x] = String(v); },
    removeItem: x => { delete local[x]; } };
  const $ = id => (els[id] ||= { textContent: '', hidden: true, focus() {} });
  const api = new Function('localStorage', 'sessionStorage', '$',
    'const key="orivia-ai-private-turns";let turns=[];const resources=()=>{},el=()=>({}),button=()=>({}),stopSpeaking=()=>{},stopDictation=()=>{},draw=()=>{},closeChats=()=>{},tab=()=>{};' +
    block.replace(/function renderChats\(\)\{[\s\S]*?\n\}\n/, 'function renderChats(){}\n') +
    ';return {get store(){return store},set turns(v){turns=v},get turns(){return turns},loadChats,save,persist,newChat:()=>{store.active=null;turns=[];persist()}}')(ls, store(session), $);
  return { api, ls, local, session, warn: () => (els['storage-warn'] && !els['storage-warn'].hidden ? els['storage-warn-text'].textContent : '') };
}
const turnsOf = n => Array.from({ length: n }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'message ' + i }));
const savedChats = local => JSON.parse(local['orivia-private-chats-v1']).chats;

/* 1. Storage full: nothing is deleted, the person is told, and saving resumes once there's room */
{
  const t = make(); t.api.loadChats();
  for (let i = 0; i < 3; i++) { t.api.newChat(); t.api.turns = turnsOf(2).map(x => ({ ...x, content: x.content + ' chat ' + i })); t.api.save(); }
  assert.equal(savedChats(t.local).length, 3);
  t.ls.full = true;
  t.api.newChat(); t.api.turns = [{ role: 'user', content: 'Question while the device is full' }];
  assert.equal(t.api.save(), false, 'save reports failure');
  assert.equal(savedChats(t.local).length, 3, 'no saved chat was evicted');
  assert.equal(t.api.store.chats.length, 4, 'the new chat stays on screen');
  assert.match(t.warn(), /out of space/); assert.match(t.warn(), /Nothing has been deleted/); assert.match(t.warn(), /Delete chats you no longer need/);
  t.ls.full = false; assert.equal(t.api.persist(), true);
  assert.equal(savedChats(t.local).length, 4, 'the unsaved chat is saved once there is room'); assert.equal(t.warn(), '', 'warning clears');
}
/* 2. Failed migration keeps the legacy copy, and retrying doesn't duplicate it */
{
  const legacy = JSON.stringify(turnsOf(4));
  const t = make({ session: { 'orivia-ai-private-turns': legacy } }); t.ls.full = true;
  t.api.loadChats();
  assert.equal(t.session['orivia-ai-private-turns'], legacy, 'legacy kept when the save failed');
  assert.equal(t.local['orivia-private-chats-v1'], undefined); assert.match(t.warn(), /out of space/);
  assert.equal(t.api.store.chats.length, 1, 'still visible this session');
  t.api.loadChats(); assert.equal(t.api.store.chats.length, 1, 'no duplicate on retry');
  t.ls.full = false; t.api.loadChats();
  assert.equal(t.session['orivia-ai-private-turns'], undefined, 'removed only after a confirmed save');
  assert.equal(savedChats(t.local).length, 1); assert.equal(savedChats(t.local)[0].turns.length, 4);
}
/* 2b. A write that reports success but doesn't stick is not treated as migrated */
{
  const legacy = JSON.stringify(turnsOf(2));
  const t = make({ session: { 'orivia-ai-private-turns': legacy } }); t.ls.silent = true;
  t.api.loadChats(); assert.equal(t.session['orivia-ai-private-turns'], legacy, 'legacy kept until the saved copy is read back');
}
/* 2c. Migration into existing history keeps both */
{
  const t = make({ session: { 'orivia-ai-private-turns': JSON.stringify(turnsOf(2)) } });
  t.local['orivia-private-chats-v1'] = JSON.stringify({ chats: [{ id: 'cold', title: 'Older', turns: turnsOf(2), updated: 1 }], active: null });
  t.api.loadChats(); assert.equal(savedChats(t.local).length, 2); assert.equal(t.session['orivia-ai-private-turns'], undefined);
}
/* 3. Long chats are never shortened (only the latest 12 messages go to the AI) */
{
  const t = make(); t.api.loadChats(); t.api.newChat(); t.api.turns = turnsOf(260); t.api.save();
  const again = make({ local: t.local }); again.api.loadChats();
  assert.equal(again.api.store.chats[0].turns.length, 260, 'all 260 messages kept after reload');
  assert.equal(again.api.store.chats[0].turns[0].content, 'message 0', 'the oldest message is still there');
}
/* 4. Many chats: no automatic cap */
{
  const chats = Array.from({ length: 75 }, (_, i) => ({ id: 'c' + i, title: 'Chat ' + i, turns: turnsOf(2), updated: i }));
  const t = make({ local: { 'orivia-private-chats-v1': JSON.stringify({ chats, active: null }) } });
  t.api.loadChats(); t.api.newChat(); t.api.turns = turnsOf(2); t.api.save();
  assert.equal(savedChats(t.local).length, 76, 'all 75 old chats plus the new one are kept');
}
/* 5. Unreadable saved data is backed up before anything is written, or never overwritten */
{
  const t = make({ local: { 'orivia-private-chats-v1': '{not json' } }); t.api.loadChats();
  assert.equal(t.local['orivia-private-chats-v1-unreadable'], '{not json', 'untouched copy kept'); assert.match(t.warn(), /couldn’t be read/);
  t.api.turns = [{ role: 'user', content: 'hello' }]; t.api.save();
  assert.equal(t.local['orivia-private-chats-v1-unreadable'], '{not json', 'copy survives new saves');
  const u = make({ local: { 'orivia-private-chats-v1': '{not json' } }); u.ls.full = true; u.api.loadChats(); u.ls.full = false;
  u.api.turns = [{ role: 'user', content: 'hello' }]; assert.equal(u.api.save(), false);
  assert.equal(u.local['orivia-private-chats-v1'], '{not json', 'never overwritten when no backup could be made'); assert.match(u.warn(), /isn’t saving new messages over them/);
}
/* 6. No automatic deletion or truncation code remains; the warning is wired */
assert.doesNotMatch(block, /MAX_TURNS|MAX_CHATS|drop the oldest|\.slice\(-\d/, 'no eviction or silent truncation');
assert.match(html, /id="storage-warn"[^>]*role="alert"/); assert.match(html, /id="storage-manage"/); assert.match(js, /\$\('storage-manage'\)\.onclick=openChats/);
assert.match(js, /localStorage\.removeItem\(chatsBackupKey\)/, 'Clear saved data also removes the backup copy');
console.log('Chat storage failure paths: full device, failed and silent migration, long and many chats, unreadable data: passed');
console.log('Chat history and origin: migration, new chat, refresh, menus, active-only to AI, end session vs clear, origin field: passed');
