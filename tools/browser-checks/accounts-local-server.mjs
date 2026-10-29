// The real accounts and organisations server (handleAccountRequest, Better Auth, the real schema) on an in-memory SQLite
// database behind the D1 interface, for local browser checks. Unlike platform-harness.mjs nothing here is a fixture:
// every /api/ answer comes from the worker's own code. Everything else (the app page at /, /chat.js, /v1/config) comes
// from the real app worker (orivia-ai-private-trial.mjs, as embedded by tools/embed-trial-ui.mjs), so the app's own join
// link (/?organisation=<slug>#join=<token>) runs here too; it has no AI binding, so chat answers fail. No Cloudflare bindings, no email (sign-in codes stay in a local
// outbox), listens on 127.0.0.1 only, and the database disappears when it stops.
// Usage: node tools/browser-checks/accounts-local-server.mjs [port]
//   /__dev/as?name=owner   signs the browser in as <name>@northbay.example (local helper, not part of the worker).
//   "owner" gets the platform owner role; everyone else starts as a plain account.
//   /__dev/demo?org=<id>   marks that organisation as a demo (fictional) one.
import http from 'node:http';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createAccountAuth} from '../../workers/accounts/auth.mjs';
import {handleAccountRequest} from '../../workers/accounts/handler.mjs';
import appWorker from '../../workers/orivia-ai-private-trial.mjs';

// The worker only accepts an https origin. On Cloudflare TLS ends at the edge; here this server plays the edge: the browser
// talks plain http to 127.0.0.1, and the worker sees https://localhost:<port> (Origin and Referer are mapped the same way).
const PORT=Number(process.argv[2]||8794),origin='https://localhost:'+PORT,local='http://localhost:'+PORT,root=new URL('../../',import.meta.url);
const sql=new DatabaseSync(':memory:');
sql.exec('PRAGMA foreign_keys=ON;'+fs.readFileSync(new URL('workers/accounts/schema.sql',root),'utf8')+fs.readFileSync(new URL('workers/accounts/organisations.sql',root),'utf8'));
// The same D1 shim as tests/restored-operations.test.mjs.
const statement=(text,args=[])=>({bind:(...v)=>statement(text,v),
 all:async()=>({results:sql.prepare(text).all(...args),meta:{changes:sql.prepare('SELECT changes() AS n').get().n},success:true}),
 first:async()=>sql.prepare(text).get(...args)||null,
 run:async()=>({meta:sql.prepare(text).run(...args),success:true})});
const db={prepare:text=>statement(text),exec:async text=>sql.exec(text),batch:async stmts=>{sql.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of stmts)out.push(await s.all());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const outbox=[];
const env={ACCOUNTS_ENABLED:'1',ACCOUNTS_UI:'1',ORGANISATIONS_ENABLED:'1',ACCOUNTS_ORIGIN:origin,ACCOUNTS_SECRET:'local-only-browser-check-secret-0123456789',ACCOUNTS_DB:db,
 ACCOUNTS_EMAIL_ENABLED:'1',ACCOUNTS_FROM:'signin@example.test',ACCOUNTS_EMAIL:{send(){throw Error('No real email from the local server')}}};
const auth=createAccountAuth(env,{deliver:m=>outbox.push(m)});
const ctx={waitUntil(){},passThroughOnException(){}};
// The app worker is private: it serves its own host behind Cloudflare Access. Here a local name and a stand-in Access
// identity let it answer; neither reaches any real service.
const appHost='orivia.localhost',appEnv={...env,PRIVATE_HOST:appHost,ACCESS_TEST_EMAIL:'local-access@northbay.example'},appCtx={...ctx,access:{getIdentity:async()=>({email:'local-access@northbay.example'})}};
const navJs=fs.readFileSync(new URL('workers/trial-ui/nav.js',root),'utf8');

let ip=0;
async function signIn(name){
 const email=name+'@northbay.example',headers={Origin:origin,'Content-Type':'application/json','cf-connecting-ip':'192.0.2.'+(++ip%250+1)};
 let r=await handleAccountRequest(new Request(origin+'/api/auth/email-otp/send-verification-otp',{method:'POST',headers,body:JSON.stringify({email,type:'sign-in'})}),env,ctx,{auth});
 if(r.status!==200)throw Error('send code '+r.status);
 r=await handleAccountRequest(new Request(origin+'/api/auth/sign-in/email-otp',{method:'POST',headers,body:JSON.stringify({email,otp:outbox.filter(m=>m.email===email||m.to===email).at(-1)?.otp??outbox.at(-1).otp})}),env,ctx,{auth});
 if(r.status!==200)throw Error('sign in '+r.status);
 const user=(await r.json()).user;
 if(name==='owner')sql.prepare('INSERT OR IGNORE INTO platform_roles VALUES (?,?)').run(user.id,'owner');
 return {user,cookies:r.headers.getSetCookie()};
}

http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,origin);
  if(u.pathname==='/orivia-nav.js'){res.writeHead(200,{'Content-Type':'application/javascript','Cache-Control':'no-store'});return res.end(navJs)}
  if(u.pathname==='/__dev/as'){const name=(u.searchParams.get('name')||'').toLowerCase();if(!/^[a-z]{2,20}$/.test(name)){res.writeHead(400);return res.end('name: 2-20 letters')}
   const s=await signIn(name);res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':s.cookies,'Cache-Control':'no-store'});return res.end(JSON.stringify({signedInAs:s.user.email,id:s.user.id}))}
  // Local helper: mark an organisation as a demo (fictional) one, as Northbay is on the pilot, to check demo-only rules.
  if(u.pathname==='/__dev/demo'){const oid=u.searchParams.get('org')||'';const r=sql.prepare('UPDATE organisations SET demo=1 WHERE id=?').run(oid);res.writeHead(r.changes?200:404,{'Content-Type':'application/json'});return res.end(JSON.stringify({demo:!!r.changes}))}
  if(u.pathname==='/__dev/sql'&&req.method==='GET'){const t=u.searchParams.get('t');if(!/^[a-z_]+$/.test(t||'')){res.writeHead(400);return res.end()}
   // Read-only look at one table for evidence; an unknown table answers 404 instead of stopping the server.
   let rows;try{rows=sql.prepare('SELECT * FROM '+t).all()}catch(e){res.writeHead(404,{'Content-Type':'text/plain'});return res.end('no such table')}
   res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(rows))}
  const chunks=[];for await(const c of req)chunks.push(c);
  const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(typeof v==='string')headers.set(k,v);
  headers.set('cf-connecting-ip','192.0.2.'+(++ip%250+1));
  for(const h of ['origin','referer'])if(headers.get(h)?.startsWith(local))headers.set(h,origin+headers.get(h).slice(local.length));
  const body=['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks);
  const r=await handleAccountRequest(new Request(origin+u.pathname+u.search,{method:req.method,headers,body}),env,ctx,{auth});
  // Paths the accounts handler doesn't own (the app itself, /) go to the app worker.
  const a=r||await appWorker.fetch(new Request('https://'+appHost+u.pathname+u.search,{method:req.method,headers,body}),appEnv,appCtx);
  const out={};a.headers.forEach((v,k)=>{if(k!=='set-cookie')out[k]=k==='location'&&v.startsWith(origin)?local+v.slice(origin.length):v});const set=a.headers.getSetCookie();if(set.length)out['set-cookie']=set;
  res.writeHead(a.status,out);res.end(Buffer.from(await a.arrayBuffer()));
 }catch(e){console.error(e);if(res.headersSent)return res.end();res.writeHead(500,{'Content-Type':'text/plain'});res.end('local server error: '+e.message)}
}).listen(PORT,'127.0.0.1',()=>console.log('Real accounts server (in-memory SQLite, no email, no Cloudflare) on '+local+' (worker origin '+origin+')'));
