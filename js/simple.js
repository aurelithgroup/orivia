/* =========================================================
   ORIVIA, SIMPLER
   Newcomer-first screens for someone stressed, on a phone,
   maybe in a second language:
   - First screen: choose your language, then "What do you need help with?"
   - Every journey: where you are, what's next, "you're done for now"
   - Every step: a short Do / Bring / Where / Cost / Time / Then card,
     details folded away, "Something went wrong?" right there
   - "Show this to staff": one big card, no scrolling
   - Trust badge on every journey; offline made obvious; a very simple Home
   Loaded before app.js; uses app.js globals at call time.
   ========================================================= */
Object.assign(UI.en, {
  welcomeShort:'Welcome', changeAnytime:'You can change this anytime.', needHelpWith:'What do you need help with?',
  somethingWrong:'Something went wrong', notSureWhat:'Not sure? Tell us what happened',
  nsTitle:'What’s happened so far?', ns:{arrived:'I’ve just arrived', started:'I’ve started my visa or ID process', wrong:'Something went wrong', message:'I got a message or document I don’t understand', dunno:'I really don’t know'},
  youreHere:'You’re here', nextLabel:'Next', doneForNow:'You don’t need to do anything today.', youreDone:'You’re done. Nothing else to do here.', doNext:'Your next thing to do',
  trustBadge:'Official source checked', updated:'Updated', whatChanged:'What we changed', firstPublished:'First published',
  qDo:'Do this', qBring:'Bring', qWhere:'Where', qCost:'Cost', qTime:'Time', qThen:'Then', qLast:'This is the last step.',
  moreDetails:'More details', lessDetails:'Fewer details', wentWrong:'Something went wrong?', allProblems:'I need help',
  siteDown:'The website or app isn’t working',
  staffBtn:'Show this to staff', staffTpl:(j,s)=>`Hello. I’m new here. I’m working on: ${j} (${s}). Can you help me with this step, please?`,
  offlineSaved:'Saved for offline use', offline:'You’re offline. Your saved journeys are still available.',
  yourNextSteps:'Your next steps', notStarted:'Not started', startJourney:'Start a journey', needElse:'Need something else?',
  stepXofY:(x,y)=>`Step ${x} of ${y}`, bringTomorrow:'Bring', apptOn:'Appointment',
});
Object.assign(UI.ar, {
  welcomeShort:'أهلاً بك', changeAnytime:'يمكنك تغيير هذا في أي وقت.', needHelpWith:'بماذا تحتاج إلى مساعدة؟',
  somethingWrong:'حدث خطأ ما', notSureWhat:'لست متأكداً؟ أخبرنا بما حدث',
  nsTitle:'ماذا حدث حتى الآن؟', ns:{arrived:'وصلت للتو', started:'بدأت إجراءات التأشيرة أو الهوية', wrong:'حدث خطأ ما', message:'وصلتني رسالة أو مستند لا أفهمه', dunno:'لا أعرف حقاً'},
  youreHere:'أنت هنا', nextLabel:'التالي', doneForNow:'لا تحتاج إلى فعل أي شيء اليوم.', youreDone:'انتهيت. لا شيء آخر مطلوب هنا.', doNext:'ما عليك فعله الآن',
  trustBadge:'تم التحقق من المصدر الرسمي', updated:'آخر تحديث', whatChanged:'ما الذي غيّرناه', firstPublished:'النشر الأول',
  qDo:'افعل هذا', qBring:'أحضر', qWhere:'المكان', qCost:'التكلفة', qTime:'المدة', qThen:'ثم', qLast:'هذه آخر خطوة.',
  moreDetails:'تفاصيل أكثر', lessDetails:'تفاصيل أقل', wentWrong:'حدث خطأ ما؟', allProblems:'أحتاج مساعدة',
  siteDown:'الموقع أو التطبيق لا يعمل',
  staffBtn:'اعرض هذا على الموظفين', staffTpl:(j,s)=>`مرحباً. أنا جديد هنا، وأعمل على: ${j} (${s}). هل يمكنك مساعدتي في هذه الخطوة من فضلك؟`,
  offlineSaved:'محفوظ للاستخدام دون إنترنت', offline:'أنت غير متصل بالإنترنت. رحلاتك المحفوظة ما زالت متاحة.',
  yourNextSteps:'خطواتك التالية', notStarted:'لم تبدأ', startJourney:'ابدأ رحلة', needElse:'تحتاج شيئاً آخر؟',
  stepXofY:(x,y)=>`الخطوة ${x} من ${y}`, bringTomorrow:'أحضر', apptOn:'الموعد',
});
/* "The website isn't working": a recovery branch every step can use */
UI.en.ch.site = UI.en.siteDown; UI.ar.ch.site = UI.ar.siteDown;
UI.en.rec.site = ['Wait a few minutes and try again: busy times often cause errors.','Try another browser, or the official app if there is one.','Check you’re on the official website: Orivia’s links go to the right place.','Still not working? Contact the organisation by phone instead.'];
UI.ar.rec.site = ['انتظر بضع دقائق وحاول مجدداً، فأوقات الازدحام تسبب الأخطاء غالباً.','جرّب متصفحاً آخر، أو التطبيق الرسمي إن وُجد.','تأكّد أنك على الموقع الرسمي، فروابط أوريفيا توصلك إلى المكان الصحيح.','ما زال لا يعمل؟ تواصل مع الجهة هاتفياً بدلاً من ذلك.'];
EXTRA_ICONS.check = '<path d="M5 12l5 5 9-10"/>';
EXTRA_ICONS.alert2 = '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5h.01"/>';
EXTRA_ICONS.staff = '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M9 7h6M9 11h6M9 15h4"/>';
EXTRA_ICONS.shield = '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>';

/* Newcomer words for the goals */
if(typeof GOALS !== 'undefined'){
  const relabel = {docs:{en:'My residence ID', ar:'هويتي وإقامتي'}, housing:{en:'My accommodation', ar:'سكني'}, money:{en:'Banking', ar:'البنوك'}, health:{en:'Healthcare', ar:'الرعاية الصحية'},
    move:{en:'Getting around', ar:'التنقل'}, work:{en:'Work', ar:'العمل'}, edu:{en:'University and school', ar:'الجامعة والمدرسة'}, family:{en:'My family', ar:'عائلتي'},
    life:{en:'Phone and everyday life', ar:'الهاتف والحياة اليومية'}, community:{en:'Meeting people', ar:'التعرّف على الناس'}};
  GOALS.forEach(g => { if(relabel[g.need]) g.v = relabel[g.need]; });
  const order = ['housing','docs','health','work','money','edu','move','family','life','community'];
  GOALS.sort((a,b) => order.indexOf(a.need) - order.indexOf(b.need));
}
const LANG_FLAG = {en:'🇬🇧', ar:'🇦🇪', fr:'🇫🇷', fil:'🇵🇭', hi:'🇮🇳', ur:'🇵🇰'};

/* Short facts for the quick card: only where the official sources give them */
(function(){
  const J = DATA.journeys, add = (jid, sid, o) => { const s = J[jid] && J[jid].stages.find(x=>x.id===sid); if(s) Object.assign(s, o); };
  const v = (en, ar) => ({en, ar});
  add('dubai.eid.student','permit',{time:v('Usually 7–15 working days','عادةً من 7 إلى 15 يوم عمل')});
  add('dubai.eid.student','issued',{time:v('About 3–5 weeks after you arrive, in total','نحو 3 إلى 5 أسابيع من وصولك إجمالاً')});
  add('dubai.eid.employee','arrive',{time:v('Enter within 30 days of approval, then finish within 60 days','ادخل خلال 30 يوماً من الموافقة، ثم أكمل خلال 60 يوماً')});
  add('dubai.eid.family','permit',{time:v('Finish your residency within 60 days of entering','أكمل إقامتك خلال 60 يوماً من دخولك')});
  add('dubai.nol','prepare',{cost:v('Silver card about AED 25, including AED 19 of credit','البطاقة الفضية نحو 25 درهماً، منها 19 درهماً رصيد')});
  add('edinburgh.airport','bus',{cost:v('£6.00 single, £8.50 open return','6.00 جنيهات للذهاب، و8.50 للذهاب والعودة المفتوحة'), time:v('About 30 minutes','نحو 30 دقيقة')});
  add('edinburgh.airport','tram',{cost:v('£7.90 from the airport','7.90 جنيهات من المطار'), time:v('About 30 minutes to the centre','نحو 30 دقيقة إلى وسط المدينة')});
  add('edinburgh.bus','pay',{cost:v('£2.40 a journey, never more than £5.70 a day','2.40 جنيه للرحلة، ولا تتجاوز 5.70 جنيهات يومياً')});
  add('edinburgh.u22','apply',{time:v('Up to 10 working days online','حتى 10 أيام عمل عبر الإنترنت')});
  add('edinburgh.work','nino',{cost:v('Free','مجاني'), time:v('Up to 4 weeks','حتى 4 أسابيع')});
  add('edinburgh.counciltax','tv',{cost:v('£180 a year','180 جنيهاً سنوياً')});
  add('edinburgh.gp','register',{cost:v('Free','مجاني')});
  add('edinburgh.evisa','share',{cost:v('Free','مجاني')});
  if(J['edinburgh.airport']) J['edinburgh.airport'].changes = [{d:v('27 Sep 2026','27 سبتمبر 2026'), t:v('Removed the Princes Street closure notice: the street reopened on 29 Aug 2026.','أزلنا تنبيه إغلاق شارع Princes Street، فقد أُعيد افتتاحه في 29 أغسطس 2026.')}];
})();

/* ---------- 1 · First screen: language, then "What do you need help with?" ---------- */
function welcomeScreen(){
  const c = DATA.cities[S.city];
  return {
    body:`<div class="hero-sign hero-small">
        <span class="kick">${L(c.kicker)}</span>
        <h1>${t('welcomeShort')}</h1>
      </div>
      <div class="content">
        <span class="label">${t('chooseLang')}</span>
        <div class="choices">${DATA.languages.filter(l=>l.ready).map(l => `<button class="choice lang-row" data-act="lang" data-v="${l.code}" lang="${l.code}" ${isRtl(l.code)?'dir="rtl"':''}><span class="flag" aria-hidden="true">${LANG_FLAG[l.code]||''}</span><span class="lang-name">${l.name}</span>${l.beta?`<span class="pill pill-soon">${t('betaTr')}</span>`:chev()}</button>`).join('')}</div>
        <p class="change-note">${t('changeAnytime')}</p>
        <p class="disclaimer">${t('disclaimer')}</p>
      </div>`,
    actions:''
  };
}
function needFirstScreen(){
  const cont = hasHub() ? ctx(activeJourneys().find(id => ctx(id).status !== 'done') || activeJourneys()[0]) : null;
  return {
    body: sign({eyebrow:L(DATA.cities[S.city].kicker), title:t('needHelpWith')}) + `
      <div class="content">
        ${cont ? `<button class="choice hub-link" data-act="journey" data-v="${cont.what}"><span class="main"><span>${t('continueWhere')}</span><small>${L(cont.journey.title)}</small></span>${chev()}</button>` : ''}
        <div class="goal-grid">${GOALS.filter(g => goalCount(g.need)).slice(0,6).map(g => { const n = DATA.needs.find(x=>x.id===g.need);
          return `<button class="goal" data-act="need" data-v="${g.need}">${svg(n.icon)}<span class="t">${L(g.v)}</span></button>`; }).join('')}</div>
        <button class="goal goal-wrong wide-goal" data-act="somethingWrong">${svg('alert2')}<span class="t">${t('somethingWrong')}</span>${chev()}</button>
        <button class="choice unsure-row" data-act="notSure"><span class="main"><span>${t('notSureWhat')}</span></span>${chev()}</button>
        <div class="chip-row">${GOALS.filter(g => goalCount(g.need)).slice(6).map(g => `<button class="gchip" data-act="need" data-v="${g.need}">${L(g.v)}</button>`).join('')}</div>
        <button class="ask-inline search-big" data-act="needSearch">${svg('search','help-ico')}<span>${t('needPh')}</span></button>
      </div>`,
    actions:''
  };
}
function notSureSheet(){
  const k = ['arrived','started','wrong','message','dunno'];
  sheet(`<h2>${t('nsTitle')}</h2><div class="choices">${k.map(x=>`<button class="choice" data-act="nsPick" data-v="${x}"><span>${t('ns')[x]}</span>${chev()}</button>`).join('')}</div>
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
  logEv('notsure_open');
}
function nsPick(k){
  logEv('notsure_pick', {detail:k});
  if(k === 'wrong'){ somethingWrong(); return; }
  if(k === 'message'){ identifySheet(); return; }
  closeSheet();
  if(k === 'started'){
    if(DATA.pathways[S.city + '.eid']) go('pathway', {id:S.city + '.eid'});
    else if(DATA.journeys[S.city + '.evisa']){ touch(S.city + '.evisa'); go('journey', {id:S.city + '.evisa'}); }
    return;
  }
  if(DATA.firstWeek[S.city]) go('unsure');
}
function somethingWrong(){
  const a = activeJourneys().find(id => ctx(id).status !== 'done');
  if(a){ const c = ctx(a); closeSheet(); touch(a); go('step', {id:a, i:Math.max(c.index,0)}); wrongSheet(); return; }
  changedSheet();
}

/* ---------- 3 · Where am I? ---------- */
function statusCard(jid){
  const c = ctx(jid); if(!c) return '';
  if(c.status === 'done') return `<div class="status-card done"><strong>${t('youreDone')}</strong></div>`;
  const next = c.upcoming[0];
  return `<div class="status-card ${c.status}">
    <div class="st-row"><span class="label">${t('youreHere')}</span><strong>${L(c.stage.label)}${c.status === 'waiting' ? ': ' + L(c.stage.wait) : ''}</strong></div>
    ${c.status === 'waiting' ? `<p class="st-calm">${t('doneForNow')}</p>` : c.status === 'blocked' ? `<p class="st-warn">${t('needsHelp')}</p>` : `<div class="st-row"><span class="label">${t('doNext')}</span><span>${L(c.stage.title)}</span></div>`}
    ${next ? `<div class="st-row"><span class="label">${t('nextLabel')}</span><span>${L(next.label)}: ${L(next.title)}</span></div>` : ''}
  </div>`;
}
function trustBadge(jid){
  const j = DATA.journeys[jid];
  return `<button class="trust-badge" data-act="whyThis">${svg('shield','btn-ico')}<span><b>${t('trustBadge')}</b> · ${t('updated')} ${L(j.checked)}</span>${chev()}</button>`;
}

/* ---------- 6 · The quick card: no walls of text ---------- */
const firstSentence = s => { const m = String(s).match(/^.*?[.!?؟।۔](\s|$)/); return m ? m[0].trim() : String(s); };
function doThis(s){
  if(s.do) return L(s.do);
  const st = (s.blocks||[]).find(b => b.t === 'steps'); if(st && st.v.length) return L(st.v[0]);
  const p = (s.blocks||[]).find(b => b.t === 'p'); if(p) return firstSentence(L(p.v));
  const li = (s.blocks||[]).find(b => b.t === 'list'); if(li && li.v.length) return L(li.v[0]);
  return '';
}
function blocksLength(s){ return (s.blocks||[]).reduce((n,b) => n + (Array.isArray(b.v) ? b.v.reduce((m,x)=>m + String(L(x.name||x) + L(x.desc||{})).length, 0) : b.v ? String(L(b.v)).length : 0), 0); }
function quickCard(jid, s){
  const j = DATA.journeys[jid], i = j.stages.indexOf(s), next = j.stages[i+1];
  const d = doThis(s); if(!d) return '';
  const ticks = S.checks[jid] || {}, a = apptOf(jid, s.id);
  const where = a && a.where ? `<span dir="auto">${esc(a.where)}</span> <a class="linkish" href="${dirUrl(a.where)}" target="_blank" rel="noopener">${t('takeMe')}</a>`
    : (!s.appt && s.places && s.places.length) ? `${L(PLACES[s.places[0]].name)}${s.places.length > 1 ? ` +${s.places.length-1}` : ''} <a class="linkish" href="${dirUrl(PLACES[s.places[0]].name.en + ', ' + PLACES[s.places[0]].address)}" target="_blank" rel="noopener">${t('takeMe')}</a>` : '';
  const row = (k, html) => `<div class="q-row"><span class="q-k">${k}</span><div class="q-v">${html}</div></div>`;
  return `<div class="quick">
    ${row(t('qDo'), `<b>${d}</b>`)}
    ${s.need && s.need.length ? row(t('qBring'), `<div class="q-bring">${s.need.map(x=>`<button class="q-item ${ticks[x.id]?'on':''}" data-act="tick" data-v="${x.id}" aria-pressed="${!!ticks[x.id]}"><span class="tickmini" aria-hidden="true"></span><span>${L(x.v)}</span></button>`).join('')}</div>`) : ''}
    ${where ? row(t('qWhere'), where) : ''}
    ${s.cost ? row(t('qCost'), L(s.cost)) : ''}
    ${s.time ? row(t('qTime'), L(s.time)) : ''}
    ${row(t('qThen'), next ? `${L(next.label)}: ${L(next.title)}` : t('qLast'))}
  </div>`;
}
function detailsWrap(s, inner){
  const long = blocksLength(s) > 380 && !(s.blocks||[]).some(b => b.t === 'cards');
  if(!long) return inner;
  return `<details class="more-details"${S.openDetails ? ' open' : ''}><summary><span>${t('moreDetails')}</span>${svg('chev','chev')}</summary><div class="md-body">${inner}</div></details>`;
}

/* ---------- 4 · "Something went wrong?" right on the step ---------- */
function wrongInline(jid, s){
  const j = DATA.journeys[jid];
  const ids = (s.help || []).filter(id => id !== 'else').slice(0,3);
  const probs = ids.map(id => (j.problems||[]).find(p=>p.id===id)).filter(Boolean);
  return `<div class="wrong-inline"><span class="label">${t('wentWrong')}</span>
    <div class="choices">
      ${probs.map(p=>`<button class="choice" data-act="problem" data-v="${p.id}"><span>${L(p.q)}</span>${chev()}</button>`).join('')}
      ${s.appt ? `<button class="choice" data-act="recover" data-v="missed"><span>${t('ch').missed}</span>${chev()}</button>` : ''}
      <button class="choice" data-act="recover" data-v="site"><span>${t('siteDown')}</span>${chev()}</button>
      <button class="choice" data-act="wrong"><span><b>${t('allProblems')}</b></span>${chev()}</button>
    </div></div>`;
}

/* ---------- 5 · Show this to staff: one big card ---------- */
function staffCard(){
  const j = DATA.journeys[S.params.id], s = curStage();
  const o = s ? {en:UI.en.staffTpl(j.title.en, s.label.en), ar:UI.ar.staffTpl(j.title.ar, s.label.ar), mine:t('staffTpl')(L(j.title), L(s.label))}
    : {en:UI.en.helpPhrase, ar:UI.ar.helpPhrase, mine:t('helpPhrase')};
  const w = document.createElement('div'); w.className = 'staff-full'; w.id = 'sheet';
  w.innerHTML = `<button class="staff-x" data-act="closeSheet" aria-label="${t('close')}">×</button><div class="staff-card">${staffInner(o)}</div>`;
  closeSheet(); app.appendChild(w); w.querySelector('button').focus();
  logEv('staff_card');
}

/* ---------- 8 · Offline, made obvious ---------- */
window.__offlineReady = false;
if('caches' in window){ caches.keys().then(k => { window.__offlineReady = k.some(x => x.startsWith('orivia-'));
  if(window.__offlineReady){ let seen = false; try{ seen = localStorage.getItem('orivia-offline-told') === '1'; }catch(e){}
    if(!seen){ try{ localStorage.setItem('orivia-offline-told','1'); }catch(e){} if(S.lang) toast('✓ ' + t('offlineSaved')); } } }).catch(()=>{}); }
const offlineChip = () => window.__offlineReady ? `<span class="offline-chip">✓ ${t('offlineSaved')}</span>` : '';

/* ---------- 11 · A ridiculously simple Home ---------- */
function simpleHome(){
  const ids = activeJourneys();
  const week = (DATA.firstWeek[S.city] || []).filter(x => x.journey && !ids.includes(x.journey)).slice(0, ids.length ? 2 : 4);
  const focus = ids.find(id => ctx(id).status !== 'done') || ids[0];
  const line = id => { const c = ctx(id), a = c.stage && apptOf(id, c.stage.id);
    if(c.status === 'done') return t('allDoneJ');
    if(a) return `${t('apptOn')}: ${fmtWhen(a)}${c.need.length ? ` · ${t('bringTomorrow')} ${c.need.slice(0,2).map(x=>L(x.v).toLowerCase()).join(', ')}` : ''}`;
    if(c.status === 'waiting') return `${t('waitingOn')}: ${L(c.stage.label)} · ${t('doneForNow')}`;
    if(c.status === 'blocked') return t('needsHelp');
    return `${t('stepXofY')(c.index+1, c.total)} · ${L(c.stage.title)}`; };
  const card = id => { const c = ctx(id), j = c.journey;
    return `<button class="next-card ${c.status}" data-act="hubStep" data-v="${id}">${svg(j.icon||'move','nc-ico')}<span class="main"><span class="nc-t">${L(j.title)}</span><small>${line(id)}</small>
      <span class="dots mini" aria-hidden="true">${j.stages.map((s,i)=>`<i class="${(S.done[id]||{})[s.id]?'ok':i===c.index?'on':''}"></i>`).join('')}</span></span>${chev()}</button>`; };
  return {
    body: sign({eyebrow: window.__welcomeBack ? t('welcomeBack') : L(DATA.cities[S.city].kicker), title:greeting(), sub: ids.length ? t('continueWhere') : t('startWhere')}) + `
      <div class="content">
        ${partnerStrip()}${docAlert()}${hubApptCard()}
        ${ids.length ? `<span class="label">${t('yourNextSteps')}</span><div class="next-list">${ids.map(card).join('')}</div>` : ''}
        ${week.length ? `<div class="next-list">${week.map(x=>`<button class="next-card todo" data-act="journey" data-v="${x.journey}">${svg((DATA.journeys[x.journey]||{}).icon||'move','nc-ico')}<span class="main"><span class="nc-t">${L(x.name)}</span><small>${t('notStarted')}</small></span>${chev()}</button>`).join('')}</div>` : ''}
        <button class="btn btn-quiet wide start-btn" data-act="tab" data-v="journeys">+ ${t('startJourney')}</button>
        ${offlineChip()}
        ${S.testMode ? testPanel() : ''}
      </div>`,
    actions: focus && ctx(focus).stage ? `<button class="btn btn-primary wide" data-act="hubStep" data-v="${focus}">${t('continueBtn')} ${chev()}</button>` : ''
  };
}

function simpleAct(act, v){
  switch(act){
    case 'notSure': notSureSheet(); return true;
    case 'nsPick': nsPick(v); return true;
    case 'somethingWrong': somethingWrong(); return true;
    case 'staffCard': staffCard(); return true;
  }
  return false;
}
