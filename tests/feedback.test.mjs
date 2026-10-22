/* Reply feedback (ORI-CHAT-007 rating, ORI-CHAT-008 report, owner queue). Real SQLite with the accounts schema.
   Run: node --experimental-sqlite tests/feedback.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleFeedbackRequest,feedbackRoute} from '../workers/accounts/feedback.mjs';

const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','feedback'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
const stmt=(s,a=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...a),first:async()=>sql.prepare(s).get(...a)||null,all:async()=>({results:sql.prepare(s).all(...a)})});
const db={prepare:s=>stmt(s)};const now=new Date().toISOString();
for(const id of ['aisha','owner','staff'])sql.prepare('INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,?,?,?)').run(id,'Name '+id,id+'@example.test',1,now,now);
sql.prepare("INSERT INTO platform_roles(user_id,role) VALUES ('owner','owner')").run();
const json=(b,s=200)=>Response.json(b,{status:s});const readJson=async r=>{try{return await r.json()}catch(_){return null}};
let n=0;const call=async(owner,method,path,body,verified=true)=>{const r=await handleFeedbackRequest(new Request('https://pilot.example'+path,{method,body:body===undefined?undefined:JSON.stringify(body)}),{ACCOUNTS_DB:db},{owner,verified,json,readJson,newId:()=>'0000000'+(++n)+'-aaaa-bbbb'});return {status:r.status,data:await r.json()}};

assert.ok(feedbackRoute('/api/account/feedback/rating')&&feedbackRoute('/api/account/feedback/queue/abc-1')&&!feedbackRoute('/api/account/feedback/queue/../x'));
// Rating: set, change with reason, remove. One row per person per reply.
const R='/api/account/feedback/rating';
assert.equal((await call('aisha','PUT',R,{replyId:'chat1:3',rating:'up'})).status,200);
assert.equal((await call('aisha','PUT',R,{replyId:'chat1:3',rating:'down',reason:'inaccurate'})).data.reason,'inaccurate');
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM reply_ratings').get().n,1,'changing a rating does not duplicate it');
assert.equal((await call('aisha','PUT',R,{replyId:'chat1:5',rating:'up'})).status,200);
assert.equal((await call('aisha','PUT',R,{replyId:'chat1:5',rating:'none'})).data.rating,null);
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM reply_ratings').get().n,1,'removed');
for(const bad of [{replyId:'<script>',rating:'up'},{replyId:'c:1',rating:'love'},{replyId:'c:1',rating:'down',reason:'rude-words'}])assert.equal((await call('aisha','PUT',R,bad)).status,400);
// Report: receipt, reply text off by default, idempotent retry, bounded note.
const P='/api/account/feedback/report';
let r=await call('aisha','POST',P,{requestId:'req-00000001',category:'inaccurate',note:'The price looked wrong',replyId:'chat1:3',replyText:'Gold card costs 999'});
assert.equal(r.status,201);assert.match(r.data.receipt,/^FB-[0-9A-F-]{8}$/);
assert.equal(sql.prepare('SELECT reply_excerpt FROM feedback_reports').get().reply_excerpt,null,'reply text not kept unless included');
const again=await call('aisha','POST',P,{requestId:'req-00000001',category:'inaccurate',note:'The price looked wrong'});
assert.equal(again.data.receipt,r.data.receipt);assert.equal(again.data.repeat,true);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM feedback_reports').get().n,1,'a retry creates one report');
r=await call('aisha','POST',P,{requestId:'req-00000002',category:'privacy',note:'x'.repeat(5000),replyId:'chat1:7',includeReply:true,replyText:'Only this reply'});
assert.equal(r.status,201);const row=sql.prepare("SELECT note,reply_excerpt FROM feedback_reports WHERE request_id='req-00000002'").get();
assert.equal(row.note.length,1000);assert.equal(row.reply_excerpt,'Only this reply');
for(const bad of [{requestId:'short',category:'other'},{requestId:'req-00000003',category:'spam'}])assert.equal((await call('aisha','POST',P,bad)).status,400);
// Owner queue: verified owners only; aggregates and reports without who sent them.
const Q='/api/account/feedback/queue';
assert.equal((await call('aisha','GET',Q)).status,403,'a student cannot read the queue');
assert.equal((await call('staff','GET',Q)).status,403);
assert.equal((await call('owner','GET',Q,undefined,false)).status,403,'unverified owner session refused');
const q=await call('owner','GET',Q);assert.equal(q.status,200);
assert.deepEqual([q.data.ratings.up,q.data.ratings.down,q.data.ratings.reasons.inaccurate],[0,1,1]);
assert.equal(q.data.reports.length,2);assert.equal(q.data.reports[0].status,'open');
assert.doesNotMatch(JSON.stringify(q.data),/aisha|example\.test|Name /,'no reporter identity in the queue');
const id=q.data.reports.find(x=>x.category==='privacy').id;
assert.equal((await call('aisha','POST',Q+'/'+id,{status:'reviewed'})).status,403,'students cannot change the queue');
assert.equal((await call('owner','POST',Q+'/'+id,{status:'reviewed'})).data.status,'reviewed');
assert.equal((await call('owner','POST',Q+'/nope',{status:'reviewed'})).status,404);
// Missing storage fails honestly (no false success).
const noTable=await handleFeedbackRequest(new Request('https://p'+P,{method:'POST',body:JSON.stringify({requestId:'req-00000009',category:'other'})}),{ACCOUNTS_DB:{prepare:()=>({bind:()=>({first:async()=>{throw Error('D1_ERROR: no such table: feedback_reports')}})})}},{owner:'aisha',verified:true,json,readJson});
assert.equal(noTable.status,503);
// Account deletion removes the person's feedback (FK cascade).
sql.prepare("DELETE FROM user WHERE id='aisha'").run();
assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM reply_ratings').get().n+sql.prepare('SELECT COUNT(*) AS n FROM feedback_reports').get().n,0);
console.log('Feedback: ratings (change/remove), reports (receipt, opt-in reply text, idempotent), owner-only queue without identities, deletion: pass.');
// Client wiring: the reply text is opt-in (unticked) and only sent when ticked; the owner console reads the real queue.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8'),pui=fs.readFileSync('workers/accounts/platform-ui.mjs','utf8'),handler=fs.readFileSync('workers/accounts/handler.mjs','utf8');
assert.ok(chat.includes("includeReply:inc.checked,replyText:inc.checked?t.content:undefined")&&!/inc\.checked=true/.test(chat));
assert.ok(chat.includes("uiText('Sign in to send feedback to the Orivia team.')"),'guests are told, not shown success');
assert.ok(pui.includes("api('/api/account/feedback/queue')")&&pui.includes("Reports are stored with the sender’s account"));
assert.ok(handler.indexOf('feedbackRoute(url.pathname)')>handler.indexOf("getSession({headers:req.headers});if(!session?.user?.id)return json({error:'sign_in_required'},401)"),'feedback routes sit behind the session check');
console.log('Feedback client and console wiring: pass.');
// Disclosures match storage (Ina, review of 5569f60): linked to the account; an included reply may hold personal/document details.
assert.ok(chat.includes('The report is linked to your account and deleted with it')&&chat.includes('The Orivia team can read your note')&&chat.includes('which may include personal details or details from your documents'));
assert.ok(!/or your name\.|never who sent it/.test(chat+pui),'no claim that feedback is unlinked from the person');
console.log('Feedback disclosures match what is stored: pass.');
// Ina finding 4: saved, then the response is lost. Server: the retry with the same request id returns the same receipt
// and stores nothing new. Client: only a 4xx says "nothing was saved"; a lost response or 5xx says it couldn't confirm.
{const sql2=new DatabaseSync(':memory:');sql2.exec('PRAGMA foreign_keys=ON;'+['schema','organisations','feedback'].map(n=>fs.readFileSync('workers/accounts/'+n+'.sql','utf8')).join('\n'));
 sql2.prepare('INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,?,?,?)').run('lena','Lena','lena@example.test',1,now,now);
 const st=(s,a=[])=>({bind:(...v)=>st(s,v),run:async()=>sql2.prepare(s).run(...a),first:async()=>sql2.prepare(s).get(...a)||null,all:async()=>({results:sql2.prepare(s).all(...a)})});
 const env2={ACCOUNTS_DB:{prepare:s=>st(s)}},body={requestId:'fb-lost-0001',category:'technical',note:'Lost response'};
 const send=()=>handleFeedbackRequest(new Request('https://p/api/account/feedback/report',{method:'POST',body:JSON.stringify(body)}),env2,{owner:'lena',verified:true,json,readJson});
 await send(); // saved; the client never sees this response
 const retry=await (await send()).json();
 assert.equal(retry.repeat,true);assert.equal(sql2.prepare('SELECT COUNT(*) AS n FROM feedback_reports').get().n,1,'saved once despite the retry');}
{const src=chat.slice(chat.indexOf('function feedbackApi('),chat.indexOf('function feedbackControls('));
 const make=fetchImpl=>new Function('window','fetch','uiText','AbortSignal',src+';return {feedbackApi,feedbackError}')({OriviaAccounts:{user:{id:'u1'}}},fetchImpl,s=>s,{timeout:()=>undefined});
 const msg=async fetchImpl=>{const f=make(fetchImpl);try{await f.feedbackApi('report','POST',{});return 'ok'}catch(e){return f.feedbackError(e)}};
 assert.match(await msg(()=>Promise.reject(new TypeError('Failed to fetch'))),/Couldn’t confirm whether this was received/,'lost response');
 assert.match(await msg(async()=>new Response('{"error":"feedback_unavailable"}',{status:503})),/Couldn’t confirm/,'server error may follow a save');
 assert.match(await msg(async()=>new Response('{"error":"invalid_category"}',{status:400})),/Nothing was saved/,'a refusal proves nothing was saved');
 assert.equal(await msg(async()=>new Response('{"receipt":"FB-1"}',{status:201})),'ok');
 assert.ok(/const requestId=[^;]*;\s*form\.onsubmit/.test(chat.replace(/\r\n/g,'\n'))||chat.indexOf("const requestId='fb-'")<chat.indexOf('form.onsubmit=async'),'the request id is made once per form, so Try again reuses it');}
console.log('Feedback lost-response handling (server idempotent, client says it could not confirm): pass.');
