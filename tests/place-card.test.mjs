import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {placeImageFromPage,loadPlacePhoto} from '../workers/orivia-place-card.mjs';
import {checkedHandoff,render,verifyReply,runAssistantTurn} from '../workers/orivia-assistant.mjs';
const source='https://sample-hotel.example/contact';
assert.equal(placeImageFromPage('<meta content="/hotel.jpg?a=1&amp;b=2" property="og:image">',source),'https://sample-hotel.example/hotel.jpg?a=1&b=2');
for(const path of ['http://sample-hotel.example/a.jpg','https://other.example/a.jpg','/logo.png','javascript:alert(1)','https://user:pass@sample-hotel.example/a.jpg'])assert.equal(placeImageFromPage('<meta property="og:image" content="'+path+'">',source),'');
const bytes=new Uint8Array([255,216,255,...Array(25).fill(5)]);let requests=0;
const photo=await loadPlacePhoto('https://sample-hotel.example/photo.jpg',source,{fetcher:async(_url,options)=>{requests++;assert.equal(options.redirect,'manual');assert.equal(options.credentials,'omit');return new Response(bytes,{headers:{'content-type':'image/jpeg'}})}});assert.ok(photo.data.startsWith('data:image/jpeg;base64,'));assert.equal(photo.sourceUrl,source);
assert.equal(await loadPlacePhoto('https://elsewhere.example/photo.jpg',source,{fetcher:()=>{throw Error('should not fetch')}}),null);
for(const response of [new Response('not an image',{headers:{'content-type':'image/jpeg'}}),new Response(bytes,{status:302,headers:{location:'https://other.example/a.jpg','content-type':'image/jpeg'}}),new Response('<svg/>',{headers:{'content-type':'image/svg+xml'}}),new Response(new Uint8Array(121000),{headers:{'content-type':'image/png'}})])assert.equal(await loadPlacePhoto('https://sample-hotel.example/photo.jpg',source,{fetcher:async()=>response}),null);
const ev={id:'E1',url:source,title:'Sample Hotel',kind:'website',excerpt:'Sample Hotel\nCorniche Road, Deira\nApartments and guest services\nReception open daily'};
const item={name:'Sample Hotel',address:'Corniche Road, Deira',description:'Apartments and guest services',details:[{label:'Reception',value:'Reception open daily'},{label:'Rent',value:'AED 70,000'}],evidence:'E1'};
const h=checkedHandoff({destinations:[item]},[ev]);assert.equal(h.destinations[0].details.length,1);assert.equal(h.destinations[0].description,item.description);
assert.equal(checkedHandoff({destinations:[{...item,description:'Walkable and cheap'}]},[ev]).destinations[0].description,'');
const out=render(verifyReply({sentences:[{text:'Here is the place.',kind:'general',evidence:[]}],destinations:[item]},[ev]));assert.equal(out.destinations[0].details[0].quote,'Reception open daily');
class Node{constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.textContent='';this.hidden=false}append(...n){this.children.push(...n)}setAttribute(k,v){this.attrs[k]=v}replaceChildren(){this.children=[]}remove(){this.removed=true}}
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8'),part=js.slice(js.indexOf('/* ===== Show someone'),js.indexOf('let handoffDialog='));let saves=0;const root=new Node('div');const sources=[{id:'S1',url:source,category:'organisation',host:'sample-hotel.example'}];
const turn={role:'assistant',meta:{destinations:out.destinations,sources}},store={chats:[{id:'c1',title:'A place',turns:[turn]}]};
const ctx={URLSearchParams,uiText:v=>v,uiLanguage:()=>'en',icon:()=>new Node('svg'),sourcedItem:(x,ss)=>{const src=ss.find(s=>s.id===x.sourceId);return src&&x.quote?{src,quote:x.quote}:null},safeSources:x=>x,el:(t,c,text)=>{const n=new Node(t);n.className=c;n.textContent=text||'';return n},button:(text,c,fn)=>{const n=new Node('button');n.className=c;n.textContent=text;n.onclick=fn;return n},document:{createElement:t=>new Node(t)},$:()=>root,store,save:()=>{saves++;return true},openChat:()=>{}};vm.createContext(ctx);vm.runInContext(part,ctx);
const walk=n=>[n,...n.children.flatMap(walk)],card=ctx.destinationCards(out.destinations,sources,turn),nodes=walk(card);
assert.equal(nodes.filter(n=>n.tag==='img').length,0,'missing photo renders illustration');assert.ok(nodes.some(n=>n.className==='place-art'));
const chooser=nodes.find(n=>n.className==='place-map-choice'),go=nodes.find(n=>n.className==='btn place-go');assert.equal(chooser.hidden,true);go.onclick();assert.equal(chooser.hidden,false);assert.equal(go.attrs['aria-expanded'],'true');
const save=nodes.find(n=>n.className==='btn place-save');save.onclick();assert.equal(saves,1);assert.equal(save.textContent,'♥ Saved');assert.ok(root.children.length);assert.equal(turn.meta.savedPlaces.length,1);
const restored=ctx.destinationCards(JSON.parse(JSON.stringify(out.destinations)),sources,JSON.parse(JSON.stringify(turn)));assert.equal(walk(restored).find(n=>n.className==='btn place-save').textContent,'♥ Saved');save.onclick();assert.equal(turn.meta.savedPlaces.length,0);
const imageCard=ctx.destinationCards([{...out.destinations[0],image:photo}],sources,turn);const img=walk(imageCard).find(n=>n.tag==='img');assert.ok(img);assert.equal(img.referrerPolicy,'no-referrer');img.onerror();assert.equal(img.removed,true);
assert.equal(ctx.safeDestinations([{...out.destinations[0],image:{data:'data:image/svg+xml;base64,PHN2Zz4=',sourceUrl:source}}],sources)[0].image,null);
assert.ok(!/geolocation|iframe|innerHTML/.test(part));
// Directions from where the person is (ORI-CAL-006, ORI-CAL-005): Orivia never reads location (no navigator in this
// context: any use would throw); the map app starts from the device's position instead, keeping the chosen mode.
{const routed=[{...out.destinations[0],route:{origin:'Al Garhoud metro station',mode:'driving'}}];const n=walk(ctx.destinationCards(routed,sources,turn));
 const hrefs=()=>walk(n.find(x=>x.className==='place-map-links')).filter(x=>x.tag==='a').map(x=>x.href);
 assert.ok(hrefs()[0].includes('origin=Al+Garhoud')&&hrefs()[0].includes('travelmode=driving'));assert.ok(hrefs()[1].includes('dirflg=d'));
 const here=n.find(x=>x.textContent==='Start from where I am instead');here.onclick();assert.equal(here.attrs['aria-pressed'],'true');
 assert.ok(hrefs().every(h=>!/origin=|saddr=/.test(h)),'no starting point: the map app uses its own location');assert.ok(hrefs()[0].includes('travelmode=driving'),'driving stays driving');
 assert.ok(n.some(x=>/doesn’t see it/.test(x.textContent)&&!x.hidden));here.onclick();assert.ok(hrefs()[0].includes('origin=Al+Garhoud'),'and back to the typed start');
 const open=walk(ctx.destinationCards([{...out.destinations[0],route:{origin:'',mode:'walking'}}],sources,turn));assert.ok(open.some(x=>/Directions start from where you are/.test(x.textContent)));
 assert.ok(!/navigator.geolocation/.test(js),'the app never asks the browser for location')}
console.log('Place cards: bounded same-origin raster preview, redirect/type/size failure, sourced details, map chooser, Save/reload/My Life, and illustration fallback passed');

// Real assistant orchestration, scripted model/pages: optional photo is attached after the evidence check.
let calls=0;const fetched=[];const log=console.log;console.log=()=>{};
try{
 const response=await runAssistantTurn({messages:[{role:'user',content:'Help me reach Sample Hotel: '+source}]},{},{ai:{run:async(_m,options)=>{
  calls++;assert.ok(!JSON.stringify(options.messages).includes('data:image/'));
  return {response:JSON.stringify(calls===1?{action:'tools',calls:[{tool:'read_page',url:source,focus:'address'}]}:{action:'reply',sentences:[{text:'Here is the destination.',kind:'general',evidence:[]}],destinations:[item]})};
 }},fetcher:async url=>{fetched.push(String(url));return String(url).endsWith('/photo.jpg')?new Response(bytes,{headers:{'content-type':'image/jpeg'}}):new Response('<html><head><title>Sample Hotel</title><meta property="og:image" content="/photo.jpg"></head><body><h1>Sample Hotel</h1><p>Corniche Road, Deira</p><p>Apartments and guest services</p><p>Reception open daily</p></body></html>',{headers:{'content-type':'text/html'}})}});
 assert.equal(response.destinations.length,1);assert.ok(response.destinations[0].image.data.startsWith('data:image/jpeg;base64,'));assert.equal(fetched.filter(u=>u.endsWith('/photo.jpg')).length,1);assert.equal(calls,2);
}finally{console.log=log}
