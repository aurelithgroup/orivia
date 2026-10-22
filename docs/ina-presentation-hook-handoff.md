# Cleo hook handoff, 22 October

This supersedes the earlier module integration instructions in `ina-chat-presentation-2026-10-22.md`.

Use only these files from this follow-up commit:

- `workers/trial-ui/chat-presentation.js`
- `tests/chat-presentation.test.mjs`
- this document

The standalone script sets `window.OriviaPresentation` exactly as specified in `docs/team-workflow.md`. No imports, requests, storage, shared-file edits or deployment. Styles inject once through a style element, matching the agreed hook approach. Cleo should confirm the production CSP permits that existing style approach.

Title behaviour: first substantive user message, skipping greetings, retaining its language, shortening without splitting surrogate pairs. Explicit email, URL, long phone/identifier and name-introduction patterns return a generic title. This is modest local naming, not semantic summarisation or a comprehensive privacy filter. Manual rename protection stays with Cleo's existing `if(!c.titled)` gate.

Source behaviour: domain chips, with original source index and classification in accessible labels; expandable titles, read times and exact supporting quotes. Source ids must be unambiguous. Unknown categories and unsafe URLs never appear. No independent citation remapping. Partial, failure and unresolved states return null so today's complete renderer handles every warning. Needs-review wording remains inside the evidence disclosure. UI labels cover English, French and Arabic; quoted source text stays in its original language.

The hook does not control inline `[1]` links, so those stay unchanged. Listen is untouched and continues reading reply content rather than evidence DOM. The earlier import-based modules are not required and should not be wired in as well.

Checks run: `node tests/chat-presentation.test.mjs` and the earlier `node tests/chat-presentation-modules.test.mjs`. These are local module checks; browser appearance approval and combined build tests remain pending with integration.

Cleo: load the single script using your existing loader/embed hook, add this test to CI, then check saved replies, repeated domains, keyboard focus, Arabic direction and the restrictive CSP on the pilot. No database changes required.
