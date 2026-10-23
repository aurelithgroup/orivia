# Voice typing — 19 October 2026

The browser speech service is used; no new paid speech provider or backend audio route is added.

- A language picker offers Device language plus the ten beta languages. The preference is saved on this device. Service support for each language varies.
- The microphone starts after the one-time privacy note. Starting, listening and errors have distinct messages. The editable composer shows interim words. Stop keeps the text currently visible; Cancel restores the exact text from before dictation.
- Every recognition callback checks its session identity. Callbacks after Stop, Cancel, chat changes, errors or a later session cannot alter text or status.
- The composer is read-only during recognition so results cannot overwrite manual edits. It is editable again on Stop, Cancel, natural end or errors. The existing 900-character composer limit also applies to speech.
- Permission refusal/dismissal, missing microphone, connection trouble, unsupported language/service and unexpected failures leave typing available. Unsupported browsers keep speech controls hidden.
- The revised privacy note explicitly says audio may go to the browser speech provider. It no longer says nothing is sent before Send. Its v2 key makes the note appear again after this update.

`tests/dictation.test.mjs` runs the production dictation functions with a fake recognition service. It exercises callback races, language selection, errors, restoration, length limits, privacy note and no automatic sending. Real microphone quality and permissions still need an iPhone and Android check. The automated tests do not establish recognition quality or language availability on devices.

Private pilot only. Patch its existing embedded UI rather than rebuilding its newer backend from this checkout. Pre-change rollback version: c0409085-d615-45c9-9230-112f4f02601b.

## Compact language controls

The permanent language row is now in Settings. Hover over the microphone (mouse), hold for half a second (touch), right-click, or use Alt+ArrowDown while focusing the mic to open the compact picker. Escape, the close button, choosing a language or clicking outside dismiss it. Normal mic activation still starts/stops dictation. A hold does not start recording on release; moving a touch cancels the hold. Both pickers share the same saved language. Device gesture behaviour still needs phone testing.
