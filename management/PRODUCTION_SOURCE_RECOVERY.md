# Verified production source recovery (25 October 2026)

Cloudflare Worker `orivia-production` deployment `773c9f0e-5baf-4175-bf3c-ee02bdb13f4b` (version `b9e32ffc-e13d-4c5b-85cf-d7cbdf4a3f94`) contains an embedded deployment source map.

The source map includes full `sourcesContent` for 650 source entries, including first-party `accounts/platform-ui.mjs`, `accounts/organisations.mjs`, `accounts/handler.mjs`, and `orivia-production.mjs`. This means the production application source can be recovered from the deployed bundle, rather than reconstructed from the older web app.

Important: The repository is public. **Do not upload the complete unreviewed production source map or backend files to this public repository.** First review for embedded secrets, personal data, internal URLs, and license-sensitive dependencies. Preserve the original bundle and source map privately, then prepare a reviewed source tree in a suitably access-controlled repository and compare it to the deployed version.

Integration sequence:
1. Export and back up the deployed bundle and source map into an access-controlled location.
2. Extract first-party `sourcesContent` and inspect all imports and security-sensitive material.
3. Rebuild and compare the current production management app without modifying live deployment.
4. Integrate the Midnight Executive Owner view into `accounts/platform-ui.mjs`, preserving organisation creation and invitation flows.
5. Implement the Owner-only aggregate reporting endpoint in the recovered backend; do not expose individual records.
6. Run auth/privacy, data, mobile and rollback tests, then pilot deployment.

The production Worker has not been modified. This file is an audit note, not a claim that the source has already been backed up or integrated.
