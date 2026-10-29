/* =========================================================
   BEFORE YOU MOVE · DOCUMENTS (UK → UAE), week 6, 29 Oct 2026; revised after Ina's review (29 Oct)
   Source-checked against the official pages below on 29 Oct 2026; awaiting human review (no review record).
   Rule kept from Ina's batch 1: no universal attestation rule is asserted. Whoever asks for a document decides
   whether it must be legalised, attested or recognised; the guide explains the official route when they do.
   Terms are kept distinct in both languages (Ina's review):
     legalisation (UK apostille)      = الأبوستيل
     attestation (UAE Ministry of FA) = الاعتماد من وزارة الخارجية الإماراتية
     recognition (of a qualification) = الاعتراف بالمؤهل
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
    legalise:S('GOV.UK: get a document legalised', 'GOV.UK: استخراج الأبوستيل للمستندات', 'https://www.gov.uk/get-document-legalised'),
    mofa:    S('UAE Ministry of Foreign Affairs: attestation of official documents and certificates', 'وزارة الخارجية الإماراتية: اعتماد المستندات والشهادات الرسمية', 'https://www.mofa.gov.ae/en/services/attestation'),
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
          v('Ask your university’s admissions or visa office which documents they need from you, and whether each one needs an apostille, UAE attestation or qualification recognition.', 'اسأل مكتب القبول أو التأشيرات في جامعتك عن المستندات التي يحتاجونها منك، وهل يحتاج كل منها إلى أبوستيل أو اعتماد من وزارة الخارجية الإماراتية أو اعتراف بالمؤهل.'),
          v('Ask them too: the original or a certified copy? A paper apostille or an e-Apostille? One apostille for each document, or one for the set?', 'واسألهم أيضاً: الأصل أم نسخة مصدّقة؟ أبوستيل ورقي أم إلكتروني؟ أبوستيل لكل مستند أم واحد للمجموعة؟'),
          v('If an employer or another office will also need your documents, ask them the same questions. Their answers can differ, so Orivia doesn’t assume one rule for everyone.', 'إذا كانت جهة عمل أو جهة أخرى ستحتاج مستنداتك أيضاً، فاسألها الأسئلة نفسها. قد تختلف الإجابات، لذلك لا يفترض أوريفيا قاعدة واحدة للجميع.'),
        ]},
        {t:'p', v:v('GOV.UK’s advice is the same: contact the person asking for the document and check what form they need it in.', 'ونصيحة GOV.UK هي نفسها: تواصل مع الجهة التي تطلب المستند وتحقّق من الشكل الذي تحتاجه.')},
       ],
       need:[it('offer','Your offer letter from the university','خطاب القبول من الجامعة'), it('list','The list of documents they asked for, and in what form','قائمة المستندات التي طلبوها وبأي شكل')],
       staff:v('Which documents do you need from me before I travel? For each one: does it need an apostille, UAE attestation or qualification recognition, and do you need the original or a certified copy?', 'ما المستندات التي تحتاجونها مني قبل السفر؟ ولكل مستند: هل يحتاج إلى أبوستيل أو اعتماد إماراتي أو اعتراف بالمؤهل، وهل تحتاجون الأصل أم نسخة مصدّقة؟')},
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
      {id:'uk', level:'source', label:v('UK apostille', 'الأبوستيل البريطاني'), title:v('Get an apostille for UK documents, if you’re asked to', 'استخرج الأبوستيل لمستنداتك البريطانية إذا طُلب منك ذلك'), help:['notary','else'],
       blocks:[
        {t:'list', v:[
          v('This service is only for documents issued in the UK. A document from another country is legalised in that country.', 'هذه الخدمة للمستندات الصادرة في المملكة المتحدة فقط. أما المستند الصادر في بلد آخر فيُصدَّق في ذلك البلد.'),
          v('Documents from a court, a public registry (for example a birth certificate), a government department or a registered doctor can get an apostille as they are.', 'يمكن استخراج الأبوستيل كما هي للمستندات الصادرة عن محكمة أو سجل عام (مثل شهادة الميلاد) أو جهة حكومية أو طبيب مسجّل.'),
          v('Other documents, such as a degree certificate or a copy of your passport, must first be certified by a UK notary or solicitor.', 'أما المستندات الأخرى، مثل شهادة التخرج أو نسخة جواز السفر، فيجب أن يوثّقها أولاً كاتب عدل أو محامٍ في المملكة المتحدة.'),
          v('Some documents can’t get an e-Apostille, only a paper one: birth, death, marriage, civil partnership and adoption certificates, police and criminal-record certificates, fingerprint certificates and ACCA certificates.', 'بعض المستندات لا يمكن استخراج أبوستيل إلكتروني لها، بل ورقي فقط: شهادات الميلاد والوفاة والزواج والشراكة المدنية والتبنّي، وشهادات الشرطة والسجل الجنائي، وشهادات البصمات، وشهادات ACCA.'),
        ]},
        {t:'steps', v:[
          v('Check with the organisation that asked whether they accept an e-Apostille, and whether they need one apostille per document.', 'تحقّق من الجهة التي طلبت المستند إن كانت تقبل الأبوستيل الإلكتروني، وإن كانت تحتاج أبوستيلاً لكل مستند.'),
          v('Apply online to the Legalisation Office: a paper apostille (you post your documents) or, where it’s allowed, an e-Apostille (you upload PDFs signed by a UK notary or solicitor).', 'قدّم طلباً عبر الإنترنت إلى مكتب التصديق: أبوستيل ورقي (ترسل مستنداتك بالبريد) أو، حيث يُسمح بذلك، أبوستيل إلكتروني (ترفع ملفات PDF موقّعة من كاتب عدل أو محامٍ بريطاني).'),
        ]},
       ],
       need:[it('docs','The original documents (or certified copies) you were asked for','المستندات الأصلية (أو النسخ المصدّقة) التي طُلبت منك')],
       cost:v('£45 per document with the standard service, plus postage or courier. No refund if a document can’t be legalised.', '45 جنيهاً إسترلينياً لكل مستند بالخدمة العادية، إضافة إلى البريد أو شركة التوصيل. لا يُستردّ المبلغ إذا تعذّر استخراج الأبوستيل للمستند.'),
       time:v('Usually up to 25 working days with the standard service, plus postage.', 'عادةً حتى 25 يوم عمل بالخدمة العادية، إضافة إلى وقت البريد.'),
       wait:v('The Legalisation Office to return your apostille.', 'أن يعيد مكتب التصديق الأبوستيل إليك.')},
      {id:'uae', level:'source', label:v('UAE attestation', 'الاعتماد الإماراتي'), title:v('Get UAE attestation, if you’re asked to', 'احصل على الاعتماد الإماراتي إذا طُلب منك ذلك'), help:['recognition','else'],
       blocks:[
        {t:'list', v:[
          v('The UAE Ministry of Foreign Affairs attests documents issued outside the UAE, through “Attestation through UAE Missions Abroad”.', 'تعتمد وزارة الخارجية الإماراتية المستندات الصادرة خارج الإمارات عبر خدمة «الاعتماد عن طريق البعثات الإماراتية في الخارج».'),
          v('It’s offered only through selected UAE missions. Check the website of the UAE mission in the country where you live; if the service isn’t online there, visit the mission in person.', 'تُقدَّم الخدمة عبر بعثات إماراتية مختارة فقط. راجع موقع البعثة الإماراتية في البلد الذي تقيم فيه، وإذا لم تكن الخدمة متاحة عبر الإنترنت هناك فزُر البعثة شخصياً.'),
          v('Recognition of a university degree is a separate service, from the Ministry of Higher Education and Scientific Research. Its report is used for employment, further studies, visas and government services. Only apply if someone asks you for it.', 'الاعتراف بالمؤهل الجامعي خدمة مستقلة تقدّمها وزارة التعليم العالي والبحث العلمي، ويُستخدم تقريرها للعمل ومتابعة الدراسة والتأشيرات والخدمات الحكومية. لا تتقدّم بطلبها إلا إذا طلبها منك أحد.'),
        ]},
       ],
       need:[it('apostilled','Your documents with their UK apostille','مستنداتك مع الأبوستيل البريطاني')]},
    ],
    problems:[
      P('unsure', v('They didn’t say whether my document needs an apostille or attestation', 'لم يوضحوا إن كان مستندي يحتاج إلى أبوستيل أو اعتماد'), v('Ask them again, in writing if you can, and keep their answer. Orivia can help you write the message.', 'اسألهم مرة أخرى، كتابياً إن أمكن، واحتفظ بردّهم. يمكن لأوريفيا مساعدتك في كتابة الرسالة.')),
      P('notary', v('I don’t know if my document needs a notary first', 'لا أعرف إن كان مستندي يحتاج إلى كاتب عدل أولاً'), v('Documents from a court, a public registry, a government department or a registered doctor don’t. Others, such as a degree certificate, must be certified by a UK notary or solicitor first. GOV.UK lists the types.', 'لا تحتاج إليه مستندات المحاكم والسجلات العامة والجهات الحكومية والأطباء المسجّلين. أما غيرها، مثل شهادة التخرج، فيجب أن يوثّقها كاتب عدل أو محامٍ بريطاني أولاً. تذكر GOV.UK الأنواع.')),
      P('recognition', v('Do I need my degree recognised to study?', 'هل أحتاج إلى الاعتراف بمؤهلي للدراسة؟'), v('The official page doesn’t say it’s needed for admission. Ask your university’s admissions office.', 'لا تذكر الصفحة الرسمية أنه مطلوب للقبول. اسأل مكتب القبول في جامعتك.')),
      P('else', v('Something else', 'مشكلة أخرى'), v('Ask your university’s visa office first: they know what they need from you.', 'اسأل مكتب التأشيرات في جامعتك أولاً، فهم يعرفون ما يحتاجونه منك.')),
    ],
    after:[{journey:'dubai.eid.student', name:v('Your student residence visa and Emirates ID', 'تأشيرة الإقامة الدراسية والهوية الإماراتية')}],
  };
})();
