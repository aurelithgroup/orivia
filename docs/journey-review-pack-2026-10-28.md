# Journey review pack: demo routes (Cleo → Ina, 28 October, Dubai)

**Status: no journey is "reviewed".** A review is recorded only by a person, with `tools/review-guide.mjs` (from Ina's batch 1). `workers/guide-review-records.mjs` is empty, and nothing here creates a record. This pack is the source check that makes your review quicker:
- what was checked against the live official page today, with quotes;
- what was changed;
- what still needs your judgement.

Pages were fetched on 28 October, between 20:55 and 21:30 Dubai time. The journey data was regenerated from the app afterwards (`server/src/journeys-data.js`). Only the student visa journey's sources and the police answer changed in it.

## 1. UAE: `dubai.eid.student`, "Your student residence visa and Emirates ID"

**Last checked in the app:** 26 Sep 2026. **Review due:** 25 Dec 2026. **Review record:** none.

| Claim in the journey | Official source checked today | Result |
|---|---|---|
| The university sponsors the student's visa | u.ae, *Residence visa for studying in the UAE* (updated 28 Sep 2026): a student can stay "under the sponsorship of the accredited university/college he/she is studying at", or under a UAE-resident parent | **Supported** (the parent route isn't in the journey; consider adding it) |
| The university's certificate is needed | Same page: "a certificate issued by the university or institute specifying the duration of the study" | **Supported** |
| A medical fitness test is required | u.ae, *General provisions for the residence visa* (updated 28 Sep 2026): applicants "18 and above" must have a medical test | **Supported** (the "18 and above" condition isn't in the journey) |
| Biometrics, then the Emirates ID | Same page: "apply for an Emirates ID card from Federal Authority for Identity and Citizenship"; a security check is required | **Supported** for applying. Fingerprints aren't on the official page |
| Entry permit "usually 7–15 working days"; the whole process "about 3–5 weeks" | Not on either official page; from university pages only | **Not officially supported.** Keep it as "universities say", or remove it |
| "Some universities ask for this within 3 working days" | University pages | Labelled as some universities. **Fine as worded** |
| "Usually valid for 6+ months" (passport) | Not stated on the u.ae pages checked | **Not officially supported here.** Find the ICP service page, or soften the wording |

**Changed today (in the app source, then regenerated):** the two federal u.ae pages were added as the first sources. The university pages stay, labelled as universities.

**Arabic:** the two new source names are my translations. **Please check them.**

**Demo location (founder, 28 Oct):** the fictional Northbay is now set in **Dubai**, so this guide is offered in the demo. That doesn't approve it: the guide stays **source-checked, awaiting review**, and no review record exists. **Sharjah support is outstanding:** a version for Sharjah or the whole UAE needs content reviewed for Sharjah (health centre and other local details).
- set the fictional Northbay in Dubai;
- review a UAE-wide version for Sharjah (the federal steps are the same, but the health centre and other local details differ, and need checking).

## 2. UK: `edinburgh.evisa`, "Set up your eVisa and share codes"

**Last checked:** 27 Sep 2026. **Review record:** none (and see the limit below).

| Claim | Official source checked today | Result |
|---|---|---|
| "A share code lasts 90 days and can be used as many times as you need" | GOV.UK, *View and prove your immigration status*: "A share code lasts for 90 days", and it can be used as many times as needed before it expires | **Supported** |
| Share code cost "Free" (the step's cost field) | The same page doesn't mention cost | **Not supported by the cited page.** Find a source, or remove the cost |
| "Police registration for students has been stopped" | GOV.UK, *UK visas and registering with the police*: "The police registration scheme ended on 4 August 2022." | **Supported. Updated to give the date** |
| Source: University of Edinburgh police registration page | The page now redirects to a university staff sign-in | **Replaced** with the GOV.UK page (I didn't follow the sign-in) |

**Arabic:** the new source name and the updated police answer are my translations. **Please check them.**

## 3. UK: `edinburgh.counciltax` (student discount)

| Claim | Source checked today | Result |
|---|---|---|
| "Full-time means a course of at least 24 weeks, at 21 hours or more a week" | City of Edinburgh Council, *Student council tax discount*: "study for 24 weeks for 21 hours per week in each academic year", and the course must also be classed as full time by the institution | **Supported.** Consider adding the "classed as full time" condition and the evidence route for institutions not on the council's list |

## 4. UK: `edinburgh.gp`

| Claim | Source | Result |
|---|---|---|
| "Prescriptions are free in Scotland" and the other NHS Inform claims | NHS Inform returned **403** to an automated fetch | **Not checked today.** Please check by hand |
| NHS dental treatment "up to £384" | Not fetched | **Not checked today** |

## 5. New (29 Oct): `dubai.docs.before`, "Get your documents ready before you move (UK to UAE)"

**Status: source-checked, awaiting review.** No review record exists. File: `js/content-docs.js` (English and a first-draft Arabic). Pages were fetched on 29 Oct between 01:45 and 03:30 UTC (05:45–07:30 Dubai).

It keeps batch 1's rule: **no universal attestation rule is asserted.** Legalisation, attestation and recognition steps are titled "if you're asked to", and step 1 is to ask the university (and any employer) what they need.

| Claim in the guide | Official source checked | Result |
|---|---|---|
| Ask the person who wants the document whether it must be legalised | GOV.UK, *Get a document legalised*: ask the person requesting it whether it needs legalising, and which apostille | **Supported** |
| Some documents must be certified by a UK notary or solicitor first; documents from a court, public registry, government department or registered doctor don't | Same page | **Supported** |
| Paper apostille (post) or e-Apostille (PDFs signed by a UK notary or solicitor) | Same page | **Supported** |
| £45 per document (standard), plus postage; no refund if it can't be legalised | Same page | **Supported** |
| Usually up to 25 working days (standard), plus postage | Same page | **Supported** |
| The UAE MoFA attests documents issued outside the UAE through "Attestation through UAE Missions Abroad", only at selected missions; check the mission where you live; otherwise in person | MoFA, *Attestation of Official Documents and Certificates* | **Supported.** The UAE Embassy London attestation pages returned **404**, so the guide doesn't name a London-specific process |
| Degree recognition is a separate MoHESR service; its report is for employment, further studies, visas and government services | u.ae, *Student admission and qualification recognition* (updated 22 Oct 2026) | **Supported.** The page doesn't say it's needed for admission, so the guide says to apply only if asked |
| University or parent sponsors the student visa; study-duration certificate; passport copy and medical insurance; medical test 18+; Emirates ID | u.ae student residence and general provisions pages (see section 1) | **Supported** |
| No MoFA or recognition fee or time shown | Not on the pages checked | **Left out on purpose** |

**For your judgement:**
- the wording "if you're asked to" for attestation;
- whether to name the London mission once its page is back;
- the Arabic.

## 6. New (29 Oct): UK journeys in the catalogue, with where each applies

All 12 Edinburgh journeys are now in the app's catalogue. They can be followed as plans, with preparation ticks, family plans and deadlines. They're offered only where they apply. **Each is "awaiting review".** Only the eVisa, Council Tax and GP claims were source-checked (sections 2–4).

| Scope shown | Journeys | Why (from their sources) |
|---|---|---|
| Applies across the UK | `evisa`, `work`, `sim`; `bank` is labelled "Across the UK · eligibility depends on the bank and on you" | GOV.UK / UKCISA / Ofcom: UK-wide matters. `bank` also cites university advice |
| Scotland only | `rent`, `u22`; `gp` is labelled "Scotland · some details are for Edinburgh (NHS Lothian)" | NHS Scotland and NHS Lothian, Scottish tenancy law, Scotland's under-22 travel |
| Edinburgh only | `airport`, `bus`, `counciltax`, `community`, `school` | City of Edinburgh Council, Lothian Buses, Edinburgh Trams, Edinburgh Airport |
| Moving from the UK to the UAE | `dubai.docs.before` | GOV.UK legalisation, then UAE federal attestation and recognition |

**Please confirm the scopes.** Section 8 separates the broad rules from the local or provider-dependent details for `gp` and `bank`. Code: `guideScope` in `workers/orivia-guide-offers.mjs`. Tests: `tests/uk-guides.test.mjs` and `tests/docs-before-guide.test.mjs`.

## 7. Limits of this pack

- **What this pack checked:** only the claims listed above, against the pages named. It's not a full review of every step, link or translation. The other UK journeys (bank, rent, work, sim, u22, airport, bus, community, school) weren't source-checked in this pack.
- **Interface translations:** the 31 new French and Arabic strings are listed separately in `docs/translations-for-review-2026-10-29.md`.
- **Sharjah:** still outstanding. The demo is set in Dubai.
- **No provider or search spend:** pages were fetched directly. Nothing was deployed.

## 8. New (29 Oct): source checks of more UK journeys, with broad rules and local examples kept apart

Pages were fetched on 29 Oct, about 07:05–07:20 UTC. Each guide below now has a **partial** source-check record (`workers/guide-source-checks.mjs`). The app shows "Sources partly checked 29 Oct 2026" only for these guides and the ones in sections 1–5. Every other guide shows "Source check not recorded", whatever date its journey file carries. **All remain awaiting review.**

### `edinburgh.gp`: Scotland-wide rules vs Edinburgh (NHS Lothian) details

| Claim | Type | Source checked | Result |
|---|---|---|---|
| NHS Pharmacy First is for people registered with a GP in Scotland or living in Scotland | Scotland-wide | gov.scot, *NHS Pharmacy First Scotland* | **Supported** |
| "Prescriptions are free in Scotland" | Scotland-wide | gov.scot page doesn't say; NHS Inform refused automated access (403) | **Not confirmed today**: please check by hand |
| Dental: "NHS dental treatment isn't free: up to £384" | Scotland-wide | gov.scot FOI response, 1 Apr 2026: free for under-26s (and in pregnancy, up to 12 months after birth, or on certain benefits); check-ups free; otherwise 80% up to £384 | **Was misleading for most students. Corrected**: "In Scotland, NHS dental check-ups are free. NHS treatment is free if you're under 26 (and in some other cases); otherwise you pay 80% of the cost, up to £384…" Source added |
| NHS Lothian lists practices taking NHS patients each month | **Local (Edinburgh)** | NHS Lothian page (cited) | Now says "In Edinburgh, …". Not fetched today |
| University of Edinburgh Health Service registers online only | **Local (one university)** | ed.ac.uk page (cited) | Not fetched today. It only applies to that university's students |
| Minor injuries unit and patient registration pages | **Local (NHS Lothian)** | services.nhslothian.scot (cited) | Not fetched today |

**App label:** "Scotland · some details are for Edinburgh (NHS Lothian)". Lothian instructions are no longer presented as Scotland-wide.

### `edinburgh.bank`: UK-wide protection vs provider-dependent eligibility

| Claim | Type | Source checked | Result |
|---|---|---|---|
| Money in a UK bank is protected up to £120,000 per person, per bank, by the FSCS | UK-wide | FSCS, *Banks and building societies*: £120,000 per eligible person, per bank, building society or credit union (failures after 30 Nov 2025); banks sharing a banking licence count as one; joint accounts share the limit | **Corrected after Ina's review.** The line now says eligible deposits, and that banks sharing a licence count as one. (My earlier "per firm" note was wrong.) |
| Which bank will open an account, and what ID and address proof it accepts | **Depends on the bank and the applicant** | Not a single official rule | The guide must say "ask the bank". **App label:** "Across the UK · eligibility depends on the bank and on you" |

### `edinburgh.rent` (Scotland)

| Claim | Source checked | Result |
|---|---|---|
| The deposit can be no more than 2 months' rent | mygov.scot, *Paying rent and deposit* (updated 7 May 2026) | **Supported** |
| Up to 6 months' rent in advance | Same | **Supported** |
| "Only rent and a deposit. Agency fees, key money, holding fees and credit-check fees are illegal, and you can claim them back." | Same page: no non-refundable holding deposit or key money; no credit-check fee; landlords may also ask for a guarantor, ID and references | **Partly supported.** "Agency fees" and "claim them back" weren't on this page; "holding fees" should read "non-refundable holding deposit". **Not edited**: please decide the wording |
| The deposit goes into one of 3 approved schemes within 30 working days; you're told which in writing | mygov.scot, *Tenancy deposit protection* (updated 1 Apr 2025) | **Supported** (written details within 30 days) |
| 28 days' written notice to leave | mygov.scot, *Tenant: give notice* | **Supported** (allow 2 extra days for delivery by post or email) |
| Adverts must show the landlord registration number | Not fetched today | **Not checked** |

### `edinburgh.work` (UK-wide)

| Claim | Source checked | Result |
|---|---|---|
| Up to 20 hours a week in term time (degree level); up to 10 (below); a week is any 7 days starting on a Monday | UKCISA, *Student work* | **Supported by UKCISA** (adviser). GOV.UK's *Student visa: work* page doesn't give the figures |
| National Insurance number: "free and can take up to 4 weeks" | GOV.UK, *Apply for a National Insurance number* | **"Up to 4 weeks" supported. "Free" isn't stated** on the page |

### `edinburgh.u22` (Scotland)

| Claim | Source checked | Result |
|---|---|---|
| Aged 5 to 21 and live in Scotland | mygov.scot, *Under-22 bus pass* (updated 10 Mar 2026) | **Supported** |
| "Live in Scotland for at least 6 months of the year" | Not on that page | **Not confirmed today** |
| Card arrival times (10 working days online, 2+ weeks through the council) | Not on that page | **Not confirmed today** |

### Not checked yet

`edinburgh.sim`, `edinburgh.airport`, `edinburgh.bus`, `edinburgh.community` and `edinburgh.school` have no source-check record, and show "Source check not recorded". *(Checked later the same day: see section 10.)*

### Data incident found and fixed (29 Oct)

- **What happened:** my local export tool decoded uploaded data in pieces, and the pieces could split an Arabic character. Commits `4ba903e`, `2cf3864` and `4f50b3e` (all pushed) had **3 corrupted Arabic strings** in `server/src/journeys-data.js`, the data the trial app and assistant read:
  - one in a visa-guide sentence;
  - one in an emergency-care answer;
  - one on a staff-phrase card.
- **What wasn't affected:** the app's own source files (`js/`).
- **Fix:** the tool now decodes the complete upload once, and refuses any upload containing a replacement character. The data was regenerated and has 0 replacement characters.
- **Check:** compared with the clean export at `1ef235c`, the only differences are the intended changes:
  - `dubai.eid.student` sources;
  - `edinburgh.evisa` police source and answer;
  - `edinburgh.gp` dental correction and source;
  - the new `dubai.docs.before`.
- **Deployed?** Nothing was deployed, so no live user saw the corruption.

## 9. Fixed after Ina's review of `6fddbd2` (29 Oct)

Regression cases for her exact examples are in `tests/ina-review-week6.test.mjs`.

| Ina's finding | Fix |
|---|---|
| "GP guide" in Manchester gave Scotland's guide; "I got a council tax bill" gave Edinburgh's | Problem and refresher requests now pass the same place check as offers. The exception is a guide the person already follows or saved themselves |
| "I moved from Dubai to London" offered the UK-to-UAE documents guide | The direction is read from "from X to Y" in the person's words, or from their profile ("moved from" the UK and living in or moving to the UAE). Mentioning both places isn't enough |
| The assistant was told it was presenting a "checked guide" | The guide card now gives the real status, for example "awaiting review; sources partly checked 2026-10-29", and says never to call a guide checked, verified or reviewed unless that status says so |
| Changing or removing a deadline left its old calendar reminder; a change of certainty kept an old "Deadline" reminder | A new date, a change of certainty or removing the date now removes the linked reminder (`staleReminder`). Editing only the note keeps it |
| Undo after leaving Blocked lost the blocked note | Your fix from `07fe82d` (`fromNote`/`toNote` on history; Undo restores the note, and refuses if it changed since) merged into `plan-steps.js`, with your test lines |
| Bank protection wording | Now says eligible deposits, and that banks sharing a licence count as one bank |
| Apostille eligibility and the receiving organisation's requirements | UK-issued documents only; which documents qualify as they are and which need a notary or solicitor first; which can't get an e-Apostille; and asking the requester about paper or e-Apostille, one apostille or several, and originals or certified copies |
| French "Reviewed by" | Now "Relu par". The related sentences use relecture (editorial review) rather than vérification |
| Arabic terms (corrected again after Ina's recheck) | UAE attestation uses MoFA's official **تصديق المستندات**, qualified as **تصديق وزارة الخارجية الإماراتية**. The UK side uses only **الأبوستيل** (Legalisation Office: مكتب الأبوستيل البريطاني). Recognition stays **الاعتراف بالمؤهل**. Notary-certified copies are **موثّقة**. The earlier non-official الاعتماد is removed |
| Move direction, negated or corrected (Ina's recheck) | "I am not moving from London to Dubai" no longer triggers the guide, even with a UK-to-UAE profile. A correction to, or any statement of, the UAE-to-UK direction means no offer. So does "no longer moving" |

Still the case: **no guide review records exist.** The remaining source checks and visual review are pending.

## 10. New (29 Oct): source checks of airport, bus, SIM, community and school

Pages were fetched on 29 Oct, between about 07:59 and 08:04 UTC. Each of the five guides now has a **partial** source-check record (`workers/guide-source-checks.mjs`) and shows "Sources partly checked 29 Oct 2026". **All remain awaiting review.**

Some sites refuse automated access: Ofcom (403, then a bot challenge in a browser), Volunteer Edinburgh (418) and the Lothian Buses help centre (403). I did not try to get past those checks. For those claims, the result rests on **search results that quote the organisation's own pages** and is marked "via search". Please confirm those by hand.

### `edinburgh.airport` (Edinburgh only)

| Claim | Source checked | Result |
|---|---|---|
| Airlink 100 runs 24 hours to Waverley Bridge, in about 30 minutes | Lothian Buses, *Airport buses* ("24/7 Express Service"); Edinburgh Airport, *City bus links* ("average journey time of 30 minutes", final stop Waverley Bridge) | **Supported** |
| £6.00 single, £8.50 open return | Lothian Buses, *Airport buses*; the 22 Feb 2026 fares notice says Airlink fares are unchanged | **Supported** |
| Leaves from Stop A, next to the plaza | Edinburgh Airport, *City bus links* | **Supported** |
| Up to every 10 minutes by day, every 20 at night | Lothian Buses (every 20, 01:15–04:00); the airport page says 15–20 | **Supported** |
| Cash needs the exact fare; contactless and the app are accepted | Lothian Buses, *Airport buses* | **Supported** (American Express isn't accepted, which the guide doesn't mention) |
| Tram: £7.90 single from the airport; stop right outside the terminal by the plaza and the Edinburgh sign | Edinburgh Trams, *Ticket options*; Edinburgh Airport, *Trams* | **Supported** |
| £10 for boarding without a ticket or tap-on; forget to tap off and you may pay the airport fare | Edinburgh Trams, *FAQs* | **Supported** |
| Tram customer relations 0131 338 5780 | Edinburgh Trams, *Get in touch* ("Customer Relations & Lost Property") | **Supported** |
| Taxi: official company Capital Cars; cross the plaza past the Edinburgh sign and follow the signs | Edinburgh Airport, *Taxis* | **Supported** |
| "The official rank is outside the terminal" | Same page: in the East Terminus, "a short walk from arrivals" | **Corrected**: "a short walk from arrivals" |
| App-booked rides: multi-storey ground floor "which charges drivers", or a free Long Stay zone about 10 minutes' walk away | Same page: a charged zone on the ground floor and a free zone in Long Stay, about a ten-minute walk; it doesn't say who pays | **Corrected**: "the charged zone on the ground floor…" |
| "Tell the driver where you're going"; "shops in the terminal can break a note" | Not on the pages checked | **Not checked** |

### `edinburgh.bus` (Edinburgh only)

| Claim | Source checked | Result |
|---|---|---|
| £2.40 single; contactless caps of £5.70 a day and £26.50 Monday to Sunday | Lothian Buses, *Fares from 22 Feb 2026* and *Contactless* | **Supported** |
| Tap once on boarding, not when you get off | Lothian Buses, *Contactless* ("no need to tap off") | **Supported** |
| Charges for the last 28 days at lothian.cloudfare.co.uk | Same | **Supported** |
| Ridacard £26.50 a week or £80 for 4 weeks | Fares notice (adult prices; student prices are £23 and £68) | **Supported** for adults. The guide doesn't mention the cheaper student Ridacard; that's worth adding after review |
| Night buses midnight to 4:30am; night single £3.50 | Lothian Buses, *Visitor guide*; fares notice | **Supported** |
| Signal to the driver; press the stop button; exact cash only; Bus & Tram app for tickets and live times | Lothian Buses, *Visitor guide* | **Supported** |
| "Get on at the front" | Not stated on the visitor guide | **Not checked** |
| Tram: tap on and off, £10 on-board fare, airport fare if you don't tap off | Edinburgh Trams, *FAQs* | **Supported** (concession and Ridacard holders needn't tap off) |
| Bus lost property only through the online form | Lothian Buses help centre (403 to automated access) | **Supported via search**: Lothian's help article says it can't take lost-property enquiries by phone. Please confirm by hand |
| Tram lost property 0131 338 5780 | Edinburgh Trams, *Get in touch* | **Supported** |
| Free bus travel at 21 or under, living in Scotland | Checked in section 8 (`edinburgh.u22`) | **Supported** |

### `edinburgh.sim` (UK-wide)

| Claim | Source checked | Result |
|---|---|---|
| Pay as you go: no contract and no credit check | Ofcom, *Choosing the right mobile package* (blocked) and Ofcom's 2024 mobile monitoring report | **Supported via search** |
| SIM-only: 1-month rolling, or 12 or 24 months | Ofcom, *Choosing the right mobile package* | **Supported via search** |
| Failed credit check: "Use pay as you go or a SIM-only plan for now: most don't need a credit check" | Ofcom's 2022 pricing annex: 30-day pay-monthly SIM-only contracts require a credit check | **Wrong for SIM-only. Corrected**: "Use pay as you go for now: it doesn't need a credit check. Monthly SIM-only plans usually do." (English and Arabic) |
| Yearly price rises must be shown in pounds and pence | Ofcom: rules for new contracts from 17 Jan 2025 | **Supported via search** |
| A phone may be locked to its old network | Ofcom: UK providers may not sell locked phones since Dec 2021. Phones bought abroad, or older UK phones, can still be locked | **Supported**. The advice fits newcomers' phones |
| Contracts usually last 12, 18 or 24 months, often with a credit check, a UK address and a UK bank account | Not on a page I could read | **Not checked** |

### `edinburgh.community` (Edinburgh only)

| Claim | Source checked | Result |
|---|---|---|
| Online sign-up gives a temporary number for 6 months that lets you borrow up to 3 books | City of Edinburgh Council, *Join the library* | **Supported** |
| A full card needs ID (passport or university card) and proof of an Edinburgh address | Same: ID includes passport and "university or college ID"; proof of an EH-postcode address | **Supported** |
| Libraries are free to join, with free Wi-Fi | Council join page and library internet terms, via search | **Supported via search** |
| "Warm, quiet places… a good way to meet people" | A description, not a fact from a source | **Not checked** |
| Volunteer Edinburgh lists opportunities to search online, has drop-in advisers, and gives extra help when English isn't your first language | Volunteer Edinburgh (418 to automated access) | **Supported via search**: drop-ins need no appointment; there's a contact route for people with little English |
| On a visa, some unpaid roles count as work; check with the university | Not checked against UKVI guidance | **Not checked** |

### `edinburgh.school` (Edinburgh only)

| Claim | Source checked | Result |
|---|---|---|
| "Every Edinburgh address has a catchment school: the local state school" | City of Edinburgh Council, *Find your catchment school*: every household has a catchment area; most addresses have four catchment schools (non-denominational and Roman Catholic, primary and secondary) | **Corrected**: "catchment schools … usually a primary and a secondary, with Roman Catholic schools too" |
| Use the council's catchment finder | Same (interactive map; search by house number and street, not postcode alone) | **Supported** |
| Year Group Checker | Council, *Apply for a school place* | **Supported** |
| Contact the school first, ideally before you move; send the Request for School Place form to the school; the head teacher replies by letter | Same | **Supported** |
| Full school: waiting list in the order applications arrived | Same ("by the date we received your request") | **Supported** |
| Outside catchment: "Make a placing request to the council" | Council, *School placing requests*: for most year groups you apply to the school; P1 and S1 admissions go to the Schools Transactions team; catchment children come first | **Wrong route. Corrected**: "Make a placing request to that school. For a child starting P1 or S1, the council's admissions team handles it…" |
| "State schools are free" | Not stated on the council pages checked | **Not checked** |

### What changed in the data

`server/src/journeys-data.js` was regenerated. Its diff against the previous commit is exactly the four changed lines above, in English and Arabic: airport ride pick-up, SIM credit check, catchment schools and placing request. The taxi-rank line is a choice-card description, which the export doesn't carry. It contains no U+FFFD characters. The new Arabic wording joins the language review.

After this section, every Edinburgh journey has a source-check record. Of the Dubai journeys, only `dubai.eid.student` and `dubai.docs.before` do; the other 20 (for example `dubai.nol`, `dubai.sim`, `dubai.rent`, the other Emirates ID routes and the insurance guides) still show "Source check not recorded". **No guide has a review record.**

## 11. New (29 Oct, evening): school start and return, and eight Dubai guides

Checked between about 18:00 and 18:40 UTC on 29 Oct. **Everything here is awaiting review.** No review record was created.

What the results mean:
- **Supported:** the official page says it.
- **Via search:** the page couldn't be read directly (KHDA: certificate error; Sanadak: 403; one u.ae page: 404). The result rests on search results that quote that page.
- **Not confirmed:** no official page was found that says it. The claim stays in the guide, marked here, for the reviewer to keep, reword or remove.

**Arabic:** the new school steps carry `pendingAr`. In Arabic, the app shows *ترجمة لم تُراجع بعد* (Arabic not yet reviewed) on those steps, and the assistant's copy marks them `translationPending: ['ar']`. These Arabic lines need a language review.

### `dubai.school`: new steps "Starting at the new school" and "Going back after a break or a move"

These steps are at draft level and marked `viaSearch`.

| Claim | Source | Result |
|---|---|---|
| Transfer certificate from Grade 2 / Year 3 up, or an official end-of-year report | KHDA, *Register a new student* | **Via search: supported** |
| Certificates from outside the UAE attested in the issuing country, by its education authority and for the UAE Ministry of Foreign Affairs | KHDA, *Register a new student* | **Via search: supported.** The guide tells parents to ask the school which stamps it needs |
| Certificates in Arabic or English, otherwise a legal translation | KHDA | **Via search: supported** |
| 2026–27 September-start schools: winter break 14 Dec 2026 to 4 Jan 2027, spring break 5 to 12 Apr 2027; some schools start in April | KHDA, *Academic calendar* | **Via search: supported.** The search output was partly garbled; check the exact days before relying on them |
| The old school can hold the transfer certificate until fees are paid | KHDA, *Registration and refund policy* | **Via search: supported** |
| A leaving certificate verified by KHDA when leaving Dubai's private schools | KHDA, *Guide for parents* and services | **Via search: supported** |
| Absence isn't withdrawal; tell the school in writing | KHDA refund policy | **Via search: supported** |

### `edinburgh.school`: new steps "Starting school" and "Term dates and going back"

These pages were read directly.

| Claim | Source | Result |
|---|---|---|
| Free school lunch for every child in P1–P5 at council schools, whatever the income | mygov.scot, *School meals* | **Supported** |
| From P6, and for milk and clothing grants, low-income families apply; automatic June award with Housing Benefit or Council Tax Reduction | Edinburgh Council, *Free school meals, milk and school clothing grants* | **Supported** |
| Free meals in P6/P7 with the Scottish Child Payment (problem answer) | same | **Supported** |
| 2026–27: start Wed 12 Aug 2026; holidays 12–19 Oct, 21 Dec–5 Jan, 15–19 Feb, 5–19 Apr; a single holiday on Mon 14 Sep; end Tue 29 Jun 2027 | Edinburgh Council, *School term dates* | **Supported.** A council PDF found by search gives different October and February dates; the web page was used |
| Moving mid-year: use the same Request for School Place form | already in this guide's apply step | Not rechecked |

### Eight Dubai guides (partial)

| Guide | Claim | Source | Result |
|---|---|---|---|
| `dubai.nol` | Top up at least AED 20 at the Metro machine | RTA notice (from 1 Mar 2025, at Metro machines; other channels from AED 5) | **Supported** |
| `dubai.nol` | The gate may not open below about AED 7.50 | RTA nol terms (minimum balance 7.5) | **Supported** |
| `dubai.taxi` | A street taxi starts at AED 5 (6am–10pm) or AED 5.5 (10pm–6am) | RTA, *Taxi fares in Dubai* | **Supported** |
| `dubai.taxi` | Booking in an app starts from AED 9 | same (AED 9 or 13, by time of day) | **Supported** |
| `dubai.taxi` | The ride is free if the meter isn't running | same ("The meter is not in operation") | **Supported** |
| `dubai.sim` | Residents up to 5 SIMs per provider, visitors up to 2 | TDRA FAQ | **Via search: supported** |
| `dubai.rent` | Ejari costs about AED 178 online and about AED 220 at a centre | Dubai Land Department e-service (177.75 in total; 220 at trustee centres) | **Via search: supported.** Which channel each total belongs to is ambiguous on the page |
| `dubai.rent` | 90 days' notice to change the terms, including the rent | Law 33 of 2008 (amended Art. 14); DLD FAQ | **Via search: supported** |
| `dubai.workrights` | 30 days' annual leave after a year; 2 days a month between 6 and 12 months | u.ae, *Annual leave* (Decree-Law 33 of 2021) | **Via search: supported** |
| `dubai.workrights` | Sick leave up to 90 days: 15 on full pay, 30 on half pay, the rest unpaid | u.ae, *Sick leave* | **Via search: supported** |
| `dubai.workrights` | MOHRE's line is 80084; disputes are usually settled within 14 working days | — | **Not checked** |
| `dubai.studentwork` | Students aged 15 and over; the employer applies; the permit lasts 3 months; a residence visa and a MOHRE-approved contract are needed | MOHRE, *Training and work permit for students* | **Supported.** Guardian consent is also needed under 18, which the guide doesn't say |
| `dubai.studentwork` | The work can be "part-time, temporary, flexible or remote" | same page | **Not confirmed**: the page doesn't say so |
| `dubai.bank` | Go to Sanadak after 15 days, for free, on 800 72 623 25 | Sanadak eligibility page and contact page | **Via search: supported.** Sanadak's FAQ says 30 days, which conflicts |
| `dubai.bank` | ADCB student account minimum of AED 1,500; AED 3,000 salary example | — | **Not checked** |
| `dubai.ins.employee` | The employer must enrol you, pay, and not charge you for it | Dubai Law 11 of 2013, Art. 10 | **Via search: supported** |
| `dubai.ins.employee` | Cover is at least the Essential Benefits Plan; the family cover rules | ISAHD | **Not checked** |

### Still without any source-check record

Twelve Dubai guides have no record yet:
- `dubai.airport`
- `dubai.uaepass`
- `dubai.health.student`
- `dubai.ins.student`
- `dubai.ins.family`
- `dubai.ins.self`
- `dubai.ins.visitor`
- `dubai.community`
- `dubai.eid.employee`
- `dubai.eid.family`
- `dubai.eid.self`

The older steps of `dubai.school` (choose, age, apply) are also unchecked.

## How to record your review (when you're satisfied)

```bash
node tools/review-guide.mjs dubai.eid.student "<public reviewer label>" uae <checked YYYY-MM-DD> <review due YYYY-MM-DD>
```

The same works for the new guide (`dubai.docs.before`, jurisdiction `uae`) and for the UK guides (for example `edinburgh.evisa`, jurisdiction `uk`). A review record covers one exact content version.

This writes a record to `workers/guide-review-records.mjs` for normal repository review. Any later content change invalidates it.
