# French and Arabic strings for review (Cleo → Ina, 29 October)

**Status: awaiting language review.** I wrote these translations; nobody has checked them yet. They're used in the trial app's interface (`workers/trial-ui/translations.json`).

Generated from `translations.json`: every key added after batch 1 (`c42dea0`), **38 strings**. Please correct them in place, or note changes here. ("Reviewed by" is now "Relu par", after Ina's review.)

| English | French | Arabic |
|---|---|---|
| Family plans | Plans de la famille | خطط العائلة |
| Needs you | À faire par vous | بانتظارك |
| Waiting for them | En attente de leur réponse | بانتظارهم |
| All steps done | Toutes les étapes sont terminées | اكتملت كل الخطوات |
| Each person’s plans, side by side. Labels are your own short words, kept in your account. | Les plans de chaque personne, côte à côte. Les libellés sont vos propres mots, conservés dans votre compte. | خطط كل شخص جنباً إلى جنب. التسميات كلماتك القصيرة، وتُحفظ في حسابك. |
| Deadline | Date limite | الموعد النهائي |
| Due | À faire avant le | مستحق في |
| About | Vers le | حوالي |
| confirmed by you | confirmée par vous | أكّدته بنفسك |
| not sure yet | pas encore sûr | غير متأكد بعد |
| the date has passed | la date est passée | انقضى الموعد |
| within a week | dans moins d’une semaine | خلال أسبوع |
| Where you saw it | Où vous l’avez vue | أين رأيته |
| Where you saw it (optional) | Où vous l’avez vue (facultatif) | أين رأيته (اختياري) |
| Reminder in your calendar | Rappel dans votre agenda | التذكير في تقويمك |
| Couldn’t add the reminder. Check the date, or add it in the calendar. | Impossible d’ajouter le rappel. Vérifiez la date ou ajoutez-le dans l’agenda. | تعذّرت إضافة التذكير. تحقّق من التاريخ أو أضفه في التقويم. |
| Deadline date | Date limite | تاريخ الموعد النهائي |
| How sure are you of this date? | Êtes-vous sûr de cette date ? | ما مدى تأكدك من هذا التاريخ؟ |
| I’m not sure of the date yet | Je ne suis pas encore sûr de la date | لست متأكداً من التاريخ بعد |
| I’ve confirmed this date | J’ai confirmé cette date | أكّدت هذا التاريخ |
| Save date | Enregistrer la date | حفظ التاريخ |
| Add a date | Ajouter une date | إضافة تاريخ |
| Remove date | Supprimer la date | حذف التاريخ |
| This is your own date, not an official one. If you’re not sure, check it with the office. | C’est votre propre date, pas une date officielle. En cas de doute, vérifiez auprès du service. | هذا تاريخك أنت، وليس تاريخاً رسمياً. إن لم تكن متأكداً، فتحقّق منه لدى المكتب. |
| Next date | Prochaine date | التاريخ القادم |
| Dubai only | Dubaï uniquement | دبي فقط |
| Applies across the UK | S’applique dans tout le Royaume-Uni | ينطبق في كل أنحاء المملكة المتحدة |
| Scotland only | Écosse uniquement | اسكتلندا فقط |
| Edinburgh only | Édimbourg uniquement | إدنبرة فقط |
| Sources checked | Sources vérifiées le | تم التحقق من المصادر في |
| Moving from the UK to the UAE | Départ du Royaume-Uni vers les Émirats | الانتقال من المملكة المتحدة إلى الإمارات |
| Sources partly checked | Sources vérifiées en partie le | تم التحقق جزئياً من المصادر في |
| Source check not recorded | Vérification des sources non enregistrée | لم يُسجَّل التحقق من المصادر |
| Reviewed by | Relu par | راجعه |
| A review covers this version of the guide, not a live check of every detail. | Une relecture porte sur cette version du guide ; ce n’est pas une vérification en direct de chaque détail. | تشمل المراجعة هذه النسخة من الدليل، لا تحققاً مباشراً من كل تفصيل. |
| Awaiting review: no one has reviewed this guide yet. Check fees, documents and deadlines with the official source. | En attente de relecture : personne n’a encore relu ce guide. Vérifiez les frais, les documents et les délais auprès de la source officielle. | بانتظار المراجعة: لم يراجع أحد هذا الدليل بعد. تحقّق من الرسوم والمستندات والمواعيد لدى المصدر الرسمي. |
| Scotland · some details are for Edinburgh (NHS Lothian) | Écosse · certains détails concernent Édimbourg (NHS Lothian) | اسكتلندا · بعض التفاصيل خاصة بإدنبرة (NHS Lothian) |
| Across the UK · eligibility depends on the bank and on you | Tout le Royaume-Uni · l’éligibilité dépend de la banque et de vous | كل أنحاء المملكة المتحدة · الأهلية تعتمد على البنك وعليك |

## Arabic in guide content (also needs review)

These are in the journey files, not in `translations.json`:

- `js/content-docs.js`: the whole **before-you-move document guide** (titles, steps, items, problems, source names). It's a first draft, revised after Ina's review. The terms are kept distinct: الأبوستيل (UK apostille, with مكتب الأبوستيل البريطاني for the Legalisation Office), **تصديق المستندات / تصديق وزارة الخارجية الإماراتية** (UAE attestation, MoFA's own term), الاعتراف بالمؤهل (qualification recognition), and موثّقة for notary-certified copies. **Please confirm MoFA's exact Arabic name for its "through UAE missions abroad" service.** The guide describes it without quoting a service name.
- `js/content-edinburgh.js` (bank guide): the corrected FSCS line (eligible deposits, shared banking licences).
- `js/content.js`: two new source names on the student visa journey (u.ae pages).
- `js/content-edinburgh.js`: the GOV.UK police-registration source name, the updated police answer (4 August 2022), the two corrected dental lines in the GP guide, and the gov.scot dental-charges source name.
