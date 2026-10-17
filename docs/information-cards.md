# Information cards: proposed reply fields (for Ina to confirm)

The interface is built against labelled fixtures (`tests/fixtures/organisation-cards.json`).
Research routing and backend files are unchanged; the backend can start sending these fields when ready.
Until then, nothing new appears in the app.

## Which card shows

| Data | Card |
| --- | --- |
| 2+ organisations | **D** list with + shortlist and "Help me contact them" |
| 1 organisation, or one tapped from the list | **A** single card |
| Email / Call help | **B** email draft or phone script, opened from A or C |
| `cardMode: "choose"` (e.g. "next steps"), or "Not sure what to do next?" | **C** choices, inside A |

## Reply fields

```jsonc
{
  "reply": "…", "liveSources": [ /* unchanged */ ], "research": { /* unchanged */ },
  "cardMode": "list" | "single" | "choose",          // optional
  "organisations": [{
    "id": "wes-green",                                // stable within the reply
    "kind": "school",                                 // school | organisation | bank | clinic | office
    "name": "Wes Green International Private School",
    "sourceId": "S1",                                 // the liveSources page the organisation comes from
    "facts": [                                        // chips; each needs its own quote
      { "key": "curriculum", "label": "Curriculum", "value": "British", "sourceId": "S1", "quote": "Curriculum: British" },
      { "key": "grades", "label": "Year groups", "value": "FS1 to Year 13", "sourceId": "S1", "quote": "Grade: FS1 | … | 13" },
      { "key": "area", "label": "Area", "value": "Muwaileh, Sharjah", "sourceId": "S1", "quote": "School Location Sharjah - Muwaileh" },
      { "key": "rating", "label": "SPEA rating", "value": "Good", "sourceId": "S1", "quote": "Evaluation Good" }
    ],
    "contacts": {                                     // each optional; omit when not on the page
      "phone":      { "value": "065062999", "sourceId": "S1", "quote": "Phone Number 065062999" },
      "email":      { "value": "x@spea.shj.ae", "sourceId": "S1", "quote": "Email x@spea.shj.ae" },
      "website":    { "url": "https://…", "sourceId": "S1", "quote": "…" },
      "directions": { "url": "https://goo.gl/maps/…", "label": "Sharjah - Muwaileh", "sourceId": "S1", "quote": "School Location Sharjah - Muwaileh" }
    }
  }]
}
```

## Rules the interface enforces (anything else is dropped silently)

- Organisations only appear alongside vetted `liveSources`, and the organisation's `sourceId` must be one of them.
- Every fact and contact needs a `sourceId` matching a vetted source and a `quote` (copied from that page).
- Phone: digits, spaces, `+ ( ) -` only → `tel:`. Email: plain address → `mailto:` with a draft subject and body the person reviews and sends.
- Website: `https://` only. Without one, the card links to the source page as "Details".
- Directions: only a map link the source page itself gives (`goo.gl/maps/…`, `maps.app.goo.gl`, `google.com/maps…`). No pin is ever built from a name or area.
- `fixture: true` shows a "Sample data" label. Real results must not send it.
- Drafts and phone scripts use only what the person said in this chat (currently: a year group like "Year 6"). No assumed move, family, name or dates.
- The shortlist and "Not now" are saved with the chat on this device.

## Questions for Ina

1. Can the SPEA reader return `organisations` as above (phone, email and the "School Location" map link are already parsed in `orivia-school-actions.mjs`)?
2. For "yes please" / contacts follow-ups, should the reply set `cardMode: "choose"` or `"single"`?
3. Should the Year 6 filter result be a fact (e.g. `{ key: "year", label: "Year 6", value: "Listed" }`) with its quote?
