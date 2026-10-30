# Orivia Privacy information: DRAFT (Cleo, 28 October 2026)

> **Not published. Not legal advice.** This is product copy written against the code on `myorivia-release-plan` at `3e6022b`, for Ina's review (ORI-LEGAL-001).
>
> **Public launch blocker.** The `[OPERATOR: …]` gaps block any public launch of this release. Privacy information is never published with them left open, and a release never goes out without Privacy information (ORI-LEGAL-002: no invented entity, address or personal email).
>
> `[TO CONFIRM: …]` marks a fact I couldn't verify in the code.
>
> **Candidate-specific draft.** Data requests, university support and sponsored placements are implemented on this branch. Midnight owner analytics remains conditional until integration review. Reconcile the policies against the exact deployed source before publication.
>
> **Reconciliation checklist:** `docs/legal/reconciliation-combined-release.md` (14 features). The `[INCLUDE IF RELEASED]` paragraphs follow it.
>
> The source for each statement is listed in "Where each statement comes from" at the end.

---

## Missing operator details (fill in before publishing)

Every field below is still **missing**. Privacy information is not published until each is filled and checked.

| Field | Where it appears | Who supplies it |
|---|---|---|
| Legal name of the operator (person or company) | Who runs Orivia | Bee |
| Registered or public business address | Who runs Orivia | Bee |
| Public privacy contact email (not a personal address) | Who runs Orivia; Your choices and rights | Bee |
| Response time for privacy requests | Your choices and rights | Bee, with qualified advice |
| Data protection authority for complaints | Your choices and rights | Qualified advice, based on where the operator is established and who the users are |
| Minimum age, and whether a parent can use Orivia for a child | Children | Bee, with qualified advice |
| How long partner applications are kept | Features in the candidate | Bee |
| Whether email-code delivery outcomes are stored, and for how long | Reconciliation row 14 | Code check after reconciliation (Cleo/Ina) |

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

### Features in the frozen candidate (`bd3d93d`, 30 Oct)

The paragraphs marked **[IN CANDIDATE]** describe code in the frozen candidate `bd3d93d`. They are checked against that code and its tests. If the combined release differs, they change with it (see `docs/legal/reconciliation-combined-release.md`).

- **[IN CANDIDATE: data requests]** You can ask for a copy, a correction or deletion from Settings. We store the type of request, your message, its status and our reply. Only the Orivia owner reads it, and it's deleted with your account.
- **[IN CANDIDATE: university support]** When you send a request to your university's support team, its admins see your request and replies. They don't see your personal chats or files. Admins can note which team and which admin handles it, and link it to a step of one of the university's own process guides. You see the linked step if that guide is published. You don't see who is handling it. Separately, you can allow your university to forward the request text to Orivia support. You can withdraw that at any time, even after leaving the university.
- **[IN CANDIDATE: partner applications]** If you set up a university on Orivia, we keep your email address and the details you submit, so that we can review the application. **[OPERATOR DECISION: how long applications are kept. There is no deletion rule in the code yet.]**
- **[IN CANDIDATE: sponsored placements]** Sponsored items are labelled as sponsored, and they're shown only to members of the university they're for. Orivia doesn't count who sees or taps them, and it doesn't send sponsors any information about you. The link isn't tracked and doesn't pass on which Orivia page you came from. When you open a sponsor's website, it still receives the ordinary information any website gets from your browser, such as your IP address and device details, and its own privacy policy applies.
- **[IN CANDIDATE: response diagnostics]** If you turn on response timings in Settings, they're kept only on this device (at most 100 samples or 7 days) and contain no messages or account details. You can preview them, clear them, or download them as a file to your device. Orivia doesn't upload them; whether you share a downloaded file is up to you.
- **[IN CANDIDATE: university guide drafting]** University staff can ask Orivia to draft a guide from public pages or documents they supply. When they agree to it, those are sent to OpenAI. This never uses students' data. Drafts stay drafts until staff publish them.
- **[IN CANDIDATE: university welcome]** When you join a university, its campus details (country, area, town and reason) are added to your own profile. You can change your other details at any time. Your existing chats, plans and choices aren't changed by joining.
- **[IN CANDIDATE: campus directory]** Campus places and contacts are written by your university's staff. If you tap "Directions", the address is sent to Google Maps or Apple Maps, whichever you chose, and their privacy policy applies. Orivia doesn't send them anything else.
- **[IN CANDIDATE: photo check before you send a document]** When you review a photo, Orivia checks its sharpness and size on your device. The photo isn't sent anywhere for this check.
- **[INCLUDE IF RELEASED: owner analytics (Midnight, `cdab3b5`)]** The Orivia owner sees totals only: counts of actions, statuses and quota use, never individual people. Feedback reaches the owner as totals by category and status, without notes or names. **[TO CONFIRM against the reconciled code. Not in this candidate.]**

### Device alerts

Device alerts are **off** on myorivia.app for now. If they're switched on later, they'll be a separate, optional choice. Lock-screen text is always generic.

### Keeping Orivia safe and working

- **Human check:** Orivia uses Cloudflare Turnstile to check you're a person before any AI reply. It then sets a cookie for 12 hours.
- **Sign-in:** a sign-in cookie keeps you signed in.
- **Spending limits:** daily and monthly spending and search limits are counted per day, not per message content.
- **Logs:** technical logs record steps, outcomes and timings, not what you wrote.
- **Error references:** when something fails on our side, you may see a short reference. Our log for it holds that reference, the type of page or action (without your details) and the kind of error, never what you wrote.
- **No advertising or tracking cookies:** none, and no third-party analytics.
- **Owner analytics:** the owner sees counts taken from the live database. No separate analytics copy is kept.

## Where your information is kept

- **Hosting:** Orivia runs on Cloudflare.
- **Accounts database:** kept in the EU jurisdiction.
- **Uploaded files:** stored in Cloudflare R2. The bucket has a Western Europe location hint (`WEUR`), which Cloudflare describes as best effort, not a guarantee. A guaranteed storage location (an EU jurisdiction bucket) can only be set when a bucket is created **[FOUNDER DECISION: whether to create one before launch]**. Until then, don't state a guaranteed location.
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
| Recent database backups | Deleted records can still be restored from our hosting provider's database backups for a limited period **[TO CONFIRM before publishing: the period. Don't state a number until it's confirmed from the plan or billing; a past restore point isn't a guarantee]** |

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
