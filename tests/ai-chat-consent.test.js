/* Run: node tests/ai-chat-consent.test.js; no network calls. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const bridge=fs.readFileSync(path.join(root,'js/orivia-ai-bridge.js'),'utf8');
const buddy=fs.readFileSync(path.join(root,'js/buddy.js'),'utf8');
const patched=buddy.replace("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();",
 "window.__test={get:()=>s,set:x=>Object.assign(s,x),intro:firstVisit,chat:focusScreen,askAI:askOrivia,turns:()=>turns.slice()};");
assert.notEqual(patched,buddy);
const saved={};
const storage={getItem:k=>saved[k]||null,setItem:(k,v)=>{saved[k]=String(v)},removeItem:k=>{delete saved[k]}};
const window={ORIVIA_AI_CONFIG:{enabled:true,path:'/api/orivia/chat'}};
const outgoing=[];
async function fetchStub(path,options){
 outgoing.push({path,options});
 return {ok:true,json:async()=>({reply:"I can help. What's most urgent?",verifiedSources:[],liveInformation:false})};
}
function boot(){
 vm.runInNewContext(bridge,{window});
 vm.runInNewContext(patched,{window,localStorage:storage,sessionStorage:storage,fetch:fetchStub,
   document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null}});
 return window.__test;
}
let app=boot();app.set({onboarded:true,goal:'undecided'});
assert.match(app.intro(),/buddy-ai-consent/);
assert.doesNotMatch(app.intro(),/buddy-first-input/);
assert.equal(outgoing.length,0);
assert.equal(app.askAI('What now?'),undefined);
assert.equal(outgoing.length,0);
saved['orivia-ai-consent-session-v1']='accepted';
app=boot();app.set({onboarded:true,goal:'undecided'});
assert.match(app.intro(),/buddy-first-input/);
(async()=>{
 const reply=await app.askAI("I've just moved. What can I do first?");
 assert.equal(reply.ok,true);
 assert.equal(outgoing.length,1);
 assert.equal(outgoing[0].path,'/api/orivia/chat');
 const sent=JSON.parse(outgoing[0].options.body);
 assert.match(sent.messages.at(-1).content,/just moved/);
 assert.match(app.chat(),/just moved/);
 assert.equal(app.get().goal,'undecided');
 console.log('Private AI consent and open-ended first message tests passed');
})().catch(e=>{console.error(e);process.exitCode=1});
