/* =========================================================
   Emirates ID / residence visa: employees, family members, self-sponsored (Dubai)
   Checked against u.ae, GDRFA Dubai, ICP, Dubai Health and MOHRE pages on 27 Sep 2026.
   ========================================================= */
(function(){
const C = {en:'27 Sep 2026', ar:'27 سبتمبر 2026'};
const S = (en, ar, url) => ({name:{en, ar}, url});
const U = {
  work:   S('u.ae: Residence visa for working in the UAE', 'البوابة الرسمية: تأشيرة الإقامة للعمل في الإمارات', 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-working-in-the-uae'),
  rights: S('u.ae: Labour rights (private sector)', 'البوابة الرسمية: حقوق العمال (القطاع الخاص)', 'https://u.ae/en/information-and-services/jobs/Sector-of-employment/employment-in-the-private-sector/labour-rights'),
  permitJob: S('GDRFA Dubai: Entry permit linked to a job contract', 'إقامة دبي: تأشيرة دخول مرتبطة بعقد عمل', 'https://www.gdrfad.gov.ae/en/services/d551ce6f-52e8-11ea-0320-0050569629e8'),
  general:S('u.ae: General provisions for the residence visa', 'البوابة الرسمية: الأحكام العامة لتأشيرة الإقامة', 'https://u.ae/en/information-and-services/visa-and-emirates-id/Visa-information/general-provisions-for-the-residence-visa'),
  medical:S('Dubai Health: Medical fitness exam', 'دبي الصحية: فحص اللياقة الطبية', 'https://dubaihealth.ae/service/medical-fitness-exam'),
  medStatus:S('Dubai Health: Check medical fitness exam status', 'دبي الصحية: الاستعلام عن نتيجة فحص اللياقة', 'https://dubaihealth.ae/service/check-medical-fitness-exam-status'),
  biometric:S('ICP: Emirates ID for residents', 'الهيئة الاتحادية للهوية والجنسية: الهوية للمقيمين', 'https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e5a'),
  resPrivate:S('GDRFA Dubai: Residence permit (private sector)', 'إقامة دبي: إقامة القطاع الخاص', 'https://www.gdrfad.gov.ae/en/services/bf4095ea-56e2-11ea-0320-0050569629e8'),
  track:  S('u.ae: Track your visa application', 'البوابة الرسمية: تتبّع طلب التأشيرة', 'https://u.ae/en/information-and-services/visa-and-emirates-id/Apply-and-track-visa/track-visa-application-and-validity'),
  family: S('u.ae: Residence visa for family members', 'البوابة الرسمية: تأشيرة الإقامة لأفراد العائلة', 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-family-members'),
  permitFam:S('GDRFA Dubai: Entry permit for family residence', 'إقامة دبي: تصريح دخول لإقامة العائلة', 'https://www.gdrfad.gov.ae/en/services/d551ce7b-52e8-11ea-0320-0050569629e8'),
  golden: S('u.ae: Golden visa', 'البوابة الرسمية: الإقامة الذهبية', 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa'),
  green:  S('u.ae: Green visa', 'البوابة الرسمية: الإقامة الخضراء', 'https://u.ae/en/information-and-services/visa-and-emirates-id/Types-of-visas/Investor-visa/Green-visa'),
  retire: S('GDRFA Dubai: Retirement residence', 'إقامة دبي: إقامة المتقاعدين', 'https://www.gdrfad.gov.ae/en/services/8ea80db0-f43e-11eb-0320-0050569629e8'),
  remote: S('GDRFA Dubai: Virtual work residence', 'إقامة دبي: إقامة العمل عن بُعد', 'https://www.gdrfad.gov.ae/en/services/64154a31-ec6d-11ec-140b-0050569629e8'),
  property:S('GDRFA Dubai: Property owner residence', 'إقامة دبي: إقامة مالكي العقارات', 'https://www.gdrfad.gov.ae/en/services/d551ce81-52e8-11ea-0320-0050569629e8'),
  gdrfa:  S('GDRFA Dubai: Contact', 'إقامة دبي: اتصل بنا', 'https://www.gdrfad.gov.ae/en/contact-information'),
  icp:    S('ICP: Contact us', 'الهيئة الاتحادية للهوية والجنسية: اتصل بنا', 'https://icp.gov.ae/en/contact-us/'),
};
const STUCK = {cards:[
  {title:{en:'GDRFA Dubai (Amer)', ar:'إقامة دبي (آمر)'}, phone:'800 5111', body:{en:'Free. For Dubai visa and residency questions.', ar:'مجاني. لأسئلة التأشيرات والإقامة في دبي.'}},
  {title:{en:'ICP (Emirates ID)', ar:'الهيئة الاتحادية للهوية والجنسية'}, phone:'600 522222', body:{en:'For Emirates ID questions. 7:30am–3:30pm.', ar:'لأسئلة الهوية الإماراتية. من 7:30 صباحاً حتى 3:30 عصراً.'}},
]};
const it = (id, en, ar, form) => ({id, v:{en, ar}, form});
const P = (id, q, a) => ({id, q, a});
const ELSE = P('else', {en:'Something else', ar:'مشكلة أخرى'}, {en:'Call GDRFA Dubai (Amer) on 800 5111 for visa questions, or ICP on 600 522222 for Emirates ID questions.', ar:'اتصل بإقامة دبي (آمر) على 800 5111 لأسئلة التأشيرة، أو بالهيئة الاتحادية للهوية والجنسية على 600 522222 لأسئلة الهوية.'});
const MEDICAL = (who, help) => ({id:'medical', level:'source', label:{en:'Medical test', ar:'الفحص الطبي'}, title:{en:'Your medical fitness test', ar:'فحص اللياقة الطبية'}, appt:true, help,
  now:{en:'Next: book and take your medical fitness test.', ar:'التالي: احجز فحص اللياقة الطبية وأجرِه.'},
  need:[it('form','The registration form','استمارة التسجيل'), it('passport','Your passport or Emirates ID','جواز سفرك أو هويتك الإماراتية','original'), it('photo','A photo with a white background','صورة بخلفية بيضاء'), it('evisa','A copy of your e-visa','نسخة من تأشيرتك الإلكترونية','copy')],
  blocks:[
    {t:'p', v:who},
    {t:'steps', v:[
      {en:'Apply for the test on the Salem portal. Often your sponsor or their PRO does this for you.', ar:'قدّم طلب الفحص عبر بوابة «سالم». غالباً يقوم كفيلك أو مندوبه بذلك عنك.'},
      {en:'Go to a Medical Fitness Centre at your appointment time.', ar:'اذهب إلى مركز اللياقة الطبية في موعدك.'},
      {en:'The test is a blood sample and a chest X-ray. Some jobs also need vaccinations.', ar:'الفحص عينة دم وأشعة للصدر، وبعض المهن تحتاج أيضاً إلى تطعيمات.'},
      {en:'Your result comes by text message or email.', ar:'تصلك النتيجة برسالة نصية أو بالبريد الإلكتروني.'},
    ]},
    {t:'link', url:'https://dubaihealth.ae/service/check-medical-fitness-exam-status', v:{en:'Check your medical test result', ar:'تحقّق من نتيجة الفحص الطبي'}},
    {t:'phraseCard', v:{en:'I’m here for my medical fitness test.', ar:'جئت لإجراء فحص اللياقة الطبية.'}},
  ]});
const BIO = help => ({id:'biometrics', level:'source', label:{en:'Fingerprints', ar:'البصمات'}, title:{en:'Fingerprints for your Emirates ID', ar:'البصمات للهوية الإماراتية'}, appt:true, help,
  now:{en:'Next: give your fingerprints for your Emirates ID.', ar:'التالي: أعطِ بصماتك للهوية الإماراتية.'},
  need:[it('passport','Your passport','جواز سفرك','original')],
  blocks:[
    {t:'list', v:[
      {en:'Everyone aged 15 and over gives fingerprints and a signature at an ICP service centre.', ar:'كل من بلغ 15 عاماً فأكثر يعطي بصماته وتوقيعه في أحد مراكز خدمة الهيئة الاتحادية للهوية والجنسية.'},
      {en:'Your sponsor or their PRO usually tells you when and where to go.', ar:'عادةً يخبرك كفيلك أو مندوبه بموعد ومكان الذهاب.'},
    ]},
    {t:'phraseCard', v:{en:'I have a fingerprint appointment for my Emirates ID.', ar:'لدي موعد لأخذ البصمات للهوية الإماراتية.'}},
  ]});
const ISSUED = (help, extra) => ({id:'issued', level:'source', label:{en:'Residence visa', ar:'تأشيرة الإقامة'}, title:{en:'Waiting for your residence visa', ar:'انتظار تأشيرة الإقامة'}, help,
  now:{en:'Next: wait for your residence visa to be issued.', ar:'التالي: انتظر صدور تأشيرة الإقامة.'},
  wait:{en:'Your residence visa to be issued. You can track it on the GDRFA Dubai website.', ar:'صدور تأشيرة الإقامة. يمكنك تتبّعها على موقع إقامة دبي.'},
  blocks:[
    {t:'list', v:[extra, {en:'In Dubai, you can track your application on the GDRFA website.', ar:'في دبي، يمكنك تتبّع طلبك على موقع الإدارة العامة للإقامة وشؤون الأجانب.'}]},
    {t:'link', url:'https://u.ae/en/information-and-services/visa-and-emirates-id/Apply-and-track-visa/track-visa-application-and-validity', v:{en:'How to track your visa', ar:'كيف تتتبّع تأشيرتك'}},
  ]});
const CARD = {id:'card', level:'source', label:{en:'Emirates ID', ar:'الهوية'}, title:{en:'Getting your Emirates ID card', ar:'استلام بطاقة الهوية الإماراتية'}, help:['slow','else'],
  now:{en:'Next: collect your Emirates ID card.', ar:'التالي: استلم بطاقة الهوية الإماراتية.'},
  wait:{en:'Your Emirates ID card to be ready. You can check its status in the UAEICP app.', ar:'أن تصبح بطاقة الهوية جاهزة. يمكنك متابعة حالتها في تطبيق UAEICP.'},
  blocks:[
    {t:'list', v:[
      {en:'Your Emirates ID is valid for as long as your residence visa.', ar:'تبقى هويتك الإماراتية صالحة ما دامت تأشيرة إقامتك صالحة.'},
      {en:'Check its status in the UAEICP app or on the ICP website.', ar:'تابع حالتها في تطبيق UAEICP أو على موقع الهيئة.'},
    ]},
    {t:'link', url:'https://icp.gov.ae/en/id-card-status/', v:{en:'Check your Emirates ID status on ICP', ar:'تحقّق من حالة هويتك على موقع الهيئة'}},
  ]};
const SLOW = P('slow', {en:'It’s taking a long time', ar:'الأمر يستغرق وقتاً طويلاً'}, {en:'Ask your sponsor (or their PRO) where your application is. You can also track it on the GDRFA website, or call Amer on 800 5111. Don’t let your deadline pass: overstaying costs AED 50 a day.', ar:'اسأل كفيلك (أو مندوبه) عن مرحلة طلبك. ويمكنك تتبّعه على موقع إقامة دبي، أو الاتصال بـ«آمر» على 800 5111. لا تدع المهلة تفوتك: غرامة تجاوز مدة الإقامة 50 درهماً يومياً.'});
const RESULT = P('result', {en:'I haven’t had my medical result', ar:'لم تصلني نتيجة الفحص الطبي'}, {en:'Results come by text message or email. You can also check the status on the Dubai Health website with your details.', ar:'تصل النتائج برسالة نصية أو بالبريد الإلكتروني. ويمكنك أيضاً الاستعلام عنها على موقع دبي الصحية ببياناتك.'});
const STAFF = {id:'staff', q:{en:'I don’t understand what they said', ar:'لم أفهم ما قالوه'}, a:{en:'Show them this card. It asks them to slow down or write it down.', ar:'اعرض عليهم هذه البطاقة، فهي تطلب منهم التحدث ببطء أو الكتابة.'}, phraseText:{en:'I’m new here. Could you please say that more slowly, or write it down?', ar:'أنا جديد هنا. هل يمكنك أن تقول ذلك ببطء أكثر، أو تكتبه لي من فضلك؟'}};

/* ---------- Employees ---------- */
DATA.journeys['dubai.eid.employee'] = {
  city:'dubai', need:'docs', icon:'docs', pathway:'dubai.eid', checked:C, trust:{reviewed:false, tested:0}, stuck:STUCK,
  title:{en:'Your work residence visa and Emirates ID', ar:'تأشيرة الإقامة للعمل والهوية الإماراتية'},
  doneTitle:{en:'You’re a UAE resident now.', ar:'أصبحت الآن مقيماً في الإمارات.'},
  sources:[U.work, U.rights, U.permitJob, U.general, U.medical, U.biometric, U.resPrivate, U.track, U.gdrfa, U.icp],
  stages:[
    {id:'permit', level:'source', label:{en:'Work permit', ar:'تصريح العمل'}, title:{en:'Your employer applies for your permits', ar:'صاحب العمل يتقدّم بطلب تصاريحك'}, help:['pay','slow','else'],
     now:{en:'Your employer is applying for your work permit and entry permit.', ar:'صاحب العمل يتقدّم بطلب تصريح العمل وتصريح الدخول.'},
     wait:{en:'Your employer to get your work permit (from MOHRE) and then your entry permit.', ar:'أن يحصل صاحب العمل على تصريح عملك (من وزارة الموارد البشرية والتوطين) ثم تصريح دخولك.'},
     need:[it('passcopy','A passport copy, valid for at least 6 more months','نسخة من جواز السفر صالحة لستة أشهر على الأقل','copy'), it('photo','A photo with a white background','صورة بخلفية بيضاء')],
     blocks:[
      {t:'p', v:{en:'Your employer applies for your work permit with MOHRE, then for your entry permit. You send them the documents they ask for.', ar:'يتقدّم صاحب العمل بطلب تصريح عملك لدى وزارة الموارد البشرية والتوطين، ثم بطلب تصريح دخولك. وأنت ترسل إليه المستندات التي يطلبها.'}},
      {t:'tip', label:'important', v:{en:'By law, your employer pays the costs of recruiting you, your travel and your residence permit. Charging workers recruitment fees is not allowed.', ar:'بحسب القانون، يتحمّل صاحب العمل تكاليف استقدامك وسفرك وتصريح إقامتك، ولا يُسمح بتحصيل رسوم استقدام من العمال.'}},
     ]},
    {id:'arrive', level:'source', label:{en:'Arrive', ar:'الوصول'}, title:{en:'Arrive in time, then start the clock', ar:'اصل في الموعد، ثم يبدأ العدّ'}, help:['slow','else'],
     now:{en:'Next: enter the UAE within 30 days of your entry permit being approved.', ar:'التالي: ادخل الإمارات خلال 30 يوماً من الموافقة على تصريح الدخول.'},
     blocks:[
      {t:'list', v:[
        {en:'Enter the UAE within 30 days of your entry permit being approved.', ar:'ادخل الإمارات خلال 30 يوماً من الموافقة على تصريح الدخول.'},
        {en:'From the day you enter, you have 60 days to finish your residency: the medical test, fingerprints and residence visa.', ar:'من يوم دخولك، لديك 60 يوماً لإكمال إقامتك: الفحص الطبي والبصمات وتأشيرة الإقامة.'},
        {en:'Ask your employer’s PRO (the person who handles visas) for your dates.', ar:'اسأل مندوب العلاقات العامة لدى صاحب العمل (المسؤول عن التأشيرات) عن مواعيدك.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Add your “60-day residency deadline” to Orivia’s document dates. Enter the day you arrived and Orivia counts down for you.', ar:'أضف «مهلة الإقامة (60 يوماً)» إلى تواريخ المستندات في أوريفيا. أدخل يوم وصولك وستعدّ أوريفيا الأيام عنك.'}},
     ]},
    MEDICAL({en:'Everyone aged 18 and over has this routine test before their residence visa.', ar:'يخضع كل من بلغ 18 عاماً فأكثر لهذا الفحص الروتيني قبل تأشيرة الإقامة.'}, ['result','staff','else']),
    BIO(['slow','staff','else']),
    ISSUED(['slow','else'], {en:'Your work residence visa is valid for 2 years and can be renewed.', ar:'تأشيرة الإقامة للعمل صالحة لمدة سنتين وقابلة للتجديد.'}),
    CARD,
    {id:'next', label:{en:'What’s next', ar:'ما التالي'}, title:{en:'Know your rights at work', ar:'اعرف حقوقك في العمل'}, help:['pay','else'],
     blocks:[
      {t:'p', v:{en:'Your Emirates ID unlocks most services, like a bank account and UAE PASS. It’s also worth knowing your rights at work.', ar:'تفتح لك الهوية الإماراتية معظم الخدمات، مثل الحساب البنكي وUAE PASS. ومن المفيد أيضاً أن تعرف حقوقك في العمل.'}},
      {t:'journeyLink', journey:'dubai.workrights', v:{en:'Your rights at work', ar:'حقوقك في العمل'}},
     ]},
  ],
  problems:[
    P('pay', {en:'My employer wants me to pay for my visa', ar:'صاحب العمل يريدني أن أدفع تكلفة تأشيرتي'}, {en:'By law, your employer pays for recruiting you and for your residence permit, and charging workers recruitment fees is not allowed. Call MOHRE’s free line on 80084 for advice, or complain online.', ar:'بحسب القانون، يتحمّل صاحب العمل تكلفة استقدامك وتصريح إقامتك، ولا يُسمح بتحصيل رسوم استقدام من العمال. اتصل بالخط المجاني لوزارة الموارد البشرية والتوطين على 80084 للاستشارة، أو قدّم شكوى عبر الإنترنت.'}),
    SLOW, RESULT, STAFF, ELSE,
  ],
  after:[{journey:'dubai.workrights', name:{en:'Your rights at work', ar:'حقوقك في العمل'}}, {journey:'dubai.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}],
};
DATA.journeys['dubai.eid.employee'].stuck = {cards:[{title:{en:'MOHRE labour advice line', ar:'خط الاستشارات العمالية'}, phone:'80084', body:{en:'Free. For problems with your employer, pay or contract.', ar:'مجاني. لمشكلات صاحب العمل أو الراتب أو العقد.'}}].concat(STUCK.cards)};

/* ---------- Family members ---------- */
DATA.journeys['dubai.eid.family'] = {
  city:'dubai', need:'docs', icon:'docs', pathway:'dubai.eid', checked:C, trust:{reviewed:false, tested:0}, stuck:STUCK,
  title:{en:'Your family residence visa and Emirates ID', ar:'تأشيرة الإقامة العائلية والهوية الإماراتية'},
  doneTitle:{en:'You’re a UAE resident now.', ar:'أصبحت الآن مقيماً في الإمارات.'},
  sources:[U.family, U.permitFam, U.general, U.medical, U.biometric, U.track, U.gdrfa, U.icp],
  stages:[
    {id:'sponsor', level:'source', label:{en:'Sponsor', ar:'الكفيل'}, title:{en:'Who can sponsor you', ar:'من يمكنه كفالتك'}, help:['salary','else'],
     now:{en:'First, check your family member can sponsor you.', ar:'أولاً، تأكّد من أن قريبك يستطيع كفالتك.'},
     blocks:[
      {t:'list', v:[
        {en:'A UAE resident earning at least AED 4,000 a month, or AED 3,000 plus accommodation, can sponsor family.', ar:'يمكن للمقيم في الإمارات الذي يتقاضى 4,000 درهم شهرياً على الأقل، أو 3,000 درهم مع السكن، أن يكفل أسرته.'},
        {en:'They can sponsor a spouse, unmarried daughters, sons under 25, and children with special needs.', ar:'يمكنه كفالة الزوج أو الزوجة، والبنات غير المتزوجات، والأبناء دون 25 عاماً، والأبناء من أصحاب الهمم.'},
      ]},
     ]},
    {id:'docs', level:'source', label:{en:'Documents', ar:'المستندات'}, title:{en:'Get the documents ready', ar:'جهّز المستندات'}, help:['attest','else'],
     now:{en:'Next: get the family documents ready.', ar:'التالي: جهّز مستندات العائلة.'},
     need:[
      it('birth','Attested birth certificate (for children)','شهادة ميلاد مصدّقة (للأبناء)'),
      it('marriage','Certified marriage contract (for a spouse)','عقد زواج مصدّق (للزوج أو الزوجة)'),
      it('passcopy','Passport copy, valid for at least 6 more months','نسخة جواز سفر صالحة لستة أشهر على الأقل','copy'),
      it('photo','A photo','صورة شخصية'),
      it('salary','The sponsor’s employment contract or salary certificate','عقد عمل الكفيل أو شهادة راتبه'),
      it('noc','The father’s no-objection letter, if the mother is sponsoring','خطاب عدم ممانعة من الأب إذا كانت الأم هي الكفيلة'),
     ],
     blocks:[
      {t:'p', v:{en:'Your sponsor applies with these. Tick each one off as you get it.', ar:'يتقدّم كفيلك بالطلب بهذه المستندات. ضع علامة على كل مستند عند تجهيزه.'}},
     ]},
    {id:'permit', level:'source', label:{en:'Entry permit', ar:'تصريح الدخول'}, title:{en:'Your sponsor applies for your entry permit', ar:'كفيلك يتقدّم بطلب تصريح دخولك'}, help:['slow','else'],
     now:{en:'Your sponsor is applying for your entry permit.', ar:'كفيلك يتقدّم بطلب تصريح دخولك.'},
     wait:{en:'Your sponsor to get your entry permit from GDRFA Dubai.', ar:'أن يحصل كفيلك على تصريح دخولك من إقامة دبي.'},
     blocks:[
      {t:'list', v:[
        {en:'Your sponsor applies to GDRFA Dubai for an entry permit for family residence.', ar:'يتقدّم كفيلك لدى إقامة دبي بطلب تصريح دخول لإقامة العائلة.'},
        {en:'Once you enter, you have 60 days to finish your residency.', ar:'بعد دخولك، لديك 60 يوماً لإكمال إقامتك.'},
      ]},
     ]},
    MEDICAL({en:'Family members aged 18 and over have this routine test. Children under 18 don’t.', ar:'يخضع أفراد العائلة ممن بلغوا 18 عاماً فأكثر لهذا الفحص الروتيني، ولا يخضع له من هم دون 18 عاماً.'}, ['result','staff','else']),
    BIO(['slow','staff','else']),
    ISSUED(['slow','else'], {en:'Your residence visa is linked to your sponsor’s.', ar:'تأشيرة إقامتك مرتبطة بتأشيرة كفيلك.'}),
    CARD,
  ],
  problems:[
    P('salary', {en:'My family member earns less than that', ar:'دخل قريبي أقل من ذلك'}, {en:'The official minimum is AED 4,000 a month, or AED 3,000 plus accommodation. Call GDRFA Dubai (Amer) on 800 5111 to ask about your situation before applying.', ar:'الحد الأدنى الرسمي 4,000 درهم شهرياً، أو 3,000 درهم مع السكن. اتصل بإقامة دبي (آمر) على 800 5111 للسؤال عن وضعك قبل التقديم.'}),
    P('attest', {en:'I don’t know how to get documents attested', ar:'لا أعرف كيف أصدّق المستندات'}, {en:'Attestation depends on the country the document comes from. Ask GDRFA Dubai (Amer) on 800 5111 what your documents need before you travel.', ar:'يعتمد التصديق على البلد الذي صدر منه المستند. اسأل إقامة دبي (آمر) على 800 5111 عمّا تحتاجه مستنداتك قبل السفر.'}),
    SLOW, RESULT, STAFF, ELSE,
  ],
  after:[{journey:'dubai.school', name:{en:'Find a school for your child', ar:'العثور على مدرسة لطفلك'}}, {journey:'dubai.health.student', name:{en:'Healthcare', ar:'الرعاية الصحية'}}],
};

/* ---------- Self-sponsored ---------- */
DATA.journeys['dubai.eid.self'] = {
  city:'dubai', need:'docs', icon:'docs', pathway:'dubai.eid', checked:C, trust:{reviewed:false, tested:0}, stuck:STUCK,
  title:{en:'Sponsoring your own residence', ar:'كفالة إقامتك بنفسك'},
  doneTitle:{en:'You know your options.', ar:'أصبحت تعرف خياراتك.'},
  sources:[U.golden, U.green, U.retire, U.property, U.remote, U.general, U.gdrfa],
  stages:[
    {id:'routes', level:'source', label:{en:'Your options', ar:'خياراتك'}, title:{en:'Ways to sponsor yourself', ar:'طرق كفالة نفسك'}, help:['which','else'],
     blocks:[
      {t:'cards', v:[
        {color:'#D4A53A', name:{en:'Golden visa', ar:'الإقامة الذهبية'}, desc:{en:'5 or 10 years, no sponsor. For investors, entrepreneurs, exceptional talent, outstanding students and some frontline workers.', ar:'5 أو 10 سنوات دون كفيل. للمستثمرين ورواد الأعمال وأصحاب المواهب الاستثنائية والطلاب المتفوقين وبعض العاملين في الخطوط الأمامية.'}},
        {color:'#2E7D5B', name:{en:'Green visa', ar:'الإقامة الخضراء'}, desc:{en:'5 years, renewable, no sponsor. For skilled workers, freelancers and the self-employed.', ar:'5 سنوات قابلة للتجديد دون كفيل. للعمال المهرة والمستقلين وأصحاب الأعمال الحرة.'}},
        {color:'#2F6DB5', name:{en:'Remote work', ar:'العمل عن بُعد'}, desc:{en:'1 year, for people working for an employer outside the UAE and earning at least USD 3,500 a month.', ar:'سنة واحدة لمن يعمل لدى جهة خارج الإمارات ويتقاضى 3,500 دولار شهرياً على الأقل.'}},
        {color:'#B9C0C7', name:{en:'Retirement', ar:'التقاعد'}, desc:{en:'5 years, renewable, for people aged 55+ who meet the savings, property or income rules.', ar:'5 سنوات قابلة للتجديد لمن بلغوا 55 عاماً فأكثر ويستوفون شروط المدخرات أو العقار أو الدخل.'}},
        {color:'#7A2E8C', name:{en:'Property owner', ar:'مالك عقار'}, desc:{en:'For people who own property in Dubai. Golden residency starts at property worth AED 2 million.', ar:'لمن يملكون عقاراً في دبي. تبدأ الإقامة الذهبية من عقار قيمته مليونا درهم.'}},
      ]},
      {t:'tip', label:'important', v:{en:'Each route has its own rules and fees. Check the official page for yours before you apply.', ar:'لكل طريق شروطه ورسومه. راجع الصفحة الرسمية لطريقك قبل التقديم.'}},
     ]},
    {id:'after', level:'source', label:{en:'After approval', ar:'بعد الموافقة'}, title:{en:'Then, like everyone else', ar:'ثم كالجميع'}, help:['else'],
     blocks:[
      {t:'list', v:[
        {en:'If you’re 18 or over, you take the medical fitness test.', ar:'إذا كان عمرك 18 عاماً فأكثر، تجري فحص اللياقة الطبية.'},
        {en:'If you’re 15 or over, you give fingerprints for your Emirates ID.', ar:'إذا كان عمرك 15 عاماً فأكثر، تعطي بصماتك للهوية الإماراتية.'},
        {en:'You can track your application on the GDRFA Dubai website.', ar:'يمكنك تتبّع طلبك على موقع إقامة دبي.'},
      ]},
     ]},
  ],
  problems:[
    P('which', {en:'I don’t know which one fits me', ar:'لا أعرف أيها يناسبني'}, {en:'Call GDRFA Dubai (Amer) on 800 5111. Tell them your job and situation, and they can tell you which residence you can apply for.', ar:'اتصل بإقامة دبي (آمر) على 800 5111. أخبرهم بعملك ووضعك، ويمكنهم إخبارك بالإقامة التي يمكنك التقدّم لها.'}),
    ELSE,
  ],
  after:[{journey:'dubai.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}],
};

/* Switch the pathway options on */
const pw = DATA.pathways['dubai.eid'];
if(pw){ pw.options[1].journey = 'dubai.eid.employee'; pw.options[2].journey = 'dubai.eid.family'; pw.options[3].journey = 'dubai.eid.self'; }
})();
