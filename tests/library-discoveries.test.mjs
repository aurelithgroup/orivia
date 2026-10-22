/* ORI-LIB-002/003/004/006 Library discoveries, behavioural (Ina's review of 5569f60: no silent cap; removal stored once,
   Restore, chats preserved). Runs the shipped module workers/trial-ui/library-discoveries.js.
   Run: node tests/library-discoveries.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync('workers/trial-ui/library-discoveries.js','utf8');
const box={};vm.runInNewContext(code,{window:box});const D=box.OriviaDiscoveries;
// Minimal sanitisers with the shapes chat.js produces (sources keyed by id; cards must cite a source).
const h={
 safeSources:l=>(Array.isArray(l)?l:[]).filter(s=>/^https:/.test(s.url)).map(s=>({...s,host:new URL(s.url).hostname.replace(/^www\./,'')})),
 safeDestinations:(l,srcs)=>(Array.isArray(l)?l:[]).flatMap(d=>{const src=srcs.find(s=>s.id===d.sourceId);return src?[{...d,src}]:[]}),
 safeOrgs:(l,srcs)=>(Array.isArray(l)?l:[]).flatMap(o=>{const src=srcs.find(s=>s.id===o.sourceId);return src?[{...o,src}]:[]}),
 placeIdentity:d=>d.sourceId+'|'+d.name};
const src=(id,host)=>({id,url:'https://'+host+'/page',title:host});
// Ina's reproduction: 105 eligible recommendations in one chat, plus a repeat and a favourite in another, plus a fixture.
const many={id:'c1',title:'Many',updated:1,turns:[{role:'user',content:'list'},{role:'assistant',content:'Here.',meta:{sources:[src('s1','gov.example')],
 destinations:Array.from({length:105},(_,i)=>({name:'Centre '+i,address:'Street '+i,sourceId:'s1'}))}}]};
const again={id:'c2',title:'Again',updated:2,turns:[{role:'assistant',content:'x',meta:{sources:[src('s9','GOV.example')],destinations:[{name:' centre  7 ',sourceId:'s9'}],savedPlaces:['s9| centre  7 '],
 organisations:[{name:'Help Desk',sourceId:'s9'},{name:'Northbay Demo',sourceId:'s9',fixture:true}]}},
 {role:'assistant',content:'no sources',meta:{destinations:[{name:'Unsourced',sourceId:'zz'}]}}]};
const chats=[many,again];const before=JSON.stringify(chats);
let lib={hidden:[]};
let r=D.collect(chats,lib,h);
assert.equal(r.shown.length,106,'all 105 places + 1 service, no silent cap');
assert.equal(r.shown.filter(x=>x.key===D.key('Centre 7',{host:'gov.example'})).length,1,'repeat mention deduplicated');
assert.equal(r.shown.find(x=>x.key===D.key('Centre 7',{host:'gov.example'})).favourite,true,'favourite kept');
assert.ok(!r.shown.some(x=>/Northbay|Unsourced/.test(x.name)),'fixtures and unsourced cards excluded');
assert.equal(r.shown[0].chatId,'c2','newest chat first');
// Paging shows everything eventually, 30 at a time.
let p=D.page(r.shown,0),seen=p.items.length;assert.equal(p.items.length,30);assert.equal(p.more,76);
while(p.more){p=D.page(r.shown,p.next);seen=p.items.length}assert.equal(seen,106,'Show more reaches every item');
// Remove: one write to the Library state; chats unchanged byte for byte.
const k=r.shown.find(x=>x.name==='Centre 50').key;
lib=D.hide(lib,k);lib=D.hide(lib,k);
assert.equal(JSON.stringify(lib),JSON.stringify({hidden:[k]}),'stored once, idempotent');
assert.equal(JSON.stringify(chats),before,'no chat or message modified');
r=D.collect(chats,lib,h);assert.equal(r.shown.length,105);assert.equal(r.hidden.map(x=>x.name).join(),'Centre 50');
// Restore brings it back; still no chat change.
lib=D.restore(lib,k);r=D.collect(chats,lib,h);assert.equal(r.shown.length,106);assert.equal(r.hidden.length,0);
assert.equal(JSON.stringify(chats),before);
// Library state is validated on load (bad values dropped, duplicates merged).
assert.equal(JSON.stringify(D.normLibrary({hidden:['a','a',5,null,'x'.repeat(500)]})),'{"hidden":["a"]}');
assert.equal(JSON.stringify(D.normLibrary(null)),'{"hidden":[]}');
// chat.js uses the module, stores removal in store.library via persist() (not save(), which would touch the active chat),
// and never writes discovery state into messages.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8');
assert.ok(chat.includes("store.library=hidden?window.OriviaDiscoveries.hide(store.library,key):window.OriviaDiscoveries.restore(store.library,key);persist();renderLibraryView()"));
const libBlock=chat.slice(chat.indexOf('const discoveryHelpers='),chat.indexOf('function applyLibraryFilter('));
assert.ok(libBlock.length>500&&!/hiddenDiscoveries|\.slice\(0,\d+\)|t\.meta\.[A-Za-z]+=/.test(libBlock+code),'no per-message removal state, no cap, no message writes');
assert.ok(fs.readFileSync('tools/embed-trial-ui.mjs','utf8').includes("library-discoveries.js','utf8')+'\\n'+chat"),'module ships before chat.js');
console.log('Library discoveries: 106 of 106 shown via paging, dedupe and favourites, removal stored once with Restore, chats unchanged: pass.');
