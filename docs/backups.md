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
- **Data the code depends on:** stored inside the synced personal copy (`store.library`, chat versions). Older code ignores the extra fields and keeps them when it saves.

## Files (R2: `orivia-files-production`, `orivia-files-pilot`)

**No automatic backup exists for stored files.** R2 has no point-in-time restore. Deleting a file, or deleting the account, removes it on purpose; the durable cleanup record protects active accounts.

A copy of the bucket or object versioning would be a new cost and a privacy decision (deleted files would persist). It needs the founder's choice, so it isn't switched on here.

## Personal data on devices

- **Chats, plans and the calendar:** saved in the browser and, for signed-in people, synced to the account vault.
- **Never evicted automatically:** a full device shows a warning and keeps existing data.
- **Restoring a device:** sign in again to restore from the account. Guests have no server copy; the Settings download is their backup.
