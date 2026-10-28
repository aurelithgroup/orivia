# Ina: Batch 1 — plans, Library and permissions

Parent patch: 87bfb3c; underlying release source 2545018. Separate branch only. No deployment, schema change, provider switch or spending change.

## Ten work items

1. **ORI-HOME-005 — Profile-sharing controls.** Settings lists the exact selected profile fields and explains the history/retry limits. A real assistant run with synthetic hidden name/city confirms they are absent when sharing is off. Broader cross-provider and all-language leakage review remains open.

2. **ORI-JOURNEY-005 — Preparation checklist.** Source-authored preparation items have separately saved ticks. An explicit Ask action prepares a situation-specific document-recognition question; no universal attestation rule is asserted. This is not a claim that every family scenario has been researched live.

3. **ORI-JOURNEY-006 — Plan ↔ Chat continuity.** Saved reference label, return-to-step action, URL history restoration and delayed account-response guard. VM integration tests exercise the actual openGuide flow; browser Back/refresh and signed-in pilot acceptance remain.

4. **ORI-JOURNEY-007 — Version and review governance.** Legacy templates disclose absent reviewer approval. Version-bound human records have jurisdiction, source dates, reviewer and next review. tools/review-guide.mjs prepares records for normal repository staff review/deploy; the model never approves. No legacy guide was newly approved and no new dashboard review workflow is claimed.

5. **ORI-JOURNEY-008 — Review guide changes.** New template is proposed as a diff before acceptance. Saved snapshot stays in use until accepted. Old/new version history and step states are kept. Removed completion does not count toward new steps; calendar records are never edited by acceptance.

6. **ORI-JOURNEY-009 — Separate family plans.** Optional short labels and separate progress/preparation records; no sensitive identifiers required. Duplicate plans do not inherit completion and are excluded from automatic shared guide progress. Labels appear in Home, My Life and Library; no guardian access is inferred.

7. **ORI-JOURNEY-010 — Coverage catalogue.** Ten families and 98 topic seeds are available for UAE/UK research questions; requests are queued privately as topic references. This is a starting-point catalogue, not verified instructions or an automatic all-topic planner. Whole research happy/failure scenarios for every family remain open.

8. **ORI-LIB-007 — Library views.** Metadata-only title search, recent/alphabetical/pinned ordering and country/space filters. Unknown country is explicit; files are not attributed to the saved profile city. Empty recovery keeps existing records.

9. **ORI-LIB-009 — Selected export.** Explicit selection → JSON preview → identical download. Only personal Library metadata and selected plan progress; files and university bookmarks are disabled, not silently exported. Account change closes/refuses stale export.

10. **ORI-CAL-009 — Permission centre.** Read-only status inspection for microphone, camera, location and notifications, including Unknown on unsupported APIs. It never requests permission; browser and subscription status are explained separately.

## Verification and release boundary

Tests: tests/batch-one.test.mjs and tests/batch-one-integration.test.mjs run pure functions, the real assistant with scripted provider, and the shipped plan UI against a DOM stand-in. All 125 CI commands passed on the final embedded source. Full-device storage also refuses a false plan save and shows a lasting warning. The complete CI receipt is docs/evidence/ina-batch-one-ci-2026-10-23.json; it honestly identifies the underlying local base and uncommitted patch. No physical device, real-service research, visual browser or authenticated live-pilot verification is claimed. French and Arabic primary controls and notices are included; catalogue topic labels still fall back to English.

The ten requirements remain **in progress** in the master ledger until their full acceptance gates are met. In particular, full provider/privacy auditing and automated research coverage are not finished by a Settings panel or catalogue. Do not subtract ten from the fully accepted backlog or call this production-ready.

No founder test interruption is requested. The designated deployer can integrate this branch and run the isolated pilot checks before founder acceptance.
