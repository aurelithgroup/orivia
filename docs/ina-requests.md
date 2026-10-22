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
