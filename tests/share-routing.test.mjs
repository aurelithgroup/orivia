/* Ina's finding 2 (review f99c2b3): shared links through the full production path, front door → production Worker →
   accounts handler → read-only page, with a real SQLite database. Only /s/<token> is added; app APIs stay as before.
   Run: node --experimental-sqlite tests/share-routing.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createProduction,isAppPath} from '../workers/orivia-production.mjs';
import frontDoor,{isAppPath as doorPath} from '../workers/front-door/index.mjs';
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','shares'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
const st=(t,a=[])=>({bind:(...v)=>st(t,v),run:async()=>({meta:sql.prepare(t).run(...a)}),first:async()=>sql.prepare(t).get(...a)||null,all:async()=>({results:sql.prepare(t).all(...a)})});
const db={prepare:t=>st(t),batch:async s=>Promise.all(s.map(x=>x.all()))};
const host='myorivia.app',origin='https://'+host;
const env={PUBLIC_RELEASE:'1',PUBLIC_BETA:'1',PUBLIC_HOST:host,OPENAI_PILOT:'1',OPENAI_API_KEY:'scripted-only',BUDGET_DB:{prepare(){throw Error('no budget access')}},ACCOUNTS_DB:db,
 TURNSTILE_SITE_KEY:'k',TURNSTILE_SECRET:'s',SESSION_SECRET:'s'.repeat(40),ACCOUNTS_SECRET:'a'.repeat(40),ACCOUNTS_ORIGIN:origin,ACCOUNTS_ENABLED:'1',
 PILOT_OPENAI_DAY_USD:'5',PILOT_OPENAI_MONTH_USD:'20',OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',ACCOUNTS_EMAIL_DAY_CAP:'10',ACCOUNTS_EMAIL_MONTH_CAP:'100'};
const production=createProduction({fetcher:async()=>{throw Error('No real requests in tests')}});
const doorEnv={APP:{fetch:r=>production.fetch(r,env,{})},RELEASE_LIVE:'1'};
const viaDoor=(p,method='GET')=>frontDoor.fetch(new Request(origin+p,{method}),doorEnv);
const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
sql.prepare("INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES ('u1','Amira','amira@example.test',1,'2026-10-23','2026-10-23')").run();
const now=Date.now(),mk=async(tok,{expires=now+86400000,revoked=null}={})=>sql.prepare('INSERT INTO shared_snapshots(id,user_id,token_hash,title,content,created_at,expires_at,revoked_at) VALUES (?,?,?,?,?,?,?,?)').run('id-'+tok.slice(0,6),'u1',await sha(tok),'Emirates ID help',JSON.stringify([{role:'user',content:'Where?'},{role:'assistant',content:'At ICP <b>centres</b>.'}]),now,expires,revoked);
const live='L'.repeat(43),old='E'.repeat(43),gone='R'.repeat(43);await mk(live);await mk(old,{expires:now-1});await mk(gone,{revoked:now-1});
// Both route lists accept exactly /s/<token> and nothing else under /s/.
for(const f of [isAppPath,doorPath]){assert.equal(f('/s/'+live),true);for(const p of ['/s/','/s/short','/s/'+live+'/x','/s/'+live+'?','/share/'+live])assert.equal(f(p),false,p)}
// Active link: read-only page, escaped, not indexed, no cookies, not frameable even under production's framing relaxation.
let r=await viaDoor('/s/'+live);assert.equal(r.status,200);const html=await r.text();
assert.ok(html.includes('Emirates ID help')&&html.includes('At ICP &lt;b&gt;centres&lt;/b&gt;.')&&!html.includes('amira'));
assert.equal(r.headers.get('x-robots-tag'),'noindex, nofollow');assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(r.headers.getSetCookie().length,0);
// HEAD works the same way.
r=await viaDoor('/s/'+live,'HEAD');assert.equal(r.status,200);
// Unknown, expired and revoked look identical (404, same page).
const bodies=[];for(const t of ['U'.repeat(43),old,gone]){r=await viaDoor('/s/'+t);assert.equal(r.status,404,t[0]);bodies.push(await r.text())}
assert.ok(bodies.every(b=>b===bodies[0]&&b.includes('This link isn’t available')));
// Other methods are refused; private routes are unchanged (still need a session).
assert.equal((await viaDoor('/s/'+live,'POST')).status,405);
for(const p of ['/api/account/shares','/api/account/vault']){const x=await viaDoor(p);assert.ok(x.status>=400&&x.status<500,p+' refused without a session ('+x.status+')');assert.ok(!(await x.text()).includes('Emirates'))}
console.log('Share routing: front door and production route only /s/<token> to the read-only page; HEAD, unknown/expired/revoked, unframeable, private APIs unchanged: pass.');
