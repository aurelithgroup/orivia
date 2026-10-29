import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth,accountConfig,reserveEmail} from '../workers/accounts/auth.mjs';
import {handleAccountRequest,validateSnapshot} from '../workers/accounts/handler.mjs';
const origin='https://orivia-research-pilot.example.workers.dev'; // neutral host (no account username in new files)
function d1(){const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+fs.readFileSync('workers/accounts/schema.sql','utf8'));
 const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>{const p=sql.prepare(text);const results=p.all(...args);const m=sql.prepare('SELECT changes() AS changes, last_insert_rowid() AS last_row_id').get();return {results,meta:m,success:true}},first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {sql,db:{prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>Promise.all(stmts.map(s=>s.all()))}};
}
const {sql,db}=d1();const sent=[];const env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-recovery-delivery-outcomes-secret-123456789',ACCOUNTS_DB:db,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No live email')}}};
const auth=createAccountAuth(env,{deliver:async m=>{await new Promise(r=>setTimeout(r,m.email.startsWith('fail')?10:1));if(m.email.startsWith('fail'))throw Error('Synthetic delivery failure');sent.push(m)}});let ip=0;
const call=async(path,body)=>handleAccountRequest(new Request(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),'X-Orivia-Mail-Attempt':'client-cannot-spoof'},body:JSON.stringify(body)}),env,{}, {auth});
const [fail,ok]=await Promise.all([call('/api/auth/email-otp/send-verification-otp',{email:'fail@example.test',type:'sign-in'}),call('/api/auth/email-otp/send-verification-otp',{email:'works@example.test',type:'sign-in'})]);assert.equal(fail.status,503);assert.equal((await fail.json()).error,'email_unavailable');assert.equal(ok.status,200);assert.equal(sent.length,1);assert.equal(auth.consumeDeliveryOutcome('client-cannot-spoof'),undefined);
const code=sent[0].otp;let signed=await call('/api/auth/sign-in/email-otp',{email:'works@example.test',otp:code});assert.equal(signed.status,200);assert.notEqual((await call('/api/auth/sign-in/email-otp',{email:'works@example.test',otp:code})).status,200);
assert.equal((await call('/api/auth/email-otp/send-verification-otp',{email:'expires@example.test',type:'sign-in'})).status,200);const expiryCode=sent.at(-1).otp;sql.exec("UPDATE verification SET expiresAt='2000-01-01T00:00:00.000Z'");assert.notEqual((await call('/api/auth/sign-in/email-otp',{email:'expires@example.test',otp:expiryCode})).status,200);
console.log('Recovery delivery: real Better Auth concurrent success/failure correlation, server-only attempt IDs, honest failure, single-use and expired codes passed.');
