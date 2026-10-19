import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {runAssistantTurn} from '../workers/orivia-assistant.mjs';
const dictionary=JSON.parse(fs.readFileSync('workers/trial-ui/translations.json','utf8'));
for(const [key,v]of Object.entries(dictionary)){assert.ok(v.fr&&v.ar,key);assert.equal(typeof v.fr,'string');assert.equal(typeof v.ar,'string')}
function setup(saved='en'){
 const nodes=[['Save',false],['Calendar',false],['Save',true],['Curriculum: British',true]].map(([data,protectedText])=>({data,parentElement:{closest:()=>protectedText}}));
 const field={value:'My own appointment',attrs:{placeholder:'Message Orivia…'},closest:()=>false,getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v}};
 const status={textContent:'Thinking…'},root={lang:'',dir:''};let index=0;
 const ctx={window:{},localStorage:{getItem:()=>JSON.stringify({language:saved})},NodeFilter:{SHOW_TEXT:4},MutationObserver:class{observe(){}},document:{body:{},documentElement:root,createTreeWalker:()=>({nextNode:()=>nodes[index++]||null}),querySelectorAll:()=>[field],getElementById:id=>id==='status'?status:null}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('workers/trial-ui/i18n.js','utf8').replace('/*__TRANSLATIONS__*/{}',JSON.stringify(dictionary)),ctx);
 return {api:ctx.window.OriviaI18n,nodes,field,status,root};
}
const h=setup();h.api.setLanguage('ar');assert.equal(h.root.dir,'rtl');assert.equal(h.root.lang,'ar');assert.equal(h.nodes[0].data,'حفظ');assert.equal(h.nodes[2].data,'Save','saved message is untouched');assert.equal(h.nodes[3].data,'Curriculum: British','source quote untouched');assert.equal(h.field.value,'My own appointment');assert.equal(h.field.attrs.placeholder,'اكتب إلى أوريفيا…');
h.api.setLanguage('fr');assert.equal(h.root.dir,'ltr');assert.equal(h.nodes[0].data,'Enregistrer');assert.equal(h.status.textContent,'Je réfléchis…');
h.api.setLanguage('en');assert.equal(h.nodes[0].data,'Save');assert.equal(h.status.textContent,'Thinking…');assert.equal(h.field.attrs.placeholder,'Message Orivia…');
assert.equal(setup('ar').root.dir,'rtl','saved language applied before chat code');assert.equal(setup('invalid').api.language(),'en');
h.api.setLanguage('fr');assert.equal(h.api.text('Searching: University of Manchester'),'Recherche : University of Manchester');assert.equal(h.api.text('Untranslated source title'),'Untranslated source title');
const code=fs.readFileSync('workers/trial-ui/chat.js','utf8');assert.match(code,/language:uiLanguage\(\)/);assert.match(code,/calendarChangeUI:1/);assert.match(fs.readFileSync('workers/trial-ui/page.html','utf8'),/dir="auto" id="msg"/);
const log=console.log;console.log=()=>{};const prompts=[];
try{await runAssistantTurn({replyLanguage:'fr',messages:[{role:'user',content:'How do I get started?'}]},{},{ai:{run:async(_m,o)=>{prompts.push(JSON.parse(o.messages[1].content));return {response:JSON.stringify({action:'ask',question:'Dans quelle ville êtes-vous ?'})}}}})}finally{console.log=log}
assert.equal(prompts[0].reply_language,'fr');assert.ok(!JSON.stringify(prompts).includes('My own appointment'));
console.log('Languages: complete dictionary pairs, selected/saved language, RTL, repeated switches, unchanged messages/quotes/values, progress and provider preference passed');

for(const lang of ['fr','ar']){
 h.api.setLanguage(lang);
 for(const label of ['Thinking…','Working out what to check…','Writing the answer…','Checking every fact against the sources…','Rechecking the details against the sources…','Checking the official SPEA directory…','Looking things up…'])assert.notEqual(h.api.progress(label),label,lang+': '+label);
 const mixed=h.api.progress('Searching: British schools Sharjah · Reading 3 pages: spea.shj.ae, example.ae · Checking the official SPEA directory…');
 assert.ok(mixed.includes('British schools Sharjah'));assert.ok(mixed.includes('spea.shj.ae, example.ae'));assert.ok(!/Searching|Reading|pages:|Checking/.test(mixed));
 for(const label of ['Read 1 page · deciding what to check next…','Read 3 pages, searched 2 times · deciding what to check next…','searched once · deciding what to check next…'])assert.ok(!/Read|searched|deciding|times|once/.test(h.api.progress(label)),label);
}
h.api.setLanguage('en');assert.equal(h.api.progress('Read 3 pages, searched once · deciding what to check next…'),'Read 3 pages, searched once · deciding what to check next…');
assert.match(code,/OriviaI18n\?\.progress\(text\)/,'the real thinking bubble uses the progress translator');
