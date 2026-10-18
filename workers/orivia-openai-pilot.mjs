/* Private pilot transport. Not wired into the public Worker.
 * Callers must supply a durable, atomic budget reservation and explicit provider consent.
 * Existing research validators still decide which actions and claims are permitted.
 */
const ENDPOINT='https://api.openai.com/v1/responses';
const MODEL='gpt-6.1-sol';
const LIMITS=Object.freeze({calls:6,inputBytes:24000,outputTokens:1024,responseBytes:256000});
export class PilotError extends Error {
 constructor(code){super(code);this.name='PilotError';this.code=code}
}
async function boundedJSON(response){
 if(!response.body)throw new PilotError('empty-response');
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
  if(size>LIMITS.responseBytes)throw new PilotError('response-too-large');chunks.push(value)}
 }catch(error){await reader.cancel().catch(()=>{});throw error}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 try{return JSON.parse(new TextDecoder().decode(bytes))}catch{throw new PilotError('invalid-response')}
}
// Provider error bodies can echo input, so only OpenAI's short enum-like fields are kept (never `message`).
const SAFE=/^[a-z0-9_.-]{1,64}$/i;
const safe=v=>typeof v==='string'&&SAFE.test(v)?v:undefined;
async function providerErrorCodes(response){
 try{const e=(await boundedJSON(response))?.error;return {type:safe(e?.type),code:safe(e?.code),param:safe(e?.param)}}catch{return {}}
}
// One log line per call: outcome codes, HTTP status, token counts and timing only. No key, prompt, reply or exception text.
function logCall(fields){try{console.log(JSON.stringify({event:'orivia-openai-pilot',model:MODEL,...fields}))}catch{}}
/** Returns the AI.run-shaped interface used by understanding and planning.
 * budget.reserve({model,inputBytes,maxOutputTokens}) -> unique ticket or null.
 * budget.record(ticket,{status,inputTokens,outputTokens}) persists usage, not prompts.
 * Reservation stays charged on timeout/error/unknown usage; never auto-refund an uncertain call.
 * The supplied implementation MUST atomically enforce the shared money limit across requests.
 */
export function createOpenAIPilot(env,{consented=false,budget,fetcher=fetch,timeoutMs=20000}={}){
 if(env.OPENAI_PILOT!=='1')throw new PilotError('pilot-disabled');
 if(!consented)throw new PilotError('provider-consent-required');
 if(typeof env.OPENAI_API_KEY!=='string'||!env.OPENAI_API_KEY.trim())throw new PilotError('missing-key');
 if(typeof budget?.reserve!=='function'||typeof budget?.record!=='function')throw new PilotError('budget-required');
 let calls=0,blocked=false;
 return {async run(_legacyModel,options){
  if(blocked)throw new PilotError('pilot-stopped');
  if(calls>=LIMITS.calls)throw new PilotError('turn-call-limit');
  const messages=options?.messages;
  if(!Array.isArray(messages)||!messages.length||messages.some(m=>!['system','user','assistant'].includes(m?.role)||typeof m.content!=='string'))throw new PilotError('invalid-messages');
  const input=messages.map(m=>({role:m.role==='system'?'developer':m.role,content:m.content}));
  const inputBytes=new TextEncoder().encode(JSON.stringify(input)).length;
  if(inputBytes>LIMITS.inputBytes)throw new PilotError('input-too-large');
  // Reserve before dispatch. No retries; one uncertain request must not become two charges.
  calls++;
  const ticket=await budget.reserve({model:MODEL,inputBytes,maxOutputTokens:LIMITS.outputTokens});
  if(!ticket){blocked=true;logCall({call:calls,outcome:'budget-exhausted'});throw new PilotError('budget-exhausted')}
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),Math.max(1,Math.min(20000,timeoutMs)));
  const started=Date.now();
  let usage={status:'unknown',inputTokens:null,outputTokens:null},log={call:calls,inputBytes};
  try{
   // Workers only accept redirect 'follow' or 'manual' ('error' throws before any request is sent). The API never redirects,
   // so a 3xx is treated as a failure rather than followed.
   const response=await fetcher(ENDPOINT,{method:'POST',redirect:'manual',signal:controller.signal,
    headers:{Authorization:'Bearer '+env.OPENAI_API_KEY.trim(),'Content-Type':'application/json'},
    body:JSON.stringify({model:MODEL,input,store:false,max_output_tokens:LIMITS.outputTokens,reasoning:{effort:'low'}})});
   log.http=response.status;
   if(response.status>=300&&response.status<400){usage.status='http-'+response.status;await response.body?.cancel();throw new PilotError('provider-redirect')}
   if(!response.ok){usage.status='http-'+response.status;Object.assign(log,await providerErrorCodes(response));throw new PilotError(response.status===429?'provider-limit':'provider-error')}
   const data=await boundedJSON(response);
   const u=data.usage;
   if(Number.isSafeInteger(u?.input_tokens)&&u.input_tokens>=0&&Number.isSafeInteger(u?.output_tokens)&&u.output_tokens>=0)
    usage={status:data.status==='completed'?'completed':'incomplete',inputTokens:u.input_tokens,outputTokens:u.output_tokens};
   log.status=safe(data.status);log.reasoningTokens=Number.isSafeInteger(u?.output_tokens_details?.reasoning_tokens)?u.output_tokens_details.reasoning_tokens:undefined;
   if(data.status!=='completed'){log.incomplete=safe(data.incomplete_details?.reason);throw new PilotError('incomplete-response')}
   const text=(data.output||[]).filter(item=>item.type==='message'&&item.role==='assistant').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('');
   if(!text)throw new PilotError('empty-response');
   log.outcome='ok';
   return {response:text};
  }catch(error){
   // Never surface provider bodies, keys, or exception strings containing prompts. Only the exception's class name is logged.
   const pilot=error instanceof PilotError?error:new PilotError(controller.signal.aborted?'provider-timeout':'provider-unavailable');
   if(!(error instanceof PilotError))log.exception=safe(error?.name)||'unknown';
   log.outcome=pilot.code;
   // One failure stops the provider for the rest of this turn: later steps use the existing rules instead of paying again.
   blocked=true;
   throw pilot;
  }finally{
   clearTimeout(timer);
   log.ms=Date.now()-started;log.inputTokens=usage.inputTokens??undefined;log.outputTokens=usage.outputTokens??undefined;
   logCall(log);
   try{await budget.record(ticket,usage)}catch{blocked=true;throw new PilotError('usage-record-failed')}
  }
 },
 /** True once a call has failed in this turn; callers can skip the provider instead of trying again. */
 get stopped(){return blocked}};
}
