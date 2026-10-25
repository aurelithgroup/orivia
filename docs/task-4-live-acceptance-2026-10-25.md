# Task 4 — Pilot deployment and live acceptance (25 October 2026)

**Acceptance INCOMPLETE. No sign-off.** The candidate is deployed only to the protected research pilot. Authenticated owner and member browser acceptance remains blocked by sign-in.

## Deployment evidence

- Repository: `aurelithgroup/orivia`; branch: `ina/founder-ai-sponsorship-block-3-2026-10-25`.
- Built source: `53be6bd0844b246c8684cad8b6e00e682d3bf778`, clean tracked checkout.
- Worker: `orivia-research-pilot`.
- Version: `952807c4-06ca-4edd-9ec2-0ccc8af47b11`.
- Serving deployment: `8a87c1fd-1bfa-41bf-8d10-eb753086f183`, 100%, confirmed by Cloudflare API readback.
- Deployed: 2026-10-25 11:19:59 UTC / 15:19:59 Dubai.
- Bundle SHA-256: `a9b501f4515ad2598723eeddcf6f17aa392763996e7292b8e37994d3fe976489`.
- Cloudflare startup validation: 55 ms.

Wrangler CLI had no authenticated session. The Cloudflare connector uploaded the locally compiled module through the version API with `bindings_inherit=strict`, inheriting every live binding by name. The latest version was checked before upload, the uploaded resources were inspected, and the current deployment was checked again before changing pilot traffic. No force override was used.

All **59 bindings exactly matched** before and after deployment, including secret references, email configuration, Access settings, rate limit, provider flags and budgets. Secret values were neither read nor replaced. The existing compatibility date was retained; the branch's `enable_request_signal` flag was added alongside `nodejs_compat`.

Pilot accounts D1 and R2 remain separate from production. The budget D1 is shared; no limits were raised and no counters were reset. No payment integration was enabled.

Production settings were read back unchanged. Production deployment remains `773c9f0e-5baf-4175-bf3c-ee02bdb13f4b`, version `b9e32ffc-e13d-4c5b-85cf-d7cbdf4a3f94`. There were no production writes.

## Actual verification

| Check | Result |
| --- | --- |
| Targeted founder/sponsorship local regression | PASS |
| Complete local workflow commands | PASS: 133, failures: 0 |
| Wrangler pilot dry-run compilation | PASS |
| Uploaded version bindings and runtime readback | PASS |
| Serving pilot deployment readback | PASS |
| Production settings/deployment preservation | PASS |
| Anonymous browser access | Access sign-in gate observed |
| Authenticated owner browser lifecycle | BLOCKED |
| Authenticated member/unrelated-member browser | NOT RUN |
| Live expiry, withdrawal, audit and concurrency | NOT RUN |
| UAE/UK journeys; desktop/phone live layouts | NOT RUN |
| Live runtime D1 migration and account-data preservation | NOT VERIFIED |
| Real-device smoke and live rollback drill | NOT RUN |

The browser reached Cloudflare Access and then Cloudflare sign-in. The secure authentication request returned `submitted` with Google selected; this does **not** prove login success. Automatic approval review then denied observation of `accounts.google.com`, stating that the separate Google authentication origin lacked approval. No alternate route, forged session, role grant or security bypass was attempted. Explicit approval for that sign-in origin is needed to continue.

The founder feature on this branch consists of reviewed draft briefs, not autonomous model execution. The member sponsorship endpoint has no dedicated placement renderer on this branch. Local API tests do not establish visible sponsor delivery or live acceptance.

## Rollback capability

Previous serving version `e055308c-3db8-4e87-8d33-09b645e92e99` was retained and successfully read back after deployment. Previous deployment was `b2c548c4-c258-4de1-876d-a96e8cdf3806`.

To revert code, create a deployment on **orivia-research-pilot only** with strategy `percentage` and versions `[{"version_id":"e055308c-3db8-4e87-8d33-09b645e92e99","percentage":100}]`, then read back the serving deployment and bindings. Do not change routes, secrets, database bindings or production.

Pilot D1 pre-deployment Time Travel bookmark: `00000033-00000002-0000510e-fac9740be4746e4c21939dab6734ced0`. Schema-only inspection was performed. No database restore was performed. A database restore is a separate operation that can discard newer data; routine code rollback must not restore D1 automatically. The new workflow tables are additive, but actual remote initialization and old-version compatibility have not yet been exercised.

## Remaining acceptance gate

Complete normal Access and account sign-in, verify actual owner/member roles, and use clearly labelled disposable pilot records for the owner draft/review/approval/withdrawal, stale revision/concurrency, expiry, member eligibility and unrelated-member denial checks. Verify audit, journey behaviour, layouts and console errors; inspect runtime D1 initialization and existing data. Record each actual result. A failed or blocked check keeps acceptance incomplete.

Machine-readable receipts: [live deployment and acceptance](evidence/task-4-live-2026-10-25.json), [all local workflow commands](evidence/task-4-local-regression-2026-10-25.json).
