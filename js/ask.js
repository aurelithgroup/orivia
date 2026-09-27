/* =========================================================
   ASK ORIVIA
   Answers only from Orivia's own checked content (steps, help answers, places).
   It knows the user's context (journey + stage) and ranks those answers first.
   If nothing matches well, it says so and shows who can help: it never makes things up.
   An AI model could later sit behind askRemote(); the same context is ready to send.
   Loaded before app.js; uses app.js globals at call time.
   ========================================================= */
Object.assign(UI.en, {
  askTitle:'Ask Orivia', askPh:'Type what happened, in your own words', askHint:'Orivia only answers from information it has checked.',
  askNone:'Orivia doesn’t have a checked answer for that yet.', askWho:'These can help', askLooking:'Looking first in',
  askBest:'Best matches', askTypeProblem:'Help answer', askTypeStep:'Step', askTypePlace:'Place', orPick:'Or pick what happened',
  askEntry:'Ask a question', askTry:'Try: “I lost my card” or “where do I go?”',
});
Object.assign(UI.ar, {
  askTitle:'اسأل أوريفيا', askPh:'اكتب ما حدث بكلماتك', askHint:'لا تجيب أوريفيا إلا من معلومات تم التحقق منها.',
  askNone:'لا تملك أوريفيا إجابة موثّقة عن هذا بعد.', askWho:'هؤلاء يمكنهم المساعدة', askLooking:'نبحث أولاً في',
  askBest:'أفضل النتائج', askTypeProblem:'إجابة مساعدة', askTypeStep:'خطوة', askTypePlace:'مكان', orPick:'أو اختر ما حدث',
  askEntry:'اطرح سؤالاً', askTry:'جرّب: «أضعت بطاقتي» أو «إلى أين أذهب؟»',
});

/* Words people use vs words in the content */
const SYN = [
  ['fingerprint','fingerprints','biometric','biometrics'], ['id','eid','emirates'], ['doctor','gp','clinic','practice','surgery'],
  ['lost','lose','missing','forgot','gone'], ['late','slow','delayed','waiting','long','ages'], ['appointment','appt','booking','slot'],
  ['money','fee','fees','charge','charged','cost','pay','paid','price'], ['card','nol','ridacard','ticket'], ['sick','ill','unwell','pain','hurt','injury','injured'],
  ['house','flat','apartment','home','room','rent','landlord','tenancy'], ['bank','account','debit'], ['scam','fraud','fake','suspicious'],
  ['visa','permit','residence','evisa','status'], ['job','work','working','hours','employer'], ['train','metro','tram','bus'], ['police','crime','stolen','theft'], ['hospital','infirmary','a&e','ae','emergency'],
  ['بطاقة','بطاقتي'], ['بصمات','البصمات','بصمة'], ['طبيب','دكتور','عيادة'], ['موعد','الموعد'], ['أضعت','ضاع','فقدت','مفقود'], ['هوية','الهوية'],
];
const SYNMAP = {}; SYN.forEach(g => g.forEach(w => SYNMAP[w] = g[0]));
const STOP = new Set('the a an i my me to of and or in on at is it for with do does did i’m im what how where why when can you your this that they them be been was are not no have has had said say says just got get there here ive its please help need want'.split(' '));
function norm(s){
  return String(s||'').toLowerCase()
    .replace(/<[^>]+>/g,' ').replace(/['’‘`]/g,'')
    .replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
    .normalize('NFD').replace(/[̀-ͯ]/g,'');
}
function toks(s){
  return norm(s).split(/[^\p{L}\p{N}]+/u).filter(w => w && w.length > 1 && !STOP.has(w))
    .map(w => SYNMAP[w] || SYNMAP[w.replace(/s$/,'')] || (w.length > 4 ? w.replace(/(ing|ed|es|s)$/,'') : w));
}
let ASK_INDEX = null, ASK_LANG = null;
function askIndex(){
  if(ASK_INDEX && ASK_LANG === lang()) return ASK_INDEX;
  const rows = [];
  const both = o => o ? (L(o) + ' ' + (o.en||'')) : '';
  Object.entries(DATA.journeys).forEach(([jid, j]) => {
    const stageOf = pid => j.stages.find(s => (s.help||[]).includes(pid));
    j.stages.forEach((s, i) => {
      const txt = [both(s.title), both(s.label), ...(s.blocks||[]).map(b => Array.isArray(b.v) ? b.v.map(x => both(x.name||x) + ' ' + both(x.desc)).join(' ') : both(b.v)), ...(s.need||[]).map(x=>both(x.v))].join(' ');
      rows.push({type:'step', jid, sid:s.id, i, city:j.city, title:L(s.title), sub:L(j.title), text:txt, head:both(s.title)+' '+both(s.label)});
    });
    (j.problems||[]).forEach(p => {
      if(p.id === 'else') return;
      const st = stageOf(p.id);
      const ans = p.a ? both(p.a) : p.guide ? both(p.guide.calm) + ' ' + p.guide.steps.map(g=>both(g.title)+' '+both(g.body)).join(' ') : p.branch ? p.branch.options.map(o=>both(o.label)+' '+both(o.a)).join(' ') : '';
      rows.push({type:'problem', jid, pid:p.id, sid:st && st.id, i: st ? j.stages.indexOf(st) : 0, city:j.city, title:L(p.q), sub:L(j.title), text:both(p.q)+' '+ans, head:both(p.q), snippet: p.a ? L(p.a) : p.guide ? L(p.guide.calm) : ''});
    });
  });
  Object.entries(PLACES).forEach(([id, p]) => rows.push({type:'place', place:id, city:p.city, title:L(p.name), sub:p.address, text:both(p.name)+' '+both(p.for)+' '+p.address, head:both(p.name)}));
  rows.forEach(r => { r.tk = toks(r.text); r.hk = new Set(toks(r.head)); r.tf = {}; r.tk.forEach(w => r.tf[w] = (r.tf[w]||0) + 1); });
  const df = {}; rows.forEach(r => new Set(r.tk).forEach(w => df[w] = (df[w]||0) + 1));
  rows.forEach(r => r.df = df); ASK_INDEX = rows; ASK_LANG = lang();
  return rows;
}
/* Context-aware ranking: exact words, weighted by rarity, boosted for the user's current journey and stage */
function askSearch(q, cx){
  const qt = [...new Set(toks(q))]; if(!qt.length) return [];
  const rows = askIndex(), N = rows.length;
  return rows.filter(r => r.city === S.city).map(r => {
    let sc = 0, hits = 0;
    qt.forEach(w => { const tf = r.tf[w] || 0; if(!tf) return; hits++; const idf = Math.log(1 + N / (r.df[w]||1));
      sc += idf * (1 + Math.log(tf)) * (r.hk.has(w) ? 2.2 : 1); });
    if(!hits) return null;
    sc *= (hits / qt.length) ** 1.2;
    if(r.type === 'problem') sc *= 1.35;
    if(cx && cx.jid === r.jid) sc *= 1.6;
    if(cx && cx.sid && cx.sid === r.sid) sc *= 1.5;
    return Object.assign({score:sc, cover:hits/qt.length}, r);
  }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,4);
}
function askContext(){
  if(S.screen === 'step' && S.params.id) return {jid:S.params.id, sid:DATA.journeys[S.params.id].stages[S.params.i].id};
  if(S.screen === 'journey' && S.params.id) return {jid:S.params.id};
  const a = activeJourneys()[0]; if(a){ const c = ctx(a); return {jid:a, sid:c.stage && c.stage.id}; }
  return null;
}
function askResultsHtml(q){
  const cx = askContext(), res = askSearch(q, cx);
  const good = res.filter(r => r.score > 2.2 && r.cover >= .6);
  if(!q.trim()) return `<p class="ask-try">${t('askTry')}</p>`;
  if(!good.length){
    clearTimeout(window.__askNone); window.__askNone = setTimeout(() => logEv('ask_none'), 1500);
    const j = cx && DATA.journeys[cx.jid];
    const cards = (j && j.stuck && j.stuck.cards) || [];
    const els = j && (j.problems||[]).find(p=>p.id==='else');
    return `<div class="ask-none"><strong>${t('askNone')}</strong><span class="label">${t('askWho')}</span>
      ${partnerCard()}
      ${els && els.a ? `<div class="answer"><p>${L(els.a)}</p></div>` : ''}
      ${cards.map(c=>`<div class="help-card"><strong>${L(c.title)}</strong>${c.phone?`<a class="phone" dir="ltr" href="tel:${c.phone.replace(/\s/g,'')}">${c.phone}</a>`:''}<p>${L(c.body)}</p></div>`).join('')}
      ${emergencyBox()}
      <div class="help-card"><strong>${t('showThis')}</strong><div class="phrase">${staffInner({en:UI.en.helpPhrase, ar:UI.ar.helpPhrase, mine:t('helpPhrase')})}</div></div></div>`;
  }
  const typeName = {problem:t('askTypeProblem'), step:t('askTypeStep'), place:t('askTypePlace')};
  return `<span class="label">${t('askBest')}</span><div class="choices">${good.map(r => `
    <button class="choice ask-hit" data-act="askGo" data-v="${r.type}|${r.jid||''}|${r.sid||''}|${r.pid||r.place||''}">
      <span class="main"><span class="ask-type">${typeName[r.type]}${r.jid ? ' · ' + esc(r.sub) : ''}</span><span>${esc(r.title)}</span>${r.snippet ? `<small>${esc(r.snippet.slice(0,140))}${r.snippet.length>140?'…':''}</small>` : ''}</span>${chev()}</button>`).join('')}</div>`;
}
function askSheet(prefill){
  const cx = askContext();
  const where = cx ? L(DATA.journeys[cx.jid].title) + (cx.sid ? ' · ' + L(DATA.journeys[cx.jid].stages.find(s=>s.id===cx.sid).label) : '') : '';
  sheet(`<h2>${t('askTitle')}</h2>
    ${where ? `<span class="ask-ctx">${t('askLooking')}: <b>${esc(where)}</b></span>` : ''}
    <input id="askQ" class="field" type="search" dir="auto" autocomplete="off" enterkeyhint="search" placeholder="${t('askPh')}" value="${esc(prefill||'')}">
    <span class="need-hint">${t('askHint')}</span>
    <div id="askOut">${askResultsHtml(prefill||'')}</div>
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`, true);
  const i = document.getElementById('askQ'); if(i){ i.focus(); }
  logEv('ask_open');
}
let askTimer = null;
function askInput(v){
  document.getElementById('askOut').innerHTML = askResultsHtml(v);
  clearTimeout(askTimer); askTimer = setTimeout(() => { if(v.trim().length > 2){ logEv('ask_query', {detail:v.trim().slice(0,80)}); save(); } }, 1500);
}
function askGo(v){
  const [type, jid, sid, x] = v.split('|');
  closeSheet(); logEv('ask_pick', {detail:v});
  if(type === 'place'){ sheet(`${placeCard(x)}<button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`); return; }
  const j = DATA.journeys[jid], i = Math.max(0, j.stages.findIndex(s=>s.id===sid));
  touch(jid);
  if(!(S.screen === 'step' && S.params.id === jid && S.params.i === i)) go('step', {id:jid, i});
  if(type === 'problem'){ S.lastProblem = {j:jid, p:x}; wrongSheet(x); }
}
/* Search box at the top of the "I need help" sheet */
function helpSearchHtml(){
  return `<button class="ask-inline" data-act="askOpen">${svg('help','help-ico')}<span>${t('askPh')}</span></button><span class="label">${t('orPick')}</span>`;
}
