# PILOT READY 5: five spec slices (Cleo → Ina, 23 Oct 2026)

| | |
|---|---|
| Source | `7e9fd73` on `myorivia-release-plan` (includes candidate 4, `2b4e9d3`, which still awaits your review) |
| Pilot Worker | `orivia-research-pilot` version `0205e4d3-660a-4b7e-b95e-6846a00fcf77` (bundle sha256 `c4566a8e…f699a`) |
| Migration | `workers/accounts/platform-audit.sql`, applied to pilot DB `8cd85061` only |
| Production | Unchanged: `b9e32ffc`. Spending limits unchanged. |
| Tests | 98/98 CI commands pass on a clean tree |
| Receipt | `docs/evidence/pilot-candidate-5-2026-10-23.json` |
| Ledger | 54 locally and 2 pilot verified; P0 deferred down from 31 to 17 |

## What's new

**1. Metric definitions and safe export (METRIC-001/006): `31f285e`.**
- `docs/metrics.md` defines every number the consoles show: what's counted, the source table, time basis, roles and limits.
- Paused and Unavailable metrics are named as such, never shown as 0.
- `tests/metric-definitions.test.mjs` fails if the server returns a metric that isn't documented.
- **Download CSV (owners only):**
  - up to 100 organisations, with an optional search filter;
  - no names or emails;
  - every cell quoted, and a cell starting with `= + - @`, tab or carriage return gets a leading `'`;
  - each export writes a `platform_audit` row without the search text.
- Tests use real sessions: refused for student, admin, non-member and signed-out visitors; a `=HYPERLINK(...)` organisation name is neutralised.

**2. Offline integrity and updates (SEC-007/008): `b53498f`.**
- `tests/offline-updates.test.mjs` runs the real `app-sw.js`. Private API, chat and account pages are never cached or served offline; only the app shell is; old caches are removed.
- When an update is ready, Reload keeps the unsent draft for this account and chat for 10 minutes. It waits, and says why, while a reply is in progress or a file is attached.
- Any other service worker whose scope overlaps the app's is unregistered.
- The browser check shows the draft back after the reload, and the reload refused during a reply.

**3. Accounts on this device (AUTH-002/003/006): `8420457`, browser check `d9069ae`.**
- Uses Better Auth 1.7.11 multi-session, up to 4 accounts. I read the plugin's source first: its endpoints return raw session tokens, so they stay blocked in `AUTH_PATHS`.
- Orivia's `/api/account/device-accounts` routes call the plugin on the server and give the page only an HMAC reference.
- Switch and remove re-resolve that reference from this device's signed cookies and need the current account header.
- Tests use real sessions, with one cookie jar per device. They cover:
  - two accounts remembered, with no raw token in any response;
  - switching with no code;
  - refusal for a malformed or forged reference, a user ID, another device's account, a wrong or missing account header, and an expired session;
  - removing one account revokes only its server session and keeps the others.
- **Real-UI browser check:** the harness now supports `HARNESS_ACCOUNTS=1` (real Better Auth on SQLite, codes captured locally). Signed in A, added B, the panel listed both, Switch reloaded as A, and two-tap Remove took B off the device.
- **Limitation:** new-account onboarding stops at "Make yourself at home" in the harness, which has no AI-agreement check locally. Switching doesn't depend on it.
- **Note:** existing pilot sessions show only the current account until that person signs in again with the plugin active.

**4. University connector contract (CONNECT-001/003/004/005/006): `197218d`.**
- Fixture-only; see `docs/connectors.md`.
- Read-only capabilities. A connection counts as configured only with a server credential **and** a partner agreement.
- Identity comes from institution claims; a typed student ID is ignored.
- Updates are HMAC-signed, accepted within 5 minutes, schema-strict, idempotent by event ID, routed by the verifying connection, and never regress a newer source version.
- Provenance is kept, and a university's "submitted" is never shown as an authority's approval.
- Revoked connections refuse queued updates.
- **Nothing is connected to any real university.**

**5. Backups and a restore drill (SEC-006): `7e9fd73`.**
- `docs/backups.md` covers D1 Time Travel and exports, additive schema for rollback, and states plainly that **R2 files have no automatic backup**, which is a founder cost and privacy decision.
- **Pilot drill:** export, then a fresh SQLite database:
  - 27 tables, 56 rows;
  - integrity `ok`, 0 foreign-key violations;
  - migrations idempotent;
  - row counts equal to the live database.
- The export was deleted; the evidence holds counts only. CI runs the drill on a synthetic dump, including cases that must fail.

## Please review

- **Multi-session:** the server-only design, and whether 4 accounts per device is right.
- **CSV:** the formula escaping, the audit content, and the 100-row bound.
- **Updates:** keeping a draft in `sessionStorage` for 10 minutes. It's per tab and per account and is removed once restored.

## Still open

- **Your release gates:** the feedback Privacy and retention wording, and authenticated checks on the deployed pilot.
- **Earlier review:** candidate 4 (conversation versions) is still with you.
- **External blockers (unchanged):**
  - university SSO and records;
  - operator details for Privacy and Terms;
  - payments;
  - store accounts and signing;
  - physical devices.
- **Founder decision:** a backup for R2 files.

## Rollback

- **Pilot code:** roll back to `8306e1e3-a373-47a3-87aa-c3ea3471a1f8` (candidate 4).
- **`platform_audit`:** additive, so older code ignores it.
- **Multi-session cookies:** older code ignores the extra cookies.
