# Organisation dashboards (connected): Cleo, 20 October

`workers/accounts/platform-ui.mjs` is now the designed interface for Ina's organisation API (`docs/organisation-backend.md`). It keeps the same exports and the same `/platform` route, so no backend file changed. Not deployed.

## What it does

- **Who you are:** comes only from `/api/account/session`. Every request sends `X-Orivia-Account` and same-origin credentials.
- **Space menu:** lists only what `/api/me/memberships` returns: My Orivia, Orivia management (only if the server reports the owner role), and each active membership. There is no role or persona switcher, and the server decides every permission.
- **Owner:** create a (demo-marked) organisation and invite its first admin. The invitation link and QR code are shown once, with a "save now" warning.
- **Staff:**
  - Overview counts.
  - Guides, key dates, contacts and updates: draft, plus publish/unpublish for admins with the revision check.
  - Members: admins only. Approve, decline and remove.
  - Invitations: admins make student cohort invitations (up to 7 days, 1–500 places) and editor invitations (named email), and can withdraw them. Anyone on staff can make public QR codes.
  - Counts: labelled not connected.
  - Application records: locked, showing the server's own refusal.
- **Join link (`/platform#join=…`):** the token is read from the fragment and sent only in request bodies.
  - The invitation screen says what they'll see and won't see.
  - Students get "Waiting for approval".
  - Staff invitations activate immediately for the named email.
  - Expired or withdrawn invitations get their own screen.
- **Student space:** the organisation's published updates, guides, key dates and contacts. Progress is labelled not connected. Leaving explains what goes, what stays, and that downloads go out of date.
- **Public code (`/platform?publicCode=…`):** public information only, saying it gives no membership.
- **Errors:** every API error code maps to a plain message. 401 shows a sign-in screen, 503 shows "not switched on here", and 403/404 show an access-denied screen. Content is always set as text, never HTML.

**Labelled as unfinished:** admin status on the owner list, sponsorships, costs, support, platform counts, counts, application records, progress, and paging beyond 200 members.

The demo prototype (`prototypes/northbay-demo.html`) is unchanged and still the only place with sample people and persona buttons.

## How it was checked

- **`tests/platform-ui.test.mjs` (CI)** is a static check. It confirms that:
  - the served script parses on its own;
  - there is no persona or role switching;
  - there are no HTML-injection APIs;
  - only contract endpoints are used, and tokens never go in URLs;
  - the space menu is built from the server's data;
  - unfinished features are labelled, and there are no demo figures or people;
  - pending and expired states are distinct;
  - there is a single same-origin script and no third-party resources.
- **Clicked through in Chromium** against the real `handleAccountRequest` and organisation handler, with SQLite through the same D1 adapter as Ina's tests, separate browser sessions per person, and the full first flow:
  1. Owner creates Northbay and invites its first admin.
  2. Mariam accepts.
  3. Mariam drafts and publishes a guide.
  4. Mariam creates a student invitation.
  5. Aisha asks to join and sees "Waiting for approval".
  6. Mariam approves.
  7. Northbay appears in Aisha's space menu and shows the guide.

  It also confirmed that a non-member (Omar) has only My Orivia, that an expired invitation shows the expired screen, that application records stay locked, and that the browser logged no errors.

  Sign-in and the QR library were stand-ins on this machine (npm wasn't reachable), so that run proves the screens, API calls and server permissions, not Better Auth or real QR images. Ina's `tests/organisations.test.mjs` covers those with the real libraries. It needs `npm ci --prefix workers/accounts` and couldn't run here.

## Before it goes live

Follow Ina's setup list in `docs/organisation-backend.md`: provider setup, applying `organisations.sql` to ACCOUNTS_DB, bootstrapping the owner out of band, and `ORGANISATIONS_ENABLED=1` only on the isolated account test deployment. Then run the real flow once with real accounts.


## QR sharing update — Ina, 20 October

Invitation results now offer Download QR image (SVG). Invitation links remain one-time display, with expiry/use limits unchanged. Public QR codes can be retrieved again by staff from View / download QR. Only organisation admins can withdraw a public code; the red button requires a second tap. Withdrawal is audited and immediately stops public resolution, with no change to memberships. Editors cannot withdraw by direct API calls either. Withdrawn public links show unavailable; a downloaded or printed image cannot itself be erased.

Both newly generated and retrieved SVGs are decoded independently in backend tests. Additional cases cover student/outsider/cross-organisation refusal, editor withdrawal refusal, repeated withdrawal, exactly one audit record and student membership staying active.

These controls remain on the private pilot: public information visibility does not bypass Cloudflare Access while the whole pilot is private. Do not distribute pilot QR codes as public production access. No phone scanning or visual browser check is claimed for this update.

Cloudflare accepted private deployment `7b0114f190094372b41452b18807742b`. Only `accounts.mjs` changed; the live main module was preserved and a before/after comparison found no binding changes. Public beta unchanged. Focused organisation/authentication/platform/Home checks and the standalone build passed before deployment.
