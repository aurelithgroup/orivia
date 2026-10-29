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
| Applies across the UK | `evisa`, `work`, `sim`, `bank` | GOV.UK / UKCISA / Ofcom: UK-wide matters. `bank` also cites university advice |
| Scotland only | `gp`, `rent`, `u22` | NHS Scotland and NHS Lothian, Scottish tenancy law, Scotland's under-22 travel |
| Edinburgh only | `airport`, `bus`, `counciltax`, `community`, `school` | City of Edinburgh Council, Lothian Buses, Edinburgh Trams, Edinburgh Airport |
| Moving from the UK to the UAE | `dubai.docs.before` | GOV.UK legalisation, then UAE federal attestation and recognition |

**Please confirm the scopes**, especially `bank` (UK-wide?) and `gp` (Scotland-wide, with Lothian examples). Code: `guideScope` in `workers/orivia-guide-offers.mjs`. Tests: `tests/uk-guides.test.mjs` and `tests/docs-before-guide.test.mjs`.

## 7. Limits of this pack

- **What this pack checked:** only the claims listed above, against the pages named. It's not a full review of every step, link or translation. The other UK journeys (bank, rent, work, sim, u22, airport, bus, community, school) weren't source-checked in this pack.
- **Interface translations:** the 31 new French and Arabic strings are listed separately in `docs/translations-for-review-2026-10-29.md`.
- **Sharjah:** still outstanding. The demo is set in Dubai.
- **No provider or search spend:** pages were fetched directly. Nothing was deployed.

## How to record your review (when you're satisfied)

```bash
node tools/review-guide.mjs dubai.eid.student "<public reviewer label>" uae <checked YYYY-MM-DD> <review due YYYY-MM-DD>
```

The same works for the new guide (`dubai.docs.before`, jurisdiction `uae`) and for the UK guides (for example `edinburgh.evisa`, jurisdiction `uk`). A review record covers one exact content version.

This writes a record to `workers/guide-review-records.mjs` for normal repository review. Any later content change invalidates it.
