import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {calendarChangeProposal,calendarChangeReply,currentCalendarRequest} from '../workers/orivia-calendar-change.mjs';
import {runAssistantTurn} from '../workers/orivia-assistant.mjs';
assert.equal(calendarChangeProposal({kind:'update',date:'2027-02-30'}),null);
assert.equal(calendarChangeProposal({kind:'update',time:'25:00'}),null);
assert.equal(calendarChangeProposal({kind:'create'}),null);
assert.equal(calendarChangeProposal({kind:'delete'}).kind,'delete');
const stale=calendarChangeReply({kind:'update'},{},{supported:false});assert.equal(stale.calendarChange,undefined);assert.match(stale.reply,/needs refreshing/);
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8');
const code=js.slice(js.indexOf('// A proposal only.'),js.indexOf('/* The person\'s own clock:'));
class Node{constructor(tag){this.tag=tag;this.children=[];this.value='';this.textContent=''}append(...n){this.children.push(...n)}replaceChildren(){this.children=[]}setAttribute(){} }
const walk=n=>[n,...n.children.flatMap(walk)],find=(n,p)=>walk(n).find(p);
const next=new Date(Date.now()+4*86400000);next.setHours(9,0,0,0);
const first={id:'one',title:'Medical appointment',at:next.toISOString(),alarm:30},second={id:'two',title:'Bank appointment',at:next.toISOString(),alarm:60};
function setup(initial=[first,second]){
 let raw=JSON.stringify(initial),failure=false,silent=false;const eventKey='events';
 const ctx={uiText:v=>v,uiLanguage:()=>'en',Date,JSON,Set,eventKey,events:[],turns:[],ALARMS:[],localStorage:{getItem:()=>raw,setItem:(_k,v)=>{if(failure)throw Error('full');if(!silent)raw=v}},document:{createElement:t=>new Node(t)},el:(t,c,text)=>{const n=new Node(t);n.textContent=text||'';return n},button:(label,c,fn)=>{const n=new Node('button');n.textContent=label;n.onclick=fn;return n},when:e=>e.at,dayKey:d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),renderEvents(){},renderUpcoming(){},save(){},draw(){}};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 const card=(proposal,previous=[])=>{const t={role:'assistant',meta:{calendarChange:{proposal,status:'pending'}}};ctx.turns=[...previous,t];ctx.t=t;return {t,node:vm.runInContext('calendarChangeBox(t)',ctx)}};
 return {ctx,card,read:()=>JSON.parse(raw),fail:()=>failure=true,silent:()=>silent=true,raw:s=>raw=s};
}
const proposal={kind:'update',target:'Medical',time:'15:00'};
const h=setup(),{t,node}=h.card(proposal);
assert.equal(h.read()[0].at,first.at,'proposals do not change storage');
const inputs=walk(node).filter(n=>n.tag==='input');assert.equal(inputs[2].value,'15:00');
find(node,n=>n.textContent==='Save changes').onclick();assert.equal(h.read().length,2,'update does not duplicate');assert.equal(h.read()[0].id,'one');assert.equal(new Date(h.read()[0].at).getHours(),15);assert.equal(h.read()[0].alarm,30);assert.equal(t.meta.calendarChange.status,'applied');assert.match(t.content,/Updated the selected reminder/);
h.ctx.t=t;const applied=vm.runInContext('calendarChangeBox(t)',h.ctx);find(applied,n=>n.textContent==='Undo').onclick();assert.equal(h.read()[0].at,first.at);assert.equal(t.meta.calendarChange.status,'undone');
const ambiguous=setup();const a=ambiguous.card({kind:'delete',target:'appointment'});assert.equal(find(a.node,n=>n.tag==='select').value,'');assert.ok(!find(a.node,n=>n.textContent==='Delete this reminder'),'ambiguity requires a selection');
const ref=setup();const r=ref.card({kind:'delete'},[{role:'assistant',meta:{reminder:{id:'two'}}}]);find(r.node,n=>n.textContent==='Delete this reminder').onclick();assert.deepEqual(ref.read().map(e=>e.id),['one']);ref.ctx.t=r.t;find(vm.runInContext('calendarChangeBox(t)',ref.ctx),n=>n.textContent==='Undo').onclick();assert.equal(ref.read().length,2);
const uncertain=setup();const u=uncertain.card({kind:'update',target:'Medical',needsTime:true,question:'AM or PM?'});assert.equal(walk(u.node).filter(n=>n.tag==='input')[2].value,'','ambiguous time is never guessed');find(u.node,n=>n.textContent==='Save changes').onclick();assert.equal(u.t.meta.calendarChange.status,'pending');
for(const mode of ['fail','silent']){const f=setup(),c=f.card(proposal);f[mode]();find(c.node,n=>n.textContent==='Save changes').onclick();assert.equal(c.t.meta.calendarChange.status,'pending');assert.equal(f.read()[0].at,first.at)}
const race=setup(),c=race.card(proposal);race.raw(JSON.stringify([{...first,title:'Changed elsewhere'},second]));find(c.node,n=>n.textContent==='Save changes').onclick();assert.equal(c.t.meta.calendarChange.status,'pending');assert.equal(race.read()[0].title,'Changed elsewhere');
const bad=setup();bad.raw('{unreadable');const b=bad.card(proposal);assert.ok(!find(b.node,n=>n.textContent==='Save changes'));
const no=setup(),n=no.card(proposal);find(n.node,x=>x.textContent==='Not now').onclick();assert.equal(n.t.meta.calendarChange.status,'cancelled');assert.equal(no.read()[0].at,first.at);
// The model gets only conversation and existing allowed research context, never the saved calendar list.
const prompts=[];const log=console.log;console.log=()=>{};let reply;
try{reply=await runAssistantTurn({calendarChangeUI:true,messages:[{role:'user',content:'Move my medical appointment to Friday at 3pm.'}]},{},{ai:{run:async(_m,o)=>{prompts.push(JSON.parse(o.messages[1].content));return {response:JSON.stringify({action:'reply',calendarChange:{kind:'update',target:'medical',time:'15:00',requestQuote:'Move my medical appointment'}})}}},fetcher:()=>{throw Error('no search')}})}finally{console.log=log}
assert.equal(reply.calendarChange.time,'15:00');assert.equal(reply.reminder,undefined);assert.match(reply.reply,/Review/);assert.ok(!JSON.stringify(prompts).includes('Bank appointment'));assert.equal(reply.research.assistant,true);
// An applied edit survives a chat reload, and Undo refuses a subsequent edit.
const reload=setup(),x=reload.card(proposal);find(x.node,n=>n.textContent==='Save changes').onclick();
const saved=JSON.parse(JSON.stringify(x.t));reload.ctx.t=saved;const recovered=vm.runInContext('calendarChangeBox(t)',reload.ctx);assert.ok(find(recovered,n=>n.textContent==='Undo'));
reload.raw(JSON.stringify(reload.read().map(e=>e.id==='one'?{...e,title:'Later edit'}:e)));find(recovered,n=>n.textContent==='Undo').onclick();assert.equal(reload.read()[0].title,'Later edit');assert.equal(saved.meta.calendarChange.status,'applied');
assert.equal(calendarChangeProposal({kind:'update',date:'2027-01-01garbage'}),null);
console.log('Calendar changes: proposals, matching, ambiguity, edit in place, delete, Undo, storage failure, stale data and no calendar disclosure passed');

const oldRequest={role:'user',content:'Move the reminder to 12pm'};
for(const latest of ["J'AI BESOIN D'AIDE",'je suis perdu','quoi?','I am lost','what?','أحتاج مساعدة']){
 assert.equal(currentCalendarRequest({requestQuote:oldRequest.content},[oldRequest,{role:'user',content:latest}]),false,'older request cannot authorise a new proposal');
 assert.equal(currentCalendarRequest({requestQuote:latest},[oldRequest,{role:'user',content:latest}]),false,'feedback cannot authorise a new proposal');
 let count=0;const previousLog=console.log;console.log=()=>{};
 try{
 const response=await runAssistantTurn({replyLanguage:'fr',calendarChangeUI:true,messages:[oldRequest,{role:'assistant',content:'Review the reminder below.'},{role:'user',content:latest}]},{},{maxCalls:3,ai:{run:async(_m,o)=>{
  count++;const state=JSON.parse(o.messages[1].content);
  if(count===1)return {response:JSON.stringify({action:'reply',calendarChange:{kind:'update',time:'12:00',requestQuote:latest}})};
  assert.ok(state.previous_reply_rejected);
  return {response:JSON.stringify({action:'ask',question:'Vous êtes perdu dans un endroit, ou vous ne savez pas quoi faire ?'})};
 }},fetcher:()=>{throw Error('no research needed')}});
 assert.equal(response.calendarChange,undefined);assert.match(response.reply,/perdu/);assert.equal(count,2);
 }finally{console.log=previousLog}
}
assert.equal(currentCalendarRequest({requestQuote:'Déplace mon rappel à midi'},[{role:'user',content:'Déplace mon rappel à midi'}]),true);
assert.equal(currentCalendarRequest({requestQuote:'12pm'},[{role:'user',content:'12pm'}]),true);
