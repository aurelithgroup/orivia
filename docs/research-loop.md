# Orivia research loop (`RESEARCH_LOOP=1`)

Owner: Cleo (planner, routing, retrieval integration), coordinated with Ina. Files: `workers/orivia-research-understand.mjs`,
`workers/orivia-research-loop.mjs`, plus `orivia-spea-reader.mjs` and `orivia-school-sites.mjs`. Off by default; when it's off, the previous path runs unchanged.

## Why Cleo and Ina can find "all British schools in Sharjah" and Orivia couldn't

| What we do | What Orivia did | What the loop does now |
| --- | --- | --- |
| Search several times, rewording from what came back | 1–2 fixed searches | Up to 4 searches a turn: regulator-restricted, open-web discovery, a batch check of leads, then paging |
| Use any page as a lead (listing sites, search titles), only official pages as proof | Threw away every title and snippet | Titles, snippets and listing pages give **leads** (names only); facts only from opened regulator or own-site pages |
| Check leads against the regulator | Never | One search `("A" OR "B" OR …) site:spea.shj.ae` checks up to 5 leads at once |
| Remember what's been shown; "all" means go wider | Replayed the same results | Task state (shown, cursor, focus) round-trips; shown schools are skipped by link or exact name |
| Answer the question actually asked | Fixed regex routing | The model reads the intent; code runs a recipe per intent |
| Read the school's own website | Only if SPEA linked it | A link the person gives is read directly. Otherwise the site comes from SPEA or search, then gets proven (see `docs/school-sites.md`) |

## What the model decides vs what code enforces

**Model (one call, `understandRequest`)** proposes:
- `intent`: `find | more | all | check | compare | contacts | rules | other`;
- `topic`, `location`, `constraints` (curriculum, year);
- `organisations` (names or links), `correction`, and up to 3 `searches`.

**Code** enforces everything else:
- **Validation (`validateUnderstanding`):**
  - Only known intents and topics are accepted.
  - A location must appear in the chat, the profile or the active task.
  - Organisation names must appear in user turns or in names Orivia showed. Links must appear verbatim in user turns.
  - Curriculum and year must be stated by the person.
  - Searches are stripped of links, emails, phone numbers and personal phrases ("my son…").
  - If the model's output is missing or invalid, `ruleUnderstanding` takes over.
- **Tools only (`makeTools`):** a search capped at 4 per turn plus the shared daily and monthly budget (`reserveSearch`), and page fetches capped at 24 per turn.
  - Every fetch is https, a public hostname and no port, with a 6.5 s timeout and a 1 MB cap.
  - Redirects: one hop on the same site only.
  - Fetch kinds:

    | kind | allowed |
    | --- | --- |
    | `regulator` | registry and SPEA record paths |
    | `site` | exactly one organisation's host |
    | `discovery` | listing pages; never government or registry hosts; names only |
- **Evidence levels:**

  | level | meaning | can support |
  | --- | --- | --- |
  | `regulator` | regulator page opened | listing, regulator-stated facts, official rules |
  | `regulator-index` | regulator page known only from search results | "listed, not opened yet" |
  | `own-site-linked` | own site proven by regulator link, email or matching contact | the organisation's own statements |
  | `own-site-user` | a link the person gave | the organisation's own statements, never regulatory confirmation |
  | `own-site-found` | site found by search; the page names the organisation | own statements, labelled "ownership not confirmed" |
  | `lead` | name from a listing site or search title | named as "not checked", never a fact |
- **The answer is composed in code** for the intent asked. Every fact line carries a source number and quote; regulator and own-site sources are kept apart, and differences are flagged.
  `rules` questions return `null`, so the existing official-sources path handles them.

## Recipes

- **find / more / all (regulator connected, e.g. SPEA for Sharjah schools):**
  1. Directory page (cards give the name and curriculum as SPEA states them).
  2. Regulator-restricted search, paged with the cursor.
  3. For more/all, or thin results: open-web discovery, reading up to 2 listing pages for leads.
  4. One regulator search to check up to 5 leads.
  5. For all: keep paging while the per-turn budget lasts.
  6. Open up to 12 regulator records, leads first, never ones already shown.
  7. Reply: confirmed matches with quotes; "listed on SPEA, not opened yet"; "mentioned elsewhere, not found on SPEA"; coverage ("SPEA lists about 136… I've confirmed N so far, so this isn't the full list").
- **find (no regulator connected, e.g. Dubai schools, banks):** web discovery plus organisations' own sites. The reply says plainly that there's no regulator check and completeness can't be established.
- **check / compare:** a link the person gave is read directly. Regulator identity comes from cards plus an exact-name search, opening the best 4 (`match`, `candidates` or `not-found`). The own site comes from the regulator's link or from search, then is proven. Compare does this for up to 3.
- **contacts:** for a named organisation or the one in focus, regulator contacts plus own-site contacts. "Them" after a list means the shown schools' regulator pages are re-read (up to 4); no search is needed.

## Task state (`research.taskContext.task`)

```jsonc
{"intent":"more","topic":"school","location":{"country":"uae","city":"Sharjah"},"constraints":{"curriculum":"british","year":null},
 "shown":[{"name":"…","url":"https://spea.shj.ae/…","level":"regulator"}],"focus":"Victoria English Pvt. School LLC",
 "cursor":{"offset":2,"pending":["…SPEA record URLs…"]},"regulatorTotal":136,"pendingOffer":"more"}
```

The client returns it as `preferences.researchContext.task`. `sanitizeTask` re-validates every field: links must be https, and pending items must be SPEA records.
A new `find` with a different place, topic or filter starts with nothing shown.

## Cost per turn

- 1 model call (understanding) only when `maybeResearch` thinks it's a research turn (organisation words, a link, or an active task).
- At most 4 searches and 24 fetches.
- Quotas and authentication run before any of it.

## Adding a regulator

Add an entry to `REGULATORS` in `orivia-research-loop.mjs`:
- `topics`, `covers(location)`, `site`;
- `isRecord(url)` / `record(url)`;
- `directory`, `parseDirectory`, `parseProfile`, `indexName(title)`, `searchTerms(constraints)`.

Each new host needs a source-policy review first. Candidates: KHDA (Dubai), ADEK (Abu Dhabi), GIAS/Ofsted (England), Education Scotland.

## Not yet done / live gaps

- Not run against live Brave, SPEA or real school sites. All tests use captured, reconstructed or synthetic pages.
- How well Llama 3.3's understanding holds up on real messy phrasing has to be checked live. The validators and the rule fallback limit the damage.
- SPEA PDFs (inspection reports) aren't read.
- Only SPEA is connected as a regulator.
