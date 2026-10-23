import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {checkedHandoff,verifyReply,render,runAssistantTurn} from '../workers/orivia-assistant.mjs';
const ledger=[{id:'E1',kind:'website',url:'https://www.example-hotel.com/contact',title:'Example Hotel Dubai',excerpt:'Example Hotel Dubai\nAddress: Corniche Road, Deira, Dubai\nReception +971 4 555 1234',checkedAt:'2026-10-19T12:00:00Z'}];
const texts={en:'Please help me get to Example Hotel Dubai.',ar:'من فضلك ساعدني في الوصول إلى Example Hotel Dubai.',fr:'Pouvez-vous m’aider à rejoindre Example Hotel Dubai ?'};
const input={showMessage:{texts},destinations:[{name:'Example Hotel Dubai',address:'Corniche Road, Deira, Dubai',evidence:'E1'}]};
let checked=checkedHandoff(input,ledger,'I need to get to Example Hotel Dubai.','fr');assert.equal(checked.errors.length,0);assert.deepEqual(Object.keys(checked.showMessage.texts),['en','ar','fr']);assert.equal(checked.destinations.length,1);
assert.equal(checkedHandoff({showMessage:{texts:{en:texts.en,ar:texts.ar}}},ledger,'','fr').showMessage,null,'missing user-language version is not silently relabelled');
assert.equal(checkedHandoff({showMessage:{texts:{...texts,fr:'Call +971 4 999 9999'}}},ledger,'','fr').showMessage,null,'invented translated contact rejected');
assert.equal(checkedHandoff({destinations:[{...input.destinations[0],address:'Imagined entrance 27'}]},ledger).destinations.length,0);
assert.equal(checkedHandoff(input,[{...ledger[0],kind:'listing'}]).destinations.length,0,'a listing cannot prove the destination');
assert.equal(checkedHandoff(input,[{...ledger[0],url:'https://unrelated.example/contact'}]).destinations.length,0);
const c=verifyReply({...input,sentences:[{text:'Here is a message to show someone.',kind:'general',evidence:[]}]},ledger,{replyLanguage:'fr'});assert.ok(c.ok,c.errors);const view=render(c);assert.equal(view.destinations[0].sourceId,'S1');assert.equal(view.liveSources[0].url,ledger[0].url);assert.equal(view.destinations[0].quote,'Corniche Road, Deira, Dubai');
class Node{
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.listeners={};this.style={};this.isConnected=true;this.textContent=''}
 append(...nodes){this.children.push(...nodes)}setAttribute(k,v){this.attrs[k]=v}focus(){this.focused=true}addEventListener(k,fn){this.listeners[k]=fn}showModal(){this.open=true}close(){this.open=false;this.listeners.close?.()}remove(){this.removed=true}
}
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8'),part=js.slice(js.indexOf('/* ===== Show someone'),js.indexOf('/* ===== End handoff cards ===== */'));
let stops=0,spoken=[];const body=new Node('body');body.style.overflow='auto';
const ctx={URLSearchParams,uiText:x=>x,uiLanguage:()=>'fr',canSpeak:true,sourcedItem:(x,srcs)=>{const src=srcs.find(s=>s.id===x?.sourceId);return src&&x.quote?{src,quote:x.quote}:null},el:(tag,cls,text)=>{const n=new Node(tag);n.className=cls;n.textContent=text||'';return n},button:(label,cls,fn)=>{const n=new Node('button');n.className=cls;n.textContent=label;n.onclick=fn;return n},document:{body,createElement:tag=>new Node(tag)},stopSpeaking:()=>stops++,stopDictation:()=>{},listen:(text,_btn,opts)=>spoken.push({text,language:opts.language})};vm.createContext(ctx);vm.runInContext(part,ctx);
assert.equal(ctx.safeShowMessage({texts:{en:'Only English'}}),null);
const sources=[{id:'S1',category:'organisation',url:ledger[0].url,host:'example-hotel.com'}];
assert.equal(ctx.safeDestinations([{name:'Fake',sourceId:'S9',quote:'fake'}],sources).length,0);
assert.equal(ctx.safeDestinations([{name:'Fake',sourceId:'S1',quote:'fake'}],[{...sources[0],category:'directory'}]).length,0);
const links=ctx.mapSearchLinks({name:'Example & Hotel? #1',address:'Deira, Dubai'});assert.equal(new URL(links.google).searchParams.get('query'),'Example & Hotel? #1, Deira, Dubai');assert.equal(new URL(links.google).hostname,'www.google.com');assert.equal(new URL(links.apple).hostname,'maps.apple.com');assert.ok(!/origin|latitude|longitude|api_key/.test(links.google));
const opener=new Node('button');ctx.openHandoff({texts},opener);const dialog=body.children.at(-1),walk=n=>[n,...n.children.flatMap(walk)],all=walk(dialog);assert.equal(dialog.open,true);assert.equal(body.style.overflow,'hidden');assert.equal(spoken.length,0,'opening never speaks automatically');
const message=all.find(n=>n.className==='handoff-message'),langs=all.filter(n=>n.tag==='button'&&['English','العربية','Français'].includes(n.textContent));assert.equal(langs.length,3);assert.equal(message.lang,'fr');
langs.find(n=>n.textContent==='العربية').onclick();assert.equal(message.dir,'rtl');assert.equal(message.textContent,texts.ar);
all.find(n=>n.className==='btn handoff-listen').onclick();assert.equal(spoken[0].language,'ar');assert.equal(spoken[0].text,texts.ar);
langs.find(n=>n.textContent==='English').onclick();assert.equal(message.dir,'ltr');assert.equal(message.textContent,texts.en);const beforeClose=stops;all.find(n=>n.textContent==='Close').onclick();assert.ok(stops>beforeClose);assert.equal(body.style.overflow,'auto');assert.equal(opener.focused,true);assert.equal(dialog.removed,true);
assert.ok(!/geolocation|innerHTML/.test(part),'no location request or model HTML injection');assert.match(js,/language=null,feedback=null/);assert.match(js,/if\(run!==speakRun\)return/,'closing while voices load cannot start late speech');
// The existing response path carries both cards; no separate translation/network request.
let calls=0;const oldLog=console.log;console.log=()=>{};try{
const reply=await runAssistantTurn({replyLanguage:'fr',messages:[{role:'user',content:'Please write a message I can show someone to get home.'}]},{},{ai:{run:async()=>{calls++;return {response:JSON.stringify({action:'reply',sentences:[{kind:'general',text:'Voici un message à montrer.',evidence:[]}],showMessage:{texts}})}}}});
assert.equal(reply.showMessage.texts.fr,texts.fr);assert.equal(calls,1);
}finally{console.log=oldLog}
console.log('Handoff cards: translated messages, sourced destinations, map encoding, manual speech/language, close/focus, no geolocation, and scripted response integration passed');
