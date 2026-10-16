'use strict';
/* Orivia private AI trial: chat-first mobile app with Calendar, Journeys and My Life behind it. */
const key='orivia-ai-private-turns',ck='orivia-ai-private-consent',eventKey='orivia-private-events-v1',profileKey='orivia-private-profile-v1';
let turns=[],busy=false,events=[];
const $=id=>document.getElementById(id);
const TITLES={chat:'',calendar:'My calendar',journeys:'Journeys',mylife:'My Life',guide:'Journeys'};
function show(){
 $('intro').hidden=true;$('workspace').hidden=false;$('nav').hidden=false;
 try{const d=JSON.parse(sessionStorage.getItem(key)||'[]');turns=Array.isArray(d)?d.slice(-12).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string'):[]}catch(_){turns=[]}
 draw();tab('chat');
}
function save(){sessionStorage.setItem(key,JSON.stringify(turns.slice(-12)))}
function draw(){
 const el=$('history');el.replaceChildren();
 for(const t of turns){const p=document.createElement('div');p.className='bubble '+(t.role==='user'?'user':'assistant');const b=document.createElement('b');b.textContent=t.role==='user'?'You':'Orivia';const txt=document.createElement('span');txt.textContent=t.content;p.append(b,txt);el.append(p)}
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
const when=e=>new Date(e.at).toLocaleString(undefined,{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
function renderEvents(){
 loadEvents();
 const root=$('events');root.replaceChildren();
 const sorted=events.slice().sort((a,b)=>a.at.localeCompare(b.at));
 if(!sorted.length){const p=document.createElement('p');p.className='notice';p.textContent='Your calendar is empty. Ask Orivia in Chat to remind you about something, or add a reminder below.';root.append(p);return}
 for(const e of sorted){
  const card=document.createElement('div');card.className='event';
  const title=document.createElement('strong');title.textContent=e.title;card.append(title);
  const date=document.createElement('p');date.className='tiny';date.textContent=when(e)+' • Orivia calendar only';card.append(date);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:12px;align-items:center;flex-wrap:wrap';
  const anchor=document.createElement('a');anchor.href=googleEvent(e);anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.textContent='Add to Google Calendar ↗';row.append(anchor);
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.onclick=()=>{events=events.filter(x=>x.id!==e.id);storeEvents();renderEvents();renderUpcoming()};row.append(remove);
  card.append(row);root.append(card);
 }
}
function renderUpcoming(){
 loadEvents();const root=$('upcoming');root.replaceChildren();
 const next=events.filter(e=>new Date(e.at).getTime()>Date.now()).sort((a,b)=>a.at.localeCompare(b.at)).slice(0,3);
 if(!next.length){const p=document.createElement('p');p.className='notice';p.textContent='Nothing coming up yet.';root.append(p);return}
 for(const e of next){const p=document.createElement('p');const s=document.createElement('strong');s.textContent=e.title;const t=document.createElement('span');t.className='tiny';t.textContent=' · '+when(e);p.append(s,t);root.append(p)}
 const open=document.createElement('button');open.type='button';open.className='ask';open.textContent='Open My calendar';open.onclick=()=>tab('calendar');root.append(open);
}
/* Switching sections: the bottom bar, and Orivia herself (window.oriviaGo) */
function tab(which){
 const views={chat:'chat',calendar:'calendar-panel',journeys:'journeys',mylife:'mylife',guide:'guide-view'};
 if(!views[which])return;
 const navKey=which==='guide'?'journeys':which; // a guide opens inside Journeys
 for(const [k,id] of Object.entries(views)){$(id).hidden=k!==which;const b=$('tab-'+k);if(b){b.classList.toggle('active',k===navKey);b.setAttribute('aria-current',k===navKey?'page':'false')}}
 $('view-title').textContent=TITLES[which];
 if(which==='calendar')renderEvents();
 if(which==='journeys')renderJourneys();
 if(which==='mylife'){renderUpcoming();loadProfile();renderJourneys()}
 if(which==='chat'){const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight}
}
window.oriviaGo=tab;
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
function loadProfile(){const p=readProfile()||{};$('p-city').value=p.city||'';$('p-who').value=p.who||'';$('p-place').value=p.place||'';$('p-use').checked=!!p.use}
$('profile-form').addEventListener('submit',e=>{e.preventDefault();const p={city:$('p-city').value.slice(0,40),who:$('p-who').value.slice(0,40),place:$('p-place').value.trim().slice(0,60),use:$('p-use').checked};try{localStorage.setItem(profileKey,JSON.stringify(p));$('profile-status').textContent=p.use?'Saved. Orivia will use this in your chats.':'Saved on this device. Orivia won’t use it until you tick the box.'}catch(_){$('profile-status').textContent='Could not save on this device.'}});
function profileForAI(){const p=readProfile();if(!p||!p.use)return undefined;const out={};for(const k of ['city','who','place'])if(typeof p[k]==='string'&&p[k].trim())out[k]=p[k].trim().slice(0,60);return Object.keys(out).length?out:undefined}
$('forget').onclick=()=>{const b=$('forget');if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to delete';setTimeout(()=>{b.dataset.sure='';b.textContent='Delete About me, calendar and journeys'},4000);return}try{localStorage.removeItem(profileKey);localStorage.removeItem(eventKey);localStorage.removeItem(journeysKey)}catch(_){}events=[];loadProfile();renderUpcoming();renderJourneys();b.dataset.sure='';b.textContent='Deleted'};
/* Help: always one tap away in the middle of the bar */
function openHelp(){$('help-sheet').hidden=false;$('help-wrong').focus()}
function closeHelp(){$('help-sheet').hidden=true;$('tab-help').focus()}
$('tab-help').onclick=openHelp;$('help-close').onclick=closeHelp;
$('help-sheet').addEventListener('click',e=>{if(e.target.id==='help-sheet')closeHelp()});
$('help-wrong').onclick=()=>{closeHelp();ask('Something went wrong: ',false)};
$('help-journeys').onclick=()=>{closeHelp();tab('journeys')};
$('help-staff').onclick=()=>{$('help-sheet').hidden=true;$('staff-card').hidden=false;$('staff-close').focus()};
$('staff-close').onclick=()=>{$('staff-card').hidden=true;$('tab-help').focus()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('staff-card').hidden)$('staff-close').click();else if(!$('help-sheet').hidden)closeHelp()}});
/* Links Orivia attaches to a reply */
function resources(items){let holder=$('journey-actions');if(!holder){holder=document.createElement('div');holder.id='journey-actions';holder.style.cssText='display:grid;gap:8px;font-size:13px';$('history').after(holder)}holder.replaceChildren();if(!Array.isArray(items))return;for(const x of items.slice(0,4)){try{const url=new URL(x.url);if(url.protocol!=='https:'||!['www.google.com','rta.ae','www.rta.ae','www.uowdubai.ac.ae','www.hw.ac.uk','hw.ac.uk'].includes(url.hostname))continue;const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=String(x.title||'Open source');link.style.cssText='display:block;padding:10px;border:1px solid var(--line);border-radius:12px;color:var(--focus)';holder.append(link)}catch(_){}}}
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
 if(o.kind==='offer'&&(readJourneys()[o.id]||offered().includes(o.id)))return; // never nag
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
  if(!now.length)life.append(el('p','notice','Nothing in progress.'));
  for(const [,v] of now){const st=shownState(v);const p=el('p');p.append(el('strong','',(st==='paused'?'Paused: ':st==='waiting'?'Waiting: ':'In progress: ')),document.createTextNode(v.title+' · '+progressLine(v).replace(/ · \d+ of \d+ done$/,'')));life.append(p)}
  life.append(button('Open Journeys','ask',()=>tab('journeys')));
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
 const local=$('reminder-when').value;
 const at=new Date(local);
 if(!title||!local||!Number.isFinite(at.getTime())||at.getTime()<Date.now()+60000||at.getTime()>Date.now()+366*86400000){
  $('reminder-status').textContent='Please choose a valid future date and time within one year.';return
 }
 const saved={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),title,at:at.toISOString()};
 events.push(saved);storeEvents();$('reminder-form').reset();
 $('reminder-status').textContent='Saved on this device. Open Google Calendar, choose an alert, and save the event for phone notifications.';
 renderEvents();
});
/* Message box grows with the text; Enter sends, Shift+Enter adds a line */
function grow(){const m=$('msg');m.style.height='auto';m.style.height=Math.min(m.scrollHeight,140)+'px'}
$('msg').addEventListener('input',grow);
$('msg').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('form').requestSubmit()}});
function chip(label,fn){const holder=$('journey-actions')||(resources([]),$('journey-actions'));const b=document.createElement('button');b.type='button';b.className='action-chip';b.textContent=label;b.onclick=fn;holder.append(b)}
if(sessionStorage.getItem(ck)==='yes')show();
$('start').onclick=()=>{if(!$('consent').checked)return;$('consent').checked=false;sessionStorage.setItem(ck,'yes');show()};
$('clear').onclick=()=>{if(busy)return;turns=[];sessionStorage.removeItem(key);draw();resources([]);$('guide-offer')?.remove();$('inline-calendar')?.remove();tab('chat')};
$('form').onsubmit=async e=>{
 e.preventDefault();if(busy||sessionStorage.getItem(ck)!=='yes')return;
 const text=$('msg').value.trim();if(!text)return;
 $('msg').value='';grow();turns.push({role:'user',content:text.slice(0,900)});turns=turns.slice(-12);save();draw();
 busy=true;$('send').disabled=true;$('status').textContent='Orivia is thinking…';
 try{
  const r=await fetch('/v1/chat',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:turns,preferences:{language:'en',style:'friendly',profile:profileForAI(),guides:guidesForAI()}})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){$('status').textContent=r.status===429?'Trial limit reached. Try again later.':'Private AI is temporarily unavailable. Please try again.';return}
  if(typeof d.reply!=='string'||!d.reply.trim())throw Error('empty');
  turns.push({role:'assistant',content:d.reply.slice(0,1200)});turns=turns.slice(-12);save();draw();
  $('guide-offer')?.remove();
  resources([...(d.actions||[]),...(d.liveSources||[]).map(s=>({title:'Live checked source: '+s.url,url:s.url}))]);
  guideCard(d.guideOffer);
  if(!d.guideOffer)placementCard(d.journey);
  if(/\b(calendar|reminders?|appointments?|schedule)\b/i.test(text))chip('Open My calendar',()=>tab('calendar'));
  $('status').textContent=d.liveSources?.length?'Checked approved official page(s) live. Routes and schedules are not checked.':d.verifiedSources?.length?'Verified campus references attached; live pages unavailable.':'AI reply • No approved live sources checked.';
 }catch(_){$('status').textContent='Could not reach the private AI. Please try again.'}
 finally{busy=false;$('send').disabled=false}
};
