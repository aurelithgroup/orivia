/* Run with node tests/ai-preview.test.mjs. No AI requests or secrets required. */
import assert from 'node:assert/strict';
import {createHandler, normaliseMessages, makeMessages} from '../workers/orivia-ai-preview.mjs';

const ORIGIN = 'https://orivia-buddy-preview.pages.dev';
const secret = 'server-only-demo-test';
const calls = [];
const AI = {async run(model,options){
  calls.push({model,options});
  return {response:'Do you mean getting to the University of Wollongong Dubai? For a useful comparison, I need your departure area and preferred mode.'};
}};
const env = {ALLOWED_ORIGIN:ORIGIN, DEMO_TOKEN:secret, AI};
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
  return new Request('https://orivia-ai-preview.example'+path,{
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

let response=await app.fetch(request(),env);
assert.equal(response.status,200);
let body=await response.json();
assert.match(body.reply,/University of Wollongong Dubai/);
assert.equal(body.liveInformation,false);
assert.deepEqual(body.verifiedSources,[]);
assert.equal(calls.length,1);
assert.equal(calls[0].options.messages.length,history.length+1);
assert.equal(calls[0].options.max_tokens,360);
assert.match(calls[0].options.messages[0].content,/Never invent journeys/);
assert.deepEqual(calls[0].options.messages.slice(1),history);

response=await app.fetch(request('/v1/chat',{auth:'Bearer bad'}),env);
assert.equal(response.status,401);
assert.equal(calls.length,1);
response=await app.fetch(request('/v1/chat',{origin:'https://evil.example'}),env);
assert.equal(response.status,403);
assert.equal(calls.length,1);
response=await app.fetch(request('/v1/chat',{body:JSON.stringify({messages:[{role:'user',content:''}]})}),env);
assert.equal(response.status,400);
assert.equal(calls.length,1);
response=await app.fetch(request('/v1/chat',{body:JSON.stringify({messages:history})}),{...env,AI:null});
assert.equal(response.status,503);
assert.equal(calls.length,1);
console.log('AI preview backend: 12 assertions/check groups passed');
