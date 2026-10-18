/* First-party directory adapter. Reads the IDs/options published by SPEA, then its own read-only JSON feed.
 * No school-specific routes, guessed IDs, model-generated queries, browser session or search charge. */
import {SPEA_DIRECTORY,speaPage,curriculumMatches} from './orivia-spea-reader.mjs';
const ENDPOINT='https://spea.shj.ae/api/graphql-proxy';
const QUERY=`query VerticalFilterList($currentItemId:String!,$templateId:String!,$language:String!,$first:Int,$after:String){search(where:{AND:[{name:"_path",value:$currentItemId,operator:EQ},{name:"_templates",value:$templateId,operator:EQ},{name:"_language",value:$language,operator:EQ},FILTER]},first:$first,after:$after){total pageInfo{endCursor hasNext} results{id url{path} title:field(name:"title"){value} location:field(name:"location"){jsonValue} curriculum:field(name:"curriculumType"){jsonValue}}}}`;
const GUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function directoryConfig(html,curriculum){
 const m=String(html).match(/<script\b[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);if(!m)return null;
 let data;try{data=JSON.parse(m[1])}catch{return null}
 let vars=null,field=null;let nodes=0;
 function walk(x,depth=0){if(!x||typeof x!=='object'||depth>45||++nodes>40000)return;
  if(!Array.isArray(x)){
   const v=x.queryVariables;if(v&&GUID.test(v.currentItemId)&&GUID.test(v.templateId)&&v.language==='en')vars=v;
   if(x.name==='Curriculum'&&Array.isArray(x.fields?.OptionList))field=x.fields;
  }
  for(const value of Object.values(x))if(value&&typeof value==='object')walk(value,depth+1);
 }
 walk(data);if(!vars||!field)return null;
 const option=field.OptionList.find(o=>curriculumMatches(o.fields?.Name?.value||o.name,curriculum));
 const fieldName=field.FilterName?.fields?.Value?.value;
 if(!GUID.test(option?.id)||typeof fieldName!=='string'||!/^curriculumtype$/i.test(fieldName))return null;
 return {variables:{currentItemId:vars.currentItemId,templateId:vars.templateId,language:'en',first:100,after:null},field:fieldName.toLowerCase(),optionId:option.id};
}
async function readJSON(response){
 const reader=response.body?.getReader();if(!reader)throw Error('no-body');let bytes=0;const chunks=[];
 try{while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>1000000)throw Error('too-large');chunks.push(r.value)}}catch(e){await reader.cancel().catch(()=>{});throw e}
 const all=new Uint8Array(bytes);let n=0;for(const c of chunks){all.set(c,n);n+=c.length}return JSON.parse(new TextDecoder().decode(all));
}
export async function readSpeaDirectoryFeed({curriculum='',year=null},tools,{fetcher=fetch}={}){
 const base={status:'partial',complete:false,filter:{curriculum},items:[],total:null,range:null,unappliedFilters:year?['year']:[],browserMs:0,method:'official-data-feed'};
 try{
  if(!curriculum||!tools?.used)return {...base,reason:'missing-filter'};
  const page=await tools.fetchPage(SPEA_DIRECTORY,{kind:'regulator'});if(!page.ok)return {...base,reason:'directory-'+page.reason};
  const cfg=directoryConfig(page.raw,curriculum);if(!cfg)return {...base,reason:'directory-config-unavailable'};
  const query=QUERY.replace('FILTER','{name:'+JSON.stringify(cfg.field)+',value:'+JSON.stringify(cfg.optionId)+',operator:EQ}');
  const seen=new Map();let cursor=null,total=null,finished=false;const cursors=new Set();
  for(let round=0;round<3;round++){
   if(tools.used.fetches>=24)return {...base,items:[...seen.values()],total,reason:'turn-limit'};
   tools.used.fetches++;
   const response=await fetcher(ENDPOINT,{method:'POST',redirect:'manual',signal:AbortSignal.timeout(12000),headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({query,variables:{...cfg.variables,after:cursor}})});
   if(!response.ok){await response.body?.cancel();return {...base,items:[...seen.values()],total,reason:'feed-http-'+response.status}}
   const data=await readJSON(response),search=data?.data?.search;
   if(data.errors||!Number.isInteger(search?.total)||search.total<0||search.total>300||!Array.isArray(search.results)||search.results.length>100||typeof search.pageInfo?.hasNext!=='boolean')return {...base,reason:'invalid-feed'};
   if(total!==null&&total!==search.total)return {...base,reason:'directory-changed'};total=search.total;
   for(const item of search.results){
    const name=item.title?.value,kind=item.curriculum?.jsonValue,area=item.location?.jsonValue;
    const value=kind?.fields?.Value?.value||kind?.name;
    const curriculumQuote=kind?.fields?.Name?.value||kind?.name;
    let url='';try{url=speaPage(new URL(item.url?.path,SPEA_DIRECTORY).href);if(!url&&typeof item.url?.path==='string'&&item.url.path.startsWith('/education-institutes/schools/'))url=speaPage('https://spea.shj.ae/en'+item.url.path)}catch{}
    if(typeof name!=='string'||!name.trim()||name.length>180||!url||kind?.id?.toLowerCase()!==cfg.optionId.toLowerCase()||!curriculumMatches(value,curriculum)||typeof curriculumQuote!=='string'||seen.has(url))return {...base,reason:'invalid-or-duplicate-record'};
    const fields={curriculum:{value,quote:curriculumQuote}};const location=area?.fields?.Name?.value||area?.name;
    if(typeof location==='string'&&location.length<150)fields.area={value:location,quote:location};
    seen.set(url,{name:name.trim(),url,sourceUrl:SPEA_DIRECTORY,fields});
   }
   if(!search.pageInfo.hasNext){finished=true;break}
   cursor=search.pageInfo.endCursor;if(typeof cursor!=='string'||cursor.length>512||cursors.has(cursor))return {...base,reason:'invalid-cursor'};cursors.add(cursor);
  }
  const complete=finished&&seen.size===total;
  const result={...base,status:complete?'ok':'partial',complete,items:[...seen.values()],total,range:seen.size?[1,seen.size]:[0,0],reason:complete?null:'incomplete-feed'};
  tools.log.push({step:'regulator-directory-feed',status:result.status,total,records:seen.size,complete});
  console.log(JSON.stringify({event:'orivia-directory-feed',status:result.status,total,records:seen.size,complete}));return result;
 }catch{return {...base,reason:'feed-unavailable'}}
}
