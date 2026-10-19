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
export function calendarChangeReply(proposal,memory){
 return {reply:'Review the saved reminder below before confirming the change.',calendarChange:proposal,
 verifiedSources:[],liveSources:[],actions:[],liveInformation:false,liveJourneyData:false,
 research:{assistant:true,status:'answered',claims:[],unresolved:[],taskContext:{task:{assistant:memory}}}};
}
