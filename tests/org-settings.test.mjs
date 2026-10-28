/* Institution administration (ORI-UNI-015): settings, activity history and the counts export. Real Better Auth sessions
   and SQLite. A settings change must not grant consent retroactively, widen student data access or bypass platform caps:
   every other table is byte-identical after each change. Run: node --experimental-sqlite tests/org-settings.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
const wrap=sql=>{const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','feedback','platform-audit','notifications'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
let T=Date.now();
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-org-settings-secret-1234567890',ACCOUNTS_DB:wrap(sql),
 ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email in tests')}},ORGANISATIONS_ENABLED:'1'};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
async function call(who,path,method='GET',body){const r=await handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip%250),...(who?{Cookie:who.cookie,'X-Orivia-Account':who.id}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{},{auth,organisationOptions:{now:()=>T}});const text=await r.text();let data;try{data=JSON.parse(text)}catch(_){data=text}return {status:r.status,data,headers:r.headers}}
async function signIn(name,domain='northbay.example'){const address=name+'@'+domain;await call(null,'/api/auth/email-otp/send-verification-otp','POST',{email:address,type:'sign-in'});const response=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'198.51.100.'+(++ip%250)},body:JSON.stringify({email:address,otp:outbox.at(-1).otp})}),env,{},{auth});assert.equal(response.status,200);const data=await response.json();return {id:data.user.id,email:address,cookie:response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const owner=await signIn('owner','orivia.example'),admin=await signIn('mariam'),editor=await signIn('eda'),student=await signIn('aisha'),otherAdmin=await signIn('ravi','riverside.example'),old=await signIn('former');
sql.prepare('INSERT INTO platform_roles(user_id,role) VALUES (?,?)').run(owner.id,'owner');
let r=await call(owner,'/api/admin/orgs','POST',{name:'=Northbay University',slug:'northbay',city:'Dubai',demo:true});const A=r.data.organisation.id;
r=await call(owner,'/api/admin/orgs','POST',{name:'Riverside College',slug:'riverside',city:'Manchester',demo:true});const B=r.data.organisation.id;
const mem=(org,u,role,status='active',at=T)=>sql.prepare('INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(org,u.id,role,status,'req-'+u.id+org,at,at);
mem(A,admin,'admin');mem(A,editor,'editor');mem(A,student,'student');mem(B,otherAdmin,'admin');mem(A,old,'student','removed',T-60*86400000);
await call(student,'/api/me/orgs/'+A+'/progress','POST',{contentId:'x',done:true}).catch(()=>{});
const others=()=>JSON.stringify(sql.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('organisation_settings','organisation_audit','session','rateLimit','verification') ORDER BY name").all().map(t=>[t.name,sql.prepare('SELECT * FROM "'+t.name+'"').all()]));
// Reading: admins and editors; students and other organisations refused.
r=await call(admin,'/api/orgs/'+A+'/settings');assert.equal(r.status,200);assert.equal(r.data.revision,0);assert.equal(r.data.canEdit,true);assert.deepEqual(r.data.settings.alerts,{updates:false,dates:false},'alerts start off');
assert.deepEqual(r.data.staff.map(s=>s.role).sort(),['admin','editor']);
assert.equal((await call(editor,'/api/orgs/'+A+'/settings')).data.canEdit,false);
for(const who of [student,otherAdmin,owner,null])assert.ok([401,403].includes((await call(who,'/api/orgs/'+A+'/settings')).status));
// Changing: admins only, recently signed in, unknown fields refused (records, caps, progress reporting, roles).
const patch=(who,settings,revision=0)=>call(who,'/api/orgs/'+A+'/settings','PATCH',{revision,settings});
assert.equal((await patch(editor,{alerts:{updates:true}})).status,403,'editors can’t change settings');
for(const bad of [{records:true},{applicationRecords:{enabled:true}},{progress:{minimum:1}},{caps:{maxUses:100000}},{alerts:{updates:true,everything:true}},{exports:{editorsMayExportCounts:true,members:true}},{owners:{guides:student.id}},{owners:{guides:otherAdmin.id}},{retention:{formerMembersDays:1}},{studentContact:{label:'Help'}},{studentContact:{label:'Help',email:'not-an-email'}},{alerts:{updates:'yes'}}]){
 const before=others();const res=await patch(admin,bad);assert.equal(res.status,400,JSON.stringify(bad)+' → '+res.status);assert.equal(others(),before)}
T+=20*60000;assert.equal((await patch(admin,{alerts:{updates:true}})).data.error,'recent_sign_in_required');T-=20*60000;
// A real change: nothing outside the settings moves (no student's notification choices, memberships, caps or progress).
let before=others();r=await patch(admin,{alerts:{updates:true,dates:true},studentContact:{label:'Student Hub',email:'hub@northbay.example',phone:'+971 4 555 1234'},owners:{guides:editor.id,members:admin.id},exports:{editorsMayExportCounts:false},retention:{formerMembersDays:90}});
assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.revision,1);assert.equal(others(),before,'settings never change anything else');
assert.equal((await patch(admin,{alerts:{updates:false}},0)).status,409,'a stale revision is refused');
// Students see who to contact; nothing else from the settings.
r=await call(student,'/api/me/orgs/'+A);assert.deepEqual(r.data.studentContact,{label:'Student Hub',email:'hub@northbay.example',phone:'+971 4 555 1234'});assert.ok(!('owners' in r.data)&&!JSON.stringify(r.data).includes(editor.id));
// Export: aggregate counts only. Editors need the organisation's permission, and it never opens member identities.
assert.equal((await call(editor,'/api/orgs/'+A+'/export/counts.csv')).status,403);
r=await call(admin,'/api/orgs/'+A+'/export/counts.csv');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/csv/);
assert.ok(!/@|aisha|mariam|former/i.test(r.data)&&!r.data.includes(student.id),'no identities in the export');assert.match(r.data,/^﻿?organisation,group,detail,count/);assert.ok(r.data.includes("'=Northbay University"),'formula-safe');
assert.match(r.data,/people,student active,1/);
r=await patch(admin,{exports:{editorsMayExportCounts:true}},1);assert.equal(r.status,200);
assert.equal((await call(editor,'/api/orgs/'+A+'/export/counts.csv')).status,200,'allowed now');assert.equal((await call(editor,'/api/orgs/'+A+'/members')).status,403,'but still no member list');
assert.equal((await call(editor,'/api/orgs/'+A+'/records')).status,403);
// Retention: a member removed 60 days ago is listed under 90 days, not under 30.
const listed=async()=>(await call(admin,'/api/orgs/'+A+'/members')).data.members.some(m=>m.userId===old.id);
assert.equal(await listed(),true);r=await patch(admin,{retention:{formerMembersDays:30}},2);assert.equal(r.status,200);assert.equal(await listed(),false);
assert.equal(sql.prepare('SELECT status FROM organisation_memberships WHERE user_id=?').get(old.id).status,'removed','display only: the record is unchanged');
// Activity history: admins only; settings changes name the areas changed, never the values; student actions are anonymous.
assert.equal((await call(editor,'/api/orgs/'+A+'/audit')).status,403);
r=await call(admin,'/api/orgs/'+A+'/audit');assert.equal(r.status,200);const settingsLines=r.data.entries.filter(e=>e.action==='settings.updated');
assert.equal(settingsLines.length,3);assert.deepEqual(settingsLines.at(-1).areas,['alerts','studentContact','owners']);assert.ok(settingsLines.every(e=>e.actor&&e.actor!=='A student'),'staff changes name the staff member');
assert.ok(!JSON.stringify(r.data).includes('hub@northbay')&&!JSON.stringify(r.data).includes('+971'),'values are not copied into history');
assert.ok(r.data.entries.some(e=>e.action==='export.counts'));
// Nothing in settings reached the other organisation.
assert.equal((await call(otherAdmin,'/api/orgs/'+B+'/settings')).data.revision,0);
console.log('Institution settings: staff read, admins change with a recent sign-in and revision check; unknown fields (records, caps, progress) refused; nothing else in the database changes; aggregate export with editor permission; retention is display-only; activity history names areas, not values: pass.');
