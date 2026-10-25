# Task 4 — Live acceptance gate (2026-10-25)

## Verified
- Cloudflare inventory includes orivia-research-pilot, orivia-production and orivia-api.
- Latest research pilot deployment: 2026-10-23T09:43:18Z (Candidate 9); predates Task 2/3 development branches.
- Latest production deployment: 2026-10-22T15:31:12Z. No deployment changed during this review.
- GitHub full regression suite 83/83 successful: https://github.com/aurelithgroup/orivia/actions/runs/40182203006
- Pilot Worker dry-run successful: https://github.com/aurelithgroup/orivia/actions/runs/40182329897
- Public web retrieval could not access the URLs; this does not establish a site outage.

## Live acceptance NOT completed
- Task 2 and 3 changes are not on the current deployed pilot.
- Authenticated owner/member browser acceptance, D1 pilot migration, rollback and real-device smoke tests have not been run.
- No payment processing, sponsorship delivery or autonomous AI spending was enabled.

## Required go/no-go gates
1. Build reviewed Task 2+3 branch for isolated pilot and verify D1 bindings, rollback point and flags.
2. Deploy exclusively to the pilot, with captured commit hash and deployment ID.
3. Run actual owner lifecycle: founder draft; sponsor draft; review; approve; expiry; withdraw; audit; concurrency.
4. Run active-member, unrelated-member and signed-out denial tests; verify no paid placements in cited facts or ranking.
5. Verify UAE and UK journeys, desktop and phone layout, preservation of existing data, console logs and rollback.
6. Save redacted evidence and explicit go/no-go decision.

Outcome: NO-GO for live release until tested against a deployed candidate. Automated development tests have passed.
## Additional deployment preflight (2026-10-25)
- Cloudflare settings read-only inspection confirmed pilot ACCOUNTS_DB id 8cd85061-ce42-4fa7-8dd7-a4b01f36800a, production ACCOUNTS_DB id 3ebd10d5-01e5-4a01-b846-977f1bb2d5b3. Separate pilot and production R2 buckets confirmed.
- BUDGET_DB is shared across environments. Spending caps and counters must be preserved; do not reset them.
- Pilot flags show ACCOUNTS_ENABLED=1, ORGANISATIONS_ENABLED=1, OPENAI_PILOT=1, BROWSER_DIRECTORY=0, NOTIFICATION_SCHEDULER=pilot. These existing flags were read but not changed.
- The documented release procedure requires wrangler deploy --keep-vars to retain account-specific settings; replacing the Worker through the API without a verified bundle and retained bindings could disrupt founder sign-in.
- **Blocker:** there is no authenticated browser-based acceptance evidence for the new branch, and the GitHub build runs were dry-run only. No safe pilot release method was actually executed from this session. Production and pilot deployments unchanged.
- Task 4 remains NO-GO until a dedicated pilot release and live acceptance runs are evidenced.
