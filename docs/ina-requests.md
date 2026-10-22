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
