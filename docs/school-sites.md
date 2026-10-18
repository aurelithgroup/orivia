# School websites anchored to SPEA (`workers/orivia-school-sites.mjs`)

Owner: Cleo (retrieval). Recognising "all schools" requests, keeping named-school corrections and answering the question stay with Ina.
**Not wired into `orivia-research.mjs` yet.**

## Flow for a named school

1. **Identity from SPEA** (`lookupSpeaSchool`).
   - `match`: one listing contains every distinctive word typed, or an essentially exact name.
   - Anything else (`candidates`, `not-found`, `unavailable`, `needs-name`) is returned as it is, and **no website is searched or read**.
2. **Candidate websites**, in this order:
   - SPEA's own "Website" link on the profile;
   - the domain of a non-SPEA email that SPEA lists;
   - one budgeted web search for the **exact SPEA name**: `"<SPEA name>" Sharjah school`.
   - Search results only *nominate* hosts. Titles, snippets and ranking are discarded.
   - Never candidates: directories, social networks, news, recruiters, government or registry hosts, IP addresses, localhost and non-standard ports.
3. **Establish the domain** (`establishDomain`). A host is evidence only when one of these holds:

   | basis | meaning |
   | --- | --- |
   | `regulator-link` | SPEA's profile links to this site |
   | `regulator-email` | SPEA lists an email at this domain |

   - **A name and phone number on a page are never proof**: both can be copied (changed 18 Oct after Ina's review).
   - Otherwise the host is `unverified`. The research loop can still show its statements, but only labelled "ownership not confirmed by a regulator".
4. **Read the site by section:** menus, headers, footers, breadcrumbs, cookie banners and "related / other schools" blocks are removed. Short menu labels like "British Curriculum" are never read as statements; labelled fields (`Curriculum: …`, `Grade: …`) and full sentences are. Each fact carries its section heading.
   - "Year" (British) and "Grade" (US/MoE) ranges are kept apart and never converted. `yearEvidence(facts, 6)` counts only Year-scale ranges.
5. **Pages read:** the homepage plus up to 4 same-site pages (admissions, curriculum, contact, about, fees). Paths only; no PDFs.
6. **Return the school's own statements**, each tied to its page:
   - `curriculum`, `year-groups`, `admissions-page`, `phone`, `email` (only addresses at the school's own domain);
   - `source: {url, host, kind: "school-website", scope: "school-own-statement"}`.
   - Sentences about rules for all schools ("all schools in the UAE must…") are **not** read as the school's curriculum.
     A school website can't establish government or regulator requirements.
7. **SPEA and website facts are kept separately.** If the curriculum differs, `site.differences` flags it and nothing is merged or resolved.

## Output of `lookupSchoolWithSite({name}, {spea, site})`

```jsonc
{
  "status": "match",                       // or candidates | not-found | unavailable | needs-name (then school/site are null)
  "candidates": [ /* from SPEA */ ],
  "school": {"name": "…exact SPEA name…", "url": "https://spea.shj.ae/…", "fields": { /* SPEA facts with quotes */ }},
  "site": {
    "status": "established",               // or unverified | none-found
    "host": "victoriaenglishschools.com", "basis": "regulator-link",
    "evidence": [{"kind": "regulator-link", "quote": "Website (Opens in a new tab)", "sourceUrl": "https://spea.shj.ae/…"}],
    "facts": [{"key": "curriculum", "label": "Curriculum (school’s own statement)", "value": "British",
               "quote": "We follow the National Curriculum for England from FS1 to Year 13.",
               "source": {"url": "https://victoriaenglishschools.com/", "host": "…", "kind": "school-website", "scope": "school-own-statement"}}],
    "pagesRead": ["…"], "differences": []
  },
  "coverage": {
    "spea": { /* lookupSpeaSchool coverage */ },
    "site": {"searched": [{"step": "web-search", "status": "searched", "results": 10}],
             "hostsConsidered": [{"host": "…", "from": "web-search", "status": "unverified", "reasons": ["no-matching-contact-on-site"]}],
             "pagesOpened": 4, "failures": []}
  }
}
```

## Limits and spending

- Per named lookup:
  - SPEA: 1 directory fetch, 1 SPEA-restricted search, up to 8 profiles.
  - Website: at most 1 web search (skipped when SPEA links the site), up to 3 candidate hosts (homepage plus one contact page each), then up to 5 pages on the established site.
- Every page: 6.5 s timeout, 800 KB cap, manual redirects with one same-site hop allowed (e.g. to `www.`).
- Both searches use the shared daily and monthly budget. If the budget is used up, SPEA identity is still returned and the website step reports `search-limit`.
- **Policy change for review:** school websites are not in the fixed research registry. This module allows reading one only after it's tied to a SPEA listing as above, for that request.

## "All schools" (`discoverSpeaSchools`)

- `coverage.exhaustive` is always `false`.
- `coverage.seenTotal` counts distinct schools shown so far, including `exclude`, alongside SPEA's stated total (`coverage.directory.total`, e.g. 136).
- `nextCursor` continues without repeating; `exclude` keeps earlier results out.
- A bounded search must never be described as the full list.

## Live investigation: "Sharjah International Private School" (17 Oct 2026, via web tools, not the Worker)

- **SPEA's own document:** the School Performance Review PDF (2023) names "Sharjah International Private School", with the curriculum "Dual English National Curriculum and MoE" at Al Qarayen, Sharjah.
  The reader can't use this yet because it doesn't parse PDFs.
- **Third-party listings** (not evidence) show a "(British) branch" and a "(MoE) branch" at the same address. SPEA may have **two listings**, which would correctly come back as `candidates`.
- **A current SPEA profile URL wasn't found** from here. The guessed slug and old numeric URL failed to load in my tools.
- **Possible website:** a third-party listing gives `info@sips.ae`, so `sips.ae` is a lead only. It is used only if SPEA links it, lists an `@sips.ae` email, or the site shows SPEA's listed phone and the school's name.
- **Near-miss:** "Sharjah American International School" must never be substituted. Its score is 0.545, so it's a candidate, never a match.

## Fixtures

- SPEA pages as in `docs/spea-reader.md`.
- Every school website in `tests/school-sites.test.mjs` is synthetic (`.example` hosts or `[Synthetic]` text).
- `tests/fixtures/sites/gems-wesgreen-outline.html`: the real GEMS Wesgreen page, rebuilt from a structured outline of the live page. Menus, key facts and related schools are exact; two paragraphs were paraphrased by the fetch tool. Raw HTML couldn't be fetched from this workspace.
- **Raw captures:** `node tools/capture-site.mjs <url>` saves a real page to `tests/fixtures/sites/captured/`. Add its expected facts to `expectations.json`; `tests/site-captures.test.mjs` then checks every capture.
