/* Proposed per-request privacy provenance, v2. Pure, no network/storage.
   Input must be the same visible turn list used by chatMessages (latest 12).
   A detached guide/document may still influence a reply through conversation history. */
(function(root){
 'use strict';
 function forRequest(turns,{documents=false,university=false}={}){
  const out={v:2,documents:!!documents,university:!!university,unknown:false};
  for(const t of (Array.isArray(turns)?turns:[]).slice(-12)){
   if(!t||!['user','assistant'].includes(t.role))continue;
   const m=t.meta||{},o=m.origin;
   if(m.attachment||m.documentContext||(Array.isArray(m.sources)&&m.sources.some(s=>s?.category==='document')))out.documents=true;
   if(o?.documents===true)out.documents=true;if(o?.university===true)out.university=true;
   if(t.role==='assistant'&&(!o||o.v!==2||o.unknown===true))out.unknown=true;
  }
  return out;
 }
 function sharingReason(turn){
  if(turn?.role==='user')return turn.meta?.attachment?'attachment':!String(turn.content||'').trim()?'empty':null;
  if(turn?.role!=='assistant')return 'unverified';
  const o=turn.meta?.origin;
  if(o?.documents===true||(Array.isArray(turn.meta?.sources)&&turn.meta.sources.some(s=>s?.category==='document')))return 'document';
  if(o?.university===true)return 'university';
  if(!o||o.v!==2||o.unknown!==false||typeof o.documents!=='boolean'||typeof o.university!=='boolean')return 'unverified';
  return String(turn.content||'').trim()?null:'empty';
 }
 root.OriviaReplyOrigin={forRequest,sharingReason};
})(typeof window!=='undefined'?window:globalThis);
