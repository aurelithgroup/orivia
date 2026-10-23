# SPEA live directory failure — 18 October 2026

The first two private pilot turns each used about 45 browser seconds and returned the initial server-rendered directory. Agent logs show `regulator_listing` was selected; this was not an intent-routing failure.

## Confirmed first-party read endpoint

SPEA's own published JavaScript (`/_next/static/chunks/8410-362f016b113ae21d.js`) uses POST `/api/graphql-proxy`, with `query VerticalFilterList` and `query VerticalFilterListPagination`. The old browser guard blocked every POST, including these read-only operations.

The query uses configuration already published in the directory's `__NEXT_DATA__`: currentItemId, school templateId, language, and curriculum option IDs. British is an option selected from that metadata, not an inferred school name. The live equivalent query returned **total 27, 27 records, hasNext false** in a direct real request. This is a direct endpoint check, not an end-to-end pilot result.

`tests/fixtures/spea-directory-query.graphql` preserves the site's query with its actual British filter clause. A future direct adapter should derive current IDs and filter values from the page rather than permanently bake them in. Use this public official feed before invoking a browser when available. Treat first-party API facts as directory evidence; do not label individual profiles as opened unless fetched.

## Current browser fix

Allow only HTTPS POST on the exact SPEA `/api/graphql-proxy` path, no navigation, with one named directory query, English language and a bounded result count. Mutations, subscriptions, introspection, other operations, other hosts/endpoints, and arbitrary POSTs remain blocked. Browser inputs still contain only the validated curriculum, never chat text.

Also honor CSS visibility when selecting controls, open custom dropdowns before selecting hidden options, and wait for initial network settling before applying filters. Failure diagnostics now log fixed step names, blocked hostnames, read-query count, result counts and timings. They do not log request bodies, chat text, query strings or credentials.

Unit tests include the site's captured query, hostile operations and proof that a valid read POST is continued rather than aborted. The next authenticated live pilot run must still confirm filter interaction, all 27 cards loading, and the eight-result continuation flow.
