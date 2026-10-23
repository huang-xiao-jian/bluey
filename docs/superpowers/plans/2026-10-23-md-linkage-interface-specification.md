# MD Linkage Interface Specification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the MD Linkage core specification from its CLI and MCP consumer-facing contracts under `specs/md-linkage/interfaces/` without changing behavior.

**Architecture:** Keep `specs/md-linkage/spec.md` focused on core use cases, concepts, and roles. Add one shared interface specification that owns cross-surface semantics, plus focused CLI and MCP contracts that depend on it; delete the former combined receptionist document only after all authoritative content has moved.

**Tech Stack:** Markdown, Mermaid, shell-based structural verification, Git

**Spec:** `docs/superpowers/specs/2026-10-23-md-linkage-interface-specification-design.md`

## Global Constraints

- Keep `specs/md-linkage/` as the single capability specification root.
- Use `interfaces/` as the consumer-facing specification boundary.
- Do not change the approved CLI or MCP behavior while relocating it.
- Do not add CLI or MCP concepts to the core specification.
- Do not rename implementation layers or modify files under `mcps/md-linkage/`.
- Do not create a Git worktree; the project ADR permits one only when the user explicitly requests it.
- Follow `docs/conventions/document.md`, including its `Prerequities` heading spelling and reference-link rules.

---

## File Structure

- Create `specs/md-linkage/interfaces/spec.md`: shared interface purpose, architecture, request semantics, responsibility boundary, result/error ownership, and cross-interface verification.
- Create `specs/md-linkage/interfaces/cli.md`: CLI command, input defaults, rendering, streams, exit statuses, and CLI verification requirements.
- Create `specs/md-linkage/interfaces/mcp.md`: MCP startup, tool input, result envelope, protocol errors, and MCP verification requirements.
- Modify `specs/md-linkage/spec.md`: remove the `Receptionist` section so the root document maps core behavior only.
- Delete `specs/md-linkage/receptionist.md`: remove the superseded combined contract after all material is represented in the three interface documents.

### Task 1: Establish the Shared Interface Boundary

**Files:**

- Create: `specs/md-linkage/interfaces/spec.md`
- Modify: `specs/md-linkage/spec.md:24-26`
- Reference: `specs/md-linkage/receptionist.md:3-50,138-157,177-181`
- Reference: `docs/conventions/document.md`

**Interfaces:**

- Consumes: Core concepts `LinkCheckDelegation`, `LinkCheckScope`, and `LinkCheckReport`; the core link-checking use case.
- Produces: The shared `MD Linkage Interface Specification` contract consumed by `interfaces/cli.md` and `interfaces/mcp.md`.

- [ ] **Step 1: Verify the new boundary does not exist yet**

Run:

```bash
test ! -e specs/md-linkage/interfaces/spec.md
```

Expected: exit status `0`. If the file exists, compare it with the approved design before continuing instead of overwriting it.

- [ ] **Step 2: Create the shared interface specification**

Create `specs/md-linkage/interfaces/spec.md` with this heading order:

```markdown
# MD Linkage Interface Specification

## Prerequities

- [Markdown Linkage Specification](../spec.md)
- [Link Check Delegation](../glossary/LinkCheckDelegation.md)
- [Link Check Scope](../glossary/LinkCheckScope.md)
- [Link Check Report](../glossary/LinkCheckReport.md)
- [Check Specification Documents for Dead Links](../use-case/check-specification-documents-for-dead-links.md)

## Purpose
## Architecture
## Request Semantics
## Result and Error Ownership
## Responsibility Boundary
## Cross-Interface Verification
```

Populate the sections exactly as follows:

- Move the substance of `receptionist.md:10-50` into `Purpose`, `Architecture`, and `Request Semantics`.
- Rename the layer and diagram nodes from “Receptionist” to “Interface”; describe CLI and MCP as sibling interfaces over one core workflow.
- In `Result and Error Ownership`, state that a completed workflow returns a **Link Check Report**, scope issues and dead links are successful findings, and failures preventing report construction are mapped by the selected interface.
- Move `receptionist.md:138-157` into `Responsibility Boundary`, replacing “receptionist layer” with “interface layer”. Preserve the complete may/must-not lists.
- Move only `receptionist.md:177-181` into `Cross-Interface Verification`, changing “Cross-Surface” to “Cross-Interface”.
- Do not include CLI commands, exit statuses, MCP schemas, or protocol envelopes.

- [ ] **Step 3: Remove interface navigation from the core specification**

Delete `specs/md-linkage/spec.md:24-26`, including the `## Receptionist` heading and its link. Do not add an `Interfaces` replacement section.

- [ ] **Step 4: Verify the shared boundary and core isolation**

Run:

```bash
test -f specs/md-linkage/interfaces/spec.md
! rg -n "Receptionist|receptionist|md-linkage (check|mcp)|check_specification_links" specs/md-linkage/spec.md specs/md-linkage/interfaces/spec.md
rg -n "^## (Purpose|Architecture|Request Semantics|Result and Error Ownership|Responsibility Boundary|Cross-Interface Verification)$" specs/md-linkage/interfaces/spec.md
git diff --check
```

Expected: the new file exists; the negative search prints nothing; the heading search prints all six required headings; `git diff --check` prints nothing.

- [ ] **Step 5: Commit the shared boundary**

```bash
git add specs/md-linkage/spec.md specs/md-linkage/interfaces/spec.md
git commit -m "docs(md-linkage): separate shared interface contract"
```

### Task 2: Extract the CLI Contract

**Files:**

- Create: `specs/md-linkage/interfaces/cli.md`
- Reference: `specs/md-linkage/receptionist.md:52-93,161-167`
- Reference: `specs/md-linkage/interfaces/spec.md`

**Interfaces:**

- Consumes: The shared `MD Linkage Interface Specification` and its core result/error distinction.
- Produces: The authoritative CLI contract for `md-linkage check`.

- [ ] **Step 1: Verify the CLI contract is absent**

Run:

```bash
test ! -e specs/md-linkage/interfaces/cli.md
```

Expected: exit status `0`. If the file exists, compare it with the approved design before continuing instead of overwriting it.

- [ ] **Step 2: Create the CLI contract**

Create `specs/md-linkage/interfaces/cli.md` with this structure:

```markdown
# MD Linkage CLI Interface

## Prerequities

- [MD Linkage Interface Specification](spec.md)

## Command
## Input Rules
## Output
## Exit Status
## Verification Requirements
```

Move the substance of `receptionist.md:52-93` and `receptionist.md:161-167` into the matching sections without changing these behaviors:

- Command: `md-linkage check <files...> [--root <path>] [--mode <shallow|recursive>] [--json]`.
- Defaults: current working directory for omitted `--root`; `LinkCheckMode.Shallow` for omitted `--mode`.
- Paths: resolve a relative root before constructing the delegation; preserve file arguments for the core scope builder.
- Output: human-readable findings by default; only the serialized **Link Check Report** on stdout with `--json`; non-report diagnostics on stderr.
- Exit statuses: `0` for a clean completed check, `1` for a completed check with findings, and `2` when no report can be produced.
- Verification: defaults, explicit mapping, human and JSON rendering, and all three exit-status classes.

Do not restate the shared responsibility boundary or MCP behavior.

- [ ] **Step 3: Verify the CLI contract is complete and isolated**

Run:

```bash
rg -n 'md-linkage check <files\.\.\.>|--root|--mode|--json|`0`|`1`|`2`' specs/md-linkage/interfaces/cli.md
! rg -n "check_specification_links|structuredContent|MCP error|stdio" specs/md-linkage/interfaces/cli.md
git diff --check
```

Expected: the positive search reports the command, every option, and every exit status; the negative search prints nothing; `git diff --check` prints nothing.

- [ ] **Step 4: Commit the CLI contract**

```bash
git add specs/md-linkage/interfaces/cli.md
git commit -m "docs(md-linkage): extract CLI interface contract"
```

### Task 3: Extract the MCP Contract and Retire the Combined Document

**Files:**

- Create: `specs/md-linkage/interfaces/mcp.md`
- Delete: `specs/md-linkage/receptionist.md`
- Verify: `specs/md-linkage/interfaces/spec.md`
- Verify: `specs/md-linkage/interfaces/cli.md`
- Reference: `specs/md-linkage/receptionist.md:95-136,169-175`

**Interfaces:**

- Consumes: The shared `MD Linkage Interface Specification` and its core result/error distinction.
- Produces: The authoritative MCP contract for `md-linkage mcp`; a final specification tree with no combined receptionist contract.

- [ ] **Step 1: Verify the MCP contract is absent and the source still exists**

Run:

```bash
test ! -e specs/md-linkage/interfaces/mcp.md
test -f specs/md-linkage/receptionist.md
```

Expected: both commands succeed. If the target exists or the source is missing, reconcile the current tree with Tasks 1 and 2 before continuing.

- [ ] **Step 2: Create the MCP contract**

Create `specs/md-linkage/interfaces/mcp.md` with this structure:

```markdown
# MD Linkage MCP Interface

## Prerequities

- [MD Linkage Interface Specification](spec.md)

## Startup
## Tool
## Result
## Verification Requirements
```

Move the substance of `receptionist.md:95-136` and `receptionist.md:169-175` into the matching sections without changing these behaviors:

- Startup: `md-linkage mcp` starts an MCP server over stdio; protocol messages use stdout and diagnostics use stderr.
- Tool: the read-only `check_specification_links` tool requires an absolute `root`, one or more concrete non-empty `files`, and optional `LinkCheckMode` defaulting to `LinkCheckMode.Shallow`.
- Validation: reject a relative or empty root, empty file collection, empty file paths, globs, and unsupported modes before invoking the core workflow.
- Result: `structuredContent` contains the complete **Link Check Report** and `content` contains the concise counts summary.
- Errors: findings remain successful results; invalid input or another failure preventing report construction becomes an MCP error.
- Verification: schema constraints, no implicit root, shallow default, delegation mapping, both result representations, and MCP errors.

Do not restate CLI behavior or the shared responsibility boundary.

- [ ] **Step 3: Delete the superseded combined contract**

Delete `specs/md-linkage/receptionist.md`. Before deletion, compare its sections against the three interface files and confirm that every normative rule is present exactly once in its new authoritative location.

- [ ] **Step 4: Verify the final structure and contract separation**

Run:

```bash
test -f specs/md-linkage/interfaces/spec.md
test -f specs/md-linkage/interfaces/cli.md
test -f specs/md-linkage/interfaces/mcp.md
test ! -e specs/md-linkage/receptionist.md
! rg -n "Receptionist|receptionist" specs/md-linkage
! rg -n "md-linkage check|--json|Exit Status" specs/md-linkage/interfaces/spec.md specs/md-linkage/interfaces/mcp.md
! rg -n "check_specification_links|structuredContent|MCP error" specs/md-linkage/interfaces/spec.md specs/md-linkage/interfaces/cli.md
rg -n "check_specification_links|structuredContent|MCP error|md-linkage mcp" specs/md-linkage/interfaces/mcp.md
git diff --check
```

Expected: all three interface documents exist; the combined document does not; negative searches print nothing; the MCP search reports all four contract markers; `git diff --check` prints nothing.

- [ ] **Step 5: Verify changed Markdown dependencies resolve**

Run:

```bash
test -f specs/md-linkage/spec.md
test -f specs/md-linkage/glossary/LinkCheckDelegation.md
test -f specs/md-linkage/glossary/LinkCheckScope.md
test -f specs/md-linkage/glossary/LinkCheckReport.md
test -f specs/md-linkage/use-case/check-specification-documents-for-dead-links.md
test -f specs/md-linkage/interfaces/spec.md
! rg -n "receptionist\.md" specs/md-linkage
```

Expected: every file check succeeds and no Markdown link targets the removed document.

- [ ] **Step 6: Run repository verification**

Run:

```bash
corepack pnpm check
```

Expected: skill checks, builds, and tests all pass.

- [ ] **Step 7: Commit the MCP contract and legacy cleanup**

```bash
git add specs/md-linkage/interfaces/mcp.md specs/md-linkage/receptionist.md
git commit -m "docs(md-linkage): extract MCP interface contract"
```
