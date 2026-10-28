/* Leaving a university (ORI-STUDENT-008). Real Better Auth sessions and SQLite. Run: node --experimental-sqlite tests/leave-organisation.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
import {readOrgContext} from '../workers/accounts/handler.mjs';
const wrap=sql=>{const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','feedback','platform-audit'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
const budget=new DatabaseSync(':memory:');
const T=Date.parse('2026-10-22T15:00:00Z'),day='2026-10-22',month='2026-10';
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-owner-overview-secret-1234567890',ACCOUNTS_DB:wrap(sql),BUDGET_DB:wrap(budget),
 ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email in tests')}},ORGANISATIONS_ENABLED:'1',
 PILOT_OPENAI_DAY_USD:'5',PILOT_OPENAI_MONTH_USD:'20',SEARCH_DAILY_CAP:'10',SEARCH_MONTHLY_CAP:'100',SEARCH_POOL:'pilot'};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
async function call(who,path,method='GET',body){const r=await handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),...(who?{Cookie:who.cookie,'X-Orivia-Account':who.id}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{},{auth,organisationOptions:{now:()=>T}});return {status:r.status,data:await r.json()}}
async function signIn(name){const address=name+"@northbay.example";const sent=await call(null,'/api/auth/email-otp/send-verification-otp','POST',{email:address,type:"sign-in"});if(!outbox.length)throw Error("send failed "+JSON.stringify(sent));const response=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip)},body:JSON.stringify({email:address,otp:outbox.at(-1).otp})}),env,{},{auth});assert.equal(response.status,200);const data=await response.json();return {id:data.user.id,email:address,cookie:response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const owner=await signIn('owner'),admin=await signIn('mariam'),student=await signIn('aisha'),other=await signIn('omar'),admin2=await signIn('daniel');
sql.prepare('INSERT INTO platform_roles(user_id,role) VALUES (?,?)').run(owner.id,'owner');
// Two organisations through the real API, then known records.
let r=await call(owner,'/api/admin/orgs','POST',{name:'Northbay University',slug:'northbay',city:'Dubai',demo:true});assert.equal(r.status,201);const nb=r.data.organisation.id;
r=await call(owner,'/api/admin/orgs','POST',{name:'Riverside College',slug:'riverside',city:'Manchester',demo:true});const rv=r.data.organisation.id;
const mem=(org,u,role,status)=>sql.prepare('INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(org,u,role,status,'req-'+u+org,T,T);
mem(nb,admin.id,'admin','active');mem(nb,student.id,'student','active');mem(nb,other.id,'student','requested');mem(rv,student.id,'student','active');
const content=(org,kind,status,i)=>sql.prepare("INSERT INTO organisation_content(id,org_id,kind,title,body,visibility,status,revision,updated_at) VALUES (?,?,?,?,?,'members',?,1,?)").run('c'+i,org,kind,'Item '+i,'Body '+i,status,T);
content(nb,'guide','published',1);content(nb,'date','published',2);content(nb,'guide','draft',3);content(rv,'contact','published',4);
sql.prepare("INSERT INTO organisation_invitations(id,org_id,token_hash,role,recipient_email,label,expires_at,revoked,max_uses,uses,created_at) VALUES ('i1',?,'h1','student',NULL,'Open',?,0,50,3,?),('i2',?,'h2','student',NULL,'Expired',?,0,50,0,?),('i3',?,'h3','student',NULL,'Revoked',?,1,50,0,?)").run(nb,T+86400000,T,nb,T-1,T,nb,T+86400000,T);
sql.prepare("INSERT INTO feedback_reports(id,user_id,request_id,category,note,status,created_at,updated_at) VALUES ('f1',?,'r1','technical','n','open',?,?),('f2',?,'r2','other',NULL,'reviewed',?,?)").run(student.id,T,T,student.id,T,T);
budget.exec("CREATE TABLE spend_meter (id TEXT PRIMARY KEY, month TEXT NOT NULL, month_amount INTEGER NOT NULL, day TEXT NOT NULL, day_amount INTEGER NOT NULL);CREATE TABLE research_usage (period TEXT PRIMARY KEY, calls INTEGER NOT NULL)");
budget.prepare('INSERT INTO spend_meter VALUES (?,?,?,?,?)').run('openai',month,7250000,day,1500000);
budget.prepare('INSERT INTO research_usage VALUES (?,?),(?,?),(?,?)').run('pilot:day:'+day,4,'pilot:month:'+month,37,'day:'+day,9);

// Leaving a university (ORI-STUDENT-008).
const leave=(who,body={confirm:'leave'})=>call(who,'/api/orgs/'.replace('orgs','me/orgs')+nb+'/leave','POST',body);
sql.prepare("CREATE TABLE IF NOT EXISTS organisation_progress(org_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, content_id TEXT NOT NULL, done_at INTEGER NOT NULL, PRIMARY KEY(org_id,user_id,content_id))").run();
sql.prepare("INSERT INTO organisation_progress VALUES (?,?,'c1',1),(?,?,'c2',1)").run(nb,student.id,nb,student.id);
// Before: the student reads the space and a members-only guide can feed Chat.
assert.equal((await call(student,'/api/me/orgs/'+nb)).status,200);
const ctxReq=who=>new Request(origin+'/v1/chat',{headers:{Cookie:who.cookie}});
assert.ok(await readOrgContext(ctxReq(student),env,{org:nb,content:'c1'},{auth}),'guide available to a member');
// Confirmation and the account header are required.
assert.equal((await leave(student,{})).status,400);
assert.equal((await handleAccountRequest(new Request(origin+'/api/me/orgs/'+nb+'/leave',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:student.cookie},body:JSON.stringify({confirm:'leave'})}),env,{},{auth,organisationOptions:{now:()=>T}})).status,409,'no account header, no change');
// Leave: access ends at once; Done marks for this organisation removed; audited.
r=await leave(student);assert.equal(r.status,200);assert.equal(r.data.status,'left');
assert.equal(sql.prepare('SELECT status FROM organisation_memberships WHERE org_id=? AND user_id=?').get(nb,student.id).status,'left');
assert.equal((await call(student,'/api/me/orgs/'+nb)).status,403,'space closed');
assert.equal(await readOrgContext(ctxReq(student),env,{org:nb,content:'c1'},{auth}),null,'members-only guide no longer reaches Chat');
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM organisation_progress WHERE org_id=? AND user_id=?').get(nb,student.id).n,0);
assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM organisation_audit WHERE org_id=? AND action='membership.left' AND actor_id=?").get(nb,student.id).n,1);
assert.equal((await call(student,'/api/me/memberships')).data.memberships.filter(m=>m.organisationId===nb).length,0,'no longer listed');
assert.equal((await call(student,'/api/me/orgs/'+rv)).status,200,'other memberships unaffected');
assert.equal((await leave(student)).status,404,'nothing left to leave');
// A pending request can be withdrawn the same way.
assert.equal((await leave(other)).status,200);assert.equal(sql.prepare('SELECT status FROM organisation_memberships WHERE org_id=? AND user_id=?').get(nb,other.id).status,'left');
// The only admin must hand over first; with a second admin, they can leave.
r=await leave(admin);assert.equal(r.status,409);assert.equal(r.data.error,'transfer_organisation_admin_first');
mem(nb,admin2.id,'admin','active');assert.equal((await leave(admin)).status,200);
// Someone who never belonged can't use it.
assert.equal((await call(owner,'/api/me/orgs/'+nb+'/leave','POST',{confirm:'leave'})).status,404);
console.log('Leaving: confirmed, audited, access and Chat context end at once, Done marks removed, pending requests withdrawable, sole admin protected: pass.');