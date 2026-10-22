import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8');
class Node {constructor(tag,cls,text){this.tag=tag;this.className=cls;this.textContent=text;this.children=[];this.dataset={};this.attrs={};this.listeners={}}append(...c){this.children.push(...c)}setAttribute(k,v){this.attrs[k]=v}addEventListener(k,v){this.listeners[k]=v}}
const removed=[];let exported=0;
const ctx=vm.createContext({Date,URLSearchParams,uiText:s=>s,uiLanguage:()=> 'en',el:(...args)=>new Node(...args),button:(label,cls,fn)=>{const n=new Node('button',cls,label);n.onclick=fn;return n},removeEvent:id=>removed.push(id),setTimeout:fn=>fn()});
vm.runInContext(js.slice(js.indexOf('function googleEvent('),js.indexOf('/* Calendar: a week strip'))+js.slice(js.indexOf('function calendarChoices('),js.indexOf('function renderEvents(')),ctx);
const e={id:'sample',title:'A & B appointment',at:'2026-10-24T12:00:00.000Z',alarm:30};const before=JSON.stringify(e);
const row=ctx.eventRow(e,false),body=row.children[1],acts=body.children.find(n=>n.className==='acts'),options=acts.children[0],more=acts.children[1];
assert.equal(options.tag,'details');assert.equal(options.children[0].textContent,'Add to calendar');
const links=options.children.slice(1);assert.equal(links.length,3);
assert.equal(new URL(links[0].href).searchParams.get('text'),e.title);
for(const a of links.slice(1)){const u=new URL(a.href,'https://example.test');assert.equal(u.pathname,'/reminder.ics');assert.equal(u.searchParams.get('title'),e.title)}
assert.equal(links[0].rel,'noopener noreferrer');
options.open=true;links[0].listeners.click();assert.equal(options.open,false);assert.equal(body.children.at(-1).hidden,false,'handoff explains external Save is required');
assert.deepEqual(removed,[],'opening calendar choices never deletes the reminder');
const remove=more.children[1];remove.onclick();assert.deepEqual(removed,[],'first tap only asks confirmation');remove.onclick();assert.deepEqual(removed,['sample']);
assert.equal(JSON.stringify(e),before,'presentation does not alter reminder data');
const past=ctx.eventRow(e,true);assert.equal(past.children[1].children.find(n=>n.className==='acts').children.length,1,'past events only offer More');
console.log('Approved design pass: calendar choices preserve encoded details, export notice, removal confirmation and original records.');
