# Searching like a person, with labelled evidence (18 Oct 2026)

**Why:** a live answer showed only 2 schools ("confirmed 2 so far"). Orivia did see more, but the old rule only let it show what the regulator confirmed, and the pilot had no search key attached. The founder approved two changes:

1. Show what credible non-official sources say, labelled.
2. Raise search limits for the private pilot only, to 50 a day.

## Evidence rule (what each line may claim)

| Who says it | How the answer words it | Source badge |
|---|---|---|
| Regulator (SPEA record or directory data) | "British curriculum" as a confirmed classification | Official source |
| School's own website | "its website says '…'" with the exact quote | Organisation source |
| Listing site (edarabia, whichschooladvisor…) | "Listed on other websites but not yet confirmed", with the page cited | Listing site |
| Sources disagree | "[site] suggests British, but SPEA lists American. It may offer more than one; worth asking the school." | Both cited |

These rules don't change:

- Only the regulator backs a classification claim (`CLAIM_SOURCES`). A listing site is never a source-backed claim.
- Completeness still needs a complete regulator listing with `complete === true`.

When there is no regulator for a city (for example Dubai today), the answer says so. It then shows websites and listing sites, labelled, and calls the result a starting point.

## Search method (built-in policy; the model may choose the same actions)

1. The regulator listing: SPEA's own data feed when `SPEA_DIRECTORY_FEED=1`.
2. A regulator search.
3. A web search.
4. Read the listing pages that search found.
5. Check the names it collected against the regulator.
6. Open those regulator records.
7. Search the web again with **different wording**, if it has found little and searches remain. The wording comes from fixed curriculum terms, for example: "list of British curriculum schools in Sharjah", then "IGCSE A Level UK curriculum schools Sharjah", then "best British schools in Sharjah 2026". Chat text never goes into a query.
8. Read up to 3 schools' own websites that the regulator hasn't confirmed.

"Find" now aims for a page of 8 before stopping (it used to stop at 3). A model that tries to stop a list search before looking at the web, with searches left, is overruled once. The same result seen again through reworded searches isn't counted twice. A 40-second time limit makes Orivia answer with what it has instead of keeping the person waiting.

## Limits

These defaults are unchanged for the public beta: 4 searches and 24 page reads per turn, and 10 searches a day / 100 a month.

The private pilot (`workers/pilot/wrangler.jsonc`) sets:

| Setting | Value | Meaning |
|---|---|---|
| `SEARCH_POOL` | `pilot` | Its own counters, so the beta's 10 a day are untouched |
| `SEARCH_DAILY_CAP` | 50 | Searches a day (the code ceiling) |
| `SEARCH_MONTHLY_CAP` | 1000 | Searches a month (the code ceiling) |
| `RESEARCH_TURN_SEARCHES` | 8 | Searches per question (ceiling 10) |
| `RESEARCH_TURN_FETCHES` | 32 | Page reads per question (ceiling 40) |
| `RESEARCH_AGENT_STEPS` | 12 | Research steps per question |
| `SPEA_DIRECTORY_FEED` | 1 | Use SPEA's own data feed |

Brave charges about $5 per 1,000 searches, according to a third-party price page; check Brave's own page. So 1,000 a month is about 18 AED.

## Tests

`tests/research-web-evidence.test.mjs` is scripted, using synthetic sites plus SPEA fixtures. It covers:

- the live failure case;
- reworded searches;
- a listing-site name confirmed on SPEA;
- a website statement;
- unconfirmed names with their page cited;
- a disagreement stated;
- claims coming only from the regulator or a school's own site;
- a city with no regulator;
- an early stop being overruled;
- turn-limit ceilings;
- separate pilot and beta search counters.
