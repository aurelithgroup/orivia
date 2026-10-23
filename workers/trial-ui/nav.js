/* Orivia shared navigation: one space switcher and one account menu for the app (/app, /app/space/<id>) and the
 * dashboards (/platform, /manage). Spaces come only from the server (/api/account/session, /api/me/memberships); the
 * server still checks every page and API call, so this menu only reflects access, it never grants it.
 * Sign-in and sign-out are announced to every open Orivia tab (BroadcastChannel 'orivia-account'). */
(function(){
 'use strict';
 if(window.OriviaNav)return;
 const LABELS={
  'My Orivia':{fr:'Mon Orivia',ar:'أوريفيا الخاصة بي'},'Orivia management':{fr:'Gestion d’Orivia',ar:'إدارة أوريفيا'},
  'Manage':{fr:'Gérer',ar:'إدارة'},'Waiting for approval':{fr:'En attente d’approbation',ar:'بانتظار الموافقة'},
  'Your spaces':{fr:'Vos espaces',ar:'مساحاتك'},'Sign in':{fr:'Se connecter',ar:'تسجيل الدخول'},'Settings':{fr:'Paramètres',ar:'الإعدادات'},
  'Language':{fr:'Langue',ar:'اللغة'},'Sign out':{fr:'Se déconnecter',ar:'تسجيل الخروج'},'Account':{fr:'Compte',ar:'الحساب'},
  'Spaces couldn’t be loaded':{fr:'Impossible de charger les espaces',ar:'تعذّر تحميل المساحات'},
  'This dashboard is in English for now.':{fr:'Ce tableau de bord est en anglais pour l’instant.',ar:'لوحة التحكم هذه باللغة الإنجليزية حاليًا.'},
  'Signed out in another tab.':{fr:'Déconnecté dans un autre onglet.',ar:'تم تسجيل الخروج في علامة تبويب أخرى.'}};
 const LANGS=[['en','English'],['fr','Français'],['ar','العربية']];
 const SETTINGS_KEY='orivia-private-settings-v1';
 function language(){try{if(window.OriviaI18n)return window.OriviaI18n.language();const s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');return LANGS.some(l=>l[0]===s.language)?s.language:'en'}catch(_){return 'en'}}
 const t=s=>LABELS[s]?.[language()]||s;
 // Where personal Orivia lives: '/app' on myorivia.app, '/' on the pilot. The server tells dashboards; the app knows its path.
 function appHome(){const d=document.documentElement.dataset.appHome;if(d==='/app'||d==='/')return d;return location.pathname==='/app'||location.pathname.startsWith('/app/')?'/app':'/'}
 const spacePath=id=>(appHome()==='/app'?'/app':'')+'/space/'+encodeURIComponent(id);
 const inApp=()=>!!window.OriviaAccounts;

 /* Which space this page is. Exported for tests. */
 function currentSpace(loc=location){
  const p=loc.pathname,q=new URLSearchParams(loc.search||'');
  if(p==='/manage')return {kind:'owner'};
  if(p==='/platform')return q.get('org')?{kind:'manage',id:q.get('org')}:{kind:'dashboard'};
  const m=p.match(/^(?:\/app)?\/space\/([A-Za-z0-9-]{1,64})\/?$/);if(m)return {kind:'member',id:m[1]};
  return {kind:'home'};
 }
 /* The switcher's entries, built only from the server's answer. Exported for tests. */
 function menuItems(me,home=appHome()){
  const items=[{key:'home',label:'My Orivia',href:home,kind:'home'}];
  for(const m of me?.memberships||[]){
   const name=String(m.name||'').slice(0,80);if(!name||typeof m.org_id!=='string'&&typeof m.organisationId!=='string')continue;
   const id=m.organisationId||m.org_id;
   if(m.status==='requested'){items.push({key:'pending:'+id,label:name,note:'Waiting for approval',kind:'pending',href:'/platform'});continue}
   if(m.status!=='active')continue;
   if(m.role==='student')items.push({key:'member:'+id,label:name,href:(home==='/app'?'/app':'')+'/space/'+encodeURIComponent(id),kind:'member',id});
   else if(m.role==='admin'||m.role==='editor')items.push({key:'manage:'+id,label:name,prefix:'Manage',href:'/platform?org='+encodeURIComponent(id),kind:'manage',id});
  }
  if((me?.platformRoles||[]).includes('owner'))items.push({key:'owner',label:'Orivia management',href:'/manage',kind:'owner'});
  return items;
 }
 function activeKey(items,space){
  if(space.kind==='home')return 'home';if(space.kind==='owner')return 'owner';
  if(space.kind==='member')return 'member:'+space.id;if(space.kind==='manage')return 'manage:'+space.id;
  return items.find(i=>i.kind==='manage')?.key||'home';
 }
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 let user=null,root=null,openMenu=null;
 // Signed-in pages drop the duplicate settings gear on narrow screens (Settings is in the account menu).
 const markSignedIn=()=>{try{if(user)document.body.dataset.navSignedIn='1';else delete document.body.dataset.navSignedIn}catch(_){}};
 function closeMenus(){if(openMenu){openMenu.menu.hidden=true;openMenu.button.setAttribute('aria-expanded','false');openMenu=null}}
 function menu(buttonLabel,ariaLabel,build){
  const wrap=el('div','onav-wrap'),button=el('button','onav-btn');button.type='button';button.setAttribute('aria-haspopup','true');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',ariaLabel);
  if(typeof buttonLabel==='string')button.textContent=buttonLabel;else button.append(buttonLabel);
  const list=el('div','onav-menu');list.hidden=true;list.setAttribute('role','menu');wrap.append(button,list);
  button.onclick=e=>{e.stopPropagation();const was=openMenu?.menu===list;closeMenus();if(was)return;list.replaceChildren(...build());list.hidden=false;button.setAttribute('aria-expanded','true');openMenu={menu:list,button};list.querySelector('a,button,select')?.focus()};
  list.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();button.focus()}});
  return wrap;
 }
 function link(label,href,{current=false,note='',prefix=''}={}){
  const a=el('a','onav-item');a.href=href;a.setAttribute('role','menuitem');if(current)a.setAttribute('aria-current','page');
  a.append(el('span','onav-item-title',(prefix?t(prefix)+' ':'')+label));if(note)a.append(el('small','onav-item-note',t(note)));return a;
 }
 function action(label,fn){const b=el('button','onav-item onav-action',t(label));b.type='button';b.setAttribute('role','menuitem');b.onclick=()=>{closeMenus();fn()};return b}
 async function api(path,init={}){const r=await fetch(path,{credentials:'same-origin',cache:'no-store',...init,headers:{...(user?{'X-Orivia-Account':user.id}:{}),...(init.headers||{})},signal:AbortSignal.timeout(12000)});if(!r.ok){const e=Error('http '+r.status);e.status=r.status;throw e}return r.json()}
 function announce(id){try{const c=new BroadcastChannel('orivia-account');c.postMessage({user:id||null});c.close()}catch(_){}}
 function setLanguage(value){
  if(inApp()){const s=document.getElementById('app-language');if(s){s.value=value;s.dispatchEvent(new Event('change',{bubbles:true}))}}
  else{try{const s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');s.language=value;localStorage.setItem(SETTINGS_KEY,JSON.stringify(s))}catch(_){}}
  render();
 }
 async function signOut(){
  // In the app, the account panel's own Log out keeps the unsynced-copy safeguard; dashboards hold no personal copy.
  if(inApp()){window.OriviaAccounts.open();return}
  try{await api('/api/auth/sign-out',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})}catch(_){}
  announce(null);location.href=appHome();
 }
 function openSettings(){if(inApp()&&typeof window.OriviaNav.onSettings==='function')window.OriviaNav.onSettings();else location.href=appHome()+'?view=settings'}
 let me=null,loadError=false;
 function render(){
  if(!root)return;closeMenus();const out=[];
  if(!user){
   const b=el('button','onav-btn onav-signin',t('Sign in'));b.type='button';
   b.onclick=()=>{if(inApp())window.OriviaAccounts.open();else location.href=appHome()};out.push(b);
   root.replaceChildren(...out);return;
  }
  const items=menuItems(me||{}),space=currentSpace(),active=activeKey(items,space),current=items.find(i=>i.key===active)||items[0];
  out.push(menu((current.prefix?t(current.prefix)+' ':'')+(current.kind==='home'||current.kind==='owner'?t(current.label):current.label)+' ▾',t('Your spaces'),()=>{
   const list=[el('div','onav-heading',t('Your spaces'))];
   for(const i of items)list.push(link(i.kind==='home'||i.kind==='owner'?t(i.label):i.label,i.href,{current:i.key===active,note:i.note,prefix:i.prefix}));
   if(loadError)list.push(el('p','onav-note',t('Spaces couldn’t be loaded')));
   return list;
  }));
  const initial=el('span','onav-avatar',(user.name||user.email||'?').trim().charAt(0).toUpperCase()||'?');
  out.push(menu(initial,t('Account'),()=>{
   const list=[el('div','onav-heading',user.email||'')];
   list.push(action('Settings',openSettings));
   const lab=el('label','onav-lang');lab.append(el('span','',t('Language')));const sel=el('select');for(const [v,n] of LANGS){const o=el('option','',n);o.value=v;sel.append(o)}sel.value=language();sel.onchange=()=>setLanguage(sel.value);lab.append(sel);list.push(lab);
   if(!inApp()&&language()!=='en')list.push(el('p','onav-note',t('This dashboard is in English for now.')));
   list.push(action('Sign out',signOut));return list;
  }));
  root.replaceChildren(...out);
 }
 /* One memberships request shared by the menu and the spaces list (reused for 4 seconds, per account). */
 const shared=new Map();
 function memberships(id){const hit=shared.get(id);if(hit&&Date.now()-hit.t<4000)return hit.p;
  const p=fetch('/api/me/memberships',{credentials:'same-origin',cache:'no-store',headers:{'X-Orivia-Account':id},signal:AbortSignal.timeout(12000)}).then(r=>{if(!r.ok){const e=Error('http '+r.status);e.status=r.status;throw e}return r.json()});
  shared.set(id,{t:Date.now(),p});p.catch(()=>shared.delete(id));return p}
 async function refresh(){
  // In the app, the account is the one the app already loaded (no second session request); it calls refresh when that changes.
  if(inApp()){if(document.body.dataset.entryPending)return user;const u=window.OriviaAccounts.user;user=u?{id:u.id,name:u.name,email:u.email}:null}
  else{try{const s=await fetch('/api/account/session',{credentials:'same-origin',cache:'no-store'});user=s.ok?(await s.json()).user:null}catch(_){user=null}}
  me=null;loadError=false;
  if(user){try{me=await memberships(user.id)}catch(_){loadError=true}}
  markSignedIn();render();return user;
 }
 function mount(target){
  root=typeof target==='string'?document.getElementById(target):target;if(!root)return;root.classList.add('onav');
  document.addEventListener('click',e=>{if(openMenu&&!openMenu.menu.contains(e.target))closeMenus()});
  try{const c=new BroadcastChannel('orivia-account');c.onmessage=e=>{const other=e.data?.user??null;if(other!==(user?.id??null)){window.OriviaUpdate?.keepDraft?.('switch');if(!other&&root)root.replaceChildren(el('span','onav-note',t('Signed out in another tab.')));setTimeout(()=>location.reload(),other?0:600)}}}catch(_){}
  refresh();
 }
 const style=document.createElement('style');
 style.textContent=".onav{display:flex;align-items:center;gap:8px;margin-inline-start:auto;position:relative;min-width:0;flex:0 1 auto}.onav-wrap{min-width:0;display:flex}.onav-wrap .onav-btn{max-width:100%;min-width:0}.onav-wrap:last-child{flex:none}.onav-avatar-btn{min-width:36px;justify-content:center}.onav-wrap{position:relative}"+
  ".onav-btn{font:inherit;font-size:14px;font-weight:600;color:inherit;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:7px 12px;cursor:pointer;max-width:46vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-height:36px}"+
  ".onav-btn:focus-visible,.onav-item:focus-visible{outline:2px solid #F3C04A;outline-offset:2px}.onav-avatar{display:inline-block;min-width:1.1em;text-align:center}"+
  ".onav-menu{position:absolute;inset-inline-end:0;top:calc(100% + 6px);z-index:60;min-width:240px;max-width:min(320px,92vw);background:#fff;color:#1C2733;border:1px solid #D8DDE3;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.18);padding:6px;display:flex;flex-direction:column;gap:2px}"+
  "@media (prefers-color-scheme:dark){.onav-menu{background:#18222D;color:#E8EDF3;border-color:#2C3A48}}"+
  ".onav-heading{font-size:12px;font-weight:700;opacity:.7;padding:8px 10px 4px;overflow:hidden;text-overflow:ellipsis}.onav-item{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:start;font:inherit;font-size:15px;color:inherit;background:none;border:0;border-radius:10px;padding:10px;text-decoration:none;cursor:pointer;min-height:44px;justify-content:center}"+
  ".onav-item:hover{background:rgba(127,127,127,.12)}.onav-item[aria-current=page]{background:rgba(243,192,74,.18);font-weight:700}.onav-item-note{font-size:12px;opacity:.75}.onav-note{font-size:12px;opacity:.8;margin:4px 10px}"+
  "@media (max-width:560px){header.top .chip{display:none}.onav-btn{max-width:34vw;padding:7px 10px}body[data-nav-signed-in] #open-settings{display:none}header.top{gap:8px}}@media (max-width:420px){body[data-nav-signed-in] header.top .wordmark{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.onav-btn{max-width:46vw}}@media (max-width:359px){header.top .wordmark{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}}.onav-lang{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;font-size:15px}.onav-lang select{font:inherit;font-size:14px;border-radius:8px;padding:4px 6px}";
 document.head.append(style);
 window.OriviaNav={mount,refresh,announce,menuItems,currentSpace,spacePath,memberships,onSettings:null};
 // Any page with a #orivia-nav slot gets the navigation (the app and the dashboards); no inline script needed.
 const auto=()=>{if(document.getElementById('orivia-nav'))mount('orivia-nav')};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto);else auto();
})();
