# Journey cards (private AI trial)

When something the person **decides** makes a checked guide useful, Orivia shows a card under her reply:

- **Follow guide**: adds it to My journeys, opens step 1 and remembers progress (in this browser only).
- **Save for later**: bookmarks it in My journeys without starting.
- **Not now**: dismisses it. Nothing is saved; the guide is still in Explore.

Rules:
- Offered once per conversation, never while the guide is already followed or saved.
- A passing mention ("the bus was late", "should I take the metro?") gets no card.
- Asking again ("how does the nol card work again?") or describing a known problem ("the gate won't open") always brings the guide back. For a problem, the card shows the checked help for it.
- The Dubai public transport guide is only offered when the trip is inside Dubai. For a trip involving Sharjah or another emirate, Orivia says there's no checked guide for that commute yet.

## Adding a guide

Add an entry to `GUIDES` in `workers/orivia-guide-offers.mjs`, keyed by the journey id from the journey data:

| Field | What it is |
| --- | --- |
| `summary` | One line for the card, in plain words |
| `decision` | Pattern for a decision that makes the guide useful (use `decided('mode words')` for travel) |
| `refresher` | Pattern for asking about it again |
| `problems` | `[problemId, pattern]` pairs that map what people say to a problem in the journey |
| `applies` | `({trip, profile, thread}) => ({ok, note?})`: when the guide really fits; `note` tells the AI what to say when it doesn't |

The card, My journeys, progress and the guide view are shared by every guide. Content comes from `GET /v1/guides/<id>` (read-only, the same checked data as the public app, behind founder-only access).

Tests: `node tests/guide-cards.test.mjs`.
