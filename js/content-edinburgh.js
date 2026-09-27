/* ============================================================
   Orivia: Edinburgh / United Kingdom content
   Every fact below was checked against the official source linked
   in the journey's `sources`. Checked: 27 Sep 2026.
   ============================================================ */
(function(){
const E_CHECKED = {en:'27 Sep 2026', ar:'27 سبتمبر 2026'};
const S = (en, ar, url) => ({name:{en, ar}, url});
const ESRC = {
  airlink:   S('Lothian Buses: Airlink 100', 'Lothian Buses: حافلة Airlink 100', 'https://www.lothianbuses.com/our-services/airport-buses/'),
  fares:     S('Lothian Buses: Fares from 22 Feb 2026', 'Lothian Buses: الأجرة من 22 فبراير 2026', 'https://www.lothianbuses.com/news/2026/01/fares-revision/'),
  airportBus:S('Edinburgh Airport: Buses to the city', 'مطار إدنبرة: الحافلات إلى المدينة', 'https://www.edinburghairport.com/transport-links/buses-and-coaches/edinburgh-city-bus-links'),
  airportTaxi:S('Edinburgh Airport: Taxis', 'مطار إدنبرة: سيارات الأجرة', 'https://www.edinburghairport.com/transport-links/taxis'),
  airportTram:S('Edinburgh Airport: Trams', 'مطار إدنبرة: الترام', 'https://www.edinburghairport.com/transport-links/trams'),
  tramTickets:S('Edinburgh Trams: Ticket options', 'Edinburgh Trams: خيارات التذاكر', 'https://edinburghtrams.com/tickets/ticket-options'),
  tramFaq:   S('Edinburgh Trams: FAQs', 'Edinburgh Trams: الأسئلة الشائعة', 'https://edinburghtrams.com/faqs'),
  tramContact:S('Edinburgh Trams: Contact', 'Edinburgh Trams: اتصل بنا', 'https://edinburghtrams.com/contact/get-touch'),
  contactless:S('Lothian Buses: Contactless and fare capping', 'Lothian Buses: الدفع اللاتلامسي وسقف الأجرة', 'https://www.lothianbuses.com/contactless/'),
  visitor:   S('Lothian Buses: Visitor guide', 'Lothian Buses: دليل الزوار', 'https://www.lothianbuses.com/using-the-bus/visitor-guide/'),
  lostProp:  S('Lothian Buses: Lost property', 'Lothian Buses: المفقودات', 'https://support.lothianbuses.com/hc/en-gb/articles/10902692600733-Do-you-have-a-telephone-number-for-Lost-Property'),
  u22:       S('Transport Scotland: Under 22s free bus travel', 'Transport Scotland: السفر المجاني بالحافلات لمن دون 22 عاماً', 'https://www.transport.gov.scot/concessionary-travel/under-22s-free-bus-travel/'),
  u22guide:  S('Transport Scotland: Under 22s customer guide', 'Transport Scotland: دليل العملاء لمن دون 22 عاماً', 'https://www.transport.gov.scot/concessionary-travel/under-22s-free-bus-travel/customer-service-guide/'),
  u22apply:  S('mygov.scot: Apply for the under 22 bus pass', 'mygov.scot: التقديم على بطاقة الحافلات لمن دون 22 عاماً', 'https://www.mygov.scot/under-22-bus-pass'),
  youngScot: S('Young Scot: National Entitlement Card FAQs', 'Young Scot: أسئلة شائعة عن بطاقة الاستحقاق الوطنية', 'https://young.scot/get-informed/young-scot-national-entitlement-card-frequently-asked-questions/'),
  evisa:     S('GOV.UK: eVisas', 'GOV.UK: التأشيرات الإلكترونية', 'https://www.gov.uk/evisa'),
  evisaAccess:S('GOV.UK: Get access to your eVisa', 'GOV.UK: الوصول إلى تأشيرتك الإلكترونية', 'https://www.gov.uk/get-access-evisa'),
  shareCode: S('GOV.UK: View your eVisa and get a share code', 'GOV.UK: عرض تأشيرتك والحصول على رمز المشاركة', 'https://www.gov.uk/evisa/view-evisa-get-share-code-prove-immigration-status'),
  evisaError:S('GOV.UK: Report an error with your eVisa', 'GOV.UK: الإبلاغ عن خطأ في تأشيرتك', 'https://www.gov.uk/evisa/report-error-evisa'),
  rtwGuide:  S('Home Office: Employer’s guide to right to work checks', 'وزارة الداخلية: دليل أصحاب العمل للتحقق من حق العمل', 'https://www.gov.uk/government/publications/right-to-work-checks-employers-guide/employers-guide-to-right-to-work-checks-26-june-2025-accessible'),
  police:    S('University of Edinburgh: Police registration', 'جامعة إدنبرة: التسجيل لدى الشرطة', 'https://registryservices.ed.ac.uk/immigration/while-you-are-here/police-registration'),
  ukcisaEvisa:S('UKCISA: eVisas', 'UKCISA: التأشيرات الإلكترونية', 'https://www.ukcisa.org.uk/student-advice/visas-and-immigration/evisas/'),
  gpReg:     S('NHS inform: Registering with a GP practice', 'NHS inform: التسجيل لدى عيادة طبيب عام', 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/doctors/registering-with-a-gp-practice'),
  gpLothian: S('NHS Lothian: GP patient registration', 'NHS Lothian: تسجيل المرضى لدى الطبيب العام', 'https://services.nhslothian.scot/gps/patient-registration/'),
  uoeGp:     S('University of Edinburgh: Register with a doctor', 'جامعة إدنبرة: التسجيل لدى طبيب', 'https://edwebprofiles.ed.ac.uk/students/new-students/start-university/take-care-of-yourself/register-doctor'),
  overseas:  S('NHS inform: Healthcare for overseas visitors', 'NHS inform: الرعاية الصحية للزوار من الخارج', 'https://www.nhsinform.scot/care-support-and-rights/health-rights/access/healthcare-for-overseas-visitors'),
  nhs24:     S('NHS 24: 111', 'NHS 24: الرقم 111', 'https://www.nhs24.scot/111/'),
  miu:       S('NHS Lothian: Minor injuries units', 'NHS Lothian: وحدات الإصابات البسيطة', 'https://services.nhslothian.scot/rightcare/minor-injuries-unit/'),
  rx:        S('NHS inform: Prescription charges', 'NHS inform: رسوم الوصفات الطبية', 'https://www.nhsinform.scot/care-support-and-rights/nhs-services/pharmacy/prescription-charges-and-exemptions/'),
  pharmFirst:S('Scottish Government: NHS Pharmacy First Scotland', 'الحكومة الاسكتلندية: خدمة Pharmacy First', 'https://www.gov.scot/publications/nhs-pharmacy-first-scotland-information-patients/'),
  dentist:   S('NHS Lothian: How to register with a dentist', 'NHS Lothian: كيفية التسجيل لدى طبيب أسنان', 'https://services.nhslothian.scot/dentists/how-to-register-with-a-dentist/'),
  breathing: S('Breathing Space', 'Breathing Space', 'https://www.breathingspace.scot/need-help-now/'),
  ihs:       S('GOV.UK: Immigration health surcharge', 'GOV.UK: رسوم الصحة للهجرة', 'https://www.gov.uk/healthcare-immigration-application/how-much-pay'),
  uoeBank:   S('University of Edinburgh: Open a UK bank account', 'جامعة إدنبرة: فتح حساب بنكي بريطاني', 'https://www.ed.ac.uk/new-students/get-started/finance/open-a-uk-bank-account'),
  uoeBankLetter:S('University of Edinburgh: Bank letter', 'جامعة إدنبرة: خطاب البنك', 'https://registryservices.ed.ac.uk/order-documents/bank-letter'),
  fscs:      S('FSCS: Deposit protection limit', 'FSCS: حد حماية الودائع', 'https://www.fscs.org.uk/what-we-cover/banks-building-societies-credit-unions/deposit-limit/'),
  s159:      S('Stop Scams UK: Call 159', 'Stop Scams UK: اتصل بالرقم 159', 'https://stopscamsuk.org.uk/our-programmes/159-phone-number/'),
  reportFraud:S('Report Fraud: Should I report to Report Fraud?', 'Report Fraud: هل أبلغ Report Fraud؟', 'https://www.reportfraud.police.uk/should-i-report-to-report-fraud/'),
  fos:       S('Financial Ombudsman Service: Time limits', 'Financial Ombudsman Service: المهل الزمنية', 'https://www.financial-ombudsman.org.uk/consumers/expect/time-limits'),
  rentPay:   S('mygov.scot: Paying rent and a deposit', 'mygov.scot: دفع الإيجار والتأمين', 'https://www.mygov.scot/rent-private-landlord/paying-rent-and-deposit'),
  deposits:  S('mygov.scot: Tenancy deposit protection', 'mygov.scot: حماية مبلغ التأمين', 'https://www.mygov.scot/tenant-deposits/protection'),
  landlordReg:S('Scottish Landlord Register', 'سجل الملاك في اسكتلندا', 'https://landlordregistrationscotland.gov.uk/'),
  agentReg:  S('mygov.scot: Letting agent registration', 'mygov.scot: تسجيل وكلاء التأجير', 'https://www.mygov.scot/letting-agent-registration-tenants'),
  notice:    S('mygov.scot: Giving notice to your landlord', 'mygov.scot: إبلاغ المالك بإنهاء الإيجار', 'https://www.mygov.scot/tenant-give-notice'),
  hmo:       S('mygov.scot: HMO licence', 'mygov.scot: ترخيص السكن المشترك', 'https://www.mygov.scot/landlord-hmo-licence'),
  rentScams: S('Scotland.org (Citizens Advice Scotland): Avoiding rental scams', 'Scotland.org (Citizens Advice Scotland): تجنّب احتيال الإيجار', 'https://www.scotland.org/live-in-scotland/avoiding-rental-scams'),
  shelter:   S('Shelter Scotland: Get help', 'Shelter Scotland: احصل على مساعدة', 'https://scotland.shelter.org.uk/get_help'),
  cas:       S('Citizens Advice Scotland: Contact us', 'Citizens Advice Scotland: اتصل بنا', 'https://www.citizensadvice.org.uk/scotland/about-us/contact-us/'),
  ctax:      S('City of Edinburgh Council: Student council tax discount', 'مجلس مدينة إدنبرة: إعفاء الطلاب من ضريبة المجلس', 'https://www.edinburgh.gov.uk/discounts-exemptions/student-council-tax-discount'),
  uoeCtax:   S('University of Edinburgh: Council tax', 'جامعة إدنبرة: ضريبة المجلس', 'https://www.ed.ac.uk/new-students/get-started/moving-to-edinburgh/council-tax'),
  tvl:       S('TV Licensing: Check if you need one', 'TV Licensing: هل تحتاج إلى رخصة؟', 'https://www.tvlicensing.co.uk/check-if-you-need-one'),
  tvlFee:    S('GOV.UK: TV licence fee for 2026/27', 'GOV.UK: رسوم رخصة التلفزيون 2026/27', 'https://www.gov.uk/government/news/cost-of-tv-licence-fee-set-for-202627'),
  studentWork:S('UKCISA: Working during your studies', 'UKCISA: العمل أثناء الدراسة', 'https://www.ukcisa.org.uk/student-advice/working/student-work/'),
  studentVisa:S('GOV.UK: Student visa', 'GOV.UK: تأشيرة الطالب', 'https://www.gov.uk/student-visa'),
  nino:      S('GOV.UK: Apply for a National Insurance number', 'GOV.UK: التقديم على رقم التأمين الوطني', 'https://www.gov.uk/apply-national-insurance-number'),
  rtwCode:   S('GOV.UK: Prove your right to work', 'GOV.UK: إثبات حقك في العمل', 'https://www.gov.uk/prove-right-to-work/get-a-share-code-online'),
  ofcom:     S('Ofcom: Choosing the right mobile package', 'Ofcom: اختيار باقة الهاتف المناسبة', 'https://www.ofcom.org.uk/phones-and-broadband/saving-money/choosing-the-right-mobile-package'),
  library:   S('City of Edinburgh Council: Join the library', 'مجلس مدينة إدنبرة: الانضمام إلى المكتبة', 'https://www.edinburgh.gov.uk/libraries/join-library'),
  volunteer: S('Volunteer Edinburgh: How to volunteer', 'Volunteer Edinburgh: كيف تتطوع', 'https://www.volunteeredinburgh.org.uk/volunteer/how-to-volunteer/'),
  catchment: S('City of Edinburgh Council: Find your catchment school', 'مجلس مدينة إدنبرة: اعثر على مدرسة منطقتك', 'https://www.edinburgh.gov.uk/school-places/find-catchment-school'),
  schoolApply:S('City of Edinburgh Council: Apply for a school place', 'مجلس مدينة إدنبرة: التقديم على مقعد مدرسي', 'https://www.edinburgh.gov.uk/school-places/apply-school-place'),
  placing:   S('City of Edinburgh Council: School placing requests', 'مجلس مدينة إدنبرة: طلبات النقل إلى مدرسة أخرى', 'https://www.edinburgh.gov.uk/school-places/school-placing-requests'),
};

const base = o => Object.assign({city:'edinburgh', checked:E_CHECKED, trust:{reviewed:false, tested:0}}, o);
const ELSE = (en, ar) => ({id:'else', q:{en:'Something else', ar:'مشكلة أخرى'}, a:{en, ar}});
const STAFF = {id:'staff', q:{en:'I don’t understand what they said', ar:'لم أفهم ما قالوه'}, a:{en:'Show them this card. It asks them to slow down or write it down.', ar:'اعرض عليهم هذه البطاقة، فهي تطلب منهم التحدث ببطء أو الكتابة.'}, phraseText:{en:'I’m new here and English isn’t my first language. Could you please say that more slowly, or write it down?', ar:'أنا جديد هنا والإنجليزية ليست لغتي الأولى. هل يمكنك أن تقول ذلك ببطء أكثر، أو تكتبه لي من فضلك؟'}};
const TRANSPORT_STUCK = {cards:[
  {title:{en:'Ask the driver or tram staff', ar:'اسأل السائق أو موظفي الترام'}, body:{en:'Bus drivers and tram ticket staff help lost passengers every day. Show them the card below.', ar:'يساعد سائقو الحافلات وموظفو تذاكر الترام الركاب التائهين كل يوم. اعرض عليهم البطاقة أدناه.'}},
  {title:{en:'Edinburgh Trams', ar:'Edinburgh Trams'}, phone:'0131 338 5780', body:{en:'Mon–Sat 7am–7pm, Sun 11am–7pm. Also for tram lost property.', ar:'من الاثنين إلى السبت 7 صباحاً حتى 7 مساءً، والأحد 11 صباحاً حتى 7 مساءً. وللمفقودات في الترام أيضاً.'}},
  {title:{en:'Bus & Tram app', ar:'تطبيق Bus & Tram'}, body:{en:'Live times for every Lothian bus and tram. Type where you want to go and it shows you which bus to take.', ar:'مواعيد مباشرة لكل حافلات Lothian والترام. اكتب وجهتك ويعرض لك الحافلة المناسبة.'}},
]};

/* ---------- 1. Airport to the city ---------- */
DATA.journeys['edinburgh.airport'] = base({
  need:'move', icon:'move',
  title:{en:'Get from the airport to the city', ar:'الوصول من المطار إلى المدينة'},
  doneTitle:{en:'You’ve made it into Edinburgh.', ar:'لقد وصلت إلى إدنبرة.'},
  sources:[ESRC.airlink, ESRC.airportBus, ESRC.fares, ESRC.tramTickets, ESRC.tramFaq, ESRC.airportTram, ESRC.airportTaxi],
  stuck:TRANSPORT_STUCK,
  phrase:{en:'I’ve just arrived. Which bus or tram goes to the city centre?', ar:'وصلت للتو. أي حافلة أو ترام يذهب إلى وسط المدينة؟'},
  stages:[
    {id:'choose', level:'source', label:{en:'Choose', ar:'اختر'}, title:{en:'Three ways into the city', ar:'ثلاث طرق إلى المدينة'}, help:['staff','else'],
     blocks:[
      {t:'cards', v:[
        {color:'#7A2E8C', rec:true, name:{en:'Airlink 100 bus', ar:'حافلة Airlink 100'}, desc:{en:'Runs 24 hours a day to Waverley Bridge in the centre, in about 30 minutes. £6.00 single, £8.50 open return.', ar:'تعمل على مدار 24 ساعة إلى Waverley Bridge في وسط المدينة، في نحو 30 دقيقة. 6.00 جنيهات للذهاب، و8.50 جنيهات للذهاب والعودة المفتوحة.'}},
        {color:'#B32424', name:{en:'Tram', ar:'الترام'}, desc:{en:'£7.90 single from the airport. You must have a ticket, or tap your card, before you get on.', ar:'7.90 جنيهات للرحلة من المطار. يجب أن تكون معك تذكرة، أو أن تمرر بطاقتك، قبل الصعود.'}},
        {color:'#1C2733', name:{en:'Taxi', ar:'سيارة أجرة'}, desc:{en:'Easiest with heavy bags. The official rank is outside the terminal.', ar:'الأسهل إن كانت حقائبك ثقيلة. الموقف الرسمي خارج مبنى المطار.'}},
      ]},
      {t:'phrase'},
     ]},
    {id:'bus', level:'source', label:{en:'By bus', ar:'بالحافلة'}, title:{en:'Take the Airlink 100', ar:'اركب حافلة Airlink 100'}, help:['nochange','wrongstop','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Walk out of arrivals onto the plaza. Airlink leaves from Stop A, next to the plaza.', ar:'اخرج من صالة الوصول إلى الساحة الخارجية. تنطلق حافلة Airlink من الموقف A بجانب الساحة.'},
        {en:'Buses come up to every 10 minutes during the day, and up to every 20 minutes at night.', ar:'تأتي الحافلات كل 10 دقائق تقريباً في النهار، وكل 20 دقيقة تقريباً في الليل.'},
        {en:'Tell the driver where you’re going, then tap your bank card or phone on the reader. You can also pay cash, or buy a ticket in the Bus & Tram app.', ar:'أخبر السائق بوجهتك، ثم مرّر بطاقتك البنكية أو هاتفك على القارئ. يمكنك أيضاً الدفع نقداً، أو شراء تذكرة من تطبيق Bus & Tram.'},
        {en:'The last stop is Waverley Bridge, next to Waverley train station.', ar:'آخر محطة هي Waverley Bridge، بجانب محطة قطارات Waverley.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Paying cash? Have the exact amount ready. Drivers can’t give change.', ar:'ستدفع نقداً؟ جهّز المبلغ بالضبط، فالسائق لا يعطي باقي النقود.'}},
     ]},
    {id:'tram', level:'source', label:{en:'By tram', ar:'بالترام'}, title:{en:'Take the tram', ar:'اركب الترام'}, help:['tramfine','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'The tram stop is right outside the terminal, next to the plaza and the big Edinburgh sign.', ar:'محطة الترام خارج مبنى المطار مباشرة، بجانب الساحة ولافتة Edinburgh الكبيرة.'},
        {en:'Before you get on, buy a ticket at the machine on the platform or in the Bus & Tram app. Or tap your bank card on the platform reader.', ar:'قبل الصعود، اشترِ تذكرة من الجهاز على الرصيف أو من تطبيق Bus & Tram، أو مرّر بطاقتك البنكية على القارئ الموجود على الرصيف.'},
        {en:'If you tapped your card, tap it again on the platform reader when you get off.', ar:'إذا مرّرت بطاقتك، مرّرها مرة أخرى على قارئ الرصيف عند النزول.'},
      ]},
      {t:'tip', label:'important', v:{en:'Getting on without a ticket, or forgetting to tap on, costs £10.', ar:'الصعود بلا تذكرة، أو نسيان تمرير البطاقة عند الصعود، يكلّفك 10 جنيهات.'}},
     ]},
    {id:'taxi', level:'source', label:{en:'By taxi', ar:'بسيارة أجرة'}, title:{en:'Take a taxi or ride-hailing car', ar:'اركب سيارة أجرة أو سيارة عبر التطبيق'}, help:['staff','else'],
     blocks:[
      {t:'list', v:[
        {en:'Taxi rank: cross the plaza past the big Edinburgh sign and follow the taxi signs. The airport’s official taxi company is Capital Cars.', ar:'موقف سيارات الأجرة: اعبر الساحة مروراً بلافتة Edinburgh الكبيرة واتبع لافتات التاكسي. شركة التاكسي الرسمية في المطار هي Capital Cars.'},
        {en:'Booked a ride in an app? Pick-up is on the ground floor of the multi-storey car park, which charges drivers, or in a free zone in the Long Stay car park, about a 10-minute walk.', ar:'حجزت رحلة عبر تطبيق؟ نقطة الالتقاء في الطابق الأرضي من موقف السيارات متعدد الطوابق، وفيه رسوم على السائق، أو في منطقة مجانية في موقف Long Stay، على بُعد 10 دقائق مشياً تقريباً.'},
      ]},
     ]},
    {id:'next', label:{en:'What’s next', ar:'ما التالي'}, title:{en:'Once you’re in the city', ar:'بعد وصولك إلى المدينة'},
     blocks:[
      {t:'list', v:[
        {en:'Lothian buses cover the whole city. A single fare is £2.40, and tapping the same card all day never costs more than £5.70.', ar:'تغطي حافلات Lothian المدينة كلها. أجرة الرحلة 2.40 جنيه، واستخدام البطاقة نفسها طوال اليوم لا يكلّفك أكثر من 5.70 جنيهات.'},
        {en:'Aged 21 or under and living in Scotland? You can travel by bus for free.', ar:'عمرك 21 عاماً أو أقل وتعيش في اسكتلندا؟ يمكنك ركوب الحافلات مجاناً.'},
      ]},
      {t:'journeyLink', journey:'edinburgh.bus', v:{en:'Start using buses and trams', ar:'ابدأ باستخدام الحافلات والترام'}},
     ]},
  ],
  problems:[
    {id:'nochange', q:{en:'I only have a large note', ar:'معي ورقة نقدية كبيرة فقط'}, a:{en:'Drivers can’t give change. Pay by bank card or phone instead, or buy a ticket in the Bus & Tram app. Shops in the terminal can also break a note.', ar:'لا يعطي السائق باقي النقود. ادفع بالبطاقة البنكية أو الهاتف بدلاً من ذلك، أو اشترِ تذكرة من تطبيق Bus & Tram. ويمكن لمتاجر المطار أيضاً صرف الورقة النقدية.'}},
    {id:'wrongstop', q:{en:'I don’t know where to get off', ar:'لا أعرف أين أنزل'}, a:{en:'Airlink ends at Waverley Bridge, so you can stay on to the end. For other stops, open the Bus & Tram app to follow the route, or ask the driver to tell you when you reach your stop.', ar:'تنتهي رحلة Airlink عند Waverley Bridge، فيمكنك البقاء حتى آخر محطة. ولمحطات أخرى، افتح تطبيق Bus & Tram لمتابعة المسار، أو اطلب من السائق أن ينبّهك عند وصولك إلى محطتك.'}},
    {id:'tramfine', q:{en:'I was charged £10 on the tram', ar:'دفعت 10 جنيهات في الترام'}, a:{en:'That is the charge for boarding without a ticket or without tapping on. If you think it’s wrong, contact Edinburgh Trams on 0131 338 5780 with the time and the stop.', ar:'هذه غرامة الصعود دون تذكرة أو دون تمرير البطاقة. إذا كنت تظنها خاطئة، اتصل بـ Edinburgh Trams على الرقم 0131 338 5780 مع ذكر الوقت والمحطة.'}},
    STAFF,
    ELSE('Ask at the airport information desk in arrivals, or call Edinburgh Trams on 0131 338 5780 for tram questions.', 'اسأل في مكتب الاستعلامات في صالة الوصول، أو اتصل بـ Edinburgh Trams على الرقم 0131 338 5780 لأسئلة الترام.'),
  ],
  after:[{journey:'edinburgh.bus', name:{en:'Start using buses and trams', ar:'ابدأ باستخدام الحافلات والترام'}}, {journey:'edinburgh.sim', name:{en:'Get a UK SIM card', ar:'احصل على شريحة هاتف بريطانية'}}],
});

/* ---------- 2. Buses and trams in the city ---------- */
DATA.journeys['edinburgh.bus'] = base({
  need:'move', icon:'move',
  title:{en:'Start using buses and trams', ar:'البدء باستخدام الحافلات والترام'},
  doneTitle:{en:'You’re ready to get around Edinburgh.', ar:'أنت جاهز للتنقل في إدنبرة.'},
  sources:[ESRC.fares, ESRC.contactless, ESRC.visitor, ESRC.tramFaq, ESRC.tramContact, ESRC.lostProp],
  stuck:TRANSPORT_STUCK,
  phrase:{en:'I’m new here. Does this bus go to this address?', ar:'أنا جديد هنا. هل تذهب هذه الحافلة إلى هذا العنوان؟'},
  stages:[
    {id:'pay', level:'source', label:{en:'Paying', ar:'الدفع'}, title:{en:'How to pay', ar:'كيف تدفع'}, help:['cap','nochange','else'],
     blocks:[
      {t:'p', v:{en:'Most people just tap a bank card or phone. There’s no card to buy first.', ar:'معظم الناس يمرّرون بطاقتهم البنكية أو هاتفهم فقط، ولا حاجة لشراء بطاقة مسبقاً.'}},
      {t:'cards', v:[
        {color:'#7A2E8C', rec:true, name:{en:'Tap your bank card or phone', ar:'مرّر بطاقتك البنكية أو هاتفك'}, desc:{en:'£2.40 a journey. Use the same card all day and you’ll never pay more than £5.70 a day, or £26.50 from Monday to Sunday.', ar:'2.40 جنيه للرحلة. استخدم البطاقة نفسها طوال اليوم ولن تدفع أكثر من 5.70 جنيهات يومياً، أو 26.50 جنيهاً من الاثنين إلى الأحد.'}},
        {color:'#2F6DB5', name:{en:'Bus & Tram app', ar:'تطبيق Bus & Tram'}, desc:{en:'Buy tickets on your phone and see live bus times.', ar:'اشترِ التذاكر من هاتفك وشاهد مواعيد الحافلات مباشرة.'}},
        {color:'#B9C0C7', name:{en:'Cash', ar:'نقداً'}, desc:{en:'Exact money only. Drivers can’t give change.', ar:'بالمبلغ الدقيق فقط، فالسائق لا يعطي باقي النقود.'}},
        {color:'#F2B90F', name:{en:'Ridacard', ar:'بطاقة Ridacard'}, desc:{en:'A season ticket for regular travel: £26.50 a week or £80 for 4 weeks.', ar:'اشتراك للتنقل المنتظم: 26.50 جنيهاً للأسبوع أو 80 جنيهاً لأربعة أسابيع.'}},
      ]},
      {t:'tip', label:'tip', v:{en:'21 or under and living in Scotland? Buses are free with a Young Scot card.', ar:'عمرك 21 عاماً أو أقل وتعيش في اسكتلندا؟ الحافلات مجانية ببطاقة Young Scot.'}},
      {t:'journeyLink', journey:'edinburgh.u22', v:{en:'Get free bus travel if you’re under 22', ar:'احصل على التنقل المجاني بالحافلات إن كان عمرك دون 22 عاماً'}},
     ]},
    {id:'bus', level:'source', label:{en:'By bus', ar:'بالحافلة'}, title:{en:'Riding the bus', ar:'ركوب الحافلة'}, help:['wrongbus','missed','nochange','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'At the stop, check the bus number and destination on the front of the bus.', ar:'في الموقف، تحقّق من رقم الحافلة ووجهتها المكتوبين على مقدّمتها.'},
        {en:'Wave to the driver as the bus comes, so they know to stop.', ar:'لوّح للسائق عند اقتراب الحافلة ليعرف أن عليه التوقف.'},
        {en:'Get on at the front and tap your card or phone once. You don’t tap when you get off.', ar:'اصعد من الباب الأمامي ومرّر بطاقتك أو هاتفك مرة واحدة. لا تمرّرها عند النزول.'},
        {en:'Press the stop button in good time before your stop.', ar:'اضغط زر التوقف قبل محطتك بوقت كافٍ.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Night buses run from midnight to 4:30am. A night single is £3.50.', ar:'تعمل الحافلات الليلية من منتصف الليل حتى 4:30 صباحاً، وأجرة الرحلة الليلية 3.50 جنيهات.'}},
      {t:'phrase'},
     ]},
    {id:'tram', level:'source', label:{en:'By tram', ar:'بالترام'}, title:{en:'Riding the tram', ar:'ركوب الترام'}, help:['tramfine','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Buy a ticket at the platform machine or in the app, or tap your card on the platform reader, before you get on.', ar:'اشترِ تذكرة من جهاز الرصيف أو من التطبيق، أو مرّر بطاقتك على قارئ الرصيف، قبل الصعود.'},
        {en:'On the tram, you tap on AND off. Tap the platform reader again when you get off.', ar:'في الترام، تمرّر البطاقة عند الصعود وعند النزول. مرّرها على قارئ الرصيف مرة أخرى عند النزول.'},
      ]},
      {t:'tip', label:'important', v:{en:'No ticket, or forgot to tap on? That’s a £10 fare. Forget to tap off, and you may be charged the airport fare.', ar:'بلا تذكرة أو نسيت التمرير عند الصعود؟ الأجرة حينها 10 جنيهات. وإذا نسيت التمرير عند النزول، قد تُحتسب عليك أجرة المطار.'}},
     ]},
    {id:'next', label:{en:'What’s next', ar:'ما التالي'}, title:{en:'Good to know', ar:'من المفيد أن تعرف'},
     blocks:[
      {t:'list', v:[
        {en:'Lost something on a bus? Lothian only takes lost property reports through its online form. For trams, call 0131 338 5780.', ar:'أضعت شيئاً في الحافلة؟ تستقبل Lothian بلاغات المفقودات عبر النموذج الإلكتروني فقط. أما للترام، فاتصل بالرقم 0131 338 5780.'},
        {en:'You can check what you were charged in the last 28 days at lothian.cloudfare.co.uk.', ar:'يمكنك مراجعة ما دفعته خلال آخر 28 يوماً على موقع lothian.cloudfare.co.uk.'},
      ]},
     ]},
  ],
  problems:[
    {id:'wrongbus', q:{en:'I got on the wrong bus', ar:'ركبت الحافلة الخطأ'},
     guide:{
      calm:{en:'It’s OK. This happens to everyone, and buses stop often. Let’s fix it together.', ar:'لا بأس. هذا يحدث للجميع، والحافلات تتوقف كثيراً. لنصلح الأمر معاً.'},
      steps:[
        {title:{en:'Press the stop button', ar:'اضغط زر التوقف'}, body:{en:'Press the button and get off at the next stop. There’s no need to rush or explain.', ar:'اضغط الزر وانزل في الموقف التالي. لا داعي للاستعجال أو الشرح.'}},
        {title:{en:'Find out where you are', ar:'اعرف أين أنت'}, body:{en:'The stop name is on the sign at the bus stop. Open the Bus & Tram app or a map on your phone to see it.', ar:'اسم الموقف مكتوب على لافتة موقف الحافلات. افتح تطبيق Bus & Tram أو الخريطة في هاتفك لتراه.'}},
        {title:{en:'Find the right bus', ar:'اعثر على الحافلة الصحيحة'}, body:{en:'Type where you want to go in the app. It tells you which bus to take and which stop to wait at. It’s often across the road, going the other way.', ar:'اكتب وجهتك في التطبيق، وسيخبرك بالحافلة المناسبة والموقف الذي تنتظر فيه. غالباً يكون في الجهة المقابلة من الشارع، بالاتجاه المعاكس.'}},
        {title:{en:'Tap the same card again', ar:'مرّر البطاقة نفسها مرة أخرى'}, body:{en:'A new bus is a new fare, but if you keep using the same card or phone, the daily cap means you won’t pay more than £5.70 today.', ar:'الحافلة الجديدة تعني أجرة جديدة، لكن إذا واصلت استخدام البطاقة أو الهاتف نفسه، فلن تدفع أكثر من 5.70 جنيهات اليوم بفضل السقف اليومي.'}},
      ]
     },
     stuckPhrase:{en:s=>`I took the wrong bus. How do I get to ${s||'this place'}?`, ar:s=>`ركبت الحافلة الخطأ. كيف أصل إلى ${s?'⁨'+s+'⁩':'هذا المكان'}؟`}
    },
    {id:'missed', q:{en:'I missed my stop', ar:'فاتتني محطتي'}, a:{en:'Press the stop button and get off at the next stop. Then walk back, or cross the road and catch a bus going the other way. The Bus & Tram app shows the way.', ar:'اضغط زر التوقف وانزل في الموقف التالي. ثم عد مشياً، أو اعبر الشارع واركب حافلة بالاتجاه المعاكس. تطبيق Bus & Tram يرشدك.'}},
    {id:'cap', q:{en:'I paid more than £5.70 today', ar:'دفعت أكثر من 5.70 جنيهات اليوم'}, a:{en:'The cap only works if you tap the same card or the same phone every time. Paper tickets don’t count. Check your journeys at lothian.cloudfare.co.uk and contact Lothian through its online help form if something looks wrong.', ar:'يعمل السقف فقط إذا مرّرت البطاقة نفسها أو الهاتف نفسه في كل مرة، والتذاكر الورقية لا تُحتسب. راجع رحلاتك على lothian.cloudfare.co.uk وتواصل مع Lothian عبر نموذج المساعدة الإلكتروني إذا بدا شيء خاطئاً.'}},
    {id:'nochange', q:{en:'I don’t have the exact money', ar:'ليس معي المبلغ الدقيق'}, a:{en:'Drivers can’t give change. Tap a bank card or phone, or buy a ticket in the Bus & Tram app.', ar:'لا يعطي السائق باقي النقود. مرّر بطاقتك البنكية أو هاتفك، أو اشترِ تذكرة من تطبيق Bus & Tram.'}},
    {id:'tramfine', q:{en:'I was charged £10 on the tram', ar:'دفعت 10 جنيهات في الترام'}, a:{en:'That is the fare for boarding without a ticket or without tapping on. If you think it’s wrong, call Edinburgh Trams on 0131 338 5780.', ar:'هذه أجرة الصعود دون تذكرة أو دون تمرير البطاقة. إذا كنت تظنها خاطئة، اتصل بـ Edinburgh Trams على الرقم 0131 338 5780.'}},
    STAFF,
    ELSE('For buses, use the Lothian Buses online help form. For trams, call 0131 338 5780.', 'للحافلات، استخدم نموذج المساعدة الإلكتروني لدى Lothian Buses. وللترام، اتصل بالرقم 0131 338 5780.'),
  ],
  after:[{journey:'edinburgh.u22', name:{en:'Free bus travel if you’re under 22', ar:'التنقل المجاني بالحافلات لمن دون 22 عاماً'}}, {journey:'edinburgh.gp', name:{en:'Register with a doctor', ar:'التسجيل لدى طبيب'}}],
});

/* ---------- 3. Free bus travel for under 22s ---------- */
DATA.journeys['edinburgh.u22'] = base({
  need:'move', icon:'move',
  title:{en:'Free bus travel if you’re under 22', ar:'التنقل المجاني بالحافلات لمن دون 22 عاماً'},
  doneTitle:{en:'Buses are free for you now.', ar:'أصبحت الحافلات مجانية لك الآن.'},
  sources:[ESRC.u22, ESRC.u22guide, ESRC.u22apply, ESRC.youngScot, ESRC.tramFaq],
  stuck:{cards:[
    {title:{en:'City of Edinburgh Council', ar:'مجلس مدينة إدنبرة'}, body:{en:'You can apply through the council instead of online. Councils accept a wider range of documents.', ar:'يمكنك التقديم عبر المجلس بدلاً من الإنترنت، فالمجالس تقبل مستندات أكثر تنوعاً.'}},
    {title:{en:'Your university’s student services', ar:'خدمات الطلاب في جامعتك'}, body:{en:'They help students with proof of address and can tell you what others have used.', ar:'يساعدون الطلاب في إثبات العنوان، ويمكنهم إخبارك بما استخدمه غيرك.'}},
  ]},
  stages:[
    {id:'who', level:'source', label:{en:'Who', ar:'من يحق له'}, title:{en:'Can you get it?', ar:'هل يحق لك؟'}, help:['intl','else'],
     blocks:[
      {t:'list', v:[
        {en:'You’re aged 5 to 21.', ar:'عمرك بين 5 و21 عاماً.'},
        {en:'You live in Scotland for at least 6 months of the year.', ar:'تعيش في اسكتلندا 6 أشهر على الأقل من السنة.'},
      ]},
      {t:'tip', label:'important', v:{en:'You can only apply once you’ve arrived. Applications made before you move can’t be held.', ar:'لا يمكنك التقديم إلا بعد وصولك، ولا تُحفظ الطلبات المقدَّمة قبل انتقالك.'}},
     ]},
    {id:'prepare', level:'source', label:{en:'Prepare', ar:'استعد'}, title:{en:'What you need', ar:'ما تحتاجه'}, help:['noaddress','else'],
     blocks:[
      {t:'list', v:[
        {en:'A mygov.scot myaccount login (you can make one when you apply).', ar:'حساب myaccount على mygov.scot (يمكنك إنشاؤه عند التقديم).'},
        {en:'A recent head-and-shoulders photo, and a phone or computer with a camera.', ar:'صورة حديثة للرأس والكتفين، وهاتف أو حاسوب بكاميرا.'},
        {en:'Proof of identity, such as your passport.', ar:'إثبات هوية، مثل جواز سفرك.'},
        {en:'Proof of your Scottish address, such as a council tax letter, bank statement or utility bill.', ar:'إثبات عنوانك في اسكتلندا، مثل رسالة ضريبة المجلس أو كشف حساب بنكي أو فاتورة خدمات.'},
      ]},
     ]},
    {id:'apply', level:'source', label:{en:'Apply', ar:'قدّم'}, title:{en:'Apply for your card', ar:'قدّم على بطاقتك'}, help:['noaddress','slow','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Apply online at getyournec.scot, or through the City of Edinburgh Council.', ar:'قدّم عبر الإنترنت على getyournec.scot، أو عبر مجلس مدينة إدنبرة.'},
        {en:'Upload your photo and documents.', ar:'ارفع صورتك ومستنداتك.'},
        {en:'Your Young Scot National Entitlement Card arrives by post: usually within 10 working days online, or at least 2 weeks through the council.', ar:'تصلك بطاقة Young Scot الوطنية بالبريد: عادةً خلال 10 أيام عمل عند التقديم عبر الإنترنت، أو أسبوعين على الأقل عبر المجلس.'},
      ]},
      {t:'link', url:'https://www.mygov.scot/under-22-bus-pass', v:{en:'Apply on mygov.scot', ar:'قدّم عبر mygov.scot'}},
     ]},
    {id:'use', level:'source', label:{en:'Use it', ar:'استخدمها'}, title:{en:'Using your card', ar:'استخدام بطاقتك'}, help:['tram','else'],
     blocks:[
      {t:'list', v:[
        {en:'Tap your card on the reader when you get on almost any local bus in Scotland, including Lothian buses.', ar:'مرّر بطاقتك على القارئ عند صعود أي حافلة محلية تقريباً في اسكتلندا، بما فيها حافلات Lothian.'},
        {en:'It doesn’t cover trams, sightseeing buses or premium-fare buses.', ar:'لا تشمل الترام ولا الحافلات السياحية ولا الحافلات ذات الأجرة المميزة.'},
      ]},
     ]},
  ],
  problems:[
    {id:'intl', q:{en:'I’m an international student. Can I get it?', ar:'أنا طالب دولي. هل يحق لي؟'}, a:{en:'The rules are about where you live: if you’re 21 or under and living in Scotland for at least 6 months of the year, you meet them. The official pages don’t mention international students separately, so if you’re unsure, ask the council or your university before you apply.', ar:'تعتمد الشروط على مكان سكنك: إذا كان عمرك 21 عاماً أو أقل وتعيش في اسكتلندا 6 أشهر على الأقل من السنة، فأنت تستوفيها. لا تذكر الصفحات الرسمية الطلاب الدوليين بشكل منفصل، فإن لم تكن متأكداً، اسأل المجلس أو جامعتك قبل التقديم.'}},
    {id:'noaddress', q:{en:'I don’t have proof of address yet', ar:'ليس لدي إثبات عنوان بعد'}, a:{en:'Apply through the council instead: it accepts more types of document than the online form. Your university can often give you a letter confirming your address.', ar:'قدّم عبر المجلس بدلاً من ذلك، فهو يقبل أنواعاً أكثر من المستندات مقارنةً بالنموذج الإلكتروني. وغالباً يمكن لجامعتك أن تعطيك خطاباً يؤكد عنوانك.'}},
    {id:'slow', q:{en:'My card hasn’t arrived', ar:'لم تصلني البطاقة'}, a:{en:'Online applications take up to 10 working days and council ones at least 2 weeks. After that, contact whoever you applied through. For questions about the scheme, email concessionarytravel@transport.gov.scot.', ar:'تستغرق الطلبات الإلكترونية حتى 10 أيام عمل، وطلبات المجلس أسبوعين على الأقل. بعد ذلك، تواصل مع الجهة التي قدّمت عبرها. ولأسئلة عن البرنامج، راسل concessionarytravel@transport.gov.scot.'}},
    {id:'tram', q:{en:'The tram won’t accept my card', ar:'الترام لا يقبل بطاقتي'}, a:{en:'That’s expected: the under-22 scheme covers buses, not trams. Buy a tram ticket or tap a bank card, or take a bus instead.', ar:'هذا متوقع: برنامج من هم دون 22 عاماً يشمل الحافلات لا الترام. اشترِ تذكرة ترام أو مرّر بطاقتك البنكية، أو اركب حافلة بدلاً منه.'}},
    ELSE('Email concessionarytravel@transport.gov.scot, or ask the City of Edinburgh Council.', 'راسل concessionarytravel@transport.gov.scot، أو اسأل مجلس مدينة إدنبرة.'),
  ],
  after:[{journey:'edinburgh.bus', name:{en:'Start using buses and trams', ar:'ابدأ باستخدام الحافلات والترام'}}],
});

/* ---------- 4. eVisa and share codes ---------- */
DATA.journeys['edinburgh.evisa'] = base({
  need:'docs', icon:'docs',
  title:{en:'Set up your eVisa and share codes', ar:'إعداد تأشيرتك الإلكترونية ورموز المشاركة'},
  doneTitle:{en:'You can prove your status whenever you need to.', ar:'يمكنك الآن إثبات وضعك متى احتجت إلى ذلك.'},
  sources:[ESRC.evisa, ESRC.evisaAccess, ESRC.shareCode, ESRC.evisaError, ESRC.rtwGuide, ESRC.ukcisaEvisa, ESRC.police],
  stuck:{cards:[
    {title:{en:'UKVI Resolution Centre', ar:'مركز حلول UKVI'}, phone:'0300 790 6268', body:{en:'For problems with your UKVI account or eVisa. Opening hours vary, so check GOV.UK before you call.', ar:'لمشكلات حسابك في UKVI أو تأشيرتك الإلكترونية. تختلف ساعات العمل، فراجع GOV.UK قبل الاتصال.'}},
    {title:{en:'Your university’s immigration or visa team', ar:'فريق الهجرة أو التأشيرات في جامعتك'}, body:{en:'Free advice for students, and they know the system well.', ar:'استشارة مجانية للطلاب، ويعرفون النظام جيداً.'}},
  ]},
  stages:[
    {id:'what', level:'source', label:{en:'Understand', ar:'افهم'}, title:{en:'What an eVisa is', ar:'ما هي التأشيرة الإلكترونية'}, help:['police','else'],
     blocks:[
      {t:'p', v:{en:'The UK no longer gives most people a visa card. Instead, your immigration status is an eVisa: an online record of who you are, how long you can stay, and whether you can work.', ar:'لم تعد المملكة المتحدة تصدر بطاقة تأشيرة لمعظم الناس. بدلاً من ذلك، وضعك كمهاجر هو تأشيرة إلكترونية: سجلّ على الإنترنت يبيّن هويتك ومدة إقامتك وهل يحق لك العمل.'}},
      {t:'list', v:[
        {en:'You see it by signing in to your UKVI account.', ar:'تطّلع عليها بتسجيل الدخول إلى حسابك في UKVI.'},
        {en:'Landlords, employers and banks may ask you to prove your status with a share code.', ar:'قد يطلب منك الملاك وأصحاب العمل والبنوك إثبات وضعك برمز مشاركة.'},
      ]},
     ]},
    {id:'account', level:'source', label:{en:'Account', ar:'الحساب'}, title:{en:'Create your UKVI account', ar:'أنشئ حسابك في UKVI'}, help:['cantlogin','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Have your passport, phone and email ready, plus the reference number from your visa application (it starts with GWF) or your old visa card (BRP) number.', ar:'جهّز جواز سفرك وهاتفك وبريدك الإلكتروني، ورقم مرجع طلب التأشيرة (يبدأ بـ GWF) أو رقم بطاقة الإقامة القديمة (BRP).'},
        {en:'On GOV.UK, go to “Get access to your eVisa”.', ar:'على GOV.UK، اذهب إلى صفحة «Get access to your eVisa».'},
        {en:'Confirm who you are with the “UK Immigration: ID Check” app, which scans your passport.', ar:'أكّد هويتك عبر تطبيق «UK Immigration: ID Check» الذي يمسح جواز سفرك.'},
        {en:'Link your passport to the account. You can’t see your eVisa until you do.', ar:'اربط جواز سفرك بالحساب، فلن ترى تأشيرتك الإلكترونية قبل ذلك.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Family members each need their own account, including children.', ar:'يحتاج كل فرد من العائلة إلى حسابه الخاص، بمن فيهم الأطفال.'}},
      {t:'link', url:'https://www.gov.uk/get-access-evisa', v:{en:'Open “Get access to your eVisa”', ar:'افتح صفحة «Get access to your eVisa»'}},
     ]},
    {id:'share', level:'source', label:{en:'Share code', ar:'رمز المشاركة'}, title:{en:'Prove your status with a share code', ar:'أثبت وضعك برمز مشاركة'}, help:['wrongdetails','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Sign in to “View and prove your immigration status” on GOV.UK.', ar:'سجّل الدخول إلى خدمة «View and prove your immigration status» على GOV.UK.'},
        {en:'Choose why you need it: for example, to prove your right to work or your right to rent.', ar:'اختر الغرض: مثلاً لإثبات حقك في العمل أو حقك في الاستئجار.'},
        {en:'You get a 9-character share code. Give it to the employer or landlord with your date of birth.', ar:'تحصل على رمز مشاركة من 9 خانات. أعطه لصاحب العمل أو المالك مع تاريخ ميلادك.'},
      ]},
      {t:'list', v:[
        {en:'A share code lasts 90 days and can be used as many times as you need.', ar:'يصلح رمز المشاركة لمدة 90 يوماً ويمكن استخدامه عدد المرات الذي تحتاجه.'},
        {en:'The person checking only sees what they need, not your full eVisa.', ar:'لا يرى الشخص الذي يتحقق إلا ما يحتاجه، لا تأشيرتك كاملة.'},
      ]},
     ]},
    {id:'next', level:'source', label:{en:'Good to know', ar:'من المفيد أن تعرف'}, title:{en:'Good to know', ar:'من المفيد أن تعرف'}, help:['police','else'],
     blocks:[
      {t:'list', v:[
        {en:'Students don’t need to register with the police any more.', ar:'لم يعد على الطلاب التسجيل لدى الشرطة.'},
        {en:'Changed your passport, name or phone number? Update your UKVI account before you next travel or get a share code.', ar:'غيّرت جواز سفرك أو اسمك أو رقم هاتفك؟ حدّث حسابك في UKVI قبل سفرك القادم أو قبل طلب رمز مشاركة.'},
      ]},
     ]},
  ],
  problems:[
    {id:'cantlogin', q:{en:'I can’t get into my account', ar:'لا أستطيع الدخول إلى حسابي'}, a:{en:'Use “Report an error with your eVisa” on GOV.UK. You’ll need your contact details, name, date of birth, nationality and one reference number, like your passport or GWF number. You can also call the UKVI Resolution Centre on 0300 790 6268.', ar:'استخدم خدمة «Report an error with your eVisa» على GOV.UK. ستحتاج إلى بيانات التواصل والاسم وتاريخ الميلاد والجنسية ورقم مرجعي واحد، مثل رقم الجواز أو رقم GWF. ويمكنك أيضاً الاتصال بمركز حلول UKVI على الرقم 0300 790 6268.'}},
    {id:'wrongdetails', q:{en:'My eVisa details are wrong', ar:'بيانات تأشيرتي خاطئة'}, a:{en:'Report it through “Report an error with your eVisa” on GOV.UK before you use a share code. Tell your university’s visa team too.', ar:'أبلغ عن ذلك عبر خدمة «Report an error with your eVisa» على GOV.UK قبل استخدام أي رمز مشاركة، وأخبر فريق التأشيرات في جامعتك أيضاً.'}},
    {id:'police', q:{en:'Do I need to register with the police?', ar:'هل علي التسجيل لدى الشرطة؟'}, a:{en:'No. Police registration for students has been stopped. If your old visa card (BRP) is lost or stolen, though, you still need to report that.', ar:'لا. توقّف تسجيل الطلاب لدى الشرطة. لكن إذا فُقدت بطاقة الإقامة القديمة (BRP) أو سُرقت، فما زال عليك الإبلاغ عن ذلك.'}},
    ELSE('Talk to your university’s immigration team, or call the UKVI Resolution Centre on 0300 790 6268.', 'تحدّث مع فريق الهجرة في جامعتك، أو اتصل بمركز حلول UKVI على الرقم 0300 790 6268.'),
  ],
  after:[{journey:'edinburgh.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}, {journey:'edinburgh.work', name:{en:'Work while you study', ar:'العمل أثناء الدراسة'}}],
});

/* ---------- 5. Register with a doctor (GP) and use the NHS ---------- */
DATA.journeys['edinburgh.gp'] = base({
  need:'health', icon:'health',
  title:{en:'Register with a doctor (GP)', ar:'التسجيل لدى طبيب عام (GP)'},
  doneTitle:{en:'You know where to go when you’re unwell.', ar:'أصبحت تعرف إلى أين تذهب عندما تمرض.'},
  sources:[ESRC.gpReg, ESRC.gpLothian, ESRC.uoeGp, ESRC.overseas, ESRC.ihs, ESRC.nhs24, ESRC.miu, ESRC.rx, ESRC.pharmFirst, ESRC.dentist, ESRC.breathing],
  stuck:{cards:[
    {title:{en:'NHS 24', ar:'NHS 24'}, phone:'111', body:{en:'Free, day and night, when you need care and your GP is closed. Press 9 then 1 for other languages.', ar:'مجاني ليلاً ونهاراً عندما تحتاج إلى رعاية وتكون عيادتك مغلقة. اضغط 9 ثم 1 للغات الأخرى.'}},
    {title:{en:'Breathing Space', ar:'Breathing Space'}, phone:'0800 83 85 87', body:{en:'Free, confidential support if you’re feeling low. Evenings and weekends. Samaritans are on 116 123, any time.', ar:'دعم مجاني وسري إذا كنت تشعر بالإحباط، في المساء وعطلات نهاية الأسبوع. وجمعية Samaritans متاحة على الرقم 116 123 في أي وقت.'}},
  ]},
  stages:[
    {id:'emergency', level:'source', label:{en:'Emergency?', ar:'طوارئ؟'}, title:{en:'Is it an emergency?', ar:'هل هي حالة طارئة؟'}, help:['after','else'],
     blocks:[
      {t:'emergency'},
      {t:'list', v:[
        {en:'Call 999 if someone’s life is in danger: chest pain, a stroke, or trouble breathing.', ar:'اتصل بالرقم 999 إذا كانت حياة أحد في خطر: ألم في الصدر، أو جلطة، أو صعوبة في التنفس.'},
        {en:'Call 111 (NHS 24) if it’s urgent but not life-threatening, or your GP is closed.', ar:'اتصل بالرقم 111 (NHS 24) إذا كانت الحالة عاجلة لكنها لا تهدد الحياة، أو كانت عيادتك مغلقة.'},
      ]},
      {t:'phraseCard', v:{en:'This is an emergency. I need a doctor now.', ar:'هذه حالة طارئة. أحتاج إلى طبيب الآن.'}},
     ]},
    {id:'cover', level:'source', label:{en:'Your cover', ar:'تغطيتك'}, title:{en:'You can use the NHS', ar:'يمكنك استخدام NHS'}, help:['cost','else'],
     blocks:[
      {t:'p', v:{en:'If you paid the Immigration Health Surcharge with your visa, you can use the NHS (the UK’s public health service) like residents do. For students, that’s from when you arrive until one month after your course ends.', ar:'إذا دفعت رسوم الصحة للهجرة (Immigration Health Surcharge) مع تأشيرتك، يمكنك استخدام NHS (الخدمة الصحية العامة في بريطانيا) مثل المقيمين. وللطلاب، يبدأ ذلك من وصولك حتى شهر بعد انتهاء دراستك.'}},
      {t:'list', v:[
        {en:'Seeing a GP is free.', ar:'زيارة الطبيب العام مجانية.'},
        {en:'Prescriptions are free in Scotland.', ar:'الوصفات الطبية مجانية في اسكتلندا.'},
      ]},
     ]},
    {id:'register', level:'source', label:{en:'Register', ar:'سجّل'}, title:{en:'Register with a GP practice', ar:'سجّل لدى عيادة طبيب عام'}, help:['refused','nodocs','staff','else'],
     blocks:[
      {t:'p', v:{en:'A GP (general practitioner) is your family doctor and the first place to go for most health problems. Register soon after you arrive, before you get ill.', ar:'الطبيب العام (GP) هو طبيب العائلة، وأول مكان تقصده لمعظم المشكلات الصحية. سجّل بعد وصولك بقليل، قبل أن تمرض.'}},
      {t:'steps', v:[
        {en:'Put your address into the NHS Lothian GP finder to see which practices cover where you live.', ar:'أدخل عنوانك في أداة البحث عن الأطباء لدى NHS Lothian لترى العيادات التي تغطي منطقة سكنك.'},
        {en:'Pick two or three, in case one isn’t taking new patients.', ar:'اختر عيادتين أو ثلاثاً، تحسّباً لأن تكون إحداها لا تقبل مرضى جدداً.'},
        {en:'Contact the practice and ask to register. Bring proof of identity and proof of your address. Students may be asked for proof they’re studying.', ar:'تواصل مع العيادة واطلب التسجيل. أحضر إثبات هوية وإثبات عنوانك، وقد يُطلب من الطلاب إثبات الدراسة.'},
      ]},
      {t:'tip', label:'tip', v:{en:'University of Edinburgh student? The University Health Service registers online only, so don’t turn up in person.', ar:'طالب في جامعة إدنبرة؟ الخدمة الصحية الجامعية تسجّل عبر الإنترنت فقط، فلا تذهب إليها شخصياً.'}},
      {t:'link', url:'https://services.nhslothian.scot/gps/patient-registration/', v:{en:'Open the NHS Lothian GP finder', ar:'افتح أداة البحث عن الأطباء لدى NHS Lothian'}},
      {t:'phraseCard', v:{en:'Hello. I’ve just moved here and I’d like to register as a patient. What do you need from me?', ar:'مرحباً. انتقلت إلى هنا حديثاً وأود التسجيل كمريض. ما الذي تحتاجونه مني؟'}},
     ]},
    {id:'where', level:'source', label:{en:'Where to go', ar:'إلى أين تذهب'}, title:{en:'Where to go when you’re unwell', ar:'إلى أين تذهب عندما تمرض'}, help:['after','minor','else'],
     blocks:[
      {t:'cards', v:[
        {color:'#2E7D5B', rec:true, name:{en:'Pharmacy', ar:'الصيدلية'}, desc:{en:'For minor illnesses like a sore throat or an earache. Walk in and ask for advice: no appointment needed (Pharmacy First).', ar:'للأمراض البسيطة مثل التهاب الحلق أو ألم الأذن. ادخل واطلب النصيحة دون موعد (خدمة Pharmacy First).'}},
        {color:'#2F6DB5', name:{en:'Your GP', ar:'طبيبك العام'}, desc:{en:'For most other health problems. Call the practice to book.', ar:'لمعظم المشكلات الصحية الأخرى. اتصل بالعيادة لحجز موعد.'}},
        {color:'#F2B90F', name:{en:'NHS 24 on 111', ar:'NHS 24 على الرقم 111'}, desc:{en:'Urgent, and your GP is closed. They can book you into a minor injuries unit.', ar:'حالة عاجلة وعيادتك مغلقة. يمكنهم حجز موعد لك في وحدة الإصابات البسيطة.'}},
        {color:'#C8382F', name:{en:'999 or A&E', ar:'999 أو الطوارئ'}, desc:{en:'Only when a life is in danger. The full emergency department is at the Royal Infirmary.', ar:'فقط عندما تكون الحياة في خطر. قسم الطوارئ الكامل في مستشفى Royal Infirmary.'}},
      ]},
     ]},
    {id:'more', level:'source', label:{en:'Dentist & more', ar:'الأسنان وغيرها'}, title:{en:'Dentists and mental health', ar:'الأسنان والصحة النفسية'}, help:['dentist','low','else'],
     blocks:[
      {t:'list', v:[
        {en:'Dentists: contact a practice directly. It doesn’t have to be near your home. NHS Lothian lists practices taking NHS patients each month. NHS dental treatment isn’t free: a course of treatment costs up to £384.', ar:'أطباء الأسنان: تواصل مع العيادة مباشرة، ولا يلزم أن تكون قريبة من سكنك. تنشر NHS Lothian شهرياً قائمة بالعيادات التي تقبل مرضى NHS. علاج الأسنان في NHS ليس مجانياً: يصل مجموع الرسوم للعلاج الواحد إلى 384 جنيهاً.'},
        {en:'Feeling low or overwhelmed? Your GP can help, and Breathing Space (0800 83 85 87) is free to call in the evenings and at weekends.', ar:'تشعر بالإحباط أو الضغط؟ يمكن لطبيبك العام مساعدتك، ويمكنك الاتصال مجاناً بـ Breathing Space على الرقم 0800 83 85 87 في المساء وعطلات نهاية الأسبوع.'},
      ]},
     ]},
  ],
  problems:[
    {id:'refused', q:{en:'The practice won’t register me', ar:'العيادة ترفض تسجيلي'}, a:{en:'Practices can say no if you live outside their area or they aren’t taking new patients. Try the next practice on the NHS Lothian finder. If none will take you, contact NHS Lothian.', ar:'يمكن للعيادة الرفض إذا كنت تسكن خارج منطقتها أو كانت لا تقبل مرضى جدداً. جرّب العيادة التالية في أداة NHS Lothian، وإن لم تقبلك أي عيادة، تواصل مع NHS Lothian.'}},
    {id:'nodocs', q:{en:'I don’t have proof of address yet', ar:'ليس لدي إثبات عنوان بعد'}, a:{en:'Ask the practice what else they accept. Students can often use a letter from their university or halls. If you have no fixed address, The Access Place (0131 529 5015) helps people register.', ar:'اسأل العيادة عمّا تقبله غير ذلك. غالباً يمكن للطلاب استخدام خطاب من الجامعة أو السكن الجامعي. وإن لم يكن لديك عنوان ثابت، يساعد مركز The Access Place (0131 529 5015) الناس على التسجيل.'}},
    {id:'after', q:{en:'It’s urgent and the GP is closed', ar:'الحالة عاجلة والعيادة مغلقة'}, a:{en:'Call 111 for NHS 24. It’s free, day and night. Press 9 then 1 for other languages. If someone’s life is in danger, call 999.', ar:'اتصل بالرقم 111 للوصول إلى NHS 24. الخدمة مجانية ليلاً ونهاراً. اضغط 9 ثم 1 للغات الأخرى. وإذا كانت حياة أحد في خطر، اتصل بالرقم 999.'}},
    {id:'minor', q:{en:'I’ve hurt myself, but it’s not serious', ar:'أُصبت، لكن الإصابة ليست خطيرة'}, a:{en:'Call 111 first: NHS 24 can book you into a minor injuries unit. The Royal Infirmary’s is for ages 16 and over, 8am–11pm. The Western General’s is open 8am–8:30pm.', ar:'اتصل بالرقم 111 أولاً، إذ يمكن لـ NHS 24 حجز موعد لك في وحدة الإصابات البسيطة. وحدة Royal Infirmary لمن هم في سن 16 فما فوق، من 8 صباحاً حتى 11 مساءً، ووحدة Western General مفتوحة من 8 صباحاً حتى 8:30 مساءً.'}},
    {id:'cost', q:{en:'Will I have to pay?', ar:'هل سأضطر إلى الدفع؟'}, a:{en:'Seeing a GP, going to A&E and prescriptions are free in Scotland if you’re covered by the NHS. Dental treatment and glasses usually cost something.', ar:'زيارة الطبيب العام والطوارئ والوصفات الطبية مجانية في اسكتلندا إن كنت مشمولاً بخدمة NHS. أما علاج الأسنان والنظارات فعادةً بمقابل.'}},
    {id:'dentist', q:{en:'I can’t find an NHS dentist', ar:'لا أجد طبيب أسنان في NHS'}, a:{en:'Check NHS Lothian’s monthly list of practices taking NHS patients, and try practices further away. For dental pain when you can’t get an appointment, call 111.', ar:'راجع القائمة الشهرية لدى NHS Lothian للعيادات التي تقبل مرضى NHS، وجرّب عيادات أبعد. ولألم الأسنان حين لا تجد موعداً، اتصل بالرقم 111.'}},
    {id:'low', q:{en:'I’m feeling low or overwhelmed', ar:'أشعر بالإحباط أو الضغط'}, a:{en:'You’re not alone, and moving country is hard. Talk to your GP or your university’s support service. Breathing Space is on 0800 83 85 87, and Samaritans on 116 123 at any time. If you feel you might harm yourself, call 999.', ar:'لست وحدك، والانتقال إلى بلد جديد أمر صعب. تحدّث مع طبيبك العام أو خدمة الدعم في جامعتك. يمكنك الاتصال بـ Breathing Space على 0800 83 85 87، وبـ Samaritans على 116 123 في أي وقت. وإذا شعرت أنك قد تؤذي نفسك، اتصل بالرقم 999.'}},
    STAFF,
    ELSE('Call NHS 24 on 111 for health advice, or ask your GP practice.', 'اتصل بـ NHS 24 على الرقم 111 للاستشارة الصحية، أو اسأل عيادتك.'),
  ],
  after:[{journey:'edinburgh.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}],
});

/* ---------- 6. Open a bank account ---------- */
DATA.journeys['edinburgh.bank'] = base({
  need:'money', icon:'money',
  title:{en:'Open a bank account', ar:'فتح حساب بنكي'},
  doneTitle:{en:'Your money has a home.', ar:'أصبح لأموالك مكان آمن.'},
  sources:[ESRC.uoeBank, ESRC.uoeBankLetter, ESRC.fscs, ESRC.s159, ESRC.reportFraud, ESRC.fos],
  stuck:{cards:[
    {title:{en:'Your bank', ar:'بنكك'}, phone:'159', body:{en:'Call 159 to reach your bank safely. It works for most UK banks.', ar:'اتصل بالرقم 159 للوصول إلى بنكك بأمان. يعمل مع معظم البنوك البريطانية.'}},
    {title:{en:'Financial Ombudsman Service', ar:'أمين المظالم المالي'}, body:{en:'Free. For complaints your bank hasn’t solved in 8 weeks (15 working days for payment and fraud problems).', ar:'مجاني. للشكاوى التي لم يحلها بنكك خلال 8 أسابيع (أو 15 يوم عمل لمشكلات الدفع والاحتيال).'}},
  ]},
  stages:[
    {id:'prepare', level:'source', label:{en:'Prepare', ar:'استعد'}, title:{en:'What banks ask for', ar:'ما تطلبه البنوك'}, help:['noaddress','else'],
     blocks:[
      {t:'list', v:[
        {en:'Proof of identity: your passport.', ar:'إثبات الهوية: جواز سفرك.'},
        {en:'Proof of your UK address: a tenancy agreement, a council tax letter or a utility bill.', ar:'إثبات عنوانك في بريطانيا: عقد إيجار أو رسالة ضريبة المجلس أو فاتورة خدمات.'},
        {en:'Proof of your status: your eVisa, or for students, proof you’re enrolled.', ar:'إثبات وضعك: تأشيرتك الإلكترونية، أو للطلاب، إثبات التسجيل في الجامعة.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Students: your university can give you a bank letter that confirms your address and studies. At the University of Edinburgh, you order one online.', ar:'للطلاب: يمكن لجامعتك أن تعطيك خطاباً للبنك يؤكد عنوانك ودراستك. في جامعة إدنبرة تطلبه عبر الإنترنت.'}},
      {t:'journeyLink', journey:'edinburgh.evisa', v:{en:'Set up your eVisa and share codes', ar:'إعداد تأشيرتك الإلكترونية ورموز المشاركة'}},
     ]},
    {id:'choose', level:'source', label:{en:'Choose', ar:'اختر'}, title:{en:'Choose a bank', ar:'اختر بنكاً'}, help:['refused','else'],
     blocks:[
      {t:'list', v:[
        {en:'International students usually get a basic current account, with no overdraft.', ar:'عادةً يحصل الطلاب الدوليون على حساب جارٍ أساسي بلا سحب على المكشوف.'},
        {en:'Some banks work entirely in an app. Each bank has its own rules, so check theirs before you apply.', ar:'بعض البنوك تعمل بالكامل عبر تطبيق، ولكل بنك شروطه، فراجعها قبل التقديم.'},
        {en:'Money in a UK bank is protected up to £120,000 per person, per bank, by the FSCS.', ar:'الأموال في البنوك البريطانية محمية حتى 120,000 جنيه لكل شخص في كل بنك، عبر نظام FSCS.'},
      ]},
     ]},
    {id:'open', level:'source', label:{en:'Open it', ar:'افتح الحساب'}, title:{en:'Open your account', ar:'افتح حسابك'}, help:['refused','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Apply in the bank’s app, online or at a branch.', ar:'قدّم عبر تطبيق البنك أو موقعه أو في أحد فروعه.'},
        {en:'Upload or show your documents.', ar:'ارفع مستنداتك أو اعرضها.'},
        {en:'Your debit card comes by post. Set up the bank’s app while you wait.', ar:'تصلك بطاقة الخصم بالبريد. فعّل تطبيق البنك أثناء الانتظار.'},
      ]},
      {t:'phraseCard', v:{en:'I’m new to the UK. I’d like to open a basic current account. Which documents do you need?', ar:'أنا جديد في بريطانيا. أود فتح حساب جارٍ أساسي. ما المستندات التي تحتاجونها؟'}},
     ]},
    {id:'safe', level:'source', label:{en:'Stay safe', ar:'ابقَ آمناً'}, title:{en:'Keep your money safe', ar:'حافظ على أموالك'}, help:['scam','else'],
     blocks:[
      {t:'list', v:[
        {en:'Your bank will never ask you to move money to a “safe account”.', ar:'لن يطلب منك بنكك أبداً نقل أموالك إلى «حساب آمن».'},
        {en:'Never share your PIN or the one-time codes the bank texts you.', ar:'لا تشارك رقمك السري أو رموز التحقق التي يرسلها البنك برسالة نصية.'},
        {en:'Worried a call is fake? Hang up and call 159. It connects you to your bank safely.', ar:'تشكّ في أن المكالمة مزيفة؟ أغلق الخط واتصل بالرقم 159، فهو يوصلك ببنكك بأمان.'},
      ]},
      {t:'tip', label:'important', v:{en:'Lost money to a scam in Scotland? Tell your bank straight away, then report it to Police Scotland on 101.', ar:'خسرت مالاً بسبب احتيال في اسكتلندا؟ أبلغ بنكك فوراً، ثم أبلغ شرطة اسكتلندا على الرقم 101.'}},
     ]},
  ],
  problems:[
    {id:'noaddress', q:{en:'I don’t have proof of address yet', ar:'ليس لدي إثبات عنوان بعد'}, a:{en:'Students: ask your university for a bank letter. If you live in university housing, it can confirm your address. Otherwise, ask the bank which documents it accepts.', ar:'للطلاب: اطلب من جامعتك خطاباً للبنك، فإن كنت تسكن في سكن جامعي يمكنه تأكيد عنوانك. وإلا فاسأل البنك عن المستندات التي يقبلها.'}},
    {id:'refused', q:{en:'The bank said no', ar:'رفض البنك طلبي'}, a:{en:'Ask the bank why, and what would change their answer. Then try another bank: each has different rules for newcomers.', ar:'اسأل البنك عن السبب، وما الذي قد يغيّر قراره. ثم جرّب بنكاً آخر، فلكل بنك قواعد مختلفة للقادمين الجدد.'}},
    {id:'scam', q:{en:'Someone asked me to move money or share a code', ar:'طلب مني أحدهم نقل أموال أو مشاركة رمز'}, a:{en:'Stop. Don’t move money and don’t share anything. Hang up and call 159 to reach your bank. If you’ve already paid, tell your bank now and report it to Police Scotland on 101.', ar:'توقّف. لا تنقل أي أموال ولا تشارك أي شيء. أغلق الخط واتصل بالرقم 159 للوصول إلى بنكك. وإن كنت قد دفعت بالفعل، أبلغ بنكك الآن ثم شرطة اسكتلندا على الرقم 101.'}},
    {id:'complaint', q:{en:'The bank won’t fix my problem', ar:'البنك لا يحل مشكلتي'}, a:{en:'Make a formal complaint to the bank. If it isn’t solved within 8 weeks (or 15 working days for payment and fraud problems), go to the Financial Ombudsman Service for free. You have 6 months from the bank’s final answer.', ar:'قدّم شكوى رسمية إلى البنك. إذا لم تُحل خلال 8 أسابيع (أو 15 يوم عمل لمشكلات الدفع والاحتيال)، توجّه مجاناً إلى أمين المظالم المالي (Financial Ombudsman Service). لديك 6 أشهر من تاريخ الرد النهائي للبنك.'}},
    STAFF,
    ELSE('Call 159 to reach your bank, or ask in a branch.', 'اتصل بالرقم 159 للوصول إلى بنكك، أو اسأل في أحد الفروع.'),
  ],
  after:[{journey:'edinburgh.rent', name:{en:'Rent a home', ar:'استئجار سكن'}}],
});
DATA.journeys['edinburgh.bank'].stages[3].help = ['scam','complaint','else'];

/* ---------- 7. Rent a home ---------- */
DATA.journeys['edinburgh.rent'] = base({
  need:'housing', icon:'housing',
  title:{en:'Rent a home safely', ar:'استئجار سكن بأمان'},
  doneTitle:{en:'You know your rights as a tenant.', ar:'أصبحت تعرف حقوقك كمستأجر.'},
  sources:[ESRC.rentPay, ESRC.deposits, ESRC.landlordReg, ESRC.agentReg, ESRC.notice, ESRC.hmo, ESRC.rentScams, ESRC.shelter, ESRC.cas],
  stuck:{cards:[
    {title:{en:'Citizens Advice Scotland', ar:'Citizens Advice Scotland'}, phone:'0800 028 1456', body:{en:'Free, independent advice on renting, money and more.', ar:'استشارة مجانية ومستقلة في الإيجار والمال وغيرها.'}},
    {title:{en:'Shelter Scotland helpline', ar:'خط مساعدة Shelter Scotland'}, phone:'0808 800 4444', body:{en:'Mon–Fri 9am–5pm. For urgent cases: if you’re homeless, about to be, or unsafe at home.', ar:'من الاثنين إلى الجمعة، 9 صباحاً حتى 5 مساءً. للحالات العاجلة: إذا كنت بلا مأوى أو على وشك ذلك أو غير آمن في منزلك.'}},
  ]},
  stages:[
    {id:'search', level:'source', label:{en:'Search', ar:'ابحث'}, title:{en:'Look out for scams', ar:'احذر الاحتيال'}, help:['scam','else'],
     blocks:[
      {t:'list', v:[
        {en:'Never pay anything before you’ve seen the home, in person or on a live video call.', ar:'لا تدفع أي شيء قبل أن ترى السكن، شخصياً أو عبر مكالمة فيديو مباشرة.'},
        {en:'Be wary of pressure to pay right away, or requests to pay by voucher, MoneyGram or Western Union.', ar:'احذر من الضغط عليك للدفع فوراً، أو طلب الدفع بقسائم أو عبر MoneyGram أو Western Union.'},
        {en:'Adverts must show the landlord’s registration number, or say “landlord registration pending”.', ar:'يجب أن يظهر في الإعلان رقم تسجيل المالك، أو عبارة «landlord registration pending» (التسجيل قيد المعالجة).'},
      ]},
     ]},
    {id:'check', level:'source', label:{en:'Check', ar:'تحقّق'}, title:{en:'Check the landlord or agent', ar:'تحقّق من المالك أو الوكيل'}, help:['notreg','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Search for the landlord on the Scottish Landlord Register. Renting out without registering is illegal.', ar:'ابحث عن المالك في سجل الملاك في اسكتلندا، فالتأجير دون تسجيل مخالف للقانون.'},
        {en:'Renting through an agent? Check they’re on the Scottish letting agent register.', ar:'تستأجر عبر وكيل؟ تحقّق من أنه مسجّل في سجل وكلاء التأجير في اسكتلندا.'},
        {en:'Sharing with 2 or more people you’re not related to? The home needs an HMO licence. Ask the landlord for it.', ar:'ستسكن مع شخصين أو أكثر لا تربطك بهم قرابة؟ يحتاج السكن إلى ترخيص سكن مشترك (HMO). اطلبه من المالك.'},
      ]},
      {t:'link', url:'https://landlordregistrationscotland.gov.uk/', v:{en:'Search the Scottish Landlord Register', ar:'ابحث في سجل الملاك في اسكتلندا'}},
     ]},
    {id:'pay', level:'source', label:{en:'Paying', ar:'الدفع'}, title:{en:'What you can be asked to pay', ar:'ما يحق للمالك أن يطلبه منك'}, help:['fees','deposit','else'],
     blocks:[
      {t:'list', v:[
        {en:'Only rent and a deposit. Agency fees, key money, holding fees and credit-check fees are illegal, and you can claim them back.', ar:'الإيجار والتأمين فقط. رسوم الوكالة و«خلو الرجل» ورسوم الحجز ورسوم التحقق الائتماني مخالفة للقانون، ويمكنك استردادها.'},
        {en:'The deposit can be no more than 2 months’ rent.', ar:'لا يجوز أن يزيد التأمين عن إيجار شهرين.'},
        {en:'A landlord can ask for up to 6 months’ rent in advance. That counts as rent.', ar:'يجوز للمالك أن يطلب إيجار ما يصل إلى 6 أشهر مقدماً، ويُعدّ ذلك إيجاراً.'},
      ]},
      {t:'tip', label:'important', v:{en:'Within 30 working days, your deposit must be put in one of 3 approved schemes: SafeDeposits Scotland, mydeposits Scotland or Letting Protection Service Scotland. You must be told which one in writing.', ar:'خلال 30 يوم عمل، يجب إيداع التأمين في أحد 3 أنظمة معتمدة: SafeDeposits Scotland أو mydeposits Scotland أو Letting Protection Service Scotland، ويجب إبلاغك كتابياً بالنظام المستخدم.'}},
     ]},
    {id:'rights', level:'source', label:{en:'Your tenancy', ar:'عقدك'}, title:{en:'Your tenancy', ar:'عقد إيجارك'}, help:['leave','else'],
     blocks:[
      {t:'list', v:[
        {en:'Most private rentals are a Private Residential Tenancy. It has no fixed end date.', ar:'معظم الإيجارات الخاصة من نوع «الإيجار السكني الخاص» (Private Residential Tenancy)، وليس له تاريخ انتهاء ثابت.'},
        {en:'To leave, give your landlord at least 28 days’ notice in writing. Send it 2 days earlier if you email or post it.', ar:'لتغادر، أبلغ المالك كتابياً قبل 28 يوماً على الأقل، وأرسل الإشعار قبل ذلك بيومين إضافيين إن أرسلته بالبريد الإلكتروني أو العادي.'},
      ]},
      {t:'journeyLink', journey:'edinburgh.counciltax', v:{en:'Next: council tax and TV licence', ar:'التالي: ضريبة المجلس ورخصة التلفزيون'}},
     ]},
  ],
  problems:[
    {id:'scam', q:{en:'I think this advert is a scam', ar:'أظن أن هذا الإعلان احتيال'}, a:{en:'Don’t pay anything. Check the landlord on the Scottish Landlord Register and ask to view the home. If you’ve already paid, tell your bank straight away and report it to Police Scotland on 101.', ar:'لا تدفع شيئاً. تحقّق من المالك في سجل الملاك واطلب معاينة السكن. وإن كنت قد دفعت بالفعل، أبلغ بنكك فوراً ثم شرطة اسكتلندا على الرقم 101.'}},
    {id:'notreg', q:{en:'The landlord isn’t on the register', ar:'المالك غير موجود في السجل'}, a:{en:'Ask for their registration number. If they can’t give one, or the advert doesn’t say “pending”, be very careful: renting out without registering is illegal. Citizens Advice Scotland can help you decide.', ar:'اطلب رقم تسجيله. إن لم يستطع إعطاءه، أو لم يذكر الإعلان أن التسجيل «قيد المعالجة»، فكن حذراً جداً، فالتأجير دون تسجيل مخالف للقانون. يمكن لـ Citizens Advice Scotland مساعدتك في القرار.'}},
    {id:'fees', q:{en:'They want a fee before I move in', ar:'يطلبون رسوماً قبل انتقالي'}, a:{en:'Apart from rent and a deposit, fees are illegal in Scotland. Ask what it’s for in writing. If you’ve paid one, you can claim it back. Citizens Advice Scotland can help.', ar:'باستثناء الإيجار والتأمين، الرسوم مخالفة للقانون في اسكتلندا. اطلب كتابياً توضيح سببها. وإن كنت قد دفعتها، يمكنك استردادها بمساعدة Citizens Advice Scotland.'}},
    {id:'deposit', q:{en:'I don’t know where my deposit is', ar:'لا أعرف أين مبلغ التأمين'}, a:{en:'Your landlord must tell you in writing within 30 working days. You can also check with the 3 schemes directly. If it wasn’t protected, get advice: the tribunal can order the landlord to pay you.', ar:'يجب أن يبلغك المالك كتابياً خلال 30 يوم عمل، ويمكنك أيضاً السؤال لدى الأنظمة الثلاثة مباشرة. وإن لم يُحمَ التأمين، اطلب الاستشارة، فالمحكمة المختصة يمكنها إلزام المالك بدفع تعويض لك.'}},
    {id:'leave', q:{en:'I want to leave', ar:'أريد المغادرة'}, a:{en:'Tell your landlord in writing, at least 28 days before you want to go (30 days if you email or post it). You can leave sooner only if the landlord agrees in writing.', ar:'أبلغ المالك كتابياً قبل 28 يوماً على الأقل من موعد مغادرتك (30 يوماً إن أرسلت الإشعار بالبريد). ولا يمكنك المغادرة أبكر إلا بموافقة المالك الكتابية.'}},
    STAFF,
    ELSE('Call Citizens Advice Scotland on 0800 028 1456. If you’re homeless or about to be, call Shelter Scotland on 0808 800 4444.', 'اتصل بـ Citizens Advice Scotland على 0800 028 1456. وإن كنت بلا مأوى أو على وشك ذلك، اتصل بـ Shelter Scotland على 0808 800 4444.'),
  ],
  after:[{journey:'edinburgh.counciltax', name:{en:'Council tax and TV licence', ar:'ضريبة المجلس ورخصة التلفزيون'}}],
});

/* ---------- 8. Council tax and TV licence ---------- */
DATA.journeys['edinburgh.counciltax'] = base({
  need:'housing', icon:'housing',
  title:{en:'Council tax and TV licence', ar:'ضريبة المجلس ورخصة التلفزيون'},
  doneTitle:{en:'Your home bills are sorted.', ar:'رتّبت فواتير منزلك.'},
  sources:[ESRC.ctax, ESRC.uoeCtax, ESRC.tvl, ESRC.tvlFee],
  stuck:{cards:[
    {title:{en:'City of Edinburgh Council', ar:'مجلس مدينة إدنبرة'}, body:{en:'Council tax questions and student exemptions are handled online on the council’s website.', ar:'تُعالج أسئلة ضريبة المجلس وإعفاءات الطلاب عبر موقع المجلس الإلكتروني.'}},
    {title:{en:'Citizens Advice Scotland', ar:'Citizens Advice Scotland'}, phone:'0800 028 1456', body:{en:'Free advice if you get a bill you can’t pay.', ar:'استشارة مجانية إذا وصلتك فاتورة لا تستطيع دفعها.'}},
  ]},
  stages:[
    {id:'what', level:'source', label:{en:'Understand', ar:'افهم'}, title:{en:'What council tax is', ar:'ما هي ضريبة المجلس'}, help:['bill','else'],
     blocks:[
      {t:'p', v:{en:'Council tax is a yearly charge for each home, paid to the council for local services like bins and streets. In Scotland it includes water and sewerage charges.', ar:'ضريبة المجلس رسم سنوي على كل مسكن، يُدفع للمجلس مقابل الخدمات المحلية مثل جمع النفايات والشوارع. وفي اسكتلندا تشمل رسوم المياه والصرف الصحي.'}},
     ]},
    {id:'students', level:'source', label:{en:'Students', ar:'الطلاب'}, title:{en:'If you’re a student', ar:'إذا كنت طالباً'}, help:['bill','mixed','else'],
     blocks:[
      {t:'list', v:[
        {en:'If everyone in your home is a full-time student, you pay nothing.', ar:'إذا كان كل من في مسكنك طلاباً بدوام كامل، فلا تدفعون شيئاً.'},
        {en:'Full-time means a course of at least 24 weeks, at 21 hours or more a week.', ar:'الدوام الكامل يعني دراسة لا تقل عن 24 أسبوعاً، بمعدل 21 ساعة أو أكثر أسبوعياً.'},
        {en:'Purpose-built student halls are usually exempt already.', ar:'السكن الطلابي المخصص معفى عادةً بالفعل.'},
      ]},
      {t:'steps', v:[
        {en:'Apply for the student exemption online on the City of Edinburgh Council website.', ar:'قدّم على إعفاء الطلاب عبر موقع مجلس مدينة إدنبرة.'},
        {en:'Studying at Edinburgh, Heriot-Watt, Napier, Queen Margaret, Edinburgh College or SRUC? The council checks with your university automatically.', ar:'تدرس في جامعة إدنبرة أو Heriot-Watt أو Napier أو Queen Margaret أو Edinburgh College أو SRUC؟ يتحقق المجلس من جامعتك تلقائياً.'},
        {en:'Anywhere else, upload a student certificate from your university.', ar:'في أي مكان آخر، ارفع شهادة طالب من جامعتك.'},
      ]},
      {t:'link', url:'https://www.edinburgh.gov.uk/discounts-exemptions/student-council-tax-discount', v:{en:'Apply for the student exemption', ar:'قدّم على إعفاء الطلاب'}},
     ]},
    {id:'tv', level:'source', label:{en:'TV licence', ar:'رخصة التلفزيون'}, title:{en:'Do you need a TV licence?', ar:'هل تحتاج إلى رخصة تلفزيون؟'}, help:['tvl','else'],
     blocks:[
      {t:'list', v:[
        {en:'You need one to watch or record live TV on any channel or device, or to use BBC iPlayer at all.', ar:'تحتاج إليها لمشاهدة أو تسجيل البث التلفزيوني المباشر على أي قناة أو جهاز، أو لاستخدام BBC iPlayer بأي شكل.'},
        {en:'It costs £180 a year. There’s no student discount, but you can get a refund for months you don’t use.', ar:'تكلّف 180 جنيهاً سنوياً. لا يوجد خصم للطلاب، لكن يمكنك استرداد قيمة الأشهر التي لا تستخدمها.'},
        {en:'Only streaming non-live shows on services like Netflix? You don’t need one.', ar:'تشاهد فقط برامج غير مباشرة على خدمات مثل Netflix؟ لا تحتاج إلى رخصة.'},
      ]},
     ]},
  ],
  problems:[
    {id:'bill', q:{en:'I got a council tax bill but I’m a student', ar:'وصلتني فاتورة ضريبة المجلس وأنا طالب'}, a:{en:'Apply for the student exemption on the council website. If your university isn’t checked automatically, upload a student certificate. Don’t ignore the bill.', ar:'قدّم على إعفاء الطلاب عبر موقع المجلس. إذا لم تكن جامعتك ضمن التحقق التلقائي، ارفع شهادة طالب. ولا تتجاهل الفاتورة.'}},
    {id:'mixed', q:{en:'I live with someone who isn’t a student', ar:'أسكن مع شخص ليس طالباً'}, a:{en:'The home isn’t fully exempt. If everyone except one adult is a student, the bill is cut by 25%. The non-student usually pays it.', ar:'لا يُعفى المسكن بالكامل. إذا كان الجميع طلاباً باستثناء بالغ واحد، تُخفَّض الفاتورة بنسبة 25%، وعادةً يدفعها غير الطالب.'}},
    {id:'tvl', q:{en:'I share a flat. Do we each need a licence?', ar:'أسكن في شقة مشتركة. هل يحتاج كل منا إلى رخصة؟'}, a:{en:'One licence covers everyone on a joint tenancy. If you each have a separate tenancy for your own room, or you live in halls, you need your own.', ar:'رخصة واحدة تكفي كل من في عقد إيجار مشترك. أما إن كان لكل منكم عقد منفصل لغرفته، أو كنت في سكن جامعي، فتحتاج إلى رخصتك الخاصة.'}},
    ELSE('Contact the City of Edinburgh Council through its website, or Citizens Advice Scotland on 0800 028 1456.', 'تواصل مع مجلس مدينة إدنبرة عبر موقعه، أو مع Citizens Advice Scotland على 0800 028 1456.'),
  ],
  after:[{journey:'edinburgh.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}],
});

/* ---------- 9. Work while you study (and National Insurance) ---------- */
DATA.journeys['edinburgh.work'] = base({
  need:'work', icon:'work',
  title:{en:'Work while you study', ar:'العمل أثناء الدراسة'},
  doneTitle:{en:'You know your work rules.', ar:'أصبحت تعرف قواعد عملك.'},
  sources:[ESRC.studentWork, ESRC.studentVisa, ESRC.rtwGuide, ESRC.rtwCode, ESRC.nino],
  stuck:{cards:[
    {title:{en:'Your university’s immigration or visa team', ar:'فريق الهجرة أو التأشيرات في جامعتك'}, body:{en:'Ask before you accept a job if you’re unsure. Breaking work rules can affect your visa.', ar:'اسأل قبل قبول أي وظيفة إن لم تكن متأكداً، فمخالفة قواعد العمل قد تؤثر على تأشيرتك.'}},
    {title:{en:'Citizens Advice Scotland', ar:'Citizens Advice Scotland'}, phone:'0800 028 1456', body:{en:'Free advice on pay and problems at work.', ar:'استشارة مجانية في الأجور ومشكلات العمل.'}},
  ]},
  stages:[
    {id:'hours', level:'source', label:{en:'Your hours', ar:'ساعاتك'}, title:{en:'How much you can work', ar:'كم ساعة يمكنك العمل'}, help:['hours','else'],
     blocks:[
      {t:'list', v:[
        {en:'Degree level or above: up to 20 hours a week during term time. Below degree level: up to 10.', ar:'مستوى البكالوريوس فما فوق: حتى 20 ساعة أسبوعياً خلال الفصل الدراسي. ودون مستوى البكالوريوس: حتى 10 ساعات.'},
        {en:'A week means any 7 days starting on a Monday. You can’t average hours across weeks.', ar:'الأسبوع يعني أي 7 أيام تبدأ من الاثنين، ولا يجوز احتساب متوسط الساعات بين الأسابيع.'},
        {en:'Outside term time, in your university’s official holidays, you can work full-time.', ar:'خارج الفصل الدراسي، في العطلات الرسمية لجامعتك، يمكنك العمل بدوام كامل.'},
      ]},
      {t:'tip', label:'important', v:{en:'Your exact limit is shown on your eVisa. Check it before you start.', ar:'حدّك الدقيق مذكور في تأشيرتك الإلكترونية. تحقّق منه قبل أن تبدأ.'}},
     ]},
    {id:'cant', level:'source', label:{en:'Not allowed', ar:'غير مسموح'}, title:{en:'Work you can’t do', ar:'أعمال لا يمكنك القيام بها'}, help:['self','else'],
     blocks:[
      {t:'list', v:[
        {en:'Being self-employed or running a business, including freelancing.', ar:'العمل الحر أو إدارة مشروع تجاري، بما في ذلك العمل المستقل.'},
        {en:'Working as a professional sportsperson, sports coach or entertainer.', ar:'العمل كرياضي محترف أو مدرب رياضي أو فنان مؤدٍّ.'},
        {en:'A permanent full-time job.', ar:'وظيفة دائمة بدوام كامل.'},
      ]},
     ]},
    {id:'prove', level:'source', label:{en:'Prove it', ar:'أثبت حقك'}, title:{en:'Prove your right to work', ar:'أثبت حقك في العمل'}, help:['share','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Get a right-to-work share code on GOV.UK.', ar:'احصل على رمز مشاركة لإثبات حق العمل من GOV.UK.'},
        {en:'Give your employer the 9-character code and your date of birth. They check it online and match your photo.', ar:'أعطِ صاحب العمل الرمز المكوّن من 9 خانات وتاريخ ميلادك، فيتحقق منه عبر الإنترنت ويطابق صورتك.'},
        {en:'Give them your term and holiday dates too. Employers must keep a copy for students.', ar:'أعطهم أيضاً مواعيد الفصل الدراسي والعطلات، إذ يجب على أصحاب العمل الاحتفاظ بنسخة منها للطلاب.'},
      ]},
      {t:'journeyLink', journey:'edinburgh.evisa', v:{en:'How to get a share code', ar:'كيف تحصل على رمز مشاركة'}},
     ]},
    {id:'nino', level:'source', label:{en:'NI number', ar:'رقم التأمين'}, title:{en:'Your National Insurance number', ar:'رقم التأمين الوطني'}, help:['nonino','else'],
     blocks:[
      {t:'p', v:{en:'A National Insurance (NI) number makes sure the tax and contributions you pay are recorded against your name.', ar:'رقم التأمين الوطني (NI) يضمن تسجيل الضرائب والاشتراكات التي تدفعها باسمك.'}},
      {t:'steps', v:[
        {en:'Check whether you already have one: look in your eVisa details, or on the back of an old visa card (BRP).', ar:'تحقّق إن كان لديك رقم بالفعل: انظر في بيانات تأشيرتك الإلكترونية، أو خلف بطاقة الإقامة القديمة (BRP).'},
        {en:'If not, apply on GOV.UK. It’s free and can take up to 4 weeks.', ar:'إن لم يكن لديك، قدّم عبر GOV.UK. الخدمة مجانية وقد تستغرق حتى 4 أسابيع.'},
      ]},
      {t:'tip', label:'tip', v:{en:'You can start work before your NI number arrives, as long as you can prove your right to work.', ar:'يمكنك بدء العمل قبل وصول رقم التأمين، ما دمت تستطيع إثبات حقك في العمل.'}},
      {t:'link', url:'https://www.gov.uk/apply-national-insurance-number', v:{en:'Apply for a National Insurance number', ar:'قدّم على رقم التأمين الوطني'}},
     ]},
  ],
  problems:[
    {id:'hours', q:{en:'My employer wants me to work more hours', ar:'يريد صاحب العمل أن أعمل ساعات أكثر'}, a:{en:'In term time, say no: going over your limit breaks your visa conditions, even once. Show them your eVisa limit and your term dates. You can work more in official holidays.', ar:'خلال الفصل الدراسي، ارفض: تجاوز حدّك يخالف شروط تأشيرتك ولو لمرة واحدة. اعرض عليهم حدّك في التأشيرة ومواعيد الفصل الدراسي. ويمكنك العمل أكثر في العطلات الرسمية.'}},
    {id:'self', q:{en:'Can I do freelance or delivery-app work?', ar:'هل يمكنني العمل المستقل أو التوصيل عبر التطبيقات؟'}, a:{en:'Not if you’d be self-employed: that isn’t allowed on a Student visa. Many delivery and ride apps treat workers as self-employed, so check how the app would pay you, and ask your university’s visa team before you sign up.', ar:'ليس إن كنت ستعمل عملاً حراً، فذلك غير مسموح بتأشيرة الطالب. كثير من تطبيقات التوصيل والنقل تعامل العاملين كأصحاب عمل حر، فتحقّق من طريقة الدفع لك، واسأل فريق التأشيرات في جامعتك قبل التسجيل.'}},
    {id:'share', q:{en:'My employer won’t accept my share code', ar:'صاحب العمل لا يقبل رمز المشاركة'}, a:{en:'Check it’s a right-to-work code, not a right-to-rent one, and that it’s less than 90 days old. Make a new one if needed. Employers check it at gov.uk/view-right-to-work.', ar:'تأكد أنه رمز لحق العمل لا لحق الاستئجار، وأن عمره أقل من 90 يوماً، وأنشئ رمزاً جديداً إن لزم. يتحقق أصحاب العمل منه على gov.uk/view-right-to-work.'}},
    {id:'nonino', q:{en:'I haven’t got my NI number yet', ar:'لم أحصل على رقم التأمين بعد'}, a:{en:'You can still start work if you can prove your right to work. It can take up to 4 weeks to arrive. Tell your employer you’ve applied.', ar:'يمكنك بدء العمل إن استطعت إثبات حقك في العمل. قد يستغرق وصول الرقم حتى 4 أسابيع، فأخبر صاحب العمل أنك قدّمت الطلب.'}},
    ELSE('Ask your university’s immigration team, or call Citizens Advice Scotland on 0800 028 1456.', 'اسأل فريق الهجرة في جامعتك، أو اتصل بـ Citizens Advice Scotland على 0800 028 1456.'),
  ],
  after:[{journey:'edinburgh.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}}],
});

/* ---------- 10. Get a UK SIM card ---------- */
DATA.journeys['edinburgh.sim'] = base({
  need:'life', icon:'life',
  title:{en:'Get a UK SIM card', ar:'الحصول على شريحة هاتف بريطانية'},
  doneTitle:{en:'You’re connected.', ar:'أصبحت متصلاً.'},
  sources:[ESRC.ofcom],
  stuck:{cards:[{title:{en:'Ask in the shop', ar:'اسأل في المتجر'}, body:{en:'Phone shop staff set up SIMs every day. Show them the card below.', ar:'يجهّز موظفو متاجر الهواتف الشرائح كل يوم. اعرض عليهم البطاقة أدناه.'}}]},
  stages:[
    {id:'choose', level:'source', label:{en:'Choose', ar:'اختر'}, title:{en:'Choose how to pay', ar:'اختر طريقة الدفع'}, help:['credit','else'],
     blocks:[
      {t:'cards', v:[
        {color:'#2E7D5B', rec:true, name:{en:'Pay as you go', ar:'الدفع حسب الاستخدام'}, desc:{en:'Best when you’ve just arrived. No credit check and no contract: you top up when you need to.', ar:'الأفضل عند وصولك حديثاً. بلا تحقق ائتماني ولا عقد: تشحن الرصيد عند الحاجة.'}},
        {color:'#2F6DB5', name:{en:'SIM-only plan', ar:'باقة شريحة فقط'}, desc:{en:'A monthly plan for your own phone. Choose a 1-month rolling plan so you can leave any time, or 12 or 24 months.', ar:'باقة شهرية لهاتفك الخاص. اختر باقة شهرية متجددة لتستطيع الإلغاء متى شئت، أو باقة 12 أو 24 شهراً.'}},
        {color:'#B9C0C7', name:{en:'Phone contract', ar:'عقد مع هاتف'}, desc:{en:'A new phone plus a plan, usually for 12, 18 or 24 months. Often needs a credit check, a UK address and a UK bank account.', ar:'هاتف جديد مع باقة، عادةً لمدة 12 أو 18 أو 24 شهراً. غالباً يتطلب تحققاً ائتمانياً وعنواناً وحساباً بنكياً في بريطانيا.'}},
      ]},
     ]},
    {id:'buy', level:'source', label:{en:'Buy', ar:'اشترِ'}, title:{en:'Buy and set it up', ar:'اشترِ الشريحة وفعّلها'}, help:['locked','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Buy a SIM in a phone shop, a supermarket or online. Many networks also offer an eSIM you set up in an app.', ar:'اشترِ الشريحة من متجر هواتف أو سوبرماركت أو عبر الإنترنت. كما تقدم شبكات كثيرة شريحة إلكترونية (eSIM) تفعّلها عبر تطبيق.'},
        {en:'Put it in your phone, or scan the eSIM code, and follow the instructions to activate it.', ar:'ضعها في هاتفك أو امسح رمز الشريحة الإلكترونية، واتبع التعليمات لتفعيلها.'},
        {en:'Share your new UK number with your university, bank and GP.', ar:'شارك رقمك البريطاني الجديد مع جامعتك وبنكك وطبيبك.'},
      ]},
      {t:'tip', label:'tip', v:{en:'Before signing a plan, check the yearly price rise. Networks must show it in pounds and pence.', ar:'قبل توقيع أي باقة، تحقّق من الزيادة السنوية في السعر، إذ يجب على الشبكات عرضها بالجنيه والبنس.'}},
      {t:'phraseCard', v:{en:'Hello. I’ve just arrived in the UK. I’d like a pay-as-you-go SIM for my phone.', ar:'مرحباً. وصلت إلى بريطانيا للتو. أريد شريحة بنظام الدفع حسب الاستخدام لهاتفي.'}},
     ]},
  ],
  problems:[
    {id:'credit', q:{en:'I failed the credit check', ar:'لم أجتز التحقق الائتماني'}, a:{en:'That’s common for newcomers with no UK credit history. Use pay as you go or a SIM-only plan for now: most don’t need a credit check.', ar:'هذا شائع للقادمين الجدد دون سجل ائتماني في بريطانيا. استخدم الدفع حسب الاستخدام أو باقة الشريحة فقط الآن، فمعظمها لا يتطلب تحققاً ائتمانياً.'}},
    {id:'locked', q:{en:'My phone won’t accept the SIM', ar:'هاتفي لا يقبل الشريحة'}, a:{en:'Your phone may be locked to your old network. Contact your old provider to unlock it, or ask the phone shop for help. An eSIM won’t work on a locked phone either.', ar:'قد يكون هاتفك مقفلاً على شبكتك القديمة. تواصل مع مزوّدك السابق لفتحه، أو اطلب المساعدة من متجر الهواتف. ولن تعمل الشريحة الإلكترونية على هاتف مقفل أيضاً.'}},
    STAFF,
    ELSE('Ask in a phone shop, or contact the network through its app or website.', 'اسأل في متجر هواتف، أو تواصل مع الشبكة عبر تطبيقها أو موقعها.'),
  ],
  after:[{journey:'edinburgh.bus', name:{en:'Start using buses and trams', ar:'ابدأ باستخدام الحافلات والترام'}}, {journey:'edinburgh.gp', name:{en:'Register with a doctor', ar:'التسجيل لدى طبيب'}}],
});

/* ---------- 11. Community: library and volunteering ---------- */
DATA.journeys['edinburgh.community'] = base({
  need:'community', icon:'community',
  title:{en:'Find your people', ar:'اعثر على مجتمعك'},
  doneTitle:{en:'Edinburgh is starting to feel like home.', ar:'بدأت إدنبرة تشعرك بأنها بيتك.'},
  sources:[ESRC.library, ESRC.volunteer],
  stuck:{cards:[{title:{en:'Volunteer Edinburgh', ar:'Volunteer Edinburgh'}, body:{en:'Drop-in advisers help you find something that suits you, with extra support if English isn’t your first language.', ar:'يساعدك مستشارون متاحون دون موعد في العثور على ما يناسبك، مع دعم إضافي إن لم تكن الإنجليزية لغتك الأولى.'}}]},
  stages:[
    {id:'library', level:'source', label:{en:'Library', ar:'المكتبة'}, title:{en:'Join the library', ar:'انضم إلى المكتبة'}, help:['noid','else'],
     blocks:[
      {t:'p', v:{en:'Edinburgh’s libraries are free to join. They’re warm, quiet places with free Wi-Fi, events and groups, and a good way to meet people.', ar:'الانضمام إلى مكتبات إدنبرة مجاني. إنها أماكن دافئة وهادئة فيها إنترنت مجاني وفعاليات ومجموعات، وطريقة جيدة للتعرّف على الناس.'}},
      {t:'steps', v:[
        {en:'Register online to get a temporary number straight away. It lasts 6 months and lets you borrow up to 3 books.', ar:'سجّل عبر الإنترنت لتحصل فوراً على رقم مؤقت، صالح لمدة 6 أشهر ويتيح لك استعارة حتى 3 كتب.'},
        {en:'For a full card, visit any library with ID, like your passport or university card, and proof of your Edinburgh address.', ar:'للحصول على بطاقة كاملة، زر أي مكتبة ومعك إثبات هوية مثل جواز سفرك أو بطاقتك الجامعية، وإثبات عنوانك في إدنبرة.'},
      ]},
      {t:'link', url:'https://www.edinburgh.gov.uk/libraries/join-library', v:{en:'Join the library', ar:'انضم إلى المكتبة'}},
     ]},
    {id:'volunteer', level:'source', label:{en:'Volunteer', ar:'تطوّع'}, title:{en:'Volunteer', ar:'تطوّع'}, help:['visa','else'],
     blocks:[
      {t:'list', v:[
        {en:'Volunteer Edinburgh lists opportunities across the city that you can search online.', ar:'تعرض Volunteer Edinburgh فرص التطوع في أنحاء المدينة، ويمكنك البحث فيها عبر الإنترنت.'},
        {en:'Their advisers can help you choose, with extra support if English isn’t your first language.', ar:'يمكن لمستشاريهم مساعدتك في الاختيار، مع دعم إضافي إن لم تكن الإنجليزية لغتك الأولى.'},
      ]},
      {t:'tip', label:'important', v:{en:'On a visa? Check with your university’s immigration team before you start: some unpaid roles count as work.', ar:'لديك تأشيرة؟ استشر فريق الهجرة في جامعتك قبل أن تبدأ، فبعض الأدوار غير المدفوعة تُعدّ عملاً.'}},
      {t:'link', url:'https://www.volunteeredinburgh.org.uk/volunteer/how-to-volunteer/', v:{en:'Open Volunteer Edinburgh', ar:'افتح Volunteer Edinburgh'}},
     ]},
  ],
  problems:[
    {id:'noid', q:{en:'I don’t have proof of address yet', ar:'ليس لدي إثبات عنوان بعد'}, a:{en:'Register online first: the temporary number lets you borrow up to 3 books for 6 months. Get your full card once you have proof of address.', ar:'سجّل عبر الإنترنت أولاً، فالرقم المؤقت يتيح لك استعارة حتى 3 كتب لمدة 6 أشهر. واحصل على البطاقة الكاملة عندما يتوفر لديك إثبات العنوان.'}},
    {id:'visa', q:{en:'Is volunteering allowed on my visa?', ar:'هل يُسمح لي بالتطوع بتأشيرتي؟'}, a:{en:'Often yes, but some unpaid roles count as work and use up your hours. Ask your university’s immigration team before you start.', ar:'غالباً نعم، لكن بعض الأدوار غير المدفوعة تُعدّ عملاً وتُحتسب من ساعاتك. اسأل فريق الهجرة في جامعتك قبل أن تبدأ.'}},
    ELSE('Ask at any library, or visit Volunteer Edinburgh’s drop-in.', 'اسأل في أي مكتبة، أو زر Volunteer Edinburgh في أوقات الاستقبال دون موعد.'),
  ],
  after:[{journey:'edinburgh.bus', name:{en:'Start using buses and trams', ar:'ابدأ باستخدام الحافلات والترام'}}],
});

/* ---------- 12. School for your children ---------- */
DATA.journeys['edinburgh.school'] = base({
  need:'edu', icon:'edu',
  title:{en:'Find a school for your child', ar:'العثور على مدرسة لطفلك'},
  doneTitle:{en:'You’ve started your child’s school place.', ar:'بدأت إجراءات مقعد طفلك المدرسي.'},
  sources:[ESRC.catchment, ESRC.schoolApply, ESRC.placing],
  stuck:{cards:[{title:{en:'The school office', ar:'مكتب المدرسة'}, body:{en:'Call or visit your catchment school. The office can tell you if there’s a place and help with the form.', ar:'اتصل بمدرسة منطقتك أو زُرها. يمكن للمكتب إخبارك إن كان هناك مقعد متاح ومساعدتك في النموذج.'}}]},
  stages:[
    {id:'find', level:'source', label:{en:'Find', ar:'اعثر'}, title:{en:'Find your catchment school', ar:'اعثر على مدرسة منطقتك'}, help:['full','else'],
     blocks:[
      {t:'p', v:{en:'Every Edinburgh address has a catchment school: the local state school for your area. State schools are free.', ar:'لكل عنوان في إدنبرة «مدرسة منطقة»: المدرسة الحكومية المحلية لمنطقتك. والمدارس الحكومية مجانية.'}},
      {t:'steps', v:[
        {en:'Put your address into the council’s catchment school finder.', ar:'أدخل عنوانك في أداة البحث عن مدرسة المنطقة على موقع المجلس.'},
        {en:'Use the council’s Year Group Checker to see which year your child will join.', ar:'استخدم أداة التحقق من الصف الدراسي على موقع المجلس لمعرفة الصف الذي سينضم إليه طفلك.'},
      ]},
      {t:'link', url:'https://www.edinburgh.gov.uk/school-places/find-catchment-school', v:{en:'Find your catchment school', ar:'اعثر على مدرسة منطقتك'}},
     ]},
    {id:'apply', level:'source', label:{en:'Apply', ar:'قدّم'}, title:{en:'Apply for a place', ar:'قدّم على مقعد'}, help:['full','other','staff','else'],
     blocks:[
      {t:'steps', v:[
        {en:'Contact the school first to check it has a place, ideally before you move.', ar:'تواصل مع المدرسة أولاً للتأكد من وجود مقعد، ويُفضّل قبل انتقالك.'},
        {en:'Fill in the council’s Request for School Place form and send it to the school.', ar:'املأ نموذج «طلب مقعد مدرسي» (Request for School Place) من موقع المجلس وأرسله إلى المدرسة.'},
        {en:'The head teacher replies to you by letter.', ar:'يردّ عليك مدير المدرسة برسالة.'},
      ]},
      {t:'phraseCard', v:{en:'Hello. We’ve just moved to Edinburgh. Do you have a place for my child, and how do we apply?', ar:'مرحباً. انتقلنا إلى إدنبرة حديثاً. هل لديكم مقعد لطفلي، وكيف نقدّم؟'}},
     ]},
  ],
  problems:[
    {id:'full', q:{en:'The school is full', ar:'المدرسة ممتلئة'}, a:{en:'Your child goes on the school’s waiting list, in the order applications arrived. You can also ask for a place at another school with a placing request.', ar:'يُدرج طفلك في قائمة انتظار المدرسة حسب ترتيب وصول الطلبات. ويمكنك أيضاً طلب مقعد في مدرسة أخرى عبر «طلب نقل» (placing request).'}},
    {id:'other', q:{en:'I want a school outside my catchment', ar:'أريد مدرسة خارج منطقتي'}, a:{en:'Make a placing request to the council. Places go to catchment children first, so it depends on space.', ar:'قدّم «طلب نقل» إلى المجلس. تُعطى الأولوية لأطفال المنطقة، فالأمر يعتمد على توفر المقاعد.'}},
    STAFF,
    ELSE('Contact the school office, or the City of Edinburgh Council’s school places team through its website.', 'تواصل مع مكتب المدرسة، أو مع فريق المقاعد المدرسية في مجلس مدينة إدنبرة عبر موقعه.'),
  ],
  after:[{journey:'edinburgh.gp', name:{en:'Register with a doctor', ar:'التسجيل لدى طبيب'}}],
});

/* ---------- Menus: what shows under each need, and the first-week list ---------- */
const T = (journey, en, ar, nen, nar) => ({journey, name:{en, ar}, note:{en:nen, ar:nar}});
Object.assign(DATA.tasks, {
  'edinburgh.move':[
    T('edinburgh.airport', 'Get from the airport to the city', 'الوصول من المطار إلى المدينة', 'Airlink bus, tram or taxi', 'حافلة Airlink أو الترام أو التاكسي'),
    T('edinburgh.bus', 'Start using buses and trams', 'البدء باستخدام الحافلات والترام', 'Tap to pay and your first ride', 'الدفع بالتمرير وأول رحلة'),
    T('edinburgh.u22', 'Free bus travel if you’re under 22', 'التنقل المجاني بالحافلات لمن دون 22 عاماً', 'Apply for a Young Scot card', 'قدّم على بطاقة Young Scot'),
  ],
  'edinburgh.docs':[T('edinburgh.evisa', 'Set up your eVisa and share codes', 'إعداد تأشيرتك الإلكترونية ورموز المشاركة', 'Your UKVI account and proving your status', 'حسابك في UKVI وإثبات وضعك')],
  'edinburgh.health':[T('edinburgh.gp', 'Register with a doctor (GP)', 'التسجيل لدى طبيب عام (GP)', 'Plus where to go when you’re unwell', 'وإلى أين تذهب عندما تمرض')],
  'edinburgh.money':[T('edinburgh.bank', 'Open a bank account', 'فتح حساب بنكي', 'What to bring, and staying safe', 'ماذا تحضر، وكيف تبقى آمناً')],
  'edinburgh.housing':[
    T('edinburgh.rent', 'Rent a home safely', 'استئجار سكن بأمان', 'Scams, deposits and your rights', 'الاحتيال والتأمين وحقوقك'),
    T('edinburgh.counciltax', 'Council tax and TV licence', 'ضريبة المجلس ورخصة التلفزيون', 'Including the student exemption', 'بما في ذلك إعفاء الطلاب'),
  ],
  'edinburgh.work':[T('edinburgh.work', 'Work while you study', 'العمل أثناء الدراسة', 'Your hours, share code and NI number', 'ساعاتك ورمز المشاركة ورقم التأمين')],
  'edinburgh.edu':[T('edinburgh.school', 'Find a school for your child', 'العثور على مدرسة لطفلك', 'Catchment schools and applying', 'مدارس المنطقة والتقديم')],
  'edinburgh.life':[T('edinburgh.sim', 'Get a UK SIM card', 'الحصول على شريحة هاتف بريطانية', 'Pay as you go, SIM-only or contract', 'دفع حسب الاستخدام أو شريحة فقط أو عقد')],
  'edinburgh.community':[T('edinburgh.community', 'Find your people', 'اعثر على مجتمعك', 'Libraries and volunteering', 'المكتبات والتطوع')],
});
DATA.firstWeek.edinburgh = [
  {journey:'edinburgh.airport', name:{en:'Get from the airport to the city', ar:'الوصول من المطار إلى المدينة'}},
  {journey:'edinburgh.sim', name:{en:'Get a UK SIM card', ar:'الحصول على شريحة هاتف بريطانية'}},
  {journey:'edinburgh.evisa', name:{en:'Set up your eVisa and share codes', ar:'إعداد تأشيرتك الإلكترونية ورموز المشاركة'}},
  {journey:'edinburgh.gp', name:{en:'Register with a doctor (GP)', ar:'التسجيل لدى طبيب عام (GP)'}},
  {journey:'edinburgh.bank', name:{en:'Open a bank account', ar:'فتح حساب بنكي'}},
  {journey:'edinburgh.u22', name:{en:'Free bus travel if you’re under 22', ar:'التنقل المجاني بالحافلات لمن دون 22 عاماً'}},
];
})();
