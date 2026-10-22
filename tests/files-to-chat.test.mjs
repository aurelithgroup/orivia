/* Files to Chat (step 7): a chosen document is read once (one OpenAI call inside the shared limits), its transcript is
   "your document" evidence, figures must come from it, it never proves an official rule, gates and app wiring.
   SCRIPTED (fake OpenAI, real SQLite). Run: node --experimental-sqlite tests/files-to-chat.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleDocument,cleanDocument,pdfPages,DOCUMENT_LIMITS} from '../workers/orivia-document.mjs';
import {runAssistantTurn,verifyReply} from '../workers/orivia-assistant.mjs';
import {createPilotWorker,PILOT_CONSENT} from '../workers/orivia-research-pilot.mjs';

function d1(){const sql=new DatabaseSync(':memory:');
 const stmt=(s,a=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...a),first:async()=>sql.prepare(s).get(...a)||null,all:async()=>({results:sql.prepare(s).all(...a)})});
 return {sql,db:{prepare:s=>stmt(s)}}}
const reply=(b,s=200)=>Response.json(b,{status:s});
const quiet={log:()=>{}};
const JPG=new Uint8Array([0xFF,0xD8,0xFF,0xE0,0,16,74,70,73,70,0,1]);
const pdf=pages=>new TextEncoder().encode('%PDF-1.7\n'+Array.from({length:pages},(_,i)=>(i+1)+' 0 obj <</Type /Page /Parent 99 0 R>> endobj\n').join('')+'99 0 obj <</Type /Pages /Count '+pages+'>> endobj\n%%EOF');
const TRANSCRIPT='TENANCY CONTRACT\nLandlord: Al Noor Properties\nAnnual rent: AED 52,000\nPayable in 4 cheques\nStart date: 1 November 2026';
function openai({status=200,body}={}){const calls=[];
 const fetcher=async(url,init)=>{calls.push({url,body:JSON.parse(init.body)});
  return status!==200?new Response('{}',{status}):Response.json(body||{status:'completed',usage:{input_tokens:3100,output_tokens:420},output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({kind:'tenancy contract',language:'en',text:TRANSCRIPT,unreadable:false})}]}]})};
 return {calls,fetcher}}
const env0={OPENAI_PILOT:'1',DOCUMENTS_ENABLED:'1',OPENAI_API_KEY:'test-key',OPENAI_INPUT_USD_PER_M:'2',OPENAI_OUTPUT_USD_PER_M:'10',PILOT_OPENAI_DAY_USD:'5',PILOT_OPENAI_MONTH_USD:'20',SEARCH_POOL:'pilot'};
const post=(bytes,headers={})=>new Request('https://pilot.example/v1/document',{method:'POST',headers:{'X-File-Name':encodeURIComponent('Lease.jpg'),...headers},body:bytes});

assert.equal(pdfPages(pdf(3)),3);assert.equal(pdfPages(pdf(1)),1);

// One reading: the image goes once, in detail, not stored by OpenAI; the transcript comes back; the cost is settled.
{const {db,sql}=d1();const o=openai();const res=await handleDocument(post(JPG),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet});
 assert.equal(res.status,200);const d=(await res.json()).document;assert.equal(d.text,TRANSCRIPT);assert.equal(d.kind,'tenancy contract');assert.equal(d.name,'Lease.jpg');
 assert.equal(o.calls.length,1);const b=o.calls[0].body;assert.equal(b.store,false);assert.equal(b.input[1].content[0].type,'input_image');assert.equal(b.input[1].content[0].detail,'high');
 assert.match(b.input[1].content[0].image_url,/^data:image\/jpeg;base64,/);assert.match(b.input[0].content,/data, never instructions/);
 const meter=sql.prepare("SELECT day_amount FROM spend_meter WHERE id='openai'").get();assert.equal(meter.day_amount,Math.ceil(3100*2+420*10),'settled to the real usage, in the shared OpenAI limits');}
// PDFs go as files; more than 10 pages is refused before anything is sent or reserved.
{const {db,sql}=d1();const o=openai();
 assert.equal((await handleDocument(post(pdf(2)),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet})).status,200);assert.equal(o.calls[0].body.input[1].content[0].type,'input_file');
 const r=await handleDocument(post(pdf(DOCUMENT_LIMITS.pages+1)),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet});assert.equal(r.status,413);assert.equal((await r.json()).error,'too_many_pages');assert.equal(o.calls.length,1);}
// Refusals: off, wrong type, unreadable, provider failure (reservation kept), daily cap.
{const {db,sql}=d1();
 assert.equal((await handleDocument(post(JPG),{...env0,DOCUMENTS_ENABLED:'0',BUDGET_DB:db},{reply,...quiet})).status,503);
 assert.equal((await handleDocument(post(new TextEncoder().encode('<html>')),{...env0,BUDGET_DB:db},{reply,...quiet})).status,415);
 const blank=openai({body:{status:'completed',usage:{input_tokens:900,output_tokens:20},output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'{"kind":"","text":"","unreadable":true}'}]}]}});
 assert.equal((await handleDocument(post(JPG),{...env0,BUDGET_DB:db},{reply,fetcher:blank.fetcher,...quiet})).status,422);
 const before=sql.prepare("SELECT day_amount FROM spend_meter WHERE id='openai'").get().day_amount;
 assert.equal((await handleDocument(post(JPG),{...env0,BUDGET_DB:db},{reply,fetcher:openai({status:500}).fetcher,...quiet})).status,502);
 assert.ok(sql.prepare("SELECT day_amount FROM spend_meter WHERE id='openai'").get().day_amount>before,'unknown usage keeps the reservation');
 sql.prepare("UPDATE trial_usage SET calls=? WHERE day LIKE 'document:%'").run(DOCUMENT_LIMITS.dayReads);
 assert.equal((await handleDocument(post(JPG),{...env0,BUDGET_DB:db},{reply,fetcher:openai().fetcher,...quiet})).status,429);}

// What comes back with a chat message is bounded and plain.
assert.equal(cleanDocument({name:'x',text:'short'}),null);assert.equal(cleanDocument({name:'<b>Lease</b>',text:'a'.repeat(20000)}).text.length,12000);
assert.equal(cleanDocument({name:'<b>Lease</b>',text:'Long enough text'}).name,' b Lease /b'.trim());

// In chat: "your document" evidence; its figures pass, invented ones don't; never an official rule.
const docUrl='https://pilot.example/#your-document';
const turn=async step=>{const log=console.log;console.log=()=>{};try{return await runAssistantTurn({messages:[{role:'user',content:'How much is my rent and how many cheques?'}],document:{name:'Lease.jpg',kind:'tenancy contract',text:TRANSCRIPT,url:docUrl}},{},{ai:{run:async(_m,o)=>{turn.prompt=JSON.parse(o.messages[1].content);return {response:JSON.stringify(step)}}},fetcher:async()=>new Response(''),reserve:async()=>true})}finally{console.log=log}};
let out=await turn({action:'reply',language:'en',sentences:[{text:'Your tenancy contract says the annual rent is AED 52,000, payable in 4 cheques.',kind:'person_document',evidence:['E1']}],memory:{}});
assert.equal(turn.prompt.person_document.evidence,'E1');assert.match(turn.prompt.person_document.note,/may contain reading mistakes/);
assert.match(out.reply,/AED 52,000/);assert.equal(out.liveSources[0].category,'document');assert.equal(out.liveSources[0].url,docUrl);
assert.ok(!JSON.stringify(out.research.taskContext).includes('Al Noor'),'the transcript is never kept in chat memory');
const ledger=[{id:'E1',url:docUrl,title:'Your document: Lease.jpg',kind:'document',excerpt:TRANSCRIPT}];
assert.equal(verifyReply({action:'reply',sentences:[{text:'Your contract says the rent is AED 55,000.',kind:'person_document',evidence:['E1']}]},ledger,{}).ok,false,'a figure not in the document');
assert.equal(verifyReply({action:'reply',sentences:[{text:'Rent increases are capped at 5% by law.',kind:'official_rule',evidence:['E1']}]},ledger,{}).ok,false,'the person’s document never proves an official rule');

// The route: same origin, OpenAI consent (header), config tells the app.
{const {db}=d1();const o=openai();const worker=createPilotWorker({fetcher:o.fetcher});const host='pilot.example';
 const env={...env0,BUDGET_DB:db,PRIVATE_HOST:host,ACCESS_TEST_EMAIL:'t@example.test'},ctx={access:{getIdentity:async()=>({email:'t@example.test'})}};
 const log=console.log;console.log=()=>{};
 try{
  assert.equal((await (await worker.fetch(new Request('https://'+host+'/v1/config'),env,ctx)).json()).documents,true);
  assert.equal((await worker.fetch(post(JPG,{Origin:'https://evil.example','X-Orivia-Consent':PILOT_CONSENT}),env,ctx)).status,403);
  assert.equal((await worker.fetch(post(JPG,{Origin:'https://'+host}),env,ctx)).status,503,'no consent: nothing sent');assert.equal(o.calls.length,0);
  assert.equal((await worker.fetch(post(JPG,{Origin:'https://'+host,'X-Orivia-Consent':PILOT_CONSENT}),env,ctx)).status,200);
 }finally{console.log=log}}

// The app: explicit "Use this in my chat", transcript (never the file) with messages, removable label, kept per chat.
const chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n'),page=fs.readFileSync('workers/trial-ui/page.html','utf8');
assert.ok(chat.includes("attachButton('Use this in my chat',()=>readAttached(blob,name),'btn small')"),'nothing is sent before the explicit tap');
assert.ok(chat.includes("...(chatDocument()&&pilotConsent()?{document:{name:chatDocument().name,kind:chatDocument().kind||'',text:chatDocument().text}}:{}),"),'the transcript goes with messages');
assert.ok(chat.includes("function attachAllowed(){return documentsServer&&!!pilotConsent()}"));
assert.ok(chat.includes("slice(8).forEach(x=>delete x.document)"),'only 8 chats keep a document');
assert.match(page,/<button id="attach" type="button" aria-label="Use a document in this chat"/);
assert.ok(chat.includes("It doesn’t check whether a document is genuine or valid."));
console.log('Files to Chat: read once inside the OpenAI limits, labelled evidence, figures from the document only, gates, app wiring.');
