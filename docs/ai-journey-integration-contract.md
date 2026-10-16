# Orivia ↔ journey API integration contract (development)
Owner: Ina (AI adapter) / Cleo (journey data endpoints). Branch: `feature/proactive-requirements`.
This is the **proposed minimal exchange format** awaiting confirmation from Cleo, not a claim that the API currently supports these paths.

## Scope and security
- Publicly non-sensitive, approved journey templates only. No user records, organisation analytics, private contacts, admin permissions or secrets in the response.
- The private AI Worker calls the API server-to-server after its existing Cloudflare Access checks. Do not reuse a user's browser identity as API administrator credentials.
- Do not expose arbitrary URL fetching, accept model-provided API paths, or allow writes without a separately confirmed user action.
- Every step's source must be a reviewed official HTTPS URL; `checkedAt` is a source review date, **not** a claim of live verification.
- No changes to `main` or the existing `orivia-api` team authorisation.

## Minimum response document
```json
{
  "id": "student-residence-visa",
  "title": "Student residence visa and Emirates ID",
  "description": "University newcomer process; apply only after eligibility is established",
  "checkedAt": "2026-10-16",
  "steps": [
    {
      "id": "contact-institution",
      "title": "Confirm what your university will manage",
      "source": {"url": "https://u.ae/", "checkedAt": "2026-10-16"}
    }
  ],
  "checkups": [
    {
      "id": "residency-situation",
      "question": "Are you already a UAE resident?",
      "options": [
        {"value": "resident", "label": "Yes"},
        {"value": "new-arrival", "label": "Not yet"},
        {"value": "not_sure", "label": "I'm not sure"}
      ]
    }
  ]
}
```
**All sample text and URLs above are contract examples, not verified procedural guidance.**
- A `checkups[].options[].stepId` may identify a possible step only when the mapping was authored and reviewed with the journey.
- `place_user` returns `candidate` with `requiresConfirmation:true` or `not_sure`. It never changes saved progress.
- The AI should first establish that the visa journey applies, not assume every university student needs it.
- Future extra fields (step instructions, common problems, contacts, waiting states, source authority, review cadence) may be added without breaking these first four tools.

## Tool operations already on the branch
`workers/orivia-journey-tools.mjs` exports:
- `find_journeys(query, journeys)`
- `get_checkups(journey)`
- `place_user(journey, answers)`
- `get_step(journey, stepId)`
plus `normaliseJourney`.

Tests: `node tests/ai-journey-tools.test.mjs`.

## Handoff requested from Cleo
Please reply with the *actual* read-only API paths, authentication requirements, JSON field names, and a sample complete response. Then Ina will add a bounded HTTP adapter, explicit source-policy validation and attach tools to the private AI Worker. Do not mark the integration live until real tests confirm it.
