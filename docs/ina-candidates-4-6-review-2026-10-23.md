# Ina independent review — candidates 4–6 — 23 October 2026

Candidate reviewed: 790dd578aa093b5bde79753290647903eaf5e956, including candidates 4/5. Cleo's recorded pilot version is 8bed9b56. Production remains outside this review; no deployment or configuration changes made.

## Independent checks completed
Ran tools/run-ci-local.mjs against a clean tracked source checkout with real installed account dependencies. All 100 CI commands passed. Evidence: docs/evidence/ina-candidate6-ci-2026-10-23.json. Independently examined account-switch routes, share selection/server/public pages, version integration, connector updates and backup documentation. Passing checks do not cover the failures reproduced below.

The raw multi-session endpoints remain blocked; the browser receives HMAC references, and server-side device session lookup resolves them. Real-session tests pass for forged/wrong-device/expired references, account headers, removal and switching. Edit/regenerate integration tests now pass for rollback after Stop/failure, enabling controls and separating the version notice from actual reply text. Source-level review is satisfactory for those tested paths, not signed-in deployed acceptance.

## Required before a public sharing release
### 1. Share protection is based on current chat context, not persistent reply provenance
share-select.js only detects docChat through current chat.documents or a user attachment marker; it does not inspect document-category sources or a persistent per-reply privacy marker. A legacy/document-sourced assistant reply with no current documents/attachment is returned with excluded:null. A university reply is excluded only while chat.orgContext exists; clearOrgContext deletes that field, so clearing context can unlock an earlier members-only answer.

Reproduction: call OriviaShare.candidates with an assistant turn containing a document-category source and no current attachment/documents; excluded is null. Also take an orgContext chat containing a members-only assistant reply, clear orgContext as the shipped UI does, and call candidates again: the university exclusion is lost.

Fix: durable per-message origin/sensitivity markers captured when the answer is produced, conservative handling/migration for older records, and exclusions that survive detachment, access removal, branch selection and reload. Documents themselves remaining excluded is insufficient if their derived text becomes shareable. Add those behavioural tests. The plain-text server sanitiser cannot itself prove user-selected prose was never derived from a document/university record; do not claim it does. Keep general explicit reviewed user sharing separate from an institutional confidentiality guarantee.

### 2. Production does not route /s/ paths
isAppPath('/s/'+'A'.repeat(43)) returns false in workers/orivia-production.mjs. The front door has its own matching list and currently forwards other paths to the previous website. This is a known release integration gap, confirmed independently.

Fix both lists consistently and test the full production/front-door path to the read-only share handler, including unavailable/expired/revoked and HEAD cases. Do not remove pilot Access to make the pilot test public. Explicit public routing and disclosure are part of the production release, not permission to expose account/private API routes.

### 3. Share/feedback policy and retention
The factual draft is supplied privately to the founder, outside the public repository. It covers account-linked feedback, team visibility, optional included text, capability-link audience, recipient copies, and withdrawal vs deletion. It is not a complete legal notice or an invented operator identity.

Current share expiry stops access but does not purge content; feedback also has no separate fixed expiry. Do not promise expiry deletes stored snapshots or that reports are anonymous. Review backup retention as well. Operator/contact details and founder approval remain unresolved; this review does not approve production.

## Connector contract failure — fix before connecting any live institution
receiveUpdate inserts the event ID, then separately writes connector_status. Injecting a failure on the second statement leaves the event recorded; a retry returns status:200,duplicate:true without ever creating the status. Reproduced using real SQLite and the shipped receiveUpdate:
- first delivery: simulated storage failure during connector_status insert;
- retry: {status:200,duplicate:true};
- currentStatus: null.

Use an atomic persistence strategy supported by the deployed database, or a durable pending/applied state with retryable application. Test failures between writes and after an applied update/lost response. No real university is currently connected, so this is a prototype readiness defect, not evidence of lost real student records.

## Backup/rollback documentation correction
docs/backups.md says older code keeps store.library and chat versions. That is not generally true: the previous production source a846926 normaliseChat/loadChats paths reconstruct records without those fields. A rollback to an older normaliser can discard newer client data on the next save. Specify compatible rollback versions and test version/library preservation end to end; otherwise use an additive hotfix or a read-only compatibility path. Database additive migrations alone do not prove client snapshot compatibility.

Files have no automatic backup. No new storage copies, retention changes or spending are authorised by this review.

## Remaining evidence gap
No authenticated deployed-pilot test or real-phone/provider latency measurement was performed by Ina. The browser encountered Cloudflare Access; source tests and simulated local-browser evidence must not be marked live acceptance. Keep production unchanged while Cleo addresses the release findings and issues the next exact SHA/version.
