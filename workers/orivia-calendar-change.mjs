// A proposal only. Saved events are never sent to the model and never changed by this module.
export function calendarChangeProposal(v){
 if(!v||typeof v!=='object'||!['update','delete'].includes(v.kind))return null;
 const str=(x,n)=>typeof x==='string'?x.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n):'';
 const date=str(v.date,10),time=str(v.time,5);
 if(date){if(date!==String(v.date).trim())return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;const d=new Date(date+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date)return null}
 if(time&&time!==String(v.time).trim())return null;
 if(time&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))return null;
 return {kind:v.kind,target:str(v.target,100),date:date||null,time:time||null,title:str(v.title,100)||null,question:str(v.question,180),needsTime:v.needsTime===true,needsDate:v.needsDate===true};
}
export function calendarChangeReply(proposal,memory,{supported=true}={}){
 return {reply:supported?'Review the saved reminder below before confirming the change.':'This tab needs refreshing to show the reminder editor. Refresh the page, then ask for the change again. Nothing has been changed.',...(supported?{calendarChange:proposal}:{}),
 verifiedSources:[],liveSources:[],actions:[],liveInformation:false,liveJourneyData:false,
 research:{assistant:true,status:'answered',claims:[],unresolved:[],taskContext:{task:{assistant:memory}}}};
}

// A calendar proposal must be grounded in this turn, never just an old request in memory.
export function currentCalendarRequest(value,messages){
 const latest=[...(messages||[])].reverse().find(m=>m.role==='user')?.content||'';
 const normal=s=>String(s).normalize('NFKC').toLowerCase().replace(/[’']/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const now=normal(latest),quote=normal(value?.requestQuote||'');
 if(!quote||!now.includes(quote))return false;
 // These are feedback or requests for help, not consent to revive an old edit.
 const feedback=/^(?:what|what do you mean|huh|i (?:am|m) (?:lost|confused)|i need help|help|quoi|comment|hein|je (?:suis (?:perdu|perdue|perdus|perdues)|ne comprends pas)|j ai besoin d aide|aide moi|aidez moi|ماذا|ماذا تقصد|لم أفهم|لا أفهم|انا ضائع|أنا ضائع|أنا تائه|انا تائه|احتاج مساعدة|أحتاج مساعدة)$/u;
 return !feedback.test(now);
}
