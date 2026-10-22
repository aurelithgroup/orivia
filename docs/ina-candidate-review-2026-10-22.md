# Ina independent review — candidate 5569f60 — 22 October 2026

Decision: changes requested. This is not production approval.

## Scope and evidence
Reviewed the frozen source 5569f60def964f3ae8c908d746d543e89749114d in an isolated worktree, not Cleo's active files. Independently ran seven commands: feedback, library-discoveries, week-swipe-links, chat-history, library, platform-ui, account-client. All passed; these are local checks, not proof of deployed behavior. The account transport test is scripted.

Opened the deployed pilot in the remote browser. It redirected to Cloudflare Access sign-in; no authenticated pilot session was available. Signed-in UI, deployed version parity and live latency remain unverified. Access protections were not weakened, no secrets requested, and no production configuration was changed.

## Findings to fix
1. **Library silently hides recommendations beyond 100.** workers/trial-ui/chat.js libraryDiscoveries ends in slice(0,100). Running the actual collector with 105 eligible items returned 100. Remove the cap or use explicit accessible pagination with total/count. Test by executing the collector and rendering/navigating more than 100 entries.
2. **One removal mutates all assistant messages.** hideDiscovery writes each removed key onto every assistant turn. Actual reproduction: one removal wrote to 105 turns. This grows approximately messages times removed keys, needlessly expands account snapshots and couples removal to chat deletion. Store hidden keys once in the account-scoped Library state with migration, Restore and failure handling. Preserve all chat content and sources. Test reload, account separation, quota failure and restore.
3. **Feedback privacy promises are too broad.** feedback.sql stores user_id; the queue omits explicit reporter identity, which is not anonymity. A note or selected reply may contain personal/document-derived text. State exactly that the report is account-linked internally, owner queue omits account fields, notes and selected reply are visible to the team. Update Privacy/retention before production; no automatic production consent-version decision implied here.
4. **Ambiguous network failure is falsely described as no save.** feedbackError says Nothing was saved for every non-sign-in failure. A successful server insert followed by a lost response can already be saved. Say Couldn't confirm whether this was received; retry with the same request ID. Preserve idempotency and add a saved-then-response-lost test.
5. **Favourite coverage is incomplete.** Organisation discoveries initialise favourite:false even when the card is shortlisted; destination favourite aggregation has a test but organisation shortlist state does not. Decide presentation labels clearly: shortlisted is distinct from automatic discovery, and must remain visible/preserved across duplicate mentions. Test the actual collector with an older shortlisted organisation and a newer duplicate.

## Review of changed policy
A Library hide/restore record is a legitimate narrow write for the requested removal feature. The earlier read-only prototype rule does not prohibit implementing explicit user removal. Approval is conditional on one scoped record, preservation, account isolation and truthful save/error states; it does not authorise edits to arbitrary chats or sharing.

## Parallel next work for Cleo
Fix findings 1–4 before the next candidate. Then build owner overview from real existing tables: organisations, membership totals, pending joins, published content, feedback queue with defined measures and direct action links. No private chats/files/progress browsing. Build university overview action queues using existing permissions. Finish complete slices; avoid fake budgets or synthetic analytics. Measure and improve Listen start if those slices complete. Leave uncertain external integrations explicitly blocked.

## Required next candidate
Exact SHA and pilot Worker version, migration/environment receipt, meaningful regression outputs for findings, authenticated owner/student permission evidence where available, and remaining blockers. Re-run combined checks after integration. No production promotion until independent review and the founder decision.
