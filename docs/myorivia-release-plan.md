# myorivia.app: one-domain release plan (Cleo, 21 October)

The founder wants the newest Orivia on myorivia.app, with one sign-in across the app and dashboards. This plan replaces the temporary front door only after every check below passes. Nothing in this document has been deployed yet.

## What is live today

| Piece | Where | Notes |
|---|---|---|
| Front door | `orivia-front-door` on myorivia.app and www (version `bc35b622`) | Website served from GitHub Pages at `/`. `/app`, `/join/<org>`, `/platform` and `/manage` are **redirects**, not the real thing. Undo: delete the Worker. Source: `workers/front-door/`. |
| Public app | `orivia-beta` (`3e927ff6`, rollback `1f1321a2`) | Older bundle: no accounts, organisations or notifications. Preview may be framed by GitHub Pages and myorivia.app. |
| Newest Orivia | `orivia-research-pilot` (`1a4a3c88`, deployed by Ina 12:07 today) | Accounts, onboarding, organisations, notifications. Behind Cloudflare Access for one email. |

The pilot's live bundle (`index.js` + `accounts.mjs`) is the only complete copy of the newest release. The repository's main Worker source does not represent it (see `docs/release-2026-10-21-demo.md`), so production must be built from that bundle with reviewed patches, not rebuilt from source.

The public-release patch (`tools/prepare-public-promotion.mjs`) still matches the newest pilot bundle: all 13 anchors were found exactly once (checked today, nothing deployed).

## Target

| Address | Served by | Who can use it |
|---|---|---|
| myorivia.app | Website + phone preview of the new app | Everyone |
| myorivia.app/app | Personal Orivia: guest or account | Everyone; accounts by email code |
| myorivia.app/join/northbay | University welcome, then join request | Anyone with an invitation; staff approval required |
| myorivia.app/platform | Organisation dashboard | Staff of that organisation only (server-checked) |
| myorivia.app/manage | Founder management | The owner account only (server-checked) |

One production Worker on myorivia.app serves all of these, so the Better Auth session cookie is shared and the server checks permissions on every request. The pilot stays behind Cloudflare Access as the protected testing environment.

## Blockers (each must be fixed or decided before switching)

1. **The app assumes one host.** `hostFor(env)` returns 404 for any other hostname. Production sets `PUBLIC_HOST=myorivia.app`; the old workers.dev address then needs its own handling (see 6).
2. **Accounts are wired behind private Access.** In the pilot, account and organisation routes run after the Access check, which only admits `ACCESS_TEST_EMAIL`. Public mode needs a reviewed path: account routes reachable without Access, with Better Auth rate limits, exact-origin checks and the email caps. This is a code change, with tests, not a setting.
3. **The app lives at `/`, not `/app`.** Its page, scripts and APIs use root paths (`/chat.js`, `/v1/*`, `/api/*`, `/platform`, `/orivia-notifications-sw.js`). Plan: serve the app page at `/app` (and `/` inside the preview frame) while keeping its root API paths; website files are relative (`css/`, `icons/`, `sw.js`, `legacy.html`), so there's no name clash, but every link to `/` inside the app must be checked.
4. **Two service workers would fight over scope `/`.** The website registers `sw.js` (scope `/`) and the app registers `/orivia-notifications-sw.js` with `{scope:'/'}`. Only one can control `/`. Fix before release: one combined worker, or the app's push worker scoped to `/app`.
5. **`/join/<org>` and `/manage` are not routes in the app yet.** Today joining uses `/?organisation=<slug>#join=<token>` and owner tools live inside `/platform`. Add both routes server-side. `/manage` must check the owner role on the server, not just hide links.
6. **Saved guest data can't follow automatically.** Browser storage belongs to an address. Guests on `orivia-beta…workers.dev` (and anyone in the preview) won't see their chats on myorivia.app. Options: keep the old address running with a clear "Move to myorivia.app" export/import, or accept a fresh start for guests. Account data is server-side and does follow.
7. **Preview vs full screen.** The preview is an embedded frame, so browsers keep its storage separate. On one domain the website can frame `/app` from the same site, which removes this split for new users. Must be tested on iPhone Safari.
8. **Accounts database choice.** The founder's owner account and Northbay live in `orivia-accounts-private` (EU D1). To preserve them, production should take over that database and the pilot should get a new, empty test accounts database. Needs founder approval.
9. **Production settings to create.** These are new values, not changes to existing ones:
   - `ACCOUNTS_ORIGIN=https://myorivia.app`, `PUBLIC_HOST=myorivia.app`;
   - Turnstile widget domains add `myorivia.app` (the API access works);
   - email sender stays `login@auth.aurelithgroup.org` unless the founder wants `@myorivia.app` (that needs Email Sending set up on the new zone);
   - push keys: reuse the pilot's pair only if production takes over its subscriptions; otherwise generate new ones;
   - `ACCOUNTS_SECRET`, `SESSION_SECRET`, `TURNSTILE_SECRET`, `OPENAI_API_KEY`, `BRAVE_SEARCH_API_KEY`, `PUSH_PRIVATE_KEY` carried over with "keep existing" uploads or set by the founder in the terminal. Never read or printed.
   - Money limits stay shared ($5/day, $20/month in BUDGET_DB). Public search limits stay 10/day and 100/month.
10. **Consent and notifications (Ina).** Production needs one consent version covering OpenAI (with Workers AI backup), Brave Search, accounts and optional notifications. Agree wording and version name with Ina before the build. Pilot testers' consent is not reused.
11. **One deployer.** Ina deployed the pilot today. During the release, only one person deploys any Orivia Worker. The other reviews.

## Founder decisions (21 October)

- **Deployer:** Cleo deploys every Orivia Worker during the release. Ina pauses pilot deployments and reviews consent and notifications.
- **Accounts:** production takes over `orivia-accounts-private`, so the owner account, Northbay and test students carry over. The pilot gets a new, empty test accounts database.
- **Email caps:** keep 10/day and 100/month for the demo.
- **Privacy information and Terms:** Ina prepares drafts. They're linked from the consent before release.
- **Landing page:** Ina's approved landing concept is the myorivia.app homepage in the final release. It keeps the new routes, and its phone preview shows `/app`.
- **Guests:** fresh start on myorivia.app. Once production passes, the old public address points to myorivia.app. Old guest chats stay in the old browser storage and aren't imported.

## Ina's requirements (21 October)

- Consent version `orivia-ai-consent-v1-2026-10-21` with her wording, an initially unticked box, and **Privacy information** and **Terms** linked separately. This is product copy, not a legal review.
- Notifications are a separate, optional offer. "Not now" continues normally, and permission alone enables nothing.
  - Events: only calendar reminders, approval of the user's own membership, and updates from organisations the user belongs to.
  - Lock-screen text is generic.
- **Device push stays off in production** until delivery passes a real-device test (12 deliveries were recorded as `uncertain`).
- Consent is remembered per account or guest on that browser and asked again only when its version changes.
- Ina won't deploy until Cleo says the release is done.

## Progress (21 October, branch `myorivia-release-plan`)

Done and tested (full CI suite passes locally):

- `2b56ba4`: the accommodation-test assistant fixes that were live on the pilot but never on GitHub are now in source. GitHub's source is now at least as new as the live pilot everywhere, so production is **built from source**, not patched from a live bundle.
- `0538b5c`: production entry `workers/orivia-production.mjs`.
  - Blockers 1–5: one host; accounts outside Access only with `PUBLIC_ACCOUNTS=1`; app at `/app` through `APP_HOME`; notification worker scoped to `/app`; `/join/<org>` and an owner-only `/manage` checked on the server.
  - Consent v1 and push off.
  - **Repeated consent screen fixed.** Agreement was stored per tab (`sessionStorage`). It's now remembered per account or guest and version, decided only after `/v1/config`, and an expired human check no longer wipes it.
- `tools/embed-trial-ui.mjs` always embeds LF line endings. Windows checkouts had made two tests fail locally only.

Still open before switching:

- **Privacy information and Terms pages don't exist** (404 on the website, none in the repo). Ina's consent requires them. They need the founder's or Ina's text.
- **Sign-in email allowance:** the account email caps are 10/day and 100/month. On a public site that allows at most 10 sign-in codes a day for everyone. The founder decides whether to raise them (it costs money) before launch.
- Deployment and live checks (below).

## Order of work

1. ~~Founder decides 6, 8 and the deployer (11).~~ Done, see above.
2. Code changes 2–5 on the branch, with tests: public account routes, `/app` page, `/join/<org>`, `/manage` owner check, service-worker scope.
3. Build the production bundle from the live pilot bundle, apply the public-release patch, then the changes from step 2. Record every replaced string.
4. Deploy it as a **new** Worker `orivia-production` with no custom domain yet (workers.dev on, or a hidden test host such as `next.myorivia.app` behind Access).
5. Run the checks below there.
6. Switch myorivia.app from the front door to `orivia-production`. Keep `orivia-front-door` and `orivia-beta` deployed for instant rollback.
7. Old addresses: decide per point 6, then redirect or keep.

## Checks before switching

Each must pass on the production Worker, on a phone and a computer:

- Guest entry: consent, human check, a chat and a research answer.
- Account sign-in by email code; refresh keeps you signed in; a second tab follows.
- University joining from a fresh QR: locked campus fields, consent, waiting screen, staff approval, then university space plus My Orivia.
- Role restrictions:
  - a student can't open `/platform` or `/manage`;
  - Northbay staff can't see another organisation;
  - only the owner opens `/manage`;
  - direct API calls are refused the same way.
- Personal chats: never visible to staff or in any dashboard.
- Preview to full screen: start in the preview on myorivia.app, open full screen, check what carries over.
- Logout: from the app and from the dashboard; the other page is signed out too; unsynced-copy prompt works.
- Notifications: opt-in only; a test alert arrives; lock-screen text is generic.
- Money and search limits unchanged; `/v1/config` shows no secrets.
- Rollback rehearsed: front door back on myorivia.app in under a minute.

## Released (21 October, Cleo)

myorivia.app now serves the newest Orivia for everyone. The founder ran the live checks in her own browser and phone before the switch.

| Piece | Version | Rollback |
|---|---|---|
| `orivia-front-door` (myorivia.app, www) | `ccb6d8e7`, `RELEASE_LIVE=1` | Set `RELEASE_LIVE=0` and redeploy, or roll back to `05c45196` (gated) or `bc35b622` (redirect-only front door) |
| `orivia-production` (no route; reached through the front door) | `fe28a2ae` | Previous versions in Cloudflare; it has no route of its own |
| `orivia-beta` | `3e927ff6`, unchanged today apart from allowing the myorivia.app preview | `1f1321a2` |
| `orivia-research-pilot` | unchanged | — |

**Checks passed:**

- **Guest entry, from a real browser:** consent v1 with Ina's exact wording and unticked box, then the human check, then a researched answer with an opened, quoted source.
- **Account sign-in by email code:** refresh keeps the session, and `/manage` opens for the owner.
- **University joining:** the invitation link is `myorivia.app/join/northbay-university#join=…`. It leads to the locked campus fields and the waiting screen; after approval the student sees the university space alongside My Orivia.
- **Roles:** a student gets the refusal page on `/manage`. Signed-out visitors get 401.
- **Preview to full screen:** a chat started in the landing page's phone preview is there in full screen.
- **Logout:** after logging out, the dashboard asks the person to sign in.
- **Automatic checks:**
  - device push refused;
  - no AI call before the human check;
  - other origins refused;
  - only myorivia.app may frame the app;
  - no secrets in `/v1/config`;
  - the landing page makes no third-party font requests.

**Found and fixed during the live checks:**

- the old intro flashed on start-up;
- the tick-box wording and an unenforced ID-number promise;
- the human check stalled after onboarding moved it;
- the dashboard script failed under Wrangler's function-name helper.

**Still open:**

1. Privacy and Terms links. Ina's drafts stay unpublished until operator details are settled, and the links go into the consent and footer once approved.
2. The pilot still shares the accounts database with production. The founder's decision was a new, empty test database for the pilot, which isn't done yet. Until then, testing on the pilot touches real accounts.
3. The old public address (`orivia-beta…workers.dev`) still runs the previous app for the GitHub Pages website. Pointing it to myorivia.app is the founder's decision and is not done.
4. Device push stays off until delivery passes a real-device test.
5. Answer accuracy: a Gold-card price was carried over from the Silver-card quote (nol test). It needs a fix to how claims are matched to their own quote.
