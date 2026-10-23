import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8'),html=fs.readFileSync('workers/trial-ui/page.html','utf8');
const block=js.slice(js.indexOf('// Desktop sidebar preference'),js.indexOf('// Desktop uses the same chat records'));
function fixture({saved='0',desktop=true,blocked=false}={}){
 const attrs={},toggle={setAttribute:(k,v)=>attrs[k]=v},body={dataset:{}},values=new Map([['orivia.sidebar.collapsed',saved]]);let renders=0;
 const ctx={document:{body},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return values.get(k)},setItem:(k,v)=>{if(blocked)throw Error('blocked');values.set(k,v)}},$:id=>id==='desktop-nav-toggle'?toggle:null,window:{matchMedia:()=>({matches:desktop})},renderChats:()=>renders++};
 vm.runInNewContext(block,ctx);return{body,toggle,attrs,values,renders:()=>renders};
}
let f=fixture();assert.equal(f.attrs['aria-expanded'],'true');f.toggle.onclick();assert.equal(f.body.dataset.sidebar,'collapsed');assert.equal(f.values.get('orivia.sidebar.collapsed'),'1');f.toggle.onclick();assert.equal(f.attrs['aria-expanded'],'true');assert.equal(f.renders(),2);
f=fixture({saved:'1'});assert.equal(f.body.dataset.sidebar,'collapsed');assert.equal(f.attrs['aria-expanded'],'false');
f=fixture({desktop:false});f.toggle.onclick();assert.equal(f.body.dataset.sidebar,'expanded');assert.equal(f.renders(),0);
f=fixture({blocked:true});assert.doesNotThrow(()=>f.toggle.onclick());assert.equal(f.attrs['aria-expanded'],'false');
for(const key of ['home','chat','library','mylife','calendar'])assert.ok(html.includes('data-sidebar-tab="'+key+'"'));
assert.ok(html.includes('aria-controls="chats-drawer"'));assert.ok(html.includes('body[data-sidebar="collapsed"]:has(#workspace:not([hidden])) #chats-drawer{display:none!important}'));
assert.ok(js.includes("if(window.matchMedia?.('(min-width:1000px)').matches)setDesktopSidebar(false)"));
console.log('Desktop sidebar: persistence, keyboard-button semantics, storage refusal, mobile isolation and existing tab destinations pass.');
