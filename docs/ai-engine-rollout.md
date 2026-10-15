# Orivia: AI conversation engine, development phase

## Status (15 October 2026)
- Worker source: `workers/orivia-ai-preview.mjs`.
- Mock/test contract: `tests/ai-preview.test.mjs`; no real inference used in tests.
- Cloudflare Worker **orivia-ai-preview** was deployed separately on 15 Oct 2026 with an **AI** binding and allowlisted staging origin.\n- **Intentionally locked:** the Worker has no DEMO_TOKEN configured. Chat requests fail authentication before invoking the model; no public AI requests or user-facing AI chat are enabled.\n- **Not connected** to the public Buddy UI. Current preview Buddy remains rule-based.
- **Do not use orivia-api** for this experiment: it serves a different purpose.
- No live routes, government retrieval, calendar, uploads or long-term user memory exist yet.

## Current deployment notes\nDeployment on Cloudflare succeeded and settings inspection confirmed the AI binding. A live model inference test and public browser integration have **not** been performed. Do not advertise the Buddy preview as AI-enabled. The existing **orivia-api** Worker was not changed.\n\n## Conversation contract
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
