# New Orivia public promotion

Prepared on 19 October; public Worker promoted on 20 October. GitHub Pages rollout follows the live app checks.

## Release sequence

1. Store the existing OpenAI project key as `OPENAI_API_KEY` on **orivia-beta**. Never obtain it from private Worker logs or expose it to a browser. The private Worker's secret cannot be read/copy-exported through this API.
2. Read the current private bundle and public settings; retain rollback version IDs. Use `tools/prepare-public-promotion.mjs` to patch the current live bundle instead of deploying the older source backend. Exact-match assertions must all pass. The patch changes public gating, public provider consent, entrypoint and UI only; it preserves newer live calendar and research fixes.
3. The public Worker keeps its existing `TURNSTILE_SECRET`, site key, `SESSION_SECRET`, per-person and search caps, AI quota binding and D1 binding. Inherit its secrets, never substitute the private Access settings. Keep the private pilot unchanged.
4. Public release settings: `PUBLIC_RELEASE=1`, `PUBLIC_BETA=1`, `PUBLIC_HOST=orivia-beta.habeebahsallah27.workers.dev`, `OPENAI_PILOT=1`, `RESEARCH_AGENT=1`, `SPEA_DIRECTORY_FEED=1`. Carry over confirmed model rates and the existing shared $5/day, $20/month ledger limits; do not increase spending. Shared D1 means the same monetary ledger covers both environments. Keep browser automation off. Keep existing public search limits (10/day, 100/month) until the founder explicitly changes them. Do not copy private email/tester/Access variables.
5. Public compatibility flags must include `nodejs_compat`, matching the tested private runtime. The actual uploaded bundle does not import the unfinished account module; the UI hides unavailable login methods. Account provider activation is a separate release.
6. Check public `/v1/config` reports public mode, the correct site key and `publicAssistant: true`, no secrets. Confirm no private Access login on the page; no AI request without the human check; named OpenAI consent appears before Start. Run one real human-verified chat and a researched question. A CAPTCHA must be completed by the founder or with explicit action-time approval.
7. Only after the public app passes: preserve the current main-branch `index.html` as `legacy.html`, publish `release/public-entry.html` as the new `index.html` (retain the marketing website beside a phone-sized app preview; no automatic redirect), and upgrade the service worker so cached old entry pages update without removing localStorage. Preserve assets, partner routes and old user data. GitHub Pages must be verified after its deployment finishes.

## New behaviour

The private entry stays private by default. Only the new explicit public entry allows the full OpenAI assistant in public mode. An unconfigured release returns 503 rather than claiming the new assistant is available. Public consent has its own version; a private tester's old consent is not reused. The public page explains OpenAI/Brave before the Start checkbox; opting out later remains possible in Settings. Human checks, origin validation, per-person quotas and the shared monetary ledger run before paid model calls.

Guest data on github.io and workers.dev are different browser origins. It must not be silently copied. The old app is retained at legacy.html so older data can still be opened. A future reviewed import/export flow can transfer it explicitly.

## Tests

`tests/public-release.test.mjs`: release prerequisites, no private tester login, public consent version, private entry still refusing public mode, human check and origin required before any provider call. Scripted transport only.
Existing public-beta tests cover the signed human cookie, per-person and daily caps. Existing private-pilot tests remain in place. Real public paid-provider and human-check tests still need the founder: the cloud browser displays an interactive human check, which has not been completed.

## Founder layout decision

Keep the side-by-side website and phone-sized Orivia preview. On mobile they stack. Always include Open full screen and a fallback link. Before enabling the iframe, set public app frame-ancestors to https://aurelithgroup.github.io (plus self), never *. Test human verification and cookie behaviour in a cross-site frame; do not disable these safeguards to make embedding work. Public human cookies now use Secure, SameSite=None and Partitioned for the cross-site preview, with exact-origin checks still required for mutations. This is covered by scripted tests; the founder still needs to complete the real embedded human check. The full-screen fallback link remains available. The private pilot remains non-embeddable.

Public rollback before release: version bacccd44-0ba0-44b8-bd68-981bd38de1f4 (includes the founder-added secret); private pilot remains 2fcbf9ab-a5a7-42a1-88ca-c19c318a4662.

## Published result (20 October)

GitHub Pages main entry commit: 4f3907b60157ab1230f387e27cb126a0d378056d. Pages deployment succeeded. Browser check shows the marketing website beside the new guest welcome inside the phone frame; full-screen and legacy links are present. Public Worker is promoted with inherited secrets and unchanged monetary/search limits. A later small patch prevents late consent configuration from showing the intro underneath the welcome. Real chat remains unverified until a human completes Turnstile.

The existing CI workflow had an invalid unquoted colon in a step name; step names are now quoted so GitHub can parse it. The 56 local checks passed before deployment; focused release, startup and account-client checks passed after the welcome adjustment.

## Review fixes (20 October, Cleo). On the branch, not yet published

The founder's review covered the phone preview, mobile layout, guest entry, consent, human check and full-screen link. Fixes:

- **Consent:** the public welcome no longer says messages go only to Cloudflare Workers AI. The single tick box now says it includes OpenAI, with Workers AI as the backup when OpenAI is unavailable. The Settings privacy text matches.
- **Guest wording:** "Basic help…" is now "No account needed. As a guest, your chats are saved in this browser on this device."
- **Preview vs full screen:** the welcome inside the preview, and the note under it, say that chats in the preview stay separate from the full-screen app (browsers partition embedded storage). The welcome offers "Open Orivia full screen".
- **Human check in the preview:** if the check fails or doesn't stick, the message offers the full-screen app instead of looping.
- **Phones:**
  - An Open Orivia button and a "See the preview" link sit near the top.
  - The text no longer says "beside this page".
  - The "scan with your phone" QR box is hidden on screens up to 900px.
  - The QR address no longer overflows.
- **Tablets:** the preview is centred.
- **QR and home-screen arrivals:** the page shows a banner, with no automatic redirect.
  - `?city=` visitors get Open Orivia first.
  - Organisation codes (`?p=` / `?d=`) open the organisation's guide in `legacy.html` with the same query, because the new app doesn't have organisation instructions yet.
  - Home-screen launches get Open Orivia plus the previous version.
- **Organisations copy:** "No accounts or personal data needed" is corrected to say messages go to AI providers only with the newcomer's agreement.
- **Welcome notice:** it no longer says "early AI trial".
- **Service worker:** it caches the previous version's files again, so legacy.html works offline. Each file is added separately and pages are fetched fresh first. Saved progress (localStorage) is untouched.

To publish:

- **Website:** copy `release/public-entry.html` → `index.html` and `release/public-sw.js` → `sw.js` on `main`.
- **App:** redeploy the public Worker with the new embedded UI, using `tools/prepare-public-promotion.mjs`, the same patch flow as the 20 October promotion.
- **Still to check by hand:** a real iPhone Safari human check inside the preview, and one real chat.

Published 20 October:

- **Website:** `main` at 2050e7f. GitHub Pages deployed successfully.
- **Public Worker:** version `1f1321a2-d804-47a5-89f3-da627d6ee3c4`. Rollback is `d506682a-6f38-4408-9bc6-73862d1cdb51`.
  - Only the embedded page and `/chat.js` interface texts were replaced, from branch 3a33ed4.
  - Settings, secrets and limits were confirmed identical before and after.
  - The private pilot was untouched.
- **Still open:** a real iPhone Safari human check inside the preview, and one real chat in the preview and full screen.
