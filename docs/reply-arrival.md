# Reply arrival — 19 October 2026

The server still delivers progress and then a complete, checked answer. This change is presentation only, not token streaming and not a response-speed improvement.

- A newly delivered reply enters with 180 ms opacity/5 px movement, only when the OS permits motion.
- All text, citations, controls and saved content are available immediately. There are no typing timers, hidden words or delayed persistence.
- Redrawing history does not animate older messages.
- Readers near the bottom follow replies and progress. Readers further up keep their position.
- Sending a message and switching chats intentionally show the latest message.

`tests/reply-arrival.test.mjs` runs the real draw/progress functions with a small DOM harness. It checks immediate text, animation scope, scroll behaviour, saved-before-drawn wiring and the reduced-motion CSS guard. This is not a real-device visual test.

Patch only the live embedded UI. Preserve the current backend, including the previous timing patch. Rollback version: `9cec782e-1722-4a98-a1e5-12261f1dd54b`. Public beta is outside scope.
