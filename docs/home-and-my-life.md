# Home and My Life

The approved navy/amber concept is implemented using the existing on-device records. No accounts, sync, notification service or institution connection is added in this change.

## Navigation

Home → Chat → My Life → Journeys → Calendar. Successful entry opens Home. Chat history remains in the header drawer. Help and support is available in My Life and Settings.

## Home

- Device-time greeting; no name is invented before a name is provided.
- Ask Orivia starts a fresh conversation and submits the message through the normal Chat send path. Previous conversations stay saved. An empty question opens Chat without clearing an existing draft. While a reply is running or the send cooldown is active, Home keeps the question and shows a retry note.
- Coming up shows the nearest two future reminders, sorted by timestamp. Opens the existing calendar.
- Your next step opens the most recently updated active or paused journey. Progress is read from its saved step statuses.
- Recent conversations excludes archived and empty chats. Opens the actual saved conversation.
- Empty states offer Add reminder, Explore journeys and Start a conversation. No demonstration data is included in production.

## My Life

Read-only summary rows with a separate Edit control retain the existing profile format and sharing toggle. The institution editor is available even if a person has not selected Study or Work. It is explicitly an unverified name added by the person, not an institution account or connection.

Saved places expand in place, retaining links to their original chats. Journey totals link to Journeys. Settings retains the existing data controls. All records remain local to this browser; nobody is silently signed up or migrated to remote storage.

The new dashboard labels have English, French and Arabic translations. User-authored titles, source evidence and institution names remain verbatim. Existing deeper journey content retains its previous language coverage.

## Validation

`tests/home-dashboard.test.mjs` runs the real dashboard selection function against mixed reminder timestamps, active/paused/completed journeys, archived and empty chats. It verifies ordering, empty records and no mutation. Existing storage, calendar and language tests continue to apply. Browser checks use a disposable fixture Worker, labelled Sample data; it is deleted after review.

## Rollout

Private research pilot only. Replace its embedded UI after matching the deployed UI against the expected base. Retain its current backend, bindings, secrets, service switches and limits; the public beta is not deployed.

## Destination greeting photography

The first photo set is country-level: Dubai for the UAE and London for the UK, explicitly captioned with the photographed city. It does not claim to depict every saved city. For a person who has not moved yet, the saved destination is used, never their origin. Unknown destinations retain the navy artwork. The moving greeting says “Your next chapter” plus the country.

The two JPEGs are bundled into the existing chat script at build time by `tools/embed-trial-ui.mjs`. There is no external image request, search, geolocation, API key or additional paid service. They total about 178 KB before base64 encoding. Image errors restore the navy background. More exact city photography can be added later.

Asset sources and license are recorded in `workers/trial-ui/destination-photos.json`; images are from Unsplash under https://unsplash.com/license (checked 19 October 2026). The downloaded images were resized and recompressed, with metadata removed, for this greeting. A Photo: Unsplash credit is shown. No photographer identity is guessed.
