/* The research loop through the real Worker: opt-in switch, authentication and quotas first, model understanding
   validated, ordinary chat not routed into research. Run: node --experimental-sqlite tests/research-loop-worker.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const P='https://spea.shj.ae/en/education-institutes/schools/';
const pages={'https://spea.shj.ae/en/education-institutes/schools':fx('spea-directory-page1.html'),[P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html'),[P+'victoria-english-pvt-school-llc']:fx('spea-profile-victoria-english.html')};
const calls=[];
globalThis.fetch=async(u)=>{const url=String(u);calls.push(url);
 if(url.startsWith('https://api.search.brave.com/'))return new Response(JSON.stringify({web:{results:[]}}),{headers:{'content-type':'application/json'}});
 if(pages[url])return new Response(pages[url],{headers:{'content-type':'text/html'}});return new Response('',{status:404,headers:{'content-type':'text/html'}})};
const sql=new DatabaseSync(':memory:');const stmt=(s,args=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...args),first:async()=>sql.prepare(s).get(...args)||null});
const aiCalls=[];
const AI={run:async(_m,o)=>{const sys=o.messages[0].content;aiCalls.push(/describe what research the LATEST/.test(sys)?'understand':'chat');
 if(/describe what research the LATEST/.test(sys))return {response:JSON.stringify({research:true,intent:'find',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},organisations:[],searches:[]})};
 return {response:'Hello! How can I help?'}}};
const worker=(await import('../workers/orivia-ai-private-trial.mjs')).default;
const host='orivia-ai-preview.habeebahsallah27.workers.dev';
const req=text=>new Request('https://'+host+'/v1/chat',{method:'POST',headers:{origin:'https://'+host,'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:text}],preferences:{}})});
const env={AI,BUDGET_DB:{prepare:s=>stmt(s)},SEARCH_DAILY_CAP:'10',SEARCH_MONTHLY_CAP:'100',RESEARCH_ENABLED:'1',RESEARCH_LOOP:'1',BRAVE_SEARCH_API_KEY:'k',ACCESS_TEST_EMAIL:'founder@example.test',AI_QUOTA:{limit:async()=>({success:true})}};
const ctx={access:{getIdentity:async()=>({email:'founder@example.test'})}};
sql.exec('CREATE TABLE IF NOT EXISTS trial_usage (day TEXT PRIMARY KEY,calls INTEGER NOT NULL)');
let w=await worker.fetch(req('Find British curriculum schools in Sharjah'),env,{});assert.equal(w.status,401,'no research without authentication');
assert.equal(calls.length,0);assert.equal(aiCalls.length,0);
w=await worker.fetch(req('Find British curriculum schools in Sharjah'),{...env,AI_QUOTA:{limit:async()=>({success:false})}},ctx);assert.equal(w.status,429);
assert.equal(calls.length,0,'quota rejection happens before any search or fetch');assert.equal(aiCalls.length,0,'and before the understanding call');
w=await worker.fetch(req('Find British curriculum schools in Sharjah'),env,ctx);assert.equal(w.status,200);
let d=await w.json();
assert.equal(d.research.loop,true);assert.equal(d.research.understanding.source,'model');assert.equal(d.research.understanding.intent,'find');
assert.match(d.reply,/Wes green Int\. Pvt\. School\. LLC: British curriculum/);assert.match(d.reply,/isn’t the full list/);
assert.ok(d.research.taskContext.task.shown.length>=2,'task state goes back to the client for follow-ups');
assert.deepEqual(aiCalls,['understand'],'one model call for understanding; the answer is composed in code');
// Ordinary chat doesn't spend a call on research understanding
aiCalls.length=0;w=await worker.fetch(req('how are you today?'),env,ctx);assert.equal(w.status,200);assert.ok(!aiCalls.includes('understand'));
// Switch off → previous path (no loop marker)
w=await worker.fetch(req('Find British curriculum schools in Sharjah'),{...env,RESEARCH_LOOP:undefined},ctx);d=await w.json();assert.notEqual(d.research?.loop,true);
console.log('Research loop through the Worker: opt-in, authenticated, quota first, model understanding, ordinary chat untouched, switch off restores the old path: passed');
