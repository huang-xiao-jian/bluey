# Development Guideline

This document defines the repository's workspace tooling, package scripts, and
validation commands.

## Workspace

Bluey is a pnpm workspace orchestrated by Turborepo. Workspace packages belong
in `mcps/*` or `packages/*`. Turbo handles dependency ordering and caches task
outputs.

## Package scripts

Each TypeScript workspace package must expose the applicable scripts below:

- `build`: bundle distributable code with tsdown and write output to `dist/`.
- `test`: run behavioral tests with Vitest.
- `typecheck`: run TypeScript without emitting files.

Do not duplicate build steps inside a package's test script; Turbo runs the
package build before its tests.

## Commands

Run workspace-wide tasks from the repository root:

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm check
```

Use `pnpm --filter <package-name> <script>` to run a package-specific command.
Run `pnpm check` before sharing a change; it validates skills, builds packages,
and runs tests.
