# Independent connected-release review — Ina, 22 October

**Review OK for the scoped connected-foundation release**, subject to Cleo's documented backup, single migration, merged-build checks and post-deployment checks. No blocker found in the reviewed code. This is not a blanket audit of every Orivia feature.

Reviewed release snapshot: `19fda82546c1f908165150dbce59b76c013e5d18`.
Read the release runbook and requests file, permission handlers, guide-context reader, structured-detail validation, navigation, organisation UI, app-worker and production/front-door routing. No live data or deployment was changed by Ina.

## Permissions

- Sessions and verified identities come from Better Auth. Roles and active memberships come from database records; the client cannot supply its authority.
- Owner management is checked on the server. Owner status alone does not grant student identities or university member access.
- Student, editor and admin APIs enforce separate permissions; public codes only return published public content and do not grant membership.
- Guide Chat rechecks active membership, organisation identity and published content for every message; removed memberships and cross-organisation requests are refused. University evidence cannot support a government-rule claim.
- Mutation requests retain origin/account checks. Organisation endpoints do not query personal vaults.

## Data and migration

- Independently exercised the exact migration against the old schema, populated with existing draft and published content. All original values and revisions survived unchanged; new `details` values were NULL. SQLite integrity and foreign-key checks passed.
- This migration is **one-time, not idempotent**: confirm the production column is absent, obtain and record the D1 time-travel bookmark, apply once, then verify the column and existing rows before deploying.
- A code rollback can leave the additive column in place. Do not drop it or restore a database casually: database restoration after new writes could lose those writes.
- Existing chat failure-path tests passed, including full storage, failed/silent migration, unreadable data and long conversations. Guide relocation changes navigation, not stored progress.
- App-worker inspection found network-only handling for API, research, sign-in and dashboards. Cache stores shell assets, not account API responses. Production push remains explicitly disabled.

## Checks actually run

All 12 targeted suites passed locally against the release snapshot: organisations, accounts, university-chat, university-actions, content-details, navigation, organisation-home, organisation-arrival, chat-history, installable, research-display, chat-presentation.

Accounts/organisations/guide-access suites used real Better Auth sessions with SQLite behind a D1-shaped interface; email delivery was scripted. Client/navigation/offline suites use scripted DOM/transport/browser parts. This does not replace physical-phone or live-browser testing. The founder's acceptance checks are recorded as passed by Cleo in the runbook, not independently repeated by Ina.

## Citation change

The standalone presentation hook's expanded source link now reads only `domain ↗`, with no visible source number. Internal source ids and accessible descriptions remain intact. Added a regression assertion. No shared app files changed.

## Release conditions retained

1. Cleo merges this small change, rebuilds embedded UI and runs the full combined suite before the pilot smoke check.
2. Backup/bookmark, inspect migration state, apply once, verify data; then production and front-door deploys in the runbook order.
3. Preserve existing secrets, budgets, database bindings and production push-off settings.
4. Run live routes, permission refusals, account/space navigation, manifest, app-worker and config-disclosure checks. Ina's live recheck follows the actual release; it has not happened yet.
