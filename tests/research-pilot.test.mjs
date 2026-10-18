/* Private research pilot entry point: gating, OpenAI consent, fail-closed money ledger, browser hookup, public isolation.
   SCRIPTED (fake OpenAI HTTP, fake browser, fixture pages). Run: node --experimental-sqlite tests/research-pilot.test.mjs */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createPilotWorker,PILOT_CONSENT,pilotResearchOptions} from '../workers/orivia-research-pilot.mjs';

const fx=f=>readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8');
const P='https://spea.shj.ae/en/education-institutes/schools/';
const pages={'https://spea.shj.ae/en/education-institutes/schools':fx('spea-directory-page1.html'),[P+'wes-green-int-pvt-school-llc']:fx('spea-profile-wesgreen-full.html')};
const openaiCalls=[];
globalThis.fetch=async(u,init)=>{const url=String(u);
 if(url==='https://api.openai.com/v1/responses')throw Error('the pilot must use its injected fetcher in tests');
 if(url.startsWith('https://api.search.brave.com/'))return Response.json({web:{results:[]}});
 return pages[url]?new Response(pages[url],{headers:{'content-type':'text/html'}}):new Response('',{status:404,headers:{'content-type':'text/html'}})};
const understanding=JSON.stringify({research:true,intent:'all',topic:'school',location:{country:'uae',city:'Sharjah'},constraints:{curriculum:'british'},organisations:[],searches:[]});
const openaiFetch=async(url,init)=>{const body=JSON.parse(init.body);openaiCalls.push({url,auth:init.headers.Authorization,first:body.input[0].content.slice(0,60),store:body.store,user:body.input[1]?.content||''});
 const text=/describe what research the LATEST/.test(body.input[0].content)?understanding:JSON.stringify({action:'regulator_listing',args:{},why:'filtered listing'});
 return Response.json({status:'completed',usage:{input_tokens:900,output_tokens:120},output:[{type:'message',role:'assistant',content:[{type:'output_text',text}]}]})};
const aiCalls=[];
const AI={run:async(_m,o)=>{const sys=o.messages[0].content;aiCalls.push(/describe what research the LATEST/.test(sys)?'understand':/next research step/.test(sys)?'plan':'chat');
 if(/describe what research the LATEST/.test(sys))return {response:understanding};if(/next research step/.test(sys)){const v=JSON.parse(o.messages[1].content);return {response:JSON.stringify(v.done.length?{action:'answer'}:{action:'regulator_listing',args:{}})}}return {response:'Hello'}}};
// Fake Browser Run: filtered listing with two British cards
let launches=0;
const launchBrowser=async env=>{assert.ok(env.BROWSER,'launch receives the binding');launches++;let applied=false;
 const card=(s,n)=>`<li><a href="/en/education-institutes/schools/${s}"><h3>${n}</h3></a><span>Curriculum::British</span><span>Learn More</span></li>`;
 const page={setRequestInterception:async()=>{},on:()=>{},goto:async()=>{},url:()=>'https://spea.shj.ae/en/education-institutes/schools',
  content:async()=>applied?`<ul>${card('wes-green-int-pvt-school-llc','Wes green Int. Pvt. School. LLC')}${card('synthetic-b','[Synthetic] Birch British School')}</ul><span>1-2 of 2</span>`:'<ul></ul><span>1-10 of 136</span>',
  evaluate:async(fn,text)=>{if(text==='Apply Filter')applied=true;return 'ok'}};
 return {newPage:async()=>page,close:async()=>{}}};

const sql=new DatabaseSync(':memory:');const stmt=(s,a=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...a),first:async()=>sql.prepare(s).get(...a)||null});
sql.exec('CREATE TABLE IF NOT EXISTS trial_usage (day TEXT PRIMARY KEY,calls INTEGER NOT NULL)');
const OLD_HOST='orivia-ai-preview.habeebahsallah27.workers.dev',host='orivia-research-pilot.habeebahsallah27.workers.dev'; // the pilot Worker's own URL
const base={PRIVATE_HOST:host,AI,BUDGET_DB:{prepare:s=>stmt(s)},SEARCH_DAILY_CAP:'10',SEARCH_MONTHLY_CAP:'100',RESEARCH_ENABLED:'1',RESEARCH_LOOP:'1',BRAVE_SEARCH_API_KEY:'k',
 ACCESS_TEST_EMAIL:'founder@example.test',AI_QUOTA:{limit:async()=>({success:true})}};
const pilotEnv={...base,OPENAI_PILOT:'1',OPENAI_API_KEY:'sk-test-not-real',OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',PILOT_OPENAI_MONTH_USD:'20',PILOT_OPENAI_DAY_USD:'1'};
const ctx={access:{getIdentity:async()=>({email:'founder@example.test'})}};
const req=(text,prefs={})=>new Request('https://'+host+'/v1/chat',{method:'POST',headers:{origin:'https://'+host,'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:text}],preferences:prefs})});
const consent={providerConsent:{openai:PILOT_CONSENT}};
const worker=createPilotWorker({launchBrowser,fetcher:openaiFetch});


// Hostname: the pilot answers on its own URL (PRIVATE_HOST); without it, or on another host, it refuses (no silent fallback)
{const chatOn=(h,env)=>worker.fetch(new Request('https://'+h+'/v1/chat',{method:'POST',headers:{origin:'https://'+h,'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:'hello'}],preferences:{}})}),env,ctx);
 assert.equal((await chatOn(host,{...base,PRIVATE_HOST:undefined})).status,404,'without PRIVATE_HOST the pilot URL is not served (the bug Ina found)');
 assert.equal((await chatOn(host,base)).status,200,'pilot URL served when PRIVATE_HOST is set');
 assert.equal((await chatOn(OLD_HOST,base)).status,404,'the old private hostname is not served by the pilot');
 assert.equal((await chatOn(host,{...base,PRIVATE_HOST:'evil.example/x'})).status,404,'malformed PRIVATE_HOST is ignored');
 const page=await worker.fetch(new Request('https://'+host+'/'),base,ctx);assert.equal(page.status,200);}
// Public deployment: the pilot refuses outright; the hook is also ignored by the shared handler
let r=await worker.fetch(req('All British schools in Sharjah',consent),{...pilotEnv,PUBLIC_BETA:'1'},ctx);assert.equal(r.status,404);
assert.equal(pilotResearchOptions({env:{...pilotEnv,PUBLIC_BETA:'1'},preferences:consent}),null);

// /v1/config: consent offer only when the pilot switch is on; never the key or limits
let cfg=await (await worker.fetch(new Request('https://'+host+'/v1/config'),base,ctx)).json();assert.equal(cfg.providerPilot,null);
cfg=await (await worker.fetch(new Request('https://'+host+'/v1/config'),pilotEnv,ctx)).json();
assert.equal(cfg.providerPilot.provider,'OpenAI');assert.equal(cfg.providerPilot.consent,PILOT_CONSENT);assert.match(cfg.providerPilot.text,/OpenAI/);
assert.ok(!JSON.stringify(cfg).includes('sk-test')&&!JSON.stringify(cfg).includes('PILOT_OPENAI'),'no secret or limit in config');

// Auth and quota still come first
r=await worker.fetch(req('All British schools in Sharjah',consent),pilotEnv,{});assert.equal(r.status,401);assert.equal(openaiCalls.length,0);

// No consent → existing provider, OpenAI never called
r=await worker.fetch(req('All British schools in Sharjah'),pilotEnv,ctx);assert.equal(r.status,200);assert.equal(openaiCalls.length,0);assert.ok(aiCalls.includes('understand'));
// Old/other consent version → existing provider
r=await worker.fetch(req('All British schools in Sharjah',{providerConsent:{openai:'openai-research-pilot-v0'}}),pilotEnv,ctx);assert.equal(openaiCalls.length,0);
// Consent but switch off → existing provider
r=await worker.fetch(req('All British schools in Sharjah',consent),{...pilotEnv,OPENAI_PILOT:undefined},ctx);assert.equal(openaiCalls.length,0);
// Consent but rates not confirmed → fail closed (no OpenAI request, no money reserved)
r=await worker.fetch(req('All British schools in Sharjah',consent),{...pilotEnv,OPENAI_INPUT_USD_PER_M:undefined},ctx);assert.equal(r.status,200);assert.equal(openaiCalls.length,0);

// Consent + switch + rates + limits → OpenAI plans AND understands; Workers AI not used for research
aiCalls.length=0;r=await worker.fetch(req('All British schools in Sharjah',consent),pilotEnv,ctx);let d=await r.json();
assert.equal(r.status,200);assert.ok(openaiCalls.length>=2,'understanding + planning went to the pilot');assert.ok(openaiCalls.every(c=>c.store===false&&c.auth==='Bearer sk-test-not-real'));
assert.ok(!aiCalls.includes('understand')&&!aiCalls.includes('plan'),'existing provider not used for this tester’s research');
assert.equal(d.research.agent,true);assert.equal(d.research.process.steps[0].by,'model');
const spent=sql.prepare("SELECT day_amount FROM spend_meter WHERE id='openai'").get();assert.ok(spent.day_amount>0,'usage recorded in the shared ledger');
assert.ok(!JSON.stringify(sql.prepare('SELECT * FROM spend_ticket').all()).match(/British|Sharjah|sk-test/),'ledger stores amounts only');


// Privacy: the consent says saved About me details aren't sent. A city that exists only in the profile never reaches OpenAI.
{openaiCalls.length=0;const res=await worker.fetch(req('All British curriculum schools near me',{...consent,profile:{city:'Sharjah',name:'Test Person'}}),pilotEnv,ctx);assert.equal(res.status,200);
 assert.ok(openaiCalls.length>=1);const u=JSON.parse(openaiCalls[0].user);
 assert.ok(!('profileCity' in u),'no profile city in the understanding request');assert.ok(!openaiCalls.some(c=>/Test Person/.test(c.user)),'no profile name');
 assert.ok(openaiCalls.slice(1).some(c=>JSON.parse(c.user).goal),'planning ran on the profile-located request');
 for(const c of openaiCalls.slice(1)){const v=JSON.parse(c.user);if(v.goal)assert.equal(v.goal.place,'','planning view leaves out a place the person never wrote')}
 // …and when the person does write the place, it is part of their request and may be sent
 openaiCalls.length=0;await worker.fetch(req('All British curriculum schools in Sharjah',consent),pilotEnv,ctx);
 assert.ok(openaiCalls.slice(1).some(c=>JSON.parse(c.user).goal?.place==='Sharjah'));}
assert.match(cfg.providerPilot.text,/About me details, including your city/,'consent wording matches what is (not) sent');
// A failing provider is tried once per turn, not on every step (the 18 Oct live test made six failing attempts in one turn).
{let attempts=0;aiCalls.length=0;const failing=createPilotWorker({launchBrowser,fetcher:async()=>{attempts++;return Response.json({error:{type:'invalid_request_error',code:'model_not_found'}},{status:404})}});
 const origLog=console.log;console.log=()=>{};
 const res=await failing.fetch(req('All British curriculum schools in Sharjah',consent),pilotEnv,ctx);console.log=origLog;const out=await res.json();
 assert.equal(res.status,200);assert.equal(attempts,1,'one failed attempt, then the existing provider carries the turn');
 assert.equal(out.research.process.metrics.providerStopped,true);assert.ok(aiCalls.includes('understand')&&aiCalls.includes('plan'),'the existing provider carried the turn');
 assert.match(out.reply,/SPEA/,'the person still gets an answer');}
// Browser directory: off unless its own switch, binding and allowance are present
assert.equal(launches,0);
r=await worker.fetch(req('All British schools in Sharjah',consent),{...pilotEnv,BROWSER_DIRECTORY:'1',BROWSER:{}},ctx);d=await r.json();
assert.equal(launches,0,'no browser allowance configured → no browser');
r=await worker.fetch(req('All British schools in Sharjah'),{...pilotEnv,BROWSER_DIRECTORY:'1',BROWSER:{},BROWSER_DAY_SECONDS:'300',BROWSER_MONTH_SECONDS:'3000'},ctx);d=await r.json();
assert.equal(launches,1);assert.match(d.reply,/complete list SPEA shows for the British filter: 2 of 2/);
assert.ok(sql.prepare("SELECT day_amount FROM spend_meter WHERE id='browser'").get().day_amount>=0);

// The public Worker file never loads the pilot, OpenAI transport, ledger or browser code
const trialSrc=readFileSync(new URL('../workers/orivia-ai-private-trial.mjs',import.meta.url),'utf8');
const imports=[...trialSrc.matchAll(/^\s*import\b[^;]*?from\s*['"]([^'"]+)['"]/gm)].map(m=>m[1]).concat([...trialSrc.matchAll(/import\(\s*['"]([^'"]+)/g)].map(m=>m[1]));
assert.ok(imports.length>3,'imports parsed');
for(const m of ['orivia-research-pilot','orivia-openai-pilot','orivia-browser-directory','orivia-spend-ledger','puppeteer'])assert.ok(!imports.some(i=>i.includes(m)),'public Worker must not import '+m);
assert.ok(!trialSrc.includes('api.openai.com'));
console.log('Research pilot entry: private only, auth/quota first, OpenAI only with named consent + switch + confirmed rates, shared ledger, browser behind its own switch and allowance, public Worker untouched: passed');
