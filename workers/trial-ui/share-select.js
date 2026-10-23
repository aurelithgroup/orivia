/* What may go into a shared link (ORI-CHAT-009). Replies carry a permanent origin stamp (meta.origin, set when the answer
   was produced): replies based on documents or university guidance stay excluded after the context is cleared, a version
   is switched or the page reloads; replies without a stamp (older ones) are excluded because their origin can't be shown. Pure: the chat and a source sanitiser are passed in, so tests run this.
   Never shared: attached files or the messages that carried them; Orivia's replies after a document was attached (they may
   repeat its details); replies in a chat using university members-only guidance. Everything shared is plain text plus
   public https sources, and the person ticks what goes in. */
(function(root){
 'use strict';
 function candidates(chat,safeSources){
  const turns=Array.isArray(chat?.turns)?chat.turns:[];const firstDoc=turns.findIndex(t=>t?.meta?.attachment);
  const docChat=firstDoc>=0||(Array.isArray(chat?.documents)&&chat.documents.length>0),orgChat=!!chat?.orgContext;
  return turns.map((t,i)=>{
   let excluded=null;
   if(t.role==='user'&&t.meta?.attachment)excluded='attachment';
   else if(t.role==='assistant'&&!(t.meta&&t.meta.origin&&t.meta.origin.v===1))excluded='unverified'; // older reply: origin unknown
   else if(t.role==='assistant'&&(t.meta.origin.documents||(safeSources(t.meta.sources)||[]).some(s=>s.category==='document')))excluded='document';
   else if(t.role==='assistant'&&t.meta.origin.university)excluded='university';
   else if(t.role==='assistant'&&docChat&&(firstDoc<0||i>firstDoc))excluded='document';
   else if(t.role==='assistant'&&orgChat)excluded='university';
   else if(!String(t.content||'').trim())excluded='empty';
   const sources=t.role==='assistant'?(safeSources(t.meta?.sources)||[]).filter(s=>s.category!=='document').map(s=>({title:String(s.title||s.host||'Source').slice(0,140),url:s.url})):[];
   return {index:i,role:t.role,content:String(t.content||'').slice(0,4000),sources,excluded};
  });
 }
 // Default selection: the chosen reply and the question just before it, when both may be shared.
 function defaults(list,replyIndex){const sel=new Set();const r=list[replyIndex];if(r&&!r.excluded){sel.add(replyIndex);const q=list[replyIndex-1];if(q&&q.role==='user'&&!q.excluded)sel.add(replyIndex-1)}return sel}
 function payload(list,selected,title,days){
  const messages=list.filter(x=>selected.has(x.index)&&!x.excluded).slice(0,20).map(x=>({role:x.role,content:x.content,...(x.sources.length?{sources:x.sources.slice(0,8)}:{})}));
  return {title:String(title||'').trim().slice(0,120),messages,expiresInDays:[1,7,30].includes(Number(days))?Number(days):7};
 }
 root.OriviaShare={candidates,defaults,payload};
})(typeof window!=='undefined'?window:globalThis);
