# Remaining week 5–7 pitch work: one checklist (30 Oct 2026)

Reconciled against the code on `myorivia-release-plan` (implementation checkpoint `4957fd6`, plus Session 1's commit). The review baseline stays `6e660b1`. Nothing here is accepted. **Implemented and locally verified** means: built, tested in CI, and checked on the real local server where it can be. It still needs Ina's independent review, the Session 2 checks, and live acceptance after the hold.

Owners: **C** = Cleo, **I** = Ina, **B** = Bee (founder). Items marked ⛔ are blocked by the deployment hold.

## Session 1: implementation and content

| # | Item | State | Owner |
|---|---|---|---|
| 1.1 | School start and return (scene 7) | **Done 30 Oct:** two new steps on each school guide (Dubai, Edinburgh). Partial source checks recorded. Dubai's KHDA claims are via search, at draft level, and labelled. New Arabic is marked not yet reviewed | C |
| 1.2 | Dubai source checks | **8 more guides recorded as partial** (nol, taxi, SIM, rent, work rights, student work, bank, employee insurance), plus `dubai.school`. **12 still have none:** airport, UAE PASS, student health, student, family, self and visitor insurance, community, and Emirates ID for employees, family and self-sponsored. One claim is not confirmed (student work "part-time, temporary, flexible or remote") and one conflicts between Sanadak's own pages | C |
| 1.3 | AI guide drafting | **Verified without OpenAI:** real page reading, the exact-quote check, refusal of invented quotes, the consent gate, and the endpoint's safe refusal without a budget. **The model drafting itself is not verified:** it needs OpenAI and the budget database, so only after the hold | C (now) · ⛔ live |
| 1.4 | Northbay demo directory | **Done:** 10 fictional, labelled entries and a seeder that refuses non-demo organisations | C |
| 1.5 | Midnight pilot source | **Investigated read-only:** Ina's `4d6b0e9` plus an unpushed layer (two owner modules, four changed). Authorship not established. The bundle, the extracted modules, the local build and the comparison are preserved privately with hashes (`orivia-private/midnight-2026-10-29`, outside the repository) | C (done) · I assesses the evidence |
| 1.6 | Submission readiness (week 6, "kept small") | **Built 30 Oct, locally verified:** in the device photo review, a view-only zoom (rotate, retake and crop were already there); a rough resolution and blur note that warns only when measured; a pages prompt that defers to the receiving organisation's checklist; and a plain list of what Orivia can't check (completeness, authenticity, validity, acceptance). Nothing is sent and nothing is blocked | C |
| 1.7 | Arrival budget planner | Not built. The plan made it conditional on content review being on time, and it isn't: **moves to the backlog** under the plan's own rule | — |
| 1.8 | Confirmation sweep (areas 1, 5, 6, 7, 8, 27) | The scripted parts run in CI (140 checks). The Access-only parts are Ina's | I |

## Session 2: review and fix

| # | Item | Needs | Owner |
|---|---|---|---|
| 2.1 | One stable commit for Ina's independent review | **Frozen 30 Oct: `55951418`**, with a review guide at `docs/session2-review-candidate-2026-10-30.md` | C → I |
| 2.2 | Visual review (phone and desktop) of the new screens: welcome, support inbox, directory, sponsored section, preview | Screenshots from the browser checks | C + I |
| 2.3 | Arabic and French: new strings untranslated in the app's dictionary; the Arabic of the new guide steps marked for review; RTL layout of the new screens | A language reviewer | I or a reviewer |
| 2.4 | Accessibility (area 9): actual zoom, screen reader, and the older 10px tab rule | — | C + I |
| 2.5 | Real-server integration across all flows together (welcome, support, directory, sponsorship, drafting refusal) in one run | — | C |
| 2.5b | Unsupported or conflicting guide claims | **Done 30 Oct:** qualified in the guide text (review pack section 12); the changed Arabic is marked not yet reviewed | C |
| 2.6 | Guide approvals: record with `tools/review-guide.mjs` **only after a person's review passes** | Ina's content review | I (person only) |
| 2.7 | Release policies: Privacy and Terms against the combined release (14 `[INCLUDE IF RELEASED]` items) | **Operator details** | B, then C |
| 2.8 | Demo script: from `docs/demo-story-northbay-draft.md` | **Bee's approval of the story (due 30 Oct)** | B |
| 2.9 | Unavailable items to name in the demo: invoices (every cost is an estimate), operator details, pilot credentials and Access (for live checks) | — | C (list) |
| 2.10 | Editors handling support: backlog, separate permission design | — | — |

## Session 3: pilot and demo (only after the hold is cleared)

| # | Item | Gate | Owner |
|---|---|---|---|
| 3.0 | Midnight source | **Located 30 Oct:** `cdab3b5` is in the private management repository and reproduces the pilot bundle module by module. The evidence is on the private branch `cleo/midnight-reconciliation-evidence-2026-10-30`. Authorship not established | I assesses |
| 3.1 | Reconcile the Midnight layer (`cdab3b5`) change by change; never overwrite the pilot to make it easier | Ina's assessment of the evidence. Nobody assumes Ina can confirm authorship | I, B |
| 3.2 | Bee explicitly clears the hold | 3.1 done | B ⛔ |
| 3.3 | Pilot deploy preserving secrets, bindings, databases, budget caps and rollback | 3.2 | the one agreed deployer ⛔ |
| 3.4 | Seed the Northbay demo (accounts, directory, guides) on the pilot test database | 3.3; the demo admin's own session | C ⛔ |
| 3.5 | Authenticated verification through authorised access: real D1, email sign-in, the deployed page, AI drafting with OpenAI, budget limits, rollback rehearsal | Access for Ina (or Bee's authorisation) | I ⛔ |
| 3.6 | Fix failures; rehearse the demo twice on the candidate | 3.5 | C + I ⛔ |
| 3.7 | Bee's acceptance; nothing marked complete if anything fails | 3.6; Bee's manual testing resumes only when Bee says so | B ⛔ |

## Always

Production and payments stay untouched. Billing, native/App Store work and expanding to more languages stay deferred. Bee's manual testing stays paused until Bee resumes it.
