/* =========================================================
   THE SMART LAYER: a fault-tolerant guide
   Orivia assumes the world is messy: people misremember, skip steps,
   get told different things, and wait on other people.
   1. Just checking: important answers are double-checked against what
      Orivia already knows (state validation).
   2. "I'm not sure" and "What does this mean?" are real answers, with a
      short check-up instead of a guess (confidence-aware).
   3. No dead ends: every "ask someone" says who, why, what to have ready,
      exactly what to say, and how to reach them, then remembers you're
      waiting for a reply.
   4. Truth order: official rules > the institution running the step >
      Orivia's guidance > what you were told > guesses. When sources
      disagree, Orivia says so instead of picking one.
   Loaded after simple.js and before app.js; uses app.js globals at call time.
   ========================================================= */
Object.assign(UI.en, {
  jcTitle:'Just checking…',
  jcBody:(cur, miss) => `You’re finishing “${cur}”, but “${miss}” isn’t marked as done yet. Usually it comes first.`,
  jcDid:'I did it. I forgot to mark it', jcNot:'I haven’t done it yet', jcUnsure:'I’m not sure',
  jcNotNote:'That’s fine. Let’s do that step first. If your university told you to do things in a different order, follow them.',
  ldTitle:'Just checking: have you done all of these?', ldSub:'Untick anything that didn’t happen.', ldOk:'Yes, that’s right',
  whatMean:'What does this mean?', stillUnsure:'I’m still not sure',
  dxTitle:'Let’s work it out together', dxOf:(i,n) => `Check ${i} of ${n}`,
  dxProbably:'It sounds like you’ve probably done this.', dxProbablyNot:'It sounds like this hasn’t happened yet.',
  dxCantConfirm:'Orivia can’t confirm it from your answers. Here’s how to check for sure:',
  dxTreatDone:'Treat it as done for now', dxTreatNot:'Treat it as not done', dxContinue:'Continue',
  escNeeds:'This needs', escWhy:'Why', escReady:'Have this ready', escSay:'You can say', escHow:'How to reach them',
  escCopy:'Copy message', escCopied:'Copied', escEmail:'Write the email', escSent:'I’ve contacted them',
  escSentToast:'OK. Orivia will remember you’re waiting for a reply.', escMine:'In your language',
  wrTitle:(who) => `Waiting for a reply from ${who}`, wrSince:(d) => `Since ${d}. Nothing else to do on this for now.`,
  wrNoReply:(d) => `No reply by ${d}? Send a short follow-up.`, wrFollow:'Copy a follow-up message', wrReplied:'They replied',
  wrFollowMsg:(d, q) => `Hello. I’m following up on my message from ${d} about: “${q}”. Could you let me know the status, please? Thank you.`,
  diffThanks:'Thank you. We’ll check this step against the official sources.', diffReport:'Tell Orivia about this difference',
  noteUnsure:'Not confirmed yet', noteUnsureSub:'You weren’t sure about this step. Confirm it before you rely on it.',
});
Object.assign(UI.ar, {
  jcTitle:'للتأكد فقط…',
  jcBody:(cur, miss) => `أنت تُنهي «${cur}»، لكن «${miss}» لم يُحدَّد بعد على أنه مُنجز. عادةً يأتي ذلك أولاً.`,
  jcDid:'أنجزته، لكنني نسيت تحديده', jcNot:'لم أنجزه بعد', jcUnsure:'لست متأكداً',
  jcNotNote:'لا بأس. لنبدأ بتلك الخطوة أولاً. وإذا طلبت منك جامعتك ترتيباً مختلفاً، فاتبع تعليماتها.',
  ldTitle:'للتأكد فقط: هل أنجزت كل هذه الخطوات؟', ldSub:'ألغِ تحديد أي خطوة لم تحدث.', ldOk:'نعم، هذا صحيح',
  whatMean:'ماذا يعني هذا؟', stillUnsure:'ما زلت غير متأكد',
  dxTitle:'لنعرف ذلك معاً', dxOf:(i,n) => `سؤال ${i} من ${n}`,
  dxProbably:'يبدو أنك أنجزت هذه الخطوة على الأرجح.', dxProbablyNot:'يبدو أن هذه الخطوة لم تحدث بعد.',
  dxCantConfirm:'لا تستطيع أوريفيا التأكد من إجاباتك. إليك طريقة التحقق بشكل مؤكد:',
  dxTreatDone:'اعتبرها مُنجزة الآن', dxTreatNot:'اعتبرها غير مُنجزة', dxContinue:'متابعة',
  escNeeds:'هذا يحتاج إلى', escWhy:'لماذا', escReady:'جهّز ما يلي', escSay:'يمكنك أن تقول', escHow:'كيف تتواصل معهم',
  escCopy:'انسخ الرسالة', escCopied:'تم النسخ', escEmail:'اكتب البريد الإلكتروني', escSent:'تواصلت معهم',
  escSentToast:'حسناً. ستتذكر أوريفيا أنك تنتظر رداً.', escMine:'بلغتك',
  wrTitle:(who) => `بانتظار رد من ${who}`, wrSince:(d) => `منذ ${d}. لا شيء آخر عليك فعله في هذا الأمر الآن.`,
  wrNoReply:(d) => `لم يصلك رد حتى ${d}؟ أرسل رسالة متابعة قصيرة.`, wrFollow:'انسخ رسالة متابعة', wrReplied:'وصلني الرد',
  wrFollowMsg:(d, q) => `مرحباً. أتابع رسالتي بتاريخ ${d} بخصوص: «${q}». هل يمكنكم إبلاغي بحالة الطلب من فضلكم؟ شكراً لكم.`,
  diffThanks:'شكراً لك. سنراجع هذه الخطوة مقارنةً بالمصادر الرسمية.', diffReport:'أبلغ أوريفيا بهذا الاختلاف',
  noteUnsure:'لم يُؤكَّد بعد', noteUnsureSub:'لم تكن متأكداً من هذه الخطوة. تأكّد منها قبل الاعتماد عليها.',
});

const v2 = (en, ar) => ({en, ar});

/* ---------- Who to contact: who, why, what to have ready, how ---------- */
const CONTACTS = {
  visa:{
    who:v2('Your university’s visa office','مكتب التأشيرات في جامعتك'), whoIn:v2('your university’s visa office','مكتب التأشيرات في جامعتك'),
    why:v2('They sponsor your visa and run this part of your application. Only they can see it or change it.','فهو كفيل تأشيرتك ويتولى هذا الجزء من طلبك، ولا أحد غيره يستطيع الاطلاع عليه أو تعديله.'),
    ready:[v2('Your full name, as in your passport','اسمك الكامل كما في جواز السفر'), v2('Your passport number','رقم جواز سفرك'), v2('Your student ID number','رقمك الجامعي'),
           v2('Your application number (PRAN), if you have it','رقم الطلب (PRAN) إن كان لديك'), v2('Any email or letter about this','أي رسالة أو خطاب يخص هذا الأمر')],
    how:v2('Their email address is usually in your offer or welcome email. Can’t find it? Search your university’s website for “student visa”, or ask at the student services desk on campus.',
           'يوجد بريدهم الإلكتروني عادةً في رسالة القبول أو الترحيب. لا تجده؟ ابحث في موقع جامعتك عن «تأشيرة الطالب»، أو اسأل في مكتب خدمات الطلاب في الحرم الجامعي.'),
    replyDays:3,
  },
  icp:{
    who:v2('ICP (the Federal Authority for Identity and Citizenship)','الهيئة الاتحادية للهوية والجنسية'),
    why:v2('They issue Emirates IDs and can check where your ID application is.','هي الجهة التي تُصدر الهوية الإماراتية ويمكنها التحقق من حالة طلبك.'),
    ready:[v2('Your application number (PRAN)','رقم الطلب (PRAN)'), v2('Your passport number','رقم جواز سفرك')],
    how:v2('Call 600 522222. From outside the UAE: +971 600 522222.','اتصل على 600 522222. من خارج الإمارات: ‎+971 600 522222.'),
    phone:'600 522222', replyDays:0,
  },
};
function contactFor(key){
  const c = Object.assign({}, CONTACTS[key]);
  const p = S.partner && DATA.partners && DATA.partners[S.partner];
  if(key === 'visa' && p && p.city === S.city){
    c.who = c.whoIn = {en:`${p.name.en}: ${p.team.en}`, ar:`${p.name.ar}: ${p.team.ar}`};
    c.email = p.email;
    c.how = {en:`Email ${p.email}, or go to the ${p.team.en}, ${p.where.en} (${p.hours.en}).`, ar:`راسلهم على ${p.email}، أو توجّه إلى ${p.team.ar}، ${p.where.ar} (${p.hours.ar}).`};
  }
  return c;
}
/* UAE weekends are Saturday and Sunday */
function addWorkdays(d, n){ const x = new Date(d); let k = 0; while(k < n){ x.setDate(x.getDate()+1); const w = x.getDay(); if(w !== 0 && w !== 6) k++; } return x; }
function shortDate(d){ try{ return new Date(d).toLocaleDateString(({ar:'ar-AE',fr:'fr-FR',fil:'fil-PH',hi:'hi-IN',ur:'ur-PK',zh:'zh-CN',ru:'ru-RU',bn:'bn-BD',ml:'ml-IN'})[lang()] || 'en-GB', {weekday:'short', day:'numeric', month:'short'}).replace(/\.$/, ''); }catch(e){ return ''; } }
const escAttr = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

/* The escalation card: who, why, have ready, what to say, how, then "I've contacted them" */
function escHtml(p){
  if(!p || !p.esc) return '';
  const c = contactFor(p.esc.to), sayEn = p.esc.say ? p.esc.say.en : '', sayMine = p.esc.say ? L(p.esc.say) : '';
  const mail = c.email ? `mailto:${c.email}?subject=${encodeURIComponent(p.q.en)}&body=${encodeURIComponent(sayEn)}` : '';
  return `<div class="esc">
    <span class="label">${t('escNeeds')}</span><h3>${L(c.who)}</h3>
    <p><b>${t('escWhy')}:</b> ${L(c.why)}</p>
    ${c.ready ? `<p class="esc-h"><b>${t('escReady')}:</b></p><ul class="blk-list">${c.ready.map(x => `<li>${L(x)}</li>`).join('')}</ul>` : ''}
    ${sayEn ? `<p class="esc-h"><b>${t('escSay')}:</b></p><blockquote class="esc-say" lang="en" dir="ltr">${sayEn}</blockquote>
      ${sayMine && sayMine !== sayEn ? `<p class="esc-mine"><small>${t('escMine')}:</small> ${sayMine}</p>` : ''}
      <button class="btn btn-quiet" data-act="escCopy" data-v="${escAttr(sayEn)}">${t('escCopy')}</button>` : ''}
    <p class="esc-h"><b>${t('escHow')}:</b> ${L(c.how)}</p>
    ${mail ? `<a class="btn btn-quiet linkbtn" href="${mail}">${t('escEmail')} ${chev()}</a>` : ''}
    ${c.phone ? `<a class="btn btn-quiet linkbtn" href="tel:${c.phone.replace(/\s/g,'')}" dir="ltr">${c.phone}</a>` : ''}
    ${c.replyDays ? `<button class="btn btn-primary" data-act="escSent" data-v="${p.id}">${t('escSent')}</button>` : ''}
  </div>`;
}
/* "You're waiting for a reply" banner, shown with the status card */
function replyBanner(jid){
  const w = S.waiting && S.waiting[jid]; if(!w) return '';
  const j = DATA.journeys[jid], p = (j.problems || []).find(x => x.id === w.p) || {q:v2('your application','طلبي')};
  const c = contactFor(w.to), due = addWorkdays(w.since, c.replyDays || 3), late = Date.now() > due.getTime();
  const follow = UI.en.wrFollowMsg(new Date(w.since).toLocaleDateString('en-GB', {day:'numeric', month:'long'}), p.q.en);
  return `<div class="reply-card ${late ? 'late' : ''}">
    <strong>${t('wrTitle')(L(c.whoIn || c.who))}</strong>
    <p>${t('wrSince')(shortDate(w.since))}</p>
    <p>${t('wrNoReply')(shortDate(due))}</p>
    <div class="reply-btns"><button class="btn btn-quiet" data-act="escCopy" data-v="${escAttr(follow)}">${t('wrFollow')}</button>
    <button class="btn btn-quiet" data-act="escReplied" data-v="${jid}">${t('wrReplied')}</button></div>
  </div>`;
}
if(typeof statusCard === 'function'){ const _sc = statusCard; statusCard = jid => replyBanner(jid) + _sc(jid); }

/* ---------- 1 · Just checking: finishing a step out of order ---------- */
let jcPending = null;
function smartCheckDone(jid, i){
  const j = DATA.journeys[jid]; if(!j || !j.finder) return false;
  const order = j.finder.map(f => f.stage), d = S.done[jid] || {};
  const pos = order.indexOf(j.stages[i].id); if(pos <= 0) return false;
  const miss = order.slice(0, pos).filter(sid => !d[sid]); if(!miss.length) return false;
  jcPending = {jid, i, miss};
  const name = sid => L(j.stages.find(s => s.id === sid).label);
  sheet(`<h2>${t('jcTitle')}</h2><p class="lead">${t('jcBody')(L(j.stages[i].label), miss.map(name).join(', '))}</p>
    <div class="choices">
      <button class="choice" data-act="jcDid"><span>${t('jcDid')}</span>${chev()}</button>
      <button class="choice" data-act="jcNot"><span>${t('jcNot')}</span>${chev()}</button>
      <button class="choice" data-act="jcUnsure"><span>${t('jcUnsure')}</span>${chev()}</button>
    </div>`);
  return true;
}
function markUnsure(jid, sids){ S.finder[jid] = S.finder[jid] || {unsure:[]}; S.finder[jid].unsure = [...new Set([...(S.finder[jid].unsure || []), ...sids])]; }
function finishStep(jid, i){
  const j = DATA.journeys[jid]; S.done[jid] = S.done[jid] || {}; S.done[jid][j.stages[i].id] = true; touch(jid);
  logEv('stage_done');
  if(i < j.stages.length-1){ S.screen = 'step'; S.params = {id:jid, i:i+1}; } else { S.screen = 'complete'; logEv('journey_complete'); }
  save(); closeSheet(); render(true);
}

/* ---------- 2 · After "the last thing I remember": confirm the list ---------- */
let ldPending = null;
function lastDoneConfirm(jid, n){
  const j = DATA.journeys[jid]; const done = j.stages.slice(0, n);
  if(n < 2){ return false; }
  ldPending = {jid, keep: done.map(() => true)};
  const rows = () => done.map((s, k) => `<button class="choice ld-row" data-act="ldToggle" data-v="${k}" aria-pressed="${ldPending.keep[k]}"><span class="ld-box">${ldPending.keep[k] ? '✓' : ''}</span><span>${L(s.label)}</span></button>`).join('');
  ldPending.draw = () => sheet(`<h2>${t('ldTitle')}</h2><p class="lead">${t('ldSub')}</p><div class="choices">${rows()}</div>
    <button class="btn btn-primary" data-act="ldOk">${t('ldOk')}</button>`);
  ldPending.draw();
  return true;
}

/* ---------- 3 · "What does this mean?" and "I'm not sure" in the finder ---------- */
let dx = null;
function explainSheet(q){
  sheet(`<h2>${L(q.q)}</h2><div class="answer"><p>${L(q.explain || q.hint)}</p></div>
    <div class="choices">
      <button class="choice" data-act="dxAnswer" data-v="yes"><span>${q.yes ? L(q.yes) : t('yes')}</span>${chev()}</button>
      <button class="choice" data-act="dxAnswer" data-v="no"><span>${q.no ? L(q.no) : t('notYet')}</span>${chev()}</button>
      ${q.checks ? `<button class="choice" data-act="dxStart"><span>${t('stillUnsure')}</span>${chev()}</button>` : `<button class="choice" data-act="dxAnswer" data-v="unsure"><span>${t('stillUnsure')}</span>${chev()}</button>`}
    </div>`);
}
function dxSheet(){
  const j = DATA.journeys[S.params.id], q = j.finder[S.params.k || 0];
  if(!dx) dx = {k:0, yes:0, no:0};
  if(dx.k < q.checks.length){
    const c = q.checks[dx.k];
    sheet(`<span class="label">${t('dxTitle')} · ${t('dxOf')(dx.k+1, q.checks.length)}</span><h2>${L(c)}</h2>
      <div class="choices">
        <button class="choice" data-act="dxCheck" data-v="yes"><span>${t('yes')}</span>${chev()}</button>
        <button class="choice" data-act="dxCheck" data-v="no"><span>${t('no') || 'No'}</span>${chev()}</button>
        <button class="choice" data-act="dxCheck" data-v="unsure"><span>${t('notSure')}</span>${chev()}</button>
      </div>`);
    return;
  }
  const probably = dx.yes > dx.no;
  sheet(`<h2>${probably ? t('dxProbably') : t('dxProbablyNot')}</h2>
    <div class="answer"><p>${t('dxCantConfirm')}</p><p>${L(q.confirm)}</p></div>
    <div class="choices">
      ${probably ? `<button class="choice" data-act="dxAnswer" data-v="probable"><span>${t('dxTreatDone')}</span>${chev()}</button>
      <button class="choice" data-act="dxAnswer" data-v="no"><span>${t('dxTreatNot')}</span>${chev()}</button>`
      : `<button class="choice" data-act="dxAnswer" data-v="no"><span>${t('dxContinue')}</span>${chev()}</button>`}
    </div>`);
}

/* ---------- Actions ---------- */
function smartAct(act, v){
  switch(act){
    case 'jcDid': { const p = jcPending; if(!p) return true; p.miss.forEach(sid => { S.done[p.jid] = S.done[p.jid] || {}; S.done[p.jid][sid] = true; }); finishStep(p.jid, p.i); return true; }
    case 'jcNot': { const p = jcPending; if(!p) return true; const j = DATA.journeys[p.jid];
      closeSheet(); go('step', {id:p.jid, i:j.stages.findIndex(s => s.id === p.miss[0])}); toast(t('jcNotNote')); return true; }
    case 'jcUnsure': { const p = jcPending; if(!p) return true; markUnsure(p.jid, p.miss); finishStep(p.jid, p.i); return true; }
    case 'ldToggle': { ldPending.keep[+v] = !ldPending.keep[+v]; ldPending.draw(); return true; }
    case 'ldOk': { const {jid, keep} = ldPending, j = DATA.journeys[jid];
      const d = {}; keep.forEach((k, i) => { if(k) d[j.stages[i].id] = true; });
      // A gap (something unticked before something ticked) is kept as "not confirmed"
      const last = keep.lastIndexOf(true); const gaps = keep.map((k, i) => !k && i < last ? j.stages[i].id : null).filter(Boolean);
      S.done[jid] = d; S.finder[jid] = {unsure:[]}; if(gaps.length) markUnsure(jid, gaps);
      ldPending = null; closeSheet(); save(); render(true); return true; }
    case 'dxStart': dx = null; dxSheet(); return true;
    case 'explainQ': { const j = DATA.journeys[S.params.id]; explainSheet(j.finder[S.params.k || 0]); return true; }
    case 'dxCheck': dx[v === 'yes' ? 'yes' : v === 'no' ? 'no' : 'skip'] = (dx[v === 'yes' ? 'yes' : v === 'no' ? 'no' : 'skip'] || 0) + 1; dx.k++; dxSheet(); return true;
    case 'dxAnswer': { closeSheet(); dx = null;
      const id = S.params.id, k = S.params.k || 0, j = DATA.journeys[id];
      if(v === 'probable'){ markUnsure(id, [j.finder[k].stage]); answerFinder('yes'); }
      else answerFinder(v);
      return true; }
    case 'escCopy': { const txt = v; const ok = () => toast('✓ ' + t('escCopied'));
      try{ navigator.clipboard.writeText(txt).then(ok, () => toast(txt)); }catch(e){ toast(txt); } return true; }
    case 'escSent': { const jid = S.params.id; S.waiting = S.waiting || {};
      const p = (DATA.journeys[jid].problems || []).find(x => x.id === v) || curProblem;
      S.waiting[jid] = {to:(p && p.esc && p.esc.to) || 'visa', since:Date.now(), p:v}; logEv('esc_sent', {detail:v}); save(); closeSheet(); toast(t('escSentToast')); render(); return true; }
    case 'escReplied': { if(S.waiting) delete S.waiting[v]; save(); render(); return true; }
    case 'diffReport': { logEv('report_diff', {detail:(DATA.journeys[S.params.id] && S.params.i != null) ? DATA.journeys[S.params.id].stages[S.params.i].id : ''}); closeSheet(); toast(t('diffThanks')); return true; }
  }
  return false;
}
/* Runs the finder's answer, the same way tapping the button does */
function answerFinder(v){
  const b = document.createElement('button'); b.hidden = true; b.dataset.act = 'answer'; b.dataset.v = v;
  app.appendChild(b); b.click(); b.remove();
}
