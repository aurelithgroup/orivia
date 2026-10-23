# SPEA direct directory adapter

Added after the private browser run still timed out at `cards-not-loaded`, despite the filter/Apply clicks and one allowed read-only POST. This is a different failure from the previously blocked POST. No claim is made that those browser rendering/parsing issues are solved.

`SPEA_DIRECTORY_FEED=1` enables a private-only regulator adapter that reads SPEA's published page configuration and then its exact public `/api/graphql-proxy` directory endpoint. It takes only the validated curriculum. Current folder IDs, template IDs and curriculum option IDs come from the fetched page, not a permanent list of schools or hard-coded SIPS lookup.

The adapter is a tool in the research agent, not a substitute for task understanding. Requests and responses are bounded. Redirects are refused; fetches consume the existing 24-per-turn fetch budget. There are at most three data pages, each up to 100 records. Every record must have an approved SPEA profile URL, a unique name/URL record, and matching curriculum. A total mismatch, cursor loop, invalid data or partial paging cannot establish completeness. Year groups and vacancies are not inferred from membership.

Directory records cite the directory rather than pretending their individual profile pages were opened. The reply explains what SPEA means and that the directory covers the whole emirate. Results still display eight at a time.

The fixture HTML is a labelled extract of real published `__NEXT_DATA__`, not a full page capture. The JSON fixture is a real response saved on 18 October 2026; it contains 27 British-filter records, total 27, hasNext false. Tests also cover malformed results, duplicates, wrong curricula, redirects and fetch-budget exhaustion. Scripted goals with captured/live evidence are distinguished from a live AI-run conversation.

Activation: the private pilot uses the feed adapter when `SPEA_DIRECTORY_FEED=1`. `OPENAI_PILOT` remains 0. `BROWSER_DIRECTORY` can remain 0 because this path does not launch a browser or use Brave Search. The public beta is not changed by this private switch.
