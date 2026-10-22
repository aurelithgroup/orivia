# Ina: notification isolation handoff — 22 October

Read-only live checks. No settings, schedules, subscriptions or deployments changed by Ina. Cleo remains sole deployer.

## Confirmed live

- `orivia-notifications-private`: ACCOUNTS_DB is production `3ebd10d5-01e5-4a01-b846-977f1bb2d5b3`, NOTIFICATIONS_ENABLED=1, private push key binding present, cron every minute.
- Pilot app: ACCOUNTS_DB `8cd85061-ce42-4fa7-8dd7-a4b01f36800a`, notifications enabled, its private push key binding present.
- Production app: production DB; no private push key binding. Its production entry also explicitly withholds push keys. The separate scheduler does not inherit that withholding.
- Production totals: 4 subscriptions; 12 delivery rows, all `uncertain`; 3 notifications, all `test`.
- Pilot totals: 1 subscription; zero notifications and delivery rows.

No account ids, names, endpoints, subscription credentials or message bodies were retrieved. **Twelve uncertain attempts are not twelve delivered notifications.** Current source excludes any existing delivery row from retry, so do not replay uncertain attempts automatically.

## Cleo's next coordinated changes

1. Stop the old scheduler's production sending first (disable its delivery gate or cron), preserving a rollback record and existing data. Do not assume disabling production's subscription route stops a different scheduled Worker.
2. Use a dedicated pilot scheduler with the pilot accounts DB, matching pilot push keys and app destination. Add an explicit expected-database/environment check in deployment tooling so a pilot job cannot be aimed at production accidentally. Preserve the production job disabled until pilot acceptance.
3. Do not copy subscriptions between the two account databases. Do not delete the four old registrations or retry the twelve uncertain deliveries without a separate, explicit decision. A fresh production opt-in/re-registration flow is preferable to silently reusing old registrations when production eventually enables push.
4. Check active session, category, current reminder/organisation access immediately before delivery. Generic lock-screen content only; clicking must use the correct app URL and recheck access.
5. Run one deliberately requested synthetic test alert to the pilot's registered device, then verify browser receipt and tap destination on that actual device. A push-provider `accepted` status still does not prove device display.
6. Only after that and disclosure approval, enable production device push through the agreed release process. Keep email/search/AI caps unchanged.

## Source observations to include in tests

- `runNotificationTick` currently increments `sent` after nonthrowing HTTP results, including failures/expired endpoints. Rename/separate attempted/accepted/expired/failed/uncertain counters; do not present `sent` as displayed.
- Source app-worker push handler displays `d.body` rather than hardcoding a generic string. Current sender produces generic text, but confirm every sender is restricted to that policy before enabling production.
- One service worker per **scope**, not one per origin. The app worker already handles push for its scope, so use that registration rather than introducing another competing registration.
- The local notification-job source is a thin scheduler. A temporary encryption diagnostic was added to the live private job during the earlier investigation; rebuild from reviewed source when retiring/replacing that job rather than retaining a patched runtime accidentally. No diagnostic code or secrets should be exposed publicly.

## Files/Privacy status

Ina completed an internal Files/document-reading privacy addendum, kept outside this public repo. It covers saved files, selected-file sending, transcript storage and follow-ups, removal versus deletion, provider retention and optional notifications. It is not a complete approved Privacy Policy and contains no founder contact details.

Step 7 code is still `d28962a` at latest fetched handoff `b6c7e75`; the issues in `docs/ina-step7-review-2026-10-22.md` have not been fixed in that snapshot. Passing founder UI checks and adding wording do not close those engineering blockers. Keep Files and Files to Chat on the pilot until corrected and re-reviewed.
