/* =========================================================
   DUBAI · STUDENT RESIDENCE VISA → EMIRATES ID
   The "absurdly complete" pass: every question accepts uncertainty,
   every "ask your visa office" says exactly what to say, and
   "they told me something different" has a clear answer.
   ========================================================= */
(function(){
  const j = DATA.journeys['dubai.eid.student']; if(!j) return;
  const v = (en, ar) => ({en, ar});
  const st = id => j.stages.find(s => s.id === id);
  const fq = id => j.finder.find(f => f.stage === id);

  /* ---- 1. Finder: "What does this mean?" and a short check-up for "I'm not sure" ---- */
  delete fq('arrive').unsureLabel;   // "What does this mean?" now covers it
  Object.assign(fq('arrive'), {
    explain:v('When you land, passport control records your entry on your entry permit. Your university’s visa office needs a copy of it to start your residence visa. Most students email it to them or hand it in on campus.',
              'عند وصولك، تُسجّل الجوازات دخولك على تصريح الدخول. يحتاج مكتب التأشيرات في جامعتك إلى نسخة منه لبدء تأشيرة الإقامة. يرسله معظم الطلاب بالبريد الإلكتروني أو يسلّمونه في الحرم الجامعي.'),
    checks:[v('Since you landed, have you emailed or handed a document to your university’s visa office?','منذ وصولك، هل أرسلت أو سلّمت مستنداً إلى مكتب التأشيرات في جامعتك؟'),
            v('Has your university replied with a medical test appointment or next steps?','هل ردّت جامعتك بموعد للفحص الطبي أو بالخطوات التالية؟')],
    confirm:v('Ask your visa office: “Have you received my entry permit since I arrived?”','اسأل مكتب التأشيرات: «هل استلمتم تصريح دخولي بعد وصولي؟»'),
  });
  Object.assign(fq('medical'), {
    explain:v('A routine health check every new resident has: a blood sample and a chest X-ray, at a government health centre. Your university usually books it for you.',
              'فحص صحي روتيني يخضع له كل مقيم جديد: عيّنة دم وأشعة للصدر في مركز صحي حكومي. عادةً تحجز جامعتك الموعد لك.'),
    checks:[v('Did you give a blood sample at a health centre?','هل أخذوا منك عيّنة دم في مركز صحي؟'),
            v('Did you have a chest X-ray?','هل أجريت أشعة للصدر؟'),
            v('Were you given a receipt or a form to keep?','هل أعطوك إيصالاً أو نموذجاً للاحتفاظ به؟')],
    confirm:v('The result goes to your university, not to you. Ask your visa office: “Has my medical test result come through?”','تذهب النتيجة إلى جامعتك لا إليك. اسأل مكتب التأشيرات: «هل وصلت نتيجة فحصي الطبي؟»'),
  });
  Object.assign(fq('biometrics'), {
    explain:v('Staff scan all your fingers on a glass scanner, and usually take your photo and signature, for your Emirates ID. It happens at an ICP or service centre, or sometimes on campus.',
              'يمسح الموظفون جميع أصابعك على جهاز زجاجي، وعادةً يلتقطون صورتك وتوقيعك، من أجل الهوية الإماراتية. يتم ذلك في مركز للهيئة أو مركز خدمة، وأحياناً في الحرم الجامعي.'),
    checks:[v('Did someone scan your fingers on a glass scanner?','هل مسح أحدهم أصابعك على جهاز زجاجي؟'),
            v('Did they take your photo or signature at the same appointment?','هل التقطوا صورتك أو توقيعك في الموعد نفسه؟'),
            v('Did you get a receipt or a confirmation message afterwards?','هل وصلك إيصال أو رسالة تأكيد بعد ذلك؟')],
    confirm:v('Ask your visa office, or check your Emirates ID status on the ICP website with your application number (PRAN).','اسأل مكتب التأشيرات، أو تحقّق من حالة هويتك على موقع الهيئة برقم الطلب (PRAN).'),
  });
  Object.assign(fq('issued'), {
    explain:v('Your residence visa is your permission to live in the UAE. Today it’s usually digital: your university receives it and sends you a copy.',
              'تأشيرة الإقامة هي إذنك بالعيش في الإمارات. غالباً ما تكون رقمية اليوم: تستلمها جامعتك وترسل إليك نسخة منها.'),
    checks:[v('Has your university emailed you a residence visa document?','هل أرسلت إليك جامعتك مستند تأشيرة الإقامة بالبريد الإلكتروني؟'),
            v('Have you had a text message about your residence or Emirates ID?','هل وصلتك رسالة نصية بخصوص إقامتك أو هويتك الإماراتية؟')],
    confirm:v('Ask your visa office: “Has my residence visa been issued?”','اسأل مكتب التأشيرات: «هل صدرت تأشيرة إقامتي؟»'),
  });
  Object.assign(fq('register'), {
    explain:v('Some universities ask you to show your new Emirates ID and passport to finish your enrolment. At some it’s called a Right to Study Check.',
              'تطلب بعض الجامعات أن تُظهر هويتك الإماراتية الجديدة وجواز سفرك لإكمال تسجيلك. وفي بعضها يُسمّى ذلك «التحقق من حق الدراسة».'),
    checks:[v('Has your university asked to see your Emirates ID since you got it?','هل طلبت جامعتك رؤية هويتك الإماراتية منذ أن استلمتها؟')],
    confirm:v('Ask student services: “Is there anything else I need to do to finish my registration?”','اسأل خدمات الطلاب: «هل بقي شيء عليّ فعله لإكمال تسجيلي؟»'),
  });

  /* ---- 2. Every "ask your visa office" says exactly what to say ---- */
  const say = {
    late:v('Hello. My name is [your full name], passport number [number]. I haven’t received my entry permit yet. Could you tell me the status of my application, please? Thank you.',
           'مرحباً. اسمي [اسمك الكامل]، رقم جواز السفر [الرقم]. لم يصلني تصريح الدخول بعد. هل يمكنكم إبلاغي بحالة طلبي من فضلكم؟ شكراً لكم.'),
    expiring:v('Hello. My name is [your full name], passport number [number]. My entry permit expires on [date] and I haven’t been able to travel yet. What should I do, please?',
               'مرحباً. اسمي [اسمك الكامل]، رقم جواز السفر [الرقم]. ينتهي تصريح دخولي في [التاريخ] ولم أتمكن من السفر بعد. ماذا عليّ أن أفعل من فضلكم؟'),
    lostpermit:v('Hello. My name is [your full name], passport number [number]. I’ve lost my entry permit. Could you send me a copy, please?',
                 'مرحباً. اسمي [اسمك الكامل]، رقم جواز السفر [الرقم]. أضعت تصريح دخولي. هل يمكنكم إرسال نسخة منه إليّ من فضلكم؟'),
    travel:v('Hello. My name is [your full name], student ID [number]. I need to travel outside the UAE on [date] because [reason]. Is it safe to travel while my visa is being processed?',
             'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. أحتاج إلى السفر خارج الإمارات في [التاريخ] بسبب [السبب]. هل السفر آمن أثناء معالجة تأشيرتي؟'),
    noappt:v('Hello. My name is [your full name], student ID [number]. I arrived on [date] and sent my entry permit, but I haven’t received a medical test appointment yet. Could you check, please?',
             'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. وصلت في [التاريخ] وأرسلت تصريح الدخول، لكن لم يصلني موعد الفحص الطبي بعد. هل يمكنكم التحقق من فضلكم؟'),
    result:v('Hello. My name is [your full name], student ID [number]. I had my medical test on [date]. Has the result come through, and what is my next step?',
             'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. أجريت الفحص الطبي في [التاريخ]. هل وصلت النتيجة، وما خطوتي التالية؟'),
    missed:v('Hello. My name is [your full name], student ID [number]. I missed my [medical test / fingerprint] appointment on [date]. Could you book a new one for me, please? I’m sorry for the trouble.',
             'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. فاتني موعد [الفحص الطبي / البصمات] في [التاريخ]. هل يمكنكم حجز موعد جديد لي من فضلكم؟ أعتذر عن الإزعاج.'),
    whatdocs:v('Hello. My name is [your full name], student ID [number]. What do I need to bring to finish my registration, please?',
               'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. ماذا عليّ أن أُحضر لإكمال تسجيلي من فضلكم؟'),
    noappt2:v('Hello. My name is [your full name], student ID [number]. I’m at my appointment now, but staff say they can’t find it. Could you speak to them or check my booking, please?',
              'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. أنا في موعدي الآن، لكن الموظفين يقولون إنهم لا يجدونه. هل يمكنكم التحدث معهم أو التحقق من حجزي من فضلكم؟'),
    slow:v('Hello. My name is [your full name], student ID [number]. I arrived on [date] and my residence visa and Emirates ID aren’t ready yet. Could you tell me where my application is, please?',
           'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. وصلت في [التاريخ] ولم تجهز تأشيرة إقامتي وهويتي الإماراتية بعد. هل يمكنكم إبلاغي أين وصل طلبي من فضلكم؟'),
    wherecard:v('Hello. My name is [your full name], student ID [number]. Where and when can I collect my Emirates ID card, please?',
                'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. أين ومتى يمكنني استلام بطاقة الهوية الإماراتية من فضلكم؟'),
    staff:v('Hello. My name is [your full name], student ID [number]. I’m at my appointment now and I don’t understand what the staff are telling me. Could you speak to them, please?',
            'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. أنا في موعدي الآن ولا أفهم ما يقوله لي الموظفون. هل يمكنكم التحدث معهم من فضلكم؟'),
    else:v('Hello. My name is [your full name], student ID [number]. I need help with my student visa: [describe the problem in one sentence]. Thank you.',
           'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. أحتاج إلى مساعدة بخصوص تأشيرة الطالب: [صِف المشكلة في جملة واحدة]. شكراً لكم.'),
  };
  j.problems.forEach(p => { if(say[p.id]) p.esc = {to:'visa', say:say[p.id]}; });
  const status = j.problems.find(p => p.id === 'status');
  if(status){ const no = status.branch.options[1], dk = status.branch.options[2];
    const pranSay = {to:'visa', say:v('Hello. My name is [your full name], student ID [number]. Could you send me my Emirates ID application number (PRAN), please? Thank you.',
                                      'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. هل يمكنكم إرسال رقم طلب الهوية الإماراتية (PRAN) إليّ من فضلكم؟ شكراً لكم.')};
    no.esc = pranSay; dk.esc = pranSay; }

  /* ---- 3. "They told me something different": the truth order, in plain words ---- */
  j.problems.splice(j.problems.length - 1, 0, {
    id:'differ', q:v('Someone told me something different','قيل لي شيء مختلف'),
    branch:{q:v('Who told you?','من أخبرك بذلك؟'), options:[
      {label:v('My university or its visa office','جامعتي أو مكتب التأشيرات فيها'),
       a:v('Follow your university. They run your application, and each university does a few things its own way. Orivia shows the usual order. Please tell us about the difference, so we can check this step.',
           'اتبع تعليمات جامعتك، فهي التي تتولى طلبك، ولكل جامعة طريقتها في بعض التفاصيل. تعرض أوريفيا الترتيب المعتاد. أخبرنا بالاختلاف من فضلك لنراجع هذه الخطوة.'), report:true},
      {label:v('A government office, like ICP or a service centre','جهة حكومية، مثل الهيئة الاتحادية أو مركز خدمة'),
       a:v('For official rules, like fees, documents and deadlines, the government office is right. Tell your visa office what you were told, so your application stays on track.',
           'في القواعد الرسمية، مثل الرسوم والمستندات والمواعيد النهائية، الجهة الحكومية هي المرجع. أخبر مكتب التأشيرات بما قيل لك، ليبقى طلبك في مساره الصحيح.'),
       esc:{to:'visa', say:v('Hello. My name is [your full name], student ID [number]. At [office] I was told [what they said]. Does this change anything for my application?',
                             'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. في [اسم الجهة] قيل لي [ما قالوه]. هل يغيّر هذا شيئاً في طلبي؟')}, report:true},
      {label:v('A friend, a group chat or social media','صديق أو مجموعة دردشة أو وسائل التواصل'),
       a:v('Other people’s experiences are real, but they often had a different visa, university or year. Before you change anything, check with your visa office.',
           'تجارب الآخرين حقيقية، لكنها غالباً كانت بتأشيرة أو جامعة أو سنة مختلفة. قبل أن تغيّر أي شيء، تحقّق من مكتب التأشيرات.'),
       esc:{to:'visa', say:v('Hello. My name is [your full name], student ID [number]. I heard that [what you heard]. Does this apply to me?',
                             'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. سمعت أن [ما سمعته]. هل ينطبق هذا عليّ؟')}},
      {label:v('Two official sources say different things','مصدران رسميان يقولان أشياء مختلفة'),
       a:v('Don’t pick one yourself. Show both to your visa office and ask which one applies to you. They know the rules for your case.',
           'لا تختر أحدهما بنفسك. اعرض كليهما على مكتب التأشيرات واسأل أيهما ينطبق عليك، فهم يعرفون القواعد الخاصة بحالتك.'),
       esc:{to:'visa', say:v('Hello. My name is [your full name], student ID [number]. I’ve found two different instructions about [topic]: [first] and [second]. Which one applies to me, please?',
                             'مرحباً. اسمي [اسمك الكامل]، الرقم الجامعي [الرقم]. وجدت تعليمتين مختلفتين بخصوص [الموضوع]: [الأولى] و[الثانية]. أيهما تنطبق عليّ من فضلكم؟')}, report:true},
    ]}
  });
  j.stages.forEach(s => { s.help = s.help || []; ['differ'].forEach(h => { if(!s.help.includes(h)) s.help.push(h); }); });

  /* ---- 4. What happens when you arrive ---- */
  const arrive = st('arrive');
  if(arrive) arrive.expect = [
    v('At passport control, show your passport. Have your entry permit ready too, printed or on your phone.','عند الجوازات، اعرض جواز سفرك، وجهّز تصريح الدخول أيضاً، مطبوعاً أو على هاتفك.'),
    v('The officer records your entry. Some people get a passport stamp and some don’t. Both are normal.','يسجّل الموظف دخولك. بعض الناس يحصلون على ختم في الجواز وبعضهم لا، وكلا الأمرين طبيعي.'),
    v('Your residence visa process starts once your visa office has your entry details, so send them as soon as you can.','تبدأ إجراءات تأشيرة الإقامة عندما تصل تفاصيل دخولك إلى مكتب التأشيرات، فأرسلها بأسرع ما يمكن.'),
  ];
  const card = st('card');
  if(card && !card.need) card.need = [
    {id:'passport', v:v('Your passport','جواز سفرك'), form:'original'},
    {id:'readymsg', v:v('The message saying your card is ready','الرسالة التي تفيد بأن بطاقتك جاهزة'), note:v('Some collection points also ask for your student ID card.','تطلب بعض نقاط الاستلام أيضاً بطاقتك الجامعية.')},
  ];
  const reg = st('register');
  if(reg && !reg.expect) reg.expect = [
    v('Staff check your passport and your new Emirates ID against your student record.','يطابق الموظفون جواز سفرك وهويتك الإماراتية الجديدة مع سجلك الجامعي.'),
    v('It usually takes a few minutes. You may get an email when your registration is complete.','يستغرق ذلك عادةً بضع دقائق، وقد تصلك رسالة عند اكتمال تسجيلك.'),
  ];
})();

/* Glossary: "stamping" */
if(typeof TERMS !== 'undefined' && !TERMS.stamping){
  TERMS.stamping = {match:['stamping','ختم التأشيرة'], v:{en:'Stamping', ar:'ختم التأشيرة'},
    d:{en:'An old name for the residence visa being issued. Visas used to be stamped into passports; today they’re usually digital.', ar:'اسم قديم لصدور تأشيرة الإقامة. كانت التأشيرات تُختم في جواز السفر، أما اليوم فهي غالباً رقمية.'}};
}
