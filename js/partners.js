/* =========================================================
   PARTNER MODE  (University × Orivia)
   Same journeys, same official guidance, with the institution's own
   instructions layered on top of the steps where they apply.
   A partner is switched on when someone scans that partner's QR (?p=<id>).
   The two partners below are clearly-labelled EXAMPLES for demos:
   no real institution's name is used without permission.
   Loaded before app.js; uses app.js globals at call time.
   ========================================================= */
Object.assign(UI.en, {
  fromPartner:n=>`From ${n}`, partnerFirst:'Your institution’s own instructions. Follow these first.', examplePartner:'Example partner',
  withPartner:'With', contactTeam:'Contact', partnerHours:'Hours',
});
Object.assign(UI.ar, {
  fromPartner:n=>`من ${n}`, partnerFirst:'تعليمات مؤسستك الخاصة. اتبعها أولاً.', examplePartner:'شريك تجريبي',
  withPartner:'مع', contactTeam:'تواصل مع', partnerHours:'ساعات العمل',
});
DATA.partners = {
  'demo-uni':{
    city:'dubai', demo:true,
    name:{en:'Demo University Dubai', ar:'جامعة دبي التجريبية'},
    team:{en:'Visa Office', ar:'مكتب التأشيرات'},
    where:{en:'Student Hub, ground floor', ar:'مركز الطلاب، الطابق الأرضي'},
    hours:{en:'Sun–Thu, 9am–4pm', ar:'من الأحد إلى الخميس، 9 صباحاً حتى 4 مساءً'},
    email:'visa@example.edu',
    entry:{j:'dubai.eid.student', s:'permit'},
    notes:{
      'dubai.eid.student':{
        permit:{en:'Upload your passport, photo and forms in the Applicant Portal. We apply for your entry permit and email it to you.', ar:'ارفع جواز سفرك وصورتك والنماذج على بوابة المتقدمين. نتقدّم بطلب تصريح الدخول ونرسله إليك بالبريد الإلكتروني.'},
        arrive:{en:'Within 3 working days of landing, email your stamped entry permit to visa@example.edu, or bring it to the Visa Office in the Student Hub.', ar:'خلال 3 أيام عمل من وصولك، أرسل تصريح الدخول المختوم إلى visa@example.edu، أو أحضره إلى مكتب التأشيرات في مركز الطلاب.'},
        medical:{en:'We book your medical test for you. A free university shuttle leaves the Student Hub at 8:15am on test days.', ar:'نحجز لك موعد الفحص الطبي. تنطلق حافلة جامعية مجانية من مركز الطلاب الساعة 8:15 صباحاً في أيام الفحص.'},
        biometrics:{en:'Your fingerprint appointment is in the same email as your medical test. If you can’t go, tell the Visa Office at least 1 working day before.', ar:'موعد البصمات في الرسالة نفسها التي فيها موعد الفحص الطبي. إذا لم تستطع الحضور، أبلغ مكتب التأشيرات قبل يوم عمل واحد على الأقل.'},
        card:{en:'We email you when your Emirates ID is ready. Collect it from the Visa Office with your passport.', ar:'نرسل إليك رسالة عندما تصبح هويتك الإماراتية جاهزة. استلمها من مكتب التأشيرات ومعك جواز سفرك.'},
        register:{en:'Bring your passport and Emirates ID to Registration, Student Hub, to finish your enrolment.', ar:'أحضر جواز سفرك وهويتك الإماراتية إلى قسم التسجيل في مركز الطلاب لإكمال تسجيلك.'},
      },
      'dubai.health.student':{
        insurance:{en:'Your student insurance card is in the Student App under “My documents”.', ar:'بطاقة تأمينك الطلابي موجودة في تطبيق الطلاب ضمن «مستنداتي».'},
      },
    },
  },
  'demo-uni-edi':{
    city:'edinburgh', demo:true,
    name:{en:'Demo University Edinburgh', ar:'جامعة إدنبرة التجريبية'},
    team:{en:'Student Immigration Team', ar:'فريق هجرة الطلاب'},
    where:{en:'Student Centre, level 1', ar:'مركز الطلاب، الطابق الأول'},
    hours:{en:'Mon–Fri, 10am–4pm', ar:'من الاثنين إلى الجمعة، 10 صباحاً حتى 4 مساءً'},
    email:'immigration@example.edu',
    entry:{j:'edinburgh.evisa', s:'account'},
    notes:{
      'edinburgh.evisa':{
        account:{en:'Stuck setting up your UKVI account? Book a 15-minute eVisa help slot with the Student Immigration Team.', ar:'تواجه صعوبة في إعداد حساب UKVI؟ احجز موعد مساعدة لمدة 15 دقيقة مع فريق هجرة الطلاب.'},
        share:{en:'We need a share code from every new student in their first 2 weeks. Upload it in the Student Portal.', ar:'نحتاج رمز مشاركة من كل طالب جديد خلال أول أسبوعين. ارفعه على بوابة الطلاب.'},
      },
      'edinburgh.bank':{
        prepare:{en:'Order your bank letter in the Student Portal under “Documents”. It’s ready in 2 working days.', ar:'اطلب خطاب البنك من بوابة الطلاب ضمن «المستندات». يكون جاهزاً خلال يومي عمل.'},
      },
      'edinburgh.counciltax':{
        students:{en:'Your student status is shared with the council automatically. You don’t need a certificate.', ar:'تُشارَك صفتك كطالب مع المجلس تلقائياً، فلا تحتاج إلى شهادة.'},
      },
    },
  },
};
function partner(){ const p = S.partner && DATA.partners[S.partner]; return p && p.city === S.city ? p : null; }
function partnerNote(jid, s){
  const p = partner(); const n = p && p.notes[jid] && p.notes[jid][s.id]; if(!n) return '';
  return `<div class="partner-note"><div class="partner-head"><span class="label">${t('fromPartner')(L(p.name))}</span>${p.demo?`<span class="pill pill-soon">${t('examplePartner')}</span>`:''}</div>
    <p>${L(n)}</p><span class="muted">${t('partnerFirst')}</span></div>`;
}
function partnerCard(){
  const p = partner(); if(!p) return '';
  return `<div class="help-card partner-card"><strong>${L(p.name)}: ${L(p.team)}</strong>
    <p>${L(p.where)} · ${L(p.hours)}</p>${p.email ? `<a class="phone" href="mailto:${p.email}" dir="ltr">${p.email}</a>` : ''}${p.phone ? `<a class="phone" href="tel:${p.phone.replace(/[^0-9+]/g, '')}" dir="ltr">${p.phone}</a>` : ''}
    ${p.demo ? `<span class="pill pill-soon" style="align-self:flex-start">${t('examplePartner')}</span>` : ''}</div>`;
}
function partnerStrip(){
  const p = partner(); if(!p) return '';
  return `<div class="partner-strip"><span>${t('withPartner')} <b>${L(p.name)}</b></span>${p.demo?`<span class="pill pill-soon">${t('examplePartner')}</span>`:''}</div>`;
}

/* ---------- Live partner notes from the Orivia server ----------
   Organisations edit their notes on the Orivia server; the app picks them up here.
   Everything that comes back is treated as plain text (never as HTML) and kept on
   the phone so it still works offline. Set ORIVIA_API to the server's address. */
const ORIVIA_API = 'https://orivia-api.habeebahsallah27.workers.dev';
const escText = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function cleanRemote(x){
  if(typeof x === 'string') return escText(x);
  if(Array.isArray(x)) return x.map(cleanRemote);
  if(x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, cleanRemote(v)]));
  return x;
}
function useRemotePartner(id, d){
  if(!d || !d.city || !d.name) return false;
  const p = cleanRemote(d);
  ['name','team','where','hours'].forEach(k => { p[k] = p[k] || {en:'', ar:''}; if(!p[k].ar) p[k].ar = p[k].en; });
  Object.values(p.notes || {}).forEach(st => Object.values(st).forEach(n => { if(!n.ar) n.ar = n.en; }));
  p.notes = p.notes || {};
  DATA.partners[id] = p; return true;
}
async function loadRemotePartner(){
  const id = S && S.partner; if(!id || !/^[a-z0-9-]{2,40}$/.test(id)) return;
  const key = 'orivia-partner-' + id;
  try{ const c = JSON.parse(localStorage.getItem(key) || 'null'); if(c) useRemotePartner(id, c); }catch(e){}
  if(!ORIVIA_API || !navigator.onLine) return;
  try{
    const r = await fetch(ORIVIA_API + '/api/partners/' + id, {cache:'no-store'});
    if(r.status === 404){ try{ localStorage.removeItem(key); }catch(e){} return; }
    if(!r.ok) return;
    const d = await r.json();
    const before = JSON.stringify(DATA.partners[id] || null);
    if(useRemotePartner(id, d)){ try{ localStorage.setItem(key, JSON.stringify(d)); }catch(e){}
      if(JSON.stringify(DATA.partners[id]) !== before && typeof render === 'function') render(); }
  }catch(e){}
}
/* Anonymous counts for the organisation's own page: event name, journey and step only */
function partnerCount(r){
  if(!ORIVIA_API || !S.partner || S.analytics === false || S.testMode) return;
  try{ fetch(ORIVIA_API + '/api/ev', {method:'POST', keepalive:true, body:JSON.stringify({p:S.partner, ev:r.ev, j:r.j || '', s:r.stage || ''})}).catch(() => {}); }catch(e){}
}
window.addEventListener('load', () => setTimeout(loadRemotePartner, 300));
