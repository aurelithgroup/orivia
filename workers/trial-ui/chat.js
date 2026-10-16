'use strict';
/* Orivia private AI trial: chat-first mobile app with Calendar, Explore and My Life behind it. */
const key='orivia-ai-private-turns',ck='orivia-ai-private-consent',eventKey='orivia-private-events-v1',profileKey='orivia-private-profile-v1';
let turns=[],busy=false,events=[];
const $=id=>document.getElementById(id);
const TITLES={chat:'',calendar:'My calendar',explore:'Explore',mylife:'My Life'};
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
 const views={chat:'chat',calendar:'calendar-panel',explore:'explore',mylife:'mylife'};
 if(!views[which])return;
 for(const [k,id] of Object.entries(views)){$(id).hidden=k!==which;const b=$('tab-'+k);b.classList.toggle('active',k===which);b.setAttribute('aria-current',k===which?'page':'false')}
 $('view-title').textContent=TITLES[which];
 if(which==='calendar')renderEvents();
 if(which==='mylife'){renderUpcoming();loadProfile()}
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
for(const [t,j,sub] of GUIDES){const w=document.createElement('div');const a=linkCard(t,'https://aurelithgroup.github.io/orivia/?j='+j,sub);const pill=document.createElement('span');pill.className='pill';pill.textContent='Checked';pill.style.cssText='display:inline-block;margin-top:4px';a.firstChild.append(pill);w.append(a,askBtn('Help me with this: '+t));$('guides').append(w)}
for(const [t,u,sub] of OFFICIAL){const w=document.createElement('div');const a=linkCard(t,u,sub);const pill=document.createElement('span');pill.className='pill';pill.textContent='Official';pill.style.cssText='display:inline-block;margin-top:4px';a.firstChild.append(pill);w.append(a);$('officials').append(w)}
/* My Life: About me, only shared with the AI when the user ticks the box */
function readProfile(){try{const p=JSON.parse(localStorage.getItem(profileKey)||'null');return p&&typeof p==='object'?p:null}catch(_){return null}}
function loadProfile(){const p=readProfile()||{};$('p-city').value=p.city||'';$('p-who').value=p.who||'';$('p-place').value=p.place||'';$('p-use').checked=!!p.use}
$('profile-form').addEventListener('submit',e=>{e.preventDefault();const p={city:$('p-city').value.slice(0,40),who:$('p-who').value.slice(0,40),place:$('p-place').value.trim().slice(0,60),use:$('p-use').checked};try{localStorage.setItem(profileKey,JSON.stringify(p));$('profile-status').textContent=p.use?'Saved. Orivia will use this in your chats.':'Saved on this device. Orivia won’t use it until you tick the box.'}catch(_){$('profile-status').textContent='Could not save on this device.'}});
function profileForAI(){const p=readProfile();if(!p||!p.use)return undefined;const out={};for(const k of ['city','who','place'])if(typeof p[k]==='string'&&p[k].trim())out[k]=p[k].trim().slice(0,60);return Object.keys(out).length?out:undefined}
$('forget').onclick=()=>{const b=$('forget');if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to delete';setTimeout(()=>{b.dataset.sure='';b.textContent='Delete About me and calendar'},4000);return}try{localStorage.removeItem(profileKey);localStorage.removeItem(eventKey)}catch(_){}events=[];loadProfile();renderUpcoming();b.dataset.sure='';b.textContent='Deleted'};
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
$('clear').onclick=()=>{if(busy)return;turns=[];sessionStorage.removeItem(key);draw();resources([]);$('inline-calendar')?.remove();tab('chat')};
$('form').onsubmit=async e=>{
 e.preventDefault();if(busy||sessionStorage.getItem(ck)!=='yes')return;
 const text=$('msg').value.trim();if(!text)return;
 $('msg').value='';grow();turns.push({role:'user',content:text.slice(0,900)});turns=turns.slice(-12);save();draw();
 busy=true;$('send').disabled=true;$('status').textContent='Orivia is thinking…';
 try{
  const r=await fetch('/v1/chat',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:turns,preferences:{language:'en',style:'friendly',profile:profileForAI()}})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){$('status').textContent=r.status===429?'Trial limit reached. Try again later.':'Private AI is temporarily unavailable. Please try again.';return}
  if(typeof d.reply!=='string'||!d.reply.trim())throw Error('empty');
  turns.push({role:'assistant',content:d.reply.slice(0,1200)});turns=turns.slice(-12);save();draw();
  resources([...(d.actions||[]),...(d.liveSources||[]).map(s=>({title:'Live checked source: '+s.url,url:s.url}))]);
  if(/\b(calendar|reminders?|appointments?|schedule)\b/i.test(text))chip('Open My calendar',()=>tab('calendar'));
  $('status').textContent=d.liveSources?.length?'Checked approved official page(s) live. Routes and schedules are not checked.':d.verifiedSources?.length?'Verified campus references attached; live pages unavailable.':'AI reply • No approved live sources checked.';
 }catch(_){$('status').textContent='Could not reach the private AI. Please try again.'}
 finally{busy=false;$('send').disabled=false}
};
