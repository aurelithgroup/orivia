/* Staff-maintained review workflow. Run after checking the guide and sources, then commit/review normally.
   node tools/review-guide.mjs <guide-id> <public-reviewer-label> <uae|uk> <checked-YYYY-MM-DD> <review-due-YYYY-MM-DD>
   This records a human review, not a live fetch. It does not deploy or grant a model publishing rights. */
import fs from 'node:fs';
import {guideContent} from '../workers/orivia-guide-offers.mjs';
import {contentVersion,validateReview} from '../workers/orivia-guide-reviews.mjs';
import {GUIDE_REVIEWS} from '../workers/guide-review-records.mjs';
const [id,reviewer,jurisdiction,checkedAt,reviewDue]=process.argv.slice(2),g=guideContent(id);
if(!g)throw Error('Unknown guide');
const record={status:'reviewed',version:contentVersion(g),reviewer,jurisdiction,checkedAt,reviewDue,sources:g.sources.map(s=>({url:s.url,checkedAt}))};
if(checkedAt>new Date().toISOString().slice(0,10)||!validateReview(g,record))throw Error('Supply a public reviewer label, jurisdiction and valid review dates (within one year).');
fs.writeFileSync('workers/guide-review-records.mjs','// Human source reviews; content changes invalidate the approval.\nexport const GUIDE_REVIEWS='+JSON.stringify({...GUIDE_REVIEWS,[id]:record},null,2)+';\n');
console.log('Review record prepared. Commit for staff review; nothing deployed.');
