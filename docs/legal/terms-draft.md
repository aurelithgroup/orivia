# Orivia Terms: DRAFT (Cleo, 28 October 2026)

> **Not published. Not legal advice.** This is product copy written against the code at `3e6022b`, for Ina's review.
>
> **Public launch blocker.** The `[OPERATOR: …]` gaps block any public launch of this release; Terms are never published with them left open.
>
> The liability and governing-law sections need someone qualified to review them before publication.
>
> **Branch-specific, pending reconciliation.** This draft describes `myorivia-release-plan` only. Ina's branch `ina/founder-ai-sponsorship-block-3-2026-10-25` already implements things this branch doesn't have yet:
> - account-scoped data requests with owner replies (`/api/me/data-requests`, `/api/admin/privacy-requests`);
> - member-bound sponsored placements with disclosure validation (`49bad94`, `2c14591`);
> - its own version of the progress-sharing controls.
>
> Where this draft says something isn't available, it means **on this branch**, not in the product. Before publishing, the draft is reconciled with whichever code is actually released.
>
> **Reconciliation checklist:** `docs/legal/reconciliation-combined-release.md` (14 features). The `[INCLUDE IF RELEASED]` paragraphs follow it.

---

## Who we are

These Terms are an agreement between you and **[OPERATOR: legal name]**, **[OPERATOR: address]**.

Contact: **[OPERATOR: public contact email]**.

## What Orivia is, and isn't

Orivia helps you find and organise information about settling in the UAE and the UK. **It doesn't replace official advice, and it isn't legal, immigration, medical or financial advice.**

- **Official requirements change.** Before you act on a rule, fee or deadline, check it on the official page Orivia links to, or with the authority.
- **Replies come from AI working with web pages.** Orivia checks each fact against the page it cites and labels where it comes from:
  - official pages;
  - your university;
  - an organisation's own site;
  - listing sites;
  - other people's experiences;
  - your own documents.

  It can still be wrong or out of date. Opening a page isn't proof that the page is correct.
- **Universities write their own guidance**, which Orivia shows as theirs. Orivia doesn't confirm it on their behalf.
- **Orivia isn't connected to any visa, immigration or university records system**, unless a screen clearly says so.
- **Sponsored content is labelled as sponsored.** It's never presented as official.

## Your account

- **Guests and accounts:** you can use Orivia as a guest or with an account. An account is opened with an email address you control.
- **Your email inbox:** keep access to it safe, because anyone who can read it can sign in.
- **Minimum age:** **[OPERATOR DECISION: minimum age and any parent or guardian rule]**.
- **Deleting your account:** you can do it at any time in Settings. What's removed, and when, is set out in the Privacy information.

## University spaces

- **Joining:** you join a university space by invitation, and its staff approve your request.
- **The university's part:** each university is responsible for what it publishes and for how its staff use its space.
- **What staff can and can't see:** this is described in the Privacy information.
- **Leaving:** you can leave a university space at any time.

## Fair use

**Please don't:**
- use Orivia to break the law or to harm, harass or impersonate anyone;
- upload content you have no right to share, or someone else's identity documents without their permission;
- try to get at another person's data, another organisation's space or the service's systems;
- automate or scrape Orivia;
- get around its limits or human check.

**Limits:** Orivia has daily and monthly limits on AI replies, searches and sign-in emails, to keep costs fair. When a limit is reached, Orivia says so.

We may suspend access that breaks these rules, and we'll tell you why where we can.

## Your content

- **What stays yours:** your messages, documents and plans.
- **What we do with it:** you allow us to store and process them only to provide Orivia, as the Privacy information describes.
- **Shared links:** when you share a reply, anyone with the link can read that copy until you withdraw it.

## Availability and changes

- **Development:** Orivia is still being developed. Features can change, and the service may be unavailable at times.
- **Notice:** we'll give notice of significant changes where we can.

## Features that depend on the combined release

These paragraphs are kept, cut or rewritten to match what is actually released (`docs/legal/reconciliation-combined-release.md`).

- **[INCLUDE IF RELEASED: sponsored placements]** Sponsored items are always labelled as sponsored. They're never presented as official information, never used as evidence in answers, and never affect which answers you get.
- **[INCLUDE IF RELEASED: plan allowances]** Some features may have monthly allowances (Free, Plus, Premium). The basics stay free. Keeping your files never depends on your plan.
- **[INCLUDE IF RELEASED: university support]** Support requests are answered by your university's team, or by Orivia support if you allow forwarding. Responses are best-effort and not an official service of any authority.

## Payment

Orivia is free to use at the moment. Paid plans, if added, will have their own terms, shown before you pay.

## Liability

**[NEEDS QUALIFIED REVIEW: limitation of liability, consumer rights that can't be excluded, and how they apply in the UAE and the UK.]**

## Governing law and disputes

**[OPERATOR / NEEDS QUALIFIED REVIEW: governing law, courts, and any consumer protections in the user's country.]**

## Changes to these Terms

We'll update this page and its date. If a change matters for you, we'll tell you in the app before it applies.

Last updated: **[date of publication]**.

---

## Where each statement comes from (for review; not published)

| Statement | Source |
|---|---|
| Facts checked against cited pages and labelled by source | `verifyReply` and `CLAIM_SOURCES` in `workers/orivia-assistant.mjs`; `tests/research-set-uae-uk.test.mjs` |
| Opening a page isn't proof | ORI-LEGAL-005 |
| University guidance labelled as theirs | "University instruction (Northbay, updated …)" in `docs/connected-orivia-plan.md` |
| No records integration | `applicationProgress.available=false` (Ina's step 9 review); ORI-STUDENT-003 is blocked |
| Sponsored content labelled | ORI-BUSINESS-003. Implemented on Ina's branch (`49bad94`, `2c14591`); this branch has none yet. The wording follows the released implementation (reconcile) |
| Join by invitation, with staff approval | `/join/<org>` flow, `docs/myorivia-release-plan.md` |
| Limits on replies, searches and emails | `docs/myorivia-release-plan.md` (money limits, search caps, email caps) |
| Free for now | billing is deferred (ORI-BUSINESS-004) |
