/* Step 5 (22 Oct): the reply says which language it is in, so Listen picks the right voice; replies the code writes
   itself follow the person's language; the own-site correction tells the model how to fix it. Run: node tests/reply-language.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runAssistantTurn,limitReply,incompleteReply,verifyReply,replyLang,codeText} from '../workers/orivia-assistant.mjs';

const quiet=async f=>{const log=console.log;console.log=()=>{};try{return await f()}finally{console.log=log}};
const turn=(step,replyLanguage='en')=>quiet(()=>runAssistantTurn({messages:[{role:'user',content:'Bonjour, je cherche une école'}],replyLanguage},{},{ai:{run:async()=>({response:JSON.stringify(step)})},fetcher:async()=>new Response(''),reserve:async()=>true}));

// The model's stated language reaches the app; anything unknown is left out (the app then falls back to its guess).
let out=await turn({action:'ask',language:'fr',question:'Dans quelle ville habitez-vous ?',memory:{}});
assert.equal(out.replyLanguage,'fr');
out=await turn({action:'reply',language:'zh',sentences:[{text:'我可以帮你。',kind:'general',evidence:[]}],memory:{}});
assert.equal(out.replyLanguage,'zh');
out=await turn({action:'ask',language:'klingon',question:'Which city?',memory:{}});
assert.ok(!('replyLanguage' in out));
assert.equal(replyLang(' AR '),'ar');assert.equal(replyLang('<script>'),'');assert.equal(replyLang(null),'');

// Code-written replies: French and Arabic when that is the reply language, English otherwise (unchanged).
assert.match(limitReply([],'uae',{},{language:'fr'}).reply,/^J’ai utilisé l’allocation/);
assert.match(limitReply([{role:'user',content:'urgent hospital'}],'uae',{},{language:'ar'}).reply,/998/);
assert.match(limitReply([],'uae',{}).reply,/^I’ve used up today’s research allowance/);
assert.equal(incompleteReply({searches:2},{},[],{language:'ar'}).reply,codeText('ar','incomplete'));
assert.match(incompleteReply({searches:2},{},[]).reply,/^I searched twice, but I couldn’t/);

// The own-site rejection says how to fix it, so a rewrite passes sooner (the rule itself is unchanged).
const ledger=[{id:'E1',url:'https://whichschooladvisor.com/uae/x',title:'X review',kind:'listing',excerpt:'Wes Green is a British school in Sharjah.'}];
const r=verifyReply({action:'reply',sentences:[{text:'Wes Green is a British school.',kind:'organisation_fact',org:'Wes Green',evidence:['E1']}]},ledger,{});
assert.equal(r.ok,false);assert.ok(r.errors.some(e=>/use kind "listing"/.test(e)));

// The app keeps the server's language on the reply and Listen uses it before guessing from the script.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
assert.ok(chat.includes("if(typeof d.replyLanguage==='string'&&Object.hasOwn(VOICE_LOC,d.replyLanguage))meta.lang=d.replyLanguage;"));
assert.ok(chat.includes('listen(spokenText(t.content),lb,{language:t.meta?.lang||null})'));
console.log('Reply language: stated by the model for Listen, code-written replies in fr/ar, clearer own-site correction.');
