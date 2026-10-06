/* =========================================================
   JOURNEY CHECK (for the Orivia team, not newcomers)
   Before a journey is called "ready", Orivia checks itself:
   no dead ends, every step has a way forward, a way out and a source.
   Open with ?qa=1, or from More when test mode is on.
   ========================================================= */
const QA_ABBR_OK = new Set(['UAE','AED','ID','UK','EU','NHS','RTA','SIM','PIN','OK','DHA','ATM','SMS','PDF','TV','ATM','GBP','USD','QR','IT','HR','DEWA','GP','NI','ICT','CV','A&E']);
function qaText(o){
  const out = [];
  const walk = x => { if(!x) return; if(typeof x === 'string') return; if(Array.isArray(x)) return x.forEach(walk);
    if(typeof x === 'object'){ if(typeof x.en === 'string') out.push(x.en); Object.entries(x).forEach(([k, y]) => { if(k !== 'en' && k !== 'ar') walk(y); }); } };
  walk(o); return out.join(' ');
}
function journeyQA(jid){
  const j = DATA.journeys[jid], checks = [];
  const add = (group, label, pass, detail='') => checks.push({group, label, pass:!!pass, detail});
  const probs = j.problems || [], pids = new Set(probs.map(p => p.id));
  const termWords = new Set(Object.values(TERMS).flatMap(t => t.match.map(m => m.toLowerCase())));

  add('Journey', 'Has a clear end state', j.end || j.doneTitle);
  add('Journey', 'Has official sources', (j.sources || (j.source ? [j.source] : [])).length);
  const due = typeof reviewDue === 'function' ? reviewDue(j) : null;
  add('Journey', 'Sources checked in the last 90 days', j.checked && (!due || due > new Date()), j.checked ? L(j.checked) : 'no date');
  add('Journey', '“Something else” always reaches a person', pids.has('else'));
  add('Journey', '“They told me something different” is covered', pids.has('differ'));
  (j.finder || []).forEach(f => {
    if(f.noUnsure) return;
    add('Questions', `“${f.q.en}” explains itself`, f.explain || f.hint);
    add('Questions', `“${f.q.en}” handles “I’m not sure”`, f.checks && f.confirm);
  });

  j.stages.forEach((s, i) => {
    const name = s.label.en, txt = qaText(s.blocks) + ' ' + qaText(s.title);
    const inPerson = s.appt || /\b(go to|bring|collect|appointment|in person|at the (clinic|centre|desk|office))\b/i.test(txt);
    add(name, 'Says what comes next', s.now || i === j.stages.length - 1);
    const help = s.help || [];
    add(name, 'Has “I need help” answers', help.length, help.filter(h => !pids.has(h)).map(h => 'missing: ' + h).join(', '));
    add(name, 'Has a “Show this to staff” question', s.staff);
    if(inPerson){
      add(name, 'Before you go: what to bring', s.need);
      add(name, 'What happens there', s.expect);
    }
    if(s.wait || /\bwait/i.test(txt)) add(name, 'Waiting: says what you’re waiting for', s.wait);
    let plain = txt; Object.values(TERMS).forEach(tm => tm.match.forEach(m => { plain = plain.split(m).join(' '); }));
    const abbr = [...new Set((plain.match(/\b[A-Z]{2,}\b/g) || []))].filter(a => !QA_ABBR_OK.has(a) && !termWords.has(a.toLowerCase()));
    add(name, 'Every abbreviation is explained', !abbr.length, abbr.join(', '));
  });

  probs.forEach(p => {
    const name = 'Help: ' + p.q.en;
    add(name, 'Has an answer', p.a || p.guide || p.branch);
    const a = p.a ? p.a.en : '';
    const asks = /\b(ask|contact|tell|email|call)\b.*\b(office|university|employer|sponsor|landlord|bank|team)\b/i.test(a);
    if(asks && p.id !== 'else') add(name, 'Says who, why, what to say and how', p.esc || /\d{3}/.test(a));
    if(/try again\.?$/i.test(a.trim())) add(name, 'Doesn’t end at “try again”', p.esc || p.guide);
  });
  const passed = checks.filter(c => c.pass).length;
  return {score: Math.round(passed / checks.length * 100), passed, total: checks.length, checks};
}
function qaSheet(jid){
  if(!jid){
    const rows = Object.keys(DATA.journeys).map(id => ({id, r:journeyQA(id)})).sort((a, b) => a.r.score - b.r.score);
    sheet(`<h2>Journey check</h2><p class="lead">How hard it is to get stuck in each journey. Fix the lowest first.</p>
      <div class="choices">${rows.map(x => `<button class="choice" data-act="qaOpen" data-v="${x.id}"><span class="main"><span>${L(DATA.journeys[x.id].title)}</span><small>${x.r.passed}/${x.r.total} checks · ${DATA.journeys[x.id].city}</small></span><span class="pill ${x.r.score >= 90 ? 'pill-ok' : 'pill-soon'}">${x.r.score}%</span></button>`).join('')}</div>
      <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`, true);
    return;
  }
  const r = journeyQA(jid), fails = r.checks.filter(c => !c.pass);
  sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="qaOpen" data-v="">${chev()}All journeys</button></div>
    <h2>${L(DATA.journeys[jid].title)}</h2>
    <p class="lead"><b>Journey integrity: ${r.score}%</b> · ${r.passed} of ${r.total} checks pass</p>
    ${fails.length ? `<ul class="blk-list qa-fails">${fails.map(c => `<li><b>${c.group}</b>: ${c.label}${c.detail ? ` <small>(${c.detail})</small>` : ''}</li>`).join('')}</ul>` : '<p>No gaps found.</p>'}
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`, true);
}
function qaAct(act, v){ if(act === 'qaOpen'){ qaSheet(v); return true; } return false; }

if(/[?&]qa=1/.test(location.search)) window.addEventListener('load', () => setTimeout(() => qaSheet(), 400));
