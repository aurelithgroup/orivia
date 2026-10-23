# PILOT READY 9: audit of every "existing" requirement, plus plans, institution settings and dates (Cleo → Ina, 23 Oct 2026)

| | |
|---|---|
| Source | `9bb8666` on `myorivia-release-plan` (pushed) |
| Pilot Worker | `orivia-research-pilot` version `e055308c-3db8-4e87-8d33-09b645e92e99` (bundle sha256 `5291ab99…a9d2c205`) |
| Migrations | `organisation_settings` is created on first use by `organisations.mjs` (also recorded in `workers/accounts/org-settings.sql`). No other schema change. |
| Production | Unchanged: `b9e32ffc` (checked after deploy). Spending limits unchanged. Pilot Access unchanged. |
| Tests | 121/121 CI commands pass on a clean tree |
| Receipt | `docs/evidence/pilot-candidate-9-2026-10-23.json` |

## The audit

I checked all 84 requirements marked "existing" against their acceptance criteria. Verdicts and evidence are in
`docs/evidence/existing-audit-2026-10-23.json`, and the ledger is regenerated from it. Real gaps I found and fixed:

| Item | What was wrong | Fix and test |
|---|---|---|
| LEGAL-003 | OpenAI, document and university-notice consents were stored device-wide, so a second account inherited them | Kept per account. Existing pilot accounts are asked once more. `tests/consent-scope.test.mjs` |
| AUTH-005 | A draft was lost when another tab switched account | Held under its own account and returned only to that account. `tests/tab-account-switch.test.mjs` |
| AUTH-010 | Deleting the last owner or sole admin was refused, but the app only said "That didn't work"; no recovery steps existed | Plain explanations; `docs/owner-recovery.md`; nothing in the app writes the owner role. `tests/owner-recovery.test.mjs` |
| UNI-012 / SEC-001 | Only spot checks existed | 209 hostile calls over every staff route, the owner routes and the exports, plus object substitution and cross-site requests. `tests/staff-tenant-matrix.test.mjs` |
| SEC-004 | No hostile fixture set for the page reader | 20 private, numeric, local, credentialed and odd-port addresses, and off-host redirects, all refused without a request. `tests/hostile-fetch.test.mjs` |
| SEC-010 | Several switch-off states untested; no runbook | `docs/incident-controls.md`. `tests/incident-switches.test.mjs`, plus a research-off case |
| NOTIFY-005 | Not tested | A notification tap always opens the app home, never a deep link. `tests/notification-isolation.test.mjs` |
| CAL-003 | An impossible date (30 Feb, 24:00) rolled over into another day | Refused. UK clock change, repeated hour, Dubai boundaries and Dubai→London travel tested in real time zones. `tests/time-correctness.test.mjs` |
| CAL-006 | No explicit current-location choice | "Start from where I am instead": the map app asks for location itself and Orivia never reads it. `tests/place-card.test.mjs` |
| PERF-007 | Not tested | A page that failed is never counted as read. `tests/truthful-progress.test.mjs` |

## New features

- **Plan steps (JOURNEY-003/004).** `plan-steps.js` holds the step model. Please try a guide end to end.
  - **States:** not started, in progress, waiting on me, waiting for them, blocked (with a note), done, not applicable and not sure, plus "Ready" when everything earlier is finished.
  - **What the guide view shows:** what comes next, what blocks this step, "You marked this … · date", and Undo of the last change.
  - **Done:** the view says it's the person's own record.
  - **Old saves:** "waiting" saves migrate.
  - **Tests:** `tests/plan-steps.test.mjs`; screenshot `docs/evidence/screens/journey-004-step-states-phone.png`.
- **Institution settings (UNI-015).**
  - **Settings tab:** admins edit it; editors see it read-only. It covers:
    - which kinds of news may go out as device alerts (each student still chooses);
    - the student contact shown in the student space;
    - the owner of each area (staff only);
    - whether editors may download the aggregate counts CSV;
    - how long former members stay listed (display only).
  - **Activity tab:** areas changed, never values; students are anonymous.
  - **Safeguards:** a recent sign-in, revision checks and audit, and unknown fields are refused. The test proves no other table changes.
  - **Tests:** `tests/org-settings.test.mjs`.
- **Dates and announcements (UNI-006).**
  - **Updates:** optional "Show until" date; ended updates are hidden from students and listed for staff.
  - **Past key dates:** folded away.
  - **Editing:** staff can now edit existing content (until now only create, publish or unpublish worked), and a date edit explains what happens to saved copies.
  - **Students:** a student whose saved date changed sees both times and one "Update my calendar" button.
  - **Tests:** `tests/dates-announcements.test.mjs`.

## Please check on the pilot (behind Access, which I can't pass)

1. **Second account and consent.** Sign in as a second account on the same browser: OpenAI and document consent must be asked again.
2. **Plan states.** Follow the residence-visa guide: mark a step Blocked with a note, Undo it, mark an earlier step Not applicable and see the next step become Ready.
3. **Settings tab.** As an admin, save settings (needs a sign-in within 15 minutes), then open the student space and see the contact.
4. **Editing a date.** Edit a published key date as an admin, then open the space as a student who had added it.

## Still open

- **Remaining gaps:**
  - UX-005: Arabic at 200% zoom overflows by 27px;
  - LIB-007: sorting and filters;
  - JOURNEY-006: audit not finished.
- **Deferred P0s** (in order next): OWNER-003/005/012/013/014, UNI-004/010, HOME-005, BUSINESS-003, PERF-004/006.
- **External blockers (unchanged):**
  - university SSO and records;
  - operator details for Privacy and Terms;
  - a payment provider;
  - Apple/Android accounts;
  - physical devices.
- **Your gates:**
  - Privacy/retention wording;
  - authenticated pilot checks.
- **Founder decisions:**
  - the Members-tab fix in production;
  - an R2 backup.

## Rollback

Roll back to `ec003c9d-f8c5-4386-8b7c-531c0bbe7bf3` (candidate 8). The settings table can stay. New step states saved on candidate 9 are dropped by older readers; done, in progress and not sure are kept.
