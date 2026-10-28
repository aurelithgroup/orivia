/* Checked-answer stream (Ina 240f2f7, brought to myorivia-release-plan on 28 Oct): server frames, the client's strict reader,
   and Stop reaching the assistant. The first block is Ina's test as written. Run: node tests/chat-stream.test.mjs */
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {chatStream} from '../workers/orivia-chat-stream.mjs';
import {runAssistantTurn} from '../workers/orivia-assistant.mjs';
// Server frames contain only a complete checked reply, maintain sequence and preserve Unicode.
let upstreamAborted=false;const response=chatStream({request:new Request('https://example.test/chat'),execute:async({onProgress})=>{onProgress('Checking');return {reply:'Checked '+('مرحبا 🌿 '.repeat(100)),liveSources:[]}},fallback:()=>{throw Error('unexpected fallback')}}),frames=(await response.text()).trim().split('\n').map(JSON.parse);assert.equal(frames[0].type,'start');frames.forEach((f,i)=>assert.equal(f.seq,i));assert.equal(new Set(frames.map(f=>f.requestId)).size,1);assert.equal(frames.filter(f=>f.type==='text').map(f=>f.text).join(''),frames.at(-1).result.reply);
const stop=new AbortController();let fallback=0;const cancelled=chatStream({request:new Request('https://example.test/chat',{signal:stop.signal}),execute:async({signal})=>new Promise(resolve=>{signal.addEventListener('abort',()=>{upstreamAborted=true;resolve(null)},{once:true})}),fallback:async()=>{fallback++;return {status:200,body:{reply:'wrong'}}}});const reader=cancelled.body.getReader();await reader.read();await new Promise(r=>setTimeout(r,0));stop.abort();await reader.cancel();await new Promise(r=>setTimeout(r,0));assert.equal(upstreamAborted,true);assert.equal(fallback,0);
// Real client reader: fragmented UTF-8, strict sequence/result matching and cancellation.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8'),readerSource=chat.slice(chat.indexOf('async function readReply('),chat.indexOf('// Once per message:',chat.indexOf('async function readReply(')));
const context={TextDecoder,store:{active:'chat'},working(){},globalThis:{OriviaAccounts:{epoch:'a'}}};vm.createContext(context);vm.runInContext(readerSource+';this.readReply=readReply',context);
const bytes=new TextEncoder().encode(frames.map(f=>JSON.stringify(f)).join('\n'));const split=new Response(new ReadableStream({start(c){for(let i=0;i<bytes.length;i+=7)c.enqueue(bytes.slice(i,i+7));c.close()}}),{headers:{'Content-Type':'application/x-ndjson'}});assert.equal((await context.readReply(split,'chat','a')).d.reply,frames.at(-1).result.reply);
const corrupt=frames.map(f=>({...f}));corrupt[1].seq=99;await assert.rejects(()=>context.readReply(new Response(corrupt.map(f=>JSON.stringify(f)).join('\n'),{headers:{'Content-Type':'application/x-ndjson'}}),'chat','a'),/stream_frame/);
await assert.rejects(()=>context.readReply(new Response(JSON.stringify(frames[0]),{headers:{'Content-Type':'application/x-ndjson'}}),'chat','a'),/stream_incomplete/);

// Stop reaches the assistant: a cancelled turn makes no model call, no search and no page fetch after the cancellation.
{const stop=new AbortController();let modelCalls=0,fetches=0;
 const ai={run:async(_m,o)=>{modelCalls++;assert.ok(o.signal,'the model call carries the person’s signal');stop.abort();return {response:JSON.stringify({action:'tools',calls:[{tool:'web_search',query:'x'}]})}}};
 await assert.rejects(()=>runAssistantTurn({messages:[{role:'user',content:'Emirates ID?'}]},{BRAVE_SEARCH_API_KEY:'k'},{ai,fetcher:async(u,o)=>{fetches++;o?.signal?.throwIfAborted();return Response.json({web:{results:[]}})},reserve:async()=>true,signal:stop.signal}),{name:'AbortError'});
 assert.equal(modelCalls,1,'no further model call after Stop');}
console.log('Chat stream: ordered checked frames, strict client reader, and Stop reaching the provider, the assistant and its fetches.');
