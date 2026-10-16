# Orivia Journey API (v1): contract for the AI tools

**Status:** proposed contract, ready for review (16 Oct 2026). Built on `feature/proactive-requirements`; `main` is untouched.
**Server:** `orivia-api` Worker (`server/`). **Base URL:** `https://orivia-api.habeebahsallah27.workers.dev` once this branch is deployed (or its Workers Builds preview URL).
**Version:** every response includes `"version": "2026-10-16"`. Breaking changes get a new version string.

## What it is, and what it isn't

- Read-only. Serves the same checked journey content the public app already shows, so the app and the AI read **one version**.
- **No user data.** Nothing is stored. Placement answers arrive in the request and are discarded. No sign-in needed; the existing `/admin` pages and their Cloudflare Access sign-in are unchanged.
- Facts only come from here. The AI should never state a requirement, fee, time or contact that isn't in a response.
- CORS allows `https://aurelithgroup.github.io` and `https://orivia-ai-preview.habeebahsallah27.workers.dev`. Worker-to-worker `fetch` from the AI Worker doesn't need CORS.
- Responses are cached for 5 minutes (`cache-control: public, max-age=300`).

## Common fields

| Field | Meaning |
| --- | --- |
| `verifiedOn` | Date the journey was last checked against its sources (`YYYY-MM-DD`) |
| `reviewDue` | `verifiedOn` + 90 days |
| `fresh` | `false` once `reviewDue` has passed |
| `note` | When not fresh: what the AI must tell the person (say when it was last checked; confirm fees, documents and deadlines with the official source) |
| `sources` | `[{ name, url }]` official and institutional sources for the journey |
| `statuses` | Allowed step statuses: `not_started`, `in_progress`, `waiting` (only for steps with a waiting state or appointment), `done`, `unsure` |

**Language:** add `?lang=ar` for Arabic, `?lang=all` for `{en, ar}` pairs. Default is English. Other languages: translate from English in the AI; the app's beta translations aren't served yet.

**Errors:** `404 { "error": "not_found", "detail": "journey" | "step" | "problem" | "pathway" | "contact" | "path" }`.

## Matches Ina's contract

`GET /api/v1/journeys/{id}` returns, inside `journey`, exactly the fields in `docs/ai-journey-integration-contract.md`, so it can go straight into `normaliseJourney()`:

| Contract field | Here |
| --- | --- |
| `id`, `title` | `journey.id`, `journey.title` (plain strings with the default `lang=en`) |
| `checkedAt` | `journey.checkedAt` (same as `verifiedOn`) |
| `steps[].source {url, checkedAt}` | Every step has `source: { name, url, checkedAt }`. **Honest note:** sources are reviewed per journey today, so each step carries the journey's primary official source; the full list is in `journey.sources`. Per-step sources are a later improvement. |
| `checkups[].options[{value, label, stepId?}]` | Every check-up has `options`: `yes` (its `stepId` is the step *after* the one asked about, because yes means it's done), `no` (`stepId` = the step asked about) and, where allowed, `not_sure` (no `stepId`) |
| `place_user` result | `/place` returns `placement.status`: `candidate` (with `stepId` and `requiresConfirmation: true`), `not_sure` (`stepId: null`, plus `confirmHow`), or `needs_answer` (plus `nextQuestion`). It never saves anything. `not_sure` and `unsure` are both accepted in `answers`. |

The server-side `/place` evaluates all check-ups in order, so it handles several answers at once, which a single-mapping `place_user()` can't.

## Endpoints

| Tool (suggested name) | Method and path | Returns |
| --- | --- | --- |
| `list_journeys` | `GET /api/v1/journeys?aiReady=1&city=dubai` | Journey summaries; `aiReady=1` limits to journeys the AI may use (today: `dubai.eid.student`) |
| `find_journeys` | `GET /api/v1/journeys/match?q=<text>&city=dubai` | Up to 5 **candidates** plus any pathway question. Never a decision: ask the person what they want first |
| `get_pathway` | `GET /api/v1/pathways/{id}` | A "who is arranging this?" question that picks between journeys (e.g. `dubai.eid`) |
| `get_journey` | `GET /api/v1/journeys/{id}` | The whole journey: steps, check-ups, problems, sources, freshness |
| `place_user` | `GET /api/v1/journeys/{id}/place?answers=q1:yes,q2:no` | Where the person is, or the next check-up question to ask |
| `get_step` | `GET /api/v1/journeys/{id}/steps/{step}` | One step, fully expanded: what to do, bring, expect, waiting state, check-ups, problems, contacts, sources, freshness |
| `get_problem` | `GET /api/v1/journeys/{id}/problems/{problemId}` | The checked answer for something going wrong, with who to contact and the exact words |
| `who_to_contact` | `GET /api/v1/contacts/{key}` | A contact (e.g. `visa`, `icp`): who, why, what to have ready, how to reach them, usual reply time |

### Placement rules (`place_user`)

- `answers` is a comma-separated list of `q<n>:yes|no|unsure`. **yes** means that check-up's step is done.
- Check-ups are evaluated in order. The first unanswered one is returned as `nextQuestion`: ask it, then call again with the new answer.
- The first `no` sets `currentStep` with `currentStatus: "in_progress"`.
- `unsure` sets `currentStep` with `currentStatus: "unsure"` and returns `confirmHow`: tell the person how to check officially, and never treat the step as done.
- When every check-up is `yes`, `currentStep` is the next step after the last one checked (or `complete: true`).

## Suggested conversation flow (from "Orivia: Making Her Intelligent")

1. Understand why they need help. Call `find_journeys` for candidates, but **ask** what they want before choosing.
2. If a candidate has a `pathway`, ask its question (e.g. "Who is arranging your residency?") to pick the journey.
3. Call `place_user` with no answers, ask the returned `nextQuestion`, and repeat with each answer.
4. Call `get_step` for `currentStep`. Explain it in plain words, quoting `sources` and `verifiedOn`. If `fresh` is false, say `note`.
5. Offer one action: a reminder (existing calendar card), the exact message from a problem's `contact.say`, or the step's `sayThis` card.

## Example responses (trimmed: `"… n more"` marks shortened lists)

### `GET /api/v1/journeys?aiReady=1`

```json
{
  "version": "2026-10-16",
  "journeys": [{
    "id": "dubai.eid.student", "city": "dubai", "need": "docs",
    "title": "Your student residence visa and Emirates ID",
    "aiReady": true, "verifiedOn": "2026-09-26", "reviewDue": "2026-12-25", "fresh": true,
    "steps": [{ "id": "permit", "title": "Your entry permit, before you fly" },
              { "id": "arrive", "title": "Tell your university you’ve arrived" }, "… 6 more"]
  }]
}
```

### `GET /api/v1/journeys/match?q=starting university next month&city=dubai`

```json
{
  "version": "2026-10-16",
  "query": "starting university next month",
  "candidates": [{ "id": "dubai.eid.student", "title": "Your student residence visa and Emirates ID",
                   "city": "dubai", "aiReady": true, "matchedWords": ["university"], "pathway": "dubai.eid" }],
  "pathways": [{ "id": "dubai.eid", "title": "Who is arranging your UAE residency?",
                 "options": [{ "name": "My university", "journey": "dubai.eid.student" },
                             { "name": "My employer", "journey": "dubai.eid.employee" }, "… 2 more"],
                 "dontKnow": { "title": "That’s OK. Here’s how to tell.", "items": ["… 3 items"] } }],
  "instruction": "Candidates only. Ask the person what they want help with before choosing a journey. If a pathway is listed, ask its question to pick between its journeys."
}
```

### `GET /api/v1/journeys/dubai.eid.student/place?answers=q1:yes,q2:yes,q3:no`

```json
{
  "version": "2026-10-16",
  "journey": { "id": "dubai.eid.student" },
  "answers": { "q1": "yes", "q2": "yes", "q3": "no" },
  "placement": { "currentStep": "medical", "currentStatus": "in_progress",
                 "done": ["permit", "arrive"], "unsure": [], "confirmHow": null,
                 "nextQuestion": null, "complete": false },
  "verifiedOn": "2026-09-26", "reviewDue": "2026-12-25", "fresh": true, "note": null
}
```

With no answers yet, `placement.nextQuestion` holds the check-up to ask:
`{ "id": "q1", "step": "permit", "question": "Are you in the UAE now?", "answers": { "yes": "Yes, I’ve arrived", "no": "Not yet" }, "allowsUnsure": false }`.

### `GET /api/v1/journeys/dubai.eid.student/steps/biometrics`

```json
{
  "version": "2026-10-16",
  "journey": { "id": "dubai.eid.student", "title": "Your student residence visa and Emirates ID" },
  "step": {
    "id": "biometrics", "label": "Fingerprints", "title": "Fingerprints for your Emirates ID",
    "now": "Next: your university should email you instructions for your fingerprint appointment.",
    "doThis": ["Your university books the appointment and emails you the place and time.",
               "Go at that time, with your passport and the appointment email.", "… 1 more"],
    "tips": ["Can’t make it? Tell your visa office before the appointment so they can rebook."],
    "sayThis": "I have a fingerprint appointment for my Emirates ID.",
    "bring": [{ "item": "Your passport" }, { "item": "Your appointment email" }],
    "expect": ["Have your passport and the appointment email ready.", "… 2 more"],
    "waitingFor": "Your university to send your fingerprint appointment.",
    "appointment": true,
    "staffQuestion": "I need help with my fingerprint appointment for my Emirates ID."
  },
  "position": { "index": 4, "of": 8, "previous": "medical", "next": "issued" },
  "statuses": ["not_started", "in_progress", "waiting", "done", "unsure"],
  "checkups": [{ "id": "q4", "step": "biometrics",
                 "question": "Have you had your fingerprints taken for your Emirates ID?",
                 "answers": { "yes": "Yes", "no": "No", "unsure": "I’m not sure" }, "allowsUnsure": true,
                 "explain": "Staff scan all your fingers on a glass scanner…",
                 "checks": ["Did someone scan your fingers on a glass scanner?", "… 2 more"],
                 "confirm": "Ask your visa office, or check your Emirates ID status on the ICP website with your application number (PRAN)." }],
  "problems": [{ "id": "missed", "question": "I missed my appointment",
                 "answer": "Contact your visa office today and ask them to rebook…",
                 "contact": { "to": "visa", "say": "Hello. My name is [your full name], student ID [number]. I missed my … appointment on [date]…" },
                 "contacts": [{ "key": "visa", "who": "Your university’s visa office", "replyDays": 3, "…": "…" }] }, "… 4 more"],
  "contacts": [{ "key": "visa", "who": "Your university’s visa office",
                 "why": "They sponsor your visa and run this part of your application. Only they can see it or change it.",
                 "ready": ["Your full name, as in your passport", "… 4 more"],
                 "how": "Their email address is usually in your offer or welcome email…", "replyDays": 3 }],
  "sources": [{ "name": "ICP: Emirates ID status", "url": "https://icp.gov.ae/en/id-card-status/" }, "… 3 more"],
  "verifiedOn": "2026-09-26", "reviewDue": "2026-12-25", "fresh": true, "note": null
}
```

### `GET /api/v1/journeys/dubai.eid.student/problems/noappt`

```json
{
  "version": "2026-10-16",
  "journey": { "id": "dubai.eid.student" },
  "problem": { "id": "noappt", "question": "I haven’t got a medical appointment",
               "answer": "Check your junk email folder first. If it isn’t there, ask your visa office whether they’ve received your stamped entry permit.",
               "contact": { "to": "visa", "say": "Hello. My name is [your full name], student ID [number]. I arrived on [date] and sent my entry permit…" },
               "contacts": [{ "key": "visa", "who": "Your university’s visa office", "…": "…" }] },
  "sources": ["… 4 sources"], "verifiedOn": "2026-09-26", "reviewDue": "2026-12-25", "fresh": true, "note": null
}
```

Messages in `contact.say` contain `[placeholders]` for the person to fill in. The AI should never ask for, store or fill in passport, visa or ID numbers itself.

## Updating the data

Journey content is generated from the app into `server/src/journeys-data.js`. After a journey changes in the app, regenerate it with the exporter, review the diff, and only then add a journey to `AI_READY` once it passes the journey check (`?qa=1` in the app).

## Tests

`node --experimental-sqlite tests/journey-api.test.mjs` covers list, match, step, place (including unsure), problems, freshness, CORS, and checks that the existing `/admin` sign-in and partner notes still behave as before.
