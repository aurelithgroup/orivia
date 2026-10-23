# Backups and restore (ORI-SEC-006)

What Orivia can actually restore today, how, and what it can't.

## Databases (Cloudflare D1)

| Database | Contents | Built-in protection |
|---|---|---|
| Production accounts (`3ebd10d5…`) | Accounts, synced personal copy (vault), organisations, feedback, audit | D1 Time Travel: point-in-time restore to any minute in the retention window (30 days on the paid plan, 7 on the free plan; check the account's plan) |
| Pilot accounts (`8cd85061…`) | Test accounts only | Same |
| Budget (`bd521420…`, shared) | Spend counters only, no personal data | Same |

**Restore a database to a point in time.** This replaces the whole database, so use it only on a founder decision:

```bash
npx wrangler d1 time-travel info <database> --timestamp=<RFC3339 or unix>
```

```bash
npx wrangler d1 time-travel restore <database> --bookmark=<bookmark>
```

The restore itself returns a bookmark for the pre-restore state, so the restore can be undone the same way.

**Copy without replacing anything:** `npx wrangler d1 export <database> --remote --output <file>`. The file contains personal data, so it's kept private and deleted after use, never committed.

## Drill (performed 23 Oct 2026 on the pilot)

`tools/restore-drill.mjs` restored a fresh export of the pilot accounts database into an empty SQLite database:
- all 27 tables and 56 rows came back;
- the integrity check returned `ok`;
- there were 0 foreign-key violations;
- the current migrations (`feedback.sql`, `platform-audit.sql`) applied twice changed nothing;
- every table's row count matched the live database.

**Evidence:** `docs/evidence/restore-drill-pilot-2026-10-23.json` (counts only). The export file was deleted. The CI test `tests/restore-drill.test.mjs` runs the same drill on a synthetic dump, including one with a broken foreign key that must fail.

**Not done:** a Time Travel restore on a live database. That replaces data, so it's left for a deliberate decision, ideally first on a copy.

## Code rollback

- **Worker rollback:** `npx wrangler rollback <version>` or the deploy script with an earlier build. Each candidate's receipt names the version to roll back to.
- **Schema changes:** these are additive (`CREATE TABLE IF NOT EXISTS`), so older code ignores newer tables and rows. A rollback keeps newer user data rather than deleting it.
- **Client data in the synced personal copy:** the Library's removed items (`store.library`) and conversation versions (`chat.versions`) live there. Older app code does **not** keep them: its loader rebuilds each chat without these fields, so the next save drops them (Ina f99c2b3).

  Checked with each version's own loader (`node tools/rollback-compat.mjs <chat.js> [chat-versions.js]`, 23 Oct):

  | App source | Keeps chat versions | Keeps Library removals |
  |---|---|---|
  | `a846926` (production `b9e32ffc`) | no | no |
  | `1c94765` | no | yes |
  | `5bdfcf8` and later (pilot candidates from `8306e1e3`) | yes | yes |

  **Rule:** once a release with conversation versions is live, roll back only to `5bdfcf8` or later. To undo a problem in that release, ship a forward fix. Don't roll back to an older build, because people's earlier versions and Library removals would be lost when their devices next save. `tests/rollback-compat.test.mjs` fails if the current code stops keeping these fields.

## Retention of withdrawn and expired shares, and of feedback

- **Withdrawn or expired shared link:** the page stops working at once, but the stored snapshot stays in the database until its owner deletes it or deletes the account. Expiry doesn't delete it.
- **Feedback reports and ratings:** these have no separate expiry. They're kept until marked reviewed and are deleted with the account.
- **Backups:** D1 Time Travel can bring back recently deleted rows for its retention window.

Privacy wording must describe exactly this until a purge schedule is decided.

## Files (R2: `orivia-files-production`, `orivia-files-pilot`)

**No automatic backup exists for stored files.** R2 has no point-in-time restore. Deleting a file, or deleting the account, removes it on purpose; the durable cleanup record protects active accounts.

A copy of the bucket or object versioning would be a new cost and a privacy decision (deleted files would persist). It needs the founder's choice, so it isn't switched on here.

## Personal data on devices

- **Chats, plans and the calendar:** saved in the browser and, for signed-in people, synced to the account vault.
- **Never evicted automatically:** a full device shows a warning and keeps existing data.
- **Restoring a device:** sign in again to restore from the account. Guests have no server copy; the Settings download is their backup.
