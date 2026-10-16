export default String.raw`'use strict';
(function(){
 const $=id=>document.getElementById(id);
 const key='orivia-private-events-v1';
 function eventDraft(e){
  const fmt=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const a=new Date(e.at),b=new Date(a.getTime()+1800000);
  return 'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:e.title,dates:fmt(a)+'/'+fmt(b),details:'Review and save your Orivia reminder.'});
 }
 function propose(message){
  $('inline-calendar')?.remove();
  const card=document.createElement('section');card.id='inline-calendar';card.className='event';
  const h=document.createElement('strong');h.textContent='✦ Shall I add this to your calendar?';card.append(h);
  const p=document.createElement('p');p.className='tiny';p.textContent='Please confirm the details first. No event has been saved.';card.append(p);
  const form=document.createElement('form');
  const title=document.createElement('input');title.required=true;title.maxLength=100;title.value=message.replace(/^(please )?(remind me to|set (a )?reminder to) /i,'').slice(0,100);title.placeholder='Reminder title';
  const when=document.createElement('input');when.type='datetime-local';when.required=true;
  const save=document.createElement('button');save.type='submit';save.textContent='Save to Orivia calendar';
  const status=document.createElement('p');status.className='tiny';status.setAttribute('role','status');
  for(const el of [title,when]){el.style.cssText='padding:12px;min-width:0;width:100%;box-sizing:border-box;font:16px system-ui;border:1px solid #b8c5d0;border-radius:9px';form.append(el)}
  form.append(save,status);card.append(form);$('history').after(card);
  form.onsubmit=e=>{
   e.preventDefault();const date=new Date(when.value);if(!when.value||!Number.isFinite(date.getTime())||date.getTime()<Date.now()+60000||date.getTime()>Date.now()+366*86400000){status.textContent='Choose a future date within one year.';return}
   let items=[];try{items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))items=[]}catch(_){}
   const item={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),title:title.value.trim().slice(0,100),at:date.toISOString()};
   if(!item.title)return;
   try{localStorage.setItem(key,JSON.stringify([...items.slice(-99),item]))}catch(_){status.textContent='Could not save on this device.';return}
   status.textContent='Saved to Orivia on this device. Google Calendar still needs your approval.';save.disabled=true;
   const a=document.createElement('a');a.href=eventDraft(item);a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open in Google Calendar ↗';form.append(a);
   if(window.oriviaGo){const v=document.createElement('button');v.type='button';v.textContent='View in My calendar';v.style.cssText='background:none;border:0;padding:4px 0;color:inherit;text-decoration:underline;font-weight:700;text-align:left';v.onclick=()=>window.oriviaGo('calendar');form.append(v)}
  }
 }
 $('form')?.addEventListener('submit',()=>{
  const msg=$('msg')?.value?.trim()||'';
  if(/\b(remind me|reminder|set an? alarm|put .{1,50} on my calendar)\b/i.test(msg))propose(msg);
 },true);
 $('clear')?.addEventListener('click',()=>$('inline-calendar')?.remove());
})();
`;
