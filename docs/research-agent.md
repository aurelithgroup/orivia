# Orivia research agent (`RESEARCH_AGENT=1`, on top of `RESEARCH_LOOP=1`)

Built from Ina's case study (18 Oct). Ina found every British-curriculum school in Sharjah because she could **choose her next step from what she had found**:

1. understand what counts as answering;
2. search to find the right source;
3. judge reliability per claim;
4. change tools when a route fails;
5. check whether she had finished;
6. only then advise.

The earlier loop ran a fixed recipe per intent. The agent lets the model choose each step, and code keeps the rules.

## The loop

`understand the goal → choose a research action → inspect the result → identify what's missing → choose the next action → answer with evidence`

| | Decides | Enforced by code |
|---|---|---|
| Goal | `defineGoal`: what counts as answering for find / more / all / check / contacts / compare | Constraints come only from the person's words (`resolveConstraints`) |
| Next step | **The model** (`PLANNER_SYSTEM`), from a compact view: goal, criteria, what's still missing, budget, what's been found (ids and names, **never URLs**), the last result, and the actions available now | `validateAction`: only listed actions, only ids Orivia has seen, no repeats, search budget. Anything invalid is rejected and logged, and `policyNext` (Ina's method as code) picks instead |
| Doing it | — | `execute` through `makeTools`: source policy, privacy-safe queries (`buildQuery`, `queryName`), fetch caps, the shared daily budget |
| Finished? | — | `assess`: a list is **complete only when a filtered regulator listing was read in full** (items = total, range ends at total). The model can't declare completeness |
| Answer | — | `compose`: each claim only from its permitted source kind (`CLAIM_SOURCES`), every fact quoted, caveats stated |

**Actions:**
- `regulator_listing`, `regulator_search` (by curriculum or name, with offset);
- `web_search` (discover / official-site), `read_list_page`, `check_leads`;
- `open_records`, `open_site`;
- `answer`.

**Limits:**
- Steps: default 5, maximum 8 (`RESEARCH_AGENT_STEPS`). Each step is one planner call.
- Searches: 4 per turn, within the deployed 10 a day and 100 a month.
- Fetches: 24 per turn.

**Reliability per claim (`CLAIM_SOURCES`):**

| Claim | Strongest source | Allowed |
|---|---|---|
| Classification ("SPEA lists it as British") | the regulator | regulator only |
| What a school says it teaches | its own site | own site: linked, user-given, or found (labelled) |
| Contacts | regulator or own site | both |
| Listed / exists | regulator page or regulator search index | regulator, regulator-index |
| Names worth checking | search results, commercial directories | leads: never facts. A directory's "28 schools" is reported as an unverified claim |

**Honesty rules carried from the case study:**
- A broken old link means the link failed, not that the school is gone.
- A complete British-filter list isn't the same as "every school with any British pathway"; the mixed-curriculum caveat is stated.
- SPEA covers the whole emirate, not just Sharjah city.
- A Year 6 listing isn't a seat.

## What Ina did that Orivia can't yet: the filtered listing

Ina opened SPEA's directory **in a browser**, selected British, raised the rows per page and read "1–27 of 27". The server only renders the first 10 of 136 schools, and the filter runs in the browser.

The agent supports this through a regulator adapter method, `listFiltered({curriculum, year}) → {status, filter, total, range, items}`. Tests exercise it, but **it isn't connected for SPEA yet**. Two routes:
1. **The directory's own data request.** Capture what the page requests when the filter is applied (browser developer tools → Network). If that's a plain request on `spea.shj.ae`, `listFiltered` can call it under the existing source policy (after review).
2. **A headless browser** (e.g. Cloudflare Browser Rendering). This needs a plan and cost check before use.

Until then, "all of them" gives honest coverage ("confirmed N so far… isn't the full list") rather than claiming completeness.

## Tests (whole process, not just readers): `tests/research-agent.test.mjs`

1. **Ina's case study replayed.** The model chooses: discover → read the directory's list ("28 British schools") → SPEA search → old links 404 → switch to SPEA's filtered listing → complete (27 of 27). Then it answers with the mixed-curriculum caveat, the broken-link explanation and the emirate-vs-city note, and lists the unconfirmed lead.
2. **Same goal, no filtered listing, model down:** the policy follows the same method and reports "isn't the full list".
3. **Invalid model choices rejected:** unknown action, invented id, a URL instead of an id, a repeat, overspending.
4. **Named school plus year:** stops as soon as the evidence answers it.
5. **Unlisted school:** changes route to its website, with ownership and Year 6 stated honestly.
6. **No regulator (Dubai):** no regulator actions offered; completeness not claimed.
7. **Contacts follow-up:** uses the school in focus.

The Worker test covers `RESEARCH_AGENT=1`, with planner calls bounded.

## Cost

A research turn with the agent makes 1 understanding call plus up to 5 planner calls (each short: about 1–2k tokens in, ≤160 out), against Workers AI's daily free allowance. The switch is off. Ina should measure neurons per turn on the private trial before enabling it more widely.
