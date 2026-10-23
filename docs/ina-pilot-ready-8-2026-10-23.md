# PILOT READY 8: your candidate 7 audit, plus the work you haven't seen (Cleo → Ina, 23 Oct 2026)

| | |
|---|---|
| Source | `16b8776` on `myorivia-release-plan` (pushed) |
| Pilot Worker | `orivia-research-pilot` version `ec003c9d-f8c5-4386-8b7c-531c0bbe7bf3` (bundle sha256 `9f741105…a8493f`) |
| Migrations | None |
| Production | Unchanged: `b9e32ffc` (checked after deploy). Spending limits unchanged. Pilot Access unchanged. |
| Tests | 110/110 CI commands pass on a clean tree |
| Receipt | `docs/evidence/pilot-candidate-8-2026-10-23.json` |

## Your audit (`1f797f2`)

**Connector duplicate fix.** Merged as you wrote it (`ecc967d`). `tests/ina-connector-duplicate.test.mjs` runs in CI.

**History-aware provenance.** Integrated in `a9fe453`:
- `sendChat` freezes `OriviaReplyOrigin.forRequest(sentTurns, {documents, university})` before the request. That covers the turns actually sent (the same latest 12 as `chatMessages`) plus this request's own context.
- The stamp is `{v:2, documents, university, unknown}`. Without the helper it fails closed as `unknown`.
- `share-select.js` asks `sharingReason(t)` first, then applies the chat-level fallbacks. With no helper, every reply is `unverified`.
- `reply-origin.js` is bundled ahead of `share-select.js` and is part of the service-worker version hash.
- `tests/share-provenance.test.mjs` now runs the real `sendChat` with your helper. It covers:
  - a members-only answer, then the context cleared, then "Summarise that": inherits `university`, and the history really was sent;
  - a document answer, then the document detached: inherits `document`;
  - v1 history makes the new reply `unknown` and leaves the v1 reply unverified;
  - a clean chat stays shareable;
  - private history beyond the 12 sent messages stops tainting new replies;
  - version switching and a JSON reload keep the stamps;
  - excluded replies never reach the payload.

**Protected Library bookmarks (LIB-005).** These didn't exist, so I built them in `16b8776`:
- "Save to Library" appears on university guides, dates and updates, but not contacts. It stores `{org, content, title, orgName, savedAt}` only. `normLibrary` re-validates on load, so a tampered or older record loses any text. Contents are never stored.
- The Library ("Guides & journeys") re-checks access on every draw, through the same shared `/api/me/memberships` request the menu uses:
  - **active student membership:** **Open** reopens the space from the server and highlights the item; **Ask in Chat** goes through `useOrgContext`, which the chat server re-checks (`readOrgContext`);
  - **left, removed, staff-only role, or signed out:** title and organisation only, "No longer available…", no Open or Ask, and it can still be removed;
  - **offline:** "Couldn't check access", no Open.
- `openItem` refuses without an active student membership and makes no space request. If the device's list is stale, the server's 403 still shows nothing protected.
- **Tests:** `tests/org-bookmarks.test.mjs` (shipped `spaces.js` and the `chat.js` bookmark code, scripted transport). Server side: `tests/leave-organisation.test.mjs`.
- **Screenshot:** `docs/evidence/screens/lib-005-bookmarks-phone.png`, from the local harness with a stubbed account.
- **Rollback:** going back to candidate 7 drops saved bookmarks (its loader keeps only `hidden`); nothing else is lost.

## Not yet reviewed by you (pushed now)

- **`7c1396c` (AI-009/010):**
  - names stated in the conversation or profile are kept out of web searches (`safeQuery` with `conversationNames` / `personNames`);
  - `read_page` refuses URLs carrying those names, and hosts that appeared only inside pages read this turn, so an injected page can't steer the next read.
  - Tests: `tests/assistant-safety.test.mjs`.
- **`0765a8b`:**
  - **Settings scope:** settings are per account, with language, theme and text size device-wide (`tests/settings-scope.test.mjs`).
  - **Deletion consequences:** each delete now says what stays (`tests/deletion-consequences.test.mjs`).
  - **Leaving a university:** two-tap Leave in the student space, `/api/me/orgs/:id/leave`; a sole admin must hand over first (`tests/leave-organisation.test.mjs`).
- **`5efd68d`:**
  - keyboard-only flows, Arabic, and 200% zoom browser checks (`docs/evidence/accessibility-browser-2026-10-23.json`);
  - reply actions wrap.
  - **Known gap:** Arabic at 200% zoom on a 390px phone still overflows by 27px in one place. Not fixed.

## Still open (your gates)

- **Privacy and retention wording:** for feedback and shared links.
- **Authenticated checks on the deployed pilot:** I can't get past Access, so the live check is yours. Same for real-device and real-provider timing.
- **Founder decisions:**
  - the admin Members-tab fix is still unreleased in production;
  - an R2 backup.

## Rollback

Roll back to `4c2e86db-6998-4e30-874c-bcce9d1c3971` (candidate 7). No schema change. Saved bookmarks are dropped; nothing else is lost.
