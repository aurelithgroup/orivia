/**
 * Orivia journey interpretation tools (pure logic; no network or user storage).
 *
 * Server/API contract:
 * {id,title,checkedAt,steps:[{id,title,source:{url,checkedAt},...}],
 *  checkups:[{id,question,options:[{value,label,stepId?}]}]}
 *
 * The official-source allowlist and fact validation remain the responsibility of
 * the trusted journey API. Never turn a model-generated answer into a factual step.
 * All tools return results, never save personal data or mark progress.
 */
const text=(v,max=200)=>typeof v==='string'?v.trim().slice(0,max):'';
const tokenise=v=>new Set(text(v,1500).toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>2));
const validUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'&&!x.username&&!x.password}catch{return false}};
export function normaliseJourney(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||!text(raw.id,90)||!text(raw.title))return null;
 if(!Array.isArray(raw.steps)||!raw.steps.length||raw.steps.length>100)return null;
 const steps=raw.steps.map(step=>{
  if(!step||!text(step.id,90)||!text(step.title)||!step.source||!validUrl(step.source.url)||!/^\\d{4}-\\d{2}-\\d{2}$/.test(text(step.source.checkedAt,20)))return null;
  return {...step,id:text(step.id,90),title:text(step.title),source:{url:step.source.url,checkedAt:step.source.checkedAt}};
 });
 if(steps.some(s=>!s)||new Set(steps.map(s=>s.id)).size!==steps.length)return null;
 const checkups=Array.isArray(raw.checkups)?raw.checkups.filter(q=>q&&text(q.id,90)&&text(q.question)&&Array.isArray(q.options)&&q.options.every(o=>o&&text(o.value,90)&&text(o.label,160))):[];
 return {id:text(raw.id,90),title:text(raw.title),description:text(raw.description,800),checkedAt:text(raw.checkedAt,20),steps,checkups};
}
export function find_journeys(query,journeys){
 const words=tokenise(query);
 if(!words.size)return [];
 return (journeys||[]).map(normaliseJourney).filter(Boolean).map(j=>{
  const title=tokenise(j.title+' '+j.description);
  const score=[...words].filter(w=>title.has(w)).length;
  return {journeyId:j.id,title:j.title,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
}
export function get_checkups(journey){
 const j=normaliseJourney(journey);if(!j)return {ok:false,reason:'unavailable'};
 return {ok:true,journeyId:j.id,questions:j.checkups.map(q=>({id:q.id,question:q.question,options:q.options.map(o=>({value:o.value,label:o.label}))}))};
}
export function place_user(journey,answers){
 const j=normaliseJourney(journey);if(!j)return {status:'unavailable',stepId:null};
 if(!answers||typeof answers!=='object'||Array.isArray(answers))return {status:'not_sure',stepId:null};
 // Only explicit, source-authored checkup mappings can identify a step.
 const mapped=[];
 for(const q of j.checkups){
  const v=answers[q.id];
  if(v===undefined||v===null||v==='not_sure')continue;
  const opt=q.options.find(o=>o.value===v);
  if(!opt)return {status:'not_sure',stepId:null};
  if(opt.stepId&&j.steps.some(s=>s.id===opt.stepId))mapped.push(opt.stepId);
 }
 const distinct=[...new Set(mapped)];
 return distinct.length===1?{status:'candidate',stepId:distinct[0],requiresConfirmation:true}:{status:'not_sure',stepId:null};
}
export function get_step(journey,stepId){
 const j=normaliseJourney(journey);if(!j)return {ok:false,reason:'unavailable'};
 const step=j.steps.find(s=>s.id===stepId);
 if(!step)return {ok:false,reason:'unknown_step'};
 return {ok:true,journeyId:j.id,step,source:step.source,requiresConfirmation:true};
}
