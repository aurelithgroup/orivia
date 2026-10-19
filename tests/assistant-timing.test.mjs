import assert from 'node:assert/strict';
import {assistantTiming} from '../workers/orivia-assistant-timing.mjs';
import {runAssistantTurn} from '../workers/orivia-assistant.mjs';
let time=0, reads=0, release;
const gate=new Promise(r=>release=r);
const original={used:{fetches:0},fetchPage:async()=>{reads++;await gate;time+=40;return {ok:true,raw:'page'}},search:async()=>{time+=10;return {status:'searched'}}};
const a=assistantTiming(original,()=>time);
const first=a.tools.fetchPage('https://school.example/contact');
const duplicate=a.tools.fetchPage('https://school.example/contact');
assert.equal(first,duplicate,'concurrent reads share one in-flight request');
release();await Promise.all([first,duplicate]);
await a.tools.fetchPage('https://school.example/contact');
assert.equal(reads,1);assert.equal(a.timings.pageCacheHits,2);assert.equal(a.timings.pageMs,40);
assert.equal(a.tools.used,original.used,'existing quota counters stay attached');
await a.tools.fetchPage('https://school.example/contact',{kind:'site',host:'school.example'});
await a.tools.fetchPage('https://school.example/contact?q=other');
assert.equal(reads,3,'policy options and query strings are never merged');
let failed=0;
const b=assistantTiming({search:async()=>{},fetchPage:async()=>{failed++;return {ok:false,reason:'timeout'}}});
await b.tools.fetchPage('https://school.example/');await b.tools.fetchPage('https://school.example/');
assert.equal(failed,2,'transient failures may retry');
let thrown=0;
const c=assistantTiming({fetchPage:async()=>{thrown++;throw Error('fixture')},search:async()=>{}});
await assert.rejects(c.tools.fetchPage('x'));await assert.rejects(c.tools.fetchPage('x'));assert.equal(thrown,2);
const d=assistantTiming(original);await d.tools.fetchPage('https://school.example/contact');assert.equal(reads,4,'a fresh message never reuses another message’s page');
let bounded=0;const e=assistantTiming({fetchPage:async()=>{bounded++;return {ok:true,raw:'page'}},search:async()=>{}});
for(let i=0;i<9;i++)await e.tools.fetchPage('https://school.example/'+i);
await e.tools.fetchPage('https://school.example/0');assert.equal(bounded,10,'only eight pages are retained');
await a.measure('toolWallMs',async()=>{time+=15});await a.tools.search('query');
assert.equal(a.timings.toolWallMs,15);assert.equal(a.timings.searchMs,10);
// Whole assistant: one page, two different focuses, still two different evidence excerpts.
let model=0, fetched=0;const states=[];
const html='<title>School</title><p>Admissions are open.</p><p>Telephone +971 6 555 1234.</p>';
const log=console.log;console.log=()=>{};
let result;
try { result=await runAssistantTurn({messages:[{role:'user',content:'school contacts'}]}, {}, {
 ai:{run:async(_m,o)=>{states.push(JSON.parse(o.messages[1].content));model++;return {response:JSON.stringify(model<3?{action:'tools',calls:[{tool:'read_page',url:'https://school.example/contact',focus:model===1?'admissions':'telephone'}]}:{action:'reply',sentences:[{kind:'general',text:'You can ask the school about admissions.'}]})}}},
 fetcher:async()=>{fetched++;return new Response(html,{headers:{'content-type':'text/html'}})}
 }); } finally { console.log=log; }
assert.equal(fetched,1);assert.equal(states[2].evidence.length,1,'source identity remains stable');
assert.equal(result.research.process.metrics.pageCacheHits,1);
assert.equal(result.research.process.metrics.fetches,1,'only real requests consume the page allowance');
for(const key of ['modelMs','toolWallMs','searchMs','pageMs']) assert.ok(result.research.process.metrics[key]>=0);
assert.ok(!/https|school|contact/.test(JSON.stringify(result.research.process.metrics)),'timings carry no queries, pages or chat text');
console.log('Assistant timing: concurrent deduplication, policy separation, retry, request isolation, bounded cache and whole-turn evidence preservation passed');
