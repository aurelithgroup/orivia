# Chat refresh and latency — Ina handoff

Founder authorised all eight aesthetic proposals plus smoother word-by-word replies and shorter waiting. Parent: 6e246f5 (all six previously approved Cleo design-pass changes). Separate branch/worktree. Nothing deployed; no provider requests, budgets, secrets, database or permission changes.

## Eight approved changes
1. Reading space: centred 760px reading width inside a wider desktop shell; more separation between turns, open assistant answers and restrained user bubbles. Phone margins remain comfortable.
2. Composer: one rounded, subtly bordered surface with expanding text and its attachment/microphone/send controls inside. Yellow reserved for Send. Existing attachment/voice/keyboard handling retained.
3. Header: essential branding/account/alert controls remain; redundant desktop title/beta chrome is hidden.
4. Desktop sidebar: existing chat history becomes persistent at >=1000px, with local search over titles/message text, New chat, pinned/recent/archived and account/Settings at bottom. Same records and menu controls; no second storage. Mobile retains drawer. Desktop role is navigation rather than a modal dialog.
5. Readable replies: consistent line height and paragraph spacing; server instructions favour concise introductions when cards carry details and direct replies for drafting/translation without new external facts. Card visuals quieter; all original sourced details retained. No Markdown/HTML injection added.
6. Evidence: one small Sources control; links, exact quotes, classifications and failure notices retained inside disclosures. Inline circles still map to vetted source identities. Fixed an existing draw() else branch that overwrote citation nodes with raw text.
7. Actions: Copy, existing Listen and More -> Select reply. Quiet hover/focus presentation for pointer devices, visible on touch. Existing voice/provider/privacy behaviour unchanged.
8. Unified radius variables, restrained borders/shadows and font hierarchy; Home/Library serif headings retained, clean body type for Chat. New labels translated French/Arabic.

## Smooth arrival (be precise in release notes)
New standalone chat-motion.js progressively reveals an ALREADY VERIFIED reply. Restores the exact original citation DOM, reveals cards/actions once complete, completes safely on redraw and obeys reduced motion. Display finishes within about 1.4s rather than delaying long replies for many seconds. Existing real NDJSON research progress remains unchanged.

This is word-by-word rendering, NOT live model-token streaming and NOT a reduction in time to a checked answer. Do not market it as either. Native token streaming before the existing whole-reply validator would need a separate verified-sentence protocol/review; no unverified claims are exposed here.

## Actual latency work
assistantTiming now shares identical successful search requests/results within one message, including concurrent requests. Exact query plus options (site, offset, etc.) form the key; no cross-turn/person persistence, no policy merging, failures evicted for retry, maximum eight entries. Existing page cache preserved. Added searchCacheHits timing only (no query text). Scripted test: three identical search invocations -> one underlying search; different page offsets and different turns still call independently.

Prompt asks for parallel independent tools, direct answers when no new facts are needed, and no repeated successful searches. Validators unchanged. Earlier audit found model calls dominate selected slow turns, so search deduplication cannot honestly promise a large general latency reduction.

No new live latency benchmark or paid provider run was performed. On pilot compare equivalent queries on old/new versions using existing modelMs, toolWallMs, searchMs, pageMs, searchCacheHits, elapsedMs and actual model-call counts. Report failures/cancellations separately; don't sum overlapping operation times. Further model-loop tuning remains based on that evidence, not reduced checks or guessed facts.

## Validation
All 78 tests/*.test.mjs suites passed with Node 24 and --experimental-sqlite (real Better Auth/SQLite dependencies; provider/R2/push transports remain scripted). New chat-motion tests verify progressive text, citation identity restoration, reduced motion and cleanup. Expanded timing tests verify search sharing, offset distinction, retry and per-turn isolation. CI includes motion test. Existing draw/storage/document/source/permission checks passed.

Local browser QA used real page CSS, draw(), renderChats(), motion and presentation/nav modules with explicitly labelled synthetic messages/records and no backend connection. Desktop light, 390px dark phone (measured body/scroll width 390), sidebar search, source expansion and composer sample reply checked. Chrome extension metadata errors appeared; no application-origin errors observed. Not a real-device or pilot end-to-end acceptance claim.

## Integration
Merge parent six-change design pass first if not already present, then this commit. Re-run embed tool if combining other UI changes, combined tests, pilot first. Cleo sole deployer. Recheck actual initial load/account switching, source links, Stop, listening, attachments, mobile keyboard, reduced motion and saved-chat search before production. No new spending required for this UI.
