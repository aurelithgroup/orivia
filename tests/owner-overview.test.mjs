/* Founder overview and owner directory (ORI-OWNER-001/002/007/009). Real Better Auth sessions, real SQLite for the
   accounts and budget databases. Checks exact counts, definitions, authoritative budgets or "unavailable", search,
   and refusal for students, staff and signed-out visitors. Run: node --experimental-sqlite tests/owner-overview.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
import {OVERVIEW_DEFINITIONS} from '../workers/accounts/owner-overview.mjs';
const wrap=sql=>{const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','feedback'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
const budget=new DatabaseSync(':memory:');
const T=Date.parse('2026-10-22T15:00:00Z'),day='2026-10-22',month='2026-10';
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-owner-overview-secret-1234567890',ACCOUNTS_DB:wrap(sql),BUDGET_DB:wrap(budget),
 ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email in tests')}},ORGANISATIONS_ENABLED:'1',
 PILOT_OPENAI_DAY_USD:'5',PILOT_OPENAI_MONTH_USD:'20',SEARCH_DAILY_CAP:'10',SEARCH_MONTHLY_CAP:'100',SEARCH_POOL:'pilot'};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
async function call(who,path,method='GET',body){const r=await handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),...(who?{Cookie:who.cookie,'X-Orivia-Account':who.id}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{},{auth,organisationOptions:{now:()=>T}});return {status:r.status,data:await r.json()}}
async function signIn(name){const address=name+"@northbay.example";const sent=await call(null,'/api/auth/email-otp/send-verification-otp','POST',{email:address,type:"sign-in"});if(!outbox.length)throw Error("send failed "+JSON.stringify(sent));const response=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip)},body:JSON.stringify({email:address,otp:outbox.at(-1).otp})}),env,{},{auth});assert.equal(response.status,200);const data=await response.json();return {id:data.user.id,email:address,cookie:response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const owner=await signIn('owner'),admin=await signIn('mariam'),student=await signIn('aisha'),other=await signIn('omar');
sql.prepare('INSERT INTO platform_roles(user_id,role) VALUES (?,?)').run(owner.id,'owner');
// Two organisations through the real API, then known records.
let r=await call(owner,'/api/admin/orgs','POST',{name:'Northbay University',slug:'northbay',city:'Sharjah',demo:true});assert.equal(r.status,201);const nb=r.data.organisation.id;
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

// Refusals: signed out, a student, an organisation admin and a non-member get nothing.
assert.equal((await call(null,'/api/admin/overview')).status,401);
for(const who of [student,admin,other])assert.equal((await call(who,'/api/admin/overview')).status,403,'only owners see the overview');
for(const who of [student,admin])assert.equal((await call(who,'/api/admin/orgs?q=north')).status,403);

// Owner: exact counts with a definition for each.
r=await call(owner,'/api/admin/overview');assert.equal(r.status,200,JSON.stringify(r.data));const c=r.data.counts;
assert.deepEqual(c.organisations,{total:2,active:2,paused:0,demo:2});
assert.equal(c.activeStudents,2,'per-organisation memberships (one person in two organisations counts twice)');
assert.equal(c.activeStaff,1);assert.equal(c.joinRequests,1);assert.equal(c.openInvitations,1,'expired and revoked excluded');
assert.equal(c.publishedContent,3);assert.equal(c.draftContent,1);assert.equal(c.feedbackOpen,1);
for(const k of Object.keys(c))assert.ok(r.data.definitions[k]&&OVERVIEW_DEFINITIONS[k],'definition for '+k);
// Budgets: authoritative meters, or unavailable. Never a guess.
const b=Object.fromEntries(r.data.budgets.map(x=>[x.id,x]));
assert.deepEqual([b.openai.status,b.openai.day.used,b.openai.day.limit,b.openai.month.used,b.openai.month.limit],['available',1.5,5,7.25,20]);
assert.match(b.openai.scope,/pilot and myorivia\.app count against the same limit/);
assert.deepEqual([b.search.day.used,b.search.month.used],[4,37],'this deployment’s pool only');
assert.equal(b.voice.status,'unavailable','voice off here');assert.equal(b.email.status,'unavailable','no email limit configured here');
assert.equal(b.voice.day,undefined,'unavailable shows no numbers');
// Privacy: no names, emails, chats, files or progress in the overview or directory.
const all=JSON.stringify(r.data)+JSON.stringify((await call(owner,'/api/admin/orgs')).data);
assert.doesNotMatch(all,/northbay\.example|aisha|mariam|omar|"Body |progress|vault|turns/i);

// Directory: search and per-organisation totals; management links use the slug.
r=await call(owner,'/api/admin/orgs?q=manch');assert.equal(r.data.organisations.length,1);assert.equal(r.data.organisations[0].slug,'riverside');
r=await call(owner,'/api/admin/orgs?q=North');const n=r.data.organisations[0];
assert.deepEqual(n.totals,{students:1,staff:1,requests:1,published:2,drafts:1});assert.equal(n.adminActive,true);
assert.equal((await call(owner,'/api/admin/orgs?q=%25')).data.organisations.length,0,'% is literal, not a wildcard');
assert.equal((await call(owner,'/api/admin/orgs')).data.organisations.length,2);

// Missing sources are Unavailable, never 0.
budget.exec('DROP TABLE spend_meter');sql.exec('DROP TABLE feedback_reports');
r=await call(owner,'/api/admin/overview');assert.equal(r.status,200);
assert.equal(r.data.counts.feedbackOpen,null);assert.equal(r.data.budgets.find(x=>x.id==='openai').status,'unavailable');
// Owner UI reads the real endpoints and explains Unavailable.
const ui=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8');
assert.ok(ui.includes("api('/api/admin/overview')")&&ui.includes("'/api/admin/orgs?q='")&&ui.includes('Unavailable'));
console.log('Owner overview: exact defined counts, authoritative budgets or Unavailable, search, privacy, and refusal for students, staff and visitors: pass.');
