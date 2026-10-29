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
const owner=await signIn('owner'),admin=await signIn('admin'),student=await signIn('student'),other=await signIn('other');
sql.prepare('INSERT INTO platform_roles VALUES (?,?)').run(owner.id,'owner');
const expect=(r,status)=>{assert.equal(r.status,status,JSON.stringify(r));return r.data};
// Named one-use partner setup, review before public address, and wrong-account refusal.
let invitation=expect(await call(owner,'/api/admin/onboarding','POST',{recipientEmail:admin.email,confirm:true}),201);
expect(await call(other,'/api/partner/inspect','POST',{token:invitation.token}),404);
const draft={name:'Example Pilot Campus',city:'Dubai',country:'uae',region:'Dubai',town:'Academic City',reason:'study'};
expect(await call(admin,'/api/partner/submit','POST',{token:invitation.token,revision:1,data:draft,confirm:true}),200);
expect(await call(admin,'/api/admin/onboarding/'+invitation.id+'/decision','POST',{revision:2,decision:'approve',confirm:true}),403);
let approved=expect(await call(owner,'/api/admin/onboarding/'+invitation.id+'/decision','POST',{revision:2,decision:'approve',confirm:true}),200),org=approved.organisationId;
assert.match(approved.address,/organisation=example-pilot-campus/);
expect(await call(owner,'/api/admin/onboarding/'+invitation.id+'/decision','POST',{revision:2,decision:'approve',confirm:true}),409);
expect(await call(admin,'/api/partner/submit','POST',{token:invitation.token,revision:3,data:draft,confirm:true}),409);
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM organisations').get().n,1);
sql.prepare("INSERT INTO organisation_memberships VALUES (?,?,'student','active',NULL,'fixture',?,?)").run(org,student.id,stamp,stamp);
// Actual authored support content only, separate permission to forward, withdrawal after leaving.
let ticket=expect(await call(student,'/api/orgs/'+org+'/support','POST',{title:'My question',body:'Please explain the campus appointment.',confirm:true}),201);
expect(await call(admin,'/api/orgs/'+org+'/support/'+ticket.id+'/escalate','POST',{confirm:true}),409);
expect(await call(other,'/api/orgs/'+org+'/support/'+ticket.id+'/consent','POST',{allowed:true,revision:1,confirm:true}),403);
expect(await call(student,'/api/orgs/'+org+'/support/'+ticket.id+'/consent','POST',{allowed:true,revision:1,confirm:true}),200);
expect(await call(admin,'/api/orgs/'+org+'/support/'+ticket.id+'/escalate','POST',{confirm:true}),201);
assert.equal(expect(await call(owner,'/api/admin/support-escalations'),200).requests.length,1);
expect(await call(other,'/api/admin/support-escalations'),403);
expect(await call(owner,'/api/admin/support-escalations/'+ticket.id,'PATCH',{reply:'Campus team will help.',status:'in_progress',revision:1}),200);
sql.prepare("UPDATE organisation_memberships SET status='left' WHERE user_id=?").run(student.id);
assert.equal(expect(await call(student,'/api/me/support-consents'),200).tickets.length,1);
expect(await call(student,'/api/orgs/'+org+'/support/'+ticket.id+'/consent','POST',{allowed:false,revision:2,confirm:true}),200);
assert.equal(expect(await call(owner,'/api/admin/support-escalations'),200).requests.length,0);
expect(await call(owner,'/api/admin/support-escalations/'+ticket.id,'PATCH',{reply:'Late reply',status:'resolved',revision:2}),409);
sql.prepare("UPDATE organisation_memberships SET status='active' WHERE user_id=?").run(student.id);
// Notices target active memberships and reviewed dates. History restoration is always a new draft.
let record=expect(await call(owner,'/api/admin/operations/communication','POST',{title:'Campus notice',status:'approved',data:{audience:org,message:'Check your appointment.',starts:new Date(stamp-864e5).toISOString(),ends:new Date(stamp+864e5).toISOString()}}),201).record;
assert.equal(expect(await call(student,'/api/me/notices'),200).notices.length,1);
assert.equal(expect(await call(other,'/api/me/notices'),200).notices.length,0);
expect(await call(student,'/api/admin/operations'),403);
expect(await call(owner,'/api/admin/operations/communication/'+record.id,'PATCH',{title:record.title,status:'withdrawn',data:record.data,revision:1}),200);
expect(await call(owner,'/api/admin/operations/communication/'+record.id,'PATCH',{title:record.title,status:'approved',data:record.data,revision:1}),409);
let history=expect(await call(owner,'/api/admin/operations/communication/'+record.id+'/history'),200);assert.equal(history.revisions.length,2);
let restored=expect(await call(owner,'/api/admin/operations/communication/'+record.id+'/restore','POST',{revision:2,fromRevision:1,confirm:true}),200);assert.equal(restored.record.status,'draft');assert.equal(restored.record.revision,3);assert.equal(expect(await call(student,'/api/me/notices'),200).notices.length,0);
// Privacy messages are account-scoped, owner replies are delivered to that account's inbox.
const request=expect(await call(student,'/api/me/data-requests','POST',{kind:'access',message:'Please help with my account data.',confirm:true}),201);
assert.equal(expect(await call(other,'/api/me/data-requests'),200).requests.length,0);
expect(await call(admin,'/api/admin/privacy-requests'),403);
expect(await call(owner,'/api/admin/privacy-requests/'+request.receipt,'PATCH',{status:'verifying',reply:'Please verify your request.',revision:1}),200);
assert.equal(expect(await call(student,'/api/me/data-requests'),200).requests[0].reply,'Please verify your request.');
// Platform roles: verified accounts and at least one owner must remain.
expect(await call(owner,'/api/admin/roles/'+owner.id,'POST',{role:'owner',grant:false,confirm:true}),409);
expect(await call(owner,'/api/admin/roles/'+other.id,'POST',{role:'support',grant:true,confirm:true}),200);
expect(await call(other,'/api/admin/operations'),403);
// Ordered process templates have no fabricated application tracking.
const steps=[{id:'first',title:'Contact the office',instructions:'Ask for the next appointment.',dependsOn:[]}];
const process=expect(await call(admin,'/api/orgs/'+org+'/processes','POST',{title:'First appointment',status:'published',steps}),201);
assert.equal(expect(await call(student,'/api/me/orgs/'+org+'/processes'),200).processes.length,1);
expect(await call(other,'/api/me/orgs/'+org+'/processes'),403);
expect(await call(admin,'/api/orgs/'+org+'/processes/'+process.id,'PATCH',{title:'Bad order',status:'draft',revision:1,steps:[{...steps[0],dependsOn:['later']}]}),400);
// Entitlements remain disabled; revisions, expiry and admission are real atomic SQL.
const {DEFAULT_PLANS,admitAccount,accountPlan}=await import('../workers/accounts/entitlements.mjs');
let access=expect(await call(owner,'/api/admin/entitlements'),200);assert.equal(access.enabled,false);assert.equal(access.billingEnabled,false);
const plans=structuredClone(DEFAULT_PLANS);plans.free.dailyMessages=2;plans.plus.dailyMessages=3;plans.premium.dailyMessages=4;
expect(await call(owner,'/api/admin/entitlements','POST',{plans,revision:0,confirm:true}),200);
expect(await call(owner,'/api/admin/entitlements','POST',{plans,revision:0,confirm:true}),409);
assert.equal((await accountPlan(env,student.id)).active,false);env.ENTITLEMENTS_ENABLED='1';
const admits=await Promise.all(Array.from({length:5},()=>admitAccount(env,student.id,new Date(stamp))));assert.equal(admits.filter(a=>a.allowed).length,2);
expect(await call(owner,'/api/admin/entitlements/'+student.id,'POST',{tier:'premium',expiresAt:stamp+60000,revision:0,confirm:true}),200);
assert.equal((await accountPlan(env,student.id,{now:stamp})).tier,'premium');assert.equal((await accountPlan(env,student.id,{now:stamp+60001})).tier,'free');
assert.equal((await admitAccount(env,student.id,new Date(stamp+864e5))).allowed,true);
console.log('Restored operations: real authenticated sessions, partner approval, support consent withdrawal, scoped notices/privacy, history, roles, processes, account limits and expiry passed.');

for(const route of ['guide-packages','draft-guide','guide-document','directory','processes']){const method=['draft-guide','guide-document'].includes(route)?'POST':'GET';expect(await call(other,'/api/orgs/'+org+'/'+route,method,method==='POST'?{}:undefined),403)}
expect(await call(student,'/api/orgs/'+org+'/guide-packages'),403);

const oldStamp=stamp;stamp+=901000;expect(await call(owner,'/api/admin/roles/'+other.id,'POST',{role:'engineering',grant:true,confirm:true}),403);expect(await call(owner,'/api/admin/entitlements','POST',{plans,revision:1,confirm:true}),403);stamp=oldStamp;
