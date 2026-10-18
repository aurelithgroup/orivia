# Raw school-site captures

`sips-home.html.gz` and `sips-curriculum.html.gz` contain unchanged server HTML (gzip-compressed), preceded by a source-URL comment. These are real captures, not reconstructed pages. `tests/site-captures.test.mjs` reads both plain HTML and gzip captures.

Ina review of ee401d2:
- Both yield an explicit British curriculum fact, although the homepage evidence comes from a teacher biography and applies to FS2 there.
- Neither captured page yields evidence explicitly listing Year 6. That is missing evidence, not proof the school lacks Year 6. The correct answer must preserve that distinction.
- `sitePageLinks(home, "https://sips.ae/", "sips.ae", 3)` selects `/british-section/head-of-eyfs/`, `/admissions/admission-process/`, `/about/location/`. Leadership links must not outrank substantive curriculum pages; direct contact pages should outrank generic location pages for contact requests.
- Curriculum content page: https://sips.ae/british-section/curriculum-and-learning-2/curriculum-at-sips/
- Contact page linked by homepage: https://sips.ae/admissions/where-next/contact-us/

Use these as general-layout regression cases, never production school-specific rules.
