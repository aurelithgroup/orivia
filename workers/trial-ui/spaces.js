/* Organisation content is fetched for the current session only, never saved in the personal vault or sent to the AI. */
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
 function management(label){const a=node('a','dashboard-card',label,true);a.href='/platform';return a;}
 async function openSpace(m,fromAddress=false){
  if(!fromAddress&&window.OriviaNav)history.pushState(null,'',window.OriviaNav.spacePath(m.organisationId));
  const id=user()?.id;if(!id)return clear();const g=++generation,body=$('organisation-body'),sheet=$('organisation-sheet');if(!body||!sheet)return;
  focusBefore=document.activeElement;$('organisation-title').textContent=m.name;body.replaceChildren(node('p','notice','Loading your organisation’s information…'));sheet.hidden=false;$('organisation-close').focus();
  try{const d=await get('/api/me/orgs/'+encodeURIComponent(m.organisationId),id);if(!current(id,g))return;
   const out=[];if(d.organisation.demo)out.push(node('p','notice','Demo organisation'));
   out.push(node('p','tiny','From your organisation. Your personal chats, calendar and About you remain private.'));
   const labels={guide:'Guides',contact:'Useful contacts',date:'Important dates',update:'Updates'};
   for(const [kind,label] of Object.entries(labels)){
    const items=(d.content||[]).filter(c=>c.kind===kind);if(!items.length)continue;
    const group=node('section','organisation-group');group.append(node('h3','',label));
    for(const c of items){const item=node('article','card');item.append(node('strong','',c.title,true),node('p','organisation-text',c.body,true));group.append(item)}out.push(group);
   }
   if(!(d.content||[]).length)out.push(node('p','notice','Your organisation hasn’t published anything here yet.'));
   out.push(node('p','tiny','Application progress is not connected yet. Organisation dates are not automatically added to your personal calendar.'));
   const manage=node('a','btn quiet','Manage membership');manage.href='/platform';out.push(manage);body.replaceChildren(...out);
  }catch(_){if(current(id,g))body.replaceChildren(node('p','notice','This space couldn’t be opened. Your access may have changed. Close it and refresh your spaces.'));}
 }
 async function refresh(){
  const root=$('home-spaces'),list=$('home-spaces-list'),id=user()?.id;if(!root||!list)return;if(!id){clear();return}const g=++generation;
  root.hidden=false;list.replaceChildren(node('p','tiny','Checking your spaces…'));
  try{const d=await get('/api/me/memberships',id);if(!current(id,g))return;memberships=Object.assign([...(d.memberships||[])],{loaded:true});queueMicrotask(followAddress);
   const out=[];for(const m of d.memberships||[]){if(m.status==='active')out.push(m.role==='student'?card(m.name,'Guides, dates and contacts',()=>openSpace(m)):management(m.name+' · '+t(m.role==='admin'?'Admin':'Editor')));else if(m.status==='requested'){const p=node('div','dashboard-card');p.append(node('strong','',m.name,true),node('small','','Waiting for approval'));out.push(p)}}
   if((d.platformRoles||[]).includes('owner'))out.push(management('Orivia management'));
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
