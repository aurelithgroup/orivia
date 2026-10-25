# Owner analytics — database-backed implementation plan

This document records confirmed schema availability from Cloudflare production D1 on 2026-10-25. It contains **no personal data**.

## Available sources

- `ACCOUNTS_DB.user`: platform account count and account creation timestamps. Do not return rows, names, IDs, or emails.
- `ACCOUNTS_DB.organisations`: organisation counts, status, demo flag and created_at. Existing authenticated Owner route `GET /api/admin/orgs` returns administrative organisation records.
- `BUDGET_DB.beta_usage`: daily call counts (contains `who` identifiers; **never** return or group by `who`).
- `BUDGET_DB.research_usage`: aggregate call counters by period.
- `BUDGET_DB.spend_meter`: day and month estimated spending counters. Units must be confirmed in the deployed implementation before rendering money values.

## Not available as verified dashboard figures

- Company revenue, invoicing, salaries, expenses beyond partial model usage, allocations, and budget utilisation.
- Anonymised Chat feedback satisfaction distribution.
- Unique monthly active users: account registrations are not active users.

The Owner dashboard must distinguish **registered accounts** from **monthly active users**, **AI usage spend** from full company operating expenses, and **demo organisations** from signed partners.

## Proposed server endpoint

`GET /api/admin/analytics?range=7d|30d|90d`

Requires the existing server-side platform Owner role check used for `/api/admin/orgs`; never trust a role supplied by the browser.

Respond with `Cache-Control: private, no-store` and an explicit `dataAvailability` map. Counts can be sourced from the two existing D1 bindings. Return no identifying rows. Budget values should be null until metering units and completeness are confirmed.

Example safe SQL queries:

```sql
SELECT COUNT(*) AS registered_accounts FROM user;
SELECT COUNT(*) AS all_organisations,
       SUM(CASE WHEN demo = 1 THEN 1 ELSE 0 END) AS demo_organisations,
       SUM(CASE WHEN demo = 0 THEN 1 ELSE 0 END) AS non_demo_organisations
FROM organisations;
SELECT day, SUM(calls) AS calls
FROM beta_usage
WHERE day >= ? AND day <= ?
GROUP BY day ORDER BY day;
```

Use D1 prepared statements for parameters. Return only aggregate daily counts. Suppress filtered chart cells below a minimum threshold, and disallow filtering that permits differencing/inference about specific users. Business financial data must be backed by verified commercial records before display.

## Production integration

The Cloudflare production Worker contains a bundled implementation of `ownerView()` on `/manage`. The accessible GitHub branch contains an older frontend and **not the authoritative source of this deployed management application**. Do not overwrite the production Worker or invent an alternate login route. Reconcile the production source first, then insert the existing Midnight Executive Owner UI and the new API alongside existing organisation creation and invitation controls.

Status: **data inventory verified; analytics endpoint not deployed; production UI not integrated**.
