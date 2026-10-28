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
| 2 · Speed and streaming | Deliver checked answers earlier, with a fallback when streaming fails. | PERF-004, PERF-006 |
| 4 · Research intelligence | **Partially complete (28 Oct, `90bc44d`):** 15 fixed UAE/UK cases in `tests/research-set-uae-uk.test.mjs`, run with fixtures and a scripted model. Seven checker gaps were found and fixed: a neighbouring heading, "outside London", a question naming both countries, UK nations, official pages that disagree on an amount, emirates, and England-only gov.uk pages. **Remaining:** the limits listed in the evidence (disagreements in words, unlisted emirate hosts, real-provider quality). 0 real-provider runs (hold). Evidence: `docs/evidence/research-set-2026-10-28.json`. | |
| 30 · Task 4 status | Find the intermittent loading error. Record owner checks and outstanding acceptance accurately. | QA-003 |
| 9 · Accessibility (part) | Pending. No overflow measured at 195px; actual zoom and a visual check are still needed. The accessibility review also decides the older 10px tab rule (`9f9fee1`). | UX-005 |
| 29 · Costs and recovery | A real monthly cost against AED 250. An R2 backup for files (needs the founder's approval). | BUSINESS-005 |
| 28 · Privacy and Terms drafts | **Drafted (28 Oct):** `docs/legal/privacy-draft.md` and `docs/legal/terms-draft.md`, each statement mapped to its source. Operator gaps are marked `[OPERATOR]`, and facts not yet confirmed are marked `[TO CONFIRM]`. Specific to this branch, pending reconciliation with Ina's data-request, sponsorship and progress-privacy implementation. Waiting for Ina's review. | LEGAL-001/002 |
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

## Week 6: the student story, then start the university flows (2 – 8 Nov)

**Committed:**

| Area | Work |
|---|---|
| 10 · Reviewed Journey content | Complete reviewed guides for the demo routes: the UAE student visa and residence, and the UK student visa and arrival. "Complete" means guides with sources and a review date, not a list of topics. |
| 11 · Journey and Library continuity | Chat to plan (JOURNEY-006), Library sorting and filters (LIB-007), changed instructions and withdrawn sources. |
| **Family arrival planner** | A plan for each dependant on plan steps, and a shared overview. Covers JOURNEY-009. |
| **Before-you-move document preparation** | Preparation, recognition and attestation questions as a guide template. Covers JOURNEY-005. |
| **Deadline reminders** | Dates the user confirms, with an "unsure" state and reminders, built on the calendar and the UNI-006 date handling. |
| **Submission readiness (kept small)** | Flags blurry photos and missing pages, using the existing document reader and camera. It never says a document will be accepted. It adds no new upload or storage path. |
| 1, 5, 6, 7, 8, 27 · Confirmation sweep | Chat presentation, navigation, calendar, accounts, files and notifications. Each gets a scripted check against its acceptance criteria, and only real failures are fixed. Ina runs the checks that need Access. |
| University flows start (Thu 5 Nov) | 22 · the Northbay welcome and 13 · partner onboarding. Both are built on the existing invitation, approval and university address. |

**Only if content review is on time** (otherwise they move to the backlog):

- Arrival budget planner
- School-return and settling-in support

## Week 7: finishing (9 – 13 Nov)

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
