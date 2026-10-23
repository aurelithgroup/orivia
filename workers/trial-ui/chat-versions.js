/* Conversation versions: local/account snapshot only. No API calls or side effects. */
(function(root){
'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
const LIMIT=30;
function snapshot(c){return copy({turns:c.turns||[],orgContext:c.orgContext||null,documents:c.documents||[]})}
function restore(c,s){c.turns=copy(s.turns);if(s.orgContext)c.orgContext=copy(s.orgContext);else delete c.orgContext;if(s.documents?.length)c.documents=copy(s.documents);else delete c.documents}
function normalise(v){if(!v||!Array.isArray(v.items)||!Number.isInteger(v.active)||v.active<0||v.active>=v.items.length)return null;
 if(!v.items.every(x=>x&&Array.isArray(x.turns)&&x.turns.every(t=>t&&['user','assistant'].includes(t.role)&&typeof t.content==='string')))return null;
 return copy(v)}
function fork(c,index,text){if(!Number.isInteger(index)||index<0||c.turns?.[index]?.role!=='user')throw Error('invalid_turn');
 const edit=typeof text==='string';if(edit&&!text.trim())throw Error('empty_message');
 const versions=normalise(c.versions)||{active:0,items:[snapshot(c)]};
 if(versions.items.length>=LIMIT)throw Error('version_limit');
 versions.items[versions.active]=snapshot(c);
 const next=snapshot(c);next.turns=next.turns.slice(0,index+1);
 if(edit)next.turns[index].content=text.trim().slice(0,900);
 versions.items.push(copy(next));versions.active=versions.items.length-1;c.versions=versions;restore(c,next);
 return {kind:edit?'edit':'regenerate',index,allowAutomaticActions:false};
}
function select(c,index){const v=normalise(c.versions);if(!v||!Number.isInteger(index)||!v.items[index])throw Error('invalid_version');
 v.items[v.active]=snapshot(c);v.active=index;c.versions=v;restore(c,v.items[index]);return c}
function requestTurns(c){return (c.turns||[]).slice(-12).map(t=>({role:t.role,content:t.content.slice(0,1200)}))}
root.OriviaVersions={fork,select,normalise,snapshot,requestTurns,LIMIT};
})(typeof window!=='undefined'?window:globalThis);
