/* Account UI and local storage isolation. Auth cookies are HttpOnly; no token is stored in localStorage or sessionStorage. */
(function(){
 'use strict';
 document.title='Orivia';
 let native;try{native=window.localStorage}catch(_){native={getItem(){throw Error('storage_unavailable')},setItem(){throw Error('storage_unavailable')},removeItem(){throw Error('storage_unavailable')}}}
 const keys={profile:'orivia-private-profile-v1',events:'orivia-private-events-v1',journeys:'orivia-private-journeys-v1',chats:'orivia-private-chats-v1'},privateKeys=new Set([...Object.values(keys),'orivia-private-chats-v1-unreadable']);
 let user=null,scope=null,callbacks=null,config={},revision=0,ready=false,paused=false,timer=null,syncing=false,generation=0,screen='welcome',email='';
 let copyNodes=[],arrival=null;const arrivalKey='orivia-pending-arrival-v1';
 const $=id=>document.getElementById(id),t=s=>window.OriviaI18n?.text(s)??s;
 const prefix=id=>'orivia-account:'+encodeURIComponent(id)+':';
 const key=k=>scope&&privateKeys.has(k)?prefix(scope)+k:k;
 const storage={getItem:k=>native.getItem(key(k)),setItem(k,v){native.setItem(key(k),v);if(privateKeys.has(k))changed()},removeItem(k){native.removeItem(key(k));if(privateKeys.has(k))changed()}};
 globalThis.OriviaAccountStorage={storage};
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined){if(tag==='label')n.append(el('span','',text));else{n.textContent=t(text);copyNodes.push([n,text])}}return n};
 function btn(text,fn,quiet=false){const b=el('button','btn'+(quiet?' quiet':''),text);b.type='button';b.onclick=fn;return b}
 function jsonRead(k,base,fallback){const value=base.getItem(k);return value===null?fallback:JSON.parse(value)}
 function snapshot(base=storage){return {version:1,profile:jsonRead(keys.profile,base,null),events:jsonRead(keys.events,base,[]),journeys:jsonRead(keys.journeys,base,{}),chats:jsonRead(keys.chats,base,{chats:[],active:null})}}
 function empty(){return {version:1,profile:null,events:[],journeys:{},chats:{chats:[],active:null}}}
 function putLocal(data){for(const k of Object.keys(keys)){if(data[k]===null)native.removeItem(key(keys[k]));else native.setItem(key(keys[k]),JSON.stringify(data[k]))}}
 function clearAccountCopy(owner){
  const start=prefix(owner),remove=[];
  for(let i=0;i<native.length;i++){const k=native.key(i);if(k?.startsWith(start))remove.push(k)}
  for(const k of remove)native.removeItem(k);
 }
 function dirtyKey(){return prefix(scope)+'unsynced'}
 function changed(){if(!user||!scope||!ready)return;generation++;native.setItem(dirtyKey(),'1');clearTimeout(timer);if(!paused)timer=setTimeout(()=>sync().catch(()=>{}),900)}
 function note(text){const n=$('account-status');if(n)n.textContent=t(text);const banner=$('account-sync-banner');if(banner){banner.hidden=!user||text==='Saved to your account.'||text==='Your chats and plans are saved to your private account.';$('account-sync-note').textContent=t(text)}}
 async function api(path,{method='GET',body,headers={}}={}){const r=await fetch(path,{method,signal:AbortSignal.timeout(12000),credentials:'same-origin',cache:'no-store',headers:{...(user?{'X-Orivia-Account':user.id}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});const d=await r.json().catch(()=>({}));if(!r.ok){const e=Error(d.error||d.code||'request_failed');e.status=r.status;throw e}return d}
 async function sync(){if(!ready||!user||paused||syncing)return;syncing=true;const sentGeneration=generation,owner=scope;
  try{const result=await api('/api/account/vault',{method:'PUT',headers:{'If-Match':String(revision)},body:snapshot()});if(scope!==owner)return;revision=result.revision;if(generation===sentGeneration)native.removeItem(dirtyKey());note('Saved to your account.');}
  catch(e){if(scope!==owner)return;if(e.status===409){paused=true;note('Another device saved a newer version. Sync is paused; your device copy is kept.')}else note('Not synced yet. Your device copy is kept.');throw e}
  finally{syncing=false;if(!paused&&generation!==sentGeneration)timer=setTimeout(()=>sync().catch(()=>{}),900)}
 }
 function applyCopy(){
  window.OriviaSpaces?.changed();window.OriviaNotifications?.changed();
  const banner=$('account-sync-banner');if(banner&&!user)banner.hidden=true;
  const settings=$('account-open-settings');if(settings){settings.hidden=!(config.email||config.google||config.apple);settings.onclick=()=>apiObject.open()}
  const review=$('account-sync-review');if(review)review.onclick=()=>apiObject.open();
  const end=$('end-session');if(end&&user)end.textContent=t('Your account');
  for(const n of document.querySelectorAll('[data-account-copy]'))n.textContent=t(user?n.dataset.accountCopy:n.dataset.deviceCopy);
  const label=$('account-open');if(label)label.hidden=!(config.email||config.google||config.apple);if(label)label.textContent=t(user?'Your account':'Sign in or create an account');
  const name=$('life-display-name');if(name&&user)name.textContent=user.name||t('Your personal space');
 }
 function hideApp(){window.OriviaNotifications?.reset();window.OriviaSpaces?.reset();callbacks?.leave();$('intro').hidden=true;$('workspace').hidden=true;$('nav').hidden=true;$('open-chats').hidden=true;$('open-settings').hidden=true;}
 function shell(title,subtitle){hideApp();copyNodes=[];document.body.dataset.accountFlow='on';const root=$('account-entry');root.hidden=false;root.replaceChildren();const brand=document.querySelector('header .brand')?.cloneNode(true);if(brand){brand.classList.add('auth-brand');root.append(brand)}const content=el('div','auth-content');root.append(content);languagePicker(content);if(title)content.append(el('h1','',title));if(subtitle)content.append(el('p','notice',subtitle));const status=el('p','notice');status.id='account-flow-status';status.setAttribute('role','status');content.append(status);return content}
 function languagePicker(root){
  const label=el('label','field','Language'),select=el('select');label.style.alignSelf='flex-end';label.style.width='fit-content';select.style.minHeight='44px';select.setAttribute('aria-label',t('Language'));
  for(const [code,name] of [['en','English'],['fr','Français'],['ar','العربية']]){const option=el('option','',name);option.value=code;select.append(option)}
  select.value=window.OriviaI18n?.language?.()||'en';select.onchange=()=>{window.OriviaI18n?.setLanguage?.(select.value);try{const settings=JSON.parse(native.getItem('orivia-private-settings-v1')||'{}');native.setItem('orivia-private-settings-v1',JSON.stringify({...settings,language:select.value}))}catch(_){}for(const [node,source] of copyNodes)node.textContent=t(source)};label.append(select);root.append(label);
 }
 function hasSavedPersonalData(){try{const d=snapshot(native);return !!(d.profile||d.events.length||Object.keys(d.journeys).length||d.chats.chats.length)}catch(_){return true}}
 async function loadArrival(){
  if(!location.search)return;const query=new URLSearchParams(location.search||''),slug=query.get('organisation');if(!slug||!/^([a-z0-9]+-)*[a-z0-9]+$/.test(slug)||slug.length<3||slug.length>64)return;
  const d=await api('/api/public/orgs/'+encodeURIComponent(slug));let token='';
  const match=String(location.hash||'').match(/^#join=([a-f0-9]{64})$/);if(match){token=match[1];sessionStorage.setItem(arrivalKey,JSON.stringify({slug,token}));history.replaceState(null,'',location.pathname+location.search)}
  else try{const saved=JSON.parse(sessionStorage.getItem(arrivalKey)||'null');if(saved?.slug===slug&&/^[a-f0-9]{64}$/.test(saved.token))token=saved.token}catch(_){}
  document.title=d.organisation.name+' · Orivia';
  arrival={organisation:d.organisation,defaults:d.arrival,token,status:null,role:null};
 }
 function leaveArrival(){document.title='Orivia';arrival=null;try{sessionStorage.removeItem(arrivalKey);history.replaceState(null,'',location.pathname||'/')}catch(_){}}
 function personalInstead(){leaveArrival();if(user){restore().catch(fail)}else signIn()}
 async function resumeArrival(vault){
  if(!arrival.defaults){const box=shell('University setup is not ready',arrival.organisation.name);box.append(el('p','notice','Your organisation has not set its campus destination yet. Ask its staff, or continue with personal Orivia.'),btn('Continue with personal Orivia',personalInstead,true));return}
  if(native.getItem(dirtyKey())){paused=true;ready=true;enter();return}
  if(vault.data){putLocal(vault.data);ready=true;enter()}else setup();
 }
 async function checkArrival(vault){
  const owner=scope,entry=arrival,d=await api('/api/me/memberships');if(scope!==owner||arrival!==entry)return;
  const m=d.memberships?.find(m=>m.organisationId===entry.organisation.id);if(m){entry.status=m.status;entry.role=m.role;await resumeArrival(vault);return}
  const box=shell('Join your university’s Orivia',entry.organisation.name);
  box.append(el('p','notice','Your university can see your membership name and email. It cannot see your personal chats or plans. Student access needs staff approval.'));
  if(!entry.token){box.append(el('p','notice','Ask your university for an Orivia invitation link. Signing in alone does not grant membership.'));}
  else{try{const invitation=await api('/api/invitations/inspect',{method:'POST',body:{token:entry.token}});if(scope!==owner||arrival!==entry)return;
   if(invitation.organisation.id!==entry.organisation.id||invitation.role!=='student'||!invitation.available)throw Error('invalid_invitation');
   box.append(btn('Request to join',async()=>{try{if(scope!==owner||arrival!==entry)return;const result=await api('/api/invitations/join',{method:'POST',body:{token:entry.token}});if(scope!==owner||arrival!==entry)return;entry.status=result.membership.status;entry.role=result.membership.role;entry.token='';sessionStorage.removeItem(arrivalKey);await resumeArrival(vault)}catch(e){fail(e)}}));
  }catch(_){box.append(el('p','notice','This invitation is unavailable, expired or for a different organisation. Ask your university for a new invitation.'))}}
  box.append(btn('Continue with personal Orivia',personalInstead,true));
 }
 async function universityHome(){
  const entry=arrival,owner=scope,box=shell(entry.organisation.name,'Your university space');
  box.append(btn('My Orivia',()=>{leaveArrival();enter()},true));if(window.OriviaNotifications)box.append(btn('Notifications and alerts',()=>window.OriviaNotifications.inbox(),true));
  if(entry.organisation.demo)box.append(el('p','notice','Demo organisation'));
  if(entry.status!=='active'){box.append(el('h2','','Waiting for approval'),el('p','notice','Your request is with your university. Private guides and updates appear after staff approve it.'),btn('Check approval',()=>restore().catch(fail),true));return}
  if(entry.role!=='student'){const a=el('a','btn','Open organisation dashboard');a.href='/platform';box.append(a);return}
  const loading=el('p','notice','Loading your organisation’s information…');box.append(loading);
  try{const d=await api('/api/me/orgs/'+encodeURIComponent(entry.organisation.id));if(scope!==owner||arrival!==entry)return;loading.remove();
   box.append(el('p','tiny','From your organisation. Your personal chats, calendar and About you remain private.'));
   for(const [kind,label] of [['guide','Guides'],['date','Important dates'],['contact','Useful contacts'],['update','Updates']]){const items=(d.content||[]).filter(c=>c.kind===kind);if(!items.length)continue;box.append(el('h2','',label));for(const c of items){const item=el('article','card');item.append(el('h3','',c.title),el('p','organisation-text',c.body));box.append(item)}}
   if(!d.content?.length)box.append(el('p','notice','Your organisation hasn’t published anything here yet.'));
  }catch(_){if(scope===owner&&arrival===entry)loading.textContent=t('This space couldn’t be opened. Your access may have changed. Close it and refresh your spaces.')}
 }
 function fail(e){const n=$('account-flow-status');if(n)n.textContent=t(e.status===429?'Please wait before trying again.':'That didn’t work. Check the details and try again.');}
 function guest(skipSetup=false){if(skipSetup!==true&&!scope&&!hasSavedPersonalData()){personalSetup({guestMode:true});return}const leavingAccount=!!scope;delete document.body.dataset.accountFlow;user=null;scope=null;ready=false;paused=false;clearTimeout(timer);$('account-entry').hidden=true;applyCopy();if(sessionStorage.getItem('orivia-ai-private-consent')==='yes'){if(leavingAccount||$('workspace').hidden)callbacks.reload()}else consentEntry();}
 function welcome(){signIn()}
 function signIn(signup=false){signup=signup===true;screen='signin';const box=shell(arrival?arrival.organisation.name:signup?'Create your Orivia account':'Sign in to Orivia',signup?'Your own space, wherever you’re going.':'Welcome back. Your next step starts here.');
  if(arrival){box.append(el('p','notice','Welcome to your university’s Orivia. University single sign-on is not connected yet; use your Orivia email sign-in for this pilot.'),el('p','tiny','Don’t have access? Ask your university for your Orivia invitation.'),btn('Continue with personal Orivia',personalInstead,true));if(arrival.organisation.demo)box.append(el('p','tiny','Demo organisation'));}
  for(const provider of ['google','apple'])if(config[provider])box.append(btn(provider==='google'?'Continue with Google':'Continue with Apple',async()=>{try{const d=await api('/api/auth/sign-in/social',{method:'POST',body:{provider,callbackURL:location.origin+'/'}});const u=new URL(d.url);if(!['https:'].includes(u.protocol))throw Error('Invalid redirect');location.assign(u.href)}catch(e){fail(e)}},true));
  if(config.email){const form=el('form','auth-form'),label=el('label','field','Email address'),input=el('input');input.type='email';input.required=true;input.autocomplete='email';input.placeholder='you@example.com';label.append(input);const send=el('button','btn','Continue with email');send.type='submit';form.append(label,send);form.onsubmit=async e=>{e.preventDefault();send.disabled=true;email=input.value.trim();try{await api('/api/auth/email-otp/send-verification-otp',{method:'POST',body:{email,type:'sign-in'}});codeScreen()}catch(e){fail(e)}finally{send.disabled=false}};box.append(form)}
  if(config.email||config.google||config.apple)box.append(el('p','tiny',signup?'Already have an account?':'Don’t have an account?'),btn(signup?'Sign in':'Sign up',()=>signIn(!signup),true));else box.append(el('p','tiny','Accounts are coming. You can use Orivia as a guest.'));
  box.append(btn('Continue as a guest',()=>{leaveArrival();guest()},true),el('p','tiny','No password needed. We email you a one-time sign-in code. New email addresses create an account. As a guest, your data stays in this browser.'));
  if(window.top!==window){const note=el('p','tiny','This is a preview. Chats you start here stay in the preview and won’t appear when you open Orivia full screen.');const a=el('a','','Open Orivia full screen');a.href='/';a.target='_blank';a.rel='noopener';a.className='btn';box.append(note,a)}
 }
 function codeScreen(){screen='code';const box=shell('Check your email','Enter the six-digit code we sent you.');box.prepend(btn('← Back',signIn,true));box.append(el('p','tiny',email));const form=el('form','auth-form'),label=el('label','field','Sign-in code'),input=el('input');input.inputMode='numeric';input.pattern='[0-9]{6}';input.maxLength=6;input.autocomplete='one-time-code';input.required=true;label.append(input);const send=el('button','btn','Continue');send.type='submit';form.append(label,send);form.onsubmit=async e=>{e.preventDefault();send.disabled=true;try{await api('/api/auth/sign-in/email-otp',{method:'POST',body:{email,otp:input.value}});await restore()}catch(e){fail(e)}finally{send.disabled=false}};box.append(form,btn('Send a new code',async()=>{try{await api('/api/auth/email-otp/send-verification-otp',{method:'POST',body:{email,type:'sign-in'}});$('account-flow-status').textContent=t('A new code has been sent.')}catch(e){fail(e)}},true));}
 async function restore(){const d=await api('/api/account/session');user=d.user;scope=user.id;ready=false;paused=false;const vault=await api('/api/account/vault');revision=vault.revision;
  if(arrival){await checkArrival(vault);return}
  if(native.getItem(dirtyKey())){paused=true;ready=true;enter();note('Not synced yet. Your device copy is kept.');return}
  if(vault.data){putLocal(vault.data);ready=true;enter();return}
  setup();
 }
 function setup(){screen='setup';const box=shell('What should we call you?','Set up your space.');const label=el('label','field','Preferred name'),name=el('input');name.maxLength=60;name.value=user.name&&user.name!==user.email?user.name:'';label.append(name);box.append(label,el('h2','','Your saved things'),el('p','notice','Choose what to bring from this device. Nothing is added automatically.'));
  const choices=el('div','auth-choices');let source;try{source=snapshot(native)}catch(_){source=null}
  const selected=new Set();if(source)for(const category of ['chats','events','journeys','profile']){const lab=el('label','auth-choice'),check=el('input');check.type='checkbox';check.onchange=()=>{check.checked?selected.add(category):selected.delete(category)};lab.append(check,el('span','',({chats:'Chats',events:'Reminders',journeys:'Journeys',profile:'About you'})[category]));choices.append(lab)}else box.append(el('p','notice','Device data could not be read. It has not been changed.'));
  box.append(choices,el('p','tiny','Leave these unchecked to start fresh. Your original device data is kept.'));
  const save=btn('Continue',async()=>{save.disabled=true;try{const data=empty();for(const k of selected)data[k]=source[k];personalSetup({data,preferredName:name.value.trim()});
  }catch(e){fail(e)}finally{save.disabled=false}});box.append(save,btn('Start without importing',()=>personalSetup({data:empty(),preferredName:name.value.trim()}),true),el('p','tiny','Your personal chats are not shared with your institution.'));
 }
 function personalSetup({data=empty(),preferredName='',guestMode=false}={}){
  screen='onboarding';const owner=scope,box=shell('Make yourself at home','A few details help Orivia give you a useful starting point. You can change them in My Life.');
  const p=data.profile||{},fields={},campus=arrival?.defaults||null;
  const field=(key,label,value='',options=null)=>{const lab=el('label','field',label),input=el(options?'select':'input');input.id='onboard-'+key;
   if(options){for(const [v,title] of options){const option=el('option','',title);option.value=v;input.append(option)}}else input.maxLength=60;
   input.value=value;fields[key]=input;lab.append(input);box.append(lab);return input};
  field('name','What should we call you?',preferredName||p.displayName||'');
  const countries=[['','Not sure yet / prefer not to say']];let names;try{names=new Intl.DisplayNames([window.OriviaI18n?.language?.()||'en'],{type:'region'})}catch(_){}
  for(const code of 'AE GB AF AL DZ AD AO AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA US UY UZ VU VA VE VN YE ZM ZW'.split(' '))countries.push([code,names?.of(code)||code]);
  const origin=field('origin','Where are you moving from?',p.originCountry||'',countries);
  field('originTown','City or town (optional)',p.originTown||'');
  const stage=field('stage','Have you already moved?',['uae','uk'].includes(p.here)?'moved':'planning',[['planning','I’m planning my move'],['moved','I’ve already moved']]);
  const dest=field('destination','Where are you moving to?',p.dest||(['uae','uk'].includes(p.here)?p.here:''),[['','Not sure yet'],['uae','UAE'],['uk','UK']]);
  const region=field('region','Emirate / nation (optional)','',[['','Not sure yet']]);const fillRegion=()=>{region.replaceChildren();for(const value of ['',...(dest.value==='uae'?['Abu Dhabi','Ajman','Dubai','Fujairah','Ras Al Khaimah','Sharjah','Umm Al Quwain']:dest.value==='uk'?['England','Scotland','Wales','Northern Ireland']:[])]){const option=el('option','',value||'Not sure yet');option.value=value;region.append(option)}region.disabled=!dest.value};fillRegion();region.value=p.destRegion||p.region||'';dest.onchange=fillRegion;
  field('town','Destination city or area (optional)',p.destTown||p.town||'');
  field('reason','What brings you here?',p.who||'',[['','Not sure yet'],['study','Study'],['work','Work'],['join or bring my family','Family'],['something else','Something else']]);
  if(campus){dest.value=campus.country;fillRegion();region.value=campus.region;fields.town.value=campus.town;fields.reason.value=campus.reason;for(const input of [dest,region,fields.town,fields.reason])input.disabled=true;box.append(el('p','tiny','Destination and reason are set by your university for this campus. They cannot be edited here.'));}
  const terms=el('details','card');terms.append(el('summary','','Pilot terms and privacy'),el('p','tiny','Orivia is an early service for practical information and planning. Check important decisions with the relevant authority or professional. It does not submit applications or act for you unless a feature explicitly says so and you confirm.'),el('p','tiny',guestMode?'As a guest, your chats, profile and plans stay in this browser on this device. Clearing browser data can remove them.':'Signed-in personal chats, profile and plans are saved to your private account and cached on this device. Your institution cannot see your personal chats through its dashboard.'),el('p','tiny','With your separate AI agreement, your messages and recent conversation go to OpenAI, or Cloudflare Workers AI if unavailable. General search terms go to Brave Search. Never send passwords or passport, visa or ID numbers. Microphone, location and camera permissions are requested only when you use those features.'),el('p','tiny','You can review your data in Settings. Downloads and copies on other devices are not remotely erased. These pilot notices are not the final public terms and privacy policy.'));box.append(terms);
  const agreement=el('label','auth-choice'),accept=el('input');accept.type='checkbox';agreement.append(accept,el('span','','I accept the pilot terms above.'));
  const privacy=el('label','auth-choice'),read=el('input');read.type='checkbox';privacy.append(read,el('span','','I have read the privacy information above.'));box.append(agreement,privacy);const startControls=el('section');box.append(startControls);callbacks.mountStart?.(startControls);
  const save=btn('Let’s get started',async()=>{if(!accept.checked||!read.checked){fail({});const status=$('account-flow-status');if(status)status.textContent=t('Please accept the pilot terms and read the privacy information before continuing.');return}
   if(scope!==owner)return;save.disabled=true;try{
    if(callbacks.authorizeStart&&!await callbacks.authorizeStart())return;if(scope!==owner)return;
    const destination=dest.value,planning=stage.value==='planning',now=new Date().toISOString();
    data.profile={...p,displayName:fields.name.value.trim(),originCountry:origin.value,originTown:fields.originTown.value.trim(),here:planning?'away':destination,dest:planning?destination:'',region:planning?'':region.value.trim(),town:planning?'':fields.town.value.trim(),destRegion:planning?region.value.trim():'',destTown:planning?fields.town.value.trim():'',who:fields.reason.value,onboarding:{version:1,completedAt:now,termsVersion:'pilot-2026-10-20',privacyVersion:'pilot-2026-10-20',language:window.OriviaI18n?.language?.()||'en'}};
    const place=[fields.town.value.trim(),region.value.trim(),destination==='uae'?'UAE':destination==='uk'?'UK':''].filter(Boolean).join(', ');data.profile.city=planning?'':place;data.profile.movingTo=planning?place:'';data.profile.movedFrom=[fields.originTown.value.trim(),origin.value?names?.of(origin.value)||origin.value:''].filter(Boolean).join(', ');
    if(!guestMode){if(fields.name.value.trim()){await api('/api/auth/update-user',{method:'POST',body:{name:fields.name.value.trim()}});if(scope!==owner)return;user.name=fields.name.value.trim()}const result=await api('/api/account/vault',{method:'PUT',headers:{'If-Match':String(revision)},body:data});if(scope!==owner)return;revision=result.revision}
    putLocal(data);if(guestMode){guest(true)}else{ready=true;enter()}
   }catch(e){fail(e)}finally{save.disabled=false}});box.append(save,btn('Back',()=>guestMode?signIn():setup(),true));
 }
 function consentEntry(){
  screen='consent';const owner=scope,box=shell('Before we begin','Choose whether to use AI, then open your Orivia.');
  const controls=el('section');box.append(controls);callbacks.mountStart?.(controls);
  const start=btn('Let’s get started',async()=>{start.disabled=true;try{if(scope!==owner)return;if(!callbacks.authorizeStart||!await callbacks.authorizeStart())return;if(scope!==owner)return;enter()}catch(e){fail(e)}finally{start.disabled=false}});
  box.append(start,btn('Back',()=>user?accountPanel():signIn(),true));
 }
 function enter(){if(sessionStorage.getItem('orivia-ai-private-consent')!=='yes'){consentEntry();return}if(window.OriviaNotifications?.offer(enter))return;if(arrival){universityHome().catch(fail);return}delete document.body.dataset.accountFlow;$('account-entry').hidden=true;applyCopy();callbacks.reload();}
 function accountPanel(){const panelOwner=scope;screen='account';const box=shell('Your account',user?user.email:'');box.prepend(btn('← Back',enter,true));if(!user){signIn();return}
  const status=el('p','notice');status.id='account-status';status.setAttribute('role','status');box.append(status);note(paused?'Sync is paused. Your device copy is kept.':'Your chats and plans are saved to your private account.');
  box.append(el('p','tiny','Logging out clears this account’s synced personal copy and recovery backups from this browser. If changes are unsynced, you can explicitly keep them to recover after signing in again. Guest data and downloaded files stay.'),btn('Sync now',async()=>{if(paused){note('Sync is paused. Review the account version first.');return}try{await sync()}catch(_){}}),btn('Review the account version',async()=>{try{if(scope!==panelOwner)return;const reviewedGeneration=generation;const remote=await api('/api/account/vault');if(scope!==panelOwner||screen!=='account')return;const review=el('section','card');review.append(el('p','notice','Loading the account version replaces this device’s account copy. A backup is kept on this device.'));
   review.append(btn('Load account version',()=>{try{if(scope!==panelOwner||screen!=='account')return;if(generation!==reviewedGeneration){note('Your device copy changed. Open the account review again before replacing it.');return}native.setItem(prefix(scope)+'before-reload',JSON.stringify(snapshot()));putLocal(remote.data||empty());revision=remote.revision;native.removeItem(dirtyKey());paused=false;generation=0;ready=true;enter()}catch(e){fail(e)}},true),btn('Keep this device copy',()=>review.remove(),true));box.append(review)}catch(e){fail(e)}},true),btn('Log out',async()=>{try{if(scope!==panelOwner)return;callbacks.cancelReply?.();if(native.getItem(dirtyKey())){const review=el('section','card');review.append(el('p','notice','Your latest changes are not synced. You can log out and keep this account’s unsynced copy on this device. Sign in again on this device to recover it.'));review.append(btn('Log out and keep unsynced copy',async()=>{try{if(scope!==panelOwner)return;await api('/api/auth/sign-out',{method:'POST',body:{}});if(scope!==panelOwner)return;clearTimeout(timer);user=null;scope=null;ready=false;paused=false;welcome()}catch(e){fail(e)}},true),btn('Stay signed in',()=>review.remove(),true));box.append(review);return}await api('/api/auth/sign-out',{method:'POST',body:{}});if(scope!==panelOwner)return;clearTimeout(timer);clearAccountCopy(panelOwner);user=null;scope=null;ready=false;paused=false;welcome()}catch(e){fail(e)}},true));
  box.append(el('p','tiny','Downloads contain private information. Keep them somewhere safe. They include this device’s personal copy, including changes not yet synced; organisation records are not included.'),btn('Download my personal data',()=>{try{
   if(scope!==panelOwner||!user)return;
   const data={format:'orivia-personal-export',version:1,exportedAt:new Date().toISOString(),account:{name:user.name,email:user.email},source:'current device account copy',unsynced:!!native.getItem(dirtyKey()),data:snapshot()};
   const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=el('a');link.href=url;link.download='orivia-personal-data-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){fail(e)}},true));
  const sessions=el('section','card');box.append(sessions);
  const loadSessions=async()=>{try{const result=await api('/api/account/sessions');if(scope!==panelOwner||screen!=='account')return;sessions.replaceChildren(el('h3','','Signed-in sessions'),el('p','tiny','Browser descriptions are reported by the browser and may be inaccurate. Signing out does not erase copies already downloaded or stored on another device.'));
   for(const item of result.sessions){const row=el('p','tiny');row.textContent=(item.current?t('This session'):t('Other session'))+' · '+(item.userAgent||t('Browser not reported'))+' · '+t('Signed in')+' '+new Date(item.createdAt).toLocaleString();sessions.append(row)}
   if(result.sessions.some(s=>!s.current))sessions.append(btn('Sign out other sessions',()=>{const confirm=el('section','card');confirm.append(el('p','notice','Other sessions will need to sign in again. This session stays signed in. Sign in again first if your current sign-in is over 15 minutes old.'),btn('Confirm sign out other sessions',async()=>{try{if(scope!==panelOwner)return;await api('/api/account/sessions/revoke-others',{method:'POST',body:{confirm:'sign out other sessions'}});await loadSessions()}catch(e){if(scope===panelOwner)note(e.message==='recent_sign_in_required'?'Please log out and sign in again, then try this control within 15 minutes.':'Could not sign out other sessions. Please try again.')}},true),btn('Cancel',()=>confirm.remove(),true));sessions.append(confirm)},true));
  }catch(e){if(scope===panelOwner&&screen==='account')sessions.replaceChildren(el('p','notice','Could not load signed-in sessions.'),btn('Try again',loadSessions,true))}};loadSessions();
  const del=btn('Delete account',()=>{const review=el('section','card');review.append(el('p','notice','This deletes your account and saved personal chats and plans, and clears this account’s copies and recovery backups on this browser. Guest data, downloaded files and copies on other devices are not erased. You may need to sign in again first. If you are the last owner or organisation admin, hand over that role first.'));review.append(btn('Delete my account permanently',async()=>{try{if(scope!==panelOwner)return;callbacks.cancelReply?.();await api('/api/account',{method:'DELETE',body:{confirm:'delete my account'}});if(scope!==panelOwner)return;clearTimeout(timer);clearAccountCopy(panelOwner);user=null;scope=null;ready=false;welcome()}catch(e){fail(e)}},true),btn('Cancel',()=>review.remove(),true));box.append(review)},true);del.classList.add('danger');box.append(del);
 }
 const apiObject={get user(){return user},get epoch(){return scope},storage,open(){user?accountPanel():signIn()},copy:applyCopy,async boot(cb){callbacks=cb;try{config=await api('/api/account/config');if(!config.ui){guest();return}if(config.enabled){try{await loadArrival();await restore();return}catch(e){if(e.status===401){user=null;scope=null;ready=false;paused=false;clearTimeout(timer)}if(e.status!==401){shell('Your account could not be opened','Your saved data has not been changed.');$('account-entry').append(btn('Try again',()=>apiObject.boot(cb)),btn('Continue as a guest',guest,true));return}}}welcome()}catch(_){config={};guest()}}};
 window.OriviaAccounts=apiObject;
})();
