/**
 * Read-only student journey bridge for private Orivia trial.
 * Shares the journey data directly with orivia-api while its branch deployment
 * is pending. Never performs writes, stores answers, or trusts model-built paths.
 */
import {callJourneyApi} from '../server/src/journeys.js';
import {normaliseJourney,get_checkups,get_step} from './orivia-journey-tools.mjs';
import {inspectSource,validateEvidence} from './orivia-source-policy.mjs';

const ID='dubai.eid.student';
const fetchData=path=>{const r=callJourneyApi(path);return r.status===200?r.data:null};
const full=()=>{const d=fetchData('/api/v1/journeys/'+ID);return d?.journey?.aiReady&&normaliseJourney(d.journey)?d:null};
const cleanse=s=>String(s||'').trim();
const answerFor=t=>{
 const x=cleanse(t).toLowerCase().replace(/[.!?,]+/g,' ').replace(/\s+/g,' ').trim();
 if(/\b(not sure|unsure|no idea|don'?t know|do not know|idk|maybe|i think so|not certain)\b/.test(x))return 'unsure';
 if(/^(yes|yep|yeah|yup|ya|sure|correct|i have|i did|already|done|i'?m in the uae|i am in the uae|i'?ve arrived|i have arrived|arrived)\b/.test(x))return 'yes';
 if(/^(no|nope|nah|not yet|i haven'?t|i have not|haven'?t|i'?m not in the uae|i am not in the uae|not in the uae)\b/.test(x))return 'no';
 return null;
};
function response(reply,extra={}){
 return {reply,verifiedSources:[],liveSources:[],actions:[],liveInformation:false,liveJourneyData:false,...extra};
}
const list=(xs,max=6)=>(Array.isArray(xs)?xs:[]).map(cleanse).filter(Boolean).slice(0,max);
/* Facts for the current step, handed to the AI to explain in its own words.
   The AI phrases; the journey decides the facts. Nothing here is stored. */
function stepContext(stepId,extra={}){
 const detail=fetchData('/api/v1/journeys/'+ID+'/steps/'+stepId);
 if(!detail?.step)return {reply:'I couldn’t load the checked details for that step just now. Your university visa office can tell you what comes next.',verifiedSources:[],liveSources:[],actions:[],liveInformation:false,liveJourneyData:false};
 const st=detail.step, source=st.source||{};
 const inspected=inspectSource(source.url,'residency');
 const sourceOk=inspected.accepted&&/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt||'');
 const evidence=sourceOk?validateEvidence({title:'ICP source referenced by Orivia journey',description:'Journey-level government reference; review date '+source.checkedAt,url:source.url,verifiedOn:source.checkedAt},'residency'):null;
 const contacts=(detail.contacts||[]).map(c=>cleanse(c.who)+': '+cleanse(c.why)+' How to reach them: '+cleanse(c.how)+(Array.isArray(c.ready)&&c.ready.length?' Have ready: '+list(c.ready).join('; ')+'.':'')).join('\n');
 const templates=(detail.problems||[]).filter(p=>p.contact?.say).slice(0,4).map(p=>'- If "'+cleanse(p.question)+'": '+cleanse(p.answer)+' Message to send: "'+cleanse(p.contact.say)+'"').join('\n');
 const lines=[
  'CHECKED ORIVIA JOURNEY FACTS (the only source for process steps, documents, timings and contacts in your reply):',
  extra.progressLine||'',
  'Journey: '+cleanse(detail.journey?.title)+'. The person is at step '+detail.position.index+' of '+detail.position.of+': '+cleanse(st.title)+'.',
  st.now?'Right now: '+cleanse(st.now):'',
  list(st.doThis).length?'What happens: '+list(st.doThis).join(' '):'',
  list((st.bring||[]).map(b=>b.item)).length?'Bring: '+list((st.bring||[]).map(b=>b.item)).join('; ')+'.':'',
  st.waitingFor?'Waiting for: '+cleanse(st.waitingFor):'',
  st.time?'Usual time: '+cleanse(st.time):'',
  list(st.tips,3).length?'Tips: '+list(st.tips,3).join(' '):'',
  contacts?'Who to contact:\n'+contacts:'',
  templates?'Common problems and the exact messages to send (keep [brackets] for details the person hasn’t given):\n'+templates:'',
  'Guide reviewed '+(source.checkedAt||'unknown')+(sourceOk?'; general official reference: '+inspected.url+' (journey-level, not proof of university-specific details).':'.')+(detail.fresh?'':' This guide is due for review: say so and suggest confirming with the visa office.'),
  'HOW TO REPLY: Answer the person’s latest message directly, warmly, in 2-5 short sentences. If the previous reply offered both a message draft and a reminder and the user says "yes please", ask which one they want instead of repeating the step. If they say "what?" or sound confused, rephrase the last explanation in simpler words and ask what they want clarified. Do not repeat the same step or offer verbatim in consecutive answers. If they change topic, follow them. The first time, tell them where they are and the one next thing to do. Mention the guide and its review date once, briefly, not in every message. If they accept help drafting a message, write it from the matching template. If they want a reminder, tell them to type "remind me to …" and Orivia will set it up. Offer at most one next action. Never ask for passport, visa or ID numbers.'
 ].filter(Boolean).join('\n');
 return {journeyContext:lines,verifiedSources:evidence?[evidence]:[],journey:{id:ID,currentStep:stepId,done:Array.isArray(extra.done)?extra.done:[],from:extra.from||'checkups',requiresConfirmation:true}};
}
/* opts.progress: the person's own step statuses for this journey from Journeys (ids and statuses only) */
export function tryJourneyReply(messages,opts={}){
 if(!Array.isArray(messages)||!messages.length)return null;
 const last=cleanse(messages.at(-1)?.content);
 const history=messages.slice(0,-1);
 const studentHint=/student|university|\buni\b|college|campus/i.test(messages.map(m=>m.content).join(' '));
 const visaHint=/\bvisa\b|residen|emirates id|entry permit|fingerprints|biometric/i.test(last);
 const consentLine='Would you like help with your student residence visa and Emirates ID journey?';
 const offered=history.some(m=>m.role==='assistant'&&m.content.includes(consentLine));
 const active=history.some(m=>m.role==='assistant'&&m.content.includes('Are you in the UAE now?'))
   ||history.some(m=>m.role==='assistant'&&m.content.includes('Source: https://icp.gov.ae/'))
   ||(offered&&answerFor(last)==='yes');
 const explicit=visaHint&&(studentHint||/student visa/i.test(last));
 if(!explicit&&!active){
   // If a student mentions university without a specific visa question, do not
   // funnel them automatically into immigration tasks.
   return null;
 }
 const d=full();
 if(!d)return response('I cannot load the approved student residency journey at the moment. Please try again later.');
 const j=d.journey, checkups=get_checkups(j);
 if(!checkups.ok)return response('I cannot load the journey check-up questions right now.');
 const questions=checkups.questions;
 /* Chat and Journeys share one record: if they've ticked steps in Journeys, start from there instead of re-asking */
 const mine=opts.progress&&typeof opts.progress==='object'?opts.progress:null;
 const askedBefore=history.some(m=>m.role==='assistant'&&questions.some(q=>m.content.includes(q.question)));
 if(mine&&Object.keys(mine).length&&!askedBefore){
  const next=j.steps.find(st=>mine[st.id]!=='done');
  if(!next)return response('You’ve ticked every step of this guide in Journeys. If anything changes, your university visa office can confirm where things stand.',{journey:{id:ID,from:'journeys',complete:true}});
  return stepContext(next.id,{from:'journeys',done:j.steps.filter(st=>mine[st.id]==='done').map(st=>st.id),progressLine:opts.progressLine||''});
 }
 const answers={};
 for(let i=0;i<history.length-1;i++){
  if(history[i].role!=='assistant'||history[i+1].role!=='user')continue;
  const q=questions.find(q=>history[i].content.includes(q.question));
  if(!q)continue;
  const a=answerFor(history[i+1].content);
  if(a)answers[q.id]=a;
 }
 const prev=history.at(-1);
 const currentQuestion=prev?.role==='assistant'?questions.find(q=>prev.content.includes(q.question)):null;
 if(currentQuestion){
   const a=answerFor(last);
   if(!a)return null;
   answers[currentQuestion.id]=a;
 }
 const query=last.slice(0,200);
 const matches=fetchData('/api/v1/journeys/match?q='+encodeURIComponent(query)+'&city=dubai');
 if(!active&&explicit&&!matches?.candidates?.some(x=>x.id===ID)){
   // A specific visa request can still use the single reviewed journey.
   // Never activate a different or unreviewed journey.
 }
 const encoded=Object.entries(answers).filter(([k,v])=>/^q\d{1,2}$/.test(k)&&['yes','no','unsure'].includes(v))
   .map(([k,v])=>k+':'+v).join(',');
 const placementData=fetchData('/api/v1/journeys/'+ID+'/place?answers='+encodeURIComponent(encoded));
 const placement=placementData?.placement;
 if(!placement)return response('I could not check your position in this journey just now.');
 if(placement.status==='needs_answer'&&placement.nextQuestion){
  const q=placement.nextQuestion;
  const first=!Object.keys(answers).length;
  return response((first?'Let’s work out where you are, one quick question at a time. ':'')+cleanse(q.question)+' (yes / no'+(q.allowsUnsure?' / not sure':'')+')',{journey:{id:ID,status:'needs_answer',questionId:q.id}});
 }
 if(placement.status==='not_sure'){
  return response('That is okay—we will not guess which steps are complete. '+(cleanse(placement.confirmHow)||'Your university visa office can confirm the status.')+' Would you like me to help draft a message?',{journey:{id:ID,status:'not_sure',unsureStep:placement.currentStep||null,done:Array.isArray(placement.done)?placement.done:[]}});
 }
 if(placement.complete)return response('It looks like you have reached the end of these check-up questions. Please confirm your final status with the university visa office before treating the process as complete.');
 if(placement.stepId){
  const s=get_step(j,placement.stepId);
  if(!s.ok)return response('I could not validate that step. Let’s verify it with the university visa office.');
  return stepContext(placement.stepId,{done:placement.done,from:'checkups'});
 }
 return response('I cannot determine the correct step yet. Could you tell me what your university has already confirmed?');
}
