/* Protected university bookmarks in the Library (ORI-LIB-005; Ina's candidate 7 audit left it unverified).
   Runs the shipped library-discoveries.js, spaces.js and the bookmark code from chat.js with scripted transport.
   Server side (leaving closes the space and the chat context): tests/leave-organisation.test.mjs.
   Run: node tests/org-bookmarks.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const lib={};vm.runInNewContext(fs.readFileSync('workers/trial-ui/library-discoveries.js','utf8'),{window:lib});const D=lib.OriviaDiscoveries;
// 1. A bookmark is a reference only: whatever the caller passes, the item's text never reaches the Library state.
let l=D.saveOrgItem({hidden:['x|y']},{org:'north',content:'g1',title:'Visa renewal',orgName:'Northbay',body:'MEMBERS ONLY TEXT',details:{phone:'1'}},5);
assert.deepEqual(JSON.parse(JSON.stringify(l)),{hidden:['x|y'],saved:[{org:'north',content:'g1',title:'Visa renewal',orgName:'Northbay',savedAt:5}]});
assert.ok(!JSON.stringify(l).includes('MEMBERS ONLY'),'no body kept');
l=D.saveOrgItem(l,{org:'north',content:'g1',title:'Visa renewal',orgName:'Northbay'},9);assert.equal(l.saved.length,1,'saving twice keeps one');assert.equal(l.saved[0].savedAt,9);
assert.equal(D.saveOrgItem(l,{org:'../x',content:'g1'},1),null,'bad ids refused');assert.equal(D.saveOrgItem(l,{org:'north',content:'a b'},1),null);
assert.ok(D.isSaved(l,'north','g1'));l=D.removeOrgItem(l,'north','g1');assert.equal(l.saved.length,0);assert.deepEqual([...l.hidden],['x|y'],'discovery removals untouched');
assert.deepEqual(JSON.parse(JSON.stringify(D.normLibrary({saved:[{org:'n',content:'c',title:'t',body:'secret'},{org:'n',content:'c'},null,{org:5}]}))).saved,[{org:'n',content:'c',title:'t',orgName:'',savedAt:0}],'stored state normalised on load (older or tampered records lose any text)');
assert.equal(D.hide({saved:[{org:'n',content:'c'}]},'k').saved.length,1,'hiding a discovery keeps bookmarks');

// 2. Saving from the university space, and opening a bookmark: only through an active membership, and the item loads from the server.
class N{constructor(tag='div'){this.tag=tag;this.children=[];this.hidden=true;this.textContent='';this.dataset={};this.attrs={};this.cls=new Set();const self=this;this.classList={add(c){self.cls.add(c)},remove(c){self.cls.delete(c)},toggle(c,on){on?self.cls.add(c):self.cls.delete(c)}}}
 get childElementCount(){return this.children.length}get lastChild(){return this.children.at(-1)}setAttribute(k,v){this.attrs[k]=v}append(...x){this.children.push(...x)}prepend(...x){this.children.unshift(...x)}replaceChildren(...x){this.children=x}addEventListener(){}focus(){}scrollIntoView(){}querySelectorAll(){return []}remove(){}}
const walk=n=>[n,...n.children.flatMap(walk)],words=n=>walk(n).map(n=>n.textContent).join(' '),find=(n,re)=>walk(n).find(x=>x.tag==='button'&&re.test(x.textContent));
const roots=new Map(['home-spaces','home-spaces-list','organisation-sheet','organisation-body','organisation-title','organisation-close'].map(k=>[k,new N()]));
let status='active',calls=[],saved=D.normLibrary({}),persistOk=true;
const chatApi={isOrgItemSaved:(o,c)=>D.isSaved(saved,o,c),saveOrgItem:r=>{if(!persistOk)return false;saved=D.saveOrgItem(saved,r,1);return true},unsaveOrgItem:r=>{saved=D.removeOrgItem(saved,r.org,r.content);return true}};
const c={queueMicrotask,setTimeout,location:{pathname:'/app'},history:{pushState(){}},
 window:{addEventListener(){},OriviaAccounts:{user:{id:'student'}},OriviaChat:chatApi},
 document:{getElementById:k=>{if(!roots.has(k)&&/^org-item-/.test(k)){const hit=walk(roots.get('organisation-body')).find(n=>n.id===k);return hit||null}return roots.get(k)},createElement:t=>new N(t),addEventListener(){},activeElement:null},AbortSignal,
 fetch:async(path,opts)=>{calls.push(path);if(path.includes('memberships'))return Response.json({platformRoles:[],memberships:status?[{organisationId:'north',name:'Northbay',role:'student',status}]:[]});
  if(status!=='active')return Response.json({error:'forbidden'},{status:403});
  return Response.json({organisation:{name:'Northbay'},content:[{id:'g1',kind:'guide',title:'Visa renewal',body:'MEMBERS ONLY TEXT',details:{}},{id:'k1',kind:'contact',title:'Desk',body:'b',details:{}}]})}};
vm.createContext(c);vm.runInContext(fs.readFileSync('workers/trial-ui/spaces.js','utf8'),c);const S=c.window.OriviaSpaces;
await S.refresh();assert.match(words(roots.get('home-spaces-list')),/Northbay/);assert.equal(await S.openItem('north','g1'),true);
const body=roots.get('organisation-body');assert.match(words(body),/MEMBERS ONLY TEXT/,'members see the item in the space');
const guide=walk(body).find(n=>n.id==='org-item-g1'),contact=walk(body).find(n=>n.id==='org-item-k1');
const save=find(guide,/Save to Library/);assert.ok(save,'guides can be saved');assert.ok(!find(contact,/Save to Library/),'contacts are not bookmarked');
persistOk=false;save.onclick();assert.match(save.textContent,/Couldn’t save/);assert.equal(saved.saved.length,0,'a failed save says so and stores nothing');
persistOk=true;save.onclick();assert.equal(save.textContent,'Saved in Library ✓');assert.equal(save.attrs['aria-pressed'],'true');
assert.deepEqual(JSON.parse(JSON.stringify(saved.saved)),[{org:'north',content:'g1',title:'Visa renewal',orgName:'Northbay',savedAt:1}]);
calls=[];assert.equal(await S.openItem('north','g1'),true);assert.ok(calls.includes('/api/me/orgs/north'),'opening loads the item from the server again');
assert.ok(walk(roots.get('organisation-body')).find(n=>n.id==='org-item-g1').cls.has('org-highlight'),'the saved item is shown');
assert.equal(await S.openItem('north','gone'),true);assert.match(words(roots.get('organisation-body')),/isn’t published here any more/);
// Removed by staff while the device still thinks it's a member: the server refuses, nothing protected is shown.
status='removed';await S.openItem('north','g1');assert.doesNotMatch(words(roots.get('organisation-body')),/MEMBERS ONLY/);assert.match(words(roots.get('organisation-body')),/couldn’t be opened/);
// After the membership list catches up, opening doesn't even ask for the space.
await S.refresh();calls=[];assert.equal(await S.openItem('north','g1'),false);assert.ok(!calls.some(p=>p.startsWith('/api/me/orgs/')),'no space request without an active membership');
assert.equal(await S.openItem('other','g1'),false,'never another organisation');

// 3. The Library card: title and organisation only, availability checked each time, Open/Ask only for members.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const block=chat.slice(chat.indexOf('let orgBookmarkCheck=0;'),chat.indexOf('// (Named renderLibraryView:'));
const setSaved=chat.slice(chat.indexOf('function setOrgSaved('),chat.indexOf('window.OriviaChat={'));
async function draw(memberships,{signedIn=true,fail=false}={}){
 const g=new N('div');g.querySelector=()=>null;let used=[],asked=null;
 const x={store:{library:D.saveOrgItem({},{org:'north',content:'g1',title:'Visa renewal',orgName:'Northbay'},1)},uiText:s=>s,
  el:(t,cls,txt)=>{const n=new N(t);n.className=cls;if(txt!=null)n.textContent=txt;return n},libItem:(n,k,t)=>{n.dataset.libKind=k;return n},
  attachButton:(label,fn)=>{const b=new N('button');b.textContent=label;b.onclick=fn;return b},setOrgSaved(){},globalThis:{OriviaAccounts:{user:signedIn?{id:'student'}:null}},
  window:{OriviaDiscoveries:D,OriviaNav:{memberships:async id=>{used.push(id);if(fail)throw Error('offline');return {memberships}}},OriviaSpaces:{openItem:(o,ct)=>{asked=['open',o,ct]}},OriviaChat:{useOrgContext:r=>{asked=['ask',r.org,r.content]}}}};
 vm.createContext(x);vm.runInContext(block+';this.render=renderOrgBookmarks',x);x.render(g);await new Promise(r=>setTimeout(r,0));
 return {card:g.children[0],used,asked:()=>asked}}
let r=await draw([{organisationId:'north',role:'student',status:'active'}]);
assert.equal(r.card.children[0].textContent,'Visa renewal');assert.match(words(r.card),/From Northbay · Members only/);assert.doesNotMatch(words(r.card),/MEMBERS ONLY TEXT/);
assert.deepEqual(r.used,['student'],'access checked through the shared memberships request for this account');
find(r.card,/^Open$/).onclick();assert.deepEqual(r.asked(),['open','north','g1']);find(r.card,/Ask in Chat/).onclick();assert.deepEqual(r.asked(),['ask','north','g1'],'Ask goes through the server-checked chat context');
r=await draw([{organisationId:'north',role:'student',status:'left'}]);assert.match(words(r.card),/No longer available/);assert.ok(!find(r.card,/^Open$|Ask in Chat/),'after leaving: title only');assert.ok(r.card.cls.has('lib-unavailable'));assert.ok(find(r.card,/Remove from Library/),'it can still be removed');
r=await draw([{organisationId:'north',role:'editor',status:'active'}]);assert.match(words(r.card),/No longer available/,'a staff role is not a student space');
r=await draw([],{fail:true});assert.match(words(r.card),/Couldn’t check access/);assert.ok(!find(r.card,/^Open$/));
r=await draw([],{signedIn:false});assert.match(words(r.card),/Sign in to open this/);assert.deepEqual(r.used,[]);
// Saving writes the Library state once and rolls back if the device can't save.
const y={store:{library:D.normLibrary({})},Date,window:{OriviaDiscoveries:D},$:()=>null,renderLibraryView(){},ok:false,persist(){return y.ok}};vm.createContext(y);vm.runInContext(setSaved+';this.set=setOrgSaved',y);
assert.equal(y.set({org:'north',content:'g1',title:'T'},true),false);assert.equal(y.store.library.saved.length,0,'rolled back');
y.ok=true;assert.equal(y.set({org:'north',content:'g1',title:'T',body:'x'},true),true);assert.ok(!JSON.stringify(y.store.library).includes('"body"'));
console.log('Protected bookmarks: references only (no item text), saved from the space, opened and asked about only through an active membership re-checked by the server; after leaving or removal the title shows as no longer available: pass.');
