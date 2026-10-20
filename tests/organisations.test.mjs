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
let r=await call(owner,'/api/admin/orgs','POST',{name:'Northbay University',slug:'northbay',city:'Sharjah',demo:true});assert.equal(r.status,201,JSON.stringify(r));const org=r.data.organisation.id;
r=await call(owner,'/api/admin/orgs/'+org+'/admin-invite','POST',{recipientEmail:mariam.email,label:'First admin'});assert.equal(r.status,201,JSON.stringify(r));const adminInvite=r.data;assert.equal(decodeSvg(adminInvite.qrSvg),adminInvite.joinUrl);assert.match(adminInvite.joinUrl,/\/platform#join=/);
assert.equal((await call(omar,'/api/invitations/join','POST',{token:adminInvite.token})).status,403,'staff invitation cannot be stolen by another verified email');
r=await call(mariam,'/api/invitations/join','POST',{token:adminInvite.token});assert.equal(r.status,201,JSON.stringify(r));assert.equal(r.data.membership.role,'admin');assert.equal(r.data.membership.status,'active');
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
r=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student',label:'Autumn arrivals',maxUses:2});assert.equal(r.status,201);const cohort=r.data;
r=await call(aisha,'/api/invitations/join','POST',{token:cohort.token});assert.equal(r.status,201);assert.equal(r.data.membership.status,'requested');
assert.equal((await call(aisha,'/api/me/orgs/'+org)).status,403,'pending membership does not expose member content');
assert.equal((await call(aisha,'/api/invitations/join','POST',{token:cohort.token})).status,200,'join retry is idempotent');assert.equal(sql.prepare('SELECT uses FROM organisation_invitations WHERE id=?').get(cohort.invitation.id).uses,1);
assert.equal((await call(editor,'/api/orgs/'+org+'/requests/'+aisha.id+'/decision','POST',{decision:'approve'})).status,403);
r=await call(mariam,'/api/orgs/'+org+'/requests/'+aisha.id+'/decision','POST',{decision:'approve'});assert.equal(r.status,200,JSON.stringify(r));
r=await call(aisha,'/api/me/orgs/'+org);assert.equal(r.status,200);assert.equal(r.data.content[0].id,guide);assert.equal(r.data.personalDataShared,false);assert.equal(r.data.progress.available,false);
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
// Tenant separation: changing the URL cannot transfer permissions or read content.
r=await call(owner,'/api/admin/orgs','POST',{name:'Other University',slug:'other-university',city:'Edinburgh',demo:true});const other=r.data.organisation.id;
assert.equal((await call(mariam,'/api/orgs/'+other+'/content/'+guide,'PATCH',{revision:2,title:'wrong tenant'})).status,403);
assert.equal((await call(omar,'/api/orgs/'+org+'/summary')).status,403);
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
r=await call(mariam,'/api/orgs/'+org+'/content/'+publicGuide,'PATCH',{revision:before.revision,title:'Must not persist'});assert.equal(r.status,400);assert.equal(sql.prepare('SELECT title FROM organisation_content WHERE id=?').get(publicGuide).title,before.title);sql.exec('DROP TRIGGER test_audit_failure');
// Capacity is durable and replay-safe across different people.
const bilal=await signIn('bilal'),sara=await signIn('sara');r=await call(mariam,'/api/orgs/'+org+'/invitations','POST',{role:'student',maxUses:1});const limited=r.data;
assert.equal((await call(bilal,'/api/invitations/join','POST',{token:limited.token})).status,201);
assert.equal((await call(sara,'/api/invitations/join','POST',{token:limited.token})).status,409);
assert.equal(sql.prepare('SELECT uses FROM organisation_invitations WHERE id=?').get(limited.invitation.id).uses,1);
// Owner is not inferred from the email domain or from content in the request.
assert.equal((await call(omar,'/api/admin/orgs','POST',{name:'Northbay',slug:'fake-owner-2',city:'Sharjah',demo:true,platformRole:'owner'})).status,403);
assert.equal((await call(editor,'/api/orgs/'+org+'/members')).status,403);
assert.equal((await call(mariam,'/api/orgs/'+other+'/invitations/'+limited.invitation.id+'/revoke','POST',{})).status,403);
console.log('Organisations: real account sessions and SQL, full owner → admin → invite → request → approval → student flow; forged roles, cross-tenant access, stale writes, expiry/revocation, public-code isolation and personal-vault preservation passed. No real email or deployment.');
