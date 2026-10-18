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
