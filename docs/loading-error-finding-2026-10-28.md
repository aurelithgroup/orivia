# Task 4 owner loading error: what the code shows (Cleo → Ina, 28 October)

**Status: root cause still not confirmed.** This note narrows where the failure can come from and makes the next one findable.

How this was done:
- read-only reading of `ina/founder-ai-sponsorship-block-3-2026-10-25` (no merge, no deploy, no pilot change);
- a fix for the diagnosis gap on `myorivia-release-plan`.

The deployment hold still stands, and the pilot (`abf5b831`, source unlocated) is untouched.

## What the screen tells us

The owner page showed only "Something went wrong. Please try again."

- **Where that text comes from:** in `platform-ui.mjs` on both branches, that exact text appears only when `ApiError` gets an error code missing from `ERR`. `render()` shows `err.message`, so a crash in the browser would show its own text (for example "Cannot read properties of undefined"), not this.
- **What that means:** one of the owner view's requests failed on the server.
- **The requests on load:** `/api/admin/overview`, `/api/admin/orgs`, and the workbench's `/api/admin/operations`.
- **Recovery:** your 25 October checkpoint (`c010b60`) records that a reload recovered it. That fits a transient server failure better than a code path that always fails.

## Why nothing was in the logs

Both branches end `handleOrganisationRequest` with the same catch. Any exception that isn't a deliberate `deny()` was returned as:

- **HTTP 400** with `organisation_request_failed`;
- **with no log line**, so a database error, a failed query or a timeout looked like a bad request and left no trace;
- **with a code the page doesn't know**, so the page fell back to "Something went wrong".

## What was ruled out (from the code)

| Idea | Result |
|---|---|
| A table created earlier with fewer columns (`CREATE TABLE IF NOT EXISTS` keeps the old shape) | No. None of the 31 tables shared with candidate 9 (`9bb8666`) gains a column on your branch |
| Explicit transactions, which D1 refuses but local SQLite accepts | No. There's no `BEGIN`, `COMMIT`, `SAVEPOINT` or `PRAGMA` in your branch's server code |
| A crash in the page | No. The wording rules it out (see above) |

## Still plausible (not provable without the failing request)

- **A transient D1 error on a fresh isolate's first owner request.** That request runs every `OPERATIONS_SQL` statement before answering, so it makes many database round trips.
- **A real query error on live data** that fixtures don't have.

## Changed on `myorivia-release-plan`

These changes don't touch your branch:

- **Status:** an unexpected failure now returns **500** with `{error:'organisation_request_failed', ref}`. Malformed JSON stays 400.
- **Log line:** one line, `{event:'orivia-organisations-error', ref, method, route, error, cause}`.
  - `route` has identifiers removed.
  - `error` is the exception's type.
  - `cause` is coarse: missing-table, missing-column, constraint, database-unavailable or unexpected.
  - **Never logged:** the error's message text, request bodies, queries, names or ids.
- **The page:** it shows "Something went wrong. Please try again. Reference: <ref>." That reference matches the log line.
- **Tests:** `tests/organisations.test.mjs`.
  - The two audit-trigger cases now expect 500, and still prove nothing was saved.
  - A new case checks the log line holds no message text or identifiers.

## Suggested for your branch (your call)

The same catch is in your `organisations.mjs`, so the same change applies there. With it, the next time the page fails, the owner can read off the reference, and one log search shows the route and the cause. No Network-panel capture would be needed.

If the cause turns out to be `database-unavailable` on first load, retrying idempotent GETs once would be the next step. I haven't made that change, because the cause isn't confirmed.
