/* =========================================================
   ORIVIA
   The app is a small "journey engine": screens are generic,
   and everything city-specific lives in the DATA below.
   Adding a city or a journey = adding data, not new screens.
   ========================================================= */

const ICONS = {
  housing:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  health:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
  money:'<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20M6 15h4"/>',
  docs:'<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17c1.2-2 6.8-2 8 0"/>',
  move:'<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M9 21l1.5-4M15 21l-1.5-4"/><path d="M9 13.5h.01M15 13.5h.01" stroke-width="3"/>',
  work:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  edu:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  life:'<path d="M3 4h2l2.5 11h11L21 8H7"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  community:'<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 20c1-4 11-4 12 0M10 20c1-4 11-4 12 0"/>',
  unsure:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
  alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5h.01"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  speaker:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  stopsq:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
  help:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',
  arrow:'<path d="M4 12h15M13 6l6 6-6 6"/>'
};
Object.assign(ICONS, window.EXTRA_ICONS || {});
const svg = (k, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

/* ---------- State ---------- */
const KEY = 'orivia-proto-v1';
const FRESH = () => ({city:'dubai', lang:null, purpose:null, done:{}, finder:{}, checks:{}, stuck:{}, touched:{}, recent:[], log:[], screen:'welcome', params:{}, history:[]});
let S = FRESH();
try{ const s = JSON.parse(localStorage.getItem(KEY)||'null'); if(s) S = Object.assign(S, s); }catch(e){}
S.finder = S.finder || {}; S.checks = S.checks || {}; S.stuck = S.stuck || {};
const QS = new URLSearchParams(location.search);
if(QS.get('city') && DATA.cities[QS.get('city')]) S.city = QS.get('city');
if(location.hash === '#edinburgh') S.city = 'edinburgh';
if(location.hash === '#dubai') S.city = 'dubai';
const save = () => { try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} };

const app = document.getElementById('app');
const lang = () => S.lang || 'en';
/* Languages: English and Arabic live in content.js; other languages are
   translation tables in js/i18n/<code>.js, keyed by the English text.
   Anything missing falls back to English. */
window.I18N = window.I18N || {};
const RTL = ['ar','ur'];
/* A language is offered once its translation file has loaded */
DATA.languages.forEach(l => { if(I18N[l.code]){ l.ready = true; l.beta = true; } });
const isRtl = l => RTL.includes(l);
const isBeta = () => !['en','ar'].includes(lang());
readDeepLink();
const langName = code => (DATA.languages.find(x=>x.code===code) || {}).name || code;
const t = k => { const l = lang(); const tr = I18N[l] && I18N[l].ui;
  if(UI[l] && UI[l][k] !== undefined) return UI[l][k];
  if(tr && tr[k] !== undefined) return tr[k];
  return UI.en[k]; };
const L = o => { if(!o) return ''; const l = lang(); if(o[l]) return o[l];
  const tr = I18N[l] && I18N[l].t; if(tr && o.en && tr[o.en]) return tr[o.en]; return o.en || ''; };
function langSheet(){
  sheet(`<h2>${t('chooseLang')}</h2><div class="choices">${DATA.languages.map(x => x.ready
    ? `<button class="choice" data-act="setLang" data-v="${x.code}" lang="${x.code}" ${isRtl(x.code)?'dir="rtl"':''} aria-pressed="${lang()===x.code}"><span class="lang-name">${x.name}</span>${x.beta?`<span class="pill pill-soon">${t('betaTr')}</span>`:''}</button>`
    : `<button class="choice" disabled lang="${x.code}"><span class="lang-name">${x.name}</span><span class="pill pill-soon">${t('soon')}</span></button>`).join('')}</div>
    <p class="disclaimer">${t('betaTrNote')}</p>`);
}

/* Navigation. Each screen change also adds a browser history entry, so the phone's
   back gesture/button works too (important when Orivia is saved to the home screen). */
let navDepth = 0;
function go(screen, params={}){
  S.history.push({screen:S.screen, params:S.params}); S.screen = screen; S.params = params; save(); render(true);
  try{ history.pushState({orivia:true}, ''); navDepth++; }catch(e){}
}
function parentOf(){
  if(S.screen === 'step' || S.screen === 'complete') return {screen:'journey', params:{id:S.params.id}};
  if(S.screen === 'hub') return {screen:'welcome', params:{}};
  if(S.screen === 'needs' && hasHub()) return {screen:'hub', params:{}};
  if(S.screen === 'needs' || S.screen === 'purpose') return {screen:'welcome', params:{}};
  return {screen: S.lang ? 'needs' : 'welcome', params:{}};
}
function back(){
  const p = S.history.pop() || parentOf();
  S.screen = p.screen; S.params = p.params; save(); render(true);
}
function goBack(){ if(navDepth > 0){ history.back(); } else { back(); } }
window.addEventListener('popstate', () => {
  navDepth = Math.max(0, navDepth - 1);
  if(document.getElementById('sheet')){ closeSheet(); try{ history.pushState({orivia:true}, ''); navDepth++; }catch(e){} return; }
  if(S.screen !== 'welcome') back();
});
function home(){ S.history = []; S.screen = S.lang ? (hasHub() ? 'hub' : 'needs') : 'welcome'; S.params = {}; save(); render(true); }

/* ---------- Pieces ---------- */
const topbar = () => `
  <header class="topbar">
    <div class="top-left">
    ${S.screen !== 'welcome' ? `<button class="top-back" data-act="back" aria-label="${t('back')}">${svg('chev','chev back-chev')}</button>` : ''}
    <button class="brand" data-act="home" aria-label="Orivia, ${t('home')}">
      <svg class="brand-mark" viewBox="0 0 306 310" aria-hidden="true"><path fill="currentColor" d="M0 0 L0 168 C0 248 60 302 136 308 L136 160 C136 70 78 4 0 0 Z"/><path fill="var(--amber)" d="M160 308 L160 190 C160 108 222 44 306 40 L306 172 C306 254 240 302 160 308 Z"/></svg>
      <span class="wordmark">ORIVIA</span>
    </button>
    </div>
    <div class="top-actions">
      ${S.lang && isBeta() ? `<span class="badge beta-tr" title="${t('betaTrNote')}">${t('betaTr')}</span>` : `<span class="badge">${t('proto')}</span>`}
      ${S.lang ? `<button class="lang-toggle" data-act="langPicker" aria-label="${t('chooseLang')}: ${langName(lang())}">${svg('globe','globe')}<span>${lang().toUpperCase()}</span></button>` : ''}
    </div>
  </header>`;

const sign = ({eyebrow='', title, sub='', icon=''}) => `
  <div class="sign">
    ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}
    <div class="sign-row">${icon ? `<span class="sign-icon">${svg(icon)}</span>` : ''}<h1>${title}</h1></div>
    ${sub ? `<p>${sub}</p>` : ''}
  </div>`;

const chev = () => svg('chev','chev');

/* ---------- Screens ---------- */
const SCREENS = {
  welcome(){
    const c = DATA.cities[S.city];
    return {
      body:`
        <div class="hero-sign">
          <span class="kick">${L(c.kicker)}</span>
          <h1>${L(c.title)}</h1>
          <p>${L(c.sub)}</p>
          <div class="arrow-row">${svg('arrow')}</div>
        </div>
        <div class="content">
          <span class="label">${t('chooseLang')}</span>
          <div class="choices">
            ${DATA.languages.map(l => l.ready
              ? `<button class="choice" data-act="lang" data-v="${l.code}" lang="${l.code}" ${isRtl(l.code)?'dir="rtl"':''}><span class="lang-name">${l.name}</span>${l.beta?`<span class="pill pill-soon">${t('betaTr')}</span>`:chev()}</button>`
              : `<button class="choice" disabled lang="${l.code}"><span class="lang-name">${l.name}</span><span class="pill pill-soon">${t('soon')}</span></button>`).join('')}
          </div>
          <p class="disclaimer">${t('disclaimer')}</p>
        </div>`,
      actions:''
    };
  },
  purpose(){
    return {
      body: sign({eyebrow:L(DATA.cities[S.city].kicker), title:t('purposeTitle'), sub:t('purposeSub')}) + `
        <div class="content"><div class="choices">
          ${t('purposes').map((p,i)=>`<button class="choice" data-act="purpose" data-v="${i}" aria-pressed="${S.purpose==i}">${p}</button>`).join('')}
        </div></div>`,
      actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button><button class="btn btn-primary" data-act="go" data-v="needs">${S.purpose==null ? t('skip') : t('cont')} ${chev()}</button>`
    };
  },
  needs(){
    const city = S.city;
    const tile = n => {
      const ready = !!DATA.tasks[`${city}.${n.id}`];
      return `<button class="tile ${ready?'ready':''}" data-act="need" data-v="${n.id}">${svg(n.icon)}<span class="t">${L(n.name)}</span><span class="s">${ready ? t('ready') : t('inFull')}</span></button>`;
    };
    const hasWeek = !!DATA.firstWeek[city];
    return {
      body: sign({eyebrow:t('needsEyebrow'), title:t('needsTitle'), sub:t('needsSub')}) + `
        <div class="content">
          ${hasHub() ? `<button class="choice hub-link" data-act="home"><span class="main"><span>${t('yourJourneys')}</span><small>${(()=>{ const c = ctx(activeJourneys()[0]); return L(c.journey.title) + ' · ' + t('stepsDone')(c.done,c.total); })()}</small></span>${chev()}</button>` : ''}
          ${!hasWeek ? `<div class="tip">${t('cityClosed')}</div>` : ''}
          <div class="grid">
            ${DATA.needs.map(tile).join('')}
            <button class="tile wide ${hasWeek?'ready':''}" data-act="unsure">${svg('unsure')}<span class="t">${t('dontKnowStart')}</span><span class="s">${hasWeek ? chev() : t('inFull')}</span></button>
          </div>
        </div>`,
      actions:''
    };
  },
  tasks(){
    const need = DATA.needs.find(n => n.id === S.params.need);
    const list = DATA.tasks[`${S.city}.${need.id}`] || [];
    return {
      body: sign({eyebrow:L(need.name), title:t('tasksAsk'), icon:need.icon}) + `
        <div class="content">${need.id==='health' ? emergencyBox() : ''}<div class="choices">
          ${list.length ? list.map(x => (x.journey || x.pathway)
            ? `<button class="choice" data-act="${x.pathway?'pathway':'journey'}" data-v="${x.pathway||x.journey}"><span class="main"><span>${L(x.name)}</span><small>${L(x.note)}</small></span>${x.pathway ? pathPill(x.pathway) : progressPill(x.journey)}</button>`
            : `<button class="choice" disabled><span>${L(x.name)}</span><span class="pill pill-soon">${t('soon')}</span></button>`).join('')
            : `<div class="tip">${t('inFull')}</div>`}
        </div></div>`,
      actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button>`
    };
  },
  unsure(){
    const list = DATA.firstWeek[S.city];
    if(!list) return {body: sign({title:t('weekTitle')}) + `<div class="content"><div class="tip">${t('cityClosed')}</div></div>`, actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button>`};
    return {
      body: sign({eyebrow:L(DATA.cities[S.city].kicker), title:t('weekTitle'), sub:t('weekSub'), icon:'unsure'}) + `
        <div class="content"><ol class="line">
          ${list.map((x,i) => `<li class="station ${x.journey && isDone(x.journey)?'done':''} ${i===0?'current':''}"><span class="dot"></span>
            <button ${x.journey?`data-act="journey" data-v="${x.journey}"`:x.pathway?`data-act="pathway" data-v="${x.pathway}"`:'disabled'}>
              <span class="main" style="display:flex;flex-direction:column"><span class="n">${i+1}</span><span class="nm">${L(x.name)}</span></span>
              ${x.journey ? progressPill(x.journey) : x.pathway ? pathPill(x.pathway) : `<span class="pill pill-soon">${t('soon')}</span>`}
            </button></li>`).join('')}
        </ol></div>`,
      actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button>`
    };
  },
  pathway(){
    const pw = DATA.pathways[S.params.id];
    return {
      body: sign({eyebrow:t('finderEyebrow'), title:L(pw.title), sub:L(pw.sub), icon:pw.icon||'docs'}) + `
        <div class="content"><div class="choices">
          ${pw.options.map((o,i)=> o.journey
            ? `<button class="choice" data-act="pathOpt" data-v="${o.journey}"><span>${L(o.name)}</span>${chev()}</button>`
            : `<button class="choice" disabled><span>${L(o.name)}</span><span class="pill pill-soon">${t('soon')}</span></button>`).join('')}
          <button class="choice" data-act="dontKnow"><span>${t('dontKnow')}</span>${chev()}</button>
        </div>
        <p class="disclaimer">${t('privacy')}</p></div>`,
      actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button>`
    };
  },
  finder(){
    const j = DATA.journeys[S.params.id];
    if(S.params.mode === 'last' && j.lastDone){
      const ld = j.lastDone;
      return {
        body: sign({eyebrow:t('finderEyebrow'), title:L(ld.q), sub:L(ld.sub)}) + `
          <div class="content"><div class="choices">
            ${ld.options.map((o,i)=>`<button class="choice" data-act="lastAns" data-v="${i}"><span>${L(o.v)}</span>${chev()}</button>`).join('')}
            <button class="choice" data-act="lastUnknown"><span class="main"><span>${L(ld.dontKnow)}</span><small>${L(ld.dontKnowSub)}</small></span>${chev()}</button>
          </div>
          <p class="disclaimer">${t('privacy')}</p></div>`,
        actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button>`
      };
    }
    const k = S.params.k || 0, q = j.finder[k];
    const ticks = j.finder.map((_,i)=>`<i class="${i<k?'ok':i===k?'on':''}"></i>`).join('');
    const opt = (v,label) => `<button class="choice" data-act="answer" data-v="${v}"><span>${label}</span>${chev()}</button>`;
    return {
      body: `<div class="sign">
          <span class="stepnav"><span class="ticks" aria-hidden="true">${ticks}</span><span>${t('qOf')(k+1, j.finder.length)}</span></span>
          <span class="eyebrow">${t('finderEyebrow')}</span>
          <h1>${L(q.q)}</h1>
          ${q.hint ? `<p>${L(q.hint)}</p>` : ''}
        </div>
        <div class="content"><div class="choices">
          ${opt('yes', q.yes ? L(q.yes) : t('yes'))}
          ${opt('no', q.no ? L(q.no) : t('notYet'))}
          ${q.noUnsure ? '' : opt('unsure', q.unsureLabel ? L(q.unsureLabel) : t('notSure'))}
        </div>
        <p class="disclaimer">${t('privacy')}</p></div>`,
      actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button>`
    };
  },
  journey(){
    const j = DATA.journeys[S.params.id];
    const done = S.done[S.params.id] || {};
    const n = j.stages.filter(s => done[s.id]).length, total = j.stages.length;
    const cur = j.stages.findIndex(s => !done[s.id]);
    return {
      body: sign({eyebrow: j.finder ? t('hereEyebrow') : t('journey'), title:L(j.title), icon:j.icon||'move'}) + `
        <div class="content">
          ${j.finder && (S.finder[S.params.id]||{}).unsure && (S.finder[S.params.id].unsure.length) ? `<div class="tip warn-tip"><b>${t('important')}</b>${t('unsureNote')}</div>` : ''}
          <div class="progress">
            <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${n}"><i style="width:${n/total*100}%"></i></div>
            <div class="progress-text"><span>${t('stepsDone')(n,total)}</span>${n?`<span>${t('saved')}</span>`:''}</div>
          </div>
          ${j.finder && cur>=0 && j.stages[cur].now ? `<div class="now-box"><span class="label">${t('youAreHere')}: ${L(j.stages[cur].label)}</span><p>${L(j.stages[cur].now)}</p></div>` : ''}
          ${saveCard()}
          <ol class="line">
            ${j.stages.map((s,i)=>`<li class="station ${done[s.id]?'done':''} ${i===cur?'current':''}"><span class="dot"></span>
              <button data-act="step" data-v="${i}"><span style="display:flex;flex-direction:column"><span class="n">${i+1} · ${L(s.label)}</span><span class="nm">${L(s.title)}</span><span class="chips">${j.finder && i===cur ? `<span class="pill pill-amber">${t('youAreHere')}</span>` : ''}${chip(s)}</span></span>${chev()}</button></li>`).join('')}
          </ol>
          ${j.finder ? `<button class="linkish" style="align-self:flex-start" data-act="redo">${t('redo')}</button>` : ''}
          ${sourceBlock(j)}
        </div>`,
      actions:`<button class="btn btn-quiet" data-act="back">${t('back')}</button>
        ${n===total ? `<button class="btn btn-primary" data-act="restartJ">${t('restart')}</button>`
          : `<button class="btn btn-primary" data-act="step" data-v="${Math.max(cur,0)}">${j.finder ? t('startHere') : n?t('resume'):t('start')} ${chev()}</button>`}`
    };
  },
  step(){
    const j = DATA.journeys[S.params.id], i = S.params.i, s = j.stages[i];
    const done = S.done[S.params.id] || {};
    const ticks = j.stages.map((x,k)=>`<i class="${k===i?'on':done[x.id]?'ok':''}"></i>`).join('');
    return {
      body: `<div class="sign">
          <span class="stepnav"><span class="ticks" aria-hidden="true">${ticks}</span><span>${t('stepOf')(i+1,j.stages.length)} · ${L(s.label)}</span></span>
          <h1>${L(s.title)}</h1>
          <div class="sign-tools">${chip(s,true)}${listenBtn()}</div>
        </div>
        <div class="content">
          ${s.blocks.filter(b => !(s.need && b.t==='tip' && b.label==='bring')).map(block).join('')}
          ${apptBox(S.params.id, s)}
          ${needBox(S.params.id, s)}
          ${placesBox(s)}
          ${sourceBlock(j, s)}
        </div>`,
      actions:`<button class="btn btn-help" data-act="wrong">${svg('help','help-ico')}<span>${t('wrong')}</span></button>
        <button class="btn btn-primary" data-act="stepDone">${i===j.stages.length-1 ? t('finish') : t('next')} ${chev()}</button>`
    };
  },
  complete(){
    const j = DATA.journeys[S.params.id];
    return {
      body: `<div class="content">
          <div class="done-hero"><span class="big"></span><span class="label">${t('doneEyebrow')}</span><h1 style="font-family:var(--display);font-stretch:85%;font-weight:800;font-size:30px">${j.doneTitle ? L(j.doneTitle) : t('doneTitle')}</h1>
          <p class="lead">${L(j.title)}</p></div>
          <span class="label">${t('nextUp')}</span>
          <div class="choices">${j.after.map(x=> x.journey ? `<button class="choice" data-act="journey" data-v="${x.journey}"><span>${L(x.name)}</span>${chev()}</button>`
            : x.pathway ? `<button class="choice" data-act="pathway" data-v="${x.pathway}"><span>${L(x.name)}</span>${chev()}</button>`
            : `<button class="choice" disabled><span>${L(x.name)}</span><span class="pill pill-soon">${t('soon')}</span></button>`).join('')}</div>
        </div>`,
      actions:`<button class="btn btn-quiet" data-act="journey" data-v="${S.params.id}">${t('journey')}</button><button class="btn btn-primary" data-act="home">${t('home')}</button>`
    };
  }
};

SCREENS.hub = hubScreen;

function block(b){
  const j = DATA.journeys[S.params.id];
  switch(b.t){
    case 'p': return `<p class="blk-p">${L(b.v)}</p>`;
    case 'list': return `<ul class="blk-list">${b.v.map(x=>`<li>${L(x)}</li>`).join('')}</ul>`;
    case 'steps': return `<ol class="blk-steps">${b.v.map(x=>`<li><span>${L(x)}</span></li>`).join('')}</ol>`;
    case 'tip': return `<div class="tip"><b>${t(b.label||'tip')}</b>${L(b.v)}</div>`;
    case 'cards': return `<div class="cards">${b.v.map(c=>`<div class="card ${c.rec?'rec':''}"><div class="card-head"><span class="swatch" style="background:${c.color}"></span><strong>${L(c.name)}</strong>${c.rec?`<span class="pill pill-amber">${t('recommended')}</span>`:''}</div><p>${L(c.desc)}</p></div>`).join('')}</div>`;
    case 'emergency': return emergencyBox();
    case 'phraseCard': return phraseHtml({phrase:b.v});
    case 'journeyLink': { const lj = DATA.journeys[b.journey] || {}; const viaPath = !!(lj.finder && lj.pathway);
      return `<button class="choice jlink" data-act="${viaPath ? 'pathway' : 'journey'}" data-v="${viaPath ? lj.pathway : b.journey}"><span>${L(b.v)}</span>${chev()}</button>`; }
    case 'link': return `<a class="btn btn-quiet linkbtn" href="${b.url}" target="_blank" rel="noopener">${L(b.v)} ${chev()}</a>`;
    case 'phrase': return `<div class="tip"><b>${t('tip')}</b>${t('lostAsk')} <button class="linkish" data-act="phrase">${t('phraseBtn')}</button></div>`;
  }
  return '';
}
function trustOf(j, s){
  const official = !!(s && s.level === 'source');
  const tr = j.trust || {};
  return {official, reviewed: official && !!tr.reviewed, tested: tr.tested || 0};
}
function sourceBlock(j, s){
  const tr = s ? trustOf(j, s) : null;
  const row = (on, key, label) => `<li class="${on?'here':'off'} lv-${key}"><span class="lv-dot"></span><span><strong>${label}</strong> ${t('trustDesc')[key]}</span></li>`;
  return `<div class="source">
    <span class="label">${t('howChecked')}</span>
    ${tr ? `<ol class="ladder">
      ${tr.official ? row(true,'official',t('trust').official) : row(true,'draft',t('trust').draft)}
      ${row(tr.reviewed,'reviewed',t('trust').reviewed)}
      ${row(tr.tested>0,'tested',tr.tested ? t('trust').tested(tr.tested) : t('trust').testedNone)}
    </ol>` : ''}
    ${j.sources ? `<span>${t('sources')}: ${j.sources.map(x=>`<a href="${x.url}" target="_blank" rel="noopener">${L(x.name)}</a>`).join(' · ')}</span><span>${t('checked')}: ${L(j.checked)}</span>`
      : `<span>${t('source')}: <a href="${j.source.url}" target="_blank" rel="noopener">${L(j.source.name)}</a> · ${t('checked')}: ${L(j.checked)}</span>`}
    <span>${t('disclaimer')}</span>
  </div>`;
}
function chip(s, onDark){
  const j = DATA.journeys[S.params.id] || {};
  const tr = trustOf(j, s);
  const one = (cls, label) => `<span class="vchip ${cls} ${onDark?'on-dark':''}"><span class="lv-dot"></span>${label}</span>`;
  if(!tr.official) return one('v-draft', t('trust').draft);
  return one('v-official', t('trust').official) + (tr.reviewed ? one('v-reviewed', t('trust').reviewed) : '') + (tr.tested ? one('v-tested', t('trust').tested(tr.tested)) : '');
}
const canSpeak = 'speechSynthesis' in window;
const listenBtn = () => canSpeak ? `<button class="listen" data-act="listen" aria-pressed="false">${svg('speaker','lic')}<span>${t('listen')}</span></button>` : '';
function readable(root){
  return [...root.querySelectorAll('h1,h3,.calm,.blk-p,.blk-list li,.blk-steps li,.card strong,.card p,.gstep > p,.tip')]
    .map(e=>e.innerText.trim()).filter(Boolean).join('. ');
}
function speak(btn){
  const ss = window.speechSynthesis;
  if(ss.speaking){ ss.cancel(); setListen(false); return; }
  const code = ({fil:'fil',tl:'fil'})[lang()] || lang();
  const voices = ss.getVoices();
  const v = voices.find(x=>x.lang && x.lang.toLowerCase().startsWith(code));
  if(voices.length && !v){ toast(t('noVoice')); return; }
  const root = document.getElementById('sheet') || document.getElementById('scroll');
  const u = new SpeechSynthesisUtterance(readable(root));
  u.lang = ({en:'en-GB',ar:'ar-AE',fr:'fr-FR',fil:'fil-PH',hi:'hi-IN',ur:'ur-PK'})[lang()] || 'en-GB'; if(v) u.voice = v; u.rate = .92;
  u.onend = u.onerror = () => setListen(false);
  ss.speak(u); setListen(true);
}
function setListen(on){
  document.querySelectorAll('.listen').forEach(b=>{ b.setAttribute('aria-pressed', on); b.innerHTML = `${svg(on?'stopsq':'speaker','lic')}<span>${on?t('stop'):t('listen')}</span>`; });
}
const isDone = id => { const j = DATA.journeys[id]; const d = S.done[id]||{}; return j.stages.every(s=>d[s.id]); };
function emergencyBox(){
  const nums = DATA.cities[S.city].emergency || [];
  return `<div class="emergency-box"><span class="label">${t('emergency')}</span>
    <div class="em-nums">${nums.map(e=>`<a href="tel:${e.num}" dir="ltr"><b>${e.num}</b><span>${e.k ? t(e.k) : L(e.label)}</span></a>`).join('')}</div></div>`;
}
function pathPill(pid){
  const opt = DATA.pathways[pid].options.find(o=>o.journey && (S.finder[o.journey] || Object.keys(S.done[o.journey]||{}).length));
  return opt ? progressPill(opt.journey) : `<span class="pill pill-ok">${t('ready')}</span>`;
}
function progressPill(id){
  const j = DATA.journeys[id], d = S.done[id]||{}, n = j.stages.filter(s=>d[s.id]).length;
  return n ? `<span class="pill pill-ok">${n}/${j.stages.length}</span>` : `<span class="pill pill-ok">${t('ready')}</span>`;
}

/* ---------- Overlays ---------- */
function sheet(html, full){
  closeSheet();
  if(canSpeak && speechSynthesis.speaking) speechSynthesis.cancel();
  const w = document.createElement('div');
  w.className = 'sheet-wrap'; w.id = 'sheet';
  w.innerHTML = `<div class="sheet ${full?'full':''}" role="dialog" aria-modal="true">${full?'':'<span class="grab"></span>'}${html}</div>`;
  w.addEventListener('click', e => { if(e.target === w) closeSheet(); });
  app.appendChild(w);
  const f = w.querySelector('button'); if(f) f.focus();
}
function dontKnowSheet(){
  const pw = DATA.pathways[S.params.id], d = pw.dontKnow;
  sheet(`<h2>${L(d.title)}</h2><ul class="blk-list">${d.items.map(x=>`<li>${L(x)}</li>`).join('')}</ul>
    <div class="tip"><b>${t('important')}</b>${L(d.tip)}</div>
    <button class="btn btn-primary" data-act="closeSheet">${t('close')}</button>`);
}
function closeSheet(){ if(canSpeak && speechSynthesis.speaking) speechSynthesis.cancel(); const s = document.getElementById('sheet'); if(s) s.remove(); }
function wrongSheet(pid){
  const j = DATA.journeys[S.params.id];
  if(!pid){
    let list = j.problems;
    const st = (S.screen==='step' && j.stages[S.params.i]) ? j.stages[S.params.i] : null;
    if(st && st.help) list = st.help.map(id=>j.problems.find(p=>p.id===id)).concat(j.problems.filter(p=>p.id==='else'));
    sheet(`<h2>${t('whatHappened')}</h2>${st && st.help ? `<span class="badge" style="align-self:flex-start">${L(st.label)}</span>` : ''}<div class="choices">${list.map(p=>`<button class="choice" data-act="problem" data-v="${p.id}"><span>${L(p.q)}</span>${chev()}</button>`).join('')}</div>
      <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
    return;
  }
  const p = j.problems.find(x=>x.id===pid);
  curProblem = p;
  if(p.guide) return guideSheet(p, 0);
  if(p.branch) return branchSheet(p);
  sheet(`<h2>${L(p.q)}</h2>
    <div class="answer"><h3>${t('tryThis')}</h3><p>${L(p.a)}</p></div>
    ${p.phrase ? phraseHtml(j) : ''}${p.phraseText ? phraseHtml({phrase:p.phraseText}) : ''}
    ${outcomeHtml(false)}`);
}

/* A guided fix: one small step per screen, calm first, a way out at the end */
let curProblem = null;
function guideSheet(p, k){
  const g = p.guide, n = g.steps.length;
  const ticks = g.steps.map((_,i)=>`<i class="${i<k?'ok':i===k?'on':''}"></i>`).join('');
  const top = `<div class="sheet-top"><button class="linkish back-link" data-act="wrong">${chev()}${t('problems')}</button></div>`;
  if(k >= n){
    sheet(`${top}<div class="gstep"><span class="gcount"><span class="ticks gticks">${ticks}</span></span>
      <h3>${t('didItWork')}</h3></div>
      <div class="outcome">
        <button class="btn btn-primary" data-act="solved">${t('yesTrain')}</button>
        <button class="btn btn-quiet wide" data-act="stuck">${t('stillLost')}</button>
        <button class="linkish" data-act="gstep" data-v="${n-1}">${t('back')}</button>
      </div>`, true);
    return;
  }
  const s = g.steps[k];
  sheet(`${top}
    ${k===0 ? `<div class="calm">${L(g.calm)}</div>` : ''}
    <div class="gstep">
      <span class="gcount"><span class="ticks gticks" aria-hidden="true">${ticks}</span><span>${t('stepOf')(k+1,n)}</span>${listenBtn()}</span>
      <h3>${L(s.title)}</h3>
      <p>${L(s.body)}</p>
      ${s.tip ? `<div class="tip"><b>${t('tip')}</b>${L(s.tip)}</div>` : ''}
    </div>
    <div class="gnav">
      ${k>0 ? `<button class="btn btn-quiet" data-act="gstep" data-v="${k-1}">${t('back')}</button>` : ''}
      <button class="btn btn-primary" data-act="gstep" data-v="${k+1}">${t('nextShort')} ${chev()}</button>
    </div>`, true);
}
function branchSheet(p, pick){
  const b = p.branch;
  if(pick == null){
    sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="wrong">${chev()}${t('problems')}</button></div>
      <h2>${L(p.q)}</h2><div class="gstep"><h3>${L(b.q)}</h3></div>
      <div class="choices">${b.options.map((o,i)=>`<button class="choice" data-act="branch" data-v="${i}"><span>${L(o.label)}</span>${chev()}</button>`).join('')}</div>`);
    return;
  }
  const o = b.options[pick];
  sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="problem" data-v="${p.id}">${chev()}${L(b.q)}</button></div>
    <h2>${L(o.label)}</h2>
    <div class="answer"><h3>${t('tryThis')}</h3><p>${L(o.a)}</p></div>
    ${o.link ? `<a class="btn btn-primary linkbtn" href="${o.link}" target="_blank" rel="noopener">${t('openIcp')} ${chev()}</a>` : ''}
    ${outcomeHtml()}`);
}
function outcomeHtml(){
  return `<div class="outcome"><span class="label">${t('didItWork')}</span>
    <button class="btn btn-primary" data-act="solved">${t('yesWorked')}</button>
    <button class="btn btn-quiet wide" data-act="stuck">${t('stillLost')}</button>
    <button class="linkish" data-act="wrong">${t('otherProblem')}</button></div>`;
}
function stuckSheet(){
  const p = curProblem, jj = DATA.journeys[S.params.id];
  if(jj && jj.stuck){
    sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="wrong">${chev()}${t('problems')}</button></div>
      <h2>${t('stuckTitle')}</h2>
      ${jj.stuck.cards.map(c=>`<div class="help-card"><strong>${L(c.title)}</strong>${c.phone?`<a class="phone" dir="ltr" href="tel:${c.phone.replace(/\s/g,'')}">${c.phone}</a>`:''}<p>${L(c.body)}</p></div>`).join('')}
      <div class="help-card"><strong>${t('showThis')}</strong>
        <div class="phrase" id="phBox"></div></div>
      <button class="btn btn-primary" data-act="closeSheet">${t('close')}</button>`, true);
    updatePhrase(); return;
  }
  const dyn = !!(p && p.stuckPhrase);
  sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="wrong">${chev()}${t('problems')}</button></div>
    <h2>${t('stuckTitle')}</h2>
    <div class="help-card">
      <strong>${t('askStaff')}</strong><p>${t('askStaffBody')}</p>
      ${dyn ? `<label class="field-label" for="dest">${t('whereGoing')}</label><input id="dest" class="field" type="text" dir="auto" autocomplete="off" placeholder="${t('wherePh')}">` : ''}
      <div class="phrase"><span class="label" style="color:var(--signMuted)">${t('showStaff')}</span><div id="phBox" style="display:contents"></div></div>
    </div>
    <div class="help-card"><strong>${t('callRta')}</strong><span class="phone" dir="ltr">800 9090</span><p>${t('callRtaBody')}</p></div>
    <div class="help-card"><strong>${t('checkRoute')}</strong><p>${t('checkRouteBody')}</p></div>
    <button class="btn btn-primary" data-act="closeSheet">${t('close')}</button>`, true);
  updatePhrase();
}
function updatePhrase(){
  const p = curProblem, el = document.getElementById('dest');
  const v = el ? el.value.trim() : '';
  const box = document.getElementById('phBox'); if(!box) return;
  box.innerHTML = staffInner(p && p.stuckPhrase ? {en:p.stuckPhrase.en(v), ar:p.stuckPhrase.ar(v), mine:p.stuckPhrase[lang()] && p.stuckPhrase[lang()](v)} : {en:UI.en.helpPhrase, ar:UI.ar.helpPhrase, mine:t('helpPhrase')});
}
/* Staff phrase: Dubai shows Arabic + English. Elsewhere, English (for staff) plus the reader's own language underneath. */
function staffInner(o){
  const c = DATA.cities[S.city];
  if(c.staffLang === 'ar') return `<div class="ar" lang="ar" dir="rtl">${o.ar}</div><hr><div class="en" lang="en" dir="ltr">${o.en}</div>`;
  const l = lang(), mine = o.mine || (l==='ar' ? o.ar : (I18N[l] && I18N[l].t && I18N[l].t[o.en]));
  return `<div class="en big" lang="en" dir="ltr">${o.en}</div>` + (l!=='en' && mine && mine!==o.en ? `<hr><div class="mine" lang="${l}" dir="${isRtl(l)?'rtl':'ltr'}">${mine}</div>` : '');
}
const phraseHtml = j => `<div class="phrase"><span class="label" style="color:var(--signMuted)">${t('showStaff')}</span>${staffInner(j.phrase)}</div>`;
function phraseSheet(){ const j = DATA.journeys[S.params.id]; sheet(`<h2>${t('showStaff')}</h2>${phraseHtml(j)}<button class="btn btn-primary" data-act="closeSheet">${t('close')}</button>`); }

function toast(msg){ const el = document.createElement('div'); el.className='toast'; el.textContent = msg; app.appendChild(el); setTimeout(()=>el.remove(), 1800); }

/* ---------- Render + events ---------- */
function render(scrollTop){
  if(canSpeak && speechSynthesis.speaking) speechSynthesis.cancel();
  const l = lang();
  app.lang = l; app.dir = isRtl(l) ? 'rtl' : 'ltr';
  const scr = (SCREENS[S.screen] || SCREENS.welcome)();
  app.innerHTML = topbar() + `<div class="scroll" id="scroll">${scr.body}</div><div class="actions">${scr.actions||''}</div>`;
  if(scrollTop) document.getElementById('scroll').scrollTop = 0;
  syncPoster();
}

app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if(!b || b.disabled) return;
  const v = b.dataset.v;
  switch(b.dataset.act){
    case 'home': home(); break;
    case 'back': goBack(); break;
    case 'go': go(v); break;
    case 'toggleLang': S.lang = lang()==='en' ? 'ar' : 'en'; save(); render(); break;
    case 'langPicker': langSheet(); break;
    case 'setLang': closeSheet(); S.lang = v; save(); render(); break;
    case 'lang': S.lang = v; logEv('lang',{detail:v}); if(!applyPending()) go('purpose'); break;
    case 'purpose': S.purpose = +v; save(); render(); break;
    case 'need': go('tasks', {need:v}); break;
    case 'unsure': if(DATA.firstWeek[S.city]) go('unsure'); break;
    case 'journey': closeSheet(); touch(v); go('journey', {id:v}); logEv('journey_open'); break;
    case 'step': go('step', {id:S.params.id, i:+v}); logEv('stage_open'); break;
    case 'stepDone': {
      const j = DATA.journeys[S.params.id], i = S.params.i;
      S.done[S.params.id] = S.done[S.params.id] || {};
      S.done[S.params.id][j.stages[i].id] = true; touch(S.params.id);
      if(S.stuck[S.params.id] === j.stages[i].id) delete S.stuck[S.params.id];
      logEv('stage_done'); if(i === j.stages.length-1) logEv('journey_complete');
      if(i < j.stages.length-1){ S.params = {id:S.params.id, i:i+1}; save(); render(true); }
      else { S.screen = 'complete'; save(); render(true); }
      break;
    }
    case 'restartJ': S.done[S.params.id] = {}; save(); render(true); break;
    case 'wrong': wrongSheet(); logEv('help_open'); break;
    case 'problem': wrongSheet(v); S.lastProblem = {j:S.params.id, p:v}; logEv('problem', {p:v}); break;
    case 'phrase': phraseSheet(); break;
    case 'closeSheet': closeSheet(); break;
    case 'gstep': guideSheet(curProblem, +v); break;
    case 'branch': branchSheet(curProblem, +v); break;
    case 'pathway': go('pathway', {id:v}); break;
    case 'pathOpt': { const jj = DATA.journeys[v]; (jj.finder || jj.lastDone) && !S.finder[v] ? go('finder', {id:v, mode:'last'}) : go('journey', {id:v}); break; }
    case 'lastAns': {
      const id = S.params.id, j = DATA.journeys[id], n = j.lastDone.options[+v].done;
      const doneMap = {}; for(let i=0;i<n;i++) doneMap[j.stages[i].id] = true;
      S.done[id] = doneMap; S.finder[id] = {unsure:[]};
      S.screen = 'journey'; S.params = {id}; save(); render(true); break;
    }
    case 'lastUnknown': go('finder', {id:S.params.id, k:0}); break;
    case 'dontKnow': dontKnowSheet(); break;
    case 'redo': S.finder[S.params.id] = null; S.done[S.params.id] = {}; S.screen='finder'; S.params={id:S.params.id, mode:'last'}; save(); render(true); break;
    case 'answer': {
      const id = S.params.id, j = DATA.journeys[id], k = S.params.k||0;
      const ans = (S.params.ans || []).slice(0,k); ans[k] = v;
      const stop = v !== 'yes' || k === j.finder.length-1;
      if(!stop){ S.params = {id, k:k+1, ans}; save(); render(true); break; }
      const reached = v==='yes' ? j.finder.length : k;         // number of finder stages done
      const doneMap = {}; for(let i=0;i<reached;i++) doneMap[j.finder[i].stage] = true;
      const unsure = ans.map((a,i)=>a==='unsure'?j.finder[i].stage:null).filter(Boolean);
      S.done[id] = doneMap; S.finder[id] = {unsure};
      S.screen = 'journey'; S.params = {id}; save(); render(true); break;
    }
    case 'listen': speak(b); break;
    case 'solved': closeSheet(); if(S.stuck[S.params.id]) delete S.stuck[S.params.id]; logEv('solved', {p:S.lastProblem && S.lastProblem.p}); save(); toast(t('wellDone')); break;
    case 'stuck': stuckSheet(); if(S.screen==='step'){ S.stuck[S.params.id] = DATA.journeys[S.params.id].stages[S.params.i].id; } logEv('still_stuck', {p:S.lastProblem && S.lastProblem.p}); save(); break;
    case 'tick': { const jid = S.params.id; S.checks[jid] = S.checks[jid] || {}; S.checks[jid][v] = !S.checks[jid][v]; logEv('tick', {detail:v+':'+S.checks[jid][v]}); save();
      const sc = document.getElementById('scroll').scrollTop; render(); document.getElementById('scroll').scrollTop = sc; break; }
    case 'hubStep': { const c = ctx(v); touch(v); go('step', {id:v, i:Math.max(c.index,0)}); if(c.status==='blocked') wrongSheet(); break; }
    case 'hubHelp': { const c = ctx(v); go('step', {id:v, i:Math.max(c.index,0)}); wrongSheet(); logEv('help_open', {detail:'from_hub'}); break; }
    case 'exportLog': exportLog(); break;
    case 'clearLog': S.log = []; save(); render(); break;
    default: placesAct(b.dataset.act, v);
  }
});
app.addEventListener('input', e => { if(e.target.id === 'dest') updatePhrase(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeSheet(); });

/* ---------- Poster (desktop demo controls) ---------- */
function syncPoster(){
  const q = document.getElementById('landQr'); if(q) q.src = `icons/qr-${S.city}.png`;
  document.querySelectorAll('#scanAs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.city === S.city));
}
document.getElementById('scanAs').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  S.city = b.dataset.city; S.history = []; S.screen = 'welcome'; S.params = {}; save(); render(true); drawQR(); fillLanding();
});
document.getElementById('resetAll').addEventListener('click', () => {
  S = Object.assign(FRESH(), {city:S.city}); save(); render(true);
});

/* Decorative stand-in for a QR code (not scannable) */
function drawQR(){}
drawQR();
render();
fillLanding();
applyPending();
if(S.screen !== 'welcome'){ try{ history.pushState({orivia:true}, ''); navDepth++; }catch(e){} }

/* ---------- Installable app + offline ---------- */
if('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
/* "Save to phone": offered once Orivia has helped (on a journey screen), with a picture guide per phone type. */
var deferredInstall = null;
function isStandalone(){ return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
function phoneKind(){
  const ua = navigator.userAgent;
  if(/FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat|TikTok|GSA\/|; wv\)/i.test(ua)) return 'inapp';
  if(/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if(/android/i.test(ua)) return 'android';
  return 'desktop';
}
function dismissedInstall(){ try{ return localStorage.getItem('orivia-install-dismissed') === '1'; }catch(e){ return false; } }
function saveCard(){
  if(isStandalone() || dismissedInstall() || location.protocol === 'file:') return '';
  return `<div class="save-card">
    <div class="save-text"><strong>${t('saveTitle')}</strong><span>${t('saveBody')}</span></div>
    <div class="save-actions"><button class="btn btn-primary" data-act="saveApp">${t('saveBtn')}</button><button class="linkish" data-act="saveLater">${t('later')}</button></div>
  </div>`;
}
const GUIDE_ICONS = {
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
  dots:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
};
function saveGuide(){
  const kind = phoneKind();
  const steps = t('guide')[kind] || t('guide').android;
  sheet(`<h2>${t('saveTitle')}</h2>
    ${kind === 'inapp' ? `<div class="tip warn-tip"><b>${t('important')}</b>${t('inappNote')}</div>` : ''}
    <ol class="guide-steps">${steps.map(s=>`<li><span class="gicon">${GUIDE_ICONS[s.icon]}</span><span>${s.text}</span></li>`).join('')}</ol>
    ${kind === 'ios' ? `<div class="guide-hint">${t('iosHint')}</div>` : ''}
    <button class="btn btn-primary" data-act="closeSheet">${t('gotIt')}</button>`);
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
window.addEventListener('appinstalled', () => { deferredInstall = null; render(); });
app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if(!b) return;
  if(b.dataset.act === 'saveApp'){
    if(deferredInstall){ deferredInstall.prompt(); deferredInstall.userChoice.finally(()=>{ deferredInstall = null; render(); }); }
    else saveGuide();
  }
  if(b.dataset.act === 'saveLater'){ try{ localStorage.setItem('orivia-install-dismissed','1'); }catch(e){} render(); }
});
function offlineNote(){
  let n = document.getElementById('offlineNote');
  if(navigator.onLine){ if(n) n.remove(); return; }
  if(!n){ n = document.createElement('div'); n.id = 'offlineNote'; n.className = 'offline-note'; app.insertBefore(n, app.children[1] || null); }
  n.textContent = t('offline');
}
window.addEventListener('online', offlineNote); window.addEventListener('offline', offlineNote);
const baseRender = render;
render = function(x){ baseRender(x); offlineNote(); };
offlineNote();

/* ---------- Laptop landing page: live counts and journey list, read from the content ---------- */
function fillLanding(){
  const stats = document.getElementById('landStats'), list = document.getElementById('landJourneys');
  if(!stats || !list) return;
  const js = Object.values(DATA.journeys);
  const srcs = new Set(); js.forEach(j => (j.sources || (j.source?[j.source]:[])).forEach(s => srcs.add(s.url)));
  const helps = js.reduce((n,j)=> n + (j.problems ? j.problems.length : 0), 0);
  stats.innerHTML = [[js.length,'journeys'],[srcs.size,'official and institutional sources'],[helps,'“I need help” answers'],[DATA.languages.filter(l=>l.ready).length,'languages'],[Object.keys(DATA.firstWeek).length,'cities']]
    .map(([n,l])=>`<div><b>${n}</b><span>${l}</span></div>`).join('');
  const lbl = document.getElementById('landLiveLabel'); if(lbl) lbl.textContent = 'Live now in ' + (S.city==='edinburgh' ? 'Edinburgh' : 'Dubai');
  list.innerHTML = DATA.needs.filter(n=>DATA.tasks[S.city+'.'+n.id]).map(n => {
    const items = DATA.tasks[S.city+'.'+n.id].filter(x=>x.journey||x.pathway);
    return `<div class="land-need"><span class="land-need-h">${svg(n.icon)}${n.name.en}</span><ul>${items.map(x=>`<li>${x.name.en}</li>`).join('')}</ul></div>`;
  }).join('');
}

/* Log taps on outside links and phone numbers (for the test-session log) */
app.addEventListener('click', e => { const a = e.target.closest('a[href]'); if(!a) return; logEv(a.href.startsWith('tel:') ? 'call' : 'link_open', {detail:a.getAttribute('href')}); save(); });
