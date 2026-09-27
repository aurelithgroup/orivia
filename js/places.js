/* =========================================================
   ORIVIA PLACES + APPOINTMENTS
   - A verified places list: each place has its source and the date it was checked,
     and says which journey stages use it.
   - "Take me there" opens directions in the phone's own maps app.
   - Appointments: the user adds the date, time and place from their email;
     Orivia shows it on the home screen and adds it to their calendar with reminders.
   Loaded before app.js; uses app.js globals at call time.
   ========================================================= */

Object.assign(UI.en, {
  takeMe:'Take me there', nearest:'Find the nearest', hours:'Hours', mapsNote:'Opens directions in your maps app.',
  apptAdd:'Got an appointment? Add it here', apptTitle:'Your appointment', apptDate:'Date', apptTime:'Time', apptWhere:'Where',
  apptWherePh:'Paste the place or address from your email', saveBtn2:'Save', change:'Change', remove:'Remove',
  addCal:'Add to calendar', calGoogle:'Google Calendar', calOther:'Apple or other calendar',
  calNote:'Your calendar will remind you the day before, and an hour before.', today:'Today', tomorrow:'Tomorrow',
  howWent:'How did it go?', itsDone:'It’s done', needHelpShort:'I need help', bringLine:'Bring', apptSoon:'Your next appointment',
  apptMissing:'Add the date and time first.', placesTitle:'Where to go',
});
Object.assign(UI.ar, {
  takeMe:'خذني إلى هناك', nearest:'ابحث عن الأقرب', hours:'ساعات العمل', mapsNote:'يفتح الاتجاهات في تطبيق الخرائط على هاتفك.',
  apptAdd:'لديك موعد؟ أضفه هنا', apptTitle:'موعدك', apptDate:'التاريخ', apptTime:'الوقت', apptWhere:'المكان',
  apptWherePh:'الصق اسم المكان أو العنوان من رسالتك', saveBtn2:'حفظ', change:'تغيير', remove:'حذف',
  addCal:'أضف إلى التقويم', calGoogle:'تقويم Google', calOther:'تقويم Apple أو غيره',
  calNote:'سيذكّرك التقويم قبل الموعد بيوم، وقبله بساعة.', today:'اليوم', tomorrow:'غداً',
  howWent:'كيف جرى الأمر؟', itsDone:'تم', needHelpShort:'أحتاج مساعدة', bringLine:'أحضر', apptSoon:'موعدك القادم',
  apptMissing:'أضف التاريخ والوقت أولاً.', placesTitle:'إلى أين تذهب',
});
window.EXTRA_ICONS = window.EXTRA_ICONS || {};
EXTRA_ICONS.pin = '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>';
EXTRA_ICONS.cal = '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>';
EXTRA_ICONS.phone = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>';

/* ---------- Verified places ---------- */
const PCHECK = {en:'27 Sep 2026', ar:'27 سبتمبر 2026'};
const PLACES = {
  'edi.rie.ed':{city:'edinburgh', name:{en:'Royal Infirmary of Edinburgh: Emergency Department', ar:'مستشفى Royal Infirmary في إدنبرة: قسم الطوارئ'},
    for:{en:'A&E for ages 16 and over, open 24 hours. Its minor injuries unit is open 8am–11pm.', ar:'الطوارئ لمن هم في سن 16 فما فوق، مفتوح 24 ساعة. ووحدة الإصابات البسيطة فيه مفتوحة من 8 صباحاً حتى 11 مساءً.'},
    address:'51 Little France Crescent, Old Dalkeith Road, Edinburgh EH16 4SA', phone:'0131 536 1000',
    source:'https://services.nhslothian.scot/rightcare/emergency-department-royal-infirmary/'},
  'edi.wgh.miu':{city:'edinburgh', name:{en:'Western General Hospital: Minor Injuries Unit', ar:'مستشفى Western General: وحدة الإصابات البسيطة'},
    for:{en:'Minor injuries, 8am–8:30pm. Call 111 first to be booked in.', ar:'الإصابات البسيطة، من 8 صباحاً حتى 8:30 مساءً. اتصل بالرقم 111 أولاً لحجز موعد.'},
    address:'Crewe Road South, Edinburgh EH4 2XU', source:'https://services.nhslothian.scot/rightcare/minor-injuries-unit/'},
  'edi.rhcyp':{city:'edinburgh', name:{en:'Royal Hospital for Children and Young People', ar:'مستشفى الأطفال والشباب الملكي'},
    for:{en:'Emergency department for children under 16, open 24 hours.', ar:'قسم طوارئ للأطفال دون 16 عاماً، مفتوح 24 ساعة.'},
    address:'50 Little France Crescent, Edinburgh EH16 4TJ', phone:'0131 536 1000', source:'https://children.nhslothian.scot/the-rhcyp/'},
  'edi.access':{city:'edinburgh', name:{en:'The Access Place', ar:'The Access Place'},
    for:{en:'An NHS practice for people with no fixed address. Mon–Fri 9am–1pm and 2pm–5pm (Tuesdays from 10am).', ar:'عيادة تابعة لـ NHS لمن ليس لديهم عنوان ثابت. من الاثنين إلى الجمعة 9 صباحاً حتى 1 ظهراً و2 حتى 5 مساءً (الثلاثاء من 10 صباحاً).'},
    address:'6 South Gray’s Close, Edinburgh EH1 1NA', phone:'0131 529 5015', source:'https://www.edinburghaccesspractice.scot.nhs.uk/'},
  'edi.library':{city:'edinburgh', name:{en:'Central Library', ar:'المكتبة المركزية'},
    for:{en:'Mon–Wed 10am–8pm, Thu–Sat 10am–5pm.', ar:'من الاثنين إلى الأربعاء 10 صباحاً حتى 8 مساءً، ومن الخميس إلى السبت 10 صباحاً حتى 5 مساءً.'},
    address:'George IV Bridge, Edinburgh EH1 1EG', phone:'0131 242 8020', source:'https://www.edinburgh.gov.uk/directory-record/1812901/central-lending-library'},
  'edi.volunteer':{city:'edinburgh', name:{en:'Volunteer Edinburgh', ar:'Volunteer Edinburgh'},
    for:{en:'Mon–Thu 9:30am–1pm and 2pm–5pm, Fri until 4pm.', ar:'من الاثنين إلى الخميس 9:30 صباحاً حتى 1 ظهراً و2 حتى 5 مساءً، والجمعة حتى 4 مساءً.'},
    address:'222 Leith Walk, Edinburgh EH6 5EQ', phone:'0131 225 0630', source:'https://www.volunteeredinburgh.org.uk/contact-us/'},
  'edi.hub.waverley':{city:'edinburgh', name:{en:'Lothian TravelHub, Waverley Bridge', ar:'مكتب Lothian TravelHub في Waverley Bridge'},
    for:{en:'Ridacards and ticket questions. Mon–Sat 8:30am–5:30pm.', ar:'بطاقات Ridacard وأسئلة التذاكر. من الاثنين إلى السبت 8:30 صباحاً حتى 5:30 مساءً.'},
    address:'31 Waverley Bridge, Edinburgh EH1 1BQ', source:'https://www.lothianbuses.com/travelhub/'},
  'edi.hub.shandwick':{city:'edinburgh', name:{en:'Lothian TravelHub, Shandwick Place', ar:'مكتب Lothian TravelHub في Shandwick Place'},
    for:{en:'Ridacards and ticket questions. Mon–Fri 9am–5:30pm.', ar:'بطاقات Ridacard وأسئلة التذاكر. من الاثنين إلى الجمعة 9 صباحاً حتى 5:30 مساءً.'},
    address:'49 Shandwick Place, Edinburgh EH2 4SD', source:'https://www.lothianbuses.com/travelhub/'},
  'edi.waverleybridge':{city:'edinburgh', name:{en:'Waverley Bridge (Airlink 100 city stop)', ar:'Waverley Bridge (محطة Airlink 100 في المدينة)'},
    for:{en:'Where the Airlink 100 starts and ends in the city centre, next to Waverley station.', ar:'حيث تبدأ حافلة Airlink 100 وتنتهي في وسط المدينة، بجانب محطة Waverley.'},
    address:'Waverley Bridge, Edinburgh EH1 1BQ', source:'https://www.lothianbuses.com/our-services/airport-buses/'},
  'dxb.metro.t1':{city:'dubai', name:{en:'Airport Terminal 1 Metro station (Red Line)', ar:'محطة مترو مبنى المطار 1 (الخط الأحمر)'},
    for:{en:'The Metro station inside Terminal 1.', ar:'محطة المترو داخل المبنى 1.'},
    address:'Airport Terminal 1 Metro Station, Dubai', source:'https://www.rta.ae/wps/portal/rta/ae/public-transport/metro-stations-map'},
  'dxb.metro.t3':{city:'dubai', name:{en:'Airport Terminal 3 Metro station (Red Line)', ar:'محطة مترو مبنى المطار 3 (الخط الأحمر)'},
    for:{en:'The Metro station inside Terminal 3.', ar:'محطة المترو داخل المبنى 3.'},
    address:'Airport Terminal 3 Metro Station, Dubai', source:'https://www.rta.ae/wps/portal/rta/ae/public-transport/metro-stations-map'},
  'dxb.rashid':{city:'dubai', name:{en:'Rashid Hospital: Emergency and Trauma Centre', ar:'مستشفى راشد: مركز الطوارئ والإصابات'},
    for:{en:'A major public emergency department, open 24 hours.', ar:'قسم طوارئ حكومي رئيسي، مفتوح على مدار 24 ساعة.'},
    address:'Rashid Hospital, Umm Hurair 2, Oud Metha, Dubai', phone:'800342', source:'https://www.dha.gov.ae/uploads/062022/2eaca16b-dec5-4f19-b8bc-53b026f02fcf.pdf'},
};
/* Which places and "find the nearest" searches appear on which stages */
const NEARBY = {
  pharmacy:{en:'pharmacy', ar:'صيدلية', q:'pharmacy'},
  metro:{en:'Metro station', ar:'محطة مترو', q:'metro station'},
  er:{en:'hospital emergency department', ar:'قسم طوارئ في مستشفى', q:'hospital emergency'},
  bank:{en:'bank branch', ar:'فرع بنك', q:'bank'},
};
(function(){
  const J = DATA.journeys;
  const put = (jid, sid, places, nearby) => { const s = J[jid] && J[jid].stages.find(x=>x.id===sid); if(s){ s.places = places||[]; s.nearby = nearby||[]; } };
  put('dubai.airport','metro',['dxb.metro.t1','dxb.metro.t3']);
  put('dubai.nol','find',[],['metro']);
  put('dubai.health.student','emergency',['dxb.rashid'],['er']);
  put('dubai.health.student','pharmacy',[],['pharmacy']);
  put('edinburgh.airport','bus',['edi.waverleybridge']);
  put('edinburgh.bus','pay',['edi.hub.waverley','edi.hub.shandwick']);
  put('edinburgh.gp','where',['edi.rie.ed','edi.wgh.miu','edi.rhcyp'],['pharmacy']);
  put('edinburgh.gp','register',['edi.access']);
  put('edinburgh.community','library',['edi.library']);
  put('edinburgh.community','volunteer',['edi.volunteer']);
  put('edinburgh.bank','open',[],['bank']);
  put('dubai.bank','open',[],['bank']);
  /* Stages where people get an appointment */
  [['dubai.eid.student','medical'],['dubai.eid.student','biometrics'],['dubai.eid.student','card'],['dubai.health.student','visit'],['edinburgh.gp','register']]
    .forEach(([jid,sid]) => { const s = J[jid] && J[jid].stages.find(x=>x.id===sid); if(s) s.appt = true; });
})();

/* ---------- Maps ---------- */
const isApple = () => /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent);
const dirUrl = q => isApple() ? `https://maps.apple.com/?daddr=${encodeURIComponent(q)}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
const searchUrl = q => isApple() ? `https://maps.apple.com/?q=${encodeURIComponent(q)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
function placeCard(id){
  const p = PLACES[id]; if(!p) return '';
  return `<div class="place">
    <div class="place-head">${svg('pin','place-ico')}<strong>${L(p.name)}</strong></div>
    <p>${L(p.for)}</p>
    <span class="place-addr" dir="ltr">${p.address}</span>
    <div class="place-actions">
      <a class="btn btn-primary" href="${dirUrl(p.name.en + ', ' + p.address)}" target="_blank" rel="noopener" data-place="${id}">${svg('pin','btn-ico')}<span>${t('takeMe')}</span></a>
      ${p.phone ? `<a class="btn btn-quiet" href="tel:${p.phone.replace(/\s/g,'')}" dir="ltr">${svg('phone','btn-ico')}<span>${p.phone}</span></a>` : ''}
    </div>
    <span class="place-src"><a href="${p.source}" target="_blank" rel="noopener">${t('source')}</a> · ${t('checked')}: ${L(PCHECK)}</span>
  </div>`;
}
function placesBox(s){
  if(!(s.places && s.places.length) && !(s.nearby && s.nearby.length)) return '';
  return `<div class="places"><span class="label">${t('placesTitle')}</span>
    ${(s.places||[]).map(placeCard).join('')}
    ${(s.nearby||[]).map(k => { const n = NEARBY[k]; return `<a class="choice near" href="${searchUrl(n.q)}" target="_blank" rel="noopener"><span class="main"><span>${t('nearest')}: ${L(n)}</span><small>${t('mapsNote')}</small></span>${svg('pin','chev')}</a>`; }).join('')}
  </div>`;
}

/* ---------- Appointments ---------- */
function apptOf(jid, sid){ return ((S.appts||{})[jid]||{})[sid] || null; }
function apptDate(a){ return a && a.date ? new Date(`${a.date}T${a.time||'09:00'}`) : null; }
function fmtWhen(a){
  const d = apptDate(a); if(!d) return '';
  const day0 = new Date(); day0.setHours(0,0,0,0);
  const diff = Math.round((new Date(d).setHours(0,0,0,0) - day0) / 864e5);
  const loc = ({fil:'fil-PH', ur:'ur-PK', hi:'hi-IN', ar:'ar-AE', fr:'fr-FR'})[lang()] || 'en-GB';
  let day; try{ day = diff===0 ? t('today') : diff===1 ? t('tomorrow') : d.toLocaleDateString(loc, {weekday:'short', day:'numeric', month:'short'}); }catch(e){ day = a.date; }
  let tm; try{ tm = d.toLocaleTimeString(loc, {hour:'2-digit', minute:'2-digit'}); }catch(e){ tm = a.time; }
  return `${day} · ${tm}`;
}
function apptBox(jid, s){
  if(!s.appt) return '';
  const a = apptOf(jid, s.id), editing = S.params.editAppt === s.id;
  if(!a || editing){
    if(!editing) return `<button class="choice appt-add" data-act="apptEdit" data-v="${s.id}">${svg('cal','place-ico')}<span>${t('apptAdd')}</span>${chev()}</button>`;
    return `<div class="appt-form"><span class="label">${t('apptTitle')}</span>
      <label class="field-label" for="apDate">${t('apptDate')}</label><input id="apDate" class="field" type="date" value="${a&&a.date||''}">
      <label class="field-label" for="apTime">${t('apptTime')}</label><input id="apTime" class="field" type="time" value="${a&&a.time||''}">
      <label class="field-label" for="apWhere">${t('apptWhere')}</label><input id="apWhere" class="field" type="text" dir="auto" autocomplete="off" placeholder="${t('apptWherePh')}" value="${(a&&a.where||'').replace(/"/g,'&quot;')}">
      <div class="place-actions"><button class="btn btn-primary" data-act="apptSave" data-v="${s.id}">${t('saveBtn2')}</button>${a?`<button class="linkish" data-act="apptDel" data-v="${s.id}">${t('remove')}</button>`:''}</div></div>`;
  }
  return `<div class="appt">
    <span class="label">${t('apptTitle')}</span>
    <div class="appt-when">${svg('cal','place-ico')}<strong>${fmtWhen(a)}</strong></div>
    ${a.where ? `<span class="place-addr" dir="auto">${esc(a.where)}</span>` : ''}
    <div class="place-actions">
      ${a.where ? `<a class="btn btn-primary" href="${dirUrl(a.where)}" target="_blank" rel="noopener">${svg('pin','btn-ico')}<span>${t('takeMe')}</span></a>` : ''}
      <button class="btn btn-quiet" data-act="calSheet" data-v="${jid}|${s.id}">${svg('cal','btn-ico')}<span>${t('addCal')}</span></button>
    </div>
    <button class="linkish" data-act="apptEdit" data-v="${s.id}">${t('change')}</button>
  </div>`;
}
const esc = x => String(x).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function stageLink(jid, sid){ return `${location.origin}${location.pathname}?j=${encodeURIComponent(jid)}&s=${encodeURIComponent(sid)}`; }
function calDetails(jid, sid){
  const s = DATA.journeys[jid].stages.find(x=>x.id===sid);
  const bring = (s.need||[]).map(x=>'- '+L(x.v)).join('\n');
  return (bring ? `${t('bringLine')}:\n${bring}\n\n` : '') + `Orivia: ${stageLink(jid, sid)}`;
}
function icsFor(jid, sid){
  const a = apptOf(jid, sid), s = DATA.journeys[jid].stages.find(x=>x.id===sid), d = apptDate(a);
  const z = x => x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const e = x => String(x).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Orivia//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    `UID:${jid}-${sid}-${d.getTime()}@orivia`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(d)}`, `DTEND:${z(new Date(d.getTime()+36e5))}`,
    `SUMMARY:${e(L(s.title))}`, a.where ? `LOCATION:${e(a.where)}` : '', `DESCRIPTION:${e(calDetails(jid, sid))}`,
    'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY',`DESCRIPTION:${e(L(s.title))}`,'END:VALARM',
    'BEGIN:VALARM','TRIGGER:-PT1H','ACTION:DISPLAY',`DESCRIPTION:${e(L(s.title))}`,'END:VALARM',
    'END:VEVENT','END:VCALENDAR'].filter(Boolean);
  return lines.join('\r\n');
}
function gcalUrl(jid, sid){
  const a = apptOf(jid, sid), s = DATA.journeys[jid].stages.find(x=>x.id===sid), d = apptDate(a);
  const z = x => x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(L(s.title))}&dates=${z(d)}/${z(new Date(d.getTime()+36e5))}&details=${encodeURIComponent(calDetails(jid, sid))}&location=${encodeURIComponent(a.where||'')}`;
}
function calSheet(jid, sid){
  sheet(`<h2>${t('addCal')}</h2><p class="lead">${t('calNote')}</p>
    <div class="choices">
      <button class="choice" data-act="icsGet" data-v="${jid}|${sid}"><span>${t('calOther')}</span>${chev()}</button>
      <a class="choice" href="${gcalUrl(jid, sid)}" target="_blank" rel="noopener"><span>${t('calGoogle')}</span>${chev()}</a>
    </div>
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
}
function icsGet(jid, sid){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([icsFor(jid, sid)], {type:'text/calendar'}));
  a.download = 'orivia-appointment.ics'; document.body.appendChild(a); a.click(); a.remove();
}
/* The next appointment across all journeys in this city (for the home screen) */
function nextAppt(){
  const now = Date.now() - 6*36e5; let best = null;
  Object.entries(S.appts||{}).forEach(([jid, m]) => { const j = DATA.journeys[jid]; if(!j || j.city !== S.city) return;
    Object.entries(m).forEach(([sid, a]) => { const d = apptDate(a); if(!d || (S.done[jid]||{})[sid]) return;
      if(!best || d < best.d) best = {jid, sid, a, d}; }); });
  return best;
}
function hubApptCard(){
  const n = nextAppt(); if(!n) return '';
  const j = DATA.journeys[n.jid], s = j.stages.find(x=>x.id===n.sid);
  const past = n.d.getTime() < Date.now();
  const need = s.need||[], ticks = S.checks[n.jid]||{}, ready = need.filter(x=>ticks[x.id]).length;
  return `<div class="appt hub-appt ${past?'past':''}">
    <span class="label">${past ? t('howWent') : t('apptSoon')}</span>
    <div class="appt-when">${svg('cal','place-ico')}<strong>${fmtWhen(n.a)}</strong></div>
    <span>${L(s.title)}</span>
    ${!past && need.length ? `<span class="muted">${t('bringLine')}: ${need.map(x=>L(x.v)).join(', ')} · ${t('readyN')(ready, need.length)}</span>` : ''}
    <div class="place-actions">
      ${past ? `<button class="btn btn-primary" data-act="apptDone" data-v="${n.jid}|${n.sid}">${t('itsDone')}</button><button class="btn btn-quiet" data-act="hubHelp" data-v="${n.jid}">${t('needHelpShort')}</button>`
        : `${n.a.where ? `<a class="btn btn-primary" href="${dirUrl(n.a.where)}" target="_blank" rel="noopener">${svg('pin','btn-ico')}<span>${t('takeMe')}</span></a>` : ''}<button class="btn btn-quiet" data-act="calSheet" data-v="${n.jid}|${n.sid}">${svg('cal','btn-ico')}<span>${t('addCal')}</span></button>`}
    </div></div>`;
}
/* Handlers for this file's buttons */
function placesAct(act, v){
  switch(act){
    case 'apptEdit': S.params = Object.assign({}, S.params, {editAppt:v}); render(); scrollToSel('.appt-form'); return true;
    case 'apptSave': {
      const date = document.getElementById('apDate').value, time = document.getElementById('apTime').value, where = document.getElementById('apWhere').value.trim();
      if(!date || !time){ toast(t('apptMissing')); return true; }
      const jid = S.params.id; S.appts = S.appts || {}; S.appts[jid] = S.appts[jid] || {}; S.appts[jid][v] = {date, time, where};
      delete S.params.editAppt; logEv('appt_saved'); save(); render(); scrollToSel('.appt'); return true; }
    case 'apptDel': { const jid = S.params.id; if(S.appts && S.appts[jid]) delete S.appts[jid][v]; delete S.params.editAppt; save(); render(); return true; }
    case 'calSheet': { const [jid, sid] = v.split('|'); calSheet(jid, sid); logEv('calendar_open'); return true; }
    case 'icsGet': { const [jid, sid] = v.split('|'); icsGet(jid, sid); closeSheet(); return true; }
    case 'apptDone': { const [jid, sid] = v.split('|'); S.done[jid] = S.done[jid] || {}; S.done[jid][sid] = true; logEv('stage_done', {j:jid, stage:sid, detail:'from_appt'}); save(); render(); toast(t('wellDone')); return true; }
  }
  return false;
}
function scrollToSel(sel){ const el = document.querySelector('.device ' + sel); if(el) el.scrollIntoView({block:'center'}); }
