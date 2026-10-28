# Orivia Privacy information: DRAFT (Cleo, 28 October 2026)

> **Not published. Not legal advice.** This is product copy written against the code on `myorivia-release-plan` at `3e6022b`, for Ina's review (ORI-LEGAL-001).
>
> **Public launch blocker.** The `[OPERATOR: …]` gaps block any public launch of this release. Privacy information is never published with them left open, and a release never goes out without Privacy information (ORI-LEGAL-002: no invented entity, address or personal email).
>
> `[TO CONFIRM: …]` marks a fact I couldn't verify in the code.
>
> **Branch-specific, pending reconciliation.** This draft describes `myorivia-release-plan` only. Ina's branch `ina/founder-ai-sponsorship-block-3-2026-10-25` already implements things this branch doesn't have yet:
> - account-scoped data requests with owner replies (`/api/me/data-requests`, `/api/admin/privacy-requests`);
> - member-bound sponsored placements with disclosure validation (`49bad94`, `2c14591`);
> - its own version of the progress-sharing controls.
>
> Where this draft says something isn't available, it means **on this branch**, not in the product. Before publishing, the draft is reconciled with whichever code is actually released.
>
> The source for each statement is listed in "Where each statement comes from" at the end.

---

## Who runs Orivia

Orivia is run by **[OPERATOR: legal name of the operating person or company]**, **[OPERATOR: registered address or a public business address]**.

Contact us about privacy at **[OPERATOR: public privacy contact email, not a personal address]**.

## What Orivia does

Orivia helps people settle in the UAE and the UK: answering questions, researching official pages, keeping plans, reminders and documents, and connecting students with their university.

## What we use, and why

### Using Orivia without an account (guest)

- **Your chats, plans, reminders and settings** stay in this browser on this device. They aren't stored in Orivia's database.
- **Clearing the browser's data** removes them. If you open Orivia at a different address or on another device, they won't be there.

### With an account

- **Your email address** is used to sign you in with a one-time code. Codes are six digits, stored only in scrambled (hashed) form, work once, expire after five minutes and allow five attempts.
- **Your chats, reminders, plans and "About me" details** are saved to your private account so they follow you across devices.
- **Some settings stay on each device**, such as display and research-consent choices.

### When you ask Orivia something

If you agree to use OpenAI (you're asked first, and the box starts unticked), the following are sent to OpenAI so it can understand you, research and write replies:
- your latest 12 chat messages;
- the public pages Orivia reads for you;
- your About me details, unless you turn off "Use About me in chats".

Orivia asks OpenAI not to store these requests (`store: false`). OpenAI's own retention terms still apply **[TO CONFIRM: link to the provider terms that apply to Orivia's account]**.

What isn't sent to OpenAI by default:
- your saved documents, unless you choose to ask about one;
- your calendar;
- your journeys.

**Backup provider:** when OpenAI isn't available, messages are sent to Cloudflare Workers AI instead.

**Web search:** general search terms are sent to Brave Search, never your full messages. Before a search, names you mentioned in the chat are removed.

**What Orivia never needs:** passport, visa or ID numbers.

### Documents and photos you add

- **Storage:** files you upload (up to 10 MB each) are stored privately for your account.
- **Reading a document:** when you choose to ask about a document, Orivia transcribes it and sends that document to OpenAI for that question only.
- **Deleting:** deleting a file, or your account, removes it. Stored files have no backup copy, so a deleted file can't be recovered.

### Voice

- **Dictation** uses your browser's own speech recognition. Depending on the browser, its maker may process the audio **[TO CONFIRM: wording per browser]**.
- **Listen** reads replies aloud.
  - It uses your phone's own voice unless you switch on the natural voice.
  - The natural voice sends only that reply's text to OpenAI to produce the audio.

### Your university (if you join one)

If you join a university space with an invitation, its staff can see:
- your membership details and join request;
- requests you send them;
- your replies to their updates and dates.

They **never** see:
- your personal chats;
- your files;
- your About me details;
- your personal calendar.

This is checked by the server on every request.

**Progress totals:** universities **don't** see progress totals at present. Staff see their guides' titles, not how many students marked a step done. Totals are paused until a way of reporting them that can't reveal an individual student is agreed. If they're switched on later, this section will say exactly what staff see, and you'll be able to keep your own marks private. **[RECONCILE against the combined release.]**

### Shared links

- **Creating a link:** when you share a reply, a read-only copy is stored and anyone with the link can open it.
- **Stopping a link:** you can withdraw it or set it to expire. Either way the page stops working at once. The stored copy stays until you delete it or delete your account.

### Feedback and reports

- **Ratings:** "Helpful" and "not helpful" ratings, and any reason you add, are stored with your account.
- **Reports:** "Report a problem" is linked to your account. The reply text is included only if you switch that on.
- **Retention:** both are kept until reviewed and are deleted with your account.

### Device alerts

Device alerts are **off** on myorivia.app for now. If they're switched on later, they'll be a separate, optional choice. Lock-screen text is always generic.

### Keeping Orivia safe and working

- **Human check:** Orivia uses Cloudflare Turnstile to check you're a person before any AI reply. It then sets a cookie for 12 hours.
- **Sign-in:** a sign-in cookie keeps you signed in.
- **Spending limits:** daily and monthly spending and search limits are counted per day, not per message content.
- **Logs:** technical logs record steps, outcomes and timings, not what you wrote.
- **No advertising or tracking cookies:** none, and no third-party analytics.
- **Owner analytics:** the owner sees counts taken from the live database. No separate analytics copy is kept.

## Where your information is kept

- **Hosting:** Orivia runs on Cloudflare.
- **Accounts database:** kept in the EU jurisdiction.
- **Uploaded files:** **[TO CONFIRM: R2 bucket location]**.
- **Providers:** OpenAI and Brave Search process requests under their own terms **[TO CONFIRM: processing locations and transfer basis]**.

## How long we keep it

| What | How long |
|---|---|
| Guest data | On your device until you clear it |
| Account data (chats, plans, About me) | Until you delete it or your account |
| Uploaded files | Until you delete them or your account. Not backed up |
| Shared-link copies | Until you delete them or your account, even after the link stops working |
| Ratings and reports | Until reviewed. Deleted with your account |
| University membership records | Kept after you leave, so that the university's own records add up. Deleted with your account |
| Sign-in codes | Five minutes |
| Recent database backups | Deleted records can be restored for up to **[TO CONFIRM: 7 or 30 days, depending on the Cloudflare plan]** |

## Your choices and rights

**In the app:**
- turn off OpenAI or "Use About me in chats";
- delete chats, files and shared links;
- leave a university;
- delete your account.

**Anything else:** for a copy of your data, a correction, or anything you can't do in the app, contact **[OPERATOR: privacy contact]**.
- **Checking it's you:** we confirm it's your account before acting.
- **Response time:** **[OPERATOR: response time]**.

On this branch, requests go to the contact above. Ina's branch adds an in-app data request with owner replies; once that is reconciled into the release, this section describes it instead (ORI-LEGAL-004).

**Complaints:** **[OPERATOR: the applicable data protection authority, depending on where the operator is established and who the users are]**.

## Children

**[OPERATOR DECISION: minimum age, and whether a parent can use Orivia for a child.]** This branch doesn't adjust content by age (ORI-HOME-009) **[TO CONFIRM against the released code]**.

## Changes

When something material changes, we update this page and its date. Where your agreement was based on the old version, we ask you again: consent is versioned, currently `orivia-ai-consent-v1-2026-10-21`.

Last updated: **[date of publication]**.

---

## Where each statement comes from (for review; not published)

| Statement | Source |
|---|---|
| Guest data stays on the device | consent copy in `workers/trial-ui/page.html`; `docs/myorivia-release-plan.md` (guests) |
| Email codes: six digits, hashed, single-use, five minutes, five attempts | `docs/accounts.md` |
| OpenAI: 12 messages, pages read, About me switch; documents, calendar and journeys not sent | `PRODUCTION_CONSENT` copy in `workers/orivia-research-pilot.mjs` |
| `store: false` | OpenAI calls in `workers/*.mjs` |
| Workers AI as backup | consent copy in `page.html`; `docs/myorivia-release-plan.md` (consent v1) |
| Brave: search terms only, names removed | consent copy; `conversationNames` / `safeQuery` in `workers/orivia-research-understand.mjs` (ORI-AI-009) |
| 10 MB files; no file backup; deletion removes them | `fileBytes:10*1024*1024`; `docs/backups.md` (Files) |
| Document sent only when asked about | `workers/orivia-assistant.mjs` (documents); `tests/files-to-chat.test.mjs` |
| Dictation through the browser | `SpeechRecognition` in `workers/trial-ui/chat.js` |
| Natural voice sends only the reply text | voice copy in `page.html`; `workers/orivia-voice.mjs` |
| Staff never see chats, files, About me or calendar | `tests/staff-tenant-matrix.test.mjs`; Ina's step 9 review |
| Progress totals paused; no anonymity promise | `organisations.mjs` lines 17-19 on both branches ("no counts until a reporting approach is agreed"); Ina's step 9 review (22 Oct); `organisation_progress_private` in `workers/accounts/organisations.mjs` (this branch); Ina's branch has its own version (reconcile) |
| Membership rows kept after leaving | Ina's step 9 review (Retention) |
| Shared links: the copy stays after withdrawal or expiry | `docs/backups.md` (Retention of withdrawn and expired shares) |
| Feedback kept until reviewed | `docs/backups.md`; `tests/feedback.test.mjs` |
| Device alerts off; generic lock-screen text | `docs/myorivia-release-plan.md` (Ina's requirements) |
| Turnstile; 12-hour cookie | `orivia_human` cookie, `Max-Age=43200`, in `workers/orivia-ai-private-trial.mjs` |
| Logs hold codes, not chat text | timing log in `workers/orivia-assistant.mjs`; `tests/assistant.test.mjs` |
| Analytics from the live database only | `docs/metrics.md` |
| Accounts database in the EU | `docs/accounts.md` (`orivia-accounts-private`, EU jurisdiction) |
| D1 point-in-time restore | `docs/backups.md` |
