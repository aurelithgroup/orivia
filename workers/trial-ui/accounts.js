/* Account UI and local storage isolation. Auth cookies are HttpOnly; no token is stored in localStorage or sessionStorage. */
(function(){
 'use strict';
 let native;try{native=window.localStorage}catch(_){native={getItem(){throw Error('storage_unavailable')},setItem(){throw Error('storage_unavailable')},removeItem(){throw Error('storage_unavailable')}}}
 const keys={profile:'orivia-private-profile-v1',events:'orivia-private-events-v1',journeys:'orivia-private-journeys-v1',chats:'orivia-private-chats-v1'},privateKeys=new Set([...Object.values(keys),'orivia-private-chats-v1-unreadable']);
 let user=null,scope=null,callbacks=null,config={},revision=0,ready=false,paused=false,timer=null,syncing=false,generation=0,screen='welcome',email='';
 const $=id=>document.getElementById(id),t=s=>window.OriviaI18n?.text(s)??s;
 const prefix=id=>'orivia-account:'+encodeURIComponent(id)+':';
 const key=k=>scope&&privateKeys.has(k)?prefix(scope)+k:k;
 const storage={getItem:k=>native.getItem(key(k)),setItem(k,v){native.setItem(key(k),v);if(privateKeys.has(k))changed()},removeItem(k){native.removeItem(key(k));if(privateKeys.has(k))changed()}};
 globalThis.OriviaAccountStorage={storage};
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=t(text);return n};
 function btn(text,fn,quiet=false){const b=el('button','btn'+(quiet?' quiet':''),text);b.type='button';b.onclick=fn;return b}
 function jsonRead(k,base,fallback){const value=base.getItem(k);return value===null?fallback:JSON.parse(value)}
 function snapshot(base=storage){return {version:1,profile:jsonRead(keys.profile,base,null),events:jsonRead(keys.events,base,[]),journeys:jsonRead(keys.journeys,base,{}),chats:jsonRead(keys.chats,base,{chats:[],active:null})}}
 function empty(){return {version:1,profile:null,events:[],journeys:{},chats:{chats:[],active:null}}}
 function putLocal(data){for(const k of Object.keys(keys)){if(data[k]===null)native.removeItem(key(keys[k]));else native.setItem(key(keys[k]),JSON.stringify(data[k]))}}
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
  window.OriviaSpaces?.changed();
  const banner=$('account-sync-banner');if(banner&&!user)banner.hidden=true;
  const settings=$('account-open-settings');if(settings){settings.hidden=!(config.email||config.google||config.apple);settings.onclick=()=>apiObject.open()}
  const review=$('account-sync-review');if(review)review.onclick=()=>apiObject.open();
  const end=$('end-session');if(end&&user)end.textContent=t('Your account');
  for(const n of document.querySelectorAll('[data-account-copy]'))n.textContent=t(user?n.dataset.accountCopy:n.dataset.deviceCopy);
  const label=$('account-open');if(label)label.hidden=!(config.email||config.google||config.apple);if(label)label.textContent=t(user?'Your account':'Sign in or create an account');
  const name=$('life-display-name');if(name&&user)name.textContent=user.name||t('Your personal space');
 }
 function hideApp(){window.OriviaSpaces?.reset();callbacks?.leave();$('intro').hidden=true;$('workspace').hidden=true;$('nav').hidden=true;$('open-chats').hidden=true;$('open-settings').hidden=true;}
 function shell(title,subtitle){hideApp();document.body.dataset.accountFlow='on';const root=$('account-entry');root.hidden=false;root.replaceChildren();const brand=document.querySelector('header .brand')?.cloneNode(true);if(brand){brand.classList.add('auth-brand');root.append(brand)}const content=el('div','auth-content');root.append(content);if(title)content.append(el('h1','',title));if(subtitle)content.append(el('p','notice',subtitle));const status=el('p','notice');status.id='account-flow-status';status.setAttribute('role','status');content.append(status);return content}
 function fail(e){const n=$('account-flow-status');if(n)n.textContent=t(e.status===429?'Please wait before trying again.':'That didn’t work. Check the details and try again.');}
 function guest(){const leavingAccount=!!scope;delete document.body.dataset.accountFlow;user=null;scope=null;ready=false;paused=false;clearTimeout(timer);$('account-entry').hidden=true;applyCopy();if(sessionStorage.getItem('orivia-ai-private-consent')==='yes'){if(leavingAccount||$('workspace').hidden)callbacks.reload()}else $('intro').hidden=false;}
 function welcome(){screen='welcome';const box=shell('Welcome to Orivia','Find your way, get answers and take your next step.');
  const photo=callbacks.photos?.().uae;if(photo){const cover=el('div','auth-cover'),img=el('img');img.src=photo.image;img.alt='';cover.append(img,el('h2','','A new place. A little more familiar.'));$('account-entry').prepend(cover)}
  if(config.email||config.google||config.apple){box.append(btn('Get started',()=>signIn()),btn('I already have an account',()=>signIn(),true));}
  else box.append(el('p','notice','Accounts are coming. You can use Orivia as a guest.'));
  box.append(btn('Continue as a guest',guest,true),el('p','tiny','No account needed. As a guest, your chats are saved in this browser on this device.'));
  // In the website's phone preview, browsers keep this app's data separate from the full-screen app.
  if(window.top!==window){const note=el('p','tiny','This is a preview. Chats you start here stay in the preview and won’t appear when you open Orivia full screen.');const a=document.createElement('a');a.href='/';a.target='_blank';a.rel='noopener';a.className='btn';a.textContent=t('Open Orivia full screen');box.append(note,a)}
 }
 function signIn(){screen='signin';const box=shell('Good to see you.','Sign in to keep your Orivia with you.');box.prepend(btn('← Back',welcome,true));
  for(const provider of ['google','apple'])if(config[provider])box.append(btn(provider==='google'?'Continue with Google':'Continue with Apple',async()=>{try{const d=await api('/api/auth/sign-in/social',{method:'POST',body:{provider,callbackURL:location.origin+'/'}});const u=new URL(d.url);if(!['https:'].includes(u.protocol))throw Error('Invalid redirect');location.assign(u.href)}catch(e){fail(e)}},true));
  if(config.email){const form=el('form','auth-form'),label=el('label','field','Email address'),input=el('input');input.type='email';input.required=true;input.autocomplete='email';input.placeholder='you@example.com';label.append(input);const send=el('button','btn','Continue with email');send.type='submit';form.append(label,send);form.onsubmit=async e=>{e.preventDefault();send.disabled=true;email=input.value.trim();try{await api('/api/auth/email-otp/send-verification-otp',{method:'POST',body:{email,type:'sign-in'}});codeScreen()}catch(e){fail(e)}finally{send.disabled=false}};box.append(form)}
  box.append(btn('Continue as a guest',guest,true));
 }
 function codeScreen(){screen='code';const box=shell('Check your email','Enter the six-digit code we sent you.');box.prepend(btn('← Back',signIn,true));box.append(el('p','tiny',email));const form=el('form','auth-form'),label=el('label','field','Sign-in code'),input=el('input');input.inputMode='numeric';input.pattern='[0-9]{6}';input.maxLength=6;input.autocomplete='one-time-code';input.required=true;label.append(input);const send=el('button','btn','Continue');send.type='submit';form.append(label,send);form.onsubmit=async e=>{e.preventDefault();send.disabled=true;try{await api('/api/auth/sign-in/email-otp',{method:'POST',body:{email,otp:input.value}});await restore()}catch(e){fail(e)}finally{send.disabled=false}};box.append(form,btn('Send a new code',async()=>{try{await api('/api/auth/email-otp/send-verification-otp',{method:'POST',body:{email,type:'sign-in'}});$('account-flow-status').textContent=t('A new code has been sent.')}catch(e){fail(e)}},true));}
 async function restore(){const d=await api('/api/account/session');user=d.user;scope=user.id;ready=false;paused=false;const vault=await api('/api/account/vault');revision=vault.revision;
  if(native.getItem(dirtyKey())){paused=true;ready=true;enter();note('Not synced yet. Your device copy is kept.');return}
  if(vault.data){putLocal(vault.data);ready=true;enter();return}
  setup();
 }
 function setup(){screen='setup';const box=shell('What should we call you?','Set up your space.');const label=el('label','field','Preferred name'),name=el('input');name.maxLength=60;name.value=user.name&&user.name!==user.email?user.name:'';label.append(name);box.append(label,el('h2','','Your saved things'),el('p','notice','Choose what to bring from this device. Nothing is added automatically.'));
  const choices=el('div','auth-choices');let source;try{source=snapshot(native)}catch(_){source=null}
  const selected=new Set();if(source)for(const category of ['chats','events','journeys','profile']){const lab=el('label','auth-choice'),check=el('input');check.type='checkbox';check.onchange=()=>{check.checked?selected.add(category):selected.delete(category)};lab.append(check,el('span','',({chats:'Chats',events:'Reminders',journeys:'Journeys',profile:'About you'})[category]));choices.append(lab)}else box.append(el('p','notice','Device data could not be read. It has not been changed.'));
  box.append(choices,el('p','tiny','Leave these unchecked to start fresh. Your original device data is kept.'));
  const save=btn('Continue',async()=>{save.disabled=true;try{if(name.value.trim()){await api('/api/auth/update-user',{method:'POST',body:{name:name.value.trim()}});user.name=name.value.trim()}
   const data=empty();for(const k of selected)data[k]=source[k];const r=await api('/api/account/vault',{method:'PUT',headers:{'If-Match':'0'},body:data});revision=r.revision;putLocal(data);ready=true;enter();
  }catch(e){fail(e)}finally{save.disabled=false}});box.append(save,btn('Do this later',()=>{putLocal(empty());ready=true;enter()},true),el('p','tiny','Your personal chats are not shared with your institution.'));
 }
 function enter(){delete document.body.dataset.accountFlow;$('account-entry').hidden=true;applyCopy();if(sessionStorage.getItem('orivia-ai-private-consent')==='yes')callbacks.reload();else $('intro').hidden=false;}
 function accountPanel(){screen='account';const box=shell('Your account',user?user.email:'');box.prepend(btn('← Back',enter,true));if(!user){signIn();return}
  const status=el('p','notice');status.id='account-status';status.setAttribute('role','status');box.append(status);note(paused?'Sync is paused. Your device copy is kept.':'Your chats and plans are saved to your private account.');
  box.append(btn('Sync now',async()=>{if(paused){note('Sync is paused. Review the account version first.');return}try{await sync()}catch(_){}}),btn('Review the account version',async()=>{try{const remote=await api('/api/account/vault');const review=el('section','card');review.append(el('p','notice','Loading the account version replaces this device’s account copy. A backup is kept on this device.'));
   review.append(btn('Load account version',()=>{try{native.setItem(prefix(scope)+'before-reload',JSON.stringify(snapshot()));putLocal(remote.data||empty());revision=remote.revision;native.removeItem(dirtyKey());paused=false;generation=0;ready=true;enter()}catch(e){fail(e)}},true),btn('Keep this device copy',()=>review.remove(),true));box.append(review)}catch(e){fail(e)}},true),btn('Log out',async()=>{try{callbacks.cancelReply?.();if(native.getItem(dirtyKey())){const review=el('section','card');review.append(el('p','notice','Your latest changes are not synced. You can log out and keep this account’s unsynced copy on this device. Sign in again on this device to recover it.'));review.append(btn('Log out and keep unsynced copy',async()=>{try{await api('/api/auth/sign-out',{method:'POST',body:{}});clearTimeout(timer);user=null;scope=null;ready=false;paused=false;welcome()}catch(e){fail(e)}},true),btn('Stay signed in',()=>review.remove(),true));box.append(review);return}await api('/api/auth/sign-out',{method:'POST',body:{}});clearTimeout(timer);for(const k of privateKeys)native.removeItem(key(k));user=null;scope=null;ready=false;paused=false;welcome()}catch(e){fail(e)}},true));
  const panelOwner=scope;
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
  const del=btn('Delete account',()=>{const review=el('section','card');review.append(el('p','notice','This permanently deletes your account and its saved chats and plans. You may need to sign in again first.'));review.append(btn('Delete my account permanently',async()=>{try{await api('/api/account',{method:'DELETE',body:{confirm:'delete my account'}});for(const k of privateKeys)native.removeItem(key(k));user=null;scope=null;ready=false;welcome()}catch(e){fail(e)}},true),btn('Cancel',()=>review.remove(),true));box.append(review)},true);del.classList.add('danger');box.append(del);
 }
 const apiObject={get user(){return user},get epoch(){return scope},storage,open(){user?accountPanel():signIn()},copy:applyCopy,async boot(cb){callbacks=cb;try{config=await api('/api/account/config');if(!config.ui){guest();return}if(config.enabled){try{await restore();return}catch(e){if(e.status===401){user=null;scope=null;ready=false;paused=false;clearTimeout(timer)}if(e.status!==401){shell('Your account could not be opened','Your saved data has not been changed.');$('account-entry').append(btn('Try again',()=>apiObject.boot(cb)),btn('Continue as a guest',guest,true));return}}}welcome()}catch(_){config={};guest()}}};
 window.OriviaAccounts=apiObject;
})();
