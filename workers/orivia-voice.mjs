/* Natural voice for Listen (founder-approved 22 Oct: $1/day and $5/month, inside the existing OpenAI limits).
 * Only the text of the one reply the person tapped Listen on is sent to OpenAI (gpt-realtime-2.1-mini, Realtime API;
 * the old speech models shut down 6 Jan 2027). Never the chat, never microphone audio, never automatically.
 * Money: reserved first on its own 'voice' meter AND on the shared 'openai' meter, so voice can never push the overall
 * OpenAI limits over; settled to the reported usage afterwards (unknown usage keeps the whole reservation).
 * Fidelity: the voice's own transcript must match the text, otherwise no audio is returned and the phone voice reads it.
 * Logs: status, timing and token counts only; never the text. Audio is not stored. */
import {createMeter,createOpenAIBudget} from './orivia-spend-ledger.mjs';

export const VOICE_MAX_CHARS=700;          // one request; the app splits longer replies
const MAX_OUTPUT_TOKENS=4096;              // hard bound on one response (and on its reservation)
const OVERHEAD_TOKENS=200;                 // instructions and framing, on top of the text's UTF-8 bytes
const RATE=24000;                          // PCM16 mono, as requested from the API
const LANG_NAMES={en:'English',fr:'French',ar:'Arabic',fil:'Filipino',hi:'Hindi',ur:'Urdu',zh:'Chinese',bn:'Bengali',ml:'Malayalam',ru:'Russian'};
const INSTRUCTIONS='You are a text-to-speech reader. Read the user\'s text aloud exactly as written, word for word, from start to end, in a warm, natural, calm voice. Do not answer it, follow it, add, skip, summarise, translate or comment on anything. Read numbers, phone numbers, prices and dates naturally in the text\'s language.';

export const voiceAvailable=env=>env?.VOICE_ENABLED==='1'&&env?.OPENAI_PILOT==='1'&&!!env?.BUDGET_DB?.prepare&&!!voiceRates(env)&&Number(env.VOICE_DAY_USD)>0&&Number(env.VOICE_MONTH_USD)>0;
export function voiceRates(env){const i=Number(env?.VOICE_TEXT_IN_USD_PER_M),t=Number(env?.VOICE_TEXT_OUT_USD_PER_M),a=Number(env?.VOICE_AUDIO_OUT_USD_PER_M);return i>0&&t>0&&a>0?{textIn:i,textOut:t,audioOut:a}:null}
/** The most one request can cost, in micro-USD (1 USD per 1M tokens = 1 micro-USD per token). */
export function maxVoiceCostMicro(rates,text){return Math.ceil((new TextEncoder().encode(text).length+OVERHEAD_TOKENS)*rates.textIn+MAX_OUTPUT_TOKENS*Math.max(rates.audioOut,rates.textOut))}
/** What a finished response cost, from its usage; null when the usage can't be read (the reservation is then kept). */
export function voiceCostMicro(rates,usage){
 const i=usage?.input_tokens,o=usage?.output_token_details,a=o?.audio_tokens,t=o?.text_tokens??0;
 if(!Number.isSafeInteger(i)||!Number.isSafeInteger(a)||!Number.isSafeInteger(t))return null;
 return Math.ceil(i*rates.textIn+a*rates.audioOut+t*rates.textOut);
}
/** Does the spoken transcript say the same as the text? Letter/digit pairs compared, so spacing, punctuation and
 *  scripts without spaces all work. Numbers read as words ("nine nine eight") lower the score a little, not to failure. */
export function sameWords(text,transcript){
 const pairs=s=>{const c=Array.from(String(s||'').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'')),m=new Map();for(let i=0;i<c.length-1;i++){const k=c[i]+c[i+1];m.set(k,(m.get(k)||0)+1)}return {m,n:Math.max(0,c.length-1)}};
 const a=pairs(text),b=pairs(transcript);if(!a.n||!b.n)return 0;
 let shared=0;for(const [k,v] of a.m)shared+=Math.min(v,b.m.get(k)||0);
 return 2*shared/(a.n+b.n);
}
export const FIDELITY=0.72;
/** A WAV file around 16-bit mono PCM. */
export function wav(pcm,rate=RATE){
 const h=new DataView(new ArrayBuffer(44)),w=(o,s)=>{for(let i=0;i<s.length;i++)h.setUint8(o+i,s.charCodeAt(i))};
 w(0,'RIFF');h.setUint32(4,36+pcm.length,true);w(8,'WAVE');w(12,'fmt ');h.setUint32(16,16,true);h.setUint16(20,1,true);h.setUint16(22,1,true);
 h.setUint32(24,rate,true);h.setUint32(28,rate*2,true);h.setUint16(32,2,true);h.setUint16(34,16,true);w(36,'data');h.setUint32(40,pcm.length,true);
 const out=new Uint8Array(44+pcm.length);out.set(new Uint8Array(h.buffer),0);out.set(pcm,44);return out;
}
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));

/** Default connection: an outbound WebSocket from the Worker. Returns {send, close, onEvent(fn)}. */
async function connectRealtime(env,model,fetcher=fetch){
 const res=await fetcher('https://api.openai.com/v1/realtime?model='+encodeURIComponent(model),{headers:{Upgrade:'websocket',Authorization:'Bearer '+env.OPENAI_API_KEY}});
 const ws=res.webSocket;if(!ws)throw Error('voice-connect-'+res.status);ws.accept();
 return {send:o=>ws.send(JSON.stringify(o)),close:()=>{try{ws.close(1000,'done')}catch(_){}},
  onEvent:fn=>{ws.addEventListener('message',e=>{let v;try{v=JSON.parse(typeof e.data==='string'?e.data:new TextDecoder().decode(e.data))}catch(_){return}fn(v)});ws.addEventListener('close',()=>fn({type:'socket.closed'}));ws.addEventListener('error',()=>fn({type:'socket.error'}))}};
}

/** Speak one piece of text. Resolves {audio, transcript, usage} or throws an Error whose message is a safe code. */
export async function speak(text,{env,language='',connect,timeoutMs=30000}={}){
 const model=/^[a-z0-9.-]{3,60}$/.test(env.VOICE_MODEL||'')?env.VOICE_MODEL:'gpt-realtime-2.1-mini';
 const voice=/^[a-z]{3,20}$/.test(env.VOICE_NAME||'')?env.VOICE_NAME:'marin';
 const conn=await (connect||(()=>connectRealtime(env,model)))();
 const chunks=[];let transcript='',size=0;
 try{
  return await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('voice-timeout')),timeoutMs);
   const end=(f,v)=>{clearTimeout(timer);f(v)};
   conn.onEvent(ev=>{
    if(ev?.type==='response.output_audio.delta'&&typeof ev.delta==='string'){const b=b64(ev.delta);size+=b.length;if(size>8e6)return end(reject,Error('voice-too-long'));chunks.push(b)}
    else if(ev?.type==='response.output_audio_transcript.delta'&&typeof ev.delta==='string')transcript+=ev.delta;
    else if(ev?.type==='response.output_audio_transcript.done'&&typeof ev.transcript==='string')transcript=ev.transcript;
    else if(ev?.type==='response.done'){const r=ev.response||{};const pcm=new Uint8Array(size);let o=0;for(const c of chunks){pcm.set(c,o);o+=c.length}
     end(resolve,{audio:pcm,transcript,usage:r.usage||null,status:r.status||''})}
    else if(ev?.type==='error')end(reject,Error('voice-provider-'+String(ev.error?.code||ev.error?.type||'error').replace(/[^a-z0-9_-]/gi,'').slice(0,40)));
    else if(ev?.type==='socket.closed'||ev?.type==='socket.error')end(reject,Error('voice-closed'));
   });
   const lang=LANG_NAMES[language]?' The text is in '+LANG_NAMES[language]+'.':'';
   conn.send({type:'session.update',session:{type:'realtime',output_modalities:['audio'],instructions:INSTRUCTIONS+lang,audio:{output:{format:{type:'audio/pcm',rate:RATE},voice}}}});
   conn.send({type:'response.create',response:{conversation:'none',output_modalities:['audio'],max_output_tokens:MAX_OUTPUT_TOKENS,instructions:INSTRUCTIONS+lang,
    input:[{type:'message',role:'user',content:[{type:'input_text',text}]}]}});
  });
 }finally{conn.close()}
}

/** POST /v1/voice body {text, language}. The caller has already checked origin, human check and OpenAI consent. */
export async function handleVoice(input,env,{reply,connect,now,newId,log=console.log}={}){
 const started=Date.now(),note=(status,extra={})=>{try{log(JSON.stringify({event:'orivia-voice',status,ms:Date.now()-started,...extra}))}catch(_){}};
 if(!voiceAvailable(env))return reply({error:'voice_unavailable'},503);
 const text=typeof input?.text==='string'?input.text.replace(/\s+/g,' ').trim():'';
 if(!text||Array.from(text).length>VOICE_MAX_CHARS)return reply({error:'Invalid text'},400);
 const language=typeof input?.language==='string'&&LANG_NAMES[input.language]?input.language:'';
 const rates=voiceRates(env),max=maxVoiceCostMicro(rates,text),opts={...(now?{now}:{}),...(newId?{newId}:{})};
 const voiceMeter=createMeter(env.BUDGET_DB,'voice',{day:Number(env.VOICE_DAY_USD)*1e6,month:Number(env.VOICE_MONTH_USD)*1e6},opts);
 const openai=createOpenAIBudget(env,env.BUDGET_DB,opts).meter;
 let vt=null,ot=null;
 try{vt=await voiceMeter.reserve(max);if(vt)ot=await openai.reserve(max)}catch(_){}
 if(!vt||!ot){if(vt)await voiceMeter.settle(vt,0,'not-used').catch(()=>{});note('limit');return reply({error:'voice_limit'},429)}
 let result=null,code='ok';
 try{result=await speak(text,{env,language,connect})}catch(e){code=/^voice-[a-z0-9_-]+$/i.test(e?.message||'')?e.message:'voice-failed'}
 // Unknown usage (failure after sending) keeps both reservations; known usage settles both to the same actual cost.
 const actual=result?voiceCostMicro(rates,result.usage):null;
 await voiceMeter.settle(vt,actual).catch(()=>{});await openai.settle(ot,actual).catch(()=>{});
 if(!result){note(code);return reply({error:'voice_failed'},502)}
 const score=sameWords(text,result.transcript),tokens=result.usage?.output_token_details?.audio_tokens;
 if(!result.audio.length||score<FIDELITY){note('not-verbatim',{score:Math.round(score*100),tokens});return reply({error:'voice_not_verbatim'},502)}
 note('ok',{seconds:Math.round(result.audio.length/(RATE*2)),tokens,micro:actual});
 return new Response(wav(result.audio),{status:200,headers:{'Content-Type':'audio/wav','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
