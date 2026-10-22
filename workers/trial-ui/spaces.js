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
  if(cal.hasOrganisationItem(tag)){done('✓ Already in your calendar');return wrap}
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
   const content=d.content||[],byId=new Map(content.map(c=>[c.id,c]));
   const groups=[['update','Updates'],['date','Important dates'],['guide','Guides'],['contact','Useful contacts']];
   const link=(label,href,ext)=>{const a=node('a','btn quiet small',label);a.href=href;if(ext){a.target='_blank';a.rel='noopener noreferrer'}return a};
   for(const [kind,label] of groups){
    const items=content.filter(c=>c.kind===kind);if(!items.length)continue;
    const group=node('section','organisation-group');group.append(node('h3','',label));
    for(const c of items){
     const item=node('article','card org-item');item.id='org-item-'+c.id;const det=c.details&&typeof c.details==='object'?c.details:{};
     const tag=node('small','org-from','From '+org,true);item.append(tag,node('strong','',c.title,true));
     if(kind==='date'&&det.date)item.append(node('p','org-when',orgWhen(det),true));
     item.append(node('p','organisation-text',c.body,true));
     const actions=node('div','org-actions');
     if(kind==='date'&&det.date)actions.append(calendarAction(c,det,m,org));
     if(kind==='contact'){if(det.phone)actions.append(link('Call','tel:'+det.phone.replace(/[^\d+]/g,'')));if(det.email)actions.append(link('Email','mailto:'+det.email));if(det.website)actions.append(link('Website ↗',det.website,true))}
     if(kind==='guide')actions.append(askAction(c,m,org,actions));
     if(kind==='guide'&&det.sourceUrl)actions.append(link('Source page ↗',det.sourceUrl,true));
     if(kind==='update'){const g=det.relatedId&&byId.get(det.relatedId);if(g&&g.kind==='guide'){const b=node('button','btn quiet small','Open guide: '+g.title,true);b.type='button';b.onclick=()=>{const t=$('org-item-'+g.id);t?.scrollIntoView({behavior:'smooth',block:'start'});t?.classList.add('org-highlight');setTimeout(()=>t?.classList.remove('org-highlight'),1600)};actions.append(b)}
      if(det.actionLabel&&det.actionUrl)actions.append(link(det.actionLabel+' ↗',det.actionUrl,true))}
     if(actions.childElementCount)item.append(actions);group.append(item);
    }
    out.push(group);
   }
   if(!content.length)out.push(node('p','notice','Your organisation hasn’t published anything here yet.'));
   out.push(node('p','tiny','Application progress is not connected yet.'));
   const manage=node('a','btn quiet','Manage membership');manage.href='/platform';out.push(manage);body.replaceChildren(...out);
  }catch(_){if(current(id,g))body.replaceChildren(node('p','notice','This space couldn’t be opened. Your access may have changed. Close it and refresh your spaces.'));}
 }
 async function refresh(){
  const root=$('home-spaces'),list=$('home-spaces-list'),id=user()?.id;if(!root||!list)return;if(!id){clear();return}const g=++generation;
  root.hidden=false;list.replaceChildren(node('p','tiny','Checking your spaces…'));
  try{const d=await (window.OriviaNav?.memberships?window.OriviaNav.memberships(id):get('/api/me/memberships',id));if(!current(id,g))return;memberships=Object.assign([...(d.memberships||[])],{loaded:true});queueMicrotask(followAddress);
   const out=[];for(const m of d.memberships||[]){if(m.status==='active')out.push(m.role==='student'?card(m.name,'Guides, dates and contacts',()=>openSpace(m)):management(m.name+' · '+t(m.role==='admin'?'Admin':'Editor'),'/platform?org='+encodeURIComponent(m.organisationId)));else if(m.status==='requested'){const p=node('div','dashboard-card');p.append(node('strong','',m.name,true),node('small','','Waiting for approval'));out.push(p)}}
   if((d.platformRoles||[]).includes('owner'))out.push(management('Orivia management','/manage'));
   if(!out.length)out.push(node('p','tiny','No organisations connected yet. An invitation adds one after staff approval.'));
   const join=node('a','ask','Join or manage your spaces →');join.href='/platform';out.push(join);list.replaceChildren(...out);
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
 window.OriviaSpaces={refresh,reset:clear,changed(){clear();if(user())refresh()},close,followAddress};
})();
