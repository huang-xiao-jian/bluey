# Final review fix report

## Change

Updated `specs/md-linkage/interfaces/spec.md` line 65 to say “apply the defaults defined by the selected interface contract.” This clarifies that defaults come from the selected CLI or MCP interface contract.

## Verification commands and outputs

- `git status --short --branch && git branch --show-current && rg -n "defaults.*defined by this document|defaults defined by the selected interface contract" specs/md-linkage/interfaces/spec.md`
  - Branch: `codex/md-linkage-interfaces`
  - Before the edit, the search found the stale phrase at line 65.
- `rg -n "defaults.*defined by this document|defaults defined by the selected interface contract" specs/md-linkage/interfaces/spec.md`
  - Output: `65:- apply the defaults defined by the selected interface contract;`
  - The stale phrase produced no match.
- `git diff --check`
  - Passed with no output.
- `git diff -- specs/md-linkage/interfaces/spec.md`
  - Confirmed the sole specification change is the requested wording replacement.

## Files

- `specs/md-linkage/interfaces/spec.md` — requested wording correction.
- `.superpowers/sdd/2026-10-23-md-linkage-interface-specification/final-fix-report.md` — this report.

## Self-review

The wording now attributes defaults to the selected interface contract, matching the finding. The diff contains only the requested line change in the specification, and `git diff --check` reported no whitespace errors. No other concerns found.

## Commit

`docs(md-linkage): clarify interface defaults`
