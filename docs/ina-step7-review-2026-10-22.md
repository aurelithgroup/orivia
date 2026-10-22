# Ina Step 7 review — 22 October

Snapshot: `b6c7e753cc34a5cbedf071c9774a5956204d9193` (Step 7 code `d28962a`). **Not OK for production yet.** No production changes or paid AI requests made by this review. This is an engineering/disclosure review, not legal approval.

The existing `files-to-chat.test.mjs` passes locally. It uses scripted OpenAI responses and does not cover the failures below. A human/live attachment test is still pending.

## Required corrections

### 1. PDF page limit does not fail closed

`pdfPages` counts literal `/Type /Page` strings in raw PDF bytes. Real PDFs can compress those objects. I generated a valid eleven-page PDF with PyMuPDF (`save(use_objstms=1, garbage=4, deflate=True)`); opening the saved file confirms 11 pages, but Orivia returns 0. `handleDocument` rejects only counts above 10, so this file reaches the provider. Positive counts can also be incomplete.

Use a bounded real PDF parser/page-tree count, or refuse unsupported/uncertain PDF layouts before the provider call. Add a real compressed-object-stream PDF regression fixture plus malformed, encrypted and ordinary PDF cases. The price reservation must use defensible bounds for the actual model/image/PDF policy, not assume a heuristic page count proves the maximum input. Do not describe estimated example costs as hard per-file maxima.

### 2. Late reading result can cross chat/account boundaries

`readAttached` captures only `store.active`. All new empty chats have `active === null`; it does not capture an account identity or a chat-generation token. A deferred-response harness using the actual function reproduces a document result setting `pendingDocument` after the owner changes while active remains null. Same-account New chat → another empty New chat is also indistinguishable. The account `leave()` callback does not invalidate this request.

Bind the reading operation to account/guest identity and an independently unique chat generation, invalidate/abort on account leave/sign-out, New chat, switch-chat and Clear saved data. Check the generation and identity before every async UI/storage update, including errors/finally. Never reuse the current active chat as a fallback for a stale request. Add races for sign-out, another account, same-account new empty chat, deletion and late errors.

### 3. Silent transcript eviction

The successful attach path deletes `.document` from chats beyond the newest eight with no notice or choice. An actual-function harness with eight existing transcripts confirms attaching one more removes an older transcript. This changes user data and future answers silently, contrary to our existing preservation rule. It also does not consistently apply when a document is attached before the first message.

Keep existing transcripts. If a storage/sync limit is reached, preserve saved data and offer explicit management/removal choices or refuse the new persisted attachment with a clear warning. Tests should cover nine attachments, UTF-8-heavy text and sync failure. A fixed count does not establish that the total account backup fits 1 MB.

### 4. Account deletion can leave stored files behind silently

The account handler deletes the auth account first, then calls `deleteAllFiles(...).catch(()=>{})`. If R2 listing/deletion fails, it still returns success and leaves private objects without a reliable retry path; account-file SQL rows have already cascaded away.

Record a durable cleanup job/tombstone before deleting the identity, retain enough information for bounded retries and expose failure/pending status truthfully. Keep any surviving objects inaccessible. Add a storage-failure/retry regression; a successful normal deletion test is not enough to support the current promise.

### 5. Bound the request while reading it

`handleDocument` checks Content-Length, then reads the whole body with `arrayBuffer()` before checking actual size. Missing/false length can allocate well beyond 10 MB. Use a streaming byte limit as the Files upload route already does, cancel the reader at the threshold, and test an oversized body without Content-Length. No provider request on refusal.

## Disclosure requirements for Cleo

Do not publish the existing engineering notes as a complete Privacy policy. In particular:

- “Orivia's server keeps neither file nor text” needs scope: the transcription request is not separately retained by that endpoint, but saved files live in R2 and signed-in chat transcripts sync into the private account vault.
- “The file goes once” means one extraction request per deliberate attempt, not once ever. Retries/re-attachments can resend it; extracted text is sent again with subsequent messages in that chat.
- The attach confirmation must mention that text stays with the chat, where it is saved for account/guest users, and that it is sent with follow-ups until removed. The current short card omits storage and repeated text transmission.
- Removing the document label stops attached-transcript use; it does not erase earlier user/assistant messages or their quotations. File deletion and chat/transcript deletion are separate controls and should say so.
- `store:false` disables response storage for later API retrieval; it does not prove zero provider retention. OpenAI's published data controls describe separate abuse-monitoring retention. No Zero Data Retention approval was verified here.

Product recommendation: keep optional documents off until the above is corrected; use an explicit document-specific first-use acknowledgement/version, for example `orivia-document-consent-v1-2026-10-22`, plus the selected-file confirmation. General chat consent v1 alone is not a sufficiently specific explanation of this new data flow. This is a proposed disclosure design, not a legal sufficiency finding. Final Privacy/Terms drafts and operator details remain outside this public repository, as agreed.

Official data-controls source read on 22 October:
https://developers.openai.com/api/docs/guides/your-data

## What is encouraging

The file itself is passed inline with `store:false`, its real name is not put in the provider file part, content/filenames are absent from document logs, transcript size is bounded, and source kind `document` is excluded from official-rule evidence and assistant memory. Those controls should remain while fixing the boundary cases.

Next: Cleo supplies fixes and regression results, Ina rechecks, then a synthetic-file live pilot test. Do not ask the founder to use a real passport, tenancy agreement or bank document as the first test.
