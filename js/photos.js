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
  const arrive = st('dubai.nol','arrive');
  if(arrive) arrive.blocks.splice(1, 0, {t:'p', v:v('Topping up later works the same way: place your card on the reader, choose Top Up, pick an amount (at least AED 20) and pay.','الشحن لاحقاً بالطريقة نفسها: ضع بطاقتك على القارئ، واختر «شحن»، وحدّد المبلغ (20 درهماً على الأقل)، ثم ادفع.')});
  const there = st('dubai.nol','getthere');
  if(there) there.blocks.splice(1, 0, SIGN);
  const nol = J['dubai.nol'];
  if(nol){
    const gate = nol.problems.find(p=>p.id==='gate');
    if(gate){
      delete gate.a;
      gate.yes = v('Yes, the gate opened','نعم، فُتحت البوابة');
      gate.guide = {
        calm:v('Don’t worry. Gates refuse cards all the time, and it’s quick to fix. Step to the side so others can pass, then let’s look at what the gate is telling you.',
               'لا تقلق. ترفض البوابات البطاقات كثيراً، وحلّ ذلك سريع. تنحَّ جانباً ليمر الآخرون، ثم لنرَ ما تقوله لك البوابة.'),
        steps:[
          {title:v('Read the gate’s screen','اقرأ شاشة البوابة'),
           body:v('Look at the small screen on the gate, just above the card reader. If it says “Please Wait”, keep your card flat on the reader for a few seconds until the screen changes.',
                  'انظر إلى الشاشة الصغيرة على البوابة فوق قارئ البطاقات مباشرة. إذا كُتب عليها «رجاء الانتظار»، أبقِ بطاقتك مسطّحة على القارئ بضع ثوانٍ حتى تتغيّر الشاشة.'),
           photo:WAIT},
          {title:v('Check your balance','تحقّق من رصيدك'),
           body:v('If the gate stays shut, your card probably doesn’t have enough credit. You need at least about AED 7.50 on it to ride the Metro.',
                  'إذا بقيت البوابة مغلقة، فالأرجح أن رصيد بطاقتك غير كافٍ. تحتاج إلى نحو 7.50 دراهم على الأقل لركوب المترو.'),
           tip:v('A ticket machine shows your balance as soon as you place your card on it.','يعرض جهاز التذاكر رصيدك بمجرد وضع بطاقتك عليه.')},
          {title:v('Find a ticket machine','ابحث عن جهاز التذاكر'),
           body:v('Ticket machines are tall machines with a touchscreen. They stand near the ticket gates, usually close to the ticket office window. You don’t need to go through the gates to use them.',
                  'أجهزة التذاكر أجهزة طويلة بشاشة لمس، توجد قرب بوابات الدخول وغالباً بجانب شباك التذاكر. لا تحتاج إلى عبور البوابات لاستخدامها.')},
          {title:v('Top up your card','اشحن بطاقتك'),
           body:v('At the machine:','عند الجهاز:'),
           list:[v('Place your card on the machine’s card reader.','ضع بطاقتك على قارئ البطاقات في الجهاز.'),
                 v('Choose Top Up.','اختر «شحن».'),
                 v('Choose an amount: at least AED 20 at a Metro machine.','اختر المبلغ: 20 درهماً على الأقل في أجهزة المترو.'),
                 v('Pay with cash or a bank card.','ادفع نقداً أو بالبطاقة البنكية.'),
                 v('Keep the card on the reader for about 6 seconds, until the machine confirms.','أبقِ البطاقة على القارئ نحو 6 ثوانٍ حتى يؤكد الجهاز العملية.')],
           tip:v('Have a phone with NFC? The nol Pay app tops up your card straight away: place the card on the back of your phone.','هل في هاتفك خاصية NFC؟ يشحن تطبيق nol Pay بطاقتك فوراً: ضع البطاقة على ظهر هاتفك.')},
          {title:v('Try the gate again','جرّب البوابة مرة أخرى'),
           body:v('Tap your card flat on the gate reader again. If the screen says “Card Not Valid – Please see Station Attendant”, go to the ticket office window. Staff can check your card and fix it.',
                  'مرّر بطاقتك مسطّحة على قارئ البوابة مرة أخرى. إذا ظهرت عبارة «البطاقة غير صالحة – الرجاء مراجعة مركز الخدمة»، توجّه إلى شباك التذاكر، ويمكن للموظفين فحص بطاقتك وإصلاحها.'),
           photo:INVALID,
           tip:v('Topping up at the ticket office window costs at least AED 50, so the machine is better for small amounts.','الحد الأدنى للشحن عند شباك التذاكر 50 درهماً، لذلك الجهاز أنسب للمبالغ الصغيرة.')},
        ]
      };
    }
    const els = nol.problems.find(p=>p.id==='else');
    if(els) els.a = v('Call RTA on 800 9090, message RTA on WhatsApp at +971 58 800 9090, or ask at the customer service desk in any Metro station.',
      'اتصل بهيئة الطرق والمواصلات على 800 9090، أو راسلها عبر واتساب على ‎+971 58 800 9090، أو اسأل في مكتب خدمة العملاء في أي محطة مترو.');
    nol.sources = [nol.source, {name:v('RTA: Top up nol card (service details)','هيئة الطرق والمواصلات: شحن بطاقة نول'), url:'https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=646'}, {name:v('Orivia field photos, Dubai Internet City station (28 Sep 2026)','صور أوريفيا الميدانية، محطة مدينة دبي للإنترنت (28 سبتمبر 2026)'), url:'img/station-sign.jpg'}];
  }
})();
function photoHtml(b){
  return `<figure class="photo"><img src="${b.src}" alt="${esc(L(b.alt))}" loading="lazy" decoding="async"><figcaption>${L(b.cap)}</figcaption></figure>`;
}
