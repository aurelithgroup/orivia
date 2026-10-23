# Organisation spaces inside Orivia Home — 20 October

The private pilot now loads the existing account client and its separate personal-vault storage. Home adds Your spaces from the signed-in session's memberships. An approved student opens published guides, contacts, dates and updates in an inline sheet. Staff and platform-owner management links still open the separate management interface. Pending requests are labelled waiting; the server remains responsible for all access decisions.

Organisation names and published content remain verbatim/plain text. No organisation content is copied into personal chat history, sent to the AI or automatically added to the personal calendar. No application-progress integration is implied. New navigation copy has French and Arabic translations; other languages use the existing English fallback.

Logout/account-screen transitions clear the sheet and list. Requests carry the expected account ID, are not cached, and late responses are discarded after an account change. Closing clears the displayed content. Access-loss and offline errors offer a refresh rather than showing cached member content. The sheet supports Escape, focus return and keyboard focus wrapping.

The existing account setup asks what guest categories to import, all unchecked. Nothing is automatically imported. Browser recovery copies, sync conflicts and personal account storage retain the existing tested behaviour.

## Validation

All 60 workflow commands passed locally. `tests/organisation-home.test.mjs` exercises student-only/pending cards, plain-text handling, session headers, no-cache requests, logout clearing, late responses, guest hiding and access loss with scripted transport. Existing account tests use real Better Auth and SQLite; the founder separately confirmed Gmail and Outlook sign-in, admin invitation, student approval, and the published guide in the student platform space.

The new main-app layout has not been visually checked: no browser executable was installed, and the Chromium download returned invalid archives. Do not describe that as a successful browser test. Main-app account restore/import and the new Home sheet need the founder's live check.

## Private deployment

Cloudflare accepted deployment `18f512a5aaa54fde998713bfb26b6e90`. Only the existing live root HTML and chat JavaScript strings were replaced, and `ACCOUNTS_UI` became `1`. The standalone account module and live assistant/research handlers were retained. The public beta was not deployed. The verified two-address email restrictions, private Access gate, keys, limits and browser-off settings stay in place.

Source files: `workers/trial-ui/spaces.js`, `accounts.js`, `chat.js`, `page.html`, translations and the UI embed script. Generated embedded UI in the shared Worker was refreshed for source parity; do not deploy its older backend over the newer live assistant.
