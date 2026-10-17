'use strict';
/* Orivia private AI trial: chat-first mobile app with Calendar, Journeys and My Life behind it. */
const key='orivia-ai-private-turns',ck='orivia-ai-private-consent',eventKey='orivia-private-events-v1',profileKey='orivia-private-profile-v1';
let turns=[],busy=false,events=[];
const $=id=>document.getElementById(id);
const TITLES={chat:'',calendar:'Calendar',journeys:'Journeys',mylife:'My Life',guide:'Journeys',settings:'Settings'};
function show(){
 $('intro').hidden=true;$('workspace').hidden=false;$('nav').hidden=false;$('open-settings').hidden=false;
 try{const d=JSON.parse(sessionStorage.getItem(key)||'[]');turns=Array.isArray(d)?d.slice(-12).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string'):[]}catch(_){turns=[]}
 draw();tab('chat');
}
function save(){sessionStorage.setItem(key,JSON.stringify(turns.slice(-12)))}
function draw(){
 const el=$('history');el.replaceChildren();
 for(const t of turns){const p=document.createElement('div');p.className='bubble '+(t.role==='user'?'user':'assistant');const b=document.createElement('b');b.textContent=t.role==='user'?'You':'Orivia';const txt=document.createElement('span');txt.textContent=t.content;p.append(b,txt);
  if(t.role==='assistant'&&'speechSynthesis' in window){const lb=document.createElement('button');lb.type='button';lb.className='listen-btn';lb.textContent='▶ Listen';lb.setAttribute('aria-pressed','false');lb.setAttribute('aria-label','Listen to this reply');lb.onclick=()=>listen(t.content,lb);p.append(document.createElement('br'),lb)}
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
 if(!p||p.here||!p.city)return p;
 const c=String(p.city);
 if(EMIRATES_ALL.includes(c))return {...p,here:'uae',region:c};
 if(/Somewhere else in the UAE/i.test(c))return {...p,here:'uae'};
 if(/Not in the UAE yet/i.test(c))return {...p,here:'away'};
 return {...p,here:'',town:c};
}
function saveProfile(patch){
 const p=migrateProfile(readProfile()||{}),n={...p,...patch};
 for(const k of ['region','town','from','destRegion','destTown','who'])if(typeof n[k]==='string')n[k]=clip(n[k]);
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
  bits.push((p.from?'You’re in '+clip(p.from)+' now':'You haven’t moved yet')+(to?' and moving to '+to:''));
 }else if(p.town)bits.push('You live in '+clip(p.town));
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
 if(document.activeElement!==$('loc-from'))$('loc-from').value=p.from||'';
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
$('loc-from').addEventListener('change',e=>saveProfile({from:e.target.value}));
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
function profileForAI(){const p=readProfile();if(!p||p.use===false)return undefined;const out={};for(const k of ['city','movingTo','who','place'])if(typeof p[k]==='string'&&p[k].trim())out[k]=p[k].trim().slice(0,60);return Object.keys(out).length?out:undefined}
$('forget').onclick=()=>{const b=$('forget');if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to delete';setTimeout(()=>{b.dataset.sure='';b.textContent='Clear saved data'},4000);return}try{localStorage.removeItem(profileKey);localStorage.removeItem(eventKey);localStorage.removeItem(journeysKey)}catch(_){}events=[];loadProfile();renderUpcoming();renderJourneys();b.dataset.sure='';b.textContent='Cleared'};
/* End session: back to the welcome screen. Clears this conversation and the human check; keeps journeys, calendar and My Life. */
$('end-session').onclick=async()=>{
 const b=$('end-session');
 if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='Tap again to end this session';setTimeout(()=>{b.dataset.sure='';b.textContent='End session'},4000);return}
 stopSpeaking();stopDictation(false);
 try{await fetch('/v1/end',{method:'POST',credentials:'same-origin'})}catch(_){}
 try{for(const k of [key,ck,'orivia-private-offered','orivia-private-remember-no'])sessionStorage.removeItem(k)}catch(_){}
 location.reload();
};
/* ===== Listen: Orivia's replies read aloud with the phone's own voices ===== */
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
async function loadMode(){
 try{const r=await fetch('/v1/config',{credentials:'same-origin',cache:'no-store'});const d=await r.json();
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
$('clear').onclick=()=>{if(busy)return;turns=[];sessionStorage.removeItem(key);draw();resources([]);$('guide-offer')?.remove();$('inline-calendar')?.remove();tab('chat')};
$('form').onsubmit=async e=>{
 e.preventDefault();if(busy||sessionStorage.getItem(ck)!=='yes')return;
 stopDictation(true);stopSpeaking();
 const text=$('msg').value.trim();if(!text)return;
 $('msg').value='';grow();turns.push({role:'user',content:text.slice(0,900)});turns=turns.slice(-12);save();draw();
 busy=true;$('send').disabled=true;$('status').textContent='Orivia is thinking…';
 try{
  const r=await fetch('/v1/chat',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:turns,preferences:{language:'en',style:readSettings().tone,suggestGuides:readSettings().suggest!==false,profile:profileForAI(),guides:guidesForAI()}})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){
   const why=d&&d.error;
   if(r.status===401&&why==='human_check'){sessionStorage.removeItem(ck);$('workspace').hidden=true;$('nav').hidden=true;$('intro').hidden=false;if(window.__siteKey)loadTurnstile(window.__siteKey);$('status').textContent='';return}
   $('status').textContent=why==='person_limit'?'You’ve reached today’s message limit for the beta. Your guides, calendar and journeys still work, and messages come back tomorrow.':why==='daily_limit'?'Orivia’s beta is very busy today. Please try again tomorrow; your guides, calendar and journeys still work.':r.status===429?'Too many messages at once. Please wait a moment and try again.':'Orivia is temporarily unavailable. Please try again.';return}
  if(typeof d.reply!=='string'||!d.reply.trim())throw Error('empty');
  turns.push({role:'assistant',content:d.reply.slice(0,1200)});turns=turns.slice(-12);save();draw();
  $('guide-offer')?.remove();
  resources([...(d.actions||[]),...(d.liveSources||[]).map(s=>({title:'Live checked source: '+s.url,url:s.url}))]);
  guideCard(d.guideOffer);
  if(!d.guideOffer&&!d.journey)rememberCard(d.transport);else $('remember-card')?.remove();
  if(!d.guideOffer)placementCard(d.journey);
  if(/\b(calendar|reminders?|appointments?|schedule)\b/i.test(text))chip('Open My calendar',()=>tab('calendar'));
  $('status').textContent=d.liveSources?.length?'Checked approved official page(s) live. Routes and schedules are not checked.':d.verifiedSources?.length?'Verified campus references attached; live pages unavailable.':'AI reply • No approved live sources checked.';
 }catch(_){$('status').textContent='Could not reach the private AI. Please try again.'}
 finally{busy=false;$('send').disabled=false}
};
