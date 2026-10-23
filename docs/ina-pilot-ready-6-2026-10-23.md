# PILOT READY 6: share links, language matrix, dependency review (Cleo → Ina, 23 Oct 2026)

| | |
|---|---|
| Source | `790dd57` on `myorivia-release-plan` (includes candidates 4 and 5, still with you) |
| Pilot Worker | `orivia-research-pilot` version `8bed9b56-362c-4609-8ac2-1ca97706a481` (bundle sha256 `f59b17a4…99f0c32`) |
| Migration | `workers/accounts/shares.sql`, applied to pilot DB `8cd85061` only |
| Production | Unchanged: `b9e32ffc`. Spending limits unchanged. |
| Tests | 100/100 CI commands pass on a clean tree |
| Receipt | `docs/evidence/pilot-candidate-6-2026-10-23.json` |
| Ledger | 58 locally and 2 pilot verified; P0 deferred: 14 |

## New

**Share links (CHAT-009/010): `790dd57`.**
- **The dialog:** Share… in a reply's ⋯ menu opens a review. You tick the messages to share; the reply and its question are pre-selected. These can't be selected, and the reason is shown:
  - a message with an attached file;
  - any reply after a document was attached;
  - replies in a chat using university members-only guidance.
- **What's sent and kept:** only text and public https sources are sent; document sources are dropped. Expiry is 1, 7 or 30 days.
- **The link:** the server stores the snapshot and a SHA-256 of a random 256-bit token. The link is shown once.
- **The shared page:** `/s/<token>` is read-only with escaped text, and sources are attributed with `rel="noopener noreferrer nofollow"`. It carries `X-Robots-Tag: noindex, nofollow` and a strict CSP. It sets no cookies, reads no account and grants nothing. Unknown, revoked and expired links show the same "isn't available" page.
- **Stopping a link:** Withdraw, Delete, expiry and account deletion (FK cascade) all stop it at once. Another account can't withdraw or delete it (404).
- **Tests:** `tests/shares.test.mjs` uses real sessions and covers validation, escaping a hostile `<script>`/`<img onerror>`, headers, guessed tokens, ownership, revoke, expiry, delete and account deletion. It also runs the shipped selection rules.
- **Browser check** (stubbed signed-in user and API): a guest is told to sign in; the attachment and document-based reply are locked out with reasons; the request contains only the two allowed messages and one public source; the link is shown once; Active, then Withdrawn.
- **Pilot note:** `/s/` sits behind Access, so only Access users can open shared links there. For public links on myorivia.app, the front door must route `/s/`, which is a release decision. Shared links should also be covered in your Privacy and retention wording.

**Language matrix (VOICE-001): `4d4dfdc`.**
- `docs/language-matrix.md` tracks the 10 languages separately for UI, AI reply, dictation, natural voice and device voice.
- Each cell is live, tested, implemented, device or unavailable, and a test fails on any claim the code or tests don't support.
- Only English, French and Arabic have a UI; the other seven fall back to English.

**Dependency review (SEC-009): `4d4dfdc`.**
- The accounts dependencies have no audit findings.
- The pilot's 7 high findings all come from puppeteer's local browser downloader, and none of those packages is in the deployed bundle (checked through the build's source map). Browser rendering is also off.
- No automatic downgrade was applied.

## Rollback

- **Pilot code:** roll back to `0205e4d3-660a-4b7e-b95e-6846a00fcf77` (candidate 5).
- **`shared_snapshots`:** additive, and unused by older code.
