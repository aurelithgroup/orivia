# Incident controls (ORI-SEC-010)

During an incident, each optional provider or feature can be switched off on its own. Switches are Worker variables:
set one to `0`, or remove it, then redeploy. Only the founder changes production variables; Cleo does this on the pilot
only. Nothing here needs a code change, and each off state has been tested.

| Switch | What it stops | What people see | Test of the off state |
|---|---|---|---|
| `OPENAI_PILOT=0` | Every OpenAI call (chat assistant, document reading) | Chat keeps working on the built-in model, with typed help. There's no research assistant and no claim that one ran. | `tests/research-pilot.test.mjs` ("Switch off → never the assistant") |
| `RESEARCH_ENABLED=0` | Live web search and page reading | Answers say live search isn't available, and the system prompt says there's no search. | `tests/research-pilot.test.mjs`, `tests/research.test.mjs` |
| `DOCUMENTS_ENABLED=0` | Reading uploaded documents | `/v1/config` reports documents off. The app doesn't offer reading, and a direct request gets 503. | `tests/files-to-chat.test.mjs` |
| `FILES_ENABLED=0` | Stored files (R2) | The Library hides its Files tab and file actions. Saved chats, guides and shortlists stay. | `tests/incident-switches.test.mjs`; UI: `tests/library.test.mjs` (`showLibraryFiles`) |
| `VOICE_ENABLED=0` | Natural voice (OpenAI speech) | `naturalVoice:false`; the device's own voice is used. Dictation is unaffected. | `tests/natural-voice.test.mjs` |
| `NOTIFICATIONS_ENABLED=0` | The push scheduler | Nothing is sent. In-app notices still work. Production push is off already. | `tests/notification-isolation.test.mjs` |
| `ORGANISATIONS_ENABLED=0` | University spaces and staff tools | Personal Orivia works. Space routes are unavailable and no organisation content reaches Chat. | `tests/incident-switches.test.mjs` |
| `ACCOUNTS_EMAIL_ENABLED=0` | Sign-in code email | New sign-ins can't get a code. Sessions already open keep working. | `tests/incident-switches.test.mjs` |
| Daily and monthly caps (`PILOT_OPENAI_DAY_USD`, `SEARCH_DAILY_CAP`, `ASSISTANT_DAILY_CAP`, `DAILY_CAP`) | Spend | A plain limit message that says when it resets. No partial model call. | `tests/research-pilot.test.mjs`, `tests/public-beta.test.mjs` |

**Partner connectors** (`workers/connect/connectors.mjs`) aren't wired into any deployed route, and `connectors.sql` isn't applied
anywhere. They need no switch until a partner exists. When they're connected, the route must ship behind
`CONNECTORS_ENABLED`, with a test of the off state.

## Rollback record

- **Rollback target:** every pilot candidate's receipt (`docs/evidence/pilot-candidate-*.json`) names the version to roll back to.
- **Production:** `b9e32ffc` is recorded before any release.
- **Rollback rule:** once conversation versions are live, roll back only to `5bdfcf8` or later (`docs/backups.md`). Otherwise ship a forward fix. `tests/rollback-compat.test.mjs` checks that the current code keeps the stored fields older builds rely on.
- **Command:** `npx wrangler rollback <version-id> --name <worker>`. The founder does this for production.

## Order of moves

1. **Stop spend or exposure:** switch off the provider or feature involved.
2. **Contain:** if the defect is in code, roll back to the receipt's named version.
3. **Record privately:** what happened, when, what was switched, and who was affected (counts, not identities).
4. **Turn back on** only after a fix passes CI and a pilot check.
