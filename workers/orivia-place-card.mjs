/* Optional page preview, never a generated place image. No browser request to a third-party image host. */
export function placeImageFromPage(raw,pageUrl){
 let page;try{page=new URL(pageUrl);if(page.protocol!=='https:'||page.username||page.password)return ''}catch(_){return ''}
 for(const tag of String(raw||'').slice(0,150000).match(/<meta\b[^>]{1,2500}>/gi)||[]){
  const attrs={};for(const m of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g))attrs[m[1].toLowerCase()]=m[3];
  if(!['og:image','twitter:image'].includes((attrs.property||attrs.name||'').toLowerCase()))continue;
  try{const u=new URL((attrs.content||'').replace(/&amp;/g,'&'),page);if(u.origin!==page.origin||u.username||u.password||u.hash||/logo|icon|sprite|avatar|placeholder/i.test(u.pathname)||!/^https:$/.test(u.protocol))continue;return u.href}catch(_){}
 }
 return '';
}
export async function loadPlacePhoto(url,sourceUrl,{fetcher=fetch,maxBytes=120000,timeoutMs=1500}={}){
 if(!url)return null;
 try{
  const u=new URL(url),source=new URL(sourceUrl);if(u.protocol!=='https:'||u.origin!==source.origin||u.username||u.password)return null;
  const response=await fetcher(u.href,{redirect:'manual',credentials:'omit',signal:AbortSignal.timeout(timeoutMs),headers:{Accept:'image/jpeg,image/png,image/webp'}});
  if(response.status!==200)return null;
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();if(!['image/jpeg','image/png','image/webp'].includes(type))return null;
  if(Number(response.headers.get('content-length')||0)>maxBytes){await response.body?.cancel();return null}
  const reader=response.body?.getReader();if(!reader)return null;const chunks=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes){await reader.cancel();return null}chunks.push(value)}
  if(size<16)return null;const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,png=bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10',webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if(!(type==='image/jpeg'&&jpeg||type==='image/png'&&png||type==='image/webp'&&webp))return null;
  let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return {data:'data:'+type+';base64,'+btoa(binary),sourceUrl};
 }catch(_){return null}
}
