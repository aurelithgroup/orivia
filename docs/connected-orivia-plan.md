# Connected Orivia: second integration pass (Cleo, 21 October)

Goal: one connected Orivia, where nobody types a URL to reach a space. This document records the inspection of what's live on myorivia.app (front door `ccb6d8e7`, production `fe28a2ae`), the proposed build and the decisions needed. Nothing here is built yet.

## What already works

- **One origin and one sign-in** across `/app`, `/platform`, `/manage` and `/join/<org>`. Server checks on every request: owner-only `/manage`, staff-only dashboards, members-only content, and no access across organisations (tested with real sessions).
- **"Your spaces" on Home** (app, signed in). It lists active student memberships (opening a read-only sheet of guides, contacts, dates and updates), "Waiting for approval", and links to the dashboard for staff and the owner.
- **The dashboard's own Space menu** (`/platform`), built from the server's memberships: My Orivia, Orivia management (owner) and each organisation.
- **University joining:** invitation, locked campus fields, consent, waiting screen, then approval.
- **Journeys guides** already offer "Ask Orivia about this step", and saved journey progress is sent with chats (`guidesForAI`). Journeys live in the account vault, so they're preserved.
- **Consent** is remembered per account or guest and per version. Language is chosen in the app.

## What needs changing

1. **No shared navigation.** The app and the dashboard are separate pages with different headers.
   - The app has no space switcher in its header; spaces are only on Home.
   - The dashboard has no language menu, no Settings and no sign-out.
   - The dashboard's "My Orivia" means its own home view, not personal Orivia.
2. **The university space is a read-only sheet.**
   - It has no Home destination of its own, and Back/Refresh lose it (it isn't in the address).
   - It says "Organisation dates are not automatically added to your personal calendar", and it has no actions.
3. **University content has no structure.** `organisation_content` is only `kind`, `title` and `body` (free text). So far there's:
   - no date for a deadline,
   - no phone, email or website for a contact,
   - no source link,
   - no "related guide" or "next action" for an update.

   "Add to my calendar", "Call / Email / Website" and "Update → guide" need new fields and staff inputs in the dashboard.
4. **Chat can't use university material.** By design, organisation content is never sent to the AI today (spaces.js: "never saved in the personal vault or sent to the AI"). "Ask Orivia about this" for a university guide changes that rule, so it needs a decision (below).
5. **Logout doesn't reach other tabs.** There's no cross-tab signal; other open tabs only notice at their next server call.
6. **Not installable.** The app has no web manifest or app icons. The only service worker is the notification one, scoped to `/app`, and push is off. The landing page retires the old website's worker.
7. **The Journeys tab** is a full tab today: Home · Chat · My Life · Journeys · Calendar.

## Proposed build (one deployment at a time; the pilot tests first)

**Stage 0 (prerequisite): separate the test accounts database.** The pilot still shares accounts with production, so testing these changes there would touch real accounts. This is already decided; it should happen first.

**Stage 1: one navigation system.**
- One shared header for `/app`, `/platform` and `/manage`, with the same code on every page.
- **Space switcher**, built only from `/api/me/memberships`:
  - My Orivia (every signed-in user);
  - each approved university;
  - "Manage [university]" for its staff;
  - Orivia management (owner);
  - each pending membership shown with "Waiting for approval".
- **Guests** see a visible "Sign in" button instead.
- **Account menu:** Settings, language and Sign out.
- Each space has its own address, so Refresh, Back and links work: `/app` (My Orivia), `/app/space/<org>` (university space), `/platform?org=<id>` (manage) and `/manage`. The server still decides access on every request; navigation only reflects it.
- **Logout and account changes** are signalled to every open tab (BroadcastChannel). Other tabs return to the sign-in screen and clear in-memory spaces.

**Stage 2: university space and connected actions.**
- **University space:** a full page with Home, Guides, Dates, Contacts and Updates. Every item is labelled "From [university]".
- The university appears automatically on personal Home once approved.
- **Additive, reversible database change:**
  - `organisation_content` gains optional `date_at` (dates);
  - `phone`, `email` and `url` (contacts);
  - `source_url` (guides);
  - `related_id` and `action_label`/`action_url` (updates).

  Existing rows keep working, and staff get those fields in the dashboard editor.
- **Actions:**
  - Guide → "Ask Orivia about this" (Stage 3).
  - Date → "Add to my calendar": it shows the event, the student confirms, and it's saved as a personal reminder tagged with the content ID and revision, so a second tap says "Already in your calendar".
  - Contact → call / email / website, from the supplied fields only.
  - Update → its related guide or action, when staff have provided one.
- Nothing personal (profile, calendar, chats) is sent to the university.

**Stage 3: Chat context.**
- "Ask Orivia about this" opens Chat with a removable label: "Using Northbay's arrival guide ✕".
- The request carries only an **organisation ID and content ID**. The server fetches the published item **after checking active membership**, so the client can't inject or swap material from another organisation.
- The assistant gets it as a separate, labelled source: "University instruction (Northbay, updated …)", distinct from official government sources, cited like any other source.
- The context stays for follow-ups in that chat until the student removes it. "Start a personal conversation" clears it.
- Switching spaces never carries one organisation's content into another space's chat.

**Stage 4: Journeys.**
- Journeys guides and saved progress move to **Home ("Your guides")**, **My Life** and **Chat suggestions**, each with a visible "Reopen".
- Only then is the tab removed: **Home · Chat · My Life · Calendar**.
- **Files is added only when it works** (see the Files plan below). There's no empty tab.

**Stage 5: installable web app.**
- `manifest.webmanifest`: name "Orivia", the real icons (192, 512, maskable, apple-touch), `start_url: /app`, `display: standalone`, theme colours, and scope `/`, so invitation links (`/join/…`) open in the installed app.
- A small app service worker caches only the app shell and fonts. When offline it shows "You're offline. Chat needs a connection; your saved plans are still here". It never claims Chat works offline, and it never caches API responses or personal data.
- Install guidance in Settings: Android/Chrome uses the install prompt; iPhone gets "Share → Add to Home Screen".
- Push stays off. App Store and Google Play are a separate project.

## Files and document camera (plan only, for approval before any build)

- **Storage:**
  - a private, per-account bucket (Cloudflare R2), with object keys under the account ID and access only through the Worker after a session check;
  - no public URLs and no sharing with organisations;
  - guests: files stay in this browser only (IndexedDB), with a clear note.
- **Formats and limits:**
  - PDF, JPEG, PNG and HEIC (converted to JPEG on the device), 10 MB per file;
  - an account allowance (proposed 100 MB) and a per-day upload cap.
- **Retention:** kept until the person deletes them. Account deletion removes them. No backups beyond Cloudflare's own durability. The written retention schedule goes in the Privacy information.
- **Controls:** list, preview (images and PDFs), download, rename and delete (with confirmation).
- **To AI:** only after an explicit "Use this in my chat" with that one file selected, shown as a removable context label like Stage 3. Never automatic.
- **Camera:** inside Files, and from Chat's attach button. Permission is asked only when the camera opens. Capture works on the device.
- **No analysis is implied:** nothing says Orivia reads or verifies documents until a reviewed analysis feature exists.

## Acceptance checks for this release

1. A student enters, finds their university in the switcher, opens a guide, asks about it, and saves a deadline, all without typing a URL.
2. Staff reach "Manage [university]", and the founder reaches Orivia management, from the same switcher.
3. Refresh, Back and direct links keep the session and the space.
4. Language and the account menu are the same in every space.
5. Saved journeys stay reachable.
6. Personal chats stay private. Server checks refuse cross-role and cross-organisation access (automated tests with real sessions, plus a live check).
7. Logout updates other open app and dashboard tabs.

## Progress (21 October, Cleo): on the pilot only

Founder decisions are recorded in the brief: guides in Chat after an explicit tap with a first-use notice; optional structured fields; four tabs once Journeys have homes; invitation links in the installed app; separate pilot database first.

- **Stage 0, done.**
  - The pilot has its own empty test database `orivia-accounts-pilot-test` (`8cd85061`, EU) with production's exact structure. Isolation was confirmed (pilot 0 users; production unchanged).
  - The founder's pilot account is the pilot owner. A demo Northbay University on the pilot has the founder as admin.
  - Pilot rollback before the swap: `1a4a3c88`. The pilot is now deployed from source with its live settings (`deploy-pilot-source`), refusing to deploy unless it's on the test database.
- **Stage 1, done** (`4552bf5`, `320fba4`): the shared header, space switcher and account menu.
  - University spaces have their own address, and the dashboard address follows the open space.
  - Sign-in and sign-out reach other tabs.
  - Checked live on the pilot: owner → management → back, and Manage Northbay from a direct link.
- **Stage 2, done** (`737cf90`): structured details, the dashboard editor fields, and the university space with labelled sections and Call/Email/Website, Source page, related guide and action buttons.
  - "Add to my calendar" asks for confirmation, prevents duplicates, refuses past dates and converts the time zone.
  - The pilot database has the `details` column. **Production needs `workers/accounts/content-details-migration.sql` applied before this code is released.**
- **Stage 3, done** (`d41c6f7`): "Ask Orivia about this" with the one-time notice, a removable label and "Start a personal conversation".
  - The server re-reads the item for active members on every message.
  - "University instruction" is a separate source kind that never supports an official rule, and it's never kept in memory.
  - The answer check now also verifies dates in sourced sentences.

**Not yet checked by a person:**
- the student side of Stages 1–3 (needs the founder's second account);
- a real chat about a published guide;
- logout across tabs;
- install.

**Next:** Stage 4 (Journeys into Home and My Life, then four tabs), then Stage 5 (installable app).

Production stays as released until the founder's acceptance checks pass on the pilot.
- **Stage 4, done** (`ccb1cee`, plus header fixes):
  - **Home → "Your guides":** guides in progress (up to three) with progress and Reopen, then "All your guides". An empty state offers "Browse guides".
  - **My Life → "Your guides":** shows saved and in-progress counts.
  - **Navigation:** the Journeys tab is gone: Home · Chat · My Life · Calendar. The guides page stays reachable from Home, My Life, Help and Chat suggestions, and Back returns to where the person came from. Saved journeys and progress are unchanged.
  - **Phone header:** it now fits 339 px. The trial badge hides and the separate settings gear hides when signed in, because Settings is in the account menu. Below 420 px the wordmark is visually hidden but still read aloud.
  - **To tidy:** memberships are fetched about five times on start-up. It's harmless, and a later clean-up.
- **Stage 5, done** (`63835ef` plus a registration fix): installable web app.
  - **Manifest:** Orivia's name and icons. It starts at the app (`/app` on myorivia.app, `/` on the pilot) with scope `/`, so `/join`, `/platform` and `/manage` open inside the installed app (`handle_links: preferred`). Where that isn't supported, the browser opens them normally and the invitation is kept through sign-in.
  - **One versioned app worker** (`/orivia-sw.js`): app pages and scripts open offline. API, Chat, research, sign-in and dashboard requests always go to the network and are never cached. The push handlers are inert because push is off. Checked live on the pilot: it registers itself and saves only the app's files.
  - **Offline:** a note says Chat and research need a connection, and a message sent while offline stays in the box.
  - **Settings → Install Orivia:** an install button where the browser offers one, Add to Home Screen steps on iPhone/iPad, and "installed" when running as the app.
  - App Store and Google Play remain a separate project.

**Before any of this goes to myorivia.app:**
1. The founder's acceptance checks on the pilot (student side, logout across tabs, a real guide chat, install on a phone).
2. Apply `content-details-migration.sql` to the production accounts database.
3. Deploy production from this branch and re-run the release checks.

## Release runbook: connected foundation to myorivia.app (prepared 22 Oct)

The founder's acceptance checks passed on the pilot (student flow, Refresh/Back, guide chat, calendar, cross-tab sign-out, phone install). The founder approved the letter-circle citations. Waiting for: Ina's "Source n" change (docs/ina-requests.md) and Ina's independent review of permissions, data preservation and the migration.

Order (Cleo, one step at a time):
1. Merge Ina's commit; full suite; pilot deploy and quick check.
2. **Rollback points:**
   - production `fe28a2ae`;
   - front door `0fe7fcb0`;
   - the production accounts database: back up with a D1 time-travel bookmark before step 3.
3. Production accounts DB: `ALTER TABLE organisation_content ADD COLUMN details TEXT` (additive; existing rows keep NULL). Checked today: the column isn't there yet.
4. Deploy `orivia-production` from the branch (dry run builds: 4.09 MB).
5. Deploy `orivia-front-door` (new app paths: `/app/space/*`, `/orivia-nav.js`, `/orivia-sw.js`, `/manifest.webmanifest`, `/app-icons/*`). The dry run builds.
6. **Checks on myorivia.app:**
   - automatic route, policy and refusal checks (as in the 21 Oct release);
   - the founder's account opens `/manage` from the switcher;
   - Northbay's staff and student spaces;
   - the manifest and app worker;
   - no secrets in `/v1/config`.
7. Ina rechecks the live version; the founder confirms it feels like one app.

## Released to myorivia.app (22 Oct, Cleo)

- Merged Ina's `f2a82d2` (numberless expanded sources). Her independent review: OK (docs/ina-connected-release-review-2026-10-22.md). Full combined suite passed; pilot `6b2d4127`.
- Production accounts DB: time-travel bookmark `00000021-00000000-0000510c-a316cb1ef7b8a629f3a8f5a84a77a443` recorded first. The column was absent; the migration was applied once; checked afterwards: column present, 1 content row and its revision unchanged, `details` NULL, users and organisations intact.
- `orivia-production` `569f1f5b` (rollback `fe28a2ae`); all five secrets present. `orivia-front-door` `48958a0e` (rollback `0fe7fcb0`). The first deploy attempt timed out at Cloudflare's API and changed nothing; the retry succeeded.
- **Live checks passed:** routes, space addresses, `/join` alias, `/manage` refusal when signed out, nav script, app worker, manifest, icons, consent v1, no secrets in `/v1/config`, frame and manifest policies, push refused, human check before any AI call (including guide context), new presentation code live. orivia-beta is unchanged.
- **Still to do:** the founder's signed-in look ("one connected app"); Ina's live recheck.
- **Done 22 Oct:** the founder confirmed it feels like one app, with the favicon showing; Ina's live recheck passed.

## Round 2 released to myorivia.app (22 Oct, Cleo)

- What it includes (all passed founder checks on the pilot first):
  - figures stay with what the source states them for (the nol Gold/Silver fix);
  - no welcome flash on load, and no "pilot" wording in the university welcome;
  - one shared memberships request and no second session request on load;
  - a Stop button that cancels a reply and puts the message back in the box;
  - letter-circle citations;
  - Ina's lossless Listen chunks and translated dictation text.
- Built from `5c7aa33`; full suite passed (76 checks). No database change.
- `orivia-production` `ae08f8b7` (rollback `569f1f5b`); all five secrets present. The front door was not redeployed, because its paths didn't change; it stays `48958a0e`.
- **Live checks passed:**
  - routes, `/manage` refusal when signed out, favicon, app worker and icons;
  - consent v1, and no secrets in `/v1/config`;
  - the new Stop, letter and Listen code is in `/chat.js`;
  - device push refused (503);
  - human check before any AI call.

## Step 5 and natural voice released to myorivia.app (22 Oct, Cleo)

- What it includes (founder checked each on the pilot first):
  - Orivia replies in the language the person writes (French typed in an English app gets French);
  - Listen uses the reply's language: the language the model states, or a word-based guess for French, Filipino and English;
  - French and Arabic for the rare replies the code writes itself (limit reached, couldn't check an answer) and for 16 app messages;
  - a clearer correction when a source isn't the organisation's own site, so fewer slow retries;
  - a reply cut off by the phone locking is sent again once, when the app is back in front.
- **Natural voice for Listen.**
  - Model: OpenAI `gpt-realtime-2.1-mini`.
  - Only the tapped reply's text is sent to OpenAI.
  - Spending: $1/day and $5/month on its own `voice` meter, shared by the pilot and production. Every cost also counts inside the $5/$20 OpenAI limits.
  - A word-for-word check runs on each reading, with the phone voice as the fallback.
  - Settings has an on/off switch that says the voice is AI-generated by OpenAI.
  - Measured on the pilot: about $0.015 for 35 seconds, so $1/day is roughly 40 minutes of listening.
- Built from `3c5005f` plus the production voice settings; full suite passed (78 checks). No database change; the `voice` meter row is created on first use.
- `orivia-production` `b83cbbdb` (rollback `ae08f8b7`). The front door was not redeployed.
- **Live checks passed:**
  - routes, the `/manage` refusal, favicon and app worker;
  - consent v1, and no secrets in `/v1/config` (`naturalVoice: true`);
  - `media-src blob: data:` on the app page;
  - the new Listen, language and resend code is in `/chat.js`;
  - voice refused from other sites (403) and before the human check;
  - chat still needs the human check;
  - device push still refused (503).
- Process note: the pilot deploy script used to copy settings only from the live pilot. It now also adds settings that are new in `workers/pilot/wrangler.jsonc`; it never changes existing ones.

## Notification scheduler moved off production (22 Oct, Cleo, founder-approved)

- Ina's live check (docs/ina-notification-isolation-handoff.md) found `orivia-notifications-private` running every minute against **production's** accounts database.
- **Done:**
  - its cron trigger was removed (rollback: `* * * * *`);
  - its code, settings and data are unchanged (4 old registrations, 12 deliveries all `uncertain`, none retried or deleted).
- The pilot now runs its own scheduler: an every-minute cron on `orivia-research-pilot`.
  - It runs only when `NOTIFICATION_SCHEDULER=pilot` and `ACCOUNTS_DB_EXPECTED` names the pilot test database.
  - The deploy script refuses if that setting doesn't match the real binding, and the database was checked before the cron was added.
- Production device push stays off. Next:
  - one synthetic test alert to the founder's phone from the pilot;
  - then a fresh production opt-in, after Privacy approval;
  - never reuse the old registrations.
- **Real-device alert passed on the pilot (22 Oct).**
  - Earlier attempts were all `uncertain` because the sender used fetch `redirect:'error'`, which Workers reject before sending anything; this also explains production's 12 old `uncertain` rows.
  - Fixed in `35ba639`.
  - After the fix: 7 attempted and 7 accepted. The founder's phone showed the test alert, and tapping it opened Orivia.
  - Production push stays off until Files and Privacy are approved; it will then use a fresh production opt-in.
