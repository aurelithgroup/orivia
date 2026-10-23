/* Accounts on this device (ORI-AUTH-002/003/006): Better Auth multi-session behind Orivia's own routes. Real Better Auth
   sessions, real SQLite, a cookie jar per simulated device. Run: node --experimental-sqlite tests/device-accounts.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+fs.readFileSync('workers/accounts/schema.sql','utf8')+fs.readFileSync('workers/accounts/organisations.sql','utf8'));
const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
const db={prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-device-accounts-secret-1234567890',ACCOUNTS_DB:db,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email')}}};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
class Device{constructor(){this.jar=new Map()}
 cookie(){return [...this.jar].map(([k,v])=>k+'='+v).join('; ')}
 take(res){for(const c of res.headers.getSetCookie()){const [kv,...attrs]=c.split(';');const i=kv.indexOf('=');const k=kv.slice(0,i).trim(),v=kv.slice(i+1);
  const gone=attrs.some(a=>/max-age=0\b/i.test(a.trim())||(/^expires=/i.test(a.trim())&&new Date(a.split('=')[1])<new Date()))||v==='';if(gone)this.jar.delete(k);else this.jar.set(k,v)}}
 async call(path,method='GET',body,{account}={}){const res=await handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),...(this.jar.size?{Cookie:this.cookie()}:{}),...(account?{'X-Orivia-Account':account}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{},{auth});this.take(res);let data=null;try{data=await res.json()}catch(_){}return {status:res.status,data}}
 async signIn(name){const email=name+'@example.test';assert.equal((await this.call('/api/auth/email-otp/send-verification-otp','POST',{email,type:'sign-in'})).status,200);const r=await this.call('/api/auth/sign-in/email-otp','POST',{email,otp:outbox.at(-1).otp});assert.equal(r.status,200);return r.data.user.id}
 async me(){const r=await this.call('/api/account/session');return r.status===200?r.data.user.id:r.status}}
const phone=new Device(),laptop=new Device();
const A=await phone.signIn('amira'),B=await phone.signIn('bilal');const C=await laptop.signIn('chen');
assert.equal(await phone.me(),B,'the latest sign-in is active');
// The plugin's own endpoints (which return raw tokens) are not reachable from the browser.
for(const p of ['/api/auth/multi-session/list-device-sessions','/api/auth/multi-session/set-active','/api/auth/multi-session/revoke'])assert.equal((await phone.call(p,p.endsWith('sessions')?'GET':'POST',p.endsWith('sessions')?undefined:{sessionToken:'x'})).status,404);
// List: both accounts, B active, opaque refs, no tokens.
let r=await phone.call('/api/account/device-accounts');assert.equal(r.status,200);
assert.deepEqual(r.data.accounts.map(a=>[a.email,a.active]).sort(),[['amira@example.test',false],['bilal@example.test',true]]);
const tokens=[...phone.jar.values()].map(v=>decodeURIComponent(v).split('.')[0]).filter(t=>t.length>=16);
assert.ok(r.data.accounts.every(a=>/^[0-9a-f]{32}$/.test(a.ref)&&!('token' in a)));
for(const t of tokens)assert.ok(!JSON.stringify(r.data).includes(t),'no raw session token in the response');
const refA=r.data.accounts.find(a=>a.email.startsWith('amira')).ref,refB=r.data.accounts.find(a=>a.email.startsWith('bilal')).ref;
// Refusals: no account header, wrong account header, malformed or forged ref, another device's account, signed out.
assert.equal((await phone.call('/api/account/device-accounts/switch','POST',{ref:refA})).status,428);
assert.equal((await phone.call('/api/account/device-accounts/switch','POST',{ref:refA},{account:A})).status,409,'tab still on another account');
assert.equal((await phone.call('/api/account/device-accounts/switch','POST',{ref:'not-a-ref'},{account:B})).status,400);
assert.equal((await phone.call('/api/account/device-accounts/switch','POST',{ref:'0'.repeat(32)},{account:B})).status,404);
assert.equal((await phone.call('/api/account/device-accounts/switch','POST',{ref:A},{account:B})).status,400,'a user id is not a ref');
assert.equal((await laptop.call('/api/account/device-accounts/switch','POST',{ref:refA},{account:C})).status,404,'another device cannot activate A');
assert.equal(await laptop.me(),C);
assert.equal((await new Device().call('/api/account/device-accounts')).status,401);
// Switch without typing credentials again.
r=await phone.call('/api/account/device-accounts/switch','POST',{ref:refA},{account:B});assert.equal(r.status,200);assert.equal(await phone.me(),A);
r=await phone.call('/api/account/device-accounts');assert.equal(r.data.accounts.find(a=>a.active).email,'amira@example.test');
// Remove B from this device: B's session is revoked; A stays signed in.
r=await phone.call('/api/account/device-accounts/remove','POST',{ref:refB},{account:A});assert.equal(r.status,200);
assert.equal(await phone.me(),A,'removing one account keeps the others');
r=await phone.call('/api/account/device-accounts');assert.deepEqual(r.data.accounts.map(a=>a.email),['amira@example.test']);
assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM session s JOIN user u ON u.id=s.userId WHERE u.email='bilal@example.test'").get().n,0,'B session deleted on the server');
// Expired sessions need authentication again and drop out of the list.
const C2=await phone.signIn('chen');sql.prepare("UPDATE session SET expiresAt=? WHERE userId=?").run(new Date(Date.now()-60000).toISOString(),A);
r=await phone.call('/api/account/device-accounts');assert.deepEqual(r.data.accounts.map(a=>a.email),['chen@example.test'],'expired A not offered');
r=await phone.call('/api/account/device-accounts/switch','POST',{ref:refA},{account:C2});assert.equal(r.status,404);
// Client: the account panel uses only these routes and reloads after a switch.
const ui=fs.readFileSync('workers/trial-ui/accounts.js','utf8');
assert.ok(ui.includes("api('/api/account/device-accounts')")&&ui.includes("'/api/account/device-accounts/switch'")&&ui.includes("'/api/account/device-accounts/remove'")&&!ui.includes('multi-session'));
console.log('Accounts on this device: remember and switch without credentials, no raw tokens, forged/other-device/expired refused, removal keeps others: pass.');
