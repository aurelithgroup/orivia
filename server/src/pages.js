/* Pages for the Orivia team and for organisations. Plain HTML + a little script; all text is set with textContent. */
const APP = 'https://aurelithgroup.github.io/orivia/';

const CSS = `
:root{--ground:#E9ECE7;--surface:#FFFFFF;--surface2:#F3F5F1;--ink:#18222D;--muted:#56616C;--line:#D6DBD4;--sign:#1C2733;--signInk:#F4F6F7;--amber:#F2B90F;--ok:#1D7F55;--okSoft:#DDF0E6;--warn:#A8480A;--warnSoft:#FBE9DC;--focus:#2F6FEB}
@media (prefers-color-scheme: dark){:root{--ground:#0B1015;--surface:#141B23;--surface2:#1A232D;--ink:#E6EAEE;--muted:#9AA5B0;--line:#29333E;--sign:#080C10;--ok:#46C08A;--okSoft:#15342A;--warn:#F2914A;--warnSoft:#3A2517;--focus:#7AA5FF;color-scheme:dark}}
*{box-sizing:border-box}
[hidden]{display:none!important}
body{margin:0;background:var(--ground);color:var(--ink);font:16px/1.5 "Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI",sans-serif}
header.top{background:var(--sign);color:var(--signInk);padding:14px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.brand{font:800 18px/1 Archivo,"Arial Narrow",system-ui,sans-serif;letter-spacing:.14em}
.brand b{color:var(--amber)}
.who{margin-inline-start:auto;font-size:14px;opacity:.85}
header.top a{color:var(--signInk)}
main{max-width:1040px;margin:0 auto;padding:24px 16px 120px;display:flex;flex-direction:column;gap:20px}
h1{font:800 30px/1.15 Archivo,system-ui,sans-serif;margin:0}
h2{font:700 20px/1.2 Archivo,system-ui,sans-serif;margin:0}
.lead{color:var(--muted);margin:4px 0 0;max-width:68ch}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:14px;min-width:0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:640px){.grid2{grid-template-columns:1fr}}
label{display:flex;flex-direction:column;gap:4px;font-size:14px;font-weight:700}
label small{font-weight:400;color:var(--muted)}
input,select,textarea{font:inherit;color:var(--ink);background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:9px 11px;width:100%}
textarea{min-height:88px;resize:vertical}
textarea[dir=rtl],input[dir=rtl]{font-family:"IBM Plex Sans Arabic",Tahoma,sans-serif}
input:focus,select:focus,textarea:focus,button:focus-visible{outline:3px solid var(--focus);outline-offset:1px}
button{font:inherit;font-weight:700;border-radius:10px;border:1px solid var(--line);background:var(--surface2);color:var(--ink);padding:9px 14px;cursor:pointer}
button.primary{background:var(--amber);border-color:var(--amber);color:#1C2733}
button.link{background:none;border:0;padding:0;color:var(--focus);text-decoration:underline}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.muted{color:var(--muted);font-size:14px}
.pill{display:inline-block;font-size:12px;font-weight:700;border-radius:999px;padding:2px 9px;background:var(--surface2);border:1px solid var(--line)}
.pill.ok{background:var(--okSoft);color:var(--ok);border-color:transparent}
.pill.warn{background:var(--warnSoft);color:var(--warn);border-color:transparent}
.tablewrap{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:start;padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
td.num{font-variant-numeric:tabular-nums;text-align:end}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--line);border-radius:999px;padding:2px 4px 2px 10px;margin:2px;font-size:13px}
.chip button{border:0;padding:0 6px;background:none;font-size:16px;line-height:1}
.stage{border-top:1px solid var(--line);padding-top:12px;display:flex;flex-direction:column;gap:8px}
.stage h3{margin:0;font-size:15px}
.savebar{position:fixed;inset-inline:0;bottom:0;background:var(--surface);border-top:1px solid var(--line);padding:12px 16px;display:flex;justify-content:center;gap:14px;align-items:center}
.bar{height:10px;border-radius:5px;background:var(--amber);min-width:2px}
.err{color:var(--warn);font-weight:700}
`;
const shell = (title, body, script) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Atkinson+Hyperlegible:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap"><style>${CSS}</style></head>
<body>${body}<script>${COMMON}${script}</script></body></html>`;

const COMMON = `
const $ = s => document.querySelector(s);
const el = (tag, props = {}, ...kids) => { const e = document.createElement(tag); Object.entries(props).forEach(([k, v]) => { if(k === 'class') e.className = v; else if(k === 'text') e.textContent = v; else if(k.startsWith('on')) e.addEventListener(k.slice(2), v); else if(v !== false && v != null) e.setAttribute(k, v); }); kids.flat().forEach(k => k != null && e.append(k)); return e; };
async function api(path, opts = {}){
  const r = await fetch(path, { ...opts, headers: { 'content-type': 'application/json' }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const d = await r.json().catch(() => ({}));
  if(!r.ok) throw new Error(d.error === 'sign_in' ? 'Your sign-in has ended. Reload the page to sign in again.' : (d.error || 'Something went wrong. Try again.'));
  return d;
}
const APP = ${JSON.stringify(APP)};
const EVN = {journey_open:'Opened the journey', stage_open:'Opened the step', help_open:'Opened “I need help”', problem:'Picked a problem', still_stuck:'Still stuck after help', solved:'Help solved it', staff_card:'Showed a staff card', escalate:'Opened “who to contact”', escalate_sent:'Contacted you', stage_done:'Finished the step', journey_complete:'Finished the journey', deeplink:'Opened your link'};
`;

export function lockedPage(accessReady){
  return shell('Orivia · Sign in', `<header class="top"><span class="brand">ORIV<b>I</b>A</span></header>
<main><div class="card"><h1>${accessReady ? 'Sign in to continue' : 'Sign-in isn’t switched on yet'}</h1>
<p class="lead">${accessReady ? 'This page is for the Orivia team and partner organisations. Reload the page and sign in with your work email. If you’ve signed in and still see this, ask the Orivia team to add your email.'
  : 'This server is running. The team and organisation pages open once Cloudflare Access sign-in is set up.'}</p>
<p class="muted">Looking for the Orivia app? <a href="${APP}">Open Orivia</a></p></div></main>`, '');
}

export function teamPage(){
  return shell('Orivia · Team', `<header class="top"><span class="brand">ORIV<b>I</b>A</span><span>Team</span><span class="who" id="who"></span></header>
<main>
  <div><h1>Organisations</h1><p class="lead">Everyone Orivia works with. Numbers are anonymous taps from people who opened each organisation’s link in the last 30 days.</p></div>
  <div class="card"><div class="tablewrap"><table><thead><tr><th>Organisation</th><th>City</th><th>People who can edit</th><th class="num">Journeys opened</th><th class="num">Asked for help</th><th class="num">Staff cards</th><th>Status</th><th></th></tr></thead><tbody id="orgs"><tr><td colspan="8" class="muted">Loading…</td></tr></tbody></table></div><p id="orgErr" class="err" hidden></p></div>
  <div class="card"><h2>Add an organisation</h2>
    <div class="grid2">
      <label>Link name <small>Lowercase, used in their QR link, e.g. city-university-dubai</small><input id="nId" autocomplete="off"></label>
      <label>City<select id="nCity"><option value="dubai">Dubai</option><option value="edinburgh">Edinburgh</option></select></label>
      <label>Name (English)<input id="nEn"></label>
      <label>Name (Arabic) <small>Optional</small><input id="nAr" dir="rtl"></label>
      <label>Team students contact <small>e.g. Visa Office</small><input id="nTeam"></label>
      <label>Team email<input id="nEmail" type="email"></label>
    </div>
    <div class="row"><button class="primary" id="nAdd">Add organisation</button><span id="nMsg" class="muted"></span></div>
  </div>
</main>`, `
let ORGS = [];
async function load(){
  try{
    const me = await api('/api/me'); $('#who').textContent = me.email;
    ORGS = await api('/api/admin/orgs'); draw();
  }catch(e){ $('#orgErr').hidden = false; $('#orgErr').textContent = e.message; }
}
function draw(){
  const tb = $('#orgs'); tb.textContent = '';
  if(!ORGS.length) tb.append(el('tr', {}, el('td', {colspan:8, class:'muted', text:'No organisations yet.'})));
  ORGS.forEach(o => {
    const add = el('input', {type:'email', placeholder:'name@organisation.edu', 'aria-label':'Email to add for ' + o.name.en, style:'max-width:220px'});
    const people = el('td', {}, o.members.map(m => el('span', {class:'chip'}, m, el('button', {'aria-label':'Remove ' + m, title:'Remove', text:'×', onclick: async () => { if(!window.__confirm || window.__confirm !== m){ window.__confirm = m; alertMsg('Tap × again to remove ' + m); return; } await api('/api/admin/orgs/' + o.id + '/members', {method:'DELETE', body:{email:m}}); load(); }}))),
      el('div', {class:'row', style:'margin-top:6px'}, add, el('button', {text:'Add', onclick: async () => { try{ await api('/api/admin/orgs/' + o.id + '/members', {method:'POST', body:{email:add.value}}); load(); }catch(e){ alertMsg(e.message); } }})));
    const c = o.counts || {};
    tb.append(el('tr', {},
      el('td', {}, el('strong', {text:o.name.en || o.id}), el('div', {class:'muted', text:o.id}), o.demo ? el('span', {class:'pill', text:'Example'}) : null),
      el('td', {text:o.city === 'edinburgh' ? 'Edinburgh' : 'Dubai'}),
      people,
      el('td', {class:'num', text:String(c.journey_open || 0)}), el('td', {class:'num', text:String(c.help_open || 0)}), el('td', {class:'num', text:String(c.staff_card || 0)}),
      el('td', {}, el('span', {class:'pill ' + (o.active ? 'ok' : 'warn'), text:o.active ? 'Live' : 'Paused'})),
      el('td', {}, el('div', {class:'row'},
        el('a', {href:'/org?id=' + encodeURIComponent(o.id), text:'Open page'}),
        el('a', {href:APP + '?p=' + encodeURIComponent(o.id), target:'_blank', rel:'noopener', text:'Preview in app'}),
        el('button', {class:'link', text:o.active ? 'Pause' : 'Make live', onclick: async () => { await api('/api/admin/orgs/' + o.id + '/active', {method:'POST', body:{active:!o.active}}); load(); }})))
    ));
  });
}
function alertMsg(t){ $('#orgErr').hidden = false; $('#orgErr').textContent = t; setTimeout(() => { $('#orgErr').hidden = true; window.__confirm = null; }, 5000); }
$('#nAdd').addEventListener('click', async () => {
  $('#nMsg').textContent = '';
  try{
    await api('/api/admin/orgs', {method:'POST', body:{id:$('#nId').value, city:$('#nCity').value, name:{en:$('#nEn').value, ar:$('#nAr').value}, team:{en:$('#nTeam').value, ar:''}, email:$('#nEmail').value}});
    ['#nId','#nEn','#nAr','#nTeam','#nEmail'].forEach(s => $(s).value = ''); $('#nMsg').textContent = 'Added. Now add the people who can edit it.'; load();
  }catch(e){ $('#nMsg').textContent = e.message; }
});
load();`);
}

export function orgPage(){
  return shell('Orivia · Organisation', `<header class="top"><span class="brand">ORIV<b>I</b>A</span><span id="orgName">Organisation</span><span class="who"><span id="who"></span> <a id="teamLink" href="/team" hidden>· Team page</a></span></header>
<main>
  <div class="row" id="pickWrap" hidden><label style="flex-direction:row;align-items:center;gap:8px">Organisation <select id="pick" style="width:auto"></select></label></div>
  <p id="err" class="err" hidden></p>
  <div id="none" class="card" hidden><h1>You’re signed in</h1><p class="lead">Your email isn’t linked to an organisation yet. Ask the Orivia team to add it.</p></div>
  <div id="body" hidden>
    <div><h1 id="title">Your organisation</h1><p class="lead">What you write here appears in Orivia for anyone who opens your link or scans your QR code, on top of Orivia’s official, checked steps.</p></div>
    <div class="card"><h2>Who your students contact</h2><p class="muted">Orivia shows these whenever a step needs your team, with the exact words to use.</p>
      <div class="grid2">
        <label>Organisation name (English)<input id="nameEn"></label><label>Name (Arabic) <small>Optional</small><input id="nameAr" dir="rtl"></label>
        <label>Team name <small>e.g. Visa Office</small><input id="teamEn"></label><label>Team name (Arabic) <small>Optional</small><input id="teamAr" dir="rtl"></label>
        <label>Where to find them <small>e.g. Student Hub, ground floor</small><input id="whereEn"></label><label>Where (Arabic) <small>Optional</small><input id="whereAr" dir="rtl"></label>
        <label>Opening hours <small>e.g. Sun–Thu, 9am–4pm</small><input id="hoursEn"></label><label>Hours (Arabic) <small>Optional</small><input id="hoursAr" dir="rtl"></label>
        <label>Email<input id="email" type="email"></label><label>Phone <small>Optional</small><input id="phone" type="tel"></label>
      </div>
    </div>
    <div class="card"><h2>Your notes on each step</h2>
      <p class="muted">Add only what’s different at your organisation: your deadlines, portals, rooms and who to email. Leave a step empty to show Orivia’s guidance alone. English is required for a note to show; Arabic is optional. Other languages show the English for now.</p>
      <label>Journey<select id="jPick"></select></label>
      <div id="stages"></div>
      <label>When someone scans your QR code, open<select id="entry"></select></label>
    </div>
    <div class="card"><h2>Where your students ask for help</h2><p class="muted">Last 30 days, from people who opened your link. Anonymous: Orivia never sees names, emails or anything people type.</p>
      <div class="tablewrap"><table><thead><tr><th>Step</th><th>What happened</th><th class="num">Times</th><th></th></tr></thead><tbody id="stats"></tbody></table></div></div>
    <div class="card"><h2>Share with your students</h2>
      <p>Your link: <a id="link" target="_blank" rel="noopener"></a></p>
      <p class="muted">Print a QR poster from the <a id="qr" target="_blank" rel="noopener">QR page</a>, or add the link to your welcome emails.</p></div>
  </div>
</main>
<div class="savebar" id="savebar" hidden><span id="saveMsg" class="muted">All changes saved</span><button class="primary" id="save">Save changes</button></div>`, `
let ME, J, ORG, NOTES = {}, dirty = false;
const F = ['name','team','where','hours'];
async function init(){
  try{
    [ME, J] = await Promise.all([api('/api/me'), api('/api/journeys')]);
    $('#who').textContent = ME.email; $('#teamLink').hidden = !ME.team;
    const want = new URLSearchParams(location.search).get('id');
    let ids = ME.orgs;
    if(ME.team){ const all = await api('/api/admin/orgs'); ids = all.map(o => o.id); }
    if(!ids.length){ $('#none').hidden = false; return; }
    if(ids.length > 1){ $('#pickWrap').hidden = false; ids.forEach(i => $('#pick').append(el('option', {value:i, text:i}))); $('#pick').value = ids.includes(want) ? want : ids[0];
      $('#pick').addEventListener('change', () => { if(dirty && !confirmLeave()) return; location.search = '?id=' + encodeURIComponent($('#pick').value); }); }
    await open(ids.includes(want) ? want : ids[0]);
  }catch(e){ $('#err').hidden = false; $('#err').textContent = e.message; }
}
function confirmLeave(){ return window.__leave ? true : (window.__leave = true, $('#saveMsg').textContent = 'You have unsaved changes. Choose again to leave without saving.', false); }
async function open(id){
  ORG = await api('/api/org/' + id);
  NOTES = JSON.parse(JSON.stringify(ORG.notes || {}));
  $('#body').hidden = false; $('#savebar').hidden = false;
  $('#orgName').textContent = ORG.name.en || ORG.id; $('#title').textContent = ORG.name.en || ORG.id;
  F.forEach(f => { $('#' + f + 'En').value = (ORG[f] || {}).en || ''; $('#' + f + 'Ar').value = (ORG[f] || {}).ar || ''; });
  $('#email').value = ORG.email || ''; $('#phone').value = ORG.phone || '';
  const mine = J.filter(j => j.city === ORG.city);
  $('#jPick').textContent = ''; mine.forEach(j => $('#jPick').append(el('option', {value:j.id, text:j.title + (NOTES[j.id] ? '  ✓' : '')})));
  $('#jPick').value = (ORG.entry && ORG.entry.j) || mine[0].id; drawStages();
  $('#jPick').addEventListener('change', drawStages);
  $('#entry').textContent = ''; mine.forEach(j => j.stages.forEach(s => $('#entry').append(el('option', {value:j.id + '|' + s.id, text:j.title + ' → ' + s.title}))));
  if(ORG.entry) $('#entry').value = ORG.entry.j + '|' + ORG.entry.s;
  const link = APP + '?p=' + encodeURIComponent(ORG.id); $('#link').href = link; $('#link').textContent = link;
  $('#qr').href = APP + 'partners.html?p=' + encodeURIComponent(ORG.id);
  document.querySelectorAll('#body input, #body select').forEach(i => i.addEventListener('input', markDirty));
  drawStats();
}
function drawStages(){
  const j = J.find(x => x.id === $('#jPick').value), box = $('#stages'); box.textContent = '';
  j.stages.forEach(s => {
    const n = (NOTES[j.id] || {})[s.id] || {en:'', ar:''};
    const en = el('textarea', {'aria-label':s.title + ' note in English', placeholder:'Example: Email your stamped entry permit to visa@… within 3 working days.'}); en.value = n.en || '';
    const ar = el('textarea', {'aria-label':s.title + ' note in Arabic', dir:'rtl', placeholder:'اختياري'}); ar.value = n.ar || '';
    const sync = () => { NOTES[j.id] = NOTES[j.id] || {}; NOTES[j.id][s.id] = {en:en.value, ar:ar.value}; markDirty(); };
    en.addEventListener('input', sync); ar.addEventListener('input', sync);
    box.append(el('div', {class:'stage'}, el('h3', {text:s.title}), el('div', {class:'grid2'}, en, ar)));
  });
}
function markDirty(){ dirty = true; window.__leave = false; $('#saveMsg').textContent = 'Unsaved changes'; }
$('#save').addEventListener('click', async () => {
  const body = {email:$('#email').value, phone:$('#phone').value, notes:NOTES};
  F.forEach(f => body[f] = {en:$('#' + f + 'En').value, ar:$('#' + f + 'Ar').value});
  const [ej, es] = $('#entry').value.split('|'); body.entry = {j:ej, s:es};
  $('#save').disabled = true; $('#saveMsg').textContent = 'Saving…';
  try{ ORG = await api('/api/org/' + ORG.id, {method:'PUT', body}); NOTES = JSON.parse(JSON.stringify(ORG.notes || {})); dirty = false; $('#saveMsg').textContent = 'Saved. Students see it within a few minutes.'; }
  catch(e){ $('#saveMsg').textContent = e.message; }
  $('#save').disabled = false;
});
window.addEventListener('beforeunload', e => { if(dirty){ e.preventDefault(); e.returnValue = ''; } });
async function drawStats(){
  const rows = await api('/api/org/' + ORG.id + '/stats'), tb = $('#stats'); tb.textContent = '';
  const name = (jid, sid) => { const j = J.find(x => x.id === jid); if(!j) return jid || 'Your link'; const s = j.stages.find(x => x.id === sid); return j.title + (s ? ' → ' + s.title : ''); };
  const help = rows.filter(r => ['help_open','problem','still_stuck','staff_card','escalate','escalate_sent','journey_open','deeplink'].includes(r.ev)).slice(0, 25);
  if(!help.length){ tb.append(el('tr', {}, el('td', {colspan:4, class:'muted', text:'No activity yet. Numbers appear here once students start using your link.'}))); return; }
  const max = Math.max(...help.map(r => r.n));
  help.forEach(r => tb.append(el('tr', {}, el('td', {text:name(r.journey, r.stage)}), el('td', {text:EVN[r.ev] || r.ev}), el('td', {class:'num', text:String(r.n)}), el('td', {style:'width:30%'}, el('div', {class:'bar', style:'width:' + Math.round(100 * r.n / max) + '%'})))));
}
init();`);
}
