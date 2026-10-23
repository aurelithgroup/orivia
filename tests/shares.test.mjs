/* Shared conversation snapshots (ORI-CHAT-009/010): real Better Auth sessions and SQLite.
   Run: node --experimental-sqlite tests/shares.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth} from '../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../workers/accounts/handler.mjs';
import {cleanSnapshot} from '../workers/accounts/shares.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','shares'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),first:async()=>sql.prepare(text).get(...args)||null,run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
const db={prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const origin='https://accounts.example.test',env={ACCOUNTS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'test-only-shares-secret-1234567890abcdef',ACCOUNTS_DB:db,ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email')}}};
const outbox=[],auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});let ip=0;
const raw=(path,{method='GET',cookie,account,body}={})=>handleAccountRequest(new Request(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip),...(cookie?{Cookie:cookie}:{}),...(account?{'X-Orivia-Account':account}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,{},{auth});
const call=async(who,path,method='GET',body)=>{const r=await raw(path,{method,cookie:who?.cookie,account:who?.id,body});let data=null;try{data=await r.json()}catch(_){}return {status:r.status,data}};
async function signIn(name){const email=name+'@example.test';await call(null,'/api/auth/email-otp/send-verification-otp','POST',{email,type:'sign-in'});const r=await raw('/api/auth/sign-in/email-otp',{method:'POST',body:{email,otp:outbox.at(-1).otp}});const d=await r.json();return {id:d.user.id,cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')}}
const amira=await signIn('amira'),bilal=await signIn('bilal');
// Validation: text and https sources only; no attachments/meta; bounded; allowed expiry only.
const msg=(role,content,extra={})=>({role,content,...extra});
assert.equal(cleanSnapshot({messages:[msg('user','Hi',{attachment:{name:'passport.jpg'}})],expiresInDays:7}),null,'attachments refused');
assert.equal(cleanSnapshot({messages:[msg('user','Hi')],expiresInDays:365}),null,'only 1, 7 or 30 days');
assert.equal(cleanSnapshot({messages:[],expiresInDays:7}),null);
assert.deepEqual(cleanSnapshot({messages:[msg('assistant','A',{sources:[{title:'x',url:'javascript:alert(1)'},{title:'ICP',url:'https://icp.gov.ae/a'}]})],expiresInDays:7}).messages[0].sources,[{title:'ICP',url:'https://icp.gov.ae/a'}]);
// Signed-out and header rules.
assert.equal((await call(null,'/api/account/shares','POST',{messages:[msg('user','x')],expiresInDays:7})).status,401);
assert.equal((await raw('/api/account/shares',{method:'POST',cookie:amira.cookie,body:{messages:[msg('user','x')],expiresInDays:7}})).status,428);
// Create and view.
const hostile='<script>alert("x")</script> & <img src=x onerror=alert(1)>';
let r=await call(amira,'/api/account/shares','POST',{title:'Emirates ID <b>help</b>',messages:[msg('user','When do I do biometrics?'),msg('assistant',hostile,{sources:[{title:'ICP centres',url:'https://icp.gov.ae/centres'}]})],expiresInDays:7});
assert.equal(r.status,201);assert.match(r.data.url,/^https:\/\/accounts\.example\.test\/s\/[A-Za-z0-9_-]{43}$/);const url=r.data.url,id=r.data.id;
const token=url.split('/s/')[1];assert.ok(!JSON.stringify(sql.prepare('SELECT * FROM shared_snapshots').all()).includes(token),'only a hash of the token is stored');
let page=await raw('/s/'+token);assert.equal(page.status,200);const html=await page.text();
assert.ok(!html.includes('<script>alert')&&html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')&&!html.includes('<img src=x'),'content escaped');
assert.ok(html.includes('Emirates ID &lt;b&gt;help&lt;/b&gt;')&&html.includes('rel="noopener noreferrer nofollow"')&&html.includes('icp.gov.ae'),'title escaped; sources attributed');
assert.equal(page.headers.get('x-robots-tag'),'noindex, nofollow');assert.match(page.headers.get('content-security-policy'),/default-src 'none'/);
assert.equal(page.headers.getSetCookie().length,0,'no cookies');assert.ok(!html.includes('amira'),'no account details');
assert.ok(html.includes('doesn’t give access to anyone’s account'));
// Viewing with someone's session cookie changes nothing and reveals nothing more.
assert.equal(await (await raw('/s/'+token,{cookie:bilal.cookie})).text(),html);
// Guessed tokens and ids look like any unavailable link.
const unavailable=async t=>{const p=await raw('/s/'+t);return p.status===404&&(await p.text()).includes('This link isn’t available')};
assert.ok(await unavailable('A'.repeat(43)));assert.ok(await unavailable(id.replace(/-/g,'').padEnd(24,'x')));
// Owner list; another person can't revoke or delete it.
r=await call(amira,'/api/account/shares');assert.equal(r.data.shares[0].state,'active');assert.ok(!JSON.stringify(r.data).includes(token),'the link is shown once, not listed');
assert.equal((await call(bilal,'/api/account/shares/'+id+'/revoke','POST',{})).status,404);assert.equal((await call(bilal,'/api/account/shares/'+id,'DELETE')).status,404);
assert.equal((await raw('/s/'+token)).status,200);
// Revoke: gone immediately.
assert.equal((await call(amira,'/api/account/shares/'+id+'/revoke','POST',{})).status,200);assert.ok(await unavailable(token));
assert.equal((await call(amira,'/api/account/shares')).data.shares[0].state,'revoked');
// Expiry.
r=await call(amira,'/api/account/shares','POST',{messages:[msg('user','Expiring')],expiresInDays:1});const t2=r.data.url.split('/s/')[1];
sql.prepare('UPDATE shared_snapshots SET expires_at=? WHERE id=?').run(Date.now()-1,r.data.id);assert.ok(await unavailable(t2));
// Delete.
r=await call(amira,'/api/account/shares','POST',{messages:[msg('user','Delete me')],expiresInDays:30});const t3=r.data.url.split('/s/')[1];
assert.equal((await call(amira,'/api/account/shares/'+r.data.id,'DELETE')).status,200);assert.ok(await unavailable(t3));
// Account deletion removes the person's links.
r=await call(bilal,'/api/account/shares','POST',{messages:[msg('user','Bilal shares')],expiresInDays:30});const t4=r.data.url.split('/s/')[1];assert.equal((await raw('/s/'+t4)).status,200);
sql.prepare('DELETE FROM user WHERE id=?').run(bilal.id);assert.ok(await unavailable(t4));
console.log('Shares: reviewed text-only snapshots, hashed unguessable links, escaped noindex read-only page without cookies, revoke/expiry/delete/account deletion stop it, owners only: pass.');
