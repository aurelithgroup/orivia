# PILOT READY 4: conversation versions integrated (Cleo → Ina, 23 Oct 2026)

| | |
|---|---|
| Source | `2b4e9d3` on `myorivia-release-plan` (your `5bdfcf8` plus my integration fixes) |
| Pilot Worker | `orivia-research-pilot` version `8306e1e3-a373-47a3-87aa-c3ea3471a1f8` (bundle sha256 `cf66e72c…876da3`) |
| Migrations | None |
| Production | Unchanged: `b9e32ffc`. Spending limits unchanged. |
| Tests | 93/93 CI commands pass on a clean tree, plus the browser check below |
| Receipt | `docs/evidence/pilot-candidate-4-2026-10-23.json` |

## One approach

**I kept your implementation** (`5bdfcf8`), fast-forwarded with no merge of the two submit paths. My parallel draft is stashed and not combined.

## Browser check (local harness, headless Chrome, 390px; `/v1/chat` stubbed in the page)

Evidence: `docs/evidence/chat-versions-browser-2026-10-23.json`. Rerun with `tools/browser-checks/make-versions-jobs.cjs`.

| Step | Result |
|---|---|
| Send, then edit to "…on Friday" | 2 / 2; one request with the edited question; calendar unchanged; Review reminder card |
| Regenerate | 3 / 3; one request; the question isn't duplicated (2 user messages shown and sent) |
| Previous, Previous | 2 / 3, then 1 / 3 with the original answer and the earlier attachment message |
| Next, Next, Save reminder | Calendar +1 only on Save |
| Refresh | Still 3 / 3, with the same messages |
| Storage full (setItem throws) | No request; nothing changed; "Could not change this conversation. Your saved version is kept." |

**Found and fixed:**
1. **Stop during a regenerate:** the new version lost its question, which moved into the message box. It now rolls back to the earlier version ("Stopped. Your earlier version is back.").
2. **Server failure (500):** the active version was left completely empty. It now rolls back the same way.
3. **Disabled controls:** Edit, Regenerate and Previous/Next were drawn while the reply was in progress and stayed disabled afterwards, so they never worked until something redrew the screen. They're now released when the reply ends.
4. **Version notice:** "This is a new conversation version…" was written into the reply text, so it was sent back to the AI in later messages and read by Listen. It's now a note under the reply.

I kept your rule that a version's reminder reply is replaced by the honest review line rather than "Reminder saved".

**Account exit** was tested in the guest harness: I opened the sign-in screen while a regenerate was in flight. The reply was filed in the same guest chat, as it would be for a normal message. A real account switch is discarded by the existing epoch check, but that path isn't exercised here.

**Tests:**
- `tests/chat-versions-integration.test.mjs` runs the real `sendChat` (your approach) for the rollback on failure, network error and normal-send paths, the released controls, and the notice kept out of the reply.
- `tests/chat-versions.test.mjs` only gains a `querySelectorAll` stub.

**Note:** the merge checked files out with CRLF on Windows, which broke two source-slicing tests (`chat-history`, `information-cards`). The files are normalised to LF with no content change, and my local CI runner now handles CRLF.

## Still open

- **Your release gates:** the feedback Privacy and retention wording, and authenticated checks on the deployed pilot.
- **Not covered here:**
  - RTL and Arabic layout of the version controls;
  - pending-file blocking (code-level only);
  - a real account switch mid-reply;
  - real-provider replies.

## Rollback

Roll back to `a9a77d8a-bffa-40f9-8c53-baf36f1809a1` (candidate 3). There is no schema change.
