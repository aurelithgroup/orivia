# Ina: candidate 9 independent review and fixes

Base: 2545018 (candidate 9 code 9bb8666, recorded pilot e055308c). No deployment was performed by Ina. Production, budgets, database bindings and secrets are unchanged.

## Verification
The unmodified baseline passed all 121 CI commands independently. The patched working tree passed all 122 commands, including the new exact-fetch-target regression suite. The attached JSON identifies the base SHA and correctly records a dirty working tree: these checks ran before this patch commit was created. No authenticated live pilot or real-device check is claimed.

## Fixed: speculative web addresses could carry conversation data
A scripted run of the real assistant fetched a synthetic /collect?case=CASE84217 address on an already-seen host. The previous host-level rule also admitted an unmentioned host. No real personal data was used.

The assistant now reads exact addresses obtained from a user, search result, official directory, prior evidence, or an actual same-origin link in a fetched page. Merely sharing an approved hostname is insufficient. Discovery actions run before reads within a tool batch, so a legitimate same-step search and read remains possible. Underlying fetch/SSRF protections remain in force. Guessed government paths also require discovery first. Tests cover query mutation, undiscovered hosts, legitimate links and same-step discovery. Direct-read fixtures now explicitly provide their addresses instead of assuming guessed paths are authorised.

This reduces speculative-URL exfiltration; it is not a guarantee that every private name is removed from all searches. Existing name extraction is heuristic and still requires multilingual review.

## Fixed: plan Undo lost blocked notes
Transitions now record the previous and next blocked note. Undo restores the recorded note and refuses to overwrite a subsequent note edit. Tests cover leaving blocked state, editing a blocked note and concurrent note changes. Previously lost notes cannot be reconstructed from old history.

## Follow-up release finding
Organisation settings advertise controls for update/key-date device alerts, defaulting to off, but the current notification sender does not consult organisation_settings. Verify and enforce those controls before claiming they govern device delivery. No actual unwanted delivery was demonstrated in this review. Production push remains off according to the release record; this patch does not change it.

## Integration
Merge this patch branch into the release branch, run combined checks, and deploy to the isolated pilot through the designated deployer. Cleo's unpushed Arabic/zoom CSS work was not available and has not been overwritten. This is a reviewed patch, not completion of the whole requirements ledger or approval to release every pending feature.
