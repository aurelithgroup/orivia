# SPEA school reader (`workers/orivia-spea-reader.mjs`)

Owner: Cleo (source reading). Conversation planning, deciding "more options" vs "check this school", and answer wording stay with Ina.
**Not wired into `orivia-research.mjs` yet.** Integration is Ina's call after review.

## What SPEA's current site does (checked 17 Oct 2026)

- `https://spea.shj.ae/en/education-institutes/schools` server-renders **only the first 10 of ~136 schools** ("1-10 of 136").
- Pagination, rows-per-page and filters (curriculum, area, grade, gender, rating, fees, special needs) run in the browser.
  The server ignores `?page=2`, `?pageSize=100` and `?curriculum=British` and returns the same first 10.
- There is **no name search** on the directory.
- On page 1 the only British schools are Wes Green and Victoria English. That is why Orivia kept returning those two.
- Each school has a profile at `/en/education-institutes/schools/<slug>` with `Curriculum: …`, `Grade: …`, `Gender: …`,
  a "School Location" map link, Phone Number, Email and sometimes Website.
- Search indexes still list older `/en/educational-institutions/schools/<id>` URLs. Some are gone.
- I could not see the browser's data request (rendered text only from here). If Ina can capture it (browser devtools,
  Network tab, change page or filter), it may let us page the directory directly. That would be an additional source and needs a policy review.

## How the reader finds more

1. Read directory page 1 (one fetch).
2. If that isn't enough, one Brave search restricted to `site:spea.shj.ae`, using fixed terms plus a curriculum, or a sanitised school name.
   It reserves the shared search budget. Titles and snippets are discarded; only profile URLs that pass the source policy are kept.
3. Open at most **8 profiles per call**, in parallel, each with a 6.5 s timeout and a 1.2 MB cap.
4. Keep only what each profile states, with verbatim quotes. Curriculum and year filters use the profile's own fields.

**Redirects:** none are followed, except one from an old indexed profile URL to a current SPEA profile on the same approved host,
which is re-checked against the source policy. The result is flagged `redirected: true`. Please confirm you're happy with this exception.

## API

```js
import {speaDeps, discoverSpeaSchools, lookupSpeaSchool} from './orivia-spea-reader.mjs';
import {reserveSearch} from './orivia-research.mjs';
const deps = speaDeps({env, fetcher: fetch, reserve: reserveSearch}); // or pass your own {fetchPage, search}
```

### `discoverSpeaSchools(input, deps)` — more schools matching a curriculum

Input:

| field | type | meaning |
| --- | --- | --- |
| `curriculum` | `'british' \| 'american' \| 'indian' \| 'ib' \| …` | optional; matched against the profile's `Curriculum:` |
| `year` | number | optional; kept only if the quoted `Grade:` list includes it (listed provision, never seats) |
| `exclude` | URL[] | schools already shown; they are skipped, which is how "only two?" gets new ones |
| `limit` | number | max schools returned (default 6) |
| `cursor` | object | `coverage.nextCursor` from a previous call, to continue without re-reading the directory |

Output:

```jsonc
{
  "schools": [{
    "name": "Victoria English Pvt. School LLC",                 // exact name from the profile heading
    "url": "https://spea.shj.ae/en/education-institutes/schools/victoria-english-pvt-school-llc",
    "requestedUrl": "…", "redirected": false,
    "fields": {                                               // only fields the page states; each has its verbatim quote
      "curriculum": {"value": "British", "quote": "Curriculum: British"},
      "grades":     {"value": "FS1 | FS2 | 1 | … | 13", "quote": "Grade: FS1 | FS2 | 1 | … | 13"},
      "gender":     {"value": "Boys | Girls", "quote": "Gender: Boys | Girls"},
      "area":       {"value": "Sharjah - Al Azra", "quote": "School Location Sharjah - Al Azra"},
      "directions": {"url": "https://goo.gl/maps/…", "label": "Sharjah - Al Azra", "quote": "School Location Sharjah - Al Azra"},
      "phone":      {"value": "065227770", "quote": "Phone Number 065227770"},
      "email":      {"value": "…@spea.shj.ae", "quote": "Email …@spea.shj.ae"},
      "website":    {"url": "https://…", "quote": "Website (Opens in a new tab)"}
    }
  }],
  "coverage": {
    "searched": [{"step": "directory-page-1", "outcome": "read", "listed": 10, "total": 136},
                 {"step": "search", "offset": 0, "status": "searched", "http": 200, "results": 12, "profileLinks": 7}],
    "directory": {"listed": 10, "total": 136},
    "profilesOpened": 7, "matched": 3,
    "skipped": {"curriculum": 9, "year": 0, "alreadyShown": 2},
    "failures": [{"path": "/en/educational-institutions/schools/106", "reason": "source-not-found", "http": 404}],
    "moreRemain": true,                 // true | false | "unknown"
    "reasons": ["directory-pages-not-server-rendered", "more-search-results", "unopened-profile-links"],
    "nextCursor": {"skipDirectory": true, "searchOffset": 1, "pending": ["…profile URLs not opened yet"]}
  }
}
```

`moreRemain` is `true` when there are unopened profile links or more search results, and `"unknown"` when we can't tell.
The directory's other ~126 schools aren't server-rendered, so a complete list is never claimed.

### `lookupSpeaSchool({name}, deps)` — check a school the person named

- `name` is sanitised (letters, digits, `& . ' -`, max 80 chars) before it's sent to the search provider. Chat text is never sent.
- Output: `{status, candidates, coverage}`:
  - `match`: one clear match (`candidates[0]`).
  - `candidates`: several similar names (e.g. the seven Victoria branches). Up to 5, ranked by `score`. **Never silently picks one.**
  - `not-found`: the directory and search both ran and nothing matched.
  - `unavailable`: the checks failed, so "not found" isn't claimed.
  - `needs-name`: only generic words like "the school".
- Each candidate has `name`, `url`, `score`, `from` (`profile` or `directory-card`) and `fields`, the same shape as above.
  `directory-card` means the profile couldn't be opened: the name and link are official, but there are no profile facts.
- Name matching ignores generic words (Pvt, Private, School, LLC, Int., International, SHJ, Branch…) and treats "Wesgreen" as "Wes green".

### Failure reasons

| reason | meaning |
| --- | --- |
| `source-not-found` | 404, often an old indexed URL |
| `source-redirected` | a redirect that isn't the allowed old-to-current case |
| `source-timeout` | page took longer than 6.5 s |
| `source-blocked` | bot check page |
| `source-too-large` | page over 1.2 MB |
| `profile-unreadable` | no name or `Curriculum:` field |
| `search-limit` | shared search budget used up; no call was made |
| `search-unavailable` | provider error, with its HTTP status |
| `not-configured` | no search key |

## Spending and limits

- Per call: 1 directory fetch, at most 1 search (reserved through the shared daily and monthly caps), at most 8 profile fetches.
  A continuation opens pending links before it searches again.
- Search offset is capped at 9 (Brave's maximum).

## Fixtures

- **Verbatim captures** (Ina): `spea-current-directory.html`, `spea-current-profile.html`, `spea-school-contact-section.html`.
  The last two are joined in `spea-profile-wesgreen-full.html`.
- **Reconstructed from the rendered live page:** `spea-directory-page1.html` (real names, links, curricula and the 1-10 of 136 range; card markup from the verbatim capture) and `spea-profile-victoria-english.html`.
- Profiles named `[Synthetic] …` in the tests are invented.
