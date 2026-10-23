/* Incident switches that docs/incident-controls.md lists without another off-state test (ORI-SEC-010): sign-in email,
   stored files and university spaces each switch off on their own, with a plain unavailable state and nothing sent,
   stored or read. Run: node --experimental-sqlite tests/incident-switches.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {accountConfig,createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleFileRequest,filesAvailable} from '../workers/accounts/files.mjs';
import {handleOrganisationRequest} from '../workers/accounts/organisations.mjs';
import {handleAccountRequest,readOrgContext} from '../workers/accounts/handler.mjs';
import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');sql.exec(fs.readFileSync('workers/accounts/schema.sql','utf8'));
const wrap=sql=>{const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}}};
const realDb=wrap(sql);
const json=(d,s=200)=>Response.json(d,{status:s});
const untouchable={prepare(){throw Error('no database access when switched off')}};
const base={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:'https://accounts.example.test',ACCOUNTS_SECRET:'test-only-incident-switch-secret-123456',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_DB:untouchable};
// Sign-in email off: config says so, and asking for a code is refused before anything is sent.
let sent=0;const mail={send(){sent++}};
assert.equal(accountConfig({...base,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_EMAIL:mail}).email,true);
const off={...base,ACCOUNTS_DB:realDb,ACCOUNTS_EMAIL_ENABLED:'0',ACCOUNTS_EMAIL:mail};assert.equal(accountConfig(off).email,false);
const r=await handleAccountRequest(new Request(base.ACCOUNTS_ORIGIN+'/api/auth/email-otp/send-verification-otp',{method:'POST',headers:{Origin:base.ACCOUNTS_ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({email:'a@b.example',type:'sign-in'})}),off,{},{auth:createAccountAuth(off,{deliver:()=>sent++})});
assert.equal(r.status,503);assert.equal((await r.json()).error,'email_unavailable');assert.equal(sent,0);
// Files off: every file route answers files_unavailable without touching storage or the database.
const bucket={put(){throw Error('no storage when switched off')},get(){throw Error('no storage')},delete(){throw Error('no storage')}};
assert.equal(filesAvailable({FILES_ENABLED:'0',FILES:bucket,ACCOUNTS_DB:untouchable}),false);
for(const [m,p] of [['GET','/api/account/files'],['POST','/api/account/files'],['GET','/api/account/files/x'],['DELETE','/api/account/files/x']]){
 const res=await handleFileRequest(new Request(base.ACCOUNTS_ORIGIN+p,{method:m}),{FILES_ENABLED:'0',FILES:bucket,ACCOUNTS_DB:untouchable},{owner:'u',expected:'u',json,readJson:async()=>({})});
 assert.equal(res.status,503,m+' '+p);assert.equal((await res.json()).error,'files_unavailable')}
// University spaces off: staff and student routes are unavailable, and no organisation text can reach Chat.
for(const p of ['/api/me/memberships','/api/orgs/o/content','/api/admin/overview']){const res=await handleOrganisationRequest(new Request(base.ACCOUNTS_ORIGIN+p),{...base,ORGANISATIONS_ENABLED:'0'},{});assert.equal(res.status,503,p);assert.equal((await res.json()).error,'organisations_unavailable')}
assert.equal(await readOrgContext(new Request(base.ACCOUNTS_ORIGIN+'/v1/chat'),{...base,ORGANISATIONS_ENABLED:'0'},{org:'o',content:'c'}),null);
// The runbook names a test for every switch it lists.
const doc=fs.readFileSync('docs/incident-controls.md','utf8');for(const sw of ['OPENAI_PILOT','RESEARCH_ENABLED','DOCUMENTS_ENABLED','FILES_ENABLED','VOICE_ENABLED','NOTIFICATIONS_ENABLED','ORGANISATIONS_ENABLED','ACCOUNTS_EMAIL_ENABLED'])assert.ok(new RegExp('`'+sw+'=0`[^\\n]*tests/').test(doc),sw);
console.log('Incident switches: sign-in email, stored files and university spaces each switch off with a plain unavailable state and no sending, storage or reading: pass.');
