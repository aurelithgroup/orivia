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
  if(!ticket)throw new PilotError('budget-exhausted');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),Math.max(1,Math.min(20000,timeoutMs)));
  let usage={status:'unknown',inputTokens:null,outputTokens:null};
  try{
   const response=await fetcher(ENDPOINT,{method:'POST',redirect:'error',signal:controller.signal,
    headers:{Authorization:'Bearer '+env.OPENAI_API_KEY.trim(),'Content-Type':'application/json'},
    body:JSON.stringify({model:MODEL,input,store:false,max_output_tokens:LIMITS.outputTokens,reasoning:{effort:'low'}})});
   if(!response.ok){usage.status='http-'+response.status;await response.body?.cancel();throw new PilotError(response.status===429?'provider-limit':'provider-error')}
   const data=await boundedJSON(response);
   const u=data.usage;
   if(Number.isSafeInteger(u?.input_tokens)&&u.input_tokens>=0&&Number.isSafeInteger(u?.output_tokens)&&u.output_tokens>=0)
    usage={status:data.status==='completed'?'completed':'incomplete',inputTokens:u.input_tokens,outputTokens:u.output_tokens};
   if(data.status!=='completed')throw new PilotError('incomplete-response');
   const text=(data.output||[]).filter(item=>item.type==='message'&&item.role==='assistant').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('');
   if(!text)throw new PilotError('empty-response');
   return {response:text};
  }catch(error){
   // Never surface provider bodies, keys, or exception strings containing prompts.
   throw error instanceof PilotError?error:new PilotError('provider-unavailable');
  }finally{
   clearTimeout(timer);
   try{await budget.record(ticket,usage)}catch{blocked=true;throw new PilotError('usage-record-failed')}
  }
 }};
}
