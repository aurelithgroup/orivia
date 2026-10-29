# Demo story: Northbay University (draft for the founder, Cleo, 28 October; set in Dubai)

This is a draft for the founder to approve or edit. It runs about 10 minutes. Every person in it is fictional, and their accounts exist only in the pilot's test accounts database. Nothing is based on a real student.

Each scene says what has been **verified locally** and what is **still to build** (`docs/week5-7-plan.md`). Rehearsals and live acceptance need the deployment hold lifted. Until then, nothing here counts as accepted.

## People (all fictional)

| Role | Name | Account |
|---|---|---|
| Incoming student | Aisha Rahman, moving from Manchester to Dubai for a master's | `aisha@demo.example.test` |
| Family variant | Mariam Khalil, starting a PhD, moving with two children (8 and 13) | `mariam@demo.example.test` |
| Northbay staff admin | Omar Haddad, Student Hub | `omar@demo.example.test` |
| Northbay staff editor | Priya Nair, International Office | `priya@demo.example.test` |
| Owner | The founder's own pilot owner account | (existing) |

**Northbay is a fictional university, set in Dubai (Dubai Academic City)**, the founder's choice of 28 October. That way the app offers the Dubai student visa guide. Moving the demo there doesn't approve the guide: it's **source-checked and awaiting review**, and no review record exists yet (`docs/journey-review-pack-2026-10-28.md`). The repository's fixtures and harnesses now use Dubai. **The pilot's own demo organisation record isn't changed** (deployment hold). Its city and welcome defaults are updated after the hold, before rehearsals. The student contact on screen is the harness value "Student Hub, hub@northbay.example", +971 4 000 0000. **Demo contacts are non-contactable:** emails use the reserved `.example` domain, and the phone is `+971 4 000 0000`, which can't connect (Dubai subscriber numbers don't start with 0). Don't replace them with real-looking details.

## Scenes

**Two kinds of evidence, kept apart (updated 29 Oct, checkpoint `6e660b1`).**
- **Verified locally:** checked on this machine, in tests, the fixture harness or the real local server (the worker's own code on SQLite: `docs/evidence/university-workflow-real-server-2026-10-29.json`).
- **Live acceptance:** checked on the pilot after the deployment hold, with the founder's manual testing. **No scene has live acceptance yet.**

| # | Scene | What the audience sees | Verified locally | Still to build |
|---|---|---|---|---|
| 1 | The front door | myorivia.app with the phone preview of the app | Built; not rechecked this week | — |
| 2 | Aisha joins | QR → `/join/northbay` → guided Northbay welcome: campus set by Northbay, Aisha's own details, consent, then Aisha's next step | Real local server, in a real browser (29 Oct): the app's own join link → one welcome screen (name asked once, campus shown not asked) → "Waiting for approval" as the next step → after approval, the first guide as the first step. Existing accounts keep their data and choices. **Not covered:** the QR entry | — |
| 3 | Omar approves | The staff dashboard, a request, Approve. Aisha's app now shows the Northbay space next to My Orivia | Real local server: approve; the student space appears in `/platform`; nothing is visible before approval. **Not covered:** the space inside the app shell | — |
| 4 | A real question | Aisha asks "How do I get my Emirates ID as a new student in Dubai?" She gets a researched answer with opened, quoted official sources, then a follow-up | Not checkable locally (needs search and OpenAI). Research checks partly complete (area 4) | — |
| 5 | Accuracy | "Which nol card should I get, Silver or Gold?" Each price is attached to the right card | Fixed on 22 Oct; not rechecked this week | — |
| 6 | Aisha's plan | The student visa guide becomes her plan: step states, "what comes next", Undo. Preparation ticks and a confirmed deadline with a reminder. **New:** the UK-to-UAE "before you move" documents guide fits Aisha's Manchester route | Tests: plan steps, deadlines and reminders, the documents guide and its offer rules. Both guides are **source-checked, awaiting review** (no review record) | — |
| 7 | Mariam's family | One overview with a plan for each child | Tests: family overview | No school-start or school-return guide |
| 8 | Priya drafts a guide | She pastes a Northbay web page, gets an editable, sourced draft and a student preview, then publishes | Real local server: a manual guide is drafted and published to members. **Not covered:** AI drafting (needs OpenAI) | Editable, sourced AI output with a preview (area 21) |
| 9 | A date changes | Priya moves the visa medical date. Aisha sees both times and "Update my calendar" | Fixture harness (UNI-006) | — |
| 10 | Getting help | Aisha asks the Student Hub for help. Omar assigns it to the International Office | Real local server: a student's request reaches the admin inbox; Omar assigns it to the International office, takes it on, filters to "Assigned to me" and links it to the visa process step, which Aisha then sees with its instructions; a reply and "Resolved" reach the student; it can't be forwarded without the student's consent; both are in the activity history | — |
| 11 | Privacy | Omar tries to see Aisha's personal chats and can't. Direct requests are refused too | Real local server: students can't see member lists; outsiders are refused; application records stay locked; staff screens offer no chats. Tenant matrix tests | — |
| 12 | The owner view | `/manage`: access check, this month's cost against AED 250, an error reference looked up | Real local server: owner access, partner setup and approval, the budgets panel (no real spend locally). Tests: error references on unexpected failures. **Not covered:** real costs | — |

## Backups for the live demo

- **Research is slow or fails (scene 4):** show the honest failure message, then a screenshot of a rehearsed answer, labelled as such.
- **Email codes:** every account is signed in before the demo, because sign-in codes count against the 10/day cap.
- **Device alerts:** push stays off. Reminders are shown in the app, not on the lock screen.

## Outstanding (not in this demo)

- **Sharjah support:** the app offers the student visa guide in Dubai only (`NOT_DUBAI` in `workers/orivia-guide-offers.mjs`). A version for Sharjah or the whole UAE needs content that is reviewed for Sharjah (health centre and other local details).

## For the founder to decide

1. The names, and whether Aisha comes from Manchester (UK→UAE) or a UK route is shown instead.
2. Whether Mariam's family scene stays in, if week 6 runs long.
3. Whether the audience sees the owner view (scene 12) or just hears about it.
