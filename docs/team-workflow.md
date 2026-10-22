# Orivia team workflow (22 October)

Founder 🟣 tests and decides. Ina 🔵 and Cleo 🟢 work in parallel. Cleo integrates shared files and is the only deployer.

## Shared starting point (recorded by Cleo, 22 Oct morning)

| Item | Value |
|---|---|
| Branch | `myorivia-release-plan` |
| Latest commit | `e1e89c3` (connected-Orivia Stages 1–5 on the pilot) |
| Production app `orivia-production` (myorivia.app) | `fe28a2ae` (released 21 Oct; doesn't have Stages 1–5 yet) |
| Front door `orivia-front-door` | `0fe7fcb0` (`RELEASE_LIVE=1`; this version only removed the temporary preview secret) |
| Pilot `orivia-research-pilot` | `a20b8157` (Stages 1–5; its own test accounts database) |
| Old public app `orivia-beta` | `3e927ff6` (unchanged; serves the GitHub Pages website preview) |
| Accounts databases | production `3ebd10d5…` (real accounts) · pilot `8cd85061…` (test only) |

## Branches

- Cleo: `myorivia-release-plan` (integration branch; all deployments are built from here).
- Ina: start a branch from `e1e89c3`, for example `ina/chat-presentation`. When ready, tell the founder the commit; Cleo merges it.

## File ownership (so we never overwrite each other)

**Ina owns (creates and edits freely):**

- `workers/trial-ui/chat-presentation.js`: a standalone script that sets `window.OriviaPresentation`. It has no imports and doesn't edit other files' internals. Its styles live in the same file (inject a `<style>`).
- `tests/chat-presentation.test.mjs`
- `docs/ina-*.md` (her notes, audits and proposals)
- Later rounds: `workers/trial-ui/translations-*.json` proposals, voice/language modules, privacy and terms drafts **outside the public repo**.

**Cleo owns (Ina sends patches or requests instead of editing):**

- `workers/trial-ui/chat.js`, `page.html`, `accounts.js`, `spaces.js`, `nav.js`, `notifications.js`, `app-sw.js`, `i18n.js`, `translations.json`
- everything under `workers/` that runs on the server, `workers/accounts/*`, `tools/*`, `.github/workflows/*`, all `wrangler.jsonc` files
- database changes and every deployment

## The hook for Ina's chat presentation work

Cleo will load `chat-presentation.js` before `chat.js` and call these if they exist (otherwise today's behaviour stays):

```js
window.OriviaPresentation = {
  // A short title for a chat from its turns. Return '' to keep the current title. Manual renames are never passed here.
  titleFor(turns /* [{role, content}] */) { return '' },
  // Draw the sources for one reply. Return a DOM node, or null to keep the current rendering.
  // sources: the checked sources as the app has them ({id, url, title, host, kind, checkedAt, …});
  // claims: research.claims from the server (sentence ↔ source and quote); research: the whole research object; language: 'en'|'fr'|'ar'.
  renderSources({ sources, claims, research, language }) { return null },
}
```

Keep source matching, accessibility (keyboard, screen readers) and Listen behaviour working. The tests should cover them.

## Rules

- Build and investigate in parallel. Shared-file edits, database changes and deployments happen one at a time, through Cleo.
- Nothing goes to myorivia.app until the founder's acceptance checks pass on the pilot.
- Never put secrets, legal drafts or personal details in the repository (it's public).
