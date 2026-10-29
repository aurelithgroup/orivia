# Weeks 5–7: finishing Orivia for the pitch (Cleo, 28 October; revised with Ina's conditions)

The founder wants the product finished by the end of week 7, so that week 8 is for the pitch and demo. This plan covers Ina's review from 28 October (30 work areas), the eight interview additions, and Ina's six conditions on the first draft. The founder has approved all eight additions for the backlog, and this release commits to three of them.

Dates assume weeks run Monday to Sunday:

| Week | Dates |
|---|---|
| 5 (now) | 28 Oct – 1 Nov |
| 6 | 2 – 8 Nov |
| 7 | 9 – 15 Nov |
| 8 | 16 – 22 Nov, pitch and demo |

Key dates:

| Date | Milestone |
|---|---|
| Fri 30 Oct | Cleo sends the draft Northbay demo story to the founder for approval |
| Tue 10 Nov | Feature complete |
| Wed 11 – Thu 12 Nov | Integration, fixes and demo rehearsals only |
| Thu 12 Nov | Code freeze, full CI run, pilot candidate for Ina |
| Fri 13 Nov | The founder reviews a demo that has already been rehearsed (ORI-QA-004) |

## Deployment hold (from 28 October, founder)

**No Orivia Worker is deployed until the hold is lifted.** That includes pilot candidates.

The pilot runs version `abf5b831`, deployed on 25 Oct at 17:37 (+04:00) with the message "Private Midnight Owner candidate cdab3b5". Nobody has confirmed they own it.

- **What we know:**
  - Ina's last recorded deployment is `00963c9e`, built from source `bb3c60a` (branch `ina/founder-ai-sponsorship-block-3-2026-10-25`).
  - `cdab3b5` isn't on any pushed branch. No branch mentions `abf5b831` either.
  - The nearest match is `ina/owner-midnight-dashboard-2026-10-25` (`db8ecc8` "midnight executive owner dashboard", last commit 14:58 on 25 Oct, before the deploy).
- **Preserve the current pilot.** Don't overwrite it, roll it back or change its settings. Its storage was checked read-only on 28 Oct: `ACCOUNTS_DB` 8cd85061, R2 `orivia-files-pilot`.
- **Midnight Owner source (`cdab3b5`): unlocated.** It isn't on any pushed branch, and the nearest match above isn't confirmed to be its source.
- **To lift the hold:**
  1. Someone confirms they own `abf5b831`.
  2. Its source is pushed.
  3. That source is reconciled with `myorivia-release-plan` change by change. The 23 commits on the Ina branches above are reviewed and brought in selectively, never merged wholesale. The pilot is never overwritten to make reconciling easier.
- **Independent development continues on the branch.** Candidate dates in this plan move if the hold lasts past week 5.

**Latency (PERF-001) is paused as well.** Manual testing on the pilot stays paused. When it resumes, three example runs (an ordinary question, fresh research, a follow-up) are reported one by one, with their versions. They're examples, not a reliable benchmark, and no median or p95 is drawn from them.

## How the plan decides

1. **The demo story sets the priority.** Everything the audience sees works and has been checked on the pilot. The story is drafted by Cleo (see "Demo default"), so development doesn't wait for a script.
2. **Essential privacy and operations are part of this release.** Deletion and cleanup, access controls, error diagnosis, budget limits and rollback must all work before the freeze. Only the fuller management dashboards wait.
3. **Week 6 is protected.** Three additions are committed. Submission readiness is kept small. Two others are built only if there's room.
4. **The cut is said out loud.** Areas after the line below are shown in the pitch as roadmap or mockups. They aren't presented as finished.

## Week 5: make what's there trustworthy (28 Oct – 1 Nov)

| Area | Work | Ledger |
|---|---|---|
| Pilot isolation (verify, don't rebuild) | Read-only check that the live pilot's `ACCOUNTS_DB` is still `orivia-accounts-pilot-test` (`8cd85061`) and that production is still `orivia-accounts-private`. Then remove the stale "still open" line from `docs/myorivia-release-plan.md`. No new database and no account migration. | |
| 3 · Performance evidence | Paused (see Deployment hold). When it resumes: three example runs, reported one by one, not a benchmark. The nol fix was already done on 22 Oct. | PERF-001 |
| 2 · Speed and streaming | **Transport and cancellation improved (28 Oct, `064e6f1`). No faster answers are claimed.** Ina's checked-answer transport (`240f2f7`) was brought in selectively: ordered frames, a strict client reader, and Stop carried through to the provider. Only a checked reply is ever sent. **Cost:** a request OpenAI has already received may still be charged after Stop; it stays recorded against the budget as uncertain. Only a request never sent is recorded as zero. **Not done:** earlier checked text (it needs the model's reply streamed and checked sentence by sentence, a design to agree with Ina) and any speed measurement (paused). | PERF-004, PERF-006 |
| 4 · Research intelligence | **Partially complete (28 Oct, `b0b9c64`):** 17 fixed UAE/UK cases, run with fixtures and a scripted model. **Where the person is is kept separate from whose rule it is.** A rule from another emirate's page must say whose it is ("In Dubai, …"), and naming two emirates no longer switches the check off. Conflicting official pages must be cited and explained in words. Also fixed: UK nations, England-only gov.uk pages, figures borrowed from a neighbouring heading, and "outside London". **Remaining:** the limits listed in the evidence (disagreements in words, unlisted emirate hosts, UK nations not yet split by residence) and real-provider quality. 0 real-provider runs. Evidence: `docs/evidence/research-set-2026-10-28.json`. | |
| 30 · Task 4 status | **Diagnostics improved (28 Oct, `1c76c87`). The root cause of the 25 Oct failure is still unknown.** The message means a server request failed, and a reload recovered it. Unexpected failures used to be returned as an unlogged 400. On this branch they're now a 500 with a reference the page shows, plus a content-free log line. Ruled out: table-shape drift and D1 transactions. See `docs/loading-error-finding-2026-10-28.md`. Live acceptance stays open. | QA-003 |
| 9 · Accessibility (part) | Pending. No overflow measured at 195px; actual zoom and a visual check are still needed. The accessibility review also decides the older 10px tab rule (`9f9fee1`). | UX-005 |
| 29 · Costs and recovery | **Metered part reviewed (28 Oct):** October OpenAI is about AED 20 by **Orivia's internal estimate, not the invoice**. The cap limits the meter to AED 73.45 a month, which leaves **AED 176.55 of the budget before the other costs**. That's not confirmed spare capacity. Every invoice amount is unknown; yearly domains are shown separately with a monthly equivalent, and each service is counted once. The 28 Oct calls are of unknown origin. **Backup:** the decision is pending and nothing is created. The proposal covers: what a second bucket does and doesn't protect against; file deletion vs account deletion; tombstones so deleted data can't come back after retries, restores or a D1 restore; no undo delay unless a need is shown; and a provisional cost from R2 prices checked 28 Oct. "0 objects" means none were found at that check; database records and future uploads are still at risk. Plan: Workers Paid, inferred from a restore point, not confirmed, and no guarantee of the future window. **EU jurisdiction for files: pending option.** The current bucket stays as it is; nothing will be created, replaced or rebound. Check times are in `docs/evidence/storage-and-restore-window-2026-10-28.json`. See `docs/backup-proposal-2026-10-28.md`. See `docs/cost-review-2026-10-28.md`. | BUSINESS-005 |
| 28 · Privacy and Terms drafts | **Drafted and reconciled (28 Oct):** `docs/legal/privacy-draft.md` and `terms-draft.md` describe this branch, with each statement mapped to its source. `docs/legal/reconciliation-combined-release.md` lists 14 features where Ina's branch changes what the policies must say. Their wording is in the drafts as `[INCLUDE IF RELEASED]`, to be finalised against the combined release once it's decided. Progress totals are described as paused. Operator gaps are marked `[OPERATOR]` and block publishing. Waiting for Ina's review. | LEGAL-001/002 |
| Demo story | The draft Northbay story, due Friday 30 Oct. | |
| Journey content | Start drafting the reviewed UAE/UK guides now, because review takes the longest. | |

## Essential privacy and operations (finished by Tue 10 Nov)

These must work in this release. They aren't dashboards.

| Area | What "done" means |
|---|---|
| Deletion and cleanup | Deleting an account, a file, a chat or a membership removes everything it should. A cleanup that fails is recorded and visible to the owner. It never fails silently. |
| Access controls | The staff and tenant matrix (`tests/staff-tenant-matrix.test.mjs`) is re-run on the candidate and extended to the new university routes. The owner-only routes are re-checked. |
| Error diagnosis | Errors carry a reference that the owner can look up, with no personal content in it. The intermittent loading error is the first test case. |
| Budget limits | $5/day and $20/month and the search limits are checked on the candidate, including what users see when a limit is reached. |
| Rollback | Rehearsed on the candidate before the freeze. The steps and timing are recorded. |

**Student progress totals stay paused.** On both this branch and Ina's, staff see guide titles but no counts until a reporting approach that prevents inference is agreed (Ina's step 9 review). Not part of this release.

## Week 6: the student story, then start the university flows (2 – 8 Nov)

**Status (29 Oct): built locally; awaiting review.** Done locally:
- Ina's batch 1;
- the family overview and deadline reminders;
- UK journeys in the catalogue and planning, scoped across the UK, Scotland or Edinburgh, and offered only where they apply;
- the source-backed before-you-move document guide (UK to UAE);
- review material for Ina: `docs/journey-review-pack-2026-10-28.md` and `docs/translations-for-review-2026-10-29.md`.

**Not complete until reviewed:**
- every guide is **awaiting review**, with no review record;
- 31 new French and Arabic interface strings, plus the guide's Arabic, need language review.

**Outstanding:**
- Sharjah support for the visa guide (the demo is set in Dubai);
- source checks: GP, rent, work, bank and under-22 travel are partly checked (29 Oct; dental line corrected). SIM, airport, bus, community and school aren't checked yet and show "Source check not recorded";
- visual review of the new screens is pending (the harness screenshots timed out; text and interaction checks passed);
- live checks, which wait for the deployment hold to lift.

**Committed:**

| Area | Work |
|---|---|
| 10 · Reviewed Journey content | **Source-checked, awaiting review (28 Oct, `4ba903e`). No review record has been created.** The demo routes (`dubai.eid.student`, `edinburgh.evisa`, `edinburgh.counciltax`, `edinburgh.gp`) were checked against live official pages. Federal u.ae sources were added and the police-registration source fixed; the data was regenerated from the app. `docs/journey-review-pack-2026-10-28.md` lists what's supported, what isn't (university-only timings, share code "Free") and what wasn't checked (NHS Inform refused the fetch). **Waiting for Ina's review**, recorded with `tools/review-guide.mjs`; no record has been created. **Demo:** Northbay is now set in Dubai (founder, 28 Oct), so the visa guide is offered; that doesn't approve it. **Outstanding:** Sharjah support, and the UK journeys aren't in the app's guide catalogue. |
| 11 · Journey and Library continuity | **From Ina's batch 1 (`c42dea0`):** chat to plan continuity (JOURNEY-006), Library views and selected export (LIB-007/009), guide-change review (JOURNEY-008). Her acceptance gates stay open: browser Back/refresh and signed-in pilot checks. |
| **Family arrival planner** | **Done locally (`6301584`):** Ina's separate family plans (batch 1, JOURNEY-009) plus a family overview in My Life (each person's plans, progress, next step, what needs them, next date). Checked in the local harness. Not checked live (hold). |
| **Before-you-move document preparation** | **Done locally (29 Oct), awaiting review.** Ina's batch 1 preparation ticks, plus a new source-backed guide, `dubai.docs.before` (`js/content-docs.js`): ask first, visa documents, UK legalisation (GOV.UK: £45, up to 25 working days), and UAE attestation and recognition only if asked (MoFA, u.ae). No universal attestation rule is asserted. |
| **Deadline reminders** | **Done locally (`6301584`):** a date on any plan step, confirmed or not sure yet, with where the person saw it. Reminders go through the existing calendar: 3 days before, never after the date; unsure dates are worded as a check. Labelled as the person's own date. Not checked live (hold). |
| **Submission readiness (kept small)** | Flags blurry photos and missing pages, using the existing document reader and camera. It never says a document will be accepted. It adds no new upload or storage path. |
| 1, 5, 6, 7, 8, 27 · Confirmation sweep | Chat presentation, navigation, calendar, accounts, files and notifications. Each gets a scripted check against its acceptance criteria, and only real failures are fixed. Ina runs the checks that need Access. |
| University flows start (Thu 5 Nov) | 22 · the Northbay welcome and 13 · partner onboarding. Both are built on the existing invitation, approval and university address. |

**Only if content review is on time** (otherwise they move to the backlog):

- Arrival budget planner
- School-return and settling-in support

## Week 7: finishing (9 – 13 Nov)

**University-story foundations (29 Oct): Ina's block one (`240f2f7`) brought in locally**, merged per file against its parent `f6e7fc3`. It covers:
- partner invitations and onboarding review;
- university support tickets, with separate permission before anything is forwarded to platform support;
- guide drafts from public URLs or institution documents, for staff review;
- ordered process templates and the source registry;
- free, Plus and Premium allowances (no billing; off by default);
- in-app data requests;
- response timings kept on the device;
- device photo review.

Conflicts in four files were resolved: the assistant, `chat.js`, `page.html` (this branch's UX-005 rules kept) and the trial worker (rebuilt). Two config files gain `enable_request_signal`, which takes effect only on a deploy after the hold. 132/132 local CI pass. **Not yet checked:** the university screens in the harness, visual review, and any live check. **Not taken:** the founder workflows, sponsorship placements and Journey governance (later Ina commits). Sharjah coverage stays outstanding.

**University checks (29 Oct, after the review checkpoint `032e639`):**
- **Fixture harness:** all 11 staff tabs and 15 owner areas render at phone and desktop width.
- **Real local server:** the worker's own accounts and organisations code, on in-memory SQLite, with no Cloudflare and no email. A 26-step workflow passes and is now a CI test: partner setup and approval, publishing, invitation, join and approval, support with forwarding refused, records locked, outsiders refused, progress paused.
- **Fixed:** plain labels for the workbench, activity history, partner review and support statuses.
- **Seven further findings, fixed the same day at the founder's request:** dropdowns on the partner form, with a read-only pending view; each email shown once; "Student" wording; an admin support inbox; staff replies recorded in the activity history; plain data-request names. The 27-step test covers them.
- **Not covered:** the app-shell join link, students marking guides done, AI drafting, real D1 or email, Arabic layout.
- **Where:** screenshots went to Ina privately. Evidence is in `docs/evidence/university-screens-local-2026-10-29.json` (fixtures) and `docs/evidence/university-workflow-real-server-2026-10-29.json` (real server).

**Guide source checks (29 Oct):** every Edinburgh journey now has a partial, dated source-check record (review pack sections 8 and 10). 20 Dubai journeys still have none. No review records exist.

**Mon 9 – Tue 10 Nov: last features**

| Area | Work |
|---|---|
| 22 + 13 · Northbay welcome and onboarding | Finish and connect to the demo accounts. |
| 21 + 20 · AI guides and instruction packages | The URL/file drafting tool produces editable, sourced instructions with a student preview. One reusable package per demo route. |
| 23 · Campus help | A campus directory (printing, services, locations, opening hours, contacts). The student essentials collection and the first-week commute guide go in only where they reuse the directory and the place card directly. Otherwise they move to the backlog. |
| 24 · Support workflows | Team assignment, filtering and linked process steps on the existing tickets. |
| 16 · Sponsorships | The labelled placement students see, with a preview. Approval controls already exist. |

**Wed 11 – Thu 12 Nov: integration, fixes, rehearsals.** No new features. The demo is rehearsed end to end at least twice on the candidate, with the fictional accounts.

**Fri 13 Nov:** the founder reviews the rehearsed demo.

## Demo default

Cleo drafts the story by **Friday 30 October**, and the founder approves or edits it.

- **Setting:** Northbay University, using the existing university space and invitation.
- **Accounts:** every account is fictional and lives only in the pilot test database:
  - an incoming student (with a family variant for the family planner);
  - a Northbay staff admin and a staff editor;
  - the owner.
- **Flow:**
  - **Student:** joins from the QR, gets the guided welcome, asks a researched question, builds a plan with documents and deadlines, then gets a reminder.
  - **Staff:** drafts a guide from a URL, publishes a date, then handles a support request.
  - **Owner:** checks access, costs and an error reference.

The founder only has to supply operator details. Nothing else blocks development.

## Backlog after the pitch (shown as roadmap)

| Area | Why it waits |
|---|---|
| 12 · Founder AI drafting | For internal use only. |
| 14 · Owner administration (full views) | The access controls themselves stay in this release (see above). |
| 15 · Founder analytics | Needs real usage first. Show the basic charts. |
| 17 · Communications | Saving notices works. Scheduling and delivery controls come later. |
| 18 · Operational dashboards | The working operations (see above) stay in this release. |
| 19 · Free/Plus/Premium allowances | Linked to billing, which is deferred. |
| 25 · Application records and connections | Needs a university integration. Show the connection status screen only. |
| 26 · Richer university dashboards | Use the mockups in the pitch. |
| Approved additions not committed | Budget planner and school-return support (if review runs long); student essentials and the commute guide (if they don't fit the directory). |
| Billing, native apps, more translations | Already deferred. |

## Needed from others

- **Founder:**
  - operator details for Privacy and Terms;
  - approval of the demo story (due 30 Oct);
  - the Members-tab fix in production;
  - approval of the R2 backup.
- **Ina:**
  - review of the policy drafts;
  - the authenticated pilot checks from PILOT READY 9;
  - the Access-only parts of the week 6 sweep;
  - review of the Journey content;
  - the 12 Nov candidate review.
- **External (not in this plan):** university SSO and records, payments, store accounts, real-device acceptance.

## Risks and rules

- **Public launch waits on Privacy and Terms.** Missing operator details block any public launch of this release. They never mean launching without Privacy and Terms. The drafts are finished now, with the gaps marked, so publishing takes only those details.
- **Reviewed content is the critical path.** If guide review slips, the budget planner and the school-return guide move to the backlog first. The three committed additions don't move.
- **After Tuesday 10 November only fixes go in**, unless the founder and Ina agree otherwise.
- **Production stays untouched** until founder acceptance. Only one person deploys, as agreed on 21 October.
