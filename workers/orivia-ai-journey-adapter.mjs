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
 const x=cleanse(t).toLowerCase().replace(/[.!?]+$/,'');
 if(/^(yes|yep|yeah|yup|i have|already|i did|done|yes i have|yes i did|i'm in the uae|i am in the uae|i've arrived|i have arrived)$/.test(x))return 'yes';
 if(/^(no|nope|not yet|i haven't|i have not|haven't|no i haven't|no i have not|i'm not in the uae|i am not in the uae)$/.test(x))return 'no';
 if(/^(not sure|i'm not sure|i am not sure|i don't know|idk|unsure|maybe)$/.test(x))return 'unsure';
 return null;
};
function response(reply,extra={}){
 return {reply,verifiedSources:[],liveSources:[],actions:[],liveInformation:false,liveJourneyData:false,...extra};
}
function stepReply(data,stepId){
 const detail=fetchData('/api/v1/journeys/'+ID+'/steps/'+stepId);
 if(!detail?.step)return response('I could not retrieve the checked next step. Please ask your university visa office to confirm what comes next.');
 const source=detail.step.source;
 // A journey-level official source is a starting reference, not proof of
 // university-specific requirements. Don't turn it into verified legal advice.
 const inspected=inspectSource(source?.url,'residency');
 if(!inspected.accepted||!/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt||'')){
   return response('I found a possible step, but its official source has not passed the AI evidence check. Please confirm the requirement with your university visa office.');
 }
 const title=cleanse(detail.step.title)||'Your next step';
 const description=cleanse(detail.step.now)||cleanse(detail.step.doThis?.[0]);
 const caveat=detail.fresh?'':' This journey needs rechecking against current official guidance.';
 const summary=[title+'.',description, 'Source: '+inspected.url+' (reviewed '+source.checkedAt+').'+caveat].filter(Boolean).join(' ');
 const evidence=validateEvidence({title:'ICP source referenced by Orivia journey',description:'Journey-level government reference; review date '+source.checkedAt,url:source.url,verifiedOn:source.checkedAt},'residency');
 return response(summary+' Want me to help you draft a message to your university visa office, or prepare a reminder?',{verifiedSources:evidence?[evidence]:[],journey:{id:ID,currentStep:stepId,requiresConfirmation:true}});
}
export function tryJourneyReply(messages){
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
   if(!a)return response('You can answer yes or no'+(currentQuestion.options.some(o=>o.value==='not_sure')?', or say “not sure”':'')+'. '+currentQuestion.question);
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
  return response('I can help you work out which step applies. '+cleanse(q.question)+' You can say yes, no'+(q.allowsUnsure?', or not sure':'')+'.',{journey:{id:ID,status:'needs_answer',questionId:q.id}});
 }
 if(placement.status==='not_sure'){
  return response('That is okay—we will not guess which steps are complete. '+(cleanse(placement.confirmHow)||'Your university visa office can confirm the status.')+' Would you like me to help draft a message?',{journey:{id:ID,status:'not_sure'}});
 }
 if(placement.complete)return response('It looks like you have reached the end of these check-up questions. Please confirm your final status with the university visa office before treating the process as complete.');
 if(placement.stepId){
  const s=get_step(j,placement.stepId);
  if(!s.ok)return response('I could not validate that step. Let’s verify it with the university visa office.');
  return stepReply(d,placement.stepId);
 }
 return response('I cannot determine the correct step yet. Could you tell me what your university has already confirmed?');
}
