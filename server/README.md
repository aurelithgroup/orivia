# Orivia server

A Cloudflare Worker with a D1 database. Cloudflare deploys this folder automatically whenever it changes on GitHub.

- `/team`: the Orivia team page: every organisation, who can edit it, and its numbers.
- `/org`: an organisation's page: contact details, notes on each step, numbers, link and QR.
- `/api/partners/<id>`: what the app reads to show an organisation's notes (public).
- `/api/ev`: anonymous counts from people using an organisation's link (no names, nothing typed).

Sign-in is Cloudflare Access (an email code). Until `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` are set in `wrangler.toml`, the team and organisation pages stay locked.

`src/content.js` is generated from the app's journeys. Regenerate it when journeys or stages change.
