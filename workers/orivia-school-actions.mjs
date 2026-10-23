// Task-specific school follow-through. Contact facts come only from a freshly opened SPEA profile.
export function offersYear(grades,year){
 if(!year)return true;
 return String(grades||'').split(/[,|]/).map(x=>x.trim()).some(x=>new RegExp('^(?:Year\\s*)?'+year+'$','i').test(x));
}
export function schoolContacts(text){
 // Avoid SPEA's own footer contact: a school contact must be in its location/contact section.
 const section=String(text).match(/School Location\s*([\s\S]*?)(?=Apply for a service|FOLLOW US|$)/i)?.[1]||'';
 const phone=section.match(/Phone Number\s*(\+?\d[\d ()-]{6,18}\d)(?=\s|$)/)?.[1]?.trim()||'';
 const email=section.match(/Email\s*([a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,})/i)?.[1]||'';
 return {phone,email};
}
export function schoolActionText(part,sources){
 const year=part.year?'Year '+part.year:'';
 const claims=[];
 for(const s of sources){
  const p=s.profile;
  if(p.phone)claims.push({text:p.name+' — phone: '+p.phone+'.',sourceId:s.id,quote:'Phone Number '+p.phone});
  if(p.email)claims.push({text:p.name+' — email: '+p.email+'.',sourceId:s.id,quote:'Email '+p.email});
 }
 const intro=part.intent==='next-steps'?'The next step is to ask these schools’ admissions teams about '+(year?year+' ':'')+'places. Here are the contacts I could read on their SPEA profiles:':'Here are the school contacts I could read on their SPEA profiles'+(year?' for schools listing '+year:'')+':';
 const rows=sources.map((s,i)=>s.profile.name+'\n'+(s.profile.phone?'Phone: '+s.profile.phone+'\n':'')+(s.profile.email?'Email: '+s.profile.email+'\n':'')+(!s.profile.phone&&!s.profile.email?'I couldn’t confirm a school contact from this page.\n':'')+'SPEA profile ['+(i+1)+']');
 const next='You can ask: “Do you have '+(year?year+' ':'')+'places available? What is the application process, which documents do you need, and can we arrange a visit?” I haven’t confirmed seats, fees or admissions requirements.';
 return {reply:intro+'\n\n'+rows.join('\n\n')+'\n\n'+next,claims};
}
