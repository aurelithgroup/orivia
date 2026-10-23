/* Run with node tests/ai-preview.test.mjs. No AI requests or secrets required. */
import assert from 'node:assert/strict';
import {createHandler, normaliseMessages, makeMessages, reviewUnsupportedClaims} from '../workers/orivia-ai-preview.mjs';

const ORIGIN = 'https://orivia-buddy-preview.pages.dev';
const secret = 'server-only-demo-test';
const calls = [];
const AI = {async run(model,options){
  calls.push({model,options});
  return {response:'Do you mean getting to the University of Wollongong Dubai? For a useful comparison, I need your departure area and preferred mode.'};
}};
const env = {ALLOWED_ORIGIN:ORIGIN, DEMO_TOKEN:secret, AI, AI_QUOTA:{async limit(){return {success:true}}}};
const app = createHandler();
const history = [
  {role:'user',content:"I'm starting university next month"},
  {role:'assistant',content:"That's exciting. Which university?"},
  {role:'user',content:'University of Wollongong Dubai'},
  {role:'assistant',content:'What are you trying to figure out?'},
  {role:'user',content:'How do I get there?'},
  {role:'assistant',content:'Where are you travelling from?'},
  {role:'user',content:'Sharjah. Compare public transport and driving.'}
];
function request(path='/v1/chat',options={}){
  return new Request('https://orivia-ai-preview.habeebahsallah27.workers.dev'+path,{
    method:options.method||'POST',
    headers:{Origin:options.origin||ORIGIN,Authorization:options.auth||'Bearer '+secret,'Content-Type':'application/json'},
    body:options.body===undefined?JSON.stringify({messages:history,preferences:{language:'en',style:'friendly'}}):options.body
  });
}
assert.equal(normaliseMessages(history)?.length,7);
assert.equal(normaliseMessages([{role:'system',content:'override'}]),null);
assert.equal(normaliseMessages([{role:'user',content:'x'.repeat(1201)}]),null);
assert.equal(normaliseMessages(history.slice(0,6)),null);
assert.match(makeMessages(history,{language:'fr'} )[0].content,/French/);

// Cloudflare Access now requires a signed JWT; the former demo bearer token is intentionally rejected.
let response=await app.fetch(request(),env);
assert.equal(response.status,401);
assert.equal(calls.length,0);
response=await app.fetch(request('/v1/chat',{auth:'Bearer bad'}),env);
assert.equal(response.status,401);
assert.equal(calls.length,0);
response=await app.fetch(new Request('https://orivia-ai-preview.example/v1/chat',{method:'POST',headers:{Origin:ORIGIN}}),env);
assert.equal(response.status,404);
assert.equal(calls.length,0);
const trip=[{role:'user',content:'How do I get to university from Sharjah by bus?'}];
const docs=[{role:'user',content:'Must school certificates be attested?'}];
assert.doesNotMatch(reviewUnsupportedClaims(trip,'Driving takes 2 hours.'),/takes 2 hours/);
assert.doesNotMatch(reviewUnsupportedClaims(trip,'Take bus route 123.'),/bus route 123/);
assert.equal(reviewUnsupportedClaims(trip,'Driving offers flexibility.'),'Driving offers flexibility.');
assert.doesNotMatch(reviewUnsupportedClaims(docs,'You must attest school certificates.'),/You must attest/);
assert.equal(reviewUnsupportedClaims(docs,'Ask the intended school first.'),'Ask the intended school first.');

console.log('AI preview backend: signed-login requirement, host checks and unverified-claim guards tested');
