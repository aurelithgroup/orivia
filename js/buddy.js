/* Orivia Buddy Lab v0.2. Local-only prototype; not personalised legal advice. */
(function(){
'use strict';
const KEY='orivia-buddy-lab-v2';
const EMPTY=()=>({tone:'friendly',dependants:'unknown',school:'unknown',foreignRecords:'unknown',stayDates:'unknown',goal:'undecided',checked:{},actions:{},notes:{},deferred:[],view:'home'});
const VALID={tone:['friendly','formal','simple'],dependants:['unknown','yes','no'],school:['unknown','yes','no'],foreignRecords:['unknown','yes','no'],stayDates:['unknown','known'],goal:['undecided','family','student','everyday'],view:['home','chat','profile','plan']};
/* No free-text fields or document uploads in this prototype. */
function read(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');const b=EMPTY();if(s&&typeof s==='object'){Object.keys(VALID).forEach(k=>{if(VALID[k].includes(s[k]))b[k]=s[k]});if(s.checked&&typeof s.checked==='object')Object.keys(s.checked).slice(0,30).forEach(k=>{if(s.checked[k]===true)b.checked[k]=true});if(s.actions&&typeof s.actions==='object')Object.keys(s.actions).filter(k=>QUESTIONS.some(q=>q.id===k)).forEach(k=>{if(['todo','waiting','checked'].includes(s.actions[k]))b.actions[k]=s.actions[k]});if(Array.isArray(s.deferred))b.deferred=s.deferred.filter(k=>['dependants','school','foreignRecords','stayDates'].includes(k)).slice(0,4);}return b}catch(_){return EMPTY()}}
let s, open=false,previousFocus=null,reply='',entryHelp='';
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
s=read();
function active(){return QUESTIONS.filter(x=>x.when())}
function status(id){return s.actions[id]|| (s.checked[id]?'checked':'todo')}
function changeStatus(id,value){if(!QUESTIONS.some(x=>x.id===id)||!['todo','waiting','checked'].includes(value))return;s.actions[id]=value;s.checked[id]=value==='checked';save()}
function actionPlan(){const a=active();const ordered=[...a].sort((x,y)=>{const rank={todo:0,waiting:1,checked:2};return rank[status(x.id)]-rank[status(y.id)]});return ordered}
function save(){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
function field(k,title,opts){return '<label class="buddy-field"><span>'+esc(title)+'</span><select data-buddy-field="'+k+'">'+opts.map(([v,t])=>'<option value="'+v+'"'+(s[k]===v?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>'}
function profile(){
 return '<div class="buddy-fields">'+field('tone','How should I speak to you?',[['friendly','Friendly'],['formal','Professional'],['simple','Simple']])+field('goal','What matters most at the moment?',[['undecided','Not sure yet'],['family','Family relocation'],['student','Student life'],['everyday','Everyday life']])+
 (s.goal==='family'?field('dependants','Are you arranging residency for dependants?',[['unknown','Not sure / prefer not to say'],['yes','Yes'],['no','No']])+field('school','Will children be attending school?',[['unknown','Not sure'],['yes','Yes'],['no','No']])+field('foreignRecords','Were any school records issued abroad?',[['unknown','Not sure'],['yes','Yes'],['no','No']])+field('stayDates','Have you confirmed relevant stay dates?',[['unknown','Not yet / unsure'],['known','Yes, with the responsible source']]):'')+'</div>'
}
function trustRecord(id){
 const registry=window.ORIVIA_BUDDY_SOURCES||{};
 const source=Object.prototype.hasOwnProperty.call(registry,id)?registry[id]:null;
 if(!source)return {label:'Source not recorded',detail:'No official source has been assigned to this suggested check.',url:null};
 /* A link does not constitute verification, even when it points to a government website. */
 if(source.status!=='approved'||!source.reviewedAt||!source.reviewer||!source.reviewDue||Date.parse(source.reviewDue)<Date.now()){
  return {label:source.url?'Official source linked · not independently reviewed':'Applicable source not yet established',
    detail:source.scope||'Applicability has not been checked.',url:source.url||null,title:source.title||null};
 }
 return {label:'Source reviewed · check current applicability',
   detail:source.scope||'',url:source.url||null,title:source.title||null};
}
function trustHtml(id){
 const tr=trustRecord(id);
 return '<div class="buddy-trust"><strong>'+esc(tr.label)+'</strong><p>'+esc(tr.detail)+'</p>'+
 (tr.url?'<a href="'+esc(tr.url)+'" target="_blank" rel="noopener noreferrer">Open '+esc(tr.title||'official source')+' ↗</a>':'<span>Ask the responsible institution for the applicable official guidance.</span>')+
 '</div>';
}
function adviceCard(c){
 const st=status(c.id),isDone=st==='checked',isWaiting=st==='waiting';
 const label=isDone?'I checked this':isWaiting?'Waiting on someone':'To check';
 const next=isDone?'You marked this as checked; Orivia has not independently verified the outcome.':isWaiting?'Follow up with the relevant organisation and update this status when you hear back.':'Start by contacting the responsible school, sponsor, provider or authority described below.';
 return '<article class="buddy-card"><div class="buddy-card-top"><strong>'+esc(c.headline)+'</strong><span>'+label+'</span></div><span class="buddy-category">'+esc(c.kind)+'</span><p>'+esc(c.detail)+'</p><div class="buddy-next-action"><b>Next action</b><p>'+esc(next)+'</p></div><details><summary>Why did Orivia suggest this?</summary><p>'+esc(c.why)+'</p><p class="buddy-caution">Suggested check, not a verified requirement for your case.</p>'+trustHtml(c.id)+'</details><label class="buddy-field buddy-status"><span>Track this check</span><select data-buddy-status="'+esc(c.id)+'"><option value="todo"'+(st==='todo'?' selected':'')+'>I need to check</option><option value="waiting"'+(isWaiting?' selected':'')+'>I contacted someone; waiting</option><option value="checked"'+(isDone?' selected':'')+'>I checked with a responsible source</option></select></label></article>'
}

const DISCOVERY=[
 {key:'dependants',when:()=>s.goal==='family',ask:'Are you organising residency for children or other dependants?',why:'This helps identify whether family-specific checks might be relevant.',options:[['yes','Yes'],['no','No']]},
 {key:'school',when:()=>s.goal==='family'&&s.dependants==='yes',ask:'Will any children be enrolling in school?',why:'School enrolment and residency can require separate checks.',options:[['yes','Yes'],['no','No']]},
 {key:'foreignRecords',when:()=>s.goal==='family'&&s.dependants==='yes'&&s.school==='yes',ask:'Were their school records issued outside the UAE?',why:'We may need to check whether the school expects document verification.',options:[['yes','Yes'],['no','No']]},
 {key:'stayDates',when:()=>s.goal==='family'&&s.dependants==='yes',ask:'Have you confirmed each person’s permitted-stay dates?',why:'An application being processed does not itself establish permission to remain.',options:[['known','Yes, with the responsible source']]}
];
function nextQuestion(){return DISCOVERY.find(q=>q.when()&&s[q.key]==='unknown'&&!s.deferred.includes(q.key))}
function discoveryCard(){
 const q=nextQuestion();
 if(!q)return s.deferred.length?'<section class="buddy-discovery"><span class="buddy-discovery-kicker">✦ Questions paused</span><h3>Want to pick up where we left off?</h3><p>You can revisit anything you weren’t sure about.</p><button type="button" class="buddy-secondary" data-buddy-resume>Ask me again</button></section>':'';
 return '<section class="buddy-discovery" aria-label="A question from Orivia"><span class="buddy-discovery-kicker">✦ Orivia has a question</span><h3>'+esc(q.ask)+'</h3><p>'+esc(q.why)+'</p><div class="buddy-answer-options">'+q.options.map(([v,l])=>'<button type="button" data-buddy-answer="'+q.key+'" data-answer-value="'+v+'">'+esc(l)+'</button>').join('')+'<button type="button" class="buddy-later" data-buddy-later="'+q.key+'">Not sure / ask later</button></div></section>';
}

function recogniseIntent(text){
 const q=String(text||'').trim().toLowerCase();
 if(!q)return null;
 const match=[
  ['family',/\b(family|families|children|child|kids|kid|dependent|dependant|school|spouse|wife|husband|sponsor|residen(?:cy|ce)|visa)\b/i],
  ['student',/\b(university|campus|college|student|studying|lecture|course|semester)\b/i],
  ['everyday',/\b(groceries|grocery|transport|metro|bus|train|shopping|shops|food|clinic|pharmacy|doctor|bank|sim|phone|everyday|daily)\b/i]
 ];
 const found=match.filter(([,rx])=>rx.test(q));
 return found.length===1?found[0][0]:null;
}
function firstVisit(){
 return '<section class="buddy-intro buddy-first"><h2>'+esc(tone('What can I help you with?','What would you like help with?','What do you need help with?'))+'</h2>'+
 '<p>Tell me what’s on your mind. We’ll figure out the next step together.</p>'+
 '<form id="buddy-start-form"><label class="buddy-sr" for="buddy-first-input">What would you like help with?</label><textarea id="buddy-first-input" name="question" rows="3" maxlength="240" placeholder="For example: I’m moving here with my children..." required></textarea><button type="submit" class="buddy-submit">Continue <span aria-hidden="true">→</span></button></form>'+
 (entryHelp?'<p class="buddy-entry-help" role="status">'+esc(entryHelp)+'</p>':'')+
 '<p class="buddy-intro-foot">Early prototype: I can currently help with a few family, student and everyday-life situations. Please don’t share personal identifiers or immigration case details.</p></section>';
}
function focusScreen(){
 if(s.goal==='undecided')return firstVisit();
 const q=nextQuestion(),remaining=actionPlan().filter(x=>status(x.id)!=='checked'),next=remaining[0];
 return '<section class="buddy-focus"><h2>'+esc(tone('What can I help you with today?','How can I assist you today?','How can I help?'))+'</h2>'+
 '<p class="buddy-sub">We’ll focus on one thing at a time.</p>'+
 (q?discoveryCard():next?'<div class="buddy-spotlight"><span>ONE THING WORTH CHECKING</span><h3>'+esc(next.headline)+'</h3><p>'+esc(next.detail)+'</p><button type="button" class="buddy-secondary" data-buddy-view="plan">See why and track it →</button></div>':'<p class="buddy-sub">Nothing new is waiting in this limited example. You can ask about your plan whenever you need it.</p>')+
 '<button type="button" class="buddy-subtle-link" data-buddy-view="plan">View my plan'+(remaining.length?' ('+remaining.length+')':'')+' →</button></section>';
}

function dashboard(){
 const a=actionPlan(),out=a.filter(x=>status(x.id)==='todo'),waiting=a.filter(x=>status(x.id)==='waiting'),done=a.filter(x=>status(x.id)==='checked');
 const first=out[0]||waiting[0];
 if(s.goal==='undecided')return firstVisit();
 return '<h2>'+esc(tone('Hey! Here’s your plan.','Your relocation action plan','Your plan'))+'</h2><p class="buddy-sub">Your plan is shaped by what you tell Orivia. It adjusts when your circumstances change.</p>'+discoveryCard()+
 '<div class="buddy-metrics"><span><b>'+out.length+'</b> to check</span><span><b>'+waiting.length+'</b> waiting</span><span><b>'+done.length+'</b> checked by you</span></div>'+
 (first?'<div class="buddy-spotlight"><span>YOUR NEXT USEFUL ACTION</span><h3>'+esc(first.headline)+'</h3><p>'+esc(status(first.id)==='waiting'?'Follow up with the relevant organisation when appropriate.':first.detail)+'</p></div>':'<p class="buddy-caution">No outstanding checks in this limited demo. This is not confirmation that all requirements are satisfied.</p>')+
 (out.length?'<div class="buddy-section-title"><h3>To check</h3></div>'+out.map(adviceCard).join(''):'')+
 (waiting.length?'<div class="buddy-section-title"><h3>Waiting for a reply</h3></div>'+waiting.map(adviceCard).join(''):'')+
 (done.length?'<details class="buddy-previous"><summary>Checked by you ('+done.length+')</summary>'+done.map(adviceCard).join('')+'</details>':'')+
 '<div class="buddy-next"><h3>Something changed?</h3><p>Update your situation, and Orivia will reconsider which questions may be relevant.</p><button type="button" class="buddy-secondary" data-buddy-view="profile">Update my situation →</button></div>';
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
 layer.innerHTML='<section class="buddy-panel" role="dialog" aria-modal="true" aria-label="Orivia Buddy Lab"><header><span class="buddy-brand">orivia <small>buddy lab · local prototype</small></span><button type="button" data-buddy-close aria-label="Close Buddy Lab">×</button></header><div class="buddy-inner">'+
 (s.goal==='undecided'?'': '<nav class="buddy-tabs" aria-label="Buddy Lab navigation">'+[['home','Home'],['chat','Ask Orivia'],['plan','My plan']].map(([k,v])=>'<button type="button" data-buddy-view="'+k+'" aria-current="'+(s.view===k?'page':'false')+'">'+v+'</button>').join('')+'</nav>')+
 (s.view==='home'?focusScreen():s.view==='plan'?dashboard():s.view==='chat'?chat():'<h2>What would you like Orivia to know?</h2><p class="buddy-sub">You control what you share. Every answer is optional.</p>'+profile())+
 (s.goal==='undecided'?'':'<button class="buddy-subtle-link" type="button" data-buddy-view="profile">Preferences and my situation</button>')+
 '<button class="buddy-reset" type="button" data-buddy-reset>Delete Buddy Lab answers</button></div></section>';
}
function start(){
 const css=document.createElement('link');css.rel='stylesheet';css.href='css/buddy.css';document.head.appendChild(css);
 const button=document.createElement('button');button.type='button';button.className='buddy-launch';button.textContent='✦ Try Orivia Buddy';button.addEventListener('click',()=>{previousFocus=document.activeElement;open=true;draw();let b=document.querySelector('[data-buddy-close]');if(b)b.focus()});
 document.body.appendChild(button);
 const layer=document.createElement('div');layer.id='buddy-lab';layer.className='buddy-overlay';layer.hidden=true;document.body.appendChild(layer);
 function close(){open=false;draw();if(previousFocus&&previousFocus.focus)previousFocus.focus()}
 layer.addEventListener('submit',e=>{if(e.target.id!=='buddy-start-form')return;e.preventDefault();const input=e.target.querySelector('#buddy-first-input');const goal=recogniseIntent(input&&input.value);if(!goal){entryHelp='I’m still learning. I can currently help with family relocation, student life, or everyday needs such as transport and groceries. Could you tell me which of those is closest?';draw();return}s.goal=goal;s.view='home';entryHelp='';save();draw()});
 layer.addEventListener('click',e=>{
  if(e.target===layer||e.target.closest('[data-buddy-close]')){close();return}
  if(e.target.closest('[data-buddy-resume]')){s.deferred=[];save();draw();return}
  const answer=e.target.closest('[data-buddy-answer]');if(answer){const k=answer.dataset.buddyAnswer,v=answer.dataset.answerValue;if(VALID[k]&&VALID[k].includes(v)){s[k]=v;s.deferred=s.deferred.filter(x=>x!==k);reply='';save();draw()}return}
  const later=e.target.closest('[data-buddy-later]');if(later){const k=later.dataset.buddyLater;if(DISCOVERY.some(q=>q.key===k)){s.deferred=[...new Set([...s.deferred,k])];save();draw()}return}
  const goal=e.target.closest('[data-buddy-goal]');if(goal){const g=goal.dataset.buddyGoal;if(VALID.goal.includes(g)&&g!=='undecided'){s.goal=g;s.view='home';s.deferred=[];save();draw()}return}
  const v=e.target.closest('[data-buddy-view]');if(v){s.view=v.dataset.buddyView;save();draw();return}
  const q=e.target.closest('[data-buddy-question]');if(q){reply=q.dataset.buddyQuestion;draw();return}
  const del=e.target.closest('[data-buddy-reset]');if(del){if(!confirm('Delete all Buddy Lab answers saved on this device?'))return;s=EMPTY();reply='';entryHelp='';try{localStorage.removeItem(KEY)}catch(_){}draw();return}
 });
 layer.addEventListener('change',e=>{
  const fld=e.target.closest('[data-buddy-field]');if(fld){const k=fld.dataset.buddyField;if(!VALID[k]||!VALID[k].includes(fld.value))return;const changed=s[k]!==fld.value;s[k]=fld.value;if(changed){s.deferred=[];reply=''}save();draw();return}
  const select=e.target.closest('[data-buddy-status]');if(select){changeStatus(select.dataset.buddyStatus,select.value);draw()}
 });
 document.addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'){close()}else if(e.key==='Tab'){const focusable=[...layer.querySelectorAll('button,select,input,summary')].filter(x=>!x.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
