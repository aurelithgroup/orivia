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
  return {...x,stepStatus:migrate(x.stepStatus),history,notes}}
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
 root.OriviaPlan={STATES,LABEL,MARK,migrate,normEntry,statesFor,stored,shown,blockers,next,change,undo,lastChange,finished};
})(typeof window!=='undefined'?window:globalThis);
