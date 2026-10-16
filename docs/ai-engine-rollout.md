# Orivia: AI conversation engine, development phase

## Status (16 October 2026)
- Worker source: `workers/orivia-ai-preview.mjs`.
- Mock/test contract: `tests/ai-preview.test.mjs`; no real inference used in tests.
- Cloudflare Worker **orivia-ai-preview** was deployed separately on 15 Oct 2026 and updated on 16 Oct 2026 with an **AI** binding, a **five-request/minute rate limiter per Cloudflare rate-limiting location**, and an allowlisted staging origin.\n- **Intentionally locked:** the Worker has no DEMO_TOKEN configured. Chat requests fail authentication before invoking the model; no public AI requests or user-facing AI chat are enabled.\n- Chat-to-AI bridge source **js/orivia-ai-bridge.js** is loaded by staging Buddy and its optional AI path is wired behind a **disabled configuration switch** and an explicit per-session user consent step. It uses a same-origin path and sends no browser secrets.\n- **Not live for users.** The staging preview remains rule-based by default; the protected same-origin authentication route does not exist yet.
- **Do not use orivia-api** for this experiment: it serves a different purpose.
- No live routes, government retrieval, calendar, uploads or long-term user memory exist yet.

## Current deployment notes\nDeployment on Cloudflare succeeded and settings inspection confirmed the AI binding. Live model inference through the account-level Workers AI API **has been performed** (small and large models); browser integration with real inference **has not**. The larger model was less reckless in two targeted examples, but neither model is reliable without retrieval. Do not advertise the Buddy preview as AI-enabled. The existing **orivia-api** Worker was not changed.\n\n## Conversation contract
`POST /v1/chat` with up to 12 messages:
```json
{
  "messages": [
    {"role":"user","content":"I'm starting university next month"},
    {"role":"assistant","content":"Which university?"},
    {"role":"user","content":"University of Wollongong Dubai"},
    {"role":"assistant","content":"How can I help?"},
    {"role":"user","content":"Compare public transport and driving from Sharjah"}
  ],
  "preferences":{"language":"en","style":"friendly"}
}
```
`200`: `{reply,verifiedSources:[],toolsUsed:[],liveInformation:false,disclaimer}`.
No claim of external retrieval is made. Each request sends bounded conversation history; the service does not persist it.

## Security and cost release gate
**Do not place DEMO_TOKEN in any public JavaScript or git file.** The included token check is only a server-to-server development gate, NOT safe public browser authentication. Do not remove the gate to make the preview work.

Before the browser is connected:
1. Verify Cloudflare Access (or equivalent) user identity at the edge AND within the Worker; install durable per-user/per-IP quotas with an account-wide spending limit. CORS alone is not an access-control mechanism.
2. Confirm Cloudflare Workers AI billing plan, model limits and account budget with the owner. Model invocations consume billable inference quota even without a separate API key.
3. Add a consent notice before sending conversation text to Cloudflare AI. Data handling, retention and personal-information policy must be documented.
4. Wire staging frontend to the authenticated endpoint with request timeouts, retry guard and clear AI-unavailable states. Never silently fall back to keyword replies labelled as AI.
5. Run multi-turn evaluations; separately test for fabricated transport routes, legal claims, prompt injection, privacy leaks and cost exhaustion.

## Minimum capability acceptance tests
- The student says “I'm starting university”, “how do I get there?”, names a Dubai campus and says “from Sharjah”; Orivia understands the complete goal, asks only for genuinely missing facts and does not invent journey times.
- Switching Home, My Plan, Help and More never clears the conversation.
- A new unsupported topic gets an honest response, rather than redirecting the student back to a fixed menu.
- Without trustworthy live-source integration, a comparison must distinguish actionable planning advice from verified routes or costs.

## Next integrations
A verified transport information interface, an auditable official-source retrieval registry, an optional structured user context store with explicit permission, and safe action confirmation. Each source result needs provenance, retrieval date and validity; model-generated claims are not evidence.

## 16 October findings and gates
- Live private model tests: the smaller Llama 3.1 8B confidently invented a travel duration and overgeneralised school attestation; Llama 3.3 70B offered an unsourced but better-calibrated comparison and explicitly recommended checking school-specific requirements. This is a small exploratory sample, not a formal benchmark.
- The private Worker is configured to call `@cf/meta/llama-3.3-70b-instruct-fp8-fast`; public requests are still denied because `DEMO_TOKEN` is deliberately unset. The Worker refuses to call AI if the rate limiter is missing or exhausted.
- A conservative response check blocks some patterns of invented travel times, bus route numbers and mandatory attestation claims. **It cannot guarantee factual accuracy**. Only authoritative source retrieval can justify a route, price or requirement.
- The private frontend bridge supports passing recent messages, a server-validated same-origin endpoint, disabled/failure states, and opt-in AI data processing. These are mock-tested, not yet tested against the live service.
- Automated offline test definitions are in `.github/workflows/orivia-ai-dev.yml`; workflow execution status has not been independently confirmed.
- **Next blocker:** create and verify an actual private login policy (Cloudflare Access), protect a same-origin gateway, add a durable per-user and account-wide budget control, then ask the owner to test live AI in the preview. Do not enable on the public site before that.

## Private founder AI trial (16 October 2026)
A separate, authenticated Workers domain has been enabled:
- Private URL: `https://orivia-ai-preview.habeebahsallah27.workers.dev/`
- Cloudflare Access application: `Orivia Private AI Trial`; its only allowed email is the founder-provided tester account.
- Current deployed source: `workers/orivia-ai-private-trial.mjs` (not the earlier development reference `workers/orivia-ai-preview.mjs`).
- The Worker verifies the signed Cloudflare Access JWT: issuer, audience, expiration, email and RS256 signature against Cloudflare Access JWKS before serving content or invoking AI.
- The conversation page requires browser consent before forwarding messages to Workers AI. Messages remain in browser session storage and are not intentionally stored in Orivia's database.
- Limits: up to 5 requests per minute through Cloudflare's per-location rate limiter, plus a separate D1-backed hard daily ceiling of **30 inference attempts per UTC day**. Token output limit is 340. The daily counter does not contain chat messages or personal identifiers.
- The private trial uses a real Cloudflare Workers AI model. It is **not** connected to the public Orivia preview, whose original Buddy remains limited and rule-based.
- Access app, email allow rule, Worker deployment, AI and quota bindings, D1 counter table, and Workers subdomain were verified via Cloudflare's API. **Browser sign-in and real conversation request through this protected endpoint still require the founder's manual test.**
- This is a research prototype, not a validated tool for actual travel, immigration, education or emergency decisions. It cannot retrieve live data or confirm legal requirements. Its heuristic response guard cannot guarantee accuracy.
- Do not ask the user to share their Cloudflare one-time login code.

## Milestone 5 — First verified university lookup (16 October 2026)
A sourced, non-live university journey handoff has been added and deployed to the founder-only private AI Worker:
- `workers/orivia-journey-sources.mjs` contains an explicit university registry with source date and official campus address for the University of Wollongong Dubai. Official source: https://www.uowdubai.ac.ae/contact-us.
- During relevant trip conversations, this registry provides the model with independently confirmed campus context. The Worker sends `verifiedSources` and `actions` separately from generated prose.
- Links open Google Maps driving/transit directions with the university destination and an origin if explicitly recoverable from user messages. URL scheme based on official Google Maps URLs docs: https://developers.google.com/maps/documentation/urls/get-started
- Official Dubai Roads & Transport Authority public journey planning: https://rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=209
- The private trial UI shows these links as external actions, built as safe DOM anchors and restricted to known HTTPS domains.
- **This is NOT a live route lookup.** The Worker does not fetch Google Maps directions or RTA schedules, cannot compare actual journey durations, and must not claim it has. The external planner computes current routes only when the user opens it.
- Regression test added: `tests/journey-sources.test.mjs`. Deployment and AI access/budget bindings verified; the owner has not yet tested the updated journey UI.
- Next: complete a proper routed-journey integration through a licensed data provider or official API, with departure times, provenance, user consent, results validation and per-request cost controls.

## Official-information source policy (16 October 2026)
- Deployed `workers/orivia-source-policy.mjs`, a **deny-by-default** approved-domain policy for evidence. Reddit, social media, random blogs, and unsupported search snippets do not qualify as proof.
- Evidence must include source URL, summary, and checked date; links are independently validated by domain and HTTPS. Government/legal requirements must use a government authority, not an institutional website.
- Heriot-Watt University Dubai: official maps and directions https://www.hw.ac.uk/dubai/visit/maps-and-directions (Dubai Knowledge Park); official contact https://hw.ac.uk/dubai/visit/contact-us, dubaienquiries@hw.ac.uk, +971 4 571 7000. This is institutional information, not transport timetable data.
- RTA source registry updated to its official journey-planning page https://www.rta.ae/wps/portal/rta/ae/home.
- Verified model-facing facts are drawn from curated official source records only; this release **does not yet perform arbitrary live web search**. The model may still make unsupported assertions; the evidence allowlist does not guarantee the whole generated answer is trustworthy.
- Added regression tests in `tests/official-sources.test.mjs`, included in the development workflow. A direct in-session simulation verified that official Heriot-Watt contacts, driving and transit links appear and Reddit/unapproved institutional claims fail the relevant trust checks.
- Cloudflare's Web Search API requires AI Gateway credits or a provider key; do not enable it until pricing/budget and per-result official-domain filtering have been reviewed with the owner.
- The future reminders feature must be opt-in, with explicit timing, permissions and confirmation. Never claim a reminder was scheduled until the scheduling service has confirmed it.

## Live approved official-page checking + calendar reminders (16 October 2026)
The founder-only private AI Worker was updated with two new modules:
- `workers/orivia-official-live.mjs`: when an approved official URL is supplied, or a recognised university scenario points to approved campus/contact pages, Orivia attempts a **fresh server-side HTTPS fetch**. Redirects are not followed; social networks, Reddit, unapproved hosts, unsupported content and inaccessible pages are refused. Reads time out, are size-limited, and return only a bounded text excerpt. Replies include a check timestamp and actual URL only if the request succeeded. It is not a general-purpose search engine or a site-wide crawler; to check another supported approved site, the user can paste its exact official page link. Unsupported official websites need explicit review/allowlisting first. Live RTA or Google Maps route results are NOT fetched.
- `workers/orivia-calendar-reminder.mjs`: the authenticated founder trial now has a user-initiated reminder form. The user chooses the event, date/time and alert lead time, and Orivia generates a real standards-compliant `.ics` calendar event with `VALARM`. **This is not an automatically scheduled reminder**; the user must open/import it into their calendar app and confirm the calendar notification. No background alarm, push, email reminder or calendar-account access is claimed.
- Live fetching never substitutes unreviewed page text as trusted instructions to the model; content is labelled as untrusted excerpts, and unsupported factual claims must not be marked verified.
- Security: the existing Cloudflare founder-only Access policy, runtime identity check, 5/min rate limit and 30 AI inferences/day counter remain unchanged. Official-site fetch is bounded to at most two pages per conversational request.
- Tests: `tests/live-official-and-reminders.test.mjs` checks URL filtering, simulated live fetch, overdue-time rejection and valid ICS alarm generation; direct isolated checks also passed. We have NOT yet verified actual live official-page fetch or calendar import inside the user's browser.
- Future: site-wide official search needs a reviewed search API/index and per-domain citation and crawl policies; true automated reminders need explicit user authorization, calendar integration or push infrastructure.
