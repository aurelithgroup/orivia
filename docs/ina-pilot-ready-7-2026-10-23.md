# PILOT READY 7: fixes for your review of candidates 4–6 (Cleo → Ina, 23 Oct 2026)

| | |
|---|---|
| Source | `e89f864` on `myorivia-release-plan` |
| Pilot Worker | `orivia-research-pilot` version `4c2e86db-6998-4e30-874c-bcce9d1c3971` (bundle sha256 `e417f6e7…afe46c`) |
| Migrations | None |
| Production | Unchanged: `b9e32ffc`. Spending limits unchanged. Pilot Access unchanged. |
| Tests | 103/103 CI commands pass on a clean tree |
| Receipt | `docs/evidence/pilot-candidate-7-2026-10-23.json` |

## Your findings (`f99c2b3`)

**1. Share provenance.**
- **The stamp:** every new reply now carries a permanent `meta.origin = {v:1, documents, university}`. It records what the request actually carried: documents sent, or a university context in use. It's set in `sendChat` before the request.
- **What's excluded:**
  - replies stamped either way;
  - replies citing a document-category source;
  - replies with no v1 stamp (all older ones), labelled "Older reply: Orivia can't check…".
- **What it survives:** clearing the university context, switching versions (snapshots copy `meta`) and reloads.
- **Tests:** `tests/share-provenance.test.mjs` runs the shipped `share-select.js` and `chat-versions.js` on both your reproductions:
  - a document-sourced reply with no attachment → `document`;
  - a university reply with `orgContext` deleted → still `university`.

  It also covers older replies, version switching plus a JSON reload, and a clean payload. `chat-versions-integration` asserts that the real `sendChat` stamps the reply.
- **Dialog wording:** it now says the person decides what's shared and that Orivia can't guarantee their own text is free of private details. There's no confidentiality claim, in the app or the docs.

**2. Production routing.**
- `/^\/s\/[A-Za-z0-9_-]{20,100}$/` is added to both `isAppPath` lists (production and the front door). Nothing else under `/s/` matches.
- Production no longer relaxes `frame-ancestors` for `/s/` pages.
- `tests/share-routing.test.mjs` sends requests through the real front door into the real production Worker and the accounts handler, with SQLite. It covers:
  - an active link: escaped, `noindex`, `frame-ancestors 'none'`, no cookies;
  - HEAD;
  - unknown, expired and revoked links giving identical 404s;
  - POST refused with 405;
  - the owner API and the vault still refused without a session.
- It fails on the previous route lists. Pilot Access is untouched.

**3. Retention.** `docs/backups.md` now states what's built:
- expiry and withdrawal stop access, but the snapshot stays stored until the owner deletes it or deletes the account;
- feedback has no separate expiry;
- Time Travel can restore recently deleted rows.

The Privacy text stays with the founder.

**4. Connector atomicity.**
- `receiveUpdate` writes the event row and the status in one `db.batch` (a D1 transaction).
- Your reproduction, a failure injected on the status statement, now leaves nothing written, and the retry applies `{applied:true}`. An applied update with a lost response retries as `duplicate` with the status intact.
- The new test fails on the old code ("Missing expected rejection").

**5. Rollback documentation.**
- `tools/rollback-compat.mjs` runs each build's own `normChat` and loader on a saved record.

  | Build | Chat versions | Library removals |
  |---|---|---|
  | `a846926` (production) | dropped | dropped |
  | `1c94765` | dropped | kept |
  | `5bdfcf8` and later | kept | kept |

- `docs/backups.md` now states the rule: once versions are live, roll back only to `5bdfcf8` or later, otherwise ship a forward fix.
- `tests/rollback-compat.test.mjs` fails if the current code stops keeping these fields.

## Still open (your gates)

- **Privacy and retention wording:** for feedback and shared links.
- **Authenticated checks on the deployed pilot**, plus real-device and real-provider timing.
- **Founder decisions:**
  - the admin Members-tab fix is still unreleased in production;
  - an R2 backup.

## Rollback

Roll back to `8bed9b56-362c-4609-8ac2-1ca97706a481` (candidate 6). There is no schema change.
