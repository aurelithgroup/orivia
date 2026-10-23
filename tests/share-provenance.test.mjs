/* Share selection with durable reply provenance (ORI-CHAT-009; Ina finding 1, review f99c2b3). Runs the shipped
   share-select.js and chat-versions.js, and the real sendChat stamping. Run: node tests/share-provenance.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const load=f=>{const box={};vm.runInNewContext(fs.readFileSync(f,'utf8'),{window:box});return box};
const S=load('workers/trial-ui/share-select.js').OriviaShare,V=load('workers/trial-ui/chat-versions.js').OriviaVersions;
const src=l=>(Array.isArray(l)?l:[]).map(s=>({...s}));
const clean={v:1,documents:false,university:false};
const reply=(content,origin=clean,extra={})=>({role:'assistant',content,meta:{origin,...extra}});
// Stamped clean replies can be shared; document sources never are.
const plain={turns:[{role:'user',content:'Q1'},reply('A1',clean,{sources:[{title:'ICP',url:'https://icp.gov.ae',category:'official'},{title:'Your document: lease',url:'https://x.example/doc',category:'document'}]}),{role:'user',content:'Q2'},reply('A2')]};
let list=S.candidates(plain,src);assert.deepEqual(list.map(x=>x.excluded),[null,'document',null,null],'a reply citing a document source is excluded even without an attachment (Ina repro 1)');
assert.deepEqual([...S.defaults(list,3)].sort(),[2,3]);
// Ina repro 1 exactly: document-category source, no current attachment or documents → excluded.
assert.equal(S.candidates({turns:[{role:'user',content:'q'},reply('From your lease…',clean,{sources:[{title:'Your document',url:'https://x.example/d',category:'document'}]})]},src)[1].excluded,'document');
// Stamped as document-based (no visible source) → excluded, even after the document is detached from the chat.
assert.equal(S.candidates({turns:[{role:'user',content:'q'},reply('Rent is 4000',{v:1,documents:true,university:false})]},src)[1].excluded,'document');
// Ina repro 2: university reply stays excluded after the context is cleared (clearOrgContext deletes chat.orgContext).
const uni={orgContext:{org:'o',content:'c'},turns:[{role:'user',content:'Q'},reply('Members-only steps',{v:1,documents:false,university:true})]};
assert.equal(S.candidates(uni,src)[1].excluded,'university');delete uni.orgContext;
assert.equal(S.candidates(uni,src)[1].excluded,'university','still excluded after the university context is cleared');
// Older replies without a stamp: excluded conservatively.
assert.equal(S.candidates({turns:[{role:'user',content:'q'},{role:'assistant',content:'old answer'}]},src)[1].excluded,'unverified');
assert.equal(S.candidates({turns:[{role:'user',content:'q'},{role:'assistant',content:'old',meta:{origin:{documents:false}}}]},src)[1].excluded,'unverified','a stamp without version 1 is not trusted');
// Survives version switching and reload (JSON round trip).
const chat={turns:[{role:'user',content:'Read this'},reply('Your lease says…',{v:1,documents:true,university:false}),{role:'user',content:'And this?'},reply('Generic answer')]};
V.fork(chat,2,'Edited question');chat.turns.push(reply('New generic answer'));V.select(chat,0);
const reloaded=JSON.parse(JSON.stringify(chat));
assert.deepEqual(S.candidates(reloaded,src).map(x=>x.excluded),[null,'document',null,null],'origin survives versions and reload');
// Payload never includes excluded replies, even if selected.
const p=S.payload(S.candidates(reloaded,src),new Set([0,1,2,3]),'t',7);assert.ok(!JSON.stringify(p).includes('lease'));
// Attachments and the chat-level fallbacks still apply.
list=S.candidates({documents:[{id:'d'}],turns:[{role:'user',content:'Read',meta:{attachment:{name:'x.pdf'}}},reply('ok')]},src);assert.deepEqual(list.map(x=>x.excluded),['attachment','document']);
// The real send path stamps what the request carried.
const chatSrc=fs.readFileSync('workers/trial-ui/chat.js','utf8');
assert.ok(chatSrc.includes("const sentWith={documents:!!(chatDocuments().length&&pilotConsent()),university:!!currentOrgContext()};"));
assert.ok(chatSrc.includes("const meta={replyRef:newId(),origin:{v:1,documents:sentWith.documents,university:sentWith.university}};"));
assert.ok(chatSrc.includes("Orivia blocks replies it knows were based on your documents or a university guide")&&chatSrc.includes("it can’t guarantee your own text is free of private details"),'no confidentiality guarantee claimed');
console.log('Share provenance: document and university replies stay excluded after context changes, versions and reload; older replies excluded; payload clean: pass.');
