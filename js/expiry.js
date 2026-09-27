/* =========================================================
   DOCUMENT EXPIRY REMINDERS
   The user adds the expiry date of a document (passport, visa, Emirates ID, share code...).
   Orivia counts down on the home screen and adds calendar reminders
   30 days and 7 days before. Dates stay on the phone and are never sent anywhere.
   Loaded before app.js; uses app.js globals at call time.
   ========================================================= */
Object.assign(UI.en, {
  docsTitle:'Your document dates', docsSub:'Orivia counts down and reminds you before anything runs out. Dates stay on this phone.',
  docsAdd:'Add a document date', docsPick:'Which document?', docsExpires:'Expiry date', docsMade:'Date you made it',
  docsLeft:n=>n===1?'1 day left':`${n} days left`, docsToday:'Expires today', docsGone:n=>n===1?'Expired yesterday':`Expired ${n} days ago`,
  docsCal:'Add reminders to calendar', docsCalNote:'Reminders 30 days and 7 days before.', docsWhat:'What to do', docsNone:'No dates added yet.',
  docsTrack:'Track document expiry dates', docsTrackNote:'Get reminded before your passport or visa runs out',
  docsShare90:'Share codes last 90 days, so Orivia works out the expiry date for you.',
  docsExpiresOn:'Expires on',
});
Object.assign(UI.ar, {
  docsTitle:'تواريخ مستنداتك', docsSub:'تعدّ أوريفيا الأيام وتذكّرك قبل انتهاء أي مستند. تبقى التواريخ على هذا الهاتف.',
  docsAdd:'أضف تاريخ مستند', docsPick:'أي مستند؟', docsExpires:'تاريخ الانتهاء', docsMade:'تاريخ إنشائه',
  docsLeft:n=>n===1?'بقي يوم واحد':`بقي ${n} يوماً`, docsToday:'ينتهي اليوم', docsGone:n=>n===1?'انتهى أمس':`انتهى منذ ${n} يوماً`,
  docsCal:'أضف التذكيرات إلى التقويم', docsCalNote:'تذكيرات قبل 30 يوماً وقبل 7 أيام.', docsWhat:'ماذا تفعل', docsNone:'لم تُضف أي تواريخ بعد.',
  docsTrack:'تتبّع تواريخ انتهاء المستندات', docsTrackNote:'احصل على تذكير قبل انتهاء جواز سفرك أو تأشيرتك',
  docsShare90:'رموز المشاركة صالحة لمدة 90 يوماً، لذا تحسب أوريفيا تاريخ الانتهاء عنك.',
  docsExpiresOn:'ينتهي في',
});

/* Document types per city. `warn` = days before expiry when it turns amber. `what` = checked guidance. */
const DOC_TYPES = {
  passport:{cities:['dubai','edinburgh'], warn:180, name:{en:'Passport', ar:'جواز السفر'},
    what:{en:'Renew it through your country’s embassy or consulate. Many visa steps need a passport with at least 6 months left, so start early.', ar:'جدّده عبر سفارة بلدك أو قنصليته. تحتاج خطوات تأشيرة كثيرة إلى جواز صالح لستة أشهر على الأقل، فابدأ مبكراً.'}},
  permit:{cities:['dubai'], warn:14, name:{en:'Entry permit', ar:'تصريح الدخول'},
    what:{en:'You must arrive in the UAE before your entry permit runs out. If your travel is delayed, tell whoever applied for it straight away.', ar:'يجب أن تصل إلى الإمارات قبل انتهاء تصريح الدخول. إذا تأخّر سفرك، أبلغ الجهة التي تقدّمت به فوراً.'}, journey:'dubai.eid.student'},
  residence:{cities:['dubai'], warn:60, name:{en:'UAE residence visa', ar:'تأشيرة الإقامة في الإمارات'},
    what:{en:'Your sponsor (university, employer or family member) renews it. Ask them about renewal well before it runs out.', ar:'يجدّدها كفيلك (الجامعة أو صاحب العمل أو فرد العائلة). اسألهم عن التجديد قبل انتهائها بوقت كافٍ.'}, journey:'dubai.eid.student'},
  eid:{cities:['dubai'], warn:60, name:{en:'Emirates ID', ar:'الهوية الإماراتية'},
    what:{en:'It’s renewed together with your residence visa. Ask your sponsor, and check the status on ICP.', ar:'تُجدَّد مع تأشيرة الإقامة. اسأل كفيلك، وتابع الحالة على موقع الهيئة الاتحادية للهوية والجنسية.'}, journey:'dubai.eid.student'},
  insurance:{cities:['dubai'], warn:30, name:{en:'Health insurance', ar:'التأمين الصحي'},
    what:{en:'Health insurance is required in Dubai. Ask whoever arranged it (university, employer or sponsor) how it renews.', ar:'التأمين الصحي إلزامي في دبي. اسأل الجهة التي رتّبته (الجامعة أو صاحب العمل أو الكفيل) عن طريقة تجديده.'}},
  ukvisa:{cities:['edinburgh'], warn:90, name:{en:'UK visa (eVisa end date)', ar:'التأشيرة البريطانية (تاريخ انتهاء eVisa)'},
    what:{en:'Check the end date in your UKVI account. Talk to your university’s immigration team well before it ends about what comes next.', ar:'تحقّق من تاريخ الانتهاء في حسابك على UKVI. تحدّث مع فريق الهجرة في جامعتك قبل انتهائها بوقت كافٍ عن الخطوة التالية.'}, journey:'edinburgh.evisa'},
  sharecode:{cities:['edinburgh'], warn:7, made90:true, name:{en:'Share code', ar:'رمز المشاركة'},
    what:{en:'Share codes last 90 days. Make a new one on GOV.UK whenever you need it: it’s free.', ar:'رموز المشاركة صالحة لمدة 90 يوماً. أنشئ رمزاً جديداً على GOV.UK متى احتجت، فهو مجاني.'}, journey:'edinburgh.evisa'},
  tenancy:{cities:['dubai'], warn:90, name:{en:'Tenancy contract', ar:'عقد الإيجار'},
    what:{en:'Talk to your landlord about renewing before the contract ends, and renew your Ejari registration with it.', ar:'تحدّث مع المالك عن التجديد قبل انتهاء العقد، وجدّد تسجيل «إيجاري» معه.'}, journey:'dubai.rent'},
};
const dayMs = 864e5;
function daysLeft(date){ const d = new Date(date + 'T00:00:00'), n = new Date(); n.setHours(0,0,0,0); return Math.round((d - n) / dayMs); }
function docState(id, date){ const k = daysLeft(date), w = (DOC_TYPES[id]||{}).warn || 30; return k < 0 ? 'gone' : k <= 7 ? 'soon' : k <= w ? 'warn' : 'ok'; }
function docLabel(date){ const k = daysLeft(date); return k < 0 ? t('docsGone')(-k) : k === 0 ? t('docsToday') : t('docsLeft')(k); }
function fmtDate(date){ const loc = ({fil:'fil-PH', ur:'ur-PK', hi:'hi-IN', ar:'ar-AE', fr:'fr-FR'})[lang()] || 'en-GB';
  try{ return new Date(date+'T00:00:00').toLocaleDateString(loc, {day:'numeric', month:'long', year:'numeric'}); }catch(e){ return date; } }
function myDocs(){ return Object.entries(S.docs||{}).filter(([id]) => DOC_TYPES[id] && DOC_TYPES[id].cities.includes(S.city)).sort((a,b) => a[1].localeCompare(b[1])); }

function docsCard(){
  const list = myDocs();
  return `<div class="docs-card"><div class="need-head"><span class="label">${t('docsTitle')}</span></div>
    ${list.length ? `<div class="choices">${list.map(([id, date]) => `<button class="choice doc-row" data-act="docOpen" data-v="${id}"><span class="main"><span>${L(DOC_TYPES[id].name)}</span><small>${t('docsExpiresOn')} ${fmtDate(date)}</small></span><span class="pill doc-${docState(id,date)}">${docLabel(date)}</span></button>`).join('')}</div>` : ''}
    <button class="linkish" data-act="docAdd">+ ${t('docsAdd')}</button></div>`;
}
function docsSheet(){
  const list = myDocs();
  sheet(`<h2>${t('docsTitle')}</h2><p class="lead">${t('docsSub')}</p>
    ${list.length ? `<div class="choices">${list.map(([id, date]) => `<button class="choice doc-row" data-act="docOpen" data-v="${id}"><span class="main"><span>${L(DOC_TYPES[id].name)}</span><small>${t('docsExpiresOn')} ${fmtDate(date)}</small></span><span class="pill doc-${docState(id,date)}">${docLabel(date)}</span></button>`).join('')}</div>` : `<p class="muted">${t('docsNone')}</p>`}
    <button class="btn btn-primary" data-act="docAdd">${t('docsAdd')}</button>
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
}
function docPickSheet(){
  const types = Object.entries(DOC_TYPES).filter(([,d]) => d.cities.includes(S.city));
  sheet(`<h2>${t('docsPick')}</h2><div class="choices">${types.map(([id,d]) => `<button class="choice" data-act="docEdit" data-v="${id}"><span>${L(d.name)}</span>${(S.docs||{})[id] ? `<span class="pill pill-ok">${fmtDate(S.docs[id])}</span>` : chev()}</button>`).join('')}</div>
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
}
function docEditSheet(id){
  const d = DOC_TYPES[id], cur = (S.docs||{})[id] || '';
  sheet(`<h2>${L(d.name)}</h2>
    ${d.made90 ? `<p class="lead">${t('docsShare90')}</p>` : ''}
    <label class="field-label" for="docDate">${d.made90 ? t('docsMade') : t('docsExpires')}</label>
    <input id="docDate" class="field" type="date" value="${d.made90 && cur ? new Date(new Date(cur+'T00:00:00').getTime()-90*dayMs).toISOString().slice(0,10) : cur}">
    <button class="btn btn-primary" data-act="docSave" data-v="${id}">${t('saveBtn2')}</button>
    ${cur ? `<button class="linkish" data-act="docDel" data-v="${id}">${t('remove')}</button>` : ''}
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
}
function docOpenSheet(id){
  const d = DOC_TYPES[id], date = S.docs[id];
  sheet(`<h2>${L(d.name)}</h2>
    <div class="doc-big doc-${docState(id,date)}"><strong>${docLabel(date)}</strong><span>${t('docsExpiresOn')} ${fmtDate(date)}</span></div>
    <div class="answer"><h3>${t('docsWhat')}</h3><p>${L(d.what)}</p></div>
    ${d.journey && DATA.journeys[d.journey] ? `<button class="choice jlink" data-act="journey" data-v="${d.journey}"><span>${L(DATA.journeys[d.journey].title)}</span>${chev()}</button>` : ''}
    <span class="label">${t('docsCal')}</span><p class="muted" style="margin:0">${t('docsCalNote')}</p>
    <div class="choices"><button class="choice" data-act="docIcs" data-v="${id}"><span>${t('calOther')}</span>${chev()}</button>
      <a class="choice" href="${docGcal(id)}" target="_blank" rel="noopener"><span>${t('calGoogle')}</span>${chev()}</a></div>
    <div class="place-actions"><button class="btn btn-quiet" data-act="docEdit" data-v="${id}">${t('change')}</button><button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button></div>`);
}
function docIcs(id){
  const d = DOC_TYPES[id], date = S.docs[id].replace(/-/g,''), next = new Date(new Date(S.docs[id]+'T00:00:00').getTime()+dayMs).toISOString().slice(0,10).replace(/-/g,'');
  const e = x => String(x).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const title = `${L(d.name)}: ${t('docsExpiresOn').toLowerCase()} ${fmtDate(S.docs[id])}`;
  const alarm = tr => ['BEGIN:VALARM',`TRIGGER:${tr}`,'ACTION:DISPLAY',`DESCRIPTION:${e(title)}`,'END:VALARM'];
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Orivia//EN','BEGIN:VEVENT',`UID:orivia-doc-${id}-${date}@orivia`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`, `DTSTART;VALUE=DATE:${date}`, `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${e(title)}`, `DESCRIPTION:${e(L(d.what))}`, ...alarm('-P30D'), ...alarm('-P7D'), 'END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'}));
  a.download = `orivia-${id}-reminder.ics`; document.body.appendChild(a); a.click(); a.remove();
}
function docGcal(id){
  const d = DOC_TYPES[id], date = S.docs[id].replace(/-/g,''), next = new Date(new Date(S.docs[id]+'T00:00:00').getTime()+dayMs).toISOString().slice(0,10).replace(/-/g,'');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(L(d.name)+': '+t('docsExpiresOn').toLowerCase()+' '+fmtDate(S.docs[id]))}&dates=${date}/${next}&details=${encodeURIComponent(L(d.what))}`;
}
/* The most urgent document, for the top of the home screen */
function docAlert(){
  const urgent = myDocs().filter(([id,date]) => ['soon','gone','warn'].includes(docState(id,date)));
  if(!urgent.length) return '';
  const [id, date] = urgent[0];
  return `<button class="doc-alert doc-${docState(id,date)}" data-act="docOpen" data-v="${id}"><span class="main"><span class="label">${L(DOC_TYPES[id].name)}</span><strong>${docLabel(date)}</strong></span>${chev()}</button>`;
}
function expiryAct(act, v){
  switch(act){
    case 'docsOpen': docsSheet(); logEv('docs_open'); return true;
    case 'docAdd': docPickSheet(); return true;
    case 'docEdit': docEditSheet(v); return true;
    case 'docOpen': docOpenSheet(v); return true;
    case 'docSave': {
      let val = document.getElementById('docDate').value; if(!val){ toast(t('apptMissing')); return true; }
      if(DOC_TYPES[v].made90) val = new Date(new Date(val+'T00:00:00').getTime()+90*dayMs+12*36e5).toISOString().slice(0,10);
      S.docs = S.docs || {}; S.docs[v] = val; logEv('doc_saved', {detail:v}); save(); closeSheet(); render(); docOpenSheet(v); return true; }
    case 'docDel': delete S.docs[v]; save(); closeSheet(); render(); return true;
    case 'docIcs': docIcs(v); logEv('doc_calendar', {detail:v}); return true;
  }
  return false;
}

/* Add "Track document expiry dates" to the Documents & ID list in each city */
['dubai','edinburgh'].forEach(c => { const k = c + '.docs'; DATA.tasks[k] = DATA.tasks[k] || [];
  DATA.tasks[k].push({action:'docsOpen', name:{en:UI.en.docsTrack, ar:UI.ar.docsTrack}, note:{en:UI.en.docsTrackNote, ar:UI.ar.docsTrackNote}}); });
