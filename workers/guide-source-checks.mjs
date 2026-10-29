/* Source checks actually performed, one record per guide (founder, 29 Oct): only these may show "Sources checked <date>".
   A journey's own "checked" field can be a shared authoring date, so it is never shown as a check.
   coverage: 'full' = every factual claim in the guide checked against its official source;
             'partial' = only the claims listed in the record were checked.
   Each record points to where the check (pages, quotes, results) is written down. A source check is not a review:
   review records are separate (guide-review-records.mjs) and made only by a person. */
export const SOURCE_CHECKS={
 'dubai.eid.student':{date:'2026-10-28',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 1'},
 'edinburgh.evisa':{date:'2026-10-28',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 2'},
 'edinburgh.counciltax':{date:'2026-10-28',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 3'},
 'dubai.docs.before':{date:'2026-10-29',coverage:'full',record:'docs/journey-review-pack-2026-10-28.md, section 5'},
 'edinburgh.gp':{date:'2026-10-29',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 8'},
 'edinburgh.rent':{date:'2026-10-29',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 8'},
 'edinburgh.work':{date:'2026-10-29',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 8'},
 'edinburgh.bank':{date:'2026-10-29',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 8'},
 'edinburgh.u22':{date:'2026-10-29',coverage:'partial',record:'docs/journey-review-pack-2026-10-28.md, section 8'},
};
const DATE=/^\d{4}-\d{2}-\d{2}$/;
export function sourceCheck(id){const c=SOURCE_CHECKS[id];return c&&DATE.test(c.date)&&['full','partial'].includes(c.coverage)?{...c}:null}
