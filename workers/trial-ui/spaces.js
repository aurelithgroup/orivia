/* Organisation content is fetched for the current session only and never saved in the personal vault. It reaches the AI only
   when the person taps "Ask Orivia about this" on a guide: then only that item, re-read by the server for an active member. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),t=s=>window.OriviaI18n?.text(s)??s;
 let generation=0,focusBefore=null;
 const node=(tag,cls,text,raw=false)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=raw?String(text):t(text);return n};
 const user=()=>window.OriviaAccounts?.user;
 const spaceRe=/^(?:\/app)?\/space\/([A-Za-z0-9-]{1,64})\/?$/,home=()=>location.pathname.startsWith('/app')?'/app':'/';
 function leaveAddress(){if(spaceRe.test(location.pathname))history.pushState(null,'',home())}
 function close(){generation++;const sheet=$('organisation-sheet');if(sheet)sheet.hidden=true;const body=$('organisation-body');if(body)body.replaceChildren();focusBefore?.focus?.();focusBefore=null;}
 function clear(){close();const root=$('home-spaces');if(root)root.hidden=true;$('home-spaces-list')?.replaceChildren();}
 function current(id,g){return user()?.id===id&&generation===g;}
 async function post(path,id,body){const r=await fetch(path,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'X-Orivia-Account':id,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('unavailable');return r.json();}
 async function get(path,id){const r=await fetch(path,{credentials:'same-origin',cache:'no-store',headers:{'X-Orivia-Account':id},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('unavailable');return r.json();}
 function card(name,subtitle,action){const b=node('button','dashboard-card');b.type='button';const copy=node('span','dashboard-copy');copy.append(node('strong','',name,true),node('small','',subtitle));b.append(copy,node('span','dashboard-arrow','›'));b.onclick=action;return b;}
 function management(label,href='/platform'){const a=node('a','dashboard-card',label,true);a.href=href;return a;}
 /* "17:00, Thursday 12 November (Dubai time)": shown in the university's time zone, in the app language. */
 function orgWhen(det){
  const lang=window.OriviaI18n?.language?.()||'en';
  try{if(!det.time){const [y,mo,da]=det.date.split('-').map(Number);return new Intl.DateTimeFormat(lang,{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,mo-1,da)))+' · '+t('All day')}
   const at=window.OriviaCalendar?.instant(det.date,det.time,det.timeZone);if(!at)return det.date+' '+det.time;
   return new Intl.DateTimeFormat(lang,{weekday:'long',day:'numeric',month:'long',hour:'numeric',minute:'2-digit',timeZone:det.timeZone,timeZoneName:'short'}).format(at)}catch(_){return det.date+(det.time?' '+det.time:'')}
 }
 /* "Ask Orivia about this": the first time, explain that the selected guide's text goes to the AI providers with the question. */
 // Save to Library (ORI-LIB-005): keeps a reference (organisation, item, title) only, never the text.
 function saveAction(c,m,org){const b=node('button','btn quiet small','');b.type='button';const ref={org:m.organisationId,content:c.id,title:c.title,orgName:org};
  const paint=()=>{const on=!!window.OriviaChat.isOrgItemSaved?.(ref.org,ref.content);b.textContent=t(on?'Saved in Library ✓':'Save to Library');b.setAttribute?.('aria-pressed',String(on))};paint();
  b.onclick=()=>{const on=!!window.OriviaChat.isOrgItemSaved?.(ref.org,ref.content);if(!(on?window.OriviaChat.unsaveOrgItem(ref):window.OriviaChat.saveOrgItem(ref))){b.textContent=t('Couldn’t save on this device');return}paint()};return b}
 // Opens a saved item: only through the person's active membership; the space itself loads from the server.
 async function openItem(org,content){const id=user()?.id;if(!id)return false;
  let list=memberships;if(!list.loaded){try{const d=await (window.OriviaNav?.memberships?window.OriviaNav.memberships(id):get('/api/me/memberships',id));list=Object.assign([...(d.memberships||[])],{loaded:true});memberships=list}catch(_){return false}}
  const m=list.find(x=>x.organisationId===org&&x.status==='active'&&x.role==='student');if(!m)return false;
  await openSpace(m);const it=$('org-item-'+content);if(it){it.scrollIntoView?.({block:'start'});it.classList.add('org-highlight');setTimeout(()=>it.classList.remove('org-highlight'),1600)}
  else $('organisation-body')?.prepend(node('p','notice','That item isn’t published here any more.'));return true}
 function askAction(c,m,org,actions){
  const b=node('button','btn small','Ask Orivia about this');b.type='button';
  const go=()=>{close();leaveAddress();window.OriviaChat?.useOrgContext({org:m.organisationId,content:c.id,title:c.title,orgName:org})};
  b.onclick=()=>{const seen=!!window.OriviaChat?.aiNoticeSeen?.();
   if(seen)return go();
   const box=node('div','org-confirm');box.append(node('p','tiny','To answer, Orivia sends this guide’s text and your question to OpenAI, or to Cloudflare Workers AI if OpenAI is unavailable. Nothing else from '+org+' is sent, and '+org+' doesn’t see your chat.',true));
   const ok=node('button','btn small','Continue');ok.type='button';const no=node('button','btn quiet small','Cancel');no.type='button';
   ok.onclick=()=>{window.OriviaChat?.markAiNotice?.();go()};no.onclick=()=>box.remove();
   const row=node('div','org-actions');row.append(ok,no);box.append(row);actions.after?actions.after(box):actions.append(box);ok.focus()};
  return b;
 }
 /* "Add to my calendar": confirm first, then save once (duplicates are recognised by organisation and item). */
 function calendarAction(c,det,m,org){
  const wrap=node('div','org-cal'),cal=window.OriviaCalendar,tag={org:m.organisationId,content:c.id,revision:c.revision};
  const done=text=>{wrap.replaceChildren(node('p','tiny org-saved',text))};
  if(!cal){wrap.append(node('p','tiny','Your calendar isn’t available here.'));return wrap}
  const mineSaved=cal.organisationItem?cal.organisationItem(tag):(cal.hasOrganisationItem(tag)?{source:{revision:c.revision}}:null);
  if(mineSaved){const want=det.time?cal.instant(det.date,det.time,det.timeZone):new Date(det.date+'T09:00');
   // Changed since they added it: say so, show both, and update only if they ask.
   if((Number(mineSaved.source?.revision)||0)<(Number(c.revision)||0)&&want&&Math.abs(new Date(mineSaved.at).getTime()-want.getTime())>=60000){
    const was=new Date(mineSaved.at).toLocaleString(undefined,{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
    wrap.append(node('p','tiny org-changed',org+' changed this date after you added it. Your calendar still has '+was+'.',true));
    const up=node('button','btn small','Update my calendar');up.type='button';up.onclick=()=>{const r=cal.updateOrganisationDate({...tag,title:c.title,date:det.date,time:det.time,timeZone:det.timeZone});
     if(r.ok)done('✓ Updated in your calendar');else if(r.reason==='past')done('The new date has passed. Your calendar wasn’t changed.');else wrap.append(node('p','tiny','It couldn’t be updated. Please try again.'))};wrap.append(up);return wrap}
   done('✓ Already in your calendar');return wrap}
  const add=node('button','btn small','Add to my calendar');add.type='button';
  add.onclick=()=>{
   const confirm=node('div','org-confirm');confirm.append(node('p','tiny','Add “'+c.title+'” ('+orgWhen(det)+') to your Orivia calendar? It’s saved for you only; '+org+' isn’t told.',true));
   const yes=node('button','btn small','Add');yes.type='button';const no=node('button','btn quiet small','Cancel');no.type='button';
   yes.onclick=()=>{const r=cal.addOrganisationDate({...tag,title:c.title,date:det.date,time:det.time,timeZone:det.timeZone});
    if(r.ok)done('✓ Added to your calendar');else if(r.reason==='duplicate')done('✓ Already in your calendar');else if(r.reason==='past')done('This date has passed.');else wrap.replaceChildren(node('p','tiny','It couldn’t be saved. Please try again.'),add)};
   no.onclick=()=>wrap.replaceChildren(add);confirm.append(node('div','org-actions'));confirm.lastChild.append(yes,no);wrap.replaceChildren(confirm);yes.focus();
  };
  wrap.append(add);return wrap;
 }
 async function openSpace(m,fromAddress=false){
  if(!fromAddress&&window.OriviaNav)history.pushState(null,'',window.OriviaNav.spacePath(m.organisationId));
  const id=user()?.id;if(!id)return clear();const g=++generation,body=$('organisation-body'),sheet=$('organisation-sheet');if(!body||!sheet)return;
  focusBefore=document.activeElement;$('organisation-title').textContent=m.name;body.replaceChildren(node('p','notice','Loading your organisation’s information…'));sheet.hidden=false;$('organisation-close').focus();
  try{const d=await get('/api/me/orgs/'+encodeURIComponent(m.organisationId),id);if(!current(id,g))return;
   const out=[];if(d.organisation.demo)out.push(node('p','notice','Demo organisation'));
   out.push(node('p','tiny','From your organisation. Your personal chats, calendar and About you remain private.'));
   // A university facility: updates, dates, guides and contacts, each labelled as coming from the university. Buttons appear
   // only for details staff supplied. Nothing personal is sent to the university; dates are saved only after the person confirms.
   const org=d.organisation?.name||m.name,from=node('span','org-from','From '+org,true);from.dataset.org=org;
   const back=node('button','btn quiet small','← My Orivia');back.type='button';back.onclick=()=>{close();leaveAddress()};out.unshift(back);
   out.push(node('p','tiny','Everything below is published by '+org+'. Check dates and requirements with them if anything is unclear.',true));
   // Who to contact (ORI-UNI-015 settings): only details staff supplied, as links the person chooses to open.
   const sc=d.studentContact;if(sc&&sc.label){const help=node('div','card org-contact');help.append(node('strong','','Need help? '+sc.label,true));const row=node('div','org-actions');const a=(label,href,ext)=>{const x=node('a','btn quiet small',label);x.href=href;if(ext){x.target='_blank';x.rel='noopener noreferrer'}return x};
    // A demo (fictional) organisation's phone is shown as text, never as a call link (founder, 29 Oct).
    if(sc.phone)row.append(d.organisation?.demo?node('span','tiny demo-phone','Demo number (not callable): '+sc.phone,true):a('Call','tel:'+sc.phone.replace(/[^\d+]/g,'')));if(sc.email)row.append(a('Email','mailto:'+sc.email));if(sc.website)row.append(a('Website ↗',sc.website,true));if(row.childElementCount)help.append(row);out.push(help)}
   const content=d.content||[],byId=new Map(content.map(c=>[c.id,c]));
   // Progress: the person's own Done marks. The university sees totals only (never names, nothing under the minimum).
   const prog=d.progress&&d.progress.available?d.progress:null,done=new Set(prog?.done||[]);
   const doneButton=c=>{const b=node('button','btn quiet small','');b.type='button';const paint=()=>{const on=done.has(c.id);b.textContent=t(on?'Done ✓':'Mark as done');b.setAttribute('aria-pressed',String(on))};paint();
    b.onclick=async()=>{const want=!done.has(c.id);b.disabled=true;try{await post('/api/me/orgs/'+encodeURIComponent(m.organisationId)+'/progress',id,{contentId:c.id,done:want});if(!current(id,g))return;want?done.add(c.id):done.delete(c.id);paint()}catch(_){if(current(id,g))b.textContent=t('Couldn’t save. Try again.')}finally{b.disabled=false}};return b};
   // Campus directory (area 23): contacts with a category or a location. Only what staff entered is shown; opening and
   // accessibility details they didn't give are said to be not provided. A demo organisation's places are fictional, so
   // they get no map links.
   const DIR={student_hub:'Student hub',international:'International office',library:'Library',printing:'Printing',it:'IT help',health:'Health',wellbeing:'Wellbeing and counselling',accessibility:'Accessibility and disability support',accommodation:'Accommodation',food:'Food and drink',transport:'Transport and parking',security:'Security',other:'Other'},order=Object.keys(DIR);
   const inDirectory=c=>c.kind==='contact'&&!!(c.details?.category||c.details?.building||c.details?.address);
   const groups=[['update','Updates'],['date','Important dates'],['guide','Guides'],['directory','Campus directory'],['contact','Useful contacts']];
   const link=(label,href,ext)=>{const a=node('a','btn quiet small',label);a.href=href;if(ext){a.target='_blank';a.rel='noopener noreferrer'}return a};
   for(const [kind,label] of groups){
    const todayIso=new Date().toISOString().slice(0,10),past=c=>kind==='date'&&c.details?.date&&c.details.date<todayIso;
    const ofKind=c=>kind==='directory'?inDirectory(c):kind==='contact'?c.kind==='contact'&&!inDirectory(c):c.kind===kind;
    const items=content.filter(c=>ofKind(c)&&!past(c)),gone=content.filter(c=>ofKind(c)&&past(c));if(!items.length&&!gone.length)continue;
    if(kind==='directory')items.sort((a,b)=>(order.indexOf(a.details.category||'other')+1||99)-(order.indexOf(b.details.category||'other')+1||99)||a.title.localeCompare(b.title));
    const group=node('section','organisation-group');group.id=kind==='directory'?'campus-directory':'';group.append(node('h3','',label));
    if(kind==='directory'&&d.organisation?.demo)group.append(node('p','tiny','Demo organisation: these places, hours and numbers are fictional.',true));
    for(const c of items){
     const item=node('article','card org-item');item.id='org-item-'+c.id;const det=c.details&&typeof c.details==='object'?c.details:{};
     const tag=node('small','org-from','From '+org,true);item.append(tag,node('strong','',c.title,true));
     if(kind==='date'&&det.date)item.append(node('p','org-when',orgWhen(det),true));
     item.append(node('p','organisation-text',c.body,true));
     if(kind==='directory'){const dd=det,line=(label,value,missing)=>item.append(node('p','tiny org-dir',label+': '+(value||missing),true));
      if(dd.category)item.append(node('p','tiny org-dir-cat',DIR[dd.category]||dd.category,true));
      const where=[dd.building,dd.room].filter(Boolean).join(', ');if(where)line('Where',where);if(dd.address)line('Address',dd.address);
      line('Opening',dd.openingHours,'not provided');line('Accessibility',dd.accessibility,'not provided. Ask the service before you go');if(dd.directions)line('Directions',dd.directions);
      item.append(node('p','tiny org-dir',dd.reviewedOn?'Checked by '+org+' on '+dd.reviewedOn:'Not dated by '+org,true))}
     const actions=node('div','org-actions');
     if(kind==='date'&&det.date)actions.append(calendarAction(c,det,m,org));
     if(prog&&(kind==='guide'||kind==='date'))actions.append(doneButton(c));
     if(kind==='directory'&&det.address&&!d.organisation?.demo){const q=det.address;actions.append(link('Directions in Google Maps ↗','https://www.google.com/maps/search/?'+new URLSearchParams({api:'1',query:q}),true),link('Apple Maps ↗','https://maps.apple.com/?'+new URLSearchParams({q}),true))}
     if(kind==='directory'&&det.sourceUrl)actions.append(link('Source page ↗',det.sourceUrl,true));
     if(kind==='contact'||kind==='directory'){if(det.phone)actions.append(d.organisation?.demo?node('span','tiny demo-phone','Demo number (not callable): '+det.phone,true):link('Call','tel:'+det.phone.replace(/[^\d+]/g,'')));if(det.email)actions.append(link('Email','mailto:'+det.email));if(det.website)actions.append(link('Website ↗',det.website,true))}
     if(kind==='guide')actions.append(askAction(c,m,org,actions));
     if(kind!=='contact'&&kind!=='directory'&&window.OriviaChat?.saveOrgItem)actions.append(saveAction(c,m,org));
     if(kind==='guide'&&det.sourceUrl)actions.append(link('Source page ↗',det.sourceUrl,true));
     if(kind==='update'){const g=det.relatedId&&byId.get(det.relatedId);if(g&&g.kind==='guide'){const b=node('button','btn quiet small','Open guide: '+g.title,true);b.type='button';b.onclick=()=>{const t=$('org-item-'+g.id);t?.scrollIntoView({behavior:'smooth',block:'start'});t?.classList.add('org-highlight');setTimeout(()=>t?.classList.remove('org-highlight'),1600)};actions.append(b)}
      if(det.actionLabel&&det.actionUrl)actions.append(link(det.actionLabel+' ↗',det.actionUrl,true))}
     if(actions.childElementCount)item.append(actions);group.append(item);
    }
    if(gone.length){const fold=document.createElement('details');fold.className='org-past';const sum=document.createElement('summary');sum.textContent=t('Past dates')+' ('+gone.length+')';fold.append(sum);for(const c of gone){const it=node('article','card org-item');it.id='org-item-'+c.id;it.append(node('strong','',c.title,true),node('p','org-when',orgWhen(c.details),true));fold.append(it)}group.append(fold)}
    out.push(group);
   }
   if(!content.length)out.push(node('p','notice','Your organisation hasn’t published anything here yet.'));
   // Sponsored placements (area 16): only approved campaigns inside their dates, after everything the university published,
   // labelled Sponsored with who paid. They are never part of guides, answers or Ask Orivia. A failed read shows nothing.
   try{const sp=await get('/api/me/orgs/'+encodeURIComponent(m.organisationId)+'/sponsorships',id);if(!current(id,g))return;
    if(sp.placements?.length){const group=node('section','organisation-group org-sponsored');group.id='sponsored-placements';group.append(node('h3','','Sponsored'),node('p','tiny','Paid placements. They are not part of '+org+'’s guides or Orivia’s answers, and never change them.',true));
     for(const p of sp.placements){const item=node('article','card org-item org-sponsor');item.append(node('small','org-from','Sponsored',true),node('strong','',p.label,true),node('p','tiny','Paid for by '+p.partnerName+'. '+p.disclosure,true));
      if(d.organisation?.demo)item.append(node('p','tiny','Demo organisation: this sponsor and offer are fictional.',true));
      const a=link('Visit '+p.partnerName+' ↗',p.destination,true);a.rel='sponsored noopener noreferrer';const actions=node('div','org-actions');actions.append(a);item.append(actions);group.append(item)}
     out.push(group)}}catch(_){}
   // Done marks are private to the student (staff totals are paused; Ina 1374ec9).
   if(prog)out.push(node('p','tiny','Your Done marks are private: only you can see them.'));
   out.push(node('p','tiny','Application progress from your university’s own systems is not connected yet.'));
   const manage=node('a','btn quiet','Manage membership');manage.href='/platform';out.push(manage);
   // Leaving (ORI-STUDENT-008): says what changes and what stays, asks twice, then closes the space.
   const leaveNote=node('p','tiny','Leaving ends your membership: its members-only guides and dates close for you and it won’t send you alerts. Your own chats, plans, reminders and files stay yours. Copies you already saved or downloaded aren’t changed, and nothing on anyone else’s device is erased.');
   const leaveMsg=node('p','tiny');leaveMsg.setAttribute?.('role','status');
   const leave=node('button','btn quiet small','Leave '+m.name,true);leave.type='button';leave.onclick=async()=>{
    if(leave.dataset.sure!=='1'){leave.dataset.sure='1';leave.textContent=t('Tap again to leave');return}
    leave.disabled=true;try{await post('/api/me/orgs/'+encodeURIComponent(m.organisationId)+'/leave',id,{confirm:'leave'});if(!current(id,g))return;window.OriviaChat?.clearOrgContextFor?.(m.organisationId);close();leaveAddress();refresh()}
    catch(_){leave.disabled=false;leave.dataset.sure='';leave.textContent='Leave '+m.name;leaveMsg.textContent=t('Couldn’t leave. If you’re this organisation’s only admin, hand over to another admin first; otherwise try again.')}};
   const support=node('section','card');out.push(support,leaveNote,leave,leaveMsg);body.replaceChildren(...out);if(window.OriviaSupport)void window.OriviaSupport.mount(support,m.organisationId,id,{isCurrent:()=>current(id,g)});
  }catch(_){if(current(id,g))body.replaceChildren(node('p','notice','This space couldn’t be opened. Your access may have changed. Close it and refresh your spaces.'));}
 }
 async function refresh(){
  const root=$('home-spaces'),list=$('home-spaces-list'),id=user()?.id;if(!root||!list)return;if(!id){clear();return}const g=++generation;
  root.hidden=false;list.replaceChildren(node('p','tiny','Checking your spaces…'));
  try{const d=await (window.OriviaNav?.memberships?window.OriviaNav.memberships(id):get('/api/me/memberships',id));if(!current(id,g))return;memberships=Object.assign([...(d.memberships||[])],{loaded:true});queueMicrotask(followAddress);
   const out=[];for(const m of d.memberships||[]){if(m.status==='active')out.push(m.role==='student'?card(m.name,'Guides, dates and contacts',()=>openSpace(m)):management(m.name+' · '+t(m.role==='admin'?'Admin':'Editor'),'/platform?org='+encodeURIComponent(m.organisationId)));else if(m.status==='requested'){const p=node('div','dashboard-card');p.append(node('strong','',m.name,true),node('small','','Waiting for approval'));out.push(p)}}
   if((d.platformRoles||[]).includes('owner'))out.push(management('Orivia management','/manage'));
   if(!out.length)out.push(node('p','tiny','No organisations connected yet. An invitation adds one after staff approval.'));
   const join=node('a','ask','Join or manage your spaces →');join.href='/platform';out.push(join);list.replaceChildren(...out);try{const notices=await get('/api/me/notices',id);if(!current(id,g))return;for(const n of notices.notices||[]){const card=node('section','card');card.append(node('strong','',n.title,true),node('p','',n.message,true));list.append(card)}}catch(_){}
  }catch(_){if(current(id,g)){list.replaceChildren(node('p','tiny','Your spaces couldn’t be loaded. Try again when you’re connected.'));const b=node('button','btn quiet small','Try again');b.type='button';b.onclick=refresh;list.append(b)}}
 }
 function closeByUser(){close();leaveAddress()}
 $('organisation-close')?.addEventListener('click',closeByUser);
 $('organisation-sheet')?.addEventListener('click',e=>{if(e.target===$('organisation-sheet'))closeByUser()});
 document.addEventListener('keydown',e=>{const sheet=$('organisation-sheet');if(sheet?.hidden!==false)return;if(e.key==='Escape'){e.preventDefault();closeByUser()}else if(e.key==='Tab'){const controls=[...sheet.querySelectorAll('button,a[href]')];if(!controls.length)return;const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 let memberships=[];
 function followAddress(){const m=location.pathname.match(spaceRe),sheet=$('organisation-sheet');
  if(!m){if(sheet&&!sheet.hidden)close();return}
  const found=memberships.find(x=>x.organisationId===m[1]&&x.status==='active'&&x.role==='student');
  if(found)openSpace(found,true);else if(user()&&memberships.loaded){const body=$('organisation-body');if(body&&sheet){$('organisation-title').textContent=t('Space unavailable');body.replaceChildren(node('p','notice','This space isn’t available to your account. It may need approval, or your access may have changed.'));sheet.hidden=false}}}
 window.addEventListener('popstate',followAddress);
 window.OriviaSpaces={refresh,reset:clear,changed(){clear();if(user())refresh()},close,followAddress,openItem};
})();
