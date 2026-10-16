'use strict';
/* Orivia private AI trial: chat-first mobile app with Calendar, Explore and My Life behind it. */
const key='orivia-ai-private-turns',ck='orivia-ai-private-consent',eventKey='orivia-private-events-v1',profileKey='orivia-private-profile-v1';
let turns=[],busy=false,events=[];
const $=id=>document.getElementById(id);
const TITLES={chat:'',calendar:'My calendar',explore:'Explore',mylife:'My Life',guide:'Explore'};
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
 const views={chat:'chat',calendar:'calendar-panel',explore:'explore',mylife:'mylife',guide:'guide-view'};
 if(!views[which])return;
 const navKey=which==='guide'?'explore':which; // a guide opens inside Explore
 for(const [k,id] of Object.entries(views)){$(id).hidden=k!==which;const b=$('tab-'+k);if(b){b.classList.toggle('active',k===navKey);b.setAttribute('aria-current',k===navKey?'page':'false')}}
 $('view-title').textContent=TITLES[which];
 if(which==='calendar')renderEvents();
 if(which==='explore')renderJourneys();
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
/* Explore */
const GUIDES=[
 ['Student residence visa and Emirates ID','dubai.eid.student','Every step, what you’re waiting for, and what to do if something goes wrong'],
 ['Start using the Metro and buses','dubai.nol','nol cards, your first ride, and what to do at the gate'],
 ['From the airport to where you’re staying','dubai.airport','Metro or taxi, step by step'],
 ['Get a UAE SIM card','dubai.sim','Which SIM you can get before and after your Emirates ID'],
 ['See a doctor as a student','dubai.health.student','Insurance, clinics and medicines']];
const OFFICIAL=[
 ['RTA (Dubai roads and transport)','https://www.rta.ae','Metro, buses, nol cards, taxis'],
 ['UAE government portal','https://u.ae','Official information on visas, residency and services'],
 ['GDRFA Dubai','https://www.gdrfad.gov.ae','Residency and entry permits in Dubai'],
 ['ICP','https://icp.gov.ae','Emirates ID and federal residency services'],
 ['KHDA','https://web.khda.gov.ae','Private schools and universities in Dubai']];
function linkCard(title,href,sub){const a=document.createElement('a');a.className='link-card';a.href=href;a.target='_blank';a.rel='noopener noreferrer';const s=document.createElement('span');const t=document.createElement('strong');t.textContent=title;const d=document.createElement('small');d.className='tiny';d.textContent=sub;s.append(t,d);a.append(s,document.createTextNode('↗'));return a}
function askBtn(text){const b=document.createElement('button');b.type='button';b.className='ask';b.textContent='Ask Orivia about this';b.dataset.ask=text;return b}
for(const [t,j,sub] of GUIDES){const w=document.createElement('div');const a=linkCard(t,'https://aurelithgroup.github.io/orivia/?j='+j,sub);a.onclick=e=>{e.preventDefault();openGuide(j)};a.removeAttribute('target');const pill=document.createElement('span');pill.className='pill';pill.textContent='Checked';pill.style.cssText='display:inline-block;margin-top:4px';a.firstChild.append(pill);w.append(a,askBtn('Help me with this: '+t));$('guides').append(w)}
for(const [t,u,sub] of OFFICIAL){const w=document.createElement('div');const a=linkCard(t,u,sub);const pill=document.createElement('span');pill.className='pill';pill.textContent='Official';pill.style.cssText='display:inline-block;margin-top:4px';a.firstChild.append(pill);w.append(a);$('officials').append(w)}
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
$('help-staff').onclick=()=>{$('help-sheet').hidden=true;$('staff-card').hidden=false;$('staff-close').focus()};
$('staff-close').onclick=()=>{$('staff-card').hidden=true;$('tab-help').focus()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('staff-card').hidden)$('staff-close').click();else if(!$('help-sheet').hidden)closeHelp()}});
/* Links Orivia attaches to a reply */
function resources(items){let holder=$('journey-actions');if(!holder){holder=document.createElement('div');holder.id='journey-actions';holder.style.cssText='display:grid;gap:8px;font-size:13px';$('history').after(holder)}holder.replaceChildren();if(!Array.isArray(items))return;for(const x of items.slice(0,4)){try{const url=new URL(x.url);if(url.protocol!=='https:'||!['www.google.com','rta.ae','www.rta.ae','www.uowdubai.ac.ae','www.hw.ac.uk','hw.ac.uk'].includes(url.hostname))continue;const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=String(x.title||'Open source');link.style.cssText='display:block;padding:10px;border:1px solid var(--line);border-radius:12px;color:var(--focus)';holder.append(link)}catch(_){}}}
/* Journeys: one reusable card for any checked guide, My journeys with progress, and the guide view.
   Kept in this browser only. Follow = start guiding me; Save for later = bookmark; Not now = dismiss. */
const journeysKey='orivia-private-journeys-v1',offeredKey='orivia-private-offered';
const JID=/^[a-z]+(\.[a-z]+){1,3}$/;
function readJourneys(){try{const d=JSON.parse(localStorage.getItem(journeysKey)||'{}');return d&&typeof d==='object'&&!Array.isArray(d)?d:{}}catch(_){return {}}}
function writeJourneys(d){try{localStorage.setItem(journeysKey,JSON.stringify(d))}catch(_){}}
function setJourney(id,patch){if(!JID.test(id))return;const d=readJourneys();d[id]={...(d[id]||{}),...patch,updated:new Date().toISOString()};writeJourneys(d);renderJourneys()}
function removeJourney(id){const d=readJourneys();delete d[id];writeJourneys(d);renderJourneys()}
function offered(){try{const d=JSON.parse(sessionStorage.getItem(offeredKey)||'[]');return Array.isArray(d)?d.filter(x=>typeof x==='string'&&JID.test(x)):[]}catch(_){return []}}
function markOffered(id){const o=offered();if(!o.includes(id)){o.push(id);try{sessionStorage.setItem(offeredKey,JSON.stringify(o.slice(-30)))}catch(_){}}}
function guidesForAI(){const d=readJourneys(),ids=Object.keys(d).filter(k=>JID.test(k));return {following:ids.filter(k=>d[k].status==='following'),saved:ids.filter(k=>d[k].status==='saved'),offered:offered()}}
const reviewed=iso=>{const t=Date.parse(iso);return Number.isFinite(t)?new Date(t).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):''};
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function button(label,cls,fn){const b=el('button',cls,label);b.type='button';b.onclick=fn;return b}
function bar(step,of){const p=el('div','progress');const i=el('i');i.style.width=Math.round((step+1)/Math.max(1,of)*100)+'%';p.append(i);p.setAttribute('role','progressbar');p.setAttribute('aria-valuemin','1');p.setAttribute('aria-valuemax',String(of));p.setAttribute('aria-valuenow',String(step+1));p.setAttribute('aria-label','Step '+(step+1)+' of '+of);return p}
function guideCard(o){
 $('guide-offer')?.remove();
 if(!o||typeof o.id!=='string'||!JID.test(o.id)||typeof o.title!=='string')return;
 const mine=readJourneys()[o.id];
 if(o.kind==='offer'&&(mine||offered().includes(o.id)))return; // never nag
 markOffered(o.id);
 const steps=Number(o.steps)||0;
 const card=el('section','guide-card');card.id='guide-offer';card.setAttribute('aria-label','Guide: '+o.title);
 card.append(el('p','kicker',(o.kind==='problem'?'From your guide':'Step-by-step guide')+' · Reviewed '+reviewed(o.checkedAt)+(o.fresh===false?' · due for review':'')));
 card.append(el('h3','',o.title));
 if(o.kind==='problem'&&o.problem){card.append(el('p','label',o.problem.question));if(o.problem.answer)card.append(el('p','',o.problem.answer))}
 else card.append(el('p','notice',(o.summary||'')+(steps?' '+steps+' steps.':'')));
 const done=(msg,extra)=>{card.replaceChildren(el('p','',msg));if(extra)card.append(extra)};
 const row=el('div','row');const at=Number(mine?.step)||0;
 if(o.kind==='problem')row.append(button('Show me the steps','btn small',()=>openGuide(o.id,{problem:o.problem?.id})));
 else if(mine?.status==='following')row.append(button(at>0?'Continue from step '+(at+1):'Open guide','btn small',()=>openGuide(o.id)));
 else{
  row.append(button('Follow guide','btn small',()=>{setJourney(o.id,{status:'following',step:0,title:o.title,steps});done('Added to My journeys. You’re on step 1 of '+steps+'.');openGuide(o.id)}));
  if(mine?.status!=='saved')row.append(button('Save for later','btn quiet small',()=>{setJourney(o.id,{status:'saved',step:0,title:o.title,steps});done('Saved to My journeys. It’s in Explore whenever you’re ready.',button('Open Explore','ask',()=>tab('explore')))}));
  else row.append(button('Start guide','btn quiet small',()=>openGuide(o.id)));
 }
 row.append(button('Not now','btn text small',()=>done(mine?'Okay. It’s still in My journeys in Explore.':'No problem. It’s in Explore if you want it later, or just ask me.')));
 card.append(row);
 ($('journey-actions')||$('history')).after(card);
 const sc=$('chat-scroll');sc.scrollTop=sc.scrollHeight;
}
function renderJourneys(){
 const d=readJourneys(),items=Object.entries(d).filter(([k,v])=>JID.test(k)&&v&&typeof v.title==='string').sort((a,b)=>String(b[1].updated).localeCompare(String(a[1].updated)));
 for(const rootId of ['my-journeys','life-journeys']){
  const root=$(rootId);if(!root)continue;root.replaceChildren();
  if(!items.length){root.append(el('p','notice',rootId==='my-journeys'?'Guides you follow or save appear here. Orivia may suggest one when it fits what you’re doing.':'Nothing yet. Guides you follow will show here.'));continue}
  const list=rootId==='life-journeys'?items.filter(([,v])=>v.status!=='done').slice(0,3):items;
  for(const [id,v] of list){
   const c=el('div','card');const n=Number(v.steps)||0,st=Math.min(Number(v.step)||0,Math.max(0,n-1));
   c.append(el('strong','',v.title),el('p','tiny',v.status==='done'?'Finished':v.status==='saved'?'Saved for later':'Step '+(st+1)+(n?' of '+n:'')));
   if(v.status==='following'&&n)c.append(bar(st,n));
   const row=el('div','row');row.append(button(v.status==='saved'?'Start':v.status==='done'?'Look again':'Continue','btn small',()=>openGuide(id)));
   if(rootId==='my-journeys')row.append(button('Remove','btn text small',()=>removeJourney(id)));
   c.append(row);root.append(c);
  }
 }
}
const guideCache={};
async function loadGuide(id){
 if(guideCache[id])return guideCache[id];
 const r=await fetch('/v1/guides/'+encodeURIComponent(id),{credentials:'same-origin',cache:'no-store'});
 const d=await r.json().catch(()=>null);if(!r.ok||!d?.guide?.steps?.length)throw Error('guide');
 return guideCache[id]=d.guide;
}
async function openGuide(id,opts={}){
 if(!JID.test(id))return;
 tab('guide');const body=$('guide-body');body.replaceChildren(el('p','notice','Opening your guide…'));
 let g;try{g=await loadGuide(id)}catch(_){body.replaceChildren(el('p','notice','I couldn’t open this guide just now. Please try again.'),button('Back to Explore','btn quiet',()=>tab('explore')));return}
 let i=Math.min(Math.max(0,Number(readJourneys()[id]?.step)||0),g.steps.length-1);
 const keep=()=>{const m=readJourneys()[id];if(m)setJourney(id,{step:i,steps:g.steps.length,status:m.status==='done'?'done':'following'})};
 const draw=()=>{
  const s=g.steps[i],mine=readJourneys()[id],last=i===g.steps.length-1;body.replaceChildren();
  body.append(button('← Back to Explore','ask',()=>tab('explore')));
  body.append(el('p','kicker','Checked guide · Reviewed '+reviewed(g.checkedAt)+(g.fresh?'':' · due for review: confirm with the official source')),el('h2','',g.title));
  if(!mine){const f=el('div','row');f.append(button('Follow this guide','btn small',()=>{setJourney(id,{status:'following',step:i,title:g.title,steps:g.steps.length});draw()}));f.append(el('span','tiny','Saves your progress in this browser.'));body.append(f)}
  body.append(el('p','tiny','Step '+(i+1)+' of '+g.steps.length),bar(i,g.steps.length));
  const c=el('section','card');c.append(el('h3','',s.title));
  for(const p of s.info)c.append(el('p','',p));
  const list=(label,items,ordered)=>{if(!items.length)return;c.append(el('p','label',label));const l=el(ordered?'ol':'ul');for(const x of items)l.append(el('li','',x));c.append(l)};
  list('What to do',s.doThis,true);list('Bring',s.bring);
  if(s.cost)c.append(el('p','label','Cost'),el('p','',s.cost));
  if(s.time)c.append(el('p','label','How long'),el('p','',s.time));
  if(s.waitingFor)c.append(el('p','label','Waiting for'),el('p','',s.waitingFor));
  list('Tips',s.tips);
  if(s.staffQuestion)c.append(el('p','label','Ask staff'),el('p','say','“'+s.staffQuestion+'”'));
  const ask=button('Ask Orivia about this step','ask',()=>{});ask.dataset.ask='Help me with this step of “'+g.title+'”: '+s.title;c.append(ask);
  body.append(c);
  const nav=el('div','row');
  if(i>0)nav.append(button('Previous','btn quiet small',()=>{i--;keep();draw()}));
  if(!last)nav.append(button(mine?'Done, next step':'Next step','btn small',()=>{i++;keep();draw()}));
  else nav.append(button('Finish','btn small',()=>{if(readJourneys()[id])setJourney(id,{status:'done',step:i});body.replaceChildren(el('h2','','All done!'),el('p','','You’ve reached the end of “'+g.title+'”. It stays in My journeys if you want to look again.'),button('Back to Explore','btn quiet',()=>tab('explore')))}));
  body.append(nav);
  if(g.problems.length){body.append(el('h3','','Something not working?'));for(const p of g.problems){const det=el('details');det.append(el('summary','',p.question));if(p.answer)det.append(el('p','',p.answer));
   if(p.steps.length){const ol=el('ol');for(const x of p.steps){const li=el('li');li.append(el('strong','',x.title));if(x.body)li.append(el('p','',x.body));if(x.list.length){const ul=el('ul');for(const y of x.list)ul.append(el('li','',y));li.append(ul)}if(x.tip)li.append(el('p','tiny',x.tip));ol.append(li)}det.append(ol)}if(opts.problem===p.id){det.open=true;setTimeout(()=>det.scrollIntoView({block:'center'}),0)}body.append(det)}}
  const src=el('p','tiny');src.append('Sources: ');g.sources.forEach((x,k)=>{const a=el('a','',x.name+' ↗');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';src.append(k?' · ':'',a)});body.append(src);
  const full=el('a','tiny','Open the full guide in the Orivia app ↗');full.href=g.fullGuideUrl;full.target='_blank';full.rel='noopener noreferrer';body.append(full);
  body.parentElement.scrollTop=0;
 };
 draw();
}
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
  if(/\b(calendar|reminders?|appointments?|schedule)\b/i.test(text))chip('Open My calendar',()=>tab('calendar'));
  $('status').textContent=d.liveSources?.length?'Checked approved official page(s) live. Routes and schedules are not checked.':d.verifiedSources?.length?'Verified campus references attached; live pages unavailable.':'AI reply • No approved live sources checked.';
 }catch(_){$('status').textContent='Could not reach the private AI. Please try again.'}
 finally{busy=false;$('send').disabled=false}
};
