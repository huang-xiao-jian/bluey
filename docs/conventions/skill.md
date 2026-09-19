# Skill convention

## Naming and scope

Use a descriptive lower-case kebab-case directory name, such as
`release-notes` or `linear-issues`. Keep a skill's front-matter `name` equal to
its directory name.

Each skill has one clear responsibility. Keep changes self-contained within the
skill. When a public interface changes, update the skill README with the new
behavior, inputs, outputs, permissions, or configuration.

## Package shape

```text
skills/<name>/
  SKILL.md            Required entry point
  references/         Optional detailed source material
  scripts/            Optional deterministic helpers
  assets/             Optional reusable assets
```

Keep the main instruction file short enough to load quickly. It should explain
when to use the skill, the expected inputs and outputs, ordered workflow steps,
and validation. Link to supporting material instead of duplicating it.

## Review

Before sharing or installing a skill, review its instructions as carefully as
production code.
