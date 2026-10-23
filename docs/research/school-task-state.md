# School task scope and continuation

The planner distinguishes discovery, expansion, named lookup, contacts and next steps. Comparison currently asks for the schools and criteria; it does not manufacture a comparison.

Each research reply carries `research.taskContext`. The browser saves it with that reply and sends the latest assistant reply’s context from the active chat as `preferences.researchContext`. New chats have no such context. It contains Sharjah, the curriculum, requested year, up to 24 previously shown profile URLs, and up to 20 pending continuation URLs. Named lookup also retains the requested school name for contact follow-ups. Source titles, quotes and contact facts are not task state.

The backend validates every state field. URLs must be approved SPEA school profiles and are revalidated again before any fetch. State is not trusted factual evidence. A new explicit topic or destination takes precedence. Replies still use at most the latest 12 conversation messages; task scope is independent of those messages. The request body is bounded at 32 KB to accommodate the constrained continuation fields without extending model history.

Discovery and expansion use Cleo’s bounded reader. Expansion excludes previously shown profile URLs. It reports additional matches or explicitly says no additional matching school was confirmed; it does not repeat the original list as new results. Lookup reports the named school’s actual curriculum even when it conflicts with the earlier curriculum filter. Similar candidates prompt clarification. Failed checks are not called “not found”.

Limits: this is a scoped school task system, not a universal semantic planner. Discovery depends on the first server-rendered directory page and the search index. No answer claims complete coverage. State is bounded; it is not account-level memory. Comparison, admissions requirements and other jurisdictions need their own evidence paths.

Regression tests include the founder’s sequence, a contradictory named-school curriculum, named contacts, hostile continuation URLs, topic changes, and the existing reader budget/failure cases. Synthetic pages in tests are not live findings.
