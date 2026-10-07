/* =========================================================
   ANONYMOUS ANALYTICS (GoatCounter: no cookies, no personal data)
   Only event names and IDs are sent, e.g.
     ev/help_open/phone/dubai/dubai.eid.student/biometrics
   Never: names, anything typed, finder answers, appointment details, phone numbers.
   Turn it on by setting GC_CODE to the GoatCounter site code.
   People can switch it off on the home screen.
   ========================================================= */
const GC_CODE = 'orivia';   // e.g. 'orivia' for https://orivia.goatcounter.com
const GC_SEND = new Set(['journey_open','stage_open','stage_done','journey_complete','help_open','problem','still_stuck','solved',
  'link_open','call','appt_saved','calendar_open','ask_open','ask_pick','ask_none','deeplink','lang','tick','docs_open','doc_saved','doc_calendar','before_open','changed_open','recover','wait_longer','identify_open','identify_word','dk_open','dk_result','term','sources_open','tab','help_center','help_pick','notsure_open','notsure_pick','staff_card']);

Object.assign(UI.en, {
  statsNote:'Orivia counts anonymous taps, like which step people ask for help on, so it can get better. Never your name or anything you type.',
  statsOff:'Turn off', statsOn:'Turn on', statsIsOff:'Anonymous counts are off on this phone.',
});
Object.assign(UI.ar, {
  statsNote:'تحصي أوريفيا نقرات مجهولة الهوية، مثل الخطوة التي يطلب فيها الناس المساعدة، لكي تتحسن. لا تُرسل اسمك أبداً ولا أي شيء تكتبه.',
  statsOff:'إيقاف', statsOn:'تشغيل', statsIsOff:'الإحصاءات المجهولة متوقفة على هذا الهاتف.',
});

let gcQueue = [];
function statsAllowed(){
  return !!GC_CODE && S.analytics !== false && /(^|\.)github\.io$/.test(location.hostname);
}
function loadGC(){
  if(!statsAllowed() || window.__gcLoading) return;
  window.__gcLoading = true;
  const s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${GC_CODE}.goatcounter.com/count`;
  s.onload = () => { const q = gcQueue; gcQueue = []; q.forEach(f => f()); };
  document.head.appendChild(s);
}
function channel(){
  if(S.testMode) return 'test';
  return matchMedia('(min-width: 900px)').matches ? 'desk' : 'phone';
}
function sendEv(r){
  if(typeof partnerCount === "function") partnerCount(r);
  if(!statsAllowed() || !GC_SEND.has(r.ev)) return;
  const clean = x => String(x||'').replace(/[^a-z0-9._-]/gi,'').slice(0,60);
  let extra = r.p;
  if(r.ev === 'link_open' || r.ev === 'call'){ try{ extra = r.ev === 'call' ? 'tel' : new URL(r.detail, location.href).hostname; }catch(e){ extra = ''; } }
  if(r.ev === 'ask_pick') extra = String(r.detail||'').split('|')[0];
  if(['lang','doc_saved','doc_calendar','recover','identify_word','dk_result','dk_open','term','tab','help_center','help_pick','notsure_pick'].includes(r.ev)) extra = r.detail;
  if(r.ev === 'deeplink') extra = S.partner || 'none';
  if(r.ev === 'tick') extra = String(r.detail||'').split(':')[0];
  const path = ['ev', r.ev, channel(), r.city, r.j, r.stage, extra].map(clean).filter(Boolean).join('/');
  const go = () => { try{ window.goatcounter.count({path, title:r.ev, event:true}); }catch(e){} };
  if(window.goatcounter && window.goatcounter.count) go(); else { gcQueue.push(go); loadGC(); }
}
function statsNoteHtml(){
  if(!GC_CODE) return '';
  return S.analytics === false
    ? `<p class="stats-note">${t('statsIsOff')} <button class="linkish" data-act="statsToggle">${t('statsOn')}</button></p>`
    : `<p class="stats-note">${t('statsNote')} <button class="linkish" data-act="statsToggle">${t('statsOff')}</button></p>`;
}
