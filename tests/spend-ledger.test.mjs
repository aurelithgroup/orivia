/* Shared spending counter on a real SQLite engine (same SQL as D1).
   Run: node --experimental-sqlite tests/spend-ledger.test.mjs */
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createMeter,createOpenAIBudget,createBrowserBudget,maxCallCostMicro,openAIRates} from '../workers/orivia-spend-ledger.mjs';
import {createOpenAIPilot} from '../workers/orivia-openai-pilot.mjs';

function d1(){const sql=new DatabaseSync(':memory:');
 const stmt=(s,args=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...args),first:async()=>sql.prepare(s).get(...args)||null});
 return {sql,db:{prepare:s=>stmt(s)}}}
let clock=new Date('2026-10-18T10:00:00Z');const now=()=>clock;let n=0;const newId=()=>'t'+(++n);

// Fail closed: no limits, no database
{const {db}=d1();assert.equal(await createMeter(db,'x',{}).reserve(1),null,'no limit configured → nothing reserved');
 assert.equal(await createMeter(db,'x',{month:10,day:0}).reserve(1),null,'both limits required');
 await assert.rejects(()=>createMeter(null,'x',{month:10,day:10}).reserve(1),/ledger-db-missing/);}

// Day and month limits, shared across meter instances (= separate requests)
{const {db,sql}=d1();const a=createMeter(db,'m',{month:100,day:40},{now,newId}),b=createMeter(db,'m',{month:100,day:40},{now,newId});
 assert.ok(await a.reserve(30));assert.equal(await b.reserve(11),null,'second request sees the first one’s reservation');
 assert.ok(await b.reserve(10));assert.equal((await a.usage()).day,40);
 // Concurrent burst: only what fits is granted
 clock=new Date('2026-10-19T10:00:00Z');
 const burst=await Promise.all(Array.from({length:10},()=>a.reserve(15)));
 assert.equal(burst.filter(Boolean).length,2,'40/day allows two 15s');assert.equal((await a.usage()).day,30);assert.equal((await a.usage()).month,70);
 clock=new Date('2026-10-20T10:00:00Z');assert.ok(await a.reserve(30));assert.equal(await a.reserve(1),null,'month limit (100) reached even on a new day');
 clock=new Date('2026-11-01T00:00:01Z');assert.ok(await a.reserve(40),'new month resets');assert.equal((await a.usage()).month,40);
 assert.equal(await a.reserve(101),null,'larger than any limit');
 assert.ok(!JSON.stringify(sql.prepare('SELECT * FROM spend_ticket').all()).match(/prompt|email|@/),'tickets hold amounts and status only');}

// Settlement: refund known unused, keep uncertain, idempotent, overrun charged
{const {db,sql}=d1();clock=new Date('2026-10-18T10:00:00Z');const m=createMeter(db,'m',{month:1000,day:1000},{now,newId});
 const t1=await m.reserve(100);assert.equal(await m.settle(t1,30),30);assert.equal((await m.usage()).day,30,'unused 70 refunded');
 assert.equal(await m.settle(t1,0),null,'second settle ignored');assert.equal((await m.usage()).day,30);
 const t2=await m.reserve(100);assert.equal(await m.settle(t2,null),100);assert.equal((await m.usage()).day,130,'uncertain keeps full reservation');
 assert.equal(sql.prepare('SELECT status FROM spend_ticket WHERE id=?').get(t2).status,'uncertain');
 const t3=await m.reserve(50);await m.settle(t3,60);assert.equal((await m.usage()).day,190,'overrun is charged, never hidden');
 assert.equal(await m.settle('nope',1),null);
 // Settling after midnight refunds into the ticket’s own day, not today
 const t4=await m.reserve(100);clock=new Date('2026-10-19T00:00:05Z');await m.reserve(5);await m.settle(t4,0);
 assert.equal((await m.usage()).day,5,'today unaffected by yesterday’s refund');}

// OpenAI budget: rates required, conservative bound includes output (reasoning), plugs into Ina's transport
{const {db}=d1();clock=new Date('2026-10-18T10:00:00Z');
 assert.equal(openAIRates({}),null);
 const off=createOpenAIBudget({PILOT_OPENAI_MONTH_USD:'5',PILOT_OPENAI_DAY_USD:'1'},db,{now,newId});assert.equal(off.configured,false);
 assert.equal(await off.reserve({inputBytes:100,maxOutputTokens:1024}),null,'unconfirmed rates → fail closed');
 const env={OPENAI_PILOT:'1',OPENAI_API_KEY:'k',OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',PILOT_OPENAI_MONTH_USD:'5',PILOT_OPENAI_DAY_USD:'0.05'};
 const budget=createOpenAIBudget(env,db,{now,newId});assert.equal(budget.configured,true);
 assert.equal(maxCallCostMicro(budget.rates,{inputBytes:24000,maxOutputTokens:1024}),(24064*2)+(1024*10),'micro-USD bound');
 let mode='ok';const fetcher=async()=>{if(mode==='ok')return Response.json({status:'completed',usage:{input_tokens:1000,output_tokens:200,output_tokens_details:{reasoning_tokens:150}},output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'{}'}]}]});
  if(mode==='timeout')throw Object.assign(Error('aborted'),{name:'AbortError'});return new Response('',{status:500})};
 const ai=createOpenAIPilot(env,{consented:true,budget,fetcher});
 await ai.run('',{messages:[{role:'user',content:'hello'}]});
 assert.equal((await budget.meter.usage()).day,1000*2+200*10,'settled to actual tokens (reasoning is inside output_tokens)');
 mode='timeout';await assert.rejects(()=>ai.run('',{messages:[{role:'user',content:'hello'}]}),{code:'provider-unavailable'});
 const kept=(await budget.meter.usage()).day;assert.ok(kept>4000+10240,'timeout keeps the conservative reservation');
 // A failed call stops that transport for the turn, so each failure case below is a new turn.
 mode='500';await assert.rejects(()=>createOpenAIPilot(env,{consented:true,budget,fetcher}).run('',{messages:[{role:'user',content:'hello'}]}),{code:'provider-error'});
 assert.ok((await budget.meter.usage()).day>kept,'HTTP error with no usage keeps reservation');
 // Day limit $0.05 = 50000 micro-USD: after a few uncertain calls the next is refused before any request
 let sent=0;mode='timeout';
 for(let i=0;i<6;i++)await createOpenAIPilot(env,{consented:true,budget,fetcher:async(...a)=>{sent++;return fetcher(...a)}}).run('',{messages:[{role:'user',content:'x'.repeat(20000)}]}).catch(e=>e.code);
 const u=await budget.meter.usage();assert.ok(u.day<=50000,'never above the day limit');assert.ok(sent<6,'refused calls never reach the provider');}

// Browser meter in milliseconds
{const {db}=d1();const b=createBrowserBudget({BROWSER_DAY_SECONDS:'300',BROWSER_MONTH_SECONDS:'3000'},db,{now,newId});
 assert.equal(b.limits.day,300000);const t=await b.reserve(60000);assert.ok(t);await b.settle(t,12500);assert.equal((await b.usage()).day,12500);
 assert.equal(await createBrowserBudget({},db).reserve(1000),null,'no browser allowance configured → no browser');}
console.log('Spend ledger: atomic shared day/month limits, refund only known usage, uncertain kept, idempotent, fail-closed, transport integration: passed');
