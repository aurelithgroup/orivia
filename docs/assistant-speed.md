# Private pilot response speed — 19 October 2026

Read-only live logs from the latest 13 assistant turns showed one-call follow-ups at 5.8–13.7 seconds, research turns at 23.7–94.1 seconds. The 94-second turn used seven model calls; the 81.5-second turn used six. Two turns required a rewrite for `not-own-site`. This establishes serial model latency as a significant contributor; it does not establish that duplicate reads caused those particular slow turns.

## First contained change

- Tell the model to batch independent checks, answer once the request is satisfied, and keep notes short. All source checks still apply; research limits and provider settings stay unchanged.
- Keep up to eight successful page responses within one assistant message, including in-flight reads. Repeated reads use that response but still extract evidence for the new focus. Exact URLs and source-policy options are separate keys. Failed reads can retry. A new turn starts empty. No shared or persistent cache.
- Add numeric `modelMs`, `toolWallMs`, `searchMs`, `pageMs`, and `pageCacheHits` to the existing turn metrics/log. Search and page times are cumulative request time and can overlap; toolWallMs measures the batches’ elapsed time. These figures must not be added together. Model time includes the existing budget reservation/settlement.

The tests prove a repeated page causes one fetch instead of two, concurrent duplicates share the request, failures retry, different policies are separate, cache size is bounded, and a complete scripted assistant turn preserves its evidence. They do not prove an end-to-end live speed gain. Review subsequent live timings before claiming one or choosing another optimisation.

Deployment must patch only these changes into the current live bundle: its backend contains newer reminder and source-classification logic than this checkout. Never replace it wholesale with the repository build. Keep the pre-change deployed version for rollback. Public beta is outside scope.
