/* Files (step 6): private per-account documents. Real SQLite (accounts schema) and an in-memory stand-in for R2.
   Run: node --experimental-sqlite tests/files.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {handleFileRequest,deleteAllFiles,fileType,cleanName,filesRoute,FILE_LIMITS,markFileCleanup,finishFileCleanup,retryFileCleanups} from '../workers/accounts/files.mjs';

const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON;'+fs.readFileSync('workers/accounts/schema.sql','utf8'));
const stmt=(s,a=[])=>({bind:(...v)=>stmt(s,v),run:async()=>sql.prepare(s).run(...a),first:async()=>sql.prepare(s).get(...a)||null,all:async()=>({results:sql.prepare(s).all(...a)})});
const db={prepare:s=>stmt(s)};
const now=new Date().toISOString();
for(const id of ['alice','bob'])sql.prepare('INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,?,?,?)').run(id,id,id+'@example.test',1,now,now);
// R2 stand-in: put/get/delete/list with the same shapes the Worker uses.
const objects=new Map();
const FILES={async put(k,v,o){objects.set(k,{bytes:new Uint8Array(v),type:o?.httpMetadata?.contentType})},async get(k){const o=objects.get(k);return o?{body:new Blob([o.bytes]).stream()}:null},
 async delete(k){for(const x of [].concat(k))objects.delete(x)},async list({prefix}){return {objects:[...objects.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key})),truncated:false}}};
const env={FILES_ENABLED:'1',FILES,ACCOUNTS_DB:db};
const json=(b,s=200)=>Response.json(b,{status:s});
const readJson=async r=>{try{return await r.json()}catch(_){return null}};
const call=(owner,method,path,body,headers={})=>handleFileRequest(new Request('https://pilot.example'+path,{method,body,headers}),env,{owner,expected:headers['X-Orivia-Account']??owner,json,readJson});
const PDF=new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF'),JPG=new Uint8Array([0xFF,0xD8,0xFF,0xE0,0,16,74,70,73,70]),PNG=new Uint8Array([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0,0]);

// The type comes from the bytes, never the name; names are plain text with the right extension.
assert.equal(fileType(PDF),'application/pdf');assert.equal(fileType(JPG),'image/jpeg');assert.equal(fileType(PNG),'image/png');
assert.equal(fileType(new TextEncoder().encode('<html><script>')),null);
assert.equal(cleanName('../../etc/passwd','application/pdf'),'etc passwd.pdf');assert.equal(cleanName('scan.jpeg','image/jpeg'),'scan.jpeg');
assert.equal(cleanName('','image/png'),'Document.png');assert.ok(Array.from(cleanName('x'.repeat(500),'application/pdf')).length<=120);
assert.ok(filesRoute('/api/account/files')&&filesRoute('/api/account/files/0123456789abcdef')&&!filesRoute('/api/account/files/../x'));

// Off unless switched on with storage.
assert.equal((await handleFileRequest(new Request('https://p/api/account/files'),{ACCOUNTS_DB:db},{owner:'alice',json})).status,503);

// Upload, list, open, rename, delete.
let r=await call('alice','POST','/api/account/files',PDF,{'X-File-Name':encodeURIComponent('Tenancy contract.pdf')});assert.equal(r.status,201);
const a1=(await r.json()).file;assert.equal(a1.type,'application/pdf');assert.equal(a1.name,'Tenancy contract.pdf');
assert.ok(objects.has('u/alice/'+a1.id),'stored under the account');
r=await call('alice','POST','/api/account/files',JPG,{'X-File-Name':encodeURIComponent('photo.png')});const a2=(await r.json()).file;assert.equal(a2.type,'image/jpeg','type from content');assert.equal(a2.name,'photo.png.jpg');
let list=await (await call('alice','GET','/api/account/files')).json();assert.equal(list.files.length,2);assert.equal(list.used,PDF.length+JPG.length);assert.equal(list.allowance,100*1024*1024);
r=await call('alice','GET','/api/account/files/'+a1.id);assert.equal(r.status,200);assert.equal(r.headers.get('Content-Type'),'application/pdf');
assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert.match(r.headers.get('Content-Disposition'),/^inline; filename="Tenancy contract.pdf"/);
assert.deepEqual(new Uint8Array(await r.arrayBuffer()),PDF);
assert.match((await call('alice','GET','/api/account/files/'+a1.id+'?download=1')).headers.get('Content-Disposition'),/^attachment/);
r=await call('alice','PATCH','/api/account/files/'+a1.id,JSON.stringify({name:'Lease 2026'}),{'Content-Type':'application/json'});assert.equal((await r.json()).file.name,'Lease 2026.pdf');

// Another account can't see, open, rename or delete it: it looks exactly like a missing file.
assert.equal((await (await call('bob','GET','/api/account/files')).json()).files.length,0);
for(const m of ['GET','PATCH','DELETE'])assert.equal((await call('bob',m,'/api/account/files/'+a1.id,m==='PATCH'?JSON.stringify({name:'x'}):undefined)).status,404,m);
assert.ok(objects.has('u/alice/'+a1.id));

// Writes need the account header (a tab still showing another account can't change files).
assert.equal((await handleFileRequest(new Request('https://p/api/account/files',{method:'POST',body:PDF}),env,{owner:'alice',expected:null,json})).status,428);

// Refused: wrong type, empty, too large, over the account allowance, too many in a day.
assert.equal((await call('alice','POST','/api/account/files',new TextEncoder().encode('<svg onload=alert(1)>'))).status,415);
assert.equal((await call('alice','POST','/api/account/files',new Uint8Array(0))).status,400);
const big=new Uint8Array(FILE_LIMITS.fileBytes+1);big.set(PDF);assert.equal((await call('alice','POST','/api/account/files',big)).status,413);
sql.prepare('INSERT INTO account_files(id,user_id,name,type,size,created_at) VALUES (?,?,?,?,?,?)').run('filler-000001','bob','big.pdf','application/pdf',FILE_LIMITS.accountBytes-10,now);
r=await call('bob','POST','/api/account/files',PDF);assert.equal(r.status,413);assert.equal((await r.json()).error,'allowance_full');
sql.prepare("UPDATE account_file_meter SET count=? WHERE user_id='alice'").run(FILE_LIMITS.dayUploads);
assert.equal((await call('alice','POST','/api/account/files',PNG)).status,429,'daily upload cap');

// Delete one; deleting the account removes every stored file and its records.
assert.equal((await call('alice','DELETE','/api/account/files/'+a2.id)).status,200);assert.ok(!objects.has('u/alice/'+a2.id));
sql.prepare("DELETE FROM user WHERE id='alice'").run();await deleteAllFiles(env,'alice');
assert.equal([...objects.keys()].filter(k=>k.startsWith('u/alice/')).length,0);assert.equal(sql.prepare("SELECT COUNT(*) n FROM account_files WHERE user_id='alice'").get().n,0);

// Ina's review #4: storage fails during account deletion. The cleanup record (written first, not linked to the account)
// survives, says it is pending, and a later bounded retry removes the files.
{sql.prepare('INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES (?,?,?,?,?,?)').run('carol','carol','carol@example.test',1,now,now);
 const r1=await call('carol','POST','/api/account/files',PDF);assert.equal(r1.status,201);const cid=(await r1.json()).file.id;
 await markFileCleanup(env,'carol');sql.prepare("DELETE FROM user WHERE id='carol'").run();
 const broken={...env,FILES:{...FILES,list:async()=>{throw Error('R2 down')}}};
 assert.equal(await finishFileCleanup(broken,'carol'),false,'failure reported, not hidden');
 assert.ok(objects.has('u/carol/'+cid),'file still stored');
 let row=sql.prepare("SELECT attempts,last_error FROM file_cleanup WHERE user_id='carol'").get();assert.equal(row.attempts,1);assert.equal(row.last_error,'Error');
 assert.equal((await call('carol','GET','/api/account/files/'+cid)).status,404,'unreachable meanwhile (its record went with the account)');
 assert.equal(await retryFileCleanups(env,{now:new Date(Date.now()+60000)}),0,'not retried within 5 minutes');
 assert.equal(await retryFileCleanups(env,{now:new Date(Date.now()+600000)}),1,'retried later');
 assert.ok(!objects.has('u/carol/'+cid));assert.equal(sql.prepare("SELECT COUNT(*) n FROM file_cleanup").get().n,0,'record removed once done');}
const handlerSrc=fs.readFileSync('workers/accounts/handler.mjs','utf8').replace(/\r\n/g,'\n');
assert.ok(handlerSrc.indexOf('await markFileCleanup(env,owner)')<handlerSrc.indexOf('auth.api.deleteUser('),'record written before the account is deleted');
assert.ok(handlerSrc.includes('filesPending:!done'),'the response says when files are still being removed');
// Wiring: the routes sit behind the session check; account deletion removes the files.
const handler=fs.readFileSync('workers/accounts/handler.mjs','utf8').replace(/\r\n/g,'\n');
assert.ok(handler.indexOf('if(filesRoute(url.pathname))')>handler.indexOf("if(!session?.user?.id)return json({error:'sign_in_required'},401)"),'after the session check');
assert.ok(handler.includes('const done=await finishFileCleanup(env,owner)'));

// The app: text only, photos re-saved as JPEG, camera only on tap, guests stay in this browser, refreshes with My Life.
const files=fs.readFileSync('workers/trial-ui/files.js','utf8'),page=fs.readFileSync('workers/trial-ui/page.html','utf8'),chat=fs.readFileSync('workers/trial-ui/chat.js','utf8').replace(/\r\n/g,'\n');
assert.doesNotMatch(files,/innerHTML|insertAdjacentHTML/);assert.match(files,/c\.toBlob\(r,'image\/jpeg',q\)/);assert.match(files,/indexedDB\.open\('orivia-files',1\)/);
assert.match(page,/<input type="file" id="files-camera-input" accept="image\/\*" capture="environment" hidden>/);
assert.ok(chat.includes("if(which==='library')try{renderLibrary()}catch(_){}")&&chat.includes('const done=window.OriviaFiles?.render?.();'),'files refresh when the Library opens');
assert.ok(fs.readFileSync('workers/orivia-ai-private-trial.mjs','utf8').includes('window.OriviaFiles='),'shipped in /chat.js');
// Run the client module in a sandbox: a PDF passes through untouched; a non-image, non-PDF is refused.
{const ctx={window:{},document:{getElementById:()=>null},crypto,Blob,URL,indexedDB:null,createImageBitmap:async()=>{throw Error('x')}};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(files,ctx);
 const pdf=new Blob([PDF],{type:'application/pdf'});pdf.name='a.pdf';const p=await ctx.OriviaFiles.prepare(pdf);assert.equal(p.type,'application/pdf');assert.equal(p.blob,pdf);
 const txt=new Blob(['hi'],{type:'text/plain'});txt.name='a.txt';await assert.rejects(()=>ctx.OriviaFiles.prepare(txt),/unsupported_type/);}
console.log('Files: private per account, type from content, limits, no cross-account access, account deletion removes them, app wiring.');
