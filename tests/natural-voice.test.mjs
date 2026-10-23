/* Natural voice for Listen (22 Oct): only the reply's text is sent; its own $1/day meter AND the shared OpenAI limits;
   word-for-word check; gates; the app falls back to the phone voice. SCRIPTED (fake Realtime socket, real SQLite).
   Run: node --experimental-sqlite tests/natural-voice.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleVoice,speak,sameWords,FIDELITY,wav,voiceAvailable,maxVoiceCostMicro,voiceRates,VOICE_MAX_CHARS} from '../workers/orivia-voice.mjs';
import {createPilotWorker,PILOT_CONSENT} from '../workers/orivia-research-pilot.mjs';

function d1(){const sql=new DatabaseSync(':memory:');
 const stmt=(s,args=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...args),first:async()=>sql.prepare(s).get(...args)||null,all:async()=>({results:sql.prepare(s).all(...args)})});
 return {sql,db:{prepare:s=>stmt(s)}}}
const reply=(b,status=200)=>new Response(JSON.stringify(b),{status,headers:{'Content-Type':'application/json'}});
const env0={VOICE_ENABLED:'1',OPENAI_PILOT:'1',VOICE_DAY_USD:'1',VOICE_MONTH_USD:'5',VOICE_TEXT_IN_USD_PER_M:'0.6',VOICE_TEXT_OUT_USD_PER_M:'2.4',VOICE_AUDIO_OUT_USD_PER_M:'20',
 OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',PILOT_OPENAI_DAY_USD:'5',PILOT_OPENAI_MONTH_USD:'20',OPENAI_API_KEY:'test-key'};
// A scripted Realtime socket: records what was sent, answers response.create with audio, a transcript and usage.
function fakeSocket({transcript,audio=new Uint8Array(4800),usage={input_tokens:120,output_token_details:{audio_tokens:300,text_tokens:20}},fail=null}={}){
 const sent=[];let on;
 const connect=async()=>({send:o=>{sent.push(o);if(o.type==='response.create')queueMicrotask(()=>{
   if(fail)return on({type:'error',error:{code:fail}});
   on({type:'response.output_audio.delta',delta:Buffer.from(audio.slice(0,2400)).toString('base64')});
   on({type:'response.output_audio.delta',delta:Buffer.from(audio.slice(2400)).toString('base64')});
   on({type:'response.output_audio_transcript.done',transcript:transcript??o.response.input[0].content[0].text});
   on({type:'response.done',response:{status:'completed',usage}})})},close(){},onEvent:fn=>{on=fn}});
 return {sent,connect};
}
const quiet={log:()=>{}};

// Fidelity: the same words pass (any script, punctuation, spacing); a different or partial reading fails.
assert.ok(sameWords('Call 998 for an ambulance.','call 998 for an ambulance')>0.95);
assert.ok(sameWords('我可以帮你找学校。','我可以帮你找学校')>0.95);
assert.ok(sameWords('Bring your passport and two photos to the office.','Sure! Here is what you need to know about passports.')<FIDELITY);
assert.ok(sameWords('Bring your passport, two photos and the form to the office before Friday.','Bring your passport.')<FIDELITY);
assert.equal(wav(new Uint8Array(10)).length,54);

// Off unless every switch and limit is set.
assert.equal(voiceAvailable({...env0,BUDGET_DB:{prepare(){}}}),true);
for(const k of ['VOICE_ENABLED','OPENAI_PILOT','VOICE_DAY_USD','VOICE_AUDIO_OUT_USD_PER_M'])assert.equal(voiceAvailable({...env0,[k]:'',BUDGET_DB:{prepare(){}}}),false,k);
assert.equal((await handleVoice({text:'Hi'},{...env0},{reply,...quiet})).status,503,'no ledger → nothing sent');

// A normal reading: only that text is sent, WAV comes back, both meters settle to the real cost.
{const {db,sql}=d1();const env={...env0,BUDGET_DB:db};const s=fakeSocket();
 const res=await handleVoice({text:'Your Emirates ID application needs a passport copy.',language:'en'},env,{reply,connect:s.connect,...quiet});
 assert.equal(res.status,200);assert.equal(res.headers.get('Content-Type'),'audio/wav');assert.equal(res.headers.get('Cache-Control'),'no-store');
 assert.equal((await res.arrayBuffer()).byteLength,44+4800);
 const create=s.sent.find(o=>o.type==='response.create');assert.equal(create.response.conversation,'none');
 assert.deepEqual(create.response.input,[{type:'message',role:'user',content:[{type:'input_text',text:'Your Emirates ID application needs a passport copy.'}]}],'only the reply text');
 assert.equal(s.sent.find(o=>o.type==='session.update').session.audio.output.voice,'marin');
 const cost=Math.ceil(120*0.6+300*20+20*2.4);
 const meters=Object.fromEntries(sql.prepare('SELECT id,day_amount FROM spend_meter').all().map(r=>[r.id,r.day_amount]));
 assert.deepEqual(meters,{voice:cost,openai:cost},'voice counts on its own meter and inside the OpenAI limits');}

// Not word for word: no audio (the phone reads it); the cost is still recorded.
{const {db}=d1();const s=fakeSocket({transcript:'Sure, here is some general advice about identity cards.'});
 const res=await handleVoice({text:'Your Emirates ID application needs a passport copy.'},{...env0,BUDGET_DB:db},{reply,connect:s.connect,...quiet});
 assert.equal(res.status,502);assert.equal((await res.json()).error,'voice_not_verbatim');}

// A provider error after sending: usage unknown, so both reservations are kept (never an untracked spend).
{const {db,sql}=d1();const env={...env0,BUDGET_DB:db};const text='Short reply.';
 const res=await handleVoice({text},env,{reply,connect:fakeSocket({fail:'server_error'}).connect,...quiet});assert.equal(res.status,502);
 const max=maxVoiceCostMicro(voiceRates(env),text);for(const r of sql.prepare('SELECT day_amount FROM spend_meter').all())assert.equal(r.day_amount,max);}

// $1/day: once used up, refused before anything is sent; the OpenAI meter is not touched by the refusal.
{const {db,sql}=d1();const env={...env0,BUDGET_DB:db,VOICE_DAY_USD:'0.05'};const s=fakeSocket();
 const res=await handleVoice({text:'Short reply.'},env,{reply,connect:s.connect,...quiet});
 assert.equal(res.status,429);assert.equal(s.sent.length,0,'nothing sent to OpenAI');
 assert.equal(sql.prepare("SELECT COUNT(*) n FROM spend_meter WHERE id='openai'").get()?.n??0,0);}

// Too long or empty text is refused (the app sends pieces of at most 600 characters).
{const {db}=d1();for(const text of ['',' ','x'.repeat(VOICE_MAX_CHARS+1),42])assert.equal((await handleVoice({text},{...env0,BUDGET_DB:db},{reply,...quiet})).status,400);}

// The route: same origin and OpenAI consent required; the config tells the app whether to offer it.
{const {db}=d1();const s=fakeSocket();const worker=createPilotWorker({voiceConnect:s.connect});
 const host='pilot.example',env={...env0,BUDGET_DB:db,PRIVATE_HOST:host,ACCESS_TEST_EMAIL:'tester@example.test'},ctx={access:{getIdentity:async()=>({email:'tester@example.test'})}};
 const req=(body,origin)=>new Request('https://'+host+'/v1/voice',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
 const log=console.log;console.log=()=>{};
 try{
  assert.equal((await (await worker.fetch(new Request('https://'+host+'/v1/config'),env,ctx)).json()).naturalVoice,true);
  assert.equal((await (await worker.fetch(new Request('https://'+host+'/v1/config'),{...env,VOICE_ENABLED:'0'},ctx)).json()).naturalVoice,false);
  assert.equal((await worker.fetch(req({text:'Hello there.'},'https://evil.example'),env,ctx)).status,403,'other sites refused');
  assert.equal((await worker.fetch(req({text:'Hello there.'},'https://'+host),env,ctx)).status,503,'no OpenAI consent: nothing sent');
  assert.equal(s.sent.length,0);
  const ok=await worker.fetch(req({text:'Hello there.',preferences:{providerConsent:{openai:PILOT_CONSENT}}},'https://'+host),env,ctx);
  assert.equal(ok.status,200);assert.equal(ok.headers.get('Content-Type'),'audio/wav');
  assert.equal((await worker.fetch(req({text:'Hello there.',preferences:{providerConsent:{openai:PILOT_CONSENT}}},'https://'+host),env,{})).status,401,'the pilot still needs its private sign-in');
 }finally{console.log=log}}

// The app: tries the natural voice only when offered and agreed, sends only that text, falls back to the phone voice.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),page=fs.readFileSync('workers/trial-ui/page.html','utf8');
assert.ok(chat.includes("function naturalVoiceOn(){return naturalVoiceServer&&readSettings().naturalVoice!==false&&!!pilotConsent()}"));
assert.ok(chat.includes("body:JSON.stringify({text,language:lang,preferences:{providerConsent:pilotConsent()}})"),'only the piece of reply text');
assert.ok(chat.includes("clean=await naturalSpeak(clean,l,run);if(run!==speakRun||!clean)return}"),'what it could not read goes to the phone voice');
assert.ok(chat.includes("for(const c of voiceRequests)c.abort();"),'Stop cancels pending voice requests');
assert.ok(page.includes('id="set-voice"')&&page.includes('AI-generated voice from OpenAI'),'Settings switch says it is an AI voice from OpenAI');
assert.match(fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8'),/media-src blob: data:;/);
console.log('Natural voice: only the reply text, own $1/day meter inside the OpenAI limits, word-for-word check, gates, phone fallback.');
