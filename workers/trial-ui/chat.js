'use strict';
/* Orivia private AI trial: chat-first mobile app with Calendar, Journeys and My Life behind it. */
const key='orivia-ai-private-turns',ck='orivia-ai-private-consent',eventKey='orivia-private-events-v1',profileKey='orivia-private-profile-v1';
let turns=[],busy=false,events=[],activeChatRequest=null;
const $=id=>document.getElementById(id);
function uiText(value){return window.OriviaI18n?.text(value)??value}
function uiLanguage(){return window.OriviaI18n?.language()||'en'}
const TITLES={home:'',chat:'',library:'Library',calendar:'Calendar',journeys:'Your guides',mylife:'My Life',guide:'Your guides',settings:'Settings'};
function show(){
 $('intro').hidden=true;$('workspace').hidden=false;$('nav').hidden=false;$('open-settings').hidden=false;$('open-chats').hidden=false;
 loadChats();const c=activeChat();turns=c?c.turns.slice():[];

 draw();renderChats();tab('home');window.OriviaNotifications?.changed();
}
/* ===== Chat history: saved on this device (localStorage), no account, no sync =====
   store = {chats:[{id,title,titled,created,updated,pinned,archived,turns}], active}
   Only the active chat is shown and only its latest messages go to the AI. */
const chatsKey='orivia-private-chats-v1',chatsBackupKey='orivia-private-chats-v1-unreadable';
// Nothing here ever deletes or shortens a conversation on its own. If saving fails, the chat stays on screen,
// the person is told plainly, and they choose what to delete. Only the latest 12 messages go to the AI.
let store={chats:[],active:null,library:{hidden:[]}};
const validTurn=x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string'&&(x.content.trim()||(x.role==='user'&&x.meta&&x.meta.attachment&&typeof x.meta.attachment.name==='string'));
const newId=()=>'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function autoTitle(ts){const u=(ts.find(t=>t.role==='user')||{}).content||'New chat';const t=u.replace(/\s+/g,' ').trim();return t.length>48?t.slice(0,46).replace(/\s\S*$/,'')+'…':t}
function normChat(c){
 if(!c||typeof c!=='object'||typeof c.id!=='string')return null;
 const ts=Array.isArray(c.turns)?c.turns.filter(validTurn).map(t=>({role:t.role,content:String(t.content).slice(0,t.role==='assistant'?4000:2000),...(t.meta&&typeof t.meta==='object'?{meta:t.meta}:{})})):[];
 return {id:c.id.slice(0,24),title:String(c.title||autoTitle(ts)).slice(0,80),titled:!!c.titled,created:Number(c.created)||Date.now(),updated:Number(c.updated)||Date.now(),pinned:!!c.pinned,archived:!!c.archived,turns:ts,...(c.orgContext&&typeof c.orgContext==='object'&&/^[A-Za-z0-9-]{1,64}$/.test(String(c.orgContext.org))&&/^[A-Za-z0-9-]{1,64}$/.test(String(c.orgContext.content))?{orgContext:{org:String(c.orgContext.org),content:String(c.orgContext.content),title:String(c.orgContext.title||'').slice(0,150),orgName:String(c.orgContext.orgName||'').slice(0,80)}}:{}),...(()=>{const list=(Array.isArray(c.documents)?c.documents:c.document?[c.document]:[]).filter(d=>d&&typeof d==='object'&&typeof d.text==='string'&&d.text.trim()).map(d=>({...(typeof d.id==='string'?{id:d.id.slice(0,40)}:{}),name:String(d.name||'Document').slice(0,120),kind:String(d.kind||'').slice(0,80),text:d.text.slice(0,12000),addedAt:Number(d.addedAt)||Date.now(),...(d.partial?{partial:true}:{})}));return list.length?{documents:list}:{}})()};
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
 try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(chatsKey,JSON.stringify(store));storageWarn('');return true}
 catch(_){
  storageWarn('This device is out of space, so your latest messages aren’t saved yet. Nothing has been deleted. Delete chats you no longer need, and Orivia will save this one again.');
  return false;
 }
}
function savedHas(c){
 try{const d=JSON.parse((globalThis.OriviaAccountStorage?.storage||localStorage).getItem(chatsKey)||'null');const x=d&&Array.isArray(d.chats)&&d.chats.find(y=>y&&y.id===c.id);return !!x&&Array.isArray(x.turns)&&x.turns.length===c.turns.length}catch(_){return false}
}
function legacyId(ts){let h=0;for(const ch of JSON.stringify(ts.map(t=>[t.role,t.content])))h=(h*31+ch.charCodeAt(0))|0;return 'clegacy'+(h>>>0).toString(36)}
function loadChats(){
 storeLocked=false;store={chats:[],active:null,library:{hidden:[]}};
 let raw=null;try{raw=(globalThis.OriviaAccountStorage?.storage||localStorage).getItem(chatsKey)}catch(_){}
 if(raw){
  let d=null;try{d=JSON.parse(raw)}catch(_){}
  if(d&&Array.isArray(d.chats))store={chats:d.chats.map(normChat).filter(Boolean),active:typeof d.active==='string'?d.active:null,library:window.OriviaDiscoveries?window.OriviaDiscoveries.normLibrary(d.library):{hidden:Array.isArray(d.library?.hidden)?d.library.hidden.filter(k=>typeof k==='string'):[]}};
  else{ // unreadable: keep an untouched copy before anything new is written; if that fails, don't write at all
   try{if((globalThis.OriviaAccountStorage?.storage||localStorage).getItem(chatsBackupKey)===null)(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(chatsBackupKey,raw)}catch(_){storeLocked=true}
   if(!storeLocked)storageWarn('Your earlier saved chats couldn’t be read. A copy has been kept on this device, and new chats will be saved separately.');
  }
 }
 // Migration: the conversation that used to live only in this tab becomes a saved chat.
 // The old copy is removed only after the new one is confirmed saved; otherwise it stays for next time.
 try{const old=JSON.parse((globalThis.OriviaAccounts?.user?null:sessionStorage.getItem(key))||'null');
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
function presentedTitle(ts){try{const t=window.OriviaPresentation?.titleFor?.(ts.map(x=>({role:x.role,content:x.content})));if(typeof t==='string'&&t.trim())return t.trim().slice(0,80)}catch(_){}return autoTitle(ts)}
function save(){
 let c=activeChat();
 if(!c){if(!turns.length)return;c=normChat({id:newId(),turns:[],created:Date.now(),orgContext:pendingOrgContext,documents:pendingDocuments});pendingOrgContext=null;pendingDocuments=[];store.chats.unshift(c);store.active=c.id}
 c.turns=turns.slice();c.updated=Date.now();if(!c.titled)c.title=presentedTitle(c.turns);
 const ok=persist();renderChats();return ok;
}
function clearChatCards(){resources([]);for(const id of ['guide-offer','remember-card','inline-calendar'])$(id)?.remove();$('status').textContent=''}
function openChat(id){closeHandoff();stopSpeaking();stopDictation(false);pendingOrgContext=null;pendingDocuments=[];pendingAttachment=null;cancelAttach();renderAttachmentPreview();store.active=id;persist();const c=activeChat();turns=c?c.turns.slice():[];clearChatCards();draw();closeChats();tab('chat');renderOrgContext()}
function newChat(ctx=null){closeHandoff();stopSpeaking();stopDictation(false);pendingOrgContext=ctx;pendingDocuments=[];pendingAttachment=null;cancelAttach();renderAttachmentPreview();store.active=null;persist();turns=[];clearChatCards();draw();closeChats();tab('chat');renderOrgContext();$('msg').focus()}
/* Library (Ina's design, 22 Oct): one place for the person's files, guides & journeys and shortlists. A view over the
   records that already exist (Files storage, saved guides with their progress, shortlists inside chats); nothing is
   copied, moved or deleted here, and nothing is sent anywhere by looking. "Use in Chat" and "Compare in Chat" only
   prepare the chat; the person still sends (and a file still goes through the reading notice). */
let libFilter='all',filesServer=false;
// Where Files is switched off, the Library is guides and shortlists only (no Files tab, no file actions).
function showLibraryFiles(){const tab=$('lib-tab-files'),group=$('files-title')?.closest('section');if(tab)tab.hidden=!filesServer;if(group)group.hidden=!filesServer;if(!filesServer&&libFilter==='files')libFilter='all'}
function libItem(node,kind,text){node.dataset.libKind=kind;node.dataset.libText=String(text||'').toLowerCase();return node}
// Discoveries come from library-discoveries.js (pure, tested); removal state lives once in store.library, not in chats.
const discoveryHelpers={safeSources:x=>safeSources(x),safeDestinations:(x,y)=>safeDestinations(x,y),safeOrgs:(x,y)=>safeOrgs(x,y),placeIdentity:d=>placeIdentity(d)};
let discoveryShown=0;
function libraryDiscoveries(){return window.OriviaDiscoveries.collect(store.chats,store.library,discoveryHelpers)}
function setDiscoveryHidden(key,hidden){store.library=hidden?window.OriviaDiscoveries.hide(store.library,key):window.OriviaDiscoveries.restore(store.library,key);persist();renderLibraryView()}
function libraryShortlists(){
 const out=[];
 for(const chat of store.chats)for(const t of chat.turns||[]){
  if(t.role!=='assistant'||!Array.isArray(t.meta?.shortlist)||!t.meta.shortlist.length)continue;
  const orgs=safeOrgs(t.meta.organisations,safeSources(t.meta.sources)),picked=orgs.filter(o=>t.meta.shortlist.includes(o.id));
  if(picked.length)out.push({chat,names:picked.map(o=>o.name)});
 }
 return out;
}
// (Named renderLibraryView: the guide catalogue below has its own renderLibrary, and a second function with the same name
// would silently replace this one.)
function renderLibraryView(){
 mountLibrary();showLibraryFiles();const done=filesServer?window.OriviaFiles?.render?.():null;
 // Guides & journeys: the person's saved guides, newest first, with their progress (the same cards as before).
 const d=readJourneys(),items=Object.entries(d).filter(([k,v])=>JID.test(k)&&v&&typeof v.title==='string').sort((a,b)=>String(b[1].updated).localeCompare(String(a[1].updated)));
 const g=$('lib-guides');g.replaceChildren();
 for(const [id,v] of items)g.append(libItem(journeyCard({id,title:v.title,steps:v.steps},'mine'),'guides',v.title));
 if(!items.length)g.append(el('p','tiny',uiText('No saved guides yet. Ask Orivia what you need help with, or explore guides from Home.')));
 const cont=items.find(([,v])=>v.status==='active'),c=$('lib-continue');
 if(cont){c.replaceChildren(el('h2','',uiText('Continue where you left off')),journeyCard({id:cont[0],title:cont[1].title,steps:cont[1].steps},'mine'));c.hidden=false}else{c.hidden=true;c.replaceChildren()}
 // Shortlists: from the chats they were made in (opening the chat shows them with their sources).
 const s=$('lib-shortlists');s.replaceChildren();const lists=libraryShortlists();
 for(const {chat,names} of lists){const card=el('article','lib-short');card.append(el('strong','',chat.title||uiText('Chat')),el('p','tiny',names.join(' · ')+' · '+new Date(chat.updated||chat.created||Date.now()).toLocaleDateString()));
  const row=el('div','attach-row');row.append(attachButton('Open chat',()=>openChat(chat.id)),attachButton('Compare in Chat',()=>{openChat(chat.id);$('msg').value=uiText('Please compare my shortlist:')+' '+names.join(', ');grow();$('msg').focus()}));card.append(row);
  s.append(libItem(card,'shortlists',(chat.title||'')+' '+names.join(' ')))}
 if(!lists.length)s.append(el('p','tiny',uiText('No shortlists yet. When Orivia shows you options in chat, add the ones you like to a shortlist.')));
 const pg=$('lib-places');pg.replaceChildren();const disc=libraryDiscoveries(),found=disc.shown,pageOf=window.OriviaDiscoveries.page(found,discoveryShown);
 for(const x of pageOf.items){const card=el('article','lib-short');const title=el('strong','',(x.favourite?'♥ ':'')+x.name);title.dir='auto';
  card.append(title,el('p','tiny',[x.detail,uiText(x.kind==='place'?'Place':'Service'),uiText('from')+' '+(x.chatTitle||uiText('Chat'))].filter(Boolean).join(' · ')));
  const row=el('div','attach-row');const site=el('a','btn quiet small',uiText('Source')+' · '+x.src.host);site.href=x.src.url;site.target='_blank';site.rel='noopener noreferrer';
  row.append(attachButton('Open chat',()=>openChat(x.chatId)),site);
  const rm=attachButton('Remove from Library',()=>{if(rm.dataset.sure!=='1'){rm.dataset.sure='1';rm.textContent=uiText('Tap again to remove');return}setDiscoveryHidden(x.key,true)});row.append(rm);
  card.append(row);pg.append(libItem(card,'places',x.name+' '+x.detail+' '+x.src.host))}
 if(pageOf.more){const more=attachButton(uiText('Show more')+' ('+pageOf.more+')',()=>{discoveryShown=pageOf.next;renderLibraryView()});more.classList.add('lib-more');pg.append(more)}
 if(!found.length)pg.append(el('p','tiny',uiText('Places and services Orivia recommends from official or organisation sources are kept here automatically.')));
 if(disc.hidden.length){const box=el('details','lib-removed');box.append(el('summary','tiny',uiText('Removed from Library')+' ('+disc.hidden.length+')'));
  for(const x of disc.hidden){const row=el('div','attach-row');row.append(el('span','tiny',x.name),attachButton('Restore',()=>setDiscoveryHidden(x.key,false)));box.append(row)}pg.append(box)}
 $('lib-count-places').textContent=found.length||'';
 $('lib-count-guides').textContent=items.length||'';$('lib-count-shortlists').textContent=lists.length||'';
 Promise.resolve(done).then(()=>{const n=document.querySelectorAll('#files-list .file-row').length;$('lib-count-files').textContent=n||'';$('lib-count-all').textContent=(n+items.length+lists.length+found.length)||'';applyLibraryFilter()});
 applyLibraryFilter();
}
function applyLibraryFilter(){
 const q=$('lib-search').value.trim().toLowerCase();let shown=0;
 for(const row of document.querySelectorAll('#files-list .file-row'))if(!row.dataset.libKind)libItem(row,'files',row.querySelector('strong')?.textContent);
 for(const [kind,id] of [['files','files-title'],['guides','lib-guides-group'],['places','lib-places-group'],['shortlists','lib-shortlists-group']]){
  const group=kind==='files'?$('files-title').closest('section'):$(id);const on=(libFilter==='all'||libFilter===kind)&&(kind!=='files'||filesServer);group.hidden=!on;
  let visible=0;for(const item of group.querySelectorAll('[data-lib-kind]')){const hit=!q||item.dataset.libText.includes(q);item.hidden=!hit;if(hit)visible++}
  if(on)shown+=visible;
 }
 $('lib-continue').hidden=!!q||!['all','guides'].includes(libFilter)||!$('lib-continue').children.length;
 $('lib-empty').hidden=!q||shown>0;
}
function mountLibrary(){if(mountLibrary.done)return;mountLibrary.done=true;
for(const b of document.querySelectorAll('.lib-tabs [role=tab]'))b.addEventListener('click',()=>{libFilter=b.dataset.lib;for(const x of document.querySelectorAll('.lib-tabs [role=tab]')){const on=x===b;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1}applyLibraryFilter()});
document.querySelector('.lib-tabs')?.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const t=[...document.querySelectorAll('.lib-tabs [role=tab]')],i=t.indexOf(document.activeElement);if(i<0)return;e.preventDefault();
 const rtl=document.documentElement.dir==='rtl',step=(e.key==='ArrowRight')!==rtl?1:-1,n=e.key==='Home'?0:e.key==='End'?t.length-1:(i+step+t.length)%t.length;t[n].focus();t[n].click()});
$('lib-search')?.addEventListener('input',applyLibraryFilter);
$('lib-clear')?.addEventListener('click',()=>{$('lib-search').value='';applyLibraryFilter();$('lib-search').focus()});
}
/* Files to Chat (step 7) with Ina's approved composer (22 Oct): + opens Camera, Photos, Files and Your files. Choosing
   only shows a removable preview above the message; nothing is sent. On Send, the file-reading notice appears (fuller the
   first time, DOCUMENT_CONSENT); only after "Use this in my chat" is the file sent to OpenAI: to count its size, then (if the budget allows) to read its text. That text
   stays with this chat (private account or this browser) and goes with each message here until the label's ✕. A reading
   belongs to the account and chat it started in: switching chat or account, New chat, signing out or clearing data
   cancels it, and a late result is dropped (Ina's review). The attachment shows inside the person's own message. */
var documentsServer=false,attachOp=null,attachGeneration=0,pendingAttachment=null,attachPreviewURL=null;
const attachmentPreviews=new Map(); // message attachment id → image URL for this page session only (nothing stored)
// From the Library: a saved file becomes this chat's pending attachment (preview only; nothing is sent).
if(typeof window!=='undefined'&&window.OriviaFiles)window.OriviaFiles.useInChat=async f=>{if(!attachAllowed()){$('status').textContent=uiText('Turn on the OpenAI research test in Settings to use documents in chat.');return}const g=attachGeneration;try{const blob=await window.OriviaFiles.blob(f.id);if(blob&&g===attachGeneration){tab('chat');setPendingAttachment(blob,f.name,f.id)}}catch(_){$('status').textContent=uiText('Couldn’t open that file.')}};
const DOCUMENT_CONSENT='orivia-document-consent-v3-2026-10-22',DOC_ACK_KEY='orivia-document-consent';
const DOC_SPACE=800000; // bytes of saved chats (with documents) we keep under the 1 MB account backup
/** Documents sent in this chat, newest first. */
function chatDocuments(){const c=activeChat();const list=c?(Array.isArray(c.documents)?c.documents:[]):pendingDocuments;return list.filter(d=>d&&typeof d.text==='string').slice().sort((a,b)=>(b.addedAt||0)-(a.addedAt||0))}
/** What goes with a message: the newest 3 documents, about 24,000 characters together. */
function documentsForMessage(){const out=[];let total=0;for(const d of chatDocuments().slice(0,3)){const room=24000-total;if(room<200)break;const text=d.text.slice(0,room);total+=text.length;out.push({name:d.name,kind:d.kind||'',text})}return out}
/** How much of this chat's documents a message can carry: shown in the person's message when something is left out. */
function documentContext(){const all=chatDocuments(),sent=documentsForMessage(),cut=sent.some((d,i)=>d.text.length<all[i].text.length);return {total:all.length,used:sent.length,cut}}
function attachAllowed(){return documentsServer&&!!pilotConsent()}
function docAcknowledged(){try{return (globalThis.OriviaAccountStorage?.storage||localStorage).getItem(DOC_ACK_KEY)===DOCUMENT_CONSENT}catch(_){return false}}
/** Cancel any reading in progress and forget it (its late result or error must not touch the screen or saved chats). */
function cancelAttach(){attachGeneration++;if(attachOp){try{attachOp.controller.abort()}catch(_){}attachOp=null}if(attachOp===null&&attachConfirm){const r=attachConfirm;attachConfirm=null;r(false)}closeAttach()}
var attachConfirm=null;
function renderDocContext(){const a=$('attach');if(a)a.hidden=!attachAllowed();const box=$('doc-context');if(box){box.hidden=true;box.replaceChildren()}}
function closeAttach(){const p=$('attach-panel');if(p){p.hidden=true;p.replaceChildren()}$('attach')?.setAttribute('aria-expanded','false')}
function attachButton(label,fn,cls='ask'){const b=el('button',cls,uiText(label));b.type='button';b.onclick=fn;return b}
/* ---- The pending attachment (shown above the message, removable; nothing sent) ---- */
function renderAttachmentPreview(){
 const box=$('compose-preview');if(!box)return;if(attachPreviewURL){URL.revokeObjectURL(attachPreviewURL);attachPreviewURL=null}
 const a=pendingAttachment;if(!a){box.hidden=true;box.replaceChildren();return}
 const card=el('div','compose-attachment'+(a.type!=='application/pdf'?' is-photo':''));
 if(a.type!=='application/pdf'){attachPreviewURL=URL.createObjectURL(a.blob);const img=document.createElement('img');img.src=attachPreviewURL;img.alt=uiText('Selected image')+': '+a.name;card.append(img)}
 else card.append(el('span','compose-file-icon','PDF'),el('strong','compose-file-name',a.name));
 const x=el('button','compose-remove','×');x.type='button';x.setAttribute('aria-label',uiText('Remove attachment'));x.onclick=()=>{pendingAttachment=null;renderAttachmentPreview();$('msg').focus()};
 card.append(x);box.replaceChildren(card);box.hidden=false;
}
function setPendingAttachment(blob,name,fileId){pendingAttachment={blob,name:String(name||'Document').slice(0,120),type:blob.type==='application/pdf'?'application/pdf':blob.type==='image/png'?'image/png':'image/jpeg',...(fileId?{fileId}:{}),read:false};closeAttach();renderAttachmentPreview();$('status').textContent=uiText('Attached. Nothing has been sent yet.');$('msg').focus()}
// + opens the device picker straight away; the phone itself offers camera, photo library and files. (Saved files are
// used from the Library with Use in Chat.)
function openAttach(){if(attachOp||attachConfirm)return;closeAttach();$('attach-file').click()}
async function attachFrom(input){const f=input.files&&input.files[0];input.value='';if(!f)return;const g=attachGeneration;
 try{const prepared=await window.OriviaFiles.prepare(f);if(g===attachGeneration)setPendingAttachment(prepared.blob,prepared.name)}
 catch(e){if(g===attachGeneration)$('status').textContent=uiText(e?.message==='file_too_large'?'That file is over 10 MB. Try a smaller one or a photo instead.':e?.message==='unsupported_type'?'Only PDF, JPEG and PNG files can be saved.':'This photo’s format can’t be opened here. Save it as a JPEG and try again.')}}
/** On Send: the reading notice (fuller the first time). Resolves true when the person accepts; nothing is read here. */
function confirmAttach(blob,name){
 return new Promise(resolve=>{
  const p=$('attach-panel');if(!p)return resolve(false);p.hidden=false;const first=!docAcknowledged();attachConfirm=resolve;
  const card=el('div','');card.append(el('strong','',name));
  if(first)card.append(el('p','tiny',uiText('Before your first document: when you tap Use this in my chat, Orivia sends this file to OpenAI to count its size and, if today’s budget allows, to read its text. Each new attempt sends it again. OpenAI doesn’t keep it for later use through Orivia, but may hold it for a limited time for abuse checks.')),
   el('p','tiny',uiText('The text Orivia reads becomes part of this conversation: it’s kept with the chat (in your private account if you’re signed in, otherwise in this browser). With each message here, Orivia sends the text of your 3 most recent documents in this chat (about 24,000 characters together), so you can ask follow-up questions. Deleting the chat removes it; a file saved in your Library is separate.')));
  card.append(el('p','tiny',uiText('Orivia can misread documents, so check important details against the original. It doesn’t check whether a document is genuine or valid.')));
  const done=v=>{if(attachConfirm===resolve){attachConfirm=null;closeAttach();resolve(v)}};
  const row=el('div','attach-row');row.append(attachButton(first?'I understand. Use this in my chat':'Use this in my chat',()=>{try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(DOC_ACK_KEY,DOCUMENT_CONSENT)}catch(_){}done(true)},'btn small'),attachButton('Cancel',()=>{done(false);$('status').textContent=uiText('Your draft is still here.')}));card.append(row);p.replaceChildren(card);
 });
}
async function readAttached(blob,name){
 if(attachOp)return false;const consent=pilotConsent();if(!consent)return false;
 // What this reading belongs to: the account (or guest), this exact chat, and this generation of the screen.
 const op={gen:attachGeneration,epoch:globalThis.OriviaAccounts?.epoch||'guest',chatId:store.active,newChat:!store.active,controller:new AbortController()};attachOp=op;
 const live=()=>attachOp===op&&op.gen===attachGeneration&&(globalThis.OriviaAccounts?.epoch||'guest')===op.epoch&&store.active===op.chatId;
 try{const r=await fetch('/v1/document',{method:'POST',signal:op.controller.signal,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':blob.type||'application/octet-stream','X-File-Name':encodeURIComponent(name),'X-Orivia-Consent':consent.openai,'X-Orivia-Document-Consent':DOCUMENT_CONSENT},body:blob});
  let d={};try{d=await r.json()}catch(_){}
  if(!live())return false;
  if(!r.ok||!d.document||typeof d.document.text!=='string'){const why=d&&d.error;
   return (uiText(why==='too_many_pages'?'Orivia can read up to 10 pages. Try a shorter document, or a photo of the page you need.':why==='pdf_unreadable'?'Orivia can’t safely count the pages in this PDF (it may be protected or unusual). Take photos of the pages you need instead.':why==='unreadable'?'Orivia couldn’t read any text in that file. Try a clearer photo.':why==='budget_limit'||why==='daily_limit'?'Orivia has read as many documents as it can today. Try again tomorrow.':why==='human_check'?'Please confirm you’re human again, then try once more.':'Orivia couldn’t read that document. Please try again.'))}
  const doc={id:newId(),name:String(d.document.name||name).slice(0,120),kind:String(d.document.kind||'').slice(0,80),text:d.document.text.slice(0,12000),addedAt:Date.now(),...(d.document.truncated?{partial:true}:{})};
  // Never remove another chat's document to make room: if saved chats would outgrow the account backup, say so instead.
  const c=op.newChat?null:store.chats.find(x=>x.id===op.chatId);if(!op.newChat&&!c)return false;
  const size=new TextEncoder().encode(JSON.stringify(store.chats)).length+new TextEncoder().encode(JSON.stringify(doc)).length;
  if(size>DOC_SPACE)return uiText('Your saved chats are too large to keep another document. Delete chats you no longer need, then try again. Nothing was changed.');
  if(c){c.documents=[...(Array.isArray(c.documents)?c.documents:[]),doc];persist()}else pendingDocuments=[...pendingDocuments,doc];
  attachOp=null;renderDocContext();
  return true;
 }catch(_){return live()?uiText('Orivia couldn’t read that document. Please try again.'):false}
 finally{if(attachOp===op)attachOp=null}
}
/** Send with an attachment: read it first (once per draft), keep the draft and file if anything is declined or fails. */
async function readPendingAttachment(){
 const a=pendingAttachment;if(!a)return true;if(a.read)return true;if(!attachAllowed()||attachConfirm||attachOp)return false;
 const ok=await confirmAttach(a.blob,a.name);return ok&&pendingAttachment===a;
}
var pendingDocuments=[]; // documents read before a new chat's first message is saved
/* University context (21 Oct): the guide a person chose with 'Ask Orivia about this'. Shown as a removable label; sent as ids
   only; the server re-reads it for an active member on every message. A personal conversation never carries it. */
var pendingOrgContext=null; // var: chat restore may run before this line
function currentOrgContext(){const c=activeChat();return c?c.orgContext||null:pendingOrgContext}
function clearOrgContext(note){const c=activeChat();if(c&&c.orgContext){delete c.orgContext;persist()}pendingOrgContext=null;renderOrgContext();if(note)$('status').textContent=note}
function renderOrgContext(){
 try{renderDocContext()}catch(_){}
 const box=$('org-context');if(!box)return;const o=currentOrgContext();if(!o){box.hidden=true;box.replaceChildren();return}
 const label=el('span','org-context-text','Using '+(o.orgName||'your university')+'’s “'+(o.title||'guide')+'”');
 const x=el('button','org-context-clear','✕');x.type='button';x.setAttribute('aria-label','Stop using this university guide');x.onclick=()=>clearOrgContext('');
 const personal=el('button','ask','Start a personal conversation');personal.type='button';personal.onclick=()=>newChat(null);
 box.replaceChildren(label,x,personal);box.hidden=false;
}
const ORG_AI_NOTICE='orivia-org-ai-notice-v1';
window.OriviaChat={aiNoticeSeen(){try{return (globalThis.OriviaAccountStorage?.storage||localStorage).getItem(ORG_AI_NOTICE)==='yes'}catch(_){return false}},markAiNotice(){try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(ORG_AI_NOTICE,'yes')}catch(_){}},useOrgContext(o){if(!o||!/^[A-Za-z0-9-]{1,64}$/.test(String(o.org))||!/^[A-Za-z0-9-]{1,64}$/.test(String(o.content)))return;
 newChat({org:String(o.org),content:String(o.content),title:String(o.title||'').slice(0,150),orgName:String(o.orgName||'').slice(0,80)});
 const m=$('msg');if(m&&!m.value)m.value='Help me with “'+String(o.title||'this guide').slice(0,120)+'”: what do I need to do?';m?.focus()}};
function whenShort(t){const d=new Date(t),now=new Date();const same=d.toDateString()===now.toDateString();const y=new Date(now);y.setDate(now.getDate()-1);
 return same?d.toLocaleTimeString(uiLanguage(),{hour:'numeric',minute:'2-digit'}):d.toDateString()===y.toDateString()?'Yesterday':d.toLocaleDateString(uiLanguage(),{day:'numeric',month:'short'})}
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
  const ok=el('button','btn small',uiText('Save'));ok.type='submit';f.append(inp,ok,button('Cancel','btn text small',()=>renderChats()));
  f.onsubmit=e=>{e.preventDefault();const v=inp.value.replace(/\s+/g,' ').trim();if(v){c.title=v.slice(0,80);c.titled=true;persist()}renderChats()};
  row.replaceChildren(f);inp.focus();inp.select();
 }));
 menu.append(button(c.pinned?'Unpin':'Pin','btn quiet small',()=>{c.pinned=!c.pinned;persist();renderChats()}));
 menu.append(button(c.archived?'Unarchive':'Archive','btn quiet small',()=>{c.archived=!c.archived;if(c.archived&&c.id===store.active){store.active=null;turns=[];clearChatCards();draw()}persist();renderChats()}));
 const del=button('Delete','btn text small danger',()=>{
  if(del.dataset.sure!=='1'){del.dataset.sure='1';del.textContent=uiText('Tap again to delete this chat for good');return}
  store.chats=store.chats.filter(x=>x!==c);if(c.id===store.active){store.active=null;turns=[];clearChatCards();draw()}persist();renderChats();
 });
 menu.append(del);row.append(menu);return row;
}
function renderChats(){
 const list=$('chats-list'),arch=$('archived-list');if(!list)return;
 const by=(a,b)=>b.updated-a.updated;
 const query=String($('chat-search')?.value||'').trim().toLocaleLowerCase();
 const matches=c=>!query||(c.title+' '+c.turns.map(t=>t.content).join(' ')).toLocaleLowerCase().includes(query);
 const live=store.chats.filter(c=>!c.archived&&c.turns.length&&matches(c)),pinned=live.filter(c=>c.pinned).sort(by),recent=live.filter(c=>!c.pinned).sort(by),archived=store.chats.filter(c=>c.archived&&c.turns.length&&matches(c)).sort(by);
 list.replaceChildren();
 if(pinned.length){list.append(el('p','chat-group',uiText('Pinned')));for(const c of pinned)list.append(chatRow(c))}
 if(recent.length){list.append(el('p','chat-group',uiText('Recent')));for(const c of recent)list.append(chatRow(c))}
 if(!live.length)list.append(el('p','notice',uiText(query?'No chats match your search.':'No saved chats yet. Start one and it will appear here.')));
 arch.replaceChildren();for(const c of archived)arch.append(chatRow(c));
 if(!archived.length)arch.append(el('p','tiny',uiText('Archived chats are kept here until you delete them.')));
 $('archived-count').textContent=String(archived.length);
}
let chatsReturnFocus=null;
function openChats(){chatsReturnFocus=document.activeElement;renderChats();$('chats-drawer').hidden=false;$('new-chat').focus()}
function closeChats(){if($('chats-drawer').hidden)return;$('chats-drawer').hidden=true;(chatsReturnFocus||$('open-chats')).focus?.()}
$('open-chats').onclick=openChats;$('storage-manage').onclick=openChats;$('close-chats').onclick=closeChats;$('new-chat').onclick=()=>newChat(null); // never pass the click event in as a university guide
$('chats-drawer').addEventListener('click',e=>{if(e.target.id==='chats-drawer')closeChats()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('chats-drawer').hidden)closeChats()});

// Desktop uses the same chat records and controls as the phone drawer, not a second history.
if($('chat-search'))$('chat-search').oninput=()=>renderChats();
if($('sidebar-settings'))$('sidebar-settings').onclick=()=>{closeChats();tab('settings')};
if($('sidebar-account'))$('sidebar-account').onclick=()=>{closeChats();globalThis.OriviaAccounts?.open?.()};
function syncSidebarSemantics(){const a=$('chats-drawer').querySelector('aside'),desktop=window.matchMedia('(min-width:1000px)').matches;if(!a)return;a.setAttribute('role',desktop?'navigation':'dialog');if(desktop)a.removeAttribute('aria-modal');else a.setAttribute('aria-modal','true')}
if(window.matchMedia&&$('chats-drawer')?.querySelector){syncSidebarSemantics();window.matchMedia('(min-width:1000px)').addEventListener?.('change',syncSidebarSemantics)}

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
/* List helpers: a count with the right word, a labelled summary (never a bare number), a source tag, and the details panel. */
function kindPlural(orgs){const k=new Set(orgs.map(o=>o.kind));const one=k.size===1?[...k][0]:'';
 const w={school:['school','schools'],bank:['bank','banks'],clinic:['clinic','clinics'],office:['office','offices']}[one]||['place','places'];return orgs.length===1?w[0]:w[1]}
function summaryLine(o){
 // Labelled facts ("Fees from AED 73,595"); a value that names a place or type reads fine alone. At most two, kept short.
 const bare=/^(area|location|address|curriculum|type|district|neighbourhood|emirate|city)$/i;
 return o.facts.slice(0,2).map(f=>bare.test(f.label)||/[a-z]{3,}/i.test(f.value)&&f.value.length>18?f.value:f.label+' '+f.value).join(' · ').slice(0,110);
}
function srcTag(src){const k={'Official source':'official','Organisation source':'org','Listing site':'listing','People’s experiences':'people'}[src.kind]||'org';
 const t=el('span','pl-src '+k,{official:'Official',org:'Their website',listing:'Listing site',people:'Experiences'}[k]+' · '+src.host.replace(/^www\./,''));t.title=src.kind;return t}
function placeDetails(o,ui,repaint){
 const box=el('div','pl-details');
 if(o.facts.length){const dl=el('dl','pl-facts');for(const f of o.facts){dl.append(el('dt','',f.label),el('dd','',f.value))}box.append(dl)}
 const acts=[];
 if(o.contacts.phone)acts.push(actLink('Call',telHref(o.contacts.phone.value),'phone'));
 if(o.contacts.email)acts.push(actLink('Email',mailHref(o),'mail'));
 acts.push(o.contacts.website?actLink('Website',o.contacts.website.url,'web'):actLink('Source page',o.src.url,'doc'));
 if(o.contacts.directions)acts.push(actLink('Directions',o.contacts.directions.url,'go'));
 const grid=el('div','org-acts');grid.style.setProperty('--n',String(Math.min(acts.length,4)));grid.append(...acts);box.append(grid);
 if(ui.reach===o.id)box.append(reachOut(o,o.contacts.email&&!o.contacts.phone?'email':'phone',()=>{ui.reach=null;repaint()}));
 else box.append(button(o.contacts.phone||o.contacts.email?'Help me with what to say':'What should I ask?','btn text small',()=>{ui.reach=o.id;repaint()}));
 box.append(orgEvidence(o));return box;
}
function factLine(o){const pick=k=>o.facts.find(f=>f.key===k)?.value;return [pick('curriculum'),pick('grades'),pick('area'),pick('rating')].filter(Boolean).join(' · ')||o.facts.slice(0,3).map(f=>f.value).join(' · ')}
function orgEvidence(o){
 const d=document.createElement('details');d.className='org-evidence';d.append(el('summary','',uiText('Sources and evidence')));
 const items=[...o.facts.map(f=>[f.label,f.value,f]),...['phone','email','website','directions'].filter(k=>o.contacts[k]).map(k=>[{phone:'Phone',email:'Email',website:'Website',directions:'Location'}[k],o.contacts[k].value||o.contacts[k].label||o.contacts[k].url,o.contacts[k]])];
 const ul=el('ul','org-quotes');
 for(const [label,value,x] of items){const li=el('li');li.append(el('span','q-label',label+': '+value),el('blockquote','','“'+x.quote+'”'));const a=el('a','src-mini',x.src.title+' · '+x.src.host+' ↗');a.href=x.src.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);ul.append(li)}
 d.append(ul,el('p','tiny',uiText('Quotes are copied from the page Orivia opened. They support each detail but don’t guarantee it applies to you.')));
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
   panel.append(el('p','tiny',uiText('Orivia drafts it. You check it and send it from your own email app.')));
   const pre=el('div','org-draft');pre.append(el('div','org-subject','Subject: '+d.subject),el('div','org-body',d.body));panel.append(pre);
   const row=el('div','org-row');row.append(actLink('Open draft in my email app',mailHref(o),'mail','btn org-primary'),button('Copy','btn quiet small',async e=>{try{await navigator.clipboard.writeText('Subject: '+d.subject+'\n\n'+d.body);e.target.textContent=uiText('Copied')}catch(_){e.target.textContent=uiText('Couldn’t copy')}}));panel.append(row);
  }else{
   const ol=el('ol','org-script');for(const line of phoneScript(o))ol.append(el('li','','“'+line+'”'));panel.append(ol);
   if(o.contacts.phone){const row=el('div','org-row');row.append(actLink('Call '+o.contacts.phone.value,telHref(o.contacts.phone.value),'phone','btn org-primary'));panel.append(row)}
   else panel.append(el('p','tiny',uiText('I couldn’t confirm a phone number from the source, so there’s no call button.')));
  }
 };
 for(const [m,label] of modes){const b=button(label,'org-tab',()=>show(m));b.dataset.mode=m;b.setAttribute('role','tab');tabs.append(b)}
 box.append(tabs,panel,button('Close','btn text small',onClose));show(modes.some(x=>x[0]===mode)?mode:modes[0][0]);
 return box;
}
// C: help deciding. Offers only actions the data supports.
function chooseNext(o,open){
 const box=el('div','org-choose');box.append(el('p','org-q',uiText('What would you like to do next?')),el('p','tiny',uiText('Pick one and I’ll help you through it.')));
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
 if(o.fixture)head.append(el('span','org-fixture',uiText('Sample data')));
 const h=el('h3','org-name',o.name);card.append(head,h);
 // Every chip says what it is unless the value already does ("British curriculum" vs "Fees from: AED 73,595").
 if(o.facts.length){const chips=el('div','org-chips');for(const f of o.facts){const plain=/^(area|location|address|curriculum|type|district|neighbourhood|emirate|city)$/i.test(f.label)||(/[a-z]{3,}/i.test(f.value)&&f.value.length>18);chips.append(el('span','org-chip'+(f.key==='rating'?' good':''),plain?f.value:f.label+': '+f.value))}card.append(chips)}
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
  // D (several): a compact numbered list. Each row: name, a labelled one-line summary, where it comes from, and only the
  // quick actions its sources support. Tapping a row opens its details in place, so places can be compared without leaving.
  const head=el('div','pl-head');head.append(el('strong','',orgs.length+' '+kindPlural(orgs)),button('Hide','btn text small',dismiss));wrap.append(head);
  const list=el('ol','pl-list');
  orgs.forEach((o,i)=>{
   const open=ui.open===o.id,on=shortlist.has(o.id);
   const li=el('li','pl-item'+(open?' open':'')+(on?' starred':''));const row=el('div','pl-row');
   const main=button('','pl-main',()=>{ui.open=open?null:o.id;ui.reach=null;paint()});main.setAttribute('aria-expanded',String(open));
   const text=el('span','pl-text');text.append(el('strong','pl-name',o.name));
   const sum=summaryLine(o);if(sum)text.append(el('span','pl-sub',sum));
   const tags=el('span','pl-tags');tags.append(srcTag(o.src));if(o.fixture)tags.append(el('span','org-fixture',uiText('Sample data')));text.append(tags);
   main.append(el('span','pl-num',String(i+1)),text);
   const quick=el('div','pl-quick');
   if(o.contacts.phone){const c=el('a','pl-icon');c.href=telHref(o.contacts.phone.value);c.setAttribute('aria-label','Call '+o.name);c.append(orgIcon('phone'));quick.append(c)}
   const star=button('','pl-icon pl-star'+(on?' on':''),()=>{on?shortlist.delete(o.id):shortlist.add(o.id);t.meta.shortlist=[...shortlist];saveMeta();paint()});
   star.append(el('span','',on?'★':'☆'));star.setAttribute('aria-pressed',String(on));star.setAttribute('aria-label',(on?'Remove from shortlist: ':'Add to shortlist: ')+o.name);
   quick.append(star);row.append(main,quick);li.append(row);
   if(open)li.append(placeDetails(o,ui,paint));
   list.append(li);
  });
  wrap.append(list);
  // The shortlist bar appears only once something is starred.
  if(shortlist.size){const bar=el('div','pl-bar');bar.append(el('span','','★ '+shortlist.size+' shortlisted'),button('Help me contact them','btn org-primary',()=>{ui.pager=orgs.filter(o=>shortlist.has(o.id)).map(o=>o.id);ui.sel=ui.pager[0];ui.view='choose';paint()}));wrap.append(bar)}
 };
 paint();return wrap;
}

/* ===== Show someone and destination handoff cards ===== */
const HANDOFF_LANGUAGES={en:'English',ar:'العربية',fr:'Français',fil:'Filipino',hi:'हिन्दी',ur:'اردو',zh:'中文',bn:'বাংলা',ml:'മലയാളം',ru:'Русский'};
function safeShowMessage(value){
 if(!value?.texts||typeof value.texts!=='object')return null;
 const texts={};for(const code of Object.keys(HANDOFF_LANGUAGES)){const t=value.texts[code];if(typeof t==='string'&&t.trim()&&t.length<=1200)texts[code]=t.trim()}
 return texts.en&&texts.ar?{texts}:null;
}
function safeDestinations(value,sources){
 if(!Array.isArray(value))return [];
 return value.slice(0,3).flatMap(d=>{
  const proof=sourcedItem(d,sources);if(!proof||!['official','institution','organisation','operator'].includes(proof.src.category))return [];
  const name=typeof d.name==='string'?d.name.trim().slice(0,120):'',address=typeof d.address==='string'?d.address.trim().slice(0,240):'';
  const details=(Array.isArray(d.details)?d.details:[]).slice(0,3).filter(x=>typeof x?.label==='string'&&typeof x.value==='string'&&typeof x.quote==='string'&&x.quote.trim()).map(x=>({label:x.label.slice(0,30),value:x.value.slice(0,100),quote:x.quote.slice(0,120)}));
  const description=typeof d.description==='string'?d.description.slice(0,220):'';
  const image=typeof d.image?.data==='string'&&d.image.data.length<=160100&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(d.image.data)&&d.image.sourceUrl===proof.src.url?{data:d.image.data,sourceUrl:d.image.sourceUrl}:null;
  const route=d.route&&typeof d.route.origin==='string'&&['driving','transit','walking','bicycling',null].includes(d.route.mode)?{origin:d.route.origin.slice(0,180),mode:d.route.mode}:null;
  return name?[{name,address,sourceId:d.sourceId,quote:proof.quote,description,details,image,route,src:proof.src}]:[];
 });
}
function mapSearchLinks(destination){
 const query=destination.name+(destination.address?', '+destination.address:'');
 if(destination.route){
  const r=destination.route,google=new URLSearchParams({api:'1',destination:query}),apple=new URLSearchParams({daddr:query});
  if(r.origin){google.set('origin',r.origin);apple.set('saddr',r.origin)}
  if(r.mode){google.set('travelmode',r.mode);const flag={driving:'d',transit:'r',walking:'w'}[r.mode];if(flag)apple.set('dirflg',flag)}
  return {google:'https://www.google.com/maps/dir/?'+google,apple:r.mode==='bicycling'?'':'https://maps.apple.com/?'+apple};
 }
 return {google:'https://www.google.com/maps/search/?'+new URLSearchParams({api:'1',query}),apple:'https://maps.apple.com/?'+new URLSearchParams({q:query})};
}
function placeIdentity(d){return d.sourceId+'|'+d.name}
function destinationCards(items,sources,turn=null){
 const places=safeDestinations(items,sources);if(!places.length)return null;
 const wrap=el('div','destination-cards');
 for(const d of places){
  const card=el('section','place-card'),links=mapSearchLinks(d),hero=el('div','place-hero');
  const art=el('div','place-art');art.setAttribute('aria-hidden','true');art.append(icon('M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12ZM9 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0'));hero.append(art);
  if(d.image){const img=document.createElement('img');img.src=d.image.data;img.alt=uiText('Preview from the place’s website');img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>img.remove();hero.append(img)}
  const badge=el('span','place-badge',uiText(d.src.category==='official'?'Official source':'Organisation source'));hero.append(badge);
  const body=el('div','place-body');body.append(el('small','place-eyebrow',uiText('Your destination')),el('h3','place-name',d.name));
  if(d.address){const address=el('p','place-address',d.address);address.dir='auto';body.append(address)}
  if(d.route?.origin)body.append(el('p','place-address',uiText('From')+': '+d.route.origin));
  if(d.route?.mode)body.append(el('p','tiny',uiText({driving:'Driving',transit:'Public transport',walking:'Walking',bicycling:'Cycling'}[d.route.mode])));
  if(d.description)body.append(el('p','place-description',d.description));
  if(d.details.length){const tags=el('div','place-facts');for(const detail of d.details){const tag=el('div','place-fact');tag.append(el('small','',uiText(detail.label)),el('strong','',detail.value));tags.append(tag)}body.append(tags)}
  const actions=el('div','place-actions'),maps=el('div','place-map-choice');maps.hidden=true;maps.setAttribute('role','group');maps.setAttribute('aria-label',uiText('Choose your map app'));
  const go=button('Take me there →','btn place-go',()=>{maps.hidden=!maps.hidden;go.setAttribute('aria-expanded',String(!maps.hidden))});go.setAttribute('aria-expanded','false');
  maps.append(el('p','tiny',uiText('Choose your map app')));
  for(const [label,url]of [['Google Maps',links.google],['Apple Maps',links.apple]]){if(!url)continue;const a=el('a','btn quiet small',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';maps.append(a)}
  const saved=()=>Array.isArray(turn?.meta?.savedPlaces)&&turn.meta.savedPlaces.includes(placeIdentity(d));
  const pin=button(saved()?'♥ Saved':'♡ Save','btn place-save',()=>{
   if(!turn)return;turn.meta=turn.meta||{};const ids=new Set(Array.isArray(turn.meta.savedPlaces)?turn.meta.savedPlaces:[]);ids.has(placeIdentity(d))?ids.delete(placeIdentity(d)):ids.add(placeIdentity(d));turn.meta.savedPlaces=[...ids];
   const ok=save();pin.textContent=uiText(ok?(saved()?'♥ Saved':'♡ Save'):'Not saved yet');pin.setAttribute('aria-pressed',String(saved()));renderSavedPlaces();
  });pin.setAttribute('aria-pressed',String(saved()));pin.disabled=!turn;pin.title=uiText('Find saved places in My Life on this device.');
  actions.append(go,pin);body.append(actions,maps);
  const note=el('p','place-map-note',uiText('Check the place and entrance in Maps before setting off.'));body.append(note);
  const evidence=el('details','place-evidence');evidence.append(el('summary','',uiText('Sources and details')));
  const source=el('a','destination-source',uiText('Source')+' · '+d.src.host);source.href=d.src.url;source.target='_blank';source.rel='noopener noreferrer';evidence.append(source,el('blockquote','',d.quote));
  for(const detail of d.details)evidence.append(el('p','tiny',uiText(detail.label)+': '+detail.quote));
  if(d.image)evidence.append(el('p','tiny',uiText('Image preview supplied by the source page.')));
  body.append(evidence);card.append(hero,body);wrap.append(card);
 }
 return wrap;
}
function renderSavedPlaces(){
 const root=$('saved-places');if(!root)return;root.replaceChildren();const found=[];
 for(const chat of store.chats)for(const t of chat.turns){if(!Array.isArray(t.meta?.savedPlaces))continue;
  const places=safeDestinations(t.meta.destinations,safeSources(t.meta.sources));for(const d of places)if(t.meta.savedPlaces.includes(placeIdentity(d)))found.push({d,chat});
 }
 if(!found.length){root.append(el('p','tiny',uiText('Places you save in chat will appear here.')));return}
 for(const {d,chat}of found){const b=button('','link-card',()=>openChat(chat.id));const label=el('span');label.append(el('strong','',d.name),el('small','tiny',d.address||chat.title));b.append(label,el('span','','›'));root.append(b)}
}
let handoffDialog=null;
function closeHandoff(){if(handoffDialog?.open)handoffDialog.close()}
function showSomeoneBox(value){
 const data=safeShowMessage(value);if(!data)return null;
 const box=el('section','show-someone-card'),previewLanguage=data.texts[uiLanguage()]?uiLanguage():'en';
 box.append(el('strong','',uiText('A message to show someone')),el('p','show-someone-preview',data.texts[previewLanguage]),el('p','tiny',uiText('Review the message before showing it. Nothing is sent automatically.')),button('Show someone','btn',event=>openHandoff(data,event.currentTarget)));
 return box;
}
function openHandoff(value,opener){
 const data=safeShowMessage(value);if(!data)return;
 closeHandoff();stopSpeaking();stopDictation(true);
 const dialog=document.createElement('dialog');dialog.className='handoff-dialog';dialog.setAttribute('aria-labelledby','handoff-heading');handoffDialog=dialog;
 const shell=el('div','handoff-shell'),top=el('div','handoff-top'),heading=el('h2','','');heading.id='handoff-heading';heading.textContent=uiText('Show someone');
 const close=button('Close','btn quiet',()=>dialog.close());top.append(heading,close);
 const languages=el('div','handoff-languages');languages.setAttribute('role','group');languages.setAttribute('aria-label',uiText('Message language'));
 const message=el('p','handoff-message'),feedback=el('p','tiny');feedback.setAttribute('role','status');
 const voice=button('▶ Listen','btn handoff-listen',()=>listen(message.textContent,voice,{language:message.lang,feedback}));voice.setAttribute('aria-pressed','false');
 voice.disabled=!canSpeak;
 const codes=[...new Set([uiLanguage(),'en','ar'])].filter(code=>data.texts[code]);const tabs=[];
 const select=code=>{stopSpeaking();message.textContent=data.texts[code];message.lang=code;message.dir=['ar','ur'].includes(code)?'rtl':'ltr';feedback.textContent=canSpeak?'':uiText('Listen is unavailable in this browser.');for(const [id,b]of tabs)b.setAttribute('aria-pressed',String(id===code))};
 for(const code of codes){const b=button(HANDOFF_LANGUAGES[code],'btn quiet small',()=>select(code));b.lang=code;tabs.push([code,b]);languages.append(b)}
 shell.append(top,languages,el('p','tiny',uiText('Only this message will be shown. Choose a language, then tap Listen if needed.')),message,feedback,voice);dialog.append(shell);document.body.append(dialog);
 const restoreOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 dialog.addEventListener('close',()=>{stopSpeaking();document.body.style.overflow=restoreOverflow;dialog.remove();if(handoffDialog===dialog)handoffDialog=null;if(opener?.isConnected)opener.focus()},{once:true});
 select(codes[0]);dialog.showModal();close.focus();
}
/* ===== End handoff cards ===== */

// Keep the full answer and source cards on screen, but respect the chat API's
// per-message limit and never send browser-only evidence metadata back.
function chatMessages(turns){return turns.slice(-12).map(({role,content,meta})=>({role,content:(content.trim()?content:'Please help me with the document I shared ('+String(meta?.attachment?.name||'document').slice(0,80)+').').slice(0,1200)}))} // only the active chat, latest 12 messages
// Animate only the newly delivered reply. History redraws stay still and keep the reader's place.
let renderedChat;
function nearChatBottom(sc){return sc.scrollHeight-sc.clientHeight-sc.scrollTop<96}
function draw({newReply=null,scroll=false}={}){
 window.OriviaChatMotion?.finishAll();
 const sc=$('chat-scroll'),previousTop=sc.scrollTop;
 const follow=scroll||renderedChat!==store.active||nearChatBottom(sc);
 renderedChat=store.active;
 const el=$('history');el.replaceChildren();
 for(const t of turns){const p=document.createElement('div');p.className='bubble '+(t.role==='user'?'user':'assistant')+(t===newReply?' reply-arriving':'');const b=document.createElement('b');b.textContent=uiText(t.role==='user'?'You':'Orivia');b.className='sr-only';const txt=document.createElement('span');txt.className='reply-text';
  const allSrcs=t.role==='assistant'?safeSources(t.meta&&t.meta.sources):[],docSrcs=allSrcs.filter(s=>s.category==='document'),srcs=allSrcs.filter(s=>s.category!=='document');
  if(srcs.length)txt.append(...citedText(t.content,srcs));else txt.textContent=t.content;
  if(t.role==='user'&&t.meta?.documentContext){const dc=t.meta.documentContext,n=document.createElement('p');n.className='doc-note';n.textContent=dc.used<dc.total?uiText('Orivia used your most recent documents in this chat:')+' '+dc.used+' '+uiText('of')+' '+dc.total+'.':uiText('Orivia used the first part of your documents in this chat (they’re long).');p.append(n)}p.append(b,txt);
  // (draw() has its own local `el`, so the chip is built directly.)
  if(t.role==='user'&&t.meta?.attachment&&typeof t.meta.attachment.name==='string'){const at=t.meta.attachment,card=document.createElement('div');card.className='message-attachment';
   const url=at.type!=='application/pdf'&&(attachmentPreviews.get(at.id)||(at.fileId&&globalThis.OriviaAccounts?.user?'/api/account/files/'+encodeURIComponent(at.fileId):''));
   const fileCard=()=>{card.className='message-attachment is-file';const icon=document.createElement('span');icon.className='compose-file-icon';icon.textContent=at.type==='application/pdf'?'PDF':uiText('Photo');const nm=document.createElement('strong');nm.className='compose-file-name';nm.textContent=at.name;card.replaceChildren(icon,nm)};
   if(url){card.className='message-attachment is-photo';const img=document.createElement('img');img.src=url;img.alt=uiText('Your photo')+': '+at.name;img.loading='lazy';img.onerror=fileCard;card.append(img)}else fileCard();
   p.prepend(card);if(at.partial){const n=document.createElement('p');n.className='doc-note';n.textContent=uiText('Orivia could read only the first part of this document (it’s long).');card.after(n)}}
  const cards=t.role==='assistant'&&t.meta&&t.meta.organisations?orgCards(t,srcs):null;
  if(cards){p.append(cards);p.classList.add('has-cards')}
  if(t.role==='assistant'&&t.meta&&safeDraft(t.meta.draft))p.append(draftBox(t));
  if(t.role==='assistant'&&t.meta?.showMessage){const h=showSomeoneBox(t.meta.showMessage);if(h)p.append(h)}
  if(t.role==='assistant'&&t.meta?.destinations){const dc=destinationCards(t.meta.destinations,srcs,t);if(dc)p.append(dc)}
  if(t.role==='assistant'&&t.meta&&t.meta.reminder&&typeof t.meta.reminder.id==='string')p.append(reminderBox(t));
  if(t.role==='assistant'&&t.meta?.calendarChange){const cb=calendarChangeBox(t);if(cb)p.append(cb)}
  // The person's own document: a plain note, not a web source with a link or a circle.
  if(docSrcs.length){const note=document.createElement('p');note.className='doc-note';note.textContent=uiText('Based on your document:')+' '+String(docSrcs[0].title||'').replace(/^Your document:\s*/,'');p.append(note)}
  if(t.role==='assistant'&&(srcs.length||(t.meta&&t.meta.research&&!docSrcs.length))){
   const rb=researchBlock(srcs,t.meta.research);
   p.append(rb);
  }
  if(t.role==='assistant'){
   const actions=document.createElement('div');actions.className='reply-actions';
   const copy=document.createElement('button');copy.type='button';copy.textContent=uiText('Copy');copy.setAttribute('aria-label',uiText('Copy reply'));copy.onclick=async()=>{try{await navigator.clipboard.writeText(t.content);copy.textContent=uiText('Copied')}catch(_){copy.textContent=uiText('Could not copy')}};actions.append(copy);
   if('speechSynthesis' in window){const lb=document.createElement('button');lb.type='button';lb.className='listen-btn';lb.textContent=uiText('▶ Listen');lb.setAttribute('aria-pressed','false');lb.setAttribute('aria-label',uiText('Listen to this reply'));lb.onclick=()=>listen(spokenText(t.content),lb,{language:t.meta?.lang||null});actions.append(lb)}
   const more=document.createElement('details'),summary=document.createElement('summary');summary.textContent='⋯';summary.setAttribute('aria-label',uiText('More options'));more.append(summary);
   const select=document.createElement('button');select.type='button';select.textContent=uiText('Select reply');select.onclick=()=>{window.OriviaChatMotion?.finishAll();const r=document.createRange();r.selectNodeContents(txt);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(r);more.open=false};more.append(select);
   feedbackControls(t,store.active+':'+turns.indexOf(t),actions,more,p);actions.append(more);p.append(actions);
  }
  el.append(p);
  if(t===newReply&&window.OriviaChatMotion){const extras=[...p.children].filter(n=>n!==txt&&n!==b);extras.forEach(n=>n.classList.add('reply-pending-extra'));txt.classList.add('reply-revealing');
   window.OriviaChatMotion.reveal(txt,{text:txt.textContent,onDone:()=>{extras.forEach(n=>n.classList.remove('reply-pending-extra'));txt.classList.remove('reply-revealing')},follow:()=>{if(follow&&nearChatBottom(sc))sc.scrollTop=sc.scrollHeight}})}
 }
 $('empty').hidden=turns.length>0;
 sc.scrollTop=follow?sc.scrollHeight:previousTop;
}
/* Reply feedback (ORI-CHAT-007/008): optional thumbs and Report a problem. Signed-in only, sent to the Orivia team's
   review queue; guests are told to sign in, never shown a false success. The reply text goes only if ticked. */
function feedbackApi(path,method,body){const u=window.OriviaAccounts?.user;if(!u)return Promise.reject(Object.assign(Error('sign_in'),{code:'sign_in'}));
 return fetch('/api/account/feedback/'+path,{method,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(12000),headers:{'X-Orivia-Account':u.id,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(Error(d.error||'failed'),{code:d.error||'failed'});return d})}
function feedbackError(e){return e&&e.code==='sign_in'?uiText('Sign in to send feedback to the Orivia team.'):uiText('Couldn’t send. Nothing was saved. Try again.')}
function feedbackControls(t,replyId,actions,more,p){
 const status=document.createElement('span');status.className='fb-status tiny';status.setAttribute('role','status');
 const thumb=(value,label,glyph)=>{const btn=document.createElement('button');btn.type='button';btn.className='fb-thumb';btn.textContent=glyph;btn.setAttribute('aria-label',uiText(label));btn.setAttribute('aria-pressed',String(t.meta?.rating===value));
  btn.onclick=async()=>{const next=t.meta?.rating===value?'none':value;try{await feedbackApi('rating','PUT',{replyId,rating:next});const m={...(t.meta||{})};if(next==='none')delete m.rating;else m.rating=next;t.meta=m;persist();
   for(const x of actions.querySelectorAll('.fb-thumb'))x.setAttribute('aria-pressed',String(x===btn&&next!=='none'));status.textContent=next==='none'?uiText('Rating removed.'):uiText('Thanks, your rating was sent.')}catch(e){status.textContent=feedbackError(e)}};return btn};
 actions.append(thumb('up','Helpful','👍'),thumb('down','Not helpful','👎'),status);
 const report=document.createElement('button');report.type='button';report.textContent=uiText('Report a problem');
 report.onclick=()=>{more.open=false;if(p.querySelector('.fb-form'))return;const form=document.createElement('form');form.className='fb-form';
  const cat=document.createElement('select');cat.setAttribute('aria-label',uiText('What went wrong?'));for(const [v,l] of [['inaccurate','Inaccurate information'],['unsafe','Unsafe answer'],['privacy','Privacy issue'],['technical','Technical problem'],['other','Something else']]){const o=document.createElement('option');o.value=v;o.textContent=uiText(l);cat.append(o)}
  const note=document.createElement('textarea');note.maxLength=1000;note.rows=3;note.placeholder=uiText('What happened? (optional)');note.setAttribute('aria-label',uiText('What happened? (optional)'));
  const inc=document.createElement('input');inc.type='checkbox';inc.id='fb-inc-'+replyId.replace(/[^A-Za-z0-9]/g,'');const lab=document.createElement('label');lab.htmlFor=inc.id;lab.textContent=' '+uiText('Include the text of this reply');
  const preview=document.createElement('p');preview.className='tiny muted';const sync=()=>{preview.textContent=inc.checked?uiText('Sends your choice, your note and the text of this reply, which may include personal details or details from your documents. It’s linked to your account, so it’s deleted with it. The Orivia team’s review list doesn’t show who sent it.'):uiText('Sends your choice and your note, not the reply. It’s linked to your account, so it’s deleted with it. The Orivia team’s review list doesn’t show who sent it.')};inc.onchange=sync;sync();
  const send=document.createElement('button');send.type='submit';send.className='btn small';send.textContent=uiText('Send report');
  const cancel=document.createElement('button');cancel.type='button';cancel.className='btn quiet small';cancel.textContent=uiText('Cancel');cancel.onclick=()=>form.remove();
  const out=document.createElement('p');out.className='tiny';out.setAttribute('role','status');const requestId='fb-'+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
  form.onsubmit=async e=>{e.preventDefault();send.disabled=true;out.textContent=uiText('Sending…');
   try{const r=await feedbackApi('report','POST',{requestId,category:cat.value,note:note.value,replyId,includeReply:inc.checked,replyText:inc.checked?t.content:undefined});const done=document.createElement('p');done.className='tiny';done.textContent=uiText('Report sent to the Orivia team. Reference:')+' '+r.receipt;form.replaceChildren(done)}
   catch(err){send.disabled=false;out.textContent=feedbackError(err)}};
  const row=document.createElement('div');row.className='fb-row';const ir=document.createElement('div');ir.append(inc,lab);row.append(send,cancel);
  form.append(cat,note,ir,preview,row,out);p.append(form);cat.focus()};
 more.append(report);
}
function loadEvents(){try{const data=JSON.parse((globalThis.OriviaAccountStorage?.storage||localStorage).getItem(eventKey)||'[]');events=Array.isArray(data)?data.filter(e=>e&&typeof e.title==='string'&&typeof e.at==='string'&&typeof e.id==='string').slice(-100):[]}catch(_){events=[]}}
function storeEvents(){try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(eventKey,JSON.stringify(events.slice(-100)))}catch(_){$('reminder-status').textContent=uiText('Unable to save calendar in this browser.')}}
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
const when=e=>new Date(e.at).toLocaleString(uiLanguage(),{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
/* Calendar: a week strip (dots on days with something) and an agenda grouped by when */
let weekOffset=0,selectedDay=null;
const dayKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const startOfDay=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
function removeEvent(id){events=events.filter(x=>x.id!==id);storeEvents();renderEvents();renderUpcoming()}
function eventRow(e,past){
 const d=new Date(e.at),row=el('article','ev'+(past?' past':''));
 const t=el('div','t');const time=d.toLocaleTimeString(uiLanguage(),{hour:'numeric',minute:'2-digit'});const m=time.match(/^(.*?)\s*([AaPp]\.?[Mm]\.?)$/);
 t.append(el('b','',m?m[1]:time),el('small','',m?m[2]:d.toLocaleDateString(uiLanguage(),{weekday:'short'})));
 const b=el('div','b');b.append(el('strong','',e.title),el('span','tiny',d.toLocaleDateString(uiLanguage(),{weekday:'short',day:'numeric',month:'short'})+' · saved in Orivia'));
 const acts=el('div','acts');
 if(!past){
  // The right button for this device (no surprise file download on Android or computers); see calendarLinks.
  // One quiet button; with two choices (computer, iPhone) it opens them, with one (Android) it is that choice.
  const links=calendarLinks(e);for(const a of links)a.addEventListener('click',()=>{setTimeout(()=>{note.hidden=false;note.textContent=uiText('It’s only in your calendar after you tap Save or Add there.')},300)});
  if(links.length===1)acts.append(links[0]);
  else{const options=el('div','cal-options');options.hidden=true;options.append(...links);const add=button(uiText('Add to calendar')+' ▾','cal-add',()=>{options.hidden=!options.hidden;add.setAttribute('aria-expanded',String(!options.hidden))});add.setAttribute('aria-expanded','false');acts.append(add);acts.optionsBox=options}
 }
 const rm=button('Remove','danger',()=>{if(rm.dataset.sure!=='1'){rm.dataset.sure='1';rm.textContent=uiText('Tap again to remove');return}removeEvent(e.id)});
 // Remove sits behind ⋯ so the card isn't a row of buttons.
 rm.hidden=true;const more=button('⋯','cal-more',()=>{rm.hidden=!rm.hidden;more.setAttribute('aria-expanded',String(!rm.hidden))});more.setAttribute('aria-label',uiText('More options'));more.setAttribute('aria-expanded','false');
 acts.append(more,rm);if(acts.optionsBox)acts.append(acts.optionsBox);
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
  b.append(el('small','',d.toLocaleDateString(uiLanguage(),{weekday:'short'}).slice(0,3)),el('b','',String(d.getDate())),el('i'));
  b.setAttribute('aria-pressed',String(selectedDay===key));b.setAttribute('aria-label',d.toLocaleDateString(uiLanguage(),{weekday:'long',day:'numeric',month:'long'})+(has.has(key)?', has reminders':''));
  days.append(b);
 }
 const sun=new Date(monday);sun.setDate(monday.getDate()+6);
 $('wk-label').textContent=weekOffset===0?'This week':monday.toLocaleDateString(uiLanguage(),{day:'numeric',month:'short'})+' – '+sun.toLocaleDateString(uiLanguage(),{day:'numeric',month:'short'});
 const root=$('events');root.replaceChildren();
 const sorted=events.slice().sort((a,b)=>a.at.localeCompare(b.at)),now=Date.now();
 if(selectedDay){
  const list=sorted.filter(e=>dayKey(new Date(e.at))===selectedDay);
  const g=el('section','agroup');g.append(el('h3','',new Date(selectedDay+'T12:00').toLocaleDateString(uiLanguage(),{weekday:'long',day:'numeric',month:'long'})));
  if(!list.length)g.append(el('p','empty',uiText('Nothing on this day.')));
  for(const e of list)g.append(eventRow(e,new Date(e.at).getTime()<now));
  g.append(button('+ Add a reminder for this day','ask',()=>openAdd(selectedDay)),button('Show everything coming up','ask',()=>{selectedDay=null;renderEvents()}));
  root.append(g);return;
 }
 const upcoming=sorted.filter(e=>new Date(e.at).getTime()>=now),past=sorted.filter(e=>new Date(e.at).getTime()<now);
 if(!upcoming.length){const p=el('div','empty');p.append(el('p','',uiText('Nothing coming up. Add a reminder, or just tell Orivia in Chat: “remind me to call the bank on Sunday”.')));root.append(p)}
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
 for(const [label,n] of picks){const d=new Date(today);d.setDate(today.getDate()+n);q.append(button(label,'seg-btn'+($('reminder-date').value===dayKey(d)?' on':''),()=>{$('reminder-date').value=dayKey(d);for(const x of q.children)x.classList.toggle('on',x.textContent===uiText(label))}))}
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
/* ORI-CAL-001: swipe the week strip only. One week per gesture, past a 48px threshold, mostly horizontal (a vertical
   page scroll never changes week), cancelled by pointercancel. In RTL the strip runs the other way, so a rightward swipe
   is next week. Arrow buttons stay for keyboard and switch users; a swipe suppresses the day tap it ended on. */
function weekSwipeStep(dx,dy,rtl){if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.5)return 0;const next=rtl?dx>0:dx<0;return next?1:-1}
{const strip=$('wk-days');let start=null,swiped=false;
 strip.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;start={x:e.clientX,y:e.clientY,id:e.pointerId};swiped=false});
 strip.addEventListener('pointercancel',()=>{start=null});
 strip.addEventListener('pointerup',e=>{if(!start||e.pointerId!==start.id)return;const step=weekSwipeStep(e.clientX-start.x,e.clientY-start.y,getComputedStyle(strip).direction==='rtl');start=null;
  if(step){swiped=true;weekOffset+=step;selectedDay=null;renderEvents();const live=$('wk-label');live&&live.setAttribute('aria-live','polite')}});
 strip.addEventListener('click',e=>{if(swiped){e.stopPropagation();e.preventDefault();swiped=false}},true);}
function renderUpcoming(){
 loadEvents();const root=$('upcoming');root.replaceChildren();
 const next=events.filter(e=>new Date(e.at).getTime()>Date.now()).sort((a,b)=>a.at.localeCompare(b.at)).slice(0,3);
 for(const e of next){const b=button('','now-item',()=>tab('calendar'));b.append(icon('M3.5 5h17v15h-17zM3.5 10h17M8 3v4M16 3v4'));const sp=el('span');sp.append(el('strong','',e.title),el('small','',when(e)));b.append(sp,document.createTextNode('›'));root.append(b)}
 if(!next.length)root.append(button('+ Add a reminder','ask',()=>{tab('calendar');openAdd()}));
}
/* Build-time country photos. Saved location stays on this device; no photo search or geolocation. */
const DESTINATION_PHOTOS=/*__DESTINATION_PHOTOS__*/{};
function homeCountry(profile){return profile?.here==='away'?(['uae','uk'].includes(profile.dest)?profile.dest:null):(['uae','uk'].includes(profile?.here)?profile.here:null)}
function renderHomeDestination(profile){
 const key=homeCountry(profile),photo=key?DESTINATION_PHOTOS[key]:null,hero=$('home-welcome'),img=$('home-destination-photo'),caption=$('home-destination-caption');
 if(!photo){img.hidden=true;img.removeAttribute('src');hero.classList.remove('has-destination');caption.hidden=true;$('home-photo-credit').hidden=true;return}
 img.onerror=()=>{img.hidden=true;hero.classList.remove('has-destination');caption.hidden=true;$('home-photo-credit').hidden=true};
 if(img.getAttribute('src')!==photo.image)img.src=photo.image;
 img.hidden=false;hero.classList.add('has-destination');caption.textContent=uiText(photo.caption);caption.hidden=false;$('home-photo-credit').hidden=false;
 if(profile.here==='away')$('home-greeting').textContent=uiText('Your next chapter')+': '+uiText(photo.country);
}

/* Dashboard reads the same local records as Calendar, Journeys and Chats. No sample data or new requests. */
function dashboardRecords(now=Date.now()){
 loadEvents();
 const upcoming=events.filter(e=>Number.isFinite(Date.parse(e.at))&&Date.parse(e.at)>now).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).slice(0,2);
 const journeys=Object.entries(readJourneys()).filter(([id,v])=>JID.test(id)&&v&&typeof v.title==='string');
 const active=journeys.filter(([,v])=>v.status==='active'||v.status==='paused').sort((a,b)=>String(b[1].updated).localeCompare(String(a[1].updated)))[0]||null;
 const recent=store.chats.filter(c=>!c.archived&&c.turns.some(t=>t.role==='user')).sort((a,b)=>b.updated-a.updated).slice(0,2);
 return {upcoming,journeys,active,recent};
}
function dashboardEmpty(root,text,label,action){const box=el('div','dashboard-empty');box.append(el('p','',uiText(text)),button(label,'btn quiet small',action));root.append(box)}
function dashboardCard(title,subtitle,action,symbol='›'){
 const b=button('','dashboard-card',action),copy=el('span','dashboard-copy');copy.append(el('strong','',title));if(subtitle)copy.append(el('small','',subtitle));
 b.append(copy,el('span','dashboard-arrow',symbol));return b;
}
function renderHome(){
 const root=$('home');if(!root)return;
 window.OriviaSpaces?.refresh();
 const hour=new Date().getHours();$('home-greeting').textContent=uiText(hour<12?'Good morning':hour<18?'Good afternoon':'Good evening');
 const accountName=globalThis.OriviaAccounts?.user?.name;if(accountName)$('home-greeting').textContent+=', '+accountName;
 renderHomeDestination(migrateProfile(readProfile()||{}));
 const data=dashboardRecords(),coming=$('home-coming'),journey=$('home-journey'),recent=$('home-recent');coming.replaceChildren();journey.replaceChildren();recent.replaceChildren();
 for(const e of data.upcoming){
  const date=new Date(e.at),b=dashboardCard(e.title,when(e),()=>{tab('calendar');selectedDay=dayKey(date);renderEvents()}),tile=el('span','dashboard-date');
  tile.append(el('b','',date.toLocaleDateString(uiLanguage(),{day:'numeric'})),el('small','',date.toLocaleDateString(uiLanguage(),{month:'short'})));b.prepend(tile);coming.append(b);
 }
 if(!data.upcoming.length)dashboardEmpty(coming,'A little breathing room. No upcoming reminders.','Add a reminder',()=>{tab('calendar');openAdd()});
 const going=Object.entries(readJourneys()).filter(([id,v])=>JID.test(id)&&v&&typeof v.title==='string'&&(v.status==='active'||v.status==='paused')).sort((a,b)=>String(b[1].updated||'').localeCompare(String(a[1].updated||'')));
 for(const [id,v] of going.slice(0,3)){const b=dashboardCard(v.title,'',()=>openGuide(id,{from:'home'}));
  const copy=b.querySelector('.dashboard-copy');copy.prepend(el('span','dashboard-kicker',uiText(v.status==='paused'?'Paused':'In progress')));
  const total=Math.max(0,Number(v.steps)||0),done=Math.min(total,doneCount(v));
  copy.append(el('small','',uiText('Steps completed')+': '+done+' / '+total));if(total){const p=el('div','dashboard-progress');p.append(bar(done,total,uiText('Steps completed')));copy.append(p)}
  copy.append(el('small','',uiText('Reopen →')));const symbol=el('span','dashboard-symbol');symbol.append(icon('M6 18a2.5 2.5 0 1 0 0-.1M18 6a2.5 2.5 0 1 0 0-.1M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5'));b.prepend(symbol);journey.append(b);
 }
 if(going.length>3)journey.append(dashboardCard(uiText('All your guides →'),String(going.length-3)+' '+uiText('more in progress'),()=>tab('journeys')));
 if(!going.length)dashboardEmpty(journey,'Take things one step at a time. Find a guide when you need one.','Browse guides',()=>tab('journeys'));
 for(const chat of data.recent){const b=dashboardCard(chat.title,whenShort(chat.updated),()=>openChat(chat.id)),symbol=el('span','dashboard-symbol');symbol.append(icon('M4 5h16v11H9l-5 4z'));b.prepend(symbol);recent.append(b)}
 if(!data.recent.length)dashboardEmpty(recent,'Your conversations will be here when you want to return.','Start a conversation',()=>newChat());
}
function renderLifeSummary(){
 const root=$('life-profile-rows');if(!root)return;root.replaceChildren();const p=migrateProfile(readProfile()||{});
 const rows=[['Living in',p.here==='away'?uiText('Not there yet'):placeText(p.here,p.region,p.town)||clip(p.city)],['Moved from',originText(p)],['Here for',uiText(WHO.find(([value])=>value===p.who)?.[1]||'Not added')]];
 if(p.here==='away')rows.push(['Moving to',placeText(p.dest,p.destRegion,p.destTown)]);
 for(const [label,value]of rows){const row=el('div','life-row');row.append(el('span','',uiText(label)),el('strong','',value||uiText('Not added')));root.append(row)}
 $('life-institution-name').textContent=clip(p.place,80)||uiText('Add your school, college or organisation');
 $('life-institution-note').textContent=uiText(p.place?'Added by you · not linked':'Optional. You can add this later.');
 const places=new Set();for(const chat of store.chats)for(const t of chat.turns){if(!Array.isArray(t.meta?.savedPlaces))continue;for(const d of safeDestinations(t.meta.destinations,safeSources(t.meta.sources)))if(t.meta.savedPlaces.includes(placeIdentity(d)))places.add(placeIdentity(d))}
 $('life-place-count').textContent=String(places.size)+' · '+uiText('Saved on this device');
 const journeys=Object.entries(readJourneys()).filter(([id,v])=>JID.test(id)&&v&&typeof v.title==='string'),inProgress=journeys.filter(([,v])=>v.status==='active'||v.status==='paused').length;$('life-journey-count').textContent=journeys.length?String(journeys.length)+' '+uiText('saved')+(inProgress?' · '+inProgress+' '+uiText('in progress'):''):uiText('Browse step-by-step guides');
}
function submitHomeQuestion(e){
 e.preventDefault();const input=$('home-question'),text=input.value.trim(),note=$('home-question-status');note.hidden=true;
 if(!text){tab('chat');$('msg').focus();return}
 if(busy||Date.now()<coolUntil){note.textContent=uiText(busy?'Orivia is finishing a reply. Your message is still here; try again in a moment.':'Please wait a moment, then send again. Your message is still here.');note.hidden=false;return}
 newChat();input.value='';ask(text,true);
}
$('home-ask-form').addEventListener('submit',submitHomeQuestion);
$('home-calendar').onclick=()=>tab('calendar');
$('home-all-chats').onclick=()=>{tab('chat');openChats()};
$('life-journeys-open').onclick=()=>tab('journeys');
$('home-all-guides').onclick=()=>tab('journeys');
$('life-places-open').onclick=()=>{const box=$('saved-places-section');box.hidden=!box.hidden;$('life-places-open').setAttribute('aria-expanded',String(!box.hidden));if(!box.hidden)renderSavedPlaces()};

/* Switching sections: the bottom bar, and Orivia herself (window.oriviaGo) */
if(window.OriviaNav)window.OriviaNav.onSettings=()=>tab('settings');
try{if(new URLSearchParams(location.search).get('view')==='settings')queueMicrotask(()=>{tab('settings');history.replaceState(null,'',location.pathname)})}catch(_){}
function tab(which){
 const views={home:'home',chat:'chat',library:'library',calendar:'calendar-panel',journeys:'journeys',mylife:'mylife',guide:'guide-view',settings:'settings-view'};
 if(!views[which])return;
 if(which==='chat')try{renderOrgContext()}catch(_){}
 if(which==='library')try{renderLibraryView()}catch(_){}
 if(which!=='settings')lastTab=which;
 if(!['journeys','guide','settings'].includes(which))guidesReturnTab=which;
 if(which!=='chat'){try{stopSpeaking();stopDictation(true);closeMicLanguageMenu()}catch(_){}}
 const navKey=which==='guide'||which==='journeys'?'mylife':which; // guides live under My Life (no Journeys tab); Settings has no tab of its own
 for(const [k,id] of Object.entries(views)){$(id).hidden=k!==which;const b=$('tab-'+k);if(b){b.classList.toggle('active',k===navKey);b.setAttribute('aria-current',k===navKey?'page':'false')}}
 $('view-title').textContent=uiText(TITLES[which]);
 if(which==='home')renderHome();
 if(which==='calendar')renderEvents();
 if(which==='settings'){renderSettings();renderInstall()}
 if(which==='journeys')renderJourneys();
 if(which==='mylife'){renderUpcoming();loadProfile();renderJourneys();renderSavedPlaces();renderLifeSummary();window.OriviaAccounts?.copy()}
 if(which==='chat'){const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight}
}
window.oriviaGo=tab;
/* Installable app (21 Oct): register the app worker for this app's scope; show an honest offline note. */
const APP_SCOPE=location.pathname.startsWith('/app')?'/app':'/';
// Registered after the page has loaded (now, if it already has), so it never slows the first screen.
let appWorkerAsked=false;function registerAppWorker(){if(appWorkerAsked||!('serviceWorker' in navigator))return;appWorkerAsked=true;navigator.serviceWorker.register('/orivia-sw.js',{scope:APP_SCOPE}).catch(()=>{})}
if(document.readyState==='complete')setTimeout(registerAppWorker,0);else{window.addEventListener('load',registerAppWorker);setTimeout(registerAppWorker,4000)} // load can wait on slow third-party parts
// A new app version took over: offer a reload rather than reloading under the person (they may be typing).
if('serviceWorker' in navigator){const hadController=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||$('update-note'))return;const n=el('div','offline-note',uiText('Orivia has been updated.'));n.id='update-note';n.setAttribute('role','status');const b=el('button','ask',uiText('Reload'));b.type='button';b.onclick=()=>location.reload();n.append(' ',b);$('offline-note')?.before(n)})}
function showOffline(){const n=$('offline-note');if(n)n.hidden=navigator.onLine!==false}
window.addEventListener('online',showOffline);window.addEventListener('offline',showOffline);showOffline();
let installPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;renderInstall()});window.addEventListener('appinstalled',()=>{installPrompt=null;renderInstall()});
function renderInstall(){const box=$('install-box');if(!box)return;box.replaceChildren();
 const standalone=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 if(standalone){box.append(el('p','tiny',uiText('Orivia is installed on this device.')));return}
 if(installPrompt){const b=el('button','btn',uiText('Add to home screen'));b.type='button';b.onclick=async()=>{const p=installPrompt;installPrompt=null;try{await p.prompt();await p.userChoice}catch(_){}renderInstall()};box.append(b,el('p','tiny',uiText('Opens like an app from your home screen. Chat still needs a connection.')));return}
 box.append(el('p','tiny',uiText(ios?'On iPhone or iPad: open Orivia in Safari, tap Share, then Add to Home Screen.':'In Chrome or Edge, open the browser menu and choose Install app or Add to Home screen.')),el('p','tiny',uiText('Chat still needs a connection.')));
}
var guidesReturnTab='home';
let lastTab='chat';
for(const b of document.querySelectorAll('nav.bottom [data-tab]'))b.onclick=()=>tab(b.dataset.tab);
loadEvents();
/* Ask Orivia from anywhere: fills the message box in Chat */
function ask(text,send){
 tab('chat');const m=$('msg');m.value=text;grow();m.focus();
 if(send)$('form').requestSubmit();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ask]');if(b){e.preventDefault();ask(uiText(b.dataset.ask),b.closest('#empty')!==null)}});
/* Official sources (shown in Journeys) */
const OFFICIAL=[
 ['RTA (Dubai roads and transport)','https://www.rta.ae','Metro, buses, nol cards, taxis'],
 ['UAE government portal','https://u.ae','Official information on visas, residency and services'],
 ['GDRFA Dubai','https://www.gdrfad.gov.ae','Residency and entry permits in Dubai'],
 ['ICP','https://icp.gov.ae','Emirates ID and federal residency services'],
 ['KHDA','https://web.khda.gov.ae','Private schools and universities in Dubai']];
/* My Life: About me, only shared with the AI when the user ticks the box */
function readProfile(){try{const p=JSON.parse((globalThis.OriviaAccountStorage?.storage||localStorage).getItem(profileKey)||'null');return p&&typeof p==='object'?p:null}catch(_){return null}}
/* About me is used by default; only an explicit 'off' stops it */
function aboutMeOn(){const p=readProfile();return !(p&&p.use===false)}
function setAboutMe(on){const p=readProfile()||{};try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(profileKey,JSON.stringify({...p,use:on}))}catch(_){}}
/* About you: tap to pick, saves as you go. Where you live now and where you're moving to are kept apart. */
const WHO=[['study','Study'],['work','Work'],['join or bring my family','Family'],['something else','Something else']];
const EMIRATES_ALL=['Abu Dhabi','Dubai','Sharjah','Ajman','Umm Al Quwain','Ras Al Khaimah','Fujairah'];
const UK_NATIONS=['England','Scotland','Wales','Northern Ireland'];
let aboutEditing=false,aboutSkipped=false;
/* Countries for "Where did you move from?": ISO codes, named by the browser in the person's language */
const COUNTRY_CODES='AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');
function makeRegionNames(){for(const l of [uiLanguage(),String(navigator.language||'').replace(/[@_].*$/,''),'en']){try{if(l)return new Intl.DisplayNames([l],{type:'region'})}catch(_){}}return null};let regionNames=makeRegionNames(); // tolerate odd language codes like en-US@posix
function countryName(code){try{return (regionNames&&regionNames.of(code))||code}catch(_){return code}}
let countryOptions=null;
function fillCountries(sel,current){
 if(!countryOptions)countryOptions=COUNTRY_CODES.map(c=>[c,countryName(c)]).sort((a,b)=>a[1].localeCompare(b[1]));
 if(sel.options.length!==countryOptions.length+1){sel.replaceChildren(new Option(uiText('Choose (optional)'),''));for(const [c,n] of countryOptions)sel.append(new Option(n,c))}
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
 try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(profileKey,JSON.stringify(n))}catch(_){}
 loadProfile();
}
/* The emirate or UK nation + town fields for one place (where you live, or where you're moving to) */
function placeFields(root,country,keys,p){
 root.replaceChildren();if(country!=='uae'&&country!=='uk')return;
 const id=keys.region+'-sel',tid=keys.town+'-in';
 const lab=el('label','field');lab.htmlFor=id;lab.append(uiText(country==='uae'?'Emirate':'Nation'));
 const sel=document.createElement('select');sel.id=id;
 const opts=country==='uae'?EMIRATES_ALL:UK_NATIONS;
 sel.append(new Option(uiText('Choose'),''));for(const o of opts)sel.append(new Option(o,o));
 sel.value=opts.includes(p[keys.region])?p[keys.region]:'';sel.onchange=()=>saveProfile({[keys.region]:sel.value});lab.append(sel);
 const tl=el('label','field');tl.htmlFor=tid;tl.append(uiText(country==='uae'?'Area':'City or town'));tl.append(el('small','',' '+uiText(country==='uae'?'Optional':'Type it if it isn’t listed')));
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
 $('origin-q').firstChild.textContent=uiText(p.here==='away'?'Where are you moving from?':'Where did you move from?')+' ';
 $('origin-clear').hidden=!(p.originCountry||p.originTown);
 seg('pick-dest',[['uae','UAE'],['uk','UK'],['unsure','Not sure yet']],p.dest||'',v=>saveProfile({dest:p.dest===v?'':v,...(p.dest!==v?{destRegion:'',destTown:''}:{})}));
 placeFields($('dest-fields'),p.here==='away'?p.dest:'',{region:'destRegion',town:'destTown'},p);
 seg('pick-who',WHO,p.who||'',v=>saveProfile({who:p.who===v?'':v}));
 const showPlace=p.who==='study'||p.who==='work';
 $('pick-place-row').hidden=false;
 $('pick-place-q').textContent=uiText(p.who==='work'?'Where you work':'Your institution');
 $('p-place').placeholder=uiText(p.who==='work'?'Company or organisation':'School, college, university or training centre');
 if(document.activeElement!==$('p-place'))$('p-place').value=p.place||'';
 $('place-note').textContent=uiText(p.place?'Saved as you typed it. Orivia hasn’t checked it yet.':'Type its name as you know it. Orivia hasn’t checked it yet.');
 $('about-summary').textContent=filled?aboutSentence(p):'';
 const whereDone=p.here==='uae'?!!p.region:p.here==='uk'?!!(p.region||p.town):p.here==='away'?!!p.dest:false;
 const complete=!!(whereDone&&p.who&&(!showPlace||p.place)); // collapses once everything that applies is answered
 const open=aboutEditing;
 $('about-pick').hidden=!open;
 $('life-editor').hidden=!open;
 $('about-edit').hidden=open;
 $('about-done').hidden=!open;
 renderLifeSummary();
 $('about-use').textContent=uiText(aboutMeOn()?'Orivia uses this so you don’t have to repeat yourself. You can switch that off in Settings.':'Orivia isn’t using this right now. You can switch it on in Settings.');
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
 card.append(el('strong','',uiText('Remember this for next time?')),el('p','notice',lines.join(' · ')+'. Then you won’t need to say it again.'));
 const row=el('div','row');
 row.append(button('Remember','btn small',()=>{saveProfile(patch);card.replaceChildren(el('p','',uiText('Saved to My Life. You can change it any time.')))}),
  button('No thanks','btn text small',()=>{no.push(sig);try{sessionStorage.setItem(noKey,JSON.stringify(no.slice(-20)))}catch(_){}card.remove()}));
 card.append(row);($('journey-actions')||$('history')).after(card);
 const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight;
}
$('about-edit').onclick=()=>{aboutEditing=true;aboutSkipped=false;loadProfile();$('pick-here').querySelector('button')?.focus()};
$('about-done').onclick=()=>{aboutEditing=false;aboutSkipped=true;loadProfile();$('about-edit').focus()}; // Done closes it even if some questions are skipped
$('place-form').addEventListener('submit',e=>{e.preventDefault();saveProfile({place:$('p-place').value.trim()})});
$('p-place').addEventListener('change',e=>saveProfile({place:e.target.value.trim()}));
function profileForAI(){const p=readProfile();if(!p||p.use===false)return undefined;const out={};for(const k of ['city','movingTo','movedFrom','who','place'])if(typeof p[k]==='string'&&p[k].trim())out[k]=p[k].trim().slice(0,60);return Object.keys(out).length?out:undefined}
$('forget').onclick=()=>{const b=$('forget');if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent=uiText('Tap again to delete');setTimeout(()=>{b.dataset.sure='';b.textContent=uiText('Clear saved data')},4000);return}try{cancelAttach()}catch(_){}try{(globalThis.OriviaAccountStorage?.storage||localStorage).removeItem(profileKey);(globalThis.OriviaAccountStorage?.storage||localStorage).removeItem(eventKey);(globalThis.OriviaAccountStorage?.storage||localStorage).removeItem(journeysKey);(globalThis.OriviaAccountStorage?.storage||localStorage).removeItem(chatsKey);(globalThis.OriviaAccountStorage?.storage||localStorage).removeItem(chatsBackupKey)}catch(_){}storeLocked=false;storageWarn('');store={chats:[],active:null};turns=[];clearChatCards();draw();renderChats();events=[];loadProfile();renderUpcoming();renderJourneys();b.dataset.sure='';b.textContent=uiText('Cleared')};
/* End session: back to the welcome screen. Clears this conversation and the human check; keeps journeys, calendar and My Life. */
$('end-session').onclick=async()=>{
 if(globalThis.OriviaAccounts?.user){globalThis.OriviaAccounts.open();return}
 const b=$('end-session');
 if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent=uiText('Tap again to end this session');setTimeout(()=>{b.dataset.sure='';b.textContent=uiText('End session')},4000);return}
 stopSpeaking();stopDictation(false);
 try{await fetch('/v1/end',{method:'POST',credentials:'same-origin'})}catch(_){}
 store.active=null;persist(); // saved chats stay; the welcome screen opens to a new chat
 try{for(const k of [key,ck,'orivia-private-offered','orivia-private-remember-no'])sessionStorage.removeItem(k)}catch(_){}setAgreed(false);
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
 if(/[一-鿿]/.test(t))return 'zh';if(/[Ѐ-ӿ]/.test(t))return 'ru';return latinLang(t)||(['fr','fil'].includes(uiLanguage())?uiLanguage():'en');
}
function latinLang(t){ // French, Filipino or English from their most common words (only when one clearly leads)
 const n=re=>(String(t).match(re)||[]).length;
 const fr=n(/(?:^|[^\p{L}])(le|la|les|des|du|une|est|vous|votre|vos|pour|avec|dans|pas|sont|aux|qui|que|cette|et|au|sur|il|elle)(?=[^\p{L}]|$)/giu)+n(/[éèêàçùâîôœ]/giu);
 const fil=n(/(?:^|[^\p{L}])(ang|ng|mga|sa|po|ko|mo|ito|para|kung|hindi|naman|lang|ka|siya)(?=[^\p{L}]|$)/giu);
 const en=n(/(?:^|[^\p{L}])(the|and|you|your|is|are|to|of|for|with|this|that|it|can|will|in|on)(?=[^\p{L}]|$)/giu);
 const best=Math.max(fr,fil,en);if(best<3)return '';return best===en?'en':best===fr?'fr':'fil';
}
function bestVoice(l){
 const want=VOICE_LOC[l].toLowerCase(),pre=l==='zh'?['zh','cmn']:l==='fil'?['fil','tl']:[l];
 const score=v=>{const vl=String(v.lang).toLowerCase().replace('_','-');let s=vl===want?30:0;if(/natural|neural|enhanced|premium|online/i.test(v.name))s+=40;if(/google/i.test(v.name))s+=25;if(/siri/i.test(v.name))s+=20;if(/compact|espeak|eloquence/i.test(v.name))s-=30;return s};
 return speechSynthesis.getVoices().filter(v=>pre.some(x=>String(v.lang).toLowerCase().startsWith(x))&&!VOICE_BAD.test(v.name)).sort((a,b)=>score(b)-score(a))[0]||null;
}
function voicesReady(){return new Promise(res=>{const now=speechSynthesis.getVoices();if(now.length)return res();let done=false;const fin=()=>{if(!done){done=true;res()}};speechSynthesis.addEventListener('voiceschanged',fin,{once:true});setTimeout(fin,1200)})}
let speakingBtn=null,speakRun=0;
// Natural voice (OpenAI), when the server offers it, the person agreed to OpenAI and hasn't turned it off in Settings.
// Only the text of the reply being read is sent, a piece at a time; the next piece is fetched while one plays.
let naturalVoiceServer=false,voicePlayer=null,voiceRequests=new Set(),voiceError='';
const SILENT_WAV='data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
function naturalVoiceOn(){return naturalVoiceServer&&readSettings().naturalVoice!==false&&!!pilotConsent()}
// iPhones only let audio play from a tap: start the one player during the tap, then reuse it for the voice.
function unlockPlayer(){const a=voicePlayer||(voicePlayer=new Audio());try{a.src=SILENT_WAV;a.play().catch(()=>{})}catch(_){}return a}
function voicePiece(text,lang){const c=new AbortController();voiceRequests.add(c);
 return fetch('/v1/voice',{method:'POST',signal:c.signal,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,language:lang,preferences:{providerConsent:pilotConsent()}})})
  // A failed piece remembers why (a safe code such as voice_limit), so the person can tell us what happened.
  .then(async r=>{if(r.ok&&String(r.headers.get('Content-Type')).startsWith('audio/'))return r.blob();let e='';try{e=String((await r.json()).error||'')}catch(_){}voiceError=(/^[a-z_]{3,40}$/.test(e)?e:'http_'+r.status);return null}).catch(()=>{voiceError=voiceError||'offline';return null}).finally(()=>voiceRequests.delete(c))}
function playPiece(blob,run){return new Promise(res=>{const a=voicePlayer,url=URL.createObjectURL(blob);let over=false;const done=ok=>{if(over)return;over=true;URL.revokeObjectURL(url);a.onended=a.onerror=a.onpause=null;res(ok)};
 a.onended=()=>done(true);a.onerror=()=>done(false);a.onpause=()=>{if(run!==speakRun)done(true)};a.src=url;a.play().catch(()=>done(false))})}
// Returns the text it could not read ('' when done or stopped).
async function naturalSpeak(text,lang,run){
 const parts=(window.OriviaVoiceText?.chunks?window.OriviaVoiceText.chunks(text,600):[text]).filter(x=>x.trim());
 voiceError='';let next=voicePiece(parts[0],lang);
 for(let i=0;i<parts.length;i++){
  const blob=await next;if(run!==speakRun)return '';
  if(!blob){if(voiceError)$('status').textContent=uiText('The natural voice isn’t available right now, so your phone’s voice is reading this.')+' ('+voiceError+')';return parts.slice(i).join(' ')}
  next=i+1<parts.length?voicePiece(parts[i+1],lang):null;
  if(i===0)$('status').textContent=uiText('Reading with an AI-generated voice (OpenAI).');
  const ok=await playPiece(blob,run);if(run!==speakRun)return '';if(!ok)return parts.slice(i).join(' ');
 }
 stopSpeaking();return '';
}
function stopSpeaking(){if(!canSpeak)return;speakRun++;speechSynthesis.cancel();for(const c of voiceRequests)c.abort();voiceRequests.clear();if(voicePlayer){try{voicePlayer.pause()}catch(_){}}if(speakingBtn){speakingBtn.setAttribute('aria-pressed','false');speakingBtn.textContent=uiText('▶ Listen');speakingBtn=null}}
async function listen(text,btn,{language=null,feedback=null}={}){
 if(speakingBtn===btn){stopSpeaking();return}
 stopSpeaking();stopDictation(false);
 const run=++speakRun,l=language&&VOICE_LOC[language]?language:textLang(text);
 let clean=text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu,'').replace(/\s+/g,' ').trim();
 // Natural voice first; anything it couldn't read (limit reached, offline, not word for word) goes to the phone's voice.
 if(naturalVoiceOn()&&clean){unlockPlayer();if(feedback)feedback.textContent='';speakingBtn=btn;btn.setAttribute('aria-pressed','true');btn.textContent=uiText('■ Stop');
  clean=await naturalSpeak(clean,l,run);if(run!==speakRun||!clean)return}
 await voicesReady();if(run!==speakRun)return;const v=bestVoice(l);
 if(!v&&(language||l!=='en')){if(speakingBtn===btn)stopSpeaking();const target=feedback||$('status');target.textContent=uiText('This phone has no voice for this language yet. You can add one in your phone’s text-to-speech settings.');return}
 if(feedback)feedback.textContent='';speakingBtn=btn;btn.setAttribute('aria-pressed','true');btn.textContent=uiText('■ Stop');
 // Ina's lossless chunks (long text without spaces, e.g. Chinese, used to lose its start); the old split only if missing.
 const parts=window.OriviaVoiceText?.chunks?window.OriviaVoiceText.chunks(clean,200).filter(x=>x.trim()):clean.split(/(?<=[.!?。！？।۔])\s+/).flatMap(x=>x.length>220?x.match(/.{1,200}(\s|$)/g):[x]).filter(Boolean);
 parts.forEach((c,i)=>{const u=new SpeechSynthesisUtterance(c);u.lang=v?v.lang:VOICE_LOC[l];if(v)u.voice=v;u.rate=v&&/natural|neural|online|enhanced|premium/i.test(v.name)?1:.95;
  if(i===parts.length-1)u.onend=()=>{if(run===speakRun)stopSpeaking()};u.onerror=e=>{if(run===speakRun&&e.error!=='interrupted'&&e.error!=='canceled')stopSpeaking()};speechSynthesis.speak(u)});
}
if(canSpeak)setInterval(()=>{try{if(speechSynthesis.speaking&&!speechSynthesis.paused){speechSynthesis.pause();speechSynthesis.resume()}}catch(_){}},10000); // keeps Chrome on Android from stopping long replies
/* ===== Dictation: speak instead of typing, then check and edit before sending ===== */
const Recog=window.SpeechRecognition||window.webkitSpeechRecognition;
const micNoteKey='orivia-private-mic-note-v2';
const DICT_LANGS=[['app','App language'],['auto','Device language'],['en-GB','English (UK)'],['ar-AE','العربية'],['fr-FR','Français'],['fil-PH','Filipino'],['hi-IN','हिन्दी'],['ur-PK','اردو'],['zh-CN','中文'],['bn-BD','বাংলা'],['ml-IN','മലയാളം'],['ru-RU','Русский']];
let recog=null,dictBase='';
function dictationLanguage(){
 const choice=$('dict-language').value;if(choice==='app')return VOICE_LOC[uiLanguage()]||'en-GB';
 return DICT_LANGS.some(([id])=>id===choice)&&choice!=='auto'?choice:(navigator.language||'en-GB');
}
function dictationIdle(){
 $('listening').hidden=true;$('mic').setAttribute('aria-pressed','false');
 $('dict-language').disabled=false;$('dict-language-shortcut').disabled=false;$('msg').readOnly=false;grow();
}
function stopDictation(keep){
 if(!recog)return;const r=recog;recog=null; // retire before stop/abort: late callbacks must not touch this draft or another chat
 if(!keep)$('msg').value=dictBase;
 dictationIdle();
 try{keep?r.stop():r.abort()}catch(_){}
 $('status').textContent=keep?'Check the text, edit anything, then press Send.':'Dictation cancelled. Your earlier text is kept.';
}
function startDictation(){
 if(!Recog||recog)return;
 closeMicLanguageMenu();
 let seen=false;try{seen=(globalThis.OriviaAccountStorage?.storage||localStorage).getItem(micNoteKey)==='1'}catch(_){}
 if(!seen){$('status').textContent=uiText('Your browser may send audio to its speech provider, such as Google or Apple, to turn it into text. Orivia receives the text only when you press Send. Tap the microphone again to start.');try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(micNoteKey,'1')}catch(_){}return}
 stopSpeaking();
 let r;try{r=new Recog()}catch(_){$('status').textContent=uiText('Speech to text couldn’t start. You can keep typing.');return}
 recog=r;const base=$('msg').value;dictBase=base;
 r.lang=dictationLanguage();r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
 $('listening').hidden=false;$('listening-text').textContent=uiText('Starting microphone…');$('mic').setAttribute('aria-pressed','true');
 $('dict-language').disabled=true;$('dict-language-shortcut').disabled=true;$('msg').readOnly=true;$('status').textContent='';
 r.onstart=()=>{if(recog!==r)return;$('listening-text').textContent=uiText('Listening')+' · '+(DICT_LANGS.find(([id])=>id===r.lang)?.[1]||r.lang)+' · '+uiText('Stop to edit')};
 r.onresult=e=>{
  if(recog!==r)return;
  let t='';for(const x of e.results)t+=x[0].transcript;
  const text=(base?base.replace(/\s*$/,' '):'')+t.trim();
  $('msg').value=text.slice(0,900);grow();
  if(text.length>900)$('listening-text').textContent=uiText('Message limit reached · Stop to edit');
 };
 r.onerror=e=>{
  if(recog!==r)return;recog=null;dictationIdle();try{r.abort()}catch(_){}
  $('status').textContent=({'not-allowed':'Microphone permission was blocked or dismissed. Allow it in this site’s browser permissions, then try again. You can keep typing.',
   'service-not-allowed':'Speech to text isn’t available in this browser. You can keep typing.',
   'language-not-supported':'This speech service doesn’t support the selected language. Choose another language or keep typing.',
   'no-speech':'I didn’t catch anything. Tap the microphone and try again.',
   'audio-capture':'No microphone was found. Check that one is connected and available, or keep typing.',
   'network':'The speech service couldn’t be reached. Check your connection and try again, or keep typing.',
   'aborted':'Dictation stopped. You can edit the text or keep typing.'})[e.error]||'Dictation stopped unexpectedly. Your text is still here; you can edit it or try again.';
 };
 r.onend=()=>{
  if(recog!==r)return;recog=null;dictationIdle();
  $('status').textContent=$('msg').value.trim()!==base.trim()?'Check the text, edit anything, then press Send.':'No new speech was captured. Try the microphone again or keep typing.';
 };
 try{r.start()}catch(_){if(recog===r){recog=null;dictationIdle();$('status').textContent=uiText('Speech to text couldn’t start. You can keep typing.')}}
}
function closeMicLanguageMenu(focus=false){
 $('mic-language-menu').hidden=true;$('mic').setAttribute('aria-expanded','false');if(focus)$('mic').focus();
}
function setupDictation(){
 if(!Recog)return;
 const picker=$('dict-language'),shortcut=$('dict-language-shortcut'),mic=$('mic'),menu=$('mic-language-menu');
 for(const [id,label]of DICT_LANGS)for(const select of [picker,shortcut]){const o=document.createElement('option');o.value=id;o.textContent=label;select.append(o)}
 const saved=readSettings().dictationLanguage;picker.value=shortcut.value=DICT_LANGS.some(([id])=>id===saved)?saved:'app';
 const choose=source=>{picker.value=shortcut.value=source.value;try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(settingsKey,JSON.stringify({...readSettings(),dictationLanguage:source.value}))}catch(_){}};
 picker.onchange=()=>choose(picker);shortcut.onchange=()=>{choose(shortcut);closeMicLanguageMenu(true)};
 const open=focus=>{if(recog)return;menu.hidden=false;mic.setAttribute('aria-expanded','true');if(focus)shortcut.focus()};
 let hold=null,hover=null,leave=null,down=null,held=false,suppressUntil=0;
 const clearHold=()=>{clearTimeout(hold);hold=null};
 mic.title=uiText('Tap to dictate. Hold or hover to choose language.');mic.setAttribute('aria-haspopup','dialog');mic.setAttribute('aria-controls','mic-language-menu');mic.setAttribute('aria-expanded','false');
 mic.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;clearTimeout(leave);hover=setTimeout(()=>open(false),300)});
 mic.addEventListener('pointerleave',()=>{clearTimeout(hover);leave=setTimeout(()=>{if(!menu.contains(document.activeElement))closeMicLanguageMenu()},200);clearHold()});
 menu.addEventListener('pointerenter',()=>clearTimeout(leave));menu.addEventListener('pointerleave',()=>{leave=setTimeout(()=>{if(!menu.contains(document.activeElement))closeMicLanguageMenu()},200)});
 mic.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.button>0)return;down={x:e.clientX,y:e.clientY};clearHold();held=false;hold=setTimeout(()=>{held=true;open(true)},500)});
 mic.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>10)clearHold()});
 for(const event of ['pointerup','pointercancel'])mic.addEventListener(event,()=>{clearHold();down=null;if(held){suppressUntil=Date.now()+600;held=false}});
 mic.addEventListener('contextmenu',e=>{e.preventDefault();held=true;suppressUntil=Date.now()+600;open(true)});
 mic.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&e.altKey){e.preventDefault();open(true)}});
 document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!mic.contains(e.target))closeMicLanguageMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){e.preventDefault();closeMicLanguageMenu(true)}});
 $('mic-language-close').onclick=()=>closeMicLanguageMenu(true);
 $('dict-options').hidden=false;mic.hidden=false;
 mic.onclick=()=>{if(Date.now()<suppressUntil)return;closeMicLanguageMenu();recog?stopDictation(true):startDictation()};
}
$('dict-stop').onclick=()=>stopDictation(true);
$('dict-cancel').onclick=()=>stopDictation(false);

/* Help remains available in My Life and Settings. */
let helpReturnFocus=null;
function openHelp(){helpReturnFocus=document.activeElement;$('help-sheet').hidden=false;$('help-wrong').focus()}
function closeHelp(){$('help-sheet').hidden=true;helpReturnFocus?.focus()}
$('tab-help').onclick=openHelp;$('settings-help').onclick=openHelp;$('help-close').onclick=closeHelp;
$('help-sheet').addEventListener('click',e=>{if(e.target.id==='help-sheet')closeHelp()});
$('help-wrong').onclick=()=>{closeHelp();ask('Something went wrong: ',false)};
$('help-journeys').onclick=()=>{closeHelp();tab('journeys')};
$('help-staff').onclick=()=>{$('help-sheet').hidden=true;$('staff-card').hidden=false;$('staff-close').focus()};
$('staff-close').onclick=()=>{$('staff-card').hidden=true;helpReturnFocus?.focus()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('staff-card').hidden)$('staff-close').click();else if(!$('add-sheet').hidden)closeAdd();else if(!$('help-sheet').hidden)closeHelp()}});
/* Links Orivia attaches to a reply */
function resources(items){let holder=$('journey-actions');if(!holder){holder=document.createElement('div');holder.id='journey-actions';holder.style.cssText='display:grid;gap:8px;font-size:13px';$('history').after(holder)}holder.replaceChildren();if(!Array.isArray(items))return;for(const x of items.slice(0,7)){try{const url=new URL(x.url);const deviceGeo=url.protocol==='geo:'&&x.handoff==='geo'&&url.href.startsWith('geo:0,0?q=');const approvedHttps=url.protocol==='https:'&&['www.google.com','maps.apple.com','rta.ae','www.rta.ae','www.uowdubai.ac.ae','www.hw.ac.uk','hw.ac.uk'].includes(url.hostname);if(!deviceGeo&&!approvedHttps)continue;const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=String(x.title||'Open source');link.style.cssText='display:block;padding:10px;border:1px solid var(--line);border-radius:12px;color:var(--focus)';holder.append(link)}catch(_){}}}
/* ===== Research display =====
   Shows only sources the server approved and opened (liveSources). Labels follow the agreed wording:
   "Official source" / "Organisation source" (later "Community experiences"); "Opened" = retrieved, not
   comprehensively verified; claims are "Source-backed" (an exact quote, not proof of interpretation). */
/* A listing site is cited for names to check, never as proof. */
const SOURCE_KIND={document:'Your document',university:'From your university',official:'Official source',government:'Official source',organisation:'Organisation source',institution:'Organisation source',operator:'Organisation source',business:'Organisation source',transport:'Organisation source',directory:'Listing site',community:'People’s experiences'};
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
  const a=document.createElement('a');a.className='cite';a.href=seg.src.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=sourceLetter(seg.src);a.title=seg.src.host;a.setAttribute('aria-label','Source: '+seg.src.title+' (opens '+seg.src.host+')');return a;
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
/* Ina's presentation module (docs/team-workflow.md): used when present; today's rendering otherwise or if it fails. */
/* The first letter of a source's site (rta.ae → R), shown in a small circle instead of a number. */
function sourceLetter(src){if(src&&src.category==='document')return '📄';const h=String(src&&src.host||'').replace(/^www\./,'');const c=Array.from(h)[0]||'•';return c.toLocaleUpperCase()}
function researchBlock(srcs,research){
 try{const custom=window.OriviaPresentation?.renderSources?.({sources:srcs,claims:Array.isArray(research?.claims)?research.claims:[],research:research||{},language:uiLanguage()});if(custom instanceof Node)return custom}catch(_){}
 const box=document.createElement('section');box.className='research';box.setAttribute('aria-label','Sources for this reply');
 const r=research||{};
 if(RESEARCH_NOTE[r.status]){const n=el('p','rnote '+(r.status==='partial'?'partial':'warn'),RESEARCH_NOTE[r.status]);box.append(n)}
 const evidence=document.createElement('details');evidence.className='research-evidence';
 evidence.append(el('summary','',uiText('Sources')+(srcs.length?' ('+srcs.length+')':'')));
 if(srcs.length){
  const links=el('ol','source-buttons');links.setAttribute('aria-label','Open source websites');
  srcs.forEach((s,i)=>{
   const li=document.createElement('li'),a=el('a','source-button');
   a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';
   a.setAttribute('aria-label','Source: '+s.kind+' — '+s.title+' (opens '+s.host+' in a new tab)');
   a.title=s.kind+' — '+s.title;
   a.append(el('span','source-button-n',sourceLetter(s)),el('span','source-button-host',s.host),el('span','source-button-arrow','↗'));
   li.append(a);links.append(li);
  });
  evidence.append(links);
  evidence.append(el('p','rhead',uiText('Sources')));
  const ol=document.createElement('ol');ol.className='sources-list';
  srcs.forEach((s,i)=>{
   const li=document.createElement('li');const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.className='src';
   const top=el('span','src-top');top.append(el('span','src-n',String(i+1)),el('span','src-kind '+(s.kind==='Official source'?'official':s.kind==='Listing site'?'listing':'org'),uiText(s.kind)));
   const when=s.checkedAt&&Number.isFinite(Date.parse(s.checkedAt))?new Date(s.checkedAt).toLocaleString(uiLanguage(),{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'';
   a.append(top,el('strong','',s.title),el('span','src-meta',s.host+(when?' · Opened by Orivia '+when:'')+' ↗'));
   li.append(a);ol.append(li);
  });
  evidence.append(ol,el('p','tiny',uiText('“Opened” means Orivia read this page for your question. It doesn’t mean every requirement has been verified.')));
 }
 const claims=(r.claims||[]).filter(c=>srcs.some(s=>s.id&&s.id===c.sourceId));
 if(claims.length){
  const det=document.createElement('details');det.className='claims';det.append(el('summary','',uiText('Source-backed: see the quotes')));
  for(const c of claims){
   const from=srcs.find(s=>s.id===c.sourceId)?.host||'the source';const d=el('div','claim');d.append(el('p','',c.text));
   if(c.quotes&&c.quotes.length>1){ // one quote per fact in the claim, each labelled
    const ul=document.createElement('ul');ul.className='claim-quotes';
    for(const q of c.quotes){const li=document.createElement('li');if(q.label)li.append(el('span','q-label',q.label));li.append(el('blockquote','','“'+q.quote+'”'));ul.append(li)}
    d.append(ul,el('p','tiny','Each part of this point is quoted from '+from+'. The quotes support it but don’t guarantee it applies to your situation.'));
   }else{
    d.append(el('blockquote','','“'+((c.quotes&&c.quotes[0]&&c.quotes[0].quote)||c.quote)+'”'),el('p','tiny','Quote from '+from+'. A quote supports the point but doesn’t guarantee it applies to your situation.'));
   }
   det.append(d);
  }
  evidence.append(det);
 }
 if((r.unresolved||[]).some(x=>TOPIC_LABEL[x])){ // unknown codes are never shown as a vague placeholder
  const u=el('div','unresolved');u.append(el('p','rhead',uiText('Couldn’t confirm')));const ul=document.createElement('ul');
  for(const x of [...new Set(r.unresolved)])if(TOPIC_LABEL[x])ul.append(el('li','',TOPIC_LABEL[x]));
  u.append(ul);box.append(u);
 }
 if(r.applicability==='needs-review'&&srcs.length)evidence.append(el('p','tiny',uiText('Check it applies to you: rules can differ by institution, age, visa type or emirate.')));
 if(srcs.length||claims.length)box.append(evidence);
 return box;
}

/* ===== Settings: saved in this browser ===== */
const settingsKey='orivia-private-settings-v1';
const SET_DEFAULT={theme:'system',size:'standard',tone:'friendly',suggest:true};
setupDictation();
function readSettings(){try{const d=JSON.parse((globalThis.OriviaAccountStorage?.storage||localStorage).getItem(settingsKey)||'{}');return {...SET_DEFAULT,...(d&&typeof d==='object'?d:{})}}catch(_){return {...SET_DEFAULT}}}
function writeSettings(patch){const n={...readSettings(),...patch};try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(settingsKey,JSON.stringify(n))}catch(_){}applySettings();renderSettings()}
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
 $('app-language').value=$('welcome-language').value=uiLanguage();
 $('set-suggest').checked=s.suggest!==false;
 $('set-voice').checked=s.naturalVoice!==false;$('voice-row').hidden=!naturalVoiceServer||!pilotConsent();
 const on=aboutMeOn(),p=readProfile(),filled=!!(p&&(p.city||p.who||p.place));$('set-aboutme-use').checked=on;
 $('aboutme-state').textContent=on?(filled?'On: Orivia uses what you saved in My Life':'On, but nothing saved yet. Add details in My Life'):'Off: Orivia doesn’t use My Life details';
}
function changeAppLanguage(e){window.OriviaI18n?.setLanguage(e.target.value);writeSettings({language:uiLanguage()});regionNames=makeRegionNames();countryOptions=null;draw();renderEvents();renderUpcoming();renderChats();renderJourneys();loadProfile();renderHome();$('view-title').textContent=uiText(TITLES[lastTab||'chat'])}
$('app-language').addEventListener('change',changeAppLanguage);$('welcome-language').addEventListener('change',changeAppLanguage);$('app-language').value=$('welcome-language').value=uiLanguage();
$('set-suggest').addEventListener('change',e=>writeSettings({suggest:e.target.checked}));
$('life-library-open')?.addEventListener('click',()=>tab('library'));
$('attach').addEventListener('click',openAttach);$('attach-file').addEventListener('change',e=>attachFrom(e.target));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('attach-panel').hidden&&!attachOp&&!attachConfirm){closeAttach();$('attach').focus()}});
$('set-voice').addEventListener('change',e=>{writeSettings({naturalVoice:e.target.checked});if(!e.target.checked)stopSpeaking()});
$('set-aboutme').onclick=()=>tab('mylife');
$('set-aboutme-use').addEventListener('change',e=>{setAboutMe(e.target.checked);renderSettings()});
$('open-settings').onclick=()=>tab('settings');
$('settings-back').onclick=()=>tab(lastTab||'chat');
$('life-settings').onclick=()=>tab('settings');
$('account-open').onclick=()=>window.OriviaAccounts?.open();
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
 try{const d=JSON.parse((globalThis.OriviaAccountStorage?.storage||localStorage).getItem(journeysKey)||'{}');if(!d||typeof d!=='object'||Array.isArray(d))return {};
  for(const v of Object.values(d)){
   if(!v||typeof v!=='object')continue;
   if(v.status==='following')v.status='active';
   if(!v.stepStatus||typeof v.stepStatus!=='object')v.stepStatus={};
   if(Array.isArray(v.done)){for(const s of v.done)v.stepStatus[s]='done';delete v.done} // older saves
  }
  return d}catch(_){return {}}
}
function writeJourneys(d){try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(journeysKey,JSON.stringify(d))}catch(_){}}
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
const reviewed=iso=>{const t=Date.parse(iso);return Number.isFinite(t)?new Date(t).toLocaleDateString(uiLanguage(),{day:'numeric',month:'short',year:'numeric'}):''};
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function button(label,cls,fn){const b=el('button',cls,uiText(label));b.type='button';b.onclick=fn;return b}
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
  const rm=button('Remove','btn text small danger',()=>{
   const hasProgress=Object.keys(mine.stepStatus||{}).length>0||status==='done';
   if(hasProgress&&rm.dataset.sure!=='1'){rm.dataset.sure='1';rm.textContent=uiText('Tap again: removes it and its progress from this device');return}
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
  if(!items.length)root.append(el('p','empty',uiText('No journeys yet. Explore below, or ask Orivia what you need help with.')));
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
 let all;try{all=await loadLibrary()}catch(_){list.replaceChildren(el('p','notice',uiText('Couldn’t load the guide library just now. Please try again.')));return}
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
 if(!shown.length)list.append(el('p','notice',uiText('No guides match that yet. Try another word, or ask Orivia.')));
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
 tab('guide');const body=$('guide-body');body.replaceChildren(el('p','notice',uiText('Opening your guide…')));
 let g;try{g=await loadGuide(id)}catch(_){body.replaceChildren(el('p','notice',uiText('I couldn’t open this guide just now. Please try again.')),button('← Journeys','ask',()=>tab('journeys')));return}
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
  if(!mine){const f=el('div','row');f.append(button('Follow this guide','btn small',()=>{setJourney(id,{status:'active',step:i,stepTitle:s.title,stepStatus:{},title:g.title,steps:g.steps.length,titles});draw()}),button('Save for later','btn quiet small',()=>{setJourney(id,{status:'saved',step:0,stepStatus:{},title:g.title,steps:g.steps.length,titles});draw()}));body.append(f,el('p','tiny',uiText('You’re previewing. Follow it to keep track of each step; progress is saved on this device.')))}
  if(status==='paused'){const p=el('div','banner');p.append(el('span','',uiText('This journey is paused. Your progress is kept.')),button('Resume','btn small',()=>{setJourney(id,{status:'active'});draw()}));body.append(p)}
  body.append(el('p','tiny','Step '+(i+1)+' of '+g.steps.length+(mine?' · '+n+' done':'')),bar(mine?n:i+1,g.steps.length,mine?undefined:'Step '+(i+1)+' of '+g.steps.length));
  /* All steps, with the person's own statuses; tap one to read it */
  const all=el('details','steps');all.append(el('summary','',uiText('All steps')));const ol=el('ol');
  g.steps.forEach((x,k)=>{const st=ss[x.id]||'not_started';const li=el('li');const b=button('','linkish'+(k===i?' here':''),()=>go(k));
   b.append(el('span','mark '+st,STEP_MARK[st]),el('span','',x.title));if(mine&&st!=='not_started')b.append(el('span','tiny',' · '+STEP_LABEL[st]));if(k===i)b.setAttribute('aria-current','step');li.append(b);ol.append(li)});
  all.append(ol);body.append(all);
  /* The step, in sections */
  const card=el('section','step');
  const sh=el('div','jtop');sh.append(el('p','kicker','Step '+(i+1)));if(mine)sh.append(el('span','sstate '+cur,STEP_LABEL[cur]));card.append(sh,el('h3','',s.title));
  const about=s.info.slice(0,2).map(p=>el('p','',p));
  if(s.info.length>2){const more=el('details','more-text');more.append(el('summary','',uiText('Read more')),...s.info.slice(2).map(p=>el('p','',p)));about.push(more)}
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
   const box=el('section','statusbox');box.append(el('h4','',uiText('Where are you with this step?')));
   const opts2=el('div','seg');opts2.setAttribute('role','radiogroup');opts2.setAttribute('aria-label','Status of '+s.title);
   for(const st of s.statuses){const b=button(STEP_LABEL[st],'seg-btn'+(cur===st?' on':''),()=>{store({stepStatus:{...ss,[s.id]:st},stepTitle:s.title,step:i});opts.keepScroll=true;draw()});b.setAttribute('role','radio');b.setAttribute('aria-checked',String(cur===st));opts2.append(b)}
   box.append(opts2);
   if(cur==='unsure'){box.append(el('p','hint','That’s okay. It won’t count as done.'+(s.confirm?' How to check: '+s.confirm:'')));const a=button('Ask Orivia to help me check','ask',()=>{});a.dataset.ask='I’m not sure about this step of “'+g.title+'”: '+s.title;box.append(a)}
   if(cur==='waiting')box.append(el('p','hint',s.waitingFor?'Waiting for: '+s.waitingFor:'Marked as waiting. You can come back to it any time.'));
   if(cur==='done'&&i<g.steps.length-1)box.append(el('p','hint',uiText('Nice. Go to the next step when you’re ready.')));
   body.append(box);
  }
  const nav=el('div','row spread');
  nav.append(i>0?button('← Previous','btn quiet small',()=>go(i-1)):el('span'));
  nav.append(i<g.steps.length-1?button('Next step →','btn small',()=>go(i+1)):button('Back to Journeys','btn quiet small',()=>tab('journeys')));
  body.append(nav);
  if(status==='active'&&n===g.steps.length){const fin=el('div','banner');fin.append(el('span','',uiText('Every step is marked done. Finished with this guide?')),button('Mark journey completed','btn small',()=>{setJourney(id,{status:'done'});draw()}));body.append(fin)}
  if(status==='done')body.append(el('p','tiny',uiText('You marked this journey completed. That’s your own record, not official confirmation of any outcome.')));
  if(g.problems.length){body.append(el('h3','',uiText('Things that might go wrong')));for(const p of g.problems){const det=el('details','problem');det.append(el('summary','',p.question));if(p.answer)det.append(el('p','',p.answer));
   if(p.steps.length){const ol2=el('ol');for(const x of p.steps){const li=el('li');li.append(el('strong','',x.title));if(x.body)li.append(el('p','',x.body));const sub=list(x.list);if(sub)li.append(sub);if(x.tip)li.append(el('p','tiny',x.tip));ol2.append(li)}det.append(ol2)}
   if(opts.problem===p.id){det.open=true;setTimeout(()=>det.scrollIntoView({block:'center'}),0)}body.append(det)}}
  body.append(el('h3','',uiText('Official sources')));
  const src=el('ul','sources');for(const x of g.sources){const li=el('li');const a=el('a','',x.name+' ↗');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);src.append(li)}
  body.append(src,el('p','tiny','Guide reviewed '+reviewed(g.checkedAt)+'. That’s a review of the whole guide, not a live check of every detail.'));
  if(!opts.problem&&!opts.keepScroll)body.parentElement.scrollTop=0;
  opts.keepScroll=false;
 };
 draw();
}
$('j-search').addEventListener('input',()=>renderLibrary());
$('back-chat').onclick=()=>tab(guidesReturnTab||'mylife');
for(const [t,u,sub] of OFFICIAL){const a=el('a','link-card');a.href=u;a.target='_blank';a.rel='noopener noreferrer';const s=el('span');s.append(el('strong','',t),el('small','tiny',sub));a.append(s,document.createTextNode('↗'));$('officials').append(a)}
renderJourneys();
/* Calendar form (Calendar section) */
$('reminder-form').addEventListener('submit',event=>{
 event.preventDefault();
 const title=$('reminder-title').value.trim().slice(0,100);
 const at=new Date($('reminder-date').value+'T'+($('reminder-time').value||'09:00'));
 if(!title||!Number.isFinite(at.getTime())||at.getTime()<Date.now()+60000||at.getTime()>Date.now()+366*86400000){
  $('reminder-status').textContent=uiText('Please choose a time in the future, within the next year.');return
 }
 const alarm=Number($('reminder-alarm').value);
 const saved={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),title,at:at.toISOString(),alarm:ALARMS.some(([m])=>m===alarm)?alarm:30};
 events.push(saved);storeEvents();
 selectedDay=null;weekOffset=0;closeAdd();renderEvents();renderUpcoming();
 flash('Saved in Orivia. Tap “Add to phone calendar” to get an alert on your phone.');
});
/* Message box grows with the text; Enter sends, Shift+Enter adds a line */
function grow(){const m=$('msg');m.style.height='auto';m.style.height=Math.min(m.scrollHeight,192)+'px';m.style.overflowY=m.scrollHeight>192?'auto':'hidden'}
$('msg').addEventListener('input',grow);
$('msg').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('form').requestSubmit()}});
function chip(label,fn){const holder=$('journey-actions')||(resources([]),$('journey-actions'));const b=document.createElement('button');b.type='button';b.className='action-chip';b.textContent=label;b.onclick=fn;holder.append(b)}
/* Public beta: same app, plus a one-time "I'm human" check (Cloudflare Turnstile) before the first message */
let mode='private',humanOk=true,humanState='idle',startRequested=false,humanAttempt=0;
function enterApp(){
 if(!$('consent').checked||!humanOk)return;
 startRequested=false;$('consent').checked=false;setAgreed(true);show();
}
/* On failure, say why and let the person retry: never loop the check by itself */
function humanFailed(msg){
 humanOk=false;humanState='failed';startRequested=false;
 const n=$('human-note');n.replaceChildren(document.createTextNode(msg+' '));
 const b=document.createElement('button');b.type='button';b.className='ask';b.textContent=uiText('Try again');
 b.onclick=()=>{humanState='checking';n.textContent=uiText('Checking again…');try{window.turnstile.reset('#human-check')}catch(_){humanFailed('Couldn’t restart the check. Please reload Orivia.')}};n.append(b);
 const f=framedFullScreen();if(f)n.append(' ',f);
}
/* Inside the website preview some browsers (notably iPhone Safari) won't keep the human-check cookie. Offer the full app. */
function framedFullScreen(){if(window.top===window)return null;const a=document.createElement('a');a.href=(location.pathname.startsWith('/app')?'/app':'/');a.target='_blank';a.rel='noopener';a.className='ask';a.textContent=uiText('Open Orivia full screen');return a}
function loadTurnstile(siteKey){
 humanOk=false;humanState='checking';window.__siteKey=siteKey;$('human-check').hidden=false;$('human-note').hidden=false;
 const go=()=>window.turnstile.render('#human-check',{sitekey:siteKey,'error-callback':code=>{humanFailed('The check couldn’t load (code: '+String(code).slice(0,12)+').');return true},callback:async token=>{
  const attempt=++humanAttempt;humanOk=false;humanState='verifying';$('human-note').textContent=uiText('Confirming your check with Orivia…');
  try{const r=await fetch('/v1/human',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),signal:AbortSignal.timeout(15000)});if(attempt!==humanAttempt)return;humanOk=r.ok;
   if(r.ok){humanState='verified';$('human-note').textContent=uiText('Thanks, you’re all set.');if(startRequested)enterApp();return}
   const d=await r.json().catch(()=>({}));const code=Array.isArray(d.codes)&&d.codes.length?' (code: '+d.codes.join(', ')+')':(r.status===403&&d.error==='Origin not allowed'?' (code: origin)':' (code: '+r.status+')');
   humanFailed('That check didn’t work'+code+'.');
  }catch(_){if(attempt===humanAttempt)humanFailed('Couldn’t confirm the check with Orivia. Please try again.')}
 }});
 if(window.turnstile)return go();
 const sc=document.createElement('script');sc.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';sc.async=true;sc.onload=go;sc.onerror=()=>humanFailed('The human check couldn’t load. Please try reloading Orivia.');document.head.append(sc);
}
/* Private research pilot: shown only when this private deployment offers it; off unless the tester ticks it. The consent names
   OpenAI and is versioned, so a changed pilot never reuses an older tick. Stored on this device only. */
const pilotKey='orivia-pilot-consent';let pilotOffer=null,publicProviderOffered=false,pilotAgree='';
/* Entry agreement: remembered per account or guest on this browser (account-scoped storage) for the consent version this
   deployment shows, so it's asked again only when that version changes, not on refresh or in a new tab. Decide only after
   /v1/config has said which version applies (window.OriviaConsent.ready). */
const entryKey='orivia-entry-consent';
function entryStore(){return globalThis.OriviaAccountStorage?.storage||localStorage}
function consentVersion(){return publicProviderOffered&&pilotOffer?pilotOffer:'private-entry-v1'}
function agreed(){try{return entryStore().getItem(entryKey)===consentVersion()&&(!publicProviderOffered||entryStore().getItem(pilotKey)===pilotOffer)}catch(_){return sessionStorage.getItem(ck)==='yes'}}
function setAgreed(on){try{if(on){entryStore().setItem(entryKey,consentVersion());if(publicProviderOffered&&pilotOffer)entryStore().setItem(pilotKey,pilotOffer)}else entryStore().removeItem(entryKey)}catch(_){}try{on?sessionStorage.setItem(ck,'yes'):sessionStorage.removeItem(ck)}catch(_){}}
function setupPilot(d){
 const p=d&&(d.mode!=='public'||d.publicAssistant===true)&&d.providerPilot&&typeof d.providerPilot==='object'?d.providerPilot:null;
 const row=$('pilot-row');if(!row)return;
 if(!p||p.provider!=='OpenAI'||typeof p.consent!=='string'||!/^[a-z0-9-]{4,60}$/.test(p.consent)){pilotOffer=null;row.hidden=true;return}
 pilotOffer=p.consent;pilotAgree=typeof p.agree==='string'?p.agree.slice(0,200):'';row.hidden=false;$('pilot-text').textContent=String(p.text||'').slice(0,1400);
 publicProviderOffered=d.publicAssistant===true;
 if(publicProviderOffered&&!$('public-provider-consent')){const note=document.createElement('div');note.id='public-provider-consent';note.className='notice';if(typeof p.heading==='string')note.append(Object.assign(document.createElement('strong'),{textContent:p.heading.slice(0,60)}));for(const para of String(p.text||'').slice(0,1400).split('\n\n'))note.append(Object.assign(document.createElement('p'),{textContent:para}));$('consent').parentElement.before(note)}
 if(publicProviderOffered)publicConsentCopy(typeof p.agree==='string'?p.agree.slice(0,200):'');
 let saved='';try{saved=(globalThis.OriviaAccountStorage?.storage||localStorage).getItem(pilotKey)||''}catch(_){}
 $('set-pilot').checked=saved===pilotOffer;
 if(publicProviderOffered&&saved!==pilotOffer){setAgreed(false);$('workspace').hidden=true;$('nav').hidden=true;$('intro').hidden=!!$('account-entry')&&!$('account-entry').hidden}
 $('set-pilot').onchange=e=>{try{if(e.target.checked)(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(pilotKey,pilotOffer);else (globalThis.OriviaAccountStorage?.storage||localStorage).removeItem(pilotKey)}catch(_){}researchNotice()};
 researchNotice();
}
/* Public release: one honest consent. The device paragraph no longer claims Workers AI only, and the tick box says it
   includes OpenAI (with Workers AI as a backup when OpenAI is unavailable). The same wording is kept for accounts.js,
   which re-applies data-device-copy. */
function publicConsentCopy(agreeText){
 const card=$('consent')?.closest('.card'),intro=card?.querySelector('p[data-device-copy]');
 const device='Your chats are saved in this browser on this device so you can come back to them. They aren’t stored in Orivia’s database.';
 if(intro){intro.dataset.deviceCopy=device;intro.dataset.accountCopy='Signed-in chats and plans are saved to my private Orivia account.';intro.textContent=device}
 const label=$('consent')?.parentElement?.querySelector('span'),agree=agreeText||'I agree to start using Orivia, including sending my messages to OpenAI as described above (or to Cloudflare Workers AI if OpenAI is unavailable).';if(label){label.dataset.public=agree;label.textContent=agree}
 for(const n of document.querySelectorAll('#settings-view p[data-device-copy]'))if(/Workers AI/.test(n.dataset.deviceCopy)){const t=n.dataset.deviceCopy.replace('Messages are sent to Cloudflare Workers AI to get a reply.','Messages are sent to OpenAI (with your agreement) or, if it’s unavailable, Cloudflare Workers AI to get a reply.');n.dataset.deviceCopy=t;n.textContent=t}
}
function pilotConsent(){if(!pilotOffer)return null;try{return (globalThis.OriviaAccountStorage?.storage||localStorage).getItem(pilotKey)===pilotOffer?{openai:pilotOffer}:null}catch(_){return null}}
async function loadMode(){
 try{const r=await fetch('/v1/config',{credentials:'same-origin',cache:'no-store'});const d=await r.json();
  setupPilot(d);
  naturalVoiceServer=d?.naturalVoice===true;documentsServer=d?.documents===true;filesServer=d?.files===true;try{showLibraryFiles()}catch(_){}try{renderDocContext()}catch(_){}
  // Reveal the intro now that its wording is right, and before the human check renders: Turnstile stalls if it starts hidden.
  document.body.dataset.config='ready';
  if(d&&d.mode==='public'){mode='public';document.body.dataset.mode='public';for(const n of document.querySelectorAll('[data-public]'))n.textContent=n.dataset.public;if(!$('intro').hidden&&d.turnstileSiteKey)loadTurnstile(d.turnstileSiteKey);else window.__siteKey=d.turnstileSiteKey}
  return d;
 }catch(_){return null}
 finally{document.body.dataset.config='ready'}
}
const modeReady=loadMode();
window.OriviaConsent={agreed,ready:modeReady};
/* Integrated onboarding consent: move the existing controls, never clone the human widget. */
let onboardingConsentCard=null;
function releaseOnboardingConsent(){
 if(onboardingConsentCard){$('intro').append(onboardingConsentCard);$('start').hidden=false}
}
async function mountOnboardingConsent(root){
 const config=await modeReady;if(!root.isConnected)return;
 if(!config){root.append(document.createTextNode(uiText('Could not load the privacy and verification settings. Please reload before starting.')));return}
 onboardingConsentCard=onboardingConsentCard||$('consent').closest('.card');$('consent').checked=false;
 const info=onboardingConsentCard.querySelector('p[data-device-copy]');
 const device='Your chats and plans stay in this browser on this device. General search terms go to Brave Search, not your full conversation or ID numbers.';
 const account='Your personal chats and plans are saved to your private Orivia account. General search terms go to Brave Search, not your full conversation or ID numbers.';
 if(info&&pilotAgree)info.hidden=true; // the server's consent notice already covers storage and search
 else if(info){info.dataset.deviceCopy=device;info.dataset.accountCopy=account;info.textContent=uiText(window.OriviaAccounts?.user?account:device)}
 const label=$('consent').parentElement.querySelector('span');
 const agree=pilotAgree||(pilotOffer?'I agree to send my messages and recent conversation to OpenAI, or Cloudflare Workers AI if OpenAI is unavailable.':'I agree to send my messages and recent conversation to Cloudflare Workers AI.');
 if(label){delete label.dataset.public;label.textContent=uiText(agree)}
 $('start').hidden=true;root.append(onboardingConsentCard);
 if(mode==='public'&&window.__siteKey&&humanState==='idle')loadTurnstile(window.__siteKey);
 // Moving the card reloads the check's frame, which leaves an already-started Cloudflare check stuck: start it again.
 else if(mode==='public'&&humanState==='checking'&&window.turnstile){try{window.turnstile.reset('#human-check')}catch(_){}}
}
async function authorizeOnboardingStart(){
 const config=await modeReady;
 if(!config){$('account-flow-status').textContent=uiText('Could not load the privacy and verification settings. Please reload before starting.');return false}
 if(!$('consent').checked){$('account-flow-status').textContent=uiText('Please agree to AI processing before starting.');return false}
 if(!humanOk){$('account-flow-status').textContent=uiText('Please complete the human check before starting.');return false}
 try{
  if(pilotOffer){(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(pilotKey,pilotOffer);$('set-pilot').checked=true}
  setAgreed(true);startRequested=false;return true;
 }catch(_){$('account-flow-status').textContent=uiText('Please allow browser storage before starting Orivia.');return false}
}
/* End integrated onboarding consent. */
queueMicrotask(()=>{
 if(!window.OriviaAccounts){modeReady.then(()=>{if(agreed())show()});return}
 window.OriviaAccounts.boot({photos:()=>DESTINATION_PHOTOS,
  leave(){try{cancelAttach()}catch(_){}releaseOnboardingConsent();stopSpeaking();stopDictation(false);closeHandoff()},
  cancelReply(){activeChatRequest?.abort()},
  mountStart:mountOnboardingConsent,authorizeStart:authorizeOnboardingStart,
  reload(){turns=[];storeLocked=false;$('msg').value='';$('home-question').value='';clearChatCards();loadEvents();show();window.OriviaAccounts.copy()}
 });
});
$('start').onclick=()=>{
 if(!$('consent').checked)return;
 if(publicProviderOffered&&pilotOffer){try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(pilotKey,pilotOffer);$('set-pilot').checked=true}catch(_){$('human-note').textContent=uiText('Please allow browser storage before starting Orivia.');return}}
 if(!humanOk){
  if(humanState==='failed')return; // keep the actual error and Try again button
  startRequested=true;$('human-note').textContent=humanState==='verifying'?'Confirming your check with Orivia… We’ll open it when this finishes.':'Please complete the quick check above. We’ll open Orivia when it’s confirmed.';return
 }
 enterApp()};
$('clear').onclick=()=>{
 if(busy)return;const b=$('clear');
 if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent=uiText('Tap again to delete this chat');setTimeout(()=>{b.dataset.sure='';b.textContent=uiText('Delete this chat')},4000);return}
 store.chats=store.chats.filter(c=>c.id!==store.active);store.active=null;persist();turns=[];clearChatCards();draw();renderChats();b.dataset.sure='';b.textContent=uiText('Delete this chat');tab('chat')};
// A proposal only. Saved events are never sent to the model and never changed by this module.
function safeCalendarChange(v){
 if(!v||typeof v!=='object'||!['update','delete'].includes(v.kind))return null;
 const str=(x,n)=>typeof x==='string'?x.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n):'';
 const date=str(v.date,10),time=str(v.time,5);
 if(date){if(date!==String(v.date).trim())return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;const d=new Date(date+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date)return null}
 if(time&&time!==String(v.time).trim())return null;
 if(time&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))return null;
 return {kind:v.kind,target:str(v.target,100),date:date||null,time:time||null,title:str(v.title,100)||null,question:str(v.question,180),needsTime:v.needsTime===true,needsDate:v.needsDate===true};
}
/* Calendar changes are proposals: match, review and commit on this device, never in the model. */
function calendarSnapshot(e){return JSON.stringify({id:e.id,title:e.title,at:e.at,alarm:e.alarm})}
function calendarForChanges(){
 const raw=(globalThis.OriviaAccountStorage?.storage||localStorage).getItem(eventKey);if(raw===null)return [];
 const list=JSON.parse(raw);
 if(!Array.isArray(list)||list.some(e=>!e||typeof e.id!=='string'||typeof e.title!=='string'||!Number.isFinite(Date.parse(e.at))))throw Error('unreadable');
 if(new Set(list.map(e=>e.id)).size!==list.length)throw Error('duplicate ids');
 return list;
}
function commitCalendarChanges(next){
 const raw=JSON.stringify(next);(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(eventKey,raw);
 if((globalThis.OriviaAccountStorage?.storage||localStorage).getItem(eventKey)!==raw)throw Error('save not confirmed');
 events=next;renderEvents();renderUpcoming();
}
function calendarCandidates(proposal,list,previous){
 const normal=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const target=normal(proposal.target),tokens=target.split(' ').filter(w=>w.length>1&&!['my','the','reminder','appointment','event'].includes(w));
 if(tokens.length){const matches=list.filter(e=>{const name=normal(e.title);return name===target||tokens.every(w=>name.split(' ').includes(w))});return {items:matches.length?matches:list,exact:matches.length>0}}
 const last=[...previous].reverse().find(t=>t.role==='assistant'&&(t.meta?.reminder?.id||t.meta?.calendarChange?.after?.id));
 const id=last?.meta?.calendarChange?.after?.id||last?.meta?.reminder?.id;
 const match=list.find(e=>e.id===id);return {items:match?[match]:list,exact:!!match};
}
function calendarChangeBox(t){
 const state=t.meta.calendarChange,proposal=safeCalendarChange(state?.proposal);
 if(!proposal)return null;
 const box=el('section','event');box.setAttribute('aria-label','Review calendar change');
 const note=el('p','tiny',uiText('Only Orivia’s calendar on this device changes. If you copied this event to another calendar, update it there too.'));
 const fail=el('p','tiny');fail.setAttribute('role','status');
 if(state.status==='applied'||state.status==='undone'){
  const event=state.after||state.before;
  box.append(el('strong','',uiText(state.status==='undone'?'Change undone':proposal.kind==='delete'?'Reminder deleted':'Reminder updated')),el('p','',String(event?.title||'')),note,fail);
  if(state.status==='applied')box.append(button('Undo','btn quiet small',()=>{
   try{
    const list=calendarForChanges(),current=list.find(e=>e.id===state.before.id);
    if(proposal.kind==='delete'){
     if(current){fail.textContent='A reminder with that ID already exists. Nothing was overwritten.';return}
     list.push({...state.before});
    }else{
     if(!current||calendarSnapshot(current)!==calendarSnapshot(state.after)){fail.textContent=uiText('This reminder changed again, so Undo won’t overwrite it. Open My calendar to review it.');return}
     list[list.indexOf(current)]={...state.before};
    }
    commitCalendarChanges(list);state.status='undone';t.content=uiText('Undid that change in Orivia’s calendar on this device.');save();draw();
   }catch(_){fail.textContent=uiText('I couldn’t confirm the calendar was saved. Please check My calendar before retrying.')}
  }));
  return box;
 }
 if(state.status==='cancelled'){box.append(el('p','tiny',uiText('Change dismissed. No reminder was changed.')));return box}
 let list;try{list=calendarForChanges()}catch(_){box.append(el('p','tiny',uiText('I couldn’t read your saved calendar safely. Nothing has been changed.')));return box}
 if(!list.length){box.append(el('p','tiny',uiText('There are no saved reminders on this device to change.')));return box}
 const index=turns.indexOf(t),matched=calendarCandidates(proposal,list,turns.slice(0,index<0?0:index));
 box.append(el('strong','',uiText(proposal.kind==='delete'?'Which reminder should I delete?':'Review the reminder to change')));
 if(!matched.exact)box.append(el('p','tiny',uiText('Choose the saved reminder you mean.')));
 if(proposal.question)box.append(el('p','',proposal.question));
 const label=el('label','',uiText('Saved reminder')),select=document.createElement('select');label.append(select);box.append(label);
 select.setAttribute('aria-label','Saved reminder');
 const blank=document.createElement('option');blank.value='';blank.textContent=uiText('Choose a reminder');select.append(blank);
 for(const e of matched.items){const o=document.createElement('option');o.value=e.id;o.textContent=e.title+' · '+when(e);select.append(o)}
 const editor=el('div','calendar-change-editor');box.append(editor,note,fail);
 const update=()=>{
  editor.replaceChildren();fail.textContent='';const before=matched.items.find(e=>e.id===select.value);if(!before)return;
  const original=calendarSnapshot(before),expected={...before};
  let title,date,time;
  if(proposal.kind==='update'){
   const field=(text,type,value)=>{const l=el('label','',uiText(text)),input=document.createElement('input');input.type=type;input.value=value;l.append(input);editor.append(l);return input};
   const d=new Date(before.at);
   title=field('Reminder title','text',proposal.title||before.title);title.maxLength=100;
   date=field('New date','date',proposal.needsDate?'':proposal.date||dayKey(d));
   const pad=n=>String(n).padStart(2,'0');time=field('New time (this device’s time zone)','time',proposal.needsTime?'':proposal.time||pad(d.getHours())+':'+pad(d.getMinutes()));
  }else editor.append(el('p','',before.title+' · '+when(before)));
  editor.append(button(proposal.kind==='delete'?'Delete this reminder':'Save changes',proposal.kind==='delete'?'btn small danger':'btn small',()=>{
   try{
    const fresh=calendarForChanges(),current=fresh.find(e=>e.id===expected.id);
    if(!current||calendarSnapshot(current)!==original){fail.textContent=uiText('This reminder changed or was removed. Choose it again to review the latest version.');return}
    let after=null;
    if(proposal.kind==='update'){
     const at=new Date(date.value+'T'+time.value);
     if(!title.value.trim()||!date.value||!time.value||!Number.isFinite(at.getTime())||dayKey(at)!==date.value||at.getTime()<Date.now()+60000||at.getTime()>Date.now()+366*86400000){fail.textContent=uiText('Choose a title and a future date and time within the next year.');return}
     const pad=n=>String(n).padStart(2,'0');if(pad(at.getHours())+':'+pad(at.getMinutes())!==time.value){fail.textContent=uiText('That local time is unavailable on this date. Choose another time.');return}
     after={...current,title:title.value.trim().slice(0,100),at:at.toISOString()};fresh[fresh.indexOf(current)]=after;
    }else fresh.splice(fresh.indexOf(current),1);
    commitCalendarChanges(fresh);state.before={...current};state.after=after;state.status='applied';t.content=uiText(proposal.kind==='delete'?'Deleted the selected reminder from Orivia’s calendar on this device.':'Updated the selected reminder in Orivia’s calendar on this device.');save();draw();
   }catch(_){fail.textContent=uiText('I couldn’t confirm the calendar was saved. Please check My calendar before retrying.')}
  }));
 };
 select.onchange=update;if(matched.items.length===1){select.value=matched.items[0].id;update()}
 box.append(button('Not now','btn text small',()=>{state.status='cancelled';save();draw()}));
 return box;
}

/* The person's own clock: "tomorrow" and "at 5" mean their day and time zone, not the server's. */
function localNow(){const d=new Date(),p=n=>String(n).padStart(2,'0');let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(_){}
 return {date:d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()),time:p(d.getHours())+':'+p(d.getMinutes()),weekday:d.toLocaleDateString('en-GB',{weekday:'long'}),tz:tz.slice(0,40)}}
/* Calendar buttons that do the right thing on each device: iPhone/iPad open the Calendar app from the .ics file; Android opens
   Google Calendar (an .ics there only downloads); computers get Google Calendar plus the file for Outlook/Apple Calendar. */
function calendarLinks(e){
 const ua=navigator.userAgent||'',ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),android=/Android/i.test(ua);
 const ics=label=>{const a=el('a','dev',label);a.href=deviceCalendarUrl(e);a.setAttribute('aria-label',label+': '+e.title);return a};
 const g=label=>{const a=el('a','dev',label);a.href=googleEvent(e);a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',label+': '+e.title);return a};
 return ios?[ics('Add to iPhone Calendar'),g('Google Calendar ↗')]:android?[g('Add to Google Calendar')]:[g('Add to Google Calendar ↗'),ics('Download for Outlook or Apple Calendar')];
}
/* A reminder Orivia set from the conversation: saved on this device straight away, shown with exactly what was saved,
   Undo, and the phone-calendar buttons. */
/* University dates (21 Oct): saved to the personal calendar only after the person confirms in the university space; tagged
   with the organisation and item so the same date isn't added twice. The university is never told. */
function zoneInstant(date,time,tz){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date))||!/^\d{2}:\d{2}$/.test(String(time||'')))return null;
 const [y,mo,d]=date.split('-').map(Number),[h,mi]=time.split(':').map(Number),wall=Date.UTC(y,mo-1,d,h,mi);
 const offset=at=>{try{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(at)).map(x=>[x.type,x.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)-at}catch(_){return NaN}};
 let at=wall-offset(wall);at=wall-offset(at);return Number.isFinite(at)?new Date(at):null;
}
window.OriviaCalendar={
 instant:zoneInstant,
 hasOrganisationItem(tag){loadEvents();return events.some(e=>e.source?.org===tag.org&&e.source?.content===tag.content)},
 addOrganisationDate(o){
  loadEvents();if(events.some(e=>e.source?.org===o.org&&e.source?.content===o.content))return {ok:false,reason:'duplicate'};
  const at=o.time?zoneInstant(o.date,o.time,o.timeZone):new Date(o.date+'T09:00');
  if(!at||!Number.isFinite(at.getTime()))return {ok:false,reason:'invalid'};if(at.getTime()<Date.now())return {ok:false,reason:'past'};
  const saved={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),title:String(o.title).trim().slice(0,100),at:at.toISOString(),alarm:o.time?60:30,...(o.time?{}:{allDay:true}),source:{org:String(o.org),content:String(o.content),revision:Number(o.revision)||1}};
  events.push(saved);storeEvents();renderEvents();renderUpcoming();return {ok:true,event:saved};
 }
};
function saveChatReminder(r){
 // The assistant sends a date and time on this device's own clock (YYYY-MM-DD, HH:MM); built here as local time.
 if(!r||typeof r.title!=='string')return null;const at=typeof r.at==='string'?new Date(r.at):/^\d{4}-\d{2}-\d{2}$/.test(String(r.date||''))?new Date(r.date+'T'+(/^\d{2}:\d{2}$/.test(String(r.time||''))?r.time:'09:00')):new Date(NaN);
 if(!r.title.trim()||!Number.isFinite(at.getTime())||at.getTime()<Date.now()+60000||at.getTime()>Date.now()+366*86400000)return null;
 const saved={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),title:r.title.trim().slice(0,100),at:at.toISOString(),alarm:ALARMS.some(([m])=>m===r.alarm)?r.alarm:30};
 events.push(saved);storeEvents();renderEvents();renderUpcoming();return saved;
}
function reminderBox(t){
 const saved=t.meta.reminder,live=events.find(e=>e.id===saved.id),r=live||saved,box=el('div','event');box.style.cssText='margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:10px';
 const when=new Date(r.at).toLocaleString(uiLanguage(),{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
 if(!live){box.append(el('p','tiny','Reminder removed: '+r.title));return box}
 box.append(el('strong','','✓ Reminder saved: '+r.title),el('p','tiny',when+' · saved in Orivia on this device. For an alert on your phone, add it to your calendar too.'));
 const acts=el('div','acts');acts.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:6px';
 for(const a of calendarLinks(r))acts.append(a);
 if(calendarSnapshot(r)===calendarSnapshot(saved))acts.append(button('Undo','btn text small danger',()=>{removeEvent(r.id);draw()}));
 box.append(acts);return box;
}
/* When this private test offers the OpenAI research mode but it's off on this device, say so in the chat itself (once per
   chat view), with a button that shows what is shared before turning it on. */
window.oriviaResearchEnabled=()=>!!pilotConsent();
function researchNotice(){
 $('research-off')?.remove();if(!pilotOffer||pilotConsent())return;
 const n=el('section','remember');n.id='research-off';n.setAttribute('role','note');
 n.append(el('strong','',uiText('Research is off on this device')),el('p','notice',uiText('Orivia can’t search the web or check sources until you turn on the research test.')));
 const row=el('div','row');
 row.append(button('Turn on research','btn small',()=>{n.replaceChildren(el('p','notice',$('pilot-text').textContent),(()=>{const r2=el('div','row');r2.append(button('I agree, turn it on','btn small',()=>{try{(globalThis.OriviaAccountStorage?.storage||localStorage).setItem(pilotKey,pilotOffer)}catch(_){}$('set-pilot').checked=true;n.replaceChildren(el('p','notice',uiText('Research is on for this device. You can turn it off in Settings.')))}),button('Not now','btn text small',()=>n.remove()));return r2})())}),
  button('Not now','btn text small',()=>n.remove()));
 n.append(row);$('history').after(n);const sc=$('chat-scroll');if(sc)sc.scrollTop=sc.scrollHeight;
}
/* A drafted message: editable here, copied by the person and sent by them. Orivia never sends anything. Edits are kept with
   the chat on this device. */
function safeDraft(x){
 if(!x||typeof x!=='object'||typeof x.text!=='string'||!x.text.trim())return null;
 const s=(v,n)=>typeof v==='string'?v.slice(0,n):'';
 return {to:s(x.to,80),channel:['message','email','letter','call script'].includes(x.channel)?x.channel:'message',subject:s(x.subject,140),text:x.text.slice(0,2000)};
}
function draftBox(t){
 const d=t.meta.draft,box=document.createElement('div');box.className='draft-box';box.style.cssText='margin-top:10px;display:flex;flex-direction:column;gap:6px';
 const label=document.createElement('label');label.textContent=(d.channel==='email'?'Email':d.channel==='call script'?'What to say':d.channel==='letter'?'Letter':'Message')+(d.to?' to '+d.to:'')+' · edit it, then copy and send it yourself';label.style.cssText='font-size:.85em;opacity:.8';
 let subj=null;
 if(d.channel==='email'){subj=document.createElement('input');subj.type='text';subj.value=d.subject||'';subj.setAttribute('aria-label','Email subject');subj.oninput=()=>{d.subject=subj.value.slice(0,140);save()};subj.style.cssText='width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit'}
 const area=document.createElement('textarea');area.value=d.text;area.rows=Math.min(14,Math.max(5,d.text.split('\n').length+1));area.setAttribute('aria-label','Drafted message, editable');
 area.style.cssText='width:100%;box-sizing:border-box;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;resize:vertical';
 area.oninput=()=>{d.text=area.value.slice(0,2000);save()};
 const copy=document.createElement('button');copy.type='button';copy.className='btn small';copy.textContent=uiText('Copy');
 copy.onclick=async()=>{const v=(subj&&subj.value?'Subject: '+subj.value+'\n\n':'')+area.value;let ok=false;try{await navigator.clipboard.writeText(v);ok=true}catch(_){try{area.select();ok=document.execCommand('copy')}catch(__){}}copy.textContent=ok?'Copied':'Select the text and copy it';setTimeout(()=>{copy.textContent=uiText('Copy')},2500)};
 box.append(label,...(subj?[subj]:[]),area,copy);return box;
}
/* After a rate limit: the Send button waits, counting down, so repeated taps can't keep the limit going. */
let coolTimer=null,coolUntil=0;
function cooldown(secs){
 clearInterval(coolTimer);let left=Math.max(1,Math.round(secs));coolUntil=Date.now()+left*1000;const send=$('send');send.disabled=true;
 const tick=()=>{if(left<=0){clearInterval(coolTimer);if(!busy)send.disabled=false;send.removeAttribute('aria-label');return}send.setAttribute('aria-label','Send again in '+left+' seconds');left--};
 tick();coolTimer=setInterval(tick,1000);
}
/* Research progress inside the chat: the server streams what Orivia is actually doing ("Searching: …", "Reading 3 pages: …"),
   one line at a time, then the reply. Plain JSON replies (every other path) work as before. */
/* The send button doubles as Stop while a reply is on its way. */
var stoppedByPerson=false;
// Its own click handler: the empty message box is 'required', so a form submit would never reach the Stop code.
$('send').addEventListener('click',e=>{if(!busy)return;e.preventDefault();if(activeChatRequest){stoppedByPerson=true;activeChatRequest.abort()}});
function sendMode(stopping){const b=$('send');if(!b)return;b.classList.toggle('stopping',stopping);b.disabled=false;b.setAttribute('aria-label',uiText(stopping?'Stop':'Send'))}
function working(text){
 if(!text){$('working')?.remove();return}
 const sc=$('chat-scroll'),follow=nearChatBottom(sc);
 let w=$('working');
 if(!w){w=document.createElement('div');w.id='working';w.className='bubble assistant';const b=document.createElement('b');b.textContent=uiText('Orivia');const s=document.createElement('span');s.setAttribute('aria-live','polite');s.style.opacity='0.75';s.style.fontStyle='italic';w.append(b,s);$('history').append(w)}
 w.querySelector('span').textContent=(window.OriviaI18n?.progress(text)??String(text)).slice(0,180);if(follow)sc.scrollTop=sc.scrollHeight;
}
async function readReply(res,chatId){
 if(!/ndjson/i.test(res.headers.get('content-type')||''))return {r:res,d:await res.json().catch(()=>({}))};
 const reader=res.body.getReader(),dec=new TextDecoder();let buf='',final=null;
 const line=l=>{if(!l.trim())return;let m;try{m=JSON.parse(l)}catch(_){return}
  if(typeof m.progress==='string'&&store.active===chatId)working(m.progress+'…');
  if(m.result&&typeof m.result==='object')final={status:Number(m.status)||200,body:m.result}};
 while(true){const {done,value}=await reader.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;while((i=buf.indexOf('\n'))>=0){line(buf.slice(0,i));buf=buf.slice(i+1)}}
 line(buf);working('');
 if(!final)return {r:{ok:false,status:502},d:{}};
 return {r:{ok:final.status<400,status:final.status},d:final.body};
}
// Once per message: the unanswered question goes back in the box and is sent again when the app is in front again.
let autoResent='';
function resendWhenBack(text,chatId){
 if(autoResent===text||store.active!==chatId||turns.at(-1)?.role!=='user'||turns.at(-1).content!==text.slice(0,900))return false;
 autoResent=text;turns.pop();save();draw();$('msg').value=text;grow();
 $('status').textContent=uiText('Your phone went to sleep before Orivia finished. Sending your message again…');
 const go=()=>{if(document.visibilityState!=='visible')return;document.removeEventListener('visibilitychange',go);setTimeout(()=>{if(!busy&&$('msg').value===text)$('form').requestSubmit()},300)};
 document.addEventListener('visibilitychange',go);go();return true;
}
$('form').onsubmit=async e=>{
 e.preventDefault();
 if(busy){if(activeChatRequest){stoppedByPerson=true;activeChatRequest.abort()}return}
 if(!agreed()||Date.now()<coolUntil)return;
 if(navigator.onLine===false){showOffline();$('status').textContent=uiText('You’re offline. Your message is still here; send it when you’re back online.');return}
 stopDictation(true);stopSpeaking();
 let text=$('msg').value.trim();if(!text&&!pendingAttachment)return;
 // An attachment is read first (notice, then one reading); declined or failed keeps the draft and the file.
 const readFirst=pendingAttachment&&!pendingAttachment.read?pendingAttachment:null;
 if(readFirst&&!(await readPendingAttachment()))return;
 text=$('msg').value.trim();const sentAttachment=pendingAttachment?{id:newId(),name:pendingAttachment.name,type:pendingAttachment.type,...(pendingAttachment.fileId&&globalThis.OriviaAccounts?.user?{fileId:pendingAttachment.fileId}:{})}:null;
 if(sentAttachment&&sentAttachment.type!=='application/pdf')attachmentPreviews.set(sentAttachment.id,URL.createObjectURL(pendingAttachment.blob));
 const attachedFile=pendingAttachment;
 if(!text&&!sentAttachment)return;pendingAttachment=null;renderAttachmentPreview();
 $('msg').value='';grow();turns.push({role:'user',content:text.slice(0,900),...(sentAttachment?{meta:{attachment:sentAttachment}}:{})});save();draw({scroll:true});
 const chatId=store.active,sentTurns=turns.slice(),accountAtSend=globalThis.OriviaAccounts?.epoch||'';
 const controller=new AbortController();activeChatRequest=controller;
 let wentAway=document.visibilityState==='hidden';const away=()=>{if(document.visibilityState==='hidden')wentAway=true};document.addEventListener('visibilitychange',away);
 busy=true;stoppedByPerson=false;sendMode(true);$('status').textContent=uiText('Orivia is thinking…');working('Thinking…');window.oriviaResearchMode=!!pilotConsent();
 // The message is already in the chat; now the file is read (Stop cancels it). If it can't be read, the message and file
 // go back into the box.
 if(readFirst){
  working(uiText('Reading your document…'));$('status').textContent=uiText('Reading your document…');activeChatRequest={abort:()=>cancelAttach()};
  const result=await readAttached(readFirst.blob,readFirst.name);
  if(result!==true){
   if(store.active===chatId&&turns.at(-1)?.role==='user'&&turns.at(-1).meta?.attachment?.id===sentAttachment?.id){turns.pop();save();draw()}
   if(!$('msg').value)$('msg').value=text;grow();pendingAttachment=attachedFile;renderAttachmentPreview();
   $('status').textContent=stoppedByPerson?uiText('Stopped. Your message is back in the box.'):result||uiText('Your draft is still here.');
   activeChatRequest=null;busy=false;sendMode(false);working('');document.removeEventListener('visibilitychange',away);return;
  }
  readFirst.read=true;activeChatRequest=controller;working('Thinking…');$('status').textContent=uiText('Orivia is thinking…');
  const latest=chatDocuments()[0];if(latest?.partial&&turns.at(-1)?.meta?.attachment){turns.at(-1).meta.attachment.partial=true;save();draw()}
 }
 try{
  {const ctx=chatDocuments().length?documentContext():null,me=turns.at(-1);if(ctx&&(ctx.used<ctx.total||ctx.cut)&&me?.role==='user'){me.meta={...(me.meta||{}),documentContext:{used:ctx.used,total:ctx.total,cut:ctx.cut}};save();draw()}}
  const res=await fetch('/v1/chat',{method:'POST',signal:controller.signal,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/x-ndjson, application/json'},body:JSON.stringify({messages:chatMessages(sentTurns),preferences:{calendarChangeUI:1,now:localNow(),...(currentOrgContext()?{orgContext:{org:currentOrgContext().org,content:currentOrgContext().content}}:{}),...(chatDocuments().length&&pilotConsent()?{documents:documentsForMessage()}:{}),researchContext:currentResearchContext(sentTurns),language:uiLanguage(),style:readSettings().tone,suggestGuides:readSettings().suggest!==false,profile:profileForAI(),guides:guidesForAI(),...(pilotConsent()?{providerConsent:pilotConsent()}:{})}})});
  const {r,d}=await readReply(res,chatId);
  if((globalThis.OriviaAccounts?.epoch||'')!==accountAtSend)return;
  if(!r.ok){
   const why=d&&d.error;
   if(wentAway&&r.status===502&&!why&&resendWhenBack(text,chatId))return;
   if(r.status===403&&why==='org_context_unavailable'){clearOrgContext('That university guide isn’t available to you any more, so Orivia stopped using it. Send your message again to ask without it.');$('msg').value=$('msg').value||sentTurns.at(-1)?.content||'';return}
   if(r.status===401&&why==='human_check'){const passedBefore=humanOk;$('consent').checked=agreed();try{sessionStorage.removeItem(ck)}catch(_){}$('workspace').hidden=true;$('nav').hidden=true;$('intro').hidden=false;if(window.__siteKey)loadTurnstile(window.__siteKey);$('status').textContent='';
    // Passed the check but the browser didn't keep it (a framed preview in a strict browser): say so instead of looping.
    const f=passedBefore&&framedFullScreen();if(f){const n=$('human-note');n.hidden=false;n.replaceChildren(document.createTextNode('This browser didn’t keep your check inside the preview. Open Orivia full screen to continue. '),f)}
    return}
   // The message didn't go through: take it back out of the chat and put it in the composer, so a retry doesn't repeat it.
   if(turns.at(-1)?.role==='user'&&turns.at(-1).content===text.slice(0,900)&&store.active===chatId){turns.pop();save();draw();if(!$('msg').value)$('msg').value=text}
   const wait=Math.max(0,Math.min(86400,Math.round(Number(d&&d.retryAfter)||0)));
   $('status').textContent=why==='person_limit'?'You’ve reached today’s message limit for the beta. Your guides, calendar and journeys still work, and messages come back tomorrow.'
    :why==='daily_limit'?(mode==='public'?'Orivia’s beta is very busy today. Please try again tomorrow; your guides, calendar and journeys still work.':'Today’s message allowance for this private test is used up. It resets at midnight UTC (4am in the UAE). Your guides, calendar and journeys still work.')
    :why==='rate_limit'||r.status===429?'Orivia is getting a lot of messages right now. Your message is back in the box; you can send it again in '+(wait||60)+' seconds.':'Orivia is temporarily unavailable. Please try again.';
   if(why==='rate_limit'||(r.status===429&&!why))cooldown(wait||60);
   return}
  if(typeof d.reply!=='string'||!d.reply.trim())throw Error('empty');
  const meta={};const change=safeCalendarChange(d.calendarChange);if(change)meta.calendarChange={proposal:change,status:'pending'};const vetted=safeSources(d.liveSources);if(vetted.length)meta.sources=vetted;if(d.research&&typeof d.research==='object')meta.research=safeResearch(d.research);
  if(vetted.length&&Array.isArray(d.organisations)){const orgs=d.organisations.slice(0,8);if(safeOrgs(orgs,vetted).length){meta.organisations=JSON.parse(JSON.stringify(orgs));if(['list','single','choose'].includes(d.cardMode))meta.cardMode=d.cardMode}}
  const dr=safeDraft(d.draft);if(dr)meta.draft=dr;
  // The language the reply was written in (from the server), so Listen picks the right voice instead of guessing.
  if(typeof d.replyLanguage==='string'&&Object.hasOwn(VOICE_LOC,d.replyLanguage))meta.lang=d.replyLanguage;
  const showMessage=safeShowMessage(d.showMessage);if(showMessage)meta.showMessage=showMessage;
  const destinations=safeDestinations(d.destinations,vetted);if(destinations.length)meta.destinations=destinations.map(({src,...d})=>d);
  // A reminder Orivia set from the conversation: saved now (the reply says so), with Undo under the reply.
  if(!change&&d.reminder&&store.active===chatId){const ev=saveChatReminder(d.reminder);if(ev)meta.reminder={id:ev.id,title:ev.title,at:ev.at,alarm:ev.alarm}}
  const answer={role:'assistant',content:(change?uiText(d.reply):d.reply).slice(0,4000),...(Object.keys(meta).length?{meta}:{})};
  if(store.active!==chatId){ // they switched chats while Orivia was replying: file the answer in its own chat
   const c=store.chats.find(x=>x.id===chatId);if(c){c.turns=[...c.turns,answer];c.updated=Date.now();persist();renderChats()}
   $('status').textContent=uiText('Orivia replied in “{chat}”.').replace('{chat}',c?c.title:uiText('another chat'));return;
  }
  turns.push(answer);save();draw({newReply:answer});
  $('guide-offer')?.remove();
  resources(d.actions||[]); // sources now show under the reply itself
  guideCard(d.guideOffer);
  if(!d.guideOffer&&!d.journey)rememberCard(d.transport);else $('remember-card')?.remove();
  if(!d.guideOffer)placementCard(d.journey);
  if(/\b(calendar|reminders?|appointments?|schedule)\b/i.test(text))chip('Open My calendar',()=>tab('calendar'));
  // Say which Orivia answered: the OpenAI research test, or basic mode (and why), so a tester always knows what they tested.
  const viaTest=!!(d.research&&d.research.assistant);
  $('status').textContent=viaTest?(d.liveSources?.length?'Research test (OpenAI) · facts checked against the sources shown.':'Research test (OpenAI).')
   :pilotOffer&&!pilotConsent()?'Basic mode · the OpenAI research test is off on this device (turn it on in Settings).'
   :d.liveSources?.length?'Opened approved source page(s) for this reply. Routes and schedules are not checked.':d.verifiedSources?.length?'Reviewed campus references attached; live pages unavailable.':'AI reply • No approved live sources checked.';
 }catch(_){
  if(controller.signal.aborted&&stoppedByPerson){
   // Stopped by the person: take back the unanswered question and return it to the box to edit or resend.
   if(store.active===chatId&&turns.at(-1)?.role==='user'&&turns.at(-1).content===text.slice(0,900)){turns.pop();save();draw()}
   if(!$('msg').value)$('msg').value=text;grow();$('status').textContent=uiText('Stopped. Your message is back in the box.')
  }else if(!(wentAway&&resendWhenBack(text,chatId)))$('status').textContent=uiText('Could not reach the private AI. Please try again.')}
 finally{document.removeEventListener('visibilitychange',away);if(activeChatRequest===controller)activeChatRequest=null;busy=false;sendMode(false);$('send').disabled=Date.now()<coolUntil;working('')}
};
