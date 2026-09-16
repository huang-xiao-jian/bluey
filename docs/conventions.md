# Capability conventions

## Naming

Use a descriptive lower-case kebab-case directory name, such as `release-notes` or `linear-issues`. Keep the skill front-matter `name` equal to its directory name.

## Skill shape

```text
skills/<name>/
  SKILL.md            Required entry point
  references/         Optional detailed source material
  scripts/            Optional deterministic helpers
  assets/             Optional reusable assets
```

Keep the main instruction file short enough to load quickly. It should explain when to use the skill, the expected inputs and outputs, ordered workflow steps, and validation. Link to supporting material instead of duplicating it.

## MCP server shape

```text
mcps/<name>/
  src/index.ts        stdio server entry point
  test/               Behavioral tests
  package.json        Isolated package metadata and scripts
  tsconfig.json
  README.md           Tools, inputs, permissions, and configuration
```

Favor small tools with clear names. Tool descriptions should state side effects, required permissions, and meaningful constraints. A tool that changes external state must make that action unambiguous in both its name and description.

## Versioning and review

Document breaking MCP tool changes in the server README. Keep any credentials out of the repository. Before sharing or installing a capability, review its instructions and tool surface as carefully as production code.
