/* =========================================================
   BEFORE YOU MOVE · DOCUMENTS (UK → UAE), week 6, 29 Oct 2026
   Source-checked against the official pages below on 29 Oct 2026; awaiting human review (no review record).
   Rule kept from Ina's batch 1: no universal attestation rule is asserted. Whoever asks for a document decides
   whether it must be legalised, attested or recognised; the guide explains the official route when they do.
   Arabic is a first draft for language review.
   ========================================================= */
(function(){
  if(typeof DATA==='undefined'||!DATA.journeys) return;
  const v = (en, ar) => ({en, ar});
  const it = (id, en, ar) => ({id, v:{en, ar}});
  const S = (en, ar, url) => ({name:{en, ar}, url});
  const SRC = {
    study:   S('UAE government: residence visa for studying in the UAE', 'البوابة الرسمية لحكومة الإمارات: تأشيرة الإقامة للدراسة في الدولة', 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-studying-in-the-uae'),
    general: S('UAE government: general provisions for the residence visa', 'البوابة الرسمية لحكومة الإمارات: الأحكام العامة لتأشيرة الإقامة', 'https://u.ae/en/information-and-services/visa-and-emirates-id/Visa-information/general-provisions-for-the-residence-visa'),
    legalise:S('GOV.UK: get a document legalised', 'GOV.UK: تصديق المستندات (الأبوستيل)', 'https://www.gov.uk/get-document-legalised'),
    mofa:    S('UAE Ministry of Foreign Affairs: attestation of official documents and certificates', 'وزارة الخارجية الإماراتية: تصديق المستندات والشهادات الرسمية', 'https://www.mofa.gov.ae/en/services/attestation'),
    recog:   S('UAE government: student admission and qualification recognition', 'البوابة الرسمية لحكومة الإمارات: قبول الطلاب والاعتراف بالمؤهلات', 'https://u.ae/en/information-and-services/education/higher-education/Student-admission-and-qualification-recognition'),
  };
  const P = (id, q, a) => ({id, q, a});
  DATA.journeys['dubai.docs.before'] = {
    city:'dubai', need:'docs', icon:'docs',
    title:v('Get your documents ready before you move (UK to UAE)', 'جهّز مستنداتك قبل الانتقال (من المملكة المتحدة إلى الإمارات)'),
    doneTitle:v('Your documents are ready to travel.', 'مستنداتك جاهزة للسفر.'),
    sources:[SRC.study, SRC.general, SRC.legalise, SRC.mofa, SRC.recog],
    checked:v('29 Oct 2026', '29 أكتوبر 2026'), trust:{reviewed:false, tested:0},
    stages:[
      {id:'ask', level:'source', label:v('Ask first', 'اسأل أولاً'), title:v('Ask what each place needs', 'اسأل عمّا يحتاجه كل طرف'), help:['unsure','else'],
       now:v('Next: ask your university which documents it needs, and in what form.', 'التالي: اسأل جامعتك عن المستندات التي تحتاجها وبأي شكل.'),
       blocks:[
        {t:'steps', v:[
          v('Ask your university’s admissions or visa office which documents they need from you, and whether each one must be legalised, attested or recognised.', 'اسأل مكتب القبول أو التأشيرات في جامعتك عن المستندات التي يحتاجونها منك، وهل يجب تصديق كل منها أو اعتماده أو معادلته.'),
          v('If an employer or another office will also need your documents, ask them the same question.', 'إذا كانت جهة عمل أو جهة أخرى ستحتاج مستنداتك أيضاً، فاسألها السؤال نفسه.'),
          v('Write down what each of them says. Requirements differ, so Orivia doesn’t assume one rule for everyone.', 'دوّن ما تقوله كل جهة. تختلف المتطلبات، لذلك لا يفترض أوريفيا قاعدة واحدة للجميع.'),
        ]},
        {t:'p', v:v('GOV.UK’s advice is the same: if an official abroad asks you for a UK document, ask them whether it needs to be legalised.', 'ونصيحة GOV.UK هي نفسها: إذا طلب منك مسؤول في الخارج مستنداً بريطانياً، فاسأله إن كان يحتاج إلى تصديق.')},
       ],
       need:[it('offer','Your offer letter from the university','خطاب القبول من الجامعة'), it('list','The list of documents they asked for','قائمة المستندات التي طلبوها')],
       staff:v('Which documents do you need from me before I travel, and does each one need to be legalised, attested or recognised?', 'ما المستندات التي تحتاجونها مني قبل السفر، وهل يحتاج كل منها إلى تصديق أو اعتماد أو معادلة؟')},
      {id:'visa', level:'source', label:v('Visa documents', 'مستندات التأشيرة'), title:v('Gather what your student visa needs', 'اجمع ما تحتاجه تأشيرة الدراسة'), help:['else'],
       blocks:[
        {t:'list', v:[
          v('Your university can sponsor your student residence visa. A UAE-resident parent can sponsor you instead.', 'يمكن لجامعتك أن تكفل تأشيرة إقامتك الدراسية، ويمكن بدلاً من ذلك أن يكفلك أحد والديك المقيم في الإمارات.'),
          v('You need a certificate from the university showing how long your studies last. Your university issues it.', 'تحتاج إلى شهادة من الجامعة تبيّن مدة دراستك، وتصدرها جامعتك.'),
          v('The general visa rules list a copy of your passport and medical insurance (or a health card).', 'تذكر الأحكام العامة للتأشيرة نسخة من جواز سفرك وتأميناً طبياً (أو بطاقة صحية).'),
          v('If you’re 18 or over, you have a medical fitness test after you arrive, and you apply for your Emirates ID.', 'إذا كان عمرك 18 عاماً أو أكثر، فستُجري فحص اللياقة الطبية بعد وصولك، وتتقدّم بطلب الهوية الإماراتية.'),
        ]},
       ],
       need:[it('passport','Your passport, and a copy of it','جواز سفرك ونسخة منه'), it('certificate','The university’s certificate of your study period','شهادة الجامعة بمدة دراستك'), it('insurance','Proof of your medical insurance','إثبات تأمينك الطبي')]},
      {id:'uk', level:'source', label:v('UK documents', 'المستندات البريطانية'), title:v('Get UK documents legalised, if you’re asked to', 'صدّق مستنداتك البريطانية إذا طُلب منك ذلك'), help:['notary','else'],
       blocks:[
        {t:'steps', v:[
          v('Check whether the document must be certified first. Documents from a court, a public registry, a government department or a registered doctor don’t need this; others must be certified by a UK notary or solicitor.', 'تحقّق إن كان المستند يحتاج إلى توثيق أولاً. لا تحتاج مستندات المحاكم أو السجلات العامة أو الجهات الحكومية أو الأطباء المسجلين إلى ذلك، أما غيرها فيجب أن يوثقها كاتب عدل أو محامٍ في المملكة المتحدة.'),
          v('Apply online to the Legalisation Office for an apostille: a paper one (you post your documents) or an e-Apostille (you upload PDFs signed by a UK notary or solicitor).', 'قدّم طلباً عبر الإنترنت إلى مكتب التصديق للحصول على «أبوستيل»: ورقي (ترسل مستنداتك بالبريد) أو إلكتروني (ترفع ملفات PDF موقّعة من كاتب عدل أو محامٍ بريطاني).'),
        ]},
       ],
       need:[it('docs','The original documents you were asked for','المستندات الأصلية التي طُلبت منك')],
       cost:v('£45 per document with the standard service, plus postage or courier. No refund if a document can’t be legalised.', '45 جنيهاً إسترلينياً لكل مستند بالخدمة العادية، إضافة إلى البريد أو شركة التوصيل. لا يُستردّ المبلغ إذا تعذّر تصديق المستند.'),
       time:v('Usually up to 25 working days with the standard service, plus postage.', 'عادةً حتى 25 يوم عمل بالخدمة العادية، إضافة إلى وقت البريد.'),
       wait:v('The Legalisation Office to return your apostille.', 'أن يعيد مكتب التصديق الأبوستيل إليك.')},
      {id:'uae', level:'source', label:v('UAE attestation', 'التصديق الإماراتي'), title:v('Have them attested for the UAE, if you’re asked to', 'صدّقها لاستخدامها في الإمارات إذا طُلب منك ذلك'), help:['recognition','else'],
       blocks:[
        {t:'list', v:[
          v('The UAE Ministry of Foreign Affairs attests documents issued outside the UAE, through “Attestation through UAE Missions Abroad”.', 'تصدّق وزارة الخارجية الإماراتية المستندات الصادرة خارج الإمارات عبر خدمة «التصديق عن طريق البعثات الإماراتية في الخارج».'),
          v('It’s offered only through selected UAE missions. Check the website of the UAE mission in the country where you live; if the service isn’t online there, visit the mission in person.', 'تُقدَّم الخدمة عبر بعثات إماراتية مختارة فقط. راجع موقع البعثة الإماراتية في البلد الذي تقيم فيه، وإذا لم تكن الخدمة متاحة عبر الإنترنت هناك فزُر البعثة شخصياً.'),
          v('Recognition of a university degree is a separate service, from the Ministry of Higher Education and Scientific Research. Its report is used for employment, further studies, visas and government services. Only apply if someone asks you for it.', 'معادلة الشهادة الجامعية خدمة مستقلة تقدّمها وزارة التعليم العالي والبحث العلمي، ويُستخدم تقريرها للعمل ومتابعة الدراسة والتأشيرات والخدمات الحكومية. لا تتقدّم بطلبها إلا إذا طلبها منك أحد.'),
        ]},
       ],
       need:[it('apostilled','Your legalised (apostilled) documents','مستنداتك المصدّقة (بالأبوستيل)')]},
    ],
    problems:[
      P('unsure', v('They didn’t say whether my document needs attesting', 'لم يوضحوا إن كان مستندي يحتاج إلى تصديق'), v('Ask them again, in writing if you can, and keep their answer. Orivia can help you write the message.', 'اسألهم مرة أخرى، كتابياً إن أمكن، واحتفظ بردّهم. يمكن لأوريفيا مساعدتك في كتابة الرسالة.')),
      P('notary', v('I don’t know if my document needs a notary first', 'لا أعرف إن كان مستندي يحتاج إلى كاتب عدل أولاً'), v('GOV.UK lists which documents can be legalised as they are and which must be certified first. Check the document type there before you apply.', 'تذكر GOV.UK المستندات التي يمكن تصديقها كما هي، وتلك التي يجب توثيقها أولاً. تحقّق من نوع مستندك هناك قبل التقديم.')),
      P('recognition', v('Do I need my degree recognised to study?', 'هل أحتاج إلى معادلة شهادتي للدراسة؟'), v('The official page doesn’t say it’s needed for admission. Ask your university’s admissions office.', 'لا تذكر الصفحة الرسمية أنها مطلوبة للقبول. اسأل مكتب القبول في جامعتك.')),
      P('else', v('Something else', 'مشكلة أخرى'), v('Ask your university’s visa office first: they know what they need from you.', 'اسأل مكتب التأشيرات في جامعتك أولاً، فهم يعرفون ما يحتاجونه منك.')),
    ],
    after:[{journey:'dubai.eid.student', name:v('Your student residence visa and Emirates ID', 'تأشيرة الإقامة الدراسية والهوية الإماراتية')}],
  };
})();
