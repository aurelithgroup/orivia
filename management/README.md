# Owner dashboard integration contract

This branch adds `management/owner-dashboard.html` as an isolated Owner management UI. It is **not** wired into production navigation or deployed. The existing production management app must provide a verified authenticated entrypoint and endpoint before launch.

## API

`GET /api/owner/overview?range=7d|30d|90d`

- Authenticate the request on the server; return 401 for unauthenticated sessions.
- Verify the authenticated principal has the **platform owner** role; return 403 otherwise.
- No role override via client parameters or request headers.
- Return only aggregate statistics and organisation commercial information. No member names/emails, chat text/transcripts, files, messages or individual student progress.
- Disable caching (`Cache-Control: private, no-store`). Limit and audit access server side, excluding response payloads from logs.
- Enforce aggregation suppression at the data source (recommended minimum cohort >=10, no drill-down paths that reveal a person).
- Use organisationSummaries only for partner commercial records: public/contract name, plan, contract status. It must **never** derive its rows from membership.
- Return numbers only when verified; otherwise omit the metric or use null. Never generate demo figures on production dashboards.

Example shape (nulls mean metric unavailable; example deliberately includes no invented results):

```json
{
  "visibility": "owner_aggregate",
  "asOf": null,
  "currency": "GBP",
  "metrics": {
    "users": null,
    "organisations": null,
    "revenue": null,
    "expenses": null,
    "feedbackPercent": null,
    "budgetPercent": null
  },
  "growth": [],
  "regions": [],
  "budgetCategories": [],
  "organisationSummaries": [],
  "analyticsSummary": null,
  "feedbackSummary": null
}
```

`growth`: array of `{label: string, value: nonnegative number}`; `regions` and `budgetCategories`: array of `{label: string, percent: number 0..100}`.

The browser-side `visibility` guard validates response shape **only**. It is not authentication or authorisation. Server access control is mandatory.

## Release checklist

1. Locate authoritative production frontend source and route structure. Do not swap the existing visitor journey app.
2. Integrate this screen behind authenticated Owner navigation.
3. Implement Owner-scoped backend endpoint using only approved aggregate tables/materialised summaries.
4. Test 401 unauthenticated, 403 student/organisation admin, and 200 Owner responses.
5. Assert responses cannot include user/member records, chat bodies, files or student progression data; verify low-cohort suppression.
6. Test date filtering and metric arithmetic against known fixtures.
7. Mobile, keyboard, reduced-motion and screen-reader smoke tests.
8. Deploy to the pilot/staging environment first, verify, then promote deliberately.

Status: **frontend committed; backend and production integration pending**.
