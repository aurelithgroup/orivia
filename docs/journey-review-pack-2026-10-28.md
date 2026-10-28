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

**For the founder (demo):** this journey is written for Dubai, and the app only offers it to people in Dubai. Sharjah is on the "not Dubai" list in `orivia-guide-offers.mjs`. **The Northbay demo is set in Sharjah, so Aisha wouldn't be offered it.** The options:
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

## 5. Limits of this pack

- **The UK journeys aren't in the app's guide catalogue yet.** Only the 21 Dubai journeys can be followed as plans in the trial app. So:
  - `tools/review-guide.mjs` can't record a review for an `edinburgh.*` journey;
  - plan steps, family plans and preparation ticks don't apply to the UK journeys.

  Bringing them in is a separate change.
- **What this pack checked:** only the claims listed above, against the pages named. It's not a full review of every step, link or translation.
- **No provider or search spend:** pages were fetched directly. Nothing was deployed.

## How to record your review (when you're satisfied)

```bash
node tools/review-guide.mjs dubai.eid.student "<public reviewer label>" uae <checked YYYY-MM-DD> <review due YYYY-MM-DD>
```

This writes a record to `workers/guide-review-records.mjs` for normal repository review. Any later content change invalidates it.
