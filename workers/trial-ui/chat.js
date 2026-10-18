'use strict';
/* Orivia private AI trial: chat-first mobile app with Calendar, Journeys and My Life behind it. */
const key='orivia-ai-private-turns',ck='orivia-ai-private-consent',eventKey='orivia-private-events-v1',profileKey='orivia-private-profile-v1';
let turns=[],busy=false,events=[];
const $=id=>document.getElementById(id);
const TITLES={chat:'',calendar:'Calendar',journeys:'Journeys',mylife:'My Life',guide:'Journeys',settings:'Settings'};
function show(){
 $('intro').hidden=true;$('workspace').hidden=false;$('nav').hidden=false;$('open-settings').hidden=false;$('open-chats').hidden=false;
 loadChats();const c=activeChat();turns=c?c.turns.slice():[];

 draw();tab('chat');
}
/* ===== Chat history: saved on this device (localStorage), no account, no sync =====
   store = {chats:[{id,title,titled,created,updated,pinned,archived,turns}], active}
   Only the active chat is shown and only its latest messages go to the AI. */
const chatsKey='orivia-private-chats-v1',chatsBackupKey='orivia-private-chats-v1-unreadable';
// Nothing here ever deletes or shortens a conversation on its own. If saving fails, the chat stays on screen,
// the person is told plainly, and they choose what to delete. Only the latest 12 messages go to the AI.
let store={chats:[],active:null};
const validTurn=x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string'&&x.content.trim();
const newId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function autoTitle(ts){const u=(ts.find(t=>t.role==='user')||{}).content||'New chat';const t=u.replace(/\s+/g,' ').trim();return t.length>48?t.slice(0,46).replace(/\s\S*$/,'')+'…':t}
function normChat(c){
 if(!c||typeof c!=='object'||typeof c.id!=='string')return null;
 const ts=Array.isArray(c.turns)?c.turns.filter(validTurn).map(t=>({role:t.role,content:String(t.content).slice(0,t.role==='assistant'?4000:2000),...(t.meta&&typeof t.meta==='object'?{meta:t.meta}:{})})):[];
 return {id:c.id.slice(0,24),title:String(c.title||autoTitle(ts)).slice(0,80),titled:!!c.titled,created:Number(c.created)||Date.now(),updated:Number(c.updated)||Date.now(),pinned:!!c.pinned,archived:!!c.archived,turns:ts};
}
let storeLocked=false; // saved chats exist but couldn't be read or backed up: never overwrite them
function storageWarn(msg){
 const w=$('storage-warn');if(!w)return;
 if(!msg){w.hidden=true;return}
 $('storage-warn-text').textContent=msg;w.hidden=false;
}
function persist(){
 store.chats=store.chats.filter(c=>c.turns.length||c.id===store.active); // empty new chats aren't data
 if(storeLocked){storageWarn('Your saved chats on this device couldn’t be read, so Orivia isn’t saving new messages over them. This chat will be lost when you close the page.');return false}
 try{localStorage.setItem(chatsKey,JSON.stringify(store));storageWarn('');return true}
 catch(_){
  storageWarn('This device is out of space, so your latest messages aren’t saved yet. Nothing has been deleted. Delete chats you no longer need, and Orivia will save this one again.');
  return false;
 }
}
function savedHas(c){
 try{const d=JSON.parse(localStorage.getItem(chatsKey)||'null');const x=d&&Array.isArray(d.chats)&&d.chats.find(y=>y&&y.id===c.id);return !!x&&Array.isArray(x.turns)&&x.turns.length===c.turns.length}catch(_){return false}
}
function legacyId(ts){let h=0;for(const ch of JSON.stringify(ts.map(t=>[t.role,t.content])))h=(h*31+ch.charCodeAt(0))|0;return 'clegacy'+(h>>>0).toString(36)}
function loadChats(){
 storeLocked=false;store={chats:[],active:null};
 let raw=null;try{raw=localStorage.getItem(chatsKey)}catch(_){}
 if(raw){
  let d=null;try{d=JSON.parse(raw)}catch(_){}
  if(d&&Array.isArray(d.chats))store={chats:d.chats.map(normChat).filter(Boolean),active:typeof d.active==='string'?d.active:null};
  else{ // unreadable: keep an untouched copy before anything new is written; if that fails, don't write at all
   try{if(localStorage.getItem(chatsBackupKey)===null)localStorage.setItem(chatsBackupKey,raw)}catch(_){storeLocked=true}
   if(!storeLocked)storageWarn('Your earlier saved chats couldn’t be read. A copy has been kept on this device, and new chats will be saved separately.');
  }
 }
 // Migration: the conversation that used to live only in this tab becomes a saved chat.
 // The old copy is removed only after the new one is confirmed saved; otherwise it stays for next time.
 try{const old=JSON.parse(sessionStorage.getItem(key)||'null');
  if(Array.isArray(old)&&old.some(validTurn)){
   const ts=old.filter(validTurn);const id=legacyId(ts);
   let c=store.chats.find(x=>x.id===id);
   if(!c){c=normChat({id,turns:ts,created:Date.now(),updated:Date.now()});store.chats.unshift(c)}
   store.active=c.id;
   if(persist()&&savedHas(c))sessionStorage.removeItem(key);
  }else if(Array.isArray(old))sessionStorage.removeItem(key); // nothing in it to keep
 }catch(_){}
 if(store.active&&!store.chats.some(c=>c.id===store.active))store.active=null;
}
function activeChat(){return store.chats.find(c=>c.id===store.active)||null}
function save(){
 let c=activeChat();
 if(!c){if(!turns.length)return;c=normChat({id:newId(),turns:[],created:Date.now()});store.chats.unshift(c);store.active=c.id}
 c.turns=turns.slice();c.updated=Date.now();if(!c.titled)c.title=autoTitle(c.turns);
 const ok=persist();renderChats();return ok;
}
function clearChatCards(){resources([]);for(const id of ['guide-offer','remember-card','inline-calendar'])$(id)?.remove();$('status').textContent=''}
function openChat(id){stopSpeaking();stopDictation(false);store.active=id;persist();const c=activeChat();turns=c?c.turns.slice():[];clearChatCards();draw();closeChats();tab('chat')}
function newChat(){stopSpeaking();stopDictation(false);store.active=null;persist();turns=[];clearChatCards();draw();closeChats();tab('chat');$('msg').focus()}
function whenShort(t){const d=new Date(t),now=new Date();const same=d.toDateString()===now.toDateString();const y=new Date(now);y.setDate(now.getDate()-1);
 return same?d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}):d.toDateString()===y.toDateString()?'Yesterday':d.toLocaleDateString(undefined,{day:'numeric',month:'short'})}
function chatRow(c){
 const row=el('div','chat-row'+(c.id===store.active?' active':''));
 const line=el('div','chat-line');
 const open=button('','chat-open',()=>openChat(c.id));open.append(el('strong','',c.title||'New chat'),el('small','',(c.pinned?'Pinned · ':'')+whenShort(c.updated)+' · '+c.turns.length+(c.turns.length===1?' message':' messages')));
 if(c.id===store.active)open.setAttribute('aria-current','true');
 const more=button('⋯','more',()=>{menu.hidden=!menu.hidden;more.setAttribute('aria-expanded',String(!menu.hidden))});more.setAttribute('aria-label','Options for '+(c.title||'chat'));more.setAttribute('aria-expanded','false');
 line.append(open,more);row.append(line);
 const menu=el('div','row menu');menu.hidden=true;
 menu.append(button('Rename','btn quiet small',()=>{
  const f=document.createElement('form');f.className='chat-rename';const inp=document.createElement('input');inp.value=c.title;inp.maxLength=80;inp.setAttribute('aria-label','Chat name');
  const ok=el('button','btn small','Save');ok.type='submit';f.append(inp,ok,button('Cancel','btn text small',()=>renderChats()));
  f.onsubmit=e=>{e.preventDefault();const v=inp.value.replace(/\s+/g,' ').trim();if(v){c.title=v.slice(0,80);c.titled=true;persist()}renderChats()};
  row.replaceChildren(f);inp.focus();inp.select();
 }));
 menu.append(button(c.pinned?'Unpin':'Pin','btn quiet small',()=>{c.pinned=!c.pinned;persist();renderChats()}));
 menu.append(button(c.archived?'Unarchive':'Archive','btn quiet small',()=>{c.archived=!c.archived;if(c.archived&&c.id===store.active){store.active=null;turns=[];clearChatCards();draw()}persist();renderChats()}));
 const del=button('Delete','btn text small',()=>{
  if(del.dataset.sure!=='1'){del.dataset.sure='1';del.textContent='Tap again to delete this chat for good';return}
  store.chats=store.chats.filter(x=>x!==c);if(c.id===store.active){store.active=null;turns=[];clearChatCards();draw()}persist();renderChats();
 });
 menu.append(del);row.append(menu);return row;
}
function renderChats(){
 const list=$('chats-list'),arch=$('archived-list');if(!list)return;
 const by=(a,b)=>b.updated-a.updated;
 const live=store.chats.filter(c=>!c.archived&&c.turns.length),pinned=live.filter(c=>c.pinned).sort(by),recent=live.filter(c=>!c.pinned).sort(by),archived=store.chats.filter(c=>c.archived&&c.turns.length).sort(by);
 list.replaceChildren();
 if(pinned.length){list.append(el('p','chat-group','Pinned'));for(const c of pinned)list.append(chatRow(c))}
 if(recent.length){list.append(el('p','chat-group','Recent'));for(const c of recent)list.append(chatRow(c))}
 if(!live.length)list.append(el('p','notice','No saved chats yet. Start one and it will appear here.'));
 arch.replaceChildren();for(const c of archived)arch.append(chatRow(c));
 if(!archived.length)arch.append(el('p','tiny','Archived chats are kept here until you delete them.'));
 $('archived-count').textContent=String(archived.length);
}
let chatsReturnFocus=null;
function openChats(){chatsReturnFocus=document.activeElement;renderChats();$('chats-drawer').hidden=false;$('new-chat').focus()}
function closeChats(){if($('chats-drawer').hidden)return;$('chats-drawer').hidden=true;(chatsReturnFocus||$('open-chats')).focus?.()}
$('open-chats').onclick=openChats;$('storage-manage').onclick=openChats;$('close-chats').onclick=closeChats;$('new-chat').onclick=newChat;
$('chats-drawer').addEventListener('click',e=>{if(e.target.id==='chats-drawer')closeChats()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('chats-drawer').hidden)closeChats()});

/* ===== Information cards (organisations) =====
   D: several results with a shortlist · A: one organisation · B: email draft / phone script · C: help choosing a next step.
   Every fact and contact must name a vetted source (sourceId) and carry its supporting quote, or it isn't shown.
   Contract proposed to Ina (reply.organisations); see docs/information-cards.md. */
const MAPS_HOSTS=['goo.gl','maps.app.goo.gl','www.google.com','google.com','maps.google.com'];
const ORG_KINDS={school:'School',organisation:'Organisation',bank:'Bank',clinic:'Clinic',office:'Office'};
function sourcedItem(x,srcs){
 if(!x||typeof x!=='object')return null;
 const src=srcs.find(s=>s.id&&s.id===x.sourceId);if(!src)return null;
 const quote=typeof x.quote==='string'?x.quote.replace(/\s+/g,' ').trim().slice(0,300):'';if(quote.length<4)return null;
 return {src,quote};
}
function safePhone(v){const s=typeof v==='string'?v.trim():'';if(!/^\+?[0-9][0-9 ()-]{5,18}[0-9]$/.test(s))return '';return s}
function safeEmail(v){const s=typeof v==='string'?v.trim():'';return /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,180}\.[A-Za-z]{2,24}$/.test(s)?s:''}
function safeHttps(v,hosts){try{const u=new URL(String(v));if(u.protocol!=='https:'||u.username||u.password)return '';if(hosts&&!hosts.includes(u.hostname))return '';if(hosts&&u.hostname.endsWith('google.com')&&!u.pathname.startsWith('/maps'))return '';if(hosts&&u.hostname==='goo.gl'&&!u.pathname.startsWith('/maps/'))return '';return u.href}catch(_){return ''}}
function safeOrgs(list,srcs){
 if(!Array.isArray(list)||!srcs.length)return [];
 const out=[];
 for(const o of list.slice(0,8)){
  if(!o||typeof o!=='object'||typeof o.name!=='string'||!o.name.trim())continue;
  const home=srcs.find(s=>s.id&&s.id===o.sourceId);if(!home)continue; // an organisation must come from a vetted page
  const facts=[];
  for(const f of Array.isArray(o.facts)?o.facts.slice(0,6):[]){
   const ok=sourcedItem(f,srcs);const label=typeof f?.label==='string'?f.label.slice(0,30):'',value=typeof f?.value==='string'?f.value.trim().slice(0,80):'';
   if(ok&&label&&value)facts.push({key:typeof f.key==='string'?f.key.slice(0,20):'',label,value,...ok});
  }
  const c=o.contacts&&typeof o.contacts==='object'?o.contacts:{},contacts={};
  const phone=sourcedItem(c.phone,srcs),pv=safePhone(c.phone?.value);if(phone&&pv)contacts.phone={value:pv,...phone};
  const email=sourcedItem(c.email,srcs),ev=safeEmail(c.email?.value);if(email&&ev)contacts.email={value:ev,...email};
  const web=sourcedItem(c.website,srcs),wv=safeHttps(c.website?.url);if(web&&wv)contacts.website={url:wv,...web};
  // Directions only from a map link the source page itself gives: never a pin worked out from a name or area.
  const dir=sourcedItem(c.directions,srcs),dv=safeHttps(c.directions?.url,MAPS_HOSTS);
  if(dir&&dv)contacts.directions={url:dv,label:typeof c.directions.label==='string'?c.directions.label.slice(0,80):'',...dir};
  out.push({id:(typeof o.id==='string'?o.id:o.sourceId+'-'+out.length).slice(0,40),name:o.name.trim().slice(0,120),kind:ORG_KINDS[o.kind]?o.kind:'organisation',src:home,facts,contacts,fixture:o.fixture===true});
 }
 return out;
}
function telHref(p){return 'tel:'+p.replace(/[^0-9+]/g,'')}
// The draft says only what the person told Orivia in this chat: no assumed move, family, name or dates.
function toldYear(){for(let i=turns.length-1;i>=0;i--){const t=turns[i];if(t.role!=='user')continue;const m=t.content.match(/\byear\s*(\d{1,2})\b/i);if(m&&+m[1]>=1&&+m[1]<=13)return 'Year '+(+m[1])}return ''}
function emailDraft(o){
 const year=o.kind==='school'?toldYear():'';
 if(o.kind==='school')return {subject:'Admissions enquiry'+(year?': '+year:''),body:'Hello,\n\nI’d like to ask about admissions'+(year?' for '+year:'')+'.\n\nCould you tell me:\n- whether places are available\n- how to apply, and which documents you need\n- the current fees\n- whether I can arrange a visit\n\nThank you.'};
 return {subject:'Enquiry',body:'Hello,\n\nI found your details on '+o.src.host+' and I’d like to ask a question.\n\nThank you.'};
}
function phoneScript(o){
 const year=o.kind==='school'?toldYear():'';
 if(o.kind==='school')return ['Hello, I’d like to ask about admissions'+(year?' for '+year:'')+'.','Do you have places available?','How do I apply, and which documents do you need?','What are the current fees, and can I arrange a visit?'];
 return ['Hello, I found your details on '+o.src.host+' and I have a question.','Could you tell me who is the right person to speak to?'];
}
function mailHref(o){const d=emailDraft(o);return 'mailto:'+o.contacts.email.value+'?subject='+encodeURIComponent(d.subject)+'&body='+encodeURIComponent(d.body)}
const ORG_ICON={
 phone:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
 mail:'M3 5h18v14H3z M3 7l9 6 9-6', web:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M3 12h18 M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18',
 go:'M3 11l18-8-8 18-2-8z', doc:'M6 3h9l4 4v14H6z M14 3v5h5', plus:'M12 5v14M5 12h14', check:'M5 12l5 5 9-10', back:'M15 6l-6 6 6 6', next:'M9 6l6 6-6 6', help:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14 M12 17h.01'
};
function orgIcon(name){const ns='http://www.w3.org/2000/svg',s=document.createElementNS(ns,'svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('class','ico');
 for(const d of ORG_ICON[name].split(' M').map((x,i)=>i?'M'+x:x)){const p=document.createElementNS(ns,'path');p.setAttribute('d',d);s.append(p)}return s}
function actLink(label,href,ic,cls){const a=el('a',cls||'org-act');a.href=href;if(/^https:/.test(href)){a.target='_blank';a.rel='noopener noreferrer'}a.append(orgIcon(ic),el('span','',label));return a}
function actBtn(label,ic,fn,cls){const b=button('',cls||'org-act',fn);b.append(orgIcon(ic),el('span','',label));return b}
function factLine(o){const pick=k=>o.facts.find(f=>f.key===k)?.value;return [pick('curriculum'),pick('grades'),pick('area'),pick('rating')].filter(Boolean).join(' · ')||o.facts.slice(0,3).map(f=>f.value).join(' · ')}
function orgEvidence(o){
 const d=document.createElement('details');d.className='org-evidence';d.append(el('summary','','Sources and evidence'));
 const items=[...o.facts.map(f=>[f.label,f.value,f]),...['phone','email','website','directions'].filter(k=>o.contacts[k]).map(k=>[{phone:'Phone',email:'Email',website:'Website',directions:'Location'}[k],o.contacts[k].value||o.contacts[k].label||o.contacts[k].url,o.contacts[k]])];
 const ul=el('ul','org-quotes');
 for(const [label,value,x] of items){const li=el('li');li.append(el('span','q-label',label+': '+value),el('blockquote','','“'+x.quote+'”'));const a=el('a','src-mini',x.src.title+' · '+x.src.host+' ↗');a.href=x.src.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);ul.append(li)}
 d.append(ul,el('p','tiny','Quotes are copied from the page Orivia opened. They support each detail but don’t guarantee it applies to you.'));
 return d;
}
// B: help getting in touch. Only the channels the data supports appear as tabs.
function reachOut(o,mode,onClose){
 const box=el('div','org-reach');const tabs=el('div','org-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','How to get in touch');
 const panel=el('div','org-panel');
 const modes=[o.contacts.email&&['email','Write an email'],['phone',o.contacts.phone?'What to say on the phone':'What to ask']].filter(Boolean);
 const show=m=>{
  for(const b of tabs.children){const on=b.dataset.mode===m;b.setAttribute('aria-selected',String(on));b.classList.toggle('on',on)}
  panel.replaceChildren();
  if(m==='email'){const d=emailDraft(o);
   panel.append(el('p','tiny','Orivia drafts it. You check it and send it from your own email app.'));
   const pre=el('div','org-draft');pre.append(el('div','org-subject','Subject: '+d.subject),el('div','org-body',d.body));panel.append(pre);
   const row=el('div','org-row');row.append(actLink('Open draft in my email app',mailHref(o),'mail','btn org-primary'),button('Copy','btn quiet small',async e=>{try{await navigator.clipboard.writeText('Subject: '+d.subject+'\n\n'+d.body);e.target.textContent='Copied'}catch(_){e.target.textContent='Couldn’t copy'}}));panel.append(row);
  }else{
   const ol=el('ol','org-script');for(const line of phoneScript(o))ol.append(el('li','','“'+line+'”'));panel.append(ol);
   if(o.contacts.phone){const row=el('div','org-row');row.append(actLink('Call '+o.contacts.phone.value,telHref(o.contacts.phone.value),'phone','btn org-primary'));panel.append(row)}
   else panel.append(el('p','tiny','I couldn’t confirm a phone number from the source, so there’s no call button.'));
  }
 };
 for(const [m,label] of modes){const b=button(label,'org-tab',()=>show(m));b.dataset.mode=m;b.setAttribute('role','tab');tabs.append(b)}
 box.append(tabs,panel,button('Close','btn text small',onClose));show(modes.some(x=>x[0]===mode)?mode:modes[0][0]);
 return box;
}
// C: help deciding. Offers only actions the data supports.
function chooseNext(o,open){
 const box=el('div','org-choose');box.append(el('p','org-q','What would you like to do next?'),el('p','tiny','Pick one and I’ll help you through it.'));
 const list=el('div','org-choices');
 const choice=(title,sub,ic,node)=>{node.classList.add('org-choice');node.replaceChildren(el('span','org-choice-ic'),el('span','org-choice-t'));node.firstChild.append(orgIcon(ic));node.lastChild.append(el('strong','',title),el('span','',sub));node.append(orgIcon('next'));list.append(node)};
 if(o.contacts.phone)choice('Call them','I’ll give you what to say first','phone',button('','',()=>open('phone')));
 if(o.contacts.email)choice('Email them','I’ll draft it, you check and send','mail',button('','',()=>open('email')));
 if(o.contacts.directions){const a=el('a');a.href=o.contacts.directions.url;a.target='_blank';a.rel='noopener noreferrer';choice('Take me there','Opens the map link from '+o.contacts.directions.src.host,'go',a)}
 const d=el('a');d.href=(o.contacts.website||o.src).url;d.target='_blank';d.rel='noopener noreferrer';choice(o.contacts.website?'Visit their website':'See their details',o.contacts.website?o.contacts.website.src.host:'The page Orivia opened','web',d);
 if(!o.contacts.phone&&!o.contacts.email)choice('Work out what to ask','A few questions to have ready','help',button('','',()=>open('phone')));
 box.append(list);return box;
}
// A: one organisation.
function orgCard(o,ui,{back,onDismiss}={}){
 const card=el('article','org-card');
 if(back)card.append(back);
 const head=el('div','org-head');
 const badge=el('span','org-badge '+(o.src.kind==='Official source'?'official':'org'));badge.append(el('span','',o.src.kind+' · '+o.src.host.replace(/^www\./,'')));head.append(badge);
 if(o.fixture)head.append(el('span','org-fixture','Sample data'));
 const h=el('h3','org-name',o.name);card.append(head,h);
 if(o.facts.length){const chips=el('div','org-chips');for(const f of o.facts)chips.append(el('span','org-chip'+(f.key==='rating'?' good':''),f.key==='rating'?f.label+': '+f.value:f.value));card.append(chips)}
 const acts=[];
 if(o.contacts.phone)acts.push(actLink('Call',telHref(o.contacts.phone.value),'phone'));
 if(o.contacts.email)acts.push(actLink('Email',mailHref(o),'mail'));
 if(o.contacts.website)acts.push(actLink('Website',o.contacts.website.url,'web'));
 else acts.push(actLink('Details',o.src.url,'doc'));
 const grid=el('div','org-acts');grid.style.setProperty('--n',String(acts.length));grid.append(...acts);card.append(grid);
 const slot=el('div','org-slot');card.append(slot);
 const openReach=m=>{ui.view='reach';ui.mode=m;render()};
 const render=()=>{slot.replaceChildren();
  if(ui.view==='reach')slot.append(reachOut(o,ui.mode,()=>{ui.view='';render()}));
  else if(ui.view==='choose')slot.append(chooseNext(o,openReach));
  else{const r=el('div','org-links');r.append(button(o.contacts.phone||o.contacts.email?'Help me with what to say':'What should I ask?','btn text small',()=>openReach(o.contacts.email&&!o.contacts.phone?'email':'phone')),button('Not sure what to do next?','btn text small',()=>{ui.view='choose';render()}));slot.append(r)}
 };
 render();
 const foot=el('div','org-foot');
 if(o.contacts.directions){foot.append(actLink('Take me there',o.contacts.directions.url,'go','org-go'))}
 foot.append(button('Not now','btn text',onDismiss||(()=>card.remove())));card.append(foot);
 card.append(orgEvidence(o));
 return card;
}
// D (several) or A (one): rendered under the reply; shortlist and "Not now" are saved with the chat.
function orgCards(t,srcs){
 const orgs=safeOrgs(t.meta&&t.meta.organisations,srcs);if(!orgs.length)return null;
 const wrap=el('div','org-wrap');const choose=t.meta.cardMode==='choose';const ui={sel:choose?orgs[0].id:null,view:choose?'choose':'',pager:choose?orgs.map(o=>o.id):null};
 const saveMeta=()=>{try{save()}catch(_){}};
 const dismiss=()=>{t.meta.cardsHidden=true;saveMeta();paint()};
 const paint=()=>{
  wrap.replaceChildren();
  if(t.meta.cardsHidden){wrap.append(button(orgs.length>1?'Show the '+orgs.length+' results':'Show '+orgs[0].name,'btn quiet small',()=>{t.meta.cardsHidden=false;saveMeta();paint()}));return}
  const shortlist=new Set((Array.isArray(t.meta.shortlist)?t.meta.shortlist:[]).filter(id=>orgs.some(o=>o.id===id)));
  if(orgs.length===1||ui.sel){
   const o=orgs.find(x=>x.id===ui.sel)||orgs[0];
   let back=null;
   if(orgs.length>1){back=el('div','org-back');back.append(actBtn(ui.pager?'Back to shortlist':'All '+orgs.length+' results','back',()=>{ui.sel=null;ui.view='';ui.pager=null;paint()},'btn text small'));
    if(ui.pager&&ui.pager.length>1){const i=ui.pager.indexOf(o.id);back.append(el('span','tiny',(i+1)+' of '+ui.pager.length),actBtn('Next','next',()=>{ui.sel=ui.pager[(i+1)%ui.pager.length];paint()},'btn text small'))}}
   wrap.append(orgCard(o,ui,{back,onDismiss:dismiss}));return;
  }
  wrap.append(el('p','org-hint','Tap + to shortlist the ones you like.'));
  for(const o of orgs){
   const row=el('article','org-mini');const top=el('div','org-mini-top');
   const name=button('','org-mini-name',()=>{ui.sel=o.id;ui.view='';paint()});name.append(el('strong','',o.name),el('span','',factLine(o)));
   const on=shortlist.has(o.id);
   const pin=button('','org-pin'+(on?' on':''),()=>{on?shortlist.delete(o.id):shortlist.add(o.id);t.meta.shortlist=[...shortlist];saveMeta();paint()});
   pin.append(orgIcon(on?'check':'plus'));pin.setAttribute('aria-pressed',String(on));pin.setAttribute('aria-label',(on?'Remove from shortlist: ':'Add to shortlist: ')+o.name);
   if(o.fixture)name.append(el('span','org-fixture','Sample data'));
   top.append(name,pin);row.append(top);
   const acts=el('div','org-acts small');
   if(o.contacts.phone)acts.append(actLink('Call',telHref(o.contacts.phone.value),'phone'));
   acts.append(actBtn('Details','doc',()=>{ui.sel=o.id;ui.view='';paint()}));
   if(o.contacts.directions)acts.append(actLink('Go',o.contacts.directions.url,'go'));
   acts.style.setProperty('--n',String(acts.children.length));row.append(acts);wrap.append(row);
  }
  const bar=el('div','org-bar');
  if(shortlist.size){bar.append(el('span','',shortlist.size+' shortlisted.'),button('Help me contact them','btn org-primary',()=>{ui.pager=orgs.filter(o=>shortlist.has(o.id)).map(o=>o.id);ui.sel=ui.pager[0];ui.view='choose';paint()}))}
  else bar.append(el('span','tiny','Nothing shortlisted yet.'));
  bar.append(button('Not now','btn text small',dismiss));wrap.append(bar);
 };
 paint();return wrap;
}

// Keep the full answer and source cards on screen, but respect the chat API's
// per-message limit and never send browser-only evidence metadata back.
function chatMessages(turns){return turns.slice(-12).map(({role,content})=>({role,content:content.slice(0,1200)}))} // only the active chat, latest 12 messages
function draw(){
 const el=$('history');el.replaceChildren();
 for(const t of turns){const p=document.createElement('div');p.className='bubble '+(t.role==='user'?'user':'assistant');const b=document.createElement('b');b.textContent=t.role==='user'?'You':'Orivia';const txt=document.createElement('span');
  const srcs=t.role==='assistant'?safeSources(t.meta&&t.meta.sources):[];
  if(srcs.length)txt.append(...citedText(t.content,srcs));else txt.textContent=t.content;p.append(b,txt);
  const cards=t.role==='assistant'&&t.meta&&t.meta.organisations?orgCards(t,srcs):null;
  if(cards){p.append(cards);p.classList.add('has-cards')}
  if(t.role==='assistant'&&(srcs.length||(t.meta&&t.meta.research))){
   const rb=researchBlock(srcs,t.meta.research);
   if(cards){const d=document.createElement('details'),sm=document.createElement('summary');d.className='sources-fold';sm.textContent='All sources for this reply ('+srcs.length+')';d.append(sm,rb);p.append(d)}else p.append(rb);
  }
  if(t.role==='assistant'&&'speechSynthesis' in window){const lb=document.createElement('button');lb.type='button';lb.className='listen-btn';lb.textContent='▶ Listen';lb.setAttribute('aria-pressed','false');lb.setAttribute('aria-label','Listen to this reply');lb.onclick=()=>listen(spokenText(t.content),lb);p.append(document.createElement('br'),lb)}
  el.append(p)}
 $('empty').hidden=turns.length>0;
 const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight;
}
function loadEvents(){try{const data=JSON.parse(localStorage.getItem(eventKey)||'[]');events=Array.isArray(data)?data.filter(e=>e&&typeof e.title==='string'&&typeof e.at==='string'&&typeof e.id==='string').slice(-100):[]}catch(_){events=[]}}
function storeEvents(){try{localStorage.setItem(eventKey,JSON.stringify(events.slice(-100)))}catch(_){$('reminder-status').textContent='Unable to save calendar in this browser.'}}
function googleEvent(e){
 const start=new Date(e.at);
 const end=new Date(start.getTime()+30*60000);
 const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const q=new URLSearchParams({action:'TEMPLATE',text:e.title,dates:stamp(start)+'/'+stamp(end),details:'Reminder created by Orivia. Confirm Save in Google Calendar.'});
 return 'https://calendar.google.com/calendar/render?'+q.toString();
}
/* Standard calendar file from the Worker: opens the phone's own calendar app (or downloads on some Android browsers).
   It is only in their calendar once they confirm there: Orivia never assumes it was accepted. */
const ALARMS=[[0,'At the time'],[10,'10 minutes before'],[30,'30 minutes before'],[60,'1 hour before'],[1440,'1 day before']];
function deviceCalendarUrl(e){const alarm=ALARMS.some(([m])=>m===e.alarm)?e.alarm:30;return '/reminder.ics?'+new URLSearchParams({title:e.title,when:new Date(e.at).toISOString(),alarm:String(alarm)}).toString()}
const when=e=>new Date(e.at).toLocaleString(undefined,{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
/* Calendar: a week strip (dots on days with something) and an agenda grouped by when */
let weekOffset=0,selectedDay=null;
const dayKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const startOfDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
function removeEvent(id){events=events.filter(x=>x.id!==id);storeEvents();renderEvents();renderUpcoming()}
function eventRow(e,past){
 const d=new Date(e.at),row=el('article','ev'+(past?' past':''));
 const t=el('div','t');const time=d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});const m=time.match(/^(.*?)\s*([AaPp]\.?[Mm]\.?)$/);
 t.append(el('b','',m?m[1]:time),el('small','',m?m[2]:d.toLocaleDateString(undefined,{weekday:'short'})));
 const b=el('div','b');b.append(el('strong','',e.title),el('span','tiny',d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})+' · saved in Orivia'));
 const acts=el('div','acts');
 if(!past){
  const dev=el('a','dev','Add to phone calendar');dev.href=deviceCalendarUrl(e);dev.setAttribute('aria-label','Add '+e.title+' to your phone calendar');
  dev.addEventListener('click',()=>{setTimeout(()=>{note.hidden=false;note.textContent='Your calendar app should ask you to add it. It’s only in your phone calendar after you tap Add or Save there. On some Android phones the file downloads first: open it from your notifications or Downloads.'},300)});
  const g=el('a','','Google Calendar ↗');g.href=googleEvent(e);g.target='_blank';g.rel='noopener noreferrer';g.setAttribute('aria-label','Add '+e.title+' to Google Calendar');
  acts.append(dev,g);
 }
 const rm=button('Remove','',()=>{if(rm.dataset.sure!=='1'){rm.dataset.sure='1';rm.textContent='Tap again to remove';return}removeEvent(e.id)});
 acts.append(rm);
 const note=el('p','hint');note.hidden=true;note.setAttribute('role','status');
 if(!past&&typeof e.alarm==='number')b.append(el('span','tiny','Alert: '+(ALARMS.find(([m])=>m===e.alarm)||[,'30 minutes before'])[1].toLowerCase()));
 b.append(acts,note);row.append(t,b);return row;
}
function renderEvents(){
 loadEvents();
 const today=startOfDay(new Date());
 const monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7)+weekOffset*7);
 const days=$('wk-days');days.replaceChildren();
 const has=new Set(events.map(e=>dayKey(new Date(e.at))));
 for(let k=0;k<7;k++){
  const d=new Date(monday);d.setDate(monday.getDate()+k);const key=dayKey(d);
  const b=button('','day'+(key===dayKey(today)?' today':'')+(selectedDay===key?' sel':'')+(has.has(key)?' has':''),()=>{selectedDay=selectedDay===key?null:key;renderEvents()});
  b.append(el('small','',d.toLocaleDateString(undefined,{weekday:'short'}).slice(0,3)),el('b','',String(d.getDate())),el('i'));
  b.setAttribute('aria-pressed',String(selectedDay===key));b.setAttribute('aria-label',d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})+(has.has(key)?', has reminders':''));
  days.append(b);
 }
 const sun=new Date(monday);sun.setDate(monday.getDate()+6);
 $('wk-label').textContent=weekOffset===0?'This week':monday.toLocaleDateString(undefined,{day:'numeric',month:'short'})+' – '+sun.toLocaleDateString(undefined,{day:'numeric',month:'short'});
 const root=$('events');root.replaceChildren();
 const sorted=events.slice().sort((a,b)=>a.at.localeCompare(b.at)),now=Date.now();
 if(selectedDay){
  const list=sorted.filter(e=>dayKey(new Date(e.at))===selectedDay);
  const g=el('section','agroup');g.append(el('h3','',new Date(selectedDay+'T12:00').toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})));
  if(!list.length)g.append(el('p','empty','Nothing on this day.'));
  for(const e of list)g.append(eventRow(e,new Date(e.at).getTime()<now));
  g.append(button('+ Add a reminder for this day','ask',()=>openAdd(selectedDay)),button('Show everything coming up','ask',()=>{selectedDay=null;renderEvents()}));
  root.append(g);return;
 }
 const upcoming=sorted.filter(e=>new Date(e.at).getTime()>=now),past=sorted.filter(e=>new Date(e.at).getTime()<now);
 if(!upcoming.length){const p=el('div','empty');p.append(el('p','','Nothing coming up. Add a reminder, or just tell Orivia in Chat: “remind me to call the bank on Sunday”.'));root.append(p)}
 const tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);const weekEnd=new Date(today);weekEnd.setDate(today.getDate()+7);
 const groups=[['Today',e=>dayKey(new Date(e.at))===dayKey(today)],['Tomorrow',e=>dayKey(new Date(e.at))===dayKey(tomorrow)],['This week',e=>new Date(e.at)<weekEnd],['Later',()=>true]];
 const left=upcoming.slice();
 for(const [name,test] of groups){const list=left.filter(test);if(!list.length)continue;for(const e of list)left.splice(left.indexOf(e),1);const g=el('section','agroup');g.append(el('h3','',name));for(const e of list)g.append(eventRow(e,false));root.append(g)}
 if(past.length){const det=el('details','agroup');det.append(el('summary','tiny','Past ('+past.length+')'));for(const e of past.slice(-10).reverse())det.append(eventRow(e,true));root.append(det)}
}
/* Add a reminder: a short sheet with quick picks */
function openAdd(day){
 const f=$('reminder-form');f.reset();$('reminder-status').textContent='';$('reminder-time').value='09:00';
 const today=startOfDay(new Date());$('reminder-date').min=dayKey(today);
 $('reminder-date').value=day||dayKey(new Date(Date.now()+86400000));
 const picks=[['Tomorrow',1],['In 3 days',3],['Next week',7]],q=$('when-quick');q.replaceChildren();
 for(const [label,n] of picks){const d=new Date(today);d.setDate(today.getDate()+n);q.append(button(label,'seg-btn'+($('reminder-date').value===dayKey(d)?' on':''),()=>{$('reminder-date').value=dayKey(d);for(const x of q.children)x.classList.toggle('on',x.textContent===label)}))}
 $('reminder-alarm').value='30';
 $('add-sheet').hidden=false;$('reminder-title').focus();
}
function flash(msg){const f=$('cal-flash');f.textContent=msg;f.hidden=false;clearTimeout(flash.t);flash.t=setTimeout(()=>{f.hidden=true},6000)}
function closeAdd(){$('add-sheet').hidden=true;$('cal-add').focus()}
$('cal-add').onclick=()=>openAdd(selectedDay);
$('add-cancel').onclick=closeAdd;
$('add-sheet').addEventListener('click',e=>{if(e.target.id==='add-sheet')closeAdd()});
$('reminder-date').addEventListener('input',()=>{for(const x of $('when-quick').children)x.classList.remove('on')});
$('wk-prev').onclick=()=>{weekOffset--;selectedDay=null;renderEvents()};
$('wk-next').onclick=()=>{weekOffset++;selectedDay=null;renderEvents()};
function renderUpcoming(){
 loadEvents();const root=$('upcoming');root.replaceChildren();
 const next=events.filter(e=>new Date(e.at).getTime()>Date.now()).sort((a,b)=>a.at.localeCompare(b.at)).slice(0,3);
 for(const e of next){const b=button('','now-item',()=>tab('calendar'));b.append(icon('M3.5 5h17v15h-17zM3.5 10h17M8 3v4M16 3v4'));const sp=el('span');sp.append(el('strong','',e.title),el('small','',when(e)));b.append(sp,document.createTextNode('›'));root.append(b)}
 if(!next.length)root.append(button('+ Add a reminder','ask',()=>{tab('calendar');openAdd()}));
}
/* Switching sections: the bottom bar, and Orivia herself (window.oriviaGo) */
function tab(which){
 const views={chat:'chat',calendar:'calendar-panel',journeys:'journeys',mylife:'mylife',guide:'guide-view',settings:'settings-view'};
 if(!views[which])return;
 if(which!=='settings')lastTab=which;
 if(which!=='chat'){try{stopSpeaking();stopDictation(true)}catch(_){}}
 const navKey=which==='guide'?'journeys':which; // a guide opens inside Journeys; Settings has no tab of its own
 for(const [k,id] of Object.entries(views)){$(id).hidden=k!==which;const b=$('tab-'+k);if(b){b.classList.toggle('active',k===navKey);b.setAttribute('aria-current',k===navKey?'page':'false')}}
 $('view-title').textContent=TITLES[which];
 if(which==='calendar')renderEvents();
 if(which==='settings')renderSettings();
 if(which==='journeys')renderJourneys();
 if(which==='mylife'){renderUpcoming();loadProfile();renderJourneys()}
 if(which==='chat'){const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight}
}
window.oriviaGo=tab;
let lastTab='chat';
for(const b of document.querySelectorAll('nav.bottom [data-tab]'))b.onclick=()=>tab(b.dataset.tab);
loadEvents();
/* Ask Orivia from anywhere: fills the message box in Chat */
function ask(text,send){
 tab('chat');const m=$('msg');m.value=text;grow();m.focus();
 if(send)$('form').requestSubmit();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ask]');if(b){e.preventDefault();ask(b.dataset.ask,b.closest('#empty')!==null)}});
/* Official sources (shown in Journeys) */
const OFFICIAL=[
 ['RTA (Dubai roads and transport)','https://www.rta.ae','Metro, buses, nol cards, taxis'],
 ['UAE government portal','https://u.ae','Official information on visas, residency and services'],
 ['GDRFA Dubai','https://www.gdrfad.gov.ae','Residency and entry permits in Dubai'],
 ['ICP','https://icp.gov.ae','Emirates ID and federal residency services'],
 ['KHDA','https://web.khda.gov.ae','Private schools and universities in Dubai']];
/* My Life: About me, only shared with the AI when the user ticks the box */
function readProfile(){try{const p=JSON.parse(localStorage.getItem(profileKey)||'null');return p&&typeof p==='object'?p:null}catch(_){return null}}
/* About me is used by default; only an explicit 'off' stops it */
function aboutMeOn(){const p=readProfile();return !(p&&p.use===false)}
function setAboutMe(on){const p=readProfile()||{};try{localStorage.setItem(profileKey,JSON.stringify({...p,use:on}))}catch(_){}}
/* About you: tap to pick, saves as you go. Where you live now and where you're moving to are kept apart. */
const WHO=[['study','Study'],['work','Work'],['join or bring my family','Family'],['something else','Something else']];
const EMIRATES_ALL=['Abu Dhabi','Dubai','Sharjah','Ajman','Umm Al Quwain','Ras Al Khaimah','Fujairah'];
const UK_NATIONS=['England','Scotland','Wales','Northern Ireland'];
let aboutEditing=false,aboutSkipped=false;
/* Countries for "Where did you move from?": ISO codes, named by the browser in the person's language */
const COUNTRY_CODES='AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
const regionNames=(()=>{for(const l of [String(navigator.language||'').replace(/[@_].*$/,''),'en']){try{if(l)return new Intl.DisplayNames([l],{type:'region'})}catch(_){}}return null})(); // tolerate odd language codes like en-US@posix
function countryName(code){try{return (regionNames&&regionNames.of(code))||code}catch(_){return code}}
let countryOptions=null;
function fillCountries(sel,current){
 if(!countryOptions)countryOptions=COUNTRY_CODES.map(c=>[c,countryName(c)]).sort((a,b)=>a[1].localeCompare(b[1]));
 if(sel.options.length!==countryOptions.length+1){sel.replaceChildren(new Option('Choose (optional)',''));for(const [c,n] of countryOptions)sel.append(new Option(n,c))}
 sel.value=COUNTRY_CODES.includes(current)?current:'';
}
const originText=p=>[clip(p.originTown),p.originCountry?countryName(p.originCountry):''].filter(Boolean).join(', ');
const clip=(v,n=60)=>typeof v==='string'?v.replace(/[\r\n<>{}]/g,' ').replace(/\s+/g,' ').trim().slice(0,n):'';
/* One line describing a place, for people and for the AI */
function placeText(country,region,town){
 const parts=[clip(town),clip(region)].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i);
 if(country==='uae')return parts.concat('UAE').join(', ');
 if(country==='uk')return parts.concat('UK').join(', ');
 return parts.join(', ');
}
/* Older saves only had a 'city' word: turn it into the new shape once */
function migrateProfile(p){
 if(p&&p.from&&!p.originCountry&&!p.originTown){ // older "Where are you now?" box → the one origin field
  const f=clip(p.from),code=COUNTRY_CODES.find(c=>countryName(c).toLowerCase()===f.toLowerCase()||c===f.toUpperCase());
  p={...p,...(code?{originCountry:code}:{originTown:f})};delete p.from;
 }
 if(!p||p.here||!p.city)return p;
 const c=String(p.city);
 if(EMIRATES_ALL.includes(c))return {...p,here:'uae',region:c};
 if(/Somewhere else in the UAE/i.test(c))return {...p,here:'uae'};
 if(/Not in the UAE yet/i.test(c))return {...p,here:'away'};
 return {...p,here:'',town:c};
}
function saveProfile(patch){
 const p=migrateProfile(readProfile()||{}),n={...p,...patch};
 for(const k of ['region','town','originTown','destRegion','destTown','who'])if(typeof n[k]==='string')n[k]=clip(n[k]);
 if(n.originCountry&&!COUNTRY_CODES.includes(n.originCountry))n.originCountry='';
 delete n.from;
 n.movedFrom=originText(n); // where they lived before: never nationality, citizenship or status
 if(typeof n.place==='string')n.place=clip(n.place,80);
 n.city=n.here==='uae'||n.here==='uk'?placeText(n.here,n.region,n.town):''; // used by trip planning and the AI
 n.movingTo=n.here==='away'&&(n.dest==='uae'||n.dest==='uk')?placeText(n.dest,n.destRegion,n.destTown):'';
 try{localStorage.setItem(profileKey,JSON.stringify(n))}catch(_){}
 loadProfile();
}
/* The emirate or UK nation + town fields for one place (where you live, or where you're moving to) */
function placeFields(root,country,keys,p){
 root.replaceChildren();if(country!=='uae'&&country!=='uk')return;
 const id=keys.region+'-sel',tid=keys.town+'-in';
 const lab=el('label','field');lab.htmlFor=id;lab.append(country==='uae'?'Emirate':'Nation');
 const sel=document.createElement('select');sel.id=id;
 const opts=country==='uae'?EMIRATES_ALL:UK_NATIONS;
 sel.append(new Option('Choose',''));for(const o of opts)sel.append(new Option(o,o));
 sel.value=opts.includes(p[keys.region])?p[keys.region]:'';sel.onchange=()=>saveProfile({[keys.region]:sel.value});lab.append(sel);
 const tl=el('label','field');tl.htmlFor=tid;tl.append(country==='uae'?'Area':'City or town');tl.append(el('small','',country==='uae'?' Optional':' Type it if it isn’t listed'));
 const tin=document.createElement('input');tin.id=tid;tin.maxLength=60;tin.value=p[keys.town]||'';tin.placeholder=country==='uae'?'e.g. Al Nahda, JLT, Muwaileh':'e.g. Edinburgh';
 if(country==='uk')tin.setAttribute('list','uk-towns');
 tin.onchange=()=>saveProfile({[keys.town]:tin.value});tl.append(tin);
 root.append(lab,tl);
}
function aboutSentence(p){
 const bits=[];
 if(p.here==='uae'||p.here==='uk')bits.push('You live in '+(placeText(p.here,p.region,p.town)||(p.here==='uae'?'the UAE':'the UK')));
 else if(p.here==='away'){
  const to=p.dest==='uae'||p.dest==='uk'?placeText(p.dest,p.destRegion,p.destTown)||(p.dest==='uae'?'the UAE':'the UK'):'';
  bits.push((originText(p)?'You’re moving from '+originText(p):'You haven’t moved yet')+(to?(originText(p)?' to ':' and moving to ')+to:''));
 }else if(p.town)bits.push('You live in '+clip(p.town));
 if(p.here!=='away'&&originText(p))bits.push((bits.length?'you moved from ':'You moved from ')+originText(p));
 const role={study:'here to study',work:'here to work','join or bring my family':'here with family','something else':''}[p.who]||'';
 if(role)bits.push((bits.length?'you’re ':'You’re ')+role+(p.place&&(p.who==='study'||p.who==='work')?' at '+p.place:''));
 else if(p.place)bits.push((bits.length?'at ':'At ')+p.place);
 return bits.length?bits.join(', ')+'.':'';
}
function loadProfile(){
 const p=migrateProfile(readProfile()||{}),filled=!!(p.here||p.who||p.place);
 seg('pick-here',[['uae','UAE'],['uk','UK'],['away','Not there yet']],p.here||'',v=>saveProfile({here:p.here===v?'':v,...(p.here!==v?{region:'',town:''}:{})})); // a new country starts with a clean emirate/nation and town
 placeFields($('here-fields'),p.here,{region:'region',town:'town'},p);
 $('away-fields').hidden=p.here!=='away';
 fillCountries($('origin-country'),p.originCountry);
 if(document.activeElement!==$('origin-town'))$('origin-town').value=p.originTown||'';
 $('origin-q').firstChild.textContent=p.here==='away'?'Where are you moving from? ':'Where did you move from? ';
 $('origin-clear').hidden=!(p.originCountry||p.originTown);
 seg('pick-dest',[['uae','UAE'],['uk','UK'],['unsure','Not sure yet']],p.dest||'',v=>saveProfile({dest:p.dest===v?'':v,...(p.dest!==v?{destRegion:'',destTown:''}:{})}));
 placeFields($('dest-fields'),p.here==='away'?p.dest:'',{region:'destRegion',town:'destTown'},p);
 seg('pick-who',WHO,p.who||'',v=>saveProfile({who:p.who===v?'':v}));
 const showPlace=p.who==='study'||p.who==='work';
 $('pick-place-row').hidden=!showPlace;
 $('pick-place-q').textContent=p.who==='work'?'Where you work':'Your institution';
 $('p-place').placeholder=p.who==='work'?'Company or organisation':'School, college, university or training centre';
 if(document.activeElement!==$('p-place'))$('p-place').value=p.place||'';
 $('place-note').textContent=p.place?'Saved as you typed it. Orivia hasn’t checked it yet.':'Type its name as you know it. Orivia hasn’t checked it yet.';
 $('about-summary').textContent=filled?aboutSentence(p):'';
 const whereDone=p.here==='uae'?!!p.region:p.here==='uk'?!!(p.region||p.town):p.here==='away'?!!p.dest:false;
 const complete=!!(whereDone&&p.who&&(!showPlace||p.place)); // collapses once everything that applies is answered
 const open=(!complete&&!aboutSkipped)||aboutEditing;
 $('about-pick').hidden=!open;
 $('about-edit').hidden=open;
 $('about-done').hidden=!(open&&filled);
 $('about-use').textContent=aboutMeOn()?'Orivia uses this so you don’t have to repeat yourself. You can switch that off in Settings.':'Orivia isn’t using this right now. You can switch it on in Settings.';
}
$('origin-country').addEventListener('change',e=>saveProfile({originCountry:e.target.value}));
$('origin-town').addEventListener('change',e=>saveProfile({originTown:e.target.value}));
$('origin-clear').onclick=()=>saveProfile({originCountry:'',originTown:''});
/* Chat fills My Life: when you've said where you live or study, offer to remember it. Nothing is saved until you tap. */
const EMIRATES=EMIRATES_ALL,noKey='orivia-private-remember-no';
function rememberCard(t){
 $('remember-card')?.remove();
 if(!t||(!t.origin&&!t.destination)||$('guide-offer'))return;
 const p=readProfile()||{},patch={},lines=[];
 const city=EMIRATES.find(c=>new RegExp('\\b'+c+'\\b','i').test(String(t.origin||'')));
 if(city&&!p.here&&!p.city){patch.here='uae';patch.region=city;lines.push('You live in '+city)}
 const dest=String(t.destination||'').slice(0,60);
 if(/universit|college|campus|institute/i.test(dest)&&!p.place){patch.place=dest;lines.push('You study at '+dest);if(!p.who)patch.who='study'}
 if(!lines.length)return;
 let no=[];try{no=JSON.parse(sessionStorage.getItem(noKey)||'[]')}catch(_){}
 const sig=JSON.stringify(patch);if(no.includes(sig))return;
 const card=el('section','remember');card.id='remember-card';card.setAttribute('aria-label','Remember in My Life');
 card.append(el('strong','','Remember this for next time?'),el('p','notice',lines.join(' · ')+'. Then you won’t need to say it again.'));
 const row=el('div','row');
 row.append(button('Remember','btn small',()=>{saveProfile(patch);card.replaceChildren(el('p','','Saved to My Life. You can change it any time.'))}),
  button('No thanks','btn text small',()=>{no.push(sig);try{sessionStorage.setItem(noKey,JSON.stringify(no.slice(-20)))}catch(_){}card.remove()}));
 card.append(row);($('journey-actions')||$('history')).after(card);
 const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight;
}
$('about-edit').onclick=()=>{aboutEditing=true;aboutSkipped=false;loadProfile()};
$('about-done').onclick=()=>{aboutEditing=false;aboutSkipped=true;loadProfile()}; // Done closes it even if some questions are skipped
$('place-form').addEventListener('submit',e=>{e.preventDefault();saveProfile({place:$('p-place').value.trim()})});
$('p-place').addEventListener('change',e=>saveProfile({place:e.target.value.trim()}));
function profileForAI(){const p=readProfile();if(!p||p.use===false)return undefined;const out={};for(const k of ['city','movingTo','movedFrom','who','place'])if(typeof p[k]==='string'&&p[k].trim())out[k]=p[k].trim().slice(0,60);return Object.keys(out).length?out:undefined}
$('forget').onclick=()=>{const b=$('forget');if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to delete';setTimeout(()=>{b.dataset.sure='';b.textContent='Clear saved data'},4000);return}try{localStorage.removeItem(profileKey);localStorage.removeItem(eventKey);localStorage.removeItem(journeysKey);localStorage.removeItem(chatsKey);localStorage.removeItem(chatsBackupKey)}catch(_){}storeLocked=false;storageWarn('');store={chats:[],active:null};turns=[];clearChatCards();draw();renderChats();events=[];loadProfile();renderUpcoming();renderJourneys();b.dataset.sure='';b.textContent='Cleared'};
/* End session: back to the welcome screen. Clears this conversation and the human check; keeps journeys, calendar and My Life. */
$('end-session').onclick=async()=>{
 const b=$('end-session');
 if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to end this session';setTimeout(()=>{b.dataset.sure='';b.textContent='End session'},4000);return}
 stopSpeaking();stopDictation(false);
 try{await fetch('/v1/end',{method:'POST',credentials:'same-origin'})}catch(_){}
 store.active=null;persist(); // saved chats stay; the welcome screen opens to a new chat
 try{for(const k of [key,ck,'orivia-private-offered','orivia-private-remember-no'])sessionStorage.removeItem(k)}catch(_){}
 location.reload();
};
/* ===== Listen: Orivia's replies read aloud with the phone's own voices ===== */
const spokenText=t=>String(t).replace(/^\[\d{1,2}\] .+?: https?:\/\/\S+\s*$/gm,'').replace(/\s?\[\d{1,2}\]/g,'').replace(/https?:\/\/\S+/g,'').replace(/\n{2,}/g,'\n').trim(); // no reference lists, markers or web addresses read aloud
const canSpeak='speechSynthesis' in window;
const VOICE_LOC={en:'en-GB',ar:'ar-AE',fr:'fr-FR',fil:'fil-PH',hi:'hi-IN',ur:'ur-PK',zh:'zh-CN',bn:'bn-IN',ml:'ml-IN',ru:'ru-RU'};
const VOICE_BAD=/^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley)\b/i;
function textLang(t){ // the language of the reply, from its script
 if(/[؀-ۿ]/.test(t))return /[ٹڈڑںھہے]/.test(t)?'ur':'ar';
 if(/[ഀ-ൿ]/.test(t))return 'ml';if(/[ঀ-৿]/.test(t))return 'bn';if(/[ऀ-ॿ]/.test(t))return 'hi';
 if(/[一-鿿]/.test(t))return 'zh';if(/[Ѐ-ӿ]/.test(t))return 'ru';return 'en';
}
function bestVoice(l){
 const want=VOICE_LOC[l].toLowerCase(),pre=l==='zh'?['zh','cmn']:l==='fil'?['fil','tl']:[l];
 const score=v=>{const vl=String(v.lang).toLowerCase().replace('_','-');let s=vl===want?30:0;if(/natural|neural|enhanced|premium|online/i.test(v.name))s+=40;if(/google/i.test(v.name))s+=25;if(/siri/i.test(v.name))s+=20;if(/compact|espeak|eloquence/i.test(v.name))s-=30;return s};
 return speechSynthesis.getVoices().filter(v=>pre.some(x=>String(v.lang).toLowerCase().startsWith(x))&&!VOICE_BAD.test(v.name)).sort((a,b)=>score(b)-score(a))[0]||null;
}
function voicesReady(){return new Promise(res=>{const now=speechSynthesis.getVoices();if(now.length)return res();let done=false;const fin=()=>{if(!done){done=true;res()}};speechSynthesis.addEventListener('voiceschanged',fin,{once:true});setTimeout(fin,1200)})}
let speakingBtn=null,speakRun=0;
function stopSpeaking(){if(!canSpeak)return;speakRun++;speechSynthesis.cancel();if(speakingBtn){speakingBtn.setAttribute('aria-pressed','false');speakingBtn.textContent='▶ Listen';speakingBtn=null}}
async function listen(text,btn){
 if(speakingBtn===btn){stopSpeaking();return}
 stopSpeaking();stopDictation(false);
 const l=textLang(text);await voicesReady();const v=bestVoice(l);
 if(!v&&l!=='en'){$('status').textContent='This phone has no voice for this language yet. You can add one in your phone’s text-to-speech settings.';return}
 const run=++speakRun;speakingBtn=btn;btn.setAttribute('aria-pressed','true');btn.textContent='■ Stop';
 const clean=text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu,'').replace(/\s+/g,' ').trim();
 const parts=clean.split(/(?<=[.!?。！？।۔])\s+/).flatMap(x=>x.length>220?x.match(/.{1,200}(\s|$)/g):[x]).filter(Boolean);
 parts.forEach((c,i)=>{const u=new SpeechSynthesisUtterance(c);u.lang=v?v.lang:VOICE_LOC[l];if(v)u.voice=v;u.rate=v&&/natural|neural|online|enhanced|premium/i.test(v.name)?1:.95;
  if(i===parts.length-1)u.onend=()=>{if(run===speakRun)stopSpeaking()};u.onerror=e=>{if(run===speakRun&&e.error!=='interrupted'&&e.error!=='canceled')stopSpeaking()};speechSynthesis.speak(u)});
}
if(canSpeak)setInterval(()=>{try{if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();speechSynthesis.resume()}}catch(_){}},10000); // keeps Chrome on Android from stopping long replies
/* ===== Dictation: speak instead of typing, then check and edit before sending ===== */
const Recog=window.SpeechRecognition||window.webkitSpeechRecognition;
const micNoteKey='orivia-private-mic-note';
let recog=null,dictBase='';
function stopDictation(keep){
 if(!recog)return;const r=recog;recog=null;
 if(!keep)$('msg').value=dictBase;
 try{keep?r.stop():r.abort()}catch(_){}
 $('listening').hidden=true;$('mic').setAttribute('aria-pressed','false');grow();
}
function startDictation(){
 let seen=false;try{seen=localStorage.getItem(micNoteKey)==='1'}catch(_){}
 if(!seen){$('status').textContent='Your browser turns speech into text, often using Google’s or Apple’s speech service. Nothing is sent until you press Send. Tap the microphone again to start.';try{localStorage.setItem(micNoteKey,'1')}catch(_){}return}
 stopSpeaking();
 const r=new Recog();recog=r;dictBase=$('msg').value;
 r.lang=document.documentElement.lang&&document.documentElement.lang!=='en'?document.documentElement.lang:(navigator.language||'en-GB');
 r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
 r.onresult=e=>{let t='';for(const x of e.results)t+=x[0].transcript;$('msg').value=(dictBase?dictBase.replace(/\s*$/,' '):'')+t.trim();grow()};
 r.onerror=e=>{const m={'not-allowed':'Microphone access is off for this site. You can turn it on in your browser settings, or keep typing.','service-not-allowed':'Speech to text isn’t available in this browser. You can keep typing.','no-speech':'I didn’t catch anything. Tap the microphone and try again.','audio-capture':'No microphone was found. You can keep typing.','network':'The speech service couldn’t be reached. You can keep typing.'}[e.error];if(m)$('status').textContent=m};
 r.onend=()=>{if(recog===r){recog=null;$('listening').hidden=true;$('mic').setAttribute('aria-pressed','false')}if($('msg').value.trim()!==dictBase.trim()){$('status').textContent='Check the text, edit anything, then press Send.';$('msg').focus()}};
 try{r.start()}catch(_){recog=null;$('status').textContent='Speech to text couldn’t start. You can keep typing.';return}
 $('listening').hidden=false;$('listening-text').textContent='Listening… speak now';$('mic').setAttribute('aria-pressed','true');$('status').textContent='';
}
if(Recog){$('mic').hidden=false;$('mic').onclick=()=>recog?stopDictation(true):startDictation()}
$('dict-stop').onclick=()=>stopDictation(true);
$('dict-cancel').onclick=()=>stopDictation(false);

/* Help: always one tap away in the middle of the bar */
function openHelp(){$('help-sheet').hidden=false;$('help-wrong').focus()}
function closeHelp(){$('help-sheet').hidden=true;$('tab-help').focus()}
$('tab-help').onclick=openHelp;$('help-close').onclick=closeHelp;
$('help-sheet').addEventListener('click',e=>{if(e.target.id==='help-sheet')closeHelp()});
$('help-wrong').onclick=()=>{closeHelp();ask('Something went wrong: ',false)};
$('help-journeys').onclick=()=>{closeHelp();tab('journeys')};
$('help-staff').onclick=()=>{$('help-sheet').hidden=true;$('staff-card').hidden=false;$('staff-close').focus()};
$('staff-close').onclick=()=>{$('staff-card').hidden=true;$('tab-help').focus()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('staff-card').hidden)$('staff-close').click();else if(!$('add-sheet').hidden)closeAdd();else if(!$('help-sheet').hidden)closeHelp()}});
/* Links Orivia attaches to a reply */
function resources(items){let holder=$('journey-actions');if(!holder){holder=document.createElement('div');holder.id='journey-actions';holder.style.cssText='display:grid;gap:8px;font-size:13px';$('history').after(holder)}holder.replaceChildren();if(!Array.isArray(items))return;for(const x of items.slice(0,7)){try{const url=new URL(x.url);const deviceGeo=url.protocol==='geo:'&&x.handoff==='geo'&&url.href.startsWith('geo:0,0?q=');const approvedHttps=url.protocol==='https:'&&['www.google.com','maps.apple.com','rta.ae','www.rta.ae','www.uowdubai.ac.ae','www.hw.ac.uk','hw.ac.uk'].includes(url.hostname);if(!deviceGeo&&!approvedHttps)continue;const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=String(x.title||'Open source');link.style.cssText='display:block;padding:10px;border:1px solid var(--line);border-radius:12px;color:var(--focus)';holder.append(link)}catch(_){}}}
/* ===== Research display =====
   Shows only sources the server approved and opened (liveSources). Labels follow the agreed wording:
   "Official source" / "Organisation source" (later "Community experiences"); "Opened" = retrieved, not
   comprehensively verified; claims are "Source-backed" (an exact quote, not proof of interpretation). */
/* A listing site is cited for names to check, never as proof. */
const SOURCE_KIND={official:'Official source',government:'Official source',organisation:'Organisation source',institution:'Organisation source',operator:'Organisation source',business:'Organisation source',transport:'Organisation source',directory:'Listing site',community:'People’s experiences'};
function safeSources(list){
 if(!Array.isArray(list))return [];
 const out=[];
 for(const x of list.slice(0,20)){
  try{const u=new URL(String(x&&x.url));if(u.protocol!=='https:'||u.username||u.password)continue;
   const kind=SOURCE_KIND[x.category];if(!kind)continue; // unknown categories are not shown; community pages are labelled as experiences
   out.push({id:typeof x.id==='string'?x.id.slice(0,8):'',url:u.href,host:u.hostname.replace(/^www\./,''),title:String(x.title||u.hostname).slice(0,140),kind,category:String(x.category),checkedAt:typeof x.checkedAt==='string'?x.checkedAt:''});
  }catch(_){}
 }
 return out;
}
function safeSchoolContext(v){
 if(!v||v.city!=='Sharjah')return undefined;
 const urls=a=>(Array.isArray(a)?a:[]).slice(0,24).filter(u=>typeof u==='string'&&u.length<200&&/^https:\/\/(?:www\.)?spea\.shj\.ae\/en\/(?:education-institutes|educational-institutions)\/schools\/[a-z0-9-]+\/?$/.test(u));
 return {...(typeof v.targetName==='string'?{targetName:v.targetName.slice(0,80)}:{}),city:'Sharjah',curriculum:typeof v.curriculum==='string'?v.curriculum.slice(0,20):'',year:Number.isInteger(v.year)?v.year:null,shown:urls(v.shown),...(v.cursor?{cursor:{skipDirectory:v.cursor.skipDirectory===true,searchOffset:Math.max(0,Math.min(10,Number(v.cursor.searchOffset)||0)),pending:urls(v.cursor.pending).slice(0,20)}}:{})};
}
// The research loop's task state: scope only (what was asked, shown and where to continue). The server re-validates all of it.
function safeLoopTask(v){try{if(!v||typeof v!=='object'||Array.isArray(v))return undefined;const j=JSON.stringify(v);return j.length<16000?JSON.parse(j):undefined}catch(_){return undefined}}
function safeTaskContext(v){const school=safeSchoolContext(v),task=safeLoopTask(v&&v.task);if(!school&&!task)return undefined;return {...(school||{}),...(task?{task}:{})}}
function currentResearchContext(ts){const last=ts.filter(t=>t.role==='assistant').at(-1);return safeTaskContext(last?.meta?.research?.taskContext)}
function safeResearch(r){
 const str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 return {status:str(r.status,40),applicability:str(r.applicability,30),...(safeTaskContext(r.taskContext)?{taskContext:safeTaskContext(r.taskContext)}:{}),
  claims:Array.isArray(r.claims)?r.claims.slice(0,6).map(c=>({text:str(c&&c.text,300),sourceId:str(c&&c.sourceId,8),quote:str(c&&c.quote,520),
   quotes:Array.isArray(c&&c.quotes)?c.quotes.slice(0,6).map(q=>({label:str(q&&q.label,40),quote:str(q&&q.quote,320)})).filter(q=>q.quote):[]})).filter(c=>c.text&&(c.quote||c.quotes.length)):[],
  unresolved:Array.isArray(r.unresolved)?r.unresolved.slice(0,6).map(u=>str(u,40)).filter(Boolean):[]};
}
/* The reply's numbered citations become links, but only to vetted sources; the plain reference list at the end is replaced by source cards */
function citeSegments(text,srcs){
 const refs=new Map(),REF=/^\[(\d{1,2})\] .+?: (https:\/\/\S+)\s*$/gm;
 for(const m of String(text).matchAll(REF)){const u=m[2].replace(/[).,]+$/,'');const s=srcs.find(x=>x.url===m[2]||x.url===u);if(s)refs.set(m[1],s)}
 if(!refs.size)srcs.forEach((s,i)=>refs.set(String(i+1),s));
 const body=String(text).replace(REF,m=>refs.has(m.match(/^\[(\d{1,2})\]/)[1])?'':m).replace(/\n{3,}/g,'\n\n').trim();
 const out=[];let last=0;
 for(const m of body.matchAll(/\[(\d{1,2})\]/g)){
  const s=refs.get(m[1]);if(!s)continue; // a number with no vetted source stays plain text
  if(m.index>last)out.push({text:body.slice(last,m.index)});
  out.push({n:m[1],src:s});last=m.index+m[0].length;
 }
 if(last<body.length)out.push({text:body.slice(last)});
 return out;
}
function citedText(text,srcs){
 return citeSegments(text,srcs).map(seg=>{
  if(seg.text!=null)return document.createTextNode(seg.text);
  const a=document.createElement('a');a.className='cite';a.href=seg.src.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='['+seg.n+']';a.setAttribute('aria-label','Source '+seg.n+': '+seg.src.title+' (opens '+seg.src.host+')');return a;
 });
}
const RESEARCH_NOTE={
 'not-configured':'Live research isn’t switched on yet, so Orivia couldn’t check sources for this.',
 'search-limit':'Today’s source-checking limit has been reached. Please try again tomorrow.',
 'search-unavailable':'Sources couldn’t be checked just now. Please try again later.',
 'answer-unavailable':'Sources couldn’t be checked just now. Please try again later.',
 'no-evidence':'Orivia couldn’t find enough evidence from approved sources to answer this.',
 'insufficient-evidence':'Orivia couldn’t find enough evidence from approved sources to answer this.',
 'unsupported':'Orivia can’t research this kind of question yet.',
 'community-permissions-pending':'Community experiences aren’t available yet.',
 'partial':'Partly answered: some parts couldn’t be confirmed.'
};
const TOPIC_LABEL={school:'School enrolment',bank:'Bank requirements',medical:'Medical test',residency:'Residence visa',biometrics:'Biometrics and Emirates ID',institution:'Your institution’s requirements','community-permissions-pending':'What people recommend (community experiences aren’t available yet)'};
function researchBlock(srcs,research){
 const box=document.createElement('section');box.className='research';box.setAttribute('aria-label','Sources for this reply');
 const r=research||{};
 if(RESEARCH_NOTE[r.status]){const n=el('p','rnote '+(r.status==='partial'?'partial':'warn'),RESEARCH_NOTE[r.status]);box.append(n)}
 if(srcs.length){
  box.append(el('p','rhead','Sources'));
  const ol=document.createElement('ol');ol.className='sources-list';
  srcs.forEach((s,i)=>{
   const li=document.createElement('li');const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.className='src';
   const top=el('span','src-top');top.append(el('span','src-n',String(i+1)),el('span','src-kind '+(s.kind==='Official source'?'official':s.kind==='Listing site'?'listing':'org'),s.kind));
   const when=s.checkedAt&&Number.isFinite(Date.parse(s.checkedAt))?new Date(s.checkedAt).toLocaleString(undefined,{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'';
   a.append(top,el('strong','',s.title),el('span','src-meta',s.host+(when?' · Opened by Orivia '+when:'')+' ↗'));
   li.append(a);ol.append(li);
  });
  box.append(ol,el('p','tiny','“Opened” means Orivia read this page for your question. It doesn’t mean every requirement has been verified.'));
 }
 const claims=(r.claims||[]).filter(c=>srcs.some(s=>s.id&&s.id===c.sourceId));
 if(claims.length){
  const det=document.createElement('details');det.className='claims';det.append(el('summary','','Source-backed: see the quotes'));
  for(const c of claims){
   const n=srcs.findIndex(s=>s.id===c.sourceId)+1;const d=el('div','claim');d.append(el('p','',c.text));
   if(c.quotes&&c.quotes.length>1){ // one quote per fact in the claim, each labelled
    const ul=document.createElement('ul');ul.className='claim-quotes';
    for(const q of c.quotes){const li=document.createElement('li');if(q.label)li.append(el('span','q-label',q.label));li.append(el('blockquote','','“'+q.quote+'”'));ul.append(li)}
    d.append(ul,el('p','tiny','Each part of this point is quoted from source '+n+'. The quotes support it but don’t guarantee it applies to your situation.'));
   }else{
    d.append(el('blockquote','','“'+((c.quotes&&c.quotes[0]&&c.quotes[0].quote)||c.quote)+'”'),el('p','tiny','Quote from source '+n+'. A quote supports the point but doesn’t guarantee it applies to your situation.'));
   }
   det.append(d);
  }
  box.append(det);
 }
 if((r.unresolved||[]).some(x=>TOPIC_LABEL[x])){ // unknown codes are never shown as a vague placeholder
  const u=el('div','unresolved');u.append(el('p','rhead','Couldn’t confirm'));const ul=document.createElement('ul');
  for(const x of [...new Set(r.unresolved)])if(TOPIC_LABEL[x])ul.append(el('li','',TOPIC_LABEL[x]));
  u.append(ul);box.append(u);
 }
 if(r.applicability==='needs-review'&&srcs.length)box.append(el('p','tiny','Check it applies to you: rules can differ by institution, age, visa type or emirate.'));
 return box;
}

/* ===== Settings: saved in this browser ===== */
const settingsKey='orivia-private-settings-v1';
const SET_DEFAULT={theme:'system',size:'standard',tone:'friendly',suggest:true};
function readSettings(){try{const d=JSON.parse(localStorage.getItem(settingsKey)||'{}');return {...SET_DEFAULT,...(d&&typeof d==='object'?d:{})}}catch(_){return {...SET_DEFAULT}}}
function writeSettings(patch){const n={...readSettings(),...patch};try{localStorage.setItem(settingsKey,JSON.stringify(n))}catch(_){}applySettings();renderSettings()}
function applySettings(){
 const s=readSettings(),root=document.documentElement;
 if(s.theme==='light'||s.theme==='dark')root.dataset.theme=s.theme;else delete root.dataset.theme;
 root.classList.toggle('large',s.size==='large');
 const dark=s.theme==='dark'||(s.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
 document.querySelector('meta[name=theme-color]')?.setAttribute('content',dark?'#080C10':'#1C2733');
}
const TONE_NOTE={friendly:'Warm and conversational, like a helpful friend.',simple:'Short sentences and everyday words. Good if English isn’t your first language.',brief:'Straight to the point: the answer and the next step.'};
function seg(rootId,options,current,onPick){
 const root=$(rootId);root.replaceChildren();
 for(const [value,label] of options){const b=button(label,'seg-btn'+(current===value?' on':''),()=>onPick(value));b.setAttribute('role','radio');b.setAttribute('aria-checked',String(current===value));root.append(b)}
}
function renderSettings(){
 const s=readSettings();
 seg('set-theme',[['system','System'],['light','Light'],['dark','Dark']],s.theme,v=>writeSettings({theme:v}));
 seg('set-size',[['standard','Standard'],['large','Larger']],s.size,v=>writeSettings({size:v}));
 seg('set-tone',[['friendly','Friendly'],['simple','Simple words'],['brief','Short answers']],s.tone,v=>writeSettings({tone:v}));
 $('tone-note').textContent=TONE_NOTE[s.tone]||'';
 $('set-suggest').checked=s.suggest!==false;
 const on=aboutMeOn(),p=readProfile(),filled=!!(p&&(p.city||p.who||p.place));$('set-aboutme-use').checked=on;
 $('aboutme-state').textContent=on?(filled?'On: Orivia uses what you saved in My Life':'On, but nothing saved yet. Add details in My Life'):'Off: Orivia doesn’t use My Life details';
}
$('set-suggest').addEventListener('change',e=>writeSettings({suggest:e.target.checked}));
$('set-aboutme').onclick=()=>tab('mylife');
$('set-aboutme-use').addEventListener('change',e=>{setAboutMe(e.target.checked);renderSettings()});
$('open-settings').onclick=()=>tab('settings');
$('settings-back').onclick=()=>tab(lastTab||'chat');
$('life-settings').onclick=()=>tab('settings');
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',applySettings);
applySettings();

/* ===== Journeys: guided life processes =====
   One card component for Chat suggestions, My Journeys and Explore Journeys.
   Journey states: active, paused, saved (bookmarked), done (the user confirmed it). "Not now" saves nothing.
   Step states: not started, in progress, waiting (only where the guide has something to wait for), done, not sure.
   One record on this device, read by Chat and Journeys alike. Only the person changes it. */
const journeysKey='orivia-private-journeys-v1',offeredKey='orivia-private-offered';
const JID=/^[a-z]+(\.[a-z]+){1,3}$/;
const STATE_LABEL={active:'Active',waiting:'Waiting',paused:'Paused',saved:'Saved for later',done:'Completed'};
const STATE_ORDER={active:0,paused:1,saved:2,done:3};
const STEP_LABEL={not_started:'Not started',in_progress:'In progress',waiting:'Waiting',done:'Done',unsure:'Not sure'};
const STEP_MARK={not_started:'',in_progress:'•',waiting:'◷',done:'✓',unsure:'?'};
function readJourneys(){
 try{const d=JSON.parse(localStorage.getItem(journeysKey)||'{}');if(!d||typeof d!=='object'||Array.isArray(d))return {};
  for(const v of Object.values(d)){
   if(!v||typeof v!=='object')continue;
   if(v.status==='following')v.status='active';
   if(!v.stepStatus||typeof v.stepStatus!=='object')v.stepStatus={};
   if(Array.isArray(v.done)){for(const s of v.done)v.stepStatus[s]='done';delete v.done} // older saves
  }
  return d}catch(_){return {}}
}
function writeJourneys(d){try{localStorage.setItem(journeysKey,JSON.stringify(d))}catch(_){}}
function setJourney(id,patch){if(!JID.test(id))return;const d=readJourneys();d[id]={stepStatus:{},step:0,...(d[id]||{}),...patch,updated:new Date().toISOString()};writeJourneys(d);renderJourneys()}
function removeJourney(id){const d=readJourneys();delete d[id];writeJourneys(d);renderJourneys()}
function offered(){try{const d=JSON.parse(sessionStorage.getItem(offeredKey)||'[]');return Array.isArray(d)?d.filter(x=>typeof x==='string'&&JID.test(x)):[]}catch(_){return []}}
function markOffered(id){const o=offered();if(!o.includes(id)){o.push(id);try{sessionStorage.setItem(offeredKey,JSON.stringify(o.slice(-30)))}catch(_){}}}
const doneCount=v=>Object.values(v?.stepStatus||{}).filter(x=>x==='done').length;
const shownState=v=>v.status==='active'&&Object.values(v.stepStatus||{}).includes('waiting')?'waiting':v.status;
/* Sent with each chat message so Orivia reads the same record: journey ids, journey states and step states only */
function guidesForAI(){
 const d=readJourneys(),ids=Object.keys(d).filter(k=>JID.test(k)).sort((a,b)=>String(d[b].updated).localeCompare(String(d[a].updated)));
 const of=s=>ids.filter(k=>d[k].status===s);
 const progress={};for(const k of ids)if((d[k].status==='active'||d[k].status==='paused')&&Object.keys(d[k].stepStatus).length)progress[k]=d[k].stepStatus;
 return {following:of('active'),paused:of('paused'),saved:of('saved'),done:of('done'),offered:offered(),progress};
}
const reviewed=iso=>{const t=Date.parse(iso);return Number.isFinite(t)?new Date(t).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):''};
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function button(label,cls,fn){const b=el('button',cls,label);b.type='button';b.onclick=fn;return b}
function bar(n,of,label){const p=el('div','progress');const i=el('i');i.style.width=Math.round(n/Math.max(1,of)*100)+'%';p.append(i);p.setAttribute('role','progressbar');p.setAttribute('aria-valuemin','0');p.setAttribute('aria-valuemax',String(of));p.setAttribute('aria-valuenow',String(n));p.setAttribute('aria-label',label||(n+' of '+of+' steps done'));return p}
function pill(state){return el('span','state '+state,STATE_LABEL[state]||state)}
function progressLine(v){
 const n=Number(v.steps)||0,done=doneCount(v),of=done+' of '+n+' done',t=v.titles||{};
 const waiting=Object.entries(v.stepStatus||{}).filter(([,s])=>s==='waiting').map(([k])=>t[k]).filter(Boolean);
 if(v.status==='done')return 'Completed'+(n?' · '+n+' steps':'');
 if(v.status==='saved'&&!done)return 'Not started yet';
 if(waiting.length&&v.status==='active')return 'Waiting on: '+waiting[0]+(n?' · '+of:'');
 return (v.stepTitle?'Currently: '+v.stepTitle:'Step '+((Number(v.step)||0)+1))+(n?' · '+of:'');
}
/* Follow / save from anywhere */
function follow(o,from){setJourney(o.id,{status:'active',step:0,stepStatus:{},title:o.title,steps:Number(o.steps)||0});openGuide(o.id,{from})}
function saveJourney(o){setJourney(o.id,{status:'saved',step:0,stepStatus:{},title:o.title,steps:Number(o.steps)||0})}

/* The one journey card. ctx: 'suggest' (in Chat), 'mine' (My Journeys) or 'library' (Explore Journeys).
   extra.kind: 'offer' | 'refresher' | 'problem' | 'placement' (save where Chat worked out you are) */
function journeyCard(o,ctx,extra={}){
 const mine=readJourneys()[o.id], status=mine?.status||null;
 const card=el('article','jcard'+(ctx==='suggest'?' suggest':''));card.setAttribute('aria-label',o.title);
 const top=el('div','jtop');
 if(ctx==='mine'&&status)top.append(pill(shownState(mine)));
 else if(ctx!=='mine')top.append(el('p','kicker',(extra.kind==='placement'?'Save your progress?':extra.problem?'From your guide':status?STATE_LABEL[shownState(mine)]:'Step-by-step guide')+' · Reviewed '+reviewed(o.checkedAt)+(o.fresh===false?' · due for review':'')));
 if(ctx==='mine'){
  const more=button('⋯','more',()=>{menu.hidden=!menu.hidden;more.setAttribute('aria-expanded',String(!menu.hidden))});
  more.setAttribute('aria-label','Manage '+o.title);more.setAttribute('aria-expanded','false');top.append(more);
 }
 card.append(top,el('h3','',o.title));
 if(extra.kind==='placement')card.append(el('p','notice',extra.summary));
 else if(extra.problem){card.append(el('p','label',extra.problem.question));if(extra.problem.answer)card.append(el('p','',extra.problem.answer))}
 else if(ctx==='mine')card.append(el('p','notice',progressLine(mine)));
 else card.append(el('p','notice',(o.summary||'')+(o.steps?' '+o.steps+' steps.':'')));
 if(ctx==='mine'&&mine&&(status==='active'||status==='paused')&&mine.steps)card.append(bar(doneCount(mine),mine.steps));
 const row=el('div','row'), note=m=>{card.replaceChildren(el('p','',m))};
 const from=ctx==='suggest'?'chat':'journeys';
 const cont=label=>button(label,'btn small',()=>openGuide(o.id,{from}));
 if(extra.kind==='placement')row.append(button(mine?'Update My Journeys':'Save to My Journeys','btn small',()=>{
  setJourney(o.id,{status:mine?.status==='paused'||mine?.status==='saved'||!mine?'active':mine.status,title:o.title,steps:Number(o.steps)||0,stepStatus:{...(mine?.stepStatus||{}),...extra.stepStatus},step:extra.step??0,stepTitle:extra.stepTitle||mine?.stepTitle,titles:extra.titles||mine?.titles});
  note('Saved to My Journeys. Chat and the Journeys tab now show the same progress.');}));
 else if(extra.problem)row.append(button('Show me the steps','btn small',()=>openGuide(o.id,{problem:extra.problem.id,from:'chat'})));
 else if(status==='active')row.append(cont(ctx==='suggest'?'Continue guide · Step '+((Number(mine.step)||0)+1):'Continue →'));
 else if(status==='paused')row.append(button('Resume','btn small',()=>{setJourney(o.id,{status:'active'});openGuide(o.id,{from})}));
 else if(status==='saved'){const b=cont(ctx==='suggest'?'Open saved guide':'View guide');b.className='btn quiet small';row.append(b)}
 else if(status==='done')row.append(cont('Look again'));
 else if(ctx==='suggest'&&extra.kind!=='offer')row.append(button('Preview guide','btn small',()=>openGuide(o.id,{from:'chat'})));
 else{
  row.append(button('Follow guide','btn small',()=>{follow(o,from);if(ctx==='suggest')note('Added to My Journeys. You can pick up where you left off anytime.')}));
  row.append(button('Save for later','btn quiet small',()=>{saveJourney(o);if(ctx==='suggest')note('Saved to My Journeys. It’s in the Journeys tab whenever you’re ready.');else renderLibrary()}));
  if(ctx==='library')row.append(button('Preview','btn text small',()=>openGuide(o.id,{from:'journeys'})));
 }
 if(ctx==='suggest')row.append(button('Not now','btn text small',()=>note(extra.kind==='placement'?'Okay, nothing saved.':status?'Okay. It’s still in My Journeys.':'No problem. It’s in Journeys if you want it later, or just ask me.')));
 card.append(row);
 /* Manage menu: pause or resume, mark completed, remove (asks first when progress would be lost) */
 const menu=el('div','row menu');menu.hidden=true;
 if(ctx==='mine'&&mine){
  if(status==='active')menu.append(button('Pause journey','btn quiet small',()=>setJourney(o.id,{status:'paused'})));
  if(status==='paused')menu.append(button('Resume journey','btn quiet small',()=>setJourney(o.id,{status:'active'})));
  if(status==='saved')menu.append(button('Start following','btn quiet small',()=>setJourney(o.id,{status:'active'})));
  if(status!=='done')menu.append(button('Mark completed','btn quiet small',()=>setJourney(o.id,{status:'done'})));
  const rm=button('Remove','btn text small',()=>{
   const hasProgress=Object.keys(mine.stepStatus||{}).length>0||status==='done';
   if(hasProgress&&rm.dataset.sure!=='1'){rm.dataset.sure='1';rm.textContent='Tap again: removes it and its progress from this device';return}
   removeJourney(o.id);
  });
  menu.append(rm);card.append(menu);
 }
 return card;
}

/* Chat: show a suggested card under Orivia's reply */
function placeCard(card){card.id='guide-offer';($('journey-actions')||$('history')).after(card);const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight}
function guideCard(o){
 $('guide-offer')?.remove();
 if(!o||typeof o.id!=='string'||!JID.test(o.id)||typeof o.title!=='string')return;
 if(o.kind==='offer'&&(readSettings().suggest===false||readJourneys()[o.id]||offered().includes(o.id)))return; // never nag; respects Settings
 markOffered(o.id);
 placeCard(journeyCard(o,'suggest',{kind:o.kind,problem:o.kind==='problem'?o.problem:null}));
}
/* Chat worked out where someone is (e.g. the visa check-up): offer to save it, never save on its own */
async function placementCard(j){
 if(!j||!JID.test(String(j.id||''))||j.from==='journeys')return;
 const stepId=j.currentStep||j.unsureStep;if(!stepId)return;
 let g;try{g=await loadGuide(j.id)}catch(_){return}
 const idx=g.steps.findIndex(s=>s.id===stepId);if(idx<0)return;
 const stepStatus={};for(const s of (j.done||[]))if(g.steps.some(x=>x.id===s))stepStatus[s]='done';
 stepStatus[stepId]=j.unsureStep?'unsure':'in_progress';
 const mine=readJourneys()[j.id];
 if(mine&&Object.entries(stepStatus).every(([k,v])=>mine.stepStatus[k]===v))return; // already the same
 const titles=Object.fromEntries(g.steps.map(s=>[s.id,s.title]));
 const doneN=Object.values(stepStatus).filter(x=>x==='done').length;
 const summary=(doneN?doneN+(doneN===1?' step':' steps')+' done · ':'')+(j.unsureStep?'Not sure about: ':'Now on: ')+g.steps[idx].title;
 if($('guide-offer'))return;
 placeCard(journeyCard({id:g.id,title:g.title,steps:g.steps.length,checkedAt:g.checkedAt,fresh:g.fresh},'suggest',{kind:'placement',summary,stepStatus,step:idx,stepTitle:g.steps[idx].title,titles}));
}

/* Journeys tab: My Journeys first, then Explore Journeys */
function renderJourneys(){
 const d=readJourneys(),items=Object.entries(d).filter(([k,v])=>JID.test(k)&&v&&typeof v.title==='string')
  .sort((a,b)=>(STATE_ORDER[a[1].status]??9)-(STATE_ORDER[b[1].status]??9)||String(b[1].updated).localeCompare(String(a[1].updated)));
 const root=$('my-journeys');
 if(root){
  root.replaceChildren();$('j-count').textContent=items.length?items.length+(items.length===1?' journey':' journeys'):'';
  if(!items.length)root.append(el('p','empty','No journeys yet. Explore below, or ask Orivia what you need help with.'));
  for(const [id,v] of items)root.append(journeyCard({id,title:v.title,steps:v.steps},'mine'));
 }
 const life=$('life-journeys');
 if(life){
  life.replaceChildren();const now=items.filter(([,v])=>v.status==='active'||v.status==='paused').slice(0,3);
  for(const [id,v] of now){const st=shownState(v);const b=button('','now-item',()=>openGuide(id,{from:'mylife'}));b.append(icon('M6 18a2.5 2.5 0 1 0 0-.1M18 6a2.5 2.5 0 1 0 0-.1M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5'));const sp=el('span');sp.append(el('strong','',v.title),el('small','',(st==='paused'?'Paused · ':st==='waiting'?'Waiting · ':'')+progressLine(v)));b.append(sp,document.createTextNode('›'));life.append(b)}
  if(!now.length)life.append(button('Browse guides in Journeys','ask',()=>tab('journeys')));
 }
 if(!$('journeys').hidden)renderLibrary();
}
let library=null,libraryCat=null; // null: landing (categories only); 'all': every guide; or a category
async function loadLibrary(){
 if(library)return library;
 const r=await fetch('/v1/guides',{credentials:'same-origin',cache:'no-store'});const d=await r.json().catch(()=>null);
 if(!r.ok||!Array.isArray(d?.guides))throw Error('library');return library=d.guides;
}
const CAT_ICON={transport:'M7 17h10M6 4h12a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2zM4 10h16M8 20l-1 1M16 20l1 1',
 university:'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5',residency:'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM12 9.5a2 2 0 1 0 0-.1M9 15h6',
 everyday:'M4 11l8-7 8 7v9H4zM10 20v-5h4v5',health:'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
 work:'M4 8h16v11H4zM9 8V5h6v3',family:'M8 8a2.5 2.5 0 1 0 0-.1M16 9a2 2 0 1 0 0-.1M4 20c0-3 2-5 4-5s4 2 4 5M13 20c0-2.5 1.3-4 3-4s3 1.5 3 4'};
function icon(path){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.8');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',path);s.append(p);return s}
async function renderLibrary(){
 const cats=$('j-cats'),list=$('j-library');
 let all;try{all=await loadLibrary()}catch(_){list.replaceChildren(el('p','notice','Couldn’t load the guide library just now. Please try again.'));return}
 const q=($('j-search').value||'').trim().toLowerCase();
 const groups=[];for(const g of all)if(!groups.some(x=>x[0]===g.category))groups.push([g.category,g.categoryName]);
 cats.replaceChildren();
 for(const [key,name] of groups){
  const n=all.filter(g=>g.category===key).length;
  const b=button('','cat'+(libraryCat===key?' on':''),()=>{libraryCat=libraryCat===key?null:key;renderLibrary()});
  b.setAttribute('aria-pressed',String(libraryCat===key));b.append(icon(CAT_ICON[key]||CAT_ICON.everyday),el('strong','',name),el('span','tiny',n+(n===1?' guide':' guides')));cats.append(b);
 }
 list.replaceChildren();
 if(!libraryCat&&!q){list.append(button('Browse all '+all.length+' guides','btn quiet wide',()=>{libraryCat='all';renderLibrary()}));return}
 const shown=all.filter(g=>(libraryCat==='all'||!libraryCat||g.category===libraryCat)&&(!q||(g.title+' '+g.summary).toLowerCase().includes(q))).sort((a,b)=>(b.suggested-a.suggested));
 const head=el('div','sechead');head.append(el('h4','',q?'Results for “'+q+'”':libraryCat==='all'?'All guides':(groups.find(x=>x[0]===libraryCat)||[,''])[1]),button('Close','ask',()=>{libraryCat=null;$('j-search').value='';renderLibrary()}));list.append(head);
 if(!shown.length)list.append(el('p','notice','No guides match that yet. Try another word, or ask Orivia.'));
 for(const g of shown){const c=journeyCard(g,'library');const st=readJourneys()[g.id];c.querySelector('.kicker').textContent=(st?STATE_LABEL[shownState(st)]+' · ':'')+'Dubai · Reviewed '+reviewed(g.checkedAt)+' · '+g.categoryName;list.append(c)}
}

/* Inside a journey: one step at a time, in clear sections */
const guideCache={};
async function loadGuide(id){
 if(guideCache[id])return guideCache[id];
 const r=await fetch('/v1/guides/'+encodeURIComponent(id),{credentials:'same-origin',cache:'no-store'});
 const d=await r.json().catch(()=>null);if(!r.ok||!d?.guide?.steps?.length)throw Error('guide');
 return guideCache[id]=d.guide;
}
function block(kind,title,...nodes){nodes=nodes.filter(Boolean);if(!nodes.length)return null;const b=el('section','blk b-'+kind);b.append(el('h4','',title),...nodes);return b}
function list(items,ordered,cls){if(!items||!items.length)return null;const l=el(ordered?'ol':'ul',cls||'');for(const x of items)l.append(el('li','',x));return l}
async function openGuide(id,opts={}){
 if(!JID.test(id))return;
 tab('guide');const body=$('guide-body');body.replaceChildren(el('p','notice','Opening your guide…'));
 let g;try{g=await loadGuide(id)}catch(_){body.replaceChildren(el('p','notice','I couldn’t open this guide just now. Please try again.'),button('← Journeys','ask',()=>tab('journeys')));return}
 const titles=Object.fromEntries(g.steps.map(s=>[s.id,s.title]));
 let i=Math.min(Math.max(0,Number(readJourneys()[id]?.step)||0),g.steps.length-1);
 const store=patch=>{if(readJourneys()[id])setJourney(id,{steps:g.steps.length,titles,...patch})};
 const go=n=>{i=n;store({step:i,stepTitle:g.steps[i].title});draw()}; // moving never changes a step's status
 const draw=()=>{
  const s=g.steps[i],mine=readJourneys()[id],status=mine?.status||null,ss=mine?.stepStatus||{},cur=ss[s.id]||'not_started',n=doneCount(mine);
  body.replaceChildren();
  const head=el('div','jhead');head.append(button('← Journeys','ask',()=>tab('journeys')),button('Chat','chip-btn',()=>tab('chat')));body.append(head);
  const meta=el('div','row');if(status)meta.append(pill(shownState(mine)));meta.append(el('span','kicker','Checked guide · Reviewed '+reviewed(g.checkedAt)+(g.fresh?'':' · due for review: confirm with the official source')));body.append(meta);
  body.append(el('h2','',g.title));
  if(!mine){const f=el('div','row');f.append(button('Follow this guide','btn small',()=>{setJourney(id,{status:'active',step:i,stepTitle:s.title,stepStatus:{},title:g.title,steps:g.steps.length,titles});draw()}),button('Save for later','btn quiet small',()=>{setJourney(id,{status:'saved',step:0,stepStatus:{},title:g.title,steps:g.steps.length,titles});draw()}));body.append(f,el('p','tiny','You’re previewing. Follow it to keep track of each step; progress is saved on this device.'))}
  if(status==='paused'){const p=el('div','banner');p.append(el('span','','This journey is paused. Your progress is kept.'),button('Resume','btn small',()=>{setJourney(id,{status:'active'});draw()}));body.append(p)}
  body.append(el('p','tiny','Step '+(i+1)+' of '+g.steps.length+(mine?' · '+n+' done':'')),bar(mine?n:i+1,g.steps.length,mine?undefined:'Step '+(i+1)+' of '+g.steps.length));
  /* All steps, with the person's own statuses; tap one to read it */
  const all=el('details','steps');all.append(el('summary','','All steps'));const ol=el('ol');
  g.steps.forEach((x,k)=>{const st=ss[x.id]||'not_started';const li=el('li');const b=button('','linkish'+(k===i?' here':''),()=>go(k));
   b.append(el('span','mark '+st,STEP_MARK[st]),el('span','',x.title));if(mine&&st!=='not_started')b.append(el('span','tiny',' · '+STEP_LABEL[st]));if(k===i)b.setAttribute('aria-current','step');li.append(b);ol.append(li)});
  all.append(ol);body.append(all);
  /* The step, in sections */
  const card=el('section','step');
  const sh=el('div','jtop');sh.append(el('p','kicker','Step '+(i+1)));if(mine)sh.append(el('span','sstate '+cur,STEP_LABEL[cur]));card.append(sh,el('h3','',s.title));
  const about=s.info.slice(0,2).map(p=>el('p','',p));
  if(s.info.length>2){const more=el('details','more-text');more.append(el('summary','','Read more'),...s.info.slice(2).map(p=>el('p','',p)));about.push(more)}
  card.append(...[
   block('about','About this step',...about),
   block('do','Do this',list(s.doThis,true)),
   block('need','What you’ll need',list(s.bring,false,'checks')),
   block('expect','What to expect',s.expect?el('p','',s.expect):null,s.cost?el('p','fact','Cost · '+s.cost):null,s.time?el('p','fact','How long · '+s.time):null,s.waitingFor?el('p','fact','Waiting for · '+s.waitingFor):null),
   block('tip','Tip',list(s.tips)),
   s.staffQuestion?block('phrase','Show staff',el('p','say','“'+s.staffQuestion+'”')):null
  ].filter(Boolean));
  const ask=button('Ask Orivia about this step','ask',()=>{});ask.dataset.ask='Help me with this step of “'+g.title+'”: '+s.title;card.append(ask);
  body.append(card);
  /* Where are you with this step? Recording a status never moves you on */
  if(mine&&status!=='paused'){
   const box=el('section','statusbox');box.append(el('h4','','Where are you with this step?'));
   const opts2=el('div','seg');opts2.setAttribute('role','radiogroup');opts2.setAttribute('aria-label','Status of '+s.title);
   for(const st of s.statuses){const b=button(STEP_LABEL[st],'seg-btn'+(cur===st?' on':''),()=>{store({stepStatus:{...ss,[s.id]:st},stepTitle:s.title,step:i});opts.keepScroll=true;draw()});b.setAttribute('role','radio');b.setAttribute('aria-checked',String(cur===st));opts2.append(b)}
   box.append(opts2);
   if(cur==='unsure'){box.append(el('p','hint','That’s okay. It won’t count as done.'+(s.confirm?' How to check: '+s.confirm:'')));const a=button('Ask Orivia to help me check','ask',()=>{});a.dataset.ask='I’m not sure about this step of “'+g.title+'”: '+s.title;box.append(a)}
   if(cur==='waiting')box.append(el('p','hint',s.waitingFor?'Waiting for: '+s.waitingFor:'Marked as waiting. You can come back to it any time.'));
   if(cur==='done'&&i<g.steps.length-1)box.append(el('p','hint','Nice. Go to the next step when you’re ready.'));
   body.append(box);
  }
  const nav=el('div','row spread');
  nav.append(i>0?button('← Previous','btn quiet small',()=>go(i-1)):el('span'));
  nav.append(i<g.steps.length-1?button('Next step →','btn small',()=>go(i+1)):button('Back to Journeys','btn quiet small',()=>tab('journeys')));
  body.append(nav);
  if(status==='active'&&n===g.steps.length){const fin=el('div','banner');fin.append(el('span','','Every step is marked done. Finished with this guide?'),button('Mark journey completed','btn small',()=>{setJourney(id,{status:'done'});draw()}));body.append(fin)}
  if(status==='done')body.append(el('p','tiny','You marked this journey completed. That’s your own record, not official confirmation of any outcome.'));
  if(g.problems.length){body.append(el('h3','','Things that might go wrong'));for(const p of g.problems){const det=el('details','problem');det.append(el('summary','',p.question));if(p.answer)det.append(el('p','',p.answer));
   if(p.steps.length){const ol2=el('ol');for(const x of p.steps){const li=el('li');li.append(el('strong','',x.title));if(x.body)li.append(el('p','',x.body));const sub=list(x.list);if(sub)li.append(sub);if(x.tip)li.append(el('p','tiny',x.tip));ol2.append(li)}det.append(ol2)}
   if(opts.problem===p.id){det.open=true;setTimeout(()=>det.scrollIntoView({block:'center'}),0)}body.append(det)}}
  body.append(el('h3','','Official sources'));
  const src=el('ul','sources');for(const x of g.sources){const li=el('li');const a=el('a','',x.name+' ↗');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);src.append(li)}
  body.append(src,el('p','tiny','Guide reviewed '+reviewed(g.checkedAt)+'. That’s a review of the whole guide, not a live check of every detail.'));
  if(!opts.problem&&!opts.keepScroll)body.parentElement.scrollTop=0;
  opts.keepScroll=false;
 };
 draw();
}
$('j-search').addEventListener('input',()=>renderLibrary());
$('back-chat').onclick=()=>tab('chat');
for(const [t,u,sub] of OFFICIAL){const a=el('a','link-card');a.href=u;a.target='_blank';a.rel='noopener noreferrer';const s=el('span');s.append(el('strong','',t),el('small','tiny',sub));a.append(s,document.createTextNode('↗'));$('officials').append(a)}
renderJourneys();
/* Calendar form (Calendar section) */
$('reminder-form').addEventListener('submit',event=>{
 event.preventDefault();
 const title=$('reminder-title').value.trim().slice(0,100);
 const at=new Date($('reminder-date').value+'T'+($('reminder-time').value||'09:00'));
 if(!title||!Number.isFinite(at.getTime())||at.getTime()<Date.now()+60000||at.getTime()>Date.now()+366*86400000){
  $('reminder-status').textContent='Please choose a time in the future, within the next year.';return
 }
 const alarm=Number($('reminder-alarm').value);
 const saved={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),title,at:at.toISOString(),alarm:ALARMS.some(([m])=>m===alarm)?alarm:30};
 events.push(saved);storeEvents();
 selectedDay=null;weekOffset=0;closeAdd();renderEvents();renderUpcoming();
 flash('Saved in Orivia. Tap “Add to phone calendar” to get an alert on your phone.');
});
/* Message box grows with the text; Enter sends, Shift+Enter adds a line */
function grow(){const m=$('msg');m.style.height='auto';m.style.height=Math.min(m.scrollHeight,140)+'px'}
$('msg').addEventListener('input',grow);
$('msg').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('form').requestSubmit()}});
function chip(label,fn){const holder=$('journey-actions')||(resources([]),$('journey-actions'));const b=document.createElement('button');b.type='button';b.className='action-chip';b.textContent=label;b.onclick=fn;holder.append(b)}
/* Public beta: same app, plus a one-time "I'm human" check (Cloudflare Turnstile) before the first message */
let mode='private',humanOk=true,humanState='idle',startRequested=false,humanAttempt=0;
function enterApp(){
 if(!$('consent').checked||!humanOk)return;
 startRequested=false;$('consent').checked=false;sessionStorage.setItem(ck,'yes');show();
}
/* On failure, say why and let the person retry: never loop the check by itself */
function humanFailed(msg){
 humanOk=false;humanState='failed';startRequested=false;
 const n=$('human-note');n.replaceChildren(document.createTextNode(msg+' '));
 const b=document.createElement('button');b.type='button';b.className='ask';b.textContent='Try again';
 b.onclick=()=>{humanState='checking';n.textContent='Checking again…';try{window.turnstile.reset('#human-check')}catch(_){humanFailed('Couldn’t restart the check. Please reload Orivia.')}};n.append(b);
}
function loadTurnstile(siteKey){
 humanOk=false;humanState='checking';window.__siteKey=siteKey;$('human-check').hidden=false;$('human-note').hidden=false;
 const go=()=>window.turnstile.render('#human-check',{sitekey:siteKey,'error-callback':code=>{humanFailed('The check couldn’t load (code: '+String(code).slice(0,12)+').');return true},callback:async token=>{
  const attempt=++humanAttempt;humanOk=false;humanState='verifying';$('human-note').textContent='Confirming your check with Orivia…';
  try{const r=await fetch('/v1/human',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),signal:AbortSignal.timeout(15000)});if(attempt!==humanAttempt)return;humanOk=r.ok;
   if(r.ok){humanState='verified';$('human-note').textContent='Thanks, you’re all set.';if(startRequested)enterApp();return}
   const d=await r.json().catch(()=>({}));const code=Array.isArray(d.codes)&&d.codes.length?' (code: '+d.codes.join(', ')+')':(r.status===403&&d.error==='Origin not allowed'?' (code: origin)':' (code: '+r.status+')');
   humanFailed('That check didn’t work'+code+'.');
  }catch(_){if(attempt===humanAttempt)humanFailed('Couldn’t confirm the check with Orivia. Please try again.')}
 }});
 if(window.turnstile)return go();
 const sc=document.createElement('script');sc.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';sc.async=true;sc.onload=go;sc.onerror=()=>humanFailed('The human check couldn’t load. Please try reloading Orivia.');document.head.append(sc);
}
/* Private research pilot: shown only when this private deployment offers it; off unless the tester ticks it. The consent names
   OpenAI and is versioned, so a changed pilot never reuses an older tick. Stored on this device only. */
const pilotKey='orivia-pilot-consent';let pilotOffer=null;
function setupPilot(d){
 const p=d&&d.mode!=='public'&&d.providerPilot&&typeof d.providerPilot==='object'?d.providerPilot:null;
 const row=$('pilot-row');if(!row)return;
 if(!p||p.provider!=='OpenAI'||typeof p.consent!=='string'||!/^[a-z0-9-]{4,60}$/.test(p.consent)){pilotOffer=null;row.hidden=true;return}
 pilotOffer=p.consent;row.hidden=false;$('pilot-text').textContent=String(p.text||'').slice(0,600);
 let saved='';try{saved=localStorage.getItem(pilotKey)||''}catch(_){}
 $('set-pilot').checked=saved===pilotOffer;
 $('set-pilot').onchange=e=>{try{if(e.target.checked)localStorage.setItem(pilotKey,pilotOffer);else localStorage.removeItem(pilotKey)}catch(_){}};
}
function pilotConsent(){if(!pilotOffer)return null;try{return localStorage.getItem(pilotKey)===pilotOffer?{openai:pilotOffer}:null}catch(_){return null}}
async function loadMode(){
 try{const r=await fetch('/v1/config',{credentials:'same-origin',cache:'no-store'});const d=await r.json();
  setupPilot(d);
  if(d&&d.mode==='public'){mode='public';document.body.dataset.mode='public';for(const n of document.querySelectorAll('[data-public]'))n.textContent=n.dataset.public;if(!$('intro').hidden&&d.turnstileSiteKey)loadTurnstile(d.turnstileSiteKey);else window.__siteKey=d.turnstileSiteKey}
 }catch(_){}
}
loadMode();
if(sessionStorage.getItem(ck)==='yes')show();
$('start').onclick=()=>{
 if(!$('consent').checked)return;
 if(!humanOk){
  if(humanState==='failed')return; // keep the actual error and Try again button
  startRequested=true;$('human-note').textContent=humanState==='verifying'?'Confirming your check with Orivia… We’ll open it when this finishes.':'Please complete the quick check above. We’ll open Orivia when it’s confirmed.';return
 }
 enterApp()};
$('clear').onclick=()=>{
 if(busy)return;const b=$('clear');
 if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to delete this chat';setTimeout(()=>{b.dataset.sure='';b.textContent='Delete this chat'},4000);return}
 store.chats=store.chats.filter(c=>c.id!==store.active);store.active=null;persist();turns=[];clearChatCards();draw();renderChats();b.dataset.sure='';b.textContent='Delete this chat';tab('chat')};
$('form').onsubmit=async e=>{
 e.preventDefault();if(busy||sessionStorage.getItem(ck)!=='yes')return;
 stopDictation(true);stopSpeaking();
 const text=$('msg').value.trim();if(!text)return;
 $('msg').value='';grow();turns.push({role:'user',content:text.slice(0,900)});save();draw();
 const chatId=store.active,sentTurns=turns.slice();
 busy=true;$('send').disabled=true;$('status').textContent='Orivia is thinking…';
 try{
  const r=await fetch('/v1/chat',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:chatMessages(sentTurns),preferences:{researchContext:currentResearchContext(sentTurns),language:'en',style:readSettings().tone,suggestGuides:readSettings().suggest!==false,profile:profileForAI(),guides:guidesForAI(),...(pilotConsent()?{providerConsent:pilotConsent()}:{})}})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){
   const why=d&&d.error;
   if(r.status===401&&why==='human_check'){sessionStorage.removeItem(ck);$('workspace').hidden=true;$('nav').hidden=true;$('intro').hidden=false;if(window.__siteKey)loadTurnstile(window.__siteKey);$('status').textContent='';return}
   $('status').textContent=why==='person_limit'?'You’ve reached today’s message limit for the beta. Your guides, calendar and journeys still work, and messages come back tomorrow.':why==='daily_limit'?'Orivia’s beta is very busy today. Please try again tomorrow; your guides, calendar and journeys still work.':r.status===429?'Too many messages at once. Please wait a moment and try again.':'Orivia is temporarily unavailable. Please try again.';return}
  if(typeof d.reply!=='string'||!d.reply.trim())throw Error('empty');
  const meta={};const vetted=safeSources(d.liveSources);if(vetted.length)meta.sources=vetted;if(d.research&&typeof d.research==='object')meta.research=safeResearch(d.research);
  if(vetted.length&&Array.isArray(d.organisations)){const orgs=d.organisations.slice(0,8);if(safeOrgs(orgs,vetted).length){meta.organisations=JSON.parse(JSON.stringify(orgs));if(['list','single','choose'].includes(d.cardMode))meta.cardMode=d.cardMode}}
  const answer={role:'assistant',content:d.reply.slice(0,4000),...(Object.keys(meta).length?{meta}:{})};
  if(store.active!==chatId){ // they switched chats while Orivia was replying: file the answer in its own chat
   const c=store.chats.find(x=>x.id===chatId);if(c){c.turns=[...c.turns,answer];c.updated=Date.now();persist();renderChats()}
   $('status').textContent='Orivia replied in “'+(c?c.title:'another chat')+'”.';return;
  }
  turns.push(answer);save();draw();
  $('guide-offer')?.remove();
  resources(d.actions||[]); // sources now show under the reply itself
  guideCard(d.guideOffer);
  if(!d.guideOffer&&!d.journey)rememberCard(d.transport);else $('remember-card')?.remove();
  if(!d.guideOffer)placementCard(d.journey);
  if(/\b(calendar|reminders?|appointments?|schedule)\b/i.test(text))chip('Open My calendar',()=>tab('calendar'));
  $('status').textContent=d.liveSources?.length?'Opened approved source page(s) for this reply. Routes and schedules are not checked.':d.verifiedSources?.length?'Reviewed campus references attached; live pages unavailable.':'AI reply • No approved live sources checked.';
 }catch(_){$('status').textContent='Could not reach the private AI. Please try again.'}
 finally{busy=false;$('send').disabled=false}
};
