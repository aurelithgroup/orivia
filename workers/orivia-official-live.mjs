/* Bounded, live fetch of user-relevant approved official web pages.
 * Trust is based on the *actual fetched URL and content*, not model memory.
 * No redirects, arbitrary hosts, social sites, JavaScript execution or bot bypass.
 */
import {inspectSource} from './orivia-source-policy.mjs';
const MAX_BYTES=650000;
const TIMEOUT_MS=6500;
function removeMarkup(raw){
 return raw
   .replace(/<!--[\s\S]*?-->/g,' ')
   .replace(/<(script|style|svg|noscript|nav|footer|header|form)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
   .replace(/<[^>]*>/g,' ')
   .replace(/&(nbsp|#160);/gi,' ')
   .replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
   .replace(/&#(\d+);/g,(_,n)=>{const v=Number(n);return v>31&&v<127?String.fromCharCode(v):' '})
   .replace(/[\t\r ]+/g,' ').replace(/\n\s*\n+/g,'\n')
   .trim();
}
function findExcerpt(text,keywords){
 const terms=Array.isArray(keywords)?keywords.filter(x=>typeof x==='string'&&x.length>=3).slice(0,8):[];
 const lower=text.toLowerCase();
 let best=-1;
 for(const term of terms){const pos=lower.indexOf(term.toLowerCase());if(pos>=0&&(best<0||pos<best))best=pos}
 if(best<0)return text.slice(0,1400);
 const start=Math.max(0,best-250);
 return text.slice(start,Math.min(text.length,start+1800));
}
export async function readApprovedPage({url,query=[],purpose='general',fetcher=fetch}){
 const accepted=inspectSource(url,purpose);
 if(!accepted.accepted)return {ok:false,reason:'unapproved-source'};
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
 try{
  const result=await fetcher(accepted.url,{method:'GET',redirect:'manual',
    signal:controller.signal,
    headers:{'Accept':'text/html, text/plain;q=0.8','User-Agent':'OriviaOfficialSourceReader/0.1 (+official information lookup)'}});
  if(!result.ok||result.status>=300&&result.status<400)return {ok:false,reason:'source-not-available'};
  const type=String(result.headers.get('content-type')||'').toLowerCase();
  if(!type.includes('text/html')&&!type.includes('text/plain'))return {ok:false,reason:'unsupported-content-type'};
  if(Number(result.headers.get('content-length')||0)>MAX_BYTES)return {ok:false,reason:'source-too-large'};
  // Bound reads even when the server omits Content-Length.
  const body=result.body?.getReader?.();
  let bytes;
  if(body){
   const chunks=[];let count=0;
   while(true){const {done,value}=await body.read();if(done)break;count+=value.byteLength;
    if(count>MAX_BYTES){await body.cancel();return {ok:false,reason:'source-too-large'}}
    chunks.push(value)}
   bytes=new Uint8Array(count);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
  }else{
   bytes=new Uint8Array(await result.arrayBuffer());
   if(bytes.byteLength>MAX_BYTES)return {ok:false,reason:'source-too-large'};
  }
  const text=removeMarkup(new TextDecoder().decode(bytes));
  if(text.length<75)return {ok:false,reason:'insufficient-content'};
  const snippet=findExcerpt(text,query);
  return {ok:true,url:accepted.url,category:accepted.category,checkedAt:new Date().toISOString(),
    excerpt:snippet,method:'live-official-page',liveJourneyData:false};
 }catch(_){return {ok:false,reason:'source-not-available'}}
 finally{clearTimeout(timer)}
}
