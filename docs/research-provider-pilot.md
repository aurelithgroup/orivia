# Research provider pilot — preparation, not activated

Decision: start with available free allowances; no billing changes have been made. The proposed $25/month total is a planning budget, not an enforced cap or a subscription purchased here.

`workers/orivia-openai-pilot.mjs` prepares the Responses API transport for `gpt-6.1-sol`. It implements the existing `AI.run` interface for research understanding and planning. It is deliberately not imported by the public Worker. Ordinary chat stays on its current provider; Luna routing remains a later task.

The transport requires an explicit off-by-default pilot flag, a server-side secret, provider consent, and an injected budget implementation. Six attempts per turn, bounded input/output/response size, no retries, no redirects, no provider-body logs, `store:false`. Incomplete output is rejected; existing understanding/action validators must still run. `store:false` is not a zero-retention guarantee.

## Cleo implementation, Ina review and deployment

1. Implement a durable atomic money ledger (D1 or Durable Object), shared across concurrent requests. `reserve` must reserve the conservative maximum input/output charge before dispatch; `record` persists usage. Keep reservations on uncertain outcomes. No in-memory counter may serve as the account-wide money limit. Confirm current model rates and include reasoning output. Provider hard project limits provide another layer; a budget alert alone is insufficient.
2. Connect this transport only on a private test route, after consent explicitly names OpenAI. Inject it into understanding and planning together. Do not change shared `env.AI` globally or send existing users to a new provider under their old consent. Do not turn on `OPENAI_PILOT` in the public deployment.
3. Add the browser directory tool independently. Prefer the regulator's public data endpoint if accessible; otherwise use Browser Run within the free allowance. Apply the requested filter, wait until the actual cards have loaded, deduplicate links, and compare cards with the displayed filtered total. A counter changing ahead of the results must not establish completeness. Directory membership alone does not confirm Year 6 or seats.
4. Browser tool: only observed approved regulator pages/actions, read-only public browsing, strict host checks including navigation, bounded time/actions, close sessions in `finally`. Never send raw chat or identity documents to the browser tool. Report partial results honestly on timeouts or exhausted allowance.
5. Test the same conversations against the existing provider and the pilot: discovery, all/more, a named organisation, a correction, contacts, comparison, source failures and exhausted budget. Include organisations beyond SIPS. Record aggregate tokens, searches, browser seconds, time and success; label scripted fixtures and real runs distinctly.
6. Review long-list delivery: the UI reply length and organisation-card limits must not silently hide results from a complete directory. Preserve source-backed pagination and evidence.

## Setup needed before a real model run

- Owner creates/selects an OpenAI API project and checks available credits and model access. ChatGPT subscription billing does not establish API credits. No trial credit is assumed.
- Save its API key directly as Cloudflare's `OPENAI_API_KEY` secret. Never paste it into chat, source code or a fixture. Do not read the existing secrets.
- Confirm provider hard spend limit and automatic top-up settings before paid runs. Do not enable Workers Paid to begin offline development.
- Check actual Cloudflare Browser Run and Brave allowances on the owner's account before running tests; published free allowances are not proof of unused credit.

## Validation so far

Offline transport tests only: provider/consent/budget gates; request format; no automatic retries; six-call ceiling; usage accounting without prompts; denied budget; 429; incomplete response; failed ledger write; oversized input. No live OpenAI call, browser adapter, durable money ledger, consent change or public deployment has happened.

Official references (checked 18 October 2026):
- https://developers.openai.com/api/docs/guides/text
- https://developers.openai.com/api/docs/models/gpt-6.1-sol
- https://developers.openai.com/api/docs/guides/spend-limits
- https://developers.cloudflare.com/browser-run/limits/
- https://developers.cloudflare.com/browser-run/pricing/

## Implemented by Cleo, 18 Oct 2026. Not activated; for Ina's review

Everything below is off by default, offline-tested only, and not deployed.

### 1. Shared money ledger: `workers/orivia-spend-ledger.mjs`

- **Storage:** D1 (`BUDGET_DB`), in the tables `spend_meter` and `spend_ticket`. Each reservation is one atomic `INSERT … ON CONFLICT DO UPDATE … WHERE (day and month fit) RETURNING`, so concurrent requests can't overspend together. No in-memory counter is involved.
- **Fails closed:** nothing is reserved without both limits and both confirmed rates.
- **Settling:** known usage settles to the actual cost (refunding only the unused part, and charging any overrun). Unknown, timeout or HTTP-error outcomes keep the full reservation. Settling is idempotent, and a refund made after midnight goes back to the ticket's own day.
- **OpenAI cost bound:** `(inputBytes + 64) × input rate + max_output_tokens × output rate`. Reasoning tokens count as output and sit inside `max_output_tokens`.
- **Settings:** `OPENAI_INPUT_USD_PER_M`, `OPENAI_OUTPUT_USD_PER_M`, `PILOT_OPENAI_DAY_USD`, `PILOT_OPENAI_MONTH_USD`.
- **Rates:** a third-party page quotes $2 / $10 per 1M tokens for gpt-6.1-sol. **Please confirm on OpenAI's own pricing page before setting these.**
- **Browser meter:** milliseconds, set by `BROWSER_DAY_SECONDS` and `BROWSER_MONTH_SECONDS`.
- **Privacy:** tickets store amounts, status and time only.

### 2. Private pilot Worker: `workers/orivia-research-pilot.mjs`, with `workers/pilot/` as its entry and example config

- **Separation:** it wraps the private trial through a new `createTrialWorker(hooks)` export. The public file never imports the pilot, the transport, the ledger, the browser code or puppeteer (a test checks this), and the hook is ignored when `PUBLIC_BETA=1`.
- **When OpenAI is used:** OpenAI handles research **understanding and planning together** (`runAgentTurn({ai})`) only if all of these hold:
  - `OPENAI_PILOT=1`;
  - the tester ticked the Settings switch, whose text names OpenAI (consent version `openai-research-pilot-v1`), on this device;
  - rates and limits are configured.

  In every other case the existing provider is used. Ordinary chat and `env.AI` are untouched.
- **Order of checks:** auth, quota and daily caps still run first.
- **Consent offer:** `/v1/config` adds `providerPilot` (fixed text, no key, no limits) only when the pilot is available.

### 3. Browser directory: `workers/orivia-browser-directory.mjs`

See `docs/browser-directory.md`. It has its own switch (`BROWSER_DIRECTORY=1`), needs the `BROWSER` binding and a browser allowance, and is plugged in as SPEA's `listFiltered`. The agent now accepts partial listings honestly and counts browser time in its metrics.

### 4. Comparison harness: `tools/provider-comparison.mjs`

- **Rows:** label, provider, conversation, success, status, model calls, tokens, searches, fetches, browser seconds and time. Rows hold no prompts, replies or names.
- **Labels:** `scripted` and `live` can't be mixed.
- **Test:** `tests/provider-comparison.test.mjs` runs 9 conversations × 2 providers:
  - discovery, all (complete listing), more, a named organisation, a correction, contacts, comparison, source failure and exhausted budget;
  - schools beyond SIPS: Wes Green, Victoria English and synthetic schools.

### 5. Long lists

- **Paging:** complete lists come 8 at a time. The rest are queued, and "more" re-opens the regulator records. Each page says "shown N of T", and the last one says "That's all T".
- **Limits raised:** stored assistant replies go from 2,000 to 4,000 characters. The task context goes from 8,000 to 16,000 characters on the client, and the request body from 32,000 to 48,000 on the server. The queue holds 48 entries and the shown list 60.

### Ina: setup before any real run (in order)

1. Pull and review. Optionally run the CI commands locally.
2. Check SPEA's Network tab for a public data endpoint (see `docs/browser-directory.md`).
3. Create the pilot Worker from `workers/pilot/wrangler.example.toml` with its own name. Copy the private trial's bindings and Access settings. Run `npm install --save-exact @cloudflare/puppeteer` in `workers/pilot/`.
4. Save the key with `wrangler secret put OPENAI_API_KEY` (never in chat or files). Confirm the provider's hard spend limit and that automatic top-up is off.
5. Set the confirmed rates and small limits, for example a day limit of $0.50 and a month limit of $5 (well under the 250 AED budget), plus `BROWSER_DAY_SECONDS=300`. Keep the search caps at 10 a day and 100 a month.
6. Turn on `BROWSER_DIRECTORY=1` first and run "All British curriculum schools in Sharjah".
   - If `diagnostics.steps` shows `not-found`, adjust the label.
   - If `blockedHosts` lists a CDN, review that host before adding it.
7. Then turn on `OPENAI_PILOT=1`, tick the consent switch on one test device, and run the comparison conversations live. Label those rows `live`.

### Review fixes, 18 Oct 2026 (Ina's review of a3c9f2e)

- **Pilot URL.** The shared handler now serves `PRIVATE_HOST` when it is set to a valid hostname, otherwise the original private host. The example config sets `orivia-research-pilot.habeebahsallah27.workers.dev`. Tests call that exact URL and check that the old host, a missing `PRIVATE_HOST` and a malformed value all get 404. Cloudflare Access still has to cover the new hostname.
- **Late browser launch.** A launch that finishes after the timeout is now closed as soon as it arrives. The reservation settles to the time used only once closure is confirmed. If the browser is still pending after the grace period (5 s), or its close fails, the full reservation is kept and it is still closed whenever it arrives.
- **Consent accuracy.** When the pilot provider is used, the understanding request no longer contains `profileCity`. The task's place goes to the model only if the person wrote it in this chat, and the planning view leaves out a place that came only from About me. The code still uses the profile locally to validate the location. The wording now says exactly what is sent (recent messages in this chat, up to 10, plus public pages found) and what isn't (About me including city, documents, calendar, journeys). The consent version is now `openai-research-pilot-v2`, so earlier ticks don't carry over.
- **Completeness.** A listing counts as complete only when `complete === true`. A missing, null, string or numeric flag doesn't count (regression test in `tests/browser-directory.test.mjs`).
