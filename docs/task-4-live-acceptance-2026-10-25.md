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