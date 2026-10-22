# Ina continuation after Cleo's usage limit — 22 October

Base: 9c48d42 (candidate 3 source 8c5710f). No pilot or production deployment by Ina. Cleo remains the integration/deployment owner. Do not resume the unpushed edit/regenerate draft over these files; compare and choose one implementation.

## Candidate 3 review
Independently ran voice-account-exit and listen-startup tests: both pass. Reviewed resetVoiceSession, account leave/reload/Clear-data hooks and session invalidation for late audio. The prior immediate-cleanup finding is fixed in source. Signed-in deployed testing remains blocked by unavailable Cloudflare Access session; this is not live acceptance.

## New implementation
- Message Edit creates a new conversation version. Regenerate is in the reply's More menu.
- New replies have stable feedback references so a regenerated answer does not overwrite the rating for another version.
- Original user messages, replies and source metadata survive in an account-scoped chat snapshot. Previous/Next version switches the whole conversation; selected content alone goes to the request.
- Versions retain their document and university-context snapshots. Editing does not delete already-saved calendar events.
- The operation calls the existing send function directly once, never simulates form submission. A regeneration does not append a duplicate user message.
- Replay/edit responses cannot autosave reminder events. A returned reminder becomes an explicit Review/Save card, and the answer does not claim it was saved. Existing calendar events are unchanged. Calendar-change proposals retain their existing explicit confirmation flow.
- A 30-version limit explicitly refuses new forks without deleting prior versions. Storage failures preserve the previous in-memory version and show existing storage warnings. No silent eviction.
- Existing unsent composer text is retained. Pending file drafts must be sent or removed before changing versions. No file is automatically reread.
- New controls have English/French/Arabic wording and keyboard-operable controls. Other interface-language coverage remains a separate unfinished requirement.
- Source and embedded UI are regenerated together. CI includes the behavioural version test.

## Verification
All 86 tests/*.test.mjs files pass with Node 24 and real installed account dependencies. This is 86 test files, not a claim to have run every additional CI command. Evidence: docs/evidence/ina-continuation-tests-2026-10-22.json.
See tests/chat-versions.test.mjs: originals and nested versions, selection after JSON round-trip, refusal without data loss, selected-only model messages; real sendChat execution proves one request, one user message and zero reminder writes on regenerate (normal send still writes once).
Existing source-slice test harnesses were updated for helper dependencies and the replay-specific resend guard; their original assertions remain.

## Limits and next checks
This is not a deployed or visually accepted feature. The remote browser cannot reach the container's localhost (connection refused), and the pilot requires Access sign-in. No browser check is claimed. Before integration release, use the existing local app harness to check edit → answer → regenerate → previous/next → refresh, including an existing reminder. Confirm exactly one network request per action and no new calendar entry until Save. Check Stop, offline, quota failure, two chats, account exit, documents and mobile/RTL layout. Do not treat the simulated reply test as real provider evidence.

There is no secure multi-account switch, share-link system, full journey catalogue or native-store package added by this patch. The rest of the master ledger remains unfinished. Existing privacy/retention production gates still apply.
