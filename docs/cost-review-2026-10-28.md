# Running costs against AED 250 a month (Cleo, 28 October; corrected 29 October)

AED 250 ≈ **$68.07** (AED 3.6725 = $1).

**Sources:**
- **Usage:** read-only `SELECT` queries on the shared budget database (`orivia-beta-budget`, `bd521420`) on 28 October. Nothing was written.
- **Caps:** the configured limits in `workers/pilot/wrangler.jsonc` and `workers/production/wrangler.jsonc`.
- **Invoices:** none were available to me. Every invoice amount below is **unknown** until the founder supplies it.

## 1. What Orivia's internal meter recorded, 1–28 October

| Meter | Internal estimate | AED | Notes |
|---|---|---|---|
| OpenAI (pilot + production, voice included) | **$5.50** | 20.21 | 502 calls, estimated from token counts at $2 / $10 per 1M (rates confirmed 18 Oct) |
| of which natural voice | $0.12 | 0.44 | 8 calls, 22 Oct. Already inside the OpenAI figure (voice reserves on both meters on purpose, `orivia-voice.mjs:91`), so it isn't added again |
| Browser rendering | 134 s | — | 18 Oct only; now off on both Workers. Billed inside the Cloudflare invoice (section 3) |
| Brave searches | 246 pilot + 35 public | — | Counted by `research_usage`; the price depends on the Brave plan (section 3) |

**$5.50 is the internal meter's estimate, not the invoice and not a guaranteed upper bound on it.**
- **Why the invoice could be lower:** 11 calls whose outcome wasn't confirmed are counted at their full reservation ($0.48).
- **Why it could be higher:**
  - the provider's own token counting, pricing changes or taxes;
  - any use of the same OpenAI key outside Orivia's meter.

**Daily estimates:** 18 Oct $2.95, 19 Oct $0.81, 20 Oct $0.23, 21 Oct $0.17, 22 Oct $1.19, 23 Oct $0.12, 28 Oct $0.04.

**Calls on 28 October, during the hold:** 4. **Origin unknown.** The meter doesn't record which Worker or key made a call, so there's no evidence they came from production, the pilot or anywhere else.

## 2. Ceilings enforced in code

| What | Cap | Most a month can reach on the meter | AED |
|---|---|---|---|
| OpenAI, all of Orivia together (one shared meter; voice inside) | $5/day, $20/month | $20.00 | 73.45 |
| Natural voice (inside the OpenAI cap) | $1/day, $5/month | inside the above | — |
| Brave searches | pilot 150/day, 1,000/month; public 10/day, 100/month | up to 1,100 queries | price unknown |
| Sign-in emails | 10/day, 100/month | 100 emails | price unknown (part of the Cloudflare invoice if sent through Cloudflare) |
| Browser rendering | off | 0 | 0 |

**What the caps cover:** they limit what Orivia's own code reserves. They fail closed, so with no limit configured nothing is spent.

**What they don't cover:** they don't limit the invoice for use the meter doesn't see.

## 3. Charges by service, each counted once

| Service | Billing | Invoice amount | Monthly equivalent | Covers, so not counted again |
|---|---|---|---|---|
| OpenAI | monthly, by use | **unknown** | unknown | Chat, research, documents, natural voice |
| Cloudflare | monthly (plan plus usage) | **unknown** | unknown | Workers, Workers AI (backup provider), D1, R2, Browser Rendering, Email Sending, Turnstile, Access |
| Brave Search API | monthly (plan) | **unknown** | unknown | All searches, pilot and public |
| Domain `myorivia.app` | **yearly** | **unknown** | yearly ÷ 12 | The domain only. If it's registered through Cloudflare, it's billed apart from the plan and still listed only here |
| Sender domain `auth.aurelithgroup.org` (parent `aurelithgroup.org`) | **yearly**, if billed separately | **unknown** | yearly ÷ 12 | The domain only. Leave it out if it's billed elsewhere for another purpose |

**Totalling:** monthly services add up as they are, and each yearly domain is added as one twelfth of its charge. No service appears in two rows.

## 4. Where that leaves AED 250

- **This month:** the internal estimate for OpenAI is about **AED 20**.
- **The OpenAI cap:** at most **AED 73.45** a month on the meter.
- **AED 176.55** (≈ $48) is **what the budget has left before the other costs**: Cloudflare, Brave, and the domains' monthly equivalents. It's **not** confirmed spare capacity. Whether Orivia fits in AED 250 is unknown until the invoice amounts in section 3 are in.
- **Rehearsal days:** they're bounded by the same caps, but can hit the $5/day limit (testing used $2.95 on 18 October).

## 5. Still to do (nothing changed here)

1. **Fill in section 3** from the invoices. Mark each "monthly" or "yearly ÷ 12".
2. **Daily cap on demo days:** consider whether $5/day is enough for rehearsals. Raising it is a founder decision that changes production settings, so it waits for the hold to lift.
3. **Record which Worker made each call** in the spend ticket, so testing and public use can be told apart. That's a schema change, so it's for after the hold.
4. **File backup:** the decision is pending; see `docs/backup-proposal-2026-10-29.md`.

Nothing here changes limits, settings, payments or production.
