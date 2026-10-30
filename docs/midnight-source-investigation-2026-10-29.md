# Midnight pilot source: read-only investigation (29 Oct 2026)

**Purpose:** find out what the current pilot Worker runs, so its source can be reconciled before any deployment. Nothing was deployed, changed, rolled back or rebound. The deployment hold stands.

## What was done (all read-only)

1. Read the current script of the pilot Worker (`orivia-research-pilot`) through the Cloudflare connector, at about 17:45 UTC on 29 Oct.
   - The connector returns the current script without a version id. The hold notes record that the pilot runs `abf5b831` ("Private Midnight Owner candidate cdab3b5"). Nothing suggests it changed since, but this read doesn't prove which version it was.
   - The bundle references `index.js.map`, but the connector didn't return a source map.
   - The bundle is unminified esbuild output, with each module labelled by its source path.
2. Searched every pushed branch and all history for the two modules unique to the pilot. Neither exists anywhere: no file, no commit, no mention.
3. Built the nearest candidate locally with esbuild 0.28.2: Ina's `ina/owner-midnight-dashboard-2026-10-25` at `4d6b0e9`, entry `workers/pilot/index.mjs`, packages external, names kept. The build happened in a throwaway worktree in a private scratch folder. Then compared every first-party module with the pilot bundle, ignoring bundler cosmetics: import lines, shorthand properties, name wrappers, numbered renames and whitespace.
4. The bundle and the extracted modules stay private: the scratch folder of this session, outside the repository. **The repository is public, so no deployed code is committed here.**

## Findings

**The pilot is Ina's `4d6b0e9` plus one layer that was never pushed.**

| Result | Modules |
|---|---|
| Identical to `4d6b0e9` | 36 first-party modules |
| Cosmetic only (shorthand properties the comparison didn't fold) | auth, handler, transport, journey sources, and several research modules with similar small spans |
| **Only in the pilot** | `workers/accounts/owner-midnight.mjs` (the "Midnight" executive owner dashboard: Overview, Analytics, Finances, Organisations, Chat Feedback, Founder Tools) and `workers/accounts/owner-analytics.mjs` (aggregate-only owner metrics: administration activity, sponsorship campaign counts by status, search quota calls; each with a plain definition, and "unavailable" when a source can't be read) |
| **Real changes in existing modules** | `platform-ui.mjs` (about 6.5 KB: the Midnight styles and mounting the owner dashboard); `organisations.mjs` (about 0.5 KB, around the owner endpoints); `operations.mjs` (a new owner privacy boundary: `/api/admin/people`, and `/api/admin/entitlements` for one person, answer 403 even for the owner); `feedback.mjs` (the owner's feedback view shows totals by category and status instead of individual reports) |
| Entry point | `index.mjs` in the pilot and `pilot/index.mjs` locally: the same entry, named differently by the build |

**Who made it:** not confirmed. The layer does exactly what Ina's `4d6b0e9` note (`management/PRODUCTION_SOURCE_RECOVERY.md`) lists as steps 4 and 5: integrate the Midnight owner view into `platform-ui.mjs`, with an owner-only, aggregate-only reporting endpoint. That points to Ina's own continuation after 14:58 on 25 Oct. Only she can confirm it.

## What this means for the hold

- The unknown part is small and bounded: two new modules and four changed ones. Every other module matches a pushed commit.
- If Ina pushes `cdab3b5`, it should equal `4d6b0e9` plus this layer. The same comparison can then confirm the push, module by module.
- If `cdab3b5` can't be pushed, the layer can be recovered from the deployed bundle as readable code, kept private, and rebuilt as reviewed source. That needs the founder's decision.
- **Reconciling with `myorivia-release-plan`:** this branch has neither module. Its `operations.mjs` and `feedback.mjs` lack the owner privacy boundaries above. Its `platform-ui.mjs` has a different owner view (`/manage`). The pilot's layer has to be brought in change by change, not merged. The pilot is not overwritten to make that easier.

## Still needed to lift the hold (unchanged)

1. Someone confirms they own `abf5b831`. Ina is the likely owner.
2. Its source is pushed, or the founder decides to recover it from the bundle.
3. It is reconciled with `myorivia-release-plan` change by change.
4. The founder explicitly clears the hold.

## Rerun

Fetch the pilot script read-only, build the candidate with `esbuild workers/pilot/index.mjs --bundle --format=esm --platform=neutral --packages=external --keep-names`, and compare module by module. The comparison script was a private scratch tool and can be recreated from this description.
