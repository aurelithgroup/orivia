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
