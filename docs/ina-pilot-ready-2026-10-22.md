# PILOT READY: master spec candidate (Cleo → Ina, 22 Oct 2026)

This is the one candidate for your independent review. It is frozen: any change after your findings will be a new commit and a new pilot version.

| | |
|---|---|
| Source | `5569f60def964f3ae8c908d746d543e89749114d` on `myorivia-release-plan` (built on baseline `a846926`) |
| Pilot Worker | `orivia-research-pilot` version `7f0de223-beaa-4179-af06-92f43d6df9e4` (bundle sha256 `866d2273…94115bb`) |
| Environment | Isolated pilot behind Cloudflare Access; accounts DB `orivia-accounts-pilot-test` (`8cd85061`); R2 `orivia-files-pilot` |
| Migration | `workers/accounts/feedback.sql` (two new tables), applied to the pilot DB only |
| Production | Unchanged: `b9e32ffc`, checked after the deploy. No budget, provider, email, store or sharing change. |
| Tests | 87/87 CI commands pass on a clean tree at `5569f60`, plus 3 headless-Chrome checks on the local harness |
| Receipt | `docs/evidence/pilot-candidate-2026-10-22.json` (machine-readable) |
| Ledger | `docs/evidence/requirements-ledger-2026-10-22.json`: all 219 requirements, each with a GOV-009 status, tested SHA, environment, evidence and dependency (built by `tools/requirements-ledger.mjs`, which rejects gaps and unknown statuses) |

## What's new in this candidate

1. **Week swipe (CAL-001).**
   - Only the week strip swipes, and each swipe moves exactly one week.
   - A swipe needs at least 48px of mostly horizontal movement. Vertical page scrolls are ignored, `pointercancel` cancels the swipe, and a swipe never also taps a day.
   - In RTL the direction is reversed.
   - The arrows stay. `touch-action: pan-y` keeps vertical scrolling native.
2. **Brand link colours (UX-003/004).**
   - The `--link` token is `#7A5300` on light surfaces and `#F5C842` on dark ones. Both themes are covered.
   - Links are underlined, so colour isn't the only cue.
   - AA contrast is computed in a test on 8 surfaces.
   - This applies to the app, the staff/owner console and the /manage refusal page. Source citations keep their own style.
3. **Rate a reply and Report a problem (CHAT-007/008, part of OWNER-009).**
   - Thumbs up or down, which you can change or remove.
   - Report a problem: choose one of 5 categories and add an optional note.
   - **"Include the text of this reply" is unticked by default.** A live preview says exactly what will be sent; the reply text goes only when ticked.
   - You get a receipt (`FB-xxxxxxxx`). Retries are idempotent by request id, and a failure never shows success.
   - Guests are told to sign in; nothing is stored for them.
   - Verified owners see 30-day totals and the report queue in Orivia management, with Mark reviewed and Reopen. **No reporter identity** is shown.
   - Rows are deleted with the account.
4. **Library: Places and services (LIB-002/003/004).**
   - Vetted, sourced place and service cards from chats appear automatically.
   - There is one entry per name and site, linked to its chat and source.
   - The ♥ favourite stays distinct and survives duplicate mentions.
   - Demo fixtures are excluded.
   - Remove takes two taps and hides the entry from the Library only; the chat keeps its card.

## Please look closely at

- **Library write rule.** Your rule "the Library never writes" now has exactly one exception: Remove adds the entry to `meta.hiddenDiscoveries` on the chats (scenario A12 needs removal). `tests/library.test.mjs` pins it to that single write. There is no Restore control yet (LIB-006: in progress).
- **Feedback and the Privacy text.** Feedback isn't in the Privacy information yet. What's stored: up/down, an optional reason, the category, the note and, only if ticked, that one reply. Nothing else from the conversation, documents, name or email reaches the queue. Your call whether this needs wording or a consent version before production.
- **Endpoint allowlist.** `tests/platform-ui.test.mjs` now allows `/api/account/feedback/queue`. That route is real and owner-gated, behind the session check.
- **Finding (not changed):** older public pages and config link to `*.habeebahsallah27.workers.dev`, which exposes the founder's username (GOV-010 / LEGAL-002). I recommend a custom domain.

## Suggested pilot checks (deployed candidate)

1. Calendar on a phone: swipe the strip left and right, scroll the page vertically, tap a day, use the arrows. Repeat in Arabic.
2. Chat, signed in: rate a reply, change the rating, remove it. Report a problem, first without and then with the reply text, and note the reference.
3. Orivia management (owner): the report appears without identity; mark it reviewed. As a student, `GET /api/account/feedback/queue` returns 403.
4. Ask for an official service centre twice in different chats. Library → Places and services shows it once; favourite it in the chat; Remove it; reload.
5. Links in both themes: Settings, the organisation space, and the /platform console.

## What is honestly not done (summary of the ledger)

- **Overall:** 219 requirements.
  - 32 locally or pilot verified, including 30 locally verified and 2 pilot verified (notifications);
  - 24 released earlier;
  - 88 existing but not re-tested against the new acceptance;
  - 7 in progress;
  - 60 deferred by the cut-off;
  - 8 blocked external.
- **P0 deferred:** 33 P0 items are deferred. The main ones:
  - message edit/regenerate with versions (CHAT-005/006);
  - share links (CHAT-009/010);
  - **multi-account switching (AUTH-002/003)**, deliberately not rushed, per the spec's warning;
  - the owner overview, analytics, budgets, communications, releases and privacy ops consoles (OWNER-001/003/005/007/012–014);
  - connector contracts (CONNECT-001/003/004);
  - metric definitions (METRIC-001);
  - true streaming (PERF-004);
  - backups and restore (SEC-006);
  - updates and offline review (SEC-007/008);
  - the native package (APP-002/004).
- **Speed (PERF-001):** 0 live samples. The pilot is behind Access, and I didn't ask the founder to test. The numbers-only timing log is ready: send the three benchmark classes (an ordinary question, fresh research, a follow-up) and I'll report each run and the median.
- **External blockers:**
  - university SSO and records;
  - operator details for Privacy and Terms;
  - a payment provider;
  - Apple and Android accounts and signing;
  - physical-device checks;
  - production push (until Privacy approval and a device check).

## Rollback

- **Pilot code:** roll back to `d673b88f-ce1c-4bce-8d8f-043079e92d0f` (the version before tonight).
- **Feedback tables:** these are additive and unused by older code. Leave them, or drop them from the pilot DB only.
