# Task 3 — Founder AI and sponsorship workflows (pilot branch, 25 October 2026)

Branch: `ina/founder-ai-sponsorship-block-3-2026-10-25`
Parent: `ina/restore-block-1-2026-10-25`. Production/main unchanged.

## Built
- Founder workbench on the authenticated management page: owner-only founder draft briefs (guide briefs, partner outreach, sponsorship copy and launch checklists). A saved/reviewed brief **is not** an AI request, deployment action, campaign publication or outbound message.
- `/api/admin/founder-workflows` and `/:id`: revision-checked draft/review/archive lifecycle; archived drafts cannot be edited. This cannot change runtime secrets, provider limits, model spending, or production switches.
- Owner-only `/api/admin/sponsorships` and `/:id`: campaign draft, submit for review, explicit owner approval, withdrawal, expiry, revision checks and audit. Approving requires an unchanged in-review candidate and written review note. Editing an approved campaign requires renewed review before approval.
- `/api/me/orgs/:orgId/sponsorships`: only active members of active organisations see approved, currently scheduled sponsored placements. No member identities returned to sponsors. Withdrawal removes exposure immediately on subsequent reads.
- Campaigns require HTTPS links, paid/sponsor disclosure, and are returned as `sponsored_placement`, not evidence, official sources, or answer ranking inputs. No ad delivery, billing, boosted factual answer, automatic outbound messages or provider model calls.
- Added `tests/founder-commercial.test.mjs` for owner boundary, draft semantics, optimistic concurrency, URL validation, campaign review, membership gate and withdrawal.

## Intentionally not enabled
- No live deployment, remote database migration, payment collection, external sponsorship delivery, or AI model execution.
- Existing partner application/onboarding systems continue unchanged, including their private invitation and owner-review flow.
- Actual provider caps are still managed in reviewed deployment configuration, not adjustable in the browser.
- The membership endpoint is available for a future dedicated labelled-placement renderer; it is **not** mixed into the factual research/chat channel.

## Verification state
JavaScript syntax checks for the new module, the wired operations module and the updated platform UI passed in this session. The new regression test was authored but not executed on the full repository; actual local SQLite/Better Auth, browser interaction, Worker dry-run build and integration tests are still required. Do not report Task 3 as fully accepted before these pass.

## Acceptance still open
1. Execute `node --test tests/founder-commercial.test.mjs` and the complete affected test suite in the repository's configured Node runtime (including `node:sqlite` support).
2. Browser-check the owner workbench: draft, submit, approve, withdraw, and denial for ordinary accounts; verify dates and disclosures render correctly.
3. Run pilot Worker dry-run build and inspect migration/runtime. Confirm no paid placement enters chat evidence or search ranking.
4. Integrate the dedicated sponsor placement renderer only after design and consent review. Decide whether/where a model-backed founder AI service is permitted, subject to separate preview, consent and hard deployment caps.
