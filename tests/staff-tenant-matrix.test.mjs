/* Data separation across every staff endpoint and export (ORI-UNI-012, ORI-SEC-001, ORI-AUTH-007, ORI-OWNER-015).
   Real Better Auth sessions and SQLite. Every /api/orgs/:id route is called by people who must not reach it: staff of
   another organisation (both through the other organisation's id and by putting the other organisation's object ids
   under their own organisation), students, the platform owner, and signed-out callers. Organisation B's rows must be
   byte-for-byte unchanged afterwards. Run: node --experimental-sqlite tests/staff-tenant-matrix.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
const wrap=sql=>{const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','feedback','platform-audit'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
sql.exec("CREATE TABLE IF NOT EXISTS organisation_progress(org_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, content_id TEXT NOT NULL, done_at INTEGER NOT NULL, PRIMARY KEY(org_id,user_id,content_id))");
const T=Date.now(); // real time: admin changes need a sign-in within 15 minutes
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-tenant-matrix-secret-1234567890',ACCOUNTS_DB:wrap(sql),
 ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email in tests')}},ORGANISATIONS_ENABLED:'1'};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
async function call(who,path,method='GET',body,extra={}){const r=await handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip%250),...(who?{Cookie:who.cookie,'X-Orivia-Account':who.id}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{},{auth,organisationOptions:{now:()=>T}});const text=await r.text();let data=null;try{data=JSON.parse(text)}catch(_){data=text}return {status:r.status,data}}
async function signIn(name,domain='northbay.example'){const address=name+'@'+domain;await call(null,'/api/auth/email-otp/send-verification-otp','POST',{email:address,type:'sign-in'});const response=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'198.51.100.'+(++ip%250)},body:JSON.stringify({email:address,otp:outbox.at(-1).otp})}),env,{},{auth});assert.equal(response.status,200);const data=await response.json();return {id:data.user.id,email:address,cookie:response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const owner=await signIn('owner','orivia.example'),adminA=await signIn('mariam'),editorA=await signIn('eda'),studentA=await signIn('aisha'),adminB=await signIn('ravi','riverside.example'),editorB=await signIn('bella','riverside.example'),studentB=await signIn('ben','riverside.example'),pendingB=await signIn('pat','riverside.example');
sql.prepare('INSERT INTO platform_roles(user_id,role) VALUES (?,?)').run(owner.id,'owner');
let r=await call(owner,'/api/admin/orgs','POST',{name:'Northbay University',slug:'northbay',city:'Dubai',demo:true});assert.equal(r.status,201);const A=r.data.organisation.id;
r=await call(owner,'/api/admin/orgs','POST',{name:'Riverside College',slug:'riverside',city:'Manchester',demo:true});const B=r.data.organisation.id;
const mem=(org,u,role,status='active')=>sql.prepare('INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(org,u.id,role,status,'req-'+u.id+org,T,T);
mem(A,adminA,'admin');mem(A,editorA,'editor');mem(A,studentA,'student');mem(B,adminB,'admin');mem(B,editorB,'editor');mem(B,studentB,'student');mem(B,pendingB,'student','requested');
// Organisation B's own objects, made through the real API by B's admin.
r=await call(adminB,'/api/orgs/'+B+'/content','POST',{kind:'guide',title:'Riverside deposit guide',body:'Members-only text',visibility:'members'});assert.equal(r.status,201,JSON.stringify(r.data));const bContent=r.data.content?.id||r.data.id;
r=await call(adminB,'/api/orgs/'+B+'/invitations','POST',{role:'student',label:'Riverside cohort'});assert.equal(r.status,201);const bInvite=r.data.invitation.id;
r=await call(adminB,'/api/orgs/'+B+'/content','POST',{kind:'guide',title:'Riverside public guide',body:'Public text',visibility:'public'});const bPublic=r.data.content?.id||r.data.id;
await call(adminB,'/api/orgs/'+B+'/content/'+bPublic,'PATCH',{revision:1,status:'published'});
r=await call(adminB,'/api/orgs/'+B+'/codes','POST',{label:'Poster',contentId:bPublic});assert.equal(r.status,201,JSON.stringify(r.data));const bCode=r.data.code.id;
sql.prepare("INSERT INTO organisation_progress VALUES (?,?,?,1)").run(B,studentB.id,bContent);
r=await call(adminB,'/api/orgs/'+B+'/settings');r=await call(adminB,'/api/orgs/'+B+'/settings','PATCH',{revision:r.data.revision,settings:{studentContact:{label:'Riverside student hub',email:'hub@riverside.example'}}});assert.equal(r.status,200,JSON.stringify(r.data));
const snapshot=()=>JSON.stringify(['organisation_memberships','organisation_content','organisation_invitations','organisation_public_codes','organisation_progress','organisation_progress_private','organisation_arrivals','organisation_settings','organisations'].map(t=>{try{return sql.prepare('SELECT * FROM '+t+' WHERE '+(t==='organisations'?'id':'org_id')+'=? ORDER BY 1,2').all(B)}catch(e){return 'missing '+t}}));
const before=snapshot();assert.ok(!before.includes('missing'),before.slice(0,200));
// Every staff route, with the methods it answers. {o} is the organisation in the path; objects are B's.
const routes=o=>[['GET',`/api/orgs/${o}/summary`],['GET',`/api/orgs/${o}/progress`],['GET',`/api/orgs/${o}/arrival`],['PATCH',`/api/orgs/${o}/arrival`,{country:'uk',region:'x',town:'y',reason:'study',revision:0}],
 ['GET',`/api/orgs/${o}/invitations`],['POST',`/api/orgs/${o}/invitations`,{role:'student',label:'stolen'}],['POST',`/api/orgs/${o}/invitations/${bInvite}/revoke`,{}],
 ['GET',`/api/orgs/${o}/members`],['DELETE',`/api/orgs/${o}/members/${studentB.id}`,{}],['POST',`/api/orgs/${o}/members/${studentB.id}/reinstate`,{confirm:'allow new join request'}],['POST',`/api/orgs/${o}/members/${editorB.id}/role`,{role:'admin',expectedRole:'editor',confirm:'change organisation role'}],
 ['POST',`/api/orgs/${o}/requests/${pendingB.id}/decision`,{decision:'approve'}],
 ['GET',`/api/orgs/${o}/content`],['POST',`/api/orgs/${o}/content`,{kind:'guide',title:'x',body:'y',visibility:'members'}],['PATCH',`/api/orgs/${o}/content/${bContent}`,{revision:1,title:'hijacked',status:'published'}],['DELETE',`/api/orgs/${o}/content/${bContent}`,{}],
 ['GET',`/api/orgs/${o}/codes`],['POST',`/api/orgs/${o}/codes`,{label:'x',contentId:bPublic}],['GET',`/api/orgs/${o}/codes/${bCode}`],['POST',`/api/orgs/${o}/codes/${bCode}/revoke`,{}],['GET',`/api/orgs/${o}/records`],['GET',`/api/orgs/${o}/settings`],['PATCH',`/api/orgs/${o}/settings`,{revision:0,settings:{exports:{editorsMayExportCounts:true}}}],['GET',`/api/orgs/${o}/audit`],['GET',`/api/orgs/${o}/export/counts.csv`]];
const leaks=res=>JSON.stringify(res.data||'').match(/Members-only text|ben@riverside|bella@riverside|pat@riverside|Riverside deposit guide/);
let checked=0;
async function refuse(who,label,o){for(const [m,p,b] of routes(o)){const res=await call(who,p,m,b);checked++;
 assert.ok([401,403,404,405].includes(res.status),label+' '+m+' '+p+' → '+res.status+' '+JSON.stringify(res.data).slice(0,160));assert.ok(!leaks(res),label+' '+m+' '+p+' leaked B data')}}
await refuse(adminA,'admin of A on B',B);
await refuse(editorA,'editor of A on B',B);
await refuse(studentB,'student of B on B',B);
await refuse(pendingB,'pending student of B',B);
await refuse(studentA,'student of A on B',B);
await refuse(owner,'platform owner on B (not organisation staff)',B);
await refuse(null,'signed out',B);
// Object substitution: A's admin keeps their own organisation in the path but names B's objects.
const subst=[];for(const [m,p,b] of routes(A).filter(([,p])=>/\/(invitations|members|requests|content|codes)\/[^/]+/.test(p))){const res=await call(adminA,p,m,b);checked++;subst.push(m+' '+p.replace(A,'A').replace(/\/[^/]{20,}/g,'/<B obj>')+' '+res.status);
 assert.ok([403,404,409].includes(res.status),'A admin with B object '+m+' '+p+' → '+res.status+' '+JSON.stringify(res.data).slice(0,160));assert.ok(!leaks(res))}
if(process.env.SHOW)console.log(subst.join('\n'));
// Cross-site request with a valid session is refused.
assert.equal((await call(adminB,`/api/orgs/${B}/content/${bContent}`,'PATCH',{revision:1,title:'csrf'},{Origin:'https://evil.example'})).status,403);
// A session for one account can't be used with another account's header.
assert.ok([401,403].includes((await call({...adminB,id:adminA.id},`/api/orgs/${A}/members`)).status),'account header must match the session');
assert.equal(snapshot(),before,'organisation B unchanged after every attempt');
// Owner-only routes and the export: refused to every organisation role, including a university-domain admin.
for(const who of [adminA,adminB,editorA,studentA,null])for(const [m,p] of [['GET','/api/admin/overview'],['GET','/api/admin/orgs'],['GET','/api/admin/export/organisations.csv'],['POST','/api/admin/orgs'],['POST',`/api/admin/orgs/${B}/admin-invite`]]){
 const res=await call(who,p,m,m==='POST'?{name:'x',slug:'x-'+checked,city:'y',demo:true,recipientEmail:'a@b.example'}:undefined);checked++;assert.ok([401,403].includes(res.status),(who?.email||'anon')+' '+m+' '+p+' → '+res.status)}
// The owner's own views don't expose member identities or content (ORI-OWNER-015): no browse-everything route.
const ov=await call(owner,'/api/admin/overview');assert.equal(ov.status,200);assert.ok(!/ben@|bella@|pat@|aisha@|Members-only text/.test(JSON.stringify(ov.data)),'overview carries no identities or private content');
const csv=await call(owner,'/api/admin/export/organisations.csv');assert.equal(csv.status,200);assert.ok(!/@|Members-only/.test(String(csv.data)),'export has organisations only');
// B's own staff still work (the refusals above are not a blanket outage).
assert.equal((await call(adminB,`/api/orgs/${B}/members`)).status,200);assert.equal((await call(editorB,`/api/orgs/${B}/content`)).status,200);
console.log(`Staff tenant matrix: ${checked} hostile calls across every staff route and the owner export; other-organisation staff, students, pending members, the platform owner and signed-out callers refused; object substitution refused; organisation B unchanged: pass.`);
