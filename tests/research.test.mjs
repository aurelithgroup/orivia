import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {planResearch} from '../workers/orivia-research-plan.mjs';
import {researchSource} from '../workers/orivia-research-policy.mjs';
import {answerResearch,researchPage,searchApproved,reserveSearch,validateResearchAnswer} from '../workers/orivia-research.mjs';
const user=content=>({role:'user',content});
const assistant=content=>({role:'assistant',content});
const dubai={city:'Dubai, UAE',place:'Heriot-Watt'};
/* Founder's five acceptance scenarios: no assumed country, document type,
   completion, account eligibility or medical procedure. */
const questions=[
 'chat i just got here and my uni says they\'re sorting my documents but how do ik where theyre at bruhh',
 'what do i need to register my kids for school',
 'my ID is needed to open a bank account but i need one now and i dont have an id',
 'what the helly is a medical test??? where do i go? what are they gonna do to me broooo',
 'so they need my fingerprints??? then what? i get my card?'
];
let p=planResearch([user(questions[0])],dubai);
assert.equal(p.privateStatus,true);assert.match(p.clarification,/Which documents/);assert.equal(p.parts[0].topic,'institution');
p=planResearch([user(questions[1])]);assert.match(p.clarification,/UAE or the UK/);
p=planResearch([user(questions[1])],{city:'UAE'});assert.match(p.clarification,/Which emirate/);
p=planResearch([user(questions[1])],dubai);assert.equal(p.clarification,null);assert.equal(p.parts[0].tier,'official');
p=planResearch([user(questions[2])],dubai);assert.equal(p.parts[0].topic,'bank');assert.ok(p.cautions.some(t=>/exemption/.test(t)));
p=planResearch([user(questions[3])],dubai);assert.match(p.clarification,/residence visa/);
p=planResearch([user('My UAE residence visa needs a medical test'),assistant('What is worrying you?'),user(questions[3])],dubai);assert.equal(p.clarification,null);assert.equal(p.parts[0].topic,'medical');
p=planResearch([user(questions[4])],dubai);assert.equal(p.parts[0].topic,'biometrics');assert.ok(p.cautions.some(t=>/completed/.test(t)));
/* Corrections use latest user context, never an assistant's invented location. */
p=planResearch([user('Register my kids for school in Dubai'),assistant('London?'),user('No actually I meant Edinburgh')],dubai);
assert.equal(p.location.country,'uk');assert.equal(p.location.city,'Edinburgh');assert.equal(p.parts[0].topic,'school');
p=planResearch([user('Where do people hang out in Dubai, and what are the visa rules?')]);assert.equal(p.mixed,true);assert.deepEqual(p.parts.map(x=>x.tier),['official','community']);
const part={topic:'biometrics',tier:'official'},location={country:'uae',city:'Dubai'};
for(const url of ['http://icp.gov.ae/x','https://icp.gov.ae.evil.org/x','https://evil.icp.gov.ae/x','https://icp.gov.ae@evil.org/x','https://127.0.0.1/x','https://www.hw.ac.uk/visa','https://www.gov.uk/identity','https://icp.gov.ae/x?redirect=http://127.0.0.1'])
 assert.equal(researchSource(url,part,location),null,url);
assert.ok(researchSource('https://icp.gov.ae/biometrics',part,location));
assert.equal(researchSource('https://www.dha.gov.ae/school',{topic:'school',tier:'official'},location),null);
assert.equal(researchSource('https://www.hw.ac.uk/study',{topic:'institution',tier:'organisation',organisation:'Other University'},location),null);
let calls=[];let reserveCalls=0;
const text='Applicants must attend their biometrics appointment. Fingerprints are part of the identity application process. The identity card application can be tracked using the official service.';
const response=(body,status=200,type='application/json',headers={})=>new Response(body,{status,headers:{'content-type':type,...headers}});
const fetcher=async(url,opts)=>{
 calls.push({url,opts});assert.equal(opts.redirect,'manual');
 if(url.startsWith('https://api.search.brave.com/')){
  assert.equal(opts.headers['X-Subscription-Token'],'test-server-key');
  assert.doesNotMatch(url,/SECRET-ID|passport|email/);
  return response(JSON.stringify({web:{results:[{url:'https://reddit.com/r/dubai',description:'You get your ID instantly'},{url:'https://icp.gov.ae/biometrics',description:'DO NOT USE THIS SNIPPET: guaranteed card in 1 minute'}]}}));
 }
 assert.equal(url,'https://icp.gov.ae/biometrics');assert.equal(opts.headers['X-Subscription-Token'],undefined,'provider key never goes to sources');
 return response('<title>Identity application</title><p>'+text+'</p>',200,'text/html');
};
const env={BRAVE_SEARCH_API_KEY:'test-server-key',AI:{run:async(_m,opts)=>{
 const evidence=JSON.parse(opts.messages[1].content).evidence;
 assert.equal(evidence.length,1);assert.doesNotMatch(JSON.stringify(evidence),/guaranteed|SNIPPET/);
 return {response:JSON.stringify({claims:[{text:'The page describes fingerprints as part of the identity application.',sourceId:'S1',quote:'Fingerprints are part of the identity application process.'}]})};
}}};
const reserve=async()=>{reserveCalls++;return true;};
p=planResearch([user(questions[4]+' SECRET-ID 123456')],dubai);
let result=await answerResearch(p,env,{fetcher,reserve});assert.equal(result.research.status,'evidence-found');assert.equal(result.liveSources[0].url,'https://icp.gov.ae/biometrics');assert.match(result.reply,/\[1\]/);assert.doesNotMatch(result.reply,/guaranteed|SECRET-ID/);assert.equal(reserveCalls,1);
assert.equal(validateResearchAnswer('{"claims":[{"text":"Invented claim","sourceId":"S1","quote":"This does not occur anywhere in the fetched text."}]}',[{id:'S1',excerpt:text}]),null);
const before=calls.length;
assert.equal((await answerResearch(p,{}, {fetcher,reserve})).research.status,'not-configured');assert.equal(calls.length,before);
result=await answerResearch(planResearch([user(questions[0])],dubai),env,{fetcher,reserve});assert.equal(result.research.status,'needs-context');assert.equal(calls.length,before);
result=await searchApproved({query:'identity',part,location,env,fetcher,reserve:async()=>false});assert.equal(result.status,'search-limit');assert.equal(calls.length,before);
/* Redirects never fetch the destination; oversized and irrelevant pages fail. */
let n=0;
assert.equal((await researchPage({url:'https://icp.gov.ae/biometrics',part,location,fetcher:async()=>{n++;return response('',302,'text/html',{location:'https://127.0.0.1/secrets'});}})).ok,false);assert.equal(n,1);
assert.equal((await researchPage({url:'https://icp.gov.ae/biometrics',part,location,fetcher:async()=>response('x'.repeat(650001),200,'text/html')})).ok,false);
assert.equal((await researchPage({url:'https://icp.gov.ae/biometrics',part,location,fetcher:async()=>response('Unrelated content. '.repeat(30),200,'text/html')})).reason,'not-relevant');
/* Daily/monthly reservations are atomic across requests and fail closed. */
const sql=new DatabaseSync(':memory:');const stmt=(s,args=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...args),first:async()=>sql.prepare(s).get(...args)||null});
const budget={BUDGET_DB:{prepare:s=>stmt(s)},SEARCH_DAILY_CAP:'2',SEARCH_MONTHLY_CAP:'3'};
const today=new Date('2026-10-17T12:00:00Z');
assert.equal(await reserveSearch(budget,today),true);assert.equal(await reserveSearch(budget,today),true);assert.equal(await reserveSearch(budget,today),false);assert.equal(await reserveSearch(budget,new Date('2026-10-18T12:00:00Z')),false);
assert.equal(await reserveSearch({}),false);
console.log('Research: founder scenarios, scoped sources, correction, privacy, evidence, redirects and budget passed');
/* Real Worker integration: feature is opt-in and existing authentication and
   model/search quotas run before outbound research. */
const worker=(await import('../workers/orivia-ai-private-trial.mjs')).default;
sql.exec('CREATE TABLE trial_usage (day TEXT PRIMARY KEY,calls INTEGER NOT NULL); DELETE FROM research_usage;');
const host='orivia-ai-preview.habeebahsallah27.workers.dev';
const req=()=>new Request('https://'+host+'/v1/chat',{method:'POST',headers:{origin:'https://'+host,'content-type':'application/json'},body:JSON.stringify({messages:[user('What happens after fingerprints for my UAE ID?')],preferences:{profile:dubai}})});
const workerEnv={...env,...budget,SEARCH_DAILY_CAP:'10',SEARCH_MONTHLY_CAP:'100',RESEARCH_ENABLED:'1',ACCESS_TEST_EMAIL:'founder@example.test',AI_QUOTA:{limit:async()=>({success:true})}};
const ctx={access:{getIdentity:async()=>({email:'founder@example.test'})}};
globalThis.fetch=fetcher;
let w=await worker.fetch(req(),workerEnv,{});assert.equal(w.status,401,'research never bypasses private authentication');
const countBefore=calls.length;
w=await worker.fetch(req(),{...workerEnv,AI_QUOTA:{limit:async()=>({success:false})}},ctx);assert.equal(w.status,429);assert.equal(calls.length,countBefore,'rate rejection happens before search');
w=await worker.fetch(req(),workerEnv,ctx);assert.equal(w.status,200);assert.equal((await w.json()).research.status,'evidence-found');
console.log('Research Worker integration: authenticated, opt-in and rate protected passed');
