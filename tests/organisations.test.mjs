/* Actual Better Auth sessions + real SQLite transactions behind the D1 interface. No real email or cloud deployment. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createRequire} from 'node:module';
const jsQR=createRequire(new URL('../workers/accounts/package.json',import.meta.url))('jsqr');
function decodeSvg(svg){
 const n=Number(svg.match(/viewBox="0 0 (\d+) /)[1]),scale=4,width=n*scale,rgba=new Uint8ClampedArray(width*width*4).fill(255);
 const path=svg.match(/<path stroke="#000000" d="([^"]+)"/)[1];let x=0,y=0;
 for(const m of path.matchAll(/([Mmh])(-?\d+(?:\.\d+)?)(?: (-?\d+(?:\.\d+)?))?/g)){const a=Number(m[2]),b=Number(m[3]||0);if(m[1]==='M'){x=a;y=b}else if(m[1]==='m'){x+=a;y+=b}else{for(let col=x;col<x+a;col++)for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){const p=((Math.floor(y)*scale+dy)*width+col*scale+dx)*4;rgba[p]=rgba[p+1]=rgba[p+2]=0}x+=a}}
 const found=jsQR(rgba,width,width);assert.ok(found,'generated SVG must decode as a real QR');return found.data;
}

import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+fs.readFileSync('workers/accounts/schema.sql','utf8')+fs.readFileSync('workers/accounts/organisations.sql','utf8'));
const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
const db={prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-organisation-account-secret-123456789',ACCOUNTS_DB:db,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email in tests')}},ORGANISATIONS_ENABLED:'1'};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let stamp=Date.now(),ip=0;
async function call(who,path,method='GET',body,extra={}){const r=await handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),...(who?{Cookie:who.cookie,'X-Orivia-Account':who.id}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{}, {auth,organisationOptions:{now:()=>stamp}});return {status:r.status,data:await r.json()}}
async function signIn(name){const address=name+'@northbay.example';let r=await call(null,'/api/auth/email-otp/send-verification-otp','POST',{email:address,type:'sign-in'});assert.equal(r.status,200);const response=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip)},body:JSON.stringify({email:address,otp:outbox.at(-1).otp})}),env,{}, {auth});assert.equal(response.status,200);const data=await response.json();return {id:data.user.id,email:address,cookie:response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const owner=await signIn('owner'),mariam=await signIn('mariam'),editor=await signIn('daniel'),aisha=await signIn('aisha'),omar=await signIn('omar');
// Bootstrap is out-of-band, never a public endpoint or inferred from a name/email.
sql.prepare('INSERT INTO platform_roles(user_id,role) VALUES (?,?)').run(owner.id,'owner');
assert.equal((await call(null,'/api/admin/orgs')).status,401);
assert.equal((await call(omar,'/api/admin/orgs','POST',{name:'Fake owner',slug:'fake-owner',city:'Dubai',demo:true})).status,403);
let r=await call(owner,'/api/admin/orgs','POST',{name:'Northbay University',slug:'northbay',city:'Dubai',demo:true});assert.equal(r.status,201,JSON.stringify(r));const org=r.data.organisation.id;
r=await call(owner,'/api/admin/orgs/'+org+'/admin-invite','POST',{recipientEmail:mariam.email,label:'First admin'});assert.equal(r.status,201,JSON.stringify(r));const adminInvite=r.data;assert.equal(decodeSvg(adminInvite.qrSvg),adminInvite.joinUrl);assert.match(adminInvite.joinUrl,/\/platform#join=/);
assert.equal((await call(omar,'/api/invitations/join','POST',{token:adminInvite.token})).status,403,'staff invitation cannot be stolen by another verified email');
r=await call(mariam,'/api/invitations/join','POST',{token:adminInvite.token});assert.equal(r.status,201,JSON.stringify(r));assert.equal(r.data.membership.role,'admin');assert.equal(r.data.membership.status,'active');
// Campus settings are public, admin-controlled, revision checked, and never infer a destination.
assert.equal((await call(null,'/api/public/orgs/northbay')).data.arrival,null);
assert.equal((await call(omar,'/api/orgs/'+org+'/arrival','PATCH',{country:'uae',region:'Dubai',town:'Dubai Academic City',reason:'study',revision:0})).status,403);
let campus=await call(mariam,'/api/orgs/'+org+'/arrival','PATCH',{country:'uae',region:'Dubai',town:'Dubai Academic City',reason:'study',revision:0});assert.equal(campus.status,200,JSON.stringify(campus));assert.equal(campus.data.arrival.revision,1);
assert.equal((await call(mariam,'/api/orgs/'+org+'/arrival','PATCH',{country:'uk',region:'Dubai',town:'Wrong',reason:'study',revision:1})).status,400);
assert.equal((await call(mariam,'/api/orgs/'+org+'/arrival','PATCH',{country:'uk',region:'England',town:'Manchester',reason:'study',revision:0})).status,409);
const publicArrival=await call(null,'/api/public/orgs/northbay');assert.equal(publicArrival.data.arrival.country,'uae');assert.equal(publicArrival.data.arrival.reason,'study');assert.equal(publicArrival.data.grantsMembership,false);assert.ok(!JSON.stringify(publicArrival.data).includes(mariam.email));
assert.equal((await call(owner,'/api/admin/orgs/'+org+'/admin-invite','POST',{recipientEmail:omar.email})).status,409,'owner cannot bypass admin management with a second bootstrap invite');
assert.equal((await call(owner,'/api/orgs/'+org+'/members')).status,403,'owner role does not grant access to member identities');
r=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'editor',recipientEmail:editor.email});assert.equal(r.status,201);const editorToken=r.data.token;
assert.equal((await call(editor,'/api/invitations/join','POST',{token:editorToken})).status,201);
assert.equal((await call(editor,'/api/orgs/'+org+'/invitations','POST',{role:'student'})).status,403);
r=await call(editor,'/api/orgs/'+org+'/content','POST',{kind:'guide',title:'First week',body:'Come to Block A.',visibility:'members'});assert.equal(r.status,201);const guide=r.data.content.id;
assert.equal((await call(editor,'/api/orgs/'+org+'/content/'+guide,'PATCH',{revision:1,status:'published'})).status,403,'editor cannot publish by calling API directly');
r=await call(mariam,'/api/orgs/'+org+'/content/'+guide,'PATCH',{revision:1,status:'published'});assert.equal(r.status,200);assert.equal(r.data.content.revision,2);
assert.equal((await call(mariam,'/api/orgs/'+org+'/content/'+guide,'PATCH',{revision:1,title:'stale edit'})).status,409);
assert.equal((await call(editor,'/api/orgs/'+org+'/content/'+guide,'PATCH',{revision:2,title:'sneak published edit'})).status,403);
assert.equal((await call(omar,'/api/me/orgs/'+org)).status,403,'verified university email does not auto-enrol anyone');
r=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student',label:'Autumn arrivals',maxUses:2});assert.equal(r.status,201);const cohort=r.data;assert.equal(decodeSvg(cohort.qrSvg),cohort.joinUrl);const arrivalUrl=new URL(cohort.joinUrl);assert.equal(arrivalUrl.pathname,'/');assert.equal(arrivalUrl.searchParams.get('organisation'),'northbay');assert.equal(arrivalUrl.hash,'#join='+cohort.token);assert.ok(!arrivalUrl.search.includes(cohort.token));
r=await call(aisha,'/api/invitations/join','POST',{token:cohort.token});assert.equal(r.status,201);assert.equal(r.data.membership.status,'requested');
assert.equal((await call(aisha,'/api/me/orgs/'+org)).status,403,'pending membership does not expose member content');
assert.equal((await call(aisha,'/api/invitations/join','POST',{token:cohort.token})).status,200,'join retry is idempotent');assert.equal(sql.prepare('SELECT uses FROM organisation_invitations WHERE id=?').get(cohort.invitation.id).uses,1);
assert.equal((await call(editor,'/api/orgs/'+org+'/requests/'+aisha.id+'/decision','POST',{decision:'approve'})).status,403);
r=await call(mariam,'/api/orgs/'+org+'/requests/'+aisha.id+'/decision','POST',{decision:'approve'});assert.equal(r.status,200,JSON.stringify(r));
r=await call(aisha,'/api/me/orgs/'+org);assert.equal(r.status,200);assert.equal(r.data.content[0].id,guide);assert.equal(r.data.personalDataShared,false);assert.equal(r.data.applicationProgress.available,false);assert.equal(r.data.progress.available,true);assert.equal(r.data.progress.private,true);assert.deepEqual(r.data.progress.done,[]);
assert.equal((await call(aisha,'/api/me/memberships')).data.memberships[0].organisationId,org);
assert.equal((await call(mariam,'/api/orgs/'+org+'/records')).status,403,'even admin has no application-record privilege');
// Real personal vault remains private and untouched by organisation actions.
const vault={version:1,profile:{private:'About me'},events:[{title:'Private calendar'}],journeys:{},chats:{active:'personal',chats:[{id:'personal',turns:[{role:'user',content:'Personal secret chat'}]}]}};
assert.equal((await call(aisha,'/api/account/vault','PUT',vault,{'If-Match':'0'})).status,200);
assert.equal((await call(mariam,'/api/account/vault?user_id='+aisha.id)).data.data,null);
// Public codes never enrol a person, and cannot target unpublished/member-only content.
assert.equal((await call(editor,'/api/orgs/'+org+'/codes','POST',{label:'Leak members',contentId:guide})).status,400);
r=await call(editor,'/api/orgs/'+org+'/content','POST',{kind:'guide',title:'Public welcome',body:'Welcome desk is open.',visibility:'public'});const publicGuide=r.data.content.id;
assert.equal((await call(editor,'/api/orgs/'+org+'/codes','POST',{label:'Draft',contentId:publicGuide})).status,400);
assert.equal((await call(mariam,'/api/orgs/'+org+'/content/'+publicGuide,'PATCH',{revision:1,status:'published'})).status,200);
r=await call(editor,'/api/orgs/'+org+'/codes','POST',{label:'Welcome poster',contentId:publicGuide});assert.equal(r.status,201);const publicCode=r.data.code;assert.equal(decodeSvg(publicCode.qrSvg),publicCode.url);
r=await call(null,'/api/public/codes/'+publicCode.id);assert.equal(r.status,200);assert.equal(r.data.grantsMembership,false);assert.equal(r.data.content.length,1);assert.equal((await call(null,'/api/public/orgs/northbay')).data.content.length,1);
// Staff retrieve exact public QR links; only admins withdraw, and public access ends immediately.
r=await call(editor,'/api/orgs/'+org+'/codes/'+publicCode.id);assert.equal(r.status,200);assert.equal(decodeSvg(r.data.code.qrSvg),publicCode.url);
assert.equal((await call(aisha,'/api/orgs/'+org+'/codes/'+publicCode.id)).status,403);
assert.equal((await call(editor,'/api/orgs/'+org+'/codes/'+publicCode.id+'/revoke','POST',{})).status,403);
assert.equal((await call(mariam,'/api/orgs/'+org+'/codes/'+publicCode.id+'/revoke','POST',{})).status,200);
assert.equal((await call(mariam,'/api/orgs/'+org+'/codes/'+publicCode.id+'/revoke','POST',{})).status,200,'withdrawal is idempotent');
assert.equal((await call(null,'/api/public/codes/'+publicCode.id)).status,404);
assert.equal((await call(editor,'/api/orgs/'+org+'/codes/'+publicCode.id)).status,410);
assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM organisation_audit WHERE action='public_code.revoked' AND target_id=?").get(publicCode.id).n,1);
assert.equal((await call(aisha,'/api/me/orgs/'+org)).status,200,'withdrawing a public code does not remove students');
// Tenant separation: changing the URL cannot transfer permissions or read content.
r=await call(owner,'/api/admin/orgs','POST',{name:'Other University',slug:'other-university',city:'Edinburgh',demo:true});const other=r.data.organisation.id;
assert.equal((await call(mariam,'/api/orgs/'+other+'/content/'+guide,'PATCH',{revision:2,title:'wrong tenant'})).status,403);
assert.equal((await call(omar,'/api/orgs/'+org+'/summary')).status,403);
assert.equal((await call(mariam,'/api/orgs/'+other+'/codes/'+publicCode.id)).status,403);
assert.equal((await call(mariam,'/api/orgs/'+other+'/codes/'+publicCode.id+'/revoke','POST',{})).status,403);
assert.equal((await call(mariam,'/api/orgs/'+org+'/content/'+publicGuide,'PATCH',{revision:2,title:'x'}, {Origin:'https://evil.example'})).status,403);
assert.equal((await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student'},{'X-Orivia-Account':aisha.id})).status,409);
assert.equal((await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'admin',recipientEmail:omar.email})).status,400,'no staff escalation through student invite API');
// Revocation blocks new joins and approvals still waiting.
assert.equal((await call(omar,'/api/invitations/join','POST',{token:cohort.token})).status,201);
assert.equal((await call(mariam,'/api/orgs/'+org+'/invitations/'+cohort.invitation.id+'/revoke','POST',{})).status,200);
assert.equal((await call(mariam,'/api/orgs/'+org+'/requests/'+omar.id+'/decision','POST',{decision:'approve'})).status,409);
assert.equal((await call(omar,'/api/invitations/join','POST',{token:cohort.token})).status,410);
r=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student',expiresInSeconds:60});const expiry=r.data.token;stamp+=61000;assert.equal((await call(omar,'/api/invitations/join','POST',{token:expiry})).status,410);
assert.equal((await call(mariam,'/api/me/orgs/'+org,'DELETE',{})).status,409,'last admin cannot abandon the organisation');
assert.equal((await call(aisha,'/api/me/orgs/'+org,'DELETE',{})).status,200);assert.equal((await call(aisha,'/api/me/orgs/'+org)).status,403);assert.deepEqual((await call(aisha,'/api/account/vault')).data.data,vault,'leaving never changes personal vault');
const stored=JSON.stringify(sql.prepare('SELECT * FROM organisation_invitations').all());assert.ok(!stored.includes(cohort.token));
const audit=JSON.stringify(sql.prepare('SELECT * FROM organisation_audit').all());assert.ok(!audit.includes('Personal secret chat'));assert.ok(!audit.includes(cohort.token));
assert.ok(!(await call(mariam,'/api/orgs/'+org+'/invitations')).data.invitations.some(x=>'token_hash' in x||'token' in x));

// A real QR is generated, and link destinations are served integration pages, not placeholder routes.
let page=await handleAccountRequest(new Request(origin+'/platform'),env,{}, {auth});assert.equal(page.status,200);assert.match(await page.text(),/integration preview/);
page=await handleAccountRequest(new Request(origin+'/platform.js'),env,{}, {auth});assert.equal(page.status,200);const script=await page.text();assert.doesNotMatch(script,/\bpersona\b/);assert.match(script,/api\/account\/session/);
// Session-scoped views expose no invitation secrets or personal message strings.
assert.equal((await call(aisha,'/api/invitations/inspect','POST',{token:adminInvite.token})).status,403);
assert.equal((await call(aisha,'/api/invitations/'+adminInvite.token)).status,404,'invitation secrets are not accepted in request URLs');
assert.equal((await call(aisha,'/api/invitations/join','POST',{token:expiry,role:'admin'})).status,400,'client cannot assign its own role');
assert.equal((await call(owner,'/api/account','DELETE',{confirm:'delete my account'})).data.error,'transfer_platform_owner_first');
assert.equal((await call(mariam,'/api/account','DELETE',{confirm:'delete my account'})).data.error,'transfer_organisation_admin_first');
// Audit failure must roll the content update back; no "changed but unlogged" success.
sql.exec("CREATE TRIGGER test_audit_failure BEFORE INSERT ON organisation_audit WHEN NEW.action='content.updated' BEGIN SELECT RAISE(ABORT,'fixture audit failure'); END;");
const before=sql.prepare('SELECT * FROM organisation_content WHERE id=?').get(publicGuide);
r=await call(mariam,'/api/orgs/'+org+'/content/'+publicGuide,'PATCH',{revision:before.revision,title:'Must not persist'});assert.equal(r.status,500,'a database failure is a server failure, not a bad request');assert.match(r.data.ref,/^[a-f0-9]{10}$/,'with a reference');assert.equal(sql.prepare('SELECT title FROM organisation_content WHERE id=?').get(publicGuide).title,before.title);sql.exec('DROP TRIGGER test_audit_failure');
// Capacity is durable and replay-safe across different people.
const bilal=await signIn('bilal'),sara=await signIn('sara');r=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student',maxUses:1});const limited=r.data;
assert.equal((await call(bilal,'/api/invitations/join','POST',{token:limited.token})).status,201);
assert.equal((await call(sara,'/api/invitations/join','POST',{token:limited.token})).status,409);
assert.equal(sql.prepare('SELECT uses FROM organisation_invitations WHERE id=?').get(limited.invitation.id).uses,1);
// Owner is not inferred from the email domain or from content in the request.
assert.equal((await call(omar,'/api/admin/orgs','POST',{name:'Northbay',slug:'fake-owner-2',city:'Dubai',demo:true,platformRole:'owner'})).status,403);
assert.equal((await call(editor,'/api/orgs/'+org+'/members')).status,403);
assert.equal((await call(mariam,'/api/orgs/'+other+'/invitations/'+limited.invitation.id+'/revoke','POST',{})).status,403);
// Role management: explicit confirmation, current role, verified target and a remaining admin.
r=await call(owner,'/api/admin/orgs','POST',{name:'Role Test University',slug:'role-test',city:'Manchester',demo:true});const roleOrg=r.data.organisation.id;
r=await call(owner,'/api/admin/orgs/'+roleOrg+'/admin-invite','POST',{recipientEmail:mariam.email});await call(mariam,'/api/invitations/join','POST',{token:r.data.token});
r=await call(mariam,'/api/orgs/'+roleOrg+'/invitations','POST',{role:'editor',recipientEmail:editor.email});await call(editor,'/api/invitations/join','POST',{token:r.data.token});
const setRole=(actor,target,role,expectedRole)=>call(actor,'/api/orgs/'+roleOrg+'/members/'+target.id+'/role','POST',{role,expectedRole,confirm:'change organisation role'});
assert.equal((await setRole(mariam,mariam,'editor','admin')).status,409,'sole admin cannot step down');
assert.equal((await setRole(editor,editor,'admin','editor')).status,403,'editor cannot promote self');
assert.equal((await setRole(owner,editor,'admin','editor')).status,403,'platform owner is not organisation staff');
assert.equal((await setRole(mariam,omar,'admin','student')).status,409,'target must already be active here');
assert.equal((await call(mariam,'/api/orgs/'+roleOrg+'/members/'+editor.id+'/role','POST',{role:'admin',expectedRole:'editor'})).status,400);
assert.equal((await setRole(mariam,editor,'owner','editor')).status,400,'no platform role through organisation API');
sql.prepare('UPDATE user SET emailVerified=0 WHERE id=?').run(editor.id);assert.equal((await setRole(mariam,editor,'admin','editor')).status,409);sql.prepare('UPDATE user SET emailVerified=1 WHERE id=?').run(editor.id);
assert.equal((await setRole(mariam,editor,'admin','editor')).status,200);
assert.equal((await setRole(mariam,editor,'student','editor')).status,409,'stale expected role cannot overwrite a promotion');
assert.equal((await setRole(mariam,mariam,'editor','admin')).status,200,'handover only after a second admin exists');
assert.equal((await setRole(editor,editor,'student','admin')).status,409,'new sole admin is protected');
assert.equal((await setRole(mariam,mariam,'admin','editor')).status,403,'former admin immediately loses role-management access');
assert.equal((await setRole(editor,mariam,'student','editor')).status,200);
assert.equal((await call(mariam,'/api/orgs/'+roleOrg+'/content','POST',{kind:'guide',title:'No',body:'No',visibility:'members'})).status,403,'demotion takes effect on the next API request');
assert.equal((await call(editor,'/api/orgs/'+roleOrg+'/members/'+mariam.id,'DELETE',{})).status,200);
assert.equal((await call(mariam,'/api/me/orgs/'+roleOrg)).status,403);
assert.equal((await call(mariam,'/api/orgs/'+roleOrg+'/members/'+mariam.id+'/reinstate','POST',{confirm:'allow new join request'})).status,403);
r=await call(editor,'/api/orgs/'+roleOrg+'/members/'+mariam.id+'/reinstate','POST',{confirm:'allow new join request'});assert.equal(r.status,200);assert.equal(r.data.active,false);
assert.equal((await call(mariam,'/api/me/orgs/'+roleOrg)).status,403,'reinstatement does not reactivate membership');
r=await call(editor,'/api/orgs/'+roleOrg+'/invitations','POST',{role:'student'});const rejoin=r.data.token;
r=await call(mariam,'/api/invitations/join','POST',{token:rejoin});assert.equal(r.data.membership.status,'requested');
assert.equal((await call(mariam,'/api/me/orgs/'+roleOrg)).status,403);
assert.equal((await call(editor,'/api/orgs/'+roleOrg+'/requests/'+mariam.id+'/decision','POST',{decision:'approve'})).status,200);
assert.equal((await call(mariam,'/api/me/orgs/'+roleOrg)).status,200);
sql.exec("CREATE TRIGGER role_audit_failure BEFORE INSERT ON organisation_audit WHEN NEW.action LIKE 'membership.role_changed_to_%' BEGIN SELECT RAISE(ABORT,'test audit failure'); END");
assert.equal((await setRole(editor,mariam,'editor','student')).status,500,'a database failure is a server failure');assert.equal(sql.prepare('SELECT role FROM organisation_memberships WHERE org_id=? AND user_id=?').get(roleOrg,mariam.id).role,'student','audit failure rolls role change back');sql.exec('DROP TRIGGER role_audit_failure');
const beforeStale=stamp;stamp+=900001;assert.equal((await setRole(editor,mariam,'editor','student')).status,403,'old sessions must sign in again');stamp=beforeStale;
assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM organisation_memberships WHERE org_id=? AND role='admin' AND status='active'").get(roleOrg).n,1);
assert.equal((await call(mariam,'/api/account/vault')).data.revision,0,'role management never creates a personal vault');

/* Structured content (21 Oct): staff save validated details; students see them once published; links stay in-organisation. */
{let g=await call(mariam,'/api/orgs/'+org+'/content','POST',{kind:'guide',title:'Arrival guide',body:'What to do in your first week.',visibility:'members',details:{sourceUrl:'https://northbay.example/arrival'}});assert.equal(g.status,201,JSON.stringify(g));assert.deepEqual(g.data.content.details,{sourceUrl:'https://northbay.example/arrival'});
 const guideId=g.data.content.id;
 let d=await call(mariam,'/api/orgs/'+org+'/content','POST',{kind:'date',title:'Visa medical deadline',body:'Book before this date.',visibility:'members',details:{date:'2026-11-12',time:'17:00',timeZone:'Asia/Dubai'}});assert.equal(d.status,201,JSON.stringify(d));
 assert.equal((await call(mariam,'/api/orgs/'+org+'/content','POST',{kind:'date',title:'Bad',body:'x',visibility:'members',details:{date:'2026-11-12',time:'17:00',timeZone:'Nowhere/Here'}})).data.error,'invalid_details:timeZone');
 assert.equal((await call(mariam,'/api/orgs/'+org+'/content','POST',{kind:'contact',title:'Bad',body:'x',visibility:'members',details:{website:'http://insecure.example'}})).data.error,'invalid_details:website');
 assert.equal((await call(mariam,'/api/orgs/'+org+'/content','POST',{kind:'update',title:'Bad',body:'x',visibility:'members',details:{relatedId:'not-a-northbay-guide'}})).data.error,'invalid_details:relatedId','related guides must belong to the same organisation');
 let u=await call(mariam,'/api/orgs/'+org+'/content','POST',{kind:'update',title:'Medicals open',body:'Bookings are open.',visibility:'members',details:{relatedId:guideId,actionLabel:'Book a slot',actionUrl:'https://northbay.example/book'}});assert.equal(u.status,201,JSON.stringify(u));
 for(const c of [g.data.content,d.data.content,u.data.content])assert.equal((await call(mariam,'/api/orgs/'+org+'/content/'+c.id,'PATCH',{status:'published',revision:c.revision})).status,200);
 const lina=await signIn('lina'),inv=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student',label:'Details test'});assert.equal(inv.status,201);
 assert.equal((await call(lina,'/api/invitations/join','POST',{token:inv.data.token})).status,201);assert.equal((await call(mariam,'/api/orgs/'+org+'/requests/'+lina.id+'/decision','POST',{decision:'approve'})).status,200);
 const seen=(await call(lina,'/api/me/orgs/'+org)).data.content;const date=seen.find(c=>c.title==='Visa medical deadline'),upd=seen.find(c=>c.title==='Medicals open');
 assert.deepEqual(date.details,{date:'2026-11-12',time:'17:00',timeZone:'Asia/Dubai'});assert.equal(upd.details.relatedId,guideId);
 const cleared=await call(mariam,'/api/orgs/'+org+'/content/'+u.data.content.id,'PATCH',{details:null,revision:u.data.content.revision+1});assert.equal(cleared.status,200,JSON.stringify(cleared));assert.equal(cleared.data.content.details,null,'staff can remove details');}

/* myorivia.app (21 Oct): /manage is decided on the server before any page is sent; with the app at /app, links use it. */
{const page=async(who,path,e=env)=>{const res=await handleAccountRequest(new Request(origin+path,{headers:{'cf-connecting-ip':'192.0.2.'+(++ip),...(who?{Cookie:who.cookie}:{})}}),e,{}, {auth,organisationOptions:{now:()=>stamp}});return {status:res.status,text:await res.text()}};
 let p=await page(owner,'/manage');assert.equal(p.status,200,'the owner gets management');assert.match(p.text,/data-app-home="\/"/);
 p=await page(mariam,'/manage');assert.equal(p.status,403,'an organisation admin is not the platform owner');assert.match(p.text,/only for Orivia’s management account/);assert.doesNotMatch(p.text,/Northbay|platform\.js/,'no organisation data or dashboard script');
 p=await page(aisha,'/manage');assert.equal(p.status,403,'students cannot open management');
 p=await page(null,'/manage');assert.equal(p.status,401);assert.match(p.text,/Sign in to Orivia with the management account/);assert.match(p.text,/href="\/"/);
 const app={...env,APP_HOME:'/app'};
 p=await page(null,'/manage',app);assert.match(p.text,/href="\/app"/,'sign-in goes to the app, not the website');
 p=await page(owner,'/platform',app);assert.match(p.text,/data-app-home="\/app"/);
 // Served as text: bundlers that keep function names (Wrangler) insert __name(...) calls, so the script brings a stand-in.
 p=await page(null,'/platform.js');assert.match(p.text,/^\(function\(\)\{const __name=f=>f;window\.OriviaRestoredUI=/);const vm=await import('node:vm');
 const ran=[];vm.runInNewContext(p.text.replace('const __name=f=>f;','const __name=f=>f;ran.push(1);'),{ran,URL,__name:undefined,document:{getElementById:()=>null,documentElement:{dataset:{}}},location:{pathname:'/manage',hash:'',href:'https://x/manage'},window:{addEventListener(){}},fetch:()=>new Promise(()=>{})},{timeout:1000});assert.equal(ran.length,1);
 const made=await handleAccountRequest(new Request(origin+'/api/orgs/'+org+'/invitations',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),Cookie:mariam.cookie,'X-Orivia-Account':mariam.id},body:JSON.stringify({role:'student',label:'App home'})}),app,{}, {auth,organisationOptions:{now:()=>stamp}});
 const inv=await made.json();assert.equal(made.status,201,JSON.stringify(inv));assert.equal(inv.joinUrl,origin+'/join/northbay#join='+inv.token,'short university link on myorivia.app');assert.equal(decodeSvg(inv.qrSvg),inv.joinUrl,'the QR code opens the same link');
 r=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student',label:'Pilot link'});assert.equal(r.data.joinUrl,origin+'/?organisation=northbay#join='+r.data.token,'pilot links are unchanged');}

// Step 9 (22 Oct): staff counts, member search and paging, admin status, and totals-only student progress.
{sql.prepare("UPDATE organisation_memberships SET status='active',role='student' WHERE org_id=? AND user_id=?").run(org,aisha.id); // she left earlier in this story
 const st=await call(mariam,'/api/orgs/'+org+'/summary');assert.equal(st.status,200);assert.ok(Number.isInteger(st.data.activity.joinedLast30Days)&&Number.isInteger(st.data.activity.invitationUses)&&Array.isArray(st.data.activity.published));
 assert.ok(!JSON.stringify(st.data).includes(aisha.email),'counts never name anyone');
 const own=await call(owner,'/api/admin/orgs');assert.equal(own.data.organisations.find(o=>o.id===org).adminActive,true,'owner sees the admin is active');
 // Members: search by name/email and pages of 100 with waiting requests first.
 let ms=await call(mariam,'/api/orgs/'+org+'/members?q=AISHA');assert.equal(ms.status,200);assert.ok(ms.data.members.length>=1&&ms.data.members.every(x=>/aisha/i.test(x.name+x.email)));
 ms=await call(mariam,'/api/orgs/'+org+'/members?q=%25');assert.equal(ms.data.members.length,0,'search wildcards are literal');
 const now=new Date().toISOString(),extra=[];
 for(let i=0;i<120;i++){const uid='bulk-'+i;sql.prepare('INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,?,?,?)').run(uid,'Student '+i,uid+'@northbay.example',1,now,now);
  sql.prepare("INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,'student',?,?,?,?)").run(org,uid,i===119?'requested':'active','req-'+i,Date.now(),Date.now());extra.push(uid)}
 ms=await call(mariam,'/api/orgs/'+org+'/members');assert.equal(ms.data.members.length,100);assert.equal(ms.data.more,true);assert.equal(ms.data.members[0].status,'requested','waiting requests first');
 const page2=await call(mariam,'/api/orgs/'+org+'/members?offset='+ms.data.nextOffset);assert.ok(page2.data.members.length>0&&!page2.data.members.some(x=>ms.data.members.some(y=>y.userId===x.userId)),'next page has the rest');
 // Progress: a student marks a published guide done; only published guides/dates of their own organisation.
 r=await call(aisha,'/api/me/orgs/'+org+'/progress','POST',{contentId:guide,done:true});assert.equal(r.status,200,JSON.stringify(r));
 assert.deepEqual((await call(aisha,'/api/me/orgs/'+org)).data.progress.done,[guide]);
 assert.equal((await call(aisha,'/api/me/orgs/'+org+'/progress','POST',{contentId:'not-a-real-item',done:true})).status,404);
 assert.equal((await call(mariam,'/api/me/orgs/'+org+'/progress','POST',{contentId:guide,done:true})).status,403,'staff cannot mark student progress');
 assert.equal((await call(omar,'/api/orgs/'+org+'/progress')).status,403,'non-members see nothing');
 // Totals only, and only with at least 5 sharing students. Make it exactly 5 sharing: opt everyone else out.
 const sharingIds=extra.slice(0,4);const keep=[aisha.id,...sharingIds];for(const row of sql.prepare('SELECT user_id FROM organisation_memberships WHERE org_id=?').all(org))if(!keep.includes(row.user_id))sql.prepare('INSERT OR IGNORE INTO organisation_progress_private(org_id,user_id) VALUES (?,?)').run(org,row.user_id);
 for(const uid of sharingIds.slice(0,2))sql.prepare('INSERT INTO organisation_progress(org_id,user_id,content_id,done_at) VALUES (?,?,?,?)').run(org,uid,guide,Date.now());
 // Staff totals are paused (Ina 1374ec9): before and after a removal, staff receive titles only, never a count.
 const noCounts=pr=>{assert.equal(pr.status,200);assert.equal(pr.data.progress.shown,false);assert.equal(pr.data.progress.reason,'reporting_paused');assert.ok(!/"(done|students|minimum)"/.test(JSON.stringify(pr.data)),'no counts')};
 let pr=await call(mariam,'/api/orgs/'+org+'/progress');noCounts(pr);assert.ok(pr.data.progress.items.some(i=>i.id===guide));
 assert.ok(!JSON.stringify(pr.data).match(/aisha|bulk-|@/i),'no names, ids or emails');
 sql.prepare("UPDATE organisation_memberships SET status='removed' WHERE org_id=? AND user_id=?").run(org,sharingIds[0]);noCounts(await call(mariam,'/api/orgs/'+org+'/progress'));
 assert.equal((await call(aisha,'/api/me/orgs/'+org)).data.progress.private,true,'the student is told their marks are private');
 // Unmarking works.
 r=await call(aisha,'/api/me/orgs/'+org+'/progress','POST',{contentId:guide,done:false});assert.deepEqual((await call(aisha,'/api/me/orgs/'+org)).data.progress.done,[]);
}
console.log('Organisations: real account sessions and SQL, full owner → admin → invite → request → approval → student flow; forged roles, cross-tenant access, stale writes, expiry/revocation, public-code isolation and personal-vault preservation passed. No real email or deployment.');

// Unexpected failures (28 Oct, Task 4 loading error): 500 with a reference, one log line without message text or identifiers.
{const {unexpectedFailure,routeShape}=await import('../workers/accounts/organisations.mjs');const lines=[];
 const res=unexpectedFailure(new Error('D1_ERROR: no such table: founder_workflows; user sara@example.test'),new Request('https://p.test/api/admin/orgs/org-7f3a9c/members/u_123?q=Sara',{method:'GET'}),l=>lines.push(l));
 assert.equal(res.status,500);const body=await res.json();assert.equal(body.error,'organisation_request_failed');assert.match(body.ref,/^[a-f0-9]{10}$/);
 const ev=JSON.parse(lines[0]);assert.deepEqual(Object.keys(ev).sort(),['cause','error','event','method','ref','route']);assert.equal(ev.ref,body.ref);assert.equal(ev.cause,'missing-table');
 assert.equal(ev.route,'/api/admin/orgs/:id/members/:id','identifiers removed from the route');assert.doesNotMatch(lines[0],/sara|Sara|u_123|org-7f3a9c|founder_workflows/,'no message text, query or ids in the log');
 assert.equal(routeShape('/api/me/orgs/northbay-university'),'/api/me/orgs/northbay-university','a plain slug keeps its shape');
 assert.equal(routeShape('/api/orgs/0f9c2b1e-11aa-4c3d-9e8f-123456789abc/settings'),'/api/orgs/:id/settings');}
console.log('Unexpected organisation failures: 500 with a reference and a content-free log line.');
