/* Orivia content: interface text and journey data.
   Add or edit journeys here; the engine in app.js reads this. */
/* ---------- Interface text ---------- */
const UI = {
  en:{
    proto:'Beta', switchTo:'العربية',
    chooseLang:'Choose your language', soon:'Coming soon', cont:'Continue', skip:'Skip', back:'Back', home:'Home',
    purposeTitle:'What brings you here?', purposeSub:'This helps Orivia show the right steps. You can skip it.',
    purposes:['Work','Study','Family','Visiting','Something else'],
    needsEyebrow:'Step 1 of finding your way', needsTitle:'What do you need?', needsSub:'Pick one. You can come back for the rest.',
    ready:'Ready', inFull:'In the full version',
    tasksAsk:'What are you trying to do?',
    weekTitle:'A good first week', weekSub:'Most newcomers do these in roughly this order.',
    journey:'Your journey', stepsDone:(n,t)=>`${n} of ${t} steps done`, start:'Start the journey', resume:'Continue the journey',
    stepOf:(i,t)=>`Step ${i} of ${t}`, next:'Next step', finish:'Finish',
    wrong:'I need help', whatHappened:'What happened?', tryThis:'Try this', otherProblem:'Choose another problem',
    source:'Official source', checked:'Last checked', verify:'Prototype: prices still to be confirmed with RTA before launch',
    disclaimer:'Orivia is guidance, not official or legal advice. Always check the official source.',
    showStaff:'Show this to a staff member', close:'Close', phraseBtn:'Show a phrase to staff',
    doneEyebrow:'Journey complete', doneTitle:"You're ready to get around.", nextUp:'Where to next',
    restart:'Start this journey again', saved:'Progress saved on this phone',
    tip:'Tip', bring:'What to bring',
    cityClosed:'Journeys for this city are being written.',
    didItWork:'Did that work?', yesWorked:'Yes, it worked', yesTrain:'Yes, I’m on the right train', stillLost:'No, I still need help',
    wellDone:'Well done. You found your way.', stuckTitle:'That’s OK. Let someone help you.',
    askStaff:'Ask a staff member', askStaffBody:'Look for staff in RTA uniform, or the customer service desk near the ticket gates. Show them this screen.',
    whereGoing:'Where are you going? (optional)', wherePh:'Type a station name',
    callRta:'Call RTA', callRtaBody:'The RTA help line for public transport.',
    checkRoute:'Check your route', checkRouteBody:'Open RTA’s S’hail app and type where you’re going. It shows which train to take.',
    trust:{draft:'Draft',official:'Officially verified',reviewed:'University reviewed',tested:n=>`Tested with ${n} newcomer${n===1?'':'s'}`,testedNone:'Not yet tested with newcomers'}, trustDesc:{draft:'Written from public guides. Not yet checked against official sources.',official:'Checked against the official sources listed below.',reviewed:'Reviewed by the university or authority that runs this process.',tested:'Real newcomers used this guidance and it matched their experience.'},
    saveTitle:'Save your journey to your phone', saveBody:'Keep your progress and help cards, even without internet.', saveBtn:'Save to phone', later:'Not now', gotIt:'Got it',
    inappNote:'You opened Orivia inside another app. First tap the menu (••• or ⋮) and choose “Open in browser”, “Open in Safari” or “Open in Chrome”. Then come back to this step.',
    iosHint:'Can’t see “Add to Home Screen”? Scroll to the bottom of the list, tap “Edit Actions”, and add it.',
    guide:{
      ios:[{icon:'share', text:'Tap the <b>Share</b> button. It’s at the bottom of Safari, or inside the <b>•••</b> menu.'},{icon:'plus', text:'Scroll down and tap <b>Add to Home Screen</b>.'},{icon:'check', text:'Tap <b>Add</b>. Orivia appears on your home screen like an app.'}],
      android:[{icon:'dots', text:'Tap the <b>⋮</b> menu in the top corner of your browser.'},{icon:'plus', text:'Tap <b>Add to Home screen</b> or <b>Install app</b>.'},{icon:'check', text:'Tap <b>Install</b> or <b>Add</b>. Orivia appears on your home screen like an app.'}],
      inapp:[{icon:'more', text:'Tap the <b>•••</b> or <b>⋮</b> menu in this app.'},{icon:'compass', text:'Choose <b>Open in browser</b> (or Safari or Chrome).'},{icon:'plus', text:'In the browser, tap <b>Save to phone</b> again.'}],
      desktop:[{icon:'plus', text:'In Chrome or Edge, click the install icon at the right of the address bar.'},{icon:'check', text:'Click <b>Install</b>.'}],
    }, offline:'You’re offline. Saved journeys still work.', important:'Important',
    finderEyebrow:'Let’s work out where you are', yes:'Yes', notYet:'Not yet', notSure:'Not sure', qOf:(i,t)=>`Question ${i} of ${t}`,
    hereEyebrow:'Here’s where you are', youAreHere:'You are here', unsureNote:'You weren’t sure about some steps. Ask your university’s visa office to confirm before doing anything else.', redo:'Answer the questions again', privacy:'Your answers stay on this phone. Orivia doesn’t send them anywhere.', startHere:'Start from here', dontKnow:'I don’t know', showThis:'Show this to staff', sources:'Sources', done:'Done', howChecked:'How this was checked', listen:'Listen', stop:'Stop', noVoice:'This phone has no voice for this language.',
    problems:'What happened?', helpPhrase:'I’m new here and I need help. Can you help me, please?',
  },
  ar:{
    proto:'تجريبي', switchTo:'English',
    chooseLang:'اختر لغتك', soon:'قريباً', cont:'متابعة', skip:'تخطَّ', back:'رجوع', home:'الرئيسية',
    purposeTitle:'ما سبب قدومك؟', purposeSub:'يساعد هذا أوريفيا على عرض الخطوات المناسبة لك. يمكنك التخطي.',
    purposes:['العمل','الدراسة','العائلة','زيارة','سبب آخر'],
    needsEyebrow:'أول خطوة لتجد طريقك', needsTitle:'بماذا تحتاج المساعدة؟', needsSub:'اختر واحداً، ويمكنك العودة إلى الباقي لاحقاً.',
    ready:'جاهز', inFull:'في النسخة الكاملة',
    tasksAsk:'ماذا تريد أن تفعل؟',
    weekTitle:'أسبوع أول موفّق', weekSub:'يقوم معظم القادمين الجدد بهذه الخطوات بهذا الترتيب تقريباً.',
    journey:'رحلتك', stepsDone:(n,t)=>`${n} من ${t} خطوات مكتملة`, start:'ابدأ الرحلة', resume:'تابع الرحلة',
    stepOf:(i,t)=>`الخطوة ${i} من ${t}`, next:'الخطوة التالية', finish:'إنهاء',
    wrong:'أحتاج مساعدة', whatHappened:'ماذا حدث؟', tryThis:'جرّب هذا', otherProblem:'اختر مشكلة أخرى',
    source:'المصدر الرسمي', checked:'آخر تحقق', verify:'نموذج أولي: يجب تأكيد الأسعار مع هيئة الطرق والمواصلات قبل الإطلاق',
    disclaimer:'أوريفيا للإرشاد فقط، وليست نصيحة رسمية أو قانونية. تحقّق دائماً من المصدر الرسمي.',
    showStaff:'اعرض هذا على أحد الموظفين', close:'إغلاق', phraseBtn:'اعرض عبارة على الموظفين',
    doneEyebrow:'اكتملت الرحلة', doneTitle:'أنت الآن جاهز للتنقل.', nextUp:'إلى أين بعد ذلك',
    restart:'ابدأ هذه الرحلة من جديد', saved:'تم حفظ تقدمك على هذا الهاتف',
    tip:'نصيحة', bring:'ماذا تُحضر',
    cityClosed:'نعمل على كتابة رحلات هذه المدينة.',
    didItWork:'هل نجح ذلك؟', yesWorked:'نعم، نجح', yesTrain:'نعم، أنا في القطار الصحيح', stillLost:'لا، ما زلت أحتاج مساعدة',
    wellDone:'أحسنت. لقد وجدت طريقك.', stuckTitle:'لا بأس. دع أحداً يساعدك.',
    askStaff:'اسأل أحد الموظفين', askStaffBody:'ابحث عن موظفي هيئة الطرق والمواصلات بالزي الرسمي، أو عن مكتب خدمة العملاء قرب بوابات التذاكر. اعرض عليهم هذه الشاشة.',
    whereGoing:'إلى أين تذهب؟ (اختياري)', wherePh:'اكتب اسم المحطة',
    callRta:'اتصل بهيئة الطرق والمواصلات', callRtaBody:'خط المساعدة الخاص بالمواصلات العامة.',
    checkRoute:'تحقّق من طريقك', checkRouteBody:'افتح تطبيق «سهيل» واكتب وجهتك، وسيعرض لك القطار المناسب.',
    trust:{draft:'مسودة',official:'موثّقة رسمياً',reviewed:'راجعتها الجامعة',tested:n=>`جرّبها ${n} من القادمين الجدد`,testedNone:'لم يجرّبها قادمون جدد بعد'}, trustDesc:{draft:'مكتوبة من أدلة عامة، ولم تُراجَع بعد مع المصادر الرسمية.',official:'رُوجعت مع المصادر الرسمية المذكورة أدناه.',reviewed:'راجعتها الجامعة أو الجهة التي تدير هذه الإجراءات.',tested:'استخدم قادمون جدد حقيقيون هذا الإرشاد ووجدوه مطابقاً لتجربتهم.'},
    saveTitle:'احفظ رحلتك على هاتفك', saveBody:'احتفظ بتقدمك وبطاقات المساعدة حتى دون إنترنت.', saveBtn:'احفظ على الهاتف', later:'ليس الآن', gotIt:'فهمت',
    inappNote:'فتحت أوريفيا داخل تطبيق آخر. اضغط أولاً على القائمة (••• أو ⋮) واختر «فتح في المتصفح» أو «فتح في Safari» أو «فتح في Chrome»، ثم عد إلى هذه الخطوة.',
    iosHint:'لا ترى «إضافة إلى الشاشة الرئيسية»؟ انزل إلى أسفل القائمة، واضغط «تعديل الإجراءات»، ثم أضفها.',
    guide:{
      ios:[{icon:'share', text:'اضغط زر <b>المشاركة</b> في أسفل Safari، أو داخل قائمة <b>•••</b>.'},{icon:'plus', text:'انزل واضغط <b>إضافة إلى الشاشة الرئيسية</b>.'},{icon:'check', text:'اضغط <b>إضافة</b>، وستظهر أوريفيا على شاشتك الرئيسية مثل التطبيق.'}],
      android:[{icon:'dots', text:'اضغط قائمة <b>⋮</b> في أعلى المتصفح.'},{icon:'plus', text:'اضغط <b>إضافة إلى الشاشة الرئيسية</b> أو <b>تثبيت التطبيق</b>.'},{icon:'check', text:'اضغط <b>تثبيت</b> أو <b>إضافة</b>، وستظهر أوريفيا على شاشتك الرئيسية مثل التطبيق.'}],
      inapp:[{icon:'more', text:'اضغط قائمة <b>•••</b> أو <b>⋮</b> في هذا التطبيق.'},{icon:'compass', text:'اختر <b>فتح في المتصفح</b> (أو Safari أو Chrome).'},{icon:'plus', text:'في المتصفح، اضغط <b>احفظ على الهاتف</b> مرة أخرى.'}],
      desktop:[{icon:'plus', text:'في Chrome أو Edge، اضغط أيقونة التثبيت على يمين شريط العنوان.'},{icon:'check', text:'اضغط <b>تثبيت</b>.'}],
    }, offline:'أنت غير متصل بالإنترنت. الرحلات المحفوظة ما زالت تعمل.', important:'مهم',
    finderEyebrow:'لنعرف أين وصلت', yes:'نعم', notYet:'ليس بعد', notSure:'لست متأكداً', qOf:(i,t)=>`السؤال ${i} من ${t}`,
    hereEyebrow:'هذا هو موقعك', youAreHere:'أنت هنا', unsureNote:'لم تكن متأكداً من بعض الخطوات. اطلب من مكتب التأشيرات في جامعتك التأكيد قبل أي خطوة أخرى.', redo:'أجب عن الأسئلة من جديد', privacy:'إجاباتك تبقى على هذا الهاتف، ولا ترسلها أوريفيا إلى أي جهة.', startHere:'ابدأ من هنا', dontKnow:'لا أعرف', showThis:'اعرض هذا على الموظفين', sources:'المصادر', done:'تم', howChecked:'كيف تم التحقق', listen:'استمع', stop:'إيقاف', noVoice:'لا يوجد صوت لهذه اللغة على هذا الهاتف.',
    problems:'ماذا حدث؟', helpPhrase:'أنا جديد هنا وأحتاج إلى مساعدة. هل يمكنك مساعدتي من فضلك؟',
  }
};

/* ---------- Content data (the journey engine reads this) ---------- */
const DATA = {
  cities:{
    dubai:{
      kicker:{en:'Dubai · United Arab Emirates', ar:'دبي · الإمارات العربية المتحدة'},
      poster:'Dubai International · Arrivals',
      title:{en:"Welcome. You're here.", ar:'أهلاً بك. لقد وصلت.'},
      sub:{en:"Not sure what comes next? Orivia walks you through it, one step at a time.", ar:'لا تعرف ما الخطوة التالية؟ أوريفيا ترشدك خطوة بخطوة.'},
    },
    edinburgh:{
      kicker:{en:'Edinburgh · United Kingdom', ar:'إدنبرة · المملكة المتحدة'},
      poster:'Edinburgh Airport · Arrivals',
      title:{en:"Welcome. You're here.", ar:'أهلاً بك. لقد وصلت.'},
      sub:{en:"Not sure what comes next? Orivia walks you through it, one step at a time.", ar:'لا تعرف ما الخطوة التالية؟ أوريفيا ترشدك خطوة بخطوة.'},
    }
  },
  languages:[
    {code:'en', name:'English', ready:true},
    {code:'ar', name:'العربية', ready:true},
    {code:'fr', name:'Français'}, {code:'ur', name:'اردو'}, {code:'hi', name:'हिन्दी'}, {code:'tl', name:'Filipino'}
  ],
  needs:[
    {id:'move', icon:'move', name:{en:'Getting around', ar:'التنقل'}},
    {id:'docs', icon:'docs', name:{en:'Documents & ID', ar:'الوثائق والهوية'}},
    {id:'housing', icon:'housing', name:{en:'Housing', ar:'السكن'}},
    {id:'health', icon:'health', name:{en:'Healthcare', ar:'الرعاية الصحية'}},
    {id:'money', icon:'money', name:{en:'Money & banking', ar:'المال والبنوك'}},
    {id:'work', icon:'work', name:{en:'Work', ar:'العمل'}},
    {id:'edu', icon:'edu', name:{en:'Education', ar:'التعليم'}},
    {id:'life', icon:'life', name:{en:'Everyday life', ar:'الحياة اليومية'}},
    {id:'community', icon:'community', name:{en:'Community', ar:'المجتمع'}},
  ],
  tasks:{
    'dubai.move':[
      {journey:'dubai.nol', name:{en:'Start using the Metro, tram and bus', ar:'البدء باستخدام المترو والترام والحافلات'}, note:{en:'Get a nol card and take your first ride', ar:'احصل على بطاقة نول واركب أول رحلة'}},
      {name:{en:'Get from the airport to where you are staying', ar:'الوصول من المطار إلى مكان إقامتك'}},
      {name:{en:'Take a taxi or ride-hailing car', ar:'ركوب سيارة أجرة أو سيارة عبر التطبيقات'}},
    ],
    'dubai.docs':[
      {name:{en:'Get your Emirates ID', ar:'الحصول على الهوية الإماراتية'}},
      {name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}},
    ],
  },
  firstWeek:{
    dubai:[
      {need:'move', journey:'dubai.nol', name:{en:'Learn to get around', ar:'تعلّم التنقل في المدينة'}},
      {name:{en:'Get your Emirates ID', ar:'الحصول على الهوية الإماراتية'}},
      {name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}},
      {name:{en:'Open a bank account', ar:'فتح حساب بنكي'}},
    ]
  },
  journeys:{
    'dubai.nol':{
      city:'dubai', need:'move',
      title:{en:'Start using public transport', ar:'البدء باستخدام المواصلات العامة'},
      source:{name:{en:'RTA: nol cards', ar:'هيئة الطرق والمواصلات: بطاقات نول'}, url:'https://www.rta.ae/wps/portal/rta/ae/public-transport/nol'},
      checked:{en:'26 Sep 2026', ar:'26 سبتمبر 2026'},
      stages:[
        {id:'understand', label:{en:'Understand', ar:'افهم'}, title:{en:'What is a nol card?', ar:'ما هي بطاقة نول؟'},
         blocks:[
          {t:'p', v:{en:'Dubai’s Metro, tram, buses and water buses all use one prepaid card called nol. The name means “fare” in Arabic.', ar:'يستخدم مترو دبي والترام والحافلات والنقل البحري بطاقة واحدة مدفوعة مسبقاً اسمها «نول»، أي الأجرة.'}},
          {t:'list', v:[
            {en:'You can’t pay cash on board. You load money onto the card, then tap it when you travel.', ar:'لا يمكن الدفع نقداً داخل وسائل النقل. تشحن البطاقة برصيد ثم تمررها عند التنقل.'},
            {en:'One card works across the whole public transport network.', ar:'بطاقة واحدة تكفي لشبكة المواصلات العامة كلها.'},
            {en:'Taxis are separate. You usually pay them by bank card or cash.', ar:'سيارات الأجرة منفصلة، وتدفع لها عادةً بالبطاقة البنكية أو نقداً.'},
          ]},
         ]},
        {id:'prepare', label:{en:'Prepare', ar:'استعد'}, title:{en:'Choose your card', ar:'اختر بطاقتك'},
         blocks:[
          {t:'cards', v:[
            {color:'#B9C0C7', rec:true, name:{en:'Silver', ar:'الفضية'}, desc:{en:'Best for most people. About AED 25, which includes AED 19 of travel credit.', ar:'الأنسب لمعظم الناس. حوالي 25 درهماً، منها 19 درهماً رصيد للتنقل.'}},
            {color:'#C8382F', name:{en:'Red ticket', ar:'التذكرة الحمراء'}, desc:{en:'A paper ticket for a few trips. About AED 2, plus your fares.', ar:'تذكرة ورقية لعدد قليل من الرحلات. حوالي درهمين إضافة إلى الأجرة.'}},
            {color:'#D4A53A', name:{en:'Gold', ar:'الذهبية'}, desc:{en:'Like Silver, but lets you ride in Gold Class. Fares are double.', ar:'مثل الفضية، لكنها تتيح الركوب في الدرجة الذهبية. الأجرة مضاعفة.'}},
            {color:'#2F6DB5', name:{en:'Blue (personal)', ar:'الزرقاء (الشخصية)'}, desc:{en:'50% off for eligible students, seniors and people of determination. Needs your Emirates ID, so apply once you have it.', ar:'خصم 50% للطلاب وكبار السن وأصحاب الهمم المؤهلين. تحتاج إلى الهوية الإماراتية، فقدّم عليها بعد استلامها.'}},
          ]},
          {t:'tip', label:'bring', v:{en:'Cash or a bank card. You don’t need any documents for Silver, Red or Gold.', ar:'نقود أو بطاقة بنكية. لا تحتاج إلى أي وثائق للبطاقة الفضية أو الحمراء أو الذهبية.'}},
         ]},
        {id:'find', label:{en:'Find', ar:'اعثر'}, title:{en:'Where to buy it', ar:'أين تشتريها'},
         blocks:[
          {t:'list', v:[
            {en:'Any Metro station, at the ticket office or a ticket machine.', ar:'أي محطة مترو، من شباك التذاكر أو جهاز بيع التذاكر.'},
            {en:'Some bus stations and shops sell them too.', ar:'تبيعها أيضاً بعض محطات الحافلات وبعض المتاجر.'},
            {en:'RTA also sells cards online.', ar:'تبيع هيئة الطرق والمواصلات البطاقات عبر الإنترنت أيضاً.'},
          ]},
          {t:'tip', label:'tip', v:{en:'Just landed at DXB? Terminals 1 and 3 have their own Metro stations on the Red Line.', ar:'وصلت للتو إلى مطار دبي؟ للمبنى 1 والمبنى 3 محطتا مترو خاصتان على الخط الأحمر.'}},
         ]},
        {id:'getthere', label:{en:'Get there', ar:'الوصول'}, title:{en:'Getting to a station', ar:'الوصول إلى المحطة'},
         blocks:[
          {t:'list', v:[
            {en:'Follow the Metro signs in the airport terminal or on the street.', ar:'اتبع لافتات المترو في مبنى المطار أو في الشارع.'},
            {en:'RTA’s S’hail app plans your route and shows the nearest station.', ar:'تطبيق «سهيل» من هيئة الطرق والمواصلات يخطط رحلتك ويعرض أقرب محطة.'},
          ]},
          {t:'phrase'},
         ]},
        {id:'arrive', label:{en:'At the machine', ar:'عند الجهاز'}, title:{en:'At the ticket machine', ar:'عند جهاز التذاكر'},
         blocks:[
          {t:'steps', v:[
            {en:'Choose English or Arabic on the screen.', ar:'اختر العربية أو الإنجليزية على الشاشة.'},
            {en:'Choose to buy a new card, then pick Silver.', ar:'اختر شراء بطاقة جديدة، ثم البطاقة الفضية.'},
            {en:'Pay with cash or a bank card.', ar:'ادفع نقداً أو بالبطاقة البنكية.'},
            {en:'Take your card and the receipt. Keep the receipt.', ar:'خذ بطاقتك والإيصال، واحتفظ بالإيصال.'},
          ]},
          {t:'tip', label:'tip', v:{en:'Rather deal with a person? The ticket office window can do all of this for you.', ar:'تفضّل التعامل مع شخص؟ يمكن لشباك التذاكر القيام بكل هذا عنك.'}},
         ]},
        {id:'ride', label:{en:'First ride', ar:'أول رحلة'}, title:{en:'Riding for the first time', ar:'رحلتك الأولى'},
         blocks:[
          {t:'steps', v:[
            {en:'Tap your card on the gate reader when you go in.', ar:'مرّر بطاقتك على قارئ البوابة عند الدخول.'},
            {en:'Tap it again when you leave. Your fare depends on how many zones you cross.', ar:'مرّرها مرة أخرى عند الخروج. تعتمد الأجرة على عدد المناطق التي تعبرها.'},
          ]},
          {t:'list', v:[
            {en:'Keep enough credit. The gate may not open if your balance is below the minimum, about AED 7.50.', ar:'حافظ على رصيد كافٍ. قد لا تفتح البوابة إذا كان رصيدك أقل من الحد الأدنى، وهو حوالي 7.50 دراهم.'},
            {en:'No eating or drinking on the Metro, tram or bus. Fines apply.', ar:'يُمنع الأكل والشرب في المترو والترام والحافلات، وتُفرض غرامات على المخالفين.'},
            {en:'Watch the signs: Gold Class needs a Gold card, and some carriages are for women and children only.', ar:'انتبه للافتات: الدرجة الذهبية تحتاج بطاقة ذهبية، وبعض العربات مخصصة للنساء والأطفال فقط.'},
            {en:'Top up at any ticket machine, at the ticket office, or in the nol Pay app.', ar:'اشحن بطاقتك من أي جهاز تذاكر، أو من شباك التذاكر، أو من تطبيق nol Pay.'},
          ]},
         ]},
        {id:'next', label:{en:'What’s next', ar:'ما التالي'}, title:{en:'What comes next', ar:'ما الخطوة التالية'},
         blocks:[
          {t:'p', v:{en:'You can now travel across Dubai. Two things to keep in mind for later:', ar:'يمكنك الآن التنقل في أنحاء دبي. أمران تتذكرهما لاحقاً:'}},
          {t:'list', v:[
            {en:'If you’re a student, a senior or a person of determination, switch to a Blue card once your Emirates ID arrives.', ar:'إذا كنت طالباً أو من كبار السن أو من أصحاب الهمم، انتقل إلى البطاقة الزرقاء بعد استلام هويتك الإماراتية.'},
            {en:'Your Emirates ID and UAE PASS unlock most other services. Orivia will guide you through both.', ar:'الهوية الإماراتية وUAE PASS مفتاحا معظم الخدمات الأخرى، وستساعدك أوريفيا في كليهما.'},
          ]},
         ]},
      ],
      problems:[
        {id:'gate', q:{en:'The gate won’t open', ar:'البوابة لا تفتح'},
         a:{en:'This usually means your balance is too low. Top up at a ticket machine and try again. If it still won’t open, go to the ticket office so staff can check the card.', ar:'غالباً يعني هذا أن رصيدك منخفض. اشحن البطاقة من جهاز التذاكر وحاول مجدداً. إذا لم تفتح، توجّه إلى شباك التذاكر ليتحقق الموظفون من البطاقة.'}},
        {id:'machine', q:{en:'The machine won’t take my payment', ar:'الجهاز لا يقبل الدفع'},
         a:{en:'Try another machine or the ticket office window. Some machines take only cash or only cards, so check the labels on the machine.', ar:'جرّب جهازاً آخر أو شباك التذاكر. بعض الأجهزة تقبل النقد فقط أو البطاقات فقط، فتحقق من الملصقات على الجهاز.'}},
        {id:'lang', q:{en:'I don’t understand what they said', ar:'لم أفهم ما قالوه'}, phrase:true,
         a:{en:'Show this screen to a staff member. It asks for help in Arabic and English.', ar:'اعرض هذه الشاشة على أحد الموظفين. فيها طلب مساعدة بالعربية والإنجليزية.'}},
        {id:'lost', q:{en:'I lost my card', ar:'أضعت بطاقتي'},
         a:{en:'Silver, Gold and Red cards work like cash, so the balance usually can’t be recovered. A registered Blue card can be blocked and its balance moved to a new card. Buy a new card to keep travelling.', ar:'البطاقات الفضية والذهبية والحمراء مثل النقود، وعادةً لا يمكن استرجاع رصيدها. أما البطاقة الزرقاء المسجلة فيمكن إيقافها ونقل رصيدها إلى بطاقة جديدة. اشترِ بطاقة جديدة لتواصل التنقل.'}},
        {id:'wrongway', q:{en:'I got on the wrong train', ar:'ركبت القطار الخطأ'},
         guide:{
          calm:{en:'It’s OK. Taking the wrong train happens to almost everyone, and it’s easy to fix. Let’s do it together, one step at a time.', ar:'لا بأس. ركوب القطار الخطأ يحدث للجميع تقريباً، وحلّه سهل. لنقم بذلك معاً، خطوة بخطوة.'},
          steps:[
            {title:{en:'Stay on until the next station', ar:'ابقَ في القطار حتى المحطة التالية'},
             body:{en:'Don’t rush. The screen above the doors shows the name of the next station in English and Arabic, and you’ll hear it announced.', ar:'لا تستعجل. تعرض الشاشة فوق الأبواب اسم المحطة التالية بالعربية والإنجليزية، وستسمع إعلاناً باسمها.'}},
            {title:{en:'Get off, but stay inside the gates', ar:'انزل، لكن لا تخرج من البوابات'},
             body:{en:'Step off the train. Don’t tap your card and don’t go through the ticket gates. If you go out, you’ll have to tap in and pay again to come back.', ar:'انزل من القطار. لا تمرّر بطاقتك ولا تخرج من بوابات التذاكر. إذا خرجت، ستضطر إلى الدخول والدفع من جديد.'}},
            {title:{en:'Look up for the direction signs', ar:'انظر إلى لافتات الاتجاهات في الأعلى'},
             body:{en:'Signs hang from the ceiling. Each one shows the line colour and the name of the last station on the line. That name tells you which way the train goes. You want the way you just came from.', ar:'تتدلّى اللافتات من السقف، وكل واحدة تبيّن لون الخط واسم آخر محطة عليه. هذا الاسم يخبرك باتجاه القطار. أنت تحتاج الاتجاه الذي جئت منه.'},
             tip:{en:'Not sure which one? The line map on the platform wall shows every station in order. Find your station, then choose the direction named after the end of the line on its side.', ar:'لست متأكداً؟ خريطة الخط على جدار الرصيف تعرض كل المحطات بالترتيب. ابحث عن محطتك، ثم اختر الاتجاه الذي يحمل اسم طرف الخط من جهتها.'}},
            {title:{en:'Cross to the other side', ar:'انتقل إلى الجهة الأخرى'},
             body:{en:'At some stations, the other train stops across the same platform. At others, follow the sign up or down the stairs, escalator or lift to reach the other side. You can usually stay inside the gates the whole way.', ar:'في بعض المحطات يتوقف القطار الآخر في الجهة المقابلة من الرصيف نفسه. وفي غيرها، اتبع اللافتة صعوداً أو نزولاً بالدرج أو السلم المتحرك أو المصعد لتصل إلى الجهة الأخرى. يمكنك غالباً البقاء داخل البوابات طوال الوقت.'}},
            {title:{en:'Check before you get on', ar:'تحقّق قبل أن تركب'},
             body:{en:'The screen on the platform shows where the next train is going. If it matches the name on the sign you chose, get on. You’re back on track.', ar:'تعرض الشاشة على الرصيف وجهة القطار القادم. إذا طابقت الاسم على اللافتة التي اخترتها، اركب. لقد عدت إلى طريقك الصحيح.'}},
          ]
         },
         stuckPhrase:{en:s=>`I took the wrong train. How do I get to ${s||'my station'}?`, ar:s=>`ركبت القطار الخطأ. كيف أصل إلى ${s?'محطة \u2068'+s+'\u2069':'وجهتي'}؟`}
        },
        {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'},
         a:{en:'Call RTA on 800 9090, or ask at the customer service desk in any Metro station.', ar:'اتصل بهيئة الطرق والمواصلات على الرقم 800 9090، أو اسأل في مكتب خدمة العملاء في أي محطة مترو.'}},
      ],
      phrase:{en:'I’m new here. Can you help me buy a nol card?', ar:'أنا جديد هنا. هل يمكنك مساعدتي في شراء بطاقة نول؟'},
      after:[
        {name:{en:'Get your Emirates ID', ar:'الحصول على الهوية الإماراتية'}},
        {name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}},
      ]
    }
  }
};

/* ---------- Emirates ID journey: international students (Dubai) ---------- */
DATA.pathways = {
  'dubai.eid':{
    title:{en:'Who is arranging your UAE residency?', ar:'من يتولى إجراءات إقامتك في الإمارات؟'},
    sub:{en:'Your answer changes what you need to do. Most newcomers don’t do this alone.', ar:'إجابتك تغيّر ما عليك فعله. معظم القادمين الجدد لا يقومون بذلك وحدهم.'},
    options:[
      {name:{en:'My university', ar:'جامعتي'}, journey:'dubai.eid.student'},
      {name:{en:'My employer', ar:'جهة عملي'}},
      {name:{en:'A family member', ar:'أحد أفراد عائلتي'}},
      {name:{en:'I’m arranging it myself', ar:'أتولى ذلك بنفسي'}},
    ],
    dontKnow:{
      title:{en:'That’s OK. Here’s how to tell.', ar:'لا بأس. إليك كيف تعرف.'},
      items:[
        {en:'You came to study: your university usually sponsors your visa. Its visa office runs the process.', ar:'جئت للدراسة: عادةً تكفل جامعتك تأشيرتك، ويتولى مكتب التأشيرات فيها الإجراءات.'},
        {en:'You came to work: your employer usually handles it. The person who does this is often called the PRO (Public Relations Officer). Ask HR who your PRO is.', ar:'جئت للعمل: عادةً تتولى جهة عملك ذلك، والشخص المسؤول يُسمّى غالباً «مندوب العلاقات العامة» (PRO). اسأل الموارد البشرية عنه.'},
        {en:'You came to join family: the family member sponsoring you usually applies.', ar:'جئت للانضمام إلى عائلتك: عادةً يقدّم الطلب فرد العائلة الذي يكفلك.'},
      ],
      tip:{en:'Don’t start an application yourself until you’ve checked. Someone may already be doing it for you.', ar:'لا تبدأ طلباً بنفسك قبل أن تتأكد، فقد يكون أحدهم يقوم بذلك عنك.'}
    }
  }
};

const ICP_STATUS = 'https://icp.gov.ae/en/id-card-status/';
DATA.journeys['dubai.eid.student'] = {
  city:'dubai', need:'docs', icon:'docs', pathway:'dubai.eid',
  title:{en:'Your student residence visa and Emirates ID', ar:'تأشيرة الإقامة الدراسية والهوية الإماراتية'},
  doneTitle:{en:'You’re a UAE resident now.', ar:'أصبحت الآن مقيماً في الإمارات.'},
  sources:[
    {name:{en:'ICP: Emirates ID status', ar:'الهيئة الاتحادية للهوية والجنسية: حالة الهوية'}, url:ICP_STATUS},
    {name:{en:'University of Birmingham Dubai: student visa', ar:'جامعة برمنغهام دبي: تأشيرة الطالب'}, url:'https://www.birmingham.ac.uk/dubai/study/apply/visas/new'},
    {name:{en:'Murdoch University Dubai: student visa', ar:'جامعة مردوخ دبي: تأشيرة الطالب'}, url:'https://www.murdochuniversitydubai.com/explore/living-dubai/student-visa-options/'},
    {name:{en:'SIU Dubai: visa', ar:'جامعة سيمبيوسيس دبي: التأشيرة'}, url:'https://siu-dubai.ac.ae/visa'},
  ],
  checked:{en:'26 Sep 2026', ar:'26 سبتمبر 2026'},
  // Trust record: update 'reviewed' when the university signs off, and 'tested' after each successful user test.
  trust:{reviewed:false, tested:0},
  lastDone:{
    q:{en:'What’s the last thing you remember doing?', ar:'ما آخر شيء تتذكر أنك قمت به؟'},
    sub:{en:'Pick the closest one. You don’t need to know the official names.', ar:'اختر الأقرب. لا تحتاج إلى معرفة الأسماء الرسمية.'},
    options:[
      {done:0, v:{en:'I haven’t arrived in the UAE yet', ar:'لم أصل إلى الإمارات بعد'}},
      {done:1, v:{en:'I arrived in the UAE', ar:'وصلت إلى الإمارات'}},
      {done:2, v:{en:'I sent my entry permit to my university', ar:'أرسلت تصريح الدخول إلى جامعتي'}},
      {done:3, v:{en:'I had my medical test', ar:'أجريت الفحص الطبي'}},
      {done:4, v:{en:'I gave my fingerprints', ar:'أعطيت بصماتي'}},
      {done:5, v:{en:'I received my residence visa', ar:'استلمت تأشيرة الإقامة'}},
      {done:5, v:{en:'I was told my Emirates ID is ready', ar:'أُبلغت أن هويتي الإماراتية جاهزة'}},
      {done:6, v:{en:'I have my Emirates ID card', ar:'استلمت بطاقة الهوية الإماراتية'}},
    ],
    dontKnow:{en:'I really don’t know', ar:'لا أعرف حقاً'}, dontKnowSub:{en:'We’ll ask a few simple yes/no questions instead.', ar:'سنطرح عليك بعض أسئلة نعم/لا البسيطة بدلاً من ذلك.'}
  },
  finder:[
    {stage:'permit', q:{en:'Are you in the UAE now?', ar:'هل أنت في الإمارات الآن؟'}, yes:{en:'Yes, I’ve arrived', ar:'نعم، وصلت'}, no:{en:'Not yet', ar:'ليس بعد'}, noUnsure:true},
    {stage:'arrive', q:{en:'Have you sent your stamped entry permit to your university’s visa office?', ar:'هل أرسلت تصريح الدخول المختوم إلى مكتب التأشيرات في جامعتك؟'}, unsureLabel:{en:'I don’t know what that is', ar:'لا أعرف ما هذا'}},
    {stage:'medical', q:{en:'Have you done your medical fitness test?', ar:'هل أجريت فحص اللياقة الطبية؟'}, hint:{en:'A blood test and chest X-ray at a health centre.', ar:'فحص دم وأشعة للصدر في مركز صحي.'}},
    {stage:'biometrics', q:{en:'Have you had your fingerprints taken for your Emirates ID?', ar:'هل أُخذت بصماتك للهوية الإماراتية؟'}},
    {stage:'issued', q:{en:'Has your university told you your residence visa is issued?', ar:'هل أخبرتك جامعتك أن تأشيرة الإقامة صدرت؟'}},
    {stage:'card', q:{en:'Do you have your Emirates ID card?', ar:'هل استلمت بطاقة الهوية الإماراتية؟'}, noUnsure:true},
    {stage:'register', q:{en:'Have you finished your university registration since getting your card?', ar:'هل أكملت تسجيلك في الجامعة بعد استلام البطاقة؟'}},
  ],
  stages:[
    {id:'permit', level:'source', now:{en:'Your university is applying for your entry permit. Watch your email.', ar:'جامعتك تتقدّم بطلب تصريح الدخول. تابع بريدك الإلكتروني.'}, label:{en:'Entry permit', ar:'تصريح الدخول'}, title:{en:'Your entry permit, before you fly', ar:'تصريح الدخول قبل السفر'},
     help:['late','expiring','office'],
     blocks:[
      {t:'p', v:{en:'Your university applies for your entry permit. You send them your documents, and they do the rest.', ar:'تتقدّم جامعتك بطلب تصريح الدخول. أنت ترسل المستندات، وهي تتولى الباقي.'}},
      {t:'list', v:[
        {en:'It usually takes about 7–15 working days.', ar:'يستغرق عادةً من 7 إلى 15 يوم عمل.'},
        {en:'When it arrives, print it and book your flight.', ar:'عندما يصلك، اطبعه واحجز رحلتك.'},
        {en:'It has an expiry date. Arrive in the UAE before it runs out.', ar:'للتصريح تاريخ انتهاء، فاحرص على الوصول إلى الإمارات قبله.'},
      ]},
      {t:'tip', label:'bring', v:{en:'Your passport (usually valid for 6+ months), a photo with a white background, and the forms your university sends.', ar:'جواز سفرك (صالح عادةً لستة أشهر على الأقل)، وصورة بخلفية بيضاء، والنماذج التي ترسلها جامعتك.'}},
     ]},
    {id:'arrive', level:'source', now:{en:'Next: send your stamped entry permit to your university’s visa office.', ar:'التالي: أرسل تصريح الدخول المختوم إلى مكتب التأشيرات في جامعتك.'}, label:{en:'Arrive', ar:'الوصول'}, title:{en:'Tell your university you’ve arrived', ar:'أبلغ جامعتك بوصولك'},
     help:['office','lostpermit','travel'],
     blocks:[
      {t:'steps', v:[
        {en:'At the airport, your entry permit is stamped. Keep it safe.', ar:'في المطار يُختم تصريح دخولك. احتفظ به جيداً.'},
        {en:'Send a copy to your university’s visa office, or take it in. Some universities ask for this within 3 working days.', ar:'أرسل نسخة منه إلى مكتب التأشيرات في جامعتك أو سلّمه بنفسك. بعض الجامعات تطلب ذلك خلال 3 أيام عمل.'},
        {en:'They start your residence visa and email you the next appointments.', ar:'يبدأ المكتب إجراءات تأشيرة الإقامة ويرسل إليك المواعيد التالية بالبريد الإلكتروني.'},
      ]},
      {t:'tip', label:'important', v:{en:'Don’t travel out of the UAE while your visa is being processed. If you have to, ask your visa office first.', ar:'لا تسافر خارج الإمارات أثناء معالجة تأشيرتك. إذا اضطررت، اسأل مكتب التأشيرات أولاً.'}},
     ]},
    {id:'medical', level:'source', now:{en:'Next: your university sends you a medical test appointment.', ar:'التالي: ترسل إليك جامعتك موعد الفحص الطبي.'}, label:{en:'Medical test', ar:'الفحص الطبي'}, title:{en:'Your medical fitness test', ar:'فحص اللياقة الطبية'},
     help:['noappt','result','staff'],
     blocks:[
      {t:'p', v:{en:'Every new resident has this routine check. It’s a blood test and a chest X-ray.', ar:'يخضع كل مقيم جديد لهذا الفحص الروتيني، وهو فحص دم وأشعة للصدر.'}},
      {t:'steps', v:[
        {en:'Your university emails you an appointment and a form.', ar:'ترسل إليك جامعتك موعداً ونموذجاً بالبريد الإلكتروني.'},
        {en:'Go to the health centre at your appointment time. Bring your passport and the form.', ar:'اذهب إلى المركز الصحي في موعدك، ومعك جواز سفرك والنموذج.'},
        {en:'Your university gets the result, usually within a few working days, and moves your application on.', ar:'تستلم جامعتك النتيجة عادةً خلال أيام عمل قليلة، وتواصل إجراءات طلبك.'},
      ]},
      {t:'phraseCard', v:{en:'I’m here for my medical fitness test.', ar:'جئت لإجراء فحص اللياقة الطبية.'}},
     ]},
    {id:'biometrics', level:'source', now:{en:'Next: your university should email you instructions for your fingerprint appointment.', ar:'التالي: يُفترض أن ترسل إليك جامعتك تعليمات موعد البصمات بالبريد الإلكتروني.'}, label:{en:'Fingerprints', ar:'البصمات'}, title:{en:'Fingerprints for your Emirates ID', ar:'البصمات للهوية الإماراتية'},
     help:['missed','where','noappt2','staff'],
     blocks:[
      {t:'steps', v:[
        {en:'Your university books the appointment and emails you the place and time.', ar:'تحجز جامعتك الموعد وترسل إليك المكان والوقت بالبريد الإلكتروني.'},
        {en:'Go at that time, with your passport and the appointment email.', ar:'اذهب في ذلك الوقت ومعك جواز سفرك ورسالة الموعد.'},
        {en:'Staff scan your fingerprints for your Emirates ID.', ar:'يمسح الموظفون بصماتك من أجل الهوية الإماراتية.'},
      ]},
      {t:'tip', label:'important', v:{en:'Can’t make it? Tell your visa office before the appointment so they can rebook.', ar:'لا تستطيع الحضور؟ أبلغ مكتب التأشيرات قبل الموعد ليحجز لك موعداً آخر.'}},
      {t:'phraseCard', v:{en:'I have a fingerprint appointment for my Emirates ID.', ar:'لدي موعد لأخذ البصمات للهوية الإماراتية.'}},
     ]},
    {id:'issued', level:'source', now:{en:'Next: wait for your residence visa. This part is mostly waiting.', ar:'التالي: انتظر صدور تأشيرة الإقامة. هذه المرحلة انتظار في الغالب.'}, label:{en:'Residence visa', ar:'تأشيرة الإقامة'}, title:{en:'Waiting for your residence visa', ar:'انتظار تأشيرة الإقامة'},
     help:['status','slow','office'],
     blocks:[
      {t:'p', v:{en:'After your medical test and fingerprints, your university applies for your residence visa. The whole process usually takes about 3–5 weeks after you arrive.', ar:'بعد الفحص الطبي والبصمات، تتقدّم جامعتك بطلب تأشيرة الإقامة. تستغرق العملية كلها عادةً من 3 إلى 5 أسابيع بعد وصولك.'}},
      {t:'list', v:[
        {en:'The visa comes first, then your Emirates ID card.', ar:'تصدر التأشيرة أولاً، ثم بطاقة الهوية الإماراتية.'},
        {en:'Some universities still call this step “stamping”.', ar:'بعض الجامعات ما زالت تسمّي هذه الخطوة «ختم التأشيرة».'},
        {en:'Your university tells you when it’s done and sends you a copy.', ar:'ستخبرك جامعتك عند صدورها وترسل إليك نسخة منها.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Ask when your student health insurance starts. At some universities it only begins once the visa is issued.', ar:'اسأل متى يبدأ تأمينك الصحي كطالب، ففي بعض الجامعات لا يبدأ إلا بعد صدور التأشيرة.'}},
     ]},
    {id:'card', level:'source', now:{en:'Next: collect your Emirates ID card.', ar:'التالي: استلم بطاقة الهوية الإماراتية.'}, label:{en:'Emirates ID', ar:'الهوية'}, title:{en:'Getting your Emirates ID card', ar:'استلام بطاقة الهوية الإماراتية'},
     help:['status','wherecard','slow'],
     blocks:[
      {t:'list', v:[
        {en:'Your university usually tells you when the card is ready and where to collect it. Often it’s at the university.', ar:'عادةً تخبرك جامعتك عندما تصبح البطاقة جاهزة ومكان استلامها، وغالباً ما يكون في الجامعة.'},
        {en:'You can check the status yourself on the ICP website, using your application number (PRAN).', ar:'يمكنك متابعة حالة الطلب بنفسك على موقع الهيئة الاتحادية للهوية والجنسية برقم الطلب (PRAN).'},
        {en:'Don’t have your PRAN? Ask your visa office. They made the application, so they have it.', ar:'ليس لديك رقم الطلب؟ اسأل مكتب التأشيرات، فهو من قدّم الطلب ولديه الرقم.'},
      ]},
      {t:'link', url:ICP_STATUS, v:{en:'Check your Emirates ID status on ICP', ar:'تحقّق من حالة هويتك على موقع الهيئة'}},
     ]},
    {id:'register', level:'source', now:{en:'You’re nearly done. Next: finish your university registration.', ar:'أوشكت على الانتهاء. التالي: أكمل تسجيلك في الجامعة.'}, label:{en:'Registration', ar:'التسجيل'}, title:{en:'Finish your university registration', ar:'أكمل تسجيلك في الجامعة'},
     help:['office','whatdocs'],
     blocks:[
      {t:'p', v:{en:'You’re nearly done. Some universities ask you to confirm your right to study once your residence documents are ready.', ar:'أوشكت على الانتهاء. تطلب بعض الجامعات تأكيد حقك في الدراسة بعد جاهزية مستندات إقامتك.'}},
      {t:'list', v:[
        {en:'At the University of Birmingham Dubai, for example, this is called a Right to Study Check. It’s the last step after collecting your Emirates ID.', ar:'في جامعة برمنغهام دبي مثلاً يُسمّى هذا «التحقق من حق الدراسة»، وهو الخطوة الأخيرة بعد استلام الهوية الإماراتية.'},
        {en:'Your university tells you what to bring. Keep your passport and Emirates ID with you.', ar:'ستخبرك جامعتك بما عليك إحضاره. احتفظ بجواز سفرك وهويتك الإماراتية معك.'},
      ]},
     ]},
    {id:'next', now:{en:'You’re done. Here’s what your Emirates ID unlocks.', ar:'انتهيت. إليك ما تتيحه لك هويتك الإماراتية.'}, label:{en:'What’s next', ar:'ما التالي'}, title:{en:'Put your Emirates ID to work', ar:'استفد من هويتك الإماراتية'},
     help:['nopass'],
     blocks:[
      {t:'list', v:[
        {en:'Set up UAE PASS, the national digital ID, with your Emirates ID. Government apps like DubaiNow need it.', ar:'فعّل الهوية الرقمية UAE PASS باستخدام هويتك الإماراتية، فالتطبيقات الحكومية مثل «دبي الآن» تحتاج إليها.'},
        {en:'As a student, you can apply for a Blue nol card for 50% off public transport.', ar:'بصفتك طالباً، يمكنك التقدّم للحصول على بطاقة نول الزرقاء بخصم 50% على المواصلات العامة.'},
        {en:'Opening a bank account is usually easier once you have your Emirates ID.', ar:'يصبح فتح حساب بنكي عادةً أسهل بعد حصولك على الهوية الإماراتية.'},
      ]},
     ]},
  ],
  problems:[
    {id:'office', q:{en:'I don’t know who my visa office is', ar:'لا أعرف مكتب التأشيرات في جامعتي'},
     a:{en:'Look in your offer or welcome emails, or search your university’s website for “student visa”. The student services desk on campus can point you there too.', ar:'ابحث في رسائل القبول أو الترحيب، أو ابحث في موقع جامعتك عن «تأشيرة الطالب». ويمكن لمكتب خدمات الطلاب في الحرم الجامعي أن يرشدك أيضاً.'}},
    {id:'late', q:{en:'My entry permit hasn’t come yet', ar:'لم يصلني تصريح الدخول بعد'},
     a:{en:'It usually takes 7–15 working days after your university applies. If it’s been longer, email the visa office with your full name and passport number.', ar:'يستغرق عادةً من 7 إلى 15 يوم عمل بعد تقديم جامعتك الطلب. إذا تأخر أكثر، راسل مكتب التأشيرات باسمك الكامل ورقم جوازك.'}},
    {id:'expiring', q:{en:'My entry permit is about to expire', ar:'تصريح دخولي على وشك الانتهاء'},
     a:{en:'Tell your visa office today. Don’t wait until it expires.', ar:'أبلغ مكتب التأشيرات اليوم، ولا تنتظر حتى ينتهي.'}},
    {id:'lostpermit', q:{en:'I lost my entry permit', ar:'أضعت تصريح الدخول'},
     a:{en:'Tell your visa office. They applied for it, so they can usually send you a copy.', ar:'أبلغ مكتب التأشيرات، فهو من قدّم الطلب ويمكنه عادةً أن يرسل إليك نسخة.'}},
    {id:'travel', q:{en:'I need to travel', ar:'أحتاج إلى السفر'},
     a:{en:'Talk to your visa office before you book anything. Leaving the UAE during processing can cause serious problems with your visa.', ar:'تحدّث إلى مكتب التأشيرات قبل أن تحجز أي شيء، فمغادرة الإمارات أثناء المعالجة قد تسبب مشاكل كبيرة في تأشيرتك.'}},
    {id:'noappt', q:{en:'I haven’t got a medical appointment', ar:'لم يصلني موعد الفحص الطبي'},
     a:{en:'Check your junk email folder first. If it isn’t there, ask your visa office whether they’ve received your stamped entry permit.', ar:'تحقّق أولاً من مجلد الرسائل غير المرغوب فيها. إذا لم تجده، اسأل مكتب التأشيرات إن كان قد استلم تصريح دخولك المختوم.'}},
    {id:'result', q:{en:'My medical result isn’t ready', ar:'نتيجة فحصي الطبي لم تصدر'},
     a:{en:'Results usually take a few working days and go to your university, not to you. If it’s been more than a week, ask your visa office.', ar:'تستغرق النتائج عادةً أياماً قليلة وتذهب إلى جامعتك لا إليك. إذا مرّ أكثر من أسبوع، اسأل مكتب التأشيرات.'}},
    {id:'missed', q:{en:'I missed my appointment', ar:'فاتني موعدي'},
     a:{en:'Contact your visa office today and ask them to rebook. The sooner you tell them, the less it delays your visa.', ar:'تواصل مع مكتب التأشيرات اليوم واطلب موعداً جديداً. كلما أبلغتهم أسرع، قلّ التأخير في تأشيرتك.'}},
    {id:'where', q:{en:'I can’t find the centre', ar:'لا أجد المركز'},
     a:{en:'The address is in your appointment email. Show it to a taxi driver, or show this card to someone working nearby.', ar:'العنوان موجود في رسالة الموعد. اعرضه على سائق الأجرة، أو اعرض هذه البطاقة على أحد العاملين بالقرب منك.'},
     phraseText:{en:'I have a fingerprint appointment for my Emirates ID. Where is this centre?', ar:'لدي موعد لأخذ البصمات للهوية الإماراتية. أين هذا المركز؟'}},
    {id:'staff', q:{en:'I don’t understand what staff said', ar:'لم أفهم ما قاله الموظفون'},
     a:{en:'Show them this card. It asks them to slow down or write it down. You can also call your visa office and hand the staff your phone.', ar:'اعرض عليهم هذه البطاقة، فهي تطلب منهم التحدث ببطء أو الكتابة. ويمكنك أيضاً الاتصال بمكتب التأشيرات وإعطاء الهاتف للموظف.'},
     phraseText:{en:'I’m a new student. Could you please say that more slowly, or write it down?', ar:'أنا طالب جديد. هل يمكنك أن تقول ذلك ببطء أكثر، أو تكتبه لي من فضلك؟'}},
    {id:'whatdocs', q:{en:'I don’t know what to bring', ar:'لا أعرف ماذا أُحضر'},
     a:{en:'Ask your university’s visa office or student services. Each university has its own list. Bring your passport and Emirates ID either way.', ar:'اسأل مكتب التأشيرات أو خدمات الطلاب في جامعتك، فلكل جامعة قائمتها. وأحضر جواز سفرك وهويتك الإماراتية في كل الأحوال.'}},
    {id:'noappt2', q:{en:'They say I don’t have an appointment', ar:'يقولون إنه ليس لدي موعد'},
     a:{en:'Show them your appointment email. If that doesn’t work, call your visa office from there so they can speak to the staff.', ar:'اعرض عليهم رسالة الموعد. إذا لم ينجح ذلك، اتصل بمكتب التأشيرات من هناك ليتحدثوا مع الموظفين.'}},
    {id:'status', q:{en:'I don’t know where my application is', ar:'لا أعرف أين وصل طلبي'},
     branch:{q:{en:'Do you have your application number (PRAN)?', ar:'هل لديك رقم الطلب (PRAN)؟'},
      options:[
        {label:{en:'Yes', ar:'نعم'}, a:{en:'Enter it on ICP’s status page. It shows where your Emirates ID is.', ar:'أدخله في صفحة الحالة على موقع الهيئة، وستعرض لك أين وصلت هويتك.'}, link:ICP_STATUS},
        {label:{en:'No', ar:'لا'}, a:{en:'Ask your university’s visa office for it. They made the application, so they have it.', ar:'اطلبه من مكتب التأشيرات في جامعتك، فهو من قدّم الطلب ولديه الرقم.'}},
        {label:{en:'I don’t know what that is', ar:'لا أعرف ما هذا'}, a:{en:'It’s the number given when your Emirates ID application was made. Your visa office has it, so ask them.', ar:'هو الرقم الذي يُعطى عند تقديم طلب الهوية الإماراتية. مكتب التأشيرات لديه هذا الرقم، فاسأله عنه.'}},
      ]}},
    {id:'slow', q:{en:'It’s taking longer than expected', ar:'الأمر يستغرق أطول من المتوقع'},
     a:{en:'The whole process usually takes about 3–5 weeks after you arrive. If it’s been longer, ask your visa office first. Still stuck? Call ICP on 600 522222.', ar:'تستغرق العملية كلها عادةً من 3 إلى 5 أسابيع بعد وصولك. إذا طالت أكثر، اسأل مكتب التأشيرات أولاً. وإذا بقيت المشكلة، اتصل بالهيئة على الرقم 600522222.'}},
    {id:'wherecard', q:{en:'I don’t know where to collect my card', ar:'لا أعرف أين أستلم بطاقتي'},
     a:{en:'Ask your visa office. At many universities, students collect the card from the university.', ar:'اسأل مكتب التأشيرات، ففي كثير من الجامعات يستلم الطلاب البطاقة من الجامعة نفسها.'}},
    {id:'nopass', q:{en:'I can’t set up UAE PASS', ar:'لا أستطيع تفعيل UAE PASS'},
     a:{en:'Wait until you have your Emirates ID card, then try again in the UAE PASS app. UAE PASS kiosks can help too.', ar:'انتظر حتى تستلم بطاقة الهوية، ثم حاول مجدداً في تطبيق UAE PASS. ويمكن لأجهزة الخدمة الذاتية الخاصة بـ UAE PASS أن تساعدك أيضاً.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'},
     a:{en:'Start with your university’s visa office. They sponsor your visa and can see your application. For Emirates ID questions, you can also call ICP on 600 522222.', ar:'ابدأ بمكتب التأشيرات في جامعتك، فهو كفيل تأشيرتك ويمكنه الاطلاع على طلبك. ولأسئلة الهوية الإماراتية يمكنك أيضاً الاتصال بالهيئة على الرقم 600522222.'}},
  ],
  stuck:{
    cards:[
      {title:{en:'Ask your university’s visa office', ar:'اسأل مكتب التأشيرات في جامعتك'}, body:{en:'They sponsor your visa and can see your application.', ar:'فهو كفيل تأشيرتك ويمكنه الاطلاع على طلبك.'}},
      {title:{en:'Call ICP', ar:'اتصل بالهيئة الاتحادية للهوية والجنسية'}, phone:'600 522222', body:{en:'The federal authority that issues Emirates IDs. From outside the UAE: +971 600 522222.', ar:'الجهة الاتحادية التي تُصدر الهوية الإماراتية. من خارج الإمارات: 600522222 971+.'}},
    ]
  },
  after:[
    {name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}},
    {name:{en:'Open a bank account', ar:'فتح حساب بنكي'}},
  ]
};
DATA.tasks['dubai.docs'] = [
  {pathway:'dubai.eid', name:{en:'Get your student residence visa and Emirates ID', ar:'الحصول على تأشيرة الإقامة الدراسية والهوية الإماراتية'}, note:{en:'Find out where you are, then what to do next', ar:'اعرف أين وصلت، ثم ما عليك فعله'}},
  {name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}},
];
DATA.firstWeek.dubai[1] = {pathway:'dubai.eid', name:{en:'Get your Emirates ID', ar:'الحصول على الهوية الإماراتية'}};

