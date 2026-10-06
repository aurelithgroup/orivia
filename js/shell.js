/* =========================================================
   ORIVIA NAVIGATION SHELL
   One permanent bar once you're inside: Home · Journeys · ✦ Help · More
   - Home = your situation (continue, what's next, suggestions)
   - Journeys = goal-first, with "Tell Orivia what you need" search on top
   - Help = reachable from anywhere, changes with where you are
   - More = everything that isn't part of doing a task
   Inside a step the bar steps aside: Orivia navigates, the user doesn't.
   Loaded before app.js; uses app.js globals at call time.
   ========================================================= */
Object.assign(UI.en, {
  tabHome:'Home', tabJourneys:'Journeys', tabHelp:'Help', tabMore:'More',
  morning:'Good morning', afternoon:'Good afternoon', evening:'Good evening',
  continueWhere:'Continue where you left off', upNext:'Up next', otherNeeds:'Other things you might need', startWhere:'Where would you like to start?',
  goalsTitle:'What are you trying to do?', needPh:'Tell Orivia what you need', searchHint:'For example: doctor, bank, my fingerprint appointment',
  guidesN:n=>n===1?'1 guide':`${n} guides`, askTypeJourney:'Guide',
  helpTitle:'What’s happened?', helpSub:'Orivia knows where you are, so start here.',
  hLost:'I’m lost', hNext:'I don’t know what to do next', hWrong:'Something went wrong', hUnderstand:'I don’t understand something', hReceived:'I received something I don’t recognise', hPerson:'I need to speak to someone',
  personTitle:'Talk to a person', lostTitle:'Here’s where you are',
  moreTitle:'More', mLanguage:'Language', mAccess:'Accessibility', mOffline:'Use Orivia offline', mSaved:'Your saved information', mSources:'Sources and checking', mPrivacy:'Privacy', mAbout:'About Orivia',
  bigText:'Larger text', bigTextNote:'Makes the words on every screen bigger.', listenNote:'Every step has a Listen button that reads it aloud.',
  offlineBody:'Save Orivia to your phone’s home screen. Once saved, the guides you’ve opened keep working without internet.',
  savedBody:'Your progress, ticks, appointments and document dates are saved only on this phone.', clearAll:'Clear everything on this phone', clearConfirm:'Tap again to clear everything',
  sourcesBody:'Every step is checked against official sources, and shows when it was last checked. Tap “Why is Orivia telling me this?” on any step to see its sources.',
  privacyBody:'Your answers, progress and anything you type stay on this phone. Orivia only counts anonymous taps (like which step people ask for help on), with no cookies and no personal data.',
  aboutBody:'Orivia guides newcomers through their first weeks in a new country, one step at a time. It is guidance, not official or legal advice.',
  on:'On', off:'Off',
});
Object.assign(UI.ar, {
  tabHome:'الرئيسية', tabJourneys:'الرحلات', tabHelp:'مساعدة', tabMore:'المزيد',
  morning:'صباح الخير', afternoon:'مساء الخير', evening:'مساء الخير',
  continueWhere:'تابع من حيث توقفت', upNext:'التالي', otherNeeds:'أشياء أخرى قد تحتاجها', startWhere:'من أين تريد أن تبدأ؟',
  goalsTitle:'ماذا تحاول أن تفعل؟', needPh:'أخبر أوريفيا بما تحتاجه', searchHint:'مثلاً: طبيب، بنك، موعد البصمات',
  guidesN:n=>n===1?'دليل واحد':`${n} أدلة`, askTypeJourney:'دليل',
  helpTitle:'ماذا حدث؟', helpSub:'تعرف أوريفيا أين أنت، فابدأ من هنا.',
  hLost:'أنا تائه', hNext:'لا أعرف ماذا أفعل بعد ذلك', hWrong:'حدث خطأ ما', hUnderstand:'لا أفهم شيئاً ما', hReceived:'وصلني شيء لا أعرفه', hPerson:'أحتاج إلى التحدث مع شخص',
  personTitle:'تحدّث مع شخص', lostTitle:'هذا هو موقعك',
  moreTitle:'المزيد', mLanguage:'اللغة', mAccess:'سهولة الاستخدام', mOffline:'استخدام أوريفيا دون إنترنت', mSaved:'معلوماتك المحفوظة', mSources:'المصادر والتحقق', mPrivacy:'الخصوصية', mAbout:'عن أوريفيا',
  bigText:'نص أكبر', bigTextNote:'يكبّر الكلمات في كل الشاشات.', listenNote:'في كل خطوة زر «استمع» يقرؤها لك بصوت عالٍ.',
  offlineBody:'احفظ أوريفيا على الشاشة الرئيسية لهاتفك. بعد الحفظ، تبقى الأدلة التي فتحتها تعمل دون إنترنت.',
  savedBody:'تُحفظ تقدّمك وعلاماتك ومواعيدك وتواريخ مستنداتك على هذا الهاتف فقط.', clearAll:'امسح كل شيء على هذا الهاتف', clearConfirm:'اضغط مرة أخرى لمسح كل شيء',
  sourcesBody:'تُراجَع كل خطوة مقابل مصادر رسمية، ويظهر تاريخ آخر تحقق. اضغط «لماذا تخبرني أوريفيا بهذا؟» في أي خطوة لترى مصادرها.',
  privacyBody:'تبقى إجاباتك وتقدّمك وأي شيء تكتبه على هذا الهاتف. لا تحصي أوريفيا إلا نقرات مجهولة الهوية (مثل الخطوة التي يطلب فيها الناس المساعدة)، دون ملفات تعريف ارتباط ودون بيانات شخصية.',
  aboutBody:'ترشد أوريفيا القادمين الجدد في أسابيعهم الأولى في بلد جديد، خطوة بخطوة. وهي إرشادات، وليست استشارة رسمية أو قانونية.',
  on:'تشغيل', off:'إيقاف',
});
EXTRA_ICONS.home = '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>';
EXTRA_ICONS.route = '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6"/>';
EXTRA_ICONS.spark = '<path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/>';
EXTRA_ICONS.menu = '<path d="M4 7h16M4 12h16M4 17h16"/>';
EXTRA_ICONS.family = '<circle cx="8" cy="7" r="2.5"/><circle cx="16" cy="7" r="2.5"/><circle cx="12" cy="13" r="2"/><path d="M3 20c.5-4 9.5-4 10 0M11 20c.5-4 9.5-4 10 0"/>';
EXTRA_ICONS.search = '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>';

/* ---------- Goals: what people are trying to do, in their words ---------- */
DATA.needs.push({id:'family', icon:'family', name:{en:'Family', ar:'العائلة'}});
const GOALS = [
  {need:'docs', v:{en:'Sort out my residence and ID', ar:'ترتيب إقامتي وهويتي'}},
  {need:'housing', v:{en:'Set up my home', ar:'تجهيز سكني'}},
  {need:'money', v:{en:'Open a bank account', ar:'فتح حساب بنكي'}},
  {need:'health', v:{en:'Get healthcare', ar:'الحصول على الرعاية الصحية'}},
  {need:'move', v:{en:'Get around', ar:'التنقل'}},
  {need:'work', v:{en:'Start work', ar:'بدء العمل'}},
  {need:'edu', v:{en:'Study and school', ar:'الدراسة والمدرسة'}},
  {need:'family', v:{en:'Sort things out for my family', ar:'ترتيب أمور عائلتي'}},
  {need:'life', v:{en:'Everyday life', ar:'الحياة اليومية'}},
  {need:'community', v:{en:'Meet people and settle in', ar:'التعرّف على الناس والاستقرار'}},
];
const GOAL_WORDS = {
  docs:'visa residence emirates id identity passport evisa ukvi share code permit sponsor تأشيرة إقامة هوية جواز',
  housing:'home house flat apartment rent landlord tenancy deposit council tax سكن شقة إيجار منزل',
  money:'bank account money card debit scam بنك حساب مال بطاقة',
  health:'doctor hospital clinic gp sick ill medicine pharmacy insurance emergency dentist طبيب مستشفى عيادة صيدلية تأمين مريض',
  move:'transport metro bus tram train taxi airport travel ticket مواصلات مترو حافلة تاكسي مطار',
  work:'job work employer hours salary contract national insurance عمل وظيفة راتب',
  edu:'school university study children kids مدرسة جامعة دراسة أطفال',
  life:'sim phone mobile data internet هاتف شريحة إنترنت',
  community:'friends lonely people volunteer library meet أصدقاء وحدة تطوع مكتبة',
  family:'family wife husband children kids spouse عائلة زوجة زوج أطفال',
};
(function(){
  const T = (journey, pathway, en, ar) => ({journey, pathway, name:{en, ar}, note:null});
  DATA.tasks['dubai.family'] = [
    {journey:'dubai.eid.family', name:{en:'Your family residence visa and Emirates ID', ar:'تأشيرة الإقامة العائلية والهوية الإماراتية'}, note:{en:'Sponsoring a spouse or children', ar:'كفالة الزوج أو الأبناء'}},
    {journey:'dubai.ins.family', name:{en:'Health insurance for your family', ar:'التأمين الصحي لعائلتك'}, note:{en:'Who arranges it for family members', ar:'من يرتّبه لأفراد العائلة'}},
    {journey:'dubai.school', name:{en:'Find a school for your child', ar:'العثور على مدرسة لطفلك'}, note:{en:'Choosing and applying', ar:'الاختيار والتقديم'}},
  ].filter(x => DATA.journeys[x.journey]);
  DATA.tasks['edinburgh.family'] = [
    {journey:'edinburgh.school', name:{en:'Find a school for your child', ar:'العثور على مدرسة لطفلك'}, note:{en:'Catchment schools and applying', ar:'مدارس المنطقة والتقديم'}},
    {journey:'edinburgh.gp', name:{en:'Register with a doctor (GP)', ar:'التسجيل لدى طبيب عام (GP)'}, note:{en:'Each family member registers', ar:'يسجّل كل فرد من العائلة'}},
  ].filter(x => DATA.journeys[x.journey]);
})();
function goalCount(need){ return (DATA.tasks[`${S.city}.${need}`] || []).filter(x => x.journey || x.pathway || x.action).length; }

/* ---------- The bar ---------- */
const NO_TABS = ['welcome','purpose','step','finder'];
function tabbar(){
  if(!S.lang || NO_TABS.includes(S.screen)) return '';
  const on = S.screen === 'hub' ? 'home' : S.screen === 'more' ? 'more' : 'journeys';
  const tab = (k, icon, label) => `<button class="tab ${on===k?'on':''}" data-act="tab" data-v="${k}" aria-current="${on===k?'page':'false'}">${svg(icon,'tab-ico')}<span>${label}</span></button>`;
  return `<nav class="tabbar" aria-label="Orivia">
    ${tab('home','home',t('tabHome'))}${tab('journeys','route',t('tabJourneys'))}
    <button class="tab tab-help" data-act="tab" data-v="help">${svg('spark','tab-ico')}<span>${t('tabHelp')}</span></button>
    ${tab('more','menu',t('tabMore'))}</nav>`;
}
function tabGo(k){
  if(k === 'help'){ helpCenter(); return; }
  S.history = []; S.params = {}; window.__welcomeBack = false;
  S.screen = k === 'home' ? 'hub' : k === 'more' ? 'more' : 'needs';
  save(); render(true); try{ history.pushState({orivia:true}, ''); navDepth++; }catch(e){}
  logEv('tab', {detail:k});
}

/* ---------- Home when nothing has started yet ---------- */
function greeting(){ const h = new Date().getHours(); return h < 12 ? t('morning') : h < 18 ? t('afternoon') : t('evening'); }
function startScreen(){
  const week = DATA.firstWeek[S.city] || [];
  return {
    body: sign({eyebrow:L(DATA.cities[S.city].kicker), title:greeting(), sub:t('startWhere')}) + `
      <div class="content">
        <button class="ask-inline search-big" data-act="needSearch">${svg('search','help-ico')}<span>${t('needPh')}</span></button>
        <button class="choice unsure-row" data-act="unsure"><span class="main"><span>${t('dontKnowStart')}</span><small>${t('weekTitle')}</small></span>${chev()}</button>
        <span class="label">${t('weekTitle')}</span>
        <div class="choices">${week.slice(0,4).map(x => `<button class="choice" ${x.journey?`data-act="journey" data-v="${x.journey}"`:x.pathway?`data-act="pathway" data-v="${x.pathway}"`:'disabled'}><span>${L(x.name)}</span>${chev()}</button>`).join('')}</div>
        <button class="btn btn-quiet wide" data-act="tab" data-v="journeys">${t('exploreAll')}</button>
      </div>`,
    actions:''
  };
}

/* ---------- Journeys: goal-first ---------- */
function goalsScreen(){
  const cont = hasHub() ? ctx(activeJourneys().find(id => ctx(id).status !== 'done') || activeJourneys()[0]) : null;
  return {
    body: sign({eyebrow:L(DATA.cities[S.city].kicker), title:t('goalsTitle')}) + `
      <div class="content">
        <button class="ask-inline search-big" data-act="needSearch">${svg('search','help-ico')}<span>${t('needPh')}</span></button>
        <button class="choice unsure-row" data-act="unsure"><span class="main"><span>${t('dontKnowStart')}</span><small>${t('weekTitle')}</small></span>${chev()}</button>
        ${cont ? `<button class="choice hub-link" data-act="journey" data-v="${cont.what}"><span class="main"><span>${t('continueWhere')}</span><small>${L(cont.journey.title)} · ${cont.done}/${cont.total}</small></span>${chev()}</button>` : ''}
        <div class="goal-grid">${GOALS.filter(g => goalCount(g.need)).map(g => { const n = DATA.needs.find(x=>x.id===g.need);
          return `<button class="goal" data-act="need" data-v="${g.need}">${svg(n.icon)}<span class="t">${L(g.v)}</span><span class="s">${t('guidesN')(goalCount(g.need))}</span></button>`; }).join('')}</div>
      </div>`,
    actions:''
  };
}

/* ---------- Help: from anywhere, aware of where you are ---------- */
function helpCenter(){
  const inStep = S.screen === 'step' && S.params.id;
  const cx = askContext();
  const where = cx ? L(DATA.journeys[cx.jid].title) + (cx.sid ? ' · ' + L(DATA.journeys[cx.jid].stages.find(s=>s.id===cx.sid).label) : '') : '';
  const opt = (k, label) => `<button class="choice" data-act="helpPick" data-v="${k}"><span>${label}</span>${chev()}</button>`;
  sheet(`<h2>${t('helpTitle')}</h2>
    ${where ? `<span class="ask-ctx">${t('hereNow')}: <b>${esc(where)}</b></span>` : `<p class="lead">${t('helpSub')}</p>`}
    <div class="choices">${opt('lost', t('hLost'))}${opt('next', t('hNext'))}${opt('wrong', t('hWrong'))}${opt('understand', t('hUnderstand'))}${opt('received', t('hReceived'))}${opt('person', t('hPerson'))}</div>
    ${emergencyBox()}
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
  logEv('help_center', {detail: inStep ? 'step' : S.screen});
}
function helpPick(k){
  const cx = askContext(), jid = cx && cx.jid, j = jid && DATA.journeys[jid];
  logEv('help_pick', {detail:k});
  if(k === 'lost' || k === 'next'){
    closeSheet();
    if(!jid){ S.history = []; S.screen = 'unsure'; S.params = {}; save(); render(true); return; }
    const c = ctx(jid);
    if(k === 'lost'){ S.history = [{screen:'hub', params:{}}]; S.screen = 'journey'; S.params = {id:jid}; save(); render(true); return; }
    touch(jid); go('step', {id:jid, i:Math.max(c.index, 0)}); return;
  }
  if(k === 'wrong'){
    if(!jid){ askSheet(); return; }
    closeSheet();
    const c = ctx(jid);
    if(!(S.screen === 'step' && S.params.id === jid)) go('step', {id:jid, i:Math.max(c.index,0)});
    wrongSheet(); return;
  }
  if(k === 'understand'){ askSheet(); return; }
  if(k === 'received'){ identifySheet(); return; }
  if(k === 'person'){
    sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="tab" data-v="help">${chev()}${t('helpTitle')}</button></div>
      <h2>${t('personTitle')}</h2>${contactsHtml(j)}
      <div class="help-card"><strong>${t('showThis')}</strong><div class="phrase">${staffInner({en:UI.en.helpPhrase, ar:UI.ar.helpPhrase, mine:t('helpPhrase')})}</div></div>
      ${emergencyBox()}<button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`, true);
  }
}

/* ---------- More ---------- */
function moreScreen(){
  const row = (act, label, sub, extra='') => `<button class="choice" data-act="${act}"><span class="main"><span>${label}</span>${sub?`<small>${sub}</small>`:''}</span>${extra || chev()}</button>`;
  return {
    body: sign({title:t('moreTitle')}) + `
      <div class="content"><div class="choices">
        ${row('langPicker', t('mLanguage'), langName(lang()))}
        ${canSpeak ? row('voiceOpen', t('voiceTitle'), currentVoiceLabel()) : ''}
        ${row('bigText', t('bigText'), t('bigTextNote'), `<span class="pill ${S.big?'pill-ok':'pill-soon'}">${S.big?t('on'):t('off')}</span>`)}
        ${row('moreInfo" data-v="offline', t('mOffline'), '')}
        ${row('moreInfo" data-v="saved', t('mSaved'), '')}
        ${row('docsOpen', t('docsTitle'), '')}
        ${row('moreInfo" data-v="sources', t('mSources'), '')}
        ${row('moreInfo" data-v="privacy', t('mPrivacy'), '')}
        ${row('moreInfo" data-v="about', t('mAbout'), '')}
      </div>
      <p class="disclaimer">${t('listenNote')}</p>
      ${S.testMode ? `<div class="choices">${row('qaOpen" data-v="', 'Journey check (team only)', 'How hard it is to get stuck in each journey')}</div>` + testPanel() : ''}
      </div>`,
    actions:''
  };
}
function moreInfo(k){
  const body = {offline:t('offlineBody'), saved:t('savedBody'), sources:t('sourcesBody'), privacy:t('privacyBody'), about:t('aboutBody')}[k];
  const title = {offline:t('mOffline'), saved:t('mSaved'), sources:t('mSources'), privacy:t('mPrivacy'), about:t('mAbout')}[k];
  sheet(`<h2>${title}</h2><p class="lead" style="color:var(--ink)">${body}</p>
    ${k === 'offline' && !isStandalone() ? `<button class="btn btn-primary" data-act="saveApp">${t('saveBtn')}</button>` : ''}
    ${k === 'privacy' ? statsNoteHtml() : ''}
    ${k === 'sources' ? `<a class="btn btn-quiet linkbtn" href="review.html" target="_blank" rel="noopener">${t('reviewDue')} ${chev()}</a>` : ''}
    ${k === 'saved' ? `<button class="btn btn-quiet" data-act="clearAll">${t('clearAll')}</button>` : ''}
    ${k === 'about' ? `<p class="muted" style="margin:0">Orivia · New place. Same you.</p>` : ''}
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
}
let clearArmed = false;
function shellAct(act, v){
  switch(act){
    case 'tab': closeSheet(); tabGo(v); return true;
    case 'helpPick': helpPick(v); return true;
    case 'needSearch': askSheet('', 'need'); return true;
    case 'bigText': S.big = !S.big; save(); render(); return true;
    case 'moreInfo': moreInfo(v); return true;
    case 'clearAll': {
      const b = document.querySelector('[data-act="clearAll"]');
      if(!clearArmed){ clearArmed = true; if(b) b.textContent = t('clearConfirm'); setTimeout(()=>clearArmed=false, 4000); return true; }
      const keep = {city:S.city, lang:S.lang}; S = Object.assign(FRESH(), keep, {screen:'hub'}); save(); closeSheet(); render(true); return true; }
  }
  return false;
}

/* ---------- Inside a journey: where am I, at a glance ---------- */
function stageChips(jid, i){
  const j = DATA.journeys[jid], d = S.done[jid] || {};
  return `<div class="jhead"><button class="jback" data-act="journey" data-v="${jid}">${svg('chev','chev back-chev')}<span>${L(j.title)}</span></button>
    <div class="stage-chips">${j.stages.map((s,k) => `<button class="schip ${k===i?'on':d[s.id]?'ok':''}" data-act="step" data-v="${k}" ${k===i?'aria-current="step"':''}><span class="sdot"></span>${L(s.label)}</button>`).join('')}</div></div>`;
}
