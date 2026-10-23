# Ina Round 2 audit — 22 October 2026

Code snapshot: `6617b37c763e5992cb8a9d1608a2f2dbd54d3d47`. Separate modules/proposals only. No shared-file edits, deployment, provider call or spending-limit change.

## Findings for Cleo now

1. **Do not rebuild dictation.** Settings picker, app/device/explicit locale choice, hover/hold shortcut, privacy notice, refusal handling, Stop/Cancel and edit-before-send are present. The existing dictation suite passes. Real microphone recognition quality still needs a device test.
2. **Fix Listen losing text.** Reproduced the existing regex on a 300-character unspaced Chinese string: only the last 200 characters reach speech. Long unspaced strings in other scripts have the same problem. `voice-text.js` supplies a lossless, bounded helper with its own test. Integrate `window.OriviaVoiceText.chunks(clean)` where Listen currently builds `parts`, using the existing embedding/version pipeline. Never call the old regex fallback for long unspaced text. No audio/network behaviour changes in this module.
3. **Dynamic dictation text is still English.** `r.onstart` assembles literal `Listening · … · Stop to edit`; the microphone tooltip is literal English too. `translations-ina-voice.json` proposes French/Arabic strings. Merge through i18n and build the status with separately translated fragments; do not translate user transcripts or source quotes.
4. **Listen language is inferred, not reliably known.** Latin-script replies fall back to English unless the interface is French/Filipino; an explicit French reply in an English UI can get an English voice. Arabic-versus-Urdu uses a few script characters and is imperfect. Future reply-language metadata should select the voice before heuristic fallback. Do not force the UI language onto differently written replies.
5. Browser voice-name scoring cannot guarantee a natural voice, or that a voice stays on-device. Expose actual available choices and preview on the person's device before promising quality/privacy. No synthetic samples generated in this audit.

## Coverage inventory

| Language | App UI offered | Dictation locale offered | Listen locale configured |
|---|---|---|---|
| English | Yes | en-GB | en-GB |
| French | Yes | fr-FR | fr-FR |
| Arabic | Yes, RTL | ar-AE | ar-AE |
| Filipino | No | fil-PH | fil-PH |
| Hindi | No | hi-IN | hi-IN |
| Urdu | No | ur-PK | ur-PK |
| Chinese | No | zh-CN | zh-CN |
| Bengali | No | bn-BD | bn-IN |
| Malayalam | No | ml-IN | ml-IN |
| Russian | No | ru-RU | ru-RU |

Locale configured means a selectable request/voice mapping, not proof that a browser supports recognition or has that voice. Bengali recognition and Listen use different regions; review intentionally rather than silently changing existing preferences. Model replies in a language are distinct from a translated interface.

The current dictionary has 544 entries, each with French and Arabic values. This is key completeness, not whole-app translation completeness. The dashboard explicitly says it is in English; university-authored content, source quotes and names stay as written. Navigation labels have French/Arabic strings. Dynamic composite text, rare errors and old guide content still need coverage. Audit the remaining seven interfaces in small batches after the founder prioritises them; Urdu needs RTL too.

Checks passed on the snapshot: `i18n.test.mjs`, `dictation.test.mjs`, `assistant-timing.test.mjs`. New helper: `node tests/ina-voice-text.test.mjs`. Scripted tests are not real-phone/audio approval.

## Actual live timing observations

Read-only Cloudflare telemetry query, dry mode, 24-hour window ending 22 Oct about 09:24 Dubai. Nine assistant log events returned. No conversation text needed or retained. Eight were production version `fe28a2ae`; one was pilot `f0581ac0`. **None establish a Round 2 speed gain.** No new paid research/test message was sent.

| Recorded case | Samples | Model | Search | Pages | Tool wall time | Total server turn |
|---|---:|---:|---:|---:|---:|---:|
| Production one-model-call replies | 6 | 3.241–4.077 s | 0 | 0 | 0 | 3.274–4.117 s |
| Pilot one-model-call reply | 1 | 6.684 s | 0 | 0 | 0 | 6.861 s |
| Production read-page then ask, 2 calls | 1 | 11.658 s | 0 | 1.893 s | 1.893 s | 13.635 s |
| Production research, 4 calls, incomplete | 1 | 17.892 s | 1.310 s | 2.064 s | 3.374 s | 21.455 s |

The last turn rejected its reply twice for `not-own-site`. Model time is ~83.4% of that turn and ~85.5% of the read/ask turn. This is a small, selected sample, not a controlled benchmark or general p95. It suggests examining repeated model corrections and unnecessary clarification before optimising page transport. Preserve the source rules; do not accept a rejected claim to save time.

Timing definitions: modelMs includes its budget wrapper; searchMs/pageMs are summed operation durations and can overlap. toolWallMs is elapsed batch time. Do not add those columns together. Server elapsedMs excludes browser startup, connection and UI rendering; measure client send-to-first-status and send-to-final separately. Zero recorded cache hits does not prove duplicate fetching happened.

Next measurement: observe the founder's Round 2 test logs, tagged by Worker version, and compare equivalent question categories and model-call counts. Report failed/cancelled turns separately. The current final-turn log can be absent on aborted/error paths; do not treat missing events as fast successful requests.

## Natural voice: current official documentation, no activation

Repository inspection did not find a saved complete natural-voice implementation/proposal. I recovered the requirement and checked the current options rather than assuming an old model/price is still suitable.

- Browser speech: no new paid API integration; quality/availability depends on the device and installed voices. This is the immediate fallback.
- OpenAI's speech guide now marks `tts-1`, `tts-1-hd` and `gpt-4o-mini-tts` deprecated, shutting down 6 Jan 2027. It directs migration to `gpt-realtime-2.1-mini` via Realtime; changing only the model id on `/v1/audio/speech` is not supported. Do not start a new long-lived integration on the retired path.
- Official pricing checked 22 Oct lists Realtime mini text input $0.60/million tokens, text output $2.40/million; audio input $10/million, audio output $20/million. Actual Listen cost needs output-audio usage from a tightly capped pilot; these are not dollar-per-minute figures and do not imply a monthly bill. Existing overall spending caps remain authoritative. No additional allowance approved here.
- A natural-voice pilot should send only the selected reply text on Listen, never automatically send the whole chat or microphone audio. Clear AI-voice/provider disclosure, cancellation, no shared private-audio cache, language samples, usage settlement and browser-voice fallback are required. Realtime generation must be checked for verbatim fidelity to the sourced reply before rollout.
- Official speech language list includes English/French/Arabic/Hindi/Urdu/Chinese/Tagalog/Russian, but does not list Bengali/Malayalam; do not promise those based on a generic multilingual claim. A separate current Realtime-language quality evaluation is still required.

Sources read:

- https://developers.openai.com/api/docs/guides/text-to-speech
- https://developers.openai.com/api/docs/pricing
- https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini

No provider chosen for production, samples purchased, audio uploaded or keys accessed. Founder voice preference/spending approval comes after a concrete capped proposal, not before finishing this audit.
