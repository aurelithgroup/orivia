/* Files to Chat (step 7): a chosen document is read once (one OpenAI call inside the shared limits), its transcript is
   "your document" evidence, figures must come from it, it never proves an official rule, gates and app wiring.
   SCRIPTED (fake OpenAI, real SQLite). Run: node --experimental-sqlite tests/files-to-chat.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleDocument,cleanDocument,cleanDocuments,pdfPages,DOCUMENT_LIMITS,DOCUMENT_CONSENT} from '../workers/orivia-document.mjs';
import {plainPdf,objectStreamPdf,encryptedPdf,brokenPdf} from './fixtures/make-pdf.mjs';
import vm from 'node:vm';
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
const post=(bytes,headers={})=>new Request('https://pilot.example/v1/document',{method:'POST',headers:{'X-File-Name':encodeURIComponent('Lease.jpg'),'X-Orivia-Document-Consent':DOCUMENT_CONSENT,...headers},body:bytes});

assert.equal(await pdfPages(pdf(3)),3);assert.equal(await pdfPages(pdf(1)),1);
// Ina's review #1: page counts fail closed. Pages hidden in a compressed object stream are counted; anything uncertain is null.
assert.equal(await pdfPages(plainPdf(4)),4);assert.equal(await pdfPages(objectStreamPdf(11)),11);assert.equal(await pdfPages(objectStreamPdf(3)),3);
for(const bad of [encryptedPdf(),brokenPdf(),new TextEncoder().encode('%PDF-1.4\n%%EOF')])assert.equal(await pdfPages(bad),null);
{const {db}=d1();const o=openai();
 let r=await handleDocument(post(objectStreamPdf(11)),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet});assert.equal(r.status,413,'11 compressed pages refused');
 for(const bad of [encryptedPdf(),brokenPdf()]){r=await handleDocument(post(bad),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet});assert.equal(r.status,422);assert.equal((await r.json()).error,'pdf_unreadable')}
 assert.equal(o.calls.length,0,'nothing reached the provider');
 assert.equal((await handleDocument(post(objectStreamPdf(2)),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet})).status,200);
 // Ina's review #5: no Content-Length and a body over 10 MB: refused while reading, nothing sent.
 const big=new Uint8Array(DOCUMENT_LIMITS.bytes+5);big.set(JPG);let sent=0;
 const stream=new ReadableStream({pull(c){if(sent>=big.length)return c.close();const n=Math.min(1<<20,big.length-sent);c.enqueue(big.subarray(sent,sent+n));sent+=n}});
 r=await handleDocument(new Request('https://pilot.example/v1/document',{method:'POST',headers:{'X-Orivia-Document-Consent':DOCUMENT_CONSENT},body:stream,duplex:'half'}),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet});
 assert.equal(r.status,413);assert.equal(o.calls.length,1);
 // The document-specific acknowledgement is required.
 assert.equal((await handleDocument(new Request('https://pilot.example/v1/document',{method:'POST',body:JPG}),{...env0,BUDGET_DB:db},{reply,fetcher:o.fetcher,...quiet})).status,403);}

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

assert.equal(cleanDocuments([{name:'a',text:'x'.repeat(20000)},{name:'b',text:'y'.repeat(20000)},{name:'c',text:'z'.repeat(20000)},{name:'d',text:'w'.repeat(100)}]).reduce((n,d)=>n+d.text.length,0),24000,'at most 3 and 24,000 characters');
assert.equal(cleanDocuments({name:'legacy',text:'one older single document'}).length,1);
// In chat: "your document" evidence; its figures pass, invented ones don't; never an official rule.
const docUrl='https://pilot.example/#your-document';
const turn=async step=>{const log=console.log;console.log=()=>{};try{return await runAssistantTurn({messages:[{role:'user',content:'How much is my rent and how many cheques?'}],document:{name:'Lease.jpg',kind:'tenancy contract',text:TRANSCRIPT,url:docUrl}},{},{ai:{run:async(_m,o)=>{turn.prompt=JSON.parse(o.messages[1].content);return {response:JSON.stringify(step)}}},fetcher:async()=>new Response(''),reserve:async()=>true})}finally{console.log=log}};
let out=await turn({action:'reply',language:'en',sentences:[{text:'Your tenancy contract says the annual rent is AED 52,000, payable in 4 cheques.',kind:'person_document',evidence:['E1']}],memory:{}});
assert.equal(turn.prompt.person_documents[0].evidence,'E1');assert.match(turn.prompt.person_documents_note,/may contain reading mistakes/);
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
assert.ok(chat.includes("const readFirst=pendingAttachment&&!pendingAttachment.read?pendingAttachment:null;\n if(readFirst&&!(await readPendingAttachment()))return;"),'nothing is read before the notice is accepted');
// Ina's composer: choosing only previews; Send reads first; declined or failed keeps the draft and file; shown in the message.
assert.ok(chat.indexOf("turns.push({role:'user',content:text.slice(0,900)")<chat.indexOf('const result=await readAttached(readFirst.blob,readFirst.name);'),'the message is shown first, then the file is read');
assert.ok(chat.includes('readFirst.read=true;activeChatRequest=controller;')&&chat.includes('pendingAttachment=attachedFile;renderAttachmentPreview();'),'one reading per draft; a failed reading puts the message and file back');
assert.ok(chat.includes("turns.push({role:'user',content:text.slice(0,900),...(sentAttachment?{meta:{attachment:sentAttachment}}:{})});"),'the attachment travels inside the person message');
assert.ok(chat.includes("card.className='message-attachment is-photo'")&&chat.includes("attachmentPreviews.set(sentAttachment.id,URL.createObjectURL(pendingAttachment.blob))"),'the photo shows inside the message (this session only)');
assert.ok(!/id="msg"[^>]*required/.test(page),'a message can be only an attachment');
{const vt=new Function(chat.split(String.fromCharCode(10)).find(l=>l.startsWith("const validTurn="))+';return validTurn')();
 assert.ok(vt({role:'user',content:'',meta:{attachment:{name:'Lease.pdf'}}}));assert.ok(!vt({role:'user',content:''}));assert.ok(!vt({role:'assistant',content:'',meta:{attachment:{name:'x'}}}));
 const cm=new Function(chat.split(String.fromCharCode(10)).find(l=>l.startsWith("function chatMessages(turns){")).split(' // only the active chat')[0]+';return chatMessages')();
 const m=cm([{role:'user',content:'',meta:{attachment:{name:'Lease.pdf'}}}]);assert.equal(m[0].content,'Please help me with the document I shared (Lease.pdf).','internal prompt, not saved as the person words');}
assert.ok(chat.includes("...(chatDocuments().length&&pilotConsent()?{documents:documentsForMessage()}:{}),"),'the documents go with every message in the chat');
// Founder 22 Oct: documents are part of the conversation (no label, no ✕); several per chat; follow-ups can use them.
assert.ok(chat.includes("function renderDocContext(){const a=$('attach');if(a)a.hidden=!attachAllowed();const box=$('doc-context');if(box){box.hidden=true;box.replaceChildren()}}"),'no label and no ✕');
assert.ok(chat.includes("if(c){c.documents=[...(Array.isArray(c.documents)?c.documents:[]),doc];persist()}"),'a new document is added, never replacing earlier ones');
{const dm=new Function('activeChat','pendingDocuments',chat.split(String.fromCharCode(10)).filter(l=>l.startsWith('function chatDocuments(){')||l.startsWith('function documentsForMessage(){')).join(String.fromCharCode(10))+';return documentsForMessage');
 const chatWith=docs=>dm(()=>({documents:docs}),[]);
 const sent=chatWith([{name:'old',text:'a'.repeat(5000),addedAt:1},{name:'mid',text:'b'.repeat(5000),addedAt:2},{name:'new',text:'c'.repeat(5000),addedAt:3},{name:'oldest',text:'d',addedAt:0}])();
 assert.deepEqual(sent.map(d=>d.name),['new','mid','old'],'newest three go with each message');
 const big=chatWith([{name:'x',text:'é'.repeat(12000),addedAt:2},{name:'y',text:'é'.repeat(12000),addedAt:1},{name:'z',text:'é'.repeat(12000),addedAt:0}])();
 assert.ok(big.reduce((n,d)=>n+d.text.length,0)<=24000,'about 24,000 characters together');}
assert.ok(chat.includes("function attachAllowed(){return documentsServer&&!!pilotConsent()}"));
assert.ok(!chat.includes('delete x.document'),'never removes another chat document');
assert.match(page,/<button id="attach" class="compose-plus" type="button" aria-label="Add a photo or file"/);
assert.ok(chat.includes("It doesn’t check whether a document is genuine or valid."));
// Ina's review #2 and #3, on the real readAttached code: late results never cross chats/accounts; nothing is evicted.
{const a=chat.indexOf('/* Files to Chat (step 7)'),b=chat.indexOf('var pendingDocuments=[];');const block=chat.slice(a,b)+'var pendingDocuments=[];';
 function harness(){
  const nodes=new Map(),node=()=>({hidden:true,textContent:'',children:[],dataset:{},replaceChildren(...v){this.children=v},append(...v){this.children.push(...v)},setAttribute(){},focus(){},click(){}});
  let resolve;const ctx={console,TextEncoder,AbortController,JSON,Date,Error,
   $:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},el:(t,c,x)=>({tag:t,textContent:x||'',append(){},setAttribute(){}}),
   uiText:t=>t,persisted:0,newId:()=>Math.random().toString(36).slice(2),store:{active:'c1',chats:[{id:'c1',turns:[]},{id:'c2',turns:[]}]},pilotConsent:()=>({openai:'consent'}),
   localStorage:{getItem:()=>null,setItem(){}},window:{},
   fetch:(url,init)=>new Promise((res,rej)=>{resolve=v=>v instanceof Error?rej(v):res(v);init.signal?.addEventListener('abort',()=>rej(Object.assign(Error('aborted'),{name:'AbortError'})))})};
  ctx.globalThis=ctx;ctx.OriviaAccounts={epoch:'acct-A'};ctx.activeChat=()=>ctx.store.chats.find(c=>c.id===ctx.store.active)||null;ctx.persist=()=>{ctx.persisted++};
  vm.createContext(ctx);vm.runInContext(block+';this.readAttached=readAttached;this.cancelAttach=cancelAttach;this.getPending=()=>pendingDocuments.length?pendingDocuments:null;',ctx);
  const ok=(text='Annual rent AED 52,000 payable in 4 cheques',name='Lease.jpg')=>({ok:true,json:async()=>({document:{name,kind:'tenancy contract',text}})});
  return {ctx,ok,answer:v=>resolve(v)};
 }
 const tick=()=>new Promise(r=>setTimeout(r,0));
 {const h=harness();const p=h.ctx.readAttached(new Blob(['x']),'Lease.jpg');await tick();h.answer(h.ok());await p;assert.equal(h.ctx.store.chats[0].documents[0].name,'Lease.jpg','normal: lands on its chat')}
 {const h=harness();const p=h.ctx.readAttached(new Blob(['x']),'L');await tick();h.ctx.store.active='c2';h.answer(h.ok());await p;assert.ok(!h.ctx.store.chats.some(c=>c.documents),'switched chat: dropped')}
 {const h=harness();const p=h.ctx.readAttached(new Blob(['x']),'L');await tick();h.ctx.OriviaAccounts.epoch='acct-B';h.answer(h.ok());await p;assert.ok(!h.ctx.store.chats.some(c=>c.documents),'another account: dropped')}
 {const h=harness();const p=h.ctx.readAttached(new Blob(['x']),'L');await tick();h.ctx.cancelAttach();await p;assert.ok(!h.ctx.store.chats.some(c=>c.documents));assert.equal(h.ctx.getPending(),null,'sign-out (leave) aborts')}
 {const h=harness();h.ctx.store.active=null;const p=h.ctx.readAttached(new Blob(['x']),'L');await tick();h.ctx.cancelAttach();h.answer(h.ok());await p;assert.equal(h.ctx.getPending(),null,'new empty chat then another: dropped')}
 {const h=harness();const p=h.ctx.readAttached(new Blob(['x']),'L');await tick();h.ctx.store.chats.shift();h.ctx.store.active=null;h.answer(h.ok());await p;assert.equal(h.ctx.getPending(),null,'chat deleted: dropped')}
 {const h=harness();const p=h.ctx.readAttached(new Blob(['x']),'L');await tick();h.ctx.store.active='c2';h.answer(Error('network'));assert.equal(await p,false,'late error: nothing to show on the other chat')}
 {const h=harness();const heavy='عقد إيجار سنوي ٥٢٬٠٠٠ درهم '.repeat(300);h.ctx.store.chats=Array.from({length:9},(_,i)=>({id:'k'+i,turns:[],...(i<8?{documents:[{name:'d'+i,text:heavy,addedAt:i}]}:{})}));h.ctx.store.active='k8';
  let p=h.ctx.readAttached(new Blob(['x']),'ninth');await tick();h.answer(h.ok(heavy,'ninth'));await p;
  assert.equal(h.ctx.store.chats.filter(c=>c.documents).length,9,'nine attachments: none evicted');
  const huge='é'.repeat(12000);h.ctx.store.chats.push(...Array.from({length:40},(_,i)=>({id:'z'+i,turns:[],documents:[{name:'z',text:huge}]})),{id:'last',turns:[]});h.ctx.store.active='last';
  const before=JSON.stringify(h.ctx.store.chats);p=h.ctx.readAttached(new Blob(['x']),'one more');await tick();h.answer(h.ok(heavy,'more'));await p;
  assert.equal(JSON.stringify(h.ctx.store.chats),before,'over the backup size: refused, nothing changed');}
}
// Founder test 22 Oct: drawing a message with an attachment crashed (draw() has a local `el`), so nothing was shown or
// sent. Run the real draw() on such a message.
{const a=chat.indexOf('function draw({newReply=null,scroll=false}={}){'),b=chat.indexOf('\n}\n',a)+3;const src=chat.slice(a,b);
 const mk=tag=>({tag,className:'',textContent:'',children:[],prepend(...v){this.children.unshift(...v)},classList:{add(){},toggle(){}},append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},setAttribute(){},style:{}});
 const nodes={history:mk('div'),empty:mk('div'),'chat-scroll':Object.assign(mk('div'),{scrollTop:0,scrollHeight:0})};
 const ctx={document:{createElement:mk},$:id=>nodes[id]||mk('div'),uiText:t=>t,window:{},renderedChat:null,store:{active:'c1'},nearChatBottom:()=>true,safeSources:()=>[],citedText:()=>[],attachmentPreviews:new Map([['a2','blob:preview-1']]),globalThis:{},
  turns:[{role:'user',content:'What does this say about the deposit?',meta:{attachment:{name:'Lease.pdf',type:'application/pdf'}}},{role:'user',content:'',meta:{attachment:{id:'a2',name:'Photo 22-10.jpg',type:'image/jpeg'}}}]};
 vm.createContext(ctx);vm.runInContext(src+';this.draw=draw;',ctx);
 assert.doesNotThrow(()=>ctx.draw({scroll:true}));
 const bubbles=nodes.history.children;assert.equal(bubbles.length,2);
 const cards=bubbles.map(p=>p.children.find(c=>String(c.className).startsWith('message-attachment')));
 assert.equal(cards[0].className,'message-attachment is-file');assert.deepEqual(cards[0].children.map(c=>c.textContent),['PDF','Lease.pdf']);
 assert.equal(cards[1].className,'message-attachment is-photo','a photo shows as a picture');assert.equal(cards[1].children[0].src,'blob:preview-1');}
// + opens the device picker directly (one input: photos, camera and files as the phone offers them).
assert.ok(chat.includes("function openAttach(){if(attachOp||attachConfirm)return;closeAttach();$('attach-file').click()}"));
assert.match(page,/<input type="file" id="attach-file" accept="image\/\*,application\/pdf" hidden>/);
assert.ok(!page.includes('id="attach-camera"')&&!page.includes('id="attach-photo"'));
// The person’s own document is a plain note under the reply: no circle in the text, not in the web sources list.
assert.ok(chat.includes("docSrcs=allSrcs.filter(s=>s.category==='document'),srcs=allSrcs.filter(s=>s.category!=='document')")&&chat.includes("note.className='doc-note'"));
console.log('Files to Chat: read once inside the OpenAI limits, labelled evidence, figures from the document only, gates, app wiring.');
