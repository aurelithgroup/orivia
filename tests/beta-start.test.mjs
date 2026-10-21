/* Exercise the real onboarding handlers with delayed server verification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8');
const fragment=js.slice(js.indexOf("let mode='private',humanOk=true"),js.indexOf("$('clear').onclick"));
function setup(){
 const nodes=new Map();
 const node=()=>({hidden:false,checked:false,textContent:'',children:[],replaceChildren(...v){this.children=v},append(v){this.children.push(v)}});
 const $=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};
 let opts,resolveCheck,shown=0;const saved=new Map();
 const ctx=vm.createContext({$,ck:'consent',show:()=>shown++,AbortSignal,queueMicrotask,sessionStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},
 location:{pathname:'/'},localStorage:{getItem:k=>saved.get('local:'+k)??null,setItem:(k,v)=>saved.set('local:'+k,v),removeItem:k=>saved.delete('local:'+k)},
 document:{body:{dataset:{}},querySelectorAll:()=>[],createTextNode:t=>({textContent:t}),createElement:node,head:{append(){}}},
 window:{turnstile:{render:(_id,o)=>{opts=o},reset(){}}},
 fetch:async url=>url==='/v1/config'?{json:async()=>({mode:'public',turnstileSiteKey:'site'})}:await new Promise(r=>resolveCheck=r)});
 vm.runInContext(fragment,ctx);
 return {$,get options(){return opts},resolve:r=>resolveCheck(r),get shown(){return shown},saved};
}
const tick=()=>new Promise(r=>setImmediate(r));
const a=setup();await tick();a.$('consent').checked=true;
const checking=a.options.callback('token');a.$('start').onclick();
assert.equal(a.shown,0,'Start cannot bypass pending server verification');
a.resolve({ok:true});await checking;
assert.equal(a.shown,1,'Start continues when the delayed server verification succeeds');
const b=setup();await tick();b.$('consent').checked=true;
const failed=b.options.callback('token');b.resolve({ok:false,status:403,json:async()=>({codes:['invalid-input-secret']})});await failed;
const children=b.$('human-note').children;
b.$('start').onclick();assert.equal(b.shown,0);assert.equal(b.$('human-note').children,children,'Start preserves the error and retry button');
assert.match(children[0].textContent,/invalid-input-secret/);assert.equal(children[1].textContent,'Try again');
children[1].onclick();const retry=b.options.callback('fresh-token');b.resolve({ok:true});await retry;
b.$('consent').checked=false;b.$('start').onclick();assert.equal(b.shown,0,'Verification alone never supplies consent');
b.$('consent').checked=true;b.$('start').onclick();assert.equal(b.shown,1);
console.log('Beta Start: pending verification, error preservation, retry and consent passed');
