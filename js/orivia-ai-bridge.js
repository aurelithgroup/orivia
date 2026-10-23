/* AI transport adapter: never contains secrets; only talks to protected same-origin APIs.
 * Not active in public Buddy until a server-authenticated Pages route is configured.
 */
(function(root){
 'use strict';
 const PATH='/api/orivia/chat';
 const MAX_TURNS=12,MAX_CHARS=1200;
 const languages=['en','ar','fr','fil','hi','ur','zh','ru','bn','ml'];
 function prepare(history,text){
   const question=String(text||'').trim().slice(0,MAX_CHARS);
   if(!question)return null;
   const previous=Array.isArray(history)?history:[];
   const turns=previous.slice(-MAX_TURNS+1).filter(x=>x&&typeof x.text==='string'&&['user','orivia'].includes(x.role))
     .map(x=>({role:x.role==='orivia'?'assistant':'user',content:x.text.slice(0,MAX_CHARS)}))
     .filter(x=>x.content.trim());
   return [...turns,{role:'user',content:question}].slice(-MAX_TURNS);
 }
 function allowed(config){
   return Boolean(config&&config.enabled===true&&config.path===PATH);
 }
 async function send({history,text,preferences,config,request}){
   if(!allowed(config))return {ok:false,reason:'not-enabled'};
   const messages=prepare(history,text);
   if(!messages)return {ok:false,reason:'empty'};
   if(typeof request!=='function')return {ok:false,reason:'no-transport'};
   const language=languages.includes(preferences?.language)?preferences.language:'en';
   const style=['friendly','formal','simple'].includes(preferences?.style)?preferences.style:'friendly';
   try{
     const response=await request(PATH,{
       method:'POST',credentials:'same-origin',redirect:'error',cache:'no-store',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify({messages,preferences:{language,style}})
     });
     if(!response.ok)return {ok:false,reason:'service-unavailable',status:response.status};
     const payload=await response.json();
     if(typeof payload.reply!=='string'||!payload.reply.trim())return {ok:false,reason:'bad-response'};
     return {ok:true,reply:payload.reply.slice(0,2400),verifiedSources:Array.isArray(payload.verifiedSources)?payload.verifiedSources:[],
       liveInformation:payload.liveInformation===true};
   }catch(_){return {ok:false,reason:'network-unavailable'}}
 }
 const api=Object.freeze({prepare,allowed,send});
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ORIVIA_AI_BRIDGE=api;
})(typeof window!=='undefined'?window:{});
