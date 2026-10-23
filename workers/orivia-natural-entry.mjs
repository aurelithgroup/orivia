/**
 * Natural language entry hints for real newcomer conversations.
 * Hints are conversational guidance, not verified facts or journey placement.
 * Never infer residency, visas, eligibility, a family problem, or saved memory.
 */
const val=x=>String(x||'').trim();
const normalize=x=>val(x).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
export function detectOpenNeed(messages){
 if(!Array.isArray(messages)||!messages.length)return null;
 const last=messages.at(-1);
 if(last?.role!=='user')return null;
 const utterance=normalize(last.content);
 if(!utterance)return null;
 const userTurns=messages.filter(m=>m.role==='user');
 // On a follow-up, let the AI use context rather than repeatedly restarting intake.
 const first=userTurns.length===1;
 if(!first)return null;
 const university=/\b(uni|university|college|campus)\b/.test(utterance);
 const unclear=/\b(idk|dunno|dont know|not sure|unsure|no idea|confused|what to do|what i need)\b/.test(utterance);
 const start=/\b(start|starting|begin|beginning|enroll|enrolling|joining)\b/.test(utterance);
 const specific=/\b(visa|residen[ct]|permit|emirates id|id card|passport|route|transport|bus|metro|drive|driving|directions|fees|tuition|accommodation|housing|registration|register)\b/.test(utterance);
 // "residence id": two words are not sufficient to identify a specific service.
 if(/^(?:uae |dubai )?(?:residence|residency|resident)\s*(?:id|identity|card)?$/.test(utterance)||
    /^(?:emirates|residence)\s+id$/.test(utterance)){
  return {kind:'ambiguous_document',guidance:'The user gave a brief, ambiguous document request. Do not guess whether they mean the Emirates ID card, residency/visa status, or an application. Reply in plain words and ask ONE short disambiguating question, e.g. whether they mean getting an Emirates ID or sorting out their residence visa. Do not claim the user needs both.'};
 }
 if(university&&(start||unclear)&&!specific){
  return {kind:'unsure_student',guidance:'The user is starting university but has not said what help they need and may be overwhelmed. Acknowledge that naturally without congratulatory filler. Do not assume they need a residence visa or start a visa check-up. Offer 2-3 understandable choices in ONE concise question (e.g. getting ready for uni, documents, or getting there), and let them say something else. Use already provided time/city/university, but do not invent details.'};
 }
 const moving=/\b(just moved|recently moved|moved here|moving here|new here|just arrived|arrived here)\b/.test(utterance);
 const family=/\b(kids|children|child|family|daughter|son)\b/.test(utterance);
 if(moving&&family&&!specific){
  return {kind:'family_arrival',guidance:'The user simply shared that they moved with children. Do not presume school, visa or medical problems. Acknowledge in one natural sentence, then ask ONE open question about what they need help settling into. Do not ask for children\'s names, ages, documents or sensitive details.'};
 }
 if(utterance.length<28&&!specific&&/\b(visa|residence|identity)\b/.test(utterance)){
  return {kind:'short_document',guidance:'Brief fragment about documents, not a complete request. Ask ONE plain clarification instead of claiming you know the user\'s residency status. No form or list of prerequisites.'};
 }
 return null;
}
export function entryGuidance(messages){
 const result=detectOpenNeed(messages);
 return result?'NATURAL OPENING INTENT ('+result.kind+'): '+result.guidance:'';
}
