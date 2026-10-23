# Private pilot notifications

Account-only opt-in: calendar reminders, student membership approval, published university updates. Guests retain calendar exports; they are not silently registered for account push.

## Delivery

`orivia-notifications-private` runs `workers/accounts/notification-job.mjs` once a minute using the separate accounts D1. It has no public API and never calls an AI provider. Both Workers share a newly generated VAPID pair stored through secret bindings, never committed. Apply notifications.sql before enabling NOTIFICATIONS_ENABLED=1. The pilot main CSP permits same-origin workers. The service worker only displays generic encrypted push messages and opens Orivia; it does not cache or fetch personal account data.

Bounded: 100 users per sweep with cursor rotation, 20 attempts per tick, 100 reserved sends per UTC day, 3 subscriptions per account. A reservation/unique delivery claim prevents duplicate concurrent sends. Ambiguous failures are not retried automatically. A push service accepting a request is not proof of arrival on the device. Minute polling is not an exact alarm clock; provider, device and network delays remain possible.

Due reminders are derived from existing account-vault event times and alarm offsets. The scheduler rechecks edited/deleted reminders before push. One-hour catch-up avoids old-reminder floods. Membership and update categories start at opt-in, with published university updates limited to current active student memberships. Revoked membership is rechecked for display/delivery. No provider keys, endpoint tokens, reminder titles or message bodies are logged. Generic lock-screen text is English/French/Arabic. Notification inbox records expire after 30 days.

Subscriptions belong to a user AND real auth session, with FK cascade on session deletion/sign-out/revocation. Account deletion cascades notification records, preferences and subscriptions. Browser permissions and queued generic alerts may outlive logout; remote deletion cannot recall them. A current session can disconnect its device route. Test alerts require a connected session and are capped at three per hour. Server push endpoints are restricted to known browser push services and redirects are refused.

## UI and setup

After consent/setup, signed-in users get an optional invitation. Enable connects device push and opts into all three clearly named categories; Not now always continues. Browser permission is requested only on that explicit click. Settings → Notifications and alerts provides the inbox, separate category switches, device connect/disconnect and Send a test alert. A blocked or unsupported browser never prevents app use. Home-screen/physical-device behaviour still needs live testing; this first pilot does not establish support for every browser or embedded preview.

University welcome tab titles now use Organisation name · Orivia; personal pages use Orivia.

## Verification

Server tests use real SQLite and real Web Push encryption with scripted transport. They cover due-time gating, explicit opt-in, duplicates, cancellation, membership access, endpoint safety, concurrent delivery claiming, daily cap and session/account cleanup. Client tests simulate permission APIs, including denial and Not now. Real device delivery must be verified with Send a test alert; these automated tests do not prove that.
