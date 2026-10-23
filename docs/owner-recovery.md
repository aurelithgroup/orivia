# Owner recovery and transfer (ORI-AUTH-010)

Orivia's platform owner role lives in one table, `platform_roles` (accounts D1). No route in the app grants, removes or
transfers it. A request can't make someone an owner, and nor can an email domain or a client control
(`tests/organisations.test.mjs`, `tests/staff-tenant-matrix.test.mjs`). The root of trust is the Cloudflare account that
holds the accounts database, so recovery goes through that account and never through the app.

## What the app refuses

| Action | Result |
|---|---|
| The last owner deletes their account | `409 transfer_platform_owner_first`. The app says this account is the only owner, that another owner must be added first, and that nothing was deleted. |
| The sole admin of an organisation deletes their account or leaves | `409 transfer_organisation_admin_first`, with an explanation in the account panel and the student space. |
| Demoting an owner | There's no route for it. It's a database change only, made by the founder. |

## Adding a second owner (recommended now)

The founder does this, signed in to Cloudflare with access to the database:

1. **Sign in.** The new owner signs in to Orivia once with their email, so their user row exists.
2. **Look up their user id.** Use the D1 console for the database, or run:
   `npx wrangler d1 execute <accounts-db> --remote --command "SELECT id FROM user WHERE email='<their email>'"`
3. **Grant the role:**
   `npx wrangler d1 execute <accounts-db> --remote --command "INSERT INTO platform_roles(user_id,role) VALUES ('<id>','owner')"`
4. **Check it.** They open `/manage`; the owner overview loads.

Use the production accounts database for production and `orivia-accounts-pilot-test` for the pilot. Cleo doesn't run
these commands against production.

## If the only owner loses access to their email

The owner signs in with email codes, so losing the mailbox means losing Orivia sign-in, not the platform:

1. Using Cloudflare account access (separate credentials and 2FA), add a second owner as above, with an address they control.
2. Optionally remove the old row: `DELETE FROM platform_roles WHERE user_id='<old id>'`. That stops the lost mailbox from becoming owner access if it's recovered by someone else.
3. Record the change privately (date, who, why). The platform audit table records owner actions taken in the app, not direct database changes.

If Cloudflare account access itself is lost, recovery goes through Cloudflare's own account recovery. Nothing in Orivia
can bypass that, by design.

## Keep privately

Keep the following outside this repository, in the founder's password manager or secure notes:
- the Cloudflare account email;
- the 2FA recovery codes;
- the accounts database names;
- these steps.

The repository holds the procedure only, never credentials.
