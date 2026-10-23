# Ina: parallel presentation handoff, 22 October

Base: `e1e89c32fc73ff5b46b495bac8323186f117a26b` on `myorivia-release-plan`.
Branch: `ina/chat-presentation-2026-10-22`. No shared app files, database changes or deployments.
Cleo remains integrator and sole deployer.

## Ready for integration review

- `workers/trial-ui/chat-titles.mjs`: local title suggestion, skips greetings and assistant text, keeps user language, Unicode-safe length, honours existing manual `titled` flag. Explicit contact/URL/name-introduction patterns use a generic title. This is not comprehensive sensitive-data detection: a user's ordinary message can contain personal details. It makes no model calls.
- `workers/trial-ui/compact-references.mjs` and `.css`: inline domain pills instead of visible bracket numbers. Accessible labels retain source numbers and titles, so two pages on one domain remain distinguishable to assistive technology. Unknown markers stay text. Existing evidence panel, source sanitiser and Listen text processing remain authoritative.
- `tests/chat-presentation-modules.test.mjs`: run with `node tests/chat-presentation-modules.test.mjs`.

## Integration hooks (Cleo owns these files)

1. Serve/import the two modules before chat startup, or incorporate exports through the established build. Include the CSS under the existing security policy. Add assets to the app-shell cache only if needed for offline startup; do not cache conversation data.
2. Have existing `autoTitle(ts)` call `suggestChatTitle(ts, {language:uiLanguage()})`. Keep `if(!c.titled)` in `syncActive`, and the manual rename flag as-is. Existing saved nonempty titles need not be migrated.
3. Have `citedText(text,srcs)` call `renderCompactReferences(citeSegments(text,srcs), document, {sourceLabel:uiText('Source'),openLabel:uiText('opens in a new tab')})`. Use the existing parser and vetted `safeSources` input. Do not replace the parser with independent positional remapping.
4. Leave researchBlock(), exact quotes, failure notes and spokenText() in place. No quotes or claims change. Check translated labels exist before shipping.
5. Add the new test to CI when integrating. Run existing chat-history, research-display, account, installation and language checks against the combined build. Check keyboard focus, narrow screens, duplicate domains and old saved replies in a browser.

## Verification so far

New module checks pass locally. These modules are not wired into the app yet; no integrated browser check, founder appearance approval or live deployment is claimed.

## Baseline isolation review

Read-only Worker settings on 22 October showed different ACCOUNTS_DB bindings:

- pilot: `8cd85061-ce42-4fa7-8dd7-a4b01f36800a`
- production: `3ebd10d5-01e5-4a01-b846-977f1bb2d5b3`

This confirms account-database separation for those two Workers, not every auxiliary service. Notifications scheduler bindings still need a separate review before pilot push tests.
