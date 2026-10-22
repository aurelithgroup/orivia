/* University space actions (21 Oct): labelled university content, buttons only for staff-supplied details, dates saved only
 * after confirmation and only once, converted from the university's time zone. Run: node tests/university-actions.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// 1. Calendar: the real code from chat.js with in-memory events.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
const block=chat.slice(chat.indexOf('/* University dates (21 Oct)'),chat.indexOf('function saveChatReminder(r){'));
const cal={window:{},Intl,Date,Math,Number,String,Object,events:[],stored:0};
vm.createContext(cal);vm.runInContext('function loadEvents(){}function storeEvents(){stored++}function renderEvents(){}function renderUpcoming(){}\n'+block,cal);
const C=cal.window.OriviaCalendar;
assert.equal(C.instant('2026-11-12','17:00','Asia/Dubai').toISOString(),'2026-11-12T13:00:00.000Z','Dubai is UTC+4');
assert.equal(C.instant('2026-07-01','12:00','Europe/London').toISOString(),'2026-07-01T11:00:00.000Z','London summer time');
assert.equal(C.instant('2026-12-01','12:00','Europe/London').toISOString(),'2026-12-01T12:00:00.000Z','London winter time');
assert.equal(C.instant('2026-11-12','bad','Asia/Dubai'),null);
const next=new Date(Date.now()+20*86400000).toISOString().slice(0,10);
const item={org:'north-1',content:'date-1',revision:2,title:'Visa medical deadline',date:next,time:'17:00',timeZone:'Asia/Dubai'};
assert.equal(C.hasOrganisationItem(item),false);
let r=C.addOrganisationDate(item);assert.equal(r.ok,true);assert.equal(cal.events.length,1);assert.deepEqual({...cal.events[0].source},{org:'north-1',content:'date-1',revision:2},'tagged with its source');
assert.equal(C.addOrganisationDate({...item,revision:3}).reason,'duplicate','the same university item is never added twice');assert.equal(cal.events.length,1);
assert.equal(C.hasOrganisationItem(item),true);
assert.equal(C.addOrganisationDate({...item,content:'date-2',date:'2020-01-01'}).reason,'past');
r=C.addOrganisationDate({...item,content:'date-3',time:undefined,timeZone:undefined});assert.equal(r.ok,true);assert.equal(r.event.allDay,true,'all-day dates are marked as such');
assert.equal(C.addOrganisationDate({...item,content:'date-4',org:'other-org'}).ok,true,'another organisation’s item is a different entry');

// 2. The university space: labels, buttons only for supplied details, confirmation before saving.
class N{constructor(tag='div'){this.tag=tag;this.children=[];this.hidden=true;this.textContent='';this.listeners={};this.dataset={};this.classList={add(){},remove(){}}}
 append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}unshift(){}addEventListener(k,f){this.listeners[k]=f}focus(){}scrollIntoView(){}querySelectorAll(){return []}
 get childElementCount(){return this.children.length}get lastChild(){return this.children.at(-1)}}
const roots=new Map(['home-spaces','home-spaces-list','organisation-sheet','organisation-body','organisation-title','organisation-close'].map(k=>[k,new N()]));
const walk=n=>[n,...(n.children||[]).flatMap(walk)],words=n=>walk(n).map(n=>n.textContent).join(' '),find=(n,text)=>walk(n).find(x=>x.textContent===text);
const saved=[];const fakeCal={has:false,hasOrganisationItem(){return this.has},addOrganisationDate(o){saved.push(o);this.has=true;return {ok:true}},instant:C.instant};
const content=[
 {id:'g1',kind:'guide',title:'Arrival guide',body:'Your first week.',details:{sourceUrl:'https://northbay.example/arrival'},revision:1},
 {id:'g2',kind:'guide',title:'Library guide',body:'Borrowing books.',details:null,revision:1},
 {id:'d1',kind:'date',title:'Visa medical deadline',body:'Book before this date.',details:{date:next,time:'17:00',timeZone:'Asia/Dubai'},revision:4},
 {id:'c1',kind:'contact',title:'Student services',body:'Ask us anything.',details:{phone:'+971 4 123 4567',email:'help@northbay.example'},revision:1},
 {id:'u1',kind:'update',title:'Medicals open',body:'Bookings are open.',details:{relatedId:'g1',actionLabel:'Book a slot',actionUrl:'https://northbay.example/book'},revision:1},
 {id:'u2',kind:'update',title:'Other update',body:'No links here.',details:{relatedId:'not-in-this-space'},revision:1}];
const ctx={queueMicrotask,setTimeout,location:{pathname:'/app'},history:{pushState(){}},Intl,
 window:{addEventListener(){},OriviaAccounts:{get user(){return {id:'student'}}},OriviaCalendar:fakeCal},
 document:{getElementById:k=>roots.get(k)||null,createElement:t=>new N(t),addEventListener(){},activeElement:null},AbortSignal,
 fetch:async path=>Response.json(path.includes('memberships')?{platformRoles:[],memberships:[{organisationId:'north-1',name:'Northbay University',role:'student',status:'active'}]}:{organisation:{demo:false,name:'Northbay University'},content})};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('workers/trial-ui/spaces.js','utf8'),ctx);
await ctx.window.OriviaSpaces.refresh();await roots.get('home-spaces-list').children.find(x=>x.tag==='button').onclick();
const body=roots.get('organisation-body'),all=words(body);
assert.match(all,/From Northbay University/,'university-provided information is labelled');assert.match(all,/← My Orivia/,'a way back to personal Orivia');
const hrefs=walk(body).filter(n=>n.href).map(n=>n.textContent+'='+n.href);
assert.ok(hrefs.includes('Source page ↗=https://northbay.example/arrival'));assert.ok(hrefs.includes('Call=tel:+97141234567'));assert.ok(hrefs.includes('Email=mailto:help@northbay.example'));
assert.ok(!hrefs.some(h=>h.startsWith('Website')),'no website button when staff gave none');assert.ok(hrefs.includes('Book a slot ↗=https://northbay.example/book'));
assert.ok(find(body,'Open guide: Arrival guide'),'an update links to its guide');assert.ok(!walk(body).some(n=>/not-in-this-space/.test(n.textContent)),'a missing related guide shows nothing');
assert.equal(walk(body).filter(n=>n.target==='_blank').every(n=>n.rel==='noopener noreferrer'),true);
// Dates: shown in the university's time, then a confirmation before anything is saved.
assert.match(all,/GMT\+4|UTC\+4|Gulf/,'time shown in the university’s time zone');
find(body,'Add to my calendar').onclick();assert.equal(saved.length,0,'nothing is saved before confirmation');assert.match(words(body),/isn’t told/);
find(body,'Add').onclick();assert.equal(saved.length,1);assert.deepEqual({...saved[0]},{org:'north-1',content:'d1',revision:4,title:'Visa medical deadline',date:next,time:'17:00',timeZone:'Asia/Dubai'});
assert.match(words(body),/Added to your calendar/);
const js=fs.readFileSync('workers/trial-ui/spaces.js','utf8');assert.doesNotMatch(js,/innerHTML|\/v1\/chat|profileForAI|eventKey/,'no personal data or chat from the space');
console.log('University actions: labelled content, buttons only for supplied details, safe links, related guides, dates converted, confirmed and saved once.');
// Step 9 (22 Oct): students mark guides and key dates done; sharing is theirs to switch off; staff see totals only.
{const sp=fs.readFileSync('workers/trial-ui/spaces.js','utf8').replace(/\r\n/g,'\n');
 assert.ok(sp.includes("if(prog&&(kind==='guide'||kind==='date'))actions.append(doneButton(c));"),'Done on guides and key dates only');
 assert.ok(sp.includes("'/progress-sharing',id,{share:!sharing}")&&sp.includes('They never see your name'),'a clear sharing switch');
 assert.ok(sp.includes("if(!current(id,g))return;want?done.add(c.id):done.delete(c.id)"),'a late answer from another space or account is ignored');}
