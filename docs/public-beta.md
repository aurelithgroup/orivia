# Public beta: deploying the new Orivia for everyone

The public beta is the **same code** as the private AI trial (`workers/orivia-ai-private-trial.mjs` and its modules), deployed as a **second Worker** with public mode switched on. The private trial stays exactly as it is for testers.

In public mode there is no tester sign-in. Instead:
- a one-time **"I'm human" check** (Cloudflare Turnstile), then a signed 12-hour cookie;
- a **per-person daily message limit**. People are told apart by a salted hash of their network address that changes every day; the address itself is never stored;
- the **overall daily cap**.

If any required setting is missing, every page answers "Public beta is not configured yet" (it fails closed).

## Steps (Cloudflare dashboard)

1. **Turnstile:** Turnstile → Add widget. Hostname: the beta Worker's address (for example `orivia-beta.habeebahsallah27.workers.dev`). Mode: Managed. Keep the **site key** and the **secret key**.
2. **Database:** D1 → create `orivia-beta-budget`, so the beta doesn't use up the testers' daily cap. Its tables are created automatically on first use.
3. **Worker:** create `orivia-beta` and upload the same modules as the private trial.
4. **Bindings:**

   | Binding | Type | Value |
   | --- | --- | --- |
   | `AI` | Workers AI | (default) |
   | `AI_QUOTA` | Rate limiting | e.g. 10 requests per 60 seconds (now counted per person) |
   | `BUDGET_DB` | D1 | `orivia-beta-budget` |

5. **Variables and secrets:**

   | Name | Kind | Value |
   | --- | --- | --- |
   | `PUBLIC_BETA` | Variable | `1` |
   | `PUBLIC_HOST` | Variable | the Worker's address, without `https://` |
   | `TURNSTILE_SITE_KEY` | Variable | site key from step 1 |
   | `TURNSTILE_SECRET` | Secret | secret key from step 1 |
   | `SESSION_SECRET` | Secret | a random string of 32+ characters |
   | `PERSON_DAILY_CAP` | Variable | `15` (messages per person per day) |
   | `DAILY_CAP` | Variable | `60` on the free plan; `150` once Workers Paid is on |

6. **Do not** put Cloudflare Access in front of the beta Worker (that's what makes the trial private).
7. Send Cleo the beta address. The "Try the new Orivia (beta)" button then goes on the public site.

## Why those limits

Workers AI's free allowance is **10,000 neurons a day per Cloudflare account**, shared by every Worker on it. One chat message uses roughly 140 neurons (about 3,000 input and 300 output tokens on Llama 3.3 70B), so the free allowance is **about 70 AI messages a day across the trial and the beta together**. Questions Orivia asks herself (trip questions, visa check-ups) don't use the AI and don't count.

- On the free plan, keep `DAILY_CAP` at about 60. Beyond the allowance, AI requests fail until the next day.
- With **Workers Paid ($5 a month)**, extra use costs $0.011 per 1,000 neurons, so 150 messages a day costs roughly an extra $0.12 a day.
- The private trial's cap is currently 200. For Tuesday's testers, that only works with Workers Paid switched on; otherwise messages stop after roughly 70 in a day.

Tests: `node --experimental-sqlite tests/public-beta.test.mjs`.
