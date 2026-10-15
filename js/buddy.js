/* Orivia Buddy Lab: deliberately local-only, rules-based prototype.
   No identity documents, child names, legal conclusions or network calls. */
(function(){
  'use strict';
  const KEY='orivia-buddy-lab-v1';
  const initial={tone:'friendly',dependants:'unknown',school:'unknown',foreignRecords:'unknown',stayDates:'unknown',goals:{family:true},complete:{}};
  function load(){try{return {...initial,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(_){return {...initial}}}
  let state=load(), open=false;
  const escape=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=(friendly,formal,simple)=>state.tone==='formal'?formal:state.tone==='simple'?simple:friendly;
  function checks(){
    const a=[];
    if(state.dependants==='yes'){
      a.push({id:'family',title:'Confirm each dependent application',why:'You are arranging residency for dependants.',text:'Ask the responsible sponsor or immigration authority which application and supporting documents apply to each person.',level:'check'});
      if(state.school!=='no') a.push({id:'school',title:'Check school enrolment documents',why:'You may be enrolling children in school.',text:'Ask the intended school which records are accepted and whether foreign-issued records need verification or attestation. Requirements vary by school and purpose.',level:'check'});
      if(state.foreignRecords==='yes'||state.foreignRecords==='unknown') a.push({id:'attest',title:'Ask about overseas document verification',why:'You have not ruled out foreign-issued school documents.',text:'Confirm the documents, destination and authority with the school or relevant government office before paying for attestation.',level:'check'});
    }
    if(state.stayDates!=='known') a.push({id:'dates',title:'Confirm permitted-stay dates',why:'You have not confirmed the applicable dates.',text:'Check each person’s current official status and permitted-stay dates with the relevant immigration authority or authorised sponsor. Do not assume an application in progress changes permission to stay.',level:'important'});
    if(!a.length) a.push({id:'explore',title:'Tell Orivia what you want to sort out',why:'There are no unresolved checks from this limited example.',text:'This prototype covers only early family relocation questions. It does not establish that every requirement has been met.',level:'check'});
    return a;
  }
  function choice(key,label,items){return '<label class="buddy-field"><span>'+label+'</span><select data-buddy-key="'+key+'">'+items.map(([v,t])=>'<option value="'+v+'"'+(state[key]===v?' selected':'')+'>'+escape(t)+'</option>').join('')+'</select></label>';}
  function draw(){
    let layer=document.getElementById('buddy-lab');if(!layer)return;
    layer.hidden=!open;if(!open)return;
    const cards=checks().map(c=>'<article class="buddy-card '+(c.level==='important'?'buddy-important':'')+'"><div class="buddy-card-top"><strong>'+escape(c.title)+'</strong><span>'+(state.complete[c.id]?'Checked by you':'To check')+'</span></div><p>'+escape(c.text)+'</p><details><summary>Why am I seeing this?</summary><p>'+escape(c.why)+'</p><p class="buddy-caution">This is a question to verify, not a verified requirement for your individual case. Current official rules have not yet been reviewed for this prototype.</p></details><label class="buddy-check"><input type="checkbox" data-buddy-complete="'+c.id+'" '+(state.complete[c.id]?'checked':'')+'> I have checked this with the appropriate source</label></article>').join('');
    layer.innerHTML='<section class="buddy-panel" role="dialog" aria-modal="true" aria-label="Orivia buddy prototype"><header><span class="buddy-brand">orivia <small>buddy lab · prototype</small></span><button type="button" data-buddy-close aria-label="Close">×</button></header><div class="buddy-inner"><h2>'+escape(label('Hey, let’s get you settled.','Your relocation overview','Your plan'))+'</h2><p class="buddy-sub">Tell me a little about what you need. I’ll look for useful things to check — without guessing about legal requirements.</p><p class="buddy-caution">Demo only. Do not enter real personal immigration details. Answers stay in this browser.</p><div class="buddy-fields">'+choice('tone','How should Orivia speak?', [['friendly','Friendly'],['formal','Professional'],['simple','Simple']])+choice('dependants','Are you arranging residency for dependants?', [['unknown','Not sure / prefer not to say'],['yes','Yes'],['no','No']])+choice('school','Will children be enrolled in school?', [['unknown','Not sure'],['yes','Yes'],['no','No']])+choice('foreignRecords','Are the school records issued abroad?', [['unknown','Not sure'],['yes','Yes'],['no','No']])+choice('stayDates','Have you checked the relevant permitted-stay dates?', [['unknown','Not yet / not sure'],['known','Yes, with an appropriate source']])+'</div><div class="buddy-section-title"><h3>Things worth checking</h3><span>'+checks().filter(c=>!state.complete[c.id]).length+' outstanding</span></div>'+cards+'<button type="button" class="buddy-reset" data-buddy-reset>Clear my demo answers</button></div></section>';
    const close=layer.querySelector('[data-buddy-close]');close&&close.focus({preventScroll:true});
  }
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_){}}
  function start(){
    const css=document.createElement('link');css.rel='stylesheet';css.href='css/buddy.css';document.head.appendChild(css);
    const button=document.createElement('button');button.type='button';button.className='buddy-launch';button.textContent='✦ Try Orivia Buddy';button.addEventListener('click',()=>{open=true;draw()});
    (document.querySelector('.demo-tools')||document.body).appendChild(button);
    const layer=document.createElement('div');layer.id='buddy-lab';layer.className='buddy-overlay';layer.hidden=true;document.body.appendChild(layer);
    layer.addEventListener('click',e=>{if(e.target===layer||e.target.closest('[data-buddy-close]')){open=false;draw();return}
      if(e.target.closest('[data-buddy-reset]')){state={...initial,goals:{family:true},complete:{}};persist();draw();return}
      const c=e.target.closest('[data-buddy-complete]');if(c){state.complete[c.dataset.buddyComplete]=c.checked;persist();draw()}
    });
    layer.addEventListener('change',e=>{const el=e.target.closest('[data-buddy-key]');if(!el)return;state[el.dataset.buddyKey]=el.value;state.complete={};persist();draw()});
    document.addEventListener('keydown',e=>{if(open&&e.key==='Escape'){open=false;draw()}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
