# Session 2 review candidate (30 Oct 2026)

**Candidate (frozen):** `55951418d32d7ea6bda461fd7bf49a3673123040` on `myorivia-release-plan`.
**Review baseline:** `6e660b1655a5a7714266dfa8b7c4a1c0ba65e42d`. The range has 8 commits, 50 files, +3208 −130:

```bash
git diff 6e660b1655a5a7714266dfa8b7c4a1c0ba65e42d 55951418d32d7ea6bda461fd7bf49a3673123040
```

**Status:** implemented and locally verified, awaiting Ina's independent review. **Nothing here is accepted.** Live acceptance waits for the hold to lift, and its scope and authenticated access are still to be agreed. No features are added after this candidate; review findings are fixed on top of it.

## What to review

| Area | What changed | Main files |
|---|---|---|
| 22 · Guided welcome | One welcome screen from the join link, name asked once, campus defaults shown not asked, editable details, a first step; existing accounts keep data, terms and AI choice | `workers/trial-ui/accounts.js` |
| 24 · Support | Team assignment (admins only), filters, linked process steps inside the organisation boundary | `workers/accounts/support-escalation.mjs`, `restored-ui.mjs` |
| 21 · Guides | Student preview in the staff editor; drafting checked without OpenAI | `workers/accounts/platform-ui.mjs`, `tools/browser-checks/guide-drafting-check.mjs` |
| 23 · Campus directory | Directory details on contacts; "not provided" for unknowns; no map links for demo organisations; fictional Northbay entries | `workers/accounts/content-details.mjs`, `workers/trial-ui/spaces.js`, `tools/demo/` |
| 16 · Sponsorships | Ina's campaign controls (selectively); a labelled Sponsored section for students | `workers/accounts/sponsorships.mjs`, `restored-ui.mjs`, `spaces.js` |
| Submission readiness | Zoom, rough quality note, pages prompt, limits, in the photo review | `workers/trial-ui/image-review.js` |
| Guides | School start and return; nine Dubai source checks; unsupported claims qualified in the text | `js/content*.js`, `js/context.js`, `js/simple.js`, `workers/guide-source-checks.mjs`, review pack sections 11–12 |
| Local server | Serves the real app page; local-only helpers `/__dev/as`, `/__dev/sql`, `/__dev/demo` | `tools/browser-checks/accounts-local-server.mjs` |

## Rerun the checks (no founder testing needed)

```bash
node tools/run-ci-local.mjs out.json
```

That runs all 144 CI commands; the result at the candidate was 144 of 144. Individually:

```bash
node --experimental-sqlite tests/university-workflow-real-server.test.mjs
node --experimental-sqlite tools/browser-checks/welcome-real-browser.mjs
node --experimental-sqlite tests/campus-directory-real-server.test.mjs
node --experimental-sqlite tools/browser-checks/campus-directory-browser.mjs
node --experimental-sqlite tests/sponsorships-real-server.test.mjs
node --experimental-sqlite tools/browser-checks/sponsorships-browser.mjs
node tests/submission-readiness.test.mjs
node tests/claims-qualified.test.mjs
node tests/school-start-return.test.mjs
node --experimental-sqlite tools/browser-checks/guide-drafting-check.mjs
```

The last one needs internet and isn't in CI.

**Evidence:** `docs/evidence/*-2026-10-29.json` and `*-2026-10-30.json`, each with its run times.

## Known items for this review

### Visual
- The new screens use the existing styles and have had no design pass: welcome, support filters, directory cards, sponsored section, the photo review panel, and the staff preview.
- On the Dubai school steps, the "checked through search" note sits inside "More details".
- The sponsored card says "paid" twice when the disclosure already says it.

### Language (Arabic, French)
- 13 guide steps carry "Arabic not yet reviewed" (`translationPending`).
- At least 11 new interface strings aren't in the translation dictionary yet: 8 in `accounts.js` and 3 in `image-review.js`. The automatic scan misses strings built another way, so check each new screen in Arabic and French.
- Right-to-left layout of the new screens hasn't been checked.

### Accessibility
- Zoom, screen reader, and keyboard order in the photo review dialog, the support filters and the directory.

### Integration
- Each flow passes on the real local server separately. One run with all flows together on one server is Session 2's job.

### Guide content
- Review pack sections 1–12, especially the "Not confirmed" and "via search" rows.
- **Approvals:** record one with `tools/review-guide.mjs` only after a person's review passes.

### Policies
- Privacy and Terms need operator details.
- Check the drafts' `[INCLUDE IF RELEASED]` items against this candidate's features, including the new ones: sponsorships, the directory, and submission readiness.

## Not verified anywhere yet

- Live: real D1, email sign-in, the deployed page, OpenAI drafting, budget limits, rollback. Blocked by the hold.
- AI drafting quality: the model step.
- 12 Dubai guides still have no source check (`docs/remaining-checklist-2026-10-30.md`).

## Midnight

Ina assesses the preserved recovery evidence: the bundle, the extracted modules, the local build of `4d6b0e9`, and the comparison with hashes. It is held privately outside the repository; the summary is in `docs/midnight-source-investigation-2026-10-29.md`. Nothing assumes she can confirm authorship or locate `cdab3b5`. Deployment stays held until reconciliation.

## Fixes on top of the candidate (30 Oct)

The candidate commit itself is unchanged. These are fixes for review findings, with evidence in `docs/evidence/session2-checks-2026-10-30.json`:
- **Guide caveats in the app:** `guideContent` (`/v1/guides/<id>`) now carries `viaSearch` and `translationPending`. The app's guide view shows "checked only through search" and "not reviewed in your language" before the affected step's instructions. A headless-Chrome check covers the served route and the renderer, in English and Arabic, entering the app through its own guest screens; it is in CI.
- **Right-to-left:** English guide text in the Arabic interface now reads left to right (`dir=auto` per line).
- **Accessibility:** the photo dialog's heading level and the preview's label are fixed. The automated checks on the support, guides, owner and student screens were clean. Not a screen-reader or zoom test.
- **Combined flow:** the workflow, directory and sponsorship replays pass in sequence on one server: 141 steps.
- **Language:** 29 guide view interface strings have no Arabic or French entry yet; they are listed for the language reviewer, not translated. The three new caveat phrases have Arabic and French written by Cleo, which need review.

## Later fixes (30 Oct, after `b5053e5`)

- **Language fallbacks recorded honestly:** `docs/language-matrix.md` now lists where French and Arabic still show English:
  - guide view interface strings (29 of 60);
  - some welcome and account strings;
  - the photo review;
  - guide content in the chat app;
  - university content as written.
  
  `tests/language-fallbacks.test.mjs` recounts them, so the record can't go stale. No translations were added; expanding them stays deferred.
- **Sponsored card:** who paid is said once. "Paid for by …" appears only when the disclosure doesn't already name the sponsor.
- **Website app:** the "checked through search only" note now sits at the top of the Dubai school steps, before their instructions, in English and Arabic. It no longer appears only under "More details".

## Who does what next (feature work frozen at `bd3d93d`)

| Check | Status | Owner |
|---|---|---|
| Reflow, keyboard and contrast checks (local, headless Chrome) | **Done 30 Oct**: 7 screens plus the photo dialog, at full width and at narrowed widths (640 and 195 CSS px) that approximate 200% zoom reflow. 4 defects found and fixed, then 0 issues (`docs/evidence/visual-keyboard-reflow-2026-10-30.json`). In CI | Cleo |
| What that check is not | Not real-device, browser-zoom or OS text-size acceptance. Contrast is approximate. Chrome only. No screen reader | Recorded |
| Independent review of the candidate and fixes | Pending | Ina |
| Midnight evidence (ZIP and private branch) | Pending | Ina |
| Visual judgement of the screenshots (sent privately for Ina's review) | Pending | Part of Ina's review |
| Screen reader (VoiceOver, TalkBack or NVDA) | **Pending; not arranged.** Nobody has yet been confirmed with this setup | To be arranged |
| Real browser zoom and OS text size, on real phones and desktop browsers | **Pending; not arranged.** No physical-device testing has been arranged | To be arranged |
| Arabic and French: text written by Cleo, and the 13 steps marked not reviewed | Pending | A language reviewer (to be arranged) |
| Guide content review, then approvals with `tools/review-guide.mjs` | Pending; no approvals before review | A person reviewing content (Ina, if she takes it on) |
| Privacy and Terms | Drafts updated against the candidate, and the sponsor and response-timing statements corrected on 30 Oct. Missing operator fields are listed in each draft. `tests/legal-drafts.test.mjs` checks the code claims | Cleo (done) · qualified review before publishing |
| Operator details (legal name, address, contact emails, minimum age, partner-application retention) | Missing | **Bee** |
| Live acceptance | Waits for reconciliation, review and Bee clearing the hold | After those, as agreed then |
