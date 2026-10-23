/* =========================================================
   ORIVIA NAVIGATION LAYER
   Where am I → what do I need → what will happen → I'm waiting →
   something changed → help me recover → done → what's next.
   - Waiting states and "Something changed" recovery branches
   - "Before you go" and "When you get there" (only verified facts)
   - The "I don't know" question engine
   - "Explain this to me" glossary, linked where words appear
   - "I have this. What is it?" identifier
   - Journey endings, "Welcome back", source drawer, review dates
   Loaded before app.js; uses app.js globals at call time.
   ========================================================= */

Object.assign(UI.en, {
  no:'No', waitingNow:'You’re waiting right now', waitingFor:'Waiting for', noActionYet:'You don’t need to do anything yet.', whileWaiting:'While you’re waiting',
  waitTips:['Keep your passport and any documents you’ve been sent somewhere safe.','Check your email and text messages, including spam, for updates.','Don’t submit another application unless someone official asks you to.','When an appointment arrives, add it here so Orivia can remind you.'],
  wLonger:'It’s taking longer than expected', wMessage:'I got a message I don’t understand', wAnotherDoc:'Someone asked me for another document', wElse:'Something else happened', stillHere:'I’ve done this step',
  changedTitle:'Something changed?', changedAsk:'What happened?', changedLink:'Something changed',
  ch:{appt:'My appointment changed', missed:'I missed it', away:'I was turned away', doc:'They asked for another document', delay:'My application is delayed', life:'My circumstances changed', unclear:'I don’t understand what happened'},
  rec:{
    appt:['Update the date and time in Orivia, so your reminders move too.','Add the new date to your calendar again.','If the place changed, check the new address before you go.'],
    missed:['Contact whoever booked it as soon as you can, and ask for a new appointment.','Say when you missed it and why, briefly.','When you get a new date, add it in Orivia.'],
    away:['Ask them why, and ask them to write it down if you can.','Ask exactly what to bring or fix next time.','Check the list of what you need for this step, then rebook.'],
    doc:['Check who is asking: your sponsor, a government office, a bank? Be careful with messages from unknown numbers that ask for money or personal details.','Ask exactly which document, whether they need the original or a copy, and by when.','Not sure it’s genuine? Contact the organisation using the number on its official website.'],
    delay:['Check the status yourself if there’s an official way to (the step’s links show how).','Ask whoever applied for you where it is, and whether they need anything from you.','Keep an eye on any deadline, like the time you have to finish your residency.'],
    life:['Tell your sponsor, employer or university straight away: some changes affect your application.','Ask them whether anything needs to be redone or cancelled.','Then answer Orivia’s questions again so your steps match your new situation.'],
  },
  recWho:'Who can help', recUpdateAppt:'Update my appointment', recChecklist:'See what I need for this step', recRedo:'Answer the questions again', recAskPhrase:'Could you please write down why, and what I need to bring next time?',
  beforeGo:'Before you go', beforeSub:'Everything for this step in one place.', bringThese:'Bring these', whereGoing2:'Where you’re going', whenGoing:'When', expectTitle:'What will happen when you get there', mayAsk:'What to say', readyGo:'I’m ready',
  noWhere:'Add your appointment to see where and when.',
  dkTitle:'That’s OK. Let’s work it out.', dkSub:'Answer a few simple questions.', dkNot:'I’m not sure', dkResult:'This is probably your route', dkOpen:'Open this journey', dkUnsure:'We couldn’t work it out from your answers. That’s OK: ask someone who can check.',
  explain:'Explain this', termsTitle:'What does this mean?',
  idTitle:'I have this. What is it?', idEntry:'I got something I don’t understand', idWhat:'What did you receive?', idWords:'What words can you see on it?', idNone:'I don’t recognise any of these',
  idKinds:['A document','A text message','An email','A notification','A receipt or reference number'], idFits:'Where it fits', idOpen:'Open this step', idNoneBody:'That’s OK. Ask Orivia, or show it to someone who can help.',
  endDid:'What you completed', endGot:'What you now have', endKeep:'Keep these safe', endRenew:'This will need renewing', endUnlock:'What this lets you do now', endAddDate:'Add its expiry date',
  welcomeBack:'Welcome back', whyThis:'Why is Orivia telling me this?', drawerTitle:'Where this guidance comes from', srcOfficial:'Official source', srcInstitution:'Institution guidance', srcOther:'Other source',
  reviewDue:'Next review due', openSource:'View source', overdue:'Due for re-checking',
});
Object.assign(UI.ar, {
  no:'لا', waitingNow:'أنت في مرحلة انتظار الآن', waitingFor:'بانتظار', noActionYet:'لا تحتاج إلى فعل أي شيء الآن.', whileWaiting:'أثناء الانتظار',
  waitTips:['احتفظ بجواز سفرك وأي مستندات أُرسلت إليك في مكان آمن.','تابع بريدك الإلكتروني ورسائلك النصية، بما فيها البريد غير المرغوب فيه.','لا تقدّم طلباً آخر إلا إذا طلبت منك جهة رسمية ذلك.','عندما يصلك موعد، أضفه هنا لتذكّرك أوريفيا به.'],
  wLonger:'الأمر يستغرق وقتاً أطول من المتوقع', wMessage:'وصلتني رسالة لا أفهمها', wAnotherDoc:'طلب مني أحدهم مستنداً آخر', wElse:'حدث شيء آخر', stillHere:'أنهيت هذه الخطوة',
  changedTitle:'هل تغيّر شيء؟', changedAsk:'ماذا حدث؟', changedLink:'تغيّر شيء',
  ch:{appt:'تغيّر موعدي', missed:'فاتني الموعد', away:'رُفض طلبي عند الحضور', doc:'طلبوا مستنداً آخر', delay:'تأخّر طلبي', life:'تغيّرت ظروفي', unclear:'لا أفهم ما حدث'},
  rec:{
    appt:['حدّث التاريخ والوقت في أوريفيا لتنتقل التذكيرات معهما.','أضف الموعد الجديد إلى تقويمك مرة أخرى.','إذا تغيّر المكان، تحقّق من العنوان الجديد قبل الذهاب.'],
    missed:['تواصل مع الجهة التي حجزت الموعد في أقرب وقت واطلب موعداً جديداً.','اذكر متى فاتك الموعد وسبب ذلك باختصار.','عندما يصلك موعد جديد، أضفه في أوريفيا.'],
    away:['اسألهم عن السبب، واطلب منهم كتابته إن أمكن.','اسأل بالضبط عمّا يجب أن تحضره أو تصلحه في المرة القادمة.','راجع قائمة ما تحتاجه لهذه الخطوة، ثم احجز من جديد.'],
    doc:['تحقّق ممن يطلب: كفيلك أم جهة حكومية أم بنك؟ احذر الرسائل من أرقام مجهولة تطلب مالاً أو بيانات شخصية.','اسأل بالضبط عن المستند، وهل يحتاجون الأصل أم نسخة، وما الموعد النهائي.','لست متأكداً أنها حقيقية؟ تواصل مع الجهة عبر الرقم المنشور على موقعها الرسمي.'],
    delay:['تحقّق من الحالة بنفسك إن كانت هناك طريقة رسمية (تبيّنها روابط الخطوة).','اسأل الجهة التي قدّمت عنك عن مرحلة الطلب، وهل تحتاج شيئاً منك.','انتبه لأي مهلة، مثل المدة المتاحة لإكمال إقامتك.'],
    life:['أخبر كفيلك أو صاحب العمل أو جامعتك فوراً، فبعض التغييرات تؤثر في طلبك.','اسألهم إن كان يجب إعادة أي شيء أو إلغاؤه.','ثم أجب عن أسئلة أوريفيا من جديد لتتوافق خطواتك مع وضعك الجديد.'],
  },
  recWho:'من يمكنه المساعدة', recUpdateAppt:'حدّث موعدي', recChecklist:'اعرض ما أحتاجه لهذه الخطوة', recRedo:'أجب عن الأسئلة من جديد', recAskPhrase:'هل يمكنك من فضلك أن تكتب السبب، وما يجب أن أحضره في المرة القادمة؟',
  beforeGo:'قبل أن تذهب', beforeSub:'كل ما يخص هذه الخطوة في مكان واحد.', bringThese:'أحضر هذه', whereGoing2:'إلى أين تذهب', whenGoing:'متى', expectTitle:'ماذا سيحدث عند وصولك', mayAsk:'ماذا تقول', readyGo:'أنا مستعد',
  noWhere:'أضف موعدك لترى المكان والوقت.',
  dkTitle:'لا بأس. لنكتشف ذلك معاً.', dkSub:'أجب عن بعض الأسئلة البسيطة.', dkNot:'لست متأكداً', dkResult:'هذا على الأرجح طريقك', dkOpen:'افتح هذه الرحلة', dkUnsure:'لم نتمكن من تحديد ذلك من إجاباتك. لا بأس: اسأل جهة يمكنها التحقق.',
  explain:'اشرح لي', termsTitle:'ماذا يعني هذا؟',
  idTitle:'لدي هذا. ما هو؟', idEntry:'وصلني شيء لا أفهمه', idWhat:'ماذا وصلك؟', idWords:'ما الكلمات التي تراها فيه؟', idNone:'لا أعرف أياً من هذه',
  idKinds:['مستند','رسالة نصية','بريد إلكتروني','إشعار','إيصال أو رقم مرجعي'], idFits:'أين يندرج', idOpen:'افتح هذه الخطوة', idNoneBody:'لا بأس. اسأل أوريفيا، أو اعرضه على شخص يمكنه المساعدة.',
  endDid:'ما أنجزته', endGot:'ما أصبح لديك', endKeep:'احتفظ بها بأمان', endRenew:'يحتاج إلى تجديد', endUnlock:'ما يتيحه لك هذا الآن', endAddDate:'أضف تاريخ انتهائه',
  welcomeBack:'أهلاً بعودتك', whyThis:'لماذا تخبرني أوريفيا بهذا؟', drawerTitle:'من أين تأتي هذه الإرشادات', srcOfficial:'مصدر رسمي', srcInstitution:'إرشادات مؤسسة', srcOther:'مصدر آخر',
  reviewDue:'موعد المراجعة القادمة', openSource:'اعرض المصدر', overdue:'تحتاج إلى إعادة تحقق',
});
EXTRA_ICONS.info = '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>';
EXTRA_ICONS.clock = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';

/* ---------- Content: what happens when you get there (verified facts only) ---------- */
(function(){
  const J = DATA.journeys;
  const add = (jid, sid, extra) => { const s = J[jid] && J[jid].stages.find(x=>x.id===sid); if(s) Object.assign(s, extra); };
  const v = (en, ar) => ({en, ar});
  add('dubai.eid.student','medical',{expect:[
    v('Have your passport and the form from your university ready.','جهّز جواز سفرك والنموذج من جامعتك.'),
    v('The test is a blood sample and a chest X-ray.','الفحص عينة دم وأشعة للصدر.'),
    v('You don’t get a result on the spot: your university receives it, usually within a few working days.','لا تحصل على النتيجة في الحال: تستلمها جامعتك عادةً خلال أيام عمل قليلة.'),
    v('Afterwards: your university moves your application on to fingerprints.','بعد ذلك: تنتقل جامعتك بطلبك إلى مرحلة البصمات.')]});
  add('dubai.eid.student','biometrics',{expect:[
    v('Have your passport and the appointment email ready.','جهّز جواز سفرك ورسالة الموعد.'),
    v('Staff scan your fingerprints for your Emirates ID.','يمسح الموظفون بصماتك من أجل الهوية الإماراتية.'),
    v('You don’t get your Emirates ID that day. The card is made later, and you’re told when it’s ready.','لا تستلم هويتك في اليوم نفسه. تُصنع البطاقة لاحقاً، ويتم إبلاغك عندما تصبح جاهزة.')]});
  add('dubai.eid.student','card',{expect:[
    v('Your university usually tells you where to collect the card. Often it’s at the university.','عادةً تخبرك جامعتك بمكان استلام البطاقة، وغالباً يكون في الجامعة.'),
    v('Keep your passport with you when you collect it.','احمل جواز سفرك معك عند الاستلام.')]});
  ['dubai.eid.employee','dubai.eid.family'].forEach(jid => {
    add(jid,'medical',{expect:[
      v('Go to the Medical Fitness Centre at your appointment time with your registration form, passport or Emirates ID, a white-background photo and a copy of your e-visa.','اذهب إلى مركز اللياقة الطبية في موعدك ومعك استمارة التسجيل وجواز سفرك أو هويتك الإماراتية وصورة بخلفية بيضاء ونسخة من تأشيرتك الإلكترونية.'),
      v('The test is a blood sample and a chest X-ray. Some jobs also need vaccinations.','الفحص عينة دم وأشعة للصدر، وبعض المهن تحتاج أيضاً إلى تطعيمات.'),
      v('Your result comes later by text message or email.','تصلك النتيجة لاحقاً برسالة نصية أو بالبريد الإلكتروني.')]});
    add(jid,'biometrics',{expect:[
      v('At an ICP service centre, staff take your fingerprints and signature.','في مركز خدمة الهيئة الاتحادية للهوية والجنسية، يأخذ الموظفون بصماتك وتوقيعك.'),
      v('You don’t get your Emirates ID that day. You can check its status in the UAEICP app.','لا تستلم هويتك في اليوم نفسه. يمكنك متابعة حالتها في تطبيق UAEICP.')]});
  });
  add('edinburgh.gp','register',{expect:[
    v('The practice may ask for proof of identity and proof of your address. Students may be asked for proof they’re studying.','قد تطلب العيادة إثبات هوية وإثبات عنوانك، وقد يُطلب من الطلاب إثبات الدراسة.'),
    v('They register you if you live in their area and they’re taking new patients. If not, try the next practice.','يسجّلونك إذا كنت تسكن في منطقتهم وكانوا يقبلون مرضى جدداً. وإلا فجرّب العيادة التالية.')]});
  add('edinburgh.bank','open',{expect:[
    v('The bank checks your documents, in the app or at the branch.','يتحقق البنك من مستنداتك عبر التطبيق أو في الفرع.'),
    v('Your debit card comes by post afterwards. Set up the bank’s app while you wait.','تصلك بطاقة الخصم بالبريد لاحقاً. فعّل تطبيق البنك أثناء الانتظار.')]});

  /* Journey endings: what you now have, what to keep, what renews, what it unlocks */
  const eidEnd = {
    got:[v('A UAE residence visa','تأشيرة إقامة في الإمارات'), v('An Emirates ID card','بطاقة الهوية الإماراتية')],
    keep:[v('Your Emirates ID card','بطاقة الهوية الإماراتية'), v('Your passport','جواز سفرك')],
    renew:['residence','eid'],
    unlock:[{journey:'dubai.uaepass', v:v('Set up UAE PASS','إعداد UAE PASS')}, {journey:'dubai.bank', v:v('Open a bank account','فتح حساب بنكي')}, {journey:'dubai.nol', v:v('Get around by Metro and bus','التنقل بالمترو والحافلات')}],
  };
  ['dubai.eid.student','dubai.eid.employee','dubai.eid.family'].forEach(jid => { if(J[jid]) J[jid].end = eidEnd; });
  if(J['edinburgh.evisa']) J['edinburgh.evisa'].end = {got:[v('A UKVI account with your eVisa','حساب UKVI فيه تأشيرتك الإلكترونية'), v('A way to make share codes','طريقة لإنشاء رموز المشاركة')], keep:[v('Your UKVI login details','بيانات الدخول إلى UKVI')], renew:['ukvisa','sharecode'],
    unlock:[{journey:'edinburgh.bank', v:v('Open a bank account','فتح حساب بنكي')}, {journey:'edinburgh.work', v:v('Work while you study','العمل أثناء الدراسة')}, {journey:'edinburgh.rent', v:v('Rent a home safely','استئجار سكن بأمان')}]};
  if(J['edinburgh.gp']) J['edinburgh.gp'].end = {got:[v('A GP practice you’re registered with','عيادة طبيب عام مسجّل لديها')], keep:[v('Your practice’s phone number','رقم هاتف عيادتك')], renew:[],
    unlock:[{journey:'edinburgh.bank', v:v('Open a bank account','فتح حساب بنكي')}]};
  ['dubai.bank','edinburgh.bank'].forEach(jid => { if(J[jid]) J[jid].end = {got:[v('A bank account','حساب بنكي'), v('A debit card','بطاقة خصم')], keep:[v('Your card and PIN (never share the PIN)','بطاقتك ورقمك السري (لا تشاركه أبداً)')], renew:[],
    unlock:[{journey: jid.startsWith('dubai') ? 'dubai.rent' : 'edinburgh.rent', v:v('Rent a home','استئجار سكن')}]}; });
  if(J['dubai.rent']) J['dubai.rent'].end = {got:[v('A tenancy contract','عقد إيجار')], keep:[v('Your contract and Ejari certificate','عقدك وشهادة إيجاري')], renew:['tenancy'], unlock:[]};

  /* The "I don't know" engine: questions normal people can answer */
  const pw = DATA.pathways && DATA.pathways['dubai.eid'];
  if(pw) pw.decide = {
    start:'study',
    q:{
      study:{q:v('Did you come to the UAE to study at a university or college?','هل جئت إلى الإمارات للدراسة في جامعة أو كلية؟'), yes:'uni', no:'job', unsure:'job'},
      uni:{q:v('Has your university sent you visa forms, or asked for your passport and a photo?','هل أرسلت إليك جامعتك نماذج تأشيرة، أو طلبت جواز سفرك وصورة؟'), yes:'=dubai.eid.student', no:'=dubai.eid.student?', unsure:'=dubai.eid.student?'},
      job:{q:v('Has a company in the UAE offered you a job?','هل عرضت عليك شركة في الإمارات وظيفة؟'), yes:'=dubai.eid.employee', no:'fam', unsure:'fam'},
      fam:{q:v('Are you joining a husband, wife or parent who lives in the UAE?','هل تنضم إلى زوج أو زوجة أو أحد الوالدين يقيم في الإمارات؟'), yes:'=dubai.eid.family', no:'self', unsure:'self'},
      self:{q:v('Are you applying on your own, for example as an investor, freelancer, remote worker or retiree?','هل تتقدّم بنفسك، مثلاً كمستثمر أو مستقل أو عامل عن بُعد أو متقاعد؟'), yes:'=dubai.eid.self', no:'=?', unsure:'=?'},
    },
    notes:{'dubai.eid.student?':v('Check with your university’s admissions or visa office first. Most universities sponsor their international students.','تحقّق أولاً من مكتب القبول أو التأشيرات في جامعتك، فمعظم الجامعات تكفل طلابها الدوليين.')},
    help:v('Call GDRFA Dubai (Amer) on 800 5111 and tell them why you’re in the UAE. They can tell you who should apply for your residence.','اتصل بإقامة دبي (آمر) على 800 5111 وأخبرهم بسبب وجودك في الإمارات، ويمكنهم إخبارك بمن يجب أن يتقدّم بطلب إقامتك.'),
  };
})();

/* ---------- Glossary: plain-language meanings, linked where the words appear ---------- */
const TERMS = {
  sponsor:{match:['sponsor','sponsors','الكفيل','كفيلك'], v:{en:'Sponsor', ar:'الكفيل'}, d:{en:'The organisation or person responsible for your residence application: often your university, your employer or a family member.', ar:'الجهة أو الشخص المسؤول عن طلب إقامتك: غالباً جامعتك أو صاحب العمل أو أحد أفراد عائلتك.'}},
  permit:{match:['entry permit','تصريح الدخول','تصريح دخولك'], v:{en:'Entry permit', ar:'تصريح الدخول'}, d:{en:'Permission to enter the UAE to start your residence. It has an expiry date: you must arrive before it runs out.', ar:'إذن بدخول الإمارات لبدء إقامتك. له تاريخ انتهاء، ويجب أن تصل قبله.'}},
  bio:{match:['biometrics','البصمات'], v:{en:'Biometrics (fingerprints)', ar:'البصمات'}, d:{en:'Your fingerprints and signature, taken for your Emirates ID. Everyone aged 15 and over gives them.', ar:'بصماتك وتوقيعك، تؤخذ من أجل الهوية الإماراتية. يعطيها كل من بلغ 15 عاماً فأكثر.'}},
  medical:{match:['medical fitness','فحص اللياقة'], v:{en:'Medical fitness test', ar:'فحص اللياقة الطبية'}, d:{en:'A routine health check for new UAE residents aged 18 and over: a blood test and a chest X-ray.', ar:'فحص صحي روتيني للمقيمين الجدد في الإمارات ممن بلغوا 18 عاماً فأكثر: فحص دم وأشعة للصدر.'}},
  residence:{match:['residence visa','تأشيرة الإقامة'], v:{en:'Residence visa', ar:'تأشيرة الإقامة'}, d:{en:'Permission to live in the UAE. Your Emirates ID is valid for as long as your residence visa.', ar:'إذن بالإقامة في الإمارات. تبقى هويتك الإماراتية صالحة ما دامت تأشيرة إقامتك صالحة.'}},
  eid:{match:['Emirates ID','الهوية الإماراتية'], v:{en:'Emirates ID', ar:'الهوية الإماراتية'}, d:{en:'The UAE’s ID card for residents. You need it for most services, like banks and UAE PASS.', ar:'بطاقة الهوية للمقيمين في الإمارات. تحتاج إليها لمعظم الخدمات، مثل البنوك وUAE PASS.'}},
  pran:{match:['PRAN'], v:{en:'PRAN', ar:'رقم الطلب (PRAN)'}, d:{en:'Your Emirates ID application number. Your visa office has it, and you can use it to check your card’s status.', ar:'رقم طلب الهوية الإماراتية. يملكه مكتب التأشيرات، ويمكنك استخدامه لمتابعة حالة البطاقة.'}},
  icp:{match:['ICP'], v:{en:'ICP', ar:'الهيئة الاتحادية للهوية والجنسية'}, d:{en:'The Federal Authority for Identity, Citizenship, Customs and Port Security. It issues Emirates ID cards.', ar:'الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ، وهي التي تصدر بطاقات الهوية الإماراتية.'}},
  gdrfa:{match:['GDRFA'], v:{en:'GDRFA', ar:'إقامة دبي'}, d:{en:'Dubai’s residency authority (General Directorate of Residency and Foreigners Affairs). It handles residence visas in Dubai.', ar:'الإدارة العامة للإقامة وشؤون الأجانب في دبي، وهي التي تتولى تأشيرات الإقامة في دبي.'}},
  amer:{match:['Amer'], v:{en:'Amer', ar:'آمر'}, d:{en:'GDRFA Dubai’s service centres and helpline (800 5111) for visa questions.', ar:'مراكز خدمة إقامة دبي وخط مساعدتها (800 5111) لأسئلة التأشيرات.'}},
  uaepass:{match:['UAE PASS'], v:{en:'UAE PASS', ar:'UAE PASS'}, d:{en:'The UAE’s national digital ID. You set it up with your Emirates ID and use it to log in to government apps.', ar:'الهوية الرقمية الوطنية في الإمارات. تفعّلها بهويتك الإماراتية وتستخدمها لتسجيل الدخول إلى التطبيقات الحكومية.'}},
  pro:{match:['PRO'], v:{en:'PRO', ar:'مندوب العلاقات العامة'}, d:{en:'Public Relations Officer: the person at a company or university who handles visa paperwork.', ar:'مندوب العلاقات العامة: الشخص في الشركة أو الجامعة الذي يتولى أوراق التأشيرات.'}},
  mohre:{match:['MOHRE'], v:{en:'MOHRE', ar:'وزارة الموارد البشرية والتوطين'}, d:{en:'The UAE Ministry of Human Resources and Emiratisation. It handles work permits and workers’ rights. Free advice line: 80084.', ar:'وزارة الموارد البشرية والتوطين في الإمارات، وتتولى تصاريح العمل وحقوق العمال. خط الاستشارات المجاني: 80084.'}},
  ejari:{match:['Ejari','إيجاري'], v:{en:'Ejari', ar:'إيجاري'}, d:{en:'Dubai’s system for registering tenancy contracts.', ar:'نظام دبي لتسجيل عقود الإيجار.'}},
  evisa:{match:['eVisa'], v:{en:'eVisa', ar:'التأشيرة الإلكترونية'}, d:{en:'Your UK immigration status as an online record, instead of a card. You see it in your UKVI account.', ar:'وضعك كمهاجر في بريطانيا كسجل إلكتروني بدلاً من بطاقة. تراه في حسابك على UKVI.'}},
  ukvi:{match:['UKVI'], v:{en:'UKVI', ar:'UKVI'}, d:{en:'UK Visas and Immigration: the part of the Home Office that runs visas.', ar:'هيئة التأشيرات والهجرة في بريطانيا، وهي جزء من وزارة الداخلية يتولى التأشيرات.'}},
  sharecode:{match:['share code','share codes','رمز المشاركة','رمز مشاركة'], v:{en:'Share code', ar:'رمز المشاركة'}, d:{en:'A 9-character code that lets an employer or landlord check your status online. It lasts 90 days.', ar:'رمز من 9 خانات يتيح لصاحب العمل أو المالك التحقق من وضعك عبر الإنترنت. صالح لمدة 90 يوماً.'}},
  brp:{match:['BRP'], v:{en:'BRP', ar:'بطاقة BRP'}, d:{en:'Biometric residence permit: the old UK visa card that eVisas have replaced.', ar:'تصريح الإقامة البيومتري: بطاقة التأشيرة البريطانية القديمة التي حلّت محلها التأشيرة الإلكترونية.'}},
  gwf:{match:['GWF'], v:{en:'GWF number', ar:'رقم GWF'}, d:{en:'The reference number from your UK visa application. It’s in your application emails.', ar:'الرقم المرجعي لطلب تأشيرتك البريطانية، وتجده في رسائل الطلب.'}},
  gp:{match:['GP'], v:{en:'GP', ar:'الطبيب العام (GP)'}, d:{en:'General practitioner: your family doctor, and the first place to go for most health problems.', ar:'الطبيب العام: طبيب العائلة، وأول مكان تقصده لمعظم المشكلات الصحية.'}},
  nhs24:{match:['NHS 24'], v:{en:'NHS 24', ar:'NHS 24'}, d:{en:'Scotland’s 111 service: urgent health advice when your GP is closed.', ar:'خدمة 111 في اسكتلندا: استشارة صحية عاجلة عندما تكون عيادتك مغلقة.'}},
  nino:{match:['National Insurance number','رقم التأمين الوطني'], v:{en:'National Insurance number', ar:'رقم التأمين الوطني'}, d:{en:'Your personal number for tax and National Insurance in the UK. It stays the same for life.', ar:'رقمك الشخصي للضرائب والتأمين الوطني في بريطانيا، ويبقى كما هو مدى الحياة.'}},
  ctax:{match:['council tax','ضريبة المجلس'], v:{en:'Council tax', ar:'ضريبة المجلس'}, d:{en:'A yearly charge on each home for local services. Homes where everyone is a full-time student don’t pay it.', ar:'رسم سنوي على كل مسكن مقابل الخدمات المحلية. المساكن التي كل سكانها طلاب بدوام كامل لا تدفعه.'}},
  hmo:{match:['HMO'], v:{en:'HMO', ar:'السكن المشترك (HMO)'}, d:{en:'A home shared by 3 or more people who aren’t related. It needs a licence.', ar:'مسكن يتشاركه 3 أشخاص أو أكثر لا تربطهم قرابة، ويحتاج إلى ترخيص.'}},
  prt:{match:['Private Residential Tenancy'], v:{en:'Private Residential Tenancy', ar:'الإيجار السكني الخاص'}, d:{en:'The standard private rental in Scotland. It has no fixed end date.', ar:'النوع المعتاد من الإيجار الخاص في اسكتلندا، وليس له تاريخ انتهاء ثابت.'}},
  ihs:{match:['Immigration Health Surcharge'], v:{en:'Immigration Health Surcharge', ar:'رسوم الصحة للهجرة'}, d:{en:'The fee paid with a UK visa that lets you use the NHS.', ar:'رسوم تُدفع مع التأشيرة البريطانية وتتيح لك استخدام NHS.'}},
};
const esc2 = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function termRegex(){
  const all = []; Object.entries(TERMS).forEach(([id, t0]) => t0.match.forEach(m => all.push([m, id])));
  all.sort((a,b) => b[0].length - a[0].length);
  const src = all.map(([m]) => /^[A-Z0-9 ]+$/.test(m) ? `\\b${esc2(m)}\\b` : (/[a-z]/i.test(m) ? `\\b${esc2(m)}\\b` : esc2(m))).join('|');
  const map = {}; all.forEach(([m,id]) => map[m.toLowerCase()] = id);
  return {re:new RegExp(src, 'gi'), map, caseSens:new Set(all.filter(([m]) => /^[A-Z]{2,}[A-Z0-9 ]*$/.test(m)).map(([m]) => m))};
}
let TERM_RX = null;
/* Wrap the first appearance of each term on the screen in a tappable button */
function linkTerms(root){
  if(!root) return; TERM_RX = TERM_RX || termRegex();
  const seen = new Set();
  const targets = root.querySelectorAll('.blk-p, .blk-list li, .blk-steps li > span, .tip, .card p, .answer p, .gstep > p, .wait-for, .expect-list li, .partner-note p');
  targets.forEach(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {acceptNode: n => n.parentElement.closest('button, a, b, .term') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    const nodes = []; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const text = node.nodeValue; TERM_RX.re.lastIndex = 0; let m, out = [], last = 0;
      while((m = TERM_RX.re.exec(text))){
        const word = m[0];
        if(TERM_RX.caseSens.has(word.toUpperCase()) && word !== word.toUpperCase()) continue; // "Pro" ≠ "PRO"
        const id = TERM_RX.map[word.toLowerCase()]; if(!id || seen.has(id)) continue;
        seen.add(id); out.push([m.index, word, id]);
      }
      if(!out.length) return;
      const frag = document.createDocumentFragment();
      out.forEach(([i, word, id]) => {
        frag.appendChild(document.createTextNode(text.slice(last, i)));
        const b = document.createElement('button'); b.className = 'term'; b.dataset.act = 'term'; b.dataset.v = id; b.textContent = word;
        b.setAttribute('aria-label', `${word}: ${t('explain')}`); frag.appendChild(b); last = i + word.length;
      });
      frag.appendChild(document.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag, node);
    });
  });
}
function termSheet(id){
  const tm = TERMS[id]; if(!tm) return;
  sheet(`<span class="label">${t('termsTitle')}</span><h2>${L(tm.v)}</h2><p class="lead" style="color:var(--ink)">${L(tm.d)}</p>
    ${canSpeak ? listenBtn() : ''}<button class="btn btn-primary" data-act="closeSheet">${t('gotIt')}</button>`);
  logEv('term', {detail:id});
}

/* ---------- Contacts shown in recovery sheets ---------- */
function contactsHtml(j){
  const cards = (j && j.stuck && j.stuck.cards) || [];
  return `${partnerCard()}${cards.map(c=>`<div class="help-card"><strong>${L(c.title)}</strong>${c.phone?`<a class="phone" dir="ltr" href="tel:${c.phone.replace(/\s/g,'')}">${c.phone}</a>`:''}<p>${L(c.body)}</p></div>`).join('')}`;
}
const curStage = () => { const j = DATA.journeys[S.params.id]; return j && S.params.i != null ? j.stages[S.params.i] : null; };

/* ---------- Waiting state ---------- */
function waitingCard(jid, s){
  if(!s.wait || apptOf(jid, s.id)) return '';
  return `<div class="wait-card">
    <div class="wait-head">${svg('clock','place-ico')}<span class="label">${t('waitingNow')}</span></div>
    <p class="wait-for"><b>${t('waitingFor')}:</b> ${L(s.wait)}</p>
    <p class="wait-calm">${t('noActionYet')}</p>
    <span class="label">${t('whileWaiting')}</span>
    <ul class="wait-tips">${t('waitTips').map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="choices">
      <button class="choice" data-act="wLonger"><span>${t('wLonger')}</span>${chev()}</button>
      <button class="choice" data-act="identify"><span>${t('wMessage')}</span>${chev()}</button>
      <button class="choice" data-act="recover" data-v="doc"><span>${t('wAnotherDoc')}</span>${chev()}</button>
      <button class="choice" data-act="changed"><span>${t('wElse')}</span>${chev()}</button>
    </div></div>`;
}
function waitLonger(){
  const j = DATA.journeys[S.params.id], p = ['slow','late','status'].map(id => (j.problems||[]).find(x=>x.id===id)).find(Boolean);
  if(p){ S.lastProblem = {j:S.params.id, p:p.id}; wrongSheet(p.id); } else recoverSheet('delay');
  logEv('wait_longer');
}

/* ---------- Something changed ---------- */
function changedSheet(){
  const keys = ['appt','missed','away','doc','delay','site','life','unclear'];
  sheet(`<h2>${t('changedTitle')}</h2><p class="lead">${t('changedAsk')}</p>
    <div class="choices">${keys.map(k=>`<button class="choice" data-act="recover" data-v="${k}"><span>${t('ch')[k]}</span>${chev()}</button>`).join('')}</div>
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
  logEv('changed_open');
}
function recoverSheet(k){
  if(k === 'unclear'){ identifySheet(); return; }
  const j = DATA.journeys[S.params.id], s = curStage();
  const missedP = k === 'missed' && j && (j.problems||[]).find(p=>p.id==='missed');
  if(missedP){ S.lastProblem = {j:S.params.id, p:'missed'}; wrongSheet('missed'); logEv('recover', {detail:k}); return; }
  const extra = [];
  if(k === 'appt' && s && s.appt) extra.push(`<button class="btn btn-primary" data-act="recApptEdit">${svg('cal','btn-ico')}<span>${t('recUpdateAppt')}</span></button>`);
  if((k === 'away' || k === 'doc') && s && s.need) extra.push(`<button class="btn btn-quiet" data-act="recChecklist">${t('recChecklist')}</button>`);
  if(k === 'life' && j && (j.pathway || j.finder)) extra.push(`<button class="btn btn-quiet" data-act="${j.pathway ? 'pathway' : 'redo'}" ${j.pathway ? `data-v="${j.pathway}"` : ''}>${t('recRedo')}</button>`);
  if(k === 'delay' && j && j.city === 'dubai' && /eid/.test(S.params.id||'')) extra.push(`<button class="btn btn-quiet" data-act="docEdit" data-v="deadline60">${L(DOC_TYPES.deadline60.name)}</button>`);
  sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="changed">${chev()}${t('changedTitle')}</button></div>
    <h2>${t('ch')[k]}</h2>
    <div class="answer"><h3>${t('tryThis')}</h3><ol class="rec-steps">${t('rec')[k].map(x=>`<li>${x}</li>`).join('')}</ol></div>
    ${k === 'away' ? `<div class="phrase"><span class="label" style="color:var(--signMuted)">${t('showStaff')}</span>${staffInner({en:UI.en.recAskPhrase, ar:UI.ar.recAskPhrase, mine:t('recAskPhrase')})}</div>` : ''}
    ${extra.length ? `<div class="place-actions">${extra.join('')}</div>` : ''}
    <span class="label">${t('recWho')}</span>${contactsHtml(j)}
    ${outcomeHtml()}`, true);
  logEv('recover', {detail:k});
}

/* ---------- Before you go ---------- */
function hasBefore(s){ return !!(s.appt || (s.need && s.need.length) || (s.places && s.places.length) || s.expect); }
function beforeBtn(s){ return hasBefore(s) ? `<button class="before-btn" data-act="beforeGo">${svg('check','place-ico')}<span><b>${t('beforeGo')}</b><small>${t('beforeSub')}</small></span>${chev()}</button>` : ''; }
function beforeSheet(){
  const jid = S.params.id, j = DATA.journeys[jid], s = curStage(); if(!s) return;
  const a = apptOf(jid, s.id), ticks = S.checks[jid]||{};
  const phrase = (s.blocks||[]).find(b=>b.t==='phraseCard');
  sheet(`<span class="label">${L(s.label)}</span><h2>${t('beforeGo')}</h2>
    ${s.need && s.need.length ? `<div class="bg-sec"><span class="label">${t('bringThese')}</span><ul class="bg-list">${s.need.map(x=>`<li class="${ticks[x.id]?'on':''}"><span class="tickmini" aria-hidden="true"></span><span>${L(x.v)}${x.form?` <span class="form-tag">${t('form')[x.form]}</span>`:''}</span></li>`).join('')}</ul></div>` : ''}
    ${s.appt ? `<div class="bg-sec"><span class="label">${t('whenGoing')} · ${t('whereGoing2')}</span>${a ? `<strong>${fmtWhen(a)}</strong>${a.where?`<span class="place-addr" dir="auto">${esc(a.where)}</span><a class="btn btn-primary linkbtn" href="${dirUrl(a.where)}" target="_blank" rel="noopener">${svg('pin','btn-ico')} ${t('takeMe')}</a>`:''}` : `<span class="muted">${t('noWhere')}</span>`}</div>` : ''}
    ${!s.appt && s.places && s.places.length ? `<div class="bg-sec"><span class="label">${t('whereGoing2')}</span>${s.places.map(placeCard).join('')}</div>` : ''}
    ${s.expect ? `<div class="bg-sec"><span class="label">${t('expectTitle')}</span><ol class="expect-list">${s.expect.map(x=>`<li>${L(x)}</li>`).join('')}</ol></div>` : ''}
    ${phrase ? `<div class="bg-sec"><span class="label">${t('mayAsk')}</span>${phraseHtml({phrase:phrase.v})}</div>` : ''}
    <button class="btn btn-primary" data-act="closeSheet">${t('readyGo')} ${chev()}</button>`, true);
  linkTerms(document.getElementById('sheet'));
  logEv('before_open');
}
function expectBlock(s){
  return s.expect ? `<div class="expect"><span class="label">${t('expectTitle')}</span><ol class="expect-list">${s.expect.map(x=>`<li>${L(x)}</li>`).join('')}</ol></div>` : '';
}

/* ---------- "I don't know" engine ---------- */
function decideSheet(pid, key, trail){
  const pw = DATA.pathways[pid], d = pw.decide; key = key || d.start; trail = trail || '';
  if(key.startsWith('=')){
    const target = key.slice(1);
    if(target === '?'){
      sheet(`<h2>${t('dkTitle')}</h2><div class="answer"><p>${t('dkUnsure')}</p><p>${L(d.help)}</p></div>
        ${contactsHtml(DATA.journeys[(pw.options.find(o=>o.journey)||{}).journey])}<button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
      logEv('dk_result', {detail:'unsure'}); return;
    }
    const jid = target.replace('?',''), j = DATA.journeys[jid], note = d.notes && d.notes[target];
    sheet(`<span class="label">${t('dkResult')}</span><h2>${L(j.title)}</h2>
      ${note ? `<div class="tip warn-tip"><b>${t('important')}</b>${L(note)}</div>` : ''}
      <button class="btn btn-primary" data-act="pathOpt" data-v="${jid}">${t('dkOpen')} ${chev()}</button>
      <button class="linkish" data-act="dkStart" data-v="${pid}">${t('redo')}</button>`);
    logEv('dk_result', {detail:jid}); return;
  }
  const q = d.q[key], n = trail.split(',').filter(Boolean).length;
  sheet(`<span class="label">${t('dkTitle')}</span><h2>${L(q.q)}</h2>
    <div class="choices">
      <button class="choice" data-act="dkAns" data-v="${pid}|${q.yes}|${trail},${key}"><span>${t('yes')}</span>${chev()}</button>
      <button class="choice" data-act="dkAns" data-v="${pid}|${q.no}|${trail},${key}"><span>${t('no')}</span>${chev()}</button>
      <button class="choice" data-act="dkAns" data-v="${pid}|${q.unsure}|${trail},${key}"><span>${t('dkNot')}</span>${chev()}</button>
    </div>
    <p class="disclaimer">${t('privacy')}</p>
    ${n ? `<button class="linkish" data-act="dkStart" data-v="${pid}">${t('redo')}</button>` : ''}`);
}

/* ---------- "I have this. What is it?" ---------- */
const ID_WORDS = {
  dubai:[['pran','card'],['permit','permit'],['medical','medical'],['bio','biometrics'],['residence','issued'],['eid','card'],['uaepass',null,'dubai.uaepass'],['ejari',null,'dubai.rent'],['sponsor',null,null]],
  edinburgh:[['evisa','account','edinburgh.evisa'],['ukvi','account','edinburgh.evisa'],['sharecode','share','edinburgh.evisa'],['brp','account','edinburgh.evisa'],['gwf','account','edinburgh.evisa'],['nino','nino','edinburgh.work'],['ctax','students','edinburgh.counciltax'],['gp','register','edinburgh.gp'],['hmo','check','edinburgh.rent']],
};
function eidJourney(){
  const opts = ['dubai.eid.employee','dubai.eid.family','dubai.eid.self','dubai.eid.student'];
  return opts.find(id => started(id)) || 'dubai.eid.student';
}
function identifySheet(step, kind){
  if(!step){
    sheet(`<h2>${t('idTitle')}</h2><p class="lead">${t('idWhat')}</p>
      <div class="choices">${t('idKinds').map((k,i)=>`<button class="choice" data-act="idKind" data-v="${i}"><span>${k}</span>${chev()}</button>`).join('')}</div>
      <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
    logEv('identify_open'); return;
  }
  const words = ID_WORDS[S.city] || [];
  sheet(`<div class="sheet-top"><button class="linkish back-link" data-act="identify">${chev()}${t('idWhat')}</button></div>
    <h2>${t('idWords')}</h2>
    <div class="choices">${words.map(([id])=>`<button class="choice" data-act="idWord" data-v="${id}"><span>${L(TERMS[id].v)}</span>${chev()}</button>`).join('')}
      <button class="choice" data-act="idWord" data-v="none"><span>${t('idNone')}</span>${chev()}</button></div>`);
}
function identifyResult(id){
  if(id === 'none'){
    sheet(`<h2>${t('idTitle')}</h2><div class="answer"><p>${t('idNoneBody')}</p></div>
      <button class="btn btn-primary" data-act="askOpen">${t('askEntry')}</button>
      ${contactsHtml(DATA.journeys[S.params.id])}<button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
    logEv('identify_word', {detail:'none'}); return;
  }
  const row = (ID_WORDS[S.city]||[]).find(r=>r[0]===id) || [id];
  const jid = row[2] === undefined ? eidJourney() : row[2], j = jid && DATA.journeys[jid];
  const st = j && (row[1] ? j.stages.find(s=>s.id===row[1]) : null);
  sheet(`<span class="label">${t('termsTitle')}</span><h2>${L(TERMS[id].v)}</h2>
    <p class="lead" style="color:var(--ink)">${L(TERMS[id].d)}</p>
    ${j ? `<div class="bg-sec"><span class="label">${t('idFits')}</span><strong>${L(j.title)}${st ? ' · ' + L(st.label) : ''}</strong></div>
      <button class="btn btn-primary" data-act="idGo" data-v="${jid}|${st ? j.stages.indexOf(st) : -1}">${t('idOpen')} ${chev()}</button>` : ''}
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
  logEv('identify_word', {detail:id});
}

/* ---------- Journey end ---------- */
function endHtml(jid){
  const j = DATA.journeys[jid], e = j.end;
  const did = `<div class="bg-sec"><span class="label">${t('endDid')}</span><ul class="bg-list done-list">${j.stages.filter(s=>s.id!=='next').map(s=>`<li class="on"><span class="tickmini" aria-hidden="true"></span><span>${L(s.label)}</span></li>`).join('')}</ul></div>`;
  if(!e) return did;
  return `${did}
    ${e.got && e.got.length ? `<div class="bg-sec"><span class="label">${t('endGot')}</span><ul class="blk-list">${e.got.map(x=>`<li>${L(x)}</li>`).join('')}</ul></div>` : ''}
    ${e.keep && e.keep.length ? `<div class="bg-sec"><span class="label">${t('endKeep')}</span><ul class="blk-list">${e.keep.map(x=>`<li>${L(x)}</li>`).join('')}</ul></div>` : ''}
    ${e.renew && e.renew.length ? `<div class="bg-sec"><span class="label">${t('endRenew')}</span><div class="choices">${e.renew.filter(d=>DOC_TYPES[d]).map(d=>`<button class="choice" data-act="docEdit" data-v="${d}"><span class="main"><span>${L(DOC_TYPES[d].name)}</span><small>${(S.docs||{})[d] ? t('docsExpiresOn')+' '+fmtDate(S.docs[d]) : t('endAddDate')}</small></span>${chev()}</button>`).join('')}</div></div>` : ''}
    ${e.unlock && e.unlock.length ? `<div class="bg-sec"><span class="label">${t('endUnlock')}</span><div class="choices">${e.unlock.filter(u=>DATA.journeys[u.journey]).map(u=>`<button class="choice" data-act="journey" data-v="${u.journey}"><span>${L(u.v)}</span>${isDone(u.journey)?`<span class="pill pill-ok">✓</span>`:chev()}</button>`).join('')}</div></div>` : ''}`;
}

/* ---------- Source drawer + review dates ---------- */
const REVIEW_DAYS = 90;
function srcType(url){
  const h = (()=>{ try{ return new URL(url).hostname; }catch(e){ return ''; } })();
  if(/(\.gov\.uk|\.gov\.ae|\.gov\.scot|\.nhs\.uk|nhsinform\.scot|\.scot\.nhs\.uk|nhslothian\.scot|nhs24\.scot|u\.ae|icp\.gov\.ae|gdrfad\.gov\.ae|dha\.gov\.ae|dubaihealth\.ae|mohre\.gov\.ae|khda\.gov\.ae|rta\.ae|mygov\.scot|transport\.gov\.scot|edinburgh\.gov\.uk|landlordregistrationscotland\.gov\.uk|ons\.gov\.uk|parliament\.uk|dubailand\.gov\.ae|dlp\.dubai\.gov\.ae|sanadak\.gov\.ae|ico\.org\.uk|fscs\.org\.uk|financial-ombudsman\.org\.uk|ofcom\.org\.uk|tvlicensing\.co\.uk)$/.test(h) || /\.gov\./.test(h)) return 'official';
  if(/\.ac\.uk$|\.edu$|\.ac\.ae$|university|murdoch|siu-dubai|ukcisa\.org\.uk/.test(h)) return 'institution';
  return 'other';
}
function checkedDate(j){ const d = new Date((j.checked && j.checked.en) || ''); return isNaN(d) ? null : d; }
function reviewDue(j){ const d = checkedDate(j); return d ? new Date(d.getTime() + REVIEW_DAYS * 864e5) : null; }
function sourceDrawer(){
  const j = DATA.journeys[S.params.id]; if(!j) return;
  const srcs = j.sources || (j.source ? [j.source] : []);
  const groups = {official:[], institution:[], other:[]}; srcs.forEach(s => groups[srcType(s.url)].push(s));
  const p = partner(), note = p && p.notes[S.params.id];
  const due = reviewDue(j), loc = ({fil:'fil-PH', ur:'ur-PK', hi:'hi-IN', ar:'ar-AE', fr:'fr-FR', zh:'zh-CN', ru:'ru-RU', bn:'bn-BD', ml:'ml-IN'})[lang()] || 'en-GB';
  const fd = d => { try{ return d.toLocaleDateString(loc, {day:'numeric', month:'long', year:'numeric'}); }catch(e){ return d.toDateString(); } };
  const sec = (k, label) => groups[k].length ? `<div class="bg-sec"><span class="label">${label}</span>${groups[k].map(s=>`<a class="choice src-row" href="${s.url}" target="_blank" rel="noopener"><span class="main"><span>${L(s.name)}</span><small dir="ltr">${(()=>{ try{ return new URL(s.url).hostname; }catch(e){ return ''; } })()}</small></span>${chev()}</a>`).join('')}</div>` : '';
  sheet(`<h2>${t('drawerTitle')}</h2>
    ${sec('official', t('srcOfficial'))}
    ${note ? `<div class="bg-sec"><span class="label">${t('srcInstitution')}</span><strong>${L(p.name)}</strong></div>` : ''}
    ${sec('institution', t('srcInstitution'))}${sec('other', t('srcOther'))}
    <div class="bg-sec"><span class="label">${t('checked')}</span><strong>${L(j.checked)}</strong>
      ${due ? `<span class="muted">${t('reviewDue')}: ${fd(due)}${due < new Date() ? ` · <b>${t('overdue')}</b>` : ''}</span>` : ''}</div>
    <p class="disclaimer">${t('disclaimer')}</p>
    <button class="btn btn-quiet" data-act="closeSheet">${t('close')}</button>`);
  logEv('sources_open');
}

/* ---------- Button handlers for this file ---------- */
function navAct(act, v){
  switch(act){
    case 'term': termSheet(v); return true;
    case 'wLonger': waitLonger(); return true;
    case 'changed': changedSheet(); return true;
    case 'recover': recoverSheet(v); return true;
    case 'recApptEdit': closeSheet(); S.params = Object.assign({}, S.params, {editAppt:curStage().id}); render(); scrollToSel('.appt-form'); return true;
    case 'recChecklist': closeSheet(); scrollToSel(document.querySelector('.device .quick') ? '.quick' : '.need-box'); return true;
    case 'beforeGo': beforeSheet(); return true;
    case 'dkStart': decideSheet(v); logEv('dk_open', {detail:v}); return true;
    case 'dkAns': { const [pid, key, trail] = v.split('|'); decideSheet(pid, key, trail); return true; }
    case 'identify': identifySheet(); return true;
    case 'idKind': identifySheet(2, +v); return true;
    case 'idWord': identifyResult(v); return true;
    case 'idGo': { const [jid, i] = v.split('|'); closeSheet(); touch(jid); +i >= 0 ? go('step', {id:jid, i:+i}) : go('journey', {id:jid}); return true; }
    case 'whyThis': sourceDrawer(); return true;
  }
  return false;
}
