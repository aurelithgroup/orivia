# Browser directory tool

`workers/orivia-browser-directory.mjs` reads a regulator's filtered directory when the server only renders the first page. SPEA's directory sends 10 of 136 schools, and its filters only work in a browser. It is off unless `BROWSER_DIRECTORY=1` on the private pilot Worker.

## Data endpoint check

On 18 Oct 2026 the rendered SPEA page showed no public data endpoint. WebFetch strips scripts, though, so this isn't conclusive. **Ina:** please open the directory in a desktop browser, apply the British filter and check the Network tab. If a public JSON request returns the filtered list, a plain fetch adapter should replace the browser (cheaper and simpler). Return the same output shape described below.

## Input and output

`listDirectory({recipe:'spea', filter:{curriculum, year}}, {launch, budget, limits})`

The only input is a curriculum key, and it must appear in the recipe's options. Chat text, names, profiles and documents never reach the tool.

The result has these fields:

- `status`: `ok`, `partial`, `unsupported-filter`, `browser-allowance-exhausted` or `browser-unavailable`.
- `complete`: true only under the rule in "When it says complete".
- `filter`: the filter actually applied. `unappliedFilters` lists any it couldn't apply; a year is always listed here, because the cards don't show year groups.
- `total` and `range`.
- `items`: entries of the form `[{name, url, fields:{curriculum:{value,quote}, area?}}]`. URLs are approved SPEA record pages.
- `reason`: one of `cards-not-loaded`, `filter-not-applied`, `navigated-away`, `action-limit`, `timeout`, `not-all-results-read`.
- `browserMs`.
- `diagnostics`: actions, steps, blocked request count, and blocked **hostnames** (no paths or content).

`speaListFiltered({launch, budget})` adapts the tool to `R.listFiltered`, which the research agent's `regulator_listing` action uses.

## Recipe (observed labels only)

SPEA (from the live page, 18 Oct 2026):

1. Open `/en/education-institutes/schools`.
2. In the "Curriculum" group, click the option (British, American, Indian, IB International Baccalareate, FRENCH, German, Australian, Pakistani, Pilipinas, SABIS).
3. Click "Apply Filter".
4. Wait for the cards to load.
5. If the range ends before the total, set "Rows Per Page" to 100.
6. If it still ends before the total, use a Next button (at most 4 pages).

Clicks match exact visible text inside the named group. The tool never clicks links.

**Not yet checked live:** whether the option is a checkbox, a label or a custom list, and how "Rows Per Page" opens. If a step returns `not-found`, the result is `partial` with that step's name in `diagnostics.steps`, so a reviewer can see exactly which label needs adjusting.

## Boundaries (enforced in the tool)

- **Read-only:** only GET and HEAD requests. Images, media and fonts are blocked. Requests to any other host are blocked, and so is navigation to another host. After every action the page must still be on the directory path.
- **Asset hosts:** if SPEA loads scripts from a CDN, the page won't work until that host is added to the recipe's `assetHosts`. The blocked host names appear in `diagnostics.blockedHosts`.
- **Bounded:** one browser session, 45 s and 14 actions at most. The session closes in `finally`.
- **Budget:** the full 45 s is reserved from the shared ledger's `browser` meter (`BROWSER_DAY_SECONDS`, `BROWSER_MONTH_SECONDS`) before launch.
  - Afterwards it settles to the time actually used.
  - If closing fails, the whole reservation is kept, because the session may run on until the platform timeout.
  - If no allowance is configured, no browser is launched.

## When it says complete

All of these must hold:

- every card on the page matches the filter;
- the same cards and counter appear on two reads in a row;
- the de-duplicated links equal the displayed filtered total;
- the range ends at that total.

So a counter that updates before the cards never establishes completeness: the cards are still unfiltered, or they don't match the count yet. On a timeout or a short render, the tool returns `partial` with what it actually read. Being in the directory never confirms year groups or seats; the agent says so whenever a year was asked about.

## Long lists

The agent shows complete lists 8 entries at a time, which fits the reply, card and source limits. The other entries are queued as regulator record URLs, and "more" re-opens them so the profiles get checked. Each page tells the person "I've shown N of the T", and the last one says "That's all T".

## Tests

`tests/browser-directory.test.mjs` uses a scripted fake browser, not a live run. It covers:

- the counter running ahead of the cards;
- 25 of 28 rendered;
- cards never loading;
- host, method, type and navigation blocking;
- leaving the page;
- an exhausted allowance, an unsupported filter and no binding (no launch in any of these);
- launch failure, close failure and the action limit;
- a year that isn't confirmed by directory membership;
- 28 schools paged over 4 turns with no repeats.
