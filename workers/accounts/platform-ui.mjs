/* Orivia organisations: the connected dashboards (owner, organisation staff, student space, invitations, public codes).
 * Every view and action uses the signed-in session and the server's permission checks; there is no role switcher.
 * The space menu only lists what /api/me/memberships says this account has. Content is always rendered as plain text.
 * Unfinished features (counts, application records, progress, admin status, code revocation) are labelled as such. */
export const platformPage=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#1C2733"><title>Orivia organisations · integration preview</title><style>
:root{--ground:#E9ECE7;--surface:#FFFFFF;--surface2:#F3F5F1;--line:#D6DBD4;--ink:#18222D;--muted:#56616C;--sign:#1C2733;--signInk:#F4F6F7;--amber:#F2B90F;--amberSoft:#FFF3C9;--amberInk:#6B4E00;--ok:#1D7F55;--okSoft:#DDF0E6;--warn:#A8480A;--warnSoft:#FBE7D9;--focus:#2F6FEB;--focusSoft:#E4ECFD;--btn:#1C2733;--btnInk:#FFFFFF;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--ground:#0B1015;--surface:#141B23;--surface2:#1A232D;--line:#29333E;--ink:#E6EAEE;--muted:#9AA5B0;--sign:#080C10;--amberSoft:#3A3110;--amberInk:#F7D873;--ok:#46C08A;--okSoft:#15342A;--warn:#F2914A;--warnSoft:#3A2414;--focus:#7AA5FF;--focusSoft:#18284A;--btn:#F2B90F;--btnInk:#1C2733;color-scheme:dark}}
*{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;background:var(--ground);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
button,input,select,textarea{font:inherit;color:inherit}:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
h1,h2,h3{font-family:Georgia,"Times New Roman",serif;font-weight:400;margin:0;text-wrap:balance}p{margin:0}
.top{background:var(--sign);color:var(--signInk);padding:14px max(16px,env(safe-area-inset-right,0px)) 14px max(16px,env(safe-area-inset-left,0px))}
.top-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.brand{font-weight:700;letter-spacing:.16em}.grow{flex:1 1 auto;min-width:0}
.top label{display:flex;align-items:center;gap:8px;font-size:13px;color:#C9D1D8}
.top select{padding:9px 12px;border-radius:10px;border:1px solid #3A4756;background:#26323F;color:#F4F6F7;max-width:100%}
.who{font-size:13px;color:#C9D1D8}
main{max-width:1200px;margin:0 auto;padding:24px max(16px,env(safe-area-inset-right,0px)) 56px max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:18px}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:20px;display:flex;flex-direction:column;gap:14px;min-width:0}
.panel h2{font-size:26px}.panel h3{font-size:20px}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.stack{display:flex;flex-direction:column;gap:10px}
.muted{color:var(--muted)}.small{font-size:13px}
.btn{border:0;background:var(--btn);color:var(--btnInk);font-weight:700;border-radius:999px;padding:10px 18px;cursor:pointer;min-height:44px}
.btn.quiet{background:transparent;color:var(--ink);border:1px solid var(--line)}.btn.ok{background:var(--ok);color:#FFFFFF}.btn.danger{background:transparent;color:var(--warn);border:1px solid var(--line)}
.btn[disabled]{opacity:.5;cursor:not-allowed}
form{display:flex;flex-direction:column;gap:12px}form.row{flex-direction:row}.stack>.chip,.panel>.chip{align-self:flex-start}
.field{display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:14px}
.field input,.field select,.field textarea{font-weight:400;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface);max-width:100%}
.field textarea{min-height:96px;resize:vertical}
.hint{font-weight:400;font-size:12px;color:var(--muted)}
.chip{display:inline-block;font-size:12px;font-weight:700;border-radius:999px;padding:2px 9px}
.c-ok{background:var(--okSoft);color:var(--ok)}.c-wait{background:var(--focusSoft);color:var(--focus)}.c-warn{background:var(--warnSoft);color:var(--warn)}.c-demo{background:var(--amberSoft);color:var(--amberInk)}
.list{display:flex;flex-direction:column}.item{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 0;border-bottom:1px solid var(--line)}.item:last-child{border-bottom:0}
.empty{border:1px dashed var(--line);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:10px}
.tab{background:transparent;border:1px solid transparent;border-radius:999px;padding:8px 14px;cursor:pointer;min-height:40px;color:var(--muted)}
.tab[aria-selected="true"]{background:var(--surface2);border-color:var(--line);color:var(--ink);font-weight:700}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.kpi{background:var(--surface2);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:4px}.kpi strong{font-size:26px;font-variant-numeric:tabular-nums}
.note{background:var(--surface2);border-radius:12px;padding:12px 14px;font-size:13px;color:var(--muted)}
.notice{border-radius:12px;padding:12px 14px;font-size:14px}.notice.err{background:var(--warnSoft);color:var(--warn)}.notice.good{background:var(--okSoft);color:var(--ok)}
.denied{border:2px solid var(--warn);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:10px;background:var(--warnSoft)}
.secret{border:2px solid var(--amber);border-radius:16px;padding:16px;display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;background:var(--amberSoft)}
.secret img{width:168px;height:168px;background:#FFFFFF;border-radius:10px;padding:6px;max-width:100%}
.secret input{width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--surface);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px}
.narrow{max-width:560px;width:100%;margin:0 auto}
.content-body{white-space:pre-wrap}
@media (prefers-reduced-motion:no-preference){.panel{transition:background .2s}}
</style></head><body>
<header class="top"><div class="top-in"><span class="brand">ORIVIA</span><span class="chip c-demo">Preview · not yet live</span><span class="grow"></span><label for="space" hidden>Space<select id="space" aria-label="Choose a space"></select></label><span class="who" id="identity" hidden></span><div id="orivia-nav"></div></div></header>
<main id="view" aria-live="polite"><div class="panel"><p>Loading your Orivia…</p></div></main>
<script src="/orivia-nav.js"></script><script src="/platform.js"></script></body></html>`;

export function mountPlatform(){
 'use strict';
 const $=id=>document.getElementById(id);
 // Where personal Orivia lives on this deployment ('/' on the pilot, '/app' on myorivia.app); set by the server.
  const APP_HOME=document.documentElement.dataset.appHome==='/app'?'/app':'/';
  let user=null,me={platformRoles:[],memberships:[]},space=location.pathname==='/manage'?'owner':(()=>{const o=new URLSearchParams(location.search).get('org');return o&&/^[A-Za-z0-9-]{1,64}$/.test(o)?'org:'+o:'home'})(),tab='overview',flash=null;
 /* ---- tiny DOM helper: text is always text ---- */
 function h(tag,props,...kids){const n=document.createElement(tag);if(props)for(const [k,v] of Object.entries(props)){if(v===undefined||v===null||v===false)continue;if(k==='class')n.className=v;else if(k.startsWith('on'))n.addEventListener(k.slice(2),v);else if(v===true)n.setAttribute(k,'');else n.setAttribute(k,String(v))}for(const k of kids.flat()){if(k===null||k===undefined||k===false)continue;n.append(k instanceof Node?k:document.createTextNode(String(k)))}return n}
 const chip=(text,kind)=>h('span',{class:'chip '+kind},text);
 const panel=(...kids)=>h('section',{class:'panel'},...kids);
 const empty=(title,text,...more)=>h('div',{class:'empty'},h('strong',null,title),h('p',{class:'small muted'},text),...more);
 /* ---- API: session-scoped, account header on every request ---- */
 const ERR={arrival_conflict:'These welcome settings changed. Refresh and try again.',invalid_arrival:'Check the destination, campus and reason.',invalid_arrival_region:'Choose an emirate or UK nation for that country.',sign_in_required:'Please sign in to Orivia first.',verified_email_required:'Please verify your email address first.',account_changed:'You signed in as someone else in another tab. Reload this page.',owner_required:'Only Orivia’s owner can do this.',permission_denied:'Your role here doesn’t allow this.',not_found:'That isn’t available, or you don’t have access to it.',public_code_withdrawn:'This public code was withdrawn. Create a new one to share.',invitation_not_found:'This invitation link isn’t recognised.',invitation_unavailable:'This invitation has expired or was withdrawn.',invitation_for_another_email:'This invitation was sent to a different email address.',membership_exists:'You already have a membership here.',membership_removed:'You were removed from this organisation. Ask its staff to add you again.',invitation_no_longer_available:'This invitation has no places left.',admin_already_assigned:'This organisation already has an admin or a pending admin invitation.',slug_exists:'That web name is already taken.',invalid_organisation:'Check the name and web name (lowercase letters, numbers and hyphens).',invalid_email:'Check the email address.',invalid_text:'Please fill this in (plain text).',invalid_expiry:'Invitations can last up to 7 days.',invalid_capacity:'Choose between 1 and 500 places.',content_conflict:'Someone changed this in the meantime. Refreshed with the latest version.',request_no_longer_approvable:'This request can’t be approved any more (its invitation may have expired).',recent_sign_in_required:'Please sign out and sign in again before changing protected organisation settings.',role_confirmation_required:'Confirm the role change first.',role_change_conflict:'That role changed, or this is the last admin. Refresh the member list before trying again.',reinstatement_confirmation_required:'Confirm that this person may request to join again.',reinstatement_conflict:'This membership changed. Refresh the member list.',member_cannot_be_removed:'Change an admin to another role before removing them. Keep at least one admin.',transfer_admin_first:'Make another trusted member an admin, then change your own role before leaving.',public_target_required:'Pick a guide that is published and public.',organisations_unavailable:'Organisations aren’t switched on in this environment yet.',accounts_unavailable:'Accounts aren’t switched on in this environment yet.',separate_records_permission_required:'Application records need a separate permission that nobody has yet.'};
 class ApiError extends Error{constructor(status,code){super(ERR[code]||'Something went wrong. Please try again.');this.status=status;this.code=code}}
 async function api(path,method='GET',body){const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:{...(user?{'X-Orivia-Account':user.id}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});let d={};try{d=await r.json()}catch(_){}if(!r.ok)throw new ApiError(r.status,d.error);return d}
 function act(button,fn){return async e=>{e&&e.preventDefault&&e.preventDefault();if(button)button.disabled=true;try{await fn()}catch(err){flash={kind:'err',text:err.message};if(err.code==='content_conflict'||err.code==='account_changed'){}await render()}finally{if(button&&button.isConnected)button.disabled=false}}}
 const field=(label,input,hint)=>h('label',{class:'field'},label,input,hint?h('span',{class:'hint'},hint):null);
 const orgOf=id=>me.memberships.find(m=>m.organisationId===id);
 const fmtDate=ms=>new Date(ms).toLocaleString(undefined,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});

 /* ---- Space menu: only what the server says this account has ---- */
 function spaceMenu(){const sel=$('space');sel.replaceChildren(h('option',{value:'home'},'My Orivia'));if(me.platformRoles.includes('owner'))sel.append(h('option',{value:'owner'},'Orivia management'));
  for(const m of me.memberships.filter(m=>m.status==='active'))sel.append(h('option',{value:'org:'+m.organisationId},m.name+(m.role==='student'?'':' · '+(m.role==='admin'?'admin':'editor'))));
  sel.value=[...sel.options].some(o=>o.value===space)?space:'home';sel.onchange=()=>{space=sel.value;tab='overview';flash=null;render()}}
 async function refreshMe(){me=await api('/api/me/memberships');spaceMenu()}

 /* ---- Secret result (invitation links are shown once) ---- */
 function secret(result){const link=result.joinUrl||result.code.url,svg=result.qrSvg||result.code.qrSvg,isInvite=!!result.joinUrl;
  const input=h('input',{readonly:true,value:link,'aria-label':isInvite?'Invitation link':'Public code link'});
  const download=h('a',{class:'btn quiet',href:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),download:isInvite?'orivia-invitation-qr.svg':'orivia-public-qr.svg'},'Download QR image');
  const copy=h('button',{class:'btn quiet',type:'button'},'Copy link');copy.onclick=async()=>{try{await navigator.clipboard.writeText(link);copy.textContent='Copied'}catch(_){input.select()}};
  return h('div',{class:'secret'},h('img',{src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),alt:'QR code for the link beside it'}),
   h('div',{class:'stack grow'},h('strong',null,isInvite?'Save this invitation now':'Public code ready'),
    h('p',{class:'small'},isInvite?'This link and QR code are shown only once. '+(result.invitation.role==='student'?'Anyone with them can ask to join, and staff approve each request.':'Only the invited email can accept it, and only once.'):'This code opens public information only. It never makes anyone a member.'),
    input,h('div',{class:'row'},copy,download),isInvite?h('p',{class:'small muted'},'Expires '+fmtDate(result.invitation.expiresAt)+(result.invitation.maxUses>1?' · up to '+result.invitation.maxUses+' people':'')):null))}

 /* ---- Views ---- */
 // The address follows the open space, so Refresh, Back and shared links return to it.
 function syncAddress(){const want=space==='owner'?'/manage':space.startsWith('org:')?'/platform?org='+encodeURIComponent(space.slice(4)):'/platform';if(location.pathname+location.search!==want&&!location.hash)history.replaceState(null,'',want);window.OriviaNav?.refresh()}
 async function render(){syncAddress();
  const view=$('view');const out=[];
  if(flash)out.push(h('p',{class:'notice '+(flash.kind==='err'?'err':'good'),role:flash.kind==='err'?'alert':'status'},flash.text));
  try{
   if(space==='home')out.push(...await homeView());
   else if(space==='owner')out.push(...await ownerView());
   else if(space.startsWith('org:')){const oid=space.slice(4),m=orgOf(oid);if(!m)out.push(deniedView('You’re not a member of this organisation.'));else if(m.role==='student')out.push(...await studentView(oid));else out.push(...await staffView(oid,m))}
  }catch(err){out.push(err.status===403||err.status===404?deniedView(err.message):h('p',{class:'notice err',role:'alert'},err.message))}
  view.replaceChildren(...out);flash=null;
 }
 function deniedView(text){return h('div',{class:'denied',role:'alert'},h('strong',null,'You don’t have access to this'),h('p',{class:'small'},text),h('div',{class:'row'},h('button',{class:'btn quiet',type:'button',onclick:()=>{space='home';render()}},'Back to my Orivia')))}

 async function homeView(){
  const active=me.memberships.filter(m=>m.status==='active'),waiting=me.memberships.filter(m=>m.status==='requested');
  const tokenInput=h('input',{id:'invite-link',placeholder:'Paste the link you were sent',autocomplete:'off'});
  const open=h('button',{class:'btn',type:'submit'},'Open invitation');
  const form=h('form',{onsubmit:act(open,async()=>{const m=String(tokenInput.value).match(/join=([a-f0-9]{64})/)||String(tokenInput.value).trim().match(/^([a-f0-9]{64})$/);if(!m)throw new ApiError(400,'invitation_not_found');await inviteView(m[1])})},field('Invitation link',tokenInput,'From a university or organisation email or QR code.'),h('div',{class:'row'},open));
  return [panel(h('div',{class:'row'},h('h2',{class:'grow'},'Your organisations'),chip('Signed in','c-ok')),
   active.length?h('div',{class:'list'},active.map(m=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,m.name),' ',m.demo?chip('Demo','c-demo'):null,h('p',{class:'small muted'},m.role==='student'?'Member':m.role==='admin'?'Staff admin':'Staff editor')),h('button',{class:'btn quiet',type:'button',onclick:()=>{space='org:'+m.organisationId;tab='overview';spaceMenu();render()}},'Open')))):empty('No organisations yet','When a university or employer invites you, it appears here inside your own Orivia. Your chats and plans stay private.'),
   waiting.length?h('div',{class:'stack'},waiting.map(m=>h('div',{class:'note'},chip('Waiting for approval','c-wait'),' ',m.name+': your request is with its staff. You’ll see it here once they approve.'))):null),
   panel(h('h3',null,'Have an invitation?'),form)];
 }

 async function inviteView(token){
  let d;try{d=await api('/api/invitations/inspect','POST',{token})}catch(err){
   const expired=err.status===410;$('view').replaceChildren(panel(h('div',{class:'narrow stack'},chip(expired?'Invitation expired':'Invitation unavailable','c-warn'),h('h2',null,expired?'This invitation can’t be used any more':'This invitation can’t be used'),h('p',null,err.message+(expired?' Ask the organisation for a new one.':'')),h('p',{class:'small muted'},'Nothing in your Orivia has changed.'),h('div',{class:'row'},h('button',{class:'btn quiet',type:'button',onclick:()=>{location.hash='';render()}},'Back to my Orivia')))));return}
  const staffInvite=!d.approvalRequired;
  const go=h('button',{class:'btn',type:'button'},staffInvite?'Accept staff invitation':'Ask to join '+d.organisation.name);
  go.onclick=act(go,async()=>{const r=await api('/api/invitations/join','POST',{token});history.replaceState(null,'',location.pathname+location.search);await refreshMe();
   if(r.membership.status==='active'){space='org:'+r.membership.organisationId;tab='overview';spaceMenu();flash={kind:'good',text:'You’re now '+(r.membership.role==='admin'?'an admin':r.membership.role==='editor'?'an editor':'a member')+' of '+d.organisation.name+'.'}}
   else{space='home';flash={kind:'good',text:'Request sent. '+d.organisation.name+'’s staff will review it.'}}await render()});
  $('view').replaceChildren(panel(h('div',{class:'narrow stack'},chip('Invitation','c-wait'),d.organisation.demo?chip('Demo organisation','c-demo'):null,
   h('h2',null,d.organisation.name+' invited you'+(staffInvite?' to join its staff':' to connect your Orivia')),
   h('p',null,'Signed in as ',h('strong',null,user.email),'. '+(staffInvite?'You’ll help run '+d.organisation.name+'’s space with your own Orivia account.':'Joining adds '+d.organisation.name+' to your Orivia. It doesn’t create a second account.')),
   h('div',{class:'note'},h('strong',null,'They’ll see: '),'your name, email and membership. ',h('strong',null,'They won’t see: '),'your chats, calendar, About me or documents.'),
   d.approvalRequired?h('p',{class:'small muted'},'Staff approve each request.'):h('p',{class:'small muted'},'This staff invitation only works for the email it was sent to.'),
   d.available?null:h('p',{class:'notice err'},'This invitation has no places left.'),
   h('p',{class:'small muted'},'Expires '+fmtDate(d.expiresAt)),
   h('div',{class:'row'},d.available?go:null,h('button',{class:'btn quiet',type:'button',onclick:()=>{location.hash='';render()}},'Not now')))));
 }

 async function ownerView(){
  const list=(await api('/api/admin/orgs')).organisations;
  const name=h('input',{id:'org-name',required:true,maxlength:120}),slug=h('input',{id:'org-slug',required:true,pattern:'[a-z0-9]+(-[a-z0-9]+)*',maxlength:64}),city=h('input',{id:'org-city',required:true,maxlength:80});
  name.oninput=()=>{if(!slug.dataset.touched)slug.value=String(name.value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)};slug.oninput=()=>{slug.dataset.touched='1'};
  const create=h('button',{class:'btn',type:'submit'},'Create organisation');
  const form=h('form',{onsubmit:act(create,async()=>{const r=await api('/api/admin/orgs','POST',{name:name.value,slug:slug.value,city:city.value,demo:true});flash={kind:'good',text:r.organisation.name+' created. Invite its first admin next.'};await render()})},
   h('div',{class:'row'},h('div',{class:'grow'},field('Name',name)),h('div',{class:'grow'},field('Web name',slug,'Lowercase letters, numbers and hyphens'))),field('City',city),
   h('p',{class:'small muted'},'New organisations are marked as demos until a real partnership is agreed.'),h('div',{class:'row'},create));
  const rows=list.map(o=>{const email=h('input',{type:'email',required:true,'aria-label':'First admin’s email for '+o.name,placeholder:'admin@university.example'});const b=h('button',{class:'btn',type:'submit'},'Invite first admin');const result=h('div');
   const f=h('form',{class:'row',style:'align-items:flex-end',onsubmit:act(b,async()=>{const r=await api('/api/admin/orgs/'+encodeURIComponent(o.id)+'/admin-invite','POST',{recipientEmail:email.value,label:'First admin'});result.replaceChildren(secret(r));f.hidden=true})},h('div',{class:'grow'},field('First admin’s email',email)),b);
   return h('div',{class:'item',style:'align-items:flex-start'},h('div',{class:'grow stack'},h('div',null,h('strong',null,o.name),' ',o.demo?chip('Demo','c-demo'):null,' ',chip(o.status==='active'?'Active':o.status,o.status==='active'?'c-ok':'c-wait')),h('p',{class:'small muted'},o.city+' · /'+o.slug),f,result,h('p',{class:'small muted'},'Admin status isn’t shown here yet. If an admin already exists or was invited, the form says so.')))});
  return [panel(h('div',{class:'row'},h('h2',{class:'grow'},'Orivia management'),chip('Owner','c-ok')),h('p',{class:'small muted'},'You can create organisations and invite each one’s first admin. Member lists, chats and application records aren’t visible here.'),
   list.length?h('div',{class:'list'},rows):empty('No organisations yet','Create one to give its staff a dashboard and its members a space inside their Orivia.')),
   panel(h('h3',null,'Add an organisation'),form),
   panel(h('div',{class:'row'},h('h3',{class:'grow'},'Not connected yet'),chip('Coming later','c-demo')),h('p',{class:'small muted'},'Partners and sponsorships, costs, support requests and platform counts are designed but not built on the server yet.'))];
 }

 async function staffView(oid,m){
  const pre='/api/orgs/'+encodeURIComponent(oid),admin=m.role==='admin';
  const summary=await api(pre+'/summary');const org=summary.organisation;
  const tabs=[['overview','Overview'],...(admin?[['arrival','Student welcome']]:[]),['guides','Guides and information'],['members','Members'],['invitations','Invitations and QR codes'],['counts','Counts'],['records','Application records']];
  const tabBar=h('div',{class:'tabs',role:'tablist','aria-label':org.name},tabs.map(([k,l])=>h('button',{class:'tab',type:'button',role:'tab','aria-selected':String(tab===k),onclick:()=>{tab=k;render()}},l)));
  const count=(role,status)=>summary.counts.filter(c=>(!role||c.role===role)&&c.status===status).reduce((a,c)=>a+c.count,0);
  let body=[];
  if(tab==='arrival'){
   const d=await api(pre+'/arrival'),a=d.arrival||{};
   const country=h('select',null,...[['uae','UAE'],['uk','UK']].map(([value,label])=>h('option',{value},label)));country.value=a.country||'uae';
   const region=h('select'),fill=()=>{region.replaceChildren(...(country.value==='uae'?['Abu Dhabi','Ajman','Dubai','Fujairah','Ras Al Khaimah','Sharjah','Umm Al Quwain']:['England','Scotland','Wales','Northern Ireland']).map(value=>h('option',{value},value)))};fill();if(a.region)region.value=a.region;country.onchange=fill;
   const town=h('input',{required:true,maxLength:100,value:a.town||'',placeholder:'Campus city or area'}),reason=h('select',null,...[['study','Study'],['work','Work'],['join or bring my family','Family'],['something else','Something else']].map(([value,label])=>h('option',{value},label)));reason.value=a.reason||'study';
   const save=h('button',{type:'submit',class:'btn'},'Save welcome settings');
   body=[h('p',{class:'note'},'These public campus settings are shown as locked fields during student setup. They do not grant membership or change existing personal profiles. Use separate organisations for campuses with different destinations. A sign-in within 15 minutes is required to save.'),h('a',{class:'btn quiet',href:APP_HOME+'?organisation='+encodeURIComponent(org.slug)},'Open university welcome'),h('form',{onsubmit:act(save,async()=>{await api(pre+'/arrival','PATCH',{country:country.value,region:region.value,town:town.value,reason:reason.value,revision:a.revision||0});flash={kind:'good',text:'Student welcome settings saved.'};await render()})},field('Destination country',country),field('Emirate / nation',region),field('Campus city or area',town),field('Reason for moving',reason),save)];
  }
  if(tab==='overview'){
   body=[h('div',{class:'kpis'},h('div',{class:'kpi'},h('span',{class:'small muted'},'Members'),h('strong',null,count('student','active'))),h('div',{class:'kpi'},h('span',{class:'small muted'},'Waiting for approval'),h('strong',null,count('student','requested'))),h('div',{class:'kpi'},h('span',{class:'small muted'},'Staff'),h('strong',null,count('admin','active')+count('editor','active')))),
    count('student','requested')&&admin?h('p',{class:'note'},'Join requests are waiting. Open Members to decide.'):null,
    h('p',{class:'small muted'},'You’re '+(admin?'an admin: you publish, approve members and manage invitations.':'an editor: you draft guides and make public QR codes. An admin publishes and approves members.'))];
  }
  if(tab==='guides'){
   const items=(await api(pre+'/content')).content;
   const kind=h('select',{id:'c-kind'},h('option',{value:'guide'},'Guide'),h('option',{value:'date'},'Key date'),h('option',{value:'contact'},'Contact'),h('option',{value:'update'},'Service update'));
   const vis=h('select',{id:'c-vis'},h('option',{value:'members'},'Members only'),h('option',{value:'public'},'Public'));
   const title=h('input',{id:'c-title',required:true,maxlength:160}),text=h('textarea',{id:'c-body',required:true,maxlength:8000});
   const save=h('button',{class:'btn',type:'submit'},'Save draft');
   const form=h('form',{onsubmit:act(save,async()=>{await api(pre+'/content','POST',{kind:kind.value,title:title.value,body:text.value,visibility:vis.value});flash={kind:'good',text:'Draft saved.'+(admin?'':' An admin can publish it.')};await render()})},h('div',{class:'row'},h('div',{class:'grow'},field('Type',kind)),h('div',{class:'grow'},field('Who can see it',vis))),field('Title',title),field('Text',text,'Plain text. Students see it once published.'),h('div',{class:'row'},save));
   const KIND={guide:'Guide',date:'Key date',contact:'Contact',update:'Service update'};
   body=[items.length?h('div',{class:'list'},items.map(c=>{const pub=h('button',{class:c.status==='draft'?'btn':'btn quiet',type:'button'},c.status==='draft'?'Publish':'Unpublish');pub.onclick=act(pub,async()=>{await api(pre+'/content/'+encodeURIComponent(c.id),'PATCH',{revision:c.revision,status:c.status==='draft'?'published':'draft'});flash={kind:'good',text:c.status==='draft'?'Published.':'Moved back to draft.'};await render()});
     return h('div',{class:'item',style:'align-items:flex-start'},h('div',{class:'grow stack'},h('div',null,h('strong',null,c.title),' ',chip(KIND[c.kind]||c.kind,'c-wait'),' ',chip(c.status==='published'?'Published':'Draft',c.status==='published'?'c-ok':'c-demo'),' ',chip(c.visibility==='public'?'Public':'Members only','c-wait')),h('p',{class:'small content-body'},c.body)),admin?pub:h('span',{class:'small muted'},c.status==='draft'?'An admin publishes this':''))})):empty('No guides or information yet','Draft a guide, a key date, a contact or a service update. '+(admin?'You can publish it straight after.':'An admin publishes it.')),
    h('h3',null,'Add something'),form];
  }
  if(tab==='members'){
   if(!admin)body=[h('div',{class:'note'},'Only admins see members’ names and emails, and approve requests.')];
   else{const list=(await api(pre+'/members')).members,req=list.filter(x=>x.status==='requested'),act2=list.filter(x=>x.status==='active'),removed=list.filter(x=>x.status==='removed');
    const decide=(x,decision)=>{const b=h('button',{class:decision==='approve'?'btn ok':'btn quiet',type:'button'},decision==='approve'?'Approve':'Decline');b.onclick=act(b,async()=>{await api(pre+'/requests/'+encodeURIComponent(x.userId)+'/decision','POST',{decision});flash={kind:'good',text:(x.name||x.email)+(decision==='approve'?' approved.':' declined.')};await render()});return b};
    const roleControls=x=>{const select=h('select',{'aria-label':'Role for '+(x.name||x.email)},['student','editor','admin'].map(role=>h('option',{value:role,selected:x.role===role},role==='student'?'Student':role==='editor'?'Editor':'Admin'))),change=h('button',{class:'btn quiet',type:'button'},'Change role'),hint=h('p',{class:'small muted'});
     select.onchange=()=>{change.dataset.confirm='';change.textContent='Change role';hint.textContent=''};
     change.onclick=async()=>{if(select.value===x.role)return;if(change.dataset.confirm!==select.value){change.dataset.confirm=select.value;change.textContent='Confirm role change';hint.textContent=select.value==='admin'?'An admin can see member names/emails, approve joins, publish and manage staff. Personal chats stay private.':select.value==='editor'?'An editor can draft information and create public codes. They cannot approve members or publish.':'A student can read published member information. Staff controls will be removed.';return}
      await act(change,async()=>{await api(pre+'/members/'+encodeURIComponent(x.userId)+'/role','POST',{role:select.value,expectedRole:x.role,confirm:'change organisation role'});await refreshMe();flash={kind:'good',text:'Role updated. Personal Orivia data is unchanged.'};await render()})()};return h('div',{class:'stack'},h('div',{class:'row'},select,change),hint)};
    const reinstate=x=>{const b=h('button',{class:'btn quiet',type:'button'},'Allow new join request');b.onclick=async()=>{if(b.dataset.confirm!=='yes'){b.dataset.confirm='yes';b.textContent='Confirm: allow a new request';return}await act(b,async()=>{await api(pre+'/members/'+encodeURIComponent(x.userId)+'/reinstate','POST',{confirm:'allow new join request'});flash={kind:'good',text:'They can request to join again using a valid invitation. No access was restored automatically.'};await render()})()};return b};
    const remove=x=>{const b=h('button',{class:'btn danger',type:'button'},'Remove');b.onclick=act(b,async()=>{await api(pre+'/members/'+encodeURIComponent(x.userId),'DELETE',{});flash={kind:'good',text:(x.name||x.email)+' removed. Their personal Orivia is unaffected.'};await render()});return b};
    body=[h('h3',null,'Join requests'),req.length?h('div',{class:'list'},req.map(x=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,x.name||x.email),h('p',{class:'small muted'},x.email)),decide(x,'approve'),decide(x,'decline')))):empty('No requests waiting','Students ask to join by opening a student invitation. You approve each one.'),
     h('h3',null,'Members and staff'),act2.length?h('div',{class:'list'},act2.map(x=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,x.name||x.email),h('p',{class:'small muted'},x.email+' · '+(x.role==='student'?'Member':x.role==='admin'?'Admin':'Editor'))),h('div',{class:'stack'},roleControls(x),x.role==='admin'?null:remove(x))))):h('p',{class:'small muted'},'No members yet.'),
     h('p',{class:'note'},'To hand over: make a trusted member an admin, then change your own role. At least one active admin must remain. Role changes require a sign-in from the last 15 minutes.'),h('a',{href:'/account-test',class:'small'},'Open sign-in / sign-out'),
     h('h3',null,'Removed members'),removed.length?h('div',{class:'list'},removed.map(x=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,x.name||x.email),h('p',{class:'small muted'},x.email+' · Removed')),reinstate(x)))):h('p',{class:'small muted'},'No removed members.'),
     list.length>=200?h('p',{class:'note'},'Showing the first 200. Paging isn’t available yet.'):null];}
  }
  if(tab==='invitations'){
   const parts=[];
   if(admin){
    const label=h('input',{id:'i-label',required:true,maxlength:120,value:'Autumn cohort'}),days=h('select',{id:'i-days'},[1,3,7].map(n=>h('option',{value:String(n),selected:n===7},n+(n===1?' day':' days')))),cap=h('input',{id:'i-cap',type:'number',min:'1',max:'500',value:'50'});
    const make=h('button',{class:'btn',type:'submit'},'Create student invitation');const out=h('div');
    parts.push(h('h3',null,'Student invitation'),h('form',{onsubmit:act(make,async()=>{const r=await api(pre+'/invitations','POST',{role:'student',label:label.value,expiresInSeconds:Number(days.value)*86400,maxUses:Number(cap.value)});out.replaceChildren(secret(r))})},h('div',{class:'row'},h('div',{class:'grow'},field('Name (staff only)',label)),field('Lasts',days),field('Places',cap)),h('div',{class:'row'},make)),out);
    const em=h('input',{id:'e-email',type:'email',required:true,placeholder:'colleague@university.example'}),mk=h('button',{class:'btn quiet',type:'submit'},'Invite editor');const out2=h('div');
    parts.push(h('h3',null,'Staff editor invitation'),h('form',{class:'row',style:'align-items:flex-end',onsubmit:act(mk,async()=>{const r=await api(pre+'/invitations','POST',{role:'editor',recipientEmail:em.value,label:'Editor'});out2.replaceChildren(secret(r))})},h('div',{class:'grow'},field('Editor’s email',em,'Only that verified email can accept. One use.')),mk),out2);
    const invs=(await api(pre+'/invitations')).invitations;const now=Date.now();
    parts.push(h('h3',null,'Invitations'),invs.length?h('div',{class:'list'},invs.map(i=>{const state=i.revoked?['Withdrawn','c-warn']:i.expiresAt<=now?['Expired','c-warn']:i.uses>=i.maxUses?['Full','c-warn']:['Active','c-ok'];const rv=h('button',{class:'btn danger',type:'button'},'Withdraw');rv.onclick=act(rv,async()=>{await api(pre+'/invitations/'+encodeURIComponent(i.id)+'/revoke','POST',{});flash={kind:'good',text:'Invitation withdrawn. Anyone already approved stays a member.'};await render()});
     return h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,i.label||'Invitation'),' ',chip(state[0],state[1]),h('p',{class:'small muted'},(i.role==='student'?'Students':(i.role==='admin'?'Admin ':'Editor ')+(i.recipientEmail||''))+' · '+i.uses+' of '+i.maxUses+' used · expires '+fmtDate(i.expiresAt))),state[0]==='Active'?rv:null)})):h('p',{class:'small muted'},'No invitations yet.'),h('p',{class:'small muted'},'For safety, invitation links and QR codes are shown only when created.'));
   } else parts.push(h('div',{class:'note'},'Only admins create invitations. You can make public QR codes below.'));
   const content=(await api(pre+'/content')).content.filter(c=>c.status==='published'&&c.visibility==='public');
   const lbl=h('input',{id:'q-label',required:true,maxlength:120,value:'Welcome desk poster'}),target=h('select',{id:'q-target'},h('option',{value:''},'The organisation’s public page'),content.map(c=>h('option',{value:c.id},c.title)));
   const mkq=h('button',{class:'btn quiet',type:'submit'},'Create public QR code');const out3=h('div');
   const codes=(await api(pre+'/codes')).codes;
   parts.push(h('h3',null,'Public information QR code'),h('form',{onsubmit:act(mkq,async()=>{const r=await api(pre+'/codes','POST',{label:lbl.value,...(target.value?{contentId:target.value}:{})});out3.replaceChildren(secret(r))})},h('div',{class:'row'},h('div',{class:'grow'},field('Name (staff only)',lbl)),h('div',{class:'grow'},field('Opens',target,'Only published public guides can be chosen.'))),h('div',{class:'row'},mkq)),out3,
    codes.length?h('div',{class:'list'},codes.map(c=>{const show=h('button',{class:'btn quiet',type:'button'},'View / download QR'),out=h('div');show.onclick=act(show,async()=>{out.replaceChildren(secret(await api(pre+'/codes/'+encodeURIComponent(c.id))))});
     const withdraw=h('button',{class:'btn danger',type:'button'},'Withdraw');withdraw.onclick=async()=>{if(withdraw.dataset.confirm!=='yes'){withdraw.dataset.confirm='yes';withdraw.textContent='Tap again to withdraw';setTimeout(()=>{if(withdraw.isConnected){withdraw.dataset.confirm='';withdraw.textContent='Withdraw'}},5000);return}await act(withdraw,async()=>{await api(pre+'/codes/'+encodeURIComponent(c.id)+'/revoke','POST',{});flash={kind:'good',text:'Public code withdrawn. Printed copies no longer open its information. Existing memberships are unchanged.'};await render()})()};
     return h('div',{class:'stack'},h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,c.label),' ',chip(c.revoked?'Withdrawn':'Public',c.revoked?'c-warn':'c-ok'),h('p',{class:'small muted'},'Opens public information only. Never grants membership.')),c.revoked?null:show,c.revoked?null:admin?withdraw:h('span',{class:'small muted'},'An admin can withdraw this code.')),out)})):null);
   body=parts;
  }
  if(tab==='counts')body=[h('div',{class:'row'},h('h3',{class:'grow'},'Counts'),chip('Not connected yet','c-demo')),h('p',{class:'note'},'Counts of QR opens, guide views and joins will appear here once tracking of those actions is built. Orivia won’t read private conversations to fill this page.')];
  if(tab==='records'){let msg='Application records need a separate permission that nobody has yet.';try{await api(pre+'/records')}catch(err){msg=err.message}body=[h('div',{class:'denied'},h('strong',null,'Locked'),h('p',{class:'small'},msg+' Being an admin isn’t enough, and no university system is connected.'))]}
  return [panel(h('div',{class:'row'},h('h2',{class:'grow'},org.name),org.demo?chip('Demo organisation','c-demo'):null,chip(admin?'Admin':'Editor','c-ok')),tabBar,...body)];
 }

 async function studentView(oid){
  const d=await api('/api/me/orgs/'+encodeURIComponent(oid)),org=d.organisation;
  const by=k=>d.content.filter(c=>c.kind===k);
  const section=(title,items,emptyText)=>panel(h('h3',null,title),items.length?h('div',{class:'list'},items.map(c=>h('div',{class:'item',style:'align-items:flex-start'},h('div',{class:'grow stack'},h('strong',null,c.title),h('p',{class:'small content-body'},c.body))))):h('p',{class:'small muted'},emptyText));
  const leave=h('button',{class:'btn danger',type:'button'},'Leave '+org.name);
  leave.onclick=()=>{const yes=h('button',{class:'btn danger',type:'button'},'Leave '+org.name);yes.onclick=act(yes,async()=>{await api('/api/me/orgs/'+encodeURIComponent(oid),'DELETE',{});await refreshMe();space='home';flash={kind:'good',text:'You left '+org.name+'. Your chats and personal plans are unchanged.'};await render()});
   leave.replaceWith(h('div',{class:'stack'},h('p',null,'If you leave:'),h('ul',{class:'small',style:'margin:0;padding-left:18px'},h('li',null,org.name+'’s guides, dates, contacts and updates disappear from your Orivia, and its staff no longer see you as a member.'),h('li',null,'Your chats and anything you saved to your own calendar stay yours.'),h('li',null,'Anything you downloaded or screenshotted stays on your device but won’t update, so it may go out of date.')),h('div',{class:'row'},yes,h('button',{class:'btn quiet',type:'button',onclick:()=>render()},'Stay'))))};
  return [panel(h('div',{class:'row'},h('h2',{class:'grow'},'Your '+org.name+' space'),org.demo?chip('Demo organisation','c-demo'):null),h('p',{class:'small muted'},'Information from '+org.name+'. Your chats, calendar and About me aren’t shared with them.')),
   section('Service updates',by('update'),'No updates right now.'),section('Guides',by('guide'),org.name+' hasn’t published guides yet.'),section('Key dates',by('date'),'No dates yet.'),section('Contacts',by('contact'),'No contacts yet.'),
   panel(h('div',{class:'row'},h('h3',{class:'grow'},'Application progress'),chip('Not connected yet','c-demo')),h('p',{class:'small muted'},'Updates from '+org.name+'’s own systems will appear here once a reviewed integration exists. Your own steps stay private unless you choose to share them.')),
   panel(leave)];
 }

 async function publicCodeView(id){
  const d=await api('/api/public/codes/'+encodeURIComponent(id));
  $('space').closest('label').hidden=true;
  $('view').replaceChildren(panel(h('div',{class:'narrow stack'},chip('Public information','c-ok'),h('h2',null,d.organisation.name),d.organisation.demo?chip('Demo organisation','c-demo'):null,
   ...(d.content||[]).map(c=>h('div',{class:'stack'},h('h3',null,c.title),h('p',{class:'content-body'},c.body))),
   (d.content||[]).length?null:h('p',{class:'muted'},'Nothing is published here right now.'),
   h('p',{class:'small muted'},'Opening this code doesn’t make you a member or unlock anything private.'))));
 }

 async function boot(){
  try{
   const publicCode=new URL(location.href).searchParams.get('publicCode');
   if(publicCode){await publicCodeView(publicCode);return}
   user=(await api('/api/account/session')).user;$('identity').textContent=user.email;
   await refreshMe();
   const match=location.hash.match(/^#join=([a-f0-9]{64})$/);
   if(match){await inviteView(match[1]);return}
   await render();
  }catch(err){
   const signIn=err.status===401,publicLink=!!new URL(location.href).searchParams.get('publicCode');
   $('view').replaceChildren(panel(h('div',{class:'narrow stack'},h('h2',null,signIn?'Sign in to continue':publicLink?'This public link isn’t available':'Organisations aren’t available here'),h('p',null,err.message),signIn?h('p',{class:'small muted'},'Sign in from Orivia’s welcome screen, then open your link again. If it’s an invitation, it will still work while it’s valid.'):null,signIn?h('div',{class:'row'},h('a',{class:'btn',href:APP_HOME,style:'text-decoration:none;display:inline-flex;align-items:center'},'Go to sign-in')):null)));
  }
 }
 window.addEventListener('hashchange',()=>{const m=location.hash.match(/^#join=([a-f0-9]{64})$/);if(m&&user)inviteView(m[1])});
 boot();
}
