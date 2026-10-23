/* University overview action queue (ORI-UNI-001). Real Better Auth sessions and SQLite. Run: node --experimental-sqlite tests/university-overview.test.mjs */
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
const owner=await signIn('owner'),admin=await signIn('mariam'),student=await signIn('aisha'),other=await signIn('omar'),editorUser=await signIn('daniel');
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

// University overview action queue (Ina priority 3): real records, this organisation only, each with its workflow.
const today=new Date(T).toISOString().slice(0,10),inDays=k=>new Date(T+k*86400000).toISOString().slice(0,10);
const det=(o)=>JSON.stringify(o);
const add=(org,id,kind,status,details)=>sql.prepare("INSERT INTO organisation_content(id,org_id,kind,title,body,details,visibility,status,revision,updated_at) VALUES (?,?,?,?,?,?,'members',?,1,?)").run(id,org,kind,'T-'+id,'B',details?det(details):null,status,T);
for(const [id,kind,status,d] of [['g-draft','guide','draft'],['d-past','date','published',{date:inDays(-2)}],['d-today','date','published',{date:today}],['d-soon','date','published',{date:inDays(5),time:'09:00',timeZone:'Asia/Dubai'}],['d-far','date','published',{date:inDays(40)}],['d-none','date','published'],['k-empty','contact','published'],['k-ok','contact','published',{phone:'+971 6 555 0100'}],['d-draftpast','date','draft',{date:inDays(-9)}]])add(nb,id,kind,status,d);
add(rv,'other-draft','guide','draft');add(rv,'other-past','date','published',{date:inDays(-1)});
mem(nb,editorUser.id,'editor','active');
const tasksFor=async who=>{const r=await call(who,'/api/orgs/'+nb+'/summary');return {status:r.status,t:r.data.tasks}};
let {status,t}=await tasksFor(admin);assert.equal(status,200);
assert.equal(t.pendingJoins,1);
assert.deepEqual(t.drafts.items.map(x=>x.id).sort(),['c3','d-draftpast','g-draft'],'setup draft c3 plus two');assert.equal(t.drafts.total,3);
assert.deepEqual(t.pastDates.map(x=>x.id),['d-past'],'published and past only; drafts are listed as drafts');
assert.deepEqual(t.upcomingDates.map(x=>x.id),['d-today','d-soon'],'today counts as upcoming; 40 days out is not listed');
assert.equal(t.upcomingDates[1].time,'09:00');
assert.deepEqual(t.datesWithoutDate.map(x=>x.id).sort(),['c2','d-none'],'setup date c2 has no date either');
assert.deepEqual(t.contactsMissingDetails.map(x=>x.id),['k-empty']);assert.equal(t.publishedContacts,2);
assert.doesNotMatch(JSON.stringify(t),/other-|northbay.example|"B"/,'only this organisation; titles and ids, no bodies or people');
// Editors see the queue (they cannot approve joins; the UI says so); students and outsiders are refused.
assert.equal((await tasksFor(editorUser)).status,200);
assert.equal((await tasksFor(student)).status,403);assert.equal((await tasksFor(other)).status,403);assert.equal((await call(null,'/api/orgs/'+nb+'/summary')).status,401);
// Empty organisation: nothing to do, and the suggestion to publish a contact.
const e=(await call(owner,'/api/admin/orgs','POST',{name:'Empty College',slug:'empty-college',city:'Leeds',demo:true})).data.organisation.id;mem(e,admin.id,'admin','active');
const et=(await call(admin,'/api/orgs/'+e+'/summary')).data.tasks;
assert.deepEqual([et.pendingJoins,et.drafts.total,et.pastDates.length,et.upcomingDates.length,et.contactsMissingDetails.length,et.publishedContacts],[0,0,0,0,0,0]);
// The dashboard turns each item into a link to its workflow.
const ui=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8');
for(const piece of ["btn('Review requests',goTo('members'))","goTo('guides',c.id)","goTo('guides',d.id)","id:'content-'+c.id",'Nothing needs attention','Only admins can approve join requests.'])assert.ok(ui.includes(piece),piece);
// Regression (found by the browser check): the admin Members tab threw because of "constreq=" (strict mode). Guard UI
// sources against a declaration keyword glued to its name.
for(const file of ['workers/accounts/platform-ui.mjs','workers/trial-ui/chat.js','workers/trial-ui/spaces.js','workers/trial-ui/nav.js','workers/trial-ui/accounts.js','workers/trial-ui/files.js']){const src=fs.readFileSync(file,'utf8');assert.equal(src.match(/(^|[^\w$.'"-])(const|let|var)(?=[a-z_$][\w$]*\s*=[^=>])/g),null,'glued declaration in '+file)}
assert.ok(ui.includes('const req=list.filter('));
console.log('University overview: joins, drafts, past/undated/upcoming dates and contacts missing details from this organisation only; staff allowed, students and outsiders refused: pass.');
