# Pilot assistant (consent v3): the model leads, code checks

Status, 18 Oct 2026 (Cleo): built, offline-tested and live-tested for 3 turns on the private pilot. `OPENAI_PILOT` is `1` in `wrangler.jsonc` (founder, 18 Oct: on for consenting testers before the 21 Oct mentor meeting; the daily and monthly limits still apply). Testers without the v3 tick are unaffected.

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
- **Ledger:** $1 a day and $10 a month. Both were raised on 18 Oct at the founder's request (from $0.50 a day and $5 a month); it is set in `wrangler.jsonc` so deploys keep it.
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

## Fixes after the founder's hospital conversation, 18 Oct

The first two turns ("I need a hospital, no insurance or Emirates ID", then "Sharjah, vomiting and high fever") were good, verified answers. Turns 3 and 4 ("what hospital can I go to?") came back as a school-shaped list naming "Kings College", taken from Wikipedia. Two causes:

1. **The $0.50 daily limit ran out mid-turn.** Ledger tickets 12:49 and 12:52 UTC: the next reservation was refused. The assistant then handed over to the old research path.
2. **The old path writes lists for schools only.** Its wording ("official school register", "curriculum") and its school-style name extraction came out for a hospital question.

Fixed (commit after 9e498c2):

- **The old agent declines lists outside schools.** `runAgentTurn` returns `null` for `find`/`list-all`/`more` unless the topic is `school` or `nursery`. Named organisations are still handled.
- **The assistant plans around money.** Before each model call it checks what is left (`ai.budgetLeft()`) against what a reply could cost (`ai.costOf()`):
  - if a step plus a reply won't fit, it tells the model to reply now;
  - if not even a reply fits, or the transport refuses a reservation, it returns `limitReply()`: an honest "can't check sources right now, won't guess" message that keeps the memory. It adds emergency numbers (998/999 in the UAE, 999/111 in the UK) when recent messages mention health or safety.
  - Verified live: the limit reply came back for "im in sharjah… find me a hospital" with no OpenAI call.
- **One page, one source.** A second read of the same URL merges into the same evidence item, so there are no more duplicate `[1][2]` citations for the NHS page.
- **Quotes:** `<nav>` and "Skip to main content" are dropped from page text. A claim's quote is now the best-matching passage (`bestQuote`), or nothing if no passage matches, never the site's menu.
- **Jurisdiction:**
  - `personRegion()` reads UAE or UK from the conversation, then About me, then memory.
  - A rule or regulatory claim can't rest only on the other country's official pages.
  - A source from the other country is titled "(UK guidance)" or "(UAE guidance)".
  - The model is told to use such pages as general information and say whose guidance it is.

## Daily limit (decided 18 Oct)

The money reservation is deliberately conservative: input bytes at the input rate, plus the maximum output. A research turn reserves up to about $0.10 but costs $0.02–0.07. With $0.50 a day, that allows roughly 6–8 research turns a day. The founder raised the daily limit to $1 (month still $10), roughly doubling that. Deployed as version 9d1a7d6e.
