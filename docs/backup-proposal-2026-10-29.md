# Recovery limits today, and a file-backup proposal (Cleo, 29 October)

**Decision pending: nothing has been enabled.** No new bucket, Worker, schedule or paid service has been created. This needs the founder's decision because it's a cost decision and a privacy decision: a backup keeps deleted files for longer.

## 1. What can be recovered today

Details and commands are in `docs/backups.md`.

| Data | Where | Recovery today | Limit |
|---|---|---|---|
| Accounts, synced chats and plans, organisations, feedback, audit | D1 `orivia-accounts-private` (production) | D1 Time Travel, point-in-time restore of the whole database | Window is **7 days (free plan) or 30 days (paid plan): plan unknown**. A restore replaces the whole database. Never rehearsed live; drilled only on a pilot export (23 Oct) |
| Pilot test accounts | D1 `orivia-accounts-pilot-test` | Same | Same |
| Spending counters | D1 `orivia-beta-budget` (shared) | Same | Same |
| **Uploaded files** | R2 `orivia-files-production` (location hint WEUR), `orivia-files-pilot` (ENAM) | **None.** R2 has no point-in-time restore here | A deleted file, an account deletion, a bad cleanup or losing the bucket can't be undone |
| Guest chats and settings | The visitor's browser | None on our side | Clearing browser data removes them. A different address or device doesn't have them |
| Code | Cloudflare Worker versions | Roll back to an earlier version | Needs the deployment hold lifted |

**Current file storage (read-only `wrangler r2 bucket info`, 29 Oct):** both buckets have **0 objects (0 B)**. Nothing is at risk today. The risk starts when people upload files.

## 2. Proposal: a second, private R2 bucket with a deletion delay

**How it works:**
- **New bucket:** `orivia-files-production-backup`, in the same location hint (WEUR) and the same account, private, with no public access.
- **Copying:** when a file is saved, the same request also writes it to the backup bucket under the same key, `u/<user>/<file>`. A daily scheduled check re-copies anything missing, so a failed second write is caught.
- **Deleting a file:** the primary copy goes at once. The backup copy is kept for **30 days**, then deleted, so an accidental deletion can be reversed within 30 days.
- **Deleting an account:** the existing `file_cleanup` record also covers the backup prefix. The backup copies are deleted within **30 days**, and the cleanup isn't marked done until both buckets are empty.
- **Pilot:** gets no backup (test files only).

**Restore steps (owner only, no download to anyone's computer):**
1. Find what to restore: the file id from `account_files`, or a deletion within the last 30 days, from the audit log.
2. An owner-only restore action copies `u/<user>/<file>` from the backup bucket into the primary bucket inside Cloudflare, through the R2 bindings, then re-creates the `account_files` row.
3. Check that the size and type match the backup object.
4. Write an audit entry: who restored, which file id and when. No contents are written.
5. Tell the account holder in the app. **[TO DECIDE: wording]**

**Cost** (Cloudflare R2 Standard list prices as I understand them; **check the current price page before deciding**):

| Item | Price | Note |
|---|---|---|
| Storage | about $0.015 per GB-month | Doubles stored data. The first 10 GB-month a month is free across the account |
| Writes (Class A) | about $4.50 per million | One extra write per upload, plus the daily check |
| Reads (Class B) | about $0.36 per million | Daily check and restores only |
| Data transfer | no egress fee | |

| Example | Monthly cost of the backup |
|---|---|
| Today (0 GB) | $0 |
| 5 GB of files | about $0 (inside the free allowance, if nothing else uses it) |
| 50 GB of files | about $0.60 to $1.35, depending on how much of the free allowance is left |

Any amount is billed on the Cloudflare invoice, so it's part of the Cloudflare line in the cost review, not counted separately.

**Privacy changes if approved:**
- **Privacy information:** "deleted files are kept in a private backup for up to 30 days, then removed", replacing "a deleted file can't be recovered".
- **Account deletion text:** files leave the backup within 30 days.
- **Ina's review** of both changes is needed.

**What it doesn't cover:**
- **Databases:** Time Travel still covers those.
- **Guest data:** it stays on the device.
- **Loss of the whole Cloudflare account:** both buckets are in one account. That would need a copy outside Cloudflare, which is a separate decision with its own privacy questions.

## 3. Alternatives considered

| Option | Why not now |
|---|---|
| No file backup (today) | Fine while both buckets are empty; risky once people upload |
| Copy outside Cloudflare | Another processor, another location, and another privacy notice. Only worth it if the whole account must be protected |
| Object versioning | **[TO CONFIRM]** whether R2 offers it for these buckets. A 30-day deletion delay does the same job and is easier to reason about |
| Regular database exports to the backup bucket | Time Travel already covers short-term recovery. Export files hold personal data and would need their own retention rule |

## 4. Decision needed (not now)

1. Whether to create the backup bucket, before the first real uploads or at launch.
2. The deletion delay: 30 days, as proposed, or shorter.
3. Which plan the Cloudflare account is on (this also settles the D1 Time Travel window: 7 or 30 days).

Until then, `docs/backups.md` and the Privacy draft keep saying that deleted files can't be recovered.
