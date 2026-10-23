/* Chat with a university guide (21 Oct). Server: only an active member gets a published item of that organisation, re-read
 * each message. Assistant: a university instruction is its own kind of source and never backs an official rule; it isn't kept
 * in chat memory. Page: removable label, ids only in the request, cleared when the server says it's unavailable.
 * Run: node --experimental-sqlite tests/university-chat.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {verifyReply,CLAIM_SOURCES,runAssistantTurn} from '../workers/orivia-assistant.mjs';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest,readOrgContext} from '../workers/accounts/handler.mjs';

// 1. Answer check: university instructions cite university evidence only, and can't stand in for government rules.
const ledger=[{id:'E1',url:'https://myorivia.app/app/space/org-1#org-item-g1',title:'Northbay University: Arrival guide',kind:'university',excerpt:'Book your visa medical through Student Services by 12 November. Bring your passport and two photos.'},
 {id:'E2',url:'https://u.ae/en/residents/visa',title:'Residence visa',kind:'government',excerpt:'A medical fitness test is required for a residence visa.'}];
assert.deepEqual([...CLAIM_SOURCES.university_instruction],['university']);
let v=verifyReply({sentences:[{text:'Northbay asks you to book your visa medical through Student Services by 12 November.',kind:'university_instruction',evidence:['E1']}]},ledger);assert.equal(v.ok,true,JSON.stringify(v.errors));
v=verifyReply({sentences:[{text:'A medical fitness test is required for a residence visa.',kind:'official_rule',evidence:['E1']}]},ledger);assert.equal(v.ok,false,'a university guide is not an official source');
v=verifyReply({sentences:[{text:'A medical fitness test is required for a residence visa.',kind:'official_rule',evidence:['E2']}]},ledger);assert.equal(v.ok,true);
v=verifyReply({sentences:[{text:'Northbay asks you to book by 15 November.',kind:'university_instruction',evidence:['E1']}]},ledger);assert.equal(v.ok,false,'dates must match the university text');

// 2. The assistant gets the item as labelled evidence and doesn't keep it in memory.
{let seen=null;const ai={run:async(_m,o)=>{seen=o.messages[1].content;return {response:JSON.stringify({action:'reply',sentences:[{text:'Northbay asks you to book your visa medical through Student Services by 12 November.',kind:'university_instruction',evidence:['E1']}]})}}};
 const out=await runAssistantTurn({messages:[{role:'user',content:'What do I need to do for the arrival guide?'}],orgContext:{orgId:'org-1',orgName:'Northbay University',contentId:'g1',title:'Arrival guide',body:'Book your visa medical through Student Services by 12 November. Bring your passport and two photos.',updatedAt:'2026-10-20T10:00:00.000Z',url:'https://myorivia.app/app/space/org-1#org-item-g1'}},{},{ai,reserve:async()=>true,fetcher:async()=>{throw Error('no web in this test')}});
 assert.match(seen,/university_context/);assert.match(seen,/Book your visa medical through Student Services/);
 assert.match(out.reply,/12 November/);assert.ok(out.liveSources.some(s=>s.category==='university'),'shown as a university source');
 const mem=JSON.stringify(out.research?.taskContext||{});assert.doesNotMatch(mem,/Bring your passport and two photos/,'university text is not kept in chat memory');}

// 3. Server read path with real sessions and SQL.
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+fs.readFileSync('workers/accounts/schema.sql','utf8')+fs.readFileSync('workers/accounts/organisations.sql','utf8'));
const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
const db={prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-university-chat-secret-1234567890',ACCOUNTS_DB:db,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email')}},ORGANISATIONS_ENABLED:'1'};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
async function signIn(name){const email=name+'@uni.example';let r=await handleAccountRequest(new Request(origin+'/api/auth/email-otp/send-verification-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'198.51.100.'+(++ip)},body:JSON.stringify({email,type:'sign-in'})}),env,{}, {auth});assert.equal(r.status,200);
 r=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'198.51.100.'+(++ip)},body:JSON.stringify({email,otp:outbox.at(-1).otp})}),env,{}, {auth});const d=await r.json();return {id:d.user.id,cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const student=await signIn('student'),outsider=await signIn('outsider'),leaver=await signIn('leaver');const t=Date.now();
sql.exec(`INSERT INTO organisations VALUES ('org-1','northbay','Northbay University','Dubai',1,'active',NULL,${t}),('org-2','southgate','Southgate College','London',1,'active',NULL,${t})`);
sql.prepare("INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").run('org-1',student.id,'student','active','r1',t,t);
sql.prepare("INSERT INTO organisation_memberships(org_id,user_id,role,status,request_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").run('org-1',leaver.id,'student','left','r2',t,t);
const add=(id,org,status,kind='guide')=>sql.prepare("INSERT INTO organisation_content(id,org_id,kind,title,body,visibility,status,revision,updated_at) VALUES (?,?,?,?,?,'members',?,1,?)").run(id,org,kind,'Item '+id,'Body of '+id,status,t);
add('g1','org-1','published');add('g2','org-1','draft');add('g3','org-2','published');
const read=(who,ref)=>readOrgContext(new Request(origin+'/v1/chat',{headers:who?{Cookie:who.cookie}:{}}),env,ref,{auth});
const got=await read(student,{org:'org-1',content:'g1'});assert.equal(got.title,'Item g1');assert.equal(got.orgName,'Northbay University');assert.equal(got.body,'Body of g1');
assert.equal(await read(student,{org:'org-1',content:'g2'}),null,'drafts are never used');
assert.equal(await read(student,{org:'org-1',content:'g3'}),null,'another organisation’s item can’t be borrowed through this organisation');
assert.equal(await read(student,{org:'org-2',content:'g3'}),null,'not a member of that organisation');
assert.equal(await read(outsider,{org:'org-1',content:'g1'}),null);assert.equal(await read(leaver,{org:'org-1',content:'g1'}),null,'people who left lose access at once');
assert.equal(await read(null,{org:'org-1',content:'g1'}),null,'signed-out visitors get nothing');
assert.equal(await read(student,{org:'org-1',content:'g1',extra:'x'}),null);assert.equal(await read(student,{org:"org-1' OR 1=1",content:'g1'}),null);
sql.prepare("UPDATE organisation_memberships SET status='removed' WHERE user_id=?").run(student.id);assert.equal(await read(student,{org:'org-1',content:'g1'}),null,'removal applies to the very next message');

// 4. Page wiring: ids only, a removable label, a personal conversation option, cleared when unavailable.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),spaces=fs.readFileSync('workers/trial-ui/spaces.js','utf8').replace(/\r\n/g,'\n'),trial=fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8');
assert.match(chat,/orgContext:\{org:currentOrgContext\(\)\.org,content:currentOrgContext\(\)\.content\}/,'only ids are sent');
assert.match(chat,/'Using '\+\(o\.orgName\|\|'your university'\)\+'’s “'/);assert.match(chat,/Start a personal conversation/);assert.match(chat,/why==='org_context_unavailable'\)\{clearOrgContext\(/);
assert.match(spaces,/sends this guide’s text and your question to OpenAI, or to Cloudflare Workers AI if OpenAI is unavailable/);assert.match(spaces,/aiNoticeSeen/);
assert.match(trial,/orgContext=await readOrgContext\(req,env,orgRef\)/);assert.match(trial,/return reply\(\{error:'org_context_unavailable'\},403\)/);
console.log('University chat: members-only, published-only, same-organisation reads each message; labelled source that never backs official rules; not kept in memory; removable label.');
