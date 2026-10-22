# Ina review of pilot candidate 2 — 8af0b96

Reviewed exact source 8af0b96 in an isolated worktree. No deployment or production change.

## Independently passing local checks
Seven commands: library-discoveries; listen-startup; feedback (SQLite); owner-overview (real Better Auth/SQLite); university-overview (real Better Auth/SQLite); library; chat-history. All passed. The overview tests ran with the installed real account dependencies, not a sign-in library stub.

Prior findings: collector cap removed with paging; removal state lives once and is restored/reverted on failed persistence; report disclosure names account linkage and selected text visibility; ambiguous save error wording corrected; older organisation shortlist survives a newer mention. Approved these source-level fixes subject to combined deployed review.

Owner overview reads real records with definitions and verified owner gating; student/staff refusals tested. University action queue is organisation-scoped with staff permission checks. Members typo is fixed in source. Voice timings remain simulated and must not be advertised as live OpenAI performance.

## Change required: immediate audio cleanup on account exit
chat.js clears voiceCache, voiceInflight and voiceRequests only at the next voicePiece call with a different epoch. The account leave() hook only calls stopSpeaking; stopSpeaking deliberately no longer aborts pending requests.

Reproduction executed the shipped cache block: generate and cache an A-account audio Blob, then change epoch to B without another Listen call. Cache size remains 1. This establishes retained private audio in page memory, not demonstrated playback by B. No claim of a proven cross-account server disclosure.

Add a distinct resetVoiceSession() cleanup used on account leave/change, sign-out and data clearing. It must stop playback, invalidate the run, abort current requests, clear cache/inflight maps and byte counts, and release active object URLs. Ordinary Stop may retain bounded work for replay as designed; account exit may not.

Test completed and in-flight A audio, call the actual account-exit hook, assert immediate cleanup before B invokes Listen. Resolve late A requests and prove no recache or playback. Recheck Stop/replay and account B generation.

## Production gate
Feedback needs Privacy/retention wording before release. Current disclosure says deleted with account, but no fixed additional expiry was implemented; do not promise a time limit the code does not enforce. Owner-only team review, explicit text attachment, account-linked storage and deletion behavior must be described accurately. New numeric analytics remain operational totals, not proof of user outcomes.

## Live limitations
Previous direct pilot browser check hit Cloudflare Access sign-in. No authenticated deployed session is available here. This source/local review is not signed-in pilot acceptance, real-device Listen timing or confirmation of Worker version 5c471584. Do not mark those done on Ina's behalf.

Next candidate should include the audio cleanup and tests, actual deployed version, and real authenticated browser evidence where possible. Founder production approval remains pending.
