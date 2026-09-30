/* =========================================================
   REAL PHOTOS FROM THE FIELD
   Taken by the Orivia team at Dubai Internet City Metro station, 28 Sep 2026.
   No faces; location data removed from the files.
   ========================================================= */
(function(){
  const J = DATA.journeys, st = (jid, sid) => J[jid] && J[jid].stages.find(s=>s.id===sid);
  const v = (en, ar) => ({en, ar});
  const photo = (src, alt, cap) => ({t:'photo', src, alt, cap});
  const WAIT = photo('img/gate-please-wait.jpg', v('Metro gate screen saying Please Wait','شاشة بوابة المترو مكتوب عليها رجاء الانتظار'),
    v('“Please Wait”: the gate is still reading your card. Keep it on the reader until the screen changes.','«رجاء الانتظار»: البوابة ما زالت تقرأ بطاقتك. أبقِها على القارئ حتى تتغيّر الشاشة.'));
  const INVALID = photo('img/gate-card-not-valid.jpg', v('Metro gate screen saying Card Not Valid, Please see Station Attendant','شاشة بوابة المترو مكتوب عليها البطاقة غير صالحة، الرجاء مراجعة مركز الخدمة'),
    v('“Card Not Valid – Please see Station Attendant”: go to the ticket office in the station. Staff can check your card and fix it.','«البطاقة غير صالحة – الرجاء مراجعة مركز الخدمة»: توجّه إلى شباك التذاكر في المحطة، ويمكن للموظفين فحص بطاقتك وإصلاح المشكلة.'));
  const SIGN = photo('img/station-sign.jpg', v('Dubai Internet City station sign with station number 34, a station plan and the network map','لافتة محطة مدينة دبي للإنترنت مع رقم المحطة 34 ومخطط المحطة وخريطة الشبكة'),
    v('Every station has a big sign like this: its name and number (here, 34), a plan showing the platforms and exits, and a map of the whole network.','لكل محطة لافتة كبيرة مثل هذه: اسمها ورقمها (هنا 34)، ومخطط يبيّن الأرصفة والمخارج، وخريطة الشبكة كاملة.'));
  const ride = st('dubai.nol','ride');
  if(ride){ const i = ride.blocks.findIndex(b=>b.t==='steps');
    ride.blocks.splice(i+1, 0, {t:'p', v:v('If the gate doesn’t open, read its screen:','إذا لم تُفتح البوابة، اقرأ شاشتها:')}, WAIT, INVALID); }
  const there = st('dubai.nol','getthere');
  if(there) there.blocks.splice(1, 0, SIGN);
  const nol = J['dubai.nol'];
  if(nol){
    const gate = nol.problems.find(p=>p.id==='gate');
    if(gate){ gate.a = v('Read the gate’s screen. “Please Wait” means it’s still reading your card: keep it on the reader. “Card Not Valid – Please see Station Attendant” means go to the ticket office so staff can check your card. A low balance can also stop the gate: top up at a ticket machine and try again.',
        'اقرأ شاشة البوابة. «رجاء الانتظار» تعني أنها ما زالت تقرأ بطاقتك، فأبقِها على القارئ. و«البطاقة غير صالحة – الرجاء مراجعة مركز الخدمة» تعني أن تتوجّه إلى شباك التذاكر ليفحص الموظفون بطاقتك. وقد يمنع انخفاض الرصيد فتح البوابة أيضاً: اشحن بطاقتك من جهاز التذاكر وحاول مجدداً.');
      gate.photos = [INVALID, WAIT]; }
    const els = nol.problems.find(p=>p.id==='else');
    if(els) els.a = v('Call RTA on 800 9090, message RTA on WhatsApp at +971 58 800 9090, or ask at the customer service desk in any Metro station.',
      'اتصل بهيئة الطرق والمواصلات على 800 9090، أو راسلها عبر واتساب على ‎+971 58 800 9090، أو اسأل في مكتب خدمة العملاء في أي محطة مترو.');
    nol.sources = [nol.source, {name:v('Orivia field photos, Dubai Internet City station (28 Sep 2026)','صور أوريفيا الميدانية، محطة مدينة دبي للإنترنت (28 سبتمبر 2026)'), url:'img/station-sign.jpg'}];
  }
})();
function photoHtml(b){
  return `<figure class="photo"><img src="${b.src}" alt="${esc(L(b.alt))}" loading="lazy" decoding="async"><figcaption>${L(b.cap)}</figcaption></figure>`;
}
