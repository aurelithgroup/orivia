/* Truthful progress (ORI-PERF-007, ORI-PERF-005): the activity line says what Orivia is doing; a page that couldn't be
   read is never counted as read, and the reply is checked whole before anything is shown (no streamed claims).
   Runs the real runAssistantTurn with a scripted model and a fetcher where one page fails. Run: node tests/truthful-progress.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runAssistantTurn} from '../workers/orivia-assistant.mjs';
const page='<html><head><title>Clinic hours</title></head><body><h1>Northbay Clinic</h1><p>The clinic is open from 8am to 8pm every day.</p></body></html>';
const fetcher=async u=>{const url=String(u);if(url.startsWith('https://api.search.brave.com/'))return Response.json({web:{results:[{url:'https://clinic.example/hours',title:'Clinic hours',description:'Opening hours'},{url:'https://down.example/hours',title:'Other clinic',description:'Hours'}]}});
 if(url==='https://clinic.example/hours')return new Response(page,{headers:{'content-type':'text/html'}});return new Response('unavailable',{status:503,headers:{'content-type':'text/html'}})};
const script=[{action:'tools',calls:[{tool:'web_search',query:'Northbay clinic opening hours'},{tool:'read_page',url:'https://down.example/hours',focus:'hours'}]},
 {action:'tools',calls:[{tool:'read_page',url:'https://clinic.example/hours',focus:'hours'}]},
 {action:'reply',sentences:[{text:'Northbay Clinic is open from 8am to 8pm every day.',kind:'organisation_fact',org:'Northbay Clinic',evidence:['E1']}],memory:{}}];
let n=0;const ai={run:async()=>({response:JSON.stringify(script[Math.min(n++,script.length-1)])})};
const progress=[];const quiet=console.log;console.log=()=>{};
const out=await runAssistantTurn({messages:[{role:'user',content:'When is Northbay clinic open?'}]},{BRAVE_SEARCH_API_KEY:'k'},{ai,fetcher,reserve:async()=>true,onProgress:t=>progress.push(t)});
console.log=quiet;
assert.ok(out&&out.reply,'a checked reply');
// After the first step only the search succeeded (the page answered 503): nothing says a page was read.
const afterFirst=progress.find(p=>/deciding what to check next/i.test(p));assert.ok(afterFirst,JSON.stringify(progress));assert.match(afterFirst,/searched once/);assert.doesNotMatch(afterFirst,/Read \d/,'a failed page is not reported as read');
// After the second step exactly one page was read.
assert.ok(progress.some(p=>/Read 1 page/.test(p)),JSON.stringify(progress));assert.ok(!progress.some(p=>/Read 2 pages/.test(p)),'only the page that loaded counts');
// Checking is announced as checking, and the answer is the last thing: nothing is displayed before verification.
assert.ok(progress.some(p=>/Checking every fact against the sources/.test(p)));
const trial=fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8');assert.ok(!/reply_delta|partial_reply|delta:/.test(trial),'no partial reply text is streamed to the screen');
console.log('Truthful progress: a page that failed is never shown as read, counts match what actually loaded, checking is named, and replies are verified whole before display: pass.');
