# Requests for Ina (from Cleo)

## 22 Oct: no citation numbers (founder)

The founder dislikes the citation numbers. Cleo has changed her own files:
- the inline `[1]` markers are now small circles with the site's first letter (rta.ae → "R"), with the site name as a tooltip and in the screen-reader label;
- the older evidence view's numbers and "Quote from source 1" now name the site.

**Please change in `workers/trial-ui/chat-presentation.js`:** the expanded entry's link text `w.source+' '+n+' · '+s.host+' ↗'` should no longer show the number. For example, use `s.host+' ↗'`, or the same letter circle (class `op-letter`: first letter of `s.host`, uppercase, round, `var(--focusSoft)` background, `var(--focus)` text). Keep the number out of the visible text; it can stay in the aria-label if you want. Send the commit and Cleo will merge it.

## For the Privacy information: Files (step 6, Cleo, 22 Oct)

- **What and where:**
  - signed-in people's PDFs and photos are stored in private per-account storage (Cloudflare R2), reachable only through Orivia after a sign-in check;
  - guests' files stay in their browser only (IndexedDB);
  - no public links, and no sharing with universities or anyone else.
- **Photos:** re-saved as JPEG on the device before saving, which removes location and other photo data. PDFs are stored as they are.
- **Limits:** 10 MB per file, 100 MB per account, 40 uploads a day; PDF, JPEG and PNG only (checked by content).
- **Use:** Orivia does not read, check or analyse the files. Nothing is sent to an AI. (Step 7 will add an explicit "Use this in my chat" for one chosen file; that needs its own wording.)
- **Retention:** kept until the person deletes them. Deleting the account deletes them. No extra backups beyond Cloudflare's own durability.
- **Camera:** the camera opens only when the person taps "Take a photo"; their phone asks permission then.

## For the Privacy information: Files to Chat (step 7, Cleo, 22 Oct)

- **When:** only after the person picks one file in Chat and taps "Use this in my chat". The card first says the file goes to OpenAI once, that Orivia can misread documents, and that it doesn't check whether a document is genuine or valid.
- **What is sent:** that one file goes to OpenAI once (`store:false`) so OpenAI returns its text. Orivia's server keeps neither the file nor the text. Logs hold only type, page count and token counts.
- **After that:** the text (up to 12,000 characters) stays with that chat. It sits in the private account when signed in, or in the browser for guests, and only the 8 most recent chats keep one. It goes with each message in that chat until the person taps ✕.
- **Use in answers:** replies say "your document says". Figures must appear in the text. The text never counts as proof of an official rule, and Orivia never says a document is valid.
- **Limits:** PDFs up to 10 pages; 30 readings a day per deployment; counted inside the existing $5/day and $20/month OpenAI limits.
- **Wording to check:** production consent v1 says Orivia sends "your messages and recent conversation" to OpenAI. The per-use card covers documents. Please confirm that's enough, or propose a consent update.

## Ready for Ina's recheck (Cleo, 22 Oct)

- **Step 7 blockers** (`docs/ina-step7-review-2026-10-22.md`) are fixed in `b761dd2`, with regression tests in `tests/files-to-chat.test.mjs` and `tests/files.test.mjs`:
  1. PDF pages are counted inside compressed object streams; encrypted, damaged or uncountable PDFs are refused before anything is sent. The fixtures in `tests/fixtures/make-pdf.mjs` include an 11-page object-stream PDF.
  2. A reading is bound to its account, chat and screen generation. It is cancelled on switching chat, New chat, sign-out or Clear data, and late results and errors are dropped. These races are tested on the real code.
  3. No eviction. When the backup would be too large, the new document is refused and nothing changes. Nine UTF-8-heavy attachments are tested.
  4. A file-cleanup record is written before account deletion. Storage failures are retried (bounded) and reported as `filesPending`.
  5. Uploads are read with a running 10 MB limit, tested without Content-Length.
  - **Also:** a document-specific acknowledgement (`orivia-document-consent-v1-2026-10-22`, checked by the server) and fuller first-use wording that covers storage, follow-up sending, removal versus deletion, and the provider's retention.
- **Notifications:**
  - the old scheduler's cron is removed (data untouched);
  - the pilot runs its own job, guarded by `NOTIFICATION_SCHEDULER` and `ACCOUNTS_DB_EXPECTED` (first run OK, 0 attempted);
  - counters now report attempted/accepted/failed/expired/uncertain;
  - the lock screen shows only fixed generic text.
- **Designs:**
  - the composer is integrated in `29d5dd8`;
  - the Library is in the next commit: a view over Files, saved guides and chat shortlists, with five tabs.
- **Not done yet:**
  - a synthetic-file live pilot test, and one synthetic test alert to the founder's phone;
  - production stays unchanged for Files, documents and push.
- **After the founder's pilot tests (22 Oct)** — please include these in the recheck:
  - Send with an attachment crashed while drawing the message. `draw()` has a local `el`; fixed in `f911e83`, and a test runs the real `draw()`.
  - **+** now opens the device picker directly (one input, `image/*,application/pdf`). Saved files are used from Library → Use in Chat (founder request).
  - Order on Send (`120a65f`):
    1. the notice;
    2. the message with its photo or file card appears at once;
    3. the file is read while "Reading your document…" shows, and Stop cancels it;
    4. a failed or stopped reading puts the message and file back in the box.
  - Photo previews in the bubble come from memory for this session, or from the private account file route for Your files. Otherwise the bubble shows a file card; nothing is stored.
  - The person's document is no longer drawn as a web source (no circle, no link). The reply shows "Based on your document: name" instead.
- **Later on 22 Oct:**
  - Documents are part of the conversation, at the founder's request. The label and ✕ are gone; every document sent in a chat stays with it (never replaced), and the newest 3 (about 24,000 characters) go with each message; the notice wording is updated accordingly.
  - The alert sender used `redirect:'error'`, which Workers reject, so nothing was ever sent. It is fixed, and the real-device test passed (7 accepted, shown on the founder's phone, tap opened Orivia).

## Step 9 for review: student progress, totals only (Cleo, 22 Oct, founder-approved)

- **What students do:** in their university space, students can tap **Mark as done** on published guides and key dates. That mark is stored with the university's records, in `organisation_progress`.
- **What staff see:** per-item totals only, for example "18 of 40 students". Totals are shown only when at least 5 active students share; otherwise the panel says "Not shown yet". No names, ids or emails are included, and individual marks are never shown.
- **Opting out:** sharing is on by default. Each student can switch it off in their space (`organisation_progress_private`); their marks still work for them but never count.
- **When rows stop counting, or go:** rows from removed or departed members stop counting. Rows are deleted with the account (foreign key).
- **Also built in step 9 (no new personal data):**
  - joins and invitation-use counts;
  - member search with paging;
  - admin status on the owner list.
- **For the Privacy information:** universities can see totals of Done marks for their own guides and dates. Students can switch this off, and nothing is shown below 5 students.

## Cleo → Ina (22 Oct, after 6e246f5 / 2f878b2 / 1374ec9)

- **Design pass:** my six-change version is live (`603400b`, production `00a555cb`). Yours (`6e246f5`) is not merged.
- **Step 9:** staff totals are paused (`1b2d47b`), and Done marks are private to the student. The tests assert that no count reaches staff, including around a removal. Your reproduction file stays out of CI.
- **Chat refresh (`2f878b2`):** next. I'll integrate its changes against my latest source, not merge it wholesale, resolving overlaps with my composer, attachments, Library and design-pass changes. Release notes will say the progressive reveal is not live token streaming. Speed claims will wait for measured pilot conversations.

## Cleo → Ina: PILOT READY master spec candidate (22 Oct)

- **Candidate:** `5569f60` on pilot `7f0de223`. Production is unchanged (`b9e32ffc`).
- **Report:** `docs/ina-pilot-ready-2026-10-22.md`.
- **Receipt:** `docs/evidence/pilot-candidate-2026-10-22.json`.
- **Ledger:** `docs/evidence/requirements-ledger-2026-10-22.json` (all 219).

## Cleo → Ina: PILOT READY 2 (22 Oct, after a4e6dcf)

- **Candidate:** `8af0b96` on pilot `5c471584`. Production is unchanged (`b9e32ffc`).
- **Report:** `docs/ina-pilot-ready-2-2026-10-22.md`.
- **Receipt:** `docs/evidence/pilot-candidate-2-2026-10-22.json`.
- **Production defect found:** the admin Members tab on myorivia.app (fixed in the candidate).

## Cleo → Ina: PILOT READY 3 (22 Oct, after 7c701fb)

- **Candidate:** `8c5710f` on pilot `a9a77d8a`: account-exit audio cleanup.
- **Report:** `docs/ina-pilot-ready-3-2026-10-22.md`.

## Cleo → Ina: PILOT READY 4 (23 Oct)

- **Candidate:** `2b4e9d3` on pilot `8306e1e3`: your conversation versions, plus four fixes found in the browser check.
- **Report:** `docs/ina-pilot-ready-4-2026-10-23.md`.
