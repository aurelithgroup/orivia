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
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const libBlock=chat.slice(chat.indexOf('const discoveryHelpers='),chat.indexOf('function applyLibraryFilter('));
const moduleWithoutLegacyReader=code.replace(/ function legacyHidden\(chats\)\{[^\n]*\n/,'');
assert.ok(libBlock.length>500&&!/hiddenDiscoveries|\.slice\(0,\d+\)|t\.meta\.[A-Za-z]+=/.test(libBlock+moduleWithoutLegacyReader),'no per-message removal state, no cap, no message writes');

// Ina finding 5: a shortlisted organisation stays marked when a newer chat mentions it again (and vice versa).
const orgChats=[
 {id:'old',updated:1,turns:[{role:'assistant',content:'a',meta:{sources:[src('s1','uni.example')],organisations:[{id:'o1',name:'Housing Office',sourceId:'s1'}],shortlist:['o1']}}]},
 {id:'new',updated:9,turns:[{role:'assistant',content:'b',meta:{sources:[src('s2','uni.example')],organisations:[{id:'o7',name:'housing office',sourceId:'s2'}]}}]}];
let o=D.collect(orgChats,{hidden:[]},h).shown;
assert.equal(o.length,1);assert.equal(o[0].chatId,'new','newest mention links the chat');assert.equal(o[0].shortlisted,true,'older shortlist kept');
assert.equal(D.collect([orgChats[1]],{hidden:[]},h).shown[0].shortlisted,false,'automatic discovery alone is not shortlisted');
assert.ok(chat.includes("if(x.shortlisted)title.append(' ',el('span','chip lib-flag',uiText('Shortlisted')))"),'shortlisted label is distinct from ♥');

// Ina finding 2: removals made by 5569f60 (stored on messages) are read into the Library state; messages are not edited.
const legacyChats=[{id:'L',turns:[{role:'assistant',content:'x',meta:{hiddenDiscoveries:['a|b','c|d']}},{role:'assistant',content:'y',meta:{hiddenDiscoveries:['a|b']}}]}];
const legacyBefore=JSON.stringify(legacyChats);
assert.equal(JSON.stringify(D.normLibrary({hidden:D.legacyHidden(legacyChats)})),'{"hidden":["a|b","c|d"]}');
assert.equal(JSON.stringify(legacyChats),legacyBefore);
assert.ok(chat.includes('normLibrary(d.library||{hidden:window.OriviaDiscoveries.legacyHidden(d.chats)})'),'migration runs only when there is no Library state yet');

// Ina finding 2: save failure (quota) undoes the change and says so; success clears the note. Runs the shipped function.
const fnSrc=chat.slice(chat.indexOf('function setDiscoveryHidden('),chat.indexOf("let discoveryNote='';"));
const run=ok=>{const env={store:{library:{hidden:[]},chats:legacyChats},persisted:0,rendered:0};
 const f=new Function('window','uiText','persist','renderLibraryView','env',`let store=env.store,discoveryNote='';${fnSrc};return {set:(k,h)=>{setDiscoveryHidden(k,h);return {library:store.library,note:discoveryNote}}}`);
 return f({OriviaDiscoveries:D},s=>s,()=>{env.persisted++;return ok},()=>{env.rendered++},env).set('a|b',true)};
let res=run(false);assert.equal(JSON.stringify(res.library),'{"hidden":[]}','quota failure: nothing hidden');assert.match(res.note,/Couldn’t save this change/);
res=run(true);assert.equal(JSON.stringify(res.library),'{"hidden":["a|b"]}');assert.equal(res.note,'');
// Account separation: the Library state lives inside the account-scoped chats record (synced with that account only).
const acc=fs.readFileSync('workers/trial-ui/accounts.js','utf8');
assert.ok(acc.includes("chats:'orivia-private-chats-v1'")&&acc.includes("const key=k=>scope&&privateKeys.has(k)?prefix(scope)+k:k;"),'chats record (and its Library state) is stored per account');
assert.ok(chat.includes("let store={chats:[],active:null,library:{hidden:[]}};")&&chat.includes("storeLocked=false;store={chats:[],active:null,library:{hidden:[]}};"),'switching account reloads a fresh Library state');
assert.ok(fs.readFileSync('tools/embed-trial-ui.mjs','utf8').includes("library-discoveries.js','utf8')+'\\n'+chat"),'module ships before chat.js');
console.log('Library discoveries: 106 of 106 shown via paging, dedupe and favourites, removal stored once with Restore, chats unchanged: pass.');
