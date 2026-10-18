# Private research pilot — 18 October 2026

The pilot was built from `74d383b` and deployed separately from the public beta.

- Worker: `orivia-research-pilot`
- URL: https://orivia-research-pilot.habeebahsallah27.workers.dev/
- Deployment: `1070a5c172e84f26b9914a35aa32f3c6`
- Access application: `ff61d37b-2b96-40e7-9f1b-a7f9c8ef52f2`, founder-only allow policy.
- Anonymous GET returns HTTP 302 to Cloudflare Access, verified by a real request.
- Both `OPENAI_PILOT` and `BROWSER_DIRECTORY` are `0`. Money and browser allowances are `0`. Neither provider nor browser was called during this deployment check.
- No secrets are attached. No existing secret values were read or copied.
- Shared budget database: the beta's existing D1 database, so search limits stay shared (10/day, 100/month). No usage counters were reset.
- Public beta was not redeployed.

## Reproducible build

Installed and pinned `@cloudflare/puppeteer` 1.4.0 and Wrangler 4.151.1, with the npm lock file. From `workers/pilot`, run `npm ci --ignore-scripts` and `npm run check`. The checked build was 1821 KiB uncompressed / 376 KiB gzipped.

`wrangler.jsonc` contains non-secret configuration. The founder email is a server-side `ACCESS_TEST_EMAIL` variable, intentionally omitted here. Preserve it on updates with `wrangler deploy --keep-vars`; a missing email fails authentication closed. The current Access AUD is specific to the pilot application, not the old trial.

## Still required before live research

1. Confirm the account's current Workers plan and available Browser Run allowance. The connector can read Worker and Access configuration, but its billing-subscription request returned authentication error 10000. This does not mean the whole Cloudflare connection failed.
2. Authenticate on the pilot URL with the founder account. This has not been tested as the user; anonymous protection alone is not a successful authorized session.
3. Set a small browser allowance after step 1, run the real SPEA filtering flow and inspect diagnostics; selectors and CDN compatibility remain untested live.
4. Save the Brave key directly to this Worker when search is needed. Attaching it must not change the existing search caps.
5. When API credit and model access are ready, save the OpenAI key directly as a Worker secret, configure confirmed rates and the shared money limits, set the provider hard cap, then enable the pilot on one consenting test device.

No plan upgrade, payment, API-credit purchase or provider activation was performed.

## Update, 18 Oct 2026 (Cleo): web evidence and higher pilot limits. Built, not deployed

The founder approved two changes: labelled non-official sources in answers, and 50 searches a day for the private pilot only. See `docs/research-web-evidence.md`.

`wrangler.jsonc` now sets these pilot-only values:

- `SEARCH_POOL=pilot`, with 50 searches a day and 1,000 a month on the pilot's own counters. The beta keeps its 10 a day and 100 a month.
- 8 searches, 32 page reads and 12 steps per question.
- `SPEA_DIRECTORY_FEED=1`.

To make it live (Ina, or whoever has Wrangler access):

1. Pull the latest code. In `workers/pilot`, run `npm ci --ignore-scripts`, then `npm run check`.
2. **Attach the Brave key to the pilot Worker:** `wrangler secret put BRAVE_SEARCH_API_KEY`. Paste it only into that prompt, never into chat or files. Without it the pilot can't search the web at all, which is part of why the 18 Oct answer only had SPEA's first page.
3. `wrangler deploy --keep-vars`, which keeps `ACCESS_TEST_EMAIL`.
4. Sign in on the pilot URL as the founder and ask "Find British curriculum schools in Sharjah".
   - Expected: SPEA's complete list of 27, 8 at a time, from the data feed.
   - Then ask "British curriculum schools in Dubai". Expected: website and listing-site results, labelled.

The public beta isn't redeployed. `OPENAI_PILOT` and `BROWSER_DIRECTORY` stay at 0.
