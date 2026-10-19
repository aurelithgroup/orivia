import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth,accountConfig,reserveEmail} from '../workers/accounts/auth.mjs';
import {handleAccountRequest,validateSnapshot} from '../workers/accounts/handler.mjs';
const origin='https://orivia-research-pilot.habeebahsallah27.workers.dev';
function d1(){const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+fs.readFileSync('workers/accounts/schema.sql','utf8'));
 const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>{const p=sql.prepare(text);const results=p.all(...args);const m=sql.prepare('SELECT changes() AS changes, last_insert_rowid() AS last_row_id').get();return {results,meta:m,success:true}},first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
 return {sql,db:{prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>Promise.all(stmts.map(s=>s.all()))}};
}
const {sql,db}=d1(),outbox=[];
const env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-account-secret-never-deploy-this-123456789',ACCOUNTS_DB:db,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'accounts@example.com',ACCOUNTS_EMAIL:{send(){throw Error('Real email must never be sent in tests')}},ACCOUNTS_EMAIL_DAY_CAP:'2',ACCOUNTS_EMAIL_MONTH_CAP:'3'};
const auth=createAccountAuth(env,{deliver:message=>outbox.push(message)});
const cookieOwners=new Map();let ip=1;function req(path,{method='GET',body,cookie='',headers={}}={}){return new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(ip++),...(cookie?{Cookie:cookie}:{}),...(cookieOwners.has(cookie)?{'X-Orivia-Account':cookieOwners.get(cookie)}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})})}
const run=(path,opts)=>handleAccountRequest(req(path,opts),env,{}, {auth});
assert.equal(accountConfig({}).enabled,false);
assert.equal((await handleAccountRequest(req('/api/account/config'),{},{})).status,200);
assert.equal((await handleAccountRequest(req('/api/account/vault'),{},{})).status,503);
assert.equal((await run('/api/account/vault')).status,401,'vault rejects unauthenticated direct calls');
assert.equal((await run('/api/account/vault',{method:'PUT',headers:{Origin:'https://evil.example'},body:{}})).status,403,'cross-origin mutation denied');
assert.equal((await run('/api/auth/get-verification-otp')).status,404,'internal OTP read endpoint never exposed');
assert.equal((await run('/api/auth/sign-up/email',{method:'POST',body:{}})).status,404,'password signup disabled');
async function login(email){
 const sent=await run('/api/auth/email-otp/send-verification-otp',{method:'POST',body:{email,type:'sign-in'}});assert.equal(sent.status,200,await sent.clone().text());
 const msg=outbox.at(-1);assert.equal(msg.email,email);assert.match(msg.otp,/^\d{6}$/);
 const stored=JSON.stringify(sql.prepare('SELECT * FROM verification').all());assert.ok(!stored.includes(msg.otp),'only hashed codes stored');
 const signed=await run('/api/auth/sign-in/email-otp',{method:'POST',body:{email,otp:msg.otp}});assert.equal(signed.status,200,await signed.clone().text());
 const cookies=signed.headers.getSetCookie();assert.ok(cookies.some(c=>/HttpOnly/i.test(c)&&/Secure/i.test(c)&&/SameSite=Lax/i.test(c)),'session cookie protected');
 const cookie=cookies.map(c=>c.split(';')[0]).join('; ');
 const replay=await run('/api/auth/sign-in/email-otp',{method:'POST',body:{email,otp:msg.otp}});assert.notEqual(replay.status,200,'OTP cannot be replayed');
 const me=await run('/api/account/session',{cookie});assert.equal(me.status,200);const user=(await me.json()).user;assert.equal(user.email,email);cookieOwners.set(cookie,user.id);return {cookie,user};
}
const alice=await login('alice@example.com'),bob=await login('bob@example.com');
assert.equal((await run('/api/account/vault',{method:'PUT',cookie:bob.cookie,headers:{'X-Orivia-Account':alice.user.id,'If-Match':'0'},body:{}})).status,409,'an old tab cannot upload Alice data into Bob after the session changes');
const snapshot={version:1,profile:{here:'uae'},events:[],journeys:{},chats:{active:'chat',chats:[{id:'chat',title:'Private',turns:[{role:'user',content:'Alice private conversation'}]}]}};
assert.ok(validateSnapshot(snapshot));assert.ok(!validateSnapshot({...snapshot,chats:{chats:[{id:'x',turns:[]},{id:'x',turns:[]}]}}));
let r=await run('/api/account/vault',{method:'PUT',cookie:alice.cookie,headers:{'If-Match':'0'},body:snapshot});assert.equal(r.status,200);assert.equal((await r.json()).revision,1);
const own=await (await run('/api/account/vault',{cookie:alice.cookie})).json();assert.equal(own.data.chats.chats[0].turns[0].content,'Alice private conversation');
const other=await (await run('/api/account/vault?user_id='+alice.user.id,{cookie:bob.cookie})).json();assert.equal(other.data,null,'caller cannot choose another owner');
r=await run('/api/account/vault',{method:'PUT',cookie:alice.cookie,headers:{'If-Match':'0'},body:{...snapshot,events:[{title:'stale'}]}});assert.equal(r.status,409,'stale device cannot overwrite');
r=await run('/api/account/vault',{method:'PUT',cookie:alice.cookie,body:snapshot});assert.equal(r.status,428);
r=await run('/api/account/vault',{method:'PUT',cookie:alice.cookie,headers:{'If-Match':'1'},body:{...snapshot,events:[{title:'current'}]}});assert.equal(r.status,200);
const huge={...snapshot,profile:{place:'x'.repeat(1048576)}};r=await run('/api/account/vault',{method:'PUT',cookie:alice.cookie,headers:{'If-Match':'2'},body:huge});assert.equal(r.status,413,'oversized data rejected intact, never shortened');
assert.equal((await (await run('/api/account/vault',{cookie:alice.cookie})).json()).revision,2);
await reserveEmail(env,new Date('2026-10-19'));await reserveEmail(env,new Date('2026-10-19'));await assert.rejects(()=>reserveEmail(env,new Date('2026-10-19')));await reserveEmail(env,new Date('2026-10-20'));await assert.rejects(()=>reserveEmail(env,new Date('2026-10-21')),'monthly budget retained across days');
r=await run('/api/auth/sign-out',{method:'POST',cookie:alice.cookie,body:{}});assert.equal(r.status,200);assert.equal((await run('/api/account/vault',{cookie:alice.cookie})).status,401,'signed out cookie no longer works');
assert.equal((await run('/api/account',{method:'DELETE',cookie:bob.cookie,body:{}})).status,400,'deletion requires explicit phrase');
r=await run('/api/account',{method:'DELETE',cookie:bob.cookie,body:{confirm:'delete my account'}});assert.equal(r.status,200,await r.clone().text());assert.equal(sql.prepare('SELECT id FROM user WHERE id=?').get(bob.user.id),undefined);
console.log('Accounts: real Better Auth on D1-shaped SQLite; hashed one-use OTP, secure session restoration/sign-out, CSRF, cross-user isolation, conflict protection, size rejection, email caps and deletion passed. Emails scripted only.');
