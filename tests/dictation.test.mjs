import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const js=fs.readFileSync('workers/trial-ui/chat.js','utf8');
const block=js.slice(js.indexOf('/* ===== Dictation:'),js.indexOf('/* Help: always'));
function harness({supported=true,saved='auto',storageError=false}={}){
 const nodes=new Map();const $=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',hidden:true,disabled:false,readOnly:false,children:[],setAttribute(k,v){this[k]=v},append(o){this.children.push(o)}});return nodes.get(id)};
 const instances=[];class Recognition{constructor(){instances.push(this)}start(){if(this.fail)throw Error('fixture')}stop(){this.stopped=true}abort(){this.aborted=true}}
 const storage=new Map([['orivia-private-mic-note-v2','1']]);
 const ctx={window:supported?{SpeechRecognition:Recognition}:{},navigator:{language:'en-GB'},document:{createElement:()=>({})},$: $,settingsKey:'settings',readSettings:()=>({dictationLanguage:saved}),localStorage:{getItem:k=>storage.get(k),setItem(k,v){if(storageError)throw Error('full');storage.set(k,v)}},stopSpeaking(){},grow(){}};
 vm.createContext(ctx);vm.runInContext(block+'\nsetupDictation();',ctx);
 return {ctx,$,instances,storage,start:()=>vm.runInContext('startDictation()',ctx),stop:keep=>vm.runInContext('stopDictation('+keep+')',ctx)};
}
const result=t=>({results:[[{transcript:t}]]});
const h=harness({saved:'fr-FR'});h.$('msg').value='Bonjour';h.start();const r=h.instances[0];assert.equal(r.lang,'fr-FR');assert.equal(h.$('msg').readOnly,true);r.onstart();assert.match(h.$('listening-text').textContent,/Français/);
r.onresult(result('tout le monde'));assert.equal(h.$('msg').value,'Bonjour tout le monde');h.stop(false);assert.equal(h.$('msg').value,'Bonjour');assert.equal(r.aborted,true);assert.equal(h.$('msg').readOnly,false);
const status=h.$('status').textContent;r.onresult(result('late overwrite'));r.onerror({error:'network'});r.onend();r.onstart();assert.equal(h.$('msg').value,'Bonjour');assert.equal(h.$('status').textContent,status,'cancelled session cannot overwrite status');assert.equal(h.$('listening').hidden,true);
h.start();const r2=h.instances[1];r2.onresult(result('encore'));h.stop(true);assert.equal(h.$('msg').value,'Bonjour encore');assert.equal(r2.stopped,true);r2.onresult(result('late'));assert.equal(h.$('msg').value,'Bonjour encore','Stop keeps visible words');
h.start();const r3=h.instances[2];r.onresult(result('old session'));assert.equal(h.$('msg').value,'Bonjour encore');r3.onerror({error:'not-allowed'});assert.match(h.$('status').textContent,/blocked or dismissed/);r3.onend();assert.match(h.$('status').textContent,/blocked or dismissed/,'onend cannot hide permission errors');assert.equal(h.$('dict-language').disabled,false);
for(const error of ['language-not-supported','no-speech','network','audio-capture','service-not-allowed','unexpected']){h.start();const active=h.instances.at(-1);active.onerror({error});assert.equal(active.aborted,true,'errors release recognition');assert.equal(h.$('msg').readOnly,false);assert.ok(h.$('status').textContent.length>20);active.onresult(result('ignore'));assert.equal(h.$('msg').value,'Bonjour encore')}
const unsupported=harness({supported:false});assert.equal(unsupported.$('mic').hidden,true);assert.equal(unsupported.$('dict-options').hidden,true);unsupported.start();assert.equal(unsupported.instances.length,0);
const auto=harness({saved:'bad-value'});assert.equal(auto.$('dict-language').value,'auto');auto.start();assert.equal(auto.instances[0].lang,'en-GB');auto.instances[0].onend();assert.match(auto.$('status').textContent,/No new speech/);
const note=harness();note.storage.clear();note.start();assert.equal(note.instances.length,0);assert.match(note.$('status').textContent,/may send audio/);note.start();assert.equal(note.instances.length,1);
const limit=harness();limit.$('msg').value='x'.repeat(899);limit.start();limit.instances[0].onresult(result('more words'));assert.equal(limit.$('msg').value.length,900);assert.match(limit.$('listening-text').textContent,/limit reached/);
const natural=harness();natural.start();natural.instances[0].onresult(result('hello'));natural.instances[0].onend();assert.equal(natural.$('msg').readOnly,false);assert.match(natural.$('status').textContent,/Check the text/);
const failed=harness();failed.ctx.window.SpeechRecognition.prototype.start=()=>{throw Error('cannot start')};failed.start();assert.equal(failed.$('msg').readOnly,false);assert.equal(failed.$('listening').hidden,true);assert.match(failed.$('status').textContent,/couldn’t start/);
const full=harness({storageError:true});full.$('dict-language').value='ar-AE';assert.doesNotThrow(()=>full.$('dict-language').onchange());
assert.doesNotMatch(block,/requestSubmit|\.submit\(/,'dictation never sends');
console.log('Dictation: language choice, Cancel/Stop races, stale sessions, permissions, failures, no speech, limits, unsupported browser and no auto-send passed');
