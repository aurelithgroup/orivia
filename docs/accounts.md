# Personal accounts: prepared, not activated

This adds the approved welcome/sign-in flow, personal account storage, optional guest import and logout. It does not implement organisation accounts or the document camera. The running pilot and public beta have not been changed by this work.

## Implementation and validation

Better Auth is pinned to 1.7.11 with a committed lockfile. Authentication uses Secure, HttpOnly, SameSite=Lax cookies. Password login and automatic provider linking are disabled. Email codes are six digits, hashed in storage, single-use, expire after five minutes and permit five attempts. Database-backed rate limits apply. Email deliveries reserve a shared daily/monthly allowance before sending, including uncertain outcomes.

`tests/accounts.test.mjs` runs the actual authentication library against real SQLite behind a D1-shaped adapter. Delivery is a captured test outbox: no real emails are sent. It exercises OTP sign-in, protected cookies, replay rejection, server logout, account deletion, owner isolation, stale revision rejection, cross-origin rejection and payload limits. `tests/account-client.test.mjs` uses scripted transport to check namespaces, explicit import and recovery of unsynced copies. The welcome and guest paths were also checked in a browser using a clearly labelled sample auth service. Real D1, email and OAuth callbacks have not been tested.

The preview screenshot is `docs/accounts/welcome-preview.jpg`; its sample-auth strip belongs only to the test preview.

## Data behaviour

Guest data stays under the existing device keys. Account data uses a separate per-user namespace and a server snapshot owned by the authenticated session. The client supplies its expected user identity so an old tab cannot upload one person's copy after another tab changes the session.

On first sign-in, Chats, Reminders, Journeys and About you are unchecked. Only selected categories are imported; the original guest copy remains. Returning account users load the saved account snapshot. An unsynced local copy is retained rather than overwritten. Conflicting revisions pause uploads and require review. Reviewing the remote copy creates a local backup before replacement.

Logout normally removes the account's active local cache. If changes are unsynced, a second explicit option logs out while retaining that account's recovery copy on this device. This is UI separation, not encryption against someone with access to browser storage. Backups and deliberately retained recovery copies remain on that device. There is no institutional access to personal account snapshots.

Snapshots currently have a 1 MiB request limit. Oversized saves fail intact, with a local-copy warning; nothing is shortened. This is a first version using whole snapshots, not a concurrent per-message merge. Automatic syncing runs after changes; offline editing and concurrent devices require conflict review.

## Required private-pilot setup

1. Create a **separate** D1 database and apply `workers/accounts/schema.sql`. Do not apply it to the budget database. Bind it as `ACCOUNTS_DB`.
2. Set a new random secret of at least 32 characters as `ACCOUNTS_SECRET` using Cloudflare secret storage. Never put it in chat, source or a configuration commit.
3. Set `ACCOUNTS_ORIGIN=https://orivia-research-pilot.habeebahsallah27.workers.dev`. Keep Cloudflare Access protecting this private trial.
4. Configure at least one real provider below. Unconfigured providers are hidden.
5. Run `npm ci --prefix workers/accounts --ignore-scripts` and `node workers/accounts/build.mjs`. The resulting `workers/accounts/dist/accounts.mjs` exports `handleAccountRequest`. Attach it as a module and import it from the pilot's entry, preserving its current backend and settings. The source entry already calls the handler after private Access validation; do not deploy an older source backend over newer live research/calendar fixes.
6. Keep `ACCOUNTS_ENABLED=0` and `ACCOUNTS_UI=0` until the bindings and provider are ready. Enable on the private pilot only, then test a real sign-in, reload, second user, explicit import, logout, second device conflict and deletion. Public beta remains unchanged.

### Email

Bind Cloudflare Email Sending as `ACCOUNTS_EMAIL`, configure a verified sender address as `ACCOUNTS_FROM`, set explicit positive `ACCOUNTS_EMAIL_DAY_CAP` / `ACCOUNTS_EMAIL_MONTH_CAP`, then set `ACCOUNTS_EMAIL_ENABLED=1`. No default spending allowance is assumed. Arbitrary recipients need the appropriate Cloudflare plan and verified sending domain; check current official Email Service pricing before enabling.

Current setup blocker: the connected Cloudflare API returned HTTP 401 / code 2036 for Email Sending subdomain access. No sender has been provisioned. The only zone visible to this connection was aurelithgroup.org. Confirm the desired sender/domain and authorise the necessary Email Sending access before setup. Existing Workers access alone did not grant it.

### Google

Configure a Google OAuth web client. Redirect URI:
`https://orivia-research-pilot.habeebahsallah27.workers.dev/api/auth/callback/google`

Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the deployment configuration/secret store. Configure the consent screen and authorised private testers in Google's console. No credentials have been created or saved by this change.

### Apple (optional, defer)

Configure an Apple Services ID and a generated Apple client-secret JWT as `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET`. Redirect URI ends `/api/auth/callback/apple`. The generated client secret needs rotation before expiry. Trusted Apple origins and database OAuth state are configured, but the external callback has not been exercised. Apple developer membership is a separate paid prerequisite; nothing has been purchased. Leave these settings absent to hide the option.

## Before broader release

Complete real provider tests and D1 deployment checks; review all account strings in every beta language (new translations currently cover French and Arabic with English fallback); publish the actual privacy/terms and retention policy; decide backup removal and export behaviour; add scalable record-level sync before heavy usage. Organisations need a separate permission model and consent before any institution integration.


## Private verified-email test — 20 October

Private pilot deployment `e66de51635a04898bbf1fd70d12336d1` adds the compiled account module to the existing live pilot. Its research, assistant, interface, limits and previous bindings were retained; before/after binding comparison found no changes to existing bindings. Public beta was not deployed.

Dedicated D1 `orivia-accounts-private` (`3ebd10d5-01e5-4a01-b846-977f1bb2d5b3`, EU jurisdiction) has both account and organisation schemas applied. No owner is seeded: first complete real Orivia email sign-in, then confirm the exact verified user ID before assigning the founder role.

Cloudflare Routing is ready for `auth.aurelithgroup.org`. Existing apex Zoho MX records and SES subdomain MX records were checked unchanged. This is the free verified-destination route, not arbitrary-recipient Email Sending. The founder's test destination is verified by Cloudflare; that alone does not create an Orivia account.

Private flags: accounts enabled, organisation API enabled, main-app account UI off, private `/account-test` on. `ACCOUNTS_EMAIL_MODE=verified_only` and `ACCOUNTS_TEST_EMAIL` restrict delivery to the configured verified address, additionally enforced by the email binding's destination restriction. Sender is `login@auth.aurelithgroup.org`. Test caps are 10/day and 100/month. A random account secret was generated directly in the deployment tool and stored as a secret; its value was not returned or committed.

`mail.mjs` uses the legacy `cloudflare:email` EmailMessage transport for this verified-recipient test. Other modes retain the structured sender. The test page does not store or log codes; session cookies remain managed by Better Auth. `/account-test` is behind the existing private Access check. Do not expose or promote this test page publicly.

Actual inbox delivery and live sign-in still need the founder to open `/account-test`, request a code and enter it there. Never paste codes into chat. Then verify reload, logout and the dashboard session before assigning owner access. Local tests use real Better Auth and SQLite, independently decoded QR codes, and scripted email delivery; the deployment was accepted by Cloudflare but that does not prove inbox delivery.
