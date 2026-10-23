# Ina candidate 7 review and parallel audit — 23 October 2026

Base: 8ea990b, candidate source e89f864, recorded pilot 4c2e86db. No deployments made.

Only candidate 7 was available from GitHub. Cleo's reported later commit 7c1396c and settings/deletion changes are not in the fetched release branch and were not available locally. They are not reviewed, merged or overwritten here.

## Fixes independently checked
Candidate-7 share-provenance, full-path share-routing, connector transaction and rollback-compatibility tests pass. Routing now matches /s/ in front door and production and keeps shared pages unframeable. Direct protected replies and unknown old replies are blocked. Connector batch failures roll back, and documentation no longer treats old production as a safe version/library rollback target.

## Remaining share issue: transitive private conversation context
sendChat stamps only current chatDocuments/currentOrgContext. After clearOrgContext, the request still sends up to twelve earlier messages, including members-only material, through chatMessages. A follow-up can summarise that material but receives origin.university:false. The same issue applies to document details carried by history after detachment/legacy migration. Direct origin stamping does not address this information path.

New workers/trial-ui/reply-origin.js is a tested proposal, NOT yet connected:
- OriviaReplyOrigin.forRequest(sentTurns,{documents,university}) uses the same latest-12 boundary as chatMessages.
- It propagates document/university origin and document sources from sent history.
- Unknown/old v1 provenance remains unknown, rather than silently becoming clean.
- v2 clean stamps may be shared; v2 unknown/protected stamps may not.
- It sends no data, creates no network calls and does not read other chats/accounts.

Cleo integration steps:
1. Load reply-origin.js before chat.js/share-select use and include it in the embed/service-worker version inputs.
2. Compute the stamp from sentTurns plus the actual document and university context attached to that request. Keep it frozen while awaiting the response.
3. Assign the full v2 stamp to answer.meta.origin.
4. Call sharingReason for each message before any chat-level fallback; older v1-clean answers remain unverified. Do not rewrite stored origins to clean.
5. Replace source-string assertions with actual send-path tests for detached-guide/document follow-ups, branches and reload; re-run share UI preview.
The new helper test covers historical propagation, unknown legacy stamps, exact request-window boundary and fresh clean requests. It does NOT prove the app uses the helper until those integration steps are completed.

## Connector patch implemented here
Reproduction against candidate 7: send same event ID first with university_submitted/version1 then with withdrawn/version2. Handler returns duplicate:true but changes connector_status to withdrawn while connector_events remains university_submitted. A changed subject can similarly create a second person's status under one event ID.

Patch: the second statement in the atomic batch SELECTs values from the stored connector_events row, never from the duplicate's new body. Original event meaning/subject/version stays authoritative. Existing rollback/retry tests still pass.
tests/ina-connector-duplicate.test.mjs fails on candidate 7 and passes on this patch; it checks unchanged original status and no second-person status for reused IDs. No live university is connected.

## Parallel audit verdicts (not an all-83 completion claim)
- LIB-002/003/004/006: collector/paging/removal tests pass. A saved discovery remains derived from its chat. Revoked university access is not assessed by this collector.
- LIB-005: remains a gap for protected saved bodies. Public static journey bookmarks are not an institutional permission test. The current discovery collector has no membership dependency or protected bookmark reference; do not mark this requirement complete based on safeSources alone.
- Server university Chat context: university-chat test confirms verified active membership/published content/same organisation checked per message. This is a useful existing safeguard, not a complete saved-bookmark UI review.
- AUTH-002/003/006: real-session device-account tests pass. Account-client namespace tests pass (transport scripted). No new browser or physical-device session claimed.
- SEC-007/008: offline/update test passes; not a claim that all saved protected information is revoked from already-downloaded copies.
- PERF/voice: earlier cache-exit checks remain valid; no live timing sample collected here.
No blanket ledger reclassification was made.

## Tests run successfully
ina-reply-origin; ina-connector-duplicate; connectors; share-provenance; share-routing; rollback-compat; library-discoveries; chat-versions; chat-versions-integration; university-chat; device-accounts; account-client; offline-updates. These are thirteen targeted commands; a new full combined CI run is still needed after helper integration.

The new connector regression and standalone origin test are added to CI. No DB migration, provider limit or public policy change. Production approval and authenticated pilot checks remain pending. The privately supplied feedback/share addendum still needs founder approval and operator/contact completion.

