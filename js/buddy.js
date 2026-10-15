/* Orivia Buddy Lab v0.2. Local-only prototype; not personalised legal advice. */
(function(){
'use strict';
const KEY='orivia-buddy-lab-v2';
const EMPTY=()=>({tone:'friendly',dependants:'unknown',school:'unknown',foreignRecords:'unknown',stayDates:'unknown',goal:'family',checked:{},notes:{},view:'home'});
const VALID={tone:['friendly','formal','simple'],dependants:['unknown','yes','no'],school:['unknown','yes','no'],foreignRecords:['unknown','yes','no'],stayDates:['unknown','known'],goal:['family','student','everyday'],view:['home','chat','profile']};
const LIMIT=200;
function read(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');const b=EMPTY();if(s&&typeof s==='object'){Object.keys(VALID).forEach(k=>{if(VALID[k].includes(s[k]))b[k]=s[k]});if(s.checked&&typeof s.checked==='object')Object.keys(s.checked).slice(0,30).forEach(k=>{if(s.checked[k]===true)b.checked[k]=true});}return b}catch(_){return EMPTY()}}
let s=read(), open=false,previousFocus=null,reply='';
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const tone=(a,b,c)=>s.tone==='formal'?b:s.tone==='simple'?c:a;
const QUESTIONS=[
{id:'family',when:()=>s.goal==='family'&&s.dependants==='yes',headline:'Confirm each dependent application',why:'You said you are arranging residency for dependants.',detail:'Ask the responsible sponsor or immigration authority which application and documents apply to each family member.',kind:'Residency'},
{id:'school',when:()=>s.goal==='family'&&s.dependants==='yes'&&s.school!=='no',headline:'Check school enrolment documents',why:'School enrolment may be part of your plans.',detail:'Ask the intended school which records it will accept, and whether documents issued abroad need additional verification.',kind:'Education'},
{id:'attest',when:()=>s.goal==='family'&&s.dependants==='yes'&&s.school!=='no'&&s.foreignRecords!=='no',headline:'Ask about overseas school records',why:'You have not ruled out overseas-issued school records.',detail:'Before paying for document services, check the intended school’s requirements and the relevant authority’s guidance. Attestation is not assumed.',kind:'Documents'},
{id:'dates',when:()=>s.goal==='family'&&s.stayDates!=='known',headline:'Confirm permitted-stay dates',why:'You have not confirmed current stay dates.',detail:'Check each person’s official permission and dates with the responsible immigration authority or authorised sponsor. A pending application should not be assumed to extend lawful stay.',kind:'Timing'},
{id:'campus',when:()=>s.goal==='student',headline:'Work out your everyday routes',why:'You chose the international-student scenario.',detail:'Compare ways to reach campus using current operator timetables and your actual journey details. This demo does not have live transport data.',kind:'Transport'},
{id:'studentAdmin',when:()=>s.goal==='student',headline:'Find out who manages your paperwork',why:'Universities often coordinate some, but not all, arrival processes.',detail:'Ask your university what it handles, how it sends appointment updates, and what you must complete yourself.',kind:'University'},
{id:'budget',when:()=>s.goal==='everyday',headline:'Map your essential local options',why:'You want help with day-to-day life.',detail:'Choose one need, like groceries, transport or healthcare, and compare information from current providers. Local recommendations are not connected yet.',kind:'Everyday life'}
];
function active(){return QUESTIONS.filter(x=>x.when())}
function save(){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
function field(k,title,opts){return '<label class="buddy-field"><span>'+esc(title)+'</span><select data-buddy-field="'+k+'">'+opts.map(([v,t])=>'<option value="'+v+'"'+(s[k]===v?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>'}
function profile(){
 return '<div class="buddy-fields">'+field('tone','How should I speak to you?',[['friendly','Friendly'],['formal','Professional'],['simple','Simple']])+field('goal','What matters most at the moment?',[['family','Family relocation'],['student','Student life'],['everyday','Everyday life']])+
 (s.goal==='family'?field('dependants','Are you arranging residency for dependants?',[['unknown','Not sure / prefer not to say'],['yes','Yes'],['no','No']])+field('school','Will children be attending school?',[['unknown','Not sure'],['yes','Yes'],['no','No']])+field('foreignRecords','Were any school records issued abroad?',[['unknown','Not sure'],['yes','Yes'],['no','No']])+field('stayDates','Have you confirmed relevant stay dates?',[['unknown','Not yet / unsure'],['known','Yes, with the responsible source']]):'')+'</div>'
}
function adviceCard(c){
 return '<article class="buddy-card"><div class="buddy-card-top"><strong>'+esc(c.headline)+'</strong><span>'+(s.checked[c.id]?'Checked by you':'To check')+'</span></div><p>'+esc(c.detail)+'</p><details><summary>Why did Orivia suggest this?</summary><p>'+esc(c.why)+'</p><p class="buddy-caution">Prototype suggestion only. No case-specific requirement has been independently verified here; contact the responsible organisation.</p></details><label class="buddy-check"><input type="checkbox" data-buddy-check="'+c.id+'" '+(s.checked[c.id]?'checked':'')+'> I checked this with the responsible source</label></article>'
}
function dashboard(){
 const a=active(),out=a.filter(c=>!s.checked[c.id]),done=a.filter(c=>s.checked[c.id]);
 return '<h2>'+esc(tone('Hey! Here’s what I noticed.','Your relocation overview','Your plan'))+'</h2><p class="buddy-sub">Your priorities change when your situation changes. Here are some useful questions to investigate.</p><div class="buddy-metrics"><span><b>'+out.length+'</b> to check</span><span><b>'+done.length+'</b> checked by you</span></div>'+
 (out.length?'<div class="buddy-section-title"><h3>Worth checking next</h3></div>'+out.map(adviceCard).join(''):'<p class="buddy-caution">No outstanding prompts in this limited scenario. This does not establish that all your requirements are complete.</p>')+
 (done.length?'<details class="buddy-previous"><summary>Checks you marked as reviewed ('+done.length+')</summary>'+done.map(adviceCard).join('')+'</details>':'')+
 '<div class="buddy-next"><h3>Something changed?</h3><p>Update your situation and Orivia will reconsider which checks might matter.</p><button type="button" class="buddy-secondary" data-buddy-view="profile">Update my situation →</button></div>';
}
function safeReply(id){
 const a=active();
 const relevant=a.find(c=>c.id===id);
 return relevant?{q:'Why is “'+relevant.headline+'” on my plan?',a:relevant.why+' '+relevant.detail+' This still needs confirmation with the responsible source.'}:null;
}
function chat(){
 const suggestions=active().slice(0,4);
 const topic=reply&&safeReply(reply);
 return '<h2>'+esc(tone('Ask me what we should tackle.','How can I help?','What do you need?'))+'</h2><p class="buddy-sub">For now I can explain the checks in your plan. I’m not a free-form AI chatbot yet, and I won’t make up answers.</p>'+
 '<div class="buddy-bubble"><strong>Orivia</strong><p>'+esc(tone('I’ve looked at what you told me. Want to understand why something is on your plan?','I can explain the recommended checks and their triggers.','Choose a check and I’ll explain it.'))+'</p></div>'+
 (topic?'<div class="buddy-bubble buddy-user"><strong>You</strong><p>'+esc(topic.q)+'</p></div><div class="buddy-bubble"><strong>Orivia</strong><p>'+esc(topic.a)+'</p><button type="button" class="buddy-secondary" data-buddy-view="home">See it in My Life →</button></div>':'')+
 '<div class="buddy-section-title"><h3>Questions to ask</h3></div><div class="buddy-prompts">'+(suggestions.length?suggestions.map(c=>'<button type="button" data-buddy-question="'+c.id+'">Why do I need to check '+esc(c.headline.toLowerCase())+'?</button>').join(''):'<p>Tell me about your goals first.</p>')+'</div>';
}
function draw(){
 const layer=document.getElementById('buddy-lab');if(!layer)return;layer.hidden=!open;
 document.body.classList.toggle('buddy-open',open);if(!open)return;
 layer.innerHTML='<section class="buddy-panel" role="dialog" aria-modal="true" aria-label="Orivia Buddy Lab"><header><span class="buddy-brand">orivia <small>buddy lab · local prototype</small></span><button type="button" data-buddy-close aria-label="Close Buddy Lab">×</button></header><div class="buddy-inner"><nav class="buddy-tabs" aria-label="Buddy Lab navigation">'+[['home','My Life'],['chat','Ask Orivia'],['profile','About me']].map(([k,v])=>'<button type="button" data-buddy-view="'+k+'" aria-current="'+(s.view===k?'page':'false')+'">'+v+'</button>').join('')+'</nav><p class="buddy-caution">Demo only: don’t enter sensitive information. Answers are stored on this device. No official immigration decisions or live government connections.</p>'+
 (s.view==='home'?dashboard():s.view==='chat'?chat():'<h2>What would you like Orivia to know?</h2><p class="buddy-sub">You control what you share. Every answer is optional.</p>'+profile())+
 '<button class="buddy-reset" type="button" data-buddy-reset>Delete my Buddy Lab answers</button></div></section>';
}
function start(){
 const css=document.createElement('link');css.rel='stylesheet';css.href='css/buddy.css';document.head.appendChild(css);
 const button=document.createElement('button');button.type='button';button.className='buddy-launch';button.textContent='✦ Try Orivia Buddy';button.addEventListener('click',()=>{previousFocus=document.activeElement;open=true;draw();let b=document.querySelector('[data-buddy-close]');if(b)b.focus()});
 (document.querySelector('.demo-tools')||document.body).appendChild(button);
 const layer=document.createElement('div');layer.id='buddy-lab';layer.className='buddy-overlay';layer.hidden=true;document.body.appendChild(layer);
 function close(){open=false;draw();if(previousFocus&&previousFocus.focus)previousFocus.focus()}
 layer.addEventListener('click',e=>{
  if(e.target===layer||e.target.closest('[data-buddy-close]')){close();return}
  const v=e.target.closest('[data-buddy-view]');if(v){s.view=v.dataset.buddyView;save();draw();return}
  const q=e.target.closest('[data-buddy-question]');if(q){reply=q.dataset.buddyQuestion;draw();return}
  const del=e.target.closest('[data-buddy-reset]');if(del){if(!confirm('Delete all Buddy Lab answers saved on this device?'))return;s=EMPTY();reply='';try{localStorage.removeItem(KEY)}catch(_){}draw();return}
 });
 layer.addEventListener('change',e=>{
  const fld=e.target.closest('[data-buddy-field]');if(fld){const k=fld.dataset.buddyField;if(!VALID[k]||!VALID[k].includes(fld.value))return;s[k]=fld.value;reply='';save();draw();return}
  const check=e.target.closest('[data-buddy-check]');if(check){s.checked[check.dataset.buddyCheck]=check.checked;save();draw()}
 });
 document.addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'){close()}else if(e.key==='Tab'){const focusable=[...layer.querySelectorAll('button,select,input,summary')].filter(x=>!x.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
