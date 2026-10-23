/* Provider comparison harness: run the same research conversations with the existing provider and with the OpenAI pilot,
 * and record aggregate metrics only (no prompts, replies or personal data in the rows).
 * Every row carries `label`: 'scripted' (fixture pages and scripted model output) or 'live' (real provider and real pages).
 * The two must never be mixed in one summary.
 *
 * conversation: {id, messages, context?, understanding?, check(result) → boolean, world?}
 * provider:     {name, setup(conversation) → Promise<{env, opts, usage?:()=>({inputTokens,outputTokens})|null}>}
 */
import {runAgentTurn} from '../workers/orivia-research-agent.mjs';

export async function runComparison({conversations,providers,label}){
 if(!['scripted','live'].includes(label))throw Error('label must be scripted or live');
 const rows=[];
 for(const conv of conversations)for(const p of providers){
  const {env,opts,usage}=await p.setup(conv);const t0=Date.now();let res=null,error=null;
  try{res=await runAgentTurn({messages:conv.messages,context:conv.context||null},env,opts)}catch(e){error=String(e?.code||e?.name||'error').slice(0,40)}
  const m=res?.research?.process?.metrics||{};const u=usage?.()||null;
  let ok=false;try{ok=!!res&&!error&&!!conv.check(res)}catch(_){ok=false}
  rows.push({label,provider:p.name,conversation:conv.id,success:ok,status:res?.research?.status||error||'no-result',
   modelCalls:m.modelCalls??null,inputTokens:u?u.inputTokens:null,outputTokens:u?u.outputTokens:null,
   searches:m.searches??null,fetches:m.fetches??null,browserSeconds:m.browserMs!=null?Math.round(m.browserMs/100)/10:null,elapsedMs:Date.now()-t0});
 }
 return rows;
}
export function summarise(rows){
 const labels=new Set(rows.map(r=>r.label));if(labels.size>1)throw Error('do not mix scripted and live rows');
 const by={};for(const r of rows){const s=by[r.provider]||={label:r.label,runs:0,succeeded:0,modelCalls:0,inputTokens:0,outputTokens:0,tokensKnown:true,searches:0,fetches:0,browserSeconds:0,elapsedMs:0};
  s.runs++;if(r.success)s.succeeded++;s.modelCalls+=r.modelCalls||0;if(r.inputTokens==null)s.tokensKnown=false;else{s.inputTokens+=r.inputTokens;s.outputTokens+=r.outputTokens}
  s.searches+=r.searches||0;s.fetches+=r.fetches||0;s.browserSeconds+=r.browserSeconds||0;s.elapsedMs+=r.elapsedMs}
 for(const s of Object.values(by))if(!s.tokensKnown){s.inputTokens=null;s.outputTokens=null}
 return by;
}
