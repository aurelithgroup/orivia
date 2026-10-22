# Ina: Step 9 independent review

22 October 2026. Reviewed release snapshot 6e4420e (Step 9 changes dffc2ea). No live data queried, deployments, DB writes or production setting changes.

## Result
Core organisation permissions and tenant separation pass targeted tests. Progress analytics is NOT privacy review OK yet. This finding is separate from Files and the two pending visual branches.

Passed: organisations.test.mjs (real Better Auth/SQLite/QR), platform-ui.test.mjs and organisation-home.test.mjs. A synthetic extension of the organisation suite reproduced the issue below against real sessions and SQL. No real emails or student records were used.

## Reproduced: exact totals reveal a removed member's mark
GET /api/orgs/:org/progress uses org.view and publishes exact per-item done counts whenever at least five current students share. Admins also legitimately manage named membership records. Compare totals around a single removal:

- Before: 6 sharing students; 3 marked the guide Done.
- Admin removes one known student using the normal membership API.
- After: 5 sharing students; 2 marked Done.
- Both responses pass the five-person guard. The difference identifies the removed student's mark.

This isn't a cross-tenant bypass. It is an inference possible through authorised endpoints. Minimum cohort size alone cannot justify an anonymity promise. A five-of-five count can reveal the whole cohort's marks as well.

Reproduction in tests/ina-step9-repro.mjs: synthetic normal organisation suite plus the six-to-five scenario, restoring fixture membership afterwards. It intentionally asserts the present leak to document reproduction; do NOT add this to passing regression CI as the desired behaviour. A fix test must instead assert that no exact comparable count is released.

## Sharing defaults and disclosures
organisation_progress_private is an opt-out table: missing row means sharing=true. This is different from the earlier product intention of personal-step sharing off by default. Cleo's later notes label Step 9 approved, so do not silently change the founder's decision; explicitly distinguish university-item completion from personal chats/calendar/Journeys. Recommend affirmative opt-in before including marks in staff analytics. Mark as done must still work privately.

Student wording says the organisation never sees the student's name in progress totals. While the endpoint omits identifiers, staff already have membership identities and can infer marks as above. Wording must explain aggregate reporting without guaranteeing anonymity. API personalDataShared:false is too broad alongside progress.sharing:true; clarify that private chats/files/profile are not shared, while the selected university progress marks may count.

## Recommended action for Cleo
Keep private Done marks working. Hold or temporarily disable staff exact progress totals until the reporting design is agreed. Consider stable reporting periods/cohorts, range reporting and suppression around membership/consent changes; do not assume simply raising five to ten prevents inference. Re-test queries before/after removal, leaving, opt-out and single completion changes. Make opt-in/disclosure policy explicit before release approval.

No UI should claim this is a live visa/student-system integration. Current applicationProgress.available=false is correct. Staff interfaces must never retrieve private account_vault, messages, files, profile or personal calendar. Existing isolation checks pass.

## Retention
Leaving/removal stops rows counting; rows are retained rather than immediately erased, and account deletion cascades the user's progress rows. Reflect that accurately in the final retention text. No full Privacy/Terms policy is approved by this engineering review.
