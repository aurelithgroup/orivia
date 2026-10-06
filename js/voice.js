/* =========================================================
   LISTEN: reads a step aloud with the phone's own voices.
   - Picks the most natural voice the phone has for the language
     (skips the novelty and robotic ones some phones list first).
   - Waits for the phone to finish loading its voices.
   - Reads sentence by sentence, so long steps don't cut off.
   - People can choose a different voice in More.
   ========================================================= */
Object.assign(UI.en, {
  voiceTitle:'Reading voice', voiceAuto:'Best available', voicePickNote:'These voices come from your phone. Tap one to hear it.',
  voiceSample:'Hello. This is how Orivia will read each step to you.', voiceNoneHere:'This phone has no voice for this language yet. You can add one in your phone’s settings, under text-to-speech or spoken content.',
});
Object.assign(UI.ar, {
  voiceTitle:'صوت القراءة', voiceAuto:'أفضل صوت متاح', voicePickNote:'هذه الأصوات من هاتفك. اضغط على أحدها لتسمعه.',
  voiceSample:'مرحباً. هكذا ستقرأ لك أوريفيا كل خطوة.', voiceNoneHere:'لا يوجد في هذا الهاتف صوت لهذه اللغة بعد. يمكنك إضافة صوت من إعدادات الهاتف، ضمن تحويل النص إلى كلام أو المحتوى المنطوق.',
});

const VOICE_LOC = {en:'en-GB', ar:'ar-AE', fr:'fr-FR', fil:'fil-PH', hi:'hi-IN', ur:'ur-PK', zh:'zh-CN', bn:'bn-IN', ml:'ml-IN', ru:'ru-RU'};
const VOICE_PREFIX = {fil:['fil','tl'], zh:['zh','cmn']};
/* Novelty and very robotic voices that some phones and computers list first */
const VOICE_BAD = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley|deranged|hysterical)\b/i;

function voiceLangOf(v){ return String(v.lang || '').toLowerCase().replace('_', '-'); }
function voicesFor(l){
  if(!('speechSynthesis' in window)) return [];
  const pre = VOICE_PREFIX[l] || [l];
  const want = (VOICE_LOC[l] || l).toLowerCase();
  const score = v => {
    if(VOICE_BAD.test(v.name)) return -100;
    const vl = voiceLangOf(v); let s = 0;
    if(vl === want) s += 30;
    if(l === 'zh' && /tw|hk|yue/.test(vl)) s -= 15;
    if(/natural|neural|enhanced|premium|online/i.test(v.name)) s += 40;
    if(/google/i.test(v.name)) s += 25;
    if(/siri/i.test(v.name)) s += 20;
    if(/compact|espeak|eloquence/i.test(v.name)) s -= 30;
    if(l === 'en' && /daniel|serena|kate|arthur|martha|libby|sonia|ryan|samantha|karen|moira/i.test(v.name)) s += 10;
    if(v.localService) s += 2;
    return s;
  };
  return speechSynthesis.getVoices()
    .filter(v => pre.some(p => voiceLangOf(v).startsWith(p)) && !VOICE_BAD.test(v.name))
    .map(v => ({v, s:score(v)})).sort((a,b) => b.s - a.s).map(x => x.v);
}
function voiceReady(){
  return new Promise(res => {
    if(!('speechSynthesis' in window)) return res([]);
    const now = speechSynthesis.getVoices(); if(now.length) return res(now);
    let done = false; const fin = () => { if(done) return; done = true; res(speechSynthesis.getVoices()); };
    speechSynthesis.addEventListener('voiceschanged', fin, {once:true});
    setTimeout(fin, 1200);
  });
}
function pickVoice(l){
  const list = voicesFor(l);
  const chosen = S.voice && S.voice[l];
  return (chosen && list.find(v => v.name === chosen)) || list[0] || null;
}
/* Turn the screen's text into clean, speakable sentences */
function speechChunks(parts){
  const END = /[.!?:;。！？।۔]$/;
  const text = parts.map(p => p.replace(/[·•→←›‹]/g, ' ').replace(/\s[–—]\s/g, ', ')
    .replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}☀-➿]/gu, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean).map(p => END.test(p) ? p : p + '.').join(' ');
  const sentences = text.split(/(?<=[.!?。！？।۔])\s+/);
  const out = [];
  sentences.forEach(s => {
    while(s.length > 220){ let cut = s.lastIndexOf(', ', 200); if(cut < 60) cut = s.lastIndexOf(' ', 200); if(cut < 60) cut = 200; out.push(s.slice(0, cut + 1)); s = s.slice(cut + 1).trim(); }
    if(s) out.push(s);
  });
  return out;
}
let speakRun = 0;
function speakChunks(chunks, l, onDone){
  const ss = window.speechSynthesis; const run = ++speakRun;
  const v = pickVoice(l);
  chunks.forEach((c, i) => {
    const u = new SpeechSynthesisUtterance(c);
    u.lang = v ? v.lang : (VOICE_LOC[l] || 'en-GB'); if(v) u.voice = v;
    u.rate = /natural|neural|online|enhanced|premium/i.test(v ? v.name : '') ? 1 : .95; u.pitch = 1;
    if(i === chunks.length - 1) u.onend = () => { if(run === speakRun && onDone) onDone(); };
    u.onerror = e => { if(e.error !== 'interrupted' && e.error !== 'canceled' && run === speakRun && onDone) onDone(); };
    ss.speak(u);
  });
}
async function speakScreen(){
  const ss = window.speechSynthesis;
  if(ss.speaking || ss.pending){ speakRun++; ss.cancel(); setListen(false); return; }
  const l = lang();
  await voiceReady();
  if(!voicesFor(l).length){ toast(t('noVoice')); return; }
  const root = document.getElementById('sheet') || document.getElementById('scroll');
  const parts = [...root.querySelectorAll('h1,h3,.calm,.wait-for,.wait-calm,.wait-tips li,.q-row,.blk-p,.blk-list li,.blk-steps li,.card strong,.card p,.gstep > p,.tip')]
    .map(e => e.classList.contains('q-row')
      ? [e.querySelector('.q-k'), e.querySelector('.q-v')].filter(Boolean).map(x => x.textContent.trim()).join(': ')
      : e.innerText.trim());
  ss.cancel(); setListen(true);
  speakChunks(speechChunks(parts), l, () => setListen(false));
}
/* Keep Chrome on Android from pausing long readings */
setInterval(() => { try{ if(speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); speechSynthesis.resume(); } }catch(e){} }, 10000);

async function voiceSheet(){
  const l = lang();
  await voiceReady();
  const list = voicesFor(l).slice(0, 8);
  const cur = (S.voice && S.voice[l]) || '';
  const row = (name, label, sub) => `<button class="choice" data-act="voicePick" data-v="${esc(name)}" aria-pressed="${cur === name}"><span class="main"><span>${esc(label)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</span>${cur === name ? `<span class="pill pill-ok">✓</span>` : ''}</button>`;
  sheet(`<h2>${t('voiceTitle')}</h2>
    ${list.length ? `<p class="lead">${t('voicePickNote')}</p><div class="choices">${row('', t('voiceAuto'), list[0].name)}${list.map(v => row(v.name, v.name.replace(/\s*\(.*\)\s*$/, ''), v.lang)).join('')}</div>`
      : `<p class="lead">${t('voiceNoneHere')}</p>`}
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
}
function voiceAct(act, v){
  if(act === 'voiceOpen'){ voiceSheet(); return true; }
  if(act === 'voicePick'){
    const l = lang(); S.voice = S.voice || {}; if(v) S.voice[l] = v; else delete S.voice[l]; save();
    speakRun++; speechSynthesis.cancel(); speakChunks([t('voiceSample')], l, null);
    document.querySelectorAll('[data-act="voicePick"]').forEach(b => {
      const on = b.dataset.v === (v || ''); b.setAttribute('aria-pressed', on);
      const p = b.querySelector('.pill'); if(on && !p) b.insertAdjacentHTML('beforeend', '<span class="pill pill-ok">✓</span>'); if(!on && p) p.remove();
    });
    return true;
  }
  return false;
}
function currentVoiceLabel(){
  if(!('speechSynthesis' in window)) return '';
  const v = pickVoice(lang());
  return v ? v.name.replace(/\s*\(.*\)\s*$/, '') : t('voiceAuto');
}
