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
    ready:'Ready', inFull:'Coming soon',
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
    trust:{draft:'Draft',official:'Officially verified',reviewed:'Institution reviewed',tested:n=>`Tested with ${n} newcomer${n===1?'':'s'}`,testedNone:'Not yet tested with newcomers'}, trustDesc:{draft:'Written from public guides. Not yet checked against official sources.',official:'Checked against the official sources listed below.',reviewed:'Reviewed by the university or authority that runs this process.',tested:'Real newcomers used this guidance and it matched their experience.'},
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
    ready:'جاهز', inFull:'قريباً',
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
    trust:{draft:'مسودة',official:'موثّقة رسمياً',reviewed:'راجعتها الجهة المختصة',tested:n=>`جرّبها ${n} من القادمين الجدد`,testedNone:'لم يجرّبها قادمون جدد بعد'}, trustDesc:{draft:'مكتوبة من أدلة عامة، ولم تُراجَع بعد مع المصادر الرسمية.',official:'رُوجعت مع المصادر الرسمية المذكورة أدناه.',reviewed:'راجعتها الجامعة أو الجهة التي تدير هذه الإجراءات.',tested:'استخدم قادمون جدد حقيقيون هذا الإرشاد ووجدوه مطابقاً لتجربتهم.'},
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


/* ---------- First-days journeys (Dubai): airport, taxi, SIM card, UAE PASS ---------- */
const SRC = {
  dxbMetro:{name:{en:'Dubai Airports: Metro', ar:'مطارات دبي: المترو'}, url:'https://dubaiairports.ae/transport/metro'},
  dxbTaxi:{name:{en:'Dubai Airports: Taxi', ar:'مطارات دبي: سيارات الأجرة'}, url:'https://dubaiairports.ae/transport/taxi'},
  rtaTaxi:{name:{en:'RTA: Taxi fares', ar:'هيئة الطرق والمواصلات: أجرة التاكسي'}, url:'https://www.rta.ae/wps/portal/rta/ae/home/promotion/taxi-fare'},
  careemHala:{name:{en:'Careem: Booking a Hala taxi', ar:'كريم: حجز تاكسي هلا'}, url:'https://help.careem.com/hc/en-us/articles/4410000971795-Booking-a-Hala-ride-from-Careem-app'},
  tdra:{name:{en:'TDRA: FAQs', ar:'هيئة تنظيم الاتصالات: الأسئلة الشائعة'}, url:'https://tdra.gov.ae/en/FAQs'},
  uaepassGov:{name:{en:'TDRA Digital Government: UAE PASS', ar:'الحكومة الرقمية: UAE PASS'}, url:'https://dgov.tdra.gov.ae/services/uae-pass'},
  uaepassPortal:{name:{en:'u.ae: The UAE PASS app', ar:'البوابة الرسمية: تطبيق UAE PASS'}, url:'https://u.ae/en/about-the-uae/digital-uae/digital-transformation/platforms-and-apps/the-uae-pass-app'},
};
const CHECKED = {en:'26 Sep 2026', ar:'26 سبتمبر 2026'};
const HELP_ELSE_RTA = {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'For taxi or public transport problems, call RTA on 800 9090.', ar:'لمشاكل التاكسي أو المواصلات العامة، اتصل بهيئة الطرق والمواصلات على الرقم 800 9090.'}};

DATA.journeys['dubai.airport'] = {
  city:'dubai', need:'move', icon:'move',
  title:{en:'From the airport to where you’re staying', ar:'من المطار إلى مكان إقامتك'},
  sources:[SRC.dxbMetro, SRC.dxbTaxi, SRC.rtaTaxi], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'choose', level:'source', label:{en:'Choose', ar:'اختر'}, title:{en:'Choose how to travel', ar:'اختر طريقة التنقل'}, help:['metroclosed','nocash','else'],
     blocks:[
      {t:'cards', v:[
        {color:'#C8382F', rec:true, name:{en:'Metro', ar:'المترو'}, desc:{en:'Cheapest. Red Line stations are inside Terminals 1 and 3. You can bring up to 2 bags, including hand luggage.', ar:'الأرخص. محطات الخط الأحمر داخل المبنى 1 والمبنى 3. يمكنك حمل حقيبتين كحد أقصى، بما فيها حقيبة اليد.'}},
        {color:'#D4A53A', name:{en:'Taxi', ar:'التاكسي'}, desc:{en:'Easiest with lots of luggage. Runs 24/7 from the taxi rank. Starts at about AED 20–25, plus distance.', ar:'الأسهل إذا كانت معك أمتعة كثيرة. متوفر على مدار الساعة من موقف التاكسي. تبدأ الأجرة من نحو 20–25 درهماً، إضافة إلى المسافة.'}},
        {color:'#2F6DB5', name:{en:'Ride-hailing app', ar:'تطبيق نقل'}, desc:{en:'Uber, Careem or Bolt. Book in the app, then follow the signs to the pickup point.', ar:'أوبر أو كريم أو بولت. احجز في التطبيق، ثم اتبع اللافتات إلى نقطة الالتقاء.'}},
      ]},
      {t:'tip', label:'tip', v:{en:'Heavy bags, or landing late? Take a taxi. The Metro runs from about 5am to midnight (from 8am on Sundays).', ar:'أمتعة ثقيلة أو وصلت متأخراً؟ خذ تاكسي. يعمل المترو تقريباً من 5 صباحاً حتى منتصف الليل (ومن 8 صباحاً يوم الأحد).'}},
     ]},
    {id:'metro', level:'source', label:{en:'By Metro', ar:'بالمترو'}, title:{en:'If you take the Metro', ar:'إذا اخترت المترو'}, help:['metroclosed','toomuch','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Follow the Metro signs inside Terminal 1 or 3.', ar:'اتبع لافتات المترو داخل المبنى 1 أو المبنى 3.'},
        {en:'Buy a nol card or ticket at the ticket office or a machine in the terminal.', ar:'اشترِ بطاقة نول أو تذكرة من شباك التذاكر أو من جهاز في المبنى.'},
        {en:'Take the Red Line. Plan your stop in RTA’s S’hail app.', ar:'اركب الخط الأحمر، وخطط لمحطتك في تطبيق «سهيل» من هيئة الطرق والمواصلات.'},
      ]},
      {t:'journeyLink', journey:'dubai.nol', v:{en:'New to nol cards? See the step-by-step guide', ar:'جديد على بطاقات نول؟ اطّلع على الدليل خطوة بخطوة'}},
     ]},
    {id:'taxi', level:'source', label:{en:'By taxi or app', ar:'بالتاكسي أو التطبيق'}, title:{en:'If you take a taxi or app', ar:'إذا اخترت التاكسي أو التطبيق'}, help:['address','nocash','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Follow the Taxi signs to the rank, or the app signs to your pickup point.', ar:'اتبع لافتات التاكسي إلى الموقف، أو لافتات التطبيق إلى نقطة الالتقاء.'},
        {en:'Show the driver your address or a map pin.', ar:'اعرض على السائق عنوانك أو موقعه على الخريطة.'},
        {en:'Pay at the end by card or cash. Road tolls (Salik) are added to the fare.', ar:'ادفع في النهاية بالبطاقة أو نقداً. تُضاف رسوم الطرق (سالك) إلى الأجرة.'},
      ]},
      {t:'phraseCard', v:{en:'Please take me to this address. Here it is on the map.', ar:'من فضلك خذني إلى هذا العنوان. هذا هو على الخريطة.'}},
     ]},
    {id:'arrived', label:{en:'Arrived', ar:'الوصول'}, title:{en:'You’ve arrived. What next?', ar:'وصلت. ما التالي؟'}, help:['else'],
     blocks:[
      {t:'list', v:[
        {en:'Get a UAE SIM card so you can use maps and messages without Wi-Fi.', ar:'احصل على شريحة هاتف إماراتية لتستخدم الخرائط والرسائل دون شبكة واي فاي.'},
        {en:'If you’re a student, tell your university you’ve arrived. It starts your residence visa.', ar:'إذا كنت طالباً، أبلغ جامعتك بوصولك، فهذا يبدأ إجراءات تأشيرة الإقامة.'},
      ]},
      {t:'journeyLink', journey:'dubai.sim', v:{en:'Get a UAE SIM card', ar:'احصل على شريحة هاتف إماراتية'}},
     ]},
  ],
  problems:[
    {id:'metroclosed', q:{en:'The Metro is closed', ar:'المترو مغلق'}, a:{en:'Take a taxi from the rank. Airport taxis run 24/7.', ar:'خذ تاكسي من الموقف، فسيارات أجرة المطار تعمل على مدار الساعة.'}},
    {id:'nocash', q:{en:'I don’t have any dirhams', ar:'ليس معي دراهم'}, a:{en:'Taxis accept bank cards, so you don’t need cash. Ride-hailing apps charge your card too.', ar:'تقبل سيارات الأجرة البطاقات البنكية، فلا تحتاج إلى نقود. وتطبيقات النقل تخصم من بطاقتك أيضاً.'}},
    {id:'toomuch', q:{en:'I have too much luggage for the Metro', ar:'معي أمتعة أكثر من المسموح في المترو'}, a:{en:'The Metro allows up to 2 bags, including hand luggage. With more, take a taxi or a larger ride-hailing car.', ar:'يسمح المترو بحقيبتين كحد أقصى، بما فيها حقيبة اليد. إذا كان معك أكثر، خذ تاكسي أو سيارة أكبر عبر التطبيق.'}},
    {id:'address', q:{en:'The driver doesn’t know my address', ar:'السائق لا يعرف عنواني'}, a:{en:'Show a map pin, or name a landmark nearby, such as a mall, hotel or Metro station.', ar:'اعرض موقعاً على الخريطة، أو اذكر معلماً قريباً مثل مركز تسوق أو فندق أو محطة مترو.'}, phraseText:{en:'Please take me to this address. Here it is on the map.', ar:'من فضلك خذني إلى هذا العنوان. هذا هو على الخريطة.'}},
    HELP_ELSE_RTA,
  ],
  stuck:{cards:[{title:{en:'Ask at an airport information desk', ar:'اسأل في مكتب الاستعلامات في المطار'}, body:{en:'Staff can point you to the Metro, taxi rank or pickup points.', ar:'يمكن للموظفين إرشادك إلى المترو أو موقف التاكسي أو نقاط الالتقاء.'}},{title:{en:'Call RTA', ar:'اتصل بهيئة الطرق والمواصلات'}, phone:'800 9090', body:{en:'Dubai’s roads and transport authority.', ar:'هيئة الطرق والمواصلات في دبي.'}}]},
  after:[{journey:'dubai.sim', name:{en:'Get a UAE SIM card', ar:'احصل على شريحة هاتف إماراتية'}}],
};

DATA.journeys['dubai.taxi'] = {
  city:'dubai', need:'move', icon:'move',
  title:{en:'Take a taxi or ride-hailing car', ar:'ركوب تاكسي أو سيارة عبر التطبيقات'},
  sources:[SRC.rtaTaxi, SRC.dxbTaxi, SRC.careemHala], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'which', level:'source', label:{en:'Street or app', ar:'الشارع أو التطبيق'}, title:{en:'Street taxi or app?', ar:'تاكسي من الشارع أم عبر التطبيق؟'}, help:['else'],
     blocks:[
      {t:'list', v:[
        {en:'You can wave down a taxi on the street, or book one in an app.', ar:'يمكنك إيقاف تاكسي من الشارع، أو حجزه عبر تطبيق.'},
        {en:'A street taxi starts at AED 5 (6am–10pm) or AED 5.5 (10pm–6am), plus distance.', ar:'تبدأ أجرة تاكسي الشارع من 5 دراهم (6 صباحاً–10 مساءً) أو 5.5 دراهم (10 مساءً–6 صباحاً)، إضافة إلى المسافة.'},
        {en:'Booking a taxi in an app starts higher, from AED 9.', ar:'حجز التاكسي عبر التطبيق يبدأ بأجرة أعلى، من 9 دراهم.'},
        {en:'Common apps: Careem (which also books official Hala taxis), Uber and Bolt.', ar:'تطبيقات شائعة: كريم (ويمكن عبره حجز تاكسي «هلا» الرسمي)، وأوبر، وبولت.'},
      ]},
     ]},
    {id:'ride', level:'source', label:{en:'The ride', ar:'الرحلة'}, title:{en:'During the ride', ar:'أثناء الرحلة'}, help:['meter','overcharge','else'],
     blocks:[
      {t:'list', v:[
        {en:'Check the meter is running. Under RTA rules, if it isn’t, the ride is free.', ar:'تأكد أن العداد يعمل. وفق قواعد هيئة الطرق والمواصلات، إذا لم يكن يعمل فالرحلة مجانية.'},
        {en:'Road tolls (Salik) are added to your fare.', ar:'تُضاف رسوم الطرق (سالك) إلى أجرتك.'},
        {en:'Pay by card or cash.', ar:'ادفع بالبطاقة أو نقداً.'},
      ]},
     ]},
    {id:'address', label:{en:'Your address', ar:'عنوانك'}, title:{en:'Explaining where you’re going', ar:'شرح وجهتك'}, help:['lostdriver','else'],
     blocks:[
      {t:'p', v:{en:'Places are often known by building name or a nearby landmark rather than a street number. Have both ready, and a map pin.', ar:'غالباً تُعرف الأماكن باسم المبنى أو بمعلم قريب أكثر من رقم الشارع. جهّز الاثنين، ومعهما موقعاً على الخريطة.'}},
      {t:'phraseCard', v:{en:'Please take me to this address. Here it is on the map.', ar:'من فضلك خذني إلى هذا العنوان. هذا هو على الخريطة.'}},
     ]},
  ],
  problems:[
    {id:'meter', q:{en:'The meter isn’t on', ar:'العداد لا يعمل'}, a:{en:'Ask the driver to start it. Under RTA rules, if the meter isn’t running, the journey is free.', ar:'اطلب من السائق تشغيله. وفق قواعد هيئة الطرق والمواصلات، إذا لم يكن العداد يعمل فالرحلة مجانية.'}},
    {id:'overcharge', q:{en:'I think I was overcharged', ar:'أظن أنني دفعت أكثر من اللازم'}, a:{en:'Ask for a receipt. It shows the taxi number. Report it to RTA on 800 9090, or in the app if you booked there.', ar:'اطلب إيصالاً، فهو يُظهر رقم التاكسي. أبلغ هيئة الطرق والمواصلات على الرقم 800 9090، أو في التطبيق إذا حجزت عبره.'}},
    {id:'lostdriver', q:{en:'The driver doesn’t know where to go', ar:'السائق لا يعرف إلى أين يذهب'}, a:{en:'Show a map pin, or name a landmark nearby, such as a mall, hotel or Metro station.', ar:'اعرض موقعاً على الخريطة، أو اذكر معلماً قريباً مثل مركز تسوق أو فندق أو محطة مترو.'}, phraseText:{en:'Please take me to this address. Here it is on the map.', ar:'من فضلك خذني إلى هذا العنوان. هذا هو على الخريطة.'}},
    {id:'lostitem', q:{en:'I left something in the taxi', ar:'نسيت شيئاً في التاكسي'}, a:{en:'If you booked in an app, report it there. Otherwise call RTA on 800 9090 with the time and place of your ride. A receipt with the taxi number helps a lot.', ar:'إذا حجزت عبر تطبيق، أبلغ عبره. وإلا فاتصل بهيئة الطرق والمواصلات على الرقم 800 9090 مع وقت الرحلة ومكانها. الإيصال الذي يحمل رقم التاكسي مفيد جداً.'}},
    HELP_ELSE_RTA,
  ],
  stuck:{cards:[{title:{en:'Call RTA', ar:'اتصل بهيئة الطرق والمواصلات'}, phone:'800 9090', body:{en:'Dubai’s roads and transport authority, which licenses taxis.', ar:'هيئة الطرق والمواصلات في دبي، الجهة التي ترخّص سيارات الأجرة.'}}]},
  after:[{journey:'dubai.nol', name:{en:'Start using the Metro, tram and bus', ar:'البدء باستخدام المترو والترام والحافلات'}}],
};
DATA.journeys['dubai.taxi'].stages[0].help = ['lostitem','else'];

DATA.journeys['dubai.sim'] = {
  city:'dubai', need:'life', icon:'life',
  title:{en:'Get a UAE SIM card', ar:'احصل على شريحة هاتف إماراتية'},
  sources:[SRC.tdra], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'which', level:'source', label:{en:'Which SIM', ar:'أي شريحة'}, title:{en:'Which SIM can you get?', ar:'أي شريحة يمكنك الحصول عليها؟'}, help:['noid','else'],
     blocks:[
      {t:'list', v:[
        {en:'Every SIM in the UAE is registered to a person. You need ID to buy one.', ar:'كل شريحة في الإمارات مسجلة باسم شخص، فتحتاج إلى هوية لشرائها.'},
        {en:'No Emirates ID yet? Visitors can register a SIM with a passport. These SIMs are for a limited period.', ar:'ليست لديك هوية إماراتية بعد؟ يمكن للزوار تسجيل شريحة بجواز السفر، وتكون لفترة محدودة.'},
        {en:'Residents register SIMs with their Emirates ID.', ar:'يسجّل المقيمون الشرائح بهويتهم الإماراتية.'},
      ]},
     ]},
    {id:'buy', level:'source', label:{en:'Buy', ar:'الشراء'}, title:{en:'Buy and register it', ar:'اشترِها وسجّلها'}, help:['noid','nodata','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Go to a mobile provider’s shop, or use their app.', ar:'اذهب إلى متجر مزوّد خدمة الهاتف، أو استخدم تطبيقه.'},
        {en:'Bring your passport, or your Emirates ID if you have it.', ar:'أحضر جواز سفرك، أو هويتك الإماراتية إن كانت لديك.'},
        {en:'They register the SIM in your name. Test calls and data before you leave.', ar:'يسجّلون الشريحة باسمك. جرّب المكالمات والإنترنت قبل أن تغادر.'},
      ]},
      {t:'tip', label:'important', v:{en:'Never lend your passport or Emirates ID to someone for their SIM. Anything done with that number is linked to you.', ar:'لا تُعِر جواز سفرك أو هويتك لأحد ليشتري بها شريحة، فكل ما يتم بهذا الرقم مرتبط بك.'}},
     ]},
    {id:'check', level:'source', label:{en:'Check', ar:'التحقق'}, title:{en:'Check which numbers are in your name', ar:'تحقّق من الأرقام المسجلة باسمك'}, help:['unknown','else'],
     blocks:[
      {t:'list', v:[
        {en:'You can check with TDRA’s “My Numbers” service, your provider’s app, or at a provider branch with your Emirates ID.', ar:'يمكنك التحقق عبر خدمة «أرقامي» من هيئة تنظيم الاتصالات، أو تطبيق مزوّد الخدمة، أو في أحد فروعه بهويتك الإماراتية.'},
        {en:'Limits: residents can have up to 5 SIMs per provider; visitors up to 2.', ar:'الحد الأقصى: يمكن للمقيم امتلاك 5 شرائح لدى كل مزوّد، وللزائر شريحتين.'},
      ]},
     ]},
    {id:'switch', level:'source', label:{en:'After your ID', ar:'بعد الهوية'}, title:{en:'When your Emirates ID arrives', ar:'عندما تصلك الهوية الإماراتية'}, help:['else'],
     blocks:[
      {t:'p', v:{en:'Residents register lines with their Emirates ID. Once your card arrives, ask your provider how to move your number onto it, so you keep the same number.', ar:'يسجّل المقيمون خطوطهم بالهوية الإماراتية. عندما تصلك البطاقة، اسأل مزوّد الخدمة كيف تنقل رقمك إليها لتحتفظ بالرقم نفسه.'}},
     ]},
  ],
  problems:[
    {id:'noid', q:{en:'I don’t have my Emirates ID yet', ar:'ليست لدي هوية إماراتية بعد'}, a:{en:'Ask for a SIM you can register with your passport. It’s for a limited period, so move to your Emirates ID once it arrives.', ar:'اطلب شريحة يمكن تسجيلها بجواز السفر. تكون لفترة محدودة، فانقلها إلى هويتك الإماراتية عندما تصلك.'}},
    {id:'nodata', q:{en:'My internet isn’t working', ar:'الإنترنت لا يعمل'}, a:{en:'Restart your phone, then check that mobile data is on. If it still doesn’t work, go back to the provider’s shop so they can check the SIM.', ar:'أعد تشغيل هاتفك، ثم تأكد أن بيانات الهاتف مفعّلة. إذا لم يعمل، عُد إلى متجر المزوّد ليتحقق من الشريحة.'}},
    {id:'unknown', q:{en:'A number I don’t know is in my name', ar:'يوجد رقم لا أعرفه باسمي'}, a:{en:'Contact that provider straight away and ask them to cancel it. Then check your numbers again with TDRA’s “My Numbers” service.', ar:'تواصل مع ذلك المزوّد فوراً واطلب إلغاءه، ثم تحقّق من أرقامك مجدداً عبر خدمة «أرقامي» من هيئة تنظيم الاتصالات.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Visit your provider’s shop, or contact them through their app. They can see your account.', ar:'زُر متجر مزوّد الخدمة، أو تواصل معه عبر تطبيقه، فهو يستطيع الاطلاع على حسابك.'}},
  ],
  stuck:{cards:[{title:{en:'Ask your mobile provider', ar:'اسأل مزوّد خدمة الهاتف'}, body:{en:'Their shop or app can check your SIM and account.', ar:'يستطيع متجره أو تطبيقه التحقق من شريحتك وحسابك.'}}]},
  after:[{journey:'dubai.nol', name:{en:'Start using the Metro, tram and bus', ar:'البدء باستخدام المترو والترام والحافلات'}}],
};

DATA.journeys['dubai.uaepass'] = {
  city:'dubai', need:'docs', icon:'docs',
  title:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'},
  sources:[SRC.uaepassGov, SRC.uaepassPortal], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'what', level:'source', label:{en:'Understand', ar:'افهم'}, title:{en:'What UAE PASS is', ar:'ما هي UAE PASS'}, help:['noeid','else'],
     blocks:[
      {t:'p', v:{en:'UAE PASS is the UAE’s national digital identity. It lets you log in to government services, like DubaiNow, from your phone.', ar:'UAE PASS هي الهوية الرقمية الوطنية في الإمارات، وتتيح لك تسجيل الدخول إلى الخدمات الحكومية مثل «دبي الآن» من هاتفك.'}},
      {t:'list', v:[
        {en:'As a resident, you register with your Emirates ID.', ar:'بصفتك مقيماً، تسجّل بهويتك الإماراتية.'},
        {en:'Visitors can register with a passport instead.', ar:'يمكن للزوار التسجيل بجواز السفر بدلاً منها.'},
      ]},
      {t:'journeyLink', journey:'dubai.eid.student', v:{en:'Still waiting for your Emirates ID? Check where it is', ar:'ما زلت تنتظر هويتك الإماراتية؟ اعرف أين وصلت'}},
     ]},
    {id:'register', level:'source', label:{en:'Register', ar:'التسجيل'}, title:{en:'Create your account', ar:'أنشئ حسابك'}, help:['face','noeid','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Download the UAE PASS app from the App Store or Google Play.', ar:'حمّل تطبيق UAE PASS من App Store أو Google Play.'},
        {en:'Create an account and enter your Emirates ID details when asked.', ar:'أنشئ حساباً وأدخل بيانات هويتك الإماراتية عند الطلب.'},
        {en:'Verify your face with your phone’s camera. It usually takes under 5 minutes.', ar:'تحقّق من وجهك بكاميرا هاتفك. يستغرق ذلك عادةً أقل من 5 دقائق.'},
        {en:'Create a PIN, and keep it private.', ar:'أنشئ رمزاً سرياً (PIN) واحتفظ به لنفسك.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Face check not working? UAE PASS kiosks can verify you in person with your Emirates ID.', ar:'لا ينجح التحقق من الوجه؟ يمكن لأجهزة الخدمة الذاتية الخاصة بـ UAE PASS التحقق منك حضورياً بهويتك الإماراتية.'}},
     ]},
    {id:'use', label:{en:'Use it safely', ar:'استخدمها بأمان'}, title:{en:'Using UAE PASS safely', ar:'استخدام UAE PASS بأمان'}, help:['strange','else'],
     blocks:[
      {t:'list', v:[
        {en:'When you log in to a service, approve the request in the UAE PASS app.', ar:'عند تسجيل الدخول إلى خدمة، وافق على الطلب في تطبيق UAE PASS.'},
        {en:'Only approve requests you started yourself. Never share your PIN with anyone.', ar:'لا توافق إلا على الطلبات التي بدأتها بنفسك، ولا تشارك رمزك السري مع أحد.'},
      ]},
     ]},
  ],
  problems:[
    {id:'noeid', q:{en:'I don’t have my Emirates ID yet', ar:'ليست لدي هوية إماراتية بعد'}, a:{en:'Wait until your card arrives. You can check where your application is in Orivia’s Emirates ID journey.', ar:'انتظر حتى تصلك البطاقة. يمكنك متابعة طلبك في رحلة الهوية الإماراتية في أوريفيا.'}},
    {id:'face', q:{en:'Face verification isn’t working', ar:'التحقق من الوجه لا يعمل'}, a:{en:'Find good light, and remove glasses or anything covering your face. If it still fails, visit a UAE PASS kiosk with your Emirates ID.', ar:'ابحث عن إضاءة جيدة، وانزع النظارة أو أي شيء يغطي وجهك. إذا استمر الفشل، توجّه إلى جهاز خدمة UAE PASS ومعك هويتك الإماراتية.'}},
    {id:'strange', q:{en:'I got a login request I didn’t make', ar:'وصلني طلب تسجيل دخول لم أقم به'}, a:{en:'Reject it, and don’t share your PIN. Then call the UAE PASS help desk on 600 561 111.', ar:'ارفضه ولا تشارك رمزك السري، ثم اتصل بمكتب مساعدة UAE PASS على الرقم 600561111.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Call the UAE PASS help desk on 600 561 111.', ar:'اتصل بمكتب مساعدة UAE PASS على الرقم 600561111.'}},
  ],
  stuck:{cards:[{title:{en:'Call the UAE PASS help desk', ar:'اتصل بمكتب مساعدة UAE PASS'}, phone:'600 561 111', body:{en:'The official support line for UAE PASS.', ar:'خط الدعم الرسمي لـ UAE PASS.'}}]},
  after:[{name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}],
};

/* Wire the new journeys into the menus */
DATA.tasks['dubai.move'] = [
  {journey:'dubai.nol', name:{en:'Start using the Metro, tram and bus', ar:'البدء باستخدام المترو والترام والحافلات'}, note:{en:'Get a nol card and take your first ride', ar:'احصل على بطاقة نول واركب أول رحلة'}},
  {journey:'dubai.airport', name:{en:'Get from the airport to where you’re staying', ar:'الوصول من المطار إلى مكان إقامتك'}, note:{en:'Metro, taxi or app: which to choose and how', ar:'المترو أو التاكسي أو التطبيق: ماذا تختار وكيف'}},
  {journey:'dubai.taxi', name:{en:'Take a taxi or ride-hailing car', ar:'ركوب تاكسي أو سيارة عبر التطبيقات'}, note:{en:'Fares, apps, and what to do if something goes wrong', ar:'الأجرة والتطبيقات وماذا تفعل إذا حدثت مشكلة'}},
];
DATA.tasks['dubai.docs'] = [
  DATA.tasks['dubai.docs'][0],
  {journey:'dubai.uaepass', name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}, note:{en:'Your digital ID for government services', ar:'هويتك الرقمية للخدمات الحكومية'}},
];
DATA.tasks['dubai.life'] = [
  {journey:'dubai.sim', name:{en:'Get a UAE SIM card', ar:'احصل على شريحة هاتف إماراتية'}, note:{en:'What ID you need, even before your Emirates ID', ar:'ما الهوية التي تحتاجها، حتى قبل الهوية الإماراتية'}},
];
DATA.firstWeek.dubai = [
  {journey:'dubai.airport', name:{en:'Get from the airport', ar:'الوصول من المطار'}},
  {journey:'dubai.sim', name:{en:'Get a UAE SIM card', ar:'احصل على شريحة هاتف إماراتية'}},
  {journey:'dubai.nol', name:{en:'Learn to get around', ar:'تعلّم التنقل في المدينة'}},
  {pathway:'dubai.eid', name:{en:'Get your Emirates ID', ar:'الحصول على الهوية الإماراتية'}},
  {journey:'dubai.uaepass', name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}},
  {name:{en:'Open a bank account', ar:'فتح حساب بنكي'}},
];
DATA.journeys['dubai.eid.student'].after = [
  {journey:'dubai.uaepass', name:{en:'Set up UAE PASS', ar:'إعداد الهوية الرقمية UAE PASS'}},
  {name:{en:'Open a bank account', ar:'فتح حساب بنكي'}},
];
DATA.journeys['dubai.nol'].after = [
  {journey:'dubai.taxi', name:{en:'Take a taxi or ride-hailing car', ar:'ركوب تاكسي أو سيارة عبر التطبيقات'}},
  {pathway:'dubai.eid', name:{en:'Get your Emirates ID', ar:'الحصول على الهوية الإماراتية'}},
];

/* ---------- Healthcare for students (Dubai) ---------- */
SRC.moi = {name:{en:'Ministry of Interior: Emergency numbers', ar:'وزارة الداخلية: أرقام الطوارئ'}, url:'https://moi.gov.ae/en/about.moi/content/emergency.contact.aspx'};
SRC.uaeIns = {name:{en:'u.ae: Getting health insurance', ar:'البوابة الرسمية: الحصول على تأمين صحي'}, url:'https://u.ae/en/information-and-services/health-and-fitness/getting-a-health-insurance'};
SRC.emergencyCare = {name:{en:'Khaleej Times: Health minister on emergency care (Jan 2026)', ar:'الخليج تايمز: وزير الصحة عن الرعاية الطارئة (يناير 2026)'}, url:'https://www.khaleejtimes.com/uae/health-minister-emergency-care-insurance-approvals'};
SRC.murdoch = {name:{en:'Murdoch University Dubai: student visa', ar:'جامعة مردوخ دبي: تأشيرة الطالب'}, url:'https://www.murdochuniversitydubai.com/explore/living-dubai/student-visa-options/'};
SRC.bham = {name:{en:'University of Birmingham Dubai: student visa', ar:'جامعة برمنغهام دبي: تأشيرة الطالب'}, url:'https://www.birmingham.ac.uk/dubai/study/apply/visas/new'};

DATA.journeys['dubai.health.student'] = {
  city:'dubai', need:'health', icon:'health',
  title:{en:'See a doctor as a student', ar:'زيارة الطبيب كطالب'},
  sources:[SRC.moi, SRC.emergencyCare, SRC.uaeIns, SRC.bham, SRC.murdoch], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'emergency', level:'source', label:{en:'Emergency?', ar:'طوارئ؟'}, title:{en:'Is it an emergency?', ar:'هل هي حالة طارئة؟'}, help:['address','noins','else'],
     blocks:[
      {t:'emergency'},
      {t:'list', v:[
        {en:'These numbers work anywhere in the UAE: 998 for an ambulance, 999 for police.', ar:'تعمل هذه الأرقام في أي مكان في الإمارات: 998 للإسعاف، و999 للشرطة.'},
        {en:'Or go straight to a hospital emergency department.', ar:'أو توجّه مباشرة إلى قسم الطوارئ في أقرب مستشفى.'},
        {en:'Don’t let insurance stop you. By law, hospitals must treat emergencies right away, without waiting for insurance approval.', ar:'لا تدع التأمين يمنعك. بحكم القانون، يجب على المستشفيات علاج حالات الطوارئ فوراً دون انتظار موافقة التأمين.'},
      ]},
      {t:'phraseCard', v:{en:'This is an emergency. I need a doctor now.', ar:'هذه حالة طارئة. أحتاج إلى طبيب الآن.'}},
     ]},
    {id:'insurance', level:'source', label:{en:'Insurance', ar:'التأمين'}, title:{en:'Know your health insurance', ar:'اعرف تأمينك الصحي'}, help:['nocard','notstarted','else'],
     blocks:[
      {t:'list', v:[
        {en:'Health insurance is required to live in Dubai.', ar:'التأمين الصحي شرط للإقامة في دبي.'},
        {en:'Universities usually arrange student insurance as part of your visa.', ar:'عادةً ترتّب الجامعات التأمين الصحي للطلاب ضمن إجراءات التأشيرة.'},
        {en:'Your cover may only start once your visa is issued. Ask your university when it starts, and what to do before then.', ar:'قد لا يبدأ تأمينك إلا بعد صدور التأشيرة. اسأل جامعتك متى يبدأ، وماذا تفعل قبل ذلك.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Save your insurance card or policy number on your phone, and download your insurer’s app if it has one.', ar:'احفظ بطاقة التأمين أو رقم الوثيقة على هاتفك، وحمّل تطبيق شركة التأمين إن وُجد.'}},
     ]},
    {id:'find', label:{en:'Find a clinic', ar:'اعثر على عيادة'}, title:{en:'Find a clinic you’re covered at', ar:'اعثر على عيادة يغطيها تأمينك'}, help:['nonetwork','else'],
     blocks:[
      {t:'list', v:[
        {en:'Your insurer’s app, website or card shows which clinics and hospitals accept your plan (its “network”).', ar:'يوضح تطبيق شركة التأمين أو موقعها أو بطاقتك العيادات والمستشفيات التي تقبل خطتك («الشبكة»).'},
        {en:'Ask your university whether there’s a campus clinic or a clinic they recommend.', ar:'اسأل جامعتك إن كانت هناك عيادة في الحرم الجامعي أو عيادة توصي بها.'},
        {en:'For problems that aren’t urgent, a clinic is usually quicker than a hospital emergency department.', ar:'للمشكلات غير الطارئة، تكون العيادة عادةً أسرع من قسم الطوارئ في المستشفى.'},
      ]},
     ]},
    {id:'visit', label:{en:'At the clinic', ar:'في العيادة'}, title:{en:'At the clinic', ar:'في العيادة'}, help:['notcovered','staff','cost','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Bring your Emirates ID or passport, and your insurance card.', ar:'أحضر هويتك الإماراتية أو جواز سفرك، وبطاقة التأمين.'},
        {en:'Tell reception you have insurance and show the card.', ar:'أخبر موظف الاستقبال أن لديك تأميناً واعرض البطاقة.'},
        {en:'You may pay a small share of the cost, depending on your plan. Ask before you’re seen if you’re unsure.', ar:'قد تدفع جزءاً صغيراً من التكلفة حسب خطتك. اسأل قبل الكشف إن لم تكن متأكداً.'},
      ]},
      {t:'phraseCard', v:{en:'I’m a student. Here is my insurance card. I need to see a doctor.', ar:'أنا طالب. هذه بطاقة التأمين الخاصة بي. أحتاج إلى رؤية طبيب.'}},
     ]},
    {id:'pharmacy', label:{en:'Medicines', ar:'الأدوية'}, title:{en:'Getting medicines', ar:'الحصول على الأدوية'}, help:['rx','else'],
     blocks:[
      {t:'list', v:[
        {en:'Pharmacies are easy to find, and pharmacists can help with simple questions.', ar:'الصيدليات منتشرة، ويمكن للصيدلي المساعدة في الأسئلة البسيطة.'},
        {en:'Some medicines need a doctor’s prescription.', ar:'بعض الأدوية تحتاج إلى وصفة طبية.'},
        {en:'Ask your insurer whether prescribed medicines are covered, and at which pharmacies.', ar:'اسأل شركة التأمين إن كانت الأدوية الموصوفة مشمولة، وفي أي صيدليات.'},
      ]},
     ]},
    {id:'wellbeing', label:{en:'Wellbeing', ar:'الصحة النفسية'}, title:{en:'Looking after your mental health', ar:'الاهتمام بصحتك النفسية'}, help:['talk','else'],
     blocks:[
      {t:'p', v:{en:'Moving to a new country is hard, and feeling lonely or stressed is common. You don’t have to handle it alone.', ar:'الانتقال إلى بلد جديد أمر صعب، والشعور بالوحدة أو الضغط شائع. لست مضطراً لمواجهة ذلك وحدك.'}},
      {t:'list', v:[
        {en:'Most universities have a counselling or wellbeing service for students. Ask student services how to reach it.', ar:'لدى معظم الجامعات خدمة إرشاد نفسي أو دعم للطلاب. اسأل خدمات الطلاب عن طريقة الوصول إليها.'},
        {en:'If you’re in danger or feel you might harm yourself, call 999 or go to the nearest emergency department now.', ar:'إذا كنت في خطر أو تشعر أنك قد تؤذي نفسك، اتصل بالرقم 999 أو توجّه إلى أقرب قسم طوارئ الآن.'},
      ]},
     ]},
  ],
  problems:[
    {id:'address', q:{en:'I don’t know what address to give', ar:'لا أعرف أي عنوان أعطي'}, a:{en:'Give the building name or the nearest landmark, like a mall, hotel or Metro station. Stay on the line and follow their instructions.', ar:'اذكر اسم المبنى أو أقرب معلم، مثل مركز تسوق أو فندق أو محطة مترو. ابقَ على الخط واتبع تعليماتهم.'}},
    {id:'noins', q:{en:'My insurance isn’t active yet', ar:'تأميني لم يُفعّل بعد'}, a:{en:'In an emergency, go anyway. Hospitals must treat emergencies first. Sort out insurance afterwards with your university.', ar:'في حالة الطوارئ، اذهب على أي حال، فالمستشفيات ملزمة بعلاج الطوارئ أولاً. رتّب مسألة التأمين لاحقاً مع جامعتك.'}},
    {id:'nocard', q:{en:'I don’t have my insurance card yet', ar:'لم أستلم بطاقة التأمين بعد'}, a:{en:'Ask your university’s visa office or student services for your insurance details. They arranged it with your visa.', ar:'اطلب تفاصيل تأمينك من مكتب التأشيرات أو خدمات الطلاب في جامعتك، فهم من رتّبه مع تأشيرتك.'}},
    {id:'notstarted', q:{en:'My insurance hasn’t started yet', ar:'تأميني لم يبدأ بعد'}, a:{en:'Ask your university when it starts. Until then you may have to pay yourself, so some students buy short-term cover. In an emergency, go to hospital anyway.', ar:'اسأل جامعتك متى يبدأ. حتى ذلك الحين قد تدفع بنفسك، لذلك يشتري بعض الطلاب تأميناً قصير المدة. وفي الطوارئ، اذهب إلى المستشفى على أي حال.'}},
    {id:'nonetwork', q:{en:'I can’t find a clinic in my network', ar:'لا أجد عيادة ضمن شبكتي'}, a:{en:'Call the phone number on your insurance card. They can tell you the nearest clinic that accepts your plan.', ar:'اتصل بالرقم المكتوب على بطاقة التأمين، وسيخبرونك بأقرب عيادة تقبل خطتك.'}},
    {id:'notcovered', q:{en:'They say my insurance doesn’t cover this', ar:'يقولون إن تأميني لا يغطي هذا'}, a:{en:'Ask them to explain why, in writing if possible. Call your insurer (the number on your card) before paying. Your university’s student services can help too.', ar:'اطلب منهم توضيح السبب، كتابياً إن أمكن. اتصل بشركة التأمين (الرقم على بطاقتك) قبل الدفع. ويمكن لخدمات الطلاب في جامعتك المساعدة أيضاً.'}},
    {id:'staff', q:{en:'I don’t understand what staff said', ar:'لم أفهم ما قاله الموظفون'}, a:{en:'Show them this card. It asks them to slow down or write it down.', ar:'اعرض عليهم هذه البطاقة، فهي تطلب منهم التحدث ببطء أو الكتابة.'}, phraseText:{en:'I’m a new student. Could you please say that more slowly, or write it down?', ar:'أنا طالب جديد. هل يمكنك أن تقول ذلك ببطء أكثر، أو تكتبه لي من فضلك؟'}},
    {id:'cost', q:{en:'I’m worried about the cost', ar:'أنا قلق من التكلفة'}, a:{en:'Ask the clinic for the price before you’re seen, and tell your university’s student services. For emergencies, go anyway.', ar:'اسأل العيادة عن السعر قبل الكشف، وأخبر خدمات الطلاب في جامعتك. وفي الطوارئ، اذهب على أي حال.'}},
    {id:'rx', q:{en:'They say I need a prescription', ar:'يقولون إنني أحتاج إلى وصفة طبية'}, a:{en:'See a doctor at a clinic in your network. They can prescribe the medicine if you need it.', ar:'راجع طبيباً في عيادة ضمن شبكتك، ويمكنه وصف الدواء إن احتجت إليه.'}},
    {id:'talk', q:{en:'I need to talk to someone', ar:'أحتاج إلى التحدث مع أحد'}, a:{en:'Contact your university’s counselling or wellbeing service. If you’re in danger, call 999 or go to the nearest emergency department now.', ar:'تواصل مع خدمة الإرشاد النفسي أو دعم الطلاب في جامعتك. وإذا كنت في خطر، اتصل بالرقم 999 أو توجّه إلى أقرب قسم طوارئ الآن.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Ask your university’s student services, or call the number on your insurance card. In an emergency, call 998.', ar:'اسأل خدمات الطلاب في جامعتك، أو اتصل بالرقم المكتوب على بطاقة التأمين. وفي الطوارئ، اتصل بالرقم 998.'}},
  ],
  stuck:{cards:[
    {title:{en:'Emergency: ambulance', ar:'طوارئ: الإسعاف'}, phone:'998', body:{en:'Anywhere in the UAE. Police: 999.', ar:'في أي مكان في الإمارات. الشرطة: 999.'}},
    {title:{en:'Your university’s student services', ar:'خدمات الطلاب في جامعتك'}, body:{en:'They can help with insurance, clinics and counselling.', ar:'يمكنهم المساعدة في التأمين والعيادات والإرشاد النفسي.'}},
    {title:{en:'Your insurer', ar:'شركة التأمين'}, body:{en:'Call the number on your insurance card.', ar:'اتصل بالرقم المكتوب على بطاقة التأمين.'}},
  ]},
  after:[{pathway:'dubai.eid', name:{en:'Get your Emirates ID', ar:'الحصول على الهوية الإماراتية'}}],
};
DATA.tasks['dubai.health'] = [
  {journey:'dubai.health.student', name:{en:'See a doctor as a student', ar:'زيارة الطبيب كطالب'}, note:{en:'Emergencies, insurance, clinics and medicines', ar:'الطوارئ والتأمين والعيادات والأدوية'}},
];

/* ---------- Health insurance: who arranges it, by pathway (Dubai) ---------- */
SRC.law11 = {name:{en:'Dubai Law No. 11 of 2013 on Health Insurance', ar:'قانون دبي رقم 11 لسنة 2013 بشأن الضمان الصحي'}, url:'https://dlp.dubai.gov.ae/Legislation%20Reference/2013/Law%20No.%20(11)%20of%202013.pdf'};
SRC.isahd = {name:{en:'ISAHD (Dubai Health Insurance): FAQ', ar:'إسعاد (الضمان الصحي في دبي): الأسئلة الشائعة'}, url:'https://www.isahd.ae/Home/FAQ'};
SRC.siu = {name:{en:'SIU Dubai: visa', ar:'جامعة سيمبيوسيس دبي: التأشيرة'}, url:'https://siu-dubai.ac.ae/visa'};

const INS_CHECK = {id:'check', level:'source', label:{en:'Check', ar:'تحقّق'}, title:{en:'Check you’re covered', ar:'تحقّق من أنك مؤمَّن'}, help:['nocard','network','else'],
  blocks:[
    {t:'list', v:[
      {en:'Once you’re enrolled, you should receive an insurance card.', ar:'بعد تسجيلك في التأمين، يُفترض أن تستلم بطاقة تأمين.'},
      {en:'Your insurer can confirm what you’re covered for and which clinics accept your plan.', ar:'يمكن لشركة التأمين تأكيد ما يغطيه تأمينك والعيادات التي تقبل خطتك.'},
    ]},
    {t:'tip', label:'tip', v:{en:'Save a photo of your card and the insurer’s phone number on your phone.', ar:'احفظ صورة بطاقتك ورقم هاتف شركة التأمين على هاتفك.'}},
    {t:'journeyLink', journey:'dubai.health.student', v:{en:'Need to see a doctor? Here’s how', ar:'تحتاج إلى زيارة طبيب؟ إليك الطريقة'}},
  ]};
const INS_COMMON_PROBLEMS = [
  {id:'nocard', q:{en:'I don’t have an insurance card', ar:'ليست لدي بطاقة تأمين'}, a:{en:'Ask whoever arranged your insurance (your university, HR or your sponsor) for your card or policy number. If you’re still not sure you’re covered, ask them to confirm in writing.', ar:'اطلب البطاقة أو رقم الوثيقة ممن رتّب تأمينك (جامعتك أو الموارد البشرية أو كفيلك). وإذا لم تكن متأكداً من تغطيتك، اطلب منهم تأكيداً كتابياً.'}},
  {id:'network', q:{en:'I don’t know which clinics I can use', ar:'لا أعرف أي العيادات يمكنني استخدامها'}, a:{en:'Call the number on your insurance card, or check the insurer’s app. They list the clinics and hospitals in your network.', ar:'اتصل بالرقم المكتوب على بطاقة التأمين، أو تحقّق من تطبيق شركة التأمين، فهما يعرضان العيادات والمستشفيات ضمن شبكتك.'}},
  {id:'emergency', q:{en:'It’s an emergency and I’m not sure I’m insured', ar:'إنها حالة طارئة ولست متأكداً من تأميني'}, a:{en:'Call 998 or go to the nearest emergency department now. Hospitals must treat emergencies first. Sort out insurance afterwards.', ar:'اتصل بالرقم 998 أو توجّه إلى أقرب قسم طوارئ الآن، فالمستشفيات ملزمة بعلاج الطوارئ أولاً. رتّب مسألة التأمين لاحقاً.'}},
  {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Start with whoever arranged your insurance, then your insurer. You can also raise a complaint with Dubai’s health insurance regulator through its iPromes platform.', ar:'ابدأ بمن رتّب تأمينك، ثم شركة التأمين. ويمكنك أيضاً تقديم شكوى إلى جهة تنظيم التأمين الصحي في دبي عبر منصة iPromes.'}},
];
const INS_STUCK = {cards:[
  {title:{en:'Emergency: ambulance', ar:'طوارئ: الإسعاف'}, phone:'998', body:{en:'Anywhere in the UAE. Hospitals must treat emergencies first.', ar:'في أي مكان في الإمارات. المستشفيات ملزمة بعلاج الطوارئ أولاً.'}},
  {title:{en:'Your insurer', ar:'شركة التأمين'}, body:{en:'Call the number on your insurance card.', ar:'اتصل بالرقم المكتوب على بطاقة التأمين.'}},
  {title:{en:'Dubai’s health insurance regulator', ar:'جهة تنظيم التأمين الصحي في دبي'}, body:{en:'You can file a complaint through the iPromes platform.', ar:'يمكنك تقديم شكوى عبر منصة iPromes.'}},
]};
const insJourney = (o) => Object.assign({city:'dubai', need:'health', icon:'health', checked:CHECKED, trust:{reviewed:false, tested:0}, stuck:INS_STUCK, pathway:'dubai.ins'}, o);

DATA.journeys['dubai.ins.student'] = insJourney({
  title:{en:'Health insurance as a student', ar:'التأمين الصحي للطلاب'},
  sources:[SRC.law11, SRC.isahd, SRC.bham, SRC.murdoch, SRC.siu],
  stages:[
    {id:'who', level:'source', label:{en:'Who arranges it', ar:'من يرتّبه'}, title:{en:'Your university arranges it', ar:'جامعتك ترتّبه'}, help:['double','cost','else'],
     blocks:[
      {t:'list', v:[
        {en:'In Dubai, whoever sponsors your visa is responsible for your health insurance. For most international students, that’s the university.', ar:'في دبي، كفيل تأشيرتك مسؤول عن تأمينك الصحي، وهو الجامعة بالنسبة لمعظم الطلاب الدوليين.'},
        {en:'Universities usually arrange it as part of your visa. Some include the cost in their visa fees, so check your fee breakdown.', ar:'عادةً ترتّبه الجامعات ضمن إجراءات التأشيرة، وبعضها يضيف تكلفته إلى رسوم التأشيرة، فراجع تفاصيل الرسوم.'},
        {en:'Don’t buy a second residence plan without asking your university first. You may already be covered.', ar:'لا تشترِ خطة إقامة ثانية قبل أن تسأل جامعتك، فقد تكون مؤمَّناً بالفعل.'},
      ]},
     ]},
    {id:'gap', level:'source', label:{en:'Before your visa', ar:'قبل التأشيرة'}, title:{en:'Before your visa is issued', ar:'قبل صدور تأشيرتك'}, help:['notstarted','emergency','else'],
     blocks:[
      {t:'list', v:[
        {en:'Your student cover may only start once your visa is issued. Ask your university for the start date.', ar:'قد لا يبدأ تأمينك كطالب إلا بعد صدور التأشيرة. اسأل جامعتك عن تاريخ البدء.'},
        {en:'Until then, some students buy short-term travel medical insurance.', ar:'حتى ذلك الحين، يشتري بعض الطلاب تأميناً طبياً قصير المدة للسفر.'},
        {en:'In an emergency, go to hospital anyway. Hospitals must treat emergencies first.', ar:'في الطوارئ، اذهب إلى المستشفى على أي حال، فالمستشفيات ملزمة بعلاج الطوارئ أولاً.'},
      ]},
     ]},
    INS_CHECK,
  ],
  problems:[
    {id:'double', q:{en:'Should I buy my own insurance?', ar:'هل يجب أن أشتري تأميناً بنفسي؟'}, a:{en:'Ask your university first. They usually arrange it with your visa. Short-term travel cover can make sense before your visa is issued.', ar:'اسأل جامعتك أولاً، فهي عادةً ترتّبه مع تأشيرتك. وقد يكون التأمين قصير المدة للسفر مفيداً قبل صدور التأشيرة.'}},
    {id:'cost', q:{en:'I don’t understand what I paid for', ar:'لا أفهم ما الذي دفعت مقابله'}, a:{en:'Ask your university’s visa office for a breakdown of your visa fees. It should show whether insurance is included.', ar:'اطلب من مكتب التأشيرات في جامعتك تفصيلاً لرسوم التأشيرة، ويُفترض أن يوضح إن كان التأمين مشمولاً.'}},
    {id:'notstarted', q:{en:'My insurance hasn’t started yet', ar:'تأميني لم يبدأ بعد'}, a:{en:'Ask your university when it starts. Until then you may have to pay yourself, so some students buy short-term cover. In an emergency, go to hospital anyway.', ar:'اسأل جامعتك متى يبدأ. حتى ذلك الحين قد تدفع بنفسك، لذلك يشتري بعض الطلاب تأميناً قصير المدة. وفي الطوارئ، اذهب إلى المستشفى على أي حال.'}},
  ].concat(INS_COMMON_PROBLEMS),
  after:[{journey:'dubai.health.student', name:{en:'See a doctor as a student', ar:'زيارة الطبيب كطالب'}}],
});

DATA.journeys['dubai.ins.employee'] = insJourney({
  title:{en:'Health insurance through your job', ar:'التأمين الصحي عبر عملك'},
  sources:[SRC.law11, SRC.isahd, SRC.uaeIns],
  stages:[
    {id:'who', level:'source', label:{en:'Who pays', ar:'من يدفع'}, title:{en:'Your employer must provide it', ar:'جهة عملك ملزمة بتوفيره'}, help:['nocover','pay','family','else'],
     blocks:[
      {t:'list', v:[
        {en:'By Dubai law, your employer must enrol you in health insurance and pay for it.', ar:'بموجب قانون دبي، يجب على جهة عملك تسجيلك في التأمين الصحي ودفع تكلفته.'},
        {en:'They must not charge the cost to you.', ar:'ولا يجوز لها تحميلك هذه التكلفة.'},
        {en:'Your cover must be at least Dubai’s basic plan, the Essential Benefits Plan.', ar:'يجب ألا يقل تأمينك عن الخطة الأساسية في دبي، «خطة المنافع الأساسية».'},
      ]},
     ]},
    Object.assign({}, INS_CHECK, {help:['nocard','network','nocover','else']}),
    {id:'family', level:'source', label:{en:'Your family', ar:'عائلتك'}, title:{en:'If your family lives with you', ar:'إذا كانت عائلتك تعيش معك'}, help:['family','else'],
     blocks:[
      {t:'p', v:{en:'If you sponsor your spouse or children, you must arrange and pay for their insurance, unless your employer covers them too. Ask HR whether family cover is included.', ar:'إذا كنت تكفل زوجك أو أطفالك، فعليك ترتيب تأمينهم ودفع تكلفته، ما لم تغطّهم جهة عملك أيضاً. اسأل الموارد البشرية إن كان تأمين العائلة مشمولاً.'}},
     ]},
  ],
  problems:[
    {id:'nocover', q:{en:'My employer hasn’t given me insurance', ar:'جهة عملي لم توفر لي تأميناً'}, a:{en:'Ask HR, or your company’s PRO, in writing when you’ll be enrolled. If nothing happens, you can complain to Dubai’s health insurance regulator through its iPromes platform.', ar:'اسأل الموارد البشرية أو مندوب العلاقات العامة في شركتك كتابياً عن موعد تسجيلك. وإذا لم يحدث شيء، يمكنك تقديم شكوى إلى جهة تنظيم التأمين الصحي في دبي عبر منصة iPromes.'}},
    {id:'pay', q:{en:'My employer wants me to pay for it', ar:'جهة عملي تريد أن أدفع تكلفته'}, a:{en:'Under Dubai’s health insurance law (Law No. 11 of 2013, Article 10), employers must bear the cost and must not charge it to employees. Raise it with HR, and complain through iPromes if needed.', ar:'بموجب قانون الضمان الصحي في دبي (القانون رقم 11 لسنة 2013، المادة 10)، يتحمّل صاحب العمل التكلفة ولا يجوز له تحميلها للموظفين. ناقش الأمر مع الموارد البشرية، وقدّم شكوى عبر iPromes إن لزم.'}},
    {id:'family', q:{en:'What about my family?', ar:'ماذا عن عائلتي؟'}, a:{en:'If you sponsor them, insuring them is your responsibility, unless your employer’s plan includes them. Ask HR first.', ar:'إذا كنت تكفلهم، فتأمينهم مسؤوليتك، ما لم تشملهم خطة جهة عملك. اسأل الموارد البشرية أولاً.'}},
  ].concat(INS_COMMON_PROBLEMS),
  after:[{journey:'dubai.health.student', name:{en:'See a doctor', ar:'زيارة الطبيب'}}],
});

DATA.journeys['dubai.ins.family'] = insJourney({
  title:{en:'Health insurance through your family', ar:'التأمين الصحي عبر عائلتك'},
  sources:[SRC.law11, SRC.isahd, SRC.uaeIns],
  stages:[
    {id:'who', level:'source', label:{en:'Who pays', ar:'من يدفع'}, title:{en:'Your sponsor arranges it', ar:'كفيلك يرتّبه'}, help:['nocover','else'],
     blocks:[
      {t:'list', v:[
        {en:'By Dubai law, the family member who sponsors your visa must enrol you in health insurance and pay for it.', ar:'بموجب قانون دبي، يجب على فرد العائلة الذي يكفل تأشيرتك تسجيلك في التأمين الصحي ودفع تكلفته.'},
        {en:'Sometimes their employer covers the family too. Ask your sponsor which applies to you.', ar:'أحياناً تغطي جهة عمله العائلة أيضاً. اسأل كفيلك أيهما ينطبق عليك.'},
      ]},
     ]},
    INS_CHECK,
  ],
  problems:[
    {id:'nocover', q:{en:'I don’t think I’m insured', ar:'لا أظن أنني مؤمَّن'}, a:{en:'Ask your sponsor to check with their HR or insurer. Insurance is required for your residence visa, so it’s worth sorting out quickly.', ar:'اطلب من كفيلك التحقق مع الموارد البشرية لديه أو شركة التأمين. التأمين شرط لتأشيرة إقامتك، فمن الأفضل حل الأمر سريعاً.'}},
  ].concat(INS_COMMON_PROBLEMS),
  after:[{journey:'dubai.health.student', name:{en:'See a doctor', ar:'زيارة الطبيب'}}],
});

DATA.journeys['dubai.ins.self'] = insJourney({
  title:{en:'Buying your own health insurance', ar:'شراء تأمينك الصحي بنفسك'},
  sources:[SRC.law11, SRC.isahd],
  stages:[
    {id:'who', level:'source', label:{en:'Who pays', ar:'من يدفع'}, title:{en:'You arrange your own', ar:'أنت ترتّب تأمينك'}, help:['else'],
     blocks:[
      {t:'p', v:{en:'In Dubai, whoever sponsors a visa is responsible for that person’s health insurance. If you sponsor yourself, for example on a Golden Visa or as a freelancer, that’s you.', ar:'في دبي، كفيل التأشيرة مسؤول عن التأمين الصحي لمن يكفله. فإذا كنت تكفل نفسك، مثلاً بالإقامة الذهبية أو كعامل مستقل، فالمسؤولية عليك.'}},
     ]},
    {id:'choose', label:{en:'Choose a plan', ar:'اختر خطة'}, title:{en:'Choosing a plan', ar:'اختيار خطة'}, help:['unsureplan','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Compare plans from insurers authorised in Dubai. A licensed insurance broker can do this for you.', ar:'قارن الخطط لدى شركات التأمين المرخّصة في دبي، ويمكن لوسيط تأمين مرخّص القيام بذلك عنك.'},
        {en:'Check the plan is accepted for a Dubai residence visa, and at least meets Dubai’s basic plan (the Essential Benefits Plan).', ar:'تأكد أن الخطة مقبولة لتأشيرة الإقامة في دبي، وأنها لا تقل عن الخطة الأساسية («خطة المنافع الأساسية»).'},
        {en:'Check its network includes clinics near where you live or work.', ar:'تأكد أن شبكتها تشمل عيادات قريبة من سكنك أو عملك.'},
      ]},
     ]},
    INS_CHECK,
  ],
  problems:[
    {id:'unsureplan', q:{en:'I don’t know which plan is enough', ar:'لا أعرف أي خطة تكفي'}, a:{en:'Ask the insurer or broker to confirm in writing that the plan is valid for a Dubai residence visa.', ar:'اطلب من شركة التأمين أو الوسيط تأكيداً كتابياً بأن الخطة صالحة لتأشيرة الإقامة في دبي.'}},
  ].concat(INS_COMMON_PROBLEMS),
  after:[{journey:'dubai.health.student', name:{en:'See a doctor', ar:'زيارة الطبيب'}}],
});

DATA.journeys['dubai.ins.visitor'] = insJourney({
  title:{en:'Health cover while visiting', ar:'التغطية الصحية أثناء الزيارة'},
  sources:[SRC.law11, SRC.moi],
  stages:[
    {id:'what', level:'source', label:{en:'Visitors', ar:'الزوار'}, title:{en:'What visitors need to know', ar:'ما يحتاج الزوار إلى معرفته'}, help:['emergency','else'],
     blocks:[
      {t:'emergency'},
      {t:'list', v:[
        {en:'Visitors aren’t enrolled in a resident health plan.', ar:'لا يُسجَّل الزوار في خطط التأمين الصحي للمقيمين.'},
        {en:'Dubai’s health insurance law covers emergency care for visitors.', ar:'يشمل قانون الضمان الصحي في دبي الرعاية الطارئة للزوار.'},
        {en:'For anything else, like a clinic visit or medicines, you may have to pay. Travel medical insurance helps with that.', ar:'لأي شيء آخر، مثل زيارة عيادة أو الأدوية، قد تدفع بنفسك، والتأمين الطبي للسفر يساعد في ذلك.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Moving here for study or work? Your visa sponsor will arrange resident cover. Go back and choose that option.', ar:'قادم للدراسة أو العمل؟ سيرتّب كفيل تأشيرتك تأمين الإقامة. عُد واختر ذلك الخيار.'}},
     ]},
  ],
  problems:INS_COMMON_PROBLEMS,
  after:[{journey:'dubai.health.student', name:{en:'See a doctor', ar:'زيارة الطبيب'}}],
});

DATA.pathways['dubai.ins'] = {
  icon:'health',
  title:{en:'Who arranges your health insurance?', ar:'من يرتّب تأمينك الصحي؟'},
  sub:{en:'In Dubai it depends on who sponsors your visa. Pick the closest one.', ar:'في دبي يعتمد ذلك على كفيل تأشيرتك. اختر الأقرب.'},
  options:[
    {name:{en:'I’m a student (my university sponsors my visa)', ar:'أنا طالب (جامعتي تكفل تأشيرتي)'}, journey:'dubai.ins.student'},
    {name:{en:'I work here (my employer sponsors my visa)', ar:'أعمل هنا (جهة عملي تكفل تأشيرتي)'}, journey:'dubai.ins.employee'},
    {name:{en:'A family member sponsors my visa', ar:'أحد أفراد عائلتي يكفل تأشيرتي'}, journey:'dubai.ins.family'},
    {name:{en:'I sponsor myself', ar:'أكفل نفسي'}, journey:'dubai.ins.self'},
    {name:{en:'I’m visiting', ar:'أنا زائر'}, journey:'dubai.ins.visitor'},
  ],
  dontKnow:{
    title:{en:'That’s OK. Here’s how to tell.', ar:'لا بأس. إليك كيف تعرف.'},
    items:[
      {en:'Your visa sponsor is whoever applied for your residence visa: usually your university, your employer, or a family member.', ar:'كفيل تأشيرتك هو من تقدّم بطلب تأشيرة إقامتك: عادةً جامعتك أو جهة عملك أو أحد أفراد عائلتك.'},
      {en:'In Dubai, that sponsor is responsible for your health insurance.', ar:'وفي دبي، يكون هذا الكفيل مسؤولاً عن تأمينك الصحي.'},
      {en:'On a visit visa, you’re a visitor.', ar:'إذا كانت لديك تأشيرة زيارة، فأنت زائر.'},
    ],
    tip:{en:'Don’t buy a residence plan yourself until you know. Your sponsor may already have one for you.', ar:'لا تشترِ خطة إقامة بنفسك قبل أن تتأكد، فقد يكون كفيلك قد رتّب واحدة لك.'}
  }
};
DATA.tasks['dubai.health'].push({pathway:'dubai.ins', name:{en:'Get or check your health insurance', ar:'احصل على تأمينك الصحي أو تحقّق منه'}, note:{en:'Who arranges it depends on your visa', ar:'من يرتّبه يعتمد على تأشيرتك'}});
DATA.journeys['dubai.health.student'].stages[1].blocks.push({t:'journeyLink', journey:'dubai.ins.student', v:{en:'More on student insurance and cover before your visa', ar:'المزيد عن تأمين الطلاب والتغطية قبل التأشيرة'}});

/* ---------- Money & banking: open a bank account (Dubai) ---------- */
SRC.adcbTips = {name:{en:'ADCB: Account opening tips for expatriates', ar:'بنك أبوظبي التجاري: نصائح فتح الحساب للوافدين'}, url:'https://www.adcb.com/en/consumer-education-awareness/money-guide-expatriates-uae/current-account-opening-tips'};
SRC.adcbStudent = {name:{en:'ADCB: University Student Account terms', ar:'بنك أبوظبي التجاري: شروط حساب طلاب الجامعات'}, url:'https://www.adcb.com/Images/University-Student-TnCs-English-V1_tcm9-85805.pdf'};
SRC.fabFraud = {name:{en:'FAB: Fraud and security', ar:'بنك أبوظبي الأول: الاحتيال والأمان'}, url:'https://www.bankfab.com/en-ae/personal/help-and-support/fraud-and-security'};
SRC.sanadak = {name:{en:'Sanadak: Make a complaint', ar:'سندك: تقديم شكوى'}, url:'https://www.sanadak.gov.ae/en/make-a-complaint/'};

DATA.journeys['dubai.bank'] = {
  city:'dubai', need:'money', icon:'money',
  title:{en:'Open a bank account', ar:'فتح حساب بنكي'},
  sources:[SRC.adcbTips, SRC.adcbStudent, SRC.fabFraud, SRC.sanadak], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'when', level:'source', label:{en:'When', ar:'متى'}, title:{en:'When you can open one', ar:'متى يمكنك فتح حساب'}, help:['noeid','else'],
     blocks:[
      {t:'list', v:[
        {en:'Most banks ask residents for an Emirates ID, as well as a passport.', ar:'تطلب معظم البنوك من المقيمين الهوية الإماراتية إلى جانب جواز السفر.'},
        {en:'Student accounts are usually for UAE residents, so most students open one once their residence visa and Emirates ID are ready.', ar:'حسابات الطلاب مخصصة عادةً للمقيمين في الإمارات، لذلك يفتح معظم الطلاب حساباتهم بعد جاهزية تأشيرة الإقامة والهوية الإماراتية.'},
      ]},
      {t:'journeyLink', journey:'dubai.eid.student', v:{en:'Check where your Emirates ID is', ar:'اعرف أين وصلت هويتك الإماراتية'}},
     ]},
    {id:'choose', level:'source', label:{en:'Choose', ar:'اختر'}, title:{en:'Choose an account', ar:'اختر حساباً'}, help:['nosalary','fees','else'],
     blocks:[
      {t:'list', v:[
        {en:'Regular current accounts often ask for proof of salary, and some banks have a minimum salary, for example AED 3,000.', ar:'غالباً تطلب الحسابات الجارية العادية إثبات راتب، وبعض البنوك تشترط حداً أدنى للراتب، مثلاً 3,000 درهم.'},
        {en:'Many banks offer student accounts instead. Some still need a minimum balance: ADCB’s student account, for example, asks for AED 1,500.', ar:'تقدّم بنوك كثيرة حسابات للطلاب بدلاً من ذلك، وبعضها يشترط حداً أدنى للرصيد: حساب الطلاب في بنك أبوظبي التجاري مثلاً يشترط 1,500 درهم.'},
        {en:'Before you sign, read the bank’s schedule of fees, especially charges for falling below the minimum balance.', ar:'قبل التوقيع، اقرأ جدول رسوم البنك، خاصة الرسوم عند انخفاض الرصيد عن الحد الأدنى.'},
      ]},
     ]},
    {id:'open', level:'source', label:{en:'Open it', ar:'افتح الحساب'}, title:{en:'Open your account', ar:'افتح حسابك'}, help:['noaddress','noeid','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Apply in the bank’s app or at a branch.', ar:'قدّم طلبك عبر تطبيق البنك أو في أحد فروعه.'},
        {en:'Bring your passport, Emirates ID and proof of address, such as a tenancy contract or a utility bill.', ar:'أحضر جواز سفرك وهويتك الإماراتية وإثبات العنوان، مثل عقد الإيجار أو فاتورة خدمات.'},
        {en:'For a student account, bring proof you’re enrolled, like a letter from your university showing your start and end dates.', ar:'لحساب الطلاب، أحضر إثبات تسجيلك، مثل خطاب من جامعتك يوضح تاريخ البدء والتخرج المتوقع.'},
        {en:'Collect your debit card and set up the bank’s app.', ar:'استلم بطاقة الخصم وفعّل تطبيق البنك.'},
      ]},
      {t:'phraseCard', v:{en:'I’m a student. I’d like to open a student account. Which documents do you need?', ar:'أنا طالب. أريد فتح حساب طلاب. ما المستندات التي تحتاجونها؟'}},
     ]},
    {id:'safe', level:'source', label:{en:'Stay safe', ar:'ابقَ آمناً'}, title:{en:'Keep your money safe', ar:'حافظ على أموالك'}, help:['scam','else'],
     blocks:[
      {t:'list', v:[
        {en:'Never share your PIN, one-time code (OTP), card security code (CVV) or card details with anyone.', ar:'لا تشارك رقمك السري أو رمز التحقق لمرة واحدة (OTP) أو رمز أمان البطاقة (CVV) أو بيانات بطاقتك مع أي أحد.'},
        {en:'The police and the Central Bank will never ask for your card details or codes, or ask you to add a payment recipient on a video call.', ar:'لن تطلب منك الشرطة أو المصرف المركزي أبداً بيانات بطاقتك أو رموزها، ولن يطلبوا منك إضافة مستفيد عبر مكالمة فيديو.'},
      ]},
      {t:'tip', label:'important', v:{en:'Think it’s a scam? Hang up and call your bank on the number on the back of your card.', ar:'تظن أنها عملية احتيال؟ أغلق الخط واتصل ببنكك على الرقم المكتوب خلف بطاقتك.'}},
     ]},
    {id:'complain', level:'source', label:{en:'Problems', ar:'المشكلات'}, title:{en:'If the bank doesn’t fix a problem', ar:'إذا لم يحل البنك مشكلتك'}, help:['complaint','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Make a formal complaint to your bank, and keep the reference number.', ar:'قدّم شكوى رسمية إلى بنكك واحتفظ برقمها المرجعي.'},
        {en:'If it isn’t sorted after 15 days, complain for free to Sanadak, the UAE’s independent financial ombudsman, on its website, app or 800 72 623 25.', ar:'إذا لم تُحل بعد 15 يوماً، قدّم شكوى مجانية إلى «سندك»، الجهة المستقلة لتسوية شكاوى القطاع المالي، عبر موقعها أو تطبيقها أو الرقم 800 72 623 25.'},
      ]},
     ]},
  ],
  problems:[
    {id:'noeid', q:{en:'I don’t have my Emirates ID yet', ar:'ليست لدي هوية إماراتية بعد'}, a:{en:'Most banks need it. Ask the bank what they accept while your card is being made, or wait until it arrives. You can check where it is in Orivia’s Emirates ID journey.', ar:'تحتاجها معظم البنوك. اسأل البنك عما يقبله أثناء إصدار بطاقتك، أو انتظر حتى تصلك. يمكنك متابعتها في رحلة الهوية الإماراتية في أوريفيا.'}},
    {id:'nosalary', q:{en:'They want proof of salary, but I’m a student', ar:'يطلبون إثبات راتب وأنا طالب'}, a:{en:'Ask for a student account instead, and bring a letter from your university confirming you’re enrolled.', ar:'اطلب حساب طلاب بدلاً من ذلك، وأحضر خطاباً من جامعتك يؤكد تسجيلك.'}},
    {id:'noaddress', q:{en:'I don’t have a tenancy contract', ar:'ليس لدي عقد إيجار'}, a:{en:'If you live in university housing, ask your university for a letter confirming your address. Then ask the bank whether they accept it.', ar:'إذا كنت تسكن في سكن جامعي، اطلب من جامعتك خطاباً يؤكد عنوانك، ثم اسأل البنك إن كان يقبله.'}},
    {id:'fees', q:{en:'I’m being charged fees I didn’t expect', ar:'تُخصم مني رسوم لم أتوقعها'}, a:{en:'Check your minimum balance first. Banks often charge when you fall below it. Ask the bank to explain each charge, and complain formally if it’s wrong.', ar:'تحقّق أولاً من الحد الأدنى للرصيد، فالبنوك غالباً تفرض رسوماً عند انخفاضه. اطلب من البنك شرح كل رسم، وقدّم شكوى رسمية إن كان خاطئاً.'}},
    {id:'staff', q:{en:'I don’t understand what staff said', ar:'لم أفهم ما قاله الموظفون'}, a:{en:'Show them this card. It asks them to slow down or write it down.', ar:'اعرض عليهم هذه البطاقة، فهي تطلب منهم التحدث ببطء أو الكتابة.'}, phraseText:{en:'I’m new here. Could you please say that more slowly, or write it down?', ar:'أنا جديد هنا. هل يمكنك أن تقول ذلك ببطء أكثر، أو تكتبه لي من فضلك؟'}},
    {id:'scam', q:{en:'Someone asked for my card details or a code', ar:'طلب أحدهم بيانات بطاقتي أو رمزاً'}, a:{en:'Don’t share anything. Hang up, then call your bank on the number on the back of your card. If you’ve already shared something, call straight away so they can block your card.', ar:'لا تشارك أي شيء. أغلق الخط، ثم اتصل ببنكك على الرقم المكتوب خلف بطاقتك. وإذا كنت قد شاركت شيئاً بالفعل، اتصل فوراً ليوقفوا بطاقتك.'}},
    {id:'complaint', q:{en:'The bank won’t fix my problem', ar:'البنك لا يحل مشكلتي'}, a:{en:'Make a formal complaint to the bank and keep the reference number. If it isn’t resolved after 15 days, complain for free to Sanadak on 800 72 623 25 or through its website or app.', ar:'قدّم شكوى رسمية إلى البنك واحتفظ برقمها المرجعي. وإذا لم تُحل بعد 15 يوماً، قدّم شكوى مجانية إلى «سندك» على الرقم 800 72 623 25 أو عبر موقعها أو تطبيقها.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Contact your bank through its app, a branch, or the number on your card. For a complaint the bank hasn’t solved, you can go to Sanadak.', ar:'تواصل مع بنكك عبر تطبيقه أو أحد فروعه أو الرقم المكتوب على بطاقتك. وللشكاوى التي لم يحلها البنك، يمكنك التوجه إلى «سندك».'}},
  ],
  stuck:{cards:[
    {title:{en:'Your bank', ar:'بنكك'}, body:{en:'Call the number on the back of your card, or use the bank’s app.', ar:'اتصل بالرقم المكتوب خلف بطاقتك، أو استخدم تطبيق البنك.'}},
    {title:{en:'Sanadak (financial ombudsman)', ar:'سندك (تسوية الشكاوى المالية)'}, phone:'800 72 623 25', body:{en:'Free. For complaints your bank hasn’t solved within 15 days.', ar:'مجانية. للشكاوى التي لم يحلها بنكك خلال 15 يوماً.'}},
  ]},
  after:[{journey:'dubai.nol', name:{en:'Start using the Metro, tram and bus', ar:'البدء باستخدام المترو والترام والحافلات'}}],
};
DATA.tasks['dubai.money'] = [
  {journey:'dubai.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}, note:{en:'When you can, what to bring, and staying safe', ar:'متى يمكنك، وماذا تحضر، وكيف تبقى آمناً'}},
];
DATA.firstWeek.dubai[5] = {journey:'dubai.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}};
DATA.journeys['dubai.eid.student'].after[1] = {journey:'dubai.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}};
DATA.journeys['dubai.uaepass'].after = [{journey:'dubai.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}];

/* ---------- Housing: renting a home (Dubai) ---------- */
SRC.law26 = {name:{en:'Dubai Law No. 26 of 2007 (landlords and tenants)', ar:'قانون دبي رقم 26 لسنة 2007 (المؤجرين والمستأجرين)'}, url:'https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(26)%20of%202007.html'};
SRC.ejari = {name:{en:'Dubai Land Department: Register a tenancy contract (Ejari)', ar:'دائرة الأراضي والأملاك: تسجيل عقد الإيجار (إيجاري)'}, url:'https://dubailand.gov.ae/en/eservices/register-renew-ejari-contract/'};
SRC.dldVerify = {name:{en:'Dubai Land Department: Verify licences and permits', ar:'دائرة الأراضي والأملاك: التحقق من التراخيص والتصاريح'}, url:'https://dubailand.gov.ae/en/eservices/validate-real-estate-licenses-and-permits/'};
SRC.rentIndex = {name:{en:'Dubai Land Department: Smart Rent Index', ar:'دائرة الأراضي والأملاك: مؤشر الإيجارات الذكي'}, url:'https://dubailand.gov.ae/en/news-media/the-smart-rent-index-mitigates-inflation-in-dubai-and-enhances-market-transparency/'};
SRC.rdc = {name:{en:'Rental Disputes Center: Contact', ar:'مركز فض المنازعات الإيجارية: تواصل معنا'}, url:'https://rdc.gov.ae/en/contact-us'};

DATA.journeys['dubai.rent'] = {
  city:'dubai', need:'housing', icon:'housing',
  title:{en:'Rent a home', ar:'استئجار سكن'},
  sources:[SRC.law26, SRC.ejari, SRC.dldVerify, SRC.rentIndex, SRC.rdc], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'student', label:{en:'Students first', ar:'للطلاب أولاً'}, title:{en:'Students: ask about university housing', ar:'للطلاب: اسأل عن السكن الجامعي'}, help:['else'],
     blocks:[
      {t:'p', v:{en:'Many universities offer student housing or work with approved providers. Ask yours before renting privately. It’s usually simpler for your first year.', ar:'تقدّم جامعات كثيرة سكناً للطلاب أو تتعامل مع جهات سكن معتمدة. اسأل جامعتك قبل الاستئجار الخاص، فهو عادةً أبسط في سنتك الأولى.'}},
      {t:'tip', label:'tip', v:{en:'Renting privately? The next steps show how to do it safely.', ar:'ستستأجر بشكل خاص؟ الخطوات التالية توضح كيف تفعل ذلك بأمان.'}},
     ]},
    {id:'find', level:'source', label:{en:'Find safely', ar:'ابحث بأمان'}, title:{en:'Find a place safely', ar:'ابحث عن سكن بأمان'}, help:['scam','deposit','else'],
     blocks:[
      {t:'list', v:[
        {en:'Check any agent’s licence and any advert’s permit with the Dubai Land Department, on its website or the Dubai REST app.', ar:'تحقّق من ترخيص أي وسيط وتصريح أي إعلان لدى دائرة الأراضي والأملاك، عبر موقعها أو تطبيق Dubai REST.'},
        {en:'See the home in person, or on a live video call, before paying anything.', ar:'عاين السكن بنفسك، أو عبر مكالمة فيديو مباشرة، قبل أن تدفع أي شيء.'},
        {en:'Don’t pay a deposit to hold a place before you’ve seen it and checked who you’re dealing with.', ar:'لا تدفع عربوناً لحجز سكن قبل أن تعاينه وتتحقق ممن تتعامل معه.'},
      ]},
     ]},
    {id:'contract', level:'source', label:{en:'Contract', ar:'العقد'}, title:{en:'Sign the contract', ar:'وقّع العقد'}, help:['deposit','staff','else'],
     blocks:[
      {t:'list', v:[
        {en:'Get a written tenancy contract, and read it before signing: rent, how you pay, the deposit, and the end date.', ar:'احصل على عقد إيجار مكتوب واقرأه قبل التوقيع: الإيجار وطريقة الدفع والتأمين وتاريخ الانتهاء.'},
        {en:'The landlord can take a security deposit. By law it must be refunded at the end, minus any repair costs.', ar:'يحق للمالك أخذ مبلغ تأمين، ويجب قانوناً إعادته في النهاية بعد خصم تكاليف الإصلاح إن وُجدت.'},
      ]},
      {t:'phraseCard', v:{en:'Before I sign, can you show me the rent, the deposit and the end date in the contract?', ar:'قبل أن أوقّع، هل يمكنك أن تريني الإيجار والتأمين وتاريخ الانتهاء في العقد؟'}},
     ]},
    {id:'ejari', level:'source', label:{en:'Ejari', ar:'إيجاري'}, title:{en:'Register it with Ejari', ar:'سجّله في «إيجاري»'}, help:['noejari','else'],
     blocks:[
      {t:'list', v:[
        {en:'Ejari is Dubai’s official register of rental contracts. By law, contracts must be registered, and disputes over unregistered ones won’t be heard.', ar:'«إيجاري» هو السجل الرسمي لعقود الإيجار في دبي. قانوناً يجب تسجيل العقود، ولا يُنظر في النزاعات المتعلقة بعقود غير مسجلة.'},
        {en:'The tenant or landlord can register it in the Dubai REST app, on the Dubai Land Department website, or at a Real Estate Trustee Centre.', ar:'يمكن للمستأجر أو المالك تسجيله عبر تطبيق Dubai REST، أو موقع دائرة الأراضي والأملاك، أو في أحد مراكز أمين العقارية.'},
        {en:'Online, it costs about AED 178. At a centre, about AED 220.', ar:'التكلفة عبر الإنترنت نحو 178 درهماً، وفي المراكز نحو 220 درهماً.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Keep your Ejari certificate. You’ll often need it for things like connecting electricity and water, or visas for family.', ar:'احتفظ بشهادة «إيجاري»، فغالباً ستحتاجها لأمور مثل توصيل الكهرباء والماء أو تأشيرات العائلة.'}},
     ]},
    {id:'renew', level:'source', label:{en:'Renewing', ar:'التجديد'}, title:{en:'Renewing and rent increases', ar:'التجديد وزيادة الإيجار'}, help:['increase','evict','else'],
     blocks:[
      {t:'list', v:[
        {en:'Either side must give at least 90 days’ notice before the contract ends to change its terms, including the rent.', ar:'يجب على أي من الطرفين إشعار الآخر قبل 90 يوماً على الأقل من انتهاء العقد لتغيير شروطه، بما فيها الإيجار.'},
        {en:'Rent increases are checked against the Dubai Land Department’s Smart Rent Index.', ar:'تُقاس زيادات الإيجار وفق مؤشر الإيجارات الذكي لدائرة الأراضي والأملاك.'},
      ]},
     ]},
  ],
  problems:[
    {id:'scam', q:{en:'I think a listing is a scam', ar:'أظن أن الإعلان احتيالي'}, a:{en:'Don’t pay anything. Check the agent’s licence and the advert’s permit with the Dubai Land Department (website or Dubai REST app). If they don’t check out, walk away.', ar:'لا تدفع شيئاً. تحقّق من ترخيص الوسيط وتصريح الإعلان لدى دائرة الأراضي والأملاك (الموقع أو تطبيق Dubai REST). وإذا لم يثبتا، ابتعد.'}},
    {id:'deposit', q:{en:'I’m worried about my deposit', ar:'أنا قلق بشأن مبلغ التأمين'}, a:{en:'Make sure the deposit is written in your contract, and get a receipt. At the end, the landlord must refund it minus any repair costs. If they don’t, you can go to the Rental Disputes Center.', ar:'تأكد أن مبلغ التأمين مكتوب في العقد، واحصل على إيصال. في النهاية يجب على المالك إعادته بعد خصم تكاليف الإصلاح، وإن لم يفعل يمكنك التوجه إلى مركز فض المنازعات الإيجارية.'}},
    {id:'staff', q:{en:'I don’t understand the contract', ar:'لا أفهم العقد'}, a:{en:'Ask for the key terms in writing, in a language you understand, before signing. Don’t sign under pressure.', ar:'اطلب الشروط الأساسية مكتوبة بلغة تفهمها قبل التوقيع، ولا توقّع تحت الضغط.'}, phraseText:{en:'Before I sign, can you show me the rent, the deposit and the end date in the contract?', ar:'قبل أن أوقّع، هل يمكنك أن تريني الإيجار والتأمين وتاريخ الانتهاء في العقد؟'}},
    {id:'noejari', q:{en:'The landlord won’t register Ejari', ar:'المالك لا يسجّل «إيجاري»'}, a:{en:'You can register it yourself as the tenant, with a copy of the contract, in the Dubai REST app. Without Ejari, a dispute may not be heard.', ar:'يمكنك تسجيله بنفسك كمستأجر عبر تطبيق Dubai REST بنسخة من العقد. ومن دون «إيجاري» قد لا يُنظر في أي نزاع.'}},
    {id:'increase', q:{en:'My landlord wants to raise the rent', ar:'المالك يريد رفع الإيجار'}, a:{en:'Check they gave you at least 90 days’ notice before the contract ends, and that the Smart Rent Index allows an increase. If you disagree, contact the Rental Disputes Center.', ar:'تأكد أنه أشعرك قبل 90 يوماً على الأقل من انتهاء العقد، وأن مؤشر الإيجارات الذكي يسمح بالزيادة. وإذا لم توافق، تواصل مع مركز فض المنازعات الإيجارية.'}},
    {id:'evict', q:{en:'My landlord says I have to leave', ar:'المالك يقول إن علي المغادرة'}, a:{en:'Landlords can only end a tenancy for reasons set out in Dubai law, with proper notice. Don’t leave or stop paying before getting advice. Contact the Rental Disputes Center.', ar:'لا يحق للمالك إنهاء الإيجار إلا لأسباب يحددها قانون دبي ومع إشعار صحيح. لا تغادر ولا تتوقف عن الدفع قبل الحصول على المشورة، وتواصل مع مركز فض المنازعات الإيجارية.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'For rental disagreements, contact Dubai’s Rental Disputes Center on 800 4484. Students can also ask their university’s housing or student services team.', ar:'لخلافات الإيجار، تواصل مع مركز فض المنازعات الإيجارية في دبي على الرقم 800 4484. ويمكن للطلاب أيضاً سؤال فريق السكن أو خدمات الطلاب في جامعتهم.'}},
  ],
  stuck:{cards:[
    {title:{en:'Rental Disputes Center', ar:'مركز فض المنازعات الإيجارية'}, phone:'800 4484', body:{en:'Dubai’s official centre for landlord and tenant disputes.', ar:'المركز الرسمي في دبي لنزاعات المؤجرين والمستأجرين.'}},
    {title:{en:'Your university’s housing team', ar:'فريق السكن في جامعتك'}, body:{en:'If you’re a student, they may know trusted options.', ar:'إذا كنت طالباً، فقد يعرفون خيارات موثوقة.'}},
  ]},
  after:[{journey:'dubai.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}],
};
DATA.tasks['dubai.housing'] = [
  {journey:'dubai.rent', name:{en:'Rent a home', ar:'استئجار سكن'}, note:{en:'Avoid scams, sign safely, register Ejari', ar:'تجنّب الاحتيال ووقّع بأمان وسجّل «إيجاري»'}},
];

/* ---------- Work (Dubai) ---------- */
SRC.uaeLabour = {name:{en:'u.ae: Protection of workers’ rights', ar:'البوابة الرسمية: حماية حقوق العمال'}, url:'https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/labour-rights'};
SRC.uaeLeave = {name:{en:'u.ae: Types of leave (private sector)', ar:'البوابة الرسمية: أنواع الإجازات (القطاع الخاص)'}, url:'https://u.ae/en/information-and-services/jobs/Sector-of-employment/employment-in-the-private-sector/Types-of-leaves'};
SRC.mohreComplaint = {name:{en:'MOHRE: Register a labour complaint', ar:'وزارة الموارد البشرية والتوطين: تقديم شكوى عمالية'}, url:'https://www.mohre.gov.ae/en/services/register-labor-complaints-private-sector-employees-2022'};
SRC.mohreStudent = {name:{en:'MOHRE: Student training and employment permit', ar:'وزارة الموارد البشرية والتوطين: تصريح تدريب وتشغيل الطلاب'}, url:'https://www.mohre.gov.ae/en/services/training-and-work-permit-for-students-2022'};
const MOHRE_STUCK = {cards:[{title:{en:'MOHRE labour advice line', ar:'خط الاستشارات العمالية لوزارة الموارد البشرية والتوطين'}, phone:'80084', body:{en:'Free. For pay, contract and workplace problems in the private sector.', ar:'مجاني. لمشكلات الراتب والعقد وبيئة العمل في القطاع الخاص.'}}]};

DATA.journeys['dubai.workrights'] = {
  city:'dubai', need:'work', icon:'work',
  title:{en:'Know your rights at work', ar:'اعرف حقوقك في العمل'},
  sources:[SRC.uaeLabour, SRC.uaeLeave, SRC.mohreComplaint], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'contract', level:'source', label:{en:'Contract', ar:'العقد'}, title:{en:'Your contract and passport', ar:'عقدك وجواز سفرك'}, help:['passport','fees','else'],
     blocks:[
      {t:'list', v:[
        {en:'You sign your employment contract after arriving in the UAE. Read it and keep a copy.', ar:'توقّع عقد العمل بعد وصولك إلى الإمارات. اقرأه واحتفظ بنسخة منه.'},
        {en:'It’s illegal for anyone to charge you recruitment fees.', ar:'يُمنع قانوناً أن يفرض عليك أي أحد رسوم توظيف.'},
        {en:'Your employer is not allowed to keep your passport, and you don’t need their permission to leave the country.', ar:'لا يحق لجهة عملك الاحتفاظ بجواز سفرك، ولا تحتاج إلى إذنها لمغادرة الدولة.'},
      ]},
     ]},
    {id:'pay', level:'source', label:{en:'Pay and leave', ar:'الراتب والإجازات'}, title:{en:'Pay and time off', ar:'الراتب والإجازات'}, help:['unpaid','leave','else'],
     blocks:[
      {t:'list', v:[
        {en:'You should get your salary in full and on time.', ar:'يجب أن تحصل على راتبك كاملاً وفي موعده.'},
        {en:'After one year, you get 30 days of paid annual leave a year. Between 6 and 12 months, you earn 2 days for each month worked.', ar:'بعد سنة من الخدمة، تحصل على 30 يوماً إجازة سنوية مدفوعة. وبين 6 و12 شهراً، تحصل على يومين عن كل شهر عمل.'},
        {en:'Sick leave is up to 90 days a year: 15 on full pay, 30 on half pay, and the rest unpaid.', ar:'الإجازة المرضية حتى 90 يوماً في السنة: 15 بأجر كامل، و30 بنصف أجر، والباقي دون أجر.'},
      ]},
     ]},
    {id:'problem', level:'source', label:{en:'Problems', ar:'المشكلات'}, title:{en:'If something goes wrong', ar:'إذا حدثت مشكلة'}, help:['unpaid','passport','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Raise it with HR first, in writing if you can.', ar:'ناقش الأمر مع الموارد البشرية أولاً، كتابياً إن أمكن.'},
        {en:'If it isn’t solved, call MOHRE’s free labour advice line on 80084, or file a complaint in the MOHRE app or website.', ar:'إذا لم تُحل، اتصل بخط الاستشارات العمالية المجاني لوزارة الموارد البشرية والتوطين على الرقم 80084، أو قدّم شكوى عبر تطبيق الوزارة أو موقعها.'},
        {en:'MOHRE contacts both sides to try to settle it, usually within 14 working days. If that fails, it goes to court.', ar:'تتواصل الوزارة مع الطرفين لمحاولة التسوية، عادةً خلال 14 يوم عمل، وإذا لم تنجح تُحال إلى المحكمة.'},
      ]},
     ]},
  ],
  problems:[
    {id:'passport', q:{en:'My employer is keeping my passport', ar:'جهة عملي تحتفظ بجواز سفري'}, a:{en:'That’s prohibited in the UAE. Ask for it back in writing. If they refuse, call MOHRE on 80084.', ar:'هذا ممنوع في الإمارات. اطلب استرداده كتابياً، وإذا رفضوا اتصل بوزارة الموارد البشرية والتوطين على الرقم 80084.'}},
    {id:'fees', q:{en:'I was asked to pay a recruitment fee', ar:'طُلب مني دفع رسوم توظيف'}, a:{en:'Charging recruitment fees is illegal in the UAE. Don’t pay, and report it to MOHRE on 80084.', ar:'فرض رسوم التوظيف ممنوع قانوناً في الإمارات. لا تدفع، وأبلغ وزارة الموارد البشرية والتوطين على الرقم 80084.'}},
    {id:'unpaid', q:{en:'I haven’t been paid', ar:'لم أتقاضَ راتبي'}, a:{en:'Ask HR in writing when you’ll be paid. If it isn’t sorted, call MOHRE on 80084 or file a complaint in the MOHRE app.', ar:'اسأل الموارد البشرية كتابياً عن موعد صرف راتبك. وإذا لم تُحل المشكلة، اتصل بالوزارة على الرقم 80084 أو قدّم شكوى عبر تطبيقها.'}},
    {id:'leave', q:{en:'I’m being refused leave I’m owed', ar:'يُرفض منحي إجازة مستحقة'}, a:{en:'Check your contract and how long you’ve worked there. If you’re still refused, ask MOHRE’s advice line on 80084.', ar:'تحقّق من عقدك ومدة عملك. وإذا استمر الرفض، اسأل خط الاستشارات في الوزارة على الرقم 80084.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Call MOHRE’s free labour advice line on 80084.', ar:'اتصل بخط الاستشارات العمالية المجاني لوزارة الموارد البشرية والتوطين على الرقم 80084.'}},
  ],
  stuck:MOHRE_STUCK,
  after:[{pathway:'dubai.ins', name:{en:'Check your health insurance', ar:'تحقّق من تأمينك الصحي'}}],
};

DATA.journeys['dubai.studentwork'] = {
  city:'dubai', need:'work', icon:'work',
  title:{en:'Work part-time as a student', ar:'العمل بدوام جزئي كطالب'},
  sources:[SRC.mohreStudent], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'ask', label:{en:'Ask first', ar:'اسأل أولاً'}, title:{en:'Ask your university first', ar:'اسأل جامعتك أولاً'}, help:['else'],
     blocks:[
      {t:'p', v:{en:'Rules can depend on your university and where it’s based. Ask your university’s visa office or careers team before accepting any job.', ar:'قد تختلف القواعد حسب جامعتك ومكانها. اسأل مكتب التأشيرات أو فريق التوظيف في جامعتك قبل قبول أي عمل.'}},
      {t:'tip', label:'important', v:{en:'Never work without the right permit. It can put your visa at risk.', ar:'لا تعمل أبداً دون التصريح المناسب، فقد يعرّض ذلك تأشيرتك للخطر.'}},
     ]},
    {id:'permit', level:'source', label:{en:'The permit', ar:'التصريح'}, title:{en:'The student work permit', ar:'تصريح عمل الطالب'}, help:['nopermit','else'],
     blocks:[
      {t:'list', v:[
        {en:'The government’s Student Training and Employment Permit lets students aged 15 and over work: part-time, temporary, flexible or remote.', ar:'يتيح تصريح تدريب وتشغيل الطلاب الحكومي للطلاب من سن 15 عاماً فأكثر العمل بدوام جزئي أو مؤقت أو مرن أو عن بُعد.'},
        {en:'Your employer applies for it, not you. You need a valid residence visa, and a contract approved by MOHRE.', ar:'جهة العمل هي من تتقدّم بطلبه، لا أنت. وتحتاج إلى تأشيرة إقامة سارية وعقد معتمد من الوزارة.'},
        {en:'The permit lasts 3 months.', ar:'مدة التصريح 3 أشهر.'},
      ]},
     ]},
  ],
  problems:[
    {id:'nopermit', q:{en:'My employer says I don’t need a permit', ar:'جهة العمل تقول إنني لا أحتاج إلى تصريح'}, a:{en:'Check with your university’s visa office before starting. You can also ask MOHRE on 600 590000.', ar:'تحقّق من مكتب التأشيرات في جامعتك قبل البدء. ويمكنك أيضاً سؤال وزارة الموارد البشرية والتوطين على الرقم 600590000.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Ask your university’s visa office, or call MOHRE on 600 590000.', ar:'اسأل مكتب التأشيرات في جامعتك، أو اتصل بوزارة الموارد البشرية والتوطين على الرقم 600590000.'}},
  ],
  stuck:{cards:[{title:{en:'Your university’s visa office', ar:'مكتب التأشيرات في جامعتك'}, body:{en:'They know the rules for your visa.', ar:'يعرفون القواعد الخاصة بتأشيرتك.'}},{title:{en:'MOHRE', ar:'وزارة الموارد البشرية والتوطين'}, phone:'600 590000', body:{en:'Available 24/7.', ar:'متاح على مدار الساعة.'}}]},
  after:[{journey:'dubai.workrights', name:{en:'Know your rights at work', ar:'اعرف حقوقك في العمل'}}],
};
DATA.tasks['dubai.work'] = [
  {journey:'dubai.workrights', name:{en:'Know your rights at work', ar:'اعرف حقوقك في العمل'}, note:{en:'Contract, passport, pay, leave and complaints', ar:'العقد والجواز والراتب والإجازات والشكاوى'}},
  {journey:'dubai.studentwork', name:{en:'Work part-time as a student', ar:'العمل بدوام جزئي كطالب'}, note:{en:'The permit you need, and who applies', ar:'التصريح الذي تحتاجه ومن يتقدّم به'}},
];

/* ---------- Education (Dubai): school for your children ---------- */
SRC.khdaAge = {name:{en:'Khaleej Times: KHDA guide on age cut-offs (2026)', ar:'الخليج تايمز: دليل هيئة المعرفة حول السن المطلوبة (2026)'}, url:'https://www.khaleejtimes.com/uae/dubai-school-admissions-khda-new-guide-age-cut-off'};
SRC.khdaRatings = {name:{en:'KHDA: Dubai school inspection ratings', ar:'هيئة المعرفة والتنمية البشرية: تقييمات المدارس'}, url:'https://web.khda.gov.ae/en/About-Us/Whats-New/Dubai-school-inspection-ratings'};
DATA.journeys['dubai.school'] = {
  city:'dubai', need:'edu', icon:'edu',
  title:{en:'Find a school for your child', ar:'ابحث عن مدرسة لطفلك'},
  sources:[SRC.khdaRatings, SRC.khdaAge], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'choose', level:'source', label:{en:'Choose', ar:'اختر'}, title:{en:'Choosing a school', ar:'اختيار مدرسة'}, help:['else'],
     blocks:[
      {t:'list', v:[
        {en:'Private schools in Dubai are regulated by KHDA (the Knowledge and Human Development Authority).', ar:'تشرف هيئة المعرفة والتنمية البشرية (KHDA) على المدارس الخاصة في دبي.'},
        {en:'KHDA publishes an inspection rating for each school. Check it alongside the curriculum, fees and distance from home.', ar:'تنشر الهيئة تقييماً رقابياً لكل مدرسة. راجعه إلى جانب المنهج والرسوم والمسافة من المنزل.'},
      ]},
     ]},
    {id:'age', level:'source', label:{en:'Age and grade', ar:'السن والصف'}, title:{en:'Which grade your child joins', ar:'في أي صف يلتحق طفلك'}, help:['grade','else'],
     blocks:[
      {t:'list', v:[
        {en:'For the youngest children, age decides the grade. For schools starting in September, the age is counted on 31 December.', ar:'بالنسبة لأصغر الأطفال، يحدد العمر الصف. وفي المدارس التي تبدأ في سبتمبر، يُحسب العمر في 31 ديسمبر.'},
        {en:'For Grade 1 and above, the school looks mainly at your child’s transfer certificate from their last school.', ar:'من الصف الأول فما فوق، تعتمد المدرسة أساساً على شهادة النقل من مدرسة طفلك السابقة.'},
      ]},
      {t:'tip', label:'bring', v:{en:'Ask your child’s current school for a transfer certificate and recent reports before you move.', ar:'اطلب من مدرسة طفلك الحالية شهادة نقل وتقارير حديثة قبل الانتقال.'}},
     ]},
    {id:'apply', label:{en:'Apply', ar:'التقديم'}, title:{en:'Applying', ar:'التقديم'}, help:['full','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Contact the schools you like. Each one runs its own admissions and may have a waiting list.', ar:'تواصل مع المدارس التي تعجبك، فلكل منها إجراءات قبول خاصة وقد تكون لديها قائمة انتظار.'},
        {en:'Ask what documents they need and whether there’s an assessment.', ar:'اسأل عن المستندات المطلوبة وهل يوجد اختبار تقييم.'},
        {en:'Ask for the full fees in writing before you accept a place.', ar:'اطلب الرسوم الكاملة مكتوبة قبل قبول المقعد.'},
      ]},
     ]},
  ],
  problems:[
    {id:'grade', q:{en:'I’m not sure which grade my child should join', ar:'لست متأكداً في أي صف يلتحق طفلي'}, a:{en:'Ask the school to explain their placement, based on your child’s age and transfer certificate. The rules follow KHDA’s Student Placement Guidelines.', ar:'اطلب من المدرسة شرح قرار التسكين بناءً على عمر طفلك وشهادة النقل، فالقواعد تتبع إرشادات هيئة المعرفة لتسكين الطلاب.'}},
    {id:'full', q:{en:'The schools I want are full', ar:'المدارس التي أريدها ممتلئة'}, a:{en:'Join the waiting lists, and ask each school how long it usually takes. Apply to a few schools at once.', ar:'سجّل في قوائم الانتظار، واسأل كل مدرسة عن المدة المعتادة. وقدّم لعدة مدارس في الوقت نفسه.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Ask the school’s admissions team first. For questions about rules, you can contact KHDA.', ar:'اسأل فريق القبول في المدرسة أولاً. ولأسئلة القواعد، يمكنك التواصل مع هيئة المعرفة والتنمية البشرية.'}},
  ],
  stuck:{cards:[{title:{en:'The school’s admissions team', ar:'فريق القبول في المدرسة'}, body:{en:'They handle applications and placement.', ar:'يتولون الطلبات والتسكين.'}},{title:{en:'KHDA', ar:'هيئة المعرفة والتنمية البشرية'}, body:{en:'Dubai’s regulator for private schools.', ar:'الجهة المنظمة للمدارس الخاصة في دبي.'}}]},
  after:[{journey:'dubai.rent', name:{en:'Rent a home', ar:'استئجار سكن'}}],
};
DATA.tasks['dubai.edu'] = [
  {journey:'dubai.school', name:{en:'Find a school for your child', ar:'ابحث عن مدرسة لطفلك'}, note:{en:'Ratings, age and grade, and applying', ar:'التقييمات والسن والصف والتقديم'}},
];

/* ---------- Community (Dubai) ---------- */
SRC.volunteers = {name:{en:'Volunteers.ae: FAQ', ar:'منصة المتطوعين: الأسئلة الشائعة'}, url:'https://www.volunteers.ae/en/faq'};
SRC.ramadan = {name:{en:'u.ae: Ramadan', ar:'البوابة الرسمية: رمضان'}, url:'https://u.ae/en/information-and-services/public-holidays-and-religious-affairs/ramadan'};
DATA.journeys['dubai.community'] = {
  city:'dubai', need:'community', icon:'community',
  title:{en:'Meet people and settle in', ar:'تعرّف على الناس واستقر'},
  sources:[SRC.volunteers, SRC.ramadan], checked:CHECKED, trust:{reviewed:false, tested:0},
  stages:[
    {id:'lonely', label:{en:'It’s normal', ar:'هذا طبيعي'}, title:{en:'Feeling alone is normal', ar:'الشعور بالوحدة أمر طبيعي'}, help:['talk','else'],
     blocks:[
      {t:'p', v:{en:'Most newcomers feel lonely at first. It usually gets easier once you have a routine and a few familiar faces.', ar:'يشعر معظم القادمين الجدد بالوحدة في البداية، وعادةً يصبح الأمر أسهل عندما يكون لديك روتين وبعض الوجوه المألوفة.'}},
     ]},
    {id:'meet', label:{en:'Meet people', ar:'تعرّف على الناس'}, title:{en:'Ways to meet people', ar:'طرق للتعرّف على الناس'}, help:['else'],
     blocks:[
      {t:'list', v:[
        {en:'Students: join university clubs and societies. They’re one of the easiest ways to make friends.', ar:'للطلاب: انضم إلى أندية الجامعة وجمعياتها، فهي من أسهل الطرق لتكوين صداقات.'},
        {en:'Look for community groups from your home country or who share your faith or interests.', ar:'ابحث عن مجموعات من بلدك أو تشاركك دينك أو اهتماماتك.'},
        {en:'Regular routines help: the same gym, café or class each week.', ar:'الروتين المنتظم يساعد: النادي الرياضي أو المقهى أو الصف نفسه كل أسبوع.'},
      ]},
     ]},
    {id:'volunteer', level:'source', label:{en:'Volunteer', ar:'التطوع'}, title:{en:'Volunteer', ar:'تطوّع'}, help:['noeid','else'],
     blocks:[
      {t:'list', v:[
        {en:'Volunteers.ae is the UAE’s national volunteering platform. It’s open to residents of all nationalities.', ar:'منصة Volunteers.ae هي المنصة الوطنية للتطوع في الإمارات، ومتاحة للمقيمين من جميع الجنسيات.'},
        {en:'You can sign up with UAE PASS. You’ll need your Emirates ID and passport. Under-18s need a parent’s consent.', ar:'يمكنك التسجيل عبر UAE PASS، وتحتاج إلى هويتك الإماراتية وجواز سفرك. ويحتاج من هم دون 18 عاماً إلى موافقة ولي الأمر.'},
      ]},
     ]},
    {id:'customs', level:'source', label:{en:'Local customs', ar:'العادات المحلية'}, title:{en:'Ramadan and local customs', ar:'رمضان والعادات المحلية'}, help:['else'],
     blocks:[
      {t:'list', v:[
        {en:'During Ramadan, non-Muslims don’t have to fast. Malls have dining areas away from people who are fasting.', ar:'خلال رمضان، لا يُطلب من غير المسلمين الصيام، وتوجد في مراكز التسوق مناطق لتناول الطعام بعيداً عن الصائمين.'},
        {en:'Working hours are shorter for everyone during Ramadan.', ar:'تُقلَّص ساعات العمل للجميع خلال رمضان.'},
        {en:'Cities are especially lively after sunset. Many people welcome newcomers to join an iftar, the meal that breaks the fast.', ar:'تصبح المدن حيوية بشكل خاص بعد غروب الشمس، ويرحّب كثيرون بانضمام القادمين الجدد إلى الإفطار.'},
      ]},
     ]},
  ],
  problems:[
    {id:'talk', q:{en:'I need to talk to someone', ar:'أحتاج إلى التحدث مع أحد'}, a:{en:'Students can contact their university’s counselling or wellbeing service. If you’re in danger or might harm yourself, call 999 or go to the nearest emergency department now.', ar:'يمكن للطلاب التواصل مع خدمة الإرشاد النفسي في جامعتهم. وإذا كنت في خطر أو قد تؤذي نفسك، اتصل بالرقم 999 أو توجّه إلى أقرب قسم طوارئ الآن.'}},
    {id:'noeid', q:{en:'I can’t sign up without an Emirates ID', ar:'لا أستطيع التسجيل دون هوية إماراتية'}, a:{en:'Volunteers.ae asks for your Emirates ID, so wait until your card arrives. In the meantime, ask your university or community groups about volunteering.', ar:'تطلب منصة المتطوعين الهوية الإماراتية، فانتظر حتى تصلك البطاقة. وفي الأثناء، اسأل جامعتك أو المجموعات المجتمعية عن فرص التطوع.'}},
    {id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en:'Students can ask their university’s student services. They often know about clubs, events and support.', ar:'يمكن للطلاب سؤال خدمات الطلاب في جامعتهم، فهم غالباً يعرفون الأندية والفعاليات والدعم المتاح.'}},
  ],
  stuck:{cards:[{title:{en:'Emergency', ar:'الطوارئ'}, phone:'999', body:{en:'If you or someone else is in danger.', ar:'إذا كنت أنت أو شخص آخر في خطر.'}},{title:{en:'Your university’s student services', ar:'خدمات الطلاب في جامعتك'}, body:{en:'Clubs, events, counselling and support.', ar:'الأندية والفعاليات والإرشاد النفسي والدعم.'}}]},
  after:[{journey:'dubai.health.student', name:{en:'Looking after your health', ar:'الاهتمام بصحتك'}}],
};
DATA.tasks['dubai.community'] = [
  {journey:'dubai.community', name:{en:'Meet people and settle in', ar:'تعرّف على الناس واستقر'}, note:{en:'Making friends, volunteering, and local customs', ar:'تكوين الصداقات والتطوع والعادات المحلية'}},
];
