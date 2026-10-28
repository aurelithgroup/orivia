# Running costs against AED 250 a month (Cleo, 28 October)

AED 250 ≈ **$68.07** (AED 3.6725 = $1).

**Sources:**
- **Usage:** read-only `SELECT` queries on the shared budget database (`orivia-beta-budget`, `bd521420`) on 28 October. Nothing was written.
- **Caps:** the configured limits in `workers/pilot/wrangler.jsonc` and `workers/production/wrangler.jsonc`.
- **Invoices:** I can't see any billing pages or invoices. Every fixed cost is therefore marked **[FOUNDER: from the invoice]**.

## What Orivia's own meters recorded, 1–28 October

| Meter | Recorded | AED | Notes |
|---|---|---|---|
| OpenAI (pilot + production, voice included) | **$5.50** | 20.21 | 502 calls. Estimated from tokens at $2 / $10 per 1M (rates confirmed 18 Oct) |
| of which natural voice | $0.12 | 0.44 | 8 calls, all on 22 Oct. Voice reserves on its own meter **and** the OpenAI meter, on purpose (`orivia-voice.mjs:91`), so it isn't added again |
| Browser rendering | 134 s | — | 18 Oct only. Now switched off on both Workers (`BROWSER_*_SECONDS=0`) |
| Brave searches | 246 pilot + 35 public | — | Counted by `research_usage`; the cost depends on the Brave plan |

How to read the OpenAI figure:
- **It's an upper estimate, not the invoice.** 9 calls with an uncertain outcome and 2 still reserved are counted at their full reservation ($0.48 between them). The OpenAI invoice should be the same or lower.
- **By day:** 18 Oct $2.95, 19 Oct $0.81, 20 Oct $0.23, 21 Oct $0.17, 22 Oct $1.19, 23 Oct $0.12, 28 Oct $0.04.
- **Since the hold:** 4 calls on 28 October, during the deployment hold. Production is public, so they're probably ordinary use. The meters don't record which Worker made each call.

## Ceilings already enforced in code

| What | Cap | Worst case a month | AED |
|---|---|---|---|
| OpenAI, all of Orivia together (voice included; one shared meter) | $5/day, $20/month | $20.00 | 73.45 |
| Natural voice (inside the OpenAI cap) | $1/day, $5/month | (inside the above) | — |
| Brave searches | pilot 150/day, 1,000/month; public 10/day, 100/month | up to 1,100 queries | [FOUNDER: Brave plan price] |
| Sign-in emails | 10/day, 100/month | 100 emails | [FOUNDER: Cloudflare Email Sending price, if any] |
| Browser rendering | off | $0 | 0 |

The caps fail closed: if a limit isn't configured, nothing is spent. They're shared across the pilot and production through one database, so the pilot can't spend beyond them either.

## Costs the meters can't see

| Item | Cost a month | Note |
|---|---|---|
| Cloudflare plan (Workers, D1, R2, Workers AI) | **[FOUNDER: from the invoice]** | The backup provider (Workers AI) and the storage and database usage beyond any included amount are billed by Cloudflare, not metered by Orivia |
| Domain `myorivia.app` (yearly ÷ 12) | **[FOUNDER]** | |
| Sign-in sender domain `auth.aurelithgroup.org` | **[FOUNDER]** | If it's billed separately |
| Brave Search API plan | **[FOUNDER]** | It may be free at this volume. Check the plan's included queries against 1,100 a month |
| R2 backup for files (proposed, not switched on) | **[FOUNDER decision]** | It would add storage cost, and deleted files would then persist in the backup |

## Where that leaves AED 250

- **This month's metered spend:** about **AED 20** of OpenAI.
- **The worst a month can cost for OpenAI:** **AED 73.45**, given the caps.
- **Left for everything else:** at least **AED 176.55** (≈ $48) within AED 250, for Cloudflare, the domain, Brave and email. Whether it fits depends on those invoices.
- **Busier months:** a rehearsal-heavy month (week 7 to week 8) is still bounded by the same $20 OpenAI cap. Demos can hit the $5/day cap, though: on 18 October testing used $2.95 in one day.

## Suggested next steps (not changed)

1. **Fill in the five [FOUNDER] figures** from the invoices. That turns this into a full monthly total.
2. **Before demo days,** consider whether $5/day is enough for the rehearsal days. Raising it is a founder decision and changes production settings, so it waits for the hold to lift.
3. **Record which Worker made each call** (pilot or production) in the spend ticket. That separates demo testing from public use. It's a small schema change, so it's for after the hold.

Nothing here changes limits, settings, payments or production.
