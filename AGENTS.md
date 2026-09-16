# Bluey agent guidance

This is a personal capability repository. The primary agent is Codex.

## Scope

- Keep one capability per `skills/<name>` or `mcps/<name>` directory.
- Use lower-case kebab-case names.
- Do not introduce multi-agent personas, delegation logic, or orchestration unless explicitly requested.
- Keep changes to a capability self-contained and document a changed interface in its README.

## Skills

- A skill's entry point is `SKILL.md` with YAML front matter containing `name` and `description`.
- Write actionable instructions, not background essays.
- Place large or optional content in `references/`; place executable helpers in `scripts/`.
- Run `pnpm check:skills` after changing a skill.

## MCP servers

- MCP servers must communicate over stdio unless their package explicitly documents another transport.
- Reserve stdout for protocol messages; use stderr for logs.
- Validate all tool inputs and return concise, useful errors.
- Do not embed secrets, tokens, or machine-specific paths in source.
- Each server owns its package manifest, build, test, and README.

## Verification

- Run the smallest relevant check first, then `pnpm check` for repository-wide changes.
- Do not alter unrelated capabilities or generated files.
