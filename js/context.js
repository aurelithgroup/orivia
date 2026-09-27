/* =========================================================
   ORIVIA CONTEXT ENGINE
   One shared picture of where the user is, that every feature
   reads from:  WHO · WHERE · WHAT · STAGE · STATUS · PROBLEM · SOURCE · NEXT
   Also: the "Your journeys" home screen, document checklists,
   deep links and the anonymous on-device event log.
   Loaded before app.js; functions here use app.js globals at call time.
   ========================================================= */

/* ---------- Interface text for these features ---------- */
Object.assign(UI.en, {
  hubTitle:'Your journeys', hubSub:'Pick up where you left off.',
  hereNow:'You are here', nextStep:'Next', waitingOn:'Waiting on', upcoming:'Coming up', then:'Then',
  needsHelp:'You asked for help at this step', getHelp:'Get help with this step', continueBtn:'Continue',
  alsoGoing:'Also in progress', suggested:'Suggested next', exploreAll:'Explore everything', yourJourneys:'Your journeys',
  readyN:(n,t)=>`${n} of ${t} things ready`, allReady:'You have everything', needTitle:'What you’ll need', tapToTick:'Tap each one when you have it.',
  form:{original:'Original', copy:'A copy', digital:'On your phone', print:'Printed'},
  whileWait:'Nothing for you to do right now. Orivia shows what happens next.', checkStep:'Open this step',
  allDoneJ:'Journey complete', startSomething:'Start something new',
  testMode:'Test session', exportLog:'Download log', clearLog:'Clear log', events:n=>`${n} events recorded on this phone`,
});
Object.assign(UI.ar, {
  hubTitle:'رحلاتك', hubSub:'تابع من حيث توقفت.',
  hereNow:'أنت هنا', nextStep:'التالي', waitingOn:'بانتظار', upcoming:'قادم', then:'ثم',
  needsHelp:'طلبت المساعدة في هذه الخطوة', getHelp:'احصل على مساعدة في هذه الخطوة', continueBtn:'تابع',
  alsoGoing:'رحلات أخرى جارية', suggested:'مقترح لك', exploreAll:'استكشف كل شيء', yourJourneys:'رحلاتك',
  readyN:(n,t)=>`${n} من ${t} جاهزة`, allReady:'لديك كل شيء', needTitle:'ما ستحتاجه', tapToTick:'اضغط على كل عنصر عندما يصبح معك.',
  form:{original:'الأصل', copy:'نسخة', digital:'على هاتفك', print:'مطبوع'},
  whileWait:'لا شيء مطلوب منك الآن. توضح لك أوريفيا ما يحدث بعد ذلك.', checkStep:'افتح هذه الخطوة',
  allDoneJ:'اكتملت الرحلة', startSomething:'ابدأ شيئاً جديداً',
  testMode:'جلسة اختبار', exportLog:'تنزيل السجل', clearLog:'مسح السجل', events:n=>`${n} حدثاً مسجلاً على هذا الهاتف`,
});

/* ---------- Content additions: what you'll need, and who you're waiting on ---------- */
(function(){
  const J = DATA.journeys;
  const add = (jid, sid, extra) => { const j = J[jid]; if(!j) return; const s = j.stages.find(x=>x.id===sid); if(s) Object.assign(s, extra); };
  const it = (id, en, ar, form, nen, nar) => ({id, v:{en, ar}, form, note: nen ? {en:nen, ar:nar} : null});
  const PASS = it('passport', 'Your passport', 'جواز سفرك', 'original');
  const EID = it('eid', 'Your Emirates ID', 'هويتك الإماراتية', 'original');

  /* Dubai: Emirates ID (students) */
  add('dubai.eid.student','permit',{need:[
    it('passport','Your passport','جواز سفرك',null,'Usually valid for at least 6 more months.','صالح عادةً لستة أشهر على الأقل.'),
    it('photo','A photo with a white background','صورة بخلفية بيضاء'),
    it('forms','The forms your university sends','النماذج التي ترسلها جامعتك'),
  ], wait:{en:'Your university to get your entry permit. It usually takes 7–15 working days.', ar:'أن تحصل جامعتك على تصريح دخولك. يستغرق ذلك عادةً من 7 إلى 15 يوم عمل.'}});
  add('dubai.eid.student','arrive',{need:[it('permit','Your stamped entry permit','تصريح الدخول المختوم','copy','Send a copy to your visa office, or take it in.','أرسل نسخة إلى مكتب التأشيرات أو سلّمها بنفسك.')]});
  add('dubai.eid.student','medical',{need:[PASS, it('medform','The form from your university','النموذج من جامعتك')],
    wait:{en:'Your university to send your medical test appointment.', ar:'أن ترسل جامعتك موعد الفحص الطبي.'}});
  add('dubai.eid.student','biometrics',{need:[PASS, it('apptmail','Your appointment email','رسالة الموعد')],
    wait:{en:'Your university to send your fingerprint appointment.', ar:'أن ترسل جامعتك موعد البصمات.'}});
  add('dubai.eid.student','issued',{wait:{en:'Your residence visa to be issued. It’s mostly waiting: about 3–5 weeks after you arrive in total.', ar:'صدور تأشيرة الإقامة. هذه المرحلة انتظار في الغالب: نحو 3 إلى 5 أسابيع من وصولك إجمالاً.'}});
  add('dubai.eid.student','card',{wait:{en:'Your Emirates ID card to be ready. You can check its status on ICP.', ar:'أن تصبح بطاقة الهوية جاهزة. يمكنك متابعة حالتها على موقع الهيئة.'}});
  add('dubai.eid.student','register',{need:[PASS, EID]});
  /* Dubai: others */
  add('dubai.nol','prepare',{need:[it('pay','Cash or a bank card','نقود أو بطاقة بنكية')]});
  add('dubai.bank','open',{need:[PASS, EID,
    it('address','Proof of address','إثبات العنوان',null,'A tenancy contract or a utility bill.','عقد إيجار أو فاتورة خدمات.'),
    it('enrol','Proof you’re enrolled (student accounts)','إثبات التسجيل (لحسابات الطلاب)',null,'A university letter with your start and end dates.','خطاب من الجامعة بتاريخي البدء والتخرج المتوقع.')]});
  add('dubai.sim','buy',{need:[it('id','Your passport, or Emirates ID if you have it','جواز سفرك، أو هويتك الإماراتية إن كانت لديك','original')]});
  add('dubai.health.student','visit',{need:[it('id','Your Emirates ID or passport','هويتك الإماراتية أو جواز سفرك','original'), it('inscard','Your insurance card','بطاقة التأمين')]});
  add('dubai.school','apply',{need:[it('tc','A transfer certificate from the old school','شهادة نقل من المدرسة السابقة'), it('reports','Recent school reports','تقارير مدرسية حديثة')]});
  /* Edinburgh */
  add('edinburgh.u22','prepare',{need:[
    it('myacc','A mygov.scot myaccount login','حساب myaccount على mygov.scot','digital'),
    it('photo','A recent head-and-shoulders photo','صورة حديثة للرأس والكتفين','digital'),
    it('passport','Proof of identity, such as your passport','إثبات هوية، مثل جواز سفرك'),
    it('address','Proof of your Scottish address','إثبات عنوانك في اسكتلندا',null,'A council tax letter, bank statement or utility bill.','رسالة ضريبة المجلس أو كشف حساب بنكي أو فاتورة خدمات.')]});
  add('edinburgh.evisa','account',{need:[PASS,
    it('phone','Your phone and email address','هاتفك وبريدك الإلكتروني'),
    it('ref','Your GWF reference or old BRP number','رقم GWF أو رقم بطاقة BRP القديمة',null,'It’s in your visa application emails.','تجده في رسائل طلب التأشيرة.')]});
  add('edinburgh.gp','register',{need:[
    it('id','Proof of identity','إثبات هوية'),
    it('address','Proof of your address','إثبات عنوانك'),
    it('student','Proof you’re a student (if you are)','إثبات أنك طالب (إن كنت كذلك)',null,'For example, your matriculation card.','مثل بطاقة التسجيل الجامعية.')]});
  add('edinburgh.bank','prepare',{need:[PASS,
    it('address','Proof of your UK address','إثبات عنوانك في بريطانيا',null,'A tenancy agreement, council tax letter or utility bill.','عقد إيجار أو رسالة ضريبة المجلس أو فاتورة خدمات.'),
    it('status','Proof of your status','إثبات وضعك',null,'Your eVisa, or for students, proof you’re enrolled.','تأشيرتك الإلكترونية، أو للطلاب إثبات التسجيل.'),
    it('letter','A bank letter from your university (students)','خطاب للبنك من جامعتك (للطلاب)')]});
  add('edinburgh.work','prove',{need:[it('code','A right-to-work share code','رمز مشاركة لإثبات حق العمل','digital','Valid for 90 days.','صالح لمدة 90 يوماً.'), it('dates','Your term and holiday dates','مواعيد الفصل الدراسي والعطلات')]});
  add('edinburgh.community','library',{need:[it('id','ID, like your passport or university card','إثبات هوية، مثل جواز سفرك أو بطاقتك الجامعية','original'), it('address','Proof of your Edinburgh address','إثبات عنوانك في إدنبرة')]});
})();

/* ---------- The context engine ---------- */
function started(jid){ const d = S.done[jid]||{}; return Object.keys(d).some(k=>d[k]) || !!(S.touched||{})[jid]; }
function ctx(jid){
  const j = DATA.journeys[jid]; if(!j) return null;
  const d = S.done[jid]||{}, n = j.stages.filter(s=>d[s.id]).length, total = j.stages.length;
  const cur = j.stages.findIndex(s=>!d[s.id]);
  const stage = cur >= 0 ? j.stages[cur] : null;
  const stuckAt = (S.stuck||{})[jid];
  const status = !stage ? 'done' : (stuckAt === stage.id ? 'blocked' : (stage.wait && !apptOf(jid, stage.id) ? 'waiting' : 'active'));
  const need = stage && stage.need ? stage.need : [], ticks = (S.checks[jid]||{});
  return {
    who: S.purpose, where: j.city, what: jid, journey: j,
    stage, index: cur, done: n, total, status,
    problem: (S.lastProblem && S.lastProblem.j===jid) ? S.lastProblem.p : null,
    source: j.sources || (j.source ? [j.source] : []),
    next: stage ? (stage.wait && status==='waiting' ? stage.wait : stage.title) : null,
    upcoming: cur >= 0 ? j.stages.slice(cur+1, cur+3) : [],
    need, ready: need.filter(x=>ticks[x.id]).length,
  };
}
function cityJourneys(){ return Object.keys(DATA.journeys).filter(id => DATA.journeys[id].city === S.city); }
function activeJourneys(){
  const order = (S.recent||[]).filter(id => DATA.journeys[id] && DATA.journeys[id].city === S.city);
  cityJourneys().forEach(id => { if(!order.includes(id)) order.push(id); });
  return order.filter(id => started(id));
}
function hasHub(){ return activeJourneys().length > 0; }
function touch(jid){ S.touched = S.touched || {}; S.touched[jid] = true; S.recent = [jid].concat((S.recent||[]).filter(x=>x!==jid)).slice(0,20); }

/* ---------- Anonymous on-device event log (no names, nothing sent anywhere) ---------- */
function logEv(type, extra){
  S.log = S.log || [];
  S.log.push(Object.assign({ev:type, ts:new Date().toISOString(), city:S.city, lang:lang(), j:S.params && S.params.id || '', stage:(S.params && S.params.id && S.params.i!=null && DATA.journeys[S.params.id]) ? DATA.journeys[S.params.id].stages[S.params.i].id : ''}, extra||{}));
  if(S.log.length > 1000) S.log = S.log.slice(-1000);
}
function exportLog(){
  const rows = S.log || []; const cols = ['ts','ev','city','lang','j','stage','p','detail'];
  const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => `"${String(r[c]==null?'':r[c]).replace(/"/g,'""')}"`).join(','))).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
  a.download = `orivia-session-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.csv`; document.body.appendChild(a); a.click(); a.remove();
}

/* ---------- Checklist ---------- */
function needBox(jid, s){
  if(!s.need || !s.need.length) return '';
  const ticks = (S.checks[jid]||{}), n = s.need.filter(x=>ticks[x.id]).length;
  return `<div class="need-box">
    <div class="need-head"><span class="label">${t('needTitle')}</span><span class="pill ${n===s.need.length?'pill-ok':'pill-amber'}">${n===s.need.length ? t('allReady') : t('readyN')(n, s.need.length)}</span></div>
    <div class="need-list">${s.need.map(x=>`<button class="need-item ${ticks[x.id]?'on':''}" data-act="tick" data-v="${x.id}" aria-pressed="${!!ticks[x.id]}">
      <span class="tickbox" aria-hidden="true"></span>
      <span class="need-text"><span>${L(x.v)}</span>${x.note?`<small>${L(x.note)}</small>`:''}</span>
      ${x.form ? `<span class="form-tag">${t('form')[x.form]}</span>` : ''}</button>`).join('')}</div>
    <span class="need-hint">${t('tapToTick')}</span>
  </div>`;
}

/* ---------- "Your journeys" home screen ---------- */
function hubScreen(){
  const ids = activeJourneys();
  const focusId = ids.find(id => ctx(id).status !== 'done') || ids[0];
  const c = ctx(focusId), j = c.journey;
  const statusBox = () => {
    if(c.status === 'done') return `<div class="hub-state done"><span class="label">${t('allDoneJ')}</span></div>`;
    if(c.status === 'blocked') return `<div class="hub-state blocked"><span class="label">${t('needsHelp')}</span><strong>${L(c.stage.title)}</strong>
      <button class="btn btn-help" data-act="hubHelp" data-v="${focusId}">${svg('help','help-ico')}<span>${t('getHelp')}</span></button></div>`;
    if(c.status === 'waiting') return `<div class="hub-state waiting"><span class="label">${t('waitingOn')}</span><strong>${L(c.stage.wait)}</strong><span class="muted">${t('whileWait')}</span></div>`;
    return `<div class="hub-state next"><span class="label">${t('nextStep')}</span><strong>${L(c.stage.title)}</strong></div>`;
  };
  const others = ids.filter(id => id !== focusId);
  const week = DATA.firstWeek[S.city] || [];
  const sug = week.find(x => x.journey && !started(x.journey)) || null;
  return {
    body: sign({eyebrow:L(DATA.cities[S.city].kicker), title:t('hubTitle'), sub:t('hubSub')}) + `
      <div class="content">
        ${hubApptCard()}
        <div class="hub-card">
          <button class="hub-title" data-act="journey" data-v="${focusId}"><span>${L(j.title)}</span>${chev()}</button>
          <div class="progress"><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${c.total}" aria-valuenow="${c.done}"><i style="width:${c.done/c.total*100}%"></i></div>
            <div class="progress-text"><span>${t('stepsDone')(c.done,c.total)}</span></div></div>
          ${c.stage ? `<div class="hub-here"><span class="dot"></span><span>${t('hereNow')}: <b>${L(c.stage.label)}</b></span></div>` : ''}
          ${statusBox()}
          ${c.need.length ? `<button class="hub-need" data-act="hubStep" data-v="${focusId}"><span>${t('needTitle')}</span><span class="pill ${c.ready===c.need.length?'pill-ok':'pill-amber'}">${c.ready===c.need.length ? t('allReady') : t('readyN')(c.ready,c.need.length)}</span></button>` : ''}
          ${c.upcoming.length ? `<div class="hub-up"><span class="label">${t('upcoming')}</span><ol>${c.upcoming.map(s=>`<li>${L(s.label)}: ${L(s.title)}</li>`).join('')}</ol></div>` : ''}
        </div>
        <button class="ask-inline" data-act="askOpen">${svg('help','help-ico')}<span>${t('askEntry')}</span></button>
        ${others.length ? `<span class="label">${t('alsoGoing')}</span><div class="choices">${others.map(id=>{ const o = ctx(id);
          return `<button class="choice" data-act="journey" data-v="${id}"><span class="main"><span>${L(o.journey.title)}</span><small>${o.stage ? (o.status==='waiting' ? t('waitingOn')+': '+L(o.stage.label) : o.status==='blocked' ? t('needsHelp') : t('nextStep')+': '+L(o.stage.title)) : t('allDoneJ')}</small></span><span class="pill pill-ok">${o.done}/${o.total}</span></button>`; }).join('')}</div>` : ''}
        ${sug ? `<span class="label">${t('suggested')}</span><div class="choices"><button class="choice" data-act="journey" data-v="${sug.journey}"><span>${L(sug.name)}</span>${chev()}</button></div>` : ''}
        <button class="btn btn-quiet wide" data-act="go" data-v="needs">${t('exploreAll')}</button>
        ${S.testMode ? testPanel() : ''}
      </div>`,
    actions: c.stage ? `<button class="btn btn-primary wide" data-act="hubStep" data-v="${focusId}">${c.status==='blocked' ? t('getHelp') : t('continueBtn')} ${chev()}</button>`
      : `<button class="btn btn-primary wide" data-act="go" data-v="needs">${t('startSomething')} ${chev()}</button>`
  };
}
function testPanel(){
  return `<div class="test-panel"><span class="label">${t('testMode')}</span><span>${t('events')((S.log||[]).length)}</span>
    <div class="test-actions"><button class="btn btn-quiet" data-act="exportLog">${t('exportLog')}</button><button class="linkish" data-act="clearLog">${t('clearLog')}</button></div></div>`;
}

/* ---------- Deep links ----------
   ?city=dubai&lang=en&j=dubai.eid.student&s=arrive   open straight into a stage
   ?pw=dubai.eid                                     open a "who arranges it" question
   ?p=<partner>  remembers which institution's QR was scanned   ?test=1  turns on the test-session log */
function readDeepLink(){
  const q = new URLSearchParams(location.search);
  if(![...q.keys()].length) return;
  if(q.get('lang')){ const l = DATA.languages.find(x=>x.code===q.get('lang') && x.ready); if(l) S.lang = l.code; }
  if(q.get('p')) S.partner = q.get('p').slice(0,40);
  if(q.get('test') === '1') S.testMode = true;
  if(q.get('test') === '0') S.testMode = false;
  const jid = q.get('j'), pw = q.get('pw');
  let target = null;
  if(jid && DATA.journeys[jid]){
    const j = DATA.journeys[jid]; S.city = j.city;
    let i = j.stages.findIndex(s=>s.id===q.get('s'));
    if(i > 0 && !started(jid)){ const d = {}; for(let k=0;k<i;k++) d[j.stages[k].id] = true; S.done[jid] = d; if(j.finder || j.lastDone) S.finder[jid] = {unsure:[]}; }
    touch(jid);
    target = i >= 0 ? {screen:'step', params:{id:jid, i}} : {screen:'journey', params:{id:jid}};
  } else if(pw && DATA.pathways[pw]){ S.city = pw.split('.')[0]; target = {screen:'pathway', params:{id:pw}}; }
  if(target){ S.pending = target; logEv('deeplink', {detail:location.search.slice(1)}); }
  try{ history.replaceState(null, '', location.pathname); }catch(e){}
}
function applyPending(){
  const p = S.pending; if(!p || !S.lang) return false;
  S.pending = null;
  const hist = [{screen:'needs', params:{}}];
  if(p.screen === 'step') hist.push({screen:'journey', params:{id:p.params.id}});
  S.history = hist; S.screen = p.screen; S.params = p.params; save(); render(true);
  return true;
}
