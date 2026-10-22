/* Files (step 6, 22 Oct). A signed-in person's own documents: private per-account storage (R2 binding FILES, keys
 * u/<account>/<file>), reachable only through these routes after the session check in handler.mjs. No public URLs, no
 * sharing with organisations, nothing sent to an AI and nothing read or checked by Orivia. PDF, JPEG and PNG only (the
 * app re-saves photos as JPEG on the device first, which also drops their location data). Kept until the person deletes
 * them; deleting the account deletes them. Logs nothing about names or contents. */
export const FILE_LIMITS={fileBytes:10*1024*1024,accountBytes:100*1024*1024,dayUploads:40,files:500};
// What the bytes must start with: the type is decided by the content, not by the name or the browser's label.
const SIGNATURES={'application/pdf':[0x25,0x50,0x44,0x46],'image/jpeg':[0xFF,0xD8,0xFF],'image/png':[0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]};
export const fileType=bytes=>Object.keys(SIGNATURES).find(t=>SIGNATURES[t].every((b,i)=>bytes[i]===b))||null;
export const filesRoute=p=>p==='/api/account/files'||/^\/api\/account\/files\/[A-Za-z0-9-]{8,64}$/.test(p);
export const filesAvailable=env=>env?.FILES_ENABLED==='1'&&!!env?.FILES?.put&&!!env?.ACCOUNTS_DB?.prepare;
/** A display name: plain text, no folders or control characters, at most 120 characters, with a sensible extension. */
export function cleanName(name,type){
 let n=String(name??'').normalize('NFC').replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g,' ').replace(/\.{2,}/g,' ').replace(/\s+/g,' ').trim().replace(/^[.\s]+/,'');
 const ext={'application/pdf':'.pdf','image/jpeg':'.jpg','image/png':'.png'}[type]||'';
 if(!n)n='Document';if(ext&&!new RegExp('\\.('+(type==='image/jpeg'?'jpe?g':ext.slice(1))+')$','i').test(n))n+=ext;
 return Array.from(n).slice(0,120).join('');
}
const SCHEMA=['CREATE TABLE IF NOT EXISTS account_files(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, name TEXT NOT NULL, type TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL)',
 'CREATE INDEX IF NOT EXISTS account_files_user ON account_files(user_id, created_at)',
 'CREATE TABLE IF NOT EXISTS account_file_meter(user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE, day TEXT NOT NULL, count INTEGER NOT NULL)'];
const schemaReady=new WeakSet(); // tables created once per database binding in this isolate
const key=(owner,id)=>'u/'+owner+'/'+id;
const view=r=>({id:r.id,name:r.name,type:r.type,size:r.size,createdAt:r.created_at});
async function readBody(req,max){
 if(!req.body)return new Uint8Array(0);const reader=req.body.getReader(),parts=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){try{await reader.cancel()}catch(_){}throw Error('body_too_large')}parts.push(value)}
 const out=new Uint8Array(size);let o=0;for(const p of parts){out.set(p,o);o+=p.byteLength}return out;
}
async function usage(db,owner){const r=await db.prepare('SELECT COALESCE(SUM(size),0) AS bytes, COUNT(*) AS n FROM account_files WHERE user_id=?').bind(owner).first();return {bytes:Number(r?.bytes||0),files:Number(r?.n||0)}}

/** Every file route after the session check. owner: the signed-in account; expected: its X-Orivia-Account header. */
export async function handleFileRequest(req,env,{owner,expected,json,readJson,now=()=>new Date(),newId=()=>crypto.randomUUID()}){
 if(!filesAvailable(env))return json({error:'files_unavailable'},503);
 const db=env.ACCOUNTS_DB,url=new URL(req.url),id=url.pathname.split('/')[4]||'';
 if(!['GET','HEAD'].includes(req.method)&&!expected)return json({error:'account_header_required'},428);
 if(!schemaReady.has(db)){for(const s of SCHEMA)await db.prepare(s).run();schemaReady.add(db)}
 if(!id&&req.method==='GET'){
  const rows=await db.prepare('SELECT id,name,type,size,created_at FROM account_files WHERE user_id=? ORDER BY created_at DESC LIMIT 500').bind(owner).all();
  const u=await usage(db,owner);return json({files:(rows.results||[]).map(view),used:u.bytes,allowance:FILE_LIMITS.accountBytes,fileLimit:FILE_LIMITS.fileBytes});
 }
 if(!id&&req.method==='POST'){
  const declared=Number(req.headers.get('Content-Length')||0);if(declared>FILE_LIMITS.fileBytes)return json({error:'file_too_large'},413);
  let bytes;try{bytes=await readBody(req,FILE_LIMITS.fileBytes)}catch(e){if(e?.message==='body_too_large')return json({error:'file_too_large'},413);throw e}
  if(!bytes.length)return json({error:'empty_file'},400);
  const type=fileType(bytes);if(!type)return json({error:'unsupported_type'},415);
  let name='';try{name=decodeURIComponent(req.headers.get('X-File-Name')||'')}catch(_){}name=cleanName(name,type);
  const u=await usage(db,owner);if(u.files>=FILE_LIMITS.files||u.bytes+bytes.length>FILE_LIMITS.accountBytes)return json({error:'allowance_full',used:u.bytes,allowance:FILE_LIMITS.accountBytes},413);
  const day=now().toISOString().slice(0,10);
  const counted=await db.prepare('INSERT INTO account_file_meter(user_id,day,count) VALUES (?1,?2,1) ON CONFLICT(user_id) DO UPDATE SET count=CASE WHEN day=?2 THEN count+1 ELSE 1 END, day=?2 WHERE (CASE WHEN day=?2 THEN count+1 ELSE 1 END)<=?3 RETURNING count').bind(owner,day,FILE_LIMITS.dayUploads).first();
  if(!counted)return json({error:'daily_upload_limit'},429);
  const fid=newId(),created=now().toISOString();
  await env.FILES.put(key(owner,fid),bytes,{httpMetadata:{contentType:type}});
  // One statement checks the allowance again, so two uploads at once can't go over it together.
  const row=await db.prepare('INSERT INTO account_files(id,user_id,name,type,size,created_at) SELECT ?1,?2,?3,?4,?5,?6 WHERE (SELECT COALESCE(SUM(size),0) FROM account_files WHERE user_id=?2)+?5<=?7 RETURNING id').bind(fid,owner,name,type,bytes.length,created,FILE_LIMITS.accountBytes).first();
  if(!row){await env.FILES.delete(key(owner,fid));return json({error:'allowance_full'},413)}
  return json({file:{id:fid,name,type,size:bytes.length,createdAt:created}},201);
 }
 if(!id)return json({error:'not_found'},404);
 const row=await db.prepare('SELECT id,name,type,size,created_at FROM account_files WHERE id=? AND user_id=?').bind(id,owner).first();
 if(!row)return json({error:'not_found'},404); // someone else's file looks exactly like a missing one
 if(req.method==='GET'){
  const obj=await env.FILES.get(key(owner,id));if(!obj)return json({error:'not_found'},404);
  const download=url.searchParams.get('download')==='1',ascii=row.name.replace(/[^\x20-\x7e]/g,'_').replace(/["\\]/g,'_');
  return new Response(obj.body,{headers:{'Content-Type':row.type,'Content-Length':String(row.size),'Content-Disposition':(download?'attachment':'inline')+'; filename="'+ascii+'"; filename*=UTF-8\'\''+encodeURIComponent(row.name),
   'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'self'"}});
 }
 if(req.method==='PATCH'){
  const body=await readJson(req,600);if(!body||typeof body.name!=='string'||!body.name.trim())return json({error:'invalid_name'},400);
  const name=cleanName(body.name,row.type);await db.prepare('UPDATE account_files SET name=? WHERE id=? AND user_id=?').bind(name,id,owner).run();
  return json({file:view({...row,name})});
 }
 if(req.method==='DELETE'){
  await env.FILES.delete(key(owner,id));await db.prepare('DELETE FROM account_files WHERE id=? AND user_id=?').bind(id,owner).run();
  return json({ok:true});
 }
 return json({error:'not_found'},404);
}
/** After the account itself is deleted: remove every stored file (the rows go with the account). */
export async function deleteAllFiles(env,owner){
 if(!env?.FILES?.list||!/^[A-Za-z0-9_-]{1,128}$/.test(String(owner)))return;
 let cursor;do{const page=await env.FILES.list({prefix:'u/'+owner+'/',cursor});const keys=page.objects.map(o=>o.key);if(keys.length)await env.FILES.delete(keys);cursor=page.truncated?page.cursor:undefined}while(cursor);
}
