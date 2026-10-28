# Recovery limits today, and a file-backup proposal (Cleo, 28 October, Dubai; revised the same evening)

**Decision pending: nothing has been created or changed.** That means no bucket, Worker, schedule, retention setting, binding or paid service.

**Everything in sections 2 to 5 is proposed behaviour: not implemented, not tested and not guaranteed.** It's a design to decide on and then build and test. It's a cost decision and a privacy decision for the founder, with review by Ina. The checks this relies on, with their exact times, are in `docs/evidence/storage-and-restore-window-2026-10-28.json`.

## 1. What can be recovered today

Commands and the 23 October drill are in `docs/backups.md`.

| Data | Where | Recovery today | Limits |
|---|---|---|---|
| Accounts, synced chats and plans, organisations, file records (`account_files`), feedback, audit | D1 `orivia-accounts-private` (production) | D1 Time Travel: restore the **whole** database to a minute in the window | **Window: unconfirmed.** Probably 30 days, but that's an inference: at 17:01 UTC on 28 Oct the budget database still had a restore point from 19 Oct, beyond the free plan's 7 days, which points to Workers Paid. It's not confirmed from billing, and an older restore point doesn't guarantee the window in future. A restore replaces everything, newer changes included. It has never been rehearsed on a live database (only a drill on a pilot export) |
| Pilot test accounts | D1 `orivia-accounts-pilot-test` | Same | Same |
| Spending counters | D1 `orivia-beta-budget` (shared) | Same | Same |
| **Uploaded files** | R2 `orivia-files-production`, `orivia-files-pilot` | **None** | A deleted file, an account deletion, a faulty cleanup, an overwrite, or losing the bucket can't be undone |
| Guest chats and settings | The visitor's browser | None on our side | Clearing browser data removes them |
| Code | Worker versions | Roll back to an earlier version | Waits for the hold to lift |

**What "0 objects" means.** At 17:01 UTC on 28 October (21:01 Dubai), `wrangler r2 bucket info` found **0 objects (0 B)** in both file buckets. That only says no uploaded files were found at that check. It doesn't mean nothing is at risk:
- **Database records** (accounts, chats, plans, file records) are at risk now and rely only on Time Travel.
- **Any upload from now on** has no backup at all.
- **A restore can disagree with storage.** A database restore can bring back `account_files` rows whose files are gone, or leave files with no row. Nothing reconciles the two today.

**What the location means.**
- `orivia-files-production` has the location hint `WEUR`. Cloudflare calls hints "a best effort and not a guarantee".
- Only a **jurisdiction restriction** (for example `eu`) guarantees where objects are stored, and it **can only be set when a bucket is created**.
- So the current production bucket has no guaranteed residency. A guarantee would need a new jurisdiction-restricted bucket and a move. That's cheapest now, while no uploads were found, and it's a founder decision.
- The pilot bucket's hint is `ENAM` (eastern North America).

## 2. What a second bucket would and wouldn't protect against (proposed)

A second private bucket in the same Cloudflare account. A matching location hint wouldn't make it geographically independent or guarantee where it's stored. A different hint wouldn't either.

| Failure | Protected? |
|---|---|
| A bug or a faulty cleanup deleting or overwriting files in the primary bucket | **Yes**, if the backup copy was made before the fault and the fault didn't reach the backup |
| An operator deleting objects, or the primary bucket, by mistake | **Yes** |
| A wrong lifecycle or retention rule on the primary bucket | **Yes**, if the backup has its own settings |
| A file deleted on purpose by the person | **No, by design.** The backup copy goes too (section 3) |
| The Cloudflare account compromised, suspended or closed | **No.** Both buckets are in one account |
| Cloudflare-side data loss affecting both buckets | **Not established.** Same provider, and the docs make no statement about separation |
| Bad data copied to the backup before anyone notices | **No.** The backup holds the latest copy only, unless versions are kept (section 4) |

Protection against loss of the whole account would need a copy outside Cloudflare. That's another processor and another location, so it's a separate decision.

## 3. Deletion: how deleted data would stay deleted (proposed)

Deleting from two buckets is **two separate operations, not one atomic step**. Either can fail, time out, or succeed with the response lost. So the design relies on writing the deletion down first, retrying, and reconciling. It doesn't rely on both deletes happening together.

### Ordinary file deletion

The person deletes one file:
1. **Record first.** The deletion record (below) is written, in D1 and as a marker in the backup bucket, **before** either copy is touched. If writing it fails, nothing is deleted, and the person is told to try again.
2. **Primary copy, then backup copy.** Each delete is attempted separately, and each result is stored on the record (`primary purged at`, `backup purged at`). A delete of an already-missing object counts as done, so a retry is safe.
3. **Retries.** Any copy not yet confirmed gone is retried on a schedule, with growing waits. Every failure is logged without contents. After a set number of failed attempts, it shows in the owner's cleanup view. It's never silently dropped.
4. **Reconciliation.** A daily pass compares both buckets with the deletion records. Any object that has a record is deleted again, whichever bucket it's in.
5. **What the person sees.** The file is gone from the app as soon as step 1 succeeds. Behind that, the copies are removed by steps 2 to 4. Until both are confirmed, the record stays open.

**No delay is proposed.** Keeping deleted files for a set time (an "undo" window) would only be worth it if people need to recover files they deleted themselves. There's no evidence of that need yet. It would also mean telling people deleted files persist. If a need appears, the window length, its reason and the privacy wording get decided together. It's not adopted here.

### Account deletion

- The existing `file_cleanup` record (written before the account is removed) would be extended to cover the backup prefix `u/<user>/` too, plus an account-wide deletion record (marker `tombstones/<user>/all`).
- Each prefix is emptied separately, in pages of objects. Progress is stored, so a retry carries on where it stopped.
- The account counts as "fully deleted" only once both prefixes are confirmed empty and the reconciliation pass finds nothing left. Retries continue until then, and failures show in the owner's cleanup view.

### Deletion records ("tombstones")

These stop deleted data from coming back.

- **What's recorded:** `{scope: file | account, user id, file id or none, deleted at, primary purged at, backup purged at}`. Ids and times only, no names or contents.
- **Where:** a D1 table, **and** a matching content-free marker object in the backup bucket (`tombstones/<user>/<file or all>`). A D1 Time Travel restore rolls the table back, but not the marker.
- **Copying:** the copy job checks for a tombstone before writing and again after writing. If a deletion happened in between, it removes its own copy.
- **Reconciliation:** never copies a key that has a tombstone.
- **Restore:** refuses any key with a tombstone, whether a single file or a whole account.
- **After any D1 Time Travel restore:** a reconciliation re-applies every tombstone. Rows and objects from before a deletion are removed again. This also covers account rows, which Time Travel can bring back today.
- **How long tombstones are kept:** until both copies are confirmed purged **and** the D1 restore window has passed, so no restore can bring the data back. The window is **unconfirmed**: 30 days is inferred from a 9-day-old restore point, not from billing, and isn't guaranteed for the future. So the rule is tied to the window actually in force, checked at that time, not to a fixed number of days.

## 4. Restore (proposed; owner only, inside Cloudflare, no download to anyone's computer)

1. Find what's missing: compare `account_files` rows with primary objects (the reconciliation report), or start from a fault report.
2. Check the tombstones in D1 **and** the backup bucket's markers. A key with either is never restored.
3. Copy `u/<user>/<file>` from the backup to the primary bucket through the R2 bindings, and re-create the `account_files` row if it's missing.
4. Check that the size and type match the backup object.
5. Write an audit entry (owner, file id, time; no contents). Tell the account holder in the app **[TO DECIDE: wording]**.

**Optional, not proposed:** keeping earlier versions, to protect against bad data being copied over the backup. It would multiply storage, and every kept version would also need tombstone handling.

## 5. Provisional cost (estimate, not a quote)

**Prices** are from Cloudflare's R2 pricing page, fetched on 28 October between 20:49 and 20:54 Dubai time:

| Item | Price |
|---|---|
| Standard storage | $0.015 / GB-month |
| Class A operations (`PutObject`, `CopyObject`, `ListObjects`) | $4.50 / million |
| Class B operations (`GetObject`, `HeadObject`) | $0.36 / million |
| Free tier, each month, **shared across the whole account** | 10 GB-month, 1M Class A, 10M Class B |
| Egress | none |
| Minimum storage duration | none |

Delete pricing wasn't on that page **[TO CONFIRM]**.

**What the backup adds:**

| Part | Operations | Note |
|---|---|---|
| Copying | 1 `PutObject` (Class A) per upload, written from the upload request | No extra read |
| Tombstones | 1 small `PutObject` per deletion (file or account), plus the deletes | Markers are a few bytes |
| Reconciliation | Daily `ListObjects` on both buckets, about 1 Class A per 1,000 keys per bucket per day, plus `HeadObject` (Class B) for mismatches | At 10,000 files that's about 600 Class A a month |
| Retained versions | None in this proposal | Storage would grow if versions or an undo window were added later |
| Storage | The same GB again as the primary bucket | |

**Examples** (provisional; they assume nothing else uses the free tier):

| Files stored | Uploads a month | Backup cost a month |
|---|---|---|
| 0 GB (check at 17:01 UTC, 28 Oct) | 0 | $0 |
| 5 GB | 2,000 | about $0 (within the free tier) |
| 50 GB | 20,000 | about $0.75 for storage (the primary already uses the free 10 GB), plus operations within the free 1M |
| 200 GB | 50,000 | about $3.00 for storage, plus operations within the free 1M |

**How the examples are worked out:** the backup's added storage cost = its GB × $0.015, once the account already uses the free 10 GB-month. Added Class A is about 1 per upload + 1 per deletion + the daily listings. It's charged only above 1M a month across the account.

All of it appears on the Cloudflare invoice, within the Cloudflare line of the cost review.

## 6. Decisions needed (not now)

1. **Backup:** whether to create it, and when (before real uploads, or at launch).
2. **Undo window:** whether one is needed for files people delete. The default is none.
3. **EU jurisdiction for files: pending option (founder, 28 Oct: keep the current bucket for now).**
   - The existing production bucket stays as it is. Nothing will be created, replaced or rebound.
   - **The option:** a new bucket with jurisdiction `eu` (it can only be set at creation), then the binding switched to it. That's cheapest while no uploads have been found (0 objects at 17:01 UTC, 28 Oct).
   - **If chosen, it would need:** a plan with its steps, the binding change, the Privacy wording and a rollback, approved after the hold.
4. **Plan:** confirm Workers Paid from billing (it's inferred above, not confirmed).

Until then, `docs/backups.md` and the Privacy draft keep saying that deleted files can't be recovered.
