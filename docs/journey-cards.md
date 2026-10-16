# Journeys (private AI trial)

Bottom navigation: **Chat | Calendar | Help | Journeys | My Life**. Journeys replaces Explore.

- **My Journeys** (top): guides the person chose to follow or save. Active first, then Paused, Saved for later and Completed. Each card has ⋯ to pause or resume, mark completed, or remove (asks first if progress would be lost). Empty state: "No journeys yet. Explore below, or ask Orivia what you need help with."
- **Explore Journeys** (below): the checked Dubai guides from `GET /v1/guides`, grouped into categories that only appear when guides exist, with search. Each card offers Follow guide, Save for later and Preview.
- **Inside a journey**: status, reviewed date, step N of M, progress, All steps (the person's own ticks; tap to jump), What to do now / What you'll need / What to expect / Ask staff, Mark this step done (and Mark as not done), Things that might go wrong, Official sources, Ask Orivia about this step. Journeys and Chat buttons at the top; returning to Chat keeps the conversation.
- **In Chat**, asking again shows the same card in its current state: Continue guide · Step N (active), Resume (paused), Open saved guide (saved), Preview guide (not saved). "Where was I?" uses the person's own journeys, and asks which one if there are several.
- **My Life** shows a short "What I'm working on" summary only.
- Progress is saved on this device only. Only journey ids and states are sent to the AI, never step content or anything personal. Steps change only when the person ticks them.

## Journey cards

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
