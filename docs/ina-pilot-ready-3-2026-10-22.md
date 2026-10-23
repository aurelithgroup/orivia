# PILOT READY 3: account-exit audio cleanup (Cleo → Ina, 22 Oct 2026)

This candidate fixes the one change you required in `7c701fb`. Everything else is unchanged from candidate 2 (`8af0b96`). It is frozen; this is not a production request.

| | |
|---|---|
| Source | `8c5710f` on `myorivia-release-plan` |
| Pilot Worker | `orivia-research-pilot` version `a9a77d8a-bffa-40f9-8c53-baf36f1809a1` (bundle sha256 `3e7ef983…834ec`) |
| Migrations | None |
| Production | Unchanged: `b9e32ffc`. Spending limits unchanged. |
| Tests | 91/91 CI commands pass on a clean tree, plus a headless check of the real exit path |
| Receipt | `docs/evidence/pilot-candidate-3-2026-10-22.json` |

## The fix

`resetVoiceSession()` is separate from Stop. It runs from:
- `leave()`, which `hideApp()` calls for sign-in, sign-out and account switching;
- `reload()`, which runs on an account change;
- Clear saved data.

It does all of the following immediately:
- invalidates the run;
- cancels device speech;
- clears the player (handlers removed, paused, `src` removed, `load()`);
- aborts every request;
- empties the cache, the in-flight map and the byte count;
- revokes the active audio URL;
- resets the Listen button and the preparing message.

A session counter means a response that arrives after the reset is never cached or played. That holds even when the account doesn't change (Clear saved data). Ordinary Stop still keeps bounded work for replay, as designed.

## Tests

`tests/voice-account-exit.test.mjs` runs the shipped voice code from `chat.js` (cache, in-flight sharing, playback, Stop, reset). It uses a fetch that ignores aborts and answers when told. The sequence:
1. Account A plays one reply to the end (cached) and starts a second (in flight).
2. The test checks that `leave()` calls the reset, then performs it. Nothing of A remains: cache, bytes, in-flight and requests are all 0, every created URL is revoked, and the player is empty.
3. With the epoch set to B, A's late response is resolved: it isn't cached or played.
4. B requests the same text and generates its own audio.
5. In B, Stop and replay reuse the audio with no new request.
6. Stop during generation keeps the piece; exit drops it.
7. With the account unchanged, a reset followed by a late response doesn't cache it.

I removed the session guard once, and the reset's clearing once, to confirm the test fails without each.

**Real exit path in the browser** (headless Chrome, simulated 1200 ms voice): `window.OriviaAccounts.open()` runs `hideApp()`, then `leave()`.
- **Completed audio:** cached 2 → 0, bytes 16,088 → 0, and the active URL is cleared.
- **In flight:** the request and the in-flight entry go 1 → 0. 2.5 s later nothing is cached or playing, and no timing is recorded.
- `window.OriviaVoiceDebug()` exposes these counts only, with no audio and no text.

## Still open (your release gates)

- **Feedback Privacy and retention wording:** no fixed expiry is implemented beyond deletion with the account, and none is promised.
- **Authenticated checks on the deployed pilot:** I can't pass Access.
- **Listen timing:** live OpenAI and real-device timing is not measured. The simulated timings are not advertised as live performance.

## Rollback

Roll back to `5c471584-affc-495f-89ff-8d6b98e50843` (candidate 2). There is no schema change.
