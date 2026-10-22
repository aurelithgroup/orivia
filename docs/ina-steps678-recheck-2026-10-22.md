# Ina: independent Steps 6–8 recheck
22 October 2026. Reviewed release commit 3b289d95c36064f2968cb6c76c8dc218bd3591e5. No deployments or live writes.

## Result
Not yet review OK for production Files / Files to Chat. Step 9 can proceed independently. Eight targeted suites passed: files, files-to-chat, library, notification-isolation, notifications, notification-client, chat-history, accounts. Real Better Auth/SQLite dependencies were available; storage/provider/push transports in those tests are stand-ins. This is not a new human phone or end-to-end browser acceptance test.

## Confirmed live
Read-only Cloudflare checks: old orivia-notifications-private schedule is empty. Pilot has minute cron, NOTIFICATION_SCHEDULER=pilot, expected test DB 8cd85061-ce42-4fa7-8dd7-a4b01f36800a, and that actual binding. Pilot delivery aggregates: 18 accepted, no other status rows at check time. Acceptance is not proof of device display. No endpoints, personal files, user content or secret values read.

## Release fixes needed
1. High: cleanup can erase files of a still-existing account.
   handler.mjs writes file_cleanup before auth.api.deleteUser; an exception/process interruption leaves the marker. files.mjs retryFileCleanups/finishFileCleanup never check whether the user still exists. Reproduction with real SQLite: insert user still-active, add synthetic u/still-active/private.pdf, markFileCleanup, simulate auth deletion not completing, run retryFileCleanups. Output: accountStillExists=true, cleanupReportedSuccess=1, filesRemaining=0.
   Fix: deletion state must be confirmed before any object deletion. A retry for an existing user must preserve all files; cancel stale intent or await confirmed deletion. Preserve retryability for genuinely deleted accounts. Test auth throw, failed response/cancel failure, crash window, concurrent session retry, and normal deleted-user cleanup.

2. PDF decompression is not bounded while reading.
   pdfPages in orivia-document.mjs awaits Response(decompressedStream).arrayBuffer() before comparing out.length with maxInflated. A compact compressed stream can expand past the advertised bound before refusal. Use a running byte-limited reader, cancel at the remaining cumulative budget, and refuse before retaining over-limit output. Test multiple streams and an expansion crossing the bound.

3. PDF cost reservation is an estimate, not an upper bound.
   PAGE_TOKENS=6000 times pages does not bound extracted text in an arbitrarily dense PDF page. Spend ledger permits positive settlement deltas, so a call can exceed its reservation and remaining cap. Bound/preprocess actual PDF text plus image input, obtain a defensible worst-case reservation for accepted inputs, or refuse inputs without such a bound. Do not describe a per-page average as a hard spending guarantee. Test a text-dense one-page input against nearly exhausted budget.

4. Update the document notice and truncation behaviour.
   Latest flow keeps every document with the conversation, sends newest three / 24,000 characters combined, and has no active-document removal label. Same v1 acknowledgement was reused after this change. Show revised first-use wording with a new document consent version. Disclose the subset/context limit. Server extraction returns truncated but readAttached drops it; preserve and display incomplete extraction/context rather than presenting complete reading. Storage-full text still instructs users to remove a nonexistent label ×. Correct it.

## Privacy handoff
Updated private draft: Orivia-Files-Privacy-Addendum-DRAFT.md. It covers saved originals vs chat transcripts, newest-three/24k context, independent Library/chat deletion, provider retention limits, optional generic notifications and release holds. No founder contact details. This remains an addendum, not a complete approved Privacy/Terms policy; unresolved operator/contact details remain a separate publishing decision.

## Already improved
Streaming original upload limit, account/chat generation cancellation, refusal instead of old transcript eviction, durable cleanup intent, Library view over existing data, pilot scheduler isolation, generic alert body and red dot all have passing targeted checks. The cleanup intent needs the additional active-user guard above.
