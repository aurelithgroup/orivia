# Pilot assistant (consent v3): the model leads, code checks

Status, 18 Oct 2026 (Cleo): built, offline-tested and live-tested for 3 turns on the private pilot. `OPENAI_PILOT` is back at `0`.

## What it is

`workers/orivia-assistant.mjs` handles the whole conversation for a tester who ticked consent `openai-assistant-pilot-v3`. The model (gpt-6.1-sol through `workers/orivia-openai-pilot.mjs`) reads the chat, the task memory and the evidence so far. Each step it does one of three things:

- calls up to 4 tools at once;
- asks one question;
- writes the reply.

**Tools.** All of them go through the existing bounded tools in `orivia-research-loop.mjs`:

- `web_search`: search terms are passed through `safeQuery`, so no personal details are sent.
- `read_page`: any public https page.
- `official_directory`: SPEA's data feed, behind the same `SPEA_DIRECTORY_FEED` switch as before.

**Evidence ledger.** Each page read becomes an `E` item holding a URL, title and excerpt. Its source kind comes from the address:

- `government`
- `regulator`
- `website`
- `listing`
- `community`

**Answer check (`verifyReply`).** Every reply is checked before anyone sees it:

- Each sentence has a kind, and the kind decides which sources can back it (`CLAIM_SOURCES`). A rule needs a government or regulator page. An organisation's own process needs its own website, judged by the page's address, never its title. An experience needs a community page. A listing proves only that a name is listed.
- Every phone number, email, link, amount, percentage and 3+ digit number must appear in the evidence it cites. General sentences may contain none of them.
- Cards keep only names and contacts that appear on a cited page. A wrong value is dropped, never guessed.
- After 3 rejected replies the turn returns `null`, and the normal flow answers instead.

**Rendering.** Code adds the `[n]` citations, labels experiences, and builds `liveSources` and `organisations` in the shape `trial-ui/chat.js` already shows. Community pages now show as "People's experiences".

**Memory.** It goes back to the device as `research.taskContext.task.assistant`: goal, criteria, corrections, shown, shortlist, open questions, and up to 10 evidence excerpts of 700 characters each. `cleanMemory` re-checks it every turn, and the source kind is always recomputed from the URL.

**Routing.** `orivia-ai-private-trial.mjs` checks the AI quota and daily caps first (`admit()`, counted once), then calls `hooks.assistant`. The route planner keeps its own code path. `orivia-research-pilot.mjs` creates one OpenAI transport per message and shares it with the fallback research path. One provider failure therefore stops OpenAI for the whole message (tested), and the fallback carries on with Workers AI.

**About me.** Shared by default, per the founder's decision on 18 Oct. The UI only sends it while "Use About me in chats" is on. "Moved from" is labelled as not being nationality or status.

## Limits

- **Transport:** 12 calls a turn. Input up to 40 KB per call. Output up to 1,200 tokens for a step and 2,500 for a reply.
- **Ledger:** $0.50 a day and $10 a month. The monthly limit was raised from $5 on 18 Oct at the founder's request; it is set in `wrangler.jsonc` so deploys keep it.
- **Search and fetch:** the existing pilot limits (8 searches and 32 page reads a turn, 50 searches a day, 1,000 a month).

## Live results, 18 Oct (full deployed conversation, consent v3, conversation A)

| Turn | Outcome | Model calls | Searches / pages | Time | Cost |
|---|---|---|---|---|---|
| "moving to dubai w my 10yo, need a british school" (first run) | 3 replies rejected: `not-own-site`, so it fell back | 5 (+7 fallback) | 2 / 4 | 50 s + fallback | ≈ $0.07 |
| Same, after the fix (the own site is now found from the school named in the sentence) | Verified reply: 3 KHDA-sourced schools, says the list is incomplete, asks about area and budget | 3 | 1 / 3 | 23 s | ≈ $0.02 |
| "Year 6, near Al Barsha" | Verified: 3 schools; flagged that KHDA's record and Dubai Heights' own site disagree; recovered from a 404 | 5 | 3 / 9 | 43 s | ≈ $0.07 |
| "are those the only ones?" | Verified: "No, a starting shortlist", added 2 new schools without repeating, asked where in Al Barsha | 3 | 1 / 8 | 27 s | ≈ $0.04 |

The OpenAI meter for 18 Oct closed at $0.391, with no reservations left open. That includes $0.103 kept from the failed 10:19 run.

## Known gaps (next)

1. **Completeness.** For "are those the only ones?" it should say what would make the list complete (KHDA's directory) and offer to work through it in batches. There is no KHDA or ADEK directory tool yet.
2. **Cost and latency of later turns.** Input grows with the evidence carried (36 KB by turn 2). Trim to the evidence cited last turn plus new reads. Target under $0.05 and 30 s.
3. **No progress events yet.** `research.progress` holds the model's step notes ("Finding contact details"), but the UI still shows "Orivia is thinking…". Streaming them needs a streamed response.
4. **Conversations B (UK) and C (bank account) and turns A4–A8 are not run yet.** The daily limit stopped testing at 3 turns.
5. **Listing-only answers.** When only listing sites mention a school, the reply must use `listing` sentences. The model sometimes tries `organisation_fact` first, which costs a retry.

## Tests

- `tests/assistant.test.mjs` (scripted):
  - source kinds and the answer check (invented phone or fee, rule from a listing site, someone else's site, experience from a government page);
  - cards never guessed;
  - search terms stay private;
  - memory carried and cleaned, and a follow-up answered from carried evidence without re-reading the page;
  - a question asked, and fallback after failures.
- `tests/research-pilot.test.mjs`:
  - v3 routing;
  - Workers AI not used for the tester;
  - About me shared, name never sent;
  - a v2 tick doesn't count;
  - caps checked before any model call;
  - one failure means one attempt across both paths.
