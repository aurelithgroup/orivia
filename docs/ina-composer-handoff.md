# Ina composer UI — 22 October

Founder request: growing text box, attachment previews with remove controls, plus menu, controls inside the composer, attachment shown with the sent message. This branch adds an independent UI module and a self-contained local interaction preview. Nothing deployed; no shared Cleo-owned files changed.

## Files

- `workers/trial-ui/composer-ui.js` and `.css`: callback-based UI, no network/storage/AI calls.
- `prototypes/ina-composer/index.html`: self-contained interactive sample. Sample image/file and sent messages exist only in memory; the sample PDF is an interface placeholder, not an analysis fixture. No microphone/camera permission is requested by the sample voice button.

## Behaviour

- Text spans the full composer width above the internal controls and grows to 192px before scrolling.
- Plus menu opens by tap/click, keyboard, or fine-pointer hover. Escape/outside click closes it. Camera, Photos, Files and Saved uploads are separate options; click remains available on desktop.
- Image thumbnail or file-name card sits above the draft; dark corner × removes only the attachment, keeping the text.
- One attachment per message for the current one-document backend. Selecting another replaces the pending selection; it never removes a saved file. Retain existing preparation/type verification before processing; MIME checks here are only client UX.
- Enter adds a line; Ctrl/Cmd+Enter sends. Keep the founder's preferred existing Enter behaviour if integration requires it, including IME composition safety.
- `onSend({text,attachment})` receives one snapshot. Return false on dismissed consent/cancelled processing; throw on failure. Both preserve the draft. Successful acceptance clears it. Do not return success until the real request has been accepted.
- `attachment` is `{file: File, fileId?: string}`. File objects/object URLs are ephemeral and must never be blindly copied into the account JSON vault.

## Cleo integration requirements

1. Connect voice to existing dictation/language controls, preserving Stop, permission refusal, original typed text and no auto-send. This module does not replace dictation.
2. Connect Saved uploads to the current account's file list. Recreate/destroy the composer on identity changes; use request generations/abort on every backend continuation. The module ignores a late saved-file selection after local draft changes, but that is not a substitute for server/account isolation.
3. On Send with an attachment: show the revised selected-file consent; only after confirmation call the guarded document-processing flow, then submit the user's message with document context. Do not send automatically on file selection. Preserve draft/file when consent is dismissed or processing/send fails. Prevent duplicate reading on retries when a successful transcript is still valid for that same draft.
4. Preserve Stop/cancellation for an active answer. The module's button currently disables during its callback; Cleo must connect the existing answer-in-progress/Stop state and avoid keeping the user locked out while generation runs.
5. Render attachment metadata/preview **inside that user message**, not as a separate assistant response. Retain safe name/type/file id and explicit processing state; use private authorised file retrieval for persisted previews. After reload/deletion/unavailable local data, show an honest unavailable state instead of inventing an image or public link. No document text in titles, logs or organisation dashboards.
6. For image-only sends, provide a neutral supported prompt internally without fabricating user words in the saved chat. Backend must accept the supported user-message shape; don't silently drop attachments to satisfy text validation.
7. Merge through existing embed/version/i18n pipeline and app-worker caching. Local scripts/styles should follow the existing security policy. All new labels need supported UI-language translations.
8. Keep Step 7 blocked until `docs/ina-step7-review-2026-10-22.md` issues are fixed. This appearance work does not approve or change the document backend.

## Checks

JavaScript syntax checked. Real-browser local preview: selecting sample image, multiline text, sending both into one user bubble; file preview and removal preserving typed text; empty Send disabled; 390px iframe layout with a 340px-wide text area growing to 136px, without composer overflow. This is UI testing, not live upload/AI/account/camera or physical-phone testing. Do not claim saved previews survive reload from this memory-only demo.
