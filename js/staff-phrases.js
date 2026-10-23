/* Show this to staff: one plain question per step, in the newcomer's own voice (English + Arabic). */
(function(){
  const P = {
 "dubai.nol": {
  "understand": {
   "en": "Which nol card do I need to use the Metro and buses?",
   "ar": "ما بطاقة نول التي أحتاجها لاستخدام المترو والحافلات؟"
  },
  "prepare": {
   "en": "Which nol card should I get for travelling around Dubai?",
   "ar": "أي بطاقة نول تنصحني بها للتنقل في دبي؟"
  },
  "find": {
   "en": "Where can I buy a nol card near here?",
   "ar": "من أين يمكنني شراء بطاقة نول بالقرب من هنا؟"
  },
  "getthere": {
   "en": "Can you show me the way to the nearest Metro station, please?",
   "ar": "هل يمكنك أن ترشدني إلى أقرب محطة مترو من فضلك؟"
  },
  "arrive": {
   "en": "Can you help me buy and top up a nol card at this machine?",
   "ar": "هل يمكنك مساعدتي في شراء بطاقة نول وشحنها من هذه الآلة؟"
  },
  "ride": {
   "en": "Which platform and train do I take to get to my stop?",
   "ar": "من أي رصيف وأي قطار أركب للوصول إلى محطتي؟"
  },
  "next": {
   "en": "How do I check my nol balance and top it up later?",
   "ar": "كيف أتحقق من رصيد بطاقة نول وأشحنها لاحقًا؟"
  }
 },
 "dubai.eid.student": {
  "permit": {
   "en": "I need help checking my student entry permit before I travel.",
   "ar": "أحتاج إلى مساعدة في التحقق من تصريح الدخول الخاص بي كطالب قبل السفر."
  },
  "arrive": {
   "en": "I've just arrived and need to tell the university for my visa.",
   "ar": "وصلت للتو وأحتاج إلى إبلاغ الجامعة بوصولي من أجل التأشيرة."
  },
  "medical": {
   "en": "I'm here for my medical fitness test for my residence visa.",
   "ar": "جئت لإجراء فحص اللياقة الطبية من أجل تأشيرة الإقامة."
  },
  "biometrics": {
   "en": "I need help with my fingerprint appointment for my Emirates ID.",
   "ar": "أحتاج إلى مساعدة بخصوص موعد البصمات لبطاقة الهوية الإماراتية."
  },
  "issued": {
   "en": "Can you help me check the status of my residence visa?",
   "ar": "هل يمكنك مساعدتي في معرفة حالة تأشيرة الإقامة الخاصة بي؟"
  },
  "card": {
   "en": "I'd like to collect my Emirates ID card. What do I need?",
   "ar": "أود استلام بطاقة الهوية الإماراتية. ما الذي أحتاجه؟"
  },
  "register": {
   "en": "I have my visa and Emirates ID. How do I finish my university registration?",
   "ar": "حصلت على التأشيرة والهوية الإماراتية. كيف أُكمل تسجيلي في الجامعة؟"
  },
  "next": {
   "en": "I have my Emirates ID now. What should I use it for first?",
   "ar": "حصلت على الهوية الإماراتية الآن. فيمَ ينبغي أن أستخدمها أولًا؟"
  }
 },
 "dubai.airport": {
  "choose": {
   "en": "What's the best way to get from the airport to my address?",
   "ar": "ما أفضل طريقة للوصول من المطار إلى عنواني؟"
  },
  "metro": {
   "en": "Where do I catch the Metro from the airport?",
   "ar": "من أين أركب المترو من المطار؟"
  },
  "taxi": {
   "en": "Where can I get an official taxi from the airport?",
   "ar": "من أين يمكنني أخذ سيارة أجرة رسمية من المطار؟"
  },
  "arrived": {
   "en": "I've just arrived at my accommodation. Can you help me check in?",
   "ar": "وصلت للتو إلى مكان إقامتي. هل يمكنك مساعدتي في تسجيل الوصول؟"
  }
 },
 "dubai.taxi": {
  "which": {
   "en": "Where can I get a taxi from here?",
   "ar": "من أين يمكنني أخذ سيارة أجرة من هنا؟"
  },
  "ride": {
   "en": "Could you please start the meter for this ride?",
   "ar": "هل يمكنك تشغيل العدّاد لهذه الرحلة من فضلك؟"
  },
  "address": {
   "en": "I'd like to go to this address, please.",
   "ar": "أود الذهاب إلى هذا العنوان من فضلك."
  }
 },
 "dubai.sim": {
  "which": {
   "en": "Which SIM card can I get with the documents I have?",
   "ar": "ما شريحة الاتصال التي يمكنني الحصول عليها بالوثائق التي معي؟"
  },
  "buy": {
   "en": "I'd like to buy a SIM card and register it in my name.",
   "ar": "أود شراء شريحة اتصال وتسجيلها باسمي."
  },
  "check": {
   "en": "Can you help me check which phone numbers are registered in my name?",
   "ar": "هل يمكنك مساعدتي في معرفة أرقام الهاتف المسجلة باسمي؟"
  },
  "switch": {
   "en": "I have my Emirates ID now. Can you update my SIM registration?",
   "ar": "حصلت على الهوية الإماراتية الآن. هل يمكنك تحديث تسجيل شريحتي؟"
  }
 },
 "dubai.uaepass": {
  "what": {
   "en": "What is UAE PASS, and do I need it?",
   "ar": "ما هو تطبيق الهوية الرقمية (UAE PASS)، وهل أحتاج إليه؟"
  },
  "register": {
   "en": "Can you help me create my UAE PASS account?",
   "ar": "هل يمكنك مساعدتي في إنشاء حسابي في UAE PASS؟"
  },
  "use": {
   "en": "How do I use UAE PASS safely to sign in to services?",
   "ar": "كيف أستخدم UAE PASS بأمان لتسجيل الدخول إلى الخدمات؟"
  }
 },
 "dubai.health.student": {
  "emergency": {
   "en": "I'm not sure if this is an emergency. Where should I go?",
   "ar": "لست متأكدًا إن كانت هذه حالة طارئة. إلى أين يجب أن أذهب؟"
  },
  "insurance": {
   "en": "Can you help me understand what my health insurance covers?",
   "ar": "هل يمكنك مساعدتي في فهم ما يغطيه تأميني الصحي؟"
  },
  "find": {
   "en": "Which clinics near here accept my health insurance?",
   "ar": "ما العيادات القريبة من هنا التي تقبل تأميني الصحي؟"
  },
  "visit": {
   "en": "I'd like to see a doctor. Here is my insurance card.",
   "ar": "أود مراجعة طبيب. هذه بطاقة التأمين الخاصة بي."
  },
  "pharmacy": {
   "en": "I'd like to get the medicine on this prescription, please.",
   "ar": "أود صرف الدواء الموجود في هذه الوصفة من فضلك."
  },
  "wellbeing": {
   "en": "Where can I find mental health support as a student?",
   "ar": "أين يمكنني الحصول على دعم للصحة النفسية كطالب؟"
  }
 },
 "dubai.ins.student": {
  "who": {
   "en": "How do I get the health insurance the university arranges for students?",
   "ar": "كيف أحصل على التأمين الصحي الذي توفره الجامعة للطلاب؟"
  },
  "gap": {
   "en": "Am I covered by health insurance before my visa is issued?",
   "ar": "هل أنا مشمول بالتأمين الصحي قبل صدور تأشيرتي؟"
  },
  "check": {
   "en": "Can you check that my health insurance is active?",
   "ar": "هل يمكنك التحقق من أن تأميني الصحي ساري المفعول؟"
  }
 },
 "dubai.ins.employee": {
  "who": {
   "en": "How do I get the health insurance my employer provides?",
   "ar": "كيف أحصل على التأمين الصحي الذي يوفره صاحب العمل؟"
  },
  "check": {
   "en": "Can you check that my health insurance is active?",
   "ar": "هل يمكنك التحقق من أن تأميني الصحي ساري المفعول؟"
  },
  "family": {
   "en": "How can I get health insurance for my family living with me?",
   "ar": "كيف يمكنني الحصول على تأمين صحي لعائلتي المقيمة معي؟"
  }
 },
 "dubai.ins.family": {
  "who": {
   "en": "How does my sponsor arrange health insurance for me?",
   "ar": "كيف يرتب كفيلي التأمين الصحي لي؟"
  },
  "check": {
   "en": "Can you check that my health insurance is active?",
   "ar": "هل يمكنك التحقق من أن تأميني الصحي ساري المفعول؟"
  }
 },
 "dubai.ins.self": {
  "who": {
   "en": "I need to arrange my own health insurance. Where do I start?",
   "ar": "أحتاج إلى ترتيب تأميني الصحي بنفسي. من أين أبدأ؟"
  },
  "choose": {
   "en": "Can you help me compare health insurance plans?",
   "ar": "هل يمكنك مساعدتي في المقارنة بين خطط التأمين الصحي؟"
  },
  "check": {
   "en": "Can you check that my health insurance is active?",
   "ar": "هل يمكنك التحقق من أن تأميني الصحي ساري المفعول؟"
  }
 },
 "dubai.ins.visitor": {
  "what": {
   "en": "I'm visiting. What should I do if I need to see a doctor?",
   "ar": "أنا في زيارة. ماذا أفعل إذا احتجت إلى مراجعة طبيب؟"
  }
 },
 "dubai.bank": {
  "when": {
   "en": "What do I need before I can open a bank account?",
   "ar": "ما الذي أحتاجه قبل أن أتمكن من فتح حساب مصرفي؟"
  },
  "choose": {
   "en": "Which type of account would suit me best?",
   "ar": "ما نوع الحساب الأنسب لي؟"
  },
  "open": {
   "en": "I'd like to open a bank account. What documents do I need?",
   "ar": "أود فتح حساب مصرفي. ما المستندات المطلوبة؟"
  },
  "safe": {
   "en": "How can I keep my bank account and card safe from fraud?",
   "ar": "كيف أحمي حسابي المصرفي وبطاقتي من الاحتيال؟"
  },
  "complain": {
   "en": "I have a problem with my account. How do I make a complaint?",
   "ar": "لدي مشكلة في حسابي. كيف أقدّم شكوى؟"
  }
 },
 "dubai.rent": {
  "student": {
   "en": "Does the university offer student housing, and how do I apply?",
   "ar": "هل توفر الجامعة سكنًا للطلاب، وكيف أتقدم بطلب؟"
  },
  "find": {
   "en": "How can I check that this property listing is genuine?",
   "ar": "كيف أتحقق من أن إعلان هذا العقار حقيقي؟"
  },
  "contract": {
   "en": "Can you help me understand this rental contract before I sign?",
   "ar": "هل يمكنك مساعدتي في فهم عقد الإيجار هذا قبل التوقيع؟"
  },
  "ejari": {
   "en": "I'd like to register my rental contract with Ejari.",
   "ar": "أود تسجيل عقد الإيجار الخاص بي في نظام إيجاري."
  },
  "renew": {
   "en": "How do I renew my rental contract, and can my rent go up?",
   "ar": "كيف أجدد عقد الإيجار، وهل يمكن أن يرتفع الإيجار؟"
  }
 },
 "dubai.workrights": {
  "contract": {
   "en": "Can you help me understand my work contract?",
   "ar": "هل يمكنك مساعدتي في فهم عقد العمل الخاص بي؟"
  },
  "pay": {
   "en": "Can you explain my rights on pay and time off?",
   "ar": "هل يمكنك توضيح حقوقي فيما يخص الراتب والإجازات؟"
  },
  "problem": {
   "en": "I have a problem at work. Where can I get help?",
   "ar": "لدي مشكلة في العمل. أين يمكنني الحصول على المساعدة؟"
  }
 },
 "dubai.studentwork": {
  "ask": {
   "en": "Am I allowed to work part-time while I study here?",
   "ar": "هل يُسمح لي بالعمل بدوام جزئي أثناء دراستي هنا؟"
  },
  "permit": {
   "en": "How do I apply for a student work permit?",
   "ar": "كيف أتقدم بطلب للحصول على تصريح عمل للطلاب؟"
  }
 },
 "dubai.school": {
  "choose": {
   "en": "Can you help me find a suitable school for my child?",
   "ar": "هل يمكنك مساعدتي في إيجاد مدرسة مناسبة لطفلي؟"
  },
  "age": {
   "en": "Which grade would my child join based on their age?",
   "ar": "في أي صف سيلتحق طفلي بناءً على عمره؟"
  },
  "apply": {
   "en": "I'd like to apply for a place for my child. What do I need?",
   "ar": "أود التقديم لطفلي للحصول على مقعد. ما الذي أحتاجه؟"
  }
 },
 "dubai.community": {
  "lonely": {
   "en": "I'd like to meet people here. Where would you suggest I start?",
   "ar": "أود التعرف على أشخاص هنا. من أين تقترح أن أبدأ؟"
  },
  "meet": {
   "en": "Are there any groups or events where I can meet people?",
   "ar": "هل توجد مجموعات أو فعاليات يمكنني فيها التعرف على الناس؟"
  },
  "volunteer": {
   "en": "How can I find volunteering opportunities here?",
   "ar": "كيف يمكنني العثور على فرص للتطوع هنا؟"
  },
  "customs": {
   "en": "What should I know about local customs, especially during Ramadan?",
   "ar": "ما الذي ينبغي أن أعرفه عن العادات المحلية، خاصة في رمضان؟"
  }
 },
 "dubai.eid.employee": {
  "permit": {
   "en": "Can you help me check the status of my work and entry permits?",
   "ar": "هل يمكنك مساعدتي في معرفة حالة تصريح العمل وتصريح الدخول؟"
  },
  "arrive": {
   "en": "I've just arrived. What are the next steps for my residence visa?",
   "ar": "وصلت للتو. ما الخطوات التالية لتأشيرة الإقامة؟"
  },
  "medical": {
   "en": "I'm here for my medical fitness test for my residence visa.",
   "ar": "جئت لإجراء فحص اللياقة الطبية من أجل تأشيرة الإقامة."
  },
  "biometrics": {
   "en": "I need help with my fingerprint appointment for my Emirates ID.",
   "ar": "أحتاج إلى مساعدة بخصوص موعد البصمات لبطاقة الهوية الإماراتية."
  },
  "issued": {
   "en": "Can you help me check the status of my residence visa?",
   "ar": "هل يمكنك مساعدتي في معرفة حالة تأشيرة الإقامة الخاصة بي؟"
  },
  "card": {
   "en": "I'd like to collect my Emirates ID card. What do I need?",
   "ar": "أود استلام بطاقة الهوية الإماراتية. ما الذي أحتاجه؟"
  },
  "next": {
   "en": "Where can I learn about my rights as an employee?",
   "ar": "أين يمكنني التعرف على حقوقي كموظف؟"
  }
 },
 "dubai.eid.family": {
  "sponsor": {
   "en": "Who can sponsor my residence visa through family?",
   "ar": "من يمكنه كفالة تأشيرة إقامتي عن طريق العائلة؟"
  },
  "docs": {
   "en": "Which documents do we need for a family residence visa?",
   "ar": "ما المستندات التي نحتاجها لتأشيرة الإقامة العائلية؟"
  },
  "permit": {
   "en": "Can you help us apply for my entry permit through my sponsor?",
   "ar": "هل يمكنك مساعدتنا في التقديم على تصريح الدخول الخاص بي عن طريق كفيلي؟"
  },
  "medical": {
   "en": "I'm here for my medical fitness test for my residence visa.",
   "ar": "جئت لإجراء فحص اللياقة الطبية من أجل تأشيرة الإقامة."
  },
  "biometrics": {
   "en": "I need help with my fingerprint appointment for my Emirates ID.",
   "ar": "أحتاج إلى مساعدة بخصوص موعد البصمات لبطاقة الهوية الإماراتية."
  },
  "issued": {
   "en": "Can you help me check the status of my residence visa?",
   "ar": "هل يمكنك مساعدتي في معرفة حالة تأشيرة الإقامة الخاصة بي؟"
  },
  "card": {
   "en": "I'd like to collect my Emirates ID card. What do I need?",
   "ar": "أود استلام بطاقة الهوية الإماراتية. ما الذي أحتاجه؟"
  }
 },
 "dubai.eid.self": {
  "routes": {
   "en": "What are my options for sponsoring my own residence visa?",
   "ar": "ما الخيارات المتاحة لي لكفالة إقامتي بنفسي؟"
  },
  "after": {
   "en": "My application was approved. What are the next steps?",
   "ar": "تمت الموافقة على طلبي. ما الخطوات التالية؟"
  }
 },
 "edinburgh.airport": {
  "choose": {
   "en": "What's the best way to get from the airport into the city?",
   "ar": "ما أفضل طريقة للوصول من المطار إلى وسط المدينة؟"
  },
  "bus": {
   "en": "Where do I catch the Airlink 100 bus into the city?",
   "ar": "من أين أركب حافلة Airlink 100 إلى وسط المدينة؟"
  },
  "tram": {
   "en": "Where do I catch the tram into the city, and how do I pay?",
   "ar": "من أين أركب الترام إلى وسط المدينة، وكيف أدفع الأجرة؟"
  },
  "taxi": {
   "en": "Where can I get a taxi from the airport?",
   "ar": "من أين يمكنني أخذ سيارة أجرة (تاكسي) من المطار؟"
  },
  "next": {
   "en": "How do I get from here to this address?",
   "ar": "كيف أصل من هنا إلى هذا العنوان؟"
  }
 },
 "edinburgh.bus": {
  "pay": {
   "en": "How do I pay for the bus or tram?",
   "ar": "كيف أدفع أجرة الحافلة أو الترام؟"
  },
  "bus": {
   "en": "Which bus do I take to get to this address?",
   "ar": "أي حافلة أركب للوصول إلى هذا العنوان؟"
  },
  "tram": {
   "en": "Which tram stop do I need, and where do I buy a ticket?",
   "ar": "أي محطة ترام أحتاجها، ومن أين أشتري التذكرة؟"
  },
  "next": {
   "en": "Is there a cheaper ticket if I travel by bus every day?",
   "ar": "هل توجد تذكرة أرخص إذا كنت أسافر بالحافلة كل يوم؟"
  }
 },
 "edinburgh.u22": {
  "who": {
   "en": "Can I get the free bus travel card for under-22s?",
   "ar": "هل يمكنني الحصول على بطاقة السفر المجاني بالحافلات لمن هم دون 22 عامًا؟"
  },
  "prepare": {
   "en": "What do I need to apply for the under-22 free bus card?",
   "ar": "ماذا أحتاج لأتقدم بطلب بطاقة الحافلات المجانية لمن هم دون 22 عامًا؟"
  },
  "apply": {
   "en": "Can you help me apply for my free bus travel card?",
   "ar": "هل يمكنك مساعدتي في التقديم على بطاقة السفر المجاني بالحافلات؟"
  },
  "use": {
   "en": "How do I use my free bus travel card on the bus?",
   "ar": "كيف أستخدم بطاقة السفر المجاني في الحافلة؟"
  }
 },
 "edinburgh.evisa": {
  "what": {
   "en": "Can you explain what an eVisa is and how I access it?",
   "ar": "هل يمكنك أن تشرح لي ما هي التأشيرة الإلكترونية eVisa وكيف أصل إليها؟"
  },
  "account": {
   "en": "Can you help me create my UKVI account for my eVisa?",
   "ar": "هل يمكنك مساعدتي في إنشاء حسابي في UKVI (هيئة التأشيرات والهجرة البريطانية) من أجل التأشيرة الإلكترونية eVisa؟"
  },
  "share": {
   "en": "I need to get a share code to prove my status. Can you help?",
   "ar": "أحتاج إلى الحصول على رمز مشاركة (share code) لإثبات وضعي. هل يمكنك مساعدتي؟"
  },
  "next": {
   "en": "What should I do if my eVisa details need updating?",
   "ar": "ماذا أفعل إذا كانت بيانات التأشيرة الإلكترونية eVisa تحتاج إلى تحديث؟"
  }
 },
 "edinburgh.gp": {
  "emergency": {
   "en": "I'm not sure if this is an emergency. Where should I go?",
   "ar": "لست متأكدًا إن كانت هذه حالة طارئة. إلى أين يجب أن أذهب؟"
  },
  "cover": {
   "en": "Am I able to use NHS services while I'm living here?",
   "ar": "هل يمكنني استخدام خدمات NHS (الخدمة الصحية الوطنية) أثناء إقامتي هنا؟"
  },
  "register": {
   "en": "I'd like to register with a GP here. What do I need to do?",
   "ar": "أريد التسجيل لدى طبيب عام GP هنا. ماذا عليّ أن أفعل؟"
  },
  "where": {
   "en": "I'm unwell. Should I see a GP, a pharmacist or go elsewhere?",
   "ar": "أنا مريض. هل يجب أن أراجع طبيبًا عامًا GP أو صيدليًا أو أذهب إلى مكان آخر؟"
  },
  "more": {
   "en": "How can I find a dentist or mental health support here?",
   "ar": "كيف يمكنني إيجاد طبيب أسنان أو دعم للصحة النفسية هنا؟"
  }
 },
 "edinburgh.bank": {
  "prepare": {
   "en": "What documents do I need to open a bank account?",
   "ar": "ما المستندات التي أحتاجها لفتح حساب مصرفي؟"
  },
  "choose": {
   "en": "Which account would suit someone who has just moved here?",
   "ar": "ما نوع الحساب المناسب لشخص انتقل إلى هنا حديثًا؟"
  },
  "open": {
   "en": "I'd like to open a bank account. Can you help me?",
   "ar": "أريد فتح حساب مصرفي. هل يمكنك مساعدتي؟"
  },
  "safe": {
   "en": "How can I keep my bank account and card safe from fraud?",
   "ar": "كيف أحمي حسابي المصرفي وبطاقتي من الاحتيال؟"
  }
 },
 "edinburgh.rent": {
  "search": {
   "en": "How can I check that this rental advert isn't a scam?",
   "ar": "كيف أتأكد أن إعلان الإيجار هذا ليس احتيالًا؟"
  },
  "check": {
   "en": "How can I check that this landlord or letting agent is registered?",
   "ar": "كيف أتأكد أن هذا المالك أو وكيل التأجير مسجَّل رسميًا؟"
  },
  "pay": {
   "en": "What fees or deposit can a landlord ask me to pay?",
   "ar": "ما الرسوم أو مبلغ التأمين الذي يحق للمالك أن يطلبه مني؟"
  },
  "rights": {
   "en": "Can you help me understand my tenancy agreement?",
   "ar": "هل يمكنك مساعدتي في فهم عقد الإيجار الخاص بي؟"
  }
 },
 "edinburgh.counciltax": {
  "what": {
   "en": "Can you explain what council tax is and whether I need to pay?",
   "ar": "هل يمكنك أن تشرح لي ما هي council tax (ضريبة البلدية) وهل يجب أن أدفعها؟"
  },
  "students": {
   "en": "I'm a student. How do I apply for a council tax exemption?",
   "ar": "أنا طالب. كيف أتقدم بطلب إعفاء من council tax (ضريبة البلدية)؟"
  },
  "tv": {
   "en": "Do I need a TV licence for what I watch?",
   "ar": "هل أحتاج إلى رخصة تلفزيون TV licence لما أشاهده؟"
  }
 },
 "edinburgh.work": {
  "hours": {
   "en": "How many hours am I allowed to work while I study?",
   "ar": "كم ساعة يُسمح لي بالعمل أثناء دراستي؟"
  },
  "cant": {
   "en": "Which kinds of work am I not allowed to do as a student?",
   "ar": "ما أنواع العمل التي لا يُسمح لي بها كطالب؟"
  },
  "prove": {
   "en": "How do I prove my right to work for this job?",
   "ar": "كيف أثبت حقي في العمل لهذه الوظيفة؟"
  },
  "nino": {
   "en": "How do I apply for a National Insurance number?",
   "ar": "كيف أتقدم بطلب للحصول على رقم التأمين الوطني National Insurance number؟"
  }
 },
 "edinburgh.sim": {
  "choose": {
   "en": "Should I get a pay-as-you-go SIM or a monthly contract?",
   "ar": "هل الأفضل أن أحصل على شريحة مسبقة الدفع (pay-as-you-go) أم عقد شهري؟"
  },
  "buy": {
   "en": "I'd like to buy a SIM card. Can you help me set it up?",
   "ar": "أريد شراء شريحة هاتف SIM. هل يمكنك مساعدتي في تفعيلها؟"
  }
 },
 "edinburgh.community": {
  "library": {
   "en": "I'd like to join the library. What do I need?",
   "ar": "أريد الاشتراك في المكتبة. ماذا أحتاج؟"
  },
  "volunteer": {
   "en": "How can I find volunteering opportunities near here?",
   "ar": "كيف يمكنني إيجاد فرص للعمل التطوعي قريبًا من هنا؟"
  }
 },
 "edinburgh.school": {
  "find": {
   "en": "Which is the catchment school for this address?",
   "ar": "ما المدرسة التابعة لمنطقة هذا العنوان (catchment school)؟"
  },
  "apply": {
   "en": "How do I apply for a school place for my child?",
   "ar": "كيف أتقدم بطلب للحصول على مقعد في المدرسة لطفلي؟"
  }
 }
};
  Object.entries(P).forEach(([jid, stages]) => { const j = DATA.journeys[jid]; if(!j) return;
    j.stages.forEach(st => { const p = stages[st.id]; if(p && p.en) st.staff = {en:p.en, ar:p.ar || ''}; }); });
})();
