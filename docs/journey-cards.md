# Journeys (private AI trial)

Bottom navigation: **Chat | Calendar | Help | Journeys | My Life**. Journeys replaces Explore.

- **My Journeys** (top): guides the person chose to follow or save. Active first, then Paused, Saved for later and Completed. Each card has ⋯ to pause or resume, mark completed, or remove (asks first if progress would be lost). Empty state: "No journeys yet. Explore below, or ask Orivia what you need help with."
- **Explore Journeys** (below): the checked Dubai guides from `GET /v1/guides`, grouped into categories that only appear when guides exist, with search. Each card offers Follow guide, Save for later and Preview.
- **Inside a journey**: status, reviewed date, step N of M, progress and All steps (the person's own statuses; tap to read any step). Each step is split into sections: About this step, Do this, What you'll need, What to expect, Tip, Show staff, then Ask Orivia. Below it, **Where are you with this step?** offers Not started, In progress, Waiting (only where the guide has something to wait for), Done and Not sure. Picking one never moves you on; **Next step** only moves and never marks anything. "Not sure" never counts as done and shows how to check, where the guide says. A journey with a step marked Waiting shows as **Waiting** in My Journeys.
- **In Chat**, asking again shows the same card in its current state: Continue guide · Step N (active), Resume (paused), Open saved guide (saved), Preview guide (not saved). "Where was I?" uses the person's own journeys, and asks which one if there are several.
- **My Life** shows a short "What I'm working on" summary only.
- **One record**: Chat and Journeys read the same progress on this device. Each chat message carries journey ids, journey states and step states (never step content or anything personal), so Orivia answers "where was I?" from the person's own statuses, and the visa chat starts from them instead of re-asking the check-up questions. When the chat works out where someone is, it offers **Save to My Journeys**. Nothing is saved until they tap it.
- Steps change only when the person picks a status. The landing page shows My Journeys, then the Explore categories; guides are listed after picking a category, searching or tapping Browse all.

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
