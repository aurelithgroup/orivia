# Language coverage matrix (ORI-VOICE-001)

Each language is tracked separately for each part of the app. "Tested" means a check exists and it's named; nothing is ticked just because the code accepts the language code. `tests/language-matrix.test.mjs` fails if this table and the code disagree.

| Status | Meaning |
|---|---|
| **live** | Confirmed by a person on the pilot or myorivia.app |
| **tested** | An automated test exercises it (scripted or simulated, not a real provider or device) |
| **implemented** | The code supports it, but nothing has tested it |
| **device** | Depends on the person's browser or phone having the voice or speech recognition; Orivia says so when it's missing |
| **unavailable** | Not supported; the app falls back to English |

| Language | Code | App interface (UI) | AI reply language | Dictation (speech to text) | Listen: natural voice (OpenAI) | Listen: device voice |
|---|---|---|---|---|---|---|
| English | en | live | live | device | tested | device |
| French | fr | live | live | device | live | device |
| Arabic | ar | tested | tested | device | implemented | device |
| Filipino | fil | unavailable | tested | device | implemented | device |
| Hindi | hi | unavailable | implemented | device | implemented | device |
| Urdu | ur | unavailable | implemented | device | implemented | device |
| Chinese | zh | unavailable | tested | device | implemented | device |
| Bengali | bn | unavailable | implemented | device | implemented | device |
| Malayalam | ml | unavailable | implemented | device | implemented | device |
| Russian | ru | unavailable | implemented | device | implemented | device |

## Evidence

- **UI:** `workers/trial-ui/i18n.js` supports `en`, `fr` and `ar`. `translations.json` has every key in French and Arabic. French was confirmed live by you on 22 Oct ("the app messages are in the right language"). The Arabic UI and its right-to-left layout are covered by `tests/i18n.test.mjs`, but no person has confirmed it live, so it is marked tested. Other languages: unavailable, falling back to English.
- **AI replies:**
  - `REPLY_LANGS` in `workers/orivia-assistant.mjs` lists all 10 languages.
  - `tests/reply-language.test.mjs` covers en, fr, ar, fil and zh.
  - You confirmed a French question got a French reply (22 Oct). The rest are implemented but untested.
- **Dictation:** the Web Speech API with locales for all 10 (`DICT_LANGS`). Whether it works depends on the browser and phone. `tests/dictation.test.mjs` covers the control flow only.
- **Natural voice:**
  - `tests/natural-voice.test.mjs` covers English (simulated).
  - You confirmed French live with the natural voice (22 Oct).
  - OpenAI's voice can speak the others, but nobody has checked them.
- **Device voice:** `VOICE_LOC` maps all 10. When a phone has no voice for a language, Orivia says so instead of reading it in the wrong one. Bengali and Malayalam voices are often missing on phones.

## Known English fallbacks (recorded 30 Oct)

Where the table says **live** or **tested** for the French or Arabic interface, these parts still show English. Expanding translations is deferred, so they're recorded here rather than translated. `tests/language-fallbacks.test.mjs` recounts them and fails if this section goes out of date.

- **Interface strings missing from the dictionary.** `translations.json` has French and Arabic for every key it contains, but some interface strings aren't in it at all. Those show in English:
  - **Guide view** (`openGuide` in `chat.js`): 29 of 60 strings, including "About this step", "Do this", "What you’ll need", "Next step →" and "Ask Orivia about this step".
  - **University welcome and account screens** (`accounts.js`): at least 8, including "Edit my details" and "Nothing to do yet".
  - **Photo review** (`image-review.js`): its readiness text and button labels.

  The new caveat phrases are the exception: they have French and Arabic, written by Cleo, awaiting review.
- **Guide content in the chat app is English.** `/v1/guides/<id>` serves English for every interface language. Arabic readers see English guide text, with the interface around it in Arabic. Each line now keeps its own direction. The step note "not reviewed in your language" appears where a step's Arabic is pending.
- **Guide content on the public website app** (`js/app.js`) is in English and Arabic. Steps whose Arabic isn't reviewed say so in Arabic (13 steps).
- **The other eight interface languages** on the public website app are machine-assisted and marked "Beta translation" there.
- **University content** (guides, directory entries, sponsored placements) appears in whatever language staff or the owner wrote it in. Orivia doesn't translate it.

## Gaps to close

- **VOICE-002:** translate the UI for the seven unavailable languages.
- **Live checks:** test replies in hi, ur, bn, ml and ru, and the natural voice in Arabic.
- **Devices:** check dictation and device voices on real phones.
