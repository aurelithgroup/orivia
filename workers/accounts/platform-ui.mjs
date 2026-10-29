/* Orivia organisations: the connected dashboards (owner, organisation staff, student space, invitations, public codes).
 * Every view and action uses the signed-in session and the server's permission checks; there is no role switcher.
 * The space menu only lists what /api/me/memberships says this account has. Content is always rendered as plain text.
 * Unfinished features (counts, application records, progress, admin status, code revocation) are labelled as such. */
export const platformPage=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#1C2733"><title>Orivia organisations · integration preview</title><style>
:root{--link:#7A5300;--linkHover:#5C3E00;--ground:#E9ECE7;--surface:#FFFFFF;--surface2:#F3F5F1;--line:#D6DBD4;--ink:#18222D;--muted:#56616C;--sign:#1C2733;--signInk:#F4F6F7;--amber:#F2B90F;--amberSoft:#FFF3C9;--amberInk:#6B4E00;--ok:#1D7F55;--okSoft:#DDF0E6;--warn:#A8480A;--warnSoft:#FBE7D9;--focus:#2F6FEB;--focusSoft:#E4ECFD;--btn:#1C2733;--btnInk:#FFFFFF;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--link:#F5C842;--linkHover:#FFDC7A;--ground:#0B1015;--surface:#141B23;--surface2:#1A232D;--line:#29333E;--ink:#E6EAEE;--muted:#9AA5B0;--sign:#080C10;--amberSoft:#3A3110;--amberInk:#F7D873;--ok:#46C08A;--okSoft:#15342A;--warn:#F2914A;--warnSoft:#3A2414;--focus:#7AA5FF;--focusSoft:#18284A;--btn:#F2B90F;--btnInk:#1C2733;color-scheme:dark}}
*{box-sizing:border-box}[hidden]{display:none!important}body{margin:0;background:var(--ground);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
button,input,select,textarea{font:inherit;color:inherit}:where(a){color:var(--link);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}:where(a):hover{color:var(--linkHover);text-decoration-thickness:2px}:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
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
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0 12px}.stack{display:flex;flex-direction:column;gap:10px}
.muted{color:var(--muted)}.small{font-size:13px}
.btn{border:0;background:var(--btn);color:var(--btnInk);font-weight:700;border-radius:999px;padding:10px 18px;cursor:pointer;min-height:44px}
.btn.quiet{background:transparent;color:var(--ink);border:1px solid var(--line)}.btn.ok{background:var(--ok);color:#FFFFFF}.btn.danger{background:transparent;color:var(--warn);border:1px solid var(--line)}
.btn[disabled]{opacity:.5;cursor:not-allowed}
form{display:flex;flex-direction:column;gap:12px}form.row{flex-direction:row}.stack>.chip,.panel>.chip{align-self:flex-start}
.field{display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:14px}fieldset{border:1px solid var(--line);border-radius:14px;padding:12px 14px 14px;margin:14px 0;display:grid;gap:12px;min-width:0}legend{font-weight:700;padding:0 6px}.check{display:flex;gap:10px;align-items:flex-start;font-size:15px}.check input{margin-top:3px;width:18px;height:18px;flex:none}
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
.focus-flash{outline:3px solid var(--amber);outline-offset:4px;border-radius:8px}.defs dl{margin:8px 0 0;display:grid;gap:2px}.defs dt{font-weight:700;margin-top:6px}.defs dd{margin:0}
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
  let memberSearch='',memberPages=1,editingContent=null;
  let user=null,me={platformRoles:[],memberships:[]},space=location.pathname==='/manage'?'owner':(()=>{const o=new URLSearchParams(location.search).get('org');return o&&/^[A-Za-z0-9-]{1,64}$/.test(o)?'org:'+o:'home'})(),tab='overview',flash=null;
 /* ---- tiny DOM helper: text is always text ---- */
 function h(tag,props,...kids){const n=document.createElement(tag);if(props)for(const [k,v] of Object.entries(props)){if(v===undefined||v===null||v===false)continue;if(k==='value')continue;else if(k==='class')n.className=v;else if(k.startsWith('on'))n.addEventListener(k.slice(2),v);else if(v===true)n.setAttribute(k,'');else n.setAttribute(k,String(v))}for(const k of kids.flat()){if(k===null||k===undefined||k===false)continue;n.append(k instanceof Node?k:document.createTextNode(String(k)))}if(props&&Object.hasOwn(props,'value'))n.value=props.value??'';return n}
 const chip=(text,kind)=>h('span',{class:'chip '+kind},text);
 const panel=(...kids)=>h('section',{class:'panel'},...kids);
 const empty=(title,text,...more)=>h('div',{class:'empty'},h('strong',null,title),h('p',{class:'small muted'},text),...more);
 /* ---- API: session-scoped, account header on every request ---- */
 const ERR={settings_changed:'Someone else changed these settings. Reload them and try again.',export_not_allowed:'Your organisation hasn’t allowed editors to download counts. Ask an admin.','invalid_settings:studentContact.method':'Add an email, phone or website for the student contact.','invalid_settings:studentContact.label':'Give the student contact a name (up to 80 characters).','invalid_settings:studentContact.email':'Check the contact email.','invalid_settings:studentContact.phone':'Check the contact phone number.','invalid_settings:studentContact.website':'Use a full https:// link for the contact website.','invalid_details:date':'Check the date.','invalid_details:time':'Check the time (hours and minutes).','invalid_details:timeZone':'Choose a time zone for a date with a time.','invalid_details:phone':'Check the phone number (digits, spaces, + and brackets only).','invalid_details:email':'Check the email address.','invalid_details:website':'Use a full https:// link for the website.','invalid_details:sourceUrl':'Use a full https:// link for the source page.','invalid_details:relatedId':'Choose a guide from this organisation.','invalid_details:action':'Fill in both the action button text and its link, or neither.','invalid_details:actionLabel':'Shorten the action button text (60 characters, no < or >).','invalid_details:actionUrl':'Use a full https:// link for the action.','invalid_details:contact':'Add at least one way to reach this contact, or leave all three empty.',arrival_conflict:'These welcome settings changed. Refresh and try again.',invalid_arrival:'Check the destination, campus and reason.',invalid_arrival_region:'Choose an emirate or UK nation for that country.',sign_in_required:'Please sign in to Orivia first.',verified_email_required:'Please verify your email address first.',account_changed:'You signed in as someone else in another tab. Reload this page.',owner_required:'Only Orivia’s owner can do this.',permission_denied:'Your role here doesn’t allow this.',not_found:'That isn’t available, or you don’t have access to it.',public_code_withdrawn:'This public code was withdrawn. Create a new one to share.',invitation_not_found:'This invitation link isn’t recognised.',invitation_unavailable:'This invitation has expired or was withdrawn.',invitation_for_another_email:'This invitation was sent to a different email address.',membership_exists:'You already have a membership here.',membership_removed:'You were removed from this organisation. Ask its staff to add you again.',invitation_no_longer_available:'This invitation has no places left.',admin_already_assigned:'This organisation already has an admin or a pending admin invitation.',slug_exists:'That web name is already taken.',invalid_organisation:'Check the name and web name (lowercase letters, numbers and hyphens).',invalid_email:'Check the email address.',invalid_text:'Please fill this in (plain text).',invalid_expiry:'Invitations can last up to 7 days.',invalid_capacity:'Choose between 1 and 500 places.',content_conflict:'Someone changed this in the meantime. Refreshed with the latest version.',request_no_longer_approvable:'This request can’t be approved any more (its invitation may have expired).',recent_sign_in_required:'Please sign out and sign in again before changing protected organisation settings.',role_confirmation_required:'Confirm the role change first.',role_change_conflict:'That role changed, or this is the last admin. Refresh the member list before trying again.',reinstatement_confirmation_required:'Confirm that this person may request to join again.',reinstatement_conflict:'This membership changed. Refresh the member list.',member_cannot_be_removed:'Change an admin to another role before removing them. Keep at least one admin.',transfer_admin_first:'Make another trusted member an admin, then change your own role before leaving.',public_target_required:'Pick a guide that is published and public.',organisations_unavailable:'Organisations aren’t switched on in this environment yet.',accounts_unavailable:'Accounts aren’t switched on in this environment yet.',separate_records_permission_required:'Application records need a separate permission that nobody has yet.'};
 // A server failure carries a short reference (28 Oct): shown so the owner can find that request in the logs.
 const safeRef=v=>typeof v==='string'&&/^[a-f0-9]{6,16}$/.test(v)?v:'';
 class ApiError extends Error{constructor(status,code,ref=''){super((ERR[code]||'Something went wrong. Please try again.')+(safeRef(ref)?' Reference: '+safeRef(ref)+'.':''));this.status=status;this.code=code;this.ref=safeRef(ref)}}
 async function api(path,method='GET',body){const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:{...(user?{'X-Orivia-Account':user.id}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});let d={};try{d=await r.json()}catch(_){}if(!r.ok)throw new ApiError(r.status,d.error,d.ref);return d}
 function act(button,fn){return async e=>{e&&e.preventDefault&&e.preventDefault();if(button)button.disabled=true;try{await fn()}catch(err){flash={kind:'err',text:err.message};if(err.code==='content_conflict'||err.code==='account_changed'){}await render()}finally{if(button&&button.isConnected)button.disabled=false}}}
 const field=(label,input,hint)=>h('label',{class:'field'},label,input,hint?h('span',{class:'hint'},hint):null);
 const restored=window.OriviaRestoredUI({h,panel,field,api,act,getUser:()=>user,message:text=>{flash={kind:'good',text}},refresh:async()=>{await refreshMe();await render()}});
 const orgOf=id=>me.memberships.find(m=>m.organisationId===id);
 const fmtDate=ms=>new Date(ms).toLocaleString(undefined,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});

 /* ---- Space menu: only what the server says this account has ---- */
 function spaceMenu(){const sel=$('space');sel.replaceChildren(h('option',{value:'home'},'My Orivia'));if(me.platformRoles.includes('support'))sel.append(h('option',{value:'support'},'Orivia support'));if(me.platformRoles.includes('owner'))sel.append(h('option',{value:'owner'},'Orivia management'));
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
 // Campus directory categories (area 23); the stored values are checked by content-details.mjs.
const DIRECTORY={student_hub:'Student hub',international:'International office',library:'Library',printing:'Printing',it:'IT help',health:'Health',wellbeing:'Wellbeing and counselling',accessibility:'Accessibility and disability support',accommodation:'Accommodation',food:'Food and drink',transport:'Transport and parking',security:'Security',other:'Other'};
// The campus directory lines a student sees for a contact (the same wording as the app's university space).
function directoryLines(c,org){const d=c.details||{};if(c.kind!=='contact'||!(d.category||d.building||d.address))return [];const p=t=>h('p',{class:'small'},t);
 return [d.category?p(DIRECTORY[d.category]||d.category):null,d.building||d.room?p('Where: '+[d.building,d.room].filter(Boolean).join(', ')):null,d.address?p('Address: '+d.address):null,p('Opening: '+(d.openingHours||'not provided')),p('Accessibility: '+(d.accessibility||'not provided. Ask the service before you go')),d.directions?p('Directions: '+d.directions):null,p(d.reviewedOn?'Checked by '+org.name+' on '+d.reviewedOn:'Not dated by '+org.name),org.demo&&d.phone?p('Demo number (not callable): '+d.phone):null].filter(Boolean)}
function detailSummary(c,items){const d=c.details||{},parts=[];if(d.category)parts.push(DIRECTORY[d.category]||d.category);if(d.building||d.room)parts.push([d.building,d.room].filter(Boolean).join(', '));if(d.openingHours)parts.push('Open: '+d.openingHours);if(d.reviewedOn)parts.push('Checked '+d.reviewedOn);if(d.date)parts.push(d.date+(d.time?' '+d.time+' ('+d.timeZone+')':' (all day)'));if(d.phone)parts.push('Phone '+d.phone);if(d.email)parts.push('Email '+d.email);if(d.website)parts.push(d.website);if(d.sourceUrl)parts.push('Source: '+d.sourceUrl);if(c.kind==='contact'&&(d.building||d.address)&&!d.openingHours)parts.push('Opening information not given');if(d.relatedId){const g=items.find(x=>x.id===d.relatedId);parts.push('Related guide: '+(g?g.title:'not available'))}if(d.actionLabel)parts.push(d.actionLabel+' → '+d.actionUrl);return parts.join(' · ')}
 async function render(){syncAddress();
  const view=$('view');const out=[];
  if(flash)out.push(h('p',{class:'notice '+(flash.kind==='err'?'err':'good'),role:flash.kind==='err'?'alert':'status'},flash.text));
  try{
   const partner=location.hash.match(/^#partner=([a-f0-9]{64})$/);if(partner)out.push(await restored.partner(partner[1]));else if(space==='home')out.push(...await homeView());
   else if(space==='support')out.push(await restored.escalations());
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
  return [...await restored.notices(),panel(h('div',{class:'row'},h('h2',{class:'grow'},'Your organisations'),chip('Signed in','c-ok')),
   active.length?h('div',{class:'list'},active.map(m=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,m.name),' ',m.demo?chip('Demo','c-demo'):null,h('p',{class:'small muted'},m.role==='student'?'Student':m.role==='admin'?'Staff admin':'Staff editor')),h('button',{class:'btn quiet',type:'button',onclick:()=>{space='org:'+m.organisationId;tab='overview';spaceMenu();render()}},'Open')))):empty('No organisations yet','When a university or employer invites you, it appears here inside your own Orivia. Your chats and plans stay private.'),
   waiting.length?h('div',{class:'stack'},waiting.map(m=>h('div',{class:'note'},chip('Waiting for approval','c-wait'),' ',m.name+': your request is with its staff. You’ll see it here once they approve.'))):null),
   panel(h('h3',null,'Have an invitation?'),form),await restored.privacyPanel()];
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

 // Reply feedback queue (ORI-CHAT-007/008): ratings for the last 30 days and reports, with no reporter identity.
 async function feedbackPanel(){
  let d;try{d=await api('/api/account/feedback/queue')}catch(e){return panel(h('h3',null,'Feedback from Chat'),h('p',{class:'small muted'},'Feedback isn’t available right now.'))}
  const CAT={inaccurate:'Inaccurate information',unsafe:'Unsafe answer',privacy:'Privacy issue',technical:'Technical problem',other:'Something else'};
  const reasons=Object.entries(d.ratings.reasons||{}).map(([k,n])=>k+' '+n).join(', ');
  const rows=d.reports.map(r=>{const btn=h('button',{class:'btn quiet small',type:'button'},r.status==='open'?'Mark reviewed':'Reopen');
   btn.onclick=act(btn,async()=>{await api('/api/account/feedback/queue/'+encodeURIComponent(r.id),'POST',{status:r.status==='open'?'reviewed':'open'});await render()});
   return h('div',{class:'item',style:'align-items:flex-start'},h('div',{class:'grow stack'},h('div',null,h('strong',null,CAT[r.category]||r.category),' ',chip(r.status==='open'?'Open':'Reviewed',r.status==='open'?'c-warn':'c-ok'),' ',h('span',{class:'small muted'},r.receipt+' · '+new Date(r.createdAt).toLocaleString())),
    r.note?h('p',{class:'small'},r.note):h('p',{class:'small muted'},'No note.'),r.replyText?h('details',null,h('summary',{class:'small'},'Reply they included'),h('p',{class:'small',style:'white-space:pre-wrap'},r.replyText)):null),btn)});
  return panel(h('div',{class:'row'},h('h3',{class:'grow'},'Feedback from Chat'),chip('Live','c-ok')),
   h('p',{class:'small muted'},'Last '+d.ratings.days+' days: '+d.ratings.up+' helpful, '+d.ratings.down+' not helpful'+(reasons?' ('+reasons+')':'')+'. Reports are stored with the sender’s account (and deleted with it); this list omits their name and email. Notes and any included reply are written by the person and can contain personal or document details: treat them as private.'),
   rows.length?h('div',{class:'list'},rows):empty('No reports yet','Problems people report from a Chat reply appear here.'));
 }
 // Founder overview (ORI-OWNER-001/002/007/009): real counts with definitions, budgets from the server's own meters or
 // "Unavailable", an organisation directory with search and direct actions. Never chats, files, student marks or identities.
 let ownerQuery='';
 async function ownerView(){
  let ov=null,ovError=false;try{ov=await api('/api/admin/overview')}catch(_){ovError=true}
  let list=[],listError=false;try{list=(await api('/api/admin/orgs?q='+encodeURIComponent(ownerQuery))).organisations}catch(_){listError=true}
  const D=ov?ov.definitions:{};
  const defs=[];const kpi=(label,value,def,link)=>{defs.push(h('div',null,h('dt',null,label),h('dd',{class:'small muted'},def)));return h('div',{class:'kpi'},h('span',{class:'small muted'},label),h('strong',null,value==null?'Unavailable':String(value)),value==null?h('span',{class:'small muted'},'Not available from the server right now.'):null,link||null)};
  const jump=(id,text)=>h('a',{href:'#'+id,class:'small'},text);
  const overview=ov?panel(h('div',{class:'row'},h('h2',{class:'grow'},'Overview'),chip('Live data','c-ok')),
   h('p',{class:'small muted'},'Counted by the server just now ('+new Date(ov.generatedAt).toLocaleString()+'). Member names, chats, files and student progress aren’t shown here.'),
   h('div',{class:'kpis'},
    kpi('Organisations',ov.counts.organisations.total,D.organisations,[h('span',{class:'small muted'},ov.counts.organisations.active+' active · '+ov.counts.organisations.paused+' paused · '+ov.counts.organisations.demo+' demo'),jump('owner-directory','See organisations')]),
    kpi('Active students',ov.counts.activeStudents,D.activeStudents),
    kpi('Active staff',ov.counts.activeStaff,D.activeStaff),
    kpi('Join requests waiting',ov.counts.joinRequests,D.joinRequests+' Each organisation’s admins approve their own.',jump('owner-directory','See which organisations')),
    kpi('Open invitations',ov.counts.openInvitations,D.openInvitations),
    kpi('Published content',ov.counts.publishedContent,D.publishedContent),
    kpi('Drafts',ov.counts.draftContent,D.draftContent),
    kpi('Feedback to review',ov.counts.feedbackOpen,D.feedbackOpen,jump('owner-feedback','Open the feedback list'))),
   h('details',{class:'defs'},h('summary',{class:'small'},'What these numbers mean'),h('dl',{class:'small'},defs)))
   :panel(h('h2',null,'Overview'),h('p',{class:'small muted'},ovError?'The overview couldn’t be loaded. Nothing is shown rather than a guess. Reload to try again.':'Loading…'));
  const money=(v,unit)=>unit==='USD'?'$'+Number(v).toFixed(2):String(v);
  const budgets=ov?panel(h('h3',null,'Budgets and usage'),h('p',{class:'small muted'},D.budgets),
   h('div',{class:'list'},ov.budgets.map(b=>h('div',{class:'item',style:'align-items:flex-start'},h('div',{class:'grow stack'},h('div',null,h('strong',null,b.label),' ',b.status==='available'?chip('Server meter','c-ok'):chip('Unavailable','c-wait')),
    b.status==='available'?h('p',{class:'small'},'Today '+money(b.day.used,b.unit)+' of '+money(b.day.limit,b.unit)+' · This month '+money(b.month.used,b.unit)+' of '+money(b.month.limit,b.unit)):h('p',{class:'small muted'},'Unavailable: no limit is configured here, or its counter can’t be read. No estimate is shown.'),
    b.scope?h('p',{class:'small muted'},b.scope):null))))):null;
  // Directory with search and per-organisation actions.
  const search=h('input',{type:'search',style:'width:100%',value:ownerQuery,maxlength:80,'aria-label':'Search organisations by name, web name or city',placeholder:'Search by name, web name or city'});
  const go=h('button',{class:'btn quiet',type:'submit'},'Search');
  const searchForm=h('form',{class:'row',role:'search',onsubmit:act(go,async()=>{ownerQuery=search.value.trim();await render()})},h('div',{class:'grow',style:'min-width:0'},search),go,ownerQuery?h('button',{class:'btn quiet',type:'button',onclick:async()=>{ownerQuery='';await render()}},'Clear'):null);
  const name=h('input',{id:'org-name',required:true,maxlength:120}),slug=h('input',{id:'org-slug',required:true,pattern:'[a-z0-9]+(-[a-z0-9]+)*',maxlength:64}),city=h('input',{id:'org-city',required:true,maxlength:80});
  name.oninput=()=>{if(!slug.dataset.touched)slug.value=String(name.value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)};slug.oninput=()=>{slug.dataset.touched='1'};
  const create=h('button',{class:'btn',type:'submit'},'Create organisation');
  const form=h('form',{onsubmit:act(create,async()=>{const r=await api('/api/admin/orgs','POST',{name:name.value,slug:slug.value,city:city.value,demo:true});flash={kind:'good',text:r.organisation.name+' created. Invite its first admin next.'};await render()})},
   h('div',{class:'row'},h('div',{class:'grow'},field('Name',name)),h('div',{class:'grow'},field('Web name',slug,'Lowercase letters, numbers and hyphens'))),field('City',city),
   h('p',{class:'small muted'},'New organisations are marked as demos until a real partnership is agreed.'),h('div',{class:'row'},create));
  const staffOf=id=>me.memberships.find(m=>m.organisationId===id&&m.status==='active'&&m.role!=='student');
  const rows=list.map(o=>{const email=h('input',{type:'email',required:true,'aria-label':'First admin’s email for '+o.name,placeholder:'admin@university.example'});const b=h('button',{class:'btn',type:'submit'},'Invite first admin');const result=h('div');
   const f=h('form',{class:'row',style:'align-items:flex-end',onsubmit:act(b,async()=>{const r=await api('/api/admin/orgs/'+encodeURIComponent(o.id)+'/admin-invite','POST',{recipientEmail:email.value,label:'First admin'});result.replaceChildren(secret(r));f.hidden=true})},h('div',{class:'grow'},field('First admin’s email',email)),b);
   const t=o.totals||{};const mine=staffOf(o.id);
   const open=mine?h('button',{class:'btn quiet small',type:'button',onclick:()=>{space='org:'+o.id;tab='overview';flash=null;render()}},'Open its dashboard'):h('span',{class:'small muted'},'Its dashboard is for its own staff.');
   return h('div',{class:'item',id:'org-'+o.slug,style:'align-items:flex-start'},h('div',{class:'grow stack'},h('div',null,h('strong',null,o.name),' ',o.demo?chip('Demo','c-demo'):null,' ',chip(o.status==='active'?'Active':o.status,o.status==='active'?'c-ok':'c-wait'),t.requests?' ':null,t.requests?chip(t.requests+' waiting to join','c-warn'):null),
    h('p',{class:'small muted'},o.city+' · /'+o.slug+' · '+(t.students||0)+' students, '+(t.staff||0)+' staff, '+(t.published||0)+' published, '+(t.drafts||0)+' drafts'),
    h('div',null,chip(o.adminActive?'Admin active':o.adminInvitePending?'Admin invited, not accepted yet':'No admin yet',o.adminActive?'c-ok':o.adminInvitePending?'c-wait':'c-warn')),o.adminActive?null:f,result,open))});
  const fb=await feedbackPanel();fb.id='owner-feedback';
  const dir=panel(h('div',{class:'row'},h('h3',{class:'grow'},'Organisations'),h('span',{class:'small muted'},list.length+(list.length===100?'+':'')+' shown'),list.length?h('a',{class:'btn quiet small',href:'/api/admin/export/organisations.csv'+(ownerQuery?'?q='+encodeURIComponent(ownerQuery):''),download:'orivia-organisations.csv'},'Download CSV'):null),searchForm,h('p',{class:'small muted'},'The CSV has the totals shown here (no names or emails), up to 100 organisations, and each download is recorded.'),
   listError?h('p',{class:'small muted'},'Organisations couldn’t be loaded. Reload to try again.'):list.length?h('div',{class:'list'},rows):ownerQuery?empty('No matches','No organisation’s name, web name or city contains “'+ownerQuery+'”.'):empty('No organisations yet','Create one to give its staff a dashboard and its members a space inside their Orivia.'));
  dir.id='owner-directory';
  return [panel(h('div',{class:'row'},h('h2',{class:'grow'},'Orivia management'),chip('Owner','c-ok')),h('p',{class:'small muted'},'Platform totals, budgets, organisations and Chat feedback. Member lists, chats, files and student progress aren’t visible here.')),
   overview,budgets,await restored.workbench(),await restored.sponsorships(),dir,panel(h('h3',null,'Add an organisation'),form),fb,
   panel(h('div',{class:'row'},h('h3',{class:'grow'},'Not connected yet'),chip('Coming later','c-demo')),h('p',{class:'small muted'},'Operational records are in the workbench. Institution SSO, live application records and payment collection need separate integrations.'))].filter(Boolean);
 }

 async function staffView(oid,m){
  const pre='/api/orgs/'+encodeURIComponent(oid),admin=m.role==='admin';
  const summary=await api(pre+'/summary');const org=summary.organisation;
  const tabs=[['overview','Overview'],...(admin?[['arrival','Student welcome']]:[]),['guides','Guides and information'],['processes','Process templates'],['support','Support'],['members','Members'],['invitations','Invitations and QR codes'],['counts','Counts'],['records','Application records'],['settings','Settings'],...(admin?[['activity','Activity']]:[])];
  const tabBar=h('div',{class:'tabs',role:'tablist','aria-label':org.name},tabs.map(([k,l])=>h('button',{class:'tab',type:'button',role:'tab','aria-selected':String(tab===k),onclick:()=>{tab=k;render()}},l)));
  const count=(role,status)=>summary.counts.filter(c=>(!role||c.role===role)&&c.status===status).reduce((a,c)=>a+c.count,0);
  // Needs attention: real records from this organisation, each opening the workflow that resolves it.
  const goTo=(t,id)=>async()=>{tab=t;flash=null;await render();if(id){const el=document.getElementById('content-'+id);if(el){el.scrollIntoView({block:'center'});el.classList.add('focus-flash');el.setAttribute('tabindex','-1');el.focus({preventScroll:true})}}};
  const KINDS={guide:'Guide',date:'Key date',contact:'Contact',update:'Service update'};
  const todo=(()=>{const t=summary.tasks;if(!t)return panel(h('h3',null,'Needs attention'),h('p',{class:'small muted'},'This list isn’t available right now. Nothing is shown rather than a guess.'));
   const rows=[],row=(title,detail,action,kind='c-warn',label)=>rows.push(h('div',{class:'item',style:'align-items:flex-start'},h('div',{class:'grow stack'},h('div',null,h('strong',null,title),label?' ':null,label?chip(label,kind):null),detail?h('p',{class:'small muted'},detail):null),action||null));
   const btn=(text,fn)=>h('button',{class:'btn quiet small',type:'button',onclick:fn},text);
   if(t.pendingJoins)row(t.pendingJoins+(t.pendingJoins===1?' student is':' students are')+' waiting to join',admin?'Approve or decline them in Members.':'Only admins can approve join requests.',admin?btn('Review requests',goTo('members')):null,'c-warn','Waiting');
   for(const c of t.drafts.items)row(c.title,KINDS[c.kind]+' · draft, not visible to students yet.',btn(admin?'Review and publish':'Open draft',goTo('guides',c.id)),'c-demo','Draft');
   if(t.drafts.total>t.drafts.items.length)rows.push(h('p',{class:'small muted'},'and '+(t.drafts.total-t.drafts.items.length)+' more drafts in Guides and information.'));
   for(const d of t.pastDates)row(d.title,'Key date '+d.date+' has passed but is still published. Update the date or move it back to draft.',btn('Update',goTo('guides',d.id)),'c-warn','Past');
   for(const d of t.datesWithoutDate)row(d.title,'Published key date without a date. Add the date so students can add it to their calendar.',btn('Add the date',goTo('guides',d.id)),'c-warn','No date');
   for(const u of t.endedUpdates||[])row(u.title,'Service update ended on '+u.showUntil+'. Students no longer see it. Unpublish it or give it a new end date.',btn('Open',goTo('guides',u.id)),'c-wait','Ended');
   for(const c of t.contactsMissingDetails)row(c.title,'Published contact with no phone, email or website, so students get no Call, Email or Website button.',btn('Add details',goTo('guides',c.id)),'c-warn','Missing details');
   if(!t.publishedContacts)row('No contact published','Students can’t reach an office from their space until a contact is published.',btn('Add a contact',goTo('guides')),'c-wait','Suggestion');
   const upcoming=t.upcomingDates.length?h('div',{class:'stack'},h('h4',null,'Coming up in the next 30 days'),h('div',{class:'list'},t.upcomingDates.map(d=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,d.title),h('p',{class:'small muted'},d.date+(d.time?' '+d.time:' (all day)'))),btn('Open',goTo('guides',d.id)))))):h('p',{class:'small muted'},'No key dates in the next 30 days.');
   return panel(h('div',{class:'row'},h('h3',{class:'grow'},'Needs attention'),chip(rows.length?String(rows.filter(r=>r.classList&&r.classList.contains('item')).length)+' to do':'All clear',rows.length?'c-warn':'c-ok')),
    rows.length?h('div',{class:'list'},rows):h('p',{class:'small muted'},'Nothing needs attention: no join requests, drafts, past or undated key dates, or contacts missing details.'),upcoming)})();
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
   body=[todo,h('div',{class:'kpis'},h('div',{class:'kpi'},h('span',{class:'small muted'},'Members'),h('strong',null,count('student','active'))),h('div',{class:'kpi'},h('span',{class:'small muted'},'Waiting for approval'),h('strong',null,count('student','requested'))),h('div',{class:'kpi'},h('span',{class:'small muted'},'Staff'),h('strong',null,count('admin','active')+count('editor','active')))),
    h('div',{class:'kpis'},h('div',{class:'kpi'},h('span',{class:'small muted'},'New student memberships · last 30 days'),h('strong',null,summary.activity?.joinedLast30Days??0)),h('div',{class:'kpi'},h('span',{class:'small muted'},'Invitation uses'),h('strong',null,summary.activity?.invitationUses??0)),h('div',{class:'kpi'},h('span',{class:'small muted'},'Published guides and dates'),h('strong',null,(summary.activity?.published||[]).filter(p=>['guide','date'].includes(p.kind)).reduce((a,p)=>a+p.count,0)))),
    await (async()=>{const pr=(await api(pre+'/progress')).progress;
     const intro=h('p',{class:'small muted'},'Students can mark your guides and key dates as done. You see totals only, never names, and only when at least '+pr.minimum+' students share their progress. Students can switch sharing off.');
     if(pr.reason==='reporting_paused')return panel(h('div',{class:'row'},h('h3',{class:'grow'},'Student progress'),chip('Paused','c-demo')),h('p',{class:'small muted'},'Students can mark your guides and key dates as done for themselves. Totals are paused while we agree how to report them without revealing any one student’s progress. Their marks stay private.'));
     if(!pr.items.length)return panel(h('h3',null,'Student progress'),intro,h('p',{class:'small muted'},'Publish a guide or key date to see progress here.'));
     if(!pr.shown)return panel(h('h3',null,'Student progress'),intro,h('p',{class:'note'},'Not shown yet: fewer than '+pr.minimum+' students are sharing their progress.'));
     return panel(h('h3',null,'Student progress'),intro,h('div',{class:'list'},pr.items.map(i=>{const pct=pr.students?Math.round(i.done/pr.students*100):0;return h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,i.title),h('p',{class:'small muted'},i.done+' of '+pr.students+' students · '+pct+'%')),h('div',{style:'width:120px;height:8px;border-radius:4px;background:var(--line,#ddd);overflow:hidden','aria-hidden':'true'},h('div',{style:'height:100%;width:'+pct+'%;background:var(--ok,#4a8)'})))})))})(),
    h('p',{class:'small muted'},'You’re '+(admin?'an admin: you publish, approve members and manage invitations.':'an editor: you draft guides and make public QR codes. An admin publishes and approves members.'))];
  }
  if(tab==='guides'){
   const items=(await api(pre+'/content')).content;
   const kind=h('select',{id:'c-kind'},h('option',{value:'guide'},'Guide'),h('option',{value:'date'},'Key date'),h('option',{value:'contact'},'Contact'),h('option',{value:'update'},'Service update'));
   const vis=h('select',{id:'c-vis'},h('option',{value:'members'},'Members only'),h('option',{value:'public'},'Public'));
   const title=h('input',{id:'c-title',required:true,maxlength:160}),text=h('textarea',{id:'c-body',required:true,maxlength:8000});
   const save=h('button',{class:'btn',type:'submit'},'Save draft');
   // Optional details, by type. Students get buttons only for what's filled in here; nothing is guessed.
   const tzHere=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Dubai'}catch(_){return 'Asia/Dubai'}})();
   const zones=[...new Set(['Asia/Dubai','Europe/London',tzHere])];
   const dDate=h('input',{type:'date',id:'d-date'}),dTime=h('input',{type:'time',id:'d-time'}),dZone=h('select',{id:'d-zone'},zones.map(z=>h('option',{value:z},z)));
   const dCat=h('select',{id:'d-cat'},h('option',{value:''},'Not in the campus directory'),Object.entries(DIRECTORY).map(([v,l])=>h('option',{value:v},l))),dBuilding=h('input',{id:'d-building',maxlength:80}),dRoom=h('input',{id:'d-room',maxlength:80}),dAddress=h('input',{id:'d-address',maxlength:200}),dHours=h('textarea',{id:'d-hours',maxlength:300,rows:2}),dAccess=h('textarea',{id:'d-access',maxlength:500,rows:2}),dDirections=h('textarea',{id:'d-directions',maxlength:500,rows:2}),dCSource=h('input',{type:'url',id:'d-csource',maxlength:500,placeholder:'https://'}),dReviewed=h('input',{type:'date',id:'d-reviewed'});
   const cPhone=h('input',{type:'tel',id:'d-phone',maxlength:30,autocomplete:'off'}),cEmail=h('input',{type:'email',id:'d-email',maxlength:200}),cWeb=h('input',{type:'url',id:'d-web',maxlength:500,placeholder:'https://'});
   const gSource=h('input',{type:'url',id:'d-source',maxlength:500,placeholder:'https://'});
   const guides=items.filter(c=>c.kind==='guide'),uRel=h('select',{id:'d-related'},h('option',{value:''},'None'),guides.map(c=>h('option',{value:c.id},c.title+(c.status==='draft'?' (draft)':'')))),uLabel=h('input',{id:'d-alabel',maxlength:60}),uUrl=h('input',{type:'url',id:'d-aurl',maxlength:500,placeholder:'https://'}),uUntil=h('input',{type:'date',id:'d-until'});
   const groups={date:h('div',{class:'stack'},h('div',{class:'row'},h('div',{class:'grow'},field('Date',dDate)),h('div',{class:'grow'},field('Time (optional)',dTime,'Leave empty for an all-day date.')),h('div',{class:'grow'},field('Time zone',dZone)))),
    contact:h('div',{class:'stack'},h('div',{class:'row'},h('div',{class:'grow'},field('Phone (optional)',cPhone)),h('div',{class:'grow'},field('Email (optional)',cEmail))),field('Website (optional)',cWeb,'Students see Call, Email and Website buttons only for what you fill in.'),
     h('h4',null,'Campus directory (optional)'),h('p',{class:'small muted'},'Fill in only what you know. Anything left empty is shown to students as not provided, never guessed.'),
     field('Category',dCat),h('div',{class:'row'},h('div',{class:'grow'},field('Building',dBuilding)),h('div',{class:'grow'},field('Floor or room',dRoom))),field('Address for map directions',dAddress,'Students get map links only when this is filled in, and never for a demo organisation.'),
     field('Opening information',dHours,'As your university states it, for example term-time hours.'),field('Accessibility',dAccess,'Step-free access, lifts, accessible toilets, hearing loops: only what you have checked.'),field('Directions',dDirections,'How to find it on campus, for example from the main gate.'),
     h('div',{class:'row'},h('div',{class:'grow'},field('Source page',dCSource)),h('div',{class:'grow'},field('Last checked',dReviewed,'The day someone last checked these details.')))),
    guide:h('div',{class:'stack'},field('Source page (optional)',gSource,'A link to the official page this guide is based on.')),
    update:h('div',{class:'stack'},field('Related guide (optional)',uRel),h('div',{class:'row'},h('div',{class:'grow'},field('Action button text (optional)',uLabel)),h('div',{class:'grow'},field('Action link',uUrl,'Fill both or neither.'))),field('Show until (optional)',uUntil,'After this date students no longer see the update.'))};
   const detailBox=h('div',{class:'stack'});const showDetails=()=>detailBox.replaceChildren(groups[kind.value]);kind.addEventListener('change',showDetails);showDetails();
   const v=x=>x.value.trim(),pick=o=>{const out={};for(const [k,val] of Object.entries(o))if(val)out[k]=val;return Object.keys(out).length?out:undefined};
   const details=()=>({date:()=>pick({date:v(dDate),time:v(dTime),timeZone:v(dDate)?dZone.value:''}),contact:()=>pick({phone:v(cPhone),email:v(cEmail),website:v(cWeb),category:dCat.value,building:v(dBuilding),room:v(dRoom),address:v(dAddress),openingHours:v(dHours),accessibility:v(dAccess),directions:v(dDirections),sourceUrl:v(dCSource),reviewedOn:dReviewed.value}),guide:()=>pick({sourceUrl:v(gSource)}),update:()=>pick({relatedId:uRel.value,actionLabel:v(uLabel),actionUrl:v(uUrl),showUntil:v(uUntil)})})[kind.value]();
   // Editing (ORI-UNI-006): the same form, filled in; saved with the item's revision so a stale edit is refused.
   const ed=items.find(c=>c.id===editingContent)||null;
   if(ed){const d=ed.details||{};kind.value=ed.kind;kind.disabled=true;vis.value=ed.visibility;title.value=ed.title;text.value=ed.body;dDate.value=d.date||'';dTime.value=d.time||'';if(d.timeZone){if(![...dZone.options].some(o=>o.value===d.timeZone))dZone.append(h('option',{value:d.timeZone},d.timeZone));dZone.value=d.timeZone}cPhone.value=d.phone||'';dCat.value=d.category||'';dBuilding.value=d.building||'';dRoom.value=d.room||'';dAddress.value=d.address||'';dHours.value=d.openingHours||'';dAccess.value=d.accessibility||'';dDirections.value=d.directions||'';dCSource.value=kind.value==='contact'?d.sourceUrl||'':'';dReviewed.value=d.reviewedOn||'';cEmail.value=d.email||'';cWeb.value=d.website||'';gSource.value=d.sourceUrl||'';uRel.value=d.relatedId||'';uLabel.value=d.actionLabel||'';uUrl.value=d.actionUrl||'';uUntil.value=d.showUntil||'';save.textContent='Save changes';showDetails()}
   const dateNote=ed&&ed.kind==='date'&&ed.status==='published'?h('p',{class:'note'},'Students who already added this date keep their own calendar copy: nothing on their phone changes by itself. When they next open your space, Orivia shows them the new date and offers to update their copy.'):null;
   const form=h('form',{onsubmit:act(save,async()=>{if(kind.value==='date'&&!v(dDate)){flash={kind:'err',text:'Add the date for this key date.'};await render();return}
    if(ed){await api(pre+'/content/'+encodeURIComponent(ed.id),'PATCH',{revision:ed.revision,title:title.value,body:text.value,visibility:vis.value,details:details()??null});editingContent=null;flash={kind:'good',text:'Changes saved.'};await render();return}
    await api(pre+'/content','POST',{kind:kind.value,title:title.value,body:text.value,visibility:vis.value,details:details()});flash={kind:'good',text:'Draft saved.'+(admin?'':' An admin can publish it.')};await render()})},dateNote,h('div',{class:'row'},h('div',{class:'grow'},field('Type',kind)),h('div',{class:'grow'},field('Who can see it',vis))),field('Title',title),field('Text',text,'Plain text. Students see it once published.'),detailBox,h('div',{class:'row'},save,ed?h('button',{class:'btn quiet',type:'button',onclick:()=>{editingContent=null;render()}},'Cancel'):null));
   const KIND={guide:'Guide',date:'Key date',contact:'Contact',update:'Service update'};
   // Student preview (area 21): what this form would show a student in the app's university space, from the unsaved
   // values, with what still needs checking. It saves nothing and never blocks publishing.
   const previewBox=h('div',{class:'stack',id:'student-preview','aria-live':'polite'});
   const preview=()=>{const k=kind.value,d=details()||{},status=ed?.status||'draft',labels=[];
    if(k==='date'&&d.date)labels.push('Add to calendar');if(k==='guide'||k==='date')labels.push('Mark as done');if(k==='guide')labels.push('Ask Orivia about this');if(k!=='contact')labels.push('Save');
    if(k==='guide'&&d.sourceUrl)labels.push('Source page ↗');if(k==='contact'){if(d.phone)labels.push(org.demo?'Demo number (not callable): '+d.phone:'Call');if(d.email)labels.push('Email');if(d.website)labels.push('Website ↗');if(d.address&&!org.demo)labels.push('Directions in Google Maps ↗','Apple Maps ↗');if(d.sourceUrl)labels.push('Source page ↗')}
    const place=k==='contact'&&(d.category||d.building||d.address)?[d.category?DIRECTORY[d.category]:null,[d.building,d.room].filter(Boolean).join(', ')||null,d.address||null,'Opening: '+(d.openingHours||'not provided'),'Accessibility: '+(d.accessibility||'not provided'),d.directions?'Directions: '+d.directions:null,d.reviewedOn?'Checked by '+org.name+' on '+d.reviewedOn:'Not dated: add when these details were last checked'].filter(Boolean):[];
    if(k==='update'){const g=d.relatedId&&items.find(c=>c.id===d.relatedId);if(g)labels.push('Open guide: '+g.title);if(d.actionLabel&&d.actionUrl)labels.push(d.actionLabel+' ↗')}
    const checks=[status==='published'?null:'Not published yet: students don’t see it until an admin publishes it.',vis.value==='public'?'Public: anyone with your university’s public address can read it, without signing in.':'Members only: approved students see it.',
     /AI-organised draft — staff review required/.test(text.value)?'Still has the AI draft notice. Rewrite the quotations as plain steps for students and remove the notice before publishing.':null,
     k==='guide'&&!d.sourceUrl?'No source page: students won’t get a Source page button.':null,place.length&&!d.reviewedOn?'No “last checked” date: students won’t know how current this is.':null,place.length&&d.address&&org.demo?'Demo organisation: map links are off, because the address is fictional.':null,!title.value.trim()||!text.value.trim()?'Add a title and text first.':null].filter(Boolean);
    previewBox.replaceChildren(h('h3',null,'Student preview'),h('div',{class:'item',style:'align-items:flex-start;flex-direction:column'},h('span',{class:'small muted'},'From '+org.name),h('strong',null,title.value||'(no title yet)'),k==='date'&&d.date?h('p',{class:'small'},d.date+(d.time?' · '+d.time+' ('+(d.timeZone||'')+')':'')):null,h('p',{class:'small content-body'},text.value),...place.map(x=>h('p',{class:'small'},x)),labels.length?h('div',{class:'row'},labels.map(l=>h('span',{class:'chip c-wait'},l))):null),
     h('ul',{class:'small',style:'margin:0;padding-left:18px'},checks.map(c=>h('li',null,c))),h('p',{class:'small muted'},'Preview only: nothing is saved or sent. Buttons don’t work here.'))};
   const previewButton=h('button',{class:'btn quiet',type:'button',id:'preview-student',onclick:preview},'Preview as a student');
   save.parentElement.append(previewButton);form.append(previewBox);
   body=[items.length?h('div',{class:'list'},items.map(c=>{const pub=h('button',{class:c.status==='draft'?'btn':'btn quiet',type:'button'},c.status==='draft'?'Publish':'Unpublish');pub.onclick=act(pub,async()=>{await api(pre+'/content/'+encodeURIComponent(c.id),'PATCH',{revision:c.revision,status:c.status==='draft'?'published':'draft'});flash={kind:'good',text:c.status==='draft'?'Published.':'Moved back to draft.'};await render()});
     return h('div',{class:'item',id:'content-'+c.id,style:'align-items:flex-start'},h('div',{class:'grow stack'},h('div',null,h('strong',null,c.title),' ',chip(KIND[c.kind]||c.kind,'c-wait'),' ',chip(c.status==='published'?'Published':'Draft',c.status==='published'?'c-ok':'c-demo'),' ',chip(c.visibility==='public'?'Public':'Members only','c-wait')),h('p',{class:'small content-body'},c.body),c.details?h('p',{class:'small muted'},detailSummary(c,items)):null),h('div',{class:'stack'},(admin||c.status==='draft')?h('button',{class:'btn quiet small',type:'button',onclick:async()=>{editingContent=c.id;await render();document.getElementById('c-title')?.focus()}},'Edit'):null,admin?pub:h('span',{class:'small muted'},c.status==='draft'?'An admin publishes this':'')))})):empty('No guides or information yet','Draft a guide, a key date, a contact or a service update. '+(admin?'You can publish it straight after.':'An admin publishes it.')),
    h('h3',{id:'content-form'},ed?'Edit “'+ed.title+'”':'Add something'),form];
  }
  if(tab==='members'){
   if(!admin)body=[h('div',{class:'note'},'Only admins see members’ names and emails, and approve requests.')];
   else{let list=[],more=false;for(let i=0;i<memberPages;i++){const page=await api(pre+'/members?q='+encodeURIComponent(memberSearch)+'&offset='+(i*100));list=list.concat(page.members);more=page.more;if(!page.more)break}
    const search=h('input',{type:'search',value:memberSearch,maxlength:80,placeholder:'Search by name or email','aria-label':'Search members'}),find=h('button',{class:'btn quiet',type:'submit'},'Search');
    const searchForm=h('form',{class:'row',onsubmit:e=>{e.preventDefault();memberSearch=search.value.trim();memberPages=1;render()}},h('div',{class:'grow'},search),find,memberSearch?h('button',{class:'btn quiet',type:'button',onclick:()=>{memberSearch='';memberPages=1;render()}},'Clear'):null);
    const moreButton=more?h('button',{class:'btn quiet',type:'button',onclick:()=>{memberPages++;render()}},'Show more'):null;
    const req=list.filter(x=>x.status==='requested'),act2=list.filter(x=>x.status==='active'),removed=list.filter(x=>x.status==='removed');
    const decide=(x,decision)=>{const b=h('button',{class:decision==='approve'?'btn ok':'btn quiet',type:'button'},decision==='approve'?'Approve':'Decline');b.onclick=act(b,async()=>{await api(pre+'/requests/'+encodeURIComponent(x.userId)+'/decision','POST',{decision});flash={kind:'good',text:(x.name||x.email)+(decision==='approve'?' approved.':' declined.')};await render()});return b};
    const emailLine=(x,rest)=>x.name&&x.name!==x.email?x.email+(rest?' · '+rest:''):rest||null;
     const roleControls=x=>{const select=h('select',{'aria-label':'Role for '+(x.name||x.email)},['student','editor','admin'].map(role=>h('option',{value:role,selected:x.role===role},role==='student'?'Student':role==='editor'?'Editor':'Admin'))),change=h('button',{class:'btn quiet',type:'button'},'Change role'),hint=h('p',{class:'small muted'});
     select.onchange=()=>{change.dataset.confirm='';change.textContent='Change role';hint.textContent=''};
     change.onclick=async()=>{if(select.value===x.role)return;if(change.dataset.confirm!==select.value){change.dataset.confirm=select.value;change.textContent='Confirm role change';hint.textContent=select.value==='admin'?'An admin can see member names/emails, approve joins, publish and manage staff. Personal chats stay private.':select.value==='editor'?'An editor can draft information and create public codes. They cannot approve members or publish.':'A student can read published member information. Staff controls will be removed.';return}
      await act(change,async()=>{await api(pre+'/members/'+encodeURIComponent(x.userId)+'/role','POST',{role:select.value,expectedRole:x.role,confirm:'change organisation role'});await refreshMe();flash={kind:'good',text:'Role updated. Personal Orivia data is unchanged.'};await render()})()};return h('div',{class:'stack'},h('div',{class:'row'},select,change),hint)};
    const reinstate=x=>{const b=h('button',{class:'btn quiet',type:'button'},'Allow new join request');b.onclick=async()=>{if(b.dataset.confirm!=='yes'){b.dataset.confirm='yes';b.textContent='Confirm: allow a new request';return}await act(b,async()=>{await api(pre+'/members/'+encodeURIComponent(x.userId)+'/reinstate','POST',{confirm:'allow new join request'});flash={kind:'good',text:'They can request to join again using a valid invitation. No access was restored automatically.'};await render()})()};return b};
    const remove=x=>{const b=h('button',{class:'btn danger',type:'button'},'Remove');b.onclick=act(b,async()=>{await api(pre+'/members/'+encodeURIComponent(x.userId),'DELETE',{});flash={kind:'good',text:(x.name||x.email)+' removed. Their personal Orivia is unaffected.'};await render()});return b};
    body=[searchForm,memberSearch?h('p',{class:'small muted'},list.length?'Showing members matching “'+memberSearch+'”.':'No members match “'+memberSearch+'”.'):null,h('h3',null,'Join requests'),req.length?h('div',{class:'list'},req.map(x=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,x.name||x.email),emailLine(x)?h('p',{class:'small muted'},emailLine(x)):null),decide(x,'approve'),decide(x,'decline')))):empty('No requests waiting','Students ask to join by opening a student invitation. You approve each one.'),
     h('h3',null,'Members and staff'),act2.length?h('div',{class:'list'},act2.map(x=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,x.name||x.email),h('p',{class:'small muted'},emailLine(x,x.role==='student'?'Student':x.role==='admin'?'Admin':'Editor'))),h('div',{class:'stack'},roleControls(x),x.role==='admin'?null:remove(x))))):h('p',{class:'small muted'},'No members yet.'),
     h('p',{class:'note'},'To hand over: make a trusted member an admin, then change your own role. At least one active admin must remain. Role changes require a sign-in from the last 15 minutes.'),h('a',{href:'/account-test',class:'small'},'Open sign-in / sign-out'),
     h('h3',null,'Removed members'),removed.length?h('div',{class:'list'},removed.map(x=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,x.name||x.email),h('p',{class:'small muted'},emailLine(x,'Removed'))),reinstate(x)))):h('p',{class:'small muted'},'No removed members.'),
     moreButton];}
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
  if(tab==='support')body=[await restored.supportPanel(oid,admin)];
  if(tab==='processes')body=[await restored.processes(oid,admin)];
  if(tab==='guides')body.unshift(await restored.guideDraft(oid));
  if(tab==='counts'){const a=summary.activity||{},KIND={guide:'Guides',date:'Key dates',contact:'Contacts',update:'Updates'};
   body=[h('h3',null,'Counts'),h('div',{class:'kpis'},h('div',{class:'kpi'},h('span',{class:'small muted'},'New student memberships · last 30 days'),h('strong',null,a.joinedLast30Days??0)),h('div',{class:'kpi'},h('span',{class:'small muted'},'Student invitation uses'),h('strong',null,a.invitationUses??0)),h('div',{class:'kpi'},h('span',{class:'small muted'},'Members'),h('strong',null,count('student','active')))),
    h('div',{class:'list'},(a.published||[]).map(p=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,KIND[p.kind]||p.kind)),h('span',null,p.count+' published')))),
    h('div',{class:'row'},h('p',{class:'note grow'},'Guide views and QR opens aren’t tracked. Orivia never reads private conversations to fill this page.'),chip('Views not tracked','c-demo'))]}
  if(tab==='counts')body.push(h('p',{class:'small muted'},summary.activity?.definition||'Membership records, not engagement.'),restored.countChart('New student memberships by UTC day',summary.activity?.dailyMemberships),restored.countChart('Published content',(summary.activity?.published||[]).map(x=>({label:x.kind,count:x.count}))),restored.countChart('Student membership states',summary.counts.filter(x=>x.role==='student').map(x=>({label:x.status,count:x.count}))));
  // Institution settings (ORI-UNI-015): admins change them; editors see them read-only. Nothing here widens access.
  if(tab==='settings'){const d=await api(pre+'/settings'),s=d.settings,ro=!d.canEdit;
   const check=(label,on)=>{const i=h('input',{type:'checkbox'});i.checked=!!on;i.disabled=ro;return [i,h('label',{class:'check'},i,' ',label)]};
   const [upd,updL]=check('Updates can be sent as device alerts',s.alerts.updates),[dat,datL]=check('Key dates can be sent as device alerts',s.alerts.dates),[exp,expL]=check('Editors may download aggregate counts (CSV)',s.exports.editorsMayExportCounts);
   const c=s.studentContact||{},inp=(v,ph,type='text')=>{const i=h('input',{type,maxLength:200,value:v||'',placeholder:ph});i.disabled=ro;return i};
   const cLabel=inp(c.label,'For example: Student Hub'),cEmail=inp(c.email,'hub@university.example','email'),cPhone=inp(c.phone,'+971 6 555 1234','tel'),cWeb=inp(c.website,'https://');
   const staffSel=v=>{const sel=h('select',null,h('option',{value:''},'Not set'),...d.staff.map(x=>h('option',{value:x.id},(x.name||'Staff member')+' · '+(x.role==='admin'?'Admin':'Editor'))));sel.value=v||'';sel.disabled=ro;return sel};
   const oG=staffSel(s.owners.guides),oM=staffSel(s.owners.members),oI=staffSel(s.owners.invitations);
   const ret=h('select',null,...[30,90,365].map(n=>h('option',{value:String(n)},n+' days')));ret.value=String(s.retention.formerMembersDays);ret.disabled=ro;
   const save=h('button',{type:'submit',class:'btn'},'Save settings');
   body=[h('p',{class:'note'},'These settings shape your organisation’s own space. They can’t switch on application records, change Orivia’s limits, or change any student’s own choices: each student still decides whether to get device alerts.'+(ro?' Only admins can change them.':' A sign-in within 15 minutes is required to save.')),
    h('form',{onsubmit:act(save,async()=>{if(ro)return;const any=cLabel.value.trim()||cEmail.value.trim()||cPhone.value.trim()||cWeb.value.trim();
      await api(pre+'/settings','PATCH',{revision:d.revision,settings:{alerts:{updates:upd.checked,dates:dat.checked},exports:{editorsMayExportCounts:exp.checked},owners:{guides:oG.value||null,members:oM.value||null,invitations:oI.value||null},retention:{formerMembersDays:Number(ret.value)},studentContact:any?{label:cLabel.value,email:cEmail.value,phone:cPhone.value,website:cWeb.value}:null}});
      flash={kind:'good',text:'Settings saved.'};await render()})},
     h('fieldset',null,h('legend',null,'Device alerts your organisation may send'),updL,datL),
     h('fieldset',null,h('legend',null,'Who students should contact'),field('Name',cLabel),field('Email',cEmail),field('Phone',cPhone),field('Website',cWeb,'Shown in your students’ space. Leave all empty to show nothing.')),
     h('fieldset',null,h('legend',null,'Who looks after each area'),field('Guides and information',oG),field('Members',oM),field('Invitations and QR codes',oI)),
     h('fieldset',null,h('legend',null,'Downloads and records'),expL,field('Keep former members in the Members list for',ret,'Only how long they’re listed for staff. A student’s own data goes with their account.'),h('p',{class:'small'},h('a',{href:pre+'/export/counts.csv'},'Download counts (CSV)'),' · numbers only, no names or emails.')),
     ro?null:save)]}
  // Activity history (admins): what changed, when, and by which staff member. Values aren't copied here.
  if(tab==='activity'){const d=await api(pre+'/audit'),LABEL={'settings.updated':'Changed settings','export.counts':'Downloaded counts','membership.left':'A member left','membership.removed':'Removed a member','membership.active':'Membership activated','membership.requested':'Asked to join','membership.declined':'Declined a request','membership.rejoin_allowed':'Allowed a former member to ask again','content.drafted':'Drafted content','content.updated':'Updated content','content.publish':'Published content','content.draft':'Moved content back to draft','guide.drafted':'Drafted a guide for review','invitation.created':'Created an invitation','invitation.revoked':'Withdrew an invitation','bootstrap_invitation.revoked':'Withdrew an admin invitation','public_code.created':'Created a public QR code','public_code.revoked':'Withdrew a public QR code','arrival.updated':'Changed welcome settings','organisation.created':'Organisation created','export.organisations':'Downloaded the organisation list','support.open':'Replied to a support request','support.in_progress':'Replied to a support request (in progress)','support.resolved':'Resolved a support request','support.assigned':'Assigned a support request','support.linked':'Linked a support request to a process step','support.unlinked':'Removed a support request’s process step'},
    actionLabel=a=>LABEL[a]||(a.startsWith('membership.role_changed_to_')?'Changed a role to '+a.slice(27):a.replace(/[._]/g,' '));
   body=[h('p',{class:'note'},'The last 100 changes in this organisation. Student actions are shown without names.'),d.entries.length?h('div',{class:'list'},d.entries.map(e=>h('div',{class:'item'},h('div',{class:'grow'},h('strong',null,actionLabel(e.action)),e.areas?h('p',{class:'small muted'},'Areas: '+e.areas.join(', ')):null,h('p',{class:'small muted'},e.actor+' · '+fmtDate(e.at)))))):h('p',{class:'small muted'},'No activity yet.')]}
  if(tab==='records'){let msg='Application records need a separate permission that nobody has yet.';try{await api(pre+'/records')}catch(err){msg=err.message}body=[h('div',{class:'denied'},h('strong',null,'Locked'),h('p',{class:'small'},msg+' Being an admin isn’t enough, and no university system is connected.'))]}
  return [panel(h('div',{class:'row'},h('h2',{class:'grow'},org.name),org.demo?chip('Demo organisation','c-demo'):null,chip(admin?'Admin':'Editor','c-ok')),tabBar,...body)];
 }

 async function studentView(oid){
  const d=await api('/api/me/orgs/'+encodeURIComponent(oid)),org=d.organisation;
  const by=k=>d.content.filter(c=>c.kind===k);
  const section=(title,items,emptyText)=>panel(h('h3',null,title),items.length?h('div',{class:'list'},items.map(c=>h('div',{class:'item',style:'align-items:flex-start'},h('div',{class:'grow stack'},h('strong',null,c.title),h('p',{class:'small content-body'},c.body),...directoryLines(c,org))))):h('p',{class:'small muted'},emptyText));
  const leave=h('button',{class:'btn danger',type:'button'},'Leave '+org.name);
  leave.onclick=()=>{const yes=h('button',{class:'btn danger',type:'button'},'Leave '+org.name);yes.onclick=act(yes,async()=>{await api('/api/me/orgs/'+encodeURIComponent(oid),'DELETE',{});await refreshMe();space='home';flash={kind:'good',text:'You left '+org.name+'. Your chats and personal plans are unchanged.'};await render()});
   leave.replaceWith(h('div',{class:'stack'},h('p',null,'If you leave:'),h('ul',{class:'small',style:'margin:0;padding-left:18px'},h('li',null,org.name+'’s guides, dates, contacts and updates disappear from your Orivia, and its staff no longer see you as a member.'),h('li',null,'Your chats and anything you saved to your own calendar stay yours.'),h('li',null,'Anything you downloaded or screenshotted stays on your device but won’t update, so it may go out of date.')),h('div',{class:'row'},yes,h('button',{class:'btn quiet',type:'button',onclick:()=>render()},'Stay'))))};
  return [panel(h('div',{class:'row'},h('h2',{class:'grow'},'Your '+org.name+' space'),org.demo?chip('Demo organisation','c-demo'):null),h('p',{class:'small muted'},'Information from '+org.name+'. Your chats, calendar and About me aren’t shared with them.')),
   await restored.supportPanel(oid),await restored.processes(oid,false,true),section('Service updates',by('update'),'No updates right now.'),section('Guides',by('guide'),org.name+' hasn’t published guides yet.'),section('Key dates',by('date'),'No dates yet.'),section('Contacts',by('contact'),'No contacts yet.'),await restored.placements(oid,org),
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
