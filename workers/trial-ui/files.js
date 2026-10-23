/* Files (step 6): the person's own documents in My Life. Signed in: private account storage through /api/account/files.
 * Guest: kept only in this browser (IndexedDB). Photos (camera or library) are re-saved as JPEG on the device before
 * saving, which also drops location data. Nothing here is read, checked or sent to an AI. Built from text nodes only. */
(function(){
 'use strict';
 const LIMIT={file:10*1024*1024,account:100*1024*1024};
 const t=s=>window.OriviaI18n?.text(s)??s,$=id=>document.getElementById(id);
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
 const size=b=>b<1024*1024?Math.max(1,Math.round(b/1024))+' KB':(b/1024/1024).toFixed(b<10*1024*1024?1:0)+' MB';
 const user=()=>window.OriviaAccounts?.user||null;
 const ERRORS={file_too_large:'That file is over 10 MB. Try a smaller one or a photo instead.',allowance_full:'Your files are using all 100 MB. Delete some to add more.',
  unsupported_type:'Only PDF, JPEG and PNG files can be saved.',daily_upload_limit:'You’ve added a lot of files today. Try again tomorrow.',files_unavailable:'Files aren’t available right now.',
  sign_in_required:'Sign in again to see your files.',account_changed:'Your account changed in another tab. Reload to continue.'};

 /* ---------- Guest storage: this browser only ---------- */
 const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('orivia-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 const tx=async(mode,fn)=>{const db=await idb();return new Promise((res,rej)=>{const s=db.transaction('files',mode).objectStore('files');const r=fn(s);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})};
 const local={
  async list(){const all=await tx('readonly',s=>s.getAll());const files=all.map(({blob,...f})=>f).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));return {files,used:files.reduce((n,f)=>n+f.size,0)}},
  async add(blob,name,type){const {used}=await local.list();if(used+blob.size>LIMIT.account)throw Error('allowance_full');const f={id:crypto.randomUUID(),name,type,size:blob.size,createdAt:new Date().toISOString()};await tx('readwrite',s=>s.put({...f,blob}));return f},
  async blob(id){return (await tx('readonly',s=>s.get(id)))?.blob||null},
  async rename(id,name){const f=await tx('readonly',s=>s.get(id));if(f)await tx('readwrite',s=>s.put({...f,name}))},
  async remove(id){await tx('readwrite',s=>s.delete(id))}};
 /* ---------- Account storage ---------- */
 const call=async(path,opts={})=>{const u=user();const r=await fetch(path,{credentials:'same-origin',cache:'no-store',...opts,headers:{...(u?{'X-Orivia-Account':u.id}:{}),...(opts.headers||{})}});
  if(!r.ok){let e='';try{e=(await r.json()).error||''}catch(_){}throw Error(e||'http_'+r.status)}return r};
 const remote={
  async list(){const d=await (await call('/api/account/files')).json();return {files:d.files||[],used:d.used||0}},
  async add(blob,name){return (await (await call('/api/account/files',{method:'POST',headers:{'Content-Type':blob.type||'application/octet-stream','X-File-Name':encodeURIComponent(name)},body:blob})).json()).file},
  async blob(id){return (await call('/api/account/files/'+encodeURIComponent(id))).blob()},
  async rename(id,name){await call('/api/account/files/'+encodeURIComponent(id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})})},
  async remove(id){await call('/api/account/files/'+encodeURIComponent(id),{method:'DELETE'})}};
 const store=()=>user()?remote:local;

 /* ---------- Photos: re-saved as JPEG (max 2400 px), which strips location and other photo data ---------- */
 async function prepare(file){
  const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
  if(isPdf){if(file.size>LIMIT.file)throw Error('file_too_large');return {blob:file,name:file.name,type:'application/pdf'}}
  if(!/^image\//.test(file.type)&&!/\.(jpe?g|png|heic|heif)$/i.test(file.name))throw Error('unsupported_type');
  let bmp;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(_){throw Error('photo_format')}
  const scale=Math.min(1,2400/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.round(bmp.width*scale);c.height=Math.round(bmp.height*scale);
  const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(bmp,0,0,c.width,c.height);bmp.close?.();
  let q=.85,blob;do{blob=await new Promise(r=>c.toBlob(r,'image/jpeg',q));q-=.15}while(blob&&blob.size>LIMIT.file&&q>.3);
  if(!blob||blob.size>LIMIT.file)throw Error('file_too_large');
  const base=String(file.name||'').replace(/\.[^.]+$/,'');
  return {blob,name:(base&&!/^image$/i.test(base)?base:t('Photo')+' '+new Date().toLocaleDateString())+'.jpg',type:'image/jpeg'};
 }
 const say=(text,err)=>{const s=$('files-status');if(s){s.textContent=text;s.classList.toggle('error',!!err)}};
 const why=e=>t(e?.message==='photo_format'?'This photo’s format can’t be opened here. Save it as a JPEG and try again.':ERRORS[e?.message]||'Couldn’t do that. Check your connection and try again.');

 async function addFiles(list){
  const files=[...list||[]];if(!files.length)return;
  for(const [i,f] of files.entries()){
   say(t('Saving')+' '+(files.length>1?(i+1)+'/'+files.length:'')+'…');
   try{const p=await prepare(f);await store().add(p.blob,p.name,p.type)}catch(e){say(why(e),true);await render();return}
  }
  say(files.length>1?t('Files saved.'):t('File saved.'));await render();
 }
 async function open(f,download){
  try{const blob=await store().blob(f.id);if(!blob)throw Error('missing');const url=URL.createObjectURL(blob);
   if(download){const a=el('a');a.href=url;a.download=f.name;document.body.append(a);a.click();a.remove()}else window.open(url,'_blank','noopener');
   setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(e){say(why(e),true)}
 }
 function row(f){
  const li=el('div','file-row'),icon=el('span','file-icon',f.type==='application/pdf'?'PDF':f.type==='image/png'?'PNG':'JPG');icon.setAttribute('aria-hidden','true');
  const info=el('div','file-info'),name=el('strong','',f.name),meta=el('small','tiny',size(f.size)+' · '+new Date(f.createdAt).toLocaleDateString());info.append(name,meta);
  const actions=el('div','file-actions');
  const b=(label,fn,cls='ask')=>{const x=el('button',cls,t(label));x.type='button';x.onclick=fn;return x};
  const del=b('Delete',async()=>{if(!del.dataset.armed){del.dataset.armed='1';del.textContent=t('Tap again to delete this file from your Library. Chats that already read it keep what Orivia read.');setTimeout(()=>{delete del.dataset.armed;del.textContent=t('Delete')},4000);return}
   try{await store().remove(f.id);say(t('Deleted.'));await render()}catch(e){say(why(e),true)}});
  const ren=b('Rename',()=>{const form=el('form','row file-rename'),input=el('input');input.value=f.name;input.maxLength=120;input.setAttribute('aria-label',t('New name'));
   const save=el('button','btn small',t('Save'));save.type='submit';form.append(input,save);
   form.onsubmit=async e=>{e.preventDefault();const v=input.value.trim();if(!v)return;try{await store().rename(f.id,v);await render()}catch(err){say(why(err),true)}};
   info.replaceChildren(form);input.focus()});
  const use=window.OriviaFiles?.useInChat&&b('Use in Chat',()=>window.OriviaFiles.useInChat(f));
  actions.append(b('Open',()=>open(f,false)),...(use?[use]:[]),b('Download',()=>open(f,true)),ren,del);
  li.append(icon,info,actions);return li;
 }
 let rendering=0;
 async function render(){
  const list=$('files-list');if(!list)return;const run=++rendering,u=user();
  $('files-note').textContent=t(u?'Saved privately to your account. Only you can open them. Orivia doesn’t read or check your documents.':'Saved only in this browser. Sign in to keep them in your private account. Orivia doesn’t read or check your documents.');
  try{const {files,used}=await store().list();if(run!==rendering)return;
   list.replaceChildren(...files.map(row));if(!files.length)list.append(el('p','tiny',t('No files yet. Take a photo of a document or add a PDF.')));
   $('files-usage').textContent=files.length?size(used)+' '+t('of 100 MB used'):''}
  catch(e){if(run===rendering){list.replaceChildren();say(why(e),true)}}
 }
 function mount(){
  if(!$('files-list')||mount.done)return;mount.done=true;
  $('files-camera').onclick=()=>$('files-camera-input').click();$('files-add').onclick=()=>$('files-input').click();
  for(const id of ['files-camera-input','files-input'])$(id).addEventListener('change',e=>{const files=e.target.files;addFiles(files).finally(()=>{e.target.value=''})});
 }
 window.OriviaFiles={render:()=>{mount();return render()},prepare,LIMIT,list:()=>store().list(),blob:id=>store().blob(id)};
})();
