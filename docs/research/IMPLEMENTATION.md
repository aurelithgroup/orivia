# Orivia research: first implementation, 17 October 2026

Status: implemented behind `RESEARCH_ENABLED=1`; disabled by default. Live search
has NOT been activated or validated with a real Brave key. No paid plan was
created and no secrets were added. The existing trial keeps its previous path
until an explicit rollout. This is an English-language pilot, not general web
research or comprehensive UAE/UK advice.

## Scope and flow

1. A conservative rule-based planner recognises the founder's five scenarios
   (institution documents, school enrolment, bank identity requirements, a
   residence medical test, and biometrics), plus basic mixed/community requests.
2. Missing country, emirate, medical purpose or document type is clarified with
   one question. A university's unspecified documents are not assumed to be a
   visa. Explicit user geography overrides saved profile and earlier messages.
3. Existing host/auth/human-session/model rate and usage controls run before
   any research. No extra model call is used for classification.
4. Fixed topic queries plus approved coarse geography/known organisation go
   to Brave Web Search. Raw chat, identifiers, IDs, application references and
   user-provided URLs do not go to the search provider. No result caching.
5. At most two search requests per message. Each request reserves an atomic
   monthly slot and daily slot in D1. Defaults: 100 searches/month, 10/day.
   Configurable hard maxima are 1,000/month and 50/day. Failed calls count;
   monthly slots may be conservatively consumed on a daily-cap rejection.
   Limits are shared across callers/deployments using the same database.
6. A result is only a discovered URL: search titles and snippets are discarded.
   Exact HTTPS host, country, source role, and topic must pass the registry.
   No arbitrary subdomains, credentials, ports, queries, or fragments. No
   redirects, unsupported content, browser execution, or bot bypass.
7. Fetch up to two candidates per part until one is readable. Responses are
   byte bounded and timed out; relevant passages are selected, not whole pages.
8. One model call receives only the scoped plan and fetched passages. It must
   return claim objects, each with a source ID and an exact supporting quote.
   Code rejects unknown sources, absent quotes, invented links and citations.
9. Reply includes numbered links and `research` metadata. Private application
   status and completed steps are never inferred by code. Missing parts stay
   explicitly unresolved; no forum fallback for an official claim.

## Important limits — do not report these as solved

- Rule-based intent and location recognition are limited. Unrecognised requests
  remain on the legacy chat path. Multilingual classification and a general
  semantic planner still need implementation and evaluation.
- A literal supporting quote does NOT prove that a model's paraphrase follows
  from it. Semantic entailment, conflict/supersession and page-specific
  applicability still need review. The response reports `needs-review`, not
  legally/medically verified advice. Citation presence is not correctness.
- Host-level country/topic scope is necessary but insufficient: a page can
  discuss another country, an inapplicable age group, old fees, or another
  campus. Do not market this registry as comprehensive government approval.
- `checkedAt` is retrieval time only, not publication/review date. Reliable
  publication dates and supersession detection are not implemented.
- Community parts are deliberately unresolved: Reddit/Threads are not fetched
  or used through snippets. Provider/content permissions need review first.
- Named organisation lookup is limited to reviewed registry entries. Typed
  institution names are not automatically verified; institution search/pins
  remain deferred. Do not infer a bank exception without that bank's evidence.
- No PDFs or JavaScript-rendered pages; blocked or unavailable official pages
  produce an honest fallback. No invented official contacts.
- Context is limited to the current request's 12-turn window and voluntarily
  shared profile. No durable or cross-device context was added.
- This is not deployed or enabled. Real provider, model and phone validation
  remains required. Offline fixtures do not validate real source quality.

## Activation checklist for the owner and Ina

1. Review Brave's current plan, card requirement, credit rules, rights and
   privacy terms directly in its dashboard. Do not assume the earlier $5/month
   credit estimate still applies. Official landing page and pricing retrieval
   on 17 October showed changed wording (prepaid / up to $20 in monthly calls).
2. Owner chooses provider/plan and explicit spend cap. Store the key securely
   as Worker secret `BRAVE_SEARCH_API_KEY`; never in chat, git, or plain vars.
3. Set approved `SEARCH_DAILY_CAP` and `SEARCH_MONTHLY_CAP`; keep existing
   AI, per-person, daily and human-session protections intact.
4. Agree Cleo's source UI contract below, deploy latest branch with her embedded
   UI intact, then explicitly set `RESEARCH_ENABLED=1` for controlled testing.
5. Review actual answers to all five founder questions, a school geography
   correction, institution ambiguity, a mixed official/community question,
   misleading snippets, stale/conflicting sources, and search outages. Check
   each claim against the actual page and check citations on iPhone.
6. Rollback: remove/set `RESEARCH_ENABLED=0`. Existing chat path is retained.

## Cleo's response/UI contract (no UI files changed here)

Research replies retain `reply`, `liveSources`, `actions`, `liveInformation`,
`verifiedSources` and `liveJourneyData`. Research adds:

- `research.status`: `needs-context`, `not-configured`, `search-limit`,
  `search-unavailable`, `no-evidence`, `unsupported`, `insufficient-evidence`,
  `community-permissions-pending`, `answer-unavailable`, `partial`,
  or `evidence-found`.
- `research.parts`: topic/tier/known organisation; `location`, `mixed`,
  `applicability: needs-review`, and (when generated) `claims`, `unresolved`.
- `liveSources`: exact fetched source ID, title, URL, category, topic, checkedAt.
  Category is `official` or `organisation`. There is no community evidence yet.
- `reply` includes numbered URLs until the UI can render source links/cards.

The old UI resource-link allowlist is narrow. Do NOT accept arbitrary model
URLs to fix that. Coordinate rendering of only server-vetted `liveSources`,
with visible source category and retrieval date. Do not label `liveSources`
as comprehensively "verified". Never expose keys or raw errors in the UI.

## Validation

`node --experimental-sqlite tests/research.test.mjs` covers the founder's exact
messages, one-question clarification, no assumed completion, correction to
Edinburgh, mixed official/community parts, country/topic/organisation scope,
spoofed URLs/SSRF destinations, search-snippet isolation, secret separation,
missing key, source failure, size limits, redirects, budget reservation and
real Worker authentication/rate order. The full existing suite must also pass.

## Official implementation references

- https://api-dashboard.search.brave.com/documentation/services/web-search
- https://brave.com/search/api/
- https://api-dashboard.search.brave.com/documentation/pricing
- https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
