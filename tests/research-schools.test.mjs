// Sharjah school discovery reads SPEA's label/value school profiles (no sentences) and answers from verbatim fields.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {planResearch} from '../workers/orivia-research-plan.mjs';
import {answerResearch,readSchoolProfile,validateResearchAnswer} from '../workers/orivia-research.mjs';
const tpl=readFileSync(new URL('./fixtures/spea-profile.html',import.meta.url),'utf8');
const page=(id,name,curr)=>tpl.replaceAll('{{NAME}}',name).replaceAll('{{ID}}',String(id)).replaceAll('{{CURR}}',curr);
const plain=s=>s.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const p=readSchoolProfile(page(117,'Al Mawahib British Pvt. School','British'),plain(page(117,'Al Mawahib British Pvt. School','British')));
assert.equal(p.name,'Al Mawahib British Pvt. School');assert.equal(p.curriculum,'British');assert.equal(p.area,'Sharjah - Al Abar');assert.equal(p.evaluation,'Good');assert.equal(p.phone,'065670077');
assert.ok(plain(page(117,'Al Mawahib British Pvt. School','British')).includes(p.quote),'quote is verbatim page text');

const plan=planResearch([{role:'user',content:'Find British curriculum schools in Sharjah'}],{city:'Dubai, UAE'});
assert.equal(plan.location.city,'Sharjah');assert.equal(plan.parts[0].curriculum,'british');assert.match(plan.queries[0].query,/british curriculum private school/);
const names={106:['Shj. British Int .Pvt. School','British'],117:['Al Mawahib British Pvt. School','British'],122:['Al Murooj (Pvt) Eng. Kindergarten & School','American']};
const calls=[];
const fetcher=async(u,init)=>{const s=String(u);calls.push(s);
 if(s.startsWith('https://api.search.brave.com/')){assert.ok(!/find british/i.test(s),'raw chat never sent');assert.match(new URL(s).searchParams.get('q'),/site:spea\.shj\.ae/);assert.ok(!/khda|adek/.test(s),'other emirates excluded');
  return new Response(JSON.stringify({web:{results:[{url:'https://www.bayut.com/mybayut/best-british-schools-sharjah'},{url:'https://spea.shj.ae/en/educational-institutions/schools/106'},{url:'https://spea.shj.ae/en/educational-institutions/schools/117?x=1'},{url:'https://spea.shj.ae/en/educational-institutions/schools/117'},{url:'https://spea.shj.ae/en/educational-institutions/schools/122'},{url:'https://spea.shj.ae/en/educational-institutions/schools/999'}]}}),{headers:{'content-type':'application/json'}});}
 assert.equal(init.redirect,'manual');
 const id=s.match(/schools\/(\d+)$/)[1];if(id==='999')return new Response('',{status:302,headers:{location:'https://spea.shj.ae/ar/'}});
 return new Response(page(id,...names[id]),{headers:{'content-type':'text/html; charset=utf-8'}});};
let modelCalls=0;const env={BRAVE_SEARCH_API_KEY:'test-key',AI:{run:async()=>{modelCalls++;return {response:'{"claims":[]}'}}}};
const out=await answerResearch(plan,env,{fetcher,reserve:async()=>true});
assert.equal(out.research.status,'evidence-found');assert.equal(modelCalls,0,'answer is built from page fields, not paraphrased');
assert.equal(out.liveSources.length,2);assert.ok(out.liveSources.every(s=>s.category==='official'&&s.url.startsWith('https://spea.shj.ae/en/educational-institutions/schools/')));
assert.ok(!calls.some(c=>c.includes('bayut')),'off-registry result never fetched');
assert.match(out.reply,/Shj\. British Int \.Pvt\. School: British curriculum/);assert.match(out.reply,/Al Mawahib British Pvt\. School: British curriculum, Al Abar, Sharjah\. Classes FS1 to Year 10\. SPEA rating: Good\. \[2\]/);
assert.ok(!/Al Murooj/.test(out.reply),'other curricula filtered out');assert.match(out.reply,/not SPEA’s full list/);
assert.equal(out.research.claims.length,2);
const t=out.research.trace;assert.ok(Array.isArray(t));
assert.deepEqual(t.find(x=>x.stage==='search'),{stage:'search',status:'searched',http:200,results:6,approved:4});
assert.ok(t.some(x=>x.stage==='page'&&x.outcome==='other-curriculum'));assert.ok(t.some(x=>x.stage==='page'&&x.outcome==='source-redirected'&&x.http===302));
assert.ok(!JSON.stringify(t).includes('test-key')&&!/find british/i.test(JSON.stringify(t)),'trace carries no key or user text');

// Search provider failure is reported with a status code, and no school is guessed.
const bad=await answerResearch(plan,env,{fetcher:async()=>new Response('no',{status:401}),reserve:async()=>true});
assert.equal(bad.research.status,'search-unavailable');assert.equal(bad.research.trace[0].http,401);assert.match(bad.reply,/won’t guess which schools/);
// Spending limit still applies before any call.
const n=calls.length;const lim=await answerResearch(plan,env,{fetcher,reserve:async()=>false});assert.equal(lim.research.status,'search-limit');assert.equal(calls.length,n);

// General path tolerates fenced JSON and curly/whitespace differences, but never an absent quote.
const src=[{id:'S1',excerpt:'Applicants must book a medical fitness test at an approved centre before the visa is issued.'}];
assert.ok(validateResearchAnswer('```json\n{"claims":[{"text":"Book a medical fitness test first.","sourceId":"S1","quote":"must book a medical  fitness test at an approved centre"}]}\n```',src));
assert.equal(validateResearchAnswer('{"claims":[{"text":"Book a test first.","sourceId":"S1","quote":"must book a blood test at any clinic you like"}]}',src),null);
console.log('research-schools: ok');
