export default String.raw`'use strict';
(function(){
 const $=id=>document.getElementById(id);
 const key='orivia-private-events-v1';
 function eventDraft(e){
  const fmt=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const a=new Date(e.at),b=new Date(a.getTime()+1800000);
  return 'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:e.title,dates:fmt(a)+'/'+fmt(b),details:'Review and save your Orivia reminder.'});
 }
 // Basic mode only (the research assistant sets reminders itself): a short title without the request wording, and the
 // date and time the message names (tomorrow, today, next week, in N days, at 5pm), so the person checks rather than types.
 function reminderTitle(m){
  let t=String(m||'').trim();
  const lead=/^(hey|hi|hello|ok(ay)?|so|and|also|please|pls|can you|could you|would you|will you|can u|could u|i('d| would) like (you )?to|i want (you )?to)\b[\s,]*/i;
  for(let i=0;i<6&&lead.test(t);i++)t=t.replace(lead,'');
  t=t.replace(/^(please )?(set|make|create|add|put)( me)?( up)?( a| an)?( quick)? (reminder|alarm|note)( for me)?( to| for| that| about)?[\s,]*/i,'')
   .replace(/^remind me( to| about| that)?[\s,]*/i,'').replace(/^(please\s*)?(i('d| would) like to|i need to|i have to|i must|i want to)\s+/i,'')
   .replace(/\b(tomorrow( morning| afternoon| evening| night)?|today|tonight|this (morning|afternoon|evening)|next week|in \d{1,2} (days?|hours?)|at \d{1,2}([:.]\d{2})?\s*(am|pm)?|on (mon|tues|wednes|thurs|fri|satur|sun)day)\b/gi,'')
   .replace(/\b(please|pls|thanks|thank you)\b/gi,'').replace(/[?!.]+$/,'').replace(/\s{2,}/g,' ').trim();
  return (t.charAt(0).toUpperCase()+t.slice(1)).slice(0,100);
 }
 function reminderWhen(m){
  const s=String(m||'').toLowerCase(),d=new Date();let set=false;
  if(/\btomorrow\b/.test(s)){d.setDate(d.getDate()+1);set=true}
  else if(/\bnext week\b/.test(s)){d.setDate(d.getDate()+7);set=true}
  else{const n=s.match(/\bin (\d{1,2}) days?\b/);if(n){d.setDate(d.getDate()+Number(n[1]));set=true}}
  let h=9,min=0;const at=s.match(/\bat (\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/);
  if(at){h=Number(at[1])%24;min=Number(at[2]||0);if(at[3]==='pm'&&h<12)h+=12;if(at[3]==='am'&&h===12)h=0;set=true}
  else if(/\b(tonight|this evening)\b/.test(s)){h=19;set=true}else if(/\bthis afternoon\b/.test(s)){h=15;set=true}else if(/\btoday\b/.test(s)&&!set){h=Math.min(21,d.getHours()+2);set=true}
  if(!set)return '';
  d.setHours(h,min,0,0);if(d.getTime()<Date.now()+60000)return '';
  const p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());
 }
 function propose(message){
  $('inline-calendar')?.remove();
  const card=document.createElement('section');card.id='inline-calendar';card.className='event';
  const h=document.createElement('strong');h.textContent='✦ Shall I add this to your calendar?';card.append(h);
  const p=document.createElement('p');p.className='tiny';p.textContent='Please confirm the details first. No event has been saved.';card.append(p);
  const form=document.createElement('form');
  const title=document.createElement('input');title.required=true;title.maxLength=100;title.value=reminderTitle(message);title.placeholder='Reminder title';
  const when=document.createElement('input');when.type='datetime-local';when.required=true;when.value=reminderWhen(message);
  const save=document.createElement('button');save.type='submit';save.textContent='Save to Orivia calendar';
  const status=document.createElement('p');status.className='tiny';status.setAttribute('role','status');
  for(const el of [title,when]){el.style.cssText='padding:12px;min-width:0;width:100%;box-sizing:border-box;font:16px system-ui;border:1px solid #b8c5d0;border-radius:9px';form.append(el)}
  form.append(save,status);card.append(form);$('history').after(card);
  form.onsubmit=e=>{
   e.preventDefault();const date=new Date(when.value);if(!when.value||!Number.isFinite(date.getTime())||date.getTime()<Date.now()+60000||date.getTime()>Date.now()+366*86400000){status.textContent='Choose a future date within one year.';return}
   let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))items=[]}catch(_){}
   const item={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),title:title.value.trim().slice(0,100),at:date.toISOString(),alarm:30};
   if(!item.title)return;
   try{localStorage.setItem(key,JSON.stringify([...items.slice(-99),item]))}catch(_){status.textContent='Could not save on this device.';return}
   status.textContent='Saved in Orivia on this device. For a phone alert, add it to your calendar app and confirm there.';save.disabled=true;
   const d=document.createElement('a');d.href='/reminder.ics?'+new URLSearchParams({title:item.title,when:item.at,alarm:'30'});d.textContent='Add to phone calendar';d.style.cssText='display:inline-block;background:#F2B90F;color:#1C2733;border-radius:999px;padding:8px 14px;font-weight:700;text-decoration:none;justify-self:start';form.append(d);
   d.addEventListener('click',()=>{status.textContent='Your calendar app should ask you to add it. It’s only in your phone calendar after you tap Add or Save there.'});
   const a=document.createElement('a');a.href=eventDraft(item);a.target='_blank';a.rel='noopener noreferrer';a.textContent='Or use Google Calendar ↗';form.append(a);
   if(window.oriviaGo){const v=document.createElement('button');v.type='button';v.textContent='View in My calendar';v.style.cssText='background:none;border:0;padding:4px 0;color:inherit;text-decoration:underline;font-weight:700;text-align:left';v.onclick=()=>window.oriviaGo('calendar');form.append(v)}
  }
 }
 $('form')?.addEventListener('submit',()=>{
  $('inline-calendar')?.remove();
  if(typeof window.oriviaResearchEnabled==='function'?window.oriviaResearchEnabled():window.oriviaResearchMode)return;
  const msg=$('msg')?.value?.trim()||'';
  if(/\b(change|move|reschedule|cancel|delete|remove|update|instead)\b/i.test(msg))return;
  if(/\b(remind me|reminder|set an? alarm|put .{1,50} on my calendar)\b/i.test(msg))propose(msg);
 },true);
 $('clear')?.addEventListener('click',()=>$('inline-calendar')?.remove());
})();
`;
