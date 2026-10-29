/* Plan step states, history and dependencies (master spec ORI-JOURNEY-003/004).
   - States the person can choose: not started, in progress, waiting for me, waiting for the organisation, blocked,
     done, not applicable, not sure. "Ready" isn't stored: it's shown when every earlier step is done or not applicable.
   - Steps are in order, so a step depends on the ones before it. What blocks a step is any earlier step that isn't done
     or not applicable, plus its own "blocked" note.
   - Every change is recorded (step, from, to, time, who: always "you" here), so the step can say where its state came
     from, and the last change can be undone. Done is the person's own record, never an official approval.
   Pure functions on one saved journey entry ({stepStatus, history, notes}); the caller saves the result. */
(function(root){
 'use strict';
 const STATES=['not_started','in_progress','waiting_you','waiting_org','blocked','done','not_applicable','unsure'];
 const LABEL={not_started:'Not started',ready:'Ready',in_progress:'In progress',waiting_you:'Waiting on me',waiting_org:'Waiting for them',blocked:'Blocked',done:'Done',not_applicable:'Not applicable',unsure:'Not sure'};
 const MARK={not_started:'',ready:'→',in_progress:'•',waiting_you:'!',waiting_org:'◷',blocked:'⊘',done:'✓',not_applicable:'–',unsure:'?'};
 const HISTORY=50,ID=/^[a-z0-9_-]{1,30}$/;
 const finished=s=>s==='done'||s==='not_applicable';
 // Older saves used one "waiting" state, which only appeared for steps that wait on someone else.
 function migrate(stepStatus){const out={};for(const [k,v] of Object.entries(stepStatus&&typeof stepStatus==='object'?stepStatus:{})){if(!ID.test(k))continue;const s=v==='waiting'?'waiting_org':v;if(STATES.includes(s))out[k]=s}return out}
 function normEntry(e){const x=e&&typeof e==='object'?e:{};
  const history=(Array.isArray(x.history)?x.history:[]).filter(h=>h&&ID.test(String(h.step))&&STATES.includes(h.to)&&(h.from===undefined||STATES.includes(h.from))&&Number.isFinite(Number(h.at))).slice(-HISTORY).map(h=>({step:String(h.step),from:h.from||'not_started',to:h.to,at:Number(h.at),by:'you',...(Object.hasOwn(h,'fromNote')?{fromNote:String(h.fromNote||'').slice(0,200)}:{}),...(Object.hasOwn(h,'toNote')?{toNote:String(h.toNote||'').slice(0,200)}:{})}));
  const notes={};for(const [k,v] of Object.entries(x.notes&&typeof x.notes==='object'?x.notes:{}))if(ID.test(k)&&typeof v==='string'&&v.trim())notes[k]=v.trim().substring(0,200);
  return {...x,stepStatus:migrate(x.stepStatus),history,notes,deadlines:cleanDeadlines(x.deadlines)}}
 /* Deadline reminders (week 6): a date the person gives for a step, with whether they've confirmed it or aren't sure yet,
    and optionally where they saw it. Always the person's own record, never an official date. A reminder only ever
    goes into the person's own calendar, and only when they ask. */
 const DATE=/^\d{4}-\d{2}-\d{2}$/,realDate=d=>DATE.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
 function cleanDeadlines(x){const out={};for(const [k,v] of Object.entries(x&&typeof x==='object'?x:{})){if(!ID.test(k)||!v||!realDate(String(v.date)))continue;
  out[k]={date:v.date,certainty:v.certainty==='confirmed'?'confirmed':'unsure',...(typeof v.note==='string'&&v.note.trim()?{note:v.note.trim().slice(0,120)}:{}),...(typeof v.reminderId==='string'&&v.reminderId?{reminderId:v.reminderId.slice(0,80)}:{}),setAt:Number(v.setAt)||0}}return out}
 function setDeadline(entry,stepId,{date,certainty,note}={},at){const e=normEntry(entry);if(!ID.test(String(stepId))||!realDate(String(date)))return null;
  const sure=certainty==='confirmed'?'confirmed':'unsure',old=e.deadlines[stepId],keep=old&&old.date===date&&old.certainty===sure&&old.reminderId?{reminderId:old.reminderId}:{};
  return {...e,deadlines:{...e.deadlines,[stepId]:{date,certainty:certainty==='confirmed'?'confirmed':'unsure',...(typeof note==='string'&&note.trim()?{note:note.trim().slice(0,120)}:{}),...keep,setAt:Number(at)||0}}}}
 // The calendar reminder a change leaves behind (Ina's review, 29 Oct): a new date, a change of certainty or removing the
 // date means the old reminder no longer matches, so the caller removes that event. null when nothing is stale.
 function staleReminder(before,after,stepId){const a=normEntry(before).deadlines[stepId]?.reminderId,b=normEntry(after).deadlines[stepId]?.reminderId;return a&&a!==b?a:null}
 function clearDeadline(entry,stepId){const e=normEntry(entry);const d={...e.deadlines};delete d[stepId];return {...e,deadlines:d}}
 function withReminder(entry,stepId,reminderId){const e=normEntry(entry);if(!e.deadlines[stepId])return e;return {...e,deadlines:{...e.deadlines,[stepId]:{...e.deadlines[stepId],reminderId:String(reminderId).slice(0,80)}}}}
 const days=(a,b)=>Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/864e5);
 // Each step's deadline against the person's own today: done (step finished), overdue, soon (within 7 days) or later.
 function deadlines(entry,steps,today){const e=normEntry(entry);return steps.map((s,i)=>{const d=e.deadlines[s.id];if(!d)return null;const left=days(d.date,today),st=e.stepStatus[s.id]||'not_started';
  return {stepId:s.id,title:s.title,index:i,...d,daysLeft:left,when:finished(st)?'done':left<0?'overdue':left<=7?'soon':'later'}}).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date))}
 // A reminder for the person's own calendar: 3 days before at 09:00 (or tomorrow at 09:00 if that's already past), never
 // after the date. An unsure date is worded as a check, not a deadline. null when the date has passed.
 function reminderFor(d,stepTitle,today){if(!d||!realDate(d.date)||days(d.date,today)<0)return null;
  let date=new Date(Date.parse(d.date+'T00:00:00Z')-3*864e5).toISOString().slice(0,10);if(days(date,today)<1)date=days(d.date,today)>=1?new Date(Date.parse(today+'T00:00:00Z')+864e5).toISOString().slice(0,10):d.date;
  const t=String(stepTitle||'').slice(0,70);return {date,time:'09:00',title:(d.certainty==='confirmed'?'Deadline '+d.date+': ':'Check the date for: ')+t}}
 // Which states a step offers: "waiting for them" only where the step waits on someone else.
 function statesFor(step){return STATES.filter(s=>s!=='waiting_org'||!!(step&&(step.waitingFor||step.appointment)))}
 function stored(entry,stepId){return normEntry(entry).stepStatus[stepId]||'not_started'}
 // What the step shows: its stored state, or "ready" when nothing earlier is unfinished.
 function shown(entry,steps,i){const e=normEntry(entry),s=e.stepStatus[steps[i]?.id]||'not_started';if(s!=='not_started')return s;return blockers(e,steps,i).length?'not_started':'ready'}
 // Earlier unfinished steps (in order) block this one.
 function blockers(entry,steps,i){const e=normEntry(entry);return steps.slice(0,Math.max(0,i)).filter(x=>!finished(e.stepStatus[x.id]||'not_started')).map(x=>({id:x.id,title:x.title,state:e.stepStatus[x.id]||'not_started'}))}
 // The first step that isn't finished, with its index; null when every step is done or not applicable.
 function next(entry,steps){const e=normEntry(entry);const i=steps.findIndex(x=>!finished(e.stepStatus[x.id]||'not_started'));return i<0?null:{index:i,id:steps[i].id,title:steps[i].title,state:shown(e,steps,i)}}
 // Record a change; returns a new entry. A blocked note is kept only while the step is blocked.
 function change(entry,stepId,to,at,note){const e=normEntry(entry);if(!ID.test(String(stepId))||!STATES.includes(to))return e;const from=e.stepStatus[stepId]||'not_started';if(from===to&&to!=='blocked')return e;
  const stepStatus={...e.stepStatus};if(to==='not_started')delete stepStatus[stepId];else stepStatus[stepId]=to;
  const notes={...e.notes};if(to==='blocked'&&typeof note==='string'&&note.trim())notes[stepId]=note.trim().substring(0,200);else if(to!=='blocked')delete notes[stepId];
  return {...e,stepStatus,notes,history:[...e.history,{step:stepId,from,to,at:Number(at)||0,by:'you',...(from==='blocked'||to==='blocked'?{fromNote:e.notes[stepId]||'',toNote:notes[stepId]||''}:{})}].slice(-HISTORY)}}
 // Undo the last change, only if that step still has the state it was changed to. Returns {entry, undone} or null.
 function undo(entry){const e=normEntry(entry),last=e.history.at(-1);if(!last||(e.stepStatus[last.step]||'not_started')!==last.to)return null;
  if(Object.hasOwn(last,'toNote')&&(e.notes[last.step]||'')!==last.toNote)return null;
  const stepStatus={...e.stepStatus};if(last.from==='not_started')delete stepStatus[last.step];else stepStatus[last.step]=last.from;const notes={...e.notes};if(last.from==='blocked'&&Object.hasOwn(last,'fromNote')){if(last.fromNote)notes[last.step]=last.fromNote;else delete notes[last.step]}else if(last.from!=='blocked')delete notes[last.step];
  return {entry:{...e,stepStatus,notes,history:e.history.slice(0,-1)},undone:last}}
 function lastChange(entry,stepId){return normEntry(entry).history.filter(h=>h.step===stepId).at(-1)||null}
 /* Family overview (week 6, ORI-JOURNEY-009): every saved plan grouped by its label (Ina's batch 1 separate family plans;
    no label = the person's own). Each plan: steps done of total, the next step and its state, and what needs the person
    (waiting on me, blocked, not sure) or someone else (waiting for them). Read-only; shown only once separate plans exist,
    so one person's own plans look as before. Labels are the person's short words, never identities. */
 function family(journeys,today=''){
  const people=new Map();
  for(const [key,raw] of journeys||[]){if(!raw||typeof raw.title!=='string'||!['active','paused','saved'].includes(raw.status))continue;
   const e=normEntry(raw),label=typeof raw.label==='string'?raw.label.trim().slice(0,60):'';
   const steps=raw.titles&&typeof raw.titles==='object'?Object.entries(raw.titles).filter(([id])=>ID.test(id)).map(([id,title])=>({id,title:String(title)})):[];
   const total=steps.length||Math.max(0,Number(raw.steps)||0),states=steps.map(s=>e.stepStatus[s.id]||'not_started');
   const count=(...xs)=>states.filter(s=>xs.includes(s)).length;
   const plan={key,title:raw.title.slice(0,200),status:raw.status,done:count('done','not_applicable'),total,next:steps.length?next(e,steps):null,
    needsMe:count('waiting_you','blocked','unsure'),waitingOrg:count('waiting_org'),updated:String(raw.updated||''),
    deadline:today&&steps.length?deadlines(e,steps,today).find(d=>d.when!=='done')||null:null};
   if(!people.has(label))people.set(label,[]);people.get(label).push(plan)}
  const list=[...people.entries()].map(([label,plans])=>({label,own:!label,plans:plans.sort((a,b)=>b.updated.localeCompare(a.updated)),
   done:plans.reduce((n,p)=>n+p.done,0),total:plans.reduce((n,p)=>n+p.total,0),needsMe:plans.reduce((n,p)=>n+p.needsMe,0)}))
   .sort((a,b)=>Number(b.own)-Number(a.own)||a.label.localeCompare(b.label));
  return {show:list.some(p=>!p.own),people:list};
 }
 root.OriviaPlan={STATES,LABEL,MARK,migrate,normEntry,statesFor,stored,shown,blockers,next,change,undo,lastChange,finished,family,setDeadline,clearDeadline,withReminder,deadlines,reminderFor,staleReminder};
})(typeof window!=='undefined'?window:globalThis);
