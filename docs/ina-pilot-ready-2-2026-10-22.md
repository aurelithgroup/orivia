# PILOT READY 2: candidate after your review (Cleo → Ina, 22 Oct 2026)

This replaces candidate `5569f60`. It is frozen: any change after your findings will be a new commit and pilot version. This is not a production request.

| | |
|---|---|
| Source | `8af0b96a0e7150e324343f3124427e5cd566ac4f` on `myorivia-release-plan` |
| Pilot Worker | `orivia-research-pilot` version `5c471584-affc-495f-89ff-8d6b98e50843` (bundle sha256 `89c8694c…e5a73`) |
| Migrations | None new. `feedback.sql` is already on pilot DB `8cd85061` from the previous candidate. |
| Production | Unchanged: `b9e32ffc`, checked after the deploy. Spending limits unchanged. |
| Tests | 90/90 CI commands pass on a clean tree at `8af0b96`, plus headless-Chrome checks (below) |
| Receipt | `docs/evidence/pilot-candidate-2-2026-10-22.json` |
| Ledger | `docs/evidence/requirements-ledger-2026-10-22.json`: 219 requirements; 38 locally and 2 pilot verified, 24 released, 84 existing, 6 in progress, 57 deferred, 8 blocked external |
| Commits | `1c94765` and `6588847` (your findings), `c5a01b2` (owner), `52a109e` (university plus a Members fix), `8af0b96` (Listen) |

## Your findings (a4e6dcf)

1. **No silent cap.**
   - Every eligible discovery is listed, 30 per page with "Show more (n)".
   - `tests/library-discoveries.test.mjs` runs the shipped module (`workers/trial-ui/library-discoveries.js`) on 105 items and pages to 106 of 106.
   - The browser check shows 105 items, 30 per page, and "Show more (75)" reaching all of them.
2. **Removal no longer touches messages.**
   - Remove and Restore write one record, `store.library.hidden`, which lives inside the account-scoped chats record and syncs with that account only. It uses `persist()`, not `save()`, so the active chat isn't touched either.
   - Removals made with `5569f60` are read once into that record. Their messages aren't edited.
   - If the device can't save, the change is undone and the person is told.
   - In the browser, one removal on already-saved chats leaves them byte-identical, and it persists after a reload.
   - Tests cover the quota-failure undo (running the shipped function), account scoping and migration.
3. **Feedback disclosures.**
   - The form now says: the report is linked to your account and deleted with it; the Orivia team can read your note and any included reply, which may contain personal or document details; and the team's review list doesn't show your name or email.
   - The owner panel says the same.
   - **The Privacy and retention text still needs your wording before production.** I made no consent-version decision.
4. **Ambiguous failures.**
   - Only a 4xx says "Nothing was saved".
   - A lost response or a 5xx says "Couldn't confirm whether this was received. Try again: it won't be sent twice." The retry reuses the request id.
   - Tests cover the server (saved, response discarded, retried: one row, same receipt) and the client (network, 503, 400 and 201 paths run through the shipped `feedbackApi`/`feedbackError`).
5. **Shortlists.**
   - An organisation's "Shortlisted" label (separate from the place ♥) survives a newer duplicate mention.
   - Tested with an older shortlisted organisation and a newer unshortlisted one.

## New slices

**Founder overview (`/manage`).**
- `GET /api/admin/overview` is for verified owners only. It returns:
  - organisations (active, paused, demo);
  - active students and active staff, per organisation;
  - join requests waiting;
  - open invitations;
  - published and draft content;
  - feedback to review.
- Every number has a written definition under "What these numbers mean".
- **Budgets** come only from the server's own meters:
  - OpenAI and voice from `spend_meter` (including unsettled reservations, and shared by pilot and production);
  - searches from `research_usage` (this deployment's pool);
  - sign-in emails from `account_mail_meter`.
- If a counter is missing, its limit isn't set, or the read fails, the console says "Unavailable" and shows no number.
- The directory has search (name, web name, city; `%` is literal) and per-organisation totals. Its actions are "Invite first admin", and "Open its dashboard" when the owner is also staff there.
- It never reads chats, files, student marks, names or emails.
- Tests use real Better Auth sessions with SQLite and cover:
  - exact counts;
  - "Unavailable" for missing sources;
  - search;
  - no identities in the response;
  - 401 when signed out, and 403 for a student, an organisation admin and a non-member.
- Read-only on the real pilot DB, these queries return 1 organisation, 1 active student, 1 staff member, 4 published items and 1 owner. The OpenAI meter reads $5.35 this month.

**University overview: "Needs attention".**
- It comes from the organisation's own records. It lists:
  - join requests;
  - drafts;
  - published key dates that have passed or have no date;
  - published contacts with no phone, email or website;
  - key dates in the next 30 days.
- Each item opens its workflow. Members opens for join requests (editors are told only admins approve); other items open in Guides, scrolled to, focused and highlighted. The all-clear state says what was checked.
- Tests cover exact items, other organisations' records excluded, staff allowed, and students and outsiders refused.
- **Bug found by the browser check: in the admin Members tab, `constreq=` has thrown in strict mode since step 9 (`dffc2ea`).** Admins can't open Members on **myorivia.app**. It's fixed here with a guard test, but production still has the bug until the founder decides on a release.

**Listen startup.**
- "Preparing the voice…" appears at the tap.
- The first natural-voice piece is about one sentence, with the same total text and cost.
- A piece in flight is shared. Audio made in this session is reused on replay. It's held in memory only, per account, dropped on an account change, and capped at 24 pieces / 8 MB.
- Stop silences at once. A piece already being generated finishes into the cache instead of being paid for twice. Requests are still aborted on an account switch.
- Click-to-first-audio is recorded as numbers only: `{"event":"orivia-listen"}` and `window.OriviaListenTimings`.
- With a **simulated** 600 ms voice server in the browser harness:
  - first audio arrives in 1.0–1.2 s;
  - replay takes 51–72 ms;
  - stopping during generation, then tapping again, makes 2 requests (1 per piece), not 3.
- Real OpenAI and phone timing are unmeasured.
- Voice limits are unchanged ($1/day, $5/month).

## Evidence you can rerun

- **Browser checks:** `tools/browser-checks/` (Windows Chrome path):
  - `app-harness.mjs` (`HARNESS_VOICE=600` for Listen);
  - `platform-harness.mjs owner|admin [empty]`;
  - `cdp-shoot.mjs`;
  - jobs files.
- **Results:**
  - `docs/evidence/library-discoveries-browser-2026-10-22.json`;
  - `docs/evidence/listen-startup-browser-2026-10-22.json`;
  - `docs/evidence/screens/*.png`.

## Still not verified, and remaining blockers

- **Signed-in checks on the deployed pilot** (owner, admin, student), because I can't pass Access. The permission tests run real sessions against SQLite.
- **Real-device and real-provider timing**, for both Listen and chat replies.
- **External blockers:**
  - university SSO and records;
  - operator details for Privacy and Terms;
  - a payment provider;
  - store accounts and signing;
  - physical devices;
  - production push.

## Rollback

- **Pilot code:** roll back to `7f0de223-beaa-4179-af06-92f43d6df9e4` (the previous candidate) or `d673b88f-ce1c-4bce-8d8f-043079e92d0f` (before tonight).
- **Schema:** no change in this candidate. Older code ignores the Library record.
