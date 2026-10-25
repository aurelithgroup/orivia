import {mountRestoredUI} from './restored-ui.mjs';
import {handleOperations} from './operations.mjs';
import QRCode from 'qrcode/lib/core/qrcode.js';
import SVG from 'qrcode/lib/renderer/svg-tag.js';
import {platformPage,mountPlatform} from './platform-ui.mjs';
import {appHome} from './app-home.mjs';
import {ownerOverview,ownerOrganisations,organisationsCsv} from './owner-overview.mjs';
import {normaliseDetails,parseDetails,DetailsError} from './content-details.mjs';
import {SETTINGS_SQL,DEFAULT_SETTINGS,normaliseSettings,parseSettings,changedAreas,countsCsv,SettingsError} from './org-settings.mjs';
/* Plain page for /manage when the visitor isn't the owner account. No organisation or account details. */
const manageRefusal=(signedOut,home)=>'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orivia management</title><style>body{font-family:system-ui,sans-serif;max-width:520px;margin:15vh auto;padding:0 20px;line-height:1.5;color:#1C2733;background:#F7F8FA}a{color:#7A5300}@media (prefers-color-scheme:dark){body{color:#E8EDF3;background:#0E1620}a{color:#F3C04A}}</style></head><body><h1>Orivia management</h1><p>'+(signedOut?'Sign in to Orivia with the management account, then open this page again.':'This page is only for Orivia’s management account.')+'</p><p><a href="'+home+'">'+(signedOut?'Go to sign-in':'Back to Orivia')+'</a></p></body></html>';
/* Personal identities come from Better Auth; organisation and platform roles come only from ACCOUNTS_DB.
 * No organisation endpoint reads account_vault, personal chats, calendar, profile or documents. */
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
class Fault extends Error{constructor(status,code){super(code);this.status=status}}
const deny=(status,code)=>{throw new Fault(status,code)};
const id=()=>crypto.randomUUID();
/* Student progress (step 9): a student can mark a published guide or key date as done, privately. Staff totals are PAUSED
   (Ina 1374ec9: exact totals let an admin infer one student's mark around a membership change); staff get item titles and
   no counts until a reporting approach is agreed. Rows go with the account (FK). PROGRESS_MIN is kept for that later design. */
export const PROGRESS_MIN=5;
const PROGRESS_SQL=['CREATE TABLE IF NOT EXISTS organisation_progress(org_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, content_id TEXT NOT NULL, done_at INTEGER NOT NULL, PRIMARY KEY(org_id,user_id,content_id))',
 'CREATE TABLE IF NOT EXISTS organisation_progress_private(org_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, PRIMARY KEY(org_id,user_id))'];
const progressReady=new WeakSet(),settingsReady=new WeakSet();
const roles={admin:new Set(['org.view','content.draft','content.publish','members.manage','staff.manage','qr.public','qr.invite','qr.withdraw']),editor:new Set(['org.view','content.draft','qr.public']),student:new Set(['space.view'])};
export const organisationRoute=p=>['/platform','/platform.js','/manage'].includes(p)||/^\/api\/(?:admin(?:\/|$)|orgs(?:\/|$)|invitations(?:\/|$)|partner(?:\/|$)|public\/orgs(?:\/|$)|public\/codes(?:\/|$)|me\/(?:memberships|orgs|notices|data-requests|support-consents)(?:\/|$))/.test(p);
const keys=(b,allowed)=>{if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!allowed.includes(k)))deny(400,'invalid_fields')};
const text=(v,min,max)=>{if(typeof v!=='string'||v.trim().length<min||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))deny(400,'invalid_text');return v.trim()};
const email=v=>{const s=text(v,3,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))deny(400,'invalid_email');return s};
async function hash(token){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('')}
function token(){const bytes=crypto.getRandomValues(new Uint8Array(32));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
export async function handleOrganisationRequest(req,env,{auth,readJson,now=Date.now}={}){
 const url=new URL(req.url),path=url.pathname;if(!organisationRoute(path))return null;
 if(env.ORGANISATIONS_ENABLED!=='1')return json({error:'organisations_unavailable'},503);
 const db=env.ACCOUNTS_DB,clock=()=>now();
 const q=(sql,...args)=>db.prepare(sql).bind(...args);
 const all=async(sql,...args)=>(await q(sql,...args).all()).results;
 const audit=(actor,org,action,target)=>q('INSERT INTO organisation_audit(id,org_id,actor_id,action,target_id,created_at) VALUES (?,?,?,?,?,?)',id(),org,actor,action,target,clock());
 const write=async(statement,actor,org,action,target)=>{const result=await db.batch([statement,q('INSERT INTO organisation_audit(id,org_id,actor_id,action,target_id,created_at) SELECT ?,?,?,?,?,? WHERE changes()>0',id(),org,actor,action,target,clock())]);return result[0].results?.[0]||null};
 const qr=async value=>SVG.render(QRCode.create(value,{errorCorrectionLevel:'M'}),{margin:4,width:256});
 const arrival=async oid=>{const row=await q('SELECT data,revision FROM organisation_arrivals WHERE org_id=?',oid).first();return row?{...JSON.parse(row.data),revision:row.revision}:null};
 const publicOrg=o=>({id:o.id,slug:o.slug,name:o.name,city:o.city,demo:!!o.demo});
 const content=c=>({id:c.id,kind:c.kind,title:c.title,body:c.body,details:parseDetails(c.details),visibility:c.visibility,status:c.status,revision:c.revision,updatedAt:c.updated_at});
 /* University overview action queue (Ina's priority 3): from this organisation's own records only, each item names the
    workflow that resolves it. Dates compare by calendar day (UTC today), so a date today counts as upcoming. */
 const staffTasks=async oid=>{
  const today=new Date(clock()).toISOString().slice(0,10),soon=new Date(clock()+30*86400000).toISOString().slice(0,10);
  const pendingJoins=(await q("SELECT COUNT(*) AS n FROM organisation_memberships WHERE org_id=? AND role='student' AND status='requested'",oid).first()).n;
  const rows=await all("SELECT id,kind,title,status,details FROM organisation_content WHERE org_id=? ORDER BY updated_at DESC LIMIT 500",oid);
  const brief=c=>({id:c.id,kind:c.kind,title:c.title});
  const drafts=rows.filter(c=>c.status==='draft');
  const dated=rows.filter(c=>c.kind==='date'&&c.status==='published').map(c=>({...brief(c),date:parseDetails(c.details)?.date||null,time:parseDetails(c.details)?.time||null}));
  const contacts=rows.filter(c=>c.kind==='contact'&&c.status==='published');
  const missing=contacts.filter(c=>{const d=parseDetails(c.details)||{};return !d.phone&&!d.email&&!d.website});
  return {pendingJoins,
   drafts:{total:drafts.length,items:drafts.slice(0,10).map(brief)},
   upcomingDates:dated.filter(d=>d.date&&d.date>=today&&d.date<=soon).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10),
   pastDates:dated.filter(d=>d.date&&d.date<today).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10),
   datesWithoutDate:dated.filter(d=>!d.date).slice(0,10),
   contactsMissingDetails:missing.slice(0,10).map(brief),
   endedUpdates:rows.filter(c=>c.kind==='update'&&c.status==='published'&&(parseDetails(c.details)?.showUntil||'9999')<today).slice(0,10).map(c=>({...brief(c),showUntil:parseDetails(c.details).showUntil})),
   publishedContacts:contacts.length,today};
 };
 try{
  if(!db?.prepare||!db?.batch)deny(503,'organisation_storage_unavailable');
  if(req.method==='GET'&&path==='/manage'){
   // Founder management: only a verified owner account gets the page; everyone else gets a plain refusal.
   const s=await auth.api.getSession({headers:req.headers}),uid=s?.user?.emailVerified?s.user.id:null;
   const owner=uid&&await q("SELECT 1 AS yes FROM platform_roles WHERE user_id=? AND role='owner'",uid).first();
   if(!owner)return new Response(manageRefusal(!s?.user?.id,appHome(env)),{status:s?.user?.id?403:401,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'",'Referrer-Policy':'no-referrer'}});
  }
  if(req.method==='GET'&&(path==='/platform'||path==='/manage'))return new Response(platformPage.replace('<html','<html data-app-home="'+appHome(env)+'"'),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",'Referrer-Policy':'no-referrer'}});
  if(req.method==='GET'&&path==='/platform.js')return new Response('(function(){const __name=f=>f;window.OriviaRestoredUI=('+mountRestoredUI.toString()+');('+mountPlatform.toString()+')()})();',{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

  // No request supplies its own actor, organisation role or platform role.
  if(req.method==='GET'&&path.startsWith('/api/public/')){
   let o,rows;
   const codeMatch=path.match(/^\/api\/public\/codes\/([a-zA-Z0-9-]{1,80})$/);
   if(codeMatch){const c=await q('SELECT * FROM organisation_public_codes WHERE id=? AND revoked=0',codeMatch[1]).first();if(!c)deny(404,'not_found');o=await q("SELECT * FROM organisations WHERE id=? AND status='active'",c.org_id).first();if(!o)deny(404,'not_found');rows=c.content_id?await all("SELECT * FROM organisation_content WHERE id=? AND org_id=? AND visibility='public' AND status='published'",c.content_id,o.id):await all("SELECT * FROM organisation_content WHERE org_id=? AND visibility='public' AND status='published' ORDER BY updated_at DESC LIMIT 100",o.id);if(c.content_id&&!rows.length)deny(404,'not_found');return json({organisation:publicOrg(o),content:rows.map(content),grantsMembership:false})}
   const match=path.match(/^\/api\/public\/orgs\/([a-z0-9-]{3,64})$/);if(!match)deny(404,'not_found');o=await q("SELECT * FROM organisations WHERE slug=? AND status='active'",match[1]).first();if(!o)deny(404,'not_found');rows=await all("SELECT * FROM organisation_content WHERE org_id=? AND visibility='public' AND status='published' ORDER BY updated_at DESC LIMIT 100",o.id);return json({organisation:publicOrg(o),arrival:await arrival(o.id),content:rows.map(content),grantsMembership:false});
  }
  const session=await auth.api.getSession({headers:req.headers});if(!session?.user?.id)deny(401,'sign_in_required');const actor=session.user.id;
  if(!session.user.emailVerified)deny(403,'verified_email_required');
  if(req.method!=='GET'||req.headers.has('X-Orivia-Account')){if(req.headers.get('X-Orivia-Account')!==actor)deny(409,'account_changed')}
  const platform=async role=>!!await q('SELECT 1 AS yes FROM platform_roles WHERE user_id=? AND role=?',actor,role).first();
  const requireOwner=async()=>{if(!await platform('owner'))deny(403,'owner_required')};
   const ensureProgress=async()=>{if(progressReady.has(db))return;for(const s of PROGRESS_SQL)await q(s).run();progressReady.add(db)};
  const ensureSettings=async()=>{if(settingsReady.has(db))return;for(const s of SETTINGS_SQL)await q(s).run();settingsReady.add(db)};
  const settingsOf=async oid=>{await ensureSettings();const row=await q('SELECT data,revision FROM organisation_settings WHERE org_id=?',oid).first();return {settings:row?parseSettings(row.data):JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),revision:row?row.revision:0}};
  // Structured details: validated per kind; a related guide must be a guide of the same organisation (never itself).
  const detailsFor=(kind,input,oid,self)=>normaliseDetails(kind,input,{relatedIdOk:async rid=>rid!==self&&!!await q("SELECT 1 AS yes FROM organisation_content WHERE id=? AND org_id=? AND kind='guide'",rid,oid).first()});
  const org=async oid=>{const o=await q("SELECT * FROM organisations WHERE id=? AND status='active'",oid).first();if(!o)deny(404,'not_found');return o};
  const member=async(oid,permission)=>{await org(oid);const m=await q("SELECT * FROM organisation_memberships WHERE org_id=? AND user_id=? AND status='active'",oid,actor).first();if(!m||!roles[m.role]?.has(permission))deny(403,'permission_denied');return m};
  const fresh=()=>{const created=new Date(session.session?.createdAt).getTime();if(!Number.isFinite(created)||clock()-created>900000||created>clock()+60000)deny(403,'recent_sign_in_required')};
  const body=async (allowed,limit=12000)=>{const b=await readJson(req,limit);keys(b,allowed);return b};
  const makeInvite=async(oid,role,b)=>{
   const recipient=b.recipientEmail?email(b.recipientEmail):null;if(role!=='student'&&!recipient)deny(400,'staff_email_required');
   const life=b.expiresInSeconds??604800;if(!Number.isInteger(life)||life<60||life>604800)deny(400,'invalid_expiry');
   const max=role==='student'?(b.maxUses??50):1;if(!Number.isInteger(max)||max<1||max>500)deny(400,'invalid_capacity');
   const raw=token(),inv=id(),at=clock(),label=text(b.label||'Organisation invitation',1,120);
   const guard=role==='admin'?" WHERE NOT EXISTS(SELECT 1 FROM organisation_memberships WHERE org_id=? AND role='admin' AND status='active') AND NOT EXISTS(SELECT 1 FROM organisation_invitations WHERE org_id=? AND role='admin' AND revoked=0 AND expires_at>? AND uses<max_uses)":'';
   const args=[inv,oid,await hash(raw),role,recipient,label,at+life*1000,max,actor,at,...(role==='admin'?[oid,oid,at]:[])];
   const made=await write(q('INSERT INTO organisation_invitations(id,org_id,token_hash,role,recipient_email,label,expires_at,max_uses,created_by,created_at) SELECT ?,?,?,?,?,?,?,?,?,?'+guard+' RETURNING id',...args),actor,oid,'invitation.created',inv);if(!made)deny(409,'admin_already_assigned');
   // The raw token is returned once. List endpoints and audit logs never reveal it.
   const slug=encodeURIComponent((await org(oid)).slug);
   const link=role==='student'?url.origin+(appHome(env)==='/app'?'/join/'+slug:'/?organisation='+slug)+'#join='+raw:url.origin+'/platform#join='+raw;
   return json({invitation:{id:inv,role,label,expiresAt:at+life*1000,maxUses:max},joinUrl:link,token:raw,qrSvg:await qr(link)},201);
  };
  const extra=await handleOperations(req,env,{path,url,db,q,all,json,deny,actor,session,clock,id,hash,token,requireOwner,fresh,body,member,org});if(extra)return extra;
  if(path==='/api/me/memberships'&&req.method==='GET')return json({platformRoles:(await all('SELECT role FROM platform_roles WHERE user_id=?',actor)).map(r=>r.role),memberships:(await all("SELECT m.org_id,m.role,m.status,o.name,o.slug,o.demo FROM organisation_memberships m JOIN organisations o ON o.id=m.org_id WHERE m.user_id=? AND m.status IN ('active','requested') AND o.status='active'",actor)).map(m=>({organisationId:m.org_id,name:m.name,slug:m.slug,demo:!!m.demo,role:m.role,status:m.status}))});
  // Founder overview: defined counts and authoritative budgets only (owner-overview.mjs). Owners only.
  // Directory export (ORI-METRIC-006): owner only, at most 100 rows, formula-safe, audited without the search text.
  if(path==='/api/admin/export/organisations.csv'){await requireOwner();if(req.method!=='GET')deny(405,'method_not_allowed');
   const qtext=url.searchParams.get('q')||'',rows=await ownerOrganisations(db,{q:qtext,now:clock});
   try{await q('INSERT INTO platform_audit(id,actor_id,action,detail,created_at) VALUES (?,?,?,?,?)',id(),actor,'export.organisations',JSON.stringify({rows:rows.length,filtered:qtext.length>0}),clock()).run()}catch(_){deny(503,'audit_unavailable')}
   return new Response('﻿'+organisationsCsv(rows),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="orivia-organisations-'+new Date(clock()).toISOString().slice(0,10)+'.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
  if(path==='/api/admin/overview'){await requireOwner();if(req.method!=='GET')deny(405,'method_not_allowed');return json(await ownerOverview(env,{now:clock}))}
  if(path==='/api/admin/orgs'){
   // Owner directory: optional ?q= search (name, web name, city) with operational totals; no member names or emails.
   await requireOwner();if(req.method==='GET')return json({organisations:await ownerOrganisations(db,{q:url.searchParams.get('q')||'',now:clock})});
   if(req.method==='POST'){const b=await body(['name','slug','city','demo']);const name=text(b.name,2,120),slug=text(b.slug,3,64);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||typeof b.demo!=='boolean')deny(400,'invalid_organisation');if(await q('SELECT id FROM organisations WHERE slug=?',slug).first())deny(409,'slug_exists');const oid=id();await db.batch([q('INSERT INTO organisations(id,slug,name,city,demo,created_by,created_at) VALUES (?,?,?,?,?,?,?)',oid,slug,name,text(b.city,1,100),Number(b.demo),actor,clock()),audit(actor,oid,'organisation.created',oid)]);return json({organisation:publicOrg(await org(oid))},201)}
  }
  let m=path.match(/^\/api\/admin\/orgs\/([^/]+)\/admin-invite$/);
  if(m&&req.method==='POST'){await requireOwner();await org(m[1]);const existing=await q("SELECT 1 AS yes FROM organisation_memberships WHERE org_id=? AND role='admin' AND status='active'",m[1]).first();const pending=await q("SELECT 1 AS yes FROM organisation_invitations WHERE org_id=? AND role='admin' AND revoked=0 AND expires_at>? AND uses<max_uses",m[1],clock()).first();if(existing||pending)deny(409,'admin_already_assigned');return makeInvite(m[1],'admin',await body(['recipientEmail','label','expiresInSeconds']))}
  m=path.match(/^\/api\/admin\/orgs\/([^/]+)\/admin-invites\/([^/]+)\/revoke$/);
  if(m&&req.method==='POST'){await requireOwner();await org(m[1]);await body([]);const inv=await q("SELECT id FROM organisation_invitations WHERE id=? AND org_id=? AND role='admin'",m[2],m[1]).first();if(!inv)deny(404,'not_found');await db.batch([q('UPDATE organisation_invitations SET revoked=1 WHERE id=? AND org_id=?',m[2],m[1]),audit(actor,m[1],'bootstrap_invitation.revoked',m[2])]);return json({revoked:true,existingMembershipChanged:false})}
  if(['/api/invitations/inspect','/api/invitations/join'].includes(path)&&req.method==='POST'){const input=await body(['token']);if(typeof input.token!=='string'||!/^[a-f0-9]{64}$/.test(input.token))deny(400,'invalid_invitation');const joining=path.endsWith('/join');const inv=await q('SELECT * FROM organisation_invitations WHERE token_hash=?',await hash(input.token)).first();if(!inv)deny(404,'invitation_not_found');const o=await org(inv.org_id);if(inv.revoked||inv.expires_at<=clock())deny(410,'invitation_unavailable');if(inv.recipient_email&&inv.recipient_email!==session.user.email.toLowerCase())deny(403,'invitation_for_another_email');
   if(!joining)return json({organisation:publicOrg(o),role:inv.role,label:inv.label,expiresAt:inv.expires_at,approvalRequired:inv.role==='student',available:inv.uses<inv.max_uses});
   if(joining){const previous=await q('SELECT * FROM organisation_memberships WHERE org_id=? AND user_id=?',o.id,actor).first();if(previous&&['active','requested'].includes(previous.status)){if(previous.invitation_id!==inv.id||previous.role!==inv.role)deny(409,'membership_exists');return json({membership:{organisationId:o.id,role:previous.role,status:previous.status}})}if(previous?.status==='removed')deny(403,'membership_removed');
    const nonce=id(),at=clock(),status=inv.role==='student'?'requested':'active';
    // All three writes are one D1 transaction. The nonce ensures a replay cannot consume another use.
    const eligibility="i.id=? AND i.revoked=0 AND i.expires_at>? AND i.uses<i.max_uses AND (i.recipient_email IS NULL OR i.recipient_email=?) AND EXISTS(SELECT 1 FROM organisations o WHERE o.id=i.org_id AND o.status='active')";
    await db.batch([
     q(`INSERT INTO organisation_memberships(org_id,user_id,role,status,invitation_id,request_id,created_at,updated_at) SELECT i.org_id,?,i.role,?,i.id,?,?,? FROM organisation_invitations i WHERE ${eligibility} ON CONFLICT(org_id,user_id) DO UPDATE SET role=excluded.role,status=excluded.status,invitation_id=excluded.invitation_id,request_id=excluded.request_id,created_at=excluded.created_at,updated_at=excluded.updated_at WHERE organisation_memberships.status IN ('left','declined')`,actor,status,nonce,at,at,inv.id,at,session.user.email.toLowerCase()),
     q('UPDATE organisation_invitations SET uses=uses+1 WHERE id=? AND EXISTS(SELECT 1 FROM organisation_memberships WHERE org_id=? AND user_id=? AND request_id=?)',inv.id,o.id,actor,nonce),
     q('INSERT INTO organisation_audit(id,org_id,actor_id,action,target_id,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM organisation_memberships WHERE org_id=? AND user_id=? AND request_id=?)',id(),o.id,actor,'membership.'+status,actor,at,o.id,actor,nonce)
    ]);const saved=await q('SELECT * FROM organisation_memberships WHERE org_id=? AND user_id=? AND request_id=?',o.id,actor,nonce).first();if(!saved)deny(409,'invitation_no_longer_available');return json({membership:{organisationId:o.id,role:saved.role,status:saved.status}},201);
   }
  }
  m=path.match(/^\/api\/orgs\/([^/]+)(?:\/(.*))?$/);
  if(m){const oid=m[1],tail=m[2]||'';
   if(tail==='arrival'){
    await member(oid,'content.publish');
    if(req.method==='GET')return json({arrival:await arrival(oid)});
    if(req.method==='PATCH'){fresh();const b=await body(['country','region','town','reason','revision']);if(!['uae','uk'].includes(b.country)||!['study','work','join or bring my family','something else'].includes(b.reason)||!Number.isInteger(b.revision)||b.revision<0)deny(400,'invalid_arrival');
     const regions=b.country==='uae'?['Abu Dhabi','Ajman','Dubai','Fujairah','Ras Al Khaimah','Sharjah','Umm Al Quwain']:['England','Scotland','Wales','Northern Ireland'];if(!regions.includes(b.region))deny(400,'invalid_arrival_region');
     const data=JSON.stringify({country:b.country,region:b.region,town:text(b.town,1,100),reason:b.reason});
     const statement=b.revision===0?q('INSERT INTO organisation_arrivals(org_id,data,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(org_id) DO NOTHING RETURNING revision',oid,data,clock()):q('UPDATE organisation_arrivals SET data=?,revision=revision+1,updated_at=? WHERE org_id=? AND revision=? RETURNING revision',data,clock(),oid,b.revision);
     const changed=await write(statement,actor,oid,'arrival.updated',oid);if(!changed)deny(409,'arrival_conflict');return json({arrival:await arrival(oid)});
    }
   }
   if(tail==='summary'&&req.method==='GET'){await member(oid,'org.view');const counts=await all('SELECT role,status,COUNT(*) AS count FROM organisation_memberships WHERE org_id=? GROUP BY role,status',oid);
    // Totals only: joins, invitation uses and published items. Nothing from anyone's personal Orivia.
    const since=clock()-30*86400000;
    const activity={definition:'Student membership records created in the last 30 days (UTC), active or requested. These are not unique engaged users.',dailyMemberships:await all("SELECT strftime('%Y-%m-%d',created_at/1000,'unixepoch') AS label,COUNT(*) AS count FROM organisation_memberships WHERE org_id=? AND role='student' AND status IN ('active','requested') AND created_at>=? GROUP BY label ORDER BY label",oid,since),joinedLast30Days:(await q("SELECT COUNT(*) AS n FROM organisation_memberships WHERE org_id=? AND role='student' AND status IN ('active','requested') AND created_at>?",oid,since).first()).n,
     invitationUses:(await q("SELECT COALESCE(SUM(uses),0) AS n FROM organisation_invitations WHERE org_id=? AND role='student'",oid).first()).n,
     published:await all("SELECT kind,COUNT(*) AS count FROM organisation_content WHERE org_id=? AND status='published' GROUP BY kind",oid)};
    return json({organisation:publicOrg(await org(oid)),counts,activity,tasks:await staffTasks(oid),analytics:{available:false,reason:'views_not_tracked'},applicationRecordsAvailable:false})}
   // Paused (Ina 1374ec9): exact totals let an admin infer one student's mark by comparing before and after a membership
   // change. Until a reporting approach is agreed, staff get the item titles only and never any count.
   if(tail==='progress'&&req.method==='GET'){await member(oid,'org.view');
    const items=await all("SELECT c.id,c.title,c.kind FROM organisation_content c WHERE c.org_id=? AND c.status='published' AND c.kind IN ('guide','date') ORDER BY c.updated_at DESC LIMIT 100",oid);
    return json({progress:{shown:false,reason:'reporting_paused',items:items.map(i=>({id:i.id,title:i.title,kind:i.kind}))}})}
   if(tail==='invitations'){await member(oid,'qr.invite');if(req.method==='POST'){const b=await body(['role','recipientEmail','label','expiresInSeconds','maxUses']);if(!['editor','student'].includes(b.role))deny(400,'invalid_invitation_role');return makeInvite(oid,b.role,b)}if(req.method==='GET')return json({invitations:await all('SELECT id,role,label,recipient_email AS recipientEmail,expires_at AS expiresAt,revoked,max_uses AS maxUses,uses FROM organisation_invitations WHERE org_id=? ORDER BY created_at DESC LIMIT 100',oid)})}
   const revoke=tail.match(/^invitations\/([^/]+)\/revoke$/);if(revoke&&req.method==='POST'){await member(oid,'qr.invite');await body([]);if(!await q('SELECT id FROM organisation_invitations WHERE id=? AND org_id=?',revoke[1],oid).first())deny(404,'not_found');await db.batch([q('UPDATE organisation_invitations SET revoked=1 WHERE id=? AND org_id=?',revoke[1],oid),audit(actor,oid,'invitation.revoked',revoke[1])]);return json({revoked:true})}
   if(tail==='members'&&req.method==='GET'){await member(oid,'members.manage');
    const term=String(url.searchParams.get('q')||'').trim().toLowerCase().slice(0,80),like='%'+term.replace(/[\\%_]/g,c=>'\\'+c)+'%',offset=Math.max(0,Math.min(100000,Math.floor(Number(url.searchParams.get('offset'))||0)));
    const rows=await all("SELECT m.user_id AS userId,u.name,u.email,m.role,m.status FROM organisation_memberships m JOIN user u ON u.id=m.user_id WHERE m.org_id=? AND m.status IN ('active','requested','removed') AND (m.status<>'removed' OR m.updated_at>=?) AND (?='' OR lower(u.name) LIKE ? ESCAPE '\\' OR lower(u.email) LIKE ? ESCAPE '\\') ORDER BY CASE m.status WHEN 'requested' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, m.created_at LIMIT 101 OFFSET ?",oid,clock()-(await settingsOf(oid)).settings.retention.formerMembersDays*86400000,term,like,like,offset);
    return json({members:rows.slice(0,100),more:rows.length>100,nextOffset:offset+100})}
   const decision=tail.match(/^requests\/([^/]+)\/decision$/);if(decision&&req.method==='POST'){await member(oid,'members.manage');const b=await body(['decision']);if(!['approve','decline'].includes(b.decision))deny(400,'invalid_decision');const status=b.decision==='approve'?'active':'declined',at=clock();const changed=await write(q("UPDATE organisation_memberships SET status=?,updated_at=? WHERE org_id=? AND user_id=? AND role='student' AND status='requested' AND (?='declined' OR EXISTS(SELECT 1 FROM organisation_invitations i WHERE i.id=invitation_id AND i.org_id=? AND i.revoked=0 AND i.expires_at>?)) RETURNING user_id",status,at,oid,decision[1],status,oid,at),actor,oid,'membership.'+status,decision[1]);if(!changed)deny(409,'request_no_longer_approvable');return json({status})}
   const roleChange=tail.match(/^members\/([^/]+)\/role$/);
   if(roleChange&&req.method==='POST'){await member(oid,'staff.manage');fresh();const b=await body(['role','expectedRole','confirm']);if(!['admin','editor','student'].includes(b.role)||!['admin','editor','student'].includes(b.expectedRole)||b.confirm!=='change organisation role')deny(400,'role_confirmation_required');
    const row=await write(q("UPDATE organisation_memberships SET role=?,updated_at=? WHERE org_id=? AND user_id=? AND role=? AND role<>? AND status='active' AND EXISTS(SELECT 1 FROM user u WHERE u.id=user_id AND u.emailVerified=1) AND EXISTS(SELECT 1 FROM organisation_memberships a WHERE a.org_id=? AND a.user_id=? AND a.role='admin' AND a.status='active') AND (role<>'admin' OR ?='admin' OR EXISTS(SELECT 1 FROM organisation_memberships other WHERE other.org_id=? AND other.user_id<>? AND other.role='admin' AND other.status='active')) RETURNING user_id,role",b.role,clock(),oid,roleChange[1],b.expectedRole,b.role,oid,actor,b.role,oid,roleChange[1]),actor,oid,'membership.role_changed_to_'+b.role,roleChange[1]);if(!row)deny(409,'role_change_conflict');return json({role:row.role,personalDataChanged:false});
   }
   const reinstate=tail.match(/^members\/([^/]+)\/reinstate$/);
   if(reinstate&&req.method==='POST'){await member(oid,'members.manage');fresh();const b=await body(['confirm']);if(b.confirm!=='allow new join request')deny(400,'reinstatement_confirmation_required');const row=await write(q("UPDATE organisation_memberships SET status='declined',updated_at=? WHERE org_id=? AND user_id=? AND status='removed' AND EXISTS(SELECT 1 FROM organisation_memberships a WHERE a.org_id=? AND a.user_id=? AND a.role='admin' AND a.status='active') RETURNING user_id",clock(),oid,reinstate[1],oid,actor),actor,oid,'membership.rejoin_allowed',reinstate[1]);if(!row)deny(409,'reinstatement_conflict');return json({canRequestAgain:true,active:false,personalDataChanged:false});
   }
   const remove=tail.match(/^members\/([^/]+)$/);if(remove&&req.method==='DELETE'){await member(oid,'members.manage');await body([]);const changed=await write(q("UPDATE organisation_memberships SET status='removed',updated_at=? WHERE org_id=? AND user_id=? AND role<>'admin' AND status IN ('requested','active') RETURNING user_id",clock(),oid,remove[1]),actor,oid,'membership.removed',remove[1]);if(!changed)deny(409,'member_cannot_be_removed');return json({removed:true})}
   if(tail==='content'){await member(oid,'content.draft');if(req.method==='GET')return json({content:(await all('SELECT * FROM organisation_content WHERE org_id=? ORDER BY updated_at DESC LIMIT 100',oid)).map(content)});if(req.method==='POST'){const b=await body(['kind','title','body','visibility','details']);if(!['guide','contact','date','update'].includes(b.kind)||!['public','members'].includes(b.visibility))deny(400,'invalid_content');const det=await detailsFor(b.kind,b.details,oid);const cid=id();await db.batch([q("INSERT INTO organisation_content(id,org_id,kind,title,body,details,visibility,status,updated_by,updated_at) VALUES (?,?,?,?,?,?,?,'draft',?,?)",cid,oid,b.kind,text(b.title,1,150),text(b.body,1,6000),det?JSON.stringify(det):null,b.visibility,actor,clock()),audit(actor,oid,'content.drafted',cid)]);return json({content:content(await q('SELECT * FROM organisation_content WHERE id=?',cid).first())},201)}}
   const edit=tail.match(/^content\/([^/]+)$/);if(edit&&req.method==='PATCH'){await member(oid,'content.draft');const b=await body(['title','body','visibility','status','revision','details']);if(!Number.isInteger(b.revision)||b.revision<1)deny(400,'revision_required');const old=await q('SELECT * FROM organisation_content WHERE id=? AND org_id=?',edit[1],oid).first();if(!old)deny(404,'not_found');const det=b.details===undefined?old.details:(v=>v?JSON.stringify(v):null)(await detailsFor(old.kind,b.details,oid,edit[1]));if(old.status==='published'||b.status==='published')await member(oid,'content.publish');if(b.status&&!['draft','published'].includes(b.status)||b.visibility&&!['public','members'].includes(b.visibility))deny(400,'invalid_content');const row=await write(q('UPDATE organisation_content SET title=?,body=?,details=?,visibility=?,status=?,revision=revision+1,updated_by=?,updated_at=? WHERE id=? AND org_id=? AND revision=? RETURNING *',b.title===undefined?old.title:text(b.title,1,150),b.body===undefined?old.body:text(b.body,1,6000),det,b.visibility||old.visibility,b.status||old.status,actor,clock(),edit[1],oid,b.revision),actor,oid,'content.updated',edit[1]);if(!row)deny(409,'content_conflict');return json({content:content(row)})}
   const codeRoute=tail.match(/^codes\/([^/]+)(\/revoke)?$/);
   if(codeRoute){await member(oid,codeRoute[2]?'qr.withdraw':'qr.public');const c=await q('SELECT * FROM organisation_public_codes WHERE id=? AND org_id=?',codeRoute[1],oid).first();if(!c)deny(404,'not_found');
    if(codeRoute[2]&&req.method==='POST'){await body([]);if(!c.revoked)await write(q('UPDATE organisation_public_codes SET revoked=1 WHERE id=? AND org_id=? AND revoked=0 RETURNING id',c.id,oid),actor,oid,'public_code.revoked',c.id);return json({revoked:true,grantsMembership:false})}
    if(!codeRoute[2]&&req.method==='GET'){if(c.revoked)deny(410,'public_code_withdrawn');const link=url.origin+'/platform?publicCode='+c.id;return json({code:{id:c.id,label:c.label,url:link,qrSvg:await qr(link),purpose:'public',grantsMembership:false}})}
   }
   if(tail==='codes'){await member(oid,'qr.public');if(req.method==='POST'){const b=await body(['label','contentId']);if(b.contentId&&!await q("SELECT id FROM organisation_content WHERE id=? AND org_id=? AND visibility='public' AND status='published'",b.contentId,oid).first())deny(400,'public_target_required');const cid=id();await db.batch([q('INSERT INTO organisation_public_codes(id,org_id,content_id,label,created_by,created_at) VALUES (?,?,?,?,?,?)',cid,oid,b.contentId||null,text(b.label,1,120),actor,clock()),audit(actor,oid,'public_code.created',cid)]);return json({code:{id:cid,label:b.label,url:url.origin+'/platform?publicCode='+cid,qrSvg:await qr(url.origin+'/platform?publicCode='+cid),purpose:'public',grantsMembership:false}},201)}if(req.method==='GET')return json({codes:await all('SELECT id,label,content_id AS contentId,revoked FROM organisation_public_codes WHERE org_id=? ORDER BY created_at DESC LIMIT 100',oid)})}
   if(tail==='records'){await member(oid,'org.view');deny(403,'separate_records_permission_required')}
   // Institution settings (ORI-UNI-015): staff read them; only admins change them, recently signed in, revision-checked,
   // audited by area (never the values). Unknown fields are refused, so nothing here can widen access or change caps.
   if(tail==='settings'&&req.method==='GET'){const me=await member(oid,'org.view');const s=await settingsOf(oid);
    const staff=await all("SELECT m.user_id AS id,u.name,m.role FROM organisation_memberships m JOIN user u ON u.id=m.user_id WHERE m.org_id=? AND m.status='active' AND m.role IN ('admin','editor') ORDER BY u.name LIMIT 100",oid);
    return json({...s,staff,canEdit:me.role==='admin'})}
   if(tail==='settings'&&req.method==='PATCH'){await member(oid,'staff.manage');fresh();const b=await body(['revision','settings']);if(!Number.isInteger(b.revision))deny(400,'invalid_revision');
    const cur=await settingsOf(oid);if(cur.revision!==b.revision)deny(409,'settings_changed');
    const staffIds=new Set((await all("SELECT user_id FROM organisation_memberships WHERE org_id=? AND status='active' AND role IN ('admin','editor')",oid)).map(r=>r.user_id));
    let next;try{next=normaliseSettings(b.settings,cur.settings,staffIds)}catch(e){if(e instanceof SettingsError)deny(400,e.message);throw e}
    const areas=changedAreas(cur.settings,next);if(!areas.length)return json({settings:cur.settings,revision:cur.revision});
    const saved=cur.revision?q('UPDATE organisation_settings SET data=?,revision=revision+1,updated_by=?,updated_at=? WHERE org_id=? AND revision=? RETURNING revision',JSON.stringify(next),actor,clock(),oid,cur.revision)
     :q('INSERT INTO organisation_settings(org_id,data,revision,updated_by,updated_at) VALUES (?,?,1,?,?) ON CONFLICT(org_id) DO NOTHING RETURNING revision',oid,JSON.stringify(next),actor,clock());
    const row=await write(saved,actor,oid,'settings.updated',areas.join(','));if(!row)deny(409,'settings_changed');return json({settings:next,revision:row.revision})}
   // Activity history for admins: what changed and when, by which staff member. Student actions show as "A student".
   if(tail==='audit'&&req.method==='GET'){await member(oid,'staff.manage');
    const rows=await all("SELECT a.action,a.created_at AS at,a.actor_id AS actorId,a.target_id AS target,u.name AS actorName,(SELECT role FROM organisation_memberships x WHERE x.org_id=a.org_id AND x.user_id=a.actor_id) AS actorRole FROM organisation_audit a LEFT JOIN user u ON u.id=a.actor_id WHERE a.org_id=? ORDER BY a.created_at DESC LIMIT 100",oid);
    return json({entries:rows.map(r=>({action:r.action,at:r.at,actor:['admin','editor'].includes(r.actorRole)?r.actorName||'Staff member':r.actorId?'A student':'Orivia',areas:r.action==='settings.updated'?String(r.target||'').split(',').filter(Boolean):undefined}))})}
   // Aggregate counts export: admins, and editors only when the organisation allows it. No names, emails or ids.
   if(tail==='export/counts.csv'&&req.method==='GET'){const me=await member(oid,'org.view');if(me.role!=='admin'&&!(await settingsOf(oid)).settings.exports.editorsMayExportCounts)deny(403,'export_not_allowed');
    const o=await org(oid);const people=await all('SELECT role,status,COUNT(*) AS count FROM organisation_memberships WHERE org_id=? GROUP BY role,status ORDER BY role,status',oid);const items=await all("SELECT kind,status,COUNT(*) AS count FROM organisation_content WHERE org_id=? GROUP BY kind,status ORDER BY kind,status",oid);
    try{await audit(actor,oid,'export.counts',null).run()}catch(_){}
    return new Response('\ufeff'+countsCsv(o.name,[...people.map(r=>({group:'people',detail:r.role+' '+r.status,count:r.count})),...items.map(r=>({group:'content',detail:r.kind+' '+r.status,count:r.count}))]),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="orivia-counts.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
  }
  const mine=path.match(/^\/api\/me\/orgs\/([^/]+)\/(progress|progress-sharing)$/);
  if(mine&&req.method==='POST'){const oid=mine[1];await member(oid,'space.view');await ensureProgress();
   if(mine[2]==='progress'){const b=await body(['contentId','done']);if(typeof b.contentId!=='string'||typeof b.done!=='boolean')deny(400,'invalid_progress');
    const c=await q("SELECT id FROM organisation_content WHERE id=? AND org_id=? AND status='published' AND kind IN ('guide','date')",b.contentId,oid).first();if(!c)deny(404,'not_found');
    if(b.done)await q('INSERT INTO organisation_progress(org_id,user_id,content_id,done_at) VALUES (?,?,?,?) ON CONFLICT DO NOTHING',oid,actor,c.id,clock()).run();else await q('DELETE FROM organisation_progress WHERE org_id=? AND user_id=? AND content_id=?',oid,actor,c.id).run();
    return json({done:b.done})}
   const b=await body(['share']);if(typeof b.share!=='boolean')deny(400,'invalid_sharing');
   if(b.share)await q('DELETE FROM organisation_progress_private WHERE org_id=? AND user_id=?',oid,actor).run();else await q('INSERT INTO organisation_progress_private(org_id,user_id) VALUES (?,?) ON CONFLICT DO NOTHING',oid,actor).run();
   return json({sharing:b.share})}
  /* Leaving (ORI-STUDENT-008): the person ends their own membership (or cancels a pending request). Access to members-only
     guides, dates and future alerts stops at once because every route checks an active membership; their Done marks for
     this organisation are removed; personal chats, plans and files are untouched. The only admin must hand over first. */
  m=path.match(/^\/api\/me\/orgs\/([^/]+)\/leave$/);
  if(m&&req.method==='POST'){const oid=m[1];const b=await body(['confirm']);if(b.confirm!=='leave')deny(400,'confirmation_required');
   const mem=await q("SELECT role,status FROM organisation_memberships WHERE org_id=? AND user_id=? AND status IN ('active','requested')",oid,actor).first();if(!mem)deny(404,'not_a_member');
   if(mem.role==='admin'&&mem.status==='active'&&!await q("SELECT 1 AS yes FROM organisation_memberships WHERE org_id=? AND role='admin' AND status='active' AND user_id<>?",oid,actor).first())deny(409,'transfer_organisation_admin_first');
   await write(q("UPDATE organisation_memberships SET status='left',updated_at=? WHERE org_id=? AND user_id=? AND status IN ('active','requested')",clock(),oid,actor),actor,oid,'membership.left',actor);
   try{await ensureProgress();await q('DELETE FROM organisation_progress WHERE org_id=? AND user_id=?',oid,actor).run()}catch(_){}
   return json({ok:true,status:'left'})}
  m=path.match(/^\/api\/me\/orgs\/([^/]+)$/);
  if(m){const oid=m[1];if(req.method==='GET'){await member(oid,'space.view');const contactFor=(await settingsOf(oid)).settings.studentContact,today=new Date(clock()).toISOString().slice(0,10);return json({studentContact:contactFor,organisation:publicOrg(await org(oid)),content:(await all("SELECT * FROM organisation_content WHERE org_id=? AND status='published' ORDER BY updated_at DESC LIMIT 100",oid)).map(content).filter(c=>!(c.kind==='update'&&c.details?.showUntil&&c.details.showUntil<today)),progress:await (async()=>{await ensureProgress();const done=(await all('SELECT content_id FROM organisation_progress WHERE org_id=? AND user_id=?',oid,actor)).map(r=>r.content_id);return {available:true,done,private:true}})(),applicationProgress:{available:false,reason:'institution_integration_not_connected'},personalDataShared:false})}if(req.method==='DELETE'){await org(oid);await body([]);const current=await q("SELECT * FROM organisation_memberships WHERE org_id=? AND user_id=? AND status IN ('active','requested')",oid,actor).first();if(!current)deny(404,'membership_not_found');if(current.role==='admin')deny(409,'transfer_admin_first');await db.batch([q("UPDATE organisation_memberships SET status='left',updated_at=? WHERE org_id=? AND user_id=?",clock(),oid,actor),audit(actor,oid,'membership.left',actor)]);return json({left:true,personalDataChanged:false})}}
  deny(404,'not_found');
 }catch(e){if(e instanceof DetailsError)return json({error:e.message},400);return json({error:e instanceof Fault?e.message:e?.message==='body_too_large'?'body_too_large':'organisation_request_failed'},e instanceof Fault?e.status:e?.message==='body_too_large'?413:400)}
}

export async function organisationDeletionBlock(db,userId){
 const owner=await db.prepare("SELECT 1 AS yes FROM platform_roles WHERE user_id=? AND role='owner'").bind(userId).first();
 if(owner){const total=await db.prepare("SELECT COUNT(*) AS n FROM platform_roles WHERE role='owner'").first();if(total.n<2)return 'transfer_platform_owner_first'}
 const sole=await db.prepare("SELECT m.org_id FROM organisation_memberships m WHERE m.user_id=? AND m.role='admin' AND m.status='active' AND NOT EXISTS(SELECT 1 FROM organisation_memberships other WHERE other.org_id=m.org_id AND other.user_id<>m.user_id AND other.role='admin' AND other.status='active') LIMIT 1").bind(userId).first();
 return sole?'transfer_organisation_admin_first':null;
}
