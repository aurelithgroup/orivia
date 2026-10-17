/* Conservative first research planner. Not a universal intent classifier.
 * Unrecognised questions remain on the existing chat path; uncertain research
 * requests clarify instead of using a community source for a consequential fact.
 */
const clean=s=>String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/\b(curriculum|curricula)(schools?)\b/g,'$1 $2');
const UAE=/\b(uae|united arab emirates|dubai|sharjah|abu dhabi|ajman|fujairah|umm al quwain|ras al khaimah)\b/i;
const UK=/\b(uk|united kingdom|britain|england|scotland|wales|northern ireland|edinburgh|london|manchester|birmingham|glasgow)\b/i;
const EMIRATES=['Dubai','Sharjah','Abu Dhabi','Ajman','Fujairah','Umm Al Quwain','Ras Al Khaimah'];
const UK_PLACES=['Edinburgh','London','Manchester','Birmingham','Glasgow','Scotland','England','Wales','Northern Ireland'];
function place(text){
 const t=clean(text).replace(/\b(?:came|come|coming|moved|moving|arrived|travelled|traveling)\s+from\s+(?:the\s+)?(?:uk|united kingdom|britain|uae|united arab emirates)\b/g,'');let country=null;
 // Prefer an explicit destination after a correction/move, not an origin in the same turn.
 const corrected=t.split(/\b(?:actually|i meant|moving to|moved to|instead)\b/).at(-1);
 const p=UAE.test(corrected)||UK.test(corrected)?corrected:t;
 const a=UAE.exec(p),b=UK.exec(p);
 if(a&&b)country=a.index>b.index?'uae':'uk';else country=a?'uae':b?'uk':null;
 const city=(country==='uae'?EMIRATES:UK_PLACES).find(x=>p.includes(x.toLowerCase()))||'';
 return {country,city};
}
const organisations=[[/heriot[ -]?watt/i,'Heriot-Watt'],[/wollongong|\buowd\b/i,'University of Wollongong Dubai'],[/emirates nbd|\benbd\b/i,'Emirates NBD'],[/\badcb\b/i,'ADCB'],[/first abu dhabi bank|\bfab\b/i,'First Abu Dhabi Bank']];
const detect=t=>{
 const topics=[];
 if(/\b(bank|banking|account)\b/.test(t))topics.push('bank');
 if(/\b(schools?|schooling|curricul(?:um|a))\b/.test(t))topics.push('school');
 if(/\bmedical\b|health (?:check|test)|blood test|x[ -]?ray/.test(t))topics.push('medical');
 if(/fingerprints?|biometrics?/.test(t))topics.push('biometrics');
 if(/\bvisa\b|residen|emirates id|entry permit/.test(t)&&!topics.length)topics.push('residency');
 if(/\b(uni|university|college|institution)\b/.test(t)&&/documents?|sorting|process|admissions|status|application/.test(t))topics.push('institution');
 if(/hang[ -]?out|meet people|what.*area.*like|local tips|caf[eé]s?|restaurants?/.test(t))topics.push('community');
 return [...new Set(topics)];
};
export function planResearch(messages,profile){
 const users=(Array.isArray(messages)?messages:[]).filter(m=>m.role==='user').map(m=>String(m.content||''));
 const latest=clean(users.at(-1));if(!latest)return {needed:false};
 const assistants=(Array.isArray(messages)?messages:[]).slice(0,-1).filter(m=>m.role==='assistant');
 const previous=clean(assistants.at(-1)?.content);
 // An assistant's offer identifies the pending TASK, never factual evidence or
 // a confirmed location. Short replies must not lose a lookup already offered.
 const continuing=latest.length<180&&(/^(?:yes|yeah|yep|sure|please|ok|okay|bruh|um+|uh+|i think so|not sure|i'm not sure|all|both|more|year|grade|british|american|indian|english)\b/.test(latest)||/\b(?:do it for me|you'?d do|you would do|find them|look (?:it|them) up|best option for them|what about them|what (?:do i do|happens) (?:now|next)|what next|contact|phone|email|call|telephone|can you (?:find|get|look up) (?:that|it|them))\b/.test(latest));
 let topics=detect(latest),inherited=false;
 if(!topics.length&&continuing){topics=detect(previous);inherited=topics.length>0;}
 if(!topics.length&&(continuing||/\b(then|after|that|those|card|it|they|actually|meant|instead)\b/.test(latest)||place(latest).country)){
  for(let i=users.length-2;i>=Math.max(0,users.length-5);i--){const old=detect(clean(users[i]));if(old.length){topics=old;inherited=true;break;}}
 }
 if(!topics.length)return {needed:false};
 const curriculumNames=[['british',/\bbritish\b/],['american',/\bamerican\b/],['indian',/\bindian\b/],['ib',/\bib\b|international baccalaureate/]];
 let curriculum='';for(const turn of users){const named=curriculumNames.find(([,re])=>re.test(clean(turn)));if(named)curriculum=named[0];}
 // Track the requested action separately from its topic. An offer is a task cue, never evidence.
 const schoolTask=t=>/\b(contact|phone|email|call|telephone)\b/.test(t)?'contacts':/\b(what (?:do i do|happens) (?:now|next)|what next|next steps?)\b/.test(t)?'next-steps':/\b(register|enrol|enroll|admissions?|apply|application|documents?|requirements?)\b/.test(t)?'admissions':/\b(find(?:ing)?|list|look (?:it |them )?up|recommend|which schools?|options|curricul(?:um|a))\b/.test(t)?'discovery':null;
 if(!curriculum&&inherited){for(let i=assistants.length-1;i>=0;i--){const named=curriculumNames.find(([,re])=>re.test(clean(assistants[i].content)));if(named){curriculum=named[0];break;}}}
 const explicitSchoolTask=/\b(?:find|get|look up) (?:that|it|them)(?: for me)?\b/.test(latest)?null:schoolTask(latest);
 const offeredTask=continuing?schoolTask(previous):null;
 let schoolIntent=explicitSchoolTask||offeredTask;
 if(!schoolIntent){for(let i=users.length-2;i>=0;i--){const task=schoolTask(clean(users[i]));if(task){schoolIntent=task;break;}}}
 schoolIntent=schoolIntent||'admissions';
 let year=null;
 for(const turn of users){const m=clean(turn).match(/\b(?:year|grade)\s*(1[0-3]|[1-9])\b/);if(m)year=Number(m[1]);}
 let location={country:null,city:''};
 if(profile&&typeof profile==='object')location=place(profile.city||profile.movingTo||'');
 for(const turn of users){const next=place(turn);if(next.country)location={country:next.country,city:next.city||(next.country===location.country?location.city:'')};}
 // Resolve the place named in the active school task after the original turn ages out.
 // This is conversational scope only; all facts still require a newly fetched approved source.
 if(inherited&&topics.includes('school')&&!users.some(t=>place(t).country)){
  for(let i=assistants.length-1;i>=0;i--){if(!detect(clean(assistants[i].content)).includes('school'))continue;const scoped=place(assistants[i].content);if(scoped.country&&scoped.city){location=scoped;break;}}
 }
 let organisation=organisations.find(([re])=>re.test(String(profile?.place||'')))?.[1]||null;
 for(const turn of users){const found=organisations.find(([re])=>re.test(turn));if(found)organisation=found[1];}
 const currentOrg=organisations.find(([re])=>re.test(latest));if(currentOrg)organisation=currentOrg[1];
 const parts=topics.flatMap(topic=>{
  const base={topic,tier:topic==='community'?'community':topic==='institution'?'organisation':'official',...(organisation?{organisation}:{}),...(topic==='school'?{intent:schoolIntent,curriculum,...(year?{year}:{})}: {})};
  return topic==='bank'&&['Emirates NBD','ADCB','First Abu Dhabi Bank'].includes(organisation)?[base,{topic,tier:'organisation',organisation}]:[base];
 });
 let clarification=null;
 // Do not assume the university's "documents" means immigration documents.
 if(topics.includes('institution')&&!/\bvisa\b|residen|emirates id|entry permit|admissions|enrol|enroll/.test(latest)&&!inherited)
  clarification='Which documents do you mean—the ones for enrolment, your visa, or something else?';
 else if(!location.country)clarification='Is this for the UAE or the UK?';
 else if(topics.includes('school')&&location.country==='uae'&&!location.city)clarification='Which emirate will your children go to school in?';
 else if(topics.includes('medical')&&!users.some(t=>/visa|residen|emirates id|entry permit/i.test(t)))
  clarification='Is the medical test for your residence visa, or has someone asked for a different kind of test?';
 else if(topics.includes('institution')&&!organisation&&!profile?.place)
  clarification='Which institution is handling it?';
 const queryTerms={school:'school enrolment children admission documents',bank:'bank account identity documents non resident eligibility',medical:'residence visa medical fitness examination official centres procedure',biometrics:'identity residence application biometrics next steps card issuance',residency:'student residence visa application status official',institution:'student visa application status contact office',community:'local places community recommendations'};
 const queries=parts.slice(0,2).map(p=>({part:p,query:[location.country==='uae'?'United Arab Emirates':'United Kingdom',location.city,p.organisation||'',p.topic==='school'&&p.intent==='discovery'?[p.curriculum,location.country==='uae'&&location.city==='Sharjah'?'curriculum private school':'curriculum schools official school directory'].filter(Boolean).join(' '):queryTerms[p.topic]].filter(Boolean).join(' ')}));
 return {needed:true,location,parts,queries,clarification,mixed:parts.length>1,
  privateStatus:topics.includes('institution'),
  cautions:['Do not infer any completed step, appointment, approval or card delivery.','Never ask for ID numbers or send personal application details to search.',...(topics.includes('bank')?['Do not promise an account or an exemption from identity checks.']:[]),...(topics.includes('medical')?['Do not give a diagnosis or assume which tests apply.']:[])]};
}
